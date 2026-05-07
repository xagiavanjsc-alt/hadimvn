-- Migration 081: Grammar Patterns #314-321 (TOPIK 6)

-- #314: 꼭/반드시 – 아/어야 하다/지 않으면 안 되다
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '꼭/반드시 – 아/어야 하다', 'kkok/bandeusi – a/eoya hada',
  'Nhất định phải, chắc chắn phải... (bắt buộc tuyệt đối)', 'advanced', 'obligation',
  '꼭/반드시 là trạng từ nhấn mạnh tính bắt buộc tuyệt đối. 반드시 mang sắc thái trang trọng hơn 꼭. Kết hợp với 아/어야 하다 hoặc 지 않으면 안 되다.',
  '꼭/반드시 + V + 아/어야 하다 / 꼭/반드시 + V + 지 않으면 안 되다',
  '[
    {"korean":"아버지가 뭐라고 하셔도 저는 이 결혼 꼭 해야 하겠습니다.","vietnamese":"Dù cha tôi có nói gì đi nữa, nhất định tôi sẽ phải kết hôn với người đó."},
    {"korean":"이 약은 식후에 반드시 복용해야 합니다.","vietnamese":"Thuốc này nhất định phải uống sau bữa ăn."},
    {"korean":"비밀번호는 반드시 기억해야 합니다.","vietnamese":"Mật khẩu nhất định phải nhớ."},
    {"korean":"운전할 때는 꼭 안전벨트를 매야 해요.","vietnamese":"Khi lái xe nhất định phải thắt dây an toàn."},
    {"korean":"이 서류는 내일까지 반드시 제출해야 합니다.","vietnamese":"Tài liệu này nhất định phải nộp trước ngày mai."}
  ]'::jsonb,
  ARRAY['꼭/반드시 – (으)ㄹ 필요는 없다','A/V – 아/어야 하다']::TEXT[],
  ARRAY['obligation','necessity','must','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'이 약은 식후에 반드시 복용해___ 합니다.','fill_blank','["야","서","도","고"]'::jsonb,0,'반드시+아/어야 하다: 복용해야 합니다 → 절대적 의무.'
FROM public.grammar_patterns WHERE pattern='꼭/반드시 – 아/어야 하다' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'운전할 때는 ___ 안전벨트를 매야 해요.','fill_blank','["꼭","혹시","아마","과연"]'::jsonb,0,'의무 강조 부사: 꼭 → 꼭 안전벨트를 매야.'
FROM public.grammar_patterns WHERE pattern='꼭/반드시 – 아/어야 하다' AND topik_level='TOPIK VI';

-- #315: 꼭/반드시 – (으)ㄹ 필요는 없다
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '꼭/반드시 – (으)ㄹ 필요는 없다', 'kkok/bandeusi – (eu)l piryoneun eopda',
  'Không nhất thiết phải..., không cần thiết... (phủ định bắt buộc)', 'advanced', 'obligation',
  'Phủ định của 꼭/반드시 + 아/어야 하다. Biểu thị rằng việc đó không bắt buộc, không cần thiết. 꼭 nhấn mạnh rằng không phải lúc nào cũng cần làm.',
  '꼭/반드시 + V + (으)ㄹ 필요는 없다',
  '[
    {"korean":"네가 꼭 희생할 필요는 없어.","vietnamese":"Cậu không cần thiết phải hi sinh."},
    {"korean":"반드시 비싼 선물을 살 필요는 없어요.","vietnamese":"Không nhất thiết phải mua quà đắt tiền."},
    {"korean":"꼭 혼자 해야 할 필요는 없어요.","vietnamese":"Không cần thiết phải tự làm một mình."},
    {"korean":"반드시 완벽할 필요는 없습니다.","vietnamese":"Không nhất thiết phải hoàn hảo."},
    {"korean":"꼭 지금 결정할 필요는 없어.","vietnamese":"Không cần thiết phải quyết định ngay bây giờ."}
  ]'::jsonb,
  ARRAY['꼭/반드시 – 아/어야 하다','V – (으)ㄹ 필요가 없다']::TEXT[],
  ARRAY['obligation','unnecessary','negation','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'네가 꼭 희생할___ 는 없어.','fill_blank','["필요","이유","까닭","방법"]'::jsonb,0,'꼭+필요는 없다: 꼭 희생할 필요는 없다 → 불필요.'
FROM public.grammar_patterns WHERE pattern='꼭/반드시 – (으)ㄹ 필요는 없다' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'반드시 완벽할 필요는___.','fill_blank','["없습니다","있습니다","됩니다","합니다"]'::jsonb,0,'필요는 없다: 완벽할 필요는 없습니다 → 의무 아님.'
FROM public.grammar_patterns WHERE pattern='꼭/반드시 – (으)ㄹ 필요는 없다' AND topik_level='TOPIK VI';

-- #316: 마치 – (으)ㄴ/는 것 같다/(으)ㄴ/는 듯하다
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '마치 – (으)ㄴ/는 것 같다/(으)ㄴ/는 듯하다', 'machi – (eu)n/neun geot gatda/(eu)n/neun deuthada',
  'Như, hệt như, cứ như là... (so sánh ẩn dụ nhấn mạnh)', 'advanced', 'comparison',
  '마치 là trạng từ nhấn mạnh sự so sánh ẩn dụ không thực, đi với 것 같다 hoặc 듯하다/(으)ㄴ 듯이. Diễn tả điều gì đó trông/cảm giác rất giống như thứ khác nhưng thực ra không phải.',
  '마치 + A/V + (으)ㄴ/는 것 같다 / 마치 + A/V + (으)ㄴ/는 듯하다',
  '[
    {"korean":"아름다운 그녀는 마치 천사와 같다.","vietnamese":"Cô ấy đẹp hệt như một thiên thần."},
    {"korean":"마치 꿈을 꾸는 것 같았어요.","vietnamese":"Cứ như là đang trong mơ vậy."},
    {"korean":"그의 목소리는 마치 음악 같아요.","vietnamese":"Giọng nói của anh ấy hệt như âm nhạc vậy."},
    {"korean":"마치 어제 일처럼 생생하게 기억나요.","vietnamese":"Ký ức rõ mồn một như thể chuyện hôm qua vậy."},
    {"korean":"그 아이는 마치 어른처럼 말을 해요.","vietnamese":"Đứa bé đó nói chuyện hệt như người lớn vậy."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는 것 같다','A/V – 는 듯이']::TEXT[],
  ARRAY['comparison','metaphor','simile','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'마치 꿈을 꾸는 것___ 아요.','fill_blank','["같았","있었","되었","했"]'::jsonb,0,'마치+것 같다: 마치 꿈을 꾸는 것 같았어요 → 은유 비교.'
FROM public.grammar_patterns WHERE pattern='마치 – (으)ㄴ/는 것 같다/(으)ㄴ/는 듯하다' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'그녀는 ___ 천사와 같다.','fill_blank','["마치","비록","혹시","결국"]'::jsonb,0,'은유 강조 부사: 마치 → 마치 천사와 같다.'
FROM public.grammar_patterns WHERE pattern='마치 – (으)ㄴ/는 것 같다/(으)ㄴ/는 듯하다' AND topik_level='TOPIK VI';

-- #317: 결국 – 고 말다
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '결국 – 고 말다', 'gyeolguk – go malda',
  'Kết cục, cuối cùng rồi cũng... (kết quả tiêu cực không tránh khỏi)', 'advanced', 'result',
  '결국 là trạng từ nhấn mạnh kết quả cuối cùng sau một quá trình dài, thường mang sắc thái tiêu cực hoặc đáng tiếc. Đi với 고 말다 để nhấn mạnh kết quả không thể tránh khỏi.',
  '결국 + V + 고 말았다 / 결국 + V + 고 말았어요',
  '[
    {"korean":"김 씨는 사업이 망한 후 노숙자 생활을 하다 결국 길에서 객사하고 말았다.","vietnamese":"Ông Kim sau khi công việc kinh doanh sụp đổ đã lang thang vô gia cư cuối cùng chết trên đường phố."},
    {"korean":"오래 참았지만 결국 화가 나고 말았어요.","vietnamese":"Nhịn lâu rồi nhưng cuối cùng cũng nổi giận mất."},
    {"korean":"열심히 노력했지만 결국 실패하고 말았다.","vietnamese":"Cố gắng hết sức nhưng cuối cùng cũng thất bại mất."},
    {"korean":"비밀을 지키려 했지만 결국 말하고 말았어요.","vietnamese":"Cố giữ bí mật nhưng cuối cùng cũng nói ra mất."},
    {"korean":"몸이 안 좋다고 했는데 결국 쓰러지고 말았다.","vietnamese":"Đã nói là không khỏe mà cuối cùng cũng ngã bệnh mất."}
  ]'::jsonb,
  ARRAY['V – 고 말다','V – 아/어 버리다']::TEXT[],
  ARRAY['result','inevitable','negative_outcome','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'오래 참았지만 결국 화가 나고___.','fill_blank','["말았어요","버렸어요","났어요","했어요"]'::jsonb,0,'결국+고 말다: 결국 화가 나고 말았어요 → 피할 수 없는 부정적 결과.'
FROM public.grammar_patterns WHERE pattern='결국 – 고 말다' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'열심히 노력했지만 ___ 실패하고 말았다.','fill_blank','["결국","단지","마치","이미"]'::jsonb,0,'결과 강조 부사: 결국 → 결국 실패하고 말았다.'
FROM public.grammar_patterns WHERE pattern='결국 – 고 말다' AND topik_level='TOPIK VI';

-- #318: 과연 – (으)ㄹ까?/(으)ㄴ가?/는가?
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '과연 – (으)ㄹ까?/(으)ㄴ가?/는가?', 'gwayeon – (eu)lkka?/(eu)nga?/neunga?',
  'Quả nhiên, liệu có..., không biết có... (câu hỏi nghi ngờ/tu từ)', 'advanced', 'rhetorical',
  '과연 là trạng từ biểu thị sự nghi ngờ hoặc tự hỏi về khả năng xảy ra của điều gì. Đi với câu nghi vấn (으)ㄹ까? hoặc (으)ㄴ가?/는가? (văn viết trang trọng).',
  '과연 + A/V + (으)ㄹ까? / 과연 + A/V + (으)ㄴ가?/는가?',
  '[
    {"korean":"과연 회사에서 나 같은 사람을 뽑아 줄까?","vietnamese":"Quả nhiên(có đúng là) công ty sẽ chọn người như tôi?"},
    {"korean":"과연 그 계획이 성공할 수 있을까?","vietnamese":"Liệu kế hoạch đó có thể thành công không?"},
    {"korean":"과연 그가 약속을 지킬까 모르겠다.","vietnamese":"Không biết anh ấy liệu có giữ lời hứa không."},
    {"korean":"이번에 과연 합격할 수 있을까?","vietnamese":"Lần này liệu có thể đậu không?"},
    {"korean":"과연 이것이 최선의 방법인가?","vietnamese":"Liệu đây có phải là phương pháp tốt nhất không?"}
  ]'::jsonb,
  ARRAY['아마/아마도 – (으)ㄹ 것이다/(으)ㄹ 것 같다']::TEXT[],
  ARRAY['rhetorical','doubt','wonder','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'과연 회사에서 나 같은 사람을 뽑아 줄___?','fill_blank','["까","나","가","는가"]'::jsonb,0,'과연+(으)ㄹ까: 과연...줄까 → 가능성 의심 의문.'
FROM public.grammar_patterns WHERE pattern='과연 – (으)ㄹ까?/(으)ㄴ가?/는가?' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'___ 이것이 최선의 방법인가?','fill_blank','["과연","아마","결국","점점"]'::jsonb,0,'의심/의문 부사: 과연 → 과연 이것이 최선인가?'
FROM public.grammar_patterns WHERE pattern='과연 – (으)ㄹ까?/(으)ㄴ가?/는가?' AND topik_level='TOPIK VI';

-- #319: 아마/아마도 – (으)ㄹ 것이다/(으)ㄹ 것 같다
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '아마/아마도 – (으)ㄹ 것이다/(으)ㄹ 것 같다', 'ama/amado – (eu)l geosida/(eu)l geot gatda',
  'Có lẽ, chắc là... (phỏng đoán không chắc chắn)', 'advanced', 'speculation',
  '아마/아마도 là trạng từ phỏng đoán không chắc chắn, đi với (으)ㄹ 것이다 hoặc (으)ㄹ 것 같다. 아마도 nhấn mạnh hơn 아마.',
  '아마/아마도 + A/V + (으)ㄹ 것이다 / 아마/아마도 + A/V + (으)ㄹ 것 같다',
  '[
    {"korean":"아마 네가 개정되기 전의 책을 읽은 것 같다.","vietnamese":"Có lẽ bạn đọc cuốn sách đó trước khi nó được tái bản."},
    {"korean":"아마도 내일 비가 올 것 같아요.","vietnamese":"Có lẽ ngày mai trời sẽ mưa."},
    {"korean":"아마 그 사람은 이미 알고 있을 거예요.","vietnamese":"Chắc là người đó đã biết rồi."},
    {"korean":"아마도 그게 최선이었을 거야.","vietnamese":"Có lẽ đó là điều tốt nhất có thể làm lúc đó."},
    {"korean":"아마 그는 지금쯤 집에 도착했을 것이다.","vietnamese":"Chắc là giờ này anh ấy đã đến nhà rồi."}
  ]'::jsonb,
  ARRAY['과연 – (으)ㄹ까?','A/V – (으)ㄹ 것 같다']::TEXT[],
  ARRAY['speculation','probability','guess','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'아마도 내일 비가 올 것___.','fill_blank','["같아요","이에요","있어요","맞아요"]'::jsonb,0,'아마도+(으)ㄹ 것 같다: 아마도 올 것 같아요 → 추측.'
FROM public.grammar_patterns WHERE pattern='아마/아마도 – (으)ㄹ 것이다/(으)ㄹ 것 같다' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'___ 그 사람은 이미 알고 있을 거예요.','fill_blank','["아마","결국","과연","벌써"]'::jsonb,0,'추측 부사: 아마 → 아마 알고 있을 거예요.'
FROM public.grammar_patterns WHERE pattern='아마/아마도 – (으)ㄹ 것이다/(으)ㄹ 것 같다' AND topik_level='TOPIK VI';

-- #320: 이미/벌써 – 았/었다
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '이미/벌써 – 았/었다', 'imi/beolsseo – at/eotda',
  'Đã... rồi, mới đó đã... (hoàn thành trước kỳ vọng)', 'advanced', 'aspect',
  '이미 nhấn mạnh trạng thái đã hoàn thành và không thể thay đổi (thường kết hợp với câu mệnh đề phủ định hoặc kết quả). 벌써 nhấn mạnh sự nhanh chóng hoặc sớm hơn kỳ vọng.',
  '이미/벌써 + A/V + 았/었다',
  '[
    {"korean":"벌써 가판을 마치고 인쇄 작업에 들어갔습니다.","vietnamese":"Mới đó đã xong bản in và đã đưa vào bắt đầu in ấn."},
    {"korean":"사람들은 회사의 정식 명칭 대신 가칭돼서 불리던 이름에 이미 익숙해졌다.","vietnamese":"Mọi người đã gần như quen gọi công ty với cái tên tạm thời thay vì tên chính thức của công ty."},
    {"korean":"벌써 봄이 왔네요.","vietnamese":"Mới đó đã vào xuân rồi nhỉ."},
    {"korean":"이미 결정이 났으니 더 이상 논의할 필요가 없어요.","vietnamese":"Đã quyết định rồi nên không cần bàn thêm nữa."},
    {"korean":"그 영화는 벌써 끝났어요.","vietnamese":"Bộ phim đó đã chiếu xong rồi."}
  ]'::jsonb,
  ARRAY['아직 – 지 않다/못하다']::TEXT[],
  ARRAY['aspect','completion','already','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'___ 봄이 왔네요.','fill_blank','["벌써","이미","아직","결국"]'::jsonb,0,'예상보다 빠름: 벌써 → 벌써 봄이 왔네요 (놀라움).'
FROM public.grammar_patterns WHERE pattern='이미/벌써 – 았/었다' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'이미 결정이 났으니 더 이상 논의할 필요가___.','fill_blank','["없어요","있어요","됩니다","합니다"]'::jsonb,0,'이미+완료: 이미...났으니 → 돌이킬 수 없는 완료 상태.'
FROM public.grammar_patterns WHERE pattern='이미/벌써 – 았/었다' AND topik_level='TOPIK VI';

-- #321: 하마터면 – (으)ㄹ 뻔하다
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  '하마터면 – (으)ㄹ 뻔하다', 'hamateomyeon – (eu)l bbeonhada',
  'Suýt, gần như suýt... (thoát khỏi tình huống nguy hiểm)', 'advanced', 'near_miss',
  '하마터면 là trạng từ nhấn mạnh việc suýt xảy ra điều không mong muốn. Luôn đi kèm với (으)ㄹ 뻔하다 hoặc (으)ㄹ 뻔했다 ở thì quá khứ. Liên quan đến 기에 망정이지 (may mà).',
  '하마터면 + V + (으)ㄹ 뻔하다 / 하마터면 + V + (으)ㄹ 뻔했다',
  '[
    {"korean":"내가 집에 일찍 왔기에 망정이지 하마터면 집에 불이 날 뻔했다.","vietnamese":"May mà tôi về nhà sớm chứ không thì suýt nữa cháy nhà."},
    {"korean":"하마터면 지갑을 잃어버릴 뻔했어요.","vietnamese":"Suýt nữa là mất ví rồi."},
    {"korean":"하마터면 넘어질 뻔했어요.","vietnamese":"Suýt nữa là ngã rồi."},
    {"korean":"하마터면 기차를 놓칠 뻔했어요.","vietnamese":"Suýt nữa là lỡ tàu rồi."},
    {"korean":"하마터면 큰 사고가 날 뻔했다.","vietnamese":"Suýt nữa là xảy ra tai nạn lớn rồi."}
  ]'::jsonb,
  ARRAY['V – (으)ㄹ 뻔하다','A/V – 기에 망정이지']::TEXT[],
  ARRAY['near_miss','danger','almost','topik6','advanced']::TEXT[],
  'TOPIK VI'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'하마터면 지갑을 잃어버릴___ 아요.','fill_blank','["뻔했","했","버렸","말았"]'::jsonb,0,'하마터면+(으)ㄹ 뻔하다: 잃어버릴 뻔했어요 → 아슬아슬하게 모면.'
FROM public.grammar_patterns WHERE pattern='하마터면 – (으)ㄹ 뻔하다' AND topik_level='TOPIK VI';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'___ 큰 사고가 날 뻔했다.','fill_blank','["하마터면","결국","벌써","마치"]'::jsonb,0,'아슬아슬 회피 부사: 하마터면 → 하마터면 사고가 날 뻔했다.'
FROM public.grammar_patterns WHERE pattern='하마터면 – (으)ㄹ 뻔하다' AND topik_level='TOPIK VI';
