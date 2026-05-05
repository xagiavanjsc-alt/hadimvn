-- Migration 052: Insert TOPIK grammar patterns (real data)
-- Dữ liệu ngữ pháp TOPIK thực tế, bổ sung từng bước

-- ═══════════════════════════════════════════════════════════════════════════════
-- #1: A/V – 아/어서 [vì... nên..., do... nên...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 아/어서',
  'a/eo-seo',
  'vì... nên..., do... nên...',
  'beginner',
  'connective',
  'Mệnh đề trước là nguyên nhân gây ra kết quả ở mệnh đề sau. Vế sau không dùng câu mệnh lệnh, cầu khiến và vế trước chỉ chia thì hiện tại. Với danh từ dùng (이)라서 hoặc 여서/이어서.',
  'A/V(ㅏ/ㅗ) + 아서 / A/V(khác) + 어서 / 하다 → 해서 / N + (이)라서',
  '[
    {"korean": "배가 고파서 많이 먹었어요.", "vietnamese": "Vì đói bụng nên tôi đã ăn nhiều."},
    {"korean": "좀 늦어서 택시를 탔어요.", "vietnamese": "Vì muộn nên tôi đã đi taxi."},
    {"korean": "기뻐서 눈물이 났어요.", "vietnamese": "Vì vui nên tôi đã rơi nước mắt."},
    {"korean": "주말이라서 사람이 많아요.", "vietnamese": "Vì là cuối tuần nên người đông."},
    {"korean": "퇴근 시간에는 차가 많아서 버스를 타요.", "vietnamese": "Vào giờ tan làm, vì nhiều xe nên tôi đã đi xe bus."},
    {"korean": "열심히 공부해서 100점을 받았어요.", "vietnamese": "Vì chăm học nên tôi đã được 100 điểm."},
    {"korean": "저는 심심해서 공원에 가고 싶어요.", "vietnamese": "Vì chán nên tôi muốn đi công viên."},
    {"korean": "눈이 와서 길이 미끄러워요.", "vietnamese": "Vì tuyết rơi nên đường trơn."},
    {"korean": "배가 아파서 학교에 못 갔어요.", "vietnamese": "Vì đau bụng nên tôi đã không thể đến trường."},
    {"korean": "저는 화장을 하지 않아서 못생겨 보여요.", "vietnamese": "Vì tôi không trang điểm nên trông xấu xí."}
  ]'::jsonb,
  ARRAY['-(으)니까', '-기 때문에', '-아/어 가지고']::TEXT[],
  ARRAY['connective', 'cause', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

-- Insert practice questions for A/V – 아/어서
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어서' LIMIT 1),
  '배가 고프 ___ 많이 먹었어요.',
  'fill_blank',
  '["아서", "어서", "라서", "고서"]'::jsonb,
  '아서',
  '고프다 → 고파서 (ㅡ bị lược bỏ, nguyên âm ㅗ nên thêm 아서)',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어서' LIMIT 1),
  '좀 늦 ___ 택시를 탔어요.',
  'fill_blank',
  '["아서", "어서", "라서", "해서"]'::jsonb,
  '어서',
  '늦다 → 늦어서 (nguyên âm ㅡ, không phải ㅏ/ㅗ nên dùng 어서)',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어서' LIMIT 1),
  '주말 ___ 사람이 많아요.',
  'multiple_choice',
  '["아서", "어서", "이라서", "해서"]'::jsonb,
  '이라서',
  '주말 là danh từ kết thúc bằng phụ âm ㄹ → dùng 이라서',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어서' LIMIT 1),
  '열심히 공부 ___ 100점을 받았어요.',
  'fill_blank',
  '["아서", "어서", "해서", "라서"]'::jsonb,
  '해서',
  '공부하다 → 공부해서 (하다 luôn biến thành 해서)',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #2: A/V – (으)니까 [vì... nên..., do... nên...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)니까',
  '(eu)nikka',
  'vì... nên..., do... nên...',
  'beginner',
  'connective',
  'Mệnh đề trước là nguyên nhân gây kết quả mệnh đề sau. Vế sau thường dùng mệnh lệnh, cầu khiến. Vế trước có thể chia quá khứ (-았/었으니까) hoặc tương lai (-겠으니까).',
  'A/V(nguyên âm/ㄹ) + 니까 / A/V(phụ âm) + 으니까',
  '[
    {"korean": "추우니까 옷을 많이 입고 가세요.", "vietnamese": "Vì trời lạnh nên hãy mặc nhiều áo vào nhé."},
    {"korean": "날씨가 좋으니까 같이 산책할래요?", "vietnamese": "Vì trời đẹp nên hãy cùng nhau đi dạo nhé?"},
    {"korean": "이번주는 바쁘니까 다음 주에 놀러 갑시다.", "vietnamese": "Vì tuần này tôi bận nên tuần sau đi chơi nhé?"},
    {"korean": "전에 한국에 살았으니까 한국말을 조금 할 수 있어요.", "vietnamese": "Vì trước đây tôi đã sống ở Hàn Quốc nên tôi có thể nói được một chút tiếng Hàn."},
    {"korean": "더우니까 시원한 것을 먹을래요?", "vietnamese": "Vì trời nóng nên đi ăn cái gì mát mát nhé?"},
    {"korean": "밥이 없으니까 라면 먹자.", "vietnamese": "Vì không có cơm nên hãy ăn mì thôi nào."},
    {"korean": "길이 막히니까 지하철을 탑시다.", "vietnamese": "Vì tắc đường nên hãy đi tàu điện ngầm."},
    {"korean": "내일 발표가 있으니까 같이 준비합시다.", "vietnamese": "Ngày mai có bài phát biểu nên hãy cùng nhau chuẩn bị thôi nào."},
    {"korean": "비가 올 것 같으니 우산을 가지고 가세요.", "vietnamese": "Vì trời có thể sẽ mưa nên hãy đem theo ô nhé."},
    {"korean": "길이 미끄러우니까 넘어지지 않게 조심하세요.", "vietnamese": "Vì đường trơn nên hãy cẩn thận để không ngã."}
  ]'::jsonb,
  ARRAY['A/V – 아/어서', '-기 때문에', '-는 바람에']::TEXT[],
  ARRAY['connective', 'cause', 'topik1', 'beginner', 'imperative']::TEXT[],
  'TOPIK I'
);

-- Insert practice questions for A/V – (으)니까
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)니까' LIMIT 1),
  '추우 ___ 옷을 많이 입고 가세요.',
  'fill_blank',
  '["니까", "어서", "아서", "고서"]'::jsonb,
  '니까',
  '춥다 → 추우니까 (bất quy tắc ㅂ, nguyên âm → 니까). Vế sau là mệnh lệnh nên dùng -(으)니까.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)니까' LIMIT 1),
  '전에 한국에 살 ___ 한국말을 조금 할 수 있어요.',
  'fill_blank',
  '["았으니까", "아서", "어서", "으니까"]'::jsonb,
  '았으니까',
  '살다 + 았으니까 → 살았으니까. Vế trước chia quá khứ nên dùng 았으니까.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)니까' LIMIT 1),
  '길이 막히 ___ 지하철을 탑시다.',
  'multiple_choice',
  '["니까", "어서", "아서", "라서"]'::jsonb,
  '니까',
  '막히다 → 막히니까 (nguyên âm → 니까). Vế sau là đề nghị 탑시다 nên dùng -(으)니까.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)니까' LIMIT 1),
  '날씨가 좋 ___ 같이 산책할래요?',
  'fill_blank',
  '["으니까", "아서", "어서", "니까"]'::jsonb,
  '으니까',
  '좋다 → 좋으니까 (phụ âm ㅎ → 으니까). Vế sau là đề nghị nên dùng -(으)니까.',
  'medium'
);
