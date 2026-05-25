-- ─── Audit: email_normalized collisions ─────────────────────────────────────
-- Pre-flight check before applying migration 117. Returns groups of profiles
-- whose emails resolve to the same Gmail inbox (dots/+alias ignored). If
-- any rows come back, the unique index in migration 117 will FAIL to build
-- until you merge or disable the duplicates manually.
--
-- Standalone: inlines the normalize_email() logic so this can run BEFORE
-- the migration. After the migration has been applied at least once, you
-- can substitute `public.normalize_email(au.email::TEXT)` for the same
-- result.
--
-- Expected on a healthy DB: 0 rows.

WITH parsed AS (
  SELECT
    up.id,
    up.display_name,
    up.is_vip,
    up.created_at,
    au.email AS raw_email,
    lower(trim(au.email::TEXT)) AS lowered
  FROM public.user_profiles up
  JOIN auth.users au ON au.id = up.id
  WHERE au.email IS NOT NULL
),
split AS (
  SELECT
    p.*,
    split_part(p.lowered, '@', 1) AS local_raw,
    split_part(p.lowered, '@', 2) AS domain
  FROM parsed p
  WHERE p.lowered LIKE '%@%'
),
no_plus AS (
  SELECT
    s.*,
    CASE
      WHEN position('+' IN s.local_raw) > 0
        THEN substring(s.local_raw FROM 1 FOR position('+' IN s.local_raw) - 1)
      ELSE s.local_raw
    END AS local_no_plus
  FROM split s
),
canonical AS (
  SELECT
    n.id, n.display_name, n.is_vip, n.created_at, n.raw_email,
    (
      CASE
        WHEN n.domain IN ('gmail.com', 'googlemail.com')
          THEN replace(n.local_no_plus, '.', '')
        ELSE n.local_no_plus
      END
      || '@' || n.domain
    ) AS canonical_email
  FROM no_plus n
  WHERE n.local_no_plus <> ''
)
SELECT
  canonical_email,
  COUNT(*) AS dup_count,
  array_agg(id           ORDER BY created_at) AS profile_ids,
  array_agg(raw_email    ORDER BY created_at) AS raw_emails,
  array_agg(display_name ORDER BY created_at) AS display_names,
  array_agg(is_vip       ORDER BY created_at) AS vip_flags,
  array_agg(created_at   ORDER BY created_at) AS created_ats
FROM canonical
GROUP BY canonical_email
HAVING COUNT(*) > 1
ORDER BY dup_count DESC, canonical_email;
