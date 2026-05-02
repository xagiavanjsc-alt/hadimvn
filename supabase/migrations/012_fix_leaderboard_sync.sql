-- =====================================================
-- Fix leaderboard sync: display_name, avatar, VIP status
-- =====================================================

-- 1. Add missing columns to leaderboard (VIP status + avatar)
ALTER TABLE public.leaderboard
    ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS vip_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Update existing sync trigger to also pull avatar_url, is_vip, vip_expires_at from user_profiles
CREATE OR REPLACE FUNCTION public.sync_leaderboard_from_user_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_display_name TEXT;
    v_avatar_url TEXT;
    v_is_vip BOOLEAN;
    v_vip_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT display_name, avatar_url, is_vip, vip_expires_at
    INTO v_display_name, v_avatar_url, v_is_vip, v_vip_expires_at
    FROM public.user_profiles
    WHERE id = NEW.user_id;

    INSERT INTO public.leaderboard (user_id, display_name, avatar_url, xp, streak, best_score, words_learned, level, is_vip, vip_expires_at, updated_at)
    VALUES (
        NEW.user_id,
        COALESCE(v_display_name, 'Học viên'),
        v_avatar_url,
        NEW.xp,
        NEW.streak_count,
        NEW.best_score,
        NEW.words_learned,
        NEW.level,
        COALESCE(v_is_vip, FALSE),
        v_vip_expires_at,
        NEW.updated_at
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        display_name = COALESCE(v_display_name, public.leaderboard.display_name),
        avatar_url = v_avatar_url,
        xp = NEW.xp,
        streak = NEW.streak_count,
        best_score = NEW.best_score,
        words_learned = NEW.words_learned,
        level = NEW.level,
        is_vip = COALESCE(v_is_vip, FALSE),
        vip_expires_at = v_vip_expires_at,
        updated_at = NEW.updated_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. New trigger: when user_profiles changes (display_name, avatar_url, is_vip), sync to leaderboard
CREATE OR REPLACE FUNCTION public.sync_leaderboard_from_user_profiles()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.leaderboard
    SET 
        display_name = NEW.display_name,
        avatar_url = NEW.avatar_url,
        is_vip = COALESCE(NEW.is_vip, FALSE),
        vip_expires_at = NEW.vip_expires_at,
        updated_at = NOW()
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_leaderboard_profile ON public.user_profiles;
CREATE TRIGGER trg_sync_leaderboard_profile
    AFTER UPDATE OF display_name, avatar_url, is_vip, vip_expires_at ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_leaderboard_from_user_profiles();

-- 4. Backfill existing leaderboard entries with current user_profiles data
UPDATE public.leaderboard l
SET 
    display_name = up.display_name,
    avatar_url = up.avatar_url,
    is_vip = COALESCE(up.is_vip, FALSE),
    vip_expires_at = up.vip_expires_at
FROM public.user_profiles up
WHERE l.user_id = up.id;
