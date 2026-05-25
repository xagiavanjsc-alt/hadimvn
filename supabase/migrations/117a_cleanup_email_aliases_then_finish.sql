-- ============================================================================
-- 117a_cleanup_email_aliases_then_finish.sql
--
-- Run AFTER migration 117 if the UNIQUE INDEX step failed due to existing
-- duplicate canonical emails (Gmail dot/+alias variants of the same inbox
-- already registered as separate auth users).
--
-- Strategy: nuke any auth user whose email contains '+' when there is at
-- least one other profile sharing the same canonical email. Those are
-- alias-only signups (testing artifacts or abuse), never the real owner —
-- a real human signs up with their bare address, not +tag99. The non-alias
-- siblings are preserved.
--
-- Run each STEP separately and read the output before moving on.
-- ============================================================================

-- ─── STEP 1: REVIEW. Confirm the list before deleting anything. ─────────────
-- Returns every +alias profile that has a non-alias sibling routing to the
-- same Gmail inbox. These are the rows about to be deleted in STEP 2.
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

-- ─── STEP 2: DELETE. Only run after STEP 1's list looks right. ──────────────
-- Wrapped in a transaction so a failure in either DELETE rolls back both.
-- auth.users → user_profiles foreign key cascades, but we delete the profile
-- first defensively in case the cascade isn't configured ON DELETE.
BEGIN;

DELETE FROM public.user_profiles up
WHERE position('+' IN (
        SELECT au.email FROM auth.users au WHERE au.id = up.id
      )) > 0
  AND EXISTS (
    SELECT 1
    FROM public.user_profiles sibling
    WHERE sibling.email_normalized = up.email_normalized
      AND sibling.id <> up.id
  );

DELETE FROM auth.users
WHERE position('+' IN email) > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles up WHERE up.id = auth.users.id
  );

COMMIT;

-- ─── STEP 3: Build the unique index that previously failed. ─────────────────
CREATE UNIQUE INDEX IF NOT EXISTS uniq_user_profiles_email_normalized
  ON public.user_profiles (email_normalized)
  WHERE email_normalized IS NOT NULL;

-- ─── STEP 4: Create the RPC if migration 117 halted before this point. ──────
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

-- ─── STEP 5: Verify. Should return 0 rows. ──────────────────────────────────
SELECT email_normalized, COUNT(*)
FROM public.user_profiles
WHERE email_normalized IS NOT NULL
GROUP BY email_normalized
HAVING COUNT(*) > 1;

-- ─── STEP 6: Smoke-test the RPC. Returns true for the existing real account. ─
SELECT public.is_email_taken('info.choque24h@gmail.com'::TEXT) AS real_account_blocked,
       public.is_email_taken('info.cho.que24h+test99@gmail.com'::TEXT) AS variant_also_blocked,
       public.is_email_taken('totally-new-user@gmail.com'::TEXT) AS new_account_allowed;
