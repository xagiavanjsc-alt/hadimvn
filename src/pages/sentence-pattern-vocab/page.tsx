import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface SentencePattern {
  id: string;
  pattern: string;
  patternVi: string;
  level: string;
  levelColor: string;
  category: string;
  explanation: string;
  examples: { korean: string; vietnamese: string; highlight: string[] }[];
  keyVocab: { word: string; meaning: string; pos: string }[];
}

const patterns: SentencePattern[] = [
  {
    id: "p1", pattern: "N?/? N???/??", patternVi: "N là N", level: "A1", levelColor: "#34d399",
    category: "Ð?nh nghia",
    explanation: "Câu d?nh nghia co b?n. ?/? là tr? t? ch? d?, ???/?? là 'là' (l?ch s?).",
    examples: [
      { korean: "?? ?????.", vietnamese: "Tôi là h?c sinh.", highlight: ["??", "?????"] },
      { korean: "??? ????.", vietnamese: "Ðây là sách.", highlight: ["???", "????"] },
      { korean: "???? ?????.", vietnamese: "Ti?ng Hàn thú v?.", highlight: ["????", "?????"] },
    ],
    keyVocab: [
      { word: "?", meaning: "tôi (khiêm t?n)", pos: "Ð?i t?" },
      { word: "??", meaning: "h?c sinh", pos: "Danh t?" },
      { word: "??", meaning: "cái này", pos: "Ð?i t?" },
      { word: "?", meaning: "sách", pos: "Danh t?" },
    ],
  },
  {
    id: "p2", pattern: "V-? ??", patternVi: "Mu?n làm gì", level: "A2", levelColor: "#6ee7b7",
    category: "Mong mu?n",
    explanation: "Di?n d?t mong mu?n, u?c mu?n. G?n -? ?? vào sau g?c d?ng t?.",
    examples: [
      { korean: "??? ?? ???.", vietnamese: "Tôi mu?n di Hàn Qu?c.", highlight: ["?? ???"] },
      { korean: "???? ? ?? ???.", vietnamese: "Tôi mu?n nói ti?ng Hàn gi?i.", highlight: ["?? ???"] },
      { korean: "??? ??? ?? ???.", vietnamese: "Tôi mu?n an d? an ngon.", highlight: ["?? ???"] },
    ],
    keyVocab: [
      { word: "??", meaning: "di", pos: "Ð?ng t?" },
      { word: "? ??", meaning: "làm gi?i", pos: "Ð?ng t?" },
      { word: "???", meaning: "ngon", pos: "Tính t?" },
      { word: "??", meaning: "d? an", pos: "Danh t?" },
    ],
  },
  {
    id: "p3", pattern: "V-(?)? ? ??/??", patternVi: "Có th? / Không th? làm gì", level: "A2", levelColor: "#6ee7b7",
    category: "Kh? nang",
    explanation: "Di?n d?t kh? nang. Dùng -? ? ?? (có th?) ho?c -? ? ?? (không th?).",
    examples: [
      { korean: "???? ?? ? ???.", vietnamese: "Tôi có th? nói ti?ng Hàn.", highlight: ["?? ? ???"] },
      { korean: "?? ? ? ???.", vietnamese: "Bây gi? tôi không th? di.", highlight: ["? ? ???"] },
      { korean: "??? ? ? ????", vietnamese: "B?n có th? boi không?", highlight: ["? ? ???"] },
    ],
    keyVocab: [
      { word: "???", meaning: "nói", pos: "Ð?ng t?" },
      { word: "??", meaning: "boi l?i", pos: "Danh t?" },
      { word: "??", meaning: "bây gi?", pos: "Tr?ng t?" },
    ],
  },
  {
    id: "p4", pattern: "A/V-?/??", patternVi: "Vì... nên... / Và r?i...", level: "B1", levelColor: "#fbbf24",
    category: "Nguyên nhân",
    explanation: "Di?n d?t nguyên nhân-k?t qu? ho?c chu?i hành d?ng. Không dùng v?i m?nh l?nh/d? ngh?.",
    examples: [
      { korean: "?? ??? ?? ????.", vietnamese: "Vì dói nên tôi dã an com.", highlight: ["???"] },
      { korean: "?? ?? ?? ????.", vietnamese: "Vì tr?i mua nên tôi ? nhà.", highlight: ["??"] },
      { korean: "???? ?? ?????.", vietnamese: "Tôi d?n thu vi?n r?i h?c bài.", highlight: ["??"] },
    ],
    keyVocab: [
      { word: "?? ???", meaning: "dói b?ng", pos: "Tính t?" },
      { word: "?? ??", meaning: "tr?i mua", pos: "Ð?ng t?" },
      { word: "???", meaning: "thu vi?n", pos: "Danh t?" },
    ],
  },
  {
    id: "p5", pattern: "V-(?)?", patternVi: "N?u... thì...", level: "B1", levelColor: "#fbbf24",
    category: "Ði?u ki?n",
    explanation: "Di?n d?t di?u ki?n gi? d?nh. G?n -?? (sau ph? âm) ho?c -? (sau nguyên âm).",
    examples: [
      { korean: "??? ??? ?? ??.", vietnamese: "N?u có th?i gian thì di cùng nhé.", highlight: ["???"] },
      { korean: "??? ???? ??? ? ???.", vietnamese: "N?u h?c cham ch? thì có th? d?u.", highlight: ["????"] },
      { korean: "??? ??? ??? ??.", vietnamese: "N?u th?i ti?t d?p thì di dã ngo?i.", highlight: ["???"] },
    ],
    keyVocab: [
      { word: "??", meaning: "th?i gian", pos: "Danh t?" },
      { word: "???", meaning: "cham ch?", pos: "Tr?ng t?" },
      { word: "????", meaning: "d?u/vu?t qua", pos: "Ð?ng t?" },
      { word: "??", meaning: "dã ngo?i", pos: "Danh t?" },
    ],
  },
  {
    id: "p6", pattern: "V-? ? ??", patternVi: "Có v? nhu / Du?ng nhu", level: "B2", levelColor: "#f59e0b",
    category: "Ph?ng doán",
    explanation: "Di?n d?t ph?ng doán, suy lu?n d?a trên quan sát. Hi?n t?i: -? ? ??, Quá kh?: -(?)? ? ??.",
    examples: [
      { korean: "? ??? ?? ? ? ???.", vietnamese: "Có v? ngu?i dó dang t?c gi?n.", highlight: ["? ? ???"] },
      { korean: "?? ?? ? ? ???.", vietnamese: "Hôm nay có v? s? mua.", highlight: ["? ? ???"] },
      { korean: "? ??? ???? ? ???.", vietnamese: "Có v? b? phim dó thú v?.", highlight: ["???? ? ???"] },
    ],
    keyVocab: [
      { word: "?? ??", meaning: "t?c gi?n", pos: "Ð?ng t?" },
      { word: "?? ??", meaning: "tr?i mua", pos: "Ð?ng t?" },
      { word: "????", meaning: "thú v?", pos: "Tính t?" },
    ],
  },
  {
    id: "p7", pattern: "V-?? ??", patternVi: "Làm sao d? / C? g?ng làm", level: "C1", levelColor: "#f87171",
    category: "M?c dích",
    explanation: "Di?n d?t m?c dích ho?c ch? th? gián ti?p. Thu?ng dùng trong van vi?t và l?i nói trang tr?ng.",
    examples: [
      { korean: "??? ????? ?????.", vietnamese: "Hãy t?p th? d?c d? duy trì s?c kh?e.", highlight: ["?????"] },
      { korean: "???? ??? ?????.", vietnamese: "Hãy c?n th?n d? không m?c l?i.", highlight: ["???"] },
      { korean: "??? ????? ??? ???.", vietnamese: "Hãy gi?i thích d? m?i ngu?i hi?u.", highlight: ["?????"] },
    ],
    keyVocab: [
      { word: "????", meaning: "duy trì", pos: "Ð?ng t?" },
      { word: "????", meaning: "m?c l?i", pos: "Ð?ng t?" },
      { word: "????", meaning: "c?n th?n", pos: "Ð?ng t?" },
      { word: "????", meaning: "gi?i thích", pos: "Ð?ng t?" },
    ],
  },
];

export default function SentencePatternVocabPage() {
  const [selectedPattern, setSelectedPattern] = useState<SentencePattern>(patterns[0]);
  const [levelFilter, setLevelFilter] = useState("all");
  const [learnedIds, setLearnedIds] = useState<Set<string>>(new Set());
  const [quizMode, setQuizMode] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const filtered = useMemo(() => levelFilter === "all" ? patterns : patterns.filter(p => p.level === levelFilter), [levelFilter]);

  const handleTTS = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "ko-KR"; utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  };

  const quizPattern = patterns[quizIdx % patterns.length];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-white font-bold text-2xl mb-1">T? v?ng theo c?u trúc câu</h1>
            <p className="text-white/50 text-sm">H?c t? v?ng qua các m?u câu thông d?ng TOPIK — hi?u ng? c?nh th?c t?</p>
          </div>
          <button onClick={() => { setQuizMode(v => !v); setQuizIdx(0); setShowAnswer(false); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap ${quizMode ? "bg-app-card/70 text-white/60" : "bg-app-accent-primary text-[#141720]"}`}>
            {quizMode ? "Thoát Quiz" : "Ch? d? Quiz"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "M?u câu", value: patterns.length, color: "app-accent-primary" },
            { label: "Ðã h?c", value: learnedIds.size, color: "#34d399" },
            { label: "T? v?ng", value: patterns.reduce((s, p) => s + p.keyVocab.length, 0), color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-app-border bg-app-surface/50 p-4 text-center">
              <p className="font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {quizMode ? (
          /* -- Quiz Mode -- */
          <div className="rounded-2xl border border-app-border bg-app-surface/50 p-8 text-center">
            <p className="text-app-text-secondary text-sm mb-6">{quizIdx + 1} / {patterns.length}</p>
            <div className="mb-6">
              <p className="text-app-text-secondary text-sm mb-3">M?u câu này có nghia gì?</p>
              <p className="text-white font-bold text-4xl mb-2">{quizPattern.pattern}</p>
              <p className="text-app-text-muted text-sm">{quizPattern.category} · {quizPattern.level}</p>
            </div>
            {!showAnswer ? (
              <button onClick={() => setShowAnswer(true)}
                className="px-8 py-3 rounded-xl bg-app-accent-primary text-[#141720] font-bold cursor-pointer whitespace-nowrap mb-6">
                Xem dáp án
              </button>
            ) : (
              <div className="mb-6">
                <div className="p-4 rounded-xl bg-app-accent-primary/5 border border-app-accent-primary/15 mb-4">
                  <p className="text-app-accent-primary font-bold text-xl">{quizPattern.patternVi}</p>
                  <p className="text-white/50 text-sm mt-1">{quizPattern.explanation}</p>
                </div>
                <div className="space-y-2">
                  {quizPattern.examples.slice(0, 2).map((ex, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-app-card/50 border border-app-border">
                      <p className="text-white text-sm flex-1 text-left">{ex.korean}</p>
                      <button onClick={() => handleTTS(ex.korean)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/8 text-app-text-secondary cursor-pointer flex-shrink-0">
                        <i className="ri-volume-up-line text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setQuizIdx(i => Math.max(0, i - 1)); setShowAnswer(false); }}
                disabled={quizIdx === 0}
                className="flex-1 py-2.5 rounded-xl bg-white/8 text-white/60 text-sm cursor-pointer disabled:opacity-30 whitespace-nowrap">
                Tru?c
              </button>
              <button onClick={() => { setQuizIdx(i => i + 1); setShowAnswer(false); }}
                className="flex-1 py-2.5 rounded-xl bg-app-accent-primary text-[#141720] font-bold text-sm cursor-pointer whitespace-nowrap">
                Ti?p theo
              </button>
            </div>
          </div>
        ) : (
          /* -- Browse Mode -- */
          <div className="flex gap-5">
            {/* Pattern list */}
            <div className="w-56 flex-shrink-0">
              <div className="flex gap-1 flex-wrap mb-3">
                {["all", "A1", "A2", "B1", "B2", "C1"].map(l => (
                  <button key={l} onClick={() => setLevelFilter(l)}
                    className="px-2 py-1 rounded-full text-[10px] font-medium cursor-pointer whitespace-nowrap"
                    style={levelFilter === l ? { backgroundColor: "rgba(255,255,255,0.15)", color: "white" } : { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}>
                    {l === "all" ? "T?t c?" : l}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                {filtered.map(p => (
                  <button key={p.id} onClick={() => setSelectedPattern(p)}
                    className={`w-full flex items-start gap-2 px-3 py-3 rounded-xl border text-left cursor-pointer transition-all ${selectedPattern.id === p.id ? "border-app-accent-primary/30 bg-app-accent-primary/5" : "border-app-border bg-app-surface/50 hover:bg-app-card/50"}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">{p.pattern}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${p.levelColor}20`, color: p.levelColor }}>{p.level}</span>
                        <span className="text-app-text-muted text-[9px]">{p.category}</span>
                      </div>
                    </div>
                    {learnedIds.has(p.id) && <i className="ri-checkbox-circle-fill text-app-accent-success text-sm flex-shrink-0 mt-0.5"></i>}
                  </button>
                ))}
              </div>
            </div>

            {/* Detail */}
            <div className="flex-1 min-w-0">
              <div className="rounded-2xl border border-app-border bg-app-surface/50 p-6">
                {/* Pattern header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${selectedPattern.levelColor}20`, color: selectedPattern.levelColor }}>{selectedPattern.level}</span>
                      <span className="text-app-text-secondary text-xs">{selectedPattern.category}</span>
                    </div>
                    <p className="text-white font-bold text-2xl mb-1">{selectedPattern.pattern}</p>
                    <p className="text-app-accent-primary font-semibold">{selectedPattern.patternVi}</p>
                  </div>
                  <button onClick={() => setLearnedIds(prev => { const n = new Set(prev); n.has(selectedPattern.id) ? n.delete(selectedPattern.id) : n.add(selectedPattern.id); return n; })}
                    className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap ${learnedIds.has(selectedPattern.id) ? "bg-emerald-500/20 text-app-accent-success" : "bg-white/8 text-white/50"}`}>
                    {learnedIds.has(selectedPattern.id) ? "Ðã h?c" : "Ðánh d?u"}
                  </button>
                </div>

                {/* Explanation */}
                <div className="p-4 rounded-xl bg-app-card/50 border border-app-border mb-5">
                  <p className="text-app-text-secondary text-xs mb-1">Gi?i thích:</p>
                  <p className="text-white/80 text-sm leading-relaxed">{selectedPattern.explanation}</p>
                </div>

                {/* Examples */}
                <div className="mb-5">
                  <p className="text-app-text-secondary text-xs font-semibold mb-3">Ví d? ({selectedPattern.examples.length}):</p>
                  <div className="space-y-3">
                    {selectedPattern.examples.map((ex, i) => (
                      <div key={i} className="p-4 rounded-xl bg-app-card/50 border border-app-border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-white font-medium text-base mb-1">
                              {ex.korean.split(" ").map((word, wi) => (
                                <span key={wi} className={ex.highlight.some(h => ex.korean.includes(h) && h.includes(word)) ? "text-app-accent-primary" : ""}>{word} </span>
                              ))}
                            </p>
                            <p className="text-white/50 text-sm">{ex.vietnamese}</p>
                          </div>
                          <button onClick={() => handleTTS(ex.korean)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 hover:bg-white/15 text-app-text-secondary cursor-pointer flex-shrink-0">
                            <i className="ri-volume-up-line text-sm"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key vocab */}
                <div>
                  <p className="text-app-text-secondary text-xs font-semibold mb-3">T? v?ng chính ({selectedPattern.keyVocab.length}):</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedPattern.keyVocab.map((v, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-app-card/50 border border-app-border">
                        <button onClick={() => handleTTS(v.word)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/8 text-app-text-secondary cursor-pointer flex-shrink-0">
                          <i className="ri-volume-up-line text-xs"></i>
                        </button>
                        <div className="min-w-0">
                          <p className="text-white font-bold text-sm">{v.word}</p>
                          <p className="text-app-accent-primary text-xs">{v.meaning}</p>
                          <p className="text-app-text-muted text-[10px]">{v.pos}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

