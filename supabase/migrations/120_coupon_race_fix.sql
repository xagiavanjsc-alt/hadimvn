-- ============================================================================
-- 120_coupon_race_fix.sql
--
-- Fix a race condition in 119: validate_and_apply_coupon checked
-- `usage_count >= max_usage` but usage_count is only incremented on admin
-- approval, not at reserve time. 100 concurrent users could each reserve a
-- coupon with max_usage=10 (each sees 0 < 10) and all be admin-approved,
-- blowing through the cap.
--
-- Fix: count CURRENT active redemptions (pending + consumed) inside the
-- RPC, under a row-level lock on the coupon. The check now considers
-- in-flight reservations, not just consumed ones.
--
-- Also: defense-in-depth check inside enforce_vip_payment_amount —
-- decline INSERT if the coupon has gone over max_usage since reservation
-- (edge case: admin manually approved another payment while this user's
-- modal was open).
-- ============================================================================

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
    v_active_count INTEGER;
BEGIN
    IF v_user IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Bạn cần đăng nhập để dùng coupon');
    END IF;

    IF p_billing_cycle NOT IN ('monthly', 'yearly') THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Chu kỳ thanh toán không hợp lệ');
    END IF;

    -- Lock the coupon row for the rest of the transaction. Without this,
    -- two concurrent callers can both see usage_count=N-1 and both succeed.
    SELECT * INTO v_coupon FROM public.coupons
        WHERE LOWER(code) = LOWER(TRIM(p_code))
        FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Mã coupon không tồn tại');
    END IF;

    IF NOT v_coupon.active THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Mã coupon đã bị tắt');
    END IF;

    IF v_coupon.coupon_type <> 'vip' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Mã này không áp dụng cho gói VIP');
    END IF;

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

    -- ── Cap check based on ACTIVE redemptions, not just consumed ones ──
    -- "active" = pending (reserved + not yet rejected) OR consumed (admin
    -- approved). Released rows do not count. This closes the race window
    -- where many users could simultaneously pass `usage_count < max_usage`.
    IF v_coupon.max_usage IS NOT NULL THEN
        SELECT COUNT(*) INTO v_active_count FROM public.coupon_redemptions
            WHERE coupon_id = v_coupon.id
              AND status IN ('pending', 'consumed');
        IF v_active_count >= v_coupon.max_usage THEN
            RETURN jsonb_build_object('ok', false, 'error', 'Mã coupon đã hết lượt sử dụng');
        END IF;
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

    SELECT amount INTO v_original FROM public.vip_pricing
        WHERE billing_cycle = p_billing_cycle;

    IF v_original IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Không tìm thấy giá gói VIP');
    END IF;

    IF v_coupon.discount_type = 'percent' THEN
        v_discount_amt := LEAST(v_original, ROUND(v_original * LEAST(v_coupon.discount, 100) / 100.0)::INTEGER);
    ELSE
        v_discount_amt := LEAST(v_original, (v_coupon.discount * 1000)::INTEGER);
    END IF;

    v_discounted := GREATEST(0, v_original - v_discount_amt);

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

-- ============================================================================
-- Defense-in-depth: keep the INSERT trigger from binding a redemption that
-- has gone stale (its coupon's cap was reached by another payment while
-- this user's modal sat open). In that case we strip the redemption and
-- charge the full price — better than letting the cap silently leak.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enforce_vip_payment_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_canonical INTEGER;
    v_redemption public.coupon_redemptions%ROWTYPE;
    v_coupon public.coupons%ROWTYPE;
    v_consumed INTEGER;
    v_final INTEGER;
BEGIN
    SELECT amount INTO v_canonical FROM public.vip_pricing
        WHERE billing_cycle = NEW.billing_cycle;

    IF v_canonical IS NULL THEN
        RAISE EXCEPTION 'Unknown billing_cycle: %', NEW.billing_cycle USING ERRCODE = '22023';
    END IF;

    NEW.original_amount := v_canonical;
    v_final := v_canonical;

    IF NEW.coupon_redemption_id IS NOT NULL THEN
        SELECT * INTO v_redemption FROM public.coupon_redemptions
            WHERE id = NEW.coupon_redemption_id;

        IF NOT FOUND
            OR v_redemption.user_id <> NEW.user_id
            OR v_redemption.status <> 'pending'
            OR v_redemption.billing_cycle <> NEW.billing_cycle THEN
            NEW.coupon_redemption_id := NULL;
            NEW.coupon_code := NULL;
        ELSE
            -- Re-check max_usage: someone else may have filled the cap with
            -- 'consumed' redemptions while this row was 'pending'.
            SELECT * INTO v_coupon FROM public.coupons WHERE id = v_redemption.coupon_id;
            IF v_coupon.max_usage IS NOT NULL THEN
                SELECT COUNT(*) INTO v_consumed FROM public.coupon_redemptions
                    WHERE coupon_id = v_coupon.id AND status = 'consumed';
                IF v_consumed >= v_coupon.max_usage THEN
                    -- Release the stale reservation, drop the discount.
                    UPDATE public.coupon_redemptions
                        SET status = 'released', updated_at = NOW()
                        WHERE id = v_redemption.id;
                    NEW.coupon_redemption_id := NULL;
                    NEW.coupon_code := NULL;
                ELSE
                    v_final := v_redemption.discounted_amount;
                    UPDATE public.coupon_redemptions
                        SET payment_request_id = NEW.id, updated_at = NOW()
                        WHERE id = v_redemption.id;
                END IF;
            ELSE
                v_final := v_redemption.discounted_amount;
                UPDATE public.coupon_redemptions
                    SET payment_request_id = NEW.id, updated_at = NOW()
                    WHERE id = v_redemption.id;
            END IF;
        END IF;
    END IF;

    NEW.amount := v_final;
    RETURN NEW;
END;
$$;
