-- Migration 069: TOPIK 4–5 Grammar Patterns #207–219
-- Category: Quotation expressions (인용 표현), Nominalization, Purpose/Context

-- ─────────────────────────────────────────────────────────────────────────────
-- TOPIK 4 Patterns (#207–209, #214–215, #217–219)
-- ─────────────────────────────────────────────────────────────────────────────

-- #207 A/V – (느)ㄴ다니까
WITH p207 AS (
  INSERT INTO public.grammar_patterns (
    pattern, romanization, meaning, level, category,
    explanation, usage, examples, related_patterns, tags, topik_level
  ) VALUES (
    'A/V – (느)ㄴ다니까',
    'neundanikka',
    'Nghe bảo là... nên... / Nói rằng là... nên...',
    'intermediate',
    'quotation',
    E'Là dạng rút gọn của ㄴ/는다고 하다 + -(으)니까. Vì lời nói của bản thân hoặc nội dung nghe từ người khác nên xuất hiện, xảy ra tình huống phía sau. Chủ ngữ 2 vế phải khác nhau. Nếu ở dạng đuôi kết, có ý nghĩa nhấn mạnh ý kiến của người nói [đã bảo là... mà]. Dạng nhấn mạnh: (느)ㄴ다니까는 hoặc (느)ㄴ다니까요.',
    'V + (느)ㄴ다니까 / A + 다니까 / N + (이)라니까',
    '[
      {"korean": "친구가 그 영화가 재미있다니까 주말에 그 영화를 봐야겠어요.", "vietnamese": "Bạn của tôi nói rằng phim đó hay nên cuối tuần này tôi phải đi xem phim đó mới được."},
      {"korean": "비가 올 것 같다니 우산을 가지고 가세요.", "vietnamese": "Nghe bảo là trời có thể mưa nên hãy mang theo ô nhé."},
      {"korean": "태민 씨보고 베트남어를 공부한 지 얼마나 됐냐니까 1년이 된다고 하더라고요.", "vietnamese": "Tớ gặp Taemin và hỏi cậu ấy học tiếng Hàn được bao lâu rồi thì cậu ấy bảo học được 1 năm rồi."},
      {"korean": "내일 비가 온다니까 외부 모임을 취소합시다.", "vietnamese": "Thấy bảo là ngày mai trời mưa nên buổi họp ngoài trời hãy hủy bỏ nha."},
      {"korean": "내가 집에 간다니까 유리 씨도 나를 따라 나왔다.", "vietnamese": "Tôi nói rằng sẽ đi về nhà nên Yu-ri cũng đã đi theo tôi."},
      {"korean": "내가 시험을 잘 봤다니까 부모님이 아주 기뻐하셨다.", "vietnamese": "Tôi nói rằng đã thi tốt nên bố mẹ tôi đã rất vui mừng."},
      {"korean": "난 이게 좋다니까.", "vietnamese": "Tớ đã bảo là thích cái này mà."},
      {"korean": "이번엔 틀림없다니까요.", "vietnamese": "Tớ đã bảo là lần này không sai mà."}
    ]'::jsonb,
    ARRAY['A/V – (느)ㄴ다면서', 'A/V – (느)ㄴ다더군요', 'A/V – (으)니까']::TEXT[],
    ARRAY['quotation', 'indirect-speech', 'reason', 'topik4', 'intermediate']::TEXT[],
    'TOPIK IV'
  ) RETURNING id
)
INSERT INTO public.practice_questions (pattern_id, question, options, answer, explanation)
SELECT p207.id,
  '친구가 그 영화가 재미있___ 주말에 그 영화를 봐야겠어요.',
  ARRAY['다니까', '다면서', '다거나', '다든지'],
  0,
  '인용+이유: 친구가 말한 내용이 이유 → 재미있다니까'
FROM p207;

-- #208 A/V – (느)ㄴ다면서
WITH p208 AS (
  INSERT INTO public.grammar_patterns (
    pattern, romanization, meaning, level, category,
    explanation, usage, examples, related_patterns, tags, topik_level
  ) VALUES (
    'A/V – (느)ㄴ다면서',
    'neundamyeonseo',
    'Vừa nói là... vừa... / Bảo là... đồng thời...',
    'intermediate',
    'quotation',
    E'Là dạng rút gọn của (느)ㄴ다고 하면서. Thể hiện việc người khác nói lời nào đó và đồng thời thực hiện hành động nào đó, hoặc liên kết một lời nói với một lời nói đã đề cập trước đó. 2 vế phải có cùng chủ ngữ, và chủ ngữ chỉ xuất hiện 1 lần ở đầu câu. Có thể dùng dưới dạng rút gọn (느)ㄴ다며.',
    'V + (느)ㄴ다면서 / A + 다면서 / N + (이)라면서 / V + (느)ㄴ다며',
    '[
      {"korean": "수진 씨가 오늘 회의가 있다면서 회의에 관한 자료를 준비했어요.", "vietnamese": "Sujin nói rằng hôm nay có cuộc họp và cô ấy đã chuẩn bị tài liệu liên quan đến cuộc họp."},
      {"korean": "선생님께서는 왜 이번 시험에서 떨어졌냐며 열심히 공부하라고 하셨어요.", "vietnamese": "Thầy giáo đã hỏi tại sao kì thi lần này lại bị trượt đồng thời bảo rằng hãy chăm chỉ học tập đi."},
      {"korean": "어떤 남자가 선호 씨를 찾는다면서 사무실을 기웃거렸다.", "vietnamese": "Có chàng trai nào đó vừa nói là tìm Suho vừa ngó nghiêng nhìn văn phòng."},
      {"korean": "민준 씨는 요즘 건강이 나빠졌다면서 운동을 해야겠다고 하더군요.", "vietnamese": "Min Jun than rằng sức khỏe cậu ấy gần đây ngày càng xấu đi và cậu ấy phải tập thể dục."},
      {"korean": "사장님께서 신제품의 판매가 왜 이렇게 저조하냐면서 새로운 판매 전략을 생각해보라고 하셨다.", "vietnamese": "Giám đốc đã hỏi tại sao doanh số sản phẩm mới sụt giảm đồng thời bảo hãy nghĩ chiến lược bán hàng mới."}
    ]'::jsonb,
    ARRAY['A/V – (느)ㄴ다니까', 'A/V – (으)면서', 'A/V – (느)ㄴ다며']::TEXT[],
    ARRAY['quotation', 'indirect-speech', 'simultaneous', 'topik4', 'intermediate']::TEXT[],
    'TOPIK IV'
  ) RETURNING id
)
INSERT INTO public.practice_questions (pattern_id, question, options, answer, explanation)
SELECT p208.id,
  '수진 씨가 오늘 회의가 있___ 자료를 준비했어요.',
  ARRAY['다면서', '다니까', '다거나', '다든지'],
  0,
  '동시행동+인용: 말하면서 동시에 행동 → 있다면서'
FROM p208;

-- #209 A/V – (느)ㄴ다거나
WITH p209 AS (
  INSERT INTO public.grammar_patterns (
    pattern, romanization, meaning, level, category,
    explanation, usage, examples, related_patterns, tags, topik_level
  ) VALUES (
    'A/V – (느)ㄴ다거나',
    'neundageona',
    'Dù có nói là... hay là... (trích dẫn lựa chọn)',
    'intermediate',
    'quotation',
    E'Dạng trích dẫn của cấu trúc lựa chọn 거나 – 거나. Liệt kê các lựa chọn ở dạng trích dẫn gián tiếp. Có thể thay thế bằng (느)ㄴ다든가.',
    'V + (느)ㄴ다거나 / A + 다거나 / N + (이)라거나',
    '[
      {"korean": "그 여자는 예쁘다거나 귀엽다거나 하는 것과는 거리가 멀었다.", "vietnamese": "Dù nói là dễ thương hay xinh đẹp thì cô ấy cũng còn xa để tới lắm."},
      {"korean": "잘못했다거나 잘했다거나 그냥 내버려 둬.", "vietnamese": "Dù nói là làm sai hay làm đúng thì cứ kệ đi."},
      {"korean": "그 일에 대해 억울하다거나 기가 막히다거나 하는 것을 느낄 수도 없었다.", "vietnamese": "Tôi không hề cảm thấy oan ức hay ngạc nhiên về việc ấy."},
      {"korean": "비가 온다거나 바람이 많이 분다거나 하면 비행기가 지연될 수도 있어요.", "vietnamese": "Dù nói là trời mưa hay là gió thổi nhiều thì máy bay cũng có thể bị trì hoãn."},
      {"korean": "몸이 아프다거나 도움이 필요하다거나 하면 저에게 전화하세요.", "vietnamese": "Dù cơ thể bị đau hay là cần sự giúp đỡ, hãy gọi điện cho tôi."}
    ]'::jsonb,
    ARRAY['A/V – (느)ㄴ다든가', 'A/V – (느)ㄴ다든지', 'A/V – 거나']::TEXT[],
    ARRAY['quotation', 'indirect-speech', 'choice', 'listing', 'topik4', 'intermediate']::TEXT[],
    'TOPIK IV'
  ) RETURNING id
)
INSERT INTO public.practice_questions (pattern_id, question, options, answer, explanation)
SELECT p209.id,
  '몸이 아프___ 도움이 필요하___ 하면 전화하세요.',
  ARRAY['다거나 다거나', '다면서 다면서', '다니까 다니까', '다든지 다든지'],
  0,
  '인용+열거: 두 선택지 나열 → 아프다거나 필요하다거나'
FROM p209;

-- #214 A/V – (느)ㄴ다더군요/다던데요/다더라고요
WITH p214 AS (
  INSERT INTO public.grammar_patterns (
    pattern, romanization, meaning, level, category,
    explanation, usage, examples, related_patterns, tags, topik_level
  ) VALUES (
    'A/V – (느)ㄴ다더군요 / 다던데요 / 다더라고요',
    'neundadeogunnyo',
    'Tôi thấy người ta nói rằng... / Nghe bảo là...',
    'intermediate',
    'quotation',
    E'Đều là dạng hồi tưởng lại điều đã nghe thấy từ người khác. Người nói nhớ lại và kể lại thông tin đã nghe. Cả ba dạng đều có nghĩa tương đương nhưng sắc thái nhẹ khác nhau: 다더군요 (thông báo ngạc nhiên), 다던데요 (đặt ngầm yêu cầu phản hồi), 다더라고요 (kể lại tự nhiên).',
    'V + (느)ㄴ다더군요/다던데요/다더라고요 / A + 다더군요/다던데요/다더라고요',
    '[
      {"korean": "장마 주의보가 내렸다더군요.", "vietnamese": "Nghe nói đã có cảnh báo về mùa mưa."},
      {"korean": "그 영화 재미있다더라.", "vietnamese": "Tôi thấy người ta bảo bộ phim đó hay lắm."},
      {"korean": "유미네 집은 식구가 많다던데.", "vietnamese": "Nghe nói gia đình Yumi có nhiều thành viên lắm."},
      {"korean": "승규는 연말까지 바쁘다더군요.", "vietnamese": "Tôi thấy người ta bảo Seung Gyu bận đến cuối năm."},
      {"korean": "올 봄에는 황사가 심하다더군요.", "vietnamese": "Tôi thấy người ta bảo vào mùa xuân năm nay hiện tượng cát vàng rất nghiêm trọng."}
    ]'::jsonb,
    ARRAY['A/V – (느)ㄴ다니까', 'A/V – (으)더군요', 'A/V – (으)더라고요']::TEXT[],
    ARRAY['quotation', 'indirect-speech', 'hearsay', 'recall', 'topik4', 'intermediate']::TEXT[],
    'TOPIK IV'
  ) RETURNING id
)
INSERT INTO public.practice_questions (pattern_id, question, options, answer, explanation)
SELECT p214.id,
  '그 영화 재미있___.',
  ARRAY['다더라', '다니까', '다면서', '다거나'],
  0,
  '들은 것을 회상하여 전달 → 재미있다더라'
FROM p214;

-- #215 A/V – (느)ㄴ다든가 = (느)ㄴ다든지
WITH p215 AS (
  INSERT INTO public.grammar_patterns (
    pattern, romanization, meaning, level, category,
    explanation, usage, examples, related_patterns, tags, topik_level
  ) VALUES (
    'A/V – (느)ㄴ다든가 / (느)ㄴ다든지',
    'neundadeonga',
    'Dù nói là... hay nói là... (liệt kê trích dẫn)',
    'intermediate',
    'quotation',
    E'Liệt kê lựa chọn ở dạng trích dẫn. Có thể thay thế bằng (느)ㄴ다거나. Hai dạng (느)ㄴ다든가 và (느)ㄴ다든지 có nghĩa tương đương và có thể dùng thay thế nhau.',
    'V + (느)ㄴ다든가/든지 / A + 다든가/든지 / N + (이)라든가/든지',
    '[
      {"korean": "집에 가겠다든가 남아 있겠다든가 말을 해야지?", "vietnamese": "Bạn phải nói là sẽ về nhà hay ở lại chứ?"},
      {"korean": "옳다든가 그르다든가 하는 판단을 해야 한다.", "vietnamese": "Bạn phải đoán đúng hay sai."},
      {"korean": "같이 가겠다든지 안 가겠다든지 말을 해야 널 기다리든지 말든지 할 거 아냐?", "vietnamese": "Bạn phải nói là có đi cùng hay không thì mới có thể đợi bạn hoặc không chứ?"},
      {"korean": "쇼핑하러 간다든지 운동을 하러 간다든지 빨리 대답해.", "vietnamese": "Đi mua sắm hay đi thể dục thì hãy trả lời nhanh giùm."},
      {"korean": "주말에 쉰다든지 여행간다든지 어떻게 할 건지 말해 줘.", "vietnamese": "Cuối tuần nghỉ ngơi hay đi du lịch, định làm gì thì làm ơn nói ra giùm."},
      {"korean": "지금 기분이 좋다든지 나쁘다든지 네 기분을 말해 줘.", "vietnamese": "Tâm trạng hiện giờ của cậu là tốt hay xấu thì nói ra coi nào."},
      {"korean": "영화가 어땠어? 재미있다든지 재미없다든지 네 생각을 좀 듣고 싶어.", "vietnamese": "Bộ phim thế nào? Mình muốn nghe suy nghĩ của cậu xem thú vị hay tẻ nhạt."}
    ]'::jsonb,
    ARRAY['A/V – (느)ㄴ다거나', 'A/V – 거나', 'A/V – 든지']::TEXT[],
    ARRAY['quotation', 'indirect-speech', 'listing', 'choice', 'topik4', 'intermediate']::TEXT[],
    'TOPIK IV'
  ) RETURNING id
)
INSERT INTO public.practice_questions (pattern_id, question, options, answer, explanation)
SELECT p215.id,
  '집에 가겠___ 남아 있겠___ 말을 해야지?',
  ARRAY['다든가 다든가', '다거나 다거나', '다면서 다면서', '다니까 다니까'],
  0,
  '인용 형식으로 선택지 열거 → 가겠다든가 있겠다든가'
FROM p215;

-- #217 A/V – (느)ㄴ다지 뭐예요?
WITH p217 AS (
  INSERT INTO public.grammar_patterns (
    pattern, romanization, meaning, level, category,
    explanation, usage, examples, related_patterns, tags, topik_level
  ) VALUES (
    'A/V – (느)ㄴ다지 뭐예요?',
    'neundaji mwoyeyo',
    'Gì mà bảo là... / Bảo là... cái gì cơ',
    'intermediate',
    'quotation',
    E'Sau khi nghe điều gì đó từ người khác thì chưa hài lòng về điều đó. Dạng trích dẫn của cấu trúc 이/가 뭐예요? (cái gì mà...). Thể hiện sự ngạc nhiên hoặc không đồng ý với thông tin đã nghe.',
    'V + (느)ㄴ다지 뭐예요? / A + 다지 뭐예요? / N + (이)라지 뭐예요?',
    '[
      {"korean": "제 할아버지를 닮았다지 뭐예요?", "vietnamese": "Gì mà bảo là giống ông nội?"},
      {"korean": "좋은 집을 소개해 주었더니 벌써 하숙집을 찾았다지 뭐예요?", "vietnamese": "Tôi đã giới thiệu cho ngôi nhà tốt vậy mà sao còn nói đã tìm được nhà trọ rồi."},
      {"korean": "그 사람이 결혼한다지 뭐예요?", "vietnamese": "Gì mà bảo là kết hôn cùng người đó?"}
    ]'::jsonb,
    ARRAY['A/V – (느)ㄴ다니까', 'A/V – (느)ㄴ다더군요', '이/가 뭐예요?']::TEXT[],
    ARRAY['quotation', 'indirect-speech', 'dissatisfaction', 'surprise', 'topik4', 'intermediate']::TEXT[],
    'TOPIK IV'
  ) RETURNING id
)
INSERT INTO public.practice_questions (pattern_id, question, options, answer, explanation)
SELECT p217.id,
  '그 사람이 결혼한___ 뭐예요?',
  ARRAY['다지', '다니까', '다면서', '다거나'],
  0,
  '들은 내용에 대한 불만/놀람 표현 → 결혼한다지 뭐예요?'
FROM p217;

-- #218 A/V – (으)ㅁ (명사형)
WITH p218 AS (
  INSERT INTO public.grammar_patterns (
    pattern, romanization, meaning, level, category,
    explanation, usage, examples, related_patterns, tags, topik_level
  ) VALUES (
    'A/V – (으)ㅁ',
    'eum',
    'Danh từ hóa tính từ/động từ (thể văn viết)',
    'intermediate',
    'nominalization',
    E'Dùng khi chuyển đổi tính từ hoặc động từ sang dạng danh từ. Được sử dụng khi cho người khác biết một cách ngắn gọn về thực tế nào đó. Chủ yếu sử dụng ở thể văn viết như ở các mẩu tin tức, tờ hướng dẫn, quảng cáo, ghi chú... thể hiện văn phong trung tính. Danh từ hóa các mệnh đề đã xảy ra, đã hoàn thành hoặc được quyết định. Một số danh từ phổ biến: 믿음, 죽음, 웃음, 걸음, 얼음, 꿈, 삶, 앎, 잠, 춤, 기쁨, 슬픔, 느낌, 도움, 모임...',
    'V + (으)ㅁ / A + (으)ㅁ',
    '[
      {"korean": "연구 결과에 따르면 된장은 혈압을 낮추는 효능이 있음을 알 수 있다.", "vietnamese": "Kết quả nghiên cứu cho thấy đậu tương có tác dụng làm giảm huyết áp."},
      {"korean": "내일 수업이 없음을 학생들에게 알려 주세요.", "vietnamese": "Hãy thông báo cho học sinh việc không có lớp vào ngày mai."},
      {"korean": "나 때문에 친구가 곤란해졌다는 이야기를 듣고 미안함을 느꼈다.", "vietnamese": "Nghe chuyện vì tôi mà bạn trở nên khổ sở tôi cảm thấy có lỗi."},
      {"korean": "비가 오겠음.", "vietnamese": "Trời sẽ mưa."},
      {"korean": "새로 가입하신 여러분을 환영함.", "vietnamese": "Chào mừng các bạn mới gia nhập."},
      {"korean": "관계자 이외에는 들어오지 못함.", "vietnamese": "Không phận sự miễn vào."},
      {"korean": "수사 결과, 김 씨가 범인이 아님이 밝혀졌어요.", "vietnamese": "Theo kết quả điều tra, người ta làm rõ rằng anh Kim không phải phạm nhân."},
      {"korean": "따뜻한 바람을 맞으며 나는 겨울이 가고 봄이 왔음을 느꼈어요.", "vietnamese": "Làn gió ấm áp thổi vào và tôi có cảm giác như đông đã qua, xuân đã tới."}
    ]'::jsonb,
    ARRAY['V + 기', 'V + 는 것', 'A/V – (으)ㄴ/는지']::TEXT[],
    ARRAY['nominalization', 'formal', 'written', 'news', 'notice', 'topik4', 'intermediate']::TEXT[],
    'TOPIK IV'
  ) RETURNING id
)
INSERT INTO public.practice_questions (pattern_id, question, options, answer, explanation)
SELECT p218.id,
  '내일 수업이 없___ 학생들에게 알려 주세요.',
  ARRAY['음을', '기를', '는 것을', '는지를'],
  0,
  '공지/안내문 체: 사실 명사화 → 없음을'
FROM p218;

-- #219 V – 는 데(에)(는)
WITH p219 AS (
  INSERT INTO public.grammar_patterns (
    pattern, romanization, meaning, level, category,
    explanation, usage, examples, related_patterns, tags, topik_level
  ) VALUES (
    'V – 는 데(에)(는)',
    'neun de',
    'Đối với việc... / Cho việc gì đó',
    'intermediate',
    'purpose',
    E'Biểu hiện ý nghĩa: 는 일, 는 것, 는 경우 hay 는 상황. Chủ yếu được sử dụng cùng với các cụm từ như: 도움이 되다, 효과가 있다/없다, 좋다/나쁘다, 필요하다, 몰두하다, 최선을 다하다, 사용하다, 걸리다, 들다. Có thể dùng dưới dạng 는 데에 hoặc thêm 는 để nhấn mạnh.',
    'V + 는 데(에)(는) / A + (으)ㄴ 데(에)(는)',
    '[
      {"korean": "김치가 노화를 억제하고 암을 예방하는 데(에) 도움이 된다고 한다.", "vietnamese": "Người ta nói rằng kimchi giúp cho việc ngăn chặn lão hóa và ngăn ngừa ung thư."},
      {"korean": "그 작가가 이 작품을 완성하는 데(에) 10년이나 걸린다고 한다.", "vietnamese": "Người ta nói rằng tác giả đã mất tận 10 năm để hoàn thành tác phẩm này."},
      {"korean": "건강을 지키는 데에 담배는 좋지 않아요.", "vietnamese": "Thuốc lá không tốt cho việc giữ gìn sức khỏe."},
      {"korean": "휴식은 피로를 푸는 데에 효과가 있어요.", "vietnamese": "Nghỉ giải lao có ích cho việc giải tỏa mệt mỏi."},
      {"korean": "이 물건들은 그림을 그리는 데 필요한 도구와 재료들이다.", "vietnamese": "Những vật dụng này là dụng cụ và vật liệu cần thiết trong việc vẽ tranh."},
      {"korean": "머리 아픈 데에 이 약이 좋아요.", "vietnamese": "Thuốc này rất tốt khi bị đau đầu."}
    ]'::jsonb,
    ARRAY['V + 기 위해(서)', 'V + (으)려고', 'V + 는 것']::TEXT[],
    ARRAY['purpose', 'context', 'situation', 'topik4', 'intermediate']::TEXT[],
    'TOPIK IV'
  ) RETURNING id
)
INSERT INTO public.practice_questions (pattern_id, question, options, answer, explanation)
SELECT p219.id,
  '건강을 지키는 ___ 담배는 좋지 않아요.',
  ARRAY['데에', '기에', '길래', '나머지'],
  0,
  '어떤 일/상황에 관해: 건강을 지키는 데에'
FROM p219;

-- ─────────────────────────────────────────────────────────────────────────────
-- TOPIK 5 Patterns (#210–213, #216)
-- ─────────────────────────────────────────────────────────────────────────────

-- #210 A/V – (느)ㄴ다거늘
WITH p210 AS (
  INSERT INTO public.grammar_patterns (
    pattern, romanization, meaning, level, category,
    explanation, usage, examples, related_patterns, tags, topik_level
  ) VALUES (
    'A/V – (느)ㄴ다거늘',
    'neundageoneul',
    'Nói là... sao lại... (trích dẫn + phản biện)',
    'advanced',
    'quotation',
    E'Mang ý nghĩa 거늘: vốn dĩ nói là vế trước vẫn như vậy, vế sau có sự khác biệt hoặc phản biện. Thể hiện sự ngạc nhiên hoặc không đồng ý khi thực tế khác với những gì đã được nói.',
    'V + (느)ㄴ다거늘 / A + 다거늘',
    '[
      {"korean": "모두들이 괜찮다거늘 혼자만 싫다고 하네.", "vietnamese": "Tất cả đều bảo là không sao hà cớ sao mình bạn lại nói là không thích."},
      {"korean": "다른 사람들은 모두 더웠다거늘 넌 왜 그런 소리도 안 하니?", "vietnamese": "Tất cả đều bảo nóng mà sao cậu lại không thấy vậy?"}
    ]'::jsonb,
    ARRAY['A/V – 거늘', 'A/V – (느)ㄴ다거나', 'A/V – (느)ㄴ다건만']::TEXT[],
    ARRAY['quotation', 'indirect-speech', 'contrast', 'literary', 'topik5', 'advanced']::TEXT[],
    'TOPIK V'
  ) RETURNING id
)
INSERT INTO public.practice_questions (pattern_id, question, options, answer, explanation)
SELECT p210.id,
  '모두들이 괜찮___ 혼자만 싫다고 하네.',
  ARRAY['다거늘', '다거나', '다든지', '다면서'],
  0,
  '인용+반전: 모두 말했는데 혼자 반대 → 괜찮다거늘'
FROM p210;

-- #211 A/V – (느)ㄴ다건만
WITH p211 AS (
  INSERT INTO public.grammar_patterns (
    pattern, romanization, meaning, level, category,
    explanation, usage, examples, related_patterns, tags, topik_level
  ) VALUES (
    'A/V – (느)ㄴ다건만',
    'neundageonman',
    'Nói là... nhưng... (trích dẫn + tương phản)',
    'advanced',
    'quotation',
    E'Dạng trích dẫn của cấu trúc 건만/건마는. Nối lời nói hoặc nhận định ở vế trước với thực tế tương phản ở vế sau. Mang sắc thái văn viết, cổ điển.',
    'V + (느)ㄴ다건만 / A + 다건만 / V + (으)ㄹ 거라건만',
    '[
      {"korean": "그는 전에 꽤 착한 학생이었다건만 어쩌다가 이렇게 되었나?", "vietnamese": "Người ta nói trước đây anh ấy là học sinh hiền lành nhưng có chuyện gì mà lại thành ra thế này?"},
      {"korean": "그는 부유한 집 아들이었다건만 지금 집 한 채도 없어요.", "vietnamese": "Nói anh ấy là con trai nhà giàu có nhưng bây giờ anh ấy không có ngôi nhà nào."},
      {"korean": "운동을 열심히 한다건마는 살은 빠지는 게 아니에요.", "vietnamese": "Nói là tập thể dục chăm chỉ nhưng không hẳn là sẽ giảm cân."}
    ]'::jsonb,
    ARRAY['A/V – (느)ㄴ다거늘', 'A/V – 건만', 'A/V – 지만']::TEXT[],
    ARRAY['quotation', 'indirect-speech', 'contrast', 'literary', 'topik5', 'advanced']::TEXT[],
    'TOPIK V'
  ) RETURNING id
)
INSERT INTO public.practice_questions (pattern_id, question, options, answer, explanation)
SELECT p211.id,
  '그는 부유한 집 아들이었___ 지금 집 한 채도 없어요.',
  ARRAY['다건만', '다거늘', '다니까', '다면서'],
  0,
  '인용+역접: 말과 현실의 대조 → 이었다건만'
FROM p211;

-- #212 A/V – (느)ㄴ다고나 할까요?
WITH p212 AS (
  INSERT INTO public.grammar_patterns (
    pattern, romanization, meaning, level, category,
    explanation, usage, examples, related_patterns, tags, topik_level
  ) VALUES (
    'A/V – (느)ㄴ다고나 할까요?',
    'neundagona halkkayo',
    'Liệu có phải là... (hỏi tránh, nói vòng)',
    'advanced',
    'quotation',
    E'Ở dạng câu hỏi, không nói trực tiếp mà có ý hỏi để nói tránh hoặc diễn đạt một cách tế nhị. Người nói không chắc chắn về từ ngữ phù hợp và muốn xác nhận cách diễn đạt.',
    'V + (느)ㄴ다고나 할까요? / A + 다고나 할까요?',
    '[
      {"korean": "드라마는 인생과 비슷하다고나 할까?", "vietnamese": "Liệu có phải bộ phim giống với đời thực không?"},
      {"korean": "제 성격은 좀 내성적이라고나 할까요?", "vietnamese": "Tính cách của tôi liệu có phải là nhút nhát không?"}
    ]'::jsonb,
    ARRAY['A/V – (느)ㄴ다고 할까요?', 'A/V – (으)ㄹ까요?', 'A/V – 라고나']::TEXT[],
    ARRAY['quotation', 'indirect-speech', 'tentative', 'polite', 'topik5', 'advanced']::TEXT[],
    'TOPIK V'
  ) RETURNING id
)
INSERT INTO public.practice_questions (pattern_id, question, options, answer, explanation)
SELECT p212.id,
  '제 성격은 좀 내성적이라___ 할까요?',
  ARRAY['고나', '고는', '거나', '건만'],
  0,
  '에둘러 표현: 직접 말하지 않고 돌려 말함 → 이라고나 할까요?'
FROM p212;

-- #213 A/V – (느)ㄴ다는데야
WITH p213 AS (
  INSERT INTO public.grammar_patterns (
    pattern, romanization, meaning, level, category,
    explanation, usage, examples, related_patterns, tags, topik_level
  ) VALUES (
    'A/V – (느)ㄴ다는데야',
    'neundaneundeya',
    'Một khi đã nói là... (thì không thể làm gì khác)',
    'advanced',
    'quotation',
    E'Nếu ở điều kiện đó thì không còn làm gì được khác. Người nói chấp nhận tình huống do lời nói ở vế trước gây ra, dù có thể không hoàn toàn hài lòng.',
    'V + (느)ㄴ다는데야 / A + 다는데야',
    '[
      {"korean": "제가 싫다는데야 부모인들 강요할 수 있나?", "vietnamese": "Một khi tôi đã nói là không thích thì bố mẹ có thể ép buộc được sao?"},
      {"korean": "선생님께서 그렇게 하신다는데야 말릴 방법이 있겠나?", "vietnamese": "Một khi cô giáo đã nói như vậy thì có cách nào ngăn cản được không?"},
      {"korean": "밥을 공짜로 준다는데야 마다할 이유가 없지.", "vietnamese": "Một khi họ đã nói là cơm được cho miễn phí thì không có lí do gì để từ chối cả."},
      {"korean": "먹고 살기 바빠 자주 못 온다는데야 할 말은 없지만 서운하구나.", "vietnamese": "Một khi họ đã nói là vì bận rộn kiếm sống nên không thể đến thường xuyên được thì đúng là không có gì để nói, nhưng mà buồn thật đấy."},
      {"korean": "예뻐진다는데야 맛이 대수니?", "vietnamese": "Nghe nói là uống nó thì sẽ đẹp lên thì vị có quan trọng sao?"}
    ]'::jsonb,
    ARRAY['A/V – (느)ㄴ다면야', 'A/V – (으)면야', 'A/V – (느)ㄴ다는데']::TEXT[],
    ARRAY['quotation', 'indirect-speech', 'concession', 'acceptance', 'topik5', 'advanced']::TEXT[],
    'TOPIK V'
  ) RETURNING id
)
INSERT INTO public.practice_questions (pattern_id, question, options, answer, explanation)
SELECT p213.id,
  '밥을 공짜로 준___ 마다할 이유가 없지.',
  ARRAY['다는데야', '다니까', '다거늘', '다건만'],
  0,
  '주어진 조건에 대한 수용: 준다는데야 거부 불가'
FROM p213;

-- #216 A/V – (느)ㄴ다손 치더라도
WITH p216 AS (
  INSERT INTO public.grammar_patterns (
    pattern, romanization, meaning, level, category,
    explanation, usage, examples, related_patterns, tags, topik_level
  ) VALUES (
    'A/V – (느)ㄴ다손 치더라도',
    'neundasson chideorado',
    'Cho dù (nói là)... đi chăng nữa',
    'advanced',
    'quotation',
    E'Nhận định lời nói vế trước và điều đó không gây ảnh hưởng đến vế sau. Có thể thay thế bằng 다고 하더라도. Thường đi kèm với 아무리 (dù bao nhiêu, dù thế nào).',
    'V + (느)ㄴ다손 치더라도 / A + 다손 치더라도',
    '[
      {"korean": "아무리 바쁘다손 치더라도 밥은 먹어야 한다.", "vietnamese": "Cho dù bận thế nào đi chăng nữa thì cũng phải ăn cơm chứ."},
      {"korean": "아무리 빨리 간다손 치더라도 약속 시간에 맞춰 갈 수는 없다.", "vietnamese": "Cho dù có đi nhanh thế nào đi chăng nữa cũng không thể đến đúng giờ hẹn."},
      {"korean": "음식이 맛이 없다손 치더라도 만든 사람 앞에서 그렇게 티를 내면 안 되지.", "vietnamese": "Ngay cả khi thức ăn không ngon thì trước mặt người nấu cũng không được tỏ ra như vậy chứ."},
      {"korean": "아무리 비만 때문에 고민한다손 치더라도 매일 굶다니요?", "vietnamese": "Cho dù có khổ tâm vì béo phì đi nữa thì ngày ngày nhịn ăn được sao?"},
      {"korean": "아무리 바쁘다손 치더라도 부모님께 인사는 드리고 나가자.", "vietnamese": "Cho dù là vội thế nào đi nữa thì cũng hãy chào bố mẹ rồi đi nào."}
    ]'::jsonb,
    ARRAY['A/V – 다고 하더라도', 'A/V – 아/어도', 'A/V – (으)ㄹ지라도']::TEXT[],
    ARRAY['quotation', 'indirect-speech', 'concession', 'even-if', 'topik5', 'advanced']::TEXT[],
    'TOPIK V'
  ) RETURNING id
)
INSERT INTO public.practice_questions (pattern_id, question, options, answer, explanation)
SELECT p216.id,
  '아무리 바쁘___ 밥은 먹어야 한다.',
  ARRAY['다손 치더라도', '다거늘', '다건만', '다는데야'],
  0,
  '아무리+양보: 아무리 바쁘다손 치더라도 → 결과 변화 없음'
FROM p216;
