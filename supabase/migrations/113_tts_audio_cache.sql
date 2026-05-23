-- Migration 113: TTS audio cache — site-wide Korean text → audio URL cache.
--
-- Cache key = SHA-256(normalized text). Same Korean phrase across any page
-- resolves to one row, one storage object. Filename uses Latin romanization
-- + 8-char hash suffix because Korean characters in URLs break some browsers
-- and CDN edges.
--
-- Lifecycle:
--   1. Frontend calls edge function `tts-cache` with the text.
--   2. Function checks this table by `text_hash`.
--   3. Hit → return `audio_url`, increment `hit_count`.
--   4. Miss → call provider (OpenAI / ElevenLabs / Google) per
--      admin_settings.tts_provider, upload to `tts-audio` bucket as
--      `<latin_slug>-<short_hash>.mp3`, INSERT row, return URL.
--   5. Admin can mark `manual_override = true` after uploading a hand-curated
--      mp3 — runtime will never regenerate those.

CREATE TABLE IF NOT EXISTS public.tts_audio_cache (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text          TEXT NOT NULL,                 -- original Korean text
  text_hash     TEXT NOT NULL UNIQUE,          -- sha256 hex of normalized text
  latin_slug    TEXT NOT NULL,                 -- romanized slug used in filename
  audio_url     TEXT NOT NULL,                 -- public URL in tts-audio bucket
  voice_provider TEXT NOT NULL DEFAULT 'openai', -- openai | elevenlabs | google | manual
  voice_id      TEXT,                          -- e.g. "alloy", ElevenLabs voice_id
  voice_speed   NUMERIC(3,2) DEFAULT 1.0,
  manual_override BOOLEAN NOT NULL DEFAULT FALSE,
  status        TEXT NOT NULL DEFAULT 'ready', -- ready | error
  hit_count     INTEGER NOT NULL DEFAULT 0,    -- runtime cache reads (popularity)
  last_played_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tts_cache_hash    ON public.tts_audio_cache(text_hash);
CREATE INDEX IF NOT EXISTS idx_tts_cache_created ON public.tts_audio_cache(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tts_cache_hits    ON public.tts_audio_cache(hit_count DESC);

COMMENT ON TABLE public.tts_audio_cache IS
  'Site-wide audio cache for Korean TTS. One row per unique normalized text.';

-- ─── Queue of texts that missed cache but provider was not configured ────────
-- Lets admin see "needs audio" backlog and batch-generate later.
CREATE TABLE IF NOT EXISTS public.tts_audio_misses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text        TEXT NOT NULL,
  text_hash   TEXT NOT NULL UNIQUE,
  miss_count  INTEGER NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tts_misses_count ON public.tts_audio_misses(miss_count DESC);

COMMENT ON TABLE public.tts_audio_misses IS
  'Texts the runtime tried to play but had no cache + no provider — admin queue.';

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.tts_audio_cache  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tts_audio_misses ENABLE ROW LEVEL SECURITY;

-- Anyone (anon + auth) can READ the cache — audio URLs are public anyway.
DROP POLICY IF EXISTS "tts_cache_public_read" ON public.tts_audio_cache;
CREATE POLICY "tts_cache_public_read" ON public.tts_audio_cache
  FOR SELECT USING (true);

-- Only admin can modify cache rows directly. Edge function uses service role
-- key and bypasses RLS, so it can still INSERT/UPDATE freely.
DROP POLICY IF EXISTS "tts_cache_admin_write" ON public.tts_audio_cache;
CREATE POLICY "tts_cache_admin_write" ON public.tts_audio_cache
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Misses queue: admin only.
DROP POLICY IF EXISTS "tts_misses_admin_all" ON public.tts_audio_misses;
CREATE POLICY "tts_misses_admin_all" ON public.tts_audio_misses
  FOR ALL TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- ─── Storage bucket policies ─────────────────────────────────────────────────
-- The bucket `tts-audio` must be created in Supabase Studio with
-- `public = true`. Migration only sets the access policies.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'tts-audio') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('tts-audio', 'tts-audio', true);
  END IF;
END $$;

DROP POLICY IF EXISTS "tts_audio_public_read" ON storage.objects;
CREATE POLICY "tts_audio_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'tts-audio');

DROP POLICY IF EXISTS "tts_audio_admin_write" ON storage.objects;
CREATE POLICY "tts_audio_admin_write" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'tts-audio' AND public.is_admin_user(auth.uid()))
  WITH CHECK (bucket_id = 'tts-audio' AND public.is_admin_user(auth.uid()));

-- ─── updated_at trigger ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.tts_cache_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tts_cache_updated_at ON public.tts_audio_cache;
CREATE TRIGGER trg_tts_cache_updated_at
  BEFORE UPDATE ON public.tts_audio_cache
  FOR EACH ROW EXECUTE FUNCTION public.tts_cache_touch_updated_at();

-- ─── RPC: bump hit_count atomically ──────────────────────────────────────────
-- Called by the edge function on every cache hit. SECURITY DEFINER so anonymous
-- callers via the edge function can increment without needing UPDATE policy.
CREATE OR REPLACE FUNCTION public.increment_tts_hit(p_text_hash TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.tts_audio_cache
  SET hit_count = hit_count + 1,
      last_played_at = NOW()
  WHERE text_hash = p_text_hash;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_tts_hit(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_tts_hit(TEXT) TO service_role, authenticated;

-- ─── RPC: record a miss (provider not configured) ────────────────────────────
-- Upsert into misses queue, bumping miss_count + last_seen_at.
CREATE OR REPLACE FUNCTION public.record_tts_miss(p_text TEXT, p_text_hash TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.tts_audio_misses (text, text_hash, miss_count, last_seen_at)
  VALUES (p_text, p_text_hash, 1, NOW())
  ON CONFLICT (text_hash) DO UPDATE
    SET miss_count = public.tts_audio_misses.miss_count + 1,
        last_seen_at = NOW();
END;
$$;

REVOKE ALL ON FUNCTION public.record_tts_miss(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_tts_miss(TEXT, TEXT) TO service_role, authenticated;
