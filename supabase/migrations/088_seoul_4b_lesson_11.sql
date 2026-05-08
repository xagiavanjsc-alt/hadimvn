-- Seoul 4B Lesson 11: 언어와 생활 (Ngôn ngữ và đời sống)
-- Generated from src/mocks/data/seoul-books-data.ts

BEGIN;

-- ── Clean up existing data for 4B-L11 ──────────────────────────────────────
DELETE FROM seoul_dialogue WHERE lesson_id = '4B-L11';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4B-L11');
DELETE FROM seoul_grammar WHERE lesson_id = '4B-L11';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4B-L11';

-- ── Upsert lesson ──────────────────────────────────────────────────────────
INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES (
  '4B-L11', '4B', 11,
  '언어와 생활',
  'Ngôn ngữ và đời sống',
  ARRAY['Thảo luận về xu hướng ngôn ngữ trong cuộc sống hiện đại', 'Học từ vựng về thói quen ngôn ngữ và giao tiếp', 'Dùng ~는 데다가, ~게 되다 để diễn đạt nguyên nhân và thay đổi']::text[],
  '언어 습관에 대한 토론 (Thảo luận về thói quen ngôn ngữ)',
  'Tiếng Hàn có nhiều từ viết tắt (줄임말) phổ biến trong giới trẻ: 알바 (아르바이트 = làm thêm), 짬짜면 (짜장면+짬뽕), 셀프 (self = tự phục vụ). 콩글리시 là từ tiếng Anh được Hàn Quốc hóa, ví dụ: 핸드폰 (handphone = điện thoại di động), 아파트 (apartment). Việc sử dụng từ ngoại lai và từ viết tắt trong tiếng Hàn ngày càng phổ biến, phản ánh sự thay đổi nhanh của xã hội.'
)
ON CONFLICT (id) DO UPDATE SET
  book_id        = EXCLUDED.book_id,
  lesson_number  = EXCLUDED.lesson_number,
  title          = EXCLUDED.title,
  title_vi       = EXCLUDED.title_vi,
  objectives     = EXCLUDED.objectives,
  dialogue_title = EXCLUDED.dialogue_title,
  cultural_tip   = EXCLUDED.cultural_tip;

-- ── Vocabulary (57 entries) ────────────────────────────────────────────────
INSERT INTO seoul_vocabulary (lesson_id, book_id, korean, pronunciation, vietnamese, part_of_speech, example, example_vi)
VALUES
  ('4B-L11', '4B', '유행어를 따라 하다', 'yu-haeng-eo-reul tta-ra ha-da', 'Bắt chước/dùng theo ngôn ngữ thịnh hành', 'Cụm động từ', '요즘 유행어를 따라 해요.', 'Dạo này hay dùng theo ngôn ngữ thịnh hành.'),
  ('4B-L11', '4B', '욕을 해대다', 'yo-geul hae-dae-da', 'Chửi tới tấp, chửi liên tục', 'Cụm động từ', '욕을 해대면 안 돼요.', 'Không được chửi tới tấp.'),
  ('4B-L11', '4B', '외래어를 사용하다', 'oe-rae-eo-reul sa-yong-ha-da', 'Sử dụng từ ngoại lai', 'Cụm động từ', '외래어를 너무 많이 사용해요.', 'Dùng quá nhiều từ ngoại lai.'),
  ('4B-L11', '4B', '줄임말을 써버릇하다', 'ju-rim-ma-reul sseo-beo-reut-ha-da', 'Có thói quen dùng từ viết tắt', 'Cụm động từ', '줄임말을 써버릇하면 고치기 어려워요.', 'Thói quen dùng từ viết tắt khó sửa.'),
  ('4B-L11', '4B', '친근한 느낌이 들다', 'chin-geun-han neu-kki-mi deul-da', 'Cảm thấy thân thiết, gần gũi', 'Cụm động từ', '사투리를 들으면 친근한 느낌이 들어요.', 'Nghe phương ngữ thì cảm thấy gần gũi.'),
  ('4B-L11', '4B', '대화가 끊기다', 'dae-hwa-ga kkeun-gi-da', 'Cuộc trò chuyện bị ngắt quãng', 'Cụm động từ', '갑자기 대화가 끊겼어요.', 'Cuộc trò chuyện đột nhiên bị ngắt quãng.'),
  ('4B-L11', '4B', '의사소통이 잘되다', 'ui-sa-so-tong-i jal-doe-da', 'Giao tiếp tốt, hiểu ý nhau', 'Cụm động từ', '의사소통이 잘 돼요.', 'Giao tiếp rất tốt.'),
  ('4B-L11', '4B', '오해가 생기다', 'o-hae-ga saeng-gi-da', 'Nảy sinh hiểu lầm', 'Cụm động từ', '오해가 생기지 않도록 조심해요.', 'Cẩn thận để không nảy sinh hiểu lầm.'),
  ('4B-L11', '4B', '표현이 풍부해지다', 'pyo-hyeon-i pung-bu-hae-ji-da', 'Cách biểu đạt trở nên phong phú', 'Cụm động từ', '독서를 하면 표현이 풍부해져요.', 'Đọc sách thì cách biểu đạt trở nên phong phú.'),
  ('4B-L11', '4B', '기분이 상하다', 'gi-bu-ni sang-ha-da', 'Tâm trạng bị tổn thương, bị phật lòng', 'Cụm động từ', '그 말을 듣고 기분이 상했어요.', 'Nghe câu đó xong tâm trạng bị tổn thương.'),
  ('4B-L11', '4B', '표현력', 'pyo-hyeon-nyeok', 'Năng lực biểu đạt, khả năng diễn đạt', 'Danh từ', '표현력이 좋아요.', 'Năng lực biểu đạt tốt.'),
  ('4B-L11', '4B', '이해력', 'i-hae-ryeok', 'Năng lực lý giải, khả năng hiểu', 'Danh từ', '이해력이 높아요.', 'Khả năng hiểu cao.'),
  ('4B-L11', '4B', '어휘력', 'eo-hwi-ryeok', 'Vốn từ vựng, khả năng từ vựng', 'Danh từ', '어휘력을 높여야 해요.', 'Cần nâng cao vốn từ vựng.'),
  ('4B-L11', '4B', '상상력', 'sang-sang-nyeok', 'Sức tưởng tượng, trí tưởng tượng', 'Danh từ', '상상력이 풍부해요.', 'Sức tưởng tượng phong phú.'),
  ('4B-L11', '4B', '기억력', 'gi-eong-nyeok', 'Trí nhớ, khả năng ghi nhớ', 'Danh từ', '기억력이 좋아요.', 'Trí nhớ tốt.'),
  ('4B-L11', '4B', '거짓말쟁이', 'geo-jin-mal-jaeng-i', 'Kẻ nói dối, người hay nói dối', 'Danh từ', '거짓말쟁이로 불렸어요.', 'Bị gọi là kẻ nói dối.'),
  ('4B-L11', '4B', '한국식', 'han-guk-sik', 'Kiểu Hàn Quốc, phong cách Hàn', 'Danh từ', '한국식 표현이에요.', 'Là cách diễn đạt kiểu Hàn Quốc.'),
  ('4B-L11', '4B', '콩글리시', 'kong-geul-li-si', 'Konglish (tiếng Anh theo kiểu Hàn)', 'Danh từ', '콩글리시는 한국식 영어예요.', 'Konglish là tiếng Anh theo kiểu Hàn Quốc.'),
  ('4B-L11', '4B', '조사', 'jo-sa', 'Điều tra, khảo sát', 'Danh từ', '조사 결과가 나왔어요.', 'Kết quả điều tra đã ra.'),
  ('4B-L11', '4B', '충분히', 'chung-bu-ni', 'Một cách đầy đủ, đủ', 'Phó từ', '충분히 연습했어요.', 'Đã luyện tập đầy đủ.'),
  ('4B-L11', '4B', '결과', 'gyeol-gwa', 'Kết quả', 'Danh từ', '결과를 기다려요.', 'Chờ đợi kết quả.'),
  ('4B-L11', '4B', '동영상', 'dong-yeong-sang', 'Video, clip', 'Danh từ', '동영상을 찍었어요.', 'Đã quay video.'),
  ('4B-L11', '4B', '기계', 'gi-gye', 'Máy móc, thiết bị', 'Danh từ', '기계가 고장났어요.', 'Máy móc bị hỏng.'),
  ('4B-L11', '4B', '굳어지다', 'gu-deo-ji-da', 'Trở nên cứng nhắc, đông cứng', 'Động từ', '습관이 굳어졌어요.', 'Thói quen đã trở nên cố định.'),
  ('4B-L11', '4B', '짬짜면', 'jjam-jja-myeon', 'Mì đen hải sản (kết hợp jajangmyeon và jjamppong)', 'Danh từ', '짬짜면은 두 가지를 합친 거예요.', 'Jjamjjamyeon là sự kết hợp của hai món.'),
  ('4B-L11', '4B', '딱', 'ttak', 'Vừa vặn, đúng, chính xác', 'Phó từ', '딱 맞아요.', 'Vừa vặn đúng.'),
  ('4B-L11', '4B', '알바', 'al-ba', 'Làm thêm bán thời gian (từ Arbeit)', 'Danh từ', '알바를 해요.', 'Đang làm thêm bán thời gian.'),
  ('4B-L11', '4B', '일리가 있다', 'il-li-ga it-da', 'Có lý, có căn cứ', 'Cụm động từ', '그 말에 일리가 있어요.', 'Lời đó có lý.'),
  ('4B-L11', '4B', '사생활', 'sa-saeng-hwal', 'Đời sống riêng tư, cuộc sống cá nhân', 'Danh từ', '사생활을 침해하면 안 돼요.', 'Không được xâm phạm cuộc sống riêng tư.'),
  ('4B-L11', '4B', '노출되다', 'no-chul-doe-da', 'Bị lộ ra, bị phơi bày', 'Động từ', '개인 정보가 노출됐어요.', 'Thông tin cá nhân bị lộ ra.'),
  ('4B-L11', '4B', '퍼지다', 'peo-ji-da', 'Lan rộng, lây lan', 'Động từ', '소문이 퍼졌어요.', 'Tin đồn đã lan rộng.'),
  ('4B-L11', '4B', '연결', 'yeon-gyeol', 'Kết nối, liên kết', 'Danh từ', '인터넷 연결이 필요해요.', 'Cần kết nối internet.'),
  ('4B-L11', '4B', '도대체', 'do-dae-che', 'Rốt cuộc, tóm lại, thật ra', 'Phó từ', '도대체 무슨 말이에요?', 'Rốt cuộc là muốn nói gì vậy?'),
  ('4B-L11', '4B', '소용이 없다', 'so-yong-i eop-da', 'Vô ích, không có tác dụng', 'Cụm động từ', '지금 후회해도 소용이 없어요.', 'Bây giờ hối hận cũng vô ích.'),
  ('4B-L11', '4B', '사라지다', 'sa-ra-ji-da', 'Biến mất, tan biến', 'Động từ', '전통이 사라지고 있어요.', 'Truyền thống đang dần biến mất.'),
  ('4B-L11', '4B', '옷차림', 'ot-cha-rim', 'Cách ăn mặc, trang phục', 'Danh từ', '옷차림이 단정해요.', 'Cách ăn mặc gọn gàng.'),
  ('4B-L11', '4B', '정이 많다', 'jeong-i man-ta', 'Giàu tình cảm, dễ có tình cảm', 'Cụm tính từ', '정이 많은 사람이에요.', 'Là người giàu tình cảm.'),
  ('4B-L11', '4B', '입학시험', 'ip-ak-si-heom', 'Kỳ thi tuyển đầu vào', 'Danh từ', '입학시험을 봤어요.', 'Đã thi tuyển đầu vào.'),
  ('4B-L11', '4B', '부정적이다', 'bu-jeong-jeo-gi-da', 'Tiêu cực, mang tính phủ định', 'Tính từ', '부정적인 생각을 버려요.', 'Hãy bỏ suy nghĩ tiêu cực.'),
  ('4B-L11', '4B', '긍정적이다', 'geung-jeong-jeo-gi-da', 'Tích cực, lạc quan', 'Tính từ', '긍정적으로 생각해요.', 'Hãy suy nghĩ tích cực.'),
  ('4B-L11', '4B', '이성', 'i-seong', 'Bạn khác giới, lý trí', 'Danh từ', '이성 친구를 사귀었어요.', 'Đã kết bạn với người khác giới.'),
  ('4B-L11', '4B', '셀프', 'sel-peu', 'Tự phục vụ, tự làm', 'Danh từ', '셀프 서비스예요.', 'Là dịch vụ tự phục vụ.'),
  ('4B-L11', '4B', '머릿속', 'meo-rit-sok', 'Trong đầu, trong tâm trí', 'Danh từ', '머릿속에 생각이 많아요.', 'Trong đầu có nhiều suy nghĩ.'),
  ('4B-L11', '4B', '영향을 미치다', 'yeong-hyang-eul mi-chi-da', 'Gây ảnh hưởng, tác động đến', 'Cụm động từ', '언어는 사고방식에 영향을 미쳐요.', 'Ngôn ngữ gây ảnh hưởng đến cách tư duy.'),
  ('4B-L11', '4B', '청소년', 'cheong-so-nyeon', 'Thanh thiếu niên', 'Danh từ', '청소년에게 인기가 있어요.', 'Được thanh thiếu niên yêu thích.'),
  ('4B-L11', '4B', '심각하다', 'sim-ga-ka-da', 'Nghiêm trọng, trầm trọng', 'Tính từ', '상황이 심각해요.', 'Tình trạng nghiêm trọng.'),
  ('4B-L11', '4B', '장난', 'jang-nan', 'Đùa cợt, trò đùa', 'Danh từ', '장난이 지나쳤어요.', 'Trò đùa đã quá đà.'),
  ('4B-L11', '4B', '뇌', 'noe', 'Não, não bộ', 'Danh từ', '뇌를 자극해요.', 'Kích thích não bộ.'),
  ('4B-L11', '4B', '이성적이다', 'i-seong-jeo-gi-da', 'Lý trí, có lý trí', 'Tính từ', '이성적으로 판단해요.', 'Phán đoán một cách lý trí.'),
  ('4B-L11', '4B', '통제하다', 'tong-je-ha-da', 'Kiểm soát, khống chế', 'Động từ', '감정을 통제해요.', 'Kiểm soát cảm xúc.'),
  ('4B-L11', '4B', '충동적으로', 'chung-dong-jeo-geu-ro', 'Một cách bốc đồng, bốc đồng', 'Phó từ', '충동적으로 행동했어요.', 'Đã hành động một cách bốc đồng.'),
  ('4B-L11', '4B', '행동', 'haeng-dong', 'Hành động, cử chỉ', 'Danh từ', '행동으로 보여 주세요.', 'Hãy thể hiện bằng hành động.'),
  ('4B-L11', '4B', '실시하다', 'sil-si-ha-da', 'Thực thi, tiến hành', 'Động từ', '설문 조사를 실시했어요.', 'Đã tiến hành khảo sát.'),
  ('4B-L11', '4B', '실험', 'si-reom', 'Thí nghiệm, thử nghiệm', 'Danh từ', '실험 결과가 나왔어요.', 'Kết quả thí nghiệm đã ra.'),
  ('4B-L11', '4B', '중립적이다', 'jung-nip-jeo-gi-da', 'Trung lập, khách quan', 'Tính từ', '중립적인 입장을 취해요.', 'Giữ lập trường trung lập.'),
  ('4B-L11', '4B', '여기다', 'yeo-gi-da', 'Coi là, cho rằng, xem như', 'Động từ', '중요하게 여겨요.', 'Coi là quan trọng.'),
  ('4B-L11', '4B', '흔히', 'heun-hi', 'Thường thường, hay gặp', 'Phó từ', '흔히 쓰이는 표현이에요.', 'Là cách diễn đạt hay gặp.');

-- ── Grammar 1 ──────────────────────────────────────────────────────────────
WITH g1 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L11', '4B',
    '~는 데다가 (Ngoài... còn...)',
    'B2+',
    'Động từ/Tính từ + 는 데다가 = ngoài... còn... Thêm thông tin bổ sung cùng chiều.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g1, (VALUES
  ('욕설이 퍼지는 데다가 외래어까지 늘고 있어요.', 'Ngoài việc chửi tục lan rộng ra còn cả từ ngoại lai đang tăng lên.'),
  ('어휘력이 줄어드는 데다가 표현력도 떨어져요.', 'Ngoài vốn từ vựng giảm ra, năng lực biểu đạt cũng giảm.'),
  ('줄임말이 많아지는 데다가 의사소통도 어려워졌어요.', 'Ngoài từ viết tắt ngày càng nhiều, giao tiếp cũng trở nên khó hơn.')
) AS ex(korean, vietnamese);

-- ── Grammar 2 ──────────────────────────────────────────────────────────────
WITH g2 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L11', '4B',
    '~게 되다 (Trở nên..., đâm ra...)',
    'B2+',
    'Động từ/Tính từ + 게 되다 = trở nên..., đâm ra... Diễn đạt sự thay đổi tự nhiên hay không chủ ý.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g2, (VALUES
  ('줄임말을 써버릇하게 됐어요.', 'Đâm ra có thói quen dùng từ viết tắt.'),
  ('시간이 지나면서 그 표현이 굳어지게 됐어요.', 'Theo thời gian, cách diễn đạt đó trở nên cố định.'),
  ('외래어를 자연스럽게 사용하게 됐어요.', 'Đã tự nhiên dùng được từ ngoại lai.')
) AS ex(korean, vietnamese);

-- ── Grammar 3 ──────────────────────────────────────────────────────────────
WITH g3 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L11', '4B',
    '~아/어 버릇하다 (Thói quen...)',
    'B2+',
    'Động từ + 아/어 버릇하다 = có thói quen làm... Diễn đạt hành động đã trở thành thói quen khó bỏ.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g3, (VALUES
  ('욕을 써 버릇하면 고치기 힘들어요.', 'Đã có thói quen chửi tục thì khó sửa.'),
  ('줄임말을 써 버릇했어요.', 'Đã có thói quen dùng từ viết tắt.')
) AS ex(korean, vietnamese);

-- ── Dialogue ───────────────────────────────────────────────────────────────
INSERT INTO seoul_dialogue (lesson_id, book_id, speaker, text, translation)
VALUES
  ('4B-L11', '4B', '하린', '요즘 청소년들이 욕을 너무 해대는 게 심각한 문제인 것 같아요.', 'Dạo này thanh thiếu niên chửi tục liên tục có vẻ là vấn đề nghiêm trọng.'),
  ('4B-L11', '4B', '민혁', '맞아요. 줄임말을 써버릇하는 데다가 외래어도 너무 많이 써서 의사소통이 어려울 때가 있어요.', 'Đúng vậy. Ngoài thói quen dùng từ viết tắt, còn dùng quá nhiều từ ngoại lai nên đôi khi giao tiếp khó khăn.'),
  ('4B-L11', '4B', '하린', '도대체 이런 현상이 왜 생기는 걸까요? 어휘력이 줄어들어서 그런 건 아닐까요?', 'Rốt cuộc tại sao lại xuất hiện hiện tượng này? Có phải vì vốn từ vựng giảm đi không?'),
  ('4B-L11', '4B', '민혁', '그럴 수도 있어요. 독서를 안 하게 되면 자연스럽게 표현력도 떨어지죠.', 'Có thể vậy. Khi không đọc sách nữa thì tự nhiên năng lực biểu đạt cũng giảm.'),
  ('4B-L11', '4B', '하린', '긍정적으로 보면 새로운 표현이 언어를 더 풍부하게 해 준다는 일리도 있어요.', 'Nhìn theo hướng tích cực thì cũng có lý khi nói rằng các cách diễn đạt mới làm ngôn ngữ phong phú hơn.'),
  ('4B-L11', '4B', '민혁', '맞아요. 중립적으로 여기는 게 좋을 것 같아요. 언어는 계속 변하니까요.', 'Đúng vậy. Có lẽ nên coi vấn đề một cách trung lập. Vì ngôn ngữ luôn thay đổi mà.');

COMMIT;
