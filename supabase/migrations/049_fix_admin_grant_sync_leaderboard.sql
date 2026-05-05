-- Migration 049: Fix admin_grant_xp & admin_grant_weekly_reward to sync leaderboard table

-- ─── 1. admin_grant_weekly_reward — có sync leaderboard ──────────────────
CREATE OR REPLACE FUNCTION public.admin_grant_weekly_reward(
  p_user_id   UUID,
  p_rank      INT,
  p_week_start DATE,
  p_note      TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id  UUID := auth.uid();
  v_badge_id  TEXT;
  v_xp_bonus  INT;
  v_label     TEXT;
  v_name      TEXT;
  v_avatar    TEXT;
  v_new_xp    INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = v_admin_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;

  CASE p_rank
    WHEN 1 THEN v_badge_id := 'gold_weekly';   v_xp_bonus := 500; v_label := 'Top 1 tuần - Huy hiệu Vàng';
    WHEN 2 THEN v_badge_id := 'silver_weekly'; v_xp_bonus := 300; v_label := 'Top 2 tuần - Huy hiệu Bạc';
    WHEN 3 THEN v_badge_id := 'bronze_weekly'; v_xp_bonus := 200; v_label := 'Top 3 tuần - Huy hiệu Đồng';
    ELSE RAISE EXCEPTION 'Rank must be 1, 2, or 3';
  END CASE;

  -- Ghi weekly_rewards
  INSERT INTO public.weekly_rewards (user_id, week_start, rank, badge_id, xp_bonus, note, awarded_by)
  VALUES (p_user_id, p_week_start, p_rank, v_badge_id, v_xp_bonus, p_note, v_admin_id)
  ON CONFLICT (user_id, week_start) DO UPDATE SET
    rank       = EXCLUDED.rank,
    badge_id   = EXCLUDED.badge_id,
    xp_bonus   = EXCLUDED.xp_bonus,
    note       = EXCLUDED.note,
    awarded_by = EXCLUDED.awarded_by,
    awarded_at = now();

  -- Cộng XP vào user_progress
  UPDATE public.user_progress
  SET xp = xp + v_xp_bonus, updated_at = now()
  WHERE user_id = p_user_id
  RETURNING xp INTO v_new_xp;

  -- Nếu user chưa có row trong user_progress thì insert
  IF NOT FOUND THEN
    INSERT INTO public.user_progress (user_id, xp, updated_at)
    VALUES (p_user_id, v_xp_bonus, now())
    RETURNING xp INTO v_new_xp;
  END IF;

  -- Lấy display info
  SELECT display_name, avatar_url INTO v_name, v_avatar
  FROM public.user_profiles WHERE id = p_user_id;

  -- Sync leaderboard (GREATEST đảm bảo XP không giảm)
  INSERT INTO public.leaderboard (user_id, display_name, avatar_url, xp, updated_at)
  VALUES (p_user_id, COALESCE(v_name, 'Học viên'), v_avatar, v_new_xp, now())
  ON CONFLICT (user_id) DO UPDATE SET
    xp           = GREATEST(public.leaderboard.xp, EXCLUDED.xp),
    display_name = COALESCE(EXCLUDED.display_name, public.leaderboard.display_name),
    avatar_url   = COALESCE(EXCLUDED.avatar_url, public.leaderboard.avatar_url),
    updated_at   = now();

  -- Log
  INSERT INTO public.admin_xp_grants (user_id, amount, reason, badge_id, granted_by)
  VALUES (p_user_id, v_xp_bonus, v_label || COALESCE(' — ' || p_note, ''), v_badge_id, v_admin_id);

  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'badge_id', v_badge_id,
    'xp_bonus', v_xp_bonus,
    'new_xp', v_new_xp,
    'week_start', p_week_start
  );
END;
$$;

-- ─── 2. admin_grant_xp — có sync leaderboard ────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_grant_xp(
  p_user_id UUID,
  p_amount  INT,
  p_reason  TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
  v_name     TEXT;
  v_avatar   TEXT;
  v_new_xp   INT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = v_admin_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;

  IF p_amount <= 0 OR p_amount > 10000 THEN
    RAISE EXCEPTION 'Amount must be between 1 and 10000';
  END IF;

  -- Cộng XP
  UPDATE public.user_progress
  SET xp = xp + p_amount, updated_at = now()
  WHERE user_id = p_user_id
  RETURNING xp INTO v_new_xp;

  IF NOT FOUND THEN
    INSERT INTO public.user_progress (user_id, xp, updated_at)
    VALUES (p_user_id, p_amount, now())
    RETURNING xp INTO v_new_xp;
  END IF;

  -- Lấy display info
  SELECT display_name, avatar_url INTO v_name, v_avatar
  FROM public.user_profiles WHERE id = p_user_id;

  -- Sync leaderboard
  INSERT INTO public.leaderboard (user_id, display_name, avatar_url, xp, updated_at)
  VALUES (p_user_id, COALESCE(v_name, 'Học viên'), v_avatar, v_new_xp, now())
  ON CONFLICT (user_id) DO UPDATE SET
    xp           = GREATEST(public.leaderboard.xp, EXCLUDED.xp),
    display_name = COALESCE(EXCLUDED.display_name, public.leaderboard.display_name),
    avatar_url   = COALESCE(EXCLUDED.avatar_url, public.leaderboard.avatar_url),
    updated_at   = now();

  -- Log
  INSERT INTO public.admin_xp_grants (user_id, amount, reason, granted_by)
  VALUES (p_user_id, p_amount, p_reason, v_admin_id);

  RETURN json_build_object('success', true, 'user_id', p_user_id, 'amount', p_amount, 'new_xp', v_new_xp);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_grant_weekly_reward TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_xp TO authenticated;
