-- ─── Trigger to update post comments count ───────────────────────────────────────
-- This trigger updates the comments_count column in community_posts when comments are inserted or deleted

CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_update_post_comments_count ON public.community_comments;
CREATE TRIGGER trg_update_post_comments_count
  AFTER INSERT OR DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

-- ─── Recalculate existing comments_count for all posts ───────────────────────────
-- This ensures all existing posts have accurate comment counts
UPDATE public.community_posts p
SET comments_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM public.community_comments c
  WHERE c.post_id = p.id
);
