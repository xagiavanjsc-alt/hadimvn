-- Migration 073: Grammar Patterns #245-255

-- ═══════════════════════════════════════════════════════════════════════════════
-- #245: A/V – 듯이  (TOPIK III)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – 듯이', 'deutii', 'Như, như thế (tương tự/so sánh)', 'intermediate', 'comparison',
  'Thể hiện vế sau gần như tương tự với vế trước. Có thể được dùng dưới dạng rút gọn 듯. Biểu hiện tương tự: 는 것처럼, 는 것과 마찬가지로.',
  'V + 듯이 / A + 듯이',
  '[
    {"korean":"사람마다 외모가 다르듯이 가치관과 성격도 다르다.","vietnamese":"Mỗi người có tính cách và giá trị quan khác nhau như khác ngoại hình vậy."},
    {"korean":"유나 씨가 거짓말 밥먹듯이 해서 이젠 어떤 말도 믿지 못해요.","vietnamese":"Yuna nói dối như cơm bữa nên bây giờ tôi không thể tin được lời nào nữa."},
    {"korean":"내가 이미 말했듯이 이 시간에는 길이 많이 막힌다고 했잖아.","vietnamese":"Vào giờ này đường rất tắc như tôi đã nói rồi đó còn gì."},
    {"korean":"밤이 깊어지면 다시 아침이 오듯이 어려운 일도 시간이 흐르면 지나간다.","vietnamese":"Việc khó khăn cũng sẽ dần trôi theo thời gian như màn đêm buông xuống rồi buổi sáng lại đến."},
    {"korean":"정성을 다해 키운 화초가 잘 자라듯이 노력한다면 그 결실을 얻을 수 있다.","vietnamese":"Nếu nỗ lực thì có thể gặt hái được thành quả như thể hoa cỏ được nuôi nấng tận tâm cũng sẽ phát triển tốt."}
  ]'::jsonb,
  ARRAY['A/V – 는 것처럼','A/V – 는 듯이']::TEXT[],
  ARRAY['comparison','similarity','topik3','intermediate']::TEXT[],
  'TOPIK III'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'사람마다 외모가 다르___ 성격도 다르다.','fill_blank','["듯이","처럼","만큼","게"]'::jsonb,0,'유사 비교: 다르듯이 → 앞 내용과 유사 묘사'
FROM public.grammar_patterns WHERE pattern='A/V – 듯이' AND topik_level='TOPIK III';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'내가 이미 말했___ 이 시간에는 길이 많이 막혀요.','fill_blank','["듯이","처럼","만큼","대로"]'::jsonb,0,'근거 비유: 말했듯이 → 앞 사실 근거로 뒤 내용 연결'
FROM public.grammar_patterns WHERE pattern='A/V – 듯이' AND topik_level='TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #246: V – 다시피 하다  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – 다시피 하다', 'dasipihada', 'Gần như... (phóng đại mức độ tình huống)', 'advanced', 'degree',
  'Mặc dù thực tế không hoàn toàn giống như ý nghĩa mà động từ đứng trước biểu hiện nhưng cũng gần giống như vậy. Nhấn mạnh mức độ của tình huống thực tế bằng cách phóng đại.',
  'V + 다시피 하다',
  '[
    {"korean":"흐엉 씨는 유학 생활이 너무 힘들어서 처음에는 밤에 잠도 못 자다시피 했어요.","vietnamese":"Cuộc sống du học của Hương quá khó khăn nên ban đầu gần như không ngủ được."},
    {"korean":"이번 주는 시험 기간이었어요. 그래서 날마다 도서관에서 살다시피 했어요.","vietnamese":"Tuần này là tuần thi. Vì vậy mỗi ngày gần như tôi sống ở thư viện."},
    {"korean":"시험 공부하느라 밤을 새우다시피 했어요.","vietnamese":"Vì ôn thi mà gần như phải thức thâu đêm."},
    {"korean":"매일 친구 집에 가서 같이 살다시피 한다.","vietnamese":"Bạn đến nhà hàng ngày nên chẳng khác nào như đang sống cùng nhau."},
    {"korean":"다이어트를 하느라고 물만 마시다시피 하면서 살을 뺐다.","vietnamese":"Vì ăn kiêng nên gần như chỉ uống nước và giảm cân."}
  ]'::jsonb,
  ARRAY['V – 다시피','A/V – 듯이']::TEXT[],
  ARRAY['degree','exaggeration','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'이번 주는 날마다 도서관에서 살___ 했어요.','fill_blank','["다시피","는 듯이","다 보니","기가 무섭게"]'::jsonb,0,'과장 강조: 살다시피 → 실제와 거의 같은 수준'
FROM public.grammar_patterns WHERE pattern='V – 다시피 하다' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'밤에 잠도 못 자___ 해서 정말 힘들었어요.','fill_blank','["다시피","는 듯이","고도","기가 무섭게"]'::jsonb,0,'극한 묘사: 못 자다시피 → 거의 못 잠'
FROM public.grammar_patterns WHERE pattern='V – 다시피 하다' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #247: V – 다시피  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – 다시피', 'dasipi', 'Theo như... (căn cứ nhận định vế sau)', 'advanced', 'reference',
  'Thường dùng với các động từ biểu thị cảm giác/nhận thức (듣다, 보다, 말하다, 느끼다, 짐작하다, 예상하다, 깨닫다,...) như một căn cứ để nhận định nội dung vế sau.',
  'V + 다시피',
  '[
    {"korean":"보시다시피 공공장소에서 담배를 피워서는 안 된다.","vietnamese":"Như bạn thấy, không được hút thuốc ở nơi công cộng."},
    {"korean":"여러분도 아까 들었다시피 다음주 발표 주제는 한국의 예절입니다.","vietnamese":"Như các bạn đã nghe lúc nãy, chủ đề phát biểu tuần sau là lễ nghĩa Hàn Quốc."},
    {"korean":"우리 모두 느끼다시피 지금 날씨에는 어디에도 갈 수 없다.","vietnamese":"Như tất cả chúng ta đã nhận thấy không thể đi đâu ở thời tiết như hiện giờ."},
    {"korean":"민수 씨도 짐작하시다시피 상황이 별로 좋지 않습니다.","vietnamese":"Cũng như Min-su đã phỏng đoán tình hình không mấy tốt đẹp cả."},
    {"korean":"보시다시피 여기 아무도 없습니다.","vietnamese":"Như đã thấy không có ai ở đây cả."}
  ]'::jsonb,
  ARRAY['V – 다시피 하다','A/V – 듯이']::TEXT[],
  ARRAY['reference','perception-verb','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'여러분도 아까 들었___ 다음주 발표 주제는 한국의 예절입니다.','fill_blank','["다시피","듯이","는 바와 같이","는 것처럼"]'::jsonb,0,'지각동사+근거: 들었다시피 → 앞 내용 공유 근거'
FROM public.grammar_patterns WHERE pattern='V – 다시피' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'보시___ 공공장소에서 담배를 피워서는 안 된다.','fill_blank','["다시피","듯이","는 대로","는 것처럼"]'::jsonb,0,'시각동사 근거: 보시다시피 → 시각적 사실 근거'
FROM public.grammar_patterns WHERE pattern='V – 다시피' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #248: A/V – 거니와  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – 거니와', 'geoniwa', '...thêm vào đó (cộng thêm thông tin)', 'advanced', 'additive',
  'Công nhận nội dung phía trước và vừa công nhận sự thật cộng thêm ở phía sau. Nghĩa của 2 vế bình đẳng với nhau. Thường dùng trong văn viết và ít dùng trong tiếng Hàn hiện đại.',
  'V + 거니와 / A + 거니와',
  '[
    {"korean":"이 식당은 음식도 맛있거니와 서비스도 좋다.","vietnamese":"Nhà hàng này đồ ăn thì ngon thêm vào đó dịch vụ cũng tốt nữa."},
    {"korean":"오늘은 기분도 우울하거니와 날씨까지 흐려서 기분이 더 안 좋다.","vietnamese":"Hôm nay tâm trạng thì trầm uất thêm vào đó đến thời tiết cũng âm u nên tâm trạng càng tệ."},
    {"korean":"다시 한번 강조하거니와 늦지 않도록 하세요.","vietnamese":"Tôi nhấn mạnh lại lần nữa hãy đừng để muộn nữa."},
    {"korean":"야채는 건강에도 좋거니와 먹기도 간편하다.","vietnamese":"Rau củ tốt cho sức khỏe thêm vào đó cũng dễ ăn nữa."},
    {"korean":"삼촌은 사업에도 실패했거니와 결혼 생활도 끝내 파탄이 났다.","vietnamese":"Chú đã thất bại trong việc kinh doanh thêm vào đó hôn nhân cũng tan vỡ."},
    {"korean":"아이가 공부를 좋아하기도 하거니와 잘해서 부모 모두 기대가 크다.","vietnamese":"Đứa bé thích việc học thêm vào đó học cũng giỏi nữa nên bố mẹ kì vọng rất lớn."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 뿐더러','A/V – (으)려니와']::TEXT[],
  ARRAY['additive','literary','written','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'이 식당은 음식도 맛있___ 서비스도 좋다.','fill_blank','["거니와","(으)ㄹ 뿐더러","는데다가","뿐만 아니라"]'::jsonb,0,'대등 추가 문어체: 맛있거니와 → 동등 정보 추가'
FROM public.grammar_patterns WHERE pattern='A/V – 거니와' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'야채는 건강에도 좋___ 먹기도 간편하다.','fill_blank','["거니와","(으)ㄹ 뿐더러","는데다가","고도"]'::jsonb,0,'두 사실 대등 나열: 좋거니와 → 문어체 추가'
FROM public.grammar_patterns WHERE pattern='A/V – 거니와' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #249: A/V – (으)려니와  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)려니와', 'euryeoniwa', '...thêm vào đó (phỏng đoán + bổ sung)', 'advanced', 'additive',
  'Phỏng đoán và công nhận nội dung phía trước sau thêm thông tin ở vế sau. Thường dùng trong văn viết và ít dùng trong tiếng Hàn hiện đại.',
  'V + (으)려니와 / A + (으)려니와',
  '[
    {"korean":"저녁이 되면서 하늘도 어두워지려니와 날씨도 쌀쌀해졌다.","vietnamese":"Vào buổi tối trời trở nên tối sầm thêm vào đó thời tiết cũng trở nên se se lạnh."},
    {"korean":"산책을 하기에는 햇볕이 너무 따가우려니와 습도도 너무 높다.","vietnamese":"Ánh nắng quá chói thêm vào đó độ ẩm quá cao để ra ngoài đi dạo."},
    {"korean":"인터넷으로 제품을 구입하면 가격도 싸려니와 다양한 물건을 쉽게 비교해 볼 수 있어서 좋다.","vietnamese":"Nếu mua sản phẩm qua internet giá đã rẻ thêm vào đó lại có thể so sánh các sản phẩm đa dạng một cách dễ dàng nên thật là tốt."},
    {"korean":"김 선생님은 얼굴도 예쁘시려니와 마음씨까지 고우셔서 학생들에게 인기가 많아요.","vietnamese":"Cô giáo Kim khuôn mặt đã xinh đẹp thêm vào đó lại có tấm lòng nhân hậu nên được học sinh rất yêu mến."},
    {"korean":"우리 집 강아지는 밥도 잘 먹으려니와 매일 운동을 하기 때문에 아주 건강해요.","vietnamese":"Con cún nhà tôi đã ăn khỏe thêm vào đó lại chạy nhảy mỗi ngày nên rất là khỏe mạnh."}
  ]'::jsonb,
  ARRAY['A/V – 거니와','A/V – (으)ㄹ 뿐더러']::TEXT[],
  ARRAY['additive','conjecture','literary','written','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'저녁이 되면서 하늘도 어두워지___ 날씨도 쌀쌀해졌다.','fill_blank','["려니와","거니와","(으)ㄹ 뿐더러","는데다가"]'::jsonb,0,'추정+추가 문어체: 어두워지려니와 → 예측 근거로 추가'
FROM public.grammar_patterns WHERE pattern='A/V – (으)려니와' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'인터넷으로 사면 가격도 싸___ 비교도 쉽다.','fill_blank','["려니와","거니와","(으)ㄹ 뿐더러","는데다가"]'::jsonb,0,'가격 추정+추가 정보: 싸려니와 → 문어체 추가'
FROM public.grammar_patterns WHERE pattern='A/V – (으)려니와' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #250: A/V – 기는 커녕  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – 기는 커녕', 'gineun keonyeong', '...huống chi, huống hồ... (phủ định tuyệt đối + nhấn mạnh ngược)', 'advanced', 'negation',
  'Phủ định tuyệt đối nội dung nêu ra ở vế trước và lại thêm vào một cấp độ nhấn mạnh hơn ở vế sau. Khi đứng sau danh từ thì dùng ở dạng 는 커녕. Thường đi kèm với 조차.',
  'V + 기는 커녕 / N + 는 커녕',
  '[
    {"korean":"바쁘게 사느라 해외여행을 가 보기는커녕 국내여행조차 가 보지 못해요.","vietnamese":"Vì bận nên đi du lịch trong nước còn chẳng đi được nói gì đi du lịch nước ngoài."},
    {"korean":"한국어를 배운 지 한 달이 넘었지만 한국어로 자기소개는커녕 한글도 못 읽어요.","vietnamese":"Học tiếng Hàn được một tháng rồi đến chữ Hangeul còn không đọc được huống hồ giới thiệu bản thân bằng tiếng Hàn."},
    {"korean":"하루 종일 밥은커녕 물 한 모금도 못 마셨다.","vietnamese":"Cả ngày nay đến một chút nước còn không thể uống được nói gì đến cơm."},
    {"korean":"인사하기는커녕 얼굴도 못 봤다.","vietnamese":"Đến mặt còn không thấy đâu huống hồ là chào hỏi."},
    {"korean":"칭찬을 받기는커녕 오히려 혼만 났다.","vietnamese":"Nói gì đến khen, trái lại tôi còn bị mắng."},
    {"korean":"살이 빠지기는커녕 오히려 더 쪘어요.","vietnamese":"Trái lại tôi còn tăng cân đây này chứ nói gì đến giảm."}
  ]'::jsonb,
  ARRAY['N – 은/는 말할 것도 없고','N – 는 고사하고']::TEXT[],
  ARRAY['negation','contrast','emphasis','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'해외여행을 가 보___ 국내여행조차 못 가요.','fill_blank','["기는커녕","기는 해도","기는커녕 조차","지만"]'::jsonb,0,'완전 부정+강조: 가 보기는커녕 → 더 낮은 차원도 불가'
FROM public.grammar_patterns WHERE pattern='A/V – 기는 커녕' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'칭찬을 받___ 오히려 혼만 났다.','fill_blank','["기는커녕","기는 해도","더라도","지만"]'::jsonb,0,'기대 반전+강조: 받기는커녕 → 오히려 반대 상황'
FROM public.grammar_patterns WHERE pattern='A/V – 기는 커녕' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #251: N 은/는 말할 것도 없고  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'N 은/는 말할 것도 없고', 'eun/neun malhal geotdo eopgo', '...huống chi, huống hồ... (danh từ)', 'advanced', 'negation',
  'Phủ định tuyệt đối danh từ nêu ra ở vế trước và lại thêm vào một cấp độ nhấn mạnh hơn ở danh từ sau. Dùng với danh từ.',
  'N + 은/는 말할 것도 없고',
  '[
    {"korean":"요새는 낮은 말할 것도 없고 밤에도 덥다.","vietnamese":"Dạo này ban đêm trời còn nóng chứ đừng nói đến ban ngày."},
    {"korean":"이 영화는 젊은이들은 말할 것도 없고 노년층에게까지 큰 인기를 끌었다.","vietnamese":"Bộ phim này rất được yêu thích không chỉ với giới trẻ mà cả những người lớn tuổi."},
    {"korean":"시험이 코앞으로 다가오자 수험생은 말할 것도 없고 수험생 자녀를 둔 부모들 역시 신경이 곤두서 있다.","vietnamese":"Khi kỳ thi đến gần, không chỉ học sinh mà cả phụ huynh các em tham dự kỳ thi cũng rất lo lắng."},
    {"korean":"인품은 말할 것도 없고 게다가 잘생기기까지 한 사람이야.","vietnamese":"Chưa kể đến tính cách thì anh ấy còn đẹp trai nữa."}
  ]'::jsonb,
  ARRAY['A/V – 기는 커녕','N – 는 고사하고']::TEXT[],
  ARRAY['negation','noun-pattern','emphasis','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'젊은이들___ 노년층에게까지 큰 인기를 끌었다.','fill_blank','["은 말할 것도 없고","는 고사하고","기는커녕","는 커녕"]'::jsonb,0,'명사 기준+확대: 젊은이들은 말할 것도 없고 → 더 넓은 범위'
FROM public.grammar_patterns WHERE pattern='N 은/는 말할 것도 없고' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'요새는 낮___ 밤에도 덥다.','fill_blank','["은 말할 것도 없고","는 고사하고","기는커녕","는 커녕"]'::jsonb,0,'당연한 것 넘어선 추가: 낮은 말할 것도 없고 → 밤까지 포함'
FROM public.grammar_patterns WHERE pattern='N 은/는 말할 것도 없고' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #252: N 는 고사하고  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'N 는 고사하고', 'neun gosahago', '...huống chi, huống hồ... (danh từ - mạnh hơn)', 'advanced', 'negation',
  'Phủ định tuyệt đối danh từ nêu ra ở vế trước và lại thêm vào một cấp độ nhấn mạnh hơn ở danh từ sau. Mức độ nhấn mạnh mạnh hơn 말할 것도 없고.',
  'N + 는 고사하고',
  '[
    {"korean":"비행기는 고사하고 기차도 못 타 봤어요.","vietnamese":"Tôi chưa bao giờ đi được tàu hỏa chứ đừng nói đến máy bay."},
    {"korean":"우리 아이는 영어는 고사하고 베트남어도 잘 못해요.","vietnamese":"Con tôi Tiếng Việt cũng không giỏi chứ đừng nói đến tiếng Anh."},
    {"korean":"영수는 김밥는 고사하고 라면도 아직 잘 못 만든다.","vietnamese":"Youngsu đến mì còn không biết nấu chứ đừng nói đến cơm cuộn."},
    {"korean":"저는 아침 운동은 고사하고 일찍 일어나지나 않았으면 좋겠어요.","vietnamese":"Dậy sớm tôi còn không muốn dậy chứ nói gì đến việc tập thể dục buổi sáng."}
  ]'::jsonb,
  ARRAY['N 은/는 말할 것도 없고','A/V – 기는 커녕']::TEXT[],
  ARRAY['negation','noun-pattern','emphasis','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'비행기___ 기차도 못 타 봤어요.','fill_blank','["는 고사하고","는 말할 것도 없고","기는커녕","는 커녕"]'::jsonb,0,'더 높은 기준 부정+낮은 기준도 불가: 비행기는 고사하고'
FROM public.grammar_patterns WHERE pattern='N 는 고사하고' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'영어___ 베트남어도 잘 못해요.','fill_blank','["는 고사하고","는 말할 것도 없고","기는커녕","는 커녕"]'::jsonb,0,'명사 완전 부정: 영어는 고사하고 → 기본도 안 됨'
FROM public.grammar_patterns WHERE pattern='N 는 고사하고' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #253: A/V – (으)ㄹ 뿐더러  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)ㄹ 뿐더러', 'eulppundeoreo', 'Không những chỉ...mà còn... (bổ sung thông tin, văn viết)', 'advanced', 'additive',
  'Cộng thêm một sự thật hay tình huống khác vào một sự thật hay tình huống nào đó. Chủ ngữ của vế trước và vế sau là một, đa số tình huống hay sự thật ở vế sau nghiêm trọng hơn hay mức độ cao hơn so với vế trước. Biểu hiện tương tự: (으)ㄹ 뿐만 아니라. Chủ yếu dùng trong văn viết.',
  'V + (으)ㄹ 뿐더러 / A + (으)ㄹ 뿐더러',
  '[
    {"korean":"영희 씨는 얼굴이 예쁠 뿐더러 성격도 좋아요.","vietnamese":"Young-hee khuôn mặt không những xinh đẹp mà tính cách cũng tốt nữa."},
    {"korean":"IT 산업은 앞으로의 전망도 밝을 뿐더러 투자 가치도 있다.","vietnamese":"Ngành công nghiệp IT sau này không những có triển vọng tươi sáng mà còn có giá trị đầu tư nữa."},
    {"korean":"그 그림은 거실 분위기에 어울리지도 않을 뿐더러 너무 작아요.","vietnamese":"Bức tranh đó không những không phù hợp với bầu không khí phòng khách mà còn rất nhỏ."},
    {"korean":"마약은 자신의 건강을 해칠 뿐더러 가족들에게도 고통을 안겨 준다.","vietnamese":"Ma túy không chỉ làm tổn hại đến sức khỏe của bản thân mà còn gây đau khổ cho gia đình."},
    {"korean":"한국의 여름은 더울 뿐더러 습도도 높다.","vietnamese":"Mùa hè Hàn Quốc không chỉ nóng mà độ ẩm còn cao."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 뿐만 아니라','A/V – 거니와']::TEXT[],
  ARRAY['additive','written','not-only','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'영희 씨는 얼굴이 예쁠___ 성격도 좋아요.','fill_blank','["뿐더러","뿐만 아니라","거니와","뿐이다"]'::jsonb,0,'추가 정보, 문어체: 예쁠 뿐더러 → 뿐만 아니라와 유사'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 뿐더러' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'마약은 건강을 해칠___ 가족들에게도 고통을 안겨 준다.','fill_blank','["뿐더러","뿐만 아니라","거니와","뿐이다"]'::jsonb,0,'피해 확장 추가: 해칠 뿐더러 → 문어체 추가'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 뿐더러' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #254: A/V – 되  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – 되', 'doe', 'Nhưng ... (đối lập, văn viết)', 'advanced', 'contrast',
  'Diễn tả 2 mệnh đề đối lập nhau. Thường dùng văn viết. Vế trước và vế sau có quan hệ tương phản hoặc điều kiện kèm hạn chế.',
  'V + 되 / A + 되',
  '[
    {"korean":"낮에 피곤하면 낮잠을 자되 30분 이내로 자는 것이 건강에 좋다.","vietnamese":"Ban ngày nếu mệt mỏi thì ngủ trưa nhưng ngủ 30 phút thôi thì sẽ tốt cho sức khỏe."},
    {"korean":"다이어트를 하되 자신에게 맞는 다이어트 방법을 선택하는 것이 필요하다.","vietnamese":"Giảm cân nhưng cần phải lựa chọn phương pháp giảm cân phù hợp với bản thân."},
    {"korean":"오늘은 바람은 많이 불되 춥지는 않다.","vietnamese":"Hôm nay gió thổi nhiều nhưng không lạnh."},
    {"korean":"말하기는 쉽되 실천하기는 어렵다.","vietnamese":"Nói thì dễ nhưng đưa vào thực tiễn thì khó."},
    {"korean":"하고 싶은 것을 하되 자신의 행동에 책임을 져야 합니다.","vietnamese":"Cứ làm thứ mình muốn nhưng phải chịu trách nhiệm về hành động của bản thân."},
    {"korean":"근무 시간에 인터넷을 사용하되 채팅은 하지 못하게 되어 있다.","vietnamese":"Sử dụng internet trong giờ làm việc nhưng mà không thể được dùng để chat."}
  ]'::jsonb,
  ARRAY['A/V – 지만','A/V – (으)나']::TEXT[],
  ARRAY['contrast','written','formal','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'낮잠을 자___ 30분 이내로 자는 것이 건강에 좋다.','fill_blank','["되","지만","(으)나","고"]'::jsonb,0,'허용+제한 대조, 문어체: 자되 → 조건 포함 역접'
FROM public.grammar_patterns WHERE pattern='A/V – 되' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'말하기는 쉽___ 실천하기는 어렵다.','fill_blank','["되","지만","(으)나","고"]'::jsonb,0,'대립 서술 문어체: 쉽되 → 전형적 문어 역접'
FROM public.grammar_patterns WHERE pattern='A/V – 되' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #255: N 을/를 비롯해서  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'N 을/를 비롯해서', 'eul/reul birothaeseo', 'Bắt đầu từ..., bao gồm cả... (liệt kê tiêu biểu)', 'advanced', 'listing',
  'Thể hiện danh từ đứng trước là danh từ đầu tiên hay tiêu biểu của một loạt bao gồm các danh từ được liệt kê trong mệnh đề sau. Được sử dụng chủ yếu trong các tình huống trang trọng hoặc trong văn viết.',
  'N + 을/를 비롯해서 / N + 을/를 비롯한',
  '[
    {"korean":"환경 보호를 위해 저희 회사는 사장님을 비롯해서 직원들까지 모두 대중교통을 이용해요.","vietnamese":"Để bảo vệ môi trường, tất cả nhân viên công ty chúng tôi bao gồm cả giám đốc đều đi làm bằng phương tiện giao thông công cộng."},
    {"korean":"아시아를 비롯해서 유럽 각 지역에서도 K-pop의 인기가 많아지고 있다.","vietnamese":"K-pop đang trở nên phổ biến bắt đầu từ châu Á rồi lan đến cả khu vực châu Âu."},
    {"korean":"그 약을 먹고 난 후 얼굴을 비롯해서 온몸에 두드러기가 올라왔다.","vietnamese":"Sau khi uống thuốc đó thì đã nổi mẩn ngứa bắt đầu từ mặt rồi đến toàn thân."},
    {"korean":"서울을 비롯해서 수도권 전역에 오늘 하루 종일 비가 내리겠습니다.","vietnamese":"Hôm nay trời sẽ mưa cả ngày bắt đầu từ Seoul rồi lan đến khu vực vùng thủ đô."},
    {"korean":"할머니 생신에 불고기를 비롯하여 여러 가지 음식을 잔뜩 준비했다.","vietnamese":"Mình đã chuẩn bị đầy đủ nhiều loại món ăn cho sinh nhật của bà bắt đầu từ món thịt nướng."}
  ]'::jsonb,
  ARRAY['N 을/를 포함해서','N 을/를 중심으로']::TEXT[],
  ARRAY['listing','representative','formal','written','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'사장님___ 직원들까지 모두 대중교통을 이용해요.','fill_blank','["을 비롯해서","를 포함해서","을 중심으로","부터"]'::jsonb,0,'대표+나열: 사장님을 비롯해서 → 가장 대표적인 사람 먼저'
FROM public.grammar_patterns WHERE pattern='N 을/를 비롯해서' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'서울___ 수도권 전역에 비가 내리겠습니다.','fill_blank','["을 비롯해서","를 포함해서","을 중심으로","부터"]'::jsonb,0,'지역 대표 확장: 서울을 비롯해서 → 서울부터 넓은 범위'
FROM public.grammar_patterns WHERE pattern='N 을/를 비롯해서' AND topik_level='TOPIK IV';
