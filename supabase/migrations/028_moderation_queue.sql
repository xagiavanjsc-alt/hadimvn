-- ─── 028: Moderation queue for posts + comments ──────────────────────────────
-- Mục tiêu:
--   1. Bài đăng MỚI phải ở trạng thái 'pending' đến khi admin/mod/smod duyệt.
--   2. Bình luận MỚI cũng phải ở 'pending' đến khi được duyệt.
--   3. Nếu tác giả chính là admin/smod/mod → tự động duyệt (status='approved').
--   4. Thành viên vẫn xem được bài/bình luận CỦA CHÍNH MÌNH dù đang chờ duyệt.
--
-- Idempotent: chạy nhiều lần không lỗi.

-- ─── 1. Đảm bảo cột status tồn tại và default = 'pending' ────────────────────
DO $$
BEGIN
  -- community_posts.status (đã có từ 006, nhưng default cũ = 'approved')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'community_posts' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN status TEXT DEFAULT 'pending';
  ELSE
    ALTER TABLE public.community_posts ALTER COLUMN status SET DEFAULT 'pending';
  END IF;
END $$;

-- ─── 2. Tạo bảng community_comments nếu chưa có ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  author_name TEXT DEFAULT 'Học viên',
  author_level TEXT DEFAULT 'Học viên',
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Đảm bảo có status column với default 'pending' kể cả khi bảng đã có sẵn
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'community_comments' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.community_comments ADD COLUMN status TEXT DEFAULT 'pending';
  ELSE
    ALTER TABLE public.community_comments ALTER COLUMN status SET DEFAULT 'pending';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_status ON public.community_comments(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON public.community_posts(status);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- ─── 3. RLS: ai cũng xem được 'approved', tác giả xem được của chính mình ────
DROP POLICY IF EXISTS "View approved posts" ON public.community_posts;
DROP POLICY IF EXISTS "Everyone can view posts" ON public.community_posts;
CREATE POLICY "View approved posts"
  ON public.community_posts FOR SELECT
  TO PUBLIC
  USING (
    status = 'approved'
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
        AND (up.is_admin = TRUE OR up.user_role IN ('smod', 'moderator'))
    )
  );

DROP POLICY IF EXISTS "Users can create posts" ON public.community_posts;
CREATE POLICY "Users can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
CREATE POLICY "Users can update own posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.community_posts;
CREATE POLICY "Users can delete own posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Comments: view approved or own
DROP POLICY IF EXISTS "View approved comments" ON public.community_comments;
DROP POLICY IF EXISTS "Everyone can view comments" ON public.community_comments;
CREATE POLICY "View approved comments"
  ON public.community_comments FOR SELECT
  TO PUBLIC
  USING (
    status = 'approved'
    OR user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
        AND (up.is_admin = TRUE OR up.user_role IN ('smod', 'moderator'))
    )
  );

DROP POLICY IF EXISTS "Users can create comments" ON public.community_comments;
CREATE POLICY "Users can create comments"
  ON public.community_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.community_comments;
CREATE POLICY "Users can update own comments"
  ON public.community_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.community_comments;
CREATE POLICY "Users can delete own comments"
  ON public.community_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can do everything
DROP POLICY IF EXISTS "Admins manage comments" ON public.community_comments;
CREATE POLICY "Admins manage comments"
  ON public.community_comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid()
        AND (up.is_admin = TRUE OR up.user_role IN ('smod', 'moderator'))
    )
  );

-- ─── 4. Trigger auto-approve khi author là admin/mod/smod ────────────────────
CREATE OR REPLACE FUNCTION public.auto_approve_if_privileged()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS NULL OR NEW.status = 'pending' THEN
    IF EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = NEW.user_id
        AND (up.is_admin = TRUE OR up.user_role IN ('super_admin', 'smod', 'moderator'))
    ) THEN
      NEW.status := 'approved';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_approve_posts ON public.community_posts;
CREATE TRIGGER trg_auto_approve_posts
  BEFORE INSERT ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.auto_approve_if_privileged();

DROP TRIGGER IF EXISTS trg_auto_approve_comments ON public.community_comments;
CREATE TRIGGER trg_auto_approve_comments
  BEFORE INSERT ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.auto_approve_if_privileged();

-- ─── 5. KHÔNG auto-backfill existing data ───────────────────────────────────
-- Existing posts có status='approved' (default cũ) giữ nguyên.
-- Existing posts có status=NULL → set 'approved' để không mất bài cũ.
UPDATE public.community_posts SET status = 'approved' WHERE status IS NULL;
UPDATE public.community_comments SET status = 'approved' WHERE status IS NULL;

COMMENT ON COLUMN public.community_posts.status IS
  'Moderation status: pending | approved | rejected. Default pending; admin/mod/smod posts auto-approved via trigger.';
COMMENT ON COLUMN public.community_comments.status IS
  'Moderation status: pending | approved | rejected. Default pending; admin/mod/smod comments auto-approved via trigger.';
