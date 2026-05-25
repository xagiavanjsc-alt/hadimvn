-- ============================================================================
-- 115_ctv_no_self_refer.sql
--
-- Threat: A CTV inserts a commission row with referred_user_id = their own
-- user_id (i.e. the CTV refers themselves) and earns commission on their own
-- VIP purchase. Even with RLS in place, the commission flow runs in a
-- SECURITY DEFINER path triggered by VIP-payment approval, so the CTV doesn't
-- need direct INSERT — they just have to point their own ref_code at their
-- own account during signup.
--
-- Mitigation:
--   1. BEFORE INSERT/UPDATE trigger on ctv_commissions rejects any row where
--      referred_user_id matches the user_id of the ctv_id's profile.
--   2. Backfill audit query (commented) to surface pre-existing self-refer
--      rows for manual review — do NOT auto-delete; might be legitimate
--      bookkeeping that needs admin attention.
--
-- Forward-only — does not retroactively clean existing rows, only blocks new
-- ones. Run the audit query in supabase/audit/ctv_self_refer.sql (or inline
-- below) before/after deploying.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_ctv_no_self_refer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ctv_user_id UUID;
BEGIN
  IF NEW.referred_user_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT user_id INTO v_ctv_user_id
  FROM public.ctv_profiles
  WHERE id = NEW.ctv_id;

  IF v_ctv_user_id IS NOT NULL AND v_ctv_user_id = NEW.referred_user_id THEN
    RAISE EXCEPTION 'CTV cannot earn commission on self-referral (ctv_id=%, user_id=%)',
      NEW.ctv_id, NEW.referred_user_id
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ctv_no_self_refer ON public.ctv_commissions;

CREATE TRIGGER trg_ctv_no_self_refer
  BEFORE INSERT OR UPDATE OF ctv_id, referred_user_id
  ON public.ctv_commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_ctv_no_self_refer();

-- ─── Audit: existing self-refer rows (run manually) ─────────────────────────
-- SELECT c.id, c.ctv_id, c.referred_user_id, c.commission_amount, c.status,
--        c.created_at, p.display_name AS ctv_name
-- FROM public.ctv_commissions c
-- JOIN public.ctv_profiles p ON p.id = c.ctv_id
-- WHERE p.user_id = c.referred_user_id
-- ORDER BY c.created_at DESC;
