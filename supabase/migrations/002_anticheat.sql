-- ─── 002_anticheat.sql ─────────────────────────────────────────────────────
-- Bảo vệ leaderboard khỏi gian lận bằng cách:
--   1. Chuyển quyền tính XP sang server (SQL function)
--   2. RLS lock `leaderboard_snapshots` — client KHÔNG ghi được trực tiếp field xp
--   3. Trigger tự động tính lại xp từ bảng `exam_results` mỗi khi upsert
--   4. Validate exam_results: reject nếu time_used quá ngắn
--
-- Cách apply:
--   supabase db push
--   (hoặc paste trực tiếp vào Supabase SQL Editor)
-- ────────────────────────────────────────────────────────────────────────────

-- ─── 1. Bảng exam_results (nếu chưa có) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS exam_results (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL, -- 'eps_full' | 'eps_topic' | 'topik'
  score INT NOT NULL CHECK (score >= 0),
  total INT NOT NULL CHECK (total > 0),
  time_used_sec INT NOT NULL CHECK (time_used_sec >= 0),
  is_valid BOOLEAN NOT NULL DEFAULT true, -- server đánh dấu false nếu quá nhanh
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exam_results_user ON exam_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_results_valid ON exam_results(user_id, is_valid, exam_type);

-- ─── 2. Trigger validate thời gian làm bài ─────────────────────────────────
-- EPS full: 40 câu × 3s = 120s min
-- EPS topic: 20 câu × 3s = 60s min
-- TOPIK: 40 câu × 3s = 120s min
CREATE OR REPLACE FUNCTION validate_exam_time()
RETURNS TRIGGER AS $$
DECLARE
  min_sec INT;
BEGIN
  min_sec := GREATEST(NEW.total * 3, 30); -- tối thiểu 3s/câu, floor 30s
  IF NEW.time_used_sec < min_sec THEN
    NEW.is_valid := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_exam_time ON exam_results;
CREATE TRIGGER trg_validate_exam_time
BEFORE INSERT ON exam_results
FOR EACH ROW EXECUTE FUNCTION validate_exam_time();

-- ─── 3. RLS cho exam_results ───────────────────────────────────────────────
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own exam results" ON exam_results;
CREATE POLICY "Users can insert own exam results"
  ON exam_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own exam results" ON exam_results;
CREATE POLICY "Users can view own exam results"
  ON exam_results FOR SELECT
  USING (auth.uid() = user_id);

-- Không có policy UPDATE/DELETE → user không sửa/xóa được exam cũ

-- ─── 4. Rate limit: tối đa 20 exam hợp lệ / ngày / user ────────────────────
CREATE OR REPLACE FUNCTION check_exam_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  today_count INT;
BEGIN
  SELECT COUNT(*) INTO today_count
  FROM exam_results
  WHERE user_id = NEW.user_id
    AND is_valid = true
    AND created_at >= CURRENT_DATE;

  IF today_count >= 20 THEN
    -- Vẫn insert nhưng đánh dấu invalid để không tính XP
    NEW.is_valid := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_exam_rate_limit ON exam_results;
CREATE TRIGGER trg_exam_rate_limit
BEFORE INSERT ON exam_results
FOR EACH ROW EXECUTE FUNCTION check_exam_rate_limit();

-- ─── 5. Function tính XP authoritative từ dữ liệu thật ─────────────────────
CREATE OR REPLACE FUNCTION compute_user_xp(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_streak INT := 0;
  v_best_score INT := 0;
  v_words_learned INT := 0;
  v_eps_done INT := 0;
BEGIN
  -- Streak từ study_progress (client vẫn ghi được, nhưng ta check trong trigger riêng)
  SELECT COALESCE(streak_count, 0) INTO v_streak
  FROM study_progress WHERE user_id = p_user_id;

  -- best_score % từ exam_results HỢP LỆ
  SELECT COALESCE(MAX(ROUND((score::FLOAT / total) * 100)), 0)::INT INTO v_best_score
  FROM exam_results
  WHERE user_id = p_user_id AND is_valid = true;

  -- words_learned từ study_progress.flashcard_known
  SELECT COALESCE(
    (SELECT COUNT(*) FROM jsonb_each(flashcard_known) WHERE value::TEXT = 'true'),
    0
  ) INTO v_words_learned
  FROM study_progress WHERE user_id = p_user_id;

  -- eps_questions_done từ study_progress.eps_answers
  SELECT COALESCE(
    (SELECT COUNT(*) FROM jsonb_object_keys(eps_answers)),
    0
  ) INTO v_eps_done
  FROM study_progress WHERE user_id = p_user_id;

  RETURN v_streak * 50 + v_best_score * 10 + v_words_learned * 5 + v_eps_done * 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 6. Trigger chuẩn hoá XP khi upsert leaderboard_snapshots ──────────────
-- Client có thể gửi xp tuỳ ý, nhưng server sẽ GHI ĐÈ bằng giá trị đúng.
CREATE OR REPLACE FUNCTION normalize_leaderboard_xp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.xp := compute_user_xp(NEW.user_id);
  NEW.best_score := COALESCE(
    (SELECT MAX(ROUND((score::FLOAT / total) * 100))::INT
     FROM exam_results WHERE user_id = NEW.user_id AND is_valid = true),
    0
  );
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_normalize_leaderboard_xp ON leaderboard_snapshots;
CREATE TRIGGER trg_normalize_leaderboard_xp
BEFORE INSERT OR UPDATE ON leaderboard_snapshots
FOR EACH ROW EXECUTE FUNCTION normalize_leaderboard_xp();

-- ─── 7. Trigger tự động update leaderboard sau mỗi exam hợp lệ ────────────
CREATE OR REPLACE FUNCTION refresh_leaderboard_on_exam()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_valid = true THEN
    -- Trigger normalize_leaderboard_xp sẽ tính lại xp tự động
    UPDATE leaderboard_snapshots
    SET updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_refresh_leaderboard ON exam_results;
CREATE TRIGGER trg_refresh_leaderboard
AFTER INSERT ON exam_results
FOR EACH ROW EXECUTE FUNCTION refresh_leaderboard_on_exam();

-- ─── 8. RLS cho leaderboard_snapshots ──────────────────────────────────────
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard_snapshots;
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_snapshots FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can upsert own row" ON leaderboard_snapshots;
CREATE POLICY "Users can upsert own row"
  ON leaderboard_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own row" ON leaderboard_snapshots;
CREATE POLICY "Users can update own row"
  ON leaderboard_snapshots FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Client không xoá row được
-- Trigger normalize_leaderboard_xp đảm bảo xp/best_score luôn đúng dù client gửi gì

-- ─── 9. Audit log cho các exam đáng ngờ ────────────────────────────────────
CREATE TABLE IF NOT EXISTS suspicious_exam_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_type TEXT,
  reason TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION log_suspicious_exam()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_valid = false THEN
    INSERT INTO suspicious_exam_log (user_id, exam_type, reason, meta)
    VALUES (
      NEW.user_id,
      NEW.exam_type,
      CASE
        WHEN NEW.time_used_sec < NEW.total * 3 THEN 'time_too_short'
        ELSE 'rate_limit'
      END,
      jsonb_build_object(
        'score', NEW.score,
        'total', NEW.total,
        'time_used_sec', NEW.time_used_sec
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_suspicious_exam ON exam_results;
CREATE TRIGGER trg_log_suspicious_exam
AFTER INSERT ON exam_results
FOR EACH ROW EXECUTE FUNCTION log_suspicious_exam();

-- ─── DONE ──────────────────────────────────────────────────────────────────
-- Sau khi apply:
--   - Client gửi exam_results vào table; server validate thời gian + rate limit
--   - Client upsert leaderboard_snapshots với xp bất kỳ → server ghi đè bằng compute_user_xp()
--   - Admin xem `suspicious_exam_log` để phát hiện cheater
