-- Migration 058: Insert TOPIK grammar patterns #97-100 (Intermediate level)
-- Ngữ pháp TOPIK #97-100 (Trung cấp)

-- ═══════════════════════════════════════════════════════════════════════════════
-- #97: V – 아/어 놓다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 아/어 놓다',
  'a/eo notta',
  'Làm sẵn rồi, làm sẵn, làm trước rồi',
  'intermediate',
  'state',
  'Thể hiện một hành động nào đó được kết thúc và sau đó trạng thái của nó được duy trì. Tiếng Việt: [...sẵn rồi, ...sẵn, trước rồi]. Thường dùng với phó từ 미리. Khi kết hợp với động từ 놓다 thì không sử dụng hình thức 놓아 놓다 mà sử dụng 놓아 두다.',
  'V + 아/어 놓다',
  '[
    {"korean": "오늘 오후까지 발표 준비를 해 놓아야 해요.", "vietnamese": "Hôm nay tôi phải chuẩn bị bài báo cáo đến buổi chiều."},
    {"korean": "창문을 왜 열어 놓고 있어요?", "vietnamese": "Tại sao lại để cửa mở thế kia?"},
    {"korean": "비행기 표를 미리 사 놓았어요.", "vietnamese": "Tôi đã mua vé máy bay rồi."},
    {"korean": "날씨가 더우니까 제가 회의실에 미리 가서 에어컨을 틀어 놓을게요.", "vietnamese": "Vì thời tiết nóng nên tôi đi đến phòng hội thảo trước và bật điều hòa để đấy."},
    {"korean": "어제 너무 피곤해서 설거지를 안 해 놓고 잤어요.", "vietnamese": "Hôm qua tôi mệt quá nên tôi cứ để bát đấy không rửa mà đi ngủ."}
  ]'::jsonb,
  ARRAY['V – 아/어 두다', 'V – 아/어 있다']::TEXT[],
  ARRAY['state', 'preparation', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어 놓다' LIMIT 1),
  '비행기 표를 미리 사 ___었어요.',
  'fill_blank',
  '["놓", "아", "고", "겠"]'::jsonb,
  '놓',
  'Đã làm sẵn rồi → 사 놓았어요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어 놓다' LIMIT 1),
  '회의실에 미리 가서 에어컨을 틀어 ___을게요.',
  'fill_blank',
  '["놓", "아", "고", "겠"]'::jsonb,
  '놓',
  'Sẽ làm sẵn để đấy → 틀어 놓을게요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #98: V – 아/어 두다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 아/어 두다',
  'a/eo duda',
  'Làm để giữ trạng thái lâu dài',
  'intermediate',
  'state',
  'Diễn tả một hành động xảy ra trong quá khứ nhưng trạng thái của nó vẫn duy trì và kéo dài đến hiện tại và tương lai. Tương tự với cấu trúc – 아/어 놓다. Tuy nhiên, trạng thái của –아/어 두다 được duy trì lâu hơn.',
  'V + 아/어 두다',
  '[
    {"korean": "발표할 때 실수하지 않게 연습을 많이 해 두세요.", "vietnamese": "Để không mắc nhiều lỗi khi phát biểu, hãy luyện tập nhiều vào."},
    {"korean": "잊어버리지 않게 적어 두었어요.", "vietnamese": "Tôi ghi chép để không bị quên."},
    {"korean": "그 동안 은행에 저축해 둔 돈으로 자동차를 샀어요.", "vietnamese": "Tôi đã mua ô tô bằng số tiền tích góp trong ngân hàng thời gian qua."},
    {"korean": "차를 세워 둔 곳이 어디예요?", "vietnamese": "Bạn đã đỗ xe ở đâu thế?"},
    {"korean": "서랍 안에 중요한 것이 많아서 항상 잠가 둡니다.", "vietnamese": "Có nhiều thứ quan trọng trong ngăn kéo nên tôi thường khóa ngăn kéo lại."},
    {"korean": "사람이 없을 때는 방에 꺼 두세요.", "vietnamese": "Khi không có người hãy tắt đèn trong phòng."}
  ]'::jsonb,
  ARRAY['V – 아/어 놓다', 'V – 아/어 있다']::TEXT[],
  ARRAY['state', 'long-term', 'preparation', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어 두다' LIMIT 1),
  '잊어버리지 않게 적어 ___었어요.',
  'fill_blank',
  '["둔", "았", "고", "겠"]'::jsonb,
  '둔',
  'Đã ghi để giữ → 적어 두었어요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어 두다' LIMIT 1),
  '사람이 없을 때는 방에 꺼 ___세요.',
  'fill_blank',
  '["두", "놓", "아", "고"]'::jsonb,
  '두',
  'Giữ trạng thái tắt → 꺼 두세요.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #99: V-(으)ㄴ 채(로)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V-(으)ㄴ 채(로)',
  '(eun)un chae(ro)',
  'Vẫn đang, trong trạng thái, vẫn cứ...',
  'intermediate',
  'state',
  'Diễn tả giữ nguyên trạng thái hành động trước rồi thực hiện hành động phía sau. Tiếng Việt: [vẫn đang, trong trạng thái, vẫn cứ...]. Lưu ý: Trước -(으)ㄴ 채로 không thể kết hợp với thì hiện tại và tương lai. Thường kết hợp chung với cấu trúc 아/어 놓다. Rút gọn: Có thể rút gọn thành -(으)ㄴ 채',
  'V + (으)ㄴ 채(로)',
  '[
    {"korean": "어젯밤에 창문을 열어 놓은 채로 잤더니 감기에 걸린 것 같아요.", "vietnamese": "Đêm qua tôi đi ngủ mà vẫn cứ để cửa mở nên có lẽ bị cảm cúm."},
    {"korean": "한국에서 어른들과 술을 마실 때 고개를 돌린 채로 술을 마셔야 돼요.", "vietnamese": "Ở Hàn Quốc khi uống rượu với người lớn thì phải uống trong trạng thái quay đầu đi."},
    {"korean": "음악을 틀어 놓은 채로 공부가 되니?", "vietnamese": "Bạn học vẫn nghe nhạc sao?"},
    {"korean": "휴대폰 전원을 끈 채로 수리 센터에 가져가야 한다.", "vietnamese": "Quý khách phải mang theo điện thoại trong trạng thái tắt nguồn đến trung tâm sửa chữa."},
    {"korean": "어젯밤에 드라마를 보다가 텔레비전을 켜 놓은 채 잠이 들었다.", "vietnamese": "Đêm qua tôi xem phim truyền hình và chìm vào giấc ngủ trong khi Tivi vẫn đang bật."},
    {"korean": "한국에서는 신발을 신은 채 방에 들어가면 안 된다.", "vietnamese": "Ở Hàn Quốc, không được bước vào trong phòng khi vẫn đang mang giày."},
    {"korean": "너무 피곤해서 화장한 채로 그냥 잤다.", "vietnamese": "Do quá mệt nên tôi đã đi ngủ trong trạng thái chưa tẩy trang."},
    {"korean": "급하게 나오느라고 창문을 열어 놓은 채로 나왔다.", "vietnamese": "Vì vội vàng ra ngoài mà tôi đã đi trong khi cửa sổ vẫn đang mở."}
  ]'::jsonb,
  ARRAY['V – 아/어 놓다']::TEXT[],
  ARRAY['state', 'maintain state', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V-(으)ㄴ 채(로)' LIMIT 1),
  '창문을 열어 놓은 ___로 잤더니 감기에 걸린 것 같아요.',
  'fill_blank',
  '["채", "상태", "때", "것"]'::jsonb,
  '채',
  'Trong trạng thái vẫn mở → 열어 놓은 채로.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V-(으)ㄴ 채(로)' LIMIT 1),
  '신발을 신은 ___ 방에 들어가면 안 된다.',
  'fill_blank',
  '["채", "상태", "때", "것"]'::jsonb,
  '채',
  'Vẫn đang mang giày → 신은 채.',
  'medium'
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- #100: V – 아/어 있다
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO public.grammar_patterns (
  pattern, romanization, meaning, level, category, explanation, usage, examples, related_patterns, tags, topik_level
) VALUES (
  'V – 아/어 있다',
  'a/eo itda',
  'Vẫn còn đang...',
  'intermediate',
  'state',
  'Biểu hiện mô tả trạng thái được tiếp diễn hành động: hành động đã xảy ra và hiện tại vẫn giữ nguyên trạng thái. Đây là cấu trúc chỉ trạng thái tiếp diễn dùng cho các nội động (động từ không cần bổ ngữ đã tự hoàn thiện) 앉다, 서다, 눕다, 기대다, 비다, 남다, 나오다, 가다, 오다, 붙다,... và các bị động từ. Khác với 고 있다 (hành động đang diễn ra) - thường dùng với ngoại động từ và động từ chủ động.',
  'V + 아/어 있다',
  '[
    {"korean": "고양이가 탁자 위에 앉아 있어요.", "vietnamese": "Con mèo vẫn đang ngồi trên bàn."},
    {"korean": "봄이 되자 어느새 나뭇가지에 새순이 돋아 있다.", "vietnamese": "Ngay khi mùa xuân tới, từ lúc nào trên cành cây chồi non vẫn đang ló ra."},
    {"korean": "개가 집 앞 마당에 누워 있어요.", "vietnamese": "Con chó vẫn đang nằm trên sân trước nhà."},
    {"korean": "식당 앞에 오랫동안 서 있었어요.", "vietnamese": "Tôi vẫn đứng chờ trước quán ăn rất lâu."},
    {"korean": "나무 위에 눈이 많이 쌓여 있어요.", "vietnamese": "Cây vẫn bị bao phủ rất nhiều bởi tuyết."},
    {"korean": "제가 봤을 때 가방이 비어 있었어요.", "vietnamese": "Khi tôi nhìn, cái túi vẫn trống rỗng."},
    {"korean": "수술을 한 지 오래 됐지만 상처가 아직 남아 있어요.", "vietnamese": "Tôi đã có cuộc phẫu thuật rất lâu cách đây, nhưng vết sẹo vẫn nằm đó."},
    {"korean": "통장에 아직 100 만원이 남아 있어요.", "vietnamese": "Vẫn đang có 100 triệu Won trong tài khoản."},
    {"korean": "게시판에 붙어 있는 공지를 봤어요.", "vietnamese": "Tôi đã xem thông báo chung vẫn đang dán trên bảng thông báo."}
  ]'::jsonb,
  ARRAY['V – 고 있다', 'V – 아/어 놓다']::TEXT[],
  ARRAY['state', 'intransitive verb', 'passive verb', 'topik2', 'intermediate']::TEXT[],
  'TOPIK II'
);

INSERT INTO public.grammar_practice_questions (pattern_id, question, question_type, options, correct_answer, explanation, difficulty) VALUES
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어 있다' LIMIT 1),
  '고양이가 탁자 위에 앉아 ___.',
  'fill_blank',
  '["있어요.", "했어요.", "겠어요.", "할게요."]'::jsonb,
  '있어요.',
  'Vẫn đang ngồi → 앉아 있어요.',
  'medium'
),
(
  (SELECT id FROM public.grammar_patterns WHERE pattern = 'V – 아/어 있다' LIMIT 1),
  '통장에 아직 100 만원이 남아 ___.',
  'fill_blank',
  '["있어요.", "했어요.", "겠어요.", "할게요."]'::jsonb,
  '있어요.',
  'Vẫn còn có → 남아 있어요.',
  'medium'
);
