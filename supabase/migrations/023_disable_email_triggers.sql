-- Fix: "Database error saving new user" - email trigger likely failing because
-- vault.create_secret / net.http_post / app.supabase_url not configured.
-- Disable the welcome email trigger on auth.users until email service is ready.
-- (Other emails triggered from public.* tables are kept.)

DROP TRIGGER IF EXISTS on_auth_user_welcome ON auth.users;

-- Also make send_email completely non-throwing in case it is called elsewhere
CREATE OR REPLACE FUNCTION public.send_email(
  p_template text,
  p_to text,
  p_variables jsonb DEFAULT '{}'::jsonb
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url text;
  v_secret text;
  v_request_id bigint;
BEGIN
  BEGIN
    v_url := current_setting('app.supabase_url', true);
  EXCEPTION WHEN OTHERS THEN v_url := NULL;
  END;

  BEGIN
    v_secret := current_setting('app.internal_secret', true);
  EXCEPTION WHEN OTHERS THEN v_secret := NULL;
  END;

  IF v_url IS NULL OR v_secret IS NULL OR p_to IS NULL OR p_to = '' THEN
    RETURN NULL;
  END IF;

  BEGIN
    SELECT net.http_post(
      url := v_url || '/functions/v1/send-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-internal-secret', v_secret
      ),
      body := jsonb_build_object(
        'template', p_template,
        'to', p_to,
        'variables', p_variables
      )
    ) INTO v_request_id;
    RETURN v_request_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'send_email http_post failed: %', SQLERRM;
    RETURN NULL;
  END;
END;
$$;

-- Re-verify user_profile signup trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
