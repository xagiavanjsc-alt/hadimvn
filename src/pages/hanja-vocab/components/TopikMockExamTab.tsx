import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { HanjaEntry } from "@/mocks/hanjaData";
import { useHanjaData } from "@/contexts/HanjaDataContext";
import { useXPSystem } from "@/hooks/useXPSystem";

const EXAM_DURATION = 30 * 60; // 30 minutes in seconds
const TOTAL_QUESTIONS = 30;

type QuestionType = "ko2vi" | "vi2ko" | "hanja2ko" | "context" | "antonym";

interface ExamQuestion {
  id: number;
  type: QuestionType;
  entry: HanjaEntry;
  choices: HanjaEntry[];
  userAnswer: string | null;
}

interface ExamResult {
  score: number;
  total: number;
  timeUsed: number;
  date: string;
  details: { correct: boolean; entry: HanjaEntry; userAnswer: string | null }[];
}

const EXAM_HISTORY_KEY = "hanja_topik_exam_history";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function buildExamQuestions(pool: HanjaEntry[]): ExamQuestion[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, TOTAL_QUESTIONS);
  const types: QuestionType[] = ["ko2vi", "vi2ko", "hanja2ko", "ko2vi", "vi2ko"];

  return selected.map((entry, i) => {
    const type = types[i % types.length];
    const others = pool.filter(d => d.korean !== entry.korean).sort(() => Math.random() - 0.5).slice(0, 3);
    const choices = [...others, entry].sort(() => Math.random() - 0.5);
    return { id: i, type, entry, choices, userAnswer: null };
  });
}

function getQuestionPrompt(q: ExamQuestion): { main: string; sub: string; label: string } {
  switch (q.type) {
    case "ko2vi":
      return { main: q.entry.korean, sub: q.entry.hanja, label: "Từ tiếng Hàn này có nghĩa là gì?" };
    case "vi2ko":
      return { main: q.entry.vietnamese, sub: "", label: "Nghĩa tiếng Việt này là từ Hàn nào?" };
    case "hanja2ko":
      return { main: q.entry.hanja, sub: "", label: "Hán tự này đọc là gì trong tiếng Hàn?" };
    case "context":
      return { main: q.entry.korean, sub: q.entry.hanja, label: "Chọn nghĩa đúng của từ này:" };
    default:
      return { main: q.entry.korean, sub: q.entry.hanja, label: "Từ tiếng Hàn này có nghĩa là gì?" };
  }
}

function getChoiceLabel(q: ExamQuestion, choice: HanjaEntry): string {
  switch (q.type) {
    case "ko2vi": return choice.vietnamese;
    case "vi2ko": return choice.korean;
    case "hanja2ko": return choice.korean;
    case "context": return choice.vietnamese;
    default: return choice.vietnamese;
  }
}

function getCorrectAnswer(q: ExamQuestion): string {
  switch (q.type) {
    case "ko2vi": return q.entry.vietnamese;
    case "vi2ko": return q.entry.korean;
    case "hanja2ko": return q.entry.korean;
    case "context": return q.entry.vietnamese;
    default: return q.entry.vietnamese;
  }
}

type ExamState = "intro" | "exam" | "review" | "history";

export default function TopikMockExamTab() {
  const [examState, setExamState] = useState<ExamState>("intro");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [timeUsed, setTimeUsed] = useState(0);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [history, setHistory] = useState<ExamResult[]>(() => {
    try { return JSON.parse(localStorage.getItem(EXAM_HISTORY_KEY) || "[]"); } catch { return []; }
  });
  const [reviewIdx, setReviewIdx] = useState(0);
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { addXP } = useXPSystem();

  const ALPHABET_GROUPS = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

  function getInitial(char: string): string {
    const code = char.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return char[0];
    const idx = Math.floor(code / 588);
    const initials = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
    return initials[idx] || char[0];
  }

  const HANJA_DATA = useHanjaData();
  const pool = useMemo(() => {
    if (filterGroup === "all") return HANJA_DATA;
    return HANJA_DATA.filter(d => getInitial(d.korean[0]) === filterGroup);
  }, [filterGroup, HANJA_DATA]);

  const startExam = useCallback(() => {
    const qs = buildExamQuestions(pool);
    setQuestions(qs);
    setCurrentIdx(0);
    setTimeLeft(EXAM_DURATION);
    setTimeUsed(0);
    setExamState("exam");
  }, [pool]);

  // Timer
  useEffect(() => {
    if (examState !== "exam") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          finishExam();
          return 0;
        }
        return t - 1;
      });
      setTimeUsed(u => u + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [examState]);

  const finishExam = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setQuestions(prev => {
      const score = prev.filter(q => q.userAnswer === getCorrectAnswer(q)).length;
      const used = EXAM_DURATION - timeLeft;
      const result: ExamResult = {
        score,
        total: prev.length,
        timeUsed: used,
        date: new Date().toLocaleString("vi-VN"),
        details: prev.map(q => ({
          correct: q.userAnswer === getCorrectAnswer(q),
          entry: q.entry,
          userAnswer: q.userAnswer,
        })),
      };
      setExamResult(result);
      setHistory(h => {
        const next = [result, ...h].slice(0, 10);
        localStorage.setItem(EXAM_HISTORY_KEY, JSON.stringify(next));
        return next;
      });
      // Award XP scaled by accuracy: 10 base + up to 30 bonus (max 40), gated to ≥30% to avoid farming blank submits.
      const pct = result.total > 0 ? (result.score / result.total) * 100 : 0;
      if (pct >= 30) {
        const xpEarned = Math.round(10 + (pct / 100) * 30);
        addXP({ type: "topik_exam_completed", amount: xpEarned, meta: { score: result.score, total: result.total, pct } });
      }
      setExamState("review");
      return prev;
    });
  }, [timeLeft, addXP]);

  const handleAnswer = (choice: HanjaEntry) => {
    const answer = getChoiceLabel(questions[currentIdx], choice);
    setQuestions(prev => prev.map((q, i) => i === currentIdx ? { ...q, userAnswer: answer } : q));
  };

  const goNext = () => {
    if (currentIdx + 1 >= questions.length) {
      finishExam();
    } else {
      setCurrentIdx(i => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  };

  const timerColor = timeLeft < 300 ? "text-red-400" : timeLeft < 600 ? "text-amber-400" : "text-green-400";
  const timerBg = timeLeft < 300 ? "bg-red-500/10 border-red-500/30" : timeLeft < 600 ? "bg-amber-500/10 border-amber-500/30" : "bg-green-500/10 border-green-500/30";

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (examState === "intro") {
    return (
      <div>
        <div className="bg-app-surface/50 border border-app-border rounded-2xl overflow-hidden mb-5">
          {/* Header */}
          <div className="bg-gradient-to-r from-app-accent-primary to-orange-600 p-6 text-white text-center">
            <div className="w-14 h-14 flex items-center justify-center bg-white/20 rounded-2xl mx-auto mb-3">
              <i className="ri-file-paper-2-line text-white text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold mb-1">Thi thử TOPIK Hán Hàn</h2>
            <p className="text-white/80 text-sm">30 câu trắc nghiệm · 30 phút · Theo chuẩn đề thi TOPIK</p>
          </div>

          <div className="p-6">
            {/* Exam info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { icon: "ri-question-line", label: "Số câu", value: "30 câu", color: "#f43f5e" },
                { icon: "ri-timer-line", label: "Thời gian", value: "30 phút", color: "#fb923c" },
                { icon: "ri-bar-chart-line", label: "Điểm đạt", value: "70%+", color: "#34d399" },
              ].map(s => (
                <div key={s.label} className="text-center bg-app-surface/30 rounded-xl p-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                  </div>
                  <p className="font-bold text-white text-lg">{s.value}</p>
                  <p className="text-xs text-white/40">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Question types */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-white/80 mb-3">Dạng câu hỏi trong đề thi</p>
              <div className="space-y-2">
                {[
                  { label: "Hàn → Việt", desc: "Chọn nghĩa tiếng Việt đúng", pct: "40%" },
                  { label: "Việt → Hàn", desc: "Chọn từ tiếng Hàn đúng", pct: "40%" },
                  { label: "Hán tự → Hàn", desc: "Đọc Hán tự thành tiếng Hàn", pct: "20%" },
                ].map(t => (
                  <div key={t.label} className="flex items-center gap-3 px-3 py-2 bg-app-accent-primary/10 rounded-lg">
                    <span className="text-app-accent-primary font-semibold text-sm w-28 flex-shrink-0">{t.label}</span>
                    <span className="text-white/50 text-xs flex-1">{t.desc}</span>
                    <span className="text-app-accent-primary text-xs font-bold">{t.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter by group */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-white/80 mb-2">Chọn nhóm từ vựng</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setFilterGroup("all")}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${filterGroup === "all" ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/70 hover:bg-app-surface/80"}`}>
                  Tất cả ({HANJA_DATA.length})
                </button>
                {ALPHABET_GROUPS.map(g => {
                  const cnt = HANJA_DATA.filter(d => getInitial(d.korean[0]) === g).length;
                  if (cnt < 4) return null;
                  return (
                    <button key={g} onClick={() => setFilterGroup(g)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${filterGroup === g ? "bg-app-accent-primary text-app-bg" : "bg-app-surface/50 text-white/70 hover:bg-app-surface/80"}`}>
                      {g} ({cnt})
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-white/40 mt-2">Đề thi sẽ lấy ngẫu nhiên {TOTAL_QUESTIONS} câu từ {pool.length} từ đã chọn</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setExamState("history")}
                className="flex items-center gap-2 px-4 py-3 border border-app-border text-white/70 rounded-xl text-sm cursor-pointer hover:bg-app-surface/50 transition-colors whitespace-nowrap">
                <i className="ri-history-line"></i>Lịch sử thi
              </button>
              <button onClick={startExam} disabled={pool.length < 4}
                className="flex-1 py-2 bg-app-accent-primary text-app-bg rounded-lg font-semibold text-sm cursor-pointer hover:bg-app-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <i className="ri-play-circle-line"></i>Bắt đầu thi thử
              </button>
            </div>
          </div>
        </div>

        {/* Recent history preview */}
        {history.length > 0 && (
          <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
            <p className="text-sm font-semibold text-white/80 mb-3">Lần thi gần nhất</p>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 flex items-center justify-center rounded-xl flex-shrink-0 ${history[0].score / history[0].total >= 0.7 ? "bg-green-500/20" : "bg-amber-500/20"}`}>
                <span className={`text-xl font-bold ${history[0].score / history[0].total >= 0.7 ? "text-green-400" : "text-amber-400"}`}>
                  {Math.round((history[0].score / history[0].total) * 100)}%
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Đúng {history[0].score}/{history[0].total} câu</p>
                <p className="text-xs text-white/40">Thời gian: {formatTime(history[0].timeUsed)} · {history[0].date}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Exam ───────────────────────────────────────────────────────────────────
  if (examState === "exam") {
    const q = questions[currentIdx];
    if (!q) return null;
    const prompt = getQuestionPrompt(q);
    const correctAns = getCorrectAnswer(q);
    const answered = q.userAnswer !== null;
    const answeredCount = questions.filter(q => q.userAnswer !== null).length;

    return (
      <div>
        {/* Exam header */}
        <div className="flex items-center justify-between mb-4 bg-app-surface/50 border border-app-border rounded-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/50">Câu {currentIdx + 1}/{questions.length}</span>
            <span className="text-xs text-white/40">({answeredCount} đã trả lời)</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-bold ${timerBg} ${timerColor}`}>
            <i className="ri-timer-line"></i>
            {formatTime(timeLeft)}
          </div>
          <button onClick={finishExam}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-app-accent-primary text-app-bg rounded-lg text-xs font-semibold cursor-pointer hover:bg-app-accent-primary/90 transition-colors whitespace-nowrap">
            <i className="ri-flag-line"></i>Nộp bài
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-app-surface/50 rounded-full h-2 mb-5">
          <div className="bg-app-accent-primary h-2 rounded-full transition-all" style={{ width: `${(answeredCount / questions.length) * 100}%` }}></div>
        </div>

        {/* Question */}
        <div className="bg-app-surface/50 border-2 border-app-border rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-1 bg-app-accent-primary/20 text-app-accent-primary rounded-full text-xs font-bold">Câu {currentIdx + 1}</span>
            <span className="text-sm text-white/50">{prompt.label}</span>
          </div>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-white mb-2">{prompt.main}</p>
            {prompt.sub && <p className="text-xl text-app-accent-primary font-bold">{prompt.sub}</p>}
          </div>
        </div>

        {/* Choices */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          {q.choices.map((choice, i) => {
            const choiceLabel = getChoiceLabel(q, choice);
            const isSelected = q.userAnswer === choiceLabel;
            const isCorrect = choiceLabel === correctAns;
            let cls = "border-2 border-app-border bg-app-surface/50 text-white/80 hover:border-app-accent-primary";
            if (answered) {
              if (isCorrect) cls = "border-2 border-green-400 bg-green-500/10 text-green-400";
              else if (isSelected) cls = "border-2 border-red-400 bg-red-500/10 text-red-400";
              else cls = "border-2 border-app-border bg-app-surface/30 text-white/40";
            } else if (isSelected) {
              cls = "border-2 border-app-accent-primary bg-app-accent-primary/10 text-app-accent-primary";
            }
            return (
              <button key={i} onClick={() => handleAnswer(choice)}
                className={`p-4 rounded-xl text-sm font-medium cursor-pointer transition-all text-left flex items-center gap-3 ${cls}`}>
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-app-surface/50 text-white/50 text-xs font-bold flex-shrink-0">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{choiceLabel}</span>
                {answered && isCorrect && <i className="ri-check-line text-green-400 flex-shrink-0"></i>}
                {answered && isSelected && !isCorrect && <i className="ri-close-line text-red-400 flex-shrink-0"></i>}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button onClick={goPrev} disabled={currentIdx === 0}
            className="flex items-center gap-2 px-4 py-3 border border-app-border text-white/70 rounded-xl text-sm cursor-pointer hover:bg-app-surface/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
            <i className="ri-arrow-left-line"></i>Trước
          </button>
          <button onClick={goNext}
            className="flex-1 py-3 bg-app-accent-primary text-app-bg rounded-xl font-semibold cursor-pointer hover:bg-app-accent-primary/90 transition-colors flex items-center justify-center gap-2">
            {currentIdx + 1 >= questions.length ? (
              <><i className="ri-flag-line"></i>Nộp bài</>
            ) : (
              <><span>Câu tiếp theo</span><i className="ri-arrow-right-line"></i></>
            )}
          </button>
        </div>

        {/* Question navigator */}
        <div className="mt-4 bg-app-surface/50 border border-app-border rounded-xl p-3">
          <p className="text-xs text-white/40 mb-2">Điều hướng câu hỏi</p>
          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, i) => (
              <button key={i} onClick={() => setCurrentIdx(i)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  i === currentIdx ? "bg-app-accent-primary text-app-bg" :
                  q.userAnswer !== null ? "bg-green-500/20 text-green-400" :
                  "bg-app-surface/50 text-white/50 hover:bg-app-surface/80"
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Review ─────────────────────────────────────────────────────────────────
  if (examState === "review" && examResult) {
    const pct = Math.round((examResult.score / examResult.total) * 100);
    const passed = pct >= 70;
    const wrongItems = examResult.details.filter(d => !d.correct);

    return (
      <div>
        {/* Score card */}
        <div className={`rounded-2xl p-6 mb-5 text-center ${passed ? "bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30" : "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30"}`}>
          <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-4 ${passed ? "bg-green-500/20" : "bg-amber-500/20"}`}>
            <i className={`text-3xl ${passed ? "ri-trophy-line text-green-400" : "ri-emotion-normal-line text-amber-400"}`}></i>
          </div>
          <p className="text-4xl font-bold text-white mb-1">{pct}%</p>
          <p className={`text-lg font-semibold mb-2 ${passed ? "text-green-400" : "text-amber-400"}`}>
            {passed ? "Đạt! Xuất sắc!" : "Chưa đạt — Cần ôn thêm"}
          </p>
          <p className="text-white/50 text-sm mb-4">Đúng {examResult.score}/{examResult.total} câu · Thời gian: {formatTime(examResult.timeUsed)}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Đúng", value: examResult.score, color: "text-green-400", bg: "bg-green-500/20" },
              { label: "Sai", value: examResult.total - examResult.score, color: "text-red-400", bg: "bg-red-500/20" },
              { label: "Điểm", value: `${pct}%`, color: passed ? "text-green-400" : "text-amber-400", bg: passed ? "bg-green-500/20" : "bg-amber-500/20" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3`}>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wrong answers review */}
        {wrongItems.length > 0 && (
          <div className="bg-app-surface/50 border border-app-border rounded-2xl overflow-hidden mb-5">
            <div className="px-5 py-4 border-b border-app-border">
              <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <i className="ri-close-circle-line text-red-400"></i>
                Câu sai cần ôn lại ({wrongItems.length} câu)
              </h3>
            </div>
            <div className="divide-y divide-app-border">
              {wrongItems.slice(0, 10).map((item, i) => (
                <div key={i} className="px-5 py-3 hover:bg-red-500/5 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500/20 flex-shrink-0 mt-0.5">
                      <i className="ri-close-line text-red-400 text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white">{item.entry.korean}</span>
                        <span className="text-app-accent-primary font-bold">{item.entry.hanja}</span>
                      </div>
                      <p className="text-xs text-green-400 font-medium">✓ Đúng: {item.entry.vietnamese}</p>
                      {item.userAnswer && (
                        <p className="text-xs text-red-400">✗ Bạn chọn: {item.userAnswer}</p>
                      )}
                      {!item.userAnswer && (
                        <p className="text-xs text-white/40">Chưa trả lời</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {wrongItems.length > 10 && (
                <div className="px-5 py-3 text-center text-xs text-white/40">
                  +{wrongItems.length - 10} câu sai khác...
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => setExamState("history")}
            className="flex items-center gap-2 px-4 py-3 border border-app-border text-white/70 rounded-xl text-sm cursor-pointer hover:bg-app-surface/50 transition-colors whitespace-nowrap">
            <i className="ri-history-line"></i>Lịch sử
          </button>
          <button onClick={startExam}
            className="flex-1 py-2 bg-app-accent-primary text-app-bg rounded-lg font-semibold text-sm cursor-pointer hover:bg-app-accent-primary/90 transition-colors flex items-center justify-center gap-2">
            <i className="ri-refresh-line"></i>Thi lại
          </button>
          <button onClick={() => setExamState("intro")}
            className="flex items-center gap-2 px-4 py-3 border border-app-border text-white/70 rounded-xl text-sm cursor-pointer hover:bg-app-surface/50 transition-colors whitespace-nowrap">
            <i className="ri-home-line"></i>Trang chủ
          </button>
        </div>
      </div>
    );
  }

  // ── History ────────────────────────────────────────────────────────────────
  if (examState === "history") {
    return (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setExamState("intro")}
            className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 cursor-pointer">
            <i className="ri-arrow-left-line"></i> Quay lại
          </button>
          <h2 className="text-base font-bold text-white">Lịch sử thi thử</h2>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <i className="ri-history-line text-4xl"></i>
            <p className="mt-2 text-sm">Chưa có lần thi nào</p>
            <button onClick={() => setExamState("intro")} className="mt-3 text-app-accent-primary text-xs cursor-pointer">Bắt đầu thi thử →</button>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((h, i) => {
              const pct = Math.round((h.score / h.total) * 100);
              const passed = pct >= 70;
              return (
                <div key={i} className="bg-app-surface/50 border border-app-border rounded-xl p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 ${passed ? "bg-green-500/20" : "bg-amber-500/20"}`}>
                    <span className={`text-sm font-bold ${passed ? "text-green-400" : "text-amber-400"}`}>{pct}%</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Đúng {h.score}/{h.total} câu</p>
                    <p className="text-xs text-white/40">Thời gian: {formatTime(h.timeUsed)} · {h.date}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${passed ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {passed ? "Đạt" : "Chưa đạt"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return null;
}

