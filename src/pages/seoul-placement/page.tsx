import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useXPSystem } from "@/hooks/useXPSystem";
import { useNavigate } from "react-router-dom";

// --- Types ----------------------------------------------------------------
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

// --- Questions (t? d? d?n khó, bao ph? 1A ? 4B) --------------------------
const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // -- 1A Level --
  {
    id: "p1",
    targetLevel: "1A",
    skill: "vocabulary",
    question: "\"Xin chào\" trong ti?ng Hàn là gì?",
    questionVi: "Ch?n cách nói xin chào l?ch s?",
    options: ["?????", "?????", "?????", "? ??"],
    optionsVi: ["C?m on", "Xin chào", "Xin l?i", "Ng? ngon"],
    correctIndex: 1,
    explanation: "????? = Xin chào (l?ch s?). Ðây là cách chào co b?n nh?t trong ti?ng Hàn.",
  },
  {
    id: "p2",
    targetLevel: "1A",
    skill: "grammar",
    question: "?? ??___. (Tôi là h?c sinh.)",
    questionVi: "Ði?n t? dúng vào ch? tr?ng",
    options: ["???", "??", "?", "?"],
    optionsVi: ["là (sau ph? âm)", "? / t?", "tân ng?", "ch? ng?"],
    correctIndex: 0,
    explanation: "??? dùng sau ph? âm d? di?n d?t \"là\". ?? k?t thúc b?ng ph? âm ? nên dùng ???.",
  },
  {
    id: "p3",
    targetLevel: "1A",
    skill: "vocabulary",
    question: "\"Sách\" trong ti?ng Hàn là gì?",
    questionVi: "Ch?n t? dúng",
    options: ["??", "?", "??", "??"],
    optionsVi: ["Túi", "Sách", "Bút chì", "V?"],
    correctIndex: 1,
    explanation: "? = sách. Ðây là t? v?ng co b?n trong bài h?c d?u tiên.",
  },
  {
    id: "p4",
    targetLevel: "1A",
    skill: "grammar",
    question: "?? ? ?___? (Bây gi? m?y gi??)",
    questionVi: "Ði?n tr? t? dúng",
    options: ["???", "??", "???", "??"],
    optionsVi: ["là (sau ph? âm)", "là (sau nguyên âm)", "có", "di"],
    correctIndex: 1,
    explanation: "? k?t thúc b?ng nguyên âm ? nên dùng ??. Câu h?i v? gi?: ? ????",
  },
  // -- 1B Level --
  {
    id: "p5",
    targetLevel: "1B",
    skill: "grammar",
    question: "?? ??? ??? ___. (Cu?i tu?n tru?c dã xem phim.)",
    questionVi: "Chia d?ng t? ?? thì quá kh?",
    options: ["??", "???", "? ???", "?? ???"],
    optionsVi: ["Xem (hi?n t?i)", "Ðã xem (quá kh?)", "S? xem (tuong lai)", "Mu?n xem"],
    correctIndex: 1,
    explanation: "??? là thì quá kh? c?a ??. ?? ? ?? (hi?n t?i) ? ??? (quá kh?).",
  },
  {
    id: "p6",
    targetLevel: "1B",
    skill: "grammar",
    question: "?? ??___. (Ngày mai s? h?c.)",
    questionVi: "Ch?n c?u trúc tuong lai dúng",
    options: ["???", "??", "? ???", "?? ???"],
    optionsVi: ["Ðã làm", "Làm (hi?n t?i)", "S? làm", "Mu?n làm"],
    correctIndex: 2,
    explanation: "? ??? = s? làm. C?u trúc tuong lai: d?ng t? g?c + ?/? ???.",
  },
  {
    id: "p7",
    targetLevel: "1B",
    skill: "vocabulary",
    question: "\"Cu?i tu?n\" trong ti?ng Hàn là gì?",
    questionVi: "Ch?n t? dúng",
    options: ["??", "??", "???", "??"],
    optionsVi: ["Ngày thu?ng", "Cu?i tu?n", "Ngày l?", "K? ngh?"],
    correctIndex: 1,
    explanation: "?? = cu?i tu?n. ?? = ngày thu?ng (th? 2-6).",
  },
  {
    id: "p8",
    targetLevel: "1B",
    skill: "grammar",
    question: "??___ ???? ? ???. (Tàu di?n ng?m nhanh hon xe buýt.)",
    questionVi: "Ði?n tr? t? so sánh dúng",
    options: ["?", "?", "??", "??"],
    optionsVi: ["ch? ng? (sau ph? âm)", "ch? ng? (sau nguyên âm)", "hon", "? / t?"],
    correctIndex: 2,
    explanation: "?? = hon. C?u trúc so sánh: A?? B? ? ~ = B ... hon A.",
  },
  // -- 2A Level --
  {
    id: "p9",
    targetLevel: "2A",
    skill: "grammar",
    question: "??? ? ? ?? ___. (Tôi dã t?ng d?n Hàn Qu?c.)",
    questionVi: "Ch?n c?m t? dúng",
    options: ["???", "???", "????", "????"],
    optionsVi: ["Có (dã t?ng)", "Không có (chua t?ng)", "Ðã có", "Ðã không có"],
    correctIndex: 0,
    explanation: "~?/? ? ?? ??? = dã t?ng làm... Ðây là c?u trúc di?n d?t kinh nghi?m.",
  },
  {
    id: "p10",
    targetLevel: "2A",
    skill: "grammar",
    question: "??? ? ___? (B?n có th? giúp tôi không?)",
    questionVi: "Ch?n c?m t? dúng d? h?i kh? nang",
    options: ["???", "????", "????", "?????"],
    optionsVi: ["Có th? (kh?ng d?nh)", "Có th? không? (h?i)", "Không th? không?", "Có th? không nh??"],
    correctIndex: 1,
    explanation: "~?/? ? ? ???? = b?n có th? làm... cho tôi không? Cách nh? v? l?ch s?.",
  },
  {
    id: "p11",
    targetLevel: "2A",
    skill: "vocabulary",
    question: "\"Kinh nghi?m\" trong ti?ng Hàn là gì?",
    questionVi: "Ch?n t? dúng",
    options: ["??", "??", "??", "??"],
    optionsVi: ["Kinh nghi?m", "Ký ?c", "C?m xúc", "Suy nghi"],
    correctIndex: 0,
    explanation: "?? = kinh nghi?m. T? này thu?ng xu?t hi?n trong c?u trúc ~? ? ?? ???.",
  },
  {
    id: "p12",
    targetLevel: "2A",
    skill: "reading",
    question: "\"???? ?? ???\" có nghia là gì?",
    questionVi: "Ch?n nghia dúng",
    options: ["Vì m?t nên ng? s?m", "Vì ng? s?m nên m?t", "M?c dù m?t nhung ng? s?m", "N?u m?t thì ng? s?m"],
    optionsVi: ["Nguyên nhân ? k?t qu?", "K?t qu? ? nguyên nhân", "Tuong ph?n", "Ði?u ki?n"],
    correctIndex: 0,
    explanation: "~?/?? = vì... nên... Di?n d?t nguyên nhân d?n d?n k?t qu?.",
  },
  // -- 2B Level --
  {
    id: "p13",
    targetLevel: "2B",
    skill: "grammar",
    question: "?? ?___ ??? ?????. (Vì tr?i mua nên mang ô.)",
    questionVi: "Ch?n liên t? nguyên nhân dúng",
    options: ["??", "??", "??", "?"],
    optionsVi: ["nhung", "vì... nên", "ho?c", "n?u"],
    correctIndex: 1,
    explanation: "??/?? = vì... nên... Di?n d?t nguyên nhân tr?c ti?p. ?? ?? ? ?? ??.",
  },
  {
    id: "p14",
    targetLevel: "2B",
    skill: "grammar",
    question: "\"??? ?????\" — ?? ? dây là gì?",
    questionVi: "Phân tích ng? pháp",
    options: ["Tính t? + ??", "Ð?ng t? + ??", "Danh t? + ???", "Phó t?"],
    optionsVi: ["Tính t? + vì", "Ð?ng t? + vì", "Danh t? + vì là", "Phó t?"],
    correctIndex: 0,
    explanation: "?? là tính t? (mu?n). ??? = vì mu?n. Tính t? cung chia du?c v?i ~?/??.",
  },
  {
    id: "p15",
    targetLevel: "2B",
    skill: "vocabulary",
    question: "\"Lý do\" trong ti?ng Hàn là gì?",
    questionVi: "Ch?n t? dúng",
    options: ["??", "??", "??", "??"],
    optionsVi: ["K?t qu?", "Lý do", "Phuong pháp", "M?c dích"],
    correctIndex: 1,
    explanation: "?? = lý do. ??? = vì (danh t? + ???). ??? ???? = Lý do là gì?",
  },
  // -- 3A Level --
  {
    id: "p16",
    targetLevel: "3A",
    skill: "grammar",
    question: "?? ??? ??___ ????. (Tôi nghi b?o v? môi tru?ng quan tr?ng.)",
    questionVi: "Ch?n c?u trúc di?n d?t ý ki?n dúng",
    options: ["??", "??", "???", "?"],
    optionsVi: ["(sau tính t?/d?ng t?)", "(sau danh t?/nguyên âm)", "(sau danh t?/ph? âm)", "và"],
    correctIndex: 0,
    explanation: "~?? ???? = tôi nghi r?ng... Dùng sau tính t?/d?ng t? d? di?n d?t ý ki?n.",
  },
  {
    id: "p17",
    targetLevel: "3A",
    skill: "grammar",
    question: "??? ??? ___ ??? ???. (Thành ph? ti?n l?i nhung không khí x?u.)",
    questionVi: "Ch?n c?u trúc tuong ph?n dúng",
    options: ["???", "???", "???", "???"],
    optionsVi: ["và", "trong khi dó / ngu?c l?i", "vì v?y", "vì"],
    correctIndex: 1,
    explanation: "~? ??? = trong khi... thì... Di?n d?t s? tuong ph?n gi?a hai m?nh d?.",
  },
  {
    id: "p18",
    targetLevel: "3A",
    skill: "reading",
    question: "\"? ??? ???? ??? ?????\" — câu này di?n d?t di?u gì?",
    questionVi: "Ch?n nghia dúng",
    options: ["S? ki?n dã x?y ra", "Ý ki?n cá nhân", "Ði?u ki?n gi? d?nh", "L?i m?i"],
    optionsVi: ["S? ki?n", "Ý ki?n", "Ði?u ki?n", "L?i m?i"],
    correctIndex: 1,
    explanation: "~?? ????? = tôi nghi r?ng... Ðây là c?u trúc di?n d?t ý ki?n cá nhân.",
  },
  // -- 3B Level --
  {
    id: "p19",
    targetLevel: "3B",
    skill: "grammar",
    question: "?? ??___ ???????. (Tôi s? thuy?t trình v? v?n d? môi tru?ng.)",
    questionVi: "Ch?n gi?i t? dúng",
    options: ["? ???", "??", "??", "?"],
    optionsVi: ["v? (ch? d?)", "? / t?", "cho (ngu?i)", "b?ng / d?n"],
    correctIndex: 0,
    explanation: "~? ??? = v? (ch? d?). Dùng trong van phong trang tr?ng và h?c thu?t.",
  },
  {
    id: "p20",
    targetLevel: "3B",
    skill: "vocabulary",
    question: "\"Thuy?t trình\" trong ti?ng Hàn là gì?",
    questionVi: "Ch?n t? dúng",
    options: ["??", "??", "??", "??"],
    optionsVi: ["Cu?c h?p", "Thuy?t trình", "Tranh lu?n", "Bài gi?ng"],
    correctIndex: 1,
    explanation: "?? = thuy?t trình / trình bày. ???? = thuy?t trình.",
  },
  {
    id: "p21",
    targetLevel: "3B",
    skill: "reading",
    question: "\"??? ????????\" — câu này dùng trong ng? c?nh nào?",
    questionVi: "Ch?n ng? c?nh phù h?p",
    options: ["H?i tho?i thân m?t", "Thuy?t trình / Báo cáo", "Nh?n tin", "Mua s?m"],
    optionsVi: ["Thân m?t", "Trang tr?ng / H?c thu?t", "Tin nh?n", "Mua s?m"],
    correctIndex: 1,
    explanation: "???????? là kính ng? trang tr?ng nh?t. Dùng trong thuy?t trình, báo cáo chính th?c.",
  },
  // -- 4A Level --
  {
    id: "p22",
    targetLevel: "4A",
    skill: "grammar",
    question: "?___ ? ?????. (Càng d?c càng thú v?.)",
    questionVi: "Ch?n c?u trúc \"càng... càng\" dúng",
    options: ["???", "??", "??", "??"],
    optionsVi: ["càng... càng", "nhung", "vì... nên", "ho?c"],
    correctIndex: 0,
    explanation: "~(?)??? = càng... càng... Di?n d?t m?i quan h? t? l? thu?n.",
  },
  {
    id: "p23",
    targetLevel: "4A",
    skill: "grammar",
    question: "???___ ???? ????. (M?c dù khó khan nhung không b? cu?c.)",
    questionVi: "Ch?n c?u trúc tuong ph?n m?nh dúng",
    options: ["?? ????", "???", "??", "??"],
    optionsVi: ["m?c dù... nhung", "vì", "vì... nên", "nhung"],
    correctIndex: 0,
    explanation: "~?? ???? = m?c dù... nhung... Di?n d?t s? tuong ph?n m?nh, dùng trong van vi?t.",
  },
  {
    id: "p24",
    targetLevel: "4A",
    skill: "reading",
    question: "\"?? ??? ???? ? ?? ??? ????\" — câu này có nghia là gì?",
    questionVi: "Ch?n nghia dúng",
    options: [
      "Van h?c Hàn Qu?c khó d?c",
      "Càng d?c van h?c Hàn Qu?c càng c?m nh?n du?c ý nghia sâu s?c hon",
      "Van h?c Hàn Qu?c không có ý nghia",
      "Tôi không thích d?c van h?c Hàn Qu?c",
    ],
    optionsVi: ["Khó d?c", "Càng d?c càng sâu s?c", "Không có ý nghia", "Không thích"],
    correctIndex: 1,
    explanation: "???? = càng d?c. ? ?? ??? ???? = càng c?m nh?n du?c ý nghia sâu s?c hon.",
  },
  // -- 4B Level --
  {
    id: "p25",
    targetLevel: "4B",
    skill: "grammar",
    question: "???___ ???????. (Tôi s? liên l?c qua email.)",
    questionVi: "Ch?n c?u trúc \"thông qua\" dúng",
    options: ["? ???", "??", "??", "?"],
    optionsVi: ["thông qua", "? / t?", "cho (ngu?i)", "b?ng"],
    correctIndex: 0,
    explanation: "~?/? ??? = thông qua... Dùng trong van phong kinh doanh và trang tr?ng.",
  },
  {
    id: "p26",
    targetLevel: "4B",
    skill: "grammar",
    question: "?? ??? ??___ ??? ?????. (D? ki?n l?i nhu?n nam nay s? tang.)",
    questionVi: "Ch?n c?u trúc d? doán trang tr?ng dúng",
    options: ["?", "??", "?", "??"],
    optionsVi: ["s? (tuong lai)", "dang (hi?n t?i)", "dã (quá kh?)", "dã có th?"],
    correctIndex: 0,
    explanation: "~(?)? ??? ????? = d? ki?n s?... Dùng trong báo cáo kinh doanh trang tr?ng.",
  },
  {
    id: "p27",
    targetLevel: "4B",
    skill: "vocabulary",
    question: "\"Ðàm phán\" trong ti?ng Hàn là gì?",
    questionVi: "Ch?n t? dúng",
    options: ["??", "??", "??", "??"],
    optionsVi: ["H?p d?ng", "Ðàm phán", "Ð?u tu", "Chi?n lu?c"],
    correctIndex: 1,
    explanation: "?? = dàm phán. ???? = dàm phán. T? v?ng kinh doanh c?p cao.",
  },
  {
    id: "p28",
    targetLevel: "4B",
    skill: "reading",
    question: "\"??? ??? ??? ??????\" — câu này có nghia là gì?",
    questionVi: "Ch?n nghia dúng",
    options: [
      "Ðàm phán th?t b?i",
      "Ðã d?t du?c th?a thu?n thông qua dàm phán",
      "C?n dàm phán thêm",
      "T? ch?i dàm phán",
    ],
    optionsVi: ["Th?t b?i", "Thành công", "C?n thêm", "T? ch?i"],
    correctIndex: 1,
    explanation: "??? = thông qua. ??? ?????? = dã d?t du?c th?a thu?n. Van phong kinh doanh trang tr?ng.",
  },
];

// --- Level mapping --------------------------------------------------------
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
  "1A": "Ngu?i m?i b?t d?u hoàn toàn",
  "1B": "Ðã bi?t chào h?i và giao ti?p co b?n",
  "2A": "Có th? nói v? quá kh?, tuong lai và so sánh",
  "2B": "Giao ti?p t? nhiên, di?n d?t nguyên nhân",
  "3A": "Th?o lu?n ch? d? xã h?i, di?n d?t ý ki?n",
  "3B": "Thuy?t trình, vi?t van b?n h?c thu?t",
  "4A": "Ð?c van h?c, phân tích ngôn ng?",
  "4B": "Ti?ng Hàn kinh doanh, chu?n b? TOPIK cao c?p",
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

// --- Main Page ------------------------------------------------------------
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
      addXP(correct * 10 + 50, "Hoàn thành ki?m tra trình d? Seoul");
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
  const SKILL_LABELS = { vocabulary: "T? v?ng", grammar: "Ng? pháp", reading: "Ð?c hi?u" };

  return (
    <DashboardLayout
      title="Ki?m tra trình d? Seoul"
      subtitle="Làm bài test d? xác d?nh b?n nên b?t d?u t? cu?n Seoul nào — 1A, 2A hay 3A?"
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
                <h2 className="text-white font-bold text-lg">Bài ki?m tra trình d?</h2>
                <p className="text-app-text-secondary text-sm">Giáo trình Seoul 1A ? 4B</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { icon: "ri-question-line", label: `${totalQ} câu h?i`, sub: "T? d? d?n khó" },
                { icon: "ri-time-line", label: "~15 phút", sub: "Không gi?i h?n th?i gian" },
                { icon: "ri-bar-chart-line", label: "8 c?p d?", sub: "1A d?n 4B" },
              ].map(item => (
                <div key={item.label} className="bg-app-surface/50 rounded-xl p-4 text-center">
                  <i className={`${item.icon} text-app-accent-primary text-xl mb-2 block`}></i>
                  <p className="text-white font-semibold text-sm">{item.label}</p>
                  <p className="text-app-text-muted text-xs mt-0.5">{item.sub}</p>
                </div>
              ))}
            </div>

            <div className="bg-app-surface/50 rounded-xl p-4 mb-6">
              <p className="text-white/60 text-sm font-medium mb-3">Bài test bao g?m:</p>
              <div className="space-y-2">
                {[
                  { icon: "ri-book-2-line", text: "T? v?ng — nh?n bi?t và hi?u nghia t?" },
                  { icon: "ri-code-line", text: "Ng? pháp — di?n t? và ch?n c?u trúc dúng" },
                  { icon: "ri-file-text-line", text: "Ð?c hi?u — phân tích câu và do?n van" },
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-2">
                    <i className={`${item.icon} text-app-accent-primary text-sm`}></i>
                    <p className="text-white/50 text-sm">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4 mb-6">
              <p className="text-app-accent-primary text-xs font-semibold mb-1">Luu ý</p>
              <p className="text-app-text-secondary text-xs leading-relaxed">
                Hãy tr? l?i th?t thành th?t — không c?n doán mò. N?u không bi?t, ch?n "Không bi?t" ho?c b? qua. K?t qu? s? giúp b?n b?t d?u dúng c?p d?, tránh h?c l?i nh?ng gì dã bi?t ho?c b? qua ki?n th?c quan tr?ng.
              </p>
            </div>

            <button
              onClick={() => setPhase("test")}
              className="w-full py-4 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-base transition-colors cursor-pointer whitespace-nowrap"
            >
              B?t d?u ki?m tra
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
              {currentIdx + 1 >= totalQ ? "Xem k?t qu?" : "Câu ti?p theo"}
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
            <h2 className="text-white font-bold text-2xl mb-2">Trình d? c?a b?n: Seoul {recommendedLevel}</h2>
            <p className="text-app-text-secondary text-sm mb-1">{LEVEL_CEFR[recommendedLevel]} — {LEVEL_DESC[recommendedLevel]}</p>
            <p className="text-app-text-muted text-xs mb-6">Ðúng {totalCorrect}/{totalQ} câu ({accuracy}%)</p>

            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-3">
                <p className="text-app-accent-success font-bold text-xl">{totalCorrect}</p>
                <p className="text-app-text-muted text-xs">Câu dúng</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3">
                <p className="text-red-400 font-bold text-xl">{totalQ - totalCorrect}</p>
                <p className="text-app-text-muted text-xs">Câu sai</p>
              </div>
              <div className="bg-app-accent-primary/10 border border-app-accent-primary/20 rounded-xl px-5 py-3">
                <p className="text-app-accent-primary font-bold text-xl">+{totalCorrect * 10 + 50}</p>
                <p className="text-app-text-muted text-xs">XP nh?n du?c</p>
              </div>
            </div>

            <div className="bg-app-surface/50 rounded-xl p-4 text-left mb-6">
              <p className="text-white/60 text-sm font-medium mb-2">G?i ý h?c t?p</p>
              <p className="text-app-text-secondary text-sm leading-relaxed">
                B?n nên b?t d?u t? <span className="font-bold" style={{ color: LEVEL_COLORS[recommendedLevel] }}>Seoul {recommendedLevel}</span>. 
                {recommendedLevel !== "1A" && ` B?n dã n?m v?ng ki?n th?c d?n c?p ${LEVEL_ORDER[LEVEL_ORDER.indexOf(recommendedLevel) - 1]}.`}
                {" "}Hãy h?c d?u d?n m?i ngày và ôn l?i t? v?ng b?ng Flashcard Seoul.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/seoul-textbook")}
                className="flex-1 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-book-open-line mr-2"></i>H?c Seoul {recommendedLevel} ngay
              </button>
              <button
                onClick={() => { setPhase("intro"); setCurrentIdx(0); setAnswers({}); setSelectedAnswer(null); setShowExplanation(false); }}
                className="px-5 py-3 rounded-xl border border-app-border text-white/50 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Làm l?i
              </button>
            </div>
          </div>

          {/* Level breakdown */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-6">
            <h3 className="text-white font-semibold text-sm mb-4">K?t qu? theo c?p d?</h3>
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
                          {isRecommended && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-app-accent-primary/15 text-app-accent-primary">Ð? xu?t</span>}
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



