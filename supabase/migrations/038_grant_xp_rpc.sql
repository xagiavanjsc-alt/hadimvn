-- ─── 038_grant_xp_rpc.sql ────────────────────────────────────────────────────
-- RPC để admin trao XP thủ công cho user (vẫn tuân thủ rule never-decrease).
-- Khớp với UI /rewards admin tab và useXPSystem client logic.
--
-- APPLY: paste vào Supabase SQL Editor → Run (idempotent)
-- ────────────────────────────────────────────────────────────────────────────

-- ─── 1. RPC: grant_xp(target_user_id, amount, reason) ───────────────────────
-- Chỉ admin mới gọi được (RLS / role check ở app layer).
-- Trả về XP mới sau khi grant.
CREATE OR REPLACE FUNCTION public.grant_xp(
  p_target_user_id UUID,
  p_amount INT,
  p_reason TEXT DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
  v_current_xp INT := 0;
  v_new_xp INT;
  v_caller_role TEXT;
BEGIN
  -- Kiểm tra caller phải là admin/moderator
  SELECT role INTO v_caller_role
  FROM public.user_profiles
  WHERE id = auth.uid();

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('admin', 'moderator') THEN
    RAISE EXCEPTION 'Only admin/moderator can grant XP';
  END IF;

  -- Validate amount (cho phép âm để admin "trừ" trong trường hợp đặc biệt — nhưng UI mặc định chỉ cho dương)
  IF p_amount = 0 OR p_amount IS NULL THEN
    RAISE EXCEPTION 'Amount must be non-zero';
  END IF;

  -- Đọc XP hiện tại
  SELECT COALESCE(xp, 0) INTO v_current_xp
  FROM public.user_progress
  WHERE user_id = p_target_user_id;

  v_new_xp := GREATEST(0, COALESCE(v_current_xp, 0) + p_amount);

  -- Upsert user_progress
  INSERT INTO public.user_progress (user_id, xp, updated_at)
  VALUES (p_target_user_id, v_new_xp, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    xp = EXCLUDED.xp,
    updated_at = NOW();

  -- Đồng bộ leaderboard
  INSERT INTO public.leaderboard (user_id, xp, updated_at)
  VALUES (p_target_user_id, v_new_xp, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    xp = EXCLUDED.xp,
    updated_at = EXCLUDED.updated_at;

  -- Log audit (nếu bảng tồn tại)
  BEGIN
    INSERT INTO public.audit_log (actor_id, action, target_id, meta, created_at)
    VALUES (
      auth.uid(),
      'grant_xp',
      p_target_user_id,
      jsonb_build_object('amount', p_amount, 'reason', p_reason, 'new_xp', v_new_xp),
      NOW()
    );
  EXCEPTION WHEN undefined_table THEN
    -- audit_log chưa có thì bỏ qua
    NULL;
  END;

  RETURN v_new_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.grant_xp(UUID, INT, TEXT) TO authenticated;

-- ─── DONE ─────────────────────────────────────────────────────────────────
-- Test:
--   SELECT public.grant_xp('target-uuid', 100, 'Bonus tích cực');
