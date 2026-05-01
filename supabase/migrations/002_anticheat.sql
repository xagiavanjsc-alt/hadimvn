-- ─── 002_anticheat.sql ─────────────────────────────────────────────────────
-- ANTI-CHEAT cho leaderboard. Idempotent — chạy lại nhiều lần OK.
--
-- Schema THỰC TẾ (theo schema.sql):
--   - public.exam_results: id UUID, user_id, exam_type, score, total,
--     time_used (NOT time_used_sec), correct_ids UUID[], taken_at (NOT created_at)
--   - public.leaderboard: id UUID, user_id, display_name, avatar_url, xp,
--     streak, best_score, words_learned, level, updated_at
--   - public.study_progress: streak_count, eps_answers JSONB, flashcard_known JSONB
--
-- Migration này:
--   1. ADD column is_valid vào exam_results (đánh dấu exam hợp lệ/gian lận)
--   2. Trigger validate thời gian + rate limit khi insert exam
--   3. Function compute_user_xp() — server tính XP từ data thật
--   4. Trigger trên leaderboard ghi đè xp client gửi
--   5. RLS lock leaderboard write
--   6. Bảng suspicious_exam_log + audit
--
-- APPLY: paste vào Supabase SQL Editor → Run
-- ────────────────────────────────────────────────────────────────────────────

-- ─── 1. Add is_valid column nếu chưa có ────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exam_results' AND column_name = 'is_valid'
  ) THEN
    ALTER TABLE public.exam_results ADD COLUMN is_valid BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;

-- Index hỗ trợ query exam hợp lệ theo user + exam_type
CREATE INDEX IF NOT EXISTS idx_exam_results_valid
  ON public.exam_results(user_id, is_valid, exam_type);

-- ─── 2. Trigger validate thời gian làm bài ─────────────────────────────────
-- Nếu time_used < total * 3 (giây/câu) → đánh dấu invalid (không tính XP)
CREATE OR REPLACE FUNCTION public.validate_exam_time()
RETURNS TRIGGER AS $$
DECLARE
  min_sec INT;
BEGIN
  -- floor 30s, hoặc 3s/câu (lấy max)
  min_sec := GREATEST(NEW.total * 3, 30);
  IF COALESCE(NEW.time_used, 0) < min_sec THEN
    NEW.is_valid := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_exam_time ON public.exam_results;
CREATE TRIGGER trg_validate_exam_time
BEFORE INSERT ON public.exam_results
FOR EACH ROW EXECUTE FUNCTION public.validate_exam_time();

-- ─── 3. Rate limit: max 20 exam HỢP LỆ / ngày / user ──────────────────────
CREATE OR REPLACE FUNCTION public.check_exam_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  today_count INT;
BEGIN
  SELECT COUNT(*) INTO today_count
  FROM public.exam_results
  WHERE user_id = NEW.user_id
    AND is_valid = true
    AND taken_at >= CURRENT_DATE;

  IF today_count >= 20 THEN
    NEW.is_valid := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_exam_rate_limit ON public.exam_results;
CREATE TRIGGER trg_exam_rate_limit
BEFORE INSERT ON public.exam_results
FOR EACH ROW EXECUTE FUNCTION public.check_exam_rate_limit();

-- ─── 4. Function tính XP authoritative từ data thật ────────────────────────
CREATE OR REPLACE FUNCTION public.compute_user_xp(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_streak INT := 0;
  v_best_score INT := 0;
  v_words_learned INT := 0;
  v_eps_done INT := 0;
BEGIN
  SELECT COALESCE(streak_count, 0) INTO v_streak
  FROM public.study_progress WHERE user_id = p_user_id;

  -- best_score % chỉ tính từ exam HỢP LỆ
  SELECT COALESCE(MAX(ROUND((score::FLOAT / NULLIF(total,0)) * 100)), 0)::INT
  INTO v_best_score
  FROM public.exam_results
  WHERE user_id = p_user_id AND is_valid = true AND total > 0;

  -- Đếm key trong flashcard_known JSONB có value = true
  SELECT COALESCE(
    (SELECT COUNT(*) FROM jsonb_each(flashcard_known) WHERE value = 'true'::jsonb),
    0
  ) INTO v_words_learned
  FROM public.study_progress WHERE user_id = p_user_id;

  -- Đếm số câu EPS đã trả lời
  SELECT COALESCE(
    (SELECT COUNT(*) FROM jsonb_object_keys(eps_answers)),
    0
  ) INTO v_eps_done
  FROM public.study_progress WHERE user_id = p_user_id;

  RETURN v_streak * 50 + v_best_score * 10 + v_words_learned * 5 + v_eps_done * 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 5. Trigger ghi đè xp/best_score trên leaderboard ──────────────────────
-- Client gửi xp tuỳ ý → server LUÔN tính lại từ data thật → không cheat được
CREATE OR REPLACE FUNCTION public.normalize_leaderboard_xp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.xp := public.compute_user_xp(NEW.user_id);
  NEW.best_score := COALESCE(
    (SELECT MAX(ROUND((score::FLOAT / NULLIF(total,0)) * 100))::INT
     FROM public.exam_results
     WHERE user_id = NEW.user_id AND is_valid = true AND total > 0),
    0
  );
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_normalize_leaderboard_xp ON public.leaderboard;
CREATE TRIGGER trg_normalize_leaderboard_xp
BEFORE INSERT OR UPDATE ON public.leaderboard
FOR EACH ROW EXECUTE FUNCTION public.normalize_leaderboard_xp();

-- ─── 6. Trigger refresh leaderboard khi có exam hợp lệ mới ─────────────────
CREATE OR REPLACE FUNCTION public.refresh_leaderboard_on_exam()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_valid = true THEN
    -- Update bất kỳ field nào → trigger normalize_leaderboard_xp tính lại xp
    UPDATE public.leaderboard
    SET updated_at = now()
    WHERE user_id = NEW.user_id;

    -- Nếu user chưa có row trong leaderboard, tạo mới
    INSERT INTO public.leaderboard (user_id, display_name)
    SELECT NEW.user_id, COALESCE(p.display_name, 'Học viên')
    FROM public.user_profiles p WHERE p.id = NEW.user_id
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_refresh_leaderboard ON public.exam_results;
CREATE TRIGGER trg_refresh_leaderboard
AFTER INSERT ON public.exam_results
FOR EACH ROW EXECUTE FUNCTION public.refresh_leaderboard_on_exam();

-- ─── 7. Audit log cho exam đáng ngờ ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.suspicious_exam_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_type TEXT,
  reason TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suspicious_exam_user ON public.suspicious_exam_log(user_id, created_at DESC);

ALTER TABLE public.suspicious_exam_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view suspicious log" ON public.suspicious_exam_log;
CREATE POLICY "Admins can view suspicious log"
  ON public.suspicious_exam_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE OR REPLACE FUNCTION public.log_suspicious_exam()
RETURNS TRIGGER AS $$
DECLARE
  v_reason TEXT;
  v_today_count INT;
BEGIN
  IF NEW.is_valid = false THEN
    SELECT COUNT(*) INTO v_today_count
    FROM public.exam_results
    WHERE user_id = NEW.user_id AND is_valid = true AND taken_at >= CURRENT_DATE;

    v_reason := CASE
      WHEN COALESCE(NEW.time_used, 0) < NEW.total * 3 THEN 'time_too_short'
      WHEN v_today_count >= 20 THEN 'rate_limit_exceeded'
      ELSE 'unknown'
    END;

    INSERT INTO public.suspicious_exam_log (user_id, exam_type, reason, meta)
    VALUES (
      NEW.user_id, NEW.exam_type, v_reason,
      jsonb_build_object(
        'score', NEW.score,
        'total', NEW.total,
        'time_used', NEW.time_used,
        'taken_at', NEW.taken_at
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_log_suspicious_exam ON public.exam_results;
CREATE TRIGGER trg_log_suspicious_exam
AFTER INSERT ON public.exam_results
FOR EACH ROW EXECUTE FUNCTION public.log_suspicious_exam();

-- ─── 8. Tighten RLS trên leaderboard ──────────────────────────────────────
-- (đã có policy "Users can update own leaderboard entry FOR ALL" trong schema.sql)
-- Trigger normalize_leaderboard_xp đảm bảo dù user gửi xp gì cũng bị ghi đè.
-- Không cần thay đổi RLS.

-- ─── DONE ──────────────────────────────────────────────────────────────────
-- Test sau khi apply:
--   1. Insert fake exam_results với time_used = 1 → check is_valid = false
--   2. Upsert leaderboard với xp = 999999 → query lại → xp = giá trị server tính
--   3. Query suspicious_exam_log với admin account
