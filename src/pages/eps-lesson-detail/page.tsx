import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useXPSystem } from "@/hooks/useXPSystem";
import {
  epsLessons,
  EPS_LESSON_TOPICS,
  type EpsLesson,
  type EpsExercise,
} from "@/mocks/epsLessons";

function stripLessonPrefix(titleVi: string): string {
  return titleVi.replace(/^Bài\s+\d+[:\s]+/i, "").trim();
}

function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: "Cơ bản", color: "#34d399" },
  intermediate: { label: "Trung cấp", color: "#e8c84a" },
  advanced: { label: "Nâng cao", color: "#f87171" },
};

// ─── Vocabulary Tab ───────────────────────────────────────────────────────
function VocabTab({ lesson }: { lesson: EpsLesson }) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  return (
    <div className="space-y-4">
      <p className="text-app-text-secondary text-xs">{lesson.vocabulary.length} từ vựng — Click vào thẻ để xem ví dụ</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {lesson.vocabulary.map((v, i) => (
          <button
            key={i}
            onClick={() => setFlipped(p => ({ ...p, [i]: !p[i] }))}
            className="text-left p-4 rounded-xl border border-app-border bg-white/2 hover:border-white/15 hover:bg-white/4 transition-all cursor-pointer"
          >
            {!flipped[i] ? (
              <>
                <div className="flex items-start justify-between mb-2">
                  <p className="text-white font-bold text-lg leading-tight">{v.korean}</p>
                  <button
                    onClick={e => { e.stopPropagation(); speakKorean(v.korean); }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-accent-primary/10 hover:bg-app-accent-primary/20 transition-colors cursor-pointer"
                  >
                    <i className="ri-volume-up-line text-app-accent-primary text-xs"></i>
                  </button>
                </div>
                <p className="text-app-text-secondary text-xs mb-1">[{v.pronunciation}]</p>
                <p className="text-app-accent-primary text-sm font-medium">{v.vietnamese}</p>
              </>
            ) : (
              <>
                <p className="text-white/50 text-xs mb-2 font-medium">Ví dụ:</p>
                <div className="flex items-start gap-1.5 mb-1">
                  <button
                    onClick={e => { e.stopPropagation(); speakKorean(v.example); }}
                    className="w-5 h-5 flex items-center justify-center rounded-md bg-app-accent-primary/10 hover:bg-app-accent-primary/20 transition-colors cursor-pointer flex-shrink-0 mt-0.5"
                  >
                    <i className="ri-volume-up-line text-app-accent-primary text-[10px]"></i>
                  </button>
                  <p className="text-white text-sm font-medium">{v.example}</p>
                </div>
                <p className="text-app-text-secondary text-xs italic">{v.exampleVi}</p>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Quick Review (Flashcard) Tab ─────────────────────────────────────────
function QuickReviewTab({ lesson }: { lesson: EpsLesson }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [unknown, setUnknown] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);

  const vocab = lesson.vocabulary;
  const current = vocab[currentIdx];

  const advance = () => {
    setFlipped(false);
    setTimeout(() => {
      if (currentIdx + 1 >= vocab.length) setFinished(true);
      else setCurrentIdx(i => i + 1);
    }, 150);
  };

  const handleKnow = () => { setKnown(prev => new Set([...prev, currentIdx])); advance(); };
  const handleUnknow = () => { setUnknown(prev => new Set([...prev, currentIdx])); advance(); };

  const restart = () => {
    setCurrentIdx(0); setFlipped(false);
    setKnown(new Set()); setUnknown(new Set()); setFinished(false);
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-app-accent-primary/15 mb-4">
          <i className="ri-trophy-line text-app-accent-primary text-2xl"></i>
        </div>
        <p className="text-white font-bold text-lg mb-1">Ôn tập xong!</p>
        <div className="flex gap-6 my-4">
          <div className="text-center"><p className="text-app-accent-success font-bold text-2xl">{known.size}</p><p className="text-app-text-secondary text-xs">Đã nhớ</p></div>
          <div className="w-px bg-app-card/70"></div>
          <div className="text-center"><p className="text-red-400 font-bold text-2xl">{unknown.size}</p><p className="text-app-text-secondary text-xs">Cần ôn</p></div>
        </div>
        <button onClick={restart} className="px-6 py-2.5 rounded-xl border border-app-accent-primary/30 bg-app-accent-primary/8 text-app-accent-primary text-sm font-semibold cursor-pointer whitespace-nowrap">
          Ôn lại từ đầu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between text-xs text-app-text-secondary">
        <span>{currentIdx + 1} / {vocab.length}</span>
        <div className="flex gap-3">
          <span className="text-app-accent-success">{known.size} nhớ</span>
          <span className="text-red-400">{unknown.size} chưa</span>
        </div>
      </div>
      <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-app-accent-primary transition-all" style={{ width: `${((known.size + unknown.size) / vocab.length) * 100}%` }} />
      </div>

      <div onClick={() => setFlipped(f => !f)} className="relative w-full cursor-pointer select-none" style={{ perspective: "1000px", minHeight: "220px" }}>
        <div className="relative w-full transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: "220px" }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-2xl border border-app-border bg-app-surface/50" style={{ backfaceVisibility: "hidden" }}>
            <p className="text-app-text-muted text-xs mb-3">Tiếng Hàn</p>
            <p className="text-white font-bold text-4xl mb-2">{current.korean}</p>
            <p className="text-app-text-secondary text-sm">[{current.pronunciation}]</p>
            <button onClick={e => { e.stopPropagation(); speakKorean(current.korean); }} className="mt-4 w-9 h-9 flex items-center justify-center rounded-xl bg-app-accent-primary/10 hover:bg-app-accent-primary/20 cursor-pointer">
              <i className="ri-volume-up-line text-app-accent-primary"></i>
            </button>
            <p className="text-app-text-muted text-xs mt-4">Nhấn để xem nghĩa</p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-2xl border border-app-accent-primary/20 bg-app-accent-primary/5" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <p className="text-app-accent-primary/60 text-xs mb-3">Tiếng Việt</p>
            <p className="text-app-accent-primary font-bold text-2xl mb-3">{current.vietnamese}</p>
            <div className="border-t border-app-border pt-3 w-full text-center">
              <p className="text-white/50 text-sm italic">{current.example}</p>
              <p className="text-app-text-muted text-xs mt-1">{current.exampleVi}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={handleUnknow} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/25 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-sm font-semibold cursor-pointer whitespace-nowrap">
          <i className="ri-close-line"></i>Chưa nhớ
        </button>
        <button onClick={handleKnow} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 text-app-accent-success text-sm font-semibold cursor-pointer whitespace-nowrap">
          <i className="ri-check-line"></i>Đã nhớ
        </button>
      </div>
    </div>
  );
}

// ─── Grammar Tab ──────────────────────────────────────────────────────────
function GrammarTab({ lesson }: { lesson: EpsLesson }) {
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });
  return (
    <div className="space-y-3">
      {lesson.grammarPoints.map((g, i) => (
        <div key={i} className="border border-app-border rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(p => ({ ...p, [i]: !p[i] }))}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-app-surface/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-accent-primary/10 flex-shrink-0">
                <i className="ri-book-2-line text-app-accent-primary text-sm"></i>
              </div>
              <p className="text-white font-semibold text-sm text-left">{g.pattern}</p>
            </div>
            <i className={open[i] ? "ri-arrow-up-s-line text-app-text-muted" : "ri-arrow-down-s-line text-app-text-muted"}></i>
          </button>
          {open[i] && (
            <div className="px-5 pb-5 space-y-4">
              <p className="text-white/60 text-sm leading-relaxed bg-app-surface/50 rounded-lg p-3">{g.explanation}</p>
              <div className="space-y-2">
                <p className="text-app-text-muted text-xs font-medium tracking-normal">Ví dụ</p>
                {g.examples.map((ex, j) => (
                  <div key={j} className="flex items-start gap-3 p-3 rounded-lg bg-app-accent-primary/5 border border-app-accent-primary/10">
                    <button onClick={() => speakKorean(ex.korean)} className="w-6 h-6 flex items-center justify-center rounded-md bg-app-accent-primary/10 hover:bg-app-accent-primary/20 flex-shrink-0 mt-0.5 cursor-pointer">
                      <i className="ri-volume-up-line text-app-accent-primary text-xs"></i>
                    </button>
                    <div>
                      <p className="text-white text-sm font-medium">{ex.korean}</p>
                      <p className="text-app-text-secondary text-xs mt-0.5">{ex.vietnamese}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Story / Dialogue Tab ─────────────────────────────────────────────────
function StoryTab({ lesson }: { lesson: EpsLesson }) {
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const hasRealDialogues = lesson.dialogues && lesson.dialogues.length >= 2;

  const stories = hasRealDialogues
    ? [
        { title: "Hội thoại chính", lines: lesson.dialogues.map(d => ({ speaker: d.speaker, korean: d.korean, vietnamese: d.vietnamese, keyword: "" })) },
        { title: "Hội thoại bổ sung", lines: lesson.vocabulary.slice(0, 4).map((v, i) => ({ speaker: i % 2 === 0 ? "A" : "B", korean: v.example || v.korean, vietnamese: v.exampleVi || v.vietnamese, keyword: v.korean })).filter(l => l.korean) },
      ]
    : [
        { title: "Hội thoại 1", lines: lesson.vocabulary.slice(0, 4).map((v, i) => ({ speaker: i % 2 === 0 ? "A" : "B", korean: v.example || v.korean, vietnamese: v.exampleVi || v.vietnamese, keyword: v.korean })) },
        { title: "Hội thoại 2", lines: lesson.vocabulary.slice(4, 8).map((v, i) => ({ speaker: i % 2 === 0 ? "A" : "B", korean: v.example || v.korean, vietnamese: v.exampleVi || v.vietnamese, keyword: v.korean })) },
      ];

  const highlightKeyword = (sentence: string, keyword: string) => {
    if (!keyword) return <span>{sentence}</span>;
    const parts = sentence.split(keyword);
    if (parts.length === 1) return <span>{sentence}</span>;
    return (
      <>
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="text-app-accent-primary font-bold bg-app-accent-primary/10 px-0.5 rounded cursor-pointer" onClick={() => setActiveWord(keyword)}>{keyword}</span>
            )}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="space-y-5">
      {stories.map((story, si) => (
        <div key={si} className="border border-app-border rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-app-surface/50 border-b border-app-border">
            <p className="text-white/50 text-xs font-semibold">{story.title} — Bài {lesson.id}</p>
          </div>
          <div className="p-4 space-y-3">
            {story.lines.map((line, li) => (
              <div key={li} className={`flex gap-3 ${line.speaker === "B" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 text-xs font-bold ${line.speaker === "A" ? "bg-app-accent-primary/20 text-app-accent-primary" : "bg-[#34d399]/20 text-[#34d399]"}`}>{line.speaker}</div>
                <div className={`flex-1 p-3 rounded-xl text-sm ${line.speaker === "A" ? "bg-white/4 rounded-tl-none" : "bg-[#34d399]/5 rounded-tr-none"}`}>
                  <div className="flex items-start gap-2">
                    <button onClick={() => speakKorean(line.korean)} className="w-5 h-5 flex items-center justify-center rounded-md bg-app-accent-primary/10 hover:bg-app-accent-primary/20 flex-shrink-0 mt-0.5 cursor-pointer">
                      <i className="ri-volume-up-line text-app-accent-primary text-[10px]"></i>
                    </button>
                    <div>
                      <p className="text-white font-medium leading-relaxed">{highlightKeyword(line.korean, line.keyword)}</p>
                      <p className="text-app-text-secondary text-xs mt-0.5 italic">{line.vietnamese}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {activeWord && (
        <div className="p-4 rounded-xl border border-app-accent-primary/25 bg-app-accent-primary/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-app-accent-primary font-bold text-lg">{activeWord}</p>
            <button onClick={() => setActiveWord(null)} className="text-app-text-muted hover:text-white/60 cursor-pointer"><i className="ri-close-line"></i></button>
          </div>
          <p className="text-white/60 text-sm">{lesson.vocabulary.find(v => v.korean === activeWord)?.vietnamese || ""}</p>
        </div>
      )}
    </div>
  );
}

// ─── Matching Game Tab ────────────────────────────────────────────────────
function MatchingTab({ lesson }: { lesson: EpsLesson }) {
  const PAIR_COUNT = 6;
  const [pairs, setPairs] = useState(() => [...lesson.vocabulary].sort(() => Math.random() - 0.5).slice(0, PAIR_COUNT));
  const [selected, setSelected] = useState<{ side: "korean" | "viet"; idx: number } | null>(null);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<{ side: "korean" | "viet"; idx: number } | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [finished, setFinished] = useState(false);

  const koreanOrder = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), [pairs]);
  const vietnameseOrder = useMemo(() => [...pairs].sort(() => Math.random() - 0.5), [pairs]);

  const handleSelect = (side: "korean" | "viet", idx: number) => {
    if (matched.has(idx)) return;
    if (wrong) { setWrong(null); setSelected(null); return; }
    if (!selected) { setSelected({ side, idx }); if (side === "korean") speakKorean(pairs[idx].korean); return; }
    if (selected.side === side) { setSelected({ side, idx }); return; }
    const korIdx = side === "viet" ? selected.idx : idx;
    const vitIdx = side === "viet" ? idx : selected.idx;
    setAttempts(a => a + 1);
    if (korIdx === vitIdx) {
      const newMatched = new Set([...matched, korIdx]);
      setMatched(newMatched); setScore(s => s + 1); setSelected(null);
      if (newMatched.size === PAIR_COUNT) setFinished(true);
    } else {
      setWrong({ side, idx });
      setTimeout(() => { setWrong(null); setSelected(null); }, 800);
    }
  };

  const restart = () => {
    setPairs([...lesson.vocabulary].sort(() => Math.random() - 0.5).slice(0, PAIR_COUNT));
    setSelected(null); setMatched(new Set()); setWrong(null); setScore(0); setAttempts(0); setFinished(false);
  };

  const getCardClass = (side: "korean" | "viet", idx: number) => {
    if (matched.has(idx)) return "border-emerald-500/40 bg-emerald-500/8 text-app-accent-success cursor-default";
    if (wrong && wrong.side === side && wrong.idx === idx) return "border-red-500/40 bg-red-500/8 text-red-400 cursor-pointer";
    if (selected && selected.side === side && selected.idx === idx) return "border-app-accent-primary/50 bg-app-accent-primary/10 text-app-accent-primary cursor-pointer";
    return "border-app-border bg-white/2 text-white/70 hover:border-white/20 hover:bg-white/4 cursor-pointer";
  };

  if (finished) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-app-accent-primary/15 mb-4">
          <i className="ri-trophy-line text-app-accent-primary text-2xl"></i>
        </div>
        <p className="text-white font-bold text-lg mb-1">Ghép cặp hoàn thành!</p>
        <div className="flex gap-6 my-4">
          <div className="text-center"><p className="text-app-accent-primary font-bold text-2xl">{score}</p><p className="text-app-text-secondary text-xs">Cặp đúng</p></div>
          <div className="w-px bg-app-card/70"></div>
          <div className="text-center"><p className="text-white font-bold text-2xl">{attempts}</p><p className="text-app-text-secondary text-xs">Lần thử</p></div>
        </div>
        <button onClick={restart} className="px-6 py-2.5 rounded-xl border border-app-accent-primary/30 bg-app-accent-primary/8 text-app-accent-primary text-sm font-semibold cursor-pointer whitespace-nowrap">
          Chơi lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-app-text-secondary text-xs">Ghép từ tiếng Hàn với nghĩa tiếng Việt</p>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-app-accent-success font-bold">{matched.size}/{PAIR_COUNT}</span>
          <button onClick={restart} className="text-app-text-muted hover:text-white/60 cursor-pointer"><i className="ri-refresh-line"></i></button>
        </div>
      </div>
      <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-app-accent-primary transition-all" style={{ width: `${(matched.size / PAIR_COUNT) * 100}%` }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-app-text-muted text-[10px] font-semibold tracking-normal text-center mb-2">Tiếng Hàn</p>
          {koreanOrder.map(v => {
            const idx = pairs.indexOf(v);
            return (
              <button key={`k-${idx}`} onClick={() => handleSelect("korean", idx)} disabled={matched.has(idx)} className={`w-full p-3 rounded-xl border text-sm font-semibold transition-all text-center ${getCardClass("korean", idx)}`}>
                {v.korean}{matched.has(idx) && <i className="ri-checkbox-circle-fill ml-1 text-xs"></i>}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <p className="text-app-text-muted text-[10px] font-semibold tracking-normal text-center mb-2">Tiếng Việt</p>
          {vietnameseOrder.map(v => {
            const idx = pairs.indexOf(v);
            return (
              <button key={`v-${idx}`} onClick={() => handleSelect("viet", idx)} disabled={matched.has(idx)} className={`w-full p-3 rounded-xl border text-sm font-medium transition-all text-center ${getCardClass("viet", idx)}`}>
                {v.vietnamese}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Exercise Tab ─────────────────────────────────────────────────────────
function ExerciseTab({ lesson, onComplete }: { lesson: EpsLesson; onComplete: (score: number) => void }) {
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    let correct = 0;
    lesson.exercises.forEach(ex => {
      const ans = answers[ex.id];
      if (ex.type === "multiple_choice" && ans === ex.correctIndex) correct++;
      else if (ex.type === "fill_blank" && typeof ans === "string" && ans.trim().toLowerCase() === ex.correctAnswer?.toLowerCase()) correct++;
      else if (ex.type === "translate" && typeof ans === "string" && ans.trim().length > 0) correct++;
    });
    onComplete(correct);
  };

  const score = useMemo(() => {
    if (!submitted) return 0;
    let c = 0;
    lesson.exercises.forEach(ex => {
      const ans = answers[ex.id];
      if (ex.type === "multiple_choice" && ans === ex.correctIndex) c++;
      else if (ex.type === "fill_blank" && typeof ans === "string" && ans.trim().toLowerCase() === ex.correctAnswer?.toLowerCase()) c++;
      else if (ex.type === "translate" && typeof ans === "string" && ans.trim().length > 0) c++;
    });
    return c;
  }, [submitted, answers, lesson.exercises]);

  return (
    <div className="space-y-5">
      {lesson.exercises.map((ex: EpsExercise, idx) => (
        <div key={ex.id} className="bg-white/2 border border-app-border rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 flex-shrink-0 text-app-text-secondary text-xs font-bold">{idx + 1}</div>
            <div>
              <p className="text-white text-sm font-medium">{ex.question}</p>
              <p className="text-app-text-secondary text-xs mt-0.5 italic">{ex.questionVi}</p>
            </div>
          </div>

          {ex.type === "multiple_choice" && ex.options && (
            <div className="space-y-2 ml-10">
              {ex.options.map((opt, i) => {
                let cls = "border-app-border bg-white/2 hover:border-white/15 cursor-pointer";
                if (submitted) {
                  if (i === ex.correctIndex) cls = "border-emerald-500/40 bg-emerald-500/8 cursor-default";
                  else if (answers[ex.id] === i) cls = "border-red-500/40 bg-red-500/8 cursor-default";
                  else cls = "border-app-border opacity-40 cursor-default";
                } else if (answers[ex.id] === i) cls = "border-app-accent-primary/40 bg-app-accent-primary/8 cursor-pointer";
                return (
                  <button key={i} disabled={submitted} onClick={() => setAnswers(p => ({ ...p, [ex.id]: i }))} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all text-left ${cls}`}>
                    <span className="text-app-text-muted text-xs font-bold w-4">{["A","B","C","D"][i]}</span>
                    <div>
                      <p className="text-white/70 text-sm">{opt}</p>
                      {ex.optionsVi && <p className="text-app-text-muted text-xs">{ex.optionsVi[i]}</p>}
                    </div>
                    {submitted && i === ex.correctIndex && <i className="ri-checkbox-circle-fill text-app-accent-success ml-auto"></i>}
                    {submitted && answers[ex.id] === i && i !== ex.correctIndex && <i className="ri-close-circle-fill text-red-400 ml-auto"></i>}
                  </button>
                );
              })}
            </div>
          )}

          {ex.type === "fill_blank" && (
            <div className="ml-10 space-y-2">
              <input type="text" disabled={submitted} value={(answers[ex.id] as string) || ""} onChange={e => setAnswers(p => ({ ...p, [ex.id]: e.target.value }))} placeholder="Nhập câu trả lời..." className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 disabled:opacity-60" />
              {submitted && <p className={`text-xs font-medium ${(answers[ex.id] as string)?.trim().toLowerCase() === ex.correctAnswer?.toLowerCase() ? "text-app-accent-success" : "text-red-400"}`}>Đáp án đúng: <span className="font-bold">{ex.correctAnswer}</span></p>}
            </div>
          )}

          {ex.type === "translate" && (
            <div className="ml-10 space-y-2">
              <textarea disabled={submitted} value={(answers[ex.id] as string) || ""} onChange={e => setAnswers(p => ({ ...p, [ex.id]: e.target.value }))} placeholder="Nhập bản dịch..." rows={2} className="w-full bg-app-card/50 border border-app-border rounded-lg px-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 resize-none disabled:opacity-60" />
              {submitted && <p className="text-app-text-secondary text-xs">Gợi ý: <span className="text-app-accent-primary">{ex.correctAnswer}</span></p>}
            </div>
          )}
        </div>
      ))}

      {!submitted ? (
        <button onClick={handleSubmit} disabled={Object.keys(answers).length < lesson.exercises.length} className="w-full py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed">
          Nộp bài ({Object.keys(answers).length}/{lesson.exercises.length} câu)
        </button>
      ) : (
        <div className={`p-4 rounded-xl border text-center ${score === lesson.exercises.length ? "border-emerald-500/30 bg-emerald-500/8" : "border-app-accent-primary/30 bg-app-accent-primary/8"}`}>
          <p className="text-white font-bold text-lg">{score}/{lesson.exercises.length} câu đúng</p>
          <p className="text-white/50 text-sm mt-1">{score === lesson.exercises.length ? "Hoàn hảo! Bạn đã nắm vững bài này!" : "Hãy ôn lại phần chưa đúng nhé!"}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function EpsLessonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addXP } = useXPSystem();
  const [completedLessons, setCompletedLessons] = useLocalStorage<Record<number, { score: number; completedAt: string }>>("kts_eps_lessons_progress", {});
  const [tab, setTab] = useState<"vocab" | "story" | "matching" | "review" | "grammar" | "exercise">("vocab");

  const lessonId = parseInt(id || "1", 10);
  const lesson = epsLessons.find(l => l.id === lessonId);
  const topicInfo = lesson ? EPS_LESSON_TOPICS.find(t => t.id === lesson.topic) : null;
  const levelInfo = lesson ? LEVEL_LABELS[lesson.level] : null;
  const isCompleted = lesson ? !!completedLessons[lesson.id] : false;

  const prevLesson = epsLessons.find(l => l.id === lessonId - 1);
  const nextLesson = epsLessons.find(l => l.id === lessonId + 1);

  const handleMarkComplete = (score: number) => {
    if (!lesson || completedLessons[lesson.id]) return;
    const xpGain = 30 + score * 10;
    setCompletedLessons(prev => ({ ...prev, [lesson.id]: { score, completedAt: new Date().toISOString() } }));
    addXP(xpGain, `Hoàn thành bài EPS số ${lesson.id}`);
  };

  if (!lesson) {
    return (
      <DashboardLayout title="Không tìm thấy bài học" subtitle="">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <i className="ri-error-warning-line text-4xl text-app-text-muted mb-4"></i>
          <p className="text-white/50 text-lg mb-4">Bài học #{id} không tồn tại</p>
          <button onClick={() => navigate("/eps-lessons")} className="px-6 py-2.5 rounded-xl bg-app-accent-primary text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap">
            Quay lại danh sách
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { key: "vocab", label: "Từ vựng", icon: "ri-translate-2" },
    { key: "story", label: "Hội thoại", icon: "ri-chat-3-line" },
    { key: "matching", label: "Ghép cặp", icon: "ri-links-line" },
    { key: "review", label: "Ôn nhanh", icon: "ri-stack-line" },
    { key: "grammar", label: "Ngữ pháp", icon: "ri-book-2-line" },
    { key: "exercise", label: "Bài tập", icon: "ri-pencil-line" },
  ] as const;

  return (
    <DashboardLayout
      title={`Bài ${lesson.id}: ${stripLessonPrefix(lesson.titleVi)}`}
      subtitle={lesson.title}
    >
      {/* Back + navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/eps-lessons")}
          className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-arrow-left-line"></i>
          Danh sách 60 bài
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => prevLesson && navigate(`/eps-lesson/${prevLesson.id}`)}
            disabled={!prevLesson}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-app-border bg-app-surface/50 text-app-text-secondary hover:text-white/70 hover:bg-white/6 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <i className="ri-arrow-left-s-line text-base"></i>
          </button>
          <span className="text-app-text-muted text-xs px-2">{lesson.id} / {epsLessons.length}</span>
          <button
            onClick={() => nextLesson && navigate(`/eps-lesson/${nextLesson.id}`)}
            disabled={!nextLesson}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-app-border bg-app-surface/50 text-app-text-secondary hover:text-white/70 hover:bg-white/6 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <i className="ri-arrow-right-s-line text-base"></i>
          </button>
        </div>
      </div>

      {/* Lesson header card */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {topicInfo && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${topicInfo.color}15`, color: topicInfo.color }}>
                  <i className={`${topicInfo.icon} mr-1`}></i>{topicInfo.label}
                </span>
              )}
              {levelInfo && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${levelInfo.color}15`, color: levelInfo.color }}>
                  {levelInfo.label}
                </span>
              )}
              <span className="text-[10px] text-app-text-muted flex items-center gap-1">
                <i className="ri-time-line"></i>{lesson.estimatedMinutes} phút
              </span>
              <span className="text-[10px] text-app-text-muted flex items-center gap-1">
                <i className="ri-translate-2"></i>{lesson.vocabulary.length} từ
              </span>
              {isCompleted && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-app-accent-success/15 text-app-accent-success">
                  <i className="ri-checkbox-circle-fill mr-1"></i>Đã hoàn thành
                </span>
              )}
            </div>

            {/* Key phrase */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-app-accent-primary/5 border border-app-accent-primary/10">
              <button onClick={() => speakKorean(lesson.keyPhrase)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-app-accent-primary/15 hover:bg-app-accent-primary/25 cursor-pointer flex-shrink-0">
                <i className="ri-volume-up-line text-app-accent-primary text-sm"></i>
              </button>
              <div>
                <p className="text-app-accent-primary font-bold text-base">{lesson.keyPhrase}</p>
                <p className="text-app-text-secondary text-xs">{lesson.keyPhraseVi}</p>
              </div>
            </div>
          </div>

          {/* Complete button */}
          <div className="flex-shrink-0">
            {isCompleted ? (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <i className="ri-checkbox-circle-fill text-app-accent-success"></i>
                <span className="text-app-accent-success text-sm font-semibold whitespace-nowrap">Đã học xong</span>
              </div>
            ) : (
              <button
                onClick={() => handleMarkComplete(0)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 text-app-accent-success text-sm font-semibold cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-checkbox-circle-line"></i>
                Đánh dấu xong
              </button>
            )}
          </div>
        </div>

        {/* Cultural note */}
        {lesson.culturalNote && (
          <div className="mt-4 p-3 rounded-xl border border-[#84cc16]/20 bg-[#84cc16]/5">
            <div className="flex items-start gap-2">
              <i className="ri-global-line text-[#84cc16] text-sm flex-shrink-0 mt-0.5"></i>
              <div>
                <p className="text-[#84cc16] text-xs font-semibold mb-1">Ghi chú văn hóa</p>
                <p className="text-white/50 text-xs leading-relaxed">{lesson.culturalNote}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-app-border mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${tab === t.key ? "text-app-accent-primary border-b-2 border-app-accent-primary" : "text-app-text-secondary hover:text-white/60"}`}
          >
            <i className={`${t.icon} text-base`}></i>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-app-bg border border-app-border rounded-2xl p-5 md:p-6">
        {tab === "vocab" && <VocabTab lesson={lesson} />}
        {tab === "story" && <StoryTab lesson={lesson} />}
        {tab === "matching" && <MatchingTab lesson={lesson} />}
        {tab === "review" && <QuickReviewTab lesson={lesson} />}
        {tab === "grammar" && <GrammarTab lesson={lesson} />}
        {tab === "exercise" && <ExerciseTab lesson={lesson} onComplete={handleMarkComplete} />}
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-app-border">
        <button
          onClick={() => prevLesson && navigate(`/eps-lesson/${prevLesson.id}`)}
          disabled={!prevLesson}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-app-border bg-app-surface/50 text-white/50 hover:text-white/80 hover:bg-white/6 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <i className="ri-arrow-left-line"></i>
          {prevLesson ? `Bài ${prevLesson.id}` : "Bài trước"}
        </button>

        <button
          onClick={() => navigate("/eps-lessons")}
          className="text-app-text-muted hover:text-white/60 text-xs cursor-pointer whitespace-nowrap transition-colors"
        >
          <i className="ri-list-check mr-1"></i>Danh sách
        </button>

        <button
          onClick={() => nextLesson && navigate(`/eps-lesson/${nextLesson.id}`)}
          disabled={!nextLesson}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-app-accent-primary/20 bg-app-accent-primary/5 text-app-accent-primary hover:bg-app-accent-primary/10 text-sm font-semibold transition-all cursor-pointer whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {nextLesson ? `Bài ${nextLesson.id}` : "Bài tiếp"}
          <i className="ri-arrow-right-line"></i>
        </button>
      </div>
    </DashboardLayout>
  );
}
