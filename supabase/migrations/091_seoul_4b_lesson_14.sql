-- Seoul 4B Lesson 14: 동물과 식물 (Động vật và thực vật)
-- Generated from src/mocks/data/seoul-books-data.ts

BEGIN;

-- ── Clean up existing data for 4B-L14 ─────────────────────────────────────
DELETE FROM seoul_dialogue WHERE lesson_id = '4B-L14';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4B-L14');
DELETE FROM seoul_grammar WHERE lesson_id = '4B-L14';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4B-L14';

-- ── Upsert lesson ──────────────────────────────────────────────────────────
INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES (
  '4B-L14', '4B', 14,
  '동물과 식물',
  'Động vật và thực vật',
  ARRAY['Thảo luận về các chủ đề xã hội và gia đình trong cuộc sống hiện đại', 'Học từ vựng về các vấn đề xã hội, gia đình và giáo dục', 'Dùng ~(으)ㄹ 만하다, ~다 보면 để diễn đạt đánh giá và quá trình']::text[],
  '현대 가정의 변화 (Sự thay đổi của gia đình hiện đại)',
  'Xã hội Hàn Quốc đang đối mặt với thay đổi lớn trong cấu trúc gia đình: từ đại gia đình (대가족) chuyển sang gia đình hạt nhân (핵가족). Việc kính trọng người lớn tuổi (웃어른 공경) là giá trị cốt lõi của văn hóa Hàn, nhưng áp lực kinh tế và cuộc sống hiện đại đang tạo ra nhiều thách thức mới.'
)
ON CONFLICT (id) DO UPDATE SET
  book_id        = EXCLUDED.book_id,
  lesson_number  = EXCLUDED.lesson_number,
  title          = EXCLUDED.title,
  title_vi       = EXCLUDED.title_vi,
  objectives     = EXCLUDED.objectives,
  dialogue_title = EXCLUDED.dialogue_title,
  cultural_tip   = EXCLUDED.cultural_tip;

-- ── Vocabulary (40 entries) ────────────────────────────────────────────────
INSERT INTO seoul_vocabulary (lesson_id, book_id, korean, pronunciation, vietnamese, part_of_speech, example, example_vi)
VALUES
  ('4B-L14', '4B', '안정적이다', 'an-jeong-jeo-gi-da', 'Ổn định, có tính ổn định', 'Tính từ', '안정적인 직업을 원해요.', 'Muốn có công việc ổn định.'),
  ('4B-L14', '4B', '피하다', 'pi-ha-da', 'Né tránh, tránh né', 'Động từ', '문제를 피하면 안 돼요.', 'Không được né tránh vấn đề.'),
  ('4B-L14', '4B', '반영하다', 'ban-yeong-ha-da', 'Phản ánh, phản chiếu', 'Động từ', '현실을 반영해요.', 'Phản ánh hiện thực.'),
  ('4B-L14', '4B', '문화재', 'mun-hwa-jae', 'Di sản văn hóa, cổ vật văn hóa', 'Danh từ', '문화재를 보호해야 해요.', 'Phải bảo vệ di sản văn hóa.'),
  ('4B-L14', '4B', '꼽다', 'kkop-da', 'Kể vào, liệt vào hàng, coi là', 'Động từ', '최고로 꼽혀요.', 'Được coi vào hàng tốt nhất.'),
  ('4B-L14', '4B', '공경하다', 'gong-gyeong-ha-da', 'Cung kính, kính trọng', 'Động từ', '어른을 공경해야 해요.', 'Phải kính trọng người lớn tuổi.'),
  ('4B-L14', '4B', '만만치 않다', 'man-man-chi an-ta', 'Không đơn giản, không dễ dàng', 'Cụm tính từ', '그 일이 만만치 않아요.', 'Việc đó không đơn giản chút nào.'),
  ('4B-L14', '4B', '인건비', 'in-geon-bi', 'Chi phí nhân công', 'Danh từ', '인건비가 많이 들어요.', 'Chi phí nhân công tốn nhiều.'),
  ('4B-L14', '4B', '조화를 이루다', 'jo-hwa-reul i-ru-da', 'Hòa hợp, dung hòa', 'Cụm động từ', '전통과 현대가 조화를 이뤄요.', 'Truyền thống và hiện đại hòa hợp với nhau.'),
  ('4B-L14', '4B', '현실', 'hyeon-sil', 'Hiện thực, thực tế', 'Danh từ', '현실을 직시해야 해요.', 'Phải nhìn thẳng vào thực tế.'),
  ('4B-L14', '4B', '인상이 깊다', 'in-sang-i gip-da', 'Ấn tượng sâu sắc, gây ấn tượng mạnh', 'Cụm tính từ', '그 공연이 인상이 깊었어요.', 'Buổi biểu diễn đó gây ấn tượng sâu sắc.'),
  ('4B-L14', '4B', '일반적이다', 'il-ban-jeo-gi-da', 'Thông thường, phổ biến, bình thường', 'Tính từ', '일반적인 경우예요.', 'Là trường hợp thông thường.'),
  ('4B-L14', '4B', '웃어른', 'u-seo-reun', 'Bề trên, người lớn tuổi hơn', 'Danh từ', '웃어른을 공경해야 해요.', 'Phải kính trọng bề trên.'),
  ('4B-L14', '4B', '인상을 받다', 'in-sang-eul bat-da', 'Nhận được ấn tượng, bị ấn tượng', 'Cụm động từ', '좋은 인상을 받았어요.', 'Đã nhận được ấn tượng tốt.'),
  ('4B-L14', '4B', '씀씀이', 'sseum-sseu-mi', 'Thói quen tiêu tiền, cách tiêu xài', 'Danh từ', '씀씀이가 헤퍼요.', 'Thói quen tiêu tiền quá tay.'),
  ('4B-L14', '4B', '의대', 'ui-dae', 'Đại học Y, trường Y', 'Danh từ', '의대에 진학하고 싶어요.', 'Muốn vào trường Y.'),
  ('4B-L14', '4B', '법대', 'beop-dae', 'Đại học Luật, trường Luật', 'Danh từ', '법대를 졸업했어요.', 'Đã tốt nghiệp trường Luật.'),
  ('4B-L14', '4B', '부담이 늘다', 'bu-da-mi neul-da', 'Gánh nặng tăng lên, áp lực tăng', 'Cụm động từ', '부담이 점점 늘어요.', 'Gánh nặng ngày càng tăng.'),
  ('4B-L14', '4B', '돌아다니다', 'do-ra-da-ni-da', 'Đi loanh quanh, lang thang, lưu hành', 'Động từ', '소문이 돌아다녀요.', 'Tin đồn đang lưu hành.'),
  ('4B-L14', '4B', '요양병원', 'yo-yang-byeong-won', 'Viện dưỡng lão, bệnh viện an dưỡng', 'Danh từ', '할머니가 요양병원에 계세요.', 'Bà ngoại đang ở viện dưỡng lão.'),
  ('4B-L14', '4B', '배꼽', 'bae-kkop', 'Rốn', 'Danh từ', '배꼽이 있어요.', 'Có cái rốn.'),
  ('4B-L14', '4B', '재다', 'jae-da', 'Đo, đo lường', 'Động từ', '키를 쟀어요.', 'Đã đo chiều cao.'),
  ('4B-L14', '4B', '세로', 'se-ro', 'Chiều dọc', 'Danh từ', '세로로 잘라요.', 'Cắt theo chiều dọc.'),
  ('4B-L14', '4B', '합창단', 'hap-chang-dan', 'Đội hợp xướng', 'Danh từ', '합창단에서 노래해요.', 'Hát trong đội hợp xướng.'),
  ('4B-L14', '4B', '소프라노', 'so-peu-ra-no', 'Giọng soprano (giọng cao nữ)', 'Danh từ', '소프라노 목소리가 아름다워요.', 'Giọng soprano rất đẹp.'),
  ('4B-L14', '4B', '상당수', 'sang-dang-su', 'Số lượng đáng kể, một số lượng đáng kể', 'Danh từ', '상당수가 찬성했어요.', 'Một số lượng đáng kể đã tán thành.'),
  ('4B-L14', '4B', '지식을 쌓다', 'ji-si-geul ssa-ta', 'Tích lũy kiến thức, tích lũy tri thức', 'Cụm động từ', '독서로 지식을 쌓아요.', 'Tích lũy kiến thức qua đọc sách.'),
  ('4B-L14', '4B', '표시하다', 'pyo-si-ha-da', 'Đánh dấu, biểu thị, ghi chú', 'Động từ', '지도에 표시했어요.', 'Đã đánh dấu trên bản đồ.'),
  ('4B-L14', '4B', '가정', 'ga-jeong', 'Gia đình, hộ gia đình', 'Danh từ', '가정이 중요해요.', 'Gia đình rất quan trọng.'),
  ('4B-L14', '4B', '자격증을 따다', 'ja-gyeok-jjeung-eul tta-da', 'Lấy chứng chỉ, đạt được bằng cấp', 'Cụm động từ', '자격증을 땄어요.', 'Đã lấy được chứng chỉ.'),
  ('4B-L14', '4B', '고아원', 'go-a-won', 'Cô nhi viện, trại trẻ mồ côi', 'Danh từ', '고아원에서 봉사했어요.', 'Đã tình nguyện tại cô nhi viện.'),
  ('4B-L14', '4B', '미인형', 'mi-in-hyeong', 'Típ người đẹp, dạng mỹ nhân', 'Danh từ', '미인형 얼굴이에요.', 'Khuôn mặt theo chuẩn mỹ nhân.'),
  ('4B-L14', '4B', '위치', 'wi-chi', 'Vị trí, địa điểm', 'Danh từ', '좋은 위치에 있어요.', 'Nằm ở vị trí tốt.'),
  ('4B-L14', '4B', '가로', 'ga-ro', 'Chiều ngang, chiều rộng', 'Danh từ', '가로로 잘라요.', 'Cắt theo chiều ngang.'),
  ('4B-L14', '4B', '이상적이다', 'i-sang-jeo-gi-da', 'Lý tưởng, hoàn hảo, đáng mơ ước', 'Tính từ', '이상적인 조건이에요.', 'Là điều kiện lý tưởng.'),
  ('4B-L14', '4B', '구성', 'gu-seong', 'Cấu thành, cấu trúc, thành phần', 'Danh từ', '팀 구성이 좋아요.', 'Cấu thành nhóm tốt.'),
  ('4B-L14', '4B', '포털 사이트', 'po-teol sa-i-teu', 'Cổng thông tin điện tử, trang web tổng hợp', 'Danh từ', '포털 사이트에서 검색했어요.', 'Đã tìm kiếm trên cổng thông tin điện tử.'),
  ('4B-L14', '4B', '복수 응답', 'bok-su eung-dap', 'Trả lời nhiều đáp án, chọn nhiều đáp án', 'Danh từ', '복수 응답이 가능해요.', 'Có thể chọn nhiều đáp án.'),
  ('4B-L14', '4B', '박자에 맞추다', 'bak-ja-e mat-chu-da', 'Đúng nhịp, bắt nhịp theo', 'Cụm động từ', '박자에 맞춰서 노래해요.', 'Hát đúng nhịp.'),
  ('4B-L14', '4B', '제대로', 'je-dae-ro', 'Một cách đúng đắn, đàng hoàng, nghiêm túc', 'Phó từ', '제대로 해야 해요.', 'Phải làm một cách đúng đắn.');

-- ── Grammar 1 ──────────────────────────────────────────────────────────────
WITH g1 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L14', '4B',
    '~(으)ㄹ 만하다 (Đáng để..., xứng đáng...)',
    'B2+',
    'Động từ + (으)ㄹ 만하다 = đáng để..., có giá trị để... Diễn đạt sự đánh giá tích cực hoặc xứng đáng.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g1, (VALUES
  ('한번 가 볼 만한 곳이에요.', 'Là nơi đáng để thử đến một lần.'),
  ('자격증을 딸 만해요.', 'Đáng để lấy chứng chỉ đó.'),
  ('읽을 만한 책이에요.', 'Là cuốn sách đáng đọc.')
) AS ex(korean, vietnamese);

-- ── Grammar 2 ──────────────────────────────────────────────────────────────
WITH g2 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L14', '4B',
    '~다 보면 (Nếu cứ tiếp tục... thì sẽ...)',
    'B2+',
    'Động từ + 다 보면 = nếu cứ tiếp tục làm... thì sẽ... Diễn đạt kết quả tự nhiên từ việc lặp đi lặp lại.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g2, (VALUES
  ('계속 노력하다 보면 성공할 거예요.', 'Nếu cứ tiếp tục cố gắng thì sẽ thành công.'),
  ('지식을 쌓다 보면 전문가가 돼요.', 'Nếu cứ tích lũy kiến thức thì sẽ trở thành chuyên gia.'),
  ('부담이 늘다 보면 결국 지치게 돼요.', 'Nếu cứ gánh nặng tăng lên thì cuối cùng sẽ kiệt sức.')
) AS ex(korean, vietnamese);

-- ── Grammar 3 ──────────────────────────────────────────────────────────────
WITH g3 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L14', '4B',
    '~기는 하지만 (Tuy... nhưng...)',
    'B2+',
    'Động từ + 기는 하지만 = tuy... nhưng... Thừa nhận một điều nhưng đưa ra ý kiến trái chiều.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g3, (VALUES
  ('현실이기는 하지만 받아들이기 어려워요.', 'Tuy là thực tế nhưng khó chấp nhận.'),
  ('만만치 않기는 하지만 포기할 수 없어요.', 'Tuy không dễ dàng nhưng không thể bỏ cuộc.'),
  ('이상적이기는 하지만 현실과 달라요.', 'Tuy là lý tưởng nhưng khác với thực tế.')
) AS ex(korean, vietnamese);

-- ── Dialogue ───────────────────────────────────────────────────────────────
INSERT INTO seoul_dialogue (lesson_id, book_id, speaker, text, translation)
VALUES
  ('4B-L14', '4B', '지훈', '요즘 부모님을 요양병원에 모시는 경우가 상당수 늘고 있대요.', 'Nghe nói dạo này trường hợp đưa bố mẹ vào viện dưỡng lão ngày càng tăng đáng kể.'),
  ('4B-L14', '4B', '소연', '맞아요. 인건비도 만만치 않고 바쁜 현실을 반영하는 것 같아요.', 'Đúng vậy. Chi phí nhân công không đơn giản và có vẻ phản ánh thực tế bận rộn.'),
  ('4B-L14', '4B', '지훈', '그래도 웃어른을 공경하는 전통을 지키는 게 이상적이기는 하지만 쉽지 않죠.', 'Dù vậy, tuy giữ gìn truyền thống kính trọng bề trên là lý tưởng nhưng không dễ.'),
  ('4B-L14', '4B', '소연', '부담이 늘다 보면 결국 이런 선택을 하게 되는 것 같아요.', 'Nếu cứ gánh nặng tăng lên thì cuối cùng có vẻ sẽ đưa ra lựa chọn này.'),
  ('4B-L14', '4B', '지훈', '전통과 현대가 조화를 이룰 수 있는 방법을 찾아야 할 것 같아요.', 'Có lẽ cần tìm cách để truyền thống và hiện đại hòa hợp với nhau.');

COMMIT;
