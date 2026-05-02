import { useState, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import AdBanner from "@/components/feature/AdBanner";
import { supabase } from "@/lib/supabase";
import { HANJA_DATA } from "@/mocks/data/hanja-data";

interface HanjaEntry {
  id: string;
  korean: string;
  hanja: string;
  vietnamese: string;
  pronunciation: string;
  examples: { korean: string; vietnamese: string }[];
  memory_tip: string;
  related_words: { word: string; meaning: string }[];
  category: string;
  difficulty: number;
}

interface HanjaCharInfo {
  char: string;
  meaning: string;
  strokes: number;
  radical: string;
  examples: string[];
  compounds: { word: string; meaning: string; pronunciation: string }[];
}

const HANJA_CHARS: HanjaCharInfo[] = [
  { char: "人", meaning: "Người", strokes: 2, radical: "人", examples: ["人間", "人生", "人口"], compounds: [{ word: "인간", meaning: "Con người", pronunciation: "in-gan" }, { word: "인생", meaning: "Cuộc đời", pronunciation: "in-saeng" }, { word: "인구", meaning: "Dân số", pronunciation: "in-gu" }] },
  { char: "大", meaning: "Lớn", strokes: 3, radical: "大", examples: ["大學", "大人", "大會"], compounds: [{ word: "대학", meaning: "Đại học", pronunciation: "dae-hak" }, { word: "대인", meaning: "Người lớn", pronunciation: "dae-in" }, { word: "대회", meaning: "Đại hội", pronunciation: "dae-hoe" }] },
  { char: "學", meaning: "Học", strokes: 16, radical: "子", examples: ["學校", "學生", "學習"], compounds: [{ word: "학교", meaning: "Trường học", pronunciation: "hak-gyo" }, { word: "학생", meaning: "Học sinh", pronunciation: "hak-saeng" }, { word: "학습", meaning: "Học tập", pronunciation: "hak-seup" }] },
  { char: "國", meaning: "Quốc gia", strokes: 11, radical: "囗", examples: ["國家", "國語", "外國"], compounds: [{ word: "국가", meaning: "Quốc gia", pronunciation: "guk-ga" }, { word: "국어", meaning: "Quốc ngữ", pronunciation: "gu-geo" }, { word: "외국", meaning: "Nước ngoài", pronunciation: "oe-guk" }] },
  { char: "語", meaning: "Ngôn ngữ", strokes: 14, radical: "言", examples: ["語學", "國語", "外語"], compounds: [{ word: "어학", meaning: "Ngôn ngữ học", pronunciation: "eo-hak" }, { word: "국어", meaning: "Tiếng Hàn", pronunciation: "gu-geo" }, { word: "외어", meaning: "Ngoại ngữ", pronunciation: "oe-eo" }] },
  { char: "心", meaning: "Tâm / Lòng", strokes: 4, radical: "心", examples: ["心理", "中心", "安心"], compounds: [{ word: "심리", meaning: "Tâm lý", pronunciation: "sim-ri" }, { word: "중심", meaning: "Trung tâm", pronunciation: "jung-sim" }, { word: "안심", meaning: "Yên tâm", pronunciation: "an-sim" }] },
  { char: "水", meaning: "Nước", strokes: 4, radical: "水", examples: ["水泳", "水道", "洪水"], compounds: [{ word: "수영", meaning: "Bơi lội", pronunciation: "su-yeong" }, { word: "수도", meaning: "Thủ đô / Đường nước", pronunciation: "su-do" }, { word: "홍수", meaning: "Lũ lụt", pronunciation: "hong-su" }] },
  { char: "火", meaning: "Lửa", strokes: 4, radical: "火", examples: ["火山", "火災", "火力"], compounds: [{ word: "화산", meaning: "Núi lửa", pronunciation: "hwa-san" }, { word: "화재", meaning: "Hỏa hoạn", pronunciation: "hwa-jae" }, { word: "화력", meaning: "Hỏa lực", pronunciation: "hwa-ryeok" }] },
  { char: "山", meaning: "Núi", strokes: 3, radical: "山", examples: ["山脈", "登山", "火山"], compounds: [{ word: "산맥", meaning: "Dãy núi", pronunciation: "san-maek" }, { word: "등산", meaning: "Leo núi", pronunciation: "deung-san" }, { word: "화산", meaning: "Núi lửa", pronunciation: "hwa-san" }] },
  { char: "日", meaning: "Mặt trời / Ngày", strokes: 4, radical: "日", examples: ["日本", "日記", "日常"], compounds: [{ word: "일본", meaning: "Nhật Bản", pronunciation: "il-bon" }, { word: "일기", meaning: "Nhật ký", pronunciation: "il-gi" }, { word: "일상", meaning: "Hàng ngày", pronunciation: "il-sang" }] },
  { char: "月", meaning: "Mặt trăng / Tháng", strokes: 4, radical: "月", examples: ["月曜日", "月給", "歲月"], compounds: [{ word: "월요일", meaning: "Thứ Hai", pronunciation: "wol-lyo-il" }, { word: "월급", meaning: "Lương tháng", pronunciation: "wol-geup" }, { word: "세월", meaning: "Năm tháng", pronunciation: "se-wol" }] },
  { char: "金", meaning: "Vàng / Kim loại", strokes: 8, radical: "金", examples: ["金曜日", "黃金", "金額"], compounds: [{ word: "금요일", meaning: "Thứ Sáu", pronunciation: "geum-yo-il" }, { word: "황금", meaning: "Vàng", pronunciation: "hwang-geum" }, { word: "금액", meaning: "Số tiền", pronunciation: "geum-aek" }] },
  { char: "力", meaning: "Sức mạnh", strokes: 2, radical: "力", examples: ["努力", "能力", "力量"], compounds: [{ word: "노력", meaning: "Nỗ lực", pronunciation: "no-ryeok" }, { word: "능력", meaning: "Năng lực", pronunciation: "neung-nyeok" }, { word: "역량", meaning: "Năng lực", pronunciation: "yeong-nyang" }] },
  { char: "時", meaning: "Thời gian", strokes: 10, radical: "日", examples: ["時間", "時代", "時期"], compounds: [{ word: "시간", meaning: "Thời gian", pronunciation: "si-gan" }, { word: "시대", meaning: "Thời đại", pronunciation: "si-dae" }, { word: "시기", meaning: "Thời kỳ", pronunciation: "si-gi" }] },
  { char: "愛", meaning: "Tình yêu", strokes: 13, radical: "心", examples: ["愛情", "愛人", "愛國"], compounds: [{ word: "애정", meaning: "Tình cảm", pronunciation: "ae-jeong" }, { word: "애인", meaning: "Người yêu", pronunciation: "ae-in" }, { word: "애국", meaning: "Yêu nước", pronunciation: "ae-guk" }] },
  { char: "生", meaning: "Sống / Sinh", strokes: 5, radical: "生", examples: ["生活", "人生", "學生"], compounds: [{ word: "생활", meaning: "Cuộc sống", pronunciation: "saeng-hwal" }, { word: "인생", meaning: "Cuộc đời", pronunciation: "in-saeng" }, { word: "학생", meaning: "Học sinh", pronunciation: "hak-saeng" }] },
];

const DIFFICULTY_LABELS: Record<number, string> = { 1: "Dễ", 2: "Trung bình", 3: "Khó" };
const DIFFICULTY_COLORS: Record<number, string> = { 1: "text-emerald-400 bg-emerald-500/15", 2: "text-amber-400 bg-amber-500/15", 3: "text-rose-400 bg-rose-500/15" };

export default function HanjaDetailPage() {
  const [entries, setEntries] = useState<HanjaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("Tất cả");
  const [filterDiff, setFilterDiff] = useState(0);
  const [selectedEntry, setSelectedEntry] = useState<HanjaEntry | null>(null);
  const [selectedChar, setSelectedChar] = useState<HanjaCharInfo | null>(null);
  const [activeTab, setActiveTab] = useState<"vocab" | "chars">("vocab");
  const [page, setPage] = useState(1);
  const PER_PAGE = 24;

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      // Fetch rich entries from DB (with examples, memory tips, related words)
      const { data } = await supabase
        .from("hanja_vocab_entries")
        .select("*")
        .not("hanja", "eq", "")
        .order("difficulty", { ascending: true });

      const dbEntries = (data ?? []) as HanjaEntry[];
      const dbKeys = new Set(dbEntries.map(e => `${e.korean}|${e.hanja}`));

      // Merge local HANJA_DATA for any words not in DB
      const localEntries: HanjaEntry[] = HANJA_DATA
        .filter(w => w.hanja && !dbKeys.has(`${w.korean}|${w.hanja}`))
        .map((w, i) => ({
          id: `local_${i}`,
          korean: w.korean,
          hanja: w.hanja,
          vietnamese: w.vietnamese,
          pronunciation: w.pronunciation || "",
          examples: [],
          memory_tip: "",
          related_words: [],
          category: w.category || "Khác",
          difficulty: w.difficulty || 2,
        }));

      setEntries([...dbEntries, ...localEntries]);
      setLoading(false);
    };
    fetchEntries();
  }, []);

  const categories = ["Tất cả", ...Array.from(new Set(entries.map(e => e.category).filter(Boolean)))];

  const filtered = entries.filter(e => {
    if (filterCat !== "Tất cả" && e.category !== filterCat) return false;
    if (filterDiff > 0 && e.difficulty !== filterDiff) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.korean.includes(q) || e.hanja.includes(q) || e.vietnamese.toLowerCase().includes(q);
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const playTTS = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR"; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Hán Hàn Chi Tiết</h1>
            <p className="text-white/50 text-sm mt-1">Từ điển Hán Hàn với chữ Hán, ví dụ và từ liên quan</p>
          </div>
          <div className="text-white/30 text-sm"><i className="ri-character-recognition-line mr-1"></i>{entries.filter(e => e.hanja).length} từ Hán Hàn</div>
        </div>

        {/* Ad banner */}
        <AdBanner position="between-content" />

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
          {[{ id: "vocab", label: "Từ vựng Hán Hàn", icon: "ri-translate-2" }, { id: "chars", label: "Chữ Hán cơ bản", icon: "ri-character-recognition-line" }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as "vocab" | "chars")} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all cursor-pointer whitespace-nowrap ${activeTab === tab.id ? "bg-[#e8c84a]/20 text-[#e8c84a] font-semibold" : "text-white/40 hover:text-white/60"}`}>
              <i className={tab.icon}></i>{tab.label}
            </button>
          ))}
        </div>

        {activeTab === "vocab" ? (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-white/8 space-y-3">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm"></i>
                <input type="text" placeholder="Tìm từ Hàn, chữ Hán, nghĩa tiếng Việt..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#e8c84a]/40" />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-white/30 text-xs">Độ khó:</span>
                  {[{ v: 0, l: "Tất cả" }, { v: 1, l: "Dễ" }, { v: 2, l: "TB" }, { v: 3, l: "Khó" }].map(d => (
                    <button key={d.v} onClick={() => { setFilterDiff(d.v); setPage(1); }} className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${filterDiff === d.v ? "bg-[#e8c84a]/20 text-[#e8c84a] font-semibold" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>{d.l}</button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-white/30 text-xs self-center">Chủ đề:</span>
                {categories.slice(0, 10).map(c => (
                  <button key={c} onClick={() => { setFilterCat(c); setPage(1); }} className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap ${filterCat === c ? "bg-[#e8c84a]/20 text-[#e8c84a] font-semibold" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>{c}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-[#1a1f2e] rounded-xl p-4 border border-white/5 animate-pulse h-28"></div>
                ))}
              </div>
            ) : (
              <>
                <p className="text-white/30 text-xs">{filtered.length} từ</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {paginated.map(entry => (
                    <div key={entry.id} onClick={() => setSelectedEntry(entry)} className="bg-[#1a1f2e] rounded-xl p-4 border border-white/8 hover:border-[#e8c84a]/30 transition-all cursor-pointer group">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-bold text-base group-hover:text-[#e8c84a] transition-colors">{entry.korean}</p>
                          {entry.hanja && <p className="text-[#e8c84a]/60 text-sm font-medium">{entry.hanja}</p>}
                        </div>
                        <button onClick={e => { e.stopPropagation(); playTTS(entry.korean); }} className="text-white/20 hover:text-white/50 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                          <i className="ri-volume-up-line text-sm"></i>
                        </button>
                      </div>
                      <p className="text-white/50 text-xs">{entry.pronunciation}</p>
                      <p className="text-white/70 text-xs mt-1 line-clamp-1">{entry.vietnamese}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${DIFFICULTY_COLORS[entry.difficulty]}`}>{DIFFICULTY_LABELS[entry.difficulty]}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-sm disabled:opacity-30 cursor-pointer hover:bg-white/10 transition-all whitespace-nowrap">
                      <i className="ri-arrow-left-s-line"></i>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                      return (
                        <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm transition-all cursor-pointer ${page === p ? "bg-[#e8c84a]/20 text-[#e8c84a] font-bold" : "bg-white/5 text-white/40 hover:bg-white/10"}`}>{p}</button>
                      );
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg bg-white/5 text-white/50 text-sm disabled:opacity-30 cursor-pointer hover:bg-white/10 transition-all whitespace-nowrap">
                      <i className="ri-arrow-right-s-line"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {HANJA_CHARS.map(char => (
              <div key={char.char} onClick={() => setSelectedChar(char)} className="bg-[#1a1f2e] rounded-xl p-5 border border-white/8 hover:border-[#e8c84a]/30 transition-all cursor-pointer group text-center">
                <div className="text-5xl font-bold text-[#e8c84a]/80 group-hover:text-[#e8c84a] transition-colors mb-2">{char.char}</div>
                <p className="text-white/70 text-sm font-medium">{char.meaning}</p>
                <div className="flex items-center justify-center gap-3 mt-2 text-white/30 text-xs">
                  <span><i className="ri-pencil-line mr-0.5"></i>{char.strokes} nét</span>
                  <span>Bộ: {char.radical}</span>
                </div>
                <div className="flex flex-wrap gap-1 justify-center mt-3">
                  {char.compounds.slice(0, 2).map(c => (
                    <span key={c.word} className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-white/50">{c.word}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Entry Detail Modal */}
        {selectedEntry && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedEntry(null)}>
            <div className="bg-[#1a1f2e] rounded-2xl p-6 max-w-lg w-full border border-white/12 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-white text-3xl font-bold">{selectedEntry.korean}</h2>
                    {selectedEntry.hanja && <span className="text-[#e8c84a] text-2xl font-medium">{selectedEntry.hanja}</span>}
                  </div>
                  <p className="text-white/50 text-sm mt-0.5">{selectedEntry.pronunciation}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => playTTS(selectedEntry.korean)} className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center text-white/60 hover:bg-white/12 cursor-pointer transition-all">
                    <i className="ri-volume-up-line"></i>
                  </button>
                  <button onClick={() => setSelectedEntry(null)} className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center text-white/60 hover:bg-white/12 cursor-pointer transition-all">
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-xs mb-1">Nghĩa tiếng Việt</p>
                  <p className="text-white font-semibold">{selectedEntry.vietnamese}</p>
                </div>

                {selectedEntry.examples && selectedEntry.examples.length > 0 && (
                  <div>
                    <p className="text-white/40 text-xs mb-2">Ví dụ</p>
                    <div className="space-y-2">
                      {selectedEntry.examples.map((ex, i) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <p className="text-white/80 text-sm flex-1">{ex.korean}</p>
                            <button onClick={() => playTTS(ex.korean)} className="text-white/20 hover:text-white/50 cursor-pointer flex-shrink-0">
                              <i className="ri-volume-up-line text-xs"></i>
                            </button>
                          </div>
                          <p className="text-white/40 text-xs mt-0.5 italic">{ex.vietnamese}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEntry.memory_tip && (
                  <div className="bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-3">
                    <p className="text-[#e8c84a] text-xs font-semibold mb-1"><i className="ri-lightbulb-line mr-1"></i>Mẹo ghi nhớ</p>
                    <p className="text-white/60 text-sm">{selectedEntry.memory_tip}</p>
                  </div>
                )}

                {selectedEntry.related_words && selectedEntry.related_words.length > 0 && (
                  <div>
                    <p className="text-white/40 text-xs mb-2">Từ liên quan</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.related_words.map((rw, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-white/8 text-white/60 text-xs">{rw.word}: {rw.meaning}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${DIFFICULTY_COLORS[selectedEntry.difficulty]}`}>{DIFFICULTY_LABELS[selectedEntry.difficulty]}</span>
                  {selectedEntry.category && <span className="text-xs px-2 py-1 rounded-full bg-white/8 text-white/50">{selectedEntry.category}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Char Detail Modal */}
        {selectedChar && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedChar(null)}>
            <div className="bg-[#1a1f2e] rounded-2xl p-6 max-w-lg w-full border border-white/12" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-6xl font-bold text-[#e8c84a]">{selectedChar.char}</div>
                  <div>
                    <h2 className="text-white text-xl font-bold">{selectedChar.meaning}</h2>
                    <p className="text-white/40 text-sm">{selectedChar.strokes} nét · Bộ: {selectedChar.radical}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedChar(null)} className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center text-white/60 hover:bg-white/12 cursor-pointer transition-all">
                  <i className="ri-close-line"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-white/40 text-xs mb-2">Từ ghép phổ biến</p>
                  <div className="space-y-2">
                    {selectedChar.compounds.map(c => (
                      <div key={c.word} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                        <div>
                          <span className="text-white font-semibold text-sm">{c.word}</span>
                          <span className="text-white/40 text-xs ml-2">{c.pronunciation}</span>
                        </div>
                        <span className="text-white/60 text-xs">{c.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-2">Ví dụ chữ Hán</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedChar.examples.map(ex => (
                      <span key={ex} className="px-3 py-1.5 rounded-lg bg-[#e8c84a]/10 text-[#e8c84a] text-sm font-medium">{ex}</span>
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
