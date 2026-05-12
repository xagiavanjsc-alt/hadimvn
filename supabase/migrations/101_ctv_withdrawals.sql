-- Migration 101: Yêu cầu rút tiền hoa hồng CTV

CREATE TABLE IF NOT EXISTS public.ctv_withdrawals (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ctv_id          UUID        NOT NULL REFERENCES public.ctv_profiles(id) ON DELETE CASCADE,
  amount          BIGINT      NOT NULL,
  bank_info       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  status          TEXT        DEFAULT 'pending'
                  CHECK (status IN ('pending','approved','rejected','paid')),
  note            TEXT,
  admin_note      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  processed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ctv_withdrawals_ctv    ON public.ctv_withdrawals (ctv_id);
CREATE INDEX IF NOT EXISTS idx_ctv_withdrawals_status ON public.ctv_withdrawals (status);

ALTER TABLE public.ctv_withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ctv_read_own_withdrawals" ON public.ctv_withdrawals;
CREATE POLICY "ctv_read_own_withdrawals" ON public.ctv_withdrawals
  FOR SELECT USING (
    ctv_id IN (SELECT id FROM public.ctv_profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "ctv_insert_own_withdrawals" ON public.ctv_withdrawals;
CREATE POLICY "ctv_insert_own_withdrawals" ON public.ctv_withdrawals
  FOR INSERT WITH CHECK (
    ctv_id IN (SELECT id FROM public.ctv_profiles WHERE user_id = auth.uid() AND status = 'active')
  );

DROP POLICY IF EXISTS "service_role_all_withdrawals" ON public.ctv_withdrawals;
CREATE POLICY "service_role_all_withdrawals" ON public.ctv_withdrawals
  FOR ALL USING (auth.role() = 'service_role');
