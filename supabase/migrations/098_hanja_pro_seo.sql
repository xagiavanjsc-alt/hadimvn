-- Migration 098: Thêm cột SEO cho hanja_pro
-- Cho phép admin tùy chỉnh title, description, og_image cho từng từ
-- Nếu để trống → trang sẽ tự động sinh từ dữ liệu từ

ALTER TABLE public.hanja_pro
  ADD COLUMN IF NOT EXISTS seo_title       TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS seo_description TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS og_image        TEXT DEFAULT NULL;

COMMENT ON COLUMN public.hanja_pro.seo_title       IS 'Custom SEO title. Nếu NULL sẽ tự sinh từ hangul/hanja/meaning_vn';
COMMENT ON COLUMN public.hanja_pro.seo_description IS 'Custom meta description. Nếu NULL sẽ tự sinh từ dữ liệu từ';
COMMENT ON COLUMN public.hanja_pro.og_image        IS 'Custom OG image URL. Nếu NULL sẽ dùng ảnh mặc định site';

-- Index để tìm nhanh từ chưa có SEO
CREATE INDEX IF NOT EXISTS idx_hanja_pro_seo_title ON public.hanja_pro (seo_title) WHERE seo_title IS NULL;