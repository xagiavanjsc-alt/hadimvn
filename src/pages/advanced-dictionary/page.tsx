import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface DictEntry {
  word: string;
  romanization: string;
  pos: string;
  level: string;
  meanings: { meaning: string; examples: { korean: string; vietnamese: string }[] }[];
  synonyms: string[];
  antonyms: string[];
  compounds: { word: string; meaning: string }[];
  note?: string;
  hanja?: string;
}

const DICT_DATA: DictEntry[] = [
  {
    word: "??", romanization: "sa-rang", pos: "??", level: "A1", hanja: "?",
    meanings: [
      { meaning: "Tình yêu, tình c?m yêu thuong", examples: [{ korean: "?? ?? ???.", vietnamese: "Tôi yêu b?n." }, { korean: "???? ??? ???????.", vietnamese: "Tình yêu c?a cha m? là vô di?u ki?n." }] },
      { meaning: "S? quan tâm, cham sóc", examples: [{ korean: "????? ??? ???.", vietnamese: "Hãy cho tr? em tình yêu thuong." }] },
    ],
    synonyms: ["??", "??", "?"], antonyms: ["??", "??", "??"],
    compounds: [{ word: "????", meaning: "Yêu (d?ng t?)" }, { word: "?????", meaning: "Ðáng yêu" }, { word: "????", meaning: "Ðu?c yêu" }, { word: "???", meaning: "Tình yêu d?u tiên" }],
    note: "T? thu?n Hàn, r?t ph? bi?n trong van h?c và âm nh?c Hàn Qu?c.",
  },
  {
    word: "??", romanization: "haeng-bok", pos: "??/???", level: "A2", hanja: "??",
    meanings: [{ meaning: "H?nh phúc, ni?m vui", examples: [{ korean: "??? ??? ??? ???.", vietnamese: "Tôi mu?n xây d?ng m?t gia dình h?nh phúc." }, { korean: "?? ??? ??? ???.", vietnamese: "Tìm h?nh phúc trong nh?ng di?u nh? bé." }] }],
    synonyms: ["??", "???", "??"], antonyms: ["??", "??", "??"],
    compounds: [{ word: "????", meaning: "H?nh phúc (tính t?)" }, { word: "???", meaning: "C?m giác h?nh phúc" }, { word: "????", meaning: "Ch? s? h?nh phúc" }],
    note: "T? Hán Hàn (??). Dùng c? làm danh t? và tính t?.",
  },
  {
    word: "??", romanization: "gong-bu", pos: "??/??", level: "A1", hanja: "??",
    meanings: [{ meaning: "H?c t?p, vi?c h?c", examples: [{ korean: "?? ??? ??? ??.", vietnamese: "Tôi h?c ti?ng Hàn m?i ngày." }, { korean: "??? ?????.", vietnamese: "Vi?c h?c r?t thú v?." }] }],
    synonyms: ["??", "????", "??"], antonyms: ["??", "??"],
    compounds: [{ word: "????", meaning: "H?c (d?ng t?)" }, { word: "???", meaning: "Phòng h?c" }, { word: "????", meaning: "M?t sách" }, { word: "????", meaning: "T? h?c" }],
  },
  {
    word: "????", romanization: "a-reum-dap-da", pos: "???", level: "A2",
    meanings: [{ meaning: "Ð?p, xinh d?p (v? ngo?i hình ho?c tâm h?n)", examples: [{ korean: "??? ??? ?? ?????.", vietnamese: "Mùa thu Hàn Qu?c th?c s? r?t d?p." }, { korean: "??? ??? ???? ?????.", vietnamese: "Cô ?y là ngu?i có tâm h?n d?p." }] }],
    synonyms: ["???", "??", "???"], antonyms: ["????", "???"],
    compounds: [{ word: "????", meaning: "V? d?p (danh t?)" }, { word: "????", meaning: "M?t cách d?p d?" }],
    note: "???? dùng cho v? d?p t?ng th?, sâu s?c hon ??? (ch? ngo?i hình).",
  },
  {
    word: "??", romanization: "saeng-gak", pos: "??/??", level: "A2",
    meanings: [{ meaning: "Suy nghi, ý nghi", examples: [{ korean: "?? ??? ???.", vietnamese: "Tôi có m?t ý hay." }, { korean: "? ??? ????.", vietnamese: "Suy nghi dó sai r?i." }] }, { meaning: "Ký ?c, h?i tu?ng", examples: [{ korean: "?? ??? ??.", vietnamese: "Tôi nh? quê huong." }] }],
    synonyms: ["??", "??", "??"], antonyms: [],
    compounds: [{ word: "????", meaning: "Suy nghi (d?ng t?)" }, { word: "????", meaning: "Nh? ra, n?y ra ý" }, { word: "?????", meaning: "Th? suy nghi" }],
  },
  {
    word: "??", romanization: "no-ryeok", pos: "??/??", level: "B1", hanja: "??",
    meanings: [{ meaning: "N? l?c, c? g?ng", examples: [{ korean: "?? ??? ??? ? ???.", vietnamese: "Không th? thành công n?u không n? l?c." }, { korean: "??? ?? ?????.", vietnamese: "Tôi dã c? g?ng h?t s?c." }] }],
    synonyms: ["??", "??", "??"], antonyms: ["???", "??"],
    compounds: [{ word: "????", meaning: "N? l?c (d?ng t?)" }, { word: "???", meaning: "Ngu?i cham ch?" }, { word: "??? ??", meaning: "Thành qu? c?a n? l?c" }],
    note: "T? Hán Hàn (??). Thu?ng dùng v?i ?? d? t?o d?ng t?.",
  },
  {
    word: "??", romanization: "gyeong-heom", pos: "??/??", level: "B1", hanja: "??",
    meanings: [{ meaning: "Kinh nghi?m, tr?i nghi?m", examples: [{ korean: "??? ??? ????.", vietnamese: "Kinh nghi?m da d?ng r?t quan tr?ng." }, { korean: "?? ??? ??? ???.", vietnamese: "Tôi dã tr?i nghi?m cu?c s?ng ? nu?c ngoài." }] }],
    synonyms: ["??", "??", "??"], antonyms: ["???", "??"],
    compounds: [{ word: "????", meaning: "Tr?i nghi?m (d?ng t?)" }, { word: "???", meaning: "Ngu?i có kinh nghi?m" }, { word: "???", meaning: "Câu chuy?n kinh nghi?m" }],
  },
  {
    word: "??", romanization: "bal-jeon", pos: "??/??", level: "B2", hanja: "??",
    meanings: [{ meaning: "Phát tri?n, ti?n b?", examples: [{ korean: "??? ??? ????.", vietnamese: "S? phát tri?n c?a công ngh? r?t nhanh." }, { korean: "?? ??? ??? ?????.", vietnamese: "Kinh t? Hàn Qu?c dã phát tri?n nhanh chóng." }] }],
    synonyms: ["??", "??", "??"], antonyms: ["??", "??", "??"],
    compounds: [{ word: "????", meaning: "Phát tri?n (d?ng t?)" }, { word: "???", meaning: "Nhà máy di?n" }, { word: "?? ??", meaning: "Phát tri?n kinh t?" }],
  },
];

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  A1: { bg: "rgba(74,222,128,0.15)", text: "#4ade80" },
  A2: { bg: "rgba(52,211,153,0.15)", text: "#34d399" },
  B1: { bg: "rgba(56,189,248,0.15)", text: "#38bdf8" },
  B2: { bg: "rgba(167,139,250,0.15)", text: "#a78bfa" },
  C1: { bg: "rgba(251,146,60,0.15)", text: "#fb923c" },
  C2: { bg: "rgba(248,113,113,0.15)", text: "#f87171" },
};

export default function AdvancedDictionaryPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<DictEntry | null>(null);
  const [suggestions, setSuggestions] = useState<DictEntry[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"meaning" | "examples" | "related">("meaning");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("adv_dict_recent");
    if (saved) { try { setRecentSearches(JSON.parse(saved)); } catch { /* ignore */ } }
  }, []);

  const handleSearch = (word: string) => {
    const found = DICT_DATA.find(d => d.word === word || d.romanization === word.toLowerCase());
    setResult(found || null);
    setShowSuggestions(false);
    setActiveTab("meaning");
    if (found) {
      const updated = [word, ...recentSearches.filter(r => r !== word)].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem("adv_dict_recent", JSON.stringify(updated));
    }
  };

  const handleInput = (val: string) => {
    setQuery(val);
    if (val.length >= 1) {
      const sugg = DICT_DATA.filter(d =>
        d.word.includes(val) || d.romanization.includes(val.toLowerCase()) || d.meanings[0].meaning.includes(val)
      ).slice(0, 6);
      setSuggestions(sugg);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR"; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  return (
    <DashboardLayout title="Tra c?u Hán Hàn" subtitle="T? di?n Hàn-Vi?t nâng cao v?i ví d?, d?ng nghia, trái nghia">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* -- Left: Search + Browse -- */}
          <div className="lg:col-span-1 space-y-3">
            {/* Search box */}
            <div className="rounded-2xl border p-4" style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                  <i className="ri-search-line text-app-text-muted text-sm"></i>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => handleInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch(query)}
                  placeholder="Nh?p t? ti?ng Hàn..."
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                {query && (
                  <button onClick={() => { setQuery(""); setResult(null); setShowSuggestions(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-muted hover:text-white/60 cursor-pointer">
                    <i className="ri-close-line text-sm"></i>
                  </button>
                )}
              </div>
              <button
                onClick={() => handleSearch(query)}
                className="w-full mt-2.5 py-2.5 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-all"
                style={{ backgroundColor: "rgba(232,200,74,0.15)", color: "app-accent-primary", border: "1px solid rgba(232,200,74,0.25)" }}
              >
                <i className="ri-search-line mr-1.5"></i>
                Tra c?u
              </button>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="mt-2 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  {suggestions.map(s => {
                    const lc = LEVEL_COLORS[s.level] || { bg: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.4)" };
                    return (
                      <button
                        key={s.word}
                        onClick={() => { setQuery(s.word); handleSearch(s.word); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 cursor-pointer text-left transition-colors border-b last:border-0"
                        style={{ borderColor: "rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(232,200,74,0.06)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)")}
                      >
                        <span className="text-base font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{s.word}</span>
                        <span className="text-xs flex-1 truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{s.meanings[0].meaning}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{ backgroundColor: lc.bg, color: lc.text }}>{s.level}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="rounded-2xl border p-4" style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}>
                <p className="text-[10px] font-semibold tracking-normal mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Tìm ki?m g?n dây</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(r => (
                    <button
                      key={r}
                      onClick={() => { setQuery(r); handleSearch(r); }}
                      className="px-3 py-1.5 rounded-lg text-sm cursor-pointer whitespace-nowrap transition-colors"
                      style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick browse */}
            <div className="rounded-2xl border p-4" style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-[10px] font-semibold tracking-normal mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>T? ph? bi?n</p>
              <div className="space-y-0.5">
                {DICT_DATA.map(d => {
                  const lc = LEVEL_COLORS[d.level] || { bg: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.4)" };
                  const isActive = result?.word === d.word;
                  return (
                    <button
                      key={d.word}
                      onClick={() => { setQuery(d.word); handleSearch(d.word); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-left transition-all"
                      style={{
                        backgroundColor: isActive ? "rgba(232,200,74,0.10)" : "transparent",
                        border: isActive ? "1px solid rgba(232,200,74,0.20)" : "1px solid transparent",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm" style={{ color: isActive ? "app-accent-primary" : "rgba(255,255,255,0.75)" }}>{d.word}</span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{d.romanization}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: lc.bg, color: lc.text }}>{d.level}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* -- Right: Result -- */}
          <div className="lg:col-span-2">
            {!result ? (
              <div className="rounded-2xl border flex items-center justify-center h-72" style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="text-center">
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl mx-auto mb-3" style={{ backgroundColor: "rgba(232,200,74,0.08)" }}>
                    <i className="ri-search-2-line text-2xl" style={{ color: "rgba(232,200,74,0.4)" }}></i>
                  </div>
                  <p className="font-medium text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Nh?p t? d? tra c?u</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>H? tr? ti?ng Hàn và romanization</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Word header */}
                <div className="rounded-2xl border p-5" style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2 className="text-4xl font-black" style={{ color: "rgba(255,255,255,0.92)" }}>{result.word}</h2>
                        <button
                          onClick={() => speak(result.word)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer transition-all"
                          style={{ backgroundColor: "rgba(232,200,74,0.12)", border: "1px solid rgba(232,200,74,0.20)" }}
                        >
                          <i className="ri-volume-up-line text-base" style={{ color: "app-accent-primary" }}></i>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>[{result.romanization}]</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>{result.pos}</span>
                        {(() => {
                          const lc = LEVEL_COLORS[result.level] || { bg: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.4)" };
                          return <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: lc.bg, color: lc.text }}>{result.level}</span>;
                        })()}
                        {result.hanja && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "rgba(232,200,74,0.12)", color: "app-accent-primary" }}>{result.hanja}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    {result.meanings.map((m, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: "app-accent-primary" }}>{i + 1}.</span>
                        <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{m.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabs */}
                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    {(["meaning", "examples", "related"] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="flex-1 py-3 text-xs font-semibold cursor-pointer whitespace-nowrap transition-all"
                        style={{
                          color: activeTab === tab ? "app-accent-primary" : "rgba(255,255,255,0.35)",
                          borderBottom: activeTab === tab ? "2px solid app-accent-primary" : "2px solid transparent",
                        }}
                      >
                        {tab === "meaning" ? "Nghia & Ví d?" : tab === "examples" ? "Ð?ng/Trái nghia" : "T? ghép"}
                      </button>
                    ))}
                  </div>

                  <div className="p-5">
                    {/* Meaning tab */}
                    {activeTab === "meaning" && (
                      <div className="space-y-5">
                        {result.meanings.map((m, i) => (
                          <div key={i}>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0" style={{ backgroundColor: "rgba(232,200,74,0.15)", color: "app-accent-primary" }}>{i + 1}</span>
                              <p className="font-semibold text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>{m.meaning}</p>
                            </div>
                            <div className="space-y-2 pl-8">
                              {m.examples.map((ex, j) => (
                                <div key={j} className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                  <div className="flex items-start gap-2">
                                    <button onClick={() => speak(ex.korean)} className="w-6 h-6 flex items-center justify-center cursor-pointer flex-shrink-0 mt-0.5 rounded-lg transition-all" style={{ color: "rgba(255,255,255,0.25)" }}>
                                      <i className="ri-volume-up-line text-sm"></i>
                                    </button>
                                    <div>
                                      <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>{ex.korean}</p>
                                      <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{ex.vietnamese}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {result.note && (
                          <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(232,200,74,0.06)", border: "1px solid rgba(232,200,74,0.15)" }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: "app-accent-primary" }}><i className="ri-lightbulb-line mr-1"></i>Ghi chú</p>
                            <p className="text-sm" style={{ color: "rgba(232,200,74,0.7)" }}>{result.note}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Synonyms/Antonyms tab */}
                    {activeTab === "examples" && (
                      <div className="space-y-5">
                        {result.synonyms.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                              <span className="w-5 h-5 flex items-center justify-center rounded-full text-xs" style={{ backgroundColor: "rgba(74,222,128,0.15)", color: "#4ade80" }}>=</span>
                              T? d?ng nghia
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {result.synonyms.map(s => (
                                <button key={s} onClick={() => { setQuery(s); handleSearch(s); }}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap transition-all"
                                  style={{ backgroundColor: "rgba(74,222,128,0.08)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.15)" }}>
                                  {s}
                                  <button onClick={e => { e.stopPropagation(); speak(s); }} style={{ color: "rgba(74,222,128,0.5)" }}>
                                    <i className="ri-volume-up-line text-xs"></i>
                                  </button>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.antonyms.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "rgba(255,255,255,0.6)" }}>
                              <span className="w-5 h-5 flex items-center justify-center rounded-full text-xs" style={{ backgroundColor: "rgba(248,113,113,0.15)", color: "#f87171" }}>?</span>
                              T? trái nghia
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {result.antonyms.map(a => (
                                <button key={a} onClick={() => { setQuery(a); handleSearch(a); }}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap transition-all"
                                  style={{ backgroundColor: "rgba(248,113,113,0.08)", color: "#f87171", border: "1px solid rgba(248,113,113,0.15)" }}>
                                  {a}
                                  <button onClick={e => { e.stopPropagation(); speak(a); }} style={{ color: "rgba(248,113,113,0.5)" }}>
                                    <i className="ri-volume-up-line text-xs"></i>
                                  </button>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.synonyms.length === 0 && result.antonyms.length === 0 && (
                          <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.25)" }}>Chua có d? li?u t? d?ng/trái nghia</p>
                        )}
                      </div>
                    )}

                    {/* Compounds tab */}
                    {activeTab === "related" && (
                      <div>
                        {result.compounds.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {result.compounds.map(c => (
                              <div key={c.word} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => speak(c.word)} className="w-7 h-7 flex items-center justify-center cursor-pointer rounded-lg" style={{ color: "rgba(255,255,255,0.25)" }}>
                                    <i className="ri-volume-up-line text-sm"></i>
                                  </button>
                                  <div>
                                    <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>{c.word}</p>
                                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{c.meaning}</p>
                                  </div>
                                </div>
                                <button onClick={() => { setQuery(c.word); handleSearch(c.word); }}
                                  className="text-xs cursor-pointer whitespace-nowrap" style={{ color: "app-accent-primary" }}>
                                  Tra c?u
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.25)" }}>Chua có d? li?u t? ghép</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
