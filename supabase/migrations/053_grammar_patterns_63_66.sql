-- Migration 053: Insert TOPIK grammar patterns #63-66
-- Ngữ pháp TOPIK #63-66

-- ═══════════════════════════════════════════════════════════════════════════════
-- #63: A/V – 네요 [....thế!, ...đấy!]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 네요',
  'neyo',
  '....thế!, ...đấy!',
  'beginner',
  'ending',
  'Vĩ tố kết thúc: Thể hiện sự cảm thán hay ngạc nhiên trước việc gì đó hoàn toàn mới hoặc diễn tả sự đồng tình với ai đó. Chủ yếu sử dụng trong văn nói. Chỉ dùng khi người nói trực tiếp trải nghiệm.',
  'A/V + 네요 / N + 이네요',
  '[
    {"korean": "네, 춥네요.", "vietnamese": "Ừ, đẹp thật đấy!"},
    {"korean": "한국말을 정말 잘하시네요.", "vietnamese": "Bạn nói tiếng hàn hay thật đấy."},
    {"korean": "가방이 아주 예쁘네요.", "vietnamese": "Túi xách đẹp quá."},
    {"korean": "밖에 눈이 정말 많이 왔네요.", "vietnamese": "Bên ngoài tuyết đã rơi nhiều thế nhỉ."},
    {"korean": "친절하네요.", "vietnamese": "Anh ấy tốt bụng thật đấy."}
  ]'::jsonb,
  ARRAY['A – 군요, V – 는군요']::TEXT[],
  ARRAY['ending', 'exclamation', 'agreement', 'spoken', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 네요' LIMIT 1),
  '한국말을 정말 잘하시___.',
  'fill_blank',
  '["네요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '네요.',
  'Giỏi thật → 잘하시네요.',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 네요' LIMIT 1),
  '가방이 아주 예쁘___.',
  'fill_blank',
  '["네요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '네요.',
  'Đẹp quá → 예쁘네요.',
  'easy'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #64: A/V – (으)ㄴ/는지 알다 / 모르다 [Có biết là.../không biết là ...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ/는지 알다 / 모르다',
  '(eu)n/neunji alda / moruda',
  'Có biết là.../không biết là ...',
  'intermediate',
  'knowledge',
  'Diễn tả việc biết hay không biết về thứ gì đó; hoặc cách để làm thứ nào đó dưới một dạng câu hỏi gián tiếp. Bằng cách này làm giảm gánh nặng phải cung cấp thông tin từ phía người nghe, do đó tạo tính lịch sự hơn. Thường được sử dụng cùng với từ để hỏi ở phía trước như 누구, 어디, 어떻게, 왜, 언제, 뭐, 얼마나.',
  'V(qua khứ) + (으)ㄴ지 알다/모르다 / V(hiện tại) + 는지 알다/모르다 / V(tương lai) + (으)ㄹ지 알다/모르다',
  '[
    {"korean": "졸업국관리사무소에 어떻게 가는지 아세요?", "vietnamese": "Bạn có biết cách đi đến cục xuất nhập cảnh không?"},
    {"korean": "집들이에 무슨 음식을 만들어야 하는지 모르겠어요.", "vietnamese": "Tôi không biết nên làm đồ ăn gì vào buổi tiệc tân gia nữa."},
    {"korean": "제가 왜 걱정하는지 몰라요?", "vietnamese": "Anh không biết tại sao em lo lắng như thế này sao?"},
    {"korean": "이 사람 누구인지 아세요?", "vietnamese": "Bạn biết người này là ai không?"},
    {"korean": "학생들이 거짓말을 해서 선생님이 얼마나 화가 났는지 몰라요.", "vietnamese": "Vì các em học sinh đã nói dối nên không biết thầy giáo đã giận dữ đến như thế nào."},
    {"korean": "민수 씨는 무슨 음식을 좋아하는지 몰라요.", "vietnamese": "Tôi không biết Minsoo thích món gì."},
    {"korean": "오늘 왜 이렇게 머리가 아푼지 모르겠어요.", "vietnamese": "Không biết sao hôm nay lại đau đầu thế nhỉ?"},
    {"korean": "왜 란 씨는 한국어를 공부하는지 알아요?", "vietnamese": "Câu có biết tại sao Lan học tiếng Hàn không?"},
    {"korean": "내일 날씨가 따뜻한지 추운지 알아요?", "vietnamese": "Câu biết ngày mai thời tiết nóng hay lạnh không?"},
    {"korean": "남 씨, 지금 몇 시인지 알아? 왜 계속 늦어?", "vietnamese": "Nam à, cậu biết bây giờ là mấy giờ không vậy? Sao cậu trễ suốt thế."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는/(으)ㄹ 것 같다', 'A/V – (으)ㄹ까요?']::TEXT[],
  ARRAY['knowledge', 'indirect question', 'polite', 'b1', 'topik2']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는지 알다 / 모르다' LIMIT 1),
  '이 사람 누구인지 알세___.',
  'fill_blank',
  ['["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Biết không → 알세요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는지 알다 / 모르다' LIMIT 1),
  '무슨 음식을 좋아하는지 몰라___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Không biết → 몰라요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #65: V – 는 데에 [cho, đối với...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 는 데에',
  'neun dee',
  'cho, đối với...',
  'intermediate',
  'purpose',
  'Vĩ tố kết thúc: sử dụng trong tình huống hay trường hợp mà dự định làm ở vế trước, lúc này vế sau thường xuất hiện các cụm từ như: 좋다/나쁘다, 효과가 있다/없다, 도움이 되다/안 되다, 필요하다/필요 없다. Có thể giản lược 에 trong 는 데에.',
  'V + 는 데(에) + 좋다/나쁘다/효과가 있다/없다/도움이 되다/안 되다/필요하다/필요 없다',
  '[
    {"korean": "건강을 지키는 데에 담배는 좋지 않아요.", "vietnamese": "Thuốc lá không tốt cho việc giữ gìn sức khỏe."},
    {"korean": "휴식은 피로를 푸는 데에 효과가 있어요.", "vietnamese": "Nghỉ giải lao có ích cho việc giải tỏa mệt mỏi."},
    {"korean": "이 책을 읽는 데 세 시간이 걸렸어요.", "vietnamese": "Tôi dành 3 tiếng cho việc đọc sách."},
    {"korean": "살을 빼는 데 등산이 도움이 된다.", "vietnamese": "Việc leo núi giúp ích cho việc giảm cân."},
    {"korean": "기분 전환을 하는 데에 쇼핑이 최고예요.", "vietnamese": "Mua sắm là tốt nhất cho việc chuyển đổi tâm trạng."}
  ]'::jsonb,
  ARRAY['V – (으)려고', 'V – 기 위해서']::TEXT[],
  ARRAY['purpose', 'effect', 'utility', 'b1', 'topik2']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 는 데에' LIMIT 1),
  '건강을 지키는 데에 담배는 좋지 않아___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Không tốt → 좋지 않아요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 는 데에' LIMIT 1),
  '휴식은 피로를 푸는 데에 효과가 있___.',
  'fill_blank',
  '["요.", "어요.", "습니다.", "습니다."]'::jsonb,
  '요.',
  'Có ích → 효과가 있어요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #66: A/V – 지요? [đúng chứ?, phải chứ?, mà nhỉ?]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 지요?',
  'jiyo?',
  'đúng chứ?, phải chứ?, mà nhỉ?',
  'beginner',
  'confirmation',
  'Sử dụng khi hỏi để xác nhận lại điều mà người nói đã biết trước hoặc người nói tin rằng người nghe đã biết trước và hỏi để tìm sự đồng tình. Chủ yếu được dùng khi nói. N + (이)지요?',
  'A/V + 지요? / N + (이)지요?',
  '[
    {"korean": "제주도가 한국에서 제일 아름다운 섬이지요?", "vietnamese": "Jeju là hòn đảo đẹp nhất HQ đúng chứ?"},
    {"korean": "서울에서 경복궁이 유명하지요?", "vietnamese": "Gyengbokgung nổi tiếng ở Seoul đúng chứ?"},
    {"korean": "그 영화 정말 재미있지요?", "vietnamese": "Bộ phim đó rất hay phải không?"},
    {"korean": "다음달에 한국으로 유학을 갈 거지요?", "vietnamese": "Tháng sau cậu đi du học HQ phải không?"},
    {"korean": "내일 회의가 있지요?", "vietnamese": "Ngày mai có cuộc họp phải không?"},
    {"korean": "이번 처음 베트남에 왔지요?", "vietnamese": "Đây là lần đầu tiên cậu đến Việt Nam phải không?"},
    {"korean": "오늘 날씨가 춥지요?", "vietnamese": "Hôm nay thời tiết lạnh mà nhỉ?"},
    {"korean": "이 옷 정말 예쁘지요?", "vietnamese": "Cái áo này đẹp mà nhỉ?"},
    {"korean": "한국 음식을 먹을 수 있지요?", "vietnamese": "Bạn ăn được đồ Hàn chứ?"},
    {"korean": "학생이지요? 운전기사지요?", "vietnamese": "Cậu là học sinh đúng chứ? Cậu là tài xế đúng chứ?"}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ까요?', 'A/V – 겠어요']::TEXT[],
  ARRAY['confirmation', 'agreement', 'spoken', 'topik1', 'beginner']::TEXT[],
  'TOPIK I'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 지요?' LIMIT 1),
  '제주도가 한국에서 제일 아름다운 섬이지___.',
  'fill_blank',
  '["요?", "어요?", "습니까?", "습니까?"]'::jsonb,
  '요?',
  'Đúng chứ → 섬이지요?',
  'easy'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 지요?' LIMIT 1),
  '서울에서 경복궁이 유명하___.',
  'fill_blank',
  '["지요?", "어요?", "습니까?", "습니까?"]'::jsonb,
  '지요?',
  'Đúng chứ → 유명하지요?',
  'easy'
);
