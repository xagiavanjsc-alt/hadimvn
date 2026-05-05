-- Migration 055: Insert TOPIK grammar patterns #72-79 (Intermediate level)
-- Ngữ pháp TOPIK #72-79 (Trung cấp)

-- ═══════════════════════════════════════════════════════════════════════════════
-- #72: A/V – (으)ㄹ까 봐(서) [vì sợ rằng, e rằng nên...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ까 봐(서)',
  '(eu)lkkwa bwa(seo)',
  'vì sợ rằng, e rằng nên...',
  'intermediate',
  'cause',
  'Diễn tả người nói vì lo sợ một hành động, sự việc nào đó sẽ xảy ra. Thường kết hợp với 걱정이다/고민이다 ở vế sau. Ở trình độ cao cấp, có thể dùng kèm phó từ: 행여, 혹, 자칫.',
  'A/V + (으)ㄹ까 봐(서)',
  '[
    {"korean": "비가 올까 봐서 우산을 챙겼어요.", "vietnamese": "Vì sợ trời sẽ mưa nên tôi đã mang theo ô."},
    {"korean": "내일 학교에 늦게 갈까 봐 일찍 쉬었어요.", "vietnamese": "Tôi sợ ngày mai đi học muộn nên đã đi nghỉ sớm."},
    {"korean": "발표할 때 한국어를 틀릴까 봐 걱정이에요.", "vietnamese": "Tôi đang lo là sẽ sai tiếng Hàn khi phát biểu."},
    {"korean": "길이 막힐까 봐 일찍 출발했어요.", "vietnamese": "Tôi sợ đường bị tắc nên đã xuất phát sớm."},
    {"korean": "시험에 떨어질까 봐 걱정이에요.", "vietnamese": "Tôi lo sẽ trượt bài thi."},
    {"korean": "주말에 날씨가 나쁠까 봐 걱정이에요.", "vietnamese": "Tôi đang lo là cuối tuần thời tiết không đẹp."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는 탓에', 'A/V – (으)ㄹ까 하다']::TEXT[],
  ARRAY['cause', 'fear', 'worry', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ까 봐(서)' LIMIT 1),
  '비가 올까 봐서 우산을 챙겼___.',
  'fill_blank',
  '["어요.", "습니다.", "었어요.", "었어."]'::jsonb,
  '어요.',
  'Quá khứ → 챙겼어요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ까 봐(서)' LIMIT 1),
  '늦게 갈까 봐 일찍 쉬었___.',
  'fill_blank',
  '["어요.", "습니다.", "었어요.", "었어."]'::jsonb,
  '어요.',
  'Quá khứ → 쉬었어요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #73: A/V – 고 해서 [chủ yếu vì...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 고 해서',
  'go haeseo',
  'chủ yếu vì...',
  'intermediate',
  'cause',
  'Thể hiện vế trước là lý do tiêu biểu, điển hình trong số nhiều lý do để trở thành việc thực hiện tình huống ở vế sau. Người nói dùng cấu trúc này để đưa ra nguyên nhân chính cho hành động của mình, nhưng cũng ám chỉ rằng còn các nguyên nhân khác nữa.',
  'A/V + 고 해서',
  '[
    {"korean": "손님들이 오고 해서 장을 보러 가요.", "vietnamese": "Vì có khách đến nên tôi đi chợ."},
    {"korean": "요즘 살이 찌고 해서 다이어트를 하고 있어요.", "vietnamese": "Dạo này vì tăng cân nên tôi đang ăn kiêng."},
    {"korean": "피곤하고 해서 약속을 취소했습니다.", "vietnamese": "Tôi mệt nên đã hủy cuộc hẹn."},
    {"korean": "날씨도 좋고 해서 산책하려고 해요.", "vietnamese": "Do thời tiết đẹp nên tôi định đi dạo."},
    {"korean": "기분도 우울하고 해서 친구랑 술 마시기로 했다.", "vietnamese": "Do tâm trạng buồn nên tôi quyết định đi nhậu với bạn bè."},
    {"korean": "오늘 피곤하고 해서 일찍 퇴근하다.", "vietnamese": "Hôm nay vì mệt nên tôi tan làm sớm."},
    {"korean": "늦고 또 비도 오고 해서 택시를 타고 갔습니다.", "vietnamese": "Vì bị trễ và trời mưa nữa nên tôi đã đi taxi."}
  ]'::jsonb,
  ARRAY['A/V – 아/어서', 'A/V – (으)니까']::TEXT[],
  ARRAY['cause', 'main reason', 'typical', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 고 해서' LIMIT 1),
  '피곤하고 해서 약속을 취소했___.',
  'fill_blank',
  '["습니다.", "어요.", "었어요.", "었어."]'::jsonb,
  '습니다.',
  'Quá khứ → 취소했습니다.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 고 해서' LIMIT 1),
  '날씨도 좋고 해서 산책하려고 하___.',
  'fill_blank',
  '["습니다.", "어요.", "겠어요.", "겠어."]'::jsonb,
  '어요.',
  'Kế hoạch → 하려고 해요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #74: A/V – (으)므로 [vì...nên...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)므로',
  '(eu)meuro',
  'vì...nên...',
  'intermediate',
  'cause',
  'Vế trước là lý do, nguyên nhân cho tình huống, trạng thái ở vế sau. Dùng trong văn viết. Vế sau không dùng mệnh lệnh hoặc cầu khiến. Quá khứ 았/었으므로, tương lai (으)ㄹ 것이므로 / 겠으므로.',
  'A/V + (으)므로',
  '[
    {"korean": "전기 제품에 물이 닿으면 위험할 수 있으므로 조심해야 한다.", "vietnamese": "Do khi nước tiếp xúc với các thiết bị điện có thể gây nguy hiểm nên phải cẩn thận."},
    {"korean": "어린이들은 칫솔질이 서툴고, 단 음식을 즐겨 먹으므로 이가 썩 기 쉽다.", "vietnamese": "Vì trẻ nhỏ chưa thành thạo việc đánh răng và thích ăn đồ ngọt nên dễ bị sâu răng."},
    {"korean": "열심히 준비하고 있으므로 좋은 결과가 기대됩니다.", "vietnamese": "Vì đang chuẩn bị một cách miệt mài nên tôi mong đợi một kết quả tốt."},
    {"korean": "이 학생은 매우 노력하므로 앞으로 향상될 가능성이 있다.", "vietnamese": "Bởi học sinh này rất nỗ lực nên có khả năng tiến bộ trong tương lai."},
    {"korean": "이미 출발했으므로 기차를 탈 수 없습니다.", "vietnamese": "Vì tàu hỏa đã khởi hành mất rồi nên không kịp lên tàu."},
    {"korean": "신호를 어겼으므로 벌금을 내서야 합니다.", "vietnamese": "Do đã vi phạm tín hiệu nên phải nộp tiền phạt."}
  ]'::jsonb,
  ARRAY['A/V – 아/어서', 'A/V – 기 때문에']::TEXT[],
  ARRAY['cause', 'written', 'formal', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)므로' LIMIT 1),
  '이미 출발했으므로 기차를 탈 수 없___.',
  'fill_blank',
  '["습니다.", "어요.", "습니다.", "어요."]'::jsonb,
  '습니다.',
  'Văn viết → 없습니다.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)므로' LIMIT 1),
  '매우 노력하므로 향상될 가능성이 있___.',
  'fill_blank',
  '["다.", "어요.", "습니다.", "습니다."]'::jsonb,
  '다.',
  'Văn viết → 있다.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #75: A/V – 아/어서 그런지 [Hình như vì…nên…]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 아/어서 그런지',
  'a/eoseo geureonji',
  'Hình như vì…nên…',
  'intermediate',
  'cause',
  'Là dạng kết hợp của 아/어서 mô tả nguyên nhân, lí do và (으)ㄴ지 thể hiện sự không chắc chắn. Vế trước phỏng đoán lý do, nguyên nhân cho tình huống, trạng thái ở vế sau. Vế sau không dùng mệnh lệnh hoặc cầu khiến.',
  'A/V + 아/어서 그런지',
  '[
    {"korean": "비가 많이 와서 그런지 백화점에 사람이 별로 없네요.", "vietnamese": "Hình như vì trời mưa to hay không mà trung tâm thương mại không có mấy người nhỉ."},
    {"korean": "밥을 빨리 먹어서 그런지 속이 좀 불편해요.", "vietnamese": "Hình như vì ăn cơm nhanh quá hay không mà trong bụng thấy hơi khó chịu."},
    {"korean": "문제가 쉬워서 그런지 학생들의 표정이 밝네요.", "vietnamese": "Hình như vì đề thi dễ quá hay không mà vẻ mặt của các học sinh rất rạng rỡ."},
    {"korean": "아이가 스트레스를 받아서 그런지 힘들어 보여요.", "vietnamese": "Hình như vì đứa trẻ bị căng thẳng quá hay không mà trông đứa bé rất mệt mỏi."},
    {"korean": "영화가 재미가 없어서인지 자는 사람들이 많았어요.", "vietnamese": "Hình như vì bộ phim đó dở quá hay không mà nhiều người đã ngủ."},
    {"korean": "날씨가 따뜻해서 그런지 꽃이 더 많이 핀 것 같다.", "vietnamese": "Hình như do thời tiết ấm áp hay không mà dường như hoa đã nở thêm rất nhiều."}
  ]'::jsonb,
  ARRAY['A/V – 아/어서', 'A/V – (으)ㄴ/는지']::TEXT[],
  ARRAY['cause', 'uncertainty', 'speculation', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어서 그런지' LIMIT 1),
  '비가 많이 와서 그런지 백화점에 사람이 별로 없___.',
  'fill_blank',
  '["네요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '네요.',
  'Văn nói → 없네요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어서 그런지' LIMIT 1),
  '밥을 빨리 먹어서 그런지 속이 좀 불편하___.',
  'fill_blank',
  '["어요.", "습니다.", "해요.", "해."]'::jsonb,
  '어요.',
  'Hiện tại → 불편해요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #76: A/V – 아/어서 그러는데 [Vì chắc chắn là…nên…]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 아/어서 그러는데',
  'a/eoseo geureonde',
  'Vì chắc chắn là…nên…',
  'intermediate',
  'cause',
  'Là dạng kết hợp của 아/어서 mô tả nguyên nhân, lí do và (으)ㄴ데 nhấn mạnh bối cảnh. Động từ 그러하다 rút gọn thành 그러다 kết hợp cùng (으)ㄴ데 sẽ trở thành 아/어서 그러는데. Vế trước khẳng định lý do, nguyên nhân cho tình huống, trạng thái ở vế sau. Vế sau có thể mệnh lệnh hoặc cầu khiến.',
  'A/V + 아/어서 그러는데',
  '[
    {"korean": "오늘 몸이 좀 안 좋아서 그러는데 일찍 퇴근해도 될까요?", "vietnamese": "Vì hôm nay thực sự người tôi không được khỏe nên tôi có thể tan ca sớm được không?"},
    {"korean": "이번 주말에 선약이 있어서 그러는데 다음 주말에 만나는 건 어때?", "vietnamese": "Vì tôi đã có cuộc hẹn trước vào cuối tuần này nên cuối tuần sau gặp thì thế nào?"},
    {"korean": "어제 운동을 좀 많이 해서 그러는데 오늘은 좀 쉬었으면 좋겠어요.", "vietnamese": "Vì hôm qua tôi vận động hơi nhiều nên nếu hôm nay được nghỉ thì tốt biết mấy."},
    {"korean": "외국인이라서 그러는데 양해 좀 부탁드리겠습니다.", "vietnamese": "Vì tôi thực sự là người nước ngoài nên mong bạn thông cảm chút ạ."},
    {"korean": "제가 임산부라서 그러는데 이 자리에 앉아도 될까요?", "vietnamese": "Vì tôi thực sự là phụ nữ mang thai thế nên ngồi ở chỗ này cũng được chứ?"}
  ]'::jsonb,
  ARRAY['A/V – 아/어서', 'A/V – (으)ㄴ데']::TEXT[],
  ARRAY['cause', 'certainty', 'context', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어서 그러는데' LIMIT 1),
  '오늘 몸이 좀 안 좋아서 그러는데 일찍 퇴근해도 될까___.',
  'fill_blank',
  '["요?", "습니까?", "다.", "어."]'::jsonb,
  '요?',
  'Câu hỏi → 될까요?',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어서 그러는데' LIMIT 1),
  '운동을 좀 많이 해서 그러는데 오늘은 좀 쉬었으면 좋겠___.',
  'fill_blank',
  '["어요.", "습니다.", "다.", "어."]'::jsonb,
  '어요.',
  'Mong muốn → 좋겠어요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #77: A/V – 기는 하지만, A/V – 기는 A/V – 지만 [đúng là… nhưng]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 기는 하지만, A/V – 기는 A/V – 지만',
  'gineun hajiman, gineun giman',
  'đúng là… nhưng',
  'intermediate',
  'contrast',
  'Vĩ tố liên kết diễn tả người nói công nhận hoặc thừa nhận nội dung mệnh đề phía trước nhưng muốn bày tỏ, diễn tả rõ việc có quan điểm, ý kiến khác ở mệnh đề sau. Trong văn nói, 기는 하지만 được giản lược thành –긴 하지만 và –기는 –지만 được giản lược thành –긴 –지만. Hình thức quá khứ là 기는 했지만. Ngoài ra còn có thể sử dụng hình thức A/V+기는 하나 hoặc V+기는 하는데 / A+기는 한데.',
  'A/V + 기는 하지만 / A/V + 기는 A/V + 지만',
  '[
    {"korean": "그 원피스가 좋기는 좋지만 너무 비싸서 못 사겠어요.", "vietnamese": "Chiếc váy đó thì đẹp nhưng đắt quá nên chắc tôi không mua được."},
    {"korean": "아파트에 살기가 편하기는 하지만 애완동물을 못 키워요.", "vietnamese": "Đúng là sống ở chung cư tiện lợi nhưng không thể nuôi thú cưng."},
    {"korean": "원룸이 편하기는 하지만 좀 시끄러워요.", "vietnamese": "Đúng là phòng đơn thì tiện nhưng hơi ồn."},
    {"korean": "한국 사람이기는 하지만 매운 음식을 잘 못 먹어요.", "vietnamese": "Đúng là người Hàn Quốc thật nhưng không thể ăn đồ ăn cay."},
    {"korean": "아프기는 하지만 참을 수 있어요.", "vietnamese": "Đúng là đau nhưng mà tôi chịu được."},
    {"korean": "재미있기는 했지만 모두 이해하지는 못했어요.", "vietnamese": "Hay thì có hay nhưng tôi không hiểu hết được."},
    {"korean": "춥기는 하지만 어제보다는 덜 추워요.", "vietnamese": "Đúng là lạnh nhưng đỡ lạnh hơn hôm qua."},
    {"korean": "보기는 하지만 다 이해할 수 없어요.", "vietnamese": "Đúng là tôi có xem nhưng không hiểu được hết."}
  ]'::jsonb,
  ARRAY['A/V – 지만', 'A/V – (으)ㄴ/는데']::TEXT[],
  ARRAY['contrast', 'acknowledgment', 'concession', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 기는 하지만, A/V – 기는 A/V – 지만' LIMIT 1),
  '그 원피스가 좋기는 좋지만 너무 비싸서 못 사겠___.',
  'fill_blank',
  '["어요.", "습니다.", "겠어요.", "겠어."]'::jsonb,
  '어요.',
  'Quyết tâm → 못 사겠어요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 기는 하지만, A/V – 기는 A/V – 지만' LIMIT 1),
  '아프기는 하지만 참을 수 있___.',
  'fill_blank',
  '["어요.", "습니다.", "다.", "어."]'::jsonb,
  '어요.',
  'Khả năng → 있어요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #78: A/V - (으)ㄴ/는데도 [Mặc dù...nhưng ...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V - (으)ㄴ/는데도',
  '(eu)n/neundedo',
  'Mặc dù...nhưng ..., dù...nhưng (vẫn)...',
  'intermediate',
  'contrast',
  'Là sự kết hợp của - (으)ㄴ/는데 và - 아/어도. Vĩ tố liên kết được sử dụng khi kết quả ở vế sau trái ngược với mong đợi, mục đích hành động ở vế trước. Sau - (으)ㄴ/는데도, có thể thêm 불구하고 để nhấn mạnh. Ngoài ra còn có thể dùng cấu trúc N + 에 불구하고 hoặc danh từ hoá mệnh đề: A/V+ (으)ㅁ에도 불구하고.',
  'A + (으)ㄴ데도 / V + 는데도 / V(qua khứ) + (으)ㄴ데도',
  '[
    {"korean": "선생님이 내일 시험이 있다고 하셨는데도 학생들은 공부를 안 했어요.", "vietnamese": "Mặc dù cô giáo đã nói là ngày mai sẽ có bài thi nhưng học sinh thì không chịu học."},
    {"korean": "유리 씨는 많이 먹는데도 살이 안 쪄요.", "vietnamese": "Yuri dù ăn nhiều nhưng không bị tăng cân."},
    {"korean": "영희는 부모님의 반대에도 불구하고 일본 남자와 결혼했다.", "vietnamese": "Dù bố mẹ phản đối nhưng Young Hee vẫn kết hôn với người đàn ông Nhật Bản."},
    {"korean": "제 친구는 월급이 많은데도 회사를 그만두고 싶어해요.", "vietnamese": "Mặc dù lương cao nhưng bạn tôi vẫn muốn nghỉ việc."},
    {"korean": "평일인데도 극장에 사람이 많아요.", "vietnamese": "Mặc dù là ngày thường nhưng ở rạp chiếu phim vẫn đông người."},
    {"korean": "그 여자가 예쁜데도 좋아하는 사람이 없어요.", "vietnamese": "Dù cô gái đó rất đẹp nhưng lại không có người thích."},
    {"korean": "열심히 공부를 했음에도 불구하고 성적이 오르지 않아요.", "vietnamese": "Dù đã chăm chỉ học hành nhưng thành tích vẫn không tăng lên."}
  ]'::jsonb,
  ARRAY['A/V – 아/어도', 'A/V – 지만']::TEXT[],
  ARRAY['contrast', 'despite', 'unexpected', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄴ/는데도' LIMIT 1),
  '선생님이 내일 시험이 있다고 하셨는데도 학생들은 공부를 안 했___.',
  'fill_blank',
  '["어요.", "습니다.", "었어요.", "었어."]'::jsonb,
  '어요.',
  'Quá khứ → 안 했어요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄴ/는데도' LIMIT 1),
  '월급이 많은데도 회사를 그만두고 싶어하___.',
  'fill_blank',
  '["어요.", "습니다.", "해요.", "해."]'::jsonb,
  '어요.',
  'Mong muốn → 싶어해요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #79: A/V – (으)ㄴ/는 반면(에) [trái lại, nhưng]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ/는 반면(에)',
  '(eu)n/neun banmyeon(e)',
  'trái lại, nhưng',
  'intermediate',
  'contrast',
  'Vĩ tố liên kết: Mệnh đề trước và sau có nội dung trái ngược nhau. A + (으)ㄴ 반면(에) thời hiện tại. V + (으)ㄴ 반면(에) thời quá khứ, V + 는 반면(에) thời hiện tại. Ngoài ra có thể sử dụng khi muốn diễn đạt cả mặt tích cực và tiêu cực về một sự việc nào đó trong cùng một câu. Dùng nhiều trong văn viết.',
  'A + (으)ㄴ 반면(에) / V(qua khứ) + (으)ㄴ 반면(에) / V(hiện tại) + 는 반면(에)',
  '[
    {"korean": "저는 읽기는 잘하는 반면에 말하기는 잘 못해요.", "vietnamese": "Tôi đọc giỏi nhưng trái lại nói thì kém."},
    {"korean": "그 가방은 비싼 반면에 질이 좋아요.", "vietnamese": "Chiếc túi xách đó đắt nhưng trái lại chất lượng tốt."},
    {"korean": "지하철은 빠른 반면에 출퇴근 시간에는 사람이 많습니다.", "vietnamese": "Tàu điện ngầm nhanh nhưng lại đông đúc vào giờ cao điểm."},
    {"korean": "요즘 수입은 증가하는 반면에 수출은 감소하고 있다.", "vietnamese": "Gần đây nhập khẩu tăng lên nhưng trái lại xuất khẩu lại giảm."},
    {"korean": "일은 많은 반면에 월급은 적어서 회사를 옮길까 해요.", "vietnamese": "Công việc nhiều nhưng trái lại lương lại thấp nên tôi định chuyển công ty khác."},
    {"korean": "이 식당은 음식이 맛있는 반면에 서비스가 안 좋아요.", "vietnamese": "Nhà hàng này món ăn thì ngon nhưng ngược lại dịch vụ thì không tốt."}
  ]'::jsonb,
  ARRAY['A/V – 지만', 'A/V – (으)ㄴ/는데']::TEXT[],
  ARRAY['contrast', 'comparison', 'positive negative', 'written', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 반면(에)' LIMIT 1),
  '저는 읽기는 잘하는 반면에 말하기는 잘 못하___.',
  'fill_blank',
  '["어요.", "습니다.", "해요.", "해."]'::jsonb,
  '어요.',
  'Hiện tại → 못해요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 반면(에)' LIMIT 1),
  '그 가방은 비싼 반면에 질이 좋___.',
  'fill_blank',
  '["아요.", "습니다.", "해요.", "해."]'::jsonb,
  '아요.',
  'Hiện tại → 좋아요.',
  'medium'
);
