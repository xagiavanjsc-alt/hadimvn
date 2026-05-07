-- Migration 082: Reclassify 27 existing patterns to TOPIK VI and insert 12 new TOPIK VI patterns

-- ============================================================
-- PART 1: Reclassify existing patterns to TOPIK VI
-- ============================================================

-- From TOPIK III
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – 느니만큼';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – (으)ㄴ/는 이상';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – 기 마련이다';

-- From TOPIK IV
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – (으)ㄴ/는 까닭에';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – (으)ㄹ지라도';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'V – 기가 무섭게';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'V – (으)ㄹ라치면';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'V – 노라면';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'V – 거들랑';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'V – 기 나름이다';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – 기는 커녕';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'N 는 고사하고';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – (으)ㄹ 뿐더러';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'V – 기 일쑤이다';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – (으)ㄴ/는가 하면';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'V-(으)ㄴ 끝에';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – (으)ㄴ/는 마당에';

-- From TOPIK V
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – (으)ㄹ진대';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – 거늘';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – (느)ㄴ다손 치더라도';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – (으)ㄹ 망정';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – (으)ㄹ지언정';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – 거니와';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A/V – 다 못해';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'A – 기 그지없다';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'N – 을/를 막론하고';
UPDATE public.grammar_patterns SET topik_level = 'TOPIK VI' WHERE pattern = 'N – 을/를 불문하고';

-- ============================================================
-- PART 2: Insert 12 new TOPIK VI patterns
-- ============================================================

-- #322: A/V – 되
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – 되', 'A/V – doe',
  'Nhưng, tuy nhiên, thế nhưng (nhượng bộ/tương phản văn học)', 'advanced', 'concessive',
  'Vĩ tố liên kết biểu thị quan hệ tương phản hoặc nhượng bộ giữa hai vế câu. Mang sắc thái trang trọng và văn học. Tương đương với 지만 trong văn viết chính thức.',
  'A/V + 되',
  '[
    {"korean":"길은 멀되 발길이 멈추지 않았다.","vietnamese":"Đường tuy xa nhưng bước chân không dừng lại."},
    {"korean":"조심하되 너무 걱정하지 마라.","vietnamese":"Hãy cẩn thận nhưng đừng lo lắng quá."},
    {"korean":"수입은 많되 지출도 많다.","vietnamese":"Doanh thu tuy nhiều nhưng chi phí cũng nhiều."},
    {"korean":"말은 하되 필요 이상은 하지 마라.","vietnamese":"Nói nhưng đừng nói hơn mức cần thiết."},
    {"korean":"노력은 하되 결과에 집착하지 마라.","vietnamese":"Hãy nỗ lực nhưng đừng chấp vào kết quả."}
  ]'::jsonb,
  ARRAY['A/V – 지만', 'A/V – (으)나']::TEXT[],
  ARRAY['concessive','contrast','literary','formal','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'길은 멀___ 발길이 멈추지 않았다.','fill_blank','["되","지만","지만도","으나"]'::jsonb,0,'문어체 역접: 멀되 → 격식체 역접 연결.'
FROM public.grammar_patterns WHERE pattern='A/V – 되' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'조심하___ 너무 걱정하지 마라.','fill_blank','["되","지만","으나","는데"]'::jsonb,0,'문어체 역접: 하되 → 조심하되 너무 걱정 말라.'
FROM public.grammar_patterns WHERE pattern='A/V – 되' AND topik_level='TOPIK VI';

-- #323: V – 아/어/여 본들
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – 아/어/여 본들', 'V – a/eo/yeo bondeul',
  'Cho dù (có thử) đi nữa cũng... (nhượng bộ vô ích)', 'advanced', 'concessive',
  'Dùng khi ngay cả khi thực hiện hành động ở vế trước thì kết quả vế sau cũng không thay đổi. Nhấn mạnh tính vô ích. Tương tự 아/어 봐야 nhưng 본들 có sắc thái văn học hơn.',
  'V + 아/어/여 본들',
  '[
    {"korean":"지금 가 본들 소용이 없어요.","vietnamese":"Có đi lúc này thì cũng vô ích thôi."},
    {"korean":"아무리 울어 본들 해결이 되지 않아요.","vietnamese":"Cho dù có khóc đi nữa thì cũng không giải quyết được."},
    {"korean":"지금 사과해 본들 이미 늦었어요.","vietnamese":"Cho dù có xin lỗi bây giờ đi nữa thì đã muộn rồi."},
    {"korean":"혼자 힘으로 해 본들 이 문제는 해결하기 어렵다.","vietnamese":"Cho dù tự mình làm đi nữa thì bài toán này cũng khó giải."}
  ]'::jsonb,
  ARRAY['V – 아/어 봐야', 'V – 아/어봤자']::TEXT[],
  ARRAY['concessive','futility','literary','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'지금 가 ___ 소용이 없어요.','fill_blank','["본들","봐야","봤자","보면"]'::jsonb,0,'시도해도 소용없음(문어체): 가 본들 → 문어체 시도-무의미.'
FROM public.grammar_patterns WHERE pattern='V – 아/어/여 본들' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'아무리 울어 ___ 해결이 되지 않아요.','fill_blank','["본들","봐야","봤자","도"]'::jsonb,0,'강조+무의미 문어체: 울어 본들 → 울어 봐도 소용없음.'
FROM public.grammar_patterns WHERE pattern='V – 아/어/여 본들' AND topik_level='TOPIK VI';

-- #324: A/V – 기로니
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – 기로니', 'A/V – gironi',
  'Chính vì..., bởi vì..., đã là... thì... (nguyên nhân văn cổ)', 'advanced', 'causal',
  'Diễn tả nguyên nhân mang tính khẳng định, trang trọng, chủ yếu dùng trong văn viết cổ điển hoặc văn học. Cũng có dạng 기로서니. Thường kèm theo kết quả tất yếu ở vế sau.',
  'N + (이)기로니 / A/V + 기로니',
  '[
    {"korean":"어른이기로니 마땅히 솔선수범해야 한다.","vietnamese":"Chính vì là người lớn thì phải làm gương trước là đúng."},
    {"korean":"친구기로니 이 정도는 이해해 줘야지.","vietnamese":"Chính vì là bạn bè thì phải hiểu cho đến thế này chứ."},
    {"korean":"내가 아무리 바쁘기로니 이 일만큼은 해야 한다.","vietnamese":"Cho dù tôi bận thế nào thì việc này nhất định phải làm."}
  ]'::jsonb,
  ARRAY['A/V – (이)기에', 'A/V – 이므로']::TEXT[],
  ARRAY['causal','archaic','literary','formal','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'어른이___ 마땅히 솔선수범해야 한다.','fill_blank','["기로니","므로","기 때문에","이니까"]'::jsonb,0,'고어체 원인-당연 결과: 어른이기로니 → 격식·문어체.'
FROM public.grammar_patterns WHERE pattern='A/V – 기로니' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'친구___ 이 정도는 이해해 줘야지.','fill_blank','["기로니","이니","이기에","기에"]'::jsonb,0,'명사+기로니: 친구기로니 → 관계에 근거한 당위.'
FROM public.grammar_patterns WHERE pattern='A/V – 기로니' AND topik_level='TOPIK VI';

-- #325: V – 기로 말미암아
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – 기로 말미암아', 'V – giro malmiamwa',
  'Vì việc..., do việc... (nguyên nhân trang trọng văn viết)', 'advanced', 'causal',
  'Nhấn mạnh hành động ở vế trước là nguyên nhân dẫn đến kết quả thường là tiêu cực hoặc quan trọng. So sánh: N으로 말미암아 = nguyên nhân là danh từ; V기로 말미암아 = nguyên nhân là hành động.',
  'V + 기로 말미암아',
  '[
    {"korean":"법을 어기기로 말미암아 결국 처벌을 받게 되었다.","vietnamese":"Vì vi phạm pháp luật mà cuối cùng đã bị xử phạt."},
    {"korean":"그가 거짓말을 하기로 말미암아 모든 신뢰가 무너졌다.","vietnamese":"Vì anh ta nói dối mà toàn bộ lòng tin đã sụp đổ."},
    {"korean":"환경을 파괴하기로 말미암아 심각한 문제가 생겼다.","vietnamese":"Vì phá hoại môi trường mà những vấn đề nghiêm trọng đã xảy ra."}
  ]'::jsonb,
  ARRAY['N – (으)로 말미암아', 'A/V – 기 때문에']::TEXT[],
  ARRAY['causal','formal','written','action_cause','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'법을 어기___ 처벌을 받게 되었다.','fill_blank','["기로 말미암아","기 때문에","음으로써","므로"]'::jsonb,0,'동사+기로 말미암아: 어기기로 말미암아 → 문어체 행위 원인.'
FROM public.grammar_patterns WHERE pattern='V – 기로 말미암아' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'환경을 파괴하___ 심각한 문제가 생겼다.','fill_blank','["기로 말미암아","기 때문에","므로","아서"]'::jsonb,0,'문어체 행위 원인: 파괴하기로 말미암아 → 격식 서술.'
FROM public.grammar_patterns WHERE pattern='V – 기로 말미암아' AND topik_level='TOPIK VI';

-- #326: A/V – 거니만큼
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – 거니만큼', 'A/V – geonimankeum',
  'Chính vì thế..., bởi vậy nên... (căn cứ hiển nhiên để kết luận)', 'advanced', 'causal',
  'Căn cứ vào một sự thật đã biết và hiển nhiên ở vế trước để đưa ra phán xét hoặc kết luận ở vế sau. Mang sắc thái trang trọng hơn 느니만큼. Chỉ dùng trong văn viết chính thức.',
  'A/V + 거니만큼 / N + (이)거니만큼',
  '[
    {"korean":"이 일은 매우 중요하거니만큼 철저하게 준비해야 해요.","vietnamese":"Công việc này chính vì rất quan trọng nên phải chuẩn bị kỹ lưỡng."},
    {"korean":"이미 결정된 사항이거니만큼 더 이상 논의할 필요가 없다.","vietnamese":"Chính vì đây là điều đã quyết định nên không cần thảo luận thêm nữa."},
    {"korean":"워낙 어려운 상황이거니만큼 모두의 협조가 필요하다.","vietnamese":"Chính vì tình huống vốn đã rất khó khăn nên cần sự hợp tác của tất cả."}
  ]'::jsonb,
  ARRAY['A/V – 느니만큼', 'A/V – (이)므로']::TEXT[],
  ARRAY['causal','basis','formal','written','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'이 일은 매우 중요하___ 철저하게 준비해야 해요.','fill_blank','["거니만큼","느니만큼","으니만큼","기에"]'::jsonb,0,'사실 근거+판단 고급: 중요하거니만큼 → 사실의 당연한 귀결.'
FROM public.grammar_patterns WHERE pattern='A/V – 거니만큼' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'이미 결정된 사항이___ 더 이상 논의할 필요가 없다.','fill_blank','["거니만큼","으니만큼","니까","므로"]'::jsonb,0,'명사+거니만큼: 사항이거니만큼 → 이미 알려진 사실 근거.'
FROM public.grammar_patterns WHERE pattern='A/V – 거니만큼' AND topik_level='TOPIK VI';

-- #327: A/V – 매
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – 매', 'A/V – mae',
  'Khi..., vì..., nhân... (văn viết cổ/hành chính trang trọng)', 'advanced', 'causal',
  'Vĩ tố liên kết mang ý nghĩa khi, vì, nhân dùng trong văn viết cổ điển và hành chính trang trọng. Gần như không dùng trong văn nói hiện đại.',
  'V + 매 / A + 매',
  '[
    {"korean":"날이 개매 온 가족이 소풍을 나갔다.","vietnamese":"Nhân trời đẹp nên cả gia đình đi dã ngoại."},
    {"korean":"비가 오매 강물이 불어났다.","vietnamese":"Khi trời mưa thì nước sông dâng lên."},
    {"korean":"봄이 오매 꽃이 피었다.","vietnamese":"Khi mùa xuân đến thì hoa nở."},
    {"korean":"그를 만나매 마음이 편안해졌다.","vietnamese":"Khi gặp anh ấy thì tâm trí trở nên bình an."}
  ]'::jsonb,
  ARRAY['A/V – 으니/니', 'A/V – 아/어서']::TEXT[],
  ARRAY['causal','temporal','archaic','administrative','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'봄이 오___ 꽃이 피었다.','fill_blank','["매","면","자","니"]'::jsonb,0,'문어체·고어 시간: 오매 → 때가 되자/오니.'
FROM public.grammar_patterns WHERE pattern='A/V – 매' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'비가 오___ 강물이 불어났다.','fill_blank','["매","면서","니까","자마자"]'::jsonb,0,'고어체 원인/시간: 오매 → 격식 고어체 연결.'
FROM public.grammar_patterns WHERE pattern='A/V – 매' AND topik_level='TOPIK VI';

-- #328: A/V – (으)ㄹ 양으로
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)ㄹ 양으로', 'A/V – (eu)l yangeuro',
  'Với ý định..., ra vẻ như muốn... (tỏ vẻ có ý định)', 'advanced', 'conditional',
  'Diễn tả hành động của chủ thể thể hiện dấu hiệu hoặc ý định muốn thực hiện điều gì đó. Mang sắc thái tỏ ra, ra vẻ muốn. Cũng có dạng (으)ㄹ 양이다.',
  'V + (으)ㄹ 양으로 / A + (으)ㄹ 양으로',
  '[
    {"korean":"울 양으로 얼굴을 찡그렸지만 눈물은 나오지 않았다.","vietnamese":"Ra vẻ muốn khóc, nhăn mặt nhưng nước mắt lại không chảy ra."},
    {"korean":"그는 갈 양으로 짐을 챙기기 시작했다.","vietnamese":"Anh ta với ý định sẽ đi nên bắt đầu thu dọn hành lý."},
    {"korean":"도망갈 양으로 문 쪽을 힐끔 봤다.","vietnamese":"Với ý định muốn chạy trốn, anh ta liếc nhìn về phía cửa."},
    {"korean":"말을 할 양으로 입을 열었지만 말이 나오지 않았다.","vietnamese":"Ra vẻ muốn nói, mở miệng nhưng lời không ra được."}
  ]'::jsonb,
  ARRAY['A/V – (으)려고', 'A/V – (으)ㄹ 듯이']::TEXT[],
  ARRAY['conditional','intention','literary','pretense','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'갈 ___ 짐을 챙기기 시작했다.','fill_blank','["양으로","듯이","것처럼","양이면"]'::jsonb,0,'의도 몸짓 표현: 갈 양으로 → 갈 것처럼 행동함.'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 양으로' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'울 ___ 얼굴을 찡그렸지만 눈물은 나오지 않았다.','fill_blank','["양으로","듯이","것처럼","것 같이"]'::jsonb,0,'몸짓으로 의도 나타냄: 울 양으로 → 격식체.'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 양으로' AND topik_level='TOPIK VI';

-- #329: V – 느니만 못하다
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – 느니만 못하다', 'V – neuniман motada',
  'Không bằng việc không..., thà không làm còn hơn (so sánh phủ định)', 'advanced', 'degree',
  'Hành động hoặc trạng thái ở vế trước tệ hơn hoặc không bằng việc không làm gì. Thường dùng để chỉ trích hoặc nhấn mạnh sự vô ích của hành động.',
  'V + 느니만 못하다',
  '[
    {"korean":"그렇게 공부할 바에는 안 하느니만 못해요.","vietnamese":"Học như thế thì thà không học còn hơn."},
    {"korean":"이렇게 요리하느니 차라리 사먹느니만 못하다.","vietnamese":"Nấu như thế này thì thà mua ăn còn hơn."},
    {"korean":"그 사람과 같이 일하는 것이 혼자 하느니만 못해요.","vietnamese":"Làm việc cùng người đó không bằng tự làm một mình."},
    {"korean":"반쪽짜리 도움은 안 하느니만 못해요.","vietnamese":"Giúp đỡ nửa vời thì không bằng không giúp gì cả."}
  ]'::jsonb,
  ARRAY['V – 는 것보다 못하다', 'V – 차라리']::TEXT[],
  ARRAY['degree','comparison','negative','futility','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'그렇게 공부하___ 안 하는 것이 낫겠어요.','fill_blank','["느니만 못해","기보다","는 것보다","기가 더"]'::jsonb,0,'행위보다 포기가 나음: 하느니만 못해 → 차라리 안 하는 게 낫다.'
FROM public.grammar_patterns WHERE pattern='V – 느니만 못하다' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'그 사람과 같이 일하는 것이 혼자 하___ 못해요.','fill_blank','["느니만","기보다","기 전이","는 것보다"]'::jsonb,0,'비교 부정: 혼자 하느니만 못해요 → 함께하는 것이 더 나쁨.'
FROM public.grammar_patterns WHERE pattern='V – 느니만 못하다' AND topik_level='TOPIK VI';

-- #330: A/V – (으)ㄴ/는 셈치다
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)ㄴ/는 셈치다', 'A/V – (eu)n/neun semchida',
  'Coi như là..., xem như... (chấp nhận giả định như thực tế)', 'advanced', 'degree',
  'Coi hoặc giả định điều gì đó như thể đã xảy ra hoặc đúng thực tế, để làm cơ sở cho hành động. Mang sắc thái chấp nhận và tiếp tục hành động.',
  'V + (으)ㄴ/는 셈치다 / A + (으)ㄴ 셈치다',
  '[
    {"korean":"돈을 잃어버린 셈치고 더 이상 생각하지 마세요.","vietnamese":"Cứ coi như mất tiền rồi và đừng nghĩ đến nó nữa."},
    {"korean":"여행 경비로 낸 셈치면 아깝지 않아요.","vietnamese":"Nếu coi như tiền chi phí du lịch thì không tiếc."},
    {"korean":"오늘은 운동한 셈치고 계단을 걸어 올라가요.","vietnamese":"Hôm nay cứ coi như tập thể dục và đi bộ lên cầu thang."},
    {"korean":"한번 죽었다 살아난 셈치고 새로 시작해 봐요.","vietnamese":"Cứ coi như đã chết đi sống lại và thử bắt đầu lại từ đầu nhé."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는 셈이다', 'A/V – (으)ㄴ/는 척하다']::TEXT[],
  ARRAY['degree','assumption','acceptance','action','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'돈을 잃어버린 ___ 더 이상 생각하지 마세요.','fill_blank','["셈치고","것으로 하고","셈이고","듯이"]'::jsonb,0,'사실로 간주하고 행동: 잃어버린 셈치고 → 가정 수용 후 행동.'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄴ/는 셈치다' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'오늘은 운동한 ___ 계단을 걸어 올라가요.','fill_blank','["셈치고","것으로 하고","셈이고","것처럼"]'::jsonb,0,'사실 간주 행동: 운동한 셈치고 → 운동으로 인정하며 행동.'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄴ/는 셈치다' AND topik_level='TOPIK VI';

-- #331: A/V – (으)ㄹ 턱이 없다
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)ㄹ 턱이 없다', 'A/V – (eu)l tteogi eopda',
  'Không có lý do..., không thể nào... (phủ định khả năng có cơ sở)', 'advanced', 'degree',
  'Biểu thị không có lý do hay cơ sở nào để điều gì đó xảy ra. Nhấn mạnh tính không thể xảy ra dựa trên lý luận logic. Thường dùng trong văn nói trang trọng và văn viết.',
  'V + (으)ㄹ 턱이 없다 / A + (으)ㄹ 턱이 없다',
  '[
    {"korean":"그 사람이 그런 말을 했을 턱이 없어요.","vietnamese":"Không có lý gì người đó lại nói như vậy."},
    {"korean":"이렇게 열심히 공부했으니 시험에 떨어질 턱이 없다.","vietnamese":"Đã học chăm chỉ như thế này thì không có lý gì trượt thi."},
    {"korean":"저 사람이 그 비밀을 알 턱이 없어요.","vietnamese":"Người kia không có lý do gì để biết bí mật đó."},
    {"korean":"그가 갑자기 마음을 바꿀 턱이 없다.","vietnamese":"Không có lý nào anh ta lại đột nhiên thay đổi ý kiến."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 리가 없다', 'A/V – (으)ㄹ 수가 없다']::TEXT[],
  ARRAY['degree','negation','impossibility','basis','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'그 사람이 그런 말을 했을 ___ 없어요.','fill_blank','["턱이","리가","수가","것이"]'::jsonb,0,'논리적 불가능 강조: 했을 턱이 없다 → 그럴 이유·근거 부재.'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 턱이 없다' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'이렇게 열심히 공부했으니 시험에 떨어질 ___ 없다.','fill_blank','["턱이","리가","수가","법이"]'::jsonb,0,'근거 기반 부정: 떨어질 턱이 없다 → 결코 그럴 리 없다.'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 턱이 없다' AND topik_level='TOPIK VI';

-- #332: A/V – (으)ㄹ 리 만무하다
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)ㄹ 리 만무하다', 'A/V – (eu)l ri manmuhada',
  'Tuyệt đối không thể..., không có cách nào... (phủ định hoàn toàn, văn viết)', 'advanced', 'degree',
  'Mạnh hơn (으)ㄹ 리가 없다, nhấn mạnh sự không thể xảy ra một cách tuyệt đối. Chủ yếu dùng trong văn viết trang trọng. 만무하다 = tuyệt đối không có.',
  'V + (으)ㄹ 리 만무하다 / A + (으)ㄹ 리 만무하다',
  '[
    {"korean":"그가 그런 짓을 했을 리 만무하다.","vietnamese":"Tuyệt đối không thể là anh ta đã làm điều đó."},
    {"korean":"이 가격에 진품일 리 만무하다.","vietnamese":"Với giá này tuyệt đối không thể là hàng thật."},
    {"korean":"그 사람이 우리를 배신했을 리 만무해요.","vietnamese":"Tuyệt đối không có khả năng người đó đã phản bội chúng ta."},
    {"korean":"성실하게 일한 사람이 해고될 리 만무하다.","vietnamese":"Người làm việc chăm chỉ tuyệt đối không thể bị sa thải."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 리가 없다', 'A/V – (으)ㄹ 턱이 없다']::TEXT[],
  ARRAY['degree','negation','absolute','written','formal','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'그가 그런 짓을 했을 ___ 만무하다.','fill_blank','["리","수가","턱이","법이"]'::jsonb,0,'완전 부정 문어체: 했을 리 만무하다 → 그럴 가능성 절대 없음.'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 리 만무하다' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'이 가격에 진품일 ___ 만무하다.','fill_blank','["리","수가","것이","법이"]'::jsonb,0,'근거 기반 완전 부정: 진품일 리 만무하다 → 절대 있을 수 없음.'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 리 만무하다' AND topik_level='TOPIK VI';

-- #333: V – 기 바쁘게
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – 기 바쁘게', 'V – gi ppappeuge',
  'Ngay sau khi, vừa xong cái thì liền... (lập tức, văn học)', 'advanced', 'time',
  'Diễn tả hành động ở vế sau xảy ra ngay lập tức sau khi hành động ở vế trước kết thúc. Tương tự 기가 무섭게 nhưng 기 바쁘게 mang sắc thái văn học hơn, nhấn mạnh tính vội vã.',
  'V + 기 바쁘게',
  '[
    {"korean":"방학이 되기 바쁘게 학생들은 각자의 여행을 떠났다.","vietnamese":"Ngay khi kỳ nghỉ bắt đầu, các học sinh đã lên đường du lịch ngay."},
    {"korean":"시험이 끝나기 바쁘게 학생들이 강의실을 빠져나갔다.","vietnamese":"Ngay khi bài thi kết thúc, học sinh đã ùa ra khỏi phòng thi."},
    {"korean":"그는 집에 들어서기 바쁘게 신발도 벗지 않고 뛰어 들어갔다.","vietnamese":"Anh ta vừa bước vào nhà là đã chạy vào không cả tháo giày."},
    {"korean":"공이 골문에 들어가기 바쁘게 관중들이 환호성을 질렀다.","vietnamese":"Ngay khi bóng vào lưới, khán giả đã hô vang."}
  ]'::jsonb,
  ARRAY['V – 기가 무섭게', 'V – 자마자']::TEXT[],
  ARRAY['time','immediacy','sequence','literary','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'방학이 되기 ___ 학생들은 여행을 떠났다.','fill_blank','["바쁘게","무섭게","자마자","가 바쁘게"]'::jsonb,0,'문어체 즉시성: 되기 바쁘게 → 방학이 시작되자마자 바로.'
FROM public.grammar_patterns WHERE pattern='V – 기 바쁘게' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'시험이 끝나기 ___ 학생들이 강의실을 빠져나갔다.','fill_blank','["바쁘게","무섭게","자마자","가 바쁘게"]'::jsonb,0,'행동 직후 즉시 결과 (문어체): 끝나기 바쁘게.'
FROM public.grammar_patterns WHERE pattern='V – 기 바쁘게' AND topik_level='TOPIK VI';
