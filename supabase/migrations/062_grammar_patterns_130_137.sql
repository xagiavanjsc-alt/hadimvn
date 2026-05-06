-- Migration 062: Insert TOPIK grammar patterns #130-137 (Intermediate level)
-- Ngữ pháp TOPIK #130-137 (Trung cấp)

-- ═══════════════════════════════════════════════════════════════════════════════
-- #130: V – 는 김에
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 는 김에',
  'neun gime',
  'Nhân tiện..., nhân cơ hội...',
  'intermediate',
  'opportunity',
  'Diễn tả sự nhân tiện, nhân cơ hội làm việc về trước thì làm luôn việc về sau.',
  'V + 는 김에',
  '[
    {"korean": "세탁을 하는 김에 청소도 할까요?", "vietnamese": "Nhân tiện giặt giũ thì dọn dẹp luôn nhé?"},
    {"korean": "제주도에 출장을 가는 김에 여기 저기 여행할 생각이에요.", "vietnamese": "Nhân tiện đi công tác đảo Jeju tôi định sẽ đi du lịch đây đó."},
    {"korean": "약국에 가는 김에 치약을 사 주세요.", "vietnamese": "Tiện thể đến hiệu thuốc thì hãy mua kem đánh răng nhé."},
    {"korean": "한국어를 공부하는 김에 한국 문화도 공부하고 싶어요.", "vietnamese": "Nhân tiện học tiếng Hàn tôi muốn học cả văn hóa Hàn nữa."},
    {"korean": "밖에 나간 김에 제 부탁 하나만 들어주세요.", "vietnamese": "Tiện thể anh ra ngoài thì cho tôi nhờ 1 chuyện."},
    {"korean": "머리를 감는 김에 샤워도 하세요.", "vietnamese": "Nhân tiện gội đầu thì hãy tắm giặt luôn."},
    {"korean": "가족들이 모두 모인 김에 사진이나 찍어요.", "vietnamese": "Nhân tiện cả gia đình hội họp đã chụp một bức ảnh."}
  ]'::jsonb,
  ARRAY['V – (으)면', 'V – 는 대신']::TEXT[],
  ARRAY['opportunity', 'convenience', 'simultaneous', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '세탁을 하__ 김에 청소도 할까요?', 'fill_blank', '["는", "은", "던", "던데"]'::jsonb, 0,
  'Nhân tiện làm việc A thì làm luôn B → 하는 김에.'
FROM public.grammar_patterns WHERE pattern = 'V – 는 김에' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '약국에 가__ 김에 치약을 사 주세요.', 'fill_blank', '["는", "은", "던", "던데"]'::jsonb, 0,
  'Nhân tiện → 가는 김에.'
FROM public.grammar_patterns WHERE pattern = 'V – 는 김에' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #131: V – (으)ㄹ 만하다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)ㄹ 만하다',
  '(eu)l manhada',
  'Đáng để... / Vẫn còn có thể...',
  'intermediate',
  'value',
  '1. Biểu hiện một hành động nào đó có giá trị để làm, xứng đáng để làm.
2. Biểu hiện một hành động nào đó vẫn còn có giá trị.',
  'V + (으)ㄹ 만하다',
  '[
    {"korean": "가: 볼 만한 드라마를 좀 추천해 주시겠어요? 나: 오징어 게임 어때요?", "vietnamese": "가: Bạn có thể giới thiệu cho mình những bộ phim đáng xem không? 나: Phim trò chơi con mực thì thế nào?"},
    {"korean": "주말에 친구 결혼식이 있는데 입을 만한 옷이 없어서 쇼핑을 가요.", "vietnamese": "Cuối tuần là lễ kết hôn của bạn tôi nhưng tôi không có gì mặc nên sẽ đi mua sắm."},
    {"korean": "영수 씨는 믿을 만한 사람이니까 힘든 일이 있으면 부탁해 보세요.", "vietnamese": "Yeongsu là người đáng tin cậy nên nếu gặp khó khăn, hãy thử nhờ anh ấy giúp."},
    {"korean": "그 학생은 상을 받을 만해요.", "vietnamese": "Em học sinh đó xứng đáng để nhận phần thưởng."},
    {"korean": "가: 새로 개봉한 영화가 재미있다면서요? 나: 네, 정말 볼 만해요. 한번 보세요.", "vietnamese": "가: Nghe nói bộ phim mới khởi chiếu rất hay? 나: Vâng, nó rất đáng để xem. Anh hãy thử xem một lần đi."},
    {"korean": "가: 이 책을 한번 읽어 볼까 하는데 어때요? 나: 교훈적인 이야기가 많아서 읽어 볼 만해요.", "vietnamese": "가: Tôi đang định học thử cuốn sách này một lần, anh thấy sao? 나: Sách này có nhiều bài học giáo huấn nên rất đáng đọc."},
    {"korean": "재활용 센터에 가면 아직 쓸 만한 중고 가전제품이 많이 있습니다.", "vietnamese": "Nếu bạn đi đến trung tâm tái chế sẽ có rất nhiều đồ gia dụng cũ vẫn còn sử dụng được."},
    {"korean": "이 바지가 3년 전에 산 것인데 아직도 입을 만해서 안 버렸어요.", "vietnamese": "Chiếc quần này tôi mua 3 năm trước nhưng giờ vẫn còn mặc được nên tôi chưa bỏ."},
    {"korean": "며칠 전에 만든 음식인데 아직은 먹을 만한 것 같아요.", "vietnamese": "Món ăn này làm từ mấy hôm trước nhưng vẫn còn ăn được."},
    {"korean": "이 차를 산 지 10년이 넘었지만 아직 탈 만해요.", "vietnamese": "Chiếc ô tô này đã được mua 10 năm nhưng vẫn còn có thể chạy ổn."}
  ]'::jsonb,
  ARRAY['V – (으)ㄹ 수 있다', 'V – (으)ㄹ 만큼']::TEXT[],
  ARRAY['value', 'worth', 'capability', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '볼 __ 드라마를 좀 추천해 주시겠어요?', 'fill_blank', '["만한", "은", "는", "던"]'::jsonb, 0,
  'Đáng để xem → 볼 만한.'
FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ 만하다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '이 바지가 3년 전에 산 것인데 아직도 입__해서 안 버렸어요.', 'fill_blank', '["을 만", "을 수", "는", "은"]'::jsonb, 0,
  'Vẫn còn mặc được → 입을 만해서.'
FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ 만하다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #132: V – 도록 하다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 도록 하다',
  'dorok hada',
  'Cố gắng..., khiến cho...',
  'intermediate',
  'causation',
  '1. Thể hiện sự cố gắng, ý chí của chủ thể, thường dùng ở dạng 도록 하겠다 [tôi sẽ cố gắng...] hoặc dùng ở dạng khuyên nhủ 도록 하세요 [hãy cố gắng...]
2. Sai khiến hoặc khiến cho người khác làm một việc gì đó.',
  'V + 도록 하다',
  '[
    {"korean": "이제는 약속을 꼭 지키도록 하세요.", "vietnamese": "Bây giờ bạn hãy cố gắng giữ đúng lời hứa."},
    {"korean": "가: 지갑을 찾아 주셔서 정말 감사드려요. 나: 아니에요, 앞으로는 잃어버리지 않도록 하세요.", "vietnamese": "가: Cảm ơn bạn vì đã tìm ví giúp tôi. 나: Không có gì. Sau này đừng đánh rơi nữa nhé."},
    {"korean": "건강에 안 좋으니까 담배를 끊도록 하세요.", "vietnamese": "Hãy bỏ thuốc lá vì nó không tốt cho sức khỏe đâu."},
    {"korean": "가: 감기에 걸려서 열이 나고 머리도 아파요. 나: 약을 먹고 나서 며칠 동안 푹 쉬도록 하세요.", "vietnamese": "가: Tôi bị cảm, bị sốt và cũng đau đầu nữa. 나: Uống thuốc xong thì nghỉ ngơi vài hôm nhé."},
    {"korean": "중요한 약속이니까 잊지 말도록 하세요.", "vietnamese": "Vì cuộc hẹn quan trọng nên đừng quên nhé."},
    {"korean": "내일 10 시에 회의하도록 합시다.", "vietnamese": "Chúng ta hãy họp lúc 10h ngày mai."},
    {"korean": "내일부터 학교에 지각하지 말도록 하세요.", "vietnamese": "Kể từ ngày mai đừng đi học muộn nữa."},
    {"korean": "가: 돈을 모으고 싶은데 어떻게 하면 좋을까요? 나: 조금씩 이라도 매달 은행에 저축하도록 하세요.", "vietnamese": "가: Tôi muốn tiết kiệm tiền, tôi nên làm như thế nào? 나: Bạn hãy gửi tiền vào ngân hàng mỗi tháng cho dù là một chút một."},
    {"korean": "부모님은 제 동생에게 책을 많이 읽도록 하셨어요.", "vietnamese": "Bố mẹ bắt đứa em tôi phải đọc nhiều sách."},
    {"korean": "어머니는 동생에게 약을 먹게 하셨어요.", "vietnamese": "Mẹ bắt đứa em tôi phải uống thuốc."},
    {"korean": "영수는 동생에게 청소를 하게 했어요.", "vietnamese": "Youngsoo bắt đứa em phải dọn dẹp."}
  ]'::jsonb,
  ARRAY['V – 도록', 'V – 게 하다', 'V – 지 말다']::TEXT[],
  ARRAY['causation', 'effort', 'instruction', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '이제는 약속을 꼭 지키__ 하세요.', 'fill_blank', '["도록", "게", "지", "말"]'::jsonb, 0,
  'Cố gắng giữ lời hứa → 지키도록 하세요.'
FROM public.grammar_patterns WHERE pattern = 'V – 도록 하다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '내일부터 학교에 지각하지 말__ 하세요.', 'fill_blank', '["도록", "게", "지", "말"]'::jsonb, 0,
  'Khuyên nhủ → 지각하지 말도록 하세요.'
FROM public.grammar_patterns WHERE pattern = 'V – 도록 하다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #133: V-지 그래요?
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V-지 그래요?',
  'ji geuryeoyo?',
  'Bạn hãy... xem sao? / Sao lại không...nhỉ?',
  'intermediate',
  'suggestion',
  'Gợi ý ai đó làm cái gì, là một dạng câu mệnh lệnh tuy nhiên ở hình thức câu hỏi đem cảm giác ra lệnh nhẹ nhàng hơn. Thường kết hợp với (으)면. Dạng quá khứ 지 그랬어요? [bạn hãy... xem, sao lại không...nhỉ?]',
  'V + 지 그래요? (hoặc: 지 그랬어요?)',
  '[
    {"korean": "오늘 날씨가 더우니까 삼계탕을 먹지 그래요?", "vietnamese": "Hôm nay trời nóng vậy thì bạn hãy ăn gà tần sâm xem sao?"},
    {"korean": "피곤하니까 잠깐이라도 좀 쉬지 그래요?", "vietnamese": "Nếu mệt vậy thì sao anh không nghỉ ngơi một lát đi."},
    {"korean": "많이 아프면 오늘 결근하지 그랬어요?", "vietnamese": "Nếu ốm vậy thì sao hôm nay bạn không nghỉ làm đi."},
    {"korean": "휴대전화가 자꾸 고장이 나면 수리만 하지 말고 새 걸로 바꾸지 그래요?", "vietnamese": "Điện thoại hay hỏng thế thì đừng sửa nữa, sao bạn không đổi cái mới đi chứ?"},
    {"korean": "심심하면 공원에 가서 산책이라도 좀 하지 그래요?", "vietnamese": "Nếu buồn chán vậy sao anh không ra công viên đi dạo một chút?"},
    {"korean": "눈이 많이 오니까 약속을 연기하지 그래?", "vietnamese": "Tuyết rơi nhiều như vậy sao bạn không hủy cuộc hẹn đi?"},
    {"korean": "가: 쇼핑을 해야 하는데 시간이 없어요. 나: 인터넷으로 주문을 하지 그래요?", "vietnamese": "가: Tôi phải đi mua sắm như lại không có thời gian. 나: Sao anh không đặt qua internet?"}
  ]'::jsonb,
  ARRAY['V – (으)면', 'V – 지 말다', 'V – (으)ㄹ까요?']::TEXT[],
  ARRAY['suggestion', 'soft_command', 'question', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '오늘 날씨가 더우니까 삼계탕을 먹__ 그래요?', 'fill_blank', '["지", "지 말", "지 않", "지고"]'::jsonb, 0,
  'Gợi ý nhẹ nhàng → 먹지 그래요?'
FROM public.grammar_patterns WHERE pattern = 'V-지 그래요?' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '피곤하니까 잠깐이라도 좀 쉬__ 그래요?', 'fill_blank', '["지", "지 말", "지 않", "지고"]'::jsonb, 0,
  'Gợi ý nghỉ ngơi → 쉬지 그래요?'
FROM public.grammar_patterns WHERE pattern = 'V-지 그래요?' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #134: A/V - (으)ㄹ 뿐만 아니라
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V - (으)ㄹ 뿐만 아니라',
  '(eu)l ppunmani anira',
  'Không những...mà còn...',
  'intermediate',
  'addition',
  'Dùng để bổ sung thêm thông tin, nội dung mới bình đẳng. Có thể tỉnh lược 만 thành – (으)ㄹ 뿐 아니라.',
  'A/V + (으)ㄹ 뿐만 아니라 / A/V + (으)ㄹ 뿐더러',
  '[
    {"korean": "그 배우는 얼굴이 예쁠 뿐만 아니라 연기도 잘 해서 인기가 많아요.", "vietnamese": "Diễn viên đó không những xinh mà diễn cũng tốt nữa nên rất nổi tiếng."},
    {"korean": "저 식당은 음식이 맛있을 뿐더러 가격도 싸요.", "vietnamese": "Nhà hàng đó đồ ăn không những ngon mà giá cũng rẻ nữa."},
    {"korean": "저녁뿐만 아니라 점심도 굶어서 배가 너무 고파요.", "vietnamese": "Tôi không những nhịn bữa tối mà còn nhịn cả trưa nữa nên bây giờ đói bụng quá."},
    {"korean": "마이 씨는 똑똑할 뿐만 아니라 성격도 좋아요.", "vietnamese": "Mai không những thông minh mà tính cách cũng tốt nữa."},
    {"korean": "블랙핑크는 국내뿐만 아니라 해외에서도 인기가 많아요.", "vietnamese": "Blackpink không những nổi tiếng ở trong nước mà còn rất nổi tiếng ở nước ngoài nữa."},
    {"korean": "영호 씨는 공부를 잘할 뿐만 아니라 운동도 잘해요.", "vietnamese": "Young-ho không những học tốt mà còn chơi thể thao giỏi."},
    {"korean": "겨울에는 추울 뿐만 아니라 눈도 많이 내려요.", "vietnamese": "Mùa đông không những lạnh mà tuyết còn rơi nhiều nữa."},
    {"korean": "이 휴대 전화는 가격이 쌀 뿐만 아니라 사용하기도 편해요.", "vietnamese": "Chiếc điện thoại này giá không những rẻ mà sử dụng còn tiện lợi nữa."},
    {"korean": "지하철은 편리할 뿐더러 시간도 절약할 수 있어요.", "vietnamese": "Tàu điện ngầm không những thuận tiện mà còn tiết kiệm thời gian."}
  ]'::jsonb,
  ARRAY['–도', '–뿐더러', '–뿐만 아니라']::TEXT[],
  ARRAY['addition', 'not_only_but_also', 'emphasis', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '그 배우는 얼굴이 예쁠 뿐만 아니라 연기도 잘해서 인기가 많아요.', 'fill_blank', '["뿐만 아니라", "뿐만 아니", "뿐 아니라", "뿐더러"]'::jsonb, 0,
  'Không những...mà còn → 예쁠 뿐만 아니라.'
FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄹ 뿐만 아니라' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '저 식당은 음식이 맛있__ 가격도 싸요.', 'fill_blank', '["을 뿐더러", "을 뿐만 아니라", "은 뿐만 아니라", "은 뿐더러"]'::jsonb, 0,
  'Rút gọn → 음식이 맛을 뿐더러.'
FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄹ 뿐만 아니라' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #135: A/V - (으)ㄴ/는 데다가
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V - (으)ㄴ/는 데다가',
  '(eu)n/neun dedaga',
  'Thêm vào đó...',
  'intermediate',
  'addition',
  'Dùng để bổ sung thông tin, nội dung có ý nghĩa bình đẳng.',
  'A + ㄴ 데다가 / V + 는 데다가 / N + 인 데다가',
  '[
    {"korean": "가: 오늘 웬일로 지각을 했어요? 원래 지각 잘 안 하잖아요. 나: 늦게 일어나는 데다가 버스가 안 와서 지각을 했어요.", "vietnamese": "가: Hôm nay sao bạn đến muộn vậy? Vốn dĩ bạn thường không đến muộn mà. 나: Tôi dậy muộn thêm vào đó còn không bắt được xe buýt nên đã bị muộn."},
    {"korean": "그 친구가 성격이 활발한데다가 말을 잘 해요.", "vietnamese": "Người bạn đó tính cách hoạt bát thêm vào đó ăn nói cũng giỏi nữa."},
    {"korean": "영철 씨는 운동도 잘하는 데다가 다른 사람도 잘 도와 줘서 인기가 많아요.", "vietnamese": "Young Chol chơi thể thao giỏi thêm vào đó còn hay giúp đỡ người khác nên rất được yêu mến."},
    {"korean": "제주도는 경치가 아름다운 데다가 맛있는 음식도 많아요.", "vietnamese": "Đảo Jeju cảnh quan đẹp thêm vào đó còn rất nhiều món ăn ngon."},
    {"korean": "그 가수는 노래도 잘하는 데다가 춤도 잘 춰요.", "vietnamese": "Ca sĩ đó hát hay thêm vào đó nhảy cũng đẹp nữa."},
    {"korean": "철수 씨는 한국어도 잘하는 데다가 영어도 잘 해요.", "vietnamese": "Chulsu giỏi tiếng Hàn thêm vào đó tiếng Anh cũng giỏi."},
    {"korean": "오늘은 비도 오는 데다가 바람도 불어요.", "vietnamese": "Hôm nay trời có mưa thêm vào đó gió thổi mạnh nữa."}
  ]'::jsonb,
  ARRAY['–뿐만 아니라', '–도', '–(으)ㄴ/는 데다']::TEXT[],
  ARRAY['addition', 'besides', 'moreover', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '늦게 일어나__ 버스가 안 와서 지각을 했어요.', 'fill_blank', '["는 데다가", "은 데다가", "ㄴ 데다가", "인 데다가"]'::jsonb, 0,
  'Thêm vào đó → 늦게 일어나는 데다가.'
FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄴ/는 데다가' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '오늘은 비도 오__ 바람도 불어요.', 'fill_blank', '["는 데다가", "은 데다가", "ㄴ 데다가", "인 데다가"]'::jsonb, 0,
  'Thêm vào đó → 비도 오는 데다가.'
FROM public.grammar_patterns WHERE pattern = 'A/V - (으)ㄴ/는 데다가' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #136: N - 조차
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N - 조차',
  'jocha',
  'Ngay cả..., thậm chí...',
  'intermediate',
  'emphasis',
  'Ý nghĩa: đến ngay cả những thứ cơ bản nhất còn không được thì nói gì đến cái khác.',
  'N + 조차',
  '[
    {"korean": "살이 많이 빠져서 친한 친구조차 저를 못 알아봤어요.", "vietnamese": "Tôi sụt cân nhiều đến mức ngay cả bạn thân cũng không nhận ra."},
    {"korean": "형조차 저를 못 믿어요?", "vietnamese": "Ngay cả anh cũng không tin em sao?"},
    {"korean": "고등학교에 다닐 때 독일어를 배웠는데 지금은 인사말조차 생각이 안 나요.", "vietnamese": "Hồi học cấp 3 tôi đã học tiếng Đức nhưng bây giờ ngay cả lời chào hỏi tôi cũng không nhớ."},
    {"korean": "너무 슬프면 눈물조차 안 나오는 경우도 있어요.", "vietnamese": "Khi quá buồn thì đến nước mắt cũng không rơi được."},
    {"korean": "더운 날씨에 에어컨조차 고장이 나 버려서 정말 죽겠어요.", "vietnamese": "Ngay cả điều hòa cũng hỏng trong thời tiết nóng nực này thì chết mất thôi."},
    {"korean": "그 돈으로는 새 차는커녕 중고차조차 사기 힘들어요.", "vietnamese": "Với số tiền đó thì ngay cả mua xe ô tô cũ còn khó chứ nói gì đến xe ô tô mới."},
    {"korean": "가: 마이클 씨가 지난 주말에 고향으로 돌아갔어요. 나: 네, 간다는 인사조차 하지 않고 돌아갔어요.", "vietnamese": "가: Micheal đã về nước tuần trước rồi hả? 나: Vâng, anh ấy về nước mà không nói một lời từ biệt."}
  ]'::jsonb,
  ARRAY['N - 마저', 'N - 까지', 'N - 부터']::TEXT[],
  ARRAY['emphasis', 'even', 'extreme_case', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '살이 많이 빠져서 친한 친구__ 저를 못 알아봤어요.', 'fill_blank', '["조차", "마저", "까지", "부터"]'::jsonb, 0,
  'Ngay cả... → 친구조차.'
FROM public.grammar_patterns WHERE pattern = 'N - 조차' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '형__ 저를 못 믿어요?', 'fill_blank', '["조차", "마저", "까지", "부터"]'::jsonb, 0,
  'Ngay cả anh cũng không tin → 형조차.'
FROM public.grammar_patterns WHERE pattern = 'N - 조차' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #137: N - 마저
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'N - 마저',
  'majeo',
  'Ngay cả...',
  'intermediate',
  'emphasis',
  'Ý nghĩa: đến ngay cả thứ cuối cùng không được thì nói gì đến cái khác.',
  'N + 마저',
  '[
    {"korean": "부모님마저 제 생일을 잊어버렸어요.", "vietnamese": "Ngay cả bố mẹ cũng quên sinh nhật tôi."},
    {"korean": "막내딸마저 시집에 가 버려서 섭섭해요.", "vietnamese": "Ngay cả con gái út cũng đi lấy chồng rồi nên buồn thật đấy."},
    {"korean": "다른 사람은 몰라도 너마저 거짓말을 할 줄 몰랐어.", "vietnamese": "Người khác thì tôi không biết nhưng tôi không ngờ đến cả cậu cũng nói dối tôi."},
    {"korean": "마지막 기회마저 놓쳐서 이제 어떻게 해야 할지 모르겠다.", "vietnamese": "Đến cả cơ hội cuối cùng cũng để tuột mất, bây giờ tôi không biết phải làm thế nào nữa."},
    {"korean": "남은 음식마저 다 상했어요. 아무것도 먹을 것이 없네요.", "vietnamese": "Đến cả chút thức ăn còn lại cũng bị hỏng hết rồi. Chẳng còn gì để ăn nữa."},
    {"korean": "마지막 버스마저 놓쳐서 집에 갈 방법이 없어요.", "vietnamese": "Đến cả chuyến xe bus cuối cùng cũng để lỡ mất nên chẳng còn cách nào để về nhà."},
    {"korean": "시간이 오래 지나서 그 사람이 이름마저 잊어버렸어요.", "vietnamese": "Thời gian trôi qua đã lâu nên ngay cả tên người ấy tôi cũng đã quên mất rồi."}
  ]'::jsonb,
  ARRAY['N - 조차', 'N - 까지', 'N - 부터']::TEXT[],
  ARRAY['emphasis', 'even', 'last_one', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '부모님__ 제 생일을 잊어버렸어요.', 'fill_blank', '["마저", "조차", "까지", "부터"]'::jsonb, 0,
  'Ngay cả bố mẹ → 부모님마저.'
FROM public.grammar_patterns WHERE pattern = 'N - 마저' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '마지막 버스__ 놓쳐서 집에 갈 방법이 없어요.', 'fill_blank', '["마저", "조차", "까지", "부터"]'::jsonb, 0,
  'Đến cả chuyến cuối cùng → 버스마저.'
FROM public.grammar_patterns WHERE pattern = 'N - 마저' AND topik_level = 'TOPIK II';
