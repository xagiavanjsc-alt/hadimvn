import { useState, useMemo, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { grammarPatterns, GRAMMAR_CATEGORIES, type GrammarPattern, type GrammarExercise } from "@/mocks/grammarData";

// ─── Exercise Component ───────────────────────────────────────────────────
function ExerciseItem({
  ex,
  onAnswer,
  answered,
}: {
  ex: GrammarExercise;
  onAnswer: (id: string, correct: boolean) => void;
  answered: boolean | null;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState("");

  const handleChoose = (opt: string) => {
    if (answered !== null) return;
    setSelected(opt);
    onAnswer(ex.id, opt === ex.answer);
  };

  const handleFillSubmit = () => {
    if (answered !== null) return;
    const trimmed = fillValue.trim();
    onAnswer(ex.id, trimmed === ex.answer);
  };

  const isCorrect = answered === true;

  return (
    <div className={`p-4 rounded-xl border transition-all ${answered === null ? "border-white/8 bg-white/3" : isCorrect ? "border-emerald-500/25 bg-emerald-500/5" : "border-red-500/25 bg-red-500/5"}`}>
      <p className="text-white/70 text-sm mb-1">{ex.question}</p>
      <p className="text-white/35 text-xs italic mb-3">{ex.questionVi}</p>

      {ex.type === "choose" && ex.options && (
        <div className="grid grid-cols-2 gap-2">
          {ex.options.map((opt, i) => {
            let cls = "border-white/8 bg-white/3 hover:border-white/15 cursor-pointer";
            if (answered !== null) {
              if (opt === ex.answer) cls = "border-emerald-500/40 bg-emerald-500/10 cursor-default";
              else if (opt === selected) cls = "border-red-500/40 bg-red-500/10 cursor-default";
              else cls = "border-white/5 opacity-40 cursor-default";
            }
            return (
              <button
                key={opt}
                onClick={() => handleChoose(opt)}
                disabled={answered !== null}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all ${cls}`}
              >
                <span className="text-white/30 text-[10px] font-bold">{["A","B","C","D"][i]}</span>
                <div>
                  <p className={`text-xs font-medium ${answered !== null && opt === ex.answer ? "text-emerald-400" : answered !== null && opt === selected ? "text-red-400" : "text-white/60"}`}>{opt}</p>
                  {ex.optionsVi && <p className="text-white/25 text-[10px]">{ex.optionsVi[i]}</p>}
                </div>
                {answered !== null && opt === ex.answer && <i className="ri-checkbox-circle-fill text-emerald-400 ml-auto text-sm"></i>}
                {answered !== null && opt === selected && opt !== ex.answer && <i className="ri-close-circle-fill text-red-400 ml-auto text-sm"></i>}
              </button>
            );
          })}
        </div>
      )}

      {ex.type === "fill" && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={fillValue}
            onChange={e => setFillValue(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleFillSubmit()}
            disabled={answered !== null}
            placeholder="Điền vào chỗ trống..."
            className={`flex-1 bg-white/5 border rounded-lg px-3 py-2 text-sm outline-none ${answered === null ? "border-white/10 text-white/70" : isCorrect ? "border-emerald-500/40 text-emerald-400" : "border-red-500/40 text-red-400"}`}
          />
          {answered === null && (
            <button
              onClick={handleFillSubmit}
              disabled={!fillValue.trim()}
              className="px-4 py-2 rounded-lg bg-[#e8c84a] text-[#0f1117] text-xs font-bold disabled:opacity-40 cursor-pointer whitespace-nowrap"
            >
              Kiểm tra
            </button>
          )}
          {answered !== null && (
            <div className={`flex items-center gap-1 text-xs font-bold ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
              <i className={isCorrect ? "ri-checkbox-circle-fill" : "ri-close-circle-fill"}></i>
              {isCorrect ? "Đúng!" : `Đáp án: ${ex.answer}`}
            </div>
          )}
        </div>
      )}

      {answered !== null && (
        <div className="mt-3 flex items-start gap-2 bg-white/3 rounded-lg p-2.5">
          <i className="ri-lightbulb-line text-[#e8c84a] text-xs flex-shrink-0 mt-0.5"></i>
          <p className="text-white/40 text-[10px] leading-relaxed">{ex.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ─── Roadmap Panel ────────────────────────────────────────────────────────
function RoadmapPanel({
  exerciseAnswers,
  onSelectPattern,
}: {
  exerciseAnswers: Record<string, boolean>;
  onSelectPattern: (id: string) => void;
}) {
  const LEVELS = ["A1", "A2", "B1", "B2"] as const;
  const levelColors: Record<string, string> = { A1: "#34d399", A2: "#e8c84a", B1: "#fb923c", B2: "#f87171" };

  // Tính % hoàn thành mỗi level
  const levelStats = LEVELS.map(lv => {
    const patterns = grammarPatterns.filter(p => p.level === lv);
    const totalEx = patterns.reduce((s, p) => s + p.exercises.length, 0);
    const doneEx = patterns.reduce((s, p) => s + p.exercises.filter(ex => exerciseAnswers[ex.id] !== undefined).length, 0);
    const correctEx = patterns.reduce((s, p) => s + p.exercises.filter(ex => exerciseAnswers[ex.id] === true).length, 0);
    const pct = totalEx > 0 ? Math.round((doneEx / totalEx) * 100) : 0;
    return { lv, patterns, totalEx, doneEx, correctEx, pct };
  });

  // Xác định level hiện tại (level đầu tiên chưa hoàn thành 80%)
  const currentLevelIdx = levelStats.findIndex(s => s.pct < 80);
  const currentLevel = currentLevelIdx >= 0 ? LEVELS[currentLevelIdx] : "B2";

  // Gợi ý mẫu câu tiếp theo: chưa làm bài tập nào, ưu tiên level hiện tại
  const suggestions = useMemo(() => {
    const currentPatterns = grammarPatterns.filter(p => p.level === currentLevel);
    const notStarted = currentPatterns.filter(p =>
      p.exercises.every(ex => exerciseAnswers[ex.id] === undefined)
    );
    const inProgress = currentPatterns.filter(p =>
      p.exercises.some(ex => exerciseAnswers[ex.id] !== undefined) &&
      p.exercises.some(ex => exerciseAnswers[ex.id] === undefined)
    );
    const needReview = currentPatterns.filter(p =>
      p.exercises.some(ex => exerciseAnswers[ex.id] === false)
    );
    return { notStarted: notStarted.slice(0, 2), inProgress: inProgress.slice(0, 2), needReview: needReview.slice(0, 2) };
  }, [exerciseAnswers, currentLevel]);

  const hasSuggestions = suggestions.notStarted.length > 0 || suggestions.inProgress.length > 0 || suggestions.needReview.length > 0;

  return (
    <div className="bg-[#0f1117] border border-white/8 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#e8c84a]/10">
          <i className="ri-route-line text-[#e8c84a] text-lg"></i>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Học theo lộ trình</p>
          <p className="text-white/30 text-xs">Gợi ý dựa trên tiến độ của bạn</p>
        </div>
        <div className="ml-auto flex items-center gap-2 bg-white/5 rounded-xl px-3 py-1.5">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: levelColors[currentLevel] }}></div>
          <span className="text-xs font-bold" style={{ color: levelColors[currentLevel] }}>Đang học: {currentLevel}</span>
        </div>
      </div>

      {/* Level progress bars */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {levelStats.map(({ lv, pct, doneEx, totalEx }) => (
          <div key={lv} className={`rounded-xl p-3 border transition-all ${lv === currentLevel ? "border-white/12 bg-white/3" : "border-white/5"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold" style={{ color: levelColors[lv] }}>{lv}</span>
              <span className="text-[10px] text-white/30">{pct}%</span>
            </div>
            <div className="bg-white/5 rounded-full h-1.5 overflow-hidden mb-1.5">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: levelColors[lv] }}></div>
            </div>
            <p className="text-white/25 text-[9px]">{doneEx}/{totalEx} bài tập</p>
            {pct >= 80 && <p className="text-emerald-400 text-[9px] mt-0.5">✓ Hoàn thành</p>}
          </div>
        ))}
      </div>

      {/* Suggestions */}
      {hasSuggestions ? (
        <div className="space-y-3">
          {suggestions.needReview.length > 0 && (
            <div>
              <p className="text-red-400/70 text-[10px] tracking-wider mb-2 flex items-center gap-1.5">
                <i className="ri-refresh-line"></i>Cần ôn lại ({suggestions.needReview.length})
              </p>
              <div className="flex gap-2 flex-wrap">
                {suggestions.needReview.map(p => (
                  <button key={p.id} onClick={() => onSelectPattern(p.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/8 border border-red-500/20 hover:border-red-500/35 cursor-pointer transition-all">
                    <span className="text-white/70 text-sm font-mono font-bold">{p.pattern}</span>
                    <span className="text-white/30 text-[10px]">{p.meaning}</span>
                    <i className="ri-arrow-right-line text-red-400/50 text-xs"></i>
                  </button>
                ))}
              </div>
            </div>
          )}
          {suggestions.inProgress.length > 0 && (
            <div>
              <p className="text-[#e8c84a]/70 text-[10px] tracking-wider mb-2 flex items-center gap-1.5">
                <i className="ri-loader-line"></i>Đang học dở ({suggestions.inProgress.length})
              </p>
              <div className="flex gap-2 flex-wrap">
                {suggestions.inProgress.map(p => (
                  <button key={p.id} onClick={() => onSelectPattern(p.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#e8c84a]/8 border border-[#e8c84a]/20 hover:border-[#e8c84a]/35 cursor-pointer transition-all">
                    <span className="text-white/70 text-sm font-mono font-bold">{p.pattern}</span>
                    <span className="text-white/30 text-[10px]">{p.meaning}</span>
                    <i className="ri-arrow-right-line text-[#e8c84a]/50 text-xs"></i>
                  </button>
                ))}
              </div>
            </div>
          )}
          {suggestions.notStarted.length > 0 && (
            <div>
              <p className="text-white/30 text-[10px] tracking-wider mb-2 flex items-center gap-1.5">
                <i className="ri-add-circle-line"></i>Học tiếp theo ({suggestions.notStarted.length})
              </p>
              <div className="flex gap-2 flex-wrap">
                {suggestions.notStarted.map(p => (
                  <button key={p.id} onClick={() => onSelectPattern(p.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/8 hover:border-white/15 cursor-pointer transition-all">
                    <span className="text-white/70 text-sm font-mono font-bold">{p.pattern}</span>
                    <span className="text-white/30 text-[10px]">{p.meaning}</span>
                    <i className="ri-arrow-right-line text-white/25 text-xs"></i>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
          <i className="ri-trophy-fill text-emerald-400 text-xl mb-1 block"></i>
          <p className="text-emerald-400 text-sm font-semibold">Xuất sắc! Bạn đã hoàn thành tất cả mẫu câu!</p>
        </div>
      )}
    </div>
  );
}

// ─── Pattern Card ─────────────────────────────────────────────────────────
function PatternCard({
  pattern,
  isExpanded,
  onToggle,
  masteredExercises,
  onExerciseAnswer,
}: {
  pattern: GrammarPattern;
  isExpanded: boolean;
  onToggle: () => void;
  masteredExercises: Record<string, boolean | null>;
  onExerciseAnswer: (exId: string, correct: boolean) => void;
}) {
  const category = GRAMMAR_CATEGORIES.find(c => c.id === pattern.category);
  const levelColors: Record<string, string> = { A1: "#34d399", A2: "#e8c84a", B1: "#fb923c", B2: "#f87171" };
  const doneCount = pattern.exercises.filter(ex => masteredExercises[ex.id] !== undefined).length;

  return (
    <div className={`bg-[#0f1117] border rounded-2xl overflow-hidden transition-all ${isExpanded ? "border-white/12" : "border-white/5"}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/2 transition-colors cursor-pointer"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-lg font-bold text-white font-mono">{pattern.pattern}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${levelColors[pattern.level]}15`, color: levelColors[pattern.level] }}>{pattern.level}</span>
            {category && (
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${category.color}10`, color: category.color }}>
                <i className={`${category.icon} mr-1`}></i>{category.label}
              </span>
            )}
          </div>
          <p className="text-white/50 text-sm">{pattern.meaning}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {doneCount > 0 && (
            <span className="text-[10px] text-emerald-400/70">{doneCount}/{pattern.exercises.length} bài tập</span>
          )}
          <i className={`ri-arrow-down-s-line text-white/30 text-lg transition-transform ${isExpanded ? "rotate-180" : ""}`}></i>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-white/5 pt-4">
          {/* Explanation */}
          <div className="bg-white/3 rounded-xl p-4 mb-4">
            <p className="text-white/60 text-sm leading-relaxed">{pattern.explanation}</p>
          </div>

          {/* Examples */}
          <div className="mb-5">
            <p className="text-white/30 text-[10px] tracking-wider mb-2">Ví dụ</p>
            <div className="space-y-2">
              {pattern.examples.map((ex, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#e8c84a]/10 text-[#e8c84a] text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                  <div>
                    <p className="text-white/70 text-sm font-medium">{ex.korean}</p>
                    <p className="text-white/35 text-xs">{ex.vietnamese}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div>
            <p className="text-white/30 text-[10px] tracking-wider mb-3">Bài tập luyện tập</p>
            <div className="space-y-3">
              {pattern.exercises.map(ex => (
                <ExerciseItem
                  key={ex.id}
                  ex={ex}
                  answered={masteredExercises[ex.id] ?? null}
                  onAnswer={onExerciseAnswer}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Quick Search Dropdown ───────────────────────────────────────────────────
function QuickSearchDropdown({
  query,
  onSelect,
  onClose,
}: {
  query: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return grammarPatterns
      .filter(p =>
        p.pattern.includes(query) ||
        p.meaning.toLowerCase().includes(q) ||
        p.explanation.toLowerCase().includes(q) ||
        p.examples.some(ex => ex.korean.includes(query) || ex.vietnamese.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [query]);

  if (suggestions.length === 0) return null;

  const levelColors: Record<string, string> = { A1: "#34d399", A2: "#e8c84a", B1: "#fb923c", B2: "#f87171" };

  return (
    <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1a1d27] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
      <div className="px-3 py-2 border-b border-white/5">
        <p className="text-white/30 text-[10px] tracking-wider">{suggestions.length} mẫu câu phù hợp</p>
      </div>
      {suggestions.map(p => {
        const matchedEx = p.examples.find(ex =>
          ex.korean.includes(query) || ex.vietnamese.toLowerCase().includes(query.toLowerCase())
        );
        return (
          <button
            key={p.id}
            onClick={() => { onSelect(p.id); onClose(); }}
            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors text-left border-b border-white/3 last:border-0"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="text-white/80 font-mono font-bold text-sm">{p.pattern}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${levelColors[p.level]}15`, color: levelColors[p.level] }}>{p.level}</span>
              </div>
              <p className="text-white/45 text-xs truncate">{p.meaning}</p>
              {matchedEx && (
                <p className="text-white/25 text-[10px] truncate mt-0.5 italic">{matchedEx.korean} — {matchedEx.vietnamese}</p>
              )}
            </div>
            <i className="ri-arrow-right-line text-white/20 text-xs flex-shrink-0 mt-1" />
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function GrammarPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRoadmap, setShowRoadmap] = useState(true);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [exerciseAnswers, setExerciseAnswers] = useLocalStorage<Record<string, boolean>>("kts_grammar_answers", {});
  const [syncStatus, setSyncStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Load grammar progress from Supabase on login
  useEffect(() => {
    if (!user) return;
    supabase.from("study_progress").select("grammar_progress").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data?.grammar_progress && typeof data.grammar_progress === "object" && Object.keys(data.grammar_progress).length > 0) {
        setExerciseAnswers(data.grammar_progress as Record<string, boolean>);
      }
    });
  }, [user?.id]);

  // Sync grammar progress to Supabase
  const syncGrammarToCloud = useCallback(async (answers: Record<string, boolean>) => {
    if (!user) return;
    setSyncStatus("saving");
    await supabase.from("study_progress").upsert(
      { user_id: user.id, grammar_progress: answers, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    setSyncStatus("saved");
    setTimeout(() => setSyncStatus("idle"), 2000);
  }, [user]);

  const filteredPatterns = useMemo(() => {
    return grammarPatterns.filter(p => {
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      const matchLevel = selectedLevel === "all" || p.level === selectedLevel;
      const matchSearch = !searchQuery || p.pattern.includes(searchQuery) || p.meaning.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchLevel && matchSearch;
    });
  }, [selectedCategory, selectedLevel, searchQuery]);

  const handleExerciseAnswer = (exId: string, correct: boolean) => {
    setExerciseAnswers(prev => {
      const next = { ...prev, [exId]: correct };
      syncGrammarToCloud(next);
      return next;
    });
  };

  const handleSelectFromRoadmap = (patternId: string) => {
    setExpandedId(patternId);
    setSelectedLevel("all");
    setSelectedCategory("all");
    setSearchQuery("");
    setShowSearchDropdown(false);
    setTimeout(() => {
      document.getElementById(`pattern-${patternId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const totalExercises = grammarPatterns.reduce((sum, p) => sum + p.exercises.length, 0);
  const doneExercises = Object.keys(exerciseAnswers).length;
  const correctExercises = Object.values(exerciseAnswers).filter(Boolean).length;

  const levels = ["A1", "A2", "B1", "B2"];
  const levelColors: Record<string, string> = { A1: "#34d399", A2: "#e8c84a", B1: "#fb923c", B2: "#f87171" };

  return (
    <DashboardLayout
      title="Ngữ pháp tiếng Hàn"
      subtitle="Mẫu câu từ cơ bản đến nâng cao — giải thích rõ ràng, luyện tập ngay"
      actions={
        <div className="flex items-center gap-3">
          {user && syncStatus !== "idle" && (
            <span className={`text-xs flex items-center gap-1 ${syncStatus === "saving" ? "text-white/40" : "text-emerald-400"}`}>
              <i className={`${syncStatus === "saving" ? "ri-loader-4-line animate-spin" : "ri-cloud-line"} text-sm`}></i>
              {syncStatus === "saving" ? "Đang lưu..." : "Đã lưu cloud"}
            </span>
          )}
          {!user && <span className="text-white/30 text-xs"><i className="ri-cloud-off-line mr-1"></i>Đăng nhập để lưu tiến độ</span>}
          <button
            onClick={() => setShowRoadmap(r => !r)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${showRoadmap ? "bg-[#e8c84a]/10 border-[#e8c84a]/25 text-[#e8c84a]" : "bg-white/5 border-white/8 text-white/40 hover:text-white/60"}`}
          >
            <i className="ri-route-line"></i>
            {showRoadmap ? "Ẩn lộ trình" : "Học theo lộ trình"}
          </button>
        </div>
      }
    >
      {/* Roadmap Panel */}
      {showRoadmap && (
        <RoadmapPanel exerciseAnswers={exerciseAnswers} onSelectPattern={handleSelectFromRoadmap} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Mẫu câu", value: grammarPatterns.length, icon: "ri-book-open-line", color: "#e8c84a" },
          { label: "Bài tập", value: totalExercises, icon: "ri-pencil-line", color: "#34d399" },
          { label: "Đã làm", value: doneExercises, icon: "ri-checkbox-circle-line", color: "#a78bfa" },
          { label: "Làm đúng", value: correctExercises, icon: "ri-trophy-line", color: "#fb923c" },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0f1117] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
              <i className={`${stat.icon} text-lg`} style={{ color: stat.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">{stat.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center bg-white/5 rounded-xl p-1">
          <button onClick={() => setSelectedLevel("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedLevel === "all" ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/60"}`}>Tất cả</button>
          {levels.map(lv => (
            <button key={lv} onClick={() => setSelectedLevel(lv)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedLevel === lv ? "text-[#0f1117] font-bold" : "text-white/40 hover:text-white/60"}`} style={selectedLevel === lv ? { backgroundColor: levelColors[lv] } : {}}>{lv}</button>
          ))}
        </div>
        <div className="flex items-center bg-white/5 rounded-xl p-1 flex-wrap gap-0.5">
          <button onClick={() => setSelectedCategory("all")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedCategory === "all" ? "bg-[#e8c84a] text-[#0f1117]" : "text-white/40 hover:text-white/60"}`}>Tất cả</button>
          {GRAMMAR_CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat.id ? "text-[#0f1117]" : "text-white/40 hover:text-white/60"}`} style={selectedCategory === cat.id ? { backgroundColor: cat.color } : {}}>{cat.label}</button>
          ))}
        </div>
        <div className="relative flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <i className="ri-search-line text-white/30 text-sm flex-shrink-0"></i>
          <input
            type="text"
            placeholder="Tìm mẫu câu tiếng Hàn hoặc tiếng Việt..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
            onFocus={() => setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            className="flex-1 bg-transparent text-white/70 text-sm outline-none placeholder-white/20"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(""); setShowSearchDropdown(false); }} className="text-white/20 hover:text-white/50 cursor-pointer flex-shrink-0">
              <i className="ri-close-line text-sm" />
            </button>
          )}
          {showSearchDropdown && searchQuery && (
            <QuickSearchDropdown
              query={searchQuery}
              onSelect={handleSelectFromRoadmap}
              onClose={() => setShowSearchDropdown(false)}
            />
          )}
        </div>
        <p className="text-white/30 text-xs whitespace-nowrap">{filteredPatterns.length} mẫu câu</p>
      </div>

      {/* Pattern list */}
      <div className="space-y-3">
        {filteredPatterns.map(pattern => (
          <div key={pattern.id} id={`pattern-${pattern.id}`}>
            <PatternCard
              pattern={pattern}
              isExpanded={expandedId === pattern.id}
              onToggle={() => setExpandedId(expandedId === pattern.id ? null : pattern.id)}
              masteredExercises={exerciseAnswers}
              onExerciseAnswer={handleExerciseAnswer}
            />
          </div>
        ))}
        {filteredPatterns.length === 0 && (
          <div className="text-center py-16 bg-[#0f1117] border border-white/5 rounded-2xl">
            <i className="ri-search-line text-white/20 text-3xl mb-3 block"></i>
            <p className="text-white/30 text-sm">Không tìm thấy mẫu câu nào</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
