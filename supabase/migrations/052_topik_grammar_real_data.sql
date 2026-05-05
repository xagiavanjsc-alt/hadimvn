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

-- ═══════════════════════════════════════════════════════════════════════════════
-- #3: N 때문에, A/V – 기 때문에 [tại... nên..., do... nên...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N 때문에, A/V – 기 때문에',
  'ttaemune / gi ttaemune',
  'tại... nên..., do... nên...',
  'beginner',
  'connective',
  'Diễn tả lý do, tại một lí do nào đó dẫn đến kết quả vế sau. Vế sau là kết quả có phần chưa tốt, tuy nhiên vẫn có thể có kết quả tốt. Có thể dùng nhiều hơn trong văn viết so với – 아/어서 và – (으)니까. Có thể dùng đuôi câu dạng 기 때문이다. Vế sau không dùng mệnh lệnh và các dạng cầu khiến.',
  'N + 때문에 / A/V + 기 때문에 / N + (이)기 때문에',
  '[
    {"korean": "비 때문에 차가 막혀요.", "vietnamese": "Tại trời mưa nên kẹt xe."},
    {"korean": "바쁘기 때문에 여행을 못 가요.", "vietnamese": "Tại vì bận nên tôi không thể đi du lịch."},
    {"korean": "왜냐하면 너무 피곤하기 때문입니다.", "vietnamese": "Nếu hỏi tại sao thì tại vì tôi quá mệt."},
    {"korean": "저는 배고프기 때문에 밥을 먹고 싶어요.", "vietnamese": "Vì đói nên tôi muốn ăn cơm."},
    {"korean": "눈이 내리기 때문에 길이 미끄러워요.", "vietnamese": "Vì tuyết rơi nên đường trơn."},
    {"korean": "아이 때문에 밥을 못 먹어요.", "vietnamese": "Vì đứa bé mà tôi không thể ăn cơm."},
    {"korean": "학생이기 때문에 할인을 받았어요.", "vietnamese": "Vì là học sinh nên tôi được giảm giá."},
    {"korean": "외국인이기 때문에 한국말을 잘 못해요.", "vietnamese": "Vì là người nước ngoài nên tôi không thể nói được tiếng Hàn."},
    {"korean": "감기에 걸렸기 때문에 병원에 갔어요.", "vietnamese": "Vì bị cảm nên tôi đã đến bệnh viện."},
    {"korean": "비싸기 때문에 살 수 없어요.", "vietnamese": "Vì đắt nên tôi không thể mua được."}
  ]'::jsonb,
  ARRAY['A/V – 아/어서', 'A/V – (으)니까', '-는 바람에']::TEXT[],
  ARRAY['connective', 'cause', 'topik1', 'beginner', 'formal']::TEXT[],
  'TOPIK I'
);

-- Insert practice questions for N 때문에, A/V – 기 때문에
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 때문에, A/V – 기 때문에' LIMIT 1),
  '비 ___ 차가 막혀요.',
  'fill_blank',
  '["때문에", "기 때문에", "어서", "니까"]'::jsonb,
  '때문에',
  '비 là danh từ → dùng N 때문에.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 때문에, A/V – 기 때문에' LIMIT 1),
  '바쁘 ___ 여행을 못 가요.',
  'fill_blank',
  '["기 때문에", "때문에", "어서", "니까"]'::jsonb,
  '기 때문에',
  '바쁘다 là tính từ → dùng A + 기 때문에.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 때문에, A/V – 기 때문에' LIMIT 1),
  '학생이 ___ 할인을 받았어요.',
  'multiple_choice',
  '["기 때문에", "때문에", "어서", "니까"]'::jsonb,
  '기 때문에',
  '학생 là danh từ + 이기 때문에 = vì LÀ học sinh.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 때문에, A/V – 기 때문에' LIMIT 1),
  '감기에 걸렸 ___ 병원에 갔어요.',
  'fill_blank',
  '["기 때문에", "때문에", "어서", "으니까"]'::jsonb,
  '기 때문에',
  '걸리다 → 걸렸기 때문에. Động từ chia quá khứ + 기 때문에.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #4: N – (이)거든요, A/V –거든요 [vì... / ...đấy nhé]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – (이)거든요, A/V –거든요',
  '(i)geodeunyo',
  'vì... / ...đấy nhé',
  'beginner',
  'ending',
  'Dùng để đáp lại câu hỏi, hoặc khi người nói muốn đưa ra ý kiến, lý do mà người nghe chưa biết. Cũng dùng khi thông báo điều người nghe chưa biết, thể hiện tiền đề của nội dung sẽ tiếp nối về sau. Chỉ sử dụng trong văn nói, khi trò chuyện với người quen, không dùng trong trường hợp trang trọng.',
  'A/V + 거든요 / N(nguyên âm) + 거든요 / N(phụ âm) + 이거든요',
  '[
    {"korean": "아니요, 못 갔어요. 날씨가 나빴거든요.", "vietnamese": "Không, tôi không thể đến được. Vì thời tiết xấu."},
    {"korean": "요즘 장마철이거든요. 한 달 동안은 계속 올 거예요.", "vietnamese": "Vì gần đây đang là mùa mưa đấy. Sẽ tiếp tục mưa trong một tháng nữa."},
    {"korean": "어제 영화를 보느라고 잠을 못 잤거든요.", "vietnamese": "Vì hôm qua tôi mải xem phim nên đã không ngủ."},
    {"korean": "오늘은 지각하면 안 돼요. 오늘 수업에서 제가 발표를 하거든요.", "vietnamese": "Hôm nay không được đến muộn. Vì trong tiết học hôm nay tôi sẽ thuyết trình."},
    {"korean": "삼촌은 언제 오실 수 있는지 잘 모르겠어요. 연락이 아직 안 왔거든요.", "vietnamese": "Tôi không rõ chú khi nào có thể đến được. Vì vẫn không thấy có liên lạc gì."},
    {"korean": "집에 친구들이 많이 오거든요.", "vietnamese": "Vì nhiều người bạn đến nhà tôi đấy."},
    {"korean": "감기약을 먹었거든요. 그런데도 나아지지를 않네요.", "vietnamese": "Tôi đã uống thuốc cảm rồi đấy. Nhưng dù vậy nó vẫn không đỡ hơn."}
  ]'::jsonb,
  ARRAY['A/V – 아/어서', 'A/V – (으)니까', 'N 때문에, A/V – 기 때문에']::TEXT[],
  ARRAY['ending', 'cause', 'topik1', 'beginner', 'spoken']::TEXT[],
  'TOPIK I'
);

-- Insert practice questions for N – (이)거든요, A/V –거든요
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N – (이)거든요, A/V –거든요' LIMIT 1),
  '못 갔어요. 날씨가 나빴 ___.',
  'fill_blank',
  '["거든요", "어서", "니까", "때문에"]'::jsonb,
  '거든요',
  'Đáp lại câu hỏi, đưa ra lý do người nghe chưa biết → dùng -거든요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N – (이)거든요, A/V –거든요' LIMIT 1),
  '요즘 장마철이 ___. 한 달 동안은 계속 올 거예요.',
  'fill_blank',
  '["거든요", "어서요", "니까요", "때문이에요"]'::jsonb,
  '거든요',
  '장마철 là danh từ kết thúc phụ âm ㄹ → 이거든요. Thông báo tiền đề.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N – (이)거든요, A/V –거든요' LIMIT 1),
  '오늘 수업에서 제가 발표를 하 ___.',
  'multiple_choice',
  '["거든요", "어서요", "니까요", "기 때문에요"]'::jsonb,
  '거든요',
  '하다 + 거든요. Đưa ra lý do người nghe chưa biết.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N – (이)거든요, A/V –거든요' LIMIT 1),
  '감기약을 먹었 ___. 그런데도 나아지지를 않네요.',
  'fill_blank',
  '["거든요", "어서요", "으니까요", "기 때문에"]'::jsonb,
  '거든요',
  '먹다 chia quá khứ 먹었 + 거든요. Thông báo điều người nghe chưa biết.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #5: N – (이)잖아요, A/V – 잖아요 [vì... mà, mà]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – (이)잖아요, A/V – 잖아요',
  '(i)janhayo',
  'vì... mà, mà',
  'beginner',
  'ending',
  'Khi người nói muốn đưa ra ý kiến, lý do mà người nghe cũng biết, hoặc gợi lại cho người nghe lý do mà người nghe có vẻ đã quên. Còn dùng để trách mắng hoặc khiển trách khi không nghe theo lời khuyên dẫn đến kết quả không tốt. Chỉ dùng trong văn nói, với người thân thiết.',
  'A/V + 잖아요 / N(nguyên âm) + 잖아요 / N(phụ âm) + 이잖아요',
  '[
    {"korean": "담배를 끊었잖아요.", "vietnamese": "Vì tôi bỏ thuốc lá rồi mà."},
    {"korean": "예쁘잖아.", "vietnamese": "Vì đẹp mà."},
    {"korean": "수영 씨가 새우 알레르기가 있잖아.", "vietnamese": "Sooyoung bị dị ứng tôm mà."},
    {"korean": "목요일에는 영어 수업이 있잖아요.", "vietnamese": "Thứ 5 có tiết học tiếng Anh mà."},
    {"korean": "회의는 오후에 하기로 했잖아요.", "vietnamese": "Cuộc họp diễn ra vào buổi chiều mà."},
    {"korean": "비가 아니라 눈이 오잖아.", "vietnamese": "Không phải mưa mà là tuyết mà."},
    {"korean": "마리 씨는 일본에서 살았잖아요. 지난번에 마리 씨가 말했는데 생각 안 나요?", "vietnamese": "Mari đã sống ở Nhật mà. Lần trước Mari nói bạn không nhớ à?"}
  ]'::jsonb,
  ARRAY['N – (이)거든요, A/V –거든요', 'A/V – (으)니까']::TEXT[],
  ARRAY['ending', 'cause', 'topik1', 'beginner', 'spoken']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N – (이)잖아요, A/V – 잖아요' LIMIT 1),
  '담배를 끊었 ___.',
  'fill_blank',
  '["잖아요", "거든요", "니까요", "어서요"]'::jsonb,
  '잖아요',
  'Gợi lại lý do người nghe cũng biết → dùng -잖아요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N – (이)잖아요, A/V – 잖아요' LIMIT 1),
  '목요일에는 영어 수업이 있 ___.',
  'fill_blank',
  '["잖아요", "거든요", "어서요", "기 때문에"]'::jsonb,
  '잖아요',
  'Nhắc lại điều người nghe đã biết nhưng quên → dùng -잖아요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N – (이)잖아요, A/V – 잖아요' LIMIT 1),
  '회의는 오후에 하기로 했 ___.',
  'multiple_choice',
  '["잖아요", "거든요", "니까요", "때문에"]'::jsonb,
  '잖아요',
  'Nhắc lại quyết định đã có → dùng -잖아요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N – (이)잖아요, A/V – 잖아요' LIMIT 1),
  '마리 씨는 일본에서 살았 ___.',
  'fill_blank',
  '["잖아요", "거든요", "어서요", "니까요"]'::jsonb,
  '잖아요',
  'Gợi lại thông tin người nghe đã biết → dùng -잖아요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #6: N –(이)고, A/V – 고 [và, còn]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N –(이)고, A/V – 고',
  '(i)go',
  'và, còn',
  'beginner',
  'connective',
  'Liệt kê về mặt không gian. Sử dụng khi mệnh đề trước và sau là những hành động hay trạng thái tương tự nhau. Cả hai vế câu có ý nghĩa bình đẳng và có thể hoán đổi. Có thể dùng dạng N1 도 + 고 + N2 도... Có thể sử dụng với 았/었 hay 겠.',
  'A/V + 고 / N(nguyên âm) + 고 / N(phụ âm) + 이고',
  '[
    {"korean": "내 친구는 공부도 잘하고 얼굴도 예뻐요.", "vietnamese": "Bạn tôi học giỏi và có khuôn mặt xinh xắn."},
    {"korean": "빵은 부드럽고 맛있어요.", "vietnamese": "Bánh mì mềm và ngon."},
    {"korean": "오늘 빨래하고 청소해요.", "vietnamese": "Hôm nay tôi giặt giũ và dọn dẹp."},
    {"korean": "날씨도 좋고 경치도 예뻐요.", "vietnamese": "Trời đẹp và cảnh cũng đẹp."},
    {"korean": "여기는 휴게실이고 저기는 사무실이에요.", "vietnamese": "Ở đây là phòng nghỉ và ở kia là văn phòng."},
    {"korean": "지수는 키도 크고 예뻐서 인기가 많아요.", "vietnamese": "Jisoo cao và xinh đẹp nên được yêu thích."},
    {"korean": "비가 몹시 내리고 바람도 심하게 불어요.", "vietnamese": "Trời mưa to và gió thổi mạnh."},
    {"korean": "아버지는 회사에 가시고 누나는 학교에 갔어요.", "vietnamese": "Bố tôi thì đi làm còn chị tôi thì đi học."},
    {"korean": "눈이 오고 날씨가 추워요.", "vietnamese": "Tuyết rơi và trời lạnh."},
    {"korean": "딸기가 싸고 맛있어요.", "vietnamese": "Dâu tây rẻ và ngon."}
  ]'::jsonb,
  ARRAY['A/V – 거나', 'A/V – 아/어서']::TEXT[],
  ARRAY['connective', 'listing', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N –(이)고, A/V – 고' LIMIT 1),
  '빵은 부드럽 ___ 맛있어요.',
  'fill_blank',
  '["고", "어서", "니까", "거나"]'::jsonb,
  '고',
  'Liệt kê 2 trạng thái bình đẳng (mềm + ngon) → dùng -고.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N –(이)고, A/V – 고' LIMIT 1),
  '날씨도 좋 ___ 경치도 예뻐요.',
  'fill_blank',
  '["고", "어서", "니까", "지만"]'::jsonb,
  '고',
  'Liệt kê 2 trạng thái cùng chiều → dùng -고.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N –(이)고, A/V – 고' LIMIT 1),
  '여기는 휴게실이 ___ 저기는 사무실이에요.',
  'multiple_choice',
  '["고", "어서", "니까", "거나"]'::jsonb,
  '고',
  'Danh từ + (이)고. Liệt kê bình đẳng.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N –(이)고, A/V – 고' LIMIT 1),
  '눈이 오 ___ 날씨가 추워요.',
  'fill_blank',
  '["고", "어서", "니까", "거나"]'::jsonb,
  '고',
  'Liệt kê 2 sự kiện cùng xảy ra → dùng -고.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #7: A/V – 거나 [hoặc..., hay...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 거나',
  'geona',
  'hoặc..., hay...',
  'beginner',
  'connective',
  'Biểu hiện sự lựa chọn một trong hai hoặc nhiều sự vật, trạng thái. Vế trước chia hiện tại.',
  'A/V + 거나',
  '[
    {"korean": "오후에 축구를 하거나 농구를 할 거예요.", "vietnamese": "Vào buổi chiều tôi chơi bóng đá hoặc chơi bóng rổ."},
    {"korean": "주말에 보통 쉬거나 책을 읽어요.", "vietnamese": "Vào cuối tuần tôi thường nghỉ ngơi hoặc đọc sách."},
    {"korean": "저는 맵거나 짠 음식을 잘 못 먹어요.", "vietnamese": "Tôi không thể ăn đồ ăn cay hoặc mặn."},
    {"korean": "민준 씨는 주말에 보통 친구를 만나거나 영화를 봐요.", "vietnamese": "Vào cuối tuần Minchun thường gặp bạn bè hoặc xem phim."},
    {"korean": "외모로 봤을 때 그는 경찰이거나 군인인 것 같았어요.", "vietnamese": "Khi nhìn vào ngoại hình thì người đó chắc là cảnh sát hoặc bộ đội."},
    {"korean": "아침에 빵을 먹거나 라면을 먹어요.", "vietnamese": "Bữa sáng tôi ăn bánh mì hoặc ăn mì."},
    {"korean": "늦거나 가방이 무거울 때 택시를 타요.", "vietnamese": "Khi muộn hoặc túi xách nặng thì tôi sẽ đi taxi."},
    {"korean": "외식을 하거나 피자를 주문합시다.", "vietnamese": "Chúng ta hãy đi ăn ngoài hoặc đặt pizza về."},
    {"korean": "병원에 가거나 약을 먹었나요?", "vietnamese": "Bạn đã đến bệnh viện hay uống thuốc chưa?"},
    {"korean": "방학에 아르바이트를 하거나 고향을 돌아가요.", "vietnamese": "Vào kì nghỉ tôi đi làm thêm hoặc về quê."}
  ]'::jsonb,
  ARRAY['N –(이)고, A/V – 고', 'N –(이)나']::TEXT[],
  ARRAY['connective', 'choice', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 거나' LIMIT 1),
  '주말에 보통 쉬 ___ 책을 읽어요.',
  'fill_blank',
  '["거나", "고", "어서", "니까"]'::jsonb,
  '거나',
  'Lựa chọn một trong hai hành động → dùng -거나.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 거나' LIMIT 1),
  '아침에 빵을 먹 ___ 라면을 먹어요.',
  'fill_blank',
  '["거나", "고", "어서", "지만"]'::jsonb,
  '거나',
  'Lựa chọn một trong hai → dùng -거나.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 거나' LIMIT 1),
  '늦 ___ 가방이 무거울 때 택시를 타요.',
  'multiple_choice',
  '["거나", "고", "어서", "니까"]'::jsonb,
  '거나',
  'Lựa chọn một trong hai trường hợp → dùng -거나.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 거나' LIMIT 1),
  '병원에 가 ___ 약을 먹었나요?',
  'fill_blank',
  '["거나", "고", "어서", "니까"]'::jsonb,
  '거나',
  'Hỏi lựa chọn một trong hai → dùng -거나.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #8: A/V – 지만 [nhưng]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 지만',
  'jiman',
  'nhưng',
  'beginner',
  'connective',
  'Nội dung vế sau trái ngược với nội dung vế trước. Khi dùng với thì quá khứ thì sử dụng dạng 았/었/였지만, tương lai 겠지만.',
  'A/V + 지만 / A/V + 았/었/였지만 / A/V + 겠지만',
  '[
    {"korean": "어제 학교에 갔지만 수업이 없었습니다.", "vietnamese": "Hôm qua tôi đã đến trường nhưng không có tiết học nào."},
    {"korean": "김치가 맛있지만 좀 맵습니다.", "vietnamese": "Kim chi ngon nhưng hơi cay."},
    {"korean": "한국어 재미있지만 좀 어려워요.", "vietnamese": "Tiếng Hàn thú vị nhưng khó."},
    {"korean": "한국 여행은 힘들었지만 재미있었어요.", "vietnamese": "Chuyến du lịch Hàn Quốc mệt nhưng vui."},
    {"korean": "교실 밖에는 춥지만 안에는 따뜻해요.", "vietnamese": "Ngoài lớp học lạnh nhưng trong lớp học thì ấm."},
    {"korean": "휴대전화는 비싸지만 편리해요.", "vietnamese": "Điện thoại đắt nhưng tiện lợi."},
    {"korean": "민호 씨에게 전화를 했지만 받지 않았어요.", "vietnamese": "Tôi đã gọi điện cho Minho nhưng không bắt máy."},
    {"korean": "저는 한국어를 배우고 싶지만 시간이 없어요.", "vietnamese": "Tôi muốn học tiếng Hàn nhưng không có thời gian."},
    {"korean": "제 친구는 키가 작지만 농구를 잘해요.", "vietnamese": "Bạn tôi tuy thấp nhưng chơi bóng rổ giỏi."},
    {"korean": "라면은 맛있지만 건강에 좋지는 않아요.", "vietnamese": "Mì tôm ngon nhưng không tốt cho sức khỏe."}
  ]'::jsonb,
  ARRAY['N –(이)고, A/V – 고', 'A/V – 거나', 'A/V – 아/어서']::TEXT[],
  ARRAY['connective', 'contrast', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 지만' LIMIT 1),
  '김치가 맛있 ___ 좀 맵습니다.',
  'fill_blank',
  '["지만", "고", "거나", "어서"]'::jsonb,
  '지만',
  'Trái ngược: ngon vs cay → dùng -지만.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 지만' LIMIT 1),
  '한국어 재미있 ___ 좀 어려워요.',
  'fill_blank',
  '["지만", "고", "거나", "니까"]'::jsonb,
  '지만',
  'Trái ngược: thú vị vs khó → dùng -지만.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 지만' LIMIT 1),
  '어제 학교에 갔 ___ 수업이 없었습니다.',
  'multiple_choice',
  '["지만", "고", "거나", "어서"]'::jsonb,
  '지만',
  'Quá khứ + 지만 = 갔지만. Trái ngược.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 지만' LIMIT 1),
  '휴대전화는 비싸 ___ 편리해요.',
  'fill_blank',
  '["지만", "고", "거나", "니까"]'::jsonb,
  '지만',
  'Trái ngược: đắt vs tiện lợi → dùng -지만.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #9: A/V – (으)ㄴ/는데 [nhưng, còn, nên...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ/는데',
  '(eu)nde',
  'nhưng, còn, nên...',
  'beginner',
  'connective',
  'Thể hiện sự tương phản, trái ngược. Đưa ra thông tin bối cảnh để giải thích trước khi đặt câu hỏi, rủ rê, ra lệnh. Từ chối lịch sự hoặc khi có thêm thông tin muốn nói. Chia động từ: quá khứ 았/었었는데, hiện tại A+(으)ㄴ데/V+는데, tương lai 겠는데/(으)ㄹ 건데.',
  'A + (으)ㄴ데 / V + 는데 / A/V + 았/었었는데 / A/V + 겠데',
  '[
    {"korean": "어제는 따뜻했는데 오늘은 좀 쌀쌀해요.", "vietnamese": "Hôm qua trời nóng nhưng hôm nay trời se se lạnh."},
    {"korean": "가방은 예쁜데 좀 비싸요.", "vietnamese": "Túi xách đẹp nhưng hơi đắt."},
    {"korean": "이 식당은 음식이 맛있는데 좀 비싸요.", "vietnamese": "Nhà hàng này đồ ăn ngon nhưng hơi đắt."},
    {"korean": "방은 좀 작은데 너무 깨끗해요.", "vietnamese": "Phòng tuy hơi bé nhưng sạch sẽ."},
    {"korean": "일은 많은데 월급은 적어요.", "vietnamese": "Việc thì nhiều mà lương thì thấp."},
    {"korean": "비가 오는데 어디에 가요?", "vietnamese": "Trời đang mưa, bạn đi đâu vậy?"},
    {"korean": "날씨가 좋은데 같이 산책할래요?", "vietnamese": "Trời đẹp quá chúng ta cùng đi dạo nhé?"},
    {"korean": "좀 피곤한데 잠깐 쉬는게 어때요?", "vietnamese": "Tôi hơi mệt nên tôi nghỉ ngơi một chút nhé?"},
    {"korean": "아니요, 예쁜데요.", "vietnamese": "Không, nó đẹp mà."},
    {"korean": "미안해요. 오늘 약속이 있는데요.", "vietnamese": "Xin lỗi nha. Hôm nay tôi đã có hẹn rồi."}
  ]'::jsonb,
  ARRAY['A/V – 지만', 'A/V – (으)니까', 'A/V – 아/어서']::TEXT[],
  ARRAY['connective', 'contrast', 'topik1', 'beginner', 'spoken']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는데' LIMIT 1),
  '가방은 예쁜 ___ 좀 비싸요.',
  'fill_blank',
  '["데", "지만", "고", "거나"]'::jsonb,
  '데',
  'Tương phản: đẹp nhưng đắt → dùng -는데.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는데' LIMIT 1),
  '일은 많은 ___ 월급은 적어요.',
  'fill_blank',
  '["데", "지만", "고", "어서"]'::jsonb,
  '데',
  'Tương phản: việc nhiều lương thấp → dùng -는데.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는데' LIMIT 1),
  '비가 오 ___ 어디에 가요?',
  'multiple_choice',
  '["는데", "지만", "고", "니까"]'::jsonb,
  '는데',
  'Đưa bối cảnh trước khi hỏi → dùng -는데.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는데' LIMIT 1),
  '날씨가 좋은 ___ 같이 산책할래요?',
  'fill_blank',
  '["데", "지만", "고", "거나"]'::jsonb,
  '데',
  'Đưa bối cảnh trước khi rủ → dùng -는데.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #10: N 전에, V – 기 전에 [trước khi...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N 전에, V – 기 전에',
  'jeone / gi jeone',
  'trước khi...',
  'beginner',
  'time',
  'Diễn tả hành động hay tình huống nào đó xuất hiện, xảy ra TRƯỚC một sự việc khác. Có thể gắn cùng các tiểu từ 부터/까지.',
  'N + 전에 / V + 기 전에',
  '[
    {"korean": "회사에 가기 전에 아침을 먹어요.", "vietnamese": "Trước khi đi làm tôi ăn sáng."},
    {"korean": "저는 잠을 자기 전에 책을 읽어요.", "vietnamese": "Trước khi ngủ tôi đọc sách."},
    {"korean": "보고서는 금요일 전까지 제출해 주세요.", "vietnamese": "Đến trước thứ 6, hãy nộp bài báo cáo."},
    {"korean": "밥 먹기 전에 손을 씻어야 해요.", "vietnamese": "Trước khi ăn cơm phải rửa tay."},
    {"korean": "고향에 가기 전에 선물을 준비했어요.", "vietnamese": "Trước khi về quê tôi đã chuẩn bị quà."},
    {"korean": "밥 먹기 30 분전에 약을 드세요.", "vietnamese": "Hãy uống thuốc trước khi ăn 30 phút."},
    {"korean": "친구의 집을 방문하기 전에 전화를 했어요.", "vietnamese": "Tôi đã gọi điện trước khi đến nhà bạn."},
    {"korean": "한국에 오기 전에 무엇을 하셨습니까?", "vietnamese": "Bạn đã làm gì trước khi đến Hàn Quốc?"},
    {"korean": "자동차를 사기 전에 운전을 배우십시오.", "vietnamese": "Hãy học lái xe trước khi mua xe hơi."},
    {"korean": "할머니께서는 2년 전에 돌아가셨어요.", "vietnamese": "Bà tôi đã qua đời 2 năm trước."}
  ]'::jsonb,
  ARRAY['N 후에, V – (으)ㄴ 후에', 'V – (으)ㄴ 다음에']::TEXT[],
  ARRAY['time', 'before', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 전에, V – 기 전에' LIMIT 1),
  '회사에 가 ___ 아침을 먹어요.',
  'fill_blank',
  '["기 전에", "전에", "후에", "는데"]'::jsonb,
  '기 전에',
  'Động từ + 기 전에 = trước khi làm gì.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 전에, V – 기 전에' LIMIT 1),
  '저는 잠을 자 ___ 책을 읽어요.',
  'fill_blank',
  '["기 전에", "전에", "후에", "는데"]'::jsonb,
  '기 전에',
  'Động từ + 기 전에 = trước khi ngủ.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 전에, V – 기 전에' LIMIT 1),
  '보고서는 금요일 ___ 제출해 주세요.',
  'multiple_choice',
  '["전까지", "기 전에", "후에", "는데"]'::jsonb,
  '전까지',
  'Danh từ + 전까지 = đến trước thứ 6.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 전에, V – 기 전에' LIMIT 1),
  '밥 먹 ___ 손을 씻어야 해요.',
  'fill_blank',
  '["기 전에", "전에", "후에", "는데"]'::jsonb,
  '기 전에',
  'Động từ + 기 전에 = trước khi ăn.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #11: N 후에, V – (으)ㄴ 후에 [sau khi...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N 후에, V – (으)ㄴ 후에',
  'hue / (eu)n hue',
  'sau khi...',
  'beginner',
  'time',
  'Diễn tả hành động hay tình huống nào đó xuất hiện, xảy ra SAU một sự việc khác. Có thể gắn cùng các tiểu từ 부터/까지. Có thể thay thế bằng V – (으)ㄴ 다음에 hoặc V – (으)ㄴ 뒤에.',
  'N + 후에 / V + (으)ㄴ 후에',
  '[
    {"korean": "점심을 먹은 후에 영화를 볼까요?", "vietnamese": "Sau khi ăn trưa cùng nhau đi xem phim nhé?"},
    {"korean": "시험 후에 뭐 할 거예요?", "vietnamese": "Sau kì thi bạn sẽ làm gì?"},
    {"korean": "집에 돌아온 다음에 샤워했어요.", "vietnamese": "Sau khi về nhà tôi đã tắm."},
    {"korean": "결혼한 후에 그 여자는 직장을 그만두었어요.", "vietnamese": "Cô ấy đã nghỉ làm sau khi kết hôn."},
    {"korean": "30분 후에 도서관 앞에서 만나자.", "vietnamese": "Gặp nhau ở trước thư viện sau ba mươi phút nữa nhé."},
    {"korean": "밥을 먹은 후에 이를 닦아요.", "vietnamese": "Tôi đánh răng sau khi ăn cơm."},
    {"korean": "수업 후에 시간 있어요?", "vietnamese": "Sau tiết học bạn có rảnh không?"},
    {"korean": "수업이 끝난 다음에 아르바이트를 해요.", "vietnamese": "Sau khi tiết học kết thúc tôi đi làm thêm."},
    {"korean": "대학교를 졸업 후에 취직을 했어요.", "vietnamese": "Tôi đi làm sau khi tốt nghiệp."}
  ]'::jsonb,
  ARRAY['N 전에, V – 기 전에', 'V – (으)ㄴ 다음에', 'V – (으)ㄴ 뒤에']::TEXT[],
  ARRAY['time', 'after', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 후에, V – (으)ㄴ 후에' LIMIT 1),
  '점심을 먹 ___ 영화를 볼까요?',
  'fill_blank',
  '["은 후에", "기 전에", "전에", "는데"]'::jsonb,
  '은 후에',
  'Động từ quá khứ + (으)ㄴ 후에 = sau khi ăn.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 후에, V – (으)ㄴ 후에' LIMIT 1),
  '시험 ___ 뭐 할 거예요?',
  'fill_blank',
  '["후에", "기 전에", "전에", "는데"]'::jsonb,
  '후에',
  'Danh từ + 후에 = sau kì thi.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 후에, V – (으)ㄴ 후에' LIMIT 1),
  '집에 돌아온 ___ 샤워했어요.',
  'multiple_choice',
  '["다음에", "기 전에", "전에", "는데"]'::jsonb,
  '다음에',
  '다음에 thay thế cho 후에 = sau khi về nhà.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 후에, V – (으)ㄴ 후에' LIMIT 1),
  '밥을 먹 ___ 이를 닦아요.',
  'fill_blank',
  '["은 후에", "기 전에", "전에", "는데"]'::jsonb,
  '은 후에',
  'Động từ quá khứ + (으)ㄴ 후에 = sau khi ăn.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #12: V – 고 나서 [xong rồi thì...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 고 나서',
  'go naseo',
  'xong rồi thì...',
  'beginner',
  'time',
  'Biểu hiện hành động ở vế sau được thực hiện sau khi hành động ở vế trước hoàn thành. Không thể kết hợp cùng với 았/었, 겠, (으)ㄹ 것이다. Chỉ dùng với các động từ mà bắt đầu và kết thúc một cách rõ ràng.',
  'V + 고 나서',
  '[
    {"korean": "숙제를 끝내고 나서 친구를 만날 거예요.", "vietnamese": "Hoàn thành xong bài tập về nhà tôi sẽ gặp gỡ bạn bè."},
    {"korean": "손을 씻고 나서 식사를 해야 합니다.", "vietnamese": "Rửa tay xong rồi thì phải ăn thôi."},
    {"korean": "식사를 하고 나서 커피를 마십시다.", "vietnamese": "Sau khi ăn xong rồi chúng ta hãy uống cà phê đi."},
    {"korean": "선생님의 설명을 듣고 나서 이해가 되었어요.", "vietnamese": "Nghe giải thích của thầy giáo xong thì tôi đã hiểu rồi."},
    {"korean": "주말에 집안일을 하고 나서 산책해요.", "vietnamese": "Cuối tuần sau khi làm việc nhà xong tôi đi dạo."},
    {"korean": "샤워 하고 나서 했어요.", "vietnamese": "Sau khi tắm xong mình đã làm rồi."},
    {"korean": "그는 전화를 받고 나서 나갔어요.", "vietnamese": "Anh ta nhận điện thoại xong rồi đi ra ngoài."},
    {"korean": "텔레비전을 보고 나서 자요.", "vietnamese": "Tôi xem TV xong rồi ngủ."},
    {"korean": "아침을 먹고 나서 학교에 가요.", "vietnamese": "Tôi ăn sáng xong rồi đi học."}
  ]'::jsonb,
  ARRAY['V – 고 나면', 'V – 고 나니', 'N 후에, V – (으)ㄴ 후에']::TEXT[],
  ARRAY['time', 'sequence', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 나서' LIMIT 1),
  '숙제를 끝내 ___ 친구를 만날 거예요.',
  'fill_blank',
  '["고 나서", "고 나면", "고 나니", "아서"]'::jsonb,
  '고 나서',
  'Hoàn thành xong rồi → dùng -고 나서.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 나서' LIMIT 1),
  '손을 씻 ___ 식사를 해야 합니다.',
  'fill_blank',
  '["고 나서", "고 나면", "고 나니", "아서"]'::jsonb,
  '고 나서',
  'Rửa xong rồi → dùng -고 나서.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 나서' LIMIT 1),
  '식사를 하 ___ 커피를 마십시다.',
  'multiple_choice',
  '["고 나서", "고 나면", "고 나니", "아서"]'::jsonb,
  '고 나서',
  'Ăn xong rồi → dùng -고 나서.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 나서' LIMIT 1),
  '텔레비전을 보 ___ 자요.',
  'fill_blank',
  '["고 나서", "고 나면", "고 나니", "아서"]'::jsonb,
  '고 나서',
  'Xem xong rồi → dùng -고 나서.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #13: V – 고 나면 [nếu xong rồi thì...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 고 나면',
  'go namyeon',
  'nếu xong rồi thì...',
  'beginner',
  'time',
  'Biểu hiện giả định hành động ở vế sau được thực hiện sau khi hành động ở vế trước hoàn thành.',
  'V + 고 나면',
  '[
    {"korean": "한국어를 공부하고 나면 통역사가 될 수 있어요.", "vietnamese": "Nếu học tiếng Hàn xong thì sẽ có thể trở thành thông dịch viên."},
    {"korean": "자기한테 맞는 공부 방법을 찾게 되고 나면 공부하기가 쉬워져요.", "vietnamese": "Nếu tìm được phương pháp học tập phù hợp với mình xong thì việc học sẽ trở nên dễ dàng hơn."},
    {"korean": "약을 먹고 나면 좋아질 거예요.", "vietnamese": "Nếu bạn uống thuốc xong, bạn sẽ thấy tốt hơn."},
    {"korean": "일을 마치고 나면 보람을 느낄 수 있을 거예요.", "vietnamese": "Khi bạn hoàn thành công việc xong, bạn sẽ cảm thấy có giá trị."},
    {"korean": "규칙을 알고 나면 수학이 아주 쉬워질 겁니다.", "vietnamese": "Nếu bạn nắm rõ được các quy tắc xong thì môn toán sẽ trở nên dễ dàng."}
  ]'::jsonb,
  ARRAY['V – 고 나서', 'V – 고 나니', 'A/V – (으)면']::TEXT[],
  ARRAY['time', 'conditional', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 나면' LIMIT 1),
  '한국어를 공부 ___ 통역사가 될 수 있어요.',
  'fill_blank',
  '["고 나면", "고 나서", "고 나니", "아서"]'::jsonb,
  '고 나면',
  'Giả định: nếu học xong → dùng -고 나면.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 나면' LIMIT 1),
  '약을 먹 ___ 좋아질 거예요.',
  'fill_blank',
  '["고 나면", "고 나서", "고 나니", "아서"]'::jsonb,
  '고 나면',
  'Giả định: nếu uống xong → dùng -고 나면.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 나면' LIMIT 1),
  '일을 마치 ___ 보람을 느낄 수 있을 거예요.',
  'multiple_choice',
  '["고 나면", "고 나서", "고 나니", "아서"]'::jsonb,
  '고 나면',
  'Giả định: nếu hoàn thành xong → dùng -고 나면.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 나면' LIMIT 1),
  '규칙을 알 ___ 수학이 아주 쉬워질 겁니다.',
  'fill_blank',
  '["고 나면", "고 나서", "고 나니", "아서"]'::jsonb,
  '고 나면',
  'Giả định: nếu biết xong → dùng -고 나면.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #14: V – 고 나니 [xong rồi thì thấy...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 고 나니',
  'go nani',
  'xong rồi thì thấy...',
  'beginner',
  'time',
  'Biểu hiện hành động ở vế sau được thực hiện sau khi hành động ở vế trước hoàn thành. Do kết hợp với (으)니까 nên có ý nghĩa làm gì đó xong thì phát hiện ra sự thật nào đó.',
  'V + 고 나니',
  '[
    {"korean": "밥을 많이 먹고 나니 이제 졸려요.", "vietnamese": "Sau khi đã ăn rất nhiều thì tôi thấy rất buồn ngủ."},
    {"korean": "돈을 벌고 나니 비싼 물건을 사고 싶어졌어요.", "vietnamese": "Sau khi kiếm được nhiều tiền tôi thấy mình muốn mua những thứ đắt tiền."},
    {"korean": "샤워를 하고 나니 기분이 훨씬 좋네요.", "vietnamese": "Sau khi tắm tôi thấy tinh thần mình tốt hơn."},
    {"korean": "집을 청소하고 나니 더 넓어 보여요.", "vietnamese": "Sau khi dọn dẹp nhà tôi thấy ngôi nhà trông lớn hơn rất nhiều."},
    {"korean": "약을 먹고 나니 머리가 안 아파요.", "vietnamese": "Sau khi tôi uống thuốc, tôi thấy đã hết đau đầu."}
  ]'::jsonb,
  ARRAY['V – 고 나서', 'V – 고 나면', 'A/V – (으)니까']::TEXT[],
  ARRAY['time', 'discovery', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 나니' LIMIT 1),
  '밥을 많이 먹 ___ 이제 졸려요.',
  'fill_blank',
  '["고 나니", "고 나서", "고 나면", "아서"]'::jsonb,
  '고 나니',
  'Xong rồi thấy → dùng -고 나니.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 나니' LIMIT 1),
  '돈을 벌 ___ 비싼 물건을 사고 싶어졌어요.',
  'fill_blank',
  '["고 나니", "고 나서", "고 나면", "아서"]'::jsonb,
  '고 나니',
  'Xong rồi thấy muốn → dùng -고 나니.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 나니' LIMIT 1),
  '샤워를 하 ___ 기분이 훨씬 좋네요.',
  'multiple_choice',
  '["고 나니", "고 나서", "고 나면", "아서"]'::jsonb,
  '고 나니',
  'Xong rồi thấy → dùng -고 나니.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 나니' LIMIT 1),
  '약을 먹 ___ 머리가 안 아파요.',
  'fill_blank',
  '["고 나니", "고 나서", "고 나면", "아서"]'::jsonb,
  '고 나니',
  'Xong rồi thấy → dùng -고 나니.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #15: V – 아/어서 [để rồi]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 아/어서',
  'a/eo-seo',
  'để rồi',
  'beginner',
  'time',
  'Vế trước xảy ra rồi kế tiếp vế sau xuất hiện lần lượt theo trình tự thời gian. Hai vế phải có cùng chủ ngữ và có quan hệ qua lại lẫn nhau. Hành động ở mệnh đề sau tiếp nối hành động của mệnh đề trước. Không dùng với 았/었, 겠 ở vế trước. Vế sau có thể chia mệnh lệnh, cầu khiến.',
  'V(ㅏ/ㅗ) + 아서 / V(khác) + 어서 / 하다 → 해서',
  '[
    {"korean": "사과를 씻어서 먹었어요.", "vietnamese": "Tôi rửa táo rồi mới ăn."},
    {"korean": "아침에 일어나서 세수를 했어요.", "vietnamese": "Buổi sáng tôi thức dậy rồi rửa mặt."},
    {"korean": "여기에 앉아서 잠깐만 기다리세요.", "vietnamese": "Hãy ngồi ở đây rồi chờ một chút nhé."},
    {"korean": "친구를 만나서 영화를 봤어요.", "vietnamese": "Tôi đã gặp bạn rồi cùng đi xem phim."},
    {"korean": "커피숍에 가서 커피를 마셨어요.", "vietnamese": "Tôi đã đến quán cà phê rồi uống cà phê."},
    {"korean": "민수 씨는 고향에 가서 부모님을 만났어요.", "vietnamese": "Minsu về quê rồi gặp bố mẹ."},
    {"korean": "도서관에 가서 친구를 기다렸어요.", "vietnamese": "Tôi đã đến thư viện rồi đợi bạn."},
    {"korean": "이메일을 써서 친구에게 보냈습니다.", "vietnamese": "Tôi đã viết email rồi gửi cho bạn."}
  ]'::jsonb,
  ARRAY['V – 고 나서', 'A/V – 아/어서 (nguyên nhân)', 'N 후에, V – (으)ㄴ 후에']::TEXT[],
  ARRAY['time', 'sequence', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어서' LIMIT 1),
  '사과를 씻 ___ 먹었어요.',
  'fill_blank',
  '["어서", "아서", "고 나서", "고 나니"]'::jsonb,
  '어서',
  '씻다 → 씻어서. Rửa rồi ăn.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어서' LIMIT 1),
  '아침에 일어나 ___ 세수를 했어요.',
  'fill_blank',
  '["아서", "어서", "고 나서", "고 나니"]'::jsonb,
  '아서',
  '일어나다 → 일어나서. Thức dậy rồi rửa mặt.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어서' LIMIT 1),
  '여기에 앉 ___ 잠깐만 기다리세요.',
  'multiple_choice',
  '["아서", "어서", "고 나서", "고 나니"]'::jsonb,
  '아서',
  '앉다 → 앉아서. Ngồi rồi chờ.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어서' LIMIT 1),
  '친구를 만나 ___ 영화를 봤어요.',
  'fill_blank',
  '["아서", "어서", "고 나서", "고 나니"]'::jsonb,
  '아서',
  '만나다 → 만나서. Gặp rồi xem phim.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #16: V – 고 [rồi]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 고',
  'go',
  'rồi',
  'beginner',
  'time',
  'Liệt kê trình tự thời gian: vế trước xảy ra rồi kế tiếp vế sau xuất hiện lần lượt theo trình tự thời gian. Hai vế phải có cùng chủ ngữ, 2 vế không có quan hệ mục đích qua lại như 아/어서. Không thể kết hợp cùng với 았/었, 겠 ở vế trước.',
  'V + 고',
  '[
    {"korean": "오늘 아침에 세수하고 밥을 먹었어요.", "vietnamese": "Sáng nay tôi đã rửa mặt rồi ăn cơm."},
    {"korean": "저는 어제 수업을 듣고 점심을 먹었어요.", "vietnamese": "Hôm qua tôi nghe giảng rồi ăn trưa."},
    {"korean": "저는 숙제를 하고 친구를 만날 거예요.", "vietnamese": "Tôi làm bài tập rồi sẽ gặp gỡ bạn bè."},
    {"korean": "양복을 입고 출근했어요.", "vietnamese": "Tôi mặc âu phục rồi đi làm."},
    {"korean": "운동화를 신고 산책해요.", "vietnamese": "Tôi đi giày rồi đi dạo."}
  ]'::jsonb,
  ARRAY['V – 아/어서', 'V – 고 나서', 'N –(이)고, A/V – 고']::TEXT[],
  ARRAY['time', 'sequence', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고' LIMIT 1),
  '오늘 아침에 세수 ___ 밥을 먹었어요.',
  'fill_blank',
  '["고", "고 나서", "아서", "어서"]'::jsonb,
  '고',
  'Liệt kê trình tự → dùng -고.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고' LIMIT 1),
  '저는 어제 수업을 듣 ___ 점심을 먹었어요.',
  'fill_blank',
  '["고", "고 나서", "아서", "어서"]'::jsonb,
  '고',
  'Liệt kê trình tự → dùng -고.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고' LIMIT 1),
  '저는 숙제를 하 ___ 친구를 만날 거예요.',
  'multiple_choice',
  '["고", "고 나서", "아서", "어서"]'::jsonb,
  '고',
  'Liệt kê trình tự → dùng -고.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고' LIMIT 1),
  '양복을 입 ___ 출근했어요.',
  'fill_blank',
  '["고", "고 나서", "아서", "어서"]'::jsonb,
  '고',
  'Liệt kê trình tự → dùng -고.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #17: N – 때, A/V – (으)ㄹ 때 [khi...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – 때, A/V – (으)ㄹ 때',
  'ttae / (eu)l ttae',
  'khi...',
  'beginner',
  'time',
  'Diễn tả thời điểm diễn ra hành động hoặc trạng thái nào đó. Không thể dùng 때 với 아침, 오전, 오후, 주말 và các thứ trong tuần.',
  'N + 때 / A + ㄹ 때 / V + (으)ㄹ 때',
  '[
    {"korean": "저는 집에 혼자 있을 때 책을 읽어요.", "vietnamese": "Khi tôi ở nhà một mình thì tôi đọc sách."},
    {"korean": "방학 때 고향에 갈 거예요.", "vietnamese": "Tôi sẽ về quê trong kỳ nghỉ."},
    {"korean": "심심할 때마다 한국 음악을 들어요.", "vietnamese": "Mỗi khi buồn chán tôi nghe nhạc."},
    {"korean": "몸이 아플 때 병원에 가요.", "vietnamese": "Khi bị ốm tôi đến bệnh viện."},
    {"korean": "회사에 갈 때 양복을 입어요.", "vietnamese": "Khi đi làm tôi mặc âu phục."},
    {"korean": "배고플 때 밥을 두 그릇 먹어요.", "vietnamese": "Khi đói tôi ăn 2 bát cơm."}
  ]'::jsonb,
  ARRAY['N 전에, V – 기 전에', 'N 후에, V – (으)ㄴ 후에', 'A/V – (으)면']::TEXT[],
  ARRAY['time', 'when', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N – 때, A/V – (으)ㄹ 때' LIMIT 1),
  '저는 집에 혼자 있 ___ 책을 읽어요.',
  'fill_blank',
  '["을 때", "때", "고", "아서"]'::jsonb,
  '을 때',
  'Động từ + (으)ㄹ 때 = khi ở nhà.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N – 때, A/V – (으)ㄹ 때' LIMIT 1),
  '방학 ___ 고향에 갈 거예요.',
  'fill_blank',
  '["때", "을 때", "고", "아서"]'::jsonb,
  '때',
  'Danh từ + 때 = trong kỳ nghỉ.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N – 때, A/V – (으)ㄹ 때' LIMIT 1),
  '심심할 ___ 한국 음악을 들어요.',
  'multiple_choice',
  '["때마다", "때", "고", "아서"]'::jsonb,
  '때마다',
  'Tính từ + 때마다 = mỗi khi buồn chán.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N – 때, A/V – (으)ㄹ 때' LIMIT 1),
  '몸이 아플 ___ 병원에 가요.',
  'fill_blank',
  '["때", "을 때", "고", "아서"]'::jsonb,
  '때',
  'Tính từ + 때 = khi bị ốm.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #18: A/V – (으)면서 [vừa...vừa...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)면서',
  '(eu)myeonseo',
  'vừa...vừa...',
  'beginner',
  'time',
  'Diễn tả hai hành động diễn ra ở cùng thời điểm, chủ ngữ của hai hành động phải đồng nhất. Cũng có thể sử dụng với tính từ khi 2 trạng thái tương đương; có thể thay bằng (으)며. Động từ trước – (으)면서 phải để nguyên thể.',
  'A + 면서 / V + (으)면서',
  '[
    {"korean": "그 사람이 울면서 말했어요.", "vietnamese": "Người đó vừa nói vừa khóc."},
    {"korean": "운전하면서 핸드폰을 보지 마세요.", "vietnamese": "Đừng xem điện thoại trong khi đang lái xe."},
    {"korean": "흐엉 씨는 똑똑하면서 예뻐요.", "vietnamese": "Hương vừa thông minh vừa xinh đẹp."},
    {"korean": "밥을 먹으면서 텔레비전을 봐요.", "vietnamese": "Tôi vừa ăn vừa xem phim."},
    {"korean": "요리를 하면서 많이 먹어요.", "vietnamese": "Tôi ăn rất nhiều trong lúc đang nấu ăn."},
    {"korean": "마이 씨는 그림을 그리며 노래를 했습니다.", "vietnamese": "Mai vừa vẽ tranh vừa hát."},
    {"korean": "음악을 들으면서 운동을 해요.", "vietnamese": "Tôi vừa nghe nhạc vừa tập thể dục."},
    {"korean": "서울은 한국의 수도이며 경제의 중심입니다.", "vietnamese": "Seoul vừa là thủ đô của Hàn Quốc vừa là trung tâm kinh tế."}
  ]'::jsonb,
  ARRAY['A/V – (으)며', 'N –(이)고, A/V – 고', 'A/V – 아/어서']::TEXT[],
  ARRAY['time', 'simultaneous', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면서' LIMIT 1),
  '그 사람이 울 ___ 말했어요.',
  'fill_blank',
  '["면서", "고", "아서", "때"]'::jsonb,
  '면서',
  'Vừa khóc vừa nói → dùng -면서.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면서' LIMIT 1),
  '밥을 먹 ___ 텔레비전을 봐요.',
  'fill_blank',
  '["으면서", "고", "아서", "때"]'::jsonb,
  '으면서',
  'Vừa ăn vừa xem → dùng -으면서.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면서' LIMIT 1),
  '음악을 들 ___ 운동을 해요.',
  'multiple_choice',
  '["으면서", "고", "아서", "때"]'::jsonb,
  '으면서',
  'Vừa nghe vừa tập → dùng -으면서.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면서' LIMIT 1),
  '흐엉 씨는 똑똑하 ___ 예뻐요.',
  'fill_blank',
  '["면서", "고", "아서", "때"]'::jsonb,
  '면서',
  'Vừa thông minh vừa xinh → dùng -면서.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #19: A/V – (으)며 [vừa...vừa... / và...và...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)며',
  '(eu)myeo',
  'vừa...vừa... / và...và...',
  'beginner',
  'time',
  'Diễn tả hai hành động diễn ra ở cùng thời điểm, chủ ngữ của hai hành động phải đồng nhất. Thường dùng trong văn viết. Liệt kê 2 hành động hay trạng thái, thường dùng trong văn viết. Có thể thay bằng (으)면서.',
  'A + 며 / V + (으)며',
  '[
    {"korean": "부산은 바다로 유명하며 강원도는 산으로 유명합니다.", "vietnamese": "Busan nổi tiếng với biển và Gangwondo nổi tiếng với núi."},
    {"korean": "오늘 한국은 축구 경기를 하며 중국은 농구 경기를 합니다.", "vietnamese": "Hôm nay Hàn Quốc thi đấu bóng đá còn Trung Quốc thi đấu bóng rổ."},
    {"korean": "내 친구는 공부도 잘하며 성격도 좋다.", "vietnamese": "Bạn tôi học cũng giỏi và tính cách cũng tốt nữa."},
    {"korean": "제가 어제 만난 남자는 멋있었으며 친절했습니다.", "vietnamese": "Người đàn ông tôi gặp hôm qua đã rất tuyệt và tử tế."},
    {"korean": "내일은 날씨가 춥겠으며 바람도 불겠습니다.", "vietnamese": "Ngày mai thời tiết sẽ lạnh và cũng sẽ có gió."},
    {"korean": "친구가 책을 읽으며 커피를 마셔요.", "vietnamese": "Đứa bạn vừa đọc sách vừa uống cà phê."},
    {"korean": "저는 텔레비전을 보며 식사를 합니다.", "vietnamese": "Tôi vừa ăn vừa xem phim."},
    {"korean": "이 컴퓨터는 크기도 작으며 값도 싸요.", "vietnamese": "Chiếc máy vi tính này kích cỡ vừa nhỏ giá cả lại còn rẻ nữa."},
    {"korean": "방이 깨끗하며 넓어요.", "vietnamese": "Căn phòng vừa sạch sẽ vừa rộng rãi."},
    {"korean": "친구가 음악을 들으며 게임을 해요.", "vietnamese": "Đứa bạn vừa điện thoại vừa chơi game."}
  ]'::jsonb,
  ARRAY['A/V – (으)면서', 'N –(이)고, A/V – 고', 'A/V – 아/어서']::TEXT[],
  ARRAY['time', 'simultaneous', 'written', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)며' LIMIT 1),
  '부산은 바다로 유명하 ___ 강원도는 산으로 유명합니다.',
  'fill_blank',
  '["며", "고", "아서", "때"]'::jsonb,
  '며',
  'Văn viết, liệt kê → dùng -며.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)며' LIMIT 1),
  '내 친구는 공부도 잘하 ___ 성격도 좋다.',
  'fill_blank',
  '["며", "고", "아서", "때"]'::jsonb,
  '며',
  'Văn viết, liệt kê → dùng -며.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)며' LIMIT 1),
  '친구가 책을 읽 ___ 커피를 마셔요.',
  'multiple_choice',
  '["으며", "고", "아서", "때"]'::jsonb,
  '으며',
  'Vừa đọc vừa uống → dùng -으며.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)며' LIMIT 1),
  '방이 깨끗하 ___ 넓어요.',
  'fill_blank',
  '["며", "고", "아서", "때"]'::jsonb,
  '며',
  'Vừa sạch vừa rộng → dùng -며.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #20: N 중, V- 는 중이다 [đang..., đang trong quá trình...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N 중, V- 는 중이다',
  'jung / neun jungida',
  'đang..., đang trong quá trình...',
  'beginner',
  'time',
  'Diễn tả hành động đang trong quá trình được thực hiện. Một số từ thông dụng: 회의 중, 수업 중, 공사 중, 출장 중, 외출 중... Có thể dùng ở dạng cấu trúc V-는 중에. – 는 중 và – 고 있다 giống nhau. Tuy nhiên, – 고 있다 có thể kết hợp các động từ, còn – 는 중 không được dùng để diễn tả các hiện tượng tự nhiên và thường không kết hợp với 살다, 지내다, 다니다...',
  'N + 중 / V + 는 중이다 / V + 는 중에',
  '[
    {"korean": "이사할 거예요. 그래서 집을 찾는 중이에요.", "vietnamese": "Tôi sẽ chuyển nhà. Nên tôi đang tìm nhà."},
    {"korean": "지금 수업 중이니까 나중에 전화하세요.", "vietnamese": "Bây giờ tôi đang học nên hãy gọi lại sau nhé."},
    {"korean": "학교에 가는 중에 친구를 만났어요.", "vietnamese": "Tôi đã gặp gỡ bạn bè khi đang đến trường."},
    {"korean": "친구가 안 와서 기다리는 중이에요.", "vietnamese": "Bạn chưa đến nên tôi đang đợi."},
    {"korean": "내일 시험이라서 공부하는 중이에요.", "vietnamese": "Vì ngày mai là buổi thi nên tôi đang học bài."},
    {"korean": "공사 중이라서 길이 자주 막혀요.", "vietnamese": "Vì đang trong quá trình xây dựng nên con đường thường tắc nghẽn."},
    {"korean": "요즘 운전을 배우는 중이에요.", "vietnamese": "Dạo này tôi đang học lái xe."}
  ]'::jsonb,
  ARRAY['V – 고 있다', 'N – 때, A/V – (으)ㄹ 때', 'V – (으)ㄴ 지']::TEXT[],
  ARRAY['time', 'progress', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 중, V- 는 중이다' LIMIT 1),
  '지금 수업 ___ 나중에 전화하세요.',
  'fill_blank',
  '["중이니까", "중에", "동안", "때"]'::jsonb,
  '중이니까',
  'Đang học → 수업 중이니까.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 중, V- 는 중이다' LIMIT 1),
  '학교에 가는 ___ 친구를 만났어요.',
  'fill_blank',
  '["중에", "중이니까", "동안", "때"]'::jsonb,
  '중에',
  'Đang đến trường → 가는 중에.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 중, V- 는 중이다' LIMIT 1),
  '친구가 안 와서 기다리는 ___.',
  'multiple_choice',
  '["중이에요", "중에", "동안", "때"]'::jsonb,
  '중이에요',
  'Đang đợi → 기다리는 중이에요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 중, V- 는 중이다' LIMIT 1),
  '요즘 운전을 배우는 ___.',
  'fill_blank',
  '["중이에요", "중에", "동안", "때"]'::jsonb,
  '중이에요',
  'Đang học → 배우는 중이에요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #21: V – 자마자 [ngay sau khi...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 자마자',
  'jamaja',
  'ngay sau khi...',
  'beginner',
  'time',
  'Biểu hiện việc gì đó xảy ra ngay lập tức sau một việc nào đó, thường không có khoảng trống về mặt thời gian giữa 2 hành động. Chủ ngữ của mệnh đề trước và sau không nhất thiết phải đồng nhất. Thì của động từ được chia ở mệnh đề sau.',
  'V + 자마자',
  '[
    {"korean": "어제는 피곤해서 침대에 눕자마자 잠이 들었어요.", "vietnamese": "Hôm qua vì mệt mỏi nên ngay khi nằm xuống giường tôi đã ngủ thiếp đi."},
    {"korean": "집에서 나가자마자 비가 오기 시작했어요.", "vietnamese": "Ngay sau khi tôi rời khỏi nhà thì trời đã bắt đầu đổ mưa."},
    {"korean": "남편은 집에 오자마자 텔레비전을 켜요.", "vietnamese": "Chồng tôi vừa về đến nhà là bật ngay cái TV."},
    {"korean": "친구가 기다리고 있어서 퇴근하자마자 가야 돼요.", "vietnamese": "Bạn tôi đang đợi nên ngay sau khi tan làm tôi phải đi ngay."},
    {"korean": "수업이 끝나자마자 학생들은 교실을 나갔어요.", "vietnamese": "Sau khi lớp học kết thúc thì học sinh chạy ra khỏi lớp ngay."},
    {"korean": "밥을 먹자마자 누우면 건강에 안 좋아요.", "vietnamese": "Vừa ăn xong mà đi nằm luôn không tốt cho sức khỏe đâu."}
  ]'::jsonb,
  ARRAY['V – 고 나서', 'V – (으)ㄴ 후에', 'N – 때, A/V – (으)ㄹ 때']::TEXT[],
  ARRAY['time', 'immediate', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 자마자' LIMIT 1),
  '침대에 눕 ___ 잠이 들었어요.',
  'fill_blank',
  '["자마자", "고 나서", "아서", "때"]'::jsonb,
  '자마자',
  'Ngay khi nằm → 눕자마자.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 자마자' LIMIT 1),
  '집에서 나가 ___ 비가 오기 시작했어요.',
  'fill_blank',
  '["자마자", "고 나서", "아서", "때"]'::jsonb,
  '자마자',
  'Ngay khi ra nhà → 나가자마자.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 자마자' LIMIT 1),
  '남편은 집에 오 ___ 텔레비전을 켜요.',
  'multiple_choice',
  '["자마자", "고 나서", "아서", "때"]'::jsonb,
  '자마자',
  'Vừa về nhà → 오자마자.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 자마자' LIMIT 1),
  '수업이 끝나 ___ 학생들은 교실을 나갔어요.',
  'fill_blank',
  '["자마자", "고 나서", "아서", "때"]'::jsonb,
  '자마자',
  'Ngay khi kết thúc → 끝나자마자.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #22: N 동안, V- 는 동안 [trong lúc..., trong khi...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N 동안, V- 는 동안',
  'dongan / neun dongan',
  'trong lúc..., trong khi...',
  'beginner',
  'time',
  'Thể hiện thời gian mà hành động hoặc trạng thái nào đó được duy trì trong khoảng thời gian như nhau. Có thể mô tả 2 quá trình. Chủ ngữ của mệnh đề trước và sau không nhất thiết phải đồng nhất. Có thể sử dụng với 없다, 있다.',
  'N + 동안 / V + 는 동안',
  '[
    {"korean": "나는 방학 동안 고향에 다녀올 거예요.", "vietnamese": "Trong kì nghỉ tôi sẽ về quê."},
    {"korean": "내가 음식을 만드는 동안 동생은 잤어요.", "vietnamese": "Em tôi ngủ trong lúc tôi nấu ăn."},
    {"korean": "한국에 사는 동안 한국 친구를 많이 사귀었어요.", "vietnamese": "Trong lúc sống ở Hàn tôi đã kết bạn được với nhiều bạn Hàn Quốc."},
    {"korean": "네가 없는 동안 너무 외로웠어요.", "vietnamese": "Trong lúc không có bạn mình đã rất cô đơn."},
    {"korean": "저는 너무 긴장해서 발표하는 동안 계속 떨었어요.", "vietnamese": "Tôi quá căng thẳng nên đã run liên tục trong khi phát biểu."},
    {"korean": "공사를 하는 동안 좀 시끄러울 거예요.", "vietnamese": "Trong lúc thi công sẽ hơi ồn."},
    {"korean": "친구를 기다리는 동안 책을 읽었어요.", "vietnamese": "Tôi đã đọc sách trong khi đợi bạn."}
  ]'::jsonb,
  ARRAY['N – 때, A/V – (으)ㄹ 때', 'N 중, V- 는 중이다', 'A/V – (으)면서']::TEXT[],
  ARRAY['time', 'duration', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 동안, V- 는 동안' LIMIT 1),
  '나는 방학 ___ 고향에 다녀올 거예요.',
  'fill_blank',
  '["동안", "중에", "때", "동안에"]'::jsonb,
  '동안',
  'Trong kì nghỉ → 방학 동안.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 동안, V- 는 동안' LIMIT 1),
  '내가 음식을 만드는 ___ 동생은 잤어요.',
  'fill_blank',
  '["동안", "중에", "때", "동안에"]'::jsonb,
  '동안',
  'Trong lúc nấu → 만드는 동안.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 동안, V- 는 동안' LIMIT 1),
  '한국에 사는 ___ 한국 친구를 많이 사귀었어요.',
  'multiple_choice',
  '["동안", "중에", "때", "동안에"]'::jsonb,
  '동안',
  'Trong lúc sống → 사는 동안.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 동안, V- 는 동안' LIMIT 1),
  '친구를 기다리는 ___ 책을 읽었어요.',
  'fill_blank',
  '["동안", "중에", "때", "동안에"]'::jsonb,
  '동안',
  'Trong lúc đợi → 기다리는 동안.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #23: V – (으)ㄴ 지 [đã bao lâu từ khi làm một việc gì đó]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)ㄴ 지',
  '(eu)n ji',
  'đã bao lâu từ khi làm một việc gì đó',
  'beginner',
  'time',
  'Diễn tả khoảng thời gian đã trải qua sau khi thực hiện một hành động nào đó. Cấu trúc: V – (으)ㄴ 지 + thời gian + 되다/ 안 되다/ 지나다/ 넘다. Chưa được bao lâu: 얼마 안 되다, Được lâu: 오래 되다.',
  'V(nguyên âm/ㄹ) + ㄴ 지 / V(phụ âm) + 은 지',
  '[
    {"korean": "한국어를 공부한 지 얼마나 됐어요?", "vietnamese": "Bạn học tiếng Hàn được bao lâu rồi?"},
    {"korean": "여기 산 지 6개월 됐어요.", "vietnamese": "Tôi sống ở đây được 6 tháng rồi."},
    {"korean": "남자 친구를 헤어진 지 오래 되었어요.", "vietnamese": "Tôi chia tay bạn trai lâu rồi."},
    {"korean": "이 책은 안 읽은 지 10년도 넘었어요.", "vietnamese": "Cũng đã mười năm rồi từ khi tôi đọc cuốn sách này."},
    {"korean": "그 사람하고 연락을 안 한 지 5년이 지났어요.", "vietnamese": "Đã 5 năm trôi qua từ ngày tôi liên lạc với người đó."},
    {"korean": "친구하고 싸운 지 한 달이 넘었어요.", "vietnamese": "Đã một tháng trôi qua từ khi tôi đánh nhau với một người bạn."},
    {"korean": "민수 씨는 결혼한 지 5 년 넘었습니다.", "vietnamese": "Minsoo đã kết hôn được hơn 5 năm rồi."},
    {"korean": "담배 끊은 지 한 달 되었어요.", "vietnamese": "Tôi bỏ thuốc lá được một tháng rồi."}
  ]'::jsonb,
  ARRAY['N 동안, V- 는 동안', 'N – 때, A/V – (으)ㄹ 때', 'V – (으)ㄴ 후에']::TEXT[],
  ARRAY['time', 'duration', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄴ 지' LIMIT 1),
  '한국어를 공부 ___ 얼마나 됐어요?',
  'fill_blank',
  '["한 지", "한 동안", "하는 중", "하는 때"]'::jsonb,
  '한 지',
  'Đã bao lâu → 공부한 지.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄴ 지' LIMIT 1),
  '여기 산 ___ 6개월 됐어요.',
  'fill_blank',
  '["지", "동안", "중", "때"]'::jsonb,
  '지',
  'Sống được bao lâu → 산 지.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄴ 지' LIMIT 1),
  '남자 친구를 헤어진 ___ 오래 되었어요.',
  'multiple_choice',
  '["지", "동안", "중", "때"]'::jsonb,
  '지',
  'Chia tay bao lâu → 헤어진 지.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄴ 지' LIMIT 1),
  '담배 끊은 ___ 한 달 되었어요.',
  'fill_blank',
  '["지", "동안", "중", "때"]'::jsonb,
  '지',
  'Bỏ thuốc bao lâu → 끊은 지.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #24: V – 는 길이다/ 는 길에 [đang trên đường]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 는 길이다/ 는 길에',
  'neun gilida / neun gile',
  'đang trên đường',
  'beginner',
  'time',
  'Được sử dụng khi người nói thực hiện một hành động nào đó trong quá trình di chuyển đến đâu đó. Còn được sử dụng dưới hình thức –는 길이다. Chỉ có thể kết hợp với các động từ mang ý nghĩa di chuyển, di động như 가다/오다, 나가다/나오다, 들어가다/들어오다, 돌아가다/돌아오다, 올라가다/올라오다, 내려가다/내려오다, 출근하다/퇴근하다. Khi kết hợp với các động từ hành động, chuyển thành động từ di chuyển qua cấu trúc V + (으)러 가다/오다...',
  'V + 는 길이다 / V + 는 길에',
  '[
    {"korean": "퇴근하는 길에 지하철에서 갑자기 친구를 만났어요.", "vietnamese": "Trên đường tan làm thì tình cờ tôi gặp bạn ở tàu điện ngầm."},
    {"korean": "어디 가는 길이에요?", "vietnamese": "Bạn đang trên đường đi đâu thế?"},
    {"korean": "만나러 가는 길이에요.", "vietnamese": "Mình đang trên đường đi gặp người bạn."},
    {"korean": "집에 돌아오는 길에 시장에 가서 음식을 사 왔어요.", "vietnamese": "Đang trên đường trở về nhà thì tôi đi chợ mua chút đồ ăn."},
    {"korean": "밥 먹으러 가는 길이에요.", "vietnamese": "Tôi đang trên đường đi ăn cơm."},
    {"korean": "제가 지금 집에 가는 길이라서 15 분 후에 다시 전화하면 안 돼요?", "vietnamese": "Tôi đang trên đường về nhà nên 15 phút sau gọi điện lại có được không ạ?"},
    {"korean": "그냥 지나가는 길에 들렀어요.", "vietnamese": "Trên đường đi qua đây tôi ghé vào một chút."},
    {"korean": "돈을 찾으러 은행에 가는 길이에요.", "vietnamese": "Tôi đang trên đường đến ngân hàng rút tiền."}
  ]'::jsonb,
  ARRAY['N 동안, V- 는 동안', 'N – 때, A/V – (으)ㄹ 때', 'V – (으)러 가다/오다']::TEXT[],
  ARRAY['time', 'on the way', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 는 길이다/ 는 길에' LIMIT 1),
  '퇴근하는 ___ 지하철에서 갑자기 친구를 만났어요.',
  'fill_blank',
  '["길에", "동안", "중에", "때"]'::jsonb,
  '길에',
  'Trên đường tan làm → 퇴근하는 길에.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 는 길이다/ 는 길에' LIMIT 1),
  '어디 가는 ___?',
  'fill_blank',
  '["길이에요", "동안", "중에", "때"]'::jsonb,
  '길이에요',
  'Đang đi đâu → 가는 길이에요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 는 길이다/ 는 길에' LIMIT 1),
  '집에 돌아오는 ___ 시장에 가서 음식을 사 왔어요.',
  'multiple_choice',
  '["길에", "동안", "중에", "때"]'::jsonb,
  '길에',
  'Trên đường về nhà → 돌아오는 길에.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 는 길이다/ 는 길에' LIMIT 1),
  '밥 먹으러 가는 ___.',
  'fill_blank',
  '["길이에요", "동안", "중에", "때"]'::jsonb,
  '길이에요',
  'Đang đi ăn → 가는 길이에요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #25: V – 는 도중에 [trong quá trình..., trong lúc...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 는 도중에',
  'neun dojunge',
  'trong quá trình..., trong lúc...',
  'beginner',
  'time',
  'Cấu trúc thể hiện việc đang thực hiện hành động nào đó mà vế trước thể hiện hoặc nhân cơ hội đó mà thực hiện hành động sau.',
  'V + 는 도중에',
  '[
    {"korean": "대전에서 서울로 오는 도중에 버스가 고장이 났어요.", "vietnamese": "Trong lúc từ Daejon lên Seoul thì xe bus bị hỏng."},
    {"korean": "버스를 타기 위해 걸어가는 도중에 우연히 친구를 만났어요.", "vietnamese": "Đang đi bộ để lên xe bus thì tình cờ tôi gặp người bạn."},
    {"korean": "산 정상으로 오르는 도중에 경치가 좋아 잠시 멈추어 사진을 찍었어요.", "vietnamese": "Trong khi đang leo lên đỉnh núi thì vì phong cảnh đẹp nên tôi đã dừng lại chụp ảnh."}
  ]'::jsonb,
  ARRAY['N 동안, V- 는 동안', 'V – 는 길이다/ 는 길에', 'N – 때, A/V – (으)ㄹ 때']::TEXT[],
  ARRAY['time', 'process', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 는 도중에' LIMIT 1),
  '대전에서 서울로 오는 ___ 버스가 고장이 났어요.',
  'fill_blank',
  '["도중에", "동안", "중에", "길에"]'::jsonb,
  '도중에',
  'Trong quá trình đi → 오는 도중에.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 는 도중에' LIMIT 1),
  '걸어가는 ___ 우연히 친구를 만났어요.',
  'fill_blank',
  '["도중에", "동안", "중에", "길에"]'::jsonb,
  '도중에',
  'Trong quá trình đi bộ → 걸어가는 도중에.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 는 도중에' LIMIT 1),
  '오르는 ___ 경치가 좋아 사진을 찍었어요.',
  'multiple_choice',
  '["도중에", "동안", "중에", "길에"]'::jsonb,
  '도중에',
  'Trong quá trình leo → 오르는 도중에.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 는 도중에' LIMIT 1),
  '공부하는 ___ 친구가 왔어요.',
  'fill_blank',
  '["도중에", "동안", "중에", "길에"]'::jsonb,
  '도중에',
  'Trong quá trình học → 공부하는 도중에.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #26: V – 고 있다 [đang...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 고 있다',
  'go itda',
  'đang...',
  'beginner',
  'time',
  'Cấu trúc thể hiện một hành động hoặc quá trình diễn ra ngay tại thời điểm nói hoặc xung quanh thời điểm nói. Cấu trúc diễn tả thời hiện tại tiếp diễn. Kính ngữ ở dạng 고 계시다. Dạng quá khứ 고 있었다.',
  'V + 고 있다',
  '[
    {"korean": "한국에 살고 있어요.", "vietnamese": "Tôi đang sống ở Hàn Quốc."},
    {"korean": "저는 대학교에 다니고 있어요.", "vietnamese": "Tôi đang học đại học."},
    {"korean": "한국어를 공부하고 있어요.", "vietnamese": "Tôi đang học tiếng Hàn."},
    {"korean": "언니는 지금 통화하고 있어요.", "vietnamese": "Chị gái đang nghe điện thoại."},
    {"korean": "지금 어디에서 살고 있어요?", "vietnamese": "Bây giờ bạn đang sống ở đâu?"},
    {"korean": "할아버지께서는 책을 읽고 계세요.", "vietnamese": "Ông đang đọc sách."},
    {"korean": "비가 오고 있어요.", "vietnamese": "Trời đang mưa."}
  ]'::jsonb,
  ARRAY['N 중, V- 는 중이다', 'V – (으)ㄴ 지', 'A/V – (으)ㄹ 수 있다/없다']::TEXT[],
  ARRAY['time', 'progressive', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 있다' LIMIT 1),
  '한국에 살 ___.',
  'fill_blank',
  '["고 있어요", "고 있었어요", "고", "아서"]'::jsonb,
  '고 있어요',
  'Đang sống → 살고 있어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 있다' LIMIT 1),
  '한국어를 공부 ___.',
  'fill_blank',
  '["하고 있어요", "하고 있었어요", "하고", "아서"]'::jsonb,
  '하고 있어요',
  'Đang học → 공부하고 있어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 있다' LIMIT 1),
  '언니는 지금 통화 ___.',
  'multiple_choice',
  '["하고 있어요", "하고 있었어요", "하고", "아서"]'::jsonb,
  '하고 있어요',
  'Đang nghe điện thoại → 통화하고 있어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 있다' LIMIT 1),
  '비가 오 ___.',
  'fill_blank',
  '["고 있어요", "고 있었어요", "고", "아서"]'::jsonb,
  '고 있어요',
  'Đang mưa → 오고 있어요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #27: A/V – 다가 [đang A thì B]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 다가',
  'daga',
  'đang A thì B',
  'beginner',
  'time',
  'Diễn tả người nói đang làm gì thì đột nhiên dừng lại và thực hiện hành động khác. Cũng có thể được dùng trong một số trường hợp mà hành động phía trước không bị ngắt quãng mà vẫn được tiếp tục. – 다가 có thể được tỉnh lược thành – 다. Chủ ngữ ở hai vế phải giống nhau. Có thể sử dụng với tính từ khi chung chủ thể và diễn tả trạng thái đột ngột thay đổi. –다가 có thể kết hợp với thì quá khứ ở vế trước thành dạng 았/었/였다가 để thể hiện việc hành động vế trước được hoàn thành.',
  'A/V + 다가',
  '[
    {"korean": "영화를 보다가 울었어요.", "vietnamese": "Đang xem phim thì tôi khóc."},
    {"korean": "숙제를 하다가 잤어요.", "vietnamese": "Đang làm bài tập thì ngủ gật."},
    {"korean": "비가 오다가 그쳤어요.", "vietnamese": "Trời đang mưa bỗng dưng tạnh."},
    {"korean": "날씨가 맑다가 갑자기 흐려졌어요.", "vietnamese": "Trời đang trong xanh đột nhiên trở nên âm u."},
    {"korean": "설거지를 하다가 접시를 깨뜨렸어요.", "vietnamese": "Tôi đang rửa chén thì làm vỡ cái đĩa."},
    {"korean": "버스에서 내리다가 돈지갑을 잃어버렸습니다.", "vietnamese": "Tôi xuống xe buýt thì đánh mất ví tiền."}
  ]'::jsonb,
  ARRAY['V – 고', 'A/V – (으)면', 'V – 자마자']::TEXT[],
  ARRAY['time', 'interruption', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 다가' LIMIT 1),
  '영화를 보 ___ 울었어요.',
  'fill_blank',
  '["다가", "다", "고", "아서"]'::jsonb,
  '다가',
  'Đang xem thì khóc → 보다가.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 다가' LIMIT 1),
  '숙제를 하 ___ 잤어요.',
  'fill_blank',
  '["다가", "다", "고", "아서"]'::jsonb,
  '다가',
  'Đang làm thì ngủ → 하다가.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 다가' LIMIT 1),
  '비가 오 ___ 그쳤어요.',
  'multiple_choice',
  '["다가", "다", "고", "아서"]'::jsonb,
  '다가',
  'Đang mưa thì tạnh → 오다가.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 다가' LIMIT 1),
  '설거지를 하 ___ 접시를 깨뜨렸어요.',
  'fill_blank',
  '["다가", "다", "고", "아서"]'::jsonb,
  '다가',
  'Đang rửa thì vỡ → 하다가.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #28: A/V – (으)ㄹ 수 있다/ 없다 [có thể..., không thể...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ 수 있다/ 없다',
  '(eu)l su itda/eopda',
  'có thể..., không thể...',
  'beginner',
  'ability',
  'Diễn tả việc có năng lực làm một việc nào đó hoặc diễn tả một sự việc nào đó có khả năng xảy ra. Dạng nhấn mạnh là (으)ㄹ 수가 있다/없다.',
  'V(nguyên âm/ㄹ) + ㄹ 수 있다/없다 / V(phụ âm) + 을 수 있다/없다',
  '[
    {"korean": "저는 피아노를 칠 수 있어요.", "vietnamese": "Tôi có thể chơi piano."},
    {"korean": "주말이라서 영화관에 사람들이 많을 수 있으니 미리 예매를 하세요.", "vietnamese": "Vì là cuối tuần nên rạp chiếu phim có thể sẽ đông người nên hãy đặt vé trước đi nhé."},
    {"korean": "이번 주 금요일에 같이 벚꽃 보러 갈 수 있어요?", "vietnamese": "Thứ 6 tuần này chúng ta có thể cùng nhau đi ngắm hoa anh đào không?"},
    {"korean": "이따가 점심을 같이 먹을 수 있어요?", "vietnamese": "Lát nữa chúng ta có thể cùng nhau ăn trưa không?"},
    {"korean": "내일 비가 올 수도 있어요.", "vietnamese": "Ngày mai trời cũng có thể sẽ mưa."},
    {"korean": "저는 요리할 수 없어요.", "vietnamese": "Tôi không thể nấu ăn."},
    {"korean": "저는 오토바이를 탈 수가 없어요.", "vietnamese": "Tôi không thể lái xe máy."},
    {"korean": "저는 술을 마실 수 없어요.", "vietnamese": "Tôi không thể uống rượu."}
  ]'::jsonb,
  ARRAY['V - (으)ㄹ 줄 알다/ 모르다', 'A/V – (으)면', 'A/V – (으)ㄹ래']::TEXT[],
  ARRAY['ability', 'possibility', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 수 있다/ 없다' LIMIT 1),
  '저는 피아노를 칠 ___ 있어요.',
  'fill_blank',
  '["수", "수가", "줄", "것"]'::jsonb,
  '수',
  'Có thể → 칠 수 있어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 수 있다/ 없다' LIMIT 1),
  '저는 요리할 ___ 없어요.',
  'fill_blank',
  '["수", "수가", "줄", "것"]'::jsonb,
  '수',
  'Không thể → 요리할 수 없어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 수 있다/ 없다' LIMIT 1),
  '내일 비가 올 ___ 있어요.',
  'multiple_choice',
  '["수도", "수", "줄", "것"]'::jsonb,
  '수도',
  'Có thể sẽ → 올 수도 있어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 수 있다/ 없다' LIMIT 1),
  '저는 오토바이를 탈 ___ 없어요.',
  'fill_blank',
  '["수가", "수", "줄", "것"]'::jsonb,
  '수가',
  'Không thể (nhấn mạnh) → 탈 수가 없어요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #29: V - (으)ㄹ 줄 알다/ 모르다 [biết cách, không biết cách làm gì đó]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V - (으)ㄹ 줄 알다/ 모르다',
  '(eu)l jul alda/moreuda',
  'biết cách, không biết cách làm gì đó',
  'beginner',
  'ability',
  'Thể hiện chủ thể biết/không biết phương pháp làm gì đó, có/không có năng lực làm gì. Phân biệt với (으)ㄹ 수 있다/없다: (으)ㄹ 줄 = biết cách/phương pháp, (으)ㄹ 수 = khả năng/tình huống cho phép.',
  'V(nguyên âm/ㄹ) + ㄹ 줄 알다/모르다 / V(phụ âm) + 을 줄 알다/모르다',
  '[
    {"korean": "저는 한국에 처음 올 때 한국말을 할 줄 몰랐어요.", "vietnamese": "Lúc đến Hàn Quốc lần đầu tiên, tôi đã không biết tiếng Hàn."},
    {"korean": "저는 운전을 할 줄 몰라요.", "vietnamese": "Tôi không biết cách lái xe."},
    {"korean": "요리할 줄 알아요?", "vietnamese": "Bạn có biết nấu ăn không?"},
    {"korean": "저는 김밥을 만들 줄 알아요.", "vietnamese": "Tôi biết cách làm kimbap."},
    {"korean": "휴대전화를 쓸 줄 알아요?", "vietnamese": "Bạn có biết cách dùng điện thoại không?"}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 수 있다/ 없다', 'V – (으)러 가다/오다', 'A/V – (으)면']::TEXT[],
  ARRAY['ability', 'know-how', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)ㄹ 줄 알다/ 모르다' LIMIT 1),
  '저는 운전을 할 ___ 몰라요.',
  'fill_blank',
  '["줄", "수", "것", "방법"]'::jsonb,
  '줄',
  'Không biết cách → 할 줄 몰라요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)ㄹ 줄 알다/ 모르다' LIMIT 1),
  '요리할 ___ 알아요?',
  'fill_blank',
  '["줄", "수", "것", "방법"]'::jsonb,
  '줄',
  'Biết cách → 요리할 줄 알아요?',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)ㄹ 줄 알다/ 모르다' LIMIT 1),
  '저는 김밥을 만들 ___ 알아요.',
  'multiple_choice',
  '["줄", "수", "것", "방법"]'::jsonb,
  '줄',
  'Biết cách → 만들 줄 알아요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)ㄹ 줄 알다/ 모르다' LIMIT 1),
  '휴대전화를 쓸 ___ 알아요?',
  'fill_blank',
  '["줄", "수", "것", "방법"]'::jsonb,
  '줄',
  'Biết cách → 쓸 줄 알아요?',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #30: V – (으)세요. / (으)십시오 [hãy, vui lòng]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)세요. / (으)십시오',
  '(eu)seyo / (eu)sipsio',
  'hãy, vui lòng',
  'beginner',
  'imperative',
  'Dùng để yêu cầu người nghe làm gì một cách lịch sự, câu MỆNH LỆNH. Hình thức tôn kính là – (으)십시오. Một số động từ chuyển đổi đặc biệt: 먹다/마시다 → 드세요, 자다 → 주무세요, 있다 → 계세요, 주다 → 주세요/드리세요. Một số tính từ kết thúc bằng 하다 có thể sử dụng cố định với – (으)세요 như 건강하다, 행복하다...',
  'V + (으)세요 / (으)십시오',
  '[
    {"korean": "민규 씨, 결혼 축하해요. 행복하세요.", "vietnamese": "Minkyu, chúc mừng kết hôn nhé. Hãy thật hạnh phúc nhé."},
    {"korean": "여기 앉으세요.", "vietnamese": "Xin vui lòng ngồi ở đây."},
    {"korean": "맛있게 드세요.", "vietnamese": "Hãy ăn thật ngon miệng nhé."},
    {"korean": "잠깐만 기다리세요.", "vietnamese": "Vui lòng đợi một chút nhé."},
    {"korean": "조용히 하십시오.", "vietnamese": "Xin vui lòng giữ trật tự."},
    {"korean": "기대지 마십시오.", "vietnamese": "Xin vui lòng không dựa vào."}
  ]'::jsonb,
  ARRAY['V – 지 말다', 'A/V – (으)면 안 되다', 'A/V – (으)ㄹ까요']::TEXT[],
  ARRAY['imperative', 'polite', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)세요. / (으)십시오' LIMIT 1),
  '여기 ___.',
  'fill_blank',
  '["앉으세요", "앉어요", "앉고", "앉으십시오"]'::jsonb,
  '앉으세요',
  'Yêu cầu lịch sự → 앉으세요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)세요. / (으)십시오' LIMIT 1),
  '맛있게 ___.',
  'fill_blank',
  '["드세요", "먹으세요", "먹어요", "드십시오"]'::jsonb,
  '드세요',
  'Ăn → 드세요 (động từ đặc biệt).',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)세요. / (으)십시오' LIMIT 1),
  '잠깐만 ___.',
  'multiple_choice',
  '["기다리세요", "기다려요", "기다리고", "기다리십시오"]'::jsonb,
  '기다리세요',
  'Đợi → 기다리세요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)세요. / (으)십시오' LIMIT 1),
  '조용히 ___.',
  'fill_blank',
  '["하십시오", "하세요", "해요", "하고"]'::jsonb,
  '하십시오',
  'Giữ trật tự (tôn kính) → 하십시오.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #31: V – 지 말다: 지 마세요. / 지 맙시다 [đừng...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 지 말다: 지 마세요. / 지 맙시다',
  'ji malda',
  'đừng...',
  'beginner',
  'imperative',
  'Yêu cầu, khuyên bảo người nghe không làm gì. Là dạng 지 말다 + (으)세요. Rủ rê, cầu khiến người khác đừng làm gì với mình: 지 맙시다. Ở dạng 반말 là 지 마, tuỳ theo hoàn cảnh có thể là câu mệnh lệnh, cầu khiến. Hình thức tôn kính là – 지 마십시오.',
  'V + 지 마세요 / 지 맙시다 / 지 마 / 지 마십시오',
  '[
    {"korean": "수업 시간에 자지 마세요.", "vietnamese": "Đừng ngủ trong giờ học."},
    {"korean": "살을 빼고 싶으면 피자를 먹지 마세요.", "vietnamese": "Nếu muốn giảm cân thì đừng ăn pizza."},
    {"korean": "우리 담배를 피우지 맙시다.", "vietnamese": "Chúng ta hãy đừng hút thuốc lá."},
    {"korean": "시험이 쉬우니까 걱정하지 마세요.", "vietnamese": "Vì bài thi dễ nên đừng lo lắng."},
    {"korean": "도서관이니까 떠들지 맙시다.", "vietnamese": "Vì là thư viện nên chúng ta hãy đừng làm ồn nhé."},
    {"korean": "의자가 더러워요. 여기에 앉지 마세요.", "vietnamese": "Ghế bẩn đấy. Anh đừng ngồi ở đây nhé."}
  ]'::jsonb,
  ARRAY['V – (으)세요. / (으)십시오', 'A/V – (으)면 안 되다', 'V – (으)ㅂ시다']::TEXT[],
  ARRAY['imperative', 'negative', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 지 말다: 지 마세요. / 지 맙시다' LIMIT 1),
  '수업 시간에 자지 ___.',
  'fill_blank',
  '["마세요", "말세요", "마", "마십시오"]'::jsonb,
  '마세요',
  'Đừng ngủ → 자지 마세요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 지 말다: 지 마세요. / 지 맙시다' LIMIT 1),
  '피자를 먹지 ___.',
  'fill_blank',
  '["마세요", "말세요", "마", "마십시오"]'::jsonb,
  '마세요',
  'Đừng ăn → 먹지 마세요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 지 말다: 지 마세요. / 지 맙시다' LIMIT 1),
  '우리 담배를 피우지 ___.',
  'multiple_choice',
  '["맙시다", "마세요", "마", "마십시오"]'::jsonb,
  '맙시다',
  'Chúng ta đừng → 피우지 맙시다.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 지 말다: 지 마세요. / 지 맙시다' LIMIT 1),
  '걱정하지 ___.',
  'fill_blank',
  '["마세요", "말세요", "마", "마십시오"]'::jsonb,
  '마세요',
  'Đừng lo → 걱정하지 마세요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #32: V – 아/어야 되다 / 하다 [phải...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 아/어야 되다 / 하다',
  'a/eoya doeda / hada',
  'phải...',
  'beginner',
  'obligation',
  'Diễn tả hành động phải làm gì đó. Văn nói có thể dùng 아/어야 되다 / 하다 còn văn viết chỉ dùng 아/어야 하다. Hình thức quá khứ: – 았/었어야 되다 / 하다: đã phải làm gì đó.',
  'V + 아/어야 되다 / 하다',
  '[
    {"korean": "식사하기 전에 손을 씻어야 해요.", "vietnamese": "Phải rửa tay trước khi ăn."},
    {"korean": "오늘은 고향에 가야 해요.", "vietnamese": "Hôm nay tôi phải về quê."},
    {"korean": "저녁에 숙제를 해야 돼요.", "vietnamese": "Buổi tối tôi phải làm bài tập."},
    {"korean": "교통 규칙을 잘 지켜야 해요.", "vietnamese": "Phải tuân thủ quy tắc giao thông."},
    {"korean": "학생은 열심히 공부해야 합니다.", "vietnamese": "Học sinh phải học hành chăm chỉ."},
    {"korean": "버스는 3 시에 출발해야 합니다.", "vietnamese": "Xe bus phải xuất phát lúc 3 giờ."},
    {"korean": "가수는 목소리가 좋아야 합니다.", "vietnamese": "Ca sĩ thì giọng phải tốt."}
  ]'::jsonb,
  ARRAY['A/V – 지 않아도 되다', 'A/V – (으)면 안 되다', 'A/V – 아/어도 되다']::TEXT[],
  ARRAY['obligation', 'must', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어야 되다 / 하다' LIMIT 1),
  '식사하기 전에 손을 씻어야 ___.',
  'fill_blank',
  '["해요", "돼요", "되다", "한다"]'::jsonb,
  '해요',
  'Phải → 씻어야 해요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어야 되다 / 하다' LIMIT 1),
  '오늘은 고향에 가야 ___.',
  'fill_blank',
  '["해요", "돼요", "되다", "한다"]'::jsonb,
  '해요',
  'Phải → 가야 해요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어야 되다 / 하다' LIMIT 1),
  '저녁에 숙제를 해야 ___.',
  'multiple_choice',
  '["돼요", "해요", "되다", "한다"]'::jsonb,
  '돼요',
  'Phải → 해야 돼요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어야 되다 / 하다' LIMIT 1),
  '학생은 열심히 공부해야 ___.',
  'fill_blank',
  '["합니다", "해요", "돼요", "되다"]'::jsonb,
  '합니다',
  'Phải (văn viết) → 공부해야 합니다.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #33: A V – 아/어도 되다 [được phép làm gì đó]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A V – 아/어도 되다',
  'a/eodo doeda',
  'được phép làm gì đó',
  'beginner',
  'permission',
  'Diễn tả sự cho phép hoặc chấp thuận hành động nào đó. Khi hỏi 아/어도 되다, nếu đồng ý dùng 아/어도 되다, còn nếu không được phép dùng cấu trúc (으)면 안 되as, không được phép dùng cấu trúc 아/어도 안 되다. 아/어도 괜찮다 và – 아/어도 좋다 có nghĩa tương tự – 아/어도 되다.',
  'V + 아/어도 되다',
  '[
    {"korean": "에어컨을 켜도 돼요? 네, 켜도 돼요.", "vietnamese": "Tôi bật điều hòa được không? Vâng, được ạ."},
    {"korean": "기숙사에서 요리해도 돼요? 아니요, 하면 안 돼요.", "vietnamese": "Có được nấu ăn ở kí túc xá không ạ? Không, không được đâu."},
    {"korean": "엄마, 이 약을 먹어도 돼요? 아니요, 먹으면 안 돼요.", "vietnamese": "Mẹ, con uống thuốc này được không ạ? Không, không được đâu."},
    {"korean": "창문을 열어도 돼요? 그럼요. 열어도 돼요.", "vietnamese": "Tôi mở cửa sổ nhé? Vâng, bạn mở đi."},
    {"korean": "여기에 앉아도 돼요?", "vietnamese": "Tôi ngồi ở đây được chứ?"},
    {"korean": "사진을 찍어도 돼요?", "vietnamese": "Tôi chụp ảnh được chứ?"}
  ]'::jsonb,
  ARRAY['A/V – (으)면 안 되다', 'A/V – 지 않아도 되다', 'V – 아/어야 되다 / 하다']::TEXT[],
  ARRAY['permission', 'allowed', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A V – 아/어도 되다' LIMIT 1),
  '에어컨을 켜도 ___.',
  'fill_blank',
  '["돼요", "되다", "좋다", "괜찮다"]'::jsonb,
  '돼요',
  'Được phép → 켜도 돼요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A V – 아/어도 되다' LIMIT 1),
  '기숙사에서 요리해도 ___.',
  'fill_blank',
  '["돼요", "되다", "좋다", "괜찮다"]'::jsonb,
  '돼요',
  'Được phép → 요리해도 돼요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A V – 아/어도 되다' LIMIT 1),
  '창문을 열어도 ___.',
  'multiple_choice',
  '["돼요", "되다", "좋다", "괜찮다"]'::jsonb,
  '돼요',
  'Được phép → 열어도 돼요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A V – 아/어도 되다' LIMIT 1),
  '사진을 찍어도 ___.',
  'fill_blank',
  '["돼요", "되다", "좋다", "괜찮다"]'::jsonb,
  '돼요',
  'Được phép → 찍어도 돼요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #34: A/V – (으)면 안 되다 [không được]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)면 안 되다',
  '(eu)myeon an doeda',
  'không được',
  'beginner',
  'prohibition',
  'Cấm đoán, ngăn cấm ai đó không được phép làm một việc gì đó. Hình thức phủ định của – (으)면 안 되다 là – 지 않으면 안 되다 (nhấn mạnh hành vi cần phải làm).',
  'A/V + (으)면 안 되다',
  '[
    {"korean": "지금 길을 건너면 안 돼요.", "vietnamese": "Bây giờ không được qua đường."},
    {"korean": "여기 앉으면 안 돼요.", "vietnamese": "Không được ngồi ở đây."},
    {"korean": "기숙사에서 요리하면 안 돼요.", "vietnamese": "Không được nấu ăn trong kí túc xá."},
    {"korean": "여기 담배를 피우면 안 돼요.", "vietnamese": "Không được hút thuốc lá ở đây."},
    {"korean": "뜨거우니까 만지면 안 돼요.", "vietnamese": "Vì nóng nên không được chạm vào."},
    {"korean": "숙제를 하지 않으면 안 돼요.", "vietnamese": "Nếu không làm bài tập là không được."}
  ]'::jsonb,
  ARRAY['A V – 아/어도 되다', 'V – 지 말다', 'V – 아/어야 되다 / 하다']::TEXT[],
  ARRAY['prohibition', 'not allowed', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면 안 되다' LIMIT 1),
  '지금 길을 건너면 안 ___.',
  'fill_blank',
  '["돼요", "되다", "좋다", "괜찮다"]'::jsonb,
  '돼요',
  'Không được → 건너면 안 돼요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면 안 되다' LIMIT 1),
  '여기 앉으면 안 ___.',
  'fill_blank',
  '["돼요", "되다", "좋다", "괜찮다"]'::jsonb,
  '돼요',
  'Không được → 앉으면 안 돼요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면 안 되다' LIMIT 1),
  '기숙사에서 요리하면 안 ___.',
  'multiple_choice',
  '["돼요", "되다", "좋다", "괜찮다"]'::jsonb,
  '돼요',
  'Không được → 요리하면 안 돼요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면 안 되다' LIMIT 1),
  '여기 담배를 피우면 안 ___.',
  'fill_blank',
  '["돼요", "되다", "좋다", "괜찮다"]'::jsonb,
  '돼요',
  'Không được → 피우면 안 돼요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #35: A/V – 지 않아도 되다. (안 A/V – 아 /어도 되다) [không cần ... cũng được]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 지 않아도 되다. (안 A/V – 아 /어도 되다)',
  'ji anado doeda',
  'không cần ... cũng được',
  'beginner',
  'obligation',
  'Diễn tả không cần thiết phải làm hành động nào đó. Là hình thức phủ định của – 아/어야 되다 / 하다.',
  'A/V + 지 않아도 되다 / 안 A/V + 아/어도 되다',
  '[
    {"korean": "금요일에는 교복을 안 입어도 돼요.", "vietnamese": "Vào thứ 6 không mặc đồng phục cũng được."},
    {"korean": "평일이니까 영화 표를 미리 사지 않아도 돼요.", "vietnamese": "Vì là ngày trong tuần nên không mua vé xem phim trước cũng được."},
    {"korean": "숙제를 하지 않아도 괜찮아요.", "vietnamese": "Không làm bài tập cũng được."},
    {"korean": "오늘 회사에 꼭 가야 돼요?", "vietnamese": "Hôm nay nhất định phải đến công ty sao?"},
    {"korean": "바쁘면 안 가도 돼요.", "vietnamese": "Nếu bận thì không đến cũng được."}
  ]'::jsonb,
  ARRAY['V – 아/어야 되다 / 하다', 'A V – 아/어도 되다', 'A/V – (으)면 안 되다']::TEXT[],
  ARRAY['obligation', 'not necessary', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 지 않아도 되다. (안 A/V – 아 /어도 되다)' LIMIT 1),
  '금요일에는 교복을 안 입어도 ___.',
  'fill_blank',
  '["돼요", "되다", "좋다", "괜찮다"]'::jsonb,
  '돼요',
  'Không cần cũng được → 안 입어도 돼요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 지 않아도 되다. (안 A/V – 아 /어도 되다)' LIMIT 1),
  '영화 표를 미리 사지 않아도 ___.',
  'fill_blank',
  '["돼요", "되다", "좋다", "괜찮다"]'::jsonb,
  '돼요',
  'Không cần cũng được → 사지 않아도 돼요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 지 않아도 되다. (안 A/V – 아 /어도 되다)' LIMIT 1),
  '숙제를 하지 않아도 ___.',
  'multiple_choice',
  '["괜찮아요", "돼요", "되다", "좋다"]'::jsonb,
  '괜찮아요',
  'Không cần cũng được → 하지 않아도 괜찮아요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 지 않아도 되다. (안 A/V – 아 /어도 되다)' LIMIT 1),
  '바쁘면 안 가도 ___.',
  'fill_blank',
  '["돼요", "되다", "좋다", "괜찮다"]'::jsonb,
  '돼요',
  'Không cần cũng được → 안 가도 돼요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #36: A/V – (으)ㄹ까요? [tôi làm... nhé? / (chúng mình)... nhé? / nhỉ?]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ까요?',
  '(eu)lkkayo',
  'tôi làm... nhé? / (chúng mình)... nhé? / nhỉ?',
  'beginner',
  'suggestion',
  'Nghĩa 1: Gợi ý, hỏi ý kiến của người nghe về việc mình định làm. Chủ ngữ thông thường là 제가/내가 có thể được tỉnh lược. Nghĩa 2: Người nói muốn rủ người nghe cùng làm gì đó. Chủ ngữ는 우리 thường được tỉnh lược. Nghĩa 3: Được sử dụng cho câu hỏi, suy nghĩ hay suy đoán về đối tượng ngôi số 3.',
  'A/V + (으)ㄹ까요?',
  '[
    {"korean": "저는 어디에 앉을까요?", "vietnamese": "Tôi ngồi ở đâu nhỉ?"},
    {"korean": "오늘 저녁에 우리 같이 먹을까요?", "vietnamese": "Tối nay chúng mình cùng ăn tối nhé?"},
    {"korean": "요즘 꽃이 비쌀까요?", "vietnamese": "Dạo này hoa đắt nhỉ?"},
    {"korean": "김 선생님께서는 b现在 chắc đang ở trường đấy nhỉ?", "vietnamese": "Cô Kim chắc đang ở trường đấy nhỉ?"},
    {"korean": "문을 열어도 될까요?", "vietnamese": "Tôi mở cửa nhé?"},
    {"korean": "케이크를 좀 드실까요?", "vietnamese": "Bạn ăn chút bánh kem nhé?"}
  ]'::jsonb,
  ARRAY['V – (으)ㅂ시다', 'A/V – (으)면', 'V – (으)세요. / (으)십시오']::TEXT[],
  ARRAY['suggestion', 'invitation', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ까요?' LIMIT 1),
  '저는 어디에 앉___.',
  'fill_blank',
  '["을까요?", "을까", "을까요", "을까"]'::jsonb,
  '을까요?',
  'Tôi ngồi đâu nhỉ → 앉을까요?',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ까요?' LIMIT 1),
  '오늘 저녁에 우리 같이 먹___.',
  'fill_blank',
  '["을까요?", "을까", "을까요", "을까"]'::jsonb,
  '을까요?',
  'Chúng mình cùng ăn → 먹을까요?',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ까요?' LIMIT 1),
  '요즘 꽃이 비쌀___.',
  'multiple_choice',
  '["까요?", "까", "까요", "까"]'::jsonb,
  '까요?',
  'Hoa đắt nhỉ → 비쌀까요?',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ까요?' LIMIT 1),
  '문을 열어도 될___.',
  'fill_blank',
  '["까요?", "까", "까요", "까"]'::jsonb,
  '까요?',
  'Mở cửa nhé → 열어도 될까요?',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #37: V – (으) ㅂ시다 [hãy cùng, chúng ta cùng]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으) ㅂ시다',
  '(eu)psida',
  'hãy cùng, chúng ta cùng',
  'beginner',
  'suggestion',
  'Gợi ý hoặc đề nghị người nghe cùng làm gì, CÂU CẦU KHIẾN. Lưu ý: 아/어요 cũng có thể là dạng câu cầu khiến, khi đó thêm 함께/같이. Sử dụng khi người nói gợi ý một tập thể làm gì đó hoặc khi người nghe ít tuổi hơn hoặc có địa vị thấp hơn người nói. Không nên sử dụng với người lớn tuổi hoặc người có địa vị cao hơn. Khi đề xuất đừng làm gì đó: – 지 맙시다 hoặc – 지 마요.',
  'V + (으)ㅂ시다',
  '[
    {"korean": "지하철을 탑시다.", "vietnamese": "Chúng ta cùng đi tàu điện ngầm đi."},
    {"korean": "김치를 만듭시다.", "vietnamese": "Hãy cùng làm kimchi đi."},
    {"korean": "우리 같이 비빔밥 먹읍시다.", "vietnamese": "Chúng ta cùng ăn cơm trộn đi."},
    {"korean": "도서관에서 한국어 숙제를 합시다.", "vietnamese": "Chúng ta cùng làm bài tập tiếng Hàn ở thư viện đi."},
    {"korean": "제주도를 여행합시다.", "vietnamese": "Chúng ta cùng đi du lịch đảo Jeju đi."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ까요?', 'V – 지 말다', 'V – (으)세요. / (으)십시오']::TEXT[],
  ARRAY['suggestion', 'imperative', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으) ㅂ시다' LIMIT 1),
  '지하철을 탑___.',
  'fill_blank',
  '["시다", "읍시다", "ㅂ시다", "습니다"]'::jsonb,
  '시다',
  'Cùng đi tàu → 탑시다.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으) ㅂ시다' LIMIT 1),
  '김치를 만듭___.',
  'fill_blank',
  '["시다", "읍시다", "ㅂ시다", "습니다"]'::jsonb,
  '시다',
  'Cùng làm kimchi → 만듭시다.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으) ㅂ시다' LIMIT 1),
  '우리 같이 비빔밥 먹읍___.',
  'multiple_choice',
  '["시다", "읍시다", "ㅂ시다", "습니다"]'::jsonb,
  '시다',
  'Cùng ăn cơm trộn → 먹읍시다.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으) ㅂ시다' LIMIT 1),
  '제주도를 여행합___.',
  'fill_blank',
  '["시다", "읍시다", "ㅂ시다", "습니다"]'::jsonb,
  '시다',
  'Cùng đi du lịch → 여행합시다.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #38: V – (으) 시겠어요? [bạn sẽ ...chứ ạ?]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으) 시겠어요?',
  '(eu)sigesseoyo',
  'bạn sẽ ...chứ ạ?',
  'beginner',
  'suggestion',
  'Gợi ý người nghe hoặc hỏi ý kiến, dự định của người nghe một cách lịch sự. Lịch sự và trang trọng hơn – (으)ㄹ래요? / – (으)실래요?',
  'V + (으)시겠어요?',
  '[
    {"korean": "내일 몇 시에 오시겠어요?", "vietnamese": "Ngày mai mấy giờ bạn đến thế ạ?"},
    {"korean": "커피에 설탕을 넣으시겠어요?", "vietnamese": "Bạn có muốn cho chút đường vào cà phê không ạ?"},
    {"korean": "물을 좀 드시겠어요?", "vietnamese": "Bạn uống một chút nước nhé ạ?"},
    {"korean": "방을 예약하시겠어요?", "vietnamese": "Quý khách đặt phòng ạ?"},
    {"korean": "잠깐만 기다리시겠어요?", "vietnamese": "Bạn đợi một chút được không ạ?"}
  ]'::jsonb,
  ARRAY['V – (으)ㄹ래요?', 'V – (으)세요. / (으)십시오', 'A/V – (으)ㄹ까요?']::TEXT[],
  ARRAY['suggestion', 'polite', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으) 시겠어요?' LIMIT 1),
  '내일 몇 시에 오시___.',
  'fill_blank',
  '["겠어요?", "을래요?", "실래요?", "까요?"]'::jsonb,
  '겠어요?',
  'Bạn sẽ đến ạ → 오시겠어요?',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으) 시겠어요?' LIMIT 1),
  '물을 좀 드시___.',
  'fill_blank',
  '["겠어요?", "을래요?", "실래요?", "까요?"]'::jsonb,
  '겠어요?',
  'Bạn uống ạ → 드시겠어요?',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으) 시겠어요?' LIMIT 1),
  '방을 예약하시___.',
  'multiple_choice',
  '["겠어요?", "을래요?", "실래요?", "까요?"]'::jsonb,
  '겠어요?',
  'Đặt phòng ạ → 예약하시겠어요?',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으) 시겠어요?' LIMIT 1),
  '잠깐만 기다리시___.',
  'fill_blank',
  '["겠어요?", "을래요?", "실래요?", "까요?"]'::jsonb,
  '겠어요?',
  'Đợi ạ → 기다리시겠어요?',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #39: V – (으)ㄹ래요? [bạn sẽ...? tôi sẽ... / cùng... nhé?]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)ㄹ래요?',
  '(eu)llaeyo',
  'bạn sẽ...? tôi sẽ... / cùng... nhé?',
  'beginner',
  'suggestion',
  '1. Hỏi ý định người nghe hoặc 2. khi muốn đề nghị người nghe một cách nhẹ nhàng. Được sử dụng nhiều trong văn nói giữa những người bạn thân thiết, ý nghĩa 2 là câu cầu khiến. Có thể sử dụng –지 않을래요? (안 –(으)ㄹ래요?) thay cho (으)ㄹ래요? vì có cùng ý nghĩa mặc dù ở hình thức phủ định. Nếu người nói có mối quan hệ thân mật với người nghe nhưng vẫn muốn thể hiện tôn kính thì sử dụng –(으)실래요?. Để đáp lại, trả lời dưới dạng (으)ㄹ래요 hoặc (으)ㄹ게요.',
  'V + (으)ㄹ래요?',
  '[
    {"korean": "선미 씨는 뭐 먹을래요?", "vietnamese": "Seonmi, cậu sẽ ăn gì thế?"},
    {"korean": "저는 갈비탕을 먹을래요.", "vietnamese": "Tôi sẽ ăn canh xương bò hầm."},
    {"korean": "유키 씨, 우리 시험 끝나고 뭐 할래요?", "vietnamese": "Yuki, thi xong chúng ta sẽ làm gì nhỉ?"},
    {"korean": "이번 주말에 부산에 가려고 하는데 같이 갈래요?", "vietnamese": "Cuối tuần này tôi định đi Busan, bạn có muốn đi cùng không?"},
    {"korean": "라면을 끓였는데 먹을래요?", "vietnamese": "Tôi đã nấu mì rồi, bạn có muốn ăn không?"},
    {"korean": "여기에 앉으실래요?", "vietnamese": "Bạn muốn ngồi ở đây không?"}
  ]'::jsonb,
  ARRAY['V – (으) 시겠어요?', 'A/V – (으)ㄹ까요?', 'V – (으)ㅂ시다']::TEXT[],
  ARRAY['suggestion', 'intimate', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ래요?' LIMIT 1),
  '선미 씨는 뭐 먹___.',
  'fill_blank',
  '["을래요?", "을까요?", "을래", "을게요"]'::jsonb,
  '을래요?',
  'Sẽ ăn gì → 먹을래요?',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ래요?' LIMIT 1),
  '저는 갈비탕을 먹___.',
  'fill_blank',
  '["을래요.", "을까요?", "을래", "을게요"]'::jsonb,
  '을래요.',
  'Sẽ ăn → 먹을래요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ래요?' LIMIT 1),
  '우리 시험 끝나고 뭐 할___.',
  'multiple_choice',
  '["을래요?", "을까요?", "을래", "을게요"]'::jsonb,
  '을래요?',
  'Sẽ làm gì → 할래요?',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ래요?' LIMIT 1),
  '같이 갈___.',
  'fill_blank',
  '["을래요?", "을까요?", "을래", "을게요"]'::jsonb,
  '을래요?',
  'Đi cùng → 갈래요?',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #40: V – 고 싶다 [muốn...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 고 싶다',
  'go sipda',
  'muốn...',
  'beginner',
  'desire',
  'Trong câu trần thuật, thể hiện thứ mà người nói muốn. Còn trong câu nghi vấn, dùng để hỏi thứ mà người nghe muốn. Trường hợp dùng với ngôi thứ 3 (là một người khác được nhắc đến) thì cả trong câu hỏi hay câu tường thuật đều dùng dạng – 고 싶어 하다. Quá khứ: – 고 싶었다, tương lai/ phỏng đoán: – 고 싶겠as hoặc – 고 싶을 것이다. A – 고 싶다 (X) => A+ 아/어/여지다 – 고 싶다 (O). Với trường hợp của 보고 싶다, nếu chủ ngữ는 나(저), 우리 và nó mang ý nghĩa của 그립다 (nhớ, thương nhớ, mong đợi, không phải là ý nghĩa xem, nhìn) thì cần dùng ở dạng 이/가 보고 싶다.',
  'V + 고 싶다',
  '[
    {"korean": "저는 돌아가신 엄마가 보고 싶어요.", "vietnamese": "Tôi nhớ người mẹ đã khuất."},
    {"korean": "예뻐지고 싶어요.", "vietnamese": "Tôi muốn trở nên xinh đẹp."},
    {"korean": "냉면을 먹고 싶어요.", "vietnamese": "Tôi muốn ăn mì lạnh."},
    {"korean": "흐엉 씨는 한국어를 배우고 싶어해요.", "vietnamese": "Hương muốn học tiếng Hàn."},
    {"korean": "저는 빨리 집에 가고 싶어요.", "vietnamese": "Tôi muốn đi về nhà thật nhanh."},
    {"korean": "저는 시험에서 일등을 하고 싶어요.", "vietnamese": "Tôi muốn đứng thứ nhất trong kì thi."},
    {"korean": "동생은 피자를 먹고 싶어해요.", "vietnamese": "Em tôi muốn ăn pizza."}
  ]'::jsonb,
  ARRAY['A/V – 았/었으면 좋겠다', 'A/V – 기 바라다', 'V – (으)려고']::TEXT[],
  ARRAY['desire', 'want', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 싶다' LIMIT 1),
  '냉면을 먹고 싶___.',
  'fill_blank',
  '["어요.", "어해요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Muốn ăn → 먹고 싶어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 싶다' LIMIT 1),
  '저는 빨리 집에 가고 싶___.',
  'fill_blank',
  '["어요.", "어해요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Muốn về → 가고 싶어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 싶다' LIMIT 1),
  '흐엉 씨는 한국어를 배우고 싶어___.',
  'multiple_choice',
  '["해요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '해요.',
  'Ngôi thứ 3 → 배우고 싶어해요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 고 싶다' LIMIT 1),
  '동생은 피자를 먹고 싶어___.',
  'fill_blank',
  '["해요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '해요.',
  'Ngôi thứ 3 → 먹고 싶어해요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #41: A/V – 았/었으면 좋겠다 [nếu...thì tốt, ước gì...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 았/었으면 좋겠다',
  'at/eosseumyeon jokketda',
  'nếu...thì tốt, ước gì...',
  'beginner',
  'wish',
  'Biểu hiện diễn tả mong ước hoặc hy vọng một việc gì đó không có thực hoặc khác với thực tế. Có thể thay thế 좋겠as bằng 하다 hoặc 싶다. – 았/었으면 좋겠as và – (으)면 좋겠as tương tự nhau, tuy nhiên – 았/었으면 좋겠as diễn tả mong ước khó thành hiện thực hơn và nhấn mạnh hơn.',
  'A/V + 았/었으면 좋겠다',
  '[
    {"korean": "내일 날씨가 좋으면 좋겠어요.", "vietnamese": "Ngày mai nếu thời tiết đẹp thì tốt."},
    {"korean": "부자였으면 좋겠어요.", "vietnamese": "Ước gì tôi là người giàu."},
    {"korean": "친구가 많았으면 좋겠어요.", "vietnamese": "Ước gì tôi có nhiều bạn."},
    {"korean": "크리스마스에 눈이 왔으면 좋겠어요.", "vietnamese": "Tôi ước tuyết rơi vào ngày Giáng sinh."},
    {"korean": "방학이 빨리 왔으면 좋겠어요.", "vietnamese": "Tôi ước kì nghỉ đến nhanh."},
    {"korean": "좀 쉬었으면 좋겠어요.", "vietnamese": "Nếu được nghỉ ngơi một chút thì tốt."}
  ]'::jsonb,
  ARRAY['V – 고 싶다', 'A/V – 기 바라다', 'A/V – (으)면 좋겠다']::TEXT[],
  ARRAY['wish', 'hope', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 았/었으면 좋겠다' LIMIT 1),
  '내일 날씨가 좋으면 좋___.',
  'fill_blank',
  '["겠어요.", "을 거예요.", "습니다.", "습니다."]'::jsonb,
  '겠어요.',
  'Nếu...thì tốt → 좋겠어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 았/었으면 좋겠다' LIMIT 1),
  '부자였으면 좋___.',
  'fill_blank',
  '["겠어요.", "을 거예요.", "습니다.", "습니다."]'::jsonb,
  '겠어요.',
  'Ước gì → 좋겠어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 았/었으면 좋겠다' LIMIT 1),
  '친구가 많았으면 좋___.',
  'multiple_choice',
  '["겠어요.", "을 거예요.", "습니다.", "습니다."]'::jsonb,
  '겠어요.',
  'Ước gì → 좋겠어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 았/었으면 좋겠다' LIMIT 1),
  '방학이 빨리 왔으면 좋___.',
  'fill_blank',
  '["겠어요.", "을 거예요.", "습니다.", "습니다."]'::jsonb,
  '겠어요.',
  'Ước gì → 좋겠어요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #42: A/V – 기 바라다 [hi vọng rằng...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 기 바라다',
  'gi barada',
  'hi vọng rằng...',
  'beginner',
  'wish',
  'Biểu hiện diễn tả sự hi vọng vào điều gì đó. Dùng trong văn viết với những thông báo mang tính chất trang trọng hoặc dùng trong văn nói với văn phong trang trọng, lời chúc. Ở dạng khẩu ngữ, người Hàn chia thành 바래요.',
  'A/V + 기 바라다',
  '[
    {"korean": "할아버지께서는 건강하시기 바랍니다.", "vietnamese": "Chúc ông nội mạnh khỏe."},
    {"korean": "모두 제시간에 와 주시기 바랍니다.", "vietnamese": "Hi vọng tất cả các bạn sẽ đến đúng giờ."},
    {"korean": "계단을 이용해 주시기 바랍니다.", "vietnamese": "Mọi người hãy dùng thang bộ."},
    {"korean": "모든 일이 다 잘 되기를 바랍니다.", "vietnamese": "Hi vọng rằng mọi việc sẽ tốt đẹp."},
    {"korean": "더욱더 행복하시기 바랍니다.", "vietnamese": "Chúc bạn ngày càng hạnh phúc hơn nữa."},
    {"korean": "빨리 회복하시기 바랍니다.", "vietnamese": "Hi vọng rằng bạn sớm bình phục."}
  ]'::jsonb,
  ARRAY['V – 고 싶다', 'A/V – 았/었으면 좋겠다', 'V – (으)세요. / (으)십시오']::TEXT[],
  ARRAY['wish', 'formal', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 기 바라다' LIMIT 1),
  '할아버지께서는 건강하시기 바랍___.',
  'fill_blank',
  '["니다.", "어요.", "습니다.", "습니다."]'::jsonb,
  '니다.',
  'Chúc mạnh khỏe → 바랍니다.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 기 바라다' LIMIT 1),
  '모두 제시간에 와 주시기 바랍___.',
  'fill_blank',
  '["니다.", "어요.", "습니다.", "습니다."]'::jsonb,
  '니다.',
  'Hi vọng đến đúng giờ → 바랍니다.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 기 바라다' LIMIT 1),
  '모든 일이 다 잘 되기를 바랍___.',
  'multiple_choice',
  '["니다.", "어요.", "습니다.", "습니다."]'::jsonb,
  '니다.',
  'Hi vọng tốt đẹp → 바랍니다.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 기 바라다' LIMIT 1),
  '빨리 회복하시기 바랍___.',
  'fill_blank',
  '["니다.", "어요.", "습니다.", "습니다."]'::jsonb,
  '니다.',
  'Hi vọng bình phục → 바랍니다.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #43: V – 아/어 보다 [thử..., đã từng, đã thử...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 아/어 보다',
  'a/eo boda',
  'thử..., đã từng, đã thử...',
  'beginner',
  'experience',
  'Khi sử dụng ở thì hiện tại, cấu trúc này diễn tả việc thử làm gì đó, còn khi sử dụng ở thì quá khứ, cấu trúc này diễn tả kinh nghiệm đã từng làm gì đó. Diễn tả kinh nghiệm của bản thân và không sử dụng với 보다.',
  'V + 아/어 보다',
  '[
    {"korean": "그 바지를 입어 보세요.", "vietnamese": "Hãy thử mặc cái quần đó đi."},
    {"korean": "저는 스키를 타 봤어요.", "vietnamese": "Tôi đã từng thử trượt tuyết."},
    {"korean": "이 음식 먹어 봐.", "vietnamese": "Ăn thử món này đi."},
    {"korean": "두 달 정도 요가를 해 봤어요.", "vietnamese": "Tôi đã từng tập yoga khoảng 2 tháng."},
    {"korean": "막걸리를 마셔 봤어요?", "vietnamese": "Bạn đã từng uống rượu gạo Hàn Quốc chưa?"},
    {"korean": "아니요, 안 마셔 봤어요. 어떤 맛이에요?", "vietnamese": "Chưa, tôi chưa từng uống. Vị của nó thế nào?"}
  ]'::jsonb,
  ARRAY['V - (으)ㄴ 적이 있다/ 없다', 'V – 고 싶다', 'V – (으)려고']::TEXT[],
  ARRAY['experience', 'try', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어 보다' LIMIT 1),
  '그 바지를 입어 보___.',
  'fill_blank',
  '["세요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '세요.',
  'Thử mặc → 입어 보세요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어 보다' LIMIT 1),
  '저는 스키를 타 봤___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Đã từng → 타 봤어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어 보다' LIMIT 1),
  '이 음식 먹어 ___.',
  'multiple_choice',
  '["봐.", "보세요.", "봤어요.", "봅니다."]'::jsonb,
  '봐.',
  'Thử ăn → 먹어 봐.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어 보다' LIMIT 1),
  '요가를 해 봤___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Đã từng → 해 봤어요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #44: V - (으)ㄴ 적이 있다/ 없다 [đã từng, đã từng thử.../ chưa từng]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V - (으)ㄴ 적이 있다/ 없다',
  '(eu)n jeogi itda/eopda',
  'đã từng, đã từng thử.../ chưa từng',
  'beginner',
  'experience',
  'Biểu hiện thể hiện việc có/ không có kinh nghiệm hay trải nghiệm về một việc gì đó trong quá khứ. Thường kết hợp với 아/어 보다 => 아/어 본 적이 있다/없다. Không sử dụng cấu trúc này khi mô tả hành động thường xuyên xảy ra, lặp đi lặp lại trong quá khứ.',
  'V(nguyên âm/ㄹ) + ㄴ 적이 있다/없다 / V(phụ âm) + 은 적이 있다/없다',
  '[
    {"korean": "제주도에 간 적이 있어요?", "vietnamese": "Bạn đã từng đến đảo Jeju chưa?"},
    {"korean": "저는 삼계탕을 먹어 본 적이 없어요.", "vietnamese": "Tôi chưa từng ăn món gà tần sâm."},
    {"korean": "설악산을 구경해 본 적이 있지요?", "vietnamese": "Bạn đã từng đi ngắm cảnh núi Seorak đúng không?"},
    {"korean": "그런 생각은 한 번도 한 적이 없습니다.", "vietnamese": "Tôi chưa từng một lần nghĩ như thế."},
    {"korean": "예전에 이 책을 읽은 적이 있어요.", "vietnamese": "Trước đây tôi đã từng đọc cuốn sách này rồi."},
    {"korean": "어렸을 때 피아노를 배운 적이 있어요.", "vietnamese": "Hồi nhỏ tôi đã từng học Piano."},
    {"korean": "한복을 한 번도 입어 본 적이 없어요.", "vietnamese": "Tôi chưa từng mặc Hanbok một lần nào."}
  ]'::jsonb,
  ARRAY['V – 아/어 보다', 'V-ㄴ/은 적이 있다/없다', 'V – 고 싶다']::TEXT[],
  ARRAY['experience', 'past', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)ㄴ 적이 있다/ 없다' LIMIT 1),
  '제주도에 간 적이 있___.',
  'fill_blank',
  '["어요?", "었어요?", "습니다.", "습니다."]'::jsonb,
  '어요?',
  'Đã từng → 간 적이 있어요?',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)ㄴ 적이 있다/ 없다' LIMIT 1),
  '삼계탕을 먹어 본 적이 없___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Chưa từng → 먹어 본 적이 없어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)ㄴ 적이 있다/ 없다' LIMIT 1),
  '설악산을 구경해 본 적이 있___.',
  'multiple_choice',
  '["지요?", "어요?", "습니다.", "습니다."]'::jsonb,
  '지요?',
  'Đã từng → 구경해 본 적이 있지요?',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)ㄴ 적이 있다/ 없다' LIMIT 1),
  '피아노를 배운 적이 있___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Đã từng → 배운 적이 있어요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #45: V - (으)러 가다 / 오다 / 다니다... [đi làm gì đó]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V - (으)러 가다 / 오다 / 다니다...',
  '(eu)reo gada/oda/danida',
  'đi làm gì đó',
  'beginner',
  'purpose',
  'Biểu hiện diễn tả mục đích đi đến đâu đó để thực hiện hành động gì của người nói. Sau – (으)러 chỉ kết hợp với các động từ chuyển động như: 가다, 오다, 다니다, 올라가다, 나가다,... Trước – (으)러 không thể kết hợp với các động từ chuyển động. Lưu ý: địa điểm trong câu phải dùng với tiểu từ 에.',
  'V + (으)러 + động từ chuyển동 (가다/오다/다니다...)',
  '[
    {"korean": "요즘 수영을 배우러 다녀요.", "vietnamese": "Dạo này tôi đi học bơi."},
    {"korean": "저녁을 먹으러 식당에 가요.", "vietnamese": "Tôi đến nhà hàng để ăn tối."},
    {"korean": "백화점에 목도리를 사러 왔어요.", "vietnamese": "Tôi đến trung tâm thương mại mua khăn."},
    {"korean": "일하러 한국에 왔어요.", "vietnamese": "Tôi đến HQ để làm việc."},
    {"korean": "돈을 찾으러 은행에 갔어요.", "vietnamese": "Tôi đến ngân hàng để rút tiền."},
    {"korean": "주말에 우리 집에 놀러 오세요.", "vietnamese": "Cuối tuần mời bạn đến nhà tôi chơi."},
    {"korean": "춤을 배우러 학원에 다녀요.", "vietnamese": "Tôi thường đến trung tâm để học múa."}
  ]'::jsonb,
  ARRAY['V - (으)려고', 'V – (으)면', 'V – (으)ㄹ 수 있다/없다']::TEXT[],
  ARRAY['purpose', 'movement', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)러 가다 / 오다 / 다니다...' LIMIT 1),
  '수영을 배우러 다녀___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Đi học bơi → 다녀요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)러 가다 / 오다 / 다니다...' LIMIT 1),
  '저녁을 먹으러 식당에 가___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Đến nhà hàng → 가요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)러 가다 / 오다 / 다니다...' LIMIT 1),
  '목도리를 사러 왔___.',
  'multiple_choice',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Đến mua → 왔어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)러 가다 / 오다 / 다니다...' LIMIT 1),
  '돈을 찾으러 은행에 갔___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Đến rút → 갔어요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #46: V - (으)려고 [để...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V - (으)려고',
  '(eu)ryeogo',
  'để...',
  'beginner',
  'purpose',
  'Vĩ tố liên kết diễn tả ý định hoặc kế hoạch của người nói. Cụ thể, để hoàn thành ý định được nêu ra ở mệnh đề trước, người nói sẽ thực hiện hành động mệnh đề sau. Vế sau không kết hợp với hành động chưa xảy ra, không kết hợp với câu mệnh lệnh hoặc cầu khiến.',
  'V + (으)려고',
  '[
    {"korean": "음악을 들으려고 라디오를 켰어요.", "vietnamese": "Tôi bật radio để nghe nhạc."},
    {"korean": "여행을 가려고 비행기 표를 예약했어요.", "vietnamese": "Tôi đặt vé máy bay để đi du lịch."},
    {"korean": "김치를 만들려고 배추를 챙겼어요.", "vietnamese": "Tôi lấy cải thảo để làm kim chi."},
    {"korean": "살을 빼려고 매일 세 시간씩 운동을 해요.", "vietnamese": "Tôi tập thể dục mỗi ngày để giảm cân."},
    {"korean": "한국 사람과 이야기하려고 한국어를 배워요.", "vietnamese": "Tôi học tiếng Hàn để nói chuyện với người Hàn Quốc."},
    {"korean": "졸리지 않으려고 커피를 5 잔이나 마셨어요.", "vietnamese": "Tôi uống tận 5 tách cà phê để không bị buồn ngủ."}
  ]'::jsonb,
  ARRAY['V - (으)러 가다 / 오다 / 다니다...', 'V – (으)면', 'V – 고 싶다']::TEXT[],
  ARRAY['purpose', 'intention', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)려고' LIMIT 1),
  '음악을 들으려고 라디오를 켰___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Để nghe nhạc → 켰어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)려고' LIMIT 1),
  '여행을 가려고 비행기 표를 예약했___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Để đi du lịch → 예약했어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)려고' LIMIT 1),
  '김치를 만들려고 배추를 챙겼___.',
  'multiple_choice',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Để làm kim chi → 챙겼어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)려고' LIMIT 1),
  '살을 빼려고 운동을 해___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Để giảm cân → 해요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #47: V – (으)려고 하다 [định...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)려고 하다',
  '(eu)ryeogo hada',
  'định...',
  'beginner',
  'intention',
  'Vĩ tố kết thúc: Diễn tả ý chí, ý định hoặc kế hoạch tương lai của chủ thể. Chỉ sử dụng khi hành động hoặc kế hoạch chưa xảy ra. Hình thức quá khứ: – (으)려고 했다.',
  'V + (으)려고 하다',
  '[
    {"korean": "점심에는 비빔밥을 먹으려고 해요.", "vietnamese": "Tôi định ăn cơm trộn vào bữa trưa."},
    {"korean": "케이크를 만들려고 해요.", "vietnamese": "Tôi định làm bánh kem."},
    {"korean": "저녁에 숙제를 하려고 해요.", "vietnamese": "Tôi định làm bài tập vào buổi tối."},
    {"korean": "결혼하면 아이를 두 명 낳으려고 해요.", "vietnamese": "Nếu kết hôn, tôi định sinh hai con."},
    {"korean": "오늘 도서관에 가려고 합니다.", "vietnamese": "Hôm nay tôi định đến thư viện."},
    {"korean": "아침에 몇 시에 부산으로 출발하려고 합니까?", "vietnamese": "Buổi sáng anh định mấy giờ xuất phát đi Busan."},
    {"korean": "미국에 가려고 했는데 코로나–19 때문에 못 갔어요.", "vietnamese": "Tôi định đi Mỹ nhưng vì Covid–19 nên đã không thể đi được."}
  ]'::jsonb,
  ARRAY['V - (으)려고', 'V – 기로 하다', 'V – (으)ㄹ까 하다']::TEXT[],
  ARRAY['intention', 'plan', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)려고 하다' LIMIT 1),
  '점심에는 비빔밥을 먹으려고 해___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Định ăn → 먹으려고 해요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)려고 하다' LIMIT 1),
  '케이크를 만들려고 해___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Định làm → 만들려고 해요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)려고 하다' LIMIT 1),
  '저녁에 숙제를 하려고 해___.',
  'multiple_choice',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Định làm → 하려고 해요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)려고 하다' LIMIT 1),
  '오늘 도서관에 가려고 합___.',
  'fill_blank',
  '["니다.", "어요.", "습니다.", "습니다."]'::jsonb,
  '니다.',
  'Định đến → 가려고 합니다.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #48: N 을/를 위해(서), V – 기 위해(서) [để..., vì + N]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N 을/를 위해(서), V – 기 위해(서)',
  'eul/reul wihaeseo, gi wihaeseo',
  'để..., vì + N',
  'beginner',
  'purpose',
  'Vĩ tố liên kết: Diễn tả ý đồ hoặc mục đích thực hiện hành động nào đó. Cụ thể, để hoàn thành ý đồ hoặc mục đích được nêu ra ở mệnh đề trước, người nói sẽ thực hiện hành động mệnh đề sau. Khác với –(으)려go, –기 위해(서) có thể kết hợp với –아/어야 해요, –(으)ㅂ시다, –(으)세요, (으)ㄹ까요?',
  'N + 을/를 위해(서) / V + 기 위해(서)',
  '[
    {"korean": "한국에서 취업하기 위해 한국어를 공부하고 있어요.", "vietnamese": "Tôi đang học tiếng Hàn để làm việc tại công ty Hàn Quốc."},
    {"korean": "살을 빼기 위해서 운동하고 있어요.", "vietnamese": "Tôi tập thể dục để giảm cân."},
    {"korean": "가족을 위해 돈을 많이 벌겠어요.", "vietnamese": "Tôi sẽ kiếm thật nhiều tiền cho gia đình."},
    {"korean": "통역사를 되기 위해 한국어를 열심히 공부하고 있습니다.", "vietnamese": "Tôi học tiếng Hàn chăm chỉ để trở thành thông dịch viên."},
    {"korean": "민우 씨를 만나기 위해 여가까지 달려 왔어요.", "vietnamese": "Tôi đã chạy đến đây để gặp Minwoo."},
    {"korean": "등록금을 마련하기 위해서 아르바이트를 하고 있어요.", "vietnamese": "Tôi đang làm thêm để kiếm tiền học phí."}
  ]'::jsonb,
  ARRAY['V - (으)려고', 'V - (으)러 가다 / 오다 / 다니다...', 'V – (으)려면']::TEXT[],
  ARRAY['purpose', 'for', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 을/를 위해(서), V – 기 위해(서)' LIMIT 1),
  '한국에서 취업하기 위해 한국어를 공부하고 있___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Để làm việc → 취업하기 위해',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 을/를 위해(서), V – 기 위해(서)' LIMIT 1),
  '살을 빼기 위해서 운동하고 있___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Để giảm cân → 빼기 위해서',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 을/를 위해(서), V – 기 위해(서)' LIMIT 1),
  '가족을 위해 돈을 많이 벌___.',
  'multiple_choice',
  '["겠어요.", "을 거예요.", "습니다.", "습니다."]'::jsonb,
  '겠어요.',
  'Vì gia đình → 가족을 위해',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N 을/를 위해(서), V – 기 위해(서)' LIMIT 1),
  '통역사를 되기 위해 한국어를 열심히 공부하고 있___.',
  'fill_blank',
  '["습니다.", "어요.", "습니다.", "습니다."]'::jsonb,
  '습니다.',
  'Để trở thành → 되기 위해',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #49: V – 기로 하다 [quyết định sẽ..., định sẽ...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 기로 하다',
  'gi ro hada',
  'quyết định sẽ..., định sẽ...',
  'beginner',
  'decision',
  'Vĩ tố kết thúc: Thể hiện sự quyết tâm hay hứa hẹn sẽ thực hiện hành động nào đó. Thường dùng dưới dạng – 기로 했다 nhưng ý nghĩa ở thì tương lai.',
  'V + 기로 하다',
  '[
    {"korean": "영화를 보러 가기로 했어요.", "vietnamese": "Tôi quyết định đi xem phim."},
    {"korean": "이번에는 여행을 가지 않기로 했어요.", "vietnamese": "Lần này tôi đã quyết định không đi du lịch."},
    {"korean": "오늘부터 담배를 끊기로 했어요.", "vietnamese": "Tôi quyết định từ hôm nay sẽ bỏ thuốc lá."},
    {"korean": "마이 씨는 태권도를 배우기로 했어요.", "vietnamese": "Mai đã quyết định học taekwondo."},
    {"korean": "주말에 친구하고 같이 등산하기로 했어요.", "vietnamese": "Tôi quyết định đi leo núi cùng với bạn vào cuối tuần này."},
    {"korean": "우리는 3 년 후에 결혼하기로 했습니다.", "vietnamese": "Chúng tôi quyết định kết hôn sau ba năm nữa."},
    {"korean": "민수 씨는 술을 끊기로 했어요.", "vietnamese": "Minsoo đã quyết định cai rượu."}
  ]'::jsonb,
  ARRAY['V – (으)려고 하다', 'V – (으)ㄹ까 하다', 'V – 고 싶다']::TEXT[],
  ARRAY['decision', 'promise', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 기로 하다' LIMIT 1),
  '영화를 보러 가기로 했___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Quyết định → 가기로 했어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 기로 하다' LIMIT 1),
  '이번에는 여행을 가지 않기로 했___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Quyết định → 않기로 했어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 기로 하다' LIMIT 1),
  '오늘부터 담배를 끊기로 했___.',
  'multiple_choice',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Quyết định → 끊기로 했어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 기로 하다' LIMIT 1),
  '태권도를 배우기로 했___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Quyết định → 배우기로 했어요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #50: V – (으)ㄹ까 하다 [phân vân sẽ..., đang nghĩ sẽ...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)ㄹ까 하다',
  '(eu)kka hada',
  'phân vân sẽ..., đang nghĩ sẽ...',
  'beginner',
  'hesitation',
  'Thể hiện suy nghĩ phân vân, do dự, chưa chắc chắn làm việc gì đó. Có thể sử dụng phân vân có nên làm gì đó hay không: V – (으)ㄹ까 말까 하다.',
  'V + (으)ㄹ까 하다',
  '[
    {"korean": "다음 학기에 중국어를 배울까 해요.", "vietnamese": "Tôi đang tính sẽ học tiếng Trung vào học kì tới."},
    {"korean": "주말에 낚시할까 말까 해요.", "vietnamese": "Tôi đang phân vân cuối tuần có nên đi câu cá hay không."},
    {"korean": "퇴근 후에 친구와 영화를 볼까 해요.", "vietnamese": "Tôi đang tính là sau khi tan làm đi xem phim với bạn."},
    {"korean": "내년에 대학을 졸업한 후에 유학을 갈까 해요.", "vietnamese": "Tôi đang nghĩ sang năm sau khi tốt nghiệp đại học sẽ đi du học."},
    {"korean": "신혼여행을 어디로 갈 거예요?", "vietnamese": "Anh sẽ đi tuần trăng mật ở đâu?"},
    {"korean": "아직 잘 모르겠지만 하와이로 갈까 해요.", "vietnamese": "Tôi vẫn chưa chắc chắn nhưng tôi đang tính đi Hawaii."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ까요?', 'V – (으)려고 하다', 'V – 기로 하다']::TEXT[],
  ARRAY['hesitation', 'uncertainty', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ까 하다' LIMIT 1),
  '다음 학기에 중국어를 배울까 해___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Đang tính → 배울까 해요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ까 하다' LIMIT 1),
  '주말에 낚시할까 말까 해___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Phân vân → 할까 말까 해요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ까 하다' LIMIT 1),
  '퇴근 후에 친구와 영화를 볼까 해___.',
  'multiple_choice',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Đang tính → 볼까 해요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ까 하다' LIMIT 1),
  '유학을 갈까 해___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Đang nghĩ → 갈까 해요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #51: A/V – (으)면 [nếu]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)면',
  '(eu)myeon',
  'nếu',
  'beginner',
  'condition',
  'Vĩ tố liên kết đưa ra điều kiện về sự việc, tình huống xảy ra hàng ngày hoặc hành động có tính lặp đi lặp lại, hoặc giả định một sự việc chưa xảy ra. Vì giả định tương lai nên chắc chắn vế sau sẽ không dùng thì quá khứ. Khi giả định, thường có các trạng từ 혹시, 만일, 만약(에) đi kèm.',
  'A/V + (으)면',
  '[
    {"korean": "저는 술을 마시면 얼굴이 빨개져요.", "vietnamese": "Nếu tôi uống rượu thì mặt sẽ bị đỏ."},
    {"korean": "수업이 일찍 끝나면 뭐 할 거예요?", "vietnamese": "Nếu tiết học kết thúc sớm thì bạn sẽ làm gì?"},
    {"korean": "돈을 많이 벌면 아파트를 살 거예요.", "vietnamese": "Nếu kiếm được nhiều tiền thì tôi sẽ mua một căn nhà."},
    {"korean": "지금 출발하면 3시에 도착할 수 있어요.", "vietnamese": "Nếu bây giờ xuất phát thì có thể đến nơi lúc 3 giờ."},
    {"korean": "아이스크림을 많이 먹으면 살이 쪄요.", "vietnamese": "Nếu ăn nhiều kem thì sẽ tăng cân."},
    {"korean": "날씨가 좋으면 등산해요. 하지만 눈이 오면 집에서 텔레비전을 봐요.", "vietnamese": "Nếu thời tiết đẹp thì tôi đi leo núi. Nhưng nếu tuyết rơi thì tôi ở nhà xem TV."}
  ]'::jsonb,
  ARRAY['V - (으)려면', 'A/V – 아/어도', 'A/V – (으)면 안 되다']::TEXT[],
  ARRAY['condition', 'if', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면' LIMIT 1),
  '술을 마시면 얼굴이 빨개___.',
  'fill_blank',
  '["져요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '져요.',
  'Nếu uống thì đỏ → 마시면 빨개져요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면' LIMIT 1),
  '수업이 일찍 끝나면 뭐 할 거___.',
  'fill_blank',
  '["예요?", "어요?", "습니까?", "습니까?"]'::jsonb,
  '예요?',
  'Nếu kết thúc → 끝나면 할 거예요?',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면' LIMIT 1),
  '돈을 많이 벌면 아파트를 살 거___.',
  'multiple_choice',
  '["예요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '예요.',
  'Nếu kiếm → 벌면 살 거예요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면' LIMIT 1),
  '아이스크림을 많이 먹으면 살이 쪄___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Nếu ăn → 먹으면 쪄요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #52: V - (으)려면 [nếu muốn..., nếu định...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V - (으)려면',
  '(eu)ryeonmyeon',
  'nếu muốn..., nếu định...',
  'beginner',
  'condition',
  'Là hình thức tỉnh lược của – (으)려고 하면. Diễn tả kế hoạch hoặc ý định ở mệnh đề trước và điều kiện để có thể đạt được kế hoạch đó ở mệnh đề sau. Mệnh đề sau thường ở các dạng – 아 / 어야 해요 / 돼요, –(으)면 돼요, –(으)세요, 이/가 필요해요, –는 게 좋아요.',
  'V + (으)려면',
  '[
    {"korean": "운전을 하려면 면허증이 있어야 해요.", "vietnamese": "Nếu muốn lái xe thì phải có bằng lái."},
    {"korean": "집을 구하려면 근처 부동산에 가 보세요.", "vietnamese": "Nếu muốn tìm nhà thì hãy thử đến chỗ bất động sản gần đây."},
    {"korean": "택시를 빨리 잡으려면 택시 승강장에 가야 돼요.", "vietnamese": "Nếu muốn bắt taxi nhanh chóng thì phải đến bãi xe taxi."},
    {"korean": "식사하시려면 예약을 하셔야 합니다.", "vietnamese": "Nếu quý khách muốn dùng bữa thì phải đặt chỗ trước ạ."},
    {"korean": "한국말을 잘하려면 어떻게 해야 돼요?", "vietnamese": "Nếu muốn giỏi tiếng Hàn thì phải làm thế nào?"},
    {"korean": "살을 빼려면 운동을 열심히 해야 해요.", "vietnamese": "Nếu muốn giảm cân thì phải tập thể dục chăm chỉ."},
    {"korean": "제 시간에 가려면 일찍 출발해야 해요.", "vietnamese": "Nếu muốn đến đúng giờ thì phải xuất phát sớm."},
    {"korean": "한국 음식을 먹으려면 한국 식당에 가야 돼요.", "vietnamese": "Nếu muốn ăn món Hàn thì phải đến nhà hàng Hàn Quốc."}
  ]'::jsonb,
  ARRAY['A/V – (으)면', 'V – (으)려고 하다', 'V – (으)면 안 되다']::TEXT[],
  ARRAY['condition', 'if want', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)려면' LIMIT 1),
  '운전을 하려면 면허증이 있어야 해___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Nếu muốn lái → 하려면 있어야 해요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)려면' LIMIT 1),
  '집을 구하려면 근처 부동산에 가 보세___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Nếu muốn tìm → 구하려면 가 보세요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)려면' LIMIT 1),
  '택시를 빨리 잡으려면 택시 승강장에 가야 돼___.',
  'multiple_choice',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Nếu muốn bắt → 잡으려면 가야 돼요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)려면' LIMIT 1),
  '살을 빼려면 운동을 열심히 해야 해___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Nếu muốn giảm → 빼려면 해야 해요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #53: A/V – 아/어도 [cho dù...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 아/어도',
  'a/eodo',
  'cho dù...',
  'beginner',
  'concession',
  'Vĩ tố liên kết thể hiện ý nghĩa nhượng bộ, diễn tả cho dù có thực hiện hành động nào ở mệnh đề trước thì mệnh đề sau vẫn xảy ra. Có thể thêm phó từ 아무리 để nhấn mạnh [dù có như thế nào đi chăng nữa]',
  'A/V + 아/어도',
  '[
    {"korean": "시간이 없어도 아침을 먹어야 돼요.", "vietnamese": "Cho dù không có thời gian nhưng vẫn phải ăn sáng."},
    {"korean": "란 씨는 아무리 먹어도 살이 안 찌지요? 부러워요.", "vietnamese": "Dù Lan có ăn thì cũng không tăng cân đúng không? Ghen tị thật đấy."},
    {"korean": "아무리 바빠도 아침을 먹어야지요.", "vietnamese": "Dù có bận như thế nào đi chăng nữa thì cũng phải ăn sáng chứ."},
    {"korean": "아무리 힘들어도 포기하지 마세요.", "vietnamese": "Dù có khó khăn như thế nào đi chăng nữa cũng không từ bỏ."},
    {"korean": "크게 말해도 할머니가 못 들어요.", "vietnamese": "Dù nói to nhưng bà vẫn không nghe được."},
    {"korean": "아무리 먹어도 계속 배가 고파요.", "vietnamese": "Dù có ăn như thế nào thì bụng vẫn cứ tiếp tục đói."}
  ]'::jsonb,
  ARRAY['A/V – (으)면', 'A/V – 아/어도 되다', 'A/V – (으)면 안 되다']::TEXT[],
  ARRAY['concession', 'even if', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어도' LIMIT 1),
  '시간이 없어도 아침을 먹어야 돼___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Cho dù không có → 없어도 먹어야 돼요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어도' LIMIT 1),
  '아무리 바빠도 아침을 먹어야지___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Dù bận → 바빠도 먹어야지요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어도' LIMIT 1),
  '아무리 힘들어도 포기하지 마세___.',
  'multiple_choice',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Dù khó khăn → 힘들어도 포기하지 마세요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어도' LIMIT 1),
  '크게 말해도 할머니가 못 들___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Dù nói to → 말해도 못 들어요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #54: A – 아/어지다 [trở nên...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A – 아/어지다',
  'a/eojida',
  'trở nên...',
  'beginner',
  'change',
  'Biểu hiện thể hiện sự biến đổi của trạng thái theo thời gian. A sẽ thành V khi kết hợp với cấu trúc này.',
  'A + 아/어지다',
  '[
    {"korean": "아이스크림을 많이 먹으면 뚱뚱해질 거예요.", "vietnamese": "Nếu ăn nhiều kem thì sẽ trở nên béo."},
    {"korean": "날씨가 좋아졌어요.", "vietnamese": "Thời tiết đã trở nên đẹp hơn."},
    {"korean": "한국 생활에 점점 익숙해졌어요.", "vietnamese": "Tôi đã trở nên quen với cuộc sống ở Hàn Quốc."},
    {"korean": "요즘 날씨가 따뜻해졌어요.", "vietnamese": "Dạo này trời ấm lên."},
    {"korean": "대학교 수업은 내년에 어려워질 거예요.", "vietnamese": "Năm sau bài học ở trường đại học sẽ trở nên khó hơn."},
    {"korean": "연습을 많이 하니까 발음이 점점 좋아졌어요.", "vietnamese": "Vì tôi tập luyện nhiều nên phát âm của tôi đang dần dần tốt lên."},
    {"korean": "지금 건강이 많이 나아졌어요.", "vietnamese": "Bây giờ thì sức khỏe đã tốt lên rất nhiều."}
  ]'::jsonb,
  ARRAY['A/V – 게 되다', 'A/V – 았/었-', 'A/V – 지 않다']::TEXT[],
  ARRAY['change', 'become', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A – 아/어지다' LIMIT 1),
  '날씨가 좋아졌___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Đã trở nên → 좋아졌어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A – 아/어지다' LIMIT 1),
  '한국 생활에 점점 익숙해졌___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Đã trở nên → 익숙해졌어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A – 아/어지다' LIMIT 1),
  '요즘 날씨가 따뜻해졌___.',
  'multiple_choice',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Đã ấm lên → 따뜻해졌어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A – 아/어지다' LIMIT 1),
  '건강이 많이 나아졌___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Đã tốt lên → 나아졌어요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #55: A/V – 게 되다 [làm được gì đó, được làm gì đó]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 게 되다',
  'ge doeda',
  'làm được gì đó, được làm gì đó',
  'beginner',
  'change',
  '1. Thể hiện sự thay đổi trạng thái của tình huống nào đó do hoàn cảnh khách quan [làm được gì đó]. 2. Dạng thụ động: một tình huống đã trở thành sự thật hoặc được quyết định thực hiện [được làm gì đó]',
  'A/V + 게 되다',
  '[
    {"korean": "회사에 다닌 후부터 일찍 일어나게 됐어요.", "vietnamese": "Từ sau khi đi làm tôi đã dậy sớm được rồi."},
    {"korean": "한국에 오기 전에 방탄소년단을 몰랐는데 한국에 와서 알게 됐어요.", "vietnamese": "Trước khi đến Hàn tôi không biết BTS nhưng sau khi đến Hàn thì tôi đã biết được."},
    {"korean": "친구들과 노래방에 가서 연습하니까 노래를 잘하게 되었어요.", "vietnamese": "Tôi đến phòng hát và luyện tập cùng các bạn nên tôi đã hát được tốt hơn."},
    {"korean": "전에는 매운 음식을 못 먹었는데 한국에서 생활한 후 잘 먹게 되었어요.", "vietnamese": "Trước đây tôi không ăn được cay nhưng sau khi sống ở HQ tôi ăn được cay tốt."},
    {"korean": "뭐든지 열심히 연습하면 잘하게 될 거예요.", "vietnamese": "Bất cứ cái gì nếu luyện tập chăm chỉ thì sẽ đều giỏi được."},
    {"korean": "열심히 공부해서 장학금을 받게 되었어요.", "vietnamese": "Vì học chăm chỉ nên tôi đã được nhận học bổng."},
    {"korean": "모임에 가면 학과 선배들과 인사를 나누게 돼요.", "vietnamese": "Nếu đi đến buổi gặp mặt sẽ được chào hỏi các tiền bối."},
    {"korean": "갑자기 급한 일이 생겨서 저는 못 가게 될 거예요.", "vietnamese": "Vì đột nhiên có việc gấp nên tới chắc là không đi được."},
    {"korean": "다음 달에 한국에 가게 됐어요.", "vietnamese": "Tháng sau mình sẽ được đi Hàn Quốc."}
  ]'::jsonb,
  ARRAY['A – 아/어지다', 'A/V – 았/었-', 'V – (으)ㄹ 수 있다/없다']::TEXT[],
  ARRAY['change', 'passive', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 게 되다' LIMIT 1),
  '회사에 다닌 후부터 일찍 일어나게 됐___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Đã dậy được → 일어나게 됐어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 게 되다' LIMIT 1),
  '한국에 와서 알게 됬___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Đã biết được → 알게 됐어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 게 되다' LIMIT 1),
  '노래를 잘하게 되었___.',
  'multiple_choice',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Đã hát được → 잘하게 되었어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 게 되다' LIMIT 1),
  '장학금을 받게 되었___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Đã nhận → 받게 되었어요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #56: A/V – 겠어요 [sẽ..., chắc sẽ...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 겠어요',
  'gesseoyo',
  'sẽ..., chắc sẽ...',
  'beginner',
  'prediction',
  'Thể hiện sự dự đoán, phỏng đoán về tình huống, trạng thái nào đó. Thường dùng khi mô tả ý chí quyết tâm làm gì đó nếu dùng với động từ. Hình thức phỏng đoán quá khứ: - 았/었 + 겠어요 => - 았/었겠어요',
  'A/V + 겠어요',
  '[
    {"korean": "그래요? 많이 피곤하겠어요.", "vietnamese": "Vậy sao? Chắc bạn mệt lắm nhỉ?"},
    {"korean": "오늘은 일이 있어서 못 가겠습니다.", "vietnamese": "Hôm nay vì có việc bận nên tôi sẽ không đến được."},
    {"korean": "어제 많이 피곤했겠네요.", "vietnamese": "Hôm qua chắc bạn mệt lắm nhỉ."},
    {"korean": "아침마다 운동하겠어요.", "vietnamese": "Tôi sẽ tập thể dục vào mỗi buổi sáng."},
    {"korean": "이제 술을 마시지 않겠어요.", "vietnamese": "Bây giờ tôi sẽ không uống rượu nữa."},
    {"korean": "올해에는 담배를 꼭 끊겠습니다.", "vietnamese": "Năm nay nhất định tôi sẽ bỏ thuốc."},
    {"korean": "그럼 한국말을 잘하겠어요.", "vietnamese": "Vậy thì chắc bạn giỏi tiếng Hàn lắm nhỉ."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 거예요', 'A/V – (으)ㄹ 것 같다', 'A/V – (으)ㄹ 텐데']::TEXT[],
  ARRAY['prediction', 'determination', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 겠어요' LIMIT 1),
  '많이 피곤하겠___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Chắc mệt → 피곤하겠어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 겠어요' LIMIT 1),
  '오늘은 일이 있어서 못 가겠___.',
  'fill_blank',
  '["습니다.", "어요.", "습니다.", "습니다."]'::jsonb,
  '습니다.',
  'Sẽ không đến → 못 가겠습니다.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 겠어요' LIMIT 1),
  '아침마다 운동하겠___.',
  'multiple_choice',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Sẽ tập thể dục → 운동하겠어요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 겠어요' LIMIT 1),
  '이제 술을 마시지 않겠___.',
  'fill_blank',
  '["어요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '어요.',
  'Sẽ không uống → 마시지 않겠어요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #57: A/V – (으)ㄹ 거예요 [sẽ...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ 거예요',
  '(eu)l geoyeyo',
  'sẽ...',
  'beginner',
  'future',
  'Sử dụng khi phỏng đoán trạng thái hay hành động nào đó. Chủ ngữ là ngôi thứ 3. Nếu chủ ngữ ngôi số 1 hoặc 2 là thì diễn tả kế hoạch, ý chí nào đó sẽ được thực hiện trong tương lai. So với –겠- thì mức độ quyết tâm không mạnh mẽ bằng. Dạng trang trọng là (으)ㄹ 겁니다. Hình thức phỏng đoán quá khứ: - 았/었 + (으)ㄹ 거예요',
  'A/V + (으)ㄹ 거예요',
  '[
    {"korean": "내일도 추울 거예요.", "vietnamese": "Ngày mai chắc trời sẽ lạnh."},
    {"korean": "유리 씨가 지금 집에서 음악을 들을 거예요.", "vietnamese": "Yuri bây giờ chắc đang ở nhà nghe nhạc."},
    {"korean": "흐엉 씨는 내일 학교에 올 거예요?", "vietnamese": "Hương ngày mai chắc sẽ đến trường nhỉ?"},
    {"korean": "이번 주말에 친구들과 등산할 거예요.", "vietnamese": "Cuối tuần này tôi sẽ đi leo núi với bạn."},
    {"korean": "오늘 점심에 어디에서 먹을 거예요?", "vietnamese": "Trưa nay chúng ta sẽ ăn ở đâu?"},
    {"korean": "저는 주말에 학교 도서관에서 공부할 거예요.", "vietnamese": "Cuối tuần tôi sẽ học ở thư viện trường học."},
    {"korean": "내일 뭐 거예요? 친구들이랑 캠핑할 거예요.", "vietnamese": "Ngày mai bạn sẽ làm gì? Mình sẽ cắm trại cùng mấy người bạn nè."},
    {"korean": "오늘 정부는 교통 체증 문제에 대해 의논할 겁니다.", "vietnamese": "Hôm nay Chính phủ sẽ bàn bạc về vấn đề ùn tắc giao thông."}
  ]'::jsonb,
  ARRAY['A/V – 겠어요', 'A/V – (으)ㄹ 것 같다', 'A/V – (으)ㄹ 텐데']::TEXT[],
  ARRAY['future', 'prediction', 'plan', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 거예요' LIMIT 1),
  '내일도 추울 거___.',
  'fill_blank',
  '["예요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '예요.',
  'Chắc lạnh → 추울 거예요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 거예요' LIMIT 1),
  '흐엉 씨는 내일 학교에 올 거___.',
  'fill_blank',
  '["예요?", "어요?", "습니까?", "습니까?"]'::jsonb,
  '예요?',
  'Chắc đến → 올 거예요?',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 거예요' LIMIT 1),
  '이번 주말에 친구들과 등산할 거___.',
  'multiple_choice',
  '["예요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '예요.',
  'Sẽ đi → 등산할 거예요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 거예요' LIMIT 1),
  '오늘 점심에 어디에서 먹을 거___.',
  'fill_blank',
  '["예요?", "어요?", "습니까?", "습니까?"]'::jsonb,
  '예요?',
  'Sẽ ăn → 먹을 거예요?',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #58: A/V – (으)ㄴ/는/(으)ㄹ 것 같다 [hình như..., dường như...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ/는/(으)ㄹ 것 같다',
  '(eu)n/neun/(eu)l geot gata',
  'hình như..., dường như...',
  'beginner',
  'conjecture',
  'Vĩ tố kết thúc: Chỉ sự phỏng đoán của người nói. Thì thể của cấu trúc này phụ thuộc vào điều gì đó đã xảy ra trong quá khứ, đang xảy ra ở hiện tại, hoặc sẽ xảy ra trong tương lai. Còn được dùng để diễn tả quan điểm, suy nghĩ của người nói một cách tế nhị. Động từ có 3 thì quá khứ, hiện tại, tương lai ứng với (으)ㄴ/는/(으)ㄹ còn với tính từ dùng với (으)ㄴ hoặc nếu trạng thái mơ hồ thì dùng (으)ㄹ.',
  'V(qua khứ) + (으)ㄴ 것 같다 / V(hiện tại) + 는 것 같다 / V(tương lai) + (으)ㄹ 것 같다',
  '[
    {"korean": "비가 그친 것 같아요.", "vietnamese": "Hình như trời tạnh mưa rồi."},
    {"korean": "비가 올 것 같아요.", "vietnamese": "Hình như trời sẽ mưa."},
    {"korean": "아기가 지금 자는 거 같아요.", "vietnamese": "Chắc có lẽ bây giờ đứa bé đang ngủ."},
    {"korean": "그 책이 어려운 것 같아요.", "vietnamese": "Chắc quyển sách đó khó."},
    {"korean": "그 가방은 비싼/비쌀 것 같아요.", "vietnamese": "Chắc cái túi xách đó đắt lắm."},
    {"korean": "민수 씨가 감기에 걸려서 집에서 쉬는 것 같아요.", "vietnamese": "Minsu bị cảm nên chắc là đang nghỉ ở nhà."},
    {"korean": "배가 불러서 더 못 먹을 것 같아요.", "vietnamese": "Tôi no quá rồi nên chắc là sẽ không ăn thêm được nữa."},
    {"korean": "집에 아무도 없는 것 같아요.", "vietnamese": "Trong nhà hình như không có ai."}
  ]'::jsonb,
  ARRAY['A/V – 겠어요', 'A/V – (으)ㄹ 거예요', 'A – 아/어 보이다']::TEXT[],
  ARRAY['conjecture', 'opinion', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는/(으)ㄹ 것 같다' LIMIT 1),
  '비가 그친 것 같___.',
  'fill_blank',
  '["아요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '아요.',
  'Hình như tạnh → 그친 것 같아요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는/(으)ㄹ 것 같다' LIMIT 1),
  '비가 올 것 같___.',
  'fill_blank',
  '["아요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '아요.',
  'Hình như mưa → 올 것 같아요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는/(으)ㄹ 것 같다' LIMIT 1),
  '아기가 지금 자는 거 같___.',
  'multiple_choice',
  '["아요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '아요.',
  'Chắc đang ngủ → 자는 거 같아요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는/(으)ㄹ 것 같다' LIMIT 1),
  '그 책이 어려운 것 같___.',
  'fill_blank',
  '["아요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '아요.',
  'Chắc khó → 어려운 것 같아요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #59: A - 아/어 보이다 [trông/nhìn có vẻ...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A - 아/어 보이다',
  'a/eo boida',
  'trông/nhìn có vẻ...',
  'beginner',
  'appearance',
  'Vĩ tố kết thúc: Diễn tả sự phỏng đoán hoặc cảm nhận của bạn dựa trên vẻ ngoài của con người, sự vật, sự việc.',
  'A + 아/어 보이다',
  '[
    {"korean": "지금 괜찮으세요? 슬퍼 보여요.", "vietnamese": "Bạn không sao chứ? Trông bạn có vẻ buồn."},
    {"korean": "이 치마를 입으니까 젊어 보여요.", "vietnamese": "Bạn mặc váy này trông có vẻ trẻ."},
    {"korean": "김치가 매워 보이네요.", "vietnamese": "Kimchi nhìn có vẻ cay."},
    {"korean": "이 케이크가 맛있어 보여서 샀는데, 너무 달아요.", "vietnamese": "Chiếc bánh này trông có vẻ ngon nên tôi đã mua nhưng nó ngọt quá."},
    {"korean": "마크 씨, 얼굴이 피곤해 보여요. 무슨 일 있어요?", "vietnamese": "Mark à, trông bạn có vẻ mệt. Có chuyện gì thế?"},
    {"korean": "가방이 무거워 보이는데 들어 드릴까요?", "vietnamese": "Trông túi xách cô có vẻ nặng, để tôi xách giúp nhé?"}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는/(으)ㄹ 것 같다', 'A – 아/어지다', 'A/V – 게 되다']::TEXT[],
  ARRAY['appearance', 'conjecture', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A - 아/어 보이다' LIMIT 1),
  '슬퍼 보___.',
  'fill_blank',
  '["여요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '여요.',
  'Trông buồn → 슬퍼 보여요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A - 아/어 보이다' LIMIT 1),
  '젊어 보___.',
  'fill_blank',
  '["여요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '여요.',
  'Trông trẻ → 젊어 보여요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A - 아/어 보이다' LIMIT 1),
  '매워 보___.',
  'multiple_choice',
  '["여요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '여요.',
  'Trông cay → 매워 보이네요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A - 아/어 보이다' LIMIT 1),
  '맛있어 보___.',
  'fill_blank',
  '["여요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '여요.',
  'Trông ngon → 맛있어 보여서.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #60: A/V - (으)ㄹ 텐데 [chắc sẽ... nên, sẽ ...đấy, nên...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V - (으)ㄹ 텐데',
  '(eu)l tende',
  'chắc sẽ... nên, sẽ ...đấy, nên...',
  'beginner',
  'conjecture',
  'Là cấu trúc (으)ㄹ 터 + (으)ㄴ/는 데 dùng để đưa ra nhận định, phỏng đoán ở vế trước và đưa ra bối cảnh ở vế sau. Mệnh đề trước diễn tả ý định, phỏng đoán, mệnh đề sau có thể liên quan hoặc tương phản mệnh đề trước. Vế sau thường dùng với mệnh đề lệnh, cầu khiến. Phỏng đoán quá khứ: 았/었 + (으)ㄹ 텐데. Có thể sử dụng ở cuối câu => - (으)ㄹ 텐데요.',
  'A/V + (으)ㄹ 텐데',
  '[
    {"korean": "아기가 깨면 엄마를 찾을 텐데 큰일이에요.", "vietnamese": "Nếu đứa bé tỉnh dậy chắc tìm mẹ, lớn chuyện đó."},
    {"korean": "영화가 지금 끝나서 사람이 많을 텐데 다른 쪽에 있는 화장실에 가요.", "vietnamese": "Bây giờ bộ phim kết thúc nên chắc sẽ có nhiều người lắm, vì vậy chúng tôi đi nhà vệ sinh ở hướng khác."},
    {"korean": "그 식당이 이미 닫았을 텐데 가지 마세요.", "vietnamese": "Chắc nhà hàng đó đã đóng cửa rồi nên đừng đi."},
    {"korean": "바람이 불면 추울 텐데 따뜻하게 입고 가세요.", "vietnamese": "Gió thổi nhiều nên chắc sẽ lạnh, bạn hãy mặc ấm vào nhé."},
    {"korean": "배가 고플 텐데 이것 좀 드세요.", "vietnamese": "Chắc là anh đói lắm, anh ăn cái này một chút đi."},
    {"korean": "인선 씨가 서울에 도착했을 텐데 이따가 연락해 볼까요?", "vietnamese": "Chắc là anh Inseon đã đến Hàn Quốc rồi, chút nữa tôi thử liên lạc xem sao nhé?"},
    {"korean": "어제 야근하느라고 많이 피곤했을 텐데 오늘은 일찍 들어가세요.", "vietnamese": "Hôm qua làm ca đêm nên chắc anh mệt rồi, hôm nay anh về nhà sớm đi."},
    {"korean": "차가 많이 막힐 텐데 좀 일찍 출발하는 게 어때요?", "vietnamese": "Chắc là sẽ tắc đường vậy nên xuất phát sớm chút nhé?"}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 테니까', 'A/V – (으)ㄹ 거예요', 'A/V – (으)ㄹ 것 같다']::TEXT[],
  ARRAY['conjecture', 'context', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄹ 텐데' LIMIT 1),
  '사람이 많을 텐데 다른 쪽에 있는 화장실에 가___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Chắc đông → 많을 텐데 가요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄹ 텐데' LIMIT 1),
  '그 식당이 이미 닫았을 텐데 가지 마세___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Chắc đóng → 닫았을 텐데 마세요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄹ 텐데' LIMIT 1),
  '바람이 불면 추울 텐데 따뜻하게 입고 가세___.',
  'multiple_choice',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Chắc lạnh → 추울 텐데 가세요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄹ 텐데' LIMIT 1),
  '배가 고플 텐데 이것 좀 드세___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Chắc đói → 고플 텐데 드세요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #61: A/V – (으)ㄹ 테니까 [vì tôi sẽ... nên, chắc là sẽ... nên]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ 테니까',
  '(eu)l tenikka',
  'vì tôi sẽ... nên, chắc là sẽ... nên',
  'beginner',
  'reason',
  '(1) Chủ ngữ vế đầu tiên ngôi số 1: diễn tả ý chí vì TÔI sẽ làm gì đó nên... Mệnh đề sau thường là lời gợi ý hoặc lời khuyên dành cho người nghe. (2) Chủ ngữ vế đầu tiên ngôi số 3: diễn tả sự phỏng đoán và đưa ra lời khuyên, cầu khiến, ý chí. Không dùng 걱정이다, 고맙다, 감사하다, 미안하다 sau – (으)ㄹ 테니까. Trong khi (으)ㄹ 텐데 nhấn mạnh bối cảnh thì (으)ㄹ 테니까 thiên về giải thích lí do.',
  'A/V + (으)ㄹ 테니까',
  '[
    {"korean": "시험 기간이라서 사람이 많을 테니까 아침 일찍 갑시다.", "vietnamese": "Vì đang là giai đoạn thi nên chắc sẽ đông, buổi sáng đến sớm chút nhé."},
    {"korean": "제가 도와 줄 테니까 너무 걱정하지 마세요.", "vietnamese": "Tôi sẽ giúp nên đừng lo lắng quá nhé."},
    {"korean": "밖에 추울 테니까 나가지 마세요.", "vietnamese": "Bên ngoài trời lạnh nên đừng ra ngoài."},
    {"korean": "요즘 귤 철이라 귤이 싸고 맛있을 테니까 귤을 사 가요.", "vietnamese": "Dạo này đang là mùa quýt nên quýt sẽ rẻ và ngon, vì vậy tôi đi mua quýt."},
    {"korean": "제가 청소를 할 테니까 설거지를 하세요.", "vietnamese": "Tôi sẽ dọn dẹp vì thế bạn rửa bát đĩa nhé."},
    {"korean": "이건 제가 할 테니까 걱정하지 말고 쉬세요.", "vietnamese": "Tôi sẽ làm việc này vì vậy đừng lo lắng và nghỉ ngơi đi."},
    {"korean": "퇴근 시간이라 길이 막힐 테니까 지하철을 타.", "vietnamese": "Đang giờ tan tầm nên là đường tắc đấy đi tàu điện ngầm đi nhé."},
    {"korean": "밖에 햇빛이 강할 테니까 양산을 챙겨 나가세요.", "vietnamese": "Bên ngoài vì chắc là nắng to nên chuẩn bị ô che nắng mang đi nhé."}
  ]'::jsonb,
  ARRAY['A/V - (으)ㄹ 텐데', 'A/V – (으)ㄹ 거예요', 'A/V – (으)ㄹ 것 같다']::TEXT[],
  ARRAY['reason', 'will', 'conjecture', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 테니까' LIMIT 1),
  '사람이 많을 테니까 아침 일찍 갑___.',
  'fill_blank',
  '["시다.", "어요.", "습니다.", "습니다."]'::jsonb,
  '시다.',
  'Chắc đông → 많을 테니까 갑시다.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 테니까' LIMIT 1),
  '제가 도와 줄 테니까 너무 걱정하지 마세___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Tôi sẽ giúp → 도와 줄 테니까 마세요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 테니까' LIMIT 1),
  '밖에 추울 테니까 나가지 마세___.',
  'multiple_choice',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Trời lạnh → 추울 테니까 마세요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 테니까' LIMIT 1),
  '제가 청소를 할 테니까 설거지를 하세___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Tôi sẽ dọn → 할 테니까 하세요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #62: A – 군요, V – 는군요 [....thế!, ...đấy!]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A – 군요, V – 는군요',
  'gunyo/neungunyo',
  '....thế!, ...đấy!',
  'beginner',
  'realization',
  'Vĩ tố kết thúc: Diễn tả sự ngạc nhiên hoặc thắc mắc khi người nói trực tiếp chứng kiến, trải nghiệm hoặc nghe thấy từ ai đó. Có thể kết hợp với danh từ: N +(이)군요. Hình thức quá khứ: – 았/었군요',
  'A + 군요 / V + 는군요 / N + (이)군요',
  '[
    {"korean": "유리 씨는 영어를 정말 잘하시는군요.", "vietnamese": "Yuri giỏi tiếng Anh thật đấy!"},
    {"korean": "영호 씨는 정말 머리가 좋군요.", "vietnamese": "Young–ho tóc đẹp thật đấy!"},
    {"korean": "감기에 걸렸군요.", "vietnamese": "Bạn bị cảm cúm rồi đấy!"},
    {"korean": "어렸을 때 정말 귀여웠군요.", "vietnamese": "Ôi, hồi nhỏ cậu đáng yêu thế!"},
    {"korean": "정말 비가 오는군요. 우산이 없는데 어떻게 하죠?", "vietnamese": "Ra là trời đang mưa. Tôi không có ô, phải làm sao đây?"}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ까요?', 'A/V – (으)ㄹ 것 같다', 'A/V – 겠어요']::TEXT[],
  ARRAY['realization', 'surprise', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A – 군요, V – 는군요' LIMIT 1),
  '유리 씨는 영어를 정말 잘하시는군___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Giỏi thật → 잘하시는군요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A – 군요, V – 는군요' LIMIT 1),
  '영호 씨는 정말 머리가 좋군___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Đẹp thật → 머리가 좋군요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A – 군요, V – 는군요' LIMIT 1),
  '감기에 걸렸군___.',
  'multiple_choice',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Bị cảm rồi → 걸렸군요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A – 군요, V – 는군요' LIMIT 1),
  '정말 비가 오는군___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Mưa thật → 오는군요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #63: V-ㄴ/은 적이 있다/없다 [Đã từng / Chưa từng]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V-ㄴ/은 적이 있다/없다',
  'n/eun jeogi itda/eopda',
  'Đã từng / Chưa từng',
  'intermediate',
  'experience',
  'Diễn tả kinh nghiệm đã có hoặc chưa có trong quá khứ. Tương đương với ''have/haven''t done'' trong tiếng Anh.',
  'V(nguyên âm/ㄹ) + ㄴ 적이 있다 / V(phụ âm) + 은 적이 있다',
  '[
    {"korean": "한국에 가 본 적이 있어요.", "vietnamese": "Tôi đã từng đến Hàn Quốc."},
    {"korean": "김치를 먹은 적이 없어요.", "vietnamese": "Tôi chưa từng ăn kimchi."},
    {"korean": "스키를 탄 적이 있어요?", "vietnamese": "Bạn đã từng trượt tuyết chưa?"}
  ]'::jsonb,
  ARRAY['V – 아/어 보다', 'V – 았/었어요']::TEXT[],
  ARRAY['experience', 'past', 'b1', 'topik2']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V-ㄴ/은 적이 있다/없다' LIMIT 1),
  '한국 음식을 먹 ___ 적이 있어요.',
  'fill_blank',
  '["은", "ㄴ", "는", "던"]'::jsonb,
  '은',
  '먹다 kết thúc bằng phụ âm ㄱ, nên dùng 은',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V-ㄴ/은 적이 있다/없다' LIMIT 1),
  '서울에 가 ___ 적이 없어요.',
  'fill_blank',
  '["은", "ㄴ", "는", "던"]'::jsonb,
  'ㄴ',
  '가다 kết thúc bằng nguyên âm, nên dùng ㄴ → 간 적이',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #64: V-는 것 같다 [Có vẻ như, Dường như]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V-는 것 같다',
  'neun geot gata',
  'Có vẻ như, Dường như',
  'intermediate',
  'conjecture',
  'Diễn tả suy đoán, phỏng đoán dựa trên quan sát. Thì hiện tại dùng -는 것 같다, quá khứ dùng -ㄴ/은 것 같다, tương lai dùng -ㄹ/을 것 같다.',
  'V + 는 것 같다 (hiện tại) / V + ㄴ/은 것 같다 (quá khứ) / V + ㄹ/을 것 같다 (tương lai)',
  '[
    {"korean": "비가 오는 것 같아요.", "vietnamese": "Có vẻ như trời đang mưa."},
    {"korean": "그 사람이 화가 난 것 같아요.", "vietnamese": "Có vẻ như người đó đang tức giận."},
    {"korean": "어제 비가 온 것 같아요.", "vietnamese": "Có vẻ như hôm qua trời đã mưa."},
    {"korean": "내일 비가 올 것 같아요.", "vietnamese": "Có vẻ như ngày mai trời sẽ mưa."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는/(으)ㄹ 것 같다', 'A – 아/어 보이다']::TEXT[],
  ARRAY['conjecture', 'observation', 'b1', 'topik2']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V-는 것 같다' LIMIT 1),
  '비가 오 ___ 것 같아요.',
  'fill_blank',
  '["는", "ㄴ", "은", "던"]'::jsonb,
  '는',
  'Hiện tại đang mưa → 오는 것 같아요',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V-는 것 같다' LIMIT 1),
  '어제 비가 온 ___ 같아요.',
  'fill_blank',
  '["는", "ㄴ", "은", "던"]'::jsonb,
  'ㄴ',
  'Quá khứ đã mưa → 온 것 같아요',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #65: N은/는 [Trợ từ chủ đề]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N은/는',
  'eun/neun',
  'Trợ từ chủ đề',
  'beginner',
  'particle',
  '은/는 là trợ từ chủ đề, dùng để đánh dấu chủ đề của câu. Dùng 은 sau phụ âm, 는 sau nguyên âm.',
  'N(phụ âm) + 은 / N(nguyên âm) + 는',
  '[
    {"korean": "저는 학생이에요.", "vietnamese": "Tôi là học sinh."},
    {"korean": "한국은 아름다워요.", "vietnamese": "Hàn Quốc thật đẹp."},
    {"korean": "오늘은 날씨가 좋아요.", "vietnamese": "Hôm nay thời tiết đẹp."}
  ]'::jsonb,
  ARRAY['N이/가']::TEXT[],
  ARRAY['particle', 'basic', 'topic', 'a1', 'topik1']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N은/는' LIMIT 1),
  '저 ___ 베트남 사람이에요.',
  'fill_blank',
  '["은", "는", "이", "가"]'::jsonb,
  '는',
  '저 kết thúc bằng nguyên âm eo, nên dùng 는',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N은/는' LIMIT 1),
  '한국어 ___ 재미있어요.',
  'fill_blank',
  '["은", "는", "이", "가"]'::jsonb,
  '은',
  '한국어 kết thúc bằng phụ âm, nên dùng 은',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #66: N이/가 [Trợ từ chủ ngữ]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N이/가',
  'i/ga',
  'Trợ từ chủ ngữ',
  'beginner',
  'particle',
  '이/가 là trợ từ chủ ngữ, dùng để đánh dấu chủ ngữ thực sự của câu. Dùng 이 sau phụ âm, 가 sau nguyên âm.',
  'N(phụ âm) + 이 / N(nguyên âm) + 가',
  '[
    {"korean": "꽃이 예뻐요.", "vietnamese": "Hoa đẹp."},
    {"korean": "누가 왔어요?", "vietnamese": "Ai đến vậy?"},
    {"korean": "비가 와요.", "vietnamese": "Trời mưa."}
  ]'::jsonb,
  ARRAY['N은/는']::TEXT[],
  ARRAY['particle', 'basic', 'subject', 'a1', 'topik1']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N이/가' LIMIT 1),
  '꽃 ___ 예뻐요.',
  'fill_blank',
  '["은", "는", "이", "가"]'::jsonb,
  '이',
  '꽃 kết thúc bằng phụ âm, nên dùng 이',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N이/가' LIMIT 1),
  '누구 ___ 왔어요?',
  'fill_blank',
  '["은", "는", "이", "가"]'::jsonb,
  '가',
  '누구 kết thúc bằng nguyên âm, nên dùng 가',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #67: V-ㄹ/을수록 [Càng... càng...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V-ㄹ/을수록',
  'l/eulsurok',
  'Càng... càng...',
  'advanced',
  'proportional',
  'Diễn tả mối quan hệ tỷ lệ thuận: khi A tăng thì B cũng tăng. Thường đi kèm với 더 (hơn) hoặc 더욱 (càng hơn).',
  'V/A + ㄹ/을수록 + (더) V/A',
  '[
    {"korean": "공부할수록 더 재미있어요.", "vietnamese": "Càng học càng thấy thú vị."},
    {"korean": "알면 알수록 어려워요.", "vietnamese": "Càng biết càng thấy khó."},
    {"korean": "시간이 지날수록 그리워져요.", "vietnamese": "Thời gian càng trôi qua càng nhớ."}
  ]'::jsonb,
  ARRAY['V-면', 'A-아/어질수록']::TEXT[],
  ARRAY['proportional', 'comparison', 'b2', 'topik2']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V-ㄹ/을수록' LIMIT 1),
  '연습하 ___ 실력이 늘어요.',
  'fill_blank',
  '["ㄹ수록", "을수록", "면", "아서"]'::jsonb,
  'ㄹ수록',
  '연습하다 kết thúc bằng nguyên âm, dùng ㄹ수록',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V-ㄹ/을수록' LIMIT 1),
  '먹 ___ 더 먹고 싶어요.',
  'fill_blank',
  '["ㄹ수록", "을수록", "면", "아서"]'::jsonb,
  '을수록',
  '먹다 kết thúc bằng phụ âm ㄱ, dùng 을수록',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #68: V-는 한 [Chừng nào còn..., Miễn là...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V-는 한',
  'neun han',
  'Chừng nào còn..., Miễn là...',
  'advanced',
  'condition',
  'Diễn tả điều kiện duy trì: chừng nào điều kiện A còn tồn tại thì kết quả B vẫn đúng. Mang tính trang trọng, thường dùng trong văn viết.',
  'V + 는 한 / A + ㄴ/은 한 / N인 한',
  '[
    {"korean": "내가 살아있는 한 너를 지킬게.", "vietnamese": "Chừng nào tôi còn sống, tôi sẽ bảo vệ em."},
    {"korean": "노력하는 한 반드시 성공할 수 있다.", "vietnamese": "Chừng nào còn nỗ lực, nhất định sẽ thành công."},
    {"korean": "법을 어기지 않는 한 자유롭게 행동할 수 있다.", "vietnamese": "Miễn là không vi phạm pháp luật, bạn có thể hành động tự do."}
  ]'::jsonb,
  ARRAY['V-는 이상', 'V-는 동안']::TEXT[],
  ARRAY['condition', 'formal', 'c1', 'topik3']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V-는 한' LIMIT 1),
  '포기하지 않 ___ 한 희망이 있어요.',
  'fill_blank',
  '["는", "은", "ㄴ", "던"]'::jsonb,
  '는',
  '포기하지 않다 là động từ phủ định, dùng -는 한',
  'hard'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V-는 한' LIMIT 1),
  '건강 ___ 한 모든 것이 가능해요.',
  'fill_blank',
  '["인", "는", "은", "이"]'::jsonb,
  '인',
  '건강 là danh từ, dùng 인 한',
  'hard'
);
