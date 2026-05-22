-- Migration 109: Harden CTV financial flows
-- Fixes:
--   1. ctv_withdrawals.amount must be positive and within sane bounds.
--   2. Only 1 pending withdrawal per CTV at a time (prevents client-side race
--      where rapid clicks insert duplicates before balance is refreshed).
--   3. increment_ctv_stats() rejects negative inputs (prevents accidental or
--      malicious balance corruption).
--   4. Atomic process_withdrawal_payment() function so admin marking a
--      withdrawal "paid" + flagging the matching commissions happens in one
--      transaction with idempotency guards.

-- ─── 1. CHECK constraint on amount ───────────────────────────────────────────
-- Cap at 100,000,000 VND (~ enough for any realistic single payout).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ctv_withdrawals_amount_positive'
  ) THEN
    ALTER TABLE public.ctv_withdrawals
      ADD CONSTRAINT ctv_withdrawals_amount_positive
      CHECK (amount > 0 AND amount <= 100000000);
  END IF;
END$$;

-- ─── 2. Only one pending withdrawal per CTV ──────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS uniq_ctv_withdrawals_pending_per_ctv
  ON public.ctv_withdrawals (ctv_id)
  WHERE status = 'pending';

-- ─── 3. Harden increment_ctv_stats: reject negative inputs ───────────────────
CREATE OR REPLACE FUNCTION public.increment_ctv_stats(
  p_ctv_id        UUID,
  p_commission    BIGINT,
  p_sales         BIGINT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_commission < 0 OR p_sales < 0 THEN
    RAISE EXCEPTION 'increment_ctv_stats: negative input not allowed (commission=%, sales=%)',
      p_commission, p_sales;
  END IF;
  IF p_commission > 100000000 OR p_sales > 100000000 THEN
    RAISE EXCEPTION 'increment_ctv_stats: input exceeds sanity cap';
  END IF;

  UPDATE public.ctv_profiles SET
    total_commission = COALESCE(total_commission, 0) + p_commission,
    total_sales      = COALESCE(total_sales, 0)      + p_sales,
    total_referred   = COALESCE(total_referred, 0)   + 1,
    updated_at       = NOW()
  WHERE id = p_ctv_id;
END;
$$;

-- ─── 4. Atomic withdrawal payment processing ─────────────────────────────────
-- Marks withdrawal as paid + flips matching commissions to paid + updates
-- ctv_profiles.paid_commission, all in one transaction. Idempotent: if the
-- withdrawal is already paid, returns the unchanged row.
CREATE OR REPLACE FUNCTION public.process_withdrawal_payment(
  p_withdrawal_id UUID,
  p_admin_note    TEXT DEFAULT NULL
)
RETURNS TABLE (
  withdrawal_id UUID,
  ctv_id        UUID,
  amount        BIGINT,
  was_paid_now  BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller       UUID := auth.uid();
  v_wd           public.ctv_withdrawals%ROWTYPE;
  v_remaining    BIGINT;
  v_commission   public.ctv_commissions%ROWTYPE;
BEGIN
  IF v_caller IS NULL OR NOT public.is_admin_user(v_caller) THEN
    RAISE EXCEPTION 'process_withdrawal_payment: admin only';
  END IF;

  -- Lock the row to prevent concurrent admin double-click.
  SELECT * INTO v_wd
  FROM public.ctv_withdrawals
  WHERE id = p_withdrawal_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'withdrawal % not found', p_withdrawal_id;
  END IF;

  -- Idempotency: already paid → return current state, do nothing.
  IF v_wd.status = 'paid' THEN
    RETURN QUERY SELECT v_wd.id, v_wd.ctv_id, v_wd.amount, FALSE;
    RETURN;
  END IF;

  IF v_wd.status = 'rejected' THEN
    RAISE EXCEPTION 'cannot pay a rejected withdrawal';
  END IF;

  -- Flip withdrawal status.
  UPDATE public.ctv_withdrawals
  SET status       = 'paid',
      processed_at = NOW(),
      admin_note   = COALESCE(p_admin_note, admin_note)
  WHERE id = p_withdrawal_id;

  -- Greedily mark pending commissions as paid up to the withdrawal amount.
  v_remaining := v_wd.amount;
  FOR v_commission IN
    SELECT * FROM public.ctv_commissions
    WHERE ctv_id = v_wd.ctv_id AND status = 'pending'
    ORDER BY created_at ASC
    FOR UPDATE
  LOOP
    EXIT WHEN v_remaining <= 0;
    UPDATE public.ctv_commissions
    SET status = 'paid', paid_at = NOW()
    WHERE id = v_commission.id;
    v_remaining := v_remaining - v_commission.commission_amount;
  END LOOP;

  -- Bump aggregate paid_commission on the CTV profile.
  UPDATE public.ctv_profiles
  SET paid_commission = COALESCE(paid_commission, 0) + v_wd.amount,
      updated_at      = NOW()
  WHERE id = v_wd.ctv_id;

  RETURN QUERY SELECT v_wd.id, v_wd.ctv_id, v_wd.amount, TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_withdrawal_payment(UUID, TEXT) TO authenticated, service_role;
