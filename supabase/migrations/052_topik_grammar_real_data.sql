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
