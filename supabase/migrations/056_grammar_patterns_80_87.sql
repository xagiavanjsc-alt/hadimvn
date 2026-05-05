-- Migration 056: Insert TOPIK grammar patterns #80-87 (Intermediate level)
-- Ngữ pháp TOPIK #80-87 (Trung cấp)

-- ═══════════════════════════════════════════════════════════════════════════════
-- #80: A/V – (으)ㄴ/는 데 반해(서) [trái lại, nhưng]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)ㄴ/는 데 반해(서)',
  '(eu)n/neun de bane(seo)',
  'trái lại, nhưng',
  'intermediate',
  'contrast',
  'Là tố liên kết biểu hiện nội dung trái ngược, đối lập với nhau giữa 2 mệnh đề trước và sau. Dùng nhiều trong văn viết. A + (으)ㄴ 데 반해(서) thời hiện tại. V + (으)ㄴ 데 반해(서) thời quá khứ, V + 는 데 반해(서) thời hiện tại.',
  'A + (으)ㄴ 데 반해(서) / V(qua khứ) + (으)ㄴ 데 반해(서) / V(hiện tại) + 는 데 반해(서)',
  '[
    {"korean": "그 직업은 불안정한 데 반해 즐겁게 일할 수 있잖아요.", "vietnamese": "Công việc đó không ổn định nhưng trái làm việc thấy thú vị còn gì."},
    {"korean": "그 아파트는 가격이 비싼 데 반해 살기가 아주 좋아요.", "vietnamese": "Chung cư đó giá đắt nhưng trái lại việc sống ở đó rất tốt."},
    {"korean": "그 회사는 돈을 많이 주는 데 반해 일을 너무 많이 시켜요.", "vietnamese": "Công ty đó trả tiền công cao nhưng trái lại việc phải làm rất nhiều."},
    {"korean": "물가가 증가하는 데 반해서 소득은 감소한 것으로 나타났다.", "vietnamese": "Vật giá gia tăng trái lại thu nhập lại giảm."},
    {"korean": "취직하기가 어려운 데 반해 대학 졸업자 수는 증가하고 있다.", "vietnamese": "Số lượng sinh viên tốt nghiệp đại học ngày càng nhiều nhưng trái lại xin việc lại càng khó."},
    {"korean": "나는 채식 위주의 식생활을 하고 있는 데 반해 내 친구는 육식 위주의 식생활을 하고 있다.", "vietnamese": "Tôi đang sinh hoạt ăn uống coi ăn chay làm trọng thì ngược lại bạn tôi lại xem trọng việc ăn thịt."},
    {"korean": "30 대의 지지율이 하락한 데 반해 40 대의 지지율은 상승했어요.", "vietnamese": "Trái ngược với việc tỷ lệ tán thành đã giảm xuống với những người ở độ tuổi 30 thì lại tăng lên với những người ở độ tuổi 40."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는 반면(에)', 'A/V – 지만']::TEXT[],
  ARRAY['contrast', 'written', 'opposite', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 데 반해(서)' LIMIT 1),
  '그 아파트는 가격이 비싼 데 반해 살기가 아주 좋___.',
  'fill_blank',
  '["아요.", "습니다.", "해요.", "해."]'::jsonb,
  '아요.',
  'Hiện tại → 좋아요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)ㄴ/는 데 반해(서)' LIMIT 1),
  '30 대의 지지율이 하락한 데 반해 40 대의 지지율은 상승했___.',
  'fill_blank',
  '["어요.", "습니다.", "었어요.", "었어."]'::jsonb,
  '어요.',
  'Quá khứ → 상승했어요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #81: A/V – ㅂ/습니까만 [trái lại, nhưng]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – ㅂ/습니까만',
  'b/seumnikaman',
  'trái lại, nhưng',
  'intermediate',
  'contrast',
  'Vĩ tố liên kết thể hiện mệnh đề trước và sau có nội dung trái ngược, đối lập với nhau. Dùng trong văn nói với tình huống trang trọng, lịch sự. Tạo cảm giác liền mạch trong câu nói.',
  'A + 습니까만 / V + ㅂ니까만',
  '[
    {"korean": "도와드리고 싶습니다만 오늘은 바빠서 도와드릴 수 없습니다.", "vietnamese": "Tôi muốn giúp đỡ anh nhưng vì hôm nay tôi bận nên không thể giúp được ạ."},
    {"korean": "죄송합니다만 일이 있어서 저는 먼저 가겠습니다.", "vietnamese": "Xin lỗi nhưng vì tôi có việc nên tôi xin phép đi trước ạ."},
    {"korean": "초대해 주셔서 감사합니다만 선약이 있어서 갈 수 없습니다.", "vietnamese": "Cảm ơn vì đã mời tôi nhưng tôi có hẹn trước nên không thể đi được ạ."},
    {"korean": "미안합니다만 다시 한번 설명해 주세요.", "vietnamese": "Xin lỗi nhưng làm ơn hãy giải thích lại một lần nữa cho tôi."},
    {"korean": "자리가 몇 개 남았습니다만 좋은 자리가 아닙니다.", "vietnamese": "Vẫn còn lại vài chỗ ngồi nhưng không phải là chỗ tốt ạ."}
  ]'::jsonb,
  ARRAY['A/V – 지만', 'A/V – (으)ㄴ/는 반면(에)']::TEXT[],
  ARRAY['contrast', 'polite', 'formal spoken', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – ㅂ/습니까만' LIMIT 1),
  '도와드리고 싶습니다만 오늘은 바빠서 도와드릴 수 없___.',
  'fill_blank',
  '["습니다.", "어요.", "해요.", "해."]'::jsonb,
  '습니다.',
  'Trang trọng → 없습니다.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – ㅂ/습니까만' LIMIT 1),
  '초대해 주셔서 감사합니다만 선약이 있어서 갈 수 없___.',
  'fill_blank',
  '["습니다.", "어요.", "해요.", "해."]'::jsonb,
  '습니다.',
  'Trang trọng → 없습니다.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #82: A/V – (으)면서(도) [dù cũng, dù vẫn...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – (으)면서(도)',
  '(eu)myeonseo(do)',
  'dù cũng, dù vẫn...',
  'intermediate',
  'contrast',
  'Vĩ tố liên kết thể hiện mệnh đề trước và sau có nội dung trái ngược, đối lập với nhau. Tạo cảm giác 2 hành động trạng thái vẫn diễn ra song song nhưng có sự đối lập.',
  'A + (으)면서(도) / V + (으)면서(도)',
  '[
    {"korean": "그 사람은 모르면서도 항상 아는 척해요.", "vietnamese": "Người đó mặc dù không biết nhưng luôn giả vờ như là biết."},
    {"korean": "영호 씨는 키가 작으면서도 농구를 잘해요.", "vietnamese": "Young-ho mặc dù thấp nhưng chơi bóng rổ giỏi."},
    {"korean": "유리 씨는 돈이 많으면서도 항상 절약해요.", "vietnamese": "Yu-ri mặc dù có nhiều tiền nhưng luôn luôn tiết kiệm."},
    {"korean": "그 책을 다 읽었으면서도 기억을 못 해요.", "vietnamese": "Mặc dù đã đọc hết cuốn sách đó nhưng không thể nhớ nổi."},
    {"korean": "그 사람은 부자면서도 가난한 사람을 도와주지 않아요.", "vietnamese": "Mặc dù người đó là người giàu có nhưng không giúp đỡ người nghèo khó."},
    {"korean": "저 사람은 선생님이면서 학생들을 챙기지 않아요.", "vietnamese": "Người đó mặc dù là giáo viên nhưng không trông nom học sinh."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄴ/는데도', 'A/V – 지만']::TEXT[],
  ARRAY['contrast', 'simultaneous', 'opposition', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면서(도)' LIMIT 1),
  '그 사람은 모르면서도 항상 아는 척하___.',
  'fill_blank',
  '["어요.", "습니다.", "해요.", "해."]'::jsonb,
  '어요.',
  'Hiện tại → 해요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – (으)면서(도)' LIMIT 1),
  '유리 씨는 돈이 많으면서도 항상 절약하___.',
  'fill_blank',
  '["어요.", "습니다.", "해요.", "해."]'::jsonb,
  '어요.',
  'Hiện tại → 해요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #83: A/V – 다가도 [dù đang...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 다가도',
  'dagado',
  'dù đang...',
  'intermediate',
  'contrast',
  'Vĩ tố liên kết thể hiện hành vi hay trạng thái mà vế trước diễn tả dễ dàng bị chuyển sang hành vi hay trạng thái khác. Là sự kết hợp của 다가 và 아/어도.',
  'V + 다가도',
  '[
    {"korean": "요즘 지수는 영어 공부를 열심히 해서인지 자다가도 영어로 말을 하곤 한다.", "vietnamese": "Dạo này Jisoo học tiếng Anh chăm chỉ đến mức cô ấy thường xuyên nói tiếng Anh ngay cả khi đang ngủ."},
    {"korean": "강아지는 주인이 오면 기분 좋게 날뛰다가도 낯선 사람이 보이면 마구 짖어댄다.", "vietnamese": "Nếu chủ đến, con chó dù có đang vui vẻ chạy đên cũng sủa dữ dội khi thấy người lạ."},
    {"korean": "추석이 지나자 낮에는 따뜻하다가도 해가 지면 쌀쌀해요.", "vietnamese": "Sau lễ Trung Thu, ban ngày trời dù có đang ấm áp nhưng nếu mặt trời lặn thì sẽ lạnh."},
    {"korean": "아이는 울다가도 사탕만 주면 금방 웃는다.", "vietnamese": "Ngay cả khi một đứa trẻ đang khóc, nó sẽ ngay lập tức mỉm cười nếu bạn cho nó kẹo."},
    {"korean": "평소에 괜찮다가도 비만 오면 다시 아파요.", "vietnamese": "Bình thường thì không sao nhưng khi trời mưa lại đau."}
  ]'::jsonb,
  ARRAY['A/V – 아/어도', 'A/V – 다가']::TEXT[],
  ARRAY['contrast', 'transition', 'change state', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 다가도' LIMIT 1),
  '요즘 지수는 영어 공부를 열심히 해서인지 자다가도 영어로 말을 하곤 하___.',
  'fill_blank',
  '["다.", "어요.", "습니다.", "해요."]'::jsonb,
  '다.',
  'Văn viết → 한다.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 다가도' LIMIT 1),
  '추석이 지나자 낮에는 따뜻하다가도 해가 지면 쌀쌀하___.',
  'fill_blank',
  '["어요.", "습니다.", "다.", "해요."]'::jsonb,
  '어요.',
  'Hiện tại → 쌀쌀해요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #84: V – 는 사이에 [trong lúc, giữa lúc làm gì đó]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 는 사이에',
  'neun saie',
  'trong lúc, giữa lúc làm gì đó',
  'intermediate',
  'time',
  'Vĩ tố liên kết sử dụng khi muốn thể hiện thời gian ngắn nào đó giữa lúc hành động hay tình huống nào đó diễn ra.',
  'V + 는 사이에',
  '[
    {"korean": "우리도 모르는 사이에 자연 환경이 많이 파괴되었어요.", "vietnamese": "Môi trường tự nhiên đã bị hủy hoại rất nhiều trong lúc chúng ta không hề hay biết."},
    {"korean": "잠시 화장실 다녀오는 사이에 전화가 왔네요.", "vietnamese": "Đang đi vệ sinh một lúc thì có cuộc gọi đến."},
    {"korean": "눈이 깜짝할 사이에 핸드폰을 훔치고 도망갔다.", "vietnamese": "Trong nháy mắt, tên trộm đã trộm điện thoại và tẩu thoát."},
    {"korean": "얼마나 배가 고팠는지 눈 깜짝할 사이에 밥을 다 먹어 버렸다.", "vietnamese": "Không biết bụng đã đói bao nhiêu mà trong chớp mắt đã ăn hết tất cả rồi."},
    {"korean": "엄마가 화장실에 간 사이에 아이가 집을 나갔다.", "vietnamese": "Trong lúc mẹ đi vệ sinh thì đứa bé đã đi ra khỏi nhà."},
    {"korean": "저는 샤워하는 사이에 친구가 전화를 했다.", "vietnamese": "Trong lúc tôi tắm thì bạn tôi gọi điện đến."},
    {"korean": "수업 중에 다른 생각을 하는 사이에 중요한 부분을 놓치고 말았다.", "vietnamese": "Trong giờ học trong khi nghĩ về thứ khác thì tôi đã bỏ lỡ phần quan trọng của tiết học."},
    {"korean": "잠깐 조는 사이에 내려야할 지하철역을 지나치고 말았다.", "vietnamese": "Trong lúc chợp mắt một chút xíu thì tôi đã đi qua ga tàu điện ngầm nơi tôi phải xuống."}
  ]'::jsonb,
  ARRAY['V – 는 동안에', 'V – (으)ㄴ 사이']::TEXT[],
  ARRAY['time', 'duration', 'short time', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 는 사이에' LIMIT 1),
  '우리도 모르는 사이에 자연 환경이 많이 파괴되었___.',
  'fill_blank',
  '["어요.", "습니다.", "었어요.", "었어."]'::jsonb,
  '어요.',
  'Quá khứ → 파괴되었어요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 는 사이에' LIMIT 1),
  '잠시 화장실 다녀오는 사이에 전화가 왔___.',
  'fill_blank',
  '["어요.", "습니다.", "었어요.", "었어."]'::jsonb,
  '어요.',
  'Quá khứ → 왔어요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #85: A/V – 아/어야 [chỉ khi...mới..., chỉ có...mới...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 아/어야',
  'a/eoya',
  'chỉ khi...mới..., chỉ có...mới...',
  'intermediate',
  'condition',
  'Vĩ tố liên kết thể hiện hành động hay trạng thái ở vế trước là điều kiện thiết yếu cho tình huống ở vế sau. Trong văn nói, có thể sử dụng ở dạng –아/어 야지, văn viết 아/어야만. Ở dạng 아/어 봐야: Vĩ tố liên kết thể hiện điều giả định ở trước rốt cuộc không có ảnh hưởng gì.',
  'A/V + 아/어야',
  '[
    {"korean": "토픽 시험을 통과해야 한국으로 유학할 수 있어요.", "vietnamese": "Chỉ khi vượt qua kỳ thi Topik thì mới có thể đi du học Hàn Quốc."},
    {"korean": "여권이 있어야 해외 여행을 갈 수 있지요.", "vietnamese": "Phải có hộ chiếu thì mới đi du lịch nước ngoài được chứ."},
    {"korean": "무엇보다도 음식이 맛있어야 손님이 많이 와요.", "vietnamese": "Hơn hết thì đồ ăn phải ngon thì mới có nhiều khách đến."},
    {"korean": "연습을 많이 해야 발음이 좋아집니다.", "vietnamese": "Phải luyện tập nhiều thì phát âm mới tốt lên được."},
    {"korean": "졸려서 커피를 한 잔 마셔야 정신이 날 것 같아요.", "vietnamese": "Buồn ngủ quá có lẽ phải uống một ly cà phê mới tỉnh được."},
    {"korean": "한국말을 잘해야 한국 회사에 취직할 수 있어요.", "vietnamese": "Phải giỏi tiếng Hàn thì mới xin việc vào công ty Hàn được."}
  ]'::jsonb,
  ARRAY['A/V – (으)면', 'A/V – 아/어야만']::TEXT[],
  ARRAY['condition', 'essential', 'requirement', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어야' LIMIT 1),
  '토픽 시험을 통과해야 한국으로 유학할 수 있___.',
  'fill_blank',
  '["어요.", "습니다.", "해요.", "해."]'::jsonb,
  '어요.',
  'Khả năng → 있어요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 아/어야' LIMIT 1),
  '연습을 많이 해야 발음이 좋아집니___.',
  'fill_blank',
  '["다.", "어요.", "습니다.", "해요."]'::jsonb,
  '다.',
  'Văn viết → 좋아집니다.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #86: A/V – 고야 [...mất rồi, nếu như vậy... mà lại...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 고야',
  'goya',
  '...mất rồi, nếu như vậy... mà lại...',
  'intermediate',
  'condition',
  'Vĩ tố liên kết nhấn mạnh động tác hay hành vi đã kết thúc hay đến cuối được thực hiện. Ở dạng 고야 말다 là dạng nhấn mạnh hơn của 고 말다. Vĩ tố liên kết nhấn mạnh vế trước trở thành điều kiện của vế sau. Sử dụng ở dạng 아/어 가지고야 và ở dạng nghi vấn.',
  'A/V + 고야',
  '[
    {"korean": "그렇게 운동해 가지고야 살이 빠지겠니?", "vietnamese": "Tập thể dục như vậy mà lại giảm được cân à?"},
    {"korean": "그렇게 느릿느릿 해 가지고야 대체 언제 청소를 끝낼래?", "vietnamese": "Làm chậm như vậy thì rốt cục tới chừng nào mới dọn xong."},
    {"korean": "그렇게 쉬면서 해 가지고야 마감 시간에 맞출 수 있겠어요?", "vietnamese": "Vừa nghỉ vừa làm như vậy thì có thể kịp deadline không vậy?"},
    {"korean": "이래 가지고야 제시간에 도착할 수 있을까?", "vietnamese": "Cứ như vậy thì có thể tới đúng giờ không nhỉ?"}
  ]'::jsonb,
  ARRAY['A/V – 고 말다', 'A/V – 아/어 가지고']::TEXT[],
  ARRAY['condition', 'emphasis', 'negative outcome', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 고야' LIMIT 1),
  '그렇게 운동해 가지고야 살이 빠지겠___.',
  'fill_blank',
  ["니?", "어요?", "습니까?", "해요?"]::jsonb,
  '니?',
  'Câu hỏi → 겠니?',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V – 고야' LIMIT 1),
  '이래 가지고야 제시간에 도착할 수 있___.',
  'fill_blank',
  ["을까?", "어요?", "습니까?", "해요?"]::jsonb,
  '을까?',
  'Câu hỏi → 을까?',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #87: A/V - 거든 [nếu...]
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V - 거든',
  'geodeun',
  'nếu...',
  'intermediate',
  'condition',
  'Vĩ tố liên kết thể hiện điều kiện hay một sự giả định. Mệnh đề phía sau thường là thể mệnh lệnh, cầu khiến, khuyên nhủ, hứa hẹn -(으)세요, -(으)ㅂ시다, -(으)ㄹ게요 hay là thể hiện sự suy đoán, ý chí -겠-, -(으)ㄹ 것이다, -(으)려고 하다. Thường sử dụng trong văn nói. Không dùng với các giả định là sự thật hiển nhiên.',
  'A/V + 거든',
  '[
    {"korean": "다음에 베트남에 오거든 꼭 연락하세요.", "vietnamese": "Tuần sau nếu đến Việt Nam thì nhất định phải liên lạc nhé."},
    {"korean": "바쁘지 않거든 저녁을 같이 먹읍시다.", "vietnamese": "Nếu không bận thì cùng nhau đi ăn tối đi."},
    {"korean": "벚꽃이 피거든 서울에 꽃 구경을 하러 갑시다.", "vietnamese": "Nếu hoa anh đào nở thì chúng ta hãy đi ngắm hoa ở Seoul đi."},
    {"korean": "할 말이 있거든 오늘 일이 끝난 후에 하세요.", "vietnamese": "Nếu có gì cần nói thì hôm nay sau khi xong việc thì hãy nói nha."},
    {"korean": "고향에 도착하거든 전화하세요.", "vietnamese": "Nếu đến về đến quê thì hãy gọi cho tôi nhé."}
  ]'::jsonb,
  ARRAY['A/V – (으)면', 'A/V – 아/어서']::TEXT[],
  ARRAY['condition', 'assumption', 'spoken', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V - 거든' LIMIT 1),
  '다음에 베트남에 오거든 꼭 연락하세___.',
  'fill_blank',
  '["요.", "십시오.", "해요.", "해."]'::jsonb,
  '요.',
  'Mệnh lệnh → 연락하세요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'A/V - 거든' LIMIT 1),
  '바쁘지 않거든 저녁을 같이 먹읍시___.',
  'fill_blank',
  '["다.", "어요.", "시오.", "해요."]'::jsonb,
  '다.',
  'Cầu khiến → 먹읍시다.',
  'medium'
);
