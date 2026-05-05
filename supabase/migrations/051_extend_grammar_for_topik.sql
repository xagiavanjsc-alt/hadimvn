-- Migration 051: Extend grammar_patterns for TOPIK grammar with images
-- Thêm image_url cho ảnh minh họa và topik_level cho TOPIK I/II

-- Add image_url column
ALTER TABLE public.grammar_patterns
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add topik_level column (TOPIK I, TOPIK II, or NULL for general grammar)
ALTER TABLE public.grammar_patterns
ADD COLUMN IF NOT EXISTS topik_level TEXT CHECK (topik_level IN ('TOPIK I', 'TOPIK II'));

-- Add index for topik_level filtering
CREATE INDEX IF NOT EXISTS idx_grammar_patterns_topik_level ON public.grammar_patterns(topik_level);

-- Add index for image_url (optional, for admin queries)
CREATE INDEX IF NOT EXISTS idx_grammar_patterns_image_url ON public.grammar_patterns(image_url) WHERE image_url IS NOT NULL;

-- Update existing sample data to have topik_level
UPDATE public.grammar_patterns
SET topik_level = CASE
  WHEN level = 'beginner' THEN 'TOPIK I'
  WHEN level IN ('intermediate', 'advanced') THEN 'TOPIK II'
  ELSE NULL
END
WHERE topik_level IS NULL;

COMMENT ON COLUMN public.grammar_patterns.image_url IS 'URL ảnh minh họa cho ngữ pháp (lưu trong Supabase Storage)';
COMMENT ON COLUMN public.grammar_patterns.topik_level IS 'Cấp độ TOPIK: TOPIK I (để thi TOPIK I), TOPIK II (để thi TOPIK II)';
