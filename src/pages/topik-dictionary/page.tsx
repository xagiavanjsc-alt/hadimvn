import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { vocabularyData, VOCAB_CATEGORIES, type VocabItem } from "@/mocks/vocabularyData";

const LEVELS = ["Tất cả", "A1", "A2", "B1", "B2"];
const PARTS = [
  { value: "all", label: "Tất cả" },
  { value: "noun", label: "Danh từ" },
  { value: "verb", label: "Động từ" },
  { value: "adjective", label: "Tính từ" },
  { value: "adverb", label: "Trạng từ" },
  { value: "expression", label: "Mẫu câu" },
];

const LEVEL_COLORS: Record<string, string> = {
  A1: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  A2: "bg-sky-500/15 text-sky-400 border-sky-500/20",
  B1: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  B2: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

const ITEM_HEIGHT = 64; // px per collapsed row
const OVERSCAN = 5;

interface WordNote {
  note: string;
  difficult: boolean;
}

// ─── Virtual list hook ────────────────────────────────────────────────────────
function useVirtualList(items: VocabItem[], containerRef: React.RefObject<HTMLDivElement | null>, expandedId: string | null) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerHeight(el.clientHeight));
    ro.observe(el);
    setContainerHeight(el.clientHeight);
    return () => ro.disconnect();
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [containerRef]);

  // When expanded, we can't easily virtualize that item — just show all near it
  const startIdx = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(containerHeight / ITEM_HEIGHT) + OVERSCAN * 2;
  const endIdx = Math.min(items.length - 1, startIdx + visibleCount);

  const totalHeight = items.length * ITEM_HEIGHT;
  const offsetTop = startIdx * ITEM_HEIGHT;

  return { startIdx, endIdx, totalHeight, offsetTop };
}

// ─── Word Row ─────────────────────────────────────────────────────────────────
const WordRow = ({
  word,
  isExpanded,
  note,
  isFav,
  onToggle,
  onSpeak,
  onToggleDifficult,
  onOpenNote,
  onToggleFav,
}: {
  word: VocabItem;
  isExpanded: boolean;
  note: WordNote | undefined;
  isFav: boolean;
  onToggle: () => void;
  onSpeak: (text: string, slow?: boolean) => void;
  onToggleDifficult: () => void;
  onOpenNote: () => void;
  onToggleFav: () => void;
}) => {
  const cat = VOCAB_CATEGORIES.find(c => c.id === word.category);
  const partLabel = PARTS.find(x => x.value === word.partOfSpeech)?.label || word.partOfSpeech;

  return (
    <div
      className={`bg-white/5 border rounded-2xl transition-all mb-2 ${
        note?.difficult ? "border-red-500/20" : isExpanded ? "border-white/15" : "border-white/8 hover:border-white/12"
      }`}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={onToggle}
      >
        {/* Korean word — fixed width, single line */}
        <div className="flex-shrink-0 w-28 min-w-0">
          <p
            className="text-white text-base font-bold truncate"
            style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
          >
            {word.korean}
          </p>
          <p className="text-white/30 text-[10px] font-mono truncate">[{word.reading}]</p>
        </div>

        {/* Vietnamese + badges — single line */}
        <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
          <p className="text-white/80 text-sm font-medium truncate flex-shrink-0 max-w-[140px] sm:max-w-none">
            {word.vietnamese}
          </p>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`px-1.5 py-0.5 rounded text-[10px] border flex-shrink-0 ${LEVEL_COLORS[word.topikLevel]}`}>
              {word.topikLevel}
            </span>
            <span className="text-white/25 text-[10px] hidden sm:inline whitespace-nowrap">{partLabel}</span>
            {cat && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded hidden md:inline whitespace-nowrap"
                style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
              >
                {cat.label}
              </span>
            )}
            {note?.difficult && (
              <span className="text-[10px] text-red-400 hidden sm:flex items-center gap-0.5 whitespace-nowrap">
                <i className="ri-flag-fill text-[10px]"></i>
              </span>
            )}
            {note?.note && (
              <span className="text-[10px] text-amber-400 hidden sm:flex items-center gap-0.5">
                <i className="ri-sticky-note-fill text-[10px]"></i>
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onSpeak(word.korean)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-all cursor-pointer"
          >
            <i className="ri-volume-up-line text-xs"></i>
          </button>
          <button
            onClick={onToggleDifficult}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
              note?.difficult ? "bg-red-500/15 text-red-400" : "bg-white/5 hover:bg-white/10 text-white/30 hover:text-red-400"
            }`}
          >
            <i className="ri-flag-line text-xs"></i>
          </button>
          <button
            onClick={onOpenNote}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
              note?.note ? "bg-amber-500/15 text-amber-400" : "bg-white/5 hover:bg-white/10 text-white/30 hover:text-amber-400"
            }`}
          >
            <i className="ri-edit-line text-xs"></i>
          </button>
          <button
            onClick={onToggleFav}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
              isFav ? "bg-[#e8c84a]/15 text-[#e8c84a]" : "bg-white/5 hover:bg-white/10 text-white/30 hover:text-[#e8c84a]"
            }`}
          >
            <i className={`${isFav ? "ri-bookmark-fill" : "ri-bookmark-line"} text-xs`}></i>
          </button>
          <div className="w-4 h-4 flex items-center justify-center">
            <i className={`${isExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-white/25 text-xs`}></i>
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          <div className="bg-white/5 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-white/40 text-xs font-medium">Ví dụ câu</p>
              <div className="flex gap-1.5">
                <button
                  onClick={() => onSpeak(word.example)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 text-[10px] transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-volume-up-line text-xs"></i> Nghe
                </button>
                <button
                  onClick={() => onSpeak(word.example, true)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 text-[10px] transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-slow-down-line text-xs"></i> Chậm
                </button>
              </div>
            </div>
            <p className="text-white text-sm" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>{word.example}</p>
            <p className="text-white/50 text-xs italic">{word.exampleVi}</p>
          </div>

          {note?.note && (
            <div className="bg-amber-500/8 border border-amber-500/15 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <i className="ri-sticky-note-line text-amber-400 text-xs"></i>
                <p className="text-amber-400 text-xs font-medium">Ghi chú của bạn</p>
              </div>
              <p className="text-white/60 text-xs leading-relaxed">{note.note}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onOpenNote}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 text-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-edit-line text-xs"></i>
              {note?.note ? "Sửa ghi chú" : "Thêm ghi chú"}
            </button>
            <button
              onClick={onToggleDifficult}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${
                note?.difficult
                  ? "bg-red-500/15 text-red-400 hover:bg-red-500/20"
                  : "bg-white/5 hover:bg-white/10 text-white/40 hover:text-red-400"
              }`}
            >
              <i className="ri-flag-line text-xs"></i>
              {note?.difficult ? "Bỏ đánh dấu khó" : "Đánh dấu từ khó"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TopikDictionaryPage() {
  const [search, setSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Tất cả");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPart, setSelectedPart] = useState("all");
  const [sortBy, setSortBy] = useState<"alpha" | "level" | "category">("level");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "difficult" | "noted">("all");
  const [noteModal, setNoteModal] = useState<{ id: string; word: VocabItem } | null>(null);
  const [noteText, setNoteText] = useState("");
  const [wordNotes, setWordNotes] = useLocalStorage<Record<string, WordNote>>("topik_word_notes", {});
  const [favorites, setFavorites] = useLocalStorage<string[]>("topik_dict_favorites", []);

  // Pagination instead of virtual scroll for simplicity & reliability
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  const speakKorean = useCallback((text: string, slow = false) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "ko-KR";
    utt.rate = slow ? 0.5 : 0.8;
    synth.speak(utt);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  }, [setFavorites]);

  const toggleDifficult = useCallback((id: string) => {
    setWordNotes(prev => ({
      ...prev,
      [id]: { note: prev[id]?.note || "", difficult: !prev[id]?.difficult },
    }));
  }, [setWordNotes]);

  const openNoteModal = useCallback((word: VocabItem) => {
    setNoteModal({ id: word.id, word });
    setNoteText(wordNotes[word.id]?.note || "");
  }, [wordNotes]);

  const saveNote = () => {
    if (!noteModal) return;
    setWordNotes(prev => ({
      ...prev,
      [noteModal.id]: { note: noteText, difficult: prev[noteModal.id]?.difficult || false },
    }));
    setNoteModal(null);
  };

  const filtered = useMemo(() => {
    let list = vocabularyData;

    if (filterTab === "difficult") list = list.filter(w => wordNotes[w.id]?.difficult);
    if (filterTab === "noted") list = list.filter(w => wordNotes[w.id]?.note);

    if (selectedLevel !== "Tất cả") list = list.filter(w => w.topikLevel === selectedLevel);
    if (selectedCategory !== "all") list = list.filter(w => w.category === selectedCategory);
    if (selectedPart !== "all") list = list.filter(w => w.partOfSpeech === selectedPart);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(w =>
        w.korean.toLowerCase().includes(q) ||
        w.vietnamese.toLowerCase().includes(q) ||
        w.reading.toLowerCase().includes(q) ||
        w.example.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      if (sortBy === "alpha") return a.korean.localeCompare(b.korean);
      if (sortBy === "level") {
        const order: Record<string, number> = { A1: 0, A2: 1, B1: 2, B2: 3 };
        return (order[a.topikLevel] ?? 0) - (order[b.topikLevel] ?? 0);
      }
      return a.category.localeCompare(b.category);
    });

    return list;
  }, [search, selectedLevel, selectedCategory, selectedPart, sortBy, filterTab, wordNotes]);

  // Reset page when filters change
  useEffect(() => { setPage(0); }, [search, selectedLevel, selectedCategory, selectedPart, sortBy, filterTab]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = useMemo(() => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filtered, page]);

  const stats = useMemo(() => ({
    total: vocabularyData.length,
    a1: vocabularyData.filter(w => w.topikLevel === "A1").length,
    a2: vocabularyData.filter(w => w.topikLevel === "A2").length,
    b1: vocabularyData.filter(w => w.topikLevel === "B1").length,
    b2: vocabularyData.filter(w => w.topikLevel === "B2").length,
    difficult: Object.values(wordNotes).filter(n => n.difficult).length,
    noted: Object.values(wordNotes).filter(n => n.note).length,
  }), [wordNotes]);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Từ điển TOPIK
            </h1>
            <p className="text-white/40 text-xs mt-0.5">Tra cứu từ vựng TOPIK I/II với ví dụ câu, phiên âm và bộ lọc theo cấp độ A1–B2</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Tổng", value: stats.total, color: "text-white" },
              { label: "A1", value: stats.a1, color: "text-emerald-400" },
              { label: "A2", value: stats.a2, color: "text-sky-400" },
              { label: "B1", value: stats.b1, color: "text-amber-400" },
              { label: "B2", value: stats.b2, color: "text-rose-400" },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-center min-w-[44px]">
                <p className={`font-bold text-base ${s.color}`}>{s.value}</p>
                <p className="text-white/30 text-[10px]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
            <i className="ri-search-line text-white/30 text-sm"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm tiếng Hàn, tiếng Việt, phiên âm..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer"
            >
              <i className="ri-close-line text-sm"></i>
            </button>
          )}
        </div>

        {/* Filter tabs + sort */}
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            {[
              { key: "all", label: `Tất cả (${stats.total})` },
              { key: "difficult", label: `Từ khó (${stats.difficult})` },
              { key: "noted", label: `Ghi chú (${stats.noted})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key as "all" | "difficult" | "noted")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  filterTab === tab.key ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as "alpha" | "level" | "category")}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/60 text-xs focus:outline-none cursor-pointer"
          >
            <option value="level">Sắp xếp: Cấp độ</option>
            <option value="alpha">Sắp xếp: A-Z</option>
            <option value="category">Sắp xếp: Chủ đề</option>
          </select>
        </div>

        {/* Level filter */}
        <div className="flex flex-wrap gap-1.5">
          {LEVELS.map(lv => (
            <button
              key={lv}
              onClick={() => setSelectedLevel(lv)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                selectedLevel === lv
                  ? lv === "Tất cả" ? "bg-white/15 border-white/20 text-white" : `${LEVEL_COLORS[lv]} border-current`
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
              }`}
            >
              {lv}
            </button>
          ))}
          <div className="w-px bg-white/10 mx-1"></div>
          {PARTS.map(p => (
            <button
              key={p.value}
              onClick={() => setSelectedPart(p.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                selectedPart === p.value
                  ? "bg-[#e8c84a]/15 border-[#e8c84a]/30 text-[#e8c84a]"
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
              selectedCategory === "all"
                ? "bg-white/15 border-white/20 text-white"
                : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
            }`}
          >
            Tất cả chủ đề
          </button>
          {VOCAB_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border ${
                selectedCategory === cat.id ? "border-current" : "bg-white/5 border-white/10 text-white/40 hover:text-white/60"
              }`}
              style={selectedCategory === cat.id ? { backgroundColor: `${cat.color}20`, color: cat.color, borderColor: `${cat.color}40` } : {}}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count + pagination info */}
        <div className="flex items-center justify-between">
          <p className="text-white/30 text-xs">{filtered.length} từ tìm thấy · Trang {page + 1}/{Math.max(1, totalPages)}</p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70 disabled:opacity-30 cursor-pointer transition-all"
              >
                <i className="ri-arrow-left-s-line text-sm"></i>
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(0, Math.min(totalPages - 5, page - 2)) + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      pageNum === page
                        ? "bg-[#e8c84a]/20 border border-[#e8c84a]/30 text-[#e8c84a]"
                        : "bg-white/5 border border-white/10 text-white/40 hover:text-white/70"
                    }`}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70 disabled:opacity-30 cursor-pointer transition-all"
              >
                <i className="ri-arrow-right-s-line text-sm"></i>
              </button>
            </div>
          )}
        </div>

        {/* Word list — paginated */}
        <div className="space-y-0">
          {pageItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <i className="ri-search-line text-white/20 text-3xl"></i>
              </div>
              <p className="text-white/30 text-sm">Không tìm thấy từ nào</p>
            </div>
          ) : (
            pageItems.map(word => (
              <WordRow
                key={word.id}
                word={word}
                isExpanded={expandedId === word.id}
                note={wordNotes[word.id]}
                isFav={favorites.includes(word.id)}
                onToggle={() => setExpandedId(expandedId === word.id ? null : word.id)}
                onSpeak={speakKorean}
                onToggleDifficult={() => toggleDifficult(word.id)}
                onOpenNote={() => openNoteModal(word)}
                onToggleFav={() => toggleFavorite(word.id)}
              />
            ))
          )}
        </div>

        {/* Bottom pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={page === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs hover:text-white/70 disabled:opacity-30 cursor-pointer transition-all whitespace-nowrap"
            >
              <i className="ri-arrow-left-line text-xs"></i> Trang trước
            </button>
            <span className="text-white/30 text-xs">{page + 1} / {totalPages}</span>
            <button
              onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/50 text-xs hover:text-white/70 disabled:opacity-30 cursor-pointer transition-all whitespace-nowrap"
            >
              Trang sau <i className="ri-arrow-right-line text-xs"></i>
            </button>
          </div>
        )}
      </div>

      {/* Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1d2e] border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-xl" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                  {noteModal.word.korean}
                </p>
                <p className="text-white/40 text-sm">{noteModal.word.vietnamese}</p>
              </div>
              <button
                onClick={() => setNoteModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 cursor-pointer"
              >
                <i className="ri-close-line text-sm"></i>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-white/50 text-xs font-medium">Ghi chú cá nhân</label>
              <textarea
                value={noteText}
                onChange={e => {
                  if (e.target.value.length <= 500) setNoteText(e.target.value);
                }}
                placeholder="Mẹo nhớ từ, ngữ cảnh sử dụng, phát âm đặc biệt..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-white/20 resize-none h-32"
              />
              <p className="text-white/20 text-xs text-right">{noteText.length}/500</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setNoteModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-sm transition-all cursor-pointer whitespace-nowrap"
              >
                Hủy
              </button>
              <button
                onClick={saveNote}
                className="flex-1 py-2.5 rounded-xl bg-[#e8c84a]/15 hover:bg-[#e8c84a]/25 border border-[#e8c84a]/20 text-[#e8c84a] text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
              >
                Lưu ghi chú
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
