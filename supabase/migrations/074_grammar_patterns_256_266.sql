-- Migration 074: Grammar Patterns #256-266

-- ═══════════════════════════════════════════════════════════════════════════════
-- #256: V – 아/어 대다  (TOPIK III)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – 아/어 대다', 'a/eo daeda', 'Cứ... (hành động lặp lại quá mức, tiêu cực)', 'intermediate', 'repetition',
  'Một hành động thường xuyên lặp lại quá mức và liên tục. Thường được sử dụng để mô tả các tình huống tiêu cực. Thường dùng ở dạng 아/어 대서 – 아/어 대면.',
  'V + 아/어 대다',
  '[
    {"korean":"옆집 아이가 계속 울어 대서 잠을 못 자요.","vietnamese":"Đứa bé hàng xóm cứ khóc liên tục nên tôi không tài nào ngủ được."},
    {"korean":"그렇게 패스트푸드를 많이 먹어 대면 건강에 해롭다.","vietnamese":"Nếu cậu cứ ăn nhiều thức ăn nhanh như thế thì sẽ gây hại cho sức khỏe."},
    {"korean":"그렇게 아이에게 잔소리를 해 대면 아이가 스트레스를 받을 거예요.","vietnamese":"Nếu cứ cắn nhằn đứa trẻ hoài như thế thì đứa trẻ sẽ bị stress đó."},
    {"korean":"아침부터 소리를 질러 대서 목이 쉬었어요.","vietnamese":"Vì tớ la hét liên tục từ sáng nên cổ họng bị khàn."},
    {"korean":"우리 아빠가 화가 나면 담배를 피워 대는 버릇이 있어요.","vietnamese":"Bố mình có thói quen mỗi lúc giận đều hút thuốc."},
    {"korean":"그렇게 과자를 먹어 대면 살찔 거야.","vietnamese":"Nếu cậu cứ ăn bánh suốt như vậy sẽ tăng cân đấy."}
  ]'::jsonb,
  ARRAY['V – 기 일쑤이다','V – 곤 하다']::TEXT[],
  ARRAY['repetition','excessive','negative','topik3','intermediate']::TEXT[],
  'TOPIK III'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'옆집 아이가 계속 울___ 잠을 못 자요.','fill_blank','["어 대서","어서","기 일쑤여서","고 있어서"]'::jsonb,0,'과도한 반복+부정적 결과: 울어 대서 → 연속 동작'
FROM public.grammar_patterns WHERE pattern='V – 아/어 대다' AND topik_level='TOPIK III';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'그렇게 과자를 먹___ 살찔 거야.','fill_blank','["어 대면","으면","기 일쑤면","다 보면"]'::jsonb,0,'반복 행동+경고: 먹어 대면 → 지속 반복 경고'
FROM public.grammar_patterns WHERE pattern='V – 아/어 대다' AND topik_level='TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #257: V – 기 일쑤이다  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – 기 일쑤이다', 'gi ilssueida', 'Thường xuyên, hay... (hành vi không mong muốn thường lặp)', 'advanced', 'repetition',
  'Thể hiện việc thực hiện một hành vi không mong muốn nào đó thường xuyên. Thường mang hàm ý tiêu cực hoặc không tốt.',
  'V + 기 일쑤이다 / V + 기 일쑤예요',
  '[
    {"korean":"나이가 들어서 그런지 조금 전에 생각했던 일도 금방 잊어버리기 일쑤이다.","vietnamese":"Có lẽ vì đã lớn tuổi nên việc vừa suy nghĩ lúc nãy xong cũng thường quên đi ngay lập tức."},
    {"korean":"대학에 다닐 때 리포트 제출일이 코앞에 닥치면 밤을 새우기 일쑤예요.","vietnamese":"Khi học đại học, nếu sắp đến hạn nộp báo cáo thì thường thức cả đêm."},
    {"korean":"유리는 요리를 할 때 칼질이 서툴러서 다치기 일쑤이다.","vietnamese":"Khi Yu-ri nấu nướng, do việc cắt gọt vụng về nên thường xuyên bị thương."},
    {"korean":"나는 덜렁거리는 성격 때문에 물건을 잃어버리기 일쑤이다.","vietnamese":"Tôi vì tính cẩu thả mà thường xuyên đánh rơi mất đồ."},
    {"korean":"늦게 자는 버릇 때문에 잠이 모자라서 수업 시간에 졸기 일쑤이다.","vietnamese":"Vì thói quen ngủ trễ dẫn đến thiếu ngủ nên tôi thường xuyên buồn ngủ trong giờ học."},
    {"korean":"옛날에는 술만 마시면 친구랑 싸우기 일쑤였지만 지금은 그 버릇을 고쳤다.","vietnamese":"Ngày trước chỉ cần uống rượu là tôi thường hay đánh lộn với bạn nhưng bây giờ thói quen đó đã sửa rồi."}
  ]'::jsonb,
  ARRAY['V – 아/어 대다','V – 곤 하다']::TEXT[],
  ARRAY['repetition','habitual','negative','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'나이가 드니 중요한 일을 잊어버리___ 이다.','fill_blank','["기 일쑤","아/어 대","곤","는 편"]'::jsonb,0,'불원 반복 습관: 잊어버리기 일쑤 → 부정적 반복'
FROM public.grammar_patterns WHERE pattern='V – 기 일쑤이다' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'늦게 자는 버릇 때문에 수업 시간에 졸___ 이다.','fill_blank','["기 일쑤","아/어 대","곤","는 편"]'::jsonb,0,'습관적 부정 행동: 졸기 일쑤 → 원치 않는 반복'
FROM public.grammar_patterns WHERE pattern='V – 기 일쑤이다' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #258: V – 는 둥 마는 둥 하다  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – 는 둥 마는 둥 하다', 'neun dung maneun dung hada', 'Làm cũng như không làm, làm qua loa, làm cho có', 'advanced', 'degree',
  'Không làm chăm chỉ hoặc hoàn toàn không làm một hành vi nào đó. Thể hiện hành động được thực hiện một cách thiếu nhiệt tình, qua loa, không đến nơi đến chốn.',
  'V + 는 둥 마는 둥 하다',
  '[
    {"korean":"요즘 입맛이 없어서 밥을 먹는 둥 마는 둥 했더니 살이 빠졌다.","vietnamese":"Dạo này ăn không ngon miệng nên tôi ăn cho có và đã bị sụt cân."},
    {"korean":"지민 씨는 요즘 가족에 대한 그리움 때문에 회사 일을 하는 둥 마는 둥 해요.","vietnamese":"Jimin dạo này vì nỗi nhớ gia đình mà làm việc công ty lơ là làm qua loa cho có."},
    {"korean":"아침에 늦게 일어나서 밥을 먹는 둥 마는 둥 하고 집을 나오는 사람이 많아요.","vietnamese":"Có rất nhiều người do dậy muộn vào buổi sáng nên chỉ ăn qua loa cho có rồi rời khỏi nhà."},
    {"korean":"너무 졸려서 숙제를 하는 둥 마는 둥 하다가 그냥 자 버렸다.","vietnamese":"Vì quá buồn ngủ nên tôi làm bài tập cho có và cứ thế đi ngủ."},
    {"korean":"머리가 복잡해서 수업을 듣는 둥 마는 둥 했다.","vietnamese":"Đầu óc rối bời nên tôi nghe giảng cũng như không."}
  ]'::jsonb,
  ARRAY['V – 기 일쑤이다','V – 아/어 대다']::TEXT[],
  ARRAY['degree','halfhearted','careless','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'입맛이 없어서 밥을 먹___ 했더니 살이 빠졌다.','fill_blank','["는 둥 마는 둥","기 일쑤","아/어 대","는 척"]'::jsonb,0,'불성실한 행동: 먹는 둥 마는 둥 → 제대로 못 먹음'
FROM public.grammar_patterns WHERE pattern='V – 는 둥 마는 둥 하다' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'너무 졸려서 숙제를 하___ 하다가 자 버렸다.','fill_blank','["는 둥 마는 둥","기 일쑤","아/어 대","는 척"]'::jsonb,0,'형식적 행동+중단: 하는 둥 마는 둥 → 건성으로 함'
FROM public.grammar_patterns WHERE pattern='V – 는 둥 마는 둥 하다' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #259: A/V – (으)리만치  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)리만치', 'eurimanche', 'Đến mức..., đến nỗi... (nhấn mạnh mức độ cực đoan)', 'advanced', 'degree',
  'Nhấn mạnh nội dung của mệnh đề sau bằng cách chỉ ra mức độ mà tình huống hoặc trạng thái của sự việc trong mệnh đề trước mô tả nó. Thường được dùng theo nghĩa ẩn dụ. Biểu hiện tương tự: (으)리만큼, (으)ㄹ 정도로.',
  'V + (으)리만치 / A + (으)리만치',
  '[
    {"korean":"서울의 야경이 말로 표현할 수 없으리만치 아름답다.","vietnamese":"Cảnh đêm Seoul đẹp đến mức không thể diễn tả bằng lời được."},
    {"korean":"앞이 잘 보이지 않으리만치 비가 많이 와요.","vietnamese":"Trời mưa nhiều đến nỗi không thể nhìn thấy rõ phía trước."},
    {"korean":"합격 발표를 앞두고 대기실은 무서우리만치 팽팽한 긴장이 감돌았다.","vietnamese":"Trước thông báo trúng tuyển, cả phòng chờ căng thẳng đến đáng sợ."},
    {"korean":"창밖에는 한 치 앞도 안 보이리만치 폭우가 쏟아지고 있다.","vietnamese":"Ngoài cửa sổ, trời mưa tầm tã đến nỗi không thể nhìn thấy."},
    {"korean":"오늘날의 과학 기술은 몇 년 앞을 예측할 수 없으리만치 빠른 속도로 발전하고 있다.","vietnamese":"Khoa học và công nghệ ngày nay đang phát triển với tốc độ khó lường trong vài năm tới."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 정도로','A/V – 다 못해']::TEXT[],
  ARRAY['degree','extreme','metaphorical','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'서울의 야경이 말로 표현할 수 없___ 아름답다.','fill_blank','["으리만치","을 정도로","을 만큼","다 못해"]'::jsonb,0,'극도 수준 묘사: 없으리만치 → 설명 불가 수준 강조'
FROM public.grammar_patterns WHERE pattern='A/V – (으)리만치' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'앞이 잘 보이지 않___ 비가 많이 와요.','fill_blank','["으리만치","을 정도로","을 만큼","다 못해"]'::jsonb,0,'정도 극대화: 않으리만치 → 시야 제로 수준 강조'
FROM public.grammar_patterns WHERE pattern='A/V – (으)리만치' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #260: A/V – 다 못해  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – 다 못해', 'da mothae', 'Không thể V hơn nữa / A đến độ... (cực điểm vượt quá)', 'advanced', 'degree',
  'Hành động hoặc trạng thái của sự việc ở mệnh đề trước đã đạt đến mức độ cực điểm và không thể duy trì được nữa. Với động từ: không thể V hơn nữa/thêm nữa; với tính từ: A đến độ...',
  'V + 다 못해 / A + 다 못해',
  '[
    {"korean":"지수 씨가 우유부단하다 못해 매일 입을 옷을 고르는 데에도 30분이나 걸려요.","vietnamese":"Jisoo thiếu quyết đoán đến nỗi mỗi ngày chọn quần áo để mặc hết tận 30 phút."},
    {"korean":"지수는 힘든 일정을 견디다 못해 쓰러지고 말았다.","vietnamese":"Ji-su đã gục ngã vì không thể chịu đựng hơn nữa lịch trình vất vả."},
    {"korean":"나와 동생의 싸움을 보다 못하여 아버지는 결국 크게 화를 내셨다.","vietnamese":"Không thể nhìn cảnh đánh lộn của anh em tôi thêm nữa, kết cục ba tôi đã nổi trận lôi đình."},
    {"korean":"나에 대한 무시와 폭언을 참다 못해 힘들게 내린 결정이야.","vietnamese":"Đó là quyết định khó khăn nhưng tôi không thể chịu đựng hơn nữa sự khinh thường và mắng chửi mình."},
    {"korean":"눈으로 덮인 산은 희다 못해 눈이 시리다.","vietnamese":"Núi phủ tuyết trắng đến độ lóa cả mắt."},
    {"korean":"아무도 없는 학교는 조용하다 못해 무섭기까지 했다.","vietnamese":"Ngôi trường không có ai yên lặng đến độ đáng sợ luôn."}
  ]'::jsonb,
  ARRAY['A/V – (으)리만치','A/V – (으)ㄹ 정도로']::TEXT[],
  ARRAY['degree','limit','beyond-extreme','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'힘든 일정을 견디___ 쓰러지고 말았다.','fill_blank','["다 못해","다 보니","기는커녕","고도"]'::jsonb,0,'한계 초과+결과: 견디다 못해 → 극한 초과 후 결과'
FROM public.grammar_patterns WHERE pattern='A/V – 다 못해' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'조용하___ 무섭기까지 했다.','fill_blank','["다 못해","을 정도로","리만치","을 만큼"]'::jsonb,0,'형용사 극한: 조용하다 못해 → 수준 초과 묘사'
FROM public.grammar_patterns WHERE pattern='A/V – 다 못해' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #261: V – (으)ㄴ다는 것이  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – (으)ㄴ다는 것이', 'eundaneun geosi', 'Định... nhưng không ngờ lại... (hành động nhầm lẫn)', 'advanced', 'mistake',
  'Định thực hiện một hành động nào đó nhưng kết quả lại làm hành động khác mà mình không ngờ đến. Hai mệnh đề phải có cùng chủ ngữ.',
  'V + (으)ㄴ다는 것이',
  '[
    {"korean":"쓰레기를 버린다는 것이 휴대폰을 버리고 말았어요.","vietnamese":"Tôi định vứt rác nhưng không ngờ lại vứt nhầm điện thoại."},
    {"korean":"친구에게 문자 메시지를 보낸다는 것이 선생님에게 잘못 보냈어요.","vietnamese":"Tôi định gửi tin nhắn cho bạn nhưng không ngờ lại gửi nhầm cho thầy giáo."},
    {"korean":"국에 소금을 넣는다는 것이 설탕을 넣었어요.","vietnamese":"Tôi định cho muối vào canh nhưng đã cho nhầm đường vào."},
    {"korean":"서류에 친구 이름을 적는다는 것이 내 이름을 적었어요.","vietnamese":"Tôi định ghi tên của bạn vào tài liệu nhưng lại ghi nhầm tên của tôi."},
    {"korean":"5만 원짜리를 낸다는 것이 그만 5천 원짜리를 냈어요.","vietnamese":"Tôi định đưa tờ trị giá 50 nghìn won nhưng lại đưa nhầm tờ 5 nghìn won."}
  ]'::jsonb,
  ARRAY['V – (으)려다가','V – (으)려고 했는데']::TEXT[],
  ARRAY['mistake','unintended','same-subject','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'쓰레기를 버린다는 것이 휴대폰을 버리고 말았어요. 이 문장에서 밑줄 친 부분의 의미는?','multiple_choice','["버리려고 했으나 실수했다","버리지 않았다","버리고 후회했다","버릴 예정이었다"]'::jsonb,0,'의도+실수 결과: 버린다는 것이 → 의도와 다른 결과 발생'
FROM public.grammar_patterns WHERE pattern='V – (으)ㄴ다는 것이' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'국에 소금을 넣___ 설탕을 넣었어요.','fill_blank','["는다는 것이","으려다가","(으)려고 했는데","기로 했는데"]'::jsonb,0,'실수 행동: 넣는다는 것이 → 의도 행동과 다른 결과'
FROM public.grammar_patterns WHERE pattern='V – (으)ㄴ다는 것이' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #262: V – (으)려고 들다  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – (으)려고 들다', 'euryeogo deulda', 'Định, quyết tâm định... (nỗ lực mạnh mẽ để đạt mục đích)', 'advanced', 'intention',
  'Biểu thị nỗ lực mạnh mẽ của đối tượng để đạt được mục đích hoặc mục đích nào đó. Thường mang hàm ý mạnh mẽ, kiên quyết hoặc đôi khi cố chấp.',
  'V + (으)려고 들다',
  '[
    {"korean":"우리 어머니가 무조건 유기농 식품을 사려고 들어요.","vietnamese":"Mẹ của mình nhất định phải mua thực phẩm hữu cơ vô điều kiện."},
    {"korean":"온 국민이 힘을 합쳐 함께 어려운 상황을 극복하려고 들면 못 할 일이 없어요.","vietnamese":"Nếu toàn dân cùng hợp sức để khắc phục tình huống khó khăn thì không có việc gì là không thể."},
    {"korean":"일을 배우려고 들면 금방 배워요.","vietnamese":"Nếu muốn học việc thì học ngay."},
    {"korean":"그녀 자신의 실수를 인정하지 않으려고 들었어요.","vietnamese":"Cô ấy nhất định không nhận cái sai của mình."},
    {"korean":"남동생은 나보다 네 살이나 어린데도 항상 나를 이기려고 들어요.","vietnamese":"Em trai nhỏ hơn tôi 4 tuổi nhưng lúc nào cũng đòi thắng tôi bằng được."}
  ]'::jsonb,
  ARRAY['V – (으)려고 하다','V – (으)려다가']::TEXT[],
  ARRAY['intention','strong-will','persistent','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'어머니가 무조건 유기농 식품을 사___ 요.','fill_blank','["려고 들어","려고 해","기로 해","려다가"]'::jsonb,0,'강한 의지+집착: 사려고 들다 → 반드시 하려는 태도'
FROM public.grammar_patterns WHERE pattern='V – (으)려고 들다' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'그녀 자신의 실수를 인정하지 않___ 요.','fill_blank','["으려고 들었어","으려다가","으려고 했어","을 뻔 했어"]'::jsonb,0,'강한 거부 의지: 않으려고 들다 → 완고한 태도'
FROM public.grammar_patterns WHERE pattern='V – (으)려고 들다' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #263: V – (으)려다가  (TOPIK III)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – (으)려다가', 'euryeodaga', 'Đang định... nhưng lại... (ý định bị thay đổi hoặc từ bỏ)', 'intermediate', 'intention',
  'Chủ ngữ đã có ý định làm một số hành động nhưng sau đó quyết định bỏ việc hoặc làm điều gì đó khác thay thế. Chủ ngữ của cả 2 vế phải đồng nhất.',
  'V + (으)려다가',
  '[
    {"korean":"피자를 시켜 먹으려다가 살이 찔 것 같아서 참았어요.","vietnamese":"Mình định gọi pizza về ăn nhưng sợ tăng cân nên lại thôi."},
    {"korean":"다른 회사로 옮기려다가 생각이 바뀌어서 그냥 있기로 했어.","vietnamese":"Tớ định chuyển sang công ty khác thì thay đổi suy nghĩ và đã quyết định ở lại."},
    {"korean":"외출을 하려다가 비가 와서 그만 두었습니다.","vietnamese":"Tôi định ra ngoài thì trời mưa nên lại thôi."},
    {"korean":"테니스를 치려다가 밖에 너무 추워서 집에서 책을 읽었다.","vietnamese":"Tôi định đi chơi tennis nhưng bên ngoài trời lạnh quá nên tớ đã ở nhà đọc sách."},
    {"korean":"택시를 타고 가려다가 눈이 와서 지하철을 타고 갔다.","vietnamese":"Tớ định đi taxi nhưng vì tuyết rơi nên tớ đã đi tàu điện ngầm."},
    {"korean":"공을 잡으려다가 바닥이 미끄러워서 넘어졌다.","vietnamese":"Tớ định bắt bóng nhưng sàn trơn quá nên đã bị ngã."}
  ]'::jsonb,
  ARRAY['V – (으)려고 했는데','V – (으)ㄴ다는 것이']::TEXT[],
  ARRAY['intention','change-of-plan','same-subject','topik3','intermediate']::TEXT[],
  'TOPIK III'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'피자를 시켜 먹___ 살이 찔 것 같아서 참았어요.','fill_blank','["으려다가","으려고 했는데","다 보니","고 나서"]'::jsonb,0,'의도+포기: 먹으려다가 → 계획 변경'
FROM public.grammar_patterns WHERE pattern='V – (으)려다가' AND topik_level='TOPIK III';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'택시를 타고 가___ 눈이 와서 지하철을 타고 갔다.','fill_blank','["려다가","려고 했는데","다 보니","고 나서"]'::jsonb,0,'의도+대체 행동: 가려다가 → 상황으로 인한 변경'
FROM public.grammar_patterns WHERE pattern='V – (으)려다가' AND topik_level='TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #264: A/V – 는 듯이  (TOPIK III)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – 는 듯이', 'neun deutii', 'Cứ như là, như thể là... (so sánh trạng thái)', 'intermediate', 'comparison',
  'Thể hiện động tác hay trạng thái ở vế câu sau tương tự, gần giống như hoặc có thể phỏng đoán do liên quan đến nội dung nêu lên ở vế câu trước. Khác với 듯이 đơn giản, 는 듯이 thường nhấn mạnh trạng thái/hành động quan sát được.',
  'V + 는 듯이 / A + (으)ㄴ 듯이',
  '[
    {"korean":"동생이 피곤해서 죽은 듯이 잠을 자요.","vietnamese":"Em tôi mệt rồi ngủ như chết."},
    {"korean":"제주도 경치가 숨이 막힐 듯이 아름다워요.","vietnamese":"Phong cảnh Jeju đẹp như đến nghẹt thở."},
    {"korean":"그는 아무 것도 안 들리는 듯이 가만히 있었다.","vietnamese":"Anh ấy lặng thinh như thể không nghe thấy bất cứ thứ gì."},
    {"korean":"그는 귀찮은 듯이 대충 대답을 했다.","vietnamese":"Anh ấy đã trả lời đại khái như thể là đang bực mình."},
    {"korean":"교실에는 아무도 없는 듯이 불이 꺼져 있었다.","vietnamese":"Đèn đã tắt cứ như là không có một ai ở phòng học."},
    {"korean":"그는 자고 있는 듯이 아무 대답이 없었다.","vietnamese":"Anh ấy không có bất kỳ hồi đáp gì như thể là đang ngủ."}
  ]'::jsonb,
  ARRAY['A/V – 듯이','A/V – 는 것처럼']::TEXT[],
  ARRAY['comparison','appearance','topik3','intermediate']::TEXT[],
  'TOPIK III'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'동생이 죽은___ 잠을 자요.','fill_blank','["듯이","것처럼","만큼","대로"]'::jsonb,0,'상태 비유: 죽은 듯이 → 상태 유사 묘사'
FROM public.grammar_patterns WHERE pattern='A/V – 는 듯이' AND topik_level='TOPIK III';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'그는 귀찮은___ 대충 대답을 했다.','fill_blank','["듯이","것처럼","만큼","대로"]'::jsonb,0,'태도 추측 비유: 귀찮은 듯이 → 그런 것처럼 행동'
FROM public.grammar_patterns WHERE pattern='A/V – 는 듯이' AND topik_level='TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #265: A/V – (느)ㄴ다는 듯이  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (느)ㄴ다는 듯이', 'neundaneun deutii', 'Như thể nói rằng... (hành động ngụ ý lời nói)', 'advanced', 'comparison',
  'Hành vi được mô tả trong mệnh đề sau giống như được mô tả trong mệnh đề trước mặc dù chủ thể chưa bao giờ thực sự nói nội dung của mệnh đề trước. Diễn tả hành động ngụ ý một thông điệp nhất định.',
  'V + (느)ㄴ다는 듯이 / A + 다는 듯이',
  '[
    {"korean":"백화점 직원이 옷을 보여 주자 수진 씨가 마음에 안 든다는 듯이 얼굴을 찌푸렸어요.","vietnamese":"Khi nhân viên trung tâm thương mại đưa cho xem quần áo, Sujin đã nhăn mặt như thể nói rằng không hài lòng."},
    {"korean":"남자 친구가 지루하다는 듯이 계속 하품을 해 댔어요.","vietnamese":"Bạn trai liên tục ngáp như thể nói rằng chán."},
    {"korean":"아이는 내 말을 잘 알겠다는 듯이 고개를 끄덕였어요.","vietnamese":"Đứa trẻ gật đầu như thể nói rằng hiểu rõ lời tôi nói."},
    {"korean":"동생은 귀찮다는 듯이 다른 데만 쳐다보고 있었다.","vietnamese":"Em tôi vẫn chỉ nhìn chằm chằm vào chỗ khác như thể nói rằng phiền phức."},
    {"korean":"잘 했다는 듯이 오빠는 엄지손가락을 치켜 올렸다.","vietnamese":"Anh trai giơ ngón tay cái lên như thể nói rằng đã làm tốt lắm."}
  ]'::jsonb,
  ARRAY['A/V – 는 듯이','A/V – 듯이']::TEXT[],
  ARRAY['comparison','implied-speech','behavior','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'남자 친구가 지루하___ 계속 하품을 해 댔어요.','fill_blank','["다는 듯이","는 듯이","다고 하듯이","는 것처럼"]'::jsonb,0,'암묵적 의사 표현: 지루하다는 듯이 → 말하지 않았지만 행동으로 표현'
FROM public.grammar_patterns WHERE pattern='A/V – (느)ㄴ다는 듯이' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'아이는 잘 알겠___ 고개를 끄덕였어요.','fill_blank','["다는 듯이","는 듯이","다고 하듯이","는 것처럼"]'::jsonb,0,'이해 표시 행동: 알겠다는 듯이 → 무언의 메시지 행동'
FROM public.grammar_patterns WHERE pattern='A/V – (느)ㄴ다는 듯이' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #266: A/V – (으)ㄴ/는/(으)ㄹ 듯하다  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)ㄴ/는/(으)ㄹ 듯하다', 'eun/neun/eul deutada', 'Có vẻ như... (phỏng đoán trang trọng)', 'advanced', 'conjecture',
  'Được sử dụng khi người nói đang giả định hoặc suy đoán về một số sự kiện hoặc tình huống. Biểu hiện này trang trọng hơn 는 것 같다. Biểu hiện tương tự: 는 듯싶다.',
  'V + 는 듯하다 / A + (으)ㄴ 듯하다 / V + (으)ㄹ 듯하다',
  '[
    {"korean":"가수 지수는 팬을 보고 감동을 받은 듯했어요.","vietnamese":"Ca sĩ Jisoo có vẻ như đã rất cảm động khi nhìn thấy fan."},
    {"korean":"서울에는 다른 도시들보다 훨씬 많은 사람들이 살고 있는 듯해요.","vietnamese":"Có vẻ như so với mấy thành phố khác thì ở Seoul có nhiều người đang sống hơn."},
    {"korean":"오늘 날씨 좀 추운 듯해요.","vietnamese":"Thời tiết hôm nay có vẻ như hơi lạnh."},
    {"korean":"눈이 올 듯하니 우산을 가지고 가라.","vietnamese":"Chắc sẽ có tuyết rơi nên hãy mang theo dù đi."},
    {"korean":"그는 이야기를 할 듯하다가 그만두었다.","vietnamese":"Anh ta có vẻ như muốn nói điều gì rồi lại thôi."},
    {"korean":"코로나 확진자가 줄어들지 않으면 경제에 큰 영향을 미칠 듯하다.","vietnamese":"Nếu số người lây nhiễm Covid-19 không giảm thì có thể nó sẽ tác động lớn đến nền kinh tế."}
  ]'::jsonb,
  ARRAY['A/V – 는 것 같다','A/V – (으)ㄴ/는/(으)ㄹ 듯싶다']::TEXT[],
  ARRAY['conjecture','formal','assumption','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'오늘 날씨 좀 추운___.','fill_blank','["듯해요","것 같아요","듯싶어요","듯하다가"]'::jsonb,0,'격식체 추측: 추운 듯해요 → 는 것 같다보다 격식'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄴ/는/(으)ㄹ 듯하다' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'눈이 올___ 우산을 가지고 가라.','fill_blank','["듯하니","것 같으니","듯싶으니","듯하다가"]'::jsonb,0,'미래 추측+권고: 올 듯하니 → 근거 기반 추측'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄴ/는/(으)ㄹ 듯하다' AND topik_level='TOPIK IV';
