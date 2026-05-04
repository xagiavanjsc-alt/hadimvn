import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { EPS_VOCAB_TOPICS, epsVocabulary, EpsVocabItem } from "@/mocks/epsVocabulary";

const LEVELS = [
  { value: "all", label: "Tất cả" },
  { value: "basic", label: "Cơ bản" },
  { value: "intermediate", label: "Trung cấp" },
  { value: "advanced", label: "Nâng cao" },
];

const LEVEL_COLORS: Record<string, string> = {
  basic: "bg-app-accent-success/15 text-app-accent-success border-emerald-500/20",
  intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  advanced: "bg-rose-500/15 text-rose-400 border-rose-500/20",
};

const LEVEL_LABELS: Record<string, string> = {
  basic: "Cơ bản",
  intermediate: "Trung cấp",
  advanced: "Nâng cao",
};

function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

function VocabCard({ item, onToggleFav, isFav }: { item: EpsVocabItem; onToggleFav: (id: string) => void; isFav: boolean }) {
  const [showExample, setShowExample] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${item.korean} — ${item.vietnamese}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-[#111318] rounded-xl border border-app-border p-4 hover:border-app-accent-primary/20 transition-all group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-bold text-white">{item.korean}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${LEVEL_COLORS[item.level]}`}>
              {LEVEL_LABELS[item.level]}
            </span>
          </div>
          <p className="text-xs text-app-text-muted mt-0.5 font-mono">[{item.reading}]</p>
          <p className="text-sm text-white/70 font-medium mt-1">{item.vietnamese}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => speak(item.korean)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-accent-primary/10 text-app-text-muted hover:text-app-accent-primary transition-colors cursor-pointer"
            title="Phát âm"
          >
            <i className="ri-volume-up-line text-sm"></i>
          </button>
          <button
            onClick={handleCopy}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-muted hover:text-white/60 transition-colors cursor-pointer"
            title="Sao chép"
          >
            <i className={`${copied ? "ri-check-line text-app-accent-success" : "ri-file-copy-line"} text-sm`}></i>
          </button>
          <button
            onClick={() => onToggleFav(item.id)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
              isFav ? "bg-app-accent-primary/10 text-app-accent-primary" : "bg-app-card/50 text-app-text-muted hover:text-app-accent-primary"
            }`}
            title="Yêu thích"
          >
            <i className={`${isFav ? "ri-bookmark-fill" : "ri-bookmark-line"} text-sm`}></i>
          </button>
        </div>
      </div>

      <button
        onClick={() => setShowExample(v => !v)}
        className="text-xs text-app-text-muted hover:text-app-accent-primary transition-colors cursor-pointer flex items-center gap-1 mt-1"
      >
        <i className={`${showExample ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"} text-sm`}></i>
        {showExample ? "Ẩn ví dụ" : "Xem ví dụ"}
      </button>

      {showExample && (
        <div className="mt-2 bg-app-surface/50 rounded-lg p-3 border-l-2 border-app-accent-primary/30">
          <div className="flex items-start gap-2">
            <button
              onClick={() => speak(item.example)}
              className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-app-accent-primary cursor-pointer"
            >
              <i className="ri-play-circle-line text-base"></i>
            </button>
            <div>
              <p className="text-sm text-white/80 font-medium">{item.example}</p>
              <p className="text-xs text-app-text-secondary mt-0.5 italic">{item.exampleVi}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EpsTopicDictionaryPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return epsVocabulary.filter(item => {
      if (selectedTopic !== "all" && item.topicId !== selectedTopic) return false;
      if (selectedLevel !== "all" && item.level !== selectedLevel) return false;
      if (showFavOnly && !favorites.has(item.id)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.korean.includes(q) ||
          item.reading.toLowerCase().includes(q) ||
          item.vietnamese.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedTopic, selectedLevel, search, showFavOnly, favorites]);

  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    epsVocabulary.forEach(item => {
      counts[item.topicId] = (counts[item.topicId] || 0) + 1;
    });
    return counts;
  }, []);

  // Flashcard mode
  const flashcardItems = filtered.length > 0 ? filtered : epsVocabulary;
  const currentCard = flashcardItems[flashcardIndex % flashcardItems.length];

  if (flashcardMode && currentCard) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#0a0c0f] flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => { setFlashcardMode(false); setFlashcardIndex(0); setFlashcardFlipped(false); }}
                className="flex items-center gap-2 text-app-text-secondary hover:text-white/70 cursor-pointer"
              >
                <i className="ri-arrow-left-line"></i>
                <span className="text-sm">Thoát flashcard</span>
              </button>
              <span className="text-sm text-app-text-muted">{(flashcardIndex % flashcardItems.length) + 1} / {flashcardItems.length}</span>
            </div>

            <div
              className="bg-[#111318] rounded-2xl border border-app-border p-10 text-center cursor-pointer min-h-[280px] flex flex-col items-center justify-center transition-all hover:border-app-accent-primary/20"
              onClick={() => setFlashcardFlipped(v => !v)}
            >
              {!flashcardFlipped ? (
                <>
                  <p className="text-4xl font-bold text-white mb-3">{currentCard.korean}</p>
                  <p className="text-base text-app-text-muted font-mono">[{currentCard.reading}]</p>
                  <button
                    onClick={e => { e.stopPropagation(); speak(currentCard.korean); }}
                    className="mt-4 w-10 h-10 flex items-center justify-center rounded-full bg-app-accent-primary/10 text-app-accent-primary hover:bg-app-accent-primary/20 transition-colors cursor-pointer"
                  >
                    <i className="ri-volume-up-line text-lg"></i>
                  </button>
                  <p className="text-xs text-app-text-muted mt-6">Nhấn để xem nghĩa</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-app-accent-primary mb-2">{currentCard.vietnamese}</p>
                  <p className="text-sm text-app-text-secondary mt-2 italic">{currentCard.example}</p>
                  <p className="text-xs text-app-text-muted mt-1">{currentCard.exampleVi}</p>
                  <p className="text-xs text-app-text-muted mt-6">Nhấn để lật lại</p>
                </>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setFlashcardIndex(i => Math.max(0, i - 1)); setFlashcardFlipped(false); }}
                disabled={flashcardIndex === 0}
                className="flex-1 py-3 rounded-xl border border-app-border text-app-text-secondary hover:bg-app-card/50 disabled:opacity-30 cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-arrow-left-line mr-2"></i>Trước
              </button>
              <button
                onClick={() => { setFlashcardIndex(i => i + 1); setFlashcardFlipped(false); }}
                className="flex-1 py-3 rounded-xl bg-app-accent-primary text-app-bg font-medium hover:bg-[#d4b340] cursor-pointer whitespace-nowrap transition-colors"
              >
                Tiếp<i className="ri-arrow-right-line ml-2"></i>
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0a0c0f]">
        {/* Header */}
        <div className="bg-app-bg border-b border-app-border px-6 py-5">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <i className="ri-book-open-line text-app-accent-primary"></i>
                  Từ điển EPS theo chủ đề
                </h1>
                <p className="text-sm text-app-text-secondary mt-0.5">
                  {epsVocabulary.length} từ vựng · {EPS_VOCAB_TOPICS.length} chủ đề · Chuẩn EPS-TOPIK
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFlashcardMode(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-app-accent-primary text-app-bg rounded-lg text-sm font-bold hover:bg-[#d4b340] cursor-pointer whitespace-nowrap transition-colors"
                >
                  <i className="ri-stack-line"></i>
                  Luyện Flashcard
                </button>
                <div className="flex items-center bg-app-card/50 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${viewMode === "grid" ? "bg-app-card/70 text-white" : "text-app-text-muted"}`}
                  >
                    <i className="ri-grid-line text-sm"></i>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${viewMode === "list" ? "bg-app-card/70 text-white" : "text-app-text-muted"}`}
                  >
                    <i className="ri-list-check text-sm"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Search + filters */}
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="relative flex-1 min-w-[200px]">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm từ tiếng Hàn, phiên âm, nghĩa..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-app-border rounded-lg focus:outline-none focus:border-app-accent-primary/40 bg-app-card/50 text-white placeholder-white/25"
                />
              </div>
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className="px-3 py-2 text-sm border border-app-border rounded-lg focus:outline-none focus:border-app-accent-primary/40 bg-app-card/50 text-white/70 cursor-pointer"
              >
                {LEVELS.map(l => (
                  <option key={l.value} value={l.value} className="bg-app-bg">{l.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowFavOnly(v => !v)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors cursor-pointer whitespace-nowrap ${
                  showFavOnly ? "bg-app-accent-primary/10 border-app-accent-primary/30 text-app-accent-primary" : "border-app-border text-app-text-secondary hover:border-white/20"
                }`}
              >
                <i className={`${showFavOnly ? "ri-bookmark-fill" : "ri-bookmark-line"} text-sm`}></i>
                Yêu thích ({favorites.size})
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
          {/* Sidebar — Topics */}
          <div className="w-56 flex-shrink-0">
            <div className="bg-app-bg rounded-xl border border-app-border overflow-hidden sticky top-4">
              <div className="px-4 py-3 border-b border-app-border">
                <p className="text-xs font-semibold text-app-text-muted tracking-normal">Chủ đề</p>
              </div>
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                <button
                  onClick={() => setSelectedTopic("all")}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                    selectedTopic === "all" ? "bg-app-accent-primary/8 text-app-accent-primary font-medium" : "text-white/50 hover:bg-app-surface/50 hover:text-white/70"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <i className="ri-apps-line text-sm"></i>
                    Tất cả
                  </span>
                  <span className="text-xs text-app-text-muted">{epsVocabulary.length}</span>
                </button>
                {EPS_VOCAB_TOPICS.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                      selectedTopic === topic.id ? "bg-app-accent-primary/8 text-app-accent-primary font-medium" : "text-white/50 hover:bg-app-surface/50 hover:text-white/70"
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <i className={`${topic.icon} text-sm flex-shrink-0`} style={{ color: selectedTopic === topic.id ? "app-accent-primary" : topic.color }}></i>
                      <span className="truncate text-xs">{topic.label}</span>
                    </span>
                    <span className="text-xs text-app-text-muted flex-shrink-0">{topicCounts[topic.id] || 0}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Topic header */}
            {selectedTopic !== "all" && (() => {
              const topic = EPS_VOCAB_TOPICS.find(t => t.id === selectedTopic);
              if (!topic) return null;
              return (
                <div className="flex items-center gap-3 mb-4 p-4 bg-app-bg rounded-xl border border-app-border">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${topic.color}15` }}>
                    <i className={`${topic.icon} text-lg`} style={{ color: topic.color }}></i>
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">{topic.label}</h2>
                    <p className="text-xs text-app-text-secondary">{topic.labelKo} · {topic.description}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-bold text-white">{filtered.length}</p>
                    <p className="text-xs text-app-text-muted">từ vựng</p>
                  </div>
                </div>
              );
            })()}

            {/* Results count */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-app-text-secondary">
                {filtered.length} từ vựng
                {search && <span className="ml-1">cho &ldquo;<strong className="text-white/60">{search}</strong>&rdquo;</span>}
              </p>
              {filtered.length > 0 && (
                <button
                  onClick={() => speak(filtered.map(i => i.korean).slice(0, 5).join(", "))}
                  className="text-xs text-app-text-muted hover:text-app-accent-primary flex items-center gap-1 cursor-pointer"
                >
                  <i className="ri-volume-up-line"></i>
                  Phát âm tất cả
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-app-text-muted">
                <i className="ri-search-line text-4xl mb-3 block"></i>
                <p className="text-sm">Không tìm thấy từ vựng phù hợp</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filtered.map(item => (
                  <VocabCard
                    key={item.id}
                    item={item}
                    onToggleFav={toggleFav}
                    isFav={favorites.has(item.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-app-bg rounded-xl border border-app-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-app-border bg-white/2">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-app-text-muted tracking-normal">Tiếng Hàn</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-app-text-muted tracking-normal">Phiên âm</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-app-text-muted tracking-normal">Nghĩa</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-app-text-muted tracking-normal">Cấp độ</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, idx) => (
                      <tr key={item.id} className={`border-b border-white/3 hover:bg-white/2 transition-colors ${idx % 2 === 0 ? "" : "bg-white/1"}`}>
                        <td className="px-4 py-3">
                          <span className="font-bold text-white text-base">{item.korean}</span>
                        </td>
                        <td className="px-4 py-3 text-app-text-muted font-mono text-xs">[{item.reading}]</td>
                        <td className="px-4 py-3 text-white/60">{item.vietnamese}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${LEVEL_COLORS[item.level]}`}>
                            {LEVEL_LABELS[item.level]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => speak(item.korean)} className="w-6 h-6 flex items-center justify-center text-app-text-muted hover:text-app-accent-primary cursor-pointer transition-colors">
                              <i className="ri-volume-up-line text-sm"></i>
                            </button>
                            <button onClick={() => toggleFav(item.id)} className={`w-6 h-6 flex items-center justify-center cursor-pointer transition-colors ${favorites.has(item.id) ? "text-app-accent-primary" : "text-app-text-muted hover:text-app-accent-primary"}`}>
                              <i className={`${favorites.has(item.id) ? "ri-bookmark-fill" : "ri-bookmark-line"} text-sm`}></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
