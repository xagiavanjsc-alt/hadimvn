import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface TranslationItem {
  id: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1";
  levelColor: string;
  topic: string;
  type: "kr-vi" | "vi-kr";
  source: string;
  answer: string;
  hints: string[];
  notes?: string;
}

const items: TranslationItem[] = [
  // A1 KR?VI
  { id: "t1", level: "A1", levelColor: "#34d399", topic: "Chào h?i", type: "kr-vi", source: "?????. ?? ?????.", answer: "Xin chào. Tôi là h?c sinh.", hints: ["????? = Xin chào", "?? = Tôi là", "?? = h?c sinh"] },
  { id: "t2", level: "A1", levelColor: "#34d399", topic: "Gia dình", type: "kr-vi", source: "?? ??? ? ????.", answer: "Gia dình tôi có b?n ngu?i.", hints: ["?? = c?a tôi/chúng tôi", "?? = gia dình", "? ? = b?n ngu?i"] },
  { id: "t3", level: "A1", levelColor: "#34d399", topic: "S? thích", type: "vi-kr", source: "Tôi thích an com Hàn Qu?c.", answer: "?? ?? ?? ????.", hints: ["???? = thích", "?? = Hàn Qu?c", "? = com"] },
  // A2
  { id: "t4", level: "A2", levelColor: "#6ee7b7", topic: "Th?i ti?t", type: "kr-vi", source: "?? ??? ??? ?? ? ? ???.", answer: "Hôm nay tr?i âm u và có v? s? mua.", hints: ["??? = âm u", "?? ?? = tr?i mua", "-(?)? ? ?? = có v? s?"] },
  { id: "t5", level: "A2", levelColor: "#6ee7b7", topic: "Mua s?m", type: "vi-kr", source: "Cái áo này bao nhiêu ti?n? Có màu khác không?", answer: "? ?? ????? ?? ??? ????", hints: ["???? = bao nhiêu ti?n", "?? = khác", "?? = màu s?c"] },
  { id: "t6", level: "A2", levelColor: "#6ee7b7", topic: "K? ho?ch", type: "kr-vi", source: "??? ??? ?? ??? ?? ? ???.", answer: "Cu?i tu?n tôi s? di xem phim cùng b?n.", hints: ["-? ?? = di d? làm gì", "?? = cùng nhau", "-(?)? ??? = s?"] },
  // B1
  { id: "t7", level: "B1", levelColor: "#fbbf24", topic: "Công vi?c", type: "kr-vi", source: "?? ???? ???? ???? ??? ?? ? ? ???.", answer: "Deadline d? án l?n này dang d?n g?n nên có v? ph?i làm thêm gi?.", hints: ["??? = deadline", "???? = d?n g?n", "?? = làm thêm gi?"] },
  { id: "t8", level: "B1", levelColor: "#fbbf24", topic: "S?c kh?e", type: "vi-kr", source: "D?o này tôi b? stress nhi?u nên ng? không ngon và hay m?t m?i.", answer: "?? ????? ?? ??? ?? ? ? ?? ?? ????.", hints: ["?? = d?o này", "????? ?? = b? stress", "-?/?? = vì nên"] },
  { id: "t9", level: "B1", levelColor: "#fbbf24", topic: "Du l?ch", type: "kr-vi", source: "??? ?? ??? ???? ?? ????? ???? ?? ???.", answer: "Ðây là l?n d?u tôi d?n Hàn Qu?c, có nhi?u th? d? xem và ?m th?c phong phú nên th?c s? tuy?t.", hints: ["?? = l?n d?u", "??? = th? d? xem", "???? = phong phú"] },
  // B2
  { id: "t10", level: "B2", levelColor: "#f59e0b", topic: "Xã h?i", type: "kr-vi", source: "?? ???? ?? ??? ???? ?? ??? ?? ???? ?????.", answer: "Trong xã h?i hi?n d?i, k? nang giao ti?p là y?u t? thi?t y?u d? có cu?c s?ng công s? thành công.", hints: ["?? ?? = k? nang giao ti?p", "??? = thi?t y?u", "?? = y?u t?"] },
  { id: "t11", level: "B2", levelColor: "#f59e0b", topic: "Môi tru?ng", type: "vi-kr", source: "Bi?n d?i khí h?u là v?n d? toàn c?u dòi h?i s? h?p tác qu?c t? d? gi?i quy?t.", answer: "?? ??? ???? ?? ??? ??? ??? ? ???? ?????.", hints: ["?? ?? = bi?n d?i khí h?u", "??? ?? = h?p tác qu?c t?", "? ??? = toàn c?u"] },
  // C1
  { id: "t12", level: "C1", levelColor: "#f87171", topic: "Tri?t h?c", type: "kr-vi", source: "??? ??? ???? ???? ?? ??? ??? ???? ??? ??????.", answer: "Con ngu?i là d?ng v?t xã h?i, hình thành b?n ngã và tìm ki?m ý nghia trong m?i quan h? v?i ngu?i khác.", hints: ["??? ?? = d?ng v?t xã h?i", "??? ???? = hình thành b?n ngã", "??? ?? = tìm ki?m ý nghia"] },
  { id: "t13", level: "C1", levelColor: "#f87171", topic: "Kinh t?", type: "vi-kr", source: "Toàn c?u hóa mang l?i c? co h?i l?n thách th?c cho các n?n kinh t? dang phát tri?n.", answer: "???? ????? ??? ??? ??? ??? ??????.", hints: ["??? = toàn c?u hóa", "????? = nu?c dang phát tri?n", "??? = d?ng th?i"] },
];

// --- Similarity check ---------------------------------------------------------
function checkSimilarity(input: string, answer: string): number {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ");
  const a = normalize(input);
  const b = normalize(answer);
  if (a === b) return 100;
  const aWords = new Set(a.split(" "));
  const bWords = b.split(" ");
  const matches = bWords.filter(w => aWords.has(w)).length;
  return Math.round((matches / bWords.length) * 100);
}

const levelConfig: Record<string, { color: string; label: string }> = {
  A1: { color: "#34d399", label: "A1" },
  A2: { color: "#6ee7b7", label: "A2" },
  B1: { color: "#fbbf24", label: "B1" },
  B2: { color: "#f59e0b", label: "B2" },
  C1: { color: "#f87171", label: "C1" },
};

export default function TranslationPracticePage() {
  const [levelFilter, setLevelFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "kr-vi" | "vi-kr">("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});

  const filtered = useMemo(() => items.filter(it => {
    const matchLevel = levelFilter === "all" || it.level === levelFilter;
    const matchType = typeFilter === "all" || it.type === typeFilter;
    return matchLevel && matchType;
  }), [levelFilter, typeFilter]);

  const current = filtered[currentIdx];
  const avgScore = Object.values(scores).length > 0
    ? Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / Object.values(scores).length)
    : 0;

  const handleCheck = () => {
    if (!current || !input.trim()) return;
    const sim = checkSimilarity(input, current.answer);
    setScores(prev => ({ ...prev, [current.id]: sim }));
    setSubmitted(true);
  };

  const handleNext = () => {
    setInput("");
    setSubmitted(false);
    setShowHints(false);
    setCurrentIdx(i => Math.min(filtered.length - 1, i + 1));
  };

  const handleTTS = (text: string, lang: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = lang;
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  const similarity = submitted && current ? checkSimilarity(input, current.answer) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-white font-bold text-2xl mb-1">Luy?n d?ch Hàn-Vi?t</h1>
          <p className="text-white/50 text-sm">D?ch câu và do?n van theo c?p d? — c? Hàn?Vi?t và Vi?t?Hàn</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Ðã d?ch", value: Object.keys(scores).length, icon: "ri-translate-2", color: "app-accent-primary" },
            { label: "Ði?m TB", value: `${avgScore}%`, icon: "ri-percent-line", color: "#34d399" },
            { label: "T?ng câu", value: items.length, icon: "ri-list-check", color: "#a78bfa" },
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

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex gap-1 p-1 bg-app-card/50 rounded-xl">
            {(["all", "kr-vi", "vi-kr"] as const).map(t => (
              <button key={t} onClick={() => { setTypeFilter(t); setCurrentIdx(0); setInput(""); setSubmitted(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${typeFilter === t ? "bg-app-accent-primary text-[#141720]" : "text-white/50 hover:text-white/80"}`}>
                {t === "all" ? "T?t c?" : t === "kr-vi" ? "Hàn ? Vi?t" : "Vi?t ? Hàn"}
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {["all", "A1", "A2", "B1", "B2", "C1"].map(lvl => (
              <button key={lvl} onClick={() => { setLevelFilter(lvl); setCurrentIdx(0); setInput(""); setSubmitted(false); }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all whitespace-nowrap"
                style={levelFilter === lvl
                  ? (lvl === "all" ? { backgroundColor: "rgba(255,255,255,0.15)", color: "white" } : { backgroundColor: levelConfig[lvl]?.color, color: "#141720" })
                  : { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
                {lvl === "all" ? "T?t c?" : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => { setCurrentIdx(i => Math.max(0, i - 1)); setInput(""); setSubmitted(false); setShowHints(false); }}
              disabled={currentIdx === 0}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-app-card/50 hover:bg-app-card/70 text-white/50 disabled:opacity-30 cursor-pointer">
              <i className="ri-arrow-left-s-line"></i>
            </button>
            <span className="text-white/50 text-sm">{currentIdx + 1} / {filtered.length}</span>
            <button onClick={() => { setCurrentIdx(i => Math.min(filtered.length - 1, i + 1)); setInput(""); setSubmitted(false); setShowHints(false); }}
              disabled={currentIdx >= filtered.length - 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-app-card/50 hover:bg-app-card/70 text-white/50 disabled:opacity-30 cursor-pointer">
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
          <div className="flex gap-1">
            {filtered.slice(0, 13).map((it, i) => (
              <button key={it.id} onClick={() => { setCurrentIdx(i); setInput(""); setSubmitted(false); setShowHints(false); }}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === currentIdx ? "bg-app-accent-primary w-4" : scores[it.id] ? "bg-emerald-400" : "bg-white/15"}`} />
            ))}
          </div>
        </div>

        {current && (
          <div className="rounded-2xl border border-app-border bg-app-surface/50 p-6">
            {/* Level + type badge */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${current.levelColor}20`, color: current.levelColor }}>{current.level}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${current.type === "kr-vi" ? "bg-amber-500/15 text-amber-400" : "bg-sky-500/15 text-sky-400"}`}>
                {current.type === "kr-vi" ? "Hàn ? Vi?t" : "Vi?t ? Hàn"}
              </span>
              <span className="text-app-text-muted text-xs">{current.topic}</span>
            </div>

            {/* Source text */}
            <div className="p-4 rounded-xl bg-app-card/50 border border-app-border mb-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-app-text-secondary text-xs mb-2">{current.type === "kr-vi" ? "Ti?ng Hàn" : "Ti?ng Vi?t"}</p>
                  <p className="text-white font-medium text-lg leading-8">{current.source}</p>
                </div>
                {current.type === "kr-vi" && (
                  <button onClick={() => handleTTS(current.source, "ko-KR")}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/8 hover:bg-white/15 text-app-text-secondary hover:text-white/70 cursor-pointer flex-shrink-0">
                    <i className="ri-volume-up-line"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Input */}
            {!submitted ? (
              <>
                <p className="text-white/50 text-xs mb-2">D?ch sang {current.type === "kr-vi" ? "ti?ng Vi?t" : "ti?ng Hàn"}:</p>
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  placeholder={current.type === "kr-vi" ? "Nh?p b?n d?ch ti?ng Vi?t..." : "Nh?p b?n d?ch ti?ng Hàn..."}
                  rows={3}
                  className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm outline-none resize-none placeholder-white/20 focus:border-white/20 mb-4" />

                {/* Hints */}
                <button onClick={() => setShowHints(v => !v)}
                  className="flex items-center gap-2 text-app-text-secondary hover:text-white/60 text-xs mb-4 cursor-pointer transition-colors">
                  <i className="ri-lightbulb-line text-app-accent-primary"></i>
                  {showHints ? "?n g?i ý" : "Xem g?i ý"}
                </button>
                {showHints && (
                  <div className="grid grid-cols-1 gap-1.5 mb-4">
                    {current.hints.map((h, i) => (
                      <div key={i} className="px-3 py-2 rounded-lg bg-app-accent-primary/5 border border-app-accent-primary/15">
                        <p className="text-white/60 text-xs">{h}</p>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={handleCheck} disabled={!input.trim()}
                  className="w-full py-3 rounded-xl bg-app-accent-primary text-[#141720] font-bold text-sm disabled:opacity-30 cursor-pointer whitespace-nowrap">
                  Ki?m tra b?n d?ch
                </button>
              </>
            ) : (
              <>
                {/* Result */}
                <div className={`p-4 rounded-xl border mb-4 ${similarity >= 80 ? "border-emerald-500/30 bg-emerald-500/5" : similarity >= 50 ? "border-amber-500/30 bg-amber-500/5" : "border-rose-500/30 bg-rose-500/5"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-bold text-sm ${similarity >= 80 ? "text-app-accent-success" : similarity >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                      {similarity >= 80 ? "R?t t?t!" : similarity >= 50 ? "Khá ?n!" : "C?n c?i thi?n"} — {similarity}% kh?p
                    </span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`text-sm ${i < Math.round(similarity / 20) ? "ri-star-fill text-app-accent-primary" : "ri-star-line text-white/15"}`}></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-white/50 text-xs mb-1">B?n d?ch c?a b?n:</p>
                  <p className="text-white/70 text-sm mb-3">{input}</p>
                </div>

                {/* Correct answer */}
                <div className="p-4 rounded-xl bg-app-card/50 border border-app-border mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-app-text-secondary text-xs mb-1">Ðáp án tham kh?o:</p>
                      <p className="text-white font-medium text-base leading-7">{current.answer}</p>
                      {current.notes && <p className="text-app-text-secondary text-xs mt-2 italic">{current.notes}</p>}
                    </div>
                    {current.type === "vi-kr" && (
                      <button onClick={() => handleTTS(current.answer, "ko-KR")}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/8 hover:bg-white/15 text-app-text-secondary hover:text-white/70 cursor-pointer flex-shrink-0">
                        <i className="ri-volume-up-line"></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { setInput(""); setSubmitted(false); setShowHints(false); }}
                    className="flex-1 py-2.5 rounded-xl bg-white/8 hover:bg-white/12 text-white/60 text-sm cursor-pointer whitespace-nowrap">
                    Th? l?i
                  </button>
                  <button onClick={handleNext} disabled={currentIdx >= filtered.length - 1}
                    className="flex-1 py-2.5 rounded-xl bg-app-accent-primary text-[#141720] font-bold text-sm disabled:opacity-30 cursor-pointer whitespace-nowrap">
                    Câu ti?p <i className="ri-arrow-right-line ml-1"></i>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* All items list */}
        <div className="mt-6">
          <p className="text-app-text-secondary text-xs font-semibold tracking-normal mb-3">T?t c? câu ({filtered.length})</p>
          <div className="space-y-2">
            {filtered.map((it, i) => (
              <button key={it.id} onClick={() => { setCurrentIdx(i); setInput(""); setSubmitted(false); setShowHints(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left cursor-pointer transition-all ${i === currentIdx ? "border-app-accent-primary/30 bg-app-accent-primary/5" : "border-app-border bg-app-surface/50 hover:bg-app-card/50"}`}>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${it.levelColor}20`, color: it.levelColor }}>{it.level}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${it.type === "kr-vi" ? "bg-amber-500/15 text-amber-400" : "bg-sky-500/15 text-sky-400"}`}>
                  {it.type === "kr-vi" ? "KR?VI" : "VI?KR"}
                </span>
                <span className="text-white/60 text-sm flex-1 truncate">{it.source}</span>
                {scores[it.id] !== undefined && (
                  <span className={`text-xs font-bold flex-shrink-0 ${scores[it.id] >= 80 ? "text-app-accent-success" : scores[it.id] >= 50 ? "text-amber-400" : "text-rose-400"}`}>
                    {scores[it.id]}%
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

