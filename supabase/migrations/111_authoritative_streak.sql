-- Migration 111: Server-authoritative streak computation
--
-- Until now, `user_progress.streak_count` was whatever the client wrote in
-- via upsert (from localStorage `hanja_streak`). The XP formula then
-- multiplied that number by streak_weight, so a user editing localStorage
-- could inflate their leaderboard XP without doing any work.
--
-- This migration moves streak to the same model already used for XP and
-- words_learned: a SQL function computes it from authoritative DB data
-- (exam_results, user_hanja_progress, flashcard_data), and triggers on
-- those tables keep `user_progress.streak_count` in sync. Client upserts
-- to streak_count are now harmless (overwritten by the next activity) and
-- can be removed at leisure.
--
-- An "active day" means at least one learning event from any source on
-- that local-server date. Community/login alone are intentionally NOT
-- counted to avoid streak-farming via spam.

-- ─── 1. Compute streak from authoritative activity tables ────────────────────
CREATE OR REPLACE FUNCTION public.compute_user_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_check DATE;
  v_streak INT := 0;
  v_active BOOLEAN;
BEGIN
  -- Build the union of all activity dates once via a CTE-free temp expression.
  -- Active today? If not, allow one-day grace (yesterday still counts as the
  -- end of the streak — same UX as the client `calcStreak`).
  WITH active_days AS (
    SELECT taken_at::DATE AS d FROM public.exam_results WHERE user_id = p_user_id
    UNION
    SELECT learned_at::DATE FROM public.user_hanja_progress WHERE user_id = p_user_id
    UNION
    SELECT last_reviewed_at::DATE FROM public.flashcard_data
      WHERE user_id = p_user_id AND last_reviewed_at IS NOT NULL
  )
  SELECT EXISTS (SELECT 1 FROM active_days WHERE d = v_today) INTO v_active;

  IF v_active THEN
    v_check := v_today;
  ELSE
    v_check := v_today - INTERVAL '1 day';
    -- If yesterday also missing, streak is 0.
    WITH active_days AS (
      SELECT taken_at::DATE AS d FROM public.exam_results WHERE user_id = p_user_id
      UNION
      SELECT learned_at::DATE FROM public.user_hanja_progress WHERE user_id = p_user_id
      UNION
      SELECT last_reviewed_at::DATE FROM public.flashcard_data
        WHERE user_id = p_user_id AND last_reviewed_at IS NOT NULL
    )
    SELECT EXISTS (SELECT 1 FROM active_days WHERE d = v_check) INTO v_active;
    IF NOT v_active THEN RETURN 0; END IF;
  END IF;

  -- Walk back consecutive active days. Bound at 365 to defang any pathological
  -- data and keep this function's worst case predictable.
  LOOP
    WITH active_days AS (
      SELECT taken_at::DATE AS d FROM public.exam_results WHERE user_id = p_user_id
      UNION
      SELECT learned_at::DATE FROM public.user_hanja_progress WHERE user_id = p_user_id
      UNION
      SELECT last_reviewed_at::DATE FROM public.flashcard_data
        WHERE user_id = p_user_id AND last_reviewed_at IS NOT NULL
    )
    SELECT EXISTS (SELECT 1 FROM active_days WHERE d = v_check) INTO v_active;

    EXIT WHEN NOT v_active;
    v_streak := v_streak + 1;
    v_check := v_check - INTERVAL '1 day';
    EXIT WHEN v_streak >= 365;
  END LOOP;

  RETURN v_streak;
END;
$$;

-- ─── 2. Cache to user_progress so compute_user_xp() stays cheap ──────────────
CREATE OR REPLACE FUNCTION public.recompute_user_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak INT;
BEGIN
  v_streak := public.compute_user_streak(p_user_id);
  INSERT INTO public.user_progress (user_id, streak_count, updated_at)
  VALUES (p_user_id, v_streak, NOW())
  ON CONFLICT (user_id) DO UPDATE
    SET streak_count = EXCLUDED.streak_count,
        updated_at   = NOW();
  RETURN v_streak;
END;
$$;

-- ─── 3. Wire triggers — same pattern as words_learned in migration 110 ───────
CREATE OR REPLACE FUNCTION public.sync_streak_from_activity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.recompute_user_streak(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- exam_results: streak updates on new/changed/removed exam rows
DROP TRIGGER IF EXISTS on_exam_results_streak_sync ON public.exam_results;
CREATE TRIGGER on_exam_results_streak_sync
AFTER INSERT OR UPDATE OF taken_at OR DELETE ON public.exam_results
FOR EACH ROW EXECUTE FUNCTION public.sync_streak_from_activity();

-- user_hanja_progress: same
DROP TRIGGER IF EXISTS on_hanja_progress_streak_sync ON public.user_hanja_progress;
CREATE TRIGGER on_hanja_progress_streak_sync
AFTER INSERT OR UPDATE OF learned_at OR DELETE ON public.user_hanja_progress
FOR EACH ROW EXECUTE FUNCTION public.sync_streak_from_activity();

-- flashcard_data: only when last_reviewed_at moves
DROP TRIGGER IF EXISTS on_flashcard_data_streak_sync ON public.flashcard_data;
CREATE TRIGGER on_flashcard_data_streak_sync
AFTER INSERT OR UPDATE OF last_reviewed_at OR DELETE ON public.flashcard_data
FOR EACH ROW EXECUTE FUNCTION public.sync_streak_from_activity();

-- ─── 4. One-time backfill so existing rows are authoritative immediately ─────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT DISTINCT user_id FROM (
      SELECT user_id FROM public.exam_results
      UNION SELECT user_id FROM public.user_hanja_progress
      UNION SELECT user_id FROM public.flashcard_data
      UNION SELECT user_id FROM public.user_progress
    ) u
  LOOP
    PERFORM public.recompute_user_streak(r.user_id);
  END LOOP;
END$$;

-- ─── 5. Update recompute_my_xp() to also refresh streak ──────────────────────
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
  v_streak INT;
  v_best INT := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'recompute_my_xp: must be authenticated';
  END IF;

  v_words  := public.recompute_user_words_learned(v_uid);
  v_streak := public.recompute_user_streak(v_uid);

  BEGIN
    SELECT COALESCE(MAX(ROUND((score::FLOAT / NULLIF(total, 0)) * 100))::INT, 0)
    INTO v_best
    FROM public.exam_results
    WHERE user_id = v_uid AND is_valid = true AND total > 0;
  EXCEPTION WHEN undefined_column THEN
    SELECT COALESCE(MAX(ROUND((score::FLOAT / NULLIF(total, 0)) * 100))::INT, 0)
    INTO v_best
    FROM public.exam_results
    WHERE user_id = v_uid AND total > 0;
  END;

  UPDATE public.user_progress
  SET best_score = GREATEST(COALESCE(best_score, 0), v_best),
      updated_at = NOW()
  WHERE user_id = v_uid;

  v_xp := public.compute_user_xp(v_uid);
  UPDATE public.user_progress
  SET xp = GREATEST(COALESCE(xp, 0), v_xp),
      updated_at = NOW()
  WHERE user_id = v_uid;

  RETURN QUERY
  SELECT
    COALESCE(up.xp, 0),
    COALESCE(up.words_learned, 0),
    COALESCE(up.streak_count, 0),
    COALESCE(up.best_score, 0)
  FROM public.user_progress up
  WHERE up.user_id = v_uid;
END;
$$;
