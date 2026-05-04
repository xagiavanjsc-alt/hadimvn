-- ─── Enable Supabase Realtime for Leaderboard ───────────────────────────────────
-- Allows real-time updates when leaderboard data changes

-- Enable realtime on leaderboard table
alter publication supabase_realtime add table public.leaderboard;

-- Optional: Enable realtime on other tables for real-time features
-- alter publication supabase_realtime add table public.community_posts;
-- alter publication supabase_realtime add table public.community_comments;
-- alter publication supabase_realtime add table public.user_profiles;

COMMENT ON PUBLICATION supabase_realtime IS 'Realtime publication for live updates on leaderboard and community data';
