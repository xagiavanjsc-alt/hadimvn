-- Seoul 4B Lesson 10: 옛날이야기와 신화 (Truyện cổ tích và Thần thoại)
-- Generated from src/mocks/data/seoul-books-data.ts

BEGIN;

-- ── Clean up existing data for 4B-L10 ──────────────────────────────────────
DELETE FROM seoul_dialogue WHERE lesson_id = '4B-L10';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4B-L10');
DELETE FROM seoul_grammar WHERE lesson_id = '4B-L10';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4B-L10';

-- ── Upsert lesson ──────────────────────────────────────────────────────────
INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES (
  '4B-L10', '4B', 10,
  '옛날이야기와 신화',
  'Truyện cổ tích và Thần thoại',
  ARRAY['Kể và thảo luận về truyện cổ tích, thần thoại Hàn Quốc', 'Học từ vựng về tính cách nhân vật và cốt truyện', 'Dùng ~았/었더니, ~(으)ㄴ 채로 trong kể chuyện']::text[],
  '단군 신화 이야기 (Câu chuyện thần thoại Dangun)',
  'Thần thoại Dangun (단군 신화) là thần thoại lập quốc của Hàn Quốc, kể về việc Dangun lập ra Gojoseon năm 2333 trước Công nguyên. Con hổ (호랑이) là linh vật biểu tượng của Hàn Quốc — xuất hiện trên quốc huy, là linh vật Olympic Seoul 1988. Trong văn hóa Hàn, hổ tượng trưng cho sức mạnh và dũng khí.'
)
ON CONFLICT (id) DO UPDATE SET
  book_id        = EXCLUDED.book_id,
  lesson_number  = EXCLUDED.lesson_number,
  title          = EXCLUDED.title,
  title_vi       = EXCLUDED.title_vi,
  objectives     = EXCLUDED.objectives,
  dialogue_title = EXCLUDED.dialogue_title,
  cultural_tip   = EXCLUDED.cultural_tip;

-- ── Vocabulary (63 entries) ────────────────────────────────────────────────
INSERT INTO seoul_vocabulary (lesson_id, book_id, korean, pronunciation, vietnamese, part_of_speech, example, example_vi)
VALUES
  ('4B-L10', '4B', '어리석다', 'eo-ri-seok-da', 'Ngu dốt, ngốc nghếch', 'Tính từ', '어리석은 행동을 했어요.', 'Đã làm hành động ngu ngốc.'),
  ('4B-L10', '4B', '영리하다', 'yeong-ni-ha-da', 'Lanh lợi, thông minh', 'Tính từ', '영리한 아이예요.', 'Là đứa trẻ lanh lợi.'),
  ('4B-L10', '4B', '겁이 많다', 'geo-bi man-ta', 'Nhút nhát, hay sợ', 'Cụm tính từ', '겁이 많아서 혼자 못 가요.', 'Nhút nhát nên không đi một mình được.'),
  ('4B-L10', '4B', '의리가 있다', 'ui-ri-ga it-da', 'Có tình nghĩa, trọng nghĩa', 'Cụm tính từ', '의리가 있는 친구예요.', 'Là người bạn trọng nghĩa.'),
  ('4B-L10', '4B', '욕심이 많다', 'yok-si-mi man-ta', 'Tham lam, tham muốn nhiều', 'Cụm tính từ', '욕심이 많아서 벌을 받았어요.', 'Vì tham lam nên bị phạt.'),
  ('4B-L10', '4B', '참을성이 많다', 'cha-meul-seong-i man-ta', 'Tính chịu đựng cao, kiên nhẫn', 'Cụm tính từ', '참을성이 많은 사람이에요.', 'Là người rất kiên nhẫn.'),
  ('4B-L10', '4B', '은혜를 갚다', 'eun-hye-reul gap-da', 'Trả ơn, đền ơn', 'Cụm động từ', '은혜를 갚았어요.', 'Đã đền ơn.'),
  ('4B-L10', '4B', '벌을 받다', 'beo-reul bat-da', 'Bị phạt', 'Cụm động từ', '나쁜 행동을 해서 벌을 받았어요.', 'Vì làm điều xấu nên bị phạt.'),
  ('4B-L10', '4B', '놀림을 받다', 'nol-li-meul bat-da', 'Bị trêu chọc, bị chế nhạo', 'Cụm động từ', '친구들에게 놀림을 받았어요.', 'Bị bạn bè trêu chọc.'),
  ('4B-L10', '4B', '복수를 하다', 'bok-su-reul ha-da', 'Trả thù', 'Cụm động từ', '나중에 복수를 했어요.', 'Về sau đã trả thù.'),
  ('4B-L10', '4B', '청개구리', 'cheong-gae-gu-ri', 'Ếch xanh (ẩ dụ: đứa trẻ hay làm ngược lại)', 'Danh từ', '청개구리 같은 아이예요.', 'Là đứa trẻ hay làm ngược lại.'),
  ('4B-L10', '4B', '곰 같다', 'gom gat-da', 'Giống con gấu (chậm chạp, hiền lành)', 'Cụm tính từ', '성격이 곰 같아요.', 'Tính cách giống con gấu.'),
  ('4B-L10', '4B', '여우 같다', 'yeo-u gat-da', 'Giống con cáo (xảo quyệt, khôn ngoan)', 'Cụm tính từ', '여우 같은 사람이에요.', 'Là người giống con cáo.'),
  ('4B-L10', '4B', '호랑이 같다', 'ho-rang-i gat-da', 'Giống con hổ (dũng mãnh, oai phong)', 'Cụm tính từ', '호랑이 같은 장군이에요.', 'Là vị tướng oai phong như hổ.'),
  ('4B-L10', '4B', '정의로움', 'jeong-ui-ro-um', 'Sự chính nghĩa, chính đạo', 'Danh từ', '정의로움을 위해 싸워요.', 'Chiến đấu vì chính nghĩa.'),
  ('4B-L10', '4B', '상징하다', 'sang-jing-ha-da', 'Tượng trưng, biểu trưng', 'Động từ', '호랑이는 용기를 상징해요.', 'Con hổ tượng trưng cho dũng khí.'),
  ('4B-L10', '4B', '전설', 'jeon-seol', 'Truyền thuyết', 'Danh từ', '한국에는 많은 전설이 있어요.', 'Hàn Quốc có nhiều truyền thuyết.'),
  ('4B-L10', '4B', '판단하다', 'pan-dan-ha-da', 'Phán đoán, phán xét', 'Động từ', '상황을 판단했어요.', 'Đã phán đoán tình huống.'),
  ('4B-L10', '4B', '관리', 'gwal-li', 'Quản lý, quan lại', 'Danh từ', '관리가 백성을 다스렸어요.', 'Quan lại quản lý thần dân.'),
  ('4B-L10', '4B', '수놓다', 'su-no-ta', 'Thêu dệt, thêu thùa', 'Động từ', '천에 꽃을 수놓았어요.', 'Đã thêu hoa lên vải.'),
  ('4B-L10', '4B', '상', 'sang', 'Giải thưởng, phần thưởng', 'Danh từ', '상을 받았어요.', 'Đã nhận giải thưởng.'),
  ('4B-L10', '4B', '국회의사당', 'guk-hoe-ui-sa-dang', 'Tòa nhà quốc hội', 'Danh từ', '국회의사당을 방문했어요.', 'Đã thăm tòa nhà quốc hội.'),
  ('4B-L10', '4B', '쌍', 'ssang', 'Cặp, đôi', 'Danh từ', '호랑이 한 쌍이 있어요.', 'Có một cặp hổ.'),
  ('4B-L10', '4B', '상징', 'sang-jing', 'Biểu tượng, sự tượng trưng', 'Danh từ', '호랑이는 한국의 상징이에요.', 'Con hổ là biểu tượng của Hàn Quốc.'),
  ('4B-L10', '4B', '아이콘', 'a-i-kon', 'Biểu tượng, icon', 'Danh từ', '문화 아이콘이 됐어요.', 'Đã trở thành biểu tượng văn hóa.'),
  ('4B-L10', '4B', '선정하다', 'seon-jeong-ha-da', 'Tuyển chọn, lựa chọn', 'Động từ', '대표 동물로 선정됐어요.', 'Được tuyển chọn làm động vật đại diện.'),
  ('4B-L10', '4B', '유니콘', 'yu-ni-kon', 'Kỳ lân (một sừng)', 'Danh từ', '유니콘은 상상의 동물이에요.', 'Kỳ lân là động vật tưởng tượng.'),
  ('4B-L10', '4B', '진열하다', 'ji-nyeol-ha-da', 'Trưng bày, xếp bày', 'Động từ', '박물관에 진열됐어요.', 'Được trưng bày trong bảo tàng.'),
  ('4B-L10', '4B', '자연스럽다', 'ja-yeon-seu-reop-da', 'Tự nhiên, hồn nhiên', 'Tính từ', '자연스럽게 행동해요.', 'Hành xử một cách tự nhiên.'),
  ('4B-L10', '4B', '모범생', 'mo-beom-saeng', 'Học sinh gương mẫu', 'Danh từ', '모범생으로 알려져 있어요.', 'Được biết đến là học sinh gương mẫu.'),
  ('4B-L10', '4B', '철이 없다', 'cheo-ri eop-da', 'Chưa chín chắn, thiếu chín chắn', 'Cụm tính từ', '철이 없는 행동이에요.', 'Là hành động thiếu chín chắn.'),
  ('4B-L10', '4B', '완벽하다', 'wan-byeo-ka-da', 'Hoàn hảo, hoàn toàn', 'Tính từ', '완벽한 계획이에요.', 'Là kế hoạch hoàn hảo.'),
  ('4B-L10', '4B', '이기적이다', 'i-gi-jeo-gi-da', 'Ích kỷ, vị kỷ', 'Tính từ', '이기적인 행동을 했어요.', 'Đã có hành động ích kỷ.'),
  ('4B-L10', '4B', '챙기다', 'chaeng-gi-da', 'Sắp xếp, lo liệu, chăm sóc', 'Động từ', '짐을 챙겼어요.', 'Đã sắp xếp đồ đạc.'),
  ('4B-L10', '4B', '입장', 'ip-jang', 'Lập trường, quan điểm', 'Danh từ', '입장을 밝혔어요.', 'Đã nói rõ lập trường.'),
  ('4B-L10', '4B', '장만하다', 'jang-man-ha-da', 'Sắm sửa (đồ vật lớn)', 'Động từ', '집을 장만했어요.', 'Đã sắm được nhà.'),
  ('4B-L10', '4B', '품질', 'pum-jil', 'Chất lượng', 'Danh từ', '품질이 좋아요.', 'Chất lượng tốt.'),
  ('4B-L10', '4B', '동전', 'dong-jeon', 'Tiền xu', 'Danh từ', '동전을 모아요.', 'Thu thập tiền xu.'),
  ('4B-L10', '4B', '지폐', 'ji-pye', 'Tiền giấy', 'Danh từ', '지폐로 계산했어요.', 'Đã thanh toán bằng tiền giấy.'),
  ('4B-L10', '4B', '잡아먹다', 'ja-ba-meok-da', 'Bắt rồi ăn, ăn thịt', 'Động từ', '호랑이가 잡아먹었어요.', 'Con hổ đã ăn thịt.'),
  ('4B-L10', '4B', '달래다', 'dal-lae-da', 'Dỗ dành, vỗ về', 'Động từ', '우는 아이를 달랬어요.', 'Đã dỗ dành đứa trẻ đang khóc.'),
  ('4B-L10', '4B', '강연', 'gang-yeon', 'Bài giảng, diễn thuyết', 'Danh từ', '강연을 들었어요.', 'Đã nghe bài diễn thuyết.'),
  ('4B-L10', '4B', '등장하다', 'deung-jang-ha-da', 'Xuất hiện, ra mắt', 'Động từ', '주인공이 등장했어요.', 'Nhân vật chính đã xuất hiện.'),
  ('4B-L10', '4B', '괴롭히다', 'goe-ro-pi-da', 'Làm phiền, hành hạ, bắt nạt', 'Động từ', '약자를 괴롭히면 안 돼요.', 'Không được bắt nạt người yếu.'),
  ('4B-L10', '4B', '나그네', 'na-geu-ne', 'Lữ khách, người phiêu du', 'Danh từ', '나그네가 마을에 도착했어요.', 'Lữ khách đã đến làng.'),
  ('4B-L10', '4B', '깊다', 'gip-da', 'Sâu, thâm sâu', 'Tính từ', '우물이 깊어요.', 'Giếng rất sâu.'),
  ('4B-L10', '4B', '구멍에 빠지다', 'gu-myeong-e bba-ji-da', 'Rơi xuống hố, sa vào bẫy', 'Cụm động từ', '구멍에 빠졌어요.', 'Đã rơi xuống hố.'),
  ('4B-L10', '4B', '꺼내다', 'kkeo-nae-da', 'Lấy ra, mang ra', 'Động từ', '가방에서 꺼냈어요.', 'Đã lấy ra từ túi.'),
  ('4B-L10', '4B', '절대', 'jeol-dae', 'Tuyệt đối, nhất định không', 'Phó từ', '절대 포기하지 않아요.', 'Tuyệt đối không bỏ cuộc.'),
  ('4B-L10', '4B', '제발', 'je-bal', 'Làm ơn, xin hãy', 'Phó từ', '제발 살려 주세요.', 'Làm ơn tha cho tôi.'),
  ('4B-L10', '4B', '소나무', 'so-na-mu', 'Cây thông', 'Danh từ', '소나무가 많아요.', 'Có nhiều cây thông.'),
  ('4B-L10', '4B', '함부로', 'ham-bu-ro', 'Bừa bãi, tùy tiện, bất cẩn', 'Phó từ', '함부로 행동하면 안 돼요.', 'Không được hành xử tùy tiện.'),
  ('4B-L10', '4B', '자르다', 'ja-reu-da', 'Cắt, chặt', 'Động từ', '나무를 잘랐어요.', 'Đã chặt cây.'),
  ('4B-L10', '4B', '황소', 'hwang-so', 'Bò đực, trâu bò', 'Danh từ', '황소가 힘이 세요.', 'Con bò đực rất khỏe.'),
  ('4B-L10', '4B', '다스리다', 'da-seu-ri-da', 'Thống trị, cai quản', 'Động từ', '왕이 나라를 다스렸어요.', 'Vua cai quản đất nước.'),
  ('4B-L10', '4B', '동굴', 'dong-gul', 'Hang động', 'Danh từ', '동굴 속에 숨었어요.', 'Đã ẩn trong hang động.'),
  ('4B-L10', '4B', '캄캄하다', 'kam-kam-ha-da', 'Tối tăm, mù mịt', 'Tính từ', '동굴 안이 캄캄해요.', 'Bên trong hang động tối tăm.'),
  ('4B-L10', '4B', '버티다', 'beo-ti-da', 'Chịu đựng, cầm cự', 'Động từ', '힘들어도 버텼어요.', 'Dù khó khăn vẫn cầm cự.'),
  ('4B-L10', '4B', '마침내', 'ma-chim-nae', 'Cuối cùng, rốt cuộc', 'Phó từ', '마침내 성공했어요.', 'Cuối cùng đã thành công.'),
  ('4B-L10', '4B', '세우다', 'se-u-da', 'Dựng lên, lập nên', 'Động từ', '나라를 세웠어요.', 'Đã lập nên đất nước.'),
  ('4B-L10', '4B', '깡충깡충', 'kkang-chung-kkang-chung', 'Tung tăng, nhảy lò cò', 'Phó từ', '토끼가 깡충깡충 뛰었어요.', 'Con thỏ nhảy tung tăng.'),
  ('4B-L10', '4B', '뛰어나다', 'ttwi-eo-na-da', 'Vượt trội, xuất sắc', 'Tính từ', '실력이 뛰어나요.', 'Năng lực xuất sắc.'),
  ('4B-L10', '4B', '뛰어내리다', 'ttwi-eo-nae-ri-da', 'Nhảy xuống', 'Động từ', '높은 곳에서 뛰어내렸어요.', 'Đã nhảy xuống từ chỗ cao.'),
  ('4B-L10', '4B', '무사히', 'mu-sa-hi', 'Một cách an toàn, bình yên', 'Phó từ', '무사히 도착했어요.', 'Đã đến nơi an toàn.'),
  ('4B-L10', '4B', '신화', 'sin-hwa', 'Thần thoại', 'Danh từ', '단군 신화를 배워요.', 'Học thần thoại Dangun.');

-- ── Grammar 1 ──────────────────────────────────────────────────────────────
WITH g1 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L10', '4B',
    '~았/었더니 (Sau khi... thì...)',
    'B2+',
    'Động từ + 았/었더니 = sau khi làm... thì (phát hiện ra / kết quả là)... Dùng khi người nói là chủ thể hành động đầu.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g1, (VALUES
  ('열심히 공부했더니 시험에 합격했어요.', 'Sau khi học chăm chỉ thì đã đậu kỳ thi.'),
  ('욕심을 부렸더니 벌을 받았어요.', 'Sau khi tham lam thì bị phạt.'),
  ('은혜를 갚았더니 복을 받았어요.', 'Sau khi đền ơn thì được phước.')
) AS ex(korean, vietnamese);

-- ── Grammar 2 ──────────────────────────────────────────────────────────────
WITH g2 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L10', '4B',
    '~(으)ㄴ 채로 (Trong khi vẫn còn...)',
    'B2+',
    'Động từ + (으)ㄴ 채로 = trong trạng thái vẫn còn... Mô tả hành động thứ hai xảy ra khi trạng thái từ hành động đầu vẫn còn.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g2, (VALUES
  ('옷을 입은 채로 잠들었어요.', 'Đã ngủ quên trong khi vẫn còn mặc nguyên quần áo.'),
  ('눈을 감은 채로 동굴 안에 있었어요.', 'Đã ở trong hang với đôi mắt nhắm.')
) AS ex(korean, vietnamese);

-- ── Grammar 3 ──────────────────────────────────────────────────────────────
WITH g3 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L10', '4B',
    '~도록 (Để..., cho đến khi...)',
    'B2+',
    'Động từ + 도록 = để..., cho đến khi... Diễn đạt mục đích hoặc mức độ của hành động.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g3, (VALUES
  ('마침내 나라를 세울 수 있도록 버텼어요.', 'Đã cầm cự để cuối cùng có thể lập nên đất nước.'),
  ('무사히 도착할 수 있도록 기도했어요.', 'Đã cầu nguyện để đến nơi bình an.')
) AS ex(korean, vietnamese);

-- ── Dialogue ───────────────────────────────────────────────────────────────
INSERT INTO seoul_dialogue (lesson_id, book_id, speaker, text, translation)
VALUES
  ('4B-L10', '4B', '선생님', '오늘은 단군 신화에 대해 이야기해 볼게요. 단군 신화를 들어 본 적 있어요?', 'Hôm nay chúng ta hãy nói về thần thoại Dangun. Các em đã từng nghe về thần thoại Dangun chưa?'),
  ('4B-L10', '4B', '민준', '네, 곰이 마늘과 쑥을 먹으면서 동굴 안에서 버텼다는 이야기죠?', 'Vâng, là câu chuyện con gấu ăn tỏi và ngải cứu rồi cầm cự trong hang động phải không ạ?'),
  ('4B-L10', '4B', '선생님', '맞아요. 호랑이는 캄캄한 동굴에서 참을성이 없어서 뛰어나왔고, 곰은 마침내 사람이 됐어요.', 'Đúng vậy. Con hổ vì thiếu kiên nhẫn đã nhảy ra khỏi hang tối, còn con gấu cuối cùng đã hóa thành người.'),
  ('4B-L10', '4B', '지수', '그 이야기에서 곰은 참을성이 많고 영리한 동물로 상징되네요.', 'Trong câu chuyện đó, con gấu được tượng trưng là loài vật kiên nhẫn và thông minh nhỉ.'),
  ('4B-L10', '4B', '선생님', '네, 단군은 마침내 고조선을 세우고 나라를 다스렸어요. 이것이 한국 건국 신화예요.', 'Đúng vậy, Dangun cuối cùng đã lập nên Gojoseon và cai quản đất nước. Đây là thần thoại lập quốc của Hàn Quốc.');

COMMIT;
