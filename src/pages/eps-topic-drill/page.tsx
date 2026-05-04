import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { epsQuestions, EPS_TOPICS, EpsQuestion } from "@/mocks/epsQuestions";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";

// --- Types -------------------------------------------------------------------
interface DrillResult {
  questionId: string;
  correct: boolean;
  timeSpent: number;
  selectedIndex: number;
}

interface TopicStats {
  topicId: string;
  totalDone: number;
  totalCorrect: number;
  avgTime: number;
  lastDrilled: string;
}

// --- Timer Hook ---------------------------------------------------------------
function useTimer(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  const reset = () => setSeconds(0);
  return { seconds, reset };
}

// --- Topic Selector -----------------------------------------------------------
function TopicSelector({
  onSelect,
  topicStats,
}: {
  onSelect: (topicId: string, count: number, difficulty: string) => void;
  topicStats: Record<string, TopicStats>;
}) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("all");

  const topicsWithCount = EPS_TOPICS.map(t => ({
    ...t,
    questionCount: epsQuestions.filter(q => q.topic === t.id).length,
    stats: topicStats[t.id],
  })).filter(t => t.questionCount > 0);

  const selected = topicsWithCount.find(t => t.id === selectedTopic);
  const maxCount = selected ? Math.min(selected.questionCount, 20) : 20;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-white font-bold text-xl mb-1">Ch?n ch? d? luy?n thi</h2>
        <p className="text-app-text-secondary text-sm">Luy?n t?p t?p trung theo t?ng ch? d? d? c?i thi?n di?m y?u</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {topicsWithCount.map(topic => {
          const acc = topic.stats
            ? Math.round((topic.stats.totalCorrect / topic.stats.totalDone) * 100)
            : null;
          const isSelected = selectedTopic === topic.id;
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(isSelected ? null : topic.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? "border-2"
                  : "bg-app-bg border-app-border hover:border-white/15"
              }`}
              style={isSelected ? { borderColor: topic.color, backgroundColor: `${topic.color}10` } : {}}
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${topic.color}20` }}
                >
                  <i className={`${topic.icon} text-base`} style={{ color: topic.color }}></i>
                </div>
                {acc !== null && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: acc >= 80 ? "#34d39920" : acc >= 60 ? "app-accent-primary20" : "#f8717120",
                      color: acc >= 80 ? "#34d399" : acc >= 60 ? "app-accent-primary" : "#f87171",
                    }}
                  >
                    {acc}%
                  </span>
                )}
              </div>
              <p className="text-white/80 text-xs font-semibold leading-snug mb-1">{topic.label}</p>
              <p className="text-app-text-muted text-[10px]">{topic.questionCount} câu h?i</p>
              {topic.stats && (
                <p className="text-app-text-muted text-[10px] mt-0.5">
                  Ðã làm {topic.stats.totalDone} l?n
                </p>
              )}
            </button>
          );
        })}
      </div>

      {selectedTopic && selected && (
        <div className="bg-app-bg border border-app-border rounded-2xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <i className={`${selected.icon} text-base`} style={{ color: selected.color }}></i>
            Cài d?t: {selected.label}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-app-text-secondary text-xs block mb-2">S? câu h?i</label>
              <div className="flex items-center gap-2">
                {[5, 10, 15, 20].filter(n => n <= maxCount).map(n => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      count === n
                        ? "text-app-bg font-bold"
                        : "bg-app-card/50 text-app-text-secondary hover:bg-app-card/70"
                    }`}
                    style={count === n ? { backgroundColor: selected.color } : {}}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-app-text-secondary text-xs block mb-2">Ð? khó</label>
              <div className="flex items-center gap-2">
                {[
                  { v: "all", l: "T?t c?" },
                  { v: "easy", l: "D?" },
                  { v: "medium", l: "TB" },
                  { v: "hard", l: "Khó" },
                ].map(d => (
                  <button
                    key={d.v}
                    onClick={() => setDifficulty(d.v)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      difficulty === d.v
                        ? "bg-app-accent-primary text-app-bg font-bold"
                        : "bg-app-card/50 text-app-text-secondary hover:bg-app-card/70"
                    }`}
                  >
                    {d.l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => onSelect(selectedTopic, count, difficulty)}
            className="w-full py-3 rounded-xl font-bold text-sm text-app-bg transition-all cursor-pointer whitespace-nowrap hover:opacity-90"
            style={{ backgroundColor: selected.color }}
          >
            <i className="ri-play-fill mr-2"></i>B?t d?u luy?n thi
          </button>
        </div>
      )}
    </div>
  );
}

// --- Question Card ------------------------------------------------------------
function QuestionCard({
  question,
  index,
  total,
  onAnswer,
  timeLeft,
  timerActive,
}: {
  question: EpsQuestion;
  index: number;
  total: number;
  onAnswer: (idx: number) => void;
  timeLeft: number;
  timerActive: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const topic = EPS_TOPICS.find(t => t.id === question.topic);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    setTimeout(() => onAnswer(idx), 1200);
  };

  const timerPct = Math.max(0, (timeLeft / 30) * 100);
  const timerColor = timeLeft > 15 ? "#34d399" : timeLeft > 7 ? "app-accent-primary" : "#f87171";

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Progress + Timer */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${((index) / total) * 100}%`, backgroundColor: topic?.color || "app-accent-primary" }}
          />
        </div>
        <span className="text-app-text-secondary text-xs whitespace-nowrap">{index + 1}/{total}</span>
        {timerActive && (
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
              />
            </div>
            <span className="text-xs font-mono font-bold" style={{ color: timerColor }}>{timeLeft}s</span>
          </div>
        )}
      </div>

      {/* Topic badge */}
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${topic?.color}15`, color: topic?.color }}
        >
          <i className={`${topic?.icon} mr-1`}></i>{topic?.label}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
          question.difficulty === "easy" ? "bg-emerald-500/10 text-app-accent-success" :
          question.difficulty === "medium" ? "bg-app-accent-primary/10 text-app-accent-primary" :
          "bg-red-500/10 text-red-400"
        }`}>
          {question.difficulty === "easy" ? "D?" : question.difficulty === "medium" ? "Trung bình" : "Khó"}
        </span>
      </div>

      {/* Image */}
      {question.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-app-border">
          <img
            src={question.imageUrl}
            alt={question.imageAlt || ""}
            className="w-full h-44 object-cover object-top"
          />
          {question.imageCaption && (
            <p className="text-app-text-muted text-[10px] px-3 py-1.5 bg-app-surface/50">{question.imageCaption}</p>
          )}
        </div>
      )}

      {/* Question */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <p className="text-white font-semibold text-base leading-relaxed mb-1 whitespace-pre-line">{question.question}</p>
        <p className="text-app-text-secondary text-sm leading-relaxed whitespace-pre-line">{question.questionVi}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((opt, i) => {
          let style = "bg-app-bg border-app-border text-white/70";
          if (revealed) {
            if (i === question.correctIndex) style = "bg-emerald-500/10 border-emerald-500/40 text-emerald-300";
            else if (i === selected) style = "bg-red-500/10 border-red-500/40 text-red-300";
            else style = "bg-app-bg border-app-border text-app-text-muted";
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${style} ${!revealed ? "hover:border-white/20 hover:bg-app-surface/50" : ""}`}
            >
              <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                revealed && i === question.correctIndex ? "bg-emerald-500 border-emerald-500 text-white" :
                revealed && i === selected && i !== question.correctIndex ? "bg-red-500 border-red-500 text-white" :
                "border-white/20 text-app-text-secondary"
              }`}>
                {revealed && i === question.correctIndex ? <i className="ri-check-line text-xs"></i> :
                 revealed && i === selected && i !== question.correctIndex ? <i className="ri-close-line text-xs"></i> :
                 String.fromCharCode(65 + i)}
              </span>
              <div>
                <p className="text-sm font-medium">{opt}</p>
                <p className="text-xs opacity-60 mt-0.5">{question.optionsVi[i]}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {revealed && (
        <div className={`p-4 rounded-xl border ${selected === question.correctIndex ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
          <div className="flex items-center gap-2 mb-2">
            <i className={`${selected === question.correctIndex ? "ri-checkbox-circle-fill text-app-accent-success" : "ri-close-circle-fill text-red-400"} text-base`}></i>
            <span className={`text-xs font-bold ${selected === question.correctIndex ? "text-app-accent-success" : "text-red-400"}`}>
              {selected === question.correctIndex ? "Chính xác!" : "Chua dúng"}
            </span>
          </div>
          <p className="text-white/60 text-xs leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}

// --- Results Screen -----------------------------------------------------------
function ResultsScreen({
  results,
  questions,
  topicId,
  onRetry,
  onBack,
}: {
  results: DrillResult[];
  questions: EpsQuestion[];
  topicId: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  const topic = EPS_TOPICS.find(t => t.id === topicId);
  const correct = results.filter(r => r.correct).length;
  const total = results.length;
  const pct = Math.round((correct / total) * 100);
  const avgTime = Math.round(results.reduce((a, r) => a + r.timeSpent, 0) / total);

  const wrongQuestions = results
    .filter(r => !r.correct)
    .map(r => questions.find(q => q.id === r.questionId)!)
    .filter(Boolean);

  const grade =
    pct >= 90 ? { label: "Xu?t s?c!", color: "#34d399", icon: "ri-trophy-fill" } :
    pct >= 75 ? { label: "T?t!", color: "app-accent-primary", icon: "ri-thumb-up-fill" } :
    pct >= 60 ? { label: "Khá", color: "#fb923c", icon: "ri-emotion-normal-fill" } :
    { label: "C?n ôn thêm", color: "#f87171", icon: "ri-emotion-sad-fill" };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Score card */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-6 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: `${grade.color}20` }}>
          <i className={`${grade.icon} text-2xl`} style={{ color: grade.color }}></i>
        </div>
        <p className="text-white font-bold text-2xl mb-1">{pct}%</p>
        <p className="font-bold text-base mb-1" style={{ color: grade.color }}>{grade.label}</p>
        <p className="text-app-text-secondary text-sm">{correct}/{total} câu dúng · {topic?.label}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {[
            { label: "Ðúng", value: correct, color: "#34d399" },
            { label: "Sai", value: total - correct, color: "#f87171" },
            { label: "Th?i gian TB", value: `${avgTime}s`, color: "app-accent-primary" },
          ].map(s => (
            <div key={s.label} className="bg-app-surface/50 rounded-xl p-3">
              <p className="font-bold text-lg" style={{ color: s.color }}>{s.value}</p>
              <p className="text-app-text-muted text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wrong questions review */}
      {wrongQuestions.length > 0 && (
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
            <i className="ri-error-warning-line text-red-400"></i>
            Câu c?n ôn l?i ({wrongQuestions.length})
          </h3>
          <div className="space-y-3">
            {wrongQuestions.map((q, i) => (
              <div key={q.id} className="bg-red-500/5 border border-red-500/10 rounded-xl p-3">
                <p className="text-white/70 text-xs font-medium mb-1">{i + 1}. {q.questionVi}</p>
                <p className="text-app-accent-success text-xs">
                  <i className="ri-check-line mr-1"></i>
                  {q.optionsVi[q.correctIndex]}
                </p>
                <p className="text-app-text-muted text-[10px] mt-1 leading-relaxed">{q.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl border border-app-border text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-app-card/50">
          <i className="ri-arrow-left-line mr-2"></i>Ch?n ch? d? khác
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-3 rounded-xl font-bold text-sm text-app-bg cursor-pointer whitespace-nowrap hover:opacity-90"
          style={{ backgroundColor: topic?.color || "app-accent-primary" }}
        >
          <i className="ri-refresh-line mr-2"></i>Luy?n l?i
        </button>
      </div>
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function EpsTopicDrillPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { awardXP } = useXPSystem();
  const [phase, setPhase] = useState<"select" | "drill" | "result">("select");
  const [drillConfig, setDrillConfig] = useState<{ topicId: string; count: number; difficulty: string } | null>(null);
  const [drillQuestions, setDrillQuestions] = useState<EpsQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [results, setResults] = useState<DrillResult[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(30);
  const [topicStats, setTopicStats] = useLocalStorage<Record<string, TopicStats>>("eps_topic_stats", {});

  // Timer countdown per question
  useEffect(() => {
    if (phase !== "drill") return;
    setTimeLeft(30);
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id);
          handleAnswer(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [currentIdx, phase]);

  const handleStart = useCallback((topicId: string, count: number, difficulty: string) => {
    let pool = epsQuestions.filter(q => q.topic === topicId);
    if (difficulty !== "all") pool = pool.filter(q => q.difficulty === difficulty);
    if (pool.length === 0) pool = epsQuestions.filter(q => q.topic === topicId);
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
    setDrillConfig({ topicId, count, difficulty });
    setDrillQuestions(shuffled);
    setCurrentIdx(0);
    setResults([]);
    setQuestionStartTime(Date.now());
    setPhase("drill");
  }, []);

  const handleAnswer = useCallback((selectedIdx: number) => {
    const q = drillQuestions[currentIdx];
    if (!q) return;
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const correct = selectedIdx === q.correctIndex;
    const newResult: DrillResult = { questionId: q.id, correct, timeSpent, selectedIndex: selectedIdx };
    const newResults = [...results, newResult];
    setResults(newResults);

    if (currentIdx + 1 >= drillQuestions.length) {
      // Save stats
      if (drillConfig) {
        const prev = topicStats[drillConfig.topicId] || { topicId: drillConfig.topicId, totalDone: 0, totalCorrect: 0, avgTime: 0, lastDrilled: "" };
        const totalDone = prev.totalDone + newResults.length;
        const totalCorrect = prev.totalCorrect + newResults.filter(r => r.correct).length;
        const avgTime = Math.round(newResults.reduce((a, r) => a + r.timeSpent, 0) / newResults.length);
        setTopicStats(s => ({ ...s, [drillConfig.topicId]: { topicId: drillConfig.topicId, totalDone, totalCorrect, avgTime, lastDrilled: new Date().toISOString() } }));
      }
      // Award XP for completing drill
      const correctCount = newResults.filter(r => r.correct).length;
      awardXP({ type: "topic_drill_completed", amount: 15 + correctCount * 2 });
      setTimeout(() => setPhase("result"), 1400);
    } else {
      setTimeout(() => {
        setCurrentIdx(i => i + 1);
        setQuestionStartTime(Date.now());
      }, 1400);
    }
  }, [drillQuestions, currentIdx, results, questionStartTime, drillConfig, topicStats]);

  const handleRetry = () => {
    if (drillConfig) handleStart(drillConfig.topicId, drillConfig.count, drillConfig.difficulty);
  };

  return (
    <DashboardLayout
      title="Luy?n thi EPS theo ch? d?"
      subtitle="T?p trung vào t?ng ch? d? d? c?i thi?n di?m y?u"
      actions={
        phase !== "select" ? (
          <button
            onClick={() => setPhase("select")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-app-border text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-app-card/50"
          >
            <i className="ri-arrow-left-line"></i>Ch?n l?i
          </button>
        ) : (
          <button
            onClick={() => navigate("/eps-exam")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-app-accent-primary/10 border border-app-accent-primary/20 text-app-accent-primary text-sm cursor-pointer whitespace-nowrap"
          >
            <i className="ri-timer-line"></i>Thi th? 40 câu
          </button>
        )
      }
    >
      <div className="py-2">
        {phase === "select" && (
          <TopicSelector onSelect={handleStart} topicStats={topicStats} />
        )}

        {phase === "drill" && drillQuestions[currentIdx] && (
          <QuestionCard
            question={drillQuestions[currentIdx]}
            index={currentIdx}
            total={drillQuestions.length}
            onAnswer={handleAnswer}
            timeLeft={timeLeft}
            timerActive={true}
          />
        )}

        {phase === "result" && drillConfig && (
          <ResultsScreen
            results={results}
            questions={drillQuestions}
            topicId={drillConfig.topicId}
            onRetry={handleRetry}
            onBack={() => setPhase("select")}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

