-- ─── Audit: email_normalized collisions ─────────────────────────────────────
-- Run this in Supabase Studio BEFORE applying migration 117 if the unique
-- index build fails. Returns groups of profiles that resolve to the same
-- normalized email — i.e. the same Gmail inbox already signed up multiple
-- times. Merge / disable the extras manually before retrying the migration.
--
-- The migration's UPDATE backfill runs even on collision; it's only the
-- UNIQUE INDEX creation that aborts. After cleanup, re-run the migration.

SELECT
  public.normalize_email(au.email) AS canonical_email,
  COUNT(*) AS dup_count,
  array_agg(up.id ORDER BY up.created_at) AS profile_ids,
  array_agg(au.email ORDER BY up.created_at) AS raw_emails,
  array_agg(up.display_name ORDER BY up.created_at) AS display_names,
  array_agg(up.is_vip ORDER BY up.created_at) AS vip_flags,
  array_agg(up.created_at ORDER BY up.created_at) AS created_ats
FROM public.user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email IS NOT NULL
GROUP BY public.normalize_email(au.email)
HAVING COUNT(*) > 1
ORDER BY dup_count DESC, canonical_email;
