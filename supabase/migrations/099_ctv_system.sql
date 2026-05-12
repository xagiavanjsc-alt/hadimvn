-- Migration 099: Hệ thống CTV (Cộng Tác Viên)
-- CTV chia sẻ link → user đăng ký → user mua VIP → CTV nhận hoa hồng

-- ─── Bảng hồ sơ CTV ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ctv_profiles (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  display_name      TEXT        NOT NULL,
  phone             TEXT,
  bank_info         JSONB       DEFAULT '{}'::jsonb, -- {bank, account_number, account_name}
  ref_code          TEXT        UNIQUE NOT NULL,
  commission_rate   DECIMAL(5,2) DEFAULT 20.00,      -- % hoa hồng trên mỗi đơn
  status            TEXT        DEFAULT 'pending'
                    CHECK (status IN ('pending','active','suspended')),
  note              TEXT,
  total_referred    INTEGER     DEFAULT 0,            -- số user đã giới thiệu
  total_sales       BIGINT      DEFAULT 0,            -- tổng doanh thu từ CTV (VNĐ)
  total_commission  BIGINT      DEFAULT 0,            -- tổng hoa hồng phát sinh (VNĐ)
  paid_commission   BIGINT      DEFAULT 0,            -- đã thanh toán (VNĐ)
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Bảng hoa hồng chi tiết ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ctv_commissions (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ctv_id                UUID        NOT NULL REFERENCES public.ctv_profiles(id) ON DELETE CASCADE,
  referred_user_id      UUID,
  referred_user_name    TEXT,
  vip_type              TEXT,                         -- 'month' | 'year'
  sale_amount           BIGINT      NOT NULL DEFAULT 0,
  commission_rate       DECIMAL(5,2) NOT NULL,
  commission_amount     BIGINT      NOT NULL DEFAULT 0,
  status                TEXT        DEFAULT 'pending'
                        CHECK (status IN ('pending','paid','cancelled')),
  note                  TEXT,
  paid_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Index ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ctv_profiles_ref_code ON public.ctv_profiles (ref_code);
CREATE INDEX IF NOT EXISTS idx_ctv_profiles_user_id  ON public.ctv_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_ctv_commissions_ctv   ON public.ctv_commissions (ctv_id);
CREATE INDEX IF NOT EXISTS idx_ctv_commissions_user  ON public.ctv_commissions (referred_user_id);

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE public.ctv_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ctv_commissions ENABLE ROW LEVEL SECURITY;

-- CTV xem được hồ sơ của chính mình
DROP POLICY IF EXISTS "ctv_read_own_profile" ON public.ctv_profiles;
CREATE POLICY "ctv_read_own_profile" ON public.ctv_profiles
  FOR SELECT USING (user_id = auth.uid());

-- CTV xem được hoa hồng của mình
DROP POLICY IF EXISTS "ctv_read_own_commissions" ON public.ctv_commissions;
CREATE POLICY "ctv_read_own_commissions" ON public.ctv_commissions
  FOR SELECT USING (
    ctv_id IN (SELECT id FROM public.ctv_profiles WHERE user_id = auth.uid())
  );

-- Service role (admin) toàn quyền
DROP POLICY IF EXISTS "service_role_all_ctv_profiles" ON public.ctv_profiles;
CREATE POLICY "service_role_all_ctv_profiles" ON public.ctv_profiles
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "service_role_all_ctv_commissions" ON public.ctv_commissions;
CREATE POLICY "service_role_all_ctv_commissions" ON public.ctv_commissions
  FOR ALL USING (auth.role() = 'service_role');
