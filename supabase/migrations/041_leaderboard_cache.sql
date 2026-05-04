-- ─── Leaderboard Cache Table ─────────────────────────────────────────────────────
-- Stores cached leaderboard data to reduce database load
-- Cache TTL: 5 minutes (300 seconds)

CREATE TABLE IF NOT EXISTS public.leaderboard_cache (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Index for faster cleanup of expired cache
CREATE INDEX IF NOT EXISTS idx_leaderboard_cache_expires_at 
  ON public.leaderboard_cache(expires_at);

-- Function to get cached data
CREATE OR REPLACE FUNCTION public.get_leaderboard_cache(p_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_data JSONB;
BEGIN
  -- Delete expired entries first
  DELETE FROM public.leaderboard_cache WHERE expires_at < NOW();
  
  -- Get cached data if not expired
  SELECT data INTO v_data
  FROM public.leaderboard_cache
  WHERE key = p_key AND expires_at > NOW();
  
  RETURN v_data;
END;
$$;

-- Function to set cached data
CREATE OR REPLACE FUNCTION public.set_leaderboard_cache(p_key TEXT, p_data JSONB, p_ttl_seconds INT DEFAULT 300)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.leaderboard_cache (key, data, expires_at)
  VALUES (p_key, p_data, NOW() + (p_ttl_seconds || ' seconds')::INTERVAL)
  ON CONFLICT (key) DO UPDATE SET
    data = EXCLUDED.data,
    expires_at = NOW() + (p_ttl_seconds || ' seconds')::INTERVAL,
    created_at = NOW();
END;
$$;

-- Function to invalidate cache
CREATE OR REPLACE FUNCTION public.invalidate_leaderboard_cache(p_key_pattern TEXT DEFAULT NULL)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  IF p_key_pattern IS NULL THEN
    DELETE FROM public.leaderboard_cache;
    v_count := 1;
  ELSE
    DELETE FROM public.leaderboard_cache WHERE key LIKE p_key_pattern;
    GET DIAGNOSTICS v_count = ROW_COUNT;
  END IF;
  RETURN v_count;
END;
$$;

-- RLS Policies
ALTER TABLE public.leaderboard_cache ENABLE ROW LEVEL SECURITY;

-- Public can read cache (for performance)
CREATE POLICY "Public can read leaderboard cache"
  ON public.leaderboard_cache FOR SELECT
  TO PUBLIC
  USING (true);

-- Only service role can write to cache
CREATE POLICY "Service role can write leaderboard cache"
  ON public.leaderboard_cache FOR ALL
  TO service_role
  USING (true);

-- Cron job to clean expired cache every hour (only if pg_cron extension exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'clean-leaderboard-cache-hourly',
      '0 * * * *',
      'DELETE FROM public.leaderboard_cache WHERE expires_at < NOW();'
    );
  END IF;
END $$;

COMMENT ON TABLE public.leaderboard_cache IS 'Cache table for leaderboard data to reduce database load';
COMMENT ON FUNCTION public.get_leaderboard_cache IS 'Get cached leaderboard data by key';
COMMENT ON FUNCTION public.set_leaderboard_cache IS 'Set cached leaderboard data with TTL in seconds';
COMMENT ON FUNCTION public.invalidate_leaderboard_cache IS 'Invalidate cache by key pattern (NULL = clear all)';
