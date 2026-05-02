-- Fix: still getting "infinite recursion detected" because old policies from
-- earlier migrations still exist with subqueries that trigger themselves.
-- Solution: drop ALL policies on user_profiles, recreate clean ones using
-- is_admin_user() SECURITY DEFINER helper.

-- ─── Ensure helper exists ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin_user(uid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT up.is_admin INTO result
  FROM public.user_profiles up
  WHERE up.id = uid;
  RETURN COALESCE(result, FALSE);
END;
$$;
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated, anon;

-- ─── Drop EVERY policy on user_profiles ───────────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', r.policyname);
  END LOOP;
END $$;

-- ─── Recreate clean policies (no recursion, no subquery on same table) ────────

-- SELECT: user reads own row
CREATE POLICY "select_own_profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

-- SELECT: admin reads all rows
CREATE POLICY "select_all_profiles_admin"
  ON public.user_profiles FOR SELECT
  USING (public.is_admin_user(auth.uid()));

-- INSERT: user inserts own row
CREATE POLICY "insert_own_profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: user updates own row
CREATE POLICY "update_own_profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- UPDATE: admin updates any row
CREATE POLICY "update_all_profiles_admin"
  ON public.user_profiles FOR UPDATE
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- DELETE: admin deletes any row (rare; user cannot delete self via RLS)
CREATE POLICY "delete_profiles_admin"
  ON public.user_profiles FOR DELETE
  USING (public.is_admin_user(auth.uid()));

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
