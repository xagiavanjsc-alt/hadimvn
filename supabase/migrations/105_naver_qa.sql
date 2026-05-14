-- 105_naver_qa.sql
-- Bảng lưu Q&A từ Naver KiN, đã dịch sang tiếng Việt

CREATE TABLE IF NOT EXISTS naver_qa (
  id            BIGSERIAL PRIMARY KEY,
  question_kr   TEXT NOT NULL,
  answer_kr     TEXT NOT NULL,
  question_vn   TEXT,
  answer_vn     TEXT,
  category      TEXT DEFAULT '학습법',
  category_vn   TEXT DEFAULT 'Học tiếng Hàn',
  likes         INTEGER DEFAULT 0,
  views         INTEGER DEFAULT 0,
  url           TEXT,
  answered_at   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS naver_qa_category_idx ON naver_qa(category);
CREATE INDEX IF NOT EXISTS naver_qa_likes_idx    ON naver_qa(likes DESC);

ALTER TABLE naver_qa ENABLE ROW LEVEL SECURITY;

-- Ai cũng đọc được
CREATE POLICY "naver_qa_read_all"
  ON naver_qa FOR SELECT USING (true);

-- Chỉ service_role mới ghi
CREATE POLICY "naver_qa_write_service"
  ON naver_qa FOR ALL
  USING (auth.role() = 'service_role');
