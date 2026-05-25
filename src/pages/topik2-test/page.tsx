import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { topik2Questions, type T2Question } from "@/mocks/topik2Questions";

const TOTAL_TIME = 180 * 60;
type Phase = "intro" | "exam" | "result";
type Section = "listening" | "reading" | "writing";

// ─── Timer hook ───────────────────────────────────────────────────────────
function useTimer(active: boolean, onExpire: () => void) {
  const [remaining, setRemaining] = useState(TOTAL_TIME);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!active) return;
    ref.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(ref.current!); onExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [active]);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const pct = (remaining / TOTAL_TIME) * 100;
  return { minutes, seconds, pct, isWarning: remaining < 900, isDanger: remaining < 300 };
}

// ─── MC4 Image Question ───────────────────────────────────────────────────
interface MC4ImageQuestionProps {
  q: T2Question;
  selected: number | null;
  onAnswer: (i: number) => void;
  showResult: boolean;
}

function MC4ImageQuestion({ q, selected, onAnswer, showResult }: MC4ImageQuestionProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-3">
      {(q.options || []).map((opt, i) => {
        let cls = "border-app-border bg-app-surface/50 hover:border-white/20 cursor-pointer";
        if (showResult) {
          if (i === q.correctIndex) cls = "border-emerald-500/40 bg-emerald-500/8 cursor-default";
          else if (i === selected && i !== q.correctIndex) cls = "border-red-500/30 bg-red-500/5 cursor-default";
          else cls = "border-app-border opacity-30 cursor-default";
        } else if (selected === i) cls = "border-app-accent-primary/40 bg-app-accent-primary/8 cursor-pointer";
        return (
          <button key={i} onClick={() => !showResult && onAnswer(i)} disabled={showResult}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${cls}`}>
            <span className="text-4xl">{q.optionImages?.[i] || ""}</span>
            <p className={`text-xs font-medium text-center ${showResult && i === q.correctIndex ? "text-app-accent-success" : showResult && i === selected ? "text-red-400" : selected === i ? "text-app-accent-primary" : "text-white/50"}`}>{opt}</p>
            {showResult && i === q.correctIndex && <i className="ri-checkbox-circle-fill text-app-accent-success text-sm"></i>}
            {showResult && i === selected && i !== q.correctIndex && <i className="ri-close-circle-fill text-red-400 text-sm"></i>}
          </button>
        );
      })}
    </div>
  );
}

// ─── MC4 Text Question ────────────────────────────────────────────────────
interface MC4TextQuestionProps {
  q: T2Question;
  selected: number | null;
  onAnswer: (i: number) => void;
  showResult: boolean;
}

function MC4TextQuestion({ q, selected, onAnswer, showResult }: MC4TextQuestionProps) {
  return (
    <div className="space-y-2 mt-3">
      {(q.options || []).map((opt, i) => {
        let cls = "border-app-border bg-app-surface/50 hover:border-white/15 cursor-pointer";
        if (showResult) {
          if (i === q.correctIndex) cls = "border-emerald-500/40 bg-emerald-500/8 cursor-default";
          else if (i === selected && i !== q.correctIndex) cls = "border-red-500/30 bg-red-500/5 cursor-default";
          else cls = "border-app-border opacity-30 cursor-default";
        } else if (selected === i) cls = "border-app-accent-primary/40 bg-app-accent-primary/8 cursor-pointer";
        return (
          <button key={i} onClick={() => !showResult && onAnswer(i)} disabled={showResult}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${cls}`}>
            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold flex-shrink-0 ${showResult && i === q.correctIndex ? "bg-emerald-500/20 text-app-accent-success" : showResult && i === selected ? "bg-red-500/20 text-red-400" : selected === i ? "bg-app-accent-primary/20 text-app-accent-primary" : "bg-app-card/50 text-app-text-muted"}`}>
              {["①","②","③","④"][i]}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${showResult && i === q.correctIndex ? "text-app-accent-success font-medium" : showResult && i === selected && i !== q.correctIndex ? "text-red-400" : selected === i ? "text-app-accent-primary" : "text-white/60"}`}>{opt}</p>
              {q.optionsVi?.[i] && <p className="text-app-text-muted text-[10px] mt-0.5">{q.optionsVi[i]}</p>}
            </div>
            {showResult && i === q.correctIndex && <i className="ri-checkbox-circle-fill text-app-accent-success flex-shrink-0"></i>}
            {showResult && i === selected && i !== q.correctIndex && <i className="ri-close-circle-fill text-red-400 flex-shrink-0"></i>}
          </button>
        );
      })}
    </div>
  );
}

// ─── Fill Blank Question ──────────────────────────────────────────────────
function FillBlankQuestion({ q, value, value2, onChange, onChange2, showResult }: {
  q: T2Question; value: string; value2?: string;
  onChange: (v: string) => void; onChange2?: (v: string) => void; showResult: boolean;
}) {
  const isCorrect1 = value.trim() !== "" && (value.trim() === q.correctAnswer || value.trim().length > 2);
  const isCorrect2 = !q.correctAnswer2 || (value2?.trim() !== "" && (value2?.trim() === q.correctAnswer2 || (value2?.trim().length ?? 0) > 2));

  return (
    <div className="mt-3 space-y-3">
      <div>
        <label className="text-app-text-muted text-[10px] tracking-normal mb-1.5 block">① Chỗ trống thứ nhất</label>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} disabled={showResult}
          placeholder="Điền vào đây..."
          className={`w-full bg-app-card/50 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${showResult ? (isCorrect1 ? "border-emerald-500/40 text-app-accent-success" : "border-red-500/30 text-red-400") : "border-app-border text-white/70 focus:border-app-accent-primary/30"}`} />
        {showResult && <p className="text-app-text-muted text-xs mt-1">Gợi ý: {q.correctAnswer}</p>}
      </div>
      {q.type === "fill_blank2" && (
        <div>
          <label className="text-app-text-muted text-[10px] tracking-normal mb-1.5 block">② Chỗ trống thứ hai</label>
          <input type="text" value={value2 || ""} onChange={e => onChange2?.(e.target.value)} disabled={showResult}
            placeholder="Điền vào đây..."
            className={`w-full bg-app-card/50 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${showResult ? (isCorrect2 ? "border-emerald-500/40 text-app-accent-success" : "border-red-500/30 text-red-400") : "border-app-border text-white/70 focus:border-app-accent-primary/30"}`} />
          {showResult && <p className="text-app-text-muted text-xs mt-1">Gợi ý: {q.correctAnswer2}</p>}
        </div>
      )}
      {showResult && q.sampleAnswer && (
        <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3">
          <p className="text-app-accent-success/70 text-[10px] tracking-normal mb-1">Đáp án mẫu</p>
          <p className="text-white/50 text-xs whitespace-pre-line">{q.sampleAnswer}</p>
          {q.sampleAnswerVi && <p className="text-app-text-muted text-[10px] italic mt-1">{q.sampleAnswerVi}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Writing Question ─────────────────────────────────────────────────────
interface WritingQuestionProps {
  q: T2Question;
  value: string;
  onChange: (v: string) => void;
  showResult: boolean;
}

function WritingQuestion({ q, value, onChange, showResult }: WritingQuestionProps) {
  const charCount = value.length;
  const minChars = q.number === 54 ? 600 : 200;
  const maxChars = q.number === 54 ? 700 : 300;
  const isInRange = charCount >= minChars && charCount <= maxChars;

  return (
    <div className="mt-3 space-y-3">
      {q.writingGuide && (
        <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-3">
          <p className="text-app-accent-primary/70 text-[10px] tracking-normal mb-1.5">Hướng dẫn viết</p>
          <p className="text-app-text-secondary text-xs whitespace-pre-line leading-relaxed">{q.writingGuide}</p>
        </div>
      )}
      <div>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={showResult}
          placeholder={`Viết bài của bạn ở đây... (${minChars}-${maxChars} chữ)`}
          rows={q.number === 54 ? 14 : 8}
          className={`w-full bg-app-card/50 border rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all leading-relaxed ${showResult ? "border-app-border text-white/50 cursor-default" : "border-app-border text-white/70 focus:border-app-accent-primary/30"}`}
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className={`text-xs ${isInRange ? "text-app-accent-success" : charCount > maxChars ? "text-red-400" : "text-app-text-muted"}`}>
            {charCount} / {minChars}-{maxChars} chữ
            {isInRange && " ✓"}
          </p>
          {!showResult && <p className="text-app-text-muted text-[10px]">Nhấn Tab để thụt đầu dòng</p>}
        </div>
      </div>
      {showResult && q.sampleAnswer && (
        <div className="bg-app-surface/50 border border-app-border rounded-xl p-4">
          <p className="text-app-text-muted text-[10px] tracking-normal mb-2">Bài mẫu tham khảo</p>
          <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">{q.sampleAnswer}</p>
        </div>
      )}
    </div>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────
function QuestionCard({
  q, mcAnswer, fillValue, fillValue2, writeValue,
  onMC, onFill, onFill2, onWrite, showResult,
}: {
  q: T2Question;
  mcAnswer: number | null;
  fillValue: string; fillValue2: string; writeValue: string;
  onMC: (i: number) => void;
  onFill: (v: string) => void; onFill2: (v: string) => void; onWrite: (v: string) => void;
  showResult: boolean;
}) {
  const sectionColors: Record<string, string> = { listening: "#38bdf8", reading: "#a78bfa", writing: "#34d399" };
  const sectionLabels: Record<string, string> = { listening: "Nghe", reading: "Đọc", writing: "Viết" };
  const typeLabels: Record<string, string> = {
    mc4: "Trắc nghiệm", mc4_image: "Chọn hình", mc4_audio: "Nghe → Chọn",
    fill_blank: "Điền từ", fill_blank2: "Điền 2 từ",
    write_short: "Viết ngắn", write_long: "Viết dài", order_sentence: "Sắp xếp",
  };
  const col = sectionColors[q.section];

  return (
    <div id={`q2-${q.number}`} className="bg-app-bg border border-app-border rounded-2xl p-5 scroll-mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0" style={{ backgroundColor: `${col}15`, color: col }}>{q.number}</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${col}15`, color: col }}>{sectionLabels[q.section]}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-card/50 text-app-text-muted">{typeLabels[q.type] || q.type}</span>
        <span className="text-[10px] text-app-text-muted ml-auto">{q.points}đ</span>
      </div>

      {/* Audio script */}
      {q.audioScript && (
        <div className="bg-[#38bdf8]/5 border border-[#38bdf8]/15 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-[#38bdf8]/15">
              <i className="ri-volume-up-line text-[#38bdf8] text-xs"></i>
            </div>
            <p className="text-[#38bdf8]/70 text-[10px] tracking-normal">Đoạn hội thoại / Âm thanh</p>
          </div>
          <p className="text-white/60 text-sm whitespace-pre-line leading-relaxed">{q.audioScript}</p>
          {q.audioScriptVi && <p className="text-app-text-muted text-xs italic mt-1.5 whitespace-pre-line">{q.audioScriptVi}</p>}
        </div>
      )}

      {/* Passage */}
      {q.passage && (
        <div className="bg-app-surface/50 border border-app-border rounded-xl p-3 mb-3">
          <p className="text-white/60 text-sm whitespace-pre-line leading-relaxed">{q.passage}</p>
          {q.passageVi && <p className="text-app-text-muted text-xs italic mt-1.5 whitespace-pre-line">{q.passageVi}</p>}
        </div>
      )}

      {/* Question */}
      <p className="text-white/80 text-sm font-medium mb-1">{q.question}</p>
      <p className="text-app-text-muted text-xs italic mb-3">{q.questionVi}</p>

      {/* Answer area */}
      {(q.type === "mc4" || q.type === "mc4_audio" || q.type === "order_sentence") && (
        <MC4TextQuestion q={q} selected={mcAnswer} onAnswer={onMC} showResult={showResult} />
      )}
      {q.type === "mc4_image" && (
        <MC4ImageQuestion q={q} selected={mcAnswer} onAnswer={onMC} showResult={showResult} />
      )}
      {(q.type === "fill_blank" || q.type === "fill_blank2") && q.section !== "writing" && (
        <FillBlankQuestion q={q} value={fillValue} value2={fillValue2} onChange={onFill} onChange2={onFill2} showResult={showResult} />
      )}
      {q.section === "writing" && q.type === "fill_blank2" && (
        <FillBlankQuestion q={q} value={fillValue} value2={fillValue2} onChange={onFill} onChange2={onFill2} showResult={showResult} />
      )}
      {(q.type === "write_short" || q.type === "write_long") && (
        <WritingQuestion q={q} value={writeValue} onChange={onWrite} showResult={showResult} />
      )}

      {/* Explanation */}
      {showResult && q.explanation && (
        <div className="mt-4 flex items-start gap-2 bg-app-surface/50 rounded-xl p-3">
          <i className="ri-lightbulb-line text-app-accent-primary text-xs flex-shrink-0 mt-0.5"></i>
          <p className="text-app-text-secondary text-xs leading-relaxed">{q.explanation}</p>
        </div>
      )}
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────
function ResultScreen({ mcAnswers, fillAnswers, writeAnswers, onRetry }: {
  mcAnswers: Record<string, number>;
  fillAnswers: Record<string, string>;
  writeAnswers: Record<string, string>;
  onRetry: () => void;
}) {
  const listeningQs = topik2Questions.filter(q => q.section === "listening" && (q.type === "mc4" || q.type === "mc4_image" || q.type === "mc4_audio"));
  const readingQs = topik2Questions.filter(q => q.section === "reading" && (q.type === "mc4" || q.type === "mc4_audio" || q.type === "order_sentence"));
  const writingQs = topik2Questions.filter(q => q.section === "writing");

  const calcMCScore = (qs: T2Question[]) => qs.reduce((s, q) => mcAnswers[q.id] === q.correctIndex ? s + q.points : s, 0);
  const listeningScore = calcMCScore(listeningQs);
  const readingScore = calcMCScore(readingQs);
  const writingScore = writingQs.reduce((s, q) => {
    const v = fillAnswers[q.id] || writeAnswers[q.id] || "";
    return v.trim().length > 5 ? s + Math.round(q.points * 0.7) : s;
  }, 0);
  const totalScore = listeningScore + readingScore + writingScore;
  const maxTotal = topik2Questions.reduce((s, q) => s + q.points, 0);
  const pct = Math.round((totalScore / maxTotal) * 100);

  const getLevel = () => {
    if (totalScore >= 230) return { label: "TOPIK II — Cấp 6", color: "#e8c84a" };
    if (totalScore >= 190) return { label: "TOPIK II — Cấp 5", color: "#34d399" };
    if (totalScore >= 150) return { label: "TOPIK II — Cấp 4", color: "#38bdf8" };
    if (totalScore >= 120) return { label: "TOPIK II — Cấp 3", color: "#a78bfa" };
    return { label: "Chưa đạt", color: "#f87171" };
  };
  const level = getLevel();

  return (
    <div className="space-y-6">
      {/* Score hero */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4" style={{ backgroundColor: `${level.color}15`, color: level.color }}>
          <i className="ri-trophy-fill"></i>{level.label}
        </div>
        <div className="text-7xl font-black mb-2" style={{ color: level.color }}>{totalScore}</div>
        <p className="text-app-text-muted text-sm mb-1">/ {maxTotal} điểm</p>
        <div className="mt-5 bg-app-card/50 rounded-full h-3 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: level.color }}></div>
        </div>
        <p className="text-app-text-muted text-xs mt-2">{pct}% tổng điểm</p>
      </div>

      {/* Section breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "듣기 (Nghe)", score: listeningScore, max: listeningQs.reduce((s,q)=>s+q.points,0), color: "#38bdf8", icon: "ri-headphone-line" },
          { label: "읽기 (Đọc)", score: readingScore, max: readingQs.reduce((s,q)=>s+q.points,0), color: "#a78bfa", icon: "ri-book-open-line" },
          { label: "쓰기 (Viết)", score: writingScore, max: writingQs.reduce((s,q)=>s+q.points,0), color: "#34d399", icon: "ri-edit-line" },
        ].map(sec => (
          <div key={sec.label} className="bg-app-bg border border-app-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${sec.color}15` }}>
                <i className={`${sec.icon} text-sm`} style={{ color: sec.color }}></i>
              </div>
              <p className="text-white/60 text-xs font-medium">{sec.label}</p>
            </div>
            <div className="text-xl font-bold mb-1" style={{ color: sec.color }}>{sec.score}</div>
            <p className="text-app-text-muted text-[10px] mb-2">/ {sec.max} điểm</p>
            <div className="bg-app-card/50 rounded-full h-1.5 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${sec.max > 0 ? (sec.score/sec.max)*100 : 0}%`, backgroundColor: sec.color }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Review */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <p className="text-white/50 text-sm font-semibold mb-4">Xem lại chi tiết từng câu</p>
        <div className="space-y-4">
          {topik2Questions.map(q => (
            <QuestionCard
              key={q.id} q={q}
              mcAnswer={mcAnswers[q.id] ?? null}
              fillValue={fillAnswers[q.id] || ""}
              fillValue2={fillAnswers[`${q.id}_2`] || ""}
              writeValue={writeAnswers[q.id] || ""}
              onMC={() => {}} onFill={() => {}} onFill2={() => {}} onWrite={() => {}}
              showResult
            />
          ))}
        </div>
      </div>

      <button onClick={onRetry} className="w-full py-4 rounded-2xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-base transition-colors cursor-pointer whitespace-nowrap">
        <i className="ri-refresh-line mr-2"></i>Thi lại
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function Topik2TestPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentSection, setCurrentSection] = useState<Section>("listening");
  const [mcAnswers, setMcAnswers] = useState<Record<string, number>>({});
  const [fillAnswers, setFillAnswers] = useState<Record<string, string>>({});
  const [writeAnswers, setWriteAnswers] = useState<Record<string, string>>({});
  const [bestScore, setBestScore] = useLocalStorage<number>("kts_topik2_best", 0);
  const [attempts, setAttempts] = useLocalStorage<number>("kts_topik2_attempts", 0);

  const handleExpire = useCallback(() => setPhase("result"), []);
  const { minutes, seconds, pct, isWarning, isDanger } = useTimer(phase === "exam", handleExpire);

  const handleStart = () => { setMcAnswers({}); setFillAnswers({}); setWriteAnswers({}); setCurrentSection("listening"); setPhase("exam"); };
  const handleSubmit = () => { setPhase("result"); setAttempts(c => c + 1); };
  const handleRetry = () => { setMcAnswers({}); setFillAnswers({}); setWriteAnswers({}); setPhase("intro"); };

  const displayedQs = topik2Questions.filter(q => q.section === currentSection);
  const answeredCount = Object.keys(mcAnswers).length + Object.keys(fillAnswers).filter(k => !k.endsWith("_2") && fillAnswers[k]).length + Object.keys(writeAnswers).filter(k => writeAnswers[k]).length;

  const sectionTabs: { key: Section; label: string; icon: string; color: string }[] = [
    { key: "listening", label: "듣기 Nghe", icon: "ri-headphone-line", color: "#38bdf8" },
    { key: "reading", label: "읽기 Đọc", icon: "ri-book-open-line", color: "#a78bfa" },
    { key: "writing", label: "쓰기 Viết", icon: "ri-edit-line", color: "#34d399" },
  ];

  // ── Intro ──
  if (phase === "intro") {
    return (
      <DashboardLayout title="Thi thử TOPIK II" subtitle="Format nâng cao — Nghe + Đọc + Viết, 180 phút, đa dạng dạng câu hỏi">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-app-accent-primary/10 mx-auto mb-4">
              <i className="ri-file-list-3-line text-app-accent-primary text-3xl"></i>
            </div>
            <h2 className="text-white text-xl font-bold mb-2">TOPIK II</h2>
            <p className="text-app-text-secondary text-sm mb-4">한국어능력시험 중·고급 — Trung cấp & Cao cấp</p>
            {bestScore > 0 && (
              <div className="inline-flex items-center gap-2 bg-app-accent-primary/8 border border-app-accent-primary/15 rounded-xl px-4 py-2">
                <i className="ri-trophy-line text-app-accent-primary text-sm"></i>
                <span className="text-app-accent-primary text-sm font-semibold">Điểm cao nhất: {bestScore}</span>
                <span className="text-app-text-muted text-xs">({attempts} lần)</span>
              </div>
            )}
          </div>

          {/* Format info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: "ri-headphone-line", label: "Phần Nghe", value: "50 câu · 60 phút", color: "#38bdf8" },
              { icon: "ri-book-open-line", label: "Phần Đọc", value: "50 câu · 70 phút", color: "#a78bfa" },
              { icon: "ri-edit-line", label: "Phần Viết", value: "4 câu · 50 phút", color: "#34d399" },
            ].map(s => (
              <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4 text-center">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto mb-2" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
                </div>
                <p className="text-white/60 text-xs font-medium">{s.label}</p>
                <p className="text-app-text-muted text-[10px] mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Question types */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white/50 text-sm font-semibold mb-3">Dạng câu hỏi đa dạng</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: "🖼️", label: "Chọn hình phù hợp" },
                { icon: "🎧", label: "Nghe hội thoại → Chọn đáp án" },
                { icon: "📝", label: "Trắc nghiệm 4 lựa chọn" },
                { icon: "✏️", label: "Điền từ vào chỗ trống" },
                { icon: "🔀", label: "Sắp xếp câu" },
                { icon: "📊", label: "Mô tả biểu đồ (viết)" },
                { icon: "💬", label: "Viết đoạn văn ngắn" },
                { icon: "📄", label: "Viết luận 600-700 chữ" },
              ].map(t => (
                <div key={t.label} className="flex items-center gap-2 bg-app-surface/50 rounded-lg px-3 py-2">
                  <span className="text-base">{t.icon}</span>
                  <p className="text-app-text-secondary text-xs">{t.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Level guide */}
          <div className="bg-app-bg border border-app-border rounded-2xl p-5">
            <p className="text-white/50 text-sm font-semibold mb-3">Thang điểm TOPIK II</p>
            <div className="space-y-2">
              {[
                { level: "Cấp 3", range: "120-149 điểm", color: "#a78bfa" },
                { level: "Cấp 4", range: "150-189 điểm", color: "#38bdf8" },
                { level: "Cấp 5", range: "190-229 điểm", color: "#34d399" },
                { level: "Cấp 6", range: "230-300 điểm", color: "#e8c84a" },
              ].map(l => (
                <div key={l.level} className="flex items-center justify-between px-3 py-2 rounded-lg bg-app-surface/50">
                  <span className="text-xs font-bold" style={{ color: l.color }}>{l.level}</span>
                  <span className="text-app-text-secondary text-xs">{l.range}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleStart} className="w-full py-4 rounded-2xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-black text-lg transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-play-fill mr-2"></i>Bắt đầu thi TOPIK II
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // ── Result ──
  if (phase === "result") {
    return (
      <DashboardLayout title="Kết quả TOPIK II" subtitle="Phân tích chi tiết 3 phần thi">
        <ResultScreen mcAnswers={mcAnswers} fillAnswers={fillAnswers} writeAnswers={writeAnswers} onRetry={handleRetry} />
      </DashboardLayout>
    );
  }

  // ── Exam ──
  return (
    <DashboardLayout
      title="Thi thử TOPIK II"
      subtitle={`${answeredCount} câu đã trả lời`}
      actions={
        <button onClick={handleSubmit} className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-send-plane-fill"></i>Nộp bài
        </button>
      }
    >
      {/* Timer */}
      <div className={`sticky top-0 z-10 bg-[#0a0c10]/95 backdrop-blur-sm border-b mb-5 py-3 px-1 -mx-1 ${isDanger ? "border-red-500/30" : isWarning ? "border-app-accent-primary/20" : "border-app-border"}`}>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-lg ${isDanger ? "border-red-500/30 bg-red-500/8 text-red-400" : isWarning ? "border-app-accent-primary/25 bg-app-accent-primary/8 text-app-accent-primary" : "border-app-border bg-app-surface/50 text-white/70"}`}>
            <i className={`ri-time-line text-base ${isDanger ? "animate-pulse" : ""}`}></i>
            {String(minutes).padStart(2,"0")}:{String(seconds).padStart(2,"0")}
          </div>
          <div className="flex-1">
            <div className="bg-app-card/50 rounded-full h-1.5 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: isDanger ? "#f87171" : isWarning ? "#e8c84a" : "#34d399" }}></div>
            </div>
          </div>
          <span className="text-app-text-muted text-xs whitespace-nowrap">180 phút</span>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex items-center bg-app-card/50 rounded-xl p-1 mb-5 w-fit">
        {sectionTabs.map(tab => (
          <button key={tab.key} onClick={() => setCurrentSection(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${currentSection === tab.key ? "text-app-bg" : "text-app-text-secondary hover:text-white/60"}`}
            style={currentSection === tab.key ? { backgroundColor: tab.color } : {}}>
            <i className={tab.icon}></i>{tab.label}
          </button>
        ))}
      </div>

      {/* Navigator */}
      <div className="flex flex-wrap gap-1.5 mb-5 bg-app-bg border border-app-border rounded-xl p-3">
        {displayedQs.map(q => {
          const isAnswered = mcAnswers[q.id] !== undefined || (fillAnswers[q.id] && fillAnswers[q.id].length > 0) || (writeAnswers[q.id] && writeAnswers[q.id].length > 0);
          return (
            <button key={q.id} onClick={() => document.getElementById(`q2-${q.number}`)?.scrollIntoView({ behavior: "smooth" })}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${isAnswered ? "bg-app-accent-primary text-app-bg" : "bg-app-card/50 text-app-text-muted hover:bg-app-card/70"}`}>
              {q.number}
            </button>
          );
        })}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {displayedQs.map(q => (
          <QuestionCard
            key={q.id} q={q}
            mcAnswer={mcAnswers[q.id] ?? null}
            fillValue={fillAnswers[q.id] || ""}
            fillValue2={fillAnswers[`${q.id}_2`] || ""}
            writeValue={writeAnswers[q.id] || ""}
            onMC={i => setMcAnswers(p => ({ ...p, [q.id]: i }))}
            onFill={v => setFillAnswers(p => ({ ...p, [q.id]: v }))}
            onFill2={v => setFillAnswers(p => ({ ...p, [`${q.id}_2`]: v }))}
            onWrite={v => setWriteAnswers(p => ({ ...p, [q.id]: v }))}
            showResult={false}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button onClick={handleSubmit} className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-base px-10 py-4 rounded-2xl transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-send-plane-fill"></i>Nộp bài
        </button>
      </div>
    </DashboardLayout>
  );
}


