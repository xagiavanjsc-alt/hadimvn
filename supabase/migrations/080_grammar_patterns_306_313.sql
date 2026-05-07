-- Migration 080: Grammar Patterns #306-313 (TOPIK 6)

-- #306: 만약/만일 – (으)면/(으)ㄹ 텐데
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '만약/만일 – (으)면/(으)ㄹ 텐데', 'manyag/manil – (eu)myeon/(eu)l tende',
  'Nhỡ như, nếu như... (giả định, có thể trái với thực tế)', 'advanced', 'conditional',
  '만약/만일 là trạng từ nhấn mạnh tính giả định không chắc xảy ra. Kết hợp với (으)면 cho điều kiện thông thường hoặc (았/었)다면...(으)ㄹ 텐데 cho giả định trái thực tế.',
  '만약/만일 + A/V + (으)면 + ... / 만약/만일 + A/V + 았/었다면 + V + (으)ㄹ 텐데',
  '[
    {"korean":"내가 만약 공부를 좀 더 잘했다면 좋은 대학에 갈 수 있었을 텐데.","vietnamese":"Giả như mình chịu học chăm thêm một chút thì vào được trường đại học tốt rồi."},
    {"korean":"만일 그 일이 사실이라면 큰일이다.","vietnamese":"Nếu như chuyện đó là thật thì to chuyện rồi."},
    {"korean":"만약 돈이 많다면 세계 여행을 하고 싶다.","vietnamese":"Nếu có nhiều tiền thì tôi muốn đi du lịch vòng quanh thế giới."},
    {"korean":"만일 내가 그때 더 조심했더라면 사고가 나지 않았을 텐데.","vietnamese":"Nếu lúc đó tôi cẩn thận hơn thì đã không xảy ra tai nạn rồi."},
    {"korean":"만약 기회가 있다면 다시 도전해 보고 싶다.","vietnamese":"Nếu có cơ hội thì tôi muốn thử thách lại một lần nữa."}
  ]'::jsonb,
  ARRAY['A/V – (으)면', 'A/V – 았/었더라면']::TEXT[],
  ARRAY['conditional','hypothetical','contrary_to_fact','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'내가 만약 공부를 좀 더 잘했다면 좋은 대학에 갈 수 있었을___.','fill_blank','["텐데","거야","거든","는데"]'::jsonb,0,'반사실 가정: 만약 + 았/었다면 + (으)ㄹ 텐데 → 과거 반사실.'
FROM public.grammar_patterns WHERE pattern='만약/만일 – (으)면/(으)ㄹ 텐데' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'___ 그 일이 사실이라면 큰일이다.','fill_blank','["만일","혹시","비록","아마"]'::jsonb,0,'강한 가정 강조: 만일 → 만약/만일 동일 의미, 가정 강조.'
FROM public.grammar_patterns WHERE pattern='만약/만일 – (으)면/(으)ㄹ 텐데' AND topik_level='TOPIK VI';

-- #307: 혹시 – (으)면/아/어도/더라도
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '혹시 – (으)면/아/어도/더라도', 'hoksi – (eu)myeon/a/eodo/deorado',
  'Giả sử, lỡ đâu, không chừng... (khả năng thấp, hỏi lịch sự)', 'advanced', 'conditional',
  '혹시 là trạng từ mang nghĩa giả định khả năng xảy ra thấp hoặc hỏi lịch sự. Kết hợp với (으)면, 아/어도, 더라도.',
  '혹시 + A/V + (으)면 / 혹시 + A/V + 아/어도 / 혹시 + A/V + 더라도',
  '[
    {"korean":"이번 주 토요일에 혹시 시간 괜찮으면 영화 보러 안 갈래?","vietnamese":"Thứ 7 tuần này giả dụ mà có thời gian bạn có muốn đi xem phim không?"},
    {"korean":"혹시 모르니 우산을 가져가세요.","vietnamese":"Lỡ đâu không biết thế nào nên mang theo ô đi."},
    {"korean":"혹시 실망하더라도 포기하지 마세요.","vietnamese":"Dù lỡ có thất vọng thì cũng đừng bỏ cuộc."},
    {"korean":"혹시 그 사람을 아세요?","vietnamese":"Không chừng bạn có biết người đó không?"},
    {"korean":"혹시 필요하면 언제든지 연락하세요.","vietnamese":"Lỡ đâu cần thì cứ liên lạc bất cứ lúc nào."}
  ]'::jsonb,
  ARRAY['만약/만일 – (으)면/(으)ㄹ 텐데','A/V – 더라도']::TEXT[],
  ARRAY['conditional','polite','possibility','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'이번 주 토요일에 ___ 시간 괜찮으면 영화 보러 안 갈래?','fill_blank','["혹시","만약","비록","아마"]'::jsonb,0,'가능성 낮은 가정+정중한 제안: 혹시 + (으)면 → 조심스러운 제안.'
FROM public.grammar_patterns WHERE pattern='혹시 – (으)면/아/어도/더라도' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'혹시 실망하___ 포기하지 마세요.','fill_blank','["더라도","아도","면","지만"]'::jsonb,0,'양보: 혹시 실망하더라도 → 혹시+더라도 조합.'
FROM public.grammar_patterns WHERE pattern='혹시 – (으)면/아/어도/더라도' AND topik_level='TOPIK VI';

-- #308: 비록 – 더라도/(으)ㄹ지라도
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '비록 – 더라도/(으)ㄹ지라도', 'birok – deorado/(eu)ljirado',
  'Mặc dù, cho dù... (nhượng bộ mạnh, văn viết)', 'advanced', 'concession',
  '비록 là trạng từ nhấn mạnh sự nhượng bộ, thường đi với 더라도 hoặc (으)ㄹ지라도 (văn viết trang trọng hơn). Nhấn mạnh rằng dù hoàn cảnh khó khăn vẫn kiên định ở vế sau.',
  '비록 + A/V + 더라도 / 비록 + A/V + (으)ㄹ지라도',
  '[
    {"korean":"비록 지금의 현실이 가혹하더라도 절대 꿈을 잃지 마십시오.","vietnamese":"Cho dù hiện tại hiện thực có khắc nghiệt đi chăng nữa tuyệt đối đừng đánh mất ước mơ."},
    {"korean":"비록 실패하더라도 도전하는 것이 중요하다.","vietnamese":"Mặc dù có thất bại đi nữa, điều quan trọng là dám thử thách."},
    {"korean":"비록 몸은 멀리 있을지라도 마음은 항상 함께하겠습니다.","vietnamese":"Cho dù thân xác có ở xa đi nữa, trái tim sẽ luôn ở cùng."},
    {"korean":"비록 작은 선물이지만 마음을 담아 드립니다.","vietnamese":"Mặc dù là món quà nhỏ nhưng tôi gửi tặng với tất cả tấm lòng."},
    {"korean":"비록 늦었더라도 지금이라도 시작해 보세요.","vietnamese":"Dù có muộn rồi thì hãy bắt đầu ngay bây giờ đi."}
  ]'::jsonb,
  ARRAY['A/V – 더라도','A/V – (으)ㄹ지라도']::TEXT[],
  ARRAY['concession','literary','formal','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'비록 지금의 현실이 가혹하___ 절대 꿈을 잃지 마십시오.','fill_blank','["더라도","아도","지만","면서도"]'::jsonb,0,'비록+더라도: 강한 양보 → 비록 가혹하더라도.'
FROM public.grammar_patterns WHERE pattern='비록 – 더라도/(으)ㄹ지라도' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'비록 몸은 멀리 있을___ 마음은 항상 함께하겠습니다.','fill_blank','["지라도","더라도","지만","어도"]'::jsonb,0,'문어체 양보: (으)ㄹ지라도 → 비록+ㄹ지라도 문어적 표현.'
FROM public.grammar_patterns WHERE pattern='비록 – 더라도/(으)ㄹ지라도' AND topik_level='TOPIK VI';

-- #309: 아무리 – 아/어도
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '아무리 – 아/어도', 'amuri – a/eodo',
  'Dù như thế nào đi nữa, dù có... đến đâu... cũng... (nhấn mạnh nhượng bộ)', 'advanced', 'concession',
  '아무리 là trạng từ nhấn mạnh mức độ tuyệt đối của sự nhượng bộ. Luôn đi với 아/어도, -더라도. Vế sau thường có ý nghĩa phủ nhận hoặc bất biến.',
  '아무리 + A/V + 아/어도 + ...',
  '[
    {"korean":"상대방 전화기가 고장났는지 아무리 걸어도 신호가 가지 않는다.","vietnamese":"Không biết người kia điện thoại hỏng hay sao cho dù gọi thế nào cũng không có tín hiệu."},
    {"korean":"아무리 배가 불러도 케이크는 먹을 수 있어요.","vietnamese":"Dù no đến mấy thì vẫn ăn được bánh kem."},
    {"korean":"아무리 힘들어도 포기하지 않겠습니다.","vietnamese":"Dù khó khăn đến đâu tôi cũng sẽ không bỏ cuộc."},
    {"korean":"아무리 빨리 달려도 버스를 따라잡을 수 없었다.","vietnamese":"Dù chạy nhanh thế nào cũng không đuổi kịp xe buýt."},
    {"korean":"아무리 설명해도 그는 이해하지 못했다.","vietnamese":"Dù giải thích thế nào anh ấy cũng không hiểu."}
  ]'::jsonb,
  ARRAY['비록 – 더라도/(으)ㄹ지라도','A/V – 아/어도']::TEXT[],
  ARRAY['concession','emphasis','no_matter','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'아무리 힘들어___ 포기하지 않겠습니다.','fill_blank','["도","지만","서","면"]'::jsonb,0,'아무리+아/어도: 아무리 힘들어도 → 최대 양보.'
FROM public.grammar_patterns WHERE pattern='아무리 – 아/어도' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'___ 빨리 달려도 버스를 따라잡을 수 없었다.','fill_blank','["아무리","비록","혹시","만약"]'::jsonb,0,'절대적 양보 강조: 아무리 → 아무리 빨리 달려도.'
FROM public.grammar_patterns WHERE pattern='아무리 – 아/어도' AND topik_level='TOPIK VI';

-- #310: 어찌나/얼마나 – (으)ㄴ/는지
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '어찌나/얼마나 – (으)ㄴ/는지', 'eojina/eolmana – (eu)n/neunji',
  'Sao mà, biết bao nhiêu... (nhấn mạnh mức độ dẫn đến kết quả)', 'advanced', 'degree',
  '어찌나/얼마나 là trạng từ cảm thán diễn tả mức độ quá cao dẫn đến kết quả ở vế sau. Khác với topik2-86 (얼마나...는지 모르다 = không biết bao nhiêu), dạng này mang nghĩa "quá... nên...".',
  '어찌나/얼마나 + A + (으)ㄴ지 / 어찌나/얼마나 + V + 는지',
  '[
    {"korean":"갓난쟁이가 힘이 어찌나 좋은지 울음소리가 쩌렁쩌렁해요.","vietnamese":"Đứa trẻ mới sinh này sao mà sức khỏe thế tiếng khóc cứ oang oang."},
    {"korean":"이야기만 들어도 도니가 얼마나 괴롭고 힘들지 가히 짐작할 수 있었다.","vietnamese":"Chỉ nghe nói thôi cũng có thể đoán được Toni phải chịu gian khổ và vất vả biết bao nhiêu."},
    {"korean":"날씨가 어찌나 더운지 밖에 나갈 수가 없어요.","vietnamese":"Thời tiết sao mà nóng thế không thể ra ngoài được."},
    {"korean":"그 영화가 얼마나 재미있는지 세 번이나 봤어요.","vietnamese":"Bộ phim đó hay biết bao nhiêu tôi đã xem đến ba lần."},
    {"korean":"어찌나 무서운지 잠을 잘 수가 없었다.","vietnamese":"Sao mà sợ thế không tài nào ngủ được."}
  ]'::jsonb,
  ARRAY['A/V – 얼마나 (으)ㄴ/는지 모르다']::TEXT[],
  ARRAY['degree','exclamation','result','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'날씨가 어찌나 더운___ 밖에 나갈 수가 없어요.','fill_blank','["지","지만","더니","는데"]'::jsonb,0,'어찌나+(으)ㄴ/는지: 더운지 → 정도가 너무 심해 결과 발생.'
FROM public.grammar_patterns WHERE pattern='어찌나/얼마나 – (으)ㄴ/는지' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'___ 무서운지 잠을 잘 수가 없었다.','fill_blank','["어찌나","얼마","아무리","과연"]'::jsonb,0,'감탄 정도 강조: 어찌나 → 어찌나 무서운지.'
FROM public.grammar_patterns WHERE pattern='어찌나/얼마나 – (으)ㄴ/는지' AND topik_level='TOPIK VI';

-- #311: 왜냐하면 – 기 때문이다
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '왜냐하면 – 기 때문이다', 'waenyahamyeon – gi ttaemunida',
  'Bởi vì, tại vì... (giải thích lý do sau câu trước)', 'advanced', 'reason',
  '왜냐하면 là trạng từ mở đầu câu giải thích lý do, luôn kết thúc bằng 기 때문이다/기 때문에. Thường đứng đầu câu thứ hai để giải thích cho câu đứng trước. Mang tính trang trọng và giải thích rõ ràng.',
  '왜냐하면 + A/V + 기 때문이다 / 왜냐하면 + A/V + 기 때문에',
  '[
    {"korean":"나는 어제 학교에 지각을 했다. 왜냐하면 아침에 늦게 일어났기 때문이다.","vietnamese":"Hôm qua mình tới trường muộn. Bởi vì sao là vì buổi sáng dậy muộn."},
    {"korean":"오늘 외출을 못 하겠어요. 왜냐하면 몸이 많이 안 좋기 때문이에요.","vietnamese":"Hôm nay tôi không ra ngoài được. Tại vì sức khỏe không được tốt."},
    {"korean":"저는 커피를 안 마셔요. 왜냐하면 카페인에 약하기 때문이에요.","vietnamese":"Tôi không uống cà phê. Bởi vì tôi nhạy cảm với caffeine."},
    {"korean":"이 책을 추천해요. 왜냐하면 내용이 정말 유익하기 때문이에요.","vietnamese":"Tôi giới thiệu cuốn sách này. Bởi vì nội dung thực sự bổ ích."},
    {"korean":"그 식당에 다시 가고 싶지 않아요. 왜냐하면 음식이 너무 짜기 때문이에요.","vietnamese":"Tôi không muốn đến nhà hàng đó nữa. Vì món ăn quá mặn."}
  ]'::jsonb,
  ARRAY['A/V – 기 때문에','A/V – (으)니까']::TEXT[],
  ARRAY['reason','explanation','discourse','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'나는 지각을 했다. ___ 늦게 일어났기 때문이다.','fill_blank','["왜냐하면","그래서","그런데","하지만"]'::jsonb,0,'이유 설명 접속: 왜냐하면 → 앞 문장 이유 설명.'
FROM public.grammar_patterns WHERE pattern='왜냐하면 – 기 때문이다' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'왜냐하면 커피를 안 마셔요. 왜냐하면 카페인에 약하___ 때문이에요.','fill_blank','["기","은","는","을"]'::jsonb,0,'왜냐하면 + 기 때문이다: 약하기 때문이에요 → A/V+기+때문.'
FROM public.grammar_patterns WHERE pattern='왜냐하면 – 기 때문이다' AND topik_level='TOPIK VI';

-- #312: 단지/다만 – (으)ㄹ 뿐이다/(으)ㄹ 따름이다
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '단지/다만 – (으)ㄹ 뿐이다/(으)ㄹ 따름이다', 'danji/daman – (eu)l bbunida/(eu)l ttareumiida',
  'Duy chỉ, chỉ riêng... mà thôi (giới hạn tuyệt đối)', 'advanced', 'limitation',
  '단지/다만 là trạng từ giới hạn nhấn mạnh rằng chỉ có và không có gì hơn. Đi với 뿐이다 (thông dụng) hoặc 따름이다 (văn viết trang trọng hơn).',
  '단지/다만 + A/V + (으)ㄹ 뿐이다 / 단지/다만 + A/V + (으)ㄹ 따름이다',
  '[
    {"korean":"아무도 자신의 의견을 제시하려고 하지 않았다. 단지 침묵만이 있을 뿐이었다.","vietnamese":"Không ai có ý định đưa ra ý kiến cá nhân cả. Chỉ có sự im lặng."},
    {"korean":"저는 단지 도와주고 싶었을 뿐이에요.","vietnamese":"Tôi chỉ muốn giúp đỡ thôi."},
    {"korean":"다만 건강하게 지낼 따름입니다.","vietnamese":"Chỉ mong sống khỏe mạnh mà thôi."},
    {"korean":"그는 다만 진실을 말했을 뿐이다.","vietnamese":"Anh ấy chỉ nói thật thôi."},
    {"korean":"저는 단지 제 할 일을 했을 뿐입니다.","vietnamese":"Tôi chỉ làm công việc của mình mà thôi."}
  ]'::jsonb,
  ARRAY['V – (으)ㄹ 뿐만 아니라','A/V – (으)ㄹ 따름이다']::TEXT[],
  ARRAY['limitation','only','restriction','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'단지 침묵만이 있을___ 이었다.','fill_blank','["뿐","따름","만큼","정도"]'::jsonb,0,'단지+뿐이다: 단지...뿐이다 → 오직 그것만.'
FROM public.grammar_patterns WHERE pattern='단지/다만 – (으)ㄹ 뿐이다/(으)ㄹ 따름이다' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'다만 건강하게 지낼___ 입니다.','fill_blank','["따름","뿐","만큼","정도"]'::jsonb,0,'다만+따름이다: 다만...따름이다 → 문어체 제한 표현.'
FROM public.grammar_patterns WHERE pattern='단지/다만 – (으)ㄹ 뿐이다/(으)ㄹ 따름이다' AND topik_level='TOPIK VI';

-- #313: 점점 – 아/어지다/게 되다
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '점점 – 아/어지다/게 되다', 'jeomjeom – a/eojida/ge doeda',
  'Dần dần, ngày càng... (thay đổi theo thời gian)', 'advanced', 'change',
  '점점 là trạng từ diễn tả sự thay đổi dần dần theo thời gian, thường đi với 아/어지다 (thay đổi trạng thái tính từ) hoặc 게 되다 (thay đổi tình huống động từ).',
  '점점 + A + 아/어지다 / 점점 + V + 게 되다',
  '[
    {"korean":"이번 프로젝트의 진행이 점점 느려지는 것 같군요.","vietnamese":"Tiến độ thực hiện dự án này hình như đang dần chậm lại."},
    {"korean":"날씨가 점점 추워지고 있어요.","vietnamese":"Thời tiết đang ngày càng lạnh hơn."},
    {"korean":"한국어 공부를 할수록 점점 재미있어져요.","vietnamese":"Càng học tiếng Hàn lại càng thấy thú vị hơn."},
    {"korean":"시간이 지날수록 그 사람이 점점 그리워지네요.","vietnamese":"Thời gian càng trôi qua lại càng nhớ người đó hơn."},
    {"korean":"환경 문제가 점점 심각해지고 있다.","vietnamese":"Vấn đề môi trường đang ngày càng nghiêm trọng hơn."}
  ]'::jsonb,
  ARRAY['A/V – 아/어지다','A/V – 게 되다']::TEXT[],
  ARRAY['change','gradual','progression','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'날씨가 점점 추워___ 있어요.','fill_blank','["지고","지고서","지다","져서"]'::jsonb,0,'점점+아/어지다: 추워지다 → 추워지고 있어요 (진행).'
FROM public.grammar_patterns WHERE pattern='점점 – 아/어지다/게 되다' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'환경 문제가 점점 심각해___ 있다.','fill_blank','["지고","지다","져서","지는"]'::jsonb,0,'점점+아/어지다: 심각해지고 있다 → 상태 변화 진행.'
FROM public.grammar_patterns WHERE pattern='점점 – 아/어지다/게 되다' AND topik_level='TOPIK VI';
