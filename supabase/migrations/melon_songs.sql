-- Melon Songs table for K-pop learning content
-- Run this in Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS melon_songs (
  id SERIAL PRIMARY KEY,
  rank INTEGER NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT DEFAULT 'K-pop',
  lyrics TEXT DEFAULT '',
  album_art TEXT DEFAULT '',
  processed BOOLEAN DEFAULT false,
  release_date TEXT DEFAULT '',
  album TEXT DEFAULT '',
  translation JSONB DEFAULT NULL,
  vocabulary JSONB DEFAULT NULL,
  grammar JSONB DEFAULT NULL,
  difficulty JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow public read (all users can view songs)
ALTER TABLE melon_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read melon songs"
  ON melon_songs FOR SELECT
  USING (true);

-- Allow all writes (admin page is protected by app-level auth via useIsAdmin)
CREATE POLICY "Allow all to modify melon songs"
  ON melon_songs FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for rank ordering
CREATE INDEX IF NOT EXISTS melon_songs_rank_idx ON melon_songs (rank);

-- Naver KiN Q&A table
CREATE TABLE IF NOT EXISTS naver_kin_qa (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  question_vi TEXT DEFAULT '',
  answer TEXT NOT NULL,
  answer_vi TEXT DEFAULT '',
  category TEXT DEFAULT 'Korean Learning',
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  url TEXT DEFAULT '',
  translated BOOLEAN DEFAULT false,
  vocabulary JSONB DEFAULT NULL,
  grammar JSONB DEFAULT NULL,
  difficulty TEXT DEFAULT '2',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE naver_kin_qa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read naver kin qa"
  ON naver_kin_qa FOR SELECT
  USING (true);

CREATE POLICY "Only service role can modify naver kin qa"
  ON naver_kin_qa FOR ALL
  USING (auth.role() = 'service_role');
