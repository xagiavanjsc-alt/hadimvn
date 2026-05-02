-- =================================================================
-- SECURITY DEFINER RPC for Hanja Vocab Upsert — Hàn Quốc Ơi!
-- =================================================================
-- Bypasses RLS to allow upserting hanja entries from sync script
-- =================================================================

CREATE OR REPLACE FUNCTION public.upsert_hanja_entry(
  p_korean TEXT,
  p_hanja TEXT,
  p_vietnamese TEXT,
  p_pronunciation TEXT DEFAULT NULL,
  p_category TEXT DEFAULT 'Khác',
  p_difficulty INTEGER DEFAULT 2,
  p_topik_level INTEGER DEFAULT NULL,
  p_examples JSONB DEFAULT '[]'::jsonb,
  p_memory_tip TEXT DEFAULT NULL,
  p_related_words JSONB DEFAULT '[]'::jsonb
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.hanja_vocab_entries (
    korean, hanja, vietnamese, pronunciation, category, difficulty, topik_level,
    examples, memory_tip, related_words, updated_at
  ) VALUES (
    p_korean, p_hanja, p_vietnamese, p_pronunciation, p_category, p_difficulty, p_topik_level,
    p_examples, p_memory_tip, p_related_words, NOW()
  )
  ON CONFLICT (korean, hanja)
  DO UPDATE SET
    vietnamese = EXCLUDED.vietnamese,
    pronunciation = COALESCE(EXCLUDED.pronunciation, hanja_vocab_entries.pronunciation),
    category = COALESCE(EXCLUDED.category, hanja_vocab_entries.category),
    difficulty = COALESCE(EXCLUDED.difficulty, hanja_vocab_entries.difficulty),
    topik_level = COALESCE(EXCLUDED.topik_level, hanja_vocab_entries.topik_level),
    examples = COALESCE(EXCLUDED.examples, hanja_vocab_entries.examples),
    memory_tip = COALESCE(EXCLUDED.memory_tip, hanja_vocab_entries.memory_tip),
    related_words = COALESCE(EXCLUDED.related_words, hanja_vocab_entries.related_words),
    updated_at = NOW()
  RETURNING id INTO v_id;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_id
  );
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant execute to public (or service role)
GRANT EXECUTE ON FUNCTION public.upsert_hanja_entry TO public;
GRANT EXECUTE ON FUNCTION public.upsert_hanja_entry TO service_role;
