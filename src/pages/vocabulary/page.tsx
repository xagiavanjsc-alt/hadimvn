import { useState, useMemo, useCallback, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { vocabularyData, VOCAB_CATEGORIES, type VocabItem } from "@/mocks/vocabularyData";
import type { SeoulBook } from "@/mocks/seoulTextbook";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;
const LEVEL_COLORS: Record<string, string> = { A1: "#34d399", A2: "#e8c84a", B1: "#fb923c", B2: "#f87171" };
const POS_LABELS: Record<string, string> = {
  noun: "Danh từ", verb: "Động từ", adjective: "Tính từ", adverb: "Trạng từ", expression: "Biểu đạt",
};

// Map Seoul textbook level → TOPIK CEFR level for filter compatibility
const SEOUL_LEVEL_TO_TOPIK: Record<string, "A1" | "A2" | "B1" | "B2"> = {
  "1A": "A1", "1B": "A1", "2A": "A2", "2B": "A2",
  "3A": "B1", "3B": "B1", "4A": "B2", "4B": "B2",
};

// Map Seoul partOfSpeech (Korean) → VocabItem partOfSpeech enum
function mapPos(pos: string): VocabItem["partOfSpeech"] {
  if (!pos) return "expression";
  if (pos.includes("명사")) return "noun";
  if (pos.includes("동사")) return "verb";
  if (pos.includes("형용사")) return "adjective";
  if (pos.includes("부사")) return "adverb";
  return "expression";
}

// Flatten Seoul books → VocabItem[] compatible with existing UI
function flattenSeoulVocab(books: SeoulBook[]): VocabItem[] {
  const items: VocabItem[] = [];
  books.forEach(book => {
    book.lessons.forEach(lesson => {
      lesson.vocabulary.forEach((v, idx) => {
        items.push({
          id: `seoul-${book.level}-l${lesson.lessonNumber}-${idx}`,
          korean: v.korean,
          reading: v.pronunciation,
          vietnamese: v.vietnamese,
          example: v.example,
          exampleVi: v.exampleVi,
          category: "school",
          topikLevel: SEOUL_LEVEL_TO_TOPIK[book.level] ?? "A1",
          partOfSpeech: mapPos(v.partOfSpeech),
        });
      });
    });
  });
  return items;
}


// ─── Mini Flashcard Modal ─────────────────────────────────────────────────
function FlashcardModal({
  items, startIdx, onClose, masteredIds, onMaster,
}: {
  items: VocabItem[]; startIdx: number; onClose: () => void;
  masteredIds: string[]; onMaster: (id: string) => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const [flipped, setFlipped] = useState(false);
  const card = items[idx];
  useEffect(() => { setFlipped(false); }, [idx]);

  const speakKorean = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(card.korean);
    utter.lang = "ko-KR"; utter.rate = 0.8;
    window.speechSynthesis.speak(utter);
  };

  if (!card) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-app-bg border border-app-border rounded-2xl p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-app-text-secondary text-xs">{idx + 1} / {items.length}</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-app-card/50 cursor-pointer"><i className="ri-close-line text-app-text-secondary"></i></button>
        </div>
        <div className="cursor-pointer select-none mb-4" style={{ perspective: "1000px" }} onClick={() => setFlipped(f => !f)}>
          <div className="relative w-full transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", height: "200px" }}>
            <div className="absolute inset-0 rounded-xl border border-app-border bg-[#13161e] flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: "hidden" }}>
              <p className="text-4xl font-bold text-white mb-2">{card.korean}</p>
              <p className="text-app-text-muted text-sm font-mono">[{card.reading}]</p>
              <button onClick={e => { e.stopPropagation(); speakKorean(); }} className="mt-3 text-[10px] text-app-text-muted hover:text-white/50 cursor-pointer bg-app-card/50 px-2.5 py-1 rounded-lg whitespace-nowrap"><i className="ri-volume-up-line mr-1"></i>Nghe</button>
              <p className="mt-4 text-white/15 text-[10px]">Nhấn để xem nghĩa</p>
            </div>
            <div className="absolute inset-0 rounded-xl border border-app-accent-primary/20 bg-[#13161e] flex flex-col items-center justify-center p-6 text-center" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <p className="text-2xl font-bold text-app-accent-primary mb-3">{card.vietnamese}</p>
              <p className="text-app-text-secondary text-xs leading-relaxed">{card.exampleVi}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <button onClick={() => { if (idx > 0) setIdx(i => i - 1); }} disabled={idx === 0} className="flex-1 py-2.5 rounded-xl border border-app-border text-app-text-secondary text-sm disabled:opacity-30 hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap"><i className="ri-arrow-left-line"></i></button>
          <button onClick={() => onMaster(card.id)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${masteredIds.includes(card.id) ? "bg-app-accent-success/15 text-app-accent-success border border-emerald-500/25" : "bg-app-card/50 text-white/50 border border-app-border hover:bg-white/8"}`}>{masteredIds.includes(card.id) ? "✓ Đã thuộc" : "Đánh dấu thuộc"}</button>
          <button onClick={() => { if (idx < items.length - 1) setIdx(i => i + 1); }} disabled={idx === items.length - 1} className="flex-1 py-2.5 rounded-xl border border-app-border text-app-text-secondary text-sm disabled:opacity-30 hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap"><i className="ri-arrow-right-line"></i></button>
        </div>
      </div>
    </div>
  );
}

// ─── Vocab Card ───────────────────────────────────────────────────────────
function VocabCard({
  item, isMastered, isFavorite, onMaster, onFavorite, onFlashcard,
}: {
  item: VocabItem; isMastered: boolean; isFavorite: boolean;
  onMaster: (id: string) => void; onFavorite: (id: string) => void; onFlashcard: () => void;
}) {
  const [showExample, setShowExample] = useState(false);
  const category = VOCAB_CATEGORIES.find(c => c.id === item.category);

  const speakKorean = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(item.korean);
    utter.lang = "ko-KR"; utter.rate = 0.8;
    window.speechSynthesis.speak(utter);
  };

  return (
    <div className={`bg-app-bg border rounded-xl p-4 transition-all ${isMastered ? "border-emerald-500/20" : isFavorite ? "border-app-accent-primary/20" : "border-app-border hover:border-app-border"}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-white font-bold text-xl">{item.korean}</p>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${LEVEL_COLORS[item.topikLevel]}15`, color: LEVEL_COLORS[item.topikLevel] }}>{item.topikLevel}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-app-card/50 text-app-text-muted">{POS_LABELS[item.partOfSpeech]}</span>
          </div>
          <p className="text-app-text-muted text-xs font-mono">[{item.reading}]</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button onClick={speakKorean} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 cursor-pointer transition-colors"><i className="ri-volume-up-line text-app-text-secondary text-xs"></i></button>
          <button onClick={onFlashcard} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 cursor-pointer transition-colors"><i className="ri-stack-line text-app-text-secondary text-xs"></i></button>
          {/* Favorite button */}
          <button onClick={() => onFavorite(item.id)} title={isFavorite ? "Bỏ yêu thích" : "Lưu từ khó"} className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${isFavorite ? "bg-app-accent-primary/15" : "bg-app-card/50 hover:bg-app-card/70"}`}>
            <i className={`${isFavorite ? "ri-bookmark-fill text-app-accent-primary" : "ri-bookmark-line text-app-text-muted"} text-xs`}></i>
          </button>
          <button onClick={() => onMaster(item.id)} className={`w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${isMastered ? "bg-app-accent-success/15" : "bg-app-card/50 hover:bg-app-card/70"}`}>
            <i className={`${isMastered ? "ri-checkbox-circle-fill text-app-accent-success" : "ri-checkbox-blank-circle-line text-app-text-muted"} text-xs`}></i>
          </button>
        </div>
      </div>
      <p className="text-app-accent-primary text-sm font-semibold mb-2">{item.vietnamese}</p>
      {category && (
        <div className="flex items-center gap-1 mb-2">
          <i className={`${category.icon} text-[10px]`} style={{ color: category.color }}></i>
          <span className="text-[10px]" style={{ color: category.color }}>{category.label}</span>
        </div>
      )}
      <button onClick={() => setShowExample(s => !s)} className="text-[10px] text-app-text-muted hover:text-white/50 cursor-pointer transition-colors whitespace-nowrap">
        {showExample ? "Ẩn ví dụ" : "Xem ví dụ"}
        {showExample ? <i className="ri-arrow-up-s-line ml-1"></i> : <i className="ri-arrow-down-s-line ml-1"></i>}
      </button>
      {showExample && (
        <div className="mt-2 bg-app-surface/50 rounded-lg p-2.5">
          <p className="text-white/50 text-xs">{item.example}</p>
          <p className="text-app-text-muted text-[10px] italic mt-0.5">{item.exampleVi}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function VocabularyPage() {
  const { user } = useAuth();
  const [masteredIds, setMasteredIds] = useLocalStorage<string[]>("kts_vocab_mastered", []);
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>("kts_vocab_favorites", []);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [filterMode, setFilterMode] = useState<"all" | "unmastered" | "favorites">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [flashcardItem, setFlashcardItem] = useState<{ items: VocabItem[]; startIdx: number } | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // ─── Source filter: TOPIK chung (default, instant) vs Seoul A1-4B (lazy load 4070 từ)
  const [selectedSource, setSelectedSource] = useState<"topik" | "seoul">("topik");
  const [seoulVocab, setSeoulVocab] = useState<VocabItem[] | null>(null);
  const [seoulLoading, setSeoulLoading] = useState(false);

  // Reset to page 1 when any filter changes
  useEffect(() => { setCurrentPage(1); }, [selectedCategory, selectedLevel, filterMode, searchQuery, selectedSource]);

  // Lazy load Seoul vocab only when user selects "Seoul" source
  useEffect(() => {
    if (selectedSource !== "seoul" || seoulVocab !== null) return;
    setSeoulLoading(true);
    import("@/mocks/data/seoul-books-data").then(m => {
      setSeoulVocab(flattenSeoulVocab(m.seoulBooks));
      setSeoulLoading(false);
    }).catch(() => setSeoulLoading(false));
  }, [selectedSource, seoulVocab]);

  // Active vocab dataset = TOPIK chung (always loaded) OR Seoul (lazy)
  const activeVocabData = useMemo<VocabItem[]>(() => {
    if (selectedSource === "seoul") return seoulVocab ?? [];
    return vocabularyData;
  }, [selectedSource, seoulVocab]);

  // Load favorites from Supabase on login
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase.from("study_progress").select("vocab_favorites, vocab_known").eq("user_id", user.id).maybeSingle()
      .then(
        ({ data, error }) => {
          if (cancelled || error) return;
          if (data) {
            if (Array.isArray(data.vocab_favorites) && data.vocab_favorites.length > 0) {
              setFavoriteIds(data.vocab_favorites as string[]);
            }
            if (Array.isArray(data.vocab_known) && data.vocab_known.length > 0) {
              setMasteredIds(data.vocab_known as string[]);
            }
          }
        },
        () => { /* network error — keep local state */ }
      );
    return () => { cancelled = true; };
  }, [user?.id]);

  // Sync favorites to Supabase
  const syncFavoritesToCloud = useCallback(async (ids: string[]) => {
    if (!user) return;
    setSyncStatus("saving");
    await supabase.from("study_progress").upsert({ user_id: user.id, vocab_favorites: ids, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    setSyncStatus("saved");
    setTimeout(() => setSyncStatus("idle"), 2000);
  }, [user]);

  // Sync mastered to Supabase
  const syncMasteredToCloud = useCallback(async (ids: string[]) => {
    if (!user) return;
    await supabase.from("study_progress").upsert({ user_id: user.id, vocab_known: ids, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  }, [user]);

  const handleFavorite = useCallback((id: string) => {
    setFavoriteIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      syncFavoritesToCloud(next);
      return next;
    });
  }, [syncFavoritesToCloud]);

  const handleMaster = useCallback((id: string) => {
    setMasteredIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      syncMasteredToCloud(next);
      return next;
    });
  }, [syncMasteredToCloud]);

  const filteredItems = useMemo(() => {
    return activeVocabData.filter(v => {
      const matchCat = selectedCategory === "all" || v.category === selectedCategory;
      const matchLevel = selectedLevel === "all" || v.topikLevel === selectedLevel;
      const matchFilter = filterMode === "all" || (filterMode === "unmastered" && !masteredIds.includes(v.id)) || (filterMode === "favorites" && favoriteIds.includes(v.id));
      const matchSearch = !searchQuery || v.korean.includes(searchQuery) || v.vietnamese.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchLevel && matchFilter && matchSearch;
    });
  }, [activeVocabData, selectedCategory, selectedLevel, filterMode, masteredIds, favoriteIds, searchQuery]);

  const handleFlashcard = (item: VocabItem) => {
    const idx = filteredItems.findIndex(v => v.id === item.id);
    setFlashcardItem({ items: filteredItems, startIdx: Math.max(0, idx) });
  };

  const startPractice = () => {
    if (filteredItems.length === 0) return;
    setFlashcardItem({ items: filteredItems, startIdx: 0 });
  };

  // Counts per category for sidebar
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    activeVocabData.forEach(v => { counts[v.category] = (counts[v.category] || 0) + 1; });
    return counts;
  }, [activeVocabData]);

  const currentCategory = VOCAB_CATEGORIES.find(c => c.id === selectedCategory);

  const totalMastered = masteredIds.filter(id => activeVocabData.some(v => v.id === id)).length;
  const totalFavorites = favoriteIds.filter(id => activeVocabData.some(v => v.id === id)).length;
  const overallPct = activeVocabData.length > 0 ? Math.round((totalMastered / activeVocabData.length) * 100) : 0;

  return (
    <DashboardLayout
      title="Từ vựng tổng hợp"
      subtitle="Phân loại theo chủ đề và cấp độ TOPIK — học flashcard ngay tại chỗ"
    >
      {/* Sync status */}
      {(user && syncStatus !== "idle") || !user ? (
        <div className="flex items-center justify-end gap-3 mb-3 text-xs">
          {user && syncStatus !== "idle" && (
            <span className={`flex items-center gap-1 ${syncStatus === "saving" ? "text-app-text-secondary" : "text-app-accent-success"}`}>
              <i className={`${syncStatus === "saving" ? "ri-loader-4-line animate-spin" : "ri-cloud-line"} text-sm`}></i>
              {syncStatus === "saving" ? "Đang lưu..." : "Đã lưu cloud"}
            </span>
          )}
          {!user && <span className="text-app-text-muted"><i className="ri-cloud-off-line mr-1"></i>Đăng nhập để lưu cloud</span>}
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-5">
        {[
          { label: "Tổng từ vựng", value: activeVocabData.length, icon: "ri-translate-2", color: "#e8c84a" },
          { label: "Đã thuộc", value: totalMastered, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Từ yêu thích", value: totalFavorites, icon: "ri-bookmark-fill", color: "#f472b6" },
          { label: "Tiến độ", value: `${overallPct}%`, icon: "ri-pie-chart-line", color: "#a78bfa" },
        ].map(stat => (
          <div key={stat.label} className="bg-app-bg border border-app-border rounded-xl p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-base sm:text-lg`} style={{ color: stat.color }}></i>
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-lg sm:text-xl leading-none truncate">{stat.value}</p>
              <p className="text-app-text-secondary text-[11px] sm:text-xs mt-0.5 truncate">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Source filter — TOPIK chung (1055) vs Seoul A1-4B (4070, lazy load) */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-app-text-secondary text-xs font-semibold">Nguồn:</span>
        <button
          onClick={() => setSelectedSource("topik")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${selectedSource === "topik" ? "bg-app-accent-primary text-app-bg" : "bg-app-card/50 text-app-text-secondary hover:text-white/60"}`}
        >
          TOPIK chung <span className="opacity-60">(1055)</span>
        </button>
        <button
          onClick={() => setSelectedSource("seoul")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer whitespace-nowrap transition-all flex items-center gap-1.5 ${selectedSource === "seoul" ? "bg-app-accent-primary text-app-bg" : "bg-app-card/50 text-app-text-secondary hover:text-white/60"}`}
        >
          {seoulLoading && <i className="ri-loader-4-line animate-spin text-sm"></i>}
          Seoul A1–4B <span className="opacity-60">(4070)</span>
        </button>
      </div>

      {/* Main: sidebar categories + content */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 lg:gap-6">
        {/* Sidebar — desktop sticky + scroll, mobile horizontal chips */}
        <div className="flex lg:flex-col gap-2 lg:space-y-2 lg:gap-0
                        overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto
                        lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)]
                        pb-1 lg:pb-2 -mx-1 lg:mx-0 px-1 lg:pr-2
                        [&::-webkit-scrollbar]:hidden lg:[&::-webkit-scrollbar]:block
                        lg:[&::-webkit-scrollbar]:w-1.5
                        lg:[&::-webkit-scrollbar-track]:bg-transparent
                        lg:[&::-webkit-scrollbar-thumb]:bg-app-border
                        lg:[&::-webkit-scrollbar-thumb]:rounded-full">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`flex-shrink-0 lg:flex-shrink min-w-[150px] lg:min-w-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer text-left ${selectedCategory === "all" ? "bg-app-accent-primary/10 border border-app-accent-primary/20 text-app-accent-primary" : "bg-app-surface/50 border border-app-border text-white/50 hover:text-white/70 hover:bg-app-card/50"}`}
          >
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 flex-shrink-0">
              <i className="ri-apps-line text-sm"></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs truncate">Tất cả chủ đề</p>
              <p className="text-[10px] opacity-60">{activeVocabData.length} từ</p>
            </div>
          </button>

          {VOCAB_CATEGORIES.map(cat => {
            const cnt = categoryCounts[cat.id] || 0;
            if (cnt === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 lg:flex-shrink min-w-[150px] lg:min-w-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer text-left ${selectedCategory === cat.id ? "border" : "bg-app-surface/50 border border-app-border text-white/50 hover:text-white/70 hover:bg-app-card/50"}`}
                style={selectedCategory === cat.id ? { backgroundColor: `${cat.color}10`, borderColor: `${cat.color}25`, color: cat.color } : {}}
              >
                <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${cat.color}15` }}>
                  <i className={`${cat.icon} text-sm`} style={{ color: cat.color }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-xs truncate">{cat.label}</p>
                  <p className="text-[10px] opacity-60">{cnt} từ</p>
                </div>
              </button>
            );
          })}

          {/* Favorites shortcut */}
          {totalFavorites > 0 && (
            <button
              onClick={() => setFilterMode(m => m === "favorites" ? "all" : "favorites")}
              className={`flex-shrink-0 lg:flex-shrink min-w-[150px] lg:min-w-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer text-left lg:mt-2 ${filterMode === "favorites" ? "bg-app-accent-primary/10 border border-app-accent-primary/20 text-app-accent-primary" : "bg-app-surface/50 border border-app-border text-white/50 hover:text-white/70"}`}
            >
              <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-accent-primary/10 flex-shrink-0">
                <i className="ri-bookmark-fill text-app-accent-primary text-sm"></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs truncate">Yêu thích</p>
                <p className="text-[10px] opacity-60">{totalFavorites} từ đã lưu</p>
              </div>
            </button>
          )}
        </div>

        {/* Main content */}
        <div>
          {/* Header per category or overview */}
          {currentCategory ? (
            <div className="flex items-center gap-3 mb-5 p-4 rounded-xl border" style={{ backgroundColor: `${currentCategory.color}08`, borderColor: `${currentCategory.color}20` }}>
              <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${currentCategory.color}15` }}>
                <i className={`${currentCategory.icon} text-lg`} style={{ color: currentCategory.color }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-base truncate">{currentCategory.label}</h2>
                <p className="text-app-text-secondary text-xs truncate">Chủ đề từ vựng · {categoryCounts[currentCategory.id] || 0} từ</p>
              </div>
              {filteredItems.length > 0 && (
                <button onClick={startPractice}
                  className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90 flex-shrink-0"
                  style={{ backgroundColor: currentCategory.color, color: "#0a0d14" }}>
                  <i className="ri-play-fill"></i>Luyện {filteredItems.length} từ
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 mb-5 p-4 rounded-xl border border-app-border bg-app-surface/30">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-accent-primary/10 flex-shrink-0">
                <i className={`${filterMode === "favorites" ? "ri-bookmark-fill" : "ri-apps-line"} text-lg text-app-accent-primary`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-base truncate">{filterMode === "favorites" ? "Từ yêu thích" : "Tất cả chủ đề"}</h2>
                <p className="text-app-text-secondary text-xs truncate">{filterMode === "favorites" ? "Từ bạn đã đánh dấu lưu" : `Toàn bộ ${VOCAB_CATEGORIES.length} chủ đề từ vựng`}</p>
              </div>
              {filteredItems.length > 0 && (
                <button onClick={startPractice}
                  className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-xs font-bold cursor-pointer whitespace-nowrap transition-colors flex-shrink-0">
                  <i className="ri-play-fill"></i>Luyện {filteredItems.length} từ
                </button>
              )}
            </div>
          )}

          {/* Filters row: search + level + status */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="flex items-center gap-2 bg-app-card/50 border border-app-border rounded-xl px-3 py-2 flex-1 min-w-[180px]">
              <i className="ri-search-line text-app-text-muted text-sm"></i>
              <input type="text" placeholder="Tìm từ vựng..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-white/70 text-sm outline-none placeholder-white/20" />
            </div>
            <div className="flex items-center bg-app-card/50 rounded-xl p-1">
              <button onClick={() => setSelectedLevel("all")} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedLevel === "all" ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}>Tất cả</button>
              {LEVELS.map(lv => (
                <button key={lv} onClick={() => setSelectedLevel(lv)} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedLevel === lv ? "text-app-bg font-bold" : "text-app-text-secondary hover:text-white/60"}`} style={selectedLevel === lv ? { backgroundColor: LEVEL_COLORS[lv] } : {}}>{lv}</button>
              ))}
            </div>
            <div className="flex items-center bg-app-card/50 rounded-xl p-1">
              {([["all", "Tất cả"], ["unmastered", "Chưa thuộc"]] as [string, string][]).map(([f, label]) => (
                <button key={f} onClick={() => setFilterMode(f as "all" | "unmastered" | "favorites")} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filterMode === f ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}>{label}</button>
              ))}
            </div>
          </div>

          {/* Favorites empty state */}
          {filterMode === "favorites" && filteredItems.length === 0 && (
            <div className="text-center py-16 bg-app-bg border border-app-border rounded-2xl">
              <i className="ri-bookmark-line text-app-text-muted text-3xl mb-3 block"></i>
              <p className="text-app-text-muted text-sm">Chưa có từ yêu thích nào</p>
              <p className="text-app-text-muted text-xs mt-1">Nhấn nút <i className="ri-bookmark-line"></i> trên thẻ từ để lưu từ khó</p>
            </div>
          )}

          {/* Grid (paginated) */}
          {filteredItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map(item => (
                  <VocabCard
                    key={item.id}
                    item={item}
                    isMastered={masteredIds.includes(item.id)}
                    isFavorite={favoriteIds.includes(item.id)}
                    onMaster={handleMaster}
                    onFavorite={handleFavorite}
                    onFlashcard={() => handleFlashcard(item)}
                  />
                ))}
              </div>
              {/* Pagination */}
              {filteredItems.length > PAGE_SIZE && (() => {
                const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE);
                const goTo = (n: number) => { setCurrentPage(Math.max(1, Math.min(totalPages, n))); window.scrollTo({ top: 0, behavior: "smooth" }); };
                const start = (currentPage - 1) * PAGE_SIZE + 1;
                const end = Math.min(currentPage * PAGE_SIZE, filteredItems.length);
                return (
                  <div className="flex items-center justify-between mt-5 gap-2 flex-wrap">
                    <p className="text-app-text-muted text-xs">Từ {start}–{end} / {filteredItems.length}</p>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-app-border text-white/60 hover:bg-app-card/50 text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
                        <i className="ri-arrow-left-s-line"></i>Trước
                      </button>
                      <span className="px-3 py-1.5 text-white text-xs font-semibold whitespace-nowrap">{currentPage} / {totalPages}</span>
                      <button onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-app-border text-white/60 hover:bg-app-card/50 text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors whitespace-nowrap">
                        Sau<i className="ri-arrow-right-s-line"></i>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </>
          ) : filterMode !== "favorites" ? (
            <div className="text-center py-16 bg-app-bg border border-app-border rounded-2xl">
              <i className="ri-search-line text-app-text-muted text-3xl mb-3 block"></i>
              <p className="text-app-text-muted text-sm">Không tìm thấy từ vựng nào</p>
            </div>
          ) : null}
        </div>
      </div>

      {flashcardItem && (
        <FlashcardModal items={flashcardItem.items} startIdx={flashcardItem.startIdx} onClose={() => setFlashcardItem(null)} masteredIds={masteredIds} onMaster={handleMaster} />
      )}
    </DashboardLayout>
  );
}


