-- Seoul 4B Lesson 13: 여행의 즐거움 (Niềm vui du lịch)
-- Generated from src/mocks/data/seoul-books-data.ts

BEGIN;

-- ── Clean up existing data for 4B-L13 ─────────────────────────────────────
DELETE FROM seoul_dialogue WHERE lesson_id = '4B-L13';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4B-L13');
DELETE FROM seoul_grammar WHERE lesson_id = '4B-L13';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4B-L13';

-- ── Upsert lesson ──────────────────────────────────────────────────────────
INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES (
  '4B-L13', '4B', 13,
  '여행의 즐거움',
  'Niềm vui du lịch',
  ARRAY['Miêu tả cảnh đẹp thiên nhiên và di tích lịch sử Hàn Quốc', 'Học từ vựng về cảm xúc khi du lịch và phong cảnh', 'Dùng ~아/어 있다, ~(으)ㄹ수록 để diễn đạt trạng thái và cảm nhận']::text[],
  '경복궁 여행 이야기 (Câu chuyện du lịch Gyeongbokgung)',
  'Gyeongbokgung (경복궁) là cung điện chính của triều Joseon, xây năm 1395. Gwanghwamun (광화문) là cổng chính. Tượng hải cẩu (해태) canh cổng tượng trưng cho sự công bằng. Đường Olle (올레길) ở đảo Jeju là mạng lưới đường bộ ven biển dài 425km, nổi tiếng cho những người yêu thích đi bộ.'
)
ON CONFLICT (id) DO UPDATE SET
  book_id        = EXCLUDED.book_id,
  lesson_number  = EXCLUDED.lesson_number,
  title          = EXCLUDED.title,
  title_vi       = EXCLUDED.title_vi,
  objectives     = EXCLUDED.objectives,
  dialogue_title = EXCLUDED.dialogue_title,
  cultural_tip   = EXCLUDED.cultural_tip;

-- ── Vocabulary (30 entries) ────────────────────────────────────────────────
INSERT INTO seoul_vocabulary (lesson_id, book_id, korean, pronunciation, vietnamese, part_of_speech, example, example_vi)
VALUES
  ('4B-L13', '4B', '끝없이 펼쳐지다', 'kkeut-eop-si pyeol-chyeo-ji-da', 'Được mở ra liên tục, trải dài bất tận', 'Cụm động từ', '바다가 끝없이 펼쳐져 있어요.', 'Biển trải dài bất tận.'),
  ('4B-L13', '4B', '빨갛게 물들다', 'ppal-ga-ke mul-deul-da', 'Nhuộm đỏ, đổi sang màu đỏ', 'Cụm động từ', '단풍이 빨갛게 물들었어요.', 'Lá phong đã nhuộm đỏ.'),
  ('4B-L13', '4B', '줄지어 서 있다', 'jul-ji-eo seo it-da', 'Xếp thành hàng liên tiếp', 'Cụm động từ', '나무들이 줄지어 서 있어요.', 'Những cây cối xếp thành hàng liên tiếp.'),
  ('4B-L13', '4B', '꽃으로 가득하다', 'kko-cheu-ro ga-deuk-ha-da', 'Tràn ngập hoa', 'Cụm tính từ', '공원이 꽃으로 가득해요.', 'Công viên tràn ngập hoa.'),
  ('4B-L13', '4B', '머리가 맑아지다', 'meo-ri-ga mal-ga-ji-da', 'Đầu óc trở nên sáng suốt, tỉnh táo', 'Cụm động từ', '산에 오르면 머리가 맑아져요.', 'Leo núi thì đầu óc trở nên tỉnh táo.'),
  ('4B-L13', '4B', '마음이 차분해지다', 'ma-eu-mi cha-bun-hae-ji-da', 'Tâm trạng trở nên bình tĩnh', 'Cụm động từ', '자연 속에 있으면 마음이 차분해져요.', 'Ở trong thiên nhiên thì tâm trạng trở nên bình tĩnh.'),
  ('4B-L13', '4B', '수없이', 'su-eop-si', 'Vô số, không đếm xuể', 'Phó từ', '수없이 많은 별이 떠 있어요.', 'Vô số ngôi sao đang treo trên bầu trời.'),
  ('4B-L13', '4B', '끊임없이', 'kkeun-i-meop-si', 'Không ngừng, liên tục không dứt', 'Phó từ', '끊임없이 노력해요.', 'Cố gắng không ngừng.'),
  ('4B-L13', '4B', '별', 'byeol', 'Ngôi sao', 'Danh từ', '밤하늘에 별이 많아요.', 'Bầu trời đêm có nhiều ngôi sao.'),
  ('4B-L13', '4B', '올레길', 'ol-le-gil', 'Đường Olle (đường bộ Jeju)', 'Danh từ', '제주도 올레길을 걸었어요.', 'Đã đi bộ trên đường Olle ở Jeju.'),
  ('4B-L13', '4B', '장면', 'jang-myeon', 'Cảnh, toàn cảnh, cảnh tượng', 'Danh từ', '아름다운 장면이에요.', 'Là cảnh tượng đẹp.'),
  ('4B-L13', '4B', '광화문', 'gwang-hwa-mun', 'Gwanghwamun (Quang Hóa Môn)', 'Danh từ', '광화문 앞에서 사진을 찍었어요.', 'Đã chụp ảnh trước Gwanghwamun.'),
  ('4B-L13', '4B', '짐승', 'jim-seung', 'Thú vật, mãnh thú', 'Danh từ', '짐승 조각이 웅장해요.', 'Tượng điêu khắc thú vật rất hùng tráng.'),
  ('4B-L13', '4B', '궁궐', 'gung-gwol', 'Cung vua, hoàng cung', 'Danh từ', '조선 시대 궁궐을 방문했어요.', 'Đã thăm hoàng cung thời Joseon.'),
  ('4B-L13', '4B', '칠조룡', 'chil-jo-ryong', 'Rồng bảy móng', 'Danh từ', '칠조룡 조각이 인상적이에요.', 'Tượng rồng bảy móng rất ấn tượng.'),
  ('4B-L13', '4B', '바람에 날리다', 'ba-ra-me nal-li-da', 'Bay theo gió, tung bay trong gió', 'Cụm động từ', '꽃잎이 바람에 날려요.', 'Cánh hoa bay theo gió.'),
  ('4B-L13', '4B', '가슴이 뻥 뚫리다', 'ga-seu-mi bbeong ttul-li-da', 'Tâm trạng u uất được giải phóng, thấy thông thoáng', 'Cụm động từ', '바다를 보니 가슴이 뻥 뚫렸어요.', 'Nhìn ra biển thì thấy thông thoáng hẳn.'),
  ('4B-L13', '4B', '기분이 상쾌해지다', 'gi-bu-ni sang-kwae-hae-ji-da', 'Tâm trạng trở nên sảng khoái', 'Cụm động từ', '여행을 하면 기분이 상쾌해져요.', 'Đi du lịch thì tâm trạng trở nên sảng khoái.'),
  ('4B-L13', '4B', '끝없이', 'kkeut-eop-si', 'Liên tục, vô tận, bất tận', 'Phó từ', '끝없이 이어지는 길이에요.', 'Là con đường kéo dài vô tận.'),
  ('4B-L13', '4B', '말없이', 'mal-eop-si', 'Âm thầm, không nói gì, lặng lẽ', 'Phó từ', '말없이 걸었어요.', 'Đã đi bộ lặng lẽ.'),
  ('4B-L13', '4B', '밤낮없이', 'bam-nat-eop-si', 'Không kể ngày đêm, bất kể ngày đêm', 'Phó từ', '밤낮없이 일했어요.', 'Đã làm việc không kể ngày đêm.'),
  ('4B-L13', '4B', '반하다', 'ban-ha-da', 'Phải lòng, bị mê hoặc, mê say', 'Động từ', '제주도 풍경에 반했어요.', 'Bị mê hoặc bởi phong cảnh Jeju.'),
  ('4B-L13', '4B', '강원도', 'gang-won-do', 'Tỉnh Gangwon', 'Danh từ', '강원도로 여행을 갔어요.', 'Đã đi du lịch tỉnh Gangwon.'),
  ('4B-L13', '4B', '활짝', 'hwal-jjak', 'Rộng mở, nở rộ, toang hoác', 'Phó từ', '꽃이 활짝 피었어요.', 'Hoa đã nở rộ.'),
  ('4B-L13', '4B', '돌다리', 'dol-da-ri', 'Cầu đá', 'Danh từ', '돌다리를 건넜어요.', 'Đã đi qua cầu đá.'),
  ('4B-L13', '4B', '조각되다', 'jo-gak-doe-da', 'Được điêu khắc, được chạm trổ', 'Động từ', '돌에 용이 조각돼 있어요.', 'Rồng được điêu khắc trên đá.'),
  ('4B-L13', '4B', '생동감이 있다', 'saeng-dong-ga-mi it-da', 'Có sự sinh động, sống động', 'Cụm tính từ', '조각품에 생동감이 있어요.', 'Tác phẩm điêu khắc có sự sinh động.'),
  ('4B-L13', '4B', '내밀다', 'nae-mil-da', 'Đưa ra, chìa ra, thò ra', 'Động từ', '손을 내밀었어요.', 'Đã đưa tay ra.'),
  ('4B-L13', '4B', '근정전', 'geun-jeong-jeon', 'Cần Chánh Điện (chính điện Gyeongbokgung)', 'Danh từ', '경복궁 근정전을 구경했어요.', 'Đã tham quan Cần Chánh Điện Gyeongbokgung.'),
  ('4B-L13', '4B', '고궁박물관', 'go-gung-bang-mul-gwan', 'Bảo tàng Cố cung Quốc gia', 'Danh từ', '고궁박물관에서 유물을 봤어요.', 'Đã xem cổ vật ở Bảo tàng Cố cung.');

-- ── Grammar 1 ──────────────────────────────────────────────────────────────
WITH g1 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L13', '4B',
    '~아/어 있다 (Đang ở trạng thái...)',
    'B2+',
    'Động từ + 아/어 있다 = đang ở trạng thái... Diễn đạt kết quả của một hành động vẫn còn duy trì.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g1, (VALUES
  ('나무들이 줄지어 서 있어요.', 'Những cây cối đang xếp thành hàng (và vẫn như thế).'),
  ('꽃잎이 바람에 날려 있어요.', 'Cánh hoa đang bay lơ lửng trong gió.'),
  ('용이 돌에 조각되어 있어요.', 'Rồng đang được điêu khắc trên đá.')
) AS ex(korean, vietnamese);

-- ── Grammar 2 ──────────────────────────────────────────────────────────────
WITH g2 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L13', '4B',
    '~(으)ㄹ수록 (Càng... thì càng...)',
    'B2+',
    'Động từ + (으)ㄹ수록 = càng... thì càng... Diễn đạt mối liên hệ tỉ lệ.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g2, (VALUES
  ('여행을 많이 할수록 견문이 넓어져요.', 'Càng đi du lịch nhiều thì tầm hiểu biết càng rộng.'),
  ('자연 속에 있을수록 마음이 차분해져요.', 'Càng ở trong thiên nhiên thì tâm trạng càng bình tĩnh.')
) AS ex(korean, vietnamese);

-- ── Grammar 3 ──────────────────────────────────────────────────────────────
WITH g3 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L13', '4B',
    '~(으)ㄴ/는 채로 (Trong trạng thái vẫn còn...)',
    'B2+',
    'Động từ + (으)ㄴ/는 채로 = trong khi vẫn còn ở trạng thái... Nhấn mạnh trạng thái duy trì khi hành động khác xảy ra.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g3, (VALUES
  ('눈을 감은 채로 풍경을 느꼈어요.', 'Cảm nhận phong cảnh trong khi mắt vẫn nhắm.'),
  ('서 있는 채로 사진을 찍었어요.', 'Chụp ảnh trong khi vẫn đứng nguyên.')
) AS ex(korean, vietnamese);

-- ── Dialogue ───────────────────────────────────────────────────────────────
INSERT INTO seoul_dialogue (lesson_id, book_id, speaker, text, translation)
VALUES
  ('4B-L13', '4B', '수아', '지난 주말에 경복궁에 갔다 왔는데 정말 인상적이었어요.', 'Cuối tuần vừa rồi tôi đã đến Gyeongbokgung, thật sự rất ấn tượng.'),
  ('4B-L13', '4B', '민재', '어떤 점이 특히 좋았어요?', 'Điểm nào đặc biệt hay vậy?'),
  ('4B-L13', '4B', '수아', '근정전 앞에 서 있으니까 가슴이 뻥 뚫리는 기분이었어요. 짐승 조각들도 생동감이 있었고요.', 'Đứng trước Cần Chánh Điện thấy tâm trạng thông thoáng hẳn. Các tượng điêu khắc thú vật cũng rất sinh động.'),
  ('4B-L13', '4B', '민재', '돌다리에 조각된 칠조룡도 봤어요?', 'Bạn có thấy rồng bảy móng được điêu khắc trên cầu đá không?'),
  ('4B-L13', '4B', '수아', '네! 용이 발을 내밀고 있는 모습이 끝없이 펼쳐진 하늘 아래서 정말 웅장했어요.', 'Có! Hình ảnh con rồng chìa chân ra dưới bầu trời trải dài bất tận thật hùng tráng.'),
  ('4B-L13', '4B', '민재', '고궁박물관도 들렀어요? 여행을 할수록 한국 역사에 더 반하게 되는 것 같아요.', 'Bạn có ghé Bảo tàng Cố cung không? Càng đi du lịch thì càng bị mê hoặc bởi lịch sử Hàn Quốc hơn.');

COMMIT;
