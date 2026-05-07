-- Migration 066: Insert TOPIK grammar patterns #180-190 (Advanced level)
-- Ngữ pháp TOPIK #180-190 (Cao cấp) - Note: using TOPIK II temporarily, will update to TOPIK III in migration 067

-- ═══════════════════════════════════════════════════════════════════════════════
-- #180: N – (으)로 인해서
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – (으)로 인해서',
  'euro inhaeseo',
  'Do, nhờ, bởi',
  'advanced',
  'cause',
  'Diễn tả nguyên nhân hay lý do của một tình trạng nào đó. Chủ yếu dùng trong văn viết hoặc các văn phong trang trọng như báo cáo, phát biểu. Có thể danh từ hoá mệnh đề ở dạng (으)ㅁ으로 인해서 và có thể lược bỏ 인해서.',
  'N + (으)로 인해서 / A/V + (으)ㅁ으로 인해서',
  '[
    {"korean": "환경오염으로 인해서 자연생태계가 위협을 받고 있습니다.", "vietnamese": "Hệ sinh thái tự nhiên bị đe dọa do ô nhiễm môi trường."},
    {"korean": "폭우로 인해서 등산객 한 명이 실종되었다고 들었어요.", "vietnamese": "Tôi nghe nói có một khách leo núi bị mất tích do trận mưa lớn."},
    {"korean": "처음에는 고혈압으로 인한 두통이 아닌가 했어요.", "vietnamese": "Lúc đầu, tôi tự hỏi đau đầu không biết có phải do huyết áp cao hay không."},
    {"korean": "그 사람은 오랜 병으로 인해 몸이 약해졌어요.", "vietnamese": "Người đó do mắc bệnh lâu nên cơ thể đã trở nên yếu đi."},
    {"korean": "해마다 교통사고로 인해 많은 사람이 목숨을 잃게 됩니다.", "vietnamese": "Hàng năm có nhiều người mất đi mạng sống do tai nạn giao thông."},
    {"korean": "과학 기술의 발전으로 인해 우리의 생활이 편리해졌다.", "vietnamese": "Do sự phát triển của khoa học kỹ thuật, cuộc sống của chúng ta trở nên thuận tiện hơn."},
    {"korean": "지진으로 인해 그 피해가 매우 크다고 합니다.", "vietnamese": "Nghe nói vì trận động đất mà sự thiệt hại đó rất lớn."},
    {"korean": "폭설로 인해 시내 교통이 마비가 되었다고 합니다.", "vietnamese": "Nghe nói vì bão tuyết mà giao thông trong thành phố đã bị tê liệt."},
    {"korean": "요즘 여기저기에서 음주로 인한 교통사고가 발생하고 있습니다.", "vietnamese": "Gần đây ở nhiều nơi, tai nạn giao thông xảy ra do việc uống rượu."}
  ]'::jsonb,
  ARRAY['N 때문에', 'N – (으)로 말미암아', 'N – (으)로 해서']::TEXT[],
  ARRAY['cause', 'formal', 'written', 'reason', 'topik3', 'advanced']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '환경오염__ 자연생태계가 위협을 받고 있습니다.', 'fill_blank', '["으로 인해서", "에 비해서", "에 따라서", "을 통해서"]'::jsonb, 0,
  'Nguyên nhân trang trọng: 환경오염으로 인해서.'
FROM public.grammar_patterns WHERE pattern = 'N – (으)로 인해서' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '과학 기술의 발전__ 우리의 생활이 편리해졌다.', 'fill_blank', '["으로 인해", "에 비해", "에 따라", "로써"]'::jsonb, 0,
  'Do sự phát triển của khoa học kỹ thuật → 발전으로 인해.'
FROM public.grammar_patterns WHERE pattern = 'N – (으)로 인해서' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #181: V – 는 통에
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 는 통에',
  'neun tonge',
  'Do, vì, tại vì... nên...',
  'advanced',
  'cause',
  'Diễn tả nguyên nhân trong một hoàn cảnh lộn xộn hoặc phức tạp dẫn tới kết quả không tốt, tiêu cực. Vế sau không dùng mệnh lệnh. Còn được sử dụng đứng sau một số danh từ như 전쟁 통에, 난리 통에.',
  'V + 는 통에 / N + 통에',
  '[
    {"korean": "이 책은 전쟁 통에 아들을 잃어버린 어머니에 대한 이야기예요.", "vietnamese": "Cuốn sách này là câu chuyện về người mẹ đã mất con trai do chiến tranh."},
    {"korean": "아이가 자꾸 조르는 통에 장난감을 안 사 줄 수가 없었어요.", "vietnamese": "Tôi không thể không mua đồ chơi vì tụi nhỏ cứ nài nỉ."},
    {"korean": "지하철을 잘못 타는 통에 반대 방향으로 한참을 갔어요.", "vietnamese": "Tôi đã đi theo hướng ngược lại một lúc lâu vì lên nhầm chuyến tàu điện ngầm."},
    {"korean": "사람들이 옆에서 하도 떠드는 통에 무슨 말인지 하나도 못 들었어요.", "vietnamese": "Do những người bên cạnh làm ồn quá nên tôi đã không thể nghe được một lời nào cả."},
    {"korean": "그 사람은 전쟁 통에 다리를 다쳤다.", "vietnamese": "Người đó vì chiến tranh nên chân đã bị thương."},
    {"korean": "현관 벨 소리가 나는 통에 잠에서 깼어요.", "vietnamese": "Vì chuông cửa reo nên tôi đã tỉnh dậy."},
    {"korean": "아이들이 시끄럽게 우는 통에 전화 통화가 힘들어요.", "vietnamese": "Tại bọn trẻ đang khóc ầm ĩ nên thật khó để nói chuyện qua điện thoại."},
    {"korean": "비가 세차게 쏟아지는 통에 우산을 써도 소용이 없네요.", "vietnamese": "Tại mưa xối xả như thế thì dù có che ô cũng không có ích gì."},
    {"korean": "버스를 잘못 타는 통에 약속에 늦었다.", "vietnamese": "Tại lên nhầm xe bus nên tôi đã bị muộn cuộc hẹn."}
  ]'::jsonb,
  ARRAY['–는 바람에', '–는 탓에', 'N 때문에']::TEXT[],
  ARRAY['cause', 'negative_result', 'chaotic_situation', 'topik3', 'advanced']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '지하철을 잘못 타__ 반대 방향으로 갔어요.', 'fill_blank', '["는 통에", "는 김에", "는 대신에", "도록"]'::jsonb, 0,
  'Hoàn cảnh gây kết quả tiêu cực → 잘못 타는 통에.'
FROM public.grammar_patterns WHERE pattern = 'V – 는 통에' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '아이들이 시끄럽게 우__ 전화 통화가 힘들어요.', 'fill_blank', '["는 통에", "기 마련이라", "는 대로", "고자"]'::jsonb, 0,
  'Trẻ khóc ồn gây khó nói điện thoại → 우는 통에.'
FROM public.grammar_patterns WHERE pattern = 'V – 는 통에' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #182: N – (으)로 말미암아
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – (으)로 말미암아',
  'euro malmiama',
  'Vì, do...',
  'advanced',
  'cause',
  'Thể hiện nguyên nhân hay lý do của sự vật hay hiện tượng ở mệnh đề trước làm xuất hiện một kết quả có phần tiêu cực ở vế sau. Có thể dùng ở dạng (으)로부터 말미암아, 에서 말미암아 hoặc danh từ hoá mệnh đề bằng (으)므로 말미암아.',
  'N + (으)로 말미암아 / A/V + (으)므로 말미암아',
  '[
    {"korean": "환경 파괴로 말미암아 수세기 이내에 세계가 멸망할지도 모른다.", "vietnamese": "Không biết chừng thế giới có thể bị sụp đổ trong vài thế kỷ do sự phá hủy môi trường."},
    {"korean": "전쟁으로 말미암아 문화유산들이 소실되었다.", "vietnamese": "Các di sản văn hóa đã bị tiêu tan do chiến tranh."},
    {"korean": "오존층 파괴로 말미암아 피부암 환자가 증가하고 있다.", "vietnamese": "Do sự phá hủy tầng ozon nên số bệnh nhân bị ung thư da đang tăng lên."},
    {"korean": "그 약의 부작용으로 말미암아 많은 환자들이 고통을 겪고 있다.", "vietnamese": "Do tác dụng phụ của thuốc đó mà nhiều bệnh nhân đang trải qua đau đớn."},
    {"korean": "중동 지역의 정세가 불안함으로 말미암아 유가가 몇 달째 계속 상승하고 있다.", "vietnamese": "Do tình hình bất ổn ở khu vực Trung Đông mà giá dầu đã liên tục tăng mấy tháng liền."},
    {"korean": "근무여건이 열악함으로 말미암아 많은 근로자들이 그 일을 그만두었다.", "vietnamese": "Do điều kiện làm việc khắc nghiệt mà nhiều người lao động đã nghỉ việc."},
    {"korean": "음주 운전으로 말미암아 운전자가 사망하는 사고가 발생했다.", "vietnamese": "Xảy ra vụ tai nạn tài xế tử vong do say rượu lái xe."},
    {"korean": "코로나 19로 말미암아 많은 사람들이 큰 불편을 겪고 있다.", "vietnamese": "Do Covid 19 mà nhiều người đang gặp phải sự bất tiện lớn."}
  ]'::jsonb,
  ARRAY['N – (으)로 인해서', 'N 때문에', 'N – (으)로 해서']::TEXT[],
  ARRAY['cause', 'formal', 'negative_result', 'written', 'topik3', 'advanced']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '전쟁__ 문화유산들이 소실되었다.', 'fill_blank', '["으로 말미암아", "에 비해서", "을 통해서", "에 따라"]'::jsonb, 0,
  'Nguyên nhân tiêu cực trang trọng → 전쟁으로 말미암아.'
FROM public.grammar_patterns WHERE pattern = 'N – (으)로 말미암아' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '오존층 파괴__ 피부암 환자가 증가하고 있다.', 'fill_blank', '["로 말미암아", "에다가", "만큼", "로써"]'::jsonb, 0,
  'Do sự phá hủy tầng ozon → 파괴로 말미암아.'
FROM public.grammar_patterns WHERE pattern = 'N – (으)로 말미암아' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #183: N – (으)로 해서
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N – (으)로 해서',
  'euro haeseo',
  'Vì, do, tại... / đi qua...',
  'advanced',
  'cause',
  'Thể hiện nguyên nhân hay lý do danh từ vế trước dẫn đến kết quả tiêu cực. Có thể danh từ hoá mệnh đề ở dạng (으)ㅁ으로 해서. Ngoài ra dùng với động từ chuyển động mang nghĩa nhấn mạnh đi qua.',
  'N + (으)로 해서 / A/V + (으)ㅁ으로 해서',
  '[
    {"korean": "그 일로 해서 그도 정신 차렸을 거예요.", "vietnamese": "Vì việc đó mà anh ấy cũng đã tỉnh táo lại."},
    {"korean": "네가 거짓말을 함으로 해서 얼마나 많은 일들이 벌어졌는가를 봐라.", "vietnamese": "Hãy nhìn xem có bao nhiêu việc đã xảy ra vì bạn nói dối."},
    {"korean": "시내로 해서 길이 막혀요.", "vietnamese": "Vì là nội thành nên đường tắc."},
    {"korean": "시내로 해서 가는 것이 빠릅니다.", "vietnamese": "Đi qua trung tâm thành phố sẽ nhanh hơn."}
  ]'::jsonb,
  ARRAY['N – (으)로 인해서', 'N – (으)로 말미암아', 'N 때문에']::TEXT[],
  ARRAY['cause', 'route', 'reason', 'negative_result', 'topik3', 'advanced']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그 일__ 그도 정신 차렸을 거예요.', 'fill_blank', '["로 해서", "에 비해서", "를 통해서", "에다가"]'::jsonb, 0,
  'Vì việc đó → 그 일로 해서.'
FROM public.grammar_patterns WHERE pattern = 'N – (으)로 해서' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '시내__ 가는 것이 빠릅니다.', 'fill_blank', '["로 해서", "에 의해", "에 따라", "만큼"]'::jsonb, 0,
  'Đi qua trung tâm thành phố → 시내로 해서.'
FROM public.grammar_patterns WHERE pattern = 'N – (으)로 해서' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #184: A/V – 느니만큼
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 느니만큼',
  'neunimankeum',
  'Bởi vì... nên...',
  'advanced',
  'reason_basis',
  'Công nhận sự thật ở vế trước và căn cứ vào mức độ của sự thật đó để đưa ra một đề nghị, phán đoán, mệnh lệnh hoặc yêu cầu. Với danh từ dùng N + (이)니만큼.',
  'A/V + 느니만큼 / N + (이)니만큼',
  '[
    {"korean": "창덕궁이 세계 문화유산으로 등재되었느니만큼 관광객들이 많아질 것이다.", "vietnamese": "Bởi vì cung Changdeok được công nhận là di sản văn hóa thế giới nên sẽ có nhiều khách du lịch."},
    {"korean": "날씨가 추우니만큼 밖에 나가지 말고 집에서 쉬자.", "vietnamese": "Trời lạnh nên đừng ra ngoài mà ở nhà nghỉ ngơi thôi."},
    {"korean": "어렵게 유학을 가느니만큼 더 열심히 해야지요.", "vietnamese": "Vì khó khăn lắm mới đi du học được nên càng phải chăm chỉ hơn chứ."},
    {"korean": "최선을 다했으니만큼 좋은 결과가 있을 거라고 믿어요.", "vietnamese": "Vì đã cố gắng hết sức nên tôi tin rằng kết quả sẽ tốt thôi."},
    {"korean": "좋은 재료로 정성을 다해 만들었으니만큼 더 맛있을 거예요.", "vietnamese": "Bởi vì đã làm bằng nguyên liệu tốt với tất cả sự chân thành nên sẽ ngon hơn."},
    {"korean": "오랜만에 만났으니만큼 할 얘기도 많을 것 같습니다.", "vietnamese": "Lâu lắm rồi mới gặp nên có vẻ như có nhiều chuyện để nói."},
    {"korean": "회사의 중요한 행사니만큼 직원들 모두 적극 참여해 주십시오.", "vietnamese": "Vì là sự kiện quan trọng của công ty nên tất cả nhân viên hãy tham gia tích cực."},
    {"korean": "중요한 발표니만큼 준비를 철저하게 해야 돼요.", "vietnamese": "Vì nó là một bài thuyết trình quan trọng nên tôi phải chuẩn bị kỹ lưỡng."}
  ]'::jsonb,
  ARRAY['–는 만큼', '–느니만치', 'N + (이)니만큼']::TEXT[],
  ARRAY['reason_basis', 'judgment', 'command', 'formal', 'topik3', 'advanced']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '날씨가 추우__ 밖에 나가지 말고 집에서 쉬자.', 'fill_blank', '["니만큼", "기로서니", "기에", "는 통에"]'::jsonb, 0,
  'Căn cứ vào sự thật trời lạnh để đề nghị → 추우니만큼.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 느니만큼' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '중요한 발표__ 준비를 철저하게 해야 돼요.', 'fill_blank', '["니만큼", "답시고", "통에", "로써"]'::jsonb, 0,
  'Danh từ + 이니만큼/니만큼, 발표 kết thúc nguyên âm → 발표니만큼.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 느니만큼' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #185: A/V – 느니만치
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 느니만치',
  'neunimanchi',
  'Bởi vì... nên...',
  'advanced',
  'reason_basis',
  'Công nhận sự thật ở vế trước và căn cứ vào mức độ của sự thật đó để đưa ra một đề nghị, phán đoán, mệnh lệnh hoặc yêu cầu. Có thể thay thế bằng cấu trúc 느니만큼.',
  'A/V + 느니만치 / N + (이)니만치',
  '[
    {"korean": "그는 한국학과를 졸업했으니만치 은행이 그의 기질에 맞지 않을지도 모른다.", "vietnamese": "Anh ấy tốt nghiệp khoa Hàn Quốc nên không biết chừng ngân hàng không phù hợp với khí chất của anh ấy."},
    {"korean": "아직 학생이니만큼 열심히 공부하세요.", "vietnamese": "Bạn vẫn còn là học sinh nên hãy học hành chăm chỉ nhé."},
    {"korean": "다 같이 기숙사 생활을 하느니만치 각자가 약간의 불편을 감수해야 한다.", "vietnamese": "Tất cả cùng nhau sinh hoạt chung trong ký túc xá nên mỗi người phải chấp nhận một chút bất tiện."},
    {"korean": "앞으로 지속적인 물가 상승이 예상되느니만치 아껴 쓰면서 이에 대비해야겠다.", "vietnamese": "Tới đây việc giá cả leo thang được dự đoán sẽ kéo dài nên phải tiết kiệm và chuẩn bị đối phó."},
    {"korean": "이 일이 해결되려면 상당한 시간이 걸리느니만치 느긋하게 기다리는 것이 필요하다.", "vietnamese": "Việc này nếu muốn được giải quyết sẽ tốn khá nhiều thời gian nên cần chờ đợi một cách thong thả."}
  ]'::jsonb,
  ARRAY['–느니만큼', '–는 만치', '–는 만큼']::TEXT[],
  ARRAY['reason_basis', 'judgment', 'formal', 'topik3', 'advanced']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '기숙사 생활을 하__ 약간의 불편을 감수해야 한다.', 'fill_blank', '["느니만치", "기로서니", "는 통에", "답시고"]'::jsonb, 0,
  'Căn cứ vào việc cùng sống ký túc xá → 하느니만치.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 느니만치' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '상당한 시간이 걸리__ 느긋하게 기다리는 것이 필요하다.', 'fill_blank', '["느니만치", "기에 망정이지", "는답시고", "로 해서"]'::jsonb, 0,
  'Căn cứ vào việc tốn thời gian → 걸리느니만치.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 느니만치' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #186: A/V – (으)ㄴ/는 이상
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ/는 이상',
  'eun/neun isang',
  'Một khi mà..., trong tình huống mà...',
  'advanced',
  'condition',
  'Nội dung của mệnh đề trước đã được quyết định hoặc chắc chắn, nên nội dung của mệnh đề sau là rõ ràng hoặc hiển nhiên.',
  'A + (으)ㄴ 이상 / V + 는 이상 / V + (으)ㄴ 이상 / N + 인 이상',
  '[
    {"korean": "코로나19가 사라지지 않는 이상 밖에 나갈 때 마스크를 착용해야 해요.", "vietnamese": "Một khi mà Covid-19 chưa biến mất thì bạn phải đeo khẩu trang khi ra ngoài."},
    {"korean": "수강 신청자가 이렇게 적은 이상 폐강을 할 수밖에 없어요.", "vietnamese": "Trong tình huống số lượng người đăng kí học ít như thế này thì không còn cách nào khác ngoài việc hủy môn học."},
    {"korean": "약속을 한 이상 약속을 지켜야 한다.", "vietnamese": "Một khi đã hứa thì phải giữ lời."},
    {"korean": "살아있는 이상 일을 해야 한다.", "vietnamese": "Một khi đã sống thì phải làm việc."},
    {"korean": "술과 담배를 끊지 않는 이상 건강이 좋아지기 어렵다.", "vietnamese": "Một khi không cai rượu và thuốc lá thì sức khỏe khó mà cải thiện được."},
    {"korean": "이렇게 눈이 계속 내리는 이상 비행기 결항이 불가피할 것 같습니다.", "vietnamese": "Nếu tuyết cứ liên tục rơi như thế này thì việc hủy chuyến bay là điều không thể tránh khỏi."},
    {"korean": "아이에게 약속한 이상 그 약속은 꼭 지켜야 돼요.", "vietnamese": "Một khi đã hứa với trẻ con thì nhất định phải thực hiện lời hứa đó."},
    {"korean": "여기까지 온 이상 포기하지 말고 열심히 하세요.", "vietnamese": "Một khi đã đi đến tận đây rồi thì đừng bỏ cuộc mà hãy làm chăm chỉ."},
    {"korean": "저도 이 회사의 직원인 이상 이 행사에 꼭 참여해야 돼요.", "vietnamese": "Nếu đã là nhân viên của công ty thì tôi cũng nhất định phải tham gia sự kiện lần này."}
  ]'::jsonb,
  ARRAY['–는 한', '–다면', '–기 때문에']::TEXT[],
  ARRAY['condition', 'given_fact', 'obligation', 'topik3', 'advanced']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '약속을 한 __ 약속을 지켜야 한다.', 'fill_blank', '["이상", "통에", "답시고", "망정이지"]'::jsonb, 0,
  'Một khi đã hứa → 약속을 한 이상.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 이상' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '이 회사의 직원__ 이 행사에 꼭 참여해야 돼요.', 'fill_blank', '["인 이상", "인 통에", "인답시고", "으로써"]'::jsonb, 0,
  'Danh từ + 인 이상 → 직원인 이상.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 이상' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #187: A/V – 기로서니
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 기로서니',
  'giroseoni',
  'Mặc dù vì... nhưng...',
  'advanced',
  'concession',
  'Người nói công nhận nội dung của vế trước, nhưng nhấn mạnh mệnh đề trước không đủ làm lý do hoặc điều kiện để hành động hoặc trạng thái ở mệnh đề sau xảy ra. Vế trước quá khứ chia ở 았/었기로서니. Thường đi kèm với 아무리.',
  'A/V + 기로서니 / A/V + 았/었기로서니',
  '[
    {"korean": "아무리 주차할 데가 없기로서니 장애인 주차 공간에 주차하면 안 돼요.", "vietnamese": "Mặc dù vì không có chỗ đậu xe nhưng cũng không được đậu xe trong bãi đỗ xe dành cho người khuyết tật."},
    {"korean": "아무리 시중 약국에서 마스크 품귀현상이 벌어지기로서니 그 현상을 이용해서 마스크를 비싸게 파는 게 정말 너무하네요.", "vietnamese": "Mặc dù xảy ra tình trạng khan hiếm khẩu trang ở hiệu thuốc nhưng lợi dụng điều đó để bán đắt thì thật quá đáng."},
    {"korean": "아무리 화가 났기로서니 서로 인사도 안하면 안 되지요.", "vietnamese": "Mặc dù giận đi chăng nữa nhưng cũng không thể không chào nhau được."},
    {"korean": "아무리 바쁘기로서니 밥 먹을 시간도 없겠어요?", "vietnamese": "Dù bận đến mấy thì cũng không có cả thời gian ăn uống hả?"},
    {"korean": "제가 실수를 좀 했기로서니 회사를 그만두라는 것은 너무 심한 거 아니에요?", "vietnamese": "Dù tôi có phạm sai lầm một chút nhưng bảo nghỉ việc không phải là quá đáng quá hay sao?"},
    {"korean": "아무리 급하기로서니 신호등은 보고 길을 건너야지.", "vietnamese": "Cho dù gấp đến đâu thì cũng phải nhìn đèn giao thông rồi mới qua đường chứ."},
    {"korean": "화가 좀 났기로서니 어떻게 그런 심한 말을 해요?", "vietnamese": "Tức giận thì tức giận nhưng làm sao có thể nói những lời quá đáng như vậy được?"},
    {"korean": "아무리 바쁘기로서니 나와의 약속을 어떻게 잊을 수가 있어?", "vietnamese": "Bận thì bận chứ làm sao anh có thể quên hẹn với tôi?"},
    {"korean": "아무리 시간이 없기로서니 신호를 무시하고 그냥 가면 되겠어요?", "vietnamese": "Dù không có thời gian thì coi thường đèn giao thông rồi cứ đi như vậy mà được à?"},
    {"korean": "아무리 바쁘기로서니 결혼기념일을 잊어버리면 어떻게 해요?", "vietnamese": "Dù có bận đi chăng nữa nhưng quên kỷ niệm ngày cưới thì phải làm sao?"}
  ]'::jsonb,
  ARRAY['–기로서', '–기로선들', '아무리 A/V–아/어도']::TEXT[],
  ARRAY['concession', 'not_enough_reason', 'rhetorical', 'topik3', 'advanced']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '아무리 바쁘__ 밥 먹을 시간도 없겠어요?', 'fill_blank', '["기로서니", "기에 망정이지", "는 통에", "는답시고"]'::jsonb, 0,
  'Công nhận lý do nhưng phủ nhận mức độ hợp lý → 바쁘기로서니.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 기로서니' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '화가 좀 났__ 어떻게 그런 심한 말을 해요?', 'fill_blank', '["기로서니", "으니만큼", "는 통에", "으로써"]'::jsonb, 0,
  'Quá khứ + 기로서니 → 났기로서니.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 기로서니' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #188: A/V – 기에 망정이지
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 기에 망정이지',
  'gie mangjeongiji',
  'May mà... chứ...',
  'advanced',
  'relief',
  'Thể hiện rằng mặc dù một tình huống xấu hổ hoặc khó hiểu đã xảy ra, nhưng nhờ nội dung ở mệnh đề trước mà tình huống đã không kết thúc với kết quả tiêu cực. Vế sau chủ yếu dùng với 았/었을 것이다, 았/었겠다 hoặc (으)ㄹ 뻔하다.',
  'A/V + 기에 망정이지',
  '[
    {"korean": "다행히 이른 아침이라 길에 사람이 없었기에 망정이지 창피했을 거예요.", "vietnamese": "May là sáng sớm nên trên đường không có người chứ không thì đã rất xấu hổ."},
    {"korean": "일찍 출발했기에 망정이지 기차를 놓칠 뻔했어요.", "vietnamese": "May là xuất phát sớm chứ không thì suýt chút nữa là lỡ chuyến tàu rồi."},
    {"korean": "우산을 가져왔기에 망정이지 하마터면 비를 홀딱 맞을 뻔했어요.", "vietnamese": "May mà mang theo ô chứ nếu không thì suýt nữa là ướt sũng vì mưa rồi."},
    {"korean": "구급차가 일찍 도착했기에 망정이지 자칫하면 생명이 위독할 수도 있었어요.", "vietnamese": "May mà xe cấp cứu đến sớm chứ muộn chút nữa là có thể nguy hiểm đến tính mạng rồi."},
    {"korean": "제때 치료했기에 망정이지 몰랐다면 큰 병이 되었을 거예요.", "vietnamese": "May mà đã điều trị kịp thời chứ nếu không biết thì đã thành bệnh nặng rồi."},
    {"korean": "안전벨트를 했기에 망정이지 안 그랬으면 크게 다쳤을 거예요.", "vietnamese": "May mà thắt dây bảo hiểm chứ nếu không thì đã bị thương nặng rồi."},
    {"korean": "일찍 나왔기에 망정이지 5분만 늦었어도 비행기를 놓쳤을 거예요.", "vietnamese": "May mà ra sớm đấy, chứ muộn 5 phút thôi là đã bị lỡ chuyến bay rồi."}
  ]'::jsonb,
  ARRAY['(으)니 망정이지', '아/어서 망정이지', '(으)니까 망정이지']::TEXT[],
  ARRAY['relief', 'fortunate', 'almost_negative', 'topik3', 'advanced']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '일찍 출발했__ 기차를 놓칠 뻔했어요.', 'fill_blank', '["기에 망정이지", "기로서니", "는 통에", "는답시고"]'::jsonb, 0,
  'May mà xuất phát sớm, tránh kết quả xấu → 출발했기에 망정이지.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 기에 망정이지' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '우산을 가져왔__ 비를 홀딱 맞을 뻔했어요.', 'fill_blank', '["기에 망정이지", "기로서니", "느니만큼", "로 해서"]'::jsonb, 0,
  'May mang ô nên tránh bị ướt → 가져왔기에 망정이지.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 기에 망정이지' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #189: V – (느)ㄴ 답시고
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (느)ㄴ 답시고',
  'neun dapsigo',
  'Bảo là... rồi lại/mà lại...',
  'advanced',
  'criticism',
  'Vế trước trở thành lý do, căn cứ của vế sau. Tuy nhiên vế sau thể hiện người nói cho rằng lý do hoặc hành động ở vế trước là không thoả đáng, đánh giá thấp hoặc không chấp nhận lý do cho hành động của người khác.',
  'V + ㄴ/는답시고',
  '[
    {"korean": "민호 씨는 온라인 강의를 듣는답시고 컴퓨터를 사 놓고 게임만 해요.", "vietnamese": "Minho bảo là học online nên mua máy tính mà lại chỉ chơi game thôi."},
    {"korean": "제 친구는 다이어트한답시고 일주일도 안 돼서 폭식했어요.", "vietnamese": "Bạn mình bảo là ăn kiêng mà chưa đầy một tuần đã ăn rất nhiều."},
    {"korean": "친구가 선물이라며 자기가 입던 바지를 주더라고요.", "vietnamese": "Bạn mình bảo là quà mà lại tặng cho mình một chiếc quần mà bạn ấy đã mặc."},
    {"korean": "시험 공부를 한답시고 도서관에 가더니 잠만 자고 왔대요.", "vietnamese": "Anh ấy bảo ôn thi nên đến thư viện, nhưng đến đó rồi thì chỉ ngủ thôi."},
    {"korean": "책을 읽는답시고 책상에 앉더니 졸기만 해요.", "vietnamese": "Bảo đọc sách mà ngồi xuống bàn cái thì chỉ thấy ngủ gật thôi."},
    {"korean": "엄마를 돕는답시고 집안일을 했는데 일거리를 더 만들었다.", "vietnamese": "Bảo giúp mẹ nên đã làm việc nhà nhưng chỉ bày thêm việc ra thôi."}
  ]'::jsonb,
  ARRAY['–(느)ㄴ다고 해서', '–(느)ㄴ다는 이유로']::TEXT[],
  ARRAY['criticism', 'pretext', 'disapproval', 'topik3', 'advanced']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '온라인 강의를 듣__ 컴퓨터를 사 놓고 게임만 해요.', 'fill_blank', '["는답시고", "기에 망정이지", "기로서니", "는 통에"]'::jsonb, 0,
  'Bảo là nghe giảng online nhưng hành động không thoả đáng → 듣는답시고.'
FROM public.grammar_patterns WHERE pattern = 'V – (느)ㄴ 답시고' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '다이어트하__ 일주일도 안 돼서 폭식했어요.', 'fill_blank', '["ㄴ답시고", "기에", "는 통에", "로써"]'::jsonb, 0,
  'Bảo là ăn kiêng nhưng lại ăn quá nhiều → 다이어트한답시고.'
FROM public.grammar_patterns WHERE pattern = 'V – (느)ㄴ 답시고' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #190: A/V – (으)ㅁ으로써
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㅁ으로써',
  'eumeurosseo',
  'Với việc..., bằng việc... nên',
  'advanced',
  'means',
  'Kết quả ở vế sau có được do đã thực hiện hành động nào đó ở vế trước. Thường sử dụng trong văn viết hoặc văn phong trang trọng. Với danh từ dùng N + (으)로써.',
  'A/V + (으)ㅁ으로써 / N + (으)로써',
  '[
    {"korean": "세종대왕이 한글을 창제함으로써 한국의 언어 생활을 편리하게 만들었어요.", "vietnamese": "Việc vua Sejong sáng tạo ra chữ Hangul đã làm cho cuộc sống ngôn ngữ của Hàn Quốc trở nên thuận tiện."},
    {"korean": "모든 국민이 힘을 모음으로써 경제위기를 극복할 수 있었어요.", "vietnamese": "Tất cả mọi người có thể vượt qua khủng hoảng kinh tế bằng cách hợp sức lại với nhau."},
    {"korean": "그녀는 뛰어난 노래 실력으로써 세계를 놀라게 했다.", "vietnamese": "Với khả năng ca hát xuất sắc cô ấy đã làm cả thế giới kinh ngạc."},
    {"korean": "아이들을 매로써 가르쳐서는 안 된다.", "vietnamese": "Việc dạy dỗ trẻ nhỏ bằng đòn roi là không thể được."},
    {"korean": "실력으로써 승부를 겨루어야 한다.", "vietnamese": "Phải phân tranh thắng bại bằng thực lực."},
    {"korean": "온 국민이 노력함으로써 한국 경제가 발전되었다.", "vietnamese": "Nền kinh tế Hàn Quốc đã được phát triển bởi sự nỗ lực của toàn dân."},
    {"korean": "책을 많이 읽음으로써 견문을 넓히고 있습니다.", "vietnamese": "Tôi đang mở rộng kiến thức bằng việc đọc nhiều sách."},
    {"korean": "오늘은 가족이 함께 있음으로써 행복한 하루였다.", "vietnamese": "Hôm nay là một ngày hạnh phúc bởi cả gia đình đã cùng bên nhau."}
  ]'::jsonb,
  ARRAY['N + (으)로써', '–아/어', '–기 때문에']::TEXT[],
  ARRAY['means', 'method', 'formal', 'written', 'topik3', 'advanced']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '한글을 창제함__ 언어 생활을 편리하게 만들었어요.', 'fill_blank', '["으로써", "으로 인해", "으로 말미암아", "으로 해서"]'::jsonb, 0,
  'Bằng việc sáng tạo Hangul → 창제함으로써.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㅁ으로써' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '책을 많이 읽음__ 견문을 넓히고 있습니다.', 'fill_blank', '["으로써", "으로 인해서", "으로 말미암아", "는 통에"]'::jsonb, 0,
  'Bằng việc đọc nhiều sách → 읽음으로써.'
FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㅁ으로써' AND topik_level = 'TOPIK II';
