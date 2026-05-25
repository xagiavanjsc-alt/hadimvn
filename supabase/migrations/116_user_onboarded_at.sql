-- ============================================================================
-- 116_user_onboarded_at.sql
--
-- Adds onboarded_at to user_profiles so OnboardingGate can be DB-driven
-- (instead of localStorage, which is per-browser/per-device and was leaving
-- new signups on the home page when the email-confirm magic link opened in
-- a different storage partition — e.g. incognito vs regular, or phone vs
-- desktop).
--
-- Semantics:
--   * NULL  → user has never completed the onboarding quiz; gate forces
--             /onboarding on next authenticated render.
--   * NOT NULL → user completed onboarding at that timestamp; gate stays out.
--
-- Existing users: backfilled to created_at (treated as already onboarded).
-- This prevents the 30+ live users from being yanked into /onboarding on
-- their next login.
-- ============================================================================

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

-- Backfill: grandfather everyone who already has a profile. We use created_at
-- (the row's own timestamp) so the value is meaningful, not just a sentinel.
UPDATE public.user_profiles
SET onboarded_at = created_at
WHERE onboarded_at IS NULL;

-- RLS: existing user_profiles policies already cover this column (SELECT/UPDATE
-- of own row). No new policies needed.
