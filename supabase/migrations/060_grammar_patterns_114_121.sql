-- Migration 060: Insert TOPIK grammar patterns #114-121 (Intermediate level)
-- Ngữ pháp TOPIK #114-121 (Trung cấp)

-- ═══════════════════════════════════════════════════════════════════════════════
-- #114: V – 아/어 버리다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 아/어 버리다',
  'a/eo beorida',
  'Hết rồi, mất rồi, ...rồi (hoàn toàn xong)',
  'intermediate',
  'completion',
  'Diễn tả tính hoàn toàn hoàn thiện về kết quả của một hành động.

Ngoài ra còn có ý nghĩa giải phóng khỏi những nặng nề do việc thực hiện hành động, hay còn lại chút tiếc nuối do kết quả của hành động.',
  'V + 아/어 버리다',
  '[
    {"korean": "돈을 다 써 버렸어요.", "vietnamese": "Tôi đã tiêu hết tiền mất rồi."},
    {"korean": "막내딸도 시집 보내 버리면 섭섭할걸.", "vietnamese": "Con gái út nếu cũng đi lấy chồng thì chắc bạn sẽ buồn lắm."},
    {"korean": "그렇게 마음에 들면 고민하지 말고 그냥 사 버리세요.", "vietnamese": "Nếu bạn thích như vậy thì đừng đắn đo cứ mua đi."},
    {"korean": "다 끝내 버렸어요.", "vietnamese": "Tất cả mọi thứ đã được kết thúc."},
    {"korean": "영화가 벌써 시작해 버렸어요.", "vietnamese": "Bộ phim đã được bắt đầu mất rồi."},
    {"korean": "날씨가 덥고 해서 머리를 짧게 잘라 버렸어요.", "vietnamese": "Trời nóng nên tôi đã cắt tóc ngắn rồi."},
    {"korean": "10분밖에 안 늦었는데 친구는 저를 기다리지 않고 가 버렸어요.", "vietnamese": "Tôi đến muộn chỉ có 10 phút mà bạn tôi không đợi mà bỏ đi mất rồi."}
  ]'::jsonb,
  ARRAY['V – 고 말다', 'V – 아/어 놓다', 'V – 아/어 두다']::TEXT[],
  ARRAY['completion', 'regret', 'relief', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '돈을 다 써 ___어요.', '["버렸", "놓았", "있었", "두었다"]'::jsonb, 0,
  'Tiêu hết tiền (hoàn tất triệt để) → 써 버렸어요.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어 버리다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '친구가 기다리지 않고 가 ___어요.', '["버렸", "놓았", "있었", "두었다"]'::jsonb, 0,
  'Bỏ đi mất (tiếc nuối) → 가 버렸어요.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어 버리다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #115: V – 고 말다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 고 말다',
  'go malda',
  'Cuối cùng thì..., mất rồi (kết quả ngoài ý muốn hoặc sau nỗ lực)',
  'intermediate',
  'completion',
  'Diễn tả một sự tiếc nuối vì một việc nào đó đã xảy ra ngoài ý muốn, hoặc diễn tả một kết quả đạt được sau quá trình phấn đấu vất vả.

Trước –고 말다 thường xuất hiện các từ như 결국, 드디어, 마침내, 끝내,...',
  'V + 고 말다 / V + 고 말았다 (quá khứ) / V + 고 말 거예요 (tương lai)',
  '[
    {"korean": "끝까지 해 보려고 했지만 중간에 포기하고 말았어요.", "vietnamese": "Tôi định sẽ thử làm đến cùng nhưng rốt cuộc giữa chừng đã bỏ cuộc mất rồi."},
    {"korean": "결국은 이혼을 하고 말았어요.", "vietnamese": "Cuối cùng thì tôi đã ly hôn mất rồi."},
    {"korean": "휴대폰을 떨어뜨려서 액정이 깨지고 말았어요.", "vietnamese": "Tôi làm rơi điện thoại nên cường lực bị vỡ mất rồi."},
    {"korean": "열심히 공부했지만 이번 시험에 떨어지고 말았어요.", "vietnamese": "Tôi đã học chăm chỉ nhưng kì thi lần này tôi trượt mất rồi."},
    {"korean": "뛰어갔는데도 지각하고 말았어요.", "vietnamese": "Mặc dù tôi đã chạy nhưng cuối cùng vẫn bị trễ."},
    {"korean": "담배를 많이 피우더니 건강이 나빠지고 말았어요.", "vietnamese": "Vì tôi hút thuốc nhiều nên sức khỏe của tôi trở nên tồi tệ mất rồi."},
    {"korean": "그렇게 며칠 동안 밤을 세워서 일을 하면 병이 나고 말 거예요.", "vietnamese": "Nếu thức trắng đêm mấy ngày làm việc như vậy thì sẽ ốm mất đấy."},
    {"korean": "3년 동안 사귀었던 여자 친구와 결국 헤어지고 말았어요.", "vietnamese": "Đã từng hẹn hò trong suốt 3 năm nhưng rốt cuộc tôi cũng đã chia tay với bạn gái."}
  ]'::jsonb,
  ARRAY['V – 아/어 버리다', '결국', '드디어']::TEXT[],
  ARRAY['completion', 'regret', 'result', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '열심히 공부했지만 결국 시험에 떨어지고 ___어요.', '["말았", "버렸", "있었", "두었다"]'::jsonb, 0,
  'Kết quả tiêu cực ngoài ý muốn → 고 말았어요.'
FROM public.grammar_patterns WHERE pattern = 'V – 고 말다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '뛰어갔는데도 지각하고 ___어요.', '["말았", "버렸", "있었", "놓았"]'::jsonb, 0,
  'Dù cố gắng vẫn trễ → 고 말았어요.'
FROM public.grammar_patterns WHERE pattern = 'V – 고 말다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #116: V – 았/었다가
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 았/었다가',
  'at/eotdaga',
  '...xong rồi thì lại... (hành động đảo ngược sau khi hoàn tất)',
  'intermediate',
  'sequence',
  'Diễn tả sau khi hành động ở mệnh đề trước kết thúc thì hành động ở mệnh đề sau xảy ra. Thường là 2 động từ có nghĩa đối ngược nhau.

Hình thức –았/었 trong –았/었다가 không ngụ ý quá khứ mà diễn tả sự hoàn tất của hành động. Mệnh đề sau có thể kết hợp với mọi thì thể.',
  'V + 았/었다가 (rút gọn: 았/었다)',
  '[
    {"korean": "창문을 닫았다가 열었어요.", "vietnamese": "Tôi đóng cửa sổ rồi lại mở."},
    {"korean": "마트에 갔다 올게요.", "vietnamese": "Tôi đi siêu thị rồi về."},
    {"korean": "치마를 샀다가 사이즈가 작아서 환불했어요.", "vietnamese": "Tôi mua váy nhưng bị chật nên đã trả lại rồi."},
    {"korean": "비행기 표를 예약했다가 갑자기 일이 생겨서 취소했어요.", "vietnamese": "Tôi đã đặt vé máy bay rồi nhưng đột nhiên có việc nên đã hủy vé rồi."},
    {"korean": "코트를 입었다가 벗었어요.", "vietnamese": "Tôi mặc áo khoác và (sau đó) cởi bỏ."},
    {"korean": "불을 껐다가 어두워서 다시 켰어요.", "vietnamese": "Tôi tắt điện nhưng tối quá nên lại bật."},
    {"korean": "일어났다가 졸려서 다시 잤어요.", "vietnamese": "Tôi thức dậy sau đó buồn ngủ lại ngủ tiếp."}
  ]'::jsonb,
  ARRAY['V – 다가', 'V – 았/었던 N']::TEXT[],
  ARRAY['sequence', 'reversal', 'completion', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '창문을 닫___ 다가 다시 열었어요.', '["았", "는", "던", "은"]'::jsonb, 0,
  'Đóng xong rồi mở lại → 닫았다가.'
FROM public.grammar_patterns WHERE pattern = 'V – 았/었다가' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '비행기 표를 예약___ 다가 취소했어요.', '["했", "하는", "하던", "하"]'::jsonb, 0,
  'Đặt vé xong rồi hủy → 예약했다가.'
FROM public.grammar_patterns WHERE pattern = 'V – 았/었다가' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #117: A/V – 았/었던 N
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 았/었던 N',
  'at/eotdeon N',
  'N mà (đã từng)... / N đã... (hồi tưởng quá khứ đã kết thúc)',
  'intermediate',
  'retrospective',
  'Diễn tả sự hồi tưởng sự việc đã xảy ra trong quá khứ và không kéo dài đến hiện tại, hoặc hồi tưởng sự việc xảy ra 1 lần trong quá khứ.

Khi tính từ kết hợp với –았/었던: nghĩa thứ nhất chỉ sự việc ở hiện tại tương phản với quá khứ; nghĩa thứ hai chỉ sự việc quá khứ còn kéo dài đến hiện tại.',
  'V/A + 았/었던 + N',
  '[
    {"korean": "지난번에 만났던 카페에서 만납시다.", "vietnamese": "Gặp nhau ở quán café mà lần trước đã từng gặp nhé."},
    {"korean": "이게 옛날 사람들이 먹었던 음식이다.", "vietnamese": "Đây là món ăn mà ngày trước mọi người đã từng ăn."},
    {"korean": "작년에는 키가 작았던 남 씨가 지금은 키가 커요.", "vietnamese": "Năm ngoái Nam còn thấp mà bây giờ cao thế."},
    {"korean": "어제 점심 때 먹었던 음식 이름이 뭐지요?", "vietnamese": "Tên món ăn chúng ta đã từng ăn trưa hôm qua là gì nhỉ?"},
    {"korean": "작년 여름에 놀러 갔던 곳에 다시 가고 싶어요.", "vietnamese": "Tôi muốn đến nơi mà chúng ta đã từng đến chơi vào mùa hè năm ngoái."},
    {"korean": "이 집은 제가 어렸을 때 살았던 집입니다.", "vietnamese": "Đây là ngôi nhà mà hồi còn nhỏ tôi đã sống."}
  ]'::jsonb,
  ARRAY['A/V – 던 N']::TEXT[],
  ARRAY['retrospective', 'past', 'completed', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '지난번에 만___ 카페에서 만납시다.', '["났던", "나던", "나는", "난"]'::jsonb, 0,
  'Gặp một lần trong quá khứ, đã xong → 만났던.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 았/었던 N' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '작년에는 키가 작___ 남 씨가 지금은 커요.', '["았던", "던", "은", "는"]'::jsonb, 0,
  'Trạng thái quá khứ tương phản hiện tại → 작았던.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 았/었던 N' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #118: A/V – (으)ㄴ/는 편이다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ/는 편이다',
  '(eu)n/neun pyeonida',
  'Vào loại..., thuộc diện...',
  'intermediate',
  'classification',
  'Biểu hiện phân loại thuộc vào một loại nào đó. Không khẳng định tuyệt đối mà mang tính tương đối, so sánh.',
  'V + 는 편이다 (hiện tại) / A + (으)ㄴ 편이다 / V + (으)ㄴ 편이다 (quá khứ)',
  '[
    {"korean": "저는 맵게 먹는 편이에요.", "vietnamese": "Tôi thuộc vào diện ăn cay."},
    {"korean": "하노이의 물가는 베트남의 다른 도시보다 비싼 편이에요.", "vietnamese": "Vật giá ở Hà Nội thuộc diện đắt so với các thành phố khác ở Việt Nam."},
    {"korean": "우리 동네는 다른 지역에 비해서 집값이 조금 싼 편입니다.", "vietnamese": "Khu nhà tôi thuộc dạng hơi rẻ so với khu khác."},
    {"korean": "내 친구는 성격이 좋은 편이에요.", "vietnamese": "Bạn của tôi tính cách thuộc diện tốt đó."},
    {"korean": "저는 운동을 자주 하는 편이에요.", "vietnamese": "Tôi thuộc vào diện thường xuyên tập thể dục."},
    {"korean": "나는 아무거나 잘 먹는 편이에요.", "vietnamese": "Tôi thuộc diện cái gì cũng ăn được."}
  ]'::jsonb,
  ARRAY['A/V – 는 것 같다', '비교적']::TEXT[],
  ARRAY['classification', 'comparison', 'relative', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '저는 매운 음식을 잘 먹는 ___이에요.', '["편", "쪽", "듯", "것"]'::jsonb, 0,
  'Thuộc diện ăn cay giỏi → 먹는 편이에요.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 편이다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '우리 동네는 집값이 조금 싼 ___입니다.', '["편", "쪽", "듯", "것"]'::jsonb, 0,
  'Thuộc dạng rẻ (tương đối) → 싼 편입니다.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 편이다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #119: N – 스럽다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – 스럽다',
  'N – seureobda',
  'Có vẻ như..., mang tính chất... (hậu tố tính từ hóa danh từ)',
  'intermediate',
  'suffix',
  'Có cảm giác hoặc tính chất giống như danh từ đứng trước. Tạo tính từ từ danh từ, mang sắc thái "có vẻ như có tính chất đó". Một số từ tiêu biểu: 고민스럽다, 고통스럽다, 다행스럽다, 만족스럽다, 부담스럽다, 사랑스럽다, 여성스럽다, 짜증스럽다, 혼란스럽다,...',
  'N + 스럽다 → N + 스러운 (định ngữ) / N + 스럽게 (trạng từ)',
  '[
    {"korean": "한국 사람들과 한국어로 자연스럽게 이야기를 할 수 있었으면 좋겠어요.", "vietnamese": "Ước gì tôi có thể nói tiếng Hàn một cách tự nhiên với người Hàn."},
    {"korean": "저는 어른스럽게 보이는 옷을 사고 싶어요.", "vietnamese": "Tôi muốn mua quần áo trông trưởng thành chút."},
    {"korean": "제 친구는 언제나 가족에 대해 자랑스럽게 말해요.", "vietnamese": "Bạn tôi thường nói chuyện về gia đình một cách tự hào."},
    {"korean": "그렇게 하는 것은 바보스러운 행동입니다.", "vietnamese": "Cứ hành động như thế thì thật ngốc nghếch."},
    {"korean": "가: 마이 씨, 웬일로 오늘 치마를 입었어요? 나: 조금 여성스러워 보이고 싶어서요.", "vietnamese": "가: Mai à, sao hôm nay bạn mặc váy vậy? 나: Vì tôi muốn trông nữ tính một chút."}
  ]'::jsonb,
  ARRAY['N – 답다']::TEXT[],
  ARRAY['suffix', 'adjective', 'character', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '그녀는 항상 여성___ 옷을 입어요.', '["스러운", "다운", "같은", "인"]'::jsonb, 0,
  'Có vẻ nữ tính → 여성스러운.'
FROM public.grammar_patterns WHERE pattern = 'N – 스럽다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '자___ 행동하는 것이 중요해요.', '["연스럽게", "연답게", "연같이", "연처럼"]'::jsonb, 0,
  'Hành động tự nhiên → 자연스럽게.'
FROM public.grammar_patterns WHERE pattern = 'N – 스럽다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #120: N – 답다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – 답다',
  'N – dabda',
  'Ra dáng..., xứng là... (mang đầy đủ tính chất của danh từ)',
  'intermediate',
  'suffix',
  'Diễn tả đặc điểm hoặc tính chất đầy đủ của danh từ đó. Danh từ sẽ có phẩm chất, đặc điểm mà đáng ra được như thế. Một số từ tiêu biểu: 신사답다, 전문가답다, 선수답다, 기자답다, 남자답다,...',
  'N + 답다 → N + 다운 (định ngữ) / N + 답게 (trạng từ) / N + 답지 않다 (phủ định)',
  '[
    {"korean": "뚜안 씨는 남자다운 데가 하나도 없는 것 같아요.", "vietnamese": "Toàn dường như không có vẻ nam tính nào."},
    {"korean": "학생은 학생답게 행동해야 해요.", "vietnamese": "Học sinh thì phải hành động ra dáng học sinh chứ."},
    {"korean": "동생에게 그렇게 심한 말을 하는 것은 정말 형답지 않은 행동이야.", "vietnamese": "Nói nặng lời với em như thế không ra dáng đàn anh tí nào."},
    {"korean": "그 회사에는 국내 최고의 회사답게 우수한 직원들이 많이 있습니다.", "vietnamese": "Công ty đó có nhiều nhân viên giỏi, thật đúng là công ty đứng đầu trong nước."},
    {"korean": "회사원은 회사원답게 옷을 입어야지.", "vietnamese": "Nhân viên công ty thì phải mặc cho ra dáng nhân viên chứ."},
    {"korean": "오늘 경기 모습은 세계적인 축구 선수답지가 않네요.", "vietnamese": "Hôm nay anh ta thi đấu chẳng giống một cầu thủ hạng quốc tế chút nào."}
  ]'::jsonb,
  ARRAY['N – 스럽다']::TEXT[],
  ARRAY['suffix', 'adjective', 'character', 'role', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '학생은 학생___ 행동해야 해요.', '["답게", "스럽게", "같이", "처럼"]'::jsonb, 0,
  'Ra dáng học sinh (đầy đủ tính chất) → 학생답게.'
FROM public.grammar_patterns WHERE pattern = 'N – 답다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '그 행동은 형___ 않은 행동이야.', '["답지", "스럽지", "같지", "처럼"]'::jsonb, 0,
  'Không ra dáng đàn anh → 형답지 않다.'
FROM public.grammar_patterns WHERE pattern = 'N – 답다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #121: A/V – 다고요?
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 다고요?',
  'dago yo?',
  'Bạn vừa nói là...? Gì cơ? (xác nhận lại điều chưa nghe rõ hoặc khó tin)',
  'intermediate',
  'indirect_speech',
  'Người nói nhắc lại lời của đối phương với mục đích xác nhận về điều người nói chưa nghe được rõ hoặc nội dung được nghe khó có thể tin là sự thực.

Có thể dùng dạng dẫn: 자고요? / (으)라고요? / 냐고요? Tùy theo loại câu mà có hình thức trích dẫn khác nhau.',
  'A/V + 다고요? (câu trần thuật) / V + 자고요? (câu đề nghị) / V + (으)라고요? (câu mệnh lệnh)',
  '[
    {"korean": "가: 선생님이 왔어요. 나: 누가 왔다고요?", "vietnamese": "가: Cô giáo đã đến rồi. 나: Bạn nói ai đến cơ?"},
    {"korean": "가: 요즘 날씬해 보이네요. 나: 다이어트했다고요? 저는 살이 3kg이나 쪘어요.", "vietnamese": "가: Dạo này trông bạn gầy nhỉ. 나: Bạn vừa hỏi tôi ăn kiêng á? Tôi tăng tận 3kg đó."},
    {"korean": "가: 우리 오늘 공원에 갈까요? 나: 공원에 가자고요?", "vietnamese": "가: Chúng mình đi công viên nhé? 나: Bạn rủ mình đi công viên á?"},
    {"korean": "가: 회사를 그만두었어요. 나: 뭐라고요?", "vietnamese": "가: Tôi nghỉ việc rồi. 나: Bạn nói gì cơ?"},
    {"korean": "가: 오늘까지 보고서를 완성하도록 하세요. 나: 오늘까지 완성하라고요?", "vietnamese": "가: Hãy hoàn thành báo cáo muộn nhất vào hôm nay. 나: Anh nói hãy hoàn thiện luôn trong hôm nay ạ?"},
    {"korean": "가: 3시까지 세미나실로 오세요. 나: 어디로 오라고요?", "vietnamese": "가: Trước 3 giờ hãy đến phòng hội thảo nhé. 나: Anh bảo hãy đến đâu cơ?"}
  ]'::jsonb,
  ARRAY['간접화법', '–다고 하다', '–자고 하다', '–(으)라고 하다']::TEXT[],
  ARRAY['indirect_speech', 'confirmation', 'surprise', 'spoken', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '가: 회사를 그만뒀어요. 나: 뭐___ 요? 다시 한번 말해 주세요.', '["라고", "라는", "라던", "라면"]'::jsonb, 0,
  'Xác nhận lại điều khó tin → 뭐라고요?'
FROM public.grammar_patterns WHERE pattern = 'A/V – 다고요?' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, options, correct_answer, explanation)
SELECT id, '가: 공원에 가자. 나: 공원에 가___ 요?', '["자고", "다고", "라고", "냐고"]'::jsonb, 0,
  'Câu đề nghị 가자 → trích dẫn 가자고요?'
FROM public.grammar_patterns WHERE pattern = 'A/V – 다고요?' AND topik_level = 'TOPIK II';
