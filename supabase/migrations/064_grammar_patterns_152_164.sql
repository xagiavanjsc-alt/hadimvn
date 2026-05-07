-- Migration 064: Insert TOPIK grammar patterns #152-164 (Intermediate level)
-- Ngữ pháp TOPIK #152-164 (Trung cấp)

-- ═══════════════════════════════════════════════════════════════════════════════
-- #152: A/V – 얼마나 (으)ㄴ/는지 모르다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 얼마나 (으)ㄴ/는지 모르다',
  'eolmana (eu)n/neunji moreuda',
  'Không biết ... bao nhiêu, đến nhường nào',
  'intermediate',
  'emphasis',
  'Nhấn mạnh mức độ một sự việc hay trạng thái nào đó. Ngoài ra ở dạng 얼마나/어찌나 + (으)ㄴ/는지 có nghĩa vì quá... nên.',
  '얼마나 + A + (으)ㄴ지 모르다 / 얼마나 + V + 는지 모르다',
  '[
    {"korean": "제주도 경치가 얼마나 아름다운지 몰라요. 한번 가 보세요.", "vietnamese": "Bạn không biết đảo Jeju đẹp đến nhường nào đâu. Hãy đi thử một lần đi."},
    {"korean": "지수 씨가 얼마나 열심히 공부하는지 몰라요.", "vietnamese": "Bạn không biết Jisu chăm học đến nhường nào đâu."},
    {"korean": "우리 얼마나 많이 여행했는지 몰라요.", "vietnamese": "Chúng tôi đã đi du lịch nhiều không biết bao nhiêu mà kể."},
    {"korean": "영호 씨가 축구를 얼마나 자주 하는지 몰라요.", "vietnamese": "Bạn không biết Youngho chơi bóng đá thường xuyên đến nhường nào đâu."},
    {"korean": "유리 씨가 얼마나 많이 먹는지 몰라요.", "vietnamese": "Yu-ri ăn nhiều đến mức không tưởng nổi."},
    {"korean": "많이 도와줘서 얼마나 고마운지 몰라요.", "vietnamese": "Bạn giúp đỡ tôi nhiều quá, không biết cảm ơn bao nhiêu mới đủ đây."}
  ]'::jsonb,
  ARRAY['어찌나 –(으)ㄴ/는지', '–(으)ㄴ/는지 모르다']::TEXT[],
  ARRAY['emphasis', 'degree', 'exclamation', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '제주도 경치가 __ 아름다운지 몰라요.', 'fill_blank', '["얼마나", "아무리", "별로", "그냥"]'::jsonb, 0,
  'Nhấn mạnh mức độ → 얼마나 아름다운지 몰라요.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 얼마나 (으)ㄴ/는지 모르다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '지수 씨가 얼마나 열심히 공부__ 몰라요.', 'fill_blank', '["하는지", "한지", "할지", "했는지"]'::jsonb, 0,
  'Động từ hiện tại dùng –는지 → 공부하는지.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 얼마나 (으)ㄴ/는지 모르다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #153: A/V – (으)ㄹ 수밖에 없다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ 수밖에 없다',
  '(eu)l subakke eopda',
  'Chỉ còn cách..., chỉ có thể...',
  'intermediate',
  'necessity',
  'Mang ý nghĩa trong tình huống nào đó chỉ có một cách duy nhất, ngoài cách đó ra không có phương pháp nào khác.',
  'A/V + (으)ㄹ 수밖에 없다',
  '[
    {"korean": "짠 음식을 많이 먹었으니까 목이 마를 수밖에 없어요.", "vietnamese": "Vì ăn nhiều đồ ăn mặn nên chỉ có thể bị khát nước."},
    {"korean": "장학금을 받으려면 열심히 공부할 수밖에 없어요.", "vietnamese": "Nếu muốn nhận học bổng thì chỉ có cách học chăm chỉ."},
    {"korean": "현금이 없어서 카드로 계산할 수밖에 없었다.", "vietnamese": "Vì không có tiền mặt nên chỉ còn cách là thanh toán bằng thẻ."},
    {"korean": "시간이 없어서 택시를 탈 수밖에 없어요.", "vietnamese": "Vì không còn thời gian nên chỉ còn cách là bắt taxi."},
    {"korean": "등록금을 벌어야 해서 피곤해도 아르바이트를 할 수밖에 없어요.", "vietnamese": "Vì phải chi trả tiền học phí nên dù có mệt thì cũng không còn cách nào khác là phải đi làm thêm."},
    {"korean": "다리를 다쳐서 등산 약속을 취소할 수밖에 없어요.", "vietnamese": "Do chân bị đau nên không có cách nào khác đành phải hủy cuộc hẹn đi leo núi."},
    {"korean": "아이를 봐줄 사람이 없어서 어린이 집에 보낼 수밖에 없어요.", "vietnamese": "Không có người để trông chừng lũ nhỏ nên không có cách nào ngoài việc gửi chúng đến nhà trẻ."}
  ]'::jsonb,
  ARRAY['–아/어야 하다', '–지 않을 수 없다']::TEXT[],
  ARRAY['necessity', 'only_choice', 'inevitability', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '시간이 없어서 택시를 탈 __ 없어요.', 'fill_blank', '["수밖에", "뿐", "만큼", "도록"]'::jsonb, 0,
  'Chỉ còn cách → 탈 수밖에 없어요.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 수밖에 없다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '장학금을 받으려면 열심히 공부할 __ 없어요.', 'fill_blank', '["수밖에", "뿐", "만큼", "도록"]'::jsonb, 0,
  'Không còn cách khác → 공부할 수밖에 없어요.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 수밖에 없다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #154: A/V – (으)ㄹ 뿐이다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ 뿐이다',
  '(eu)l ppunida',
  'Chỉ...',
  'intermediate',
  'limitation',
  'Chỉ có hành động hay trạng thái nào đó, ngoài ra không có hành động hay trạng thái nào khác. Nhấn mạnh ý nghĩa của cả mệnh đề phía trước. Danh từ dùng N + 뿐이다. Cũng có thể đứng ở giữa câu làm vĩ tố liên kết và có thể kết hợp thêm với trợ từ 만.',
  'A/V + (으)ㄹ 뿐이다 / N + 뿐이다',
  '[
    {"korean": "저는 그 사람의 이름만 알 뿐이에요.", "vietnamese": "Tôi chỉ biết tên người đó."},
    {"korean": "가: 수업이 끝난 후에 하고 싶은 일이 뭐해요? 나: 집에 가서 자고 싶을 뿐이에요.", "vietnamese": "가: Sau khi tan học bạn muốn làm gì? 나: Tôi chỉ muốn về nhà rồi ngủ thôi."},
    {"korean": "진수 씨에 대한 이야기는 소문으로만 들었을 뿐이에요.", "vietnamese": "Chuyện về Jinsu thì tôi mới chỉ nghe tin đồn thôi."},
    {"korean": "그는 키만 작을 뿐 성격도 좋고 능력도 있는 편이다.", "vietnamese": "Anh ấy chỉ thấp thôi còn thuộc diện tốt và cũng có năng lực."},
    {"korean": "이곳은 생선만 쌀 뿐 다른 식품들이 비싸요.", "vietnamese": "Nơi đây chỉ cá là rẻ còn các thực phẩm khác thì đắt."},
    {"korean": "시험에 합격하기만 바랄 뿐이에요.", "vietnamese": "Chỉ mong rằng sẽ đậu kì thi thôi."}
  ]'::jsonb,
  ARRAY['N – 에 불과하다', '–기만 하다']::TEXT[],
  ARRAY['limitation', 'only', 'emphasis', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '저는 그 사람의 이름만 알 __이에요.', 'fill_blank', '["뿐", "수밖", "만큼", "도록"]'::jsonb, 0,
  'Chỉ biết → 알 뿐이에요.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 뿐이다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '집에 가서 자고 싶을 __이에요.', 'fill_blank', '["뿐", "수밖", "정도", "지경"]'::jsonb, 0,
  'Chỉ muốn ngủ → 자고 싶을 뿐이에요.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 뿐이다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #155: N – 에 불과하다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – 에 불과하다',
  'e bulgwahada',
  'Không quá, chỉ...',
  'intermediate',
  'limitation',
  'Biểu hiện không quá, không hơn danh từ đứng trước đó.',
  'N + 에 불과하다',
  '[
    {"korean": "세계 최고의 부자가 된다는 바람은 허황된 꿈에 불과하다.", "vietnamese": "Giấc mơ trở thành người giàu nhất thế giới chỉ là giấc mơ viển vông."},
    {"korean": "이번 외국어 시험의 합격률은 겨우 십 퍼센트에 불과했다.", "vietnamese": "Tỉ lệ đậu kỳ thi ngoại ngữ lần này không quá 10%."},
    {"korean": "백만 원에 불과하던 빚이 몇 년 사이에 열 배로 커졌다.", "vietnamese": "Món nợ chỉ 1 triệu won mà mấy năm đã tăng gấp 10 lần."}
  ]'::jsonb,
  ARRAY['–뿐이다', '–밖에 안 되다']::TEXT[],
  ARRAY['limitation', 'only', 'not_more_than', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '허황된 꿈__ 불과하다.', 'fill_blank', '["에", "로", "를", "가"]'::jsonb, 0,
  'N + 에 불과하다 → 꿈에 불과하다.'
FROM public.grammar_patterns WHERE pattern = 'N – 에 불과하다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '합격률은 겨우 십 퍼센트__ 불과했다.', 'fill_blank', '["에", "로", "를", "가"]'::jsonb, 0,
  'Không quá 10% → 십 퍼센트에 불과했다.'
FROM public.grammar_patterns WHERE pattern = 'N – 에 불과하다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #156: A/V – 기만 하면
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 기만 하면',
  'giman hamyeon',
  'Nếu chỉ cần, hễ cứ...',
  'intermediate',
  'condition',
  'Kết hợp giữa 기만 하다 và (으)면: nếu chỉ cần làm việc gì đó, hễ làm gì đó sẽ xuất hiện kết quả vế sau. Ngoài ra còn có dạng N만 + V(으)면.',
  'A/V + 기만 하면 / N만 + V(으)면',
  '[
    {"korean": "비가 오기만 하면 온 몸이 아파요.", "vietnamese": "Cứ hễ trời mưa là toàn thân tôi lại đau nhức."},
    {"korean": "나는 우유를 마시기만 하면 배탈이 나요.", "vietnamese": "Chỉ cần uống sữa là tôi lại bị đau bụng."},
    {"korean": "날씨가 흐리기만 하면 무릎이 아파요.", "vietnamese": "Chỉ cần trời âm u là đầu gối tôi lại đau."},
    {"korean": "내 동생은 엄마가 나가기만 하면 게임을 해요.", "vietnamese": "Em trai tôi cứ hễ mẹ ra ngoài là nó lại chơi game."},
    {"korean": "늦게 자기만 하면 하루 종일 피곤해요.", "vietnamese": "Tôi cứ hễ đi ngủ muộn là lại mệt mỏi cả ngày."},
    {"korean": "저는 커피를 마시기만 하면 두통이 있어요.", "vietnamese": "Tôi chỉ cần uống cà phê là bị đau đầu."}
  ]'::jsonb,
  ARRAY['–(으)면', '–기만 하다']::TEXT[],
  ARRAY['condition', 'whenever', 'only_if', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '비가 오__ 하면 온 몸이 아파요.', 'fill_blank', '["기만", "도록", "게끔", "나 마나"]'::jsonb, 0,
  'Hễ cứ → 오기만 하면.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 기만 하면' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '우유를 마시__ 하면 배탈이 나요.', 'fill_blank', '["기만", "도록", "게끔", "나 마나"]'::jsonb, 0,
  'Chỉ cần uống → 마시기만 하면.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 기만 하면' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #157: N – (이)야말로
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – (이)야말로',
  '(i)yamallo',
  'Đúng thật là..., chắc hẳn là...',
  'intermediate',
  'emphasis',
  'Thay tiểu từ xác định chủ ngữ, nhấn mạnh danh từ chủ ngữ.',
  'N + (이)야말로',
  '[
    {"korean": "부모님이야말로 이 세상에서 가장 나를 사랑해 주는 분들입니다.", "vietnamese": "Đúng thật là bố mẹ là những người yêu thương tôi nhất trên thế gian này."},
    {"korean": "한글이야말로 세계에서 가장 우수한 문자예요.", "vietnamese": "Chắc hẳn Hangul là hệ chữ viết ưu tú nhất trên thế giới."},
    {"korean": "결혼 준비에서 많은 혼수야말로 낭비라고 생각한다.", "vietnamese": "Tôi nghĩ rằng nhiều lễ vật hỏi cưới trong chuẩn bị đám cưới thực sự là lãng phí."},
    {"korean": "결혼이야말로 인생에서 가장 중요한 일이라고 할 수 있다.", "vietnamese": "Đúng thật là đám cưới có thể là việc quan trọng nhất trong cuộc đời của chúng ta."},
    {"korean": "할아버지야말로 제가 가장 존경하는 분이에요.", "vietnamese": "Thực sự ông là người mà tôi ngưỡng mộ nhất."},
    {"korean": "제주도야말로 한국을 대표하는 관광지예요.", "vietnamese": "Đúng thật là đảo Jeju là điểm du lịch tiêu biểu ở Hàn Quốc."},
    {"korean": "지금이야말로 우리가 이길 수 있는 좋은 기회예요.", "vietnamese": "Chắc chắn bây giờ là cơ hội tốt cho chúng ta để có thể giành chiến thắng."}
  ]'::jsonb,
  ARRAY['–이/가', '–은/는']::TEXT[],
  ARRAY['emphasis', 'subject_emphasis', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '부모님__ 이 세상에서 가장 나를 사랑해 주는 분들입니다.', 'fill_blank', '["이야말로", "만 해도", "에 불과", "뿐"]'::jsonb, 0,
  'Danh từ có batchim dùng 이야말로 → 부모님이야말로.'
FROM public.grammar_patterns WHERE pattern = 'N – (이)야말로' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '제주도__ 한국을 대표하는 관광지예요.', 'fill_blank', '["야말로", "이야말로", "에 불과", "뿐"]'::jsonb, 0,
  'Danh từ không batchim dùng 야말로 → 제주도야말로.'
FROM public.grammar_patterns WHERE pattern = 'N – (이)야말로' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #158: V – 게
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 게',
  'ge',
  'Để...',
  'intermediate',
  'purpose',
  'Diễn tả mục đích, hành động ở mệnh đề sau là cần thiết để thực hiện, đạt được hành động hay trạng thái ở mệnh đề trước.',
  'V + 게',
  '[
    {"korean": "방탄소년단의 공연을 직접 볼 수 있게 콘서트 표를 샀어요.", "vietnamese": "Tôi đã mua vé concert để có thể trực tiếp xem buổi trình diễn của nhóm nhạc BTS."},
    {"korean": "다른 사람에게 방해되지 않게 이어폰을 껴요.", "vietnamese": "Tôi đeo tai nghe để không làm phiền người khác."},
    {"korean": "내일 입을 수 있게 오늘 세탁소에서 양복을 찾아다 주세요.", "vietnamese": "Hôm nay hãy lấy giùm tôi bộ âu phục ở hiệu giặt đồ để ngày mai tôi có thể mặc."},
    {"korean": "약속을 잊어버리지 않게 친구에게 전화를 해야겠어요.", "vietnamese": "Tôi phải gọi điện để anh ấy không quên cuộc hẹn."},
    {"korean": "중요한 내용을 잊어버리지 않게 수첩에 메모를 하세요.", "vietnamese": "Hãy ghi chép vào cuốn sổ tay để không bị quên các nội dung quan trọng."},
    {"korean": "옷을 따뜻하게 입으세요. 감기에 걸리지 않게.", "vietnamese": "Mặc quần áo ấm vào, để không bị cảm lạnh."},
    {"korean": "다른 사람들이 공부하게 좀 조용히 해.", "vietnamese": "Trật tự chút để người khác còn học."},
    {"korean": "실수하지 않게 신중하게 판단하세요.", "vietnamese": "Để không bị mắc lỗi hãy phán đoán một cách thận trọng."}
  ]'::jsonb,
  ARRAY['–게끔', '–도록']::TEXT[],
  ARRAY['purpose', 'so_that', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '방해되지 않__ 이어폰을 껴요.', 'fill_blank', '["게", "게끔", "도록", "기만"]'::jsonb, 0,
  'Mục đích để không làm phiền → 않게.'
FROM public.grammar_patterns WHERE pattern = 'V – 게' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '다른 사람들이 공부하__ 좀 조용히 해.', 'fill_blank', '["게", "도록", "게끔", "기만"]'::jsonb, 0,
  'Để người khác học → 공부하게.'
FROM public.grammar_patterns WHERE pattern = 'V – 게' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #159: V - 게끔
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V - 게끔',
  'gekkum',
  'Để...',
  'intermediate',
  'purpose',
  'Là dạng nhấn mạnh hơn của 게. Diễn tả mục đích, hành động ở mệnh đề sau là cần thiết để thực hiện, đạt được hành động hay trạng thái ở mệnh đề trước.',
  'V + 게끔',
  '[
    {"korean": "승규는 뒤에서도 들리게끔 큰 소리로 이야기했다.", "vietnamese": "Seung Gyu đã nói to để dù mọi người ở phía sau cũng nghe thấy được."},
    {"korean": "어머니의 사랑을 다시 생각하게끔 하는 영화였어요.", "vietnamese": "Đó là bộ phim khiến tôi suy nghĩ lại về tình yêu của người mẹ."},
    {"korean": "부모님께서 편히 쉬시게끔 방에서 나왔다.", "vietnamese": "Tôi đã ra khỏi phòng để bố mẹ thoải mái nghỉ ngơi."},
    {"korean": "아이들이 잘 먹게끔 치즈를 넣어서 만들었다.", "vietnamese": "Để tụi nhỏ ăn ngon miệng tôi đã cho vào phô mai rồi làm ra nó."},
    {"korean": "다음부터는 늦지 않게끔 따끔하게 야단을 쳤다.", "vietnamese": "Tôi đã trách mắng một cách nghiêm khắc để từ sau không còn đi muộn."},
    {"korean": "몸이 춥지 않게끔 두꺼운 담요를 덮었다.", "vietnamese": "Tôi đã đắp chăn thật ấm để cơ thể không lạnh."},
    {"korean": "더 아프지 않게끔 빨리 병원에 가는 게 좋겠다.", "vietnamese": "Bạn nên nhanh chóng đi viện để không bị đau thêm nữa."}
  ]'::jsonb,
  ARRAY['–게', '–도록']::TEXT[],
  ARRAY['purpose', 'emphasized_purpose', 'so_that', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '뒤에서도 들리__ 큰 소리로 이야기했다.', 'fill_blank', '["게끔", "기만", "나 마나", "수밖에"]'::jsonb, 0,
  'Dạng nhấn mạnh của 게 → 들리게끔.'
FROM public.grammar_patterns WHERE pattern = 'V - 게끔' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '몸이 춥지 않__ 두꺼운 담요를 덮었다.', 'fill_blank', '["게끔", "기만", "나 마나", "수밖에"]'::jsonb, 0,
  'Để không lạnh → 않게끔.'
FROM public.grammar_patterns WHERE pattern = 'V - 게끔' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #160: V – 도록
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 도록',
  'dorok',
  'Để... / tới, đến...',
  'intermediate',
  'purpose',
  'Diễn tả mệnh đề sau là phương hướng, nỗ lực nhằm giúp hành động, nội dung ở mệnh đề trước có thể xảy ra. Có thể thay thế bằng –게. Còn dùng để diễn tả giới hạn thời gian, mức độ hoặc phương pháp của hành động ở mệnh đề sau.',
  'V + 도록',
  '[
    {"korean": "내일 모의 면접에는 좋은 인상을 주도록 단정하게 입으세요.", "vietnamese": "Hãy ăn mặc chỉnh tề để tạo ấn tượng tốt cho buổi phỏng vấn ngày mai."},
    {"korean": "시험에 붙었다는 말을 듣고 눈물이 나도록 기뻤습니다.", "vietnamese": "Tôi vui đến mức chảy nước mắt khi nghe tin mình đậu kỳ thi."},
    {"korean": "환자들이 쉬도록 병원에서는 조용히 해야 한다.", "vietnamese": "Ở bệnh viện phải giữ yên lặng để cho bệnh nhân nghỉ ngơi."},
    {"korean": "사람들이 들을 수 있도록 큰 소리로 말해 주세요.", "vietnamese": "Xin hãy nói lớn lên để mọi người có thể nghe được."},
    {"korean": "기계를 다룰 때는 다치지 않도록 조심하세요.", "vietnamese": "Hãy cẩn thận để không bị thương trong lúc vận hành máy móc."},
    {"korean": "열두 시가 넘도록 민수 씨가 집에 오지 않아서 걱정이 된다.", "vietnamese": "Min-su vẫn chưa về nhà cho đến tận quá 12h làm tôi lo lắng quá."},
    {"korean": "수업이 끝나도록 수미 씨가 수업에 안 왔다.", "vietnamese": "Su-mi không đến lớp học cho đến tận khi lớp học kết thúc."},
    {"korean": "일주일이 넘도록 그 사람과 연락이 되지 않는다.", "vietnamese": "Không thể liên lạc với người đó cho đến tận hơn một tuần rồi."},
    {"korean": "밤새도록 시험 준비를 했다.", "vietnamese": "Tôi đã chuẩn bị thi cho đến tận đêm."}
  ]'::jsonb,
  ARRAY['–게', '–게끔']::TEXT[],
  ARRAY['purpose', 'limit', 'so_that', 'until', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '사람들이 들을 수 있__ 큰 소리로 말해 주세요.', 'fill_blank', '["도록", "기만", "뿐", "수밖에"]'::jsonb, 0,
  'Để có thể nghe → 들을 수 있도록.'
FROM public.grammar_patterns WHERE pattern = 'V – 도록' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '밤새__ 시험 준비를 했다.', 'fill_blank', '["도록", "게끔", "기만", "뿐"]'::jsonb, 0,
  'Giới hạn thời gian đến tận đêm → 밤새도록.'
FROM public.grammar_patterns WHERE pattern = 'V – 도록' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #161: V – (으) 나 마나
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으) 나 마나',
  '(eu)na mana',
  'Dù có làm cũng như không, chẳng cần phải...',
  'intermediate',
  'futility',
  'Thể hiện dù có thực hiện hành động nào đó hay không thì kết quả cũng vô ích. Kết quả chủ yếu ở thể giả định và dựa trên nhận thức thông thường hoặc xét đoán thói quen.',
  'V + (으)나 마나',
  '[
    {"korean": "남 씨를 기다리나 마나 안 올 테니까 기다리지 맙시다.", "vietnamese": "Dù có chờ hay không thì Nam cũng sẽ không đến vậy nên chúng ta đừng chờ."},
    {"korean": "동생이 놀기만 하는 걸 보니 이번 시험을 보나 마나 떨어질 거예요.", "vietnamese": "Tôi thấy em tôi cứ chỉ chơi thế thì chẳng cần phải thi cũng biết là trượt."},
    {"korean": "이 시간에는 가 보나 마나 가게 문을 닫았을 텐데 내일 가는 게 어때요?", "vietnamese": "Giờ bạn có đi thì cửa hàng cũng đóng cửa rồi nên sao không để mai đi?"},
    {"korean": "이 책은 제목을 보니까 읽으나 마나 재미없을 것 같아요.", "vietnamese": "Cuốn sách này xem tiêu đề thì chẳng cần phải đọc cũng biết không hay rồi."},
    {"korean": "비가 오면 세차를 하나 마나니까 나중에 하세요.", "vietnamese": "Nếu mưa thì rửa xe cũng như không thôi nên hãy để làm sau đi."},
    {"korean": "약은 시간에 맞춰서 먹지 않으면 먹으나 마나예요.", "vietnamese": "Thuốc mà không uống đúng lúc thì uống cũng vô ích thôi."},
    {"korean": "가: 제 말을 들어 보세요. 나: 들으나 마나 거짓말일 거예요.", "vietnamese": "가: Xin hãy lắng nghe lời tôi nói. 나: Dù có nghe hay không thì cũng chỉ là những lời dối trá."}
  ]'::jsonb,
  ARRAY['–아/어봤자', '–아/어 봐야']::TEXT[],
  ARRAY['futility', 'useless', 'prediction', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '남 씨를 기다리__ 안 올 테니까 기다리지 맙시다.', 'fill_blank', '["나 마나", "아 봤자", "게끔", "수밖에"]'::jsonb, 0,
  'Dù chờ hay không → 기다리나 마나.'
FROM public.grammar_patterns WHERE pattern = 'V – (으) 나 마나' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '이번 시험을 보__ 떨어질 거예요.', 'fill_blank', '["나 마나", "아 봤자", "게끔", "수밖에"]'::jsonb, 0,
  'Chẳng cần thi cũng biết → 보나 마나.'
FROM public.grammar_patterns WHERE pattern = 'V – (으) 나 마나' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #162: A/V – 아/어봤자
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 아/어봤자',
  'a/eo bwatja',
  'Dẫu có, dù cho...',
  'intermediate',
  'futility',
  'Diễn tả cho dù có cố gắng làm gì ở mệnh đề trước thì cũng vô ích hoặc không đạt được như mong đợi. Còn diễn tả nội dung được đề cập ở mệnh đề trước không đặc biệt hoặc không có giá trị.',
  'A/V + 아/어봤자',
  '[
    {"korean": "민호 씨에게 부탁해 봤자 소용 없을 거예요. 요즘 민호 씨가 바쁘거든요.", "vietnamese": "Dẫu có nhờ Minho thì cũng không có tác dụng gì đâu. Dạo này Minho bận lắm."},
    {"korean": "얼굴이 아무리 예뻐 봤자 모델이 될 수는 없을 거예요.", "vietnamese": "Dù cho mặt có xinh đi nữa thì cũng không làm người mẫu được đâu."},
    {"korean": "부장님은 내가 솔직하게 말해 봤자 내 말을 믿지 않으실 거예요.", "vietnamese": "Cho dù tôi nói thành thật thì chắc là trưởng phòng cũng sẽ không tin lời tôi nói đâu."},
    {"korean": "지금 가 봤자 이미 공연이 끝났을 거예요.", "vietnamese": "Bây giờ dù có đi thì buổi công diễn cũng đã kết thúc rồi."},
    {"korean": "그 사람에게 물어 봤자 모를 거예요.", "vietnamese": "Dẫu có hỏi anh ta thì anh ta cũng không biết đâu."},
    {"korean": "여기서 기다려 봤자 그 사람은 오지 않아요.", "vietnamese": "Dẫu có đợi ở đây thì người đó cũng không đến đâu."},
    {"korean": "비가 너무 많이 내려서 우산을 써 봤자 다 젖겠어요.", "vietnamese": "Mưa to quá nên dù có che ô thì chắc cũng ướt hết thôi."},
    {"korean": "이렇게 낭비를 하면 아무리 돈을 벌어 봤자 모을 수 없겠어요.", "vietnamese": "Lãng phí như thế này thì cho dù kiếm được tiền thì chắc là cũng không tiết kiệm được."}
  ]'::jsonb,
  ARRAY['–아/어 봐야', '–(으)나 마나']::TEXT[],
  ARRAY['futility', 'concession', 'useless', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '민호 씨에게 부탁해 __ 소용 없을 거예요.', 'fill_blank', '["봤자", "봐야", "나 마나", "도록"]'::jsonb, 0,
  'Dẫu có nhờ cũng vô ích → 부탁해 봤자.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어봤자' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '지금 가 __ 이미 공연이 끝났을 거예요.', 'fill_blank', '["봤자", "봐야", "나 마나", "도록"]'::jsonb, 0,
  'Dù có đi → 가 봤자.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어봤자' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #163: A/V – 아/어 봐야
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 아/어 봐야',
  'a/eo bwaya',
  'Dẫu có, dù cho...',
  'intermediate',
  'futility',
  'Diễn tả cho dù có cố gắng làm gì ở mệnh đề trước thì cũng vô ích hoặc không đạt được như mong đợi. Còn diễn tả nội dung được đề cập ở mệnh đề trước không đặc biệt hoặc không có giá trị.',
  'A/V + 아/어 봐야',
  '[
    {"korean": "공부를 많이 해 봐야 시험을 잘 못 봤어요.", "vietnamese": "Dù học rất nhiều nhưng dường như cũng không làm bài tốt."},
    {"korean": "다른 옷가게에 가 봐야 값은 여기와 비슷할 것이다.", "vietnamese": "Dù bạn có tới cửa hàng quần áo khác thì giá cũng tương tự ở đây thôi."},
    {"korean": "지금 여기서 잘잘못을 가름해 봐야 소용없어.", "vietnamese": "Lúc này có phân định đúng sai ở đây cũng có ích gì."},
    {"korean": "아무리 먹어 봐야 계속 배가 고파요.", "vietnamese": "Dù có ăn như thế nào thì bụng vẫn cứ tiếp tục đói."}
  ]'::jsonb,
  ARRAY['–아/어봤자', '–(으)나 마나']::TEXT[],
  ARRAY['futility', 'concession', 'useless', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '공부를 많이 해 __ 시험을 잘 못 봤어요.', 'fill_blank', '["봐야", "봤자", "나 마나", "도록"]'::jsonb, 0,
  'Dù có học nhiều → 해 봐야.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어 봐야' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '아무리 먹어 __ 계속 배가 고파요.', 'fill_blank', '["봐야", "봤자", "나 마나", "도록"]'::jsonb, 0,
  'Dù có ăn → 먹어 봐야.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어 봐야' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #164: V-(으)ㄹ걸 그랬다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V-(으)ㄹ걸 그랬다',
  '(eu)lgeol geuraetda',
  'Biết thế đã..., đáng ra nên...',
  'intermediate',
  'regret',
  'Diễn tả sự tiếc nuối hoặc hối hận của người nói về việc đã làm hoặc nên làm nhưng đã không làm trong quá khứ. Khi hối hận vì đã không làm việc nào đó dùng -(으)ㄹ 걸 그랬다. Khi hối hận vì đã làm hành động nào đó dùng -지 말 걸 그랬다 hoặc 안-(으)ㄹ걸 그랬다. Dạng 반말 có thể dùng (으)ㄹ걸.',
  'V + (으)ㄹ걸 그랬다 / V + 지 말 걸 그랬다',
  '[
    {"korean": "시험이 그렇게 어려울 줄 알았으면 공부를 더 많이 할 걸 그랬어요.", "vietnamese": "Nếu biết bài thi khó như vậy thì tôi đã học chăm chỉ hơn rồi."},
    {"korean": "오늘 발이 너무 아팠어요. 높은 신발을 신지 말 걸 그랬어요.", "vietnamese": "Hôm nay chân của tớ đau quá. Biết vậy đã không mang giày cao gót rồi."},
    {"korean": "치마가 짧아서 불편해요. 바지를 입을 걸 그랬어요.", "vietnamese": "Váy ngắn nên bất tiện quá. Đáng lẽ ra nên mặc quần."},
    {"korean": "아까 점심을 먹었는데 또 배가 고파요. 좀 많이 먹을 걸 그랬어요.", "vietnamese": "Lúc nãy tôi ăn trưa rồi nhưng lại đói. Biết thế ăn nhiều một chút."},
    {"korean": "어제 본 영화가 너무 재미없었어요. 다른 영화를 볼 걸 그랬어요.", "vietnamese": "Bộ phim hôm qua xem dở quá. Biết thế đã xem phim khác."},
    {"korean": "전화번호가 생각이 나지 않아요. 메모를 해 둘 걸 그랬어요.", "vietnamese": "Tôi không nhớ ra số điện thoại. Đáng ra tôi nên ghi chú lại."},
    {"korean": "새로 자른 머리가 마음에 들지 않는다. 자르지 말 걸 그랬다.", "vietnamese": "Tôi không thích kiểu tóc mới này. Biết vậy đừng cắt cho rồi."},
    {"korean": "가: 갑자기가 비가 많이 오네요. 나: 그래요? 우산을 가져올 걸 그랬어요.", "vietnamese": "가: Tự nhiên mưa rơi nhiều quá ha. 나: Vậy sao? Biết vậy thì đã mang theo ô đi rồi."}
  ]'::jsonb,
  ARRAY['–았/었어야 했는데', '–지 말 걸 그랬다']::TEXT[],
  ARRAY['regret', 'past_regret', 'should_have', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '공부를 더 많이 할 __ 그랬어요.', 'fill_blank', '["걸", "수밖에", "뿐", "도록"]'::jsonb, 0,
  'Tiếc nuối điều nên làm → 할 걸 그랬어요.'
FROM public.grammar_patterns WHERE pattern = 'V-(으)ㄹ걸 그랬다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '높은 신발을 신지 __ 그랬어요.', 'fill_blank', '["말 걸", "볼 걸", "수밖에", "기만"]'::jsonb, 0,
  'Hối hận vì đã làm → 신지 말 걸 그랬어요.'
FROM public.grammar_patterns WHERE pattern = 'V-(으)ㄹ걸 그랬다' AND topik_level = 'TOPIK II';
