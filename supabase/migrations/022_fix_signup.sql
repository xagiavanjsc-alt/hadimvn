-- Fix: "Database error saving new user" during signup
-- Root cause: handle_new_user trigger fails silently when any sub-insert errors,
-- causing the entire auth.users INSERT to rollback.
-- Solution: wrap each insert in exception handler + use ON CONFLICT DO NOTHING.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name TEXT;
BEGIN
  v_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email, 'Học viên');

  -- Insert user profile (idempotent)
  BEGIN
    INSERT INTO public.user_profiles (id, display_name, email)
    VALUES (NEW.id, v_display_name, NEW.email)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: user_profiles insert failed: %', SQLERRM;
  END;

  -- Insert study_progress (idempotent)
  BEGIN
    INSERT INTO public.study_progress (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: study_progress insert failed: %', SQLERRM;
  END;

  -- Insert leaderboard entry (idempotent)
  BEGIN
    INSERT INTO public.leaderboard (user_id, display_name)
    VALUES (NEW.id, v_display_name)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: leaderboard insert failed: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- Ensure trigger still attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also make welcome email trigger non-blocking (in case net.http_post or vault fails)
CREATE OR REPLACE FUNCTION public.trigger_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_name text;
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD IS NULL) THEN
    BEGIN
      v_name := COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        split_part(NEW.email, '@', 1),
        'bạn'
      );
      PERFORM public.send_email(
        'welcome',
        NEW.email,
        jsonb_build_object('USER_NAME', v_name)
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'welcome_email failed: %', SQLERRM;
    END;
  END IF;
  RETURN NEW;
END;
$$;

-- Ensure INSERT policy exists for user_profiles (so future manual inserts work)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
