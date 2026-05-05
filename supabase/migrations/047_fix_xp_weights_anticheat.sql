-- Migration 047: Fix XP weights, anti-cheat thresholds, and deriveLevel
-- Syncs server-side formula with client-side changes in lib/xp.ts

-- ─── 1. Ensure all columns exist (idempotent) ───────────────────────────────
ALTER TABLE public.xp_settings
  ADD COLUMN IF NOT EXISTS min_sec_per_question INT NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS exam_cooldown_sec    INT NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS max_exams_per_day    INT NOT NULL DEFAULT 20;

-- ─── 2. Update xp_settings with corrected weights ─────────────────────────
-- streak_weight: 30 → 15 (login không nên thắng học thật)
-- best_score_weight: 8 → 12 (thưởng điểm cao hơn)
-- average_score_weight: 5 → 8 (học đều quan trọng)
-- exam_completed_bonus: 10 → 15 (khuyến khích thi nhiều)
-- min_sec_per_question: 3 → 8 (EPS-TOPIK thực tế 84s/câu, min 8s)
UPDATE public.xp_settings SET
  streak_weight         = 15,
  best_score_weight     = 12,
  average_score_weight  = 8,
  exam_completed_bonus  = 15,
  min_sec_per_question  = 8
WHERE id = 'global';

-- ─── 2. Update compute_user_xp SQL function with new weights ──────────────
-- Khớp với DEFAULT_WEIGHTS trong src/lib/xp.ts
CREATE OR REPLACE FUNCTION compute_user_xp(p_user_id UUID)
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
  v_xp            INTEGER := 0;
  v_w             RECORD;
BEGIN
  -- Load weights from xp_settings (fallback to new defaults)
  SELECT
    COALESCE(streak_weight, 15),
    COALESCE(best_score_weight, 12),
    COALESCE(average_score_weight, 8),
    COALESCE(correct_answer_weight, 3),
    COALESCE(flashcard_weight, 4),
    COALESCE(exam_completed_bonus, 15),
    COALESCE(flashcard_xp_cap, 500),
    COALESCE(min_sec_per_question, 8)
  INTO v_w
  FROM xp_settings WHERE id = 'global'
  LIMIT 1;

  -- Streak
  SELECT COALESCE(streak_count, 0)
  INTO v_streak
  FROM user_progress WHERE user_id = p_user_id;

  -- Exam stats (chỉ tính exam hợp lệ: thời gian >= min_sec_per_question * số câu)
  -- correct_ids có thể là JSONB array hoặc TEXT[] — dùng CASE để xử lý cả hai
  SELECT
    COALESCE(MAX(ROUND((score::NUMERIC / NULLIF(total, 0)) * 100)), 0),
    COALESCE(AVG(ROUND((score::NUMERIC / NULLIF(total, 0)) * 100)), 0),
    COALESCE(SUM(
      CASE
        WHEN correct_ids IS NULL THEN 0
        WHEN jsonb_typeof(correct_ids::jsonb) = 'array' THEN jsonb_array_length(correct_ids::jsonb)
        ELSE score  -- fallback: dùng score nếu correct_ids không parse được
      END
    ), 0),
    COUNT(*)
  INTO v_best_score, v_avg_score, v_total_correct, v_valid_exams
  FROM exam_results
  WHERE user_id = p_user_id
    AND time_used >= (v_w.min_sec_per_question * total);  -- anti-cheat

  -- Words learned (flashcards mastered)
  SELECT COALESCE(words_learned, 0)
  INTO v_words_learned
  FROM user_progress WHERE user_id = p_user_id;

  -- Compute XP (same formula as client lib/xp.ts computeXP)
  v_xp :=
    v_streak * v_w.streak_weight
    + v_best_score * v_w.best_score_weight
    + v_avg_score * v_w.average_score_weight
    + v_total_correct * v_w.correct_answer_weight
    + LEAST(v_words_learned, v_w.flashcard_xp_cap) * v_w.flashcard_weight
    + v_valid_exams * v_w.exam_completed_bonus;

  RETURN GREATEST(v_xp, 0);
END;
$$;

-- ─── 3. Update derive_level function with correct EPS-TOPIK thresholds ────
-- EPS-TOPIK thực tế: đậu ~40% (80/200 điểm). KHÔNG dùng "TOPIK I/II".
CREATE OR REPLACE FUNCTION derive_level(best_score_pct NUMERIC)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF best_score_pct >= 90 THEN RETURN 'Xuất sắc';   -- 90-100%
  ELSIF best_score_pct >= 75 THEN RETURN 'Giỏi';    -- 75-89%
  ELSIF best_score_pct >= 55 THEN RETURN 'Khá';     -- 55-74%
  ELSIF best_score_pct >= 40 THEN RETURN 'Trung bình'; -- 40-54% (ngưỡng đậu EPS)
  ELSE RETURN 'Cơ bản';                               -- <40%
  END IF;
END;
$$;

-- ─── 4. Re-compute XP for all users with new weights ─────────────────────
-- Chạy trong transaction để an toàn
DO $$
DECLARE
  v_user RECORD;
  v_new_xp INTEGER;
BEGIN
  FOR v_user IN SELECT DISTINCT user_id FROM user_progress LOOP
    v_new_xp := compute_user_xp(v_user.user_id);
    -- XP never decreases: only update if new value is higher
    UPDATE user_progress
    SET
      xp = GREATEST(xp, v_new_xp),
      level = derive_level(best_score),
      updated_at = NOW()
    WHERE user_id = v_user.user_id
      AND GREATEST(xp, v_new_xp) != xp;  -- only touch rows that change
  END LOOP;
END;
$$;

-- ─── 5. Refresh leaderboard cache ────────────────────────────────────────
-- Đảm bảo bảng xếp hạng hiển thị XP mới
REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard
WITH DATA;
