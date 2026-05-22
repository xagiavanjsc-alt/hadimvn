-- Migration 110: Unify words_learned across hanja_progress + flashcard_data
--
-- Problem: user_progress.words_learned had two competing writers:
--   • migration 108 trigger on user_hanja_progress wrote count(hanja_progress)
--   • client useStudySync/useXPSystem upserted size(localStorage.flashcard_known)
-- Whoever wrote last won, so the leaderboard's "words learned" column
-- flickered between two unrelated numbers depending on which sync fired
-- most recently.
--
-- Fix: server is the single source of truth for words_learned. The count
-- is the sum of both authoritative tables:
--   user_hanja_progress + flashcard_data status IN ('review','mastered')
-- A trigger on each table recomputes the total. Client stops needing to
-- write words_learned in its upserts (it still can; the trigger will
-- overwrite with the correct total on the next inventory change).

CREATE OR REPLACE FUNCTION public.recompute_user_words_learned(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hanja INT := 0;
  v_flash INT := 0;
  v_total INT := 0;
BEGIN
  SELECT COUNT(*) INTO v_hanja
  FROM public.user_hanja_progress
  WHERE user_id = p_user_id;

  -- flashcard_data may not exist on very old environments — guard with EXCEPTION.
  BEGIN
    SELECT COUNT(*) INTO v_flash
    FROM public.flashcard_data
    WHERE user_id = p_user_id
      AND status IN ('review', 'mastered');
  EXCEPTION WHEN undefined_table OR undefined_column THEN
    v_flash := 0;
  END;

  v_total := v_hanja + v_flash;

  -- words_learned must monotonically increase (matches site-wide GREATEST rule).
  INSERT INTO public.user_progress (user_id, words_learned, updated_at)
  VALUES (p_user_id, v_total, NOW())
  ON CONFLICT (user_id) DO UPDATE
    SET words_learned = GREATEST(public.user_progress.words_learned, EXCLUDED.words_learned),
        updated_at = NOW();

  RETURN v_total;
END;
$$;

-- ─── 1. Rewrite the migration-108 trigger to use the unified counter ─────────
CREATE OR REPLACE FUNCTION public.sync_user_hanja_progress_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.recompute_user_words_learned(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ─── 2. Add a matching trigger on flashcard_data ─────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_flashcard_words_learned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.recompute_user_words_learned(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_flashcard_data_change ON public.flashcard_data;
CREATE TRIGGER on_flashcard_data_change
AFTER INSERT OR UPDATE OF status OR DELETE ON public.flashcard_data
FOR EACH ROW EXECUTE FUNCTION public.sync_flashcard_words_learned();

-- ─── 3. One-time backfill so existing rows are correct immediately ───────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT user_id FROM (
      SELECT user_id FROM public.user_hanja_progress
      UNION
      SELECT user_id FROM public.flashcard_data
    ) u
  LOOP
    PERFORM public.recompute_user_words_learned(r.user_id);
  END LOOP;
END$$;

-- ─── 4. recompute_my_xp() — user-/admin-callable RPC ─────────────────────────
-- Wraps compute_user_xp + recompute_user_words_learned + leaderboard refresh
-- in a single call so the "Đồng bộ lại" button can fix any drift.
CREATE OR REPLACE FUNCTION public.recompute_my_xp()
RETURNS TABLE (
  xp INTEGER,
  words_learned INTEGER,
  streak_count INTEGER,
  best_score INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_xp INT;
  v_words INT;
  v_best INT := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'recompute_my_xp: must be authenticated';
  END IF;

  -- Recompute words_learned (writes to user_progress with GREATEST).
  v_words := public.recompute_user_words_learned(v_uid);

  -- Recompute best_score from exam_results (valid exams only).
  BEGIN
    SELECT COALESCE(MAX(ROUND((score::FLOAT / NULLIF(total, 0)) * 100))::INT, 0)
    INTO v_best
    FROM public.exam_results
    WHERE user_id = v_uid AND is_valid = true AND total > 0;
  EXCEPTION WHEN undefined_column THEN
    -- Older schemas don't have is_valid; fall back to all rows.
    SELECT COALESCE(MAX(ROUND((score::FLOAT / NULLIF(total, 0)) * 100))::INT, 0)
    INTO v_best
    FROM public.exam_results
    WHERE user_id = v_uid AND total > 0;
  END;

  UPDATE public.user_progress
  SET best_score = GREATEST(COALESCE(best_score, 0), v_best),
      updated_at = NOW()
  WHERE user_id = v_uid;

  -- Then refresh XP via the canonical formula (it already uses GREATEST).
  v_xp := public.compute_user_xp(v_uid);
  UPDATE public.user_progress
  SET xp = GREATEST(COALESCE(xp, 0), v_xp),
      updated_at = NOW()
  WHERE user_id = v_uid;

  RETURN QUERY
  SELECT
    COALESCE(up.xp, 0)            AS xp,
    COALESCE(up.words_learned, 0) AS words_learned,
    COALESCE(up.streak_count, 0)  AS streak_count,
    COALESCE(up.best_score, 0)    AS best_score
  FROM public.user_progress up
  WHERE up.user_id = v_uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.recompute_my_xp() TO authenticated;
