export interface GrammarPattern {
  id: string;
  pattern: string;
  meaning: string;
  level: "A1" | "A2" | "B1" | "B2";
  category: string;
  explanation: string;
  examples: { korean: string; vietnamese: string }[];
  exercises: GrammarExercise[];
}

export interface GrammarExercise {
  id: string;
  type: "fill" | "choose" | "arrange";
  question: string;
  questionVi: string;
  blank?: string;
  options?: string[];
  optionsVi?: string[];
  answer: string;
  explanation: string;
}

export const GRAMMAR_CATEGORIES = [
  { id: "tense", label: "Thì & Thời gian", icon: "ri-time-line", color: "app-accent-primary" },
  { id: "particle", label: "Trợ từ", icon: "ri-link", color: "#34d399" },
  { id: "ending", label: "Đuôi câu", icon: "ri-chat-1-line", color: "#fb923c" },
  { id: "connective", label: "Liên kết câu", icon: "ri-git-merge-line", color: "#a78bfa" },
  { id: "expression", label: "Biểu đạt", icon: "ri-emotion-line", color: "#38bdf8" },
  { id: "honorific", label: "Kính ngữ", icon: "ri-user-star-line", color: "#f472b6" },
];

export const grammarPatterns: GrammarPattern[] = [
  // ─── A1 ──────────────────────────────────────────────────────────────────
  {
    id: "g1",
    pattern: "N은/는",
    meaning: "Trợ từ chủ đề (là, thì)",
    level: "A1",
    category: "particle",
    explanation: "은/는 là trợ từ chủ đề, đứng sau danh từ để chỉ chủ đề của câu. Dùng 은 sau phụ âm, 는 sau nguyên âm.",
    examples: [
      { korean: "저는 학생입니다.", vietnamese: "Tôi là học sinh." },
      { korean: "이것은 책입니다.", vietnamese: "Đây là quyển sách." },
      { korean: "한국은 아름답습니다.", vietnamese: "Hàn Quốc thì đẹp." },
    ],
    exercises: [
      { id: "g1e1", type: "fill", question: "저___ 베트남 사람입니다.", questionVi: "Tôi là người Việt Nam.", blank: "는", answer: "는", explanation: "저 kết thúc bằng nguyên âm ㅓ nên dùng 는." },
      { id: "g1e2", type: "choose", question: "학생___ 열심히 공부합니다.", questionVi: "Học sinh học chăm chỉ.", options: ["은", "는", "이", "가"], optionsVi: ["은 (sau phụ âm)", "는 (sau nguyên âm)", "이 (chủ ngữ)", "가 (chủ ngữ)"], answer: "은", explanation: "학생 kết thúc bằng phụ âm ㅇ nên dùng 은." },
      { id: "g1e3", type: "fill", question: "오늘___ 날씨가 좋습니다.", questionVi: "Hôm nay thời tiết đẹp.", blank: "은", answer: "은", explanation: "오늘 kết thúc bằng phụ âm ㄹ nên dùng 은." },
    ],
  },
  {
    id: "g2",
    pattern: "N이/가",
    meaning: "Trợ từ chủ ngữ",
    level: "A1",
    category: "particle",
    explanation: "이/가 là trợ từ chủ ngữ, nhấn mạnh vào chủ thể thực hiện hành động. Dùng 이 sau phụ âm, 가 sau nguyên âm.",
    examples: [
      { korean: "꽃이 예쁩니다.", vietnamese: "Hoa đẹp." },
      { korean: "비가 옵니다.", vietnamese: "Trời mưa." },
      { korean: "누가 왔어요?", vietnamese: "Ai đến vậy?" },
    ],
    exercises: [
      { id: "g2e1", type: "choose", question: "사과___ 맛있습니다.", questionVi: "Táo ngon.", options: ["이", "가", "은", "는"], optionsVi: ["이 (sau phụ âm)", "가 (sau nguyên âm)", "은", "는"], answer: "가", explanation: "사과 kết thúc bằng nguyên âm ㅏ nên dùng 가." },
      { id: "g2e2", type: "fill", question: "누구___ 한국 사람이에요?", questionVi: "Ai là người Hàn Quốc?", blank: "가", answer: "가", explanation: "누구 kết thúc bằng nguyên âm ㅜ nên dùng 가." },
    ],
  },
  {
    id: "g3",
    pattern: "V-아/어요",
    meaning: "Thì hiện tại (thân mật lịch sự)",
    level: "A1",
    category: "tense",
    explanation: "Đuôi -아요/-어요 dùng cho thì hiện tại ở thể lịch sự thân mật (해요체). Nếu nguyên âm cuối gốc là ㅏ/ㅗ → 아요, còn lại → 어요.",
    examples: [
      { korean: "저는 밥을 먹어요.", vietnamese: "Tôi ăn cơm." },
      { korean: "친구가 와요.", vietnamese: "Bạn đến." },
      { korean: "음악을 들어요.", vietnamese: "Tôi nghe nhạc." },
    ],
    exercises: [
      { id: "g3e1", type: "choose", question: "저는 학교에 ___. (가다)", questionVi: "Tôi đến trường.", options: ["가요", "가아요", "갑니다", "갔어요"], optionsVi: ["đi (hiện tại)", "sai", "đi (trang trọng)", "đã đi (quá khứ)"], answer: "가요", explanation: "가다 → 가 + 아요 = 가요." },
      { id: "g3e2", type: "fill", question: "저는 책을 읽___.", questionVi: "Tôi đọc sách.", blank: "어요", answer: "어요", explanation: "읽다 → 읽 + 어요 = 읽어요." },
    ],
  },
  {
    id: "g4",
    pattern: "V-았/었어요",
    meaning: "Thì quá khứ",
    level: "A1",
    category: "tense",
    explanation: "Đuôi -았어요/-었어요 dùng cho thì quá khứ. Nếu nguyên âm cuối gốc là ㅏ/ㅗ → 았어요, còn lại → 었어요.",
    examples: [
      { korean: "어제 밥을 먹었어요.", vietnamese: "Hôm qua tôi đã ăn cơm." },
      { korean: "친구를 만났어요.", vietnamese: "Tôi đã gặp bạn." },
      { korean: "한국에 갔어요.", vietnamese: "Tôi đã đến Hàn Quốc." },
    ],
    exercises: [
      { id: "g4e1", type: "choose", question: "어제 영화를 ___. (보다)", questionVi: "Hôm qua tôi đã xem phim.", options: ["봐요", "봤어요", "볼 거예요", "보세요"], optionsVi: ["xem (hiện tại)", "đã xem (quá khứ)", "sẽ xem (tương lai)", "hãy xem (mệnh lệnh)"], answer: "봤어요", explanation: "보다 → 봤어요 (quá khứ)." },
      { id: "g4e2", type: "fill", question: "어제 비가 ___.", questionVi: "Hôm qua trời đã mưa.", blank: "왔어요", answer: "왔어요", explanation: "오다 → 왔어요." },
    ],
  },
  {
    id: "g5",
    pattern: "N을/를",
    meaning: "Trợ từ tân ngữ",
    level: "A1",
    category: "particle",
    explanation: "을/를 là trợ từ tân ngữ, đứng sau danh từ là đối tượng của hành động. Dùng 을 sau phụ âm, 를 후 nguyên âm.",
    examples: [
      { korean: "사과를 먹어요.", vietnamese: "Tôi ăn táo." },
      { korean: "책을 읽어요.", vietnamese: "Tôi đọc sách." },
      { korean: "음악을 들어요.", vietnamese: "Tôi nghe nhạc." },
    ],
    exercises: [
      { id: "g5e1", type: "choose", question: "저는 커피___ 마셔요.", questionVi: "Tôi uống cà phê.", options: ["을", "를", "이", "가"], optionsVi: ["을 (sau phụ âm)", "를 (sau nguyên âm)", "이", "가"], answer: "를", explanation: "커피 kết thúc bằng nguyên âm ㅣ nên dùng 를." },
      { id: "g5e2", type: "fill", question: "한국어___ 공부해요.", questionVi: "Tôi học tiếng Hàn.", blank: "를", answer: "를", explanation: "한국어 kết thúc bằng nguyên âm ㅓ nên dùng 를." },
    ],
  },
  {
    id: "g6",
    pattern: "N에",
    meaning: "Trợ từ nơi chốn / thời gian",
    level: "A1",
    category: "particle",
    explanation: "에 chỉ nơi chốn (tồn tại, hướng đến) hoặc thời gian. Không biến đổi theo phụ âm/nguyên âm.",
    examples: [
      { korean: "학교에 가요.", vietnamese: "Tôi đến trường." },
      { korean: "집에 있어요.", vietnamese: "Tôi ở nhà." },
      { korean: "아침 8시에 일어나요.", vietnamese: "Tôi dậy lúc 8 giờ sáng." },
    ],
    exercises: [
      { id: "g6e1", type: "choose", question: "저는 서울___ 살아요.", questionVi: "Tôi sống ở Seoul.", options: ["에", "에서", "으로", "와"], optionsVi: ["ở (tồn tại)", "ở (hành động)", "đến/bằng", "và"], answer: "에", explanation: "살다 (sống) dùng 에 để chỉ nơi tồn tại." },
      { id: "g6e2", type: "fill", question: "내일___ 만나요.", questionVi: "Gặp nhau vào ngày mai.", blank: "에", answer: "에", explanation: "에 chỉ thời gian." },
    ],
  },
  {
    id: "g7",
    pattern: "N에서",
    meaning: "Trợ từ nơi hành động diễn ra",
    level: "A1",
    category: "particle",
    explanation: "에서 chỉ nơi diễn ra hành động (khác với 에 chỉ nơi tồn tại). Cũng dùng để chỉ xuất phát điểm.",
    examples: [
      { korean: "학교에서 공부해요.", vietnamese: "Tôi học ở trường." },
      { korean: "식당에서 밥을 먹어요.", vietnamese: "Tôi ăn cơm ở nhà hàng." },
      { korean: "서울에서 왔어요.", vietnamese: "Tôi đến từ Seoul." },
    ],
    exercises: [
      { id: "g7e1", type: "choose", question: "도서관___ 책을 읽어요.", questionVi: "Tôi đọc sách ở thư viện.", options: ["에", "에서", "으로", "이"], optionsVi: ["ở (tồn tại)", "ở (hành động)", "đến/bằng", "chủ ngữ"], answer: "에서", explanation: "읽다 là hành động nên dùng 에서." },
    ],
  },
  {
    id: "g8",
    pattern: "N이/가 아니다",
    meaning: "Không phải là N",
    level: "A1",
    category: "ending",
    explanation: "이/가 아니다 phủ định danh từ, nghĩa là 'không phải là'. Dùng 이 아니다 sau phụ âm, 가 아니다 sau nguyên âm.",
    examples: [
      { korean: "저는 학생이 아니에요.", vietnamese: "Tôi không phải là học sinh." },
      { korean: "이것은 책이 아니에요.", vietnamese: "Đây không phải là sách." },
      { korean: "그 사람은 선생님이 아니에요.", vietnamese: "Người đó không phải là giáo viên." },
    ],
    exercises: [
      { id: "g8e1", type: "choose", question: "저는 의사___ 아니에요.", questionVi: "Tôi không phải là bác sĩ.", options: ["이", "가", "은", "를"], optionsVi: ["이 (sau phụ âm)", "가 (sau nguyên âm)", "은", "를"], answer: "가", explanation: "의사 kết thúc bằng nguyên âm ㅏ nên dùng 가 아니에요." },
    ],
  },
  {
    id: "g9",
    pattern: "N하고 / N와/과",
    meaning: "Và, cùng với",
    level: "A1",
    category: "particle",
    explanation: "하고, 와/과 đều có nghĩa 'và, cùng với'. 하고 dùng trong văn nói, 와/과 dùng trong văn viết. 와 sau nguyên âm, 과 sau phụ âm.",
    examples: [
      { korean: "사과하고 바나나를 먹어요.", vietnamese: "Tôi ăn táo và chuối." },
      { korean: "친구와 같이 가요.", vietnamese: "Tôi đi cùng bạn." },
      { korean: "빵과 우유를 샀어요.", vietnamese: "Tôi đã mua bánh mì và sữa." },
    ],
    exercises: [
      { id: "g9e1", type: "choose", question: "저는 엄마___ 아빠를 사랑해요.", questionVi: "Tôi yêu mẹ và bố.", options: ["하고", "에서", "에게", "으로"], optionsVi: ["và", "ở", "cho/đến", "bằng/đến"], answer: "하고", explanation: "하고 = và, cùng với (văn nói)." },
    ],
  },
  {
    id: "g10",
    pattern: "V-고 싶다",
    meaning: "Muốn làm gì",
    level: "A1",
    category: "expression",
    explanation: "-고 싶다 diễn tả mong muốn của người nói. Kết hợp với -아/어요 → -고 싶어요.",
    examples: [
      { korean: "한국에 가고 싶어요.", vietnamese: "Tôi muốn đến Hàn Quốc." },
      { korean: "한국어를 잘하고 싶어요.", vietnamese: "Tôi muốn giỏi tiếng Hàn." },
      { korean: "뭐 먹고 싶어요?", vietnamese: "Bạn muốn ăn gì?" },
    ],
    exercises: [
      { id: "g10e1", type: "fill", question: "저는 의사가 되___ 싶어요.", questionVi: "Tôi muốn trở thành bác sĩ.", blank: "고", answer: "고", explanation: "-고 싶다 = muốn làm gì." },
      { id: "g10e2", type: "choose", question: "저는 한국 음식을 먹___ 싶어요.", questionVi: "Tôi muốn ăn đồ ăn Hàn Quốc.", options: ["고", "어", "아", "지"], optionsVi: ["고 (muốn)", "어 (hiện tại)", "아 (hiện tại)", "지 (phủ định)"], answer: "고", explanation: "-고 싶다 luôn dùng -고." },
    ],
  },
  // ─── A2 ──────────────────────────────────────────────────────────────────
  {
    id: "g11",
    pattern: "V-(으)ㄹ 거예요",
    meaning: "Thì tương lai / Dự định",
    level: "A2",
    category: "tense",
    explanation: "-(으)ㄹ 거예요 diễn tả kế hoạch hoặc dự đoán trong tương lai. Dùng -ㄹ 거예요 sau nguyên âm, -을 거예요 sau phụ âm.",
    examples: [
      { korean: "내일 한국에 갈 거예요.", vietnamese: "Ngày mai tôi sẽ đến Hàn Quốc." },
      { korean: "저녁에 밥을 먹을 거예요.", vietnamese: "Tối tôi sẽ ăn cơm." },
      { korean: "비가 올 거예요.", vietnamese: "Trời sẽ mưa." },
    ],
    exercises: [
      { id: "g11e1", type: "choose", question: "내일 친구를 만날 ___.", questionVi: "Ngày mai tôi sẽ gặp bạn.", options: ["거예요", "이에요", "았어요", "아요"], optionsVi: ["거예요 (tương lai)", "이에요 (là)", "았어요 (quá khứ)", "아요 (hiện tại)"], answer: "거예요", explanation: "-(으)ㄹ 거예요 diễn tả tương lai/dự định." },
      { id: "g11e2", type: "fill", question: "주말에 영화를 볼 ___.", questionVi: "Cuối tuần tôi sẽ xem phim.", blank: "거예요", answer: "거예요", explanation: "보다 → 볼 거예요 (tương lai)." },
    ],
  },
  {
    id: "g12",
    pattern: "A/V-고",
    meaning: "Và, rồi (nối câu)",
    level: "A2",
    category: "connective",
    explanation: "-고 nối hai vế câu có nghĩa 'và' hoặc 'rồi'. Không biến đổi theo nguyên âm/phụ âm.",
    examples: [
      { korean: "저는 밥을 먹고 커피를 마셔요.", vietnamese: "Tôi ăn cơm rồi uống cà phê." },
      { korean: "키가 크고 잘생겼어요.", vietnamese: "Cao và đẹp trai." },
      { korean: "공부하고 운동해요.", vietnamese: "Học rồi tập thể dục." },
    ],
    exercises: [
      { id: "g12e1", type: "choose", question: "저는 노래를 하___ 춤을 춰요.", questionVi: "Tôi hát rồi nhảy.", options: ["고", "서", "지만", "아서"], optionsVi: ["và/rồi", "vì/nên", "nhưng", "vì/nên"], answer: "고", explanation: "-고 nối hai hành động liên tiếp." },
    ],
  },
  {
    id: "g13",
    pattern: "A/V-지만",
    meaning: "Nhưng, tuy nhiên",
    level: "A2",
    category: "connective",
    explanation: "-지만 diễn tả sự tương phản giữa hai vế câu, tương đương 'nhưng' trong tiếng Việt.",
    examples: [
      { korean: "비싸지만 맛있어요.", vietnamese: "Đắt nhưng ngon." },
      { korean: "피곤하지만 공부해요.", vietnamese: "Mệt nhưng vẫn học." },
      { korean: "작지만 예뻐요.", vietnamese: "Nhỏ nhưng đẹp." },
    ],
    exercises: [
      { id: "g13e1", type: "choose", question: "한국어가 어렵___ 재미있어요.", questionVi: "Tiếng Hàn khó nhưng thú vị.", options: ["지만", "고", "서", "면"], optionsVi: ["nhưng", "và", "vì", "nếu"], answer: "지만", explanation: "-지만 diễn tả tương phản." },
    ],
  },
  {
    id: "g14",
    pattern: "V-(으)세요",
    meaning: "Mệnh lệnh lịch sự / Đề nghị",
    level: "A2",
    category: "ending",
    explanation: "-(으)세요 dùng để ra lệnh hoặc đề nghị một cách lịch sự. Dùng -세요 sau nguyên âm, -으세요 sau phụ âm.",
    examples: [
      { korean: "여기 앉으세요.", vietnamese: "Hãy ngồi đây." },
      { korean: "천천히 말씀해 주세요.", vietnamese: "Hãy nói chậm thôi." },
      { korean: "안전모를 착용하세요.", vietnamese: "Hãy đội mũ bảo hộ." },
    ],
    exercises: [
      { id: "g14e1", type: "choose", question: "이쪽으로 오___.", questionVi: "Hãy đến phía này.", options: ["세요", "어요", "았어요", "ㄹ 거예요"], optionsVi: ["hãy (lịch sự)", "đến (hiện tại)", "đã đến", "sẽ đến"], answer: "세요", explanation: "오다 → 오세요 (mệnh lệnh lịch sự)." },
    ],
  },
  {
    id: "g15",
    pattern: "V-지 마세요",
    meaning: "Đừng làm gì (cấm đoán lịch sự)",
    level: "A2",
    category: "ending",
    explanation: "-지 마세요 dùng để cấm đoán hoặc khuyên không nên làm gì đó một cách lịch sự.",
    examples: [
      { korean: "여기서 담배를 피우지 마세요.", vietnamese: "Đừng hút thuốc ở đây." },
      { korean: "걱정하지 마세요.", vietnamese: "Đừng lo lắng." },
      { korean: "늦지 마세요.", vietnamese: "Đừng đến muộn." },
    ],
    exercises: [
      { id: "g15e1", type: "choose", question: "너무 많이 먹___ 마세요.", questionVi: "Đừng ăn quá nhiều.", options: ["지", "고", "어서", "면"], optionsVi: ["지 (cấm đoán)", "고 (và)", "어서 (vì)", "면 (nếu)"], answer: "지", explanation: "-지 마세요 = đừng làm gì." },
    ],
  },
  {
    id: "g16",
    pattern: "N에게/한테",
    meaning: "Cho ai, đến ai (người nhận)",
    level: "A2",
    category: "particle",
    explanation: "에게/한테 chỉ người nhận hành động. 에게 dùng trong văn viết, 한테 dùng trong văn nói.",
    examples: [
      { korean: "친구에게 선물을 줬어요.", vietnamese: "Tôi đã tặng quà cho bạn." },
      { korean: "선생님한테 질문했어요.", vietnamese: "Tôi đã hỏi thầy giáo." },
      { korean: "엄마에게 전화했어요.", vietnamese: "Tôi đã gọi điện cho mẹ." },
    ],
    exercises: [
      { id: "g16e1", type: "choose", question: "저는 동생___ 책을 줬어요.", questionVi: "Tôi đã cho em sách.", options: ["에게", "에서", "에", "으로"], optionsVi: ["cho (người nhận)", "ở (hành động)", "ở (tồn tại)", "bằng/đến"], answer: "에게", explanation: "에게 chỉ người nhận hành động." },
    ],
  },
  {
    id: "g17",
    pattern: "V-(으)ㄹ 수 있다/없다",
    meaning: "Có thể / Không thể",
    level: "A2",
    category: "expression",
    explanation: "-(으)ㄹ 수 있다 = có thể làm gì. -(으)ㄹ 수 없다 = không thể làm gì.",
    examples: [
      { korean: "저는 한국어를 할 수 있어요.", vietnamese: "Tôi có thể nói tiếng Hàn." },
      { korean: "지금은 갈 수 없어요.", vietnamese: "Bây giờ tôi không thể đi." },
      { korean: "수영을 할 수 있어요?", vietnamese: "Bạn có thể bơi không?" },
    ],
    exercises: [
      { id: "g17e1", type: "choose", question: "저는 운전을 할 수 ___.", questionVi: "Tôi có thể lái xe.", options: ["있어요", "없어요", "싶어요", "봐요"], optionsVi: ["có thể", "không thể", "muốn", "xem"], answer: "있어요", explanation: "할 수 있어요 = có thể làm." },
    ],
  },
  {
    id: "g18",
    pattern: "V-아/어 보다",
    meaning: "Thử làm gì",
    level: "A2",
    category: "expression",
    explanation: "-아/어 보다 diễn tả việc thử làm gì đó để trải nghiệm.",
    examples: [
      { korean: "김치를 먹어 봤어요.", vietnamese: "Tôi đã thử ăn kim chi." },
      { korean: "한번 해 보세요.", vietnamese: "Hãy thử một lần xem." },
      { korean: "한국에 가 보고 싶어요.", vietnamese: "Tôi muốn thử đến Hàn Quốc." },
    ],
    exercises: [
      { id: "g18e1", type: "choose", question: "이 음식을 먹어 ___.", questionVi: "Hãy thử ăn món này.", options: ["보세요", "주세요", "싶어요", "있어요"], optionsVi: ["hãy thử", "hãy cho", "muốn", "có thể"], answer: "보세요", explanation: "-아/어 보세요 = hãy thử làm gì." },
    ],
  },
  {
    id: "g19",
    pattern: "V-아/어 주다",
    meaning: "Làm gì cho ai (giúp đỡ)",
    level: "A2",
    category: "expression",
    explanation: "-아/어 주다 diễn tả việc làm gì đó để giúp đỡ người khác.",
    examples: [
      { korean: "도와주세요.", vietnamese: "Hãy giúp tôi." },
      { korean: "가르쳐 주셨어요.", vietnamese: "Thầy đã dạy cho tôi." },
      { korean: "사진을 찍어 줄게요.", vietnamese: "Tôi sẽ chụp ảnh cho bạn." },
    ],
    exercises: [
      { id: "g19e1", type: "fill", question: "길을 가르쳐 ___ 세요.", questionVi: "Hãy chỉ đường cho tôi.", blank: "주", answer: "주", explanation: "-아/어 주다 = làm gì cho ai." },
    ],
  },
  {
    id: "g20",
    pattern: "N(이)라고 하다",
    meaning: "Được gọi là, tên là",
    level: "A2",
    category: "expression",
    explanation: "(이)라고 하다 dùng để giới thiệu tên hoặc trích dẫn. Dùng 이라고 sau phụ âm, 라고 sau nguyên âm.",
    examples: [
      { korean: "저는 민준이라고 해요.", vietnamese: "Tôi tên là Minjun." },
      { korean: "이것을 한국어로 뭐라고 해요?", vietnamese: "Cái này tiếng Hàn gọi là gì?" },
      { korean: "선생님이 내일 시험이라고 했어요.", vietnamese: "Thầy nói ngày mai có thi." },
    ],
    exercises: [
      { id: "g20e1", type: "choose", question: "제 이름은 하나___ 해요.", questionVi: "Tên tôi là Hana.", options: ["라고", "이라고", "라서", "이라서"], optionsVi: ["라고 (sau nguyên âm)", "이라고 (sau phụ âm)", "라서", "이라서"], answer: "라고", explanation: "하나 kết thúc bằng nguyên âm ㅏ nên dùng 라고." },
    ],
  },
  // ─── B1 ──────────────────────────────────────────────────────────────────
  {
    id: "g21",
    pattern: "V-아/어서",
    meaning: "Vì... nên... / Sau khi... thì...",
    level: "B1",
    category: "connective",
    explanation: "-아/어서 có hai nghĩa: (1) nguyên nhân-kết quả 'vì...nên...', (2) trình tự hành động 'sau khi...thì...'. Không dùng với thì quá khứ.",
    examples: [
      { korean: "배가 고파서 밥을 먹었어요.", vietnamese: "Vì đói nên tôi đã ăn cơm." },
      { korean: "학교에 가서 공부했어요.", vietnamese: "Đến trường rồi học." },
      { korean: "피곤해서 일찍 잤어요.", vietnamese: "Vì mệt nên ngủ sớm." },
    ],
    exercises: [
      { id: "g21e1", type: "choose", question: "비가 와___ 우산을 가져왔어요.", questionVi: "Vì trời mưa nên tôi mang ô.", options: ["서", "지만", "고", "면"], optionsVi: ["vì/nên", "nhưng", "và", "nếu"], answer: "서", explanation: "-아/어서 diễn tả nguyên nhân-kết quả." },
    ],
  },
  {
    id: "g22",
    pattern: "V-(으)면",
    meaning: "Nếu... thì...",
    level: "B1",
    category: "connective",
    explanation: "-(으)면 diễn tả điều kiện 'nếu...thì...'. Dùng -면 sau nguyên âm, -으면 sau phụ âm.",
    examples: [
      { korean: "열심히 공부하면 합격할 거예요.", vietnamese: "Nếu học chăm chỉ thì sẽ đậu." },
      { korean: "시간이 있으면 같이 가요.", vietnamese: "Nếu có thời gian thì đi cùng nhé." },
      { korean: "비가 오면 집에 있을 거예요.", vietnamese: "Nếu trời mưa thì tôi sẽ ở nhà." },
    ],
    exercises: [
      { id: "g22e1", type: "choose", question: "돈이 있___ 여행을 갈 거예요.", questionVi: "Nếu có tiền thì sẽ đi du lịch.", options: ["으면", "면", "어서", "지만"], optionsVi: ["nếu (sau phụ âm)", "nếu (sau nguyên âm)", "vì", "nhưng"], answer: "으면", explanation: "돈 kết thúc bằng phụ âm ㄴ nên dùng -으면." },
    ],
  },
  {
    id: "g23",
    pattern: "V-(으)ㄹ 때",
    meaning: "Khi làm gì",
    level: "B1",
    category: "connective",
    explanation: "-(으)ㄹ 때 diễn tả thời điểm xảy ra hành động, tương đương 'khi' trong tiếng Việt.",
    examples: [
      { korean: "한국에 갈 때 선물을 사 왔어요.", vietnamese: "Khi đến Hàn Quốc tôi đã mua quà." },
      { korean: "피곤할 때 커피를 마셔요.", vietnamese: "Khi mệt tôi uống cà phê." },
      { korean: "어릴 때 한국어를 배웠어요.", vietnamese: "Khi còn nhỏ tôi đã học tiếng Hàn." },
    ],
    exercises: [
      { id: "g23e1", type: "choose", question: "배가 고플 ___ 뭐 먹어요?", questionVi: "Khi đói bạn ăn gì?", options: ["때", "면", "서", "고"], optionsVi: ["khi", "nếu", "vì", "và"], answer: "때", explanation: "-(으)ㄹ 때 = khi làm gì." },
    ],
  },
  {
    id: "g24",
    pattern: "V-는 동안",
    meaning: "Trong khi, suốt thời gian",
    level: "B1",
    category: "connective",
    explanation: "-는 동안 diễn tả khoảng thời gian một hành động diễn ra, tương đương 'trong khi, suốt'.",
    examples: [
      { korean: "공부하는 동안 음악을 들어요.", vietnamese: "Trong khi học tôi nghe nhạc." },
      { korean: "한국에 있는 동안 많이 배웠어요.", vietnamese: "Suốt thời gian ở Hàn Quốc tôi đã học được nhiều." },
      { korean: "기다리는 동안 책을 읽었어요.", vietnamese: "Trong khi chờ tôi đã đọc sách." },
    ],
    exercises: [
      { id: "g24e1", type: "fill", question: "수업하는 ___ 핸드폰을 쓰지 마세요.", questionVi: "Trong khi học đừng dùng điện thoại.", blank: "동안", answer: "동안", explanation: "-는 동안 = trong khi, suốt thời gian." },
    ],
  },
  {
    id: "g25",
    pattern: "V-기 전에",
    meaning: "Trước khi làm gì",
    level: "B1",
    category: "connective",
    explanation: "-기 전에 diễn tả hành động xảy ra trước một hành động khác.",
    examples: [
      { korean: "자기 전에 이를 닦아요.", vietnamese: "Trước khi ngủ tôi đánh răng." },
      { korean: "밥을 먹기 전에 손을 씻어요.", vietnamese: "Trước khi ăn tôi rửa tay." },
      { korean: "한국에 가기 전에 한국어를 배웠어요.", vietnamese: "Trước khi đến Hàn Quốc tôi đã học tiếng Hàn." },
    ],
    exercises: [
      { id: "g25e1", type: "choose", question: "출근하___ 전에 커피를 마셔요.", questionVi: "Trước khi đi làm tôi uống cà phê.", options: ["기", "고", "어서", "면"], optionsVi: ["기 (trước khi)", "고 (và)", "어서 (vì)", "면 (nếu)"], answer: "기", explanation: "-기 전에 = trước khi làm gì." },
    ],
  },
  {
    id: "g26",
    pattern: "V-(으)ㄴ 후에",
    meaning: "Sau khi làm gì",
    level: "B1",
    category: "connective",
    explanation: "-(으)ㄴ 후에 diễn tả hành động xảy ra sau một hành động khác đã hoàn thành.",
    examples: [
      { korean: "밥을 먹은 후에 산책해요.", vietnamese: "Sau khi ăn cơm tôi đi dạo." },
      { korean: "일이 끝난 후에 만나요.", vietnamese: "Sau khi xong việc thì gặp nhau." },
      { korean: "졸업한 후에 취직했어요.", vietnamese: "Sau khi tốt nghiệp tôi đã đi làm." },
    ],
    exercises: [
      { id: "g26e1", type: "fill", question: "수업이 끝난 ___ 에 도서관에 가요.", questionVi: "Sau khi hết giờ học tôi đến thư viện.", blank: "후", answer: "후", explanation: "-(으)ㄴ 후에 = sau khi làm gì." },
    ],
  },
  {
    id: "g27",
    pattern: "A/V-아/어도",
    meaning: "Dù... cũng...",
    level: "B1",
    category: "connective",
    explanation: "-아/어도 diễn tả sự nhượng bộ, tương đương 'dù...cũng...' trong tiếng Việt.",
    examples: [
      { korean: "비가 와도 갈 거예요.", vietnamese: "Dù trời mưa tôi cũng sẽ đi." },
      { korean: "피곤해도 공부해요.", vietnamese: "Dù mệt tôi cũng học." },
      { korean: "돈이 없어도 행복해요.", vietnamese: "Dù không có tiền tôi cũng hạnh phúc." },
    ],
    exercises: [
      { id: "g27e1", type: "choose", question: "어려워___ 포기하지 않을 거예요.", questionVi: "Dù khó tôi cũng sẽ không bỏ cuộc.", options: ["도", "서", "지만", "면"], optionsVi: ["dù...cũng", "vì", "nhưng", "nếu"], answer: "도", explanation: "-아/어도 = dù...cũng..." },
    ],
  },
  {
    id: "g28",
    pattern: "V-는 것",
    meaning: "Danh từ hóa động từ",
    level: "B1",
    category: "expression",
    explanation: "-는 것 biến động từ thành danh từ, tương đương 'việc làm gì' trong tiếng Việt.",
    examples: [
      { korean: "한국어를 배우는 것이 재미있어요.", vietnamese: "Việc học tiếng Hàn thú vị." },
      { korean: "운동하는 것을 좋아해요.", vietnamese: "Tôi thích việc tập thể dục." },
      { korean: "일찍 일어나는 것이 힘들어요.", vietnamese: "Việc dậy sớm thật khó." },
    ],
    exercises: [
      { id: "g28e1", type: "fill", question: "음악을 듣___ 것이 좋아요.", questionVi: "Tôi thích việc nghe nhạc.", blank: "는", answer: "는", explanation: "-는 것 danh từ hóa động từ hiện tại." },
    ],
  },
  {
    id: "g29",
    pattern: "V-(으)ㄹ 것 같다",
    meaning: "Có vẻ sẽ, dự đoán tương lai",
    level: "B1",
    category: "expression",
    explanation: "-(으)ㄹ 것 같다 diễn tả dự đoán về tương lai hoặc suy đoán chưa chắc chắn.",
    examples: [
      { korean: "내일 비가 올 것 같아요.", vietnamese: "Có vẻ ngày mai trời sẽ mưa." },
      { korean: "그 사람이 올 것 같아요.", vietnamese: "Có vẻ người đó sẽ đến." },
      { korean: "시험이 어려울 것 같아요.", vietnamese: "Có vẻ bài thi sẽ khó." },
    ],
    exercises: [
      { id: "g29e1", type: "choose", question: "오늘 늦게 끝날 것 ___.", questionVi: "Có vẻ hôm nay sẽ kết thúc muộn.", options: ["같아요", "싶어요", "있어요", "봐요"], optionsVi: ["có vẻ", "muốn", "có thể", "xem"], answer: "같아요", explanation: "-(으)ㄹ 것 같다 = có vẻ sẽ..." },
    ],
  },
  {
    id: "g30",
    pattern: "V-아/어야 하다",
    meaning: "Phải làm gì (bắt buộc)",
    level: "B1",
    category: "expression",
    explanation: "-아/어야 하다 diễn tả nghĩa vụ hoặc sự cần thiết phải làm gì đó.",
    examples: [
      { korean: "안전모를 착용해야 합니다.", vietnamese: "Phải đội mũ bảo hộ." },
      { korean: "매일 공부해야 해요.", vietnamese: "Phải học mỗi ngày." },
      { korean: "일찍 일어나야 해요.", vietnamese: "Phải dậy sớm." },
    ],
    exercises: [
      { id: "g30e1", type: "fill", question: "한국에서 일하려면 비자가 있어___ 해요.", questionVi: "Để làm việc ở Hàn Quốc phải có visa.", blank: "야", answer: "야", explanation: "-아/어야 하다 = phải làm gì." },
    ],
  },
  {
    id: "g31",
    pattern: "V-지 않다",
    meaning: "Không làm gì (phủ định)",
    level: "B1",
    category: "ending",
    explanation: "-지 않다 là cách phủ định dài, dùng để phủ định động từ hoặc tính từ. Tương đương với 안 + V.",
    examples: [
      { korean: "저는 고기를 먹지 않아요.", vietnamese: "Tôi không ăn thịt." },
      { korean: "오늘은 학교에 가지 않았어요.", vietnamese: "Hôm nay tôi đã không đến trường." },
      { korean: "그 영화는 재미있지 않아요.", vietnamese: "Bộ phim đó không thú vị." },
    ],
    exercises: [
      { id: "g31e1", type: "choose", question: "저는 술을 마시___ 않아요.", questionVi: "Tôi không uống rượu.", options: ["지", "고", "어서", "면"], optionsVi: ["지 (phủ định)", "고 (và)", "어서 (vì)", "면 (nếu)"], answer: "지", explanation: "-지 않다 = không làm gì." },
    ],
  },
  {
    id: "g32",
    pattern: "V-(으)ㄹ게요",
    meaning: "Tôi sẽ làm (hứa hẹn, ý định)",
    level: "B1",
    category: "ending",
    explanation: "-(으)ㄹ게요 diễn tả ý định hoặc lời hứa của người nói, thường dùng khi phản hồi yêu cầu của người khác.",
    examples: [
      { korean: "제가 할게요.", vietnamese: "Tôi sẽ làm." },
      { korean: "내일 전화할게요.", vietnamese: "Ngày mai tôi sẽ gọi điện." },
      { korean: "조심할게요.", vietnamese: "Tôi sẽ cẩn thận." },
    ],
    exercises: [
      { id: "g32e1", type: "fill", question: "제가 도와___ 요.", questionVi: "Tôi sẽ giúp.", blank: "줄게", answer: "줄게", explanation: "-(으)ㄹ게요 = tôi sẽ làm (hứa hẹn)." },
    ],
  },
  // ─── B2 ──────────────────────────────────────────────────────────────────
  {
    id: "g33",
    pattern: "V-는 것 같다",
    meaning: "Có vẻ như (hiện tại)",
    level: "B2",
    category: "expression",
    explanation: "-는 것 같다 diễn tả suy đoán hoặc cảm nhận của người nói về một sự việc đang xảy ra.",
    examples: [
      { korean: "비가 오는 것 같아요.", vietnamese: "Có vẻ như trời mưa." },
      { korean: "그 사람이 화가 난 것 같아요.", vietnamese: "Có vẻ như người đó đang tức giận." },
      { korean: "그 영화가 재미있는 것 같아요.", vietnamese: "Có vẻ như bộ phim đó thú vị." },
    ],
    exercises: [
      { id: "g33e1", type: "choose", question: "저 사람이 한국 사람인 것 ___.", questionVi: "Có vẻ như người kia là người Hàn.", options: ["같아요", "싶어요", "봐요", "있어요"], optionsVi: ["có vẻ như", "muốn", "xem", "có thể"], answer: "같아요", explanation: "-는 것 같다 = có vẻ như, dường như." },
    ],
  },
  {
    id: "g34",
    pattern: "V-(으)ㄴ 것 같다",
    meaning: "Có vẻ đã làm (quá khứ suy đoán)",
    level: "B2",
    category: "expression",
    explanation: "-(으)ㄴ 것 같다 diễn tả suy đoán về sự việc đã xảy ra trong quá khứ.",
    examples: [
      { korean: "그 사람이 이미 간 것 같아요.", vietnamese: "Có vẻ người đó đã đi rồi." },
      { korean: "비가 온 것 같아요.", vietnamese: "Có vẻ trời đã mưa." },
      { korean: "그 영화를 본 것 같아요.", vietnamese: "Có vẻ tôi đã xem bộ phim đó." },
    ],
    exercises: [
      { id: "g34e1", type: "fill", question: "그 사람이 이미 먹___ 것 같아요.", questionVi: "Có vẻ người đó đã ăn rồi.", blank: "은", answer: "은", explanation: "-(으)ㄴ 것 같다 = có vẻ đã làm (quá khứ)." },
    ],
  },
  {
    id: "g35",
    pattern: "V-도록",
    meaning: "Để, cho đến khi",
    level: "B2",
    category: "connective",
    explanation: "-도록 diễn tả mục đích hoặc giới hạn, tương đương 'để, cho đến khi' trong tiếng Việt.",
    examples: [
      { korean: "잘 들을 수 있도록 크게 말해 주세요.", vietnamese: "Hãy nói to để tôi có thể nghe rõ." },
      { korean: "늦지 않도록 일찍 출발했어요.", vietnamese: "Tôi đã xuất phát sớm để không bị muộn." },
      { korean: "밤새도록 공부했어요.", vietnamese: "Tôi đã học suốt đêm." },
    ],
    exercises: [
      { id: "g35e1", type: "choose", question: "이해할 수 있___ 천천히 설명해 주세요.", questionVi: "Hãy giải thích chậm để tôi có thể hiểu.", options: ["도록", "면", "어서", "지만"], optionsVi: ["để/cho đến khi", "nếu", "vì", "nhưng"], answer: "도록", explanation: "-도록 = để, cho đến khi." },
    ],
  },
  {
    id: "g36",
    pattern: "V-(으)ㄹ 뿐만 아니라",
    meaning: "Không chỉ... mà còn...",
    level: "B2",
    category: "connective",
    explanation: "-(으)ㄹ 뿐만 아니라 diễn tả sự bổ sung, tương đương 'không chỉ...mà còn...'.",
    examples: [
      { korean: "한국어를 잘할 뿐만 아니라 일본어도 해요.", vietnamese: "Không chỉ giỏi tiếng Hàn mà còn biết tiếng Nhật." },
      { korean: "맛있을 뿐만 아니라 건강에도 좋아요.", vietnamese: "Không chỉ ngon mà còn tốt cho sức khỏe." },
      { korean: "공부를 잘할 뿐만 아니라 운동도 잘해요.", vietnamese: "Không chỉ học giỏi mà còn giỏi thể thao." },
    ],
    exercises: [
      { id: "g36e1", type: "fill", question: "그 사람은 친절할 ___ 아니라 성실해요.", questionVi: "Người đó không chỉ tốt bụng mà còn chăm chỉ.", blank: "뿐만", answer: "뿐만", explanation: "-(으)ㄹ 뿐만 아니라 = không chỉ...mà còn..." },
    ],
  },
  {
    id: "g37",
    pattern: "V-는 반면에",
    meaning: "Trong khi đó, ngược lại",
    level: "B2",
    category: "connective",
    explanation: "-는 반면에 diễn tả sự tương phản mạnh giữa hai vế, tương đương 'trong khi đó, ngược lại'.",
    examples: [
      { korean: "형은 키가 큰 반면에 동생은 작아요.", vietnamese: "Anh cao trong khi em thì thấp." },
      { korean: "서울은 물가가 비싼 반면에 지방은 싸요.", vietnamese: "Seoul đắt đỏ trong khi tỉnh lẻ thì rẻ." },
      { korean: "그 사람은 말이 많은 반면에 행동이 없어요.", vietnamese: "Người đó nói nhiều nhưng không hành động." },
    ],
    exercises: [
      { id: "g37e1", type: "choose", question: "한국어는 어려운 ___ 재미있어요.", questionVi: "Tiếng Hàn khó nhưng thú vị.", options: ["반면에", "뿐만 아니라", "도록", "기 때문에"], optionsVi: ["trong khi đó", "không chỉ...mà còn", "để", "vì"], answer: "반면에", explanation: "-는 반면에 = trong khi đó, ngược lại." },
    ],
  },
  {
    id: "g38",
    pattern: "V-기 때문에",
    meaning: "Vì (lý do chính thức)",
    level: "B2",
    category: "connective",
    explanation: "-기 때문에 diễn tả nguyên nhân một cách chính thức, dùng nhiều trong văn viết.",
    examples: [
      { korean: "바쁘기 때문에 못 갔어요.", vietnamese: "Vì bận nên tôi không đi được." },
      { korean: "한국어를 좋아하기 때문에 공부해요.", vietnamese: "Vì thích tiếng Hàn nên tôi học." },
      { korean: "건강이 중요하기 때문에 운동해요.", vietnamese: "Vì sức khỏe quan trọng nên tôi tập thể dục." },
    ],
    exercises: [
      { id: "g38e1", type: "fill", question: "시간이 없___ 때문에 못 왔어요.", questionVi: "Vì không có thời gian nên không đến được.", blank: "기", answer: "기", explanation: "-기 때문에 = vì (lý do chính thức)." },
    ],
  },
  {
    id: "g39",
    pattern: "V-(으)ㄹ수록",
    meaning: "Càng... càng...",
    level: "B2",
    category: "connective",
    explanation: "-(으)ㄹ수록 diễn tả mức độ tăng dần, tương đương 'càng...càng...' trong tiếng Việt.",
    examples: [
      { korean: "공부할수록 더 재미있어요.", vietnamese: "Càng học càng thú vị." },
      { korean: "알수록 어려워요.", vietnamese: "Càng biết càng khó." },
      { korean: "먹을수록 맛있어요.", vietnamese: "Càng ăn càng ngon." },
    ],
    exercises: [
      { id: "g39e1", type: "choose", question: "연습할___ 실력이 늘어요.", questionVi: "Càng luyện tập càng tiến bộ.", options: ["수록", "때", "면", "도록"], optionsVi: ["càng...càng", "khi", "nếu", "để"], answer: "수록", explanation: "-(으)ㄹ수록 = càng...càng..." },
    ],
  },
  {
    id: "g40",
    pattern: "V-았/었으면 좋겠다",
    meaning: "Ước gì, giá mà",
    level: "B2",
    category: "expression",
    explanation: "-았/었으면 좋겠다 diễn tả mong muốn hoặc ước muốn về điều chưa xảy ra.",
    examples: [
      { korean: "한국에 갔으면 좋겠어요.", vietnamese: "Ước gì tôi được đến Hàn Quốc." },
      { korean: "비가 안 왔으면 좋겠어요.", vietnamese: "Ước gì trời không mưa." },
      { korean: "시험에 합격했으면 좋겠어요.", vietnamese: "Ước gì tôi đậu kỳ thi." },
    ],
    exercises: [
      { id: "g40e1", type: "fill", question: "빨리 나았___ 좋겠어요.", questionVi: "Ước gì mau khỏi bệnh.", blank: "으면", answer: "으면", explanation: "-았/었으면 좋겠다 = ước gì, giá mà." },
    ],
  },
  {
    id: "g41",
    pattern: "V-게 되다",
    meaning: "Trở nên, dần dần (thay đổi trạng thái)",
    level: "B2",
    category: "expression",
    explanation: "-게 되다 diễn tả sự thay đổi trạng thái hoặc tình huống dần dần, không do ý muốn chủ quan.",
    examples: [
      { korean: "한국어를 잘하게 됐어요.", vietnamese: "Tôi đã trở nên giỏi tiếng Hàn." },
      { korean: "한국에서 살게 됐어요.", vietnamese: "Tôi đã trở thành người sống ở Hàn Quốc." },
      { korean: "그 사람을 좋아하게 됐어요.", vietnamese: "Tôi đã dần thích người đó." },
    ],
    exercises: [
      { id: "g41e1", type: "choose", question: "열심히 공부해서 한국어를 잘하___ 됐어요.", questionVi: "Nhờ học chăm chỉ tôi đã trở nên giỏi tiếng Hàn.", options: ["게", "고", "어서", "면"], optionsVi: ["게 (trở nên)", "고 (và)", "어서 (vì)", "면 (nếu)"], answer: "게", explanation: "-게 되다 = trở nên, dần dần." },
    ],
  },
  {
    id: "g42",
    pattern: "V-아/어 버리다",
    meaning: "Đã làm xong rồi (hoàn toàn, dứt khoát)",
    level: "B2",
    category: "expression",
    explanation: "-아/어 버리다 diễn tả hành động đã hoàn thành hoàn toàn, thường mang sắc thái tiếc nuối hoặc nhẹ nhõm.",
    examples: [
      { korean: "숙제를 다 해 버렸어요.", vietnamese: "Tôi đã làm xong hết bài tập rồi." },
      { korean: "돈을 다 써 버렸어요.", vietnamese: "Tôi đã tiêu hết tiền rồi." },
      { korean: "그 사람을 잊어 버렸어요.", vietnamese: "Tôi đã quên người đó rồi." },
    ],
    exercises: [
      { id: "g42e1", type: "fill", question: "음식을 다 먹어 ___ 어요.", questionVi: "Tôi đã ăn hết đồ ăn rồi.", blank: "버렸", answer: "버렸", explanation: "-아/어 버리다 = đã làm xong hoàn toàn." },
    ],
  },
  {
    id: "g43",
    pattern: "V-아/어 놓다/두다",
    meaning: "Làm sẵn, để dành",
    level: "B2",
    category: "expression",
    explanation: "-아/어 놓다/두다 diễn tả hành động đã làm trước để dùng sau, mang nghĩa 'làm sẵn, để dành'.",
    examples: [
      { korean: "미리 예약해 놓았어요.", vietnamese: "Tôi đã đặt trước rồi." },
      { korean: "음식을 만들어 두었어요.", vietnamese: "Tôi đã nấu sẵn đồ ăn rồi." },
      { korean: "메모해 놓으세요.", vietnamese: "Hãy ghi chú lại." },
    ],
    exercises: [
      { id: "g43e1", type: "choose", question: "내일을 위해 준비해 ___.", questionVi: "Hãy chuẩn bị sẵn cho ngày mai.", options: ["놓으세요", "버리세요", "보세요", "주세요"], optionsVi: ["làm sẵn", "làm xong rồi", "thử làm", "làm cho"], answer: "놓으세요", explanation: "-아/어 놓다 = làm sẵn, để dành." },
    ],
  },
  {
    id: "g44",
    pattern: "V-(으)ㄹ 텐데",
    meaning: "Chắc là sẽ... (suy đoán + lo ngại)",
    level: "B2",
    category: "expression",
    explanation: "-(으)ㄹ 텐데 diễn tả suy đoán về tương lai kèm theo lo ngại hoặc quan tâm.",
    examples: [
      { korean: "피곤할 텐데 쉬세요.", vietnamese: "Chắc mệt rồi, hãy nghỉ ngơi đi." },
      { korean: "배고플 텐데 뭐 먹을까요?", vietnamese: "Chắc đói rồi, ăn gì nhỉ?" },
      { korean: "어려울 텐데 잘 할 수 있을까요?", vietnamese: "Chắc khó đấy, liệu có làm được không?" },
    ],
    exercises: [
      { id: "g44e1", type: "fill", question: "힘들___ 텐데 괜찮아요?", questionVi: "Chắc vất vả lắm, bạn ổn không?", blank: "을", answer: "을", explanation: "-(으)ㄹ 텐데 = chắc là sẽ... (suy đoán + lo ngại)." },
    ],
  },
  {
    id: "g45",
    pattern: "V-다가",
    meaning: "Đang làm thì (chuyển sang hành động khác)",
    level: "B2",
    category: "connective",
    explanation: "-다가 diễn tả việc đang làm gì đó thì chuyển sang làm việc khác, hoặc hành động bị gián đoạn.",
    examples: [
      { korean: "공부하다가 잠이 들었어요.", vietnamese: "Đang học thì ngủ quên." },
      { korean: "집에 가다가 친구를 만났어요.", vietnamese: "Đang đi về nhà thì gặp bạn." },
      { korean: "밥을 먹다가 전화가 왔어요.", vietnamese: "Đang ăn cơm thì có điện thoại." },
    ],
    exercises: [
      { id: "g45e1", type: "choose", question: "TV를 보___ 잠이 들었어요.", questionVi: "Đang xem TV thì ngủ quên.", options: ["다가", "고", "어서", "면"], optionsVi: ["đang...thì", "và", "vì", "nếu"], answer: "다가", explanation: "-다가 = đang làm thì (chuyển sang hành động khác)." },
    ],
  },
  {
    id: "g46",
    pattern: "V-(으)ㄴ/는 편이다",
    meaning: "Thuộc loại, khá là",
    level: "B2",
    category: "expression",
    explanation: "-(으)ㄴ/는 편이다 diễn tả xu hướng hoặc đặc điểm chung, tương đương 'thuộc loại, khá là'.",
    examples: [
      { korean: "저는 음식을 많이 먹는 편이에요.", vietnamese: "Tôi thuộc loại ăn nhiều." },
      { korean: "그 사람은 키가 큰 편이에요.", vietnamese: "Người đó khá cao." },
      { korean: "한국어가 어려운 편이에요.", vietnamese: "Tiếng Hàn thuộc loại khó." },
    ],
    exercises: [
      { id: "g46e1", type: "fill", question: "저는 일찍 자는 ___ 이에요.", questionVi: "Tôi thuộc loại ngủ sớm.", blank: "편", answer: "편", explanation: "-(으)ㄴ/는 편이다 = thuộc loại, khá là." },
    ],
  },
  {
    id: "g47",
    pattern: "V-아/어지다",
    meaning: "Trở nên (thay đổi tính chất)",
    level: "B2",
    category: "expression",
    explanation: "-아/어지다 diễn tả sự thay đổi dần dần về tính chất hoặc trạng thái.",
    examples: [
      { korean: "날씨가 따뜻해졌어요.", vietnamese: "Thời tiết đã trở nên ấm áp." },
      { korean: "한국어 실력이 좋아졌어요.", vietnamese: "Trình độ tiếng Hàn đã tiến bộ." },
      { korean: "요즘 바빠졌어요.", vietnamese: "Dạo này tôi trở nên bận rộn hơn." },
    ],
    exercises: [
      { id: "g47e1", type: "choose", question: "공부를 많이 해서 실력이 좋아___.", questionVi: "Nhờ học nhiều nên trình độ đã tiến bộ.", options: ["졌어요", "됐어요", "버렸어요", "놓았어요"], optionsVi: ["trở nên", "trở thành", "đã xong rồi", "làm sẵn"], answer: "졌어요", explanation: "-아/어지다 = trở nên (thay đổi tính chất)." },
    ],
  },
  {
    id: "g48",
    pattern: "V-(으)ㄹ 줄 알다/모르다",
    meaning: "Biết/không biết cách làm gì",
    level: "B2",
    category: "expression",
    explanation: "-(으)ㄹ 줄 알다 = biết cách làm gì. -(으)ㄹ 줄 모르다 = không biết cách làm gì.",
    examples: [
      { korean: "저는 수영할 줄 알아요.", vietnamese: "Tôi biết bơi." },
      { korean: "운전할 줄 몰라요.", vietnamese: "Tôi không biết lái xe." },
      { korean: "한국 요리를 만들 줄 알아요?", vietnamese: "Bạn có biết nấu món Hàn không?" },
    ],
    exercises: [
      { id: "g48e1", type: "choose", question: "저는 피아노를 칠 줄 ___.", questionVi: "Tôi biết chơi đàn piano.", options: ["알아요", "몰라요", "있어요", "없어요"], optionsVi: ["biết cách", "không biết cách", "có thể", "không thể"], answer: "알아요", explanation: "-(으)ㄹ 줄 알다 = biết cách làm gì." },
    ],
  },
  {
    id: "g49",
    pattern: "V-는 한",
    meaning: "Chừng nào còn, miễn là",
    level: "B2",
    category: "connective",
    explanation: "-는 한 diễn tả điều kiện giới hạn, tương đương 'chừng nào còn, miễn là'.",
    examples: [
      { korean: "제가 있는 한 걱정하지 마세요.", vietnamese: "Chừng nào còn có tôi thì đừng lo." },
      { korean: "노력하는 한 성공할 수 있어요.", vietnamese: "Miễn là nỗ lực thì có thể thành công." },
      { korean: "살아있는 한 포기하지 않을 거예요.", vietnamese: "Chừng nào còn sống tôi sẽ không bỏ cuộc." },
    ],
    exercises: [
      { id: "g49e1", type: "fill", question: "열심히 하는 ___ 결과가 좋을 거예요.", questionVi: "Miễn là làm chăm chỉ thì kết quả sẽ tốt.", blank: "한", answer: "한", explanation: "-는 한 = chừng nào còn, miễn là." },
    ],
  },
  {
    id: "g50",
    pattern: "V-고 나서",
    meaning: "Sau khi làm xong rồi mới",
    level: "B1",
    category: "connective",
    explanation: "-고 나서 diễn tả hành động xảy ra sau khi hành động trước đã hoàn thành hoàn toàn.",
    examples: [
      { korean: "밥을 먹고 나서 약을 드세요.", vietnamese: "Sau khi ăn cơm xong hãy uống thuốc." },
      { korean: "숙제를 하고 나서 놀아요.", vietnamese: "Sau khi làm bài tập xong mới chơi." },
      { korean: "졸업하고 나서 취직했어요.", vietnamese: "Sau khi tốt nghiệp xong mới đi làm." },
    ],
    exercises: [
      { id: "g50e1", type: "choose", question: "청소하고 ___ 쉬었어요.", questionVi: "Sau khi dọn dẹp xong mới nghỉ.", options: ["나서", "서", "면", "도록"], optionsVi: ["sau khi xong", "vì", "nếu", "để"], answer: "나서", explanation: "-고 나서 = sau khi làm xong rồi mới." },
    ],
  },
  {
    id: "g51",
    pattern: "V-아/어도 되다",
    meaning: "Được phép làm gì",
    level: "B1",
    category: "expression",
    explanation: "-아/어도 되다 diễn tả sự cho phép, tương đương 'được phép làm gì'.",
    examples: [
      { korean: "여기서 사진을 찍어도 돼요?", vietnamese: "Tôi có được chụp ảnh ở đây không?" },
      { korean: "이 의자에 앉아도 돼요.", vietnamese: "Bạn được phép ngồi vào ghế này." },
      { korean: "먼저 가도 돼요.", vietnamese: "Bạn có thể đi trước." },
    ],
    exercises: [
      { id: "g51e1", type: "fill", question: "이 음식을 먹어___ 돼요?", questionVi: "Tôi có được ăn món này không?", blank: "도", answer: "도", explanation: "-아/어도 되다 = được phép làm gì." },
    ],
  },
  {
    id: "g52",
    pattern: "V-(으)면 안 되다",
    meaning: "Không được làm gì (cấm đoán)",
    level: "B1",
    category: "expression",
    explanation: "-(으)면 안 되다 diễn tả sự cấm đoán, tương đương 'không được làm gì'.",
    examples: [
      { korean: "여기서 담배를 피우면 안 돼요.", vietnamese: "Không được hút thuốc ở đây." },
      { korean: "수업 중에 핸드폰을 쓰면 안 돼요.", vietnamese: "Không được dùng điện thoại trong giờ học." },
      { korean: "늦으면 안 돼요.", vietnamese: "Không được đến muộn." },
    ],
    exercises: [
      { id: "g52e1", type: "choose", question: "도서관에서 떠들___ 안 돼요.", questionVi: "Không được ồn ào trong thư viện.", options: ["면", "고", "어서", "도록"], optionsVi: ["nếu (cấm đoán)", "và", "vì", "để"], answer: "면", explanation: "-(으)면 안 되다 = không được làm gì." },
    ],
  },
];
