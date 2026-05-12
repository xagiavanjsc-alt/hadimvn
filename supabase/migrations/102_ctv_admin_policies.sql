-- Migration 102: Fix CTV RLS + add helper RPC
-- Bug 1: admin-ctv page dùng browser client (authenticated role), không phải service_role
-- Bug 2: race condition khi cập nhật counter CTV
-- Bug 3: commission status không được update khi admin pay withdrawal

-- ─── RPC: tăng stats CTV an toàn (atomic, tránh race condition) ──────────────
CREATE OR REPLACE FUNCTION public.increment_ctv_stats(
  p_ctv_id        UUID,
  p_commission    BIGINT,
  p_sales         BIGINT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.ctv_profiles SET
    total_commission = total_commission + p_commission,
    total_sales      = total_sales      + p_sales,
    total_referred   = total_referred   + 1,
    updated_at       = NOW()
  WHERE id = p_ctv_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.increment_ctv_stats(UUID, BIGINT, BIGINT) TO authenticated, service_role;

-- ─── Migration 102: Fix CTV RLS — thêm admin policies dùng is_admin_user() ──
-- Bug: admin-ctv page dùng browser client (authenticated role), không phải service_role
-- nên không đọc được bất kỳ dữ liệu CTV nào.

-- ─── ctv_profiles: admin đọc + sửa toàn bộ ──────────────────────────────────
DROP POLICY IF EXISTS "admin_read_all_ctv_profiles" ON public.ctv_profiles;
CREATE POLICY "admin_read_all_ctv_profiles" ON public.ctv_profiles
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "admin_update_all_ctv_profiles" ON public.ctv_profiles;
CREATE POLICY "admin_update_all_ctv_profiles" ON public.ctv_profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_ctv_profiles" ON public.ctv_profiles;
CREATE POLICY "admin_delete_ctv_profiles" ON public.ctv_profiles
  FOR DELETE
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- ─── ctv_commissions: admin đọc + sửa toàn bộ ───────────────────────────────
DROP POLICY IF EXISTS "admin_read_all_ctv_commissions" ON public.ctv_commissions;
CREATE POLICY "admin_read_all_ctv_commissions" ON public.ctv_commissions
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "admin_update_all_ctv_commissions" ON public.ctv_commissions;
CREATE POLICY "admin_update_all_ctv_commissions" ON public.ctv_commissions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "admin_insert_ctv_commissions" ON public.ctv_commissions;
CREATE POLICY "admin_insert_ctv_commissions" ON public.ctv_commissions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

-- ─── ctv_withdrawals: admin đọc + sửa toàn bộ ───────────────────────────────
DROP POLICY IF EXISTS "admin_read_all_ctv_withdrawals" ON public.ctv_withdrawals;
CREATE POLICY "admin_read_all_ctv_withdrawals" ON public.ctv_withdrawals
  FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "admin_update_all_ctv_withdrawals" ON public.ctv_withdrawals;
CREATE POLICY "admin_update_all_ctv_withdrawals" ON public.ctv_withdrawals
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));
