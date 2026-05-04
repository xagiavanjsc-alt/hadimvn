import { useState, useMemo, useCallback } from "react";
import { HANJA_DATA, HanjaEntry } from "@/mocks/hanjaData";

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
        pool.push({ entry, reason: "T? m?i chua h?c", priority: 3 });
        seen.add(entry.korean);
      } else if (card.dueDate <= now) {
        const overdue = Math.floor((now - card.dueDate) / 86400000);
        pool.push({ entry, reason: overdue > 0 ? `Quá h?n ${overdue} ngày` : "Ð?n h?n ôn hôm nay", priority: overdue > 3 ? 10 : 8 });
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
        pool.push({ entry, reason: `Sai ${rec.wrongCount} l?n trong quiz`, priority: Math.min(rec.wrongCount * 2, 9) });
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
        pool.push({ entry, reason: `T? khó (ease: ${card.easeFactor.toFixed(1)})`, priority: 6 });
        seen.add(card.korean);
      });

    // Sort by priority desc, then shuffle within same priority
    return pool.sort((a, b) => b.priority - a.priority || Math.random() - 0.5);
  }, [srData, wrongRecords]);

  // Stats
  const stats = useMemo(() => {
    const dueToday = smartPool.filter(c => c.reason.includes("hôm nay") || c.reason.includes("Quá h?n")).length;
    const hardWords = smartPool.filter(c => c.reason.includes("T? khó")).length;
    const quizWrong = smartPool.filter(c => c.reason.includes("Sai")).length;
    const newWords = smartPool.filter(c => c.reason.includes("m?i")).length;
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

  // -- Overview --------------------------------------------------------------
  if (mode === "overview") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Ôn t?p thông minh</h2>
          <p className="text-sm text-gray-500">H? th?ng t? d?ng ch?n t? c?n ôn nh?t d?a trên l?ch s? h?c t?p c?a b?n</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Ð?n h?n hôm nay", value: stats.dueToday, icon: "ri-calendar-check-line", color: "text-rose-600", bg: "bg-rose-50" },
            { label: "T? sai nhi?u nh?t", value: stats.quizWrong, icon: "ri-close-circle-line", color: "text-red-600", bg: "bg-red-50" },
            { label: "T? khó (SR)", value: stats.hardWords, icon: "ri-fire-line", color: "text-orange-600", bg: "bg-orange-50" },
            { label: "T? m?i chua h?c", value: stats.newWords, icon: "ri-seedling-line", color: "text-green-600", bg: "bg-green-50" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
              <i className={`${s.icon} ${s.color} text-2xl block mb-1`}></i>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Start buttons */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">
          <h3 className="font-semibold text-gray-900 mb-3">B?t d?u ôn t?p</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              { count: 10, label: "Nhanh", sub: "10 t? · ~5 phút", color: "border-green-300 bg-green-50 text-green-700" },
              { count: 20, label: "Tiêu chu?n", sub: "20 t? · ~10 phút", color: "border-amber-300 bg-amber-50 text-amber-700" },
              { count: Math.min(40, smartPool.length), label: "Toàn b?", sub: `${Math.min(40, smartPool.length)} t? · ~20 phút`, color: "border-rose-300 bg-rose-50 text-rose-700" },
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
            <p className="text-center text-sm text-green-600 py-2">
              <i className="ri-check-double-line mr-1"></i>Tuy?t v?i! Không có t? nào c?n ôn hôm nay.
            </p>
          )}
        </div>

        {/* Word list preview */}
        {smartPool.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Danh sách t? c?n ôn ({smartPool.length})</p>
              <span className="text-xs text-gray-400">S?p x?p theo d? uu tiên</span>
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {smartPool.slice(0, 30).map((item, i) => {
                const priorityColor = item.priority >= 8 ? "text-rose-500 bg-rose-50" : item.priority >= 6 ? "text-orange-500 bg-orange-50" : "text-amber-500 bg-amber-50";
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                    <span className="text-xs text-gray-400 w-5">{i + 1}</span>
                    <div className="flex-1">
                      <span className="font-bold text-gray-900 mr-2">{item.entry.korean}</span>
                      <span className="text-rose-400 font-bold text-sm mr-2">{item.entry.hanja}</span>
                      <span className="text-xs text-gray-500">{item.entry.vietnamese}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColor}`}>
                      {item.reason}
                    </span>
                  </div>
                );
              })}
              {smartPool.length > 30 && (
                <div className="px-5 py-3 text-center text-xs text-gray-400">
                  +{smartPool.length - 30} t? n?a...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // -- Done ------------------------------------------------------------------
  if (mode === "done") {
    const pct = Math.round((results.correct / sessionCards.length) * 100);
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
          <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4 ${pct >= 80 ? "bg-green-100" : pct >= 50 ? "bg-amber-100" : "bg-red-100"}`}>
            <i className={`text-3xl ${pct >= 80 ? "ri-trophy-line text-green-600" : pct >= 50 ? "ri-emotion-normal-line text-amber-600" : "ri-emotion-sad-line text-red-500"}`}></i>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{pct}%</p>
          <p className="text-gray-500 mb-2">Ðúng {results.correct} / {sessionCards.length} t?</p>
          <p className="text-sm text-gray-400 mb-5">
            {pct >= 80 ? "Xu?t s?c! B?n dang ti?n b? r?t t?t!" : pct >= 50 ? "Khá t?t! Ti?p t?c luy?n t?p nhé!" : "C?n ôn thêm! Nh?ng t? sai dã du?c ghi nh?n."}
          </p>

          {wrongInSession.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5 text-left">
              <p className="text-xs font-semibold text-red-700 mb-2">
                <i className="ri-close-circle-line mr-1"></i>T? sai trong phiên này ({wrongInSession.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {wrongInSession.map(k => {
                  const entry = HANJA_DATA.find(e => e.korean === k);
                  return entry ? (
                    <span key={k} className="px-2 py-1 bg-white border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                      {k} ({entry.vietnamese})
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => startSession(sessionCards.length)} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold cursor-pointer hover:bg-rose-600 transition-colors">Ôn l?i</button>
            <button onClick={() => setMode("overview")} className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold cursor-pointer hover:bg-gray-50 transition-colors">Xem t?ng quan</button>
          </div>
        </div>
      </div>
    );
  }

  // -- Session ---------------------------------------------------------------
  const current = sessionCards[idx];
  if (!current) return null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMode("overview")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          <i className="ri-arrow-left-line"></i> D?ng
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{idx + 1}/{sessionCards.length}</span>
          <span className="text-xs text-green-600 font-medium">? {results.correct}</span>
          <span className="text-xs text-red-500 font-medium">? {results.wrong}</span>
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
        <div className="bg-rose-400 h-1.5 rounded-full transition-all" style={{ width: `${(idx / sessionCards.length) * 100}%` }}></div>
      </div>

      {/* Priority badge */}
      <div className="flex justify-center mb-3">
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${
          current.priority >= 8 ? "bg-rose-100 text-rose-600" :
          current.priority >= 6 ? "bg-orange-100 text-orange-600" :
          "bg-amber-100 text-amber-600"
        }`}>
          <i className="ri-information-line mr-1"></i>{current.reason}
        </span>
      </div>

      {/* Card */}
      <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 text-center mb-4">
        <p className="text-4xl font-bold text-gray-900 mb-2">{current.entry.korean}</p>
        <p className="text-xl text-rose-400 font-bold mb-4">{current.entry.hanja}</p>
        <button
          onClick={() => speakKorean(current.entry.korean)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs cursor-pointer hover:bg-rose-50 hover:text-rose-500 transition-colors mx-auto mb-4"
        >
          <i className="ri-volume-up-line"></i>Nghe phát âm
        </button>
        {!revealed ? (
          <button onClick={() => setRevealed(true)} className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm cursor-pointer hover:bg-gray-200 transition-colors">
            Hi?n nghia
          </button>
        ) : (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xl font-semibold text-gray-700">{current.entry.vietnamese}</p>
          </div>
        )}
      </div>

      {revealed && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleRate(false)}
            className="p-4 rounded-xl border-2 border-red-300 bg-red-50 text-red-700 cursor-pointer hover:bg-red-100 transition-all text-center"
          >
            <i className="ri-close-line text-xl block mb-1"></i>
            <p className="font-bold">Chua nh?</p>
            <p className="text-xs opacity-70">Ôn l?i s?m hon</p>
          </button>
          <button
            onClick={() => handleRate(true)}
            className="p-4 rounded-xl border-2 border-green-300 bg-green-50 text-green-700 cursor-pointer hover:bg-green-100 transition-all text-center"
          >
            <i className="ri-check-line text-xl block mb-1"></i>
            <p className="font-bold">Ðã nh?</p>
            <p className="text-xs opacity-70">Kho?ng cách tang</p>
          </button>
        </div>
      )}
    </div>
  );
}

