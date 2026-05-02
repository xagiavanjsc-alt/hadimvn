-- =================================================================
-- HANJA VOCAB ENTRIES TABLE — Hàn Quốc Ơi!
-- =================================================================
-- Centralized storage for Hanja vocabulary with enhanced fields
-- Allows admin editing via UI and future AI enrichment
-- =================================================================

-- Create hanja_vocab_entries table if not exists
CREATE TABLE IF NOT EXISTS public.hanja_vocab_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  korean TEXT NOT NULL,
  hanja TEXT NOT NULL,
  vietnamese TEXT NOT NULL,
  pronunciation TEXT,
  category TEXT DEFAULT 'Khác',
  difficulty INTEGER DEFAULT 2 CHECK (difficulty IN (1, 2, 3)),
  topik_level INTEGER CHECK (topik_level IN (1, 2, 3, 4, 5, 6)),
  examples JSONB DEFAULT '[]'::jsonb,
  memory_tip TEXT,
  related_words JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deduplicate existing rows (keep the one with latest updated_at)
DELETE FROM public.hanja_vocab_entries d1
WHERE EXISTS (
  SELECT 1 FROM public.hanja_vocab_entries d2
  WHERE d2.korean = d1.korean
    AND d2.hanja = d1.hanja
    AND d2.id < d1.id
);

-- Unique constraint on korean+hanja combination (now safe after deduplication)
CREATE UNIQUE INDEX IF NOT EXISTS hanja_vocab_korean_hanja_idx 
  ON public.hanja_vocab_entries (korean, hanja);

-- GIN index for JSONB fields (examples, related_words)
CREATE INDEX IF NOT EXISTS hanja_vocab_examples_idx 
  ON public.hanja_vocab_entries USING GIN (examples);
CREATE INDEX IF NOT EXISTS hanja_vocab_related_words_idx 
  ON public.hanja_vocab_entries USING GIN (related_words);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS hanja_vocab_category_idx 
  ON public.hanja_vocab_entries (category);

-- Index for difficulty filtering
CREATE INDEX IF NOT EXISTS hanja_vocab_difficulty_idx 
  ON public.hanja_vocab_entries (difficulty);

-- Index for TOPIK level filtering
CREATE INDEX IF NOT EXISTS hanja_vocab_topik_level_idx 
  ON public.hanja_vocab_entries (topik_level);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_hanja_vocab_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hanja_vocab_updated_at_trigger
  BEFORE UPDATE ON public.hanja_vocab_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_hanja_vocab_updated_at();

-- Enable RLS
ALTER TABLE public.hanja_vocab_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Public read access (anyone can read vocabulary)
CREATE POLICY "Public read access to hanja_vocab_entries"
  ON public.hanja_vocab_entries FOR SELECT
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admin write access to hanja_vocab_entries"
  ON public.hanja_vocab_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.user_role IN ('super_admin', 'smod'))
    )
  );

COMMENT ON TABLE public.hanja_vocab_entries IS 'Centralized Hanja vocabulary with pronunciation, category, difficulty, TOPIK level, examples, and memory tips';
