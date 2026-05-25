import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import { epsQuestions } from "@/mocks/epsQuestions";

// ─── Types ────────────────────────────────────────────────────────────────
interface ChallengeSession {
  id: string;
  createdAt: string;
  creatorName: string;
  topic: string;
  questionCount: number;
  questions: string[]; // question IDs
  myScore?: number;
  myTime?: number; // seconds
  opponentScore?: number;
  opponentName?: string;
  opponentTime?: number;
  status: "waiting" | "completed";
}

interface QuizQuestion {
  id: string;
  question: string;
  questionVi: string;
  options: string[];
  optionsVi: string[];
  correctIndex: number;
  topic: string;
}

const TOPICS = [
  { id: "all", label: "Tất cả chủ đề", icon: "ri-apps-line", color: "#e8c84a" },
  { id: "greeting", label: "Chào hỏi", icon: "ri-hand-heart-line", color: "#34d399" },
  { id: "workplace", label: "Nơi làm việc", icon: "ri-building-line", color: "#fb923c" },
  { id: "safety", label: "An toàn lao động", icon: "ri-shield-check-line", color: "#f87171" },
  { id: "law", label: "Pháp luật", icon: "ri-scales-3-line", color: "#a78bfa" },
  { id: "daily", label: "Sinh hoạt hàng ngày", icon: "ri-home-smile-line", color: "#38bdf8" },
];

const QUESTION_COUNTS = [5, 10, 15, 20];

// Challenge history lưu trong localStorage, mặc định rỗng (không còn fake)
const INITIAL_HISTORY: ChallengeSession[] = [];

// ─── Quiz Mode ────────────────────────────────────────────────────────────
function QuizMode({
  questions,
  onFinish,
}: {
  questions: QuizQuestion[];
  onFinish: (score: number, timeSeconds: number) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (showResult) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, showResult]);

  const current = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  const handleAnswer = (optIdx: number) => {
    if (answers[currentIdx] !== undefined) return;
    setAnswers(prev => ({ ...prev, [currentIdx]: optIdx }));
    setTimeout(() => {
      if (currentIdx + 1 >= questions.length) {
        setShowResult(true);
      } else {
        setCurrentIdx(i => i + 1);
      }
    }, 600);
  };

  const score = useMemo(() => {
    return questions.filter((q, i) => answers[i] === q.correctIndex).length;
  }, [questions, answers]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (showResult) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto">
        <div className={`w-20 h-20 flex items-center justify-center rounded-full mb-5 ${pct >= 80 ? "bg-app-accent-success/15" : pct >= 60 ? "bg-app-accent-primary/15" : "bg-red-500/15"}`}>
          <i className={`text-3xl ${pct >= 80 ? "ri-trophy-line text-app-accent-success" : pct >= 60 ? "ri-thumb-up-line text-app-accent-primary" : "ri-emotion-sad-line text-red-400"}`}></i>
        </div>
        <p className="text-white font-bold text-2xl mb-1">{score}/{questions.length} câu đúng</p>
        <p className="text-app-text-secondary text-sm mb-2">Thời gian: {formatTime(elapsed)}</p>
        <p className={`text-lg font-bold mb-6 ${pct >= 80 ? "text-app-accent-success" : pct >= 60 ? "text-app-accent-primary" : "text-red-400"}`}>
          {pct >= 80 ? "Xuất sắc!" : pct >= 60 ? "Khá tốt!" : "Cần cố gắng thêm!"}
        </p>
        <button
          onClick={() => onFinish(score, elapsed)}
          className="px-8 py-3 rounded-xl bg-app-accent-primary text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap hover:bg-[#d4b43a] transition-colors"
        >
          Xem kết quả & Chia sẻ link
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-app-text-secondary text-sm">{currentIdx + 1}/{questions.length}</span>
          <div className="w-32 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
            <div className="h-full bg-app-accent-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-app-text-secondary text-sm">
          <i className="ri-timer-line"></i>
          <span className="font-mono">{formatTime(elapsed)}</span>
        </div>
      </div>

      {/* Question */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-6">
        <p className="text-white font-bold text-lg mb-1 leading-relaxed">{current.question}</p>
        <p className="text-app-text-secondary text-sm italic">{current.questionVi}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {current.options.map((opt, i) => {
          const answered = answers[currentIdx] !== undefined;
          const isSelected = answers[currentIdx] === i;
          const isCorrect = i === current.correctIndex;
          let cls = "border-app-border bg-white/2 hover:border-white/20 hover:bg-white/4 cursor-pointer";
          if (answered) {
            if (isCorrect) cls = "border-emerald-500/40 bg-emerald-500/8 cursor-default";
            else if (isSelected) cls = "border-red-500/40 bg-red-500/8 cursor-default";
            else cls = "border-app-border opacity-40 cursor-default";
          } else if (isSelected) {
            cls = "border-app-accent-primary/40 bg-app-accent-primary/8 cursor-pointer";
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl border transition-all text-left ${cls}`}
            >
              <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary text-xs font-bold flex-shrink-0">
                {["A", "B", "C", "D"][i]}
              </span>
              <div>
                <p className="text-white/80 text-sm font-medium">{opt}</p>
                {current.optionsVi && <p className="text-app-text-muted text-xs">{current.optionsVi[i]}</p>}
              </div>
              {answered && isCorrect && <i className="ri-checkbox-circle-fill text-app-accent-success ml-auto text-lg"></i>}
              {answered && isSelected && !isCorrect && <i className="ri-close-circle-fill text-red-400 ml-auto text-lg"></i>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Challenge Result Card ────────────────────────────────────────────────
function ChallengeResultCard({ session }: { session: ChallengeSession }) {
  const topicInfo = TOPICS.find(t => t.id === session.topic) || TOPICS[0];
  const isWin = session.myScore !== undefined && session.opponentScore !== undefined && session.myScore > session.opponentScore;
  const isDraw = session.myScore !== undefined && session.opponentScore !== undefined && session.myScore === session.opponentScore;
  const isWaiting = session.status === "waiting";
  const timeAgo = (() => {
    const diff = Date.now() - new Date(session.createdAt).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (d > 0) return `${d} ngày trước`;
    if (h > 0) return `${h} giờ trước`;
    return "Vừa xong";
  })();

  const formatTime = (s?: number) => s !== undefined ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : "--:--";

  return (
    <div className={`bg-app-bg border rounded-2xl p-5 ${isWaiting ? "border-app-accent-primary/20" : isWin ? "border-emerald-500/20" : isDraw ? "border-app-border" : "border-red-500/15"}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${topicInfo.color}15` }}>
            <i className={`${topicInfo.icon} text-lg`} style={{ color: topicInfo.color }}></i>
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{topicInfo.label}</p>
            <p className="text-app-text-muted text-xs">{session.questionCount} câu · {timeAgo}</p>
          </div>
        </div>
        {isWaiting ? (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-app-accent-primary/15 text-app-accent-primary flex items-center gap-1">
            <i className="ri-time-line"></i>Chờ bạn bè
          </span>
        ) : isWin ? (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-app-accent-success/15 text-app-accent-success">Thắng</span>
        ) : isDraw ? (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-app-card/70 text-white/50">Hòa</span>
        ) : (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-400">Thua</span>
        )}
      </div>

      {/* Score comparison */}
      <div className="flex items-center gap-4">
        <div className="flex-1 text-center p-3 rounded-xl bg-app-surface/50">
          <p className="text-app-text-secondary text-[10px] mb-1">Bạn</p>
          <p className="text-white font-bold text-2xl">{session.myScore ?? "--"}</p>
          <p className="text-app-text-muted text-[10px]">{formatTime(session.myTime)}</p>
        </div>
        <div className="text-app-text-muted font-bold text-lg">VS</div>
        <div className={`flex-1 text-center p-3 rounded-xl ${isWaiting ? "bg-app-accent-primary/5 border border-dashed border-app-accent-primary/20" : "bg-app-surface/50"}`}>
          <p className="text-app-text-secondary text-[10px] mb-1">{session.opponentName || "Chờ..."}</p>
          {isWaiting ? (
            <p className="text-app-accent-primary/50 text-sm font-medium">Chưa làm</p>
          ) : (
            <>
              <p className="text-white font-bold text-2xl">{session.opponentScore ?? "--"}</p>
              <p className="text-app-text-muted text-[10px]">{formatTime(session.opponentTime)}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function FriendChallengePage() {
  const { awardXP } = useXPSystem();
  const [challenges, setChallenges] = useLocalStorage<ChallengeSession[]>("kts_friend_challenges", INITIAL_HISTORY);
  const [view, setView] = useState<"home" | "create" | "quiz" | "result" | "join">("home");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [questionCount, setQuestionCount] = useState(10);
  const [activeChallenge, setActiveChallenge] = useState<ChallengeSession | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [finalScore, setFinalScore] = useState<{ score: number; time: number } | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [creatorName, setCreatorName] = useState("Bạn");

  const generateQuestions = (topic: string, count: number): QuizQuestion[] => {
    const pool = topic === "all"
      ? epsQuestions
      : epsQuestions.filter(q => q.topic === topic);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    return shuffled.map(q => ({
      id: q.id,
      question: q.question,
      questionVi: q.questionVi || "",
      options: q.options,
      optionsVi: q.optionsVi || [],
      correctIndex: q.correctIndex,
      topic: q.topic,
    }));
  };

  const handleCreateChallenge = () => {
    const questions = generateQuestions(selectedTopic, questionCount);
    const id = `ch_${Date.now()}`;
    const session: ChallengeSession = {
      id,
      createdAt: new Date().toISOString(),
      creatorName,
      topic: selectedTopic,
      questionCount,
      questions: questions.map(q => q.id),
      status: "waiting",
    };
    setActiveChallenge(session);
    setQuizQuestions(questions);
    setView("quiz");
  };

  const handleQuizFinish = (score: number, timeSeconds: number) => {
    if (!activeChallenge) return;
    const updated: ChallengeSession = {
      ...activeChallenge,
      myScore: score,
      myTime: timeSeconds,
      status: "waiting",
    };
    setChallenges(prev => {
      const exists = prev.find(c => c.id === updated.id);
      if (exists) return prev.map(c => c.id === updated.id ? updated : c);
      return [updated, ...prev];
    });
    setActiveChallenge(updated);
    setFinalScore({ score, time: timeSeconds });
    awardXP({ type: "eps_exam_completed", amount: score * 5 + 20 });
    setView("result");
  };

  const handleJoinChallenge = () => {
    const found = challenges.find(c => c.id === joinCode.trim() || c.id.includes(joinCode.trim()));
    if (!found) {
      setJoinError("Không tìm thấy thách đấu với mã này. Kiểm tra lại link hoặc mã.");
      return;
    }
    const questions = generateQuestions(found.topic, found.questionCount);
    setActiveChallenge(found);
    setQuizQuestions(questions);
    setJoinError("");
    setView("quiz");
  };

  const challengeLink = activeChallenge
    ? `${window.location.origin}/friend-challenge?id=${activeChallenge.id}`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(challengeLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2500);
    });
  };

  const wins = challenges.filter(c => c.status === "completed" && c.myScore !== undefined && c.opponentScore !== undefined && c.myScore > c.opponentScore).length;
  const losses = challenges.filter(c => c.status === "completed" && c.myScore !== undefined && c.opponentScore !== undefined && c.myScore < c.opponentScore).length;
  const draws = challenges.filter(c => c.status === "completed" && c.myScore !== undefined && c.opponentScore !== undefined && c.myScore === c.opponentScore).length;

  // ── Quiz view ──
  if (view === "quiz") {
    return (
      <DashboardLayout title="Thách đấu bạn bè" subtitle="Làm bài quiz — sau đó chia sẻ link cho bạn bè">
        <div className="mb-6">
          <button onClick={() => setView("home")} className="flex items-center gap-2 text-app-text-secondary hover:text-white/70 text-sm cursor-pointer whitespace-nowrap transition-colors">
            <i className="ri-arrow-left-line"></i>Quay lại
          </button>
        </div>
        <QuizMode questions={quizQuestions} onFinish={handleQuizFinish} />
      </DashboardLayout>
    );
  }

  // ── Result view ──
  if (view === "result" && activeChallenge && finalScore) {
    const topicInfo = TOPICS.find(t => t.id === activeChallenge.topic) || TOPICS[0];
    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
    return (
      <DashboardLayout title="Kết quả thách đấu" subtitle="Chia sẻ link để bạn bè cùng làm bài">
        <div className="max-w-lg mx-auto space-y-5">
          {/* Score card */}
          <div className="bg-app-bg border border-app-accent-primary/20 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-app-accent-primary/15 mx-auto mb-4">
              <i className="ri-trophy-line text-app-accent-primary text-2xl"></i>
            </div>
            <p className="text-white font-bold text-3xl mb-1">{finalScore.score}/{activeChallenge.questionCount}</p>
            <p className="text-app-text-secondary text-sm mb-1">Thời gian: {formatTime(finalScore.time)}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${topicInfo.color}15` }}>
                <i className={`${topicInfo.icon} text-sm`} style={{ color: topicInfo.color }}></i>
              </div>
              <span className="text-white/50 text-sm">{topicInfo.label}</span>
            </div>
          </div>

          {/* Share link */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-3">Chia sẻ thách đấu</p>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5 text-white/50 text-xs font-mono truncate">
                {challengeLink}
              </div>
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-all ${linkCopied ? "bg-app-accent-success/15 text-app-accent-success border border-emerald-500/25" : "bg-app-accent-primary text-app-bg hover:bg-[#d4b43a]"}`}
              >
                {linkCopied ? <><i className="ri-check-line mr-1"></i>Đã sao chép</> : <><i className="ri-file-copy-line mr-1"></i>Sao chép</>}
              </button>
            </div>
            <p className="text-app-text-muted text-xs">Gửi link này cho bạn bè — họ sẽ làm cùng bộ câu hỏi và so sánh điểm với bạn!</p>
          </div>

          {/* Share via */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Zalo", icon: "ri-message-2-line", color: "#0068ff", bg: "#0068ff15" },
              { label: "Facebook", icon: "ri-facebook-circle-line", color: "#1877f2", bg: "#1877f215" },
              { label: "Copy text", icon: "ri-clipboard-line", color: "#e8c84a", bg: "rgba(232,200,74,0.15)" },
            ].map(s => (
              <button
                key={s.label}
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-app-border hover:bg-app-surface/50 cursor-pointer transition-colors"
              >
                <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: s.bg }}>
                  <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
                </div>
                <span className="text-app-text-secondary text-xs">{s.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => { setView("home"); setActiveChallenge(null); setFinalScore(null); }}
            className="w-full py-3 rounded-xl border border-app-border text-white/50 text-sm hover:bg-app-card/50 cursor-pointer whitespace-nowrap transition-colors"
          >
            Về trang chính
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Home view ──
  return (
    <DashboardLayout
      title="Thách đấu bạn bè"
      subtitle="Tạo quiz, chia sẻ link — bạn bè làm cùng bộ câu hỏi và so sánh điểm"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Left */}
        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Thắng", value: wins, icon: "ri-trophy-line", color: "#34d399" },
              { label: "Thua", value: losses, icon: "ri-close-circle-line", color: "#f87171" },
              { label: "Hòa", value: draws, icon: "ri-scales-3-line", color: "#e8c84a" },
            ].map(s => (
              <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
                </div>
                <div>
                  <p className="text-white font-bold text-xl leading-none">{s.value}</p>
                  <p className="text-app-text-secondary text-xs mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Create challenge */}
          {view === "create" ? (
            <div className="bg-app-bg border border-app-border rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">Tạo thách đấu mới</p>
                <button onClick={() => setView("home")} className="text-app-text-muted hover:text-white/60 cursor-pointer">
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>

              {/* Creator name */}
              <div>
                <label className="text-app-text-secondary text-xs mb-2 block">Tên của bạn</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={e => setCreatorName(e.target.value)}
                  placeholder="Nhập tên..."
                  className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/25"
                />
              </div>

              {/* Topic */}
              <div>
                <label className="text-app-text-secondary text-xs mb-2 block">Chủ đề câu hỏi</label>
                <div className="grid grid-cols-2 gap-2">
                  {TOPICS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTopic(t.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left cursor-pointer transition-all ${selectedTopic === t.id ? "" : "border-app-border bg-white/2 hover:bg-white/4"}`}
                      style={selectedTopic === t.id ? { backgroundColor: `${t.color}10`, borderColor: `${t.color}30` } : {}}
                    >
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${t.color}15` }}>
                        <i className={`${t.icon} text-sm`} style={{ color: t.color }}></i>
                      </div>
                      <span className="text-xs font-medium" style={{ color: selectedTopic === t.id ? t.color : "rgba(255,255,255,0.5)" }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question count */}
              <div>
                <label className="text-app-text-secondary text-xs mb-2 block">Số câu hỏi</label>
                <div className="flex gap-2">
                  {QUESTION_COUNTS.map(n => (
                    <button
                      key={n}
                      onClick={() => setQuestionCount(n)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-bold cursor-pointer whitespace-nowrap transition-all ${questionCount === n ? "bg-app-accent-primary text-app-bg border-app-accent-primary" : "border-app-border text-app-text-secondary hover:text-white/60"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateChallenge}
                className="w-full py-3.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-sword-line mr-2"></i>Bắt đầu làm bài
              </button>
            </div>
          ) : view === "join" ? (
            <div className="bg-app-bg border border-app-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">Tham gia thách đấu</p>
                <button onClick={() => setView("home")} className="text-app-text-muted hover:text-white/60 cursor-pointer">
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>
              <p className="text-app-text-secondary text-sm">Nhập mã thách đấu hoặc dán link từ bạn bè</p>
              <input
                type="text"
                value={joinCode}
                onChange={e => { setJoinCode(e.target.value); setJoinError(""); }}
                placeholder="Nhập mã hoặc link thách đấu..."
                className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/25"
              />
              {joinError && <p className="text-red-400 text-xs">{joinError}</p>}
              <button
                onClick={handleJoinChallenge}
                disabled={!joinCode.trim()}
                className="w-full py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Tham gia ngay
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setView("create")}
                className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-add-circle-line text-lg"></i>
                Tạo thách đấu mới
              </button>
              <button
                onClick={() => setView("join")}
                className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border border-app-border bg-app-surface/50 hover:bg-white/6 text-white/60 font-bold text-sm cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-link text-lg"></i>
                Tham gia bằng link
              </button>
            </div>
          )}

          {/* History */}
          <div>
            <p className="text-app-text-secondary text-xs font-semibold tracking-normal mb-3">Lịch sử thách đấu</p>
            <div className="space-y-3">
              {challenges.map(c => (
                <ChallengeResultCard key={c.id} session={c} />
              ))}
              {challenges.length === 0 && (
                <div className="text-center py-10 text-app-text-muted">
                  <i className="ri-sword-line text-3xl mb-2 block"></i>
                  <p className="text-sm">Chưa có thách đấu nào. Tạo thách đấu đầu tiên!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* How it works */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-4">Cách thức hoạt động</p>
            <div className="space-y-4">
              {[
                { step: "1", icon: "ri-add-circle-line", color: "#e8c84a", title: "Tạo thách đấu", desc: "Chọn chủ đề và số câu hỏi, sau đó làm bài" },
                { step: "2", icon: "ri-share-line", color: "#34d399", title: "Chia sẻ link", desc: "Sao chép link và gửi cho bạn bè qua Zalo/Facebook" },
                { step: "3", icon: "ri-user-received-line", color: "#a78bfa", title: "Bạn bè tham gia", desc: "Bạn bè mở link và làm cùng bộ câu hỏi" },
                { step: "4", icon: "ri-trophy-line", color: "#fb923c", title: "So sánh điểm", desc: "Xem ai đúng nhiều hơn và nhanh hơn!" },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                  </div>
                  <div>
                    <p className="text-white/70 text-xs font-semibold">{s.title}</p>
                    <p className="text-app-text-muted text-[10px] mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* XP reward */}
          <div className="bg-[#a78bfa]/5 border border-[#a78bfa]/15 rounded-xl p-4">
            <p className="text-[#a78bfa] text-xs font-semibold mb-2">Phần thưởng XP</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-app-text-secondary">Tham gia thách đấu</span>
                <span className="text-[#a78bfa] font-bold">+20 XP</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-app-text-secondary">Mỗi câu đúng</span>
                <span className="text-[#a78bfa] font-bold">+5 XP</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-app-text-secondary">Thắng thách đấu</span>
                <span className="text-[#a78bfa] font-bold">+50 XP</span>
              </div>
            </div>
          </div>

          {/* My stats */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white font-semibold text-sm mb-3">Thống kê của bạn</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1.5 border-b border-app-border">
                <span className="text-app-text-secondary text-xs">Tổng thách đấu</span>
                <span className="text-white font-bold text-sm">{challenges.length}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-app-border">
                <span className="text-app-text-secondary text-xs">Thắng</span>
                <span className="text-app-accent-success font-bold text-sm">{wins}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-app-border">
                <span className="text-app-text-secondary text-xs">Thua</span>
                <span className="text-red-400 font-bold text-sm">{losses}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-app-text-secondary text-xs">Hòa</span>
                <span className="text-app-accent-primary font-bold text-sm">{draws}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


