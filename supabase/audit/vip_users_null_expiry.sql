-- ─── Audit: VIP users with NULL expiry ──────────────────────────────────────
-- Purpose: Detect users marked is_vip=true but with vip_expires_at IS NULL.
-- Such rows represent VIP grants that bypass the normal admin-grant-vip flow
-- (which always sets vip_expires_at). They are "permanent VIP" by accident
-- and never get cleaned up by vip-expiry-scheduler.
--
-- How to run:
--   Supabase Studio → SQL Editor → paste this file → Run.
--
-- Expected result on a healthy DB: 0 rows.
-- If rows are returned: investigate each manually before bulk-fixing.

SELECT
  up.id              AS user_id,
  up.display_name,
  up.email,
  up.is_vip,
  up.vip_type,
  up.vip_expires_at,
  up.created_at,
  up.updated_at
FROM public.user_profiles up
WHERE up.is_vip = TRUE
  AND up.vip_expires_at IS NULL
ORDER BY up.updated_at DESC NULLS LAST;

-- ─── Quick counts by vip_type (for context) ─────────────────────────────────
SELECT
  vip_type,
  COUNT(*) FILTER (WHERE is_vip = TRUE AND vip_expires_at IS NULL) AS null_expiry_count,
  COUNT(*) FILTER (WHERE is_vip = TRUE AND vip_expires_at IS NOT NULL) AS normal_count,
  COUNT(*) FILTER (WHERE is_vip = TRUE AND vip_expires_at < NOW()) AS expired_but_not_cleared
FROM public.user_profiles
GROUP BY vip_type
ORDER BY vip_type;
