-- Fix: Moderator should also have is_admin = TRUE
-- This ensures moderator can access admin panel

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

    -- Update - moderator now also gets is_admin = TRUE
    UPDATE public.user_profiles
    SET 
        user_role = new_role,
        is_admin = (new_role IN ('super_admin', 'smod', 'moderator')),
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

-- Also update existing moderators to have is_admin = TRUE
UPDATE public.user_profiles
SET is_admin = TRUE
WHERE user_role = 'moderator' AND is_admin = FALSE;
