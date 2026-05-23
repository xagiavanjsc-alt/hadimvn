import { useState, useMemo, useEffect, useCallback } from "react";
import { HANJA_DATA as HANJA_DATA_MOCK, HanjaEntry } from "@/mocks/hanjaData";
import { useHanjaData } from "@/contexts/HanjaDataContext";
import { STORAGE_KEYS } from "@/lib/storageKeys";

const WC_KEY = "hanja_weekly_challenge";
const SR_KEY = "hanja_sr_data";

interface WeeklyChallenge {
  weekId: string;          // "2026-W15"
  wordList: string[];      // 50 korean words
  learned: string[];       // words marked learned this week
  quizPassed: boolean;
  xpEarned: number;
  startDate: string;       // ISO date
  completedAt?: string;
}

function getWeekId(date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function getDaysLeft(): number {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  return daysUntilSunday;
}

function loadChallenge(): WeeklyChallenge | null {
  try { return JSON.parse(localStorage.getItem(WC_KEY) || "null"); } catch { return null; }
}

function saveChallenge(c: WeeklyChallenge) {
  localStorage.setItem(WC_KEY, JSON.stringify(c));
}

function pickWeeklyWords(weekId: string): string[] {
  // Deterministic shuffle based on weekId seed
  const seed = weekId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const shuffled = [...HANJA_DATA_MOCK].sort((a, b) => {
    const ha = (a.korean.charCodeAt(0) * seed) % 9973;
    const hb = (b.korean.charCodeAt(0) * seed) % 9973;
    return ha - hb;
  });
  return shuffled.slice(0, 50).map(e => e.korean);
}

function getMasteryLevel(korean: string, srData: Record<string, { interval: number }>): "new" | "learning" | "mastered" {
  const card = srData[korean];
  if (!card) return "new";
  if (card.interval >= 21) return "mastered";
  return "learning";
}

// ─── Mini Quiz for weekly challenge ──────────────────────────────────────────
function WeeklyQuiz({ words, onPass, onFail }: {
  words: HanjaEntry[];
  onPass: () => void;
  onFail: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const questions = useMemo(() => {
    return words.slice(0, 20).map(entry => {
      const others = words.filter(w => w.korean !== entry.korean);
      const choices = [...others.sort(() => Math.random() - 0.5).slice(0, 3), entry].sort(() => Math.random() - 0.5);
      return { entry, choices };
    });
  }, [words]);

  const current = questions[idx];

  const handleAnswer = (choice: HanjaEntry) => {
    if (answered) return;
    setSelected(choice.korean);
    setAnswered(true);
    if (choice.korean === current.entry.korean) setScore(s => s + 1);
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      setDone(true);
      return;
    }
    setIdx(i => i + 1);
    setAnswered(false);
    setSelected(null);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 70;
    return (
      <div className="text-center py-8">
        <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4 ${passed ? "bg-green-100" : "bg-red-100"}`}>
          <i className={`text-3xl ${passed ? "ri-trophy-line text-green-600" : "ri-emotion-sad-line text-red-500"}`}></i>
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{pct}%</p>
        <p className="text-gray-500 mb-2">Đúng {score}/{questions.length} câu</p>
        <p className={`text-sm font-semibold mb-6 ${passed ? "text-green-600" : "text-red-500"}`}>
          {passed ? "Xuất sắc! Bạn đã vượt thách thức tuần này!" : "Chưa đạt 70% — Hãy ôn thêm và thử lại!"}
        </p>
        <div className="flex gap-3 justify-center">
          {passed ? (
            <button onClick={onPass} className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold cursor-pointer hover:bg-green-600 transition-colors whitespace-nowrap">
              <i className="ri-gift-line mr-2"></i>Nhận XP Bonus!
            </button>
          ) : (
            <button onClick={onFail} className="px-6 py-3 bg-rose-500 text-white rounded-xl font-bold cursor-pointer hover:bg-rose-600 transition-colors whitespace-nowrap">
              Thử lại
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">Câu {idx + 1}/{questions.length}</span>
        <span className="text-sm font-semibold text-green-600">Đúng: {score}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
        <div className="bg-rose-400 h-2 rounded-full transition-all" style={{ width: `${(idx / questions.length) * 100}%` }}></div>
      </div>
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 text-center mb-4">
        <p className="text-xs text-gray-400 mb-2 tracking-wide">Từ tiếng Hàn này có nghĩa là gì?</p>
        <p className="text-4xl font-bold text-gray-900 mb-2">{current.entry.korean}</p>
        <p className="text-xl text-rose-400 font-bold">{current.entry.hanja}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {current.choices.map((choice, i) => {
          let cls = "border-2 border-gray-200 bg-white text-gray-700 hover:border-rose-300";
          if (answered) {
            if (choice.korean === current.entry.korean) cls = "border-2 border-green-400 bg-green-50 text-green-700";
            else if (choice.korean === selected) cls = "border-2 border-red-400 bg-red-50 text-red-700";
            else cls = "border-2 border-gray-100 bg-gray-50 text-gray-400";
          }
          return (
            <button key={i} onClick={() => handleAnswer(choice)} disabled={answered}
              className={`p-4 rounded-xl text-sm font-medium cursor-pointer transition-all text-left ${cls} disabled:cursor-default`}>
              {answered && choice.korean === current.entry.korean && <i className="ri-check-line text-green-600 mr-1"></i>}
              {answered && choice.korean === selected && choice.korean !== current.entry.korean && <i className="ri-close-line text-red-500 mr-1"></i>}
              {choice.vietnamese}
            </button>
          );
        })}
      </div>
      {answered && (
        <button onClick={next} className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-rose-600 transition-colors">
          {idx + 1 >= questions.length ? "Xem kết quả" : "Câu tiếp →"}
        </button>
      )}
    </div>
  );
}

// ─── Main WeeklyChallengeTab ──────────────────────────────────────────────────
export default function WeeklyChallengeTab() {
  const HANJA_DATA = useHanjaData();
  const weekId = getWeekId();
  const daysLeft = getDaysLeft();

  const [challenge, setChallenge] = useState<WeeklyChallenge>(() => {
    const saved = loadChallenge();
    if (saved && saved.weekId === weekId) return saved;
    // New week — create fresh challenge
    const wordList = pickWeeklyWords(weekId);
    const fresh: WeeklyChallenge = {
      weekId,
      wordList,
      learned: [],
      quizPassed: false,
      xpEarned: 0,
      startDate: new Date().toISOString().slice(0, 10),
    };
    saveChallenge(fresh);
    return fresh;
  });

  const [srData] = useState<Record<string, { interval: number }>>(() => {
    try { return JSON.parse(localStorage.getItem(SR_KEY) || "{}"); } catch { return {}; }
  });

  const [view, setView] = useState<"overview" | "study" | "quiz">("overview");
  const [studyIdx, setStudyIdx] = useState(0);
  const [studyFlipped, setStudyFlipped] = useState(false);
  const [showXpModal, setShowXpModal] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);

  const weekWords: HanjaEntry[] = useMemo(() =>
    challenge.wordList.map(k => HANJA_DATA.find(e => e.korean === k)).filter(Boolean) as HanjaEntry[],
    [challenge.wordList]
  );

  const learnedCount = challenge.learned.length;
  const totalWords = weekWords.length;
  const progressPct = Math.round((learnedCount / totalWords) * 100);

  const markLearned = useCallback((korean: string) => {
    setChallenge(prev => {
      if (prev.learned.includes(korean)) return prev;
      const updated = { ...prev, learned: [...prev.learned, korean] };
      saveChallenge(updated);
      return updated;
    });
  }, []);

  const handleQuizPass = () => {
    const xp = 500 + (learnedCount >= 50 ? 200 : learnedCount >= 40 ? 100 : 0);
    setEarnedXp(xp);
    setChallenge(prev => {
      const updated = { ...prev, quizPassed: true, xpEarned: xp, completedAt: new Date().toISOString() };
      saveChallenge(updated);
      return updated;
    });
    // Add XP to global store
    const currentXp = parseInt(localStorage.getItem(STORAGE_KEYS.XP_TOTAL) || "0");
    localStorage.setItem(STORAGE_KEYS.XP_TOTAL, String(currentXp + xp));
    setShowXpModal(true);
    setView("overview");
  };

  const handleQuizFail = () => {
    setView("overview");
  };

  const currentStudyWord = weekWords[studyIdx];

  // ─── XP Modal ───────────────────────────────────────────────────────────────
  if (showXpModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-10 text-center max-w-sm w-full mx-4 shadow-2xl">
          <div className="w-24 h-24 flex items-center justify-center bg-amber-100 rounded-full mx-auto mb-5">
            <i className="ri-trophy-fill text-amber-500 text-5xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thách thức hoàn thành!</h2>
          <p className="text-gray-500 mb-4">Bạn đã vượt qua thách thức tuần {weekId}</p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
            <p className="text-4xl font-bold text-amber-600">+{earnedXp} XP</p>
            <p className="text-sm text-amber-500 mt-1">Đã cộng vào tài khoản của bạn!</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-center">
            {[
              { label: "Từ đã học", value: learnedCount, color: "text-green-600" },
              { label: "Quiz đạt", value: "70%+", color: "text-rose-600" },
              { label: "Tuần", value: weekId.split("-")[1], color: "text-amber-600" },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <button onClick={() => setShowXpModal(false)}
            className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold cursor-pointer hover:bg-rose-600 transition-colors">
            Tuyệt vời!
          </button>
        </div>
      </div>
    );
  }

  // ─── Study Mode ─────────────────────────────────────────────────────────────
  if (view === "study") {
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setView("overview")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
            <i className="ri-arrow-left-line"></i>Quay lại
          </button>
          <span className="text-sm text-gray-500">{studyIdx + 1} / {weekWords.length}</span>
          <span className="text-xs text-green-600 font-medium">{learnedCount} đã học</span>
        </div>

        {/* Flashcard */}
        <div className="cursor-pointer" style={{ perspective: "1000px" }} onClick={() => setStudyFlipped(f => !f)}>
          <div style={{
            transition: "transform 0.5s",
            transformStyle: "preserve-3d",
            transform: studyFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            position: "relative",
            height: "220px"
          }}>
            <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
              className="absolute inset-0 bg-white border-2 border-gray-100 rounded-2xl flex flex-col items-center justify-center p-6">
              <p className="text-xs text-gray-400 tracking-normal mb-3">Tiếng Hàn</p>
              <p className="text-5xl font-bold text-gray-900 mb-2">{currentStudyWord?.korean}</p>
              <p className="text-2xl text-rose-400 font-bold">{currentStudyWord?.hanja}</p>
              <p className="text-xs text-gray-400 mt-3">Nhấn để xem nghĩa</p>
            </div>
            <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              className="absolute inset-0 bg-rose-50 border-2 border-rose-200 rounded-2xl flex flex-col items-center justify-center p-6">
              <p className="text-xs text-rose-400 tracking-normal mb-3">Nghĩa tiếng Việt</p>
              <p className="text-2xl font-bold text-rose-700 text-center">{currentStudyWord?.vietnamese}</p>
              <p className="text-lg text-rose-400 mt-2">{currentStudyWord?.hanja}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => {
              if (currentStudyWord) markLearned(currentStudyWord.korean);
              setStudyFlipped(false);
              setStudyIdx(i => Math.min(i + 1, weekWords.length - 1));
            }}
            className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-green-600 transition-colors whitespace-nowrap">
            <i className="ri-check-line mr-1"></i>Đã thuộc
          </button>
          <button
            onClick={() => {
              setStudyFlipped(false);
              setStudyIdx(i => Math.min(i + 1, weekWords.length - 1));
            }}
            className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 transition-colors whitespace-nowrap">
            Bỏ qua →
          </button>
        </div>

        {/* Word list mini */}
        <div className="mt-6 bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 mb-3">50 từ tuần này</p>
          <div className="flex flex-wrap gap-1.5">
            {weekWords.map((w, i) => (
              <button key={i} onClick={() => { setStudyIdx(i); setStudyFlipped(false); }}
                className={`px-2 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${i === studyIdx ? "bg-rose-500 text-white" : challenge.learned.includes(w.korean) ? "bg-green-100 text-green-700" : "bg-white text-gray-600 border border-gray-200"}`}>
                {w.korean}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Quiz Mode ───────────────────────────────────────────────────────────────
  if (view === "quiz") {
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setView("overview")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
            <i className="ri-arrow-left-line"></i>Quay lại
          </button>
          <span className="text-sm font-semibold text-rose-600">Quiz tuần {weekId}</span>
        </div>
        <WeeklyQuiz words={weekWords} onPass={handleQuizPass} onFail={handleQuizFail} />
      </div>
    );
  }

  // ─── Overview ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-rose-500 to-orange-400 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-40 h-40 bg-app-card/70 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute right-10 bottom-0 w-24 h-24 bg-app-card/50 rounded-full translate-y-1/2"></div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <i className="ri-sword-line text-white/80 text-lg"></i>
            <span className="text-white/80 text-sm font-medium">Thách thức hàng tuần</span>
            <span className="bg-app-border/200 text-white text-xs font-bold px-2 py-0.5 rounded-full">{weekId}</span>
          </div>
          <h2 className="text-2xl font-bold mb-1">Học 50 từ Hán-Hàn</h2>
          <p className="text-white/70 text-sm">Hoàn thành quiz đạt 70%+ để nhận XP bonus</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <i className="ri-time-line text-white/70"></i>
              <span className="text-sm">{daysLeft} ngày còn lại</span>
            </div>
            <div className="flex items-center gap-1.5">
              <i className="ri-star-fill text-amber-300"></i>
              <span className="text-sm font-bold">+500 XP bonus</span>
            </div>
            {learnedCount >= 50 && (
              <div className="flex items-center gap-1.5">
                <i className="ri-gift-line text-amber-300"></i>
                <span className="text-sm font-bold">+200 XP thêm!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-lg font-bold text-gray-900">{learnedCount} / {totalWords} từ đã học</p>
            <p className="text-sm text-gray-500">
              {learnedCount >= 50 ? "Hoàn thành! Sẵn sàng làm quiz!" : `Còn ${totalWords - learnedCount} từ nữa`}
            </p>
          </div>
          <div className="w-16 h-16 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f43f5e" strokeWidth="3"
                strokeDasharray={`${progressPct} ${100 - progressPct}`}
                strokeLinecap="round" />
            </svg>
            <span className="absolute text-sm font-bold text-rose-600">{progressPct}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div className="bg-rose-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Đã học", value: learnedCount, icon: "ri-check-double-line", color: "text-green-600", bg: "bg-green-50" },
          { label: "Chưa học", value: totalWords - learnedCount, icon: "ri-book-open-line", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "XP nhận được", value: challenge.xpEarned > 0 ? `+${challenge.xpEarned}` : "500+", icon: "ri-star-line", color: "text-rose-600", bg: "bg-rose-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <div className="w-8 h-8 flex items-center justify-center mx-auto mb-2">
              <i className={`${s.icon} ${s.color} text-xl`}></i>
            </div>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Completed badge */}
      {challenge.quizPassed && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
          <i className="ri-checkbox-circle-fill text-green-500 text-xl"></i>
          <div>
            <p className="text-green-700 font-semibold text-sm">Đã hoàn thành thách thức tuần này!</p>
            <p className="text-green-500 text-xs">Nhận +{challenge.xpEarned} XP · Quay lại tuần sau nhé!</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 mb-6">
        <button onClick={() => { setStudyIdx(0); setStudyFlipped(false); setView("study"); }}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-rose-500 text-white rounded-xl font-bold cursor-pointer hover:bg-rose-600 transition-colors whitespace-nowrap">
          <i className="ri-book-open-line"></i>
          {learnedCount === 0 ? "Bắt đầu học" : "Tiếp tục học"}
        </button>
        <button
          onClick={() => setView("quiz")}
          disabled={challenge.quizPassed}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold cursor-pointer transition-colors whitespace-nowrap ${challenge.quizPassed ? "bg-gray-100 text-gray-400 cursor-not-allowed" : learnedCount >= 20 ? "bg-amber-500 text-white hover:bg-amber-600" : "border-2 border-dashed border-gray-300 text-gray-400 cursor-not-allowed"}`}>
          <i className="ri-gamepad-line"></i>
          {challenge.quizPassed ? "Đã hoàn thành" : learnedCount >= 20 ? "Làm Quiz ngay!" : `Học thêm ${20 - learnedCount} từ`}
        </button>
      </div>

      {/* Word list */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">50 từ tuần {weekId}</h3>
          <span className="text-xs text-gray-400">{learnedCount} đã học</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 divide-x divide-y divide-gray-50">
          {weekWords.map((word, i) => {
            const isLearned = challenge.learned.includes(word.korean);
            const mastery = getMasteryLevel(word.korean, srData);
            return (
              <div key={i} className={`p-3 hover:bg-rose-50/30 transition-colors ${isLearned ? "bg-green-50/50" : ""}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{word.korean}</p>
                    <p className="text-xs text-rose-400 font-bold">{word.hanja}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{word.vietnamese}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isLearned && <i className="ri-check-line text-green-500 text-sm"></i>}
                    {mastery === "mastered" && <i className="ri-star-fill text-amber-400 text-xs"></i>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* XP breakdown */}
      <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-amber-700 mb-3 flex items-center gap-2">
          <i className="ri-star-line"></i>Cách nhận XP bonus
        </p>
        <div className="space-y-2">
          {[
            { label: "Hoàn thành quiz đạt 70%+", xp: "+500 XP", done: challenge.quizPassed },
            { label: "Học đủ 50 từ trong tuần", xp: "+200 XP", done: learnedCount >= 50 },
            { label: "Hoàn thành trước thứ 5", xp: "+100 XP", done: false },
          ].map(r => (
            <div key={r.label} className={`flex items-center justify-between text-sm ${r.done ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-2">
                <i className={`${r.done ? "ri-checkbox-circle-fill text-green-500" : "ri-circle-line text-amber-400"} text-sm`}></i>
                <span className="text-amber-700">{r.label}</span>
              </div>
              <span className="font-bold text-amber-600">{r.xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

