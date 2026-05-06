-- Migration 061: Insert TOPIK grammar patterns #122-129 (Intermediate level)
-- Ngữ pháp TOPIK #122-129 (Trung cấp)

-- ═══════════════════════════════════════════════════════════════════════════════
-- #122: A/V – 다고 하던데 – 다고 했던데
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 다고 하던데 – 다고 했던데',
  'dago hadeonde - dago haetdeonde',
  'Tôi thấy nói là..., nghe nói... (hồi tưởng lời người khác nói)',
  'intermediate',
  'indirect_speech',
  'Hồi tưởng hoặc xác nhận những điều người khác đã nói trước đó.

A/V – 다고 하던데: điều mà người thứ 3 nói [tôi thấy anh chị ấy/người ta nói là...]. Mệnh đề sau diễn tả quan điểm, câu hỏi, lời khuyên hoặc gợi ý.',
  'A/V + 다고 하던데 / A/V + 다고 했던데',
  '[
    {"korean": "어제 흐엉 씨가 모임에 가자고 하던데 같이 갈래요?", "vietnamese": "Hôm qua Hương đã rủ tớ đến buổi gặp mặt, cậu đi cùng nhé?"},
    {"korean": "가: 오늘 저녁은 어디에서 먹을까요? 나: 여기 근처에 베트남 식당이 있다고 하던데 거기에서 먹는 게 어때요?", "vietnamese": "가: Tối nay chúng ta ăn ở đâu nhỉ? 나: Tớ nghe nói là ở gần đây có nhà hàng Việt Nam, đến đó ăn được chứ?"},
    {"korean": "다음 주말에 란 씨가 아기 돌잔치를 할거라고 하던데 갈 거예요?", "vietnamese": "Tôi nghe nói là cuối tuần sau Lan sẽ làm tiệc thôi nôi cho đứa con cô ấy, cậu có đi không?"},
    {"korean": "가: 마크 씨가 지금 어디에 있는지 아세요? 나: 아까 헬스클럽에 간다고 하던데요.", "vietnamese": "가: Bạn biết Mark ở đâu không? 나: Lúc nãy anh ấy nói anh ấy đi đến câu lạc bộ thể hình."},
    {"korean": "가: 마이 씨, 우리 방학에 어디로 여행할 갈까요? 나: 흐엉 씨가 베트남의 달랏이 너무 아름답다고 하던데 거기에 갈까요?", "vietnamese": "가: Mai, kỳ nghỉ này mình đi du lịch đâu nhỉ? 나: Hương nói là Đà Lạt rất đẹp, chúng ta đến đó nhé?"}
  ]'::jsonb,
  ARRAY['간접화법', '–다고 하다', '–다고 했어요']::TEXT[],
  ARRAY['indirect_speech', 'retrospective', 'confirmation', 'spoken', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '어제 흐엉 씨가 모임에 가자고 ___데 같이 갈래요?', 'fill_blank', '["하던", "했던", "하는", "한"]'::jsonb, 0,
  'Hồi tưởng lời đã nói → 하던데.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 다고 하던데 – 다고 했던데' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '여기 근처에 베트남 식당이 있다고 ___데 거기에서 먹는 게 어때요?', 'fill_blank', '["하던", "했던", "하는", "한"]'::jsonb, 0,
  'Hồi tưởng điều đã nghe → 하던데.'
FROM public.grammar_patterns WHERE pattern = 'A/V – 다고 하던데 – 다고 했던데' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #123: A/V – 다면서요?
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 다면서요?',
  'damyeonyo?',
  'Nghe nói..., hình như bạn đã nói rằng... phải không? (xác nhận thông tin đã nghe)',
  'intermediate',
  'indirect_speech',
  'Để hỏi và xác nhận lại một sự thật, thông tin nào đó mà người nói đã biết hoặc nghe ở đâu đó rồi, nhưng còn chưa chắc chắn. Người nói nghe từ nguồn khác sau đó hỏi đối phương.

Có thể được rút gọn thành –다면서? / 다며? Sử dụng khi trò chuyện với những người thân thiết, bạn bè.',
  'A/V + 다면서요? (hoặc: 다면서? / 다며?)',
  '[
    {"korean": "가: 어제 하노이에 비가 많이 내렸다면서요? 나: 네, 정말 많이 오더라고요.", "vietnamese": "가: Tôi nghe nói hôm qua ở Hà Nội mưa to lắm phải không? 나: Vâng, tôi thấy đã mưa rất nhiều."},
    {"korean": "가: 한국 남자들은 모두 군대에 가야 한다면서요? 나: 네, 맞아요.", "vietnamese": "가: Nghe nói tất cả con trai Hàn Quốc đều phải đi nhập ngũ hả? 나: Vâng, đúng vậy."},
    {"korean": "어제 시험이 너무 어려웠다면서요?", "vietnamese": "Nghe nói bài thi hôm qua rất khó hả?"},
    {"korean": "어제 많이 울었다면서?", "vietnamese": "Nghe nói hôm qua bạn đã khóc rất nhiều?"},
    {"korean": "숙제를 다 했으며?", "vietnamese": "Nghe nói bạn đã làm hết bài tập rồi hả?"},
    {"korean": "한국에서는 신문사에 취직하기가 힘들다면서요?", "vietnamese": "Nghe trên báo nói là ở Hàn Quốc xin việc khó khăn lắm phải không?"},
    {"korean": "다음 방학에 여행을 갈 거라면서요?", "vietnamese": "Nghe nói kỳ nghỉ tới bạn sẽ đi du lịch à?"}
  ]'::jsonb,
  ARRAY['간접화법', '–다니요?', '–(으)라고요?']::TEXT[],
  ARRAY['indirect_speech', 'confirmation', 'surprise', 'spoken', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '어제 하노이에 비가 많이 내렸다___요?', 'fill_blank', '["면서", "는데", "니", "고"]'::jsonb, 0,
  'Xác nhận thông tin đã nghe → 다면서요?'
FROM public.grammar_patterns WHERE pattern = 'A/V – 다면서요?' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '숙제를 다 했__?', 'fill_blank', '["으며", "는데", "니", "고"]'::jsonb, 0,
  'Rút gọn thân mật → 했으며?'
FROM public.grammar_patterns WHERE pattern = 'A/V – 다면서요?' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #124: A/V – 다니요?
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'A/V – 다니요?',
  'daniyo?',
  'Đã nói là... ư? Có thật là nói... như vậy không? (ngạc nhiên)',
  'intermediate',
  'indirect_speech',
  'Cấu trúc này lặp lại lời của đối phương để diễn tả cảm giác ngạc nhiên của người nói. Người nói ngạc nhiên hoặc không tin điều người khác nói là đúng, là thật.',
  'A/V + 다니요?',
  '[
    {"korean": "가: 흐엉 씨가 방탄소년단을 만났대요. 나: 방탄소년단을 만났다니요? 정말 부러워요.", "vietnamese": "가: Hương nói là đã gặp nhóm BTS đấy. 나: Đã nói là gặp nhóm BTS ư? Ganh tị thật đấy."},
    {"korean": "가: 기말시험이 언제인지 아세요? 나: 언제인지 아냐니요? 어제인데 몰랐어요?", "vietnamese": "가: Bạn biết khi nào thi giữa kì không? 나: Bạn hỏi là khi nào ư? Khi nào cũng không biết á?"},
    {"korean": "가: 은혜 씨가 복권에 당첨되었대요. 나: 복권에 당첨되었다니요? 그게 사실이에요?", "vietnamese": "가: Eunhye nói cô ấy trúng xổ số. 나: Cô ấy trúng xổ số á? Có thật không đấy?"},
    {"korean": "가: 란 씨, 늦었는데 이제 가요. 나: 벌써 가자니요? 이제 11 시밖에 안 되었는데요.", "vietnamese": "가: Lan, muộn rồi, bây giờ đi thôi. 나: Bây giờ về á? Mới có 11h thôi mà."}
  ]'::jsonb,
  ARRAY['간접화법', '–다면서요?']::TEXT[],
  ARRAY['indirect_speech', 'surprise', 'disbelief', 'spoken', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '방탄소년단을 만났___요? 정말 부러워요.', 'fill_blank', '["다니", "면서", "는데", "고"]'::jsonb, 0,
  'Ngạc nhiên lặp lại lời → 만났다니요?'
FROM public.grammar_patterns WHERE pattern = 'A/V – 다니요?' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '벌써 가자___요? 이제 11 시밖에 안 되었는데요.', 'fill_blank', '["니", "면서", "는데", "고"]'::jsonb, 0,
  'Ngạc nhiên, khó tin → 가자니요?'
FROM public.grammar_patterns WHERE pattern = 'A/V – 다니요?' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #125: V – (으)ㄹ까 하다 / (으)ㄹ까 – (으)ㄹ까 말까 하다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)ㄹ까 하다 / (으)ㄹ까 – (으)ㄹ까 말까 하다',
  '(eu)lkka hada / (eu)lkka - (eu)lkka malkka hada',
  'Dự định, phân vân... (chưa chắc chắn)',
  'intermediate',
  'intention',
  'Người nói thể hiện việc suy nghĩ hoặc dự định sẽ làm gì đó chưa chắc chắn, có thể thay đổi. Thể hiện sự do dự của chủ thể, đang phân vân, cân nhắc.

Có thể sử dụng dạng (으)ㄹ까 – (으)ㄹ까 하다 để thể hiện phân vân giữa 2 việc. Có thể sử dụng dạng (으)ㄹ까 말까 하다 để thể hiện phân vân làm hay không. Chủ ngữ는 나(저), 우리.',
  'V + (으)ㄹ까 하다 / V + (으)ㄹ까 – (으)ㄹ까 하다 / V + (으)ㄹ까 말까 하다',
  '[
    {"korean": "저녁 준비하기 싫어서 주문해서 먹을까 해요.", "vietnamese": "Tôi không thích chuẩn bị bữa tối nên tôi đang định gọi món."},
    {"korean": "이번 방학에 운전을 배울까 말까 해요.", "vietnamese": "Tôi phân vân có nên học lái xe vào kì nghỉ này hay không."},
    {"korean": "낚시할까 소풍 갈까 하는데요.", "vietnamese": "Tôi đang phân vân nên đi câu cá hay đi dã ngoại."},
    {"korean": "이번 주말에 영화를 볼까 보는데 같이 갈래요?", "vietnamese": "Cuối tuần này tôi định đi xem phim, bạn đi cùng nhé?"},
    {"korean": "회사를 옮길까 했는데 월급이 올라서 그냥 다니기로 했어요.", "vietnamese": "Tôi định chuyển công ty nhưng tôi đã được tăng lương nên tôi quyết định ở lại."},
    {"korean": "지난 주말에 등산을 할까 했는데 비가 와서 못 갔어.", "vietnamese": "Tuần trước tôi dự định đi leo núi mà trời mưa nên đã không thể đi được."},
    {"korean": "가: 텔레비전을 새로 샀다면서요? 나: 아직 안 샀어요. 살까 말까 해요.", "vietnamese": "가: Thấy bảo cậu mua TV mới rồi hả? 나: Tôi vẫn chưa mua. Tôi đang phân vân nên mua hay không."}
  ]'::jsonb,
  ARRAY['V – (으)ㄹ까요?', 'V – 려고/으려고 하다']::TEXT[],
  ARRAY['intention', 'hesitation', 'uncertainty', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '이번 방학에 운전을 배울까 말___ 해요.', 'fill_blank', '["까", "게", "려", "는"]'::jsonb, 0,
  'Phân vân làm hay không → 배울까 말까 해요.'
FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ까 하다 / (으)ㄹ까 – (으)ㄹ까 말까 하다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '낚시할까 소풍 갈까 ___데요.', 'fill_blank', '["하는", "하던", "하려", "한"]'::jsonb, 0,
  'Phân vân giữa 2 việc → 하는데요.'
FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ까 하다 / (으)ㄹ까 – (으)ㄹ까 말까 하다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #126: V – 고자
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 고자',
  'goja',
  'Để, để cho (mục đích - văn viết/trang trọng)',
  'intermediate',
  'purpose',
  'Diễn tả nội dung mệnh đề trước là ý đồ hoặc mục đích của hành động ở mệnh đề sau. Chủ yếu sử dụng trong văn viết, khi phát biểu hoặc báo cáo.',
  'V + 고자',
  '[
    {"korean": "살을 빼고자 꾸준히 운동하는 게 좋다.", "vietnamese": "Bạn nên tập thể dục đều đặn để giảm cân."},
    {"korean": "아침에 일어나고자 일찍 자면 됩니다.", "vietnamese": "Bạn nên đi ngủ sớm để dậy sớm."},
    {"korean": "정부는 새로운 일자리를 창출하고자 열심히 노력하고 있습니다.", "vietnamese": "Chính phủ đang nỗ lực hết sức để tạo thêm nhiều việc làm mới."},
    {"korean": "두 나라는 좋은 관계를 유지하고자 새로운 조약을 맺었습니다.", "vietnamese": "Hai nước đã ký kết thỏa thuận mới để duy trì mối quan hệ tốt đẹp."},
    {"korean": "가: 이 늦은 시간에 웬일로 전화를 했어요? 나: 궁금한 것이 있어서 좀 여쭤보고자 전화했습니다.", "vietnamese": "가: Có chuyện gì mà anh gọi điện vào giờ muộn như thế này? 나: Tôi có điều thắc mắc nên tôi gọi điện để hỏi anh chút."},
    {"korean": "가: 은행에 다녀왔어요? 나: 네, 환전을 좀 하고자 다녀왔습니다.", "vietnamese": "가: Anh đến ngân hàng về hả? 나: Vâng, tôi đi ngân hàng để đổi tiền."}
  ]'::jsonb,
  ARRAY['V – 려고/으려고', 'V – 게']::TEXT[],
  ARRAY['purpose', 'written', 'formal', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '살을 빼__ 꾸준히 운동하는 게 좋다.', 'fill_blank', '["고자", "려고", "려면", "려"]'::jsonb, 0,
  'Mục đích văn viết → 빼고자.'
FROM public.grammar_patterns WHERE pattern = 'V – 고자' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '정부는 새로운 일자리를 창출하__ 열심히 노력하고 있습니다.', 'fill_blank', '["고자", "려고", "려면", "려"]'::jsonb, 0,
  'Mục đích trang trọng → 창출하고자.'
FROM public.grammar_patterns WHERE pattern = 'V – 고자' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #127: V – (으)려던 참이다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)려던 참이다',
  '(eu)ryeondeon chamida',
  'Vừa mới có ý định..., đúng lúc định...',
  'intermediate',
  'timing',
  'Diễn tả việc đang định bắt đầu một hành động nào đó đúng vào ngay thời điểm nói. Thường dùng với phó từ 막, 마침. Có thể dùng dạng: (으)려던 참에',
  'V + (으)려던 참이다 / V + (으)려던 참에',
  '[
    {"korean": "가: 이거 사전이에요. 미미 씨 주려고 빌렸어요. 나: 고마워요. 저도 사전을 빌리려던 참이었어요.", "vietnamese": "가: Đây là từ điển. Tớ đã mượn nó cho Mimi. 나: Cảm ơn cậu. Đúng lúc tớ cũng đang định mượn từ điển."},
    {"korean": "제가 전화하려던 참이었어요.", "vietnamese": "Đúng lúc tôi đang định gọi điện."},
    {"korean": "수영장에 가려던 참에 친구가 월요일에는 문을 닫는다고 말했어요.", "vietnamese": "Đúng lúc tôi đang định đi đến bể bơi thì bạn tôi bảo bể bơi đóng cửa vào thứ 2."},
    {"korean": "가: 저 영화가 재미있다고 하는데 저 영화를 볼래요? 나: 좋아요. 그렇지 않아도 나도 보려던 참이었어요.", "vietnamese": "가: Mọi người nói bộ phim đó thú vị, anh muốn đi xem không? 나: Được đấy, em không nói thì vừa đúng lúc anh cũng định đi xem rồi."},
    {"korean": "가: 날씨가 더운데 냉면이나 먹으러 가는 게 어때요? 나: 저도 너무 더워서 냉면을 먹으려던 참인데 잘됐네요.", "vietnamese": "가: Thời tiết đang nắng nóng đi ra ngoài ăn mỳ lạnh nhé? 나: Được đó. Tôi cũng vừa tính ăn mỳ lạnh rồi, vậy thì tốt quá rồi."},
    {"korean": "가: 좀 피곤한데 같이 커피 한 잔 할까요? 나: 좋아요. 저도 지금 막 커피를 좀 마시려던 참이었어요.", "vietnamese": "가: Đang hơi mệt nên mình cùng nhau uống 1 ly cà phê nhé? 나: Được đó. Tôi cũng vừa mới tính uống một chút cà phê đây."}
  ]'::jsonb,
  ARRAY['V – 려고/으려고 하다', '막', '마침']::TEXT[],
  ARRAY['timing', 'intention', 'coincidence', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '저도 사전을 빌리__ 참이었어요.', 'fill_blank', '["려던", "려고", "려면", "려"]'::jsonb, 0,
  'Đúng lúc định làm → 빌리려던 참이었어요.'
FROM public.grammar_patterns WHERE pattern = 'V – (으)려던 참이다' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '제가 전화하__ 참이었어요.', 'fill_blank', '["려던", "려고", "려면", "려"]'::jsonb, 0,
  'Đúng lúc định → 전화하려던 참이었어요.'
FROM public.grammar_patterns WHERE pattern = 'V – (으)려던 참이다' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #128: V – 아/어야지요
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 아/어야지요',
  'a/eo yajiyo',
  'Phải... chứ nhỉ (tự hứa hoặc ý định)',
  'intermediate',
  'intention',
  'Người nói tự hứa với chính bản thân quyết định thực hiện việc nào đó hoặc đơn giản diễn tả ý định của mình.

Có thể sử dụng ở dạng thân mật –아/어야지 hoặc rút gọn thành –아/어야죠.',
  'V + 아/어야지요 (hoặc: 아/어야지 / 아/어야죠)',
  '[
    {"korean": "가: 어제 기생충이라는 영화를 봤는데 정말 재미있었어. 나: 난 아직도 못 봤는데 그렇게 재미있어? 그럼 나도 봐야지.", "vietnamese": "가: Hôm qua tôi đã xem phim Ký sinh trùng, thực sự rất hay. 나: Tôi vẫn chưa được xem phim đó, hay đến thế à? Thế thì tôi cũng phải xem mới được."},
    {"korean": "가: 그렇게 자꾸 지각하다가는 공부하기 어려울 거야. 나: 내일부터는 절대 학교에 지각하지 말아야지요.", "vietnamese": "가: Nếu cứ thường xuyên đi muộn thế này chắc bạn khó học được bài đấy. 나: Kể từ ngày mai tớ phải đi sớm hơn mới được."},
    {"korean": "요즘 배가 많이 나왔네. 올해는 꼭 뱃살을 빼야지.", "vietnamese": "Dạo này bụng béo quá. Năm nay nhất định phải giảm mỡ bụng mới được."},
    {"korean": "운전을 하고 싶어. 올해는 운전 연습을 열심히 해서 꼭 운전 면허증을 따야지.", "vietnamese": "Tôi muốn lái xe. Năm nay nhất định phải chăm chỉ luyện tập lái xe rồi thi lấy bằng lái mới được."},
    {"korean": "가: 일이 잘 될 것 같지 않은데 그만두는 게 좋지 않을까요? 나: 그래도 시작했으니까 끝까지 해 봐야지요.", "vietnamese": "가: Mọi việc có vẻ như không suôn sẻ, liệu có nên dừng lại không nhỉ? 나: Dù sao cũng đã bắt đầu rồi thế nên phải làm đến cùng chứ."},
    {"korean": "가: 요즘 이가 자주 아파요. 나: 그럼, 빨리 치과에 가야지요.", "vietnamese": "가: Dạo này tôi thường bị đau răng. 나: Thế thì bạn phải mau đến nha khoa mới được."}
  ]'::jsonb,
  ARRAY['V – 아/어야', 'V – 려고/으려고 하다']::TEXT[],
  ARRAY['intention', 'self_promise', 'determination', 'spoken', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '내일부터는 절대 학교에 지각하지 말아__요.', 'fill_blank', '["야지", "어야", "려고", "려면"]'::jsonb, 0,
  'Tự hứa với bản thân → 말아야지요.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어야지요' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '빨리 치과에 가__요.', 'fill_blank', '["야지", "어야", "려고", "려면"]'::jsonb, 0,
  'Ý định → 가야지요.'
FROM public.grammar_patterns WHERE pattern = 'V – 아/어야지요' AND topik_level = 'TOPIK II';

-- ═══════════════════════════════════════════════════════════════════════════════
-- #129: V – (으)ㄹ 겸 V – (으)ㄹ 겸
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – (으)ㄹ 겸 V – (으)ㄹ 겸',
  '(eu)l gyeom V – (eu)l gyeom',
  'Vừa để...vừa để... (đồng thời 2 mục đích)',
  'intermediate',
  'purpose',
  'Diễn tả ý định muốn thực hiện hai hành động cùng một lúc của người nói. Cả 2 hành động đều bình đẳng về sự ưu tiên.',
  'V + (으)ㄹ 겸 V + (으)ㄹ 겸',
  '[
    {"korean": "산책도 할 겸 사진도 찍을 겸 집 근처 공원에 갔어요.", "vietnamese": "Tôi đến công viên vừa để chụp ảnh vừa để đi dạo."},
    {"korean": "용돈도 벌 겸 경험도 쌓을 겸 아르바이트를 하려고 해요.", "vietnamese": "Tôi đi làm thêm vừa để kiếm tiền vừa để tích lũy kinh nghiệm."},
    {"korean": "책도 읽을 겸 공부도 할 겸 도서관에 가려고 해요.", "vietnamese": "Tôi định đến thư viện vừa để đọc sách vừa để học bài."},
    {"korean": "기분 전환도 할 겸 쇼핑도 할 겸 명동에 갔어요.", "vietnamese": "Tôi đã đến Myeongdong vừa để thay đổi tâm trạng vừa để mua sắm."},
    {"korean": "한국말도 배울 겸 일도 할 겸 해서 한국에 왔습니다.", "vietnamese": "Tôi đến Hàn Quốc vừa là học tiếng Hàn cũng vừa để làm việc."},
    {"korean": "인사도 할 겸 선물도 드릴 겸 찾아왔어요.", "vietnamese": "Tôi đến để chào hỏi và cũng là để gửi món quà."},
    {"korean": "가: 집까지 걸어서 갈 거예요? 나: 네, 소화가 안 돼서 소화도 시킬 겸 거리 구경도 할 겸 걸어가려고 해요.", "vietnamese": "가: Anh định đi bộ về nhà hả? 나: Vâng, vì không tiêu hóa được nên tôi định đi bộ vừa là để tiêu hóa vừa là để ngắm cảnh xung quanh đường."},
    {"korean": "가: 한국 경제 신문을 보고 있어요? 나: 네, 제 전공이 경제학이라서 경제 공부도 할 겸 한국어 공부도 할 겸 보고 있어요.", "vietnamese": "가: Anh đang đọc báo kinh tế Hàn Quốc hả? 나: Vâng, vì chuyên ngành của tôi là kinh tế học nên tôi đọc vừa là để học kinh tế vừa là để học tiếng Hàn."}
  ]'::jsonb,
  ARRAY['V – (으)러', 'V – 게']::TEXT[],
  ARRAY['purpose', 'dual_purpose', 'simultaneous', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '산책도 할 __ 사진도 찍을 __ 집 근처 공원에 갔어요.', 'fill_blank', '["겸, 겸", "려고, 려고", "게, 게", "러, 러"]'::jsonb, 0,
  'Vừa...vừa... → 할 겸 찍을 겸.'
FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ 겸 V – (으)ㄹ 겸' AND topik_level = 'TOPIK II';

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation)
SELECT id, '용돈도 벌 __ 경험도 쌓을 __ 아르바이트를 하려고 해요.', 'fill_blank', '["겸, 겸", "려고, 려고", "게, 게", "러, 러"]'::jsonb, 0,
  'Đồng thời 2 mục đích → 벌 겸 쌓을 겸.'
FROM public.grammar_patterns WHERE pattern = 'V – (으)ㄹ 겸 V – (으)ㄹ 겸' AND topik_level = 'TOPIK II';
