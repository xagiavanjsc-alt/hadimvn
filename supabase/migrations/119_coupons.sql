-- ============================================================================
-- 119_coupons.sql
--
-- Coupons: server-side table, redemption tracking, and pricing integration.
--
-- Schema matches the frontend in src/hooks/useCoupons.ts and
-- src/pages/admin-coupon/page.tsx — code, discount, discount_type,
-- channel, series_id, coupon_type, vip_plan, max_usage, etc.
--
-- Redemption rules (decided 2026-05-29):
--   1. 1 user can redeem each coupon exactly once.
--   2. max_usage caps the TOTAL number of redemptions across all users.
--   3. Coupons can target VIP monthly only, yearly only, or both.
--
-- Validation flow:
--   - Client calls public.validate_and_apply_coupon(code, billing_cycle).
--   - RPC returns discounted amount + a redemption pending id, OR an error.
--   - Client submits vip_payment_requests with coupon_code + redemption id.
--   - INSERT trigger (114 + this) overrides amount with the discounted price.
--   - On admin approval, the redemption is "consumed" (status flips).
-- ============================================================================

-- 1. Coupons table -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount NUMERIC NOT NULL CHECK (discount > 0),
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
    channel TEXT NOT NULL DEFAULT 'Khác',
    series_id TEXT NOT NULL DEFAULT 'all',
    coupon_type TEXT NOT NULL DEFAULT 'ebook' CHECK (coupon_type IN ('ebook', 'vip')),
    vip_plan TEXT CHECK (vip_plan IN ('month', 'year', 'both')),
    usage_count INTEGER NOT NULL DEFAULT 0,
    max_usage INTEGER CHECK (max_usage IS NULL OR max_usage > 0),
    note TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive lookup by code
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code_lower ON public.coupons (LOWER(code));
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons (active) WHERE active = TRUE;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Public read for active coupon lookup by code (RPC bypasses RLS, but the
-- admin UI also reads directly). Admin can write.
DROP POLICY IF EXISTS "coupons public read active" ON public.coupons;
CREATE POLICY "coupons public read active"
    ON public.coupons FOR SELECT
    USING (active = TRUE);

DROP POLICY IF EXISTS "coupons admin read all" ON public.coupons;
CREATE POLICY "coupons admin read all"
    ON public.coupons FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

DROP POLICY IF EXISTS "coupons admin write" ON public.coupons;
CREATE POLICY "coupons admin write"
    ON public.coupons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_coupons_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS trg_coupons_touch ON public.coupons;
CREATE TRIGGER trg_coupons_touch
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW EXECUTE FUNCTION public.touch_coupons_updated_at();

-- 2. Redemptions table -------------------------------------------------------
-- One row per (coupon, user) pair — enforces "1 user 1 lần".
-- status = 'pending' (created at validate time) → 'consumed' (admin approves
-- the payment) → can be 'released' if admin rejects the payment.
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id TEXT NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'consumed', 'released')),
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
    original_amount INTEGER,
    discounted_amount INTEGER,
    payment_request_id UUID,  -- filled when used on a vip_payment_request
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A user cannot have more than one ACTIVE redemption per coupon. A 'released'
-- row is kept for audit but does NOT count toward the per-user cap.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_redemption_per_user
    ON public.coupon_redemptions (coupon_id, user_id)
    WHERE status IN ('pending', 'consumed');

CREATE INDEX IF NOT EXISTS idx_redemptions_coupon ON public.coupon_redemptions (coupon_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON public.coupon_redemptions (user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_payment ON public.coupon_redemptions (payment_request_id);

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "redemptions own read" ON public.coupon_redemptions;
CREATE POLICY "redemptions own read"
    ON public.coupon_redemptions FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "redemptions admin read" ON public.coupon_redemptions;
CREATE POLICY "redemptions admin read"
    ON public.coupon_redemptions FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.user_profiles
                WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- INSERT/UPDATE happen only through SECURITY DEFINER RPCs and triggers.
-- No client policies — keeps the redemption ledger tamper-proof.

-- 3. Validate-and-reserve RPC ------------------------------------------------
-- Returns JSONB: { ok: bool, error?: text, redemption_id, discount_amount,
-- discounted_amount, original_amount, coupon_id, code }
CREATE OR REPLACE FUNCTION public.validate_and_apply_coupon(
    p_code TEXT,
    p_billing_cycle TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_coupon public.coupons%ROWTYPE;
    v_user UUID := auth.uid();
    v_original INTEGER;
    v_discount_amt INTEGER;
    v_discounted INTEGER;
    v_redemption_id UUID;
    v_existing_id UUID;
BEGIN
    IF v_user IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Bạn cần đăng nhập để dùng coupon');
    END IF;

    IF p_billing_cycle NOT IN ('monthly', 'yearly') THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Chu kỳ thanh toán không hợp lệ');
    END IF;

    SELECT * INTO v_coupon FROM public.coupons
        WHERE LOWER(code) = LOWER(TRIM(p_code));

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Mã coupon không tồn tại');
    END IF;

    IF NOT v_coupon.active THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Mã coupon đã bị tắt');
    END IF;

    IF v_coupon.coupon_type <> 'vip' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Mã này không áp dụng cho gói VIP');
    END IF;

    -- vip_plan: 'month' / 'year' / 'both' / NULL (treat NULL as 'both' for back-compat)
    IF v_coupon.vip_plan IS NOT NULL AND v_coupon.vip_plan <> 'both' THEN
        IF (v_coupon.vip_plan = 'month' AND p_billing_cycle <> 'monthly')
        OR (v_coupon.vip_plan = 'year'  AND p_billing_cycle <> 'yearly') THEN
            RETURN jsonb_build_object(
                'ok', false,
                'error', 'Mã này chỉ áp dụng cho gói '
                    || CASE v_coupon.vip_plan WHEN 'month' THEN 'VIP Tháng' ELSE 'VIP Năm' END
            );
        END IF;
    END IF;

    IF v_coupon.max_usage IS NOT NULL AND v_coupon.usage_count >= v_coupon.max_usage THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Mã coupon đã hết lượt sử dụng');
    END IF;

    -- 1 user 1 lần: refuse if this user already has an active redemption
    SELECT id INTO v_existing_id FROM public.coupon_redemptions
        WHERE coupon_id = v_coupon.id
          AND user_id = v_user
          AND status IN ('pending', 'consumed')
        LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Bạn đã dùng mã này rồi');
    END IF;

    -- Lookup canonical price
    SELECT amount INTO v_original FROM public.vip_pricing
        WHERE billing_cycle = p_billing_cycle;

    IF v_original IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Không tìm thấy giá gói VIP');
    END IF;

    -- Compute discount
    IF v_coupon.discount_type = 'percent' THEN
        v_discount_amt := LEAST(v_original, ROUND(v_original * LEAST(v_coupon.discount, 100) / 100.0)::INTEGER);
    ELSE
        -- fixed: stored as VNĐ thousand units (e.g. 50 = 50.000đ) to mirror admin UI
        v_discount_amt := LEAST(v_original, (v_coupon.discount * 1000)::INTEGER);
    END IF;

    v_discounted := GREATEST(0, v_original - v_discount_amt);

    -- Reserve a redemption row (status=pending). The unique index makes a
    -- concurrent duplicate attempt error out cleanly.
    INSERT INTO public.coupon_redemptions (
        coupon_id, user_id, status, billing_cycle, original_amount, discounted_amount
    ) VALUES (
        v_coupon.id, v_user, 'pending', p_billing_cycle, v_original, v_discounted
    )
    RETURNING id INTO v_redemption_id;

    RETURN jsonb_build_object(
        'ok', true,
        'redemption_id', v_redemption_id,
        'coupon_id', v_coupon.id,
        'code', v_coupon.code,
        'discount', v_coupon.discount,
        'discount_type', v_coupon.discount_type,
        'discount_amount', v_discount_amt,
        'original_amount', v_original,
        'discounted_amount', v_discounted
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_and_apply_coupon(TEXT, TEXT) TO authenticated;

-- 4. Release-redemption RPC --------------------------------------------------
-- Lets a client release a 'pending' redemption it just reserved (e.g. user
-- cancels the payment modal). Refuses to touch 'consumed' rows.
CREATE OR REPLACE FUNCTION public.release_coupon_redemption(p_redemption_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_rows INTEGER;
BEGIN
    UPDATE public.coupon_redemptions
        SET status = 'released', updated_at = NOW()
        WHERE id = p_redemption_id
          AND user_id = auth.uid()
          AND status = 'pending';
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    RETURN v_rows > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.release_coupon_redemption(UUID) TO authenticated;

-- 5. Extend vip_payment_requests with coupon fields --------------------------
ALTER TABLE public.vip_payment_requests
    ADD COLUMN IF NOT EXISTS coupon_code TEXT,
    ADD COLUMN IF NOT EXISTS coupon_redemption_id UUID
        REFERENCES public.coupon_redemptions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS original_amount INTEGER;

-- 6. Replace the 114 trigger to honor coupons --------------------------------
-- The trigger now: looks up the canonical price, applies the coupon discount
-- if a valid pending redemption for this user/cycle was supplied, and
-- overwrites NEW.amount + records original_amount. The redemption row stays
-- 'pending' until admin approval flips it to 'consumed'.
CREATE OR REPLACE FUNCTION public.enforce_vip_payment_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_canonical INTEGER;
    v_redemption public.coupon_redemptions%ROWTYPE;
    v_final INTEGER;
BEGIN
    SELECT amount INTO v_canonical FROM public.vip_pricing
        WHERE billing_cycle = NEW.billing_cycle;

    IF v_canonical IS NULL THEN
        RAISE EXCEPTION 'Unknown billing_cycle: %', NEW.billing_cycle USING ERRCODE = '22023';
    END IF;

    NEW.original_amount := v_canonical;
    v_final := v_canonical;

    -- If a redemption id was supplied, validate it and apply its discount.
    IF NEW.coupon_redemption_id IS NOT NULL THEN
        SELECT * INTO v_redemption FROM public.coupon_redemptions
            WHERE id = NEW.coupon_redemption_id;

        IF NOT FOUND
            OR v_redemption.user_id <> NEW.user_id
            OR v_redemption.status <> 'pending'
            OR v_redemption.billing_cycle <> NEW.billing_cycle THEN
            -- Tampered or stale redemption: silently strip it, keep full price.
            NEW.coupon_redemption_id := NULL;
            NEW.coupon_code := NULL;
        ELSE
            v_final := v_redemption.discounted_amount;
            -- Bind redemption to this payment request for the approval step.
            UPDATE public.coupon_redemptions
                SET payment_request_id = NEW.id, updated_at = NOW()
                WHERE id = v_redemption.id;
        END IF;
    END IF;

    NEW.amount := v_final;
    RETURN NEW;
END;
$$;

-- Trigger itself is unchanged (still BEFORE INSERT), function body is updated.

-- 7. Approve / reject hooks: consume or release the redemption ---------------
CREATE OR REPLACE FUNCTION public.handle_vip_payment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = OLD.status OR NEW.coupon_redemption_id IS NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.status = 'approved' THEN
        UPDATE public.coupon_redemptions
            SET status = 'consumed', updated_at = NOW()
            WHERE id = NEW.coupon_redemption_id AND status = 'pending';
        -- Bump coupon usage_count atomically
        UPDATE public.coupons c
            SET usage_count = usage_count + 1, updated_at = NOW()
            FROM public.coupon_redemptions r
            WHERE r.id = NEW.coupon_redemption_id AND c.id = r.coupon_id;
    ELSIF NEW.status = 'rejected' THEN
        UPDATE public.coupon_redemptions
            SET status = 'released', updated_at = NOW()
            WHERE id = NEW.coupon_redemption_id AND status = 'pending';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vip_payment_status_change ON public.vip_payment_requests;
CREATE TRIGGER trg_vip_payment_status_change
    AFTER UPDATE OF status ON public.vip_payment_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_vip_payment_status_change();

-- ============================================================================
-- DONE. Verify after deploying:
--   SELECT * FROM public.coupons LIMIT 5;
--   SELECT public.validate_and_apply_coupon('TESTCODE', 'monthly');
-- ============================================================================
