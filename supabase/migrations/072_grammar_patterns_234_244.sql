-- Migration 072: TOPIK 4-5 Grammar Patterns #234-244
-- Groups: Condition (조건), Sequence/Habit (연속/습관), Concession (양보), Dependent (의존)

-- ═══════════════════════════════════════════════════════════════════════════════
-- TOPIK IV Patterns
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- #234: V – 는 한
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 는 한',
  'neun han',
  'Chỉ khi, chỉ với điều kiện (điều kiện tiên quyết)',
  'intermediate',
  'condition',
  'Diễn tả điều kiện, tiền đề hay yêu cầu về một hành động hay một trạng thái nào đó. Chỉ khi thoả mãn điều kiện vế trước thì vế sau mới được thực hiện hoặc đủ tiêu chuẩn. Khác với 는 한 nghĩa "chừng nào còn" (duration), dạng này nhấn mạnh tiêu chuẩn/điều kiện.',
  'V + 는 한 / A + (으)ㄴ 한',
  '[
    {"korean": "구매한 영수증을 가지고 있는 한 어제 산 제품을 환불할 수 있다.", "vietnamese": "Chỉ khi bạn mang theo hóa đơn mua hàng thì mới có thể đổi sản phẩm bạn đã mua hôm qua được."},
    {"korean": "단 것을 먹지 않고 계속 운동을 하는 한 다이어트에 성공할 수 있다.", "vietnamese": "Chỉ với điều kiện không ăn đồ ngọt và tập thể dục đều đặn thì mới có thể giảm cân thành công được."},
    {"korean": "가족들이 함께 있는 한 아무리 큰 어려움도 극복할 수 있다.", "vietnamese": "Chỉ cần có gia đình thì dù khó khăn cỡ nào đi chăng nữa cũng có thể khắc phục được."},
    {"korean": "아이들은 부모가 도와주지 않는 한 모든 일을 스스로 할 수 있다.", "vietnamese": "Chỉ khi bố mẹ không giúp tụi nhỏ thì chúng mới có thể tự mình làm hết mọi việc."},
    {"korean": "꾸준히 저축하는 한 노후의 경제적인 문제는 걱정하지 않아도 된다.", "vietnamese": "Chỉ khi bạn tiết kiệm đều đặn thì bạn mới không phải lo lắng về vấn đề kinh tế của tuổi già."}
  ]'::jsonb,
  ARRAY['V – 는 이상', 'V – 는 한', 'V – 기만 하면']::TEXT[],
  ARRAY['condition', 'prerequisite', 'topik4', 'intermediate']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '구매한 영수증을 가지고 있___ 어제 산 제품을 환불할 수 있다.', 'fill_blank', '["는 한", "는 이상", "기만 하면", "는 동안"]'::jsonb, 0,
  '조건 충족 시 결과 가능: 가지고 있는 한 → 조건 필수'
FROM public.grammar_patterns WHERE pattern = 'V – 는 한' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '꾸준히 저축하___ 노후의 경제적인 문제는 걱정하지 않아도 된다.', 'fill_blank', '["는 한", "는 이상", "기만 하면", "는 동안"]'::jsonb, 0,
  '조건 전제+안심 결과: 저축하는 한 → 조건 유지'
FROM public.grammar_patterns WHERE pattern = 'V – 는 한' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #235: V – (으)ㄹ라치면
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)ㄹ라치면',
  'eulrachimyeon',
  'Hễ... thì, cứ... thì (tình huống lặp lại cản trở)',
  'advanced',
  'condition',
  'Một tình huống thường xảy ra trong đó tình huống ở mệnh đề sau luôn xảy ra bất cứ khi nào chủ thể cố gắng thực hiện hành động ở mệnh đề trước, dẫn đến việc chủ thể không thể thực hiện đúng hành động đã định. Thường được sử dụng trong văn nói. Biểu hiện tương tự: (으)려고 하면.',
  'V + (으)ㄹ라치면',
  '[
    {"korean": "모처럼 시간이 내서 밖으로 놀러 갈라치면 그날따라 비가 와요.", "vietnamese": "Hiếm lắm mới ra ngoài chơi mà cứ hễ ra ngoài chơi hôm nào là hôm đó trời mưa."},
    {"korean": "낮잠 좀 잘라치면 그 때 옆집 아이가 피아노를 쳐 대니 잘 수가 없어요.", "vietnamese": "Hễ cứ ngủ trưa một chút thì đứa trẻ nhà bên lại đánh piano nên không thể ngủ được."},
    {"korean": "내가 공부를 시작할라치면 친구들이 놀자고 해요.", "vietnamese": "Tôi hễ cứ bắt đầu học là bạn lại rủ đi chơi."},
    {"korean": "밥 좀 먹을라치면 계속 전화가 오니 제대로 먹을 수가 없다.", "vietnamese": "Hễ cứ ăn được một chút cơm là điện thoại liên tục gọi đến nên không thể ăn được."},
    {"korean": "리모컨을 평소에는 잘 보이다가 텔레비전을 볼라치면 안 보인다.", "vietnamese": "Cái điều khiển bình thường lúc nào cũng nhìn thấy nhưng hễ cứ định xem TV thì lại không thấy đâu cả."},
    {"korean": "지하철 대신 버스를 좀 탈라치면 내가 탈 버스만 안 와요.", "vietnamese": "Hễ cứ định bắt xe bus thay vì tàu điện ngầm thì chuyến xe bus tôi muốn bắt lại không đến."},
    {"korean": "돈을 모을라치면 꼭 무슨 일이 생겨서 돈을 다 쓰게 되더라고요.", "vietnamese": "Hễ cứ định tiết kiệm tiền thì lại có việc phát sinh và phải tiêu hết tiền."}
  ]'::jsonb,
  ARRAY['V – (으)려고 하면', 'V – 기만 하면']::TEXT[],
  ARRAY['condition', 'spoken', 'habitual', 'obstacle', 'topik4', 'advanced']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '낮잠 좀 잘___ 옆집 아이가 피아노를 쳐 대요.', 'fill_blank', '["라치면", "(으)려고 하면", "자마자", "기가 무섭게"]'::jsonb, 0,
  '방해 반복: 잘라치면 → 자려는 순간마다 방해 발생'
FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ라치면' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '돈을 모을___ 꼭 무슨 일이 생겨서 돈을 다 쓰게 돼요.', 'fill_blank', '["라치면", "(으)려고 하면", "자마자", "는 한"]'::jsonb, 0,
  '의도 방해 반복 구어체: 모을라치면 → 반복적 장애 강조'
FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ라치면' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #236: V – 노라면
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 노라면',
  'noramyeon',
  'Nếu cứ... thì... (tiếp tục làm thì kết quả tự nhiên đến)',
  'advanced',
  'condition',
  'Nếu liên tục, thường xuyên làm một việc gì đó ở vế trước thì sẽ cho ra một kết quả tương tự ở vế sau. Biểu hiện tương tự: 다가 보면. Diễn tả quá trình liên tục dẫn đến kết quả tự nhiên theo thời gian.',
  'V + 노라면',
  '[
    {"korean": "꾸준히 취업 준비를 하노라면 곧 좋은 일자리를 찾을 테니 걱정하지 마세요.", "vietnamese": "Nếu bạn cứ tìm việc đều đặn thì sẽ sớm tìm được công việc tốt thôi nên đừng lo lắng quá."},
    {"korean": "한국어를 열심히 연습하노라면 점점 실력이 좋아질 거예요.", "vietnamese": "Nếu cứ chăm chỉ luyện tập tiếng Hàn thì năng lực sẽ tốt lên thôi."},
    {"korean": "힘들어도 포기하지 않고 계속 노력하노라면 반드시 성공할 거예요.", "vietnamese": "Dù khó khăn nếu không ngừng nỗ lực và không chịu từ bỏ chắc chắn sẽ thành công."},
    {"korean": "꾸준히 운동하노라면 건강이 회복될 거예요.", "vietnamese": "Nếu cứ kiên trì tập thể dục thì sức khỏe sẽ hồi phục."},
    {"korean": "공원에 조용히 앉아 있노라면 마음이 편안해지고 정신도 맑아진다.", "vietnamese": "Nếu cứ ngồi yên tĩnh trong công viên tâm hồn sẽ trở nên bình an và tinh thần cũng trở nên sáng suốt."},
    {"korean": "집에 혼자 있노라면 부모님 생각에 쓸쓸한 기분이 든다.", "vietnamese": "Nếu cứ ở nhà một mình, suy nghĩ của bố mẹ sẽ có cảm giác đơn độc, cô quạnh."}
  ]'::jsonb,
  ARRAY['V – 다가 보면', 'V – 다 보면']::TEXT[],
  ARRAY['condition', 'continuous', 'natural-result', 'topik4', 'advanced']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '한국어를 열심히 연습하___ 점점 실력이 좋아질 거예요.', 'fill_blank', '["노라면", "다가 보면", "는 한", "다 보면"]'::jsonb, 0,
  '지속 행동 → 자연스러운 결과: 연습하노라면 → 문어체 연속'
FROM public.grammar_patterns WHERE pattern = 'V – 노라면' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '꾸준히 운동하___ 건강이 회복될 거예요.', 'fill_blank', '["노라면", "다가 보면", "는 한", "라치면"]'::jsonb, 0,
  '지속+결과 도출: 운동하노라면 → 꾸준함 강조 연속'
FROM public.grammar_patterns WHERE pattern = 'V – 노라면' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #237: V – 거들랑
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 거들랑',
  'geodeullang',
  'Nếu... thì... (điều kiện + mệnh lệnh)',
  'advanced',
  'condition',
  'Diễn tả điều kiện nếu vế trước được trở thành hiện thực. Vế sau thường dùng với dạng mệnh lệnh hoặc cầu khiến, có thể diễn tả ý chí chủ thể. Có thể thay thế bằng cấu trúc 거든.',
  'V + 거들랑 / A + 거들랑',
  '[
    {"korean": "오빠를 만나거들랑 제 말을 꼭 전해 주세요.", "vietnamese": "Nếu gặp anh thì nhất định phải chuyển lời của tôi nhé."},
    {"korean": "아이들이 밥을 안 먹거들랑 도시락을 싸서 먹여 보세요.", "vietnamese": "Nếu tụi nhỏ không ăn cơm thì hãy thử cho chúng ăn cơm hộp."},
    {"korean": "은행에 기다리는 사람이 많거들랑 그냥 오고 내일 다시 가라.", "vietnamese": "Nếu có nhiều người đợi ở ngân hàng thì cứ đi về và ngày mai lại đi tiếp."},
    {"korean": "아버지께서 오시거들랑 외식하자고 해야겠다.", "vietnamese": "Nếu bố đến thì phải rủ bố đi ăn ngoài mới được."}
  ]'::jsonb,
  ARRAY['V – 거든', 'V – (으)면']::TEXT[],
  ARRAY['condition', 'command', 'spoken', 'topik4', 'advanced']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '오빠를 만나___ 제 말을 꼭 전해 주세요.', 'fill_blank', '["거들랑", "거든", "(으)면", "는 한"]'::jsonb, 0,
  '조건+명령: 만나거들랑 → 거든과 유사, 뒤 명령문'
FROM public.grammar_patterns WHERE pattern = 'V – 거들랑' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '아이들이 밥을 안 먹___ 도시락을 싸서 먹여 보세요.', 'fill_blank', '["거들랑", "거든", "(으)면", "라치면"]'::jsonb, 0,
  '조건 실현+대안 명령: 안 먹거들랑 → 뒤 권유'
FROM public.grammar_patterns WHERE pattern = 'V – 거들랑' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #238: V – (으)면 몰라도
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)면 몰라도',
  'eumyeon mollado',
  'Giả sử như không... thì... (điều kiện giả định + phủ định)',
  'advanced',
  'condition',
  'Giả định tình huống hay trạng thái trong hiện tại không xảy ra hoặc trái ngược thì vế sau có thể sẽ xảy ra đến. Thông thường vế sau là sự phủ định hoặc một câu hỏi nghi ngờ.',
  'V + (으)면 몰라도 / A + (으)면 몰라도 / N + (이)면 몰라도',
  '[
    {"korean": "민재 씨는 풀면 몰라도 수빈 씨는 그 문제 못 풀걸?", "vietnamese": "Giả sử Min Jae không giải quyết thì chắc là Subin không giải quyết được vấn đề đó nhỉ?"},
    {"korean": "엄마가 도와주면 몰라도 혼자서는 비빔밥 못 만들어요.", "vietnamese": "Giả sử mẹ không giúp đỡ thì một mình tôi không thể làm được cơm trộn."},
    {"korean": "친척들이면 몰라도 친구는 면회할 수 없어요.", "vietnamese": "Nếu không phải người thân thì bạn bè không thể đến thăm được."},
    {"korean": "친구가 먼저 사과하면 몰라도 절대 화해하지 않을 거예요.", "vietnamese": "Nếu bạn không xin lỗi trước thì tôi tuyệt đối sẽ không hòa giải."},
    {"korean": "오늘 가면 몰라도 내일은 약속이 있어.", "vietnamese": "Không phải hôm nay thì ngày mai tớ có hẹn rồi."}
  ]'::jsonb,
  ARRAY['V – 아/어야', 'V – 지 않으면']::TEXT[],
  ARRAY['condition', 'assumption', 'negation', 'topik4', 'advanced']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '엄마가 도와주___ 혼자서는 비빔밥 못 만들어요.', 'fill_blank', '["면 몰라도", "는 한", "거들랑", "더라도"]'::jsonb, 0,
  '가정+부정 결과: 도와주면 몰라도 → 도움 없으면 불가'
FROM public.grammar_patterns WHERE pattern = 'V – (으)면 몰라도' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '친구가 먼저 사과하___ 절대 화해하지 않을 거예요.', 'fill_blank', '["면 몰라도", "는 한", "거들랑", "더라도"]'::jsonb, 0,
  '조건+강한 부정 의지: 사과하면 몰라도 → 선행 조건 없으면 거부'
FROM public.grammar_patterns WHERE pattern = 'V – (으)면 몰라도' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #239: A/V – (느)냐에 달려 있다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (느)냐에 달려 있다',
  'neunyae dallyeo itda',
  'Phụ thuộc vào (việc/cách)',
  'advanced',
  'dependent-clause',
  'Hoàn cảnh hoặc tình huống được mô tả trong mệnh đề trước phụ thuộc vào nội dung của mệnh đề sau. Với danh từ có thể sử dụng cấu trúc: N + 에/에게/한테/께 달려 있다. Thường đi kèm với các từ như 얼마나 hoặc 어떻게.',
  'V + (느)냐에 달려 있다 / A + (으)냐에 달려 있다 / N + 에 달려 있다',
  '[
    {"korean": "제품이 잘 팔리고 안 팔리고는 제품의 질이 얼마나 좋(으)냐에 달려 있다.", "vietnamese": "Sản phẩm bán chạy hay không phụ thuộc vào chất lượng sản phẩm tốt như thế nào."},
    {"korean": "건강은 규칙적으로 운동하(느)냐에 달려 있다.", "vietnamese": "Sức khỏe phụ thuộc vào việc tập thể dục đều đặn hay không."},
    {"korean": "우리나라의 미래는 젊은 세대에게 달려 있어요.", "vietnamese": "Tương lai của nước ta phụ thuộc vào thế hệ trẻ."},
    {"korean": "모든 일은 나의 선택에 달려 있어.", "vietnamese": "Mọi thứ phụ thuộc vào lựa chọn của cậu."},
    {"korean": "베트남 쌀국수의 맛은 요리 재료에 달려 있어요.", "vietnamese": "Hương vị món phở Việt Nam phụ thuộc vào nguyên liệu nấu ăn."},
    {"korean": "우리의 행복은 자신의 생각에 달려 있어요.", "vietnamese": "Hạnh phúc của chúng ta phụ thuộc vào suy nghĩ của bản thân."},
    {"korean": "일의 성패는 우리들에게 달려 있어요.", "vietnamese": "Sự thành bại của việc này là phụ thuộc vào chúng ta."},
    {"korean": "아이의 습관은 부모가 어떻게 하느냐에 달려 있어요.", "vietnamese": "Thói quen của trẻ phụ thuộc bố mẹ hành động như thế nào."}
  ]'::jsonb,
  ARRAY['V – 기 나름이다', 'N + 에 따라 다르다']::TEXT[],
  ARRAY['dependent', 'depends-on', 'topik4', 'advanced']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '건강은 규칙적으로 운동하___ 달려 있다.', 'fill_blank', '["느냐에", "는지에", "기에", "는 것에"]'::jsonb, 0,
  '의존 표현: 운동하느냐에 달려 있다 → 여부에 따름'
FROM public.grammar_patterns WHERE pattern = 'A/V – (느)냐에 달려 있다' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '아이의 습관은 부모가 어떻게 하___ 달려 있어요.', 'fill_blank', '["느냐에", "는지에", "기에", "는 것에"]'::jsonb, 0,
  '방법 의존: 어떻게 하느냐에 달려 있다 → 방식에 따름'
FROM public.grammar_patterns WHERE pattern = 'A/V – (느)냐에 달려 있다' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #240: V – 기 나름이다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 기 나름이다',
  'gi nareumida',
  'Tùy vào việc, tuỳ thuộc vào cách làm',
  'advanced',
  'dependent-clause',
  'Một việc hay một hành vi nào đó có thể thay đổi tùy theo việc thực hiện công việc hay hành vi đó như thế nào. Nhấn mạnh rằng kết quả không cố định mà phụ thuộc vào cách thực hiện.',
  'V + 기 나름이다',
  '[
    {"korean": "모든 일은 마음먹기 나름이다. 쉽다고 생각하면 쉽고 잘되지만, 어렵다고 생각하면 아무것도 할 수 없는 법이다.", "vietnamese": "Mọi việc phụ thuộc vào sự quyết tâm. Nếu nghĩ nó dễ thì là dễ còn nghĩ nó khó thì chắc chắn không thể làm được việc gì."},
    {"korean": "자녀는 부모가 교육하기 나름이다. 강요보다는 스스로 할 수 있도록 도와줘야 한다.", "vietnamese": "Con cái phụ thuộc vào sự giáo dục của cha mẹ. Thay vì ép buộc thì hãy giúp đỡ để chúng có thể tự làm được."},
    {"korean": "시험에 합격하고 못 하고는 각자 노력하기 나름이다.", "vietnamese": "Kỳ thi đậu hay không tùy thuộc vào sự nỗ lực của mỗi người."},
    {"korean": "모든 일은 생각하기 나름이니까 긍정적으로 생각하세요.", "vietnamese": "Vì mọi việc tùy thuộc vào suy nghĩ nên hãy suy nghĩ tích cực lên."},
    {"korean": "아이들이 잘되고 못되는 것은 부모들이 신경을 쓰기 나름이다.", "vietnamese": "Việc những đứa trẻ ngoan hay hư hỏng tùy thuộc vào việc bố mẹ quan tâm chúng như thế nào."}
  ]'::jsonb,
  ARRAY['A/V – (느)냐에 달려 있다', 'N + 에 따라 다르다']::TEXT[],
  ARRAY['dependent', 'depends-on', 'variable', 'topik4', 'advanced']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '모든 일은 마음먹___ 이다.', 'fill_blank', '["기 나름", "기에 달려", "느냐에 달려", "기 위해서"]'::jsonb, 0,
  '결과 가변성: 마음먹기 나름이다 → 의지에 따라 달라짐'
FROM public.grammar_patterns WHERE pattern = 'V – 기 나름이다' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '시험에 합격하고 못 하고는 각자 노력하___ 이다.', 'fill_blank', '["기 나름", "기에 달려", "느냐에 달려", "는 셈"]'::jsonb, 0,
  '노력 방식 의존: 노력하기 나름이다 → 개인 노력에 따라 결과 달라짐'
FROM public.grammar_patterns WHERE pattern = 'V – 기 나름이다' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #241: N 은/는 N 대로
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N 은/는 N 대로',
  'eun/neun daero',
  'N thì N chứ (mỗi cái có đặc điểm riêng)',
  'advanced',
  'noun-pattern',
  'Chỉ ra rằng mỗi danh từ có một đặc điểm khác nhau đối với nội dung tiếp theo. Thể hiện rằng mỗi thứ có vai trò, đặc điểm, hay cái hay riêng của nó.',
  'N + 은/는 N + 대로',
  '[
    {"korean": "무슨 소리야? 부자는 부자대로 걱정이 있는 법이에요.", "vietnamese": "Bạn nói gì vậy? Người giàu thì có lo lắng của người giàu chứ."},
    {"korean": "한국 영화는 한국 영화대로 미국 영화는 미국 영화대로 각기 다른 멋이 있거든요.", "vietnamese": "Vì phim Hàn có cái hay của phim Hàn, phim Mỹ có cái hay của phim Mỹ."},
    {"korean": "병은 병대로 종이는 종이대로 나누어서 버리세요.", "vietnamese": "Xin hãy phân loại giấy theo giấy, bình theo bình rồi hãy bỏ đi."},
    {"korean": "여자는 여자대로 남자는 남자대로 따로 앉으세요.", "vietnamese": "Xin hãy ngồi riêng biệt nữ nam theo nam."},
    {"korean": "옷장 안은 겨울옷은 겨울옷대로 여름옷은 여름옷대로 잘 정돈되어 있었다.", "vietnamese": "Trong tủ quần áo đã được sắp xếp ngăn nắp quần áo mùa đông theo quần áo mùa đông, quần áo mùa hè theo quần áo mùa hè."}
  ]'::jsonb,
  ARRAY['N + 나름', 'A/V – (느)냐에 달려 있다']::TEXT[],
  ARRAY['noun-pattern', 'each-own', 'contrast', 'topik4', 'advanced']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '병은 병___ 종이는 종이___ 나누어서 버리세요.', 'fill_blank', '["대로, 대로", "마다, 마다", "처럼, 처럼", "로, 로"]'::jsonb, 0,
  '각자 특성대로 분리: 병대로, 종이대로 → N은/는 N대로'
FROM public.grammar_patterns WHERE pattern = 'N 은/는 N 대로' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '부자는 부자___ 걱정이 있는 법이에요.', 'fill_blank', '["대로", "마다", "처럼", "만큼"]'::jsonb, 0,
  '부자의 고유 특성: 부자대로 → 그 특성에 맞는 내용 뒤따름'
FROM public.grammar_patterns WHERE pattern = 'N 은/는 N 대로' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #243: V – 고도
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 고도',
  'godo',
  'Mà lại... (hành động đã xảy ra nhưng kết quả ngược mong đợi)',
  'advanced',
  'concession',
  'Là hình thái rút gọn của 고 + 아/어도. Thể hiện hành động vế trước đã hoàn thành thì hành động vế sau nối tiếp nhưng kết quả khác với mong đợi. Vế trước và vế sau phải có cùng chủ ngữ.',
  'V + 고도',
  '[
    {"korean": "발을 밟고도 사과는 안 한다면서요? 말도 안 되네요.", "vietnamese": "Giẫm lên chân mà không xin lỗi sao? Thật không tin được."},
    {"korean": "대학까지 졸업하고도 취직이 되지 않아 집에서 놀고 있는 청년들을 말한다.", "vietnamese": "Những thanh niên đã tốt nghiệp đại học mà lại không đi làm và đang chơi ở nhà."},
    {"korean": "이 이야기는 아름답고도 슬픈 이야기입니다.", "vietnamese": "Câu chuyện này hay mà lại là câu chuyện buồn."},
    {"korean": "친구는 술을 많이 마시고도 얼굴색 하나 변하지 않는다.", "vietnamese": "Bạn tôi cho dù có uống nhiều rượu sắc mặt cũng không hề biến đổi."},
    {"korean": "친구는 잘못을 하고도 사과하지 않는다.", "vietnamese": "Bạn ấy đã sai mà lại không xin lỗi."},
    {"korean": "그는 도착하고도 전화하지 않을 것이다.", "vietnamese": "Anh ấy đã đến nơi mà lại không gọi điện thoại báo."}
  ]'::jsonb,
  ARRAY['V – 아/어도', 'A/V – 건만/건마는']::TEXT[],
  ARRAY['concession', 'contrast', 'unexpected-result', 'same-subject', 'topik4', 'advanced']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '친구는 잘못을 하___ 사과하지 않는다.', 'fill_blank', '["고도", "아/어도", "건만", "고서"]'::jsonb, 0,
  '행동+예상 외 결과: 하고도 사과 안 함 → 반전 강조'
FROM public.grammar_patterns WHERE pattern = 'V – 고도' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '친구는 술을 많이 마시___ 얼굴색 하나 변하지 않는다.', 'fill_blank', '["고도", "아/어도", "건만", "고서"]'::jsonb, 0,
  '행동+반전 결과: 마시고도 → 예상 밖 결과'
FROM public.grammar_patterns WHERE pattern = 'V – 고도' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #244: V – 고도 남다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 고도 남다',
  'godo namda',
  'Mà còn rảnh rỗi, là đủ và dư giả',
  'advanced',
  'auxiliary',
  'Thể hiện hành động vế trước đã hoàn thành rồi nhưng vẫn còn dư giả thời gian. Hành động vế trước đã đủ năng lực, khả năng. Diễn đạt ý "không chỉ đủ mà còn dư".',
  'V + 고도 남다',
  '[
    {"korean": "일주일이면 이 실컷 쉬고도 남아요.", "vietnamese": "Một tuần thì đủ thời gian nghỉ ngơi thỏa thích."},
    {"korean": "2시간이면 청소를 다 끝내고도 남아요.", "vietnamese": "2 giờ là thừa để dọn dẹp xong nhà cửa rồi."},
    {"korean": "우리는 복습을 많이 해서 시험을 보고도 남아요.", "vietnamese": "Chúng ta đã ôn tập rất nhiều vậy là đủ để thi rồi."},
    {"korean": "그녀 키가 175cm이면 모델이 되고도 남을 거예요.", "vietnamese": "Cô ấy cao 175cm đủ để làm người mẫu rồi."},
    {"korean": "이 돈이면 여기에 있는 것들을 전부 사고도 남아요.", "vietnamese": "Nếu có chừng này tiền đủ để mua tất cả những thứ có ở đây."},
    {"korean": "민수 씨 정도 실력이면 시험에 합격하고도 남아요.", "vietnamese": "Nếu là mức độ năng lực của Min Su thì thừa để đậu kỳ thi."},
    {"korean": "제대로 먹지도 못하고 일만 하면 병에 걸리고도 남지요.", "vietnamese": "Nếu chỉ làm việc mà không ăn uống tử tế thì đủ để mắc bệnh."}
  ]'::jsonb,
  ARRAY['V – 고도', 'V – 기에 충분하다']::TEXT[],
  ARRAY['auxiliary', 'surplus', 'sufficient', 'topik4', 'advanced']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '2시간이면 청소를 다 끝내___ 남아요.', 'fill_blank', '["고도", "고서도", "고", "아/어도"]'::jsonb, 0,
  '시간 여유: 끝내고도 남아요 → 충분+잉여 표현'
FROM public.grammar_patterns WHERE pattern = 'V – 고도 남다' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '민수 씨 정도 실력이면 시험에 합격하___ 남아요.', 'fill_blank', '["고도", "고서도", "고", "아/어도"]'::jsonb, 0,
  '능력 충분+잉여: 합격하고도 남아요 → 능력이 넘침'
FROM public.grammar_patterns WHERE pattern = 'V – 고도 남다' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- TOPIK V Patterns
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- #242: A/V – 건만/건마는
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 건만/건마는',
  'geonman/geonmaneun',
  'Thế nhưng, nhưng mà (tương phản với kỳ vọng)',
  'advanced',
  'concession',
  'Thể hiện sự xuất hiện của một sự kiện hay động tác nào đó ngược lại với những điều mong đợi hay lý giải từ một sự thật của mệnh đề trước đó. Mang sắc thái văn học, trang trọng.',
  'V + 건만 / A + 건만 / N + 이건만',
  '[
    {"korean": "그는 훌륭한 가수이건만 아무에게도 인정받지 못했다.", "vietnamese": "Anh ấy là một ca sĩ tuyệt vời thế nhưng không được ai công nhận."},
    {"korean": "매번 일찍 와서 친구를 기다리건만 그 친구는 오늘도 늦게 와서 미안하단 말도 없어요.", "vietnamese": "Lần nào tôi cũng đến sớm và đợi bạn thế nhưng hôm nay người bạn đó cũng đến muộn và cũng không nói lời xin lỗi nào."},
    {"korean": "운동을 열심히 하건마는 살은 빠지지 않는다.", "vietnamese": "Chăm chỉ luyện tập thể thao thế nhưng cân nặng không chịu giảm."},
    {"korean": "이 곳에서 많은 물건을 팔건마는 내가 사고 싶은 물건은 없다.", "vietnamese": "Ở đây bán rất nhiều đồ nhưng mà thứ tôi muốn mua lại không có."},
    {"korean": "오늘 해야 할 일이 많건마는 시간이 없다.", "vietnamese": "Hôm nay việc cần làm rất nhiều thế nhưng lại không có thời gian."},
    {"korean": "이 물건은 모양이 예쁘건마는 실용적이지 않은 것 같다.", "vietnamese": "Thứ này kiểu dáng thì đẹp nhưng mà có lẽ không có tính thiết thực."}
  ]'::jsonb,
  ARRAY['V – 지만', 'A/V – 고도', 'A/V – 는데']::TEXT[],
  ARRAY['concession', 'contrast', 'literary', 'unexpected', 'topik5', 'advanced']::TEXT[],
  'TOPIK V'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그는 훌륭한 가수이___ 아무에게도 인정받지 못했다.', 'fill_blank', '["건만", "지만", "고도", "는데"]'::jsonb, 0,
  '예상 외 결과, 문어체: 이건만 → 기대와 반전 강조'
FROM public.grammar_patterns WHERE pattern = 'A/V – 건만/건마는' AND topik_level = 'TOPIK V';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '운동을 열심히 하___ 살은 빠지지 않는다.', 'fill_blank', '["건만", "지만", "고도", "아/어도"]'::jsonb, 0,
  '노력 반전: 하건만 → 문어체 역접'
FROM public.grammar_patterns WHERE pattern = 'A/V – 건만/건마는' AND topik_level = 'TOPIK V';
