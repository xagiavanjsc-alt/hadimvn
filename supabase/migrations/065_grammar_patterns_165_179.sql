-- Migration 065: Insert TOPIK grammar patterns #165-179 (Intermediate level)
-- Ngữ pháp TOPIK #165-179 (Trung cấp) - Kết thúc TOPIK 2

-- ═══════════════════════════════════════════════════════════════════════════════
-- #165: A/V – 았/었어야 했는데
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 았/었어야 했는데',
  'at/eosseoya haenneunde',
  'Lẽ ra đã phải...',
  'intermediate',
  'regret',
  'Diễn tả sự tiếc nuối hoặc hối hận về việc đáng ra cần phải làm nhưng đã không làm.',
  'A/V + 았/었어야 했는데',
  '[
    {"korean": "어제 옷을 따뜻하게 입었어야 했는데 얇게 입고 나갔더니 감기에 걸렸어요.", "vietnamese": "Đáng ra hôm qua tôi phải mặc áo ấm, nhưng tôi đã mặc phong phanh rồi đi ra ngoài nên đã bị cảm cúm."},
    {"korean": "세일 기간 때문에 어제 사러 갔어야 했는데 오늘 갔더니 다 팔렸더라고요.", "vietnamese": "Vì là thời gian sale nên đáng ra hôm qua tôi phải đi mua mới đúng, hôm nay đi thì đã bán hết rồi."},
    {"korean": "지난 번 산 책이 너무 어려워서 못 읽어요. 내 수준에 맞는 책을 샀어야 했는데.", "vietnamese": "Sách tôi mua lần trước khó quá nên tôi không đọc được. Lẽ ra tôi nên mua sách đúng với trình độ của mình."},
    {"korean": "지난 여름 방학 때 제주도에 갔을 때 날씨가 좋았어야 했는데 비가 계속 와서 아쉬웠어요.", "vietnamese": "Vào kỳ nghỉ hè năm ngoái khi đến đảo Jeju lẽ ra thời tiết phải đẹp nhưng mà trời mưa liên tục nên thật đáng tiếc."},
    {"korean": "학교에 늦지 않기 위해서는 아침에 일찍 일어났어야 했는데 늦잠을 자고 말았어요.", "vietnamese": "Lẽ ra phải dậy sớm để không đi học muộn nhưng mà tôi đã ngủ quên mất."},
    {"korean": "네 결혼식에 갔어야 했는데 갑자기 해외 출장이 잡히는 바람에 못 갔어.", "vietnamese": "Lẽ ra tớ phải đến hôn lễ của cậu nhưng đột nhiên tớ bị bắt đi công tác nước ngoài nên đã không đi được."},
    {"korean": "음식을 맵지 않게 만들었어야 했는데 너무 매워서 친구들이 못 먹었어요.", "vietnamese": "Lẽ ra tôi nên làm đồ ăn không cay, nhưng làm cay quá nên mọi người không ăn được."}
  ]'::jsonb,
  ARRAY['V-(으)ㄹ걸 그랬다', '–았/었어야 하다']::TEXT[],
  ARRAY['regret', 'should_have', 'past_regret', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '옷을 따뜻하게 입__ 했는데 얇게 입고 나갔어요.', 'fill_blank', '["었어야", "을걸", "기로", "도록"]'::jsonb, 0,
  'Lẽ ra đã phải mặc → 입었어야 했는데.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 았/었어야 했는데' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '아침에 일찍 일어났__ 했는데 늦잠을 자고 말았어요.', 'fill_blank', '["어야", "으나", "기에", "도록"]'::jsonb, 0,
  'Lẽ ra đã phải dậy sớm → 일어났어야 했는데.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 았/었어야 했는데' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #166: A/V – 아/어 가지고
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 아/어 가지고',
  'a/eo gajigo',
  'Rồi thì, rồi... / vì nên...',
  'intermediate',
  'sequence',
  'Là hình thức văn nói của –아/어서. Ngoài thể hiện lí do vì nên, còn thể hiện thứ tự giữa các hành động trước sau hoặc hành động ở vế trước là phương tiện, nguyên nhân, lí do cho hành động ở vế sau. Có thể rút gọn thành –아/어 갖고.',
  'A/V + 아/어 가지고',
  '[
    {"korean": "요즘 일이 많아 가지고 아주 바빠요.", "vietnamese": "Dạo này nhiều việc nên rất bận."},
    {"korean": "김밥을 사 가지고 먹었어요.", "vietnamese": "Tôi mua kimbap rồi ăn."},
    {"korean": "돈을 빨리 모아 가지고 자동차를 사고 싶어요.", "vietnamese": "Tôi muốn tiết kiệm tiền nhanh chóng rồi mua ô tô."},
    {"korean": "등산 갈 때 제가 집에서 김밥을 만들어 가지고 갈게요.", "vietnamese": "Tôi làm gimbap ở nhà rồi sẽ mang theo khi đi leo núi."},
    {"korean": "할아버지께서 손자들을 불러 가지고 용돈을 주셨어요.", "vietnamese": "Ông gọi các cháu tới rồi cho chúng tiền tiêu vặt."}
  ]'::jsonb,
  ARRAY['–아/어서', '–고서']::TEXT[],
  ARRAY['spoken', 'sequence', 'reason', 'means', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '김밥을 사 __ 먹었어요.', 'fill_blank', '["가지고", "다가", "고서", "도록"]'::jsonb, 0,
  'Mua rồi ăn → 사 가지고 먹었어요.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어 가지고' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '요즘 일이 많아 __ 아주 바빠요.', 'fill_blank', '["가지고", "다가", "고서", "기에"]'::jsonb, 0,
  'Văn nói của –아/어서, lý do → 많아 가지고.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어 가지고' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #167: V – 아/어다가
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 아/어다가',
  'a/eo daga',
  'Rồi...',
  'intermediate',
  'sequence',
  'Diễn tả hành động ở mệnh đề sau xảy ra ở nơi khác với hành động ở mệnh đề trước. Hai hành động có quan hệ thời gian. Có thể sử dụng hình thức tỉnh lược –아/어다.',
  'V + 아/어다가 / V + 아/어다',
  '[
    {"korean": "마트에 가는 길에 쌀을 사다 주세요.", "vietnamese": "Trên đường đi siêu thị hãy mua gạo cho tớ nhé."},
    {"korean": "친구에게 비빔밥을 만들어다 줬어요.", "vietnamese": "Tôi làm bibimbap rồi cho bạn."},
    {"korean": "어제 시장에서 만두를 사다가 먹었습니다.", "vietnamese": "Hôm qua tôi mua bánh bao ở chợ rồi ăn ở chỗ khác."},
    {"korean": "과자를 만들어다가 학교 친구들이랑 같이 먹었어요.", "vietnamese": "Tôi làm kẹo rồi ăn cùng với các bạn trong trường."},
    {"korean": "영미야, 부엌에서 쟁반 좀 가져다 줄래?", "vietnamese": "Yeongmi à, bạn có thể mang cho tôi cái khay từ trong bếp được không?"},
    {"korean": "냉장고에 있으니까 꺼내다가 먹어.", "vietnamese": "Trong tủ lạnh có đấy, mang ra ăn đi con."},
    {"korean": "돈을 좀 찾아다가 하숙비를 내려고 해요.", "vietnamese": "Tôi định đi rút tiền để đóng tiền nhà trọ."}
  ]'::jsonb,
  ARRAY['–아/어 가지고', '–고서']::TEXT[],
  ARRAY['sequence', 'different_place', 'movement', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '어제 시장에서 만두를 사__ 먹었습니다.', 'fill_blank', '["다가", "가지고", "고서", "도록"]'::jsonb, 0,
  'Mua ở chợ rồi ăn nơi khác → 사다가 먹었습니다.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어다가' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '부엌에서 쟁반 좀 가져__ 줄래?', 'fill_blank', '["다", "고서", "기에", "도록"]'::jsonb, 0,
  'Dạng rút gọn –어다 → 가져다 줄래.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어다가' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #168: V - 고서
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V - 고서',
  'goseo',
  'Sau khi...',
  'intermediate',
  'sequence',
  'Diễn tả hành động ở mệnh đề trước kết thúc thì hành động ở mệnh đề sau mới xảy ra. Có mối quan hệ trước sau giữa hai hành động và nhấn mạnh sự liệt kê trình tự sự việc.',
  'V + 고서',
  '[
    {"korean": "저는 매일 아침을 먹고서 학교에 갑니다.", "vietnamese": "Sáng nào tôi cũng ăn sáng rồi đến trường."},
    {"korean": "수업이 끝나고서 친구와 같이 쇼핑해요.", "vietnamese": "Sau khi tiết học kết thúc tôi cùng bạn đi mua sắm."},
    {"korean": "합격 소식을 듣고서 매우 기뻤어요.", "vietnamese": "Sau khi nghe tin thi đỗ tôi đã rất vui sướng."},
    {"korean": "급한 일을 먼저 끝내고서 이야기합시다.", "vietnamese": "Hoàn thành việc gấp trước rồi cùng nhau nói chuyện nào."},
    {"korean": "창문을 열고서 상쾌한 공기를 마셔 보세요.", "vietnamese": "Mở cửa sổ rồi thử hít thở không khí trong lành xem sao."},
    {"korean": "가게에서 돈만 내고서 물건은 안 가지고 나왔어요.", "vietnamese": "Tôi trả tiền ở cửa hàng rồi đi ra mà quên không đem theo đồ."},
    {"korean": "저는 아침마다 조깅을 하고서 학교에 옵니다.", "vietnamese": "Sáng nào tôi cũng tập thể dục rồi mới đến trường."},
    {"korean": "책을 읽고서 친구들과 토론을 했어요.", "vietnamese": "Sau khi đọc sách tôi đã thảo luận cùng với bạn bè."}
  ]'::jsonb,
  ARRAY['–고', '–아/어 가지고', '–아/어다가']::TEXT[],
  ARRAY['sequence', 'after_action', 'order', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '아침을 먹__ 학교에 갑니다.', 'fill_blank', '["고서", "다가", "가지고", "도록"]'::jsonb, 0,
  'Sau khi ăn sáng → 먹고서.'
FROM public.grammar_patterns WHERE pattern = 'V - 고서' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '합격 소식을 듣__ 매우 기뻤어요.', 'fill_blank', '["고서", "다가", "가지고", "기에"]'::jsonb, 0,
  'Sau khi nghe tin → 듣고서.'
FROM public.grammar_patterns WHERE pattern = 'V - 고서' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #169: N – 만에
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – 만에',
  'mane',
  'Sau...',
  'intermediate',
  'time',
  'Diễn tả hành động xảy ra sau một khoảng thời gian nào đó.',
  'N + 만에',
  '[
    {"korean": "하노이에서 비행기를 타니 2 시간 만에 호치민시에 도착했어요.", "vietnamese": "Ở Hà Nội đi máy bay sau 2 tiếng đã đến TP.HCM rồi."},
    {"korean": "숙제를 하기 시작한지 2 시간 만에 다 했어요.", "vietnamese": "Sau 2 tiếng tôi mới hoàn thành xong bài tập."},
    {"korean": "5 년 만에 크리스마스에 눈이 오니까 기분이 좋아요.", "vietnamese": "Sau 5 năm rồi tuyết mới rơi vào giáng sinh nên tâm trạng thật tốt."},
    {"korean": "아이가 잠이 든 지 30 분 만에 다시 깼어요.", "vietnamese": "Em bé ngủ được 30 phút rồi tỉnh dậy."},
    {"korean": "얼마 만에 한국에 다시 오셨어요?", "vietnamese": "Bao lâu bạn mới lại đến Hàn Quốc vậy?"},
    {"korean": "거의 십 년 만에 다시 중학교 때 친구를 만난 것 같아요.", "vietnamese": "Gần như phải sau 10 năm rồi tôi mới gặp lại bạn cấp hai."}
  ]'::jsonb,
  ARRAY['N 동안', 'N 후에']::TEXT[],
  ARRAY['time', 'after_period', 'duration', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '2 시간 __ 호치민시에 도착했어요.', 'fill_blank', '["만에", "동안", "부터", "까지"]'::jsonb, 0,
  'Sau một khoảng thời gian → 2 시간 만에.'
FROM public.grammar_patterns WHERE pattern = 'N – 만에' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '거의 십 년 __ 친구를 만난 것 같아요.', 'fill_blank', '["만에", "동안", "부터", "까지"]'::jsonb, 0,
  'Sau gần 10 năm → 십 년 만에.'
FROM public.grammar_patterns WHERE pattern = 'N – 만에' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #170: V – 아/어지다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 아/어지다',
  'a/eo jida',
  'Được, bị...',
  'intermediate',
  'passive',
  'Là dạng bị động, hành động nào đó tự xảy ra hoặc bị ảnh hưởng để đạt được trạng thái. Theo lý thuyết các động từ có dạng bị động không kết hợp với cấu trúc này, tuy nhiên trong khẩu ngữ một số từ như 끊기다 = 끊어지다, 쓰이다 = 써지다 vẫn được chấp nhận.',
  'V + 아/어지다',
  '[
    {"korean": "꽂아져 있는 책들은 모두 승규가 정리한 것이다.", "vietnamese": "Những quyển sách được cắm/xếp ở đó tất cả là do Seung Gyu sắp xếp."},
    {"korean": "요새 사람들의 관심은 오로지 올림픽에 모아져 있다.", "vietnamese": "Dạo này sự quan tâm của mọi người đang đổ dồn về thế vận hội Olympic."},
    {"korean": "일정이 정해졌어요?", "vietnamese": "Lịch trình đã được quyết định xong chưa?"},
    {"korean": "요즘 운동을 해서 살이 많이 빠졌어요.", "vietnamese": "Dạo này tôi tập thể dục nên đã giảm cân rất nhiều."},
    {"korean": "공부를 하고 있는데 갑자기 방에 불이 꺼졌어요.", "vietnamese": "Tôi đang học bài thì đột nhiên điện ở phòng bị tắt đi."},
    {"korean": "전화가 갑자기 끊어져서 통화를 길게 하지 못했어요.", "vietnamese": "Điện thoại đột nhiên bị ngắt nên đã không thể kéo dài cuộc gọi được."}
  ]'::jsonb,
  ARRAY['피동사', '–게 되다']::TEXT[],
  ARRAY['passive', 'state_change', 'result', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '일정이 정해__어요?', 'fill_blank', '["졌", "갔", "왔", "기에"]'::jsonb, 0,
  'Bị/được quyết định → 정해졌어요.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어지다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '갑자기 방에 불이 꺼__어요.', 'fill_blank', '["졌", "갔", "왔", "도록"]'::jsonb, 0,
  'Điện bị tắt → 꺼졌어요.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어지다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #171: A/V – 게 하다 / 게 만들다 / 도록 하다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 게 하다 / 게 만들다 / 도록 하다',
  'ge hada / ge mandeulda / dorok hada',
  'Cho..., làm cho..., cho phép...',
  'intermediate',
  'causative',
  'Là dạng gây khiến, làm cho người khác hành động hoặc làm trạng thái thay đổi. Trong câu không có bổ ngữ thì đối tượng gắn 을/를, còn nếu có thì gắn 에게. Ngoài ra còn có ý nghĩa cho phép làm gì đó, lúc này đối tượng lại gắn 이/가. Khi phủ định không dùng với 안 mà dùng với 못.',
  'A/V + 게 하다 / A/V + 게 만들다 / V + 도록 하다',
  '[
    {"korean": "어머니는 동생에게 약을 먹게 하셨다.", "vietnamese": "Mẹ tôi bắt em uống thuốc."},
    {"korean": "영수는 동생에게 청소를 하게 했다.", "vietnamese": "Young-su sai em dọn dẹp."},
    {"korean": "선생님은 반장을 제외한 다른 아이들은 교실을 나가게 하셨다.", "vietnamese": "Giáo viên đã cho những học sinh khác ra khỏi lớp trừ lớp trưởng."},
    {"korean": "민준은 아들에게 책을 많이 읽게 해요.", "vietnamese": "Minjun bắt con trai phải đọc nhiều sách."},
    {"korean": "선생님은 학생들을 15 분 동안 쉬게 만드셨어요.", "vietnamese": "Thầy giáo cho học sinh nghỉ trong 15 phút."},
    {"korean": "저는 부모님을 행복하게 했어요.", "vietnamese": "Tôi khiến cho ba mẹ hạnh phúc."},
    {"korean": "민준은 아들에게 오후 여덟 시 전에만 텔레비전을 보게 한다.", "vietnamese": "Minjun chỉ cho phép con trai xem tivi trước 8 giờ tối."},
    {"korean": "흐엉 씨는 아이가 과자를 못 먹게 했어요.", "vietnamese": "Hương không cho con ăn kẹo."},
    {"korean": "어머니는 아이가 한 시간 동안 게임을 놀게 해요.", "vietnamese": "Mẹ cho phép tụi nhỏ chơi game trong vòng một giờ."},
    {"korean": "부모님은 제가 밤늦게 못 나가게 하셨어요.", "vietnamese": "Bố mẹ tôi không cho phép tôi đi ra ngoài vào buổi khuya."}
  ]'::jsonb,
  ARRAY['사동사', '–도록 하다']::TEXT[],
  ARRAY['causative', 'permission', 'make_someone_do', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '어머니는 동생에게 약을 먹__ 하셨다.', 'fill_blank', '["게", "도록", "기에", "만에"]'::jsonb, 0,
  'Gây khiến → 먹게 하셨다.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 게 하다 / 게 만들다 / 도록 하다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '흐엉 씨는 아이가 과자를 못 먹__ 했어요.', 'fill_blank', '["게", "도록", "기에", "만에"]'::jsonb, 0,
  'Phủ định gây khiến dùng 못 + 게 하다 → 못 먹게 했어요.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 게 하다 / 게 만들다 / 도록 하다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #172: V - (으)ㄹ 생각도 못하다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V - (으)ㄹ 생각도 못하다',
  '(eu)l saenggakdo mothada',
  'Chưa dám nghĩ tới...',
  'intermediate',
  'inability',
  'Biểu hiện không dám hoặc chưa dám nghĩ tới làm một việc gì đó.',
  'V + (으)ㄹ 생각도 못하다',
  '[
    {"korean": "집이 너무 비싸서 살 생각도 못하겠어요.", "vietnamese": "Vì nhà đắt quá nên không dám nghĩ đến việc mua nhà."},
    {"korean": "일이 많아서 여행 갈 생각도 못 합니다.", "vietnamese": "Dạo này nhiều việc quá nên không thể nghĩ đến việc đi du lịch."},
    {"korean": "요즘은 바빠서 여자 친구 만날 생각도 못 해요.", "vietnamese": "Dạo này bận rộn quá nên không thể nghĩ đến việc gặp bạn gái."},
    {"korean": "시험 공부하느라 놀 생각도 못 했어.", "vietnamese": "Vì cứ phải ôn thi nên không dám nghĩ đến việc đi chơi."}
  ]'::jsonb,
  ARRAY['–(으)ㄹ 수 없다', '–기는커녕']::TEXT[],
  ARRAY['inability', 'not_even_think', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '집이 너무 비싸서 살 __도 못하겠어요.', 'fill_blank', '["생각", "수밖", "뿐", "만에"]'::jsonb, 0,
  'Không dám nghĩ đến việc mua → 살 생각도 못하다.'
FROM public.grammar_patterns WHERE pattern = 'V - (으)ㄹ 생각도 못하다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '일이 많아서 여행 갈 __도 못 합니다.', 'fill_blank', '["생각", "수밖", "뿐", "만에"]'::jsonb, 0,
  'Không thể nghĩ đến việc đi du lịch → 갈 생각도 못하다.'
FROM public.grammar_patterns WHERE pattern = 'V - (으)ㄹ 생각도 못하다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #173: V - 기나 하다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V - 기나 하다',
  'gina hada',
  'Cố mà, tập trung vào...',
  'intermediate',
  'command',
  'Cấu trúc dùng khi không vừa lòng nhưng lại mong muốn người nghe hay người khác thực hiện hành động mà từ ngữ phía trước thể hiện.',
  'V + 기나 하다',
  '[
    {"korean": "어른들 말씀하시는데 끼어들지 말고 넌 조용히 듣기나 해.", "vietnamese": "Người lớn nói thì đừng có mà nói chen vào mà trật tự nghe đi."},
    {"korean": "내 아들이 공부를 잘하는 것은 바라지도 않고, 그저 열심히 하기나 하면 좋겠어.", "vietnamese": "Tôi chẳng mong thằng con nó học giỏi, chỉ cần nó làm việc chăm chỉ là tốt lắm rồi."},
    {"korean": "쓸데없는 소리 하지 말고 가서 자기나 해.", "vietnamese": "Đừng nói nhảm nữa cố mà ngủ đi."},
    {"korean": "딴 데로 새지 말고 빨리 따라오기나 해.", "vietnamese": "Đừng đi đâu khác cố mà theo tôi đi."},
    {"korean": "반찬 투정하지 말고 먹기나 해.", "vietnamese": "Đừng có càu nhàu về đồ ăn nữa tập trung mà ăn đi."}
  ]'::jsonb,
  ARRAY['–기나 하면', '–기만 하다']::TEXT[],
  ARRAY['command', 'dissatisfaction', 'focus_on', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '끼어들지 말고 조용히 듣__ 해.', 'fill_blank', '["기나", "기에", "도록", "만에"]'::jsonb, 0,
  'Không hài lòng, bảo tập trung nghe → 듣기나 해.'
FROM public.grammar_patterns WHERE pattern = 'V - 기나 하다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '쓸데없는 소리 하지 말고 가서 자__ 해.', 'fill_blank', '["기나", "기에", "도록", "만에"]'::jsonb, 0,
  'Cố mà ngủ đi → 자기나 해.'
FROM public.grammar_patterns WHERE pattern = 'V - 기나 하다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #174: A/V – (으)면 A/V – (으)ㄹ수록
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)면 A/V – (으)ㄹ수록',
  '(eu)myeon (eu)lsurok',
  'Càng... càng...',
  'intermediate',
  'comparison',
  'Biểu hiện một trạng thái nào đó càng lúc càng theo chiều hướng của động từ, tính từ trước đó. Có thể lược bỏ (으)면.',
  'A/V + (으)면 A/V + (으)ㄹ수록',
  '[
    {"korean": "이 그림은 보면 볼수록 이해하기가 어려워요.", "vietnamese": "Bức tranh đó càng nhìn càng khó hiểu."},
    {"korean": "이 옷은 처음에는 별로였는데 보면 볼수록 예쁘네요.", "vietnamese": "Cái áo đó ban đầu thì thấy không đẹp nhưng càng nhìn thì lại càng thấy đẹp."},
    {"korean": "하면 할수록 조금씩 감이 더 오는 것 같아요.", "vietnamese": "Càng làm càng quen tay."},
    {"korean": "나이가 어리면 어릴수록 외국어를 빨리 배울 수가 있어요.", "vietnamese": "Tuổi càng trẻ thì học ngoại ngữ càng nhanh."},
    {"korean": "돈이 많으면 많을수록 걱정도 많아져요.", "vietnamese": "Tiền càng nhiều thì càng có nhiều nỗi lo."},
    {"korean": "싸면 쌀수록 품질이 떨어지는 것 같아요.", "vietnamese": "Có lẽ càng rẻ thì chất lượng càng không tốt."}
  ]'::jsonb,
  ARRAY['–(으)ㄹ수록']::TEXT[],
  ARRAY['comparison', 'gradual_change', 'the_more_the_more', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '이 그림은 보면 볼__ 이해하기가 어려워요.', 'fill_blank', '["수록", "기에", "도록", "만에"]'::jsonb, 0,
  'Càng nhìn càng → 보면 볼수록.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면 A/V – (으)ㄹ수록' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '돈이 많으면 많__ 걱정도 많아져요.', 'fill_blank', '["을수록", "기에", "도록", "만에"]'::jsonb, 0,
  'Càng nhiều càng → 많으면 많을수록.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면 A/V – (으)ㄹ수록' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #175: N – 에 의하면 / 에 따르면
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – 에 의하면 / 에 따르면',
  'e uihamyeon / e ttareumyeon',
  'Theo như...',
  'intermediate',
  'citation',
  'Biểu hiện nguồn gốc của trích dẫn. Kết hợp với câu gián tiếp hoặc đuôi câu trong văn mô tả hiện tượng như 것으로 나타나다, 조사되다.',
  'N + 에 의하면 / N + 에 따르면',
  '[
    {"korean": "일기 예보에 의하면 내일 비가 오겠대요.", "vietnamese": "Theo dự báo thời tiết thì ngày mai trời sẽ mưa."},
    {"korean": "이번 조사 결과에 의하면 1인 가구가 계속 증가하고 있는 것으로 나타났다.", "vietnamese": "Theo kết quả khảo sát lần này thì số hộ gia đình 1 thành viên đang liên tục tăng lên."},
    {"korean": "들리는 소문에 의하면 우리 회사의 경영진들이 대거 교체될 거라고 해요.", "vietnamese": "Theo như tin đồn được nghe, ban điều hành của công ty chúng ta sẽ được thay thế lớn."},
    {"korean": "연구 결과에 의하면 성인의 적절한 수면 시간은 7시간이라고 합니다.", "vietnamese": "Theo như kết quả nghiên cứu, thời gian ngủ phù hợp ở người lớn là 7 tiếng."},
    {"korean": "신문 기사에 따르면 요즘 출산율이 떨어지고 있다고 합니다.", "vietnamese": "Theo như bài báo thì dạo này tỷ lệ sinh đang giảm."},
    {"korean": "일기예보에 따르면 오늘 오후부터 전국에 비가 온다고 합니다.", "vietnamese": "Theo dự báo thời tiết thì bắt đầu từ chiều hôm nay trời sẽ mưa trên toàn quốc."}
  ]'::jsonb,
  ARRAY['–에 의하면', '–에 따르면']::TEXT[],
  ARRAY['citation', 'source', 'according_to', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '일기 예보__ 의하면 내일 비가 오겠대요.', 'fill_blank', '["에", "로", "를", "가"]'::jsonb, 0,
  'Nguồn trích dẫn → 일기 예보에 의하면.'
FROM public.grammar_patterns WHERE pattern = 'N – 에 의하면 / 에 따르면' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '신문 기사에 __ 요즘 출산율이 떨어지고 있다고 합니다.', 'fill_blank', '["따르면", "의해", "만에", "불과하면"]'::jsonb, 0,
  'Theo như bài báo → 기사에 따르면.'
FROM public.grammar_patterns WHERE pattern = 'N – 에 의하면 / 에 따르면' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #176: N – 에 의해
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – 에 의해',
  'e uihae',
  'Theo như... / do... / bởi...',
  'intermediate',
  'cause',
  'Do sự việc nào đó, hoặc lấy sự việc nào đó làm căn cứ thì hành động của vế sau được thực hiện. Vị ngữ vế sau thường là dạng bị động. Biểu hiện nguyên nhân dưới dạng 에 의한. Khi gắn với danh từ chỉ người, mang ý nghĩa hành động được thực hiện bởi ai đó và có thể thay thế cho 에게/한테 trong câu bị động.',
  'N + 에 의해 / N + 에 의한',
  '[
    {"korean": "투표에 의하여 반장은 선출되었다.", "vietnamese": "Lớp trưởng đã được bầu ra bằng cách bỏ phiếu."},
    {"korean": "모든 것은 규칙에 의해서 결정합시다.", "vietnamese": "Chúng ta hãy quyết định mọi điều theo như quy định."},
    {"korean": "군대에서는 지휘관의 명령에 의해 일이 행해진다.", "vietnamese": "Trong quân đội công việc được tiến hành theo mệnh lệnh của chỉ huy."},
    {"korean": "경찰에 의해서 그 사실이 밝혀졌습니다.", "vietnamese": "Sự thật đó đã được làm sáng tỏ bởi cảnh sát."},
    {"korean": "심장 질환에 의한 사망률이 꽤 높다.", "vietnamese": "Tỉ lệ tử vong do bệnh tim khá cao."}
  ]'::jsonb,
  ARRAY['–에 의하면', '–때문에', '–로 인해']::TEXT[],
  ARRAY['cause', 'by', 'basis', 'passive', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '투표__ 의하여 반장은 선출되었다.', 'fill_blank', '["에", "로", "를", "가"]'::jsonb, 0,
  'Căn cứ/phương thức → 투표에 의하여.'
FROM public.grammar_patterns WHERE pattern = 'N – 에 의해' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '경찰에 __ 그 사실이 밝혀졌습니다.', 'fill_blank', '["의해서", "의하면", "따르면", "만에"]'::jsonb, 0,
  'Bởi cảnh sát trong câu bị động → 경찰에 의해서.'
FROM public.grammar_patterns WHERE pattern = 'N – 에 의해' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #177: V – 아/어 가다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 아/어 가다',
  'a/eo gada',
  'Đang dần, vẫn sẽ... / gần xong...',
  'intermediate',
  'progression',
  'Vĩ tố kết thúc biểu hiện hành động nào đó đang tiếp diễn và sẽ tiếp diễn trạng thái trong tương lai. Kết hợp với 거의 biểu hiện ý nghĩa gần làm gì đó xong. Ở dạng 아/어 가면서 diễn tả quá trình diễn ra song song.',
  'V + 아/어 가다 / V + 아/어 가면서',
  '[
    {"korean": "앞으로는 혼자의 힘으로 살아 갈 겁니다.", "vietnamese": "Sau này tôi vẫn sẽ tiếp tục sống bằng chính sức mình."},
    {"korean": "앞으로 그 나라의 경제가 더 발전해 갈 거예요.", "vietnamese": "Sau này nền kinh tế của đất nước đó sẽ phát triển hơn."},
    {"korean": "죽어 가는 환경을 살립시다.", "vietnamese": "Hãy cứu lấy môi trường đang chết dần."},
    {"korean": "이번 학기가 거의 끝나 가서 아쉬워요.", "vietnamese": "Học kì này đang gần kết thúc nên tôi rất tiếc nuối."},
    {"korean": "숙제를 다해 가니까 조금만 기다려 주세요.", "vietnamese": "Vì tôi làm bài tập sắp xong nên hãy đợi một lát nhé."},
    {"korean": "세상을 살아 가면서 삶의 지혜를 조금씩 알아가는 것 같아요.", "vietnamese": "Khi đang sống trên đời có lẽ dần dần sẽ tìm hiểu được tri thức cuộc sống."},
    {"korean": "나갈 준비를 거의 다 해 갈 때쯤 친구가 집에 왔다.", "vietnamese": "Khi đang chuẩn bị cho việc ra ngoài gần xong thì đứa bạn đã về đến nhà."},
    {"korean": "밤 12 시가 다 되어 가는데 아직도 집에 오지 않았어요.", "vietnamese": "Sắp đến 12h đêm rồi mà anh ấy vẫn chưa về nhà."},
    {"korean": "밥이 다 되어 가서 상을 차리기 시작했다.", "vietnamese": "Cơm đang gần chín nên tôi đã bắt đầu chuẩn bị bàn ăn."},
    {"korean": "세월이 흘러 가면서 나도 성격이 많이 변했다.", "vietnamese": "Khi năm tháng đang dần trôi thì tính cách tôi cũng đã thay đổi nhiều."}
  ]'::jsonb,
  ARRAY['–아/어 오다', '–고 있다']::TEXT[],
  ARRAY['progression', 'future_continuation', 'nearly_finished', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그 나라의 경제가 더 발전해 __ 거예요.', 'fill_blank', '["갈", "올", "진", "된"]'::jsonb, 0,
  'Tiếp diễn về tương lai → 발전해 갈 거예요.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어 가다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '이번 학기가 거의 끝나 __ 아쉬워요.', 'fill_blank', '["가서", "와서", "져서", "기에"]'::jsonb, 0,
  'Gần kết thúc → 끝나 가서.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어 가다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #178: V – 아/어 오다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 아/어 오다',
  'a/eo oda',
  'Vẫn cứ...',
  'intermediate',
  'continuation',
  'Diễn tả hành động hoặc trạng thái nào đó liên tục duy trì từ quá khứ đến hiện tại và có thể vẫn đang tiếp tục ở hiện tại.',
  'V + 아/어 오다',
  '[
    {"korean": "지금까지 1 년 동안 여행해 오면서 제일 좋았던 곳이 어디예요?", "vietnamese": "Trong suốt một năm đi du lịch đến giờ bạn thấy nơi nào là thích nhất?"},
    {"korean": "세상을 살아 오면서 깨달은 점이 있다면, 실패는 성공의 어머니라는 것이다.", "vietnamese": "Nếu có điều gì đã ngộ ra khi sống đến giờ thì đó là việc thất bại là mẹ của thành công."},
    {"korean": "그 과학자는 10 년 동안 유전공학에 대해 연구해 왔다.", "vietnamese": "Nhà khoa học đó đã nghiên cứu về công nghệ di truyền trong suốt 10 năm đến giờ."},
    {"korean": "취업을 준비하기 위해 외국어를 계속 공부해 왔어요.", "vietnamese": "Vì chuẩn bị xin việc nên trước giờ tôi vẫn liên tục học ngoại ngữ."},
    {"korean": "저는 일기를 10 년 동안 써 왔고 앞으로도 계속 써 갈 거예요.", "vietnamese": "Suốt 10 năm qua tôi vẫn viết nhật ký và sau này tôi cũng vẫn sẽ viết tiếp."}
  ]'::jsonb,
  ARRAY['–아/어 가다', '–고 있다']::TEXT[],
  ARRAY['continuation', 'past_to_present', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그 과학자는 10 년 동안 연구해 __.', 'fill_blank', '["왔다", "갔다", "졌다", "했다"]'::jsonb, 0,
  'Duy trì từ quá khứ đến hiện tại → 연구해 왔다.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어 오다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '외국어를 계속 공부해 __어요.', 'fill_blank', '["왔", "갔", "졌", "했"]'::jsonb, 0,
  'Vẫn liên tục học đến nay → 공부해 왔어요.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어 오다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #179: V – 기에
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 기에',
  'gie',
  'Cho, đối với... / theo như...',
  'intermediate',
  'evaluation',
  'Diễn tả kinh nghiệm hoặc quan điểm để đánh giá việc nào đó. Đi với các tính từ ở vế sau để mô tả đánh giá. Khi gắn với 생각하다, 듣다, 보다 có nghĩa theo như suy nghĩ, nghe thấy, nhìn thấy.',
  'V + 기에',
  '[
    {"korean": "카드보다 현금으로 물건 사기에는 너무 비싸요.", "vietnamese": "Đối với việc mua đồ bằng tiền mặt thì đắt hơn so với thẻ."},
    {"korean": "그 사람은 고등생이라고 하기에는 너무 나이가 많아요.", "vietnamese": "Người đó đã quá tuổi đối với việc gọi là học sinh trung học."},
    {"korean": "지금 전화하기에 너무 늦지 않았어요?", "vietnamese": "Bây giờ có phải là quá muộn cho việc gọi điện không?"},
    {"korean": "이 소설책은 재미있지만 외국 학생들이 읽기에는 좀 어려울 것 같아요.", "vietnamese": "Cuốn tiểu thuyết này rất thú vị nhưng có vẻ hơi khó cho sinh viên nước ngoài đọc."},
    {"korean": "제가 알기에는 내년부터 대학 시험이 없어진다고 합니다.", "vietnamese": "Theo như tôi được biết, kỳ thi đại học sẽ không còn được tổ chức bắt đầu từ năm tới."},
    {"korean": "제가 생각하기에는 대통령의 계획을 따르는 것이 좋겠어요.", "vietnamese": "Theo như suy nghĩ của tôi thì sẽ tốt hơn nếu làm theo kế hoạch của tổng thống."},
    {"korean": "그 집은 조금 좁아서 다섯 식구가 살기에 좀 불편한 것 같아요.", "vietnamese": "Căn nhà đó hơi nhỏ nên có vẻ hơi bất tiện cho 5 người chung sống."}
  ]'::jsonb,
  ARRAY['–기에', '–는 데']::TEXT[],
  ARRAY['evaluation', 'viewpoint', 'experience', 'according_to_thought', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '지금 전화하__ 너무 늦지 않았어요?', 'fill_blank', '["기에", "도록", "만에", "고서"]'::jsonb, 0,
  'Đánh giá đối với việc gọi điện → 전화하기에.'
FROM public.grammar_patterns WHERE pattern = 'V – 기에' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '제가 알__ 내년부터 대학 시험이 없어진다고 합니다.', 'fill_blank', '["기에는", "도록", "만에", "고서"]'::jsonb, 0,
  'Theo như tôi biết → 제가 알기에는.'
FROM public.grammar_patterns WHERE pattern = 'V – 기에' AND topik_level = 'TOPIK II';
