-- Migration 054: Insert TOPIK grammar patterns #69-71 (Intermediate level)
-- Ngữ pháp TOPIK #69-71 (Trung cấp)

-- ═══════════════════════════════════════════════════════════════════════════════
-- #69: V – 느라(고) [vì mải làm gì đó nên...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 느라(고)',
  'neura(go)',
  'vì mải làm gì đó nên...',
  'intermediate',
  'cause',
  'Vĩ tố liên kết thể hiện mệnh đề trước là nguyên nhân, lý do gây kết quả tiêu cực ở mệnh đề sau. Nếu dùng kết quả tích cực ở mệnh đề sau câu sẽ thiếu tự nhiên. Vế sau chủ yếu chia ở thời quá khứ. Chỉ những động từ yêu cầu thời gian, sức lực, ý chí của chủ thể hành động mới được đứng trước – 느라고.',
  'V + 느라고',
  '[
    {"korean": "열심히 공부하느라고 고생했어요.", "vietnamese": "Vì mải học hành nên đã rất vất vả."},
    {"korean": "일을 하느라고 점심을 못 먹었어요.", "vietnamese": "Vì mải làm việc mà tôi đã không thể ăn trưa."},
    {"korean": "텔레비전을 보느라고 숙제를 못 했어요.", "vietnamese": "Vì mải xem tivi mà tôi đã không thể làm bài tập."},
    {"korean": "어제 책을 읽느라고 밤을 세웠어요.", "vietnamese": "Vì mải đọc sách mà hôm qua tôi đã thức cả đêm."},
    {"korean": "피곤해서 자느라 전화 소리도 못 들었어요.", "vietnamese": "Xin lỗi, vì mệt nên mình ngủ say quá không nghe thấy chuông điện thoại."},
    {"korean": "아르바이트를 하느라 바빠요.", "vietnamese": "Vì đi làm thêm nên tớ bận rộn."}
  ]'::jsonb,
  ARRAY['V – 고 나서', 'V – 느냐고']::TEXT[],
  ARRAY['cause', 'negative result', 'past', 'b1', 'topik2']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 느라(고)' LIMIT 1),
  '공부하느라고 고생했___.',
  'fill_blank',
  '["어요.", "습니다.", "했어요.", "했어."]'::jsonb,
  '어요.',
  'Quá khứ → 고생했어요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 느라(고)' LIMIT 1),
  '일을 하느라고 점심을 못 먹었___.',
  'fill_blank',
  '["어요.", "습니다.", "었어요.", "었어."]'::jsonb,
  '어요.',
  'Quá khứ → 못 먹었어요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #70: V – 는 바람에 [chẳng qua là vì...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 는 바람에',
  'neun baram-e',
  'chẳng qua là vì...',
  'intermediate',
  'cause',
  'Thông thường, mệnh đề trước diễn tả tình huống hoặc hoàn cảnh gây ảnh hưởng tiêu cực đến mệnh đề sau hoặc gây ra một kết quả không mong muốn. Là vĩ tố liên kết mang tính chất biện minh. Tuy nhiên, thỉnh thoảng cũng có thể dùng cấu trúc này trong tình huống mang tính tích cực khi kết quả xảy ra ngoài dự đoán. Mệnh đề sau – 는 바람에 luôn chia ở hình thức quá khứ nhưng không kết hợp với câu mệnh lệnh hoặc câu thỉnh dụ.',
  'V + 는 바람에',
  '[
    {"korean": "노트북이 갑자기 고장 나는 바람에 이메일을 확인하지 못했어요.", "vietnamese": "Vì laptop đột nhiên bị hỏng nên tôi không thể xác nhận email được."},
    {"korean": "버스를 잘못 타는 바람에 늦었어요.", "vietnamese": "Em xin lỗi ạ. Tại vì bị lỡ xe bus nên em đến muộn ạ."},
    {"korean": "갑자기 감기에 걸리는 바람에 약속을 취소했어요.", "vietnamese": "Do tự nhiên bị cảm cúm nên tôi đã đành hủy bỏ cuộc hẹn."},
    {"korean": "태풍이 오는 바람에 비행기가 취소됐어요.", "vietnamese": "Tại có bão nên chuyến bay bị hủy."},
    {"korean": "급하게 먹는 바람에 체했어요.", "vietnamese": "Tại ăn vội nên bị nghẹn."},
    {"korean": "교통사고가 나는 바람에 다쳐서 병원에 입원했어요.", "vietnamese": "Vì bị tai nạn giao thông nên đã nhập viện."},
    {"korean": "길이 막히는 바람에 늦었어요.", "vietnamese": "Vì đường bị tắc nên tôi đã bị muộn."},
    {"korean": "면접 때 긴장하는 바람에 한마디도 못 했어요.", "vietnamese": "Khi phỏng vấn vì tôi căng thẳng quá nên tôi chẳng nói được câu nào."}
  ]'::jsonb,
  ARRAY['V – 느라고', 'A/V – (으)ㄴ/는 탓에']::TEXT[],
  ARRAY['cause', 'negative result', 'unexpected', 'past', 'b1', 'topik2']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 는 바람에' LIMIT 1),
  '노트북이 갑자기 고장 나는 바람에 이메일을 확인하지 못했___.',
  'fill_blank',
  '["어요.", "습니다.", "했어요.", "했어."]'::jsonb,
  '어요.',
  'Quá khứ → 못 했어요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 는 바람에' LIMIT 1),
  '버스를 잘못 타는 바람에 늦었___.',
  'fill_blank',
  '["어요.", "습니다.", "었어요.", "었어."]'::jsonb,
  '어요.',
  'Quá khứ → 늦었어요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #71: A/V – (으)ㄴ/는 탓에 [đổ lỗi, nêu lý do]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ/는 탓에',
  '(eu)n/neun taese',
  'đổ lỗi, nêu lý do',
  'intermediate',
  'cause',
  'Vĩ tố liên kết dùng để đổ lỗi, nêu ra lý do, nguyên nhân, biện hộ, quy trách nhiệm cho một tình huống không tốt nào đó. Mệnh đề sau xảy ra do mệnh đề trước.',
  'V + 는 탓에 / A + (으)ㄴ 탓에 / N인 탓에',
  '[
    {"korean": "밤새도록 드라마를 보는 탓에 아침에 자주 늦게 일어나요.", "vietnamese": "Vì xem phim cả đêm nên tôi thường buổi sáng tôi thường dậy muộn."},
    {"korean": "요즘 스트레스를 자주 받는 탓에 건강이 나빠져요.", "vietnamese": "Dạo này vì bị căng thẳng nhiều nên sức khỏe trở nên xấu đi."},
    {"korean": "장마철인 탓에 비가 자주 온다.", "vietnamese": "Do đang mùa mưa nên trời hay mưa."},
    {"korean": "어제 눈이 많이 온 탓에 길이 미끄러워요.", "vietnamese": "Vì hôm qua tuyết rơi nhiều nên đường rất trơn."},
    {"korean": "어제 술을 많이 마신 탓에 오늘 아침에 머리가 아팠어요.", "vietnamese": "Vì hôm qua uống nhiều rượu nên sáng nay tôi bị đau đầu."},
    {"korean": "시험 문제가 어려운 탓에 학생들의 점수가 좋지 않다.", "vietnamese": "Vì đề thi khó nên điểm số của các em học sinh không được cao."},
    {"korean": "돈을 없는 탓에 원하는 것을 살 수 없다.", "vietnamese": "Vì không có tiền nên không thể mua được thứ mình muốn."}
  ]'::jsonb,
  ARRAY['V – 느라고', 'V – 는 바람에', 'A/V – (으)ㄴ/는 덕분에']::TEXT[],
  ARRAY['cause', 'blame', 'negative result', 'b1', 'topik2']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 탓에' LIMIT 1),
  '밤새도록 드라마를 보는 탓에 아침에 자주 늦게 일어나___.',
  'fill_blank',
  '["요.", "습니다.", "나요.", "나."]'::jsonb,
  '요.',
  'Hiện tại → 일어나요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 탓에' LIMIT 1),
  '요즘 스트레스를 자주 받는 탓에 건강이 나빠져___.',
  'fill_blank',
  '["요.", "습니다.", "어요.", "어."]'::jsonb,
  '요.',
  'Hiện tại → 나빠져요.',
  'medium'
);
