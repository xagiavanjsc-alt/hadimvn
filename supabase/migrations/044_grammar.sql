-- Grammar Section Database Schema
-- This migration creates tables for Korean grammar patterns and explanations

-- Create grammar_patterns table
CREATE TABLE IF NOT EXISTS public.grammar_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern TEXT NOT NULL,
  romanization TEXT,
  meaning TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT NOT NULL,
  explanation TEXT NOT NULL,
  usage TEXT,
  examples JSONB NOT NULL,
  related_patterns TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create grammar_progress table
CREATE TABLE IF NOT EXISTS public.grammar_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES public.grammar_patterns(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'mastered')),
  last_reviewed_at TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  mastery_score INTEGER DEFAULT 0,
  UNIQUE(user_id, pattern_id)
);

-- Create grammar_practice_questions table
CREATE TABLE IF NOT EXISTS public.grammar_practice_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern_id UUID NOT NULL REFERENCES public.grammar_patterns(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('fill_blank', 'multiple_choice', 'translation', 'sentence_building')),
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_grammar_patterns_level ON public.grammar_patterns(level);
CREATE INDEX IF NOT EXISTS idx_grammar_patterns_category ON public.grammar_patterns(category);
CREATE INDEX IF NOT EXISTS idx_grammar_patterns_pattern ON public.grammar_patterns(pattern);
CREATE INDEX IF NOT EXISTS idx_grammar_progress_user_id ON public.grammar_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_grammar_progress_pattern_id ON public.grammar_progress(pattern_id);
CREATE INDEX IF NOT EXISTS idx_grammar_practice_pattern_id ON public.grammar_practice_questions(pattern_id);

-- Enable RLS
ALTER TABLE public.grammar_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar_practice_questions ENABLE ROW LEVEL SECURITY;

-- RLS policies for grammar_patterns (read-only for all authenticated users)
CREATE POLICY "Grammar patterns are viewable by all authenticated users"
ON public.grammar_patterns FOR SELECT
TO authenticated
USING (true);

-- RLS policies for grammar_progress
CREATE POLICY "Users can view their own grammar progress"
ON public.grammar_progress FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own grammar progress"
ON public.grammar_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own grammar progress"
ON public.grammar_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- RLS policies for grammar_practice_questions (read-only for all authenticated users)
CREATE POLICY "Grammar practice questions are viewable by all authenticated users"
ON public.grammar_practice_questions FOR SELECT
TO authenticated
USING (true);

-- Insert sample grammar patterns
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags) VALUES
-- Beginner patterns
('입니다', 'imnida', 'là (động từ trang trọng)', 'beginner', 'copula', 'Động từ trang trọng dùng để kết thúc câu, tương đương với "là" hoặc "đó là".', 'Dùng ở cuối câu để thể hiện sự trang trọng.',
  '[{"korean": "저는 학생입니다.", "vietnamese": "Tôi là sinh viên."}, {"korean": "이것은 책입니다.", "vietnamese": "Đây là sách."}]',
  ARRAY['입니다', '입니다까']::TEXT[], ARRAY['honorifics', 'copula']::TEXT[]),

('입니다까', 'imnikka', 'phải không là (trang trọng)', 'beginner', 'copula', 'Dạng câu hỏi của 입니다, dùng để hỏi xác nhận.', 'Dùng ở cuối câu hỏi để hỏi xác nhận một cách trang trọng.',
  '[{"korean": "학생입니까?", "vietnamese": "Bạn là sinh viên phải không?"}, {"korean": "한국 사람입니까?", "vietnamese": "Bạn là người Hàn Quốc phải không?"}]',
  ARRAY['입니다', '까']::TEXT[], ARRAY['honorifics', 'question']::TEXT[]),

('있습니다', 'isseumnida', 'có (trang trọng)', 'beginner', 'existence', 'Dạng trang trọng của 있다 (có/tồn tại).', 'Dùng để nói về sự tồn tại của vật hoặc người một cách trang trọng.',
  '[{"korean": "책이 있습니다.", "vietnamese": "Có sách."}, {"korean": "시간이 있습니다.", "vietnamese": "Có thời gian."}]',
  ARRAY['있다', '없습니다']::TEXT[], ARRAY['existence', 'honorifics']::TEXT[]),

('없습니다', 'eopseumnida', 'không có (trang trọng)', 'beginner', 'existence', 'Dạng phủ định trang trọng của 있다 (có).', 'Dùng để nói về sự không tồn tại một cách trang trọng.',
  '[{"korean": "돈이 없습니다.", "vietnamese": "Không có tiền."}, {"korean": "시간이 없습니다.", "vietnamese": "Không có thời gian."}]',
  ARRAY['있다', '있습니다']::TEXT[], ARRAY['existence', 'honorifics', 'negative']::TEXT[]),

-- Intermediate patterns
('-(으)려고 하다', '-(euryeo hada', 'đ định, muốn làm', 'intermediate', 'intention', 'Dùng để diễn tả ý định hoặc kế hoạch làm gì đó trong tương lai gần.', 'Thêm -(으)려고 vào động từ, sau đó là 하다.',
  '[{"korean": "저는 한국어를 공부하려고 해요.", "vietnamese": "Tôi định học tiếng Hàn."}, {"korean": "내일 서울에 가려고 해요.", "vietnamese": "Ngày mai tôi định đi Seoul."}]',
  ARRAY['-(으)ㄹ 거예요', '-(으)ㄹ래요']::TEXT[], ARRAY['intention', 'future']::TEXT[]),

('-(으)ㄹ 수 있다', '-(eul su itda', 'có thể làm được', 'intermediate', 'possibility', 'Dùng để diễn tả khả năng hoặc khả thi của hành động.', 'Thêm -(으)ㄹ 수 있다 vào động từ.',
  '[{"korean": "한국어를 할 수 있어요.", "vietnamese": "Tôi có thể nói tiếng Hàn."}, {"korean": "이 문제를 풀 수 있어요.", "vietnamese": "Tôi có thể giải được bài toán này."}]',
  ARRAY['-(으)ㄹ 수 없다', '할 수 있다']::TEXT[], ARRAY['possibility', 'ability']::TEXT[]),

('아/어/여 보다', 'a/eo/yeo boda', 'đã thử làm', 'intermediate', 'experience', 'Dùng để diễn tả đã thử làm một việc gì đó.', 'Thêm 아/어/여 vào động từ, sau đó là 보다.',
  '[{"korean": "한국 음식을 먹어 봤어요.", "vietnamese": "Tôi đã thử ăn đồ Hàn."}, {"korean": "서울에 가 봤어요.", "vietnamese": "Tôi đã thử đi Seoul."}]',
  ARRAY['아/어/여 있다', '보다']::TEXT[], ARRAY['experience', 'past']::TEXT[]),

-- Advanced patterns
('-(으)ㄹ 뿐만 아니라', '-(eul ppunmani anira', 'không chỉ... mà còn', 'advanced', 'conjunction', 'Dùng để kết hợp hai ý, nói về không chỉ A mà còn cả B.', 'Thêm -(으)ㄹ 뿐만 아니라 vào danh từ hoặc động từ.',
  '[{"korean": "그는 똑똑할 뿐만 아니라 친절해요.", "vietnamese": "Anh ấy không chỉ thông minh mà còn thân thiện."}, {"korean": "한국어뿐만 아니라 영어도 할 수 있어요.", "vietnamese": "Tôi không chỉ nói tiếng Hàn mà còn nói tiếng Anh."}]',
  ARRAY['뿐만 아니라', '뿐더러']::TEXT[], ARRAY['conjunction', 'emphasis']::TEXT[]),

('-(으)ㄹ 수밖에 없다', '-(eul subakke eopda', 'chỉ có thể làm, buộc phải làm', 'advanced', 'necessity', 'Dùng để diễn tả không còn lựa chọn nào khác ngoài việc đó.', 'Thêm -(으)ㄹ 수밖에 없다 vào động từ.',
  '[{"korean": "가야 할 수밖에 없어요.", "vietnamese": "Tôi buộc phải đi."}, {"korean": "이 일을 해야 할 수밖에 없어요.", "vietnamese": "Tôi buộc phải làm việc này."}]',
  ARRAY['-(으)ㄹ 수 있다', '-(으)려면']::TEXT[], ARRAY['necessity', 'no choice']::TEXT[]),

('다면', 'damyeon', 'nếu', 'advanced', 'conditional', 'Dùng để tạo câu điều kiện, tương đương với "nếu".', 'Thêm 다면 vào cuối mệnh đề điều kiện.',
  '[{"korean": "비가 오면 안 가요.", "vietnamese": "Nếu trời mưa thì tôi không đi."}, {"korean": "시간이 있으면 도와줄게요.", "vietnamese": "Nếu có thời gian thì tôi sẽ giúp."}]',
  ARRAY['-(으)면', '거든']::TEXT[], ARRAY['conditional', 'if']::TEXT[]);
