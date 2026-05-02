-- Fix critical privilege escalation: smod could demote super_admin via admin_set_user_role.
-- Enforce hierarchy:
--   super_admin → can assign any role to anyone
--   smod        → can assign moderator/member only, CANNOT touch super_admin or other smods
--   moderator   → CANNOT call this RPC (read-only access in admin panel)
--   member      → CANNOT call this RPC

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
    caller_role TEXT;
    target_role TEXT;
    result_row public.user_profiles%ROWTYPE;
BEGIN
    -- Get caller's role
    SELECT user_role INTO caller_role
    FROM public.user_profiles
    WHERE id = auth.uid();

    IF caller_role IS NULL THEN
        RETURN jsonb_build_object('error', 'Not authenticated');
    END IF;

    -- Only super_admin and smod can manage roles
    IF caller_role NOT IN ('super_admin', 'smod') THEN
        RETURN jsonb_build_object('error', 'Bạn không có quyền phân quyền');
    END IF;

    -- Validate new_role value
    IF new_role NOT IN ('super_admin', 'smod', 'moderator', 'member') THEN
        RETURN jsonb_build_object('error', 'Vai trò không hợp lệ');
    END IF;

    -- Get target's current role to enforce hierarchy
    SELECT user_role INTO target_role
    FROM public.user_profiles
    WHERE id = target_user_id;

    IF target_role IS NULL THEN
        RETURN jsonb_build_object('error', 'Không tìm thấy người dùng');
    END IF;

    -- Cannot modify yourself
    IF target_user_id = auth.uid() THEN
        RETURN jsonb_build_object('error', 'Bạn không thể tự thay đổi vai trò của mình');
    END IF;

    -- SMod restrictions:
    --   - cannot touch super_admin (target)
    --   - cannot touch other smods (target)
    --   - cannot promote anyone to super_admin or smod (new_role)
    IF caller_role = 'smod' THEN
        IF target_role IN ('super_admin', 'smod') THEN
            RETURN jsonb_build_object('error', 'SMod không thể thay đổi vai trò của Super Admin hoặc SMod khác');
        END IF;
        IF new_role IN ('super_admin', 'smod') THEN
            RETURN jsonb_build_object('error', 'SMod chỉ có thể cấp vai trò Moderator hoặc Thành viên');
        END IF;
    END IF;

    -- super_admin: full power, no extra checks needed (already validated above)

    -- Apply update
    UPDATE public.user_profiles
    SET
        user_role = new_role,
        is_admin = (new_role IN ('super_admin', 'smod', 'moderator')),
        updated_at = NOW()
    WHERE id = target_user_id
    RETURNING * INTO result_row;

    IF result_row.id IS NULL THEN
        RETURN jsonb_build_object('error', 'Cập nhật thất bại');
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
