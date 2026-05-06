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
    id: "topik1-1",
    level: "TOPIK 1",
    levelColor: "#22c55e",
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
    id: "topik1-2",
    level: "TOPIK 1",
    levelColor: "#22c55e",
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
    id: "topik1-3",
    level: "TOPIK 1",
    levelColor: "#22c55e",
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
    id: "topik1-4",
    level: "TOPIK 1",
    levelColor: "#22c55e",
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
    id: "topik1-5",
    level: "TOPIK 1",
    levelColor: "#22c55e",
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
    id: "topik1-6",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "N – (이)잖아요, A/V – 잖아요",
    meaning: "Vì... mà, mà",
    explanation: "Khi người nói muốn đưa ra ý kiến, lý do mà người nghe cũng biết, hoặc gợi lại cho người nghe lý do mà người nghe có vẻ đã quên. Còn dùng để trách mắng hoặc khiển trách khi không nghe theo lời khuyên dẫn đến kết quả không tốt (thường dùng với câu trích dẫn gián tiếp). Chỉ dùng trong văn nói, với người thân thiết.",
    formation: "A/V + 잖아요 / N(nguyên âm) + 잖아요 / N(phụ âm) + 이잖아요",
    notes: [
      "Đưa ra lý do mà người nghe cũng biết hoặc đã quên.",
      "Dùng để trách mắng khi không nghe lời khuyên → thường đi kèm trích dẫn gián tiếp.",
      "Chỉ dùng trong văn nói, với người thân thiết — không dùng trang trọng.",
    ],
    examples: [
      { korean: "담배를 끊었잖아요.", vietnamese: "Vì tôi bỏ thuốc lá rồi mà." },
      { korean: "예쁘잖아.", vietnamese: "Vì đẹp mà." },
      { korean: "수영 씨가 새우 알레르기가 있잖아.", vietnamese: "Sooyoung bị dị ứng tôm mà." },
      { korean: "목요일에는 영어 수업이 있잖아요.", vietnamese: "Thứ 5 có tiết học tiếng Anh mà." },
      { korean: "회의는 오후에 하기로 했잖아요.", vietnamese: "Cuộc họp diễn ra vào buổi chiều mà." },
      { korean: "비가 아니라 눈이 오잖아.", vietnamese: "Không phải mưa mà là tuyết mà." },
      { korean: "마리 씨는 일본에서 살았잖아요. 지난번에 마리 씨가 말했는데 생각 안 나요?", vietnamese: "Mari đã sống ở Nhật mà. Lần trước Mari nói bạn không nhớ à?" },
    ],
    exercises: [
      { question: "담배를 끊었 ___.", options: ["잖아요", "거든요", "니까요", "어서요"], answer: 0, explanation: "Gợi lại lý do người nghe cũng biết → dùng -잖아요." },
      { question: "목요일에는 영어 수업이 있 ___.", options: ["잖아요", "거든요", "어서요", "기 때문에"], answer: 0, explanation: "Nhắc lại điều người nghe đã biết nhưng quên → dùng -잖아요." },
      { question: "회의는 오후에 하기로 했 ___.", options: ["잖아요", "거든요", "니까요", "때문에"], answer: 0, explanation: "Nhắc lại quyết định đã có → dùng -잖아요." },
      { question: "마리 씨는 일본에서 살았 ___.", options: ["잖아요", "거든요", "어서요", "니까요"], answer: 0, explanation: "Gợi lại thông tin người nghe đã biết → dùng -잖아요." },
    ],
    commonMistakes: [
      "Dùng -잖아요 khi người nghe chưa biết thông tin (nên dùng -거든요).",
      "Dùng trong văn viết trang trọng (chỉ dùng văn nói, người thân thiết).",
      "Nhầm với -거든요 — -잖아요 nhắc điều người nghe ĐÃ BIẾT, -거든요 cho điều CHƯA BIẾT.",
    ],
    tags: ["Nguyên nhân", "Văn nói", "TOPIK I", "Hội thoại"],
  },
  {
    id: "topik1-7",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "N –(이)고, A/V – 고",
    meaning: "Và, còn",
    explanation: "Liệt kê về mặt không gian. Sử dụng khi mệnh đề trước và sau là những hành động hay trạng thái tương tự nhau. Cả hai vế câu có ý nghĩa bình đẳng và có thể hoán đổi 2 vế câu mà ý nghĩa không thay đổi. Có thể dùng dạng N1 도 + 고 + N2 도... Có thể sử dụng với 았/었 hay 겠.",
    formation: "A/V + 고 / N(nguyên âm) + 고 / N(phụ âm) + 이고",
    notes: [
      "Liệt kê hành động/trạng thái bình đẳng, có thể hoán đổi 2 vế.",
      "Có thể dùng dạng N1 도 + 고 + N2 도...",
      "Có thể sử dụng với 았/었 hay 겠.",
    ],
    examples: [
      { korean: "내 친구는 공부도 잘하고 얼굴도 예뻐요.", vietnamese: "Bạn tôi học giỏi và có khuôn mặt xinh xắn." },
      { korean: "빵은 부드럽고 맛있어요.", vietnamese: "Bánh mì mềm và ngon." },
      { korean: "오늘 빨래하고 청소해요.", vietnamese: "Hôm nay tôi giặt giũ và dọn dẹp." },
      { korean: "날씨도 좋고 경치도 예뻐요.", vietnamese: "Trời đẹp và cảnh cũng đẹp." },
      { korean: "여기는 휴게실이고 저기는 사무실이에요.", vietnamese: "Ở đây là phòng nghỉ và ở kia là văn phòng." },
      { korean: "지수는 키도 크고 예뻐서 인기가 많아요.", vietnamese: "Jisoo cao và xinh đẹp nên được yêu thích." },
      { korean: "비가 몹시 내리고 바람도 심하게 불어요.", vietnamese: "Trời mưa to và gió thổi mạnh." },
      { korean: "아버지는 회사에 가시고 누나는 학교에 갔어요.", vietnamese: "Bố tôi thì đi làm còn chị tôi thì đi học." },
      { korean: "눈이 오고 날씨가 추워요.", vietnamese: "Tuyết rơi và trời lạnh." },
      { korean: "딸기가 싸고 맛있어요.", vietnamese: "Dâu tây rẻ và ngon." },
    ],
    exercises: [
      { question: "빵은 부드럽 ___ 맛있어요.", options: ["고", "어서", "니까", "거나"], answer: 0, explanation: "Liệt kê 2 trạng thái bình đẳng (mềm + ngon) → dùng -고." },
      { question: "날씨도 좋 ___ 경치도 예뻐요.", options: ["고", "어서", "니까", "지만"], answer: 0, explanation: "Liệt kê 2 trạng thái cùng chiều → dùng -고." },
      { question: "여기는 휴게실이 ___ 저기는 사무실이에요.", options: ["고", "어서", "니까", "거나"], answer: 0, explanation: "Danh từ + (이)고. Liệt kê bình đẳng." },
      { question: "눈이 오 ___ 날씨가 추워요.", options: ["고", "어서", "니까", "거나"], answer: 0, explanation: "Liệt kê 2 sự kiện cùng xảy ra → dùng -고." },
    ],
    commonMistakes: [
      "Nhầm với -아/어서 (có quan hệ nhân quả, không hoán đổi được).",
      "Nhầm với -거나 (lựa chọn một trong hai, không phải liệt kê).",
      "Quên thêm 이 với danh từ kết thúc phụ âm (휴게실이고, không phải 휴게실고).",
    ],
    tags: ["Liên kết câu", "Liệt kê", "TOPIK I"],
  },
  {
    id: "topik1-8",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – 거나",
    meaning: "Hoặc..., hay...",
    explanation: "Biểu hiện sự lựa chọn một trong hai hoặc nhiều sự vật, trạng thái. Vế trước chia hiện tại.",
    formation: "A/V + 거나",
    notes: [
      "Biểu hiện sự lựa chọn một trong hai hoặc nhiều sự vật, trạng thái.",
      "Vế trước chia hiện tại.",
    ],
    examples: [
      { korean: "오후에 축구를 하거나 농구를 할 거예요.", vietnamese: "Vào buổi chiều tôi chơi bóng đá hoặc chơi bóng rổ." },
      { korean: "주말에 보통 쉬거나 책을 읽어요.", vietnamese: "Vào cuối tuần tôi thường nghỉ ngơi hoặc đọc sách." },
      { korean: "저는 맵거나 짠 음식을 잘 못 먹어요.", vietnamese: "Tôi không thể ăn đồ ăn cay hoặc mặn." },
      { korean: "민준 씨는 주말에 보통 친구를 만나거나 영화를 봐요.", vietnamese: "Vào cuối tuần Minchun thường gặp bạn bè hoặc xem phim." },
      { korean: "외모로 봤을 때 그는 경찰이거나 군인인 것 같았어요.", vietnamese: "Khi nhìn vào ngoại hình thì người đó chắc là cảnh sát hoặc bộ đội." },
      { korean: "아침에 빵을 먹거나 라면을 먹어요.", vietnamese: "Bữa sáng tôi ăn bánh mì hoặc ăn mì." },
      { korean: "늦거나 가방이 무거울 때 택시를 타요.", vietnamese: "Khi muộn hoặc túi xách nặng thì tôi sẽ đi taxi." },
      { korean: "외식을 하거나 피자를 주문합시다.", vietnamese: "Chúng ta hãy đi ăn ngoài hoặc đặt pizza về." },
      { korean: "병원에 가거나 약을 먹었나요?", vietnamese: "Bạn đã đến bệnh viện hay uống thuốc chưa?" },
      { korean: "방학에 아르바이트를 하거나 고향을 돌아가요.", vietnamese: "Vào kì nghỉ tôi đi làm thêm hoặc về quê." },
    ],
    exercises: [
      { question: "주말에 보통 쉬 ___ 책을 읽어요.", options: ["거나", "고", "어서", "니까"], answer: 0, explanation: "Lựa chọn một trong hai hành động → dùng -거나." },
      { question: "아침에 빵을 먹 ___ 라면을 먹어요.", options: ["거나", "고", "어서", "지만"], answer: 0, explanation: "Lựa chọn một trong hai → dùng -거나." },
      { question: "늦 ___ 가방이 무거울 때 택시를 타요.", options: ["거나", "고", "어서", "니까"], answer: 0, explanation: "Lựa chọn một trong hai trường hợp → dùng -거나." },
      { question: "병원에 가 ___ 약을 먹었나요?", options: ["거나", "고", "어서", "니까"], answer: 0, explanation: "Hỏi lựa chọn một trong hai → dùng -거나." },
    ],
    commonMistakes: [
      "Nhầm với -고 (-고 liệt kê cả hai, -거나 chọn một trong hai).",
      "Chia vế trước ở thì quá khứ (vế trước luôn chia hiện tại).",
      "Dùng -거나 khi muốn nói cả hai xảy ra cùng lúc (nên dùng -고).",
    ],
    tags: ["Liên kết câu", "Lựa chọn", "TOPIK I"],
  },
  {
    id: "topik1-9",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – 지만",
    meaning: "Nhưng",
    explanation: "Nội dung vế sau trái ngược với nội dung vế trước. Khi dùng với thì quá khứ thì sử dụng dạng 았/었/였지만, tương lai 겠지만.",
    formation: "A/V + 지만 / A/V + 았/었/였지만 / A/V + 겠지만",
    notes: [
      "Vế sau trái ngược với vế trước.",
      "Thì quá khứ: 았/었/였지만.",
      "Tương lai: 겠지만.",
    ],
    examples: [
      { korean: "어제 학교에 갔지만 수업이 없었습니다.", vietnamese: "Hôm qua tôi đã đến trường nhưng không có tiết học nào." },
      { korean: "김치가 맛있지만 좀 맵습니다.", vietnamese: "Kim chi ngon nhưng hơi cay." },
      { korean: "한국어 재미있지만 좀 어려워요.", vietnamese: "Tiếng Hàn thú vị nhưng khó." },
      { korean: "한국 여행은 힘들었지만 재미있었어요.", vietnamese: "Chuyến du lịch Hàn Quốc mệt nhưng vui." },
      { korean: "교실 밖에는 춥지만 안에는 따뜻해요.", vietnamese: "Ngoài lớp học lạnh nhưng trong lớp học thì ấm." },
      { korean: "휴대전화는 비싸지만 편리해요.", vietnamese: "Điện thoại đắt nhưng tiện lợi." },
      { korean: "민호 씨에게 전화를 했지만 받지 않았어요.", vietnamese: "Tôi đã gọi điện cho Minho nhưng không bắt máy." },
      { korean: "저는 한국어를 배우고 싶지만 시간이 없어요.", vietnamese: "Tôi muốn học tiếng Hàn nhưng không có thời gian." },
      { korean: "제 친구는 키가 작지만 농구를 잘해요.", vietnamese: "Bạn tôi tuy thấp nhưng chơi bóng rổ giỏi." },
      { korean: "라면은 맛있지만 건강에 좋지는 않아요.", vietnamese: "Mì tôm ngon nhưng không tốt cho sức khỏe." },
    ],
    exercises: [
      { question: "김치가 맛있 ___ 좀 맵습니다.", options: ["지만", "고", "거나", "어서"], answer: 0, explanation: "Trái ngược: ngon vs cay → dùng -지만." },
      { question: "한국어 재미있 ___ 좀 어려워요.", options: ["지만", "고", "거나", "니까"], answer: 0, explanation: "Trái ngược: thú vị vs khó → dùng -지만." },
      { question: "어제 학교에 갔 ___ 수업이 없었습니다.", options: ["지만", "고", "거나", "어서"], answer: 0, explanation: "Quá khứ + 지만 = 갔지만. Trái ngược." },
      { question: "휴대전화는 비싸 ___ 편리해요.", options: ["지만", "고", "거나", "니까"], answer: 0, explanation: "Trái ngược: đắt vs tiện lợi → dùng -지만." },
    ],
    commonMistakes: [
      "Nhầm với -고 (-고 liệt kê cùng chiều, -지만 trái ngược).",
      "Nhầm với -거나 (-거나 lựa chọn, -지만 trái ngược).",
      "Quên chia thì quá khứ/tương lai (갔지만, 아니겠지만).",
    ],
    tags: ["Liên kết câu", "Trái ngược", "TOPIK I"],
  },
  {
    id: "topik1-10",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – (으)ㄴ/는데",
    meaning: "Nhưng, còn, nên...",
    explanation: "Thể hiện sự tương phản, trái ngược. Đưa ra thông tin bối cảnh để giải thích trước khi đặt câu hỏi, rủ rê, ra lệnh. Từ chối lịch sự hoặc khi có thêm thông tin muốn nói. Chia động từ: quá khứ 았/었었는데, hiện tại A+(으)ㄴ데/V+는데, tương lai 겠는데/(으)ㄹ 건데.",
    formation: "A + (으)ㄴ데 / V + 는데 / A/V + 았/었었는데 / A/V + 겠데",
    notes: [
      "Tương phản, trái ngược giữa hai vế.",
      "Đưa bối cảnh trước khi hỏi/rủ/lệnh.",
      "Từ chối lịch sự, đứng cuối câu.",
    ],
    examples: [
      { korean: "어제는 따뜻했는데 오늘은 좀 쌀쌀해요.", vietnamese: "Hôm qua trời nóng nhưng hôm nay trời se se lạnh." },
      { korean: "가방은 예쁜데 좀 비싸요.", vietnamese: "Túi xách đẹp nhưng hơi đắt." },
      { korean: "이 식당은 음식이 맛있는데 좀 비싸요.", vietnamese: "Nhà hàng này đồ ăn ngon nhưng hơi đắt." },
      { korean: "방은 좀 작은데 너무 깨끗해요.", vietnamese: "Phòng tuy hơi bé nhưng sạch sẽ." },
      { korean: "일은 많은데 월급은 적어요.", vietnamese: "Việc thì nhiều mà lương thì thấp." },
      { korean: "비가 오는데 어디에 가요?", vietnamese: "Trời đang mưa, bạn đi đâu vậy?" },
      { korean: "날씨가 좋은데 같이 산책할래요?", vietnamese: "Trời đẹp quá chúng ta cùng đi dạo nhé?" },
      { korean: "좀 피곤한데 잠깐 쉬는게 어때요?", vietnamese: "Tôi hơi mệt nên tôi nghỉ ngơi một chút nhé?" },
      { korean: "아니요, 예쁜데요.", vietnamese: "Không, nó đẹp mà." },
      { korean: "미안해요. 오늘 약속이 있는데요.", vietnamese: "Xin lỗi nha. Hôm nay tôi đã có hẹn rồi." },
    ],
    exercises: [
      { question: "가방은 예쁜 ___ 좀 비싸요.", options: ["데", "지만", "고", "거나"], answer: 0, explanation: "Tương phản: đẹp nhưng đắt → dùng -는데." },
      { question: "일은 많은 ___ 월급은 적어요.", options: ["데", "지만", "고", "어서"], answer: 0, explanation: "Tương phản: việc nhiều lương thấp → dùng -는데." },
      { question: "비가 오 ___ 어디에 가요?", options: ["는데", "지만", "고", "니까"], answer: 0, explanation: "Đưa bối cảnh trước khi hỏi → dùng -는데." },
      { question: "날씨가 좋은 ___ 같이 산책할래요?", options: ["데", "지만", "고", "거나"], answer: 0, explanation: "Đưa bối cảnh trước khi rủ → dùng -는데." },
    ],
    commonMistakes: [
      "Nhầm với -지만 (-지만 trực tiếp trái ngược, -nde mềm hơn, dùng nhiều hơn).",
      "Quên chia thì quá khứ (았/었었는데).",
      "Dùng -nde ở đầu câu (thường đứng cuối câu để từ chối lịch sự).",
    ],
    tags: ["Liên kết câu", "Tương phản", "TOPIK I", "Văn nói"],
  },
  {
    id: "topik1-11",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "N 전에, V – 기 전에",
    meaning: "Trước khi...",
    explanation: "Diễn tả hành động hay tình huống nào đó xuất hiện, xảy ra TRƯỚC một sự việc khác. Có thể gắn cùng các tiểu từ 부터/까지.",
    formation: "N + 전에 / V + 기 전에",
    notes: [
      "Diễn tả hành động xảy ra TRƯỚC sự việc khác.",
      "Có thể dùng với 부터/까지.",
    ],
    examples: [
      { korean: "회사에 가기 전에 아침을 먹어요.", vietnamese: "Trước khi đi làm tôi ăn sáng." },
      { korean: "저는 잠을 자기 전에 책을 읽어요.", vietnamese: "Trước khi ngủ tôi đọc sách." },
      { korean: "보고서는 금요일 전까지 제출해 주세요.", vietnamese: "Đến trước thứ 6, hãy nộp bài báo cáo." },
      { korean: "밥 먹기 전에 손을 씻어야 해요.", vietnamese: "Trước khi ăn cơm phải rửa tay." },
      { korean: "고향에 가기 전에 선물을 준비했어요.", vietnamese: "Trước khi về quê tôi đã chuẩn bị quà." },
      { korean: "밥 먹기 30 분전에 약을 드세요.", vietnamese: "Hãy uống thuốc trước khi ăn 30 phút." },
      { korean: "친구의 집을 방문하기 전에 전화를 했어요.", vietnamese: "Tôi đã gọi điện trước khi đến nhà bạn." },
      { korean: "한국에 오기 전에 무엇을 하셨습니까?", vietnamese: "Bạn đã làm gì trước khi đến Hàn Quốc?" },
      { korean: "자동차를 사기 전에 운전을 배우십시오.", vietnamese: "Hãy học lái xe trước khi mua xe hơi." },
      { korean: "할머니께서는 2년 전에 돌아가셨어요.", vietnamese: "Bà tôi đã qua đời 2 năm trước." },
    ],
    exercises: [
      { question: "회사에 가 ___ 아침을 먹어요.", options: ["기 전에", "전에", "후에", "는데"], answer: 0, explanation: "Động từ + 기 전에 = trước khi làm gì." },
      { question: "저는 잠을 자 ___ 책을 읽어요.", options: ["기 전에", "전에", "후에", "는데"], answer: 0, explanation: "Động từ + 기 전에 = trước khi ngủ." },
      { question: "보고서는 금요일 ___ 제출해 주세요.", options: ["전까지", "기 전에", "후에", "는데"], answer: 0, explanation: "Danh từ + 전까지 = đến trước thứ 6." },
      { question: "밥 먹 ___ 손을 씻어야 해요.", options: ["기 전에", "전에", "후에", "는데"], answer: 0, explanation: "Động từ + 기 전에 = trước khi ăn." },
    ],
    commonMistakes: [
      "Nhầm với (으)ㄴ 후에 (전에 = trước, 후에 = sau).",
      "Quên 기 với động từ (V + 기 전에, không phải V + 전에).",
      "Dùng 전에 với động từ (nên dùng 기 전 với động từ).",
    ],
    tags: ["Thời gian", "Trước khi", "TOPIK I"],
  },
  {
    id: "topik1-12",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "N 후에, V – (으)ㄴ 후에",
    meaning: "Sau khi...",
    explanation: "Diễn tả hành động hay tình huống nào đó xuất hiện, xảy ra SAU một sự việc khác. Có thể gắn cùng các tiểu từ 부터/까지. Có thể thay thế bằng V – (으)ㄴ 다음에 hoặc V – (으)ㄴ 뒤에.",
    formation: "N + 후에 / V + (으)ㄴ 후에",
    notes: [
      "Diễn tả hành động xảy ra SAU sự việc khác.",
      "Có thể thay bằng 다음에 hoặc 뒤에.",
      "Có thể dùng với 부터/까지.",
    ],
    examples: [
      { korean: "점심을 먹은 후에 영화를 볼까요?", vietnamese: "Sau khi ăn trưa cùng nhau đi xem phim nhé?" },
      { korean: "시험 후에 뭐 할 거예요?", vietnamese: "Sau kì thi bạn sẽ làm gì?" },
      { korean: "집에 돌아온 다음에 샤워했어요.", vietnamese: "Sau khi về nhà tôi đã tắm." },
      { korean: "결혼한 후에 그 여자는 직장을 그만두었어요.", vietnamese: "Cô ấy đã nghỉ làm sau khi kết hôn." },
      { korean: "30분 후에 도서관 앞에서 만나자.", vietnamese: "Gặp nhau ở trước thư viện sau ba mươi phút nữa nhé." },
      { korean: "밥을 먹은 후에 이를 닦아요.", vietnamese: "Tôi đánh răng sau khi ăn cơm." },
      { korean: "수업 후에 시간 있어요?", vietnamese: "Sau tiết học bạn có rảnh không?" },
      { korean: "수업이 끝난 다음에 아르바이트를 해요.", vietnamese: "Sau khi tiết học kết thúc tôi đi làm thêm." },
      { korean: "대학교를 졸업 후에 취직을 했어요.", vietnamese: "Tôi đi làm sau khi tốt nghiệp." },
    ],
    exercises: [
      { question: "점심을 먹 ___ 영화를 볼까요?", options: ["은 후에", "기 전에", "전에", "는데"], answer: 0, explanation: "Động từ quá khứ + (으)ㄴ 후에 = sau khi ăn." },
      { question: "시험 ___ 뭐 할 거예요?", options: ["후에", "기 전에", "전에", "는데"], answer: 0, explanation: "Danh từ + 후에 = sau kì thi." },
      { question: "집에 돌아온 ___ 샤워했어요.", options: ["다음에", "기 전에", "전에", "는데"], answer: 0, explanation: "다음에 thay thế cho 후에 = sau khi về nhà." },
      { question: "밥을 먹 ___ 이를 닦아요.", options: ["은 후에", "기 전에", "전에", "는데"], answer: 0, explanation: "Động từ quá khứ + (으)ㄴ 후에 = sau khi ăn." },
    ],
    commonMistakes: [
      "Nhầm với 기 전에 (후에 = sau, 전에 = trước).",
      "Quên (으)ㄴ với động từ quá khứ (먹은 후에, không phải 먹 후에).",
      "Dùng 후에 với động từ hiện tại (nên chia quá khứ trước khi dùng 후에).",
    ],
    tags: ["Thời gian", "Sau khi", "TOPIK I"],
  },
  {
    id: "topik1-13",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 고 나서",
    meaning: "Xong rồi thì...",
    explanation: "Biểu hiện hành động ở vế sau được thực hiện sau khi hành động ở vế trước hoàn thành. Không thể kết hợp cùng với 았/었, 겠, (으)ㄹ 것이다. Chỉ dùng với các động từ mà bắt đầu và kết thúc một cách rõ ràng (không dùng với 일어나다, 가다, 오다...).",
    formation: "V + 고 나서",
    notes: [
      "Hành động vế sau thực hiện sau khi vế trước hoàn thành.",
      "Không dùng với 았/었, 겠 ở vế trước.",
      "Chỉ dùng với động từ có bắt đầu/kết thúc rõ ràng.",
    ],
    examples: [
      { korean: "숙제를 끝내고 나서 친구를 만날 거예요.", vietnamese: "Hoàn thành xong bài tập về nhà tôi sẽ gặp gỡ bạn bè." },
      { korean: "손을 씻고 나서 식사를 해야 합니다.", vietnamese: "Rửa tay xong rồi thì phải ăn thôi." },
      { korean: "식사를 하고 나서 커피를 마십시다.", vietnamese: "Sau khi ăn xong rồi chúng ta hãy uống cà phê đi." },
      { korean: "선생님의 설명을 듣고 나서 이해가 되었어요.", vietnamese: "Nghe giải thích của thầy giáo xong thì tôi đã hiểu rồi." },
      { korean: "주말에 집안일을 하고 나서 산책해요.", vietnamese: "Cuối tuần sau khi làm việc nhà xong tôi đi dạo." },
      { korean: "샤워 하고 나서 했어요.", vietnamese: "Sau khi tắm xong mình đã làm rồi." },
      { korean: "그는 전화를 받고 나서 나갔어요.", vietnamese: "Anh ta nhận điện thoại xong rồi đi ra ngoài." },
      { korean: "텔레비전을 보고 나서 자요.", vietnamese: "Tôi xem TV xong rồi ngủ." },
      { korean: "아침을 먹고 나서 학교에 가요.", vietnamese: "Tôi ăn sáng xong rồi đi học." },
    ],
    exercises: [
      { question: "숙제를 끝내 ___ 친구를 만날 거예요.", options: ["고 나서", "고 나면", "고 나니", "아서"], answer: 0, explanation: "Hoàn thành xong rồi → dùng -고 나서." },
      { question: "손을 씻 ___ 식사를 해야 합니다.", options: ["고 나서", "고 나면", "고 나니", "아서"], answer: 0, explanation: "Rửa xong rồi → dùng -고 나서." },
      { question: "식사를 하 ___ 커피를 마십시다.", options: ["고 나서", "고 나면", "고 나니", "아서"], answer: 0, explanation: "Ăn xong rồi → dùng -고 나서." },
      { question: "텔레비전을 보 ___ 자요.", options: ["고 나서", "고 나면", "고 나니", "아서"], answer: 0, explanation: "Xem xong rồi → dùng -고 나서." },
    ],
    commonMistakes: [
      "Dùng -고 나서 với động từ không có bắt đầu/kết thúc rõ ràng (일어나다, 가다).",
      "Thêm 았/었 ở vế trước (sai: 끝났고 나서 → đúng: 끝내고 나서).",
      "Nhầm với -고 나면 (고 나서 = thực tế, 고 나면 = giả định).",
    ],
    tags: ["Thời gian", "Xong rồi", "TOPIK I"],
  },
  {
    id: "topik1-14",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 고 나면",
    meaning: "Nếu xong rồi thì...",
    explanation: "Biểu hiện giả định hành động ở vế sau được thực hiện sau khi hành động ở vế trước hoàn thành.",
    formation: "V + 고 나면",
    notes: [
      "Giả định hành động vế sau thực hiện sau khi vế trước hoàn thành.",
      "Mang ý nghĩa điều kiện giả định.",
    ],
    examples: [
      { korean: "한국어를 공부하고 나면 통역사가 될 수 있어요.", vietnamese: "Nếu học tiếng Hàn xong thì sẽ có thể trở thành thông dịch viên." },
      { korean: "자기한테 맞는 공부 방법을 찾게 되고 나면 공부하기가 쉬워져요.", vietnamese: "Nếu tìm được phương pháp học tập phù hợp với mình xong thì việc học sẽ trở nên dễ dàng hơn." },
      { korean: "약을 먹고 나면 좋아질 거예요.", vietnamese: "Nếu bạn uống thuốc xong, bạn sẽ thấy tốt hơn." },
      { korean: "일을 마치고 나면 보람을 느낄 수 있을 거예요.", vietnamese: "Khi bạn hoàn thành công việc xong, bạn sẽ cảm thấy có giá trị." },
      { korean: "규칙을 알고 나면 수학이 아주 쉬워질 겁니다.", vietnamese: "Nếu bạn nắm rõ được các quy tắc xong thì môn toán sẽ trở nên dễ dàng." },
    ],
    exercises: [
      { question: "한국어를 공부 ___ 통역사가 될 수 있어요.", options: ["고 나면", "고 나서", "고 나니", "아서"], answer: 0, explanation: "Giả định: nếu học xong → dùng -고 나면." },
      { question: "약을 먹 ___ 좋아질 거예요.", options: ["고 나면", "고 나서", "고 나니", "아서"], answer: 0, explanation: "Giả định: nếu uống xong → dùng -고 나면." },
      { question: "일을 마치 ___ 보람을 느낄 수 있을 거예요.", options: ["고 나면", "고 나서", "고 나니", "아서"], answer: 0, explanation: "Giả định: nếu hoàn thành xong → dùng -고 나면." },
      { question: "규칙을 알 ___ 수학이 아주 쉬워질 겁니다.", options: ["고 나면", "고 나서", "고 나니", "아서"], answer: 0, explanation: "Giả định: nếu biết xong → dùng -고 나면." },
    ],
    commonMistakes: [
      "Nhầm với -고 나서 (고 나서 = thực tế, 고 나면 = giả định).",
      "Dùng -고 나면 cho sự việc đã xảy ra (nên dùng -고 나서).",
      "Quên ý nghĩa điều kiện giả định của -면.",
    ],
    tags: ["Thời gian", "Giả định", "TOPIK I"],
  },
  {
    id: "topik1-15",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 고 나니",
    meaning: "Xong rồi thì thấy...",
    explanation: "Biểu hiện hành động ở vế sau được thực hiện sau khi hành động ở vế trước hoàn thành. Do kết hợp với (으)니까 nên có ý nghĩa làm gì đó xong thì phát hiện ra sự thật nào đó.",
    formation: "V + 고 나니",
    notes: [
      "Làm gì xong rồi thì phát hiện ra sự thật.",
      "Kết hợp với (으)니까.",
    ],
    examples: [
      { korean: "밥을 많이 먹고 나니 이제 졸려요.", vietnamese: "Sau khi đã ăn rất nhiều thì tôi thấy rất buồn ngủ." },
      { korean: "돈을 벌고 나니 비싼 물건을 사고 싶어졌어요.", vietnamese: "Sau khi kiếm được nhiều tiền tôi thấy mình muốn mua những thứ đắt tiền." },
      { korean: "샤워를 하고 나니 기분이 훨씬 좋네요.", vietnamese: "Sau khi tắm tôi thấy tinh thần mình tốt hơn." },
      { korean: "집을 청소하고 나니 더 넓어 보여요.", vietnamese: "Sau khi dọn dẹp nhà tôi thấy ngôi nhà trông lớn hơn rất nhiều." },
      { korean: "약을 먹고 나니 머리가 안 아파요.", vietnamese: "Sau khi tôi uống thuốc, tôi thấy đã hết đau đầu." },
    ],
    exercises: [
      { question: "밥을 많이 먹 ___ 이제 졸려요.", options: ["고 나니", "고 나서", "고 나면", "아서"], answer: 0, explanation: "Xong rồi thấy → dùng -고 나니." },
      { question: "돈을 벌 ___ 비싼 물건을 사고 싶어졌어요.", options: ["고 나니", "고 나서", "고 나면", "아서"], answer: 0, explanation: "Xong rồi thấy muốn → dùng -고 나니." },
      { question: "샤워를 하 ___ 기분이 훨씬 좋네요.", options: ["고 나니", "고 나서", "고 나면", "아서"], answer: 0, explanation: "Xong rồi thấy → dùng -고 나니." },
      { question: "약을 먹 ___ 머리가 안 아파요.", options: ["고 나니", "고 나서", "고 나면", "아서"], answer: 0, explanation: "Xong rồi thấy → dùng -고 나니." },
    ],
    commonMistakes: [
      "Nhầm với -고 나서 (고 나서 = thực tế tiếp theo, 고 나니 = phát hiện ra).",
      "Nhầm với -고 나면 (고 나면 = giả định, 고 나니 = phát hiện thực tế).",
      "Quên ý nghĩa phát hiện ra sự thật của -고 나니.",
    ],
    tags: ["Thời gian", "Phát hiện", "TOPIK I"],
  },
  {
    id: "topik1-16",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 아/어서",
    meaning: "Để rồi",
    explanation: "Vế trước xảy ra rồi kế tiếp vế sau xuất hiện lần lượt theo trình tự thời gian. Hai vế phải có cùng chủ ngữ và có quan hệ qua lại lẫn nhau. Hành động ở mệnh đề sau tiếp nối hành động của mệnh đề trước. Không dùng với 았/었, 겠 ở vế trước. Vế sau có thể chia mệnh lệnh, cầu khiến.",
    formation: "V(ㅏ/ㅗ) + 아서 / V(khác) + 어서 / 하다 → 해서",
    notes: [
      "Vế trước xảy ra rồi vế sau tiếp nối theo trình tự thời gian.",
      "Hai vế phải có cùng chủ ngữ.",
      "Không dùng 앾/었, 겠 ở vế trước.",
    ],
    examples: [
      { korean: "사과를 씻어서 먹었어요.", vietnamese: "Tôi rửa táo rồi mới ăn." },
      { korean: "아침에 일어나서 세수를 했어요.", vietnamese: "Buổi sáng tôi thức dậy rồi rửa mặt." },
      { korean: "여기에 앉아서 잠깐만 기다리세요.", vietnamese: "Hãy ngồi ở đây rồi chờ một chút nhé." },
      { korean: "친구를 만나서 영화를 봤어요.", vietnamese: "Tôi đã gặp bạn rồi cùng đi xem phim." },
      { korean: "커피숍에 가서 커피를 마셨어요.", vietnamese: "Tôi đã đến quán cà phê rồi uống cà phê." },
      { korean: "민수 씨는 고향에 가서 부모님을 만났어요.", vietnamese: "Minsu về quê rồi gặp bố mẹ." },
      { korean: "도서관에 가서 친구를 기다렸어요.", vietnamese: "Tôi đã đến thư viện rồi đợi bạn." },
      { korean: "이메일을 써서 친구에게 보냈습니다.", vietnamese: "Tôi đã viết email rồi gửi cho bạn." },
    ],
    exercises: [
      { question: "사과를 씻 ___ 먹었어요.", options: ["어서", "아서", "고 나서", "고 나니"], answer: 0, explanation: "씻다 → 씻어서. Rửa rồi ăn." },
      { question: "아침에 일어나 ___ 세수를 했어요.", options: ["아서", "어서", "고 나서", "고 나니"], answer: 0, explanation: "일어나다 → 일어나서. Thức dậy rồi rửa mặt." },
      { question: "여기에 앉 ___ 잠깐만 기다리세요.", options: ["아서", "어서", "고 나서", "고 나니"], answer: 0, explanation: "앉다 → 앉아서. Ngồi rồi chờ." },
      { question: "친구를 만나 ___ 영화를 봤어요.", options: ["아서", "어서", "고 나서", "고 나니"], answer: 0, explanation: "만나다 → 만나서. Gặp rồi xem phim." },
    ],
    commonMistakes: [
      "Dùng 앾/었 ở vế trước (sai: 일어났어서 → đúng: 일어나서).",
      "Hai vế khác chủ ngữ (sai: 제가 가서 친구가 왔어요 → đúng: 친구가 와서 제가 갔어요).",
      "Nhầm với -고 나서 (-아/어서 = tiếp nối, -고 나서 = hoàn thành xong).",
    ],
    tags: ["Thời gian", "Tiếp nối", "TOPIK I"],
  },
  {
    id: "topik1-17",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 고",
    meaning: "Rồi",
    explanation: "Liệt kê trình tự thời gian: vế trước xảy ra rồi kế tiếp vế sau xuất hiện lần lượt theo trình tự thời gian. Hai vế phải có cùng chủ ngữ, 2 vế không có quan hệ mục đích qua lại như 아/어서. Không thể kết hợp cùng với 았/었, 겠 ở vế trước.",
    formation: "V + 고",
    notes: [
      "Liệt kê trình tự thời gian.",
      "Hai vế phải có cùng chủ ngữ.",
      "Không dùng 앾/었, 겠 ở vế trước.",
    ],
    examples: [
      { korean: "오늘 아침에 세수하고 밥을 먹었어요.", vietnamese: "Sáng nay tôi đã rửa mặt rồi ăn cơm." },
      { korean: "저는 어제 수업을 듣고 점심을 먹었어요.", vietnamese: "Hôm qua tôi nghe giảng rồi ăn trưa." },
      { korean: "저는 숙제를 하고 친구를 만날 거예요.", vietnamese: "Tôi làm bài tập rồi sẽ gặp gỡ bạn bè." },
      { korean: "양복을 입고 출근했어요.", vietnamese: "Tôi mặc âu phục rồi đi làm." },
      { korean: "운동화를 신고 산책해요.", vietnamese: "Tôi đi giày rồi đi dạo." },
    ],
    exercises: [
      { question: "오늘 아침에 세수 ___ 밥을 먹었어요.", options: ["고", "고 나서", "아서", "어서"], answer: 0, explanation: "Liệt kê trình tự → dùng -고." },
      { question: "저는 어제 수업을 듣 ___ 점심을 먹었어요.", options: ["고", "고 나서", "아서", "어서"], answer: 0, explanation: "Liệt kê trình tự → dùng -고." },
      { question: "저는 숙제를 하 ___ 친구를 만날 거예요.", options: ["고", "고 나서", "아서", "어서"], answer: 0, explanation: "Liệt kê trình tự → dùng -고." },
      { question: "양복을 입 ___ 출근했어요.", options: ["고", "고 나서", "아서", "어서"], answer: 0, explanation: "Liệt kê trình tự → dùng -고." },
    ],
    commonMistakes: [
      "Dùng 앾/었 ở vế trước (sai: 먹었고 → đúng: 먹고).",
      "Hai vế khác chủ ngữ (sai: 제가 가고 친구가 왔어요 → đúng: 제가 가고 제가 왔어요).",
      "Nhầm với -아/어서 (-아/어서 có quan hệ mục đích, -고 chỉ liệt kê).",
    ],
    tags: ["Thời gian", "Liệt kê", "TOPIK I"],
  },
  {
    id: "topik1-18",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "N – 때, A/V – (으)ㄹ 때",
    meaning: "Khi...",
    explanation: "Diễn tả thời điểm diễn ra hành động hoặc trạng thái nào đó. Không thể dùng 때 với 아침, 오전, 오후, 주말 và các thứ trong tuần.",
    formation: "N + 때 / A + ㄹ 때 / V + (으)ㄹ 때",
    notes: [
      "Diễn tả thời điểm hành động/trạng thái.",
      "Không dùng với thời gian cố định (아침, 오전, 주말...).",
    ],
    examples: [
      { korean: "저는 집에 혼자 있을 때 책을 읽어요.", vietnamese: "Khi tôi ở nhà một mình thì tôi đọc sách." },
      { korean: "방학 때 고향에 갈 거예요.", vietnamese: "Tôi sẽ về quê trong kỳ nghỉ." },
      { korean: "심심할 때마다 한국 음악을 들어요.", vietnamese: "Mỗi khi buồn chán tôi nghe nhạc." },
      { korean: "몸이 아플 때 병원에 가요.", vietnamese: "Khi bị ốm tôi đến bệnh viện." },
      { korean: "회사에 갈 때 양복을 입어요.", vietnamese: "Khi đi làm tôi mặc âu phục." },
      { korean: "배고플 때 밥을 두 그릇 먹어요.", vietnamese: "Khi đói tôi ăn 2 bát cơm." },
    ],
    exercises: [
      { question: "저는 집에 혼자 있 ___ 책을 읽어요.", options: ["을 때", "때", "고", "아서"], answer: 0, explanation: "Động từ + (으)ㄹ 때 = khi ở nhà." },
      { question: "방학 ___ 고향에 갈 거예요.", options: ["때", "을 때", "고", "아서"], answer: 0, explanation: "Danh từ + 때 = trong kỳ nghỉ." },
      { question: "심심할 ___ 한국 음악을 들어요.", options: ["때마다", "때", "고", "아서"], answer: 0, explanation: "Tính từ + 때마다 = mỗi khi buồn chán." },
      { question: "몸이 아플 ___ 병원에 가요.", options: ["때", "을 때", "고", "아서"], answer: 0, explanation: "Tính từ + 때 = khi bị ốm." },
    ],
    commonMistakes: [
      "Dùng 때 với thời gian cố định (sai: 아침 때 → đúng: 아침에).",
      "Quên (으)ㄹ với động từ/tính từ (sai: 갈 때 → đúng: 갈 때 là đúng, nhưng 있을 때).",
      "Nhầm với -고 (때 = thời điểm, -고 = liệt kê).",
    ],
    tags: ["Thời gian", "Khi", "TOPIK I"],
  },
  {
    id: "topik1-19",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – (으)면서",
    meaning: "Vừa...vừa...",
    explanation: "Diễn tả hai hành động diễn ra ở cùng thời điểm, chủ ngữ của hai hành động phải đồng nhất. Cũng có thể sử dụng với tính từ khi 2 trạng thái tương đương; có thể thay bằng (으)며. Động từ trước – (으)면서 phải để nguyên thể.",
    formation: "A + 면서 / V + (으)면서",
    notes: [
      "Hai hành động cùng thời điểm.",
      "Chủ ngữ phải đồng nhất.",
      "Có thể thay bằng (으)며.",
    ],
    examples: [
      { korean: "그 사람이 울면서 말했어요.", vietnamese: "Người đó vừa nói vừa khóc." },
      { korean: "운전하면서 핸드폰을 보지 마세요.", vietnamese: "Đừng xem điện thoại trong khi đang lái xe." },
      { korean: "흐엉 씨는 똑똑하면서 예뻐요.", vietnamese: "Hương vừa thông minh vừa xinh đẹp." },
      { korean: "밥을 먹으면서 텔레비전을 봐요.", vietnamese: "Tôi vừa ăn vừa xem phim." },
      { korean: "요리를 하면서 많이 먹어요.", vietnamese: "Tôi ăn rất nhiều trong lúc đang nấu ăn." },
      { korean: "마이 씨는 그림을 그리며 노래를 했습니다.", vietnamese: "Mai vừa vẽ tranh vừa hát." },
      { korean: "음악을 들으면서 운동을 해요.", vietnamese: "Tôi vừa nghe nhạc vừa tập thể dục." },
      { korean: "서울은 한국의 수도이며 경제의 중심입니다.", vietnamese: "Seoul vừa là thủ đô của Hàn Quốc vừa là trung tâm kinh tế." },
    ],
    exercises: [
      { question: "그 사람이 울 ___ 말했어요.", options: ["면서", "고", "아서", "때"], answer: 0, explanation: "Vừa khóc vừa nói → dùng -면서." },
      { question: "밥을 먹 ___ 텔레비전을 봐요.", options: ["으면서", "고", "아서", "때"], answer: 0, explanation: "Vừa ăn vừa xem → dùng -으면서." },
      { question: "음악을 들 ___ 운동을 해요.", options: ["으면서", "고", "아서", "때"], answer: 0, explanation: "Vừa nghe vừa tập → dùng -으면서." },
      { question: "흐엉 씨는 똑똑하 ___ 예뻐요.", options: ["면서", "고", "아서", "때"], answer: 0, explanation: "Vừa thông minh vừa xinh → dùng -면서." },
    ],
    commonMistakes: [
      "Hai vế khác chủ ngữ (sai: 제가 먹고 친구가 보면서 → sai).",
      "Chia động từ trước (sai: 먹었으면서 → đúng: 먹으면서).",
      "Nhầm với -고 (-고 = liệt kê, -면서 = cùng thời điểm).",
    ],
    tags: ["Thời gian", "Cùng lúc", "TOPIK I"],
  },
  {
    id: "topik1-20",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – (으)며",
    meaning: "Vừa...vừa... / và...và...",
    explanation: "Diễn tả hai hành động diễn ra ở cùng thời điểm, chủ ngữ của hai hành động phải đồng nhất. Thường dùng trong văn viết. Liệt kê 2 hành động hay trạng thái, thường dùng trong văn viết. Có thể thay bằng (으)면서.",
    formation: "A + 며 / V + (으)며",
    notes: [
      "Hai hành động cùng thời điểm.",
      "Thường dùng trong văn viết.",
      "Có thể thay bằng (으)면서.",
    ],
    examples: [
      { korean: "부산은 바다로 유명하며 강원도는 산으로 유명합니다.", vietnamese: "Busan nổi tiếng với biển và Gangwondo nổi tiếng với núi." },
      { korean: "오늘 한국은 축구 경기를 하며 중국은 농구 경기를 합니다.", vietnamese: "Hôm nay Hàn Quốc thi đấu bóng đá còn Trung Quốc thi đấu bóng rổ." },
      { korean: "내 친구는 공부도 잘하며 성격도 좋다.", vietnamese: "Bạn tôi học cũng giỏi và tính cách cũng tốt nữa." },
      { korean: "제가 어제 만난 남자는 멋있었으며 친절했습니다.", vietnamese: "Người đàn ông tôi gặp hôm qua đã rất tuyệt và tử tế." },
      { korean: "내일은 날씨가 춥겠으며 바람도 불겠습니다.", vietnamese: "Ngày mai thời tiết sẽ lạnh và cũng sẽ có gió." },
      { korean: "친구가 책을 읽으며 커피를 마셔요.", vietnamese: "Đứa bạn vừa đọc sách vừa uống cà phê." },
      { korean: "저는 텔레비전을 보며 식사를 합니다.", vietnamese: "Tôi vừa ăn vừa xem phim." },
      { korean: "이 컴퓨터는 크기도 작으며 값도 싸요.", vietnamese: "Chiếc máy vi tính này kích cỡ vừa nhỏ giá cả lại còn rẻ nữa." },
      { korean: "방이 깨끗하며 넓어요.", vietnamese: "Căn phòng vừa sạch sẽ vừa rộng rãi." },
      { korean: "친구가 음악을 들으며 게임을 해요.", vietnamese: "Đứa bạn vừa điện thoại vừa chơi game." },
    ],
    exercises: [
      { question: "부산은 바다로 유명하 ___ 강원도는 산으로 유명합니다.", options: ["며", "고", "아서", "때"], answer: 0, explanation: "Văn viết, liệt kê → dùng -며." },
      { question: "내 친구는 공부도 잘하 ___ 성격도 좋다.", options: ["며", "고", "아서", "때"], answer: 0, explanation: "Văn viết, liệt kê → dùng -며." },
      { question: "친구가 책을 읽 ___ 커피를 마셔요.", options: ["으며", "고", "아서", "때"], answer: 0, explanation: "Vừa đọc vừa uống → dùng -으며." },
      { question: "방이 깨끗하 ___ 넓어요.", options: ["며", "고", "아서", "때"], answer: 0, explanation: "Vừa sạch vừa rộng → dùng -며." },
    ],
    commonMistakes: [
      "Dùng trong văn nói (nên dùng -면서 trong văn nói).",
      "Hai vế khác chủ ngữ (sai: 제가 읽으며 친구가 마셔요 → sai).",
      "Nhầm với -고 (-고 = liệt kê trình tự, -며 = cùng thời điểm/liệt kê văn viết).",
    ],
    tags: ["Thời gian", "Cùng lúc", "Văn viết", "TOPIK I"],
  },
  {
    id: "topik1-21",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "N 중, V- 는 중이다",
    meaning: "Đang..., đang trong quá trình...",
    explanation: "Diễn tả hành động đang trong quá trình được thực hiện. Một số từ thông dụng: 회의 중, 수업 중, 공사 중, 출장 중, 외출 중... Có thể dùng ở dạng cấu trúc V-는 중에. – 는 중 và – 고 있다 giống nhau. Tuy nhiên, – 고 있다 có thể kết hợp các động từ, còn – 는 중 không được dùng để diễn tả các hiện tượng tự nhiên và thường không kết hợp với 살다, 지내다, 다니다...",
    formation: "N + 중 / V + 는 중이다 / V + 는 중에",
    notes: [
      "Diễn tả hành động đang trong quá trình.",
      "Có thể dùng dạng V-는 중에.",
      "Không dùng với hiện tượng tự nhiên (살다, 지내다, 다니다).",
    ],
    examples: [
      { korean: "이사할 거예요. 그래서 집을 찾는 중이에요.", vietnamese: "Tôi sẽ chuyển nhà. Nên tôi đang tìm nhà." },
      { korean: "지금 수업 중이니까 나중에 전화하세요.", vietnamese: "Bây giờ tôi đang học nên hãy gọi lại sau nhé." },
      { korean: "학교에 가는 중에 친구를 만났어요.", vietnamese: "Tôi đã gặp gỡ bạn bè khi đang đến trường." },
      { korean: "친구가 안 와서 기다리는 중이에요.", vietnamese: "Bạn chưa đến nên tôi đang đợi." },
      { korean: "내일 시험이라서 공부하는 중이에요.", vietnamese: "Vì ngày mai là buổi thi nên tôi đang học bài." },
      { korean: "공사 중이라서 길이 자주 막혀요.", vietnamese: "Vì đang trong quá trình xây dựng nên con đường thường tắc nghẽn." },
      { korean: "요즘 운전을 배우는 중이에요.", vietnamese: "Dạo này tôi đang học lái xe." },
    ],
    exercises: [
      { question: "지금 수업 ___ 나중에 전화하세요.", options: ["중이니까", "중에", "동안", "때"], answer: 0, explanation: "Đang học → 수업 중이니까." },
      { question: "학교에 가는 ___ 친구를 만났어요.", options: ["중에", "중이니까", "동안", "때"], answer: 0, explanation: "Đang đến trường → 가는 중에." },
      { question: "친구가 안 와서 기다리는 ___.", options: ["중이에요", "중에", "동안", "때"], answer: 0, explanation: "Đang đợi → 기다리는 중이에요." },
      { question: "요즘 운전을 배우는 ___.", options: ["중이에요", "중에", "동안", "때"], answer: 0, explanation: "Đang học → 배우는 중이에요." },
    ],
    commonMistakes: [
      "Dùng -는 중 với hiện tượng tự nhiên (sai: 사는 중 → đúng: 사고 있다).",
      "Dùng -는 중 với 살다, 지내다, 다니다.",
      "Nhầm với -고 있다 (giống nhau nhưng -는 trung hạn chế hơn).",
    ],
    tags: ["Thời gian", "Đang làm", "TOPIK I"],
  },
  {
    id: "topik1-22",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 자마자",
    meaning: "Ngay sau khi...",
    explanation: "Biểu hiện việc gì đó xảy ra ngay lập tức sau một việc nào đó, thường không có khoảng trống về mặt thời gian giữa 2 hành động. Chủ ngữ của mệnh đề trước và sau không nhất thiết phải đồng nhất. Thì của động từ được chia ở mệnh đề sau.",
    formation: "V + 자마자",
    notes: [
      "Xảy ra ngay lập tức sau hành động trước.",
      "Không có khoảng trống thời gian.",
      "Chủ ngữ hai vế không nhất thiết đồng nhất.",
    ],
    examples: [
      { korean: "어제는 피곤해서 침대에 눕자마자 잠이 들었어요.", vietnamese: "Hôm qua vì mệt mỏi nên ngay khi nằm xuống giường tôi đã ngủ thiếp đi." },
      { korean: "집에서 나가자마자 비가 오기 시작했어요.", vietnamese: "Ngay sau khi tôi rời khỏi nhà thì trời đã bắt đầu đổ mưa." },
      { korean: "남편은 집에 오자마자 텔레비전을 켜요.", vietnamese: "Chồng tôi vừa về đến nhà là bật ngay cái TV." },
      { korean: "친구가 기다리고 있어서 퇴근하자마자 가야 돼요.", vietnamese: "Bạn tôi đang đợi nên ngay sau khi tan làm tôi phải đi ngay." },
      { korean: "수업이 끝나자마자 학생들은 교실을 나갔어요.", vietnamese: "Sau khi lớp học kết thúc thì học sinh chạy ra khỏi lớp ngay." },
      { korean: "밥을 먹자마자 누우면 건강에 안 좋아요.", vietnamese: "Vừa ăn xong mà đi nằm luôn không tốt cho sức khỏe đâu." },
    ],
    exercises: [
      { question: "침대에 눕 ___ 잠이 들었어요.", options: ["자마자", "고 나서", "아서", "때"], answer: 0, explanation: "Ngay khi nằm → 눕자마자." },
      { question: "집에서 나가 ___ 비가 오기 시작했어요.", options: ["자마자", "고 나서", "아서", "때"], answer: 0, explanation: "Ngay khi ra nhà → 나가자마자." },
      { question: "남편은 집에 오 ___ 텔레비전을 켜요.", options: ["자마자", "고 나서", "아서", "때"], answer: 0, explanation: "Vừa về nhà → 오자마자." },
      { question: "수업이 끝나 ___ 학생들은 교실을 나갔어요.", options: ["자마자", "고 나서", "아서", "때"], answer: 0, explanation: "Ngay khi kết thúc → 끝나자마자." },
    ],
    commonMistakes: [
      "Nhầm với -고 나서 (-고 나서 = xong rồi, -자마자 = ngay lập tức).",
      "Dùng -자마자 với khoảng trống thời gian (sai: 10분 후 → đúng: ngay lập tức).",
      "Quên chia thì ở vế sau (thì của vế sau thay đổi theo ngữ cảnh).",
    ],
    tags: ["Thời gian", "Ngay lập tức", "TOPIK I"],
  },
  {
    id: "topik1-23",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "N 동안, V- 는 동안",
    meaning: "Trong lúc..., trong khi...",
    explanation: "Thể hiện thời gian mà hành động hoặc trạng thái nào đó được duy trì trong khoảng thời gian như nhau. Có thể mô tả 2 quá trình. Chủ ngữ của mệnh đề trước và sau không nhất thiết phải đồng nhất. Có thể sử dụng với 없다, 있다.",
    formation: "N + 동안 / V + 는 동안",
    notes: [
      "Thời gian hành động được duy trì.",
      "Chủ ngữ hai vế không nhất thiết đồng nhất.",
      "Có thể dùng với 없다, 있다.",
    ],
    examples: [
      { korean: "나는 방학 동안 고향에 다녀올 거예요.", vietnamese: "Trong kì nghỉ tôi sẽ về quê." },
      { korean: "내가 음식을 만드는 동안 동생은 잤어요.", vietnamese: "Em tôi ngủ trong lúc tôi nấu ăn." },
      { korean: "한국에 사는 동안 한국 친구를 많이 사귀었어요.", vietnamese: "Trong lúc sống ở Hàn tôi đã kết bạn được với nhiều bạn Hàn Quốc." },
      { korean: "네가 없는 동안 너무 외로웠어요.", vietnamese: "Trong lúc không có bạn mình đã rất cô đơn." },
      { korean: "저는 너무 긴장해서 발표하는 동안 계속 떨었어요.", vietnamese: "Tôi quá căng thẳng nên đã run liên tục trong khi phát biểu." },
      { korean: "공사를 하는 동안 좀 시끄러울 거예요.", vietnamese: "Trong lúc thi công sẽ hơi ồn." },
      { korean: "친구를 기다리는 동안 책을 읽었어요.", vietnamese: "Tôi đã đọc sách trong khi đợi bạn." },
    ],
    exercises: [
      { question: "나는 방학 ___ 고향에 다녀올 거예요.", options: ["동안", "중에", "때", "동안에"], answer: 0, explanation: "Trong kì nghỉ → 방학 동안." },
      { question: "내가 음식을 만드는 ___ 동생은 잤어요.", options: ["동안", "중에", "때", "동안에"], answer: 0, explanation: "Trong lúc nấu → 만드는 동안." },
      { question: "한국에 사는 ___ 한국 친구를 많이 사귀었어요.", options: ["동안", "중에", "때", "동안에"], answer: 0, explanation: "Trong lúc sống → 사는 동안." },
      { question: "친구를 기다리는 ___ 책을 읽었어요.", options: ["동안", "중에", "때", "동안에"], answer: 0, explanation: "Trong lúc đợi → 기다리는 동안." },
    ],
    commonMistakes: [
      "Nhầm với -때 (-때 = thời điểm, -동안 = khoảng thời gian duy trì).",
      "Nhầm với -중 (-중 = đang làm, -동안 = trong lúc).",
      "Quên chủ ngữ hai vế có thể khác nhau.",
    ],
    tags: ["Thời gian", "Trong lúc", "TOPIK I"],
  },
  {
    id: "topik1-24",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – (으)ㄴ 지",
    meaning: "Đã bao lâu từ khi làm một việc gì đó",
    explanation: "Diễn tả khoảng thời gian đã trải qua sau khi thực hiện một hành động nào đó. Cấu trúc: V – (으)ㄴ 지 + thời gian + 되다/ 안 되다/ 지나다/ 넘다. Chưa được bao lâu: 얼마 안 되다, Được lâu: 오래 되다.",
    formation: "V(nguyên âm/ㄹ) + ㄴ 지 / V(phụ âm) + 은 지",
    notes: [
      "Diễn tả khoảng thời gian đã trải qua.",
      "Kết hợp với thời gian + 되다/지나다/넘다.",
      "Chưa lâu: 얼마 안 되다, lâu: 오래 되다.",
    ],
    examples: [
      { korean: "한국어를 공부한 지 얼마나 됐어요?", vietnamese: "Bạn học tiếng Hàn được bao lâu rồi?" },
      { korean: "여기 산 지 6개월 됐어요.", vietnamese: "Tôi sống ở đây được 6 tháng rồi." },
      { korean: "남자 친구를 헤어진 지 오래 되었어요.", vietnamese: "Tôi chia tay bạn trai lâu rồi." },
      { korean: "이 책은 안 읽은 지 10년도 넘었어요.", vietnamese: "Cũng đã mười năm rồi từ khi tôi đọc cuốn sách này." },
      { korean: "그 사람하고 연락을 안 한 지 5년이 지났어요.", vietnamese: "Đã 5 năm trôi qua từ ngày tôi liên lạc với người đó." },
      { korean: "친구하고 싸운 지 한 달이 넘었어요.", vietnamese: "Đã một tháng trôi qua từ khi tôi đánh nhau với một người bạn." },
      { korean: "민수 씨는 결혼한 지 5 년 넘었습니다.", vietnamese: "Minsoo đã kết hôn được hơn 5 năm rồi." },
      { korean: "담배 끊은 지 한 달 되었어요.", vietnamese: "Tôi bỏ thuốc lá được một tháng rồi." },
    ],
    exercises: [
      { question: "한국어를 공부 ___ 얼마나 됐어요?", options: ["한 지", "한 동안", "하는 중", "하는 때"], answer: 0, explanation: "Đã bao lâu → 공부한 지." },
      { question: "여기 산 ___ 6개월 됐어요.", options: ["지", "동안", "중", "때"], answer: 0, explanation: "Sống được bao lâu → 산 지." },
      { question: "남자 친구를 헤어진 ___ 오래 되었어요.", options: ["지", "동안", "중", "때"], answer: 0, explanation: "Chia tay bao lâu → 헤어진 지." },
      { question: "담배 끊은 ___ 한 달 되었어요.", options: ["지", "동안", "중", "때"], answer: 0, explanation: "Bỏ thuốc bao lâu → 끊은 지." },
    ],
    commonMistakes: [
      "Nhầm với -동안 (-동안 = trong lúc, -ㄴ 지 = đã bao lâu).",
      "Quên kết hợp với thời gian + 되다/지나다.",
      "Dùng -ㄴ 지 với hiện tại (nên dùng quá khứ).",
    ],
    tags: ["Thời gian", "Đã bao lâu", "TOPIK I"],
  },
  {
    id: "topik1-25",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 는 길이다/ 는 길에",
    meaning: "Đang trên đường",
    explanation: "Được sử dụng khi người nói thực hiện một hành động nào đó trong quá trình di chuyển đến đâu đó. Còn được sử dụng dưới hình thức –는 길이다. Chỉ có thể kết hợp với các động từ mang ý nghĩa di chuyển, di động như 가다/오다, 나가다/나오다, 들어가다/들어오다, 돌아가다/돌아오다, 올라가다/올라오다, 내려가다/내려오다, 출근하다/퇴근하다. Khi kết hợp với các động từ hành động, chuyển thành động từ di chuyển qua cấu trúc V + (으)러 가다/오다...",
    formation: "V + 는 길이다 / V + 는 길에",
    notes: [
      "Thực hiện hành động trong quá trình di chuyển.",
      "Chỉ kết hợp với động từ di chuyển.",
      "Động từ hành động → chuyển thành V + (으)러 가다/오다.",
    ],
    examples: [
      { korean: "퇴근하는 길에 지하철에서 갑자기 친구를 만났어요.", vietnamese: "Trên đường tan làm thì tình cờ tôi gặp bạn ở tàu điện ngầm." },
      { korean: "어디 가는 길이에요?", vietnamese: "Bạn đang trên đường đi đâu thế?" },
      { korean: "만나러 가는 길이에요.", vietnamese: "Mình đang trên đường đi gặp người bạn." },
      { korean: "집에 돌아오는 길에 시장에 가서 음식을 사 왔어요.", vietnamese: "Đang trên đường trở về nhà thì tôi đi chợ mua chút đồ ăn." },
      { korean: "밥 먹으러 가는 길이에요.", vietnamese: "Tôi đang trên đường đi ăn cơm." },
      { korean: "제가 지금 집에 가는 길이라서 15 분 후에 다시 전화하면 안 돼요?", vietnamese: "Tôi đang trên đường về nhà nên 15 phút sau gọi điện lại có được không ạ?" },
      { korean: "그냥 지나가는 길에 들렀어요.", vietnamese: "Trên đường đi qua đây tôi ghé vào một chút." },
      { korean: "돈을 찾으러 은행에 가는 길이에요.", vietnamese: "Tôi đang trên đường đến ngân hàng rút tiền." },
    ],
    exercises: [
      { question: "퇴근하는 ___ 지하철에서 갑자기 친구를 만났어요.", options: ["길에", "동안", "중에", "때"], answer: 0, explanation: "Trên đường tan làm → 퇴근하는 길에." },
      { question: "어디 가는 ___?", options: ["길이에요", "동안", "중에", "때"], answer: 0, explanation: "Đang đi đâu → 가는 길이에요." },
      { question: "집에 돌아오는 ___ 시장에 가서 음식을 사 왔어요.", options: ["길에", "동안", "중에", "때"], answer: 0, explanation: "Trên đường về nhà → 돌아오는 길에." },
      { question: "밥 먹으러 가는 ___.", options: ["길이에요", "동안", "중에", "때"], answer: 0, explanation: "Đang đi ăn → 가는 길이에요." },
    ],
    commonMistakes: [
      "Dùng -는 길 với động từ không di chuyển (sai: 공부하는 길 → đúng: 공부하러 가는 길).",
      "Nhầm với -는 동안 (-는 동안 = trong lúc, -는 길 = trên đường).",
      "Quên chuyển động từ hành động thành di chuyển (sai: 먹는 길 → đúng: 먹으러 가는 길).",
    ],
    tags: ["Thời gian", "Trên đường", "TOPIK I"],
  },
  {
    id: "topik1-26",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 는 도중에",
    meaning: "Trong quá trình..., trong lúc...",
    explanation: "Cấu trúc thể hiện việc đang thực hiện hành động nào đó mà vế trước thể hiện hoặc nhân cơ hội đó mà thực hiện hành động sau.",
    formation: "V + 는 도중에",
    notes: [
      "Đang thực hiện hành động thì xảy ra hành động khác.",
      "Nhân cơ hội hành động trước để thực hiện hành động sau.",
    ],
    examples: [
      { korean: "대전에서 서울로 오는 도중에 버스가 고장이 났어요.", vietnamese: "Trong lúc từ Daejon lên Seoul thì xe bus bị hỏng." },
      { korean: "버스를 타기 위해 걸어가는 도중에 우연히 친구를 만났어요.", vietnamese: "Đang đi bộ để lên xe bus thì tình cờ tôi gặp người bạn." },
      { korean: "산 정상으로 오르는 도중에 경치가 좋아 잠시 멈추어 사진을 찍었어요.", vietnamese: "Trong khi đang leo lên đỉnh núi thì vì phong cảnh đẹp nên tôi đã dừng lại chụp ảnh." },
    ],
    exercises: [
      { question: "대전에서 서울로 오는 ___ 버스가 고장이 났어요.", options: ["도중에", "동안", "중에", "길에"], answer: 0, explanation: "Trong quá trình đi → 오는 도중에." },
      { question: "걸어가는 ___ 우연히 친구를 만났어요.", options: ["도중에", "동안", "중에", "길에"], answer: 0, explanation: "Trong quá trình đi bộ → 걸어가는 도중에." },
      { question: "오르는 ___ 경치가 좋아 사진을 찍었어요.", options: ["도중에", "동안", "중에", "길에"], answer: 0, explanation: "Trong quá trình leo → 오르는 도중에." },
      { question: "공부하는 ___ 친구가 왔어요.", options: ["도중에", "동안", "중에", "길에"], answer: 0, explanation: "Trong quá trình học → 공부하는 도중에." },
    ],
    commonMistakes: [
      "Nhầm với -는 동안 (-는 동안 = khoảng thời gian duy trì, -는 도중에 = trong quá trình xảy ra sự việc).",
      "Nhầm với -는 길에 (-는 길에 = trên đường di chuyển, -는 도중에 = trong quá trình bất kỳ).",
      "Quên ý nghĩa nhân cơ hội của -는 도중에.",
    ],
    tags: ["Thời gian", "Trong quá trình", "TOPIK I"],
  },
  {
    id: "topik1-27",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 고 있다",
    meaning: "Đang...",
    explanation: "Cấu trúc thể hiện một hành động hoặc quá trình diễn ra ngay tại thời điểm nói hoặc xung quanh thời điểm nói. Cấu trúc diễn tả thời hiện tại tiếp diễn. Kính ngữ ở dạng 고 계시다. Dạng quá khứ 고 있었다.",
    formation: "V + 고 있다",
    notes: [
      "Hành động diễn ra tại thời điểm nói.",
      "Thời hiện tại tiếp diễn.",
      "Kính ngữ: 고 계시다, quá khứ: 고 있었다.",
    ],
    examples: [
      { korean: "한국에 살고 있어요.", vietnamese: "Tôi đang sống ở Hàn Quốc." },
      { korean: "저는 대학교에 다니고 있어요.", vietnamese: "Tôi đang học đại học." },
      { korean: "한국어를 공부하고 있어요.", vietnamese: "Tôi đang học tiếng Hàn." },
      { korean: "언니는 지금 통화하고 있어요.", vietnamese: "Chị gái đang nghe điện thoại." },
      { korean: "지금 어디에서 살고 있어요?", vietnamese: "Bây giờ bạn đang sống ở đâu?" },
      { korean: "할아버지께서는 책을 읽고 계세요.", vietnamese: "Ông đang đọc sách." },
      { korean: "비가 오고 있어요.", vietnamese: "Trời đang mưa." },
    ],
    exercises: [
      { question: "한국에 살 ___.", options: ["고 있어요", "고 있었어요", "고", "아서"], answer: 0, explanation: "Đang sống → 살고 있어요." },
      { question: "한국어를 공부 ___.", options: ["하고 있어요", "하고 있었어요", "하고", "아서"], answer: 0, explanation: "Đang học → 공부하고 있어요." },
      { question: "언니는 지금 통화 ___.", options: ["하고 있어요", "하고 있었어요", "하고", "아서"], answer: 0, explanation: "Đang nghe điện thoại → 통화하고 있어요." },
      { question: "비가 오 ___.", options: ["고 있어요", "고 있었어요", "고", "아서"], answer: 0, explanation: "Đang mưa → 오고 있어요." },
    ],
    commonMistakes: [
      "Nhầm với -는 중 (-는 trung hạn chế hơn, -고 있다 dùng rộng hơn).",
      "Dùng -고 있다 với hiện tượng tự nhiên (được dùng với -고 있다).",
      "Quên kính ngữ (고 계시다) khi cần.",
    ],
    tags: ["Thời gian", "Đang làm", "TOPIK I"],
  },
  {
    id: "topik1-28",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – 다가",
    meaning: "Đang A thì B",
    explanation: "Diễn tả người nói đang làm gì thì đột nhiên dừng lại và thực hiện hành động khác. Cũng có thể được dùng trong một số trường hợp mà hành động phía trước không bị ngắt quãng mà vẫn được tiếp tục. – 다가 có thể được tỉnh lược thành – 다. Chủ ngữ ở hai vế phải giống nhau. Có thể sử dụng với tính từ khi chung chủ thể và diễn tả trạng thái đột ngột thay đổi. –다가 có thể kết hợp với thì quá khứ ở vế trước thành dạng 았/었/였다가 để thể hiện việc hành động vế trước được hoàn thành.",
    formation: "A/V + 다가",
    notes: [
      "Đang làm gì thì dừng lại làm khác.",
      "Chủ ngữ hai vế phải giống nhau.",
      "Có thể lược bỏ -가 thành -다.",
    ],
    examples: [
      { korean: "영화를 보다가 울었어요.", vietnamese: "Đang xem phim thì tôi khóc." },
      { korean: "숙제를 하다가 잤어요.", vietnamese: "Đang làm bài tập thì ngủ gật." },
      { korean: "비가 오다가 그쳤어요.", vietnamese: "Trời đang mưa bỗng dưng tạnh." },
      { korean: "날씨가 맑다가 갑자기 흐려졌어요.", vietnamese: "Trời đang trong xanh đột nhiên trở nên âm u." },
      { korean: "설거지를 하다가 접시를 깨뜨렸어요.", vietnamese: "Tôi đang rửa chén thì làm vỡ cái đĩa." },
      { korean: "버스에서 내리다가 돈지갑을 잃어버렸습니다.", vietnamese: "Tôi xuống xe buýt thì đánh mất ví tiền." },
    ],
    exercises: [
      { question: "영화를 보 ___ 울었어요.", options: ["다가", "다", "고", "아서"], answer: 0, explanation: "Đang xem thì khóc → 보다가." },
      { question: "숙제를 하 ___ 잤어요.", options: ["다가", "다", "고", "아서"], answer: 0, explanation: "Đang làm thì ngủ → 하다가." },
      { question: "비가 오 ___ 그쳤어요.", options: ["다가", "다", "고", "아서"], answer: 0, explanation: "Đang mưa thì tạnh → 오다가." },
      { question: "설거지를 하 ___ 접시를 깨뜨렸어요.", options: ["다가", "다", "고", "아서"], answer: 0, explanation: "Đang rửa thì vỡ → 하다가." },
    ],
    commonMistakes: [
      "Chủ ngữ hai vế khác nhau (sai: 제가 보다가 친구가 왔어요 → sai).",
      "Nhầm với -고 (-고 = liệt kê, -다가 = đang làm thì dừng).",
      "Quên ý nghĩa đột ngột thay đổi của -다가.",
    ],
    tags: ["Thời gian", "Đang làm thì", "TOPIK I"],
  },
  {
    id: "topik1-29",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – (으)ㄹ 수 있다/ 없다",
    meaning: "Có thể..., không thể...",
    explanation: "Diễn tả việc có năng lực làm một việc nào đó hoặc diễn tả một sự việc nào đó có khả năng xảy ra. Dạng nhấn mạnh là (으)ㄹ 수가 있다/없다.",
    formation: "V(nguyên âm/ㄹ) + ㄹ 수 있다/없다 / V(phụ âm) + 을 수 있다/없다",
    notes: [
      "Diễn tả năng lực làm việc.",
      "Diễn tả khả năng xảy ra.",
      "Dạng nhấn mạnh: (으)ㄹ 수가 있다/없다.",
    ],
    examples: [
      { korean: "저는 피아노를 칠 수 있어요.", vietnamese: "Tôi có thể chơi piano." },
      { korean: "주말이라서 영화관에 사람들이 많을 수 있으니 미리 예매를 하세요.", vietnamese: "Vì là cuối tuần nên rạp chiếu phim có thể sẽ đông người nên hãy đặt vé trước đi nhé." },
      { korean: "이번 주 금요일에 같이 벚꽃 보러 갈 수 있어요?", vietnamese: "Thứ 6 tuần này chúng ta có thể cùng nhau đi ngắm hoa anh đào không?" },
      { korean: "이따가 점심을 같이 먹을 수 있어요?", vietnamese: "Lát nữa chúng ta có thể cùng nhau ăn trưa không?" },
      { korean: "내일 비가 올 수도 있어요.", vietnamese: "Ngày mai trời cũng có thể sẽ mưa." },
      { korean: "저는 요리할 수 없어요.", vietnamese: "Tôi không thể nấu ăn." },
      { korean: "저는 오토바이를 탈 수가 없어요.", vietnamese: "Tôi không thể lái xe máy." },
      { korean: "저는 술을 마실 수 없어요.", vietnamese: "Tôi không thể uống rượu." },
    ],
    exercises: [
      { question: "저는 피아노를 칠 ___ 있어요.", options: ["수", "수가", "줄", "것"], answer: 0, explanation: "Có thể → 칠 수 있어요." },
      { question: "저는 요리할 ___ 없어요.", options: ["수", "수가", "줄", "것"], answer: 0, explanation: "Không thể → 요리할 수 없어요." },
      { question: "내일 비가 올 ___ 있어요.", options: ["수도", "수", "줄", "것"], answer: 0, explanation: "Có thể sẽ → 올 수도 있어요." },
      { question: "저는 오토바이를 탈 ___ 없어요.", options: ["수가", "수", "줄", "것"], answer: 0, explanation: "Không thể (nhấn mạnh) → 탈 수가 없어요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄹ 줄 알다/모르다 (수 = khả năng, 줄 = biết cách).",
      "Quên (으)ㄹ với động từ phụ âm (sai: 갈 수 → đúng: 갈 수 là đúng, 먹을 수).",
      "Dùng -수 với tình huống không thể xảy ra.",
    ],
    tags: ["Khả năng", "Có thể", "TOPIK I"],
  },
  {
    id: "topik1-30",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V - (으)ㄹ 줄 알다/ 모르다",
    meaning: "Biết cách, không biết cách làm gì đó",
    explanation: "Thể hiện chủ thể biết/không biết phương pháp làm gì đó, có/không có năng lực làm gì. Phân biệt với (으)ㄹ 수 있다/없다: (으)ㄹ 줄 = biết cách/phương pháp, (으)ㄹ 수 = khả năng/tình huống cho phép.",
    formation: "V(nguyên âm/ㄹ) + ㄹ 줄 알다/모르다 / V(phụ âm) + 을 줄 알다/모르다",
    notes: [
      "Biết/không biết phương pháp làm.",
      "Có/không có năng lực làm.",
      "Khác với -수 (khả năng).",
    ],
    comparison: {
      title: "Phân biệt – (으)ㄹ 줄 알다/ 모르다 và – (으)ㄹ 수 있다/ 없다",
      headers: ["– (으)ㄹ 줄 알다/ 모르다", "– (으)ㄹ 수 있다/ 없다"],
      rows: [
        ["Diễn tả ai đó biết cách hoặc có năng lực làm gì", "Diễn tả khả năng biết/ không biết làm gì"],
        ["Không dùng khi muốn diễn đạt khả năng", "Diễn tả tình huống cho phép/ không cho phép làm như vậy"],
      ],
    },
    examples: [
      { korean: "저는 한국에 처음 올 때 한국말을 할 줄 몰랐어요.", vietnamese: "Lúc đến Hàn Quốc lần đầu tiên, tôi đã không biết tiếng Hàn." },
      { korean: "저는 운전을 할 줄 몰라요.", vietnamese: "Tôi không biết cách lái xe." },
      { korean: "요리할 줄 알아요?", vietnamese: "Bạn có biết nấu ăn không?" },
      { korean: "저는 김밥을 만들 줄 알아요.", vietnamese: "Tôi biết cách làm kimbap." },
      { korean: "휴대전화를 쓸 줄 알아요?", vietnamese: "Bạn có biết cách dùng điện thoại không?" },
    ],
    exercises: [
      { question: "저는 운전을 할 ___ 몰라요.", options: ["줄", "수", "것", "방법"], answer: 0, explanation: "Không biết cách → 할 줄 몰라요." },
      { question: "요리할 ___ 알아요?", options: ["줄", "수", "것", "방법"], answer: 0, explanation: "Biết cách → 요리할 줄 알아요?" },
      { question: "저는 김밥을 만들 ___ 알아요.", options: ["줄", "수", "것", "방법"], answer: 0, explanation: "Biết cách → 만들 줄 알아요." },
      { question: "휴대전화를 쓸 ___ 알아요?", options: ["줄", "수", "것", "방법"], answer: 0, explanation: "Biết cách → 쓸 줄 알아요?" },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄹ 수 있다/없다 (줄 = biết cách, 수 = khả năng).",
      "Quên (으)ㄹ với động từ phụ âm (sai: 갈 줄 → đúng: 갈 줄 là đúng, 먹을 줄).",
      "Dùng -줄 với tình huống cho phép (nên dùng -수).",
    ],
    tags: ["Khả năng", "Biết cách", "TOPIK I"],
  },
  {
    id: "topik1-31",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – (으)세요. / (으)십시오",
    meaning: "Hãy, vui lòng",
    explanation: "Dùng để yêu cầu người nghe làm gì một cách lịch sự, câu MỆNH LỆNH. Hình thức tôn kính là – (으)십시오. Một số động từ chuyển đổi đặc biệt: 먹다/마시다 → 드세요, 자다 → 주무세요, 있다 → 계세요, 주다 → 주세요/드리세요. Một số tính từ kết thúc bằng 하다 có thể sử dụng cố định với – (으)세요 như 건강하다, 행복하다...",
    formation: "V + (으)세요 / (으)십시오",
    notes: [
      "Yêu cầu lịch sự, câu mệnh lệnh.",
      "Hình thức tôn kính: (으)십시오.",
      "Động từ đặc biệt: 먹다→드세요, 자다→주무세요, 있다→계세요.",
    ],
    examples: [
      { korean: "민규 씨, 결혼 축하해요. 행복하세요.", vietnamese: "Minkyu, chúc mừng kết hôn nhé. Hãy thật hạnh phúc nhé." },
      { korean: "여기 앉으세요.", vietnamese: "Xin vui lòng ngồi ở đây." },
      { korean: "맛있게 드세요.", vietnamese: "Hãy ăn thật ngon miệng nhé." },
      { korean: "잠깐만 기다리세요.", vietnamese: "Vui lòng đợi một chút nhé." },
      { korean: "조용히 하십시오.", vietnamese: "Xin vui lòng giữ trật tự." },
      { korean: "기대지 마십시오.", vietnamese: "Xin vui lòng không dựa vào." },
    ],
    exercises: [
      { question: "여기 ___.", options: ["앉으세요", "앉어요", "앉고", "앉으십시오"], answer: 0, explanation: "Yêu cầu lịch sự → 앉으세요." },
      { question: "맛있게 ___.", options: ["드세요", "먹으세요", "먹어요", "드십시오"], answer: 0, explanation: "Ăn → 드세요 (động từ đặc biệt)." },
      { question: "잠깐만 ___.", options: ["기다리세요", "기다려요", "기다리고", "기다리십시오"], answer: 0, explanation: "Đợi → 기다리세요." },
      { question: "조용히 ___.", options: ["하십시오", "하세요", "해요", "하고"], answer: 0, explanation: "Giữ trật tự (tôn kính) → 하십시오." },
    ],
    commonMistakes: [
      "Quên chuyển đổi động từ đặc biệt (sai: 먹으세요 → đúng: 드세요).",
      "Dùng -아/어 thay vì -(으)세요 trong văn lịch sự.",
      "Quên hình thức tôn kính (으)십시오 khi cần.",
    ],
    tags: ["Cầu khiến", "Lịch sự", "TOPIK I"],
  },
  {
    id: "topik1-32",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 지 말다: 지 마세요. / 지 맙시다",
    meaning: "Đừng...",
    explanation: "Yêu cầu, khuyên bảo người nghe không làm gì. Là dạng 지 말다 + (으)세요. Rủ rê, cầu khiến người khác đừng làm gì với mình: 지 맙시다. Ở dạng 반말 là 지 마, tuỳ theo hoàn cảnh có thể là câu mệnh lệnh, cầu khiến. Hình thức tôn kính là – 지 마십시오.",
    formation: "V + 지 마세요 / 지 맙시다 / 지 마 / 지 마십시오",
    notes: [
      "Yêu cầu không làm gì.",
      "Rủ rê cùng: 지 맙시다.",
      "Dạng tôn kính: 지 마십시오.",
    ],
    examples: [
      { korean: "수업 시간에 자지 마세요.", vietnamese: "Đừng ngủ trong giờ học." },
      { korean: "살을 빼고 싶으면 피자를 먹지 마세요.", vietnamese: "Nếu muốn giảm cân thì đừng ăn pizza." },
      { korean: "우리 담배를 피우지 맙시다.", vietnamese: "Chúng ta hãy đừng hút thuốc lá." },
      { korean: "시험이 쉬우니까 걱정하지 마세요.", vietnamese: "Vì bài thi dễ nên đừng lo lắng." },
      { korean: "도서관이니까 떠들지 맙시다.", vietnamese: "Vì là thư viện nên chúng ta hãy đừng làm ồn nhé." },
      { korean: "의자가 더러워요. 여기에 앉지 마세요.", vietnamese: "Ghế bẩn đấy. Anh đừng ngồi ở đây nhé." },
    ],
    exercises: [
      { question: "수업 시간에 자지 ___.", options: ["마세요", "말세요", "마", "마십시오"], answer: 0, explanation: "Đừng ngủ → 자지 마세요." },
      { question: "피자를 먹지 ___.", options: ["마세요", "말세요", "마", "마십시오"], answer: 0, explanation: "Đừng ăn → 먹지 마세요." },
      { question: "우리 담배를 피우지 ___.", options: ["맙시다", "마세요", "마", "마십시오"], answer: 0, explanation: "Chúng ta đừng → 피우지 맙시다." },
      { question: "걱정하지 ___.", options: ["마세요", "말세요", "마", "마십시오"], answer: 0, explanation: "Đừng lo → 걱정하지 마세요." },
    ],
    commonMistakes: [
      "Nhầm với -지 않다 (không làm) vs -지 말다 (đừng làm).",
      "Quên dùng -맙시다 khi rủ rê cùng.",
      "Dùng -마 trong văn lịch sự (nên dùng -마세요).",
    ],
    tags: ["Cầu khiến", "Đừng", "TOPIK I"],
  },
  {
    id: "topik1-33",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 아/어야 되다 / 하다",
    meaning: "Phải...",
    explanation: "Diễn tả hành động phải làm gì đó. Văn nói có thể dùng 아/어야 되다 / 하다 còn văn viết chỉ dùng 아/어야 하다. Hình thức quá khứ: – 았/었어야 되다 / 하다: đã phải làm gì đó.",
    formation: "V + 아/어야 되다 / 하다",
    notes: [
      "Hành động phải làm.",
      "Văn nói: 되다/하다, văn viết: 하다.",
      "Quá khứ: 았/었어야 되다/하다.",
    ],
    examples: [
      { korean: "식사하기 전에 손을 씻어야 해요.", vietnamese: "Phải rửa tay trước khi ăn." },
      { korean: "오늘은 고향에 가야 해요.", vietnamese: "Hôm nay tôi phải về quê." },
      { korean: "저녁에 숙제를 해야 돼요.", vietnamese: "Buổi tối tôi phải làm bài tập." },
      { korean: "교통 규칙을 잘 지켜야 해요.", vietnamese: "Phải tuân thủ quy tắc giao thông." },
      { korean: "학생은 열심히 공부해야 합니다.", vietnamese: "Học sinh phải học hành chăm chỉ." },
      { korean: "버스는 3 시에 출발해야 합니다.", vietnamese: "Xe bus phải xuất phát lúc 3 giờ." },
      { korean: "가수는 목소리가 좋아야 합니다.", vietnamese: "Ca sĩ thì giọng phải tốt." },
    ],
    exercises: [
      { question: "식사하기 전에 손을 씻어야 ___.", options: ["해요", "돼요", "되다", "한다"], answer: 0, explanation: "Phải → 씻어야 해요." },
      { question: "오늘은 고향에 가야 ___.", options: ["해요", "돼요", "되다", "한다"], answer: 0, explanation: "Phải → 가야 해요." },
      { question: "저녁에 숙제를 해야 ___.", options: ["돼요", "해요", "되다", "한다"], answer: 0, explanation: "Phải → 해야 돼요." },
      { question: "학생은 열심히 공부해야 ___.", options: ["합니다", "해요", "돼요", "되다"], answer: 0, explanation: "Phải (văn viết) → 공부해야 합니다." },
    ],
    commonMistakes: [
      "Nhầm với -아/어서 (nguyên nhân kết quả) vs -아/어야 (phải).",
      "Dùng -되다 trong văn viết (nên dùng -하다).",
      "Quên ý nghĩa bắt buộc của -아/어야.",
    ],
    tags: ["Nghĩa vụ", "Phải", "TOPIK I"],
  },
  {
    id: "topik1-34",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A V – 아/어도 되다",
    meaning: "Được phép làm gì đó",
    explanation: "Diễn tả sự cho phép hoặc chấp thuận hành động nào đó. Khi hỏi 아/어도 되다, nếu đồng ý dùng 아/어도 되다, còn nếu không được phép dùng cấu trúc (으)면 안 되다, không được phép dùng cấu trúc 아/어도 안 되다. 아/어도 괜찮다 và – 아/어도 좋다 có nghĩa tương tự – 아/어도 되다.",
    formation: "V + 아/어도 되다",
    notes: [
      "Cho phép hoặc chấp thuận hành động.",
      "Không được phép: (으)면 안 되다.",
      "Tương tự: 아/어도 괜찮다, 아/어도 좋다.",
    ],
    examples: [
      { korean: "에어컨을 켜도 돼요? 네, 켜도 돼요.", vietnamese: "Tôi bật điều hòa được không? Vâng, được ạ." },
      { korean: "기숙사에서 요리해도 돼요? 아니요, 하면 안 돼요.", vietnamese: "Có được nấu ăn ở kí túc xá không ạ? Không, không được đâu." },
      { korean: "엄마, 이 약을 먹어도 돼요? 아니요, 먹으면 안 돼요.", vietnamese: "Mẹ, con uống thuốc này được không ạ? Không, không được đâu." },
      { korean: "창문을 열어도 돼요? 그럼요. 열어도 돼요.", vietnamese: "Tôi mở cửa sổ nhé? Vâng, bạn mở đi." },
      { korean: "여기에 앉아도 돼요?", vietnamese: "Tôi ngồi ở đây được chứ?" },
      { korean: "사진을 찍어도 돼요?", vietnamese: "Tôi chụp ảnh được chứ?" },
    ],
    exercises: [
      { question: "에어컨을 켜도 ___.", options: ["돼요", "되다", "좋다", "괜찮다"], answer: 0, explanation: "Được phép → 켜도 돼요." },
      { question: "기숙사에서 요리해도 ___.", options: ["돼요", "되다", "좋다", "괜찮다"], answer: 0, explanation: "Được phép → 요리해도 돼요." },
      { question: "창문을 열어도 ___.", options: ["돼요", "되다", "좋다", "괜찮다"], answer: 0, explanation: "Được phép → 열어도 돼요." },
      { question: "사진을 찍어도 ___.", options: ["돼요", "되다", "좋다", "괜찮다"], answer: 0, explanation: "Được phép → 찍어도 돼요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)면 안 되다 (không được phép).",
      "Quên ý nghĩa cho phép của -아/어도 되다.",
      "Dùng -아/어도 안 되as (không chuẩn, nên dùng -(으)면 안 되다).",
    ],
    tags: ["Cho phép", "Được", "TOPIK I"],
  },
  {
    id: "topik1-35",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – (으)면 안 되다",
    meaning: "Không được",
    explanation: "Cấm đoán, ngăn cấm ai đó không được phép làm một việc gì đó. Hình thức phủ định của – (으)면 안 되다 là – 지 않으면 안 되다 (nhấn mạnh hành vi cần phải làm).",
    formation: "A/V + (으)면 안 되다",
    notes: [
      "Cấm đoán, ngăn cấm.",
      "Phủ định nhấn mạnh: 지 않으면 안 되다.",
    ],
    examples: [
      { korean: "지금 길을 건너면 안 돼요.", vietnamese: "Bây giờ không được qua đường." },
      { korean: "여기 앉으면 안 돼요.", vietnamese: "Không được ngồi ở đây." },
      { korean: "기숙사에서 요리하면 안 돼요.", vietnamese: "Không được nấu ăn trong kí túc xá." },
      { korean: "여기 담배를 피우면 안 돼요.", vietnamese: "Không được hút thuốc lá ở đây." },
      { korean: "뜨거우니까 만지면 안 돼요.", vietnamese: "Vì nóng nên không được chạm vào." },
      { korean: "숙제를 하지 않으면 안 돼요.", vietnamese: "Nếu không làm bài tập là không được." },
    ],
    exercises: [
      { question: "지금 길을 건너면 안 ___.", options: ["돼요", "되다", "좋다", "괜찮다"], answer: 0, explanation: "Không được → 건너면 안 돼요." },
      { question: "여기 앉으면 안 ___.", options: ["돼요", "되다", "좋다", "괜찮다"], answer: 0, explanation: "Không được → 앉으면 안 돼요." },
      { question: "기숙사에서 요리하면 안 ___.", options: ["돼요", "되다", "좋다", "괜찮다"], answer: 0, explanation: "Không được → 요리하면 안 돼요." },
      { question: "여기 담배를 피우면 안 ___.", options: ["돼요", "되다", "좋다", "괜찮다"], answer: 0, explanation: "Không được → 피우면 안 돼요." },
    ],
    commonMistakes: [
      "Nhầm với -아/어도 되다 (được phép).",
      "Quên ý nghĩa cấm đoán của -(으)면 안 되다.",
      "Dùng -(으)면 không được (không chuẩn, nên dùng -(으)면 안 되다).",
    ],
    tags: ["Cấm", "Không được", "TOPIK I"],
  },
  {
    id: "topik1-36",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – 지 않아도 되다. (안 A/V – 아 /어도 되다)",
    meaning: "Không cần ... cũng được",
    explanation: "Diễn tả không cần thiết phải làm hành động nào đó. Là hình thức phủ định của – 아/어야 되다 / 하다.",
    formation: "A/V + 지 않아도 되다 / 안 A/V + 아/어도 되다",
    notes: [
      "Không cần thiết phải làm.",
      "Phủ định của -아/어야 되다/하다.",
    ],
    examples: [
      { korean: "금요일에는 교복을 안 입어도 돼요.", vietnamese: "Vào thứ 6 không mặc đồng phục cũng được." },
      { korean: "평일이니까 영화 표를 미리 사지 않아도 돼요.", vietnamese: "Vì là ngày trong tuần nên không mua vé xem phim trước cũng được." },
      { korean: "숙제를 하지 않아도 괜찮아요.", vietnamese: "Không làm bài tập cũng được." },
      { korean: "오늘 회사에 꼭 가야 돼요?", vietnamese: "Hôm nay nhất định phải đến công ty sao?" },
      { korean: "바쁘면 안 가도 돼요.", vietnamese: "Nếu bận thì không đến cũng được." },
    ],
    exercises: [
      { question: "금요일에는 교복을 안 입어도 ___.", options: ["돼요", "되다", "좋다", "괜찮다"], answer: 0, explanation: "Không cần cũng được → 안 입어도 돼요." },
      { question: "영화 표를 미리 사지 않아도 ___.", options: ["돼요", "되다", "좋다", "괜찮다"], answer: 0, explanation: "Không cần cũng được → 사지 않아도 돼요." },
      { question: "숙제를 하지 않아도 ___.", options: ["괜찮아요", "돼요", "되다", "좋다"], answer: 0, explanation: "Không cần cũng được → 하지 않아도 괜찮아요." },
      { question: "바쁘면 안 가도 ___.", options: ["돼요", "되다", "좋다", "괜찮다"], answer: 0, explanation: "Không cần cũng được → 안 가도 돼요." },
    ],
    commonMistakes: [
      "Nhầm với -아/어야 되다 (phải làm).",
      "Quên ý nghĩa không cần thiết của -지 않아도 되다.",
      "Dùng -안 A/V - 아/어도 (có thể dùng nhưng -지 않아도 phổ biến hơn).",
    ],
    tags: ["Không cần", "Không bắt buộc", "TOPIK I"],
  },
  {
    id: "topik1-37",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – (으)ㄹ까요?",
    meaning: "Tôi làm... nhé? / (chúng mình)... nhé? / nhỉ?",
    explanation: "Nghĩa 1: Gợi ý, hỏi ý kiến của người nghe về việc mình định làm. Chủ ngữ thông thường là 제가/내가 có thể được tỉnh lược. Nghĩa 2: Người nói muốn rủ người nghe cùng làm gì đó. Chủ ngữ는 우리 thường được tỉnh lược. Nghĩa 3: Được sử dụng cho câu hỏi, suy nghĩ hay suy đoán về đối tượng ngôi số 3.",
    formation: "A/V + (으)ㄹ까요?",
    notes: [
      "Gợi ý, hỏi ý kiến (chủ ngữ: 제가/내가).",
      "Rủ người nghe cùng làm (chủ ngữ: 우리).",
      "Câu hỏi, suy đoán (ngôi thứ 3).",
    ],
    examples: [
      { korean: "저는 어디에 앉을까요?", vietnamese: "Tôi ngồi ở đâu nhỉ?" },
      { korean: "오늘 저녁에 우리 같이 먹을까요?", vietnamese: "Tối nay chúng mình cùng ăn tối nhé?" },
      { korean: "요즘 꽃이 비쌀까요?", vietnamese: "Dạo này hoa đắt nhỉ?" },
      { korean: "김 선생님께서는 b现在 chắc đang ở trường đấy nhỉ?", vietnamese: "Cô Kim chắc đang ở trường đấy nhỉ?" },
      { korean: "문을 열어도 될까요?", vietnamese: "Tôi mở cửa nhé?" },
      { korean: "케이크를 좀 드실까요?", vietnamese: "Bạn ăn chút bánh kem nhé?" },
    ],
    exercises: [
      { question: "저는 어디에 앉___.", options: ["을까요?", "을까", "을까요", "을까"], answer: 0, explanation: "Tôi ngồi đâu nhỉ → 앉을까요?" },
      { question: "오늘 저녁에 우리 같이 먹___.", options: ["을까요?", "을까", "을까요", "을까"], answer: 0, explanation: "Chúng mình cùng ăn → 먹을까요?" },
      { question: "요즘 꽃이 비쌀___.", options: ["까요?", "까", "까요", "까"], answer: 0, explanation: "Hoa đắt nhỉ → 비쌀까요?" },
      { question: "문을 열어도 될___.", options: ["까요?", "까", "까요", "까"], answer: 0, explanation: "Mở cửa nhé → 열어도 될까요?" },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㅂ시다 (cầu khiến cùng làm).",
      "Quên chủ ngữ bị lược trong -(으)ㄹ까요.",
      "Nhầm ý nghĩa gợi ý vs rủ rê.",
    ],
    tags: ["Gợi ý", "Rủ rê", "TOPIK I"],
  },
  {
    id: "topik1-38",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – (으) ㅂ시다",
    meaning: "Hãy cùng, Chúng ta cùng",
    explanation: "Gợi ý hoặc đề nghị người nghe cùng làm gì, CÂU CẦU KHIẾN. Lưu ý: 아/어요 cũng có thể là dạng câu cầu khiến, khi đó thêm 함께/같이. Sử dụng khi người nói gợi ý một tập thể làm gì đó hoặc khi người nghe ít tuổi hơn hoặc có địa vị thấp hơn người nói. Không nên sử dụng với người lớn tuổi hoặc người có địa vị cao hơn. Khi đề xuất đừng làm gì đó: – 지 맙시다 hoặc – 지 마요.",
    formation: "V + (으)ㅂ시다",
    notes: [
      "Gợi ý, đề nghị cùng làm.",
      "Dùng với người nghe ít tuổi hoặc địa vị thấp hơn.",
      "Đừng làm: 지 맙시다 hoặc 지 마요.",
    ],
    examples: [
      { korean: "지하철을 탑시다.", vietnamese: "Chúng ta cùng đi tàu điện ngầm đi." },
      { korean: "김치를 만듭시다.", vietnamese: "Hãy cùng làm kimchi đi." },
      { korean: "우리 같이 비빔밥 먹읍시다.", vietnamese: "Chúng ta cùng ăn cơm trộn đi." },
      { korean: "도서관에서 한국어 숙제를 합시다.", vietnamese: "Chúng ta cùng làm bài tập tiếng Hàn ở thư viện đi." },
      { korean: "제주도를 여행합시다.", vietnamese: "Chúng ta cùng đi du lịch đảo Jeju đi." },
    ],
    exercises: [
      { question: "지하철을 탑___.", options: ["시다", "읍시다", "ㅂ시다", "습니다"], answer: 0, explanation: "Cùng đi tàu → 탑시다." },
      { question: "김치를 만듭___.", options: ["시다", "읍시다", "ㅂ시다", "습니다"], answer: 0, explanation: "Cùng làm kimchi → 만듭시다." },
      { question: "우리 같이 비빔밥 먹읍___.", options: ["시다", "읍시다", "ㅂ시다", "습니다"], answer: 0, explanation: "Cùng ăn cơm trộn → 먹읍시다." },
      { question: "제주도를 여행합___.", options: ["시다", "읍시다", "ㅂ시다", "습니다"], answer: 0, explanation: "Cùng đi du lịch → 여행합시다." },
    ],
    commonMistakes: [
      "Dùng với người lớn tuổi hoặc địa vị cao hơn (không nên).",
      "Nhầm với -(으)ㄹ까요 (gợi ý hỏi ý kiến).",
      "Quên ý nghĩa cầu khiến cùng làm của -(으)ㅂ시다.",
    ],
    tags: ["Cầu khiến", "Cùng làm", "TOPIK I"],
  },
  {
    id: "topik1-39",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – (으) 시겠어요?",
    meaning: "Bạn sẽ ...chứ ạ?",
    explanation: "Gợi ý người nghe hoặc hỏi ý kiến, dự định của người nghe một cách lịch sự. Lịch sự và trang trọng hơn – (으)ㄹ래요? / – (으)실래요?",
    formation: "V + (으)시겠어요?",
    notes: [
      "Gợi ý hoặc hỏi ý kiến lịch sự.",
      "Trang trọng hơn -(으)ㄹ래요.",
    ],
    examples: [
      { korean: "내일 몇 시에 오시겠어요?", vietnamese: "Ngày mai mấy giờ bạn đến thế ạ?" },
      { korean: "커피에 설탕을 넣으시겠어요?", vietnamese: "Bạn có muốn cho chút đường vào cà phê không ạ?" },
      { korean: "물을 좀 드시겠어요?", vietnamese: "Bạn uống một chút nước nhé ạ?" },
      { korean: "방을 예약하시겠어요?", vietnamese: "Quý khách đặt phòng ạ?" },
      { korean: "잠깐만 기다리시겠어요?", vietnamese: "Bạn đợi một chút được không ạ?" },
    ],
    exercises: [
      { question: "내일 몇 시에 오시___.", options: ["겠어요?", "을래요?", "실래요?", "까요?"], answer: 0, explanation: "Bạn sẽ đến ạ → 오시겠어요?" },
      { question: "물을 좀 드시___.", options: ["겠어요?", "을래요?", "실래요?", "까요?"], answer: 0, explanation: "Bạn uống ạ → 드시겠어요?" },
      { question: "방을 예약하시___.", options: ["겠어요?", "을래요?", "실래요?", "까요?"], answer: 0, explanation: "Đặt phòng ạ → 예약하시겠어요?" },
      { question: "잠깐만 기다리시___.", options: ["겠어요?", "을래요?", "실래요?", "까요?"], answer: 0, explanation: "Đợi ạ → 기다리시겠어요?" },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄹ래요 (thân mật hơn).",
      "Quên ý nghĩa lịch sự của -(으)시겠어요.",
      "Dùng với người thân thiết (nên dùng -(으)ㄹ래요).",
    ],
    tags: ["Gợi ý", "Lịch sự", "TOPIK I"],
  },
  {
    id: "topik1-40",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – (으)ㄹ래요?",
    meaning: "Bạn sẽ...? tôi sẽ... / Cùng... nhé?",
    explanation: "1. Hỏi ý định người nghe hoặc 2. khi muốn đề nghị người nghe một cách nhẹ nhàng. Được sử dụng nhiều trong văn nói giữa những người bạn thân thiết, ý nghĩa 2 là câu cầu khiến. Có thể sử dụng –지 않을래요? (안 –(으)ㄹ래요?) thay cho (으)ㄹ래요? vì có cùng ý nghĩa mặc dù ở hình thức phủ định. Nếu người nói có mối quan hệ thân mật với người nghe nhưng vẫn muốn thể hiện tôn kính thì sử dụng –(으)실래요?. Để đáp lại, trả lời dưới dạng (으)ㄹ래요 hoặc (으)ㄹ게요.",
    formation: "V + (으)ㄹ래요?",
    notes: [
      "Hỏi ý định hoặc đề nghị nhẹ nhàng.",
      "Dùng giữa người thân thiết.",
      "Trả lời: (으)ㄹ래요 hoặc (으)ㄹ게요.",
    ],
    examples: [
      { korean: "선미 씨는 뭐 먹을래요?", vietnamese: "Seonmi, cậu sẽ ăn gì thế?" },
      { korean: "저는 갈비탕을 먹을래요.", vietnamese: "Tôi sẽ ăn canh xương bò hầm." },
      { korean: "유키 씨, 우리 시험 끝나고 뭐 할래요?", vietnamese: "Yuki, thi xong chúng ta sẽ làm gì nhỉ?" },
      { korean: "이번 주말에 부산에 가려고 하는데 같이 갈래요?", vietnamese: "Cuối tuần này tôi định đi Busan, bạn có muốn đi cùng không?" },
      { korean: "라면을 끓였는데 먹을래요?", vietnamese: "Tôi đã nấu mì rồi, bạn có muốn ăn không?" },
      { korean: "여기에 앉으실래요?", vietnamese: "Bạn muốn ngồi ở đây không?" },
    ],
    exercises: [
      { question: "선미 씨는 뭐 먹___.", options: ["을래요?", "을까요?", "을래", "을게요"], answer: 0, explanation: "Sẽ ăn gì → 먹을래요?" },
      { question: "저는 갈비탕을 먹___.", options: ["을래요.", "을까요?", "을래", "을게요"], answer: 0, explanation: "Sẽ ăn → 먹을래요." },
      { question: "우리 시험 끝나고 뭐 할___.", options: ["을래요?", "을까요?", "을래", "을게요"], answer: 0, explanation: "Sẽ làm gì → 할래요?" },
      { question: "같이 갈___.", options: ["을래요?", "을까요?", "을래", "을게요"], answer: 0, explanation: "Đi cùng → 갈래요?" },
    ],
    commonMistakes: [
      "Nhầm với -(으)시겠어요 (lịch sự hơn).",
      "Quên ý nghĩa đề nghị nhẹ nhàng của -(으)ㄹ래요.",
      "Dùng -(으)실래요 khi thân thiết (không cần).",
    ],
    tags: ["Gợi ý", "Thân mật", "TOPIK I"],
  },
  {
    id: "topik1-41",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 고 싶다",
    meaning: "Muốn...",
    explanation: "Trong câu trần thuật, thể hiện thứ mà người nói muốn. Còn trong câu nghi vấn, dùng để hỏi thứ mà người nghe muốn. Trường hợp dùng với ngôi thứ 3 (là một người khác được nhắc đến) thì cả trong câu hỏi hay câu tường thuật đều dùng dạng – 고 싶어 하다. Quá khứ: – 고 싶었다, tương lai/ phỏng đoán: – 고 싶겠다 hoặc – 고 싶을 것이다. A – 고 싶다 (X) => A+ 아/어/여지다 – 고 싶다 (O). Với trường hợp của 보고 싶다, nếu chủ ngữ는 나(저), 우리 và nó mang ý nghĩa của 그립다 (nhớ, thương nhớ, mong đợi, không phải là ý nghĩa xem, nhìn) thì cần dùng ở dạng 이/가 보고 싶다.",
    formation: "V + 고 싶다",
    notes: [
      "Thể hiện thứ người nói muốn.",
      "Ngôi thứ 3: 고 싶어 하다.",
      "Quá khứ: 고 싶었다, tương lai: 고 싶겠다.",
    ],
    examples: [
      { korean: "저는 돌아가신 엄마가 보고 싶어요.", vietnamese: "Tôi nhớ người mẹ đã khuất." },
      { korean: "예뻐지고 싶어요.", vietnamese: "Tôi muốn trở nên xinh đẹp." },
      { korean: "냉면을 먹고 싶어요.", vietnamese: "Tôi muốn ăn mì lạnh." },
      { korean: "흐엉 씨는 한국어를 배우고 싶어해요.", vietnamese: "Hương muốn học tiếng Hàn." },
      { korean: "저는 빨리 집에 가고 싶어요.", vietnamese: "Tôi muốn đi về nhà thật nhanh." },
      { korean: "저는 시험에서 일등을 하고 싶어요.", vietnamese: "Tôi muốn đứng thứ nhất trong kì thi." },
      { korean: "동생은 피자를 먹고 싶어해요.", vietnamese: "Em tôi muốn ăn pizza." },
    ],
    exercises: [
      { question: "냉면을 먹고 싶___.", options: ["어요.", "어해요.", "습니다.", "습니다."], answer: 0, explanation: "Muốn ăn → 먹고 싶어요." },
      { question: "저는 빨리 집에 가고 싶___.", options: ["어요.", "어해요.", "습니다.", "습니다."], answer: 0, explanation: "Muốn về → 가고 싶어요." },
      { question: "흐엉 씨는 한국어를 배우고 싶어___.", options: ["해요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Ngôi thứ 3 → 배우고 싶어해요." },
      { question: "동생은 피자를 먹고 싶어___.", options: ["해요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Ngôi thứ 3 → 먹고 싶어해요." },
    ],
    commonMistakes: [
      "Dùng A – 고 싶다 (sai) → A+아/어/여지다 – 고 싶다 (đúng).",
      "Quên dùng 고 싶어 하다 với ngôi thứ 3.",
      "Nhầm ý nghĩa 보고 싶다 (nhớ vs xem).",
    ],
    tags: ["Mong muốn", "Muốn", "TOPIK I"],
  },
  {
    id: "topik1-42",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – 았/었으면 좋겠다",
    meaning: "Nếu...thì tốt, ước gì...",
    explanation: "Biểu hiện diễn tả mong ước hoặc hy vọng một việc gì đó không có thực hoặc khác với thực tế. Có thể thay thế 좋겠다 bằng 하다 hoặc 싶다. – 았/었으면 좋겠다 và – (으)면 좋겠as tương tự nhau, tuy nhiên – 았/었으면 좋겠as diễn tả mong ước khó thành hiện thực hơn và nhấn mạnh hơn.",
    formation: "A/V + 았/었으면 좋겠다",
    notes: [
      "Mong ước hoặc hy vọng.",
      "Có thể thay bằng 하다 hoặc 싶다.",
      "Nhấn mạnh mong ước khó thành hiện thực.",
    ],
    examples: [
      { korean: "내일 날씨가 좋으면 좋겠어요.", vietnamese: "Ngày mai nếu thời tiết đẹp thì tốt." },
      { korean: "부자였으면 좋겠어요.", vietnamese: "Ước gì tôi là người giàu." },
      { korean: "친구가 많았으면 좋겠어요.", vietnamese: "Ước gì tôi có nhiều bạn." },
      { korean: "크리스마스에 눈이 왔으면 좋겠어요.", vietnamese: "Tôi ước tuyết rơi vào ngày Giáng sinh." },
      { korean: "방학이 빨리 왔으면 좋겠어요.", vietnamese: "Tôi ước kì nghỉ đến nhanh." },
      { korean: "좀 쉬었으면 좋겠어요.", vietnamese: "Nếu được nghỉ ngơi một chút thì tốt." },
    ],
    exercises: [
      { question: "내일 날씨가 좋으면 좋___.", options: ["겠어요.", "을 거예요.", "습니다.", "습니다."], answer: 0, explanation: "Nếu...thì tốt → 좋겠어요." },
      { question: "부자였으면 좋___.", options: ["겠어요.", "을 거예요.", "습니다.", "습니다."], answer: 0, explanation: "Ước gì → 좋겠어요." },
      { question: "친구가 많았으면 좋___.", options: ["겠어요.", "을 거예요.", "습니다.", "습니다."], answer: 0, explanation: "Ước gì → 좋겠어요." },
      { question: "방학이 빨리 왔으면 좋___.", options: ["겠어요.", "을 거예요.", "습니다.", "습니다."], answer: 0, explanation: "Ước gì → 좋겠어요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)면 좋겠다 (ít nhấn mạnh hơn).",
      "Quên ý nghĩa mong ước của -았/었으면 좋겠다.",
      "Dùng với việc có thể xảy ra (nên dùng -(으)면 좋겠다).",
    ],
    tags: ["Mong ước", "Hy vọng", "TOPIK I"],
  },
  {
    id: "topik1-43",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – 기 바라다",
    meaning: "Hi vọng rằng...",
    explanation: "Biểu hiện diễn tả sự hi vọng vào điều gì đó. Dùng trong văn viết với những thông báo mang tính chất trang trọng hoặc dùng trong văn nói với văn phong trang trọng, lời chúc. Ở dạng khẩu ngữ, người Hàn chia thành 바래요.",
    formation: "A/V + 기 바라다",
    notes: [
      "Hi vọng vào điều gì đó.",
      "Văn viết trang trọng.",
      "Khẩu ngữ: 바래요.",
    ],
    examples: [
      { korean: "할아버지께서는 건강하시기 바랍니다.", vietnamese: "Chúc ông nội mạnh khỏe." },
      { korean: "모두 제시간에 와 주시기 바랍니다.", vietnamese: "Hi vọng tất cả các bạn sẽ đến đúng giờ." },
      { korean: "계단을 이용해 주시기 바랍니다.", vietnamese: "Mọi người hãy dùng thang bộ." },
      { korean: "모든 일이 다 잘 되기를 바랍니다.", vietnamese: "Hi vọng rằng mọi việc sẽ tốt đẹp." },
      { korean: "더욱더 행복하시기 바랍니다.", vietnamese: "Chúc bạn ngày càng hạnh phúc hơn nữa." },
      { korean: "빨리 회복하시기 바랍니다.", vietnamese: "Hi vọng rằng bạn sớm bình phục." },
    ],
    exercises: [
      { question: "할아버지께서는 건강하시기 바랍___.", options: ["니다.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Chúc mạnh khỏe → 바랍니다." },
      { question: "모두 제시간에 와 주시기 바랍___.", options: ["니다.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Hi vọng đến đúng giờ → 바랍니다." },
      { question: "모든 일이 다 잘 되기를 바랍___.", options: ["니다.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Hi vọng tốt đẹp → 바랍니다." },
      { question: "빨리 회복하시기 바랍___.", options: ["니다.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Hi vọng bình phục → 바랍니다." },
    ],
    commonMistakes: [
      "Dùng 바라다 trong văn nói thân mật (nên dùng 바래요).",
      "Quên ý nghĩa trang trọng của -기 바라다.",
      "Nhầm với -고 싶다 (muốn vs hi vọng).",
    ],
    tags: ["Hi vọng", "Lời chúc", "TOPIK I"],
  },
  {
    id: "topik1-44",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 아/어 보다",
    meaning: "Thử..., Đã từng, đã thử...",
    explanation: "Khi sử dụng ở thì hiện tại, cấu trúc này diễn tả việc thử làm gì đó, còn khi sử dụng ở thì quá khứ, cấu trúc này diễn tả kinh nghiệm đã từng làm gì đó. Diễn tả kinh nghiệm của bản thân và không sử dụng với 보다.",
    formation: "V + 아/어 보다",
    notes: [
      "Hiện tại: thử làm gì đó.",
      "Quá khứ: kinh nghiệm đã từng làm.",
      "Không sử dụng với 보다.",
    ],
    examples: [
      { korean: "그 바지를 입어 보세요.", vietnamese: "Hãy thử mặc cái quần đó đi." },
      { korean: "저는 스키를 타 봤어요.", vietnamese: "Tôi đã từng thử trượt tuyết." },
      { korean: "이 음식 먹어 봐.", vietnamese: "Ăn thử món này đi." },
      { korean: "두 달 정도 요가를 해 봤어요.", vietnamese: "Tôi đã từng tập yoga khoảng 2 tháng." },
      { korean: "막걸리를 마셔 봤어요?", vietnamese: "Bạn đã từng uống rượu gạo Hàn Quốc chưa?" },
      { korean: "아니요, 안 마셔 봤어요. 어떤 맛이에요?", vietnamese: "Chưa, tôi chưa từng uống. Vị của nó thế nào?" },
    ],
    exercises: [
      { question: "그 바지를 입어 보___.", options: ["세요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Thử mặc → 입어 보세요." },
      { question: "저는 스키를 타 봤___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đã từng → 타 봤어요." },
      { question: "이 음식 먹어 ___.", options: ["봐.", "보세요.", "봤어요.", "봅니다."], answer: 0, explanation: "Thử ăn → 먹어 봐." },
      { question: "요가를 해 봤___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đã từng → 해 봤어요." },
    ],
    commonMistakes: [
      "Dùng 보다 với 보다 (không được).",
      "Nhầm ý nghĩa hiện tại vs quá khứ.",
      "Quên -아/어 trước -보다.",
    ],
    tags: ["Thử", "Kinh nghiệm", "TOPIK I"],
  },
  {
    id: "topik1-45",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V - (으)ㄴ 적이 있다/ 없다",
    meaning: "Đã từng, đã từng thử.../ chưa từng",
    explanation: "Biểu hiện thể hiện việc có/ không có kinh nghiệm hay trải nghiệm về một việc gì đó trong quá khứ. Thường kết hợp với 아/어 보다 => 아/어 본 적이 있다/없다. Không sử dụng cấu trúc này khi mô tả hành động thường xuyên xảy ra, lặp đi lặp lại trong quá khứ.",
    formation: "V(nguyên âm/ㄹ) + ㄴ 적이 있다/없다 / V(phụ âm) + 은 적이 있다/없다",
    notes: [
      "Có/không có kinh nghiệm trong quá khứ.",
      "Thường kết hợp: 아/어 본 적이 있다/없다.",
      "Không dùng với hành động lặp lại.",
    ],
    examples: [
      { korean: "제주도에 간 적이 있어요?", vietnamese: "Bạn đã từng đến đảo Jeju chưa?" },
      { korean: "저는 삼계탕을 먹어 본 적이 없어요.", vietnamese: "Tôi chưa từng ăn món gà tần sâm." },
      { korean: "설악산을 구경해 본 적이 있지요?", vietnamese: "Bạn đã từng đi ngắm cảnh núi Seorak đúng không?" },
      { korean: "그런 생각은 한 번도 한 적이 없습니다.", vietnamese: "Tôi chưa từng một lần nghĩ như thế." },
      { korean: "예전에 이 책을 읽은 적이 있어요.", vietnamese: "Trước đây tôi đã từng đọc cuốn sách này rồi." },
      { korean: "어렸을 때 피아노를 배운 적이 있어요.", vietnamese: "Hồi nhỏ tôi đã từng học Piano." },
      { korean: "한복을 한 번도 입어 본 적이 없어요.", vietnamese: "Tôi chưa từng mặc Hanbok một lần nào." },
    ],
    exercises: [
      { question: "제주도에 간 적이 있___.", options: ["어요?", "었어요?", "습니다.", "습니다."], answer: 0, explanation: "Đã từng → 간 적이 있어요?" },
      { question: "삼계탕을 먹어 본 적이 없___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Chưa từng → 먹어 본 적이 없어요." },
      { question: "설악산을 구경해 본 적이 있___.", options: ["지요?", "어요?", "습니다.", "습니다."], answer: 0, explanation: "Đã từng → 구경해 본 적이 있지요?" },
      { question: "피아노를 배운 적이 있___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đã từng → 배운 적이 있어요." },
    ],
    commonMistakes: [
      "Dùng với hành động lặp lại (không nên).",
      "Nhầm với -아/어 보다 (thử vs kinh nghiệm).",
      "Quên (으)ㄴ với động từ phụ âm.",
    ],
    tags: ["Kinh nghiệm", "Đã từng", "TOPIK I"],
  },
  {
    id: "topik1-46",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V - (으)러 가다 / 오다 / 다니다...",
    meaning: "Đi làm gì đó",
    explanation: "Biểu hiện diễn tả mục đích đi đến đâu đó để thực hiện hành động gì của người nói. Sau – (으)러 chỉ kết hợp với các động từ chuyển động như: 가다, 오다, 다니다, 올라가다, 나가다,... Trước – (으)러 không thể kết hợp với các động từ chuyển động. Lưu ý: địa điểm trong câu phải dùng với tiểu từ 에.",
    formation: "V + (으)러 + động từ chuyển동 (가다/오다/다니다...)",
    notes: [
      "Mục đích đi đến đâu đó.",
      "Sau -(으)러: động từ chuyển động.",
      "Trước -(으)러: không động từ chuyển động.",
    ],
    examples: [
      { korean: "요즘 수영을 배우러 다녀요.", vietnamese: "Dạo này tôi đi học bơi." },
      { korean: "저녁을 먹으러 식당에 가요.", vietnamese: "Tôi đến nhà hàng để ăn tối." },
      { korean: "백화점에 목도리를 사러 왔어요.", vietnamese: "Tôi đến trung tâm thương mại mua khăn." },
      { korean: "일하러 한국에 왔어요.", vietnamese: "Tôi đến HQ để làm việc." },
      { korean: "돈을 찾으러 은행에 갔어요.", vietnamese: "Tôi đến ngân hàng để rút tiền." },
      { korean: "주말에 우리 집에 놀러 오세요.", vietnamese: "Cuối tuần mời bạn đến nhà tôi chơi." },
      { korean: "춤을 배우러 학원에 다녀요.", vietnamese: "Tôi thường đến trung tâm để học múa." },
    ],
    exercises: [
      { question: "수영을 배우러 다녀___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đi học bơi → 다녀요." },
      { question: "저녁을 먹으러 식당에 가___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đến nhà hàng → 가요." },
      { question: "목도리를 사러 왔___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đến mua → 왔어요." },
      { question: "돈을 찾으러 은행에 갔___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đến rút → 갔어요." },
    ],
    commonMistakes: [
      "Dùng động từ chuyển động trước -(으)러 (sai).",
      "Quên tiểu từ 에 cho địa điểm.",
      "Dùng động từ không chuyển động sau -(으)러 (sai).",
    ],
    tags: ["Mục đích", "Đi làm", "TOPIK I"],
  },
  {
    id: "topik1-47",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V - (으)려고",
    meaning: "Để...",
    explanation: "Vĩ tố liên kết diễn tả ý định hoặc kế hoạch của người nói. Cụ thể, để hoàn thành ý định được nêu ra ở mệnh đề trước, người nói sẽ thực hiện hành động mệnh đề sau. Vế sau không kết hợp với hành động chưa xảy ra, không kết hợp với câu mệnh lệnh hoặc cầu khiến.",
    formation: "V + (으)려고",
    notes: [
      "Ý định hoặc kế hoạch.",
      "Vế sau: hành động đã xảy ra.",
      "Không kết hợp câu mệnh lệnh/cầu khiến.",
    ],
    comparison: {
      title: "So sánh -(으)러 가다/오다 và -(으)려고",
      headers: ["-(으)러 가다/오다", "-(으)려고"],
      rows: [
        ["Mệnh đề sau chỉ kết hợp với các động từ chuyển động", "Mệnh đề sau kết hợp với tất cả các động từ"],
        ["Mệnh đề sau có thể kết hợp với các thì", "Mệnh đề sau không thể kết hợp với thì tương lai"],
        ["Có thể kết hợp với tất cả các loại câu", "Không thể kết hợp với câu đề nghị hay mệnh lệnh"],
      ],
    },
    examples: [
      { korean: "음악을 들으려고 라디오를 켰어요.", vietnamese: "Tôi bật radio để nghe nhạc." },
      { korean: "여행을 가려고 비행기 표를 예약했어요.", vietnamese: "Tôi đặt vé máy bay để đi du lịch." },
      { korean: "김치를 만들려고 배추를 챙겼어요.", vietnamese: "Tôi lấy cải thảo để làm kim chi." },
      { korean: "살을 빼려고 매일 세 시간씩 운동을 해요.", vietnamese: "Tôi tập thể dục mỗi ngày để giảm cân." },
      { korean: "한국 사람과 이야기하려고 한국어를 배워요.", vietnamese: "Tôi học tiếng Hàn để nói chuyện với người Hàn Quốc." },
      { korean: "졸리지 않으려고 커피를 5 잔이나 마셨어요.", vietnamese: "Tôi uống tận 5 tách cà phê để không bị buồn ngủ." },
    ],
    exercises: [
      { question: "음악을 들으려고 라디오를 켰___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Để nghe nhạc → 켰어요." },
      { question: "여행을 가려고 비행기 표를 예약했___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Để đi du lịch → 예약했어요." },
      { question: "김치를 만들려고 배추를 챙겼___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Để làm kim chi → 챙겼어요." },
      { question: "살을 빼려고 운동을 해___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Để giảm cân → 해요." },
    ],
    commonMistakes: [
      "Kết hợp vế sau với hành động chưa xảy ra (sai).",
      "Kết hợp với câu mệnh lệnh/cầu khiến (sai).",
      "Nhầm với -(으)러 (chỉ động từ chuyển động).",
    ],
    tags: ["Mục đích", "Ý định", "TOPIK I"],
  },
  {
    id: "topik1-48",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – (으)려고 하다",
    meaning: "Định...",
    explanation: "Vĩ tố kết thúc: Diễn tả ý chí, ý định hoặc kế hoạch tương lai của chủ thể. Chỉ sử dụng khi hành động hoặc kế hoạch chưa xảy ra. Hình thức quá khứ: – (으)려고 했다.",
    formation: "V + (으)려고 하다",
    notes: [
      "Ý chí, ý định hoặc kế hoạch tương lai.",
      "Chỉ dùng khi hành động chưa xảy ra.",
      "Quá khứ: -(으)려고 했다.",
    ],
    examples: [
      { korean: "점심에는 비빔밥을 먹으려고 해요.", vietnamese: "Tôi định ăn cơm trộn vào bữa trưa." },
      { korean: "케이크를 만들려고 해요.", vietnamese: "Tôi định làm bánh kem." },
      { korean: "저녁에 숙제를 하려고 해요.", vietnamese: "Tôi định làm bài tập vào buổi tối." },
      { korean: "결혼하면 아이를 두 명 낳으려고 해요.", vietnamese: "Nếu kết hôn, tôi định sinh hai con." },
      { korean: "오늘 도서관에 가려고 합니다.", vietnamese: "Hôm nay tôi định đến thư viện." },
      { korean: "아침에 몇 시에 부산으로 출발하려고 합니까?", vietnamese: "Buổi sáng anh định mấy giờ xuất phát đi Busan." },
      { korean: "미국에 가려고 했는데 코로나–19 때문에 못 갔어요.", vietnamese: "Tôi định đi Mỹ nhưng vì Covid–19 nên đã không thể đi được." },
    ],
    exercises: [
      { question: "점심에는 비빔밥을 먹으려고 해___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Định ăn → 먹으려고 해요." },
      { question: "케이크를 만들려고 해___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Định làm → 만들려고 해요." },
      { question: "저녁에 숙제를 하려고 해___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Định làm → 하려고 해요." },
      { question: "오늘 도서관에 가려고 합___.", options: ["니다.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Định đến → 가려고 합니다." },
    ],
    commonMistakes: [
      "Dùng khi hành động đã xảy ra (sai).",
      "Nhầm với -(으)려고 (vĩ tố liên kết).",
      "Quên quá khứ -(으)려고 했다.",
    ],
    tags: ["Ý định", "Kế hoạch", "TOPIK I"],
  },
  {
    id: "topik1-49",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "N 을/를 위해(서), V – 기 위해(서)",
    meaning: "Để..., vì + N",
    explanation: "Vĩ tố liên kết: Diễn tả ý đồ hoặc mục đích thực hiện hành động nào đó. Cụ thể, để hoàn thành ý đồ hoặc mục đích được nêu ra ở mệnh đề trước, người nói sẽ thực hiện hành động mệnh đề sau. Khác với –(으)려고, –기 위해(서) có thể kết hợp với –아/어야 해요, –(으)ㅂ시다, –(으)세요, (으)ㄹ까요?",
    formation: "N + 을/를 위해(서) / V + 기 위해(서)",
    notes: [
      "Ý đồ hoặc mục đích thực hiện hành động.",
      "Có thể kết hợp với câu cầu khiến/đề nghị.",
      "Khác với -(으)려go.",
    ],
    examples: [
      { korean: "한국에서 취업하기 위해 한국어를 공부하고 있어요.", vietnamese: "Tôi đang học tiếng Hàn để làm việc tại công ty Hàn Quốc." },
      { korean: "살을 빼기 위해서 운동하고 있어요.", vietnamese: "Tôi tập thể dục để giảm cân." },
      { korean: "가족을 위해 돈을 많이 벌겠어요.", vietnamese: "Tôi sẽ kiếm thật nhiều tiền cho gia đình." },
      { korean: "통역사를 되기 위해 한국어를 열심히 공부하고 있습니다.", vietnamese: "Tôi học tiếng Hàn chăm chỉ để trở thành thông dịch viên." },
      { korean: "민우 씨를 만나기 위해 여가까지 달려 왔어요.", vietnamese: "Tôi đã chạy đến đây để gặp Minwoo." },
      { korean: "등록금을 마련하기 위해서 아르바이트를 하고 있어요.", vietnamese: "Tôi đang làm thêm để kiếm tiền học phí." },
    ],
    exercises: [
      { question: "한국에서 취업하기 위해 한국어를 공부하고 있___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Để làm việc → 취업하기 위해" },
      { question: "살을 빼기 위해서 운동하고 있___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Để giảm cân → 빼기 위해서" },
      { question: "가족을 위해 돈을 많이 벌___.", options: ["겠어요.", "을 거예요.", "습니다.", "습니다."], answer: 0, explanation: "Vì gia đình → 가족을 위해" },
      { question: "통역사를 되기 위해 한국어를 열심히 공부하고 있___.", options: ["습니다.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Để trở thành → 되기 위해" },
    ],
    commonMistakes: [
      "Nhầm với -(으)려go (không kết hợp câu cầu khiến).",
      "Quên -(으)를 với danh từ phụ âm.",
      "Dùng -(으)려go thay vì -기 위해(서).",
    ],
    tags: ["Mục đích", "Vì", "TOPIK I"],
  },
  {
    id: "topik1-50",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 기로 하다",
    meaning: "Quyết định sẽ..., định sẽ...",
    explanation: "Vĩ tố kết thúc: Thể hiện sự quyết tâm hay hứa hẹn sẽ thực hiện hành động nào đó. Thường dùng dưới dạng – 기로 했다 nhưng ý nghĩa ở thì tương lai.",
    formation: "V + 기로 하다",
    notes: [
      "Quyết tâm hoặc hứa hẹn thực hiện.",
      "Thường dùng -기로 했다 (nghĩ tương lai).",
      "Diễn tả quyết định.",
    ],
    examples: [
      { korean: "영화를 보러 가기로 했어요.", vietnamese: "Tôi quyết định đi xem phim." },
      { korean: "이번에는 여행을 가지 않기로 했어요.", vietnamese: "Lần này tôi đã quyết định không đi du lịch." },
      { korean: "오늘부터 담배를 끊기로 했어요.", vietnamese: "Tôi quyết định từ hôm nay sẽ bỏ thuốc lá." },
      { korean: "마이 씨는 태권도를 배우기로 했어요.", vietnamese: "Mai đã quyết định học taekwondo." },
      { korean: "주말에 친구하고 같이 등산하기로 했어요.", vietnamese: "Tôi quyết định đi leo núi cùng với bạn vào cuối tuần này." },
      { korean: "우리는 3 년 후에 결혼하기로 했습니다.", vietnamese: "Chúng tôi quyết định kết hôn sau ba năm nữa." },
      { korean: "민수 씨는 술을 끊기로 했어요.", vietnamese: "Minsoo đã quyết định cai rượu." },
    ],
    exercises: [
      { question: "영화를 보러 가기로 했___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Quyết định → 가기로 했어요." },
      { question: "이번에는 여행을 가지 않기로 했___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Quyết định → 않기로 했어요." },
      { question: "오늘부터 담배를 끊기로 했___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Quyết định → 끊기로 했어요." },
      { question: "태권도를 배우기로 했___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Quyết định → 배우기로 했어요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)려고 하다 (ý định vs quyết định).",
      "Quên ý nghĩa tương lai của -기로 했다.",
      "Dùng khi hành động đã xảy ra (sai).",
    ],
    tags: ["Quyết định", "Hứa hẹn", "TOPIK I"],
  },
  {
    id: "topik1-51",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – (으)ㄹ까 하다",
    meaning: "Phân vân sẽ..., đang nghĩ sẽ...",
    explanation: "Thể hiện suy nghĩ phân vân, do dự, chưa chắc chắn làm việc gì đó. Có thể sử dụng phân vân có nên làm gì đó hay không: V – (으)ㄹ까 말까 하다.",
    formation: "V + (으)ㄹ까 하다",
    notes: [
      "Suy nghĩ phân vân, do dự.",
      "Chưa chắc chắn làm việc gì.",
      "Có thể dùng -(으)ㄹ까 말까 하다.",
    ],
    examples: [
      { korean: "다음 학기에 중국어를 배울까 해요.", vietnamese: "Tôi đang tính sẽ học tiếng Trung vào học kì tới." },
      { korean: "주말에 낚시할까 말까 해요.", vietnamese: "Tôi đang phân vân cuối tuần có nên đi câu cá hay không." },
      { korean: "퇴근 후에 친구와 영화를 볼까 해요.", vietnamese: "Tôi đang tính là sau khi tan làm đi xem phim với bạn." },
      { korean: "내년에 대학을 졸업한 후에 유학을 갈까 해요.", vietnamese: "Tôi đang nghĩ sang năm sau khi tốt nghiệp đại học sẽ đi du học." },
      { korean: "신혼여행을 어디로 갈 거예요?", vietnamese: "Anh sẽ đi tuần trăng mật ở đâu?" },
      { korean: "아직 잘 모르겠지만 하와이로 갈까 해요.", vietnamese: "Tôi vẫn chưa chắc chắn nhưng tôi đang tính đi Hawaii." },
    ],
    exercises: [
      { question: "다음 학기에 중국어를 배울까 해___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đang tính → 배울까 해요." },
      { question: "주말에 낚시할까 말까 해___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Phân vân → 할까 말까 해요." },
      { question: "퇴근 후에 친구와 영화를 볼까 해___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đang tính → 볼까 해요." },
      { question: "유학을 갈까 해___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đang nghĩ → 갈까 해요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄹ까요 (gợi ý).",
      "Quên ý nghĩa phân vân của -(으)ㄹ까 하다.",
      "Dùng -(으)ㄹ까 말까 khi không phân vân.",
    ],
    tags: ["Phân vân", "Do dự", "TOPIK I"],
  },
  {
    id: "topik1-52",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – (으)면",
    meaning: "Nếu",
    explanation: "Vĩ tố liên kết đưa ra điều kiện về sự việc, tình huống xảy ra hàng ngày hoặc hành động có tính lặp đi lặp lại, hoặc giả định một sự việc chưa xảy ra. Vì giả định tương lai nên chắc chắn vế sau sẽ không dùng thì quá khứ. Khi giả định, thường có các trạng từ 혹시, 만일, 만약(에) đi kèm.",
    formation: "A/V + (으)면",
    notes: [
      "Điều kiện về sự việc/tình huống.",
      "Hành động lặp đi lặp lại hoặc giả định.",
      "Vế sau không dùng thì quá khứ.",
    ],
    examples: [
      { korean: "저는 술을 마시면 얼굴이 빨개져요.", vietnamese: "Nếu tôi uống rượu thì mặt sẽ bị đỏ." },
      { korean: "수업이 일찍 끝나면 뭐 할 거예요?", vietnamese: "Nếu tiết học kết thúc sớm thì bạn sẽ làm gì?" },
      { korean: "돈을 많이 벌면 아파트를 살 거예요.", vietnamese: "Nếu kiếm được nhiều tiền thì tôi sẽ mua một căn nhà." },
      { korean: "지금 출발하면 3시에 도착할 수 있어요.", vietnamese: "Nếu bây giờ xuất phát thì có thể đến nơi lúc 3 giờ." },
      { korean: "아이스크림을 많이 먹으면 살이 쪄요.", vietnamese: "Nếu ăn nhiều kem thì sẽ tăng cân." },
      { korean: "날씨가 좋으면 등산해요. 하지만 눈이 오면 집에서 텔레비전을 봐요.", vietnamese: "Nếu thời tiết đẹp thì tôi đi leo núi. Nhưng nếu tuyết rơi thì tôi ở nhà xem TV." },
    ],
    exercises: [
      { question: "술을 마시면 얼굴이 빨개___.", options: ["져요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Nếu uống thì đỏ → 마시면 빨개져요." },
      { question: "수업이 일찍 끝나면 뭐 할 거___.", options: ["예요?", "어요?", "습니까?", "습니까?"], answer: 0, explanation: "Nếu kết thúc → 끝나면 할 거예요?" },
      { question: "돈을 많이 벌면 아파트를 살 거___.", options: ["예요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Nếu kiếm → 벌면 살 거예요." },
      { question: "아이스크림을 많이 먹으면 살이 쪄___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Nếu ăn → 먹으면 쪄요." },
    ],
    commonMistakes: [
      "Dùng thì quá khứ ở vế sau (sai).",
      "Quên ý nghĩa điều kiện của -(으)면.",
      "Nhầm với -(으)려면 (nếu muốn vs nếu).",
    ],
    tags: ["Điều kiện", "Nếu", "TOPIK I"],
  },
  {
    id: "topik1-53",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V - (으)려면",
    meaning: "Nếu muốn..., nếu định...",
    explanation: "Là hình thức tỉnh lược của – (으)려고 하면. Diễn tả kế hoạch hoặc ý định ở mệnh đề trước và điều kiện để có thể đạt được kế hoạch đó ở mệnh đề sau. Mệnh đề sau thường ở các dạng – 아 / 어야 해요 / 돼요, –(으)면 돼요, –(으)세요, 이/가 필요해요, –는 게 좋아요.",
    formation: "V + (으)려면",
    notes: [
      "Tỉnh lược của -(으)려고 하면.",
      "Kế hoạch/ý định trước, điều kiện sau.",
      "Vế sau: phải, được, nên, cần.",
    ],
    examples: [
      { korean: "운전을 하려면 면허증이 있어야 해요.", vietnamese: "Nếu muốn lái xe thì phải có bằng lái." },
      { korean: "집을 구하려면 근처 부동산에 가 보세요.", vietnamese: "Nếu muốn tìm nhà thì hãy thử đến chỗ bất động sản gần đây." },
      { korean: "택시를 빨리 잡으려면 택시 승강장에 가야 돼요.", vietnamese: "Nếu muốn bắt taxi nhanh chóng thì phải đến bãi xe taxi." },
      { korean: "식사하시려면 예약을 하셔야 합니다.", vietnamese: "Nếu quý khách muốn dùng bữa thì phải đặt chỗ trước ạ." },
      { korean: "한국말을 잘하려면 어떻게 해야 돼요?", vietnamese: "Nếu muốn giỏi tiếng Hàn thì phải làm thế nào?" },
      { korean: "살을 빼려면 운동을 열심히 해야 해요.", vietnamese: "Nếu muốn giảm cân thì phải tập thể dục chăm chỉ." },
      { korean: "제 시간에 가려면 일찍 출발해야 해요.", vietnamese: "Nếu muốn đến đúng giờ thì phải xuất phát sớm." },
      { korean: "한국 음식을 먹으려면 한국 식당에 가야 돼요.", vietnamese: "Nếu muốn ăn món Hàn thì phải đến nhà hàng Hàn Quốc." },
    ],
    exercises: [
      { question: "운전을 하려면 면허증이 있어야 해___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Nếu muốn lái → 하려면 있어야 해요." },
      { question: "집을 구하려면 근처 부동산에 가 보세___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Nếu muốn tìm → 구하려면 가 보세요." },
      { question: "택시를 빨리 잡으려면 택시 승강장에 가야 돼___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Nếu muốn bắt → 잡으려면 가야 돼요." },
      { question: "살을 빼려면 운동을 열심히 해야 해___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Nếu muốn giảm → 빼려면 해야 해요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)면 (nếu vs nếu muốn).",
      "Quên ý nghĩa điều kiện của -(으)려면.",
      "Dùng vế sau không phù hợp (phải, được, nên).",
    ],
    tags: ["Điều kiện", "Nếu muốn", "TOPIK I"],
  },
  {
    id: "topik1-54",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – 아/어도",
    meaning: "Cho dù...",
    explanation: "Vĩ tố liên kết thể hiện ý nghĩa nhượng bộ, diễn tả cho dù có thực hiện hành động nào ở mệnh đề trước thì mệnh đề sau vẫn xảy ra. Có thể thêm phó từ 아무리 để nhấn mạnh [dù có như thế nào đi chăng nữa]",
    formation: "A/V + 아/어도",
    notes: [
      "Ý nghĩa nhượng bộ.",
      "Cho dù...vẫn xảy ra.",
      "Có thể thêm 아무리 để nhấn mạnh.",
    ],
    examples: [
      { korean: "시간이 없어도 아침을 먹어야 돼요.", vietnamese: "Cho dù không có thời gian nhưng vẫn phải ăn sáng." },
      { korean: "란 씨는 아무리 먹어도 살이 안 찌지요? 부러워요.", vietnamese: "Dù Lan có ăn thì cũng không tăng cân đúng không? Ghen tị thật đấy." },
      { korean: "아무리 바빠도 아침을 먹어야지요.", vietnamese: "Dù có bận như thế nào đi chăng nữa thì cũng phải ăn sáng chứ." },
      { korean: "아무리 힘들어도 포기하지 마세요.", vietnamese: "Dù có khó khăn như thế nào đi chăng nữa cũng không từ bỏ." },
      { korean: "크게 말해도 할머니가 못 들어요.", vietnamese: "Dù nói to nhưng bà vẫn không nghe được." },
      { korean: "아무리 먹어도 계속 배가 고파요.", vietnamese: "Dù có ăn như thế nào thì bụng vẫn cứ tiếp tục đói." },
    ],
    exercises: [
      { question: "시간이 없어도 아침을 먹어야 돼___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Cho dù không có → 없어도 먹어야 돼요." },
      { question: "아무리 바빠도 아침을 먹어야지___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Dù bận → 바빠도 먹어야지요." },
      { question: "아무리 힘들어도 포기하지 마세___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Dù khó khăn → 힘들어도 포기하지 마세요." },
      { question: "크게 말해도 할머니가 못 들___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Dù nói to → 말해도 못 들어요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)면 (nếu vs cho dù).",
      "Quên ý nghĩa nhượng bộ của -아/어도.",
      "Không dùng 아무리 khi nhấn mạnh.",
    ],
    tags: ["Nhượng bộ", "Cho dù", "TOPIK I"],
  },
  {
    id: "topik1-55",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A – 아/어지다",
    meaning: "Trở nên...",
    explanation: "Biểu hiện thể hiện sự biến đổi của trạng thái theo thời gian. A sẽ thành V khi kết hợp với cấu trúc này.",
    formation: "A + 아/어지다",
    notes: [
      "Biến đổi trạng thái theo thời gian.",
      "Tính từ thành động từ.",
      "Diễn tả thay đổi.",
    ],
    examples: [
      { korean: "아이스크림을 많이 먹으면 뚱뚱해질 거예요.", vietnamese: "Nếu ăn nhiều kem thì sẽ trở nên béo." },
      { korean: "날씨가 좋아졌어요.", vietnamese: "Thời tiết đã trở nên đẹp hơn." },
      { korean: "한국 생활에 점점 익숙해졌어요.", vietnamese: "Tôi đã trở nên quen với cuộc sống ở Hàn Quốc." },
      { korean: "요즘 날씨가 따뜻해졌어요.", vietnamese: "Dạo này trời ấm lên." },
      { korean: "대학교 수업은 내년에 어려워질 거예요.", vietnamese: "Năm sau bài học ở trường đại học sẽ trở nên khó hơn." },
      { korean: "연습을 많이 하니까 발음이 점점 좋아졌어요.", vietnamese: "Vì tôi tập luyện nhiều nên phát âm của tôi đang dần dần tốt lên." },
      { korean: "지금 건강이 많이 나아졌어요.", vietnamese: "Bây giờ thì sức khỏe đã tốt lên rất nhiều." },
    ],
    exercises: [
      { question: "날씨가 좋아졌___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đã trở nên → 좋아졌어요." },
      { question: "한국 생활에 점점 익숙해졌___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đã trở nên → 익숙해졌어요." },
      { question: "요즘 날씨가 따뜻해졌___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đã ấm lên → 따뜻해졌어요." },
      { question: "건강이 많이 나아졌___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đã tốt lên → 나아졌어요." },
    ],
    commonMistakes: [
      "Nhầm với -게 되다 (thay đổi khách quan vs chủ quan).",
      "Quên ý nghĩa biến đổi của -아/어지다.",
      "Dùng với động từ (chỉ tính từ).",
    ],
    tags: ["Biến đổi", "Trở nên", "TOPIK I"],
  },
  {
    id: "topik1-56",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – 게 되다",
    meaning: "Làm được gì đó, được làm gì đó",
    explanation: "1. Thể hiện sự thay đổi trạng thái của tình huống nào đó do hoàn cảnh khách quan [làm được gì đó]. 2. Dạng thụ động: một tình huống đã trở thành sự thật hoặc được quyết định thực hiện [được làm gì đó]",
    formation: "A/V + 게 되다",
    notes: [
      "1. Thay đổi trạng thái do hoàn cảnh khách quan.",
      "2. Dạng thụ động: trở thành sự thật/quyết định.",
      "Diễn tả kết quả hoặc thay đổi.",
    ],
    examples: [
      { korean: "회사에 다닌 후부터 일찍 일어나게 됐어요.", vietnamese: "Từ sau khi đi làm tôi đã dậy sớm được rồi." },
      { korean: "한국에 오기 전에 방탄소년단을 몰랐는데 한국에 와서 알게 됐어요.", vietnamese: "Trước khi đến Hàn tôi không biết BTS nhưng sau khi đến Hàn thì tôi đã biết được." },
      { korean: "친구들과 노래방에 가서 연습하니까 노래를 잘하게 되었어요.", vietnamese: "Tôi đến phòng hát và luyện tập cùng các bạn nên tôi đã hát được tốt hơn." },
      { korean: "전에는 매운 음식을 못 먹었는데 한국에서 생활한 후 잘 먹게 되었어요.", vietnamese: "Trước đây tôi không ăn được cay nhưng sau khi sống ở HQ tôi ăn được cay tốt." },
      { korean: "뭐든지 열심히 연습하면 잘하게 될 거예요.", vietnamese: "Bất cứ cái gì nếu luyện tập chăm chỉ thì sẽ đều giỏi được." },
      { korean: "열심히 공부해서 장학금을 받게 되었어요.", vietnamese: "Vì học chăm chỉ nên tôi đã được nhận học bổng." },
      { korean: "모임에 가면 학과 선배들과 인사를 나누게 돼요.", vietnamese: "Nếu đi đến buổi gặp mặt sẽ được chào hỏi các tiền bối." },
      { korean: "갑자기 급한 일이 생겨서 저는 못 가게 될 거예요.", vietnamese: "Vì đột nhiên có việc gấp nên tới chắc là không đi được." },
      { korean: "다음 달에 한국에 가게 됐어요.", vietnamese: "Tháng sau mình sẽ được đi Hàn Quốc." },
    ],
    exercises: [
      { question: "회사에 다닌 후부터 일찍 일어나게 됐___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đã dậy được → 일어나게 됐어요." },
      { question: "한국에 와서 알게 됐___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đã biết được → 알게 됐어요." },
      { question: "노래를 잘하게 되었___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đã hát được → 잘하게 되었어요." },
      { question: "장학금을 받게 되었___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đã nhận → 받게 되었어요." },
    ],
    commonMistakes: [
      "Nhầm với -아/어지다 (chủ quan vs khách quan).",
      "Quên ý nghĩa thụ động của -게 되다.",
      "Dùng khi hành động chủ quan (nên dùng -아/어지다).",
    ],
    tags: ["Thay đổi", "Thụ động", "TOPIK I"],
  },
  {
    id: "topik1-57",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – 겠어요",
    meaning: "Sẽ..., chắc sẽ...",
    explanation: "Thể hiện sự dự đoán, phỏng đoán về tình huống, trạng thái nào đó. Thường dùng khi mô tả ý chí quyết tâm làm gì đó nếu dùng với động từ. Hình thức phỏng đoán quá khứ: - 았/었 + 겠어요 => - 았/었겠어요",
    formation: "A/V + 겠어요",
    notes: [
      "Dự đoán, phỏng đoán về tình huống/trạng thái.",
      "Với động từ: ý chí quyết tâm.",
      "Quá khứ: -았/었겠어요.",
    ],
    examples: [
      { korean: "그래요? 많이 피곤하겠어요.", vietnamese: "Vậy sao? Chắc bạn mệt lắm nhỉ?" },
      { korean: "오늘은 일이 있어서 못 가겠습니다.", vietnamese: "Hôm nay vì có việc bận nên tôi sẽ không đến được." },
      { korean: "어제 많이 피곤했겠네요.", vietnamese: "Hôm qua chắc bạn mệt lắm nhỉ." },
      { korean: "아침마다 운동하겠어요.", vietnamese: "Tôi sẽ tập thể dục vào mỗi buổi sáng." },
      { korean: "이제 술을 마시지 않겠어요.", vietnamese: "Bây giờ tôi sẽ không uống rượu nữa." },
      { korean: "올해에는 담배를 꼭 끊겠습니다.", vietnamese: "Năm nay nhất định tôi sẽ bỏ thuốc." },
      { korean: "그럼 한국말을 잘하겠어요.", vietnamese: "Vậy thì chắc bạn giỏi tiếng Hàn lắm nhỉ." },
    ],
    exercises: [
      { question: "많이 피곤하겠___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Chắc mệt → 피곤하겠어요." },
      { question: "오늘은 일이 있어서 못 가겠___.", options: ["습니다.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Sẽ không đến → 못 가겠습니다." },
      { question: "아침마다 운동하겠___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Sẽ tập thể dục → 운동하겠어요." },
      { question: "이제 술을 마시지 않겠___.", options: ["어요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Sẽ không uống → 마시지 않겠어요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄹ 거예요 (dự đoán vs kế hoạch).",
      "Quên ý nghĩa quyết tâm với động từ.",
      "Dùng quá khứ sai (-았/었겠어요).",
    ],
    tags: ["Dự đoán", "Quyết tâm", "TOPIK I"],
  },
  {
    id: "topik1-58",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – (으)ㄹ 거예요",
    meaning: "Sẽ...",
    explanation: "Sử dụng khi phỏng đoán trạng thái hay hành động nào đó. Chủ ngữ là ngôi thứ 3. Nếu chủ ngữ ngôi số 1 hoặc 2 là thì diễn tả kế hoạch, ý chí nào đó sẽ được thực hiện trong tương lai. So với –겠- thì mức độ quyết tâm không mạnh mẽ bằng. Dạng trang trọng là (으)ㄹ 겁니다. Hình thức phỏng đoán quá khứ: - 았/었 + (으)ㄹ 거예요",
    formation: "A/V + (으)ㄹ 거예요",
    notes: [
      "Phỏng đoán (chủ ngữ ngôi 3).",
      "Kế hoạch/ý chí (chủ ngữ ngôi 1, 2).",
      "Quyết tâm yếu hơn -겠-.",
    ],
    examples: [
      { korean: "내일도 추울 거예요.", vietnamese: "Ngày mai chắc trời sẽ lạnh." },
      { korean: "유리 씨가 b现在 집에서 음악을 들을 거예요.", vietnamese: "Yuri bây giờ chắc đang ở nhà nghe nhạc." },
      { korean: "흐엉 씨는 내일 학교에 올 거예요?", vietnamese: "Hương ngày mai chắc sẽ đến trường nhỉ?" },
      { korean: "이번 주말에 친구들과 등산할 거예요.", vietnamese: "Cuối tuần này tôi sẽ đi leo núi với bạn." },
      { korean: "오늘 점심에 어디에서 먹을 거예요?", vietnamese: "Trưa nay chúng ta sẽ ăn ở đâu?" },
      { korean: "저는 주말에 학교 도서관에서 공부할 거예요.", vietnamese: "Cuối tuần tôi sẽ học ở thư viện trường học." },
      { korean: "내일 뭐 거예요? 친구들이랑 캠핑할 거예요.", vietnamese: "Ngày mai bạn sẽ làm gì? Mình sẽ cắm trại cùng mấy người bạn nè." },
      { korean: "오늘 정부는 교통 체증 문제에 대해 의논할 겁니다.", vietnamese: "Hôm nay Chính phủ sẽ bàn bạc về vấn đề ùn tắc giao thông." },
    ],
    exercises: [
      { question: "내일도 추울 거___.", options: ["예요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Chắc lạnh → 추울 거예요." },
      { question: "흐엉 씨는 내일 학교에 올 거___.", options: ["예요?", "어요?", "습니까?", "습니까?"], answer: 0, explanation: "Chắc đến → 올 거예요?" },
      { question: "이번 주말에 친구들과 등산할 거___.", options: ["예요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Sẽ đi → 등산할 거예요." },
      { question: "오늘 점심에 어디에서 먹을 거___.", options: ["예요?", "어요?", "습니까?", "습니까?"], answer: 0, explanation: "Sẽ ăn → 먹을 거예요?" },
    ],
    commonMistakes: [
      "Nhầm với -겠어요 (quyết tâm mạnh vs yếu).",
      "Quên ý nghĩa phỏng đoán với ngôi 3.",
      "Dùng quá khứ sai (-았/었을 거예요).",
    ],
    tags: ["Phỏng đoán", "Kế hoạch", "TOPIK I"],
  },
  {
    id: "topik1-59",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – (으)ㄴ/는/(으)ㄹ 것 같다",
    meaning: "Hình như..., dường như...",
    explanation: "Vĩ tố kết thúc: Chỉ sự phỏng đoán của người nói. Thì thể của cấu trúc này phụ thuộc vào điều gì đó đã xảy ra trong quá khứ, đang xảy ra ở hiện tại, hoặc sẽ xảy ra trong tương lai. Còn được dùng để diễn tả quan điểm, suy nghĩ của người nói một cách tế nhị. Động từ có 3 thì quá khứ, hiện tại, tương lai ứng với (으)ㄴ/는/(으)ㄹ còn với tính từ dùng với (으)ㄴ hoặc nếu trạng thái mơ hồ thì dùng (으)ㄹ.",
    formation: "V(qua khứ) + (으)ㄴ 것 같다 / V(hiện tại) + 는 것 같다 / V(tương lai) + (으)ㄹ 것 같다",
    notes: [
      "Phỏng đoán của người nói.",
      "3 thì: quá khứ, hiện tại, tương lai.",
      "Diễn tả quan điểm tế nhị.",
    ],
    examples: [
      { korean: "비가 그친 것 같아요.", vietnamese: "Hình như trời tạnh mưa rồi." },
      { korean: "비가 올 것 같아요.", vietnamese: "Hình như trời sẽ mưa." },
      { korean: "아기가 지금 자는 거 같아요.", vietnamese: "Chắc có lẽ bây giờ đứa bé đang ngủ." },
      { korean: "그 책이 어려운 것 같아요.", vietnamese: "Chắc quyển sách đó khó." },
      { korean: "그 가방은 비싼/비쌀 것 같아요.", vietnamese: "Chắc cái túi xách đó đắt lắm." },
      { korean: "민수 씨가 감기에 걸려서 집에서 쉬는 것 같아요.", vietnamese: "Minsu bị cảm nên chắc là đang nghỉ ở nhà." },
      { korean: "배가 불러서 더 못 먹을 것 같아요.", vietnamese: "Tôi no quá rồi nên chắc là sẽ không ăn thêm được nữa." },
      { korean: "집에 아무도 없는 것 같아요.", vietnamese: "Trong nhà hình như không có ai." },
    ],
    exercises: [
      { question: "비가 그친 것 같___.", options: ["아요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Hình như tạnh → 그친 것 같아요." },
      { question: "비가 올 것 같___.", options: ["아요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Hình như mưa → 올 것 같아요." },
      { question: "아기가 지금 자는 거 같___.", options: ["아요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Chắc đang ngủ → 자는 거 같아요." },
      { question: "그 책이 어려운 것 같___.", options: ["아요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Chắc khó → 어려운 것 같아요." },
    ],
    commonMistakes: [
      "Nhầm thì (quá khứ/hiện tại/tương lai).",
      "Quên ý nghĩa phỏng đoán.",
      "Dùng sai với tính từ.",
    ],
    tags: ["Phỏng đoán", "Quan điểm", "TOPIK I"],
  },
  {
    id: "topik1-60",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A - 아/어 보이다",
    meaning: "Trông/nhìn có vẻ...",
    explanation: "Vĩ tố kết thúc: Diễn tả sự phỏng đoán hoặc cảm nhận của bạn dựa trên vẻ ngoài của con người, sự vật, sự việc.",
    formation: "A + 아/어 보이다",
    notes: [
      "Phỏng đoán/cảm nhận từ vẻ ngoài.",
      "Dựa trên con người, sự vật, sự việc.",
      "Trông có vẻ...",
    ],
    examples: [
      { korean: "지금 괜찮으세요? 슬퍼 보여요.", vietnamese: "Bạn không sao chứ? Trông bạn có vẻ buồn." },
      { korean: "이 치마를 입으니까 젊어 보여요.", vietnamese: "Bạn mặc váy này trông có vẻ trẻ." },
      { korean: "김치가 매워 보이네요.", vietnamese: "Kimchi nhìn có vẻ cay." },
      { korean: "이 케이크가 맛있어 보여서 샀는데, 너무 달아요.", vietnamese: "Chiếc bánh này trông có vẻ ngon nên tôi đã mua nhưng nó ngọt quá." },
      { korean: "마크 씨, 얼굴이 피곤해 보여요. 무슨 일 있어요?", vietnamese: "Mark à, trông bạn có vẻ mệt. Có chuyện gì thế?" },
      { korean: "가방이 무거워 보이는데 들어 드릴까요?", vietnamese: "Trông túi xách cô có vẻ nặng, để tôi xách giúp nhé?" },
    ],
    exercises: [
      { question: "슬퍼 보___.", options: ["여요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Trông buồn → 슬퍼 보여요." },
      { question: "젊어 보___.", options: ["여요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Trông trẻ → 젊어 보여요." },
      { question: "매워 보___.", options: ["여요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Trông cay → 매워 보이네요." },
      { question: "맛있어 보___.", options: ["여요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Trông ngon → 맛있어 보여서." },
    ],
    commonMistakes: [
      "Nhầm với -아/어지다 (biến đổi vs vẻ ngoài).",
      "Quên ý nghĩa phỏng đoán từ vẻ ngoài.",
      "Dùng với động từ (chỉ tính từ).",
    ],
    tags: ["Phỏng đoán", "Vẻ ngoài", "TOPIK I"],
  },
  {
    id: "topik1-61",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V - (으)ㄹ 텐데",
    meaning: "Chắc sẽ... nên, sẽ ...đấy, nên...",
    explanation: "Là cấu trúc (으)ㄹ 터 + (으)ㄴ/는 데 dùng để đưa ra nhận định, phỏng đoán ở vế trước và đưa ra bối cảnh ở vế sau. Mệnh đề trước diễn tả ý định, phỏng đoán, mệnh đề sau có thể liên quan hoặc tương phản mệnh đề trước. Vế sau thường dùng với mệnh đề lệnh, cầu khiến. Phỏng đoán quá khứ: 았/었 + (으)ㄹ 텐데. Có thể sử dụng ở cuối câu => - (으)ㄹ 텐데요.",
    formation: "A/V + (으)ㄹ 텐데",
    notes: [
      "Nhận định/phỏng đoán trước, bối cảnh sau.",
      "Vế sau: lệnh, cầu khiến.",
      "Quá khứ: -았/었을 텐데.",
    ],
    examples: [
      { korean: "아기가 깨면 엄마를 찾을 텐데 큰일이에요.", vietnamese: "Nếu đứa bé tỉnh dậy chắc tìm mẹ, lớn chuyện đó." },
      { korean: "영화가 지금 끝나서 사람이 많을 텐데 다른 쪽에 있는 화장실에 가요.", vietnamese: "Bây giờ bộ phim kết thúc nên chắc sẽ có nhiều người lắm, vì vậy chúng tôi đi nhà vệ sinh ở hướng khác." },
      { korean: "그 식당이 이미 닫았을 텐데 가지 마세요.", vietnamese: "Chắc nhà hàng đó đã đóng cửa rồi nên đừng đi." },
      { korean: "바람이 불면 추울 텐데 따뜻하게 입고 가세요.", vietnamese: "Gió thổi nhiều nên chắc sẽ lạnh, bạn hãy mặc ấm vào nhé." },
      { korean: "배가 고플 텐데 이것 좀 드세요.", vietnamese: "Chắc là anh đói lắm, anh ăn cái này một chút đi." },
      { korean: "인선 씨가 서울에 도착했을 텐데 이따가 연락해 볼까요?", vietnamese: "Chắc là anh Inseon đã đến Hàn Quốc rồi, chút nữa tôi thử liên lạc xem sao nhé?" },
      { korean: "어제 야근하느라고 많이 피곤했을 텐데 오늘은 일찍 들어가세요.", vietnamese: "Hôm qua làm ca đêm nên chắc anh mệt rồi, hôm nay anh về nhà sớm đi." },
      { korean: "차가 많이 막힐 텐데 좀 일찍 출발하는 게 어때요?", vietnamese: "Chắc là sẽ tắc đường vậy nên xuất phát sớm chút nhé?" },
    ],
    exercises: [
      { question: "사람이 많을 텐데 다른 쪽에 있는 화장실에 가___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Chắc đông → 많을 텐데 가요." },
      { question: "그 식당이 이미 닫았을 텐데 가지 마세___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Chắc đóng → 닫았을 텐데 마세요." },
      { question: "바람이 불면 추울 텐데 따뜻하게 입고 가세___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Chắc lạnh → 추울 텐데 가세요." },
      { question: "배가 고플 텐데 이것 좀 드세___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Chắc đói → 고플 텐데 드세요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄹ 테니까 (bối cảnh vs lý do).",
      "Quên ý nghĩa phỏng đoán.",
      "Dùng vế sau không phù hợp.",
    ],
    tags: ["Phỏng đoán", "Bối cảnh", "TOPIK I"],
  },
  {
    id: "topik1-62",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – (으)ㄹ 테니까",
    meaning: "Vì tôi sẽ... nên, chắc là sẽ... nên",
    explanation: "(1) Chủ ngữ vế đầu tiên ngôi số 1: diễn tả ý chí vì TÔI sẽ làm gì đó nên... Mệnh đề sau thường là lời gợi ý hoặc lời khuyên dành cho người nghe. (2) Chủ ngữ vế đầu tiên ngôi số 3: diễn tả sự phỏng đoán và đưa ra lời khuyên, cầu khiến, ý chí. Không dùng 걱정이다, 고맙다, 감사하다, 미안하다 sau – (으)ㄹ 테니까. Trong khi (으)ㄹ 텐데 nhấn mạnh bối cảnh thì (으)ㄹ 테니까 thiên về giải thích lí do.",
    formation: "A/V + (으)ㄹ 테니까",
    notes: [
      "Ngôi 1: ý chí tôi → lời khuyên cho người nghe.",
      "Ngôi 3: phỏng đoán → lời khuyên/cầu khiến.",
      "Giải thích lý do (không dùng với cảm xúc).",
    ],
    examples: [
      { korean: "시험 기간이라서 사람이 많을 테니까 아침 일찍 갑시다.", vietnamese: "Vì đang là giai đoạn thi nên chắc sẽ đông, buổi sáng đến sớm chút nhé." },
      { korean: "제가 도와 줄 테니까 너무 걱정하지 마세요.", vietnamese: "Tôi sẽ giúp nên đừng lo lắng quá nhé." },
      { korean: "밖에 추울 테니까 나가지 마세요.", vietnamese: "Bên ngoài trời lạnh nên đừng ra ngoài." },
      { korean: "요즘 귤 철이라 귤이 싸고 맛있을 테니까 귤을 사 가요.", vietnamese: "Dạo này đang là mùa quýt nên quýt sẽ rẻ và ngon, vì vậy tôi đi mua quýt." },
      { korean: "제가 청소를 할 테니까 설거지를 하세요.", vietnamese: "Tôi sẽ dọn dẹp vì thế bạn rửa bát đĩa nhé." },
      { korean: "이건 제가 할 테니까 걱정하지 말고 쉬세요.", vietnamese: "Tôi sẽ làm việc này vì vậy đừng lo lắng và nghỉ ngơi đi." },
      { korean: "퇴근 시간이라 길이 막힐 테니까 지하철을 타.", vietnamese: "Đang giờ tan tầm nên là đường tắc đấy đi tàu điện ngầm đi nhé." },
      { korean: "밖에 햇빛이 강할 테니까 양산을 챙겨 나가세요.", vietnamese: "Bên ngoài vì chắc là nắng to nên chuẩn bị ô che nắng mang đi nhé." },
    ],
    exercises: [
      { question: "사람이 많을 테니까 아침 일찍 갑___.", options: ["시다.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Chắc đông → 많을 테니까 갑시다." },
      { question: "제가 도와 줄 테니까 너무 걱정하지 마세___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Tôi sẽ giúp → 도와 줄 테니까 마세요." },
      { question: "밖에 추울 테니까 나가지 마세___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Trời lạnh → 추울 테니까 마세요." },
      { question: "제가 청소를 할 테니까 설거지를 하세___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Tôi sẽ dọn → 할 테니까 하세요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄹ 텐데 (lý do vs bối cảnh).",
      "Dùng với cảm xúc (걱정, 고맙, 감사, 미안).",
      "Quên ý nghĩa ý chí/phỏng đoán.",
    ],
    tags: ["Ý chí", "Phỏng đoán", "Lý do", "TOPIK I"],
  },
  {
    id: "topik1-63",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A – 군요, V – 는군요",
    meaning: "....thế!, ...đấy!",
    explanation: "Vĩ tố kết thúc: Diễn tả sự ngạc nhiên hoặc thắc mắc khi người nói trực tiếp chứng kiến, trải nghiệm hoặc nghe thấy từ ai đó. Có thể kết hợp với danh từ: N +(이)군요. Hình thức quá khứ: – 았/었군요",
    formation: "A + 군요 / V + 는군요 / N + (이)군요",
    notes: [
      "Ngạc nhiên hoặc thắc mắc.",
      "Trực tiếp chứng kiến/trải nghiệm/nghe.",
      "Quá khứ: -았/었군요.",
    ],
    examples: [
      { korean: "유리 씨는 영어를 정말 잘하시는군요.", vietnamese: "Yuri giỏi tiếng Anh thật đấy!" },
      { korean: "영호 씨는 정말 머리가 좋군요.", vietnamese: "Young–ho tóc đẹp thật đấy!" },
      { korean: "감기에 걸렸군요.", vietnamese: "Bạn bị cảm cúm rồi đấy!" },
      { korean: "어렸을 때 정말 귀여웠군요.", vietnamese: "Ôi, hồi nhỏ cậu đáng yêu thế!" },
      { korean: "정말 비가 오는군요. 우산이 없는데 어떻게 하죠?", vietnamese: "Ra là trời đang mưa. Tôi không có ô, phải làm sao đây?" },
    ],
    exercises: [
      { question: "유리 씨는 영어를 정말 잘하시는군___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Giỏi thật → 잘하시는군요." },
      { question: "영호 씨는 정말 머리가 좋군___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đẹp thật → 머리가 좋군요." },
      { question: "감기에 걸렸군___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Bị cảm rồi → 걸렸군요." },
      { question: "정말 비가 오는군___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Mưa thật → 오는군요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄹ까요 (gợi ý vs ngạc nhiên).",
      "Quên ý nghĩa ngạc nhiên/thắc mắc.",
      "Dùng khi không trực tiếp chứng kiến.",
    ],
    tags: ["Ngạc nhiên", "Thắc mắc", "TOPIK I"],
  },
  {
    id: "topik2-1",
    level: "TOPIK 2",
    levelColor: "#84cc16",
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
    id: "topik2-2",
    level: "TOPIK 2",
    levelColor: "#84cc16",
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
    id: "topik2-3",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "V – 느라(고)",
    meaning: "vì mải làm gì đó nên...",
    explanation: "Vĩ tố liên kết thể hiện mệnh đề trước là nguyên nhân, lý do gây kết quả tiêu cực ở mệnh đề sau. Nếu dùng kết quả tích cực ở mệnh đề sau câu sẽ thiếu tự nhiên. Vế sau chủ yếu chia ở thời quá khứ. Chỉ những động từ yêu cầu thời gian, sức lực, ý chí của chủ thể hành động mới được đứng trước – 느라고.",
    formation: "V + 느라고",
    notes: [
      "Nguyên nhân gây kết quả tiêu cực.",
      "Vế sau quá khứ.",
      "Động từ cần thời gian/sức lực.",
    ],
    examples: [
      { korean: "열심히 공부하느라고 고생했어요.", vietnamese: "Vì mải học hành nên đã rất vất vả." },
      { korean: "일을 하느라고 점심을 못 먹었어요.", vietnamese: "Vì mải làm việc mà tôi đã không thể ăn trưa." },
      { korean: "텔레비전을 보느라고 숙제를 못 했어요.", vietnamese: "Vì mải xem tivi mà tôi đã không thể làm bài tập." },
      { korean: "어제 책을 읽느라고 밤을 세웠어요.", vietnamese: "Vì mải đọc sách mà hôm qua tôi đã thức cả đêm." },
      { korean: "피곤해서 자느라 전화 소리도 못 들었어요.", vietnamese: "Xin lỗi, vì mệt nên mình ngủ say quá không nghe thấy chuông điện thoại." },
      { korean: "아르바이트를 하느라 바빠요.", vietnamese: "Vì đi làm thêm nên tớ bận rộn." },
    ],
    exercises: [
      { question: "공부하느라고 고생했___.", options: ["어요.", "습니다.", "했어요.", "했어."], answer: 0, explanation: "Quá khứ → 고생했어요." },
      { question: "일을 하느라고 점심을 못 먹었___.", options: ["어요.", "습니다.", "었어요.", "었어."], answer: 0, explanation: "Quá khứ → 못 먹었어요." },
    ],
    commonMistakes: [
      "Dùng với kết quả tích cực (không tự nhiên).",
      "Quên vế sau phải quá khứ.",
      "Dùng với động từ không cần thời gian.",
    ],
    tags: ["Nguyên nhân", "Kết quả tiêu cực", "Quá khứ", "B1"],
  },
  {
    id: "topik2-4",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "V – 는 바람에",
    meaning: "chẳng qua là vì...",
    explanation: "Thông thường, mệnh đề trước diễn tả tình huống hoặc hoàn cảnh gây ảnh hưởng tiêu cực đến mệnh đề sau hoặc gây ra một kết quả không mong muốn. Là vĩ tố liên kết mang tính chất biện minh. Tuy nhiên, thỉnh thoảng cũng có thể dùng cấu trúc này trong tình huống mang tính tích cực khi kết quả xảy ra ngoài dự đoán. Mệnh đề sau – 는 바람에 luôn chia ở hình thức quá khứ nhưng không kết hợp với câu mệnh lệnh hoặc câu thỉnh dụ.",
    formation: "V + 는 바람에",
    notes: [
      "Hoàn cảnh gây kết quả tiêu cực.",
      "Tính biện minh.",
      "Vế sau luôn quá khứ.",
    ],
    examples: [
      { korean: "노트북이 갑자기 고장 나는 바람에 이메일을 확인하지 못했어요.", vietnamese: "Vì laptop đột nhiên bị hỏng nên tôi không thể xác nhận email được." },
      { korean: "버스를 잘못 타는 바람에 늦었어요.", vietnamese: "Em xin lỗi ạ. Tại vì bị lỡ xe bus nên em đến muộn ạ." },
      { korean: "갑자기 감기에 걸리는 바람에 약속을 취소했어요.", vietnamese: "Do tự nhiên bị cảm cúm nên tôi đã đành hủy bỏ cuộc hẹn." },
      { korean: "태풍이 오는 바람에 비행기가 취소됐어요.", vietnamese: "Tại có bão nên chuyến bay bị hủy." },
      { korean: "급하게 먹는 바람에 체했어요.", vietnamese: "Tại ăn vội nên bị nghẹn." },
      { korean: "교통사고가 나는 바람에 다쳐서 병원에 입원했어요.", vietnamese: "Vì bị tai nạn giao thông nên đã nhập viện." },
      { korean: "길이 막히는 바람에 늦었어요.", vietnamese: "Vì đường bị tắc nên tôi đã bị muộn." },
    ],
    exercises: [
      { question: "노트북이 갑자기 고장 나는 바람에 이메일을 확인하지 못했___.", options: ["어요.", "습니다.", "했어요.", "했어."], answer: 0, explanation: "Quá khứ → 못 했어요." },
      { question: "버스를 잘못 타는 바람에 늦었___.", options: ["어요.", "습니다.", "었어요.", "었어."], answer: 0, explanation: "Quá khứ → 늦었어요." },
    ],
    commonMistakes: [
      "Dùng với mệnh lệnh/thỉnh dụ.",
      "Quên vế sau phải quá khứ.",
      "Dùng khi kết quả tích cực (thiếu tự nhiên).",
    ],
    tags: ["Nguyên nhân", "Biện minh", "Quá khứ", "B1"],
  },
  {
    id: "topik2-5",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – (으)ㄴ/는 탓에",
    meaning: "đổ lỗi, nêu lý do",
    explanation: "Vĩ tố liên kết dùng để đổ lỗi, nêu ra lý do, nguyên nhân, biện hộ, quy trách nhiệm cho một tình huống không tốt nào đó. Mệnh đề sau xảy ra do mệnh đề trước.",
    formation: "V + 는 탓에 / A + (으)ㄴ 탓에 / N인 탓에",
    notes: [
      "Đổ lỗi/nêu lý do.",
      "Tình huống không tốt.",
      "Biện hộ/quy trách nhiệm.",
    ],
    examples: [
      { korean: "밤새도록 드라마를 보는 탓에 아침에 자주 늦게 일어나요.", vietnamese: "Vì xem phim cả đêm nên tôi thường buổi sáng tôi thường dậy muộn." },
      { korean: "요즘 스트레스를 자주 받는 탓에 건강이 나빠져요.", vietnamese: "Dạo này vì bị căng thẳng nhiều nên sức khỏe trở nên xấu đi." },
      { korean: "장마철인 탓에 비가 자주 온다.", vietnamese: "Do đang mùa mưa nên trời hay mưa." },
      { korean: "어제 눈이 많이 온 탓에 길이 미끄러워요.", vietnamese: "Vì hôm qua tuyết rơi nhiều nên đường rất trơn." },
      { korean: "어제 술을 많이 마신 탓에 오늘 아침에 머리가 아팠어요.", vietnamese: "Vì hôm qua uống nhiều rượu nên sáng nay tôi bị đau đầu." },
      { korean: "시험 문제가 어려운 탓에 학생들의 점수가 좋지 않다.", vietnamese: "Vì đề thi khó nên điểm số của các em học sinh không được cao." },
      { korean: "돈을 없는 탓에 원하는 것을 살 수 없다.", vietnamese: "Vì không có tiền nên không thể mua được thứ mình muốn." },
    ],
    exercises: [
      { question: "밤새도록 드라마를 보는 탓에 아침에 자주 늦게 일어나___.", options: ["요.", "습니다.", "나요.", "나."], answer: 0, explanation: "Hiện tại → 일어나요." },
      { question: "요즘 스트레스를 자주 받는 탓에 건강이 나빠져___.", options: ["요.", "습니다.", "어요.", "어."], answer: 0, explanation: "Hiện tại → 나빠져요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄴ/는 덕분에 (kết quả tốt).",
      "Dùng khi tình huống tích cực.",
      "Quên ý nghĩa đổ lỗi.",
    ],
    tags: ["Đổ lỗi", "Nêu lý do", "Biện hộ", "B1"],
  },
  {
    id: "topik2-6",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – (으)ㄹ까 봐(서)",
    meaning: "vì sợ rằng, e rằng nên...",
    explanation: "Diễn tả người nói vì lo sợ một hành động, sự việc nào đó sẽ xảy ra. Thường kết hợp với 걱정이다/고민이다 ở vế sau. Ở trình độ cao cấp, có thể dùng kèm phó từ: 행여, 혹, 자칫.",
    formation: "A/V + (으)ㄹ까 봐(서)",
    notes: [
      "Lo sợ hành động xảy ra.",
      "Thường kết hợp với 걱정이다/고민이다.",
      "Cao cấp: 행여, 혹, 자칫.",
    ],
    examples: [
      { korean: "비가 올까 봐서 우산을 챙겼어요.", vietnamese: "Vì sợ trời sẽ mưa nên tôi đã mang theo ô." },
      { korean: "내일 학교에 늦게 갈까 봐 일찍 쉬었어요.", vietnamese: "Tôi sợ ngày mai đi học muộn nên đã đi nghỉ sớm." },
      { korean: "발표할 때 한국어를 틀릴까 봐 걱정이에요.", vietnamese: "Tôi đang lo là sẽ sai tiếng Hàn khi phát biểu." },
      { korean: "길이 막힐까 봐 일찍 출발했어요.", vietnamese: "Tôi sợ đường bị tắc nên đã xuất phát sớm." },
      { korean: "시험에 떨어질까 봐 걱정이에요.", vietnamese: "Tôi lo sẽ trượt bài thi." },
      { korean: "주말에 날씨가 나쁠까 봐 걱정이에요.", vietnamese: "Tôi đang lo là cuối tuần thời tiết không đẹp." },
    ],
    exercises: [
      { question: "비가 올까 봐서 우산을 챙겼___.", options: ["어요.", "습니다.", "었어요.", "었어."], answer: 0, explanation: "Quá khứ → 챙겼어요." },
      { question: "늦게 갈까 봐 일찍 쉬었___.", options: ["어요.", "습니다.", "었어요.", "었어."], answer: 0, explanation: "Quá khứ → 쉬었어요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄴ/는 탓에 (đổ lỗi).",
      "Quên ý nghĩa lo sợ.",
      "Dùng khi chắc chắn xảy ra.",
    ],
    tags: ["Nguyên nhân", "Lo sợ", "Phỏng đoán", "TOPIK 2"],
  },
  {
    id: "topik2-7",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – 고 해서",
    meaning: "chủ yếu vì...",
    explanation: "Thể hiện vế trước là lý do tiêu biểu, điển hình trong số nhiều lý do để trở thành việc thực hiện tình huống ở vế sau. Người nói dùng cấu trúc này để đưa ra nguyên nhân chính cho hành động của mình, nhưng cũng ám chỉ rằng còn các nguyên nhân khác nữa.",
    formation: "A/V + 고 해서",
    notes: [
      "Lý do tiêu biểu/điển hình.",
      "Nguyên nhân chính trong nhiều lý do.",
      "Ám chỉ còn lý do khác.",
    ],
    examples: [
      { korean: "손님들이 오고 해서 장을 보러 가요.", vietnamese: "Vì có khách đến nên tôi đi chợ." },
      { korean: "요즘 살이 찌고 해서 다이어트를 하고 있어요.", vietnamese: "Dạo này vì tăng cân nên tôi đang ăn kiêng." },
      { korean: "피곤하고 해서 약속을 취소했습니다.", vietnamese: "Tôi mệt nên đã hủy cuộc hẹn." },
      { korean: "날씨도 좋고 해서 산책하려고 해요.", vietnamese: "Do thời tiết đẹp nên tôi định đi dạo." },
      { korean: "기분도 우울하고 해서 친구랑 술 마시기로 했다.", vietnamese: "Do tâm trạng buồn nên tôi quyết định đi nhậu với bạn bè." },
      { korean: "오늘 피곤하고 해서 일찍 퇴근하다.", vietnamese: "Hôm nay vì mệt nên tôi tan làm sớm." },
      { korean: "늦고 또 비도 오고 해서 택시를 타고 갔습니다.", vietnamese: "Vì bị trễ và trời mưa nữa nên tôi đã đi taxi." },
    ],
    exercises: [
      { question: "피곤하고 해서 약속을 취소했___.", options: ["습니다.", "어요.", "었어요.", "었어."], answer: 0, explanation: "Quá khứ → 취소했습니다." },
      { question: "날씨도 좋고 해서 산책하려고 하___.", options: ["습니다.", "어요.", "겠어요.", "겠어."], answer: 1, explanation: "Kế hoạch → 하려고 해요." },
    ],
    commonMistakes: [
      "Nhầm với 아/어서 (nguyên nhân đơn thuần).",
      "Quên ý nghĩa tiêu biểu/điển hình.",
      "Dùng khi chỉ có 1 lý do.",
    ],
    tags: ["Nguyên nhân", "Lý do chính", "Tiêu biểu", "TOPIK 2"],
  },
  {
    id: "topik2-8",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – (으)므로",
    meaning: "vì...nên...",
    explanation: "Vế trước là lý do, nguyên nhân cho tình huống, trạng thái ở vế sau. Dùng trong văn viết. Vế sau không dùng mệnh lệnh hoặc cầu khiến. Quá khứ 았/었으므로, tương lai (으)ㄹ 것이므로 / 겠으므로.",
    formation: "A/V + (으)므로",
    notes: [
      "Dùng trong văn viết.",
      "Vế sau không mệnh lệnh/cầu khiến.",
      "Quá khứ: 았/었으므로, tương lai: (으)ㄹ 것이므로.",
    ],
    examples: [
      { korean: "전기 제품에 물이 닿으면 위험할 수 있으므로 조심해야 한다.", vietnamese: "Do khi nước tiếp xúc với các thiết bị điện có thể gây nguy hiểm nên phải cẩn thận." },
      { korean: "어린이들은 칫솔질이 서툴고, 단 음식을 즐겨 먹으므로 이가 썩 기 쉽다.", vietnamese: "Vì trẻ nhỏ chưa thành thạo việc đánh răng và thích ăn đồ ngọt nên dễ bị sâu răng." },
      { korean: "열심히 준비하고 있으므로 좋은 결과가 기대됩니다.", vietnamese: "Vì đang chuẩn bị một cách miệt mài nên tôi mong đợi một kết quả tốt." },
      { korean: "이 학생은 매우 노력하므로 앞으로 향상될 가능성이 있다.", vietnamese: "Bởi học sinh này rất nỗ lực nên có khả năng tiến bộ trong tương lai." },
      { korean: "이미 출발했으므로 기차를 탈 수 없습니다.", vietnamese: "Vì tàu hỏa đã khởi hành mất rồi nên không kịp lên tàu." },
      { korean: "신호를 어겼으므로 벌금을 내서야 합니다.", vietnamese: "Do đã vi phạm tín hiệu nên phải nộp tiền phạt." },
    ],
    exercises: [
      { question: "이미 출발했으므로 기차를 탈 수 없___.", options: ["습니다.", "어요.", "습니다.", "어요."], answer: 0, explanation: "Văn viết → 없습니다." },
      { question: "매우 노력하므로 향상될 가능성이 있___.", options: ["다.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Văn viết → 있다." },
    ],
    commonMistakes: [
      "Dùng trong văn nói (thiếu tự nhiên).",
      "Dùng mệnh lệnh/cầu khiến ở vế sau.",
      "Nhầm với 아/어서 (văn nói).",
    ],
    tags: ["Nguyên nhân", "Văn viết", "Trang trọng", "TOPIK 2"],
  },
  {
    id: "topik2-9",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – 아/어서 그런지",
    meaning: "Hình như vì…nên…",
    explanation: "Là dạng kết hợp của 아/어서 mô tả nguyên nhân, lí do và (으)ㄴ지 thể hiện sự không chắc chắn. Vế trước phỏng đoán lý do, nguyên nhân cho tình huống, trạng thái ở vế sau. Vế sau không dùng mệnh lệnh hoặc cầu khiến.",
    formation: "A/V + 아/어서 그런지",
    notes: [
      "Kết hợp 아/어서 + (으)ㄴ지.",
      "Phỏng đoán lý do/nguyên nhân.",
      "Vế sau không mệnh lệnh/cầu khiến.",
    ],
    examples: [
      { korean: "비가 많이 와서 그런지 백화점에 사람이 별로 없네요.", vietnamese: "Hình như vì trời mưa to hay không mà trung tâm thương mại không có mấy người nhỉ." },
      { korean: "밥을 빨리 먹어서 그런지 속이 좀 불편해요.", vietnamese: "Hình như vì ăn cơm nhanh quá hay không mà trong bụng thấy hơi khó chịu." },
      { korean: "문제가 쉬워서 그런지 학생들의 표정이 밝네요.", vietnamese: "Hình như vì đề thi dễ quá hay không mà vẻ mặt của các học sinh rất rạng rỡ." },
      { korean: "아이가 스트레스를 받아서 그런지 힘들어 보여요.", vietnamese: "Hình như vì đứa trẻ bị căng thẳng quá hay không mà trông đứa bé rất mệt mỏi." },
      { korean: "영화가 재미가 없어서인지 자는 사람들이 많았어요.", vietnamese: "Hình như vì bộ phim đó dở quá hay không mà nhiều người đã ngủ." },
      { korean: "날씨가 따뜻해서 그런지 꽃이 더 많이 핀 것 같다.", vietnamese: "Hình như do thời tiết ấm áp hay không mà dường như hoa đã nở thêm rất nhiều." },
    ],
    exercises: [
      { question: "비가 많이 와서 그런지 백화점에 사람이 별로 없___.", options: ["네요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Văn nói → 없네요." },
      { question: "밥을 빨리 먹어서 그런지 속이 좀 불편하___.", options: ["어요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Hiện tại → 불편해요." },
    ],
    commonMistakes: [
      "Nhầm với 아/어서 (chắc chắn).",
      "Dùng mệnh lệnh/cầu khiến ở vế sau.",
      "Quên ý nghĩa phỏng đoán.",
    ],
    tags: ["Nguyên nhân", "Phỏng đoán", "Không chắc chắn", "TOPIK 2"],
  },
  {
    id: "topik2-10",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – 아/어서 그러는데",
    meaning: "Vì chắc chắn là…nên…",
    explanation: "Là dạng kết hợp của 아/어서 mô tả nguyên nhân, lí do và (으)ㄴ데 nhấn mạnh bối cảnh. Động từ 그러하다 rút gọn thành 그러다 kết hợp cùng (으)ㄴ데 sẽ trở thành 아/어서 그러는데. Vế trước khẳng định lý do, nguyên nhân cho tình huống, trạng thái ở vế sau. Vế sau có thể mệnh lệnh hoặc cầu khiến.",
    formation: "A/V + 아/어서 그러는데",
    notes: [
      "Kết hợp 아/어서 + (으)ㄴ데.",
      "Khẳng định lý do/nguyên nhân.",
      "Vế sau có thể mệnh lệnh/cầu khiến.",
    ],
    examples: [
      { korean: "오늘 몸이 좀 안 좋아서 그러는데 일찍 퇴근해도 될까요?", vietnamese: "Vì hôm nay thực sự người tôi không được khỏe nên tôi có thể tan ca sớm được không?" },
      { korean: "이번 주말에 선약이 있어서 그러는데 다음 주말에 만나는 건 어때?", vietnamese: "Vì tôi đã có cuộc hẹn trước vào cuối tuần này nên cuối tuần sau gặp thì thế nào?" },
      { korean: "어제 운동을 좀 많이 해서 그러는데 오늘은 좀 쉬었으면 좋겠어요.", vietnamese: "Vì hôm qua tôi vận động hơi nhiều nên nếu hôm nay được nghỉ thì tốt biết mấy." },
      { korean: "외국인이라서 그러는데 양해 좀 부탁드리겠습니다.", vietnamese: "Vì tôi thực sự là người nước ngoài nên mong bạn thông cảm chút ạ." },
      { korean: "제가 임산부라서 그러는데 이 자리에 앉아도 될까요?", vietnamese: "Vì tôi thực sự là phụ nữ mang thai thế nên ngồi ở chỗ này cũng được chứ?" },
    ],
    exercises: [
      { question: "오늘 몸이 좀 안 좋아서 그러는데 일찍 퇴근해도 될까___.", options: ["요?", "습니까?", "다.", "어."], answer: 0, explanation: "Câu hỏi → 될까요?" },
      { question: "운동을 좀 많이 해서 그러는데 오늘은 좀 쉬었으면 좋겠___.", options: ["어요.", "습니다.", "다.", "어."], answer: 0, explanation: "Mong muốn → 좋겠어요." },
    ],
    commonMistakes: [
      "Nhầm với 아/어서 그런지 (phỏng đoán).",
      "Quên vế sau có thể mệnh lệnh/cầu khiến.",
      "Dùng với tính từ 그렇다 (không tự nhiên).",
    ],
    tags: ["Nguyên nhân", "Chắc chắn", "Bối cảnh", "TOPIK 2"],
  },
  {
    id: "topik2-11",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – 기는 하지만, A/V – 기는 A/V – 지만",
    meaning: "đúng là… nhưng",
    explanation: "Vĩ tố liên kết diễn tả người nói công nhận hoặc thừa nhận nội dung mệnh đề phía trước nhưng muốn bày tỏ, diễn tả rõ việc có quan điểm, ý kiến khác ở mệnh đề sau. Trong văn nói, 기는 하지만 được giản lược thành –긴 하지만 và –기는 –지만 được giản lược thành –긴 –지만. Hình thức quá khứ là 기는 했지만. Ngoài ra còn có thể sử dụng hình thức A/V+기는 하나 hoặc V+기는 하는데 / A+기는 한데.",
    formation: "A/V + 기는 하지만 / A/V + 기는 A/V + 지만",
    notes: [
      "Thừa nhận nội dung mệnh đề trước.",
      "Bày tỏ quan điểm khác ở mệnh đề sau.",
      "Văn nói: -긴 하지만, -긴 -지만.",
    ],
    examples: [
      { korean: "그 원피스가 좋기는 좋지만 너무 비싸서 못 사겠어요.", vietnamese: "Chiếc váy đó thì đẹp nhưng đắt quá nên chắc tôi không mua được." },
      { korean: "아파트에 살기가 편하기는 하지만 애완동물을 못 키워요.", vietnamese: "Đúng là sống ở chung cư tiện lợi nhưng không thể nuôi thú cưng." },
      { korean: "원룸이 편하기는 하지만 좀 시끄러워요.", vietnamese: "Đúng là phòng đơn thì tiện nhưng hơi ồn." },
      { korean: "한국 사람이기는 하지만 매운 음식을 잘 못 먹어요.", vietnamese: "Đúng là người Hàn Quốc thật nhưng không thể ăn đồ ăn cay." },
      { korean: "아프기는 하지만 참을 수 있어요.", vietnamese: "Đúng là đau nhưng mà tôi chịu được." },
      { korean: "재미있기는 했지만 모두 이해하지는 못했어요.", vietnamese: "Hay thì có hay nhưng tôi không hiểu hết được." },
      { korean: "춥기는 하지만 어제보다는 덜 추워요.", vietnamese: "Đúng là lạnh nhưng đỡ lạnh hơn hôm qua." },
      { korean: "보기는 하지만 다 이해할 수 없어요.", vietnamese: "Đúng là tôi có xem nhưng không hiểu được hết." },
    ],
    exercises: [
      { question: "그 원피스가 좋기는 좋지만 너무 비싸서 못 사겠___.", options: ["어요.", "습니다.", "겠어요.", "겠어."], answer: 0, explanation: "Quyết tâm → 못 사겠어요." },
      { question: "아프기는 하지만 참을 수 있___.", options: ["어요.", "습니다.", "다.", "어."], answer: 0, explanation: "Khả năng → 있어요." },
    ],
    commonMistakes: [
      "Nhầm với -지만 (chủ ngữ không cần đồng nhất).",
      "Quên chủ ngữ hai mệnh đề phải đồng nhất.",
      "Dùng quá khứ sai: -았/었기는 했지만 (sai).",
    ],
    tags: ["Tương phản", "Thừa nhận", "Nhượng bộ", "TOPIK 2"],
  },
  {
    id: "topik2-12",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V - (으)ㄴ/는데도",
    meaning: "Mặc dù...nhưng ..., dù...nhưng (vẫn)...",
    explanation: "Là sự kết hợp của - (으)ㄴ/는데 và - 아/어도. Vĩ tố liên kết được sử dụng khi kết quả ở vế sau trái ngược với mong đợi, mục đích hành động ở vế trước. Sau - (으)ㄴ/는데도, có thể thêm 불구하고 để nhấn mạnh. Ngoài ra còn có thể dùng cấu trúc N + 에 불구하고 hoặc danh từ hoá mệnh đề: A/V+ (으)ㅁ에도 불구하고.",
    formation: "A + (으)ㄴ데도 / V + 는데도 / V(qua khứ) + (으)ㄴ데도",
    notes: [
      "Kết hợp -(으)ㄴ/데 + 아/어도.",
      "Kết quả trái ngược mong đợi.",
      "Có thêm 불구하고 để nhấn mạnh.",
    ],
    examples: [
      { korean: "선생님이 내일 시험이 있다고 하셨는데도 학생들은 공부를 안 했어요.", vietnamese: "Mặc dù cô giáo đã nói là ngày mai sẽ có bài thi nhưng học sinh thì không chịu học." },
      { korean: "유리 씨는 많이 먹는데도 살이 안 쪄요.", vietnamese: "Yuri dù ăn nhiều nhưng không bị tăng cân." },
      { korean: "영희는 부모님의 반대에도 불구하고 일본 남자와 결혼했다.", vietnamese: "Dù bố mẹ phản đối nhưng Young Hee vẫn kết hôn với người đàn ông Nhật Bản." },
      { korean: "제 친구는 월급이 많은데도 회사를 그만두고 싶어해요.", vietnamese: "Mặc dù lương cao nhưng bạn tôi vẫn muốn nghỉ việc." },
      { korean: "평일인데도 극장에 사람이 많아요.", vietnamese: "Mặc dù là ngày thường nhưng ở rạp chiếu phim vẫn đông người." },
      { korean: "그 여자가 예쁜데도 좋아하는 사람이 없어요.", vietnamese: "Dù cô gái đó rất đẹp nhưng lại không có người thích." },
      { korean: "열심히 공부를 했음에도 불구하고 성적이 오르지 않아요.", vietnamese: "Dù đã chăm chỉ học hành nhưng thành tích vẫn không tăng lên." },
    ],
    exercises: [
      { question: "선생님이 내일 시험이 있다고 하셨는데도 학생들은 공부를 안 했___.", options: ["어요.", "습니다.", "었어요.", "었어."], answer: 0, explanation: "Quá khứ → 안 했어요." },
      { question: "월급이 많은데도 회사를 그만두고 싶어하___.", options: ["어요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Mong muốn → 싶어해요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄴ/는데 (không nhấn mạnh trái ngược).",
      "Quên ý nghĩa trái ngược mong đợi.",
      "Dùng sai thì của vế trước.",
    ],
    tags: ["Tương phản", "Mặc dù", "Trái ngược", "TOPIK 2"],
  },
  {
    id: "topik2-13",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – (으)ㄴ/는 반면(에)",
    meaning: "trái lại, nhưng",
    explanation: "Vĩ tố liên kết: Mệnh đề trước và sau có nội dung trái ngược nhau. A + (으)ㄴ 반면(에) thời hiện tại. V + (으)ㄴ 반면(에) thời quá khứ, V + 는 반면(에) thời hiện tại. Ngoài ra có thể sử dụng khi muốn diễn đạt cả mặt tích cực và tiêu cực về một sự việc nào đó trong cùng một câu. Dùng nhiều trong văn viết.",
    formation: "A + (으)ㄴ 반면(에) / V(qua khứ) + (으)ㄴ 반면(에) / V(hiện tại) + 는 반면(에)",
    notes: [
      "Mệnh đề trước/sau trái ngược.",
      "A: (으)ㄴ 반면(에), V(qua khứ): (으)ㄴ 반면(에), V(hiện tại): 는 반면(에).",
      "Dùng nhiều trong văn viết.",
    ],
    examples: [
      { korean: "저는 읽기는 잘하는 반면에 말하기는 잘 못해요.", vietnamese: "Tôi đọc giỏi nhưng trái lại nói thì kém." },
      { korean: "그 가방은 비싼 반면에 질이 좋아요.", vietnamese: "Chiếc túi xách đó đắt nhưng trái lại chất lượng tốt." },
      { korean: "지하철은 빠른 반면에 출퇴근 시간에는 사람이 많습니다.", vietnamese: "Tàu điện ngầm nhanh nhưng lại đông đúc vào giờ cao điểm." },
      { korean: "요즘 수입은 증가하는 반면에 수출은 감소하고 있다.", vietnamese: "Gần đây nhập khẩu tăng lên nhưng trái lại xuất khẩu lại giảm." },
      { korean: "일은 많은 반면에 월급은 적어서 회사를 옮길까 해요.", vietnamese: "Công việc nhiều nhưng trái lại lương lại thấp nên tôi định chuyển công ty khác." },
      { korean: "이 식당은 음식이 맛있는 반면에 서비스가 안 좋아요.", vietnamese: "Nhà hàng này món ăn thì ngon nhưng ngược lại dịch vụ thì không tốt." },
    ],
    exercises: [
      { question: "저는 읽기는 잘하는 반면에 말하기는 잘 못하___.", options: ["어요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Hiện tại → 못해요." },
      { question: "그 가방은 비싼 반면에 질이 좋___.", options: ["아요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Hiện tại → 좋아요." },
    ],
    commonMistakes: [
      "Nhầm với -지만 (đơn thuần tương phản).",
      "Dùng sai thì của vế trước.",
      "Quên ý nghĩa trái ngược.",
    ],
    tags: ["Tương phản", "So sánh", "Tích cực tiêu cực", "TOPIK 2"],
  },
  {
    id: "topik2-14",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – (으)ㄴ/는 데 반해(서)",
    meaning: "trái lại, nhưng",
    explanation: "Là tố liên kết biểu hiện nội dung trái ngược, đối lập với nhau giữa 2 mệnh đề trước và sau. Dùng nhiều trong văn viết. A + (으)ㄴ 데 반해(서) thời hiện tại. V + (으)ㄴ 데 반해(서) thời quá khứ, V + 는 데 반해(서) thời hiện tại.",
    formation: "A + (으)ㄴ 데 반해(서) / V(qua khứ) + (으)ㄴ 데 반해(서) / V(hiện tại) + 는 데 반해(서)",
    notes: [
      "Nội dung trái ngược/đối lập.",
      "Dùng nhiều trong văn viết.",
      "A: (으)ㄴ, V(qua khứ): (으)ㄴ, V(hiện tại): 는.",
    ],
    examples: [
      { korean: "그 직업은 불안정한 데 반해 즐겁게 일할 수 있잖아요.", vietnamese: "Công việc đó không ổn định nhưng trái làm việc thấy thú vị còn gì." },
      { korean: "그 아파트는 가격이 비싼 데 반해 살기가 아주 좋아요.", vietnamese: "Chung cư đó giá đắt nhưng trái lại việc sống ở đó rất tốt." },
      { korean: "그 회사는 돈을 많이 주는 데 반해 일을 너무 많이 시켜요.", vietnamese: "Công ty đó trả tiền công cao nhưng trái lại việc phải làm rất nhiều." },
      { korean: "물가가 증가하는 데 반해서 소득은 감소한 것으로 나타났다.", vietnamese: "Vật giá gia tăng trái lại thu nhập lại giảm." },
      { korean: "취직하기가 어려운 데 반해 대학 졸업자 수는 증가하고 있다.", vietnamese: "Số lượng sinh viên tốt nghiệp đại học ngày càng nhiều nhưng trái lại xin việc lại càng khó." },
      { korean: "나는 채식 위주의 식생활을 하고 있는 데 반해 내 친구는 육식 위주의 식생활을 하고 있다.", vietnamese: "Tôi đang sinh hoạt ăn uống coi ăn chay làm trọng thì ngược lại bạn tôi lại xem trọng việc ăn thịt." },
      { korean: "30 대의 지지율이 하락한 데 반해 40 대의 지지율은 상승했어요.", vietnamese: "Trái ngược với việc tỷ lệ tán thành đã giảm xuống với những người ở độ tuổi 30 thì lại tăng lên với những người ở độ tuổi 40." },
    ],
    exercises: [
      { question: "그 아파트는 가격이 비싼 데 반해 살기가 아주 좋___.", options: ["아요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Hiện tại → 좋아요." },
      { question: "30 대의 지지율이 하락한 데 반해 40 대의 지지율은 상승했___.", options: ["어요.", "습니다.", "었어요.", "었어."], answer: 0, explanation: "Quá khứ → 상승했어요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄴ/는 반면(에) (tương tự nhưng khác ngữ cảnh).",
      "Dùng sai thì của vế trước.",
      "Quên ý nghĩa trái ngược.",
    ],
    tags: ["Tương phản", "Văn viết", "Đối lập", "TOPIK 2"],
  },
  {
    id: "topik2-15",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – ㅂ/습니까만",
    meaning: "trái lại, nhưng",
    explanation: "Vĩ tố liên kết thể hiện mệnh đề trước và sau có nội dung trái ngược, đối lập với nhau. Dùng trong văn nói với tình huống trang trọng, lịch sự. Tạo cảm giác liền mạch trong câu nói.",
    formation: "A + 습니까만 / V + ㅂ니까만",
    notes: [
      "Nội dung trái ngược/đối lập.",
      "Văn nói trang trọng/lịch sự.",
      "Tạo cảm giác liền mạch.",
    ],
    examples: [
      { korean: "도와드리고 싶습니다만 오늘은 바빠서 도와드릴 수 없습니다.", vietnamese: "Tôi muốn giúp đỡ anh nhưng vì hôm nay tôi bận nên không thể giúp được ạ." },
      { korean: "죄송합니다만 일이 있어서 저는 먼저 가겠습니다.", vietnamese: "Xin lỗi nhưng vì tôi có việc nên tôi xin phép đi trước ạ." },
      { korean: "초대해 주셔서 감사합니다만 선약이 있어서 갈 수 없습니다.", vietnamese: "Cảm ơn vì đã mời tôi nhưng tôi có hẹn trước nên không thể đi được ạ." },
      { korean: "미안합니다만 다시 한번 설명해 주세요.", vietnamese: "Xin lỗi nhưng làm ơn hãy giải thích lại một lần nữa cho tôi." },
      { korean: "자리가 몇 개 남았습니다만 좋은 자리가 아닙니다.", vietnamese: "Vẫn còn lại vài chỗ ngồi nhưng không phải là chỗ tốt ạ." },
    ],
    exercises: [
      { question: "도와드리고 싶습니다만 오늘은 바빠서 도와드릴 수 없___.", options: ["습니다.", "어요.", "해요.", "해."], answer: 0, explanation: "Trang trọng → 없습니다." },
      { question: "초대해 주셔서 감사합니다만 선약이 있어서 갈 수 없___.", options: ["습니다.", "어요.", "해요.", "해."], answer: 0, explanation: "Trang trọng → 없습니다." },
    ],
    commonMistakes: [
      "Nhầm với -지만 (không trang trọng).",
      "Quên ý nghĩa lịch sự/trang trọng.",
      "Dùng trong văn viết (thiếu tự nhiên).",
    ],
    tags: ["Tương phản", "Lịch sự", "Trang trọng", "TOPIK 2"],
  },
  {
    id: "topik2-16",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – (으)면서(도)",
    meaning: "dù cũng, dù vẫn...",
    explanation: "Vĩ tố liên kết thể hiện mệnh đề trước và sau có nội dung trái ngược, đối lập với nhau. Tạo cảm giác 2 hành động trạng thái vẫn diễn ra song song nhưng có sự đối lập.",
    formation: "A + (으)면서(도) / V + (으)면서(도)",
    notes: [
      "Nội dung trái ngược/đối lập.",
      "Hành động song song nhưng đối lập.",
      "Tạo cảm giác dù vẫn/dù cũng.",
    ],
    examples: [
      { korean: "그 사람은 모르면서도 항상 아는 척해요.", vietnamese: "Người đó mặc dù không biết nhưng luôn giả vờ như là biết." },
      { korean: "영호 씨는 키가 작으면서도 농구를 잘해요.", vietnamese: "Young-ho mặc dù thấp nhưng chơi bóng rổ giỏi." },
      { korean: "유리 씨는 돈이 많으면서도 항상 절약해요.", vietnamese: "Yu-ri mặc dù có nhiều tiền nhưng luôn luôn tiết kiệm." },
      { korean: "그 책을 다 읽었으면서도 기억을 못 해요.", vietnamese: "Mặc dù đã đọc hết cuốn sách đó nhưng không thể nhớ nổi." },
      { korean: "그 사람은 부자면서도 가난한 사람을 도와주지 않아요.", vietnamese: "Mặc dù người đó là người giàu có nhưng không giúp đỡ người nghèo khó." },
      { korean: "저 사람은 선생님이면서 학생들을 챙기지 않아요.", vietnamese: "Người đó mặc dù là giáo viên nhưng không trông nom học sinh." },
    ],
    exercises: [
      { question: "그 사람은 모르면서도 항상 아는 척하___.", options: ["어요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Hiện tại → 해요." },
      { question: "유리 씨는 돈이 많으면서도 항상 절약하___.", options: ["어요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Hiện tại → 해요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄴ/는데도 (không nhấn mạnh song song).",
      "Quên ý nghĩa song song.",
      "Dùng sai thì của vế trước.",
    ],
    tags: ["Tương phản", "Song song", "Đối lập", "TOPIK 2"],
  },
  {
    id: "topik2-17",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – 다가도",
    meaning: "dù đang...",
    explanation: "Vĩ tố liên kết thể hiện hành vi hay trạng thái mà vế trước diễn tả dễ dàng bị chuyển sang hành vi hay trạng thái khác. Là sự kết hợp của 다가 và 아/어도.",
    formation: "V + 다가도",
    notes: [
      "Dễ dàng chuyển sang trạng thái khác.",
      "Kết hợp 다가 + 아/어도.",
      "Diễn tả sự thay đổi đột ngột.",
    ],
    examples: [
      { korean: "요즘 지수는 영어 공부를 열심히 해서인지 자다가도 영어로 말을 하곤 한다.", vietnamese: "Dạo này Jisoo học tiếng Anh chăm chỉ đến mức cô ấy thường xuyên nói tiếng Anh ngay cả khi đang ngủ." },
      { korean: "강아지는 주인이 오면 기분 좋게 날뛰다가도 낯선 사람이 보이면 마구 짖어댄다.", vietnamese: "Nếu chủ đến, con chó dù có đang vui vẻ chạy đên cũng sủa dữ dội khi thấy người lạ." },
      { korean: "추석이 지나자 낮에는 따뜻하다가도 해가 지면 쌀쌀해요.", vietnamese: "Sau lễ Trung Thu, ban ngày trời dù có đang ấm áp nhưng nếu mặt trời lặn thì sẽ lạnh." },
      { korean: "아이는 울다가도 사탕만 주면 금방 웃는다.", vietnamese: "Ngay cả khi một đứa trẻ đang khóc, nó sẽ ngay lập tức mỉm cười nếu bạn cho nó kẹo." },
      { korean: "평소에 괜찮다가도 비만 오면 다시 아파요.", vietnamese: "Bình thường thì không sao nhưng khi trời mưa lại đau." },
    ],
    exercises: [
      { question: "요즘 지수는 영어 공부를 열심히 해서인지 자다가도 영어로 말을 하곤 하___.", options: ["다.", "어요.", "습니다.", "해요."], answer: 0, explanation: "Văn viết → 한다." },
      { question: "추석이 지나자 낮에는 따뜻하다가도 해가 지면 쌀쌀하___.", options: ["어요.", "습니다.", "다.", "해요."], answer: 0, explanation: "Hiện tại → 쌀쌀해요." },
    ],
    commonMistakes: [
      "Nhầm với 아/어도 (không nhấn mạnh sự thay đổi).",
      "Quên ý nghĩa chuyển trạng thái.",
      "Dùng với tính từ (chỉ dùng với động từ).",
    ],
    tags: ["Tương phản", "Chuyển trạng thái", "Đột ngột", "TOPIK 2"],
  },
  {
    id: "topik2-18",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "V – 는 사이에",
    meaning: "trong lúc, giữa lúc làm gì đó",
    explanation: "Vĩ tố liên kết sử dụng khi muốn thể hiện thời gian ngắn nào đó giữa lúc hành động hay tình huống nào đó diễn ra.",
    formation: "V + 는 사이에",
    notes: [
      "Thời gian ngắn giữa hành động.",
      "Diễn tả sự thay đổi trong lúc.",
      "Thường dùng với quá khứ.",
    ],
    examples: [
      { korean: "우리도 모르는 사이에 자연 환경이 많이 파괴되었어요.", vietnamese: "Môi trường tự nhiên đã bị hủy hoại rất nhiều trong lúc chúng ta không hề hay biết." },
      { korean: "잠시 화장실 다녀오는 사이에 전화가 왔네요.", vietnamese: "Đang đi vệ sinh một lúc thì có cuộc gọi đến." },
      { korean: "눈이 깜짝할 사이에 핸드폰을 훔치고 도망갔다.", vietnamese: "Trong nháy mắt, tên trộm đã trộm điện thoại và tẩu thoát." },
      { korean: "얼마나 배가 고팠는지 눈 깜짝할 사이에 밥을 다 먹어 버렸다.", vietnamese: "Không biết bụng đã đói bao nhiêu mà trong chớp mắt đã ăn hết tất cả rồi." },
      { korean: "엄마가 화장실에 간 사이에 아이가 집을 나갔다.", vietnamese: "Trong lúc mẹ đi vệ sinh thì đứa bé đã đi ra khỏi nhà." },
      { korean: "저는 샤워하는 사이에 친구가 전화를 했다.", vietnamese: "Trong lúc tôi tắm thì bạn tôi gọi điện đến." },
      { korean: "수업 중에 다른 생각을 하는 사이에 중요한 부분을 놓치고 말았다.", vietnamese: "Trong giờ học trong khi nghĩ về thứ khác thì tôi đã bỏ lỡ phần quan trọng của tiết học." },
      { korean: "잠깐 조는 사이에 내려야할 지하철역을 지나치고 말았다.", vietnamese: "Trong lúc chợp mắt một chút xíu thì tôi đã đi qua ga tàu điện ngầm nơi tôi phải xuống." },
    ],
    exercises: [
      { question: "우리도 모르는 사이에 자연 환경이 많이 파괴되었___.", options: ["어요.", "습니다.", "었어요.", "었어."], answer: 0, explanation: "Quá khứ → 파괴되었어요." },
      { question: "잠시 화장실 다녀오는 사이에 전화가 왔___.", options: ["어요.", "습니다.", "었어요.", "었어."], answer: 0, explanation: "Quá khứ → 왔어요." },
    ],
    commonMistakes: [
      "Nhầm với 는 동안에 (thời gian dài hơn).",
      "Quên ý nghĩa thời gian ngắn.",
      "Dùng với tính từ (chỉ dùng với động từ).",
    ],
    tags: ["Thời gian", "Trong lúc", "Ngắn", "TOPIK 2"],
  },
  {
    id: "topik2-19",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – 아/어야",
    meaning: "chỉ khi...mới..., chỉ có...mới...",
    explanation: "Vĩ tố liên kết thể hiện hành động hay trạng thái ở vế trước là điều kiện thiết yếu cho tình huống ở vế sau. Trong văn nói, có thể sử dụng ở dạng –아/어 야지, văn viết 아/어야만. Ở dạng 아/어 봐야: Vĩ tố liên kết thể hiện điều giả định ở trước rốt cuộc không có ảnh hưởng gì.",
    formation: "A/V + 아/어야",
    notes: [
      "Điều kiện thiết yếu.",
      "Văn nói: 아/어 야지, văn viết: 아/어야만.",
      "Không dùng với sự thật hiển nhiên.",
    ],
    examples: [
      { korean: "토픽 시험을 통과해야 한국으로 유학할 수 있어요.", vietnamese: "Chỉ khi vượt qua kỳ thi Topik thì mới có thể đi du học Hàn Quốc." },
      { korean: "여권이 있어야 해외 여행을 갈 수 있지요.", vietnamese: "Phải có hộ chiếu thì mới đi du lịch nước ngoài được chứ." },
      { korean: "무엇보다도 음식이 맛있어야 손님이 많이 와요.", vietnamese: "Hơn hết thì đồ ăn phải ngon thì mới có nhiều khách đến." },
      { korean: "연습을 많이 해야 발음이 좋아집니다.", vietnamese: "Phải luyện tập nhiều thì phát âm mới tốt lên được." },
      { korean: "졸려서 커피를 한 잔 마셔야 정신이 날 것 같아요.", vietnamese: "Buồn ngủ quá có lẽ phải uống một ly cà phê mới tỉnh được." },
      { korean: "한국말을 잘해야 한국 회사에 취직할 수 있어요.", vietnamese: "Phải giỏi tiếng Hàn thì mới xin việc vào công ty Hàn được." },
    ],
    exercises: [
      { question: "토픽 시험을 통과해야 한국으로 유학할 수 있___.", options: ["어요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Khả năng → 있어요." },
      { question: "연습을 많이 해야 발음이 좋아집니___.", options: ["다.", "어요.", "습니다.", "해요."], answer: 0, explanation: "Văn viết → 좋아집니다." },
    ],
    commonMistakes: [
      "Nhầm với (으)면 (điều kiện thông thường).",
      "Dùng với sự thật hiển nhiên (phải dùng (으)면).",
      "Quên ý nghĩa điều kiện thiết yếu.",
    ],
    tags: ["Điều kiện", "Thiết yếu", "Yêu cầu", "TOPIK 2"],
  },
  {
    id: "topik2-20",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – 고야",
    meaning: "...mất rồi, nếu như vậy... mà lại...",
    explanation: "Vĩ tố liên kết nhấn mạnh động tác hay hành vi đã kết thúc hay đến cuối được thực hiện. Ở dạng 고야 말다 là dạng nhấn mạnh hơn của 고 말다. Vĩ tố liên kết nhấn mạnh vế trước trở thành điều kiện của vế sau. Sử dụng ở dạng 아/어 가지고야 và ở dạng nghi vấn.",
    formation: "A/V + 고야",
    notes: [
      "Nhấn mạnh hành động đã kết thúc.",
      "Dạng 고야 말다 nhấn mạnh hơn 고 말다.",
      "Dạng 아/어 가지고야 và nghi vấn.",
    ],
    examples: [
      { korean: "그렇게 운동해 가지고야 살이 빠지겠니?", vietnamese: "Tập thể dục như vậy mà lại giảm được cân à?" },
      { korean: "그렇게 느릿느릿 해 가지고야 대체 언제 청소를 끝낼래?", vietnamese: "Làm chậm như vậy thì rốt cục tới chừng nào mới dọn xong." },
      { korean: "그렇게 쉬면서 해 가지고야 마감 시간에 맞출 수 있겠어요?", vietnamese: "Vừa nghỉ vừa làm như vậy thì có thể kịp deadline không vậy?" },
      { korean: "이래 가지고야 제시간에 도착할 수 있을까?", vietnamese: "Cứ như vậy thì có thể tới đúng giờ không nhỉ?" },
    ],
    exercises: [
      { question: "그렇게 운동해 가지고야 살이 빠지겠___.", options: ["니?", "어요?", "습니까?", "해요?"], answer: 0, explanation: "Câu hỏi → 겠니?" },
      { question: "이래 가지고야 제시간에 도착할 수 있___.", options: ["을까?", "어요?", "습니까?", "해요?"], answer: 0, explanation: "Câu hỏi → 을까?" },
    ],
    commonMistakes: [
      "Nhầm với 고 말다 (không nhấn mạnh).",
      "Quên ý nghĩa điều kiện tiêu cực.",
      "Dùng trong văn khẳng định (thường dùng nghi vấn).",
    ],
    tags: ["Điều kiện", "Nhấn mạnh", "Tiêu cực", "TOPIK 2"],
  },
  {
    id: "topik2-21",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V - 거든",
    meaning: "nếu...",
    explanation: "Vĩ tố liên kết thể hiện điều kiện hay một sự giả định. Mệnh đề phía sau thường là thể mệnh lệnh, cầu khiến, khuyên nhủ, hứa hẹn -(으)세요, -(으)ㅂ시다, -(으)ㄹ게요 hay là thể hiện sự suy đoán, ý chí -겠-, -(으)ㄹ 것이다, -(으)려고 하다. Thường sử dụng trong văn nói. Không dùng với các giả định là sự thật hiển nhiên.",
    formation: "A/V + 거든",
    notes: [
      "Điều kiện/giả định.",
      "Vế sau mệnh lệnh/cầu khiến/khuyên nhủ/hứa hẹn.",
      "Không dùng với sự thật hiển nhiên.",
    ],
    examples: [
      { korean: "다음에 베트남에 오거든 꼭 연락하세요.", vietnamese: "Tuần sau nếu đến Việt Nam thì nhất định phải liên lạc nhé." },
      { korean: "바쁘지 않거든 저녁을 같이 먹읍시다.", vietnamese: "Nếu không bận thì cùng nhau đi ăn tối đi." },
      { korean: "벚꽃이 피거든 서울에 꽃 구경을 하러 갑시다.", vietnamese: "Nếu hoa anh đào nở thì chúng ta hãy đi ngắm hoa ở Seoul đi." },
      { korean: "할 말이 있거든 오늘 일이 끝난 후에 하세요.", vietnamese: "Nếu có gì cần nói thì hôm nay sau khi xong việc thì hãy nói nha." },
      { korean: "고향에 도착하거든 전화하세요.", vietnamese: "Nếu đến về đến quê thì hãy gọi cho tôi nhé." },
    ],
    exercises: [
      { question: "다음에 베트남에 오거든 꼭 연락하세___.", options: ["요.", "십시오.", "해요.", "해."], answer: 0, explanation: "Mệnh lệnh → 연락하세요." },
      { question: "바쁘지 않거든 저녁을 같이 먹읍시___.", options: ["다.", "어요.", "시오.", "해요."], answer: 0, explanation: "Cầu khiến → 먹읍시다." },
    ],
    commonMistakes: [
      "Nhầm với (으)면 (điều kiện thông thường).",
      "Dùng với sự thật hiển nhiên (phải dùng (으)면).",
      "Quên ý nghĩa giả định.",
    ],
    tags: ["Điều kiện", "Giả định", "Văn nói", "TOPIK 2"],
  },
  {
    id: "topik2-22",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A-다면, V-ㄴ/는다면",
    meaning: "Giả sử, nếu như...",
    explanation: "Thể hiện giả định hay điều kiện cho một việc gì đó. Câu điều kiện loại II. So với (으)면 thì (ㄴ/는)다면 thể hiện: (1) các trường hợp với khả năng hiện thực hóa tương đối thấp, (2) dùng với các giả định mà không có khả năng ngay từ ban đầu. (3) Giả định điều mà người nói không hề hi vọng xảy ra trên thực tế. Thường kết hợp với phó từ 만약(에), 만일.",
    formation: "A + 다면 / V + ㄴ/는다면",
    notes: [
      "Khả năng hiện thực hóa thấp.",
      "Giả định không có khả năng từ đầu.",
      "Không hi vọng xảy ra.",
      "Thường kết hợp 만약/만일.",
    ],
    examples: [
      { korean: "다시 태어난다면 남자가 되고 싶어요.", vietnamese: "Nếu được sinh ra lại một lần nữa thì tôi muốn trở thành con trai." },
      { korean: "해가 서쪽에서 뜬다면 네가 이민호 배우와 결혼할 거야.", vietnamese: "Nếu mặt trời mọc hướng Tây thì tôi sẽ kết hôn với diễn viên Lee Min Ho." },
      { korean: "시험에 합격을 한다면 얼마나 좋겠어요.", vietnamese: "Nếu mà thi đỗ thì sung sướng biết bao nhiêu." },
      { korean: "복권에 당첨된다면 전액을 사회에 기부하겠어요.", vietnamese: "Nếu mà trúng vé số thì tôi sẽ quyên góp toàn bộ số tiền cho xã hội." },
      { korean: "내가 부자라면 먼저 좋은 집을 사겠다.", vietnamese: "Nếu là người giàu có thì tôi sẽ mua một ngôi nhà đẹp trước tiên." },
      { korean: "내가 새라면 하늘을 날 수 있을 텐데.", vietnamese: "Nếu là một chú chim thì có lẽ tôi có thể bay lên bầu trời." },
    ],
    exercises: [
      { question: "다시 태어난다면 남자가 되고 싶___.", options: ["어요.", "습니다.", "겠어요.", "겠어."], answer: 0, explanation: "Mong muốn → 싶어요." },
      { question: "복권에 당첨된다면 전액을 사회에 기부하겠___.", options: ["어요.", "습니다.", "다.", "어."], answer: 0, explanation: "Hứa hẹn → 하겠어요." },
    ],
    commonMistakes: [
      "Nhầm với (으)면 (điều kiện thông thường).",
      "Quên ý nghĩa khả năng thấp.",
      "Dùng với giả định khả năng cao.",
    ],
    tags: ["Điều kiện", "Giả định", "Khả năng thấp", "TOPIK 2"],
  },
  {
    id: "topik2-23",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V-았/었더라면",
    meaning: "Nếu mà đã... thì đã..., Giả sử đã... thì đã",
    explanation: "Nói về một giả định trái ngược với việc đã xảy ra trong quá khứ. Hoặc thể hiện sự nuối tiếc, ân hận về việc đã trải qua. Vế sau thường sử dụng dạng phỏng đoán -았/었을 텐데, -았/었을 것이다, -았/었을걸요, hoặc -(으)ㄹ 뻔했다. Có thể thay thế bằng 았/었으면.",
    formation: "A/V + 았/었더라면",
    notes: [
      "Giả định trái ngược quá khứ.",
      "Nuối tiếc/ân hận.",
      "Vế sau phỏng đoán.",
      "Có thể thay bằng 았/었으면.",
    ],
    examples: [
      { korean: "노래를 잘 불렀더라면 가수가 되었을 거예요.", vietnamese: "Nếu hát hay thì có lẽ tôi đã trở thành ca sĩ." },
      { korean: "지수 씨가 연습을 많이 했더라면 실수하지 않았을 텐데요.", vietnamese: "Nếu Jisoo luyện tập nhiều hơn thì có lẽ đã không mắc sai lầm." },
      { korean: "고등학교 때 공부를 열심히 했더라면 원하는 대학에 갈 수 있었을 텐데요.", vietnamese: "Nếu hồi cấp 3 chăm chỉ học thì có lẽ đã có thể bước vào trường đại học mà mình mong muốn." },
      { korean: "아침에 일기예보를 들었더라면 산에 가지 않았을 텐데.", vietnamese: "Nếu sáng nay tôi nghe bản tin dự báo thời tiết thì có lẽ tôi đã không đi lên núi." },
      { korean: "키가 좀 더 컸더라면 농구 선수가 되었을 거예요.", vietnamese: "Nếu cao thêm xíu nữa thì đã có thể trở thành vận động viên bóng rổ." },
      { korean: "준비를 잘 했더라면 그렇게 긴장하지는 않았을 텐데.", vietnamese: "Nếu đã chuẩn bị tốt hơn thì có lẽ đã không căng thẳng như vậy." },
    ],
    exercises: [
      { question: "노래를 잘 불렀더라면 가수가 되었을 거___.", options: ["예요.", "입니다.", "어요.", "어."], answer: 0, explanation: "Phỏng đoán → 거예요." },
      { question: "연습을 많이 했더라면 실수하지 않았을 텐데___.", options: ["요.", "습니다.", "다.", "어."], answer: 0, explanation: "Phỏng đoán → 텐데요." },
    ],
    commonMistakes: [
      "Nhầm với 았/었으면 (tương tự).",
      "Quên ý nghĩa nuối tiếc.",
      "Dùng với giả định tương lai.",
    ],
    tags: ["Điều kiện", "Quá khứ", "Nuối tiếc", "TOPIK 2"],
  },
  {
    id: "topik2-24",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "V - (으)ㄹ 뻔하다",
    meaning: "suýt chút nữa",
    explanation: "Thể hiện một việc nguy hiểm hay không tốt nào đó có khả năng xảy ra nhưng may mắn đã không xảy ra. Cấu trúc này luôn dùng ở thì quá khứ. Cao cấp dùng với các phó từ: 하마터면, 자칫하면, 까딱하면.",
    formation: "V + (으)ㄹ 뻔하다",
    notes: [
      "Việc nguy hiểm/không tốt.",
      "May mắn không xảy ra.",
      "Luôn dùng quá khứ.",
      "Cao cấp: 하마터면, 자칫하면, 까딱하면.",
    ],
    examples: [
      { korean: "아침에 늦게 일어나서 지각할 뻔했어요.", vietnamese: "Sáng nay vì dậy muộn nên suýt chút nữa thì trễ giờ." },
      { korean: "어렸을 때 수영하다가 물에 빠질 뻔했거든요.", vietnamese: "Bởi vì khi còn bé lúc đang bơi thì suýt chút nữa bị chết đuối." },
      { korean: "급하게 뛰어오다가 넘어질 뻔했어요.", vietnamese: "Đang chạy vội thì suýt bị ngã." },
      { korean: "운전 중에 통화를 하다가 사고가 날 뻔했어요.", vietnamese: "Nghe điện thoại trong lúc lái xe nên suýt thì xảy ra tai nạn." },
      { korean: "조금만 늦었으면 기차를 놓칠 뻔했어요.", vietnamese: "Muộn chút nữa thôi là suýt chút nữa lỡ tàu rồi." },
      { korean: "길이 너무 미끄러워서 학교에 오다가 넘어질 뻔했어요.", vietnamese: "Đường quá trơn nên lúc đi học, tôi suýt bị ngã." },
      { korean: "기차표를 미리 사지 않았으면 고향에 못 갈 뻔했어요.", vietnamese: "Nếu không mua vé trước thì suýt nữa tôi đã không thể về quê." },
    ],
    exercises: [
      { question: "아침에 늦게 일어나서 지각할 뻔했___.", options: ["어요.", "습니다.", "었어요.", "었어."], answer: 0, explanation: "Quá khứ → 했어요." },
      { question: "급하게 뛰어오다가 넘어질 뻔했___.", options: ["어요.", "습니다.", "었어요.", "었어."], answer: 0, explanation: "Quá khứ → 했어요." },
    ],
    commonMistakes: [
      "Dùng với hiện tại/tương lai.",
      "Quên ý nghĩa suýt xảy ra.",
      "Nhầm với (으)ㄹ 뻔했다 (quá khứ hoàn thành).",
    ],
    tags: ["Suýt", "Nguy hiểm", "Quá khứ", "TOPIK 2"],
  },
  {
    id: "topik2-25",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A - 아/어 보이다",
    meaning: "có vẻ..., trông/nhìn có vẻ/như là...",
    explanation: "Diễn tả sự phỏng đoán hoặc cảm nhận của bạn dựa trên vẻ ngoài của con người, sự vật, sự việc. Chủ ngữ đã nhìn thấy và thuật lại.",
    formation: "A + 아/어 보이다",
    notes: [
      "Phỏng đoán dựa vẻ ngoài.",
      "Chủ ngữ đã nhìn thấy.",
      "Thuật lại cảm nhận.",
      "Chỉ dùng với tính từ.",
    ],
    examples: [
      { korean: "많이 힘들어 보이는데 괜찮을까요?", vietnamese: "Trông bạn có vẻ mệt mỏi, bạn không sao chứ?" },
      { korean: "머리를 묶으니까 젊어 보여요.", vietnamese: "Bạn buộc tóc nhìn trông trẻ hơn." },
      { korean: "지금 괜찮으세요? 슬퍼 보여요.", vietnamese: "Bạn không sao chứ? Trông bạn có vẻ buồn." },
      { korean: "이 치마를 입으니까 젊어 보여요.", vietnamese: "Bạn mặc váy này trông có vẻ trẻ." },
      { korean: "김치가 매워 보이네요.", vietnamese: "Kimchi nhìn có vẻ cay." },
      { korean: "이 케이크가 맛있어 보여서 샀는데, 너무 달아요.", vietnamese: "Chiếc bánh này trông có vẻ ngon nên tôi đã mua nhưng nó ngọt quá." },
      { korean: "얼굴이 피곤해 보여요.", vietnamese: "Trông bạn có vẻ mệt." },
      { korean: "가방이 무거워 보이는데 들어 드릴까요?", vietnamese: "Trông túi xách có vẻ nặng, để tôi xách giúp nhé?" },
    ],
    exercises: [
      { question: "머리를 묶으니까 젊어 보이___.", options: ["어요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Hiện tại → 보여요." },
      { question: "김치가 매워 보이___.", options: ["어요.", "습니다.", "네요.", "네."], answer: 2, explanation: "Hiện tại → 보이네요." },
    ],
    commonMistakes: [
      "Dùng với động từ.",
      "Nhầm với 아/어지다 (thay đổi).",
      "Quên ý nghĩa vẻ ngoài.",
    ],
    tags: ["Vẻ ngoài", "Phỏng đoán", "Cảm nhận", "TOPIK 2"],
  },
  {
    id: "topik2-26",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V - (으)ㄹ지도 모르다",
    meaning: "không biết chừng...",
    explanation: "Diễn đạt sự phỏng đoán hoặc không chắc chắn về điều gì đó sẽ xảy ra trong tương lai hoặc đã xảy ra trong quá khứ. Thường được dùng với 아마. Hình thức quá khứ: 았/었을지도 모르다.",
    formation: "A/V + (으)ㄹ지도 모르다",
    notes: [
      "Phỏng đoán/không chắc chắn.",
      "Tương lai hoặc quá khứ.",
      "Thường dùng 아마.",
      "Quá khứ: 았/었을지도 모르다.",
    ],
    examples: [
      { korean: "내일 날씨가 추울지도 모르니까 따뜻하게 입으세요.", vietnamese: "Không biết chừng ngày mai trời sẽ lạnh nên hãy mặc ấm vào nhé." },
      { korean: "아마 선생님께서는 학교에 안 계실지도 모르는데 여기서 기다릴까요?", vietnamese: "Không biết chừng cô giáo không có ở trường nên bạn hãy đợi ở đây nhé?" },
      { korean: "아마 다른 사람이 들을지도 모르니까 조용히 이야기하세요.", vietnamese: "Không biết chừng người khác có thể đang lắng nghe, hãy nói nhỏ lại đi." },
      { korean: "지금 백화점에 가면 사람이 많을지도 몰라요.", vietnamese: "Nếu đi đến TTTM vào lúc này, không biết chừng sẽ có rất nhiều người." },
      { korean: "내일 비가 올지도 모르니까 우산을 가지고 가세요.", vietnamese: "Ngày mai trời không biết chừng sẽ mưa, hãy mang theo ô nha." },
    ],
    exercises: [
      { question: "내일 날씨가 추울지도 모르니까 따뜻하게 입으세___.", options: ["요.", "십시오.", "해요.", "해."], answer: 0, explanation: "Mệnh lệnh → 입으세요." },
      { question: "내일 비가 올지도 모르니까 우산을 가지고 가세___.", options: ["요.", "십시오.", "해요.", "해."], answer: 0, explanation: "Mệnh lệnh → 가세요." },
    ],
    commonMistakes: [
      "Nhầm với (으)ㄹ 것이다 (chắc chắn hơn).",
      "Quên ý nghĩa không chắc chắn.",
      "Không dùng 아마 (thiếu tự nhiên).",
    ],
    tags: ["Phỏng đoán", "Không chắc chắn", "Khả năng", "TOPIK 2"],
  },
  {
    id: "topik2-27",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V - (으)ㄴ/는/(으)ㄹ 모양이다",
    meaning: "chắc là..., có vẻ như...",
    explanation: "Sử dụng khi muốn phỏng đoán hay suy đoán về một tình huống cụ thể sau khi trực tiếp chứng kiến hay nghe về tình huống đó. Trước - (으)ㄴ/는/(으)ㄹ 모양이다 thường sử dụng cấu trúc -(으)ㄴ/는 걸 보니까 với ý nghĩa làm căn cứ để phỏng đoán. Thì thể của cấu trúc này phụ thuộc vào điều gì đó đã xảy ra trong quá khứ, đang xảy ra ở hiện tại, hoặc sẽ xảy ra trong tương lai.",
    formation: "A + (으)ㄴ 모양이다 / V(qua khứ) + (으)ㄴ 모양이다 / V(hiện tại) + 는 모양이다 / V(tương lai) + (으)ㄹ 모양이다",
    notes: [
      "Phỏng đoán sau khi chứng kiến/nghe.",
      "Thường dùng -(으)ㄴ/는 걸 보니까.",
      "Thì thể phụ thuộc tình huống.",
      "Có căn cứ để phỏng đoán.",
    ],
    examples: [
      { korean: "지원 씨가 오늘 늦게까지 일하는 모양이에요.", vietnamese: "Jiwon hôm nay chắc là làm việc đến muộn." },
      { korean: "저 사람은 매일 돈을 저렇게 펑펑 써요. 정말 돈이 많은 모양이에요.", vietnamese: "Người đó ngày nào cũng tiêu tiền như vậy. Chắc là rất nhiều tiền." },
      { korean: "그 회사 일이 정말 힘들었던 모양이에요.", vietnamese: "Có vẻ công việc ở công ty đó thật sự vất vả." },
      { korean: "비행기 표를 예매한 걸 보니까 여행 갈 모양이에요.", vietnamese: "Thấy cô ấy đặt vé máy bay thì có vẻ như cô ấy sẽ đi du lịch." },
      { korean: "한국 음식을 자주 먹는 걸 보니까 한국 음식을 좋아하는 모양이에요.", vietnamese: "Thấy anh ấy thường xuyên ăn đồ ăn Hàn thì có vẻ như anh ấy thích món ăn Hàn." },
      { korean: "밖에 비가 오는 모양이에요.", vietnamese: "Có vẻ như bên ngoài trời đang mưa." },
      { korean: "아직 안 오는 걸 보니 차가 막히는 모양이에요.", vietnamese: "Thấy bây giờ mà anh ấy vẫn chưa đến, có vẻ như là đang tắc đường." },
      { korean: "어제 몸이 안 좋다고 했는데 많이 아픈 모양이에요.", vietnamese: "Hôm qua cô ấy nói cô ấy không được khỏe nên chắc là cô ấy ốm rồi." },
    ],
    exercises: [
      { question: "지원 씨가 오늘 늦게까지 일하는 모양이___.", options: ["어요.", "습니다.", "예요.", "예."], answer: 0, explanation: "Hiện tại → 모양이에요." },
      { question: "밖에 비가 오는 모양이___.", options: ["어요.", "습니다.", "예요.", "예."], answer: 0, explanation: "Hiện tại → 모양이에요." },
    ],
    commonMistakes: [
      "Nhầm với (으)ㄴ/는/(으)ㄹ 것 같다 (không có căn cứ).",
      "Dùng sai thì thể.",
      "Quên ý nghĩa chứng kiến/nghe.",
    ],
    tags: ["Phỏng đoán", "Căn cứ", "Chứng kiến", "TOPIK 2"],
  },
  {
    id: "topik2-28",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – (으)ㄹ걸요",
    meaning: "có lẽ, chắc là",
    explanation: "Diễn tả sự phỏng đoán, giả định về những sự việc trong tương lai hoặc việc mà người nói chưa chắc chắn lắm. Phỏng đoán cho ngôi số 3. Quá khứ: 았/었을걸요. Chỉ sử dụng cấu trúc này giữa những người thân thiết và chỉ sử dụng trong văn nói. Dạng 반말 là (으)ㄹ걸.",
    formation: "A/V + (으)ㄹ걸요",
    notes: [
      "Phỏng đoán cho ngôi số 3.",
      "Người thân thiết.",
      "Chỉ văn nói.",
      "Quá khứ: 았/었을걸요.",
    ],
    examples: [
      { korean: "지금 50%나 세일하니까 비싸지 않을걸요.", vietnamese: "Bây giờ đang được giảm giá 50% nên chắc là không đắt đâu." },
      { korean: "마이 씨는 시간이 없을걸요. 내일 아르바이트를 한다고 했거든요.", vietnamese: "Chắc là Mai không có thời gian đâu. Vì bạn ấy bảo là ngày mai sẽ đi làm thêm." },
      { korean: "아마 커피숍에 있을걸요. 아까 커피숍에 간다고 했거든요.", vietnamese: "Có lẽ anh ấy ở quán café. Lúc nãy anh ấy nói là ở quán café mà." },
      { korean: "아마 10 시쯤 열걸요. 다른 마트들이 대부분 10 시에 열거든요.", vietnamese: "Có lẽ khoảng 10h. Hầu hết các siêu thị đều mở cửa lúc 10h mà." },
      { korean: "그 시간에는 길이 많이 막힐걸요.", vietnamese: "Giờ đó có lẽ sẽ rất tắc đường đấy." },
    ],
    exercises: [
      { question: "지금 50%나 세일하니까 비싸지 않을걸___.", options: ["요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Phỏng đoán → 걸요." },
      { question: "아마 10 시쯤 열걸___.", options: ["요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Phỏng đoán → 걸요." },
    ],
    commonMistakes: [
      "Dùng với người không thân thiết.",
      "Dùng trong văn viết.",
      "Nhầm với (으)ㄹ 것이다 (chắc chắn hơn).",
      "Quên ý nghĩa thân thiết.",
    ],
    tags: ["Phỏng đoán", "Văn nói", "Thân thiết", "TOPIK 2"],
  },
  {
    id: "topik2-29",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V - (으)ㄴ/는/(으)ㄹ 줄 몰랐다/알았다",
    meaning: "không nghĩ là, không biết là / nghĩ là, cứ tưởng là",
    explanation: "Người nói thể hiện sự khác nhau giữa kết quả và thứ mà mình đã suy nghĩ hay dự đoán. Động từ ứng với quá khứ/hiện tại/tương lai + (으)ㄴ/는/(으)ㄹ; tính từ phỏng đoán thường/mơ hồ + (으)ㄹ. (으)ㄴ/는/(으)ㄹ 줄 몰랐다: không nghĩ là, không biết là. (으)ㄴ/는/(으)ㄹ 줄 알았다: nghĩ là, cứ tưởng là.",
    formation: "A/V + (으)ㄴ/는/(으)ㄹ 줄 몰랐다/알았다",
    notes: [
      "Khác biệt kết quả vs suy nghĩ.",
      "줄 몰랐다: không nghĩ là.",
      "줄 알았다: nghĩ là.",
      "Diễn tả sự ngạc nhiên.",
    ],
    examples: [
      { korean: "흐엉 씨는 한국어 발음이 좋아서 한국 사람인 줄 알았어요.", vietnamese: "Hương phát âm tiếng Hàn rất tốt nên tôi cứ tưởng là người Hàn." },
      { korean: "그 가방이 싼 줄 알았어요.", vietnamese: "Tôi tưởng chiếc túi xách đó rẻ." },
      { korean: "마이 씨가 한국에 돌아간 줄 몰랐어요.", vietnamese: "Tôi không biết là Mai trở về Hàn Quốc." },
      { korean: "밖에 비가 오는 줄 알았어요.", vietnamese: "Tôi tưởng bên ngoài trời đang mưa." },
      { korean: "어제 이렇게 눈이 많이 온 줄 몰랐어요.", vietnamese: "Tôi không biết là hôm qua tuyết đã rơi nhiều thế này." },
      { korean: "오늘 약속이 있는 줄 알았어요.", vietnamese: "Tôi tưởng hôm nay có hẹn." },
      { korean: "아까 전화를 안 받아서 바쁜 줄 알았어요.", vietnamese: "Lúc nãy bạn không nghe điện thoại mình cứ tưởng là bạn đang bận." },
      { korean: "예고편을 보고 영화가 재미없을 줄 알았는데 재미있네요.", vietnamese: "Xem trailer thì tưởng là bộ phim sẽ không hay, nhưng mà không ngờ nó thú vị thật." },
      { korean: "미안해요. 바쁜 줄 몰랐어요.", vietnamese: "Xin lỗi. Tôi không biết anh đang bận." },
      { korean: "시간이 많이 걸릴 줄 알았어요.", vietnamese: "Tôi tưởng là sẽ mất nhiều thời gian." },
    ],
    exercises: [
      { question: "한국어 발음이 좋아서 한국 사람인 줄 알았___.", options: ["어요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Quá khứ → 알았어요." },
      { question: "마이 씨가 한국에 돌아간 줄 몰랐___.", options: ["어요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Quá khứ → 몰랐어요." },
    ],
    commonMistakes: [
      "Nhầm 줄 알다 vs 줄 알았다.",
      "Quên ý nghĩa kết quả khác suy nghĩ.",
      "Dùng sai thì thể.",
    ],
    tags: ["Ngạc nhiên", "Sai lầm", "Kỳ vọng", "TOPIK 2"],
  },
  {
    id: "topik2-30",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A – (으)ㄴ가 보다, V – 나 보다",
    meaning: "Có vẻ..., chắc là...",
    explanation: "Thể hiện sự phỏng đoán, suy đoán của người nói dựa trên bối cảnh nào đó. Đối tượng được phỏng đoán là ngôi số 3, không dùng ngôi số 1. Dùng nhiều trong văn nói.",
    formation: "A + (으)ㄴ가 보다 / V + 나 보다",
    notes: [
      "Phỏng đoán dựa bối cảnh.",
      "Ngôi số 3 (không dùng ngôi 1).",
      "Dùng nhiều văn nói.",
      "Không có căn cứ rõ ràng.",
    ],
    examples: [
      { korean: "밖에 비가 오나 봐요.", vietnamese: "Chắc là bên ngoài trời đang mưa." },
      { korean: "흐엉 씨가 어디 아픈가 봐요.", vietnamese: "Có vẻ Hương đau ở đâu đó." },
      { korean: "보고서를 다 썼나 봐요. 아까 제출하러 간다고 했거든요.", vietnamese: "Vâng, chắc cậu ấy viết xong rồi. Vì lúc nãy cậu ấy bảo đi nộp." },
      { korean: "엄마는 전화 안 해서 바쁜가 봐요.", vietnamese: "Không thấy mẹ gọi điện nên chắc là mẹ đang bận." },
      { korean: "그녀가 책을 들고 도서관에 들어갔어요. 아마 학생인가 봐요.", vietnamese: "Cô ấy cầm sách và đã đi vào thư viện. Chắc là học sinh." },
      { korean: "시끄러운 것을 보니 밖에 싸움이 났나 봐요.", vietnamese: "Thấy ồn ào như vậy chắc bên ngoài có cãi nhau." },
      { korean: "성적이 꽤 좋네요. 정말 똑똑한가 봐요.", vietnamese: "Thành tích tốt nhỉ. Có vẻ như anh ấy thực sự rất thông minh." },
    ],
    exercises: [
      { question: "밖에 비가 오나 봐___.", options: ["요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Phỏng đoán → 봐요." },
      { question: "보고서를 다 썼나 봐___.", options: ["요.", "습니다.", "해요.", "해."], answer: 0, explanation: "Phỏng đoán → 봐요." },
    ],
    commonMistakes: [
      "Dùng với ngôi số 1.",
      "Nhầm với (으)ㄴ/는 것 같다 (có căn cứ hơn).",
      "Quên ý nghĩa bối cảnh.",
    ],
    tags: ["Phỏng đoán", "Bối cảnh", "Văn nói", "TOPIK 2"],
  },
  {
    id: "topik2-31",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "V – 아/어 놓다",
    meaning: "Làm sẵn rồi, làm trước rồi",
    explanation: "Thể hiện một hành động nào đó được kết thúc và sau đó trạng thái của nó được duy trì. Thường dùng với phó từ 미리. Khi kết hợp với động từ 놓다 thì không sử dụng hình thức 놓아 놓다 mà sử dụng 놓아 두다.",
    formation: "V + 아/어 놓다",
    notes: [
      "Thường dùng với phó từ 미리 (trước, sẵn).",
      "Với động từ 놓다 không dùng 놓아 놓다 mà dùng 놓아 두다.",
      "Nhấn mạnh trạng thái duy trì sau khi hành động kết thúc.",
    ],
    examples: [
      { korean: "오늘 오후까지 발표 준비를 해 놓아야 해요.", vietnamese: "Hôm nay tôi phải chuẩn bị bài báo cáo đến buổi chiều." },
      { korean: "창문을 왜 열어 놓고 있어요?", vietnamese: "Tại sao lại để cửa mở thế kia?" },
      { korean: "비행기 표를 미리 사 놓았어요.", vietnamese: "Tôi đã mua vé máy bay rồi." },
      { korean: "날씨가 더우니까 제가 회의실에 미리 가서 에어컨을 틀어 놓을게요.", vietnamese: "Vì thời tiết nóng nên tôi đi đến phòng hội thảo trước và bật điều hòa để đấy." },
      { korean: "어제 너무 피곤해서 설거지를 안 해 놓고 잤어요.", vietnamese: "Hôm qua tôi mệt quá nên tôi cứ để bát đấy không rửa mà đi ngủ." },
    ],
    exercises: [
      { question: "비행기 표를 미리 사 ___ 았어요.", options: ["놓", "두", "버리", "있"], answer: 0, explanation: "Làm sẵn trước → 사 놓았어요." },
      { question: "에어컨을 틀어 ___ 을게요.", options: ["놓", "두", "버리", "있"], answer: 0, explanation: "Sẽ làm sẵn để đó → 틀어 놓을게요." },
    ],
    commonMistakes: [
      "Nhầm với –아/어 두다 (두다 trạng thái duy trì lâu hơn).",
      "Dùng 놓아 놓다 (phải dùng 놓아 두다).",
    ],
    comparison: {
      title: "Phân biệt –았/었다 và –아/어 놓다",
      headers: ["–았/었다", "–아/어 놓다"],
      rows: [
        ["Nhấn mạnh sự kết thúc của hành động.", "Sau khi hành động kết thúc thì trạng thái còn duy trì."],
        ["Không thể biết được sau khi hành động diễn ra thì trạng thái có còn duy trì hay không.", "Trạng thái vẫn còn tiếp tục."],
      ],
    },
    tags: ["Trạng thái", "Chuẩn bị", "미리", "TOPIK 2"],
  },
  {
    id: "topik2-32",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "V – 아/어 두다",
    meaning: "Làm để giữ trạng thái lâu dài",
    explanation: "Diễn tả một hành động xảy ra trong quá khứ nhưng trạng thái của nó vẫn duy trì và kéo dài đến hiện tại và tương lai. Tương tự với cấu trúc –아/어 놓다, tuy nhiên trạng thái của –아/어 두다 được duy trì lâu hơn.",
    formation: "V + 아/어 두다",
    notes: [
      "Trạng thái duy trì lâu hơn so với –아/어 놓다.",
      "Thường dùng cho các hành động cần lưu giữ lâu dài.",
    ],
    examples: [
      { korean: "발표할 때 실수하지 않게 연습을 많이 해 두세요.", vietnamese: "Để không mắc nhiều lỗi khi phát biểu, hãy luyện tập nhiều vào." },
      { korean: "잊어버리지 않게 적어 두었어요.", vietnamese: "Tôi ghi chép để không bị quên." },
      { korean: "그 동안 은행에 저축해 둔 돈으로 자동차를 샀어요.", vietnamese: "Tôi đã mua ô tô bằng số tiền tích góp trong ngân hàng thời gian qua." },
      { korean: "차를 세워 둔 곳이 어디예요?", vietnamese: "Bạn đã đỗ xe ở đâu thế?" },
      { korean: "서랍 안에 중요한 것이 많아서 항상 잠가 둡니다.", vietnamese: "Có nhiều thứ quan trọng trong ngăn kéo nên tôi thường khóa ngăn kéo lại." },
      { korean: "사람이 없을 때는 방에 꺼 두세요.", vietnamese: "Khi không có người hãy tắt đèn trong phòng." },
    ],
    exercises: [
      { question: "잊어버리지 않게 적어 ___ 었어요.", options: ["두", "놓", "버리", "있"], answer: 0, explanation: "Ghi lại để không quên, duy trì lâu → 적어 두었어요." },
      { question: "사람이 없을 때는 방에 꺼 ___ 세요.", options: ["두", "놓", "버리", "있"], answer: 0, explanation: "Giữ trạng thái tắt → 꺼 두세요." },
    ],
    commonMistakes: [
      "Nhầm với –아/어 놓다 (놓다 trạng thái ngắn hơn, hai cái gần giống nhau).",
      "Nhầm với –아/어 버리다 (버리다 = hoàn toàn, dứt khoát).",
    ],
    tags: ["Trạng thái", "Lâu dài", "Lưu giữ", "TOPIK 2"],
  },
  {
    id: "topik2-33",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "V-(으)ㄴ 채(로)",
    meaning: "Vẫn đang, trong trạng thái, vẫn cứ...",
    explanation: "Diễn tả giữ nguyên trạng thái hành động trước rồi thực hiện hành động phía sau. Trước -(으)ㄴ 채로 không thể kết hợp với thì hiện tại và tương lai. Thường kết hợp chung với cấu trúc 아/어 놓다. Có thể rút gọn thành -(으)ㄴ 채.",
    formation: "V + (으)ㄴ 채(로)",
    notes: [
      "Không kết hợp với thì hiện tại và tương lai.",
      "Thường dùng với 아/어 놓다.",
      "Có thể rút gọn thành -(으)ㄴ 채.",
    ],
    examples: [
      { korean: "어젯밤에 창문을 열어 놓은 채로 잤더니 감기에 걸린 것 같아요.", vietnamese: "Đêm qua tôi đi ngủ mà vẫn cứ để cửa mở nên có lẽ bị cảm cúm." },
      { korean: "한국에서 어른들과 술을 마실 때 고개를 돌린 채로 술을 마셔야 돼요.", vietnamese: "Ở Hàn Quốc khi uống rượu với người lớn thì phải uống trong trạng thái quay đầu đi." },
      { korean: "음악을 틀어 놓은 채로 공부가 되니?", vietnamese: "Bạn học vẫn nghe nhạc sao?" },
      { korean: "휴대폰 전원을 끈 채로 수리 센터에 가져가야 한다.", vietnamese: "Quý khách phải mang theo điện thoại trong trạng thái tắt nguồn đến trung tâm sửa chữa." },
      { korean: "어젯밤에 드라마를 보다가 텔레비전을 켜 놓은 채 잠이 들었다.", vietnamese: "Đêm qua tôi xem phim truyền hình và chìm vào giấc ngủ trong khi Tivi vẫn đang bật." },
      { korean: "한국에서는 신발을 신은 채 방에 들어가면 안 된다.", vietnamese: "Ở Hàn Quốc, không được bước vào trong phòng khi vẫn đang mang giày." },
      { korean: "너무 피곤해서 화장한 채로 그냥 잤다.", vietnamese: "Do quá mệt nên tôi đã đi ngủ trong trạng thái chưa tẩy trang." },
      { korean: "급하게 나오느라고 창문을 열어 놓은 채로 나왔다.", vietnamese: "Vì vội vàng ra ngoài mà tôi đã đi trong khi cửa sổ vẫn đang mở." },
    ],
    exercises: [
      { question: "창문을 열어 놓은 ___ 로 잤더니 감기에 걸렸어요.", options: ["채", "상태", "때", "것"], answer: 0, explanation: "Trong trạng thái vẫn để mở → 열어 놓은 채로." },
      { question: "신발을 신은 ___ 방에 들어가면 안 된다.", options: ["채", "상태", "때", "것"], answer: 0, explanation: "Vẫn đang mang giày → 신은 채." },
    ],
    commonMistakes: [
      "Dùng với thì hiện tại/tương lai (chỉ dùng với quá khứ hoặc trạng thái hoàn thành).",
      "Nhầm với –면서 (면서 diễn tả đồng thời, 채로 duy trì trạng thái).",
    ],
    tags: ["Trạng thái", "Duy trì", "TOPIK 2"],
  },
  {
    id: "topik2-34",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "V – 아/어 있다",
    meaning: "Vẫn còn đang...",
    explanation: "Biểu hiện mô tả trạng thái được tiếp diễn hành động: hành động đã xảy ra và hiện tại vẫn giữ nguyên trạng thái. Cấu trúc này dùng cho các nội động từ (앉다, 서다, 눕다, 기대다, 비다, 남다, 나오다, 가다, 오다, 붙다...) và các bị động từ.",
    formation: "V + 아/어 있다",
    notes: [
      "Dùng với nội động từ và bị động từ.",
      "Khác với -고 있다 (고 있다: hành động đang diễn ra, dùng ngoại động từ).",
      "Hành động đã hoàn thành và đang duy trì trạng thái đó.",
    ],
    examples: [
      { korean: "고양이가 탁자 위에 앉아 있어요.", vietnamese: "Con mèo vẫn đang ngồi trên bàn." },
      { korean: "개가 집 앞 마당에 누워 있어요.", vietnamese: "Con chó vẫn đang nằm trên sân trước nhà." },
      { korean: "식당 앞에 오랫동안 서 있었어요.", vietnamese: "Tôi vẫn đứng chờ trước quán ăn rất lâu." },
      { korean: "나무 위에 눈이 많이 쌓여 있어요.", vietnamese: "Cây vẫn bị bao phủ rất nhiều bởi tuyết." },
      { korean: "제가 봤을 때 가방이 비어 있었어요.", vietnamese: "Khi tôi nhìn, cái túi vẫn trống rỗng." },
      { korean: "수술을 한 지 오래 됐지만 상처가 아직 남아 있어요.", vietnamese: "Tôi đã có cuộc phẫu thuật rất lâu cách đây, nhưng vết sẹo vẫn nằm đó." },
      { korean: "통장에 아직 100 만원이 남아 있어요.", vietnamese: "Vẫn đang có 100 triệu Won trong tài khoản." },
      { korean: "게시판에 붙어 있는 공지를 봤어요.", vietnamese: "Tôi đã xem thông báo chung vẫn đang dán trên bảng thông báo." },
    ],
    exercises: [
      { question: "고양이가 탁자 위에 앉아 ___.", options: ["있어요.", "했어요.", "겠어요.", "할게요."], answer: 0, explanation: "Vẫn đang ngồi (nội động từ) → 앉아 있어요." },
      { question: "통장에 아직 100 만원이 남아 ___.", options: ["있어요.", "했어요.", "겠어요.", "할게요."], answer: 0, explanation: "Vẫn còn duy trì → 남아 있어요." },
    ],
    commonMistakes: [
      "Dùng với ngoại động từ (phải dùng -고 있다).",
      "Nhầm –아/어 있다 với –고 있다: 앉고 있어요 (đang ngồi xuống) vs 앉아 있어요 (đã ngồi và vẫn đang ngồi).",
    ],
    comparison: {
      title: "Phân biệt –고 있다 và –아/어 있다",
      headers: ["–고 있다", "–아/어 있다"],
      rows: [
        ["Hành động đang diễn ra tại thời điểm nói.", "Hành động đã hoàn thành và đang duy trì trạng thái."],
        ["Thường dùng với ngoại động từ, động từ chủ động.", "Thường dùng với nội động từ, bị động từ."],
        ["민수는 의자에 앉고 있어요. (Minsu đang ngồi xuống)", "민수는 의자에 앉아 있어요. (Minsu vẫn đang ngồi)"],
        ["저는 밥을 먹고 있어요. (Tôi đang ăn cơm)", "문이 열려 있어요. (Cửa đang ở trạng thái mở)"],
      ],
    },
    tags: ["Trạng thái", "Nội động từ", "Bị động", "TOPIK 2"],
  },
  {
    id: "topik2-35",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "V – (으)ㄴ/는 대로",
    meaning: "Theo như, cứ như, như...",
    explanation: "Diễn tả hành động ở mệnh đề sau xảy ra đúng theo cách ở mệnh đề trước. Ngoài ra có thể dùng N + 대로, một số từ tiêu biểu như: 마음대로, 생각대로, 약속대로, 순서대로, 차례대로, 사실대로, 계획대로,...",
    formation: "V + 는 대로 (hiện tại) / V + (으)ㄴ 대로 (quá khứ) / N + 대로",
    notes: [
      "Mệnh đề sau xảy ra đúng theo cách của mệnh đề trước.",
      "Dùng với N + 대로: 마음대로 (tùy ý), 약속대로 (theo lời hứa), 계획대로 (theo kế hoạch)...",
      "A + (으)ㄴ 대로: 인기가 많으면 많은 대로 (càng mến mộ nhiều thì theo đó...)",
    ],
    examples: [
      { korean: "제가 발음하는 대로 따라하세요.", vietnamese: "Hãy nói theo phát âm của tôi." },
      { korean: "요리책에서 보는 대로 삼계탕을 만들어서 정말 맛있어요.", vietnamese: "Tôi nấu món gà tần sâm theo như xem sách nấu ăn, thật sự rất ngon." },
      { korean: "내가 하는 대로 한번 따라해 보세요.", vietnamese: "Hãy thử một lần làm theo như tôi làm đi." },
      { korean: "그 사람이 어떤 사람인지 아는 대로 말해 보세요.", vietnamese: "Hãy thử nói theo như những gì bạn biết xem người đó là người như thế nào." },
      { korean: "지금부터는 하고 싶은 대로 하세요.", vietnamese: "Từ bây giờ hãy làm theo như những gì muốn đi." },
      { korean: "인기가 많으면 많은 대로 걱정이 많다.", vietnamese: "Nếu càng được mến mộ nhiều nỗi lo lắng càng nhiều theo." },
      { korean: "비싸면 비싼 대로 제값을 한다.", vietnamese: "Càng đắt thì giá trị càng đúng theo sự đắt đó. (tiền nào của đó)" },
    ],
    exercises: [
      { question: "제가 발음하 ___ 대로 따라하세요.", options: ["는", "ㄴ", "은", "던"], answer: 0, explanation: "Hành động hiện tại → V + 는 대로." },
      { question: "약속 ___ 꼭 지켜야 해요.", options: ["대로", "처럼", "같이", "만큼"], answer: 0, explanation: "N + 대로 = theo như lời hứa." },
    ],
    commonMistakes: [
      "Nhầm với –처럼/같이 (처럼 = giống như, 대로 = theo đúng như).",
      "Quên biến đổi theo thì: hiện tại 는 대로, quá khứ (으)ㄴ 대로.",
    ],
    tags: ["Cách thức", "Theo như", "TOPIK 2"],
  },
  {
    id: "topik2-36",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – 기는요",
    meaning: "Gì mà..., đâu mà... (phủ nhận khiêm tốn)",
    explanation: "1. Sử dụng khi nói một cách khiêm tốn về lời khen của đối phương.\n\n2. Thể hiện sự phủ nhận bác bỏ, từ chối một cách nhẹ nhàng lời nói của đối phương. Dùng nhiều trong văn nói.",
    formation: "A/V + 기는요",
    notes: [
      "Dùng trong văn nói.",
      "Thể hiện sự khiêm tốn hoặc phủ nhận nhẹ nhàng.",
      "Thường đứng độc lập như một câu ngắn.",
    ],
    examples: [
      { korean: "가: 한국어가 정말 잘하네요. 나: 잘하기는요.", vietnamese: "가: Bạn giỏi tiếng Hàn thật đấy. 나: Giỏi gì đâu chứ." },
      { korean: "가: 유리 씨는 머리가 참 똑똑해요. 나: 똑똑하기는요.", vietnamese: "가: Yuri thông minh thật đấy. 나: Thông minh gì đâu chứ." },
      { korean: "가: 밥 먹었어요? 나: 먹기는요. 배고파 죽겠어요.", vietnamese: "가: Bạn đã ăn cơm chưa? 나: Ăn gì mà ăn. Đói muốn chết rồi đây này." },
      { korean: "가: 오늘 화장하고 왔네요. 예뻐요. 나: 예쁘기는요.", vietnamese: "가: Hôm nay đã trang điểm rồi đến nhỉ. Xinh đẹp quá à. 나: Xinh đẹp gì đâu ạ." },
      { korean: "가: 어제 그 드라마 봤어요? 나: 보기는요. 시험 공부하느라 잠도 못 잤어요.", vietnamese: "가: Hôm qua đã xem bộ phim đó chứ? 나: Xem phim gì chứ. Vì ôn thi mà đến ngủ còn không được đây này." },
    ],
    exercises: [
      { question: "가: 한국어 정말 잘하네요. 나: 잘하___ 요.", options: ["기는", "기야", "기도", "기만"], answer: 0, explanation: "Phủ nhận khiêm tốn → 잘하기는요." },
      { question: "가: 많이 드세요! 나: 먹___ 요. 다이어트 중이에요.", options: ["기는", "기야", "기도", "기만"], answer: 0, explanation: "Từ chối nhẹ nhàng → 먹기는요." },
    ],
    commonMistakes: [
      "Dùng trong văn viết trang trọng (chỉ dùng văn nói).",
      "Nhầm với –기는 하다 (기는 하다 = thừa nhận nhưng có điều kiện).",
    ],
    tags: ["Phủ nhận", "Khiêm tốn", "Văn nói", "TOPIK 2"],
  },
  {
    id: "topik2-37",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – 고말고요",
    meaning: "Chắc chắn, đương nhiên là...",
    explanation: "Cấu trúc dùng khi trả lời khẳng định đối với câu hỏi của đối phương hoặc đồng ý với lời của đối phương đồng thời nhấn mạnh điều này. Tương đương sử dụng với phó từ 물론. Vế trước quá khứ: 았/었고말고요.",
    formation: "A/V + 고말고요 / A/V + 았/었고말고요",
    notes: [
      "Nhấn mạnh sự khẳng định, đồng ý.",
      "Tương đương 물론이죠 (đương nhiên rồi).",
      "Quá khứ: 았/었고말고요.",
    ],
    examples: [
      { korean: "우리 팀의 일인데 참여하고말고요.", vietnamese: "Vì là việc của nhóm chúng tớ nên chắc chắn là tham gia rồi." },
      { korean: "가: 한국이 그렇게 좋아요? 나: 좋고말고요. 한국말, 한국사람, 한국음식, 다 좋아요.", vietnamese: "가: Bạn thích Hàn Quốc đến vậy sao? 나: Đương nhiên là thích rồi. Tiếng Hàn, người Hàn Quốc, ẩm thực Hàn, tớ thích hết." },
      { korean: "가: 그 친구가 그렇게 똑똑해요? 나: 똑똑하고말고요. 모르는 것이 없던데요.", vietnamese: "가: Bạn ấy thông minh vậy sao? 나: Chắc chắn là thông minh rồi. Mình thấy không có gì là bạn ấy không biết cả." },
      { korean: "가: 지난번에 빌려준 책을 다 읽었어요? 나: 다 읽고말고요.", vietnamese: "가: Cuốn sách mình cho bạn mượn hôm trước đã đọc xong chưa? 나: Tất nhiên là đọc xong hết rồi." },
      { korean: "가: 내 결혼식에 꼭 와 줄 거지? 나: 그럼. 가고말고요.", vietnamese: "가: Bạn nhất định sẽ đến đám cưới mình chứ? 나: Đương nhiên mình sẽ đi." },
      { korean: "여름에 해변들이 매우 복잡해지고말고요.", vietnamese: "Các bãi biển dĩ nhiên trở nên vô cùng đông đúc vào mùa hè." },
    ],
    exercises: [
      { question: "가: 한국에 또 가고 싶어요? 나: 가 ___ 요. 정말 좋았어요.", options: ["고말고", "기는", "든지", "면서"], answer: 0, explanation: "Khẳng định mạnh → 가고말고요." },
      { question: "가: 그 책 재미있었어요? 나: 재미있 ___ 요. 꼭 읽어 보세요.", options: ["고말고", "기는", "든지", "면서"], answer: 0, explanation: "Khẳng định → 재미있고말고요." },
    ],
    commonMistakes: [
      "Dùng khi muốn phủ nhận (chỉ dùng để khẳng định mạnh).",
      "Quên chia quá khứ khi cần: 읽었고말고요 không phải 읽고말고요.",
    ],
    tags: ["Khẳng định", "Nhấn mạnh", "Đồng ý", "TOPIK 2"],
  },
  {
    id: "topik2-38",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "V – 곤 하다",
    meaning: "Thường hay..., thường...",
    explanation: "Thể hiện một tình huống nào đó thường xuyên được lặp lại. Cũng thường dùng với hành động đã thường xuyên xảy ra trong quá khứ. Dùng 곤 하다 khi hiện tại vẫn còn thực hiện, còn nếu sự việc đã chấm dứt thì dùng 곤 했다. Có thể sử dụng dưới dạng –고는 하다.",
    formation: "V + 곤 하다 / V + 곤 했다 (quá khứ đã chấm dứt)",
    notes: [
      "곤 하다: hành động lặp lại đến hiện tại vẫn còn.",
      "곤 했다: hành động đã lặp lại trong quá khứ nhưng nay không còn nữa.",
      "Có thể dùng –고는 하다 (cùng nghĩa).",
    ],
    examples: [
      { korean: "가: 주말에는 보통 뭘 해요? 나: 친구들을 만나 영화를 보곤 해요.", vietnamese: "가: Cuối tuần bạn thường làm gì? 나: Tôi thường gặp bạn bè rồi đi xem phim." },
      { korean: "할머니께 어린 시절 이야기를 듣곤 했다.", vietnamese: "Tôi thường nghe câu chuyện thời thơ ấu từ bà." },
      { korean: "저는 주변이 시끄러울 때 이어폰을 꽂고 조용한 음악을 듣곤 해요.", vietnamese: "Khi xung quanh ồn ào thì tôi thường đeo tai nghe và nghe nhạc yên tĩnh." },
      { korean: "수업이 끝나면 친구들하고 같이 농구를 하곤 해요.", vietnamese: "Khi kết thúc buổi học tôi thường cùng các bạn chơi bóng rổ." },
      { korean: "스트레스를 받으면 음악을 듣곤 합니다.", vietnamese: "Nếu bị stress tôi thường nghe nhạc." },
      { korean: "어렸을 때는 그곳에 자주 가곤 했어요.", vietnamese: "Khi còn nhỏ tôi hay thường đi đến chỗ đó." },
      { korean: "예전에는 밥을 먹은 후에 담배를 피우곤 했어요.", vietnamese: "Trước đây sau khi ăn cơm xong tôi thường hút thuốc lá." },
    ],
    exercises: [
      { question: "스트레스를 받으면 음악을 듣___ 해요.", options: ["곤", "고는", "거나", "고서"], answer: 0, explanation: "Thói quen lặp lại đến hiện tại → 듣곤 해요." },
      { question: "어렸을 때 그 공원에 자주 가___ 했어요.", options: ["곤", "기는", "거나", "고서"], answer: 0, explanation: "Thói quen quá khứ đã chấm dứt → 가곤 했어요." },
    ],
    commonMistakes: [
      "Nhầm 곤 하다 với 곤 했다 (hành động còn tiếp tục vs đã chấm dứt).",
      "Nhầm với –는 편이다 (편이다 nói về xu hướng chung, 곤 하다 nhấn mạnh lặp đi lặp lại).",
    ],
    tags: ["Thói quen", "Lặp lại", "Quá khứ", "TOPIK 2"],
  },
  {
    id: "topik2-39",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – (으)ㄴ/는 척하다",
    meaning: "Giả vờ, làm như, giả bộ như, tỏ ra như...",
    explanation: "Chủ ngữ giả vờ làm gì đó trái ngược với sự thực. Ở dạng nhấn mạnh còn có thể dùng ở dạng 척을 하다 / 척도 하다. Cao cấp có thể sử dụng: (으)ㄴ/는 체 만 체하다. Cũng có thể dùng 체하다 thay cho 척하다.",
    formation: "V + 는 척하다 (hiện tại) / V + (으)ㄴ 척하다 (quá khứ) / A + (으)ㄴ 척하다",
    notes: [
      "Giả vờ trái với thực tế.",
      "척을 하다 / 척도 하다: dạng nhấn mạnh.",
      "체하다 =척하다 (cùng nghĩa).",
      "Cao cấp: (으)ㄴ/는 체 만 체하다.",
    ],
    examples: [
      { korean: "어떤 곤충은 자신을 보호하기 위해 죽을 척을 한다.", vietnamese: "Một số côn trùng giả vờ chết để tự vệ." },
      { korean: "친구가 돈을 빌려 달라고 해서 돈이 없는 체해요.", vietnamese: "Bạn tôi hỏi mượn tiền vì vậy tôi giả vờ như không có tiền." },
      { korean: "제가 한 이야기에 대해 모르는 척해 주세요.", vietnamese: "Hãy giả vờ như bạn không biết tôi đang nói về cái gì." },
      { korean: "당신은 학생도 아니면서 왜 학생인 척합니까?", vietnamese: "Tại sao bạn không phải là học sinh mà lại giả vờ như là học sinh vậy?" },
      { korean: "두 사람은 친한 친구인 척했어요.", vietnamese: "Hai người đã tỏ ra như là bạn bè thân thiết." },
      { korean: "명동에서 친구를 봤는데 못 본 척했어요.", vietnamese: "Tôi đã gặp người bạn ở Myong-dong nhưng đã vờ như không thấy." },
    ],
    exercises: [
      { question: "그는 아픈 ___ 하면서 학교에 안 갔어요.", options: ["척을", "대로", "만큼", "처럼"], answer: 0, explanation: "Giả vờ bị bệnh → 아픈 척을 하다." },
      { question: "모르는 ___ 하지 말고 솔직하게 말해요.", options: ["척", "대로", "만큼", "처럼"], answer: 0, explanation: "Giả vờ không biết → 모르는 척하다." },
    ],
    commonMistakes: [
      "Nhầm với –처럼 (처럼 = giống như thật, 척하다 = giả vờ trái thực tế).",
      "Quên biến đổi theo thì: 모르는 척 (đang giả vờ không biết), 모른 척 (đã giả vờ không biết).",
    ],
    tags: ["Giả vờ", "Hành động", "Văn nói", "TOPIK 2"],
  },
  {
    id: "topik2-40",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – (으)ㄴ/는 대신(에)",
    meaning: "Thay vì, thay cho / Bù lại, ngược lại",
    explanation: "Nghĩa 1: Thể hiện sự thay đổi hành động hay trạng thái ở vế trước sang hành động hay trạng thái khác tương ứng ở vế sau. [thay vì, thay cho].\n\nNghĩa 2: Hành động hoặc trạng thái ở vế trước và vế sau khác nhau hoặc trái ngược. [bù lại, thay vào đó]. Cũng dùng N + 대신(에).",
    formation: "V + 는 대신(에) / A/V + (으)ㄴ 대신(에) / N + 대신(에)",
    notes: [
      "Nghĩa 1: A thay thế cho B (낚시 대신에 테니스).",
      "Nghĩa 2: A có mặt tốt nhưng bù lại có mặt xấu (빠른 대신에 사람이 많다).",
      "Cũng dùng với danh từ: N + 대신(에).",
    ],
    examples: [
      { korean: "불고기 대신에 삼겹살을 먹으면 어때요?", vietnamese: "Thay vì Bulgogi thì ăn thịt ba chỉ được không?" },
      { korean: "지하철은 빠른 대신에 출퇴근 시간에 사람이 많아요.", vietnamese: "Tàu điện ngầm nhanh nhưng thay vào đó vào giờ cao điểm thì đông người." },
      { korean: "낚시하는 대신에 테니스를 칩시다.", vietnamese: "Thay vì đi câu cá thì chơi tennis đi." },
      { korean: "요즘엔 편지를 쓰는 대신에 이메일을 보낸다.", vietnamese: "Gần đây, thay vì viết thư thì tôi gửi email." },
      { korean: "아침에는 밥을 먹는 대신에 우유를 마신다.", vietnamese: "Vào buổi sáng thay vì ăn cơm thì tôi uống sữa." },
      { korean: "내 숙제를 도와주는 대신에 밥을 살게요.", vietnamese: "Bạn giúp mình làm bài tập về nhà thì thay vào đó mình sẽ mời bạn ăn." },
      { korean: "청소를 도와주는 대신 맛있는 요리를 만들어 줄게요.", vietnamese: "Giúp mình dọn dẹp thì thay vào đó mình sẽ nấu món gì đó thật ngon đãi bạn." },
    ],
    exercises: [
      { question: "편지를 쓰는 ___ 이메일을 보낸다.", options: ["대신에", "대로", "척하며", "것처럼"], answer: 0, explanation: "Thay thế hành động → 대신에." },
      { question: "지하철은 빠른 ___ 사람이 많아요.", options: ["대신에", "대로", "척하며", "것처럼"], answer: 0, explanation: "Bù lại, ngược lại → 빠른 대신에." },
    ],
    commonMistakes: [
      "Nhầm với –(으)ㄴ/는 반면에 (반면에 thuần tương phản, 대신에 có thêm nghĩa thay thế).",
      "Nhầm nghĩa 1 và nghĩa 2 của 대신(에).",
    ],
    comparison: {
      title: "Hai nghĩa của 대신(에)",
      headers: ["Nghĩa 1: Thay thế", "Nghĩa 2: Bù đắp"],
      rows: [
        ["낚시 대신에 테니스 (thay vì câu cá → chơi tennis)", "지하철은 빠른 대신에 사람이 많다 (nhanh nhưng bù lại đông)"],
        ["Hành động A được thay bằng B", "A có đặc điểm tốt, B là mặt trái bù đắp"],
      ],
    },
    tags: ["Thay thế", "Bù lại", "Tương phản", "TOPIK 2"],
  },
  {
    id: "topik2-41",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "아무 + (이)나 / 아무 + 도",
    meaning: "Bất cứ, bất kỳ / Không có ai/gì cả",
    explanation: "아무 nghĩa là không chọn bất cứ cái gì đặc biệt. Sau 아무 + (이)나 sử dụng dạng khẳng định (bất cứ... cũng được). Sau 아무 + 도 luôn sử dụng hình thức phủ định (không có ai/gì cả). Đối với danh từ chỉ người: 아무나 (bất cứ ai), 아무도 (không có ai).",
    formation: "아무 + N + (이)나 + khẳng định / 아무 + N + 도 + phủ định / 아무나 (người) / 아무도 (người, phủ định)",
    notes: [
      "아무 + (이)나: bất cứ cái gì cũng được (câu khẳng định).",
      "아무 + 도: không có gì/ai cả (câu phủ định).",
      "아무나 = bất cứ ai, 아무도 = không có ai.",
      "아무거나 = bất cứ thứ gì, 아무것도 = không có gì.",
      "아무데나 = ở đâu cũng được, 아무데도 = không ở đâu.",
    ],
    examples: [
      { korean: "가: 뭐 먹고 싶어요? 나: 저는 아무거나 괜찮아요.", vietnamese: "가: Bạn muốn ăn gì? 나: Tôi ăn gì cũng được." },
      { korean: "아무도 저를 알지 못하는 곳으로 가고 싶어요.", vietnamese: "Tôi muốn đến một nơi mà không ai biết tôi." },
      { korean: "그 세미나에는 아무나 갈 수 있어요?", vietnamese: "Cuộc hội thảo đó ai cũng có thể đến được sao?" },
      { korean: "요즘 방학이라서 아무 때나 놀러 오세요.", vietnamese: "Dạo này đang là kì nghỉ nên hãy đến chơi bất cứ lúc nào." },
      { korean: "하숙집은 깨끗한 곳이면 아무데나 괜찮아요.", vietnamese: "Nếu nhà trọ sạch sẽ thì ở đâu cũng được." },
      { korean: "주말에 아무 일도 안 하고 그냥 쉬었어요.", vietnamese: "Vào cuối tuần tôi chẳng làm gì cả mà chỉ nghỉ ngơi thôi." },
      { korean: "배고파서 아무 음식이나 다 먹을 수 있을 것 같다.", vietnamese: "Vì đói bụng nên chắc tôi có thể ăn bất cứ món ăn gì." },
      { korean: "여기는 박물관이니까 아무 물건이나 만지면 안 돼요.", vietnamese: "Vì đây là viện bảo tàng nên bất cứ hiện vật gì cũng không được động vào." },
    ],
    exercises: [
      { question: "가: 뭐 마실래요? 나: ___ 괜찮아요.", options: ["아무거나", "아무것도", "아무도", "아무나"], answer: 0, explanation: "Uống gì cũng được → 아무거나 (câu khẳng định)." },
      { question: "방에 ___ 없었어요.", options: ["아무도", "아무나", "아무거나", "아무데나"], answer: 0, explanation: "Không có ai → 아무도 (câu phủ định)." },
      { question: "그 세미나에는 ___ 갈 수 있어요.", options: ["아무나", "아무도", "아무것도", "아무데도"], answer: 0, explanation: "Bất cứ ai cũng có thể → 아무나 (câu khẳng định)." },
    ],
    commonMistakes: [
      "Dùng 아무나/아무거나 với câu phủ định (phải dùng 아무도/아무것도).",
      "Dùng 아무도/아무것도 với câu khẳng định (phải dùng 아무나/아무거나).",
      "Nhầm 아무나 (bất cứ ai) với 아무도 (không có ai).",
    ],
    comparison: {
      title: "Phân biệt 아무+(이)나 và 아무+도",
      headers: ["아무 + (이)나 (khẳng định)", "아무 + 도 (phủ định)"],
      rows: [
        ["아무거나 = bất cứ thứ gì cũng được", "아무것도 = không có gì cả"],
        ["아무나 = bất cứ ai cũng được", "아무도 = không có ai cả"],
        ["아무데나 = ở đâu cũng được", "아무데도 = không ở đâu cả"],
        ["아무 때나 = bất cứ lúc nào cũng được", "아무 때도 = không lúc nào cả"],
      ],
    },
    tags: ["Bất định", "Phủ định", "Khẳng định", "TOPIK 2"],
  },
  {
    id: "topik2-42",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "N – (이)라도",
    meaning: "Cho dù là..., tạm...",
    explanation: "Diễn tả lựa chọn nào đó tuy không phải là tốt nhất nhưng cũng tạm ổn. Người nói chọn phương án thứ hai vì phương án tốt nhất không có sẵn hoặc không thể thực hiện.",
    formation: "N + 이라도 (sau phụ âm) / N + 라도 (sau nguyên âm)",
    notes: [
      "Chọn phương án thứ hai vì phương án tốt nhất không có.",
      "Ngụ ý: 'không lý tưởng nhưng cũng được'.",
      "Phân biệt với (이)나: (이)나 = tất cả lựa chọn đều như nhau; (이)라도 = có xếp loại, chọn cái thứ hai.",
    ],
    examples: [
      { korean: "해외여행이 어려우면 제주도라도 다녀오세요.", vietnamese: "Nếu du lịch nước ngoài khó khăn quá thì dù là đảo Jeju cũng hãy đi đi." },
      { korean: "밥이 없는데 라면이라도 먹겠어요.", vietnamese: "Vì không có cơm nên sẽ ăn tạm mì tôm." },
      { korean: "가: 저는 내일 6시까지 못 갈 것 같아요. 나: 그럼 늦게라도 오세요.", vietnamese: "가: Ngày mai có lẽ tôi sẽ không đến kịp 6 giờ. 나: Vậy thì dù là muộn cũng hãy đến nha." },
      { korean: "전화를 못하면 문자라도 하세요.", vietnamese: "Nếu không gọi điện được thì dù là tin nhắn cũng hãy nhắn đi." },
      { korean: "커피가 없는데 물이라도 마실래요?", vietnamese: "Vì không có cà phê nên dù là nước cũng uống chứ?" },
      { korean: "집이 너무 멀어서 중고차라도 한 대 사야겠어요.", vietnamese: "Nhà quá xa nên tôi sẽ mua tạm một chiếc xe cũ." },
    ],
    exercises: [
      { question: "밥이 없으니까 라면___ 먹겠어요.", options: ["이라도", "이나", "이든지", "만"], answer: 0, explanation: "Không có cơm, chọn phương án thứ hai (mì) → 라면이라도." },
      { question: "전화가 안 되면 문자___ 하세요.", options: ["라도", "나", "든지", "만"], answer: 0, explanation: "Không gọi được, chọn nhắn tin thay thế → 문자라도." },
    ],
    commonMistakes: [
      "Nhầm với (이)나: (이)나 = các lựa chọn đều ngang nhau; (이)라도 = có lựa chọn tốt hơn nhưng không được, nên chọn cái thứ hai.",
    ],
    comparison: {
      title: "Phân biệt (이)나 và (이)라도",
      headers: ["(이)나", "(이)라도"],
      rows: [
        ["Không có lựa chọn tốt nhất → tất cả các lựa chọn khác đều như nhau.", "Không có lựa chọn tốt nhất → sự lựa chọn thứ hai cũng được. Sử dụng khi xếp loại lựa chọn."],
      ],
    },
    tags: ["Lựa chọn", "Tạm thời", "TOPIK 2"],
  },
  {
    id: "topik2-43",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – 든지 A/V – 든지",
    meaning: "Hoặc là... hoặc là... / Cho dù...",
    explanation: "1. Thể hiện rằng trong nhiều thứ, có thể chọn một thứ hoặc là chọn thứ nào cũng không thành vấn đề. [hoặc là...hoặc là]. Cấu trúc rút gọn: –든 –든, có dạng N+(이)든지 N+(이)든지.\n\n2. Khi ở dạng 든지 trong cấu trúc lựa chọn, vế trước có chứa đại danh từ nghi vấn. [cho dù...]",
    formation: "A/V + 든지 A/V + 든지 / N + (이)든지 N + (이)든지 / 누구든지, 어디든지, 뭐든지,...",
    notes: [
      "Nghĩa 1: liệt kê 2 lựa chọn, chọn cái nào cũng được.",
      "Nghĩa 2: dùng với đại từ nghi vấn (누구, 어디, 뭐, 언제...) để diễn tả 'bất kể ai/đâu/gì'.",
      "Rút gọn: 든지 → 든 (vẫn giữ nguyên nghĩa).",
    ],
    examples: [
      { korean: "비가 오든지 눈이 오든지 내일 행사는 예정대로 진행될 겁니다.", vietnamese: "Bất kể trời mưa hay tuyết rơi thì ngày mai sự kiện cũng sẽ tiến hành theo lịch trình." },
      { korean: "가: 냉면을 드실래요, 불고기를 드실래요? 나: 저는 냉면이든지 불고기든지 다 괜찮아요.", vietnamese: "가: Bạn ăn mì lạnh nhé? Hay là Bulgogi? 나: Tôi ăn mì lạnh hay Bulgogi đều được." },
      { korean: "방이 크든 작든지 아무 거나 구해 주세요.", vietnamese: "Bất kể phòng rộng hay chật hãy tìm cho tôi cái nào cũng được." },
      { korean: "비가 오든지 안 오든지 상관없이 나갈 거예요.", vietnamese: "Bất kể trời có mưa hay không cũng không sao, tôi vẫn sẽ đi ra ngoài." },
      { korean: "그 사람이 오든지 안 오든지 신경 쓰지 않아요.", vietnamese: "Bất kể người đó có đến hay không thì tôi cũng không quan tâm." },
      { korean: "죽이든지 밥이든지 다 잘 먹어요.", vietnamese: "Dù là cháo hay cơm tôi đều ăn được hết." },
      { korean: "어디에 살든지 고향을 잊지 마세요.", vietnamese: "Dù sống ở đâu cũng đừng quên quê hương." },
      { korean: "뭐 하든지 최선을 다하세요.", vietnamese: "Dù làm việc gì cũng hãy cố gắng hết sức." },
    ],
    exercises: [
      { question: "비가 오___ 눈이 오___ 행사는 진행될 거예요.", options: ["든지/든지", "거나/거나", "나/나", "면/면"], answer: 0, explanation: "Bất kể điều kiện nào → 든지...든지." },
      { question: "어디에 살___ 고향을 잊지 마세요.", options: ["든지", "거나", "나", "면"], answer: 0, explanation: "Dù sống ở đâu (đại từ nghi vấn 어디) → 어디에 살든지." },
    ],
    commonMistakes: [
      "Nhầm với –거나 (거나 = lựa chọn giữa các hành động cụ thể; 든지 mang tính 'bất kể' rộng hơn).",
      "Quên rằng khi dùng với đại từ nghi vấn (뭐, 누구, 어디...) chỉ cần một 든지.",
    ],
    tags: ["Lựa chọn", "Bất kể", "TOPIK 2"],
  },
  {
    id: "topik2-44",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – 던 N",
    meaning: "Đã từng thường... / Đang... dở",
    explanation: "1. Diễn tả hành động đã thường xuyên xảy ra ở quá khứ nhưng bây giờ đã chấm dứt. Thường đi kèm 여러번, 자주, 가끔, 항상,... [đã từng thường].\n\n2. Hồi tưởng những sự việc đã bắt đầu xảy ra trong quá khứ nhưng vẫn chưa kết thúc mà vẫn còn dang dở. Thường dùng với 지난달, 지난주, 어제, 아까, 저번에,... [đang... dở].",
    formation: "A/V + 던 + N",
    notes: [
      "Nghĩa 1: hành động lặp lại trong quá khứ, nay đã chấm dứt → thường đi kèm 자주, 항상...",
      "Nghĩa 2: hành động còn dang dở trong quá khứ → thường đi kèm 아까, 어제...",
      "Phân biệt với -(으)ㄴ: -(으)ㄴ = hành động đã hoàn toàn kết thúc; -던 = chưa xong hoặc hồi tưởng lặp lại.",
    ],
    examples: [
      { korean: "우리가 자주 가던 식당에 다시 가 보고 싶어요.", vietnamese: "Tôi muốn đến nhà hàng mà chúng ta đã từng thường hay đến." },
      { korean: "이 노래는 제가 옛날에 자주 듣던 노래예요.", vietnamese: "Bài hát này là bài hát ngày trước tôi đã từng thường hay nghe." },
      { korean: "마시던 커피가 어디에 있어요?", vietnamese: "Cốc cà phê bạn đang uống dở ở đâu vậy?" },
      { korean: "아까 제가 마시던 커피를 버렸어요?", vietnamese: "Bạn đã vứt bỏ cốc cafe mà tôi đã uống dở lúc nãy à?" },
      { korean: "지난 주부터 기다리던 편지가 도착했어요.", vietnamese: "Lá thư mà tôi đã từng chờ từ tuần trước đã đến tay tôi rồi." },
      { korean: "처음에 한국에 왔을 때 잘 안 들리던 한국어가 요즘에는 잘 들려요.", vietnamese: "Tiếng Hàn tôi đã từng không thể nghe được khi lần đầu đến Hàn Quốc, gần đây đã nghe được tốt hơn nhiều." },
    ],
    exercises: [
      { question: "아까 마시___ 커피가 어디 있어요?", options: ["던", "ㄴ", "는", "았던"], answer: 0, explanation: "Cà phê uống dở (chưa xong) → 마시던." },
      { question: "자주 가___ 식당에 또 가고 싶어요.", options: ["던", "ㄴ", "는", "았던"], answer: 0, explanation: "Đã từng thường đến (quá khứ lặp lại) → 가던." },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄴ: 마신 커피 (cà phê đã uống hết) ≠ 마시던 커피 (cà phê uống dở).",
      "Nhầm với -는: -는 nói về hiện tại, -던 hồi tưởng quá khứ.",
    ],
    comparison: {
      title: "Phân biệt -던 và -(으)ㄴ",
      headers: ["-던", "-(으)ㄴ"],
      rows: [
        ["Hành động trong quá khứ còn dang dở hoặc lặp lại.", "Hành động trong quá khứ đã hoàn toàn kết thúc."],
        ["마시던 커피 (cà phê uống dở)", "마신 커피 (cà phê đã uống xong)"],
        ["자주 가던 식당 (nhà hàng đã từng hay đến)", "어제 간 식당 (nhà hàng đã đến hôm qua)"],
      ],
    },
    tags: ["Quá khứ", "Hồi tưởng", "Dang dở", "TOPIK 2"],
  },
  {
    id: "topik2-45",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – 더라고요",
    meaning: "Tôi thấy rằng...",
    explanation: "Được dùng khi nói lại với một người khác về một sự thật mà bản thân mình mới biết nhờ trải qua một kinh nghiệm trong quá khứ. Dùng cho ngôi số 3. Khi chủ ngữ là ngôi thứ nhất thì không dùng được, trừ trường hợp thể hiện cảm xúc, tâm trạng của chủ ngữ.",
    formation: "A/V + 더라고요",
    notes: [
      "Chỉ dùng cho ngôi số 3 (không dùng ngôi 1 trừ cảm xúc).",
      "Kể lại điều mình trực tiếp trải nghiệm, quan sát trong quá khứ.",
      "Thường dùng kể về điều lần đầu tiên biết/thấy.",
    ],
    examples: [
      { korean: "가: 어제 새로 산 바지 왜 안 입고 왔어요? 나: 집에 가서 입어 보니까 사이즈가 작더라고요.", vietnamese: "가: Hôm qua sao bạn không mặc chiếc quần mới mua? 나: Về nhà mặc thử tôi mới thấy nó chật." },
      { korean: "많이 기대하지 않았는데 재미있더라고요.", vietnamese: "Tôi không mong đợi nhiều nhưng thấy cũng thú vị." },
      { korean: "어제 본 공연이 어땠어요? - 아주 재미있더라고요.", vietnamese: "Buổi biểu diễn anh xem hôm qua thế nào? - Tôi thấy rất hay." },
      { korean: "한국에서 여행을 해 보니까 한국에는 정말 산이 많더라고요.", vietnamese: "Đến Hàn Quốc rồi mới thấy Hàn Quốc thực sự có nhiều núi." },
      { korean: "어제 친구들하고 같이 농구를 했는데 희수 씨가 운동을 정말 잘하더라고요.", vietnamese: "Hôm qua đi chơi bóng rổ cùng các bạn, tôi thấy bạn Heesu chơi giỏi thật." },
    ],
    exercises: [
      { question: "집에 가서 입어 보니까 사이즈가 작___.", options: ["더라고요.", "던데요.", "군요.", "겠어요."], answer: 0, explanation: "Kể lại điều tự mình trải nghiệm → 더라고요." },
      { question: "한국에 가 보니까 정말 산이 많___.", options: ["더라고요.", "던데요.", "군요.", "겠어요."], answer: 0, explanation: "Trải nghiệm trực tiếp lần đầu → 더라고요." },
    ],
    commonMistakes: [
      "Dùng ngôi thứ nhất với cảm nhận khách quan (저는 키가 크더라고요 ✗).",
      "Nhầm với –던데요: 더라고요 = kể lại thuần túy; 던데요 = có ý phản bác nhẹ.",
    ],
    comparison: {
      title: "Phân biệt –더라고요 và –던데요",
      headers: ["–더라고요", "–던데요"],
      rows: [
        ["Kể lại điều mình trải nghiệm thuần túy.", "Kể lại nhưng có ý tương phản hoặc phản bác nhẹ."],
        ["Thường dùng khi kể điều lần đầu biết.", "Thường dùng trong câu trả lời phản bác."],
        ["희수 씨가 운동을 잘하더라고요. (Tôi thấy Heesu chơi giỏi thật)", "생각보다 쉽던데요. (Tôi thấy dễ hơn tôi nghĩ - ngụ ý bác bỏ)"],
      ],
    },
    tags: ["Hồi tưởng", "Trải nghiệm", "Ngôi 3", "TOPIK 2"],
  },
  {
    id: "topik2-46",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – 던데요",
    meaning: "Tôi thấy... đấy chứ (phản bác nhẹ, ngạc nhiên)",
    explanation: "Diễn tả những điều tương phản với điều người khác nói hoặc diễn tả cảm giác ngạc nhiên trước một sự việc đã xảy ra trong quá khứ trong một hoàn cảnh nhất định nào đó. Dùng cho ngôi số 3. Thường dùng trong câu trả lời, có ý phản bác nhẹ.",
    formation: "A/V + 던데요",
    notes: [
      "Dùng cho ngôi số 3.",
      "Thường dùng để phản bác nhẹ nhàng quan điểm của đối phương.",
      "Cũng dùng để diễn tả sự ngạc nhiên khi thấy điều gì đó trái với kỳ vọng.",
    ],
    examples: [
      { korean: "가: 흐엉 씨가 학생이에요? 나: 아니요, 회사원이던데요. 삼성 회사에서 일하더라고요.", vietnamese: "가: Hương là học sinh đúng không? 나: Không, tôi thấy là nhân viên văn phòng đấy chứ. Tôi thấy cô ấy làm việc cho công ty Samsung mà." },
      { korean: "가: 어제 서진 씨하고 식사했지요? 나: 네, 서진 씨가 베트남 음식을 아주 잘 먹던데요.", vietnamese: "가: Hôm qua bạn đã đi ăn với Seojin đúng không? 나: Vâng, tôi thấy Seojin ăn đồ ăn Việt Nam giỏi đấy chứ." },
      { korean: "가: 태권도를 배우기가 어렵지요? 나: 아니요, 배워 보니까 생각보다 쉽던데요.", vietnamese: "가: Học taekwondo khó đúng không? 나: Không, học rồi thì thấy dễ hơn tôi nghĩ." },
      { korean: "가: 이번 시험 아주 쉬웠지요? 나: 아니요, 저는 지난 시험보다 더 어렵던데요.", vietnamese: "가: Kỳ thi lần này dễ lắm phải không? 나: Không, tớ thấy còn khó hơn cả lần trước ý." },
      { korean: "란 씨는 좋은 사람 같아 보이던데 한번 만나 보세요.", vietnamese: "Tôi thấy Lan có vẻ là người tốt, bạn thử gặp một lần xem." },
      { korean: "어제는 많이 춥던데 오늘은 따뜻하네요.", vietnamese: "Hôm qua trời lạnh mà hôm nay lại ấm nhỉ." },
      { korean: "음식이 맛있던데 사람들이 별로 안 먹었어요.", vietnamese: "Tôi thấy đồ ăn ngon mà mọi người đã không ăn mấy cả." },
    ],
    exercises: [
      { question: "가: 태권도가 어렵지요? 나: 아니요, 생각보다 쉽___.", options: ["던데요.", "더라고요.", "군요.", "겠어요."], answer: 0, explanation: "Phản bác nhẹ quan điểm đối phương → 던데요." },
      { question: "가: 그 식당 음식이 별로였죠? 나: 아니요, 맛있___.", options: ["던데요.", "더라고요.", "군요.", "겠어요."], answer: 0, explanation: "Phản bác, tương phản với ý kiến đối phương → 던데요." },
    ],
    commonMistakes: [
      "Nhầm với –더라고요: 던데요 có thể phản bác, 더라고요 chỉ kể lại thuần túy.",
      "Dùng với ngôi thứ nhất (chỉ dùng ngôi 3).",
    ],
    tags: ["Hồi tưởng", "Phản bác", "Ngạc nhiên", "TOPIK 2"],
  },
  {
    id: "topik2-47",
    level: "TOPIK 2",
    levelColor: "#84cc16",
    pattern: "A/V – 더군요",
    meaning: "Tôi thấy rằng... (có cảm thán, ngạc nhiên)",
    explanation: "Được dùng khi nói lại với một người khác về một sự thật mà bản thân mình mới biết nhờ trải qua một kinh nghiệm trong quá khứ, kèm theo sự ngạc nhiên. Dùng cho ngôi số 3. Cách dùng khá giống cấu trúc –더라고요, tuy nhiên có thêm mức độ cảm thán.",
    formation: "A/V + 더군요 / A/V + 더군 (văn nói thân mật)",
    notes: [
      "Dùng cho ngôi số 3.",
      "Giống –더라고요 nhưng có thêm sắc thái ngạc nhiên, cảm thán.",
      "Mức độ cảm thán: 더군요 > 더라고요.",
    ],
    examples: [
      { korean: "그 사람은 언제나 자기 생각만 하더군요.", vietnamese: "Tôi thấy rằng người đó lúc nào cũng chỉ nghĩ đến bản thân mình thôi." },
      { korean: "그 애가 많이 아프더군.", vietnamese: "Tôi thấy rằng đứa bé đó ốm nặng đấy." },
      { korean: "그녀는 좋은 아내더군요.", vietnamese: "Tôi thấy cô ấy là một người vợ tốt." },
      { korean: "아버지는 화가 많이 나셨더군요.", vietnamese: "Tôi thấy ba đã giận lắm đó." },
      { korean: "그녀는 모범 학생이더군요.", vietnamese: "Tôi thấy cô ấy là một sinh viên chăm chỉ." },
      { korean: "가: 오랜만에 고향에 내려가 보니까 어떠셨어요? 나: 모든 것이 변해서 좀 낯설더군요.", vietnamese: "가: Lâu rồi mới về quê bạn thấy thế nào? 나: Tất cả mọi thứ đều thay đổi nên tôi thấy hơi lạ lẫm." },
      { korean: "수지가 못 본 사이에 많이 컸더군요.", vietnamese: "Trong khoảng thời gian không gặp Suzy, tôi thấy cô ấy đã lớn hơn nhiều nhỉ." },
    ],
    exercises: [
      { question: "고향에 가 보니까 모든 것이 변해서 낯설___.", options: ["더군요.", "더라고요.", "던데요.", "겠어요."], answer: 0, explanation: "Kể lại kèm cảm thán ngạc nhiên → 더군요." },
      { question: "수지가 못 본 사이에 많이 컸___.", options: ["더군요.", "더라고요.", "던데요.", "겠어요."], answer: 0, explanation: "Quan sát và cảm thán → 더군요." },
    ],
    commonMistakes: [
      "Nhầm với –더라고요: cả hai cùng kể lại trải nghiệm, nhưng 더군요 có thêm sắc thái ngạc nhiên/cảm thán.",
      "Nhầm với –네요: 네요 = ngạc nhiên ở hiện tại; 더군요 = ngạc nhiên về điều quan sát trong quá khứ.",
    ],
    tags: ["Hồi tưởng", "Cảm thán", "Ngạc nhiên", "TOPIK 2"],
  },
  {
    id: "topik3-1",
    level: "TOPIK 3",
    levelColor: "#f59e0b",
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
    id: "topik4-1",
    level: "TOPIK 4",
    levelColor: "#f97316",
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
  {
    id: "topik1-64",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – 네요",
    meaning: "....thế!, ...đấy!",
    explanation: "Vĩ tố kết thúc: Thể hiện sự cảm thán hay ngạc nhiên trước việc gì đó hoàn toàn mới hoặc diễn tả sự đồng tình với ai đó. Chủ yếu sử dụng trong văn nói. Chỉ dùng khi người nói trực tiếp trải nghiệm.",
    formation: "A/V + 네요 / N + 이네요",
    notes: [
      "Cảm thán hoặc ngạc nhiên.",
      "Đồng tình với ai đó.",
      "Chỉ văn nói, trực tiếp trải nghiệm.",
    ],
    examples: [
      { korean: "네, 춥네요.", vietnamese: "Ừ, đẹp thật đấy!" },
      { korean: "한국말을 정말 잘하시네요.", vietnamese: "Bạn nói tiếng hàn hay thật đấy." },
      { korean: "가방이 아주 예쁘네요.", vietnamese: "Túi xách đẹp quá." },
      { korean: "밖에 눈이 정말 많이 왔네요.", vietnamese: "Bên ngoài tuyết đã rơi nhiều thế nhỉ." },
      { korean: "친절하네요.", vietnamese: "Anh ấy tốt bụng thật đấy." },
    ],
    exercises: [
      { question: "한국말을 정말 잘하시___.", options: ["네요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Giỏi thật → 잘하시네요." },
      { question: "가방이 아주 예쁘___.", options: ["네요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Đẹp quá → 예쁘네요." },
    ],
    commonMistakes: [
      "Nhầm với – 군요 (văn viết vs văn nói).",
      "Dùng khi không trực tiếp trải nghiệm.",
      "Quên ý nghĩa đồng tình.",
    ],
    tags: ["Cảm thán", "Ngạc nhiên", "Đồng tình", "TOPIK I"],
  },
  {
    id: "topik1-65",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – (으)ㄴ/는지 알다 / 모르다",
    meaning: "Có biết là.../không biết là ...",
    explanation: "Diễn tả việc biết hay không biết về thứ gì đó; hoặc cách để làm thứ nào đó dưới một dạng câu hỏi gián tiếp. Bằng cách này làm giảm gánh nặng phải cung cấp thông tin từ phía người nghe, do đó tạo tính lịch sự hơn. Thường được sử dụng cùng với từ để hỏi ở phía trước như 누구, 어디, 어떻게, 왜, 언제, 뭐, 얼마나.",
    formation: "V(qua khứ) + (으)ㄴ지 알다/모르다 / V(hiện tại) + 는지 알다/모르다 / V(tương lai) + (으)ㄹ지 알다/모르다",
    notes: [
      "Biết hoặc không biết.",
      "Câu hỏi gián tiếp.",
      "Tính lịch sự hơn câu hỏi trực tiếp.",
    ],
    examples: [
      { korean: "졸업국관리사무소에 어떻게 가는지 아세요?", vietnamese: "Bạn có biết cách đi đến cục xuất nhập cảnh không?" },
      { korean: "집들이에 무슨 음식을 만들어야 하는지 모르겠어요.", vietnamese: "Tôi không biết nên làm đồ ăn gì vào buổi tiệc tân gia nữa." },
      { korean: "제가 왜 걱정하는지 몰라요?", vietnamese: "Anh không biết tại sao em lo lắng như thế này sao?" },
      { korean: "이 사람 누구인지 아세요?", vietnamese: "Bạn biết người này là ai không?" },
      { korean: "학생들이 거짓말을 해서 선생님이 얼마나 화가 났는지 몰라요.", vietnamese: "Vì các em học sinh đã nói dối nên không biết thầy giáo đã giận dữ đến như thế nào." },
      { korean: "민수 씨는 무슨 음식을 좋아하는지 몰라요.", vietnamese: "Tôi không biết Minsoo thích món gì." },
      { korean: "오늘 왜 이렇게 머리가 아푼지 모르겠어요.", vietnamese: "Không biết sao hôm nay lại đau đầu thế nhỉ?" },
    ],
    exercises: [
      { question: "이 사람 누구인지 알세___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Biết không → 알세요." },
      { question: "무슨 음식을 좋아하는지 몰라___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Không biết → 몰라요." },
    ],
    commonMistakes: [
      "Nhầm với câu hỏi trực tiếp.",
      "Quên từ để hỏi (누구, 어디, 어떻게...).",
      "Dùng sai thì (quá khứ/hiện tại/tương lai).",
    ],
    tags: ["Kiến thức", "Câu hỏi gián tiếp", "Lịch sự", "TOPIK I"],
  },
  {
    id: "topik1-66",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "V – 는 데에",
    meaning: "cho, đối với...",
    explanation: "Vĩ tố kết thúc: sử dụng trong tình huống hay trường hợp mà dự định làm ở vế trước, lúc này vế sau thường xuất hiện các cụm từ như: 좋다/나쁘다, 효과가 있다/없다, 도움이 되다/안 되다, 필요하다/필요 없다. Có thể giản lược 에 trong 는 데에.",
    formation: "V + 는 데(에) + 좋다/나쁘다/효과가 있다/없다/도움이 되다/안 되다/필요하다/필요 없다",
    notes: [
      "Cho, đối với việc gì.",
      "Vế sau: tốt/xấu/có ích/cần thiết.",
      "Có thể lược bỏ 에.",
    ],
    examples: [
      { korean: "건강을 지키는 데에 담배는 좋지 않아요.", vietnamese: "Thuốc lá không tốt cho việc giữ gìn sức khỏe." },
      { korean: "휴식은 피로를 푸는 데에 효과가 있어요.", vietnamese: "Nghỉ giải lao có ích cho việc giải tỏa mệt mỏi." },
      { korean: "이 책을 읽는 데 세 시간이 걸렸어요.", vietnamese: "Tôi dành 3 tiếng cho việc đọc sách." },
      { korean: "살을 빼는 데 등산이 도움이 된다.", vietnamese: "Việc leo núi giúp ích cho việc giảm cân." },
      { korean: "기분 전환을 하는 데에 쇼핑이 최고예요.", vietnamese: "Mua sắm là tốt nhất cho việc chuyển đổi tâm trạng." },
    ],
    exercises: [
      { question: "건강을 지키는 데에 담배는 좋지 않아___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Không tốt → 좋지 않아요." },
      { question: "휴식은 피로를 푸는 데에 효과가 있___.", options: ["요.", "어요.", "습니다.", "습니다."], answer: 0, explanation: "Có ích → 효과가 있어요." },
    ],
    commonMistakes: [
      "Nhầm với -(으)려고 (mục đích vs đối với).",
      "Quên lược bỏ 에.",
      "Dùng sai cụm từ ở vế sau.",
    ],
    tags: ["Mục đích", "Hiệu quả", "Tiện ích", "TOPIK I"],
  },
  {
    id: "topik1-67",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A/V – 지요?",
    meaning: "đúng chứ?, phải chứ?, mà nhỉ?",
    explanation: "Sử dụng khi hỏi để xác nhận lại điều mà người nói đã biết trước hoặc người nói tin rằng người nghe đã biết trước và hỏi để tìm sự đồng tình. Chủ yếu được dùng khi nói. N + (이)지요?",
    formation: "A/V + 지요? / N + (이)지요?",
    notes: [
      "Xác nhận lại điều đã biết.",
      "Tìm sự đồng tình.",
      "Chủ yếu văn nói.",
    ],
    examples: [
      { korean: "제주도가 한국에서 제일 아름다운 섬이지요?", vietnamese: "Jeju là hòn đảo đẹp nhất HQ đúng chứ?" },
      { korean: "서울에서 경복궁이 유명하지요?", vietnamese: "Gyengbokgung nổi tiếng ở Seoul đúng chứ?" },
      { korean: "그 영화 정말 재미있지요?", vietnamese: "Bộ phim đó rất hay phải không?" },
      { korean: "다음달에 한국으로 유학을 갈 거지요?", vietnamese: "Tháng sau cậu đi du học HQ phải không?" },
      { korean: "내일 회의가 있지요?", vietnamese: "Ngày mai có cuộc họp phải không?" },
      { korean: "이번 처음 베트남에 왔지요?", vietnamese: "Đây là lần đầu tiên cậu đến Việt Nam phải không?" },
      { korean: "오늘 날씨가 춥지요?", vietnamese: "Hôm nay thời tiết lạnh mà nhỉ?" },
      { korean: "이 옷 정말 예쁘지요?", vietnamese: "Cái áo này đẹp mà nhỉ?" },
    ],
    exercises: [
      { question: "제주도가 한국에서 제일 아름다운 섬이지___.", options: ["요?", "어요?", "습니까?", "습니까?"], answer: 0, explanation: "Đúng chứ → 섬이지요?" },
      { question: "서울에서 경복궁이 유명하___.", options: ["지요?", "어요?", "습니까?", "습니까?"], answer: 0, explanation: "Đúng chứ → 유명하지요?" },
    ],
    commonMistakes: [
      "Nhầm với -(으)ㄹ까요 (gợi ý vs xác nhận).",
      "Dùng khi không biết trước.",
      "Quên ý nghĩa đồng tình.",
    ],
    tags: ["Xác nhận", "Đồng tình", "TOPIK I"],
  },
  {
    id: "topik1-68",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A – (으)ㄴ가요? / V – 나요?",
    meaning: "Câu hỏi lịch sự",
    explanation: "Đuôi câu này được sử dụng như một cách lịch sự và nhẹ nhàng, vẫn có sắc thái thân mật, tạo cảm giác gần gũi. Thường được dùng trong văn nói khi hỏi khách hàng hoặc với những người có quan hệ xã giao nhưng không quá xa lạ.",
    formation: "Hiện tại: V + 나요? / A + (으)ㄴ가요? / Quá khứ: V/A + 았/었나요? / Tương lai: V/A + (으)ㄹ 건가요?",
    notes: [
      "Lịch sự và nhẹ nhàng.",
      "Văn nói, xã giao.",
      "Thân mật nhưng trang trọng.",
    ],
    examples: [
      { korean: "흐엉 씨는 무슨 운동을 좋아하나요?", vietnamese: "Chị Hương thích môn thể thao gì vậy?" },
      { korean: "어디가 아픈가요?", vietnamese: "Anh đau ở đâu thế?" },
      { korean: "한국 생활이 재미있나요?", vietnamese: "Cuộc sống ở Hàn thú vị chứ ạ?" },
      { korean: "벌써 1시인데 아직도 점심을 안 먹었나요?", vietnamese: "Đã 1 giờ rồi này anh chị vẫn chưa ăn trưa đúng không ạ?" },
      { korean: "어제 시험을 잘 봤나요?", vietnamese: "Hôm qua anh thi tốt chứ ạ?" },
      { korean: "지하철이나 공항버스로 가실 수 있는데 무엇을 이용하실 건가요?", vietnamese: "Anh có thể đi bằng tàu điện ngầm hoặc xe bus sân bay, anh sẽ sử dụng phương tiện nào?" },
    ],
    exercises: [
      { question: "무슨 운동을 좋아하___.", options: ["나요?", "ㄴ가요?", "어요?", "습니까?"], answer: 0, explanation: "Thích động từ → 좋아하나요?" },
      { question: "어디가 아픈___.", options: ["가요?", "나요?", "어요?", "습니까?"], answer: 1, explanation: "Đau tính từ → 아픈가요?" },
    ],
    commonMistakes: [
      "Nhầm với -아/어요 (thông thường vs lịch sự).",
      "Dùng sai thì (hiện tại/quá khứ/tương lai).",
      "Quên ngữ cảnh xã giao.",
    ],
    tags: ["Câu hỏi", "Lịch sự", "Văn nói", "TOPIK I"],
  },
  {
    id: "topik1-69",
    level: "TOPIK 1",
    levelColor: "#22c55e",
    pattern: "A – 아/어 하다",
    meaning: "Cảm thấy...",
    explanation: "Gắn với các tính từ chỉ tâm lý mô tả cảm giác cảm thấy... lúc này cụm cấu trúc sẽ trở thành Động từ. Thường mô tả cảm giác của ngôi thứ 3. Tuy nhiên ngôi 1 có thể được sử dụng để khách quan hoá. Cũng gắn với A khác: cảm thấy. Dùng cho ngôi số 3, đối tượng gắn 을/를.",
    formation: "A(ㅏ/ㅗ) + 아 하다 / A(khác) + 어 하다",
    notes: [
      "Cảm giác tâm lý.",
      "Thường ngôi thứ 3.",
      "Khách quan hóa (ngôi 1).",
    ],
    examples: [
      { korean: "엄마가 슬퍼해요.", vietnamese: "Mẹ cảm thấy buồn." },
      { korean: "요즘 지훈 씨가 피곤해해요.", vietnamese: "Gần đây Jihoon cảm thấy mệt mỏi." },
      { korean: "민호 씨가 축구 경기에서 이겨서 엄청 기뻐해요.", vietnamese: "Anh Minho vì chiến thắng trong trận đá banh nên cảm thấy vui mừng." },
      { korean: "누나가 그 소식을 들으면 기뻐할 거예요.", vietnamese: "Chị gái nếu nghe tin đó sẽ cảm thấy rất vui." },
      { korean: "저는 비가 올 때마다 우울해요.", vietnamese: "Tôi mỗi khi trời mưa sẽ u sầu." },
      { korean: "아이들은 동물원에서 원숭이의 동작을 보고 즐거워했어요.", vietnamese: "Bọn trẻ nhìn thấy động tác của những chú khỉ trong công viên và cảm thấy rất vui." },
      { korean: "흐엉 씨는 게임을 재미있어해요.", vietnamese: "Hương cảm thấy game thú vị." },
      { korean: "아이들이 더워서 에어컨을 틀었어요.", vietnamese: "Bọn trẻ cảm thấy nóng nên bật máy lạnh." },
    ],
    exercises: [
      { question: "요즘 지훈 씨가 피곤해___.", options: ["요.", "해요.", "습니다.", "습니다."], answer: 1, explanation: "Cảm thấy mệt → 피곤해해요." },
      { question: "엄마가 슬퍼___.", options: ["요.", "해요.", "습니다.", "습니다."], answer: 1, explanation: "Cảm thấy buồn → 슬퍼해요." },
    ],
    commonMistakes: [
      "Nhầm với tính từ nguyên bản.",
      "Quên khách quan hóa.",
      "Dùng sai ngôi thứ.",
    ],
    tags: ["Cảm xúc", "Cảm giác", "Khách quan", "TOPIK I"],
  },
];

const LEVELS = ["Tất cả", "TOPIK 1", "TOPIK 2", "TOPIK 3", "TOPIK 4", "TOPIK 5", "TOPIK 6"];

export default function GrammarByLevelPage() {
  const [selectedLevel, setSelectedLevel] = useState("Tất cả");
  const [selectedPattern, setSelectedPattern] = useState<GrammarPattern | null>(GRAMMAR_PATTERNS[0] || null);
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

  const levelStats = useMemo(() => {
    const stats: Record<string, number> = {};
    GRAMMAR_PATTERNS.forEach(p => { stats[p.level] = (stats[p.level] || 0) + 1; });
    return stats;
  }, []);

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
          <h1 className="text-2xl font-bold text-white">Bài tập ngữ pháp theo cấp độ</h1>
          <p className="text-white/50 text-sm mt-1">Luyện ngữ pháp từ A1 đến C1 với giải thích chi tiết</p>
        </div>

        {/* Stats bar - compact on mobile */}
        <div className="mb-5 p-3.5 bg-gradient-to-r from-app-surface/50 to-app-card/50 border border-app-border rounded-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <i className="ri-book-2-line text-app-accent-primary"></i>
              <span className="text-sm font-bold text-white">Tổng: <span className="text-app-accent-primary">{GRAMMAR_PATTERNS.length}</span> cấu trúc</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {["A1", "A2", "B1", "B2", "C1"].map(lv => (
                <span key={lv} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/70 border border-white/10">
                  {lv}: {levelStats[lv] || 0}
                </span>
              ))}
            </div>
          </div>
          {(selectedLevel !== "Tất cả" || search.trim()) && (
            <div className="mt-2 pt-2 border-t border-app-border text-xs text-white/50">
              Đang hiển thị <span className="font-bold text-app-accent-primary">{filtered.length}</span> / {GRAMMAR_PATTERNS.length} cấu trúc
              {selectedLevel !== "Tất cả" && <span> • Cấp độ: <span className="font-bold">{selectedLevel}</span></span>}
              {search.trim() && <span> • Tìm: "<span className="font-bold">{search}</span>"</span>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Pattern list - sticky on desktop */}
          <div className="lg:col-span-1 lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto">
            {/* Filters - sticky on mobile */}
            <div className="mb-3 sticky top-0 bg-app-bg z-10 pb-3">
              <div className="relative mb-3">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>
                <input
                  type="text"
                  placeholder="Tìm cấu trúc..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-app-border rounded-xl text-sm bg-app-surface/50 text-white focus:outline-none focus:ring-2 focus:ring-app-accent-primary"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {LEVELS.map(lv => (
                  <button
                    key={lv}
                    onClick={() => setSelectedLevel(lv)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${selectedLevel === lv ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/60 hover:bg-app-surface/70"}`}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern list - compact cards */}
            <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-1 gap-2">
              {filtered.map(pattern => (
                <button
                  key={pattern.id}
                  onClick={() => { setSelectedPattern(pattern); setActiveTab("explain"); handleReset(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`text-left p-2.5 rounded-lg border cursor-pointer transition-all ${selectedPattern?.id === pattern.id ? "border-app-accent-primary bg-app-accent-primary/10" : "border-app-border bg-app-surface/50 hover:border-app-border hover:bg-app-surface/70"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: pattern.levelColor }}>
                      {pattern.level.replace('TOPIK ', '')}
                    </span>
                    <span className="font-semibold text-xs text-white truncate">{pattern.pattern}</span>
                  </div>
                  <p className="text-[10px] text-white/50 truncate">{pattern.meaning}</p>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-2 text-center py-8 text-white/40 text-sm">Không tìm thấy cấu trúc nào</div>
              )}
            </div>
          </div>

          {/* Right: Detail */}
          <div className="lg:col-span-2">
            {!selectedPattern ? (
              <div className="flex flex-col items-center justify-center h-64 text-white/40">
                <i className="ri-book-open-line text-5xl mb-3"></i>
                <p className="text-sm">Chọn một cấu trúc ngữ pháp để xem chi tiết</p>
              </div>
            ) : (
              <div className="bg-app-surface/50 rounded-2xl border border-app-border overflow-hidden">
                {/* Pattern header with back button on mobile */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-app-border">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => setSelectedPattern(null)}
                      className="lg:hidden flex items-center gap-1 text-white/50 hover:text-white/70 text-sm"
                    >
                      <i className="ri-arrow-left-line"></i>Quay lại
                    </button>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold text-white" style={{ backgroundColor: selectedPattern.levelColor }}>
                      {selectedPattern.level}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-white">{selectedPattern.pattern}</h2>
                  </div>
                  <p className="text-white/70 font-medium text-sm sm:text-base">{selectedPattern.meaning}</p>
                  <div className="mt-2 px-3 py-2 bg-app-card/50 rounded-lg">
                    <span className="text-xs text-white/50 font-semibold">Cấu trúc: </span>
                    <span className="text-xs text-white font-mono">{selectedPattern.formation}</span>
                  </div>
                </div>

                {/* Tabs - better touch targets on mobile */}
                <div className="flex border-b border-app-border">
                  {([
                    { id: "explain", label: "Giải thích", icon: "ri-book-2-line" },
                    { id: "examples", label: "Ví dụ", icon: "ri-chat-quote-line" },
                    { id: "exercise", label: "Bài tập", icon: "ri-pencil-line" },
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 text-xs sm:text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${activeTab === tab.id ? "text-app-accent-primary border-b-2 border-app-accent-primary" : "text-white/50 hover:text-white/70"}`}
                    >
                      <i className={tab.icon}></i>{tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content - better padding for mobile */}
                <div className="p-4 sm:p-6">
                  {activeTab === "explain" && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2">Giải thích</h3>
                        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{selectedPattern.explanation}</p>
                      </div>
                      {selectedPattern.notes && selectedPattern.notes.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-white mb-2">Quy tắc sử dụng</h3>
                          <div className="bg-app-accent-primary/10 border border-app-accent-primary/20 rounded-xl p-4 space-y-2">
                            {selectedPattern.notes.map((note, i) => (
                              <div key={i} className="flex items-start gap-2.5 text-sm">
                                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-app-accent-primary/20 text-app-accent-primary text-[10px] font-bold mt-0.5">{i + 1}</span>
                                <span className="text-white leading-relaxed">{note}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2">Lỗi thường gặp</h3>
                        <div className="space-y-2">
                          {selectedPattern.commonMistakes.map((m, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <i className="ri-error-warning-line text-amber-500 flex-shrink-0 mt-0.5"></i>
                              <span className="text-white/70">{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {selectedPattern.comparison && (
                        <div>
                          <h3 className="text-sm font-semibold text-white mb-2">{selectedPattern.comparison.title}</h3>
                          <div className="border border-app-border rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-app-surface/50">
                                  <th className="px-4 py-2.5 text-left font-bold text-app-accent-primary border-r border-app-border">{selectedPattern.comparison.headers[0]}</th>
                                  <th className="px-4 py-2.5 text-left font-bold text-blue-400">{selectedPattern.comparison.headers[1]}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedPattern.comparison.rows.map((row, i) => (
                                  <tr key={i} className={i % 2 === 0 ? "bg-app-card/30" : "bg-app-surface/30"}>
                                    <td className="px-4 py-2.5 text-white/70 border-r border-app-border align-top">{row[0]}</td>
                                    <td className="px-4 py-2.5 text-white/70 align-top">{row[1]}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPattern.tags.map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-app-accent-primary/10 text-app-accent-primary text-xs rounded-full font-medium">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "examples" && (
                    <div className="space-y-3 sm:space-y-4">
                      {selectedPattern.examples.map((ex, i) => (
                        <div key={i} className="p-3 sm:p-4 bg-app-card/50 rounded-xl">
                          <p className="text-sm sm:text-base font-bold text-white mb-1">{ex.korean}</p>
                          <p className="text-xs sm:text-sm text-white/50">{ex.vietnamese}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "exercise" && (
                    <div className="space-y-6">
                      {selectedPattern.exercises.map((ex, qIdx) => (
                        <div key={qIdx} className="space-y-3">
                          <p className="text-sm font-semibold text-white">
                            {qIdx + 1}. {ex.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {ex.options.map((opt, optIdx) => {
                              const isSelected = answers[qIdx] === optIdx;
                              const isCorrect = ex.answer === optIdx;
                              let btnClass = "px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all border text-left whitespace-nowrap ";
                              if (!showResults) {
                                btnClass += isSelected
                                  ? "bg-app-accent-primary/10 border-app-accent-primary text-app-accent-primary"
                                  : "bg-app-card/30 border-app-border text-white/70 hover:border-app-border";
                              } else {
                                if (isCorrect) btnClass += "bg-green-500/10 border-green-500 text-green-400";
                                else if (isSelected && !isCorrect) btnClass += "bg-red-500/10 border-red-500 text-red-400";
                                else btnClass += "bg-app-card/30 border-app-border text-white/40";
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
                            <div className={`p-3 rounded-lg text-xs ${answers[qIdx] === ex.answer ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
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
                          className={`w-full py-3 rounded-xl font-semibold text-sm cursor-pointer transition-colors whitespace-nowrap ${Object.keys(answers).length < selectedPattern.exercises.length ? "bg-app-surface/50 text-white/40 cursor-not-allowed" : "bg-app-accent-primary hover:bg-app-accent-primary/90 text-app-bg"}`}
                        >
                          Kiểm tra đáp án
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className={`p-4 rounded-xl text-center ${correctCount === selectedPattern.exercises.length ? "bg-green-500/10" : "bg-amber-500/10"}`}>
                            <p className="text-xl font-bold mb-1" style={{ color: correctCount === selectedPattern.exercises.length ? "#22c55e" : "#f59e0b" }}>
                              {correctCount}/{selectedPattern.exercises.length}
                            </p>
                            <p className="text-sm font-medium text-white/70">
                              {correctCount === selectedPattern.exercises.length ? "Hoàn hảo! Bạn đã nắm vững cấu trúc này." : "Hãy xem lại phần giải thích và thử lại!"}
                            </p>
                          </div>
                          <button
                            onClick={handleReset}
                            className="w-full py-2.5 rounded-xl font-semibold text-sm cursor-pointer border border-app-border text-white/70 hover:bg-app-surface/50 transition-colors whitespace-nowrap"
                          >
                            Làm lại
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

