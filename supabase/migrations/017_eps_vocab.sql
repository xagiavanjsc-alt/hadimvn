-- 017_eps_vocab.sql
-- Centralized EPS-TOPIK vocabulary so /flashcard auto-updates when admin adds new words.
-- Mirrors the migration-015 (hanja_vocab_entries) RLS pattern: public read, admin write.

-- ─── Topics table (~50 rows) ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.eps_vocab_topics (
  id          TEXT PRIMARY KEY,           -- "greeting", "workplace", ...
  label       TEXT NOT NULL,              -- Vietnamese label
  label_ko    TEXT NOT NULL,              -- Korean label
  icon        TEXT,                       -- Remix icon class
  color       TEXT,                       -- hex string e.g. "#34d399"
  description TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eps_vocab_topics_sort ON public.eps_vocab_topics(sort_order);

-- ─── Entries table (~267 rows initial, grows as admin adds more) ────────────
CREATE TABLE IF NOT EXISTS public.eps_vocab_entries (
  id          TEXT PRIMARY KEY,           -- "ev001", "ev002", ...
  korean      TEXT NOT NULL,
  reading     TEXT,
  vietnamese  TEXT NOT NULL,
  example     TEXT,
  example_vi  TEXT,
  topic_id    TEXT REFERENCES public.eps_vocab_topics(id) ON DELETE SET NULL,
  level       TEXT CHECK (level IN ('basic','intermediate','advanced')) DEFAULT 'basic',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eps_vocab_entries_topic ON public.eps_vocab_entries(topic_id);
CREATE INDEX IF NOT EXISTS idx_eps_vocab_entries_level ON public.eps_vocab_entries(level);

-- ─── updated_at trigger (mirror 015 helper) ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_eps_vocab_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_eps_vocab_entries_updated_at ON public.eps_vocab_entries;
CREATE TRIGGER trg_eps_vocab_entries_updated_at
  BEFORE UPDATE ON public.eps_vocab_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_eps_vocab_updated_at();

-- ─── RLS — mirror 015 pattern: public SELECT, admin ALL ─────────────────────
ALTER TABLE public.eps_vocab_topics  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eps_vocab_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to eps_vocab_topics"
  ON public.eps_vocab_topics FOR SELECT
  USING (true);

CREATE POLICY "Public read access to eps_vocab_entries"
  ON public.eps_vocab_entries FOR SELECT
  USING (true);

CREATE POLICY "Admin write access to eps_vocab_topics"
  ON public.eps_vocab_topics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.user_role IN ('super_admin', 'smod'))
    )
  );

CREATE POLICY "Admin write access to eps_vocab_entries"
  ON public.eps_vocab_entries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND (user_profiles.is_admin = true OR user_profiles.user_role IN ('super_admin', 'smod'))
    )
  );

COMMENT ON TABLE public.eps_vocab_topics  IS 'EPS-TOPIK vocabulary topic categories (greeting, workplace, etc.)';
COMMENT ON TABLE public.eps_vocab_entries IS 'EPS-TOPIK vocabulary words used by /flashcard page (auto-updates without code deploy)';
