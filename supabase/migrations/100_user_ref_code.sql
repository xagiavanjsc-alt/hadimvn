-- Migration 100: Lưu mã CTV vào hồ sơ user khi đăng ký qua link
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS ref_code TEXT DEFAULT NULL;

COMMENT ON COLUMN public.user_profiles.ref_code IS 'Mã CTV đã giới thiệu user này (HQO-XXXXXX)';

CREATE INDEX IF NOT EXISTS idx_user_profiles_ref_code ON public.user_profiles (ref_code) WHERE ref_code IS NOT NULL;
