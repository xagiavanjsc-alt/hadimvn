-- ─── 008: Community access control settings ──────────────────────────────────
-- Cấu hình giới hạn truy cập cộng đồng: khách xem mấy bài, thành viên đăng mấy bài/ngày
-- Admin có thể bật/tắt nhanh (ví dụ mở full dịp lễ)

CREATE TABLE IF NOT EXISTS public.community_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',

  -- Bật/tắt kiểm soát truy cập (tắt = mở full cho tất cả)
  access_control_enabled BOOLEAN DEFAULT TRUE,

  -- Số bài khách được xem trước khi yêu cầu đăng nhập (0 = không cho xem)
  guest_view_limit INT NOT NULL DEFAULT 15,

  -- Số bài thành viên đăng/ngày (0 = không giới hạn)
  member_daily_post_limit INT NOT NULL DEFAULT 5,

  -- Số bài VIP đăng/ngày (0 = không giới hạn)
  vip_daily_post_limit INT NOT NULL DEFAULT 0,

  -- Chế độ mở rộng: "normal", "holiday" (mở full), "maintenance" (không ai đăng được)
  access_mode TEXT NOT NULL DEFAULT 'normal'
    CHECK (access_mode IN ('normal', 'holiday', 'maintenance')),

  -- Ghi chú (ví dụ "Mở full dịp Tết 2026")
  mode_note TEXT,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default row
INSERT INTO public.community_settings (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

-- RLS: ai cũng đọc được, chỉ admin write
ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read community settings" ON public.community_settings;
CREATE POLICY "Anyone can read community settings"
  ON public.community_settings FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Only admins can update community settings" ON public.community_settings;
CREATE POLICY "Only admins can update community settings"
  ON public.community_settings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND (is_admin = TRUE OR user_role = 'smod'))
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_community_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_community_settings_updated_at ON public.community_settings;
CREATE TRIGGER trg_community_settings_updated_at
  BEFORE UPDATE ON public.community_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_community_settings_updated_at();
