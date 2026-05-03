-- Add SEO configuration for categories
-- Creates a table to store SEO settings for each category

CREATE TABLE IF NOT EXISTS public.category_seo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_name TEXT NOT NULL UNIQUE,
  category_type TEXT NOT NULL, -- 'community', 'hanja', 'general'
  title TEXT,
  description TEXT,
  keywords TEXT,
  og_image TEXT,
  canonical_url TEXT,
  meta_robots TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS category_seo_type_idx ON public.category_seo(category_type);
CREATE INDEX IF NOT EXISTS category_seo_name_idx ON public.category_seo(category_name);

-- Add RLS policies
ALTER TABLE public.category_seo ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin full access to category_seo"
  ON public.category_seo FOR ALL
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

-- Everyone can read
CREATE POLICY "Public read category_seo"
  ON public.category_seo FOR SELECT
  USING (true);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_category_seo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_category_seo_updated_at
  BEFORE UPDATE ON public.category_seo
  FOR EACH ROW EXECUTE FUNCTION public.update_category_seo_updated_at();

-- Insert default categories for community posts
INSERT INTO public.category_seo (category_name, category_type, title, description, keywords) VALUES
  ('share', 'community', 'Chia sẻ kinh nghiệm học tiếng Hàn', 'Cộng đồng chia sẻ kinh nghiệm, tips học tiếng Hàn hiệu quả', 'học tiếng Hàn, chia sẻ kinh nghiệm, tips tiếng Hàn'),
  ('question', 'community', 'Hỏi đáp tiếng Hàn', 'Đặt câu hỏi và nhận giải đáp về ngữ pháp, từ vựng, văn hóa Hàn Quốc', 'hỏi đáp tiếng Hàn, câu hỏi tiếng Hàn, giải đáp tiếng Hàn'),
  ('discussion', 'community', 'Thảo luận tiếng Hàn', 'Khu vực thảo luận về các chủ đề liên quan đến tiếng Hàn và văn hóa Hàn', 'thảo luận tiếng Hàn, văn hóa Hàn, cộng đồng tiếng Hàn'),
  ('resource', 'community', 'Tài liệu học tiếng Hàn', 'Chia sẻ tài liệu, sách, video học tiếng Hàn miễn phí', 'tài liệu tiếng Hàn, sách tiếng Hàn, video học tiếng Hàn')
ON CONFLICT (category_name) DO NOTHING;

-- Insert default categories for hanja
INSERT INTO public.category_seo (category_name, category_type, title, description, keywords) VALUES
  ('Khác', 'hanja', 'Từ vựng Hán Hàn', 'Danh sách từ vựng Hán Hàn theo các chủ đề khác nhau', 'Hán Hàn, từ vựng Hán Hàn, chữ Hán'),
  ('Số đếm', 'hanja', 'Số đếm Hán Hàn', 'Các con số và cách đếm trong tiếng Hàn', 'số đếm tiếng Hàn, số tiếng Hàn'),
  ('Thời gian', 'hanja', 'Thời gian Hán Hàn', 'Các từ vựng liên quan đến thời gian trong tiếng Hàn', 'thời gian tiếng Hàn, ngày tháng tiếng Hàn'),
  ('Gia đình', 'hanja', 'Gia đình Hán Hàn', 'Từ vựng về gia đình và quan hệ họ hàng trong tiếng Hàn', 'gia đình tiếng Hàn, họ hàng tiếng Hàn'),
  ('Đồ ăn', 'hanja', 'Đồ ăn Hán Hàn', 'Từ vựng về thức ăn và đồ uống trong tiếng Hàn', 'đồ ăn tiếng Hàn, thức ăn tiếng Hàn')
ON CONFLICT (category_name) DO NOTHING;
