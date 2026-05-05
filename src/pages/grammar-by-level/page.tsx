import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface GrammarPattern {
  id: string;
  level: string;
  levelColor: string;
  pattern: string;
  meaning: string;
  explanation: string;
  formation: string;
  notes?: string[];
  examples: { korean: string; vietnamese: string }[];
  exercises: { question: string; options: string[]; answer: number; explanation: string }[];
  commonMistakes: string[];
  comparison?: { title: string; headers: [string, string]; rows: [string, string][] };
  tags: string[];
}

const GRAMMAR_PATTERNS: GrammarPattern[] = [
  {
    id: "a1-1",
    level: "A1",
    levelColor: "#22c55e",
    pattern: "N은/는",
    meaning: "Trợ từ chủ đề",
    explanation: "은/는 là trợ từ chủ đề, dùng để đánh dấu chủ đề của câu. Dùng 은 sau phụ âm, 는 sau nguyên âm.",
    formation: "N(phụ âm) + 은 / N(nguyên âm) + 는",
    examples: [
      { korean: "저는 학생이에요.", vietnamese: "Tôi là học sinh." },
      { korean: "한국은 아름다워요.", vietnamese: "Hàn Quốc thật đẹp." },
      { korean: "오늘은 날씨가 좋아요.", vietnamese: "Hôm nay thời tiết đẹp." },
    ],
    exercises: [
      { question: "저 ___ 베트남 사람이에요.", options: ["은", "는", "이", "가"], answer: 1, explanation: "저 kết thúc bằng nguyên âm eo, nên dùng 는" },
      { question: "한국어 ___ 재미있어요.", options: ["은", "는", "이", "가"], answer: 0, explanation: "한국어 kết thúc bằng phụ âm eo, nên dùng 은" },
    ],
    commonMistakes: ["Nhầm lẫn 은/는 với 이/가", "Dùng 은/는 khi cần nhấn mạnh chủ ngữ"],
    tags: ["Trợ từ", "Cơ bản", "Chủ đề"],
  },
  {
    id: "a1-2",
    level: "A1",
    levelColor: "#22c55e",
    pattern: "N이/가",
    meaning: "Trợ từ chủ ngữ",
    explanation: "이/가 là trợ từ chủ ngữ, dùng để đánh dấu chủ ngữ thực sự của câu. Dùng 이 sau phụ âm, 가 sau nguyên âm.",
    formation: "N(phụ âm) + 이 / N(nguyên âm) + 가",
    examples: [
      { korean: "꽃이 예뻐요.", vietnamese: "Hoa đẹp." },
      { korean: "누가 왔어요?", vietnamese: "Ai đến vậy?" },
      { korean: "비가 와요.", vietnamese: "Trời mưa." },
    ],
    exercises: [
      { question: "꽃 ___ 예뻐요.", options: ["은", "는", "이", "가"], answer: 2, explanation: "꽃 kết thúc bằng phụ âm, nên dùng 이" },
      { question: "누구 ___ 왔어요?", options: ["은", "는", "이", "가"], answer: 3, explanation: "누구 kết thúc bằng nguyên âm, nên dùng 가" },
    ],
    commonMistakes: ["Nhầm 이/가 với 은/는", "이/가 dùng khi giới thiệu thông tin mới"],
    tags: ["Trợ từ", "Cơ bản", "Chủ ngữ"],
  },
  {
    id: "a2-1",
    level: "A2",
    levelColor: "#84cc16",
    pattern: "V-고 싶다",
    meaning: "Muốn làm gì",
    explanation: "고 싶다 diễn tả mong muốn của người nói. Chỉ dùng cho ngôi thứ nhất (tôi). Với ngôi thứ ba dùng 고 싶어하다.",
    formation: "V + 고 싶다",
    examples: [
      { korean: "한국에 가고 싶어요.", vietnamese: "Tôi muốn đi Hàn Quốc." },
      { korean: "뭘 먹고 싶어요?", vietnamese: "Bạn muốn ăn gì?" },
      { korean: "쉬고 싶어요.", vietnamese: "Tôi muốn nghỉ ngơi." },
    ],
    exercises: [
      { question: "저는 한국어를 배우 ___ 싶어요.", options: ["고", "아", "어", "서"], answer: 0, explanation: "고 싶다 là cấu trúc cố định, luôn dùng 고" },
      { question: "그는 의사가 되 ___ 싶어해요.", options: ["고", "아", "어", "서"], answer: 0, explanation: "Ngôi thứ ba dùng 고 싶어하다" },
    ],
    commonMistakes: ["Dùng 고 싶다 cho ngôi thứ ba (phải dùng 고 싶어하다)", "Nhầm với 고 싶지 않다 (không muốn)"],
    tags: ["Nguyện vọng", "Động từ", "A2"],
  },
  {
    id: "a2-2",
    level: "A2",
    levelColor: "#84cc16",
    pattern: "A/V – 아/어서",
    meaning: "Vì... nên..., do... nên...",
    explanation: "Mệnh đề trước là nguyên nhân gây ra kết quả ở mệnh đề sau. Vế sau không dùng câu mệnh lệnh, cầu khiến và vế trước chỉ chia thì hiện tại. Với danh từ dùng (이)라서 hoặc 여서/이어서.",
    formation: "A/V(ㅏ/ㅗ) + 아서 / A/V(khác) + 어서 / 하다 → 해서 / N + (이)라서",
    notes: [
      "Mệnh đề trước là nguyên nhân gây kết quả mệnh đề sau.",
      "Vế sau không dùng mệnh đề lệnh, cầu khiến và vế trước chỉ chia thì hiện tại.",
      "Danh từ + (이)라서 hoặc 여서/이어서",
    ],
    examples: [
      { korean: "배가 고파서 많이 먹었어요.", vietnamese: "Vì đói bụng nên tôi đã ăn nhiều." },
      { korean: "좀 늦어서 택시를 탔어요.", vietnamese: "Vì muộn nên tôi đã đi taxi." },
      { korean: "기뻐서 눈물이 났어요.", vietnamese: "Vì vui nên tôi đã rơi nước mắt." },
      { korean: "주말이라서 사람이 많아요.", vietnamese: "Vì là cuối tuần nên người đông." },
      { korean: "퇴근 시간에는 차가 많아서 버스를 타요.", vietnamese: "Vào giờ tan làm, vì nhiều xe nên tôi đã đi xe bus." },
      { korean: "열심히 공부해서 100점을 받았어요.", vietnamese: "Vì chăm học nên tôi đã được 100 điểm." },
      { korean: "저는 심심해서 공원에 가고 싶어요.", vietnamese: "Vì chán nên tôi muốn đi công viên." },
      { korean: "눈이 와서 길이 미끄러워요.", vietnamese: "Vì tuyết rơi nên đường trơn." },
      { korean: "배가 아파서 학교에 못 갔어요.", vietnamese: "Vì đau bụng nên tôi đã không thể đến trường." },
      { korean: "저는 화장을 하지 않아서 못생겨 보여요.", vietnamese: "Vì tôi không trang điểm nên trông xấu xí." },
    ],
    exercises: [
      { question: "배가 고프 ___ 많이 먹었어요.", options: ["아서", "어서", "라서", "고서"], answer: 0, explanation: "고프다 → 고파서 (ㅡ bị lược bỏ, nguyên âm ㅗ nên thêm 아서)" },
      { question: "좀 늦 ___ 택시를 탔어요.", options: ["아서", "어서", "라서", "해서"], answer: 1, explanation: "늦다 → 늦어서 (nguyên âm ㅡ, không phải ㅏ/ㅗ nên dùng 어서)" },
      { question: "주말 ___ 사람이 많아요.", options: ["아서", "어서", "이라서", "해서"], answer: 2, explanation: "주말 là danh từ kết thúc bằng phụ âm ㄹ → dùng 이라서" },
      { question: "열심히 공부 ___ 100점을 받았어요.", options: ["아서", "어서", "해서", "라서"], answer: 2, explanation: "공부하다 → 공부해서 (하다 luôn biến thành 해서)" },
    ],
    commonMistakes: [
      "Dùng 았/었어서 ở vế trước (sai: 늦었어서 → đúng: 늦어서)",
      "Vế sau dùng mệnh lệnh/đề nghị (sai: 배고파서 먹으세요 → nên dùng -니까)",
      "Nhầm với -(으)니까 (-(으)니까 có thể dùng với mệnh lệnh/đề nghị)",
      "Nhầm với -기 때문에 (trang trọng hơn, thường dùng trong văn viết)",
    ],
    tags: ["Nguyên nhân", "Liên kết câu", "TOPIK I"],
  },
  {
    id: "a2-3",
    level: "A2",
    levelColor: "#84cc16",
    pattern: "A/V – (으)니까",
    meaning: "Vì... nên..., do... nên...",
    explanation: "Mệnh đề trước là nguyên nhân gây kết quả mệnh đề sau. Vế sau thường dùng mệnh lệnh, cầu khiến. Vế trước có thể chia quá khứ hoặc tương lai.",
    formation: "A/V(nguyên âm/ㄹ) + 니까 / A/V(phụ âm) + 으니까",
    notes: [
      "Mệnh đề trước là nguyên nhân gây kết quả mệnh đề sau.",
      "Vế sau thường dùng mệnh lệnh, cầu khiến, đề nghị.",
      "Vế trước có thể chia quá khứ (-았/었으니까) hoặc tương lai (-겠으니까).",
    ],
    examples: [
      { korean: "추우니까 옷을 많이 입고 가세요.", vietnamese: "Vì trời lạnh nên hãy mặc nhiều áo vào nhé." },
      { korean: "날씨가 좋으니까 같이 산책할래요?", vietnamese: "Vì trời đẹp nên hãy cùng nhau đi dạo nhé?" },
      { korean: "이번주는 바쁘니까 다음 주에 놀러 갑시다.", vietnamese: "Vì tuần này tôi bận nên tuần sau đi chơi nhé?" },
      { korean: "전에 한국에 살았으니까 한국말을 조금 할 수 있어요.", vietnamese: "Vì trước đây tôi đã sống ở Hàn Quốc nên tôi có thể nói được một chút tiếng Hàn." },
      { korean: "더우니까 시원한 것을 먹을래요?", vietnamese: "Vì trời nóng nên đi ăn cái gì mát mát nhé?" },
      { korean: "밥이 없으니까 라면 먹자.", vietnamese: "Vì không có cơm nên hãy ăn mì thôi nào." },
      { korean: "길이 막히니까 지하철을 탑시다.", vietnamese: "Vì tắc đường nên hãy đi tàu điện ngầm." },
      { korean: "내일 발표가 있으니까 같이 준비합시다.", vietnamese: "Ngày mai có bài phát biểu nên hãy cùng nhau chuẩn bị thôi nào." },
      { korean: "비가 올 것 같으니 우산을 가지고 가세요.", vietnamese: "Vì trời có thể sẽ mưa nên hãy đem theo ô nhé." },
      { korean: "길이 미끄러우니까 넘어지지 않게 조심하세요.", vietnamese: "Vì đường trơn nên hãy cẩn thận để không ngã." },
    ],
    exercises: [
      { question: "추우 ___ 옷을 많이 입고 가세요.", options: ["니까", "어서", "아서", "고서"], answer: 0, explanation: "춥다 → 추우니까 (bất quy tắc ㅂ, nguyên âm → 니까). Vế sau là mệnh lệnh nên dùng -(으)니까." },
      { question: "전에 한국에 살 ___ 한국말을 조금 할 수 있어요.", options: ["았으니까", "아서", "어서", "으니까"], answer: 0, explanation: "살다 + 았으니까 → 살았으니까. Vế trước chia quá khứ nên dùng 았으니까." },
      { question: "길이 막히 ___ 지하철을 탑시다.", options: ["니까", "어서", "아서", "라서"], answer: 0, explanation: "막히다 → 막히니까 (nguyên âm → 니까). Vế sau là đề nghị 탑시다 nên dùng -(으)니까." },
      { question: "날씨가 좋 ___ 같이 산책할래요?", options: ["으니까", "아서", "어서", "니까"], answer: 0, explanation: "좋다 → 좋으니까 (phụ âm ㅎ → 으니까). Vế sau là đề nghị nên dùng -(으)니까." },
    ],
    commonMistakes: [
      "Dùng -아/어서 khi vế sau là mệnh lệnh/đề nghị (sai: 추워서 옷을 입으세요 → đúng: 추우니까 옷을 입으세요)",
      "Dùng -(으)니까 với 반갑다, 고맙다, 감사하다, 미안하다 (phải dùng -아/어서)",
      "Nhầm với -아/어서 — hai cấu trúc đều diễn tả nguyên nhân nhưng khác cách dùng.",
    ],
    comparison: {
      title: "Phân biệt – 아/어서 và – (으)니까",
      headers: ["– 아/어서", "– (으)니까"],
      rows: [
        ["(X) + câu mệnh lệnh hoặc thỉnh dụ", "(O) + câu mệnh lệnh hoặc thỉnh dụ"],
        ["(X) + –았/었 hoặc –겠– trước – 아/어서", "(O) + –았/었 hoặc –겠– trước – (으)니까"],
        ["Chủ yếu diễn tả lý do thông thường", "Nguyên nhân khách quan / lý do cụ thể. Chủ yếu diễn tả lý do người nghe cũng biết"],
        ["(O) + 반갑다, 고맙다, 감사하다, 미안하다", "(X) + 반갑다, 고맙다, 감사하다, 미안하다"],
      ],
    },
    tags: ["Nguyên nhân", "Liên kết câu", "TOPIK I", "Mệnh lệnh"],
  },
  {
    id: "a2-4",
    level: "A2",
    levelColor: "#84cc16",
    pattern: "N 때문에, A/V – 기 때문에",
    meaning: "Tại... nên..., do... nên...",
    explanation: "Diễn tả lý do, tại một lí do nào đó dẫn đến kết quả vế sau. Vế sau là kết quả có phần chưa tốt, tuy nhiên vẫn có thể có kết quả tốt. Có thể dùng nhiều hơn trong văn viết so với – 아/어서 và – (으)니까. Có thể dùng đuôi câu dạng 기 때문이다. Vế sau không dùng mệnh lệnh và các dạng cầu khiến.",
    formation: "N + 때문에 / A/V + 기 때문에 / N + (이)기 때문에",
    notes: [
      "Diễn tả lý do dẫn đến kết quả vế sau (thường là kết quả chưa tốt).",
      "Có thể dùng đuôi câu dạng 기 때문이다.",
      "Vế sau không dùng mệnh lệnh và các dạng cầu khiến.",
      "N 때문에 = vì N (danh từ). N이기 때문에 = vì LÀ N.",
    ],
    examples: [
      { korean: "비 때문에 차가 막혀요.", vietnamese: "Tại trời mưa nên kẹt xe." },
      { korean: "바쁘기 때문에 여행을 못 가요.", vietnamese: "Tại vì bận nên tôi không thể đi du lịch." },
      { korean: "왜냐하면 너무 피곤하기 때문입니다.", vietnamese: "Nếu hỏi tại sao thì tại vì tôi quá mệt." },
      { korean: "저는 배고프기 때문에 밥을 먹고 싶어요.", vietnamese: "Vì đói nên tôi muốn ăn cơm." },
      { korean: "눈이 내리기 때문에 길이 미끄러워요.", vietnamese: "Vì tuyết rơi nên đường trơn." },
      { korean: "아이 때문에 밥을 못 먹어요.", vietnamese: "Vì đứa bé mà tôi không thể ăn cơm." },
      { korean: "학생이기 때문에 할인을 받았어요.", vietnamese: "Vì là học sinh nên tôi được giảm giá." },
      { korean: "외국인이기 때문에 한국말을 잘 못해요.", vietnamese: "Vì là người nước ngoài nên tôi không thể nói được tiếng Hàn." },
      { korean: "감기에 걸렸기 때문에 병원에 갔어요.", vietnamese: "Vì bị cảm nên tôi đã đến bệnh viện." },
      { korean: "비싸기 때문에 살 수 없어요.", vietnamese: "Vì đắt nên tôi không thể mua được." },
    ],
    exercises: [
      { question: "비 ___ 차가 막혀요.", options: ["때문에", "기 때문에", "어서", "니까"], answer: 0, explanation: "비 là danh từ → dùng N 때문에." },
      { question: "바쁘 ___ 여행을 못 가요.", options: ["기 때문에", "때문에", "어서", "니까"], answer: 0, explanation: "바쁘다 là tính từ → dùng A + 기 때문에." },
      { question: "학생이 ___ 할인을 받았어요.", options: ["기 때문에", "때문에", "어서", "니까"], answer: 0, explanation: "학생 là danh từ + 이기 때문에 = vì LÀ học sinh." },
      { question: "감기에 걸렸 ___ 병원에 갔어요.", options: ["기 때문에", "때문에", "어서", "으니까"], answer: 0, explanation: "걸리다 → 걸렸기 때문에. Động từ chia quá khứ + 기 때문에." },
    ],
    commonMistakes: [
      "Nhầm N 때문에 và N이기 때문에 (학생 때문에 = vì học sinh / 학생이기 때문에 = vì LÀ học sinh).",
      "Vế sau dùng mệnh lệnh/đề nghị (sai: 바쁘기 때문에 도와주세요 → nên dùng -(으)니까).",
      "Nhầm với -아/어서 (기 때문에 trang trọng hơn, thường dùng trong văn viết).",
    ],
    comparison: {
      title: "Phân biệt N 때문에 và N이기 때문에",
      headers: ["N 때문에", "N이기 때문에"],
      rows: [
        ["vì N (danh từ là nguyên nhân)", "vì LÀ N (danh từ là thân phận/tính chất)"],
        ["학생 때문에 선생님이 화가 나셨어요.", "학생이기 때문에 열심히 공부해야 해요."],
      ],
    },
    tags: ["Nguyên nhân", "Liên kết câu", "TOPIK I", "Văn viết"],
  },
  {
    id: "a2-5",
    level: "A2",
    levelColor: "#84cc16",
    pattern: "N – (이)거든요, A/V –거든요",
    meaning: "Vì... / ...đấy nhé",
    explanation: "Dùng để đáp lại câu hỏi, hoặc khi người nói muốn đưa ra ý kiến, lý do mà người nghe chưa biết. Cũng dùng khi thông báo điều người nghe chưa biết, thể hiện tiền đề của nội dung sẽ tiếp nối về sau. Chỉ sử dụng trong văn nói, khi trò chuyện với người quen, không dùng trong trường hợp trang trọng.",
    formation: "A/V + 거든요 / N(nguyên âm) + 거든요 / N(phụ âm) + 이거든요",
    notes: [
      "Dùng để đáp lại câu hỏi hoặc đưa ra lý do người nghe chưa biết.",
      "Dùng khi thông báo tiền đề cho nội dung sẽ nói tiếp.",
      "Chỉ dùng trong văn nói, với người quen — không dùng trong trường hợp trang trọng.",
    ],
    examples: [
      { korean: "아니요, 못 갔어요. 날씨가 나빴거든요.", vietnamese: "Không, tôi không thể đến được. Vì thời tiết xấu." },
      { korean: "요즘 장마철이거든요. 한 달 동안은 계속 올 거예요.", vietnamese: "Vì gần đây đang là mùa mưa đấy. Sẽ tiếp tục mưa trong một tháng nữa." },
      { korean: "어제 영화를 보느라고 잠을 못 잤거든요.", vietnamese: "Vì hôm qua tôi mải xem phim nên đã không ngủ." },
      { korean: "오늘은 지각하면 안 돼요. 오늘 수업에서 제가 발표를 하거든요.", vietnamese: "Hôm nay không được đến muộn. Vì trong tiết học hôm nay tôi sẽ thuyết trình." },
      { korean: "삼촌은 언제 오실 수 있는지 잘 모르겠어요. 연락이 아직 안 왔거든요.", vietnamese: "Tôi không rõ chú khi nào có thể đến được. Vì vẫn không thấy có liên lạc gì." },
      { korean: "집에 친구들이 많이 오거든요.", vietnamese: "Vì nhiều người bạn đến nhà tôi đấy." },
      { korean: "감기약을 먹었거든요. 그런데도 나아지지를 않네요.", vietnamese: "Tôi đã uống thuốc cảm rồi đấy. Nhưng dù vậy nó vẫn không đỡ hơn." },
    ],
    exercises: [
      { question: "못 갔어요. 날씨가 나빴 ___.", options: ["거든요", "어서", "니까", "때문에"], answer: 0, explanation: "Đáp lại câu hỏi, đưa ra lý do người nghe chưa biết → dùng -거든요." },
      { question: "요즘 장마철이 ___. 한 달 동안은 계속 올 거예요.", options: ["거든요", "어서요", "니까요", "때문이에요"], answer: 0, explanation: "장마철 là danh từ kết thúc phụ âm ㄹ → 이거든요. Thông báo tiền đề." },
      { question: "오늘 수업에서 제가 발표를 하 ___.", options: ["거든요", "어서요", "니까요", "기 때문에요"], answer: 0, explanation: "하다 + 거든요. Đưa ra lý do người nghe chưa biết." },
      { question: "감기약을 먹었 ___. 그런데도 나아지지를 않네요.", options: ["거든요", "어서요", "으니까요", "기 때문에"], answer: 0, explanation: "먹다 chia quá khứ 먹었 + 거든요. Thông báo điều người nghe chưa biết." },
    ],
    commonMistakes: [
      "Dùng -거든요 trong văn viết trang trọng (chỉ dùng trong văn nói, với người quen).",
      "Nhầm với -(으)니까 — -거든요 nhấn mạnh lý do người nghe chưa biết, -(으)니까 là lý do chung.",
      "Dùng -거든요 ở đầu câu (phải dùng ở cuối câu, thường đáp lại hoặc bổ sung lý do).",
    ],
    tags: ["Nguyên nhân", "Văn nói", "TOPIK I", "Hội thoại"],
  },
  {
    id: "b1-1",
    level: "B1",
    levelColor: "#f59e0b",
    pattern: "V-ㄴ/은 적이 있다/없다",
    meaning: "Đã từng / Chưa từng",
    explanation: "Diễn tả kinh nghiệm đã có hoặc chưa có trong quá khứ. Tương đương với 'have/haven't done' trong tiếng Anh.",
    formation: "V(nguyên âm/ㄹ) + ㄴ 적이 있다 / V(phụ âm) + 은 적이 있다",
    examples: [
      { korean: "한국에 가 본 적이 있어요.", vietnamese: "Tôi đã từng đến Hàn Quốc." },
      { korean: "김치를 먹은 적이 없어요.", vietnamese: "Tôi chưa từng ăn kimchi." },
      { korean: "스키를 탄 적이 있어요?", vietnamese: "Bạn đã từng trượt tuyết chưa?" },
    ],
    exercises: [
      { question: "한국 음식을 먹 ___ 적이 있어요.", options: ["은", "ㄴ", "는", "던"], answer: 0, explanation: "먹다 kết thúc bằng phụ âm ㄱ, nên dùng 은" },
      { question: "서울에 가 ___ 적이 없어요.", options: ["은", "ㄴ", "는", "던"], answer: 1, explanation: "가다 kết thúc bằng nguyên âm, nên dùng ㄴ → 간 적이" },
    ],
    commonMistakes: ["Nhầm với 았/었어요 (quá khứ đơn)", "Quên 본 trong 가 본 적이"],
    tags: ["Kinh nghiệm", "Quá khứ", "B1"],
  },
  {
    id: "b1-2",
    level: "B1",
    levelColor: "#f59e0b",
    pattern: "V-는 것 같다",
    meaning: "Có vẻ như, Dường như",
    explanation: "Diễn tả suy đoán, phỏng đoán dựa trên quan sát. Thì hiện tại dùng -는 것 같다, quá khứ dùng -ㄴ/은 것 같다, tương lai dùng -ㄹ/을 것 같다.",
    formation: "V + 는 것 같다 (hiện tại) / V + ㄴ/은 것 같다 (quá khứ) / V + ㄹ/을 것 같다 (tương lai)",
    examples: [
      { korean: "비가 오는 것 같아요.", vietnamese: "Có vẻ như trời đang mưa." },
      { korean: "그 사람이 화가 난 것 같아요.", vietnamese: "Có vẻ như người đó đang tức giận." },
      { korean: "내일 눈이 올 것 같아요.", vietnamese: "Có vẻ như ngày mai sẽ có tuyết." },
    ],
    exercises: [
      { question: "그 사람이 피곤하 ___ 것 같아요.", options: ["는", "ㄴ", "ㄹ", "던"], answer: 0, explanation: "Trạng thái hiện tại dùng -는 것 같다" },
      { question: "어제 비가 많이 왔 ___ 것 같아요.", options: ["는", "ㄴ", "ㄹ", "던"], answer: 1, explanation: "Quá khứ dùng -ㄴ/은 것 같다" },
    ],
    commonMistakes: ["Nhầm thì của 것 같다", "Dùng 것 같다 khi chắc chắn (nên dùng 겠다)"],
    tags: ["Suy đoán", "Phỏng đoán", "B1"],
  },
  {
    id: "b2-1",
    level: "B2",
    levelColor: "#f97316",
    pattern: "V-ㄹ/을수록",
    meaning: "Càng... càng...",
    explanation: "Diễn tả mối quan hệ tỷ lệ thuận: khi A tăng thì B cũng tăng. Thường đi kèm với 더 (hơn) hoặc 더욱 (càng hơn).",
    formation: "V/A + ㄹ/을수록 + (더) V/A",
    examples: [
      { korean: "공부할수록 더 재미있어요.", vietnamese: "Càng học càng thấy thú vị." },
      { korean: "알면 알수록 어려워요.", vietnamese: "Càng biết càng thấy khó." },
      { korean: "시간이 지날수록 그리워져요.", vietnamese: "Thời gian càng trôi qua càng nhớ." },
    ],
    exercises: [
      { question: "연습하 ___ 실력이 늘어요.", options: ["ㄹ수록", "을수록", "면", "아서"], answer: 0, explanation: "연습하다 kết thúc bằng nguyên âm, dùng ㄹ수록" },
      { question: "먹 ___ 더 먹고 싶어요.", options: ["ㄹ수록", "을수록", "면", "아서"], answer: 1, explanation: "먹다 kết thúc bằng phụ âm ㄱ, dùng 을수록" },
    ],
    commonMistakes: ["Nhầm với -면 -ㄹ수록 (dùng cả hai)", "Quên 더 ở vế sau"],
    tags: ["Tỷ lệ thuận", "So sánh", "B2"],
  },
  {
    id: "c1-1",
    level: "C1",
    levelColor: "#ef4444",
    pattern: "V-는 한",
    meaning: "Chừng nào còn..., Miễn là...",
    explanation: "Diễn tả điều kiện duy trì: chừng nào điều kiện A còn tồn tại thì kết quả B vẫn đúng. Mang tính trang trọng, thường dùng trong văn viết.",
    formation: "V + 는 한 / A + ㄴ/은 한 / N인 한",
    examples: [
      { korean: "내가 살아있는 한 너를 지킬게.", vietnamese: "Chừng nào tôi còn sống, tôi sẽ bảo vệ em." },
      { korean: "노력하는 한 반드시 성공할 수 있다.", vietnamese: "Chừng nào còn nỗ lực, nhất định sẽ thành công." },
      { korean: "법을 어기지 않는 한 자유롭게 행동할 수 있다.", vietnamese: "Miễn là không vi phạm pháp luật, bạn có thể hành động tự do." },
    ],
    exercises: [
      { question: "포기하지 않 ___ 한 희망이 있어요.", options: ["는", "은", "ㄴ", "던"], answer: 0, explanation: "포기하지 않다 là động từ phủ định, dùng -는 한" },
      { question: "건강 ___ 한 모든 것이 가능해요.", options: ["인", "는", "은", "이"], answer: 0, explanation: "건강 là danh từ, dùng 인 한" },
    ],
    commonMistakes: ["Nhầm với -는 이상 (tương tự nhưng nhấn mạnh hơn)", "Dùng sai thì của vế trước"],
    tags: ["Điều kiện", "Trang trọng", "C1"],
  },
];

const LEVELS = ["Tất cả", "A1", "A2", "B1", "B2", "C1"];

export default function GrammarByLevelPage() {
  const [selectedLevel, setSelectedLevel] = useState("Tất cả");
  const [selectedPattern, setSelectedPattern] = useState<GrammarPattern | null>(null);
  const [activeTab, setActiveTab] = useState<"explain" | "examples" | "exercise">("explain");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = selectedLevel === "Tất cả" ? GRAMMAR_PATTERNS : GRAMMAR_PATTERNS.filter(p => p.level === selectedLevel);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.pattern.toLowerCase().includes(q) ||
        p.meaning.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedLevel, search]);

  const handleAnswer = (qIdx: number, optIdx: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => setShowResults(true);
  const handleReset = () => { setAnswers({}); setShowResults(false); };

  const correctCount = selectedPattern
    ? selectedPattern.exercises.filter((ex, i) => answers[i] === ex.answer).length
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bài tập ngữ pháp theo cấp độ</h1>
          <p className="text-gray-500 text-sm mt-1">Luyện ngữ pháp từ A1 đến C1 với giải thích chi tiết</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Pattern list */}
          <div className="lg:col-span-1">
            {/* Filters */}
            <div className="mb-3">
              <div className="relative mb-3">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  placeholder="Tìm cấu trúc..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {LEVELS.map(lv => (
                  <button
                    key={lv}
                    onClick={() => setSelectedLevel(lv)}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${selectedLevel === lv ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern list */}
            <div className="space-y-2">
              {filtered.map(pattern => (
                <button
                  key={pattern.id}
                  onClick={() => { setSelectedPattern(pattern); setActiveTab("explain"); handleReset(); }}
                  className={`w-full text-left p-3 rounded-xl border cursor-pointer transition-all ${selectedPattern?.id === pattern.id ? "border-rose-300 bg-rose-50" : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: pattern.levelColor }}>
                      {pattern.level}
                    </span>
                    <span className="font-bold text-sm text-gray-900">{pattern.pattern}</span>
                  </div>
                  <p className="text-xs text-gray-500">{pattern.meaning}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {pattern.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded">{tag}</span>
                    ))}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">Không tìm thấy cấu trúc nào</div>
              )}
            </div>
          </div>

          {/* Right: Detail */}
          <div className="lg:col-span-2">
            {!selectedPattern ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <i className="ri-book-open-line text-5xl mb-3"></i>
                <p className="text-sm">Chọn một cấu trúc ngữ pháp để xem chi tiết</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Pattern header */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full text-sm font-bold text-white" style={{ backgroundColor: selectedPattern.levelColor }}>
                      {selectedPattern.level}
                    </span>
                    <h2 className="text-xl font-bold text-gray-900">{selectedPattern.pattern}</h2>
                  </div>
                  <p className="text-gray-600 font-medium">{selectedPattern.meaning}</p>
                  <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-500 font-semibold">Cấu trúc: </span>
                    <span className="text-xs text-gray-700 font-mono">{selectedPattern.formation}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                  {([
                    { id: "explain", label: "Giải thích", icon: "ri-book-2-line" },
                    { id: "examples", label: "Ví dụ", icon: "ri-chat-quote-line" },
                    { id: "exercise", label: "Bài tập", icon: "ri-pencil-line" },
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${activeTab === tab.id ? "text-rose-600 border-b-2 border-rose-500" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      <i className={tab.icon}></i>{tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="p-6">
                  {activeTab === "explain" && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Giải thích</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{selectedPattern.explanation}</p>
                      </div>
                      {selectedPattern.notes && selectedPattern.notes.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">Quy tắc sử dụng</h3>
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                            {selectedPattern.notes.map((note, i) => (
                              <div key={i} className="flex items-start gap-2.5 text-sm">
                                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold mt-0.5">{i + 1}</span>
                                <span className="text-gray-700 leading-relaxed">{note}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Lỗi thường gặp</h3>
                        <div className="space-y-2">
                          {selectedPattern.commonMistakes.map((m, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <i className="ri-error-warning-line text-amber-500 flex-shrink-0 mt-0.5"></i>
                              <span className="text-gray-600">{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {selectedPattern.comparison && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-700 mb-2">{selectedPattern.comparison.title}</h3>
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th className="px-4 py-2.5 text-left font-bold text-rose-600 border-r border-gray-200">{selectedPattern.comparison.headers[0]}</th>
                                  <th className="px-4 py-2.5 text-left font-bold text-blue-600">{selectedPattern.comparison.headers[1]}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedPattern.comparison.rows.map((row, i) => (
                                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                                    <td className="px-4 py-2.5 text-gray-600 border-r border-gray-200 align-top">{row[0]}</td>
                                    <td className="px-4 py-2.5 text-gray-600 align-top">{row[1]}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPattern.tags.map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-rose-50 text-rose-600 text-xs rounded-full font-medium">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "examples" && (
                    <div className="space-y-4">
                      {selectedPattern.examples.map((ex, i) => (
                        <div key={i} className="p-4 bg-gray-50 rounded-xl">
                          <p className="text-base font-bold text-gray-900 mb-1">{ex.korean}</p>
                          <p className="text-sm text-gray-500">{ex.vietnamese}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "exercise" && (
                    <div className="space-y-6">
                      {selectedPattern.exercises.map((ex, qIdx) => (
                        <div key={qIdx} className="space-y-3">
                          <p className="text-sm font-semibold text-gray-800">
                            {qIdx + 1}. {ex.question}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {ex.options.map((opt, optIdx) => {
                              const isSelected = answers[qIdx] === optIdx;
                              const isCorrect = ex.answer === optIdx;
                              let btnClass = "px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all border text-left whitespace-nowrap ";
                              if (!showResults) {
                                btnClass += isSelected
                                  ? "bg-rose-50 border-rose-300 text-rose-700"
                                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300";
                              } else {
                                if (isCorrect) btnClass += "bg-green-50 border-green-400 text-green-700";
                                else if (isSelected && !isCorrect) btnClass += "bg-red-50 border-red-400 text-red-700";
                                else btnClass += "bg-white border-gray-200 text-gray-400";
                              }
                              return (
                                <button key={optIdx} onClick={() => handleAnswer(qIdx, optIdx)} className={btnClass}>
                                  {showResults && isCorrect && <i className="ri-check-line mr-1 text-green-600"></i>}
                                  {showResults && isSelected && !isCorrect && <i className="ri-close-line mr-1 text-red-600"></i>}
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {showResults && (
                            <div className={`p-3 rounded-lg text-xs ${answers[qIdx] === ex.answer ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                              <i className={`${answers[qIdx] === ex.answer ? "ri-check-line" : "ri-close-line"} mr-1`}></i>
                              {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}

                      {!showResults ? (
                        <button
                          onClick={handleSubmit}
                          disabled={Object.keys(answers).length < selectedPattern.exercises.length}
                          className={`w-full py-3 rounded-xl font-semibold text-sm cursor-pointer transition-colors whitespace-nowrap ${Object.keys(answers).length < selectedPattern.exercises.length ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-rose-500 hover:bg-rose-600 text-white"}`}
                        >
                          Kiểm tra đáp án
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className={`p-4 rounded-xl text-center ${correctCount === selectedPattern.exercises.length ? "bg-green-50" : "bg-amber-50"}`}>
                            <p className="text-xl font-bold mb-1" style={{ color: correctCount === selectedPattern.exercises.length ? "#22c55e" : "#f59e0b" }}>
                              {correctCount}/{selectedPattern.exercises.length}
                            </p>
                            <p className="text-sm font-medium text-gray-600">
                              {correctCount === selectedPattern.exercises.length ? "Hoàn hảo! Bạn đã nắm vững cấu trúc này." : "Hãy xem lại phần giải thích và thử lại!"}
                            </p>
                          </div>
                          <button onClick={handleReset} className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap">
                            <i className="ri-refresh-line mr-2"></i>Làm lại
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

