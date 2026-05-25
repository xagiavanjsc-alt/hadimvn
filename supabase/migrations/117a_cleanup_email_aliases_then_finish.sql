-- ============================================================================
-- 117a_cleanup_email_aliases_then_finish.sql  (v2 — bootstraps from any state)
--
-- Self-contained recovery for migration 117. Run this once in Supabase SQL
-- Editor regardless of how far the original migration got. Idempotent: safe
-- to re-run if interrupted.
--
-- What it does, in order:
--   1. (idempotent) Define normalize_email().
--   2. (idempotent) Add user_profiles.email_normalized column.
--   3. (idempotent) Backfill any NULL email_normalized rows from auth.users.
--   4. Report which +alias profiles will be deleted in step 5 (review only,
--      doesn't change anything).
--   5. Delete the +alias-only siblings that share a canonical email with a
--      non-alias profile. Wrapped in BEGIN/COMMIT so partial failure rolls
--      back cleanly.
--   6. Create the UNIQUE INDEX (now safe — no duplicates left).
--   7. Define is_email_taken() RPC (idempotent).
--   8. Verify: integrity check + RPC smoke test.
--
-- Run each STEP in turn and read the output before moving to the next.
-- ============================================================================

-- ─── STEP 1: Normalization function ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.normalize_email(p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_email  TEXT;
  v_at     INT;
  v_local  TEXT;
  v_domain TEXT;
  v_plus   INT;
BEGIN
  IF p_email IS NULL THEN RETURN NULL; END IF;
  v_email := lower(trim(p_email));
  IF v_email = '' THEN RETURN NULL; END IF;
  v_at := position('@' IN v_email);
  IF v_at < 2 OR v_at = char_length(v_email) THEN RETURN NULL; END IF;
  v_local  := substring(v_email FROM 1 FOR v_at - 1);
  v_domain := substring(v_email FROM v_at + 1);
  v_plus := position('+' IN v_local);
  IF v_plus > 0 THEN
    v_local := substring(v_local FROM 1 FOR v_plus - 1);
  END IF;
  IF v_local = '' THEN RETURN NULL; END IF;
  IF v_domain IN ('gmail.com', 'googlemail.com') THEN
    v_local := replace(v_local, '.', '');
  END IF;
  RETURN v_local || '@' || v_domain;
END;
$$;

GRANT EXECUTE ON FUNCTION public.normalize_email(TEXT) TO anon, authenticated;

-- ─── STEP 2: Column ─────────────────────────────────────────────────────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS email_normalized TEXT;

-- ─── STEP 3: Backfill (only fills NULLs, safe to re-run) ────────────────────
UPDATE public.user_profiles up
SET email_normalized = public.normalize_email(au.email::TEXT)
FROM auth.users au
WHERE up.id = au.id
  AND up.email_normalized IS NULL
  AND au.email IS NOT NULL;

-- ─── STEP 4: REVIEW. What would step 5 delete? Read this before continuing. ─
SELECT
  au.id,
  au.email          AS will_delete_email,
  up.display_name,
  up.is_vip,
  up.created_at,
  up.email_normalized
FROM public.user_profiles up
JOIN auth.users         au ON au.id = up.id
WHERE position('+' IN au.email) > 0
  AND EXISTS (
    SELECT 1
    FROM public.user_profiles sibling
    WHERE sibling.email_normalized = up.email_normalized
      AND sibling.id <> up.id
  )
ORDER BY up.email_normalized, up.created_at;

-- ─── STEP 5: DELETE. Only run after STEP 4's list looks right. ──────────────
BEGIN;

DELETE FROM public.user_profiles
WHERE id IN (
  SELECT up.id
  FROM public.user_profiles up
  JOIN auth.users         au ON au.id = up.id
  WHERE position('+' IN au.email) > 0
    AND EXISTS (
      SELECT 1
      FROM public.user_profiles sibling
      WHERE sibling.email_normalized = up.email_normalized
        AND sibling.id <> up.id
    )
);

DELETE FROM auth.users
WHERE position('+' IN email) > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.id = auth.users.id
  );

COMMIT;

-- ─── STEP 6: Unique index (now safe — no canonical duplicates left). ────────
CREATE UNIQUE INDEX IF NOT EXISTS uniq_user_profiles_email_normalized
  ON public.user_profiles (email_normalized)
  WHERE email_normalized IS NOT NULL;

-- ─── STEP 7: is_email_taken RPC. ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_email_taken(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_norm TEXT;
BEGIN
  v_norm := public.normalize_email(p_email);
  IF v_norm IS NULL THEN RETURN FALSE; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles WHERE email_normalized = v_norm
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_email_taken(TEXT) TO anon, authenticated;

-- ─── STEP 8: Verify. ────────────────────────────────────────────────────────
-- 8a: Should return 0 rows — no canonical duplicates remain.
SELECT email_normalized, COUNT(*)
FROM public.user_profiles
WHERE email_normalized IS NOT NULL
GROUP BY email_normalized
HAVING COUNT(*) > 1;

-- 8b: Should return true, true, false in that order.
SELECT public.is_email_taken('info.choque24h@gmail.com'::TEXT)         AS real_account_blocked,
       public.is_email_taken('info.cho.que24h+test99@gmail.com'::TEXT) AS variant_also_blocked,
       public.is_email_taken('totally-new-user-2026@gmail.com'::TEXT)  AS new_account_allowed;
