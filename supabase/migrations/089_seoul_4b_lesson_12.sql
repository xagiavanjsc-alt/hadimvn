-- Seoul 4B Lesson 12: 소중한 환경 (Môi trường quý giá)
-- Also removes placeholder 4B-L1 (비즈니스 한국어) if present
-- Generated from src/mocks/data/seoul-books-data.ts

BEGIN;

-- ── Remove placeholder 4B-L1 ──────────────────────────────────────────────
DELETE FROM seoul_dialogue WHERE lesson_id = '4B-L1';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4B-L1');
DELETE FROM seoul_grammar WHERE lesson_id = '4B-L1';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4B-L1';
DELETE FROM seoul_lessons WHERE id = '4B-L1';

-- ── Clean up existing data for 4B-L12 ─────────────────────────────────────
DELETE FROM seoul_dialogue WHERE lesson_id = '4B-L12';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4B-L12');
DELETE FROM seoul_grammar WHERE lesson_id = '4B-L12';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4B-L12';

-- ── Upsert lesson ──────────────────────────────────────────────────────────
INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES (
  '4B-L12', '4B', 12,
  '소중한 환경',
  'Môi trường quý giá',
  ARRAY['Thảo luận về ô nhiễm môi trường và biến đổi khí hậu', 'Học từ vựng về bảo vệ môi trường và tái chế', 'Dùng ~(으)ㄹ수록, ~지 않으면 안 되다 để nói về hậu quả và sự cần thiết']::text[],
  '환경 문제에 대한 토론 (Thảo luận về vấn đề môi trường)',
  'Hàn Quốc có hệ thống phân loại rác (분리수거) rất nghiêm ngặt: rác thức ăn (음식물 쓰레기) bỏ riêng, đồ tái chế (재활용) chia theo loại vật liệu. Túi rác phải mua loại có phí (종량제 봉투) — đây là biện pháp giảm rác hiệu quả. 환경부 (Bộ Môi trường) thường xuyên tổ chức các 캠페인 nâng cao ý thức cộng đồng.'
)
ON CONFLICT (id) DO UPDATE SET
  book_id        = EXCLUDED.book_id,
  lesson_number  = EXCLUDED.lesson_number,
  title          = EXCLUDED.title,
  title_vi       = EXCLUDED.title_vi,
  objectives     = EXCLUDED.objectives,
  dialogue_title = EXCLUDED.dialogue_title,
  cultural_tip   = EXCLUDED.cultural_tip;

-- ── Vocabulary (75 entries) ────────────────────────────────────────────────
INSERT INTO seoul_vocabulary (lesson_id, book_id, korean, pronunciation, vietnamese, part_of_speech, example, example_vi)
VALUES
  ('4B-L12', '4B', '환경 오염', 'hwan-gyeong o-yeom', 'Ô nhiễm môi trường', 'Danh từ', '환경 오염이 심각해요.', 'Ô nhiễm môi trường nghiêm trọng.'),
  ('4B-L12', '4B', '매연', 'mae-yeon', 'Khí thải, khói thải', 'Danh từ', '차에서 매연이 나와요.', 'Xe phát ra khói thải.'),
  ('4B-L12', '4B', '대기 오염', 'dae-gi o-yeom', 'Ô nhiễm không khí', 'Danh từ', '대기 오염이 건강에 나빠요.', 'Ô nhiễm không khí có hại cho sức khỏe.'),
  ('4B-L12', '4B', '일회용품', 'il-hoe-yong-pum', 'Sản phẩm dùng một lần', 'Danh từ', '일회용품 사용을 줄여요.', 'Giảm sử dụng đồ dùng một lần.'),
  ('4B-L12', '4B', '수질 오염', 'su-jil o-yeom', 'Ô nhiễm nước', 'Danh từ', '수질 오염이 심해요.', 'Ô nhiễm nước nghiêm trọng.'),
  ('4B-L12', '4B', '지구 온난화', 'ji-gu on-nan-hwa', 'Sự ấm lên của trái đất, nóng lên toàn cầu', 'Danh từ', '지구 온난화가 빠르게 진행돼요.', 'Sự nóng lên toàn cầu đang diễn ra nhanh.'),
  ('4B-L12', '4B', '토양 오염', 'to-yang o-yeom', 'Ô nhiễm đất', 'Danh từ', '토양 오염이 농업에 영향을 줘요.', 'Ô nhiễm đất ảnh hưởng đến nông nghiệp.'),
  ('4B-L12', '4B', '이상 기후', 'i-sang gi-hu', 'Khí hậu bất thường, biến đổi khí hậu', 'Danh từ', '이상 기후로 피해가 커요.', 'Thiệt hại lớn do khí hậu bất thường.'),
  ('4B-L12', '4B', '폐수', 'pye-su', 'Nước thải', 'Danh từ', '폐수를 함부로 버리면 안 돼요.', 'Không được đổ nước thải bừa bãi.'),
  ('4B-L12', '4B', '보호하다', 'bo-ho-ha-da', 'Bảo vệ (môi trường)', 'Động từ', '환경을 보호해야 해요.', 'Phải bảo vệ môi trường.'),
  ('4B-L12', '4B', '아끼다', 'a-kki-da', 'Tiết kiệm (giấy), trân trọng', 'Động từ', '종이를 아껴 써요.', 'Hãy dùng tiết kiệm giấy.'),
  ('4B-L12', '4B', '음식물 쓰레기를 줄이다', 'eum-sing-mul sseu-re-gi-reul ju-ri-da', 'Giảm rác thức ăn', 'Cụm động từ', '음식물 쓰레기를 줄여야 해요.', 'Cần giảm rác thức ăn.'),
  ('4B-L12', '4B', '낭비하다', 'nang-bi-ha-da', 'Lãng phí (nước, điện)', 'Động từ', '물을 낭비하지 마세요.', 'Đừng lãng phí nước.'),
  ('4B-L12', '4B', '의심하다', 'ui-sim-ha-da', 'Nghi ngờ, hoài nghi', 'Động từ', '수질을 의심해요.', 'Hoài nghi về chất lượng nước.'),
  ('4B-L12', '4B', '강물', 'gang-mul', 'Nước sông', 'Danh từ', '강물이 오염됐어요.', 'Nước sông bị ô nhiễm.'),
  ('4B-L12', '4B', '비바람', 'bi-ba-ram', 'Mưa gió, bão', 'Danh từ', '비바람이 심하게 불었어요.', 'Mưa gió rất mạnh.'),
  ('4B-L12', '4B', '마비되다', 'ma-bi-doe-da', 'Bị tê liệt, bị ngưng trệ', 'Động từ', '교통이 마비됐어요.', 'Giao thông bị tê liệt.'),
  ('4B-L12', '4B', '휠체어', 'hwil-che-eo', 'Xe lăn', 'Danh từ', '휠체어를 타고 이동해요.', 'Di chuyển bằng xe lăn.'),
  ('4B-L12', '4B', '캠페인', 'kaem-pe-in', 'Chiến dịch (tuyên truyền)', 'Danh từ', '환경 캠페인에 참가해요.', 'Tham gia chiến dịch bảo vệ môi trường.'),
  ('4B-L12', '4B', '비닐봉지', 'bi-nil-bong-ji', 'Túi nilon, túi nhựa', 'Danh từ', '비닐봉지 대신 장바구니를 써요.', 'Dùng giỏ hàng thay túi nilon.'),
  ('4B-L12', '4B', '쇼핑백', 'syo-ping-baek', 'Túi giấy mua sắm', 'Danh từ', '쇼핑백을 재활용해요.', 'Tái sử dụng túi giấy mua sắm.'),
  ('4B-L12', '4B', '장바구니', 'jang-ba-gu-ni', 'Giỏ hàng, rổ đi chợ', 'Danh từ', '장바구니를 들고 마트에 가요.', 'Mang giỏ hàng đi siêu thị.'),
  ('4B-L12', '4B', '썩다', 'sseok-da', 'Thối, hỏng, phân hủy', 'Động từ', '음식물이 썩었어요.', 'Thức ăn đã bị thối.'),
  ('4B-L12', '4B', '자가용', 'ja-ga-yong', 'Xe ô tô cá nhân', 'Danh từ', '자가용 대신 대중교통을 이용해요.', 'Dùng phương tiện công cộng thay xe riêng.'),
  ('4B-L12', '4B', '오염시키다', 'o-yeom-si-ki-da', 'Gây ô nhiễm', 'Động từ', '강을 오염시키지 마세요.', 'Đừng gây ô nhiễm sông.'),
  ('4B-L12', '4B', '숲', 'sup', 'Rừng', 'Danh từ', '숲을 보호해야 해요.', 'Phải bảo vệ rừng.'),
  ('4B-L12', '4B', '재활용하다', 'jae-hwal-lyong-ha-da', 'Tái chế (chai thủy tinh, lon)', 'Động từ', '유리병을 재활용해요.', 'Tái chế chai thủy tinh.'),
  ('4B-L12', '4B', '버리다', 'beo-ri-da', 'Vứt (rác, lon)', 'Động từ', '캔을 함부로 버리면 안 돼요.', 'Không được vứt lon bừa bãi.'),
  ('4B-L12', '4B', '오염되다', 'o-yeom-doe-da', 'Bị ô nhiễm', 'Động từ', '바다가 오염됐어요.', 'Biển bị ô nhiễm.'),
  ('4B-L12', '4B', '중단되다', 'jung-dan-doe-da', 'Bị gián đoạn, bị ngừng lại', 'Động từ', '공사가 중단됐어요.', 'Công trình bị gián đoạn.'),
  ('4B-L12', '4B', '취소하다', 'chwi-so-ha-da', 'Hủy bỏ, bãi bỏ', 'Động từ', '행사가 취소됐어요.', 'Sự kiện bị hủy bỏ.'),
  ('4B-L12', '4B', '파괴되다', 'pa-goe-doe-da', 'Bị tàn phá, bị phá hủy', 'Động từ', '생태계가 파괴됐어요.', 'Hệ sinh thái bị tàn phá.'),
  ('4B-L12', '4B', '해결되다', 'hae-gyeol-doe-da', 'Được giải quyết', 'Động từ', '문제가 해결됐어요.', 'Vấn đề được giải quyết.'),
  ('4B-L12', '4B', '제품', 'je-pum', 'Sản phẩm (công nghiệp)', 'Danh từ', '친환경 제품을 사요.', 'Mua sản phẩm thân thiện môi trường.'),
  ('4B-L12', '4B', '상품', 'sang-pum', 'Hàng hóa, sản phẩm (bán hoặc tặng)', 'Danh từ', '중고 상품을 교환해요.', 'Trao đổi hàng hóa đã qua sử dụng.'),
  ('4B-L12', '4B', '붙잡다', 'but-jap-da', 'Nắm chắc, giữ lại', 'Động từ', '기회를 붙잡으세요.', 'Hãy nắm lấy cơ hội.'),
  ('4B-L12', '4B', '덮이다', 'deo-pi-da', 'Bị che phủ, bị bao phủ', 'Động từ', '눈에 덮였어요.', 'Bị phủ đầy tuyết.'),
  ('4B-L12', '4B', '정전이 되다', 'jeong-jeon-i doe-da', 'Mất điện', 'Cụm động từ', '태풍으로 정전이 됐어요.', 'Mất điện do bão.'),
  ('4B-L12', '4B', '빙하', 'bing-ha', 'Sông băng, tảng băng lớn', 'Danh từ', '빙하가 녹고 있어요.', 'Sông băng đang tan chảy.'),
  ('4B-L12', '4B', '사용법', 'sa-yong-beop', 'Cách sử dụng, hướng dẫn sử dụng', 'Danh từ', '사용법을 읽었어요.', 'Đã đọc hướng dẫn sử dụng.'),
  ('4B-L12', '4B', '낡다', 'nak-da', 'Cũ, đã cũ kỹ', 'Tính từ', '낡은 가방이에요.', 'Là cái túi cũ.'),
  ('4B-L12', '4B', '멀쩡하다', 'meol-jjeong-ha-da', 'Nguyên vẹn, vẫn còn tốt', 'Tính từ', '멀쩡한 물건을 버리면 안 돼요.', 'Không được vứt đồ vẫn còn tốt.'),
  ('4B-L12', '4B', '쓰레기 더미', 'sseu-re-gi deo-mi', 'Đống rác', 'Danh từ', '쓰레기 더미가 쌓였어요.', 'Đống rác đã chất cao.'),
  ('4B-L12', '4B', '저절로', 'jeo-jeol-lo', 'Tự nhiên, tự động', 'Phó từ', '저절로 해결됐어요.', 'Tự nhiên được giải quyết.'),
  ('4B-L12', '4B', '재활용 센터', 'jae-hwal-lyong sen-teo', 'Trung tâm tái chế', 'Danh từ', '재활용 센터에 가져가요.', 'Mang đến trung tâm tái chế.'),
  ('4B-L12', '4B', '쌓아 두다', 'ssa-a du-da', 'Chất đống, tích lũy', 'Cụm động từ', '물건을 쌓아 두지 마세요.', 'Đừng chất đồ thành đống.'),
  ('4B-L12', '4B', '지저분하다', 'ji-jeo-bun-ha-da', 'Bẩn thỉu, lộn xộn', 'Tính từ', '방이 지저분해요.', 'Phòng bẩn thỉu.'),
  ('4B-L12', '4B', '양', 'yang', 'Lượng, số lượng', 'Danh từ', '쓰레기 양이 많아요.', 'Lượng rác nhiều.'),
  ('4B-L12', '4B', '펭귄', 'peng-gwin', 'Chim cánh cụt', 'Danh từ', '펭귄은 남극에 살아요.', 'Chim cánh cụt sống ở Nam Cực.'),
  ('4B-L12', '4B', '희귀 동물', 'hui-gwi dong-mul', 'Động vật quý hiếm', 'Danh từ', '희귀 동물을 보호해야 해요.', 'Phải bảo vệ động vật quý hiếm.'),
  ('4B-L12', '4B', '온천', 'on-cheon', 'Suối nước nóng, hệ thống nước nóng', 'Danh từ', '온천에서 목욕했어요.', 'Đã tắm ở suối nước nóng.'),
  ('4B-L12', '4B', '주민', 'ju-min', 'Dân, cư dân', 'Danh từ', '주민들이 항의했어요.', 'Cư dân đã phản đối.'),
  ('4B-L12', '4B', '시위를 벌이다', 'si-wi-reul beo-ri-da', 'Biểu tình, tổ chức biểu tình', 'Cụm động từ', '주민들이 시위를 벌였어요.', 'Cư dân đã tổ chức biểu tình.'),
  ('4B-L12', '4B', '생활 하수', 'saeng-hwal ha-su', 'Nước thải sinh hoạt', 'Danh từ', '생활 하수를 정화해야 해요.', 'Phải xử lý nước thải sinh hoạt.'),
  ('4B-L12', '4B', '식수', 'sik-su', 'Nước uống, nước sinh hoạt', 'Danh từ', '식수가 오염됐어요.', 'Nước uống bị ô nhiễm.'),
  ('4B-L12', '4B', '환경 단체', 'hwan-gyeong dan-che', 'Tổ chức môi trường', 'Danh từ', '환경 단체가 캠페인을 열었어요.', 'Tổ chức môi trường tổ chức chiến dịch.'),
  ('4B-L12', '4B', '흘러들어가다', 'heul-leo-deu-reo-ga-da', 'Chảy vào, tràn vào', 'Động từ', '폐수가 강으로 흘러들어갔어요.', 'Nước thải chảy vào sông.'),
  ('4B-L12', '4B', '북극', 'buk-geuk', 'Bắc Cực', 'Danh từ', '북극 빙하가 녹고 있어요.', 'Sông băng Bắc Cực đang tan chảy.'),
  ('4B-L12', '4B', '남극', 'nam-geuk', 'Nam Cực', 'Danh từ', '남극에는 펭귄이 살아요.', 'Chim cánh cụt sống ở Nam Cực.'),
  ('4B-L12', '4B', '생물', 'saeng-mul', 'Sinh vật, sinh thể', 'Danh từ', '바다 생물이 줄고 있어요.', 'Sinh vật biển đang giảm đi.'),
  ('4B-L12', '4B', '두께', 'du-kke', 'Độ dày, bề dày', 'Danh từ', '빙하 두께가 얇아졌어요.', 'Độ dày sông băng mỏng đi.'),
  ('4B-L12', '4B', '녹다', 'nok-da', 'Tan, tan chảy', 'Động từ', '얼음이 녹았어요.', 'Băng đã tan chảy.'),
  ('4B-L12', '4B', '물개', 'mul-gae', 'Hải cẩu', 'Danh từ', '물개가 빙하 위에 있어요.', 'Hải cẩu đứng trên sông băng.'),
  ('4B-L12', '4B', '북극곰', 'buk-geuk-gom', 'Gấu Bắc Cực', 'Danh từ', '북극곰이 위험에 처해 있어요.', 'Gấu Bắc Cực đang bị nguy hiểm.'),
  ('4B-L12', '4B', '반사하다', 'ban-sa-ha-da', 'Phản xạ, phản chiếu', 'Động từ', '얼음이 햇빛을 반사해요.', 'Băng phản chiếu ánh sáng mặt trời.'),
  ('4B-L12', '4B', '흡수하다', 'heup-su-ha-da', 'Thấm hút, hấp thụ', 'Động từ', '바다가 열을 흡수해요.', 'Biển hấp thụ nhiệt.'),
  ('4B-L12', '4B', '해수면', 'hae-su-myeon', 'Mực nước biển', 'Danh từ', '해수면이 높아지고 있어요.', 'Mực nước biển đang dâng lên.'),
  ('4B-L12', '4B', '해안도시', 'hae-an-do-si', 'Thành phố ven biển', 'Danh từ', '해안도시가 위험해요.', 'Thành phố ven biển đang gặp nguy hiểm.'),
  ('4B-L12', '4B', '잠기다', 'jam-gi-da', 'Bị ngập, bị nhấn chìm', 'Động từ', '도시가 물에 잠겼어요.', 'Thành phố bị ngập nước.'),
  ('4B-L12', '4B', '수익금', 'su-ik-geum', 'Tiền thu được, doanh thu', 'Danh từ', '수익금을 기부했어요.', 'Đã quyên góp tiền thu được.'),
  ('4B-L12', '4B', '중고품', 'jung-go-pum', 'Đồ cũ, đồ đã qua sử dụng', 'Danh từ', '중고품을 사서 환경을 지켜요.', 'Mua đồ cũ để bảo vệ môi trường.'),
  ('4B-L12', '4B', '시민 단체', 'si-min dan-che', 'Tổ chức dân sự, hội công dân', 'Danh từ', '시민 단체가 활동해요.', 'Tổ chức dân sự hoạt động.'),
  ('4B-L12', '4B', '기증받다', 'gi-jeung-bat-da', 'Được tặng, nhận quyên góp', 'Động từ', '물건을 기증받았어요.', 'Đã nhận được đồ vật được tặng.'),
  ('4B-L12', '4B', '운영하다', 'un-yeong-ha-da', 'Điều hành, vận hành', 'Động từ', '재활용 센터를 운영해요.', 'Điều hành trung tâm tái chế.');

-- ── Grammar 1 ──────────────────────────────────────────────────────────────
WITH g1 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L12', '4B',
    '~(으)면 ~(으)ㄹ수록 (Càng... càng...)',
    'B2+',
    'Động từ + (으)면 + (으)ㄹ수록 = càng... càng... Diễn đạt mối tương quan tỉ lệ thuận hoặc nghịch.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g1, (VALUES
  ('환경 오염이 심해지면 심해질수록 피해도 커져요.', 'Ô nhiễm môi trường càng nghiêm trọng thì thiệt hại càng lớn.'),
  ('빙하가 녹으면 녹을수록 해수면이 높아져요.', 'Băng càng tan nhiều thì mực nước biển càng dâng cao.'),
  ('재활용을 많이 하면 할수록 환경이 좋아져요.', 'Tái chế càng nhiều thì môi trường càng tốt hơn.')
) AS ex(korean, vietnamese);

-- ── Grammar 2 ──────────────────────────────────────────────────────────────
WITH g2 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L12', '4B',
    '~지 않으면 안 되다 (Bắt buộc phải..., không thể không...)',
    'B2+',
    'Động từ + 지 않으면 안 되다 = bắt buộc phải... Nhấn mạnh sự cần thiết không thể tránh khỏi.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g2, (VALUES
  ('환경을 보호하지 않으면 안 돼요.', 'Bắt buộc phải bảo vệ môi trường.'),
  ('일회용품 사용을 줄이지 않으면 안 돼요.', 'Không thể không giảm đồ dùng một lần.'),
  ('폐수를 정화하지 않으면 안 됩니다.', 'Bắt buộc phải xử lý nước thải.')
) AS ex(korean, vietnamese);

-- ── Grammar 3 ──────────────────────────────────────────────────────────────
WITH g3 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L12', '4B',
    '~에 의해(서) (Bởi..., do...)',
    'B2+',
    'Danh từ + 에 의해(서) = bởi..., do... Chỉ nguyên nhân hoặc tác nhân gây ra sự việc, thường dùng trong văn viết.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g3, (VALUES
  ('인간에 의해서 환경이 파괴되고 있어요.', 'Môi trường đang bị tàn phá bởi con người.'),
  ('공장 폐수에 의해 강물이 오염됐어요.', 'Nước sông bị ô nhiễm do nước thải nhà máy.')
) AS ex(korean, vietnamese);

-- ── Dialogue ───────────────────────────────────────────────────────────────
INSERT INTO seoul_dialogue (lesson_id, book_id, speaker, text, translation)
VALUES
  ('4B-L12', '4B', '지아', '요즘 지구 온난화 때문에 이상 기후가 심해지고 있어요. 빙하도 많이 녹고 있다고 해요.', 'Dạo này do nóng lên toàn cầu, khí hậu bất thường ngày càng nghiêm trọng. Nghe nói sông băng cũng đang tan chảy nhiều.'),
  ('4B-L12', '4B', '현우', '맞아요. 빙하가 녹으면 녹을수록 해수면이 높아져서 해안도시가 물에 잠길 수도 있대요.', 'Đúng vậy. Sông băng càng tan nhiều thì mực nước biển càng dâng, có thể thành phố ven biển sẽ bị ngập nước.'),
  ('4B-L12', '4B', '지아', '북극곰이나 펭귄 같은 희귀 동물들도 위험에 처해 있잖아요. 환경을 보호하지 않으면 안 돼요.', 'Các động vật quý hiếm như gấu Bắc Cực hay chim cánh cụt cũng đang gặp nguy hiểm. Bắt buộc phải bảo vệ môi trường.'),
  ('4B-L12', '4B', '현우', '맞아요. 일회용품 사용을 줄이고 재활용도 열심히 해야 해요. 비닐봉지 대신 장바구니를 쓰는 것부터 시작해요.', 'Đúng vậy. Phải giảm đồ dùng một lần và tích cực tái chế. Hãy bắt đầu từ việc dùng giỏ hàng thay túi nilon.'),
  ('4B-L12', '4B', '지아', '환경 단체에서 캠페인을 벌이고 있는데 우리도 참여해요!', 'Tổ chức môi trường đang tiến hành chiến dịch, chúng ta cùng tham gia nhé!'),
  ('4B-L12', '4B', '현우', '좋아요. 환경이 파괴되면 파괴될수록 회복하기가 어려우니까 지금 당장 행동해야 해요.', 'Tốt thôi. Môi trường càng bị tàn phá thì càng khó phục hồi, vì vậy phải hành động ngay bây giờ.');

COMMIT;
