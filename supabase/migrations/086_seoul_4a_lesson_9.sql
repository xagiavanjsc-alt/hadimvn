-- Seoul 4A Lesson 9: 한국의 대중문화 (Văn hóa đại chúng Hàn Quốc)
-- Generated from src/mocks/data/seoul-books-data.ts

BEGIN;

-- ── Clean up existing data for 4A-L9 ──────────────────────────────────────
DELETE FROM seoul_dialogue WHERE lesson_id = '4A-L9';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4A-L9');
DELETE FROM seoul_grammar WHERE lesson_id = '4A-L9';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4A-L9';

-- ── Upsert lesson ──────────────────────────────────────────────────────────
INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES (
  '4A-L9', '4A', 9,
  '한국의 대중문화',
  'Văn hóa đại chúng Hàn Quốc',
  ARRAY['Nói về ngành giải trí Hàn Quốc (K-drama, K-pop)', 'Học từ vựng về diễn xuất, ca nhạc và cảm xúc', 'Dùng ~(으)ㄹ 것 같다, ~다니 để diễn đạt cảm xúc']::text[],
  '한국 드라마와 K-팝 이야기 (Chuyện K-drama và K-pop)',
  'Làn sóng Hallyu (한류) đã đưa K-drama và K-pop ra toàn thế giới. Một diễn viên/ca sĩ thường bắt đầu từ 데뷔 (ra mắt) dưới sự quản lý của công ty giải trí, sau đó xuất hiện trong 예능 프로그램 để tăng nhận diện. 팬 미팅 là sự kiện quan trọng để gắn kết với người hâm mộ. Diễn viên nam Hàn Quốc thường phải 입대 (nhập ngũ) từ 18–28 tuổi, đây là nghĩa vụ quân sự bắt buộc.'
)
ON CONFLICT (id) DO UPDATE SET
  book_id        = EXCLUDED.book_id,
  lesson_number  = EXCLUDED.lesson_number,
  title          = EXCLUDED.title,
  title_vi       = EXCLUDED.title_vi,
  objectives     = EXCLUDED.objectives,
  dialogue_title = EXCLUDED.dialogue_title,
  cultural_tip   = EXCLUDED.cultural_tip;

-- ── Vocabulary (84 entries) ────────────────────────────────────────────────
INSERT INTO seoul_vocabulary (lesson_id, book_id, korean, pronunciation, vietnamese, part_of_speech, example, example_vi)
VALUES
  ('4A-L9', '4A', '기분', 'gi-bun', 'Tâm trạng, cảm xúc', 'Danh từ', '기분이 좋아요.', 'Tâm trạng tốt.'),
  ('4A-L9', '4A', '작품 설명', 'jak-pum seol-myeong', 'Giới thiệu về tác phẩm', 'Danh từ', '작품 설명을 들었어요.', 'Đã nghe giới thiệu về tác phẩm.'),
  ('4A-L9', '4A', '꿈만 같다', 'kkum-man gat-da', 'Như một giấc mơ', 'Cụm tính từ', '상을 받다니 꿈만 같아요.', 'Nhận giải thưởng mà cứ như một giấc mơ.'),
  ('4A-L9', '4A', '믿기지 않다', 'mit-gi-ji an-ta', 'Không thể tin được', 'Cụm tính từ', '이 결과가 믿기지 않아요.', 'Không thể tin được kết quả này.'),
  ('4A-L9', '4A', '숨이 멎는 줄 알았다', 'su-mi meot-neun jul al-at-da', 'Tưởng như ngừng thở', 'Cụm động từ', '발표를 듣고 숨이 멎는 줄 알았어요.', 'Nghe thông báo tưởng như ngừng thở.'),
  ('4A-L9', '4A', '심장이 터질 것 같다', 'sim-jang-i teo-jil geot gat-da', 'Tim như muốn vỡ tung', 'Cụm động từ', '너무 긴장해서 심장이 터질 것 같아요.', 'Hồi hộp quá tim như muốn vỡ tung.'),
  ('4A-L9', '4A', '실감이 안 나다', 'sil-ga-mi an na-da', 'Không cảm thấy thật', 'Cụm động từ', '아직 실감이 안 나요.', 'Vẫn chưa cảm thấy thật.'),
  ('4A-L9', '4A', '얼떨떨하다', 'eol-tteol-tteol-ha-da', 'Rối bời, choáng váng', 'Tính từ', '갑자기 상을 받아서 얼떨떨해요.', 'Đột nhiên nhận giải nên choáng váng.'),
  ('4A-L9', '4A', '인기가 있다', 'in-gi-ga it-da', 'Nổi tiếng, được ưa chuộng', 'Cụm động từ', '이 배우는 인기가 많아요.', 'Diễn viên này rất nổi tiếng.'),
  ('4A-L9', '4A', '좋은 반응을 얻다', 'jo-eun ban-eung-eul eot-da', 'Nhận được phản hồi tốt', 'Cụm động từ', '드라마가 좋은 반응을 얻었어요.', 'Bộ phim nhận được phản hồi tốt.'),
  ('4A-L9', '4A', '오해', 'o-hae', 'Hiểu lầm', 'Danh từ', '오해를 풀었어요.', 'Đã giải toả hiểu lầm.'),
  ('4A-L9', '4A', '화해하다', 'hwa-hae-ha-da', 'Làm hòa, hòa giải', 'Động từ', '친구와 화해했어요.', 'Đã làm hòa với bạn.'),
  ('4A-L9', '4A', '질투심', 'jil-tu-sim', 'Lòng ghen tuông, tính ghen tị', 'Danh từ', '질투심이 생겼어요.', 'Nảy sinh lòng ghen tuông.'),
  ('4A-L9', '4A', '밝혀내다', 'bal-kyeo-nae-da', 'Làm sáng tỏ, phơi bày', 'Động từ', '진실을 밝혀냈어요.', 'Đã làm sáng tỏ sự thật.'),
  ('4A-L9', '4A', '실감하다', 'sil-gam-ha-da', 'Cảm nhận thực sự, thấm thía', 'Động từ', '성공을 실감했어요.', 'Đã cảm nhận thực sự sự thành công.'),
  ('4A-L9', '4A', '데뷔하다', 'de-bwi-ha-da', 'Ra mắt, debut', 'Động từ', '올해 데뷔했어요.', 'Năm nay đã ra mắt.'),
  ('4A-L9', '4A', '동기', 'dong-gi', 'Người cùng thế hệ/khóa, đồng nghiệp cùng thời', 'Danh từ', '데뷔 동기예요.', 'Là người ra mắt cùng khóa.'),
  ('4A-L9', '4A', '그리', 'geu-ri', 'Như vậy, như thế', 'Phó từ', '그리 생각하지 않아요.', 'Không nghĩ như vậy.'),
  ('4A-L9', '4A', '추천하다', 'chu-cheon-ha-da', 'Giới thiệu, đề xuất', 'Động từ', '이 드라마를 추천해요.', 'Tôi giới thiệu bộ phim này.'),
  ('4A-L9', '4A', '역', 'yeok', 'Vai (diễn), nhân vật', 'Danh từ', '악역을 맡았어요.', 'Đã đảm nhận vai phản diện.'),
  ('4A-L9', '4A', '주목을 받다', 'ju-mo-geul bat-da', 'Nhận được sự chú ý', 'Cụm động từ', '신인 배우가 주목을 받고 있어요.', 'Diễn viên mới đang nhận được sự chú ý.'),
  ('4A-L9', '4A', '작품에 출연하다', 'jak-pu-me chu-ryeon-ha-da', 'Xuất hiện trong tác phẩm', 'Cụm động từ', '여러 작품에 출연했어요.', 'Đã xuất hiện trong nhiều tác phẩm.'),
  ('4A-L9', '4A', '역할을 맡다', 'yeok-a-reul mat-da', 'Đảm nhận vai diễn, nhiệm vụ', 'Cụm động từ', '주인공 역할을 맡았어요.', 'Đã đảm nhận vai nhân vật chính.'),
  ('4A-L9', '4A', '급히', 'geu-pi', 'Gấp, vội vàng', 'Phó từ', '급히 출발했어요.', 'Đã xuất phát vội vàng.'),
  ('4A-L9', '4A', '당연히', 'dang-yeon-hi', 'Đương nhiên, tất nhiên', 'Phó từ', '당연히 해야 해요.', 'Đương nhiên phải làm.'),
  ('4A-L9', '4A', '솔직히', 'sol-ji-ki', 'Thành thật mà nói', 'Phó từ', '솔직히 말해요.', 'Nói thành thật đi.'),
  ('4A-L9', '4A', '우연히', 'u-yeon-hi', 'Tình cờ, ngẫu nhiên', 'Phó từ', '우연히 만났어요.', 'Tình cờ gặp nhau.'),
  ('4A-L9', '4A', '은근히', 'eun-geun-hi', 'Thầm lặng, ngấm ngầm', 'Phó từ', '은근히 기대해요.', 'Thầm kỳ vọng.'),
  ('4A-L9', '4A', '흔히', 'heun-hi', 'Thường thường, hay gặp', 'Phó từ', '흔히 볼 수 있는 장면이에요.', 'Là cảnh hay gặp.'),
  ('4A-L9', '4A', '음치', 'eum-chi', 'Người hát lạc điệu, mù nhạc', 'Danh từ', '저는 음치예요.', 'Tôi hát lạc điệu.'),
  ('4A-L9', '4A', '시사회', 'si-sa-hoe', 'Buổi chiếu ra mắt, chiếu trước', 'Danh từ', '시사회에 초대받았어요.', 'Được mời đến buổi chiếu ra mắt.'),
  ('4A-L9', '4A', '실제로', 'sil-je-ro', 'Thực tế, trong thực tế', 'Phó từ', '실제로 만나 봤어요.', 'Đã gặp trong thực tế.'),
  ('4A-L9', '4A', '기립 박수', 'gi-rip bak-su', 'Vỗ tay đứng lên (tán thưởng)', 'Danh từ', '기립 박수를 받았어요.', 'Đã nhận được tràng vỗ tay đứng lên.'),
  ('4A-L9', '4A', '팬 미팅', 'paen mi-ting', 'Gặp gỡ người hâm mộ', 'Danh từ', '팬 미팅에 갔어요.', 'Đã đi gặp gỡ người hâm mộ.'),
  ('4A-L9', '4A', '승부를 펼치다', 'seung-bu-reul pyeol-chi-da', 'Thi đua, cạnh tranh tài năng', 'Cụm động từ', '무대에서 승부를 펼쳤어요.', 'Đã thi đua tài năng trên sân khấu.'),
  ('4A-L9', '4A', '출연자', 'chu-ryeon-ja', 'Người xuất hiện, diễn viên tham gia', 'Danh từ', '출연자들이 실력을 뽐냈어요.', 'Các diễn viên đã thể hiện tài năng.'),
  ('4A-L9', '4A', '원작', 'won-jak', 'Tác phẩm gốc, nguyên tác', 'Danh từ', '원작 소설이 있어요.', 'Có tiểu thuyết nguyên tác.'),
  ('4A-L9', '4A', '혜택', 'hye-taek', 'Ưu đãi, lợi ích, chế độ đãi ngộ', 'Danh từ', '다양한 혜택을 받아요.', 'Nhận được nhiều ưu đãi.'),
  ('4A-L9', '4A', '가창력', 'ga-chang-nyeok', 'Khả năng ca hát', 'Danh từ', '가창력이 뛰어나요.', 'Khả năng ca hát xuất sắc.'),
  ('4A-L9', '4A', '경쾌하다', 'gyeong-kwae-ha-da', 'Vui tươi, nhẹ nhàng sảng khoái', 'Tính từ', '경쾌한 음악이에요.', 'Là bản nhạc vui tươi.'),
  ('4A-L9', '4A', '리듬', 'ri-deum', 'Nhịp điệu, rhythm', 'Danh từ', '리듬이 좋아요.', 'Nhịp điệu hay.'),
  ('4A-L9', '4A', '진지하다', 'jin-ji-ha-da', 'Nghiêm túc, trầm tĩnh', 'Tính từ', '진지하게 연기해요.', 'Diễn xuất nghiêm túc.'),
  ('4A-L9', '4A', '열띠다', 'yeol-tchi-da', 'Sôi nổi, nhiệt huyết, khốc liệt', 'Tính từ', '열띤 경쟁이 펼쳐졌어요.', 'Cuộc cạnh tranh sôi nổi diễn ra.'),
  ('4A-L9', '4A', '벌이다', 'beo-ri-da', 'Bày biện, triển khai, gây ra', 'Động từ', '큰 행사를 벌였어요.', 'Đã tổ chức sự kiện lớn.'),
  ('4A-L9', '4A', '안개가 끼다', 'an-gae-ga kki-da', 'Sương mù dày đặc', 'Cụm động từ', '아침에 안개가 많이 끼었어요.', 'Buổi sáng sương mù dày đặc.'),
  ('4A-L9', '4A', '발생하다', 'bal-saeng-ha-da', 'Phát sinh, xảy ra', 'Động từ', '사고가 발생했어요.', 'Đã xảy ra tai nạn.'),
  ('4A-L9', '4A', '멜로 드라마', 'mel-lo deu-ra-ma', 'Phim tình cảm lãng mạn', 'Danh từ', '멜로 드라마를 좋아해요.', 'Tôi thích phim tình cảm lãng mạn.'),
  ('4A-L9', '4A', '주인공', 'ju-in-gong', 'Nhân vật chính', 'Danh từ', '주인공이 멋있어요.', 'Nhân vật chính đẹp trai/xinh gái.'),
  ('4A-L9', '4A', '복수하다', 'bok-su-ha-da', 'Trả thù', 'Động từ', '복수하는 장면이 인상적이었어요.', 'Cảnh trả thù rất ấn tượng.'),
  ('4A-L9', '4A', '대표 곡', 'dae-pyo gok', 'Bài hát tiêu biểu, ca khúc đại diện', 'Danh từ', '대표 곡을 불렀어요.', 'Đã hát bài hát tiêu biểu.'),
  ('4A-L9', '4A', '절정', 'jeol-jeong', 'Đỉnh điểm, cao trào', 'Danh từ', '드라마가 절정에 달했어요.', 'Bộ phim đã đến đỉnh điểm.'),
  ('4A-L9', '4A', '출연', 'chu-ryeon', 'Xuất hiện, trình diễn', 'Danh từ', '방송에 출연했어요.', 'Đã xuất hiện trên sóng truyền hình.'),
  ('4A-L9', '4A', '예능 프로그램', 'ye-neung peu-ro-geu-raem', 'Chương trình giải trí', 'Danh từ', '예능 프로그램에 나왔어요.', 'Đã xuất hiện trong chương trình giải trí.'),
  ('4A-L9', '4A', '일상', 'il-sang', 'Hằng ngày, đời thường', 'Danh từ', '일상을 공유해요.', 'Chia sẻ cuộc sống đời thường.'),
  ('4A-L9', '4A', '노부모', 'no-bu-mo', 'Bố mẹ già', 'Danh từ', '노부모를 모셔요.', 'Phụng dưỡng bố mẹ già.'),
  ('4A-L9', '4A', '대', 'dae', 'Thế hệ, thập niên (tuổi)', 'Hậu tố', '20대 청년이에요.', 'Là thanh niên tuổi 20.'),
  ('4A-L9', '4A', '사소하다', 'sa-so-ha-da', 'Nhỏ nhặt, vặt vãnh', 'Tính từ', '사소한 일로 싸웠어요.', 'Cãi nhau vì chuyện nhỏ nhặt.'),
  ('4A-L9', '4A', '갈등', 'gal-deung', 'Mâu thuẫn, xung đột', 'Danh từ', '갈등이 생겼어요.', 'Đã nảy sinh mâu thuẫn.'),
  ('4A-L9', '4A', '상금', 'sang-geum', 'Tiền thưởng', 'Danh từ', '상금을 받았어요.', 'Đã nhận được tiền thưởng.'),
  ('4A-L9', '4A', '효도', 'hyo-do', 'Hiếu thảo', 'Danh từ', '부모님께 효도해요.', 'Hiếu thảo với bố mẹ.'),
  ('4A-L9', '4A', '트럭', 'teu-reok', 'Xe tải', 'Danh từ', '트럭을 운전해요.', 'Lái xe tải.'),
  ('4A-L9', '4A', '헬리콥터', 'hel-li-kop-teo', 'Máy bay trực thăng', 'Danh từ', '헬리콥터를 탔어요.', 'Đã đi trực thăng.'),
  ('4A-L9', '4A', '헬멧', 'hel-met', 'Mũ bảo hiểm', 'Danh từ', '헬멧을 쓰세요.', 'Hãy đội mũ bảo hiểm.'),
  ('4A-L9', '4A', '헬스클럽', 'hel-seu-keul-leop', 'Phòng tập thể dục', 'Danh từ', '헬스클럽에 다녀요.', 'Đi phòng tập thể dục.'),
  ('4A-L9', '4A', '번역', 'beon-yeok', 'Dịch thuật, bản dịch', 'Danh từ', '번역이 잘 됐어요.', 'Bản dịch tốt.'),
  ('4A-L9', '4A', '장사', 'jang-sa', 'Buôn bán, kinh doanh', 'Danh từ', '장사가 잘 돼요.', 'Buôn bán tốt.'),
  ('4A-L9', '4A', '야간 대학교', 'ya-gan dae-hak-gyo', 'Trường đại học tối (lớp đêm)', 'Danh từ', '야간 대학교에 다녀요.', 'Học trường đại học lớp đêm.'),
  ('4A-L9', '4A', '어쩔 수 없다', 'eo-jjeol su eop-da', 'Không có cách nào khác', 'Cụm động từ', '어쩔 수 없어요.', 'Không có cách nào khác.'),
  ('4A-L9', '4A', '놓치다', 'no-chi-da', 'Bỏ lỡ, lỡ mất', 'Động từ', '기회를 놓쳤어요.', 'Đã bỏ lỡ cơ hội.'),
  ('4A-L9', '4A', '애를 쓰다', 'ae-reul sseu-da', 'Nỗ lực hết mình, cố gắng', 'Cụm động từ', '합격하려고 애를 썼어요.', 'Đã nỗ lực hết mình để đậu.'),
  ('4A-L9', '4A', '절대로', 'jeol-dae-ro', 'Tuyệt đối, nhất định', 'Phó từ', '절대로 포기하지 않아요.', 'Tuyệt đối không từ bỏ.'),
  ('4A-L9', '4A', '험하다', 'heom-ha-da', 'Hiểm trở, gập ghềnh, nguy hiểm', 'Tính từ', '길이 험해요.', 'Đường hiểm trở.'),
  ('4A-L9', '4A', '관계자', 'gwan-gye-ja', 'Người có liên quan', 'Danh từ', '관계자만 입장 가능해요.', 'Chỉ người liên quan mới được vào.'),
  ('4A-L9', '4A', '비결', 'bi-gyeol', 'Bí quyết', 'Danh từ', '성공의 비결이 뭐예요?', 'Bí quyết thành công là gì?'),
  ('4A-L9', '4A', '솔직하다', 'sol-ji-ka-da', 'Thành thật, thẳng thắn', 'Tính từ', '솔직하게 말해요.', 'Nói thành thật.'),
  ('4A-L9', '4A', '애교가 많다', 'ae-gyo-ga man-ta', 'Hay nũng nịu, nhiều cử chỉ dễ thương', 'Cụm tính từ', '그 배우는 애교가 많아요.', 'Diễn viên đó hay nũng nịu.'),
  ('4A-L9', '4A', '향후', 'hyang-hu', 'Sau này, tiếp theo', 'Phó từ', '향후 계획이 있어요?', 'Bạn có kế hoạch sau này không?'),
  ('4A-L9', '4A', '입대하다', 'ip-dae-ha-da', 'Nhập ngũ', 'Động từ', '내년에 입대해요.', 'Năm sau nhập ngũ.'),
  ('4A-L9', '4A', '눈치를 채다', 'nun-chi-reul chae-da', 'Nhận ra tình hình, đọc được ý tứ', 'Cụm động từ', '눈치를 빠르게 채요.', 'Nhanh chóng nhận ra tình hình.'),
  ('4A-L9', '4A', '말리다', 'mal-li-da', 'Ngăn cản / làm khô', 'Động từ', '싸우는 것을 말렸어요.', 'Đã ngăn cản việc cãi nhau.'),
  ('4A-L9', '4A', '시나리오', 'si-na-ri-o', 'Kịch bản', 'Danh từ', '시나리오를 읽었어요.', 'Đã đọc kịch bản.'),
  ('4A-L9', '4A', '막내딸', 'mang-nae-ttal', 'Con gái út', 'Danh từ', '막내딸이 귀여워요.', 'Con gái út dễ thương.'),
  ('4A-L9', '4A', '귀하다', 'gwi-ha-da', 'Cao quý, quý giá, trân quý', 'Tính từ', '귀한 경험이에요.', 'Là trải nghiệm quý giá.');

-- ── Grammar 1 ──────────────────────────────────────────────────────────────
WITH g1 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4A-L9', '4A',
    '~다니 (Thật không ngờ... mà, ngạc nhiên vì...)',
    'B2',
    'Câu + 다니 = thật không ngờ... mà! Diễn đạt sự ngạc nhiên hoặc khó tin về một sự việc.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g1, (VALUES
  ('데뷔한 지 1년 만에 상을 받다니 정말 대단해요.', 'Mới debut được 1 năm mà đã nhận giải, thật không ngờ.'),
  ('그 배우가 은퇴한다니 믿기지 않아요.', 'Nghe nói diễn viên đó về hưu mà không thể tin được.'),
  ('이 드라마가 그렇게 인기가 있다니 몰랐어요.', 'Không ngờ bộ phim này lại nổi tiếng đến vậy.')
) AS ex(korean, vietnamese);

-- ── Grammar 2 ──────────────────────────────────────────────────────────────
WITH g2 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4A-L9', '4A',
    '~(으)ㄹ 만하다 (Đáng để..., xứng đáng...)',
    'B2',
    'Động từ + (으)ㄹ 만하다 = đáng để... Diễn đạt điều gì đó xứng đáng hoặc có giá trị.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g2, (VALUES
  ('이 드라마는 볼 만해요.', 'Bộ phim này đáng xem.'),
  ('그 배우의 연기는 믿을 만해요.', 'Diễn xuất của diễn viên đó đáng tin.'),
  ('이 가수의 가창력은 인정할 만해요.', 'Khả năng ca hát của ca sĩ này đáng được công nhận.')
) AS ex(korean, vietnamese);

-- ── Grammar 3 ──────────────────────────────────────────────────────────────
WITH g3 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4A-L9', '4A',
    '~는 편이다 (Thiên về..., thuộc loại...)',
    'B2',
    'Động từ/Tính từ + 는 편이다 = thiên về..., thuộc loại... Dùng để đưa ra đánh giá mang tính tương đối.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g3, (VALUES
  ('이 드라마는 진지한 편이에요.', 'Bộ phim này thuộc loại nghiêm túc.'),
  ('그 가수는 애교가 많은 편이에요.', 'Ca sĩ đó thiên về hay nũng nịu.'),
  ('솔직히 이 노래는 경쾌한 편이에요.', 'Thành thật mà nói, bài hát này thuộc loại vui tươi.')
) AS ex(korean, vietnamese);

-- ── Dialogue ───────────────────────────────────────────────────────────────
INSERT INTO seoul_dialogue (lesson_id, book_id, speaker, text, translation)
VALUES
  ('4A-L9', '4A', '민아', '요즘 어떤 드라마 봐요? 추천해 줄 만한 게 있어요?', 'Dạo này bạn xem phim gì? Có phim nào đáng giới thiệu không?'),
  ('4A-L9', '4A', '준혁', '요즘 멜로 드라마 하나를 보는데 절정에 달하니까 솔직히 밤새 봤어요.', 'Dạo này đang xem một bộ phim tình cảm, đến cao trào thành thật mà nói đã xem thâu đêm.'),
  ('4A-L9', '4A', '민아', '그 드라마 주인공이 누구예요? 인기가 있는 배우예요?', 'Nhân vật chính của phim đó là ai? Có phải diễn viên nổi tiếng không?'),
  ('4A-L9', '4A', '준혁', '네, 올해 데뷔해서 주목을 받은 신인인데 가창력도 뛰어나고 연기도 진지해요.', 'Có, là diễn viên mới ra mắt năm nay và nhận được nhiều chú ý, vừa có khả năng ca hát xuất sắc vừa diễn xuất nghiêm túc.'),
  ('4A-L9', '4A', '민아', '오, 그 사람 시사회에서 기립 박수를 받았다니 정말 대단하네요!', 'Ồ, nghe nói người đó nhận được tràng vỗ tay đứng lên ở buổi chiếu ra mắt, thật không ngờ, tuyệt quá!'),
  ('4A-L9', '4A', '준혁', '맞아요. 향후 예능 프로그램에도 출연할 거래요. 놓치지 말고 꼭 보세요!', 'Đúng vậy. Nghe nói sắp tới cũng sẽ xuất hiện trong chương trình giải trí nữa. Nhất định đừng bỏ lỡ!');

COMMIT;
