-- Migration 050: Fix compute_user_xp to include admin-granted XP bonuses
-- Vấn đề: trigger normalize_leaderboard_xp ghi đè XP bằng compute_user_xp()
-- nên XP admin trao bị mất vì công thức không tính admin_xp_grants.
-- Fix: cộng thêm SUM(amount) từ admin_xp_grants vào kết quả formula.

CREATE OR REPLACE FUNCTION public.compute_user_xp(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_streak        INTEGER := 0;
  v_best_score    NUMERIC := 0;
  v_avg_score     NUMERIC := 0;
  v_words_learned INTEGER := 0;
  v_total_correct INTEGER := 0;
  v_valid_exams   INTEGER := 0;
  v_admin_bonus   INTEGER := 0;
  v_xp            INTEGER := 0;
  v_w             RECORD;
BEGIN
  -- Load weights (aliases required for RECORD field access)
  SELECT
    COALESCE(streak_weight, 15)         AS streak_weight,
    COALESCE(best_score_weight, 12)     AS best_score_weight,
    COALESCE(average_score_weight, 8)   AS average_score_weight,
    COALESCE(correct_answer_weight, 3)  AS correct_answer_weight,
    COALESCE(flashcard_weight, 4)       AS flashcard_weight,
    COALESCE(exam_completed_bonus, 15)  AS exam_completed_bonus,
    COALESCE(flashcard_xp_cap, 500)     AS flashcard_xp_cap,
    COALESCE(min_sec_per_question, 8)   AS min_sec_per_question
  INTO v_w
  FROM public.xp_settings WHERE id = 'global'
  LIMIT 1;

  -- Streak
  SELECT COALESCE(streak_count, 0)
  INTO v_streak
  FROM public.user_progress WHERE user_id = p_user_id;

  -- Exam stats (anti-cheat: chỉ tính exam có thời gian hợp lệ)
  SELECT
    COALESCE(MAX(ROUND((score::NUMERIC / NULLIF(total, 0)) * 100)), 0),
    COALESCE(AVG(ROUND((score::NUMERIC / NULLIF(total, 0)) * 100)), 0),
    COALESCE(SUM(
      CASE
        WHEN correct_ids IS NULL THEN 0
        WHEN jsonb_typeof(correct_ids::jsonb) = 'array' THEN jsonb_array_length(correct_ids::jsonb)
        ELSE score
      END
    ), 0),
    COUNT(*)
  INTO v_best_score, v_avg_score, v_total_correct, v_valid_exams
  FROM public.exam_results
  WHERE user_id = p_user_id
    AND time_used >= (v_w.min_sec_per_question * total);

  -- Words learned
  SELECT COALESCE(words_learned, 0)
  INTO v_words_learned
  FROM public.user_progress WHERE user_id = p_user_id;

  -- Admin-granted XP bonuses (từ admin_xp_grants table)
  -- Đây là XP được admin trao thủ công, không tính từ hoạt động học
  SELECT COALESCE(SUM(amount), 0)
  INTO v_admin_bonus
  FROM public.admin_xp_grants
  WHERE user_id = p_user_id;

  -- Tính XP theo công thức + cộng admin bonus
  v_xp :=
    v_streak * v_w.streak_weight
    + v_best_score * v_w.best_score_weight
    + v_avg_score * v_w.average_score_weight
    + v_total_correct * v_w.correct_answer_weight
    + LEAST(v_words_learned, v_w.flashcard_xp_cap) * v_w.flashcard_weight
    + v_valid_exams * v_w.exam_completed_bonus
    + v_admin_bonus;  -- ← XP admin trao không bao giờ bị mất

  RETURN GREATEST(v_xp, 0);
END;
$$;
