// EPS-TOPIK Vocabulary — 200+ từ chuẩn theo 33 chủ đề thực tế
// Nguồn: Bộ đề EPS-TOPIK chính thức (go用허가제 한국어능력시험)

export interface EpsVocabItem {
  id: string;
  korean: string;
  reading: string;
  vietnamese: string;
  example: string;
  exampleVi: string;
  topicId: string;
  level: "basic" | "intermediate" | "advanced";
}

export interface EpsVocabTopic {
  id: string;
  label: string;
  labelKo: string;
  icon: string;
  color: string;
  description: string;
}

export const EPS_VOCAB_TOPICS: EpsVocabTopic[] = [
  { id: "greeting", label: "Giao tiếp cơ bản", labelKo: "기본 인사", icon: "ri-chat-smile-2-line", color: "#34d399", description: "Chào hỏi, giới thiệu bản thân" },
  { id: "workplace", label: "Nơi làm việc", labelKo: "직장", icon: "ri-briefcase-line", color: "#38bdf8", description: "Văn phòng, nhà máy, công trường" },
  { id: "safety", label: "An toàn lao động", labelKo: "산업 안전", icon: "ri-shield-check-line", color: "#fb923c", description: "Thiết bị bảo hộ, quy tắc an toàn" },
  { id: "body", label: "Cơ thể & Sức khỏe", labelKo: "신체와 건강", icon: "ri-heart-pulse-line", color: "#f472b6", description: "Bộ phận cơ thể, triệu chứng bệnh" },
  { id: "hospital", label: "Bệnh viện", labelKo: "병원", icon: "ri-hospital-line", color: "#e879f9", description: "Khám bệnh, thuốc, điều trị" },
  { id: "transport", label: "Giao thông", labelKo: "교통", icon: "ri-bus-line", color: "#06b6d4", description: "Phương tiện, đường đi, chỉ đường" },
  { id: "food", label: "Ẩm thực", labelKo: "음식", icon: "ri-restaurant-line", color: "#f59e0b", description: "Món ăn, nhà hàng, nấu ăn" },
  { id: "shopping", label: "Mua sắm", labelKo: "쇼핑", icon: "ri-shopping-bag-line", color: "#a78bfa", description: "Cửa hàng, giá cả, thanh toán" },
  { id: "housing", label: "Nhà ở", labelKo: "주거", icon: "ri-home-line", color: "#34d399", description: "Thuê nhà, đồ nội thất, tiện ích" },
  { id: "weather", label: "Thời tiết", labelKo: "날씨", icon: "ri-sun-line", color: "#fbbf24", description: "Thời tiết, mùa, khí hậu" },
  { id: "time", label: "Thời gian", labelKo: "시간", icon: "ri-time-line", color: "#60a5fa", description: "Giờ, ngày, tháng, năm" },
  { id: "number", label: "Số đếm", labelKo: "숫자", icon: "ri-calculator-line", color: "#4ade80", description: "Số đếm, đơn vị, tiền tệ" },
  { id: "family", label: "Gia đình", labelKo: "가족", icon: "ri-group-line", color: "#fb7185", description: "Các thành viên gia đình" },
  { id: "law", label: "Pháp luật lao động", labelKo: "노동법", icon: "ri-scales-3-line", color: "#f59e0b", description: "Hợp đồng, lương, quyền lợi" },
  { id: "emergency", label: "Khẩn cấp", labelKo: "긴급 상황", icon: "ri-alarm-warning-line", color: "#f87171", description: "Tai nạn, cứu thương, báo cáo" },
  { id: "culture", label: "Văn hóa Hàn Quốc", labelKo: "한국 문화", icon: "ri-building-2-line", color: "#c084fc", description: "Phong tục, lễ hội, ứng xử" },
  { id: "direction", label: "Chỉ đường", labelKo: "길 안내", icon: "ri-map-pin-line", color: "#2dd4bf", description: "Vị trí, hướng, địa điểm" },
  { id: "emotion", label: "Cảm xúc", labelKo: "감정", icon: "ri-emotion-line", color: "#f472b6", description: "Cảm xúc, tâm trạng" },
  { id: "action", label: "Hành động", labelKo: "동작", icon: "ri-run-line", color: "#34d399", description: "Động từ hành động thường dùng" },
  { id: "adjective", label: "Tính từ", labelKo: "형용사", icon: "ri-font-size", color: "#a78bfa", description: "Mô tả, tính chất, trạng thái" },
  { id: "sports", label: "Thể thao", labelKo: "스포츠", icon: "ri-run-line", color: "#34d399", description: "Các môn thể thao, dụng cụ tập luyện" },
  { id: "location", label: "Vị trí & Địa điểm", labelKo: "위치와 장소", icon: "ri-map-pin-line", color: "#60a5fa", description: "Chỉ hướng, vị trí, địa điểm" },
];

export const epsVocabulary: EpsVocabItem[] = [
  // ─── Giao tiếp cơ bản ───────────────────────────────────────────────────
  { id: "ev001", korean: "안녕하세요", reading: "annyeonghaseyo", vietnamese: "Xin chào", example: "안녕하세요! 처음 뵙겠습니다.", exampleVi: "Xin chào! Rất vui được gặp bạn.", topicId: "greeting", level: "basic" },
  { id: "ev002", korean: "감사합니다", reading: "gamsahamnida", vietnamese: "Cảm ơn", example: "도와주셔서 감사합니다.", exampleVi: "Cảm ơn vì đã giúp đỡ.", topicId: "greeting", level: "basic" },
  { id: "ev003", korean: "죄송합니다", reading: "joesonghamnida", vietnamese: "Xin lỗi", example: "늦어서 죄송합니다.", exampleVi: "Xin lỗi vì đến trễ.", topicId: "greeting", level: "basic" },
  { id: "ev004", korean: "괜찮아요", reading: "gwaenchanayo", vietnamese: "Không sao", example: "괜찮아요, 걱정하지 마세요.", exampleVi: "Không sao, đừng lo lắng.", topicId: "greeting", level: "basic" },
  { id: "ev005", korean: "잠깐만요", reading: "jamkkanmanyo", vietnamese: "Xin chờ một chút", example: "잠깐만요, 확인해 볼게요.", exampleVi: "Xin chờ một chút, tôi sẽ kiểm tra.", topicId: "greeting", level: "basic" },
  { id: "ev006", korean: "모르겠어요", reading: "moreugesseoyo", vietnamese: "Tôi không biết", example: "잘 모르겠어요. 다시 설명해 주세요.", exampleVi: "Tôi không rõ. Hãy giải thích lại.", topicId: "greeting", level: "basic" },
  { id: "ev007", korean: "수고하셨습니다", reading: "sugohasyeosseumnida", vietnamese: "Bạn đã vất vả rồi", example: "오늘도 수고하셨습니다.", exampleVi: "Hôm nay bạn đã vất vả rồi.", topicId: "greeting", level: "basic" },
  { id: "ev008", korean: "잘 부탁드립니다", reading: "jal butakdeurimnida", vietnamese: "Nhờ bạn giúp đỡ", example: "앞으로 잘 부탁드립니다.", exampleVi: "Mong bạn giúp đỡ trong tương lai.", topicId: "greeting", level: "basic" },
  { id: "ev009", korean: "처음 뵙겠습니다", reading: "cheoeum boepgesseumnida", vietnamese: "Rất vui được gặp lần đầu", example: "처음 뵙겠습니다. 저는 민수입니다.", exampleVi: "Rất vui được gặp. Tôi là Minsu.", topicId: "greeting", level: "basic" },
  { id: "ev010", korean: "여보세요", reading: "yeoboseyo", vietnamese: "A lô (điện thoại)", example: "여보세요? 누구세요?", exampleVi: "A lô? Ai đó vậy?", topicId: "greeting", level: "basic" },

  // ─── Nơi làm việc ────────────────────────────────────────────────────────
  { id: "ev011", korean: "공장", reading: "gongjang", vietnamese: "Nhà máy", example: "저는 자동차 공장에서 일해요.", exampleVi: "Tôi làm việc ở nhà máy ô tô.", topicId: "workplace", level: "basic" },
  { id: "ev012", korean: "회사", reading: "hoesa", vietnamese: "Công ty", example: "우리 회사는 서울에 있어요.", exampleVi: "Công ty chúng tôi ở Seoul.", topicId: "workplace", level: "basic" },
  { id: "ev013", korean: "사장님", reading: "sajangnim", vietnamese: "Giám đốc / Sếp", example: "사장님이 회의실에 계세요.", exampleVi: "Giám đốc đang ở phòng họp.", topicId: "workplace", level: "basic" },
  { id: "ev014", korean: "동료", reading: "dongnyeo", vietnamese: "Đồng nghiệp", example: "동료들과 사이좋게 지내요.", exampleVi: "Tôi hòa thuận với đồng nghiệp.", topicId: "workplace", level: "basic" },
  { id: "ev015", korean: "월급", reading: "wolgeup", vietnamese: "Lương tháng", example: "월급은 매달 25일에 나와요.", exampleVi: "Lương ra vào ngày 25 hàng tháng.", topicId: "workplace", level: "basic" },
  { id: "ev016", korean: "야근", reading: "yageun", vietnamese: "Làm thêm giờ", example: "오늘 야근을 해야 해요.", exampleVi: "Hôm nay phải làm thêm giờ.", topicId: "workplace", level: "basic" },
  { id: "ev017", korean: "휴가", reading: "hyuga", vietnamese: "Nghỉ phép", example: "다음 주에 휴가를 쓸 거예요.", exampleVi: "Tuần sau tôi sẽ nghỉ phép.", topicId: "workplace", level: "basic" },
  { id: "ev018", korean: "출근", reading: "chulgeun", vietnamese: "Đi làm / Đến nơi làm", example: "저는 8시에 출근해요.", exampleVi: "Tôi đi làm lúc 8 giờ.", topicId: "workplace", level: "basic" },
  { id: "ev019", korean: "퇴근", reading: "toegeun", vietnamese: "Tan ca / Về nhà", example: "오늘 퇴근이 늦어요.", exampleVi: "Hôm nay tan ca muộn.", topicId: "workplace", level: "basic" },
  { id: "ev020", korean: "회의", reading: "hoeui", vietnamese: "Cuộc họp", example: "오전에 회의가 있어요.", exampleVi: "Buổi sáng có cuộc họp.", topicId: "workplace", level: "basic" },
  { id: "ev021", korean: "보고서", reading: "bogoseo", vietnamese: "Báo cáo", example: "보고서를 오늘까지 제출해야 해요.", exampleVi: "Phải nộp báo cáo hôm nay.", topicId: "workplace", level: "intermediate" },
  { id: "ev022", korean: "계약서", reading: "gyeyakseo", vietnamese: "Hợp đồng", example: "계약서에 서명했어요.", exampleVi: "Tôi đã ký hợp đồng.", topicId: "workplace", level: "intermediate" },
  { id: "ev023", korean: "잔업", reading: "janeop", vietnamese: "Làm thêm giờ (OT)", example: "잔업 수당을 받았어요.", exampleVi: "Tôi nhận được phụ cấp làm thêm giờ.", topicId: "workplace", level: "intermediate" },
  { id: "ev024", korean: "교대 근무", reading: "gyodae geunmu", vietnamese: "Làm ca", example: "저는 야간 교대 근무를 해요.", exampleVi: "Tôi làm ca đêm.", topicId: "workplace", level: "intermediate" },
  { id: "ev025", korean: "작업복", reading: "jageopbok", vietnamese: "Đồng phục làm việc", example: "작업복을 입고 일해요.", exampleVi: "Tôi mặc đồng phục khi làm việc.", topicId: "workplace", level: "basic" },

  // ─── An toàn lao động ────────────────────────────────────────────────────
  { id: "ev026", korean: "안전모", reading: "anjeonmo", vietnamese: "Mũ bảo hộ", example: "공사장에서는 안전모를 써야 해요.", exampleVi: "Ở công trường phải đội mũ bảo hộ.", topicId: "safety", level: "basic" },
  { id: "ev027", korean: "안전벨트", reading: "anjeonbelteu", vietnamese: "Dây an toàn", example: "높은 곳에서 안전벨트를 착용하세요.", exampleVi: "Đeo dây an toàn khi làm việc trên cao.", topicId: "safety", level: "basic" },
  { id: "ev028", korean: "소화기", reading: "sohwagi", vietnamese: "Bình chữa cháy", example: "소화기 사용법을 알아야 해요.", exampleVi: "Phải biết cách dùng bình chữa cháy.", topicId: "safety", level: "basic" },
  { id: "ev029", korean: "비상구", reading: "bisanggu", vietnamese: "Lối thoát hiểm", example: "비상구 위치를 확인하세요.", exampleVi: "Hãy kiểm tra vị trí lối thoát hiểm.", topicId: "safety", level: "basic" },
  { id: "ev030", korean: "보호 장갑", reading: "boho janggap", vietnamese: "Găng tay bảo hộ", example: "화학물질을 다룰 때 보호 장갑을 끼세요.", exampleVi: "Đeo găng tay bảo hộ khi xử lý hóa chất.", topicId: "safety", level: "basic" },
  { id: "ev031", korean: "산업재해", reading: "saneop jaehae", vietnamese: "Tai nạn lao động", example: "산업재해가 발생하면 즉시 신고하세요.", exampleVi: "Khi xảy ra tai nạn lao động, báo cáo ngay.", topicId: "safety", level: "intermediate" },
  { id: "ev032", korean: "안전 교육", reading: "anjeon gyoyuk", vietnamese: "Đào tạo an toàn", example: "입사 전에 안전 교육을 받아야 해요.", exampleVi: "Phải được đào tạo an toàn trước khi vào làm.", topicId: "safety", level: "basic" },
  { id: "ev033", korean: "위험", reading: "wiheom", vietnamese: "Nguy hiểm", example: "이 구역은 위험합니다. 조심하세요.", exampleVi: "Khu vực này nguy hiểm. Hãy cẩn thận.", topicId: "safety", level: "basic" },
  { id: "ev034", korean: "마스크", reading: "maseukeu", vietnamese: "Khẩu trang / Mặt nạ", example: "분진이 많은 곳에서 마스크를 써요.", exampleVi: "Đeo khẩu trang ở nơi nhiều bụi.", topicId: "safety", level: "basic" },
  { id: "ev035", korean: "응급처치", reading: "eunggeup cheochi", vietnamese: "Sơ cứu", example: "응급처치 방법을 배웠어요.", exampleVi: "Tôi đã học cách sơ cứu.", topicId: "safety", level: "intermediate" },

  // ─── Cơ thể & Sức khỏe ──────────────────────────────────────────────────
  { id: "ev036", korean: "머리", reading: "meori", vietnamese: "Đầu", example: "머리가 아파요.", exampleVi: "Tôi đau đầu.", topicId: "body", level: "basic" },
  { id: "ev037", korean: "눈", reading: "nun", vietnamese: "Mắt", example: "눈이 빨개요.", exampleVi: "Mắt tôi đỏ.", topicId: "body", level: "basic" },
  { id: "ev038", korean: "코", reading: "ko", vietnamese: "Mũi", example: "코가 막혔어요.", exampleVi: "Mũi tôi bị nghẹt.", topicId: "body", level: "basic" },
  { id: "ev039", korean: "목", reading: "mok", vietnamese: "Cổ họng", example: "목이 아파요.", exampleVi: "Tôi đau họng.", topicId: "body", level: "basic" },
  { id: "ev040", korean: "배", reading: "bae", vietnamese: "Bụng", example: "배가 아파요.", exampleVi: "Tôi đau bụng.", topicId: "body", level: "basic" },
  { id: "ev041", korean: "손", reading: "son", vietnamese: "Tay", example: "손을 다쳤어요.", exampleVi: "Tôi bị thương ở tay.", topicId: "body", level: "basic" },
  { id: "ev042", korean: "발", reading: "bal", vietnamese: "Chân", example: "발이 부었어요.", exampleVi: "Chân tôi bị sưng.", topicId: "body", level: "basic" },
  { id: "ev043", korean: "열", reading: "yeol", vietnamese: "Sốt", example: "열이 38도예요.", exampleVi: "Sốt 38 độ.", topicId: "body", level: "basic" },
  { id: "ev044", korean: "기침", reading: "gichim", vietnamese: "Ho", example: "기침이 심해요.", exampleVi: "Ho nặng.", topicId: "body", level: "basic" },
  { id: "ev045", korean: "어지럽다", reading: "eojireobda", vietnamese: "Chóng mặt", example: "어지러워서 앉아야 해요.", exampleVi: "Chóng mặt nên phải ngồi xuống.", topicId: "body", level: "intermediate" },

  // ─── Bệnh viện ───────────────────────────────────────────────────────────
  { id: "ev046", korean: "병원", reading: "byeongwon", vietnamese: "Bệnh viện", example: "병원에 가야 해요.", exampleVi: "Tôi phải đến bệnh viện.", topicId: "hospital", level: "basic" },
  { id: "ev047", korean: "의사", reading: "uisa", vietnamese: "Bác sĩ", example: "의사 선생님께 진찰을 받았어요.", exampleVi: "Tôi được bác sĩ khám.", topicId: "hospital", level: "basic" },
  { id: "ev048", korean: "약", reading: "yak", vietnamese: "Thuốc", example: "약을 하루 세 번 먹어요.", exampleVi: "Uống thuốc 3 lần một ngày.", topicId: "hospital", level: "basic" },
  { id: "ev049", korean: "처방전", reading: "cheobangjeon", vietnamese: "Đơn thuốc", example: "처방전을 약국에 가져가세요.", exampleVi: "Mang đơn thuốc đến nhà thuốc.", topicId: "hospital", level: "intermediate" },
  { id: "ev050", korean: "건강보험", reading: "geongang boheom", vietnamese: "Bảo hiểm y tế", example: "건강보험이 있으면 병원비가 줄어요.", exampleVi: "Có bảo hiểm y tế thì giảm chi phí bệnh viện.", topicId: "hospital", level: "intermediate" },
  { id: "ev051", korean: "입원", reading: "ibwon", vietnamese: "Nhập viện", example: "수술 후 3일 입원했어요.", exampleVi: "Sau phẫu thuật nhập viện 3 ngày.", topicId: "hospital", level: "intermediate" },
  { id: "ev052", korean: "식후", reading: "sikhu", vietnamese: "Sau bữa ăn", example: "이 약은 식후에 드세요.", exampleVi: "Uống thuốc này sau bữa ăn.", topicId: "hospital", level: "basic" },
  { id: "ev053", korean: "식전", reading: "sikjeon", vietnamese: "Trước bữa ăn", example: "이 약은 식전에 드세요.", exampleVi: "Uống thuốc này trước bữa ăn.", topicId: "hospital", level: "basic" },

  // ─── Giao thông ──────────────────────────────────────────────────────────
  { id: "ev054", korean: "지하철", reading: "jihacheol", vietnamese: "Tàu điện ngầm", example: "지하철로 출근해요.", exampleVi: "Tôi đi tàu điện ngầm đi làm.", topicId: "transport", level: "basic" },
  { id: "ev055", korean: "버스", reading: "beoseu", vietnamese: "Xe buýt", example: "버스 정류장이 어디예요?", exampleVi: "Trạm xe buýt ở đâu?", topicId: "transport", level: "basic" },
  { id: "ev056", korean: "택시", reading: "taeksi", vietnamese: "Taxi", example: "택시를 타고 병원에 갔어요.", exampleVi: "Tôi đi taxi đến bệnh viện.", topicId: "transport", level: "basic" },
  { id: "ev057", korean: "교통카드", reading: "gyotong kadeu", vietnamese: "Thẻ giao thông", example: "교통카드를 충전해야 해요.", exampleVi: "Phải nạp tiền thẻ giao thông.", topicId: "transport", level: "basic" },
  { id: "ev058", korean: "환승", reading: "hwanseung", vietnamese: "Chuyển tuyến", example: "2호선으로 환승하세요.", exampleVi: "Chuyển sang tuyến 2.", topicId: "transport", level: "intermediate" },
  { id: "ev059", korean: "정류장", reading: "jeongnyujang", vietnamese: "Trạm dừng", example: "다음 정류장에서 내려요.", exampleVi: "Tôi xuống ở trạm tiếp theo.", topicId: "transport", level: "basic" },
  { id: "ev060", korean: "길", reading: "gil", vietnamese: "Đường", example: "이 길로 가면 돼요.", exampleVi: "Đi theo con đường này là được.", topicId: "transport", level: "basic" },

  // ─── Ẩm thực ─────────────────────────────────────────────────────────────
  { id: "ev061", korean: "밥", reading: "bap", vietnamese: "Cơm", example: "밥을 먹었어요?", exampleVi: "Bạn ăn cơm chưa?", topicId: "food", level: "basic" },
  { id: "ev062", korean: "김치", reading: "gimchi", vietnamese: "Kim chi", example: "김치는 한국의 대표 음식이에요.", exampleVi: "Kim chi là món ăn đặc trưng của Hàn Quốc.", topicId: "food", level: "basic" },
  { id: "ev063", korean: "삼겹살", reading: "samgyeopsal", vietnamese: "Thịt ba chỉ nướng", example: "삼겹살을 구워 먹어요.", exampleVi: "Nướng và ăn thịt ba chỉ.", topicId: "food", level: "basic" },
  { id: "ev064", korean: "비빔밥", reading: "bibimbap", vietnamese: "Cơm trộn", example: "비빔밥에 고추장을 넣어요.", exampleVi: "Cho tương ớt vào cơm trộn.", topicId: "food", level: "basic" },
  { id: "ev065", korean: "식당", reading: "sikdang", vietnamese: "Nhà hàng / Quán ăn", example: "근처에 맛있는 식당이 있어요.", exampleVi: "Gần đây có quán ăn ngon.", topicId: "food", level: "basic" },
  { id: "ev066", korean: "맵다", reading: "maepda", vietnamese: "Cay", example: "이 음식은 너무 매워요.", exampleVi: "Món này quá cay.", topicId: "food", level: "basic" },
  { id: "ev067", korean: "맛있다", reading: "masitda", vietnamese: "Ngon", example: "이 김치찌개가 정말 맛있어요.", exampleVi: "Canh kim chi này thật ngon.", topicId: "food", level: "basic" },
  { id: "ev068", korean: "배달", reading: "baedal", vietnamese: "Giao hàng / Đặt đồ ăn", example: "배달 앱으로 음식을 시켰어요.", exampleVi: "Tôi đặt đồ ăn qua app giao hàng.", topicId: "food", level: "intermediate" },

  // ─── Mua sắm ─────────────────────────────────────────────────────────────
  { id: "ev069", korean: "편의점", reading: "pyeonuijeom", vietnamese: "Cửa hàng tiện lợi", example: "편의점에서 종량제 봉투를 사요.", exampleVi: "Mua túi rác ở cửa hàng tiện lợi.", topicId: "shopping", level: "basic" },
  { id: "ev070", korean: "마트", reading: "mateu", vietnamese: "Siêu thị", example: "주말에 마트에서 장을 봐요.", exampleVi: "Cuối tuần tôi đi siêu thị mua đồ.", topicId: "shopping", level: "basic" },
  { id: "ev071", korean: "얼마예요", reading: "eolmayeyo", vietnamese: "Bao nhiêu tiền?", example: "이거 얼마예요?", exampleVi: "Cái này bao nhiêu tiền?", topicId: "shopping", level: "basic" },
  { id: "ev072", korean: "영수증", reading: "yeongsujeung", vietnamese: "Hóa đơn / Biên lai", example: "영수증 주세요.", exampleVi: "Cho tôi hóa đơn.", topicId: "shopping", level: "basic" },
  { id: "ev073", korean: "카드", reading: "kadeu", vietnamese: "Thẻ (thanh toán)", example: "카드로 계산할게요.", exampleVi: "Tôi sẽ thanh toán bằng thẻ.", topicId: "shopping", level: "basic" },
  { id: "ev074", korean: "현금", reading: "hyeongeum", vietnamese: "Tiền mặt", example: "현금으로 내도 돼요?", exampleVi: "Trả tiền mặt được không?", topicId: "shopping", level: "basic" },
  { id: "ev075", korean: "할인", reading: "harin", vietnamese: "Giảm giá", example: "오늘 30% 할인이에요.", exampleVi: "Hôm nay giảm 30%.", topicId: "shopping", level: "basic" },

  // ─── Nhà ở ───────────────────────────────────────────────────────────────
  { id: "ev076", korean: "원룸", reading: "wonrum", vietnamese: "Phòng trọ (studio)", example: "원룸을 월 40만 원에 빌렸어요.", exampleVi: "Thuê phòng trọ 400.000 won/tháng.", topicId: "housing", level: "basic" },
  { id: "ev077", korean: "보증금", reading: "bojeunggeum", vietnamese: "Tiền đặt cọc", example: "보증금 500만 원을 냈어요.", exampleVi: "Tôi đặt cọc 5 triệu won.", topicId: "housing", level: "intermediate" },
  { id: "ev078", korean: "월세", reading: "wolse", vietnamese: "Tiền thuê nhà hàng tháng", example: "월세가 얼마예요?", exampleVi: "Tiền thuê hàng tháng là bao nhiêu?", topicId: "housing", level: "basic" },
  { id: "ev079", korean: "집주인", reading: "jipjuin", vietnamese: "Chủ nhà", example: "집주인에게 연락했어요.", exampleVi: "Tôi đã liên hệ với chủ nhà.", topicId: "housing", level: "basic" },
  { id: "ev080", korean: "수도", reading: "sudo", vietnamese: "Nước máy", example: "수도 요금을 내야 해요.", exampleVi: "Phải trả tiền nước.", topicId: "housing", level: "basic" },
  { id: "ev081", korean: "전기", reading: "jeongi", vietnamese: "Điện", example: "전기 요금이 많이 나왔어요.", exampleVi: "Tiền điện ra nhiều.", topicId: "housing", level: "basic" },
  { id: "ev082", korean: "인터넷", reading: "inteonet", vietnamese: "Internet", example: "인터넷을 신청했어요.", exampleVi: "Tôi đã đăng ký internet.", topicId: "housing", level: "basic" },

  // ─── Thời tiết ───────────────────────────────────────────────────────────
  { id: "ev083", korean: "맑다", reading: "makda", vietnamese: "Nắng / Quang đãng", example: "오늘 날씨가 맑아요.", exampleVi: "Hôm nay trời nắng.", topicId: "weather", level: "basic" },
  { id: "ev084", korean: "흐리다", reading: "heurida", vietnamese: "Âm u / Nhiều mây", example: "내일은 흐릴 것 같아요.", exampleVi: "Ngày mai có vẻ âm u.", topicId: "weather", level: "basic" },
  { id: "ev085", korean: "비", reading: "bi", vietnamese: "Mưa", example: "비가 와서 우산을 가져왔어요.", exampleVi: "Vì trời mưa nên tôi mang ô.", topicId: "weather", level: "basic" },
  { id: "ev086", korean: "눈", reading: "nun", vietnamese: "Tuyết", example: "겨울에 눈이 많이 와요.", exampleVi: "Mùa đông tuyết rơi nhiều.", topicId: "weather", level: "basic" },
  { id: "ev087", korean: "춥다", reading: "chupda", vietnamese: "Lạnh", example: "오늘 너무 추워요.", exampleVi: "Hôm nay quá lạnh.", topicId: "weather", level: "basic" },
  { id: "ev088", korean: "덥다", reading: "deopda", vietnamese: "Nóng", example: "여름에는 정말 더워요.", exampleVi: "Mùa hè thật sự rất nóng.", topicId: "weather", level: "basic" },
  { id: "ev089", korean: "바람", reading: "baram", vietnamese: "Gió", example: "바람이 많이 불어요.", exampleVi: "Gió thổi nhiều.", topicId: "weather", level: "basic" },
  { id: "ev090", korean: "태풍", reading: "taepung", vietnamese: "Bão", example: "태풍이 오고 있어요.", exampleVi: "Bão đang đến.", topicId: "weather", level: "intermediate" },

  // ─── Thời gian ───────────────────────────────────────────────────────────
  { id: "ev091", korean: "오전", reading: "ojeon", vietnamese: "Buổi sáng (AM)", example: "오전 9시에 출근해요.", exampleVi: "Đi làm lúc 9 giờ sáng.", topicId: "time", level: "basic" },
  { id: "ev092", korean: "오후", reading: "ohu", vietnamese: "Buổi chiều (PM)", example: "오후 6시에 퇴근해요.", exampleVi: "Tan ca lúc 6 giờ chiều.", topicId: "time", level: "basic" },
  { id: "ev093", korean: "어제", reading: "eoje", vietnamese: "Hôm qua", example: "어제 야근을 했어요.", exampleVi: "Hôm qua tôi làm thêm giờ.", topicId: "time", level: "basic" },
  { id: "ev094", korean: "오늘", reading: "oneul", vietnamese: "Hôm nay", example: "오늘 날씨가 좋아요.", exampleVi: "Hôm nay thời tiết đẹp.", topicId: "time", level: "basic" },
  { id: "ev095", korean: "내일", reading: "naeil", vietnamese: "Ngày mai", example: "내일 병원에 가야 해요.", exampleVi: "Ngày mai phải đến bệnh viện.", topicId: "time", level: "basic" },
  { id: "ev096", korean: "주말", reading: "jumal", vietnamese: "Cuối tuần", example: "주말에 쉬어요.", exampleVi: "Cuối tuần tôi nghỉ ngơi.", topicId: "time", level: "basic" },
  { id: "ev097", korean: "매일", reading: "maeil", vietnamese: "Hàng ngày", example: "매일 운동해요.", exampleVi: "Tôi tập thể dục hàng ngày.", topicId: "time", level: "basic" },
  { id: "ev098", korean: "지난주", reading: "jinanju", vietnamese: "Tuần trước", example: "지난주에 월급을 받았어요.", exampleVi: "Tuần trước tôi nhận lương.", topicId: "time", level: "basic" },

  // ─── Số đếm & Tiền tệ ────────────────────────────────────────────────────
  { id: "ev099", korean: "원", reading: "won", vietnamese: "Won (tiền Hàn)", example: "만 원짜리 지폐예요.", exampleVi: "Đây là tờ 10.000 won.", topicId: "number", level: "basic" },
  { id: "ev100", korean: "만", reading: "man", vietnamese: "Mười nghìn (10.000)", example: "월급이 200만 원이에요.", exampleVi: "Lương là 2 triệu won.", topicId: "number", level: "basic" },
  { id: "ev101", korean: "퍼센트", reading: "peosenteu", vietnamese: "Phần trăm (%)", example: "부가세는 10퍼센트예요.", exampleVi: "Thuế VAT là 10%.", topicId: "number", level: "basic" },
  { id: "ev102", korean: "첫 번째", reading: "cheot beonjjae", vietnamese: "Thứ nhất / Đầu tiên", example: "첫 번째 날 안전 교육을 받아요.", exampleVi: "Ngày đầu tiên được đào tạo an toàn.", topicId: "number", level: "basic" },

  // ─── Gia đình ────────────────────────────────────────────────────────────
  { id: "ev103", korean: "가족", reading: "gajok", vietnamese: "Gia đình", example: "가족이 보고 싶어요.", exampleVi: "Tôi nhớ gia đình.", topicId: "family", level: "basic" },
  { id: "ev104", korean: "부모님", reading: "bumonim", vietnamese: "Bố mẹ", example: "부모님께 전화했어요.", exampleVi: "Tôi gọi điện cho bố mẹ.", topicId: "family", level: "basic" },
  { id: "ev105", korean: "아내", reading: "anae", vietnamese: "Vợ", example: "아내가 한국에 오고 싶어해요.", exampleVi: "Vợ tôi muốn đến Hàn Quốc.", topicId: "family", level: "basic" },
  { id: "ev106", korean: "남편", reading: "nampyeon", vietnamese: "Chồng", example: "남편이 공장에서 일해요.", exampleVi: "Chồng tôi làm ở nhà máy.", topicId: "family", level: "basic" },
  { id: "ev107", korean: "자녀", reading: "janyeo", vietnamese: "Con cái", example: "자녀가 두 명 있어요.", exampleVi: "Tôi có hai người con.", topicId: "family", level: "basic" },

  // ─── Pháp luật lao động ──────────────────────────────────────────────────
  { id: "ev108", korean: "최저임금", reading: "choejeoimgeum", vietnamese: "Lương tối thiểu", example: "최저임금 이상을 받아야 해요.", exampleVi: "Phải nhận lương từ mức tối thiểu trở lên.", topicId: "law", level: "intermediate" },
  { id: "ev109", korean: "퇴직금", reading: "toejikgeum", vietnamese: "Trợ cấp thôi việc", example: "1년 이상 일하면 퇴직금을 받아요.", exampleVi: "Làm 1 năm trở lên thì nhận trợ cấp thôi việc.", topicId: "law", level: "intermediate" },
  { id: "ev110", korean: "4대 보험", reading: "sadae boheom", vietnamese: "4 loại bảo hiểm bắt buộc", example: "4대 보험에 가입해야 해요.", exampleVi: "Phải tham gia 4 loại bảo hiểm bắt buộc.", topicId: "law", level: "advanced" },
  { id: "ev111", korean: "고용허가제", reading: "goyongheogage", vietnamese: "Hệ thống cấp phép lao động (E-9)", example: "고용허가제로 한국에 왔어요.", exampleVi: "Tôi đến Hàn Quốc theo hệ thống E-9.", topicId: "law", level: "advanced" },
  { id: "ev112", korean: "임금 체불", reading: "imgeum chebul", vietnamese: "Nợ lương", example: "임금 체불은 불법이에요.", exampleVi: "Nợ lương là bất hợp pháp.", topicId: "law", level: "intermediate" },
  { id: "ev113", korean: "연차", reading: "yeoncha", vietnamese: "Ngày nghỉ phép năm", example: "연차를 사용하고 싶어요.", exampleVi: "Tôi muốn dùng ngày nghỉ phép.", topicId: "law", level: "intermediate" },
  { id: "ev114", korean: "외국인등록증", reading: "oegugindeungnokjeung", vietnamese: "Thẻ đăng ký người nước ngoài", example: "외국인등록증을 항상 가지고 다녀요.", exampleVi: "Tôi luôn mang theo thẻ đăng ký người nước ngoài.", topicId: "law", level: "basic" },
  { id: "ev115", korean: "비자", reading: "bija", vietnamese: "Visa", example: "비자 기간이 만료됐어요.", exampleVi: "Visa đã hết hạn.", topicId: "law", level: "basic" },

  // ─── Khẩn cấp ────────────────────────────────────────────────────────────
  { id: "ev116", korean: "119", reading: "ilil-gu", vietnamese: "119 (Cứu hỏa/Cấp cứu)", example: "불이 났어요! 119에 신고하세요!", exampleVi: "Cháy rồi! Gọi 119!", topicId: "emergency", level: "basic" },
  { id: "ev117", korean: "112", reading: "ilil-i", vietnamese: "112 (Cảnh sát)", example: "도둑이 들었어요! 112에 신고하세요!", exampleVi: "Có trộm! Gọi 112!", topicId: "emergency", level: "basic" },
  { id: "ev118", korean: "1345", reading: "ilsamsa-o", vietnamese: "1345 (Hỗ trợ người nước ngoài)", example: "문제가 생기면 1345에 전화하세요.", exampleVi: "Khi có vấn đề, gọi 1345.", topicId: "emergency", level: "basic" },
  { id: "ev119", korean: "사고", reading: "sago", vietnamese: "Tai nạn", example: "교통사고가 났어요.", exampleVi: "Xảy ra tai nạn giao thông.", topicId: "emergency", level: "basic" },
  { id: "ev120", korean: "구급차", reading: "gugeupcha", vietnamese: "Xe cứu thương", example: "구급차를 불러 주세요.", exampleVi: "Hãy gọi xe cứu thương.", topicId: "emergency", level: "basic" },

  // ─── Văn hóa Hàn Quốc ───────────────────────────────────────────────────
  { id: "ev121", korean: "설날", reading: "seollal", vietnamese: "Tết Hàn Quốc (Seollal)", example: "설날에 가족이 모여요.", exampleVi: "Tết Seollal gia đình tụ họp.", topicId: "culture", level: "basic" },
  { id: "ev122", korean: "추석", reading: "chuseok", vietnamese: "Tết Trung thu Hàn (Chuseok)", example: "추석에 고향에 가요.", exampleVi: "Tết Chuseok tôi về quê.", topicId: "culture", level: "basic" },
  { id: "ev123", korean: "회식", reading: "hoesik", vietnamese: "Bữa ăn tập thể công ty", example: "오늘 저녁에 회식이 있어요.", exampleVi: "Tối nay có bữa ăn tập thể.", topicId: "culture", level: "basic" },
  { id: "ev124", korean: "존댓말", reading: "jondaenmal", vietnamese: "Kính ngữ / Ngôn ngữ lịch sự", example: "어른에게는 존댓말을 써야 해요.", exampleVi: "Phải dùng kính ngữ với người lớn tuổi.", topicId: "culture", level: "intermediate" },
  { id: "ev125", korean: "절", reading: "jeol", vietnamese: "Cúi lạy / Cúi chào sâu", example: "설날에 어른들께 절을 해요.", exampleVi: "Tết Seollal cúi lạy người lớn.", topicId: "culture", level: "intermediate" },

  // ─── Chỉ đường ───────────────────────────────────────────────────────────
  { id: "ev126", korean: "왼쪽", reading: "oenjjok", vietnamese: "Bên trái", example: "왼쪽으로 가세요.", exampleVi: "Đi về phía bên trái.", topicId: "direction", level: "basic" },
  { id: "ev127", korean: "오른쪽", reading: "oreunjjok", vietnamese: "Bên phải", example: "오른쪽으로 돌아가세요.", exampleVi: "Rẽ phải.", topicId: "direction", level: "basic" },
  { id: "ev128", korean: "직진", reading: "jikjin", vietnamese: "Đi thẳng", example: "직진하면 병원이 나와요.", exampleVi: "Đi thẳng sẽ thấy bệnh viện.", topicId: "direction", level: "basic" },
  { id: "ev129", korean: "근처", reading: "geuncheo", vietnamese: "Gần đây", example: "근처에 편의점이 있어요?", exampleVi: "Gần đây có cửa hàng tiện lợi không?", topicId: "direction", level: "basic" },
  { id: "ev130", korean: "멀다", reading: "meolda", vietnamese: "Xa", example: "병원이 여기서 멀어요?", exampleVi: "Bệnh viện có xa đây không?", topicId: "direction", level: "basic" },

  // ─── Cảm xúc ─────────────────────────────────────────────────────────────
  { id: "ev131", korean: "기쁘다", reading: "gippeuda", vietnamese: "Vui mừng", example: "합격해서 기뻐요.", exampleVi: "Tôi vui vì đậu thi.", topicId: "emotion", level: "basic" },
  { id: "ev132", korean: "슬프다", reading: "seulpeuda", vietnamese: "Buồn", example: "가족이 보고 싶어서 슬퍼요.", exampleVi: "Tôi buồn vì nhớ gia đình.", topicId: "emotion", level: "basic" },
  { id: "ev133", korean: "힘들다", reading: "himdeulda", vietnamese: "Vất vả / Khó khăn", example: "일이 너무 힘들어요.", exampleVi: "Công việc quá vất vả.", topicId: "emotion", level: "basic" },
  { id: "ev134", korean: "걱정되다", reading: "geokjeongdoeda", vietnamese: "Lo lắng", example: "비자 문제가 걱정돼요.", exampleVi: "Tôi lo lắng về vấn đề visa.", topicId: "emotion", level: "basic" },
  { id: "ev135", korean: "피곤하다", reading: "pigonhada", vietnamese: "Mệt mỏi", example: "야근을 해서 피곤해요.", exampleVi: "Tôi mệt vì làm thêm giờ.", topicId: "emotion", level: "basic" },

  // ─── Hành động ───────────────────────────────────────────────────────────
  { id: "ev136", korean: "일하다", reading: "ilhada", vietnamese: "Làm việc", example: "저는 공장에서 일해요.", exampleVi: "Tôi làm việc ở nhà máy.", topicId: "action", level: "basic" },
  { id: "ev137", korean: "먹다", reading: "meokda", vietnamese: "Ăn", example: "점심을 먹었어요?", exampleVi: "Bạn ăn trưa chưa?", topicId: "action", level: "basic" },
  { id: "ev138", korean: "마시다", reading: "masida", vietnamese: "Uống", example: "물을 마셔요.", exampleVi: "Tôi uống nước.", topicId: "action", level: "basic" },
  { id: "ev139", korean: "가다", reading: "gada", vietnamese: "Đi", example: "병원에 가야 해요.", exampleVi: "Phải đi bệnh viện.", topicId: "action", level: "basic" },
  { id: "ev140", korean: "오다", reading: "oda", vietnamese: "Đến", example: "내일 일찍 오세요.", exampleVi: "Ngày mai đến sớm nhé.", topicId: "action", level: "basic" },
  { id: "ev141", korean: "말하다", reading: "malhada", vietnamese: "Nói", example: "한국어로 말해 주세요.", exampleVi: "Hãy nói bằng tiếng Hàn.", topicId: "action", level: "basic" },
  { id: "ev142", korean: "듣다", reading: "deutda", vietnamese: "Nghe", example: "잘 들어 주세요.", exampleVi: "Hãy lắng nghe kỹ.", topicId: "action", level: "basic" },
  { id: "ev143", korean: "쓰다", reading: "sseuda", vietnamese: "Viết / Dùng", example: "이름을 써 주세요.", exampleVi: "Hãy viết tên.", topicId: "action", level: "basic" },
  { id: "ev144", korean: "신고하다", reading: "singohada", vietnamese: "Báo cáo / Tố cáo", example: "사고가 나면 즉시 신고하세요.", exampleVi: "Khi xảy ra tai nạn, báo cáo ngay.", topicId: "action", level: "intermediate" },
  { id: "ev145", korean: "확인하다", reading: "hwaginhada", vietnamese: "Kiểm tra / Xác nhận", example: "계약서를 꼭 확인하세요.", exampleVi: "Nhất định phải kiểm tra hợp đồng.", topicId: "action", level: "intermediate" },

  // ─── Tính từ ─────────────────────────────────────────────────────────────
  { id: "ev146", korean: "크다", reading: "keuda", vietnamese: "To / Lớn", example: "이 공장은 정말 커요.", exampleVi: "Nhà máy này thật to.", topicId: "adjective", level: "basic" },
  { id: "ev147", korean: "작다", reading: "jakda", vietnamese: "Nhỏ", example: "방이 좀 작아요.", exampleVi: "Phòng hơi nhỏ.", topicId: "adjective", level: "basic" },
  { id: "ev148", korean: "빠르다", reading: "ppareuda", vietnamese: "Nhanh", example: "지하철이 버스보다 빨라요.", exampleVi: "Tàu điện ngầm nhanh hơn xe buýt.", topicId: "adjective", level: "basic" },
  { id: "ev149", korean: "느리다", reading: "neurida", vietnamese: "Chậm", example: "버스가 너무 느려요.", exampleVi: "Xe buýt quá chậm.", topicId: "adjective", level: "basic" },
  { id: "ev150", korean: "비싸다", reading: "bissada", vietnamese: "Đắt", example: "서울 집값이 너무 비싸요.", exampleVi: "Giá nhà ở Seoul quá đắt.", topicId: "adjective", level: "basic" },
  { id: "ev151", korean: "싸다", reading: "ssada", vietnamese: "Rẻ", example: "이 식당은 싸고 맛있어요.", exampleVi: "Quán này rẻ và ngon.", topicId: "adjective", level: "basic" },
  { id: "ev152", korean: "어렵다", reading: "eoryeopda", vietnamese: "Khó", example: "한국어가 어려워요.", exampleVi: "Tiếng Hàn khó.", topicId: "adjective", level: "basic" },
  { id: "ev153", korean: "쉽다", reading: "swipda", vietnamese: "Dễ", example: "이 일은 쉬워요.", exampleVi: "Công việc này dễ.", topicId: "adjective", level: "basic" },

  // ─── Từ bổ sung quan trọng ───────────────────────────────────────────────
  { id: "ev154", korean: "근로계약서", reading: "geulloyegyakseo", vietnamese: "Hợp đồng lao động", example: "근로계약서에 서명하기 전에 꼭 읽어보세요.", exampleVi: "Trước khi ký hợp đồng lao động, nhất định phải đọc kỹ.", topicId: "law", level: "intermediate" },
  { id: "ev155", korean: "고용노동부", reading: "goyongnodonbu", vietnamese: "Bộ Lao động và Việc làm", example: "임금 문제는 고용노동부에 신고하세요.", exampleVi: "Vấn đề lương báo cáo lên Bộ Lao động.", topicId: "law", level: "advanced" },
  { id: "ev156", korean: "근로복지공단", reading: "geullokbokjigongdan", vietnamese: "Công đoàn phúc lợi lao động", example: "산재 신청은 근로복지공단에서 해요.", exampleVi: "Đăng ký tai nạn lao động tại Công đoàn phúc lợi.", topicId: "law", level: "advanced" },
  { id: "ev157", korean: "출입국관리소", reading: "churipgukgwalliso", vietnamese: "Cục Xuất nhập cảnh", example: "비자 연장은 출입국관리소에서 해요.", exampleVi: "Gia hạn visa tại Cục Xuất nhập cảnh.", topicId: "law", level: "advanced" },
  { id: "ev158", korean: "통역사", reading: "tongyeoksa", vietnamese: "Phiên dịch viên", example: "통역사가 필요해요.", exampleVi: "Tôi cần phiên dịch viên.", topicId: "greeting", level: "intermediate" },
  { id: "ev159", korean: "번역", reading: "beonyeok", vietnamese: "Dịch thuật", example: "계약서 번역이 필요해요.", exampleVi: "Tôi cần dịch hợp đồng.", topicId: "greeting", level: "intermediate" },
  { id: "ev160", korean: "기숙사", reading: "gisuksa", vietnamese: "Ký túc xá / Nhà ở công ty", example: "회사 기숙사에서 살아요.", exampleVi: "Tôi sống ở ký túc xá công ty.", topicId: "housing", level: "basic" },
  { id: "ev161", korean: "분리수거", reading: "bullisugeo", vietnamese: "Phân loại rác", example: "분리수거를 꼭 해야 해요.", exampleVi: "Nhất định phải phân loại rác.", topicId: "housing", level: "intermediate" },
  { id: "ev162", korean: "종량제 봉투", reading: "jongnyangje bongtu", vietnamese: "Túi rác tính phí", example: "종량제 봉투를 편의점에서 사요.", exampleVi: "Mua túi rác ở cửa hàng tiện lợi.", topicId: "housing", level: "intermediate" },
  { id: "ev163", korean: "작업 지시", reading: "jageop jisi", vietnamese: "Chỉ thị công việc", example: "작업 지시를 잘 따르세요.", exampleVi: "Hãy tuân theo chỉ thị công việc.", topicId: "workplace", level: "intermediate" },
  { id: "ev164", korean: "불량품", reading: "bullyangpum", vietnamese: "Sản phẩm lỗi", example: "불량품을 발견하면 보고하세요.", exampleVi: "Khi phát hiện sản phẩm lỗi, hãy báo cáo.", topicId: "workplace", level: "intermediate" },
  { id: "ev165", korean: "품질 관리", reading: "pumjil gwalli", vietnamese: "Quản lý chất lượng", example: "품질 관리가 중요해요.", exampleVi: "Quản lý chất lượng rất quan trọng.", topicId: "workplace", level: "advanced" },
  { id: "ev166", korean: "납기일", reading: "napgiil", vietnamese: "Hạn giao hàng", example: "납기일을 지켜야 해요.", exampleVi: "Phải tuân thủ hạn giao hàng.", topicId: "workplace", level: "advanced" },
  { id: "ev167", korean: "점검", reading: "jeomgeom", vietnamese: "Kiểm tra / Bảo dưỡng", example: "기계를 정기적으로 점검해요.", exampleVi: "Kiểm tra máy móc định kỳ.", topicId: "safety", level: "intermediate" },
  { id: "ev168", korean: "화재", reading: "hwajae", vietnamese: "Hỏa hoạn", example: "화재 시 즉시 대피하세요.", exampleVi: "Khi có hỏa hoạn, sơ tán ngay.", topicId: "emergency", level: "basic" },
  { id: "ev169", korean: "대피", reading: "daepi", vietnamese: "Sơ tán / Thoát hiểm", example: "화재 시 비상구로 대피하세요.", exampleVi: "Khi có hỏa hoạn, sơ tán qua lối thoát hiểm.", topicId: "emergency", level: "basic" },
  { id: "ev170", korean: "부상", reading: "busang", vietnamese: "Bị thương", example: "작업 중 부상을 입었어요.", exampleVi: "Tôi bị thương trong khi làm việc.", topicId: "emergency", level: "intermediate" },
  { id: "ev171", korean: "골절", reading: "goljeol", vietnamese: "Gãy xương", example: "손목 골절로 병원에 입원했어요.", exampleVi: "Nhập viện vì gãy xương cổ tay.", topicId: "hospital", level: "intermediate" },
  { id: "ev172", korean: "수술", reading: "susul", vietnamese: "Phẫu thuật", example: "수술을 받아야 해요.", exampleVi: "Phải phẫu thuật.", topicId: "hospital", level: "intermediate" },
  { id: "ev173", korean: "진단서", reading: "jindanseo", vietnamese: "Giấy chứng nhận bệnh", example: "진단서를 회사에 제출했어요.", exampleVi: "Tôi nộp giấy chứng nhận bệnh cho công ty.", topicId: "hospital", level: "intermediate" },
  { id: "ev174", korean: "약국", reading: "yakguk", vietnamese: "Nhà thuốc", example: "처방전을 약국에 가져가세요.", exampleVi: "Mang đơn thuốc đến nhà thuốc.", topicId: "hospital", level: "basic" },
  { id: "ev175", korean: "통증", reading: "tongjeung", vietnamese: "Đau nhức", example: "허리 통증이 심해요.", exampleVi: "Đau lưng nặng.", topicId: "body", level: "intermediate" },
  { id: "ev176", korean: "알레르기", reading: "allereugi", vietnamese: "Dị ứng", example: "이 약에 알레르기가 있어요.", exampleVi: "Tôi bị dị ứng với thuốc này.", topicId: "hospital", level: "intermediate" },
  { id: "ev177", korean: "혈압", reading: "hyeorap", vietnamese: "Huyết áp", example: "혈압이 높아요.", exampleVi: "Huyết áp cao.", topicId: "body", level: "intermediate" },
  { id: "ev178", korean: "당뇨", reading: "dangyo", vietnamese: "Tiểu đường", example: "당뇨 검사를 받았어요.", exampleVi: "Tôi được xét nghiệm tiểu đường.", topicId: "body", level: "advanced" },
  { id: "ev179", korean: "건강검진", reading: "geongang geomjin", vietnamese: "Khám sức khỏe định kỳ", example: "매년 건강검진을 받아요.", exampleVi: "Hàng năm tôi khám sức khỏe định kỳ.", topicId: "hospital", level: "intermediate" },
  { id: "ev180", korean: "금식", reading: "geumsik", vietnamese: "Nhịn ăn", example: "검사 전 8시간 금식이 필요해요.", exampleVi: "Cần nhịn ăn 8 tiếng trước khi xét nghiệm.", topicId: "hospital", level: "intermediate" },
  { id: "ev181", korean: "주유소", reading: "juyuso", vietnamese: "Trạm xăng", example: "주유소에서 기름을 넣었어요.", exampleVi: "Tôi đổ xăng ở trạm xăng.", topicId: "transport", level: "basic" },
  { id: "ev182", korean: "신호등", reading: "sinhodeung", vietnamese: "Đèn giao thông", example: "신호등이 빨간불이에요.", exampleVi: "Đèn giao thông đỏ.", topicId: "transport", level: "basic" },
  { id: "ev183", korean: "횡단보도", reading: "hoengdanbodo", vietnamese: "Vạch sang đường", example: "횡단보도에서 건너세요.", exampleVi: "Sang đường ở vạch kẻ đường.", topicId: "transport", level: "basic" },
  { id: "ev184", korean: "주차", reading: "jucha", vietnamese: "Đỗ xe", example: "여기에 주차하면 안 돼요.", exampleVi: "Không được đỗ xe ở đây.", topicId: "transport", level: "basic" },
  { id: "ev185", korean: "면허증", reading: "myeonheojeung", vietnamese: "Bằng lái xe", example: "한국 면허증이 필요해요.", exampleVi: "Cần bằng lái xe Hàn Quốc.", topicId: "transport", level: "intermediate" },
  { id: "ev186", korean: "세탁기", reading: "setakgi", vietnamese: "Máy giặt", example: "세탁기 사용법을 알아요?", exampleVi: "Bạn biết cách dùng máy giặt không?", topicId: "housing", level: "basic" },
  { id: "ev187", korean: "냉장고", reading: "naengjanggo", vietnamese: "Tủ lạnh", example: "냉장고에 음식을 넣어요.", exampleVi: "Tôi để đồ ăn vào tủ lạnh.", topicId: "housing", level: "basic" },
  { id: "ev188", korean: "에어컨", reading: "eeokon", vietnamese: "Điều hòa", example: "여름에 에어컨을 켜요.", exampleVi: "Mùa hè bật điều hòa.", topicId: "housing", level: "basic" },
  { id: "ev189", korean: "난방", reading: "nanbang", vietnamese: "Sưởi ấm", example: "겨울에 난방비가 많이 나와요.", exampleVi: "Mùa đông tiền sưởi nhiều.", topicId: "housing", level: "intermediate" },
  { id: "ev190", korean: "계절", reading: "gyejeol", vietnamese: "Mùa", example: "한국에는 사계절이 있어요.", exampleVi: "Hàn Quốc có 4 mùa.", topicId: "weather", level: "basic" },
  { id: "ev191", korean: "장마", reading: "jangma", vietnamese: "Mùa mưa", example: "장마철에 비가 많이 와요.", exampleVi: "Mùa mưa mưa rất nhiều.", topicId: "weather", level: "intermediate" },
  { id: "ev192", korean: "미세먼지", reading: "misemeonji", vietnamese: "Bụi mịn PM2.5", example: "미세먼지가 심해서 마스크를 써요.", exampleVi: "Bụi mịn nặng nên đeo khẩu trang.", topicId: "weather", level: "intermediate" },
  { id: "ev193", korean: "한파", reading: "hanpa", vietnamese: "Sóng lạnh / Rét đậm", example: "한파 주의보가 발령됐어요.", exampleVi: "Đã phát cảnh báo rét đậm.", topicId: "weather", level: "advanced" },
  { id: "ev194", korean: "폭염", reading: "pogyeom", vietnamese: "Nắng nóng cực đoan", example: "폭염 주의보가 발령됐어요.", exampleVi: "Đã phát cảnh báo nắng nóng.", topicId: "weather", level: "advanced" },
  { id: "ev195", korean: "명절", reading: "myeongjeol", vietnamese: "Ngày lễ truyền thống", example: "명절에 고향에 가고 싶어요.", exampleVi: "Ngày lễ tôi muốn về quê.", topicId: "culture", level: "basic" },
  { id: "ev196", korean: "한복", reading: "hanbok", vietnamese: "Hanbok (trang phục truyền thống)", example: "설날에 한복을 입어요.", exampleVi: "Tết Seollal mặc Hanbok.", topicId: "culture", level: "basic" },
  { id: "ev197", korean: "온돌", reading: "ondol", vietnamese: "Sàn sưởi (Ondol)", example: "한국 집에는 온돌이 있어요.", exampleVi: "Nhà Hàn Quốc có sàn sưởi Ondol.", topicId: "culture", level: "intermediate" },
  { id: "ev198", korean: "눈치", reading: "nunchi", vietnamese: "Nhạy cảm xã hội / Đọc không khí", example: "눈치가 빠른 사람이 직장에서 잘 지내요.", exampleVi: "Người nhạy cảm xã hội dễ hòa nhập nơi làm việc.", topicId: "culture", level: "advanced" },
  { id: "ev199", korean: "빨리빨리", reading: "ppalli ppalli", vietnamese: "Nhanh nhanh (văn hóa làm nhanh)", example: "한국은 빨리빨리 문화가 있어요.", exampleVi: "Hàn Quốc có văn hóa làm nhanh.", topicId: "culture", level: "intermediate" },
  { id: "ev200", korean: "정", reading: "jeong", vietnamese: "Tình cảm / Sự gắn bó (Jeong)", example: "한국 사람들은 정이 많아요.", exampleVi: "Người Hàn Quốc rất giàu tình cảm.", topicId: "culture", level: "advanced" },
  { id: "ev201", korean: "작업 환경", reading: "jageop hwangyeong", vietnamese: "Môi trường làm việc", example: "작업 환경이 좋아야 해요.", exampleVi: "Môi trường làm việc phải tốt.", topicId: "workplace", level: "intermediate" },
  { id: "ev202", korean: "생산성", reading: "saengsanseong", vietnamese: "Năng suất", example: "생산성을 높여야 해요.", exampleVi: "Phải nâng cao năng suất.", topicId: "workplace", level: "advanced" },
  { id: "ev203", korean: "직업병", reading: "jigeombyeong", vietnamese: "Bệnh nghề nghiệp", example: "직업병 예방이 중요해요.", exampleVi: "Phòng ngừa bệnh nghề nghiệp rất quan trọng.", topicId: "safety", level: "advanced" },
  { id: "ev204", korean: "보호구", reading: "bohugu", vietnamese: "Thiết bị bảo hộ cá nhân (PPE)", example: "보호구를 착용하고 작업하세요.", exampleVi: "Đeo thiết bị bảo hộ khi làm việc.", topicId: "safety", level: "intermediate" },
  { id: "ev205", korean: "유해물질", reading: "yuhaemuljiil", vietnamese: "Chất độc hại", example: "유해물질을 조심하세요.", exampleVi: "Hãy cẩn thận với chất độc hại.", topicId: "safety", level: "intermediate" },

  // ─── Thể thao ────────────────────────────────────────────────────────────
  { id: "ev206", korean: "여기", reading: "yeo-gi", vietnamese: "Ở đây", example: "여기에 앉으세요.", exampleVi: "Hãy ngồi ở đây.", topicId: "location", level: "basic" },
  { id: "ev207", korean: "운동복", reading: "un-dong-bok", vietnamese: "Áo quần thể thao", example: "운동복을 입고 운동해요.", exampleVi: "Mặc áo quần thể thao để tập.", topicId: "sports", level: "basic" },
  { id: "ev208", korean: "운동화", reading: "un-dong-hwa", vietnamese: "Giày thể thao", example: "운동화를 신고 달려요.", exampleVi: "Đi giày thể thao để chạy.", topicId: "sports", level: "basic" },
  { id: "ev209", korean: "체조", reading: "che-jo", vietnamese: "Thể dục (nhịp điệu/dụng cụ)", example: "아침마다 체조를 해요.", exampleVi: "Mỗi sáng tôi tập thể dục.", topicId: "sports", level: "basic" },
  { id: "ev210", korean: "축구", reading: "chuk-gu", vietnamese: "Bóng đá", example: "주말에 친구들과 축구를 해요.", exampleVi: "Cuối tuần tôi chơi bóng đá với bạn bè.", topicId: "sports", level: "basic" },
  { id: "ev211", korean: "농구", reading: "nong-gu", vietnamese: "Bóng rổ", example: "농구 경기를 보러 갔어요.", exampleVi: "Tôi đi xem trận bóng rổ.", topicId: "sports", level: "basic" },
  { id: "ev212", korean: "배구", reading: "bae-gu", vietnamese: "Bóng chuyền", example: "배구 팀에 들어갔어요.", exampleVi: "Tôi gia nhập đội bóng chuyền.", topicId: "sports", level: "basic" },
  { id: "ev213", korean: "탁구", reading: "tak-gu", vietnamese: "Bóng bàn", example: "탁구는 실내에서 할 수 있어요.", exampleVi: "Bóng bàn có thể chơi trong nhà.", topicId: "sports", level: "basic" },
  { id: "ev214", korean: "배드민턴", reading: "bae-deu-min-teon", vietnamese: "Cầu lông", example: "공원에서 배드민턴을 쳐요.", exampleVi: "Tôi chơi cầu lông ở công viên.", topicId: "sports", level: "basic" },
  { id: "ev215", korean: "테니스", reading: "te-ni-seu", vietnamese: "Quần vợt", example: "테니스 코트에서 연습해요.", exampleVi: "Tôi luyện tập ở sân quần vợt.", topicId: "sports", level: "basic" },
  { id: "ev216", korean: "권투", reading: "gwon-tu", vietnamese: "Quyền anh", example: "권투 도장에 다녀요.", exampleVi: "Tôi học quyền anh ở võ đường.", topicId: "sports", level: "basic" },
  { id: "ev217", korean: "유도", reading: "yu-do", vietnamese: "Võ Judo", example: "유도는 일본에서 시작된 무술이에요.", exampleVi: "Judo là võ thuật bắt nguồn từ Nhật Bản.", topicId: "sports", level: "intermediate" },
  { id: "ev218", korean: "태권도", reading: "tae-gwon-do", vietnamese: "Võ Taekwondo", example: "태권도는 한국의 전통 무술이에요.", exampleVi: "Taekwondo là võ thuật truyền thống của Hàn Quốc.", topicId: "sports", level: "basic" },
  { id: "ev219", korean: "농구공", reading: "nong-gu-gong", vietnamese: "Quả bóng rổ", example: "농구공을 드리블해요.", exampleVi: "Tôi dribble quả bóng rổ.", topicId: "sports", level: "basic" },
  { id: "ev220", korean: "축구공", reading: "chuk-gu-gong", vietnamese: "Quả bóng đá", example: "축구공을 힘껏 찼어요.", exampleVi: "Tôi đá quả bóng thật mạnh.", topicId: "sports", level: "basic" },
  { id: "ev221", korean: "헬스", reading: "hel-seu", vietnamese: "Tập thể hình", example: "헬스장에서 매일 운동해요.", exampleVi: "Tôi tập thể hình ở phòng gym mỗi ngày.", topicId: "sports", level: "basic" },
  { id: "ev222", korean: "운동시간", reading: "un-dong-si-gan", vietnamese: "Thời gian tập thể dục", example: "운동시간은 하루 30분이에요.", exampleVi: "Thời gian tập thể dục là 30 phút mỗi ngày.", topicId: "sports", level: "basic" },
  { id: "ev223", korean: "운동기구", reading: "un-dong-gi-gu", vietnamese: "Dụng cụ tập thể dục", example: "운동기구를 올바르게 사용하세요.", exampleVi: "Hãy sử dụng dụng cụ tập thể dục đúng cách.", topicId: "sports", level: "intermediate" },
  { id: "ev224", korean: "무게를 들다", reading: "mu-ge-reul deul-da", vietnamese: "Tập tạ", example: "무게를 들어서 근육을 키워요.", exampleVi: "Tôi tập tạ để phát triển cơ bắp.", topicId: "sports", level: "intermediate" },

  // ─── Vị trí & Địa điểm ──────────────────────────────────────────────────
  { id: "ev225", korean: "위치", reading: "wi-chi", vietnamese: "Vị trí", example: "공장의 위치를 알려 주세요.", exampleVi: "Hãy cho tôi biết vị trí của nhà máy.", topicId: "location", level: "basic" },
  { id: "ev226", korean: "장소", reading: "jang-so", vietnamese: "Địa điểm", example: "회의 장소가 어디예요?", exampleVi: "Địa điểm họp ở đâu?", topicId: "location", level: "basic" },
  { id: "ev227", korean: "거기", reading: "geo-gi", vietnamese: "Ở đó", example: "거기에 앉아 주세요.", exampleVi: "Hãy ngồi ở đó.", topicId: "location", level: "basic" },
  { id: "ev228", korean: "저기", reading: "jeo-gi", vietnamese: "Ở kia", example: "저기 보이는 건물이 우리 회사예요.", exampleVi: "Tòa nhà nhìn thấy ở kia là công ty chúng tôi.", topicId: "location", level: "basic" },
  { id: "ev229", korean: "왼쪽", reading: "oen-jjok", vietnamese: "Bên trái", example: "왼쪽으로 돌면 편의점이 있어요.", exampleVi: "Rẽ trái sẽ có cửa hàng tiện lợi.", topicId: "location", level: "basic" },
  { id: "ev230", korean: "오른쪽", reading: "o-reun-jjok", vietnamese: "Bên phải", example: "오른쪽 문으로 들어가세요.", exampleVi: "Hãy vào qua cửa bên phải.", topicId: "location", level: "basic" },
  { id: "ev231", korean: "앞", reading: "ap", vietnamese: "Phía trước", example: "선반 위에 물건을 올려놓으세요.", exampleVi: "Hãy đặt đồ lên kệ phía trên.", topicId: "location", level: "basic" },
  { id: "ev232", korean: "뒤", reading: "dwi", vietnamese: "Phía sau", example: "뒤에 주차장이 있어요.", exampleVi: "Phía sau có bãi đỗ xe.", topicId: "location", level: "basic" },
  { id: "ev233", korean: "가운데", reading: "ga-un-de", vietnamese: "Ở giữa", example: "테이블 가운데에 꽃이 있어요.", exampleVi: "Ở giữa bàn có hoa.", topicId: "location", level: "basic" },
  { id: "ev234", korean: "근처", reading: "geun-cheo", vietnamese: "Gần/Lân cận", example: "근처에 병원이 있어요?", exampleVi: "Gần đây có bệnh viện không?", topicId: "location", level: "basic" },
  { id: "ev235", korean: "멀리", reading: "meol-li", vietnamese: "Xa", example: "집이 회사에서 멀리 있어요.", exampleVi: "Nhà ở xa công ty.", topicId: "location", level: "basic" },
  { id: "ev236", korean: "위", reading: "wi", vietnamese: "Phía trên", example: "선반 위에 물건을 올려놓으세요.", exampleVi: "Hãy đặt đồ lên kệ phía trên.", topicId: "location", level: "basic" },
  { id: "ev237", korean: "아래", reading: "a-rae", vietnamese: "Phía dưới", example: "책상 아래에 가방이 있어요.", exampleVi: "Dưới bàn có túi xách.", topicId: "location", level: "basic" },
  { id: "ev238", korean: "옆", reading: "yeop", vietnamese: "Bên cạnh", example: "제 옆에 앉아도 돼요.", exampleVi: "Bạn có thể ngồi bên cạnh tôi.", topicId: "location", level: "basic" },
  { id: "ev239", korean: "안", reading: "an", vietnamese: "Bên trong", example: "상자 안에 뭐가 있어요?", exampleVi: "Bên trong hộp có gì?", topicId: "location", level: "basic" },
  { id: "ev240", korean: "밖", reading: "bak", vietnamese: "Bên ngoài", example: "밖에서 기다려 주세요.", exampleVi: "Hãy đợi ở bên ngoài.", topicId: "location", level: "basic" },
  { id: "ev241", korean: "주변", reading: "ju-byeon", vietnamese: "Xung quanh", example: "주변을 잘 살펴보세요.", exampleVi: "Hãy quan sát xung quanh kỹ.", topicId: "location", level: "basic" },
  { id: "ev242", korean: "구석", reading: "gu-seok", vietnamese: "Góc", example: "방 구석에 짐을 놓았어요.", exampleVi: "Tôi để hành lý ở góc phòng.", topicId: "location", level: "basic" },
  { id: "ev243", korean: "복도", reading: "bok-do", vietnamese: "Hành lang", example: "복도에서 뛰지 마세요.", exampleVi: "Đừng chạy trong hành lang.", topicId: "location", level: "basic" },
  { id: "ev244", korean: "대로", reading: "dae-ro", vietnamese: "Đường lớn", example: "대로를 따라 걸어가세요.", exampleVi: "Hãy đi dọc theo đường lớn.", topicId: "location", level: "basic" },
  { id: "ev245", korean: "길", reading: "gil", vietnamese: "Đường đi", example: "이 길이 맞아요?", exampleVi: "Con đường này có đúng không?", topicId: "location", level: "basic" },
];
