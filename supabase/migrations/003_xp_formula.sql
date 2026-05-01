-- ─── 003_xp_formula.sql ────────────────────────────────────────────────────
-- Cập nhật công thức tính XP theo đề xuất:
--   - Trọng số streak giảm 50→30 (vẫn quan trọng nhưng không quá lớn)
--   - Thưởng cả averageScore (khuyến khích học đều, không chỉ 1 lần lucky)
--   - Đếm câu ĐÚNG thay vì câu đã làm (chống spam click)
--   - Bonus cho mỗi exam hợp lệ
--   - Cap flashcard để chống cheat localStorage
--
-- Công thức mới:
--   XP = streak × 30
--      + bestScore × 8
--      + averageScore × 5
--      + totalCorrectAnswers × 3      (chỉ từ exam HỢP LỆ)
--      + min(flashcardMastered, 500) × 4   (cap chống cheat)
--      + validExamsCount × 10
--
-- APPLY: paste vào Supabase SQL Editor → Run (idempotent)
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.compute_user_xp(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_streak INT := 0;
  v_best_score INT := 0;
  v_avg_score INT := 0;
  v_total_correct INT := 0;
  v_words_mastered INT := 0;
  v_valid_exams INT := 0;
BEGIN
  -- Streak từ study_progress
  SELECT COALESCE(streak_count, 0) INTO v_streak
  FROM public.study_progress WHERE user_id = p_user_id;

  -- Aggregate từ exam_results HỢP LỆ
  SELECT
    COALESCE(MAX(ROUND((score::FLOAT / NULLIF(total,0)) * 100))::INT, 0),
    COALESCE(ROUND(AVG((score::FLOAT / NULLIF(total,0)) * 100))::INT, 0),
    COALESCE(SUM(COALESCE(array_length(correct_ids, 1), 0)), 0),
    COUNT(*)
  INTO v_best_score, v_avg_score, v_total_correct, v_valid_exams
  FROM public.exam_results
  WHERE user_id = p_user_id AND is_valid = true AND total > 0;

  -- Words mastered từ flashcard_known JSONB (cap 500 chống cheat)
  SELECT LEAST(
    COALESCE(
      (SELECT COUNT(*) FROM jsonb_each(flashcard_known) WHERE value = 'true'::jsonb),
      0
    ),
    500
  ) INTO v_words_mastered
  FROM public.study_progress WHERE user_id = p_user_id;

  RETURN
    v_streak * 30
    + v_best_score * 8
    + v_avg_score * 5
    + v_total_correct * 3
    + v_words_mastered * 4
    + v_valid_exams * 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger normalize_leaderboard_xp đã trỏ vào compute_user_xp() → tự động dùng công thức mới.
-- Không cần thay đổi gì khác.

-- ─── Bonus: chống cheat flashcard (≤ 100 từ mới / ngày) ──────────────────
-- Track snapshot flashcard_known size mỗi ngày để detect cheat
CREATE TABLE IF NOT EXISTS public.flashcard_daily_snapshot (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  known_count INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_flashcard_snapshot_user
  ON public.flashcard_daily_snapshot(user_id, snapshot_date DESC);

-- Function ghi snapshot mỗi khi study_progress.flashcard_known thay đổi
CREATE OR REPLACE FUNCTION public.snapshot_flashcard_count()
RETURNS TRIGGER AS $$
DECLARE
  v_count INT;
BEGIN
  IF NEW.flashcard_known IS DISTINCT FROM OLD.flashcard_known THEN
    v_count := COALESCE(
      (SELECT COUNT(*) FROM jsonb_each(NEW.flashcard_known) WHERE value = 'true'::jsonb),
      0
    );
    INSERT INTO public.flashcard_daily_snapshot (user_id, snapshot_date, known_count)
    VALUES (NEW.user_id, CURRENT_DATE, v_count)
    ON CONFLICT (user_id, snapshot_date) DO UPDATE
      SET known_count = GREATEST(public.flashcard_daily_snapshot.known_count, EXCLUDED.known_count);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_snapshot_flashcard ON public.study_progress;
CREATE TRIGGER trg_snapshot_flashcard
AFTER UPDATE ON public.study_progress
FOR EACH ROW EXECUTE FUNCTION public.snapshot_flashcard_count();

-- ─── DONE ─────────────────────────────────────────────────────────────────
-- Test:
--   SELECT compute_user_xp('your-uuid');  -- xem XP tính theo công thức mới
--   SELECT * FROM flashcard_daily_snapshot WHERE user_id = 'your-uuid' ORDER BY snapshot_date DESC;
