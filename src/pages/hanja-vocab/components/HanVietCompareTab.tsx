import { useState, useMemo } from "react";
import { HANJA_DATA } from "@/mocks/hanjaData";

// Mapping Hán t? ? Hán Vi?t d?c (phiên âm Hán Vi?t)
const HANVIET_MAP: Record<string, string> = {
  "?": "qu?c", "?": "gia", "?": "dân", "?": "h?c", "?": "d?i",
  "?": "van", "?": "l?c", "?": "nhân", "?": "tâm", "?": "sinh",
  "?": "th?y", "?": "b?ch", "?": "phuong", "?": "trung", "?": "nh?t",
  "?": "b?n", "?": "ng?", "?": "ngôn", "?": "thu", "?": "t?",
  "?": "niên", "?": "nguy?t", "?": "th?i", "?": "gian", "?": "d?a",
  "?": "thiên", "?": "son", "?": "h?i", "?": "xuyên", "?": "m?c",
  "?": "h?a", "?": "kim", "?": "th?", "?": "vuong", "?": "t?",
  "?": "n?", "?": "nam", "?": "ph?", "?": "m?u", "?": "huynh",
  "?": "d?", "?": "t?", "?": "mu?i", "?": "h?u", "?": "tiên",
  "?": "h?u", "?": "thu?ng", "?": "h?", "?": "t?", "?": "h?u",
  "?": "ti?n", "?": "dông", "?": "tây", "?": "nam", "?": "b?c",
  "?": "tân", "?": "c?", "?": "tru?ng", "?": "do?n", "?": "cao",
  "?": "dê", "?": "ti?u", "?": "da", "?": "thi?u",
  "?": "h?o", "?": "ác", "?": "m?", "?": "xú", "?": "cu?ng",
  "?": "nhu?c", "?": "t?c", "?": "trì", "?": "tr?ng", "?": "khinh",
  "?": "chính", "?": "tr?", "?": "kinh", "?": "t?", "?": "xã",
  "?": "h?i", "?": "qu?c", "?": "t?", "?": "quan", "?": "h?",
  "?": "v?n", "?": "d?", "?": "dáp", "?": "án", "?": "pháp",
  "?": "lu?t", "?": "quy", "?": "t?c", "?": "ch?", "?": "d?",
  "?": "quy?n", "?": "l?i", "?": "nghia", "?": "v?", "?": "trách",
  "?": "nhi?m", "?": "m?nh", "?": "l?nh", "?": "ch?", "?": "th?",
  "?": "giáo", "?": "d?c", "?": "su", "?": "d?",
  "?": "hi?u", "?": "vi?n", "?": "quán", "?": "s?", "?": "tru?ng",
  "?": "th?", "?": "dinh", "?": "thôn", "?": "khu", "?": "dô",
  "?": "ph?", "?": "huy?n", "?": "t?nh", "?": "d?o", "?": "l?",
  "?": "ki?u", "?": "môn", "?": "song", "?": "bích", "?": "sàng",
  "?": "k?", "?": "?", "?": "dài", "?": "tuong", "?": "d?i",
  "?": "ph?c", "?": "tru?c", "?": "m?o", "?": "hài", "?": "bao",
  "?": "th?c", "?": "?m", "?": "li?u", "?": "lý", "?": "v?",
  "?": "huong", "?": "s?c", "?": "hình", "?": "d?ng", "?": "ch?ng",
  "?": "lo?i", "?": "ph?m", "?": "v?t", "?": "s?", "?": "ki?n",
  "?": "tình", "?": "c?m", "?": "tu", "?": "tu?ng", "?": "kh?o",
  "?": "tri", "?": "th?c", "?": "ki?n", "?": "van", "?": "d?c",
  "?": "tho?i", "?": "thính", "?": "th?", "?": "quan",
  "?": "sát", "?": "nghiên", "?": "c?u", "?": "phát", "?": "minh",
  "?": "tác", "?": "thu?t", "?": "k?", "?": "nang",
  "?": "tài", "?": "ngh?",
  "?": "âm", "?": "nh?c", "?": "ca", "?": "vu", "?": "k?ch",
  "?": "ánh", "?": "h?a", "?": "t?", "?": "chân", "?": "tu?ng",
  "?": "th?", "?": "ki?n", "?": "khang", "?": "b?nh", "?": "y",
  "?": "du?c", "?": "li?u", "?": "th?",
  "?": "khoa", "?": "th?c",
  "?": "nghi?m", "?": "ch?ng", "?": "xác", "?": "nh?n",
  "?": "d?ng", "?": "c?ng", "?": "hi?p",
  "?": "vi?n", "?": "tr?", "?": "chi", "?": "trì", "?": "duy",
  "?": "b?o", "?": "h?", "?": "th?", "?": "phòng", "?": "v?",
  "?": "chi?n", "?": "tranh", "?": "d?u", "?": "th?ng", "?": "b?i",
  "?": "bình", "?": "hòa", "?": "an", "?": "toàn", "?": "hoàn",
  "?": "thành", "?": "công", "?": "tích", "?": "qu?", "?": "k?t",
  "?": "chung", "?": "th?y", "?": "khai", "?": "b?", "?": "nh?p",
  "?": "xu?t", "?": "lai", "?": "kh?", "?": "quy", "?": "di",
  "?": "d?ng", "?": "tinh", "?": "bi?n", "?": "hóa", "?": "ti?n",
  "?": "thoái", "?": "tang", "?": "gi?m", "?": "khu?ch", "?": "thu",
  "?": "liên", "?": "t?c", "?": "do?n", "?": "thi?t", "?": "phân",
  "?": "cát", "?": "h?p", "?": "t?nh", "?": "th?ng", "?": "nh?t",
  "?": "nh?", "?": "tam", "?": "t?", "?": "ngu", "?": "l?c",
  "?": "th?t", "?": "bát", "?": "c?u", "?": "th?p", "?": "bách",
  "?": "thiên", "?": "v?n", "?": "?c", "?": "tri?u",
};

// T?o d? li?u so sánh t? HANJA_DATA
interface CompareEntry {
  korean: string;
  hanja: string;
  vietnamese: string;
  hanviet: string; // phiên âm Hán Vi?t
  similarity: "identical" | "similar" | "different";
  note?: string;
}

function buildHanViet(hanja: string): string {
  return Array.from(hanja)
    .map(c => HANVIET_MAP[c] || "")
    .filter(Boolean)
    .join(" ");
}

function calcSimilarity(korean: string, vietnamese: string, hanviet: string): "identical" | "similar" | "different" {
  if (!hanviet) return "different";
  const viWords = vietnamese.toLowerCase().split(/[,\s]+/).filter(Boolean);
  const hvWords = hanviet.toLowerCase().split(/\s+/).filter(Boolean);
  // Check if any HV word appears in Vietnamese meaning
  const hasMatch = hvWords.some(hv => viWords.some(vi => vi.includes(hv) || hv.includes(vi)));
  if (hasMatch) return "identical";
  // Partial match
  const partialMatch = hvWords.some(hv => viWords.some(vi => {
    const shorter = hv.length < vi.length ? hv : vi;
    const longer = hv.length >= vi.length ? hv : vi;
    return longer.includes(shorter) && shorter.length >= 2;
  }));
  return partialMatch ? "similar" : "different";
}

const COMPARE_DATA: CompareEntry[] = HANJA_DATA
  .filter(e => e.hanja && e.hanja.length >= 2)
  .map(e => {
    const hanviet = buildHanViet(e.hanja);
    return {
      korean: e.korean,
      hanja: e.hanja,
      vietnamese: e.vietnamese,
      hanviet,
      similarity: calcSimilarity(e.korean, e.vietnamese, hanviet),
    };
  })
  .filter(e => e.hanviet.length > 0);

// Curated examples for the "spotlight" section
const SPOTLIGHT_EXAMPLES = [
  { korean: "??", hanja: "??", vietnamese: "Qu?c gia", hanviet: "qu?c gia", note: "Gi?ng h?t! ?(?)=qu?c, ?(?)=gia" },
  { korean: "??", hanja: "??", vietnamese: "Tru?ng h?c", hanviet: "h?c hi?u", note: "?(?)=h?c — cùng g?c!" },
  { korean: "??", hanja: "??", vietnamese: "Kinh t?", hanviet: "kinh t?", note: "Gi?ng h?t! ?(?)=kinh, ?(?)=t?" },
  { korean: "??", hanja: "??", vietnamese: "Xã h?i", hanviet: "xã h?i", note: "Gi?ng h?t! ?(?)=xã, ?(?)=h?i" },
  { korean: "??", hanja: "??", vietnamese: "Van hóa", hanviet: "van hóa", note: "Gi?ng h?t! ?(?)=van, ?(?)=hóa" },
  { korean: "??", hanja: "??", vietnamese: "Chính tr?", hanviet: "chính tr?", note: "Gi?ng h?t! ?(?)=chính, ?(?)=tr?" },
  { korean: "??", hanja: "??", vietnamese: "L?ch s?", hanviet: "l?ch s?", note: "Gi?ng h?t! ?(?)=l?ch, ?(?)=s?" },
  { korean: "??", hanja: "??", vietnamese: "Bác si", hanviet: "y su", note: "?(?)=y, ?(?)=su/si — g?n gi?ng!" },
  { korean: "??", hanja: "??", vietnamese: "Giáo d?c", hanviet: "giáo d?c", note: "Gi?ng h?t! ?(?)=giáo, ?(?)=d?c" },
  { korean: "??", hanja: "??", vietnamese: "Dân ch?", hanviet: "dân ch?", note: "Gi?ng h?t! ?(?)=dân, ?(?)=ch?" },
  { korean: "??", hanja: "??", vietnamese: "T? do", hanviet: "t? do", note: "Gi?ng h?t! ?(?)=t?, ?(?)=do" },
  { korean: "??", hanja: "??", vietnamese: "Hòa bình", hanviet: "bình hòa", note: "?(?)=bình, ?(?)=hòa — d?o th? t?!" },
];

export default function HanVietCompareTab() {
  const [filter, setFilter] = useState<"all" | "identical" | "similar" | "different">("identical");
  const [search, setSearch] = useState("");
  const [showSpotlight, setShowSpotlight] = useState(true);
  const [quizMode, setQuizMode] = useState(false);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  const filtered = useMemo(() => {
    let data = COMPARE_DATA;
    if (filter !== "all") data = data.filter(e => e.similarity === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(e =>
        e.korean.includes(q) ||
        e.hanja.includes(q) ||
        e.vietnamese.toLowerCase().includes(q) ||
        e.hanviet.toLowerCase().includes(q)
      );
    }
    return data.slice(0, 100);
  }, [filter, search]);

  const stats = useMemo(() => ({
    identical: COMPARE_DATA.filter(e => e.similarity === "identical").length,
    similar: COMPARE_DATA.filter(e => e.similarity === "similar").length,
    different: COMPARE_DATA.filter(e => e.similarity === "different").length,
    total: COMPARE_DATA.length,
  }), []);

  const quizPool = useMemo(() => SPOTLIGHT_EXAMPLES.sort(() => Math.random() - 0.5), []);
  const currentQuiz = quizPool[quizIdx % quizPool.length];

  const handleQuizAnswer = (correct: boolean) => {
    setQuizScore(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }));
    setQuizRevealed(true);
  };

  const nextQuiz = () => {
    setQuizIdx(i => i + 1);
    setQuizRevealed(false);
  };

  const similarityConfig = {
    identical: { label: "Gi?ng h?t", color: "#34d399", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "ri-check-double-line" },
    similar: { label: "G?n gi?ng", color: "#fb923c", bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "ri-check-line" },
    different: { label: "Khác nhau", color: "#f43f5e", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: "ri-close-line" },
  };

  return (
    <div className="space-y-5">
      {/* Header insight */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-[#0f1117] border border-emerald-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-app-accent-success/15 rounded-xl flex-shrink-0">
            <i className="ri-lightbulb-line text-app-accent-success text-xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-base mb-1">Ngu?i Vi?t h?c ti?ng Hàn nhanh hon nh? Hán t? chung!</h3>
            <p className="text-white/50 text-sm leading-relaxed">
              Ti?ng Hàn và ti?ng Vi?t d?u có ngu?n g?c t? ch? Hán. Kho?ng <span className="text-app-accent-success font-bold">60-70%</span> t? v?ng ti?ng Hàn là t? Hán-Hàn, 
              và nhi?u t? trong s? dó <span className="text-app-accent-success font-bold">d?c g?n gi?ng</span> ti?ng Vi?t!
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {[
            { label: "Gi?ng h?t", value: stats.identical, color: "#34d399", pct: Math.round((stats.identical / stats.total) * 100) },
            { label: "G?n gi?ng", value: stats.similar, color: "#fb923c", pct: Math.round((stats.similar / stats.total) * 100) },
            { label: "Khác nhau", value: stats.different, color: "#f43f5e", pct: Math.round((stats.different / stats.total) * 100) },
          ].map(s => (
            <div key={s.label} className="bg-app-surface/50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
              <p className="text-app-text-muted text-[10px]">{s.pct}% t?ng s?</p>
            </div>
          ))}
        </div>
      </div>

      {/* Spotlight examples */}
      {showSpotlight && (
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="ri-star-line text-amber-400 text-sm"></i>
              <h3 className="text-white font-semibold text-sm">Ví d? n?i b?t — H?c ngay!</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuizMode(m => !m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${quizMode ? "bg-amber-500 text-white" : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"}`}
              >
                <i className="ri-gamepad-line"></i>{quizMode ? "Thoát quiz" : "Quiz nhanh"}
              </button>
              <button onClick={() => setShowSpotlight(false)} className="text-app-text-muted hover:text-app-text-secondary cursor-pointer text-xs">
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>

          {quizMode ? (
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-3">
                <span className="text-app-text-secondary text-xs">Câu {(quizIdx % quizPool.length) + 1}/{quizPool.length}</span>
                <span className="text-app-accent-success text-xs font-bold">? {quizScore.correct}/{quizScore.total}</span>
              </div>
              <div className="bg-app-surface/50 rounded-xl p-5 text-center mb-4">
                <p className="text-app-text-secondary text-xs mb-2">T? Hán-Hàn này d?c Hán Vi?t là gì?</p>
                <p className="text-3xl font-bold text-white mb-1">{currentQuiz.korean}</p>
                <p className="text-xl text-rose-400 font-bold">{currentQuiz.hanja}</p>
                <p className="text-app-text-secondary text-sm mt-2">{currentQuiz.vietnamese}</p>
              </div>
              {!quizRevealed ? (
                <div className="grid grid-cols-2 gap-2">
                  {[currentQuiz.hanviet, ...SPOTLIGHT_EXAMPLES.filter(e => e.korean !== currentQuiz.korean).slice(0, 3).map(e => e.hanviet)]
                    .sort(() => Math.random() - 0.5)
                    .map((ans, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuizAnswer(ans === currentQuiz.hanviet)}
                        className="px-4 py-3 bg-app-card/50 hover:bg-app-card/70 border border-app-border rounded-xl text-white/70 text-sm cursor-pointer transition-all"
                      >
                        {ans}
                      </button>
                    ))}
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-3">
                    <p className="text-app-accent-success font-bold text-lg">{currentQuiz.hanviet}</p>
                    <p className="text-white/50 text-xs mt-1">{currentQuiz.note}</p>
                  </div>
                  <button onClick={nextQuiz} className="px-6 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold cursor-pointer hover:bg-amber-600 transition-colors">
                    Câu ti?p ?
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SPOTLIGHT_EXAMPLES.map((ex, i) => (
                <div key={i} className="bg-app-surface/50 border border-emerald-500/15 rounded-xl p-4 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-white font-bold text-lg">{ex.korean}</span>
                      <span className="text-rose-400 font-bold text-base ml-2">{ex.hanja}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-app-accent-success/15 text-app-accent-success font-bold whitespace-nowrap">Gi?ng!</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 bg-app-card/50 rounded-lg px-2.5 py-1.5 text-center">
                      <p className="text-app-text-muted text-[9px] mb-0.5">Hán Vi?t</p>
                      <p className="text-app-accent-success font-bold text-sm">{ex.hanviet}</p>
                    </div>
                    <i className="ri-arrow-right-line text-app-text-muted text-xs"></i>
                    <div className="flex-1 bg-app-card/50 rounded-lg px-2.5 py-1.5 text-center">
                      <p className="text-app-text-muted text-[9px] mb-0.5">Ti?ng Vi?t</p>
                      <p className="text-white/70 font-bold text-sm">{ex.vietnamese}</p>
                    </div>
                  </div>
                  <p className="text-app-text-muted text-[10px] italic">{ex.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
          <input
            type="text"
            placeholder="Tìm t? Hàn, Hán t?, nghia Vi?t, Hán Vi?t..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-app-card/50 border border-app-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30 placeholder-white/20"
          />
        </div>
        <div className="flex gap-1 bg-app-surface/50 p-1 rounded-xl">
          {(["all", "identical", "similar", "different"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${filter === f ? "bg-app-card/70 text-white" : "text-app-text-muted hover:text-white/50"}`}
            >
              {f === "all" ? `T?t c? (${stats.total})` : f === "identical" ? `Gi?ng (${stats.identical})` : f === "similar" ? `G?n (${stats.similar})` : `Khác (${stats.different})`}
            </button>
          ))}
        </div>
      </div>

      {/* Main table */}
      <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] bg-app-surface/50 px-5 py-3 text-xs font-semibold text-app-text-muted border-b border-app-border">
          <span>Ti?ng Hàn</span>
          <span>Hán t?</span>
          <span>Hán Vi?t</span>
          <span>Nghia ti?ng Vi?t</span>
          <span>M?c d?</span>
        </div>
        <div className="divide-y divide-white/3 max-h-[500px] overflow-y-auto">
          {filtered.map((item, i) => {
            const cfg = similarityConfig[item.similarity];
            return (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] px-5 py-3 hover:bg-white/2 transition-colors items-center gap-3">
                <span className="text-white font-bold text-sm">{item.korean}</span>
                <span className="text-rose-400 font-bold text-sm">{item.hanja}</span>
                <span className="text-app-accent-success font-semibold text-sm">{item.hanviet || "—"}</span>
                <span className="text-white/50 text-xs">{item.vietnamese}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${cfg.bg} ${cfg.border} border`} style={{ color: cfg.color }}>
                  <i className={cfg.icon}></i>{cfg.label}
                </span>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-app-text-muted">
            <i className="ri-search-line text-3xl mb-2 block"></i>
            <p className="text-sm">Không tìm th?y k?t qu?</p>
          </div>
        )}
      </div>

      {/* Learning tip */}
      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
        <p className="text-amber-400/80 text-xs font-semibold mb-1 flex items-center gap-1.5">
          <i className="ri-lightbulb-flash-line"></i>M?o h?c nhanh cho ngu?i Vi?t
        </p>
        <p className="text-app-text-secondary text-xs leading-relaxed">
          Khi g?p t? Hán-Hàn m?i, hãy th? d?c t?ng ch? Hán theo âm Hán Vi?t. Ví d?: 
          <span className="text-amber-400 font-bold"> ??(??) = kinh t?</span>, 
          <span className="text-amber-400 font-bold"> ??(??) = xã h?i</span>, 
          <span className="text-amber-400 font-bold"> ??(??) = van hóa</span>. 
          B?n s? nh? nghia ngay l?p t?c mà không c?n h?c thu?c!
        </p>
      </div>
    </div>
  );
}

