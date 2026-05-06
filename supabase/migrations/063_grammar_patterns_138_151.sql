-- Migration 063: Insert TOPIK grammar patterns #138-151 (Intermediate level)
-- Ngữ pháp TOPIK #138-151 (Trung cấp)

-- ═══════════════════════════════════════════════════════════════════════════════
-- #138: N – 만 해도
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – 만 해도',
  'man haedo',
  'Chỉ tính riêng...',
  'intermediate',
  'example',
  'Đưa ra các ví dụ giải thích cho một hoàn cảnh hay tình huống nào đó.',
  'N + 만 해도',
  '[
    {"korean": "집안일이 시간이 많이 걸려요. 청소만 해도 1 시간이나 걸려요.", "vietnamese": "Làm việc nhà tốn nhiều thời gian thật đấy. Chỉ tính riêng dọn dẹp thôi đã mất tận 1 tiếng."},
    {"korean": "가: 요즘 물가가 많이 상승한 것 같아요. 나: 네, 채소값만 해도 10%나 올랐어요.", "vietnamese": "가: Dạo này vật giá có vẻ tăng cao. 나: Vâng, chỉ tính riêng giá rau củ quả đã tăng lên tận 10%."},
    {"korean": "생활비가 얼마나 많이 드는지 몰라요. 교통비만 해도 한 달에 15 만 원 정도가 들어요.", "vietnamese": "Phí sinh hoạt không biết tốn kém nhiều đến thế nào nữa. Chỉ tính riêng phí giao thông thôi, mỗi tháng đã tốn hết 150.000 won."},
    {"korean": "민선 씨가 요즘 정말 열심히 공부하는 것 같아요. 어제만 해도 밤 10 시까지 도서관에서 공부하더라고요.", "vietnamese": "Dạo này Minseon học có vẻ chăm chỉ. Chỉ tính riêng ngày hôm qua thôi, cô ấy đã học đến 10h tại thư viện."},
    {"korean": "일본 만화는 정말 유명한 것 같아요. 도라에몽만 해도 모르는 사람이 없잖아요.", "vietnamese": "Truyện tranh Nhật Bản có vẻ thực sự nổi tiếng. Chỉ riêng như truyện Doremon không ai là không biết."}
  ]'::jsonb,
  ARRAY['–만', '–조차', '–마저']::TEXT[],
  ARRAY['example', 'emphasis', 'minimum', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '청소__ 해도 1 시간이나 걸려요.', 'fill_blank', '["만", "조차", "마저", "까지"]'::jsonb, 0,
  'Chỉ tính riêng → 청소만 해도.'
FROM public.grammar_patterns WHERE pattern = 'N – 만 해도' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '채소값__ 해도 10%나 올랐어요.', 'fill_blank', '["만", "조차", "마저", "까지"]'::jsonb, 0,
  'Chỉ tính riêng → 채소값만 해도.'
FROM public.grammar_patterns WHERE pattern = 'N – 만 해도' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #139: A/V – (으)ㄹ 정도로
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ 정도로',
  '(eu)l jeongdoro',
  'Đến mức, đến nỗi...',
  'intermediate',
  'degree',
  'Diễn tả hành động ở mệnh đề sau diễn ra ở một mức độ tương đương với những gì được miêu tả ở mệnh đề trước. Thường sử dụng dưới hình thức: (으)ㄹ 정도로 hoặc (으)ㄹ 정도이다.',
  'A/V + (으)ㄹ 정도로',
  '[
    {"korean": "저는 10 번이나 볼 정도로 그 영화를 좋아해요.", "vietnamese": "Tôi thích phim đó đến mức xem tận 10 lần."},
    {"korean": "다리가 너무 아파서 못 걸을 정도예요.", "vietnamese": "Chân tôi đau đến mức không thể đi được."},
    {"korean": "비가 하도 와서 앞이 안 보일 정도예요.", "vietnamese": "Mưa to quá đến mức không nhìn thấy gì phía trước cả."},
    {"korean": "죽을 정도로 날씨가 더워요.", "vietnamese": "Thời tiết nắng nóng đến mức chết người."},
    {"korean": "정신을 못 차릴 정도로 술을 마시면 어떻게 합니까?", "vietnamese": "Uống rượu đến nỗi không thể tỉnh táo thì biết làm sao đây?"},
    {"korean": "아프지만 결석할 정도는 아니에요.", "vietnamese": "Đau nhưng không đến nỗi phải vắng mặt đâu ạ."},
    {"korean": "평소에 화를 안 내던 민수 씨가 화를 낼 정도로 지수 씨가 나쁜 짓을 한 거예요?", "vietnamese": "Mọi khi Minsu rất điềm tĩnh. Jisu đã làm việc gì sai đến mức Minsu lại giận thế?"}
  ]'::jsonb,
  ARRAY['–(으)ㄹ 만큼', '–(으)ㄹ 지경이다']::TEXT[],
  ARRAY['degree', 'extent', 'intensity', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '저는 10 번이나 볼 __ 그 영화를 좋아해요.', 'fill_blank', '["정도로", "정도", "만큼", "지경"]'::jsonb, 0,
  'Đến mức → 볼 정도로.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 정도로' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '다리가 너무 아파서 못 걸__예요.', 'fill_blank', '["을 정도", "을 만큼", "을 지경", "을 정도로"]'::jsonb, 0,
  'Đến mức → 걸을 정도예요.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 정도로' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #140: A/V – (으)ㄹ 지경이다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ 지경이다',
  '(eu)l jigyeongida',
  'Đến mức, đến nỗi...',
  'intermediate',
  'degree',
  'Diễn tả hành động ở mệnh đề sau diễn ra ở một mức độ tương đương với những gì được miêu tả ở mệnh đề trước.',
  'A/V + (으)ㄹ 지경이다',
  '[
    {"korean": "그 사람이 보고 싶어서 미칠지경이다.", "vietnamese": "Nhớ người đó đến mức phát điên."},
    {"korean": "시험을 망쳐서 눈물이 날 지경이다.", "vietnamese": "Thi tệ đến mức mà tôi muốn khóc."},
    {"korean": "너무 많이 걸었더니 쓰러질 지경이에요.", "vietnamese": "Đi bộ quá nhiều đến mức gần như ngất xỉu."},
    {"korean": "빚은 더 이상 내가 감당할 수 없는 지경에 이르렀다.", "vietnamese": "Món nợ đã nhiều đến mức tôi không thể gánh nổi nữa."},
    {"korean": "친구는 계속 잘 달렸지만 나는 힘들어서 죽을 지경이었다.", "vietnamese": "Bạn tôi vẫn chạy khỏe nhưng tôi thì mệt chết đi được."}
  ]'::jsonb,
  ARRAY['–(으)ㄹ 정도로', '–(으)ㄹ 만큼']::TEXT[],
  ARRAY['degree', 'extreme', 'negative', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그 사람이 보고 싶어서 미칠__.', 'fill_blank', '["지경이다", "정도이다", "만큼이다", "정도로"]'::jsonb, 0,
  'Đến mức tiêu cực → 미칠지경이다.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 지경이다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '시험을 망쳐서 눈물이 날 __.', 'fill_blank', '["지경이다", "정도이다", "만큼이다", "정도로"]'::jsonb, 0,
  'Đến mức → 눈물이 날 지경이다.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 지경이다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #141: N - 만 하다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N - 만 하다',
  'man hada',
  'Như, bằng với...',
  'intermediate',
  'comparison',
  'So sánh giữa hai vật, hai việc có số lượng, kích thước, hay mức độ tương đương nhau.',
  'N + 만 하다',
  '[
    {"korean": "월급이 쥐꼬리만 해서 살기가 매우 힘들어요.", "vietnamese": "Lương như đuôi chuột (lương bèo bọt) nên sống rất vất vả."},
    {"korean": "가: 그 친구는 얼굴이 정말 작네요. 나: 맞아요, 주먹만 하네요.", "vietnamese": "가: Bạn đó mặt nhỏ thật đấy. 나: Đúng vậy, mặt nhỏ bằng nắm tay ý nhỉ."},
    {"korean": "어른 팔뚝만 한 물고기를 잡았어요.", "vietnamese": "Tôi đã bắt được con cá to bằng bắp tay người lớn."},
    {"korean": "방이 운동장만 해요.", "vietnamese": "Phòng (to) như sân vận động."},
    {"korean": "열다섯 살인 동생의 키가 벌써 스무 살인 형만 하네요!", "vietnamese": "Người em 15 tuổi mà to cao như người anh 20 tuổi."}
  ]'::jsonb,
  ARRAY['N - 만 못하다', '–(으)ㄹ 만큼', '–처럼']::TEXT[],
  ARRAY['comparison', 'equivalence', 'size', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '주먹__ 하네요.', 'fill_blank', '["만", "만 못", "만큼", "처럼"]'::jsonb, 0,
  'Bằng với → 주먹만 하네요.'
FROM public.grammar_patterns WHERE pattern = 'N - 만 하다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '방이 운동장__ 해요.', 'fill_blank', '["만", "만 못", "만큼", "처럼"]'::jsonb, 0,
  'Như → 운동장만 해요.'
FROM public.grammar_patterns WHERE pattern = 'N - 만 하다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #142: A/V - (으)ㄴ/는 /(으)ㄹ 만큼
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V - (으)ㄴ/는 /(으)ㄹ 만큼',
  '(eu)n/neun/(eu)l mankeum',
  'Như, bằng với...',
  'intermediate',
  'comparison',
  'Diễn tả hành động hoặc trạng thái mô tả ở mệnh đề trước tương đương với trạng thái ở mệnh đề sau.',
  'A + ㄴ 만큼 / V + 는 만큼 / V + (으)ㄹ 만큼',
  '[
    {"korean": "최선을 다한 만큼 좋은 결과를 얻을 거예요.", "vietnamese": "Bạn sẽ nhận được kết quả tốt tương xứng với sự nỗ lực hết mình của bạn."},
    {"korean": "늘 노력하는 만큼 성공할 수 있다고 한다.", "vietnamese": "Người ta nói rằng bạn có thể thành công tương xứng với sự nỗ lực chăm chỉ của bạn."},
    {"korean": "돈을 많이 내는 만큼 좋은 서비스를 받을 수 있을 거예요.", "vietnamese": "Bạn sẽ nhận được dịch vụ tốt bằng với số tiền bạn bỏ ra."},
    {"korean": "사람들은 보통 아픈 만큼 성숙해진다고 말을 합니다.", "vietnamese": "Người ta nói rằng đau khổ chừng nào con người sẽ trưởng thành chừng đó."},
    {"korean": "시험의 결과는 공부하는 만큼 나오는 것 같다.", "vietnamese": "Kết quả thi có lẽ là đạt được tương ứng với việc học tập."},
    {"korean": "가: 돈을 얼마씩 내면 돼요? 나: 각자 먹은 만큼 내면 될 것 같아요.", "vietnamese": "가: Tôi phải trả bao nhiêu tiền? 나: Mỗi người ăn bao nhiêu, trả bấy nhiêu."}
  ]'::jsonb,
  ARRAY['–(으)ㄹ 정도로', 'N - 만 하다', '–처럼']::TEXT[],
  ARRAY['comparison', 'equivalence', 'proportion', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '최선을 다한 __ 좋은 결과를 얻을 거예요.', 'fill_blank', '["만큼", "정도로", "만 하다", "지경"]'::jsonb, 0,
  'Tương xứng → 다한 만큼.'
FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄴ/는 /(으)ㄹ 만큼' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '각자 먹은 __ 내면 될 것 같아요.', 'fill_blank', '["만큼", "정도로", "만 하다", "지경"]'::jsonb, 0,
  'Bao nhiêu trả bấy nhiêu → 먹은 만큼.'
FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄴ/는 /(으)ㄹ 만큼' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #143: V – 고 보니(까)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 고 보니(까)',
  'go boni(kka)',
  'Thử... rồi mới biết / rồi mới nhận ra...',
  'intermediate',
  'discovery',
  'Sau khi hoàn thành hành động nào đó thì phát hiện thông tin mới hoặc một điều gì đó khác với suy nghĩ của mình. Kết thúc câu chủ yếu ở hình thái quá khứ.',
  'V + 고 보니(까)',
  '[
    {"korean": "버스를 타고 보니 잘못 탔어요.", "vietnamese": "Bắt xe buýt rồi mới nhận ra bắt nhầm xe."},
    {"korean": "유학하고 보니 외롭고 부모님이 그리워요.", "vietnamese": "Đi du học rồi mới thấy cô đơn và nhớ bố mẹ."},
    {"korean": "학교 다닐 때는 빨리 졸업하고 싶었는데 막상 졸업하고 보니 다시 학교 다니고 싶어지네요.", "vietnamese": "Lúc đi học mình chỉ muốn nhanh tốt nghiệp nhưng thực tế tốt nghiệp rồi mới lại muốn trở lại trường."},
    {"korean": "그 사람을 만나고 보니 내가 예전에 알던 사람이었다.", "vietnamese": "Gặp người đó rồi mới biết là người đã từng biết trước đó."},
    {"korean": "막상 옷을 입고 보니 나한테 꽤 잘 어울리는 것 같았다.", "vietnamese": "Hóa ra mặc áo vào rồi mới thấy có lẽ khá là vừa vặn với mình."},
    {"korean": "마시고 보니 술이었어요.", "vietnamese": "Uống vào rồi mới biết là rượu."},
    {"korean": "사고 보니 유행이 지난 옷이었어요.", "vietnamese": "Mua rồi mới biết là áo đã lỗi thời."},
    {"korean": "전화를 걸고 보니 잘못 걸었어요.", "vietnamese": "Gọi rồi mới nhận ra gọi nhầm số."}
  ]'::jsonb,
  ARRAY['–아/어 보니', '–다 보니']::TEXT[],
  ARRAY['discovery', 'realization', 'after_action', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '버스를 타고 __ 잘못 탔어요.', 'fill_blank', '["보니", "아 보니", "다 보니", "보면"]'::jsonb, 0,
  'Sau khi làm xong → 타고 보니.'
FROM public.grammar_patterns WHERE pattern = 'V – 고 보니(까)' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '전화를 걸고 __ 잘못 걸었어요.', 'fill_blank', '["보니", "아 보니", "다 보니", "보면"]'::jsonb, 0,
  'Sau khi gọi → 걸고 보니.'
FROM public.grammar_patterns WHERE pattern = 'V – 고 보니(까)' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #144: V – 아/어 보니(까)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 아/어 보니(까)',
  'a/eo boni(kka)',
  'Đang thử... thì nhận ra...',
  'intermediate',
  'discovery',
  'Trong lúc thực hiện hành động nào đó thì phát hiện thông tin mới hoặc một điều gì đó khác với suy nghĩ của mình. 고 보니 nhấn mạnh sự hoàn thiện của hành động hơn.',
  'V + 아/어 보니(까)',
  '[
    {"korean": "김치를 먹어 보니 아주 매워요.", "vietnamese": "Tôi ăn thử kimchi thì nhận ra nó rất cay."},
    {"korean": "외국에서 살아 보니까 생각보다 좀 힘들어요.", "vietnamese": "Tôi sống ở nước ngoài thì thấy vất vả hơn so với suy nghĩ."},
    {"korean": "상자를 열어 보니까 꽃이 있었어요.", "vietnamese": "Tôi mở hộp ra thì có hoa ở đó."},
    {"korean": "집에 와서 옷을 입어 보니까 좀 작았어요.", "vietnamese": "Tôi về nhà và mặc thử áo thì thấy hơi chật."},
    {"korean": "한국어를 배워 보니 생각보다 너무 어려워요.", "vietnamese": "Học tiếng Hàn thì thấy là khó hơn mình nghĩ."},
    {"korean": "미나의 설명을 들어 보니 이해가 되었어요.", "vietnamese": "Nghe lời giải thích của Mina thì mình đã hiểu rồi."},
    {"korean": "생각해 보니까 나는 한국 문화에 대해 모르고 있어요.", "vietnamese": "Suy nghĩ thì thấy là tôi không biết gì về văn hoá Hàn Quốc."}
  ]'::jsonb,
  ARRAY['–고 보니', '–다 보니']::TEXT[],
  ARRAY['discovery', 'trial', 'realization', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '김치를 먹__ 아주 매워요.', 'fill_blank', '["어 보니", "고 보니", "다 보니", "보면"]'::jsonb, 0,
  'Thử làm → 먹어 보니.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어 보니(까)' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '한국어를 배워 보니 생각보다 너무 어려워요.', 'fill_blank', '["어 보니", "고 보니", "다 보니", "보면"]'::jsonb, 0,
  'Thử học → 배워 보니.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어 보니(까)' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #145: V – 다(가) 보니(까)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 다(가) 보니(까)',
  'da(ga) boni(kka)',
  'Vì cứ... nên...',
  'intermediate',
  'habitual',
  'Diễn tả người nói phát hiện điều gì mới hay tình huống mới xảy ra sau khi thực hiện hành động nào đó liên tục trong quá khứ.',
  'V + 다(가) 보니(까)',
  '[
    {"korean": "처음에는 한국어를 공부하는 것이 힘들었는데 하다 보니까 재미있기도 해요.", "vietnamese": "Ban đầu việc học tiếng Hàn khó khăn nhưng vì cứ học tiếp nên tôi cũng thấy thú vị."},
    {"korean": "매일 민호 씨와 한국어로 이야기하다 보니 한국어 실력이 많이 늘었어요.", "vietnamese": "Mỗi ngày vì cứ nói chuyện với Minho bằng tiếng Hàn nên năng lực tiếng đã tăng lên."},
    {"korean": "자꾸 먹다 보니 이제 매운 음식도 잘 먹게 되었어요.", "vietnamese": "Cứ ăn thường xuyên nên bây giờ tôi đã ăn được đồ ăn cay."},
    {"korean": "오랜만에 만난 친구랑 이야기하다 보니 어느새 12 시가 넘었더라고요.", "vietnamese": "Nói chuyện với người bạn lâu rồi không gặp mà bỗng chốc đã thấy hơn 12h rồi."},
    {"korean": "경제 신문을 매일 읽다가 보니 자연스럽게 경제에 대해 잘 알게 되었어요.", "vietnamese": "Sau khi đọc báo kinh tế hàng ngày tự nhiên tôi dần thấy hiểu biết nhiều về kinh tế."},
    {"korean": "바쁘게 살다 보니까 주변 사람들에게 너무 신경을 못 쓴 것 같다.", "vietnamese": "Quen sống bận rộn tôi nhận ra có lẽ quá thiếu quan tâm đến mọi người xung quanh."},
    {"korean": "결혼을 준비하다 보니까 생각보다 복잡한 일이 많다는 것을 알게 되었다.", "vietnamese": "Chuẩn bị cho việc kết hôn tôi biết ra được có quá nhiều việc phức tạp hơn tôi tưởng."}
  ]'::jsonb,
  ARRAY['–고 보니', '–아/어 보니']::TEXT[],
  ARRAY['habitual', 'continuous_action', 'result', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '한국어를 공부하는 것이 힘들었는데 하다 __ 재미있기도 해요.', 'fill_blank', '["보니까", "고 보니", "아 보니", "보면"]'::jsonb, 0,
  'Cứ làm liên tục → 하다 보니까.'
FROM public.grammar_patterns WHERE pattern = 'V – 다(가) 보니(까)' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '매일 민호 씨와 한국어로 이야기하다 __ 한국어 실력이 많이 늘었어요.', 'fill_blank', '["보니", "고 보니", "아 보니", "보면"]'::jsonb, 0,
  'Cứ nói chuyện → 이야기하다 보니.'
FROM public.grammar_patterns WHERE pattern = 'V – 다(가) 보니(까)' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #146: V – 다(가) 보면
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 다(가) 보면',
  'da(ga) bomyeon',
  'Nếu cứ... thì sẽ...',
  'intermediate',
  'conditional',
  'Diễn tả hành động ở mệnh đề trước liên tục xảy ra và cuối cùng dẫn đến một kết quả nào đó. Kết quả có thể tiêu cực hoặc tích cực. Không sử dụng thì quá khứ và tương lai trước –다 보면, mệnh đề sau không sử dụng thì quá khứ.',
  'V + 다(가) 보면',
  '[
    {"korean": "가: 저는 노래를 잘 못 불러요. 나: 계속 연습하다 보면 잘 부를 거예요.", "vietnamese": "가: Tôi hát không hay lắm. 나: Nếu cứ luyện tập liên tục thì sẽ hát hay thôi."},
    {"korean": "가: 민호 씨가 술을 많이 마시는 것 같아요. 나: 술을 많이 마시다 보면 건강에 나빠질 텐데 걱정이에요.", "vietnamese": "가: Có lẽ Minho đã uống quá nhiều rượu. 나: Nếu cứ uống nhiều rượu như thế thì tôi lo là sức khỏe cậu ấy sẽ trở nên tệ hơn."},
    {"korean": "그 친구를 계속 만나다 보면 좋아질 거예요.", "vietnamese": "Cứ tiếp tục gặp người bạn đó thì sẽ trở nên thích người đó đó."},
    {"korean": "일을 하다 보면 금방 방법을 알게 될 거니까 너무 걱정하지 마세요.", "vietnamese": "Cứ làm rồi anh sẽ biết cách làm, đừng lo lắng quá."},
    {"korean": "매일 한국 친구 만나다 보면 한국어를 잘 하게 될 거예요.", "vietnamese": "Nếu cứ gặp bạn Hàn Quốc mỗi ngày thì bạn sẽ giỏi tiếng Hàn."},
    {"korean": "외국에서 혼자 살다 보면 고향이 그리워질 거예요.", "vietnamese": "Nếu cứ sống một mình ở nước ngoài thì sẽ nhớ quê hương."},
    {"korean": "가: 란 씨하고는 친해지기가 어려운 것 같아요. 나: 아니에요. 자주 이야기하다 보면 친해질 수 있을 거예요.", "vietnamese": "가: Có vẻ như khó trở nên thân thiết hơn với Lan. 나: Không phải thế đâu. Cứ nói chuyện thì chắc sẽ thân đấy."}
  ]'::jsonb,
  ARRAY['–(으)면', '–다 보니']::TEXT[],
  ARRAY['conditional', 'habitual', 'consequence', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '계속 연습하다 __ 잘 부를 거예요.', 'fill_blank', '["보면", "보니", "보니까", "보고"]'::jsonb, 0,
  'Nếu cứ làm → 연습하다 보면.'
FROM public.grammar_patterns WHERE pattern = 'V – 다(가) 보면' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그 친구를 계속 만나다 __ 좋아질 거예요.', 'fill_blank', '["보면", "보니", "보니까", "보고"]'::jsonb, 0,
  'Nếu cứ gặp → 만나다 보면.'
FROM public.grammar_patterns WHERE pattern = 'V – 다(가) 보면' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #147: A/V – 더니
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 더니',
  'deoni',
  'Thấy là... nên / Thấy là... nhưng / Thấy là... và rồi',
  'intermediate',
  'observation',
  '(1) Diễn tả sự thay đổi của một đối tượng sự vật, sự việc mà người nói từng chứng kiến, trải nghiệm. Sự việc chứng kiến đó chính là nguyên nhân của sự thay đổi. Chủ ngữ là ngôi số 3. [thấy là... nên]
(2) Diễn tả trạng thái tương phản giữa 2 vế câu, trái ngược với sự chứng kiến hay kinh nghiệm của người nói. Chủ ngữ là ngôi số 3. [thấy là... nhưng]
(3) Diễn tả trình tự thời gian ứng với sự chứng kiến hay kinh nghiệm của người nói. Chủ ngữ là ngôi số 3. [thấy là... và rồi]',
  'A/V + 더니',
  '[
    {"korean": "제 동생이 계속 라면만 먹더니 건강에 나빠졌어요.", "vietnamese": "Em tôi cứ liên tục ăn mì tôm nên sức khỏe đã trở nên tệ hơn."},
    {"korean": "흐엉 씨는 열심히 공부하더니 장학금을 받았어요.", "vietnamese": "Hương đã học tập chăm chỉ nên đã nhận được học bổng."},
    {"korean": "지민 씨가 어렸을 때 노래 잘 부르더니 지금은 가수가 됐어요.", "vietnamese": "Jimin hát hay từ khi còn nhỏ nên bây giờ đã trở thành ca sĩ rồi."},
    {"korean": "민수 씨가 음식을 그렇게 많이 먹더니 결국 배탈이 났어요.", "vietnamese": "Min-su đã ăn nhiều đồ ăn như vậy nên kết cục đã bị tiêu chảy."},
    {"korean": "동수 씨가 다이어트를 하더니 날씬해졌네요.", "vietnamese": "Dongsu ăn kiêng nên đã trở nên thon thả hơn nhỉ."},
    {"korean": "재현 씨가 요즘 돈이 없다고 하더니만 수학여행도 못 간 것 같아요.", "vietnamese": "Jaehyeong nói rằng cô ấy hết tiền nên cô ấy không thể đi trại hè được."},
    {"korean": "작년 여름에 비가 많이 오더니 올해는 비가 많이 안 오네요.", "vietnamese": "Tôi thấy là mùa hè năm ngoái mưa nhiều nhưng năm nay mưa không nhiều lắm nhỉ."},
    {"korean": "작년에 흐엉 씨는 여행을 많이 가더니 요즘 집에서만 있네요.", "vietnamese": "Tôi thấy năm ngoái Hương đi du lịch nhiều mà năm nay chỉ ở nhà thôi nhỉ."},
    {"korean": "민수 씨가 전에는 술을 자주 마시더니 요즘은 전혀 안 마신다.", "vietnamese": "Trước đây Min-su thường xuyên uống rượu thế mà dạo này hoàn toàn không động đến."},
    {"korean": "수미 씨가 어제는 피곤해 하더니 오늘은 괜찮은 것 같네요.", "vietnamese": "Su-mi hôm qua bị mệt thế mà hôm nay có vẻ bình thường rồi."},
    {"korean": "어제는 춥더니 오늘은 날씨가 좋다.", "vietnamese": "Mới hôm qua trời còn lạnh mà hôm nay thời tiết thật đẹp."},
    {"korean": "오후에는 덥더니 저녁이 되니까 썰썰하네요.", "vietnamese": "Mới buổi chiều còn nóng mà buổi tối thì mát mẻ nhỉ."},
    {"korean": "란 씨는 남친한테 화를 내더니 밖으로 나가 버렸어요.", "vietnamese": "Lan nổi giận với bạn trai và đã ra ngoài rồi."},
    {"korean": "동생은 집에 들어오더니 갑자기 울기 시작했어요.", "vietnamese": "Em tôi về đến nhà và đột nhiên bắt đầu khóc."},
    {"korean": "어머니께서 시장을 봐 오시더니 바로 음식을 만들기 시작하셨다.", "vietnamese": "Mẹ tôi đi chợ về là sau đó đã bắt đầu việc nấu nướng ngay."},
    {"korean": "그 두 사람은 사귀기 시작하더니 6개월 만에 결혼했다.", "vietnamese": "Hai người đó bắt đầu quen nhau là sau đó đã kết hôn mới chỉ sau 6 tháng."}
  ]'::jsonb,
  ARRAY['–았/었더니', '–고 보니']::TEXT[],
  ARRAY['observation', 'change', 'contrast', 'sequence', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '제 동생이 계속 라면만 먹__ 건강에 나빠졌어요.', 'fill_blank', '["더니", "었더니", "고 보니", "다 보니"]'::jsonb, 0,
  'Thấy là... nên → 먹더니.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 더니' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '작년 여름에 비가 많이 오__ 올해는 비가 많이 안 오네요.', 'fill_blank', '["더니", "었더니", "고 보니", "다 보니"]'::jsonb, 0,
  'Thấy là... nhưng → 오더니.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 더니' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #148: V - 았/었더니
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V - 았/었더니',
  'at/eotdeoni',
  'Thì thấy... / Vì... nên tôi thấy...',
  'intermediate',
  'discovery',
  '(1) Chủ ngữ là ngôi số 1. Hồi tưởng lại sự phát hiện của chủ thể. [thì thấy...]
(2) Chủ ngữ là ngôi số 1. Hồi tưởng nguyên nhân, kết quả. [vì... nên tôi thấy...]',
  'V + 았/었더니',
  '[
    {"korean": "밤 늦게 약국에 갔더니 문이 닫혀 있었어요.", "vietnamese": "Đêm muộn tôi đến hiệu thuốc thì thấy đóng cửa rồi."},
    {"korean": "집에 왔더니 소포가 하나 와 있었다.", "vietnamese": "Tôi về nhà thì thấy có một bưu phẩm được gửi đến."},
    {"korean": "수해 현장에 직접 가 보았더니 정말 처참했다.", "vietnamese": "Tôi đã trực tiếp đến hiện trường xảy ra lũ lụt thì thấy thực sự rất thảm khốc."},
    {"korean": "약을 먹었더니 배가 좋아졌어요.", "vietnamese": "Vì uống thuốc nên tôi thấy bụng đỡ hơn rồi."},
    {"korean": "가장 저렴한 걸로 샀더니 품질이 영 마음에 들지 않는다.", "vietnamese": "Tôi mua loại rẻ nhất thì thấy không hài lòng về chất lượng lắm."},
    {"korean": "학교에 갔더니 아무도 없었다.", "vietnamese": "Tôi đã đến trường mà chẳng có bất cứ một ai."},
    {"korean": "유리 씨에게 전화했더니 계속 통화중이었다.", "vietnamese": "Tôi đã gọi điện thoại cho Yu-ri mà máy đang bận liên tục."},
    {"korean": "백화점에 갔더니 사람이 많았어요.", "vietnamese": "Tôi đến tiệm bách hóa thì thấy rất đông người."},
    {"korean": "그분을 만나 봤더니 아주 친절한 분이셨어요.", "vietnamese": "Tôi gặp người đó và thấy người đó rất thân thiện."}
  ]'::jsonb,
  ARRAY['–더니', '–고 보니']::TEXT[],
  ARRAY['discovery', 'realization', 'first_person', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '밤 늦게 약국에 갔__ 문이 닫혀 있었어요.', 'fill_blank', '["더니", "었더니", "고 보니", "다 보니"]'::jsonb, 0,
  'Hồi tưởng phát hiện → 갔더니.'
FROM public.grammar_patterns WHERE pattern = 'V - 았/었더니' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '약을 먹__ 배가 좋아졌어요.', 'fill_blank', '["었더니", "더니", "고 보니", "다 보니"]'::jsonb, 0,
  'Nguyên nhân kết quả → 먹었더니.'
FROM public.grammar_patterns WHERE pattern = 'V - 았/었더니' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #149: A/V – 다가는
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 다가는',
  'daganeun',
  'Nếu cứ... thì sẽ...',
  'intermediate',
  'warning',
  'Vĩ tố liên kết diễn tả hành động hoặc trạng thái nào đó cứ tiếp tục thì sẽ có kết quả không tốt xảy ra. Thường sử dụng cấu trúc này để cảnh báo người khác.',
  'A/V + 다가는',
  '[
    {"korean": "지금처럼 돈을 많이 쓰다가는 월세를 낼 돈도 없을지도 몰라요.", "vietnamese": "Nếu cứ tiêu nhiều tiền như bây giờ thì không biết chừng sẽ không có tiền trả tiền thuê nhà đâu."},
    {"korean": "그렇게 공부하다가는 시험에 떨어질 거예요.", "vietnamese": "Nếu cứ học như thế thì có thể sẽ thi trượt đó."},
    {"korean": "이렇게 날씨가 춥다가는 감기 환자들이 늘어날 거예요.", "vietnamese": "Thời tiết cứ lạnh như thế này thì số người mắc cảm cúm còn sẽ tăng nhiều."},
    {"korean": "그렇게 일을 미루다가는 나중에 후회하게 될 텐데요.", "vietnamese": "Bạn mà cứ trì hoãn công việc như thế thì sau này bạn sẽ hối hận đấy."},
    {"korean": "술을 마시고 운전하다가는 큰일 나요.", "vietnamese": "Uống rượu rồi nếu cứ lái xe thì sẽ nguy hiểm đấy."},
    {"korean": "그렇게 쉬지 않고 일하다가는 몸에 큰 병이 생길 거예요.", "vietnamese": "Nếu cứ chỉ làm việc mà không nghỉ ngơi như vậy có thể sẽ mắc bệnh nguy hiểm đấy."}
  ]'::jsonb,
  ARRAY['–다 보면', '–(으)면']::TEXT[],
  ARRAY['warning', 'negative_consequence', 'caution', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '지금처럼 돈을 많이 쓰다__ 월세를 낼 돈도 없을지도 몰라요.', 'fill_blank', '["가는", "보면", "보니", "면"]'::jsonb, 0,
  'Cảnh báo tiêu cực → 쓰다가는.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 다가는' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그렇게 공부하다__ 시험에 떨어질 거예요.', 'fill_blank', '["가는", "보면", "보니", "면"]'::jsonb, 0,
  'Cảnh báo → 공부하다가는.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 다가는' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #150: A/V – (으)ㄴ/는 셈이다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ/는 셈이다',
  '(eu)n/neun seomida',
  'Xem như, gần như là...',
  'intermediate',
  'conclusion',
  'Vĩ tố kết thúc diễn tả sau khi xem xét một sự việc nào đó thì kết luận rằng nó cũng gần giống với một sự việc khác. Dù chưa hoàn toàn giống hay đạt đến nhưng gần như là hoàn thành hoặc giống với mức độ đó rồi.',
  'A + ㄴ 셈이다 / V + 는 셈이다 / V + (으)ㄹ 셈이다',
  '[
    {"korean": "가: 숙제는 다 했어요? 나: 이 문제를 풀기 만하면 되니까 다 한 셈이에요.", "vietnamese": "가: Bạn đã làm hết bài tập về nhà chưa? 나: Nếu làm nốt bài này thì xem như là làm xong hết rồi."},
    {"korean": "가: 아침을 먹었어요? 나: 커피만 마셨으니까 안 먹은 셈이에요.", "vietnamese": "가: Bạn đã ăn sáng chưa? 나: Mình chỉ uống cà phê thôi nên xem như là không ăn."},
    {"korean": "지금은 잘 못 마시지만 옛날에 비하면 지금은 술을 잘 마시는 셈이에요.", "vietnamese": "Bây giờ tôi không thể uống rượu được nhiều nhưng so với trước kia xem như là tốt rồi."},
    {"korean": "친구가 많지 않지만 다른 사람들에 비해서 친구가 많은 셈이에요.", "vietnamese": "Tôi không có nhiều bạn nhưng so với người khác xem như là nhiều rồi."},
    {"korean": "일주일에 이틀 정도만 집에 들어가니 밖에서 사는 셈이지요.", "vietnamese": "Một tuần tôi chỉ về nhà khoảng hai lần nên xem như là sống ở ngoài rồi còn gì nhỉ."},
    {"korean": "12월도 중순이 지났으니 올해도 다 지난 셈이다.", "vietnamese": "Đã qua giữa tháng 12, xem như là năm nay đã trôi qua rồi."},
    {"korean": "국물만 조금 남았으니 다 먹은 셈이지요.", "vietnamese": "Chỉ còn một ít nước canh thôi nên coi như là đã ăn hết rồi chứ nhỉ."},
    {"korean": "오늘은 평소에 비하면 일찍 온 셈이에요.", "vietnamese": "So với thường lệ thì hôm nay coi như là tớ đến sớm."}
  ]'::jsonb,
  ARRAY['–(으)ㄴ/는 거나 마찬가지이다', '–(으)ㄹ 뻔하다']::TEXT[],
  ARRAY['conclusion', 'approximation', 'consideration', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '이 문제를 풀기 만하면 되니까 다 한 __.', 'fill_blank', '["셈이에요", "거나 마찬가지이다", "뻔이다", "지경이다"]'::jsonb, 0,
  'Xem như → 다 한 셈이에요.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 셈이다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '커피만 마셨으니까 안 먹은 __.', 'fill_blank', '["셈이에요", "거나 마찬가지이다", "뻔이다", "지경이다"]'::jsonb, 0,
  'Xem như là không → 안 먹은 셈이에요.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 셈이다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #151: A/V – (으)ㄴ/는 거나 마찬가지이다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ/는 거나 마찬가지이다',
  '(eu)n/neun geona machigajiida',
  'Giống như, coi như...',
  'intermediate',
  'equivalence',
  'Biểu hiện có ý nghĩa của 마찬가지이다: giống như, coi như...',
  'A + ㄴ 거나 마찬가지이다 / V + 는 거나 마찬가지이다 / V + (으)ㄹ 거나 마찬가지이다',
  '[
    {"korean": "학비를 낸 후 다시 장학금으로 받았으니 결국 학비가 공짜인 거나 마찬가지이다.", "vietnamese": "Sau khi đóng học phí xong nhận được học bổng, nên cuối cùng thì cũng giống như là miễn học phí."},
    {"korean": "대전에서 오래 살았으니까 대전이 고향인 거나 마찬가지이다.", "vietnamese": "Tôi đã sống lâu năm ở Daejeon nên Daejeon cũng giống như là quê hương của tôi."},
    {"korean": "오늘이 크리스마스니까 이제 올해도 다 지나간 거나 마찬가지이다.", "vietnamese": "Hôm nay là giáng sinh thì coi như bây giờ cũng đã hết năm rồi."},
    {"korean": "이번 시험은 어려웠으니까 70 점이면 잘 본 거나 마찬가지이다.", "vietnamese": "Kỳ thi lần này khó mà đạt 70 điểm thì cũng coi như là đã thi tốt rồi."},
    {"korean": "가: 여기 구두는 다른 회사 구두보다 비싸네요. 나: 품질과 서비스를 생각하면 비싸지 않은 거나 마찬가지이다.", "vietnamese": "가: Giày ở đây so với công ty khác thì đắt hơn. 나: Nếu xét về chất lượng và dịch vụ thì coi như không đắt đâu."},
    {"korean": "가: 학생들이 수학여행을 많이 가나요? 나: 우리 학교 학생 95%가 가니까 거의 다 가는 거나 마찬가지이다.", "vietnamese": "가: Học sinh có đi tham quan nhiều không? 나: 95% học sinh đi nên coi như tất cả đều đi."}
  ]'::jsonb,
  ARRAY['–(으)ㄴ/는 셈이다', '–과 같다']::TEXT[],
  ARRAY['equivalence', 'similarity', 'conclusion', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '학비를 낸 후 다시 장학금으로 받았으니 결국 학비가 공짜인 __.', 'fill_blank', '["거나 마찬가지이다", "셈이다", "뻔이다", "지경이다"]'::jsonb, 0,
  'Giống như → 공짜인 거나 마찬가지이다.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 거나 마찬가지이다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '대전에서 오래 살았으니까 대전이 고향인 __.', 'fill_blank', '["거나 마찬가지이다", "셈이다", "뻔이다", "지경이다"]'::jsonb, 0,
  'Giống như quê hương → 고향인 거나 마찬가지이다.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 거나 마찬가지이다' AND topik_level = 'TOPIK II';
