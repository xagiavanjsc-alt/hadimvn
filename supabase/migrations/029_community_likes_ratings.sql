-- ─── Community Likes Table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON public.community_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON public.community_likes(post_id);

-- Enable RLS
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view likes
CREATE POLICY "Users can view likes" ON public.community_likes FOR SELECT
  TO PUBLIC
  USING (true);

-- Users can insert their own likes
CREATE POLICY "Users can insert own likes" ON public.community_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete own likes" ON public.community_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Community Ratings Table (Đánh giá sao) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.community_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_community_ratings_user_id ON public.community_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_community_ratings_post_id ON public.community_ratings(post_id);

-- Enable RLS
ALTER TABLE public.community_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view ratings
CREATE POLICY "Users can view ratings" ON public.community_ratings FOR SELECT
  TO PUBLIC
  USING (true);

-- Users can insert their own ratings
CREATE POLICY "Users can insert own ratings" ON public.community_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings" ON public.community_ratings FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── Update community_posts to add rating fields ─────────────────────────────────────
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS rating_average DECIMAL(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;

-- ─── Trigger to update post likes count ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts SET likes = likes + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_post_likes_count ON public.community_likes;
CREATE TRIGGER trg_update_post_likes_count
  AFTER INSERT OR DELETE ON public.community_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- ─── Trigger to update post rating average ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_post_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  rating_count INTEGER;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT AVG(rating)::DECIMAL(3,2), COUNT(*) INTO avg_rating, rating_count
    FROM public.community_ratings
    WHERE post_id = NEW.post_id;
    
    UPDATE public.community_posts
    SET rating_average = COALESCE(avg_rating, 0),
        rating_count = COALESCE(rating_count, 0)
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT AVG(rating)::DECIMAL(3,2), COUNT(*) INTO avg_rating, rating_count
    FROM public.community_ratings
    WHERE post_id = OLD.post_id;
    
    UPDATE public.community_posts
    SET rating_average = COALESCE(avg_rating, 0),
        rating_count = COALESCE(rating_count, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_post_rating ON public.community_ratings;
CREATE TRIGGER trg_update_post_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.community_ratings
  FOR EACH ROW EXECUTE FUNCTION update_post_rating();
