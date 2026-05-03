import { useMemo, useState, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import hanjaData from "@/data/hanja_phan1.json";

interface HanjaEntry {
  id: number;
  hangul: string;
  hanja: string;
  meaning_vn: string | null;
  hanja_breakdown: { char: string; reading: string; meaning: string }[];
  examples: { ko: string; vi: string; boi?: string }[];
  related_words: { word: string; hanja: string; meaning: string }[];
  mnemonic: string | null;
  raw: string;
}

// Filter out the header row (id=1 without hangul content)
const ENTRIES: HanjaEntry[] = (hanjaData as HanjaEntry[]).filter(
  e => e.examples.length > 0 || e.mnemonic || e.hanja.length > 0 && /[\u4e00-\u9fff]/.test(e.hanja)
);

// Extract all unique hanja characters for filter
const UNIQUE_CHARS = Array.from(
  new Set(ENTRIES.flatMap(e => e.hanja.split("").filter(c => /[\u4e00-\u9fff]/.test(c))))
).sort();

function playTTS(text: string, lang = "ko-KR") {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export default function HanjaProPage() {
  const [search, setSearch] = useState("");
  const [filterChar, setFilterChar] = useState<string | null>(null);
  const [selected, setSelected] = useState<HanjaEntry | null>(null);
  const [activeTab, setActiveTab] = useState<"meaning" | "examples" | "related" | "mnemonic">("meaning");
  const [known, setKnown] = useLocalStorage<Record<number, boolean>>("kts_hanja_pro_known", {});
  const [favorites, setFavorites] = useLocalStorage<Record<number, boolean>>("kts_hanja_pro_fav", {});
  const [quizMode, setQuizMode] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  const filtered = useMemo(() => {
    let list = ENTRIES;
    if (filterChar) list = list.filter(e => e.hanja.includes(filterChar));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.hangul.toLowerCase().includes(q) ||
        e.hanja.includes(q) ||
        (e.meaning_vn?.toLowerCase().includes(q) ?? false)
      );
    }
    return list;
  }, [search, filterChar]);

  const stats = useMemo(() => ({
    total: ENTRIES.length,
    known: Object.values(known).filter(Boolean).length,
    favorites: Object.values(favorites).filter(Boolean).length,
  }), [known, favorites]);

  const toggleKnown = useCallback((id: number) => {
    setKnown(prev => ({ ...prev, [id]: !prev[id] }));
  }, [setKnown]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  }, [setFavorites]);

  // Quiz logic
  const quizSet = useMemo(() => {
    return [...ENTRIES].sort(() => Math.random() - 0.5).slice(0, 10);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizMode]);

  const quizCurrent = quizSet[quizIdx];
  const quizOptions = useMemo(() => {
    if (!quizCurrent) return [];
    const others = ENTRIES.filter(e => e.id !== quizCurrent.id)
      .sort(() => Math.random() - 0.5).slice(0, 3);
    return [...others, quizCurrent].sort(() => Math.random() - 0.5);
  }, [quizCurrent]);

  const handleQuizAnswer = (id: number) => {
    if (quizAnswered !== null) return;
    setQuizAnswered(id);
    const correct = id === quizCurrent.id;
    setQuizScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  };

  const handleNextQuiz = () => {
    if (quizIdx + 1 >= quizSet.length) {
      setQuizMode(false);
      setQuizIdx(0);
      setQuizAnswered(null);
    } else {
      setQuizIdx(i => i + 1);
      setQuizAnswered(null);
    }
  };

  // ─── Quiz Mode ──────────────────────────────────────────────────────────
  if (quizMode && quizCurrent) {
    const example = quizCurrent.examples[0];
    return (
      <DashboardLayout title="Quiz Hán Hàn" subtitle={`Câu ${quizIdx + 1}/${quizSet.length} · Điểm: ${quizScore.correct}/${quizScore.total}`}>
        <div className="max-w-3xl mx-auto">
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 mb-6">
            <p className="text-app-text-muted text-sm mb-4">Chọn từ Hán Hàn phù hợp với ví dụ sau:</p>
            {example && (
              <div className="bg-app-card/30 rounded-xl p-5 mb-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-white text-xl font-medium leading-relaxed flex-1">{example.ko}</p>
                  <button onClick={() => playTTS(example.ko)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-app-accent-primary/15 text-app-accent-primary hover:bg-app-accent-primary/25 transition-colors">
                    <i className="ri-volume-up-line text-lg"></i>
                  </button>
                </div>
                <p className="text-app-text-secondary text-base italic">{example.vi}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {quizOptions.map(opt => {
                const isCorrect = opt.id === quizCurrent.id;
                const isChosen = quizAnswered === opt.id;
                let bgColor = "bg-app-card/40 border-app-border hover:border-app-accent-primary/40";
                if (quizAnswered !== null) {
                  if (isCorrect) bgColor = "bg-emerald-500/15 border-emerald-500/50";
                  else if (isChosen) bgColor = "bg-red-500/15 border-red-500/50";
                  else bgColor = "bg-app-card/20 border-app-border opacity-60";
                }
                return (
                  <button
                    key={opt.id}
                    disabled={quizAnswered !== null}
                    onClick={() => handleQuizAnswer(opt.id)}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${bgColor} ${quizAnswered === null ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <p className="text-white font-bold text-lg">{opt.hangul}</p>
                    <p className="text-app-accent-primary text-sm mt-1">{opt.hanja}</p>
                    {quizAnswered !== null && isCorrect && (
                      <p className="text-emerald-400 text-xs mt-2 line-clamp-2">{opt.meaning_vn || "—"}</p>
                    )}
                  </button>
                );
              })}
            </div>

            {quizAnswered !== null && (
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setQuizMode(false); setQuizIdx(0); setQuizAnswered(null); }} className="px-5 py-2.5 bg-app-card/50 hover:bg-app-card/70 text-white/70 rounded-xl text-sm font-medium cursor-pointer">
                  Thoát
                </button>
                <button onClick={handleNextQuiz} className="px-6 py-2.5 bg-app-accent-primary hover:bg-app-accent-primary/90 text-app-bg rounded-xl text-sm font-bold cursor-pointer">
                  {quizIdx + 1 >= quizSet.length ? "Hoàn thành" : "Câu tiếp"} <i className="ri-arrow-right-line ml-1"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Hán Hàn Chuyên Sâu"
      subtitle={`${stats.total} từ · Đã thuộc ${stats.known} · Yêu thích ${stats.favorites}`}
      actions={
        <button
          onClick={() => { setQuizMode(true); setQuizIdx(0); setQuizAnswered(null); setQuizScore({ correct: 0, total: 0 }); }}
          className="flex items-center gap-2 bg-app-accent-primary hover:bg-app-accent-primary/90 text-app-bg text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer whitespace-nowrap"
        >
          <i className="ri-brain-line"></i>Làm quiz 10 câu
        </button>
      }
    >
      {/* Search + filter */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-4 mb-6">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted"></i>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo hangul, hanja, hoặc nghĩa..."
              className="w-full bg-app-card/40 border border-app-border rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary/40"
            />
          </div>
          {(filterChar || search) && (
            <button
              onClick={() => { setFilterChar(null); setSearch(""); }}
              className="px-4 py-2.5 bg-app-card/40 hover:bg-app-card/60 text-white/70 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap"
            >
              <i className="ri-close-line mr-1"></i>Xóa filter
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-app-text-muted text-xs py-1.5 mr-1">Lọc theo gốc Hán:</span>
          {UNIQUE_CHARS.slice(0, 30).map(char => (
            <button
              key={char}
              onClick={() => setFilterChar(filterChar === char ? null : char)}
              className={`px-2.5 py-1 rounded-lg text-sm font-medium transition-colors ${filterChar === char ? "bg-app-accent-primary text-app-bg" : "bg-app-card/40 text-white/70 hover:bg-app-card/60"}`}
            >
              {char}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map(entry => {
          const isKnown = known[entry.id];
          const isFav = favorites[entry.id];
          return (
            <button
              key={entry.id}
              onClick={() => { setSelected(entry); setActiveTab("meaning"); }}
              className={`relative bg-app-bg border rounded-xl p-4 text-left cursor-pointer transition-all hover:border-app-accent-primary/40 ${isKnown ? "border-emerald-500/40" : "border-app-border"}`}
            >
              {isFav && <i className="ri-bookmark-fill absolute top-2 right-2 text-app-accent-primary text-sm"></i>}
              {isKnown && <i className="ri-check-double-line absolute top-2 right-2 text-emerald-400 text-sm"></i>}
              <p className="text-white font-bold text-base mb-1">{entry.hangul}</p>
              <p className="text-app-accent-primary text-sm font-medium mb-2">{entry.hanja}</p>
              <p className="text-app-text-secondary text-xs line-clamp-2">{entry.meaning_vn || "Nhấn để xem"}</p>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-app-text-muted">
          <i className="ri-search-line text-4xl mb-2"></i>
          <p>Không tìm thấy từ nào</p>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}>
          <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-app-bg border-b border-app-border px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-white font-bold text-2xl">{selected.hangul}</h2>
                    <button onClick={() => playTTS(selected.hangul)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-accent-primary/15 text-app-accent-primary hover:bg-app-accent-primary/25">
                      <i className="ri-volume-up-line"></i>
                    </button>
                  </div>
                  <p className="text-app-accent-primary text-lg font-medium">{selected.hanja}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleFavorite(selected.id)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 cursor-pointer" title="Yêu thích">
                  <i className={`${favorites[selected.id] ? "ri-bookmark-fill text-app-accent-primary" : "ri-bookmark-line text-app-text-muted"}`}></i>
                </button>
                <button onClick={() => toggleKnown(selected.id)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 cursor-pointer" title="Đánh dấu đã thuộc">
                  <i className={`${known[selected.id] ? "ri-check-double-line text-emerald-400" : "ri-check-line text-app-text-muted"}`}></i>
                </button>
                <button onClick={() => setSelected(null)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-app-card/50 hover:bg-app-card/70 cursor-pointer">
                  <i className="ri-close-line text-app-text-muted"></i>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-6 py-3 border-b border-app-border">
              {([
                { id: "meaning", label: "Giải nghĩa", icon: "ri-book-open-line" },
                { id: "examples", label: `Ví dụ (${selected.examples.length})`, icon: "ri-chat-quote-line" },
                { id: "related", label: `Liên quan (${selected.related_words.length})`, icon: "ri-links-line" },
                { id: "mnemonic", label: "Mẹo nhớ", icon: "ri-lightbulb-flash-line" },
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? "bg-app-accent-primary/15 text-app-accent-primary" : "text-app-text-secondary hover:text-white/80"}`}
                >
                  <i className={tab.icon}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              {activeTab === "meaning" && (
                <div className="space-y-4">
                  {selected.meaning_vn && (
                    <div>
                      <p className="text-app-text-muted text-xs font-semibold uppercase mb-1">Nghĩa</p>
                      <p className="text-white text-base">{selected.meaning_vn}</p>
                    </div>
                  )}
                  {selected.hanja_breakdown.length > 0 && (
                    <div>
                      <p className="text-app-text-muted text-xs font-semibold uppercase mb-2">Phân tích gốc Hán</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selected.hanja_breakdown.map((b, i) => (
                          <div key={i} className="bg-app-card/30 rounded-xl p-3 border border-app-border">
                            <div className="flex items-center gap-3">
                              <span className="text-app-accent-primary text-3xl font-bold">{b.char}</span>
                              <div>
                                <p className="text-white text-sm font-medium">{b.reading}</p>
                                <p className="text-app-text-secondary text-xs mt-0.5">{b.meaning}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Raw content fallback */}
                  <div>
                    <p className="text-app-text-muted text-xs font-semibold uppercase mb-2">Nội dung đầy đủ</p>
                    <pre className="bg-app-card/20 rounded-xl p-4 text-white/80 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                      {selected.raw}
                    </pre>
                  </div>
                </div>
              )}

              {activeTab === "examples" && (
                <div className="space-y-3">
                  {selected.examples.map((ex, i) => (
                    <div key={i} className="bg-app-card/30 rounded-xl p-4 border border-app-border">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-white text-base flex-1">{ex.ko}</p>
                        <button onClick={() => playTTS(ex.ko)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-accent-primary/15 text-app-accent-primary hover:bg-app-accent-primary/25 flex-shrink-0">
                          <i className="ri-volume-up-line text-sm"></i>
                        </button>
                      </div>
                      {ex.boi && <p className="text-app-text-muted text-xs italic mb-1">{ex.boi}</p>}
                      <p className="text-app-text-secondary text-sm">{ex.vi}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "related" && (
                <div className="space-y-2">
                  {selected.related_words.map((w, i) => (
                    <div key={i} className="bg-app-card/30 rounded-xl p-3 border border-app-border flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white font-bold">{w.word}</p>
                          <p className="text-app-accent-primary text-sm">{w.hanja}</p>
                        </div>
                        <p className="text-app-text-secondary text-xs">{w.meaning}</p>
                      </div>
                      <button onClick={() => playTTS(w.word)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-accent-primary/15 text-app-accent-primary hover:bg-app-accent-primary/25 flex-shrink-0">
                        <i className="ri-volume-up-line text-sm"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "mnemonic" && (
                <div className="bg-gradient-to-br from-app-accent-primary/10 to-amber-500/10 rounded-xl p-5 border border-app-accent-primary/20">
                  <div className="flex items-start gap-3">
                    <i className="ri-lightbulb-flash-fill text-app-accent-primary text-2xl"></i>
                    <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {selected.mnemonic || "Chưa có mẹo nhớ cho từ này."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
