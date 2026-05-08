-- Seoul 4B Lesson 16: 과학의 신비 (Thần bí của khoa học)
-- Generated from src/mocks/data/seoul-books-data.ts

BEGIN;

-- ── Clean up existing data for 4B-L16 ─────────────────────────────────────
DELETE FROM seoul_dialogue WHERE lesson_id = '4B-L16';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4B-L16');
DELETE FROM seoul_grammar WHERE lesson_id = '4B-L16';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4B-L16';

-- ── Upsert lesson ──────────────────────────────────────────────────────────
INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES (
  '4B-L16', '4B', 16,
  '과학의 신비',
  'Thần bí của khoa học',
  ARRAY['Thảo luận về các hiện tượng khoa học và bí ẩn tự nhiên', 'Học từ vựng về di truyền, hiện tượng vật lý và sinh học', 'Dùng ~(으)ㄹ 리가 없다, ~는지 모르다 để diễn đạt sự hoài nghi và bất định']::text[],
  '유전과 과학의 신비 (Di truyền và thần bí của khoa học)',
  'Người Hàn Quốc rất quan tâm đến di truyền học (유전학) trong cuộc sống hàng ngày — như bàn luận xem con cái thừa hưởng đặc điểm gì từ bố hay mẹ (쌍꺼풀, 보조개, 곱슬머리...). Khoa học Hàn Quốc phát triển mạnh: Hàn Quốc nằm trong top 10 thế giới về số bằng sáng chế và nghiên cứu khoa học.'
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
  ('4B-L16', '4B', '실제로 존재하다', 'sil-jje-ro jon-jae-ha-da', 'Thực sự tồn tại', 'Cụm động từ', '외계인이 실제로 존재할까요?', 'Người ngoài hành tinh thực sự tồn tại không?'),
  ('4B-L16', '4B', '이론적으로 가능하다', 'i-ron-jeo-geu-ro ga-neung-ha-da', 'Có khả năng trên lý thuyết', 'Cụm tính từ', '이론적으로는 가능해요.', 'Trên lý thuyết thì có thể.'),
  ('4B-L16', '4B', '원리가 궁금하다', 'won-ni-ga gung-geum-ha-da', 'Tò mò nguyên lý, muốn biết cơ chế', 'Cụm tính từ', '원리가 궁금해요.', 'Tò mò về nguyên lý.'),
  ('4B-L16', '4B', '벌', 'beol', 'Con ong', 'Danh từ', '벌이 꽃에서 꿀을 모아요.', 'Con ong thu mật từ hoa.'),
  ('4B-L16', '4B', '인류', 'il-lyu', 'Nhân loại, loài người', 'Danh từ', '인류는 계속 발전해요.', 'Nhân loại không ngừng phát triển.'),
  ('4B-L16', '4B', '쌍둥이', 'ssang-dung-i', 'Sinh đôi', 'Danh từ', '쌍둥이는 얼굴이 똑같아요.', 'Sinh đôi có khuôn mặt giống hệt nhau.'),
  ('4B-L16', '4B', '현실적으로 불가능하다', 'hyeon-sil-jeo-geu-ro bul-ga-neung-ha-da', 'Trên thực tế không có khả năng', 'Cụm tính từ', '현실적으로 불가능해요.', 'Trên thực tế là không thể.'),
  ('4B-L16', '4B', '이유가 밝혀지다', 'i-yu-ga bal-kyeo-ji-da', 'Lý do được sáng tỏ, được giải thích', 'Cụm động từ', '이유가 밝혀졌어요.', 'Lý do đã được sáng tỏ.'),
  ('4B-L16', '4B', '관심이 생기다', 'gwan-si-mi saeng-gi-da', 'Nảy sinh sự quan tâm, bắt đầu quan tâm', 'Cụm động từ', '과학에 관심이 생겼어요.', 'Nảy sinh sự quan tâm đến khoa học.'),
  ('4B-L16', '4B', '흥미가 없다', 'heung-mi-ga eop-da', 'Không có hứng thú, không thú vị', 'Cụm tính từ', '그 주제는 흥미가 없어요.', 'Chủ đề đó không có hứng thú.'),
  ('4B-L16', '4B', '골치가 아프다', 'gol-chi-ga a-peu-da', 'Đau đầu (về việc gì), nan giải', 'Cụm tính từ', '생각하면 골치가 아파요.', 'Nghĩ đến thì đau đầu.'),
  ('4B-L16', '4B', '신비롭게 느껴지다', 'sin-bi-rop-ge neu-kkyeo-ji-da', 'Cảm thấy một cách thần bí, bí ẩn', 'Cụm động từ', '우주가 신비롭게 느껴져요.', 'Cảm thấy vũ trụ thật thần bí.'),
  ('4B-L16', '4B', '불가능하다', 'bul-ga-neung-ha-da', 'Không thể, bất khả thi', 'Tính từ', '불가능한 일이에요.', 'Là việc không thể.'),
  ('4B-L16', '4B', '불공평하다', 'bul-gong-pyeong-ha-da', 'Không công bằng, bất công', 'Tính từ', '불공평한 대우예요.', 'Là cách đối xử không công bằng.'),
  ('4B-L16', '4B', '불규칙하다', 'bul-gyu-chi-ka-da', 'Không có quy tắc, bất quy tắc', 'Tính từ', '불규칙한 생활을 해요.', 'Sống không có quy tắc.'),
  ('4B-L16', '4B', '불확실하다', 'bu-rak-sil-ha-da', 'Không chắc chắn, bất định', 'Tính từ', '미래는 불확실해요.', 'Tương lai không chắc chắn.'),
  ('4B-L16', '4B', '부정확하다', 'bu-jeong-hwak-ha-da', 'Không chính xác, thiếu chính xác', 'Tính từ', '부정확한 정보예요.', 'Là thông tin không chính xác.'),
  ('4B-L16', '4B', '꾸준히', 'kku-jun-hi', 'Liên tục, đều đặn, bền bỉ', 'Phó từ', '꾸준히 연습해요.', 'Luyện tập đều đặn.'),
  ('4B-L16', '4B', '형태', 'hyeong-tae', 'Hình dạng, hình thái, kiểu dáng', 'Danh từ', '다양한 형태가 있어요.', 'Có nhiều hình dạng khác nhau.'),
  ('4B-L16', '4B', '신체적', 'sin-che-jeok', 'Về mặt thân thể, thể chất', 'Tính từ', '신체적 특징이에요.', 'Là đặc điểm về thể chất.'),
  ('4B-L16', '4B', '타고나다', 'ta-go-na-da', 'Bẩm sinh, thiên bẩm, trời sinh', 'Động từ', '재능을 타고났어요.', 'Có tài năng bẩm sinh.'),
  ('4B-L16', '4B', '귓불', 'gwit-bul', 'Dái tai, vành tai dưới', 'Danh từ', '귓불이 커요.', 'Dái tai to.'),
  ('4B-L16', '4B', '주근깨', 'ju-geun-kkae', 'Tàn nhang, vết nám da', 'Danh từ', '주근깨가 있어요.', 'Có tàn nhang.'),
  ('4B-L16', '4B', '상식', 'sang-sik', 'Thường thức, kiến thức thông thường', 'Danh từ', '상식이 풍부해요.', 'Kiến thức thường thức phong phú.'),
  ('4B-L16', '4B', '빙빙 돌다', 'bing-bing dol-da', 'Quay tròn, xoay vòng vòng', 'Cụm động từ', '물이 빙빙 돌아요.', 'Nước xoay vòng vòng.'),
  ('4B-L16', '4B', '지나치다', 'ji-na-chi-da', 'Thái quá, quá mức, đi qua', 'Tính từ/Động từ', '지나친 걱정이에요.', 'Là sự lo lắng thái quá.'),
  ('4B-L16', '4B', '의심하다', 'ui-sim-ha-da', 'Nghi ngờ, hoài nghi', 'Động từ', '사실을 의심해요.', 'Nghi ngờ sự thật.'),
  ('4B-L16', '4B', '욕조', 'yok-jo', 'Bồn tắm', 'Danh từ', '욕조에서 목욕해요.', 'Tắm trong bồn tắm.'),
  ('4B-L16', '4B', '세면대', 'se-myeon-dae', 'Bồn rửa mặt, chậu rửa', 'Danh từ', '세면대에서 손을 씻어요.', 'Rửa tay ở bồn rửa mặt.'),
  ('4B-L16', '4B', '빠져나가다', 'bba-jyeo-na-ga-da', 'Thoát ra, luồn ra, chảy ra', 'Động từ', '물이 빠져나가요.', 'Nước chảy ra ngoài.'),
  ('4B-L16', '4B', '산모', 'san-mo', 'Sản phụ, người mẹ vừa sinh', 'Danh từ', '산모를 돌봐야 해요.', 'Phải chăm sóc sản phụ.'),
  ('4B-L16', '4B', '괴물', 'goe-mul', 'Quái vật', 'Danh từ', '괴물이 나타났어요.', 'Quái vật xuất hiện.'),
  ('4B-L16', '4B', '외계인', 'oe-gye-in', 'Người ngoài hành tinh', 'Danh từ', '외계인이 존재할까요?', 'Người ngoài hành tinh có tồn tại không?'),
  ('4B-L16', '4B', '지구인', 'ji-gu-in', 'Người Trái Đất', 'Danh từ', '지구인과 다른 생명체예요.', 'Là sinh vật khác với người Trái Đất.'),
  ('4B-L16', '4B', '체중', 'che-jung', 'Cân nặng, trọng lượng cơ thể', 'Danh từ', '체중을 재요.', 'Cân trọng lượng.'),
  ('4B-L16', '4B', '이어지다', 'i-eo-ji-da', 'Tiếp nối, kéo dài, liên tiếp', 'Động từ', '전통이 이어져요.', 'Truyền thống được tiếp nối.'),
  ('4B-L16', '4B', '존재하다', 'jon-jae-ha-da', 'Tồn tại, có thật', 'Động từ', '신이 존재해요?', 'Thần linh có tồn tại không?'),
  ('4B-L16', '4B', '목격하다', 'mok-gyeo-ka-da', 'Chứng kiến, mục kích', 'Động từ', '사건을 목격했어요.', 'Đã chứng kiến sự việc.'),
  ('4B-L16', '4B', '타임머신', 'ta-im-meo-sin', 'Cỗ máy thời gian', 'Danh từ', '타임머신이 있으면 좋겠어요.', 'Giá mà có cỗ máy thời gian.'),
  ('4B-L16', '4B', '투명인간', 'tu-myeong-in-gan', 'Người vô hình', 'Danh từ', '투명인간이 되고 싶어요?', 'Bạn muốn trở thành người vô hình không?'),
  ('4B-L16', '4B', '망토', 'mang-to', 'Áo choàng, áo măng tô', 'Danh từ', '망토를 입었어요.', 'Đã mặc áo choàng.'),
  ('4B-L16', '4B', '개발하다', 'gae-bal-ha-da', 'Phát triển, khai thác, nghiên cứu phát triển', 'Động từ', '신기술을 개발했어요.', 'Đã phát triển công nghệ mới.'),
  ('4B-L16', '4B', '뚫다', 'ttul-ta', 'Đục, khoan, xuyên qua', 'Động từ', '벽을 뚫었어요.', 'Đã đục xuyên qua tường.'),
  ('4B-L16', '4B', '굴절시키다', 'gul-jeol-si-ki-da', 'Làm khúc xạ, làm bẻ cong (ánh sáng)', 'Động từ', '빛을 굴절시켜요.', 'Làm khúc xạ ánh sáng.'),
  ('4B-L16', '4B', '운석', 'un-seok', 'Thiên thạch', 'Danh từ', '운석이 떨어졌어요.', 'Thiên thạch rơi xuống.'),
  ('4B-L16', '4B', '투표', 'tu-pyo', 'Bỏ phiếu, bầu cử', 'Danh từ', '투표에 참여해요.', 'Tham gia bỏ phiếu.'),
  ('4B-L16', '4B', '선출되다', 'seon-chul-doe-da', 'Được bầu chọn, được tuyển chọn', 'Động từ', '대표로 선출됐어요.', 'Được bầu làm đại diện.'),
  ('4B-L16', '4B', '영양소', 'yeong-yang-so', 'Dinh dưỡng, chất dinh dưỡng', 'Danh từ', '영양소를 섭취해요.', 'Hấp thụ chất dinh dưỡng.'),
  ('4B-L16', '4B', '유전', 'yu-jeon', 'Di truyền', 'Danh từ', '유전으로 전달돼요.', 'Được truyền qua di truyền.'),
  ('4B-L16', '4B', '전달되다', 'jeon-dal-doe-da', 'Được truyền lại, được chuyển giao', 'Động từ', '정보가 전달됐어요.', 'Thông tin đã được truyền lại.'),
  ('4B-L16', '4B', '현상', 'hyeon-sang', 'Hiện tượng', 'Danh từ', '자연 현상이에요.', 'Là hiện tượng tự nhiên.'),
  ('4B-L16', '4B', '곱슬머리', 'gop-seul-meo-ri', 'Tóc xoăn', 'Danh từ', '곱슬머리예요.', 'Là tóc xoăn.'),
  ('4B-L16', '4B', '직모', 'jing-mo', 'Tóc thẳng', 'Danh từ', '직모가 많아요.', 'Tóc thẳng nhiều.'),
  ('4B-L16', '4B', '결합되다', 'gyeol-hap-doe-da', 'Kết hợp, được kết hợp', 'Động từ', '두 유전자가 결합됐어요.', 'Hai gene đã kết hợp.'),
  ('4B-L16', '4B', '일정하다', 'il-jeong-ha-da', 'Nhất định, cố định, đều đặn', 'Tính từ', '일정한 속도예요.', 'Là tốc độ đều đặn.'),
  ('4B-L16', '4B', '유지하다', 'yu-ji-ha-da', 'Duy trì, giữ gìn', 'Động từ', '체중을 유지해요.', 'Duy trì cân nặng.'),
  ('4B-L16', '4B', '보조개', 'bo-jo-gae', 'Lúm đồng tiền', 'Danh từ', '보조개가 귀여워요.', 'Lúm đồng tiền thật dễ thương.'),
  ('4B-L16', '4B', '쌍꺼풀', 'ssang-kkeo-pul', 'Mắt hai mí', 'Danh từ', '쌍꺼풀이 있어요.', 'Có mắt hai mí.'),
  ('4B-L16', '4B', '우성', 'u-seong', 'Gen trội, tính trội', 'Danh từ', '쌍꺼풀은 우성 유전이에요.', 'Mắt hai mí là gen trội.'),
  ('4B-L16', '4B', '적용되다', 'jeo-gyong-doe-da', 'Được áp dụng', 'Động từ', '법칙이 적용돼요.', 'Quy tắc được áp dụng.');

-- ── Grammar 1 ──────────────────────────────────────────────────────────────
WITH g1 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L16', '4B',
    '~(으)ㄹ 리가 없다 (Không thể... được, không có lý...)',
    'B2+',
    'Động từ + (으)ㄹ 리가 없다 = không thể... được, không có cơ sở nào để... Diễn đạt sự phủ định mạnh hoặc hoài nghi.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g1, (VALUES
  ('투명인간이 존재할 리가 없어요.', 'Không thể nào người vô hình lại tồn tại được.'),
  ('이게 유전으로 전달될 리가 없어요.', 'Điều này không thể được truyền qua di truyền.'),
  ('운석이 이렇게 자주 떨어질 리가 없어요.', 'Không thể nào thiên thạch lại rơi xuống thường xuyên như vậy.')
) AS ex(korean, vietnamese);

-- ── Grammar 2 ──────────────────────────────────────────────────────────────
WITH g2 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L16', '4B',
    '~는지 모르다 (Không biết... hay không, không rõ...)',
    'B2+',
    'Động từ + 는지 모르다 = không biết... hay không. Diễn đạt sự không chắc chắn hoặc thiếu thông tin.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g2, (VALUES
  ('외계인이 존재하는지 모르겠어요.', 'Không biết người ngoài hành tinh có tồn tại hay không.'),
  ('타임머신이 이론적으로 가능한지 모르겠어요.', 'Không biết cỗ máy thời gian có khả thi về mặt lý thuyết hay không.')
) AS ex(korean, vietnamese);

-- ── Grammar 3 ──────────────────────────────────────────────────────────────
WITH g3 AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES (
    '4B-L16', '4B',
    '~에 따르면 (Theo..., dựa theo...)',
    'B2+',
    'Danh từ + 에 따르면 = theo..., dựa theo... Trích dẫn nguồn thông tin hoặc căn cứ.',
    ''
  )
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM g3, (VALUES
  ('과학자들에 따르면 쌍꺼풀은 우성 유전이에요.', 'Theo các nhà khoa học, mắt hai mí là gen trội.'),
  ('연구에 따르면 곱슬머리도 유전이에요.', 'Theo nghiên cứu, tóc xoăn cũng do di truyền.')
) AS ex(korean, vietnamese);

-- ── Dialogue ───────────────────────────────────────────────────────────────
INSERT INTO seoul_dialogue (lesson_id, book_id, speaker, text, translation)
VALUES
  ('4B-L16', '4B', '하은', '쌍꺼풀이나 보조개 같은 것도 유전으로 전달된다고 해요.', 'Nghe nói mắt hai mí hay lúm đồng tiền cũng được truyền qua di truyền.'),
  ('4B-L16', '4B', '태준', '정말요? 과학자들에 따르면 쌍꺼풀은 우성이라서 부모 중 한 명만 있어도 나타난대요.', 'Thật sao? Theo các nhà khoa học, mắt hai mí là gen trội nên chỉ cần một trong hai bố mẹ có là sẽ xuất hiện.'),
  ('4B-L16', '4B', '하은', '그러면 투명인간이나 타임머신 같은 것도 이론적으로는 가능한지 모르겠어요.', 'Vậy thì không biết người vô hình hay cỗ máy thời gian có khả thi về mặt lý thuyết hay không.'),
  ('4B-L16', '4B', '태준', '투명인간은 빛을 굴절시켜야 하는데 현실적으로 불가능할 리가 없다고 하는 과학자도 있어요.', 'Người vô hình cần làm khúc xạ ánh sáng, cũng có nhà khoa học nói rằng không thể nói là không thể về mặt thực tế.'),
  ('4B-L16', '4B', '하은', '과학이 발전할수록 신비롭게 느껴지는 현상들이 밝혀지니까 꾸준히 관심을 가져야 해요.', 'Càng khoa học phát triển thì các hiện tượng cảm thấy thần bí được sáng tỏ nên cần quan tâm đều đặn.');

COMMIT;
