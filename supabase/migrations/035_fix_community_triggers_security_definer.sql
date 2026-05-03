-- ─── 035: Fix RLS violations khi admin delete/update post của user khác ────────
-- Các trigger functions thao tác bảng leaderboard/user_progress của user khác,
-- nhưng không có SECURITY DEFINER → bị RLS chặn khi admin xoá bài của user khác.
-- Fix: bọc SECURITY DEFINER + set search_path.

-- 1. Trigger community activity → update XP + leaderboard
CREATE OR REPLACE FUNCTION public.update_user_xp_on_community_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
  v_xp INT;
  v_name TEXT;
  v_avatar TEXT;
BEGIN
  v_uid := COALESCE(NEW.user_id, OLD.user_id);
  IF v_uid IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  v_xp := public.compute_user_xp(v_uid);

  UPDATE public.user_progress
  SET xp = v_xp, updated_at = NOW()
  WHERE user_id = v_uid;

  SELECT COALESCE(display_name, 'Học viên'), avatar_url
  INTO v_name, v_avatar
  FROM public.user_profiles WHERE id = v_uid;

  INSERT INTO public.leaderboard (user_id, display_name, avatar_url, xp, updated_at)
  VALUES (v_uid, COALESCE(v_name, 'Học viên'), v_avatar, v_xp, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    xp = EXCLUDED.xp,
    updated_at = EXCLUDED.updated_at;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2. Sync leaderboard từ user_progress
CREATE OR REPLACE FUNCTION public.sync_leaderboard_from_user_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_display_name TEXT;
    v_avatar_url TEXT;
    v_is_vip BOOLEAN;
    v_vip_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT display_name, avatar_url, is_vip, vip_expires_at
    INTO v_display_name, v_avatar_url, v_is_vip, v_vip_expires_at
    FROM public.user_profiles
    WHERE id = NEW.user_id;

    INSERT INTO public.leaderboard (user_id, display_name, avatar_url, xp, streak, best_score, words_learned, level, is_vip, vip_expires_at, updated_at)
    VALUES (
        NEW.user_id,
        COALESCE(v_display_name, 'Học viên'),
        v_avatar_url,
        NEW.xp,
        NEW.streak_count,
        NEW.best_score,
        NEW.words_learned,
        NEW.level,
        COALESCE(v_is_vip, FALSE),
        v_vip_expires_at,
        NEW.updated_at
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        display_name = COALESCE(v_display_name, public.leaderboard.display_name),
        avatar_url = v_avatar_url,
        xp = NEW.xp,
        streak = NEW.streak_count,
        best_score = NEW.best_score,
        words_learned = NEW.words_learned,
        level = NEW.level,
        is_vip = COALESCE(v_is_vip, FALSE),
        vip_expires_at = v_vip_expires_at,
        updated_at = NEW.updated_at;
    RETURN NEW;
END;
$$;

-- 3. Sync leaderboard từ user_profiles
CREATE OR REPLACE FUNCTION public.sync_leaderboard_from_user_profiles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.leaderboard
    SET
        display_name = NEW.display_name,
        avatar_url = NEW.avatar_url,
        is_vip = COALESCE(NEW.is_vip, FALSE),
        vip_expires_at = NEW.vip_expires_at,
        updated_at = NOW()
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$;

-- 4. Sync best score khi có exam mới
CREATE OR REPLACE FUNCTION public.sync_best_score_on_exam()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_best INT;
  v_xp INT;
  v_name TEXT;
  v_avatar TEXT;
BEGIN
  IF NEW.is_valid = true AND NEW.total > 0 THEN
    SELECT COALESCE(MAX(ROUND((score::FLOAT / NULLIF(total,0)) * 100))::INT, 0)
    INTO v_best
    FROM public.exam_results
    WHERE user_id = NEW.user_id AND is_valid = true AND total > 0;

    v_xp := public.compute_user_xp(NEW.user_id);

    SELECT COALESCE(display_name, 'Học viên'), avatar_url
    INTO v_name, v_avatar
    FROM public.user_profiles WHERE id = NEW.user_id;

    UPDATE public.user_progress
    SET best_score = v_best,
        xp = v_xp,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    INSERT INTO public.leaderboard (user_id, display_name, avatar_url, xp, best_score, level, updated_at)
    VALUES (
      NEW.user_id, COALESCE(v_name, 'Học viên'), v_avatar, v_xp, v_best,
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
$$;

-- 5. Update post likes count (để admin xoá post có like/comment vẫn ok)
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET likes = likes + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. Admin có thể xoá community_posts của user khác
DROP POLICY IF EXISTS "Admin can delete any post" ON public.community_posts;
CREATE POLICY "Admin can delete any post" ON public.community_posts FOR DELETE
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- 7. Admin có thể xoá community_comments của user khác
DROP POLICY IF EXISTS "Admin can delete any comment" ON public.community_comments;
CREATE POLICY "Admin can delete any comment" ON public.community_comments FOR DELETE
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- 8. Admin có thể update community_comments (duyệt/từ chối)
DROP POLICY IF EXISTS "Admin can update any comment" ON public.community_comments;
CREATE POLICY "Admin can update any comment" ON public.community_comments FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));
