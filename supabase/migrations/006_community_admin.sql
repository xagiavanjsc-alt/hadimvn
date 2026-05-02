-- ─── 006: Community admin management ──────────────────────────────────────────
-- 1. Thêm cột status, category cho community_posts (nếu chưa có)
-- 2. Thêm RLS policy cho admin quản lý community_posts + comments

-- ─── Add missing columns ────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'community_posts' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN status TEXT DEFAULT 'approved';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'community_posts' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN category TEXT DEFAULT 'share';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'community_posts' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN image_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'community_posts' AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'community_posts' AND column_name = 'exam_score'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN exam_score INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'community_posts' AND column_name = 'streak_days'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN streak_days INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'community_posts' AND column_name = 'author_name'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN author_name TEXT DEFAULT 'Học viên';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'community_posts' AND column_name = 'author_level'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN author_level TEXT DEFAULT 'Học viên';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'community_posts' AND column_name = 'comments_count'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN comments_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- ─── RLS: Admin/SMod có thể quản lý community_posts ──────────────────────────
DROP POLICY IF EXISTS "Admins can manage community posts" ON public.community_posts;
CREATE POLICY "Admins can manage community posts"
  ON public.community_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR user_role IN ('smod', 'moderator'))
    )
  );

-- ─── RLS: Admin/SMod có thể quản lý comments ──────────────────────────────────
DROP POLICY IF EXISTS "Admins can manage comments" ON public.comments;
CREATE POLICY "Admins can manage comments"
  ON public.comments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR user_role IN ('smod', 'moderator'))
    )
  );

-- ─── RLS: Admin/SMod có thể xem app_feedback ──────────────────────────────────
DROP POLICY IF EXISTS "Admins can view feedback" ON public.app_feedback;
CREATE POLICY "Admins can view feedback"
  ON public.app_feedback FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND (is_admin = TRUE OR user_role IN ('smod'))
    )
  );

-- ─── Backfill: cập nhật author_name từ user_profiles ─────────────────────────
UPDATE public.community_posts cp
SET author_name = COALESCE(up.display_name, 'Học viên')
FROM public.user_profiles up
WHERE cp.user_id = up.id AND (cp.author_name IS NULL OR cp.author_name = 'Học viên');
