import { useState, useMemo, useRef, useEffect } from "react";
import { HanjaEntry } from "@/mocks/hanjaData";
import { useHanjaData } from "@/contexts/HanjaDataContext";

const SR_KEY = "hanja_sr_data";

interface SRCard {
  korean: string;
  interval: number;
  easeFactor: number;
  dueDate: number;
  totalReviews: number;
  correctStreak: number;
}

function getMasteryLevel(korean: string, srData: Record<string, SRCard>): "new" | "learning" | "mastered" {
  const card = srData[korean];
  if (!card) return "new";
  if (card.interval >= 21) return "mastered";
  return "learning";
}

// Vietnamese phonetic normalization — strip diacritics for fuzzy matching
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, " ")
    .trim();
}

// Extract all unique Vietnamese "root words" from a meaning string
function extractViRoots(viet: string): string[] {
  return viet
    .toLowerCase()
    .split(/[,\s\/\-\(\)]+/)
    .map(w => w.trim())
    .filter(w => w.length >= 2);
}

// Build suggestion list from all Vietnamese meanings
function buildSuggestions(data: HanjaEntry[]): string[] {
  const set = new Set<string>();
  data.forEach(e => {
    extractViRoots(e.vietnamese).forEach(w => set.add(w));
  });
  return Array.from(set).sort();
}

// Smart search: match by Vietnamese phonetic, Korean, or Hanja
function smartSearch(query: string, data: HanjaEntry[]): HanjaEntry[] {
  if (!query.trim()) return [];
  const q = query.trim().toLowerCase();
  const qNorm = normalize(q);

  const scored = data.map(entry => {
    let score = 0;
    const viLower = entry.vietnamese.toLowerCase();
    const viNorm = normalize(entry.vietnamese);
    const koLower = entry.korean.toLowerCase();
    const hanjaLower = entry.hanja.toLowerCase();

    // Exact Korean match
    if (koLower === q) score += 100;
    else if (koLower.includes(q)) score += 60;

    // Exact Vietnamese match
    if (viLower === q) score += 100;
    else if (viLower.includes(q)) score += 50;

    // Normalized Vietnamese match (ignore diacritics)
    if (viNorm === qNorm) score += 80;
    else if (viNorm.includes(qNorm)) score += 40;

    // Word-level match in Vietnamese
    const viWords = extractViRoots(entry.vietnamese);
    viWords.forEach(w => {
      const wNorm = normalize(w);
      if (wNorm === qNorm) score += 70;
      else if (wNorm.startsWith(qNorm)) score += 35;
      else if (qNorm.startsWith(wNorm) && wNorm.length >= 3) score += 20;
    });

    // Hanja match
    if (hanjaLower.includes(q)) score += 30;

    return { entry, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.entry);
}

// Popular search suggestions
const POPULAR_SEARCHES = [
  "thương", "quân", "học", "tâm", "quốc", "nhân", "lực", "pháp",
  "hòa", "sinh", "phúc", "đức", "minh", "nghĩa", "tín", "trung",
  "bình", "an", "công", "lý", "đại", "tiểu", "cao", "thấp",
];

function MasteryBadge({ level }: { level: "new" | "learning" | "mastered" }) {
  if (level === "new") return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-app-surface/50 text-white/50">
      <i className="ri-seedling-line text-xs"></i>Mới
    </span>
  );
  if (level === "learning") return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-400">
      <i className="ri-book-open-line text-xs"></i>Đang học
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400">
      <i className="ri-check-double-line text-xs"></i>Đã thuộc
    </span>
  );
}

export default function SmartSearchTab() {
  const HANJA_DATA = useHanjaData();
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const srData = useMemo<Record<string, SRCard>>(() => {
    try { return JSON.parse(localStorage.getItem(SR_KEY) || "{}"); } catch { return {}; }
  }, []);

  const allSuggestions = useMemo(() => buildSuggestions(HANJA_DATA), [HANJA_DATA]);

  const filteredSuggestions = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const qNorm = normalize(query);
    return allSuggestions
      .filter(s => normalize(s).includes(qNorm))
      .slice(0, 8);
  }, [query, allSuggestions]);

  const results = useMemo(() => {
    if (!submitted.trim()) return [];
    return smartSearch(submitted, HANJA_DATA);
  }, [submitted, HANJA_DATA]);

  const handleSearch = (q: string) => {
    setQuery(q);
    setSubmitted(q);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setSubmitted(query);
      setShowSuggestions(false);
    }
  };

  // Group results by first Vietnamese word for display
  const groupedResults = useMemo(() => {
    if (results.length === 0) return null;
    return results;
  }, [results]);

  // Highlight matching text
  function highlight(text: string, q: string): React.ReactNode {
    if (!q) return text;
    const qLower = q.toLowerCase();
    const idx = text.toLowerCase().indexOf(qLower);
    if (idx === -1) {
      // Try normalized match
      const normText = normalize(text);
      const normQ = normalize(q);
      const normIdx = normText.indexOf(normQ);
      if (normIdx === -1) return text;
      return (
        <>
          {text.slice(0, normIdx)}
          <mark className="bg-app-accent-primary/20 text-app-accent-primary rounded px-0.5">{text.slice(normIdx, normIdx + normQ.length)}</mark>
          {text.slice(normIdx + normQ.length)}
        </>
      );
    }
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-app-accent-primary/20 text-app-accent-primary rounded px-0.5">{text.slice(idx, idx + qLower.length)}</mark>
        {text.slice(idx + qLower.length)}
      </>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white mb-1">Tìm kiếm thông minh</h2>
        <p className="text-sm text-white/50">Gõ phiên âm tiếng Việt (ví dụ: &ldquo;thương&rdquo;, &ldquo;quân&rdquo;) để tìm tất cả từ Hán-Hàn liên quan</p>
      </div>

      {/* Search box */}
      <div className="relative mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-lg"></i>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Nhập phiên âm tiếng Việt, từ Hàn hoặc Hán tự..."
              className="w-full pl-12 pr-4 py-3 border-2 border-app-border rounded-xl text-sm focus:outline-none focus:border-app-accent-primary transition-colors"
            />
            {query && (
              <button onClick={() => { setQuery(""); setSubmitted(""); inputRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-white/40 hover:text-white/70 cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
          <button onClick={() => handleSearch(query)}
            className="px-6 py-3 bg-app-accent-primary text-white rounded-xl font-medium cursor-pointer hover:bg-app-accent-primary/90 transition-colors whitespace-nowrap">
            Tìm
          </button>
        </div>

        {/* Autocomplete suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-app-surface/50 border border-app-border rounded-xl z-20 py-1 shadow-lg">
            {filteredSuggestions.map((s, i) => (
              <button key={i} onMouseDown={() => handleSearch(s)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-app-accent-primary/10 hover:text-app-accent-primary cursor-pointer transition-colors text-left">
                <i className="ri-search-line text-white/40 text-xs"></i>
                <span>{s}</span>
                <span className="ml-auto text-xs text-white/40">
                  {smartSearch(s, HANJA_DATA).length} từ
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular searches */}
      {!submitted && (
        <div className="mb-8">
          <p className="text-xs font-semibold text-white/50 mb-3 tracking-wide">Tìm kiếm phổ biến</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map(s => (
              <button key={s} onClick={() => handleSearch(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-app-surface/50 text-white/70 rounded-full text-sm cursor-pointer hover:bg-app-accent-primary/10 hover:text-app-accent-primary transition-colors">
                <i className="ri-hashtag text-xs"></i>{s}
                <span className="text-xs text-white/40">({smartSearch(s, HANJA_DATA).length})</span>
              </button>
            ))}
          </div>

          {/* How it works */}
          <div className="mt-6 bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-lightbulb-line text-amber-400"></i>
              <span className="text-sm font-semibold text-white/80">Cách tìm kiếm thông minh</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/70">
              {[
                { icon: "ri-translate-2", tip: "Gõ phiên âm Việt: \"thương\" → tìm tất cả từ có nghĩa liên quan đến \"thương\"" },
                { icon: "ri-font-size", tip: "Không cần dấu: \"thuong\" = \"thương\" — hệ thống tự nhận dạng" },
                { icon: "ri-global-line", tip: "Gõ tiếng Hàn: \"상\" → tìm tất cả từ bắt đầu bằng 상" },
                { icon: "ri-character-recognition-line", tip: "Gõ Hán tự: \"商\" → tìm tất cả từ chứa chữ Hán đó" },
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-2">
                  <i className={`${t.icon} text-app-accent-primary flex-shrink-0 mt-0.5`}></i>
                  <span>{t.tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {submitted && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm font-semibold text-white/80">
                Kết quả cho &ldquo;<span className="text-app-accent-primary">{submitted}</span>&rdquo;
              </span>
              <span className="ml-2 text-xs text-white/40">({results.length} từ)</span>
            </div>
            {results.length > 0 && (
              <div className="flex gap-2 text-xs text-white/40">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                  {results.filter(r => getMasteryLevel(r.korean, srData) === "mastered").length} đã thuộc
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  {results.filter(r => getMasteryLevel(r.korean, srData) === "learning").length} đang học
                </span>
              </div>
            )}
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16 text-white/40">
              <div className="w-16 h-16 flex items-center justify-center bg-app-surface/50 rounded-2xl mx-auto mb-4">
                <i className="ri-search-line text-3xl"></i>
              </div>
              <p className="font-medium text-white/50 mb-1">Không tìm thấy kết quả</p>
              <p className="text-sm">Thử từ khác hoặc kiểm tra chính tả</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {POPULAR_SEARCHES.slice(0, 6).map(s => (
                  <button key={s} onClick={() => handleSearch(s)}
                    className="px-3 py-1.5 bg-app-accent-primary/10 text-app-accent-primary rounded-full text-xs cursor-pointer hover:bg-app-accent-primary/20 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {groupedResults!.map((item, i) => {
                const mastery = getMasteryLevel(item.korean, srData);
                return (
                  <div key={i} className="bg-app-surface/50 border border-app-border rounded-xl px-4 py-3 hover:border-app-accent-primary transition-all flex items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <span className="text-lg font-bold text-white block leading-tight">{item.korean}</span>
                        <span className="text-sm font-bold text-app-accent-primary">{item.hanja}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/70 truncate">
                          {highlight(item.vietnamese, submitted)}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <MasteryBadge level={mastery} />
                    </div>
                    <span className="text-xs text-white/30 flex-shrink-0">#{i + 1}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
