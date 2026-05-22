-- Migration 112: Admin-only "recompute all users" RPC
--
-- Replaces the per-user "Đồng bộ lại" button on /leaderboard with an admin
-- panel button. Looping all users client-side would be N round-trips;
-- doing it inside a SECURITY DEFINER function keeps it to one call.

CREATE OR REPLACE FUNCTION public.admin_recompute_all_xp()
RETURNS TABLE (
  users_processed INTEGER,
  duration_ms INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_start  TIMESTAMPTZ := clock_timestamp();
  v_count  INT := 0;
  r        RECORD;
BEGIN
  IF v_caller IS NULL OR NOT public.is_admin_user(v_caller) THEN
    RAISE EXCEPTION 'admin_recompute_all_xp: admin only';
  END IF;

  -- Union of all users who have ANY data we recompute from. Avoids picking
  -- up empty rows from handle_new_user that have no activity yet.
  FOR r IN
    SELECT DISTINCT user_id FROM (
      SELECT user_id FROM public.user_progress
      UNION SELECT user_id FROM public.user_hanja_progress
      UNION SELECT user_id FROM public.flashcard_data
      UNION SELECT user_id FROM public.exam_results
    ) u
    WHERE user_id IS NOT NULL
  LOOP
    PERFORM public.recompute_user_words_learned(r.user_id);
    PERFORM public.recompute_user_streak(r.user_id);

    -- best_score
    UPDATE public.user_progress
    SET best_score = GREATEST(
          COALESCE(best_score, 0),
          COALESCE((
            SELECT MAX(ROUND((score::FLOAT / NULLIF(total, 0)) * 100))::INT
            FROM public.exam_results
            WHERE user_id = r.user_id AND COALESCE(is_valid, true) = true AND total > 0
          ), 0)
        ),
        updated_at = NOW()
    WHERE user_id = r.user_id;

    -- xp via canonical formula (never decreases per migration 037 rule)
    UPDATE public.user_progress
    SET xp = GREATEST(COALESCE(xp, 0), public.compute_user_xp(r.user_id)),
        updated_at = NOW()
    WHERE user_id = r.user_id;

    v_count := v_count + 1;
  END LOOP;

  RETURN QUERY SELECT
    v_count AS users_processed,
    EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start)::INT AS duration_ms;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_recompute_all_xp() TO authenticated;
