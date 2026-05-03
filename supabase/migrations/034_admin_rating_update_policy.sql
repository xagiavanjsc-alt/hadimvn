-- ─── 034: Admin can manage ratings ─────────────────────────────────────────
-- Admin cần quyền duyệt/từ chối/sửa/xoá đánh giá trong bảng community_ratings
-- Dùng is_admin_user() helper (từ migration 026) thay vì service_role

-- Admin có thể SELECT mọi rating (kể cả pending/rejected) để duyệt
DROP POLICY IF EXISTS "Admin can view all ratings" ON public.community_ratings;
CREATE POLICY "Admin can view all ratings" ON public.community_ratings FOR SELECT
  TO authenticated
  USING (public.is_admin_user(auth.uid()));

-- Admin có thể UPDATE status/rating bất kỳ rating nào
DROP POLICY IF EXISTS "Admin can update any rating" ON public.community_ratings;
CREATE POLICY "Admin can update any rating" ON public.community_ratings FOR UPDATE
  TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Admin có thể DELETE rating
DROP POLICY IF EXISTS "Admin can delete any rating" ON public.community_ratings;
CREATE POLICY "Admin can delete any rating" ON public.community_ratings FOR DELETE
  TO authenticated
  USING (public.is_admin_user(auth.uid()));
