-- Migration 059: Insert TOPIK grammar patterns #101-113 (Intermediate level)
-- Ngữ pháp TOPIK #101-113 (Trung cấp)

-- ═══════════════════════════════════════════════════════════════════════════════
-- #101: V – (으)ㄴ/는 대로
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)ㄴ/는 대로',
  '(eu)n/neun daero',
  'Theo như, cứ như, như...',
  'intermediate',
  'manner',
  'Diễn tả hành động ở mệnh đề sau xảy ra đúng theo cách ở mệnh đề trước. Ngoài ra có thể dùng N + 대로, một số từ tiêu biểu như: 마음대로, 생각대로, 약속대로, 순서대로, 차례대로, 사실대로, 계획대로,...',
  'V + 는 대로 (hiện tại) / V + (으)ㄴ 대로 (quá khứ) / N + 대로',
  '[
    {"korean": "제가 발음하는 대로 따라하세요.", "vietnamese": "Hãy nói theo phát âm của tôi."},
    {"korean": "요리책에서 보는 대로 삼계탕을 만들어서 정말 맛있어요.", "vietnamese": "Tôi nấu món gà tần sâm theo như xem sách nấu ăn, thật sự rất ngon."},
    {"korean": "내가 하는 대로 한번 따라해 보세요.", "vietnamese": "Hãy thử một lần làm theo như tôi làm đi."},
    {"korean": "지금부터는 하고 싶은 대로 하세요.", "vietnamese": "Từ bây giờ hãy làm theo như những gì muốn đi."},
    {"korean": "비싸면 비싼 대로 제값을 한다.", "vietnamese": "Càng đắt thì giá trị càng đúng theo sự đắt đó. (tiền nào của nấy)"}
  ]'::jsonb,
  ARRAY['N + 대로', '약속대로', '계획대로']::TEXT[],
  ARRAY['manner', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄴ/는 대로' LIMIT 1),
  '제가 발음하___ 대로 따라하세요.',
  'fill_blank',
  '["는", "ㄴ", "은", "던"]'::jsonb,
  '는',
  'Hành động hiện tại → V + 는 대로.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄴ/는 대로' LIMIT 1),
  '약속 ___ 꼭 지켜야 해요.',
  'fill_blank',
  '["대로", "처럼", "같이", "만큼"]'::jsonb,
  '대로',
  'N + 대로 = theo như lời hứa.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #102: A/V – 기는요
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 기는요',
  'gineunyo',
  'Gì mà..., đâu mà... (phủ nhận khiêm tốn)',
  'intermediate',
  'speech_act',
  'Sử dụng khi nói một cách khiêm tốn về lời khen của đối phương, hoặc thể hiện sự phủ nhận bác bỏ, từ chối một cách nhẹ nhàng lời nói của đối phương. Dùng nhiều trong văn nói.',
  'A/V + 기는요',
  '[
    {"korean": "가: 한국어가 정말 잘하네요. 나: 잘하기는요.", "vietnamese": "가: Bạn giỏi tiếng Hàn thật đấy. 나: Giỏi gì đâu chứ."},
    {"korean": "가: 유리 씨는 머리가 참 똑똑해요. 나: 똑똑하기는요.", "vietnamese": "가: Yuri thông minh thật đấy. 나: Thông minh gì đâu chứ."},
    {"korean": "가: 밥 먹었어요? 나: 먹기는요. 배고파 죽겠어요.", "vietnamese": "가: Bạn đã ăn cơm chưa? 나: Ăn gì mà ăn. Đói muốn chết rồi đây này."},
    {"korean": "가: 오늘 화장하고 왔네요. 예뻐요. 나: 예쁘기는요.", "vietnamese": "가: Hôm nay đã trang điểm rồi đến nhỉ. Xinh đẹp quá à. 나: Xinh đẹp gì đâu ạ."}
  ]'::jsonb,
  ARRAY['A/V – 기는 하다']::TEXT[],
  ARRAY['speech_act', 'spoken', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 기는요' LIMIT 1),
  '가: 한국어 정말 잘하네요. 나: 잘하___ 요.',
  'fill_blank',
  '["기는", "기야", "기도", "기만"]'::jsonb,
  '기는',
  'Phủ nhận khiêm tốn → 잘하기는요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 기는요' LIMIT 1),
  '가: 많이 드세요! 나: 먹___ 요. 다이어트 중이에요.',
  'fill_blank',
  '["기는", "기야", "기도", "기만"]'::jsonb,
  '기는',
  'Từ chối nhẹ nhàng → 먹기는요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #103: A/V – 고말고요
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 고말고요',
  'gomalgogyo',
  'Chắc chắn, đương nhiên là...',
  'intermediate',
  'speech_act',
  'Cấu trúc dùng khi trả lời khẳng định đối với câu hỏi của đối phương hoặc đồng ý với lời của đối phương đồng thời nhấn mạnh điều này. Tương đương sử dụng với phó từ 물론. Vế trước quá khứ: 았/었고말고요.',
  'A/V + 고말고요 / A/V + 았/었고말고요',
  '[
    {"korean": "우리 팀의 일인데 참여하고말고요.", "vietnamese": "Vì là việc của nhóm chúng tớ nên chắc chắn là tham gia rồi."},
    {"korean": "가: 한국이 그렇게 좋아요? 나: 좋고말고요. 한국말, 한국사람, 한국음식, 다 좋아요.", "vietnamese": "가: Bạn thích Hàn Quốc đến vậy sao? 나: Đương nhiên là thích rồi."},
    {"korean": "가: 지난번에 빌려준 책을 다 읽었어요? 나: 다 읽고말고요.", "vietnamese": "가: Cuốn sách mình cho bạn mượn hôm trước đã đọc xong chưa? 나: Tất nhiên là đọc xong hết rồi."},
    {"korean": "여름에 해변들이 매우 복잡해지고말고요.", "vietnamese": "Các bãi biển dĩ nhiên trở nên vô cùng đông đúc vào mùa hè."}
  ]'::jsonb,
  ARRAY['물론이죠']::TEXT[],
  ARRAY['speech_act', 'affirmation', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 고말고요' LIMIT 1),
  '가: 한국에 또 가고 싶어요? 나: 가 ___ 요. 정말 좋았어요.',
  'fill_blank',
  '["고말고", "기는", "든지", "면서"]'::jsonb,
  '고말고',
  'Khẳng định mạnh → 가고말고요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 고말고요' LIMIT 1),
  '가: 그 책 재미있었어요? 나: 재미있 ___ 요. 꼭 읽어 보세요.',
  'fill_blank',
  '["고말고", "기는", "든지", "면서"]'::jsonb,
  '고말고',
  'Khẳng định → 재미있고말고요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #104: V – 곤 하다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 곤 하다',
  'gon hada',
  'Thường hay..., thường...',
  'intermediate',
  'frequency',
  'Thể hiện một tình huống nào đó thường xuyên được lặp lại. Dùng 곤 하다 khi hiện tại vẫn còn thực hiện, còn nếu sự việc đã chấm dứt thì dùng 곤 했다. Có thể sử dụng dưới dạng –고는 하다.',
  'V + 곤 하다 / V + 곤 했다 (quá khứ đã chấm dứt)',
  '[
    {"korean": "친구들을 만나 영화를 보곤 해요.", "vietnamese": "Tôi thường gặp bạn bè rồi đi xem phim."},
    {"korean": "할머니께 어린 시절 이야기를 듣곤 했다.", "vietnamese": "Tôi thường nghe câu chuyện thời thơ ấu từ bà."},
    {"korean": "저는 주변이 시끄러울 때 이어폰을 꽂고 조용한 음악을 듣곤 해요.", "vietnamese": "Khi xung quanh ồn ào thì tôi thường đeo tai nghe và nghe nhạc yên tĩnh."},
    {"korean": "스트레스를 받으면 음악을 듣곤 합니다.", "vietnamese": "Nếu bị stress tôi thường nghe nhạc."},
    {"korean": "어렸을 때는 그곳에 자주 가곤 했어요.", "vietnamese": "Khi còn nhỏ tôi hay thường đi đến chỗ đó."}
  ]'::jsonb,
  ARRAY['V – 고는 하다']::TEXT[],
  ARRAY['frequency', 'habit', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 곤 하다' LIMIT 1),
  '스트레스를 받으면 음악을 듣___ 해요.',
  'fill_blank',
  '["곤", "고는", "거나", "고서"]'::jsonb,
  '곤',
  'Thói quen lặp lại đến hiện tại → 듣곤 해요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 곤 하다' LIMIT 1),
  '어렸을 때 그 공원에 자주 가___ 했어요.',
  'fill_blank',
  '["곤", "기는", "거나", "고서"]'::jsonb,
  '곤',
  'Thói quen quá khứ đã chấm dứt → 가곤 했어요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #105: A/V – (으)ㄴ/는 척하다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ/는 척하다',
  '(eu)n/neun cheokada',
  'Giả vờ, làm như, giả bộ như, tỏ ra như...',
  'intermediate',
  'manner',
  'Chủ ngữ giả vờ làm gì đó trái ngược với sự thực. Ở dạng nhấn mạnh có thể dùng 척을 하다 / 척도 하다. Cũng có thể dùng 체하다 thay cho 척하다.',
  'V + 는 척하다 (hiện tại) / V + (으)ㄴ 척하다 (quá khứ) / A + (으)ㄴ 척하다',
  '[
    {"korean": "어떤 곤충은 자신을 보호하기 위해 죽을 척을 한다.", "vietnamese": "Một số côn trùng giả vờ chết để tự vệ."},
    {"korean": "친구가 돈을 빌려 달라고 해서 돈이 없는 체해요.", "vietnamese": "Bạn tôi hỏi mượn tiền vì vậy tôi giả vờ như không có tiền."},
    {"korean": "제가 한 이야기에 대해 모르는 척해 주세요.", "vietnamese": "Hãy giả vờ như bạn không biết tôi đang nói về cái gì."},
    {"korean": "두 사람은 친한 친구인 척했어요.", "vietnamese": "Hai người đã tỏ ra như là bạn bè thân thiết."},
    {"korean": "명동에서 친구를 봤는데 못 본 척했어요.", "vietnamese": "Tôi đã gặp người bạn ở Myong-dong nhưng đã vờ như không thấy."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는 체하다']::TEXT[],
  ARRAY['manner', 'pretend', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 척하다' LIMIT 1),
  '모르는 ___ 하지 말고 솔직하게 말해요.',
  'fill_blank',
  '["척", "대로", "만큼", "처럼"]'::jsonb,
  '척',
  'Giả vờ không biết → 모르는 척하다.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 척하다' LIMIT 1),
  '그는 아픈 ___ 하면서 학교에 안 갔어요.',
  'fill_blank',
  '["척을", "대로", "만큼", "처럼"]'::jsonb,
  '척을',
  'Giả vờ bị bệnh (dạng nhấn mạnh) → 아픈 척을 하다.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #106: A/V – (으)ㄴ/는 대신(에)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ/는 대신(에)',
  '(eu)n/neun daesine',
  'Thay vì..., bù lại...',
  'intermediate',
  'contrast',
  'Nghĩa 1: Thể hiện sự thay đổi hành động hay trạng thái ở vế trước sang hành động hay trạng thái khác tương ứng ở vế sau. [thay vì, thay cho]. Nghĩa 2: Hành động hoặc trạng thái ở vế trước và vế sau khác nhau hoặc trái ngược. [bù lại, thay vào đó]. Cũng dùng N + 대신(에).',
  'V + 는 대신(에) / V + (으)ㄴ 대신(에) / N + 대신(에)',
  '[
    {"korean": "불고기 대신에 삼겹살을 먹으면 어때요?", "vietnamese": "Thay vì Bulgogi thì ăn thịt ba chỉ được không?"},
    {"korean": "지하철은 빠른 대신에 출퇴근 시간에 사람이 많아요.", "vietnamese": "Tàu điện ngầm nhanh nhưng thay vào đó vào giờ cao điểm thì đông người."},
    {"korean": "요즘엔 편지를 쓰는 대신에 이메일을 보낸다.", "vietnamese": "Gần đây, thay vì viết thư thì tôi gửi email."},
    {"korean": "내 숙제를 도와주는 대신에 밥을 살게요.", "vietnamese": "Bạn giúp mình làm bài tập về nhà thì thay vào đó mình sẽ mời bạn ăn."},
    {"korean": "청소를 도와주는 대신 맛있는 요리를 만들어 줄게요.", "vietnamese": "Giúp mình dọn dẹp thì thay vào đó mình sẽ nấu món gì đó thật ngon đãi bạn."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는 반면(에)']::TEXT[],
  ARRAY['contrast', 'substitution', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 대신(에)' LIMIT 1),
  '편지를 쓰는 ___ 이메일을 보낸다.',
  'fill_blank',
  '["대신에", "대로", "척하며", "것처럼"]'::jsonb,
  '대신에',
  'Thay thế hành động → 대신에.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 대신(에)' LIMIT 1),
  '지하철은 빠른 ___ 사람이 많아요.',
  'fill_blank',
  '["대신에", "대로", "척하며", "것처럼"]'::jsonb,
  '대신에',
  'Bù lại, ngược lại → 빠른 대신에.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #107: 아무 + (이)나 / 아무 + 도
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  '아무 + (이)나 / 아무 + 도',
  'amu (i)na / amu do',
  'Bất cứ, bất kỳ / Không có ai/gì cả',
  'intermediate',
  'determiners',
  '아무 nghĩa là không chọn bất cứ cái gì đặc biệt. Sau 아무 + (이)나 sử dụng dạng khẳng định (bất cứ... cũng được). Sau 아무 + 도 luôn sử dụng hình thức phủ định (không có ai/gì cả). Đối với danh từ chỉ người: 아무나 (bất cứ ai), 아무도 (không có ai).',
  '아무 + N + (이)나 + khẳng định / 아무 + N + 도 + phủ định',
  '[
    {"korean": "가: 뭐 먹고 싶어요? 나: 저는 아무거나 괜찮아요.", "vietnamese": "가: Bạn muốn ăn gì? 나: Tôi ăn gì cũng được."},
    {"korean": "아무도 저를 알지 못하는 곳으로 가고 싶어요.", "vietnamese": "Tôi muốn đến một nơi mà không ai biết tôi."},
    {"korean": "그 세미나에는 아무나 갈 수 있어요?", "vietnamese": "Cuộc hội thảo đó ai cũng có thể đến được sao?"},
    {"korean": "요즘 방학이라서 아무 때나 놀러 오세요.", "vietnamese": "Dạo này đang là kì nghỉ nên hãy đến chơi bất cứ lúc nào."},
    {"korean": "주말에 아무 일도 안 하고 그냥 쉬었어요.", "vietnamese": "Vào cuối tuần tôi chẳng làm gì cả mà chỉ nghỉ ngơi thôi."}
  ]'::jsonb,
  ARRAY['아무나', '아무도', '아무거나', '아무것도']::TEXT[],
  ARRAY['determiners', 'negation', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = '아무 + (이)나 / 아무 + 도' LIMIT 1),
  '가: 뭐 마실래요? 나: ___ 괜찮아요.',
  'fill_blank',
  '["아무거나", "아무것도", "아무도", "아무나"]'::jsonb,
  '아무거나',
  'Uống gì cũng được (câu khẳng định) → 아무거나.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = '아무 + (이)나 / 아무 + 도' LIMIT 1),
  '방에 ___ 없었어요.',
  'fill_blank',
  '["아무도", "아무나", "아무거나", "아무데나"]'::jsonb,
  '아무도',
  'Không có ai (câu phủ định) → 아무도.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #108: N – (이)라도
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – (이)라도',
  '(i)rado',
  'Cho dù là..., tạm...',
  'intermediate',
  'choice',
  'Diễn tả lựa chọn nào đó tuy không phải là tốt nhất nhưng cũng tạm ổn. Người nói chọn phương án thứ hai vì phương án tốt nhất không có sẵn hoặc không thể thực hiện.',
  'N + 이라도 (sau phụ âm) / N + 라도 (sau nguyên âm)',
  '[
    {"korean": "해외여행이 어려우면 제주도라도 다녀오세요.", "vietnamese": "Nếu du lịch nước ngoài khó khăn quá thì dù là đảo Jeju cũng hãy đi đi."},
    {"korean": "밥이 없는데 라면이라도 먹겠어요.", "vietnamese": "Vì không có cơm nên sẽ ăn tạm mì tôm."},
    {"korean": "전화를 못하면 문자라도 하세요.", "vietnamese": "Nếu không gọi điện được thì dù là tin nhắn cũng hãy nhắn đi."},
    {"korean": "커피가 없는데 물이라도 마실래요?", "vietnamese": "Vì không có cà phê nên dù là nước cũng uống chứ?"},
    {"korean": "집이 너무 멀어서 중고차라도 한 대 사야겠어요.", "vietnamese": "Nhà quá xa nên tôi sẽ mua tạm một chiếc xe cũ."}
  ]'::jsonb,
  ARRAY['N + (이)나']::TEXT[],
  ARRAY['choice', 'concession', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N – (이)라도' LIMIT 1),
  '밥이 없으니까 라면___ 먹겠어요.',
  'fill_blank',
  '["이라도", "이나", "이든지", "만"]'::jsonb,
  '이라도',
  'Không có cơm, chọn phương án thứ hai (mì) → 라면이라도.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'N – (이)라도' LIMIT 1),
  '전화가 안 되면 문자___ 하세요.',
  'fill_blank',
  '["라도", "나", "든지", "만"]'::jsonb,
  '라도',
  'Không gọi được, chọn nhắn tin thay thế → 문자라도.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #109: A/V – 든지 A/V – 든지
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 든지 A/V – 든지',
  'deunji deunji',
  'Hoặc là... hoặc là... / Cho dù...',
  'intermediate',
  'choice',
  '1. Thể hiện rằng trong nhiều thứ, có thể chọn một thứ hoặc là chọn thứ nào cũng không thành vấn đề. [hoặc là...hoặc là]. Cấu trúc rút gọn: –든 –든, có dạng N+(이)든지 N+(이)든지. 2. Khi ở dạng 든지 trong cấu trúc lựa chọn, vế trước có chứa đại danh từ nghi vấn. [cho dù...]',
  'A/V + 든지 A/V + 든지 / N + (이)든지 N + (이)든지',
  '[
    {"korean": "비가 오든지 눈이 오든지 내일 행사는 예정대로 진행될 겁니다.", "vietnamese": "Bất kể trời mưa hay tuyết rơi thì ngày mai sự kiện cũng sẽ tiến hành theo lịch trình."},
    {"korean": "냉면이든지 불고기든지 다 괜찮아요.", "vietnamese": "Tôi ăn mì lạnh hay Bulgogi đều được."},
    {"korean": "비가 오든지 안 오든지 상관없이 나갈 거예요.", "vietnamese": "Bất kể trời có mưa hay không cũng không sao, tôi vẫn sẽ đi ra ngoài."},
    {"korean": "어디에 살든지 고향을 잊지 마세요.", "vietnamese": "Dù sống ở đâu cũng đừng quên quê hương."},
    {"korean": "뭐 하든지 최선을 다하세요.", "vietnamese": "Dù làm việc gì cũng hãy cố gắng hết sức."}
  ]'::jsonb,
  ARRAY['A/V – 거나', 'N – (이)나']::TEXT[],
  ARRAY['choice', 'regardless', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 든지 A/V – 든지' LIMIT 1),
  '어디에 살___ 고향을 잊지 마세요.',
  'fill_blank',
  '["든지", "거나", "나", "면"]'::jsonb,
  '든지',
  'Dù sống ở đâu (đại từ nghi vấn 어디) → 어디에 살든지.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 든지 A/V – 든지' LIMIT 1),
  '비가 오___ 눈이 오___ 행사는 진행될 거예요.',
  'multiple_choice',
  '["든지/든지", "거나/거나", "나/나", "면/면"]'::jsonb,
  '든지/든지',
  'Bất kể điều kiện nào → 든지...든지.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #110: A/V – 던 N
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 던 N',
  'deon N',
  'Đã từng thường... / Đang... dở',
  'intermediate',
  'retrospective',
  '1. Diễn tả hành động đã thường xuyên xảy ra ở quá khứ nhưng bây giờ đã chấm dứt. Thường đi kèm 여러번, 자주, 가끔, 항상,... [đã từng thường]. 2. Hồi tưởng những sự việc đã bắt đầu xảy ra trong quá khứ nhưng vẫn chưa kết thúc còn dang dở. Thường dùng với 지난달, 지난주, 어제, 아까, 저번에,...',
  'A/V + 던 + N',
  '[
    {"korean": "우리가 자주 가던 식당에 다시 가 보고 싶어요.", "vietnamese": "Tôi muốn đến nhà hàng mà chúng ta đã từng thường hay đến."},
    {"korean": "이 노래는 제가 옛날에 자주 듣던 노래예요.", "vietnamese": "Bài hát này là bài hát ngày trước tôi đã từng thường hay nghe."},
    {"korean": "마시던 커피가 어디에 있어요?", "vietnamese": "Cốc cà phê bạn đang uống dở ở đâu vậy?"},
    {"korean": "아까 제가 마시던 커피를 버렸어요?", "vietnamese": "Bạn đã vứt bỏ cốc cafe mà tôi đã uống dở lúc nãy à?"},
    {"korean": "처음에 한국에 왔을 때 잘 안 들리던 한국어가 요즘에는 잘 들려요.", "vietnamese": "Tiếng Hàn tôi đã từng không thể nghe được khi lần đầu đến Hàn Quốc, gần đây đã nghe được tốt hơn nhiều."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ N', 'A/V – 았/었던 N']::TEXT[],
  ARRAY['retrospective', 'past', 'unfinished', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 던 N' LIMIT 1),
  '아까 마시___ 커피가 어디 있어요?',
  'fill_blank',
  '["던", "ㄴ", "는", "았던"]'::jsonb,
  '던',
  'Cà phê uống dở (chưa xong) → 마시던.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 던 N' LIMIT 1),
  '자주 가___ 식당에 또 가고 싶어요.',
  'fill_blank',
  '["던", "ㄴ", "는", "았던"]'::jsonb,
  '던',
  'Đã từng thường đến (quá khứ lặp lại) → 가던.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #111: A/V – 더라고요
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 더라고요',
  'deorago yo',
  'Tôi thấy rằng...',
  'intermediate',
  'retrospective',
  'Được dùng khi nói lại với một người khác về một sự thật mà bản thân mình mới biết nhờ trải qua một kinh nghiệm trong quá khứ. Dùng cho ngôi số 3. Khi chủ ngữ là ngôi thứ nhất thì không dùng được, trừ trường hợp thể hiện cảm xúc, tâm trạng của chủ ngữ.',
  'A/V + 더라고요',
  '[
    {"korean": "집에 가서 입어 보니까 사이즈가 작더라고요.", "vietnamese": "Về nhà mặc thử tôi mới thấy nó chật."},
    {"korean": "많이 기대하지 않았는데 재미있더라고요.", "vietnamese": "Tôi không mong đợi nhiều nhưng thấy cũng thú vị."},
    {"korean": "한국에서 여행을 해 보니까 한국에는 정말 산이 많더라고요.", "vietnamese": "Đến Hàn Quốc rồi mới thấy Hàn Quốc thực sự có nhiều núi."},
    {"korean": "어제 친구들하고 같이 농구를 했는데 희수 씨가 운동을 정말 잘하더라고요.", "vietnamese": "Hôm qua đi chơi bóng rổ cùng các bạn, tôi thấy bạn Heesu chơi giỏi thật."}
  ]'::jsonb,
  ARRAY['A/V – 던데요', 'A/V – 더군요']::TEXT[],
  ARRAY['retrospective', 'experience', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 더라고요' LIMIT 1),
  '집에 가서 입어 보니까 사이즈가 작___.',
  'fill_blank',
  '["더라고요.", "던데요.", "군요.", "겠어요."]'::jsonb,
  '더라고요.',
  'Kể lại điều tự mình trải nghiệm → 더라고요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 더라고요' LIMIT 1),
  '한국에 가 보니까 정말 산이 많___.',
  'fill_blank',
  '["더라고요.", "던데요.", "군요.", "겠어요."]'::jsonb,
  '더라고요.',
  'Trải nghiệm trực tiếp lần đầu → 더라고요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #112: A/V – 던데요
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 던데요',
  'deondeyo',
  'Tôi thấy... đấy chứ (phản bác nhẹ, ngạc nhiên)',
  'intermediate',
  'retrospective',
  'Diễn tả những điều tương phản với điều người khác nói hoặc diễn tả cảm giác ngạc nhiên trước một sự việc đã xảy ra trong quá khứ. Dùng cho ngôi số 3. Thường dùng trong câu trả lời, có ý phản bác nhẹ.',
  'A/V + 던데요',
  '[
    {"korean": "가: 흐엉 씨가 학생이에요? 나: 아니요, 회사원이던데요.", "vietnamese": "가: Hương là học sinh đúng không? 나: Không, tôi thấy là nhân viên văn phòng đấy chứ."},
    {"korean": "가: 태권도를 배우기가 어렵지요? 나: 아니요, 배워 보니까 생각보다 쉽던데요.", "vietnamese": "가: Học taekwondo khó đúng không? 나: Không, học rồi thì thấy dễ hơn tôi nghĩ."},
    {"korean": "가: 이번 시험 아주 쉬웠지요? 나: 아니요, 저는 지난 시험보다 더 어렵던데요.", "vietnamese": "가: Kỳ thi lần này dễ lắm phải không? 나: Không, tớ thấy còn khó hơn cả lần trước ý."},
    {"korean": "어제는 많이 춥던데 오늘은 따뜻하네요.", "vietnamese": "Hôm qua trời lạnh mà hôm nay lại ấm nhỉ."},
    {"korean": "음식이 맛있던데 사람들이 별로 안 먹었어요.", "vietnamese": "Tôi thấy đồ ăn ngon mà mọi người đã không ăn mấy cả."}
  ]'::jsonb,
  ARRAY['A/V – 더라고요', 'A/V – 더군요']::TEXT[],
  ARRAY['retrospective', 'contrast', 'rebuttal', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 던데요' LIMIT 1),
  '가: 태권도가 어렵지요? 나: 아니요, 생각보다 쉽___.',
  'fill_blank',
  '["던데요.", "더라고요.", "군요.", "겠어요."]'::jsonb,
  '던데요.',
  'Phản bác nhẹ quan điểm đối phương → 던데요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 던데요' LIMIT 1),
  '가: 그 식당 음식이 별로였죠? 나: 아니요, 맛있___.',
  'fill_blank',
  '["던데요.", "더라고요.", "군요.", "겠어요."]'::jsonb,
  '던데요.',
  'Phản bác, tương phản với ý kiến đối phương → 던데요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #113: A/V – 더군요
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 더군요',
  'deogunyo',
  'Tôi thấy rằng... (có cảm thán, ngạc nhiên)',
  'intermediate',
  'retrospective',
  'Được dùng khi nói lại với một người khác về một sự thật mà bản thân mình mới biết nhờ trải qua một kinh nghiệm trong quá khứ, kèm theo sự ngạc nhiên. Dùng cho ngôi số 3. Cách dùng khá giống cấu trúc 더라고요, tuy nhiên có thêm mức độ cảm thán.',
  'A/V + 더군요 / A/V + 더군 (văn nói thân mật)',
  '[
    {"korean": "그 사람은 언제나 자기 생각만 하더군요.", "vietnamese": "Tôi thấy rằng người đó lúc nào cũng chỉ nghĩ đến bản thân mình thôi."},
    {"korean": "그녀는 좋은 아내더군요.", "vietnamese": "Tôi thấy cô ấy là một người vợ tốt."},
    {"korean": "아버지는 화가 많이 나셨더군요.", "vietnamese": "Tôi thấy ba đã giận lắm đó."},
    {"korean": "모든 것이 변해서 좀 낯설더군요.", "vietnamese": "Tất cả mọi thứ đều thay đổi nên tôi thấy hơi lạ lẫm."},
    {"korean": "수지가 못 본 사이에 많이 컸더군요.", "vietnamese": "Trong khoảng thời gian không gặp Suzy, tôi thấy cô ấy đã lớn hơn nhiều nhỉ."}
  ]'::jsonb,
  ARRAY['A/V – 더라고요', 'A/V – 던데요']::TEXT[],
  ARRAY['retrospective', 'exclamation', 'surprise', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 더군요' LIMIT 1),
  '고향에 가 보니까 모든 것이 변해서 낯설___.',
  'fill_blank',
  '["더군요.", "더라고요.", "던데요.", "겠어요."]'::jsonb,
  '더군요.',
  'Kể lại kèm cảm thán ngạc nhiên → 더군요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 더군요' LIMIT 1),
  '수지가 못 본 사이에 많이 컸___.',
  'fill_blank',
  '["더군요.", "더라고요.", "던데요.", "겠어요."]'::jsonb,
  '더군요.',
  'Quan sát và cảm thán → 더군요.',
  'medium'
);
