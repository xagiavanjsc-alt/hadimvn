-- Migration 078: Grammar Patterns #297-305

-- ═══════════════════════════════════════════════════════════════════════════════
-- #297: V – (으)ㄹ 나위도 없다 / (으)ㄹ 여지가 없다  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – (으)ㄹ 나위도 없다', '(eu)l nawido eopda', 'Không cần phải... thêm (hoàn hảo tột đỉnh)', 'advanced', 'degree',
  'Biểu hiện không còn gì có thể hơn, có thể hài lòng thêm nữa. Có thể dùng biểu hiện (으)ㄹ 여지가 없다 thay thế.',
  'V + (으)ㄹ 나위도 없다 / V + (으)ㄹ 나위가 없다',
  '[
    {"korean":"그의 성품은 말할 나위가 없이 좋아요.","vietnamese":"Phẩm chất của anh ấy tốt khỏi phải nói thêm."},
    {"korean":"박 선생은 선생님으로서는 더 할 나위가 없는 사람입니다.","vietnamese":"Thầy Park là một nhà giáo tuyệt vời không phải bàn cãi thêm gì nữa."},
    {"korean":"더 할 나위가 없이 잘 해주는 아빠인데도 아이들은 불만인가 봅니다.","vietnamese":"Dù là người bố tốt không cần phải bàn cãi gì thêm nhưng có vẻ bọn trẻ vẫn không hài lòng."},
    {"korean":"비서실에서 작성한 보고서는 더 할 나위가 없이 완벽했습니다.","vietnamese":"Bản báo cáo làm ở phòng thư ký hoàn chỉnh không cần phải nói."},
    {"korean":"세계적으로 인정받는 회사 제품이니 질은 의심할 나위가 없다고 봅니다.","vietnamese":"Tôi thấy rằng sản phẩm của công ty được thế giới công nhận thì chất lượng không có gì phải nghi ngờ."}
  ]'::jsonb,
  ARRAY['A – 기 짝이 없다','A – 기가 이를 데 없다']::TEXT[],
  ARRAY['degree','perfection','literary','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'그의 성품은 말할___ 없이 좋아요.','fill_blank','["나위가","짝이","여지가","한이"]'::jsonb,0,'더 이상의 여지 없음: 말할 나위가 없다 → 너무 좋아서 말이 필요 없을 정도.'
FROM public.grammar_patterns WHERE pattern='V – (으)ㄹ 나위도 없다' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'질은 의심할___ 없다고 봅니다.','fill_blank','["나위가","짝이","여지가","한이"]'::jsonb,0,'의심 여지 없음: 의심할 나위가 없다 → 완전한 확신.'
FROM public.grammar_patterns WHERE pattern='V – (으)ㄹ 나위도 없다' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #298: V – (으)ㄹ 락 말 락 하다  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – (으)ㄹ 락 말 락 하다', '(eu)l rak mal rak hada', 'Lúc có lúc không..., sắp sửa... (gần ngưỡng)', 'advanced', 'uncertainty',
  'Cấu trúc thể hiện việc nào đó gần như xảy ra hay gần mức độ đó, dao động giữa có và không.',
  'V + (으)ㄹ 락 말 락 하다',
  '[
    {"korean":"안개 때문에 앞 차가 보일락 말락 한다.","vietnamese":"Do sương mù nên xe phía trước lúc thấy lúc không."},
    {"korean":"잠이 겨우 들락 말락 하는데 문 닫는 소리 때문에 잠이 깼다.","vietnamese":"Tôi vừa mới vào giấc ngủ chập chờn thì tiếng đóng cửa đã làm tôi tỉnh giấc."},
    {"korean":"비가 그치고 구름 사이로 해가 나올락 말락 한다.","vietnamese":"Mưa tạnh và mặt trời như đang lấp ló trong những đám mây."},
    {"korean":"늑대가 양을 잡아먹을락 말락 하고 있어요.","vietnamese":"Con sói gần như sắp sửa bắt ăn thịt con cừu."}
  ]'::jsonb,
  ARRAY['V – 을/를 듯 말 듯 하다','V – (으)ㄹ 듯하다']::TEXT[],
  ARRAY['uncertainty','borderline','oscillation','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'안개 때문에 앞 차가 보일락___ 한다.','fill_blank','["말락","듯","것 같","정도로"]'::jsonb,0,'경계선 반복: 보일락 말락 → 보였다 안 보였다 반복.'
FROM public.grammar_patterns WHERE pattern='V – (으)ㄹ 락 말 락 하다' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'잠이 겨우 들락___ 하는데 소리 때문에 잠이 깼다.','fill_blank','["말락","듯","것 같","정도로"]'::jsonb,0,'수면 경계: 들락 말락 → 잠든 것도 깬 것도 아닌 상태.'
FROM public.grammar_patterns WHERE pattern='V – (으)ㄹ 락 말 락 하다' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #299: A/V – (으)ㄹ 무렵  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)ㄹ 무렵', '(eu)l muryeop', 'Khi, vào lúc... (thời điểm xảy ra)', 'advanced', 'time',
  'Dùng để biểu hiện thời điểm xảy ra hành động hoặc trạng thái nào đó. Có thể kết hợp với danh từ (N + 무렵), động từ, tính từ.',
  'V/A + (으)ㄹ 무렵 / N + 무렵',
  '[
    {"korean":"회사가 부도를 낼 무렵에 은행에서 지원을 해줬다.","vietnamese":"Ngân hàng đã hỗ trợ vào thời điểm công ty bị vỡ nợ."},
    {"korean":"자정 무렵에 어선들은 출항을 했다.","vietnamese":"Tàu thuyền đánh cá đã khởi hành vào lúc nửa đêm."},
    {"korean":"이웃아저씨가 저녁 무렵에 세상을 떠났다.","vietnamese":"Ông chú hàng xóm đã từ trần vào lúc chiều tối."},
    {"korean":"우리가 도착했을 무렵에는 비가 오고 있었다.","vietnamese":"Lúc chúng tôi đến nơi thì trời mưa."},
    {"korean":"피아노가 손에 익을 무렵부터 나는 재즈를 치기 시작했다.","vietnamese":"Từ khi quen tay chơi piano thì tôi bắt đầu chơi nhạc jazz."},
    {"korean":"밤이 깊을 무렵 이상한 소리가 들렸다.","vietnamese":"Khi màn đêm buông xuống thì có âm thanh kì lạ vang lên."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 즈음','A/V – (으)ㄹ 때']::TEXT[],
  ARRAY['time','approximate','point_in_time','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'우리가 도착했을___ 에는 비가 오고 있었다.','fill_blank','["무렵","즈음","때쯤","시간"]'::jsonb,0,'과거 도착 시점: 도착했을 무렵 → 행동 시점의 배경 묘사.'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 무렵' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'밤이 깊을___ 이상한 소리가 들렸다.','fill_blank','["무렵","즈음","때쯤","시간"]'::jsonb,0,'시간대 배경: 깊을 무렵 → 특정 시점 상황 묘사.'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 무렵' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #300: A/V – (으)ㄹ 즈음  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'A/V – (으)ㄹ 즈음', '(eu)l jjeum', 'Khi... (thời điểm hoàn thành hành động)', 'advanced', 'time',
  'Dùng để biểu hiện thời điểm xảy ra hành động hoặc trạng thái nào đó. Nhấn mạnh thời điểm hoàn thành hành động. Chỉ kết hợp với động từ và thường dùng dưới dạng (으)ㄹ 즈음에, (으)ㄹ 즈음이다.',
  'V + (으)ㄹ 즈음에 / V + (으)ㄹ 즈음이다',
  '[
    {"korean":"우리 모두 지친 표정이 되었을 즈음에 멀리 바다가 보이기 시작했다.","vietnamese":"Khi tất cả chúng tôi đều trông mệt mỏi, chúng tôi bắt đầu nhìn thấy biển ở đằng xa."},
    {"korean":"빨래를 거의 다 했을 즈음, 남편이 들어왔다.","vietnamese":"Khi tôi giặt đồ gần xong thì chồng tôi bước vào."},
    {"korean":"딸을 유치원에 보냈을 즈음에야 내 시간을 가질 수 있었다.","vietnamese":"Chỉ khi cho con gái đi học mẫu giáo, tôi mới có thời gian dành cho bản thân."},
    {"korean":"우리가 바닷가를 거닐고 있을 즈음이었다.","vietnamese":"Đó là khoảng thời gian chúng tôi đi dạo dọc bãi biển."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 무렵','A/V – (으)ㄹ 때']::TEXT[],
  ARRAY['time','completion','point_in_time','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'빨래를 거의 다 했을___ 남편이 들어왔다.','fill_blank','["즈음","무렵","때쯤","시간"]'::jsonb,0,'완료 직전 시점: 했을 즈음 → 행동 완료 무렵의 다른 사건.'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 즈음' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'딸을 유치원에 보냈을___ 에야 내 시간을 가질 수 있었다.','fill_blank','["즈음","무렵","때쯤","시간"]'::jsonb,0,'완료 시점+야 강조: 보냈을 즈음에야 → 행동 완료 후 비로소.'
FROM public.grammar_patterns WHERE pattern='A/V – (으)ㄹ 즈음' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #301: N – 을/를 막론하고  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'N – 을/를 막론하고', 'eul/reul mangnohago', 'Bất kể, bất cứ... mà không phân biệt (막론하고)', 'advanced', 'inclusive',
  'Cấu trúc thể hiện không cân nhắc hay không phân biệt nội dung mà từ ngữ ở trước thể hiện.',
  'N + 을/를 막론하고',
  '[
    {"korean":"이 청소기는 가볍고 사용법도 간단해서 남녀노소를 막론하고 사용할 수 있습니다.","vietnamese":"Máy hút bụi này nhẹ và cách sử dụng cũng đơn giản nên bất kể nam nữ già trẻ đều có thể sử dụng."},
    {"korean":"사과는 동서양을 막론하고 즐겨 먹는 과일이다.","vietnamese":"Táo là loại trái cây người ta thích ăn bất kể phương Đông hay phương Tây."},
    {"korean":"여야를 막론하고 노인 복지를 위한 예산을 늘리는 데 찬성하였다.","vietnamese":"Bất kể chính đảng hay đảng đối lập đã tán thành việc tăng ngân sách vì phúc lợi người già."}
  ]'::jsonb,
  ARRAY['N – 을/를 불문하고','N – 에 관계없이']::TEXT[],
  ARRAY['inclusive','regardless','formal','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'남녀노소를___ 사용할 수 있습니다.','fill_blank','["막론하고","불문하고","관계없이","막론해서"]'::jsonb,0,'무차별 포괄: 막론하고 → 구분 없이 모두 해당.'
FROM public.grammar_patterns WHERE pattern='N – 을/를 막론하고' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'동서양을___ 즐겨 먹는 과일이다.','fill_blank','["막론하고","불문하고","관계없이","막론해서"]'::jsonb,0,'지역 구분 없음: 동서양을 막론하고 → 어느 지역에나 해당.'
FROM public.grammar_patterns WHERE pattern='N – 을/를 막론하고' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #302: N – 을/를 불문하고  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'N – 을/를 불문하고', 'eul/reul bulmunhago', 'Bất kể, bất cứ... mà không phân biệt (불문하고)', 'advanced', 'inclusive',
  'Cấu trúc thể hiện không cân nhắc hay không phân biệt nội dung mà từ ngữ ở trước thể hiện. Tương tự 막론하고 nhưng 불문하고 thường dùng trong văn pháp luật và quy định chính thức hơn.',
  'N + 을/를 불문하고',
  '[
    {"korean":"남녀를 불문하고 자신을 멋있게 만드는 패션에 관심이 많다.","vietnamese":"Bất kể là nam hay nữ, họ đều rất quan tâm đến thời trang khiến bản thân trông thật đẹp."},
    {"korean":"K-pop 이라면 장르를 불문하고 다 좋아한다.","vietnamese":"Khi nói đến K-pop, tôi thích tất cả bất kể thể loại nào."},
    {"korean":"국적을 불문하고 누구에게나 백신을 맞을 기회를 준다.","vietnamese":"Bất kỳ ai, bất kể quốc tịch, đều có cơ hội được tiêm vắc xin."},
    {"korean":"그는 옷에 관심이 많아서 가격을 불문하고 옷을 산다.","vietnamese":"Anh ấy rất quan tâm đến quần áo nên mua bất chấp giá cả."}
  ]'::jsonb,
  ARRAY['N – 을/를 막론하고','N – 에 관계없이']::TEXT[],
  ARRAY['inclusive','regardless','formal','legal','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'장르를___ 다 좋아한다.','fill_blank','["불문하고","막론하고","관계없이","불문해서"]'::jsonb,0,'장르 구분 없음: 장르를 불문하고 → 모든 장르 포함.'
FROM public.grammar_patterns WHERE pattern='N – 을/를 불문하고' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'국적을___ 누구에게나 백신을 맞을 기회를 준다.','fill_blank','["불문하고","막론하고","관계없이","불문해서"]'::jsonb,0,'국적 무관: 국적을 불문하고 → 공식적 무차별 표현.'
FROM public.grammar_patterns WHERE pattern='N – 을/를 불문하고' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #303: N – (으)로서  (TOPIK IV)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'N – (으)로서', '(eu)roseo', 'Với tư cách là... (địa vị, thân phận)', 'advanced', 'role',
  'Trợ từ thể hiện địa vị, thân phận hay tư cách nào đó.',
  'N + (으)로서',
  '[
    {"korean":"부모로서 자식을 돌보는 것은 당연한 일입니다.","vietnamese":"Với tư cách cha mẹ việc trông coi con cái là việc thường tình."},
    {"korean":"내가 친구로서 너한테 해 줄 수 있는 게 아무것도 없어서 슬프다.","vietnamese":"Là bạn bè mà chẳng có gì mình có thể làm cho cậu nên mình buồn quá."},
    {"korean":"대한민국 국민으로서 선거에 참여하는 것은 당연하지요.","vietnamese":"Với tư cách là công dân Hàn Quốc việc tham gia bầu cử là đương nhiên rồi."},
    {"korean":"사장으로서 직원들에게 해 줄 수 있는 것이 무엇인지 생각해 보십시오.","vietnamese":"Với tư cách giám đốc xin hãy cân nhắc việc có thể làm gì cho các nhân viên của mình."},
    {"korean":"나는 선생님으로서 항상 아이들의 모범이 되기 위해 노력한다.","vietnamese":"Tôi luôn nỗ lực để trở thành tấm gương sáng của bọn trẻ với tư cách là một nhà giáo."}
  ]'::jsonb,
  ARRAY['N – (으)로써','N – (이)란']::TEXT[],
  ARRAY['role','position','qualification','topik4','advanced']::TEXT[],
  'TOPIK IV'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'부모___ 자식을 돌보는 것은 당연한 일입니다.','fill_blank','["로서","로써","으로서","이라서"]'::jsonb,0,'신분/자격 표현: 부모로서 → 부모라는 신분에서 당연한 의무.'
FROM public.grammar_patterns WHERE pattern='N – (으)로서' AND topik_level='TOPIK IV';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'대한민국 국민___ 선거에 참여하는 것은 당연하지요.','fill_blank','["으로서","으로써","이라서","로"]'::jsonb,0,'자격 표현: 국민으로서 → 국민으로서의 의무와 권리.'
FROM public.grammar_patterns WHERE pattern='N – (으)로서' AND topik_level='TOPIK IV';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #304: V – (으)ㄹ 리가 만무하다  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – (으)ㄹ 리가 만무하다', '(eu)l riga manmuhada', 'Không có lí nào, không có lẽ nào... (phủ nhận hoàn toàn)', 'advanced', 'denial',
  'Dùng để biểu hiện về việc mà không có tính khả thi, không có khả năng xảy ra. Mang sắc thái phủ nhận mạnh hơn 리가 없다.',
  'V + (으)ㄹ 리가 만무하다',
  '[
    {"korean":"매일 놀기만 한 친구가 이번 시험에서 1등을 할 리가 만무하다.","vietnamese":"Không có lí nào mà một người bạn mỗi ngày chỉ chơi mà lại giành được hạng nhất trong kì thi lần này."},
    {"korean":"그렇게 착한 사람이 사람을 속일 리가 만무하다.","vietnamese":"Một người tốt như vậy không thể nào lừa gạt người khác được."},
    {"korean":"한국어를 배운지 한 달밖에 안 됐는데 한국어를 한국 사람처럼 말할 리가 만무하다.","vietnamese":"Mới học tiếng Hàn được một tháng nên không có lí nào lại nói tiếng Hàn như người Hàn được."},
    {"korean":"아픈 아이를 집에 혼자 두고 출근한 그녀는 일이 손에 잡힐 리가 만무했다.","vietnamese":"Cô ấy không thể nào đi làm và để con ốm ở nhà một mình được."}
  ]'::jsonb,
  ARRAY['A/V – (으)ㄹ 리가 없다','V – (으)ㄹ 래야 V – (으)ㄹ 수가 없다']::TEXT[],
  ARRAY['denial','impossibility','strong_negation','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'매일 놀기만 한 친구가 1등을 할 리가___.','fill_blank','["만무하다","없다","아니다","불가능하다"]'::jsonb,0,'강한 가능성 부정: 만무하다 → 리가 없다보다 더 강한 부정.'
FROM public.grammar_patterns WHERE pattern='V – (으)ㄹ 리가 만무하다' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'그렇게 착한 사람이 사람을 속일 리가___.','fill_blank','["만무하다","없다","아니다","불가능하다"]'::jsonb,0,'성품 기반 부정: 만무하다 → 완전한 논리적 불가능.'
FROM public.grammar_patterns WHERE pattern='V – (으)ㄹ 리가 만무하다' AND topik_level='TOPIK V';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #305: V – (으)ㄹ 래야 V – (으)ㄹ 수가 없다  (TOPIK V)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level)
VALUES (
  'V – (으)ㄹ 래야 V – (으)ㄹ 수가 없다', '(eu)l raeya ~ (eu)l suga eopda', 'Có muốn... cũng không thể (ý định bị ngăn cản)', 'advanced', 'impossibility',
  'Mặc dù có ý định thực hiện một việc gì đó nhưng có tình huống ngược lại với ý định đó xảy ra nên cuối cùng không thực hiện được ý định ban đầu.',
  'V + (으)ㄹ 래야 + V + (으)ㄹ 수가 없다',
  '[
    {"korean":"이번에는 꼭 담배를 끊기로 다짐했는데 오랫동안 피워서 그런지 끊을래야 끊을 수가 없어요.","vietnamese":"Lần này tôi quyết định bỏ thuốc lá nhưng không biết có phải là do hút thuốc lâu quá không mà có muốn bỏ cũng không thể bỏ được."},
    {"korean":"도서관에서 학생증을 잃어버렸는데 아무리 살펴봐도 찾을래야 찾을 수가 없어요.","vietnamese":"Tôi đã làm mất thẻ học sinh ở thư viện, dù có tìm thế nào cũng không thể tìm được."},
    {"korean":"일이 많이 밀려서 평일이건 주말이건 도통 쉴래야 쉴 수가 없다.","vietnamese":"Vì bị dồn rất nhiều công việc nên dù ngày thường hay ngày cuối tuần có muốn nghỉ cũng không được."},
    {"korean":"비록 그 사람과 헤어졌지만 함께 했던 추억은 잊을래야 잊을 수가 없다.","vietnamese":"Mặc dù tôi đã chia tay với người ấy nhưng tôi hoàn toàn không thể quên được những ký ức cùng người ấy."},
    {"korean":"나를 속였다는 것 때문에 너무 화가 나서 참을래야 도저히 참을 수가 없다.","vietnamese":"Vì việc (ai đó) lừa dối tôi mà tôi vô cùng tức giận nên có bảo nín nhịn cũng hoàn toàn không thể nhịn được."},
    {"korean":"밖에 시끄러워서 책을 읽을래야 읽을 수 없다.","vietnamese":"Bên ngoài ồn ào quá nên có muốn đọc sách cũng không đọc được."}
  ]'::jsonb,
  ARRAY['V – (으)ㄹ 수가 없다','V – (으)려야 V – (으)ㄹ 수 없다']::TEXT[],
  ARRAY['impossibility','intention','obstacle','topik5','advanced']::TEXT[],
  'TOPIK V'
);
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'담배를 끊을래야 끊을 수가___.','fill_blank','["없어요","있어요","됩니다","않아요"]'::jsonb,0,'의도+불가능: 끊을래야 끊을 수가 없다 → 의지 있으나 실현 불가.'
FROM public.grammar_patterns WHERE pattern='V – (으)ㄹ 래야 V – (으)ㄹ 수가 없다' AND topik_level='TOPIK V';
INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id,'그 추억은 잊을래야 잊을___ 없다.','fill_blank','["수가","리가","법이","것이"]'::jsonb,0,'감정 기반 불가능: 잊을래야 잊을 수가 없다 → 잊고 싶어도 못 잊는 상태.'
FROM public.grammar_patterns WHERE pattern='V – (으)ㄹ 래야 V – (으)ㄹ 수가 없다' AND topik_level='TOPIK V';
