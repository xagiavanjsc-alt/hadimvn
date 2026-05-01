import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
type ChallengeType = "quiz" | "listen" | "write";

interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  xpReward: number;
  timeLimit: number; // seconds
  icon: string;
  color: string;
  questions: ChallengeQuestion[];
}

interface ChallengeQuestion {
  id: string;
  korean: string;
  vietnamese: string;
  pronunciation: string;
  options?: string[];
  correctAnswer: string;
}

interface DailyRecord {
  date: string;
  completed: string[];
  totalXP: number;
  streak: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── XP Toast ─────────────────────────────────────────────────────────────────
function XPToast({ xp, onDone }: { xp: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg animate-bounce"
      style={{ backgroundColor: "#e8c84a", color: "#0f1117" }}>
      <i className="ri-star-fill text-xl"></i>
      <div>
        <p className="font-black text-lg">+{xp} XP</p>
        <p className="text-[11px] font-medium opacity-70">Thử thách hoàn thành!</p>
      </div>
    </div>
  );
}

// ─── Quiz Challenge ────────────────────────────────────────────────────────────
function QuizChallenge({ challenge, onComplete }: { challenge: Challenge; onComplete: (score: number) => void }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimit);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const q = challenge.questions[current];
  const totalQ = challenge.questions.length;

  const handleSelect = (opt: string) => {
    if (selected !== null) return;
    setSelected(opt);
    const correct = opt === q.correctAnswer;
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= totalQ) {
        clearInterval(timerRef.current!);
        setDone(true);
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
      }
    }, 800);
  };

  if (done) {
    const pct = Math.round((score / totalQ) * 100);
    const earned = Math.round(challenge.xpReward * (score / totalQ));
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        <div className="w-20 h-20 flex items-center justify-center rounded-full" style={{ backgroundColor: `${challenge.color}20` }}>
          <i className={`${pct >= 70 ? "ri-trophy-fill" : "ri-emotion-sad-line"} text-4xl`} style={{ color: challenge.color }}></i>
        </div>
        <div className="text-center">
          <p className="text-white font-black text-3xl mb-1">{pct}%</p>
          <p className="text-white/50 text-sm">{score}/{totalQ} câu đúng</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl" style={{ backgroundColor: `${challenge.color}15`, border: `1px solid ${challenge.color}30` }}>
          <i className="ri-star-fill" style={{ color: challenge.color }}></i>
          <span className="font-black text-xl" style={{ color: challenge.color }}>+{earned} XP</span>
        </div>
        <button
          onClick={() => onComplete(earned)}
          className="px-8 py-3 rounded-xl font-bold text-sm cursor-pointer whitespace-nowrap transition-all"
          style={{ backgroundColor: challenge.color, color: "#0f1117" }}
        >
          Nhận thưởng
        </button>
      </div>
    );
  }

  const timerPct = (timeLeft / challenge.timeLimit) * 100;
  const timerColor = timerPct > 50 ? "#34d399" : timerPct > 25 ? "#e8c84a" : "#f87171";

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress + Timer */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {challenge.questions.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full transition-all" style={{
              backgroundColor: i < current ? challenge.color : i === current ? challenge.color : "rgba(255,255,255,0.1)",
              opacity: i < current ? 0.5 : 1,
            }}></div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${timerPct}%`, backgroundColor: timerColor }}></div>
          </div>
          <span className="text-sm font-mono font-bold" style={{ color: timerColor }}>{timeLeft}s</span>
        </div>
      </div>

      {/* Question */}
      <div className="rounded-2xl p-6 mb-5 text-center" style={{ backgroundColor: `${challenge.color}08`, border: `1px solid ${challenge.color}15` }}>
        <p className="text-white/40 text-xs mb-2">Câu {current + 1}/{totalQ} — Chọn nghĩa đúng</p>
        <p className="text-white font-black text-4xl mb-2">{q.korean}</p>
        <p className="text-white/40 text-sm font-mono">{q.pronunciation}</p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {q.options?.map(opt => {
          const isSelected = selected === opt;
          const isCorrect = opt === q.correctAnswer;
          let bg = "rgba(255,255,255,0.04)";
          let border = "rgba(255,255,255,0.08)";
          let textColor = "rgba(255,255,255,0.7)";
          if (selected !== null) {
            if (isCorrect) { bg = "rgba(52,211,153,0.15)"; border = "rgba(52,211,153,0.4)"; textColor = "#34d399"; }
            else if (isSelected) { bg = "rgba(248,113,113,0.15)"; border = "rgba(248,113,113,0.4)"; textColor = "#f87171"; }
          }
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={selected !== null}
              className="p-4 rounded-xl text-sm font-medium text-left transition-all cursor-pointer"
              style={{ backgroundColor: bg, border: `1px solid ${border}`, color: textColor }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Write Challenge ───────────────────────────────────────────────────────────
function WriteChallenge({ challenge, onComplete }: { challenge: Challenge; onComplete: (score: number) => void }) {
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimit);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); setDone(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const q = challenge.questions[current];

  const handleSubmit = () => {
    const correct = input.trim().toLowerCase() === q.correctAnswer.toLowerCase();
    setResult(correct ? "correct" : "wrong");
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= challenge.questions.length) {
        clearInterval(timerRef.current!);
        setDone(true);
      } else {
        setCurrent(c => c + 1);
        setInput("");
        setResult(null);
      }
    }, 1000);
  };

  if (done) {
    const pct = Math.round((score / challenge.questions.length) * 100);
    const earned = Math.round(challenge.xpReward * (score / challenge.questions.length));
    return (
      <div className="flex flex-col items-center gap-6 py-10">
        <div className="w-20 h-20 flex items-center justify-center rounded-full" style={{ backgroundColor: `${challenge.color}20` }}>
          <i className={`${pct >= 70 ? "ri-trophy-fill" : "ri-emotion-sad-line"} text-4xl`} style={{ color: challenge.color }}></i>
        </div>
        <div className="text-center">
          <p className="text-white font-black text-3xl mb-1">{pct}%</p>
          <p className="text-white/50 text-sm">{score}/{challenge.questions.length} câu đúng</p>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 rounded-2xl" style={{ backgroundColor: `${challenge.color}15`, border: `1px solid ${challenge.color}30` }}>
          <i className="ri-star-fill" style={{ color: challenge.color }}></i>
          <span className="font-black text-xl" style={{ color: challenge.color }}>+{earned} XP</span>
        </div>
        <button onClick={() => onComplete(earned)} className="px-8 py-3 rounded-xl font-bold text-sm cursor-pointer whitespace-nowrap" style={{ backgroundColor: challenge.color, color: "#0f1117" }}>
          Nhận thưởng
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/40 text-sm">Câu {current + 1}/{challenge.questions.length}</span>
        <span className="text-sm font-mono font-bold" style={{ color: timeLeft > 30 ? "#34d399" : "#f87171" }}>{timeLeft}s</span>
      </div>
      <div className="rounded-2xl p-6 mb-5 text-center" style={{ backgroundColor: `${challenge.color}08`, border: `1px solid ${challenge.color}15` }}>
        <p className="text-white/40 text-xs mb-2">Viết nghĩa tiếng Việt của từ sau</p>
        <p className="text-white font-black text-4xl mb-2">{q.korean}</p>
        <p className="text-white/40 text-sm font-mono">{q.pronunciation}</p>
      </div>
      <div className="flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }}
          placeholder="Nhập nghĩa tiếng Việt..."
          disabled={result !== null}
          className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none"
          style={{
            backgroundColor: result === "correct" ? "rgba(52,211,153,0.1)" : result === "wrong" ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${result === "correct" ? "rgba(52,211,153,0.4)" : result === "wrong" ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.1)"}`,
            color: result === "correct" ? "#34d399" : result === "wrong" ? "#f87171" : "rgba(255,255,255,0.8)",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || result !== null}
          className="px-5 py-3 rounded-xl font-bold text-sm cursor-pointer whitespace-nowrap disabled:opacity-40"
          style={{ backgroundColor: challenge.color, color: "#0f1117" }}
        >
          Kiểm tra
        </button>
      </div>
      {result === "wrong" && (
        <p className="text-white/40 text-xs mt-2 text-center">Đáp án đúng: <span className="text-[#34d399] font-bold">{q.correctAnswer}</span></p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DailyChallengePageComponent() {
  const [dailyRecord, setDailyRecord] = useLocalStorage<DailyRecord>("kts_daily_challenge", {
    date: "",
    completed: [],
    totalXP: 0,
    streak: 0,
  });
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [showXPToast, setShowXPToast] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [xpData, setXpData] = useLocalStorage<{ total: number }>("kts_xp_total", { total: 0 });

  // Reset daily record if new day
  useEffect(() => {
    const today = todayStr();
    if (dailyRecord.date !== today) {
      const wasYesterday = dailyRecord.date === new Date(Date.now() - 86400000).toISOString().split("T")[0];
      setDailyRecord({
        date: today,
        completed: [],
        totalXP: 0,
        streak: wasYesterday ? dailyRecord.streak + 1 : 1,
      });
    }
  }, []);

  // Load vocab from Supabase and build challenges
  useEffect(() => {
    const today = todayStr();
    const seed = parseInt(today.replace(/-/g, ""), 10);
    const rng = seededRandom(seed);

    supabase
      .from("hanja_vocab_entries")
      .select("id, korean, vietnamese, pronunciation, category")
      .limit(60)
      .then(({ data }) => {
        if (!data || data.length < 10) return;

        // Shuffle with seeded random
        const shuffled = [...data].sort(() => rng() - 0.5);

        // Build quiz challenge (5 questions)
        const quizWords = shuffled.slice(0, 5);
        const allVietnamese = data.map(d => d.vietnamese);
        const quizQuestions: ChallengeQuestion[] = quizWords.map(w => {
          const wrongs = allVietnamese.filter(v => v !== w.vietnamese).sort(() => rng() - 0.5).slice(0, 3);
          const options = [w.vietnamese, ...wrongs].sort(() => rng() - 0.5);
          return { id: w.id, korean: w.korean, vietnamese: w.vietnamese, pronunciation: w.pronunciation, options, correctAnswer: w.vietnamese };
        });

        // Build write challenge (5 questions)
        const writeWords = shuffled.slice(5, 10);
        const writeQuestions: ChallengeQuestion[] = writeWords.map(w => ({
          id: w.id, korean: w.korean, vietnamese: w.vietnamese, pronunciation: w.pronunciation, correctAnswer: w.vietnamese,
        }));

        // Build listen challenge (5 questions — same as quiz but listen-themed)
        const listenWords = shuffled.slice(10, 15);
        const listenQuestions: ChallengeQuestion[] = listenWords.map(w => {
          const wrongs = allVietnamese.filter(v => v !== w.vietnamese).sort(() => rng() - 0.5).slice(0, 3);
          const options = [w.vietnamese, ...wrongs].sort(() => rng() - 0.5);
          return { id: w.id, korean: w.korean, vietnamese: w.vietnamese, pronunciation: w.pronunciation, options, correctAnswer: w.vietnamese };
        });

        setChallenges([
          {
            id: "quiz",
            type: "quiz",
            title: "Quiz Từ Vựng",
            description: "5 câu hỏi trắc nghiệm — chọn nghĩa đúng của từ tiếng Hàn",
            xpReward: 50,
            timeLimit: 90,
            icon: "ri-question-answer-line",
            color: "#e8c84a",
            questions: quizQuestions,
          },
          {
            id: "listen",
            type: "listen",
            title: "Nghe & Nhận Biết",
            description: "Nghe phát âm và chọn từ đúng — luyện tai nghe tiếng Hàn",
            xpReward: 60,
            timeLimit: 120,
            icon: "ri-headphone-line",
            color: "#34d399",
            questions: listenQuestions,
          },
          {
            id: "write",
            type: "write",
            title: "Viết Nghĩa",
            description: "Nhìn từ tiếng Hàn và viết nghĩa tiếng Việt — kiểm tra trí nhớ",
            xpReward: 80,
            timeLimit: 150,
            icon: "ri-edit-line",
            color: "#a78bfa",
            questions: writeQuestions,
          },
        ]);
      });
  }, []);

  const handleComplete = useCallback((xp: number) => {
    if (!activeChallenge) return;
    setDailyRecord(prev => ({
      ...prev,
      completed: [...prev.completed, activeChallenge.id],
      totalXP: prev.totalXP + xp,
    }));
    setXpData(prev => ({ total: (prev.total || 0) + xp }));
    setEarnedXP(xp);
    setShowXPToast(true);
    setActiveChallenge(null);
  }, [activeChallenge, setDailyRecord, setXpData]);

  const allDone = challenges.length > 0 && challenges.every(c => dailyRecord.completed.includes(c.id));
  const today = todayStr();
  const isToday = dailyRecord.date === today;

  if (activeChallenge) {
    return (
      <DashboardLayout title={activeChallenge.title} subtitle={activeChallenge.description}>
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-8">
            {activeChallenge.type === "quiz" || activeChallenge.type === "listen" ? (
              <QuizChallenge challenge={activeChallenge} onComplete={handleComplete} />
            ) : (
              <WriteChallenge challenge={activeChallenge} onComplete={handleComplete} />
            )}
          </div>
          <button
            onClick={() => setActiveChallenge(null)}
            className="mt-4 flex items-center gap-2 text-white/30 hover:text-white/60 text-sm cursor-pointer transition-colors"
          >
            <i className="ri-arrow-left-line"></i>Quay lại
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Thử thách hàng ngày"
      subtitle="Mỗi ngày 3 thử thách mới — hoàn thành để nhận XP"
    >
      {showXPToast && <XPToast xp={earnedXP} onDone={() => setShowXPToast(false)} />}

      {/* Header stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Streak hôm nay", value: `${dailyRecord.streak} ngày`, icon: "ri-fire-line", color: "#fb923c" },
          { label: "XP hôm nay", value: `+${isToday ? dailyRecord.totalXP : 0}`, icon: "ri-star-line", color: "#e8c84a" },
          { label: "Đã hoàn thành", value: `${isToday ? dailyRecord.completed.length : 0}/3`, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Thử thách còn lại", value: `${challenges.filter(c => !dailyRecord.completed.includes(c.id)).length}`, icon: "ri-timer-line", color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1117] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* All done banner */}
      {allDone && (
        <div className="mb-6 rounded-2xl p-5 flex items-center gap-4" style={{ background: "linear-gradient(135deg, rgba(232,200,74,0.15), rgba(52,211,153,0.1))", border: "1px solid rgba(232,200,74,0.2)" }}>
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#e8c84a]/20 flex-shrink-0">
            <i className="ri-trophy-fill text-2xl text-[#e8c84a]"></i>
          </div>
          <div>
            <p className="text-white font-bold text-base">Xuất sắc! Bạn đã hoàn thành tất cả thử thách hôm nay 🎉</p>
            <p className="text-white/50 text-sm">Tổng XP nhận được hôm nay: <span className="text-[#e8c84a] font-bold">+{dailyRecord.totalXP} XP</span></p>
          </div>
        </div>
      )}

      {/* Challenges */}
      {challenges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-2 border-[#e8c84a]/30 border-t-[#e8c84a] rounded-full animate-spin"></div>
          <p className="text-white/30 text-sm">Đang tạo thử thách hôm nay...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {challenges.map((c, idx) => {
            const isDone = isToday && dailyRecord.completed.includes(c.id);
            return (
              <div
                key={c.id}
                className="relative rounded-2xl border overflow-hidden transition-all"
                style={{
                  backgroundColor: isDone ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.02)",
                  borderColor: isDone ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.07)",
                }}
              >
                {isDone && (
                  <div className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-emerald-500/20">
                    <i className="ri-check-line text-emerald-400 text-sm"></i>
                  </div>
                )}

                <div className="p-5">
                  {/* Day badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${c.color}15` }}>
                      <i className={`${c.icon} text-xl`} style={{ color: c.color }}></i>
                    </div>
                    <div>
                      <p className="text-white/30 text-[10px] tracking-normal">Thử thách {idx + 1}</p>
                      <p className="text-white font-bold text-sm">{c.title}</p>
                    </div>
                  </div>

                  <p className="text-white/45 text-xs mb-4 leading-relaxed">{c.description}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5">
                      <i className="ri-timer-line text-white/30 text-xs"></i>
                      <span className="text-white/40 text-xs">{c.timeLimit}s</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ri-question-line text-white/30 text-xs"></i>
                      <span className="text-white/40 text-xs">{c.questions.length} câu</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <i className="ri-star-line text-xs" style={{ color: c.color }}></i>
                      <span className="text-xs font-bold" style={{ color: c.color }}>+{c.xpReward} XP</span>
                    </div>
                  </div>

                  <button
                    onClick={() => !isDone && setActiveChallenge(c)}
                    disabled={isDone}
                    className="w-full py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isDone ? "rgba(52,211,153,0.1)" : `${c.color}20`,
                      color: isDone ? "#34d399" : c.color,
                      border: `1px solid ${isDone ? "rgba(52,211,153,0.25)" : `${c.color}30`}`,
                    }}
                  >
                    {isDone ? "✓ Đã hoàn thành" : "Bắt đầu thử thách"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History hint */}
      <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/2">
        <div className="flex items-center gap-3">
          <i className="ri-information-line text-white/25 text-lg"></i>
          <div>
            <p className="text-white/50 text-sm">Thử thách được tạo mới mỗi ngày lúc 00:00</p>
            <p className="text-white/30 text-xs">Hoàn thành cả 3 thử thách để nhận tối đa <span className="text-[#e8c84a]">190 XP</span> mỗi ngày</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


