-- ============================================================================
-- 117_email_normalization.sql
--
-- Closes the Gmail dot/+alias abuse vector: nguyenvana@gmail.com,
-- nguyen.van.a@gmail.com, n.g.u.y.e.n.v.a.n.a+ctv@gmail.com all route to the
-- same Gmail inbox. Until now, each was a separate Supabase auth user and
-- got its own user_profiles row, so a single attacker could farm CTV
-- commissions, coupon "first user" bonuses, or fake leaderboard slots.
--
-- Strategy: store a `email_normalized` column on user_profiles with a UNIQUE
-- index. For Gmail we strip dots from the local part and drop +suffix; for
-- other providers we only drop +suffix (those don't dedup on dots). The
-- client computes and writes the value during signup/profile creation, and
-- a public RPC `is_email_taken(email)` lets the signup UI pre-check before
-- it hits supabase.auth.signUp.
--
-- Limitation: this is enforced via DB unique index, not as a constraint on
-- auth.users itself (Supabase-managed schema). An attacker who calls the
-- auth API directly can still create an auth.users row; they just won't get
-- a user_profiles row → no leaderboard, no XP, no VIP, no CTV credit. That
-- is the desired outcome — the auth user exists but is effectively inert.
-- ============================================================================

-- ─── 1. Normalization function ──────────────────────────────────────────────
-- Pure: trims, lowercases, strips +alias, strips dots for gmail.com /
-- googlemail.com. Returns NULL on empty/malformed input.
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

  -- Strip +suffix (Gmail, Outlook, Yahoo all honour +addressing).
  v_plus := position('+' IN v_local);
  IF v_plus > 0 THEN
    v_local := substring(v_local FROM 1 FOR v_plus - 1);
  END IF;

  IF v_local = '' THEN RETURN NULL; END IF;

  -- Gmail / Google domain: dots in local part are ignored by the provider.
  IF v_domain IN ('gmail.com', 'googlemail.com') THEN
    v_local := replace(v_local, '.', '');
  END IF;

  RETURN v_local || '@' || v_domain;
END;
$$;

GRANT EXECUTE ON FUNCTION public.normalize_email(TEXT) TO anon, authenticated;

-- ─── 2. email_normalized column + backfill ──────────────────────────────────
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS email_normalized TEXT;

-- Backfill from auth.users for everyone who already has a profile.
UPDATE public.user_profiles up
SET email_normalized = public.normalize_email(au.email)
FROM auth.users au
WHERE up.id = au.id
  AND up.email_normalized IS NULL
  AND au.email IS NOT NULL;

-- Unique index (NULL-tolerant: pre-migration rows without a known email stay
-- inert, future rows must be unique). If the backfill surfaces an existing
-- collision (same Gmail inbox already registered twice), this index will
-- fail to build — that's a signal to merge those accounts manually before
-- re-running. See `supabase/audit/email_normalized_collisions.sql`.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_user_profiles_email_normalized
  ON public.user_profiles (email_normalized)
  WHERE email_normalized IS NOT NULL;

-- ─── 3. Public RPC: is_email_taken ──────────────────────────────────────────
-- Used by the signup UI to refuse a duplicate before it ever hits
-- supabase.auth.signUp. SECURITY DEFINER because it needs to read
-- user_profiles past RLS.
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
