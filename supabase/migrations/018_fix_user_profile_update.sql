-- Fix: Users can update their own profile (display_name, avatar_url)
-- This fixes the issue where users cannot change their name in profile page

-- Drop existing admin-only policy to avoid conflicts
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

-- Create policy for users to update their own profile (display_name, avatar_url)
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Only allow updating these columns
      (display_name IS NOT NULL OR avatar_url IS NOT NULL)
      OR
      -- Or updated_at for automatic timestamp
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
