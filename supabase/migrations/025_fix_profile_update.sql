-- Fix: User updates display_name but it doesn't persist after reload.
-- Root cause: complex WITH CHECK on UPDATE policy may silently block the update,
-- and client-side state update happens but DB write rejected.
-- Solution: simplify UPDATE policy to just allow user updating their own row.

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin update policy: use is_admin_user helper to avoid recursion
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.user_profiles FOR UPDATE
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
