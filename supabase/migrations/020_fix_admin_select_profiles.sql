-- Fix: Admin cannot see users list because no SELECT policy on user_profiles
-- This adds SELECT policies so admin pages work again

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.user_profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.user_profiles FOR SELECT
  USING (
    (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()) = TRUE
  );

-- ─── RPC: admin_get_users (with user_role) ────────────────────────────────────
-- Drop first because return type may have changed
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
DECLARE
  caller_is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO caller_is_admin
  FROM public.user_profiles
  WHERE id = auth.uid();

  IF caller_is_admin IS NOT TRUE THEN
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
