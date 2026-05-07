-- Migration 071: TOPIK 3-5 Grammar Patterns #220-233
-- Groups: Formal/Written (공식체), Concession (양보), Assumption (가정), Sequence (순차)
-- NOTE: #222 (다손 치더라도) SKIPPED – already inserted in migration 069 as pattern #216

-- ═══════════════════════════════════════════════════════════════════════════════
-- TOPIK III Patterns
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- #221: A/V – 더라도
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 더라도',
  'deorado',
  'Dù, dù rằng... (nhượng bộ giả định)',
  'intermediate',
  'concession',
  'Thể hiện sự nhượng bộ hoặc giả định: dù công nhận sự thật ở vế trước nhưng hành động ở vế sau hoàn toàn không bị ảnh hưởng. Có thể dùng dạng 다고 하더라도 / 다더라도 để nhấn mạnh. Thường đi cùng với 아무리.',
  'V/A + 더라도 / N + (이)라도',
  '[
    {"korean": "코로나 19 백신을 접종했더라도 코로나 19에 감염될 가능성이 있다.", "vietnamese": "Dù có tiêm vacxin Covid-19 thì cũng có khả năng lây nhiễm Covid-19."},
    {"korean": "시험에 모르는 것이 나오더라도 당황해 하지 말고 침착하게 풀어 나가세요.", "vietnamese": "Trong lúc thi dù có cái không biết thì cũng đừng hoảng hốt mà hãy bình tĩnh giải quyết."},
    {"korean": "아무리 못 올 일이 생겼더라도 알려 줘야 할 게 아니냐?", "vietnamese": "Dù có việc gì xảy ra nên không thể đến thì cũng phải báo cho tớ biết chứ."},
    {"korean": "노력을 하더라도 안 되는 일도 있어요.", "vietnamese": "Cũng có những việc cho dù cố gắng nhưng vẫn không thành."},
    {"korean": "그 물건이 비싸더라도 나는 반드시 살 거예요.", "vietnamese": "Món đồ đó cho dù có đắt thì nhất định tôi vẫn sẽ mua."},
    {"korean": "그 일이 힘들더라도 반드시 할 거예요.", "vietnamese": "Việc đó dù có khó khăn đi chăng nữa thì nhất định tôi vẫn sẽ làm."},
    {"korean": "우리 남동생은 아무리 아프더라도 울지 않아요.", "vietnamese": "Em trai tôi dù có đau thế nào đi chăng nữa thì cũng không khóc."}
  ]'::jsonb,
  ARRAY['A/V – 아/어도', 'A/V – (으)ㄹ지라도', 'A/V – (으)ㄹ지언정', 'A/V – (으)ㄴ들']::TEXT[],
  ARRAY['concession', 'even-if', 'assumption', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '시험에 모르는 것이 나오___ 당황하지 말고 침착하게 풀어 나가세요.', 'fill_blank', '["더라도", "기에", "길래", "아/어도"]'::jsonb, 0,
  '가정 양보: 뒤 문장이 독립 → 더라도'
FROM public.grammar_patterns WHERE pattern = 'A/V – 더라도' AND topik_level = 'TOPIK III';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그 물건이 비싸___ 나는 반드시 살 거예요.', 'fill_blank', '["더라도", "기에", "길래", "는 탓에"]'::jsonb, 0,
  '가정 인정+결과 독립 → 비싸더라도'
FROM public.grammar_patterns WHERE pattern = 'A/V – 더라도' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #233: V – 는 대로
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 는 대로',
  'neun daero',
  'Ngay khi... thì... (ngay sau khi hành động trước hoàn thành)',
  'intermediate',
  'sequence',
  'Sau khi hành động ở vế trước kết thúc, hành động ở vế sau diễn ra ngay lập tức. Vế sau thường thể hiện ý chí, mệnh lệnh, cầu khiến, hứa hẹn, kế hoạch hiện tại/tương lai. Vế sau không chia quá khứ. Có thể thay thế bằng 자마자 trong mọi trường hợp.',
  'V + 는 대로',
  '[
    {"korean": "서울에 도착하는 대로 전화할게요.", "vietnamese": "Tôi sẽ gọi điện ngay khi đến Seoul."},
    {"korean": "이 책을 다 읽는 대로 반납해 주시기를 바랍니다.", "vietnamese": "Xin hãy trả lại ngay sau khi đọc hết quyển sách này."},
    {"korean": "아침에 일어나는 대로 회사로 나오세요.", "vietnamese": "Hãy đến công ty ngay sau khi thức dậy buổi sáng."},
    {"korean": "그 사람을 찾는 대로 연락해 줄게요.", "vietnamese": "Tôi sẽ liên lạc ngay khi tìm thấy người đó."},
    {"korean": "돈을 모으는 대로 여행을 떠날 거예요.", "vietnamese": "Tôi sẽ đi du lịch ngay khi gom đủ tiền."},
    {"korean": "유리 씨 시험이 끝나는 대로 같이 놀러 갑시다.", "vietnamese": "Yu-ri, hãy cùng nhau đi chơi ngay sau khi kết thúc thi nhé."}
  ]'::jsonb,
  ARRAY['V – 자마자', 'V – 기가 무섭게', 'V – 자']::TEXT[],
  ARRAY['sequence', 'immediately-after', 'topik3', 'intermediate']::TEXT[],
  'TOPIK III'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '서울에 도착하___ 전화할게요.', 'fill_blank', '["는 대로", "자마자", "기가 무섭게", "자"]'::jsonb, 0,
  '도착 후 즉시 전화 → 도착하는 대로 (미래 계획)'
FROM public.grammar_patterns WHERE pattern = 'V – 는 대로' AND topik_level = 'TOPIK III';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그 사람을 찾___ 연락해 줄게요.', 'fill_blank', '["는 대로", "자마자", "기가 무섭게", "는 통에"]'::jsonb, 0,
  '찾은 즉시 연락, 미래 약속 → 찾는 대로'
FROM public.grammar_patterns WHERE pattern = 'V – 는 대로' AND topik_level = 'TOPIK III';

-- ═══════════════════════════════════════════════════════════════════════════════
-- TOPIK IV Patterns
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- #220: V – (으)ㄴ/는 바
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)ㄴ/는 바',
  'neun ba',
  'Việc/điều... (danh từ phụ thuộc trang trọng)',
  'intermediate',
  'formal',
  'Danh từ phụ thuộc 바 có ý nghĩa giống 것, 일. Thể hiện việc hoặc nội dung được đề cập ở phía trước. Chủ yếu dùng trong văn viết trang trọng. Các dạng phổ biến: 는 바로는, 는 바가 있다/없다, 는 바를, 는 바에 대해, 는 바에 의하면/따르면, 는 바와 같이.',
  'V + (으)ㄴ 바 (hoàn thành) / V + 는 바 (hiện tại)',
  '[
    {"korean": "한 대학 기관이 조사한 바에 따르면 김치가 다이어트에 좋다고 한다.", "vietnamese": "Theo điều tra của một cơ sở đại học, kim chi tốt cho việc giảm cân."},
    {"korean": "정부는 집값 상승에 대해 아직까지 확정된 바가 없다고 전하고 있다.", "vietnamese": "Chính phủ cho biết vẫn chưa xác minh về việc giá nhà tăng."},
    {"korean": "제가 아는 바를 모두 말씀드리도록 하겠습니다.", "vietnamese": "Tôi sẽ nói với anh tất cả những điều tôi biết."},
    {"korean": "한 학기 동안 느낀 바를 이야기해 보세요.", "vietnamese": "Hãy nói về điều bạn cảm nhận được trong suốt một học kì vừa rồi đi."},
    {"korean": "그 사람이 누구를 좋아하는지는 우리가 간섭할 바가 아니다.", "vietnamese": "Người đó thích ai không phải việc để chúng ta can dự vào."},
    {"korean": "이번 사건으로 우리 모두 얻은 바가 많습니다.", "vietnamese": "Qua sự kiện lần này tất cả chúng ta đều đã đạt được nhiều thứ."},
    {"korean": "이번 안건에 대해 각자 생각하시는 바를 자유롭게 말씀해 주시기 바랍니다.", "vietnamese": "Mong mọi người có thể nói một cách thoải mái suy nghĩ của mình về vấn đề thảo luận lần này."}
  ]'::jsonb,
  ARRAY['V + 는 것', 'V + 기', 'A/V – (으)ㅁ']::TEXT[],
  ARRAY['formal', 'written', 'nominalization', 'topik4', 'intermediate']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '조사한 ___ 따르면 김치가 다이어트에 좋다고 한다.', 'fill_blank', '["바에", "것에", "기에", "음에"]'::jsonb, 0,
  '조사 결과 인용: 는 바에 따르면 → 공식 문체'
FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄴ/는 바' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '제가 아는 ___ 모두 말씀드리도록 하겠습니다.', 'fill_blank', '["바를", "것을", "기를", "음을"]'::jsonb, 0,
  '아는 내용 전달: 는 바를 → 격식체'
FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄴ/는 바' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #223: A/V – (으)ㄹ지라도
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ지라도',
  'euljilado',
  'Cho dù... (nhượng bộ nhấn mạnh)',
  'intermediate',
  'concession',
  'Nhấn mạnh: mặc dù vế trước đưa ra tình huống nào đó và công nhận hay giả định điều đó nhưng kết quả vế sau đối lập hay khác với sự mong đợi. Có sắc thái nhấn mạnh hơn -아/어도. 아무리, 비록 có thể được sử dụng cùng.',
  'V + (으)ㄹ지라도 / A + (으)ㄹ지라도 / N + 일지라도',
  '[
    {"korean": "개인 능력이 매우 뛰어날지라도 팀워크에 문제가 있다면 제 실력을 발휘하기는 쉽지 않아요.", "vietnamese": "Cho dù năng lực cá nhân xuất sắc nhưng nếu có vấn đề về làm việc nhóm thì cũng không dễ để phát huy năng lực của mình."},
    {"korean": "몸은 비록 작을지라도 품은 뜻은 크다.", "vietnamese": "Dù cơ thể nhỏ bé nhưng vòng tay (tấm lòng) thật lớn lao."},
    {"korean": "아무리 친한 사이일지라도 그런 부탁은 해서는 안 돼요.", "vietnamese": "Cho dù là mối quan hệ thân thiết đến mấy thì nhờ việc đó cũng không thể được."},
    {"korean": "오늘 밤을 새울지라도 이 책을 다 읽겠어요.", "vietnamese": "Đêm nay cho dù có thức cả đêm thì tôi cũng sẽ đọc hết quyển này."},
    {"korean": "그가 사과를 할지라도 나는 용서를 못해요.", "vietnamese": "Cho dù anh ta có xin lỗi thì tôi cũng không tha thứ đâu."},
    {"korean": "유학 생활이 아무리 힘들지라도 목표를 이루기 위해 끝까지 노력해야 한다.", "vietnamese": "Cho dù cuộc sống du học có khó khăn đi chăng nữa thì cũng phải cố gắng đến cùng để đạt được mục tiêu."},
    {"korean": "비록 돈이 없을지라도 도둑질을 해서는 안 된다.", "vietnamese": "Cho dù không có tiền thì cũng không được làm mấy việc trộm cắp."}
  ]'::jsonb,
  ARRAY['A/V – 더라도', 'A/V – 아/어도', 'A/V – (으)ㄹ지언정', 'A/V – (으)ㄴ들']::TEXT[],
  ARRAY['concession', 'even-if', 'emphasis', 'topik4', 'intermediate']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '아무리 친한 사이___ 그런 부탁은 해서는 안 돼요.', 'fill_blank', '["일지라도", "더라도", "아/어도", "ㄴ들"]'::jsonb, 0,
  '아무리+양보 강조: 일지라도 → 더라도보다 강함'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ지라도' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '비록 돈이 없___ 도둑질을 해서는 안 된다.', 'fill_blank', '["을지라도", "더라도", "아/어도", "ㄴ들"]'::jsonb, 0,
  '비록+양보: 없을지라도 → 도덕적 원칙 강조'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ지라도' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #224: A/V – (으)ㄴ들
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ들',
  'eundeul',
  'Dù có... đi chăng nữa thì... (nhượng bộ giả định)',
  'intermediate',
  'concession',
  'Cho dù nội dung giả định ở vế trước được công nhận thì kết quả xảy ra ở vế sau cũng khác với dự kiến. Có thể thay thế bằng 다 할지라도. Vế sau thường có hàm ý phủ định hoặc tu từ. Thường đi với 아무리.',
  'V + (으)ㄴ들 / A + (으)ㄴ들 / N + 인들',
  '[
    {"korean": "밤마다 야식을 먹으면 매일 규칙적으로 운동을 한들 다이어트에 실패할 거예요.", "vietnamese": "Nếu bạn ăn vào mỗi đêm, dù có tập thể dục đều đặn mỗi ngày đi chăng nữa thì việc giảm cân cũng sẽ thất bại."},
    {"korean": "병원에서 치료를 받은들 약을 제때 안 먹으면 빨리 낫기 힘들어요.", "vietnamese": "Dù có điều trị ở bệnh viện đi chăng nữa nếu không uống thuốc đúng giờ thì rất khó để hồi phục nhanh."},
    {"korean": "그렇게 말을 안 듣는 아이가 부모 말인들 듣겠어?", "vietnamese": "Đứa trẻ không nghe lời như thế thì dù là lời nói của bố mẹ đi chăng nữa thì liệu có nghe không?"},
    {"korean": "아무리 돈이 많은들 건강을 잃으면 무슨 소용이 있겠어?", "vietnamese": "Cho dù có nhiều tiền đi chăng nữa nếu mất đi sức khỏe thì còn có ích gì?"},
    {"korean": "후회를 한들 이미 끝난 일이 달라지겠어?", "vietnamese": "Cho dù có hối hận đi chăng nữa thì những chuyện đã qua có thay đổi không?"},
    {"korean": "학력이 높은들 현장 경험이 부족하면 취직이 어려워요.", "vietnamese": "Cho dù học lực có cao nhưng nếu thiếu kinh nghiệm thực tế thì cũng khó xin việc."},
    {"korean": "몸이 좋은 음식이라고 한들 맛이 없으면 소비자의 선택을 받을 리가 없다.", "vietnamese": "Cho dù là thực phẩm tốt cho sức khỏe, nếu không ngon thì cũng sẽ không nhận được lựa chọn của người tiêu dùng."}
  ]'::jsonb,
  ARRAY['A/V – 더라도', 'A/V – (으)ㄹ지라도', 'A/V – 아/어도']::TEXT[],
  ARRAY['concession', 'even-if', 'rhetorical', 'topik4', 'intermediate']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '아무리 돈이 많___ 건강을 잃으면 무슨 소용이 있겠어?', 'fill_blank', '["은들", "더라도", "아/어도", "ㄹ지라도"]'::jsonb, 0,
  '아무리+수사 의문: 많은들 → 뒤 문장 함의 부정'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ들' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '후회를 한___ 이미 끝난 일이 달라지겠어?', 'fill_blank', '["들", "더라도", "봤자", "아/어도"]'::jsonb, 0,
  '한들 → 가정해도 결과 불변, 수사 의문'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ들' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #227: A/V – (느)ㄴ다고 치다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (느)ㄴ다고 치다',
  'neundago chida',
  'Cứ cho là..., cứ tính là... (thừa nhận giả định)',
  'intermediate',
  'assumption',
  'Thể hiện sự thừa nhận, chấp nhận, công nhận là như thế về một hoàn cảnh, tình huống nào đó. Mệnh đề sau thường có sự bác bỏ mệnh đề trước hoặc đưa ra vấn đề nảy sinh nếu người ta thừa nhận mệnh đề trước.',
  'V + (느)ㄴ다고 치다 / A + 다고 치다 / V + (으)ㄹ 거라고 치다',
  '[
    {"korean": "그냥 잊어버렸다고 치고 새로 사는 게 어때요?", "vietnamese": "Cứ cho là quên và mua sách mới đi."},
    {"korean": "좋아요. 그럼 내가 선생님이라고 치고 말해 보세요. 듣고 평가해 줄게요.", "vietnamese": "Được chứ. Vậy thì cứ cho tớ là thầy giáo và nói thử đi. Tớ sẽ nghe và đánh giá cho."},
    {"korean": "내가 지금 그 사람한테 사과한다고 치자. 그래도 그 사람은 화를 풀지 않을 거야.", "vietnamese": "Cứ cho là bây giờ tôi xin lỗi người đó đi nào. Dù vậy người đó sẽ không nguôi giận."},
    {"korean": "이번 수업이 같이 참가 못 해요. 내가 참가한다고 쳐도 인원이 다 차지 않을 것 같은데요.", "vietnamese": "Lớp học lần này mình không thể tham gia được. Cứ cho mình tham gia thì số người có lẽ vẫn không đủ mà."},
    {"korean": "비행기를 탄다고 쳐도 내일 까지는 못 간다.", "vietnamese": "Tôi không thể đến đó vào ngày mai ngay cả khi tôi đi bằng máy bay."}
  ]'::jsonb,
  ARRAY['V – 는 셈 치다', 'A/V – 더라도', 'A/V – (으)ㄹ지라도']::TEXT[],
  ARRAY['assumption', 'hypothetical', 'acceptance', 'topik4', 'intermediate']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그냥 잊어버렸___ 새로 사는 게 어때요?', 'fill_blank', '["다고 치고", "더라도", "ㄴ들", "봤자"]'::jsonb, 0,
  '가정 인정+제안: 잊어버렸다고 치고 → 그 전제로 행동 제안'
FROM public.grammar_patterns WHERE pattern = 'A/V – (느)ㄴ다고 치다' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '내가 선생님이라___ 말해 보세요.', 'fill_blank', '["고 치고", "더라도", "ㄴ들", "봤자"]'::jsonb, 0,
  '역할 가정: 이라고 치고 → 그 조건 하에 행동 요청'
FROM public.grammar_patterns WHERE pattern = 'A/V – (느)ㄴ다고 치다' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #228: V – 는 셈 치다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 는 셈 치다',
  'neun sem chida',
  'Cứ coi như là..., xem như là... (giả định làm tiền đề)',
  'intermediate',
  'assumption',
  'Giả định nội dung ở vế trước qua đó làm tiền đề để thực hiện việc nào đó ở vế sau. Khác với 다고 치다, dạng này mang ý nghĩa "xem như đã xảy ra" để từ đó thực hiện hành động.',
  'V + 는 셈 치다 / V + (으)ㄴ 셈 치다',
  '[
    {"korean": "미래를 위해 투자하는 셈치고 배워 보려고요.", "vietnamese": "Tớ định học coi như là đầu tư cho tương lai."},
    {"korean": "마음은 고맙지만 받은 셈칠 테니까 그냥 넣어 두세요.", "vietnamese": "Mình biết ơn tấm lòng của bạn nhưng mình sẽ coi như đã nhận rồi nên bạn cứ để nó ở đó đi."},
    {"korean": "운동하는 셈치고 나가서 산책이라도 합시다.", "vietnamese": "Đi ra ngoài đi dạo đi, coi như là tập thể dục."},
    {"korean": "그냥 액땜한 셈치세요.", "vietnamese": "Cứ coi như là giải hạn đi."},
    {"korean": "좀 부끄럽긴 하지만 아무도 없는 셈치고 춤을 추기로 했어요.", "vietnamese": "Mặc dù hơi xấu hổ nhưng tôi đã coi như không có ai ở đó rồi quyết định nhảy."},
    {"korean": "불쌍한 사람 도와준 셈치고 잃은 돈은 그만 잊어버려요.", "vietnamese": "Hãy quên số tiền đã bị mất đó đi và coi như là đã giúp đỡ những người bất hạnh."}
  ]'::jsonb,
  ARRAY['A/V – (느)ㄴ다고 치다', 'V + 는 셈이다', 'A/V – 더라도']::TEXT[],
  ARRAY['assumption', 'hypothetical', 'idiomatic', 'topik4', 'intermediate']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '운동하___ 나가서 산책이라도 합시다.', 'fill_blank', '["는 셈치고", "다고 치고", "더라도", "봤자"]'::jsonb, 0,
  '가정 전제+제안: 운동하는 셈치고 → 그렇게 여기고 행동 유도'
FROM public.grammar_patterns WHERE pattern = 'V – 는 셈 치다' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '미래를 위해 투자하___ 배워 보려고요.', 'fill_blank', '["는 셈치고", "다고 치고", "더라도", "ㄴ들"]'::jsonb, 0,
  '행동을 다른 것으로 간주 → 는 셈치고'
FROM public.grammar_patterns WHERE pattern = 'V – 는 셈 치다' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #230: A/V – 아/어봤자
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 아/어봤자',
  'abwassja',
  'Dù có... thì cũng vô ích / Dù thử... thì cũng không được gì',
  'intermediate',
  'concession',
  'Cho dù nội dung giả định ở vế trước được xảy ra thì cũng không có tác dụng, kết quả gì. Ngữ pháp có thể thay thế: 아/어 봐야. Thường dùng trong khẩu ngữ.',
  'V + 아/어봤자 / A + 아/어봤자',
  '[
    {"korean": "그에게 충고해 봤자 소용없어요.", "vietnamese": "Dù có khuyên nhủ anh ta thì cũng vô ích."},
    {"korean": "노력해봤자 그 사람은 따라갈 수 없을 거야.", "vietnamese": "Dù có cố gắng thì người đó cũng không thể đi theo được."},
    {"korean": "얼굴이 아무리 예뻐 봤자 모델이 될 수는 없을 거예요. 자야 씨는 키가 작잖아요.", "vietnamese": "Cho dù mặt có xinh đi nữa thì cũng không làm người mẫu được đâu. Jaya thấp mà."},
    {"korean": "부장님은 내가 솔직하게 말해 봤자 내 말을 믿지 않으실 거예요.", "vietnamese": "Cho dù tôi nói thành thật thì chắc là bố mẹ cũng sẽ không tin lời tôi nói đâu."},
    {"korean": "지금 가 봤자 이미 공연이 끝났을 거예요.", "vietnamese": "Bây giờ có đi thì buổi công diễn cũng đã kết thúc rồi."},
    {"korean": "그 사람에게 물어 봤자 모를 거예요.", "vietnamese": "Có hỏi anh ta thì anh ta cũng không biết đâu."},
    {"korean": "여기서 기다려 봤자 그 사람은 오지 않아요.", "vietnamese": "Có đợi ở đây thì người đó cũng không đến đâu."},
    {"korean": "비가 너무 많이 내려서 우산을 써 봤자 다 젖겠어요.", "vietnamese": "Mưa to quá nên dù có che ô thì chắc cũng ướt hết thôi."}
  ]'::jsonb,
  ARRAY['A/V – 아/어 봐야', 'A/V – (으)ㄴ들', 'V – (으)ㄴ/는댔자']::TEXT[],
  ARRAY['concession', 'futility', 'colloquial', 'topik4', 'intermediate']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그에게 충고해 ___ 소용없어요.', 'fill_blank', '["봤자", "봐야", "봐도", "더라도"]'::jsonb, 0,
  '해도 소용없음: 충고해 봤자 → 결과 없음 강조'
FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어봤자' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '지금 가 ___ 이미 공연이 끝났을 거예요.', 'fill_blank', '["봤자", "봐야", "더라도", "ㄴ들"]'::jsonb, 0,
  '행동해도 결과가 이미 결정됨 → 가 봤자'
FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어봤자' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #231: V – 기가 무섭게
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 기가 무섭게',
  'giga museopge',
  'Xong một cái thì, ngay sau khi (kế tiếp lập tức)',
  'intermediate',
  'sequence',
  'Một hành động gì đó diễn ra liền ngay sau khi hành động ở vế trước kết thúc, thường dùng ở dạng khẩu ngữ. Có thể thay thế bằng -자마자. Dạng tương đương: 기가 바쁘게.',
  'V + 기가 무섭게 / V + 기가 바쁘게',
  '[
    {"korean": "수업이 끝나기가 무섭게 학생들이 학교 식당에 달려가요.", "vietnamese": "Sau khi thầy giáo ra khỏi lớp cái thì học sinh chạy đến nhà ăn ngay."},
    {"korean": "새 영화가 개봉하기가 무섭게 친구들과 같이 극장에 보러 가요.", "vietnamese": "Ngay sau khi phim mới được công chiếu thì tôi cùng các bạn đi đến rạp phim để xem."},
    {"korean": "동생은 용돈 받기가 무섭게 백화점에 쇼핑하러 갔어요.", "vietnamese": "Em trai tôi ngay sau khi nhận tiền tiêu vặt đã đến trung tâm mua sắm để mua đồ."},
    {"korean": "가게 문을 열기가 무섭게 손님들이 들어왔어요.", "vietnamese": "Cửa hàng ngay khi vừa mở cửa đã có rất nhiều khách hàng đi vào trong."},
    {"korean": "수업이 끝나기가 무섭게 학생들이 밖으로 나갔어요.", "vietnamese": "Ngay sau khi lớp học vừa kết thúc học sinh đã ồ ra ngoài."},
    {"korean": "아이한테 밥을 주기가 무섭게 밥을 다 먹었어요.", "vietnamese": "Ngay sau khi tôi dọn cơm cho con bé, nó đã ăn hết ngay lập tức."},
    {"korean": "에릭 씨가 침대에 눕기가 무섭게 잠이 들었어요.", "vietnamese": "Eric ngay sau khi đặt mình lên giường đã chìm vào giấc ngủ."}
  ]'::jsonb,
  ARRAY['V – 자마자', 'V – 는 대로', 'V – 자']::TEXT[],
  ARRAY['sequence', 'immediately-after', 'colloquial', 'topik4', 'intermediate']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '수업이 끝나___ 학생들이 식당에 달려가요.', 'fill_blank', '["기가 무섭게", "자마자", "는 대로", "자"]'::jsonb, 0,
  '즉시 연속: 끝나기가 무섭게 → 구어체, 즉각성 강조'
FROM public.grammar_patterns WHERE pattern = 'V – 기가 무섭게' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '동생은 용돈 받___ 백화점에 쇼핑하러 갔어요.', 'fill_blank', '["기가 무섭게", "자마자", "는 대로", "자"]'::jsonb, 0,
  '받은 직후 즉각 행동 → 받기가 무섭게'
FROM public.grammar_patterns WHERE pattern = 'V – 기가 무섭게' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #232: V – 자
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 자',
  'ja',
  'Ngay khi... thì... (kế tiếp tức thì, văn viết)',
  'intermediate',
  'sequence',
  'Sau khi hành động ở vế trước kết thúc, hành động ở vế sau diễn ra ngay lập tức. 2 vế có tính nhân quả, thường mô tả điều diễn ra tự nhiên. Vế sau không chia mệnh lệnh, cầu khiến và thường chia quá khứ. Hoàn toàn có thể thay thế bằng 자마자, nhưng 자 chủ yếu dùng trong văn viết.',
  'V + 자',
  '[
    {"korean": "버스가 출발하자 사람들은 움직였어요.", "vietnamese": "Ngay khi xe buýt xuất phát thì mọi người di chuyển."},
    {"korean": "비행기 바퀴가 땅에 닿자 승객들이 자리에서 일어났어요.", "vietnamese": "Ngay khi bánh xe máy bay chạm đất thì hành khách đã đứng dậy khỏi chỗ ngồi."},
    {"korean": "집에 오자 잤어요.", "vietnamese": "Tôi đã ngủ ngay sau khi tôi về nhà."},
    {"korean": "엄마가 나가자 아기가 울어요.", "vietnamese": "Mẹ vừa ra ngoài thì em bé đã khóc."},
    {"korean": "너무 피곤해서 집에 오자 잤어요.", "vietnamese": "Tôi mệt quá nên vừa về nhà là đi ngủ ngay."},
    {"korean": "불이 나자 소방차가 왔어요.", "vietnamese": "Xe cứu hỏa đến ngay khi ngọn lửa bùng cháy."},
    {"korean": "수업이 끝나자 학생들은 교실을 나갔어요.", "vietnamese": "Sau khi lớp học kết thúc thì học sinh chạy ra khỏi lớp ngay."}
  ]'::jsonb,
  ARRAY['V – 자마자', 'V – 는 대로', 'V – 기가 무섭게']::TEXT[],
  ARRAY['sequence', 'immediately-after', 'written', 'topik4', 'intermediate']::TEXT[],
  'TOPIK IV'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '버스가 출발하___ 사람들은 움직였어요.', 'fill_blank', '["자", "자마자", "는 대로", "기가 무섭게"]'::jsonb, 0,
  '자연 연쇄, 문어체: 출발하자 → 즉시 다음 행동'
FROM public.grammar_patterns WHERE pattern = 'V – 자' AND topik_level = 'TOPIK IV';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '불이 나___ 소방차가 왔어요.', 'fill_blank', '["자", "자마자", "는 대로", "기가 무섭게"]'::jsonb, 0,
  '사건 발생 후 즉각 결과, 문어체 → 나자'
FROM public.grammar_patterns WHERE pattern = 'V – 자' AND topik_level = 'TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- TOPIK V Patterns
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- #225: A/V – (으)ㄹ 망정
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ 망정',
  'eul mangjeong',
  'Cho dù... nhưng... (nhượng bộ mạnh, văn học)',
  'advanced',
  'concession',
  'Nhấn mạnh sự thật như thế nào đó trong vế sau hoàn toàn khác với suy nghĩ thông thường mặc cho sự thật ở vế trước. Mang sắc thái văn học, trang trọng.',
  'V + (으)ㄹ 망정 / A + (으)ㄹ 망정',
  '[
    {"korean": "평생 혼자 살망정 결혼을 하지는 않겠어요.", "vietnamese": "Cho dù sống một mình cả đời nhưng tôi sẽ không kết hôn."},
    {"korean": "그녀는 비록 예쁠망정 함께 일하기는 힘들어요.", "vietnamese": "Cho dù cô ấy xinh đẹp nhưng làm việc cùng nhau rất khó khăn."},
    {"korean": "내가 가난할망정 1년에 한번은 여행을 간다.", "vietnamese": "Tôi dù nghèo nhưng một năm đi du lịch một lần."},
    {"korean": "저희는 따로 살망정 늘 부모님을 생각합니다.", "vietnamese": "Chúng tôi dù sống riêng nhưng luôn nghĩ đến cha mẹ."},
    {"korean": "비록 임대 아파트에서 살망정 자기용은 있다.", "vietnamese": "Dù sống ở chung cư thuê nhưng lại có xe riêng đấy."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ지언정', 'A/V – 더라도', 'A/V – 아/어도']::TEXT[],
  ARRAY['concession', 'literary', 'contrast', 'topik5', 'advanced']::TEXT[],
  'TOPIK V'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '평생 혼자 살___ 결혼을 하지는 않겠어요.', 'fill_blank', '["망정", "지언정", "더라도", "ㄴ들"]'::jsonb, 0,
  '문학적 양보: 살망정 → 뒤 문장 의지 강조'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 망정' AND topik_level = 'TOPIK V';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '내가 가난할___ 1년에 한번은 여행을 간다.', 'fill_blank', '["망정", "지언정", "더라도", "봤자"]'::jsonb, 0,
  '비록 형편이 어려워도 의지 표현 → 가난할망정'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ 망정' AND topik_level = 'TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #226: V – (으)ㄴ/는댔자
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)ㄴ/는댔자',
  'neundaessja',
  'Cho dù có... thì cũng chẳng được gì (vô ích nhấn mạnh)',
  'advanced',
  'concession',
  'Nhấn mạnh dù có làm gì đó cũng vô ích. Mạnh hơn 봤자, mang sắc thái bất lực hoặc thất vọng rõ rệt hơn.',
  'V + (으)ㄴ댔자 (đã làm) / V + 는댔자 (đang làm)',
  '[
    {"korean": "친구를 만난댔자 심심한 건 마찬가지이다.", "vietnamese": "Cho dù có gặp bạn bè thì cũng chán vậy thôi."},
    {"korean": "냉장고를 열어 본댔자 먹을 것도 없다.", "vietnamese": "Dù có thử mở tủ lạnh thì cũng chẳng có gì ăn được."},
    {"korean": "지금 열심히 공부한댔자 내일 시험을 잘 볼 수 없을 것 같다.", "vietnamese": "Cho dù bây giờ có học hành chăm chỉ thì có lẽ ngày mai cũng không thể thi tốt."},
    {"korean": "아이가 먹는댔자 얼마나 먹겠어요?", "vietnamese": "Cho dù đứa bé có ăn thì cũng sẽ ăn được bao nhiêu?"},
    {"korean": "지금 말한댔자 무슨 소용이 있나요?", "vietnamese": "Bây giờ dù có nói thì có lợi ích gì không?"}
  ]'::jsonb,
  ARRAY['A/V – 아/어봤자', 'A/V – 아/어 봐야', 'A/V – (으)ㄴ들']::TEXT[],
  ARRAY['concession', 'futility', 'emphasis', 'topik5', 'advanced']::TEXT[],
  'TOPIK V'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '친구를 만난___ 심심한 건 마찬가지이다.', 'fill_blank', '["댔자", "봤자", "더라도", "ㄴ들"]'::jsonb, 0,
  '만나도 결과 없음, 강조형 → 만난댔자'
FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄴ/는댔자' AND topik_level = 'TOPIK V';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '지금 말한___ 무슨 소용이 있나요?', 'fill_blank', '["댔자", "봤자", "더라도", "ㄴ들"]'::jsonb, 0,
  '말해도 소용없음 강조 → 말한댔자'
FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄴ/는댔자' AND topik_level = 'TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #229: A/V – (으)ㄹ지언정
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄹ지언정',
  'euljieonfjeong',
  'Dù... thì... (nhượng bộ + phủ định mạnh, văn học)',
  'advanced',
  'concession',
  'Cho dù nội dung giả định ở vế trước được công nhận thì kết quả xảy ra ở vế sau cũng khó được chấp nhận. Vế sau thường dùng hình thái phủ định để phủ nhận. Mang sắc thái văn học, cứng rắn hơn 더라도 và ㄹ지라도.',
  'V + (으)ㄹ지언정 / A + (으)ㄹ지언정 / N + 일지언정',
  '[
    {"korean": "가난할지언정 거짓말은 안 한다.", "vietnamese": "Dù nghèo thì tôi cũng không nói dối."},
    {"korean": "비록 실업자로 지낼지언정 희망은 버릴 수 없어요.", "vietnamese": "Dù có thất nghiệp thì cũng không thể từ bỏ hi vọng được."},
    {"korean": "난 굶어 죽을지언정 다른 사람한테서 빚을 지기는 싫어.", "vietnamese": "Dù có chết đói đi nữa nhưng tôi ghét việc mang nợ người khác."},
    {"korean": "평생 혼자 살지언정 좋아하지도 않는 사람과 결혼하지는 않을 거예요.", "vietnamese": "Dù có sống một mình cả cuộc đời nhưng tôi sẽ không kết hôn với người mà tôi không thích."},
    {"korean": "이념과 사상은 다를지언정 우리가 한 민족이라는 사실에는 변함이 없다.", "vietnamese": "Dù ý niệm và tư tưởng có khác nhau nhưng vẫn không thể thay đổi sự thật rằng chúng ta là một dân tộc."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ지라도', 'A/V – (으)ㄹ 망정', 'A/V – 더라도']::TEXT[],
  ARRAY['concession', 'literary', 'strong-contrast', 'topik5', 'advanced']::TEXT[],
  'TOPIK V'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '가난할___ 거짓말은 안 한다.', 'fill_blank', '["지언정", "지라도", "망정", "더라도"]'::jsonb, 0,
  '강한 의지+양보: 가난할지언정 → 뒤 부정 의지 강조'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ지언정' AND topik_level = 'TOPIK V';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '난 굶어 죽___ 다른 사람한테서 빚을 지기는 싫어.', 'fill_blank', '["을지언정", "더라도", "망정", "ㄴ들"]'::jsonb, 0,
  '극단적 가정+강한 거부: 죽을지언정'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄹ지언정' AND topik_level = 'TOPIK V';
