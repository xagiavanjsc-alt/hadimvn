-- Seoul 4A Lesson 7: 옳고 그름 (Đúng và sai)
-- Generated from src/mocks/data/seoul-books-data.ts

BEGIN;

-- ── Clean up existing data for 4A-L7 ──────────────────────────────────────
DELETE FROM seoul_dialogue WHERE lesson_id = '4A-L7';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4A-L7');
DELETE FROM seoul_grammar WHERE lesson_id = '4A-L7';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4A-L7';

-- ── Upsert lesson ──────────────────────────────────────────────────────────
INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES (
  '4A-L7', '4A', 7,
  '옳고 그름',
  'Đúng và sai',
  ARRAY['Tranh luận về hành vi đúng/sai trong xã hội', 'Học từ vựng về đạo đức và nơi công cộng', 'Dùng ~는 게 맞다/그르다 và biểu đạt ý kiến']::text[],
  '공공예절 (Phép lịch sự nơi công cộng)',
  'Ở Hàn Quốc, 공중도덕 (đạo đức công cộng) được coi trọng. Trên phương tiện công cộng, người Hàn thường nhường ghế ưu tiên (교통약자 배려석) cho người già, phụ nữ mang thai và người khuyết tật. Trong thang máy và rạp chiếu phim, nói chuyện to hay ăn uống có mùi đều bị xem là thiếu lịch sự. Khi có vấn đề với hàng xóm, thường liên hệ 관리 사무소 trước khi nhờ đến pháp luật.'
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
  ('4A-L7', '4A', '의견', 'ui-gyeon', 'Ý kiến', 'Danh từ', '의견을 말해 주세요.', 'Hãy cho biết ý kiến.'),
  ('4A-L7', '4A', '행동', 'haeng-dong', 'Hành động', 'Danh từ', '행동으로 보여 주세요.', 'Hãy thể hiện bằng hành động.'),
  ('4A-L7', '4A', '질', 'jil', 'Chất lượng', 'Danh từ', '질이 좋아요.', 'Chất lượng tốt.'),
  ('4A-L7', '4A', '기대다', 'gi-dae-da', 'Dựa, nương tựa', 'Động từ', '벽에 기댔어요.', 'Đã dựa vào tường.'),
  ('4A-L7', '4A', '미래', 'mi-rae', 'Tương lai', 'Danh từ', '미래를 위해 준비해요.', 'Chuẩn bị cho tương lai.'),
  ('4A-L7', '4A', '공공장소', 'gong-gong-jang-so', 'Nơi công cộng', 'Danh từ', '공공장소에서 조용히 해요.', 'Hãy yên lặng ở nơi công cộng.'),
  ('4A-L7', '4A', '말도 안 되다', 'mal-do an doe-da', 'Vô lý, không phải chứ', 'Cụm động từ', '그건 말도 안 돼요.', 'Cái đó thật vô lý.'),
  ('4A-L7', '4A', '현실성이 없다', 'hyeon-sil-seong-i eop-da', 'Không có tính thực tế', 'Cụm tính từ', '그 계획은 현실성이 없어요.', 'Kế hoạch đó không có tính thực tế.'),
  ('4A-L7', '4A', '앞뒤가 안 맞다', 'ap-dwi-ga an mat-da', 'Trước sau mâu thuẫn, không nhất quán', 'Cụm tính từ', '그 말은 앞뒤가 안 맞아요.', 'Lời đó trước sau mâu thuẫn nhau.'),
  ('4A-L7', '4A', '문제가 안 되다', 'mun-je-ga an doe-da', 'Không thành vấn đề', 'Cụm động từ', '그건 문제가 안 돼요.', 'Cái đó không thành vấn đề.'),
  ('4A-L7', '4A', '배려를 하다', 'bae-ryeo-reul ha-da', 'Quan tâm, thể hiện sự quan tâm', 'Cụm động từ', '다른 사람을 배려해야 해요.', 'Cần quan tâm đến người khác.'),
  ('4A-L7', '4A', '양해를 구하다', 'yang-hae-reul gu-ha-da', 'Mong được thông cảm', 'Cụm động từ', '양해를 구하고 싶어요.', 'Tôi mong được thông cảm.'),
  ('4A-L7', '4A', '방해가 되다', 'bang-hae-ga doe-da', 'Phá đám, gây phiền nhiễu', 'Cụm động từ', '공부에 방해가 돼요.', 'Gây phiền nhiễu cho việc học.'),
  ('4A-L7', '4A', '불편을 주다', 'bul-pyeo-neul ju-da', 'Gây bất tiện', 'Cụm động từ', '다른 사람에게 불편을 주면 안 돼요.', 'Không được gây bất tiện cho người khác.'),
  ('4A-L7', '4A', '양심이 없다', 'yang-sim-i eop-da', 'Không có lương tâm', 'Cụm tính từ', '그 사람은 양심이 없어요.', 'Người đó không có lương tâm.'),
  ('4A-L7', '4A', '젓가락질', 'jeot-ga-rak-jil', 'Cầm đũa', 'Danh từ', '젓가락질이 어려워요.', 'Cầm đũa khó lắm.'),
  ('4A-L7', '4A', '망치질', 'mang-chi-jil', 'Dùng búa', 'Danh từ', '망치질 소리가 시끄러워요.', 'Tiếng dùng búa ồn ào.'),
  ('4A-L7', '4A', '도둑질', 'do-duk-jil', 'Trộm cắp', 'Danh từ', '도둑질은 나쁜 행동이에요.', 'Trộm cắp là hành động xấu.'),
  ('4A-L7', '4A', '손가락질', 'son-ga-rak-jil', 'Sự chỉ trỏ, dè bỉu', 'Danh từ', '남을 손가락질하면 안 돼요.', 'Không được chỉ trỏ dè bỉu người khác.'),
  ('4A-L7', '4A', '딸꾹질', 'ttal-kkuk-jil', 'Nấc cụt', 'Danh từ', '딸꾹질이 멈추지 않아요.', 'Nấc cụt không dừng.'),
  ('4A-L7', '4A', '금지하다', 'geum-ji-ha-da', 'Cấm', 'Động từ', '흡연을 금지해요.', 'Cấm hút thuốc.'),
  ('4A-L7', '4A', '훔치다', 'hum-chi-da', 'Ăn trộm', 'Động từ', '물건을 훔치면 안 돼요.', 'Không được ăn trộm đồ.'),
  ('4A-L7', '4A', '육체노동', 'yuk-che-no-dong', 'Lao động tay chân', 'Danh từ', '육체노동이 힘들어요.', 'Lao động tay chân vất vả.'),
  ('4A-L7', '4A', '정신노동', 'jeong-sin-no-dong', 'Lao động trí óc', 'Danh từ', '정신노동도 피곤해요.', 'Lao động trí óc cũng mệt mỏi.'),
  ('4A-L7', '4A', '진심', 'jin-sim', 'Chân thành, thật lòng', 'Danh từ', '진심으로 말하는 거예요.', 'Tôi nói thật lòng.'),
  ('4A-L7', '4A', '세대 차이', 'se-dae cha-i', 'Khoảng cách thế hệ', 'Danh từ', '세대 차이가 있어요.', 'Có khoảng cách thế hệ.'),
  ('4A-L7', '4A', '용기', 'yong-gi', 'Dũng khí', 'Danh từ', '용기를 내세요.', 'Hãy lấy dũng khí lên.'),
  ('4A-L7', '4A', '관계를 끊다', 'gwan-gye-reul kkeun-da', 'Cắt đứt quan hệ', 'Cụm động từ', '그 사람과 관계를 끊었어요.', 'Đã cắt đứt quan hệ với người đó.'),
  ('4A-L7', '4A', '음식물', 'eum-sik-mul', 'Đồ ăn, thức uống', 'Danh từ', '음식물 반입을 금지해요.', 'Cấm mang đồ ăn vào.'),
  ('4A-L7', '4A', '반입하다', 'ban-ip-ha-da', 'Mang vào (trong)', 'Động từ', '음식물을 반입하면 안 돼요.', 'Không được mang đồ ăn vào.'),
  ('4A-L7', '4A', '상영관', 'sang-yeong-gwan', 'Phòng chiếu phim', 'Danh từ', '상영관 안에서 조용히 해요.', 'Giữ yên lặng trong phòng chiếu phim.'),
  ('4A-L7', '4A', '냄새가 나다', 'naem-sae-ga na-da', 'Có mùi phát ra', 'Cụm động từ', '음식 냄새가 나요.', 'Có mùi đồ ăn.'),
  ('4A-L7', '4A', '옳다', 'ol-ta', 'Đúng đắn', 'Tính từ', '그 결정이 옳아요.', 'Quyết định đó đúng đắn.'),
  ('4A-L7', '4A', '그르다', 'geu-reu-da', 'Sai lầm, sai trái', 'Tính từ', '그 행동은 그릇돼요.', 'Hành động đó sai trái.'),
  ('4A-L7', '4A', '좌석', 'jwa-seok', 'Chỗ ngồi', 'Danh từ', '좌석을 예약했어요.', 'Đã đặt chỗ ngồi.'),
  ('4A-L7', '4A', '젖히다', 'jeo-chi-da', 'Ngả ra, đẩy ngửa ra', 'Động từ', '의자를 뒤로 젖혔어요.', 'Đã ngả ghế ra phía sau.'),
  ('4A-L7', '4A', '주민', 'ju-min', 'Cư dân', 'Danh từ', '주민들이 항의했어요.', 'Các cư dân đã phản đối.'),
  ('4A-L7', '4A', '관리 사무소', 'gwal-li sa-mu-so', 'Ban quản lý', 'Danh từ', '관리 사무소에 신고했어요.', 'Đã báo lên ban quản lý.'),
  ('4A-L7', '4A', '이웃집', 'i-ut-jip', 'Nhà hàng xóm', 'Danh từ', '이웃집에서 소음이 나요.', 'Nhà hàng xóm gây tiếng ồn.'),
  ('4A-L7', '4A', '들려오다', 'deul-lyeo-o-da', 'Vẳng đến, vang đến tai', 'Động từ', '음악 소리가 들려와요.', 'Tiếng nhạc vẳng đến.'),
  ('4A-L7', '4A', '소음', 'so-eum', 'Tiếng ồn', 'Danh từ', '소음이 심해요.', 'Tiếng ồn rất lớn.'),
  ('4A-L7', '4A', '불편을 겪다', 'bul-pyeo-neul gyeok-da', 'Gặp bất tiện', 'Cụm động từ', '불편을 많이 겪었어요.', 'Đã gặp nhiều bất tiện.'),
  ('4A-L7', '4A', '항의', 'hang-ui', 'Phản đối, khiếu nại', 'Danh từ', '항의 편지를 보냈어요.', 'Đã gửi thư khiếu nại.'),
  ('4A-L7', '4A', '악기', 'ak-gi', 'Nhạc cụ', 'Danh từ', '악기를 연주해요.', 'Chơi nhạc cụ.'),
  ('4A-L7', '4A', '진행하다', 'jin-haeng-ha-da', 'Tiến hành, thực hiện', 'Động từ', '회의를 진행해요.', 'Tiến hành cuộc họp.'),
  ('4A-L7', '4A', '대표', 'dae-pyo', 'Đại diện', 'Danh từ', '대표를 뽑았어요.', 'Đã bầu đại diện.'),
  ('4A-L7', '4A', '한밤중', 'han-bam-jung', 'Giữa đêm khuya', 'Danh từ', '한밤중에 소음이 났어요.', 'Giữa đêm khuya có tiếng ồn.'),
  ('4A-L7', '4A', '따라서', 'tta-ra-seo', 'Vì vậy, theo đó', 'Liên từ', '따라서 규칙을 지켜야 해요.', 'Vì vậy phải tuân thủ quy tắc.'),
  ('4A-L7', '4A', '개인', 'gae-in', 'Cá nhân', 'Danh từ', '개인의 자유도 중요해요.', 'Tự do cá nhân cũng quan trọng.'),
  ('4A-L7', '4A', '경우', 'gyeong-u', 'Tình huống, trường hợp', 'Danh từ', '어떤 경우에도 예의를 지켜요.', 'Trong mọi trường hợp đều giữ phép lịch sự.'),
  ('4A-L7', '4A', '사회생활', 'sa-hoe-saeng-hwal', 'Đời sống xã hội', 'Danh từ', '사회생활이 힘들어요.', 'Đời sống xã hội thật vất vả.'),
  ('4A-L7', '4A', '비용', 'bi-yong', 'Chi phí, phí tổn', 'Danh từ', '비용이 얼마예요?', 'Chi phí là bao nhiêu?'),
  ('4A-L7', '4A', '우선', 'u-seon', 'Trước tiên, ưu tiên', 'Phó từ', '우선 이것부터 해요.', 'Trước tiên hãy làm cái này.'),
  ('4A-L7', '4A', '지정하다', 'ji-jeong-ha-da', 'Chỉ định, quy định', 'Động từ', '장소를 지정했어요.', 'Đã chỉ định địa điểm.'),
  ('4A-L7', '4A', '늘려 가다', 'neul-lyeo ga-da', 'Mở rộng dần', 'Cụm động từ', '규모를 늘려 가고 있어요.', 'Đang mở rộng dần quy mô.'),
  ('4A-L7', '4A', '건의', 'geo-nui', 'Kiến nghị, đề xuất', 'Danh từ', '건의 사항이 있어요.', 'Có điều muốn kiến nghị.'),
  ('4A-L7', '4A', '개봉되다', 'gae-bong-doe-da', 'Khởi chiếu (phim)', 'Động từ', '새 영화가 개봉됐어요.', 'Phim mới đã khởi chiếu.'),
  ('4A-L7', '4A', '코를 막다', 'ko-reul mak-da', 'Bịt mũi', 'Cụm động từ', '냄새 때문에 코를 막았어요.', 'Vì mùi nên bịt mũi lại.'),
  ('4A-L7', '4A', '음향 시설', 'eum-hyang si-seol', 'Thiết bị âm thanh', 'Danh từ', '음향 시설이 좋아요.', 'Thiết bị âm thanh tốt.'),
  ('4A-L7', '4A', '생생하다', 'saeng-saeng-ha-da', 'Sống động, chân thực', 'Tính từ', '소리가 생생해요.', 'Âm thanh rất sống động.'),
  ('4A-L7', '4A', '담장', 'dam-jang', 'Hàng rào, bờ tường', 'Danh từ', '담장을 쌓았어요.', 'Đã xây hàng rào.'),
  ('4A-L7', '4A', '대궐', 'dae-gwol', 'Cung điện', 'Danh từ', '대궐 같은 집이에요.', 'Ngôi nhà như cung điện.'),
  ('4A-L7', '4A', '달아 놓다', 'da-ra no-ta', 'Treo lên, gắn lên', 'Cụm động từ', '간판을 달아 놓았어요.', 'Đã treo biển lên.'),
  ('4A-L7', '4A', '북', 'buk', 'Cái trống', 'Danh từ', '북을 쳤어요.', 'Đã đánh trống.'),
  ('4A-L7', '4A', '기타', 'gi-ta', 'Đàn ghi ta', 'Danh từ', '기타를 쳐요.', 'Chơi đàn ghi ta.'),
  ('4A-L7', '4A', '묻다', 'mut-da', 'Hỏi / Chôn', 'Động từ', '길을 물었어요.', 'Đã hỏi đường.'),
  ('4A-L7', '4A', '도로', 'do-ro', 'Đường, quốc lộ', 'Danh từ', '도로가 막혀요.', 'Đường tắc.'),
  ('4A-L7', '4A', '경제적', 'gyeong-je-jeok', 'Tiết kiệm, kinh tế', 'Tính từ', '경제적인 방법을 써요.', 'Dùng phương pháp tiết kiệm.'),
  ('4A-L7', '4A', '신문', 'sin-mun', 'Báo (tờ báo)', 'Danh từ', '신문을 읽어요.', 'Đọc báo.'),
  ('4A-L7', '4A', '임금님', 'im-geum-nim', 'Đức vua', 'Danh từ', '임금님이 명령했어요.', 'Đức vua đã ra lệnh.'),
  ('4A-L7', '4A', '백성', 'baek-seong', 'Trăm họ, thần dân', 'Danh từ', '백성을 위한 정책이에요.', 'Chính sách vì trăm họ.'),
  ('4A-L7', '4A', '초기', 'cho-gi', 'Thời kỳ đầu, ban đầu', 'Danh từ', '초기 단계예요.', 'Là giai đoạn ban đầu.'),
  ('4A-L7', '4A', '설치하다', 'seol-chi-ha-da', 'Lắp đặt, cài đặt', 'Động từ', '카메라를 설치했어요.', 'Đã lắp đặt camera.'),
  ('4A-L7', '4A', '사연', 'sa-yeon', 'Câu chuyện, hoàn cảnh', 'Danh từ', '사연을 들었어요.', 'Đã nghe câu chuyện.'),
  ('4A-L7', '4A', '민원 창구', 'min-won chang-gu', 'Cửa tiếp dân', 'Danh từ', '민원 창구에 갔어요.', 'Đã đến cửa tiếp dân.');

-- ── Grammar 1 ──────────────────────────────────────────────────────────────
WITH g1 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4A-L7', '4A',
    '~는 게 맞다/그르다 (Làm... là đúng/sai)',
    'B2',
    'Động từ + 는 게 맞다/그르다 = làm... là đúng/sai. Dùng để đánh giá hành vi về mặt đạo đức hoặc chuẩn mực xã hội.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g1, (VALUES
  ('공공장소에서 큰 소리로 전화하는 게 그릇돼요.', 'Nói chuyện điện thoại to tiếng ở nơi công cộng là sai trái.'),
  ('어른에게 자리를 양보하는 게 맞아요.', 'Nhường chỗ cho người lớn tuổi là đúng.'),
  ('남의 물건을 훔치는 게 그릇돼요.', 'Trộm đồ của người khác là sai trái.')
) AS ex(korean, vietnamese);

-- ── Grammar 2 ──────────────────────────────────────────────────────────────
WITH g2 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4A-L7', '4A',
    '~아/어서는 안 되다 (Không được...)',
    'B2',
    'Động từ + 아/어서는 안 되다 = không được làm... Dùng để nói điều bị cấm hoặc không được phép.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g2, (VALUES
  ('상영관 안에서 음식물을 반입해서는 안 돼요.', 'Không được mang đồ ăn vào phòng chiếu phim.'),
  ('한밤중에 악기를 연주해서는 안 돼요.', 'Không được chơi nhạc cụ vào giữa đêm khuya.'),
  ('남에게 불편을 줘서는 안 돼요.', 'Không được gây bất tiện cho người khác.')
) AS ex(korean, vietnamese);

-- ── Grammar 3 ──────────────────────────────────────────────────────────────
WITH g3 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4A-L7', '4A',
    '~(으)ㄹ 경우에는 (Trong trường hợp...)',
    'B2',
    'Động từ/Tính từ + (으)ㄹ 경우에는 = trong trường hợp... Dùng để đặt điều kiện giả định.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g3, (VALUES
  ('소음이 심할 경우에는 관리 사무소에 신고하세요.', 'Trong trường hợp tiếng ồn quá lớn, hãy báo lên ban quản lý.'),
  ('문제가 생길 경우에는 즉시 연락해 주세요.', 'Trong trường hợp có vấn đề, hãy liên lạc ngay.')
) AS ex(korean, vietnamese);

-- ── Dialogue ───────────────────────────────────────────────────────────────
INSERT INTO seoul_dialogue (lesson_id, book_id, speaker, text, translation)
VALUES
  ('4A-L7', '4A', '지호', '어제 영화관에서 옆 사람이 팝콘 냄새를 막 풍기고 큰 소리로 전화까지 받더라고요.', 'Hôm qua ở rạp chiếu phim, người bên cạnh cứ để mùi bắp rang bay khắp và còn nghe điện thoại to tiếng nữa.'),
  ('4A-L7', '4A', '수진', '정말요? 그런 행동은 옳지 않죠. 다른 사람에게 불편을 주잖아요.', 'Thật không? Hành động như vậy thật không đúng. Đó là gây bất tiện cho người khác mà.'),
  ('4A-L7', '4A', '지호', '그렇죠. 상영관 안에서 음식물 반입은 금지인데도 양심이 없이 들고 들어오더라고요.', 'Đúng vậy. Phòng chiếu phim cấm mang đồ ăn vào mà vẫn cứ mang vào một cách không có lương tâm.'),
  ('4A-L7', '4A', '수진', '저도 비슷한 경험이 있어요. 이웃집에서 한밤중에 악기 소리가 들려와서 잠을 못 잤어요.', 'Tôi cũng có kinh nghiệm tương tự. Nhà hàng xóm chơi nhạc cụ giữa đêm khuya vang đến tai nên không ngủ được.'),
  ('4A-L7', '4A', '지호', '그럴 경우에는 먼저 양해를 구하고, 안 되면 관리 사무소에 항의하는 게 맞을 것 같아요.', 'Trong trường hợp đó, trước tiên mong sự thông cảm, nếu không được thì khiếu nại lên ban quản lý là đúng hơn.'),
  ('4A-L7', '4A', '수진', '맞아요. 사회생활에서는 개인의 자유도 중요하지만 다른 사람을 배려하는 게 우선이죠.', 'Đúng vậy. Trong đời sống xã hội, tự do cá nhân cũng quan trọng nhưng quan tâm đến người khác phải là ưu tiên hàng đầu.');

COMMIT;
