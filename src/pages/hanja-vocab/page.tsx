import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { HanjaEntry } from "@/mocks/hanjaData";
import { HanjaDataProvider, useHanjaData, useHanjaLoading } from "@/contexts/HanjaDataContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuthContext } from "@/contexts/AuthContext";
import { useVipYearGuard, getExportBtnLabel, getExportBtnIcon, addCsvWatermark } from "@/hooks/useVipYearGuard";
import VipUpgradeModal from "@/components/feature/VipUpgradeModal";

// Lazy load heavy tab components
const StatsTab = lazy(() => import("@/pages/hanja-vocab/components/StatsTab"));
const QuickReviewTab = lazy(() => import("@/pages/hanja-vocab/components/QuickReviewTab"));
const TopicStudyTab = lazy(() => import("@/pages/hanja-vocab/components/TopicStudyTab"));
const PersonalRankingTab = lazy(() => import("@/pages/hanja-vocab/components/PersonalRankingTab"));
const SmartSearchTab = lazy(() => import("@/pages/hanja-vocab/components/SmartSearchTab"));
const SynonymGroupTab = lazy(() => import("@/pages/hanja-vocab/components/SynonymGroupTab"));
const AntonymTab = lazy(() => import("@/pages/hanja-vocab/components/AntonymTab"));
const FlashcardExportTab = lazy(() => import("@/pages/hanja-vocab/components/FlashcardExportTab"));
const WeeklyChallengeTab = lazy(() => import("@/pages/hanja-vocab/components/WeeklyChallengeTab"));
const WeeklyLeaderboardTab = lazy(() => import("@/pages/hanja-vocab/components/WeeklyLeaderboardTab"));
const HomophoneTab = lazy(() => import("@/pages/hanja-vocab/components/HomophoneTab"));
const TopikMockExamTab = lazy(() => import("@/pages/hanja-vocab/components/TopikMockExamTab"));
const PronunciationTab = lazy(() => import("@/pages/hanja-vocab/components/PronunciationTab"));
const HanVietCompareTab = lazy(() => import("@/pages/hanja-vocab/components/HanVietCompareTab"));
const ExampleSentenceTab = lazy(() => import("@/pages/hanja-vocab/components/ExampleSentenceTab"));
const AdvancedTopicTab = lazy(() => import("@/pages/hanja-vocab/components/AdvancedTopicTab"));
const StudyDiaryTab = lazy(() => import("@/pages/hanja-vocab/components/StudyDiaryTab"));
const WordMatchTab = lazy(() => import("@/pages/hanja-vocab/components/WordMatchTab"));
const SmartReviewTab = lazy(() => import("@/pages/hanja-vocab/components/SmartReviewTab"));

function TabFallback() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="flex items-center gap-2 text-white/40">
        <i className="ri-loader-4-line animate-spin text-lg"></i>
        <span className="text-sm">Đang tải...</span>
      </div>
      {slow && (
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-app-accent-primary hover:text-app-accent-primary/80 cursor-pointer underline"
        >
          Tải quá lâu? Nhấn để tải lại trang
        </button>
      )}
    </div>
  );
}

const ALPHABET_GROUPS = ["ㄱ","ㄴ","ㄷ","ㄹ","ㅁ","ㅂ","ㅅ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
const FAV_KEY = "hanja_favorites";
const SR_KEY = "hanja_sr_data";
const STREAK_KEY = "hanja_streak";
const NOTES_KEY = "hanja_notes";

// ─── TTS Speak ────────────────────────────────────────────────────────────────
function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ko-KR";
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}

// ─── Streak helpers ───────────────────────────────────────────────────────────
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string; // YYYY-MM-DD
  history: Record<string, number>; // date → cards reviewed
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadStreak(): StreakData {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY) || "null") ?? { currentStreak: 0, longestStreak: 0, lastStudyDate: "", history: {} }; }
  catch { return { currentStreak: 0, longestStreak: 0, lastStudyDate: "", history: {} }; }
}

function recordStudy(count: number): StreakData {
  const data = loadStreak();
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  data.history[today] = (data.history[today] || 0) + count;
  if (data.lastStudyDate === today) {
    // already counted today
  } else if (data.lastStudyDate === yesterday) {
    data.currentStreak += 1;
  } else {
    data.currentStreak = 1;
  }
  data.lastStudyDate = today;
  data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
  return data;
}

function getInitial(char: string): string {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return char[0];
  const idx = Math.floor(code / 588);
  const initials = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  return initials[idx] || char[0];
}

function extractHanjaChars(hanja: string): string[] {
  return Array.from(hanja).filter(c => c.charCodeAt(0) > 0x4E00 && c.charCodeAt(0) < 0x9FFF);
}

// ─── Mastery types (declared early for use in exportCSV) ─────────────────────
type MasteryFilter = "all" | "new" | "learning" | "mastered";


// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportCSV(
  entries: HanjaEntry[],
  filename: string,
  notes?: Record<string, string>,
  masteryFilter?: MasteryFilter,
  srData?: Record<string, SRCard>,
  limit?: number
) {
  let filtered = entries;
  if (masteryFilter && masteryFilter !== "all" && srData) {
    filtered = entries.filter(e => getMasteryLevel(e.korean, srData) === masteryFilter);
  }
  if (limit !== undefined && filtered.length > limit) {
    filtered = filtered.slice(0, limit);
  }
  const hasNotes = notes && Object.keys(notes).length > 0;
  const hasMastery = masteryFilter && masteryFilter !== "all";
  const cols = ["Tiếng Hàn", "Hán tự", "Nghĩa tiếng Việt"];
  if (hasMastery) cols.push("Mức độ");
  if (hasNotes) cols.push("Ghi chú");
  const header = cols.join(",") + "\n";
  const masteryLabel: Record<string, string> = { new: "Mới", learning: "Đang học", mastered: "Đã thuộc" };
  const rows = filtered.map(e => {
    const parts = [`"${e.korean}"`, `"${e.hanja}"`, `"${e.vietnamese}"`];
    if (hasMastery && srData) parts.push(`"${masteryLabel[getMasteryLevel(e.korean, srData)] ?? ""}"`);
    if (hasNotes) parts.push(`"${(notes?.[e.korean] ?? "").replace(/"/g, '""')}"`);
    return parts.join(",");
  }).join("\n");
  const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Spaced Repetition ────────────────────────────────────────────────────────
interface SRCard {
  korean: string;
  interval: number;   // days until next review
  easeFactor: number; // 1.3 ~ 2.5
  dueDate: number;    // timestamp ms
  totalReviews: number;
  correctStreak: number;
}

function useSR() {
  const [srData, setSrData] = useState<Record<string, SRCard>>(() => {
    try { return JSON.parse(localStorage.getItem(SR_KEY) || "{}"); } catch { return {}; }
  });

  const save = (data: Record<string, SRCard>) => {
    setSrData(data);
    localStorage.setItem(SR_KEY, JSON.stringify(data));
  };

  // SM-2 algorithm: quality 0-5
  const review = useCallback((korean: string, quality: number) => {
    setSrData(prev => {
      const now = Date.now();
      const card: SRCard = prev[korean] ?? {
        korean, interval: 1, easeFactor: 2.5, dueDate: now, totalReviews: 0, correctStreak: 0,
      };
      let { interval, easeFactor, correctStreak } = card;
      if (quality >= 3) {
        if (card.totalReviews === 0) interval = 1;
        else if (card.totalReviews === 1) interval = 6;
        else interval = Math.round(interval * easeFactor);
        easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        correctStreak += 1;
      } else {
        interval = 1;
        correctStreak = 0;
      }
      const next: SRCard = {
        korean, interval, easeFactor,
        dueDate: now + interval * 86400000,
        totalReviews: card.totalReviews + 1,
        correctStreak,
      };
      const updated = { ...prev, [korean]: next };
      localStorage.setItem(SR_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getDueCards = useCallback((pool: HanjaEntry[]): HanjaEntry[] => {
    const now = Date.now();
    const due = pool.filter(e => {
      const card = srData[e.korean];
      return !card || card.dueDate <= now;
    });
    // Sort: never reviewed first, then by dueDate asc
    return due.sort((a, b) => {
      const ca = srData[a.korean];
      const cb = srData[b.korean];
      if (!ca && !cb) return 0;
      if (!ca) return -1;
      if (!cb) return 1;
      return ca.dueDate - cb.dueDate;
    });
  }, [srData]);

  const getStats = useCallback((pool: HanjaEntry[]) => {
    const now = Date.now();
    let due = 0, learning = 0, mastered = 0, newCards = 0;
    pool.forEach(e => {
      const card = srData[e.korean];
      if (!card) { newCards++; due++; }
      else if (card.dueDate <= now) { due++; learning++; }
      else if (card.interval >= 21) mastered++;
      else learning++;
    });
    return { due, learning, mastered, newCards, total: pool.length };
  }, [srData]);

  const resetCard = useCallback((korean: string) => {
    setSrData(prev => {
      const updated = { ...prev };
      delete updated[korean];
      localStorage.setItem(SR_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { srData, review, getDueCards, getStats, resetCard };
}

// ─── Notes hook ───────────────────────────────────────────────────────────────
function useNotes() {
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    try { return JSON.parse(localStorage.getItem(NOTES_KEY) || "{}"); } catch { return {}; }
  });
  const saveNote = useCallback((korean: string, text: string) => {
    setNotes(prev => {
      const next = { ...prev };
      if (text.trim()) next[korean] = text;
      else delete next[korean];
      localStorage.setItem(NOTES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  return { notes, saveNote };
}

// ─── Favorites hook ───────────────────────────────────────────────────────────
function useFavorites() {
  const [favs, setFavs] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  });

  const toggle = useCallback((korean: string) => {
    setFavs(prev => {
      const next = new Set(prev);
      next.has(korean) ? next.delete(korean) : next.add(korean);
      localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }, []);

  return { favs, toggle };
}

type TabType = "vocab" | "flashcard" | "quiz" | "sr" | "roots" | "favorites" | "stats" | "quickreview" | "topics" | "ranking" | "search" | "synonym" | "antonym" | "export" | "weekly" | "leaderboard" | "homophone" | "topik-exam" | "pronunciation" | "hanviet" | "examples" | "advanced-topics" | "diary" | "word-match" | "smart-review";
type QuizMode = "ko2vi" | "vi2ko" | "hanja2ko" | "listen";
type ViewMode = "card" | "list";

// ─── Flashcard Component ──────────────────────────────────────────────────────
function FlashCard({ entry, isFav, onToggleFav }: { entry: HanjaEntry; isFav: boolean; onToggleFav: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => { setFlipped(false); }, [entry.korean]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSpeaking(true);
    speakKorean(entry.korean);
    setTimeout(() => setSpeaking(false), 1200);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-sm cursor-pointer" style={{ perspective: "1000px" }} onClick={() => setFlipped(f => !f)}>
        <div style={{ transition: "transform 0.5s", transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", position: "relative", height: "240px" }}>
          <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
            className="absolute inset-0 bg-app-surface/50 border-2 border-app-border rounded-2xl flex flex-col items-center justify-center p-6">
            <p className="text-xs text-white/40 tracking-normal mb-3">Tiếng Hàn</p>
            <p className="text-5xl font-bold text-white mb-2">{entry.korean}</p>
            <p className="text-2xl text-app-accent-primary font-bold mb-3">{entry.hanja}</p>
            <button onClick={handleSpeak}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${speaking ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/50 hover:bg-app-accent-primary/10 hover:text-app-accent-primary"}`}>
              <i className={speaking ? "ri-volume-up-fill" : "ri-volume-up-line"}></i>
              {speaking ? "Đang phát..." : "Nghe phát âm"}
            </button>
          </div>
          <div style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            className="absolute inset-0 bg-app-accent-primary/10 border-2 border-app-accent-primary/30 rounded-2xl flex flex-col items-center justify-center p-6">
            <p className="text-xs text-app-accent-primary tracking-normal mb-3">Nghĩa tiếng Việt</p>
            <p className="text-3xl font-bold text-app-accent-primary text-center mb-2">{entry.vietnamese}</p>
            <p className="text-lg text-app-accent-primary mb-3">{entry.hanja}</p>
            <button onClick={handleSpeak}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${speaking ? "bg-app-accent-primary text-app-bg" : "bg-app-accent-primary/20 text-app-accent-primary hover:bg-app-accent-primary/30"}`}>
              <i className={speaking ? "ri-volume-up-fill" : "ri-volume-up-line"}></i>
              {speaking ? "Đang phát..." : "Nghe lại"}
            </button>
          </div>
        </div>
      </div>
      <button onClick={e => { e.stopPropagation(); onToggleFav(); }}
        className={`mt-3 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${isFav ? "bg-app-accent-primary/10 text-app-accent-primary" : "bg-app-surface/50 text-white/50 hover:bg-app-accent-primary/10 hover:text-app-accent-primary"}`}>
        <i className={isFav ? "ri-heart-fill" : "ri-heart-line"}></i>
        {isFav ? "Đã lưu" : "Lưu từ này"}
      </button>
    </div>
  );
}

// ─── Flashcard Tab ────────────────────────────────────────────────────────────
function FlashcardTab({ favs, onToggleFav }: { favs: Set<string>; onToggleFav: (k: string) => void }) {
  const HANJA_DATA = useHanjaData();
  const [selectedInitial, setSelectedInitial] = useState<string | null>(null);
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [animating, setAnimating] = useState(false);

  const pool = useMemo(() => {
    let data = HANJA_DATA;
    if (selectedInitial) data = data.filter(d => getInitial(d.korean[0]) === selectedInitial);
    if (onlyFavs) data = data.filter(d => favs.has(d.korean));
    return data;
  }, [selectedInitial, onlyFavs, favs, HANJA_DATA]);

  useEffect(() => { setIdx(0); }, [pool]);

  const go = (dir: "left" | "right") => {
    if (animating || pool.length === 0) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setIdx(i => dir === "right" ? (i + 1) % pool.length : (i - 1 + pool.length) % pool.length);
      setDirection(null);
      setAnimating(false);
    }, 250);
  };

  const current = pool[idx] ?? null;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex flex-wrap gap-2 mb-5 items-center">
        <button onClick={() => setOnlyFavs(f => !f)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${onlyFavs ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/60 hover:bg-app-surface/70"}`}>
          <i className="ri-heart-line"></i>Chỉ từ yêu thích ({favs.size})
        </button>
        <button onClick={() => setSelectedInitial(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${!selectedInitial ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/60"}`}>
          Tất cả
        </button>
        {ALPHABET_GROUPS.map(g => (
          <button key={g} onClick={() => setSelectedInitial(selectedInitial === g ? null : g)}
            className={`px-2.5 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${selectedInitial === g ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/60"}`}>
            {g}
          </button>
        ))}
      </div>

      {pool.length === 0 ? (
        <div className="text-center py-16 text-white/40">
          <i className="ri-heart-line text-4xl"></i>
          <p className="mt-2 text-sm">Chưa có từ yêu thích nào</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/50">{idx + 1} / {pool.length}</span>
            <div className="flex gap-1">
              {pool.slice(Math.max(0, idx - 2), idx + 3).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i + Math.max(0, idx - 2) === idx ? "bg-app-accent-primary" : "bg-app-border"}`}></div>
              ))}
            </div>
          </div>
          <div className="transition-all duration-200"
            style={{ opacity: animating ? 0 : 1, transform: animating ? (direction === "right" ? "translateX(-30px)" : "translateX(30px)") : "translateX(0)" }}>
            {current && <FlashCard entry={current} isFav={favs.has(current.korean)} onToggleFav={() => onToggleFav(current.korean)} />}
          </div>
          <div className="flex items-center justify-center gap-4 mt-6">
            <button id="fc-prev" onClick={() => go("left")}
              className="w-12 h-12 flex items-center justify-center bg-app-surface/50 border border-app-border rounded-full cursor-pointer hover:border-app-accent-primary hover:text-app-accent-primary transition-all">
              <i className="ri-arrow-left-line text-lg"></i>
            </button>
            <button id="fc-next" onClick={() => go("right")}
              className="w-12 h-12 flex items-center justify-center bg-app-accent-primary text-app-bg rounded-full cursor-pointer hover:bg-app-accent-primary/90 transition-all">
              <i className="ri-arrow-right-line text-lg"></i>
            </button>
          </div>
          <p className="text-center text-xs text-white/40 mt-3">Nhấn thẻ để lật · ← → để chuyển</p>
        </>
      )}
    </div>
  );
}

// ─── Spaced Repetition Tab ────────────────────────────────────────────────────
function SRTab({ favs }: { favs: Set<string> }) {
  const HANJA_DATA = useHanjaData();
  const { srData, review, getDueCards, getStats, resetCard } = useSR();
  const [mode, setMode] = useState<"stats" | "session">("stats");
  const [useOnlyFavs, setUseOnlyFavs] = useState(false);
  const [sessionCards, setSessionCards] = useState<HanjaEntry[]>([]);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ correct: number; wrong: number }>({ correct: 0, wrong: 0 });

  const pool = useMemo(() => {
    if (useOnlyFavs) return HANJA_DATA.filter(d => favs.has(d.korean));
    return HANJA_DATA;
  }, [useOnlyFavs, favs, HANJA_DATA]);

  const stats = useMemo(() => getStats(pool), [getStats, pool, srData]);
  const dueCards = useMemo(() => getDueCards(pool), [getDueCards, pool, srData]);

  const startSession = () => {
    const cards = dueCards.slice(0, 20);
    if (cards.length === 0) return;
    setSessionCards(cards);
    setSessionIdx(0);
    setRevealed(false);
    setSessionDone(false);
    setSessionResults({ correct: 0, wrong: 0 });
    setMode("session");
  };

  const handleRate = (quality: number) => {
    const card = sessionCards[sessionIdx];
    review(card.korean, quality);
    const isCorrect = quality >= 3;
    setSessionResults(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
    }));
    const next = sessionIdx + 1;
    if (next >= sessionCards.length) {
      setSessionDone(true);
    } else {
      setSessionIdx(next);
      setRevealed(false);
    }
  };

  const currentCard = sessionCards[sessionIdx];
  const srInfo = currentCard ? srData[currentCard.korean] : null;

  if (mode === "session" && !sessionDone && currentCard) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMode("stats")} className="flex items-center gap-1 text-sm text-white/50 hover:text-white/70 cursor-pointer">
            <i className="ri-arrow-left-line"></i> Dừng
          </button>
          <span className="text-sm text-white/50">{sessionIdx + 1} / {sessionCards.length}</span>
          <span className="text-xs text-green-400 font-medium">✓ {sessionResults.correct} &nbsp; ✗ {sessionResults.wrong}</span>
        </div>

        <div className="w-full bg-app-surface/50 rounded-full h-1.5 mb-6">
          <div className="bg-app-accent-primary h-1.5 rounded-full transition-all" style={{ width: `${(sessionIdx / sessionCards.length) * 100}%` }}></div>
        </div>

        {/* SR info badge */}
        {srInfo && (
          <div className="flex gap-2 mb-3 justify-center">
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-xs">
              Đã ôn {srInfo.totalReviews} lần
            </span>
            <span className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-xs">
              Streak: {srInfo.correctStreak}
            </span>
          </div>
        )}
        {!srInfo && (
          <div className="flex justify-center mb-3">
            <span className="px-2 py-0.5 bg-app-accent-primary/10 text-app-accent-primary rounded-full text-xs">Từ mới</span>
          </div>
        )}

        {/* Card */}
        <div className="bg-app-surface/50 border-2 border-app-border rounded-2xl p-8 text-center mb-4">
          <p className="text-4xl font-bold text-white mb-2">{currentCard.korean}</p>
          <p className="text-xl text-app-accent-primary font-bold mb-4">{currentCard.hanja}</p>
          {!revealed ? (
            <button onClick={() => setRevealed(true)}
              className="px-6 py-2 bg-app-surface/70 text-white/70 rounded-lg text-sm cursor-pointer hover:bg-app-surface/80 transition-colors">
              Hiện nghĩa
            </button>
          ) : (
            <div className="border-t border-app-border pt-4">
              <p className="text-xl font-semibold text-white">{currentCard.vietnamese}</p>
            </div>
          )}
        </div>

        {/* Rating buttons */}
        {revealed && (
          <div>
            <p className="text-center text-xs text-white/40 mb-3">Bạn nhớ từ này như thế nào?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { q: 0, label: "Quên", sub: "Không nhớ", color: "border-red-500 bg-red-500/10 text-red-400 hover:bg-red-500/20" },
                { q: 2, label: "Khó", sub: "Nhớ mờ", color: "border-orange-500 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20" },
                { q: 3, label: "Được", sub: "Nhớ được", color: "border-yellow-500 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20" },
                { q: 5, label: "Dễ", sub: "Nhớ rõ", color: "border-green-500 bg-green-500/10 text-green-400 hover:bg-green-500/20" },
              ].map(r => (
                <button key={r.q} onClick={() => handleRate(r.q)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${r.color}`}>
                  <p className="font-bold text-sm">{r.label}</p>
                  <p className="text-xs opacity-70">{r.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === "session" && sessionDone) {
    const streak = recordStudy(sessionCards.length);
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-app-surface/50 border border-app-border rounded-2xl p-8 text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-green-500/10 rounded-full mx-auto mb-4">
            <i className="ri-check-double-line text-green-400 text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Hoàn thành phiên học!</h3>
          <p className="text-white/50 mb-3">Đúng {sessionResults.correct} · Sai {sessionResults.wrong} / {sessionCards.length} từ</p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 rounded-full">
              <i className="ri-fire-line text-orange-400"></i>
              <span className="text-sm font-bold text-orange-400">{streak.currentStreak} ngày liên tiếp</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-full">
              <i className="ri-trophy-line text-amber-400"></i>
              <span className="text-sm font-bold text-amber-400">Kỷ lục: {streak.longestStreak}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={startSession} className="flex-1 py-3 bg-app-accent-primary text-app-bg rounded-xl font-semibold cursor-pointer hover:bg-app-accent-primary/90 transition-colors">Tiếp tục ôn</button>
            <button onClick={() => setMode("stats")} className="flex-1 py-3 border border-app-border text-white/70 rounded-xl font-semibold cursor-pointer hover:bg-app-surface/50 transition-colors">Xem thống kê</button>
          </div>
        </div>
      </div>
    );
  }

  // Stats view
  const streakData = loadStreak();
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10);
    return { date: d, count: streakData.history[d] || 0, label: d.slice(8) };
  });
  const maxCount = Math.max(...last14Days.map(d => d.count), 1);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Streak banner */}
      <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-orange-500/10 to-amber-500/10 rounded-2xl p-4">
        <div className="w-14 h-14 flex items-center justify-center bg-orange-500/20 rounded-xl flex-shrink-0">
          <i className="ri-fire-line text-orange-400 text-2xl"></i>
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-orange-400">{streakData.currentStreak} ngày liên tiếp</p>
          <p className="text-xs text-white/50">Kỷ lục: {streakData.longestStreak} ngày · Hôm nay: {streakData.history[getToday()] || 0} từ</p>
        </div>
        <button onClick={() => setUseOnlyFavs(f => !f)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all flex-shrink-0 ${useOnlyFavs ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/60 border border-app-border"}`}>
          <i className="ri-heart-line"></i>Yêu thích
        </button>
      </div>

      {/* 14-day chart */}
      <div className="bg-app-surface/50 border border-app-border rounded-2xl p-5 mb-5">
        <p className="text-sm font-semibold text-white mb-4">Hoạt động 14 ngày qua</p>
        <div className="flex items-end gap-1 h-20">
          {last14Days.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(4, (d.count / maxCount) * 64)}px`,
                  backgroundColor: d.count > 0 ? (d.date === getToday() ? "rgb(244 63 94)" : "rgb(253 164 175)") : "rgba(255,255,255,0.1)"
                }}
              ></div>
              <span className="text-xs text-white/40" style={{ fontSize: "9px" }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Cần ôn hôm nay", value: stats.due, color: "text-app-accent-primary", bg: "bg-app-accent-primary/10" },
          { label: "Từ mới", value: stats.newCards, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Đang học", value: stats.learning, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Đã thuộc", value: stats.mastered, color: "text-green-400", bg: "bg-green-500/10" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/50 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 mb-5">
        <div className="flex justify-between text-xs text-white/50 mb-2">
          <span>Tiến độ tổng thể</span>
          <span>{stats.mastered} / {stats.total} từ đã thuộc ({stats.total > 0 ? Math.round((stats.mastered / stats.total) * 100) : 0}%)</span>
        </div>
        <div className="w-full bg-app-surface/50 rounded-full h-3">
          <div className="bg-green-400 h-3 rounded-full transition-all" style={{ width: `${stats.total > 0 ? (stats.mastered / stats.total) * 100 : 0}%` }}></div>
        </div>
      </div>

      <button onClick={startSession} disabled={dueCards.length === 0}
        className="w-full py-3 bg-app-accent-primary text-app-bg rounded-xl font-bold text-lg cursor-pointer hover:bg-app-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3">
        {dueCards.length > 0 ? `Bắt đầu ôn tập (${Math.min(20, dueCards.length)} câu)` : "Không có từ cần ôn hôm nay!"}
      </button>
      {dueCards.length === 0 && <p className="text-center text-sm text-green-400">Tuyệt vời! Hãy quay lại vào ngày mai.</p>}

      <div className="mt-5 bg-app-surface/50 rounded-xl p-4">
        <p className="text-xs font-semibold text-white mb-2">Cách hoạt động (SM-2)</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-white/50">
          <div><span className="text-red-400 font-bold">Quên</span> → Ôn lại ngay hôm sau</div>
          <div><span className="text-orange-400 font-bold">Khó</span> → Ôn lại ngay hôm sau</div>
          <div><span className="text-yellow-400 font-bold">Được</span> → Ôn sau vài ngày</div>
          <div><span className="text-green-400 font-bold">Dễ</span> → Khoảng cách tăng dần</div>
        </div>
      </div>
    </div>
  );
}

// ─── Mastery level badge helper ───────────────────────────────────────────────
function getMasteryLevel(korean: string, srData: Record<string, SRCard>): "new" | "learning" | "mastered" {
  const card = srData[korean];
  if (!card) return "new";
  if (card.interval >= 21) return "mastered";
  return "learning";
}

function MasteryBadge({ level }: { level: "new" | "learning" | "mastered" }) {
  if (level === "new") return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-app-surface/50 text-white/50">
      <i className="ri-seedling-line text-xs"></i>Mới
    </span>
  );
  if (level === "learning") return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400">
      <i className="ri-book-open-line text-xs"></i>Đang học
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">
      <i className="ri-check-double-line text-xs"></i>Đã thuộc
    </span>
  );
}

// ─── Vocab Tab ────────────────────────────────────────────────────────────────
function VocabTab({ favs, onToggleFav }: { favs: Set<string>; onToggleFav: (k: string) => void }) {
  const { isVipYear, isVip, isVipMonth, isLoggedIn, checkAndRun, modalOpen, modalReason, closeModal } = useVipYearGuard();
  const [search, setSearch] = useState("");
  const [selectedInitial, setSelectedInitial] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [masteryFilter, setMasteryFilter] = useState<MasteryFilter>("all");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 30;

  const [srData, setSrData] = useState<Record<string, SRCard>>(() => {
    try { return JSON.parse(localStorage.getItem(SR_KEY) || "{}"); } catch { return {}; }
  });

  // Mark as learned: set interval=21 so it counts as "mastered"
  const markAsLearned = useCallback((korean: string) => {
    setSrData(prev => {
      const now = Date.now();
      const existing = prev[korean];
      const next: SRCard = {
        korean,
        interval: 21,
        easeFactor: existing?.easeFactor ?? 2.5,
        dueDate: now + 21 * 86400000,
        totalReviews: (existing?.totalReviews ?? 0) + 1,
        correctStreak: (existing?.correctStreak ?? 0) + 1,
      };
      const updated = { ...prev, [korean]: next };
      localStorage.setItem(SR_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Reset to "new"
  const resetToNew = useCallback((korean: string) => {
    setSrData(prev => {
      const updated = { ...prev };
      delete updated[korean];
      localStorage.setItem(SR_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const HANJA_DATA = useHanjaData();
  const masteryStats = useMemo(() => {
    let newCount = 0, learningCount = 0, masteredCount = 0;
    HANJA_DATA.forEach(d => {
      const lvl = getMasteryLevel(d.korean, srData);
      if (lvl === "new") newCount++;
      else if (lvl === "learning") learningCount++;
      else masteredCount++;
    });
    return { new: newCount, learning: learningCount, mastered: masteredCount };
  }, [srData, HANJA_DATA]);

  const filtered = useMemo(() => {
    let data = HANJA_DATA;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(d => d.korean.includes(q) || d.hanja.includes(q) || d.vietnamese.toLowerCase().includes(q));
    }
    if (selectedInitial) data = data.filter(d => getInitial(d.korean[0]) === selectedInitial);
    if (masteryFilter !== "all") data = data.filter(d => getMasteryLevel(d.korean, srData) === masteryFilter);
    return data;
  }, [search, selectedInitial, masteryFilter, srData]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedInitial, masteryFilter]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleExportCSV = (filter: MasteryFilter) => {
    checkAndRun(
      () => {
        const label: Record<MasteryFilter, string> = { all: "tat_ca", new: "moi", learning: "dang_hoc", mastered: "da_thuoc" };
        exportCSV(HANJA_DATA, `hanja_${label[filter]}.csv`, undefined, filter, srData);
        setShowExportMenu(false);
      },
      (limit) => {
        const label: Record<MasteryFilter, string> = { all: "tat_ca", new: "moi", learning: "dang_hoc", mastered: "da_thuoc" };
        exportCSV(HANJA_DATA, `hanja_${label[filter]}_${limit}tu.csv`, undefined, filter, srData, limit);
        setShowExportMenu(false);
      }
    );
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>
          <input type="text" placeholder="Tìm từ Hàn, Hán tự, nghĩa tiếng Việt..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-app-border rounded-lg text-sm bg-app-surface/50 text-white focus:outline-none focus:ring-2 focus:ring-app-accent-primary" />
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-app-surface/50 rounded-lg p-1">
            <button onClick={() => setViewMode("card")}
              className={`px-3 py-1.5 rounded-md text-sm cursor-pointer whitespace-nowrap transition-all ${viewMode === "card" ? "bg-app-surface/70 text-app-accent-primary" : "text-white/50"}`}>
              <i className="ri-grid-line mr-1"></i>Thẻ
            </button>
            <button onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-md text-sm cursor-pointer whitespace-nowrap transition-all ${viewMode === "list" ? "bg-app-surface/70 text-app-accent-primary" : "text-white/50"}`}>
              <i className="ri-list-check mr-1"></i>Danh sách
            </button>
          </div>
          {/* Export CSV by mastery */}
          <div className="relative">
            <button onClick={() => isVipYear ? setShowExportMenu(m => !m) : checkAndRun(() => {})}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap ${
                isVipYear ? "border-app-border text-white/70 hover:bg-app-surface/50" : "border-app-border text-white/40 bg-app-surface/30"
              }`}
              title={!isVipYear ? "Chỉ VIP Năm mới xuất được" : ""}>
              <i className={getExportBtnIcon(isLoggedIn, isVip, isVipYear)}></i>
              {getExportBtnLabel(isLoggedIn, isVip, isVipYear, "Xuất CSV")}
              {isVipYear && <i className="ri-arrow-down-s-line text-xs"></i>}
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 bg-app-surface/50 border border-app-border rounded-xl shadow-lg z-20 min-w-[180px] py-1">
                {([
                  { key: "all" as MasteryFilter, label: "Tất cả từ", icon: "ri-file-list-line" },
                  { key: "new" as MasteryFilter, label: "Chỉ từ Mới", icon: "ri-seedling-line" },
                  { key: "learning" as MasteryFilter, label: "Chỉ Đang học", icon: "ri-book-open-line" },
                  { key: "mastered" as MasteryFilter, label: "Chỉ Đã thuộc", icon: "ri-check-double-line" },
                ]).map(opt => (
                  <button key={opt.key} onClick={() => handleExportCSV(opt.key)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-app-accent-primary/10 hover:text-app-accent-primary cursor-pointer transition-colors text-left">
                    <i className={opt.icon}></i>{opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mastery filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {([
          { key: "all", label: "Tất cả", count: HANJA_DATA.length, color: "bg-app-accent-primary text-app-bg", inactive: "bg-app-surface/50 text-white/60 hover:bg-app-surface/70" },
          { key: "new", label: "Mới", count: masteryStats.new, color: "bg-white/20 text-white", inactive: "bg-app-surface/50 text-white/60 hover:bg-app-surface/70", icon: "ri-seedling-line" },
          { key: "learning", label: "Đang học", count: masteryStats.learning, color: "bg-amber-500 text-white", inactive: "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20", icon: "ri-book-open-line" },
          { key: "mastered", label: "Đã thuộc", count: masteryStats.mastered, color: "bg-green-500 text-white", inactive: "bg-green-500/10 text-green-400 hover:bg-green-500/20", icon: "ri-check-double-line" },
        ] as { key: MasteryFilter; label: string; count: number; color: string; inactive: string; icon?: string }[]).map(f => (
          <button key={f.key} onClick={() => setMasteryFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${masteryFilter === f.key ? f.color : f.inactive}`}>
            {f.icon && <i className={f.icon}></i>}
            {f.label} <span className="opacity-75">({f.count})</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <button onClick={() => setSelectedInitial(null)}
          className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${!selectedInitial ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/60 hover:bg-app-surface/70"}`}>
          Tất cả
        </button>
        {ALPHABET_GROUPS.map(g => (
          <button key={g} onClick={() => setSelectedInitial(selectedInitial === g ? null : g)}
            className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${selectedInitial === g ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/60 hover:bg-app-surface/70"}`}>
            {g}
          </button>
        ))}
      </div>

      <p className="text-xs text-white/40 mb-4">Hiển thị {filtered.length} / {HANJA_DATA.length} từ · {favs.size} từ yêu thích</p>

      {viewMode === "card" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {paginatedData.map((item, i) => {
              const mastery = getMasteryLevel(item.korean, srData);
              return (
                <div key={i} className="bg-app-surface/50 border border-app-border rounded-xl p-4 hover:border-app-accent-primary transition-all relative group">
                  <button onClick={() => onToggleFav(item.korean)}
                    className={`absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full cursor-pointer transition-all ${favs.has(item.korean) ? "text-app-accent-primary" : "text-white/30 hover:text-app-accent-primary"}`}>
                    <i className={favs.has(item.korean) ? "ri-heart-fill" : "ri-heart-line"}></i>
                  </button>
                  <div className="mb-2">
                    <span className="text-base font-bold text-white block">{item.korean}</span>
                    <span className="text-xl font-bold text-app-accent-primary">{item.hanja}</span>
                  </div>
                  <p className="text-xs text-white/50 pr-4 mb-2">{item.vietnamese}</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    <MasteryBadge level={mastery} />
                    {mastery !== "mastered" ? (
                      <button onClick={() => markAsLearned(item.korean)}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-app-surface/50 text-white/50 hover:bg-app-surface/70 cursor-pointer transition-colors whitespace-nowrap">
                        <i className="ri-check-line text-xs"></i>Thuộc rồi
                      </button>
                    ) : (
                      <button onClick={() => resetToNew(item.korean)}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 cursor-pointer transition-colors whitespace-nowrap">
                        <i className="ri-refresh-line text-xs"></i>Đã thuộc
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm bg-app-surface/50 text-white/70 hover:bg-app-surface/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="ri-arrow-left-line"></i>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-app-accent-primary text-app-bg"
                        : "bg-app-surface/50 text-white/70 hover:bg-app-surface/70"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm bg-app-surface/50 text-white/70 hover:bg-app-surface/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>
          )}
        </>
      )}

      {viewMode === "list" && (
        <>
          <div className="bg-app-surface/50 border border-app-border rounded-xl overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_1fr_120px_80px_32px] bg-app-card/50 px-4 py-2 text-xs font-semibold text-white/50 border-b border-app-border">
              <span>Tiếng Hàn</span><span>Hán tự</span><span>Nghĩa tiếng Việt</span><span>Mức độ</span><span>Đánh dấu</span><span></span>
            </div>
            <div className="divide-y divide-app-border">
              {paginatedData.map((item, i) => {
                const mastery = getMasteryLevel(item.korean, srData);
                return (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1fr_120px_80px_32px] px-4 py-3 hover:bg-app-accent-primary/5 transition-colors items-center">
                    <span className="text-sm font-semibold text-white">{item.korean}</span>
                    <span className="text-sm font-bold text-app-accent-primary">{item.hanja}</span>
                    <span className="text-sm text-white/70">{item.vietnamese}</span>
                    <MasteryBadge level={mastery} />
                    {mastery !== "mastered" ? (
                      <button onClick={() => markAsLearned(item.korean)}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-app-surface/50 text-white/50 hover:bg-app-surface/70 cursor-pointer transition-colors whitespace-nowrap w-fit">
                        <i className="ri-check-line"></i>Thuộc rồi
                      </button>
                    ) : (
                      <button onClick={() => resetToNew(item.korean)}
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 cursor-pointer transition-colors whitespace-nowrap w-fit">
                        <i className="ri-refresh-line"></i>Đã thuộc
                      </button>
                    )}
                    <button onClick={() => onToggleFav(item.korean)}
                      className={`w-6 h-6 flex items-center justify-center rounded-full cursor-pointer transition-all ${favs.has(item.korean) ? "text-app-accent-primary" : "text-white/30 hover:text-app-accent-primary"}`}>
                      <i className={favs.has(item.korean) ? "ri-heart-fill" : "ri-heart-line"}></i>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination controls for list view */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm bg-app-surface/50 text-white/70 hover:bg-app-surface/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="ri-arrow-left-line"></i>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-app-accent-primary text-app-bg"
                        : "bg-app-surface/50 text-white/70 hover:bg-app-surface/70"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm bg-app-surface/50 text-white/70 hover:bg-app-surface/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <i className="ri-arrow-right-line"></i>
              </button>
            </div>
          )}
        </>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/40">
          <i className="ri-search-line text-4xl"></i>
          <p className="mt-2 text-sm">Không tìm thấy từ nào</p>
        </div>
      )}

      {/* Close export menu on outside click */}
      {showExportMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)}></div>
      )}

      {/* VIP Upgrade Modal */}
      <VipUpgradeModal
        open={modalOpen}
        onClose={closeModal}
        reason={modalReason ?? "not_vip_year"}
        featureName="Xuất CSV từ vựng Hán-Hàn"
      />
    </div>
  );
}

// ─── Favorites Tab ────────────────────────────────────────────────────────────
function FavoritesTab({ favs, onToggleFav, onStartFlashcard, notes, onSaveNote }: {
  favs: Set<string>;
  onToggleFav: (k: string) => void;
  onStartFlashcard: () => void;
  notes: Record<string, string>;
  onSaveNote: (korean: string, text: string) => void;
}) {
  const { isVipYear, isVip, isVipMonth, isLoggedIn, checkAndRun, modalOpen, modalReason, closeModal } = useVipYearGuard();
  const HANJA_DATA = useHanjaData();
  const [favSearch, setFavSearch] = useState("");
  const favList = useMemo(() => {
    const all = HANJA_DATA.filter(d => favs.has(d.korean));
    if (!favSearch.trim()) return all;
    const q = favSearch.trim().toLowerCase();
    return all.filter(d => d.korean.includes(q) || d.hanja.includes(q) || d.vietnamese.toLowerCase().includes(q));
  }, [favs, favSearch]);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");

  const startEdit = (korean: string) => {
    setEditingNote(korean);
    setDraftNote(notes[korean] || "");
  };

  const commitNote = (korean: string) => {
    onSaveNote(korean, draftNote);
    setEditingNote(null);
  };

  const handleExportCSV = () => checkAndRun(
    () => exportCSV(favList, "hanja_yeu_thich.csv", notes),
    (limit) => exportCSV(favList, `hanja_yeu_thich_${limit}tu.csv`, notes, undefined, undefined, limit)
  );
  const handleExportAll = () => checkAndRun(
    () => exportCSV(HANJA_DATA, "hanja_tat_ca.csv"),
    (limit) => exportCSV(HANJA_DATA, `hanja_tat_ca_${limit}tu.csv`, undefined, undefined, undefined, limit)
  );

  if (favList.length === 0) {
    return (
      <div className="text-center py-16 text-white/40">
        <div className="w-16 h-16 flex items-center justify-center bg-app-accent-primary/10 rounded-2xl mx-auto mb-4">
          <i className="ri-heart-line text-app-accent-primary text-3xl"></i>
        </div>
        <p className="font-medium text-white/50 mb-1">Chưa có từ yêu thích</p>
        <p className="text-sm mb-6">Nhấn biểu tượng ♡ trong tab Từ vựng để lưu từ</p>
        <button onClick={handleExportAll}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm cursor-pointer transition-colors mx-auto ${
            isVipYear ? "border-app-border text-white/70 hover:bg-app-surface/50" : "border-app-border text-white/40 bg-app-surface/30"
          }`}
          title={!isVipYear ? "Chỉ VIP Năm mới xuất được" : ""}>
          <i className={getExportBtnIcon(isLoggedIn, isVip, isVipYear)}></i>
          {isVipYear ? `Xuất tất cả ${HANJA_DATA.length} từ ra CSV` : getExportBtnLabel(isLoggedIn, isVip, isVipYear, "")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>
          <input type="text" placeholder="Tìm trong yêu thích..." value={favSearch} onChange={e => setFavSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-app-border rounded-lg text-sm bg-app-surface/50 text-white focus:outline-none focus:ring-2 focus:ring-app-accent-primary" />
        </div>
      </div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <p className="text-sm text-white/50">{favList.length} từ đã lưu · {Object.keys(notes).length} ghi chú</p>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleExportCSV}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${
              isVipYear || isVipMonth ? "border-app-accent-primary/30 text-app-accent-primary hover:bg-app-accent-primary/10" : "border-app-border text-white/40 bg-app-surface/30"
            }`}>
            <i className={getExportBtnIcon(isLoggedIn, isVip, isVipYear)}></i>
            {getExportBtnLabel(isLoggedIn, isVip, isVipYear, "Xuất CSV yêu thích")}
          </button>
          <button onClick={handleExportAll}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${
              isVipYear || isVipMonth ? "border-app-border text-white/70 hover:bg-app-surface/50" : "border-app-border text-white/40 bg-app-surface/30"
            }`}>
            <i className={getExportBtnIcon(isLoggedIn, isVip, isVipYear)}></i>
            {getExportBtnLabel(isLoggedIn, isVip, isVipYear, "Xuất tất cả")}
          </button>
          <button onClick={onStartFlashcard}
            className="flex items-center gap-2 px-4 py-2 bg-app-accent-primary text-app-bg rounded-lg text-sm font-medium cursor-pointer hover:bg-app-accent-primary/90 transition-colors whitespace-nowrap">
            <i className="ri-play-circle-line"></i>Ôn tập Flashcard
          </button>
        </div>
      </div>

      {/* VIP Upgrade Modal */}
      <VipUpgradeModal
        open={modalOpen}
        onClose={closeModal}
        reason={modalReason ?? "not_vip_year"}
        featureName="Xuất CSV từ yêu thích"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {favList.map((item, i) => (
          <div key={i} className="bg-app-surface/50 border border-app-accent-primary/30 rounded-xl p-4 hover:border-app-accent-primary transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-base font-bold text-white block">{item.korean}</span>
                <span className="text-lg font-bold text-app-accent-primary">{item.hanja}</span>
              </div>
              <button onClick={() => onToggleFav(item.korean)}
                className="w-6 h-6 flex items-center justify-center rounded-full cursor-pointer text-app-accent-primary hover:text-app-accent-primary/80 transition-all flex-shrink-0">
                <i className="ri-heart-fill"></i>
              </button>
            </div>
            <p className="text-xs text-white/50 mb-3">{item.vietnamese}</p>

            {/* Note area */}
            {editingNote === item.korean ? (
              <div>
                <textarea
                  value={draftNote}
                  onChange={e => setDraftNote(e.target.value)}
                  placeholder="Ghi chú của bạn..."
                  maxLength={200}
                  rows={3}
                  className="w-full text-xs border border-app-accent-primary/30 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-app-accent-primary bg-app-surface/50 text-white"
                  autoFocus
                />
                <div className="flex gap-2 mt-1.5">
                  <button onClick={() => commitNote(item.korean)}
                    className="flex-1 py-1 bg-app-accent-primary text-app-bg rounded-md text-xs font-medium cursor-pointer hover:bg-app-accent-primary/90 transition-colors">
                    Lưu
                  </button>
                  <button onClick={() => setEditingNote(null)}
                    className="flex-1 py-1 border border-app-border text-white/50 rounded-md text-xs cursor-pointer hover:bg-app-surface/50 transition-colors">
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => startEdit(item.korean)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-all border ${notes[item.korean] ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20" : "border-dashed border-app-border text-white/40 hover:border-app-accent-primary/30 hover:text-app-accent-primary"}`}>
                {notes[item.korean] ? (
                  <span className="flex items-start gap-1.5">
                    <i className="ri-sticky-note-line flex-shrink-0 mt-0.5"></i>
                    <span className="line-clamp-2">{notes[item.korean]}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <i className="ri-add-line"></i>Thêm ghi chú...
                  </span>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Quiz Tab ─────────────────────────────────────────────────────────────────
function QuizTab({ favs }: { favs: Set<string> }) {
  const [mode, setMode] = useState<QuizMode>("ko2vi");
  const [pool, setPool] = useState<HanjaEntry[]>([]);
  const [current, setCurrent] = useState(0);
  const [question, setQuestion] = useState<{
    entry: HanjaEntry; choices: HanjaEntry[]; answered: boolean; selected: string | null;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [selectedInitial, setSelectedInitial] = useState<string | null>(null);
  const HANJA_DATA = useHanjaData();
  const [onlyFavs, setOnlyFavs] = useState(false);

  const filteredPool = useMemo(() => {
    let data = HANJA_DATA;
    if (selectedInitial) data = data.filter(d => getInitial(d.korean[0]) === selectedInitial);
    if (onlyFavs) data = data.filter(d => favs.has(d.korean));
    return data;
  }, [selectedInitial, onlyFavs, favs]);

  const buildQuestion = useCallback((entry: HanjaEntry, allData: HanjaEntry[]) => {
    const others = allData.filter(d => d.korean !== entry.korean);
    const choices = [...others.sort(() => Math.random() - 0.5).slice(0, 3), entry].sort(() => Math.random() - 0.5);
    return { entry, choices, answered: false, selected: null };
  }, []);

  const startQuiz = useCallback(() => {
    const shuffled = [...filteredPool].sort(() => Math.random() - 0.5).slice(0, 20);
    setPool(shuffled);
    setCurrent(0);
    setScore(0);
    setFinished(false);
    setStarted(true);
    setQuestion(buildQuestion(shuffled[0], filteredPool));
  }, [filteredPool, buildQuestion]);

  const handleAnswer = (choice: HanjaEntry) => {
    if (!question || question.answered) return;
    const correct = choice.korean === question.entry.korean;
    setQuestion(prev => prev ? { ...prev, answered: true, selected: choice.korean } : null);
    if (correct) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    const nextIdx = current + 1;
    if (nextIdx >= pool.length) { setFinished(true); return; }
    setCurrent(nextIdx);
    setQuestion(buildQuestion(pool[nextIdx], filteredPool));
  };

  const getChoiceLabel = (choice: HanjaEntry) => {
    if (mode === "ko2vi") return choice.vietnamese;
    if (mode === "vi2ko") return choice.korean;
    if (mode === "listen") return choice.korean;
    return choice.korean;
  };

  const getQuestionText = () => {
    if (!question) return "";
    if (mode === "ko2vi") return question.entry.korean;
    if (mode === "vi2ko") return question.entry.vietnamese;
    if (mode === "listen") return "?";
    return question.entry.hanja;
  };

  const getQuestionSub = () => {
    if (!question) return "";
    if (mode === "ko2vi") return question.entry.hanja;
    if (mode === "vi2ko") return question.entry.hanja;
    if (mode === "listen") return "Nghe và chọn từ Hàn đúng";
    return question.entry.vietnamese;
  };

  // Auto-speak when listen mode and new question
  const handleListenSpeak = () => {
    if (!question) return;
    speakKorean(question.entry.korean);
  };

  if (!started) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-app-surface/50 border border-app-border rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 flex items-center justify-center bg-app-accent-primary/10 rounded-2xl mx-auto mb-3">
              <i className="ri-gamepad-line text-app-accent-primary text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">Quiz Hán-Hàn</h2>
            <p className="text-sm text-white/50">Chọn chế độ và bắt đầu luyện tập</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {([
              { key: "ko2vi", label: "Hàn → Việt", icon: "ri-arrow-right-line" },
              { key: "vi2ko", label: "Việt → Hàn", icon: "ri-arrow-left-line" },
              { key: "hanja2ko", label: "Hán → Hàn", icon: "ri-translate-2" },
              { key: "listen", label: "Nghe & Chọn", icon: "ri-headphone-line" },
            ] as { key: QuizMode; label: string; icon: string }[]).map(m => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`p-3 rounded-xl border-2 text-xs font-medium cursor-pointer transition-all text-center ${mode === m.key ? "border-app-accent-primary bg-app-accent-primary/10 text-app-accent-primary" : "border-app-border text-white/60 hover:border-app-border"}`}
              >
                <i className={`${m.icon} block text-lg mb-1`}></i>
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setOnlyFavs(f => !f)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${onlyFavs ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/60"}`}
            >
              <i className="ri-heart-line"></i>Chỉ từ yêu thích ({favs.size})
            </button>
          </div>

          <div className="mb-5">
            <p className="text-xs text-white/50 mb-2">Lọc theo chữ cái đầu</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedInitial(null)}
                className={`px-2.5 py-1 rounded-full text-xs cursor-pointer whitespace-nowrap transition-all ${!selectedInitial ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/60"}`}
              >
                Tất cả ({HANJA_DATA.length})
              </button>
              {ALPHABET_GROUPS.map(g => {
                const cnt = HANJA_DATA.filter(d => getInitial(d.korean[0]) === g).length;
                if (cnt === 0) return null;
                return (
                  <button key={g} onClick={() => setSelectedInitial(selectedInitial === g ? null : g)}
                    className={`px-2.5 py-1 rounded-full text-xs cursor-pointer whitespace-nowrap transition-all ${selectedInitial === g ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/60"}`}
                  >
                    {g} ({cnt})
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={startQuiz}
            disabled={filteredPool.length < 4}
            className="w-full py-3 bg-app-accent-primary text-app-bg rounded-xl font-semibold cursor-pointer hover:bg-app-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Bắt đầu Quiz ({Math.min(20, filteredPool.length)} câu)
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / pool.length) * 100);
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-app-surface/50 border border-app-border rounded-2xl p-8 text-center">
          <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4 ${pct >= 80 ? "bg-green-500/10" : pct >= 50 ? "bg-yellow-500/10" : "bg-red-500/10"}`}>
            <i className={`text-3xl ${pct >= 80 ? "ri-trophy-line text-green-400" : pct >= 50 ? "ri-emotion-normal-line text-yellow-400" : "ri-emotion-sad-line text-red-400"}`}></i>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{pct}%</p>
          <p className="text-white/50 mb-2">Đúng {score} / {pool.length} câu</p>
          <p className="text-sm text-white/40 mb-8">
            {pct >= 80 ? "Xuất sắc! Bạn nắm rất tốt Hán-Hàn!" : pct >= 50 ? "Khá tốt! Tiếp tục luyện tập nhé!" : "Cần ôn thêm! Đừng nản lòng!"}
          </p>
          <div className="flex gap-3">
            <button onClick={startQuiz} className="flex-1 py-3 bg-app-accent-primary text-app-bg rounded-xl font-semibold cursor-pointer hover:bg-app-accent-primary/90 transition-colors">Làm lại</button>
            <button onClick={() => setStarted(false)} className="flex-1 py-3 border border-app-border text-white/70 rounded-xl font-semibold cursor-pointer hover:bg-app-surface/50 transition-colors">Đổi chế độ</button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const isCorrect = (c: HanjaEntry) => c.korean === question.entry.korean;
  const isSelected = (c: HanjaEntry) => c.korean === question.selected;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/50">Câu {current + 1} / {pool.length}</span>
        <span className="text-sm font-semibold text-app-accent-primary">Đúng: {score}</span>
      </div>
      <div className="w-full bg-app-surface/50 rounded-full h-2 mb-6">
        <div className="bg-app-accent-primary h-2 rounded-full transition-all" style={{ width: `${(current / pool.length) * 100}%` }}></div>
      </div>

      <div className="bg-app-surface/50 border border-app-border rounded-2xl p-8 text-center mb-4">
        <p className="text-xs text-white/40 mb-2 tracking-wide">
          {mode === "ko2vi" ? "Từ tiếng Hàn này có nghĩa là gì?" : mode === "vi2ko" ? "Từ tiếng Việt này là từ Hàn nào?" : mode === "listen" ? "Nghe và chọn từ Hàn đúng" : "Hán tự này đọc là gì?"}
        </p>
        {mode === "listen" ? (
          <div className="flex flex-col items-center gap-3">
            <button onClick={handleListenSpeak}
              className="w-20 h-20 flex items-center justify-center bg-app-accent-primary/10 rounded-full cursor-pointer hover:bg-app-accent-primary/20 transition-all">
              <i className="ri-volume-up-line text-app-accent-primary text-4xl"></i>
            </button>
            <p className="text-sm text-white/40">Nhấn để nghe lại</p>
          </div>
        ) : (
          <>
            <p className="text-4xl font-bold text-white mb-2">{getQuestionText()}</p>
            <p className="text-sm text-white/40">{getQuestionSub()}</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {question.choices.map((choice, i) => {
          let cls = "border-2 border-app-border bg-app-surface/50 text-white/70 hover:border-app-accent-primary";
          if (question.answered) {
            if (isCorrect(choice)) cls = "border-2 border-green-500 bg-green-500/10 text-green-400";
            else if (isSelected(choice)) cls = "border-2 border-red-500 bg-red-500/10 text-red-400";
            else cls = "border-2 border-app-border bg-app-surface/30 text-white/40";
          }
          return (
            <button key={i} onClick={() => handleAnswer(choice)} disabled={question.answered}
              className={`p-4 rounded-xl text-sm font-medium cursor-pointer transition-all text-left ${cls} disabled:cursor-default`}>
              {question.answered && isCorrect(choice) && <i className="ri-check-line text-green-400 mr-1"></i>}
              {question.answered && isSelected(choice) && !isCorrect(choice) && <i className="ri-close-line text-red-400 mr-1"></i>}
              {getChoiceLabel(choice)}
            </button>
          );
        })}
      </div>

      {question.answered && (
        <button onClick={nextQuestion} className="w-full py-3 bg-app-accent-primary text-app-bg rounded-xl font-semibold cursor-pointer hover:bg-app-accent-primary/90 transition-colors">
          {current + 1 >= pool.length ? "Xem kết quả" : "Câu tiếp theo →"}
        </button>
      )}
    </div>
  );
}

// ─── Roots Tab ────────────────────────────────────────────────────────────────
function RootsTab() {
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const HANJA_DATA = useHanjaData();
  const charMap = useMemo(() => {
    const map = new Map<string, HanjaEntry[]>();
    HANJA_DATA.forEach(entry => {
      extractHanjaChars(entry.hanja).forEach(c => {
        if (!map.has(c)) map.set(c, []);
        map.get(c)!.push(entry);
      });
    });
    return map;
  }, [HANJA_DATA]);

  const allChars = useMemo(() =>
    Array.from(charMap.entries())
      .filter(([, w]) => w.length >= 2)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([c]) => c),
    [charMap]
  );

  const filteredChars = useMemo(() => {
    if (!search.trim()) return allChars;
    return allChars.filter(c =>
      (charMap.get(c) || []).some(w =>
        w.korean.includes(search) || w.vietnamese.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [allChars, charMap, search]);

  const relatedWords = useMemo(() => selectedChar ? (charMap.get(selectedChar) || []) : [], [selectedChar, charMap]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-80 flex-shrink-0">
        <div className="bg-app-surface/50 border border-app-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-app-border">
            <p className="text-sm font-semibold text-white mb-3">Chọn Hán tự để xem từ đồng gốc</p>
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>
              <input type="text" placeholder="Tìm từ..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-app-border rounded-lg text-sm bg-app-surface/50 text-white focus:outline-none focus:ring-2 focus:ring-app-accent-primary" />
            </div>
          </div>
          <div className="p-3 max-h-[500px] overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {filteredChars.map(c => (
                <button key={c} onClick={() => setSelectedChar(selectedChar === c ? null : c)}
                  className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 cursor-pointer transition-all ${selectedChar === c ? "border-app-accent-primary bg-app-accent-primary/10" : "border-app-border bg-app-surface/30 hover:border-app-accent-primary/50"}`}
                >
                  <span className={`text-xl font-bold ${selectedChar === c ? "text-app-accent-primary" : "text-white"}`}>{c}</span>
                  <span className="text-xs text-white/40">{charMap.get(c)?.length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {!selectedChar ? (
          <div className="bg-app-surface/50 border border-app-border rounded-2xl p-12 text-center">
            <div className="w-16 h-16 flex items-center justify-center bg-app-accent-primary/10 rounded-2xl mx-auto mb-4">
              <i className="ri-links-line text-app-accent-primary text-2xl"></i>
            </div>
            <p className="text-white/50 font-medium mb-1">Chọn một Hán tự</p>
            <p className="text-sm text-white/40">Xem tất cả từ tiếng Hàn có chứa chữ Hán đó</p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {["國","民","學","大","文","力","人","心","生","水","白","方"].map(c =>
                charMap.has(c) && (
                  <button key={c} onClick={() => setSelectedChar(c)}
                    className="px-4 py-2 bg-app-accent-primary/10 text-app-accent-primary rounded-lg text-lg font-bold cursor-pointer hover:bg-app-accent-primary/20 transition-colors"
                  >{c}</button>
                )
              )}
            </div>
          </div>
        ) : (
          <div className="bg-app-surface/50 border border-app-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-app-border flex items-center gap-4">
              <div className="w-14 h-14 flex items-center justify-center bg-app-accent-primary/10 rounded-xl">
                <span className="text-3xl font-bold text-app-accent-primary">{selectedChar}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Từ đồng gốc &ldquo;{selectedChar}&rdquo;</h3>
                <p className="text-sm text-white/50">{relatedWords.length} từ chứa chữ này</p>
              </div>
              <button onClick={() => setSelectedChar(null)}
                className="ml-auto w-8 h-8 flex items-center justify-center text-white/40 hover:text-white/60 cursor-pointer rounded-lg hover:bg-app-surface/50"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="divide-y divide-app-border">
              {relatedWords.map((word, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3 hover:bg-app-accent-primary/5 transition-colors">
                  <span className="text-base font-bold text-white w-24">{word.korean}</span>
                  <span className="text-base font-bold w-24">
                    {word.hanja.split("").map((ch, j) =>
                      ch === selectedChar
                        ? <span key={j} className="text-app-accent-primary font-bold">{ch}</span>
                        : <span key={j}>{ch}</span>
                    )}
                  </span>
                  <span className="text-sm text-white/50 flex-1">{word.vietnamese}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function HanjaVocabPageInner() {
  const navigate = useNavigate();
  const hanjaDB = useHanjaData();
  const isLoadingDB = useHanjaLoading();
  const [activeTab, setActiveTab] = useState<TabType>("vocab");
  const { favs, toggle: toggleFav } = useFavorites();
  const { notes, saveNote } = useNotes();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (activeTab !== "flashcard") return;
      if (e.key === "ArrowRight") document.getElementById("fc-next")?.click();
      if (e.key === "ArrowLeft") document.getElementById("fc-prev")?.click();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTab]);

  const tabs: { key: TabType; label: string; icon: string; badge?: number; isNew?: boolean }[] = [
    { key: "vocab", label: "Từ vựng", icon: "ri-book-open-line" },
    { key: "search", label: "Tìm thông minh", icon: "ri-search-eye-line" },
    { key: "synonym", label: "Đồng nghĩa/âm", icon: "ri-git-merge-line" },
    { key: "antonym", label: "Đối nghĩa", icon: "ri-arrow-left-right-line" },
    { key: "hanviet", label: "So sánh Hán Việt", icon: "ri-translate-2", isNew: true },
    { key: "examples", label: "Câu ví dụ", icon: "ri-newspaper-line", isNew: true },
    { key: "flashcard", label: "Flashcard", icon: "ri-stack-line" },
    { key: "quickreview", label: "Quick Review", icon: "ri-flashlight-line" },
    { key: "quiz", label: "Quiz", icon: "ri-gamepad-line" },
    { key: "sr", label: "Spaced Rep", icon: "ri-brain-line" },
    { key: "roots", label: "Đồng gốc", icon: "ri-links-line" },
    { key: "topics", label: "Chủ đề", icon: "ri-apps-line" },
    { key: "ranking", label: "Xếp hạng", icon: "ri-medal-line" },
    { key: "stats", label: "Thống kê", icon: "ri-bar-chart-line" },
    { key: "favorites", label: "Yêu thích", icon: "ri-heart-line", badge: favs.size },
    ...(isAdmin ? [{ key: "export" as TabType, label: "Xuất flashcard", icon: "ri-download-2-line" }] : []),
    { key: "weekly", label: "Thách thức tuần", icon: "ri-sword-line" },
    { key: "leaderboard", label: "Bảng xếp hạng", icon: "ri-bar-chart-horizontal-line" },
    { key: "homophone", label: "Đồng âm khác nghĩa", icon: "ri-sound-module-line" },
    { key: "topik-exam", label: "Thi thử TOPIK", icon: "ri-file-paper-2-line" },
    { key: "pronunciation", label: "Luyện phát âm", icon: "ri-mic-line" },
    { key: "smart-review", label: "Ôn tập thông minh", icon: "ri-brain-line", isNew: true },
    { key: "advanced-topics", label: "Chủ đề nâng cao", icon: "ri-graduation-cap-line", isNew: true },
    { key: "diary", label: "Nhật ký học tập", icon: "ri-book-2-line", isNew: true },
    { key: "word-match", label: "Ghép cặp", icon: "ri-drag-drop-line", isNew: true },
  ];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/50 hover:text-white/70 mb-4 cursor-pointer">
            <i className="ri-arrow-left-line"></i>
            <span className="text-sm">Quay lại</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-app-accent-primary/10 rounded-xl">
              <i className="ri-translate-2 text-app-accent-primary text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Từ vựng Hán-Hàn</h1>
              <p className="text-sm text-white/50">
                {isLoadingDB
                  ? <span className="inline-flex items-center gap-1"><i className="ri-loader-4-line animate-spin text-xs"></i>Đang tải dữ liệu...</span>
                  : <>{hanjaDB.length} từ · {favs.size} yêu thích</>}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs — scrollable on mobile */}
        <div className="mb-6 -mx-4 md:mx-0">
          <div className="flex flex-wrap gap-1 bg-app-surface/50 rounded-none md:rounded-xl p-1">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all relative flex-shrink-0 ${activeTab === t.key ? "bg-app-surface/70 text-app-accent-primary" : "text-white/50 hover:text-white/70"}`}
              >
                <i className={t.icon}></i>
                <span className="hidden sm:inline">{t.label}</span>
                <span className="sm:hidden">{t.label.split(" ")[0]}</span>
                {t.isNew && (
                  <span className="absolute -top-2 -right-2 text-[7px] px-1.5 py-0.5 rounded-full bg-amber-400 text-white font-bold leading-none whitespace-nowrap">NEW</span>
                )}
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center bg-app-accent-primary text-white text-[9px] rounded-full leading-none">
                    {t.badge > 9 ? "9+" : t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <Suspense fallback={<TabFallback />}>
          {activeTab === "search" && <SmartSearchTab />}
          {activeTab === "synonym" && <SynonymGroupTab />}
          {activeTab === "antonym" && <AntonymTab />}
          {activeTab === "hanviet" && <HanVietCompareTab />}
          {activeTab === "examples" && <ExampleSentenceTab />}
          {activeTab === "vocab" && <VocabTab favs={favs} onToggleFav={toggleFav} />}
          {activeTab === "flashcard" && <FlashcardTab favs={favs} onToggleFav={toggleFav} />}
          {activeTab === "quickreview" && <QuickReviewTab favs={favs} />}
          {activeTab === "quiz" && <QuizTab favs={favs} />}
          {activeTab === "sr" && <SRTab favs={favs} />}
          {activeTab === "roots" && <RootsTab />}
          {activeTab === "topics" && <TopicStudyTab />}
          {activeTab === "ranking" && <PersonalRankingTab />}
          {activeTab === "stats" && <StatsTab />}
          {activeTab === "export" && <FlashcardExportTab />}
          {activeTab === "weekly" && <WeeklyChallengeTab />}
          {activeTab === "leaderboard" && <WeeklyLeaderboardTab />}
          {activeTab === "homophone" && <HomophoneTab />}
          {activeTab === "topik-exam" && <TopikMockExamTab />}
          {activeTab === "pronunciation" && <PronunciationTab />}
          {activeTab === "smart-review" && <SmartReviewTab />}
          {activeTab === "advanced-topics" && <AdvancedTopicTab />}
          {activeTab === "diary" && <StudyDiaryTab />}
          {activeTab === "word-match" && <WordMatchTab />}
          {activeTab === "favorites" && (
            <FavoritesTab
              favs={favs}
              onToggleFav={toggleFav}
              onStartFlashcard={() => setActiveTab("flashcard")}
              notes={notes}
              onSaveNote={saveNote}
            />
          )}
        </Suspense>
      </div>
    </DashboardLayout>
  );
}

export default function HanjaVocabPage() {
  return (
    <HanjaDataProvider>
      <HanjaVocabPageInner />
    </HanjaDataProvider>
  );
}

