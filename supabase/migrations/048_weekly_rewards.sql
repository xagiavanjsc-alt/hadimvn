-- Migration 048: Weekly Leaderboard Rewards + Admin Manual Reward System
-- Cho phép admin thưởng huy hiệu + XP cho top người dùng hàng tuần

-- ─── 1. Bảng weekly_rewards: lưu lịch sử thưởng tuần ────────────────────
CREATE TABLE IF NOT EXISTS public.weekly_rewards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start    DATE NOT NULL,          -- Ngày bắt đầu tuần (thứ 2)
  rank          INT NOT NULL,           -- Thứ hạng tuần đó (1, 2, 3...)
  badge_id      TEXT NOT NULL,          -- 'gold_weekly', 'silver_weekly', 'bronze_weekly'
  xp_bonus      INT NOT NULL DEFAULT 0, -- XP thưởng thêm
  note          TEXT,                   -- Ghi chú từ admin
  awarded_by    UUID REFERENCES auth.users(id),
  awarded_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)           -- Mỗi user chỉ 1 giải/tuần
);

-- ─── 2. Bảng admin_xp_grants: log tất cả lần admin thưởng XP thủ công ──
CREATE TABLE IF NOT EXISTS public.admin_xp_grants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      INT NOT NULL,
  reason      TEXT NOT NULL,
  badge_id    TEXT,                     -- Badge kèm theo (nếu có)
  granted_by  UUID NOT NULL REFERENCES auth.users(id),
  granted_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 3. RLS policies ─────────────────────────────────────────────────────
ALTER TABLE public.weekly_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_xp_grants ENABLE ROW LEVEL SECURITY;

-- weekly_rewards: user xem của mình, admin xem tất cả
DROP POLICY IF EXISTS "Users see own weekly rewards" ON public.weekly_rewards;
CREATE POLICY "Users see own weekly rewards"
  ON public.weekly_rewards FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = TRUE
  ));

DROP POLICY IF EXISTS "Only admins insert weekly rewards" ON public.weekly_rewards;
CREATE POLICY "Only admins insert weekly rewards"
  ON public.weekly_rewards FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = TRUE
  ));

DROP POLICY IF EXISTS "Only admins delete weekly rewards" ON public.weekly_rewards;
CREATE POLICY "Only admins delete weekly rewards"
  ON public.weekly_rewards FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = TRUE
  ));

-- admin_xp_grants: admin xem và insert
DROP POLICY IF EXISTS "Admins manage xp grants" ON public.admin_xp_grants;
CREATE POLICY "Admins manage xp grants"
  ON public.admin_xp_grants FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = TRUE
  ));

DROP POLICY IF EXISTS "Users see own xp grants" ON public.admin_xp_grants;
CREATE POLICY "Users see own xp grants"
  ON public.admin_xp_grants FOR SELECT
  USING (user_id = auth.uid());

-- ─── 4. RPC: Admin thưởng weekly reward (atomic: grant XP + badge + log) ─
CREATE OR REPLACE FUNCTION public.admin_grant_weekly_reward(
  p_user_id   UUID,
  p_rank      INT,        -- 1=Vàng, 2=Bạc, 3=Đồng
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
BEGIN
  -- Chỉ admin
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = v_admin_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;

  -- Xác định badge và XP theo rank
  CASE p_rank
    WHEN 1 THEN v_badge_id := 'gold_weekly';   v_xp_bonus := 500; v_label := 'Top 1 tuần - Huy hiệu Vàng';
    WHEN 2 THEN v_badge_id := 'silver_weekly'; v_xp_bonus := 300; v_label := 'Top 2 tuần - Huy hiệu Bạc';
    WHEN 3 THEN v_badge_id := 'bronze_weekly'; v_xp_bonus := 200; v_label := 'Top 3 tuần - Huy hiệu Đồng';
    ELSE RAISE EXCEPTION 'Rank must be 1, 2, or 3';
  END CASE;

  -- Ghi vào weekly_rewards
  INSERT INTO public.weekly_rewards (user_id, week_start, rank, badge_id, xp_bonus, note, awarded_by)
  VALUES (p_user_id, p_week_start, p_rank, v_badge_id, v_xp_bonus, p_note, v_admin_id)
  ON CONFLICT (user_id, week_start) DO UPDATE SET
    rank = EXCLUDED.rank,
    badge_id = EXCLUDED.badge_id,
    xp_bonus = EXCLUDED.xp_bonus,
    note = EXCLUDED.note,
    awarded_by = EXCLUDED.awarded_by,
    awarded_at = now();

  -- Cộng XP vào user_progress (XP never decreases)
  UPDATE public.user_progress
  SET xp = xp + v_xp_bonus,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- Log vào admin_xp_grants
  INSERT INTO public.admin_xp_grants (user_id, amount, reason, badge_id, granted_by)
  VALUES (p_user_id, v_xp_bonus, v_label || COALESCE(' — ' || p_note, ''), v_badge_id, v_admin_id);

  RETURN json_build_object(
    'success', true,
    'user_id', p_user_id,
    'badge_id', v_badge_id,
    'xp_bonus', v_xp_bonus,
    'week_start', p_week_start
  );
END;
$$;

-- ─── 5. RPC: Admin thưởng XP tự do (không kèm badge) ─────────────────────
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
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = v_admin_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;

  IF p_amount <= 0 OR p_amount > 10000 THEN
    RAISE EXCEPTION 'Amount must be between 1 and 10000';
  END IF;

  UPDATE public.user_progress
  SET xp = xp + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO public.admin_xp_grants (user_id, amount, reason, granted_by)
  VALUES (p_user_id, p_amount, p_reason, v_admin_id);

  RETURN json_build_object('success', true, 'user_id', p_user_id, 'amount', p_amount);
END;
$$;

-- ─── 6. View: Tuần hiện tại + lịch sử thưởng tuần ──────────────────────
CREATE OR REPLACE VIEW public.weekly_rewards_summary AS
SELECT
  wr.id,
  wr.week_start,
  wr.rank,
  wr.badge_id,
  wr.xp_bonus,
  wr.note,
  wr.awarded_at,
  up.display_name,
  up.avatar_url,
  u2.display_name AS awarded_by_name
FROM public.weekly_rewards wr
JOIN public.user_profiles up ON up.id = wr.user_id
LEFT JOIN public.user_profiles u2 ON u2.id = wr.awarded_by
ORDER BY wr.week_start DESC, wr.rank ASC;

-- ─── 7. Grant execute permissions ────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.admin_grant_weekly_reward TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_grant_xp TO authenticated;
GRANT SELECT ON public.weekly_rewards_summary TO authenticated;
