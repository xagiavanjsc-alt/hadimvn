-- 106_naver_qa_rich.sql
-- Thêm vocabulary + grammar vào naver_qa

ALTER TABLE naver_qa
  ADD COLUMN IF NOT EXISTS vocabulary JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS grammar    JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS difficulty SMALLINT DEFAULT 1;
