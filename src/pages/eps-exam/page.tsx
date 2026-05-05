import { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { useStudySync } from "@/hooks/useStudySync";
import { useXPSystem } from "@/hooks/useXPSystem";
import { epsQuestions } from "@/mocks/epsQuestions";
import { isExamTooFast, isInCooldown, MIN_EPS_EXAM_TIME_SEC } from "@/lib/xp";

interface ExamResult {
  id: string;
  date: string;
  score: number;
  total: number;
  timeUsed: number;
  correctIds: string[];
}

const EXAM_DURATION = 50 * 60; // 50 minutes in seconds
const EXAM_QUESTION_COUNT = 40;

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  utter.rate = 0.8;
  window.speechSynthesis.speak(utter);
}

// Shuffle array with seed
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ShareResultCard({ pct, correct, total, examResults }: { pct: number; correct: number; total: number; examResults: ExamResult[] }) {
  const [copied, setCopied] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const lastResult = examResults[examResults.length - 1];
  const timeUsed = lastResult?.timeUsed ?? 0;

  const grade = pct >= 80 ? "ĐẬU ✅" : pct >= 60 ? "Gần đậu 💪" : "Cần ôn thêm 📚";
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "🎯" : "📖";
  const shareText = `${emoji} Kết quả thi thử EPS-TOPIK trên Hàn Quốc Ơi!\n\n📊 Điểm: ${correct}/${total} câu đúng (${pct}%)\n⏱️ Thời gian: ${Math.floor(timeUsed / 60)} phút ${timeUsed % 60} giây\n🎖️ Đánh giá: ${grade}\n\n${pct >= 80 ? "Vượt ngưỡng điểm đậu EPS-TOPIK! Sẵn sàng thi thật rồi!" : "Đang ôn luyện mỗi ngày — cố lên nhé!"}\n\n#HànQuốcƠi #EPSTOPIK #HọcTiếngHàn #TàuLáChuối`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleZalo = () => {
    navigator.clipboard.writeText(shareText);
    window.open("https://zalo.me/", "_blank");
  };

  const gradeColor = pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171";
  const gradeBg = pct >= 80 ? "from-emerald-900/40 to-emerald-950/60" : pct >= 60 ? "from-amber-900/40 to-amber-950/60" : "from-red-900/30 to-red-950/50";

  return (
    <div className="rounded-2xl overflow-hidden border border-app-border">
      {/* Visual card preview */}
      <div className={`bg-gradient-to-br ${gradeBg} p-6 relative`}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('https://readdy.ai/api/search-image?query=Korean%20pattern%20subtle%20texture%20dark%20background&width=600&height=200&seq=share_bg1&orientation=landscape')", backgroundSize: "cover" }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-app-accent-primary/20 flex items-center justify-center">
                <i className="ri-leaf-line text-app-accent-primary text-sm"></i>
              </div>
              <span className="text-white/60 text-xs font-semibold">Hàn Quốc Ơi!</span>
            </div>
            <span className="text-app-text-muted text-xs">EPS-TOPIK Thi thử</span>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <p className="text-5xl font-extrabold" style={{ color: gradeColor }}>{pct}%</p>
              <p className="text-white/50 text-xs mt-1">{correct}/{total} câu đúng</p>
            </div>
            <div className="flex-1">
              <div className="h-3 bg-app-card/70 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: gradeColor }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-app-text-muted">
                <span>0%</span>
                <span style={{ color: gradeColor }}>Ngưỡng đậu 80%</span>
                <span>100%</span>
              </div>
              <p className="text-sm font-bold mt-2" style={{ color: gradeColor }}>{grade}</p>
              <p className="text-app-text-secondary text-xs">⏱️ {Math.floor(timeUsed / 60)} phút {timeUsed % 60} giây</p>
            </div>
          </div>
        </div>
      </div>

      {/* Share actions */}
      <div className="bg-app-bg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/60 text-sm font-semibold flex items-center gap-2">
            <i className="ri-share-line text-app-accent-primary"></i>
            Chia sẻ thành tích
          </p>
          <button
            onClick={() => setShowCard(!showCard)}
            className="text-app-text-muted hover:text-white/60 text-xs cursor-pointer"
          >
            {showCard ? "Ẩn nội dung" : "Xem nội dung chia sẻ"}
          </button>
        </div>

        {showCard && (
          <div className="bg-app-surface/50 rounded-xl p-3 mb-3 font-mono text-xs text-app-text-secondary leading-relaxed whitespace-pre-line border border-app-border">
            {shareText}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${copied ? "bg-emerald-500/20 text-app-accent-success border border-emerald-500/30" : "bg-app-card/50 hover:bg-app-card/70 text-white/60 border border-app-border"}`}
          >
            <i className={copied ? "ri-checkbox-circle-line" : "ri-clipboard-line"}></i>
            {copied ? "Đã copy!" : "Copy"}
          </button>
          <button
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=https://hanquocoi.com&quote=${encodeURIComponent(shareText)}`, "_blank", "width=600,height=400")}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1877f2]/15 hover:bg-[#1877f2]/25 text-[#1877f2] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border border-[#1877f2]/20"
          >
            <i className="ri-facebook-fill"></i>Facebook
          </button>
          <button
            onClick={handleZalo}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0068ff]/15 hover:bg-[#0068ff]/25 text-[#0068ff] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border border-[#0068ff]/20"
          >
            <i className="ri-message-2-line"></i>Zalo
          </button>
          <button
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank", "width=600,height=400")}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-app-card/50 hover:bg-app-card/70 text-white/50 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap border border-app-border"
          >
            <i className="ri-twitter-x-line"></i>X
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EpsExamPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { syncToCloud, updateLeaderboard } = useStudySync();
  const { awardXP } = useXPSystem();
  const [examResults, setExamResults] = useLocalStorage<ExamResult[]>("kts_eps_exam_history", []);
  const [mode, setMode] = useState<"intro" | "exam" | "result">("intro");
  const [syncing, setSyncing] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [showReview, setShowReview] = useState(false);
  const [examQuestions, setExamQuestions] = useState(epsQuestions.slice(0, EXAM_QUESTION_COUNT));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Pick 40 random questions
  const pickQuestions = useCallback(() => {
    const seed = Date.now();
    const shuffled = seededShuffle(epsQuestions, seed);
    return shuffled.slice(0, Math.min(EXAM_QUESTION_COUNT, shuffled.length));
  }, []);

  const startExam = useCallback(() => {
    // Anti-cheat: cooldown để chống spam
    const lastAt = parseInt(localStorage.getItem("kts_eps_exam_last_at") || "0", 10) || null;
    const { inCooldown, remainingSec } = isInCooldown(lastAt);
    if (inCooldown) {
      alert(`Vui lòng chờ ${remainingSec}s trước khi làm bài mới.`);
      return;
    }
    const qs = pickQuestions();
    setExamQuestions(qs);
    setAnswers({});
    setCurrentIdx(0);
    setTimeLeft(EXAM_DURATION);
    setFlagged(new Set());
    setShowReview(false);
    startTimeRef.current = Date.now();
    setMode("exam");
  }, [pickQuestions]);

  // Timer
  useEffect(() => {
    if (mode !== "exam") return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          submitExam();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [mode]);

  const submitExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const timeUsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    const correctIds = examQuestions.filter(q => answers[q.id] === q.correctIndex).map(q => q.id);

    // Anti-cheat: nếu submit quá nhanh → kết quả vẫn lưu nhưng KHÔNG cộng XP,
    // không sync leaderboard. Người dùng thấy kết quả nhưng không ảnh hưởng rank.
    const tooFast = isExamTooFast(timeUsed, examQuestions.length);

    const result: ExamResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      score: correctIds.length,
      total: examQuestions.length,
      timeUsed,
      correctIds,
    };
    setExamResults(prev => [...prev, result]);

    if (tooFast) {
      // Vẫn hiển thị kết quả, nhưng cảnh báo và không thưởng XP
      setMode("result");
      return;
    }

    // Ghi timestamp cooldown — ngăn spam submit liên tiếp
    localStorage.setItem("kts_eps_exam_last_at", String(Date.now()));

    // Auto-sync to cloud after valid exam
    if (user) {
      setSyncing(true);
      const displayName = profile?.display_name || user.email?.split("@")[0] || "Học viên";
      Promise.all([
        syncToCloud(user.id),
        updateLeaderboard(user.id, displayName),
      ]).finally(() => setSyncing(false));
    }

    // Award XP only for legitimate exam
    // Formula: base 15 XP + up to 35 XP based on score (total max 50 XP/exam)
    const scorePct = Math.round((correctIds.length / examQuestions.length) * 100);
    const examXP = 15 + Math.round((scorePct / 100) * 35);
    awardXP({ type: "eps_exam_completed", amount: examXP });

    // Award eps_pass badge if score >= 40% (EPS-TOPIK real passing threshold)
    if (scorePct >= 40) {
      awardXP({ type: "manual_bonus", amount: 0, meta: { badge: "eps_pass", score: scorePct } });
    }
    // Award perfect_score badge if 100%
    if (scorePct === 100) {
      awardXP({ type: "manual_bonus", amount: 50, meta: { badge: "perfect_score" } });
    }
    setMode("result");
  }, [examQuestions, answers, setExamResults, user, profile, syncToCloud, updateLeaderboard, awardXP]);

  const currentQ = examQuestions[currentIdx];
  const answeredCount = Object.keys(answers).length;
  const progressPct = (answeredCount / examQuestions.length) * 100;

  const timeColor = timeLeft < 300 ? "#f87171" : timeLeft < 600 ? "#fb923c" : "#34d399";
  const timeStr = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

  // Result stats
  const resultStats = useMemo(() => {
    if (mode !== "result") return null;
    const correct = examQuestions.filter(q => answers[q.id] === q.correctIndex).length;
    const pct = Math.round((correct / examQuestions.length) * 100);
    const byTopic: Record<string, { correct: number; total: number }> = {};
    examQuestions.forEach(q => {
      if (!byTopic[q.topic]) byTopic[q.topic] = { correct: 0, total: 0 };
      byTopic[q.topic].total += 1;
      if (answers[q.id] === q.correctIndex) byTopic[q.topic].correct += 1;
    });
    return { correct, pct, byTopic };
  }, [mode, examQuestions, answers]);

  const topicLabels: Record<string, string> = {
    greeting: "Giao tiếp", safety: "An toàn LĐ", culture: "Văn hóa",
    workplace: "Nơi làm việc", daily: "Sinh hoạt", emergency: "Khẩn cấp",
    listening: "Nghe hiểu", reading: "Đọc hiểu", law: "Pháp luật",
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (mode === "intro") {
    return (
      <DashboardLayout title="Thi thử EPS-TOPIK" subtitle="Mô phỏng đề thi thật — 40 câu · 50 phút">
        <div className="max-w-2xl mx-auto">
          {/* Exam info */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 mb-5">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-app-accent-primary/10 mx-auto mb-5">
              <i className="ri-file-list-3-line text-app-accent-primary text-2xl"></i>
            </div>
            <h2 className="text-white font-bold text-xl text-center mb-2">Đề thi thử EPS-TOPIK</h2>
            <p className="text-app-text-secondary text-sm text-center mb-6">Câu hỏi được chọn ngẫu nhiên từ ngân hàng đề. Làm bài nghiêm túc như thi thật!</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { icon: "ri-survey-line", color: "app-accent-primary", label: "Số câu hỏi", value: `${Math.min(EXAM_QUESTION_COUNT, epsQuestions.length)} câu` },
                { icon: "ri-timer-line", color: "#34d399", label: "Thời gian", value: "50 phút" },
                { icon: "ri-trophy-line", color: "#a78bfa", label: "Điểm đậu", value: "≥ 80/200" },
              ].map(item => (
                <div key={item.label} className="bg-app-surface/50 rounded-xl p-4 text-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${item.color}15` }}>
                    <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
                  </div>
                  <p className="text-white font-bold text-sm">{item.value}</p>
                  <p className="text-app-text-muted text-[10px] mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4 mb-6">
              <p className="text-app-accent-primary/80 text-xs font-semibold mb-2">Lưu ý trước khi thi</p>
              <ul className="space-y-1.5">
                {[
                  "Câu hỏi được chọn ngẫu nhiên từ tất cả chủ đề",
                  "Có thể đánh dấu câu để xem lại sau",
                  "Hết giờ sẽ tự động nộp bài",
                  "Kết quả được lưu vào hồ sơ học viên",
                ].map(note => (
                  <li key={note} className="flex items-start gap-2 text-app-text-secondary text-xs">
                    <i className="ri-checkbox-circle-line text-app-accent-primary/50 flex-shrink-0 mt-0.5"></i>
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={startExam}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-base transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-play-circle-line text-lg"></i>
              Bắt đầu thi ngay
            </button>
          </div>

          {/* Past results */}
          {examResults.length > 0 && (
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Lịch sử thi ({examResults.length} lần)</h3>
              <div className="space-y-2" style={{ contentVisibility: "auto", containIntrinsicSize: "0 300px" }}>
                {examResults.slice(-5).reverse().map((r, i) => {
                  const pct = Math.round((r.score / r.total) * 100);
                  const color = pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#f87171";
                  return (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-app-surface/50 rounded-xl">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                        <span className="text-sm font-bold" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-white/70 text-xs font-medium">{r.score}/{r.total} câu đúng</p>
                        <p className="text-app-text-muted text-[10px]">{new Date(r.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })} · {Math.floor(r.timeUsed / 60)} phút {r.timeUsed % 60} giây</p>
                      </div>
                      <div className="w-20 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ── EXAM ───────────────────────────────────────────────────────────────────
  if (mode === "exam" && currentQ) {
    return (
      <DashboardLayout
        title="Thi thử EPS-TOPIK"
        subtitle={`Câu ${currentIdx + 1}/${examQuestions.length}`}
      >
        {/* Mobile sticky timer bar */}
        <div className="md:hidden sticky top-0 z-30 bg-app-bg border-b border-app-border px-3 py-2 flex items-center gap-2 shadow-lg">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono font-bold text-sm flex-shrink-0" style={{ borderColor: `${timeColor}40`, backgroundColor: `${timeColor}12`, color: timeColor }}>
            <i className="ri-timer-line text-xs"></i>
            {timeStr}
          </div>
          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
            <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progressPct}%`, backgroundColor: "app-accent-primary" }} />
            </div>
            <span className="text-white/35 text-[10px]">{answeredCount}/{examQuestions.length} câu · Câu {currentIdx + 1}</span>
          </div>
          <button
            onClick={() => setShowReview(!showReview)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${showReview ? "bg-app-accent-primary/15 text-app-accent-primary" : "bg-app-card/50 text-white/50"}`}
          >
            <i className="ri-list-check-2 text-xs"></i>
            <span>DS</span>
          </button>
          <button
            onClick={submitExam}
            className="flex items-center gap-1 bg-app-accent-primary text-app-bg font-bold text-xs px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap flex-shrink-0"
          >
            <i className="ri-send-plane-line text-xs"></i>
            Nộp
          </button>
        </div>

        {/* Desktop actions bar */}
        <div className="hidden md:flex items-center gap-3 px-8 py-3 bg-app-bg border-b border-app-border">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm" style={{ borderColor: `${timeColor}30`, backgroundColor: `${timeColor}10`, color: timeColor }}>
            <i className="ri-timer-line"></i>
            {timeStr}
          </div>
          <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-app-accent-primary transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-app-text-secondary text-sm">{answeredCount}/{examQuestions.length} đã trả lời</span>
          <button
            onClick={() => setShowReview(!showReview)}
            className="flex items-center gap-2 bg-app-card/50 hover:bg-white/8 text-white/60 text-sm px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-list-check-2"></i>
            Xem lại
          </button>
          <button
            onClick={submitExam}
            className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-send-plane-line"></i>
            Nộp bài
          </button>
        </div>

        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-4 md:gap-5 max-w-5xl mx-auto">
            {/* Main question */}
            <div className="space-y-4">
              {/* Question card */}
              <div className="bg-app-bg border border-app-border rounded-2xl p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-app-text-muted text-xs font-mono">Câu {currentIdx + 1}</span>
                  <button
                    onClick={() => setFlagged(prev => {
                      const next = new Set(prev);
                      if (next.has(currentQ.id)) next.delete(currentQ.id);
                      else next.add(currentQ.id);
                      return next;
                    })}
                    className={`ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${flagged.has(currentQ.id) ? "bg-[#fb923c]/15 text-[#fb923c]" : "bg-app-card/50 text-app-text-muted hover:text-white/50"}`}
                  >
                    <i className={flagged.has(currentQ.id) ? "ri-flag-fill" : "ri-flag-line"}></i>
                    <span className="hidden sm:inline">{flagged.has(currentQ.id) ? "Đã đánh dấu" : "Đánh dấu"}</span>
                  </button>
                  {currentQ.audioText && (
                    <button
                      onClick={() => speakKorean(currentQ.audioText!)}
                      className="flex items-center gap-1.5 text-xs bg-app-card/50 hover:bg-white/8 text-app-text-muted hover:text-white/60 px-2.5 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-volume-up-line"></i>
                      <span className="hidden sm:inline">Nghe</span>
                    </button>
                  )}
                </div>

                <p className="text-white font-semibold text-sm leading-relaxed mb-1">{currentQ.question}</p>
                <p className="text-app-text-secondary text-xs leading-relaxed italic mb-5">{currentQ.questionVi}</p>

                <div className="space-y-2">
                  {currentQ.options.map((opt, i) => {
                    const isSelected = answers[currentQ.id] === i;
                    return (
                      <button
                        key={i}
                        onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: i }))}
                        className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border transition-all text-left cursor-pointer ${isSelected ? "border-app-accent-primary/40 bg-app-accent-primary/8" : "border-app-border bg-app-surface/50 hover:border-white/15 hover:bg-app-card/50"}`}
                      >
                        <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold flex-shrink-0 mt-0.5 ${isSelected ? "bg-app-accent-primary/20 text-app-accent-primary" : "bg-app-card/50 text-app-text-muted"}`}>
                          {["A", "B", "C", "D"][i]}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isSelected ? "text-app-accent-primary" : "text-white/70"}`}>{opt}</p>
                          <p className="text-app-text-muted text-[10px] mt-0.5">{currentQ.optionsVi[i]}</p>
                        </div>
                        {isSelected && <i className="ri-checkbox-circle-fill text-app-accent-primary flex-shrink-0 mt-0.5"></i>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                  disabled={currentIdx === 0}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-app-border text-white/50 text-sm hover:bg-app-card/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-arrow-left-line"></i>
                  <span className="hidden sm:inline">Câu trước</span>
                </button>
                <div className="flex-1 text-center text-app-text-muted text-xs">
                  {answers[currentQ.id] !== undefined ? (
                    <span className="text-app-accent-primary/60">Đã trả lời</span>
                  ) : (
                    <span>Chưa trả lời</span>
                  )}
                </div>
                <button
                  onClick={() => setCurrentIdx(i => Math.min(examQuestions.length - 1, i + 1))}
                  disabled={currentIdx === examQuestions.length - 1}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-app-accent-primary/10 hover:bg-app-accent-primary/20 text-app-accent-primary text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span className="hidden sm:inline">Câu tiếp</span>
                  <i className="ri-arrow-right-line"></i>
                </button>
              </div>

              {/* Mobile question grid (collapsible) — triggered from sticky bar too */}
              <div className="md:hidden">
                {showReview && (
                  <div className="bg-app-bg border border-app-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-white/50 text-xs font-medium">Danh sách câu hỏi</p>
                      <button onClick={() => setShowReview(false)} className="w-6 h-6 flex items-center justify-center rounded-md bg-app-card/50 text-app-text-secondary cursor-pointer">
                        <i className="ri-close-line text-xs"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-8 gap-1.5 mb-3">
                      {examQuestions.map((q, i) => {
                        const isAnswered = answers[q.id] !== undefined;
                        const isCurrent = i === currentIdx;
                        const isFlagged = flagged.has(q.id);
                        return (
                          <button
                            key={q.id}
                            onClick={() => { setCurrentIdx(i); setShowReview(false); }}
                            className={`h-8 rounded-lg text-[10px] font-bold transition-all cursor-pointer relative ${
                              isCurrent ? "bg-app-accent-primary text-app-bg"
                              : isAnswered ? "bg-emerald-500/20 text-app-accent-success"
                              : "bg-app-card/50 text-app-text-muted hover:bg-white/8"
                            }`}
                          >
                            {i + 1}
                            {isFlagged && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#fb923c]"></span>}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4 pt-2 border-t border-app-border">
                      <div className="flex items-center gap-1.5 text-[10px] text-app-text-muted">
                        <div className="w-3 h-3 rounded bg-emerald-500/20"></div>{answeredCount} đã trả lời
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-app-text-muted">
                        <div className="w-3 h-3 rounded bg-app-card/50"></div>{examQuestions.length - answeredCount} chưa trả lời
                      </div>
                      {flagged.size > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] text-app-text-muted">
                          <div className="w-3 h-3 rounded bg-[#fb923c]/20"></div>{flagged.size} đánh dấu
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop sidebar panel */}
            <div className="hidden md:block space-y-4">
              <div className="bg-app-bg border border-app-border rounded-2xl p-4">
                <p className="text-app-text-secondary text-xs font-medium mb-3">Danh sách câu hỏi</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {examQuestions.map((q, i) => {
                    const isAnswered = answers[q.id] !== undefined;
                    const isCurrent = i === currentIdx;
                    const isFlagged = flagged.has(q.id);
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(i)}
                        className={`h-8 rounded-lg text-[10px] font-bold transition-all cursor-pointer relative ${
                          isCurrent ? "bg-app-accent-primary text-app-bg"
                          : isAnswered ? "bg-emerald-500/20 text-app-accent-success"
                          : "bg-app-card/50 text-app-text-muted hover:bg-white/8"
                        }`}
                      >
                        {i + 1}
                        {isFlagged && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#fb923c]"></span>}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-app-border space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-app-text-muted">
                    <div className="w-3 h-3 rounded bg-emerald-500/20"></div>Đã trả lời ({answeredCount})
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-app-text-muted">
                    <div className="w-3 h-3 rounded bg-app-card/50"></div>Chưa trả lời ({examQuestions.length - answeredCount})
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-app-text-muted">
                    <div className="w-3 h-3 rounded bg-[#fb923c]/30 relative"><span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#fb923c]"></span></div>Đánh dấu ({flagged.size})
                  </div>
                </div>
              </div>
              <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
                <p className="text-app-text-muted text-xs mb-1">Thời gian còn lại</p>
                <p className="font-mono font-bold text-3xl" style={{ color: timeColor }}>{timeStr}</p>
                <div className="mt-2 h-1 bg-app-card/50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${(timeLeft / EXAM_DURATION) * 100}%`, backgroundColor: timeColor }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (mode === "result" && resultStats) {
    const { correct, pct, byTopic } = resultStats;
    const grade = pct >= 80 ? { label: "Đậu!", color: "#34d399", icon: "ri-trophy-line", desc: "Xuất sắc! Bạn đã vượt ngưỡng điểm đậu EPS-TOPIK." }
      : pct >= 60 ? { label: "Gần đậu", color: "app-accent-primary", icon: "ri-medal-line", desc: "Khá tốt! Cần ôn thêm một chút để đạt điểm đậu." }
      : { label: "Cần ôn thêm", color: "#f87171", icon: "ri-refresh-line", desc: "Hãy ôn luyện thêm các chủ đề yếu và thử lại." };

    const lastResult = examResults[examResults.length - 1];
    const timeUsed = lastResult?.timeUsed ?? 0;
    const flaggedTooFast = isExamTooFast(timeUsed, examQuestions.length);

    return (
      <DashboardLayout title="Kết quả thi thử EPS-TOPIK" subtitle="Phân tích chi tiết kết quả bài thi">
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Anti-cheat warning */}
          {flaggedTooFast && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
              <i className="ri-error-warning-line text-amber-400 text-xl flex-shrink-0 mt-0.5"></i>
              <div>
                <p className="text-amber-300 text-sm font-semibold mb-1">Bài thi không hợp lệ</p>
                <p className="text-amber-200/70 text-xs leading-relaxed">
                  Thời gian làm bài quá ngắn (dưới {MIN_EPS_EXAM_TIME_SEC}s cho {examQuestions.length} câu).
                  Kết quả vẫn được lưu để bạn xem lại, nhưng <strong>không được cộng XP</strong> và
                  <strong> không đưa lên bảng xếp hạng</strong>. Hãy làm bài nghiêm túc để có kết quả chính xác.
                </p>
              </div>
            </div>
          )}

          {/* Score hero */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: `${grade.color}15` }}>
              <i className={`${grade.icon} text-3xl`} style={{ color: grade.color }}></i>
            </div>
            <h2 className="text-white font-bold text-2xl mb-1">{grade.label}</h2>
            <p className="text-app-text-secondary text-sm mb-5">{grade.desc}</p>

            <div className="flex items-center justify-center gap-8 mb-5">
              <div>
                <p className="font-bold text-4xl" style={{ color: grade.color }}>{pct}%</p>
                <p className="text-app-text-muted text-xs mt-1">Tỷ lệ đúng</p>
              </div>
              <div className="w-px h-12 bg-app-card/70"></div>
              <div>
                <p className="text-white font-bold text-4xl">{correct}<span className="text-app-text-muted text-xl">/{examQuestions.length}</span></p>
                <p className="text-app-text-muted text-xs mt-1">Câu đúng</p>
              </div>
              <div className="w-px h-12 bg-app-card/70"></div>
              <div>
                <p className="text-white font-bold text-2xl">{Math.floor(timeUsed / 60)}:{String(timeUsed % 60).padStart(2, "0")}</p>
                <p className="text-app-text-muted text-xs mt-1">Thời gian làm</p>
              </div>
            </div>

            <div className="w-full h-3 bg-app-card/50 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: grade.color }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-app-text-muted">
              <span>0%</span>
              <span className="text-app-accent-primary">Ngưỡng đậu: 80%</span>
              <span>100%</span>
            </div>
          </div>

          {/* By topic */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">Kết quả theo chủ đề</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(byTopic).map(([topicId, data]) => {
                const topicPct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                const color = topicPct >= 80 ? "#34d399" : topicPct >= 60 ? "app-accent-primary" : "#f87171";
                return (
                  <div key={topicId} className="bg-app-surface/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-xs font-medium">{topicLabels[topicId] ?? topicId}</span>
                      <span className="text-xs font-bold" style={{ color }}>{topicPct}%</span>
                    </div>
                    <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden mb-1">
                      <div className="h-full rounded-full" style={{ width: `${topicPct}%`, backgroundColor: color }} />
                    </div>
                    <p className="text-app-text-muted text-[10px]">{data.correct}/{data.total} câu đúng</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review wrong answers */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4">
              Câu trả lời sai ({examQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.correctIndex).length} câu)
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1" style={{ contentVisibility: "auto", containIntrinsicSize: "0 320px" }}>
              {examQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.correctIndex).map((q, i) => (
                <div key={q.id} className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                  <p className="text-white/70 text-xs font-medium mb-1">{i + 1}. {q.questionVi}</p>
                  <div className="flex items-center gap-2 text-[10px] mt-2">
                    <span className="text-red-400/70">Bạn chọn: {q.optionsVi[answers[q.id]]}</span>
                    <span className="text-app-text-muted">·</span>
                    <span className="text-app-accent-success/70">Đáp án: {q.optionsVi[q.correctIndex]}</span>
                  </div>
                </div>
              ))}
              {examQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== q.correctIndex).length === 0 && (
                <p className="text-app-text-muted text-sm text-center py-4">Không có câu sai nào!</p>
              )}
            </div>
          </div>

          {/* Cloud sync indicator */}
          {user && (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs ${syncing ? "bg-app-accent-primary/5 border-app-accent-primary/15 text-app-accent-primary/70" : "bg-emerald-500/5 border-emerald-500/15 text-app-accent-success/70"}`}>
              <i className={`${syncing ? "ri-loader-4-line animate-spin" : "ri-cloud-line"} text-sm`}></i>
              {syncing ? "Đang đồng bộ kết quả lên cloud..." : "Kết quả đã được lưu lên cloud và cập nhật bảng xếp hạng!"}
            </div>
          )}

          {/* Share result card */}
          <ShareResultCard pct={resultStats.pct} correct={resultStats.correct} total={examQuestions.length} examResults={examResults} />

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-app-border text-white/60 text-sm hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-user-line"></i>
              Xem hồ sơ
            </button>
            <button
              onClick={() => navigate("/progress")}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-app-border text-white/60 text-sm hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-radar-line"></i>
              So sánh tiến độ
            </button>
            <button
              onClick={startExam}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refresh-line"></i>
              Thi lại
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return null;
}

