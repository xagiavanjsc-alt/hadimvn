import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

// ─── Types ────────────────────────────────────────────────────────────────────
interface GrammarExample {
  korean: string;
  vietnamese: string;
  note?: string;
}

interface GrammarPoint {
  id: string;
  pattern: string;
  meaning: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  usage: string;
  structure: string;
  examples: GrammarExample[];
  tips: string[];
  commonMistakes?: string[];
}

interface GrammarTopic {
  id: string;
  name: string;
  nameVi: string;
  icon: string;
  color: string;
  description: string;
  points: GrammarPoint[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const grammarTopics: GrammarTopic[] = [
  {
    id: "daily-life",
    name: "일상생활",
    nameVi: "Cuộc sống hàng ngày",
    icon: "ri-home-heart-line",
    color: "#34d399",
    description: "Ngữ pháp dùng trong các tình huống hàng ngày",
    points: [
      {
        id: "g1",
        pattern: "-(으)ㄹ 거예요",
        meaning: "Sẽ... / Dự định...",
        level: "A2",
        usage: "Diễn đạt kế hoạch hoặc dự đoán trong tương lai",
        structure: "Động từ + -(으)ㄹ 거예요",
        examples: [
          { korean: "내일 친구를 만날 거예요.", vietnamese: "Ngày mai tôi sẽ gặp bạn.", note: "만나다 → 만날" },
          { korean: "주말에 집에서 쉴 거예요.", vietnamese: "Cuối tuần tôi sẽ nghỉ ở nhà.", note: "쉬다 → 쉴" },
          { korean: "비가 올 거예요.", vietnamese: "Trời sẽ mưa.", note: "오다 → 올" },
        ],
        tips: ["Phụ âm cuối: -(으)ㄹ 거예요", "Không có phụ âm cuối hoặc ㄹ: -ㄹ 거예요"],
        commonMistakes: ["❌ 내일 친구를 만날 거예요 (đúng) vs ❌ 만을 거예요 (sai)"],
      },
      {
        id: "g2",
        pattern: "-고 싶다",
        meaning: "Muốn...",
        level: "A1",
        usage: "Diễn đạt mong muốn của bản thân",
        structure: "Động từ + -고 싶다",
        examples: [
          { korean: "한국에 가고 싶어요.", vietnamese: "Tôi muốn đi Hàn Quốc." },
          { korean: "맛있는 음식을 먹고 싶어요.", vietnamese: "Tôi muốn ăn đồ ăn ngon." },
          { korean: "한국어를 잘 하고 싶어요.", vietnamese: "Tôi muốn nói tiếng Hàn giỏi." },
        ],
        tips: ["Chỉ dùng cho ngôi thứ nhất (tôi)", "Ngôi thứ ba dùng -고 싶어하다"],
        commonMistakes: ["❌ 친구가 가고 싶어요 (sai) → ✓ 친구가 가고 싶어해요"],
      },
      {
        id: "g3",
        pattern: "-(으)면 되다",
        meaning: "Chỉ cần... là được",
        level: "B1",
        usage: "Diễn đạt điều kiện đủ để đạt được kết quả",
        structure: "Động từ/Tính từ + -(으)면 되다",
        examples: [
          { korean: "여기에 이름을 쓰면 돼요.", vietnamese: "Chỉ cần viết tên vào đây là được." },
          { korean: "버스를 타면 돼요.", vietnamese: "Chỉ cần đi xe buýt là được." },
          { korean: "조금만 기다리면 돼요.", vietnamese: "Chỉ cần đợi một chút là được." },
        ],
        tips: ["Nhấn mạnh rằng chỉ cần làm điều đó là đủ", "Thường dùng để hướng dẫn hoặc trả lời câu hỏi"],
      },
    ],
  },
  {
    id: "time-tense",
    name: "시제와 시간",
    nameVi: "Thì & Thời gian",
    icon: "ri-time-line",
    color: "#fbbf24",
    description: "Ngữ pháp diễn đạt thời gian và các thì",
    points: [
      {
        id: "g4",
        pattern: "-았/었어요",
        meaning: "Đã... (quá khứ)",
        level: "A1",
        usage: "Diễn đạt hành động đã xảy ra trong quá khứ",
        structure: "Động từ + -았/었어요 (nguyên âm ㅏ/ㅗ → -았, còn lại → -었)",
        examples: [
          { korean: "어제 학교에 갔어요.", vietnamese: "Hôm qua tôi đã đi học.", note: "가다 → 갔어요" },
          { korean: "밥을 먹었어요.", vietnamese: "Tôi đã ăn cơm.", note: "먹다 → 먹었어요" },
          { korean: "친구를 만났어요.", vietnamese: "Tôi đã gặp bạn.", note: "만나다 → 만났어요" },
        ],
        tips: ["하다 → 했어요", "오다 → 왔어요", "이다 → 이었어요/였어요"],
      },
      {
        id: "g5",
        pattern: "-(으)ㄴ 후에",
        meaning: "Sau khi...",
        level: "A2",
        usage: "Diễn đạt hành động xảy ra sau một hành động khác",
        structure: "Động từ + -(으)ㄴ 후에 + mệnh đề chính",
        examples: [
          { korean: "밥을 먹은 후에 산책했어요.", vietnamese: "Sau khi ăn cơm, tôi đã đi dạo." },
          { korean: "숙제를 한 후에 게임을 해요.", vietnamese: "Sau khi làm bài tập, tôi chơi game." },
          { korean: "졸업한 후에 취직할 거예요.", vietnamese: "Sau khi tốt nghiệp, tôi sẽ đi làm." },
        ],
        tips: ["Tương tự: -고 나서 (sau khi, nhấn mạnh thứ tự)", "Phân biệt với -기 전에 (trước khi)"],
      },
      {
        id: "g6",
        pattern: "-는 동안",
        meaning: "Trong khi... / Suốt thời gian...",
        level: "B1",
        usage: "Diễn đạt hai hành động xảy ra đồng thời trong một khoảng thời gian",
        structure: "Động từ + -는 동안 + mệnh đề chính",
        examples: [
          { korean: "음악을 듣는 동안 공부해요.", vietnamese: "Tôi học trong khi nghe nhạc." },
          { korean: "한국에 있는 동안 많이 배웠어요.", vietnamese: "Trong thời gian ở Hàn Quốc, tôi đã học được nhiều." },
          { korean: "기다리는 동안 책을 읽었어요.", vietnamese: "Trong khi chờ, tôi đã đọc sách." },
        ],
        tips: ["Chủ ngữ hai mệnh đề có thể khác nhau", "Danh từ + 동안: 방학 동안 (trong kỳ nghỉ)"],
      },
    ],
  },
  {
    id: "reason-cause",
    name: "이유와 원인",
    nameVi: "Lý do & Nguyên nhân",
    icon: "ri-question-answer-line",
    color: "#f87171",
    description: "Ngữ pháp diễn đạt lý do và nguyên nhân",
    points: [
      {
        id: "g7",
        pattern: "-(으)니까",
        meaning: "Vì... / Bởi vì...",
        level: "A2",
        usage: "Diễn đạt lý do hoặc nguyên nhân, thường dùng khi đưa ra lời khuyên hoặc mệnh lệnh",
        structure: "Động từ/Tính từ + -(으)니까 + kết quả/lời khuyên",
        examples: [
          { korean: "배가 고프니까 밥을 먹어요.", vietnamese: "Vì đói nên ăn cơm đi." },
          { korean: "날씨가 추우니까 옷을 입으세요.", vietnamese: "Vì trời lạnh nên hãy mặc áo vào." },
          { korean: "시간이 없으니까 빨리 가요.", vietnamese: "Vì không có thời gian nên đi nhanh thôi." },
        ],
        tips: ["Khác với -아/어서: -(으)니까 có thể dùng với mệnh lệnh/đề nghị", "아/어서 không dùng được với mệnh lệnh"],
        commonMistakes: ["❌ 배가 고파서 밥을 먹어요 (không tự nhiên với mệnh lệnh)"],
      },
      {
        id: "g8",
        pattern: "-아/어서",
        meaning: "Vì... nên... (nguyên nhân-kết quả)",
        level: "A1",
        usage: "Diễn đạt nguyên nhân dẫn đến kết quả tự nhiên",
        structure: "Động từ/Tính từ + -아/어서 + kết quả",
        examples: [
          { korean: "피곤해서 일찍 잤어요.", vietnamese: "Vì mệt nên tôi đã ngủ sớm." },
          { korean: "비가 와서 집에 있었어요.", vietnamese: "Vì trời mưa nên tôi ở nhà." },
          { korean: "맛있어서 많이 먹었어요.", vietnamese: "Vì ngon nên tôi đã ăn nhiều." },
        ],
        tips: ["Thì của mệnh đề chính quyết định thì của toàn câu", "Không dùng với mệnh lệnh/đề nghị"],
      },
      {
        id: "g9",
        pattern: "-(으)ㄹ 때문에",
        meaning: "Vì lý do... (nhấn mạnh)",
        level: "B1",
        usage: "Nhấn mạnh nguyên nhân, thường dùng trong văn viết hoặc tình huống trang trọng",
        structure: "Động từ/Tính từ + -(으)ㄹ 때문에 / Danh từ + 때문에",
        examples: [
          { korean: "교통 때문에 늦었어요.", vietnamese: "Vì giao thông nên tôi đến muộn." },
          { korean: "건강 때문에 운동을 시작했어요.", vietnamese: "Vì sức khỏe nên tôi bắt đầu tập thể dục." },
          { korean: "일이 많기 때문에 쉬지 못해요.", vietnamese: "Vì có nhiều việc nên không thể nghỉ." },
        ],
        tips: ["Danh từ + 때문에 (không cần 이/가)", "Động từ + -기 때문에"],
      },
    ],
  },
  {
    id: "condition",
    name: "조건과 가정",
    nameVi: "Điều kiện & Giả định",
    icon: "ri-git-branch-line",
    color: "#a78bfa",
    description: "Ngữ pháp diễn đạt điều kiện và giả định",
    points: [
      {
        id: "g10",
        pattern: "-(으)면",
        meaning: "Nếu... thì...",
        level: "A2",
        usage: "Diễn đạt điều kiện",
        structure: "Động từ/Tính từ + -(으)면 + kết quả",
        examples: [
          { korean: "시간이 있으면 같이 가요.", vietnamese: "Nếu có thời gian thì cùng đi nhé." },
          { korean: "열심히 공부하면 합격할 거예요.", vietnamese: "Nếu học chăm chỉ thì sẽ đậu." },
          { korean: "비가 오면 집에 있을 거예요.", vietnamese: "Nếu trời mưa thì tôi sẽ ở nhà." },
        ],
        tips: ["Phụ âm cuối: -(으)면", "Không có phụ âm cuối hoặc ㄹ: -면"],
      },
      {
        id: "g11",
        pattern: "-았/었으면 좋겠다",
        meaning: "Ước gì... / Giá mà...",
        level: "B1",
        usage: "Diễn đạt mong muốn về điều không thực tế hoặc khó xảy ra",
        structure: "Động từ/Tính từ + -았/었으면 좋겠다",
        examples: [
          { korean: "한국어를 잘 했으면 좋겠어요.", vietnamese: "Ước gì tôi nói tiếng Hàn giỏi." },
          { korean: "날씨가 좋았으면 좋겠어요.", vietnamese: "Ước gì thời tiết đẹp." },
          { korean: "돈이 많았으면 좋겠어요.", vietnamese: "Ước gì tôi có nhiều tiền." },
        ],
        tips: ["Diễn đạt ước muốn không chắc thực hiện được", "Khác với -고 싶다 (muốn, có thể thực hiện)"],
      },
      {
        id: "g12",
        pattern: "-(으)ㄹ 수 있다/없다",
        meaning: "Có thể / Không thể",
        level: "A2",
        usage: "Diễn đạt khả năng hoặc không có khả năng làm gì",
        structure: "Động từ + -(으)ㄹ 수 있다/없다",
        examples: [
          { korean: "저는 수영을 할 수 있어요.", vietnamese: "Tôi có thể bơi." },
          { korean: "지금은 갈 수 없어요.", vietnamese: "Bây giờ tôi không thể đi." },
          { korean: "한국어로 말할 수 있어요?", vietnamese: "Bạn có thể nói tiếng Hàn không?" },
        ],
        tips: ["Phân biệt với -아/어도 되다 (được phép)", "Phân biệt với -(으)ㄹ 줄 알다 (biết cách làm)"],
      },
    ],
  },
  {
    id: "contrast",
    name: "대조와 양보",
    nameVi: "Tương phản & Nhượng bộ",
    icon: "ri-arrow-left-right-line",
    color: "#fb923c",
    description: "Ngữ pháp diễn đạt sự tương phản và nhượng bộ",
    points: [
      {
        id: "g13",
        pattern: "-지만",
        meaning: "Nhưng... / Tuy nhiên...",
        level: "A2",
        usage: "Nối hai mệnh đề có ý nghĩa tương phản",
        structure: "Mệnh đề 1 + -지만 + Mệnh đề 2",
        examples: [
          { korean: "한국어가 어렵지만 재미있어요.", vietnamese: "Tiếng Hàn khó nhưng thú vị." },
          { korean: "비가 오지만 나가고 싶어요.", vietnamese: "Trời mưa nhưng tôi muốn ra ngoài." },
          { korean: "피곤하지만 공부해야 해요.", vietnamese: "Mệt nhưng phải học." },
        ],
        tips: ["Chủ ngữ hai mệnh đề thường giống nhau", "Khác với -는데 (bối cảnh/tương phản nhẹ hơn)"],
      },
      {
        id: "g14",
        pattern: "-(으)ㄹ 텐데",
        meaning: "Chắc là... nhưng... / Dù... nhưng...",
        level: "B2",
        usage: "Diễn đạt suy đoán kết hợp với sự tương phản hoặc lo lắng",
        structure: "Động từ/Tính từ + -(으)ㄹ 텐데",
        examples: [
          { korean: "힘들 텐데 잘 하고 있어요.", vietnamese: "Chắc là vất vả nhưng bạn đang làm tốt đấy." },
          { korean: "배가 고플 텐데 뭐 먹을까요?", vietnamese: "Chắc là đói rồi, ăn gì nhỉ?" },
          { korean: "비가 올 텐데 우산을 가져가세요.", vietnamese: "Chắc là trời sẽ mưa, hãy mang ô đi." },
        ],
        tips: ["Thể hiện sự quan tâm hoặc lo lắng cho người khác", "Thường dùng trong hội thoại tự nhiên"],
      },
      {
        id: "g15",
        pattern: "-아/어도",
        meaning: "Dù... cũng... / Mặc dù...",
        level: "B1",
        usage: "Diễn đạt nhượng bộ — dù điều kiện có như thế nào, kết quả vẫn vậy",
        structure: "Động từ/Tính từ + -아/어도 + kết quả",
        examples: [
          { korean: "바빠도 운동을 해요.", vietnamese: "Dù bận cũng tập thể dục." },
          { korean: "비가 와도 나가요.", vietnamese: "Dù trời mưa cũng ra ngoài." },
          { korean: "어려워도 포기하지 않아요.", vietnamese: "Dù khó cũng không bỏ cuộc." },
        ],
        tips: ["Khác với -지만 (tương phản đơn giản)", "-아/어도 nhấn mạnh kết quả không thay đổi"],
      },
    ],
  },
  {
    id: "politeness",
    name: "존댓말과 경어",
    nameVi: "Kính ngữ & Lịch sự",
    icon: "ri-user-star-line",
    color: "#e8c84a",
    description: "Ngữ pháp kính ngữ và cách nói lịch sự",
    points: [
      {
        id: "g16",
        pattern: "-(으)세요",
        meaning: "Hãy... (lịch sự) / Xin hãy...",
        level: "A1",
        usage: "Mệnh lệnh hoặc đề nghị lịch sự",
        structure: "Động từ + -(으)세요",
        examples: [
          { korean: "여기 앉으세요.", vietnamese: "Xin hãy ngồi đây." },
          { korean: "천천히 말씀해 주세요.", vietnamese: "Xin hãy nói chậm thôi." },
          { korean: "잠깐만 기다리세요.", vietnamese: "Xin hãy đợi một chút." },
        ],
        tips: ["Lịch sự hơn -아/어요 khi ra lệnh", "Thêm 주세요 để nhờ vả: -아/어 주세요"],
      },
      {
        id: "g17",
        pattern: "-(으)시다",
        meaning: "Kính ngữ cho chủ ngữ",
        level: "A2",
        usage: "Tôn trọng chủ ngữ (người lớn tuổi, cấp trên)",
        structure: "Động từ + -(으)시 + đuôi câu",
        examples: [
          { korean: "선생님이 오셨어요.", vietnamese: "Thầy/Cô đã đến rồi." },
          { korean: "할머니께서 주무세요.", vietnamese: "Bà đang ngủ." },
          { korean: "아버지가 회사에 가세요.", vietnamese: "Bố đi làm." },
        ],
        tips: ["Dùng 께서 thay 이/가 khi chủ ngữ được tôn trọng", "Một số từ đặc biệt: 드시다(ăn), 주무시다(ngủ), 계시다(ở)"],
      },
      {
        id: "g18",
        pattern: "-겠습니다",
        meaning: "Tôi sẽ... (trang trọng)",
        level: "B1",
        usage: "Diễn đạt ý định hoặc dự đoán trong văn phong trang trọng",
        structure: "Động từ + -겠습니다",
        examples: [
          { korean: "지금 바로 확인하겠습니다.", vietnamese: "Tôi sẽ kiểm tra ngay bây giờ." },
          { korean: "최선을 다하겠습니다.", vietnamese: "Tôi sẽ cố gắng hết sức." },
          { korean: "잘 부탁드리겠습니다.", vietnamese: "Xin nhờ sự giúp đỡ của bạn." },
        ],
        tips: ["Dùng trong môi trường công sở, dịch vụ khách hàng", "Lịch sự hơn -(으)ㄹ 거예요"],
      },
    ],
  },
];

// ─── Level colors ─────────────────────────────────────────────────────────────
const levelColors: Record<string, string> = {
  A1: "#34d399", A2: "#6ee7b7", B1: "#fbbf24", B2: "#f59e0b", C1: "#f87171",
};

// ─── Grammar Card ─────────────────────────────────────────────────────────────
function GrammarCard({ point, onSelect }: { point: GrammarPoint; onSelect: () => void }) {
  return (
    <button onClick={onSelect}
      className="text-left p-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/15 transition-all cursor-pointer group w-full">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[#e8c84a] font-bold text-base font-mono">{point.pattern}</span>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${levelColors[point.level]}20`, color: levelColors[point.level] }}>
          {point.level}
        </span>
      </div>
      <p className="text-white/80 text-sm font-medium mb-1">{point.meaning}</p>
      <p className="text-white/40 text-xs line-clamp-2">{point.usage}</p>
      <div className="mt-3 pt-3 border-t border-white/5">
        <p className="text-white/50 text-xs italic">{point.examples[0].korean}</p>
        <p className="text-white/30 text-xs">{point.examples[0].vietnamese}</p>
      </div>
    </button>
  );
}

// ─── Grammar Detail Modal ─────────────────────────────────────────────────────
function GrammarDetail({ point, onClose }: { point: GrammarPoint; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"examples" | "tips" | "practice">("examples");
  const [practiceInput, setPracticeInput] = useState("");
  const [practiceResult, setPracticeResult] = useState<string | null>(null);

  const handleTTS = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "ko-KR";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  const handlePracticeCheck = () => {
    if (practiceInput.trim()) {
      setPracticeResult("Câu của bạn trông ổn! Hãy so sánh với các ví dụ để tự đánh giá.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#1a1f2e]"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1f2e] border-b border-white/8 px-6 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#e8c84a] font-bold text-xl font-mono">{point.pattern}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${levelColors[point.level]}20`, color: levelColors[point.level] }}>
                {point.level}
              </span>
            </div>
            <p className="text-white/70 text-sm">{point.meaning}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="p-6">
          {/* Structure */}
          <div className="p-4 rounded-xl bg-[#e8c84a]/5 border border-[#e8c84a]/15 mb-5">
            <p className="text-[#e8c84a] text-xs font-semibold mb-1">Cấu trúc</p>
            <p className="text-white font-mono text-sm">{point.structure}</p>
          </div>

          {/* Usage */}
          <p className="text-white/60 text-sm mb-5">{point.usage}</p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-5 w-fit">
            {(["examples", "tips", "practice"] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${activeTab === tab ? "bg-[#e8c84a] text-[#141720]" : "text-white/50 hover:text-white/80"}`}>
                {tab === "examples" ? "Ví dụ" : tab === "tips" ? "Mẹo" : "Luyện tập"}
              </button>
            ))}
          </div>

          {activeTab === "examples" && (
            <div className="space-y-3">
              {point.examples.map((ex, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/8 bg-white/3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-white font-medium text-base mb-1">{ex.korean}</p>
                      <p className="text-white/50 text-sm">{ex.vietnamese}</p>
                      {ex.note && <p className="text-[#e8c84a]/70 text-xs mt-1 font-mono">{ex.note}</p>}
                    </div>
                    <button onClick={() => handleTTS(ex.korean)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 cursor-pointer flex-shrink-0">
                      <i className="ri-volume-up-line text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "tips" && (
            <div className="space-y-3">
              <div className="space-y-2">
                {point.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-white/3 border border-white/8">
                    <i className="ri-lightbulb-line text-[#e8c84a] text-sm mt-0.5 flex-shrink-0"></i>
                    <p className="text-white/70 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
              {point.commonMistakes && (
                <div>
                  <p className="text-rose-400 text-xs font-semibold mb-2">Lỗi thường gặp</p>
                  {point.commonMistakes.map((m, i) => (
                    <div key={i} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
                      <p className="text-white/60 text-sm">{m}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "practice" && (
            <div>
              <p className="text-white/60 text-sm mb-4">Hãy tạo một câu sử dụng cấu trúc <span className="text-[#e8c84a] font-mono">{point.pattern}</span>:</p>
              <textarea value={practiceInput} onChange={e => setPracticeInput(e.target.value)}
                placeholder="Viết câu của bạn ở đây..."
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm bg-white/5 border border-white/10 text-white placeholder-white/25 outline-none resize-none focus:border-[#e8c84a]/30 mb-3" />
              <button onClick={handlePracticeCheck} disabled={!practiceInput.trim()}
                className="w-full py-2.5 rounded-xl bg-[#e8c84a] text-[#141720] font-bold text-sm disabled:opacity-30 cursor-pointer whitespace-nowrap">
                Kiểm tra
              </button>
              {practiceResult && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 text-sm">{practiceResult}</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-white/8">
                <p className="text-white/40 text-xs mb-2">Ví dụ tham khảo:</p>
                {point.examples.slice(0, 2).map((ex, i) => (
                  <p key={i} className="text-white/50 text-xs mb-1 font-mono">{ex.korean}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GrammarByTopicPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<GrammarPoint | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const currentTopic = grammarTopics.find(t => t.id === selectedTopic);

  const filteredPoints = useMemo(() => {
    if (!currentTopic) return [];
    return currentTopic.points.filter(p => {
      const matchLevel = levelFilter === "all" || p.level === levelFilter;
      const matchSearch = !searchQuery || p.pattern.includes(searchQuery) || p.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      return matchLevel && matchSearch;
    });
  }, [currentTopic, levelFilter, searchQuery]);

  const allPoints = useMemo(() => {
    if (searchQuery) {
      return grammarTopics.flatMap(t => t.points).filter(p =>
        p.pattern.includes(searchQuery) || p.meaning.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  }, [searchQuery]);

  const totalPoints = grammarTopics.reduce((s, t) => s + t.points.length, 0);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Luyện ngữ pháp theo chủ đề</h1>
          <p className="text-white/50 text-sm">Ngữ pháp phân loại theo tình huống thực tế — học có hệ thống và hiệu quả</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm"></i>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm cấu trúc ngữ pháp... (VD: -지만, muốn, điều kiện)"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 outline-none focus:border-white/20" />
        </div>

        {/* Search results */}
        {searchQuery && allPoints.length > 0 && (
          <div className="mb-6">
            <p className="text-white/50 text-xs mb-3">Kết quả tìm kiếm ({allPoints.length})</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allPoints.map(p => (
                <GrammarCard key={p.id} point={p} onSelect={() => setSelectedPoint(p)} />
              ))}
            </div>
          </div>
        )}

        {!searchQuery && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Chủ đề", value: grammarTopics.length, icon: "ri-apps-line", color: "#e8c84a" },
                { label: "Cấu trúc", value: totalPoints, icon: "ri-book-2-line", color: "#34d399" },
                { label: "Cấp độ", value: "A1–C1", icon: "ri-bar-chart-line", color: "#a78bfa" },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-white/8 bg-white/3 p-4 text-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${s.color}20` }}>
                    <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                  </div>
                  <p className="text-white font-bold text-lg">{s.value}</p>
                  <p className="text-white/40 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {!selectedTopic ? (
              /* Topic grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grammarTopics.map(topic => (
                  <button key={topic.id} onClick={() => setSelectedTopic(topic.id)}
                    className="text-left p-5 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/15 transition-all cursor-pointer group">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl mb-3" style={{ backgroundColor: `${topic.color}20` }}>
                      <i className={`${topic.icon} text-lg`} style={{ color: topic.color }}></i>
                    </div>
                    <h3 className="text-white font-bold text-base mb-0.5 group-hover:text-[#e8c84a] transition-colors">{topic.name}</h3>
                    <p className="text-white/50 text-sm mb-2">{topic.nameVi}</p>
                    <p className="text-white/35 text-xs mb-3">{topic.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/30 text-xs">{topic.points.length} cấu trúc</span>
                      <div className="flex gap-1">
                        {[...new Set(topic.points.map(p => p.level))].map(lvl => (
                          <span key={lvl} className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                            style={{ backgroundColor: `${levelColors[lvl]}20`, color: levelColors[lvl] }}>{lvl}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Topic detail */
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <button onClick={() => setSelectedTopic(null)}
                    className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm cursor-pointer transition-colors">
                    <i className="ri-arrow-left-line"></i> Tất cả chủ đề
                  </button>
                  <span className="text-white/20">/</span>
                  <span className="text-white/70 text-sm font-medium">{currentTopic?.name}</span>
                </div>

                {/* Level filter */}
                <div className="flex gap-2 flex-wrap mb-5">
                  {["all", "A1", "A2", "B1", "B2", "C1"].map(lvl => (
                    <button key={lvl} onClick={() => setLevelFilter(lvl)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${levelFilter === lvl ? (lvl === "all" ? "bg-white/15 text-white" : "") : "bg-white/5 text-white/50 hover:bg-white/8"}`}
                      style={levelFilter === lvl && lvl !== "all" ? { backgroundColor: `${levelColors[lvl]}25`, color: levelColors[lvl] } : {}}>
                      {lvl === "all" ? "Tất cả" : lvl}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPoints.map(p => (
                    <GrammarCard key={p.id} point={p} onSelect={() => setSelectedPoint(p)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedPoint && (
        <GrammarDetail point={selectedPoint} onClose={() => setSelectedPoint(null)} />
      )}
    </DashboardLayout>
  );
}

