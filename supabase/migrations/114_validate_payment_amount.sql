-- ============================================================================
-- 114_validate_payment_amount.sql
--
-- STATUS: DRAFT — review carefully before deploying.
-- Reason: prevents client-side payment amount manipulation in pricing/page.tsx.
--
-- Threat being mitigated:
--   The client computes `amount = 79000` (monthly) or `59000 * 12 = 708000`
--   (yearly) and inserts it directly into vip_payment_requests. A user can
--   open DevTools, modify the request, and submit `amount: 1` with a real
--   payment proof image for a different amount. An admin doing bulk approval
--   may miss the discrepancy.
--
-- Mitigation:
--   1. A `vip_pricing` lookup table holds the authoritative price per
--      billing_cycle. Only admins can edit it.
--   2. A BEFORE INSERT trigger on vip_payment_requests fetches the
--      authoritative amount from vip_pricing and OVERWRITES the client-
--      supplied value with it. Inconsistent client input is silently
--      replaced with the canonical value — no error, no leaked logic.
--   3. Admin updates (approve/reject) are exempt — the trigger only fires
--      on INSERT.
--
-- Caveats / things to check before deploying:
--   * Update the seed prices below if pricing/page.tsx has changed.
--   * If you plan to support coupons / discounts, extend the trigger to
--     accept a `coupon_code` column and look up discount from a coupons
--     table — do NOT trust client-supplied discounted amount.
--   * This migration is idempotent (IF NOT EXISTS / CREATE OR REPLACE).
-- ============================================================================

-- 1. Pricing lookup table -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vip_pricing (
    billing_cycle TEXT PRIMARY KEY CHECK (billing_cycle IN ('monthly', 'yearly')),
    amount INTEGER NOT NULL CHECK (amount > 0),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed: monthly 79000 VND, yearly 59000 * 12 = 708000 VND
-- (Mirrors the hardcoded values in src/pages/pricing/page.tsx lines 328-329.)
INSERT INTO public.vip_pricing (billing_cycle, amount)
VALUES ('monthly', 79000), ('yearly', 708000)
ON CONFLICT (billing_cycle) DO NOTHING;

-- RLS: everyone can read prices (UI displays them); only admins write.
ALTER TABLE public.vip_pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vip_pricing public read" ON public.vip_pricing;
CREATE POLICY "vip_pricing public read"
    ON public.vip_pricing FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "vip_pricing admin write" ON public.vip_pricing;
CREATE POLICY "vip_pricing admin write"
    ON public.vip_pricing FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 2. Trigger: overwrite client-supplied amount with authoritative value -------
CREATE OR REPLACE FUNCTION public.enforce_vip_payment_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    canonical_amount INTEGER;
BEGIN
    SELECT amount INTO canonical_amount
    FROM public.vip_pricing
    WHERE billing_cycle = NEW.billing_cycle;

    IF canonical_amount IS NULL THEN
        RAISE EXCEPTION 'Unknown billing_cycle: %', NEW.billing_cycle
            USING ERRCODE = '22023';
    END IF;

    -- Replace client-supplied amount with the canonical value. This makes the
    -- column effectively server-controlled even though the client still sends
    -- it (no client breakage needed).
    NEW.amount := canonical_amount;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_vip_payment_amount
    ON public.vip_payment_requests;

CREATE TRIGGER trg_enforce_vip_payment_amount
    BEFORE INSERT ON public.vip_payment_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_vip_payment_amount();

-- 3. (Optional) Backfill audit — sanity-check existing rows for divergence.
-- Uncomment the SELECT below to see if any prior submissions had off-price
-- amounts. Do NOT auto-fix — manual review needed (might be legitimate
-- promo, currency typo, etc.).
--
-- SELECT id, user_id, billing_cycle, amount, created_at
-- FROM public.vip_payment_requests r
-- LEFT JOIN public.vip_pricing p USING (billing_cycle)
-- WHERE r.amount <> p.amount
-- ORDER BY created_at DESC;
