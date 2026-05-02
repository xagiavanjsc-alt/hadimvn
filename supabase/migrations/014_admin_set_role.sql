-- =====================================================
-- Ensure user_role column + RLS policy for admin updates
-- This is a safe, idempotent migration in case 005 was missed.
-- =====================================================

-- 1. Ensure column exists
ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'member';

-- Backfill
UPDATE public.user_profiles
SET user_role = CASE WHEN is_admin = TRUE THEN 'super_admin' ELSE 'member' END
WHERE user_role IS NULL;

-- Valid role check
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS valid_user_role;
ALTER TABLE public.user_profiles
    ADD CONSTRAINT valid_user_role
    CHECK (user_role IN ('super_admin', 'smod', 'moderator', 'member'));

-- 2. Drop and recreate admin update policy (avoids RLS self-reference issues)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

CREATE POLICY "Admins can update all profiles"
    ON public.user_profiles FOR UPDATE
    USING (
        (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()) = TRUE
    )
    WITH CHECK (
        (SELECT is_admin FROM public.user_profiles WHERE id = auth.uid()) = TRUE
    );

-- 3. Create a SECURITY DEFINER function as fallback
-- This runs with the function owner's privileges, bypassing RLS.
-- Only verified admins can call it.
CREATE OR REPLACE FUNCTION public.admin_set_user_role(
    target_user_id UUID,
    new_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    caller_is_admin BOOLEAN;
    result_row public.user_profiles%ROWTYPE;
BEGIN
    -- Verify caller is admin
    SELECT is_admin INTO caller_is_admin
    FROM public.user_profiles
    WHERE id = auth.uid();

    IF caller_is_admin IS NOT TRUE THEN
        RETURN jsonb_build_object('error', 'Not authorized: caller is not admin');
    END IF;

    IF new_role NOT IN ('super_admin', 'smod', 'moderator', 'member') THEN
        RETURN jsonb_build_object('error', 'Invalid role');
    END IF;

    -- Update
    UPDATE public.user_profiles
    SET 
        user_role = new_role,
        is_admin = (new_role IN ('super_admin', 'smod')),
        updated_at = NOW()
    WHERE id = target_user_id
    RETURNING * INTO result_row;

    IF result_row.id IS NULL THEN
        RETURN jsonb_build_object('error', 'User not found');
    END IF;

    RETURN jsonb_build_object(
        'success', TRUE,
        'user_id', result_row.id,
        'user_role', result_row.user_role,
        'is_admin', result_row.is_admin
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_role(UUID, TEXT) TO authenticated;
