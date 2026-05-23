import { useState, useMemo, useCallback } from "react";
import { HanjaEntry } from "@/mocks/hanjaData";
import { useHanjaData } from "@/contexts/HanjaDataContext";

const SR_KEY = "hanja_sr_data";
const QUIZ_WRONG_KEY = "hanja_quiz_wrong";
const DIARY_KEY = "hanja_study_diary";

interface SRCard {
  korean: string;
  interval: number;
  easeFactor: number;
  dueDate: number;
  totalReviews: number;
  correctStreak: number;
}

interface WrongRecord {
  korean: string;
  wrongCount: number;
  lastWrong: string;
}

function loadSRData(): Record<string, SRCard> {
  try { return JSON.parse(localStorage.getItem(SR_KEY) || "{}"); } catch { return {}; }
}

function loadWrongRecords(): Record<string, WrongRecord> {
  try { return JSON.parse(localStorage.getItem(QUIZ_WRONG_KEY) || "{}"); } catch { return {}; }
}

function saveWrongRecord(korean: string) {
  const data = loadWrongRecords();
  const prev = data[korean] || { korean, wrongCount: 0, lastWrong: "" };
  data[korean] = { korean, wrongCount: prev.wrongCount + 1, lastWrong: new Date().toISOString() };
  localStorage.setItem(QUIZ_WRONG_KEY, JSON.stringify(data));
}

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR"; u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

type ReviewMode = "overview" | "session" | "done";

interface SessionCard {
  entry: HanjaEntry;
  reason: string;
  priority: number;
}

export default function SmartReviewTab() {
  const HANJA_DATA = useHanjaData();
  const [mode, setMode] = useState<ReviewMode>("overview");
  const [sessionCards, setSessionCards] = useState<SessionCard[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<{ correct: number; wrong: number }>({ correct: 0, wrong: 0 });
  const [wrongInSession, setWrongInSession] = useState<string[]>([]);

  const srData = useMemo(() => loadSRData(), [mode]);
  const wrongRecords = useMemo(() => loadWrongRecords(), [mode]);

  // Build smart review pool
  const smartPool = useMemo((): SessionCard[] => {
    const now = Date.now();
    const pool: SessionCard[] = [];
    const seen = new Set<string>();

    // 1. SR cards due today (highest priority)
    HANJA_DATA.forEach(entry => {
      if (seen.has(entry.korean)) return;
      const card = srData[entry.korean];
      if (!card) {
        pool.push({ entry, reason: "Từ mới chưa học", priority: 3 });
        seen.add(entry.korean);
      } else if (card.dueDate <= now) {
        const overdue = Math.floor((now - card.dueDate) / 86400000);
        pool.push({ entry, reason: overdue > 0 ? `Quá hạn ${overdue} ngày` : "Đến hạn ôn hôm nay", priority: overdue > 3 ? 10 : 8 });
        seen.add(entry.korean);
      }
    });

    // 2. Words with high wrong count in quiz
    Object.values(wrongRecords)
      .sort((a, b) => b.wrongCount - a.wrongCount)
      .slice(0, 20)
      .forEach(rec => {
        if (seen.has(rec.korean)) return;
        const entry = HANJA_DATA.find(e => e.korean === rec.korean);
        if (!entry) return;
        pool.push({ entry, reason: `Sai ${rec.wrongCount} lần trong quiz`, priority: Math.min(rec.wrongCount * 2, 9) });
        seen.add(rec.korean);
      });

    // 3. Low ease factor (hard words from SR)
    Object.values(srData)
      .filter(c => c.easeFactor < 1.8 && c.totalReviews >= 3)
      .sort((a, b) => a.easeFactor - b.easeFactor)
      .slice(0, 15)
      .forEach(card => {
        if (seen.has(card.korean)) return;
        const entry = HANJA_DATA.find(e => e.korean === card.korean);
        if (!entry) return;
        pool.push({ entry, reason: `Từ khó (ease: ${card.easeFactor.toFixed(1)})`, priority: 6 });
        seen.add(card.korean);
      });

    // Sort by priority desc, then shuffle within same priority
    return pool.sort((a, b) => b.priority - a.priority || Math.random() - 0.5);
  }, [srData, wrongRecords]);

  // Stats
  const stats = useMemo(() => {
    const dueToday = smartPool.filter(c => c.reason.includes("hôm nay") || c.reason.includes("Quá hạn")).length;
    const hardWords = smartPool.filter(c => c.reason.includes("Từ khó")).length;
    const quizWrong = smartPool.filter(c => c.reason.includes("Sai")).length;
    const newWords = smartPool.filter(c => c.reason.includes("mới")).length;
    return { dueToday, hardWords, quizWrong, newWords, total: smartPool.length };
  }, [smartPool]);

  const startSession = useCallback((count: number = 20) => {
    const cards = smartPool.slice(0, count);
    setSessionCards(cards);
    setIdx(0);
    setRevealed(false);
    setResults({ correct: 0, wrong: 0 });
    setWrongInSession([]);
    setMode("session");
  }, [smartPool]);

  const handleRate = (correct: boolean) => {
    const card = sessionCards[idx];
    if (!correct) {
      saveWrongRecord(card.entry.korean);
      setWrongInSession(prev => [...prev, card.entry.korean]);
    }
    setResults(prev => ({ correct: prev.correct + (correct ? 1 : 0), wrong: prev.wrong + (correct ? 0 : 1) }));

    // Update SR
    const srDataNow = loadSRData();
    const existing = srDataNow[card.entry.korean];
    const quality = correct ? 4 : 1;
    let interval = existing?.interval ?? 1;
    let easeFactor = existing?.easeFactor ?? 2.5;
    if (correct) {
      if (!existing) interval = 1;
      else if (existing.totalReviews === 1) interval = 6;
      else interval = Math.round(interval * easeFactor);
      easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    } else {
      interval = 1; easeFactor = Math.max(1.3, easeFactor - 0.2);
    }
    srDataNow[card.entry.korean] = {
      korean: card.entry.korean, interval, easeFactor,
      dueDate: Date.now() + interval * 86400000,
      totalReviews: (existing?.totalReviews ?? 0) + 1,
      correctStreak: correct ? (existing?.correctStreak ?? 0) + 1 : 0,
    };
    localStorage.setItem(SR_KEY, JSON.stringify(srDataNow));

    const next = idx + 1;
    if (next >= sessionCards.length) { setMode("done"); return; }
    setIdx(next);
    setRevealed(false);
  };

  // ── Overview ──────────────────────────────────────────────────────────────
  if (mode === "overview") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-white mb-1">Ôn tập thông minh</h2>
          <p className="text-sm text-white/50">Hệ thống tự động chọn từ cần ôn nhất dựa trên lịch sử học tập của bạn</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Đến hạn hôm nay", value: stats.dueToday, icon: "ri-calendar-check-line", color: "text-app-accent-primary", bg: "bg-app-accent-primary/10" },
            { label: "Từ sai nhiều nhất", value: stats.quizWrong, icon: "ri-close-circle-line", color: "text-red-400", bg: "bg-red-500/10" },
            { label: "Từ khó (SR)", value: stats.hardWords, icon: "ri-fire-line", color: "text-orange-400", bg: "bg-orange-500/10" },
            { label: "Từ mới chưa học", value: stats.newWords, icon: "ri-seedling-line", color: "text-green-400", bg: "bg-green-500/10" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
              <i className={`${s.icon} ${s.color} text-2xl block mb-1`}></i>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-white/50 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Start buttons */}
        <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5 mb-5">
          <h3 className="font-semibold text-white mb-3">Bắt đầu ôn tập</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              { count: 10, label: "Nhanh", sub: "10 từ · ~5 phút", color: "border-green-500/40 bg-green-500/10 text-green-400" },
              { count: 20, label: "Tiêu chuẩn", sub: "20 từ · ~10 phút", color: "border-amber-500/40 bg-amber-500/10 text-amber-400" },
              { count: Math.min(40, smartPool.length), label: "Toàn bộ", sub: `${Math.min(40, smartPool.length)} từ · ~20 phút`, color: "border-app-accent-primary/40 bg-app-accent-primary/10 text-app-accent-primary" },
            ].map(opt => (
              <button
                key={opt.count}
                onClick={() => startSession(opt.count)}
                disabled={smartPool.length === 0}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 ${opt.color}`}
              >
                <p className="font-bold text-lg">{opt.label}</p>
                <p className="text-xs opacity-70 mt-0.5">{opt.sub}</p>
              </button>
            ))}
          </div>
          {smartPool.length === 0 && (
            <p className="text-center text-sm text-green-400 py-2">
              <i className="ri-check-double-line mr-1"></i>Tuyệt vời! Không có từ nào cần ôn hôm nay.
            </p>
          )}
        </div>

        {/* Word list preview */}
        {smartPool.length > 0 && (
          <div className="bg-app-surface/50 border border-app-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-app-border flex items-center justify-between">
              <p className="text-sm font-semibold text-white/80">Danh sách từ cần ôn ({smartPool.length})</p>
              <span className="text-xs text-white/40">Sắp xếp theo độ ưu tiên</span>
            </div>
            <div className="divide-y divide-app-border max-h-80 overflow-y-auto">
              {smartPool.slice(0, 30).map((item, i) => {
                const priorityColor = item.priority >= 8 ? "text-app-accent-primary bg-app-accent-primary/10" : item.priority >= 6 ? "text-orange-400 bg-orange-500/10" : "text-amber-400 bg-amber-500/10";
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-app-surface/50 transition-colors">
                    <span className="text-xs text-white/40 w-5">{i + 1}</span>
                    <div className="flex-1">
                      <span className="font-bold text-white mr-2">{item.entry.korean}</span>
                      <span className="text-app-accent-primary font-bold text-sm mr-2">{item.entry.hanja}</span>
                      <span className="text-xs text-white/50">{item.entry.vietnamese}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColor}`}>
                      {item.reason}
                    </span>
                  </div>
                );
              })}
              {smartPool.length > 30 && (
                <div className="px-5 py-3 text-center text-xs text-white/40">
                  +{smartPool.length - 30} từ nữa...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  if (mode === "done") {
    const pct = Math.round((results.correct / sessionCards.length) * 100);
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-app-surface/50 border border-app-border rounded-2xl p-8 text-center">
          <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4 ${pct >= 80 ? "bg-green-500/20" : pct >= 50 ? "bg-amber-500/20" : "bg-red-500/20"}`}>
            <i className={`text-3xl ${pct >= 80 ? "ri-trophy-line text-green-400" : pct >= 50 ? "ri-emotion-normal-line text-amber-400" : "ri-emotion-sad-line text-red-400"}`}></i>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{pct}%</p>
          <p className="text-white/50 mb-2">Đúng {results.correct} / {sessionCards.length} từ</p>
          <p className="text-sm text-white/40 mb-5">
            {pct >= 80 ? "Xuất sắc! Bạn đang tiến bộ rất tốt!" : pct >= 50 ? "Khá tốt! Tiếp tục luyện tập nhé!" : "Cần ôn thêm! Những từ sai đã được ghi nhận."}
          </p>

          {wrongInSession.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-5 text-left">
              <p className="text-xs font-semibold text-red-400 mb-2">
                <i className="ri-close-circle-line mr-1"></i>Từ sai trong phiên này ({wrongInSession.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {wrongInSession.map(k => {
                  const entry = HANJA_DATA.find(e => e.korean === k);
                  return entry ? (
                    <span key={k} className="px-2 py-1 bg-app-surface/50 border border-red-500/30 rounded-lg text-xs text-red-400 font-medium">
                      {k} ({entry.vietnamese})
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => startSession(sessionCards.length)} className="flex-1 py-3 bg-app-accent-primary text-app-bg rounded-xl font-semibold cursor-pointer hover:bg-app-accent-primary/90 transition-colors">Ôn lại</button>
            <button onClick={() => setMode("overview")} className="flex-1 py-3 border border-app-border text-white/80 rounded-xl font-semibold cursor-pointer hover:bg-app-surface/50 transition-colors">Xem tổng quan</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Session ───────────────────────────────────────────────────────────────
  const current = sessionCards[idx];
  if (!current) return null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMode("overview")} className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 cursor-pointer">
          <i className="ri-arrow-left-line"></i> Dừng
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/50">{idx + 1}/{sessionCards.length}</span>
          <span className="text-xs text-green-400 font-medium">✓ {results.correct}</span>
          <span className="text-xs text-red-400 font-medium">✗ {results.wrong}</span>
        </div>
      </div>

      <div className="w-full bg-app-surface/50 rounded-full h-1.5 mb-5">
        <div className="bg-app-accent-primary h-1.5 rounded-full transition-all" style={{ width: `${(idx / sessionCards.length) * 100}%` }}></div>
      </div>

      {/* Priority badge */}
      <div className="flex justify-center mb-3">
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
          current.priority >= 8 ? "bg-app-accent-primary/20 text-app-accent-primary" :
          current.priority >= 6 ? "bg-orange-500/20 text-orange-400" :
          "bg-amber-500/20 text-amber-400"
        }`}>
          <i className="ri-information-line mr-1"></i>{current.reason}
        </span>
      </div>

      {/* Card */}
      <div className="bg-app-surface/50 border-2 border-app-border rounded-2xl p-8 text-center mb-4">
        <p className="text-4xl font-bold text-white mb-2">{current.entry.korean}</p>
        <p className="text-xl text-app-accent-primary font-bold mb-4">{current.entry.hanja}</p>
        <button
          onClick={() => speakKorean(current.entry.korean)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-app-surface/50 text-white/50 rounded-full text-xs cursor-pointer hover:bg-app-accent-primary/10 hover:text-app-accent-primary transition-colors mx-auto mb-4"
        >
          <i className="ri-volume-up-line"></i>Nghe phát âm
        </button>
        {!revealed ? (
          <button onClick={() => setRevealed(true)} className="px-6 py-2 bg-app-surface/50 text-white/70 rounded-lg text-sm cursor-pointer hover:bg-app-surface/80 transition-colors">
            Hiện nghĩa
          </button>
        ) : (
          <div className="border-t border-app-border pt-4">
            <p className="text-xl font-semibold text-white/80">{current.entry.vietnamese}</p>
          </div>
        )}
      </div>

      {revealed && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleRate(false)}
            className="p-4 rounded-xl border-2 border-red-500/40 bg-red-500/10 text-red-400 cursor-pointer hover:bg-red-500/20 transition-all text-center"
          >
            <i className="ri-close-line text-xl block mb-1"></i>
            <p className="font-bold">Chưa nhớ</p>
            <p className="text-xs opacity-70">Ôn lại sớm hơn</p>
          </button>
          <button
            onClick={() => handleRate(true)}
            className="p-4 rounded-xl border-2 border-green-500/40 bg-green-500/10 text-green-400 cursor-pointer hover:bg-green-500/20 transition-all text-center"
          >
            <i className="ri-check-line text-xl block mb-1"></i>
            <p className="font-bold">Đã nhớ</p>
            <p className="text-xs opacity-70">Khoảng cách tăng</p>
          </button>
        </div>
      )}
    </div>
  );
}

