-- Migration 108: Per-user Hanja progress
-- Store learned Hanja Pro words by authenticated user instead of localStorage.

CREATE TABLE IF NOT EXISTS public.user_hanja_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hanja_id INTEGER NOT NULL REFERENCES public.hanja_pro(id) ON DELETE CASCADE,
  learned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, hanja_id)
);

CREATE INDEX IF NOT EXISTS idx_user_hanja_progress_user_id ON public.user_hanja_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hanja_progress_hanja_id ON public.user_hanja_progress(hanja_id);
CREATE INDEX IF NOT EXISTS idx_user_hanja_progress_learned_at ON public.user_hanja_progress(learned_at DESC);

ALTER TABLE public.user_hanja_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_hanja_progress_select_own" ON public.user_hanja_progress;
CREATE POLICY "user_hanja_progress_select_own"
  ON public.user_hanja_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_hanja_progress_insert_own" ON public.user_hanja_progress;
CREATE POLICY "user_hanja_progress_insert_own"
  ON public.user_hanja_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE policy: not strictly required (the client uses INSERT-only and DELETE),
-- but added defensively so a future upsert won't silently fail under RLS.
DROP POLICY IF EXISTS "user_hanja_progress_update_own" ON public.user_hanja_progress;
CREATE POLICY "user_hanja_progress_update_own"
  ON public.user_hanja_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_hanja_progress_delete_own" ON public.user_hanja_progress;
CREATE POLICY "user_hanja_progress_delete_own"
  ON public.user_hanja_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Sync words_learned in user_progress whenever a hanja progress row changes.
-- Streak is computed client-side from learned_at, so we deliberately do NOT touch streak_count here.
CREATE OR REPLACE FUNCTION public.sync_user_hanja_progress_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_words_learned INT;
BEGIN
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);

  SELECT COUNT(*)::INT
  INTO v_words_learned
  FROM public.user_hanja_progress
  WHERE user_id = v_user_id;

  INSERT INTO public.user_progress (user_id, words_learned, updated_at)
  VALUES (v_user_id, v_words_learned, NOW())
  ON CONFLICT (user_id) DO UPDATE
    SET words_learned = EXCLUDED.words_learned,
        updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_user_hanja_progress_change ON public.user_hanja_progress;
CREATE TRIGGER on_user_hanja_progress_change
AFTER INSERT OR DELETE ON public.user_hanja_progress
FOR EACH ROW EXECUTE FUNCTION public.sync_user_hanja_progress_summary();
