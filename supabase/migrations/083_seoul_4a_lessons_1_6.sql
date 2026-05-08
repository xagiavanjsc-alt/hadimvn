-- Seoul 4A lessons 1-6: lessons, vocabulary, grammar, examples, dialogue
-- Generated from src/mocks/data/seoul-books-data.ts

BEGIN;

INSERT INTO seoul_books (id, name, level, level_group, color, bg_gradient, description, total_lessons, total_vocab, total_grammar, cefr_level, target_audience)
VALUES ('4A', 'Seoul 4A', '4A', 4, '#84cc16', 'from-[#84cc16]/20 to-[#84cc16]/5', 'Tiếng Hàn cao cấp — văn học, báo chí, thảo luận học thuật và ngôn ngữ chuyên ngành', 10, 400, 35, 'B2', 'Đã hoàn thành Seoul 3B')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  level = EXCLUDED.level,
  level_group = EXCLUDED.level_group,
  color = EXCLUDED.color,
  bg_gradient = EXCLUDED.bg_gradient,
  description = EXCLUDED.description,
  total_lessons = EXCLUDED.total_lessons,
  total_vocab = EXCLUDED.total_vocab,
  total_grammar = EXCLUDED.total_grammar,
  cefr_level = EXCLUDED.cefr_level,
  target_audience = EXCLUDED.target_audience;

-- 4A-L1: 적성과 진로
DELETE FROM seoul_dialogue WHERE lesson_id = '4A-L1';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4A-L1');
DELETE FROM seoul_grammar WHERE lesson_id = '4A-L1';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4A-L1';

INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES ('4A-L1', '4A', 1, '적성과 진로', 'Năng khiếu và định hướng', ARRAY['Nói về năng lực và năng khiếu', 'Trao đổi về định hướng nghề nghiệp', 'Học từ vựng về tính cách và chuyên môn']::text[], '진로 상담 (Tư vấn định hướng nghề nghiệp)', 'Ở Hàn Quốc, học sinh và sinh viên thường tham gia tư vấn hướng nghiệp trước khi chọn chuyên ngành hoặc chuẩn bị xin việc. Việc hiểu rõ 적성 (năng khiếu/phù hợp cá nhân) được xem là bước quan trọng trước khi quyết định 진로 (định hướng nghề nghiệp).')
ON CONFLICT (id) DO UPDATE SET
  book_id = EXCLUDED.book_id,
  lesson_number = EXCLUDED.lesson_number,
  title = EXCLUDED.title,
  title_vi = EXCLUDED.title_vi,
  objectives = EXCLUDED.objectives,
  dialogue_title = EXCLUDED.dialogue_title,
  cultural_tip = EXCLUDED.cultural_tip;

INSERT INTO seoul_vocabulary (lesson_id, book_id, korean, pronunciation, vietnamese, part_of_speech, example, example_vi)
VALUES
  ('4A-L1', '4A', '능력', 'neung-nyeok', 'Năng lực', 'Danh từ', '능력이 있는 사람을 찾고 있어요.', 'Đang tìm người có năng lực.'),
  ('4A-L1', '4A', '적성', 'jeok-sseong', 'Sự phù hợp / Năng khiếu', 'Danh từ', '적성을 잘 알아야 해요.', 'Phải hiểu rõ năng khiếu của mình.'),
  ('4A-L1', '4A', '손재주가 좋다', 'son-jae-ju-ga jo-ta', 'Khéo tay', 'Cụm tính từ', '그 사람은 손재주가 좋아요.', 'Người đó rất khéo tay.'),
  ('4A-L1', '4A', '이해가 빠르다', 'i-hae-ga ppa-reu-da', 'Hiểu nhanh', 'Cụm tính từ', '민수 씨는 이해가 빨라요.', 'Min-su hiểu rất nhanh.'),
  ('4A-L1', '4A', '설득력이 있다', 'seol-deuk-nyeo-gi it-tta', 'Có năng lực thuyết phục', 'Cụm tính từ', '그는 설득력이 있는 발표를 했어요.', 'Anh ấy đã thuyết trình rất có sức thuyết phục.'),
  ('4A-L1', '4A', '책임감이 강하다', 'chae-gim-ga-mi gang-ha-da', 'Có trách nhiệm cao', 'Cụm tính từ', '책임감이 강한 사람과 일하고 싶어요.', 'Tôi muốn làm việc với người có trách nhiệm cao.'),
  ('4A-L1', '4A', '소질이 있다', 'so-ji-ri it-tta', 'Có tố chất', 'Cụm tính từ', '그 학생은 음악에 소질이 있어요.', 'Học sinh đó có tố chất âm nhạc.'),
  ('4A-L1', '4A', '적성에 맞다', 'jeok-sseong-e mat-tta', 'Phù hợp với năng khiếu / tính cách', 'Cụm động từ', '이 일이 제 적성에 맞아요.', 'Công việc này phù hợp với năng khiếu của tôi.'),
  ('4A-L1', '4A', '진로를 정하다', 'jin-no-reul jeong-ha-da', 'Quyết định định hướng nghề nghiệp', 'Cụm động từ', '졸업 전에 진로를 정해야 해요.', 'Trước khi tốt nghiệp phải quyết định định hướng nghề nghiệp.'),
  ('4A-L1', '4A', '전공을 살리다', 'jeon-gong-eul sal-li-da', 'Làm đúng chuyên ngành / phát huy chuyên ngành', 'Cụm động từ', '전공을 살려서 일하고 싶어요.', 'Tôi muốn làm việc đúng chuyên ngành.'),
  ('4A-L1', '4A', '예술적', 'ye-sul-jeok', 'Mang tính nghệ thuật', 'Tính từ định ngữ', '예술적인 감각이 뛰어나요.', 'Có cảm quan nghệ thuật xuất sắc.'),
  ('4A-L1', '4A', '실용적', 'si-ryong-jeok', 'Mang tính thực tiễn', 'Tính từ định ngữ', '실용적인 방법을 찾아봅시다.', 'Hãy thử tìm phương pháp thực tiễn.'),
  ('4A-L1', '4A', '사교적', 'sa-gyo-jeok', 'Hòa đồng / dễ gần', 'Tính từ định ngữ', '그 친구는 사교적인 성격이에요.', 'Bạn đó có tính cách hòa đồng.'),
  ('4A-L1', '4A', '적극적', 'jeok-kkeuk-jeok', 'Tích cực / năng động', 'Tính từ định ngữ', '적극적으로 의견을 말해 보세요.', 'Hãy thử nói ý kiến một cách tích cực.'),
  ('4A-L1', '4A', '긍정적', 'geung-jeong-jeok', 'Tích cực / lạc quan', 'Tính từ định ngữ', '긍정적으로 생각하는 것이 중요해요.', 'Suy nghĩ tích cực là điều quan trọng.'),
  ('4A-L1', '4A', '부정적', 'bu-jeong-jeok', 'Tiêu cực / phủ định', 'Tính từ định ngữ', '부정적인 말은 하지 않는 게 좋아요.', 'Không nên nói những lời tiêu cực.'),
  ('4A-L1', '4A', '친해지다', 'chin-hae-ji-da', 'Trở nên thân thiết', 'Động từ', '같이 일하면서 친해졌어요.', 'Chúng tôi trở nên thân thiết khi làm việc cùng nhau.'),
  ('4A-L1', '4A', '승진', 'seung-jin', 'Thăng chức', 'Danh từ', '이번에 승진 기회가 생겼어요.', 'Lần này có cơ hội thăng chức.'),
  ('4A-L1', '4A', '기회', 'gi-hoe', 'Cơ hội', 'Danh từ', '좋은 기회를 놓치지 마세요.', 'Đừng bỏ lỡ cơ hội tốt.'),
  ('4A-L1', '4A', '소리를 내다', 'so-ri-reul nae-da', 'Phát ra âm thanh', 'Cụm động từ', '악기가 아름다운 소리를 냈어요.', 'Nhạc cụ phát ra âm thanh hay.'),
  ('4A-L1', '4A', '하루 종일', 'ha-ru jong-il', 'Suốt cả ngày', 'Trạng từ', '하루 종일 연습했어요.', 'Tôi đã luyện tập suốt cả ngày.'),
  ('4A-L1', '4A', '언젠가', 'eon-jen-ga', 'Một ngày nào đó', 'Trạng từ', '언젠가 꼭 성공하고 싶어요.', 'Một ngày nào đó tôi nhất định muốn thành công.'),
  ('4A-L1', '4A', '성공하다', 'seong-gong-ha-da', 'Thành công', 'Động từ', '꿈을 이루기 위해 노력하면 성공할 수 있어요.', 'Nếu nỗ lực để thực hiện ước mơ thì có thể thành công.'),
  ('4A-L1', '4A', '인턴사원', 'in-teon-sa-won', 'Nhân viên thực tập', 'Danh từ', '인턴사원으로 회사에 들어갔어요.', 'Tôi vào công ty với tư cách nhân viên thực tập.'),
  ('4A-L1', '4A', '교수', 'gyo-su', 'Giáo sư', 'Danh từ', '교수님께 진로 상담을 받았어요.', 'Tôi đã nhận tư vấn định hướng từ giáo sư.'),
  ('4A-L1', '4A', '붙다', 'but-tta', 'Đậu / dán / bám vào', 'Động từ', '오디션에 붙었어요.', 'Tôi đã đậu buổi thử giọng.'),
  ('4A-L1', '4A', '결국', 'gyeol-guk', 'Cuối cùng / kết quả là', 'Trạng từ', '결국 꿈을 이루었어요.', 'Cuối cùng tôi đã thực hiện được ước mơ.'),
  ('4A-L1', '4A', '해내다', 'hae-nae-da', 'Hoàn thành / làm được', 'Động từ', '어려운 일도 끝까지 해냈어요.', 'Việc khó tôi cũng đã làm đến cùng.'),
  ('4A-L1', '4A', '알아듣다', 'a-ra-deut-tta', 'Nghe hiểu', 'Động từ', '처음에는 말을 잘 알아듣지 못했어요.', 'Ban đầu tôi không nghe hiểu tốt.'),
  ('4A-L1', '4A', '적응하다', 'jeo-geung-ha-da', 'Thích nghi / quen với', 'Động từ', '새로운 환경에 적응했어요.', 'Tôi đã thích nghi với môi trường mới.'),
  ('4A-L1', '4A', '금방', 'geum-bang', 'Ngay lập tức / nhanh chóng', 'Trạng từ', '금방 익숙해질 거예요.', 'Sẽ nhanh chóng quen thôi.'),
  ('4A-L1', '4A', '뽑다', 'ppop-tta', 'Tuyển / chọn', 'Động từ', '올해 인턴사원을 뽑아요.', 'Năm nay tuyển nhân viên thực tập.'),
  ('4A-L1', '4A', '올해', 'ol-hae', 'Năm nay', 'Danh từ', '올해 꼭 취업하고 싶어요.', 'Năm nay tôi nhất định muốn xin được việc.'),
  ('4A-L1', '4A', '오디션', 'o-di-syeon', 'Buổi thử giọng / audition', 'Danh từ', '오디션을 보기 위해 준비했어요.', 'Tôi đã chuẩn bị để tham gia buổi thử giọng.'),
  ('4A-L1', '4A', '반대하다', 'ban-dae-ha-da', 'Phản đối', 'Động từ', '부모님은 제 선택을 반대했어요.', 'Bố mẹ đã phản đối lựa chọn của tôi.'),
  ('4A-L1', '4A', '설득하다', 'seol-deuk-ha-da', 'Thuyết phục', 'Động từ', '부모님을 설득하려고 노력했어요.', 'Tôi đã cố gắng thuyết phục bố mẹ.'),
  ('4A-L1', '4A', '꿈을 이루다', 'kku-meul i-ru-da', 'Thực hiện ước mơ', 'Cụm động từ', '언젠가 꿈을 이루고 싶어요.', 'Một ngày nào đó tôi muốn thực hiện ước mơ.'),
  ('4A-L1', '4A', '마음이 맞다', 'ma-eu-mi mat-tta', 'Hợp nhau', 'Cụm động từ', '마음이 맞는 친구를 만났어요.', 'Tôi đã gặp người bạn hợp ý.'),
  ('4A-L1', '4A', '특징', 'teuk-jjing', 'Đặc điểm', 'Danh từ', '이 직업의 특징을 알아봤어요.', 'Tôi đã tìm hiểu đặc điểm của nghề này.'),
  ('4A-L1', '4A', '반찬', 'ban-chan', 'Món ăn phụ', 'Danh từ', '한국 음식은 반찬이 다양해요.', 'Món Hàn có nhiều món ăn phụ đa dạng.'),
  ('4A-L1', '4A', '요리법', 'yo-ri-ppeop', 'Phương pháp nấu ăn / công thức nấu ăn', 'Danh từ', '새로운 요리법을 배웠어요.', 'Tôi đã học công thức nấu ăn mới.'),
  ('4A-L1', '4A', '스스로', 'seu-seu-ro', 'Tự mình', 'Trạng từ', '문제를 스스로 해결했어요.', 'Tôi đã tự mình giải quyết vấn đề.'),
  ('4A-L1', '4A', '해결하다', 'hae-gyeol-ha-da', 'Giải quyết', 'Động từ', '문제를 해결하려고 노력했어요.', 'Tôi đã cố gắng giải quyết vấn đề.'),
  ('4A-L1', '4A', '장점', 'jang-jjeom', 'Ưu điểm / điểm tốt', 'Danh từ', '자신의 장점을 잘 알아야 해요.', 'Phải hiểu rõ ưu điểm của bản thân.'),
  ('4A-L1', '4A', '놀랍다', 'nol-lap-tta', 'Ngạc nhiên / đáng kinh ngạc', 'Tính từ', '그 결과는 정말 놀라웠어요.', 'Kết quả đó thật sự đáng ngạc nhiên.'),
  ('4A-L1', '4A', '나중에는', 'na-jung-e-neun', 'Sau này thì', 'Trạng từ', '나중에는 혼자서도 잘하게 되었어요.', 'Sau này thì tôi cũng đã làm tốt một mình.'),
  ('4A-L1', '4A', '서너 번', 'seo-neo beon', 'Ba bốn lần', 'Cụm số lượng', '서너 번 연습하면 익숙해져요.', 'Luyện tập ba bốn lần thì sẽ quen.'),
  ('4A-L1', '4A', '밥을 사다', 'ba-beul sa-da', 'Mời / mua cơm', 'Cụm động từ', '고마워서 친구에게 밥을 샀어요.', 'Vì biết ơn nên tôi đã mời bạn ăn cơm.'),
  ('4A-L1', '4A', '조언하다', 'jo-eon-ha-da', 'Khuyên / đưa ra lời khuyên', 'Động từ', '선배가 진로에 대해 조언해 주었어요.', 'Tiền bối đã cho tôi lời khuyên về định hướng nghề nghiệp.'),
  ('4A-L1', '4A', '쉽게', 'swip-kke', 'Một cách dễ dàng', 'Trạng từ', '이 문제는 쉽게 풀리지 않았어요.', 'Vấn đề này không được giải quyết dễ dàng.'),
  ('4A-L1', '4A', '문제가 풀리다', 'mun-je-ga pul-li-da', 'Vấn đề được giải quyết', 'Cụm động từ', '친구의 도움으로 문제가 풀렸어요.', 'Nhờ sự giúp đỡ của bạn, vấn đề đã được giải quyết.'),
  ('4A-L1', '4A', '인사', 'in-sa', 'Chào hỏi', 'Danh từ', '처음 만났을 때 인사를 했어요.', 'Khi gặp lần đầu tôi đã chào hỏi.'),
  ('4A-L1', '4A', '따라 하다', 'tta-ra ha-da', 'Làm theo / bắt chước', 'Cụm động từ', '선생님을 따라 해 보세요.', 'Hãy thử làm theo giáo viên.'),
  ('4A-L1', '4A', '음감', 'eum-gam', 'Cảm âm', 'Danh từ', '음감이 좋아서 노래를 잘해요.', 'Vì cảm âm tốt nên hát hay.'),
  ('4A-L1', '4A', '따르다', 'tta-reu-da', 'Làm theo / đi theo', 'Động từ', '선생님의 조언을 따랐어요.', 'Tôi đã làm theo lời khuyên của giáo viên.'),
  ('4A-L1', '4A', '소리', 'so-ri', 'Tiếng / âm thanh', 'Danh từ', '아름다운 소리가 들려요.', 'Nghe thấy âm thanh đẹp.'),
  ('4A-L1', '4A', '악보', 'ak-ppo', 'Bản nhạc', 'Danh từ', '악보를 보면서 연습했어요.', 'Tôi vừa nhìn bản nhạc vừa luyện tập.'),
  ('4A-L1', '4A', '점점', 'jeom-jeom', 'Dần dần', 'Trạng từ', '점점 실력이 좋아졌어요.', 'Trình độ dần dần tốt lên.'),
  ('4A-L1', '4A', '예전', 'ye-jeon', 'Trước đây', 'Danh từ', '예전보다 자신감이 생겼어요.', 'So với trước đây tôi đã có sự tự tin.'),
  ('4A-L1', '4A', '보람을 느끼다', 'bo-ra-meul neu-kki-da', 'Cảm thấy có ý nghĩa / hài lòng', 'Cụm động từ', '학생들을 가르치며 보람을 느껴요.', 'Tôi cảm thấy có ý nghĩa khi dạy học sinh.'),
  ('4A-L1', '4A', '속도', 'sok-tto', 'Tốc độ', 'Danh từ', '이해하는 속도가 빨라요.', 'Tốc độ hiểu rất nhanh.'),
  ('4A-L1', '4A', '차이점', 'cha-i-jjeom', 'Điểm khác nhau', 'Danh từ', '두 직업의 차이점을 비교했어요.', 'Tôi đã so sánh điểm khác nhau của hai nghề.'),
  ('4A-L1', '4A', '젓가락', 'jeot-kka-rak', 'Đũa', 'Danh từ', '젓가락을 잘 사용할 수 있어요.', 'Tôi có thể dùng đũa tốt.'),
  ('4A-L1', '4A', '매력에 빠지다', 'mae-ryeo-ge ppa-ji-da', 'Bị cuốn hút / say mê sức hấp dẫn', 'Cụm động từ', '한국 문화의 매력에 빠졌어요.', 'Tôi đã bị cuốn hút bởi sức hấp dẫn của văn hóa Hàn Quốc.'),
  ('4A-L1', '4A', '분야', 'bu-nya', 'Lĩnh vực / chuyên ngành', 'Danh từ', '관심 있는 분야에서 일하고 싶어요.', 'Tôi muốn làm việc trong lĩnh vực mình quan tâm.'),
  ('4A-L1', '4A', '들어주다', 'deu-reo-ju-da', 'Lắng nghe giúp / nghe cho', 'Động từ', '친구가 제 고민을 들어줬어요.', 'Bạn đã lắng nghe nỗi lo của tôi.'),
  ('4A-L1', '4A', '상담하다', 'sang-dam-ha-da', 'Tư vấn / trao đổi', 'Động từ', '선생님과 진로를 상담했어요.', 'Tôi đã trao đổi với giáo viên về định hướng nghề nghiệp.'),
  ('4A-L1', '4A', '글을 쓰다', 'geu-reul sseu-da', 'Viết bài / viết chữ', 'Cụm động từ', '글을 쓰는 일을 좋아해요.', 'Tôi thích công việc viết lách.'),
  ('4A-L1', '4A', '목소리', 'mok-sso-ri', 'Giọng nói', 'Danh từ', '목소리가 좋아서 아나운서에 어울려요.', 'Vì giọng nói hay nên phù hợp làm phát thanh viên.'),
  ('4A-L1', '4A', '패션 감각', 'pae-syeon gam-gak', 'Gu thời trang / cảm quan thời trang', 'Danh từ', '패션 감각이 뛰어나요.', 'Có gu thời trang nổi bật.'),
  ('4A-L1', '4A', '리더십', 'ri-deo-sip', 'Khả năng lãnh đạo', 'Danh từ', '리더십이 있어서 팀장을 맡았어요.', 'Vì có khả năng lãnh đạo nên đã đảm nhận trưởng nhóm.'),
  ('4A-L1', '4A', '말을 잘하다', 'ma-reul jal-ha-da', 'Nói giỏi / ăn nói tốt', 'Cụm động từ', '말을 잘해서 발표를 잘해요.', 'Vì ăn nói tốt nên thuyết trình tốt.'),
  ('4A-L1', '4A', '선택하다', 'seon-tae-ka-da', 'Lựa chọn', 'Động từ', '자신에게 맞는 진로를 선택하세요.', 'Hãy lựa chọn định hướng phù hợp với bản thân.'),
  ('4A-L1', '4A', '전공하다', 'jeon-gong-ha-da', 'Học chuyên ngành / chuyên ngành', 'Động từ', '대학교에서 경영학을 전공했어요.', 'Tôi đã học chuyên ngành quản trị kinh doanh ở đại học.'),
  ('4A-L1', '4A', '앞두다', 'ap-ttu-da', 'Sắp đối mặt / trước mắt', 'Động từ', '졸업을 앞두고 진로를 고민하고 있어요.', 'Trước khi tốt nghiệp, tôi đang suy nghĩ về định hướng nghề nghiệp.'),
  ('4A-L1', '4A', '음가', 'eum-kka', 'Âm trị / giá trị âm thanh', 'Danh từ', '한글 자모의 음가를 정확히 알아야 해요.', 'Phải biết chính xác âm trị của chữ cái Hangeul.'),
  ('4A-L1', '4A', '프로그램', 'peu-ro-geu-raem', 'Chương trình', 'Danh từ', '진로 프로그램에 참여했어요.', 'Tôi đã tham gia chương trình định hướng nghề nghiệp.'),
  ('4A-L1', '4A', '신문방송학과', 'sin-mun-bang-song-hak-kkwa', 'Khoa báo chí và truyền thông', 'Danh từ', '신문방송학과에 진학하고 싶어요.', 'Tôi muốn học tiếp lên khoa báo chí và truyền thông.'),
  ('4A-L1', '4A', '진학하다', 'jin-ha-ka-da', 'Học tiếp / học lên', 'Động từ', '졸업 후 대학원에 진학할 거예요.', 'Sau khi tốt nghiệp tôi sẽ học tiếp lên cao học.'),
  ('4A-L1', '4A', '관련되다', 'gwal-lyeon-doe-da', 'Có liên quan', 'Động từ', '이 일은 제 전공과 관련되어 있어요.', 'Công việc này có liên quan đến chuyên ngành của tôi.'),
  ('4A-L1', '4A', '큰일이다', 'keun-i-ri-da', 'Xảy ra việc lớn / gay go', 'Biểu hiện', '시험 준비를 못 해서 큰일이에요.', 'Tôi chưa chuẩn bị thi nên gay go rồi.'),
  ('4A-L1', '4A', '집중하다', 'jip-jjung-ha-da', 'Tập trung', 'Động từ', '수업에 집중해야 해요.', 'Phải tập trung vào giờ học.'),
  ('4A-L1', '4A', '그만두다', 'geu-man-du-da', 'Nghỉ / thôi làm', 'Động từ', '적성에 맞지 않아서 일을 그만두었어요.', 'Vì không phù hợp với năng khiếu nên tôi đã nghỉ việc.'),
  ('4A-L1', '4A', '도움', 'do-um', 'Sự giúp đỡ', 'Danh từ', '선생님의 도움이 필요해요.', 'Tôi cần sự giúp đỡ của giáo viên.'),
  ('4A-L1', '4A', '늘리다', 'neul-li-da', 'Tăng lên / làm tăng', 'Động từ', '경험을 늘리기 위해 인턴을 했어요.', 'Tôi đã thực tập để tăng kinh nghiệm.'),
  ('4A-L1', '4A', '돈을 내다', 'do-neul nae-da', 'Trả tiền / nộp tiền', 'Cụm động từ', '프로그램 참가비로 돈을 냈어요.', 'Tôi đã nộp tiền phí tham gia chương trình.'),
  ('4A-L1', '4A', '거절당하다', 'geo-jeol-dang-ha-da', 'Bị từ chối', 'Động từ', '지원했지만 거절당했어요.', 'Tôi đã ứng tuyển nhưng bị từ chối.'),
  ('4A-L1', '4A', '두렵다', 'du-ryeop-tta', 'Lo sợ / đáng sợ', 'Tính từ', '새로운 일을 시작하는 것이 두려워요.', 'Tôi lo sợ việc bắt đầu công việc mới.'),
  ('4A-L1', '4A', '법과대학', 'beop-kkwa-dae-hak', 'Trường đại học luật', 'Danh từ', '법과대학에 진학하고 싶어요.', 'Tôi muốn học tiếp lên trường đại học luật.'),
  ('4A-L1', '4A', '기획하다', 'gi-hoe-ka-da', 'Lập kế hoạch / lên kế hoạch', 'Động từ', '새 프로그램을 기획하고 있어요.', 'Tôi đang lên kế hoạch cho chương trình mới.'),
  ('4A-L1', '4A', '여행객', 'yeo-haeng-gaek', 'Khách du lịch', 'Danh từ', '여행객에게 길을 안내했어요.', 'Tôi đã chỉ đường cho khách du lịch.'),
  ('4A-L1', '4A', '여행 가이드', 'yeo-haeng ga-i-deu', 'Hướng dẫn viên du lịch', 'Danh từ', '여행 가이드가 되고 싶어요.', 'Tôi muốn trở thành hướng dẫn viên du lịch.'),
  ('4A-L1', '4A', '서비스', 'seo-bi-seu', 'Dịch vụ', 'Danh từ', '서비스 업무에 관심이 있어요.', 'Tôi quan tâm đến công việc dịch vụ.'),
  ('4A-L1', '4A', '업무', 'eom-mu', 'Công việc / nghiệp vụ', 'Danh từ', '업무를 빨리 배워야 해요.', 'Phải học công việc nhanh.'),
  ('4A-L1', '4A', '항공사', 'hang-gong-sa', 'Hãng hàng không', 'Danh từ', '항공사에서 근무하고 싶어요.', 'Tôi muốn làm việc ở hãng hàng không.'),
  ('4A-L1', '4A', '근무하다', 'geun-mu-ha-da', 'Làm việc', 'Động từ', '저는 항공사에서 근무해요.', 'Tôi làm việc ở hãng hàng không.'),
  ('4A-L1', '4A', '승객', 'seung-gaek', 'Hành khách', 'Danh từ', '승객에게 친절하게 안내했어요.', 'Tôi đã hướng dẫn hành khách một cách thân thiện.'),
  ('4A-L1', '4A', '승무원', 'seung-mu-won', 'Tiếp viên', 'Danh từ', '승무원이 되는 것이 꿈이에요.', 'Ước mơ của tôi là trở thành tiếp viên.'),
  ('4A-L1', '4A', '졸업을 앞두다', 'jo-reo-beul ap-ttu-da', 'Sắp tốt nghiệp', 'Cụm động từ', '졸업을 앞두고 진로를 고민해요.', 'Sắp tốt nghiệp nên tôi đang suy nghĩ về định hướng nghề nghiệp.'),
  ('4A-L1', '4A', '~을 선택하다', 'eul seon-tae-ka-da', 'Lựa chọn ~', 'Cấu trúc', '저는 항공사 취업을 선택했어요.', 'Tôi đã lựa chọn xin việc ở hãng hàng không.'),
  ('4A-L1', '4A', '활발하다', 'hwal-bal-ha-da', 'Hoạt bát / sôi nổi', 'Tính từ', '활발한 성격이라서 사람들을 잘 만나요.', 'Vì tính cách hoạt bát nên tôi gặp gỡ mọi người tốt.');

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L1', '4A', '~기에 앞서 (Trước khi...)', 'B2', 'Động từ + 기에 앞서 = trước khi làm một việc quan trọng. Dùng trang trọng hơn ~기 전에, thường đi với chuẩn bị, lựa chọn, quyết định.', 'Có thể hiểu đơn giản là “trước khi...”, nhưng sắc thái trang trọng hơn.')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('진로를 선택하기에 앞서 자신의 적성을 알아야 해요.', 'Trước khi lựa chọn định hướng nghề nghiệp, cần biết năng khiếu của bản thân.'),
  ('전공을 정하기에 앞서 여러 분야를 알아보세요.', 'Trước khi chọn chuyên ngành, hãy tìm hiểu nhiều lĩnh vực.'),
  ('취업을 준비하기에 앞서 필요한 능력을 확인했어요.', 'Trước khi chuẩn bị xin việc, tôi đã kiểm tra những năng lực cần thiết.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L1', '4A', '~을/를 통해 (Thông qua...)', 'B1+', 'Danh từ + 을/를 통해 = thông qua một cách thức, kinh nghiệm hoặc phương tiện nào đó.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('상담을 통해 제 적성을 알게 되었어요.', 'Thông qua buổi tư vấn, tôi đã biết được năng khiếu của mình.'),
  ('인턴 경험을 통해 업무 능력을 늘렸어요.', 'Thông qua kinh nghiệm thực tập, tôi đã nâng cao năng lực làm việc.'),
  ('여행 가이드 일을 통해 많은 여행객을 만났어요.', 'Thông qua công việc hướng dẫn viên du lịch, tôi đã gặp nhiều khách du lịch.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L1', '4A', '~에도 불구하고 (Mặc dù... nhưng...)', 'B2', 'Danh từ/Mệnh đề + 에도 불구하고 = mặc dù có tình huống bất lợi nhưng kết quả vẫn xảy ra trái với dự đoán.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('어려움에도 불구하고 꿈을 포기하지 않았어요.', 'Mặc dù gặp khó khăn nhưng tôi đã không từ bỏ ước mơ.'),
  ('부모님의 반대에도 불구하고 신문방송학과에 진학했어요.', 'Mặc dù bố mẹ phản đối nhưng tôi đã học tiếp lên khoa báo chí và truyền thông.'),
  ('거절당했음에도 불구하고 다시 지원했어요.', 'Mặc dù bị từ chối nhưng tôi đã ứng tuyển lại.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L1', '4A', '~(으)ㄹ수록 (Càng... càng...)', 'B1+', 'Động từ/Tính từ + (으)ㄹ수록 = càng làm/càng như thế thì mức độ hoặc kết quả càng thay đổi theo.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('생각할수록 이 일이 제 적성에 맞는 것 같아요.', 'Càng nghĩ tôi càng thấy công việc này phù hợp với năng khiếu của mình.'),
  ('연습할수록 음감이 좋아졌어요.', 'Càng luyện tập thì cảm âm càng tốt hơn.'),
  ('상담할수록 진로가 분명해졌어요.', 'Càng trao đổi tư vấn thì định hướng nghề nghiệp càng rõ ràng.')
) AS ex(korean, vietnamese);

INSERT INTO seoul_dialogue (lesson_id, speaker, text, translation)
VALUES
  ('4A-L1', '민수', '졸업을 앞두고 진로를 선택하기가 정말 어려워요.', 'Sắp tốt nghiệp rồi nên việc lựa chọn định hướng nghề nghiệp thật sự khó.'),
  ('4A-L1', '선생님', '진로를 선택하기에 앞서 자신의 적성과 능력을 먼저 알아보는 것이 좋아요.', 'Trước khi chọn hướng đi, em nên tìm hiểu năng khiếu và năng lực của bản thân trước.'),
  ('4A-L1', '민수', '저는 사람들을 만나는 일을 좋아하고 성격도 활발한 편이에요.', 'Em thích công việc gặp gỡ mọi người và tính cách cũng khá hoạt bát.'),
  ('4A-L1', '선생님', '그렇다면 상담을 통해 서비스 업무나 여행 가이드 일을 알아보는 것도 좋겠네요.', 'Vậy thì thông qua tư vấn, em thử tìm hiểu công việc dịch vụ hoặc hướng dẫn viên du lịch cũng tốt.'),
  ('4A-L1', '민수', '생각할수록 항공사에서 근무하는 일이 제 적성에 맞는 것 같아요.', 'Càng nghĩ em càng thấy công việc làm ở hãng hàng không phù hợp với năng khiếu của mình.');

-- 4A-L2: 건강한 삶
DELETE FROM seoul_dialogue WHERE lesson_id = '4A-L2';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4A-L2');
DELETE FROM seoul_grammar WHERE lesson_id = '4A-L2';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4A-L2';

INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES ('4A-L2', '4A', 2, '건강한 삶', 'Cuộc sống khỏe mạnh', ARRAY['Nói về triệu chứng cơ thể', 'Học từ vựng về sức khỏe và điều trị', 'Trao đổi về thói quen sống lành mạnh']::text[], '건강 상담 (Tư vấn sức khỏe)', 'Khi nói về sức khỏe bằng tiếng Hàn, người Hàn thường mô tả triệu chứng cụ thể như 눈이 침침하다, 목이 뻣뻣하다, 속이 거북하다. Ngoài bệnh viện Tây y, 한의원 (phòng khám Đông y) cũng là lựa chọn phổ biến để châm cứu, hơ ngải cứu hoặc uống 한약.')
ON CONFLICT (id) DO UPDATE SET
  book_id = EXCLUDED.book_id,
  lesson_number = EXCLUDED.lesson_number,
  title = EXCLUDED.title,
  title_vi = EXCLUDED.title_vi,
  objectives = EXCLUDED.objectives,
  dialogue_title = EXCLUDED.dialogue_title,
  cultural_tip = EXCLUDED.cultural_tip;

INSERT INTO seoul_vocabulary (lesson_id, book_id, korean, pronunciation, vietnamese, part_of_speech, example, example_vi)
VALUES
  ('4A-L2', '4A', '증상', 'jeung-sang', 'Triệu chứng', 'Danh từ', '감기 증상이 있어요.', 'Tôi có triệu chứng cảm cúm.'),
  ('4A-L2', '4A', '과', 'gwa', 'Khoa / chuyên khoa', 'Danh từ', '내과에 가야 해요.', 'Tôi phải đến khoa nội.'),
  ('4A-L2', '4A', '눈이 침침하다', 'nu-ni chim-chim-ha-da', 'Mắt bị mờ, khó nhìn', 'Cụm tính từ', '요즘 눈이 침침해요.', 'Dạo này mắt tôi bị mờ.'),
  ('4A-L2', '4A', '목이 뻣뻣하다', 'mo-gi ppeot-ppeo-ta-da', 'Cổ bị cứng / cứng cổ', 'Cụm tính từ', '아침에 목이 뻣뻣해요.', 'Buổi sáng cổ tôi bị cứng.'),
  ('4A-L2', '4A', '목이 따끔거리다', 'mo-gi tta-kkeum-geo-ri-da', 'Rát cổ', 'Cụm động từ', '목이 따끔거려서 물을 마셨어요.', 'Vì rát cổ nên tôi đã uống nước.'),
  ('4A-L2', '4A', '속이 거북하다', 'so-gi geo-bu-ka-da', 'Khó chịu trong bụng', 'Cụm tính từ', '과식해서 속이 거북해요.', 'Vì ăn quá nhiều nên bụng khó chịu.'),
  ('4A-L2', '4A', '가슴이 답답하다', 'ga-seu-mi dap-tta-pa-da', 'Tức ngực / khó thở, bức bối', 'Cụm tính từ', '가슴이 답답해서 병원에 갔어요.', 'Vì tức ngực nên tôi đã đi bệnh viện.'),
  ('4A-L2', '4A', '쓰리다', 'sseu-ri-da', 'Đau rát / xót', 'Tính từ', '속이 쓰려요.', 'Tôi bị đau rát dạ dày.'),
  ('4A-L2', '4A', '붓다', 'but-tta', 'Sưng', 'Động từ', '발목이 부었어요.', 'Cổ chân bị sưng.'),
  ('4A-L2', '4A', '막히다', 'ma-ki-da', 'Bị tắc', 'Động từ', '코가 막혔어요.', 'Mũi bị nghẹt.'),
  ('4A-L2', '4A', '가렵다', 'ga-ryeop-tta', 'Ngứa', 'Tính từ', '피부가 가려워요.', 'Da bị ngứa.'),
  ('4A-L2', '4A', '저리다', 'jeo-ri-da', 'Tê / đau buốt', 'Động từ', '다리가 저려요.', 'Chân tôi bị tê.'),
  ('4A-L2', '4A', '과로', 'gwa-ro', 'Làm việc quá sức', 'Danh từ', '과로로 병이 났어요.', 'Tôi bị bệnh do làm việc quá sức.'),
  ('4A-L2', '4A', '과식', 'gwa-sik', 'Ăn quá nhiều', 'Danh từ', '과식은 건강에 좋지 않아요.', 'Ăn quá nhiều không tốt cho sức khỏe.'),
  ('4A-L2', '4A', '과음', 'gwa-eum', 'Uống quá nhiều rượu', 'Danh từ', '과음하지 마세요.', 'Đừng uống quá nhiều rượu.'),
  ('4A-L2', '4A', '과속', 'gwa-sok', 'Chạy quá tốc độ', 'Danh từ', '과속은 위험해요.', 'Chạy quá tốc độ rất nguy hiểm.'),
  ('4A-L2', '4A', '과소비', 'gwa-so-bi', 'Tiêu dùng quá mức', 'Danh từ', '과소비를 줄여야 해요.', 'Phải giảm tiêu dùng quá mức.'),
  ('4A-L2', '4A', '질', 'jil', 'Chất lượng', 'Danh từ', '삶의 질이 중요해요.', 'Chất lượng cuộc sống rất quan trọng.'),
  ('4A-L2', '4A', '예방하다', 'ye-bang-ha-da', 'Phòng ngừa / đề phòng', 'Động từ', '질병을 예방해야 해요.', 'Phải phòng ngừa bệnh tật.'),
  ('4A-L2', '4A', '치료하다', 'chi-ryo-ha-da', 'Điều trị', 'Động từ', '병을 치료하고 있어요.', 'Tôi đang điều trị bệnh.'),
  ('4A-L2', '4A', '휴가철', 'hyu-ga-cheol', 'Mùa nghỉ lễ', 'Danh từ', '휴가철에는 사람이 많아요.', 'Vào mùa nghỉ lễ có nhiều người.'),
  ('4A-L2', '4A', '후식', 'hu-sik', 'Món tráng miệng', 'Danh từ', '후식으로 과일을 먹었어요.', 'Tôi ăn trái cây làm món tráng miệng.'),
  ('4A-L2', '4A', '고급스럽다', 'go-geup-sseu-reop-tta', 'Sang trọng / cao cấp', 'Tính từ', '식당 분위기가 고급스러워요.', 'Không khí nhà hàng rất sang trọng.'),
  ('4A-L2', '4A', '휴식', 'hyu-sik', 'Nghỉ ngơi', 'Danh từ', '충분한 휴식이 필요해요.', 'Cần nghỉ ngơi đầy đủ.'),
  ('4A-L2', '4A', '약속어음', 'yak-sso-geo-eum', 'Giấy hẹn thanh toán / kỳ phiếu', 'Danh từ', '약속어음을 발행했어요.', 'Đã phát hành giấy hẹn thanh toán.'),
  ('4A-L2', '4A', '낙지볶음', 'nak-jji-bo-kkeum', 'Bạch tuộc xào cay', 'Danh từ', '낙지볶음을 먹었어요.', 'Tôi đã ăn bạch tuộc xào cay.'),
  ('4A-L2', '4A', '허리를 펴다', 'heo-ri-reul pyeo-da', 'Duỗi thẳng lưng', 'Cụm động từ', '허리를 펴고 앉으세요.', 'Hãy ngồi duỗi thẳng lưng.'),
  ('4A-L2', '4A', '곱창', 'gop-chang', 'Lòng nướng', 'Danh từ', '곱창을 좋아해요.', 'Tôi thích lòng nướng.'),
  ('4A-L2', '4A', '즐겨 입다', 'jeul-gyeo ip-tta', 'Thường mặc / hay mặc', 'Cụm động từ', '편한 옷을 즐겨 입어요.', 'Tôi thường mặc quần áo thoải mái.'),
  ('4A-L2', '4A', '무리하다', 'mu-ri-ha-da', 'Quá sức', 'Động từ', '몸이 아프면 무리하지 마세요.', 'Nếu cơ thể đau thì đừng quá sức.'),
  ('4A-L2', '4A', '자꾸만', 'ja-kku-man', 'Cứ liên tục', 'Trạng từ', '자꾸만 기침이 나요.', 'Tôi cứ liên tục ho.'),
  ('4A-L2', '4A', '엄살', 'eom-sal', 'Làm quá / giả vờ đau', 'Danh từ', '엄살이 아니에요.', 'Không phải là làm quá đâu.'),
  ('4A-L2', '4A', '온몸', 'on-mom', 'Toàn thân', 'Danh từ', '온몸이 아파요.', 'Toàn thân tôi đau.'),
  ('4A-L2', '4A', '손톱을 깨물다', 'son-to-beul kkae-mul-da', 'Cắn móng tay', 'Cụm động từ', '손톱을 깨무는 습관이 있어요.', 'Tôi có thói quen cắn móng tay.'),
  ('4A-L2', '4A', '툭하면 화를 내다', 'tu-ka-myeon hwa-reul nae-da', 'Hễ một chút là nổi giận', 'Cụm động từ', '그는 툭하면 화를 내요.', 'Anh ấy hễ một chút là nổi giận.'),
  ('4A-L2', '4A', '늦잠을 자다', 'neut-jja-meul ja-da', 'Ngủ dậy muộn', 'Cụm động từ', '주말마다 늦잠을 자요.', 'Cuối tuần nào tôi cũng ngủ dậy muộn.'),
  ('4A-L2', '4A', '말하면서 다른 사람을 치다', 'ma-ra-myeon-seo da-reun sa-ra-meul chi-da', 'Vừa nói vừa đánh/chạm người khác', 'Cụm động từ', '말하면서 다른 사람을 치면 실례예요.', 'Vừa nói vừa chạm vào người khác là bất lịch sự.'),
  ('4A-L2', '4A', '불규칙하다', 'bul-gyu-chi-ka-da', 'Bất quy tắc / không đều đặn', 'Tính từ', '생활이 불규칙해요.', 'Sinh hoạt không đều đặn.'),
  ('4A-L2', '4A', '후회하다', 'hu-hoe-ha-da', 'Hối hận', 'Động từ', '과음한 것을 후회했어요.', 'Tôi đã hối hận vì uống quá nhiều.'),
  ('4A-L2', '4A', '툭하면', 'tu-ka-myeon', 'Hễ một chút là / thường xuyên', 'Trạng từ', '툭하면 감기에 걸려요.', 'Hễ một chút là tôi bị cảm.'),
  ('4A-L2', '4A', '사람을 치다', 'sa-ra-meul chi-da', 'Đánh/chạm vào người khác', 'Cụm động từ', '사람을 치면 안 돼요.', 'Không được đánh/chạm vào người khác.'),
  ('4A-L2', '4A', '간암', 'ga-nam', 'Ung thư gan', 'Danh từ', '과음은 간암을 유발할 수 있어요.', 'Uống rượu quá nhiều có thể gây ung thư gan.'),
  ('4A-L2', '4A', '직업', 'ji-geop', 'Nghề nghiệp', 'Danh từ', '직업에 따라 건강 관리가 달라요.', 'Việc quản lý sức khỏe khác nhau tùy nghề nghiệp.'),
  ('4A-L2', '4A', '발생률', 'bal-ssaeng-nyul', 'Tỉ lệ phát sinh', 'Danh từ', '질병 발생률이 높아졌어요.', 'Tỉ lệ phát sinh bệnh đã tăng.'),
  ('4A-L2', '4A', '알코올 중독', 'al-ko-ol jung-dok', 'Nghiện rượu', 'Danh từ', '알코올 중독은 치료가 필요해요.', 'Nghiện rượu cần được điều trị.'),
  ('4A-L2', '4A', '유발하다', 'yu-bal-ha-da', 'Gây ra / dẫn đến', 'Động từ', '흡연은 폐암을 유발해요.', 'Hút thuốc gây ung thư phổi.'),
  ('4A-L2', '4A', '숨을 쉬다', 'su-meul swi-da', 'Thở', 'Cụm động từ', '숨을 깊게 쉬어 보세요.', 'Hãy thử thở sâu.'),
  ('4A-L2', '4A', '적다', 'jeok-tta', 'Viết / ghi lại', 'Động từ', '증상을 종이에 적으세요.', 'Hãy ghi triệu chứng ra giấy.'),
  ('4A-L2', '4A', '놀이 기구', 'no-ri gi-gu', 'Thiết bị trò chơi / trò chơi cảm giác mạnh', 'Danh từ', '놀이 기구를 탔어요.', 'Tôi đã đi trò chơi ở công viên.'),
  ('4A-L2', '4A', '놀이공원', 'no-ri-gong-won', 'Công viên trò chơi', 'Danh từ', '놀이공원에 갔어요.', 'Tôi đã đi công viên trò chơi.'),
  ('4A-L2', '4A', '특식', 'teuk-ssik', 'Bữa ăn đặc biệt', 'Danh từ', '오늘은 특식이 나와요.', 'Hôm nay có bữa ăn đặc biệt.'),
  ('4A-L2', '4A', '풀코스', 'pul-ko-seu', 'Trọn gói / full course', 'Danh từ', '풀코스 마사지를 받았어요.', 'Tôi đã nhận gói massage trọn gói.'),
  ('4A-L2', '4A', '헬스클럽', 'hel-sseu-keul-leop', 'Câu lạc bộ thể hình', 'Danh từ', '헬스클럽에 등록했어요.', 'Tôi đã đăng ký câu lạc bộ thể hình.'),
  ('4A-L2', '4A', '최고급', 'choe-go-geup', 'Cao cấp nhất', 'Danh từ', '최고급 서비스를 제공합니다.', 'Cung cấp dịch vụ cao cấp nhất.'),
  ('4A-L2', '4A', '오일', 'o-il', 'Dầu', 'Danh từ', '마사지 오일을 사용해요.', 'Sử dụng dầu massage.'),
  ('4A-L2', '4A', '마사지', 'ma-sa-ji', 'Mát xa', 'Danh từ', '마사지를 받으면 피로가 풀려요.', 'Nếu được massage thì mệt mỏi được giải tỏa.'),
  ('4A-L2', '4A', '과일 바구니', 'gwa-il ba-gu-ni', 'Giỏ trái cây', 'Danh từ', '과일 바구니를 선물했어요.', 'Tôi đã tặng giỏ trái cây.'),
  ('4A-L2', '4A', '증정', 'jeung-jeong', 'Biếu tặng / tặng kèm', 'Danh từ', '선착순으로 선물을 증정합니다.', 'Tặng quà theo thứ tự đăng ký trước.'),
  ('4A-L2', '4A', '명상', 'myeong-sang', 'Thiền', 'Danh từ', '명상은 마음 건강에 좋아요.', 'Thiền tốt cho sức khỏe tinh thần.'),
  ('4A-L2', '4A', '사찰', 'sa-chal', 'Chùa', 'Danh từ', '사찰에서 명상을 했어요.', 'Tôi đã thiền ở chùa.'),
  ('4A-L2', '4A', '다도', 'da-do', 'Trà đạo', 'Danh từ', '다도 체험을 했어요.', 'Tôi đã trải nghiệm trà đạo.'),
  ('4A-L2', '4A', '체험', 'che-heom', 'Trải nghiệm', 'Danh từ', '건강식 체험 프로그램이 있어요.', 'Có chương trình trải nghiệm món ăn lành mạnh.'),
  ('4A-L2', '4A', '잡곡밥', 'jap-kkok-ppap', 'Cơm ngũ cốc', 'Danh từ', '잡곡밥은 건강에 좋아요.', 'Cơm ngũ cốc tốt cho sức khỏe.'),
  ('4A-L2', '4A', '건강식', 'geon-gang-sik', 'Thức ăn lành mạnh / dinh dưỡng', 'Danh từ', '건강식을 먹으려고 해요.', 'Tôi định ăn thức ăn lành mạnh.'),
  ('4A-L2', '4A', '버섯', 'beo-seot', 'Nấm', 'Danh từ', '버섯을 넣고 국을 끓였어요.', 'Tôi cho nấm vào nấu canh.'),
  ('4A-L2', '4A', '흡연', 'heu-byeon', 'Hút thuốc', 'Danh từ', '흡연은 건강에 해로워요.', 'Hút thuốc có hại cho sức khỏe.'),
  ('4A-L2', '4A', '음주', 'eum-ju', 'Uống rượu', 'Danh từ', '음주 후에는 운전하지 마세요.', 'Sau khi uống rượu đừng lái xe.'),
  ('4A-L2', '4A', '경고', 'gyeong-go', 'Cảnh báo', 'Danh từ', '건강 경고를 잘 읽어 보세요.', 'Hãy đọc kỹ cảnh báo sức khỏe.'),
  ('4A-L2', '4A', '지나치다', 'ji-na-chi-da', 'Quá mức / đi qua', 'Động từ', '지나친 음주는 위험해요.', 'Uống rượu quá mức rất nguy hiểm.'),
  ('4A-L2', '4A', '폐암', 'pye-am', 'Ung thư phổi', 'Danh từ', '흡연은 폐암의 원인이 될 수 있어요.', 'Hút thuốc có thể trở thành nguyên nhân gây ung thư phổi.'),
  ('4A-L2', '4A', '각종', 'gak-jjong', 'Các loại', 'Định từ', '각종 질병을 예방해야 해요.', 'Phải phòng ngừa các loại bệnh.'),
  ('4A-L2', '4A', '질병', 'jil-byeong', 'Bệnh tật', 'Danh từ', '질병을 예방하는 습관이 중요해요.', 'Thói quen phòng ngừa bệnh tật rất quan trọng.'),
  ('4A-L2', '4A', '병들다', 'byeong-deul-da', 'Mắc bệnh / trở nên bệnh tật', 'Động từ', '몸이 병들기 전에 관리해야 해요.', 'Phải chăm sóc trước khi cơ thể mắc bệnh.'),
  ('4A-L2', '4A', '엑스레이', 'ek-sseu-re-i', 'Chụp X-quang', 'Danh từ', '엑스레이를 찍었어요.', 'Tôi đã chụp X-quang.'),
  ('4A-L2', '4A', '침을 맞는다', 'chi-meul man-neun-da', 'Được châm cứu', 'Cụm động từ', '한의원에서 침을 맞는다.', 'Được châm cứu ở phòng khám Đông y.'),
  ('4A-L2', '4A', '뜸을 뜹니다', 'tteu-meul tteum-ni-da', 'Hơ/ngải cứu trị liệu', 'Cụm động từ', '한의원에서 뜸을 뜹니다.', 'Hơ ngải cứu trị liệu ở phòng khám Đông y.'),
  ('4A-L2', '4A', '한약을 먹습니다', 'ha-nya-geul meok-sseum-ni-da', 'Uống thuốc Bắc/thuốc Đông y', 'Cụm động từ', '몸이 약해서 한약을 먹습니다.', 'Vì cơ thể yếu nên uống thuốc Đông y.'),
  ('4A-L2', '4A', '롤러코스터', 'rol-leo-ko-seu-teo', 'Tàu lượn siêu tốc', 'Danh từ', '롤러코스터를 탔어요.', 'Tôi đã đi tàu lượn siêu tốc.'),
  ('4A-L2', '4A', '딱 질색이다', 'ttak jil-ssae-gi-da', 'Cực kỳ ghét / rất sợ', 'Biểu hiện', '저는 높은 곳이 딱 질색이에요.', 'Tôi cực kỳ sợ nơi cao.'),
  ('4A-L2', '4A', '높이', 'no-pi', 'Độ cao', 'Danh từ', '높이가 너무 높아요.', 'Độ cao quá cao.'),
  ('4A-L2', '4A', '똑 떨어지다', 'ttok tteo-reo-ji-da', 'Rơi thẳng xuống / rơi phịch xuống', 'Cụm động từ', '놀이 기구가 똑 떨어지는 것 같았어요.', 'Trò chơi như rơi thẳng xuống vậy.'),
  ('4A-L2', '4A', '빙글빙글 돌다', 'bing-geul-bing-geul dol-da', 'Quay vòng vòng', 'Cụm động từ', '놀이 기구가 빙글빙글 돌아요.', 'Trò chơi quay vòng vòng.'),
  ('4A-L2', '4A', '먼지', 'meon-ji', 'Bụi', 'Danh từ', '먼지가 많아서 목이 아파요.', 'Vì nhiều bụi nên cổ họng đau.'),
  ('4A-L2', '4A', '꽃가루가 날리다', 'kkot-kka-ru-ga nal-li-da', 'Phấn hoa bay', 'Cụm động từ', '봄에는 꽃가루가 많이 날려요.', 'Vào mùa xuân phấn hoa bay nhiều.'),
  ('4A-L2', '4A', '발목', 'bal-mok', 'Cổ chân', 'Danh từ', '발목을 다쳤어요.', 'Tôi bị thương ở cổ chân.'),
  ('4A-L2', '4A', '삐다', 'ppi-da', 'Bong gân / trật', 'Động từ', '발목을 삐었어요.', 'Tôi bị bong gân cổ chân.'),
  ('4A-L2', '4A', '멍이 들다', 'meong-i deul-da', 'Bị bầm tím', 'Cụm động từ', '다리에 멍이 들었어요.', 'Chân bị bầm tím.'),
  ('4A-L2', '4A', '확인하다', 'hwa-gin-ha-da', 'Kiểm tra / xác nhận', 'Động từ', '상태를 확인해 보세요.', 'Hãy kiểm tra tình trạng.'),
  ('4A-L2', '4A', '누르다', 'nu-reu-da', 'Ấn / bấm', 'Động từ', '아픈 곳을 누르지 마세요.', 'Đừng ấn vào chỗ đau.'),
  ('4A-L2', '4A', '뼈', 'ppyeo', 'Xương', 'Danh từ', '뼈에 이상이 없어요.', 'Xương không có vấn đề gì.'),
  ('4A-L2', '4A', '신체검사', 'sin-che-geom-sa', 'Kiểm tra sức khỏe / khám thân thể', 'Danh từ', '신체검사를 받았어요.', 'Tôi đã kiểm tra sức khỏe.'),
  ('4A-L2', '4A', '붕대를 감다', 'bung-dae-reul gam-tta', 'Quấn băng', 'Cụm động từ', '발목에 붕대를 감았어요.', 'Tôi đã quấn băng ở cổ chân.'),
  ('4A-L2', '4A', '깁스를 하다', 'gip-sseu-reul ha-da', 'Bó bột', 'Cụm động từ', '팔에 깁스를 했어요.', 'Tôi đã bó bột ở tay.'),
  ('4A-L2', '4A', '한의원', 'ha-ni-won', 'Phòng khám Đông y', 'Danh từ', '한의원에 갔어요.', 'Tôi đã đến phòng khám Đông y.'),
  ('4A-L2', '4A', '침을 놓다', 'chi-meul no-ta', 'Châm cứu', 'Cụm động từ', '의사가 침을 놓았어요.', 'Bác sĩ đã châm cứu.'),
  ('4A-L2', '4A', '얼음찜질', 'eo-reum-jjim-jil', 'Chườm đá', 'Danh từ', '발목에 얼음찜질을 했어요.', 'Tôi đã chườm đá ở cổ chân.'),
  ('4A-L2', '4A', '한약', 'ha-nyak', 'Thuốc Đông y', 'Danh từ', '한약을 달여 먹어요.', 'Sắc thuốc Đông y để uống.'),
  ('4A-L2', '4A', '민간요법', 'min-gan-nyo-ppeop', 'Phương pháp dân gian', 'Danh từ', '민간요법을 믿는 사람도 있어요.', 'Cũng có người tin phương pháp dân gian.'),
  ('4A-L2', '4A', '생각', 'saeng-gak', 'Suy nghĩ', 'Danh từ', '건강에 대한 생각이 바뀌었어요.', 'Suy nghĩ về sức khỏe đã thay đổi.'),
  ('4A-L2', '4A', '반죽', 'ban-juk', 'Bột nhào / nhào bột', 'Danh từ', '밀가루 반죽을 만들었어요.', 'Tôi đã làm bột nhào.'),
  ('4A-L2', '4A', '약초', 'yak-cho', 'Dược thảo / cây thuốc', 'Danh từ', '약초로 한약을 만들어요.', 'Làm thuốc Đông y bằng dược thảo.'),
  ('4A-L2', '4A', '약을 달이다', 'ya-geul da-ri-da', 'Sắc thuốc', 'Cụm động từ', '한약을 오래 달였어요.', 'Tôi đã sắc thuốc Đông y lâu.'),
  ('4A-L2', '4A', '맥박', 'maek-ppak', 'Mạch đập', 'Danh từ', '맥박을 확인했어요.', 'Tôi đã kiểm tra mạch đập.'),
  ('4A-L2', '4A', '흐리다', 'heu-ri-da', 'Âm u / mờ', 'Tính từ', '날씨가 흐려요.', 'Thời tiết âm u.');

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L2', '4A', '~아/어 보이다 (Trông có vẻ...)', 'B1', 'Tính từ + 아/어 보이다 = nhìn/trông có vẻ như vậy. Dùng khi phán đoán tình trạng qua vẻ ngoài.', 'Không dùng với động từ hành động. Chủ yếu dùng với tính từ chỉ trạng thái.')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('얼굴이 안 좋아 보여요. 어디 아파요?', 'Trông sắc mặt bạn không tốt. Bạn bị đau ở đâu à?'),
  ('눈이 침침해 보여서 안과에 가 봤어요.', 'Vì mắt trông có vẻ mờ nên tôi đã thử đi khoa mắt.'),
  ('몸이 많이 피곤해 보여요. 좀 쉬세요.', 'Trông bạn rất mệt. Hãy nghỉ một chút đi.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L2', '4A', '~도록 하다 (Hãy cố gắng... / Nên...)', 'B1+', 'Động từ + 도록 하다 dùng để khuyên nhủ hoặc yêu cầu người nghe cố gắng thực hiện hành động.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('과로하지 않도록 하세요.', 'Hãy cố gắng đừng làm việc quá sức.'),
  ('술을 지나치게 마시지 않도록 하세요.', 'Hãy cố gắng đừng uống rượu quá mức.'),
  ('증상이 심하면 바로 치료를 받도록 하세요.', 'Nếu triệu chứng nặng thì hãy đi điều trị ngay.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L2', '4A', '~기 위해(서) (Để...)', 'B1', 'Động từ + 기 위해(서) = để làm gì. Dùng để diễn đạt mục đích của hành động.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('질병을 예방하기 위해 규칙적으로 운동해요.', 'Tôi tập thể dục đều đặn để phòng bệnh.'),
  ('건강을 지키기 위해 흡연과 음주를 줄였어요.', 'Tôi đã giảm hút thuốc và uống rượu để giữ sức khỏe.'),
  ('발목을 치료하기 위해 한의원에 갔어요.', 'Tôi đã đến phòng khám Đông y để điều trị cổ chân.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L2', '4A', '~아/어야 하다 (Phải...)', 'A2', 'Động từ + 아/어야 하다 = phải làm gì. Dùng để nói nghĩa vụ, điều cần thiết hoặc lời khuyên mạnh.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('건강한 삶을 위해 충분히 쉬어야 해요.', 'Để có cuộc sống khỏe mạnh thì phải nghỉ ngơi đầy đủ.'),
  ('발목이 부으면 얼음찜질을 해야 해요.', 'Nếu cổ chân bị sưng thì phải chườm đá.'),
  ('폐암을 예방하려면 담배를 끊어야 해요.', 'Nếu muốn phòng ung thư phổi thì phải bỏ thuốc lá.')
) AS ex(korean, vietnamese);

INSERT INTO seoul_dialogue (lesson_id, speaker, text, translation)
VALUES
  ('4A-L2', '의사', '어디가 불편해서 오셨어요?', 'Bạn thấy không thoải mái ở đâu nên đến khám vậy?'),
  ('4A-L2', '환자', '요즘 눈이 침침하고 목이 뻣뻣해요. 가슴도 답답해서 걱정돼요.', 'Dạo này mắt tôi mờ và cổ bị cứng. Ngực cũng tức nên tôi lo lắng.'),
  ('4A-L2', '의사', '과로하지 않도록 하시고 충분히 쉬어야 해요.', 'Bạn hãy cố gắng đừng làm việc quá sức và phải nghỉ ngơi đầy đủ.'),
  ('4A-L2', '환자', '발목도 조금 부었는데 어떻게 해야 해요?', 'Cổ chân tôi cũng hơi sưng thì phải làm thế nào?'),
  ('4A-L2', '의사', '발목이 부으면 얼음찜질을 하고, 증상이 심하면 바로 치료를 받도록 하세요.', 'Nếu cổ chân bị sưng thì hãy chườm đá, nếu triệu chứng nặng thì hãy đi điều trị ngay.');

-- 4A-L3: 스포츠의 세계
DELETE FROM seoul_dialogue WHERE lesson_id = '4A-L3';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4A-L3');
DELETE FROM seoul_grammar WHERE lesson_id = '4A-L3';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4A-L3';

INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES ('4A-L3', '4A', 3, '스포츠의 세계', 'Thế giới thể thao', ARRAY['Nói về thi đấu thể thao', 'Mô tả tình huống thắng bại', 'Học từ vựng về tinh thần thể thao và luật chơi']::text[], '축구 경기 관람 (Xem trận bóng đá)', 'Trong văn hóa xem thể thao ở Hàn Quốc, 응원 (cổ vũ) rất sôi nổi. Khán giả thường mặc áo đội mình yêu thích, hát bài cổ vũ và hô 함성 suốt trận. Tinh thần thể thao nhấn mạnh việc tuân thủ 규칙, thi đấu 정정당당하게 và biết 받아들이다 kết quả.')
ON CONFLICT (id) DO UPDATE SET
  book_id = EXCLUDED.book_id,
  lesson_number = EXCLUDED.lesson_number,
  title = EXCLUDED.title,
  title_vi = EXCLUDED.title_vi,
  objectives = EXCLUDED.objectives,
  dialogue_title = EXCLUDED.dialogue_title,
  cultural_tip = EXCLUDED.cultural_tip;

INSERT INTO seoul_vocabulary (lesson_id, book_id, korean, pronunciation, vietnamese, part_of_speech, example, example_vi)
VALUES
  ('4A-L3', '4A', '운동 경기', 'un-dong gyeong-gi', 'Trận đấu thể thao / môn thi đấu', 'Danh từ', '어제 재미있는 운동 경기를 봤어요.', 'Hôm qua tôi đã xem một trận thể thao thú vị.'),
  ('4A-L3', '4A', '승부와 상황', 'seung-bu-wa sang-hwang', 'Thắng thua và tình huống', 'Cụm danh từ', '승부와 상황에 따라 전략이 달라져요.', 'Chiến thuật thay đổi tùy theo thắng thua và tình huống.'),
  ('4A-L3', '4A', '득점을 하다', 'deuk-jjeo-meul ha-da', 'Ghi điểm', 'Cụm động từ', '후반전에 우리 팀이 득점을 했어요.', 'Ở hiệp hai đội chúng tôi đã ghi điểm.'),
  ('4A-L3', '4A', '승부가 나다', 'seung-bu-ga na-da', 'Phân thắng bại / có kết quả', 'Cụm động từ', '연장전에서 승부가 났어요.', 'Trận đấu đã phân thắng bại ở hiệp phụ.'),
  ('4A-L3', '4A', '승부욕이 강하다', 'seung-bu-yo-gi gang-ha-da', 'Có ý chí chiến thắng mạnh', 'Cụm tính từ', '그 선수는 승부욕이 강해요.', 'Vận động viên đó có ý chí chiến thắng mạnh.'),
  ('4A-L3', '4A', '연장전을 하다', 'yeon-jang-jeo-neul ha-da', 'Đấu hiệp phụ', 'Cụm động từ', '두 팀이 비겨서 연장전을 했어요.', 'Hai đội hòa nên đã đấu hiệp phụ.'),
  ('4A-L3', '4A', '결승전에 진출하다', 'gyeol-sseung-jeo-ne jin-chul-ha-da', 'Tiến vào trận chung kết', 'Cụm động từ', '한국 팀이 결승전에 진출했어요.', 'Đội Hàn Quốc đã tiến vào trận chung kết.'),
  ('4A-L3', '4A', '막상막하이다', 'mak-ssang-ma-ka-i-da', 'Ngang tài ngang sức', 'Tính từ', '두 선수의 실력이 막상막하예요.', 'Thực lực của hai vận động viên ngang tài ngang sức.'),
  ('4A-L3', '4A', '정정당당하다', 'jeong-jeong-dang-dang-ha-da', 'Đường đường chính chính / công bằng', 'Tính từ', '정정당당하게 경기를 해야 해요.', 'Phải thi đấu một cách công bằng.'),
  ('4A-L3', '4A', '자신만만하다', 'ja-sin-man-man-ha-da', 'Rất tự tin', 'Tính từ', '선수들이 자신만만해 보였어요.', 'Các vận động viên trông rất tự tin.'),
  ('4A-L3', '4A', '아슬아슬하다', 'a-seul-a-seul-ha-da', 'Gay cấn / thót tim', 'Tính từ', '경기가 아슬아슬해서 눈을 뗄 수 없었어요.', 'Trận đấu gay cấn đến mức không thể rời mắt.'),
  ('4A-L3', '4A', '흥미진진하다', 'heung-mi-jin-jin-ha-da', 'Rất hấp dẫn / đầy hứng thú', 'Tính từ', '결승전은 정말 흥미진진했어요.', 'Trận chung kết thật sự rất hấp dẫn.'),
  ('4A-L3', '4A', '규칙을 지키다', 'gyu-chi-geul ji-ki-da', 'Tuân thủ luật lệ', 'Cụm động từ', '모든 선수는 규칙을 지켜야 해요.', 'Tất cả vận động viên phải tuân thủ luật lệ.'),
  ('4A-L3', '4A', '반칙을 하다', 'ban-chi-geul ha-da', 'Phạm lỗi / chơi sai luật', 'Cụm động từ', '상대편 선수가 반칙을 했어요.', 'Cầu thủ đối phương đã phạm lỗi.'),
  ('4A-L3', '4A', '경고를 받다', 'gyeong-go-reul bat-tta', 'Nhận cảnh cáo', 'Cụm động từ', '반칙을 해서 경고를 받았어요.', 'Vì phạm lỗi nên đã nhận cảnh cáo.'),
  ('4A-L3', '4A', '퇴장을 당하다', 'toe-jang-eul dang-ha-da', 'Bị đuổi khỏi sân', 'Cụm động từ', '심한 반칙으로 퇴장을 당했어요.', 'Bị đuổi khỏi sân vì phạm lỗi nặng.'),
  ('4A-L3', '4A', '얇다', 'yal-tta', 'Mỏng', 'Tính từ', '얇은 옷을 입고 경기장에 갔어요.', 'Tôi mặc áo mỏng đến sân vận động.'),
  ('4A-L3', '4A', '소용없다', 'so-yong-eop-tta', 'Không có tác dụng / vô ích', 'Tính từ', '이제 후회해도 소용없어요.', 'Bây giờ hối hận cũng vô ích.'),
  ('4A-L3', '4A', '실력 차이가 나다', 'sil-lyeok cha-i-ga na-da', 'Có sự chênh lệch thực lực', 'Cụm động từ', '두 팀은 실력 차이가 많이 났어요.', 'Hai đội có sự chênh lệch thực lực lớn.'),
  ('4A-L3', '4A', '상대편', 'sang-dae-pyeon', 'Phía đối phương / đội đối thủ', 'Danh từ', '상대편 응원이 대단했어요.', 'Cổ vũ của phía đối phương rất tuyệt.'),
  ('4A-L3', '4A', '아쉽다', 'a-swip-tta', 'Đáng tiếc', 'Tính từ', '한 점 차이로 져서 아쉬워요.', 'Thua cách biệt một điểm nên rất đáng tiếc.'),
  ('4A-L3', '4A', '전반전', 'jeon-ban-jeon', 'Hiệp một', 'Danh từ', '전반전에 골을 넣었어요.', 'Đã ghi bàn ở hiệp một.'),
  ('4A-L3', '4A', '축구장', 'chuk-kku-jang', 'Sân bóng đá', 'Danh từ', '친구와 축구장에 갔어요.', 'Tôi đã đi sân bóng đá với bạn.'),
  ('4A-L3', '4A', '관람하다', 'gwal-lam-ha-da', 'Xem / thưởng thức', 'Động từ', '주말에 야구 경기를 관람했어요.', 'Cuối tuần tôi đã xem trận bóng chày.'),
  ('4A-L3', '4A', '내', 'nae', 'Trong / suốt', 'Danh từ phụ thuộc', '경기 내내 함성이 가득했어요.', 'Suốt trận đấu tiếng hò reo vang đầy.'),
  ('4A-L3', '4A', '잠실 야구장', 'jam-sil ya-gu-jang', 'Sân bóng chày Jamsil', 'Danh từ', '잠실 야구장에서 경기를 봤어요.', 'Tôi đã xem trận đấu ở sân bóng chày Jamsil.'),
  ('4A-L3', '4A', '응원하다', 'eung-won-ha-da', 'Cổ vũ', 'Động từ', '우리 팀을 열심히 응원했어요.', 'Tôi đã cổ vũ hết mình cho đội chúng tôi.'),
  ('4A-L3', '4A', '함성', 'ham-seong', 'Tiếng hò reo', 'Danh từ', '관중의 함성이 크게 들렸어요.', 'Nghe thấy tiếng hò reo lớn của khán giả.'),
  ('4A-L3', '4A', '가득하다', 'ga-deu-ka-da', 'Đầy / tràn đầy', 'Tính từ', '경기장이 관중으로 가득했어요.', 'Sân vận động đầy khán giả.'),
  ('4A-L3', '4A', '데이트를 하다', 'de-i-teu-reul ha-da', 'Hẹn hò', 'Cụm động từ', '경기장에서 데이트를 했어요.', 'Chúng tôi đã hẹn hò ở sân vận động.'),
  ('4A-L3', '4A', '다이어트', 'da-i-eo-teu', 'Giảm cân / ăn kiêng', 'Danh từ', '건강을 위해 다이어트를 시작했어요.', 'Tôi bắt đầu giảm cân vì sức khỏe.'),
  ('4A-L3', '4A', '아깝다', 'a-kkap-tta', 'Tiếc / đáng tiếc', 'Tính từ', '마지막 기회를 놓쳐서 아까워요.', 'Bỏ lỡ cơ hội cuối nên thật tiếc.'),
  ('4A-L3', '4A', '역전패하다', 'yeok-jjeon-pae-ha-da', 'Thua ngược', 'Động từ', '우리 팀은 후반전에 역전패했어요.', 'Đội chúng tôi đã thua ngược ở hiệp hai.'),
  ('4A-L3', '4A', '체력이 떨어지다', 'che-ryeo-gi tteo-reo-ji-da', 'Thể lực giảm sút', 'Cụm động từ', '후반전에 체력이 떨어졌어요.', 'Ở hiệp hai thể lực đã giảm sút.'),
  ('4A-L3', '4A', '비기다', 'bi-gi-da', 'Hòa', 'Động từ', '두 팀이 1대 1로 비겼어요.', 'Hai đội hòa 1-1.'),
  ('4A-L3', '4A', '부상당하다', 'bu-sang-dang-ha-da', 'Bị chấn thương', 'Động từ', '선수가 경기 중에 부상당했어요.', 'Vận động viên bị chấn thương trong trận đấu.'),
  ('4A-L3', '4A', '핸드볼', 'haen-deu-bol', 'Bóng ném', 'Danh từ', '핸드볼 경기를 처음 봤어요.', 'Tôi lần đầu xem trận bóng ném.'),
  ('4A-L3', '4A', '세트', 'se-teu', 'Sét / hiệp đấu', 'Danh từ', '첫 세트를 이겼어요.', 'Đã thắng sét đầu tiên.'),
  ('4A-L3', '4A', '지치다', 'ji-chi-da', 'Mệt mỏi / kiệt sức', 'Động từ', '선수들이 많이 지쳤어요.', 'Các vận động viên đã rất mệt.'),
  ('4A-L3', '4A', '심장', 'sim-jang', 'Trái tim', 'Danh từ', '심장이 빨리 뛰었어요.', 'Tim đập nhanh.'),
  ('4A-L3', '4A', '별명', 'byeol-myeong', 'Biệt danh', 'Danh từ', '그 선수의 별명은 황소예요.', 'Biệt danh của vận động viên đó là bò mộng.'),
  ('4A-L3', '4A', '단짝 친구', 'dan-jjak chin-gu', 'Bạn thân', 'Danh từ', '단짝 친구와 축구를 보러 갔어요.', 'Tôi đi xem bóng đá với bạn thân.'),
  ('4A-L3', '4A', '천사', 'cheon-sa', 'Thiên thần', 'Danh từ', '그 선수는 팬들에게 천사라고 불려요.', 'Vận động viên đó được người hâm mộ gọi là thiên thần.'),
  ('4A-L3', '4A', '후반전', 'hu-ban-jeon', 'Hiệp hai', 'Danh từ', '후반전에 경기가 더 흥미진진해졌어요.', 'Ở hiệp hai trận đấu trở nên hấp dẫn hơn.'),
  ('4A-L3', '4A', '골을 넣다', 'go-reul neo-ta', 'Ghi bàn', 'Cụm động từ', '마지막 순간에 골을 넣었어요.', 'Đã ghi bàn ở khoảnh khắc cuối cùng.'),
  ('4A-L3', '4A', '은메달', 'eun-me-dal', 'Huy chương bạc', 'Danh từ', '그 선수는 은메달을 땄어요.', 'Vận động viên đó đã giành huy chương bạc.'),
  ('4A-L3', '4A', '시상대', 'si-sang-dae', 'Bục trao giải', 'Danh từ', '선수들이 시상대에 올랐어요.', 'Các vận động viên đã bước lên bục trao giải.'),
  ('4A-L3', '4A', '억울하다', 'eo-gu-ra-da', 'Oan ức / ấm ức', 'Tính từ', '심판의 판정 때문에 억울했어요.', 'Tôi thấy ấm ức vì quyết định của trọng tài.'),
  ('4A-L3', '4A', '순간', 'sun-gan', 'Khoảnh khắc', 'Danh từ', '골을 넣은 순간 모두가 소리쳤어요.', 'Khoảnh khắc ghi bàn, mọi người đều hét lên.'),
  ('4A-L3', '4A', '일 등을 놓치다', 'il deung-eul no-chi-da', 'Bỏ lỡ vị trí nhất', 'Cụm động từ', '마지막 실수로 일 등을 놓쳤어요.', 'Vì sai lầm cuối cùng nên đã bỏ lỡ vị trí nhất.'),
  ('4A-L3', '4A', '훌륭하다', 'hul-lyung-ha-da', 'Xuất sắc / tuyệt vời', 'Tính từ', '훌륭한 경기를 보여 줬어요.', 'Đã cho thấy một trận đấu xuất sắc.'),
  ('4A-L3', '4A', '최선을 다하다', 'choe-seo-neul da-ha-da', 'Cố gắng hết sức', 'Cụm động từ', '결과보다 최선을 다하는 것이 중요해요.', 'Cố gắng hết sức quan trọng hơn kết quả.'),
  ('4A-L3', '4A', '결과를 받아들이다', 'gyeol-gwa-reul ba-da-deu-ri-da', 'Chấp nhận kết quả', 'Cụm động từ', '선수는 결과를 받아들였어요.', 'Vận động viên đã chấp nhận kết quả.'),
  ('4A-L3', '4A', '바람직하다', 'ba-ram-ji-ka-da', 'Đúng đắn / đáng mong muốn', 'Tính từ', '정정당당한 태도가 바람직해요.', 'Thái độ công bằng là điều đúng đắn.'),
  ('4A-L3', '4A', '스포츠 정신', 'seu-po-cheu jeong-sin', 'Tinh thần thể thao', 'Danh từ', '스포츠 정신을 지키는 것이 중요해요.', 'Giữ tinh thần thể thao là điều quan trọng.'),
  ('4A-L3', '4A', '과정', 'gwa-jeong', 'Quá trình', 'Danh từ', '결과보다 과정이 중요할 때도 있어요.', 'Đôi khi quá trình quan trọng hơn kết quả.'),
  ('4A-L3', '4A', '분명하다', 'bun-myeong-ha-da', 'Rõ ràng', 'Tính từ', '실력 차이가 분명했어요.', 'Sự chênh lệch thực lực rất rõ ràng.'),
  ('4A-L3', '4A', '체격', 'che-gyeok', 'Thể hình / vóc dáng', 'Danh từ', '그 선수는 체격이 좋아요.', 'Vận động viên đó có thể hình tốt.'),
  ('4A-L3', '4A', '길고 짧은 건 대봐야 안다', 'gil-go jjal-beun geon dae-bwa-ya an-da', 'Phải thử mới biết hơn thua', 'Tục ngữ', '길고 짧은 건 대봐야 아니까 경기를 해 봅시다.', 'Phải thử mới biết hơn thua, nên hãy thi đấu thử.'),
  ('4A-L3', '4A', '유리하다', 'yu-ri-ha-da', 'Có lợi / thuận lợi', 'Tính từ', '키가 크면 농구에 유리해요.', 'Nếu cao thì thuận lợi cho bóng rổ.'),
  ('4A-L3', '4A', '기술을 쓰다', 'gi-su-reul sseu-da', 'Sử dụng kỹ thuật', 'Cụm động từ', '상대편을 이기기 위해 기술을 썼어요.', 'Đã sử dụng kỹ thuật để thắng đối thủ.'),
  ('4A-L3', '4A', '구성', 'gu-seong', 'Cấu tạo / thành phần', 'Danh từ', '팀 구성이 좋아요.', 'Thành phần đội hình tốt.'),
  ('4A-L3', '4A', '상품', 'sang-pum', 'Sản phẩm / phần thưởng', 'Danh từ', '우승 상품을 받았어요.', 'Tôi đã nhận phần thưởng vô địch.'),
  ('4A-L3', '4A', '모래판', 'mo-rae-pan', 'Sàn cát / sân đấu cát', 'Danh từ', '씨름 선수들이 모래판에 섰어요.', 'Các vận động viên ssireum đứng trên sàn cát.'),
  ('4A-L3', '4A', '평가를 받다', 'pyeong-ga-reul bat-tta', 'Được đánh giá', 'Cụm động từ', '그 선수는 좋은 평가를 받았어요.', 'Vận động viên đó được đánh giá tốt.'),
  ('4A-L3', '4A', '서울월드컵경기장', 'seo-ul-wol-deu-keop-gyeong-gi-jang', 'Sân vận động Seoul World Cup', 'Danh từ', '서울월드컵경기장에서 축구를 봤어요.', 'Tôi đã xem bóng đá ở sân vận động Seoul World Cup.'),
  ('4A-L3', '4A', '버티다', 'beo-ti-da', 'Chịu đựng / trụ vững', 'Động từ', '선수는 끝까지 버텼어요.', 'Vận động viên đã trụ vững đến cuối.'),
  ('4A-L3', '4A', '균형을 잃다', 'gyun-hyeong-eul il-ta', 'Mất thăng bằng', 'Cụm động từ', '균형을 잃고 넘어졌어요.', 'Mất thăng bằng và ngã.'),
  ('4A-L3', '4A', '당연히', 'dang-yeon-hi', 'Đương nhiên', 'Trạng từ', '당연히 규칙을 지켜야 해요.', 'Đương nhiên phải tuân thủ luật lệ.'),
  ('4A-L3', '4A', '팔씨름', 'pal-ssi-reum', 'Vật tay', 'Danh từ', '친구와 팔씨름을 했어요.', 'Tôi đã vật tay với bạn.'),
  ('4A-L3', '4A', '의미하다', 'ui-mi-ha-da', 'Có nghĩa là / biểu thị', 'Động từ', '무승부는 승부가 나지 않았다는 뜻을 의미해요.', 'Hòa nghĩa là chưa phân thắng bại.'),
  ('4A-L3', '4A', '합치다', 'hap-chi-da', 'Gộp lại / hợp lại', 'Động từ', '두 단어를 합치면 새로운 뜻이 돼요.', 'Nếu gộp hai từ lại thì thành nghĩa mới.'),
  ('4A-L3', '4A', '즉', 'jeuk', 'Tức là / nghĩa là', 'Trạng từ', '무승부, 즉 비긴 경기예요.', 'Là trận hòa, tức là trận đấu bất phân thắng bại.'),
  ('4A-L3', '4A', '뜻', 'tteut', 'Ý nghĩa', 'Danh từ', '이 말의 뜻을 알아요?', 'Bạn biết ý nghĩa của từ này không?'),
  ('4A-L3', '4A', '인원', 'i-nwon', 'Số người', 'Danh từ', '경기에 필요한 인원은 열한 명이에요.', 'Số người cần cho trận đấu là mười một người.'),
  ('4A-L3', '4A', '각각', 'gak-kkak', 'Mỗi / lần lượt', 'Trạng từ', '각각 한 골씩 넣었어요.', 'Mỗi bên ghi một bàn.'),
  ('4A-L3', '4A', '발로 차다', 'bal-lo cha-da', 'Đá bằng chân', 'Cụm động từ', '공을 발로 찼어요.', 'Đã đá bóng bằng chân.'),
  ('4A-L3', '4A', '골문', 'gol-mun', 'Khung thành', 'Danh từ', '공이 골문 안으로 들어갔어요.', 'Bóng đã vào trong khung thành.'),
  ('4A-L3', '4A', '넘겨주다', 'neom-gyeo-ju-da', 'Chuyền / đưa qua', 'Động từ', '공을 같은 팀 선수에게 넘겨줬어요.', 'Đã chuyền bóng cho cầu thủ cùng đội.'),
  ('4A-L3', '4A', '무승부', 'mu-seung-bu', 'Hòa / bất phân thắng bại', 'Danh từ', '경기는 무승부로 끝났어요.', 'Trận đấu kết thúc với tỉ số hòa.'),
  ('4A-L3', '4A', '진행', 'jin-haeng', 'Sự tiến hành / diễn biến', 'Danh từ', '경기 진행이 매끄러웠어요.', 'Diễn biến trận đấu rất trôi chảy.'),
  ('4A-L3', '4A', '종목', 'jong-mok', 'Môn thi đấu / hạng mục', 'Danh từ', '올림픽에는 다양한 종목이 있어요.', 'Olympic có nhiều môn thi đấu đa dạng.'),
  ('4A-L3', '4A', '쓴 맛', 'sseun mat', 'Vị đắng / trải nghiệm cay đắng', 'Danh từ', '패배의 쓴 맛을 봤어요.', 'Đã nếm trải vị đắng của thất bại.'),
  ('4A-L3', '4A', '쓰러뜨리다', 'sseu-reo-tteu-ri-da', 'Làm ngã / đánh bại', 'Động từ', '상대 선수를 쓰러뜨렸어요.', 'Đã làm đối thủ ngã.'),
  ('4A-L3', '4A', '닿다', 'da-ta', 'Chạm tới / chạm vào', 'Động từ', '공이 손에 닿았어요.', 'Bóng đã chạm vào tay.'),
  ('4A-L3', '4A', '깔리다', 'kkal-li-da', 'Được trải / bị đè', 'Động từ', '모래판에는 모래가 깔려 있어요.', 'Trên sàn đấu cát có trải cát.'),
  ('4A-L3', '4A', '손잡이', 'son-ja-bi', 'Tay cầm', 'Danh từ', '손잡이를 잡고 버텼어요.', 'Đã nắm tay cầm và trụ vững.'),
  ('4A-L3', '4A', '황소', 'hwang-so', 'Bò mộng / bò đực', 'Danh từ', '그 선수는 황소처럼 힘이 세요.', 'Vận động viên đó khỏe như bò mộng.'),
  ('4A-L3', '4A', '규모', 'gyu-mo', 'Quy mô', 'Danh từ', '대회 규모가 아주 커요.', 'Quy mô cuộc thi rất lớn.');

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L3', '4A', '~는 바람에 (Vì... nên...)', 'B1+', 'Động từ + 는 바람에 = vì một việc bất ngờ hoặc không mong muốn xảy ra nên dẫn đến kết quả xấu.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('후반전에 체력이 떨어지는 바람에 역전패했어요.', 'Vì thể lực giảm ở hiệp hai nên đã thua ngược.'),
  ('선수가 부상당하는 바람에 경기가 어려워졌어요.', 'Vì cầu thủ bị chấn thương nên trận đấu trở nên khó khăn.'),
  ('반칙을 하는 바람에 경고를 받았어요.', 'Vì phạm lỗi nên đã nhận cảnh cáo.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L3', '4A', '~기는 하지만 (Tuy... nhưng...)', 'B1+', 'Động từ/Tính từ + 기는 하지만 = thừa nhận một sự thật nhưng đưa ra ý trái ngược hoặc bổ sung phía sau.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('상대편이 강하기는 하지만 우리 팀도 자신만만해요.', 'Đối thủ mạnh thật nhưng đội chúng tôi cũng rất tự tin.'),
  ('졌기는 하지만 최선을 다했어요.', 'Thua thật nhưng chúng tôi đã cố gắng hết sức.'),
  ('체격은 작기는 하지만 기술이 좋아요.', 'Thể hình nhỏ thật nhưng kỹ thuật tốt.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L3', '4A', '~다 보면 (Nếu cứ... thì...)', 'B1+', 'Động từ + 다 보면 = nếu tiếp tục làm một việc nào đó thì sẽ dần có kết quả hoặc phát hiện ra điều gì.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('계속 연습하다 보면 실력이 좋아질 거예요.', 'Nếu cứ luyện tập thì thực lực sẽ tốt lên.'),
  ('경기를 많이 관람하다 보면 규칙을 알게 돼요.', 'Nếu xem nhiều trận đấu thì sẽ biết luật.'),
  ('끝까지 응원하다 보면 좋은 순간을 볼 수 있어요.', 'Nếu cổ vũ đến cuối thì có thể thấy khoảnh khắc đẹp.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L3', '4A', '~아/어 보이다 (Trông có vẻ...)', 'B1', 'Tính từ + 아/어 보이다 = trông có vẻ như vậy dựa vào vẻ ngoài hoặc tình huống nhìn thấy.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('선수들이 자신만만해 보여요.', 'Các vận động viên trông có vẻ rất tự tin.'),
  ('경기가 정말 흥미진진해 보여요.', 'Trận đấu trông có vẻ rất hấp dẫn.'),
  ('상대편 선수가 많이 지쳐 보여요.', 'Cầu thủ đối phương trông có vẻ rất mệt.')
) AS ex(korean, vietnamese);

INSERT INTO seoul_dialogue (lesson_id, speaker, text, translation)
VALUES
  ('4A-L3', '지훈', '어제 서울월드컵경기장에서 축구 경기를 관람했어요.', 'Hôm qua tôi đã xem trận bóng đá ở sân vận động Seoul World Cup.'),
  ('4A-L3', '수진', '경기가 어땠어요? 흥미진진했어요?', 'Trận đấu thế nào? Có hấp dẫn không?'),
  ('4A-L3', '지훈', '네, 두 팀 실력이 막상막하라서 정말 아슬아슬했어요.', 'Có, thực lực hai đội ngang tài ngang sức nên thật sự rất gay cấn.'),
  ('4A-L3', '수진', '우리 팀이 이겼어요?', 'Đội mình thắng không?'),
  ('4A-L3', '지훈', '후반전에 골을 넣었지만 마지막 순간에 실점하는 바람에 무승부로 끝났어요.', 'Hiệp hai đã ghi bàn nhưng vì bị thủng lưới ở khoảnh khắc cuối nên kết thúc hòa.'),
  ('4A-L3', '수진', '아쉽지만 선수들이 최선을 다했다면 결과를 받아들이는 것도 스포츠 정신이에요.', 'Đáng tiếc thật, nhưng nếu các cầu thủ đã cố hết sức thì chấp nhận kết quả cũng là tinh thần thể thao.');

-- 4A-L4: 남자와 여자
DELETE FROM seoul_dialogue WHERE lesson_id = '4A-L4';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4A-L4');
DELETE FROM seoul_grammar WHERE lesson_id = '4A-L4';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4A-L4';

INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES ('4A-L4', '4A', 4, '남자와 여자', 'Đàn ông và phụ nữ', ARRAY['Nói về thái độ và sự bất mãn', 'Miêu tả tính cách và quan điểm giữa nam nữ', 'Thảo luận về vai trò, nghề nghiệp và năng lực']::text[], '취향 차이와 말다툼 (Khác biệt sở thích và tranh cãi)', 'Trong tiếng Hàn, các biểu hiện như 남자답다 hay 여성스럽다 thường xuất hiện khi nói về hình ảnh giới tính, nhưng trong giao tiếp hiện đại cần dùng cẩn thận để tránh áp đặt định kiến. Khi có 불만, cách nói 침착하게 의논하다 thường được xem là lịch sự hơn 따지다 hoặc 발끈하다.')
ON CONFLICT (id) DO UPDATE SET
  book_id = EXCLUDED.book_id,
  lesson_number = EXCLUDED.lesson_number,
  title = EXCLUDED.title,
  title_vi = EXCLUDED.title_vi,
  objectives = EXCLUDED.objectives,
  dialogue_title = EXCLUDED.dialogue_title,
  cultural_tip = EXCLUDED.cultural_tip;

INSERT INTO seoul_vocabulary (lesson_id, book_id, korean, pronunciation, vietnamese, part_of_speech, example, example_vi)
VALUES
  ('4A-L4', '4A', '태도와 불만', 'tae-do-wa bul-man', 'Thái độ và sự bất mãn', 'Cụm danh từ', '태도와 불만에 대해 이야기했어요.', 'Chúng tôi đã nói về thái độ và sự bất mãn.'),
  ('4A-L4', '4A', '계획성이 없다', 'gye-hoek-sseong-i eop-tta', 'Không có tính kế hoạch', 'Cụm tính từ', '그는 계획성이 없어서 자주 늦어요.', 'Anh ấy không có tính kế hoạch nên thường xuyên muộn.'),
  ('4A-L4', '4A', '눈치가 없다', 'nun-chi-ga eop-tta', 'Không tinh ý / không biết ý', 'Cụm tính từ', '눈치가 없으면 상대방을 속상하게 할 수 있어요.', 'Nếu không tinh ý thì có thể làm đối phương buồn lòng.'),
  ('4A-L4', '4A', '고집이 세다', 'go-ji-bi se-da', 'Cứng đầu / bướng bỉnh', 'Cụm tính từ', '동생은 고집이 세서 말을 잘 안 들어요.', 'Em tôi cứng đầu nên không mấy khi nghe lời.'),
  ('4A-L4', '4A', '자존심이 강하다', 'ja-jon-si-mi gang-ha-da', 'Có lòng tự trọng cao', 'Cụm tính từ', '자존심이 강해서 사과를 잘 못해요.', 'Vì lòng tự trọng cao nên khó xin lỗi.'),
  ('4A-L4', '4A', '불만이다', 'bul-ma-ni-da', 'Bất mãn / không hài lòng', 'Tính từ', '그의 태도가 불만이에요.', 'Tôi không hài lòng với thái độ của anh ấy.'),
  ('4A-L4', '4A', '속상하다', 'sok-ssang-ha-da', 'Buồn lòng / phiền lòng', 'Tính từ', '친구의 말 때문에 속상했어요.', 'Tôi buồn lòng vì lời nói của bạn.'),
  ('4A-L4', '4A', '발끈하다', 'bal-kkeun-ha-da', 'Nổi nóng / nổi khùng', 'Động từ', '지적을 받자 그는 발끈했어요.', 'Vừa bị chỉ ra lỗi thì anh ấy nổi nóng.'),
  ('4A-L4', '4A', '따지다', 'tta-ji-da', 'Cãi lý / hỏi vặn', 'Động từ', '작은 일까지 따지지 마세요.', 'Đừng cãi lý đến cả chuyện nhỏ.'),
  ('4A-L4', '4A', '지적하다', 'ji-jeo-ka-da', 'Chỉ ra / phê bình', 'Động từ', '상사가 문제점을 지적했어요.', 'Cấp trên đã chỉ ra vấn đề.'),
  ('4A-L4', '4A', '여성스럽다', 'yeo-seong-seu-reop-tta', 'Nữ tính', 'Tính từ', '그 옷은 여성스러워 보여요.', 'Bộ đồ đó trông nữ tính.'),
  ('4A-L4', '4A', '사랑스럽다', 'sa-rang-seu-reop-tta', 'Đáng yêu', 'Tính từ', '아이의 웃는 모습이 사랑스러워요.', 'Dáng vẻ cười của đứa trẻ rất đáng yêu.'),
  ('4A-L4', '4A', '자랑스럽다', 'ja-rang-seu-reop-tta', 'Tự hào', 'Tính từ', '딸이 정말 자랑스러워요.', 'Tôi thật sự tự hào về con gái.'),
  ('4A-L4', '4A', '당황스럽다', 'dang-hwang-seu-reop-tta', 'Bối rối / bất ngờ khó xử', 'Tính từ', '갑작스러운 질문이 당황스러웠어요.', 'Câu hỏi bất ngờ khiến tôi bối rối.'),
  ('4A-L4', '4A', '걱정스럽다', 'geok-jeong-seu-reop-tta', 'Đáng lo / lo lắng', 'Tính từ', '아이의 건강이 걱정스러워요.', 'Sức khỏe của con khiến tôi lo lắng.'),
  ('4A-L4', '4A', '가능', 'ga-neung', 'Khả năng / có thể', 'Danh từ', '사용 가능 시간이 정해져 있어요.', 'Thời gian có thể sử dụng đã được quy định.'),
  ('4A-L4', '4A', '사용법', 'sa-yong-ppeop', 'Cách sử dụng', 'Danh từ', '기계 사용법을 알려 주세요.', 'Hãy cho tôi biết cách sử dụng máy.'),
  ('4A-L4', '4A', '광고', 'gwang-go', 'Quảng cáo', 'Danh từ', '새로운 사우나 광고를 봤어요.', 'Tôi đã xem quảng cáo phòng xông hơi mới.'),
  ('4A-L4', '4A', '전문적', 'jeon-mun-jeok', 'Mang tính chuyên môn / chuyên nghiệp', 'Danh từ', '전문적인 설명이 필요해요.', 'Cần lời giải thích mang tính chuyên môn.'),
  ('4A-L4', '4A', '최신식', 'choe-sin-sik', 'Kiểu mới nhất / hiện đại nhất', 'Danh từ', '최신식 시설을 갖추었어요.', 'Đã trang bị cơ sở vật chất hiện đại nhất.'),
  ('4A-L4', '4A', '사우나', 'sa-u-na', 'Phòng tắm xông hơi', 'Danh từ', '주말에 사우나에 갔어요.', 'Cuối tuần tôi đã đi phòng xông hơi.'),
  ('4A-L4', '4A', '주년', 'ju-nyeon', 'Năm thứ / kỷ niệm năm', 'Danh từ', '개업 10주년 이벤트가 있어요.', 'Có sự kiện kỷ niệm 10 năm khai trương.'),
  ('4A-L4', '4A', '기념', 'gi-nyeom', 'Kỷ niệm', 'Danh từ', '결혼기념일을 축하했어요.', 'Đã chúc mừng ngày kỷ niệm cưới.'),
  ('4A-L4', '4A', '이벤트', 'i-ben-teu', 'Sự kiện / event', 'Danh từ', '회원들을 위한 이벤트가 열렸어요.', 'Sự kiện dành cho hội viên đã được tổ chức.'),
  ('4A-L4', '4A', '회원', 'hoe-won', 'Hội viên / thành viên', 'Danh từ', '회원에게 할인을 해 줘요.', 'Giảm giá cho hội viên.'),
  ('4A-L4', '4A', '최상', 'choe-sang', 'Tốt nhất / cao nhất', 'Danh từ', '최상의 서비스를 제공합니다.', 'Cung cấp dịch vụ tốt nhất.'),
  ('4A-L4', '4A', '저축', 'jeo-chuk', 'Tiết kiệm', 'Danh từ', '결혼을 위해 저축을 하고 있어요.', 'Tôi đang tiết kiệm để kết hôn.'),
  ('4A-L4', '4A', '말다툼하다', 'mal-da-tum-ha-da', 'Tranh cãi / cãi nhau', 'Động từ', '두 사람은 취향 때문에 말다툼했어요.', 'Hai người đã tranh cãi vì sở thích.'),
  ('4A-L4', '4A', '취향', 'chwi-hyang', 'Sở thích / gu', 'Danh từ', '음악 취향이 서로 달라요.', 'Gu âm nhạc của nhau khác nhau.'),
  ('4A-L4', '4A', '콘서트', 'kon-seo-teu', 'Buổi hòa nhạc / concert', 'Danh từ', '같이 콘서트에 가기로 했어요.', 'Chúng tôi đã quyết định đi concert cùng nhau.'),
  ('4A-L4', '4A', '드라이브를 가다', 'deu-ra-i-beu-reul ga-da', 'Lái xe đi dạo', 'Cụm động từ', '주말에 드라이브를 가고 싶어요.', 'Cuối tuần tôi muốn lái xe đi dạo.'),
  ('4A-L4', '4A', '최근', 'choe-geun', 'Gần đây / dạo gần đây', 'Danh từ', '최근에 자주 다퉜어요.', 'Gần đây chúng tôi thường cãi nhau.'),
  ('4A-L4', '4A', '포기하다', 'po-gi-ha-da', 'Từ bỏ', 'Động từ', '꿈을 포기하지 마세요.', 'Đừng từ bỏ ước mơ.'),
  ('4A-L4', '4A', '늘', 'neul', 'Luôn luôn / thường xuyên', 'Trạng từ', '그는 늘 거울을 봐요.', 'Anh ấy luôn nhìn gương.'),
  ('4A-L4', '4A', '거울', 'geo-ul', 'Cái gương', 'Danh từ', '거울 앞에서 옷을 골랐어요.', 'Tôi chọn quần áo trước gương.'),
  ('4A-L4', '4A', '실제', 'sil-jje', 'Thực tế', 'Danh từ', '실제 상황은 생각과 달랐어요.', 'Tình huống thực tế khác với suy nghĩ.'),
  ('4A-L4', '4A', '남자답다', 'nam-ja-dap-tta', 'Nam tính / ra dáng đàn ông', 'Tính từ', '남자다운 태도가 항상 좋은 것은 아니에요.', 'Thái độ nam tính không phải lúc nào cũng tốt.'),
  ('4A-L4', '4A', '몸매', 'mom-mae', 'Vóc dáng / thân hình', 'Danh từ', '몸매보다 건강이 더 중요해요.', 'Sức khỏe quan trọng hơn vóc dáng.'),
  ('4A-L4', '4A', '옷장', 'ot-jjang', 'Tủ quần áo', 'Danh từ', '옷장에 옷이 가득해요.', 'Trong tủ quần áo đầy quần áo.'),
  ('4A-L4', '4A', '심각하다', 'sim-ga-ka-da', 'Nghiêm trọng', 'Tính từ', '문제가 생각보다 심각해요.', 'Vấn đề nghiêm trọng hơn tôi nghĩ.'),
  ('4A-L4', '4A', '상사', 'sang-sa', 'Cấp trên', 'Danh từ', '상사와 원만한 관계를 유지해야 해요.', 'Phải duy trì quan hệ thuận lợi với cấp trên.'),
  ('4A-L4', '4A', '원만하다', 'won-man-ha-da', 'Ôn hòa / thuận lợi', 'Tính từ', '두 사람의 관계가 원만해요.', 'Mối quan hệ của hai người hòa thuận.'),
  ('4A-L4', '4A', '기대하다', 'gi-dae-ha-da', 'Mong đợi / kỳ vọng', 'Động từ', '좋은 결과를 기대하고 있어요.', 'Tôi đang mong đợi kết quả tốt.'),
  ('4A-L4', '4A', '고르다', 'go-reu-da', 'Chọn', 'Động từ', '메뉴판을 보고 음식을 골랐어요.', 'Tôi nhìn thực đơn và chọn món ăn.'),
  ('4A-L4', '4A', '수준', 'su-jun', 'Mức độ / trình độ / tiêu chuẩn', 'Danh từ', '서비스 수준이 높아요.', 'Mức độ dịch vụ cao.'),
  ('4A-L4', '4A', '정식', 'jeong-sik', 'Chính thức / suất ăn kiểu set', 'Danh từ', '한식 정식을 주문했어요.', 'Tôi đã gọi suất ăn Hàn Quốc kiểu set.'),
  ('4A-L4', '4A', '모처럼', 'mo-cheo-reom', 'Hiếm khi / lâu lắm mới', 'Trạng từ', '모처럼 데이트를 했어요.', 'Lâu lắm rồi chúng tôi mới hẹn hò.'),
  ('4A-L4', '4A', '기분이 나다', 'gi-bu-ni na-da', 'Có hứng / có tâm trạng', 'Cụm động từ', '오늘은 특별한 기분이 나요.', 'Hôm nay tôi có cảm giác đặc biệt.'),
  ('4A-L4', '4A', '메뉴판', 'me-nyu-pan', 'Thực đơn / bảng menu', 'Danh từ', '메뉴판을 보여 주세요.', 'Cho tôi xem thực đơn.'),
  ('4A-L4', '4A', '판매점', 'pan-mae-jeom', 'Cửa hàng bán hàng / điểm bán', 'Danh từ', '휴대폰 판매점에 갔어요.', 'Tôi đã đến cửa hàng bán điện thoại.'),
  ('4A-L4', '4A', '의논하다', 'ui-non-ha-da', 'Bàn bạc / thảo luận', 'Động từ', '중요한 일은 함께 의논해야 해요.', 'Việc quan trọng thì phải cùng bàn bạc.'),
  ('4A-L4', '4A', '현금', 'hyeon-geum', 'Tiền mặt', 'Danh từ', '현금으로 계산할게요.', 'Tôi sẽ thanh toán bằng tiền mặt.'),
  ('4A-L4', '4A', '다림질', 'da-rim-jil', 'Việc là ủi', 'Danh từ', '아침에 셔츠 다림질을 했어요.', 'Buổi sáng tôi đã là áo sơ mi.'),
  ('4A-L4', '4A', '커피를 내리다', 'keo-pi-reul nae-ri-da', 'Pha cà phê / chiết cà phê', 'Cụm động từ', '아침마다 커피를 내려요.', 'Mỗi sáng tôi pha cà phê.'),
  ('4A-L4', '4A', '식빵', 'sik-ppang', 'Bánh mì gối', 'Danh từ', '식빵을 구워 먹었어요.', 'Tôi nướng bánh mì gối để ăn.'),
  ('4A-L4', '4A', '달래다', 'dal-lae-da', 'Dỗ dành / an ủi', 'Động từ', '우는 아이를 달랬어요.', 'Tôi đã dỗ đứa trẻ đang khóc.'),
  ('4A-L4', '4A', '기저귀를 갈다', 'gi-jeo-gwi-reul gal-da', 'Thay bỉm / thay tã', 'Cụm động từ', '아기 기저귀를 갈았어요.', 'Tôi đã thay bỉm cho em bé.'),
  ('4A-L4', '4A', '실험', 'sil-heom', 'Thí nghiệm / thử nghiệm', 'Danh từ', '남녀의 차이를 알아보는 실험을 했어요.', 'Đã làm thử nghiệm tìm hiểu sự khác biệt nam nữ.'),
  ('4A-L4', '4A', '평균', 'pyeong-gyun', 'Trung bình / bình quân', 'Danh từ', '평균 시간이 10분이에요.', 'Thời gian trung bình là 10 phút.'),
  ('4A-L4', '4A', '동시에', 'dong-si-e', 'Đồng thời', 'Trạng từ', '두 가지 일을 동시에 했어요.', 'Tôi đã làm đồng thời hai việc.'),
  ('4A-L4', '4A', '허둥대다', 'heo-dung-dae-da', 'Lúng túng / hấp tấp', 'Động từ', '갑자기 일이 생겨서 허둥댔어요.', 'Vì đột nhiên có việc nên tôi lúng túng.'),
  ('4A-L4', '4A', '침착하다', 'chim-cha-ka-da', 'Bình tĩnh / điềm tĩnh', 'Tính từ', '문제가 생겨도 침착해야 해요.', 'Dù có vấn đề xảy ra cũng phải bình tĩnh.'),
  ('4A-L4', '4A', '우왕좌왕하다', 'u-wang-jwa-wang-ha-da', 'Lúng túng / chạy qua chạy lại không biết làm gì', 'Động từ', '사람들이 우왕좌왕했어요.', 'Mọi người lúng túng không biết làm gì.'),
  ('4A-L4', '4A', '차지하다', 'cha-ji-ha-da', 'Chiếm giữ / chiếm tỉ lệ', 'Động từ', '여성이 절반을 차지했어요.', 'Phụ nữ chiếm một nửa.'),
  ('4A-L4', '4A', '지휘자', 'ji-hwi-ja', 'Nhạc trưởng / người chỉ huy', 'Danh từ', '그녀는 유명한 지휘자예요.', 'Cô ấy là nhạc trưởng nổi tiếng.'),
  ('4A-L4', '4A', '상임', 'sang-im', 'Thường trực', 'Danh từ', '상임 지휘자로 임명되었어요.', 'Đã được bổ nhiệm làm nhạc trưởng thường trực.'),
  ('4A-L4', '4A', '주어지다', 'ju-eo-ji-da', 'Được giao / được cho sẵn', 'Động từ', '모든 사람에게 같은 시간이 주어졌어요.', 'Mọi người đều được cho cùng một thời gian.'),
  ('4A-L4', '4A', '순서', 'sun-seo', 'Thứ tự / trình tự', 'Danh từ', '순서대로 발표하세요.', 'Hãy trình bày theo thứ tự.'),
  ('4A-L4', '4A', '뛰어나다', 'ttwi-eo-na-da', 'Nổi trội / vượt trội', 'Tính từ', '그는 언어 능력이 뛰어나요.', 'Anh ấy có năng lực ngôn ngữ vượt trội.'),
  ('4A-L4', '4A', '뒤떨어지다', 'dwi-tteo-reo-ji-da', 'Tụt hậu / thua kém', 'Động từ', '실력이 뒤떨어진다고 생각하지 마세요.', 'Đừng nghĩ là năng lực của mình thua kém.'),
  ('4A-L4', '4A', '시키다', 'si-ki-da', 'Sai khiến / gọi món / khiến', 'Động từ', '음식을 시켰어요.', 'Tôi đã gọi món ăn.'),
  ('4A-L4', '4A', '주차하다', 'ju-cha-ha-da', 'Đậu xe / đỗ xe', 'Động từ', '차를 주차하고 들어갔어요.', 'Tôi đậu xe rồi đi vào.'),
  ('4A-L4', '4A', '감정이 풍부하다', 'gam-jeong-i pung-bu-ha-da', 'Giàu cảm xúc / giàu tình cảm', 'Cụm tính từ', '그는 감정이 풍부한 사람이에요.', 'Anh ấy là người giàu cảm xúc.'),
  ('4A-L4', '4A', '근거', 'geun-geo', 'Căn cứ / cơ sở', 'Danh từ', '근거 없는 말은 하지 마세요.', 'Đừng nói điều không có căn cứ.'),
  ('4A-L4', '4A', '토론하다', 'to-ron-ha-da', 'Thảo luận / tranh luận', 'Động từ', '남녀 차이에 대해 토론했어요.', 'Chúng tôi đã thảo luận về khác biệt nam nữ.'),
  ('4A-L4', '4A', '디자이너', 'di-ja-i-neo', 'Nhà thiết kế', 'Danh từ', '그녀는 의상 디자이너예요.', 'Cô ấy là nhà thiết kế trang phục.'),
  ('4A-L4', '4A', '의상실', 'ui-sang-sil', 'Phòng may / tiệm trang phục', 'Danh từ', '의상실에서 옷을 맞췄어요.', 'Tôi đã may đo quần áo ở tiệm trang phục.'),
  ('4A-L4', '4A', '최초', 'choe-cho', 'Đầu tiên / lần đầu', 'Danh từ', '그녀는 한국 최초의 여성 조종사였어요.', 'Cô ấy là nữ phi công đầu tiên của Hàn Quốc.'),
  ('4A-L4', '4A', '조종사', 'jo-jong-sa', 'Phi công', 'Danh từ', '조종사가 되는 것이 꿈이에요.', 'Ước mơ của tôi là trở thành phi công.'),
  ('4A-L4', '4A', '부기장', 'bu-gi-jang', 'Cơ phó', 'Danh từ', '그는 부기장으로 일하고 있어요.', 'Anh ấy đang làm cơ phó.'),
  ('4A-L4', '4A', '임명되다', 'im-myeong-doe-da', 'Được bổ nhiệm', 'Động từ', '상임 지휘자로 임명되었어요.', 'Đã được bổ nhiệm làm nhạc trưởng thường trực.'),
  ('4A-L4', '4A', '기장', 'gi-jang', 'Cơ trưởng', 'Danh từ', '기장이 승객에게 안내 방송을 했어요.', 'Cơ trưởng đã thông báo cho hành khách.'),
  ('4A-L4', '4A', '면허', 'myeon-heo', 'Giấy phép / bằng cấp', 'Danh từ', '운전 면허를 땄어요.', 'Tôi đã lấy bằng lái xe.'),
  ('4A-L4', '4A', '발급되다', 'bal-geup-ttoe-da', 'Được cấp / được phát hành', 'Động từ', '면허가 발급되었어요.', 'Giấy phép đã được cấp.');

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L4', '4A', '~스럽다 (Có vẻ / mang tính...)', 'B1+', 'Danh từ + 스럽다 tạo tính từ mang nghĩa có cảm giác hoặc đặc điểm giống danh từ đó.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('그 옷은 여성스러워 보여요.', 'Bộ đồ đó trông nữ tính.'),
  ('딸이 상을 받아서 정말 자랑스러워요.', 'Con gái nhận giải nên tôi thật sự tự hào.'),
  ('갑자기 그런 말을 들어서 당황스러웠어요.', 'Đột nhiên nghe lời như vậy nên tôi bối rối.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L4', '4A', '~답다 (Ra dáng / đúng chất...)', 'B1+', 'Danh từ + 답다 diễn tả một người/vật có đặc điểm đúng với danh từ đó, thường dùng để đánh giá tính cách hoặc hình ảnh.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('남자답게 행동해야 한다고 생각하지 않아요.', 'Tôi không nghĩ nhất định phải hành động ra dáng đàn ông.'),
  ('그 사람은 언제나 선생님답게 침착해요.', 'Người đó lúc nào cũng điềm tĩnh đúng chất giáo viên.'),
  ('자신답게 사는 것이 중요해요.', 'Sống đúng với bản thân là điều quan trọng.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L4', '4A', '~기는커녕 (Đừng nói đến..., ngay cả... cũng không)', 'B2', 'Danh từ/Động từ + 기는커녕 dùng để nhấn mạnh điều được mong đợi còn không đạt được, nói gì đến điều lớn hơn.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('의논하기는커녕 서로 따지기만 했어요.', 'Đừng nói đến bàn bạc, hai người chỉ cãi lý với nhau.'),
  ('침착하기는커녕 우왕좌왕했어요.', 'Đừng nói đến bình tĩnh, tôi đã lúng túng không biết làm gì.'),
  ('사과하기는커녕 발끈했어요.', 'Đừng nói đến xin lỗi, anh ấy còn nổi nóng.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L4', '4A', '~에 비해(서) (So với...)', 'B1+', 'Danh từ + 에 비해(서) dùng để so sánh một đối tượng với đối tượng khác.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('남성에 비해 여성이 감정이 풍부하다는 말은 근거가 필요해요.', 'Nói rằng phụ nữ giàu cảm xúc hơn nam giới thì cần căn cứ.'),
  ('예전에 비해 여성 조종사가 많아졌어요.', 'So với trước đây, nữ phi công đã nhiều hơn.'),
  ('가격에 비해 서비스 수준이 높아요.', 'So với giá thì mức độ dịch vụ cao.')
) AS ex(korean, vietnamese);

INSERT INTO seoul_dialogue (lesson_id, speaker, text, translation)
VALUES
  ('4A-L4', '민지', '모처럼 데이트하는데 왜 또 콘서트는 싫다고 해요?', 'Lâu lắm mới hẹn hò mà sao anh lại nói không thích concert nữa vậy?'),
  ('4A-L4', '준호', '싫다는 게 아니라 내 취향이랑 조금 달라서 그래요. 우리 의논해서 고르면 안 돼요?', 'Không phải là anh ghét, chỉ là hơi khác gu của anh thôi. Chúng ta bàn bạc rồi chọn không được à?'),
  ('4A-L4', '민지', '당신은 늘 계획성이 없고 눈치도 없어서 속상해요.', 'Anh lúc nào cũng không có kế hoạch, lại không tinh ý nên em buồn lòng.'),
  ('4A-L4', '준호', '그렇게 지적하면 나도 발끈하게 돼요. 따지기보다는 침착하게 이야기해요.', 'Em chỉ ra như vậy thì anh cũng dễ nổi nóng. Thay vì cãi lý, mình bình tĩnh nói chuyện nhé.'),
  ('4A-L4', '민지', '맞아요. 서로의 취향에 비해 무엇이 더 좋은지 이야기해 봐요.', 'Đúng vậy. Hãy thử nói xem so với sở thích của nhau thì điều gì tốt hơn.');

-- 4A-L5: 속담과 관용어
DELETE FROM seoul_dialogue WHERE lesson_id = '4A-L5';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4A-L5');
DELETE FROM seoul_grammar WHERE lesson_id = '4A-L5';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4A-L5';

INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES ('4A-L5', '4A', 5, '속담과 관용어', 'Tục ngữ và quán dụng ngữ', ARRAY['Hiểu và sử dụng tục ngữ tiếng Hàn', 'Phân biệt tục ngữ và quán dụng ngữ', 'Diễn đạt tình huống đời sống bằng thành ngữ tự nhiên']::text[], '속담으로 말하기 (Nói bằng tục ngữ)', 'Tục ngữ Hàn Quốc thường dùng hình ảnh đời sống như 동물, 농업, 음식 để nói về kinh nghiệm sống. Khi dùng trong hội thoại, nên hiểu cả nghĩa bóng chứ không dịch từng chữ. Quán dụng ngữ như 입이 가볍다, 귀가 얇다, 발이 넓다 thường dùng để miêu tả tính cách một cách tự nhiên.')
ON CONFLICT (id) DO UPDATE SET
  book_id = EXCLUDED.book_id,
  lesson_number = EXCLUDED.lesson_number,
  title = EXCLUDED.title,
  title_vi = EXCLUDED.title_vi,
  objectives = EXCLUDED.objectives,
  dialogue_title = EXCLUDED.dialogue_title,
  cultural_tip = EXCLUDED.cultural_tip;

INSERT INTO seoul_vocabulary (lesson_id, book_id, korean, pronunciation, vietnamese, part_of_speech, example, example_vi)
VALUES
  ('4A-L5', '4A', '속담', 'sok-ttam', 'Tục ngữ', 'Danh từ', '한국어 속담을 배우고 있어요.', 'Tôi đang học tục ngữ tiếng Hàn.'),
  ('4A-L5', '4A', '관용어', 'gwa-nyong-eo', 'Thành ngữ / quán dụng ngữ', 'Danh từ', '관용어는 단어 그대로 해석하면 어려워요.', 'Thành ngữ nếu dịch nguyên từng từ thì khó hiểu.'),
  ('4A-L5', '4A', '호랑이도 제 말 하면 온다', 'ho-rang-i-do je mal ha-myeon on-da', 'Nhắc hổ là hổ tới / nhắc Tào Tháo, Tào Tháo tới', 'Tục ngữ', '민수 이야기하고 있었는데 민수가 왔네요. 호랑이도 제 말 하면 온다더니요.', 'Đang nói chuyện về Minsu thì Minsu đến. Đúng là nhắc Tào Tháo, Tào Tháo tới.'),
  ('4A-L5', '4A', '인정을 받다', 'in-jeong-eul bat-tta', 'Được công nhận', 'Cụm động từ', '그는 회사에서 능력을 인정받았어요.', 'Anh ấy được công ty công nhận năng lực.'),
  ('4A-L5', '4A', '야단을 치다', 'ya-da-neul chi-da', 'Mắng / la rầy', 'Cụm động từ', '부장님이 신입 사원을 야단쳤어요.', 'Trưởng phòng đã la nhân viên mới.'),
  ('4A-L5', '4A', '신입 사원', 'si-nip sa-won', 'Nhân viên mới', 'Danh từ', '신입 사원이 실수를 했어요.', 'Nhân viên mới đã mắc lỗi.'),
  ('4A-L5', '4A', '개구리 올챙이 적 생각 못 한다', 'gae-gu-ri ol-chaeng-i jeok saeng-gak mot han-da', 'Ếch quên thời còn là nòng nọc', 'Tục ngữ', '예전에 자신도 신입이었는데 후배만 야단치다니 개구리 올챙이 적 생각 못 하는군요.', 'Trước đây bản thân cũng từng là nhân viên mới mà chỉ la đàn em, đúng là ếch quên thời còn là nòng nọc.'),
  ('4A-L5', '4A', '소 잃고 외양간 고친다', 'so il-ko oe-yang-gan go-chin-da', 'Mất bò mới lo làm chuồng', 'Tục ngữ', '자료를 잃어버린 뒤에 백업하면 소 잃고 외양간 고치는 거예요.', 'Mất dữ liệu rồi mới sao lưu thì là mất bò mới lo làm chuồng.'),
  ('4A-L5', '4A', '고래 싸움에 새우 등 터진다', 'go-rae ssa-u-me sae-u deung teo-jin-da', 'Trâu bò đánh nhau, ruồi muỗi chết / tôm tép chết lây', 'Tục ngữ', '큰 회사들이 경쟁하는 바람에 작은 가게들이 힘들어졌어요. 고래 싸움에 새우 등 터진 셈이에요.', 'Vì các công ty lớn cạnh tranh nên các cửa hàng nhỏ gặp khó khăn. Đúng là trâu bò đánh nhau, ruồi muỗi chết.'),
  ('4A-L5', '4A', '세 살 버릇 여든까지 간다', 'se sal beo-reut yeo-deun-kka-ji gan-da', 'Thói quen từ nhỏ theo đến già / dạy con thuở lên ba', 'Tục ngữ', '어릴 때 생긴 습관은 쉽게 안 고쳐져요. 세 살 버릇 여든까지 간다잖아요.', 'Thói quen hình thành từ nhỏ không dễ sửa. Người ta nói thói quen từ nhỏ theo đến già mà.'),
  ('4A-L5', '4A', '믿는 도끼에 발등 찍힌다', 'min-neun do-kki-e bal-deung jji-kin-da', 'Bị phản bội bởi người mình tin / nuôi ong tay áo', 'Tục ngữ', '믿었던 친구에게 속아서 믿는 도끼에 발등 찍힌 기분이에요.', 'Bị người bạn mình tin lừa nên tôi có cảm giác bị phản bội.'),
  ('4A-L5', '4A', '원숭이도 나무에서 떨어질 때가 있다', 'won-sung-i-do na-mu-e-seo tteo-reo-jil ttae-ga it-tta', 'Khỉ cũng có lúc rơi khỏi cây / nhân vô thập toàn', 'Tục ngữ', '전문가도 실수할 수 있어요. 원숭이도 나무에서 떨어질 때가 있잖아요.', 'Chuyên gia cũng có thể mắc lỗi. Khỉ cũng có lúc rơi khỏi cây mà.'),
  ('4A-L5', '4A', '젊어서 고생은 사서도 한다', 'jeol-meo-seo go-saeng-eun sa-seo-do han-da', 'Vất vả khi trẻ là trải nghiệm quý giá', 'Tục ngữ', '젊어서 고생은 사서도 한다고 생각하고 도전해 보세요.', 'Hãy nghĩ rằng vất vả khi trẻ là trải nghiệm quý giá và thử thách bản thân.'),
  ('4A-L5', '4A', '천리 길도 한 걸음부터', 'cheol-li gil-do han geo-reum-bu-teo', 'Đường thiên lý bắt đầu từ một bước chân', 'Tục ngữ', '논문도 오늘 한 쪽부터 쓰면 돼요. 천리 길도 한 걸음부터예요.', 'Luận văn hôm nay cứ viết từ một trang là được. Đường thiên lý bắt đầu từ một bước chân.'),
  ('4A-L5', '4A', '시작이 반이다', 'si-ja-gi ba-ni-da', 'Bắt đầu là đã xong một nửa / đầu xuôi đuôi lọt', 'Tục ngữ', '운동을 시작했으니 이미 반은 한 거예요. 시작이 반이잖아요.', 'Bạn đã bắt đầu tập thể dục nên coi như đã làm được một nửa. Bắt đầu là đã xong một nửa mà.'),
  ('4A-L5', '4A', '입이 가볍다', 'i-bi ga-byeop-tta', 'Lẻo mép / không giữ được bí mật', 'Quán dụng ngữ', '그 사람은 입이 가벼워서 비밀을 말하면 안 돼요.', 'Người đó lẻo mép nên không được nói bí mật.'),
  ('4A-L5', '4A', '입이 무겁다', 'i-bi mu-geop-tta', 'Kín tiếng / giữ bí mật tốt', 'Quán dụng ngữ', '친구는 입이 무거워서 믿을 수 있어요.', 'Bạn tôi kín tiếng nên có thể tin được.'),
  ('4A-L5', '4A', '입이 짧다', 'i-bi jjal-tta', 'Kén ăn / ăn ít', 'Quán dụng ngữ', '아이는 입이 짧아서 많이 못 먹어요.', 'Đứa bé kén ăn nên không ăn được nhiều.'),
  ('4A-L5', '4A', '부장님', 'bu-jang-nim', 'Trưởng phòng', 'Danh từ', '부장님께 보고서를 드렸어요.', 'Tôi đã đưa báo cáo cho trưởng phòng.'),
  ('4A-L5', '4A', '혼나다', 'hon-na-da', 'Bị la mắng / bị phạt', 'Động từ', '늦어서 선생님께 혼났어요.', 'Tôi bị giáo viên la vì đến muộn.'),
  ('4A-L5', '4A', '마트', 'ma-teu', 'Siêu thị', 'Danh từ', '마트에서 장을 봤어요.', 'Tôi đã đi chợ ở siêu thị.'),
  ('4A-L5', '4A', '경쟁', 'gyeong-jaeng', 'Cạnh tranh', 'Danh từ', '경쟁이 점점 심해지고 있어요.', 'Sự cạnh tranh đang ngày càng gay gắt.'),
  ('4A-L5', '4A', '장사가 안되다', 'jang-sa-ga an-doe-da', 'Buôn bán ế ẩm / kinh doanh không thuận lợi', 'Cụm động từ', '요즘 장사가 안돼서 걱정이에요.', 'Dạo này buôn bán ế ẩm nên tôi lo.'),
  ('4A-L5', '4A', '눈덩이', 'nun-deong-i', 'Nắm tuyết / khối tuyết', 'Danh từ', '빚이 눈덩이처럼 불어났어요.', 'Nợ tăng lên như quả cầu tuyết.'),
  ('4A-L5', '4A', '외로움', 'oe-ro-um', 'Sự cô đơn', 'Danh từ', '혼자 살면 외로움을 느낄 때가 있어요.', 'Sống một mình thì có lúc cảm thấy cô đơn.'),
  ('4A-L5', '4A', '장시간', 'jang-si-gan', 'Thời gian dài', 'Danh từ', '장시간 앉아 있으면 건강에 안 좋아요.', 'Ngồi lâu không tốt cho sức khỏe.'),
  ('4A-L5', '4A', '풍부하다', 'pung-bu-ha-da', 'Phong phú / dồi dào', 'Tính từ', '경험이 풍부한 사람이에요.', 'Đó là người có kinh nghiệm phong phú.'),
  ('4A-L5', '4A', '조깅', 'jo-ging', 'Chạy bộ', 'Danh từ', '매일 아침 조깅을 해요.', 'Mỗi sáng tôi chạy bộ.'),
  ('4A-L5', '4A', '제대로', 'je-dae-ro', 'Đúng cách / đàng hoàng', 'Trạng từ', '제대로 배우고 싶어요.', 'Tôi muốn học một cách bài bản.'),
  ('4A-L5', '4A', '죽마고우', 'jung-ma-go-u', 'Bạn nối khố / bạn thanh mai trúc mã', 'Danh từ', '우리는 어릴 때부터 죽마고우예요.', 'Chúng tôi là bạn nối khố từ nhỏ.'),
  ('4A-L5', '4A', '눈이 높다', 'nu-ni nop-tta', 'Tiêu chuẩn cao / kén chọn', 'Quán dụng ngữ', '그는 눈이 높아서 아무 집이나 고르지 않아요.', 'Anh ấy tiêu chuẩn cao nên không chọn đại căn nhà nào.'),
  ('4A-L5', '4A', '귀가 얇다', 'gwi-ga yal-tta', 'Nhẹ dạ cả tin / dễ bị ảnh hưởng', 'Quán dụng ngữ', '귀가 얇으면 광고에 쉽게 속아요.', 'Nếu nhẹ dạ thì dễ bị quảng cáo lừa.'),
  ('4A-L5', '4A', '발이 넓다', 'ba-ri neol-tta', 'Quan hệ rộng', 'Quán dụng ngữ', '그 사람은 발이 넓어서 아는 사람이 많아요.', 'Người đó quan hệ rộng nên quen biết nhiều người.'),
  ('4A-L5', '4A', '월세', 'wol-sse', 'Tiền thuê nhà hằng tháng', 'Danh từ', '월세가 너무 비싸요.', 'Tiền thuê nhà hằng tháng quá đắt.'),
  ('4A-L5', '4A', '직장인', 'jik-jang-in', 'Nhân viên công ty / người đi làm', 'Danh từ', '직장인들은 시간이 부족해요.', 'Người đi làm thiếu thời gian.'),
  ('4A-L5', '4A', '강당', 'gang-dang', 'Hội trường / giảng đường lớn', 'Danh từ', '강당에서 행사가 열렸어요.', 'Sự kiện được tổ chức ở hội trường.'),
  ('4A-L5', '4A', '행사', 'haeng-sa', 'Sự kiện / hoạt động', 'Danh từ', '회사 행사가 있었어요.', 'Đã có sự kiện công ty.'),
  ('4A-L5', '4A', '큰돈', 'keun-don', 'Số tiền lớn', 'Danh từ', '큰돈을 잃어버렸어요.', 'Tôi đã làm mất một số tiền lớn.'),
  ('4A-L5', '4A', '소중하다', 'so-jung-ha-da', 'Quý giá / quan trọng', 'Tính từ', '시간은 정말 소중해요.', 'Thời gian thật sự quý giá.'),
  ('4A-L5', '4A', '소감', 'so-gam', 'Cảm nhận / cảm nghĩ', 'Danh từ', '수상 소감을 말했어요.', 'Tôi đã nói cảm nghĩ khi nhận giải.'),
  ('4A-L5', '4A', '아니 땐 굴뚝에 연기 날까', 'a-ni ttaen gul-ttu-ge yeon-gi nal-kka', 'Không có lửa làm sao có khói', 'Tục ngữ', '소문이 계속 나오는 걸 보니 아니 땐 굴뚝에 연기 날까 싶어요.', 'Thấy tin đồn cứ xuất hiện nên tôi nghĩ không có lửa làm sao có khói.'),
  ('4A-L5', '4A', '스캔들', 'seu-kaen-deul', 'Vụ bê bối / scandal', 'Danh từ', '연예인 스캔들이 화제가 되었어요.', 'Scandal của nghệ sĩ đã trở thành đề tài nóng.'),
  ('4A-L5', '4A', '네티즌', 'ne-ti-jeun', 'Cư dân mạng', 'Danh từ', '네티즌들의 반응이 뜨거워요.', 'Phản ứng của cư dân mạng rất nóng.'),
  ('4A-L5', '4A', '지켜보다', 'ji-kyeo-bo-da', 'Theo dõi / quan sát', 'Động từ', '상황을 조금 더 지켜봅시다.', 'Hãy theo dõi tình hình thêm một chút.'),
  ('4A-L5', '4A', '축구경기', 'chuk-kku-gyeong-gi', 'Trận bóng đá', 'Danh từ', '축구경기 표가 매진됐어요.', 'Vé trận bóng đá đã bán hết.'),
  ('4A-L5', '4A', '관심이 뜨겁다', 'gwan-si-mi tteu-geop-tta', 'Được quan tâm rất nhiều / là chủ đề nóng', 'Cụm tính từ', '이번 축구경기에 관심이 뜨거워요.', 'Trận bóng đá lần này đang được quan tâm rất nhiều.'),
  ('4A-L5', '4A', '매진', 'mae-jin', 'Bán hết vé / cháy hàng', 'Danh từ', '콘서트 표가 매진됐어요.', 'Vé concert đã bán hết.'),
  ('4A-L5', '4A', '동료', 'dong-nyo', 'Đồng nghiệp', 'Danh từ', '동료와 점심을 먹었어요.', 'Tôi đã ăn trưa với đồng nghiệp.'),
  ('4A-L5', '4A', '그림의 떡', 'geu-ri-me tteok', 'Bánh gạo trong tranh / thứ ngoài tầm với', 'Quán dụng ngữ', '월세가 너무 비싸서 그 집은 그림의 떡이에요.', 'Tiền thuê quá đắt nên căn nhà đó là thứ ngoài tầm với.'),
  ('4A-L5', '4A', '사연', 'sa-yeon', 'Câu chuyện / hoàn cảnh phía sau', 'Danh từ', '그 사람에게는 특별한 사연이 있어요.', 'Người đó có một câu chuyện đặc biệt phía sau.'),
  ('4A-L5', '4A', '여대생', 'yeo-dae-saeng', 'Nữ sinh viên đại học', 'Danh từ', '여대생이 방송에 사연을 보냈어요.', 'Một nữ sinh đại học đã gửi câu chuyện đến chương trình.'),
  ('4A-L5', '4A', '연락이 뜸하다', 'yeol-la-gi tteum-ha-da', 'Ít liên lạc / liên lạc thưa dần', 'Cụm tính từ', '요즘 친구와 연락이 뜸해졌어요.', 'Dạo này tôi ít liên lạc với bạn hơn.'),
  ('4A-L5', '4A', '기말고사', 'gi-mal-go-sa', 'Kỳ thi cuối kỳ', 'Danh từ', '기말고사가 다음 주에 있어요.', 'Kỳ thi cuối kỳ vào tuần sau.'),
  ('4A-L5', '4A', '왠지', 'waen-ji', 'Không hiểu sao / vì lý do nào đó', 'Trạng từ', '왠지 오늘은 기분이 좋아요.', 'Không hiểu sao hôm nay tôi thấy vui.'),
  ('4A-L5', '4A', '배신감', 'bae-sin-gam', 'Cảm giác bị phản bội', 'Danh từ', '친구의 거짓말에 배신감을 느꼈어요.', 'Tôi cảm thấy bị phản bội vì lời nói dối của bạn.'),
  ('4A-L5', '4A', '안타깝다', 'an-ta-kkap-tta', 'Đáng tiếc / xót xa', 'Tính từ', '그 소식을 듣고 안타까웠어요.', 'Nghe tin đó tôi thấy xót xa.'),
  ('4A-L5', '4A', '석사', 'seok-ssa', 'Thạc sĩ', 'Danh từ', '석사 과정을 마쳤어요.', 'Tôi đã hoàn thành chương trình thạc sĩ.'),
  ('4A-L5', '4A', '논문', 'non-mun', 'Luận văn / luận án', 'Danh từ', '논문을 쓰고 있어요.', 'Tôi đang viết luận văn.'),
  ('4A-L5', '4A', '느긋하게', 'neu-geu-ta-ge', 'Một cách thong thả / bình thản', 'Trạng từ', '마감이 멀어서 느긋하게 준비했어요.', 'Vì hạn chót còn xa nên tôi chuẩn bị thong thả.'),
  ('4A-L5', '4A', '박사 과정', 'bak-ssa gwa-jeong', 'Chương trình tiến sĩ', 'Danh từ', '박사 과정에 지원하려고 해요.', 'Tôi định ứng tuyển chương trình tiến sĩ.'),
  ('4A-L5', '4A', '입학원서', 'i-pa-gwon-seo', 'Đơn xin nhập học', 'Danh từ', '입학원서를 제출했어요.', 'Tôi đã nộp đơn xin nhập học.'),
  ('4A-L5', '4A', '마감', 'ma-gam', 'Hạn chót / kết thúc nhận hồ sơ', 'Danh từ', '입학원서 마감이 내일이에요.', 'Hạn chót nộp đơn nhập học là ngày mai.'),
  ('4A-L5', '4A', '겹치다', 'gyeop-chi-da', 'Trùng / chồng chéo', 'Động từ', '시험과 발표가 겹쳤어요.', 'Bài thi và bài thuyết trình bị trùng nhau.'),
  ('4A-L5', '4A', '정신이 없다', 'jeong-si-ni eop-tta', 'Bận tối tăm mặt mũi / không còn tâm trí', 'Cụm tính từ', '마감이 겹쳐서 정신이 없어요.', 'Vì các hạn chót trùng nhau nên tôi bận tối tăm mặt mũi.'),
  ('4A-L5', '4A', '바늘', 'ba-neul', 'Cây kim', 'Danh từ', '바늘로 옷을 꿰맸어요.', 'Tôi đã khâu áo bằng kim.'),
  ('4A-L5', '4A', '농업', 'nong-eop', 'Nông nghiệp', 'Danh từ', '농업은 중요한 산업이에요.', 'Nông nghiệp là ngành quan trọng.'),
  ('4A-L5', '4A', '농사짓다', 'nong-sa-jit-tta', 'Làm nông / canh tác', 'Động từ', '할아버지는 평생 농사짓고 사셨어요.', 'Ông tôi đã sống bằng nghề làm nông cả đời.'),
  ('4A-L5', '4A', '제사', 'je-sa', 'Lễ cúng tổ tiên / cúng tế', 'Danh từ', '명절에 제사를 지냈어요.', 'Vào dịp lễ, gia đình đã làm lễ cúng tổ tiên.');

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L5', '4A', '~더니 (Thấy... rồi thì...)', 'B1+', 'Dùng để nói người nói quan sát một việc ở quá khứ rồi kết quả hoặc tình huống sau đó xuất hiện.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('그 사람 이야기를 하더니 바로 왔어요.', 'Vừa nói chuyện về người đó thì người đó đến ngay.'),
  ('처음에는 열심히 하더니 요즘은 연락이 뜸해요.', 'Ban đầu chăm chỉ vậy mà dạo này ít liên lạc.'),
  ('느긋하게 준비하더니 마감 때문에 정신이 없대요.', 'Chuẩn bị thong thả vậy mà vì hạn chót nên nghe nói đang bận tối tăm mặt mũi.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L5', '4A', '~잖아요 (Chẳng phải... sao / ... mà)', 'B1', 'Dùng khi nhắc lại điều người nghe cũng biết hoặc để giải thích lý do một cách thân mật.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('시작이 반이잖아요. 일단 시작해 보세요.', 'Bắt đầu là đã được một nửa mà. Cứ thử bắt đầu đi.'),
  ('그 사람은 입이 가볍잖아요. 비밀을 말하지 마세요.', 'Người đó lẻo mép mà. Đừng nói bí mật.'),
  ('원숭이도 나무에서 떨어질 때가 있잖아요.', 'Khỉ cũng có lúc rơi khỏi cây mà.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L5', '4A', '~는 바람에 (Vì... nên...)', 'B1+', 'Dùng khi một việc xảy ra ngoài ý muốn dẫn đến kết quả không tốt.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('마감이 겹치는 바람에 정신이 없었어요.', 'Vì các hạn chót trùng nhau nên tôi bận tối tăm mặt mũi.'),
  ('동료가 비밀을 말하는 바람에 혼났어요.', 'Vì đồng nghiệp nói bí mật ra nên tôi bị la.'),
  ('큰 회사들이 경쟁하는 바람에 작은 가게 장사가 안됐어요.', 'Vì các công ty lớn cạnh tranh nên cửa hàng nhỏ buôn bán ế ẩm.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L5', '4A', '~다 보니 (Cứ... rồi thì...)', 'B1+', 'Dùng để diễn tả khi tiếp tục một hành động/trạng thái thì dần dẫn đến kết quả nào đó.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('속담을 자주 쓰다 보니 한국어 표현이 자연스러워졌어요.', 'Cứ dùng tục ngữ thường xuyên nên cách diễn đạt tiếng Hàn trở nên tự nhiên hơn.'),
  ('장시간 혼자 공부하다 보니 외로움을 느꼈어요.', 'Cứ học một mình trong thời gian dài nên tôi cảm thấy cô đơn.'),
  ('조깅을 제대로 하다 보니 건강이 좋아졌어요.', 'Cứ chạy bộ đúng cách nên sức khỏe tốt lên.')
) AS ex(korean, vietnamese);

INSERT INTO seoul_dialogue (lesson_id, speaker, text, translation)
VALUES
  ('4A-L5', '지우', '부장님이 신입 사원을 너무 심하게 야단치셨어요.', 'Trưởng phòng đã la nhân viên mới quá nặng lời.'),
  ('4A-L5', '현우', '예전에는 부장님도 신입이었잖아요. 개구리 올챙이 적 생각 못 한다는 말이 떠오르네요.', 'Trước đây trưởng phòng cũng từng là nhân viên mới mà. Tôi nhớ đến câu ếch quên thời còn là nòng nọc.'),
  ('4A-L5', '지우', '맞아요. 게다가 그 신입 사원은 일을 제대로 배우는 중이에요.', 'Đúng vậy. Hơn nữa nhân viên mới đó đang trong quá trình học việc đúng cách.'),
  ('4A-L5', '현우', '그래도 실수한 뒤에 고치면 소 잃고 외양간 고치는 셈이니까 미리 알려 줘야 해요.', 'Nhưng nếu mắc lỗi rồi mới sửa thì là mất bò mới lo làm chuồng, nên phải chỉ trước.'),
  ('4A-L5', '지우', '천리 길도 한 걸음부터니까 천천히 가르쳐 주면 좋겠어요.', 'Đường thiên lý bắt đầu từ một bước chân nên nếu chỉ dạy từ từ thì tốt.');

-- 4A-L6: 공연과 축제
DELETE FROM seoul_dialogue WHERE lesson_id = '4A-L6';
DELETE FROM seoul_grammar_examples WHERE grammar_id IN (SELECT id FROM seoul_grammar WHERE lesson_id = '4A-L6');
DELETE FROM seoul_grammar WHERE lesson_id = '4A-L6';
DELETE FROM seoul_vocabulary WHERE lesson_id = '4A-L6';

INSERT INTO seoul_lessons (id, book_id, lesson_number, title, title_vi, objectives, dialogue_title, cultural_tip)
VALUES ('4A-L6', '4A', 6, '공연과 축제', 'Biểu diễn và lễ hội', ARRAY['Nói về cảm nhận sau khi xem biểu diễn', 'Đánh giá lễ hội và chương trình văn hóa', 'Giới thiệu các loại hình biểu diễn truyền thống và hiện đại']::text[], '축제 감상 (Cảm nhận về lễ hội)', 'Ở Hàn Quốc, 축제 thường kết hợp biểu diễn hiện đại như K 팝, 힙합, 비보이 với nghệ thuật truyền thống như 판소리, 사물놀이, 부채춤. Một số loại hình như 판소리 và 강강술래 được UNESCO công nhận là 인류 무형 유산, vì vậy khi cảm nhận biểu diễn cần chú ý cả yếu tố giải trí lẫn giá trị văn hóa.')
ON CONFLICT (id) DO UPDATE SET
  book_id = EXCLUDED.book_id,
  lesson_number = EXCLUDED.lesson_number,
  title = EXCLUDED.title,
  title_vi = EXCLUDED.title_vi,
  objectives = EXCLUDED.objectives,
  dialogue_title = EXCLUDED.dialogue_title,
  cultural_tip = EXCLUDED.cultural_tip;

INSERT INTO seoul_vocabulary (lesson_id, book_id, korean, pronunciation, vietnamese, part_of_speech, example, example_vi)
VALUES
  ('4A-L6', '4A', '감상', 'gam-sang', 'Cảm nhận / thưởng thức', 'Danh từ', '공연 감상을 짧게 써 보세요.', 'Hãy viết ngắn cảm nhận về buổi biểu diễn.'),
  ('4A-L6', '4A', '평가', 'pyeong-ga', 'Đánh giá', 'Danh từ', '축제에 대한 평가가 좋았어요.', 'Đánh giá về lễ hội rất tốt.'),
  ('4A-L6', '4A', '대단하다', 'dae-dan-ha-da', 'Tuyệt vời / đáng nể', 'Tính từ', '비보이 공연이 정말 대단했어요.', 'Màn biểu diễn B-boy thật sự tuyệt vời.'),
  ('4A-L6', '4A', '하이서울페스티벌', 'ha-i seo-ul pe-seu-ti-beol', 'Lễ hội Hi Seoul', 'Danh từ', '하이서울페스티벌이 서울 곳곳에서 열렸어요.', 'Lễ hội Hi Seoul được tổ chức khắp nơi ở Seoul.'),
  ('4A-L6', '4A', '곳곳', 'got-kkot', 'Khắp nơi / nhiều nơi', 'Danh từ', '거리 곳곳에서 공연이 진행됐어요.', 'Các buổi biểu diễn được tiến hành ở khắp các con phố.'),
  ('4A-L6', '4A', '진행되다', 'jin-haeng-doe-da', 'Được tiến hành / diễn ra', 'Động từ', '행사는 오후까지 진행됩니다.', 'Sự kiện sẽ diễn ra đến buổi chiều.'),
  ('4A-L6', '4A', '감동적이다', 'gam-dong-jeo-gi-da', 'Cảm động', 'Tính từ', '마지막 장면이 감동적이었어요.', 'Cảnh cuối rất cảm động.'),
  ('4A-L6', '4A', '지루하다', 'ji-ru-ha-da', 'Chán / buồn tẻ', 'Tính từ', '설명이 너무 길어서 지루했어요.', 'Phần giải thích quá dài nên chán.'),
  ('4A-L6', '4A', '신이 나다', 'si-ni na-da', 'Hào hứng / phấn khởi', 'Cụm động từ', '불꽃놀이를 보니 신이 났어요.', 'Xem pháo hoa nên tôi rất hào hứng.'),
  ('4A-L6', '4A', '가슴이 찡하다', 'ga-seu-mi jjing-ha-da', 'Xúc động nghẹn ngào / lòng nhói lên', 'Cụm tính từ', '판소리를 듣고 가슴이 찡했어요.', 'Nghe pansori xong tôi xúc động nghẹn ngào.'),
  ('4A-L6', '4A', '수준이 높다', 'su-ju-ni nop-tta', 'Trình độ cao / chất lượng cao', 'Cụm tính từ', '국립국악단 공연은 수준이 높았어요.', 'Buổi biểu diễn của đoàn quốc nhạc quốc gia có chất lượng cao.'),
  ('4A-L6', '4A', '기대만 못하다', 'gi-dae-man mo-ta-da', 'Không được như kỳ vọng', 'Cụm tính từ', '축제가 기대만 못해서 아쉬웠어요.', 'Lễ hội không được như kỳ vọng nên tôi thấy tiếc.'),
  ('4A-L6', '4A', '이해가 안 되다', 'i-hae-ga an doe-da', 'Không hiểu được', 'Cụm động từ', '내용이 어려워서 이해가 안 됐어요.', 'Nội dung khó nên tôi không hiểu được.'),
  ('4A-L6', '4A', '설명이 필요 없다', 'seol-myeong-i pi-ryo eop-tta', 'Không cần giải thích', 'Cụm tính từ', '그 공연은 설명이 필요 없을 만큼 훌륭했어요.', 'Buổi diễn đó tuyệt đến mức không cần giải thích.'),
  ('4A-L6', '4A', '볼거리', 'bol-geo-ri', 'Thứ đáng xem / điểm tham quan', 'Danh từ', '이 축제에는 볼거리가 많아요.', 'Lễ hội này có nhiều thứ đáng xem.'),
  ('4A-L6', '4A', '이야깃거리', 'i-ya-git-kkeo-ri', 'Chuyện để kể / đề tài nói chuyện', 'Danh từ', '여행 중에 이야깃거리가 많이 생겼어요.', 'Trong chuyến đi có nhiều chuyện để kể.'),
  ('4A-L6', '4A', '웃음거리', 'u-seum-kkeo-ri', 'Trò cười / chuyện gây cười', 'Danh từ', '실수가 웃음거리가 되었어요.', 'Sai sót đã trở thành trò cười.'),
  ('4A-L6', '4A', '걱정거리', 'geok-jeong-kkeo-ri', 'Điều đáng lo', 'Danh từ', '비가 올까 봐 걱정거리가 생겼어요.', 'Tôi có điều đáng lo vì sợ trời mưa.'),
  ('4A-L6', '4A', '관심거리', 'gwan-sim-kkeo-ri', 'Điều được quan tâm', 'Danh từ', 'K 팝은 전 세계 젊은이들의 관심거리예요.', 'K-pop là điều được giới trẻ toàn thế giới quan tâm.'),
  ('4A-L6', '4A', '공유하다', 'gong-yu-ha-da', 'Chia sẻ', 'Động từ', '축제 사진을 친구들과 공유했어요.', 'Tôi đã chia sẻ ảnh lễ hội với bạn bè.'),
  ('4A-L6', '4A', '공포하다', 'gong-po-ha-da', 'Công bố / ban bố', 'Động từ', '새로운 규칙을 공포했어요.', 'Đã công bố quy định mới.'),
  ('4A-L6', '4A', '발라드', 'bal-la-deu', 'Nhạc ballad / bản tình ca', 'Danh từ', '저는 조용한 발라드를 좋아해요.', 'Tôi thích nhạc ballad nhẹ nhàng.'),
  ('4A-L6', '4A', '판매', 'pan-mae', 'Bán hàng / kinh doanh bán', 'Danh từ', '공연 티켓 판매가 시작됐어요.', 'Việc bán vé biểu diễn đã bắt đầu.'),
  ('4A-L6', '4A', '근무지', 'geun-mu-ji', 'Nơi làm việc', 'Danh từ', '근무지 근처에서 축제가 열려요.', 'Lễ hội được tổ chức gần nơi làm việc.'),
  ('4A-L6', '4A', '장기 자랑', 'jang-gi ja-rang', 'Cuộc thi tài năng / trình diễn sở trường', 'Danh từ', '회사 장기 자랑에서 마술을 했어요.', 'Tôi đã biểu diễn ảo thuật trong cuộc thi tài năng của công ty.'),
  ('4A-L6', '4A', '힙합', 'hip-hap', 'Hip-hop', 'Danh từ', '힙합 공연이 가장 신났어요.', 'Màn hip-hop là hào hứng nhất.'),
  ('4A-L6', '4A', '탭 댄스', 'taep daen-seu', 'Tap dance / điệu nhảy gõ nhịp bằng giày', 'Danh từ', '탭 댄스 소리가 리듬감 있었어요.', 'Âm thanh tap dance rất có nhịp điệu.'),
  ('4A-L6', '4A', '마술', 'ma-sul', 'Ảo thuật', 'Danh từ', '아이들이 마술 공연을 좋아했어요.', 'Trẻ em thích buổi biểu diễn ảo thuật.'),
  ('4A-L6', '4A', '민속 공연', 'min-sok gong-yeon', 'Biểu diễn dân gian / truyền thống', 'Danh từ', '외국인 관광객들이 민속 공연을 감상했어요.', 'Du khách nước ngoài đã thưởng thức biểu diễn dân gian.'),
  ('4A-L6', '4A', '존경하다', 'jon-gyeong-ha-da', 'Kính trọng / ngưỡng mộ', 'Động từ', '저는 그 지휘자를 존경해요.', 'Tôi kính trọng vị nhạc trưởng đó.'),
  ('4A-L6', '4A', '문자', 'mun-ja', 'Tin nhắn / chữ viết', 'Danh từ', '공연 시간이 바뀌었다는 문자를 받았어요.', 'Tôi đã nhận được tin nhắn nói giờ biểu diễn thay đổi.'),
  ('4A-L6', '4A', '감상하다', 'gam-sang-ha-da', 'Thưởng thức / cảm thụ', 'Động từ', '궁중 음악을 감상했어요.', 'Tôi đã thưởng thức nhạc cung đình.'),
  ('4A-L6', '4A', '잔치', 'jan-chi', 'Bữa tiệc / lễ hội vui', 'Danh từ', '마을 잔치가 열렸어요.', 'Bữa tiệc làng đã được tổ chức.'),
  ('4A-L6', '4A', '화려하다', 'hwa-ryeo-ha-da', 'Lộng lẫy / rực rỡ', 'Tính từ', '불꽃놀이가 화려했어요.', 'Màn pháo hoa rất rực rỡ.'),
  ('4A-L6', '4A', '불꽃놀이', 'bul-kkot-no-ri', 'Pháo hoa', 'Danh từ', '밤에 불꽃놀이를 봤어요.', 'Buổi tối tôi đã xem pháo hoa.'),
  ('4A-L6', '4A', '사물놀이', 'sa-mul-lo-ri', 'Samulnori / nhạc gõ truyền thống Hàn Quốc', 'Danh từ', '사물놀이 연주가 인상적이었어요.', 'Màn diễn samulnori rất ấn tượng.'),
  ('4A-L6', '4A', '연주팀', 'yeon-ju-tim', 'Đội biểu diễn nhạc / nhóm trình diễn', 'Danh từ', '연주팀이 무대에 올라왔어요.', 'Đội biểu diễn nhạc đã lên sân khấu.'),
  ('4A-L6', '4A', '국립국악단', 'gung-nip-gu-gak-ttan', 'Đoàn quốc nhạc quốc gia', 'Danh từ', '국립국악단 공연을 처음 봤어요.', 'Lần đầu tôi xem buổi diễn của Đoàn quốc nhạc quốc gia.'),
  ('4A-L6', '4A', '비보이', 'bi-bo-i', 'B-boy / vũ công breakdance', 'Danh từ', '비보이 팀의 춤이 대단했어요.', 'Điệu nhảy của nhóm B-boy rất tuyệt.'),
  ('4A-L6', '4A', '한자리', 'han-ja-ri', 'Một chỗ / cùng một nơi', 'Danh từ', '전통 공연과 현대 공연이 한자리에 모였어요.', 'Biểu diễn truyền thống và hiện đại cùng tụ họp ở một nơi.'),
  ('4A-L6', '4A', '어우러지다', 'eo-u-reo-ji-da', 'Hòa quyện / hòa hợp', 'Động từ', '음악과 춤이 잘 어우러졌어요.', 'Âm nhạc và điệu nhảy hòa quyện rất tốt.'),
  ('4A-L6', '4A', '기회를 놓치다', 'gi-hoe-reul no-chi-da', 'Bỏ lỡ cơ hội', 'Cụm động từ', '좋은 공연을 볼 기회를 놓쳤어요.', 'Tôi đã bỏ lỡ cơ hội xem buổi diễn hay.'),
  ('4A-L6', '4A', '기악', 'gi-ak', 'Nhạc khí / nhạc không lời', 'Danh từ', '기악 연주를 감상했어요.', 'Tôi đã thưởng thức phần biểu diễn nhạc khí.'),
  ('4A-L6', '4A', '머드 축제', 'meo-deu chuk-je', 'Lễ hội Bùn', 'Danh từ', '보령 머드 축제는 유명해요.', 'Lễ hội Bùn Boryeong rất nổi tiếng.'),
  ('4A-L6', '4A', '하나마쓰리', 'ha-na-ma-sseu-ri', 'Hanamatsuri / lễ hội hoa Phật giáo Nhật Bản', 'Danh từ', '일본의 하나마쓰리에 대해 들었어요.', 'Tôi đã nghe về lễ hội Hanamatsuri của Nhật Bản.'),
  ('4A-L6', '4A', '하얼빈', 'ha-eol-bin', 'Cáp Nhĩ Tân / Harbin', 'Danh từ', '하얼빈 얼음 축제가 유명해요.', 'Lễ hội băng Harbin rất nổi tiếng.'),
  ('4A-L6', '4A', '절', 'jeol', 'Chùa', 'Danh từ', '절에서 전통 행사가 열렸어요.', 'Sự kiện truyền thống được tổ chức ở chùa.'),
  ('4A-L6', '4A', '삼바', 'sam-ba', 'Điệu samba', 'Danh từ', '브라질 축제에서 삼바 춤을 봤어요.', 'Tôi đã xem điệu samba tại lễ hội Brazil.'),
  ('4A-L6', '4A', '충남', 'chung-nam', 'Chungnam / tỉnh Chungcheong Nam', 'Danh từ', '대천 해수욕장은 충남에 있어요.', 'Bãi biển Daecheon nằm ở Chungnam.'),
  ('4A-L6', '4A', '대천', 'dae-cheon', 'Daecheon', 'Danh từ', '대천에서 머드 축제가 열려요.', 'Lễ hội Bùn được tổ chức ở Daecheon.'),
  ('4A-L6', '4A', '해수욕장', 'hae-su-yok-jjang', 'Bãi biển tắm biển', 'Danh từ', '해수욕장에 관광객이 많아요.', 'Ở bãi biển có nhiều du khách.'),
  ('4A-L6', '4A', '펼쳐지다', 'pyeol-cheo-ji-da', 'Được mở ra / diễn ra', 'Động từ', '해변에서 다양한 행사가 펼쳐졌어요.', 'Nhiều sự kiện đa dạng đã diễn ra trên bãi biển.'),
  ('4A-L6', '4A', '국내외', 'gung-nae-oe', 'Trong và ngoài nước', 'Danh từ', '국내외 관광객이 몰려들었어요.', 'Du khách trong và ngoài nước đã đổ về.'),
  ('4A-L6', '4A', '관광객', 'gwan-gwang-gaek', 'Khách du lịch / khách tham quan', 'Danh từ', '축제 기간에 관광객이 많아요.', 'Trong thời gian lễ hội có nhiều du khách.'),
  ('4A-L6', '4A', '몰려들다', 'mol-lyeo-deul-da', 'Đổ về / kéo đến đông', 'Động từ', '관광객들이 해수욕장으로 몰려들었어요.', 'Du khách đã đổ về bãi biển.'),
  ('4A-L6', '4A', '미끄럽다', 'mi-kkeu-reop-tta', 'Trơn / trơn trượt', 'Tính từ', '머드 축제장은 바닥이 미끄러워요.', 'Sàn khu lễ hội bùn rất trơn.'),
  ('4A-L6', '4A', '대표하다', 'dae-pyo-ha-da', 'Đại diện / tiêu biểu cho', 'Động từ', '부채춤은 한국 전통 춤을 대표해요.', 'Múa quạt đại diện cho điệu múa truyền thống Hàn Quốc.'),
  ('4A-L6', '4A', '예술품', 'ye-sul-pum', 'Tác phẩm nghệ thuật', 'Danh từ', '그 도자기는 훌륭한 예술품이에요.', 'Đồ gốm đó là một tác phẩm nghệ thuật tuyệt vời.'),
  ('4A-L6', '4A', '신경 쓰다', 'sin-gyeong sseu-da', 'Để ý / bận tâm', 'Cụm động từ', '공연 평가에 너무 신경 쓰지 마세요.', 'Đừng quá bận tâm đến đánh giá buổi biểu diễn.'),
  ('4A-L6', '4A', 'K 팝', 'ke-i pap', 'K-pop', 'Danh từ', 'K 팝 공연은 해외에서도 인기가 많아요.', 'Biểu diễn K-pop cũng rất nổi tiếng ở nước ngoài.'),
  ('4A-L6', '4A', '공포 영화', 'gong-po yeong-hwa', 'Phim kinh dị', 'Danh từ', '저는 공포 영화를 잘 못 봐요.', 'Tôi không xem phim kinh dị giỏi.'),
  ('4A-L6', '4A', '멜로 영화', 'mel-lo yeong-hwa', 'Phim tình cảm', 'Danh từ', '감동적인 멜로 영화를 봤어요.', 'Tôi đã xem một bộ phim tình cảm cảm động.'),
  ('4A-L6', '4A', '액션 영화', 'aek-syeon yeong-hwa', 'Phim hành động', 'Danh từ', '액션 영화는 볼거리가 많아요.', 'Phim hành động có nhiều cảnh đáng xem.'),
  ('4A-L6', '4A', '은근히', 'eun-geun-hi', 'Ngầm / khá là / âm thầm', 'Trạng từ', '그 공연이 은근히 재미있었어요.', 'Buổi biểu diễn đó khá là thú vị.'),
  ('4A-L6', '4A', '넘어가다', 'neo-meo-ga-da', 'Chuyển sang / vượt qua / bị chuyển cho', 'Động từ', '다음 순서로 넘어가겠습니다.', 'Chúng ta sẽ chuyển sang phần tiếp theo.'),
  ('4A-L6', '4A', '임', 'im', 'Người thương / người ấy', 'Danh từ', '옛 노래에는 임을 그리워하는 가사가 많아요.', 'Trong các bài hát xưa có nhiều lời ca nhớ người thương.'),
  ('4A-L6', '4A', '변명하다', 'byeon-myeong-ha-da', 'Biện minh / thanh minh', 'Động từ', '늦은 이유를 변명하지 마세요.', 'Đừng biện minh lý do đến muộn.'),
  ('4A-L6', '4A', '발병', 'bal-byeong', 'Phát bệnh / khởi phát bệnh', 'Danh từ', '발병 원인을 조사했어요.', 'Đã điều tra nguyên nhân phát bệnh.'),
  ('4A-L6', '4A', '별명', 'byeol-myeong', 'Biệt danh', 'Danh từ', '그 가수의 별명이 재미있어요.', 'Biệt danh của ca sĩ đó rất thú vị.'),
  ('4A-L6', '4A', '지역', 'ji-yeok', 'Khu vực / vùng', 'Danh từ', '지역 축제가 열렸어요.', 'Lễ hội địa phương đã được tổ chức.'),
  ('4A-L6', '4A', '경기', 'gyeong-gi', 'Trận đấu / cuộc thi đấu', 'Danh từ', '경기 전에 축하 공연이 있었어요.', 'Trước trận đấu có màn biểu diễn chúc mừng.'),
  ('4A-L6', '4A', '상을 받다', 'sang-eul bat-tta', 'Nhận giải / nhận thưởng', 'Cụm động từ', '그 영화가 큰 상을 받았어요.', 'Bộ phim đó đã nhận giải lớn.'),
  ('4A-L6', '4A', '진도', 'jin-do', 'Tiến độ', 'Danh từ', '수업 진도가 빠른 편이에요.', 'Tiến độ bài học khá nhanh.'),
  ('4A-L6', '4A', '정신', 'jeong-sin', 'Tinh thần / thái độ', 'Danh từ', '축제 정신을 널리 알리고 싶어요.', 'Tôi muốn quảng bá rộng rãi tinh thần lễ hội.'),
  ('4A-L6', '4A', '널리', 'neol-li', 'Một cách rộng rãi', 'Trạng từ', '한국 문화를 널리 알리고 있어요.', 'Đang quảng bá văn hóa Hàn Quốc rộng rãi.'),
  ('4A-L6', '4A', '방식', 'bang-sik', 'Phương thức / cách thức', 'Danh từ', '공연 방식이 신선했어요.', 'Cách thức biểu diễn rất mới mẻ.'),
  ('4A-L6', '4A', '신선하다', 'sin-seon-ha-da', 'Mới mẻ / tươi mới', 'Tính từ', '무대 연출이 신선했어요.', 'Dàn dựng sân khấu rất mới mẻ.'),
  ('4A-L6', '4A', '새롭다', 'sae-rop-tta', 'Mới / mới lạ', 'Tính từ', '전통 음악이 새롭게 느껴졌어요.', 'Âm nhạc truyền thống được cảm nhận rất mới lạ.'),
  ('4A-L6', '4A', '유튜브', 'yu-tyu-beu', 'YouTube', 'Danh từ', '유튜브에서 공연 영상을 봤어요.', 'Tôi đã xem video biểu diễn trên YouTube.'),
  ('4A-L6', '4A', '체험 프로그램', 'che-heom peu-ro-geu-raem', 'Chương trình trải nghiệm', 'Danh từ', '축제에 체험 프로그램이 많아요.', 'Lễ hội có nhiều chương trình trải nghiệm.'),
  ('4A-L6', '4A', '요트', 'yo-teu', 'Du thuyền / thuyền buồm nhỏ', 'Danh từ', '요트 체험 프로그램에 참여했어요.', 'Tôi đã tham gia chương trình trải nghiệm du thuyền.'),
  ('4A-L6', '4A', '반응', 'ba-neung', 'Phản ứng', 'Danh từ', '관객 반응이 뜨거웠어요.', 'Phản ứng của khán giả rất sôi nổi.'),
  ('4A-L6', '4A', '궁중 음악', 'gung-jung eu-mak', 'Nhạc cung đình', 'Danh từ', '궁중 음악은 우아한 느낌이 있어요.', 'Nhạc cung đình có cảm giác tao nhã.'),
  ('4A-L6', '4A', '부채춤', 'bu-chae-chum', 'Múa quạt', 'Danh từ', '부채춤 동작이 정말 우아했어요.', 'Động tác múa quạt thật sự tao nhã.'),
  ('4A-L6', '4A', '인상적이다', 'in-sang-jeo-gi-da', 'Gây ấn tượng', 'Tính từ', '무대가 매우 인상적이었어요.', 'Sân khấu rất ấn tượng.'),
  ('4A-L6', '4A', '우아하다', 'u-a-ha-da', 'Tao nhã / thanh lịch', 'Tính từ', '춤 동작이 우아해요.', 'Động tác múa rất tao nhã.'),
  ('4A-L6', '4A', '춤', 'chum', 'Điệu múa / nhảy', 'Danh từ', '한국 전통 춤을 배웠어요.', 'Tôi đã học múa truyền thống Hàn Quốc.'),
  ('4A-L6', '4A', '판소리', 'pan-so-ri', 'Pansori / nghệ thuật hát kể chuyện truyền thống', 'Danh từ', '판소리는 유네스코 인류 무형 유산이에요.', 'Pansori là di sản phi vật thể của nhân loại UNESCO.'),
  ('4A-L6', '4A', '정서', 'jeong-seo', 'Tình cảm / cảm xúc văn hóa', 'Danh từ', '판소리에는 한국인의 정서가 담겨 있어요.', 'Trong pansori chứa đựng tình cảm của người Hàn.'),
  ('4A-L6', '4A', '강강술래', 'gang-gang-sul-lae', 'Ganggangsullae / múa vòng tròn truyền thống', 'Danh từ', '강강술래는 한국의 전통 놀이이자 춤이에요.', 'Ganggangsullae là trò chơi kiêm điệu múa truyền thống Hàn Quốc.'),
  ('4A-L6', '4A', '억수 장마', 'eok-su jang-ma', 'Mưa dầm xối xả / mùa mưa rất lớn', 'Danh từ', '억수 장마 때문에 축제가 취소됐어요.', 'Vì mưa lớn xối xả nên lễ hội bị hủy.'),
  ('4A-L6', '4A', '수산', 'su-san', 'Thủy sản / hải sản', 'Danh từ', '지역 수산 축제가 열렸어요.', 'Lễ hội thủy sản địa phương đã được tổ chức.'),
  ('4A-L6', '4A', '문경지교', 'mun-gyeong-ji-gyo', 'Tình bạn chí cốt / bạn tri kỷ', 'Danh từ', '두 사람의 우정을 문경지교라고 해요.', 'Tình bạn của hai người được gọi là tình bạn chí cốt.'),
  ('4A-L6', '4A', '동지달', 'dong-ji-dal', 'Tháng có Đông chí / tháng 11 âm lịch', 'Danh từ', '동지달에는 팥죽을 먹는 풍습이 있어요.', 'Vào tháng Đông chí có phong tục ăn cháo đậu đỏ.'),
  ('4A-L6', '4A', '건축', 'geon-chuk', 'Kiến trúc', 'Danh từ', '전통 건축이 아름다워요.', 'Kiến trúc truyền thống rất đẹp.'),
  ('4A-L6', '4A', '인정하다', 'in-jeong-ha-da', 'Công nhận / thừa nhận', 'Động từ', '그 가치를 세계가 인정했어요.', 'Thế giới đã công nhận giá trị đó.'),
  ('4A-L6', '4A', '유네스코', 'yu-ne-seu-ko', 'UNESCO', 'Danh từ', '유네스코에 등재되었어요.', 'Đã được ghi danh vào UNESCO.'),
  ('4A-L6', '4A', '인류 무형 유산', 'il-lyu mu-hyeong yu-san', 'Di sản phi vật thể của nhân loại', 'Danh từ', '판소리는 인류 무형 유산으로 인정받았어요.', 'Pansori đã được công nhận là di sản phi vật thể của nhân loại.'),
  ('4A-L6', '4A', '가사', 'ga-sa', 'Lời bài hát / lời ca', 'Danh từ', '노래 가사가 감동적이에요.', 'Lời bài hát rất cảm động.'),
  ('4A-L6', '4A', '거지', 'geo-ji', 'Người ăn xin', 'Danh từ', '옛이야기에 거지가 등장해요.', 'Trong truyện xưa có người ăn xin xuất hiện.');

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L6', '4A', '~거리 (Thứ để... / chuyện để...)', 'B1+', 'Gắn sau động từ hoặc danh từ để tạo danh từ chỉ đối tượng đáng để xem, nói, cười, lo lắng hoặc quan tâm.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('이 축제에는 볼거리가 정말 많아요.', 'Lễ hội này có rất nhiều thứ đáng xem.'),
  ('여행을 다녀오니 이야깃거리가 생겼어요.', 'Đi du lịch về nên có chuyện để kể.'),
  ('비가 올까 봐 걱정거리가 하나 생겼어요.', 'Vì sợ trời mưa nên có một điều đáng lo.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L6', '4A', '~만 못하다 (Không bằng / không được như...)', 'B1+', 'Danh từ + 만 못하다 dùng để nói kết quả hoặc mức độ không đạt như đối tượng được so sánh.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('공연이 기대만 못했어요.', 'Buổi biểu diễn không được như kỳ vọng.'),
  ('이번 축제는 작년만 못했어요.', 'Lễ hội lần này không bằng năm ngoái.'),
  ('설명은 많았지만 실제 체험만 못했어요.', 'Giải thích thì nhiều nhưng không bằng trải nghiệm thực tế.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L6', '4A', '~을/를 비롯해(서) (Bao gồm / bắt đầu từ...)', 'B2', 'Danh từ + 을/를 비롯해(서) dùng để nêu một đại diện rồi mở rộng sang các đối tượng cùng nhóm.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('부채춤을 비롯해 판소리와 사물놀이도 감상했어요.', 'Tôi đã thưởng thức cả pansori và samulnori, bao gồm cả múa quạt.'),
  ('국내외 관광객을 비롯해 지역 주민들도 축제에 참여했어요.', 'Bao gồm du khách trong và ngoài nước, người dân địa phương cũng tham gia lễ hội.'),
  ('K 팝을 비롯해 힙합과 발라드 공연도 진행됐어요.', 'Bao gồm K-pop, các màn hip-hop và ballad cũng được diễn ra.')
) AS ex(korean, vietnamese);

WITH inserted_grammar AS (
  INSERT INTO seoul_grammar (lesson_id, book_id, pattern, level, explanation, notes)
  VALUES ('4A-L6', '4A', '~을/를 통해 (Thông qua...)', 'B1+', 'Danh từ + 을/를 통해 dùng để nói phương tiện, trải nghiệm hoặc cơ hội giúp đạt được điều gì.', '')
  RETURNING id
)
INSERT INTO seoul_grammar_examples (grammar_id, korean, vietnamese)
SELECT id, ex.korean, ex.vietnamese
FROM inserted_grammar, (VALUES
  ('축제를 통해 한국 문화를 널리 알릴 수 있어요.', 'Thông qua lễ hội có thể quảng bá rộng rãi văn hóa Hàn Quốc.'),
  ('체험 프로그램을 통해 전통 음악을 배웠어요.', 'Thông qua chương trình trải nghiệm, tôi đã học nhạc truyền thống.'),
  ('유튜브를 통해 공연 영상을 공유했어요.', 'Thông qua YouTube, tôi đã chia sẻ video biểu diễn.')
) AS ex(korean, vietnamese);

INSERT INTO seoul_dialogue (lesson_id, speaker, text, translation)
VALUES
  ('4A-L6', '수연', '어제 하이서울페스티벌에 다녀왔어요. 서울 곳곳에서 공연이 진행됐어요.', 'Hôm qua tôi đã đi Lễ hội Hi Seoul. Các buổi biểu diễn diễn ra khắp nơi ở Seoul.'),
  ('4A-L6', '민호', '어땠어요? 볼거리가 많았어요?', 'Thế nào? Có nhiều thứ đáng xem không?'),
  ('4A-L6', '수연', '네, 사물놀이와 비보이 공연이 한자리에서 어우러져서 정말 인상적이었어요.', 'Có, samulnori và biểu diễn B-boy hòa quyện cùng một nơi nên thật sự rất ấn tượng.'),
  ('4A-L6', '민호', '전통 공연은 이해하기 어렵지 않았어요?', 'Biểu diễn truyền thống có khó hiểu không?'),
  ('4A-L6', '수연', '판소리는 조금 어려웠지만 가사가 감동적이라 가슴이 찡했어요.', 'Pansori hơi khó nhưng lời ca cảm động nên tôi xúc động nghẹn ngào.'),
  ('4A-L6', '민호', '저도 다음에는 기회를 놓치지 말고 꼭 가 봐야겠어요.', 'Lần sau tôi cũng nhất định phải không bỏ lỡ cơ hội và đi thử.');

COMMIT;
