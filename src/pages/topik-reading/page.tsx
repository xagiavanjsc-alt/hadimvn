import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import ShareResultModal from "@/components/feature/ShareResultModal";

interface ReadingQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

interface ReadingPassage {
  id: string;
  title: string;
  korean: string;
  vietnamese: string;
  level: "A1" | "A2" | "B1" | "B2";
  topic: string;
  questions: ReadingQuestion[];
  wordCount: number;
}

const LEVELS = [
  { id: "A1", label: "A1 - So c?p 1", color: "#34d399", desc: "Van b?n don gi?n, câu ng?n" },
  { id: "A2", label: "A2 - So c?p 2", color: "#38bdf8", desc: "Thông báo, tin nh?n ng?n" },
  { id: "B1", label: "B1 - Trung c?p 1", color: "#fb923c", desc: "Bài vi?t v? ch? d? quen thu?c" },
  { id: "B2", label: "B2 - Trung c?p 2", color: "#f87171", desc: "Van b?n ph?c t?p, tr?u tu?ng" },
];

const TOPICS = [
  "T?t c?", "Gia dình", "Công vi?c", "Du l?ch", "?m th?c", "S?c kh?e",
  "Giáo d?c", "Xã h?i", "Van hóa", "Môi tru?ng", "Công ngh?",
];

const PASSAGES: ReadingPassage[] = [
  {
    id: "p1",
    title: "Gi?i thi?u b?n thân",
    korean: `?????. ?? ?????. ?? ?????. ?? ??? ???. ?? ???? ????. ???? ?????. ?? ?? ???? ????. ?? ?? ??? ????. ?? ????? ????. ?? K-pop? ????.`,
    vietnamese: `Xin chào. Tôi là Minjun. Tôi là h?c sinh. Tôi s?ng ? Seoul. Tôi h?c ti?ng Hàn. Ti?ng Hàn r?t thú v?. Tôi h?c ti?ng Hàn m?i ngày. Tôi thích d? an Hàn Qu?c. Ð?c bi?t tôi thích kimchi jjigae. Tôi cung thích K-pop.`,
    level: "A1",
    topic: "Gia dình",
    wordCount: 52,
    questions: [
      {
        id: "q1",
        question: "???? ??? ???? (Minjun s?ng ? dâu?)",
        options: ["??", "??", "??", "??"],
        answer: 1,
        explanation: "???? '?? ??? ???' — Tôi s?ng ? Seoul.",
      },
      {
        id: "q2",
        question: "???? ?? ???? ??? ?????? (Món an Minjun d?c bi?t thích là gì?)",
        options: ["???", "???", "????", "???"],
        answer: 2,
        explanation: "'?? ????? ????' — Ð?c bi?t thích kimchi jjigae.",
      },
      {
        id: "q3",
        question: "???? ??? ????? (Minjun h?c gì?)",
        options: ["??", "???", "???", "???"],
        answer: 3,
        explanation: "'?? ???? ????' — Tôi h?c ti?ng Hàn.",
      },
    ],
  },
  {
    id: "p2",
    title: "?? ?? (K? ho?ch cu?i tu?n)",
    korean: `?? ??? ???? ?? ?? ??? ? ???. ??? ???? ? ???. ??? ??? ??? ?? ???. ??? ??? ????. ?? ?? ???? ? ???. ?? ???? ??? ???. ??? ?? ??? ????.`,
    vietnamese: `Cu?i tu?n này tôi s? di công viên Hangang cùng b?n bè. Chúng tôi s? d?p xe. Và s? an gà và u?ng bia. Mong tr?i d?p. N?u tr?i mua s? di r?p chi?u phim. D?o này có nhi?u phim hay. Mong cu?i tu?n d?n nhanh.`,
    level: "A2",
    topic: "Du l?ch",
    wordCount: 68,
    questions: [
      {
        id: "q1",
        question: "?? ??? ??? ? ???? (Cu?i tu?n này s? di dâu?)",
        options: ["?", "??", "?? ??", "????"],
        answer: 2,
        explanation: "'?? ??? ? ???' — S? di công viên Hangang.",
      },
      {
        id: "q2",
        question: "?? ?? ??? ? ???? (N?u tr?i mua s? di dâu?)",
        options: ["??", "???", "???", "?"],
        answer: 1,
        explanation: "'?? ?? ???? ? ???' — N?u mua s? di r?p chi?u phim.",
      },
      {
        id: "q3",
        question: "?? ???? ??? ? ???? (S? làm gì ? công viên Hangang?)",
        options: ["??", "??? ??", "??", "??"],
        answer: 1,
        explanation: "'???? ? ???' — S? d?p xe.",
      },
    ],
  },
  {
    id: "p3",
    title: "??? ?? ?? (Van hóa ?m th?c Hàn Qu?c)",
    korean: `?? ??? ????? ???????. ?? ??, ???, ???? ??????? ??? ????. ?? ??? ??? ?? ??? ??? ????. ??? ??? ??? ??? ??? ?? ?????. ?? ???? ??? ? ?? ?? ??? ?? ????. ??? '????'??? ???. ???? ?? ??? ??? ??? ?? ??? ?? ??? ????.`,
    vietnamese: `?m th?c Hàn Qu?c dã n?i ti?ng trên toàn th? gi?i. Ð?c bi?t kimchi, bulgogi, bibimbap r?t du?c ngu?i nu?c ngoài yêu thích. Ð?c di?m c?a ?m th?c Hàn Qu?c là có nhi?u th?c ph?m lên men. Kimchi là th?c ph?m lên men du?c làm t? c?i th?o u?p mu?i. Ngu?i Hàn Qu?c an cùng nhi?u món ph? khi dùng b?a. Ði?u này du?c g?i là 'hansang charim'. G?n dây có nhi?u k?t qu? nghiên c?u cho th?y ?m th?c Hàn Qu?c t?t cho s?c kh?e.`,
    level: "B1",
    topic: "Van hóa",
    wordCount: 95,
    questions: [
      {
        id: "q1",
        question: "?? ??? ??? ?????? (Ð?c di?m c?a ?m th?c Hàn Qu?c là gì?)",
        options: ["?? ??? ??", "?? ??? ??", "??? ??? ??", "??? ??? ??"],
        answer: 1,
        explanation: "'?? ??? ??? ?? ??? ??? ????' — Ð?c di?m là có nhi?u th?c ph?m lên men.",
      },
      {
        id: "q2",
        question: "'????'?? ?????? (Hansang charim là gì?)",
        options: ["?? ?? ??", "?? ??? ?? ?? ?", "?? ?? ??", "?? ??"],
        answer: 1,
        explanation: "'?? ?? ??? ?? ????. ??? ??????? ???' — An cùng nhi?u món ph?.",
      },
      {
        id: "q3",
        question: "??? ??? ????? (Kimchi du?c làm nhu th? nào?)",
        options: ["??? ???", "??? ??? ???", "??? ???", "??? ???"],
        answer: 1,
        explanation: "'??? ??? ??? ??? ?? ??' — Làm t? c?i th?o u?p mu?i.",
      },
      {
        id: "q4",
        question: "?????? ?? ?? ?? ??? ?? ??? (Món không ph? bi?n v?i ngu?i nu?c ngoài?)",
        options: ["??", "???", "???", "????"],
        answer: 3,
        explanation: "???? ??? ?? ??? ??, ???, ??????.",
      },
    ],
  },
  {
    id: "p4",
    title: "?? ??? ??? (V?n d? môi tru?ng và gi?i pháp)",
    korean: `?? ???? ?? ??? ?? ??? ??? ??????. ?? ??, ????, ???? ?? ? ??? ?? ??? ??? ????? ??? ??? ????. ?? ???? ??? ??? ?? ???? ???? ????. ??? ??? ???? ?? ??? ??, ??? ?? ???? ???. ??? ???? ??? ??? ???? ????? ???. ??? ??? ??? ???? ?? ??? ??? ???. ??? ??? ?? ??? ???? ?? ??? ???? ???.`,
    vietnamese: `Trong xã h?i hi?n d?i, v?n d? môi tru?ng dã d?t d?n m?c d? r?t nghiêm tr?ng. Các v?n d? môi tru?ng da d?ng nhu bi?n d?i khí h?u, b?i m?n, ô nhi?m nh?a dang ?nh hu?ng d?n cu?c s?ng hàng ngày c?a chúng ta. Ð?c bi?t v?n d? rác th?i nh?a dang de d?a h? sinh thái bi?n. Ð? gi?i quy?t nh?ng v?n d? này, cá nhân, doanh nghi?p và chính ph? c?n cùng nhau n? l?c. Cá nhân c?n gi?m s? d?ng d? dùng m?t l?n và th?c hành tái ch?. Doanh nghi?p c?n phát tri?n s?n ph?m thân thi?n môi tru?ng và gi?m phát th?i carbon. Chính ph? c?n th?c thi chính sách môi tru?ng m?nh m? và tang cu?ng h?p tác qu?c t?.`,
    level: "B2",
    topic: "Môi tru?ng",
    wordCount: 120,
    questions: [
      {
        id: "q1",
        question: "???? ??? ??? ???? ??? (V?n d? rác th?i nh?a de d?a di?u gì?)",
        options: ["?? ??", "?? ???", "?? ??", "?? ??"],
        answer: 1,
        explanation: "'???? ??? ??? ?? ???? ???? ????' — Ðe d?a h? sinh thái bi?n.",
      },
      {
        id: "q2",
        question: "??? ?? ? ?? ?? ??? (Ði?u cá nhân không c?n làm?)",
        options: ["???? ?? ???", "??? ???", "??? ?? ??", "?? ?? ??"],
        answer: 2,
        explanation: "??? ?? ??? ??? ?? ? ????.",
      },
      {
        id: "q3",
        question: "??? ??? ??? ??? (Vai trò c?a chính ph? du?c d? c?p?)",
        options: ["??? ???", "?? ?? ???", "??? ?? ?? ??", "???? ?? ???"],
        answer: 2,
        explanation: "'??? ??? ?? ??? ???? ?? ??? ???? ???'",
      },
      {
        id: "q4",
        question: "? ?? ??? ?????? (Ch? d? c?a bài vi?t này là gì?)",
        options: ["?? ??? ??", "?? ??? ???", "????? ??", "??? ??"],
        answer: 1,
        explanation: "??? ?? ??? ???? ??/??/??? ???? ??? ????.",
      },
    ],
  },
  {
    id: "p5",
    title: "?? ?? (Cu?c s?ng công s?)",
    korean: `?? ??? ?? IT ??? ??? ????. ?? ?? 9?? ???? ?? 6?? ?????. ????? 12??? 1??????. ?? ??? ???? ??? ???? ??? ????. ?? ????? ? ??? ????. ???? ?? ? ??? ???? ?? ? ??? ????. ?? ??? ?? ? ?? ??? ???? ?? ??? ???.`,
    vietnamese: `Tôi dang làm vi?c t?i m?t công ty IT ? Seoul. M?i ngày tôi di làm lúc 9 gi? sáng và tan làm lúc 6 gi? t?i. Gi? ngh? trua t? 12 gi? d?n 1 gi?. Công ty tôi có không khí t?t nên quan h? v?i d?ng nghi?p r?t t?t. M?i tu?n th? Sáu có h?p nhóm. Trong cu?c h?p báo cáo công vi?c tu?n này và lên k? ho?ch tu?n sau. Ðôi khi ph?i làm thêm gi? nhung công ty tr? ph? c?p làm thêm gi?.`,
    level: "B1",
    topic: "Công vi?c",
    wordCount: 88,
    questions: [
      {
        id: "q1",
        question: "? ??? ? ?? ?????? (Ngu?i này di làm lúc m?y gi??)",
        options: ["8?", "9?", "10?", "11?"],
        answer: 1,
        explanation: "'?? ?? 9?? ????' — M?i ngày di làm lúc 9 gi?.",
      },
      {
        id: "q2",
        question: "? ??? ?? ????? (H?p nhóm vào khi nào?)",
        options: ["??", "?? ???", "?? ???", "??"],
        answer: 2,
        explanation: "'?? ????? ? ??? ????' — M?i tu?n th? Sáu.",
      },
      {
        id: "q3",
        question: "??? ?? ???? ??? ???? (Làm thêm gi? công ty cho gì?)",
        options: ["??", "?? ??", "??", "??"],
        answer: 1,
        explanation: "'???? ?? ??? ???' — Công ty tr? ph? c?p làm thêm gi?.",
      },
    ],
  },
  {
    id: "p6",
    title: "??? ?? ?? (Thói quen s?ng lành m?nh)",
    korean: `??? ??? ???? ???? ??? ?? ?? ??? ?????. ????? ??? 30? ?? ??? ?? ?????. ??, ??, ??? ?? ? ??? ??? ?? ??? ????. ?? ??? ??? ??? ?? ?????. ??? ??? 7~8?? ?? ?? ????. ???? ??? ??? ??? ?????. ???? ?? ??? ?? ????? ???? ?? ????.`,
    vietnamese: `Ð? có cu?c s?ng lành m?nh, t?p th? d?c d?u d?n và an u?ng cân b?ng r?t quan tr?ng. Các chuyên gia khuy?n ngh? t?p th? d?c ít nh?t 30 phút m?i ngày. Các bài t?p aerobic nhu di b?, boi l?i, d?p xe t?t cho s?c kh?e tim m?ch. Ngoài ra ng? d? gi?c cung r?t quan tr?ng cho s?c kh?e. Ngu?i l?n nên ng? 7-8 ti?ng m?i ngày. Qu?n lý stress cung là ph?n quan tr?ng c?a s?c kh?e. Nên gi?i t?a stress qua thi?n d?nh ho?c ho?t d?ng s? thích.`,
    level: "B1",
    topic: "S?c kh?e",
    wordCount: 92,
    questions: [
      {
        id: "q1",
        question: "????? ???? ?? ?? ???? (Th?i gian t?p th? d?c chuyên gia khuy?n ngh??)",
        options: ["10? ??", "20? ??", "30? ??", "1?? ??"],
        answer: 2,
        explanation: "'??? 30? ?? ??? ?? ?????' — Khuy?n ngh? t?p ít nh?t 30 phút.",
      },
      {
        id: "q2",
        question: "??? ?? ?? ???? (Th?i gian ng? khuy?n ngh? cho ngu?i l?n?)",
        options: ["5~6??", "6~7??", "7~8??", "8~9??"],
        answer: 2,
        explanation: "'??? ??? 7~8?? ?? ?? ????'",
      },
      {
        id: "q3",
        question: "???? ?? ???? ??? ??? (Phuong pháp gi?i t?a stress du?c d? c?p?)",
        options: ["??", "???? ?? ??", "??? ??", "?? ?? ??"],
        answer: 1,
        explanation: "'???? ?? ??? ?? ????? ???? ?? ????'",
      },
    ],
  },
  {
    id: "p7",
    title: "??? ?? ?? (H? th?ng giáo d?c Hàn Qu?c)",
    korean: `??? ?? ??? ???? 6?, ??? 3?, ???? 3??? ???? ????. ??? ??? ???? ?? ??? ?? ???. ??? ?? 11?? ???? ???? ?? ??? ?? ? ?????. ?? ???? ??? ?? ??? ?? ???. ?? ???? ?? ?? ??? ??? ????. ???? ??? ???? ?? ??? ?? ??? ???? ????.`,
    vietnamese: `H? th?ng giáo d?c Hàn Qu?c g?m 6 nam ti?u h?c, 3 nam trung h?c co s?, 3 nam trung h?c ph? thông. Ð? vào d?i h?c ph?i thi k? thi Suneung. Suneung du?c t? ch?c vào tháng 11 hàng nam và là m?t trong nh?ng k? thi quan tr?ng nh?t ? Hàn Qu?c. H?c sinh Hàn Qu?c ch?u áp l?c h?c t?p r?t l?n. Nhi?u h?c sinh ngoài gi? h?c ? tru?ng còn di h?c thêm ? hagwon. G?n dây nhi?u chính sách giáo d?c da d?ng dang du?c th?c thi d? da d?ng hóa giáo d?c.`,
    level: "B2",
    topic: "Giáo d?c",
    wordCount: 98,
    questions: [
      {
        id: "q1",
        question: "?? ???? ? ????? (Trung h?c co s? Hàn Qu?c m?y nam?)",
        options: ["2?", "3?", "4?", "6?"],
        answer: 1,
        explanation: "'??? 3?' — Trung h?c co s? 3 nam.",
      },
      {
        id: "q2",
        question: "?? ??? ?? ?????? (K? thi Suneung du?c t? ch?c khi nào?)",
        options: ["3?", "6?", "9?", "11?"],
        answer: 3,
        explanation: "'??? ?? 11?? ?????' — T? ch?c vào tháng 11 hàng nam.",
      },
      {
        id: "q3",
        question: "???? ?????? (Hagwon là gì?)",
        options: ["?? ???", "?? ? ??? ??", "???", "???"],
        answer: 1,
        explanation: "??? ?? ?? ?? ??? ??? ?????.",
      },
      {
        id: "q4",
        question: "? ?? ??? ?? ?? ??? (Ði?u không dúng v?i n?i dung bài?)",
        options: [
          "????? 6???",
          "??? ?? 11?? ??",
          "?? ???? ?? ??? ??",
          "???? ??? ??",
        ],
        answer: 3,
        explanation: "???? '?? ???? ??? ????'?? ???? ??? ??? ?? ????.",
      },
    ],
  },
  {
    id: "p8",
    title: "??? ?? (Ngày l? Hàn Qu?c)",
    korean: `???? ??? ????? ? ?? ? ??? ????. ??? ?? 1? 1?? ??? ???? ????. ?? ???? ?? ??? ??? ???? ??? ????. ??? ?? ???? ???? ???. ??? ?? 8? 15?? ??? ????????. ???? ??? ??? ?? ??? ???. ? ?? ?? ??? ?? ??? ??? ????.`,
    vietnamese: `Hàn Qu?c có hai ngày l? l?n là T?t Seollal và Chuseok. Seollal là ngày 1 tháng 1 âm l?ch, ngày dón nam m?i. Ngày này gia dình t? h?p làm l? charye và cúi chào ngu?i l?n tu?i (sebae). Khi làm sebae ngu?i l?n s? cho ti?n m?ng tu?i (sebaedon). Chuseok là ngày 15 tháng 8 âm l?ch, là l? t? on mùa màng c?a Hàn Qu?c. Vào Chuseok làm và an songpyeon, di t?o m?. C? hai ngày l? d?u là ngày quan tr?ng d? gia dình sum h?p.`,
    level: "A2",
    topic: "Van hóa",
    wordCount: 85,
    questions: [
      {
        id: "q1",
        question: "??? ?????? (Seollal là ngày nào?)",
        options: ["?? 1? 1?", "?? 1? 1?", "?? 8? 15?", "?? 8? 15?"],
        answer: 1,
        explanation: "'??? ?? 1? 1?' — Seollal là ngày 1 tháng 1 âm l?ch.",
      },
      {
        id: "q2",
        question: "??? ?? ??? ????? (Làm sebae nh?n du?c gì?)",
        options: ["??", "??", "???", "?"],
        answer: 2,
        explanation: "'??? ?? ???? ???? ???' — Nh?n ti?n m?ng tu?i.",
      },
      {
        id: "q3",
        question: "??? ?? ??? ?????? (Món an trong Chuseok là gì?)",
        options: ["??", "??", "??", "??"],
        answer: 1,
        explanation: "'???? ??? ??? ??' — An songpyeon.",
      },
    ],
  },
];

type Phase = "setup" | "reading" | "result";

export default function TopikReadingPage() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedLevel, setSelectedLevel] = useState<string>("B1");
  const [selectedTopic, setSelectedTopic] = useState<string>("T?t c?");
  const [showVietnamese, setShowVietnamese] = useState(false);
  const [currentPassageIdx, setCurrentPassageIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [passages, setPassages] = useState<ReadingPassage[]>([]);
  const [score, setScore] = useState(0);
  const [wrongItems, setWrongItems] = useState<{ passage: string; question: string; correct: string }[]>([]);
  const [resultFilter, setResultFilter] = useState<"all" | "correct" | "wrong">("all");
  const [saving, setSaving] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const filteredPassages = PASSAGES.filter((p) => {
    const levelMatch = p.level === selectedLevel;
    const topicMatch = selectedTopic === "T?t c?" || p.topic === selectedTopic;
    return levelMatch && topicMatch;
  });

  const currentPassage = passages[currentPassageIdx];
  const currentQuestion = currentPassage?.questions[currentQuestionIdx];
  const totalQuestions = passages.reduce((s, p) => s + p.questions.length, 0);
  const answeredCount = answers.filter((a) => a !== null).length;

  // Timer
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [timerActive, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && timerActive && phase === "reading") {
      handleNextQuestion();
    }
  }, [timeLeft]);

  const startQuiz = () => {
    const selected = filteredPassages.length > 0 ? filteredPassages : PASSAGES.filter((p) => p.level === selectedLevel);
    setPassages(selected);
    setCurrentPassageIdx(0);
    setCurrentQuestionIdx(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setShowVietnamese(false);
    setScore(0);
    setWrongItems([]);
    setTimeLeft(45);
    setTimerActive(true);
    setPhase("reading");
  };

  const handleSelectAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    setTimerActive(false);
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (idx === currentQuestion.answer) {
      setScore((s) => s + 1);
    } else {
      setWrongItems((prev) => [
        ...prev,
        {
          passage: currentPassage.title,
          question: currentQuestion.question,
          correct: currentQuestion.options[currentQuestion.answer],
        },
      ]);
    }
  };

  const handleNextQuestion = useCallback(() => {
    if (!currentPassage) return;
    const nextQIdx = currentQuestionIdx + 1;
    if (nextQIdx < currentPassage.questions.length) {
      setCurrentQuestionIdx(nextQIdx);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setTimeLeft(45);
      setTimerActive(true);
    } else {
      const nextPIdx = currentPassageIdx + 1;
      if (nextPIdx < passages.length) {
        setCurrentPassageIdx(nextPIdx);
        setCurrentQuestionIdx(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setShowVietnamese(false);
        setTimeLeft(45);
        setTimerActive(true);
      } else {
        setTimerActive(false);
        setPhase("result");
        saveResult();
      }
    }
  }, [currentPassageIdx, currentQuestionIdx, currentPassage, passages]);

  const saveResult = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from("topik_quiz_history").insert({
        user_id: user.id,
        quiz_type: "reading",
        level: selectedLevel,
        topic: selectedTopic,
        score,
        total: totalQuestions,
        wrong_words: wrongItems,
      });
    } catch (err) {
      console.error("Save error:", err);
    }
    setSaving(false);
  };

  const levelInfo = LEVELS.find((l) => l.id === selectedLevel);
  const pct = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const timerPct = (timeLeft / 45) * 100;
  const timerColor = timeLeft > 20 ? "#34d399" : timeLeft > 10 ? "app-accent-primary" : "#f87171";

  // Global question index
  let globalQIdx = 0;
  for (let i = 0; i < currentPassageIdx; i++) globalQIdx += passages[i]?.questions.length || 0;
  globalQIdx += currentQuestionIdx;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Luy?n d?c TOPIK</h1>
          <p className="text-app-text-secondary text-sm">Ð?c do?n van ti?ng Hàn và tr? l?i câu h?i tr?c nghi?m</p>
        </div>

        {/* SETUP PHASE */}
        {phase === "setup" && (
          <div className="space-y-6">
            {/* Level select */}
            <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
              <p className="text-white/60 text-sm font-medium mb-4">Ch?n c?p d?</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {LEVELS.map((lv) => (
                  <button
                    key={lv.id}
                    onClick={() => setSelectedLevel(lv.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedLevel === lv.id
                        ? "border-opacity-60 bg-opacity-10"
                        : "border-app-border bg-white/2 hover:bg-app-card/50"
                    }`}
                    style={
                      selectedLevel === lv.id
                        ? { borderColor: lv.color, backgroundColor: `${lv.color}12` }
                        : {}
                    }
                  >
                    <span
                      className="text-lg font-bold block mb-1"
                      style={{ color: selectedLevel === lv.id ? lv.color : "rgba(255,255,255,0.6)" }}
                    >
                      {lv.id}
                    </span>
                    <p className="text-app-text-secondary text-xs leading-tight">{lv.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic select */}
            <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
              <p className="text-white/60 text-sm font-medium mb-4">Ch?n ch? d?</p>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      selectedTopic === t
                        ? "bg-app-accent-primary/15 text-app-accent-primary border border-app-accent-primary/30"
                        : "bg-app-card/50 text-app-text-secondary border border-app-border hover:text-white/70"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
              <p className="text-white/60 text-sm font-medium mb-3">Ðo?n van có s?n</p>
              <div className="space-y-2">
                {filteredPassages.length === 0 ? (
                  <p className="text-app-text-muted text-sm text-center py-4">Không có do?n van phù h?p. Th? ch?n ch? d? khác.</p>
                ) : (
                  filteredPassages.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-app-surface/50 rounded-xl">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor: `${LEVELS.find((l) => l.id === p.level)?.color}20`,
                          color: LEVELS.find((l) => l.id === p.level)?.color,
                        }}
                      >
                        {p.level}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-sm font-medium truncate">{p.title}</p>
                        <p className="text-app-text-muted text-xs">{p.topic} · {p.wordCount} t? · {p.questions.length} câu h?i</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={startQuiz}
              disabled={filteredPassages.length === 0}
              className="w-full py-4 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: levelInfo?.color, color: "#0f1117" }}
            >
              <i className="ri-book-open-line mr-2"></i>
              B?t d?u luy?n d?c ({filteredPassages.length} do?n van · {filteredPassages.reduce((s, p) => s + p.questions.length, 0)} câu h?i)
            </button>
          </div>
        )}

        {/* READING PHASE */}
        {phase === "reading" && currentPassage && currentQuestion && (
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/6 rounded-full overflow-hidden">
                <div
                  className="h-full bg-app-accent-primary rounded-full transition-all duration-300"
                  style={{ width: `${((globalQIdx) / totalQuestions) * 100}%` }}
                ></div>
              </div>
              <span className="text-app-text-secondary text-xs whitespace-nowrap">{globalQIdx + 1}/{totalQuestions}</span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/6 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
                ></div>
              </div>
              <span className="text-xs font-mono font-bold" style={{ color: timerColor }}>{timeLeft}s</span>
            </div>

            {/* Passage card */}
            <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-bold"
                    style={{
                      backgroundColor: `${levelInfo?.color}20`,
                      color: levelInfo?.color,
                    }}
                  >
                    {currentPassage.level}
                  </span>
                  <span className="text-white/50 text-sm font-medium">{currentPassage.title}</span>
                  <span className="text-app-text-muted text-xs">{currentPassage.topic}</span>
                </div>
                <button
                  onClick={() => setShowVietnamese((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-card/50 hover:bg-app-card/70 text-white/50 hover:text-white/80 text-xs transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className={`${showVietnamese ? "ri-eye-off-line" : "ri-eye-line"} text-xs`}></i>
                  {showVietnamese ? "?n d?ch" : "Xem d?ch"}
                </button>
              </div>

              {/* Korean text */}
              <div className="bg-app-surface/50 rounded-xl p-4 mb-3">
                <p className="text-white/85 text-base leading-relaxed font-medium" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                  {currentPassage.korean}
                </p>
              </div>

              {/* Vietnamese translation */}
              {showVietnamese && (
                <div className="bg-app-accent-primary/5 border border-app-accent-primary/10 rounded-xl p-4">
                  <p className="text-app-accent-primary/70 text-xs mb-1 font-medium">B?n d?ch ti?ng Vi?t</p>
                  <p className="text-white/60 text-sm leading-relaxed">{currentPassage.vietnamese}</p>
                </div>
              )}
            </div>

            {/* Question */}
            <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5">
              <p className="text-app-text-secondary text-xs mb-2">Câu h?i {currentQuestionIdx + 1}/{currentPassage.questions.length}</p>
              <p className="text-white/90 text-base font-medium mb-4 leading-relaxed">{currentQuestion.question}</p>

              <div className="space-y-2">
                {currentQuestion.options.map((opt, idx) => {
                  let cls = "border-app-border bg-app-surface/50 text-white/70 hover:bg-white/8 hover:border-white/20";
                  if (selectedAnswer !== null) {
                    if (idx === currentQuestion.answer) cls = "border-[#34d399]/50 bg-[#34d399]/10 text-[#34d399]";
                    else if (idx === selectedAnswer) cls = "border-[#f87171]/50 bg-[#f87171]/10 text-[#f87171]";
                    else cls = "border-app-border bg-white/2 text-app-text-muted";
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      disabled={selectedAnswer !== null}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${cls}`}
                    >
                      <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm">{opt}</span>
                      {selectedAnswer !== null && idx === currentQuestion.answer && (
                        <i className="ri-check-line ml-auto text-[#34d399]"></i>
                      )}
                      {selectedAnswer === idx && idx !== currentQuestion.answer && (
                        <i className="ri-close-line ml-auto text-[#f87171]"></i>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div className="mt-4 p-4 bg-app-surface/50 rounded-xl border border-app-border">
                  <p className="text-app-text-secondary text-xs mb-1 font-medium">Gi?i thích</p>
                  <p className="text-white/70 text-sm leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              )}

              {selectedAnswer !== null && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full mt-4 py-3 rounded-xl font-semibold text-sm bg-app-accent-primary/15 text-app-accent-primary hover:bg-app-accent-primary/25 transition-all cursor-pointer whitespace-nowrap"
                >
                  {globalQIdx + 1 >= totalQuestions ? "Xem k?t qu?" : "Câu ti?p theo"}
                  <i className="ri-arrow-right-line ml-2"></i>
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULT PHASE */}
        {phase === "result" && (
          <div className="space-y-5">
            {/* Score card */}
            <div className="bg-app-surface/50 border border-app-border rounded-2xl p-8 text-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171"}20` }}
              >
                <p className="text-3xl font-bold" style={{ color: pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171" }}>
                  {pct}%
                </p>
              </div>
              <p className="text-white/80 text-xl font-bold mb-1">
                {pct >= 80 ? "Xu?t s?c!" : pct >= 60 ? "Khá t?t!" : "C?n c? g?ng thêm!"}
              </p>
              <p className="text-app-text-secondary text-sm mb-4">
                {score}/{totalQuestions} câu dúng · C?p d? {selectedLevel}
              </p>
              {saving && <p className="text-app-text-muted text-xs">Ðang luu k?t qu?...</p>}
              {!user && <p className="text-app-text-muted text-xs">Ðang nh?p d? luu k?t qu? lên cloud</p>}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Ðúng", value: score, color: "#34d399" },
                { label: "Sai", value: totalQuestions - score, color: "#f87171" },
                { label: "Ðo?n van", value: passages.length, color: "app-accent-primary" },
              ].map((s) => (
                <div key={s.label} className="bg-app-surface/50 border border-app-border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-app-text-muted text-xs">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              {(["all", "correct", "wrong"] as const).map((f) => {
                const labels = { all: "T?t c?", correct: "Ðúng", wrong: "Sai" };
                return (
                  <button
                    key={f}
                    onClick={() => setResultFilter(f)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      resultFilter === f ? "bg-app-accent-primary/15 text-app-accent-primary" : "bg-app-card/50 text-app-text-secondary hover:text-white/70"
                    }`}
                  >
                    {labels[f]}
                  </button>
                );
              })}
            </div>

            {/* Review list */}
            <div className="space-y-3">
              {passages.map((passage, pIdx) =>
                passage.questions.map((q, qIdx) => {
                  let globalIdx = 0;
                  for (let i = 0; i < pIdx; i++) globalIdx += passages[i].questions.length;
                  globalIdx += qIdx;
                  const userAns = answers[globalIdx];
                  const isCorrect = userAns === q.answer;
                  if (resultFilter === "correct" && !isCorrect) return null;
                  if (resultFilter === "wrong" && isCorrect) return null;
                  return (
                    <div
                      key={`${pIdx}-${qIdx}`}
                      className="bg-app-surface/50 border rounded-xl p-4"
                      style={{ borderColor: isCorrect ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)" }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: isCorrect ? "#34d39920" : "#f8717120" }}
                        >
                          <i
                            className={`${isCorrect ? "ri-check-line text-[#34d399]" : "ri-close-line text-[#f87171]"} text-xs`}
                          ></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-app-text-muted text-xs mb-1">{passage.title}</p>
                          <p className="text-white/70 text-sm mb-2">{q.question}</p>
                          {!isCorrect && (
                            <div className="space-y-1">
                              <p className="text-[#f87171] text-xs">
                                B?n ch?n: {userAns !== null && userAns !== undefined ? q.options[userAns] : "Không tr? l?i"}
                              </p>
                              <p className="text-[#34d399] text-xs">Ðáp án dúng: {q.options[q.answer]}</p>
                            </div>
                          )}
                          <p className="text-app-text-muted text-xs mt-2 italic">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setPhase("setup")}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-app-card/50 text-white/60 hover:bg-app-card/70 transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-refresh-line mr-2"></i>
                Làm l?i
              </button>
              <button
                onClick={() => setShowShare(true)}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-app-card/50 text-white/60 hover:bg-app-card/70 transition-all cursor-pointer whitespace-nowrap border border-app-border"
              >
                <i className="ri-share-line mr-2"></i>Chia s?
              </button>
            <button
                onClick={() => {
                  const content = wrongItems
                    .map((w) => `Ðo?n: ${w.passage}\nCâu h?i: ${w.question}\nÐáp án dúng: ${w.correct}`)
                    .join("\n\n---\n\n");
                  const win = window.open("", "_blank");
                  if (!win) return;
                  win.document.write(`<html><head><title>T? sai - Luy?n d?c TOPIK</title><style>body{font-family:sans-serif;padding:24px;max-width:700px;margin:auto}h2{color:#333}p{line-height:1.6;color:#555}hr{border:1px solid #eee;margin:16px 0}</style></head><body><h2>Câu sai - Luy?n d?c TOPIK ${selectedLevel}</h2>${content.split("\n").map((l) => `<p>${l}</p>`).join("")}</body></html>`);
                  win.print();
                }}
                disabled={wrongItems.length === 0}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-app-accent-primary/10 text-app-accent-primary hover:bg-app-accent-primary/20 transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
              >
                <i className="ri-file-pdf-line mr-2"></i>
                Xu?t câu sai PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

