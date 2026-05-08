-- Seoul 4A Lesson 8: 흥미로운 세상 (Thế giới thú vị)
-- Generated from src/mocks/data/seoul-books-data.ts

BEGIN;

-- ── Clean up existing data for 4A-L8 ──────────────────────────────────────
DELETE FROM seoul_dialogue WHERE lesson_id = '4A-L8';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4A-L8');
DELETE FROM seoul_grammar WHERE lesson_id = '4A-L8';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4A-L8';

-- ── Upsert lesson ──────────────────────────────────────────────────────────
INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES (
  '4A-L8', '4A', 8,
  '흥미로운 세상',
  'Thế giới thú vị',
  ARRAY['Tìm hiểu sự đa dạng văn hóa và dân tộc trên thế giới', 'Học từ vựng về văn hóa, trò chơi dân gian và tiếng địa phương', 'Dùng ~(으)ㄹ수록, ~에 비해서 để so sánh']::text[],
  '세계의 다양한 문화 (Văn hóa đa dạng của thế giới)',
  'Hàn Quốc có hệ thống phương ngữ (사투리) đa dạng theo vùng: 경상도 có ngữ điệu lên xuống mạnh, 전라도 nổi tiếng với âm điệu phong phú, 충청도 thường được coi là chậm rãi và duyên dáng. Trò chơi dân gian như 줄넘기, 숨바꼭질, 실뜨기 không chỉ phổ biến ở Hàn Quốc mà còn có ở nhiều nước châu Á dưới nhiều tên và biến thể khác nhau — đây là minh chứng rõ nhất về 공통점 trong văn hóa châu Á.'
)
ON CONFLICT (id) DO UPDATE SET
  book_id        = EXCLUDED.book_id,
  lesson_number  = EXCLUDED.lesson_number,
  title          = EXCLUDED.title,
  title_vi       = EXCLUDED.title_vi,
  objectives     = EXCLUDED.objectives,
  dialogue_title = EXCLUDED.dialogue_title,
  cultural_tip   = EXCLUDED.cultural_tip;

-- ── Vocabulary (82 entries) ────────────────────────────────────────────────
INSERT INTO seoul_vocabulary (lesson_id, book_id, korean, pronunciation, vietnamese, part_of_speech, example, example_vi)
VALUES
  ('4A-L8', '4A', '문화', 'mun-hwa', 'Văn hóa', 'Danh từ', '문화가 다양해요.', 'Văn hóa rất đa dạng.'),
  ('4A-L8', '4A', '특징', 'teuk-jing', 'Đặc trưng, nét đặc sắc', 'Danh từ', '각 나라마다 특징이 있어요.', 'Mỗi đất nước đều có nét đặc trưng.'),
  ('4A-L8', '4A', '별', 'byeol', 'Sao / từng loại', 'Hậu tố', '직업별로 다르게 나타나요.', 'Khác nhau tùy theo từng nghề nghiệp.'),
  ('4A-L8', '4A', '대표적이다', 'dae-pyo-jeo-gi-da', 'Mang tính đại diện', 'Tính từ', '한복이 대표적인 한국 의상이에요.', 'Hanbok là trang phục đại diện của Hàn Quốc.'),
  ('4A-L8', '4A', '공통점이 있다', 'gong-tong-jeo-mi it-da', 'Có điểm chung', 'Cụm động từ', '두 나라는 공통점이 많아요.', 'Hai đất nước có nhiều điểm chung.'),
  ('4A-L8', '4A', '차이가 있다', 'cha-i-ga it-da', 'Có điểm khác biệt', 'Cụm động từ', '문화 간에 차이가 있어요.', 'Giữa các nền văn hóa có sự khác biệt.'),
  ('4A-L8', '4A', '전통을 지키다', 'jeon-tong-eul ji-ki-da', 'Gìn giữ truyền thống', 'Cụm động từ', '전통을 지키는 것이 중요해요.', 'Gìn giữ truyền thống là điều quan trọng.'),
  ('4A-L8', '4A', '영향을 받다', 'yeong-hyang-eul bat-da', 'Chịu ảnh hưởng', 'Cụm động từ', '한국은 중국의 영향을 많이 받았어요.', 'Hàn Quốc chịu nhiều ảnh hưởng của Trung Quốc.'),
  ('4A-L8', '4A', '독특하다', 'dok-teu-ka-da', 'Đặc sắc, độc đáo', 'Tính từ', '이 문화는 매우 독특해요.', 'Nền văn hóa này rất độc đáo.'),
  ('4A-L8', '4A', '흥미롭다', 'heung-mi-rop-da', 'Hứng thú, thú vị', 'Tính từ', '세계 문화가 정말 흥미로워요.', 'Văn hóa thế giới thật thú vị.'),
  ('4A-L8', '4A', '단순하다', 'dan-sun-ha-da', 'Đơn giản, mộc mạc', 'Tính từ', '생활 방식이 단순해요.', 'Lối sống thật đơn giản.'),
  ('4A-L8', '4A', '평범하다', 'pyeong-beom-ha-da', 'Bình thường, phổ thông', 'Tính từ', '평범한 일상이에요.', 'Cuộc sống thường ngày bình thường.'),
  ('4A-L8', '4A', '흔하다', 'heun-ha-da', 'Phổ biến, thường thấy', 'Tính từ', '이런 풍습은 흔해요.', 'Phong tục này rất phổ biến.'),
  ('4A-L8', '4A', '직업별', 'ji-geop-byeol', 'Theo từng nghề nghiệp', 'Danh từ', '직업별로 특징이 달라요.', 'Đặc trưng khác nhau theo từng nghề nghiệp.'),
  ('4A-L8', '4A', '실', 'sil', 'Chỉ, sợi chỉ', 'Danh từ', '실로 만든 공예품이에요.', 'Là đồ thủ công làm từ chỉ.'),
  ('4A-L8', '4A', '두뇌 발달', 'du-noe bal-dal', 'Sự phát triển não bộ', 'Danh từ', '놀이가 두뇌 발달에 좋아요.', 'Trò chơi tốt cho sự phát triển não bộ.'),
  ('4A-L8', '4A', '효과가 있다', 'hyo-gwa-ga it-da', 'Có hiệu quả', 'Cụm động từ', '이 방법은 효과가 있어요.', 'Phương pháp này có hiệu quả.'),
  ('4A-L8', '4A', '감다', 'gam-da', 'Nhắm mắt / gội đầu', 'Động từ', '눈을 감아요.', 'Nhắm mắt lại.'),
  ('4A-L8', '4A', '걸다', 'geol-da', 'Treo, móc', 'Động từ', '그림을 벽에 걸었어요.', 'Đã treo tranh lên tường.'),
  ('4A-L8', '4A', '당기다', 'dang-gi-da', 'Kéo, rút lại, thu hút', 'Động từ', '줄을 당겨요.', 'Kéo dây lại.'),
  ('4A-L8', '4A', '줄넘기', 'jul-leom-gi', 'Nhảy dây', 'Danh từ', '줄넘기를 해요.', 'Chơi nhảy dây.'),
  ('4A-L8', '4A', '숨바꼭질', 'sum-ba-kok-jil', 'Trò chơi trốn tìm', 'Danh từ', '숨바꼭질을 했어요.', 'Đã chơi trốn tìm.'),
  ('4A-L8', '4A', '구슬치기', 'gu-seul-chi-gi', 'Trò chơi bắn bi', 'Danh từ', '구슬치기가 재미있었어요.', 'Trò chơi bắn bi rất vui.'),
  ('4A-L8', '4A', '준비물', 'jun-bi-mul', 'Đồ dùng cần chuẩn bị', 'Danh từ', '준비물이 뭐예요?', 'Đồ dùng cần chuẩn bị là gì?'),
  ('4A-L8', '4A', '슬랭', 'seul-laeng', 'Tiếng lóng', 'Danh từ', '슬랭은 비공식 언어예요.', 'Tiếng lóng là ngôn ngữ không chính thức.'),
  ('4A-L8', '4A', '사투리', 'sa-tu-ri', 'Tiếng địa phương, phương ngữ', 'Danh từ', '경상도 사투리가 독특해요.', 'Phương ngữ tỉnh Gyeongsang rất độc đáo.'),
  ('4A-L8', '4A', '관심을 갖다', 'gwan-si-meul gat-da', 'Có sự quan tâm, chú ý đến', 'Cụm động từ', '문화에 관심을 가져요.', 'Quan tâm đến văn hóa.'),
  ('4A-L8', '4A', '출신', 'chul-sin', 'Xuất thân, quê quán', 'Danh từ', '어디 출신이에요?', 'Bạn xuất thân từ đâu?'),
  ('4A-L8', '4A', '분야별', 'bun-ya-byeol', 'Theo từng lĩnh vực', 'Danh từ', '분야별로 다르게 나타나요.', 'Thể hiện khác nhau theo từng lĩnh vực.'),
  ('4A-L8', '4A', '지역별', 'ji-yeok-byeol', 'Theo từng khu vực', 'Danh từ', '지역별로 문화가 달라요.', 'Văn hóa khác nhau theo từng khu vực.'),
  ('4A-L8', '4A', '나이별', 'na-i-byeol', 'Theo từng độ tuổi', 'Danh từ', '나이별로 취미가 달라요.', 'Sở thích khác nhau theo từng độ tuổi.'),
  ('4A-L8', '4A', '나라별', 'na-ra-byeol', 'Theo từng đất nước', 'Danh từ', '나라별 음식 문화를 배워요.', 'Học văn hóa ẩm thực theo từng đất nước.'),
  ('4A-L8', '4A', '찻잔', 'chat-jan', 'Tách trà', 'Danh từ', '찻잔이 예뻐요.', 'Tách trà đẹp quá.'),
  ('4A-L8', '4A', '디자인', 'di-ja-in', 'Thiết kế, kiểu dáng', 'Danh từ', '디자인이 독특해요.', 'Thiết kế rất độc đáo.'),
  ('4A-L8', '4A', '벼룩시장', 'byeo-ruk-si-jang', 'Chợ đồ cũ, chợ trời', 'Danh từ', '벼룩시장에서 샀어요.', 'Đã mua ở chợ đồ cũ.'),
  ('4A-L8', '4A', '트렁크', 'teu-reong-keu', 'Thùng xe, cốp xe', 'Danh từ', '트렁크에서 물건을 꺼냈어요.', 'Lấy đồ ra từ cốp xe.'),
  ('4A-L8', '4A', '파사 말람', 'pa-sa mal-lam', 'Pasar Malam (chợ đêm Malaysia)', 'Danh từ', '파사 말람은 말레이시아 야시장이에요.', 'Pasar Malam là chợ đêm của Malaysia.'),
  ('4A-L8', '4A', '두리안', 'du-ri-an', 'Sầu riêng', 'Danh từ', '두리안 냄새가 강해요.', 'Mùi sầu riêng rất nồng.'),
  ('4A-L8', '4A', '야시장', 'ya-si-jang', 'Chợ đêm', 'Danh từ', '야시장에 갔어요.', 'Đã đi chợ đêm.'),
  ('4A-L8', '4A', '향수', 'hyang-su', 'Nước hoa', 'Danh từ', '향수를 뿌렸어요.', 'Đã xịt nước hoa.'),
  ('4A-L8', '4A', '향초', 'hyang-cho', 'Nến thơm', 'Danh từ', '향초를 켰어요.', 'Đã thắp nến thơm.'),
  ('4A-L8', '4A', '향', 'hyang', 'Mùi hương', 'Danh từ', '향이 좋아요.', 'Mùi hương dễ chịu.'),
  ('4A-L8', '4A', '수상 시장', 'su-sang si-jang', 'Chợ nổi', 'Danh từ', '수상 시장에서 배를 타요.', 'Đi thuyền ở chợ nổi.'),
  ('4A-L8', '4A', '대륙', 'dae-ryuk', 'Lục địa, đại lục', 'Danh từ', '다섯 개의 대륙이 있어요.', 'Có năm lục địa.'),
  ('4A-L8', '4A', '다양하다', 'da-yang-ha-da', 'Đa dạng, phong phú', 'Tính từ', '문화가 다양해요.', 'Văn hóa rất đa dạng.'),
  ('4A-L8', '4A', '민속놀이', 'min-song-no-ri', 'Trò chơi dân gian', 'Danh từ', '민속놀이를 즐겨요.', 'Thưởng thức trò chơi dân gian.'),
  ('4A-L8', '4A', '놀이공원', 'no-ri-gong-won', 'Công viên trò chơi', 'Danh từ', '놀이공원에 갔어요.', 'Đã đi công viên trò chơi.'),
  ('4A-L8', '4A', '탈춤', 'tal-chum', 'Múa mặt nạ', 'Danh từ', '탈춤을 배워요.', 'Học múa mặt nạ.'),
  ('4A-L8', '4A', '장구춤', 'jang-gu-chum', 'Điệu múa Janggu', 'Danh từ', '장구춤을 배워요.', 'Học điệu múa Janggu.'),
  ('4A-L8', '4A', '민속촌', 'min-sok-chon', 'Làng dân gian', 'Danh từ', '민속촌에 가 봤어요?', 'Bạn đã đi làng dân gian chưa?'),
  ('4A-L8', '4A', '관련', 'gwal-lyeon', 'Liên quan', 'Danh từ', '문화와 관련된 주제예요.', 'Là chủ đề liên quan đến văn hóa.'),
  ('4A-L8', '4A', '억양', 'eo-gyang', 'Ngữ điệu, thanh điệu', 'Danh từ', '억양이 독특해요.', 'Ngữ điệu rất độc đáo.'),
  ('4A-L8', '4A', '말투', 'mal-tu', 'Cách nói chuyện, giọng nói', 'Danh từ', '말투가 달라요.', 'Cách nói chuyện khác nhau.'),
  ('4A-L8', '4A', '경상도', 'gyeong-sang-do', 'Tỉnh Gyeongsang (miền Nam Hàn Quốc)', 'Danh từ', '경상도 사투리를 들었어요.', 'Đã nghe phương ngữ tỉnh Gyeongsang.'),
  ('4A-L8', '4A', '전라도', 'jeol-la-do', 'Tỉnh Jeolla (miền Tây Nam Hàn Quốc)', 'Danh từ', '전라도 음식이 맛있어요.', 'Món ăn tỉnh Jeolla rất ngon.'),
  ('4A-L8', '4A', '충청도', 'chung-cheong-do', 'Tỉnh Chungcheong (miền Trung Hàn Quốc)', 'Danh từ', '충청도 사람들은 느긋해요.', 'Người tỉnh Chungcheong thong thả.'),
  ('4A-L8', '4A', '무뚝뚝하다', 'mu-ttuk-ttuk-a-da', 'Thô lỗ, cộc lốc, lạnh lùng', 'Tính từ', '말투가 무뚝뚝해요.', 'Cách nói chuyện cộc lốc.'),
  ('4A-L8', '4A', '감탄사', 'gam-tan-sa', 'Thán từ, từ cảm thán', 'Danh từ', '감탄사가 많아요.', 'Có nhiều từ cảm thán.'),
  ('4A-L8', '4A', '정겹다', 'jeong-gyeop-da', 'Ấm áp tình cảm, giàu tình cảm', 'Tính từ', '고향 사투리가 정겨워요.', 'Phương ngữ quê hương thật ấm áp tình cảm.'),
  ('4A-L8', '4A', '끌다', 'kkeul-da', 'Lôi cuốn, kéo', 'Động từ', '관심을 끌어요.', 'Thu hút sự chú ý.'),
  ('4A-L8', '4A', '외손자', 'oe-son-ja', 'Cháu ngoại (trai)', 'Danh từ', '외손자를 키워요.', 'Nuôi cháu ngoại trai.'),
  ('4A-L8', '4A', '성인식', 'seong-in-sik', 'Lễ trưởng thành', 'Danh từ', '성인식을 치렀어요.', 'Đã tổ chức lễ trưởng thành.'),
  ('4A-L8', '4A', '키우다', 'ki-u-da', 'Nuôi, chăm sóc', 'Động từ', '아이를 키워요.', 'Nuôi con.'),
  ('4A-L8', '4A', '보존하다', 'bo-jon-ha-da', 'Bảo tồn, gìn giữ', 'Động từ', '문화를 보존해야 해요.', 'Cần bảo tồn văn hóa.'),
  ('4A-L8', '4A', '원인', 'wo-nin', 'Nguyên nhân, lý do', 'Danh từ', '원인을 찾아요.', 'Tìm nguyên nhân.'),
  ('4A-L8', '4A', '돌려 말하다', 'dol-lyeo mal-ha-da', 'Nói vòng vo, nói loanh quanh', 'Cụm động từ', '돌려 말하지 말고 직접 말해요.', 'Đừng nói vòng vo, hãy nói thẳng.'),
  ('4A-L8', '4A', '자기주장을 내세우다', 'ja-gi-ju-jang-eul nae-se-u-da', 'Đưa ra ý kiến của mình', 'Cụm động từ', '자기주장을 내세우는 것이 중요해요.', 'Đưa ra ý kiến của bản thân là điều quan trọng.'),
  ('4A-L8', '4A', '반복하다', 'ban-bok-a-da', 'Lặp đi lặp lại', 'Động từ', '같은 실수를 반복해요.', 'Lặp đi lặp lại cùng một lỗi.'),
  ('4A-L8', '4A', '모소족', 'mo-so-jok', 'Tộc người Mosuo', 'Danh từ', '모소족은 모계 사회예요.', 'Tộc Mosuo là xã hội mẫu hệ.'),
  ('4A-L8', '4A', '현대인', 'hyeon-dae-in', 'Người hiện đại', 'Danh từ', '현대인은 바빠요.', 'Người hiện đại rất bận rộn.'),
  ('4A-L8', '4A', '가정을 이루다', 'ga-jeong-eul i-ru-da', 'Lập gia đình', 'Cụm động từ', '가정을 이뤘어요.', 'Đã lập gia đình.'),
  ('4A-L8', '4A', '구성하다', 'gu-seong-ha-da', 'Cấu thành, tạo nên', 'Động từ', '가족을 구성해요.', 'Tạo nên gia đình.'),
  ('4A-L8', '4A', '한족', 'han-jok', 'Người Hán (dân tộc Hán)', 'Danh từ', '한족이 중국 최대 민족이에요.', 'Người Hán là dân tộc đông nhất Trung Quốc.'),
  ('4A-L8', '4A', '장족', 'jang-jok', 'Người Tráng (dân tộc Zhuang)', 'Danh từ', '장족은 중국 남부에 살아요.', 'Người Tráng sống ở miền Nam Trung Quốc.'),
  ('4A-L8', '4A', '다수', 'da-su', 'Đa số, số đông', 'Danh từ', '다수의 의견을 따라요.', 'Theo ý kiến của đa số.'),
  ('4A-L8', '4A', '재산', 'jae-san', 'Tài sản', 'Danh từ', '재산을 물려받았어요.', 'Đã thừa kế tài sản.'),
  ('4A-L8', '4A', '물려받다', 'mul-lyeo-bat-da', 'Thừa kế, được truyền lại', 'Động từ', '전통을 물려받아요.', 'Thừa kế truyền thống.'),
  ('4A-L8', '4A', '실뜨기', 'sil-tteu-gi', 'Trò chơi căng chỉ', 'Danh từ', '실뜨기를 해 봤어요?', 'Bạn đã chơi căng chỉ chưa?'),
  ('4A-L8', '4A', '즐기다', 'jeul-gi-da', 'Tận hưởng, thưởng thức', 'Động từ', '여행을 즐겨요.', 'Tận hưởng chuyến du lịch.'),
  ('4A-L8', '4A', '집안', 'ji-ban', 'Việc nhà, gia đình', 'Danh từ', '집안일을 해요.', 'Làm việc nhà.'),
  ('4A-L8', '4A', '가장', 'ga-jang', 'Người trụ cột gia đình / nhất', 'Danh từ', '아버지가 가장이에요.', 'Bố là trụ cột gia đình.'),
  ('4A-L8', '4A', '존재하다', 'jon-jae-ha-da', 'Tồn tại, có thật', 'Động từ', '이런 문화가 아직도 존재해요.', 'Nền văn hóa này vẫn còn tồn tại.'),
  ('4A-L8', '4A', '이모', 'i-mo', 'Dì (em/chị gái của mẹ)', 'Danh từ', '이모 집에 갔어요.', 'Đã đến nhà dì.'),
  ('4A-L8', '4A', '손녀', 'son-nyeo', 'Cháu gái (nội)', 'Danh từ', '손녀가 귀여워요.', 'Cháu gái dễ thương.'),
  ('4A-L8', '4A', '외삼촌', 'oe-sam-chon', 'Cậu (anh/em trai của mẹ)', 'Danh từ', '외삼촌을 만났어요.', 'Đã gặp cậu.'),
  ('4A-L8', '4A', '의무', 'ui-mu', 'Nghĩa vụ, bổn phận', 'Danh từ', '가족을 돌보는 게 의무예요.', 'Chăm sóc gia đình là bổn phận.'),
  ('4A-L8', '4A', '소수 민족', 'so-su min-jok', 'Dân tộc thiểu số', 'Danh từ', '소수 민족의 문화를 보존해요.', 'Bảo tồn văn hóa của dân tộc thiểu số.'),
  ('4A-L8', '4A', '납서부', 'nap-seo-bu', 'Tây Nam (hướng địa lý)', 'Danh từ', '납서부 지역에 살아요.', 'Sống ở khu vực Tây Nam.'),
  ('4A-L8', '4A', '로고호', 'ro-go-ho', 'Hồ Lugu', 'Danh từ', '로고호는 아름다운 호수예요.', 'Hồ Lugu là một hồ đẹp.'),
  ('4A-L8', '4A', '주변', 'ju-byeon', 'Xung quanh, khu vực lân cận', 'Danh từ', '주변 환경이 좋아요.', 'Môi trường xung quanh tốt.'),
  ('4A-L8', '4A', '야구를 치다', 'ya-gu-reul chi-da', 'Chơi bóng chày', 'Cụm động từ', '야구를 쳐요.', 'Chơi bóng chày.'),
  ('4A-L8', '4A', '세월', 'se-wol', 'Thời gian, năm tháng', 'Danh từ', '세월이 흘렀어요.', 'Năm tháng trôi qua.'),
  ('4A-L8', '4A', '형태', 'hyeong-tae', 'Hình thức, dạng thức', 'Danh từ', '다양한 형태가 있어요.', 'Có nhiều hình thức đa dạng.'),
  ('4A-L8', '4A', '대문', 'dae-mun', 'Cổng lớn, cửa lớn', 'Danh từ', '대문을 열었어요.', 'Đã mở cổng lớn.'),
  ('4A-L8', '4A', '장남', 'jang-nam', 'Con trai trưởng', 'Danh từ', '장남이 가장 역할을 해요.', 'Con trai trưởng đảm nhận vai trò trụ cột.'),
  ('4A-L8', '4A', '막대기', 'mak-dae-gi', 'Cái que, cây gậy', 'Danh từ', '막대기로 놀아요.', 'Chơi bằng cây gậy.');

-- ── Grammar 1 ──────────────────────────────────────────────────────────────
WITH g1 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4A-L8', '4A',
    '~(으)ㄹ수록 (Càng... càng...)',
    'B2',
    'Động từ/Tính từ + (으)ㄹ수록 = càng... càng... Diễn đạt sự tương quan tỉ lệ thuận giữa hai điều.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g1, (VALUES
  ('세계 문화를 알면 알수록 더 흥미로워요.', 'Càng hiểu biết về văn hóa thế giới càng thú vị hơn.'),
  ('사투리는 들으면 들을수록 정겨워요.', 'Phương ngữ càng nghe càng ấm áp tình cảm.'),
  ('전통을 지킬수록 문화가 풍성해져요.', 'Càng gìn giữ truyền thống, văn hóa càng phong phú.')
) AS ex(korean, vietnamese);

-- ── Grammar 2 ──────────────────────────────────────────────────────────────
WITH g2 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4A-L8', '4A',
    '~에 비해서 (So với...)',
    'B2',
    'Danh từ + 에 비해서 = so với... Dùng để so sánh hai đối tượng, tình huống.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g2, (VALUES
  ('한국에 비해서 다른 나라는 사투리 차이가 더 커요.', 'So với Hàn Quốc, ở các nước khác sự khác biệt phương ngữ lớn hơn.'),
  ('도시에 비해서 농촌의 전통이 더 잘 보존되어 있어요.', 'So với thành phố, truyền thống nông thôn được bảo tồn tốt hơn.')
) AS ex(korean, vietnamese);

-- ── Grammar 3 ──────────────────────────────────────────────────────────────
WITH g3 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4A-L8', '4A',
    '~다고 할 수 있다 (Có thể nói là...)',
    'B2',
    'Động từ/Tính từ + 다고 할 수 있다 = có thể nói là... Dùng để đưa ra nhận định, đánh giá.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g3, (VALUES
  ('민속놀이는 문화의 특징을 잘 보여 준다고 할 수 있어요.', 'Có thể nói trò chơi dân gian thể hiện rõ đặc trưng văn hóa.'),
  ('언어는 문화를 반영한다고 할 수 있어요.', 'Có thể nói ngôn ngữ phản ánh văn hóa.')
) AS ex(korean, vietnamese);

-- ── Dialogue ───────────────────────────────────────────────────────────────
INSERT INTO seoul_dialogue (lesson_id, book_id, speaker, text, translation)
VALUES
  ('4A-L8', '4A', '나연', '이번 방학에 동남아 여행을 갔는데 야시장에서 정말 독특한 경험을 했어요.', 'Kỳ nghỉ này tôi đi du lịch Đông Nam Á, đã có trải nghiệm thật độc đáo ở chợ đêm.'),
  ('4A-L8', '4A', '준서', '어떤 경험이었어요? 파사 말람 같은 야시장에 갔어요?', 'Là trải nghiệm gì vậy? Bạn có đến chợ đêm kiểu Pasar Malam không?'),
  ('4A-L8', '4A', '나연', '네, 수상 시장도 갔어요. 배를 타고 물건을 사는 게 정말 흥미로웠어요.', 'Có, tôi cũng đến chợ nổi nữa. Ngồi thuyền mua đồ thật sự rất thú vị.'),
  ('4A-L8', '4A', '준서', '나라별로 시장 문화가 이렇게 다양하다는 게 놀라워요.', 'Thật ngạc nhiên khi văn hóa chợ búa lại đa dạng theo từng đất nước như vậy.'),
  ('4A-L8', '4A', '나연', '맞아요. 알면 알수록 세계 문화가 더 흥미로워요. 민속놀이도 나라마다 달라서 신기했어요.', 'Đúng vậy. Càng tìm hiểu, văn hóa thế giới càng thú vị hơn. Trò chơi dân gian cũng khác nhau theo từng nước nên rất kỳ thú.'),
  ('4A-L8', '4A', '준서', '저도 다음에 직접 가서 다양한 문화를 경험하고 싶어요.', 'Tôi cũng muốn trực tiếp đến đó để trải nghiệm văn hóa đa dạng.');

COMMIT;
