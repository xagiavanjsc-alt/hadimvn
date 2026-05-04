-- Community Features Database Schema
-- This migration creates tables for community features (Q&A, discussions)

-- Create community_posts table
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('question', 'discussion', 'tip', 'resource')),
  tags TEXT[],
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  answers INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_solved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create community_answers table
CREATE TABLE IF NOT EXISTS public.community_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create community_likes table
CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'answer')),
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_answers_post_id ON public.community_answers(post_id);
CREATE INDEX IF NOT EXISTS idx_community_answers_user_id ON public.community_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON public.community_likes(user_id);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_posts
CREATE POLICY "Community posts are viewable by all authenticated users"
ON public.community_posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create community posts"
ON public.community_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community posts"
ON public.community_posts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community posts"
ON public.community_posts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS policies for community_answers
CREATE POLICY "Community answers are viewable by all authenticated users"
ON public.community_answers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create community answers"
ON public.community_answers FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own community answers"
ON public.community_answers FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own community answers"
ON public.community_answers FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS policies for community_likes
CREATE POLICY "Users can view their own likes"
ON public.community_likes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create likes"
ON public.community_likes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
ON public.community_likes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Function to update post stats
CREATE OR REPLACE FUNCTION public.update_post_stats(p_post_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE community_posts
  SET
    views = COALESCE((SELECT COUNT(*) FROM community_posts WHERE id = p_post_id), 0),
    likes = COALESCE((SELECT COUNT(*) FROM community_likes WHERE target_type = 'post' AND target_id = p_post_id), 0),
    answers = COALESCE((SELECT COUNT(*) FROM community_answers WHERE post_id = p_post_id), 0),
    updated_at = NOW()
  WHERE id = p_post_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_post_stats(UUID) TO authenticated;
