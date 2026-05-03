-- ─── 030_community_xp.sql ─────────────────────────────────────────────────────
-- Thêm XP cho hoạt động cộng đồng (đăng bài, comment, like, rating)
-- Giải quyết vấn đề cập nhật XP chậm cho community activities
--
-- APPLY: paste vào Supabase SQL Editor → Run (idempotent)
-- ────────────────────────────────────────────────────────────────────────────

-- ─── 0. Đảm bảo xp_settings tồn tại và có đầy đủ columns cũ ────────────────────
CREATE TABLE IF NOT EXISTS public.xp_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.xp_settings (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  -- Legacy columns (từ migration 004)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'xp_settings' AND column_name = 'streak_weight') THEN
    ALTER TABLE public.xp_settings ADD COLUMN streak_weight INT NOT NULL DEFAULT 30;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'xp_settings' AND column_name = 'best_score_weight') THEN
    ALTER TABLE public.xp_settings ADD COLUMN best_score_weight INT NOT NULL DEFAULT 8;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'xp_settings' AND column_name = 'average_score_weight') THEN
    ALTER TABLE public.xp_settings ADD COLUMN average_score_weight INT NOT NULL DEFAULT 5;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'xp_settings' AND column_name = 'correct_answer_weight') THEN
    ALTER TABLE public.xp_settings ADD COLUMN correct_answer_weight INT NOT NULL DEFAULT 3;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'xp_settings' AND column_name = 'flashcard_weight') THEN
    ALTER TABLE public.xp_settings ADD COLUMN flashcard_weight INT NOT NULL DEFAULT 4;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'xp_settings' AND column_name = 'exam_completed_bonus') THEN
    ALTER TABLE public.xp_settings ADD COLUMN exam_completed_bonus INT NOT NULL DEFAULT 10;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'xp_settings' AND column_name = 'flashcard_xp_cap') THEN
    ALTER TABLE public.xp_settings ADD COLUMN flashcard_xp_cap INT NOT NULL DEFAULT 500;
  END IF;
END $$;

-- ─── 1. Thêm XP weights cho community vào xp_settings ───────────────────────────
DO $$
BEGIN
  -- Kiểm tra xem các column đã tồn tại chưa
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'xp_settings' AND column_name = 'post_weight'
  ) THEN
    ALTER TABLE public.xp_settings ADD COLUMN post_weight INT NOT NULL DEFAULT 50;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'xp_settings' AND column_name = 'comment_weight'
  ) THEN
    ALTER TABLE public.xp_settings ADD COLUMN comment_weight INT NOT NULL DEFAULT 20;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'xp_settings' AND column_name = 'like_received_weight'
  ) THEN
    ALTER TABLE public.xp_settings ADD COLUMN like_received_weight INT NOT NULL DEFAULT 5;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'xp_settings' AND column_name = 'rating_given_weight'
  ) THEN
    ALTER TABLE public.xp_settings ADD COLUMN rating_given_weight INT NOT NULL DEFAULT 10;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'xp_settings' AND column_name = 'daily_post_cap'
  ) THEN
    ALTER TABLE public.xp_settings ADD COLUMN daily_post_cap INT NOT NULL DEFAULT 5;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'xp_settings' AND column_name = 'daily_comment_cap'
  ) THEN
    ALTER TABLE public.xp_settings ADD COLUMN daily_comment_cap INT NOT NULL DEFAULT 20;
  END IF;
END $$;

-- ─── 2. Cập nhật compute_user_xp để tính cả community XP ─────────────────────
CREATE OR REPLACE FUNCTION public.compute_user_xp(p_user_id UUID)
RETURNS INT AS $$
DECLARE
  v_streak INT := 0;
  v_best_score INT := 0;
  v_avg_score INT := 0;
  v_total_correct INT := 0;
  v_words_mastered INT := 0;
  v_valid_exams INT := 0;
  -- Community XP
  v_posts_count INT := 0;
  v_comments_count INT := 0;
  v_likes_received INT := 0;
  v_ratings_given INT := 0;
  -- Settings
  s_streak INT := 30;
  s_best INT := 8;
  s_avg INT := 5;
  s_correct INT := 3;
  s_flashcard INT := 4;
  s_exam_bonus INT := 10;
  s_flashcard_cap INT := 500;
  s_post INT := 50;
  s_comment INT := 20;
  s_like_received INT := 5;
  s_rating_given INT := 10;
  s_post_cap INT := 5;
  s_comment_cap INT := 20;
BEGIN
  -- Đọc settings (fallback default nếu chưa có row)
  SELECT
    streak_weight, best_score_weight, average_score_weight,
    correct_answer_weight, flashcard_weight, exam_completed_bonus,
    flashcard_xp_cap,
    COALESCE(post_weight, 50),
    COALESCE(comment_weight, 20),
    COALESCE(like_received_weight, 5),
    COALESCE(rating_given_weight, 10),
    COALESCE(daily_post_cap, 5),
    COALESCE(daily_comment_cap, 20)
  INTO
    s_streak, s_best, s_avg, s_correct, s_flashcard, s_exam_bonus, s_flashcard_cap,
    s_post, s_comment, s_like_received, s_rating_given, s_post_cap, s_comment_cap
  FROM public.xp_settings WHERE id = 'global';

  -- Streak
  SELECT COALESCE(streak_count, 0) INTO v_streak
  FROM public.user_progress WHERE user_id = p_user_id;

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
  FROM public.user_progress WHERE user_id = p_user_id;

  -- Community XP - Posts (approved, cap daily)
  SELECT COALESCE(COUNT(*), 0) INTO v_posts_count
  FROM public.community_posts
  WHERE user_id = p_user_id
    AND status = 'approved'
    AND created_at >= CURRENT_DATE
  LIMIT s_post_cap;

  -- Community XP - Comments (approved, cap daily)
  SELECT COALESCE(COUNT(*), 0) INTO v_comments_count
  FROM public.community_comments
  WHERE user_id = p_user_id
    AND status = 'approved'
    AND created_at >= CURRENT_DATE
  LIMIT s_comment_cap;

  -- Community XP - Likes received (total, no cap)
  SELECT COALESCE(SUM(likes), 0) INTO v_likes_received
  FROM public.community_posts
  WHERE user_id = p_user_id AND status = 'approved';

  -- Community XP - Ratings given (approved, no cap)
  SELECT COALESCE(COUNT(*), 0) INTO v_ratings_given
  FROM public.community_ratings
  WHERE user_id = p_user_id AND status = 'approved';

  RETURN
    v_streak * s_streak
    + v_best_score * s_best
    + v_avg_score * s_avg
    + v_total_correct * s_correct
    + v_words_mastered * s_flashcard
    + v_valid_exams * s_exam_bonus
    + v_posts_count * s_post
    + v_comments_count * s_comment
    + v_likes_received * s_like_received
    + v_ratings_given * s_rating_given;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 3. Trigger để cập nhật XP ngay khi có hoạt động community ────────────────
CREATE OR REPLACE FUNCTION public.update_user_xp_on_community_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Cập nhật XP trong user_progress
  UPDATE public.user_progress
  SET xp = public.compute_user_xp(NEW.user_id),
      updated_at = NOW()
  WHERE user_id = NEW.user_id;

  -- Cập nhật leaderboard
  INSERT INTO public.leaderboard (user_id, xp, updated_at)
  VALUES (NEW.user_id, public.compute_user_xp(NEW.user_id), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    xp = EXCLUDED.xp,
    updated_at = EXCLUDED.updated_at;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger cho community_posts (INSERT/UPDATE khi status thay đổi)
DROP TRIGGER IF EXISTS trg_xp_community_posts ON public.community_posts;
CREATE TRIGGER trg_xp_community_posts
  AFTER INSERT OR UPDATE OF status ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_user_xp_on_community_activity();

-- Trigger cho community_comments (INSERT/UPDATE khi status thay đổi)
DROP TRIGGER IF EXISTS trg_xp_community_comments ON public.community_comments;
CREATE TRIGGER trg_xp_community_comments
  AFTER INSERT OR UPDATE OF status ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_user_xp_on_community_activity();

-- Trigger cho community_likes (INSERT/DELETE - cập nhật XP cho người nhận like)
DROP TRIGGER IF EXISTS trg_xp_community_likes ON public.community_likes;
CREATE TRIGGER trg_xp_community_likes
  AFTER INSERT OR DELETE ON public.community_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_user_xp_on_community_activity();

-- Trigger cho community_ratings (INSERT/UPDATE khi status thay đổi)
DROP TRIGGER IF EXISTS trg_xp_community_ratings ON public.community_ratings;
CREATE TRIGGER trg_xp_community_ratings
  AFTER INSERT OR UPDATE OF status ON public.community_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_user_xp_on_community_activity();

-- ─── 4. Recalculate XP + stats cho tất cả users (run once) ───────────────────
-- Chạy thủ công nếu cần: SELECT public.recalculate_all_xp();
CREATE OR REPLACE FUNCTION public.recalculate_all_xp()
RETURNS VOID AS $$
DECLARE
  r RECORD;
  v_best_score INT;
  v_words_learned INT;
  v_streak INT;
  v_xp INT;
BEGIN
  FOR r IN SELECT DISTINCT up.user_id FROM public.user_progress up LOOP
    -- Best score
    SELECT COALESCE(MAX(ROUND((score::FLOAT / NULLIF(total,0)) * 100))::INT, 0)
    INTO v_best_score
    FROM public.exam_results
    WHERE user_id = r.user_id AND is_valid = true AND total > 0;

    -- Words learned từ flashcard_known
    SELECT COALESCE(
      (SELECT COUNT(*) FROM jsonb_each(flashcard_known) WHERE value = 'true'::jsonb),
      0
    )
    INTO v_words_learned
    FROM public.user_progress WHERE user_id = r.user_id;

    -- Streak
    SELECT COALESCE(streak_count, 0) INTO v_streak
    FROM public.user_progress WHERE user_id = r.user_id;

    -- Compute XP
    v_xp := public.compute_user_xp(r.user_id);

    -- Update user_progress
    UPDATE public.user_progress
    SET xp = v_xp,
        best_score = v_best_score,
        words_learned = v_words_learned,
        updated_at = NOW()
    WHERE user_id = r.user_id;

    -- Sync leaderboard
    INSERT INTO public.leaderboard (user_id, xp, streak, best_score, words_learned, level, updated_at)
    VALUES (
      r.user_id,
      v_xp,
      v_streak,
      v_best_score,
      v_words_learned,
      CASE
        WHEN v_best_score >= 80 THEN 'TOPIK II'
        WHEN v_best_score >= 60 THEN 'TOPIK I'
        ELSE 'Cơ bản'
      END,
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      xp = EXCLUDED.xp,
      streak = EXCLUDED.streak,
      best_score = EXCLUDED.best_score,
      words_learned = EXCLUDED.words_learned,
      level = EXCLUDED.level,
      updated_at = EXCLUDED.updated_at;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 6. Đảm bảo user_progress có columns best_score & words_learned ──────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'best_score') THEN
    ALTER TABLE public.user_progress ADD COLUMN best_score INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'words_learned') THEN
    ALTER TABLE public.user_progress ADD COLUMN words_learned INT DEFAULT 0;
  END IF;
END $$;

-- ─── 7. Trigger auto-sync best_score khi có exam mới ─────────────────────────
CREATE OR REPLACE FUNCTION public.sync_best_score_on_exam()
RETURNS TRIGGER AS $$
DECLARE
  v_best INT;
  v_xp INT;
BEGIN
  IF NEW.is_valid = true AND NEW.total > 0 THEN
    SELECT COALESCE(MAX(ROUND((score::FLOAT / NULLIF(total,0)) * 100))::INT, 0)
    INTO v_best
    FROM public.exam_results
    WHERE user_id = NEW.user_id AND is_valid = true AND total > 0;

    v_xp := public.compute_user_xp(NEW.user_id);

    UPDATE public.user_progress
    SET best_score = v_best,
        xp = v_xp,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    INSERT INTO public.leaderboard (user_id, xp, best_score, level, updated_at)
    VALUES (
      NEW.user_id, v_xp, v_best,
      CASE WHEN v_best >= 80 THEN 'TOPIK II' WHEN v_best >= 60 THEN 'TOPIK I' ELSE 'Cơ bản' END,
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      xp = EXCLUDED.xp,
      best_score = EXCLUDED.best_score,
      level = EXCLUDED.level,
      updated_at = EXCLUDED.updated_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_best_score ON public.exam_results;
CREATE TRIGGER trg_sync_best_score
  AFTER INSERT OR UPDATE ON public.exam_results
  FOR EACH ROW EXECUTE FUNCTION public.sync_best_score_on_exam();

-- ─── 5. Lệnh recalculate trực tiếp (không cần function) ───────────────────────
-- Chạy lệnh này trong SQL Editor để cập nhật XP cho tất cả users
-- (dùng nếu function không hoạt động)
-- UPDATE public.user_progress up
-- SET xp = (
--   -- Streak
--   (SELECT COALESCE(streak_count, 0) FROM public.user_progress WHERE user_id = up.user_id) * 30
--   -- Best Score
--   + (SELECT COALESCE(MAX(ROUND((score::FLOAT / NULLIF(total,0)) * 100))::INT, 0)
--      FROM public.exam_results WHERE user_id = up.user_id AND is_valid = true AND total > 0) * 8
--   -- Average Score
--   + (SELECT COALESCE(ROUND(AVG((score::FLOAT / NULLIF(total,0)) * 100))::INT, 0)
--      FROM public.exam_results WHERE user_id = up.user_id AND is_valid = true AND total > 0) * 5
--   -- Total Correct (JSONB array)
--   + (SELECT COALESCE(SUM(jsonb_array_length(correct_ids)), 0)
--      FROM public.exam_results WHERE user_id = up.user_id AND is_valid = true AND total > 0) * 3
--   -- Words Mastered (cap 500)
--   + LEAST(
--       COALESCE((SELECT COUNT(*) FROM jsonb_each(flashcard_known) WHERE value = 'true'::jsonb), 0),
--       500
--     ) * 4
--   -- Valid Exams
--   + (SELECT COUNT(*) FROM public.exam_results WHERE user_id = up.user_id AND is_valid = true AND total > 0) * 10
--   -- Community Posts (approved, cap 5/day)
--   + (SELECT COALESCE(COUNT(*), 0) FROM public.community_posts
--      WHERE user_id = up.user_id AND status = 'approved' AND created_at >= CURRENT_DATE LIMIT 5) * 50
--   -- Community Comments (approved, cap 20/day)
--   + (SELECT COALESCE(COUNT(*), 0) FROM public.community_comments
--      WHERE user_id = up.user_id AND status = 'approved' AND created_at >= CURRENT_DATE LIMIT 20) * 20
--   -- Likes Received (total)
--   + (SELECT COALESCE(SUM(likes), 0) FROM public.community_posts
--      WHERE user_id = up.user_id AND status = 'approved') * 5
--   -- Ratings Given (approved)
--   + (SELECT COALESCE(COUNT(*), 0) FROM public.community_ratings
--      WHERE user_id = up.user_id AND status = 'approved') * 10
-- ),
-- updated_at = NOW();

-- ─── DONE ─────────────────────────────────────────────────────────────────
-- Test:
--   SELECT compute_user_xp('your-uuid');
--   SELECT public.recalculate_all_xp();
