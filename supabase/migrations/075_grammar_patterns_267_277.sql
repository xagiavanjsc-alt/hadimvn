-- Migration 075: Grammar Patterns #267-277

-- ═══════════════════════════════════════════════════════════════════════════════
-- #267: A/V – (으)ㄴ/는 가 싶다  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)ㄴ/는 가 싶다', '(eu)n/neun ga sipda', 'Có vẻ như... (phỏng đoán mơ hồ)', 'advanced', 'speculation',
  'Bày tỏ suy nghĩ, cảm giác; mang sắc thái phỏng đoán một cách khá mơ hồ. Khác với 것 같다 ở chỗ mang ý nghĩa phỏng đoán chủ quan, không chắc chắn hơn.',
  'V + 는 가 싶다 / A + (으)ㄴ 가 싶다 / V + 았/었나 싶다',
  '[
    {"korean":"흐엉 씨가 모임에 안 와서 어디 아픈가 싶었어요.","vietnamese":"Hương không đến cuộc gặp nên có khi nào đã bị đau ở đâu không."},
    {"korean":"비가 오는가 싶어 빨래를 걷었어요.","vietnamese":"Có vẻ như trời mưa nên tôi thu quần áo vào."},
    {"korean":"유리 씨가 전화를 안 받네요. 오늘도 안 오는가 싶네요.","vietnamese":"Yu-ri không nhận điện thoại nhỉ. Có vẻ như là hôm nay cũng sẽ không đến."},
    {"korean":"찌푸린 얼굴 표정을 보니 기분이 나쁜가 싶어요.","vietnamese":"Nhìn vẻ mặt cau có, tôi nghĩ rằng anh ấy đang có tâm trạng tồi tệ."},
    {"korean":"민수 씨 가방이 안 보이는 걸 보니 민수 씨는 벌써 집에 갔는가 싶다.","vietnamese":"Không thấy túi của Min-su đâu nên có vẻ như là cậu ấy đã đi về nhà rồi."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 것 같다','A/V – (으)ㄹ 성싶다']::TEXT[],
  ARRAY['speculation','vague','subjective','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'비가 오___ 싶어 빨래를 걷었어요.','fill_blank','["는가","ㄴ가","을까","는지"]'::jsonb,0,'동사 현재 진행 추측: 오는가 싶다 → 막연한 추측'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄴ/는 가 싶다' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'찌푸린 표정을 보니 기분이 나쁜___ 싶어요.','fill_blank','["가","지","듯이","것 같아"]'::jsonb,0,'형용사+가 싶다: 나쁜가 싶다 → 막연한 상태 추측'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄴ/는 가 싶다' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #268: A/V – (으)ㄹ 성싶다  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)ㄹ 성싶다', '(eu)l seongsipda', 'Có vẻ như... (phỏng đoán, khả năng cao)', 'advanced', 'speculation',
  'Biểu hiện phỏng đoán có thể dùng thay thế bởi (으)ㄹ 것 같다. Được dùng nhiều trong văn nói. Mang sắc thái phỏng đoán nhẹ về tương lai.',
  'V + (으)ㄹ 성싶다 / A + (으)ㄹ 성싶다',
  '[
    {"korean":"내일은 눈이 올 성싶군요.","vietnamese":"Có lẽ ngày mai tuyết sẽ rơi đấy."},
    {"korean":"내 꿈이 이루어질 성싶은 예감이 듭니다.","vietnamese":"Tôi có linh cảm có lẽ ước mơ của tôi sẽ thành hiện thực."},
    {"korean":"일이 제대로 잘 풀릴 성싶으니까 걱정 마세요.","vietnamese":"Có lẽ công việc sẽ được giải quyết tốt đẹp nên đừng lo."},
    {"korean":"나는 불편한 자리에서 나가야 할 성싶어 재빨리 일어나 밖으로 나갔다.","vietnamese":"Tôi cảm thấy mình phải thoát ra khỏi tình huống khó chịu nên nhanh chóng đứng dậy đi ra ngoài."},
    {"korean":"오늘 운동을 많이 해서 밤에 잠이 잘 올 성싶다.","vietnamese":"Hôm nay tôi đã tập thể dục rất nhiều nên tôi nghĩ tối nay tôi sẽ ngủ ngon."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 것 같다','A/V – (으)ㄴ/는 가 싶다']::TEXT[],
  ARRAY['speculation','prediction','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'내일은 눈이 올___ 군요.','fill_blank','["성싶","것 같","듯하","리만치"]'::jsonb,0,'미래 추측 문어체: 올 성싶다 → 것 같다 유사 표현'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 성싶다' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'일이 잘 풀릴___ 으니까 걱정 마세요.','fill_blank','["성싶","것 같","듯하","리"]'::jsonb,0,'결과 추측: 풀릴 성싶다 → 긍정적 예측'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 성싶다' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #269: (으)ㄹ 테면  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '(으)ㄹ 테면', '(eu)l temyeon', 'Nếu muốn ... thì cứ ... (thách thức/cho phép)', 'advanced', 'condition',
  'Diễn tả ý nghĩa nếu người nghe muốn thực hiện hành động nào đó thì hãy cứ làm đi. Động từ ở mệnh đề trước và sau thường được lặp lại. Mệnh đề sau dùng dạng mệnh lệnh.',
  'V + (으)ㄹ 테면 + V(mệnh lệnh)',
  '[
    {"korean":"할 테면 해 봐라.","vietnamese":"Nếu muốn làm thì hãy cứ làm đi."},
    {"korean":"어디 비웃을 테면 비웃으라지.","vietnamese":"Nếu bạn muốn cười nhạo thì hãy cứ cười nhạo đi."},
    {"korean":"이 많은 걸 먹을 테면 다 먹어 봐.","vietnamese":"Nếu bạn muốn ăn nhiều thế này thì hãy cứ ăn đi."},
    {"korean":"내 의견에 반대할 테면 해 봐요.","vietnamese":"Nếu muốn phản đối ý kiến của tôi thì cứ làm đi."},
    {"korean":"여기를 떠날 테면 미련없이 떠나라.","vietnamese":"Nếu muốn rời nơi này thì hãy rời một cách dứt khoát."},
    {"korean":"잡을 테면 잡아 보세요.","vietnamese":"Nếu cậu muốn bắt tớ thì cứ bắt đi."}
  ]'::jsonb,
  ARRAY['(으)ㄹ 테야','(으)려면']::TEXT[],
  ARRAY['condition','challenge','imperative','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'할___ 해 봐라.','fill_blank','["테면","테야","테지만","텐데도"]'::jsonb,0,'도전적 허용: 할 테면 → 하고 싶으면 해 보라'
FROM public.grammar_patterns WHERE pattern='(으)ㄹ 테면' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'여기를 떠날___ 미련없이 떠나라.','fill_blank','["테면","테야","테지만","텐데도"]'::jsonb,0,'의도 허용+명령: 떠날 테면 → 앞뒤 동사 반복 구조'
FROM public.grammar_patterns WHERE pattern='(으)ㄹ 테면' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #270: (으)ㄹ 테야  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '(으)ㄹ 테야', '(eu)l teya', 'Nhất định sẽ... (ý chí mạnh mẽ hoặc hỏi ý định)', 'advanced', 'volition',
  'Cấu trúc thể hiện kế hoạch hay ý chí mạnh mẽ rằng nhất định sẽ thực hiện việc nào đó. Ở dạng nghi vấn, hỏi suy nghĩ hay ý định của người nghe về việc tương lai.',
  'V + (으)ㄹ 테야 (khẳng định ý chí) / V + (으)ㄹ 테야? (hỏi ý định)',
  '[
    {"korean":"이번 시험에서 꼭 일 등을 할 테야.","vietnamese":"Kì thi lần này nhất định tôi sẽ giành hạng nhất."},
    {"korean":"무슨 일이 있어도 그 상을 타고 말 테야.","vietnamese":"Dù có chuyện gì xảy ra thì tôi cũng sẽ giành được giải thưởng đó."},
    {"korean":"이번 달은 용돈을 아껴 쓸 테야.","vietnamese":"Tháng này tôi sẽ sử dụng tiền tiêu vặt một cách tiết kiệm."},
    {"korean":"나는 볶음밥을 먹을 건데 지수 너는 뭘 주문할 테야?","vietnamese":"Tớ sẽ ăn cơm chiên, Jisoo, cậu gọi món gì?"},
    {"korean":"누가 이 어려운 문제를 풀어 볼 테야?","vietnamese":"Ai sẽ giải được bài khó này?"}
  ]'::jsonb,
  ARRAY['(으)ㄹ 테면','(으)ㄹ 테지만','V – (으)ㄹ 것이다']::TEXT[],
  ARRAY['volition','intention','future','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'이번 시험에서 꼭 일 등을 할___.','fill_blank','["테야","거야","것이야","텐데"]'::jsonb,0,'강한 의지: 할 테야 → 반드시 이루겠다는 결심'
FROM public.grammar_patterns WHERE pattern='(으)ㄹ 테야' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'지수 너는 뭘 주문할___?','fill_blank','["테야","거야","것이야","까"]'::jsonb,0,'의도 질문: 주문할 테야? → 상대 의향 물음'
FROM public.grammar_patterns WHERE pattern='(으)ㄹ 테야' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #271: (으)ㄹ 테지만  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '(으)ㄹ 테지만', '(eu)l tejiman', 'Chắc là... nhưng (phỏng đoán + tương phản)', 'advanced', 'concession',
  'Vĩ tố liên kết thể hiện việc người nói tin chắc nội dung ở trước nhưng nội dung ở sau có thể khác với điều đó. Là sự kết hợp của phỏng đoán (으)ㄹ 테 và 지만.',
  'V/A + (으)ㄹ 테지만',
  '[
    {"korean":"회사마다 다를 테지만 영업 관리직은 명절에도 바빠요.","vietnamese":"Mỗi công ty chắc là khác nhau nhưng người quản lý kinh doanh nào cũng bận rộn dù vào ngày lễ."},
    {"korean":"이미 들으셨을 테지만 오늘 있을 임원진 회의는 회사의 미래를 결정하는 중요한 자리입니다.","vietnamese":"Chắc là cậu đã nghe trước đó nhưng cuộc họp điều hành hôm nay có vai trò quan trọng quyết định tương lai của công ty."},
    {"korean":"정치에 관심이 없으실 테지만 꼭 투표를 하시는 것이 국민의 의무를 이행하는 것입니다.","vietnamese":"Chắc là bạn không có sự quan tâm đến chính trị nhưng nhất định việc bỏ phiếu là việc thực thi nghĩa vụ của nhân dân."},
    {"korean":"바쁘실 테지만 이번 회의에 참석해 주시면 감사하겠습니다.","vietnamese":"Chắc là bạn bận rộn nhưng nếu tham dự cuộc họp lần này thì tôi rất biết ơn."}
  ]'::jsonb,
  ARRAY['(으)ㄹ 텐데도','A/V – (으)ㄹ 것 같다']::TEXT[],
  ARRAY['concession','contrast','speculation','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'회사마다 다를___ 영업직은 명절에도 바빠요.','fill_blank','["테지만","지만","겠지만","텐데도"]'::jsonb,0,'추측+역접: 다를 테지만 → 확신+반전'
FROM public.grammar_patterns WHERE pattern='(으)ㄹ 테지만' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'바쁘실___ 이번 회의에 참석해 주시면 감사하겠습니다.','fill_blank','["테지만","지만","겠지만","더라도"]'::jsonb,0,'상대 상황 추측+역접: 바쁘실 테지만 → 확신 역접'
FROM public.grammar_patterns WHERE pattern='(으)ㄹ 테지만' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #272: (으)ㄹ 텐데도  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '(으)ㄹ 텐데도', '(eu)l tendedo', 'Dù có lẽ... nhưng vẫn... (nhượng bộ phỏng đoán)', 'advanced', 'concession',
  'Vĩ tố liên kết phỏng đoán nhượng bộ. Là sự kết hợp của phỏng đoán (으)ㄹ 테 và 아/어도. Thường lùi về phỏng đoán quá khứ.',
  'V/A + (으)ㄹ 텐데도',
  '[
    {"korean":"연락을 받았을 텐데도 오지 않았어요.","vietnamese":"Dù có lẽ anh ấy đã nhận liên lạc nhưng vẫn không đến."},
    {"korean":"진수는 술은 꽤 많이 마셨을 텐데도 취한 것처럼 보이지 않았어요.","vietnamese":"Dù có lẽ Chinsu đã uống khá nhiều rượu nhưng anh ấy trông không giống như say."},
    {"korean":"피곤할 텐데도 불구하고 끝까지 도와줬어요.","vietnamese":"Dù có lẽ mệt nhưng vẫn giúp tôi đến cùng."},
    {"korean":"이미 알고 있을 텐데도 모른 척하고 있어요.","vietnamese":"Dù có lẽ đã biết rồi nhưng vẫn giả vờ không biết."}
  ]'::jsonb,
  ARRAY['(으)ㄹ 테지만','A/V – 아/어도']::TEXT[],
  ARRAY['concession','speculation','contrast','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'연락을 받았을___ 오지 않았어요.','fill_blank','["텐데도","테지만","지만","더라도"]'::jsonb,0,'과거 추측+양보: 받았을 텐데도 → 예상 외 행동'
FROM public.grammar_patterns WHERE pattern='(으)ㄹ 텐데도' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'피곤할___ 끝까지 도와줬어요.','fill_blank','["텐데도","테지만","지만","더라도"]'::jsonb,0,'추측 양보: 피곤할 텐데도 → 예상 상태에도 불구'
FROM public.grammar_patterns WHERE pattern='(으)ㄹ 텐데도' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #273: A/V – (으)ㄹ 게 뻔하다  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)ㄹ 게 뻔하다', '(eu)l ge ppeonhada', 'Chắc chắn sẽ... (kết quả hiển nhiên, thường tiêu cực)', 'advanced', 'speculation',
  'Người nói có thể dự đoán rõ ràng kết quả của một hành động dựa trên trải nghiệm tương tự trong quá khứ. Được sử dụng chủ yếu để dự đoán các tình huống có kết quả không tốt.',
  'V/A + (으)ㄹ 게 뻔하다',
  '[
    {"korean":"이번에 열심히 공부 안 한다면 시험에서 떨어질 게 뻔해요.","vietnamese":"Kì thi này nếu không học chăm chỉ thì chắc chắn sẽ thi trượt."},
    {"korean":"그 책의 제목을 보니 재미없을 게 뻔해요.","vietnamese":"Nhìn tựa đề của cuốn sách đó biết ngay chắc chắn là không thú vị."},
    {"korean":"안 봐도 다 알 수 있어, 아직까지 자고 있을 게 뻔해.","vietnamese":"Không nhìn cũng có thể biết thừa là vẫn đang ngủ."},
    {"korean":"이번 달에 돈을 많이 써서 생활비가 모자랄 게 뻔해요.","vietnamese":"Tháng này tiêu tiền nhiều quá nên tiền phí sinh hoạt chắc chắn sẽ thiếu thôi."},
    {"korean":"오늘은 주말이니까 극장에 사람들이 많을 게 뻔합니다.","vietnamese":"Hôm nay là chủ nhật nên là chắc chắn rạp chiếu phim phải đông người lắm ấy."},
    {"korean":"공부를 안 했으니까 시험 성적이 안 좋을 게 뻔해요.","vietnamese":"Không học bài thì chắc chắn thành tích sẽ không cao đâu."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 것 같다','V – 기 십상이다']::TEXT[],
  ARRAY['speculation','obvious','negative','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'열심히 공부 안 하면 시험에서 떨어질___ 뻔해요.','fill_blank','["게","것","리가","듯이"]'::jsonb,0,'부정적 결과 확신: 떨어질 게 뻔하다 → 당연한 귀결'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 게 뻔하다' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'안 봐도 아직까지 자고 있을___ 뻔해.','fill_blank','["게","것","리가","듯이"]'::jsonb,0,'경험 기반 확신: 있을 게 뻔하다 → 보지 않아도 아는 결과'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 게 뻔하다' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #274: V – (으)ㄹ 법하다  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – (으)ㄹ 법하다', '(eu)l beopada', 'Đương nhiên..., hiển nhiên... (có lý do chắc chắn)', 'advanced', 'speculation',
  'Được sử dụng khi người nói có vẻ như có khả năng hoặc lý do chắc chắn rằng điều gì đó sẽ xảy ra. Nhấn mạnh tính hợp lý, tất nhiên của sự việc.',
  'V + (으)ㄹ 법하다',
  '[
    {"korean":"한국에서 산 지 2년이나 됐으면 이제 한국 생활에 익숙해졌을 법한데 여전히 낯설기만 해요.","vietnamese":"Nếu đã sống ở Hàn Quốc được 2 năm thì bây giờ đương nhiên đã quen với cuộc sống ở Hàn Quốc nhưng tôi vẫn thấy lạ lẫm."},
    {"korean":"공부를 열심히 해서 점수가 잘 나올 법하다.","vietnamese":"Vì học hành chăm chỉ nên đương nhiên điểm thi sẽ cao."},
    {"korean":"아들에게 화를 낼 법한데 아버지는 화를 내지 않고 방을 나가 버렸다.","vietnamese":"Đương nhiên cha có thể nổi giận với con trai nhưng người cha đã không nổi giận và rời khỏi phòng."},
    {"korean":"이 연습 문제는 중간 시험 문제에 출제될 법하다.","vietnamese":"Câu hỏi luyện tập này đương nhiên sẽ xuất hiện trong bài kiểm tra giữa kì."}
  ]'::jsonb,
  ARRAY['A/V – 기 마련이다','A/V – (으)ㄹ 게 뻔하다']::TEXT[],
  ARRAY['speculation','reasonable','natural','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'공부를 열심히 해서 점수가 잘 나올___.','fill_blank','["법하다","뻔하다","것 같다","만하다"]'::jsonb,0,'합리적 기대: 나올 법하다 → 충분한 근거로 당연한 예측'
FROM public.grammar_patterns WHERE pattern='V – (으)ㄹ 법하다' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'화를 낼___ 아버지는 화를 내지 않았다.','fill_blank','["법한데","뻔한데","것 같은데","만한데"]'::jsonb,0,'당연한 행동 기대+반전: 낼 법한데 → 근거 있는 예상 뒤 역접'
FROM public.grammar_patterns WHERE pattern='V – (으)ㄹ 법하다' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #275: A/V – (으)ㄹ 리가 없다/있다  (TOPIK III)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)ㄹ 리가 없다/있다', '(eu)l riga eopda/itda', 'Có/Không có lý nào... (phủ nhận/xác nhận khả năng)', 'intermediate', 'speculation',
  'Thể hiện một việc không có/có khả năng xảy ra. 리가 없다 = không có lý nào (phủ nhận mạnh), 리가 있다 = có lẽ (xác nhận khả năng, thường dạng nghi vấn).',
  'V/A + (으)ㄹ 리가 없다 / (으)ㄹ 리가 있다',
  '[
    {"korean":"해가 서쪽에서 뜰 리가 없어요.","vietnamese":"Không có lý nào mặt trời lại mọc đằng Tây cả."},
    {"korean":"그 정직한 사람이 거짓말을 했을 리가 없다.","vietnamese":"Người chính trực đó không có lý nào lại nói dối."},
    {"korean":"여름에 눈이 올 리가 없어요.","vietnamese":"Không có lý nào mùa hè lại có tuyết rơi."},
    {"korean":"그 친구가 이렇게 늦을 리가 없는데요.","vietnamese":"Không lí nào bạn ấy lại muộn như vậy."},
    {"korean":"한번 만났을 뿐인데 아직까지 기억할 리가 있나요?","vietnamese":"Mới gặp có một lần không lẽ vẫn nhớ cho đến tận bây giờ."},
    {"korean":"열심히 공부했는데 시험에 떨어질 리가 없다.","vietnamese":"Đã học hành chăm chỉ nên không có lý nào lại thi trượt cả."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 게 뻔하다','A/V – (으)ㄹ 것 같다']::TEXT[],
  ARRAY['speculation','negation','possibility','topik3','intermediate']::TEXT[],
  'TOPIK III'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'그 정직한 사람이 거짓말을 했을___ 없다.','fill_blank','["리가","것이","수가","법이"]'::jsonb,0,'가능성 강한 부정: 리가 없다 → 논리적 불가능'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 리가 없다/있다' AND topik_level='TOPIK III';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'열심히 공부했는데 시험에 떨어질___ 없다.','fill_blank','["리가","것이","수가","법이"]'::jsonb,0,'노력 기반 부정: 떨어질 리가 없다 → 충분한 근거로 부정'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 리가 없다/있다' AND topik_level='TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #276: V – 기 십상이다  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – 기 십상이다', 'gi sipssangida', 'Dễ dàng..., rất dễ... (khả năng cao xảy ra)', 'advanced', 'tendency',
  'Thể hiện tình huống đứng trước cấu trúc này sẽ dễ dàng xảy ra hoặc khả năng xảy ra lớn. Biểu hiện tương tự: 기가 쉽다.',
  'V + 기 십상이다',
  '[
    {"korean":"운동을 시작하기 전에 아무런 준비운동 없으면 부상을 입기 십상이다.","vietnamese":"Trước khi bắt đầu tập thể dục nếu không có bất kì bài tập khởi động nào thì rất dễ bị thương."},
    {"korean":"충동구매를 하면 나중에 후회하기 십상이다.","vietnamese":"Nếu mua hàng một cách ngẫu hứng thì về sau sẽ dễ dàng hối hận."},
    {"korean":"공부를 그렇게 안 하면 시험에 떨어지기 십상이다.","vietnamese":"Nếu cứ lười học như thế này thì sẽ rất dễ thi trượt."},
    {"korean":"현금을 많이 가지고 다니면 도둑맞기 십상이다.","vietnamese":"Nếu mang đi theo quá nhiều tiền mặt thì sẽ rất dễ bị trộm."},
    {"korean":"이렇게 높은 구두를 신고 다니다가는 넘어지기 십상이야.","vietnamese":"Nếu cứ đi lại với đôi giày cao như thế này sẽ rất dễ bị ngã."},
    {"korean":"모르는 것을 아는 척했다가는 망신당하기 십상이다.","vietnamese":"Nếu cứ giả vờ biết những thứ không hề biết thì sẽ rất dễ bị mất thể diện."}
  ]'::jsonb,
  ARRAY['V – 기 쉽다','A/V – (으)ㄹ 게 뻔하다']::TEXT[],
  ARRAY['tendency','probability','negative','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'준비운동 없으면 부상을 입___ 이다.','fill_blank','["기 십상","기 일쑤","기 마련","기 쉬워"]'::jsonb,0,'고확률 부정적 결과: 입기 십상이다 → 발생 가능성 높음'
FROM public.grammar_patterns WHERE pattern='V – 기 십상이다' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'공부를 그렇게 안 하면 시험에 떨어지___ 이다.','fill_blank','["기 십상","기 일쑤","기 마련","기 쉬워"]'::jsonb,0,'습관적 행동+부정 결과: 떨어지기 십상이다 → 충분히 예상'
FROM public.grammar_patterns WHERE pattern='V – 기 십상이다' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #277: A/V – 기 마련이다  (TOPIK III)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – 기 마련이다', 'gi maryeonida', 'Tất nhiên..., đương nhiên là... (quy luật tự nhiên)', 'intermediate', 'natural_consequence',
  'Thể hiện một sự việc đương nhiên xảy ra. Thường sử dụng với châm ngôn, tục ngữ, hoặc những sự việc hợp với lẽ tự nhiên. Có thể thay thế bằng –게 마련이다.',
  'V/A + 기 마련이다 / –게 마련이다',
  '[
    {"korean":"시간이 지나면 사회도 변하고 사람도 변하기 마련이다.","vietnamese":"Khi thời gian trôi đi thì đương nhiên xã hội cũng biến đổi và con người cũng thay đổi."},
    {"korean":"살다 보면 힘들 일이 생기기 마련이다.","vietnamese":"Sống thì đương nhiên là nảy sinh những việc khó khăn."},
    {"korean":"누구나 실수하기 마련이에요.","vietnamese":"Ai thì đương nhiên cũng có lúc mắc sai lầm."},
    {"korean":"열심히 하다 보면 좋은 결과가 생기기 마련이에요.","vietnamese":"Nếu cứ làm việc chăm chỉ thì chắc chắn sẽ có kết quả tốt."},
    {"korean":"눈에서 멀어지면 마음에서도 멀어지기 마련이에요.","vietnamese":"Xa mặt thì chắc chắn sẽ cách lòng."},
    {"korean":"누구나 장점이 있으면 단점도 있기 마련이죠.","vietnamese":"Ai cũng có ưu điểm thì đương nhiên cũng có nhược điểm."}
  ]'::jsonb,
  ARRAY['A/V – 는 법이다','V – 기 십상이다']::TEXT[],
  ARRAY['natural_consequence','proverb','inevitable','topik3','intermediate']::TEXT[],
  'TOPIK III'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'살다 보면 힘든 일이 생기___ 이다.','fill_blank','["기 마련","기 십상","기 일쑤","는 법"]'::jsonb,0,'자연스러운 귀결: 생기기 마련이다 → 삶의 당연한 이치'
FROM public.grammar_patterns WHERE pattern='A/V – 기 마련이다' AND topik_level='TOPIK III';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'누구나 실수하___ 이에요.','fill_blank','["기 마련","기 십상","기 일쑤","는 법"]'::jsonb,0,'보편적 진리: 실수하기 마련이다 → 누구나 해당되는 사실'
FROM public.grammar_patterns WHERE pattern='A/V – 기 마련이다' AND topik_level='TOPIK III';
