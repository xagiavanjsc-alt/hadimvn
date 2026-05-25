import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { vocabularyData, VOCAB_CATEGORIES, type VocabItem } from "@/mocks/vocabularyData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useVipYearGuard } from "@/hooks/useVipYearGuard";
import VipUpgradeModal from "@/components/feature/VipUpgradeModal";

type CardState = "front" | "back";
type Difficulty = "easy" | "medium" | "hard" | "skip";

interface SpacedCard {
  id: string;
  nextReview: number; // timestamp
  interval: number; // days
  easeFactor: number;
  repetitions: number;
  lastDifficulty?: Difficulty;
}

interface FlashcardSession {
  cards: SpacedCard[];
  lastUpdated: number;
}

const LEVELS = [
  { id: "all", label: "Tất cả", color: "#e8c84a" },
  { id: "A1", label: "A1", color: "#34d399" },
  { id: "A2", label: "A2", color: "#38bdf8" },
  { id: "B1", label: "B1", color: "#fb923c" },
  { id: "B2", label: "B2", color: "#f87171" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// SM-2 algorithm
function updateCard(card: SpacedCard, difficulty: Difficulty): SpacedCard {
  const q = difficulty === "easy" ? 5 : difficulty === "medium" ? 3 : difficulty === "hard" ? 1 : 0;
  let { interval, easeFactor, repetitions } = card;

  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  return {
    ...card,
    interval,
    easeFactor,
    repetitions,
    nextReview: Date.now() + interval * 24 * 60 * 60 * 1000,
    lastDifficulty: difficulty,
  };
}

export default function TopikFlashcardPage() {
  const [phase, setPhase] = useState<"setup" | "study" | "done">("setup");
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sessionSize, setSessionSize] = useState(20);
  const [sessionCards, setSessionCards] = useState<VocabItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [cardState, setCardState] = useState<CardState>("front");
  const [isFlipping, setIsFlipping] = useState(false);
  const [sessionStats, setSessionStats] = useState({ easy: 0, medium: 0, hard: 0, skip: 0 });
  const [autoPlay, setAutoPlay] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle");
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  const { user } = useAuth();
  const { isVipYear, checkAndRun, modalOpen, modalReason, closeModal } = useVipYearGuard();

  const [spacedData, setSpacedData] = useLocalStorage<FlashcardSession>("topik_spaced_v1", {
    cards: [],
    lastUpdated: Date.now(),
  });

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeHint, setSwipeHint] = useState<"left" | "right" | null>(null);

  // ─── Supabase Sync ────────────────────────────────────────────────────────
  const syncToSupabase = useCallback(async () => {
    if (!user || spacedData.cards.length === 0) return;
    setSyncStatus("syncing");
    try {
      const upsertData = spacedData.cards.map((c) => ({
        user_id: user.id,
        card_id: c.id,
        next_review: c.nextReview,
        interval_days: c.interval,
        ease_factor: c.easeFactor,
        repetitions: c.repetitions,
        last_difficulty: c.lastDifficulty || null,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("topik_flashcard_progress")
        .upsert(upsertData, { onConflict: "user_id,card_id" });

      if (error) throw error;
      setSyncStatus("synced");
      setLastSyncTime(Date.now());
    } catch {
      setSyncStatus("error");
    }
  }, [user, spacedData.cards]);

  const syncFromSupabase = useCallback(async () => {
    if (!user) return;
    setSyncStatus("syncing");
    try {
      const { data, error } = await supabase
        .from("topik_flashcard_progress")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      if (data && data.length > 0) {
        const cards: SpacedCard[] = data.map((row) => ({
          id: row.card_id,
          nextReview: row.next_review,
          interval: row.interval_days,
          easeFactor: parseFloat(row.ease_factor),
          repetitions: row.repetitions,
          lastDifficulty: row.last_difficulty as Difficulty | undefined,
        }));
        setSpacedData({ cards, lastUpdated: Date.now() });
        setSyncStatus("synced");
        setLastSyncTime(Date.now());
      } else {
        setSyncStatus("idle");
      }
    } catch {
      setSyncStatus("error");
    }
  }, [user, setSpacedData]);

  // Auto-sync when user logs in
  useEffect(() => {
    if (user) {
      syncFromSupabase();
    }
  }, [user?.id]);

  // Auto-sync to cloud every 2 minutes during study
  useEffect(() => {
    if (!user || phase !== "study") return;
    const interval = setInterval(() => syncToSupabase(), 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, phase, syncToSupabase]);

  const getCardData = useCallback(
    (id: string): SpacedCard => {
      return (
        spacedData.cards.find((c) => c.id === id) || {
          id,
          nextReview: 0,
          interval: 1,
          easeFactor: 2.5,
          repetitions: 0,
        }
      );
    },
    [spacedData]
  );

  const filteredWords = vocabularyData.filter((w) => {
    const catOk = selectedCategory === "all" || w.category === selectedCategory;
    const lvlOk = selectedLevel === "all" || w.topikLevel === selectedLevel;
    return catOk && lvlOk;
  });

  // Due cards (spaced repetition)
  const dueCards = filteredWords.filter((w) => {
    const cd = getCardData(w.id);
    return cd.nextReview <= Date.now();
  });

  const newCards = filteredWords.filter((w) => {
    const cd = getCardData(w.id);
    return cd.repetitions === 0;
  });

  const startSession = () => {
    // Prioritize due cards, then new cards
    const pool = shuffle([...dueCards, ...newCards.filter((w) => !dueCards.find((d) => d.id === w.id))]);
    const selected = pool.slice(0, Math.min(sessionSize, pool.length));
    if (selected.length === 0) return;
    setSessionCards(selected);
    setCurrentIdx(0);
    setCardState("front");
    setSessionStats({ easy: 0, medium: 0, hard: 0, skip: 0 });
    setShowExample(false);
    setPhase("study");
  };

  const flipCard = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setCardState((s) => (s === "front" ? "back" : "front"));
      setIsFlipping(false);
    }, 150);
  };

  const handleDifficulty = (diff: Difficulty) => {
    const word = sessionCards[currentIdx];
    const card = getCardData(word.id);
    const updated = updateCard(card, diff);

    setSpacedData((prev) => ({
      cards: [...prev.cards.filter((c) => c.id !== word.id), updated],
      lastUpdated: Date.now(),
    }));

    setSessionStats((s) => ({ ...s, [diff]: s[diff] + 1 }));

    if (currentIdx + 1 >= sessionCards.length) {
      setPhase("done");
      // Sync to cloud when session ends
      if (user) setTimeout(() => syncToSupabase(), 500);
    } else {
      setCurrentIdx((i) => i + 1);
      setCardState("front");
      setShowExample(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.touches[0].clientY - (touchStartY.current ?? 0));
    if (Math.abs(dx) > 25 && dy < 60) {
      setSwipeHint(dx > 0 ? "right" : "left");
    } else {
      setSwipeHint(null);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setSwipeHint(null);
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - (touchStartY.current ?? 0));
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) > 70 && dy < 80) {
      if (cardState === "front") {
        flipCard();
        return;
      }
      if (dx > 0) handleDifficulty("easy");
      else handleDifficulty("hard");
    }
  };

  // Auto-play: auto flip after 3s
  useEffect(() => {
    if (!autoPlay || phase !== "study" || cardState === "back") return;
    const t = setTimeout(() => flipCard(), 3000);
    return () => clearTimeout(t);
  }, [autoPlay, phase, cardState, currentIdx]);

  const currentWord = sessionCards[currentIdx];
  const progress = sessionCards.length > 0 ? (currentIdx / sessionCards.length) * 100 : 0;

  const totalReviewed = Object.values(sessionStats).reduce((a, b) => a + b, 0);
  const masteredCount = spacedData.cards.filter((c) => c.repetitions >= 3).length;

  if (phase === "setup") {
    return (
      <DashboardLayout>
        <div className="p-6 max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Flashcard TOPIK</h1>
            <p className="text-app-text-secondary text-sm">Luyện từ vựng TOPIK I/II với spaced repetition — hệ thống tự động nhắc lại đúng lúc</p>
          </div>

          {/* Sync status banner */}
          {user ? (
            <div className={`flex items-center justify-between px-4 py-3 rounded-xl border mb-5 ${
              syncStatus === "synced" ? "bg-emerald-500/8 border-emerald-500/20" :
              syncStatus === "syncing" ? "bg-app-accent-primary/8 border-app-accent-primary/20" :
              syncStatus === "error" ? "bg-red-500/8 border-red-500/20" :
              "bg-app-surface/50 border-app-border"
            }`}>
              <div className="flex items-center gap-2">
                <i className={`text-sm ${
                  syncStatus === "synced" ? "ri-cloud-line text-app-accent-success" :
                  syncStatus === "syncing" ? "ri-loader-4-line text-app-accent-primary animate-spin" :
                  syncStatus === "error" ? "ri-cloud-off-line text-red-400" :
                  "ri-cloud-line text-app-text-muted"
                }`}></i>
                <div>
                  <p className="text-white/60 text-xs font-medium">
                    {syncStatus === "synced" ? "Đã đồng bộ lên cloud" :
                     syncStatus === "syncing" ? "Đang đồng bộ..." :
                     syncStatus === "error" ? "Lỗi đồng bộ" :
                     "Chưa đồng bộ"}
                  </p>
                  {lastSyncTime && (
                    <p className="text-app-text-muted text-[10px]">
                      Lần cuối: {new Date(lastSyncTime).toLocaleTimeString("vi-VN")}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={syncFromSupabase}
                  disabled={syncStatus === "syncing"}
                  className="px-3 py-1 rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary text-xs cursor-pointer whitespace-nowrap border border-app-border transition-all"
                >
                  <i className="ri-download-cloud-line mr-1"></i>Tải về
                </button>
                <button
                  onClick={syncToSupabase}
                  disabled={syncStatus === "syncing"}
                  className="px-3 py-1 rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary text-xs cursor-pointer whitespace-nowrap border border-app-border transition-all"
                >
                  <i className="ri-upload-cloud-line mr-1"></i>Lưu lên
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-app-border bg-app-surface/50 mb-5">
              <i className="ri-cloud-off-line text-app-text-muted text-sm"></i>
              <p className="text-app-text-muted text-xs">Đăng nhập để đồng bộ tiến độ lên cloud — không mất dữ liệu khi đổi thiết bị</p>
            </div>
          )}

          {/* Stats overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-app-accent-primary">{dueCards.length}</p>
              <p className="text-app-text-secondary text-xs">Cần ôn hôm nay</p>
            </div>
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-app-accent-success">{masteredCount}</p>
              <p className="text-app-text-secondary text-xs">Đã thuộc</p>
            </div>
            <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{filteredWords.length}</p>
              <p className="text-app-text-secondary text-xs">Tổng từ</p>
            </div>
          </div>

          {/* Level */}
          <div className="mb-5">
            <p className="text-white/60 text-xs tracking-normal mb-3">Cấp độ</p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((lv) => (
                <button
                  key={lv.id}
                  onClick={() => setSelectedLevel(lv.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    selectedLevel === lv.id ? "text-white" : "border-app-border text-app-text-secondary hover:text-white/70"
                  }`}
                  style={
                    selectedLevel === lv.id
                      ? { backgroundColor: `${lv.color}20`, borderColor: `${lv.color}60`, color: lv.color }
                      : {}
                  }
                >
                  {lv.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div className="mb-5">
            <p className="text-white/60 text-xs tracking-normal mb-3">Chủ đề</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                  selectedCategory === "all"
                    ? "bg-app-accent-primary/15 border-app-accent-primary/40 text-app-accent-primary"
                    : "border-app-border text-app-text-secondary hover:text-white/70"
                }`}
              >
                Tất cả
              </button>
              {VOCAB_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                    selectedCategory === cat.id ? "text-white" : "border-app-border text-app-text-secondary hover:text-white/70"
                  }`}
                  style={
                    selectedCategory === cat.id
                      ? { backgroundColor: `${cat.color}20`, borderColor: `${cat.color}60`, color: cat.color }
                      : {}
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Session size */}
          <div className="mb-8">
            <p className="text-white/60 text-xs tracking-normal mb-3">Số thẻ mỗi phiên</p>
            <div className="flex gap-2">
              {[10, 20, 30, 50].map((n) => (
                <button
                  key={n}
                  onClick={() => setSessionSize(n)}
                  className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    sessionSize === n
                      ? "bg-app-accent-primary/15 border-app-accent-primary/40 text-app-accent-primary"
                      : "border-app-border text-app-text-secondary hover:text-white/70"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startSession}
            disabled={filteredWords.length === 0}
            className="w-full py-3.5 bg-app-accent-primary hover:bg-app-accent-primary/90 text-black font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-40"
          >
            <i className="ri-stack-line mr-2"></i>
            Bắt đầu học ({Math.min(sessionSize, dueCards.length + newCards.length)} thẻ)
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // PDF export for hard/skipped words
  const exportHardWordsPDF = () => {
    const hardWords = sessionCards.filter((_, idx) => {
      // words rated hard or skip in this session
      const card = spacedData.cards.find((c) => c.id === sessionCards[idx]?.id);
      return card?.lastDifficulty === "hard" || card?.lastDifficulty === "skip";
    });

    // Collect all hard words from spaced data
    const allHardIds = spacedData.cards
      .filter((c) => c.lastDifficulty === "hard" || c.repetitions < 2)
      .map((c) => c.id);
    const allHardWords = vocabularyData.filter((w) => allHardIds.includes(w.id));
    const exportWords = allHardWords.length > 0 ? allHardWords : sessionCards;

    const levelColors: Record<string, string> = { A1: "#34d399", A2: "#38bdf8", B1: "#fb923c", B2: "#f87171" };

    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Từ vựng TOPIK cần ôn tập</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&family=Be+Vietnam+Pro:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Be Vietnam Pro', 'Noto Sans KR', sans-serif; background: #fff; color: #1a1a2e; padding: 32px; }
  .header { text-align: center; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0; }
  .header h1 { font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 6px; }
  .header p { font-size: 13px; color: #888; }
  .stats { display: flex; gap: 16px; justify-content: center; margin-bottom: 28px; }
  .stat { background: #f8f9fa; border-radius: 10px; padding: 12px 20px; text-align: center; }
  .stat-num { font-size: 22px; font-weight: 700; color: #1a1a2e; }
  .stat-label { font-size: 11px; color: #888; margin-top: 2px; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .card { border: 1.5px solid #f0f0f0; border-radius: 12px; padding: 16px; background: #fafafa; }
  .card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .korean { font-size: 22px; font-weight: 700; color: #1a1a2e; }
  .level-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; }
  .reading { font-size: 12px; color: #888; margin-bottom: 6px; }
  .vietnamese { font-size: 15px; font-weight: 600; color: #333; margin-bottom: 8px; }
  .example { font-size: 12px; color: #555; background: #f0f0f0; border-radius: 6px; padding: 8px 10px; }
  .example-vi { font-size: 11px; color: #888; margin-top: 4px; font-style: italic; }
  .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #f0f0f0; font-size: 11px; color: #bbb; }
  @media print { body { padding: 16px; } .grid { grid-template-columns: repeat(2, 1fr); } }
</style>
</head>
<body>
<div class="header">
  <h1>📚 Từ vựng TOPIK cần ôn tập</h1>
  <p>Xuất ngày ${new Date().toLocaleDateString("vi-VN")} · Hàn Quốc Ơi!</p>
</div>
<div class="stats">
  <div class="stat"><div class="stat-num">${exportWords.length}</div><div class="stat-label">Từ cần ôn</div></div>
  <div class="stat"><div class="stat-num">${exportWords.filter(w => w.topikLevel === "A1" || w.topikLevel === "A2").length}</div><div class="stat-label">Sơ cấp (A1-A2)</div></div>
  <div class="stat"><div class="stat-num">${exportWords.filter(w => w.topikLevel === "B1" || w.topikLevel === "B2").length}</div><div class="stat-label">Trung cấp (B1-B2)</div></div>
</div>
<div class="grid">
${exportWords.map(w => `
  <div class="card">
    <div class="card-top">
      <span class="korean">${w.korean}</span>
      <span class="level-badge" style="background:${levelColors[w.topikLevel]}22;color:${levelColors[w.topikLevel]}">${w.topikLevel}</span>
    </div>
    <div class="reading">[${w.reading}]</div>
    <div class="vietnamese">${w.vietnamese}</div>
    <div class="example">
      <div>${w.example}</div>
      <div class="example-vi">${w.exampleVi}</div>
    </div>
  </div>
`).join("")}
</div>
<div class="footer">Tạo bởi Hàn Quốc Ơi! · Học tiếng Hàn mỗi ngày</div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.onload = () => {
        setTimeout(() => {
          win.print();
        }, 500);
      };
    }
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  if (phase === "done") {
    const total = Object.values(sessionStats).reduce((a, b) => a + b, 0);
    const hardCount = sessionStats.hard + sessionStats.skip;
    return (
      <DashboardLayout>
        <div className="p-6 max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-app-accent-success/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-double-line text-app-accent-success text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Phiên học hoàn thành!</h2>
          <p className="text-app-text-secondary text-sm mb-8">Hệ thống đã lên lịch ôn tập thông minh cho bạn</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {(["easy", "medium", "hard", "skip"] as Difficulty[]).map((d) => {
              const colors = { easy: "#34d399", medium: "#e8c84a", hard: "#fb923c", skip: "#94a3b8" };
              const labels = { easy: "Dễ", medium: "Ổn", hard: "Khó", skip: "Bỏ qua" };
              return (
                <div key={d} className="bg-app-surface/50 border border-app-border rounded-xl p-3 text-center">
                  <p className="text-xl font-bold" style={{ color: colors[d] }}>{sessionStats[d]}</p>
                  <p className="text-app-text-muted text-xs">{labels[d]}</p>
                </div>
              );
            })}
          </div>

          {/* PDF Export button */}
          {hardCount > 0 && (
            <button
              onClick={() => checkAndRun(exportHardWordsPDF)}
              className={`w-full py-3 mb-4 border font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
                isVipYear
                  ? "bg-[#fb923c]/10 hover:bg-[#fb923c]/20 border-[#fb923c]/30 text-[#fb923c]"
                  : "bg-app-card/50 border-app-border text-app-text-muted"
              }`}
            >
              <i className={isVipYear ? "ri-file-pdf-line text-base" : "ri-lock-line text-base"}></i>
              {isVipYear ? `Xuất ${hardCount} từ khó thành PDF` : "Chỉ VIP Năm"}
            </button>
          )}

          <button
            onClick={() => checkAndRun(exportHardWordsPDF)}
            className={`w-full py-2.5 mb-4 border text-sm rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 ${
              isVipYear
                ? "bg-app-surface/50 hover:bg-white/6 border-app-border text-white/50"
                : "bg-app-surface/50 border-app-border text-app-text-muted"
            }`}
          >
            <i className={isVipYear ? "ri-download-line text-sm" : "ri-lock-line text-sm"}></i>
            {isVipYear ? "Xuất toàn bộ từ cần ôn (PDF)" : "Chỉ VIP Năm mới xuất được"}
          </button>

          {/* VIP Upgrade Modal */}
          <VipUpgradeModal
            open={modalOpen}
            onClose={closeModal}
            reason={modalReason ?? "not_vip_year"}
            featureName="Xuất PDF từ vựng TOPIK"
          />

          <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 mb-6 text-left">
            <p className="text-white/50 text-xs mb-2">Lịch ôn tập tiếp theo</p>
            <p className="text-white/70 text-sm">
              Thẻ "Dễ" → ôn lại sau <span className="text-app-accent-success font-bold">6 ngày</span>
            </p>
            <p className="text-white/70 text-sm">
              Thẻ "Ổn" → ôn lại sau <span className="text-app-accent-primary font-bold">3 ngày</span>
            </p>
            <p className="text-white/70 text-sm">
              Thẻ "Khó" → ôn lại <span className="text-red-400 font-bold">ngày mai</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setPhase("setup")}
              className="flex-1 py-3 bg-app-card/50 hover:bg-app-card/70 text-white/70 font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap border border-app-border"
            >
              Cài đặt lại
            </button>
            <button
              onClick={startSession}
              className="flex-1 py-3 bg-app-accent-primary hover:bg-app-accent-primary/90 text-black font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refresh-line mr-2"></i>Học tiếp
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Study phase — add touch handlers to the flashcard div
  return (
    <DashboardLayout>
      <div className="p-6 max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setPhase("setup")}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 text-white/50 cursor-pointer"
          >
            <i className="ri-arrow-left-line text-sm"></i>
          </button>
          <div className="text-center">
            <p className="text-white/60 text-sm">{currentIdx + 1} / {sessionCards.length}</p>
          </div>
          <button
            onClick={() => setAutoPlay((a) => !a)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
              autoPlay ? "bg-app-accent-primary/20 text-app-accent-primary" : "bg-app-card/50 text-app-text-muted hover:text-white/60"
            }`}
            title="Tự động lật thẻ"
          >
            <i className="ri-play-circle-line text-sm"></i>
          </button>
        </div>

        {/* Progress */}
        <div className="h-1 bg-white/8 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-app-accent-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Stats row */}
        <div className="flex gap-2 mb-4 justify-center">
          {(["easy", "medium", "hard"] as const).map((d) => {
            const colors = { easy: "#34d399", medium: "#e8c84a", hard: "#fb923c" };
            const icons = { easy: "ri-emotion-happy-line", medium: "ri-emotion-normal-line", hard: "ri-emotion-unhappy-line" };
            return (
              <div key={d} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-app-surface/50">
                <i className={`${icons[d]} text-xs`} style={{ color: colors[d] }}></i>
                <span className="text-app-text-secondary text-xs">{sessionStats[d]}</span>
              </div>
            );
          })}
        </div>

        {/* Mobile swipe hint */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-white/15 mb-3 md:hidden">
          <span><i className="ri-arrow-left-line mr-1"></i>Vuốt trái = Khó</span>
          <span>Vuốt phải = Dễ<i className="ri-arrow-right-line ml-1"></i></span>
        </div>

        {/* Swipe hint overlay */}
        {swipeHint && (
          <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className={`px-6 py-3 rounded-2xl text-white font-bold text-lg ${swipeHint === "right" ? "bg-emerald-500/80" : "bg-red-500/80"}`}>
              {swipeHint === "right" ? <><i className="ri-emotion-happy-line mr-2"></i>Dễ</> : <><i className="ri-emotion-unhappy-line mr-2"></i>Khó</>}
            </div>
          </div>
        )}

        {/* Flashcard */}
        <div
          className="relative cursor-pointer mb-6 select-none"
          onClick={flipCard}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ perspective: "1000px" }}
        >
          <div
            className="relative w-full transition-transform duration-300"
            style={{
              transformStyle: "preserve-3d",
              transform: cardState === "back" ? "rotateY(180deg)" : "rotateY(0deg)",
              minHeight: "280px",
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 bg-app-surface/50 border border-app-border rounded-2xl p-8 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold"
                  style={{
                    backgroundColor: LEVELS.find((l) => l.id === currentWord?.topikLevel)?.color + "20",
                    color: LEVELS.find((l) => l.id === currentWord?.topikLevel)?.color,
                  }}
                >
                  {currentWord?.topikLevel}
                </span>
                <span className="text-app-text-muted text-xs">
                  {VOCAB_CATEGORIES.find((c) => c.id === currentWord?.category)?.label}
                </span>
              </div>
              <p className="text-5xl font-bold text-white mb-3">{currentWord?.korean}</p>
              <p className="text-app-text-muted text-lg">[{currentWord?.reading}]</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (currentWord) {
                    const u = new SpeechSynthesisUtterance(currentWord.korean);
                    u.lang = "ko-KR";
                    speechSynthesis.speak(u);
                  }
                }}
                className="mt-4 w-10 h-10 flex items-center justify-center rounded-full bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary hover:text-white/70 transition-all cursor-pointer"
              >
                <i className="ri-volume-up-line text-lg"></i>
              </button>
              <p className="text-app-text-muted text-xs mt-4">Nhấn để lật thẻ</p>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 bg-app-surface/50 border border-app-accent-primary/20 rounded-2xl p-8 flex flex-col items-center justify-center"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <p className="text-app-text-secondary text-sm mb-2">{currentWord?.korean} [{currentWord?.reading}]</p>
              <p className="text-3xl font-bold text-app-accent-primary mb-4 text-center">{currentWord?.vietnamese}</p>
              <p className="text-app-text-muted text-xs mb-1 tracking-normal">Ví dụ</p>
              <p className="text-white/60 text-sm text-center mb-1">{currentWord?.example}</p>
              <p className="text-app-text-muted text-xs text-center italic">{currentWord?.exampleVi}</p>
            </div>
          </div>
        </div>

        {/* Difficulty buttons — only show on back */}
        {cardState === "back" ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["hard", "medium", "easy", "skip"] as Difficulty[]).map((d) => {
              const config = {
                hard: { label: "Khó", color: "#fb923c", icon: "ri-emotion-unhappy-line" },
                medium: { label: "Ổn", color: "#e8c84a", icon: "ri-emotion-normal-line" },
                easy: { label: "Dễ", color: "#34d399", icon: "ri-emotion-happy-line" },
                skip: { label: "Bỏ qua", color: "#94a3b8", icon: "ri-skip-right-line" },
              };
              const c = config[d];
              return (
                <button
                  key={d}
                  onClick={() => handleDifficulty(d)}
                  className="py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex flex-col items-center gap-1"
                  style={{ backgroundColor: `${c.color}15`, borderColor: `${c.color}40`, color: c.color }}
                >
                  <i className={`${c.icon} text-base`}></i>
                  {c.label}
                </button>
              );
            })}
          </div>
        ) : (
          <button
            onClick={flipCard}
            className="w-full py-3 bg-app-card/50 hover:bg-app-card/70 text-white/60 font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap border border-app-border"
          >
            <i className="ri-refresh-line mr-2"></i>Lật thẻ để xem nghĩa
          </button>
        )}
      </div>
    </DashboardLayout>
  );
}


