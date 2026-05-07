-- Migration 077: Grammar Patterns #287-296

-- ═══════════════════════════════════════════════════════════════════════════════
-- #287: A/V – (으)ㄴ/는 마당에  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)ㄴ/는 마당에', '(eu)n/neun madange', 'Trong hoàn cảnh..., với tình hình... (bối cảnh không thuận lợi)', 'advanced', 'context',
  'Biểu hiện một hoàn cảnh hoặc một tình huống tạo điều kiện cho một việc nào đó xảy ra. Tình huống được mô tả trong mệnh đề trước thường không thuận lợi hoặc có tính chất tiêu cực.',
  'V + 는 마당에 / A/V + (으)ㄴ 마당에',
  '[
    {"korean":"집안 형편이 어려워진 마당에 오직 돈을 벌어야겠다는 일념으로 살았다.","vietnamese":"Trong hoàn cảnh gia đình trở nên khó khăn, tôi đã sống với quyết tâm chỉ kiếm tiền."},
    {"korean":"학기가 끝나는 마당에 열심히 공부하지 않은 걸 후회해도 소용이 없죠.","vietnamese":"Trong hoàn cảnh kì học đã kết thúc, dù có hối hận vì đã không học hành chăm chỉ thì cũng vô ích."},
    {"korean":"모든 증거가 확실한 마당에 더 이상 체포를 망설일 필요는 없어요.","vietnamese":"Một khi tất cả chứng cứ đã rõ ràng thì không cần thiết phải do dự việc bắt giữ nữa cả."},
    {"korean":"모두들 일하는 마당에 너만 놀아서 되겠니?","vietnamese":"Trong khi mọi người đang làm việc, chỉ một mình anh chơi liệu có được không?"},
    {"korean":"사느냐 죽느냐 하는 마당에 이런 작은 일로 말다툼하고 있어요?","vietnamese":"Trong khi không biết sống chết ra sao mà anh lại đi cãi nhau vì một việc nhỏ thế này sao?"},
    {"korean":"사람들이 다 아는 마당에 무엇을 더 숨기겠어요?","vietnamese":"Trong khi tất cả mọi người đều biết thì sẽ còn gì che giấu được nữa?"}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는 판에','A/V – (으)ㄴ/는 터에']::TEXT[],
  ARRAY['context','negative_situation','circumstance','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'집안 형편이 어려워진___ 오직 돈을 벌어야겠다는 일념으로 살았다.','fill_blank','["마당에","터에","판에","와중에"]'::jsonb,0,'어려운 상황 배경: 어려워진 마당에 → 불리한 상황 속 행동 결정.'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄴ/는 마당에' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'모두들 일하는___ 너만 놀아서 되겠니?','fill_blank','["마당에","터에","판에","와중에"]'::jsonb,0,'현재 상황 배경+질책: 일하는 마당에 → 진행 중인 상황에서의 부적절한 행동.'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄴ/는 마당에' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #288: N 치고  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'N 치고', 'chigo', 'Đã là...thì... / So với...thì... (đại diện hoặc so sánh)', 'advanced', 'comparison',
  'Nghĩa 1: Khi sử dụng cùng với các danh từ mang tính đại diện, biểu hiện rằng nội dung ở phía sau thỏa đáng với toàn bộ danh từ đó. Thường dùng với câu phủ định hoặc câu hỏi tu từ. Nghĩa 2: Biểu hiện sự khác biệt so với đặc tính thông thường của danh từ đó.',
  'N + 치고 (nghĩa 1: đại diện) / N + 치고 (nghĩa 2: so sánh)',
  '[
    {"korean":"아이치고 사탕을 싫어하는 아이는 없을 거예요.","vietnamese":"Đã là trẻ con thì sẽ không có đứa trẻ nào ghét kẹo cả."},
    {"korean":"한국 사람치고는 김치를 못 먹는 사람이 어디 있겠어요?","vietnamese":"Đã là người Hàn Quốc thì làm gì có ai không ăn được kimchi chứ?"},
    {"korean":"꽃치고 안 예쁜 꽃은 없다.","vietnamese":"Đã là hoa thì không có hoa nào là không đẹp cả."},
    {"korean":"한국 사람치고 그 노래를 모르는 사람이 없다.","vietnamese":"Đã là người Hàn Quốc thì không có ai không biết bài hát đó cả."},
    {"korean":"외국 사람치고 한국어 발음이 좋은 편이에요.","vietnamese":"So với người nước ngoài thì phát âm tiếng Hàn như thế này là thuộc diện tốt đó."},
    {"korean":"초보자치고 꽤 운전을 잘 하시는군요.","vietnamese":"So với người mới học thì lái xe như thế này khá là tốt đó."},
    {"korean":"여름 날씨치고 시원해요.","vietnamese":"So với thời tiết mùa hè thì như thế này là mát mẻ rồi đó."}
  ]'::jsonb,
  ARRAY['A/V – 기 마련이다','N – (으)로서']::TEXT[],
  ARRAY['comparison','representative','exception','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'아이___ 사탕을 싫어하는 아이는 없을 거예요.','fill_blank','["치고","로서","치고는","이라면"]'::jsonb,0,'대표성 전칭 부정: 아이치고 → 아이라는 집합 전체 해당.'
FROM public.grammar_patterns WHERE pattern='N 치고' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'초보자___ 꽤 운전을 잘 하시는군요.','fill_blank','["치고","로서","에 비해","이라면"]'::jsonb,0,'기대 대비 비교: 초보자치고 → 예상보다 뛰어남.'
FROM public.grammar_patterns WHERE pattern='N 치고' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #289: (으)ㅁ에 따라  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – (으)ㅁ에 따라', '(eu)me ttara', 'Cùng với việc... nên (kết quả phụ thuộc)', 'advanced', 'dependency',
  'Được sử dụng để thể hiện kết quả của mệnh đề sau phụ thuộc vào tiêu chuẩn hay tình huống của mệnh đề trước. Thường được sử dụng trong văn viết.',
  'V + (으)ㅁ에 따라',
  '[
    {"korean":"과학 기술이 발달함에 따라 우리의 생활이 점점 편리해졌다.","vietnamese":"Cùng với sự phát triển của khoa học kĩ thuật, cuộc sống sinh hoạt của chúng ta đã trở nên thuận tiện hơn."},
    {"korean":"사람들은 시간이 지남에 따라 슬픈 일을 다 잊어버렸어요.","vietnamese":"Theo thời gian mọi người sẽ quên hết mọi chuyện buồn."},
    {"korean":"환경에 대한 관심이 높아짐에 따라 전기 차를 사용하는 사람도 많아지고 있다.","vietnamese":"Cùng với sự quan tâm về môi trường ngày càng cao, người sử dụng xe điện đang ngày càng tăng lên."},
    {"korean":"폭염 현상이 계속됨에 따라 농산물 재배는 어려움을 겪고 있다.","vietnamese":"Cùng với hiện tượng oi bức liên tục kéo dài, việc trồng nông sản đang trải qua khó khăn."},
    {"korean":"기술이 발달함에 따라 편리해진 점도 많지만 새로운 문제도 나타나고 있다.","vietnamese":"Cùng với sự phát triển của khoa học thì có nhiều việc trở nên thuận lợi nhưng cũng đang xuất hiện các vấn đề mới."}
  ]'::jsonb,
  ARRAY['A/V – (으)면서','V – 는 데 따라']::TEXT[],
  ARRAY['dependency','proportional','formal','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'과학 기술이 발달함___ 우리의 생활이 편리해졌다.','fill_blank','["에 따라","에 의해","으로 인해","에 따르면"]'::jsonb,0,'비례 변화: 발달함에 따라 → 앞 변화에 따른 뒤 결과.'
FROM public.grammar_patterns WHERE pattern='V – (으)ㅁ에 따라' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'환경에 대한 관심이 높아짐___ 전기 차 사용자도 많아지고 있다.','fill_blank','["에 따라","에 의해","으로 인해","으로써"]'::jsonb,0,'동반 변화: 높아짐에 따라 → 비례적 결과 강조.'
FROM public.grammar_patterns WHERE pattern='V – (으)ㅁ에 따라' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #290: 여간 A/V - 지 않다  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '여간 A/V – 지 않다', 'yeogan ~ ji anta', 'Hết sức..., vô cùng... (mức độ vượt thông thường)', 'advanced', 'degree',
  'Diễn đạt nghĩa một trạng thái mà mức độ hơn hẳn thông thường. Với danh từ được dùng dưới dạng 여간 N 이/가 아니다.',
  '여간 A/V + 지 않다 / 여간 N + 이/가 아니다',
  '[
    {"korean":"흐엉 씨는 외국인이지만 매운 한국 음식도 여간 잘 먹지 않아요.","vietnamese":"Hương là người nước ngoài nhưng ăn đồ ăn cay Hàn Quốc giỏi vô cùng."},
    {"korean":"요즘 아르바이트하며 토픽 시험 준비까지 하니까 여간 힘들지 않다.","vietnamese":"Dạo này mình vừa làm thêm vừa ôn thi Topik nên hết sức vất vả."},
    {"korean":"일과 육아를 병행한다는 건 여간 어려운 일이 아닙니다.","vietnamese":"Việc thực hiện song hành công việc và nuôi dạy trẻ là việc làm vô cùng khó khăn."},
    {"korean":"나를 도와줄 사람이 아무도 없다고 생각하면 여간 슬프지 않다.","vietnamese":"Nếu nghĩ rằng không có bất cứ ai giúp mình thì buồn vô cùng."},
    {"korean":"동생이 혼자 해외여행을 간다는 게 저는 여간 걱정스럽지 않아요.","vietnamese":"Việc em tôi đi du lịch nước ngoài một mình làm tôi vô cùng lo lắng."},
    {"korean":"한국어를 공부하면 할수록 여간 어렵지 않아요.","vietnamese":"Tiếng Hàn càng học càng khó."}
  ]'::jsonb,
  ARRAY['A/V – 기가 이를 데 없다','A/V – 기 짝이 없다']::TEXT[],
  ARRAY['degree','emphasis','colloquial','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'요즘 아르바이트하며 토픽 준비까지 하니까 여간 힘들___ 않다.','fill_blank','["지","게","기가","기는"]'::jsonb,0,'여간 + 지 않다: 힘들지 않다 → 매우 힘들다의 완곡한 강조.'
FROM public.grammar_patterns WHERE pattern='여간 A/V – 지 않다' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'일과 육아를 병행한다는 건 여간 어려운 일이 ___.','fill_blank','["아닙니다","없습니다","됩니다","같습니다"]'::jsonb,0,'여간 N 이/가 아니다: 어려운 일이 아니다 → 매우 어렵다 강조.'
FROM public.grammar_patterns WHERE pattern='여간 A/V – 지 않다' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #291: A – 기가 이를 데 없다  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A – 기가 이를 데 없다', 'giga ireul de eopda', 'Không còn gì...hơn, quá ư là... (mức độ cực đại)', 'advanced', 'degree',
  'Nhấn mạnh mức độ không gì so sánh được. Chủ yếu dùng trong văn viết. Biểu hiện tương tự: -기 짝이 없다.',
  'A + 기가 이를 데 없다 / A + 기 이를 데 없다',
  '[
    {"korean":"출퇴근 시간에는 버스에 사람이 너무 많아서 혼잡하기가 이를 데 없다.","vietnamese":"Vào giờ tan tầm, xe bus rất đông người nên vô cùng hỗn loạn."},
    {"korean":"한국에 처음에 왔을 때는 언어와 문화가 많이 달라서 답답하기가 이를 데 없었다.","vietnamese":"Khi lần đầu đến Hàn Quốc, ngôn ngữ và văn hóa khác nhau rất nhiều nên vô cùng bức bối."},
    {"korean":"방학 내내 밀린 숙제를 해야 하는 내 마음은 괴롭기가 이를 데 없다.","vietnamese":"Cả kì nghỉ phải làm số bài tập bị dồn đọng từ trong năm học thật là không còn gì đau khổ hơn."},
    {"korean":"이렇게 다시 만나게 돼서 반갑기가 이를 데 없다.","vietnamese":"Gặp lại được nhau như thế này thật là không có gì vui sướng hơn."},
    {"korean":"코로나 때문에 집에만 있으려니 답답하기 이를 데 없다.","vietnamese":"Vì Covid-19 mà chỉ ở nhà nên quá ư là ngột ngạt."},
    {"korean":"아르바이트를 하며 공부하는 것은 힘들기 이를 데 없다.","vietnamese":"Vừa làm thêm vừa học đúng là không có gì vất vả hơn."}
  ]'::jsonb,
  ARRAY['A – 기 짝이 없다','A – 기 그지없다','여간 A/V – 지 않다']::TEXT[],
  ARRAY['degree','superlative','literary','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'출퇴근 시간에 버스가 너무 복잡해서 혼잡하기가 이를 데___.','fill_blank','["없다","않다","모른다","힘들다"]'::jsonb,0,'최상급 강조: 이를 데 없다 → 비교 대상이 없을 정도로 극심.'
FROM public.grammar_patterns WHERE pattern='A – 기가 이를 데 없다' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'이렇게 다시 만나게 돼서 반갑___ 이를 데 없다.','fill_blank','["기가","기를","기에","기는"]'::jsonb,0,'기가 이를 데 없다: 반갑기가 → 형용사+기가 연결.'
FROM public.grammar_patterns WHERE pattern='A – 기가 이를 데 없다' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #292: A – 기 짝이 없다  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A – 기 짝이 없다', 'gi jjagi eopda', 'Không còn gì...hơn, thật là... (mức độ cực đại)', 'advanced', 'degree',
  'Nhấn mạnh mức độ không gì so sánh được. Chủ yếu dùng trong văn viết. Biểu hiện tương tự: -기가 이를 데 없다.',
  'A + 기 짝이 없다',
  '[
    {"korean":"많은 사람들 앞에서 그런 실수를 하다니 부끄럽기 짝이 없어요.","vietnamese":"Thật quá là xấu hổ khi mắc lỗi như vậy trước nhiều người."},
    {"korean":"그 드라마가 정말 지루하기 짝이 없었다.","vietnamese":"Bộ phim đó thật quá là tẻ nhạt."},
    {"korean":"사람들이 나를 범인이라고 하니 억울하기 짝이 없습니다.","vietnamese":"Thật quá là uất ức khi mọi người coi tôi là kẻ phạm tội."},
    {"korean":"두 사람이 싸우는 것을 보니 유치하기 짝이 없군요.","vietnamese":"Việc xem hai người oánh cãi lộn nhau thật quá ư là ấu trĩ."},
    {"korean":"위험에 빠진 사람을 구하기 위해 불 속으로 뛰어들다니 용감하기 짝이 없다.","vietnamese":"Lao vào đám cháy để cứu người gặp nguy hiểm thật không còn gì dũng cảm hơn."},
    {"korean":"그동안 만나고 싶었던 친구를 만나니 기쁘기 짝이 없었다.","vietnamese":"Gặp mặt người bạn đã từng muốn gặp trong suốt thời gian qua thật không có gì vui hơn."}
  ]'::jsonb,
  ARRAY['A – 기가 이를 데 없다','A – 기 그지없다']::TEXT[],
  ARRAY['degree','superlative','literary','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'많은 사람들 앞에서 그런 실수를 하다니 부끄럽기___ 없어요.','fill_blank','["짝이","이를 데가","그지가","한이"]'::jsonb,0,'최상급 수치심: 부끄럽기 짝이 없다 → 비교 불가한 정도.'
FROM public.grammar_patterns WHERE pattern='A – 기 짝이 없다' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'그 드라마가 정말 지루하기___ 없었다.','fill_blank','["짝이","이를 데가","그지가","한이"]'::jsonb,0,'최상급 지루함 강조: 지루하기 짝이 없다.'
FROM public.grammar_patterns WHERE pattern='A – 기 짝이 없다' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #293: A – 기 그지없다  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A – 기 그지없다', 'gi geujieomda', 'Bao la, vô cùng... (mức độ không giới hạn)', 'advanced', 'degree',
  'Gắn với tính từ diễn tả cảm xúc và đánh giá với mức độ nhấn mạnh mức độ bao la rộng lớn, vô cùng của sự vật hiện tượng.',
  'A + 기 그지없다 / A + 기가 그지없다',
  '[
    {"korean":"자녀를 위한 부모의 사랑은 크기가 그지없다.","vietnamese":"Tình yêu cha mẹ dành cho con cái vô cùng lớn."},
    {"korean":"너의 행동은 실망스럽기가 그지없다.","vietnamese":"Hành động của cậu thật quá là thất vọng."},
    {"korean":"여기 바다 경치는 아름답기가 그지없다.","vietnamese":"Cảnh biển ở đây đẹp vô cùng."},
    {"korean":"어렸을 때 시절 내 인생은 지루하기가 그지없다.","vietnamese":"Cuộc sống của tôi thời thơ ấu vô cùng tẻ nhạt."},
    {"korean":"그 그림은 예쁘기가 그지없다.","vietnamese":"Bức tranh ấy tuyệt đẹp vô cùng."}
  ]'::jsonb,
  ARRAY['A – 기 짝이 없다','A – 기가 이를 데 없다']::TEXT[],
  ARRAY['degree','superlative','literary','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'여기 바다 경치는 아름답기가___.','fill_blank','["그지없다","짝이 없다","이를 데 없다","한이 없다"]'::jsonb,0,'무한 아름다움 강조: 아름답기가 그지없다 → 한계 없는 아름다움.'
FROM public.grammar_patterns WHERE pattern='A – 기 그지없다' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'너의 행동은 실망스럽기가___.','fill_blank','["그지없다","짝이 없다","이를 데 없다","한이 없다"]'::jsonb,0,'감정 극단 표현: 실망스럽기가 그지없다.'
FROM public.grammar_patterns WHERE pattern='A – 기 그지없다' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #294: V – 기에 앞서  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – 기에 앞서', 'gie apso', 'Trước khi... (hành động ưu tiên)', 'advanced', 'sequence',
  'Biểu hiện việc cần làm trước khi thực hiện một hành động nào đó. Mang sắc thái trang trọng, thường dùng trong văn viết và diễn thuyết.',
  'V + 기에 앞서',
  '[
    {"korean":"집을 임대하기에 앞서 계약서를 자세하게 읽어야 한다.","vietnamese":"Trước khi thuê nhà phải đọc bản hợp đồng một cách tỉ mỉ."},
    {"korean":"자신의 생각을 주장하기에 앞서 체계적인 준비를 해야 한다.","vietnamese":"Trước khi khẳng định suy nghĩ của mình, bạn phải chuẩn bị một cách có hệ thống."},
    {"korean":"해외에 이주하기에 앞서 그 나라에 대해 면밀히 분석해야 한다.","vietnamese":"Trước khi di cư ra nước ngoài, bạn phải tìm hiểu kỹ về đất nước đó."},
    {"korean":"어떤 제품을 사기에 앞서 그 제품에 대해 사전 검사를 하는 게 좋다.","vietnamese":"Trước khi mua sản phẩm nào đó, tốt nhất bạn nên kiểm tra sơ bộ sản phẩm."}
  ]'::jsonb,
  ARRAY['V – 기 전에','V – (으)ㄹ 앞서']::TEXT[],
  ARRAY['sequence','priority','formal','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'집을 임대하___ 계약서를 자세하게 읽어야 한다.','fill_blank','["기에 앞서","기 전에","는 전에","기 위해서"]'::jsonb,0,'우선 행동 강조: 임대하기에 앞서 → 기 전에보다 격식체.'
FROM public.grammar_patterns WHERE pattern='V – 기에 앞서' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'어떤 제품을 사___ 사전 검사를 하는 게 좋다.','fill_blank','["기에 앞서","기 전에","기 위해","는 전에"]'::jsonb,0,'구매 전 우선 조치: 사기에 앞서 → 선행 행동 강조.'
FROM public.grammar_patterns WHERE pattern='V – 기에 앞서' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #295: A – 기 한이 없다  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A – 기 한이 없다', 'gi hani eopda', 'Vô độ, vô hạn, không có điểm dừng... (mức độ vô giới hạn)', 'advanced', 'degree',
  'Gắn với tính từ diễn tả thể hiện cảm giác và sự đánh giá, chủ yếu diễn tả trạng thái nghiêm trọng đến mức độ vô hạn, vô cùng của sự vật hiện tượng.',
  'A + 기 한이 없다 / A + 기가 한이 없다',
  '[
    {"korean":"엄청난 부자이면서도 욕심은 한이 없어요.","vietnamese":"Dù là người cực giàu rồi nhưng anh ta vẫn vô cùng tham lam."},
    {"korean":"창 밖으로 보이는 바다의 경치는 아름답기가 한이 없다.","vietnamese":"Cảnh biển nhìn qua cửa sổ tuyệt đẹp vô cùng."},
    {"korean":"구조 대원들이 수재민에게 보낸 사랑은 따뜻하기 한이 없다.","vietnamese":"Tình thương ấm áp mà các thành viên đội cứu hộ gửi đến đồng bào lũ lụt là vô hạn."}
  ]'::jsonb,
  ARRAY['A – 기 그지없다','A – 기 짝이 없다']::TEXT[],
  ARRAY['degree','superlative','literary','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'바다의 경치는 아름답기가___ 없다.','fill_blank','["한이","짝이","이를 데가","그지가"]'::jsonb,0,'무한 아름다움: 아름답기가 한이 없다 → 끝없는 아름다움.'
FROM public.grammar_patterns WHERE pattern='A – 기 한이 없다' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'구조 대원들이 수재민에게 보낸 사랑은 따뜻하기___ 없다.','fill_blank','["한이","짝이","이를 데가","그지가"]'::jsonb,0,'무한 따뜻함 강조: 따뜻하기 한이 없다.'
FROM public.grammar_patterns WHERE pattern='A – 기 한이 없다' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #296: A – (으)ㄴ 감이 있다  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A – (으)ㄴ 감이 있다', '(eu)n gami itda', 'Có cảm giác rằng... (phán đoán chủ quan)', 'advanced', 'subjective_judgment',
  'Biểu hiện sự phán đoán mang tính chất chủ quan của người nói.',
  'A + (으)ㄴ 감이 있다',
  '[
    {"korean":"색이 약간 진한 감이 있지만 얼굴에 잘 어울린다.","vietnamese":"Cảm giác như màu sắc hơi đậm nhưng rất hợp với khuôn mặt."},
    {"korean":"우리가 일을 너무 서두르는 감이 있어요.","vietnamese":"Cảm giác như chúng ta đã làm việc quá vội vàng."},
    {"korean":"그 문제는 고등학생이 풀기에 쉬운 감이 있습니다.","vietnamese":"Tôi nghĩ là vấn đề đó dễ dàng cho học sinh phổ thông giải quyết."},
    {"korean":"미국에서 태어났지만 한국에서 오래 살아서 그런지 한국어로 말하는 게 더 편한 감이 있어요.","vietnamese":"Mặc dù sinh ra ở Mỹ nhưng sống ở Hàn Quốc lâu hay sao mà tôi cảm thấy việc nói tiếng Hàn thoải mái hơn."},
    {"korean":"대학 입시를 다시 치르겠다는 친구의 결정은 좀 늦은 감이 있어요.","vietnamese":"Tôi nghĩ là quyết định của bạn rằng sẽ dự thi lại kỳ thi tuyển sinh là hơi trễ."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는 것 같다','A/V – (으)ㄴ/는 가 싶다']::TEXT[],
  ARRAY['subjective_judgment','feeling','impression','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'색이 약간 진한___ 있지만 얼굴에 잘 어울린다.','fill_blank','["감이","듯이","것이","편이"]'::jsonb,0,'주관적 인상: 진한 감이 있다 → 느낌/판단 표현.'
FROM public.grammar_patterns WHERE pattern='A – (으)ㄴ 감이 있다' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'친구의 결정은 좀 늦은___ 있어요.','fill_blank','["감이","듯이","것이","편이"]'::jsonb,0,'주관적 평가: 늦은 감이 있다 → 개인적 판단 표현.'
FROM public.grammar_patterns WHERE pattern='A – (으)ㄴ 감이 있다' AND topik_level='TOPIK IV';
