-- ─── 004_xp_settings.sql ──────────────────────────────────────────────────
-- Cho phép admin tùy chỉnh trọng số XP + ngưỡng anti-cheat từ UI
-- mà không cần redeploy code.
--
-- APPLY: paste vào Supabase SQL Editor → Run (idempotent)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.xp_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  -- Trọng số công thức XP
  streak_weight INT NOT NULL DEFAULT 30,
  best_score_weight INT NOT NULL DEFAULT 8,
  average_score_weight INT NOT NULL DEFAULT 5,
  correct_answer_weight INT NOT NULL DEFAULT 3,
  flashcard_weight INT NOT NULL DEFAULT 4,
  exam_completed_bonus INT NOT NULL DEFAULT 10,
  -- Cap chống cheat
  flashcard_xp_cap INT NOT NULL DEFAULT 500,
  -- Ngưỡng anti-cheat
  min_sec_per_question INT NOT NULL DEFAULT 3,
  exam_cooldown_sec INT NOT NULL DEFAULT 30,
  max_exams_per_day INT NOT NULL DEFAULT 20,
  -- Audit
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default row nếu chưa có
INSERT INTO public.xp_settings (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

-- ─── RLS: ai cũng đọc được, chỉ admin write ───────────────────────────────
ALTER TABLE public.xp_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read xp settings" ON public.xp_settings;
CREATE POLICY "Anyone can read xp settings"
  ON public.xp_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can update xp settings" ON public.xp_settings;
CREATE POLICY "Only admins can update xp settings"
  ON public.xp_settings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ─── Update compute_user_xp() đọc từ xp_settings ──────────────────────────
CREATE OR REPLACE FUNCTION public.compute_user_xp(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_streak INT := 0;
  v_best_score INT := 0;
  v_avg_score INT := 0;
  v_total_correct INT := 0;
  v_words_mastered INT := 0;
  v_valid_exams INT := 0;
  -- Settings
  s_streak INT := 30;
  s_best INT := 8;
  s_avg INT := 5;
  s_correct INT := 3;
  s_flashcard INT := 4;
  s_exam_bonus INT := 10;
  s_flashcard_cap INT := 500;
BEGIN
  -- Đọc settings (fallback default nếu chưa có row)
  SELECT
    streak_weight, best_score_weight, average_score_weight,
    correct_answer_weight, flashcard_weight, exam_completed_bonus,
    flashcard_xp_cap
  INTO
    s_streak, s_best, s_avg, s_correct, s_flashcard, s_exam_bonus, s_flashcard_cap
  FROM public.xp_settings WHERE id = 'global';

  -- Streak
  SELECT COALESCE(streak_count, 0) INTO v_streak
  FROM public.study_progress WHERE user_id = p_user_id;

  -- Aggregate exam_results hợp lệ
  SELECT
    COALESCE(MAX(ROUND((score::FLOAT / NULLIF(total,0)) * 100))::INT, 0),
    COALESCE(ROUND(AVG((score::FLOAT / NULLIF(total,0)) * 100))::INT, 0),
    COALESCE(SUM(COALESCE(array_length(correct_ids, 1), 0)), 0),
    COUNT(*)
  INTO v_best_score, v_avg_score, v_total_correct, v_valid_exams
  FROM public.exam_results
  WHERE user_id = p_user_id AND is_valid = true AND total > 0;

  -- Words mastered (cap)
  SELECT LEAST(
    COALESCE(
      (SELECT COUNT(*) FROM jsonb_each(flashcard_known) WHERE value = 'true'::jsonb),
      0
    ),
    s_flashcard_cap
  ) INTO v_words_mastered
  FROM public.study_progress WHERE user_id = p_user_id;

  RETURN
    v_streak * s_streak
    + v_best_score * s_best
    + v_avg_score * s_avg
    + v_total_correct * s_correct
    + v_words_mastered * s_flashcard
    + v_valid_exams * s_exam_bonus;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── DONE ─────────────────────────────────────────────────────────────────
-- Test:
--   SELECT * FROM xp_settings;
--   UPDATE xp_settings SET streak_weight = 40 WHERE id = 'global';
--   SELECT compute_user_xp('your-uuid');  -- thấy XP đổi theo
