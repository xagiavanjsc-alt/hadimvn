import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface DictationItem {
  id: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  levelColor: string;
  topic: string;
  korean: string;
  vietnamese: string;
  hint?: string;
}

const dictationItems: DictationItem[] = [
  { id: "d1", level: "A1", levelColor: "#34d399", topic: "Chào h?i", korean: "?????. ??? ?????.", vietnamese: "Xin chào. R?t vui du?c g?p b?n.", hint: "Câu chào h?i co b?n" },
  { id: "d2", level: "A1", levelColor: "#34d399", topic: "Gi?i thi?u", korean: "?? ??? ?????.", vietnamese: "Tôi là ngu?i Vi?t Nam.", hint: "Gi?i thi?u qu?c t?ch" },
  { id: "d3", level: "A1", levelColor: "#34d399", topic: "S? d?m", korean: "??? ? ? ???.", vietnamese: "Có ba qu? táo.", hint: "Ð?m d? v?t" },
  { id: "d4", level: "A2", levelColor: "#6ee7b7", topic: "Th?i ti?t", korean: "?? ??? ?? ????.", vietnamese: "Hôm nay th?i ti?t trong sáng và ?m áp.", hint: "Mô t? th?i ti?t" },
  { id: "d5", level: "A2", levelColor: "#6ee7b7", topic: "Mua s?m", korean: "? ?? ????? ? ????.", vietnamese: "B? qu?n áo này bao nhiêu ti?n? Hoi d?t nh?.", hint: "H?i giá" },
  { id: "d6", level: "A2", levelColor: "#6ee7b7", topic: "K? ho?ch", korean: "?? ??? ?? ??? ? ???.", vietnamese: "Ngày mai tôi s? xem phim cùng b?n.", hint: "K? ho?ch tuong lai" },
  { id: "d7", level: "B1", levelColor: "#fbbf24", topic: "S?c kh?e", korean: "?? ????? ?? ??? ?? ? ? ??.", vietnamese: "D?o này tôi b? nhi?u stress nên ng? không ngon.", hint: "V?n d? s?c kh?e" },
  { id: "d8", level: "B1", levelColor: "#fbbf24", topic: "Du l?ch", korean: "??? ?? ??? ???? ?? ???.", vietnamese: "Ðây là l?n d?u tôi d?n Hàn Qu?c và có r?t nhi?u th? d? xem.", hint: "Tr?i nghi?m du l?ch" },
  { id: "d9", level: "B1", levelColor: "#fbbf24", topic: "Công vi?c", korean: "?? ????? ????? ??????.", vietnamese: "Tôi dã hoàn thành d? án l?n này m?t cách thành công.", hint: "K?t qu? công vi?c" },
  { id: "d10", level: "B2", levelColor: "#f59e0b", topic: "Xã h?i", korean: "?? ???? ?? ??? ?? ??? ??? ???.", vietnamese: "Trong xã h?i hi?n d?i, k? nang giao ti?p dóng vai trò r?t quan tr?ng.", hint: "Câu van ph?c t?p" },
  { id: "d11", level: "B2", levelColor: "#f59e0b", topic: "Giáo d?c", korean: "??? ??? ??? ??? ???? ?? ??? ???? ??? ????.", vietnamese: "M?c dích c?a giáo d?c không ch? là truy?n d?t ki?n th?c mà còn là phát tri?n tu duy.", hint: "Câu ph?c v?i c?u trúc nâng cao" },
  { id: "d12", level: "C1", levelColor: "#f87171", topic: "Tri?t h?c", korean: "??? ??? ???? ???? ?? ??? ??? ??? ????.", vietnamese: "Con ngu?i là d?ng v?t xã h?i, hình thành b?n ngã trong m?i quan h? v?i ngu?i khác.", hint: "Câu h?c thu?t ph?c t?p" },
];

// --- Compare function ---------------------------------------------------------
function compareTexts(input: string, answer: string): { correct: boolean; similarity: number; diff: { char: string; correct: boolean }[] } {
  const normalize = (s: string) => s.trim().replace(/\s+/g, " ");
  const inp = normalize(input);
  const ans = normalize(answer);

  if (inp === ans) return { correct: true, similarity: 100, diff: ans.split("").map(c => ({ char: c, correct: true })) };

  // Simple character-level comparison
  const diff: { char: string; correct: boolean }[] = [];
  let correctCount = 0;
  const maxLen = Math.max(inp.length, ans.length);

  for (let i = 0; i < ans.length; i++) {
    const isCorrect = inp[i] === ans[i];
    if (isCorrect) correctCount++;
    diff.push({ char: ans[i], correct: isCorrect });
  }

  const similarity = Math.round((correctCount / ans.length) * 100);
  return { correct: similarity >= 95, similarity, diff };
}

// --- Dictation Card -----------------------------------------------------------
function DictationCard({ item, onComplete }: { item: DictationItem; onComplete: (score: number) => void }) {
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof compareTexts> | null>(null);
  const [playCount, setPlayCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handlePlay = (slow = false) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(item.korean);
      utt.lang = "ko-KR";
      utt.rate = slow ? 0.6 : 0.85;
      setIsPlaying(true);
      utt.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utt);
      setPlayCount(c => c + 1);
    }
  };

  const handleCheck = () => {
    const r = compareTexts(input, item.korean);
    setResult(r);
    setRevealed(true);
    onComplete(r.similarity);
  };

  return (
    <div className="rounded-2xl border border-app-border bg-app-surface/50 p-6">
      {/* Level + topic */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${item.levelColor}20`, color: item.levelColor }}>{item.level}</span>
        <span className="text-app-text-secondary text-xs">{item.topic}</span>
        {item.hint && <span className="text-app-text-muted text-xs">· {item.hint}</span>}
      </div>

      {/* Play buttons */}
      <div className="flex gap-3 mb-5">
        <button onClick={() => handlePlay(false)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all whitespace-nowrap ${isPlaying ? "bg-app-accent-primary/30 text-app-accent-primary" : "bg-app-accent-primary text-[#141720] hover:opacity-90"}`}>
          <i className={isPlaying ? "ri-pause-circle-line" : "ri-play-circle-line"}></i>
          {isPlaying ? "Ðang phát..." : "Nghe"}
        </button>
        <button onClick={() => handlePlay(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/8 hover:bg-white/12 text-white/60 hover:text-white text-sm cursor-pointer transition-all whitespace-nowrap">
          <i className="ri-speed-line"></i>
          Ch?m
        </button>
        {playCount > 0 && (
          <span className="flex items-center text-app-text-muted text-xs ml-auto">
            <i className="ri-repeat-line mr-1"></i>{playCount} l?n
          </span>
        )}
      </div>

      {/* Input */}
      {!revealed ? (
        <div>
          <p className="text-white/50 text-xs mb-2">Vi?t l?i nh?ng gì b?n nghe du?c:</p>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Gõ ti?ng Hàn ? dây..."
            rows={3}
            className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm outline-none resize-none placeholder-white/20 focus:border-white/20 mb-4"
          />
          <div className="flex gap-3">
            <button onClick={handleCheck} disabled={!input.trim()}
              className="flex-1 py-3 rounded-xl bg-app-accent-primary text-[#141720] font-bold text-sm disabled:opacity-30 cursor-pointer whitespace-nowrap">
              Ki?m tra
            </button>
            <button onClick={() => { setRevealed(true); setResult(null); }}
              className="px-4 py-3 rounded-xl bg-white/8 hover:bg-white/12 text-white/50 text-sm cursor-pointer whitespace-nowrap">
              Xem dáp án
            </button>
          </div>
        </div>
      ) : (
        <div>
          {result && (
            <div className={`p-4 rounded-xl border mb-4 ${result.correct ? "border-emerald-500/30 bg-emerald-500/5" : result.similarity >= 70 ? "border-amber-500/30 bg-amber-500/5" : "border-rose-500/30 bg-rose-500/5"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-bold ${result.correct ? "text-app-accent-success" : result.similarity >= 70 ? "text-amber-400" : "text-rose-400"}`}>
                  {result.correct ? "Chính xác!" : `${result.similarity}% dúng`}
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className={`text-sm ${i < Math.round(result.similarity / 20) ? "ri-star-fill text-app-accent-primary" : "ri-star-line text-white/15"}`}></i>
                  ))}
                </div>
              </div>
              {!result.correct && (
                <div className="text-sm">
                  <p className="text-app-text-secondary text-xs mb-1">B?n vi?t:</p>
                  <p className="text-white/60 mb-2">{input}</p>
                </div>
              )}
            </div>
          )}

          {/* Answer */}
          <div className="p-4 rounded-xl bg-app-card/50 border border-app-border mb-4">
            <p className="text-app-text-secondary text-xs mb-2">Ðáp án dúng:</p>
            <p className="text-white font-medium text-base leading-8">{item.korean}</p>
            <p className="text-app-text-secondary text-sm mt-1 italic">{item.vietnamese}</p>
          </div>

          <button onClick={() => { setInput(""); setRevealed(false); setResult(null); setPlayCount(0); }}
            className="w-full py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-white/60 text-sm cursor-pointer whitespace-nowrap">
            <i className="ri-refresh-line mr-2"></i>Th? l?i
          </button>
        </div>
      )}
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function DictationPracticePage() {
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [mode, setMode] = useState<"browse" | "practice">("browse");

  const levelConfig: Record<string, { color: string; label: string }> = {
    A1: { color: "#34d399", label: "A1" },
    A2: { color: "#6ee7b7", label: "A2" },
    B1: { color: "#fbbf24", label: "B1" },
    B2: { color: "#f59e0b", label: "B2" },
    C1: { color: "#f87171", label: "C1" },
  };

  const filtered = selectedLevel === "all" ? dictationItems : dictationItems.filter(d => d.level === selectedLevel);
  const current = filtered[currentIdx];
  const avgScore = Object.values(scores).length > 0
    ? Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / Object.values(scores).length)
    : 0;

  const handleComplete = (score: number) => {
    if (current) setScores(prev => ({ ...prev, [current.id]: score }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Luy?n nghe chép chính t?</h1>
          <p className="text-white/50 text-sm">Nghe và vi?t l?i ti?ng Hàn — so sánh v?i dáp án d? c?i thi?n chính t?</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Ðã luy?n", value: Object.keys(scores).length, icon: "ri-checkbox-circle-line", color: "#34d399" },
            { label: "Ði?m TB", value: `${avgScore}%`, icon: "ri-percent-line", color: "app-accent-primary" },
            { label: "T?ng câu", value: dictationItems.length, icon: "ri-list-check", color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-app-border bg-app-surface/50 p-4 text-center">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${s.color}20` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
              </div>
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Level filter */}
        <div className="flex gap-2 flex-wrap mb-5">
          <button onClick={() => { setSelectedLevel("all"); setCurrentIdx(0); }}
            className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${selectedLevel === "all" ? "bg-white/15 text-white" : "bg-app-card/50 text-white/50 hover:bg-white/8"}`}>
            T?t c? ({dictationItems.length})
          </button>
          {Object.entries(levelConfig).map(([lvl, cfg]) => {
            const count = dictationItems.filter(d => d.level === lvl).length;
            return (
              <button key={lvl} onClick={() => { setSelectedLevel(lvl); setCurrentIdx(0); }}
                className={`px-4 py-2 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap`}
                style={selectedLevel === lvl ? { backgroundColor: cfg.color, color: "#141720" } : { backgroundColor: `${cfg.color}15`, color: cfg.color }}>
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-app-card/50 hover:bg-app-card/70 text-white/50 disabled:opacity-30 cursor-pointer transition-colors">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <span className="text-white/50 text-sm">{currentIdx + 1} / {filtered.length}</span>
            <button onClick={() => setCurrentIdx(i => Math.min(filtered.length - 1, i + 1))} disabled={currentIdx >= filtered.length - 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-app-card/50 hover:bg-app-card/70 text-white/50 disabled:opacity-30 cursor-pointer transition-colors">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1 flex-wrap max-w-xs justify-end">
            {filtered.slice(0, 12).map((item, i) => (
              <button key={item.id} onClick={() => setCurrentIdx(i)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === currentIdx ? "bg-app-accent-primary w-4" : scores[item.id] ? "bg-emerald-400" : "bg-white/15"}`} />
            ))}
          </div>
        </div>

        {/* Current card */}
        {current && (
          <DictationCard key={current.id} item={current} onComplete={handleComplete} />
        )}

        {/* All items list */}
        <div className="mt-6">
          <p className="text-app-text-secondary text-xs font-semibold tracking-normal mb-3">T?t c? câu luy?n t?p</p>
          <div className="space-y-2">
            {filtered.map((item, i) => (
              <button key={item.id} onClick={() => setCurrentIdx(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left cursor-pointer transition-all ${i === currentIdx ? "border-app-accent-primary/30 bg-app-accent-primary/5" : "border-app-border bg-app-surface/50 hover:bg-app-card/50"}`}>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${item.levelColor}20`, color: item.levelColor }}>{item.level}</span>
                <span className="text-white/70 text-sm flex-1 truncate">{item.korean}</span>
                {scores[item.id] !== undefined && (
                  <span className={`text-xs font-bold flex-shrink-0 ${scores[item.id] >= 95 ? "text-app-accent-success" : scores[item.id] >= 70 ? "text-amber-400" : "text-rose-400"}`}>
                    {scores[item.id]}%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

