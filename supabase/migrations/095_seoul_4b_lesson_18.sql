-- Seoul 4B Lesson 18: 흥부와 놀부 (Heungbu và Nolbu)
-- Generated from src/mocks/data/seoul-books-data.ts

BEGIN;

-- ── Clean up existing data for 4B-L18 ─────────────────────────────────────
DELETE FROM seoul_dialogue WHERE lesson_id = '4B-L18';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4B-L18');
DELETE FROM seoul_grammar WHERE lesson_id = '4B-L18';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4B-L18';

-- ── Upsert lesson ──────────────────────────────────────────────────────────
INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES (
  '4B-L18', '4B', 18,
  '흥부와 놀부',
  'Heungbu và Nolbu',
  ARRAY['Đọc và kể lại câu chuyện cổ tích Hàn Quốc 흥부전', 'Học từ vựng miêu tả âm thanh, hành động trong truyện kể', 'Dùng ~았/었다가, ~(으)려던 참이다 để kể chuyện theo trình tự']::text[],
  '흥부전 이야기 (Câu chuyện Heungbu)',
  '흥부전 (Heungbu-jeon) là một trong những truyện cổ tích nổi tiếng nhất Hàn Quốc, thuộc thể loại 판소리 (pansori — hình thức ca kịch truyền thống). Câu chuyện tương tự truyện Cây tre trăm đốt của Việt Nam về chủ đề thiện thắng ác. 제비 (chim én) được coi là điềm lành trong văn hóa Hàn — nếu chim én làm tổ trong nhà thì gia đình sẽ may mắn.'
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
  ('4B-L18', '4B', '제비', 'je-bi', 'Chim én', 'Danh từ', '제비가 돌아왔어요.', 'Chim én đã trở về.'),
  ('4B-L18', '4B', '박', 'bak', 'Quả bầu tròn', 'Danh từ', '박이 열렸어요.', 'Quả bầu đã được mở ra.'),
  ('4B-L18', '4B', '톱', 'top', 'Cái cưa', 'Danh từ', '톱으로 박을 잘랐어요.', 'Đã cưa quả bầu bằng cái cưa.'),
  ('4B-L18', '4B', '보물', 'bo-mul', 'Bảo vật, châu báu', 'Danh từ', '박에서 보물이 나왔어요.', 'Bảo vật chui ra từ quả bầu.'),
  ('4B-L18', '4B', '도깨비', 'do-kkae-bi', 'Yêu tinh, quỷ Dokkaebi', 'Danh từ', '도깨비가 나타났어요.', 'Yêu tinh xuất hiện.'),
  ('4B-L18', '4B', '내쫓다', 'nae-jjot-da', 'Đuổi ra ngoài, tống cổ', 'Động từ', '동생을 내쫓았어요.', 'Đã đuổi em ra ngoài.'),
  ('4B-L18', '4B', '쏟아지다', 'sso-ta-ji-da', 'Tuôn ra, đổ ra ào ào', 'Động từ', '보물이 쏟아졌어요.', 'Báu vật tuôn ra ào ào.'),
  ('4B-L18', '4B', '묶다', 'muk-da', 'Cột, buộc, bó lại', 'Động từ', '헝겊으로 묶었어요.', 'Đã buộc bằng mảnh vải.'),
  ('4B-L18', '4B', '부러뜨리다', 'bu-reo-tteu-ri-da', 'Bẻ gãy, làm gãy', 'Động từ', '다리를 부러뜨렸어요.', 'Đã bẻ gãy chân.'),
  ('4B-L18', '4B', '열리다', 'yeol-li-da', 'Được mở ra, mở (quả bầu)', 'Động từ', '박이 열렸어요.', 'Quả bầu đã được mở ra.'),
  ('4B-L18', '4B', '터덜터덜', 'teo-dal-teo-dal', 'Lê bước nặng nề, bước đi mệt mỏi', 'Phó từ', '터덜터덜 걸어갔어요.', 'Đã lê bước nặng nề mà đi.'),
  ('4B-L18', '4B', '훨훨', 'hwol-hwol', 'Phơi phới, bay lượn nhẹ nhàng', 'Phó từ', '새가 훨훨 날아갔어요.', 'Con chim bay đi phơi phới.'),
  ('4B-L18', '4B', '빙빙', 'bing-bing', 'Quay vòng vòng, xoay tròn', 'Phó từ', '빙빙 돌았어요.', 'Đã quay vòng vòng.'),
  ('4B-L18', '4B', '주렁주렁', 'ju-reong-ju-reong', 'Lủng lẳng, trĩu trịt (trái cây)', 'Phó từ', '과일이 주렁주렁 달렸어요.', 'Trái cây trĩu trịt trên cành.'),
  ('4B-L18', '4B', '슬근슬근', 'seul-geun-seul-geun', 'Chầm chậm, từ từ nhẹ nhàng', 'Phó từ', '슬근슬근 톱질했어요.', 'Đã cưa từ từ nhẹ nhàng.'),
  ('4B-L18', '4B', '굽실거리다', 'gup-sil-geo-ri-da', 'Khúm núm cúi chào, luồn cúi', 'Động từ', '굽실거리며 인사했어요.', 'Đã khúm núm cúi chào.'),
  ('4B-L18', '4B', '빗자루', 'bit-ja-ru', 'Cái chổi', 'Danh từ', '빗자루로 쓸었어요.', 'Đã quét bằng chổi.'),
  ('4B-L18', '4B', '밥주걱', 'bap-ju-geok', 'Vá/muỗng xúc cơm', 'Danh từ', '밥주걱으로 밥을 펐어요.', 'Đã xúc cơm bằng vá.'),
  ('4B-L18', '4B', '형수님', 'hyeong-su-nim', 'Chị dâu (vợ của anh trai)', 'Danh từ', '형수님께 인사했어요.', 'Đã chào chị dâu.'),
  ('4B-L18', '4B', '처마', 'cheo-ma', 'Mái hiên, đầu mái nhà', 'Danh từ', '처마 밑에 제비가 있어요.', 'Có chim én dưới mái hiên.'),
  ('4B-L18', '4B', '지붕', 'ji-bung', 'Mái nhà', 'Danh từ', '지붕 위에 눈이 쌓였어요.', 'Tuyết đọng trên mái nhà.'),
  ('4B-L18', '4B', '다급하다', 'da-geu-pa-da', 'Gấp gáp, khẩn cấp', 'Tính từ', '상황이 다급해요.', 'Tình huống rất gấp gáp.'),
  ('4B-L18', '4B', '물다', 'mul-da', 'Ngoạm, cắn, ngậm', 'Động từ', '제비가 씨앗을 물었어요.', 'Chim én ngậm hạt giống.'),
  ('4B-L18', '4B', '심다', 'sim-da', 'Trồng (cây, hạt)', 'Động từ', '씨앗을 심었어요.', 'Đã trồng hạt giống.'),
  ('4B-L18', '4B', '정성스럽다', 'jeong-seong-seu-reop-da', 'Tận tâm, chu đáo, hết lòng', 'Tính từ', '정성스럽게 돌봤어요.', 'Đã chăm sóc tận tâm.'),
  ('4B-L18', '4B', '싹', 'ssak', 'Chồi non, mầm cây', 'Danh từ', '싹이 텄어요.', 'Mầm cây đã nảy.'),
  ('4B-L18', '4B', '통', 'tong', 'Thùng, bình, vật chứa hình trụ', 'Danh từ', '큰 통에 담았어요.', 'Đã đựng vào thùng lớn.'),
  ('4B-L18', '4B', '비단', 'bi-dan', 'Lụa, vải lụa', 'Danh từ', '비단 옷을 입었어요.', 'Mặc áo lụa.'),
  ('4B-L18', '4B', '한걸음에', 'han-geo-reu-me', 'Một mạch, một bước không dừng', 'Phó từ', '한걸음에 달려왔어요.', 'Đã chạy đến một mạch.'),
  ('4B-L18', '4B', '흥분하다', 'heung-bun-ha-da', 'Hứng khởi, kích động', 'Động từ', '너무 흥분했어요.', 'Đã quá kích động.'),
  ('4B-L18', '4B', '뻔뻔하다', 'bbeon-bbeon-ha-da', 'Trơ tráo, mặt dày', 'Tính từ', '뻔뻔한 행동이에요.', 'Là hành động trơ tráo.'),
  ('4B-L18', '4B', '떠들다', 'tteo-deul-da', 'Ồn ào, la hét om sòm', 'Động từ', '떠들지 마세요.', 'Đừng ồn ào.'),
  ('4B-L18', '4B', '짜증이 나다', 'jja-jeung-i na-da', 'Bực bội, cáu kỉnh', 'Cụm động từ', '짜증이 났어요.', 'Đã thấy bực bội.'),
  ('4B-L18', '4B', '추첨', 'chu-cheom', 'Rút thăm, bốc thăm', 'Danh từ', '추첨으로 뽑았어요.', 'Đã chọn bằng rút thăm.'),
  ('4B-L18', '4B', '상품권', 'sang-pum-gwon', 'Phiếu mua hàng, voucher', 'Danh từ', '상품권을 받았어요.', 'Đã nhận phiếu mua hàng.'),
  ('4B-L18', '4B', '마음씨가 고약하다', 'ma-eum-ssi-ga go-ya-ka-da', 'Lòng dạ xấu xa, tính tình độc ác', 'Cụm tính từ', '마음씨가 고약한 사람이에요.', 'Là người lòng dạ xấu xa.'),
  ('4B-L18', '4B', '차지하다', 'cha-ji-ha-da', 'Chiếm hữu, sở hữu', 'Động từ', '재산을 차지했어요.', 'Đã chiếm hữu tài sản.'),
  ('4B-L18', '4B', '온갖', 'on-gat', 'Đủ mọi loại, tất cả các thứ', 'Tính từ', '온갖 보물이 나왔어요.', 'Đủ mọi loại bảo vật chui ra.'),
  ('4B-L18', '4B', '마당을 쓸다', 'ma-dang-eul sseul-da', 'Quét sân', 'Cụm động từ', '마당을 쓸었어요.', 'Đã quét sân.'),
  ('4B-L18', '4B', '형님', 'hyeong-nim', 'Anh (trai, kính trọng)', 'Danh từ', '형님께 부탁했어요.', 'Đã nhờ anh.'),
  ('4B-L18', '4B', '오두막집', 'o-du-mak-jjip', 'Túp lều, nhà tranh nhỏ', 'Danh từ', '오두막집에서 살았어요.', 'Đã sống trong túp lều.'),
  ('4B-L18', '4B', '자루', 'ja-ru', 'Cái bao, túi đựng', 'Danh từ', '자루에 담았어요.', 'Đã đựng vào bao.'),
  ('4B-L18', '4B', '뜨끈뜨끈하다', 'tteu-geun-tteu-geun-ha-da', 'Nóng ấm, ấm nóng', 'Tính từ', '뜨끈뜨끈한 밥이에요.', 'Là cơm nóng ấm.'),
  ('4B-L18', '4B', '버럭', 'beo-raek', 'Đùng đùng, bùng nổ (tức giận)', 'Phó từ', '버럭 화를 냈어요.', 'Đã nổi giận đùng đùng.');

-- ── Grammar 1 ──────────────────────────────────────────────────────────────
WITH g1 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L18', '4B',
    '~았/었다가 (Đã... rồi lại...)',
    'B2+',
    'Động từ + 았/었다가 = đã làm rồi lại... Diễn đạt hành động trước bị đảo ngược hoặc chuyển sang hành động khác.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g1, (VALUES
  ('제비가 날아갔다가 다시 돌아왔어요.', 'Chim én đã bay đi rồi lại quay về.'),
  ('박이 열렸다가 다시 닫혔어요.', 'Quả bầu đã mở ra rồi lại đóng lại.'),
  ('보물이 나왔다가 사라졌어요.', 'Bảo vật đã xuất hiện rồi lại biến mất.')
) AS ex(korean, vietnamese);

-- ── Grammar 2 ──────────────────────────────────────────────────────────────
WITH g2 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L18', '4B',
    '~(으)려던 참이다 (Vừa định..., đang định...)',
    'B2+',
    'Động từ + (으)려던 참이다 = vừa đang định làm... đúng lúc đó. Diễn đạt thời điểm vừa đúng lúc có dự định làm gì đó.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g2, (VALUES
  ('박을 열려던 참이었어요.', 'Vừa đúng lúc đang định mở quả bầu.'),
  ('제비를 돌려보내려던 참이었어요.', 'Vừa đang định thả chim én đi.')
) AS ex(korean, vietnamese);

-- ── Grammar 3 ──────────────────────────────────────────────────────────────
WITH g3 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L18', '4B',
    '~(으)ㄴ/는 척하다 (Giả vờ..., làm bộ...)',
    'B2+',
    'Động từ + (으)ㄴ/는 척하다 = giả vờ..., làm bộ... Diễn đạt hành động giả tạo hoặc không thành thật.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g3, (VALUES
  ('놀부는 가난한 척했어요.', 'Nolbu giả vờ nghèo.'),
  ('모르는 척했어요.', 'Đã giả vờ không biết.')
) AS ex(korean, vietnamese);

-- ── Dialogue ───────────────────────────────────────────────────────────────
INSERT INTO seoul_dialogue (lesson_id, book_id, speaker, text, translation)
VALUES
  ('4B-L18', '4B', '선생님', '흥부전은 착한 사람은 복을 받고 욕심 많은 사람은 벌을 받는다는 교훈을 담고 있어요.', 'Truyện Heungbu mang bài học rằng người tốt bụng thì được phúc, người tham lam thì bị trừng phạt.'),
  ('4B-L18', '4B', '민수', '흥부가 다리 다친 제비를 정성스럽게 치료해 주자 제비가 박씨를 물고 왔군요.', 'Heungbu tận tâm chữa trị chim én bị gãy chân nên chim én đã ngậm hạt bầu mang đến.'),
  ('4B-L18', '4B', '선생님', '맞아요. 박이 열리자 온갖 보물이 쏟아졌어요. 놀부는 이것을 보고 훨훨 날던 제비의 다리를 일부러 부러뜨렸죠.', 'Đúng vậy. Khi quả bầu mở ra, đủ mọi loại bảo vật tuôn ra. Nolbu thấy vậy liền cố tình bẻ gãy chân chim én đang bay phơi phới.'),
  ('4B-L18', '4B', '민수', '마음씨가 고약한 놀부의 박에서는 도깨비가 나왔군요.', 'Vậy là từ quả bầu của Nolbu lòng dạ xấu xa thì yêu tinh chui ra.'),
  ('4B-L18', '4B', '선생님', '이 이야기는 형제간의 우애와 선악의 인과응보를 가르쳐 줘요.', 'Câu chuyện này dạy về tình anh em và nhân quả thiện ác.');

COMMIT;
