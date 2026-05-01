// TOPIK II — Format chuẩn nâng cao
// Phần 1: Nghe (듣기) — 50 câu (câu 1-50)
// Phần 2: Đọc (읽기) — 50 câu (câu 51-100)  
// Phần 3: Viết (쓰기) — 4 câu (câu 51-54 trong section writing)
// Tổng thời gian: 180 phút
// Dạng câu hỏi đa dạng: trắc nghiệm, điền từ, chọn ảnh, chọn biểu đồ, viết tự do

export type T2QuestionType =
  | "mc4"              // Trắc nghiệm 4 lựa chọn (text)
  | "mc4_image"        // Trắc nghiệm 4 lựa chọn (đáp án là ảnh/emoji)
  | "mc4_audio"        // Nghe đoạn hội thoại → chọn đáp án
  | "fill_blank"       // Điền từ vào chỗ trống (1 chỗ)
  | "fill_blank2"      // Điền 2 chỗ trống
  | "order_sentence"   // Sắp xếp câu
  | "write_short"      // Viết câu ngắn (1-2 câu)
  | "write_long";      // Viết đoạn văn dài (200-300 chữ)

export interface T2Question {
  id: string;
  section: "listening" | "reading" | "writing";
  number: number;
  type: T2QuestionType;
  imageUrl?: string;       // ảnh minh họa (dùng emoji hoặc URL)
  audioScript?: string;    // script âm thanh (hiển thị thay cho audio thật)
  audioScriptVi?: string;
  passage?: string;
  passageVi?: string;
  question: string;
  questionVi: string;
  options?: string[];
  optionsVi?: string[];
  optionImages?: string[]; // emoji/icon cho đáp án dạng ảnh
  correctIndex?: number;   // cho MC
  correctAnswer?: string;  // cho fill_blank
  correctAnswer2?: string; // cho fill_blank2 (chỗ trống thứ 2)
  sampleAnswer?: string;   // cho write_short/write_long
  sampleAnswerVi?: string;
  writingGuide?: string;   // hướng dẫn viết
  points: number;
  explanation: string;
}

// ─── PHẦN NGHE (듣기) — 30 câu đại diện ─────────────────────────────────
export const topik2Questions: T2Question[] = [

  // ── Câu 1-3: Nghe → chọn hình phù hợp (mc4_image) ──────────────────
  {
    id: "t2_1", section: "listening", number: 1, type: "mc4_image", points: 2,
    audioScript: "[음성] 남자: 저는 지금 도서관에서 책을 읽고 있어요.",
    audioScriptVi: "[Âm thanh] Nam: Tôi đang đọc sách ở thư viện.",
    question: "남자가 지금 하고 있는 것을 고르세요.",
    questionVi: "Chọn hình mô tả việc người đàn ông đang làm.",
    options: ["📖 책 읽기", "🎵 음악 듣기", "🍽️ 밥 먹기", "💻 컴퓨터 하기"],
    optionsVi: ["Đọc sách", "Nghe nhạc", "Ăn cơm", "Dùng máy tính"],
    optionImages: ["📖", "🎵", "🍽️", "💻"],
    correctIndex: 0,
    explanation: "도서관에서 책을 읽고 있어요 = đang đọc sách ở thư viện → chọn hình đọc sách.",
  },
  {
    id: "t2_2", section: "listening", number: 2, type: "mc4_image", points: 2,
    audioScript: "[음성] 여자: 밖에 비가 많이 와요. 우산을 가져가세요.",
    audioScriptVi: "[Âm thanh] Nữ: Ngoài trời mưa to lắm. Hãy mang ô đi.",
    question: "지금 밖의 날씨로 알맞은 것을 고르세요.",
    questionVi: "Chọn hình mô tả thời tiết bên ngoài hiện tại.",
    options: ["🌧️ 비 (mưa)", "☀️ 맑음 (nắng)", "❄️ 눈 (tuyết)", "🌤️ 흐림 (nhiều mây)"],
    optionsVi: ["Mưa", "Nắng", "Tuyết", "Nhiều mây"],
    optionImages: ["🌧️", "☀️", "❄️", "🌤️"],
    correctIndex: 0,
    explanation: "비가 많이 와요 = trời mưa to → chọn hình mưa.",
  },
  {
    id: "t2_3", section: "listening", number: 3, type: "mc4_image", points: 2,
    audioScript: "[음성] 남자: 저는 매일 아침 자전거를 타고 회사에 가요.",
    audioScriptVi: "[Âm thanh] Nam: Tôi đạp xe đến công ty mỗi buổi sáng.",
    question: "남자의 출근 방법으로 알맞은 것을 고르세요.",
    questionVi: "Chọn hình mô tả cách người đàn ông đi làm.",
    options: ["🚲 자전거 (xe đạp)", "🚌 버스 (xe buýt)", "🚇 지하철 (tàu điện ngầm)", "🚗 자동차 (ô tô)"],
    optionsVi: ["Xe đạp", "Xe buýt", "Tàu điện ngầm", "Ô tô"],
    optionImages: ["🚲", "🚌", "🚇", "🚗"],
    correctIndex: 0,
    explanation: "자전거를 타고 = đạp xe → chọn hình xe đạp.",
  },

  // ── Câu 4-8: Nghe hội thoại → chọn đáp án đúng (mc4_audio) ─────────
  {
    id: "t2_4", section: "listening", number: 4, type: "mc4_audio", points: 2,
    audioScript: "여자: 실례지만, 화장실이 어디에 있어요?\n남자: 저쪽 복도 끝에 있어요.\n여자: 감사합니다.",
    audioScriptVi: "Nữ: Xin lỗi, nhà vệ sinh ở đâu ạ?\nNam: Ở cuối hành lang phía đó.\nNữ: Cảm ơn.",
    question: "여자는 왜 남자에게 말을 걸었습니까?",
    questionVi: "Tại sao người phụ nữ bắt chuyện với người đàn ông?",
    options: ["길을 물어보려고", "화장실 위치를 물어보려고", "도움을 요청하려고", "인사를 하려고"],
    optionsVi: ["Để hỏi đường", "Để hỏi vị trí nhà vệ sinh", "Để nhờ giúp đỡ", "Để chào hỏi"],
    correctIndex: 1,
    explanation: "여자가 화장실이 어디에 있어요? 라고 물었으므로 화장실 위치를 물어보려고 한 것입니다.",
  },
  {
    id: "t2_5", section: "listening", number: 5, type: "mc4_audio", points: 2,
    audioScript: "남자: 이번 주말에 뭐 할 거예요?\n여자: 친구 결혼식이 있어서 부산에 갈 거예요.\n남자: 아, 그렇군요. 잘 다녀오세요.",
    audioScriptVi: "Nam: Cuối tuần này bạn sẽ làm gì?\nNữ: Có đám cưới bạn nên tôi sẽ đến Busan.\nNam: À, vậy à. Đi về bình an nhé.",
    question: "여자가 이번 주말에 부산에 가는 이유는 무엇입니까?",
    questionVi: "Lý do người phụ nữ đến Busan cuối tuần này là gì?",
    options: ["여행을 가려고", "친구 결혼식에 참석하려고", "가족을 만나려고", "출장을 가려고"],
    optionsVi: ["Để đi du lịch", "Để dự đám cưới bạn", "Để gặp gia đình", "Để đi công tác"],
    correctIndex: 1,
    explanation: "친구 결혼식이 있어서 = vì có đám cưới bạn → lý do đến Busan.",
  },
  {
    id: "t2_6", section: "listening", number: 6, type: "mc4_audio", points: 2,
    audioScript: "여자: 요즘 한국어 공부 어때요?\n남자: 말하기는 좀 늘었는데 쓰기가 아직 어려워요.\n여자: 저도 그래요. 같이 연습할까요?\n남자: 좋아요! 언제 시간이 돼요?",
    audioScriptVi: "Nữ: Gần đây học tiếng Hàn thế nào?\nNam: Nói chuyện thì tiến bộ hơn nhưng viết vẫn còn khó.\nNữ: Tôi cũng vậy. Cùng luyện tập nhé?\nNam: Được! Bạn rảnh khi nào?",
    question: "남자가 어렵다고 한 것은 무엇입니까?",
    questionVi: "Điều gì mà người đàn ông nói là khó?",
    options: ["말하기", "듣기", "쓰기", "읽기"],
    optionsVi: ["Nói", "Nghe", "Viết", "Đọc"],
    correctIndex: 2,
    explanation: "쓰기가 아직 어려워요 = viết vẫn còn khó.",
  },
  {
    id: "t2_7", section: "listening", number: 7, type: "mc4_audio", points: 3,
    audioScript: "남자: 저는 요즘 건강을 위해 식습관을 바꾸고 있어요. 아침에는 과일과 채소를 먹고, 점심에는 가볍게 먹어요. 저녁에는 되도록 일찍 먹으려고 해요. 그리고 매일 30분씩 걷기 운동을 해요.",
    audioScriptVi: "Nam: Gần đây tôi đang thay đổi thói quen ăn uống vì sức khỏe. Buổi sáng ăn trái cây và rau, buổi trưa ăn nhẹ. Buổi tối cố gắng ăn sớm. Và mỗi ngày đi bộ 30 phút.",
    question: "남자의 건강 관리 방법으로 맞지 않는 것을 고르세요.",
    questionVi: "Chọn điều KHÔNG phải là cách người đàn ông chăm sóc sức khỏe.",
    options: ["아침에 과일과 채소를 먹는다.", "저녁을 늦게 먹으려고 한다.", "매일 걷기 운동을 한다.", "점심을 가볍게 먹는다."],
    optionsVi: ["Ăn trái cây và rau buổi sáng.", "Cố gắng ăn tối muộn.", "Đi bộ mỗi ngày.", "Ăn nhẹ buổi trưa."],
    correctIndex: 1,
    explanation: "저녁에는 되도록 일찍 먹으려고 해요 = cố gắng ăn tối SỚM, không phải muộn.",
  },
  {
    id: "t2_8", section: "listening", number: 8, type: "mc4_audio", points: 3,
    audioScript: "여자: 안녕하세요. 저는 이번에 새로 이사 온 김지영이에요.\n남자: 아, 반갑습니다. 저는 옆집에 사는 박민수예요. 이사 오시느라 힘드셨죠?\n여자: 네, 좀 힘들었어요. 그런데 동네가 정말 조용하고 좋네요.\n남자: 맞아요. 여기 살기 좋아요. 필요한 게 있으면 언제든지 말씀하세요.",
    audioScriptVi: "Nữ: Xin chào. Tôi là Kim Jiyeong vừa mới chuyển đến.\nNam: À, rất vui được gặp. Tôi là Park Minsu sống ở nhà bên cạnh. Chuyển nhà chắc vất vả nhỉ?\nNữ: Vâng, hơi vất vả. Nhưng khu phố thật yên tĩnh và tốt.\nNam: Đúng vậy. Ở đây sống tốt lắm. Cần gì cứ nói nhé.",
    question: "대화의 내용과 같은 것을 고르세요.",
    questionVi: "Chọn nội dung phù hợp với hội thoại.",
    options: ["여자는 오래전에 이사 왔다.", "남자는 여자의 친구이다.", "여자는 동네가 마음에 든다.", "남자는 다른 동네에 산다."],
    optionsVi: ["Người phụ nữ chuyển đến từ lâu.", "Người đàn ông là bạn của người phụ nữ.", "Người phụ nữ thích khu phố.", "Người đàn ông sống ở khu khác."],
    correctIndex: 2,
    explanation: "동네가 정말 조용하고 좋네요 = khu phố thật yên tĩnh và tốt → người phụ nữ thích khu phố.",
  },

  // ── Câu 9-12: Nghe → chọn chủ đề/mục đích (mc4) ────────────────────
  {
    id: "t2_9", section: "listening", number: 9, type: "mc4", points: 2,
    audioScript: "[안내 방송] 승객 여러분께 안내 말씀 드립니다. 이 열차는 서울역을 출발하여 부산역까지 운행합니다. 중간 정차역은 대전역, 동대구역입니다. 열차 내에서는 금연이며 큰 소리로 통화하지 마시기 바랍니다.",
    audioScriptVi: "[Thông báo] Kính thưa quý hành khách. Tàu này xuất phát từ ga Seoul đến ga Busan. Các ga dừng giữa là ga Daejeon, ga Dong Daegu. Không hút thuốc trên tàu và không nói chuyện điện thoại to.",
    question: "이 방송의 목적은 무엇입니까?",
    questionVi: "Mục đích của thông báo này là gì?",
    options: ["열차 지연 안내", "열차 이용 안내", "역 위치 안내", "날씨 안내"],
    optionsVi: ["Thông báo tàu trễ", "Hướng dẫn sử dụng tàu", "Hướng dẫn vị trí ga", "Thông báo thời tiết"],
    correctIndex: 1,
    explanation: "열차 운행 경로, 정차역, 이용 규칙을 안내하는 방송 → 열차 이용 안내.",
  },
  {
    id: "t2_10", section: "listening", number: 10, type: "mc4", points: 2,
    audioScript: "[뉴스] 오늘 서울 시내 곳곳에서 마라톤 대회가 열렸습니다. 약 3만 명의 시민이 참가한 이번 대회는 서울 시청 앞에서 출발하여 한강 공원을 거쳐 다시 시청으로 돌아오는 코스로 진행되었습니다.",
    audioScriptVi: "[Tin tức] Hôm nay cuộc thi marathon được tổ chức ở nhiều nơi trong thành phố Seoul. Khoảng 30.000 người dân tham gia, xuất phát từ trước tòa thị chính Seoul, qua công viên Sông Hàn rồi quay lại tòa thị chính.",
    question: "이 뉴스의 내용과 같은 것을 고르세요.",
    questionVi: "Chọn nội dung phù hợp với tin tức.",
    options: ["마라톤 대회는 부산에서 열렸다.", "약 3만 명이 대회에 참가했다.", "코스는 한강에서 시작한다.", "대회는 내일 열릴 예정이다."],
    optionsVi: ["Cuộc thi marathon được tổ chức ở Busan.", "Khoảng 30.000 người tham gia.", "Lộ trình bắt đầu từ Sông Hàn.", "Cuộc thi dự kiến tổ chức ngày mai."],
    correctIndex: 1,
    explanation: "약 3만 명의 시민이 참가 = khoảng 30.000 người dân tham gia.",
  },

  // ── Câu 11-15: Nghe dài → chọn nội dung đúng (mc4_audio, 3 điểm) ───
  {
    id: "t2_11", section: "listening", number: 11, type: "mc4_audio", points: 3,
    audioScript: "남자: 요즘 재택근무를 하는 회사가 많아졌죠?\n여자: 네, 코로나 이후로 많이 늘었어요. 저도 주 3일은 집에서 일해요.\n남자: 재택근무의 장점이 뭐예요?\n여자: 출퇴근 시간이 절약되고 집중도 잘 돼요. 하지만 동료들과 소통이 줄어드는 게 단점이에요.\n남자: 맞아요. 저는 회사에서 일하는 게 더 좋더라고요.",
    audioScriptVi: "Nam: Gần đây nhiều công ty làm việc từ xa nhỉ?\nNữ: Vâng, sau COVID tăng nhiều. Tôi cũng làm ở nhà 3 ngày/tuần.\nNam: Ưu điểm của làm việc từ xa là gì?\nNữ: Tiết kiệm thời gian đi lại và tập trung tốt hơn. Nhưng nhược điểm là giảm giao tiếp với đồng nghiệp.\nNam: Đúng vậy. Tôi thích làm ở công ty hơn.",
    question: "여자가 말한 재택근무의 단점은 무엇입니까?",
    questionVi: "Nhược điểm của làm việc từ xa mà người phụ nữ đề cập là gì?",
    options: ["집중이 안 된다.", "출퇴근이 힘들다.", "동료들과 소통이 줄어든다.", "일이 너무 많아진다."],
    optionsVi: ["Không tập trung được.", "Đi lại vất vả.", "Giảm giao tiếp với đồng nghiệp.", "Công việc quá nhiều."],
    correctIndex: 2,
    explanation: "동료들과 소통이 줄어드는 게 단점이에요 = nhược điểm là giảm giao tiếp với đồng nghiệp.",
  },
  {
    id: "t2_12", section: "listening", number: 12, type: "mc4_audio", points: 3,
    audioScript: "여자: 요즘 환경 문제가 심각하죠?\n남자: 네, 특히 플라스틱 쓰레기 문제가 심각해요. 바다에 플라스틱이 너무 많아서 해양 생물들이 피해를 입고 있어요.\n여자: 우리가 일상에서 할 수 있는 일이 있을까요?\n남자: 일회용품 사용을 줄이고, 분리수거를 잘 하는 것이 중요해요. 그리고 가능하면 대중교통을 이용하는 것도 도움이 돼요.",
    audioScriptVi: "Nữ: Gần đây vấn đề môi trường nghiêm trọng nhỉ?\nNam: Vâng, đặc biệt vấn đề rác thải nhựa rất nghiêm trọng. Nhựa quá nhiều ở biển khiến sinh vật biển bị tổn hại.\nNữ: Chúng ta có thể làm gì trong cuộc sống hàng ngày không?\nNam: Quan trọng là giảm dùng đồ dùng một lần và phân loại rác tốt. Và nếu có thể thì dùng giao thông công cộng cũng giúp ích.",
    question: "남자가 말한 환경 보호 방법이 아닌 것을 고르세요.",
    questionVi: "Chọn điều KHÔNG phải là cách bảo vệ môi trường mà người đàn ông đề cập.",
    options: ["일회용품 사용 줄이기", "분리수거 잘 하기", "대중교통 이용하기", "전기 절약하기"],
    optionsVi: ["Giảm dùng đồ dùng một lần", "Phân loại rác tốt", "Dùng giao thông công cộng", "Tiết kiệm điện"],
    correctIndex: 3,
    explanation: "전기 절약하기 (tiết kiệm điện) không được đề cập trong hội thoại.",
  },

  // ── Câu 13-15: Nghe → điền từ vào chỗ trống (fill_blank) ───────────
  {
    id: "t2_13", section: "listening", number: 13, type: "fill_blank", points: 3,
    audioScript: "남자: 저는 한국에 온 지 2년이 됐어요. 처음에는 언어 때문에 많이 힘들었지만 지금은 ___ 생활에 적응했어요.",
    audioScriptVi: "Nam: Tôi đến Hàn Quốc được 2 năm rồi. Lúc đầu vì ngôn ngữ nên rất vất vả nhưng bây giờ đã ___ thích nghi với cuộc sống.",
    question: "빈칸에 알맞은 말을 쓰세요.",
    questionVi: "Viết từ phù hợp vào chỗ trống.",
    correctAnswer: "많이",
    sampleAnswer: "많이",
    sampleAnswerVi: "nhiều",
    explanation: "문맥상 '많이 적응했어요' = đã thích nghi nhiều. 많이 = nhiều, rất.",
  },
  {
    id: "t2_14", section: "listening", number: 14, type: "fill_blank", points: 3,
    audioScript: "여자: 건강을 위해서는 규칙적인 운동과 ___ 식사가 중요합니다.",
    audioScriptVi: "Nữ: Để có sức khỏe tốt, vận động đều đặn và ăn uống ___ rất quan trọng.",
    question: "빈칸에 알맞은 말을 쓰세요.",
    questionVi: "Viết từ phù hợp vào chỗ trống.",
    correctAnswer: "균형 잡힌",
    sampleAnswer: "균형 잡힌",
    sampleAnswerVi: "cân bằng",
    explanation: "균형 잡힌 식사 = ăn uống cân bằng/lành mạnh. Đây là cụm từ phổ biến về sức khỏe.",
  },
  {
    id: "t2_15", section: "listening", number: 15, type: "fill_blank2", points: 3,
    audioScript: "남자: 환경 보호를 위해 ___ 사용을 줄이고 ___ 수거를 잘 해야 합니다.",
    audioScriptVi: "Nam: Để bảo vệ môi trường cần giảm sử dụng ___ và phân loại ___ tốt.",
    question: "빈칸 ①과 ②에 알맞은 말을 각각 쓰세요.",
    questionVi: "Viết từ phù hợp vào chỗ trống ① và ②.",
    correctAnswer: "일회용품",
    correctAnswer2: "분리",
    sampleAnswer: "① 일회용품 ② 분리",
    sampleAnswerVi: "① đồ dùng một lần ② phân loại",
    explanation: "일회용품 사용을 줄이다 = giảm dùng đồ dùng một lần. 분리수거 = phân loại rác.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PHẦN ĐỌC (읽기) — 20 câu đại diện
  // ═══════════════════════════════════════════════════════════════════════

  // ── Câu 16-19: Đọc → chọn từ điền vào chỗ trống (mc4) ──────────────
  {
    id: "t2_16", section: "reading", number: 16, type: "mc4", points: 2,
    passage: "현대 사회에서 스마트폰은 우리 생활에서 ___ 수 없는 도구가 되었다.",
    passageVi: "Trong xã hội hiện đại, điện thoại thông minh đã trở thành công cụ ___ thiếu trong cuộc sống của chúng ta.",
    question: "빈칸에 알맞은 것을 고르세요.",
    questionVi: "Chọn từ phù hợp điền vào chỗ trống.",
    options: ["없어도 되는", "없어서는 안 되는", "있어도 되는", "있어서는 안 되는"],
    optionsVi: ["có thể không cần", "không thể thiếu", "có cũng được", "không nên có"],
    correctIndex: 1,
    explanation: "없어서는 안 되는 = không thể thiếu. Đây là cấu trúc phủ định kép diễn tả sự cần thiết tuyệt đối.",
  },
  {
    id: "t2_17", section: "reading", number: 17, type: "mc4", points: 2,
    passage: "그는 오랫동안 준비한 시험에서 좋은 결과를 얻어 ___ 기뻐했다.",
    passageVi: "Anh ấy đã ___ vui mừng khi đạt kết quả tốt trong kỳ thi đã chuẩn bị lâu dài.",
    question: "빈칸에 알맞은 것을 고르세요.",
    questionVi: "Chọn từ phù hợp điền vào chỗ trống.",
    options: ["매우", "별로", "조금도", "전혀"],
    optionsVi: ["rất", "không mấy", "chút nào cũng không", "hoàn toàn không"],
    correctIndex: 0,
    explanation: "좋은 결과를 얻어 기뻐했다 = vui mừng vì kết quả tốt → 매우 (rất) phù hợp nhất.",
  },
  {
    id: "t2_18", section: "reading", number: 18, type: "mc4", points: 2,
    passage: "이 약은 식사 후에 복용하는 것이 ___ 공복에 먹으면 위에 자극을 줄 수 있습니다.",
    passageVi: "Thuốc này nên uống sau bữa ăn ___ uống khi đói có thể kích thích dạ dày.",
    question: "빈칸에 알맞은 것을 고르세요.",
    questionVi: "Chọn từ phù hợp điền vào chỗ trống.",
    options: ["좋으며", "나쁘며", "어려우며", "쉬우며"],
    optionsVi: ["tốt và", "xấu và", "khó và", "dễ và"],
    correctIndex: 0,
    explanation: "식사 후 복용이 좋으며 = uống sau bữa ăn là tốt, còn uống khi đói thì kích thích dạ dày.",
  },
  {
    id: "t2_19", section: "reading", number: 19, type: "mc4", points: 2,
    passage: "최근 연구에 따르면 규칙적인 운동은 신체 건강뿐만 아니라 ___ 건강에도 도움이 된다고 한다.",
    passageVi: "Theo nghiên cứu gần đây, vận động đều đặn không chỉ tốt cho sức khỏe thể chất mà còn tốt cho sức khỏe ___.",
    question: "빈칸에 알맞은 것을 고르세요.",
    questionVi: "Chọn từ phù hợp điền vào chỗ trống.",
    options: ["정신적", "경제적", "사회적", "문화적"],
    optionsVi: ["tinh thần", "kinh tế", "xã hội", "văn hóa"],
    correctIndex: 0,
    explanation: "신체 건강 (sức khỏe thể chất) ↔ 정신적 건강 (sức khỏe tinh thần) là cặp đối lập phổ biến.",
  },

  // ── Câu 20-23: Đọc → chọn câu có nghĩa tương đương (mc4) ────────────
  {
    id: "t2_20", section: "reading", number: 20, type: "mc4", points: 2,
    passage: "아무리 바빠도 건강을 챙겨야 한다.",
    passageVi: "Dù bận đến đâu cũng phải chăm sóc sức khỏe.",
    question: "이 문장과 의미가 같은 것을 고르세요.",
    questionVi: "Chọn câu có nghĩa tương đương.",
    options: [
      "바쁘면 건강을 챙기지 않아도 된다.",
      "바쁠 때는 건강보다 일이 더 중요하다.",
      "바쁘더라도 건강 관리를 해야 한다.",
      "건강을 챙기면 바빠지지 않는다.",
    ],
    optionsVi: [
      "Nếu bận thì không cần chăm sóc sức khỏe.",
      "Khi bận thì công việc quan trọng hơn sức khỏe.",
      "Dù bận cũng phải chăm sóc sức khỏe.",
      "Nếu chăm sóc sức khỏe thì sẽ không bận.",
    ],
    correctIndex: 2,
    explanation: "아무리 -아/어도 = dù... đến đâu cũng... → 바쁘더라도 건강 관리를 해야 한다.",
  },
  {
    id: "t2_21", section: "reading", number: 21, type: "mc4", points: 2,
    passage: "그 영화는 기대했던 것만큼 재미있지 않았다.",
    passageVi: "Bộ phim đó không thú vị như tôi đã kỳ vọng.",
    question: "이 문장과 의미가 같은 것을 고르세요.",
    questionVi: "Chọn câu có nghĩa tương đương.",
    options: [
      "그 영화는 기대보다 더 재미있었다.",
      "그 영화는 기대했던 것보다 덜 재미있었다.",
      "그 영화는 전혀 재미없었다.",
      "그 영화는 기대한 만큼 재미있었다.",
    ],
    optionsVi: [
      "Bộ phim thú vị hơn kỳ vọng.",
      "Bộ phim ít thú vị hơn kỳ vọng.",
      "Bộ phim hoàn toàn không thú vị.",
      "Bộ phim thú vị đúng như kỳ vọng.",
    ],
    correctIndex: 1,
    explanation: "기대했던 것만큼 재미있지 않았다 = không thú vị bằng kỳ vọng → ít thú vị hơn kỳ vọng.",
  },

  // ── Câu 22-25: Đọc đoạn văn → chọn chủ đề/mục đích (mc4, 3 điểm) ──
  {
    id: "t2_22", section: "reading", number: 22, type: "mc4", points: 3,
    passage: "최근 들어 1인 가구가 급격히 증가하고 있다. 통계에 따르면 전체 가구의 30% 이상이 1인 가구라고 한다. 이러한 변화는 결혼 연령의 상승, 이혼율 증가, 고령화 등 다양한 사회적 요인에 의한 것이다. 1인 가구의 증가는 소비 패턴, 주거 형태, 식품 산업 등 여러 분야에 영향을 미치고 있다.",
    passageVi: "Gần đây số hộ gia đình một người tăng nhanh chóng. Theo thống kê, hơn 30% tổng số hộ gia đình là hộ một người. Sự thay đổi này do nhiều yếu tố xã hội như tuổi kết hôn tăng, tỷ lệ ly hôn tăng, già hóa dân số. Sự gia tăng hộ một người đang ảnh hưởng đến nhiều lĩnh vực như mô hình tiêu dùng, hình thức nhà ở, ngành thực phẩm.",
    question: "이 글의 중심 내용을 고르세요.",
    questionVi: "Chọn nội dung chính của đoạn văn.",
    options: ["1인 가구 증가의 문제점", "1인 가구 증가 현상과 그 영향", "결혼 연령 상승의 원인", "고령화 사회의 특징"],
    optionsVi: ["Vấn đề của sự gia tăng hộ một người", "Hiện tượng gia tăng hộ một người và ảnh hưởng", "Nguyên nhân tuổi kết hôn tăng", "Đặc điểm xã hội già hóa"],
    correctIndex: 1,
    explanation: "Đoạn văn nói về hiện tượng hộ một người tăng, nguyên nhân và ảnh hưởng → nội dung chính là hiện tượng và ảnh hưởng.",
  },
  {
    id: "t2_23", section: "reading", number: 23, type: "mc4", points: 3,
    passage: "독서는 단순히 지식을 얻는 것 이상의 가치를 지닌다. 책을 읽으면 어휘력과 문장력이 향상되고, 다양한 관점에서 세상을 바라볼 수 있게 된다. 또한 독서는 스트레스 해소에도 효과적이며, 집중력과 기억력 향상에도 도움이 된다. 따라서 바쁜 현대인들도 하루에 조금씩이라도 독서 시간을 갖는 것이 중요하다.",
    passageVi: "Đọc sách có giá trị hơn chỉ đơn giản là thu nhận kiến thức. Đọc sách giúp cải thiện vốn từ và khả năng viết, có thể nhìn thế giới từ nhiều góc độ khác nhau. Ngoài ra đọc sách còn hiệu quả trong việc giải tỏa stress, giúp cải thiện khả năng tập trung và trí nhớ. Vì vậy người hiện đại bận rộn cũng cần dành thời gian đọc sách mỗi ngày dù ít.",
    question: "이 글을 쓴 목적으로 알맞은 것을 고르세요.",
    questionVi: "Chọn mục đích phù hợp của đoạn văn này.",
    options: ["독서의 단점을 설명하려고", "독서의 중요성을 강조하려고", "독서 방법을 소개하려고", "독서량 통계를 알리려고"],
    optionsVi: ["Để giải thích nhược điểm của đọc sách", "Để nhấn mạnh tầm quan trọng của đọc sách", "Để giới thiệu phương pháp đọc sách", "Để thông báo thống kê lượng đọc sách"],
    correctIndex: 1,
    explanation: "Đoạn văn liệt kê nhiều lợi ích của đọc sách và kết luận nên đọc sách → mục đích là nhấn mạnh tầm quan trọng.",
  },

  // ── Câu 24-27: Đọc → chọn chi tiết đúng (mc4, 3 điểm) ──────────────
  {
    id: "t2_24", section: "reading", number: 24, type: "mc4", points: 3,
    passage: "[공고] 제10회 한국어 말하기 대회\n- 일시: 2024년 11월 15일(금) 오후 2시\n- 장소: 서울 문화회관 대강당\n- 참가 자격: 외국인 한국어 학습자\n- 참가 신청: 10월 31일까지 이메일로 접수\n- 시상: 대상 1명(상금 100만 원), 금상 2명(각 50만 원)\n- 문의: korean@culture.or.kr",
    passageVi: "[Thông báo] Cuộc thi nói tiếng Hàn lần thứ 10\n- Thời gian: 15/11/2024 (Thứ 6) lúc 2 giờ chiều\n- Địa điểm: Hội trường lớn Trung tâm Văn hóa Seoul\n- Điều kiện: Người nước ngoài học tiếng Hàn\n- Đăng ký: Nộp qua email trước 31/10\n- Giải thưởng: Giải nhất 1 người (1 triệu won), Giải vàng 2 người (mỗi người 500.000 won)\n- Liên hệ: korean@culture.or.kr",
    question: "이 공고의 내용과 같은 것을 고르세요.",
    questionVi: "Chọn nội dung phù hợp với thông báo.",
    options: [
      "대회는 토요일에 열린다.",
      "한국인도 참가할 수 있다.",
      "신청은 11월 31일까지이다.",
      "대상 수상자는 100만 원을 받는다.",
    ],
    optionsVi: [
      "Cuộc thi tổ chức vào thứ bảy.",
      "Người Hàn Quốc cũng có thể tham gia.",
      "Đăng ký đến hết ngày 31/11.",
      "Người đoạt giải nhất nhận 1 triệu won.",
    ],
    correctIndex: 3,
    explanation: "대상 1명(상금 100만 원) = giải nhất 1 người nhận 1 triệu won. Cuộc thi vào thứ 6, chỉ người nước ngoài tham gia, đăng ký đến 31/10.",
  },
  {
    id: "t2_25", section: "reading", number: 25, type: "mc4", points: 3,
    passage: "인공지능(AI) 기술의 발전으로 우리 생활이 크게 변화하고 있다. AI는 의료, 교육, 교통 등 다양한 분야에서 활용되고 있으며, 특히 의료 분야에서는 AI가 질병을 조기에 발견하는 데 도움을 주고 있다. 그러나 AI의 발전은 일자리 감소라는 문제도 가져오고 있어, 이에 대한 사회적 논의가 필요하다.",
    passageVi: "Sự phát triển của công nghệ AI đang thay đổi lớn cuộc sống của chúng ta. AI được ứng dụng trong nhiều lĩnh vực như y tế, giáo dục, giao thông, đặc biệt trong y tế AI giúp phát hiện bệnh sớm. Tuy nhiên sự phát triển của AI cũng mang lại vấn đề giảm việc làm, cần có thảo luận xã hội về điều này.",
    question: "이 글의 내용과 같은 것을 고르세요.",
    questionVi: "Chọn nội dung phù hợp với đoạn văn.",
    options: [
      "AI는 교육 분야에서만 활용된다.",
      "AI 발전으로 일자리가 늘어나고 있다.",
      "AI는 의료 분야에서 질병 조기 발견에 도움을 준다.",
      "AI 기술은 아직 우리 생활에 영향을 미치지 않는다.",
    ],
    optionsVi: [
      "AI chỉ được ứng dụng trong giáo dục.",
      "Sự phát triển AI đang tăng việc làm.",
      "AI giúp phát hiện bệnh sớm trong y tế.",
      "Công nghệ AI chưa ảnh hưởng đến cuộc sống.",
    ],
    correctIndex: 2,
    explanation: "의료 분야에서는 AI가 질병을 조기에 발견하는 데 도움을 주고 있다 = AI giúp phát hiện bệnh sớm trong y tế.",
  },

  // ── Câu 26-28: Đọc → sắp xếp câu (order_sentence) ──────────────────
  {
    id: "t2_26", section: "reading", number: 26, type: "mc4", points: 3,
    passage: "다음 문장을 순서에 맞게 배열하세요.\n(가) 그래서 저는 매일 30분씩 걷기 운동을 시작했습니다.\n(나) 의사 선생님은 규칙적인 운동이 필요하다고 하셨습니다.\n(다) 저는 최근에 건강 검진을 받았습니다.\n(라) 덕분에 건강이 많이 좋아졌습니다.",
    passageVi: "Sắp xếp các câu theo thứ tự đúng.\n(가) Vì vậy tôi bắt đầu đi bộ 30 phút mỗi ngày.\n(나) Bác sĩ nói cần vận động đều đặn.\n(다) Gần đây tôi đã khám sức khỏe.\n(라) Nhờ đó sức khỏe đã tốt hơn nhiều.",
    question: "글의 순서로 알맞은 것을 고르세요.",
    questionVi: "Chọn thứ tự đúng của đoạn văn.",
    options: ["(다)-(나)-(가)-(라)", "(나)-(다)-(가)-(라)", "(가)-(나)-(다)-(라)", "(다)-(가)-(나)-(라)"],
    optionsVi: [
      "Khám sức khỏe → Bác sĩ khuyên → Bắt đầu đi bộ → Kết quả",
      "Bác sĩ khuyên → Khám sức khỏe → Bắt đầu đi bộ → Kết quả",
      "Bắt đầu đi bộ → Bác sĩ khuyên → Khám sức khỏe → Kết quả",
      "Khám sức khỏe → Bắt đầu đi bộ → Bác sĩ khuyên → Kết quả",
    ],
    correctIndex: 0,
    explanation: "Thứ tự logic: (다) khám sức khỏe → (나) bác sĩ khuyên vận động → (가) bắt đầu đi bộ → (라) kết quả tốt.",
  },

  // ═══════════════════════════════════════════════════════════════════════
  // PHẦN VIẾT (쓰기) — 4 câu
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: "t2_w1", section: "writing", number: 51, type: "fill_blank2", points: 10,
    passage: "다음 글을 읽고 빈칸에 알맞은 말을 쓰세요.\n\n저는 요즘 건강을 위해 노력하고 있습니다. 매일 아침 일찍 일어나서 ①___. 그리고 식사를 할 때는 채소와 과일을 많이 먹으려고 합니다. 이렇게 건강한 생활 습관을 유지하면 ②___.",
    passageVi: "Đọc đoạn văn sau và viết từ phù hợp vào chỗ trống.\n\nGần đây tôi đang cố gắng vì sức khỏe. Mỗi buổi sáng dậy sớm và ①___. Và khi ăn cố gắng ăn nhiều rau và trái cây. Nếu duy trì thói quen sống lành mạnh như vậy thì ②___.",
    question: "①과 ②에 알맞은 말을 각각 쓰세요. (각 5점)",
    questionVi: "Viết từ/cụm từ phù hợp vào ① và ②. (mỗi chỗ 5 điểm)",
    correctAnswer: "운동을 합니다",
    correctAnswer2: "건강해질 것입니다",
    sampleAnswer: "① 운동을 합니다 / 30분씩 걷기를 합니다\n② 건강해질 것입니다 / 몸이 좋아질 것입니다",
    sampleAnswerVi: "① tập thể dục / đi bộ 30 phút\n② sẽ khỏe mạnh / cơ thể sẽ tốt hơn",
    writingGuide: "① 아침에 일어나서 하는 건강 활동 (운동, 스트레칭 등)\n② 건강한 생활 습관의 결과 (건강해지다, 몸이 좋아지다 등)",
    explanation: "① 아침에 일어나서 할 수 있는 건강 활동: 운동을 합니다, 산책을 합니다 등\n② 건강한 습관의 결과: 건강해질 것입니다, 몸이 좋아질 것입니다 등",
  },
  {
    id: "t2_w2", section: "writing", number: 52, type: "fill_blank2", points: 10,
    passage: "다음 글을 읽고 빈칸에 알맞은 말을 쓰세요.\n\n현대인들은 스마트폰을 너무 많이 사용합니다. 스마트폰을 오래 사용하면 ①___. 또한 가족이나 친구와 직접 대화하는 시간이 줄어들어 ②___.",
    passageVi: "Đọc đoạn văn sau và viết từ phù hợp vào chỗ trống.\n\nNgười hiện đại sử dụng điện thoại thông minh quá nhiều. Nếu dùng điện thoại lâu thì ①___. Ngoài ra thời gian trò chuyện trực tiếp với gia đình và bạn bè giảm đi nên ②___.",
    question: "①과 ②에 알맞은 말을 각각 쓰세요. (각 5점)",
    questionVi: "Viết từ/cụm từ phù hợp vào ① và ②. (mỗi chỗ 5 điểm)",
    correctAnswer: "눈이 나빠질 수 있습니다",
    correctAnswer2: "인간관계가 나빠질 수 있습니다",
    sampleAnswer: "① 눈이 나빠질 수 있습니다 / 건강에 좋지 않습니다\n② 인간관계가 나빠질 수 있습니다 / 외로움을 느낄 수 있습니다",
    sampleAnswerVi: "① mắt có thể kém đi / không tốt cho sức khỏe\n② quan hệ con người có thể xấu đi / có thể cảm thấy cô đơn",
    writingGuide: "① 스마트폰 과다 사용의 신체적 문제 (눈, 목, 수면 등)\n② 스마트폰 과다 사용의 사회적 문제 (인간관계, 소통 등)",
    explanation: "① 스마트폰 장시간 사용 → 눈이 나빠지다, 목이 아프다, 수면 장애 등\n② 직접 대화 감소 → 인간관계 악화, 외로움, 소통 부재 등",
  },
  {
    id: "t2_w3", section: "writing", number: 53, type: "write_short", points: 30,
    passage: "다음 그래프를 보고 내용을 설명하는 글을 200~300자로 쓰세요.\n\n[그래프 설명]\n• 제목: 한국인의 여가 활동 (2023년)\n• 1위: 스마트폰/인터넷 (45%)\n• 2위: TV 시청 (30%)\n• 3위: 운동/스포츠 (15%)\n• 4위: 독서 (7%)\n• 기타 (3%)",
    passageVi: "Nhìn biểu đồ sau và viết đoạn văn mô tả nội dung từ 200-300 chữ.\n\n[Mô tả biểu đồ]\n• Tiêu đề: Hoạt động giải trí của người Hàn Quốc (2023)\n• Hạng 1: Điện thoại/Internet (45%)\n• Hạng 2: Xem TV (30%)\n• Hạng 3: Thể thao/Vận động (15%)\n• Hạng 4: Đọc sách (7%)\n• Khác (3%)",
    question: "위 그래프의 내용을 설명하는 글을 200~300자로 쓰세요.",
    questionVi: "Viết đoạn văn mô tả nội dung biểu đồ trên, từ 200-300 chữ.",
    sampleAnswer: "위 그래프는 2023년 한국인의 여가 활동을 나타낸 것이다. 가장 많은 사람들이 즐기는 여가 활동은 스마트폰/인터넷으로 전체의 45%를 차지했다. 그 다음으로는 TV 시청이 30%로 2위를 차지했으며, 운동/스포츠가 15%로 3위였다. 독서는 7%로 4위를 기록했고, 기타 활동은 3%였다. 이를 통해 현대 한국인들은 디지털 미디어를 통한 여가 활동을 가장 선호하는 것을 알 수 있다.",
    sampleAnswerVi: "Biểu đồ trên thể hiện hoạt động giải trí của người Hàn Quốc năm 2023. Hoạt động giải trí được nhiều người thích nhất là điện thoại/internet chiếm 45% tổng số. Tiếp theo là xem TV chiếm 30% đứng thứ 2, thể thao/vận động 15% đứng thứ 3. Đọc sách ghi nhận 7% đứng thứ 4, các hoạt động khác là 3%. Qua đó có thể thấy người Hàn Quốc hiện đại ưa thích nhất các hoạt động giải trí qua phương tiện kỹ thuật số.",
    writingGuide: "1. 그래프 소개 (제목, 연도)\n2. 1위 항목 설명\n3. 2, 3위 항목 설명\n4. 나머지 항목 설명\n5. 전체적인 특징/결론",
    explanation: "그래프 설명 글쓰기: 수치를 정확히 언급하고, 순위를 비교하며, 전체적인 경향을 분석하는 것이 중요합니다.",
  },
  {
    id: "t2_w4", section: "writing", number: 54, type: "write_long", points: 50,
    passage: "다음 주제에 대해 자신의 의견을 600~700자로 쓰세요.\n\n주제: '현대 사회에서 인공지능(AI)의 발전이 인간의 삶에 미치는 영향'",
    passageVi: "Viết ý kiến của bạn về chủ đề sau, từ 600-700 chữ.\n\nChủ đề: 'Ảnh hưởng của sự phát triển trí tuệ nhân tạo (AI) đến cuộc sống con người trong xã hội hiện đại'",
    question: "위 주제에 대해 서론, 본론, 결론의 형식으로 자신의 의견을 쓰세요.",
    questionVi: "Viết ý kiến của bạn về chủ đề trên theo cấu trúc mở bài, thân bài, kết bài.",
    sampleAnswer: "현대 사회에서 인공지능(AI) 기술은 빠르게 발전하며 우리 생활 전반에 큰 영향을 미치고 있다. AI의 발전은 긍정적인 면과 부정적인 면을 모두 가지고 있다.\n\nAI의 긍정적인 영향으로는 먼저 의료 분야를 들 수 있다. AI는 방대한 의료 데이터를 분석하여 질병을 조기에 발견하고 정확한 진단을 내리는 데 도움을 준다. 또한 교육 분야에서는 개인 맞춤형 학습이 가능해져 학습 효율이 높아지고 있다. 일상생활에서도 AI 스피커, 자율주행 자동차 등을 통해 편의성이 크게 향상되었다.\n\n그러나 AI의 발전에는 부정적인 측면도 있다. 가장 큰 문제는 일자리 감소이다. AI와 로봇이 인간의 일을 대신하면서 많은 직업이 사라질 위기에 처해 있다. 또한 AI가 수집하는 개인 정보의 보안 문제와 AI의 판단에 지나치게 의존하는 문제도 우려된다.\n\n결론적으로, AI의 발전은 인류에게 많은 혜택을 가져다주지만 동시에 새로운 도전과 문제를 제기한다. 따라서 AI 기술을 적극적으로 활용하되, 그로 인한 부작용을 최소화하기 위한 사회적 논의와 제도적 장치가 필요하다고 생각한다.",
    sampleAnswerVi: "Trong xã hội hiện đại, công nghệ AI phát triển nhanh chóng và ảnh hưởng lớn đến toàn bộ cuộc sống của chúng ta. Sự phát triển AI có cả mặt tích cực và tiêu cực...",
    writingGuide: "서론: AI 발전의 현황 소개\n본론 1: AI의 긍정적 영향 (의료, 교육, 편의성)\n본론 2: AI의 부정적 영향 (일자리, 개인정보, 의존성)\n결론: 균형 잡힌 시각으로 마무리",
    explanation: "TOPIK II 54번 작문: 600-700자, 서론-본론-결론 구조, 논리적 전개, 다양한 어휘와 문법 사용이 중요합니다.",
  },
];

export const TOPIK2_SECTIONS = {
  listening: { label: "듣기 (Nghe)", count: 50, time: 60, color: "#38bdf8" },
  reading: { label: "읽기 (Đọc)", count: 50, time: 70, color: "#a78bfa" },
  writing: { label: "쓰기 (Viết)", count: 4, time: 50, color: "#34d399" },
};
