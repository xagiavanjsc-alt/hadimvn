-- ─── 034: Admin can update rating status ─────────────────────────────────────────
-- Admin cần quyền duyệt/từ chối đánh giá trong bảng community_ratings

-- Policy cho admin (service_role) update bất kỳ rating nào
DROP POLICY IF EXISTS "Admin can update any rating" ON public.community_ratings;
CREATE POLICY "Admin can update any rating" ON public.community_ratings FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
