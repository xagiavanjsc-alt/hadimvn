-- Migration 057: Insert TOPIK grammar patterns #88-96 (Intermediate level)
-- Ngữ pháp TOPIK #88-96 (Trung cấp)

-- ═══════════════════════════════════════════════════════════════════════════════
-- #88: A-다면, V-ㄴ/는다면 [Giả sử, nếu như...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A-다면, V-ㄴ/는다면',
  'damyeon, neun/ndaemyeon',
  'Giả sử, nếu như...',
  'intermediate',
  'condition',
  'Thể hiện giả định hay điều kiện cho một việc gì đó. Câu điều kiện loại II. So với (으)면 thì (ㄴ/는)다면 thể hiện: (1) các trường hợp với khả năng hiện thực hóa tương đối thấp, (2) dùng với các giả định mà không có khả năng ngay từ ban đầu. (3) Giả định điều mà người nói không hề hi vọng xảy ra trên thực tế. Thường kết hợp với phó từ 만약(에), 만일.',
  'A + 다면 / V + ㄴ/는다면',
  '[
    {"korean": "다시 태어난다면 남자가 되고 싶어요.", "vietnamese": "Nếu được sinh ra lại một lần nữa thì tôi muốn trở thành con trai."},
    {"korean": "해가 서쪽에서 뜬다면 네가 이민호 배우와 결혼할 거야.", "vietnamese": "Nếu mặt trời mọc hướng Tây thì tôi sẽ kết hôn với diễn viên Lee Min Ho."},
    {"korean": "시험에 합격을 한다면 얼마나 좋겠어요.", "vietnamese": "Nếu mà thi đỗ thì sung sướng biết bao nhiêu."},
    {"korean": "복권에 당첨된다면 전액을 사회에 기부하겠어요.", "vietnamese": "Nếu mà trúng vé số thì tôi sẽ quyên góp toàn bộ số tiền cho xã hội."},
    {"korean": "내가 부자라면 먼저 좋은 집을 사겠다.", "vietnamese": "Nếu là người giàu có thì tôi sẽ mua một ngôi nhà đẹp trước tiên."},
    {"korean": "내가 새라면 하늘을 날 수 있을 텐데.", "vietnamese": "Nếu là một chú chim thì có lẽ tôi có thể bay lên bầu trời."}
  ]'::jsonb,
  ARRAY['A/V – (으)면', 'A/V – (으)ㄹ까 하다']::TEXT[],
  ARRAY['condition', 'assumption', 'low probability', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A-다면, V-ㄴ/는다면' LIMIT 1),
  '다시 태어난다면 남자가 되고 싶___.',
  'fill_blank',
  '["어요.", "습니다.", "겠어요.", "겠어."]'::jsonb,
  '어요.',
  'Mong muốn → 싶어요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A-다면, V-ㄴ/는다면' LIMIT 1),
  '복권에 당첨된다면 전액을 사회에 기부하겠___.',
  'fill_blank',
  '["어요.", "습니다.", "다.", "어."]'::jsonb,
  '어요.',
  'Hứa hẹn → 하겠어요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #89: A/V-았/었더라면 [Nếu mà đã... thì đã..., Giả sử đã... thì đã]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V-았/었더라면',
  'at/eotdeoramyeon',
  'Nếu mà đã... thì đã..., Giả sử đã... thì đã',
  'intermediate',
  'condition',
  'Nói về một giả định trái ngược với việc đã xảy ra trong quá khứ. Hoặc thể hiện sự nuối tiếc, ân hận về việc đã trải qua. Vế sau thường sử dụng dạng phỏng đoán -았/었을 텐데, -았/었을 것이다, -았/었을걸요, hoặc -(으)ㄹ 뻔했다. Có thể thay thế bằng 았/었으면.',
  'A/V + 았/었더라면',
  '[
    {"korean": "노래를 잘 불렸더라면 가수가 되었을 거예요.", "vietnamese": "Nếu hát hay thì có lẽ tôi đã trở thành ca sĩ."},
    {"korean": "지수 씨가 연습을 많이 했더라면 실수하지 않았을 텐데요.", "vietnamese": "Nếu Jisoo luyện tập nhiều hơn thì có lẽ đã không mắc sai lầm."},
    {"korean": "고등학교 때 공부를 열심히 했더라면 원하는 대학에 갈 수 있었을 텐데요.", "vietnamese": "Nếu hồi cấp 3 chăm chỉ học thì có lẽ đã có thể bước vào trường đại học mà mình mong muốn."},
    {"korean": "아침에 일기예보를 들었더라면 산에 가지 않았을 텐데.", "vietnamese": "Nếu sáng nay tôi nghe bản tin dự báo thời tiết thì có lẽ tôi đã không đi lên núi."},
    {"korean": "키가 좀 더 컸더라면 농구 선수가 되었을 거예요.", "vietnamese": "Nếu cao thêm xíu nữa thì đã có thể trở thành vận động viên bóng rổ."},
    {"korean": "준비를 잘 했더라면 그렇게 긴장하지는 않았을 텐데.", "vietnamese": "Nếu đã chuẩn bị tốt hơn thì có lẽ đã không căng thẳng như vậy."}
  ]'::jsonb,
  ARRAY['A/V – 았/었으면', 'A/V – (으)ㄹ 뻔하다']::TEXT[],
  ARRAY['condition', 'past', 'regret', 'contrary fact', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V-았/었더라면' LIMIT 1),
  '노래를 잘 불렸더라면 가수가 되었을 거___.',
  'fill_blank',
  '["예요.", "입니다.", "어요.", "어."]'::jsonb,
  '예요.',
  'Phỏng đoán → 거예요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V-았/었더라면' LIMIT 1),
  '연습을 많이 했더라면 실수하지 않았을 텐데___.',
  'fill_blank',
  '["요.", "습니다.", "다.", "어."]'::jsonb,
  '요.',
  'Phỏng đoán → 텐데요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #90: V - (으)ㄹ 뻔하다 [suýt chút nữa]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V - (으)ㄹ 뻔하다',
  '(eu)l ppeonhada',
  'suýt chút nữa',
  'intermediate',
  'near miss',
  'Thể hiện một việc nguy hiểm hay không tốt nào đó có khả năng xảy ra nhưng may mắn đã không xảy ra. Cấu trúc này luôn dùng ở thì quá khứ. Cao cấp dùng với các phó từ: 하마터면, 자칫하면, 까딱하면.',
  'V + (으)ㄹ 뻔하다',
  '[
    {"korean": "아침에 늦게 일어나서 지각할 뻔했어요.", "vietnamese": "Sáng nay vì dậy muộn nên suýt chút nữa thì trễ giờ."},
    {"korean": "어렸을 때 수영하다가 물에 빠질 뻔했거든요.", "vietnamese": "Bởi vì khi còn bé lúc đang bơi thì suýt chút nữa bị chết đuối."},
    {"korean": "급하게 뛰어오다가 넘어질 뻔했어요.", "vietnamese": "Đang chạy vội thì suýt bị ngã."},
    {"korean": "운전 중에 통화를 하다가 사고가 날 뻔했어요.", "vietnamese": "Nghe điện thoại trong lúc lái xe nên suýt thì xảy ra tai nạn."},
    {"korean": "조금만 늦었으면 기차를 놓칠 뻔했어요.", "vietnamese": "Muộn chút nữa thôi là suýt chút nữa lỡ tàu rồi."},
    {"korean": "길이 너무 미끄러워서 학교에 오다가 넘어질 뻔했어요.", "vietnamese": "Đường quá trơn nên lúc đi học, tôi suýt bị ngã."},
    {"korean": "기차표를 미리 사지 않았으면 고향에 못 갈 뻔했어요.", "vietnamese": "Nếu không mua vé trước thì suýt nữa tôi đã không thể về quê."}
  ]'::jsonb,
  ARRAY['V – (으)ㄹ 뻔했다', 'V – 하마터면']::TEXT[],
  ARRAY['near miss', 'danger', 'past', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)ㄹ 뻔하다' LIMIT 1),
  '아침에 늦게 일어나서 지각할 뻔했___.',
  'fill_blank',
  '["어요.", "습니다.", "었어요.", "었어."]'::jsonb,
  '어요.',
  'Quá khứ → 했어요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V - (으)ㄹ 뻔하다' LIMIT 1),
  '급하게 뛰어오다가 넘어질 뻔했___.',
  'fill_blank',
  '["어요.", "습니다.", "었어요.", "었어."]'::jsonb,
  '어요.',
  'Quá khứ → 했어요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #91: A - 아/어 보이다 [có vẻ..., trông/nhìn có vẻ/như là...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A - 아/어 보이다',
  'a/eo boida',
  'có vẻ..., trông/nhìn có vẻ/như là...',
  'intermediate',
  'appearance',
  'Diễn tả sự phỏng đoán hoặc cảm nhận của bạn dựa trên vẻ ngoài của con người, sự vật, sự việc. Chủ ngữ đã nhìn thấy và thuật lại.',
  'A + 아/어 보이다',
  '[
    {"korean": "많이 힘들어 보이는데 괜찮을까요?", "vietnamese": "Trông bạn có vẻ mệt mỏi, bạn không sao chứ?"},
    {"korean": "머리를 묶으니까 젊어 보여요.", "vietnamese": "Bạn buộc tóc nhìn trông trẻ hơn."},
    {"korean": "지금 괜찮으세요? 슬퍼 보여요.", "vietnamese": "Bạn không sao chứ? Trông bạn có vẻ buồn."},
    {"korean": "이 치마를 입으니까 젊어 보여요.", "vietnamese": "Bạn mặc váy này trông có vẻ trẻ."},
    {"korean": "김치가 매워 보이네요.", "vietnamese": "Kimchi nhìn có vẻ cay."},
    {"korean": "이 케이크가 맛있어 보여서 샀는데, 너무 달아요.", "vietnamese": "Chiếc bánh này trông có vẻ ngon nên tôi đã mua nhưng nó ngọt quá."},
    {"korean": "얼굴이 피곤해 보여요.", "vietnamese": "Trông bạn có vẻ mệt."},
    {"korean": "가방이 무거워 보이는데 들어 드릴까요?", "vietnamese": "Trông túi xách có vẻ nặng, để tôi xách giúp nhé?"}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ 것 같다', 'A/V – 아/어지다']::TEXT[],
  ARRAY['appearance', 'impression', 'speculation', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A - 아/어 보이다' LIMIT 1),
  '머리를 묶으니까 젊어 보이___.',
  'fill_blank',
  '["어요.", "습니다.", "해요.", "해."]'::jsonb,
  '어요.',
  'Hiện tại → 보여요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A - 아/어 보이다' LIMIT 1),
  '김치가 매워 보이___.',
  'fill_blank',
  '["어요.", "습니다.", "네요.", "네."]'::jsonb,
  '네요.',
  'Hiện tại → 보이네요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #92: A/V - (으)ㄹ지도 모르다 [không biết chừng...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V - (으)ㄹ지도 모르다',
  '(eu)ljido moruda',
  'không biết chừng...',
  'intermediate',
  'speculation',
  'Diễn đạt sự phỏng đoán hoặc không chắc chắn về điều gì đó sẽ xảy ra trong tương lai hoặc đã xảy ra trong quá khứ. Thường được dùng với 아마. Hình thức quá khứ: 았/었을지도 모르다.',
  'A/V + (으)ㄹ지도 모르다',
  '[
    {"korean": "내일 날씨가 추울지도 모르니까 따뜻하게 입으세요.", "vietnamese": "Không biết chừng ngày mai trời sẽ lạnh nên hãy mặc ấm vào nhé."},
    {"korean": "아마 선생님께서는 학교에 안 계실지도 모르는데 여기서 기다릴까요?", "vietnamese": "Không biết chừng cô giáo không có ở trường nên bạn hãy đợi ở đây nhé?"},
    {"korean": "아마 다른 사람이 들을지도 모르니까 조용히 이야기하세요.", "vietnamese": "Không biết chừng người khác có thể đang lắng nghe, hãy nói nhỏ lại đi."},
    {"korean": "지금 백화점에 가면 사람이 많을지도 몰라요.", "vietnamese": "Nếu đi đến TTTM vào lúc này, không biết chừng sẽ có rất nhiều người."},
    {"korean": "내일 비가 올지도 모르니까 우산을 가지고 가세요.", "vietnamese": "Ngày mai trời không biết chừng sẽ mưa, hãy mang theo ô nha."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 것이다', 'A/V – 아마']::TEXT[],
  ARRAY['speculation', 'uncertainty', 'possibility', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄹ지도 모르다' LIMIT 1),
  '내일 날씨가 추울지도 모르니까 따뜻하게 입으세___.',
  'fill_blank',
  '["요.", "십시오.", "해요.", "해."]'::jsonb,
  '요.',
  'Mệnh lệnh → 입으세요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄹ지도 모르다' LIMIT 1),
  '내일 비가 올지도 모르니까 우산을 가지고 가세___.',
  'fill_blank',
  '["요.", "십시오.", "해요.", "해."]'::jsonb,
  '요.',
  'Mệnh lệnh → 가세요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #93: A/V - (으)ㄴ/는/(으)ㄹ 모양이다 [chắc là..., có vẻ như...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V - (으)ㄴ/는/(으)ㄹ 모양이다',
  '(eu)n/neun/(eu)l moyangida',
  'chắc là..., có vẻ như...',
  'intermediate',
  'speculation',
  'Sử dụng khi muốn phỏng đoán hay suy đoán về một tình huống cụ thể sau khi trực tiếp chứng kiến hay nghe về tình huống đó. Trước - (으)ㄴ/는/(으)ㄹ 모양이다 thường sử dụng cấu trúc -(으)ㄴ/는 걸 보니까 với ý nghĩa làm căn cứ để phỏng đoán. Thì thể của cấu trúc này phụ thuộc vào điều gì đó đã xảy ra trong quá khứ, đang xảy ra ở hiện tại, hoặc sẽ xảy ra trong tương lai.',
  'A + (으)ㄴ 모양이다 / V(qua khứ) + (으)ㄴ 모양이다 / V(hiện tại) + 는 모양이다 / V(tương lai) + (으)ㄹ 모양이다',
  '[
    {"korean": "지원 씨가 오늘 늦게까지 일하는 모양이에요.", "vietnamese": "Jiwon hôm nay chắc là làm việc đến muộn."},
    {"korean": "저 사람은 매일 돈을 저렇게 펑펑 써요. 정말 돈이 많은 모양이에요.", "vietnamese": "Người đó ngày nào cũng tiêu tiền như vậy. Chắc là rất nhiều tiền."},
    {"korean": "그 회사 일이 정말 힘들었던 모양이에요.", "vietnamese": "Có vẻ công việc ở công ty đó thật sự vất vả."},
    {"korean": "비행기 표를 예매한 걸 보니까 여행 갈 모양이에요.", "vietnamese": "Thấy cô ấy đặt vé máy bay thì có vẻ như cô ấy sẽ đi du lịch."},
    {"korean": "한국 음식을 자주 먹는 걸 보니까 한국 음식을 좋아하는 모양이에요.", "vietnamese": "Thấy anh ấy thường xuyên ăn đồ ăn Hàn thì có vẻ như anh ấy thích món ăn Hàn."},
    {"korean": "밖에 비가 오는 모양이에요.", "vietnamese": "Có vẻ như bên ngoài trời đang mưa."},
    {"korean": "아직 안 오는 걸 보니 차가 막히는 모양이에요.", "vietnamese": "Thấy bây giờ mà anh ấy vẫn chưa đến, có vẻ như là đang tắc đường."},
    {"korean": "어제 몸이 안 좋다고 했는데 많이 아픈 모양이에요.", "vietnamese": "Hôm qua cô ấy nói cô ấy không được khỏe nên chắc là cô ấy ốm rồi."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는/(으)ㄹ 것 같다', 'A/V – (으)ㄴ/는 걸 보니까']::TEXT[],
  ARRAY['speculation', 'evidence', 'observation', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄴ/는/(으)ㄹ 모양이다' LIMIT 1),
  '지원 씨가 오늘 늦게까지 일하는 모양이___.',
  'fill_blank',
  '["어요.", "습니다.", "예요.", "예."]'::jsonb,
  '어요.',
  'Hiện tại → 모양이에요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄴ/는/(으)ㄹ 모양이다' LIMIT 1),
  '밖에 비가 오는 모양이___.',
  'fill_blank',
  '["어요.", "습니다.", "예요.", "예."]'::jsonb,
  '어요.',
  'Hiện tại → 모양이에요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #94: A/V – (으)ㄹ걸요 [có lẽ, chắc là]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ걸요',
  '(eu)lgeoryo',
  'có lẽ, chắc là',
  'intermediate',
  'speculation',
  'Diễn tả sự phỏng đoán, giả định về những sự việc trong tương lai hoặc việc mà người nói chưa chắc chắn lắm. Phỏng đoán cho ngôi số 3. Quá khứ: 았/었을걸요. Chỉ sử dụng cấu trúc này giữa những người thân thiết và chỉ sử dụng trong văn nói. Dạng 반말 là (으)ㄹ걸.',
  'A/V + (으)ㄹ걸요',
  '[
    {"korean": "지금 50%나 세일하니까 비싸지 않을걸요.", "vietnamese": "Bây giờ đang được giảm giá 50% nên chắc là không đắt đâu."},
    {"korean": "마이 씨는 시간이 없을걸요. 내일 아르바이트를 한다고 했거든요.", "vietnamese": "Chắc là Mai không có thời gian đâu. Vì bạn ấy bảo là ngày mai sẽ đi làm thêm."},
    {"korean": "아마 커피숍에 있을걸요. 아까 커피숍에 간다고 했거든요.", "vietnamese": "Có lẽ anh ấy ở quán café. Lúc nãy anh ấy nói là ở quán café mà."},
    {"korean": "아마 10 시쯤 열걸요. 다른 마트들이 대부분 10 시에 열거든요.", "vietnamese": "Có lẽ khoảng 10h. Hầu hết các siêu thị đều mở cửa lúc 10h mà."},
    {"korean": "그 시간에는 길이 많이 막힐걸요.", "vietnamese": "Giờ đó có lẽ sẽ rất tắc đường đấy."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 것이다', 'A/V – 아마']::TEXT[],
  ARRAY['speculation', 'spoken', 'casual', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ걸요' LIMIT 1),
  '지금 50%나 세일하니까 비싸지 않을걸___.',
  'fill_blank',
  '["요.", "습니다.", "해요.", "해."]'::jsonb,
  '요.',
  'Phỏng đoán → 걸요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ걸요' LIMIT 1),
  '아마 10 시쯤 열걸___.',
  'fill_blank',
  '["요.", "습니다.", "해요.", "해."]'::jsonb,
  '요.',
  'Phỏng đoán → 걸요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #95: A/V - (으)ㄴ/는/(으)ㄹ 줄 몰랐다/알았다 [không nghĩ là/nghĩ là]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V - (으)ㄴ/는/(으)ㄹ 줄 몰랐다/알았다',
  '(eu)n/neun/(eu)l jul mollatta/alatda',
  'không nghĩ là, không biết là / nghĩ là, cứ tưởng là',
  'intermediate',
  'surprise',
  'Người nói thể hiện sự khác nhau giữa kết quả và thứ mà mình đã suy nghĩ hay dự đoán. Động từ ứng với quá khứ/hiện tại/tương lai + (으)ㄴ/는/(으)ㄹ; tính từ phỏng đoán thường/mơ hồ + (으)ㄹ. (으)ㄴ/는/(으)ㄹ 줄 몰랐다: không nghĩ là, không biết là. (으)ㄴ/는/(으)ㄹ 줄 알았다: nghĩ là, cứ tưởng là.',
  'A/V + (으)ㄴ/는/(으)ㄹ 줄 몰랐다/알았다',
  '[
    {"korean": "흐엉 씨는 한국어 발음이 좋아서 한국 사람인 줄 알았어요.", "vietnamese": "Hương phát âm tiếng Hàn rất tốt nên tôi cứ tưởng là người Hàn."},
    {"korean": "그 가방이 싼 줄 알았어요.", "vietnamese": "Tôi tưởng chiếc túi xách đó rẻ."},
    {"korean": "마이 씨가 한국에 돌아간 줄 몰랐어요.", "vietnamese": "Tôi không biết là Mai trở về Hàn Quốc."},
    {"korean": "밖에 비가 오는 줄 알았어요.", "vietnamese": "Tôi tưởng bên ngoài trời đang mưa."},
    {"korean": "어제 이렇게 눈이 많이 온 줄 몰랐어요.", "vietnamese": "Tôi không biết là hôm qua tuyết đã rơi nhiều thế này."},
    {"korean": "오늘 약속이 있는 줄 알았어요.", "vietnamese": "Tôi tưởng hôm nay có hẹn."},
    {"korean": "아까 전화를 안 받아서 바쁜 줄 알았어요.", "vietnamese": "Lúc nãy bạn không nghe điện thoại mình cứ tưởng là bạn đang bận."},
    {"korean": "예고편을 보고 영화가 재미없을 줄 알았는데 재미있네요.", "vietnamese": "Xem trailer thì tưởng là bộ phim sẽ không hay, nhưng mà không ngờ nó thú vị thật."},
    {"korean": "미안해요. 바쁜 줄 몰랐어요.", "vietnamese": "Xin lỗi. Tôi không biết anh đang bận."},
    {"korean": "시간이 많이 걸릴 줄 알았어요.", "vietnamese": "Tôi tưởng là sẽ mất nhiều thời gian."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는/(으)ㄹ 것 같다', 'A/V – 줄 알다']::TEXT[],
  ARRAY['surprise', 'misconception', 'expectation', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄴ/는/(으)ㄹ 줄 몰랐다/알았다' LIMIT 1),
  '한국어 발음이 좋아서 한국 사람인 줄 알았___.',
  'fill_blank',
  '["어요.", "습니다.", "해요.", "해."]'::jsonb,
  '어요.',
  'Quá khứ → 알았어요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄴ/는/(으)ㄹ 줄 몰랐다/알았다' LIMIT 1),
  '마이 씨가 한국에 돌아간 줄 몰랐___.',
  'fill_blank',
  '["어요.", "습니다.", "어요.", "어."]'::jsonb,
  '어요.',
  'Quá khứ → 몰랐어요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #96: A – (으)ㄴ가 보다, V – 나 보다 [Có vẻ..., chắc là...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A – (으)ㄴ가 보다, V – 나 보다',
  '(eu)nga boda, na boda',
  'Có vẻ..., chắc là...',
  'intermediate',
  'speculation',
  'Thể hiện sự phỏng đoán, suy đoán của người nói dựa trên bối cảnh nào đó. Đối tượng được phỏng đoán là ngôi số 3, không dùng ngôi số 1. Dùng nhiều trong văn nói.',
  'A + (으)ㄴ가 보다 / V + 나 보다',
  '[
    {"korean": "밖에 비가 오나 봐요.", "vietnamese": "Chắc là bên ngoài trời đang mưa."},
    {"korean": "흐엉 씨가 어디 아픈가 봐요.", "vietnamese": "Có vẻ Hương đau ở đâu đó."},
    {"korean": "보고서를 다 썼나 봐요. 아까 제출하러 간다고 했거든요.", "vietnamese": "Vâng, chắc cậu ấy viết xong rồi. Vì lúc nãy cậu ấy bảo đi nộp."},
    {"korean": "엄마는 전화 안 해서 바쁜가 봐요.", "vietnamese": "Không thấy mẹ gọi điện nên chắc là mẹ đang bận."},
    {"korean": "그녀가 책을 들고 도서관에 들어갔어요. 아마 학생인가 봐요.", "vietnamese": "Cô ấy cầm sách và đã đi vào thư viện. Chắc là học sinh."},
    {"korean": "시끄러운 것을 보니 밖에 싸움이 났나 봐요.", "vietnamese": "Thấy ồn ào như vậy chắc bên ngoài có cãi nhau."},
    {"korean": "성적이 꽤 좋네요. 정말 똑똑한가 봐요.", "vietnamese": "Thành tích tốt nhỉ. Có vẻ như anh ấy thực sự rất thông minh."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는 것 같다', 'A/V – 아/어 보이다']::TEXT[],
  ARRAY['speculation', 'context', 'spoken', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A – (으)ㄴ가 보다, V – 나 보다' LIMIT 1),
  '밖에 비가 오나 봐___.',
  'fill_blank',
  '["요.", "습니다.", "해요.", "해."]'::jsonb,
  '요.',
  'Phỏng đoán → 봐요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A – (으)ㄴ가 보다, V – 나 보다' LIMIT 1),
  '보고서를 다 썼나 봐___.',
  'fill_blank',
  '["요.", "습니다.", "해요.", "해."]'::jsonb,
  '요.',
  'Phỏng đoán → 봐요.',
  'medium'
);
