import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import type { GrammarPattern } from "@/data/grammarPatterns";

// Replaced 2026-05-25: merged 352-pattern TOPIK grammar (formerly /grammar-by-level)
// into /grammar as canonical grammar page. Old 52-pattern mocks/grammarData.ts unused now.

const LEVELS = ["Tất cả", "TOPIK 1", "TOPIK 2", "TOPIK 3", "TOPIK 4", "TOPIK 5", "TOPIK 6"];

export default function GrammarPage() {
  const [GRAMMAR_PATTERNS, setPatterns] = useState<GrammarPattern[]>([]);
  const [patternsLoaded, setPatternsLoaded] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("Tất cả");
  const [selectedPattern, setSelectedPattern] = useState<GrammarPattern | null>(null);
  const [activeTab, setActiveTab] = useState<"explain" | "examples" | "exercise" | "write">("explain");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [writeSentence, setWriteSentence] = useState("");
  const [writeFeedback, setWriteFeedback] = useState<{ ok: boolean; message: string; sample?: string } | null>(null);
  const [search, setSearch] = useState("");
  const [openLevels, setOpenLevels] = useState<Set<string>>(new Set<string>());

  const location = useLocation();

  // Dynamic-import the ~620KB grammar dataset so it doesn't block the route chunk.
  useEffect(() => {
    let mounted = true;
    import("@/data/grammarPatterns").then(m => {
      if (!mounted) return;
      setPatterns(m.GRAMMAR_PATTERNS);
      setPatternsLoaded(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 1024 && !selectedPattern && GRAMMAR_PATTERNS.length > 0) {
      setSelectedPattern(GRAMMAR_PATTERNS[0]);
    }
  }, [GRAMMAR_PATTERNS, selectedPattern]);

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id');
    if (id && GRAMMAR_PATTERNS.length > 0) {
      const pattern = GRAMMAR_PATTERNS.find(p => p.id === id);
      if (pattern) {
        setSelectedPattern(pattern);
        setActiveTab("explain");
        setAnswers({});
        setShowResults(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [location.search, GRAMMAR_PATTERNS]);

  const filtered = useMemo(() => {
    let list = selectedLevel === "Tất cả" ? GRAMMAR_PATTERNS : GRAMMAR_PATTERNS.filter(p => p.level === selectedLevel);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.pattern.toLowerCase().includes(q) ||
        p.meaning.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedLevel, search, GRAMMAR_PATTERNS]);

  const levelStats = useMemo(() => {
    const stats: Record<string, number> = {};
    GRAMMAR_PATTERNS.forEach(p => { stats[p.level] = (stats[p.level] || 0) + 1; });
    return stats;
  }, [GRAMMAR_PATTERNS]);

  const toggleLevel = (lv: string) => setOpenLevels(prev => { const n = new Set(prev); n.has(lv) ? n.delete(lv) : n.add(lv); return n; });

  useEffect(() => {
    setWriteSentence("");
    setWriteFeedback(null);
  }, [selectedPattern]);

  const handleAnswer = (qIdx: number, optIdx: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = () => setShowResults(true);
  const handleReset = () => { setAnswers({}); setShowResults(false); };

  const checkWriteSentence = (pattern: GrammarPattern, sentence: string) => {
    const trimmed = sentence.trim();
    if (!trimmed || !/[가-힣]/.test(trimmed)) {
      setWriteFeedback({ ok: false, message: "Hãy viết câu bằng tiếng Hàn." });
      return;
    }
    const raw = pattern.pattern;
    const keywords = raw
      .replace(/[~A-Za-z\/\s\(\)]/g, " ")
      .split(/\s+/)
      .filter(s => /[가-힣]/.test(s) && s.length >= 2);
    const found = keywords.some(kw => trimmed.includes(kw));
    const sample = pattern.examples[0]?.korean ?? "";
    if (found) {
      setWriteFeedback({ ok: true, message: "✓ Câu của bạn có dùng mẫu này. Tốt lắm!", sample });
    } else {
      setWriteFeedback({ ok: false, message: `✗ Chưa thấy mẫu ngữ pháp trong câu. Hãy thử lại.`, sample });
    }
  };

  const correctCount = selectedPattern
    ? selectedPattern.exercises.filter((ex, i) => answers[i] === ex.answer).length
    : 0;

  if (!patternsLoaded) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Ngữ pháp tiếng Hàn</h1>
            <p className="text-white/50 text-sm mt-1">Đang tải dữ liệu ngữ pháp...</p>
          </div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-app-card/40 border border-app-border rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Ngữ pháp tiếng Hàn</h1>
          <p className="text-white/50 text-sm mt-1">{GRAMMAR_PATTERNS.length} cấu trúc ngữ pháp từ TOPIK 1 đến TOPIK 6 — giải thích, ví dụ, bài tập</p>
        </div>

        {/* Stats bar - compact on mobile */}
        <div className="mb-5 p-3.5 bg-gradient-to-r from-app-surface/50 to-app-card/50 border border-app-border rounded-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <i className="ri-book-2-line text-app-accent-primary"></i>
              <span className="text-sm font-bold text-white">Tổng: <span className="text-app-accent-primary">{GRAMMAR_PATTERNS.length}</span> cấu trúc</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {["TOPIK 1", "TOPIK 2", "TOPIK 3", "TOPIK 4", "TOPIK 5", "TOPIK 6"].map(lv => (
                <span key={lv} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/70 border border-white/10">
                  {lv}: {levelStats[lv] || 0}
                </span>
              ))}
            </div>
          </div>
          {(selectedLevel !== "Tất cả" || search.trim()) && (
            <div className="mt-2 pt-2 border-t border-app-border text-xs text-white/50">
              Đang hiển thị <span className="font-bold text-app-accent-primary">{filtered.length}</span> / {GRAMMAR_PATTERNS.length} cấu trúc
              {selectedLevel !== "Tất cả" && <span> • Cấp độ: <span className="font-bold">{selectedLevel}</span></span>}
              {search.trim() && <span> • Tìm: "<span className="font-bold">{search}</span>"</span>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Pattern list - sticky on desktop, hidden on mobile when detail open */}
          <div className={`lg:col-span-1 lg:sticky lg:top-4 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto ${selectedPattern ? 'hidden lg:block' : ''}`}>
            {/* Filters - sticky on mobile */}
            <div className="mb-3 sticky top-0 bg-app-bg z-10 pb-3">
              <div className="relative mb-3">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm"></i>
                <input
                  type="text"
                  placeholder="Tìm cấu trúc..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-app-border rounded-xl text-sm bg-app-surface/50 text-white focus:outline-none focus:ring-2 focus:ring-app-accent-primary"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {LEVELS.map(lv => (
                  <button
                    key={lv}
                    onClick={() => setSelectedLevel(lv)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${selectedLevel === lv ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/60 hover:bg-app-surface/70"}`}
                  >
                    {lv}
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern list */}
            {selectedLevel !== "Tất cả" || search.trim() ? (
              /* Flat list (filtered / search mode) */
              <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-1 gap-2">
                {filtered.map(pattern => (
                  <button
                    key={pattern.id}
                    onClick={() => { setSelectedPattern(pattern); setActiveTab("explain"); handleReset(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`text-left p-2.5 rounded-lg border cursor-pointer transition-all ${selectedPattern?.id === pattern.id ? "border-app-accent-primary bg-app-accent-primary/10" : "border-app-border bg-app-surface/50 hover:bg-app-surface/70"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: pattern.levelColor }}>
                        {pattern.level.replace('TOPIK ', '')}
                      </span>
                      <span className="font-semibold text-xs text-white truncate">{pattern.pattern}</span>
                    </div>
                    <p className="text-[10px] text-white/50 truncate">{pattern.meaning}</p>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-white/40 text-sm">Không tìm thấy cấu trúc nào</div>
                )}
              </div>
            ) : (
              /* Grouped accordion by level */
              <div className="space-y-2">
                {LEVELS.filter(lv => lv !== "Tất cả" && (levelStats[lv] || 0) > 0).map(lv => {
                  const lvPatterns = GRAMMAR_PATTERNS.filter(p => p.level === lv);
                  const lvColor = lvPatterns[0]?.levelColor ?? "#888";
                  const isOpen = openLevels.has(lv);
                  return (
                    <div key={lv} className="border border-app-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleLevel(lv)}
                        className="w-full flex items-center justify-between px-3 py-2.5 bg-app-surface/70 hover:bg-app-surface/90 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: lvColor }}>
                            {lv}
                          </span>
                          <span className="text-white/50 text-xs">({levelStats[lv] || 0} cấu trúc)</span>
                        </div>
                        <i className={`${isOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-white/50`}></i>
                      </button>
                      {isOpen && (
                        <div className="grid grid-cols-2 sm:grid-cols-1 lg:grid-cols-1 gap-1.5 p-2 bg-app-bg/20">
                          {lvPatterns.map(pattern => (
                            <button
                              key={pattern.id}
                              onClick={() => { setSelectedPattern(pattern); setActiveTab("explain"); handleReset(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className={`text-left p-2.5 rounded-lg border cursor-pointer transition-all ${selectedPattern?.id === pattern.id ? "border-app-accent-primary bg-app-accent-primary/10" : "border-app-border bg-app-surface/50 hover:bg-app-surface/70"}`}
                            >
                              <span className="font-semibold text-xs text-white truncate block mb-0.5">{pattern.pattern}</span>
                              <p className="text-[10px] text-white/50 truncate">{pattern.meaning}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Detail */}
          <div className={`lg:col-span-2 ${!selectedPattern ? 'hidden lg:block' : ''}`}>
            {!selectedPattern ? (
              <div className="flex flex-col items-center justify-center h-64 text-white/40">
                <i className="ri-book-open-line text-5xl mb-3"></i>
                <p className="text-sm">Chọn một cấu trúc ngữ pháp để xem chi tiết</p>
              </div>
            ) : (
              <div className="bg-app-surface/50 rounded-2xl border border-app-border overflow-hidden">
                {/* Pattern header with back button on mobile */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-app-border">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => setSelectedPattern(null)}
                      className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-surface/70 text-white/70 hover:text-white text-sm border border-app-border"
                    >
                      <i className="ri-arrow-left-line"></i>Danh sách
                    </button>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold text-white" style={{ backgroundColor: selectedPattern.levelColor }}>
                      {selectedPattern.level}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-white">{selectedPattern.pattern}</h2>
                  </div>
                  <p className="text-white/70 font-medium text-sm sm:text-base">{selectedPattern.meaning}</p>
                  <div className="mt-2 px-3 py-2 bg-app-card/50 rounded-lg">
                    <span className="text-xs text-white/50 font-semibold">Cấu trúc: </span>
                    <span className="text-xs text-white font-mono">{selectedPattern.formation}</span>
                  </div>
                </div>

                {/* Tabs - better touch targets on mobile */}
                <div className="flex border-b border-app-border">
                  {([
                    { id: "explain", label: "Giải thích", icon: "ri-book-2-line" },
                    { id: "examples", label: "Ví dụ", icon: "ri-chat-quote-line" },
                    { id: "exercise", label: "Bài tập", icon: "ri-pencil-line" },
                    { id: "write", label: "Viết câu", icon: "ri-edit-2-line" },
                  ] as const).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 text-xs sm:text-sm font-medium cursor-pointer transition-colors whitespace-nowrap ${activeTab === tab.id ? "text-app-accent-primary border-b-2 border-app-accent-primary" : "text-white/50 hover:text-white/70"}`}
                    >
                      <i className={tab.icon}></i>{tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab content - better padding for mobile */}
                <div className="p-4 sm:p-6">
                  {activeTab === "explain" && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2">Giải thích</h3>
                        <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{selectedPattern.explanation}</p>
                      </div>
                      {selectedPattern.notes && selectedPattern.notes.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-white mb-2">Quy tắc sử dụng</h3>
                          <div className="bg-app-accent-primary/10 border border-app-accent-primary/20 rounded-xl p-4 space-y-2">
                            {selectedPattern.notes.map((note, i) => (
                              <div key={i} className="flex items-start gap-2.5 text-sm">
                                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-app-accent-primary/20 text-app-accent-primary text-[10px] font-bold mt-0.5">{i + 1}</span>
                                <span className="text-white leading-relaxed">{note}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2">Lỗi thường gặp</h3>
                        <div className="space-y-2">
                          {selectedPattern.commonMistakes.map((m, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <i className="ri-error-warning-line text-amber-500 flex-shrink-0 mt-0.5"></i>
                              <span className="text-white/70">{m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {selectedPattern.comparison && (
                        <div>
                          <h3 className="text-sm font-semibold text-white mb-2">{selectedPattern.comparison.title}</h3>
                          <div className="border border-app-border rounded-xl overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-app-surface/50">
                                  <th className="px-4 py-2.5 text-left font-bold text-app-accent-primary border-r border-app-border">{selectedPattern.comparison.headers[0]}</th>
                                  <th className="px-4 py-2.5 text-left font-bold text-blue-400">{selectedPattern.comparison.headers[1]}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedPattern.comparison.rows.map((row, i) => (
                                  <tr key={i} className={i % 2 === 0 ? "bg-app-card/30" : "bg-app-surface/30"}>
                                    <td className="px-4 py-2.5 text-white/70 border-r border-app-border align-top">{row[0]}</td>
                                    <td className="px-4 py-2.5 text-white/70 align-top">{row[1]}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedPattern.tags.map(tag => (
                            <span key={tag} className="px-2.5 py-1 bg-app-accent-primary/10 text-app-accent-primary text-xs rounded-full font-medium">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "examples" && (
                    <div className="space-y-3 sm:space-y-4">
                      {selectedPattern.examples.map((ex, i) => (
                        <div key={i} className="p-3 sm:p-4 bg-app-card/50 rounded-xl">
                          <p className="text-sm sm:text-base font-bold text-white mb-1">{ex.korean}</p>
                          <p className="text-xs sm:text-sm text-white/50">{ex.vietnamese}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "write" && (() => {
                    const currentIdx = filtered.findIndex(p => p.id === selectedPattern.id);
                    const prevP = currentIdx > 0 ? filtered[currentIdx - 1] : null;
                    const nextP = currentIdx < filtered.length - 1 ? filtered[currentIdx + 1] : null;
                    const goTo = (p: GrammarPattern) => { setSelectedPattern(p); setActiveTab("write"); handleReset(); window.scrollTo({ top: 0, behavior: "smooth" }); };
                    return (
                      <div className="space-y-4">
                        {/* Progress indicator */}
                        <div className="flex items-center justify-between text-xs text-white/40">
                          <span>{currentIdx + 1} / {filtered.length} mẫu</span>
                          <span>{selectedPattern.level}</span>
                        </div>
                        <div className="h-1 bg-app-border rounded-full overflow-hidden">
                          <div className="h-full bg-app-accent-primary rounded-full" style={{ width: `${((currentIdx + 1) / filtered.length) * 100}%` }} />
                        </div>

                        <div className="p-3 bg-app-accent-primary/8 border border-app-accent-primary/20 rounded-xl text-sm text-white/70">
                          Viết 1–2 câu có dùng mẫu <span className="text-app-accent-primary font-semibold">{selectedPattern.pattern}</span>
                          <span className="block text-xs text-white/40 mt-0.5">Cấu trúc: {selectedPattern.formation}</span>
                        </div>
                        <textarea
                          value={writeSentence}
                          onChange={e => { setWriteSentence(e.target.value); setWriteFeedback(null); }}
                          placeholder="저는... (Viết câu tiếng Hàn tại đây)"
                          rows={4}
                          className="w-full bg-app-card/40 border border-app-border rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-app-accent-primary resize-none"
                        />
                        <button
                          onClick={() => checkWriteSentence(selectedPattern, writeSentence)}
                          disabled={!writeSentence.trim()}
                          className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed bg-app-accent-primary hover:bg-app-accent-primary/90 text-app-bg"
                        >
                          Kiểm tra
                        </button>
                        {writeFeedback && (
                          <div className={`p-3 rounded-xl text-sm border ${writeFeedback.ok ? "bg-green-500/8 border-green-500/25 text-green-400" : "bg-red-500/8 border-red-500/25 text-red-400"}`}>
                            <p className="font-medium mb-2">{writeFeedback.message}</p>
                            {writeFeedback.sample && (
                              <p className="text-xs text-white/40">Câu mẫu: <span className="text-white/60">{writeFeedback.sample}</span></p>
                            )}
                          </div>
                        )}

                        {/* Prev / Next navigation */}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => prevP && goTo(prevP)}
                            disabled={!prevP}
                            className="flex-1 py-2 rounded-xl text-sm border border-app-border text-white/50 hover:bg-app-surface/50 cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                          >
                            <i className="ri-arrow-left-line mr-1"></i>Trước
                            {prevP && <span className="ml-1 text-white/30 text-xs truncate">{prevP.pattern}</span>}
                          </button>
                          <button
                            onClick={() => nextP && goTo(nextP)}
                            disabled={!nextP}
                            className="flex-1 py-2 rounded-xl text-sm border border-app-accent-primary/40 text-app-accent-primary hover:bg-app-accent-primary/10 cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                          >
                            Tiếp
                            {nextP && <span className="ml-1 text-app-accent-primary/50 text-xs truncate">{nextP.pattern}</span>}
                            <i className="ri-arrow-right-line ml-1"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {activeTab === "exercise" && (
                    <div className="space-y-6">
                      {selectedPattern.exercises.map((ex, qIdx) => (
                        <div key={qIdx} className="space-y-3">
                          <p className="text-sm font-semibold text-white">
                            {qIdx + 1}. {ex.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {ex.options.map((opt, optIdx) => {
                              const isSelected = answers[qIdx] === optIdx;
                              const isCorrect = ex.answer === optIdx;
                              let btnClass = "px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all border text-left whitespace-nowrap ";
                              if (!showResults) {
                                btnClass += isSelected
                                  ? "bg-app-accent-primary/10 border-app-accent-primary text-app-accent-primary"
                                  : "bg-app-card/30 border-app-border text-white/70 hover:border-app-border";
                              } else {
                                if (isCorrect) btnClass += "bg-green-500/10 border-green-500 text-green-400";
                                else if (isSelected && !isCorrect) btnClass += "bg-red-500/10 border-red-500 text-red-400";
                                else btnClass += "bg-app-card/30 border-app-border text-white/40";
                              }
                              return (
                                <button key={optIdx} onClick={() => handleAnswer(qIdx, optIdx)} className={btnClass}>
                                  {showResults && isCorrect && <i className="ri-check-line mr-1 text-green-600"></i>}
                                  {showResults && isSelected && !isCorrect && <i className="ri-close-line mr-1 text-red-600"></i>}
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {showResults && (
                            <div className={`p-3 rounded-lg text-xs ${answers[qIdx] === ex.answer ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                              <i className={`${answers[qIdx] === ex.answer ? "ri-check-line" : "ri-close-line"} mr-1`}></i>
                              {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}

                      {!showResults ? (
                        <button
                          onClick={handleSubmit}
                          disabled={Object.keys(answers).length < selectedPattern.exercises.length}
                          className={`w-full py-3 rounded-xl font-semibold text-sm cursor-pointer transition-colors whitespace-nowrap ${Object.keys(answers).length < selectedPattern.exercises.length ? "bg-app-surface/50 text-white/40 cursor-not-allowed" : "bg-app-accent-primary hover:bg-app-accent-primary/90 text-app-bg"}`}
                        >
                          Kiểm tra đáp án
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <div className={`p-4 rounded-xl text-center ${correctCount === selectedPattern.exercises.length ? "bg-green-500/10" : "bg-amber-500/10"}`}>
                            <p className="text-xl font-bold mb-1" style={{ color: correctCount === selectedPattern.exercises.length ? "#22c55e" : "#f59e0b" }}>
                              {correctCount}/{selectedPattern.exercises.length}
                            </p>
                            <p className="text-sm font-medium text-white/70">
                              {correctCount === selectedPattern.exercises.length ? "Hoàn hảo! Bạn đã nắm vững cấu trúc này." : "Hãy xem lại phần giải thích và thử lại!"}
                            </p>
                          </div>
                          <button
                            onClick={handleReset}
                            className="w-full py-2.5 rounded-xl font-semibold text-sm cursor-pointer border border-app-border text-white/70 hover:bg-app-surface/50 transition-colors whitespace-nowrap"
                          >
                            Làm lại
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
