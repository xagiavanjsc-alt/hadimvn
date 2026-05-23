import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { vocabularyData, VOCAB_CATEGORIES, type VocabItem } from "@/mocks/vocabularyData";

const LEVELS = ["A1", "A2", "B1", "B2"] as const;
const LEVEL_COLORS: Record<string, string> = { A1: "#34d399", A2: "app-accent-primary", B1: "#fb923c", B2: "#f87171" };
const POS_LABELS: Record<string, string> = {
  noun: "Danh từ", verb: "Động từ", adjective: "Tính từ", adverb: "Trạng từ", expression: "Biểu đạt",
};

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [masteredIds, setMasteredIds] = useLocalStorage<string[]>("kts_vocab_mastered", []);
  const [favoriteIds, setFavoriteIds] = useLocalStorage<string[]>("kts_vocab_favorites", []);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [filterMode, setFilterMode] = useState<"all" | "unmastered" | "favorites">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [flashcardItem, setFlashcardItem] = useState<{ items: VocabItem[]; startIdx: number } | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved">("idle");

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
    return vocabularyData.filter(v => {
      const matchCat = selectedCategory === "all" || v.category === selectedCategory;
      const matchLevel = selectedLevel === "all" || v.topikLevel === selectedLevel;
      const matchFilter = filterMode === "all" || (filterMode === "unmastered" && !masteredIds.includes(v.id)) || (filterMode === "favorites" && favoriteIds.includes(v.id));
      const matchSearch = !searchQuery || v.korean.includes(searchQuery) || v.vietnamese.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchLevel && matchFilter && matchSearch;
    });
  }, [selectedCategory, selectedLevel, filterMode, masteredIds, favoriteIds, searchQuery]);

  const handleFlashcard = (item: VocabItem) => {
    const idx = filteredItems.findIndex(v => v.id === item.id);
    setFlashcardItem({ items: filteredItems, startIdx: Math.max(0, idx) });
  };

  const totalMastered = masteredIds.filter(id => vocabularyData.some(v => v.id === id)).length;
  const totalFavorites = favoriteIds.filter(id => vocabularyData.some(v => v.id === id)).length;
  const overallPct = vocabularyData.length > 0 ? Math.round((totalMastered / vocabularyData.length) * 100) : 0;

  return (
    <DashboardLayout
      title="Từ vựng tổng hợp"
      subtitle="Phân loại theo chủ đề và cấp độ TOPIK — học flashcard ngay tại chỗ"
      actions={
        <div className="flex items-center gap-3">
          {user && syncStatus !== "idle" && (
            <span className={`text-xs flex items-center gap-1 ${syncStatus === "saving" ? "text-app-text-secondary" : "text-app-accent-success"}`}>
              <i className={`${syncStatus === "saving" ? "ri-loader-4-line animate-spin" : "ri-cloud-line"} text-sm`}></i>
              {syncStatus === "saving" ? "Đang lưu..." : "Đã lưu cloud"}
            </span>
          )}
          {!user && <span className="text-app-text-muted text-xs"><i className="ri-cloud-off-line mr-1"></i>Đăng nhập để lưu cloud</span>}
          {totalFavorites > 0 && (
            <button
              onClick={() => navigate("/vocab-favorites")}
              className="flex items-center gap-2 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 border border-app-accent-primary/30 text-app-accent-primary font-bold text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-bookmark-fill"></i>Ôn từ yêu thích ({totalFavorites})
            </button>
          )}
          <button
            onClick={() => setFlashcardItem({ items: filteredItems, startIdx: 0 })}
            disabled={filteredItems.length === 0}
            className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 text-app-bg font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-play-line"></i>Học Flashcard ({filteredItems.length})
          </button>
        </div>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng từ vựng", value: vocabularyData.length, icon: "ri-translate-2", color: "app-accent-primary" },
          { label: "Đã thuộc", value: totalMastered, icon: "ri-checkbox-circle-line", color: "#34d399" },
          { label: "Từ yêu thích", value: totalFavorites, icon: "ri-bookmark-fill", color: "#f472b6" },
          { label: "Tiến độ", value: `${overallPct}%`, icon: "ri-pie-chart-line", color: "#a78bfa" },
        ].map(stat => (
          <div key={stat.label} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-lg`} style={{ color: stat.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{stat.value}</p>
              <p className="text-app-text-secondary text-xs mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center bg-app-card/50 rounded-xl p-1">
          <button onClick={() => setSelectedLevel("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedLevel === "all" ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}>Tất cả</button>
          {LEVELS.map(lv => (
            <button key={lv} onClick={() => setSelectedLevel(lv)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedLevel === lv ? "text-app-bg font-bold" : "text-app-text-secondary hover:text-white/60"}`} style={selectedLevel === lv ? { backgroundColor: LEVEL_COLORS[lv] } : {}}>{lv}</button>
          ))}
        </div>
        <div className="flex items-center bg-app-card/50 rounded-xl p-1">
          {([["all", "Tất cả"], ["unmastered", "Chưa thuộc"], ["favorites", `Yêu thích (${totalFavorites})`]] as [string, string][]).map(([f, label]) => (
            <button key={f} onClick={() => setFilterMode(f as "all" | "unmastered" | "favorites")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filterMode === f ? "bg-app-accent-primary text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}>{label}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-app-card/50 border border-app-border rounded-xl px-3 py-2 flex-1 min-w-[180px]">
          <i className="ri-search-line text-app-text-muted text-sm"></i>
          <input type="text" placeholder="Tìm từ vựng..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-white/70 text-sm outline-none placeholder-white/20" />
        </div>
        <p className="text-app-text-muted text-xs whitespace-nowrap">{filteredItems.length} từ</p>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button onClick={() => setSelectedCategory("all")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedCategory === "all" ? "bg-app-accent-primary text-app-bg" : "bg-app-card/50 text-app-text-secondary hover:text-white/60"}`}>
          <i className="ri-apps-line text-xs"></i>Tất cả
        </button>
        {VOCAB_CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat.id ? "text-app-bg" : "bg-app-card/50 text-app-text-secondary hover:text-white/60"}`} style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}>
            <i className={`${cat.icon} text-xs`}></i>{cat.label}
          </button>
        ))}
      </div>

      {/* Favorites empty state */}
      {filterMode === "favorites" && filteredItems.length === 0 && (
        <div className="text-center py-16 bg-app-bg border border-app-border rounded-2xl">
          <i className="ri-bookmark-line text-app-text-muted text-3xl mb-3 block"></i>
          <p className="text-app-text-muted text-sm">Chưa có từ yêu thích nào</p>
          <p className="text-app-text-muted text-xs mt-1">Nhấn nút <i className="ri-bookmark-line"></i> trên thẻ từ để lưu từ khó</p>
        </div>
      )}

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {filteredItems.map(item => (
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
      ) : filterMode !== "favorites" ? (
        <div className="text-center py-16 bg-app-bg border border-app-border rounded-2xl">
          <i className="ri-search-line text-app-text-muted text-3xl mb-3 block"></i>
          <p className="text-app-text-muted text-sm">Không tìm thấy từ vựng nào</p>
        </div>
      ) : null}

      {flashcardItem && (
        <FlashcardModal items={flashcardItem.items} startIdx={flashcardItem.startIdx} onClose={() => setFlashcardItem(null)} masteredIds={masteredIds} onMaster={handleMaster} />
      )}
    </DashboardLayout>
  );
}


