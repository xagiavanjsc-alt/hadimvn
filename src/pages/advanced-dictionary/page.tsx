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
    word: "사랑", romanization: "sa-rang", pos: "명사", level: "A1", hanja: "愛",
    meanings: [
      { meaning: "Tình yêu, tình cảm yêu thương", examples: [{ korean: "나는 너를 사랑해.", vietnamese: "Tôi yêu bạn." }, { korean: "부모님의 사랑은 무조건적이에요.", vietnamese: "Tình yêu của cha mẹ là vô điều kiện." }] },
      { meaning: "Sự quan tâm, chăm sóc", examples: [{ korean: "아이들에게 사랑을 주세요.", vietnamese: "Hãy cho trẻ em tình yêu thương." }] },
    ],
    synonyms: ["애정", "연애", "정"], antonyms: ["미움", "증오", "혐오"],
    compounds: [{ word: "사랑하다", meaning: "Yêu (động từ)" }, { word: "사랑스럽다", meaning: "Đáng yêu" }, { word: "사랑받다", meaning: "Được yêu" }, { word: "첫사랑", meaning: "Tình yêu đầu tiên" }],
    note: "Từ thuần Hàn, rất phổ biến trong văn học và âm nhạc Hàn Quốc.",
  },
  {
    word: "행복", romanization: "haeng-bok", pos: "명사/형용사", level: "A2", hanja: "幸福",
    meanings: [{ meaning: "Hạnh phúc, niềm vui", examples: [{ korean: "행복한 가정을 만들고 싶어요.", vietnamese: "Tôi muốn xây dựng một gia đình hạnh phúc." }, { korean: "작은 것에서 행복을 찾아요.", vietnamese: "Tìm hạnh phúc trong những điều nhỏ bé." }] }],
    synonyms: ["기쁨", "즐거움", "만족"], antonyms: ["불행", "슬픔", "고통"],
    compounds: [{ word: "행복하다", meaning: "Hạnh phúc (tính từ)" }, { word: "행복감", meaning: "Cảm giác hạnh phúc" }, { word: "행복지수", meaning: "Chỉ số hạnh phúc" }],
    note: "Từ Hán Hàn (幸福). Dùng cả làm danh từ và tính từ.",
  },
  {
    word: "공부", romanization: "gong-bu", pos: "명사/동사", level: "A1", hanja: "工夫",
    meanings: [{ meaning: "Học tập, việc học", examples: [{ korean: "매일 한국어 공부를 해요.", vietnamese: "Tôi học tiếng Hàn mỗi ngày." }, { korean: "공부가 재미있어요.", vietnamese: "Việc học rất thú vị." }] }],
    synonyms: ["학습", "공부하기", "배움"], antonyms: ["놀이", "휴식"],
    compounds: [{ word: "공부하다", meaning: "Học (động từ)" }, { word: "공부방", meaning: "Phòng học" }, { word: "공부벌레", meaning: "Mọt sách" }, { word: "자기공부", meaning: "Tự học" }],
  },
  {
    word: "아름답다", romanization: "a-reum-dap-da", pos: "형용사", level: "A2",
    meanings: [{ meaning: "Đẹp, xinh đẹp (về ngoại hình hoặc tâm hồn)", examples: [{ korean: "한국의 가을은 정말 아름다워요.", vietnamese: "Mùa thu Hàn Quốc thực sự rất đẹp." }, { korean: "그녀는 마음이 아름다운 사람이에요.", vietnamese: "Cô ấy là người có tâm hồn đẹp." }] }],
    synonyms: ["예쁘다", "곱다", "멋있다"], antonyms: ["못생기다", "추하다"],
    compounds: [{ word: "아름다움", meaning: "Vẻ đẹp (danh từ)" }, { word: "아름답게", meaning: "Một cách đẹp đẽ" }],
    note: "아름답다 dùng cho vẻ đẹp tổng thể, sâu sắc hơn 예쁘다 (chỉ ngoại hình).",
  },
  {
    word: "생각", romanization: "saeng-gak", pos: "명사/동사", level: "A2",
    meanings: [{ meaning: "Suy nghĩ, ý nghĩ", examples: [{ korean: "좋은 생각이 있어요.", vietnamese: "Tôi có một ý hay." }, { korean: "그 생각은 틀렸어요.", vietnamese: "Suy nghĩ đó sai rồi." }] }, { meaning: "Ký ức, hồi tưởng", examples: [{ korean: "고향 생각이 나요.", vietnamese: "Tôi nhớ quê hương." }] }],
    synonyms: ["사고", "의견", "견해"], antonyms: [],
    compounds: [{ word: "생각하다", meaning: "Suy nghĩ (động từ)" }, { word: "생각나다", meaning: "Nhớ ra, nảy ra ý" }, { word: "생각해보다", meaning: "Thử suy nghĩ" }],
  },
  {
    word: "노력", romanization: "no-ryeok", pos: "명사/동사", level: "B1", hanja: "努力",
    meanings: [{ meaning: "Nỗ lực, cố gắng", examples: [{ korean: "노력 없이는 성공할 수 없어요.", vietnamese: "Không thể thành công nếu không nỗ lực." }, { korean: "최선을 다해 노력했어요.", vietnamese: "Tôi đã cố gắng hết sức." }] }],
    synonyms: ["수고", "애씀", "분투"], antonyms: ["게으름", "나태"],
    compounds: [{ word: "노력하다", meaning: "Nỗ lực (động từ)" }, { word: "노력가", meaning: "Người chăm chỉ" }, { word: "노력의 결실", meaning: "Thành quả của nỗ lực" }],
    note: "Từ Hán Hàn (努力). Thường dùng với 하다 để tạo động từ.",
  },
  {
    word: "경험", romanization: "gyeong-heom", pos: "명사/동사", level: "B1", hanja: "經驗",
    meanings: [{ meaning: "Kinh nghiệm, trải nghiệm", examples: [{ korean: "다양한 경험이 중요해요.", vietnamese: "Kinh nghiệm đa dạng rất quan trọng." }, { korean: "해외 생활을 경험해 봤어요.", vietnamese: "Tôi đã trải nghiệm cuộc sống ở nước ngoài." }] }],
    synonyms: ["체험", "경력", "이력"], antonyms: ["미경험", "초보"],
    compounds: [{ word: "경험하다", meaning: "Trải nghiệm (động từ)" }, { word: "경험자", meaning: "Người có kinh nghiệm" }, { word: "경험담", meaning: "Câu chuyện kinh nghiệm" }],
  },
  {
    word: "발전", romanization: "bal-jeon", pos: "명사/동사", level: "B2", hanja: "發展",
    meanings: [{ meaning: "Phát triển, tiến bộ", examples: [{ korean: "기술의 발전이 빠릅니다.", vietnamese: "Sự phát triển của công nghệ rất nhanh." }, { korean: "한국 경제는 빠르게 발전했어요.", vietnamese: "Kinh tế Hàn Quốc đã phát triển nhanh chóng." }] }],
    synonyms: ["성장", "진보", "향상"], antonyms: ["퇴보", "쇠퇴", "후퇴"],
    compounds: [{ word: "발전하다", meaning: "Phát triển (động từ)" }, { word: "발전소", meaning: "Nhà máy điện" }, { word: "경제 발전", meaning: "Phát triển kinh tế" }],
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
    <DashboardLayout title="Tra cứu Hán Hàn" subtitle="Từ điển Hàn-Việt nâng cao với ví dụ, đồng nghĩa, trái nghĩa">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── Left: Search + Browse ── */}
          <div className="lg:col-span-1 space-y-3">
            {/* Search box */}
            <div className="rounded-2xl border p-4" style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
                  <i className="ri-search-line text-white/30 text-sm"></i>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => handleInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch(query)}
                  placeholder="Nhập từ tiếng Hàn..."
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                {query && (
                  <button onClick={() => { setQuery(""); setResult(null); setShowSuggestions(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 cursor-pointer">
                    <i className="ri-close-line text-sm"></i>
                  </button>
                )}
              </div>
              <button
                onClick={() => handleSearch(query)}
                className="w-full mt-2.5 py-2.5 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-all"
                style={{ backgroundColor: "rgba(232,200,74,0.15)", color: "#e8c84a", border: "1px solid rgba(232,200,74,0.25)" }}
              >
                <i className="ri-search-line mr-1.5"></i>
                Tra cứu
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
                <p className="text-[10px] font-semibold tracking-normal mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Tìm kiếm gần đây</p>
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
              <p className="text-[10px] font-semibold tracking-normal mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>Từ phổ biến</p>
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
                        <span className="font-bold text-sm" style={{ color: isActive ? "#e8c84a" : "rgba(255,255,255,0.75)" }}>{d.word}</span>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{d.romanization}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: lc.bg, color: lc.text }}>{d.level}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right: Result ── */}
          <div className="lg:col-span-2">
            {!result ? (
              <div className="rounded-2xl border flex items-center justify-center h-72" style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="text-center">
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl mx-auto mb-3" style={{ backgroundColor: "rgba(232,200,74,0.08)" }}>
                    <i className="ri-search-2-line text-2xl" style={{ color: "rgba(232,200,74,0.4)" }}></i>
                  </div>
                  <p className="font-medium text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Nhập từ để tra cứu</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>Hỗ trợ tiếng Hàn và romanization</p>
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
                          <i className="ri-volume-up-line text-base" style={{ color: "#e8c84a" }}></i>
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
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "rgba(232,200,74,0.12)", color: "#e8c84a" }}>{result.hanja}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    {result.meanings.map((m, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-xs font-bold mt-0.5 flex-shrink-0" style={{ color: "#e8c84a" }}>{i + 1}.</span>
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
                          color: activeTab === tab ? "#e8c84a" : "rgba(255,255,255,0.35)",
                          borderBottom: activeTab === tab ? "2px solid #e8c84a" : "2px solid transparent",
                        }}
                      >
                        {tab === "meaning" ? "Nghĩa & Ví dụ" : tab === "examples" ? "Đồng/Trái nghĩa" : "Từ ghép"}
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
                              <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0" style={{ backgroundColor: "rgba(232,200,74,0.15)", color: "#e8c84a" }}>{i + 1}</span>
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
                            <p className="text-xs font-semibold mb-1" style={{ color: "#e8c84a" }}><i className="ri-lightbulb-line mr-1"></i>Ghi chú</p>
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
                              Từ đồng nghĩa
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
                              <span className="w-5 h-5 flex items-center justify-center rounded-full text-xs" style={{ backgroundColor: "rgba(248,113,113,0.15)", color: "#f87171" }}>≠</span>
                              Từ trái nghĩa
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
                          <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.25)" }}>Chưa có dữ liệu từ đồng/trái nghĩa</p>
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
                                  className="text-xs cursor-pointer whitespace-nowrap" style={{ color: "#e8c84a" }}>
                                  Tra cứu
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.25)" }}>Chưa có dữ liệu từ ghép</p>
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
