-- Sync data from user_progress to leaderboard for existing users
-- This fixes the issue where 3 real users have XP but not showing in leaderboard

-- Insert/update leaderboard entries from user_progress
INSERT INTO public.leaderboard (user_id, display_name, avatar_url, xp, streak, best_score, words_learned, level, updated_at)
SELECT 
    up.user_id,
    COALESCE(up.display_name, up.email, 'Học viên') as display_name,
    up.avatar_url,
    up.xp,
    up.streak_count as streak,
    0 as best_score, -- default 0 if not set
    0 as words_learned, -- default 0 if not set
    'Cơ bản' as level, -- default level
    up.updated_at
FROM public.user_progress up
ON CONFLICT (user_id) 
DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    xp = EXCLUDED.xp,
    streak = EXCLUDED.streak,
    best_score = COALESCE(leaderboard.best_score, EXCLUDED.best_score),
    words_learned = COALESCE(leaderboard.words_learned, EXCLUDED.words_learned),
    level = EXCLUDED.level,
    updated_at = EXCLUDED.updated_at
WHERE leaderboard.xp < EXCLUDED.xp OR leaderboard.updated_at < EXCLUDED.updated_at;

-- Verify the sync
SELECT user_id, display_name, xp, streak, updated_at 
FROM public.leaderboard 
ORDER BY xp DESC;
