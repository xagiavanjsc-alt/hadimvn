-- Fix: Users can update their own profile (display_name, avatar_url)
-- Also fix: Add SELECT policies and admin_get_users RPC for admin roles page
-- This fixes the issue where admin roles page shows all admins as "super_admin"

-- ─── SELECT policies ──────────────────────────────────────────────────────────
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

-- ─── UPDATE policies ──────────────────────────────────────────────────────────
-- Drop existing policy if exists (for idempotency)
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

-- Create policy for users to update their own profile (display_name, avatar_url)
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      (display_name IS NOT NULL OR avatar_url IS NOT NULL)
      OR
      (updated_at IS NOT NULL)
    )
  );

-- Recreate admin policy for full access
CREATE POLICY "Admins can update all profiles"
  ON public.user_profiles FOR UPDATE
  USING (
    (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()) = TRUE
  )
  WITH CHECK (
    (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()) = TRUE
  );

-- Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ─── RPC: admin_get_users ─────────────────────────────────────────────────────
-- Security definer function so admin can read all user profiles bypassing RLS
-- Drop first because return type changed (added user_role column)
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
