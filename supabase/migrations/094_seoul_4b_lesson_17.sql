-- Seoul 4B Lesson 17: 만남과 헤어짐 (Gặp gỡ và chia tay)
-- Generated from src/mocks/data/seoul-books-data.ts

BEGIN;

-- ── Clean up existing data for 4B-L17 ─────────────────────────────────────
DELETE FROM seoul_dialogue WHERE lesson_id = '4B-L17';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4B-L17');
DELETE FROM seoul_grammar WHERE lesson_id = '4B-L17';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4B-L17';

-- ── Upsert lesson ──────────────────────────────────────────────────────────
INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES (
  '4B-L17', '4B', 17,
  '만남과 헤어짐',
  'Gặp gỡ và chia tay',
  ARRAY['Diễn đạt cảm xúc khi gặp lại bạn cũ và khi chia tay', 'Học thành ngữ và cách nói về kỷ niệm, thời gian', 'Dùng ~았/었더라면, ~(으)ㄹ 뻔하다 để nói về điều đã có thể xảy ra']::text[],
  '오랜만의 만남 (Gặp lại sau bao lâu)',
  'Người Hàn Quốc rất coi trọng khái niệm 인연 (nhân duyên) — mối quan hệ được định đoạt bởi số phận. Thành ngữ ''옷깃만 스쳐도 인연이다'' thể hiện niềm tin rằng mọi cuộc gặp gỡ đều có ý nghĩa. Khi gặp lại bạn cũ sau lâu, người Hàn thường nói ''오랜만이에요'' và thường đi ăn uống hoặc uống rượu cùng nhau (회식 văn hóa) để tâm sự.'
)
ON CONFLICT (id) DO UPDATE SET
  book_id        = EXCLUDED.book_id,
  lesson_number  = EXCLUDED.lesson_number,
  title          = EXCLUDED.title,
  title_vi       = EXCLUDED.title_vi,
  objectives     = EXCLUDED.objectives,
  dialogue_title = EXCLUDED.dialogue_title,
  cultural_tip   = EXCLUDED.cultural_tip;

-- ── Vocabulary ────────────────────────────────────────────────────────────
INSERT INTO seoul_vocabulary (lesson_id, book_id, korean, pronunciation, vietnamese, part_of_speech, example, example_vi)
VALUES
  ('4B-L17', '4B', '기억이 생생하다', 'gi-eo-gi saeng-saeng-ha-da', 'Nhớ rõ mồn một, ký ức còn rất rõ', 'Cụm tính từ', '그날 기억이 생생해요.', 'Ký ức ngày đó còn rất rõ.'),
  ('4B-L17', '4B', '세월이 쏜살같다', 'se-wo-ri sson-sal-ga-ta', 'Thời gian trôi nhanh như tên bắn', 'Thành ngữ', '세월이 쏜살같이 흘렀어요.', 'Thời gian trôi nhanh như tên bắn.'),
  ('4B-L17', '4B', '가슴속에 간직하다', 'ga-seum-so-ge gan-ji-ka-da', 'Cất giữ trong lòng, trân trọng trong tim', 'Cụm động từ', '좋은 추억을 가슴속에 간직해요.', 'Cất giữ kỷ niệm đẹp trong lòng.'),
  ('4B-L17', '4B', '처음 만난 게 엊그제 같다', 'cheo-eum man-nan ge eot-geu-je ga-ta', 'Như lần đầu gặp nhau mới hôm qua', 'Thành ngữ', '처음 만난 게 엊그제 같아요.', 'Cảm giác như mới gặp lần đầu hôm qua.'),
  ('4B-L17', '4B', '좋은 추억으로 남다', 'jo-eun chu-eo-geu-ro nam-da', 'Để lại kỷ niệm đẹp', 'Cụm động từ', '좋은 추억으로 남을 거예요.', 'Sẽ để lại kỷ niệm đẹp.'),
  ('4B-L17', '4B', '몰라보게 달라지다', 'mol-la-bo-ge dal-la-ji-da', 'Thay đổi đến mức không nhận ra', 'Cụm động từ', '몰라보게 달라졌어요.', 'Đã thay đổi đến mức không nhận ra.'),
  ('4B-L17', '4B', '하나도 안 변하다', 'ha-na-do an byeon-ha-da', 'Không thay đổi chút nào, y hệt ngày xưa', 'Cụm động từ', '하나도 안 변했어요.', 'Không thay đổi chút nào.'),
  ('4B-L17', '4B', '너무 변해서 못 알아보다', 'neo-mu byeon-hae-seo mot a-ra-bo-da', 'Thay đổi nhiều đến mức không nhận ra', 'Cụm động từ', '너무 변해서 못 알아봤어요.', 'Thay đổi nhiều quá đến mức không nhận ra.'),
  ('4B-L17', '4B', '예전 그대로이다', 'ye-jeon geu-dae-ro-i-da', 'Vẫn giống ngày trước, không đổi', 'Cụm tính từ', '예전 그대로예요.', 'Vẫn y hệt ngày trước.'),
  ('4B-L17', '4B', '예전만 못하다', 'ye-jeon-man mo-ta-da', 'Không bằng ngày trước, kém hơn xưa', 'Cụm tính từ', '요즘 건강이 예전만 못해요.', 'Sức khỏe dạo này không bằng ngày trước.'),
  ('4B-L17', '4B', '세상이 참 좁다', 'se-sang-i cham jop-da', 'Thế giới thật nhỏ (gặp nhau ngẫu nhiên)', 'Thành ngữ', '세상이 참 좁네요!', 'Thế giới thật nhỏ nhỉ!'),
  ('4B-L17', '4B', '손꼽아 기다리다', 'son-kko-ba gi-da-ri-da', 'Đếm từng ngày mong chờ', 'Cụm động từ', '손꼽아 기다렸어요.', 'Đã đếm từng ngày mong chờ.'),
  ('4B-L17', '4B', '옷깃만 스쳐도 인연이다', 'ot-git-man seu-chyeo-do i-nyeon-i-da', 'Dù chỉ thoáng qua cũng đã là duyên', 'Thành ngữ', '옷깃만 스쳐도 인연이라고 해요.', 'Người ta nói dù chỉ thoáng qua cũng đã là duyên.'),
  ('4B-L17', '4B', '무소식이 희소식이다', 'mu-so-si-gi hui-so-si-gi-da', 'Không có tin là tin lành', 'Thành ngữ', '무소식이 희소식이라고 했어요.', 'Đã nói rằng không có tin tức là tin lành.'),
  ('4B-L17', '4B', '규모', 'gyu-mo', 'Quy mô, tầm vóc', 'Danh từ', '규모가 커요.', 'Quy mô lớn.'),
  ('4B-L17', '4B', '들여다보다', 'deu-ryeo-da-bo-da', 'Nhìn kỹ vào bên trong, dòm vào', 'Động từ', '창문을 들여다봐요.', 'Dòm nhìn qua cửa sổ.'),
  ('4B-L17', '4B', '사업가', 'sa-eop-ga', 'Doanh nhân, nhà kinh doanh', 'Danh từ', '성공한 사업가예요.', 'Là doanh nhân thành công.'),
  ('4B-L17', '4B', '하긴', 'ha-gin', 'Thực ra, nghĩ lại thì', 'Phó từ', '하긴, 맞는 말이에요.', 'Thực ra, đó là lời đúng.'),
  ('4B-L17', '4B', '시행시', 'si-haeng-si', 'Thơ haiku (thơ 3 câu)', 'Danh từ', '시행시를 썼어요.', 'Đã viết thơ haiku.'),
  ('4B-L17', '4B', '짓다', 'jit-da', 'Xây dựng, làm, viết (thơ)', 'Động từ', '집을 지었어요.', 'Đã xây nhà.'),
  ('4B-L17', '4B', '이벤트', 'i-ben-teu', 'Sự kiện, event, chương trình đặc biệt', 'Danh từ', '이벤트에 참가했어요.', 'Đã tham gia sự kiện.'),
  ('4B-L17', '4B', '당첨되다', 'dang-cheom-doe-da', 'Trúng thưởng, trúng số', 'Động từ', '경품에 당첨됐어요.', 'Đã trúng thưởng.'),
  ('4B-L17', '4B', '영화 관람권', 'yeong-hwa gwal-lam-gwon', 'Vé xem phim', 'Danh từ', '영화 관람권을 받았어요.', 'Đã nhận vé xem phim.'),
  ('4B-L17', '4B', '고급', 'go-geup', 'Cao cấp, sang trọng', 'Tính từ', '고급 식당이에요.', 'Là nhà hàng cao cấp.'),
  ('4B-L17', '4B', '식사권', 'sik-sa-gwon', 'Phiếu ăn, voucher bữa ăn', 'Danh từ', '고급 식사권을 받았어요.', 'Đã nhận phiếu ăn cao cấp.'),
  ('4B-L17', '4B', '당첨자', 'dang-cheom-ja', 'Người trúng thưởng', 'Danh từ', '당첨자를 발표했어요.', 'Đã công bố người trúng thưởng.'),
  ('4B-L17', '4B', '최우수', 'choe-u-su', 'Xuất sắc nhất, hạng nhất', 'Danh từ', '최우수상을 받았어요.', 'Đã nhận giải xuất sắc nhất.'),
  ('4B-L17', '4B', '허가', 'heo-ga', 'Sự cho phép, giấy phép', 'Danh từ', '허가를 받았어요.', 'Đã được cấp phép.'),
  ('4B-L17', '4B', '발걸음이 무겁다', 'bal-geo-reu-mi mu-geop-da', 'Bước chân nặng nề, không muốn rời đi', 'Cụm tính từ', '헤어질 때 발걸음이 무거웠어요.', 'Khi chia tay bước chân thật nặng nề.'),
  ('4B-L17', '4B', '과연', 'gwa-yeon', 'Quả nhiên, đúng như vậy, thật sự', 'Phó từ', '과연 훌륭해요.', 'Quả nhiên xuất sắc.'),
  ('4B-L17', '4B', '마음이 놓이다', 'ma-eu-mi no-i-da', 'Yên tâm, cảm thấy nhẹ lòng', 'Cụm động từ', '소식을 듣고 마음이 놓였어요.', 'Nghe tin xong yên tâm rồi.'),
  ('4B-L17', '4B', '미소', 'mi-so', 'Nụ cười nhẹ, mỉm cười', 'Danh từ', '미소를 지었어요.', 'Đã mỉm cười.');

-- ── Grammar 1 ──────────────────────────────────────────────────────────────
WITH g1 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L17', '4B',
    '~았/었더라면 (Nếu hồi đó... thì...)',
    'B2+',
    'Động từ + 았/었더라면 = nếu hồi đó... thì... Diễn đạt điều kiện giả định trong quá khứ — điều đã không xảy ra.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g1, (VALUES
  ('일찍 만났더라면 더 좋았을 텐데요.', 'Giá mà hồi đó gặp nhau sớm hơn thì tốt biết mấy.'),
  ('연락을 했더라면 만날 수 있었을 텐데요.', 'Nếu hồi đó liên lạc thì đã có thể gặp nhau.')
) AS ex(korean, vietnamese);

-- ── Grammar 2 ──────────────────────────────────────────────────────────────
WITH g2 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L17', '4B',
    '~(으)ㄹ 뻔하다 (Suýt nữa...)',
    'B2+',
    'Động từ + (으)ㄹ 뻔하다 = suýt nữa... Diễn đạt một việc gần như xảy ra nhưng cuối cùng không xảy ra.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g2, (VALUES
  ('못 알아볼 뻔했어요.', 'Suýt nữa không nhận ra.'),
  ('지나칠 뻔했어요.', 'Suýt nữa đi qua mà không thấy.')
) AS ex(korean, vietnamese);

-- ── Grammar 3 ──────────────────────────────────────────────────────────────
WITH g3 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L17', '4B',
    '~(으)ㄴ/는 것 같다 (Có vẻ..., hình như...)',
    'B2+',
    'Động từ/Tính từ + (으)ㄴ/는 것 같다 = có vẻ..., hình như... Diễn đạt sự suy đoán hay cảm nhận chủ quan.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g3, (VALUES
  ('많이 달라진 것 같아요.', 'Có vẻ đã thay đổi nhiều.'),
  ('하나도 안 변한 것 같아요.', 'Hình như không thay đổi chút nào.')
) AS ex(korean, vietnamese);

-- ── Dialogue ───────────────────────────────────────────────────────────────
INSERT INTO seoul_dialogue (lesson_id, book_id, speaker, text, translation)
VALUES
  ('4B-L17', '4B', '지수', '어머, 민준 씨! 세상이 참 좁네요. 여기서 만날 줄이야!', 'Ồ, anh Minjun! Thế giới thật nhỏ. Ai ngờ lại gặp nhau ở đây!'),
  ('4B-L17', '4B', '민준', '지수 씨? 몰라보게 달라지셨어요. 처음 만난 게 엊그제 같은데 벌써 10년이 됐네요.', 'Jisu à? Trông thay đổi nhiều quá. Cảm giác như mới gặp lần đầu hôm qua mà đã 10 năm rồi.'),
  ('4B-L17', '4B', '지수', '세월이 쏜살같아요. 그때 기억이 아직도 생생해요. 아직도 하나도 안 변하셨네요.', 'Thời gian trôi nhanh quá. Ký ức hồi đó vẫn còn rõ mồn một. Trông anh vẫn không thay đổi chút nào.'),
  ('4B-L17', '4B', '민준', '과연 그런지 모르겠어요. 사실 연락이 끊겨서 걱정했어요. 무소식이 희소식이라지만요.', 'Không biết có thật vậy không. Thực ra vì mất liên lạc nên tôi lo lắm. Dù người ta nói không có tin là tin lành.'),
  ('4B-L17', '4B', '지수', '미안해요. 오늘 만나서 마음이 놓여요. 앞으로도 좋은 추억으로 남을 것 같아요.', 'Xin lỗi. Hôm nay gặp được tôi thấy yên tâm rồi. Nghĩ chắc sẽ để lại kỷ niệm đẹp mãi.');

COMMIT;
