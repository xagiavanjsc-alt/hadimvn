import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useXPSystem } from "@/hooks/useXPSystem";
import { useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────
interface PlacementQuestion {
  id: string;
  targetLevel: "1A" | "1B" | "2A" | "2B" | "3A" | "3B" | "4A" | "4B";
  question: string;
  questionVi: string;
  options: string[];
  optionsVi: string[];
  correctIndex: number;
  explanation: string;
  skill: "vocabulary" | "grammar" | "reading";
}

// ─── Questions (từ dễ đến khó, bao phủ 1A → 4B) ──────────────────────────
const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // ── 1A Level ──
  {
    id: "p1",
    targetLevel: "1A",
    skill: "vocabulary",
    question: "\"Xin chào\" trong tiếng Hàn là gì?",
    questionVi: "Chọn cách nói xin chào lịch sự",
    options: ["감사합니다", "안녕하세요", "죄송합니다", "잘 자요"],
    optionsVi: ["Cảm ơn", "Xin chào", "Xin lỗi", "Ngủ ngon"],
    correctIndex: 1,
    explanation: "안녕하세요 = Xin chào (lịch sự). Đây là cách chào cơ bản nhất trong tiếng Hàn.",
  },
  {
    id: "p2",
    targetLevel: "1A",
    skill: "grammar",
    question: "저는 학생___. (Tôi là học sinh.)",
    questionVi: "Điền từ đúng vào chỗ trống",
    options: ["이에요", "에서", "을", "가"],
    optionsVi: ["là (sau phụ âm)", "ở / từ", "tân ngữ", "chủ ngữ"],
    correctIndex: 0,
    explanation: "이에요 dùng sau phụ âm để diễn đạt \"là\". 학생 kết thúc bằng phụ âm ㅇ nên dùng 이에요.",
  },
  {
    id: "p3",
    targetLevel: "1A",
    skill: "vocabulary",
    question: "\"Sách\" trong tiếng Hàn là gì?",
    questionVi: "Chọn từ đúng",
    options: ["가방", "책", "연필", "공책"],
    optionsVi: ["Túi", "Sách", "Bút chì", "Vở"],
    correctIndex: 1,
    explanation: "책 = sách. Đây là từ vựng cơ bản trong bài học đầu tiên.",
  },
  {
    id: "p4",
    targetLevel: "1A",
    skill: "grammar",
    question: "지금 몇 시___? (Bây giờ mấy giờ?)",
    questionVi: "Điền trợ từ đúng",
    options: ["이에요", "예요", "있어요", "가요"],
    optionsVi: ["là (sau phụ âm)", "là (sau nguyên âm)", "có", "đi"],
    correctIndex: 1,
    explanation: "시 kết thúc bằng nguyên âm ㅣ nên dùng 예요. Câu hỏi về giờ: 몇 시예요?",
  },
  // ── 1B Level ──
  {
    id: "p5",
    targetLevel: "1B",
    skill: "grammar",
    question: "지난 주말에 영화를 ___. (Cuối tuần trước đã xem phim.)",
    questionVi: "Chia động từ 보다 thì quá khứ",
    options: ["봐요", "봤어요", "볼 거예요", "보고 싶어요"],
    optionsVi: ["Xem (hiện tại)", "Đã xem (quá khứ)", "Sẽ xem (tương lai)", "Muốn xem"],
    correctIndex: 1,
    explanation: "봤어요 là thì quá khứ của 보다. 보다 → 봐요 (hiện tại) → 봤어요 (quá khứ).",
  },
  {
    id: "p6",
    targetLevel: "1B",
    skill: "grammar",
    question: "내일 공부___. (Ngày mai sẽ học.)",
    questionVi: "Chọn cấu trúc tương lai đúng",
    options: ["했어요", "해요", "할 거예요", "하고 싶어요"],
    optionsVi: ["Đã làm", "Làm (hiện tại)", "Sẽ làm", "Muốn làm"],
    correctIndex: 2,
    explanation: "할 거예요 = sẽ làm. Cấu trúc tương lai: động từ gốc + ㄹ/을 거예요.",
  },
  {
    id: "p7",
    targetLevel: "1B",
    skill: "vocabulary",
    question: "\"Cuối tuần\" trong tiếng Hàn là gì?",
    questionVi: "Chọn từ đúng",
    options: ["평일", "주말", "공휴일", "방학"],
    optionsVi: ["Ngày thường", "Cuối tuần", "Ngày lễ", "Kỳ nghỉ"],
    correctIndex: 1,
    explanation: "주말 = cuối tuần. 평일 = ngày thường (thứ 2-6).",
  },
  {
    id: "p8",
    targetLevel: "1B",
    skill: "grammar",
    question: "버스___ 지하철이 더 빨라요. (Tàu điện ngầm nhanh hơn xe buýt.)",
    questionVi: "Điền trợ từ so sánh đúng",
    options: ["이", "가", "보다", "에서"],
    optionsVi: ["chủ ngữ (sau phụ âm)", "chủ ngữ (sau nguyên âm)", "hơn", "ở / từ"],
    correctIndex: 2,
    explanation: "보다 = hơn. Cấu trúc so sánh: A보다 B가 더 ~ = B ... hơn A.",
  },
  // ── 2A Level ──
  {
    id: "p9",
    targetLevel: "2A",
    skill: "grammar",
    question: "한국에 가 본 적이 ___. (Tôi đã từng đến Hàn Quốc.)",
    questionVi: "Chọn cụm từ đúng",
    options: ["있어요", "없어요", "있었어요", "없었어요"],
    optionsVi: ["Có (đã từng)", "Không có (chưa từng)", "Đã có", "Đã không có"],
    correctIndex: 0,
    explanation: "~아/어 본 적이 있어요 = đã từng làm... Đây là cấu trúc diễn đạt kinh nghiệm.",
  },
  {
    id: "p10",
    targetLevel: "2A",
    skill: "grammar",
    question: "도와줄 수 ___? (Bạn có thể giúp tôi không?)",
    questionVi: "Chọn cụm từ đúng để hỏi khả năng",
    options: ["있어요", "있어요?", "없어요?", "있을까요?"],
    optionsVi: ["Có thể (khẳng định)", "Có thể không? (hỏi)", "Không thể không?", "Có thể không nhỉ?"],
    correctIndex: 1,
    explanation: "~아/어 줄 수 있어요? = bạn có thể làm... cho tôi không? Cách nhờ vả lịch sự.",
  },
  {
    id: "p11",
    targetLevel: "2A",
    skill: "vocabulary",
    question: "\"Kinh nghiệm\" trong tiếng Hàn là gì?",
    questionVi: "Chọn từ đúng",
    options: ["경험", "기억", "감정", "생각"],
    optionsVi: ["Kinh nghiệm", "Ký ức", "Cảm xúc", "Suy nghĩ"],
    correctIndex: 0,
    explanation: "경험 = kinh nghiệm. Từ này thường xuất hiện trong cấu trúc ~해 본 적이 있어요.",
  },
  {
    id: "p12",
    targetLevel: "2A",
    skill: "reading",
    question: "\"피곤해서 일찍 잤어요\" có nghĩa là gì?",
    questionVi: "Chọn nghĩa đúng",
    options: ["Vì mệt nên ngủ sớm", "Vì ngủ sớm nên mệt", "Mặc dù mệt nhưng ngủ sớm", "Nếu mệt thì ngủ sớm"],
    optionsVi: ["Nguyên nhân → kết quả", "Kết quả → nguyên nhân", "Tương phản", "Điều kiện"],
    correctIndex: 0,
    explanation: "~아/어서 = vì... nên... Diễn đạt nguyên nhân dẫn đến kết quả.",
  },
  // ── 2B Level ──
  {
    id: "p13",
    targetLevel: "2B",
    skill: "grammar",
    question: "비가 오___ 우산을 가져왔어요. (Vì trời mưa nên mang ô.)",
    questionVi: "Chọn liên từ nguyên nhân đúng",
    options: ["지만", "아서", "거나", "면"],
    optionsVi: ["nhưng", "vì... nên", "hoặc", "nếu"],
    correctIndex: 1,
    explanation: "아서/어서 = vì... nên... Diễn đạt nguyên nhân trực tiếp. 비가 오다 → 비가 와서.",
  },
  {
    id: "p14",
    targetLevel: "2B",
    skill: "grammar",
    question: "\"늦어서 죄송합니다\" — 늦다 ở đây là gì?",
    questionVi: "Phân tích ngữ pháp",
    options: ["Tính từ + 아서", "Động từ + 아서", "Danh từ + 이어서", "Phó từ"],
    optionsVi: ["Tính từ + vì", "Động từ + vì", "Danh từ + vì là", "Phó từ"],
    correctIndex: 0,
    explanation: "늦다 là tính từ (muộn). 늦어서 = vì muộn. Tính từ cũng chia được với ~아/어서.",
  },
  {
    id: "p15",
    targetLevel: "2B",
    skill: "vocabulary",
    question: "\"Lý do\" trong tiếng Hàn là gì?",
    questionVi: "Chọn từ đúng",
    options: ["결과", "이유", "방법", "목적"],
    optionsVi: ["Kết quả", "Lý do", "Phương pháp", "Mục đích"],
    correctIndex: 1,
    explanation: "이유 = lý do. 때문에 = vì (danh từ + 때문에). 이유가 뭐예요? = Lý do là gì?",
  },
  // ── 3A Level ──
  {
    id: "p16",
    targetLevel: "3A",
    skill: "grammar",
    question: "환경 보호가 중요___ 생각해요. (Tôi nghĩ bảo vệ môi trường quan trọng.)",
    questionVi: "Chọn cấu trúc diễn đạt ý kiến đúng",
    options: ["다고", "라고", "이라고", "고"],
    optionsVi: ["(sau tính từ/động từ)", "(sau danh từ/nguyên âm)", "(sau danh từ/phụ âm)", "và"],
    correctIndex: 0,
    explanation: "~다고 생각해요 = tôi nghĩ rằng... Dùng sau tính từ/động từ để diễn đạt ý kiến.",
  },
  {
    id: "p17",
    targetLevel: "3A",
    skill: "grammar",
    question: "도시는 편리한 ___ 공기가 나빠요. (Thành phố tiện lợi nhưng không khí xấu.)",
    questionVi: "Chọn cấu trúc tương phản đúng",
    options: ["그리고", "반면에", "그래서", "때문에"],
    optionsVi: ["và", "trong khi đó / ngược lại", "vì vậy", "vì"],
    correctIndex: 1,
    explanation: "~는 반면에 = trong khi... thì... Diễn đạt sự tương phản giữa hai mệnh đề.",
  },
  {
    id: "p18",
    targetLevel: "3A",
    skill: "reading",
    question: "\"이 문제를 해결해야 한다고 생각합니다\" — câu này diễn đạt điều gì?",
    questionVi: "Chọn nghĩa đúng",
    options: ["Sự kiện đã xảy ra", "Ý kiến cá nhân", "Điều kiện giả định", "Lời mời"],
    optionsVi: ["Sự kiện", "Ý kiến", "Điều kiện", "Lời mời"],
    correctIndex: 1,
    explanation: "~다고 생각합니다 = tôi nghĩ rằng... Đây là cấu trúc diễn đạt ý kiến cá nhân.",
  },
  // ── 3B Level ──
  {
    id: "p19",
    targetLevel: "3B",
    skill: "grammar",
    question: "환경 문제___ 발표하겠습니다. (Tôi sẽ thuyết trình về vấn đề môi trường.)",
    questionVi: "Chọn giới từ đúng",
    options: ["에 대해서", "에서", "에게", "로"],
    optionsVi: ["về (chủ đề)", "ở / từ", "cho (người)", "bằng / đến"],
    correctIndex: 0,
    explanation: "~에 대해서 = về (chủ đề). Dùng trong văn phong trang trọng và học thuật.",
  },
  {
    id: "p20",
    targetLevel: "3B",
    skill: "vocabulary",
    question: "\"Thuyết trình\" trong tiếng Hàn là gì?",
    questionVi: "Chọn từ đúng",
    options: ["회의", "발표", "토론", "강의"],
    optionsVi: ["Cuộc họp", "Thuyết trình", "Tranh luận", "Bài giảng"],
    correctIndex: 1,
    explanation: "발표 = thuyết trình / trình bày. 발표하다 = thuyết trình.",
  },
  {
    id: "p21",
    targetLevel: "3B",
    skill: "reading",
    question: "\"결론을 말씀드리겠습니다\" — câu này dùng trong ngữ cảnh nào?",
    questionVi: "Chọn ngữ cảnh phù hợp",
    options: ["Hội thoại thân mật", "Thuyết trình / Báo cáo", "Nhắn tin", "Mua sắm"],
    optionsVi: ["Thân mật", "Trang trọng / Học thuật", "Tin nhắn", "Mua sắm"],
    correctIndex: 1,
    explanation: "말씀드리겠습니다 là kính ngữ trang trọng nhất. Dùng trong thuyết trình, báo cáo chính thức.",
  },
  // ── 4A Level ──
  {
    id: "p22",
    targetLevel: "4A",
    skill: "grammar",
    question: "읽___ 더 재미있어요. (Càng đọc càng thú vị.)",
    questionVi: "Chọn cấu trúc \"càng... càng\" đúng",
    options: ["을수록", "지만", "아서", "거나"],
    optionsVi: ["càng... càng", "nhưng", "vì... nên", "hoặc"],
    correctIndex: 0,
    explanation: "~(으)ㄹ수록 = càng... càng... Diễn đạt mối quan hệ tỷ lệ thuận.",
  },
  {
    id: "p23",
    targetLevel: "4A",
    skill: "grammar",
    question: "어려움___ 포기하지 않았어요. (Mặc dù khó khăn nhưng không bỏ cuộc.)",
    questionVi: "Chọn cấu trúc tương phản mạnh đúng",
    options: ["에도 불구하고", "때문에", "아서", "지만"],
    optionsVi: ["mặc dù... nhưng", "vì", "vì... nên", "nhưng"],
    correctIndex: 0,
    explanation: "~에도 불구하고 = mặc dù... nhưng... Diễn đạt sự tương phản mạnh, dùng trong văn viết.",
  },
  {
    id: "p24",
    targetLevel: "4A",
    skill: "reading",
    question: "\"한국 문학을 읽을수록 더 깊은 의미가 느껴져요\" — câu này có nghĩa là gì?",
    questionVi: "Chọn nghĩa đúng",
    options: [
      "Văn học Hàn Quốc khó đọc",
      "Càng đọc văn học Hàn Quốc càng cảm nhận được ý nghĩa sâu sắc hơn",
      "Văn học Hàn Quốc không có ý nghĩa",
      "Tôi không thích đọc văn học Hàn Quốc",
    ],
    optionsVi: ["Khó đọc", "Càng đọc càng sâu sắc", "Không có ý nghĩa", "Không thích"],
    correctIndex: 1,
    explanation: "읽을수록 = càng đọc. 더 깊은 의미가 느껴져요 = càng cảm nhận được ý nghĩa sâu sắc hơn.",
  },
  // ── 4B Level ──
  {
    id: "p25",
    targetLevel: "4B",
    skill: "grammar",
    question: "이메일___ 연락하겠습니다. (Tôi sẽ liên lạc qua email.)",
    questionVi: "Chọn cấu trúc \"thông qua\" đúng",
    options: ["을 통해서", "에서", "에게", "로"],
    optionsVi: ["thông qua", "ở / từ", "cho (người)", "bằng"],
    correctIndex: 0,
    explanation: "~을/를 통해서 = thông qua... Dùng trong văn phong kinh doanh và trang trọng.",
  },
  {
    id: "p26",
    targetLevel: "4B",
    skill: "grammar",
    question: "올해 수익이 증가___ 것으로 예상됩니다. (Dự kiến lợi nhuận năm nay sẽ tăng.)",
    questionVi: "Chọn cấu trúc dự đoán trang trọng đúng",
    options: ["할", "하는", "한", "했을"],
    optionsVi: ["sẽ (tương lai)", "đang (hiện tại)", "đã (quá khứ)", "đã có thể"],
    correctIndex: 0,
    explanation: "~(으)ㄹ 것으로 예상됩니다 = dự kiến sẽ... Dùng trong báo cáo kinh doanh trang trọng.",
  },
  {
    id: "p27",
    targetLevel: "4B",
    skill: "vocabulary",
    question: "\"Đàm phán\" trong tiếng Hàn là gì?",
    questionVi: "Chọn từ đúng",
    options: ["계약", "협상", "투자", "전략"],
    optionsVi: ["Hợp đồng", "Đàm phán", "Đầu tư", "Chiến lược"],
    correctIndex: 1,
    explanation: "협상 = đàm phán. 협상하다 = đàm phán. Từ vựng kinh doanh cấp cao.",
  },
  {
    id: "p28",
    targetLevel: "4B",
    skill: "reading",
    question: "\"협상을 통해서 합의에 도달했습니다\" — câu này có nghĩa là gì?",
    questionVi: "Chọn nghĩa đúng",
    options: [
      "Đàm phán thất bại",
      "Đã đạt được thỏa thuận thông qua đàm phán",
      "Cần đàm phán thêm",
      "Từ chối đàm phán",
    ],
    optionsVi: ["Thất bại", "Thành công", "Cần thêm", "Từ chối"],
    correctIndex: 1,
    explanation: "통해서 = thông qua. 합의에 도달했습니다 = đã đạt được thỏa thuận. Văn phong kinh doanh trang trọng.",
  },
];

// ─── Level mapping ────────────────────────────────────────────────────────
const LEVEL_ORDER = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"] as const;
const LEVEL_COLORS: Record<string, string> = {
  "1A": "app-accent-primary", "1B": "#fb923c", "2A": "#34d399", "2B": "#06b6d4",
  "3A": "#a78bfa", "3B": "#ec4899", "4A": "#84cc16", "4B": "#f87171",
};
const LEVEL_CEFR: Record<string, string> = {
  "1A": "A1", "1B": "A1+", "2A": "A2", "2B": "A2+",
  "3A": "B1", "3B": "B1+", "4A": "B2", "4B": "B2+",
};
const LEVEL_DESC: Record<string, string> = {
  "1A": "Người mới bắt đầu hoàn toàn",
  "1B": "Đã biết chào hỏi và giao tiếp cơ bản",
  "2A": "Có thể nói về quá khứ, tương lai và so sánh",
  "2B": "Giao tiếp tự nhiên, diễn đạt nguyên nhân",
  "3A": "Thảo luận chủ đề xã hội, diễn đạt ý kiến",
  "3B": "Thuyết trình, viết văn bản học thuật",
  "4A": "Đọc văn học, phân tích ngôn ngữ",
  "4B": "Tiếng Hàn kinh doanh, chuẩn bị TOPIK cao cấp",
};

function determineLevel(answers: Record<string, number>): typeof LEVEL_ORDER[number] {
  // Count correct by level
  const levelScores: Record<string, { correct: number; total: number }> = {};
  PLACEMENT_QUESTIONS.forEach(q => {
    if (!levelScores[q.targetLevel]) levelScores[q.targetLevel] = { correct: 0, total: 0 };
    levelScores[q.targetLevel].total++;
    if (answers[q.id] === q.correctIndex) levelScores[q.targetLevel].correct++;
  });

  // Find highest level where score >= 50%
  let recommendedLevel: typeof LEVEL_ORDER[number] = "1A";
  for (const level of LEVEL_ORDER) {
    const s = levelScores[level];
    if (s && s.correct / s.total >= 0.5) {
      recommendedLevel = level;
    } else {
      break;
    }
  }
  return recommendedLevel;
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function SeoulPlacementPage() {
  const { addXP } = useXPSystem();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"intro" | "test" | "result">("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQ = PLACEMENT_QUESTIONS[currentIdx];
  const totalQ = PLACEMENT_QUESTIONS.length;
  const progress = Math.round((currentIdx / totalQ) * 100);

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    setAnswers(prev => ({ ...prev, [currentQ.id]: idx }));
  };

  const handleNext = () => {
    if (currentIdx + 1 >= totalQ) {
      // Done
      const correct = PLACEMENT_QUESTIONS.filter(q => answers[q.id] === q.correctIndex).length;
      addXP(correct * 10 + 50, "Hoàn thành kiểm tra trình độ Seoul");
      setPhase("result");
    } else {
      setCurrentIdx(i => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const recommendedLevel = useMemo(() => determineLevel(answers), [answers]);
  const totalCorrect = PLACEMENT_QUESTIONS.filter(q => answers[q.id] === q.correctIndex).length;
  const accuracy = Math.round((totalCorrect / totalQ) * 100);

  // Level scores for result
  const levelScores = useMemo(() => {
    const scores: Record<string, { correct: number; total: number }> = {};
    PLACEMENT_QUESTIONS.forEach(q => {
      if (!scores[q.targetLevel]) scores[q.targetLevel] = { correct: 0, total: 0 };
      scores[q.targetLevel].total++;
      if (answers[q.id] === q.correctIndex) scores[q.targetLevel].correct++;
    });
    return scores;
  }, [answers]);

  const SKILL_ICONS = { vocabulary: "ri-book-2-line", grammar: "ri-code-line", reading: "ri-file-text-line" };
  const SKILL_LABELS = { vocabulary: "Từ vựng", grammar: "Ngữ pháp", reading: "Đọc hiểu" };

  return (
    <DashboardLayout
      title="Kiểm tra trình độ Seoul"
      subtitle="Làm bài test để xác định bạn nên bắt đầu từ cuốn Seoul nào — 1A, 2A hay 3A?"
    >
      {/* Intro */}
      {phase === "intro" && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-app-accent-primary/10">
                <i className="ri-graduation-cap-line text-3xl text-app-accent-primary"></i>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Bài kiểm tra trình độ</h2>
                <p className="text-app-text-secondary text-sm">Giáo trình Seoul 1A → 4B</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { icon: "ri-question-line", label: `${totalQ} câu hỏi`, sub: "Từ dễ đến khó" },
                { icon: "ri-time-line", label: "~15 phút", sub: "Không giới hạn thời gian" },
                { icon: "ri-bar-chart-line", label: "8 cấp độ", sub: "1A đến 4B" },
              ].map(item => (
                <div key={item.label} className="bg-app-surface/50 rounded-xl p-4 text-center">
                  <i className={`${item.icon} text-app-accent-primary text-xl mb-2 block`}></i>
                  <p className="text-white font-semibold text-sm">{item.label}</p>
                  <p className="text-app-text-muted text-xs mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>

            <div className="bg-app-surface/50 rounded-xl p-4 mb-6">
              <p className="text-white/60 text-sm font-medium mb-3">Bài test bao gồm:</p>
              <div className="space-y-2">
                {[
                  { icon: "ri-book-2-line", text: "Từ vựng — nhận biết và hiểu nghĩa từ" },
                  { icon: "ri-code-line", text: "Ngữ pháp — điền từ và chọn cấu trúc đúng" },
                  { icon: "ri-file-text-line", text: "Đọc hiểu — phân tích câu và đoạn văn" },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2">
                    <i className={`${item.icon} text-app-accent-primary text-sm`}></i>
                    <p className="text-white/50 text-sm">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4 mb-6">
              <p className="text-app-accent-primary text-xs font-semibold mb-1">Lưu ý</p>
              <p className="text-app-text-secondary text-xs leading-relaxed">
                Hãy trả lời thật thành thật — không cần đoán mò. Nếu không biết, chọn "Không biết" hoặc bỏ qua. Kết quả sẽ giúp bạn bắt đầu đúng cấp độ, tránh học lại những gì đã biết hoặc bỏ qua kiến thức quan trọng.
              </p>
            </div>

            <button
              onClick={() => setPhase("test")}
              className="w-full py-4 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-base transition-colors cursor-pointer whitespace-nowrap"
            >
              Bắt đầu kiểm tra
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          </div>

          {/* Level preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {LEVEL_ORDER.map(level => (
              <div key={level} className="bg-app-bg border border-app-border rounded-xl p-3 text-center">
                <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${LEVEL_COLORS[level]}15` }}>
                  <span className="text-xs font-bold" style={{ color: LEVEL_COLORS[level] }}>{level}</span>
                </div>
                <p className="text-app-text-muted text-[10px]">{LEVEL_CEFR[level]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test */}
      {phase === "test" && (
        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-app-text-secondary text-xs">Câu {currentIdx + 1} / {totalQ}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full`} style={{ backgroundColor: `${LEVEL_COLORS[currentQ.targetLevel]}15`, color: LEVEL_COLORS[currentQ.targetLevel] }}>
                  {currentQ.targetLevel} — {LEVEL_CEFR[currentQ.targetLevel]}
                </span>
                <span className="text-[10px] text-app-text-muted bg-app-card/50 px-2 py-0.5 rounded-full">
                  <i className={`${SKILL_ICONS[currentQ.skill]} mr-1`}></i>{SKILL_LABELS[currentQ.skill]}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-app-accent-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Question card */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-6 mb-4">
            <p className="text-white font-semibold text-base mb-1">{currentQ.question}</p>
            <p className="text-app-text-secondary text-sm italic mb-6">{currentQ.questionVi}</p>

            <div className="space-y-2">
              {currentQ.options.map((opt, i) => {
                let cls = "border-app-border bg-app-surface/50 hover:border-white/15 hover:bg-app-card/50 cursor-pointer";
                if (selectedAnswer !== null) {
                  if (i === currentQ.correctIndex) cls = "border-emerald-500/40 bg-emerald-500/8 cursor-default";
                  else if (i === selectedAnswer) cls = "border-red-500/40 bg-red-500/8 cursor-default";
                  else cls = "border-app-border opacity-30 cursor-default";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={selectedAnswer !== null}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${cls}`}
                  >
                    <span className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold flex-shrink-0 ${selectedAnswer !== null && i === currentQ.correctIndex ? "bg-emerald-500/20 text-app-accent-success" : selectedAnswer !== null && i === selectedAnswer ? "bg-red-500/20 text-red-400" : "bg-app-card/50 text-app-text-muted"}`}>
                      {["A","B","C","D"][i]}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${selectedAnswer !== null && i === currentQ.correctIndex ? "text-app-accent-success" : selectedAnswer !== null && i === selectedAnswer ? "text-red-400" : "text-white/70"}`}>{opt}</p>
                      <p className="text-app-text-muted text-xs">{currentQ.optionsVi[i]}</p>
                    </div>
                    {selectedAnswer !== null && i === currentQ.correctIndex && <i className="ri-checkbox-circle-fill text-app-accent-success"></i>}
                    {selectedAnswer !== null && i === selectedAnswer && i !== currentQ.correctIndex && <i className="ri-close-circle-fill text-red-400"></i>}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className={`mt-4 p-3 rounded-xl border text-xs leading-relaxed ${selectedAnswer === currentQ.correctIndex ? "border-emerald-500/20 bg-emerald-500/5 text-app-accent-success/80" : "border-orange-500/20 bg-orange-500/5 text-orange-400/80"}`}>
                <div className="flex items-start gap-2">
                  <i className="ri-lightbulb-line text-sm flex-shrink-0 mt-0.5"></i>
                  <p>{currentQ.explanation}</p>
                </div>
              </div>
            )}
          </div>

          {selectedAnswer !== null && (
            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              {currentIdx + 1 >= totalQ ? "Xem kết quả" : "Câu tiếp theo"}
              <i className="ri-arrow-right-line ml-2"></i>
            </button>
          )}
        </div>
      )}

      {/* Result */}
      {phase === "result" && (
        <div className="max-w-3xl mx-auto">
          {/* Main result */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 mb-6 text-center">
            <div className="w-20 h-20 flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: `${LEVEL_COLORS[recommendedLevel]}15` }}>
              <span className="text-2xl font-bold" style={{ color: LEVEL_COLORS[recommendedLevel] }}>{recommendedLevel}</span>
            </div>
            <h2 className="text-white font-bold text-2xl mb-2">Trình độ của bạn: Seoul {recommendedLevel}</h2>
            <p className="text-app-text-secondary text-sm mb-1">{LEVEL_CEFR[recommendedLevel]} — {LEVEL_DESC[recommendedLevel]}</p>
            <p className="text-app-text-muted text-xs mb-6">Đúng {totalCorrect}/{totalQ} câu ({accuracy}%)</p>

            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-3">
                <p className="text-app-accent-success font-bold text-xl">{totalCorrect}</p>
                <p className="text-app-text-muted text-xs">Câu đúng</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3">
                <p className="text-red-400 font-bold text-xl">{totalQ - totalCorrect}</p>
                <p className="text-app-text-muted text-xs">Câu sai</p>
              </div>
              <div className="bg-app-accent-primary/10 border border-app-accent-primary/20 rounded-xl px-5 py-3">
                <p className="text-app-accent-primary font-bold text-xl">+{totalCorrect * 10 + 50}</p>
                <p className="text-app-text-muted text-xs">XP nhận được</p>
              </div>
            </div>

            <div className="bg-app-surface/50 rounded-xl p-4 text-left mb-6">
              <p className="text-white/60 text-sm font-medium mb-2">Gợi ý học tập</p>
              <p className="text-app-text-secondary text-sm leading-relaxed">
                Bạn nên bắt đầu từ <span className="font-bold" style={{ color: LEVEL_COLORS[recommendedLevel] }}>Seoul {recommendedLevel}</span>. 
                {recommendedLevel !== "1A" && ` Bạn đã nắm vững kiến thức đến cấp ${LEVEL_ORDER[LEVEL_ORDER.indexOf(recommendedLevel) - 1]}.`}
                {" "}Hãy học đều đặn mỗi ngày và ôn lại từ vựng bằng Flashcard Seoul.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/seoul-textbook")}
                className="flex-1 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-book-open-line mr-2"></i>Học Seoul {recommendedLevel} ngay
              </button>
              <button
                onClick={() => { setPhase("intro"); setCurrentIdx(0); setAnswers({}); setSelectedAnswer(null); setShowExplanation(false); }}
                className="px-5 py-3 rounded-xl border border-app-border text-white/50 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Làm lại
              </button>
            </div>
          </div>

          {/* Level breakdown */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-6">
            <h3 className="text-white font-semibold text-sm mb-4">Kết quả theo cấp độ</h3>
            <div className="space-y-3">
              {LEVEL_ORDER.map(level => {
                const s = levelScores[level] ?? { correct: 0, total: 0 };
                const pct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
                const isRecommended = level === recommendedLevel;
                return (
                  <div key={level} className={`flex items-center gap-4 p-3 rounded-xl ${isRecommended ? "bg-app-surface/50 border border-app-border" : ""}`}>
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${LEVEL_COLORS[level]}15` }}>
                      <span className="text-xs font-bold" style={{ color: LEVEL_COLORS[level] }}>{level}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white/60 text-xs">{LEVEL_CEFR[level]}</span>
                          {isRecommended && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-app-accent-primary/15 text-app-accent-primary">Đề xuất</span>}
                        </div>
                        <span className="text-xs font-bold" style={{ color: LEVEL_COLORS[level] }}>{s.correct}/{s.total} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: LEVEL_COLORS[level] }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}



