-- =====================================================
-- Add user_role column to user_profiles
-- Allows granular role management (super_admin, moderator, member)
-- alongside existing is_admin boolean for backward compat.
-- =====================================================

-- Add user_role column with default derived from is_admin
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'member';

-- Backfill: set existing admins to super_admin role
UPDATE public.user_profiles
SET user_role = CASE
  WHEN is_admin = TRUE THEN 'super_admin'
  ELSE 'member'
END
WHERE user_role IS NULL OR user_role = 'member' AND is_admin = TRUE;

-- Add check constraint for valid roles
ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS valid_user_role;
ALTER TABLE public.user_profiles
ADD CONSTRAINT valid_user_role
CHECK (user_role IN ('super_admin', 'moderator', 'member'));

-- Admin can update any user's role (needed for admin roles page)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;
CREATE POLICY "Admins can update all profiles"
    ON public.user_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(user_role);
