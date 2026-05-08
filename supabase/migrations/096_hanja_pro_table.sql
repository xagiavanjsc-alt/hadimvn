-- ─── Hanja Pro Table ──────────────────────────────────────────────────────────
-- Lưu trữ vĩnh viễn 6000-10000 từ Hán Hàn với đầy đủ phân tích, ví dụ, mẹo nhớ.
-- Thay thế hanja_phan1.json (bundle tĩnh) để tránh tăng bundle size.
-- Pipeline: Python offline → AI generate → review → INSERT → web fetch.

CREATE TABLE IF NOT EXISTS public.hanja_pro (
  id              SERIAL PRIMARY KEY,
  hangul          TEXT        NOT NULL,
  hanja           TEXT        NOT NULL,
  slug            TEXT        NOT NULL UNIQUE,   -- romanized slug, vd: "ga-gyeol"
  meaning_vn      TEXT,                          -- nghĩa tiếng Việt ngắn gọn
  hanja_breakdown JSONB       NOT NULL DEFAULT '[]', -- [{char, reading, meaning}]
  examples        JSONB       NOT NULL DEFAULT '[]', -- [{ko, vi, boi}]
  related_words   JSONB       NOT NULL DEFAULT '[]', -- [{word, hanja, meaning}]
  mnemonic        TEXT,
  raw             TEXT        NOT NULL DEFAULT '',   -- full AI-generated text
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hanja_pro_slug   ON public.hanja_pro (slug);
CREATE INDEX IF NOT EXISTS idx_hanja_pro_hangul ON public.hanja_pro (hangul);
CREATE INDEX IF NOT EXISTS idx_hanja_pro_hanja  ON public.hanja_pro (hanja);

-- RLS: public read, no write from client
ALTER TABLE public.hanja_pro ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hanja_pro_public_select" ON public.hanja_pro
  FOR SELECT TO public USING (true);

-- ─── Mẫu dữ liệu: 가결 (ga-gyeol) ─────────────────────────────────────────────
INSERT INTO public.hanja_pro (id, hangul, hanja, slug, meaning_vn, hanja_breakdown, examples, related_words, mnemonic, raw)
VALUES (
  2,
  '가결',
  '可決',
  'ga-gyeol',
  'Thông qua, biểu quyết đồng ý',
  '[
    {"char": "可", "reading": "가", "meaning": "có thể"},
    {"char": "決", "reading": "결", "meaning": "quyết định"}
  ]'::jsonb,
  '[
    {"ko": "국회에서 예산안이 가결되었습니다.", "vi": "Dự toán ngân sách đã được thông qua tại Quốc hội.", "boi": "guk-hoe-e-seo ye-san-an-i ga-gyeol-doe-eot-seup-ni-da"},
    {"ko": "중요한 법안이 만장일치로 가결됐다.", "vi": "Dự luật quan trọng đã được biểu quyết thông qua với sự nhất trí.", "boi": "jung-yo-han beop-an-i man-jang-il-chi-ro ga-gyeol-dwaet-da"},
    {"ko": "그 안건은 가결되기까지 치열한 논의가 있었다.", "vi": "Đã có những thảo luận gay gắt trước khi vấn đề đó được thông qua.", "boi": "geu an-geon-eun ga-gyeol-doe-gi-kka-ji chi-yeol-han non-ui-ga it-eot-da"},
    {"ko": "동의를 구한 결과, 제안이 가결되었다.", "vi": "Kết quả lấy ý kiến đồng thuận là đề xuất đã được thông qua.", "boi": "dong-ui-reul gu-han gyeol-gwa, je-an-i ga-gyeol-doe-eot-da"},
    {"ko": "가결된 사항은 즉시 시행에 들어갑니다.", "vi": "Các vấn đề đã được thông qua sẽ được thực thi ngay lập tức.", "boi": "ga-gyeol-doen sa-hang-eun jeuk-si si-haeng-e deul-eo-gap-ni-da"}
  ]'::jsonb,
  '[
    {"word": "부결", "hanja": "否決", "meaning": "Bác bỏ, biểu quyết không thông qua. (\"否\": phủ, không; \"決\": quyết)"},
    {"word": "표결", "hanja": "表決", "meaning": "Sự biểu quyết, việc quyết định bằng bỏ phiếu. (\"表\": biểu, bày tỏ; \"決\": quyết)"},
    {"word": "통과", "hanja": "通過", "meaning": "Thông qua, được chấp nhận (trong một quy trình). (\"通\": thông, xuyên suốt; \"過\": qua, vượt qua)"}
  ]'::jsonb,
  'Hãy nghĩ đến cụm "Có thể quyết định" (可決). Khi một vấn đề "có thể" (可) được "quyết" (決), nghĩa là nó đã được thông qua. Trái nghĩa dễ nhớ là "부결" (phủ quyết - quyết định không).',
  '1. GIẢI NGHĨA: Nghĩa tiếng Việt là "thông qua, biểu quyết đồng ý". Gốc Hán: "可" (가, khả) nghĩa là "có thể, đồng ý", "決" (결, quyết) nghĩa là "quyết định". Hợp lại chỉ việc quyết định đồng ý, thông qua một đề xuất.'
) ON CONFLICT (id) DO NOTHING;

-- Reset sequence to start fresh from 3 (hoặc cao hơn nếu đã có data)
SELECT setval('hanja_pro_id_seq', GREATEST(100, (SELECT MAX(id) FROM public.hanja_pro)));
