-- Achievements and Badges System
-- This migration creates tables for achievements and user achievements

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('learning', 'streak', 'vocabulary', 'eps', 'social', 'special')),
  condition_type TEXT NOT NULL CHECK (condition_type IN ('total_words', 'streak_days', 'eps_score', 'daily_words', 'days_active', 'special')),
  condition_value INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  badge_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON public.achievements(category);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements (read-only for all authenticated users)
CREATE POLICY "Achievements are viewable by all authenticated users"
ON public.achievements FOR SELECT
TO authenticated
USING (true);

-- RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert user achievements"
ON public.user_achievements FOR INSERT
TO authenticated
WITH CHECK (true);

-- Insert default achievements
INSERT INTO public.achievements (code, name, description, icon, color, category, condition_type, condition_value, xp_reward) VALUES
-- Learning achievements
('first_word', 'Từ đầu tiên', 'Học từ đầu tiên', 'ri-book-open-line', '#f59e0b', 'learning', 'total_words', 1, 10),
('ten_words', '10 từ', 'Học 10 từ', 'ri-book-2-line', '#f59e0b', 'learning', 'total_words', 10, 50),
('hundred_words', '100 từ', 'Học 100 từ', 'ri-book-3-line', '#f59e0b', 'learning', 'total_words', 100, 200),
('thousand_words', '1000 từ', 'Học 1000 từ', 'ri-book-4-line', '#f59e0b', 'learning', 'total_words', 1000, 1000),

-- Streak achievements
('streak_3', '3 ngày liên tiếp', 'Học 3 ngày liên tiếp', 'ri-fire-line', '#ef4444', 'streak', 'streak_days', 3, 30),
('streak_7', '1 tuần liên tiếp', 'Học 7 ngày liên tiếp', 'ri-fire-fill', '#ef4444', 'streak', 'streak_days', 7, 100),
('streak_30', '1 tháng liên tiếp', 'Học 30 ngày liên tiếp', 'ri-fire-line', '#ef4444', 'streak', 'streak_days', 30, 500),
('streak_100', '100 ngày liên tiếp', 'Học 100 ngày liên tiếp', 'ri-fire-fill', '#ef4444', 'streak', 'streak_days', 100, 2000),

-- Daily achievements
('daily_complete', 'Hoàn thành ngày', 'Hoàn thành mục tiêu học hàng ngày', 'ri-checkbox-circle-line', '#10b981', 'learning', 'daily_words', 8, 20),
('daily_streak_5', '5 ngày hoàn thành', 'Hoàn thành mục tiêu học 5 ngày', 'ri-calendar-check-line', '#10b981', 'learning', 'days_active', 5, 100),

-- EPS achievements
('eps_first', 'Lần đầu EPS', 'Làm bài EPS lần đầu', 'ri-file-list-3-line', '#8b5cf6', 'eps', 'eps_score', 1, 20),
('eps_60', 'EPS 60%', 'Đạt 60% bài EPS', 'ri-trophy-line', '#8b5cf6', 'eps', 'eps_score', 60, 100),
('eps_80', 'EPS 80%', 'Đạt 80% bài EPS', 'ri-trophy-fill', '#8b5cf6', 'eps', 'eps_score', 80, 200),
('eps_90', 'EPS 90%', 'Đạt 90% bài EPS', 'ri-vip-crown-line', '#8b5cf6', 'eps', 'eps_score', 90, 500),

-- Special achievements
('early_bird', 'Chim sớm', 'Học trước 6h sáng', 'ri-sun-line', '#fbbf24', 'special', 'special', 1, 50),
('night_owl', 'Cú đêm', 'Học sau 10h đêm', 'ri-moon-line', '#6366f1', 'special', 'special', 1, 50),
('perfect_day', 'Ngày hoàn hảo', 'Hoàn thành mọi mục tiêu trong ngày', 'ri-star-fill', '#fbbf24', 'special', 'special', 1, 100);

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(p_user_id UUID)
RETURNS TABLE (achievement_id UUID, achievement_name TEXT, achievement_icon TEXT, xp_reward INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_achievement RECORD;
  v_user_stats RECORD;
BEGIN
  -- Get user stats
  SELECT
    COALESCE(SUM(CASE WHEN category = 'vocabulary' THEN 1 ELSE 0 END), 0) as total_words,
    COALESCE(MAX(streak), 0) as max_streak,
    COALESCE(MAX(eps_score), 0) as max_eps_score,
    COALESCE(COUNT(DISTINCT DATE(created_at)), 0) as active_days
  INTO v_user_stats
  FROM study_history
  WHERE user_id = p_user_id;

  -- Check each achievement
  FOR v_achievement IN
    SELECT id, name, icon, xp_reward, condition_type, condition_value
    FROM achievements
    WHERE id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = p_user_id)
  LOOP
    -- Check if condition is met
    IF (
      (v_achievement.condition_type = 'total_words' AND v_user_stats.total_words >= v_achievement.condition_value) OR
      (v_achievement.condition_type = 'streak_days' AND v_user_stats.max_streak >= v_achievement.condition_value) OR
      (v_achievement.condition_type = 'eps_score' AND v_user_stats.max_eps_score >= v_achievement.condition_value) OR
      (v_achievement.condition_type = 'days_active' AND v_user_stats.active_days >= v_achievement.condition_value)
    ) THEN
      -- Award achievement
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (p_user_id, v_achievement.id);
      
      -- Return achievement
      RETURN QUERY SELECT
        v_achievement.id,
        v_achievement.name,
        v_achievement.icon,
        v_achievement.xp_reward;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_and_award_achievements(UUID) TO authenticated;
