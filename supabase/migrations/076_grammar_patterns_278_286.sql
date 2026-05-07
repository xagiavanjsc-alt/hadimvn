-- Migration 076: Grammar Patterns #278-286

-- ═══════════════════════════════════════════════════════════════════════════════
-- #278: A/V – 는 법이다  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – 는 법이다', 'neun beopida', 'Vốn dĩ..., đương nhiên là... (sự thật hiển nhiên)', 'advanced', 'natural_consequence',
  'Thể hiện nội dung của vế trước là một sự đương nhiên. Thường dùng cho những chân lý, quy tắc tự nhiên, tục ngữ. Tương tự 기 마련이다 nhưng mang sắc thái văn học hơn.',
  'V + 는 법이다 / A + (으)ㄴ 법이다',
  '[
    {"korean":"아무리 좋은 말도 여러 번 들으면 듣기 싫은 법이다.","vietnamese":"Cho dù lời lẽ có hay thì nghe nhiều lần hiển nhiên cũng nhàm chán."},
    {"korean":"여름에는 습기가 많은 법이다.","vietnamese":"Mùa hè thì đương nhiên độ ẩm cao."},
    {"korean":"겨울이 가면 봄이 오는 법이다.","vietnamese":"Mùa đông qua đi thì dĩ nhiên mùa xuân sẽ đến."},
    {"korean":"잘못을 하면 벌을 받는 법이다.","vietnamese":"Nếu làm sai thì đương nhiên phải chịu phạt rồi."},
    {"korean":"포기하지 않고 노력하는 사람이 성공하는 법이다.","vietnamese":"Một người nỗ lực và không từ bỏ thì chắc chắn là thành công."},
    {"korean":"발 없는 말이 천 리를 가는 법이다.","vietnamese":"Lời nói không chân chắc chắn là đi vạn dặm."}
  ]'::jsonb,
  ARRAY['A/V – 기 마련이다','A/V – (으)ㄹ 법하다']::TEXT[],
  ARRAY['natural_consequence','proverb','literary','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'겨울이 가면 봄이 오___ 이다.','fill_blank','["는 법","기 마련","을 법","는 것"]'::jsonb,0,'자연의 순리: 오는 법이다 → 당연한 자연 현상'
FROM public.grammar_patterns WHERE pattern='A/V – 는 법이다' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'잘못을 하면 벌을 받___ 이다.','fill_blank','["는 법","기 마련","을 법","는 것"]'::jsonb,0,'도덕적 당연: 받는 법이다 → 보편적 진리'
FROM public.grammar_patterns WHERE pattern='A/V – 는 법이다' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #279: A/V – (으)ㄴ/는가 하면  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)ㄴ/는가 하면', '(eu)n/neunga hamyeon', 'Nếu có... thì cũng có... (liệt kê tương phản)', 'advanced', 'contrast',
  'Diễn tả hai nội dung đối lập nhau. Trong nội dung mệnh đề sau thường gắn thêm tiểu từ 도.',
  'V + 는가 하면 / A + (으)ㄴ가 하면',
  '[
    {"korean":"의견들 중 일부는 합리적인가 하면 불합리한 의견도 있다.","vietnamese":"Trong các ý kiến, nếu có ý kiến hợp lí thì cũng có ý kiến không hợp lí."},
    {"korean":"베트남 사람이라도 쌀국수를 좋아하는 사람이 있는가 하면 싫어하는 사람도 있다.","vietnamese":"Dù là người Việt Nam nhưng nếu có người thích phở thì cũng có người không thích phở."},
    {"korean":"사람은 누구나 단점이 있는가 하면 장점도 있다.","vietnamese":"Con người nếu có nhược điểm thì cũng có ưu điểm."},
    {"korean":"어떤 학생은 학교에 일찍 오는가 하면 어떤 학생은 늦게 온다.","vietnamese":"Nếu có học sinh đến trường sớm thì cũng có học sinh đến trường muộn."},
    {"korean":"농구를 잘하는 사람이 있는가 하면 축구를 잘하는 사람도 있다.","vietnamese":"Nếu có người chơi bóng rổ giỏi thì cũng có người chơi bóng đá giỏi."}
  ]'::jsonb,
  ARRAY['A/V – 는 반면에','A/V – 거니와']::TEXT[],
  ARRAY['contrast','parallel','listing','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'사람은 단점이 있___ 장점도 있다.','fill_blank','["는가 하면","는 반면에","으면","지만"]'::jsonb,0,'대립 열거: 있는가 하면 → 두 대조 내용 병렬'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄴ/는가 하면' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'합리적인___ 불합리한 의견도 있다.','fill_blank','["가 하면","는 하면","가 한다면","면"]'::jsonb,0,'형용사+가 하면: 합리적인가 하면 → 대립 나열'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄴ/는가 하면' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #280: A-(으)니 A-(으)니 하다 / V-느니 V-느니 하다  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A-(으)니 A-(으)니 하다 / V-느니 V-느니 하다', '(eu)ni (eu)ni hada / neuni neuni hada', 'Vừa... vừa... (liệt kê ý kiến khác nhau)', 'advanced', 'enumeration',
  'Liệt kê những suy nghĩ hoặc ý kiến khác nhau về một sự việc hoặc trạng thái nào đó. Có thể giản lược 하다. Dạng trích dẫn: -(느)ㄴ다느니 -(느)ㄴ다느니 하다. Biểu hiện tương tự: -(으)네 -(으)네 하다.',
  'A + (으)니 A + (으)니 하다 / V + 느니 V + 느니 하다',
  '[
    {"korean":"흐엉 씨는 한국으로 유학을 가느니 베트남에서 취직하느니 고민하고 있어요.","vietnamese":"Hương đang suy nghĩ nên đi du học Hàn Quốc hay là làm việc ở Việt Nam."},
    {"korean":"유리 씨는 시장은 복잡하니 환불이 안 되느니 하면서 백화점만 가요.","vietnamese":"Vì chợ vừa phức tạp vừa không được đổi hàng nên Yu-ri đi đến trung tâm thương mại."},
    {"korean":"호텔이 경치가 좋으니 시설이 좋으니 해도 내 집만 못하다.","vietnamese":"Khách sạn dù cảnh trí có đẹp, trang thiết bị có tốt thì cũng không thể như nhà của tôi."},
    {"korean":"음식이 매우니 짜니 하면서도 결국 다 먹었다.","vietnamese":"Thức ăn vừa mặn vừa cay mà kết cục vẫn ăn hết trơn."},
    {"korean":"결혼식에 한복을 입느니 정장을 입느니 하더니 결국 정장을 입기로 했다.","vietnamese":"Khi đến lễ cưới có thể mặc hanbok hay vest, cuối cùng tôi đã quyết định mặc vest."}
  ]'::jsonb,
  ARRAY['N-(이)며 N-(이)며','V-(으)랴 V-(으)랴']::TEXT[],
  ARRAY['enumeration','opinion','listing','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'음식이 매우___ 짜___ 하면서도 결국 다 먹었다.','fill_blank','["니, 니","느니, 느니","고, 고","며, 며"]'::jsonb,0,'형용사 열거: 매우니 짜니 → 여러 성질 나열'
FROM public.grammar_patterns WHERE pattern='A-(으)니 A-(으)니 하다 / V-느니 V-느니 하다' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'한국으로 유학을 가___ 베트남에서 취직하___ 고민 중이에요.','fill_blank','["느니, 느니","니, 니","고, 고","며, 며"]'::jsonb,0,'동사 선택 고민: 가느니 취직하느니 → 두 동작 고민 열거'
FROM public.grammar_patterns WHERE pattern='A-(으)니 A-(으)니 하다 / V-느니 V-느니 하다' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #281: V -(으)랴 V -(으)랴  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V -(으)랴 V -(으)랴', '(eu)rya (eu)rya', 'Vừa lo... vừa lo... (bận rộn nhiều việc)', 'advanced', 'enumeration',
  'Thể hiện sự bận rộn khi phải thực hiện 2 hành động trở lên cùng một lúc. Mang sắc thái than thở về sự vất vả.',
  'V + (으)랴 V + (으)랴',
  '[
    {"korean":"수업 시간에 저희들은 필기하랴 선생님의 설명을 들으랴 얼마나 바쁜지 몰라요.","vietnamese":"Trong giờ học, chúng tôi không biết bận rộn đến thế nào khi vừa lo ghi chép vừa lo nghe giảng."},
    {"korean":"요즘 대학생들은 수업 들으랴 취업 준비하랴 눈코 뜰 새가 없어요.","vietnamese":"Dạo này các bạn sinh viên bận tối mắt tối mũi nào là nghe giảng, nào là chuẩn bị xin việc."},
    {"korean":"식당 아르바이트는 주문 받으랴 음식 나르랴 상 치우랴 너무 정신이 없어요.","vietnamese":"Làm thêm ở nhà hàng rất bận rộn nào là nhận đơn, nào là mang thức ăn, nào là lau bàn."},
    {"korean":"요즘 동생은 일하랴 아이 돌보랴 몸이 열 개라도 모자란다.","vietnamese":"Dạo này em tôi nào là làm việc, nào là chăm trẻ dù có 10 cái thân cũng không đủ."},
    {"korean":"마이 씨는 한국어 공부하랴 아르바이트하랴 바쁘게 한국 유학 생활을 하고 있다.","vietnamese":"Cuộc sống du học Hàn Quốc của Mai rất bận rộn khi vừa lo học tiếng Hàn vừa lo làm thêm."}
  ]'::jsonb,
  ARRAY['A-(으)니 A-(으)니 하다','N-(이)며 N-(이)며']::TEXT[],
  ARRAY['enumeration','busy','complaint','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'수업 들으___ 취업 준비하___ 눈코 뜰 새가 없어요.','fill_blank','["랴, 랴","며, 며","니, 니","고, 고"]'::jsonb,0,'동시 다중 행동 바쁨: 들으랴 준비하랴 → 여러 일 동시에'
FROM public.grammar_patterns WHERE pattern='V -(으)랴 V -(으)랴' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'주문 받으___ 음식 나르___ 너무 정신이 없어요.','fill_blank','["랴, 랴","며, 며","니, 니","고, 고"]'::jsonb,0,'다중 작업 고충: 받으랴 나르랴 → 동시 수행 불편 강조'
FROM public.grammar_patterns WHERE pattern='V -(으)랴 V -(으)랴' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #282: N-(이)며 N-(이)며  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'N-(이)며 N-(이)며', 'N-(i)myeo N-(i)myeo', 'Vừa... vừa... / Và... (liệt kê danh từ)', 'advanced', 'enumeration',
  'Liệt kê hai hoặc nhiều sự vật hoặc sự thật nào đó. Không dùng trong trường hợp trang trọng.',
  'N + (이)며 N + (이)며 / N + (이)면 N + (이)면',
  '[
    {"korean":"민호 씨는 공부며 운동이며 못하는 게 없어요.","vietnamese":"Min-ho không có gì không thể làm dù là học hành hay thể thao."},
    {"korean":"사기를 당하는 바람에 집이며 자동차며 모두 잃었다.","vietnamese":"Vì bị lừa nên tôi đã mất cả nhà và ô tô."},
    {"korean":"아이가 눈이며 코며 아빠를 아주 많이 닮았다.","vietnamese":"Đứa bé có đôi mắt và mũi rất giống bố."},
    {"korean":"나는 불고기며 비빔밥이며 못 먹는 한국 음식이 거의 없다.","vietnamese":"Bulgogi hay cơm trộn, hầu như không có món ăn Hàn Quốc nào mà tôi không thể ăn được."},
    {"korean":"가방을 분실해서 신분증이며 열쇠며 중요한 물건들을 많이 잃어버렸다.","vietnamese":"Tôi bị thất lạc túi xách nên mất những thứ quan trọng là chứng minh thư và chìa khóa."},
    {"korean":"이 식당은 불고기면 불고기, 냉면이면 냉면 맛없는 음식이 없다.","vietnamese":"Nhà hàng này không có món nào là không ngon, nào là Bulgogi, nào là mì lạnh."}
  ]'::jsonb,
  ARRAY['V -(으)랴 V -(으)랴','A-(으)니 A-(으)니 하다']::TEXT[],
  ARRAY['enumeration','listing','noun','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'민호 씨는 공부___ 운동___ 못하는 게 없어요.','fill_blank','["며, 이며","이며, 이며","며, 며","니, 니"]'::jsonb,0,'명사 열거: 공부며 운동이며 → 여러 항목 나열'
FROM public.grammar_patterns WHERE pattern='N-(이)며 N-(이)며' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'집___ 자동차___ 모두 잃었다.','fill_blank','["이며, 며","며, 이며","이며, 이며","니, 니"]'::jsonb,0,'손실 항목 열거: 집이며 자동차며 → 명사 연속 나열'
FROM public.grammar_patterns WHERE pattern='N-(이)며 N-(이)며' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #283: V-(으)ㄴ 끝에  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V-(으)ㄴ 끝에', '(eu)n kkeute', 'Sau khi... (kết quả sau quá trình dài khó khăn)', 'advanced', 'result',
  'Kết quả đạt được sau một thời gian dài hoặc một quá trình khó khăn. Hành động trước đó được tiến hành rất tốn thời gian và khó khăn. Thường đi cùng với phó từ 결과, 마침내, 드디어.',
  'V + (으)ㄴ 끝에',
  '[
    {"korean":"수차례의 실패를 거듭한 끝에 겨우 그 일을 해냈어요.","vietnamese":"Sau nhiều lần thất bại, cuối cùng tôi đã làm được việc đó."},
    {"korean":"고민한 끝에 한국으로 유학을 가기로 결정했다.","vietnamese":"Sau khi suy nghĩ, tôi đã quyết định đi du học ở Hàn Quốc."},
    {"korean":"민수 씨는 며칠 동안 고민한 끝에 결국 직장을 그만두고 유학을 떠났어요.","vietnamese":"Min Su sau nhiều ngày trăn trở thì kết cục đã thôi việc và đi du học."},
    {"korean":"그 영화에서 주인공은 몇 번이나 탈옥을 시도한 끝에 결국 감옥에서 탈출하는 데 성공한다.","vietnamese":"Nhân vật chính trong bộ phim đó sau nhiều lần thử vượt ngục kết cục đã thoát khỏi nhà tù thành công."},
    {"korean":"어떻게 하는 게 좋을지 생각한 끝에 드디어 결정을 내렸다.","vietnamese":"Sau khi suy nghĩ về cách làm như thế nào cho ổn thỏa, cuối cùng tôi đã đưa ra quyết định."}
  ]'::jsonb,
  ARRAY['V – 아/어 내다','V – 고 나서']::TEXT[],
  ARRAY['result','process','achievement','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'수차례 실패를 거듭한___ 겨우 그 일을 해냈어요.','fill_blank','["끝에","후에","다음에","결과에"]'::jsonb,0,'긴 과정 후 결과: 거듭한 끝에 → 힘든 과정 뒤 성취'
FROM public.grammar_patterns WHERE pattern='V-(으)ㄴ 끝에' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'며칠 동안 고민한___ 결국 직장을 그만뒀어요.','fill_blank','["끝에","후에","다음에","나서"]'::jsonb,0,'심사숙고 후 결단: 고민한 끝에 → 긴 고민의 결과'
FROM public.grammar_patterns WHERE pattern='V-(으)ㄴ 끝에' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #284: V-아/어 내다  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V-아/어 내다', 'a/eo naeda', 'Cố gắng... thành công (vượt khó hoàn thành)', 'advanced', 'accomplishment',
  'Thể hiện một sự hoàn thành hay cuối cùng cũng kết thúc hay đạt được một điều gì đó. Không dùng thể bị động của động từ mà chỉ kết hợp với những động từ thể hiện sự khắc phục khó khăn hay thể hiện một ý chí mạnh mẽ.',
  'V + 아/어 내다',
  '[
    {"korean":"이 암호의 뜻을 알아 내기 위해 최선을 다 했지만 결국 실패하고 말았다.","vietnamese":"Tôi đã cố gắng hết sức để tìm ra ý nghĩa của mật mã này nhưng cuối cùng đã thất bại."},
    {"korean":"그 사람이 시각 장애를 가지지만 역경을 이겨 냈어요.","vietnamese":"Người đó bị khiếm thị nhưng đã cố gắng vượt qua nghịch cảnh."},
    {"korean":"책이 어려웠지만 끝까지 읽어 내서 기분이 좋다.","vietnamese":"Cuốn sách khó nhưng tôi đã đọc được đến hết nên tâm trạng vui."},
    {"korean":"삼일 밤낮에 걸쳐 수색을 해서 끝내 범인을 찾아 냈다.","vietnamese":"Cuộc truy lùng kéo dài suốt ba ngày đêm nên cuối cùng cũng đã tìm ra được kẻ phạm tội."},
    {"korean":"유학 생활을 하다 보면 힘든 일도 많겠지만 제 꿈을 위해 반드시 이겨 내겠습니다.","vietnamese":"Nếu nhìn vào cuộc sống du học sẽ thấy có nhiều vất vả, nhưng vì ước mơ của tôi, tôi nhất định vượt qua được."}
  ]'::jsonb,
  ARRAY['V-(으)ㄴ 끝에','V – 아/어 버리다']::TEXT[],
  ARRAY['accomplishment','achievement','overcome','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'역경을 이겨___ 정말 대단해요.','fill_blank','["냈으니","버렸으니","냈는데","쳤으니"]'::jsonb,0,'극복+성취: 이겨 내다 → 어려움 극복 완성'
FROM public.grammar_patterns WHERE pattern='V-아/어 내다' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'끝내 범인을 찾아___ 수사가 종료됐다.','fill_blank','["냈고","버렸고","냈는데","쳤고"]'::jsonb,0,'끝까지 달성: 찾아 내다 → 노력 끝 목표 달성'
FROM public.grammar_patterns WHERE pattern='V-아/어 내다' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #285: V – 데요  (TOPIK III)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – 데요', 'deyo', 'Hóa ra..., tôi thấy/biết rằng... (hồi tưởng trực tiếp)', 'intermediate', 'retrospective',
  'Sử dụng khi người nói đang hồi tưởng lại điều gì đó mà họ đã trực tiếp trải qua hoặc cảm nhận được trong quá khứ và đang truyền đạt thông tin đó cho người khác. Được sử dụng chủ yếu trong văn nói.',
  'V/A + 데요 (hiện tại) / V/A + 았/었데요 (quá khứ)',
  '[
    {"korean":"흐엉 씨가 한국어를 배운 지 얼마 안 됐다고 하던데 아주 잘하데요.","vietnamese":"Hương học tiếng Hàn chưa được bao lâu mà rất giỏi."},
    {"korean":"제주도 날씨가 생각보다 덥지 않데요.","vietnamese":"Thời tiết ở Jeju không nóng như mình nghĩ."},
    {"korean":"그 아이는 정말 똑똑하데요.","vietnamese":"Đứa trẻ đó thực sự rất thông minh."},
    {"korean":"어제 공원에 가 보니 벌써 꽃들이 다 폈데요.","vietnamese":"Hôm qua tôi đã đến công viên thì thấy hoa đã nở hết rồi."},
    {"korean":"그 사람이 익살스러운 표정을 지으니까 사람들이 다 웃데요.","vietnamese":"Người đó có biểu cảm hài hước nên mọi người đều cười."},
    {"korean":"회사 앞 식당에 갔는데 그곳 감자탕이 아주 맛있데요.","vietnamese":"Tôi đã đến nhà hàng trước công ty, món xương hầm khoai tây ở đó rất ngon."}
  ]'::jsonb,
  ARRAY['V – 더라고요','V – 았/었다고요']::TEXT[],
  ARRAY['retrospective','observation','spoken','topik3','intermediate']::TEXT[],
  'TOPIK III'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'제주도 날씨가 생각보다 덥지 않___.','fill_blank','["데요","네요","군요","잖아요"]'::jsonb,0,'직접 경험 전달: 않데요 → 본인이 직접 경험한 사실 전달'
FROM public.grammar_patterns WHERE pattern='V – 데요' AND topik_level='TOPIK III';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'어제 공원에 가 보니 꽃들이 다 폈___.','fill_blank','["데요","네요","군요","잖아요"]'::jsonb,0,'과거 직접 관찰: 폈데요 → 현장 경험 후 전달'
FROM public.grammar_patterns WHERE pattern='V – 데요' AND topik_level='TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #286: V/A – (으)ㄴ/는 가운데  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V/A – (으)ㄴ/는 가운데', '(eu)n/neun gaunde', 'Giữa lúc..., trong lúc... (nền tảng tình huống)', 'advanced', 'simultaneous',
  'Nội dung của mệnh đề sau xảy ra trong khi tình huống hoặc trạng thái của sự việc ở mệnh đề trước vẫn tiếp tục. Mệnh đề trước trở thành nền tảng hoặc tình huống cho mệnh đề sau.',
  'V + 는 가운데 / A/V + (으)ㄴ 가운데',
  '[
    {"korean":"비가 내리는 가운데 공연은 중단되지 않고 계속되었다.","vietnamese":"Trong lúc trời mưa buổi công diễn vẫn không ngắt quãng mà tiếp tục diễn ra."},
    {"korean":"민지 씨는 바쁜 가운데 저를 도와줬어요.","vietnamese":"Trong lúc MinJi bận mà cậu ấy cũng đã giúp tớ."},
    {"korean":"출산율이 점점 줄어들고 있는 가운데 정부의 출산 장려 정책이 발표되었다.","vietnamese":"Giữa lúc tỷ lệ sinh đang dần dần giảm đi thì chính sách khuyến khích sinh đẻ của chính phủ đã được ban hành."},
    {"korean":"시민들의 항의가 계속되고 있는 가운데 경찰들이 진압하기 시작했다.","vietnamese":"Giữa lúc người dân liên tục phản kháng thì cảnh sát đã bắt đầu sự trấn áp."},
    {"korean":"사람들이 모두 모인 가운데 결혼식이 진행되었다.","vietnamese":"Giữa lúc tất cả mọi người tập hợp đông đủ thì lễ cưới đã được tiến hành."},
    {"korean":"즐겁게 이야기를 나누는 가운데 어느덧 끝날 시간이 되었어요.","vietnamese":"Giữa lúc đang nói chuyện vui vẻ thì đã hết thời gian lúc nào không hay."}
  ]'::jsonb,
  ARRAY['V – 는 동안에','A/V – (으)면서']::TEXT[],
  ARRAY['simultaneous','background','formal','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'비가 내리는___ 공연은 계속되었다.','fill_blank','["가운데","동안에","중에","사이에"]'::jsonb,0,'배경 상황 제시: 내리는 가운데 → 진행 상황 속 다른 사건'
FROM public.grammar_patterns WHERE pattern='V/A – (으)ㄴ/는 가운데' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'민지 씨는 바쁜___ 저를 도와줬어요.','fill_blank','["가운데","동안에","중에","사이에"]'::jsonb,0,'상태 배경+행동: 바쁜 가운데 → 어려운 상황 속에서도'
FROM public.grammar_patterns WHERE pattern='V/A – (으)ㄴ/는 가운데' AND topik_level='TOPIK V';
