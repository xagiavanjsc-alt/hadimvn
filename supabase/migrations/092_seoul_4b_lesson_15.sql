-- Seoul 4B Lesson 15: 동물과 식물 (Động vật và thực vật)
-- Generated from src/mocks/data/seoul-books-data.ts

BEGIN;

-- ── Clean up existing data for 4B-L15 ─────────────────────────────────────
DELETE FROM seoul_dialogue WHERE lesson_id = '4B-L15';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4B-L15');
DELETE FROM seoul_grammar WHERE lesson_id = '4B-L15';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4B-L15';

-- ── Upsert lesson ──────────────────────────────────────────────────────────
INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES (
  '4B-L15', '4B', 15,
  '동물과 식물',
  'Động vật và thực vật',
  ARRAY['Thảo luận về động vật cưng, động vật hoang dã và thực vật', 'Học từ vựng về đặc điểm, hành vi của động vật và cảm xúc khi nuôi thú', 'Dùng ~(으)ㄹ 뿐만 아니라, ~는 반면에 để so sánh và bổ sung thông tin']::text[],
  '반려동물에 대한 이야기 (Câu chuyện về thú cưng)',
  'Ở Hàn Quốc, nuôi thú cưng (반려동물) đang ngày càng phổ biến — ước tính hơn 30% hộ gia đình nuôi thú. 진돗개 (chó Jindo) là giống chó thuần chủng từ đảo Jindo, được công nhận là 천연기념물 (cổ vật tự nhiên) số 53. Hàn Quốc cũng có phong trào bảo vệ động vật mạnh mẽ, với luật cấm ngược đãi súc vật được siết chặt từ năm 2021.'
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
  ('4B-L15', '4B', '번식하다', 'beon-si-ka-da', 'Sinh sôi nảy nở, phồn thực', 'Động từ', '동물이 번식해요.', 'Động vật sinh sôi nảy nở.'),
  ('4B-L15', '4B', '진화하다', 'ji-nwa-ha-da', 'Tiến hóa', 'Động từ', '생물이 진화해요.', 'Sinh vật tiến hóa.'),
  ('4B-L15', '4B', '멸종되다', 'myeol-jong-doe-da', 'Bị tuyệt chủng', 'Động từ', '공룡이 멸종됐어요.', 'Khủng long đã bị tuyệt chủng.'),
  ('4B-L15', '4B', '훈련시키다', 'hul-lyeon-si-ki-da', 'Huấn luyện, đào tạo', 'Động từ', '개를 훈련시켰어요.', 'Đã huấn luyện con chó.'),
  ('4B-L15', '4B', '학대하다', 'hak-dae-ha-da', 'Ngược đãi, bạo hành', 'Động từ', '동물을 학대하면 안 돼요.', 'Không được ngược đãi động vật.'),
  ('4B-L15', '4B', '외로움을 달래다', 'oe-ro-u-meul dal-lae-da', 'An ủi, xoa dịu nỗi cô đơn', 'Cụm động từ', '반려동물이 외로움을 달래 줘요.', 'Thú cưng xoa dịu nỗi cô đơn.'),
  ('4B-L15', '4B', '번거롭다', 'beon-geo-rop-da', 'Phiền phức, rắc rối', 'Tính từ', '물 주기가 번거로워요.', 'Việc tưới nước thật phiền phức.'),
  ('4B-L15', '4B', '정서적으로 안정되다', 'jeong-seo-jeo-geu-ro an-jeong-doe-da', 'Ổn định về mặt tình cảm', 'Cụm động từ', '반려동물이 있으면 정서적으로 안정돼요.', 'Có thú cưng thì ổn định về mặt tình cảm.'),
  ('4B-L15', '4B', '지저분해지다', 'ji-jeo-bun-hae-ji-da', 'Trở nên bẩn thỉu, lộn xộn', 'Động từ', '집이 지저분해졌어요.', 'Nhà đã trở nên bẩn thỉu.'),
  ('4B-L15', '4B', '관리가 힘들다', 'gwal-li-ga him-deul-da', 'Khó quản lý, khó chăm sóc', 'Cụm tính từ', '관리가 힘들어요.', 'Việc quản lý thật khó khăn.'),
  ('4B-L15', '4B', '경쟁심', 'gyeong-jaeng-sim', 'Lòng ganh đua, tinh thần cạnh tranh', 'Danh từ', '경쟁심이 강해요.', 'Tinh thần cạnh tranh mạnh.'),
  ('4B-L15', '4B', '동정심', 'dong-jeong-sim', 'Lòng đồng cảm, lòng trắc ẩn', 'Danh từ', '동정심이 생겼어요.', 'Lòng trắc ẩn nảy sinh.'),
  ('4B-L15', '4B', '짖다', 'jit-da', 'Sủa (chó), cất tiếng sủa', 'Động từ', '개가 짖어요.', 'Con chó đang sủa.'),
  ('4B-L15', '4B', '화초', 'hwa-cho', 'Cây cảnh, hoa cỏ', 'Danh từ', '화초를 키워요.', 'Trồng cây cảnh.'),
  ('4B-L15', '4B', '앵무새', 'aeng-mu-sae', 'Con vẹt', 'Danh từ', '앵무새가 말해요.', 'Con vẹt nói chuyện.'),
  ('4B-L15', '4B', '먹이', 'meo-gi', 'Thức ăn (cho thú)', 'Danh từ', '먹이를 줬어요.', 'Đã cho ăn.'),
  ('4B-L15', '4B', '챙겨 주다', 'chaeng-gyeo ju-da', 'Chăm lo, sắp xếp cho ai đó', 'Cụm động từ', '먹이를 챙겨 줬어요.', 'Đã chăm lo thức ăn cho chúng.'),
  ('4B-L15', '4B', '베란다', 'be-ran-da', 'Ban công, hành lang', 'Danh từ', '베란다에서 화초를 키워요.', 'Trồng cây cảnh ở ban công.'),
  ('4B-L15', '4B', '무궁화', 'mu-gung-hwa', 'Hoa vô cùng hoa (quốc hoa Hàn Quốc)', 'Danh từ', '무궁화는 한국의 국화예요.', 'Hoa vô cùng là quốc hoa của Hàn Quốc.'),
  ('4B-L15', '4B', '국화', 'guk-hwa', 'Quốc hoa, hoa cúc', 'Danh từ', '국화가 피었어요.', 'Hoa cúc đã nở.'),
  ('4B-L15', '4B', '자식', 'ja-sik', 'Con cái', 'Danh từ', '자식이 둘이에요.', 'Có hai người con.'),
  ('4B-L15', '4B', '노약자', 'no-yak-ja', 'Người già yếu, người cao tuổi và người yếu', 'Danh từ', '노약자를 배려해요.', 'Quan tâm đến người già yếu.'),
  ('4B-L15', '4B', '인내심', 'in-nae-sim', 'Lòng nhẫn nại, kiên trì', 'Danh từ', '인내심이 필요해요.', 'Cần có lòng nhẫn nại.'),
  ('4B-L15', '4B', '애국심', 'ae-guk-sim', 'Lòng yêu nước', 'Danh từ', '애국심이 강해요.', 'Lòng yêu nước mạnh mẽ.'),
  ('4B-L15', '4B', '호기심', 'ho-gi-sim', 'Lòng hiếu kỳ, tính tò mò', 'Danh từ', '호기심이 많아요.', 'Rất tò mò.'),
  ('4B-L15', '4B', '불경기', 'bul-gyeong-gi', 'Thời kỳ khủng hoảng kinh tế, suy thoái', 'Danh từ', '불경기라 힘들어요.', 'Khó khăn vì thời kỳ suy thoái kinh tế.'),
  ('4B-L15', '4B', '유령', 'yu-ryeong', 'Ma, linh hồn ma', 'Danh từ', '유령이 나타났어요.', 'Con ma xuất hiện.'),
  ('4B-L15', '4B', '애완동물', 'ae-wan-dong-mul', 'Thú cưng', 'Danh từ', '애완동물을 키워요.', 'Nuôi thú cưng.'),
  ('4B-L15', '4B', '맞아주다', 'ma-ja-ju-da', 'Đón tiếp, ra đón', 'Động từ', '반갑게 맞아줬어요.', 'Đã ra đón một cách vui mừng.'),
  ('4B-L15', '4B', '배설물', 'bae-seol-mul', 'Chất thải (phân, nước tiểu)', 'Danh từ', '배설물을 치워요.', 'Dọn chất thải.'),
  ('4B-L15', '4B', '국회', 'guk-hoe', 'Quốc hội', 'Danh từ', '국회에서 법을 만들어요.', 'Quốc hội làm luật.'),
  ('4B-L15', '4B', '진돗개', 'jin-dot-gae', 'Chó Jindo (giống chó thuần chủng Hàn Quốc)', 'Danh từ', '진돗개는 충성스러워요.', 'Chó Jindo rất trung thành.'),
  ('4B-L15', '4B', '원산지', 'won-san-ji', 'Nơi xuất xứ, nguồn gốc', 'Danh từ', '원산지가 어디예요?', 'Nơi xuất xứ là đâu?'),
  ('4B-L15', '4B', '황색', 'hwang-saek', 'Màu vàng', 'Danh từ', '황색 꽃이에요.', 'Là bông hoa màu vàng.'),
  ('4B-L15', '4B', '대담하다', 'dae-dam-ha-da', 'Gan dạ, dũng cảm, táo bạo', 'Tính từ', '대담한 행동이에요.', 'Là hành động táo bạo.'),
  ('4B-L15', '4B', '용감하다', 'yong-gam-ha-da', 'Dũng cảm, can đảm', 'Tính từ', '용감한 개예요.', 'Là con chó dũng cảm.'),
  ('4B-L15', '4B', '집을 지키다', 'ji-beul ji-ki-da', 'Trông giữ nhà, canh nhà', 'Cụm động từ', '개가 집을 지켜요.', 'Con chó trông giữ nhà.'),
  ('4B-L15', '4B', '애완견', 'ae-wan-gyeon', 'Chó cưng, cún yêu', 'Danh từ', '애완견을 데리고 산책해요.', 'Dắt chó cưng đi dạo.'),
  ('4B-L15', '4B', '고통을 주다', 'go-tong-eul ju-da', 'Gây đau khổ, làm người khác đau', 'Cụm động từ', '동물에게 고통을 주면 안 돼요.', 'Không được gây đau khổ cho động vật.'),
  ('4B-L15', '4B', '장식등', 'jang-sik-deung', 'Đèn trang trí', 'Danh từ', '장식등이 아름다워요.', 'Đèn trang trí rất đẹp.'),
  ('4B-L15', '4B', '타조', 'ta-jo', 'Con đà điểu', 'Danh từ', '타조는 날지 못해요.', 'Con đà điểu không biết bay.'),
  ('4B-L15', '4B', '도도새', 'do-do-sae', 'Chim Dodo (đã tuyệt chủng)', 'Danh từ', '도도새는 멸종됐어요.', 'Chim Dodo đã bị tuyệt chủng.'),
  ('4B-L15', '4B', '인도양', 'in-do-yang', 'Ấn Độ Dương', 'Danh từ', '인도양에 있는 섬이에요.', 'Là hòn đảo ở Ấn Độ Dương.'),
  ('4B-L15', '4B', '모리셔스', 'mo-ri-syeo-seu', 'Mauritius', 'Danh từ', '모리셔스는 인도양의 섬나라예요.', 'Mauritius là đảo quốc ở Ấn Độ Dương.'),
  ('4B-L15', '4B', '임산부', 'im-san-bu', 'Phụ nữ mang thai, bà bầu', 'Danh từ', '임산부는 건강을 챙겨야 해요.', 'Bà bầu phải chú ý sức khỏe.'),
  ('4B-L15', '4B', '명예롭다', 'myeong-ye-rop-da', 'Danh dự, vẻ vang', 'Tính từ', '명예로운 일이에요.', 'Là việc đáng danh dự.'),
  ('4B-L15', '4B', '훈장', 'hun-jang', 'Huân chương', 'Danh từ', '훈장을 받았어요.', 'Đã nhận huân chương.'),
  ('4B-L15', '4B', '발휘하다', 'bal-hwi-ha-da', 'Phát huy, thể hiện', 'Động từ', '능력을 발휘했어요.', 'Đã phát huy năng lực.'),
  ('4B-L15', '4B', '충성심', 'chung-seong-sim', 'Lòng trung thành', 'Danh từ', '충성심이 강해요.', 'Lòng trung thành mạnh mẽ.'),
  ('4B-L15', '4B', '줄기', 'jul-gi', 'Thân cây, cành', 'Danh từ', '장미 줄기에 가시가 있어요.', 'Thân cây hoa hồng có gai.'),
  ('4B-L15', '4B', '다홍색', 'da-hong-saek', 'Màu đỏ thắm, đỏ tươi', 'Danh từ', '다홍색 꽃이에요.', 'Là bông hoa màu đỏ thắm.'),
  ('4B-L15', '4B', '밥상', 'bap-sang', 'Mâm cơm', 'Danh từ', '밥상을 차렸어요.', 'Đã dọn mâm cơm.'),
  ('4B-L15', '4B', '닭장', 'dak-jang', 'Chuồng gà', 'Danh từ', '닭장에 닭이 많아요.', 'Chuồng gà có nhiều gà.'),
  ('4B-L15', '4B', '갇히다', 'ga-chi-da', 'Bị nhốt, bị giam cầm', 'Động từ', '새장에 갇혔어요.', 'Bị nhốt trong lồng.'),
  ('4B-L15', '4B', '알을 낳다', 'a-reul na-ta', 'Đẻ trứng', 'Cụm động từ', '닭이 알을 낳았어요.', 'Con gà đã đẻ trứng.'),
  ('4B-L15', '4B', '병아리', 'byeong-a-ri', 'Gà con', 'Danh từ', '병아리가 귀여워요.', 'Con gà con thật dễ thương.'),
  ('4B-L15', '4B', '시각 장애인', 'si-gak jang-ae-in', 'Người khiếm thị, người mù', 'Danh từ', '시각 장애인을 도와요.', 'Giúp đỡ người khiếm thị.'),
  ('4B-L15', '4B', '맹인 안내견', 'maeng-in an-nae-gyeon', 'Chó dẫn đường cho người mù', 'Danh từ', '맹인 안내견이 길을 안내해요.', 'Chó dẫn đường hướng dẫn đường đi.'),
  ('4B-L15', '4B', '평생', 'pyeong-saeng', 'Cả đời, suốt đời', 'Danh từ', '평생 함께해요.', 'Cùng nhau suốt đời.'),
  ('4B-L15', '4B', '본능', 'bon-neung', 'Bản năng', 'Danh từ', '동물의 본능이에요.', 'Là bản năng của động vật.'),
  ('4B-L15', '4B', '차츰', 'cha-cheum', 'Dần dần, từ từ', 'Phó từ', '차츰 나아지고 있어요.', 'Đang dần dần khá hơn.'),
  ('4B-L15', '4B', '위협하다', 'wi-hyeo-pa-da', 'Đe dọa, uy hiếp', 'Động từ', '생존을 위협해요.', 'Đe dọa sự sinh tồn.'),
  ('4B-L15', '4B', '비행능력', 'bi-haeng-neung-nyeok', 'Năng lực bay, khả năng bay', 'Danh từ', '비행능력을 잃었어요.', 'Đã mất khả năng bay.');

-- ── Grammar 1 ──────────────────────────────────────────────────────────────
WITH g1 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L15', '4B',
    '~(으)ㄹ 뿐만 아니라 (Không chỉ... mà còn...)',
    'B2+',
    'Động từ/Tính từ + (으)ㄹ 뿐만 아니라 = không chỉ... mà còn... Bổ sung thêm thông tin liên quan.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g1, (VALUES
  ('반려동물은 외로움을 달래 줄 뿐만 아니라 정서적으로 안정시켜 줘요.', 'Thú cưng không chỉ xoa dịu nỗi cô đơn mà còn giúp ổn định tình cảm.'),
  ('진돗개는 대담할 뿐만 아니라 충성심도 강해요.', 'Chó Jindo không chỉ táo bạo mà còn rất trung thành.'),
  ('학대는 고통을 줄 뿐만 아니라 동물의 본능도 망가뜨려요.', 'Bạo hành không chỉ gây đau khổ mà còn phá hủy bản năng của động vật.')
) AS ex(korean, vietnamese);

-- ── Grammar 2 ──────────────────────────────────────────────────────────────
WITH g2 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L15', '4B',
    '~는 반면에 (Trong khi... thì... ngược lại...)',
    'B2+',
    'Động từ/Tính từ + 는 반면에 = trong khi... thì... ngược lại. Diễn đạt sự tương phản giữa hai đặc điểm.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g2, (VALUES
  ('개는 집을 잘 지키는 반면에 관리가 힘들어요.', 'Chó trông nhà tốt trong khi đó việc quản lý lại khó.'),
  ('화초는 정서적으로 안정되게 해 주는 반면에 물 주기가 번거로워요.', 'Cây cảnh giúp ổn định tình cảm trong khi đó việc tưới nước lại phiền phức.')
) AS ex(korean, vietnamese);

-- ── Grammar 3 ──────────────────────────────────────────────────────────────
WITH g3 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L15', '4B',
    '~아/어도 되다 (Có thể... cũng được, được phép...)',
    'B2+',
    'Động từ + 아/어도 되다 = có thể... cũng được, được phép làm... Cho phép hoặc chấp nhận một hành động.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g3, (VALUES
  ('화초는 베란다에 두어도 돼요.', 'Cây cảnh để ở ban công cũng được.'),
  ('먹이는 하루에 한 번만 줘도 돼요.', 'Thức ăn chỉ cần cho một lần một ngày cũng được.')
) AS ex(korean, vietnamese);

-- ── Dialogue ───────────────────────────────────────────────────────────────
INSERT INTO seoul_dialogue (lesson_id, book_id, speaker, text, translation)
VALUES
  ('4B-L15', '4B', '유나', '저 요즘 강아지를 키우기 시작했어요. 외로움을 달래 주고 정서적으로 안정이 돼요.', 'Dạo này tôi bắt đầu nuôi chó con. Nó xoa dịu nỗi cô đơn và giúp tôi ổn định tình cảm.'),
  ('4B-L15', '4B', '준호', '좋겠어요. 하지만 관리가 힘들지 않아요? 배설물도 치워야 하고 먹이도 챙겨 줘야 하잖아요.', 'Hay đấy. Nhưng việc quản lý không khó sao? Phải dọn chất thải và chăm lo thức ăn nữa mà.'),
  ('4B-L15', '4B', '유나', '맞아요. 집이 지저분해지는 반면에 집에 돌아올 때 반갑게 맞아줘서 기분이 좋아요.', 'Đúng vậy. Tuy nhà trở nên bẩn thỉu nhưng mỗi khi về nhà nó ra đón vui mừng nên cảm thấy rất vui.'),
  ('4B-L15', '4B', '준호', '진돗개는 대담할 뿐만 아니라 충성심도 강하다고 해요. 맹인 안내견으로도 활동하잖아요.', 'Nghe nói chó Jindo không chỉ táo bạo mà còn rất trung thành. Chúng còn làm chó dẫn đường cho người mù nữa.'),
  ('4B-L15', '4B', '유나', '그래요. 동물도 학대하지 말고 본능을 발휘할 수 있도록 사랑으로 훈련시켜야 해요.', 'Đúng vậy. Phải không ngược đãi động vật mà phải huấn luyện bằng tình yêu để chúng phát huy bản năng.');

COMMIT;
