-- Truyện Chêm - Mnemonic Stories for Hanja Learning
-- This migration creates tables for Hanja stories to help users remember vocabulary

-- Create hanja_stories table
CREATE TABLE IF NOT EXISTS public.hanja_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  hanja_words JSONB NOT NULL, -- Array of Hanja words used in story
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic TEXT NOT NULL CHECK (topic IN ('education', 'family', 'work', 'time', 'location', 'daily_life', 'eps_topik')),
  created_by TEXT NOT NULL DEFAULT 'ai', -- 'ai' or 'admin' or user_id
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hanja_story_progress table
CREATE TABLE IF NOT EXISTS public.hanja_story_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.hanja_stories(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'reading', 'completed')),
  read_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMPTZ,
  quiz_score INTEGER, -- Score from quiz after reading story
  UNIQUE(user_id, story_id)
);

-- Create hanja_story_quiz table
CREATE TABLE IF NOT EXISTS public.hanja_story_quiz (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.hanja_stories(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('identify_hanja', 'fill_blank', 'multiple_choice')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  hanja_word TEXT NOT NULL, -- The Hanja word being tested
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_hanja_stories_topic ON public.hanja_stories(topic);
CREATE INDEX IF NOT EXISTS idx_hanja_stories_difficulty ON public.hanja_stories(difficulty);
CREATE INDEX IF NOT EXISTS idx_hanja_story_progress_user_id ON public.hanja_story_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_hanja_story_progress_story_id ON public.hanja_story_progress(story_id);
CREATE INDEX IF NOT EXISTS idx_hanja_story_quiz_story_id ON public.hanja_story_quiz(story_id);

-- Enable RLS
ALTER TABLE public.hanja_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hanja_story_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hanja_story_quiz ENABLE ROW LEVEL SECURITY;

-- RLS policies for hanja_stories (read-only for all authenticated users)
CREATE OR REPLACE POLICY "Hanja stories are viewable by all authenticated users"
ON public.hanja_stories FOR SELECT
TO authenticated
USING (true);

CREATE OR REPLACE POLICY "Admins can create hanja stories"
ON public.hanja_stories FOR INSERT
TO authenticated
WITH CHECK (
  created_by = 'admin' OR
  created_by = 'ai'
);

CREATE OR REPLACE POLICY "Admins can update hanja stories"
ON public.hanja_stories FOR UPDATE
TO authenticated
USING (
  created_by = 'admin' OR
  created_by = 'ai'
);

-- RLS policies for hanja_story_progress
CREATE OR REPLACE POLICY "Users can view their own story progress"
ON public.hanja_story_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE POLICY "Users can insert their own story progress"
ON public.hanja_story_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE POLICY "Users can update their own story progress"
ON public.hanja_story_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- RLS policies for hanja_story_quiz (read-only for all authenticated users)
CREATE OR REPLACE POLICY "Hanja story quizzes are viewable by all authenticated users"
ON public.hanja_story_quiz FOR SELECT
TO authenticated
USING (true);

-- Insert sample Hanja stories
INSERT INTO public.hanja_stories (title, content, hanja_words, difficulty, topic) VALUES
('Trường Học', 'Ngày xưa có một **學生**(sinh viên) tên là Minh. Mỗi sáng Minh đều đến **學校**(trường học) đúng giờ. Ở trường, Minh gặp **朋友**(bạn) thân là Lan. Cả hai cùng học với **老師**(thầy giáo) rất tận tâm. Sau giờ học, Minh và Lan đến **圖書館**(thư viện) để đọc sách.',
  '[{"korean": "學生", "hanja": "학생", "vietnamese": "sinh viên"}, {"korean": "學校", "hanja": "학교", "vietnamese": "trường học"}, {"korean": "朋友", "hanja": "친구", "vietnamese": "bạn"}, {"korean": "老師", "hanja": "선생님", "vietnamese": "thầy giáo"}, {"korean": "圖書館", "hanja": "도서관", "vietnamese": "thư viện"}]',
  'easy', 'education'),

('Gia Đình', 'Trong một gia đình có **父親**(bố) làm việc tại **會社**(công ty). **母親**(mẹ) ở nhà chăm sóc **子女**(con cái). Mỗi cuối tuần, cả gia đình đi thăm **祖父**(ông nội) và **祖母**(bà nội). Các **兄弟**(anh em) rất yêu thương nhau.',
  '[{"korean": "父親", "hanja": "아버지", "vietnamese": "bố"}, {"korean": "會社", "hanja": "회사", "vietnamese": "công ty"}, {"korean": "母親", "hanja": "어머니", "vietnamese": "mẹ"}, {"korean": "子女", "hanja": "자녀", "vietnamese": "con cái"}, {"korean": "祖父", "hanja": "할아버지", "vietnamese": "ông nội"}, {"korean": "祖母", "hanja": "할머니", "vietnamese": "bà nội"}, {"korean": "兄弟", "hanja": "형제", "vietnamese": "anh em"}]',
  'easy', 'family'),

('Công Việc', 'Anh Nam làm **事務**(công việc) tại một **銀行**(ngân hàng). Mỗi ngày anh đi làm bằng **電車**(tàu điện). Ở công ty, anh có nhiều **同僚**(đồng nghiệp) thân thiện. Sau khi làm việc xong, anh thường đi **食堂**(canteen) ăn trưa.',
  '[{"korean": "事務", "hanja": "사무", "vietnamese": "công việc"}, {"korean": "銀行", "hanja": "은행", "vietnamese": "ngân hàng"}, {"korean": "電車", "hanja": "전차", "vietnamese": "tàu điện"}, {"korean": "同僚", "hanja": "동료", "vietnamese": "đồng nghiệp"}, {"korean": "食堂", "hanja": "식당", "vietnamese": "canteen"}]',
  'easy', 'work'),

('Thời Gian', '**今日**(hôm nay) là một ngày đẹp. **明日**(ngày mai) tôi sẽ đi **旅行**(du lịch). Tôi dự định đi trong **週間**(tuần) tới. **年間**(năm) nay tôi đã đi du lịch 3 lần rồi.',
  '[{"korean": "今日", "hanja": "오늘", "vietnamese": "hôm nay"}, {"korean": "明日", "hanja": "내일", "vietnamese": "ngày mai"}, {"korean": "旅行", "hanja": "여행", "vietnamese": "du lịch"}, {"korean": "週間", "hanja": "주간", "vietnamese": "tuần"}, {"korean": "年間", "hanja": "연간", "vietnamese": "năm"}]',
  'easy', 'time'),

('Địa Điểm', 'Tôi sống gần **病院**(bệnh viện). Hàng ngày tôi đi qua **郵便局**(bưu điện). Ở gần nhà tôi còn có **警察署**(công an) và **消防署**(cứu hỏa). Cuối tuần tôi thường đến **公園**(công viên) tập thể dục.',
  '[{"korean": "病院", "hanja": "병원", "vietnamese": "bệnh viện"}, {"korean": "郵便局", "hanja": "우체국", "vietnamese": "bưu điện"}, {"korean": "警察署", "hanja": "경찰서", "vietnamese": "công an"}, {"korean": "消防署", "hanja": "소방서", "vietnamese": "cứu hỏa"}, {"korean": "公園", "hanja": "공원", "vietnamese": "công viên"}]',
  'easy', 'location');
