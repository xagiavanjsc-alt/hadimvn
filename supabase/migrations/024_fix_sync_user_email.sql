-- Fix: sync_user_email trigger likely failing during signup
-- This trigger fires AFTER INSERT OR UPDATE OF email on auth.users.
-- We rewrite it defensively so it never blocks signup.

CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    -- Sync email to user_profiles if profile already exists
    UPDATE public.user_profiles
    SET email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'sync_user_email failed: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

-- Re-attach trigger (no-op if already attached, but ensures it uses new function)
DROP TRIGGER IF EXISTS on_auth_user_email_sync ON auth.users;
CREATE TRIGGER on_auth_user_email_sync
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_email();
