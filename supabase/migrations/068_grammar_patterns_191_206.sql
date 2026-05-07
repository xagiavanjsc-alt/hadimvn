-- Migration 068: Grammar patterns #191-206 (TOPIK 3 - Intermediate/Advanced)

-- ═══════════════════════════════════════════════════════════════════════════════
-- #191: A/V – 기에
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 기에',
  'gie',
  'Vì vậy, vì thế (nguyên nhân trang trọng)',
  'intermediate',
  'cause',
  'Mệnh đề trước tạo thành nguyên nhân hoặc cơ sở cho mệnh đề sau. Vế trước thường là ngôi 3, vế sau là ngôi 1. Dùng trong văn viết và tình huống trang trọng. Dạng trích dẫn 다기에 mang nghĩa "vì người ta nói rằng nên tôi". Vế sau không dùng mệnh lệnh/cầu khiến.',
  'A/V + 기에 / V + 다기에',
  '[
    {"korean": "아들이 숙제를 안 했기에 야단을 쳤어요.", "vietnamese": "Con trai tôi không làm bài tập về nhà vì vậy đã bị mắng."},
    {"korean": "그가 먼저 나에게 인사를 하기에 나도 그에게 인사했어요.", "vietnamese": "Vì anh ấy chào trước nên tôi cũng chào lại anh ấy."},
    {"korean": "친구가 수업 시간에 졸기에 깨워 줬어요.", "vietnamese": "Vì bạn tôi ngủ gật trong giờ học nên tôi đã đánh thức bạn dậy."},
    {"korean": "돈이 부족하기에 은행에 가서 돈을 좀 찾았다.", "vietnamese": "Vì thiếu tiền nên tôi đã đến ngân hàng để rút một ít tiền."},
    {"korean": "아침부터 계속 배가 아프기에 병원에 가서 진찰을 받았어요.", "vietnamese": "Vì bị đau bụng từ sáng nên tôi đã đến bệnh viện khám."},
    {"korean": "마감 일을 못 맞추겠기에 소희 씨에게 좀 도와 달라고 했다.", "vietnamese": "Vì không làm kịp ngày đến hạn nên tôi đã nhờ Sohee giúp đỡ."},
    {"korean": "오후에 비가 오겠기에 우산을 가지고 왔어요.", "vietnamese": "Vì buổi chiều chắc sẽ mưa nên tôi đã mang theo ô."},
    {"korean": "학생이기에 10%를 할인해 주었다.", "vietnamese": "Vì là học sinh nên được giảm giá 10%."}
  ]'::jsonb,
  ARRAY['A/V – 길래', 'A/V – (으)ㄴ/는 까닭에', 'A/V – 아/어서']::TEXT[],
  ARRAY['cause', 'reason', 'formal', 'written', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '돈이 부족하__ 은행에 가서 돈을 좀 찾았다.', 'fill_blank', '["기에", "길래", "는 통에", "므로"]'::jsonb, 0,
  'Nguyên nhân trang trọng → 부족하기에.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 기에' AND topik_level = 'TOPIK III';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '친구가 수업 시간에 졸__ 깨워 줬어요.', 'fill_blank', '["기에", "길래", "는 바람에", "는 탓에"]'::jsonb, 0,
  'Vế trước ngôi 3, vế sau ngôi 1 → 졸기에.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 기에' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #192: A/V – 길래
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 길래',
  'gillae',
  'Do ... nên tôi... (khẩu ngữ của 기에)',
  'intermediate',
  'cause',
  'Dạng khẩu ngữ của 기에. Mệnh đề trước bắt nguồn từ người khác hoặc hoàn cảnh bên ngoài, không liên quan đến ý muốn người nói. Chủ ngữ vế trước phải là ngôi 2 hoặc 3, vế sau phải là ngôi 1. Dạng trích dẫn 다길래 cũng được sử dụng.',
  'A/V + 길래 / V + 다길래',
  '[
    {"korean": "날씨가 덥길래 창문을 열었어요.", "vietnamese": "Vì trời nóng nên tôi đã mở cửa sổ."},
    {"korean": "과일이 맛있어 보이길래 좀 사왔어요.", "vietnamese": "Hoa quả trông có vẻ ngon vì vậy tôi đã mua một chút mang đến."},
    {"korean": "꽃이 예쁘길래 당신한테 주려고 샀어요.", "vietnamese": "Bó hoa đẹp vì thế tôi đã mua để tặng bạn."},
    {"korean": "주말에 친구가 우리 집에 놀러 온다길래 음식을 많이 만들었어요.", "vietnamese": "Vì bạn tôi bảo cuối tuần đến nhà chơi nên tôi đã làm rất nhiều đồ ăn."},
    {"korean": "소고기가 마트에서 할인하길래 많이 사 왔어요.", "vietnamese": "Vì thịt bò ở siêu thị đang giảm giá nên tôi đã mua về rất nhiều."},
    {"korean": "태풍이 와서 바람이 심하게 불길래 약속을 취소하고 집에 있었어요.", "vietnamese": "Vì có bão, gió thổi mạnh nên tôi đã hủy hẹn và ở nhà."},
    {"korean": "그 여자가 너무 예쁘길래 전화번호를 물어봤어요.", "vietnamese": "Vì cô gái đó xinh quá nên tôi đã xin số điện thoại."},
    {"korean": "약속 시간까지 30분이나 남았길래 옷가게에 들러서 옷을 구경하려고 해요.", "vietnamese": "Vì còn tận 30 phút nữa mới đến giờ hẹn nên tôi vào cửa hàng ngắm quần áo."}
  ]'::jsonb,
  ARRAY['A/V – 기에', 'A/V – 아/어서', 'A/V – (으)니까']::TEXT[],
  ARRAY['cause', 'reason', 'spoken', 'colloquial', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '날씨가 덥__ 창문을 열었어요.', 'fill_blank', '["길래", "기에", "는 바람에", "므로"]'::jsonb, 0,
  'Dạng khẩu ngữ của 기에, vế sau ngôi 1 → 덥길래.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 길래' AND topik_level = 'TOPIK III';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '소고기가 마트에서 할인하__ 많이 사 왔어요.', 'fill_blank', '["길래", "기에", "는 통에", "는 바람에"]'::jsonb, 0,
  'Hoàn cảnh bên ngoài làm lý do, người nói hành động → 할인하길래.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 길래' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #193: A/V – (으)ㄴ 나머지
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ 나머지',
  'eun nameoji',
  'Vì quá... nên... (dẫn đến kết quả xấu)',
  'intermediate',
  'cause',
  'Vì một sự thật quá mức xảy ra dẫn đến kết quả tiêu cực ở vế sau. Thường đi kèm với 너무, 지나치게 ở vế trước.',
  'A + (으)ㄴ 나머지 / V + (으)ㄴ 나머지',
  '[
    {"korean": "너무 억울한 나머지 그는 울음을 터뜨리고 말았어요.", "vietnamese": "Vì quá oan ức nên anh ấy đã bật khóc."},
    {"korean": "저는 너무 급한 나머지 문을 잠그는 걸 잊어버렸어요.", "vietnamese": "Vì quá vội nên tôi đã quên khóa cửa mất rồi."},
    {"korean": "너무 화가 난 나머지 핸드폰을 던져 버렸어요.", "vietnamese": "Do quá giận dữ nên anh ấy ném điện thoại đi mất rồi."},
    {"korean": "요즘 바쁜 나머지 부모님께 한 달 동안 전화도 못 드렸네요.", "vietnamese": "Gần đây do quá bận rộn nên đến cả tháng trời cũng chẳng thể gọi điện cho bố mẹ."},
    {"korean": "건강이 너무 안 좋아진 나머지 병원에 입원했어요.", "vietnamese": "Do sức khỏe dần trở nên quá tệ nên ông ấy đã phải nhập viện."},
    {"korean": "돈을 너무 많이 쓴 나머지 책 한 권 살 돈도 안 남았어요.", "vietnamese": "Do tiêu tiền quá phung phí nên đến tiền mua một cuốn sách cũng không còn đủ."}
  ]'::jsonb,
  ARRAY['–는 바람에', '–는 탓에', '–아/어서']::TEXT[],
  ARRAY['cause', 'excessive', 'negative_result', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '너무 억울한 __ 그는 울음을 터뜨리고 말았어요.', 'fill_blank', '["나머지", "바람에", "탓에", "통에"]'::jsonb, 0,
  'Vì quá oan ức → 억울한 나머지.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ 나머지' AND topik_level = 'TOPIK III';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '너무 급한 __ 문을 잠그는 걸 잊어버렸어요.', 'fill_blank', '["나머지", "통에", "길래", "기에"]'::jsonb, 0,
  'Vì quá vội dẫn đến kết quả tiêu cực → 급한 나머지.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ 나머지' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #194: A/V – (으)ㄹ세라
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ세라',
  'eulsera',
  'Vì lo rằng... nên... (sợ điều gì có thể xảy ra)',
  'intermediate',
  'concern',
  'Vì lo lắng điều gì đó có thể xảy ra nên thực hiện hành động ở vế sau. Cấu trúc tương tự (으)ㄹ까 봐(서). Mang sắc thái văn viết, trang trọng hơn.',
  'A/V + (으)ㄹ세라',
  '[
    {"korean": "그들은 아기가 들을세라 목소리를 낮추었어요.", "vietnamese": "Họ lo rằng đứa bé sẽ nghe được nên đã hạ thấp giọng xuống."},
    {"korean": "북쪽에 추울세라 두꺼운 옷도 많이 챙겼어요.", "vietnamese": "Vì lo rằng miền Bắc sẽ lạnh nên tôi đã mang nhiều quần áo ấm."},
    {"korean": "물건을 훔친 그는 다른 사람이 볼세라 쏜살같이 사라졌다.", "vietnamese": "Hắn ta trộm đồ và lo rằng người khác sẽ nhìn thấy nên biến mất nhanh như tên bắn."},
    {"korean": "신부는 자신의 웨딩드레스를 밟을세라 조심스럽게 걸었다.", "vietnamese": "Cô dâu vì lo rằng sẽ dẫm lên váy cưới của mình nên bước đi rất cẩn thận."},
    {"korean": "나는 그 책을 누가 빌려 갔을세라 걱정하며 도서관에 갔다.", "vietnamese": "Tôi đã đến thư viện vì lo rằng có ai đã mượn cuốn sách đó."},
    {"korean": "승규는 혹시라도 민준이가 눈치챘을세라 조심스럽게 생일 파티를 준비했다.", "vietnamese": "Seung Gyu vì lo rằng Min Jun sẽ để ý nên đã bí mật chuẩn bị bữa tiệc sinh nhật một cách cẩn thận."}
  ]'::jsonb,
  ARRAY['–(으)ㄹ까 봐(서)', '–지 않을까 해서']::TEXT[],
  ARRAY['concern', 'fear', 'worry', 'formal', 'written', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '아기가 들__ 목소리를 낮추었어요.', 'fill_blank', '["을세라", "ㄹ까 봐", "기에", "길래"]'::jsonb, 0,
  'Lo rằng đứa bé nghe thấy → 들을세라.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ세라' AND topik_level = 'TOPIK III';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '다른 사람이 볼__ 쏜살같이 사라졌다.', 'fill_blank', '["세라", "까 봐서", "기에", "길래"]'::jsonb, 0,
  'Lo người khác nhìn thấy → 볼세라.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ세라' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #195: V – 아/어 대서
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 아/어 대서',
  'ae daeseo',
  'Vì cứ... nên... (hành động lặp lại gây khó chịu)',
  'intermediate',
  'cause',
  'Vì một hành động thường xuyên lặp lại quá mức dẫn đến kết quả tiêu cực. Chủ ngữ có ý phàn nàn, không hài lòng. Có thể dùng 아/어대면 (nếu cứ...). Khác với 다가 보니 (nhấn mạnh trải nghiệm), cấu trúc này thể hiện sự phàn nàn.',
  'V + 아/어 대서 / V + 아/어 대면',
  '[
    {"korean": "아기가 밤새 울어 대서 잠을 못 잤어요.", "vietnamese": "Đứa bé cứ khóc hoài suốt đêm làm tôi đã không ngủ được."},
    {"korean": "아침부터 고함을 질러 대서 목이 쉬었다.", "vietnamese": "Vì la hét từ sáng nên cổ họng bị khàn."},
    {"korean": "도서관에서 옆 사람이 떠들어 대서 공부를 하지 못했다.", "vietnamese": "Trong thư viện người bàn bên cứ làm ồn nên tôi không thể học được."},
    {"korean": "그렇게 아이에게 잔소리를 해대면 아이가 스트레스를 받을 거예요.", "vietnamese": "Nếu cứ cằn nhằn đứa trẻ hoài như thế thì đứa trẻ sẽ bị stress đó."},
    {"korean": "그렇게 계속 먹어 대면 뚱뚱해질 거예요.", "vietnamese": "Cứ ăn liên tục ra thế cậu sẽ béo ra đó."},
    {"korean": "복도에서 다른 학생들이 떠들어 대서 시험에 집중하지 못했어요.", "vietnamese": "Các học sinh cứ làm ồn ở hành lang nên không thể tập trung trong kì thi."}
  ]'::jsonb,
  ARRAY['–는 바람에', '–는 탓에', '–아/어서']::TEXT[],
  ARRAY['cause', 'repeated_action', 'complaint', 'negative_result', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '아기가 밤새 울어 __ 잠을 못 잤어요.', 'fill_blank', '["대서", "서인지", "놓아서", "봐서"]'::jsonb, 0,
  'Hành động lặp lại gây khó chịu → 울어 대서.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어 대서' AND topik_level = 'TOPIK III';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그렇게 계속 먹어 __ 뚱뚱해질 거예요.', 'fill_blank', '["대면", "서인지", "놓으면", "봐서"]'::jsonb, 0,
  'Nếu cứ... → 먹어 대면.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어 대서' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #196: A/V – 아/어 놓아서 / 아/어 놓으니
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 아/어 놓아서',
  'ae noaseo',
  'Vì vốn dĩ... nên... (trạng thái kéo dài)',
  'intermediate',
  'cause',
  'Vì một hoàn cảnh hay trạng thái nào đó vẫn còn kéo dài. Thường dùng với tính từ, nhấn mạnh trạng thái vế trước vẫn còn tồn tại. Dùng trong văn nói và kết hợp cùng phó từ 워낙, 원체, 너무.',
  'A/V + 아/어 놓아서 / A/V + 아/어 놓으니',
  '[
    {"korean": "워낙 할 일이 많아 놓아서 그 부탁을 들어줄 수 없을 것 같아요.", "vietnamese": "Vốn dĩ tôi có rất nhiều việc nên có lẽ tôi sẽ không thể chấp nhận lời nhờ vả đó."},
    {"korean": "가뭄이라 채소가 원체 비싸 놓으니 사다 먹을 수가 있어야지.", "vietnamese": "Vì là hạn hán nên rau củ vốn dĩ đắt nên phải mua ăn chứ."},
    {"korean": "원체 성격이 소심해 놓아서 낯선 사람에게 말을 걸기가 어려워요.", "vietnamese": "Vốn dĩ tính cách nhút nhát nên khó mà bắt chuyện với người lạ."},
    {"korean": "워낙 집이 좁아 놓으니 손님을 초대하기가 힘들어요.", "vietnamese": "Vốn dĩ nhà chật nên khó mà mời khách đến chơi."}
  ]'::jsonb,
  ARRAY['–아/어서', '–기에', '–길래']::TEXT[],
  ARRAY['cause', 'ongoing_state', 'spoken', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '워낙 할 일이 많아 __ 그 부탁을 들어줄 수 없을 것 같아요.', 'fill_blank', '["놓아서", "대서", "서인지", "봐서"]'::jsonb, 0,
  'Trạng thái vốn dĩ nhiều việc → 많아 놓아서.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어 놓아서' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #197: A/V – (으)ㄴ/는 까닭에
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ/는 까닭에',
  'eun/neun kkadage',
  'Với lý do... nên... (nguyên nhân trang trọng)',
  'intermediate',
  'cause',
  'Vì một nguyên nhân nào đó. Thường dùng trong văn viết. Có thể dùng dạng 까닭으로 thay thế.',
  'A + (으)ㄴ 까닭에 / V + 는 까닭에 / A/V + 았/었는 까닭에',
  '[
    {"korean": "면접시험을 보는데 너무 긴장한 까닭에 제대로 답변을 못했어요.", "vietnamese": "Khi tham gia kì thi phỏng vấn vì căng thẳng nên tôi đã không thể trả lời chính xác được."},
    {"korean": "사회가 점점 변하고 있는 까닭에 가족에 대한 생각이 달라지고 있다.", "vietnamese": "Vì xã hội đang dần thay đổi nên suy nghĩ về gia đình cũng trở nên khác."},
    {"korean": "이곳은 투자 가치가 높은 까닭에 많은 투자자들의 관심을 끌고 있습니다.", "vietnamese": "Nơi này do giá trị đầu tư cao nên đang lôi kéo sự quan tâm của các nhà đầu tư."},
    {"korean": "그 회사는 인력이 부족한 까닭에 운영에 어려움을 겪고 있습니다.", "vietnamese": "Công ty đó do thiếu nhân lực nên việc điều hành đang đối mặt với khó khăn."},
    {"korean": "올해는 비가 너무 많이 온 까닭으로 농작물 재배를 망치고 말았다.", "vietnamese": "Năm nay vì mưa quá nhiều nên việc trồng trọt đã bị phá hủy."},
    {"korean": "아르바이트에 시간을 많이 빼앗긴 까닭에 한국어 공부를 제대로 하지 못 했다.", "vietnamese": "Vì bị mất nhiều thời gian cho việc làm thêm nên tôi đã không thể học tiếng Hàn một cách chỉn chu."}
  ]'::jsonb,
  ARRAY['–기 때문에', '–(으)므로', '–는 이유로']::TEXT[],
  ARRAY['cause', 'reason', 'formal', 'written', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '인력이 부족한 __ 운영에 어려움을 겪고 있습니다.', 'fill_blank', '["까닭에", "기에", "길래", "나머지"]'::jsonb, 0,
  'Nguyên nhân trang trọng trong văn viết → 부족한 까닭에.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 까닭에' AND topik_level = 'TOPIK III';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '비가 너무 많이 온 __ 농작물 재배를 망치고 말았다.', 'fill_blank', '["까닭으로", "바람에", "탓에", "통에"]'::jsonb, 0,
  'Dạng 까닭으로 thay thế 까닭에 → 온 까닭으로.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 까닭에' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #198: A/V – 아/어서인지
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 아/어서인지',
  'ae seoinji',
  'Có lẽ vì... nên... (nguyên nhân không chắc chắn)',
  'intermediate',
  'cause',
  'Giống như 아/어서 그런지. Dùng khi chưa chắc chắn về nguyên nhân, người nói suy đoán lý do dẫn đến kết quả.',
  'A/V + 아/어서인지 / A/V + 아/어서 그런지',
  '[
    {"korean": "기말 시험이 너무 어려워서인지 성적이 안 좋아요.", "vietnamese": "Có lẽ vì bài thi cuối kì quá khó nên thành tích không được tốt."},
    {"korean": "다이어트를 열심히 해서인지 살이 많이 빠졌어요.", "vietnamese": "Có lẽ vì chăm chỉ ăn kiêng nên cân nặng giảm đi nhiều."},
    {"korean": "비가 많이 와서 그런지 백화점에 사람이 별로 없네요.", "vietnamese": "Có lẽ vì trời mưa to nên trung tâm thương mại không có người mấy nhỉ."},
    {"korean": "아이가 스트레스를 받아서 그런지 힘들어 보여요.", "vietnamese": "Có lẽ vì đứa trẻ bị căng thẳng quá nên trông rất mệt mỏi."},
    {"korean": "영화가 재미없어서인지 자는 사람들이 많았어요.", "vietnamese": "Có lẽ vì bộ phim đó dở quá nên nhiều người đã ngủ."},
    {"korean": "날씨가 추워서인지 거리에 사람이 없어요.", "vietnamese": "Có lẽ vì trời lạnh nên trên đường không có người."}
  ]'::jsonb,
  ARRAY['–아/어서 그런지', '–기 때문인지', '–아/어서']::TEXT[],
  ARRAY['cause', 'uncertain_reason', 'speculation', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '기말 시험이 너무 어려워__ 성적이 안 좋아요.', 'fill_blank', '["서인지", "서 그런지", "기에", "길래"]'::jsonb, 0,
  'Nguyên nhân suy đoán → 어려워서인지.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어서인지' AND topik_level = 'TOPIK III';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '다이어트를 열심히 해__ 살이 많이 빠졌어요.', 'fill_blank', '["서인지", "기에", "길래", "는 탓에"]'::jsonb, 0,
  'Chưa chắc chắn lý do → 해서인지.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어서인지' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #199: A/V – (으)ㄹ진대
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ진대',
  'euljindae',
  'Vì... nên... (nhận định sự thật để giải thích)',
  'intermediate',
  'cause',
  'Nhận định sự thật ở vế trước, đưa ra giải thích hoặc phán xét ở vế sau. Thường dùng trong văn viết trang trọng.',
  'A/V + (으)ㄹ진대',
  '[
    {"korean": "자네가 먹을진대 나도 먹어야겠네.", "vietnamese": "Vì cậu ấy sẽ ăn nên tớ cũng phải ăn thôi."},
    {"korean": "그대와 같이 건강할진대 무엇이 걱정되랴.", "vietnamese": "Khỏe mạnh như cậu thì có gì phải lo lắng đâu chứ."},
    {"korean": "우리가 이웃일진대 서로 도와야 마땅하다.", "vietnamese": "Vì chúng ta là hàng xóm nên phải giúp đỡ nhau chứ."},
    {"korean": "출세를 못할진대 돈이나 벌자.", "vietnamese": "Vì không thể một bước thành công được nên phải kiếm tiền thôi."}
  ]'::jsonb,
  ARRAY['–(으)므로', '–는 이상', '–기에']::TEXT[],
  ARRAY['cause', 'formal', 'written', 'classical', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '우리가 이웃일__ 서로 도와야 마땅하다.', 'fill_blank', '["진대", "기에", "길래", "므로"]'::jsonb, 0,
  'Nhận định sự thật để giải thích → 이웃일진대.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ진대' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #200: A/V – 거늘
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 거늘',
  'geoneul',
  'Rõ ràng là... (sự thật hiển nhiên để so sánh)',
  'intermediate',
  'cause',
  'Nhận định sự thật ở vế trước, thường là chân lý hay sự thật hiển nhiên, để giải thích hoặc so sánh cho vế sau. Có thể đi kèm 하물며 (huống hồ, huống chi) thể hiện sự bất bình.',
  'A/V + 거늘 / 하물며 A/V + 거늘',
  '[
    {"korean": "십 년이면 강산도 변하거늘 나라고 어찌 변화가 없었겠소.", "vietnamese": "10 năm thì rõ ràng sông núi còn thay đổi chứ đất nước sao mà không thay đổi được."},
    {"korean": "새도 제 집을 찾거늘 하물며 사람이 제 고향을 모른다 하겠는가.", "vietnamese": "Con chim còn biết tìm nhà của mình huống chi con người chẳng nhẽ lại không biết tìm quê hương."},
    {"korean": "사람은 나이를 먹으면 늙는 것이거늘 속상할 필요 없어요.", "vietnamese": "Đương nhiên vì con người có tuổi thì phải già nên không cần phải buồn đâu."},
    {"korean": "사람은 빈손으로 왔다가 빈손으로 가는 것이거늘 뭘 그리 욕심을 내세요?", "vietnamese": "Con người trắng tay lúc đến thì trắng tay lúc đi làm gì mà tham lam thế?"},
    {"korean": "불우 이웃 돕기도 하거늘 하물며 가족을 안 도울 수 있겠는가?", "vietnamese": "Rõ ràng là người khó khăn còn giúp đỡ huống hồ sao lại không giúp người nhà?"}
  ]'::jsonb,
  ARRAY['–(으)ㄹ진대', '–기에', '하물며']::TEXT[],
  ARRAY['cause', 'obvious_truth', 'classical', 'formal', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '새도 제 집을 찾__ 하물며 사람이 고향을 모른다 하겠는가.', 'fill_blank', '["거늘", "기에", "길래", "므로"]'::jsonb, 0,
  'Sự thật hiển nhiên làm cơ sở so sánh → 찾거늘.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 거늘' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #201: A/V – (으)ㄴ즉
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ즉',
  'eunjeuK',
  'Vì... nên... (nguyên nhân kết quả, văn viết)',
  'intermediate',
  'cause',
  'Diễn tả nguyên nhân kết quả, dùng trong văn viết, có thể thay thế (으)므로.',
  'A + (으)ㄴ즉 / V + (으)ㄴ즉 / N + 인즉',
  '[
    {"korean": "어제 일요일인즉 회사에 가지 않았지요.", "vietnamese": "Vì hôm qua là chủ nhật nên tôi không phải đến công ty."},
    {"korean": "고향에 가 본즉 모든 것이 몰라보게 달라졌었다.", "vietnamese": "Khi tôi trở về quê thì mọi thứ thay đổi đến mức không nhận ra."},
    {"korean": "이 약을 먹은즉 병이 나아졌다.", "vietnamese": "Vì tôi uống thuốc này nên bệnh đã đỡ hơn rồi."},
    {"korean": "날씨가 매우 찬즉 강에 얼음이 얼었다.", "vietnamese": "Vì thời tiết rất lạnh nên sông đã đóng băng."}
  ]'::jsonb,
  ARRAY['–(으)므로', '–기에', '–(으)ㄴ/는 까닭에']::TEXT[],
  ARRAY['cause', 'formal', 'written', 'classical', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '어제 일요일인__ 회사에 가지 않았지요.', 'fill_blank', '["즉", "기에", "까닭에", "므로"]'::jsonb, 0,
  'N + 인즉 → 일요일인즉.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ즉' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #202: A/V – (으)ㄴ/는지라
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ/는지라',
  'eun/neun jira',
  'Vì... (nhấn mạnh lý do)',
  'intermediate',
  'cause',
  'Nhấn mạnh lí do để giải thích vế sau, có thể thay thế bằng 기 때문에.',
  'A + (으)ㄴ지라 / V + 는지라 / V + 았/었는지라',
  '[
    {"korean": "밤에 손님이 없는지라 주인은 일찍 문을 닫았어요.", "vietnamese": "Vào buổi tối vì không có khách nên chủ quán đã đóng cửa sớm."},
    {"korean": "어려울 때마다 그 분이 도와주신지라 그저 고마울 수밖에요.", "vietnamese": "Mỗi khi gặp khó khăn, tôi chỉ biết cảm ơn vì người đó đã giúp đỡ."},
    {"korean": "그는 아주 친한 친구인지라 나는 그의 마음을 아주 잘 알아요.", "vietnamese": "Vì anh ấy là người bạn rất thân của tôi nên tôi biết rất rõ về anh ấy."},
    {"korean": "그 아르바이트는 일이 힘든지라 월급이 많아요.", "vietnamese": "Vì việc làm thêm đó vất vả nên lương cao."},
    {"korean": "내 친구는 성격이 좋은지라 인기가 많아요.", "vietnamese": "Bạn tôi vì có tính cách rất tốt nên được nhiều người mến mộ."},
    {"korean": "휴대폰이 비싼지라 살 수 없습니다.", "vietnamese": "Vì điện thoại đắt nên không thể mua được."}
  ]'::jsonb,
  ARRAY['–기 때문에', '–(으)므로', '–는 까닭에']::TEXT[],
  ARRAY['cause', 'reason_emphasis', 'formal', 'written', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '밤에 손님이 없는__ 주인은 일찍 문을 닫았어요.', 'fill_blank', '["지라", "기에", "까닭에", "길래"]'::jsonb, 0,
  'Nhấn mạnh lý do → 없는지라.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는지라' AND topik_level = 'TOPIK III';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '휴대폰이 비싼__ 살 수 없습니다.', 'fill_blank', '["지라", "기에", "까닭에", "나머지"]'::jsonb, 0,
  'Tính từ + (으)ㄴ지라 → 비싼지라.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는지라' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #203: V – 느니
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 느니',
  'neuni',
  'Nếu ... thà rằng... (phương án thay thế tốt hơn)',
  'intermediate',
  'preference',
  'Người nói không hài lòng với cả hai mệnh đề, nhưng so với mệnh đề trước thì hành động ở mệnh đề sau sẽ tốt hơn. Mệnh đề sau thường đi cùng 차라리, 아예. Biểu hiện tương tự: (으)ㄹ 바에야.',
  'V + 느니 (차라리)',
  '[
    {"korean": "사랑하는 사람과 결혼하지 못하느니 차라리 평생 혼자 사는 게 나아요.", "vietnamese": "Nếu không kết hôn với người mình yêu thì tôi thà cả đời sống một mình còn hơn."},
    {"korean": "민호 씨한테 부탁하느니 시간이 걸려도 나 혼자 할래.", "vietnamese": "Dù có tốn thời gian thì tôi thà làm một mình còn hơn là nhờ Minho."},
    {"korean": "이렇게 맛없는 음식을 먹느니 굶는 게 낫겠어요.", "vietnamese": "Tôi thà nhịn đói còn hơn là ăn một món ăn vô vị như thế này."},
    {"korean": "이렇게 재미없는 영화를 보러 가느니 집에서 잠이나 자야겠어요.", "vietnamese": "Đi xem một bộ phim nhàm chán như thế này thì tôi thà ngủ ở nhà còn hơn."},
    {"korean": "이 시간에 택시를 타느니 차라리 걸어가는 게 더 빠르겠다.", "vietnamese": "Giờ này mà đi taxi thì thà rằng đi bộ còn nhanh hơn."},
    {"korean": "짐을 들고 버스를 타느니 차라리 돈을 더 내고 택시를 타겠어요.", "vietnamese": "Thà trả thêm chút tiền rồi đi taxi còn hơn là xách đống hành lý đi xe bus."}
  ]'::jsonb,
  ARRAY['V – (으)ㄹ 바에야', '차라리 –는 것이 낫다']::TEXT[],
  ARRAY['preference', 'comparison', 'alternative', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '이렇게 맛없는 음식을 먹__ 굶는 게 낫겠어요.', 'fill_blank', '["느니", "길래", "기에", "는 바람에"]'::jsonb, 0,
  'Thà nhịn đói còn hơn → 먹느니 굶는 게 낫다.'
FROM public.grammar_patterns WHERE pattern = 'V – 느니' AND topik_level = 'TOPIK III';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '이 시간에 택시를 타__ 차라리 걸어가는 게 더 빠르겠다.', 'fill_blank', '["느니", "길래", "기에", "므로"]'::jsonb, 0,
  'Phương án vế sau tốt hơn → 타느니 차라리.'
FROM public.grammar_patterns WHERE pattern = 'V – 느니' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #204: V – (으)ㄹ 바에야
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)ㄹ 바에야',
  'eul baeeya',
  'Đối với việc... mà nói thì thà... (phương án thay thế)',
  'intermediate',
  'preference',
  'Dùng khi đưa ra một phương án thay thế tốt hơn so với tình huống đang được đề cập. Mệnh đề sau thường đi cùng 차라리, 아예, 어차피, 기왕에. Biểu hiện tương tự: V – 느니. Có thể dùng (으)ㄹ 바에는 thay thế.',
  'V + (으)ㄹ 바에야 / V + (으)ㄹ 바에는',
  '[
    {"korean": "가만히 누워서 죽음을 기다릴 바에야 위험하더라도 하고 싶은 일을 다 해 보고 싶었다고 말씀하셨어요.", "vietnamese": "Bà tôi đã nói rằng thà nằm yên chờ đợi cái chết mà nói thì dù nguy hiểm cũng muốn làm tất cả những gì bà muốn còn hơn."},
    {"korean": "앉아서 걱정만 할 바에야 아예 밖에 나가서 찾아보는 게 나아요.", "vietnamese": "Nếu cứ ngồi lo lắng thì thà ra ngoài xem còn hơn."},
    {"korean": "이왕 먹을 바에는 제대로 먹자고.", "vietnamese": "Đằng nào cũng ăn rồi thì phải ăn cho đàng hoàng chứ."},
    {"korean": "그런 이상한 사람과 결혼할 바에야 차라리 혼자 사는 것이 더 좋겠다.", "vietnamese": "Đối với việc kết hôn với một người kỳ lạ như thế mà nói thì thà sống một mình sẽ tốt hơn."},
    {"korean": "그렇게 천천히 일을 진행할 바에야 아예 그만두는 것이 낫다.", "vietnamese": "Đối với việc tiến hành công việc chậm chạp như thế này thì thà dừng lại ngay từ đầu còn hơn."},
    {"korean": "그들의 손에 죽을 바에는 차라리 자신의 손으로 죽는 게 낫겠다고 생각했다.", "vietnamese": "Nếu chết trong tay họ thì tôi thà tự chết bằng tay mình còn hơn."}
  ]'::jsonb,
  ARRAY['V – 느니', '차라리 –는 것이 낫다', '–기보다는']::TEXT[],
  ARRAY['preference', 'comparison', 'alternative', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그런 사람과 결혼할 __ 차라리 혼자 사는 것이 더 좋겠다.', 'fill_blank', '["바에야", "느니", "기에", "길래"]'::jsonb, 0,
  'Phương án thay thế tốt hơn → 결혼할 바에야 차라리.'
FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ 바에야' AND topik_level = 'TOPIK III';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '이왕 먹을 __ 제대로 먹자고.', 'fill_blank', '["바에는", "느니", "기에", "까닭에"]'::jsonb, 0,
  'Dùng 바에는 thay thế cho 바에야 → 먹을 바에는.'
FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ 바에야' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #205: A/V – 건 | A/V – 건
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 건 | A/V – 건',
  'geon geon',
  'Dù... hay... (kết quả như nhau dù chọn cái nào)',
  'intermediate',
  'concession',
  'Dạng rút gọn của -거나 –거나. Sử dụng khi đưa ra hai lựa chọn so sánh hoặc đối lập nhau nhưng dù chọn theo lựa chọn nào kết quả cũng như nhau. Có dạng 건 간에, kết hợp với từ để hỏi 뭘, 무슨, 어느.',
  'A/V + 건 A/V + 건 (간에)',
  '[
    {"korean": "수업이 재미있건 재미없건 우리가 수업을 빠지고 놀러 가면 안 돼요.", "vietnamese": "Dù tiết học có thú vị hay nhàm chán thì chúng ta cũng không được bỏ học rồi chơi được."},
    {"korean": "저는 잘생겼건 못생겼건 지혜롭고 유머가 있는 남자를 만났으면 좋겠어요.", "vietnamese": "Tôi muốn gặp được một người đàn ông có trí tuệ và hài hước dù có đẹp trai hay xấu trai."},
    {"korean": "내가 뭘 먹건 당신이 왜 참견하세요?", "vietnamese": "Dù tôi có ăn gì thì liên quan gì đến anh?"},
    {"korean": "집에서 먹건 외출하건 건강하게 식사해야지.", "vietnamese": "Cho dù ăn ở nhà hay ra ngoài thì cũng phải ăn uống lành mạnh."},
    {"korean": "운전하건 버스로 가건 상관없이 같은 시간이 걸리더라고요.", "vietnamese": "Dù lái xe hay đi xe bus thì cũng mất thời gian như nhau."},
    {"korean": "저는 일찍 자건 늦게 자건 매일 같은 시간에 일어나요.", "vietnamese": "Cho dù đi ngủ sớm hay đi ngủ muộn thì mỗi ngày tôi đều ngủ dậy cùng một giờ."},
    {"korean": "아시아이건 유럽이건 아무 곳이나 여행을 가고 싶어요.", "vietnamese": "Tôi muốn đi du lịch ở bất cứ đâu cho dù đó là Châu Á hay Châu Âu."}
  ]'::jsonb,
  ARRAY['–거나 –거나', '–아/어도 –아/어도', '–든 –든']::TEXT[],
  ARRAY['concession', 'comparison', 'regardless', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '수업이 재미있__ 재미없__ 수업을 빠지면 안 돼요.', 'fill_blank', '["건 건", "든 든", "거나 거나", "고 고"]'::jsonb, 0,
  'Dạng rút gọn của 거나 거나 → 재미있건 재미없건.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 건 | A/V – 건' AND topik_level = 'TOPIK III';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '집에서 먹__ 외출하__ 건강하게 식사해야지.', 'fill_blank', '["건 건", "든 든", "거나 거나", "고 고"]'::jsonb, 0,
  'Hai lựa chọn đối lập, kết quả như nhau → 먹건 외출하건.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 건 | A/V – 건' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #206: A/V – (느)ㄴ다기보다는
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (느)ㄴ다기보다는',
  'neundagibodaneun',
  'Thay vì nói là... thì đúng hơn là... (điều chỉnh nhận định)',
  'intermediate',
  'correction',
  'Dùng để chỉ ra rằng nội dung ở vế sau phù hợp với chủ đề đang bàn luận hơn nội dung ở vế trước. Biểu hiện nhấn mạnh: (느)ㄴ다기보다도.',
  'V + (느)ㄴ다기보다는 / A + 다기보다는 / N + (이)라기보다는',
  '[
    {"korean": "맛이 있다기보다는 우리 집 근처에 있는 식당이 거기밖에 없어서 그래요.", "vietnamese": "Không hẳn là ngon mà đúng hơn là vì ở gần nhà tôi chỉ có nhà hàng đó thôi nên tôi hay đến."},
    {"korean": "머리가 좋다기보다는 이번 대회에 노력을 기울이는 거예요.", "vietnamese": "Không hẳn là thông minh mà đúng hơn là trong cuộc thi lần này cậu ấy đã tập trung nỗ lực hết mình."},
    {"korean": "친구랑 이야기를 하고 싶지 않다기보다는 그냥 정말 부끄러워요.", "vietnamese": "Không phải là tôi không muốn nói chuyện với bạn bè mà đúng hơn là tôi rất ngại."},
    {"korean": "소주를 마시지 않는다고 하기보다는 그냥 가장 좋아하는 술이 아니에요.", "vietnamese": "Không phải là tôi không uống soju, chỉ là nó không phải là đồ uống yêu thích của tôi."},
    {"korean": "등산을 좋아한다기보다는 한국에 있을 때 그냥 등산을 해요.", "vietnamese": "Không hẳn là tôi thích leo núi mà nói đúng hơn là tôi chỉ thích leo núi khi ở Hàn Quốc."},
    {"korean": "그 남자가 친구라기보다는 그냥 회사 동료예요.", "vietnamese": "Anh ấy không phải là bạn trai mà chỉ là đồng nghiệp công ty thôi."}
  ]'::jsonb,
  ARRAY['–기보다는', '–다는 것보다는', '–는 것이 아니라']::TEXT[],
  ARRAY['correction', 'clarification', 'comparison', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '머리가 좋__ 이번 대회에 노력을 기울이는 거예요.', 'fill_blank', '["다기보다는", "기에", "길래", "는 탓에"]'::jsonb, 0,
  'Điều chỉnh nhận định: không phải thông minh mà là nỗ lực → 좋다기보다는.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (느)ㄴ다기보다는' AND topik_level = 'TOPIK III';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그 남자가 친구라기보다는 그냥 회사 __ 예요.', 'fill_blank', '["동료", "친구", "선배", "후배"]'::jsonb, 0,
  'N + 라기보다는 để điều chỉnh → 친구라기보다는 동료.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (느)ㄴ다기보다는' AND topik_level = 'TOPIK III';
