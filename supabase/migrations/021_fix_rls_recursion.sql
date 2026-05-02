-- Fix: infinite recursion in RLS policy + ambiguous column in admin_get_users
-- Root cause: policy "Admins can read all profiles" queried user_profiles itself,
-- triggering the same policy recursively. Solution: wrap check in SECURITY DEFINER
-- function which bypasses RLS.

-- ─── Helper function: is_admin_user (bypass RLS) ──────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin_user(uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT up.is_admin INTO result
  FROM public.user_profiles up
  WHERE up.id = uid;
  RETURN COALESCE(result, FALSE);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated, anon;

-- ─── Fix SELECT policies (no recursion) ───────────────────────────────────────
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.user_profiles FOR SELECT
  USING (public.is_admin_user(auth.uid()));

-- ─── Fix RPC admin_get_users (resolve ambiguous is_admin) ─────────────────────
DROP FUNCTION IF EXISTS public.admin_get_users();

CREATE FUNCTION public.admin_get_users()
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  is_vip BOOLEAN,
  vip_type TEXT,
  vip_expires_at TIMESTAMPTZ,
  is_admin BOOLEAN,
  user_role TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use helper function to avoid ambiguous column reference
  IF NOT public.is_admin_user(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized: caller is not admin';
  END IF;

  RETURN QUERY
  SELECT
    up.id,
    up.display_name,
    up.email,
    up.avatar_url,
    up.is_vip,
    up.vip_type,
    up.vip_expires_at,
    up.is_admin,
    up.user_role,
    up.created_at,
    up.updated_at
  FROM public.user_profiles up
  ORDER BY up.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_users() TO authenticated;
