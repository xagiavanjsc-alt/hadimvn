import { useState, useMemo, useRef, useEffect } from "react";
import { HANJA_DATA, HanjaEntry } from "@/mocks/hanjaData";

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
    .replace(/d/g, "d")
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
function buildSuggestions(): string[] {
  const set = new Set<string>();
  HANJA_DATA.forEach(e => {
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
  "thuong", "quân", "h?c", "tâm", "qu?c", "nhân", "l?c", "pháp",
  "hòa", "sinh", "phúc", "d?c", "minh", "nghia", "tín", "trung",
  "bình", "an", "công", "lý", "d?i", "ti?u", "cao", "th?p",
];

function MasteryBadge({ level }: { level: "new" | "learning" | "mastered" }) {
  if (level === "new") return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">
      <i className="ri-seedling-line text-xs"></i>M?i
    </span>
  );
  if (level === "learning") return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-amber-50 text-amber-600">
      <i className="ri-book-open-line text-xs"></i>Ðang h?c
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs bg-green-50 text-green-600">
      <i className="ri-check-double-line text-xs"></i>Ðã thu?c
    </span>
  );
}

export default function SmartSearchTab() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const srData = useMemo<Record<string, SRCard>>(() => {
    try { return JSON.parse(localStorage.getItem(SR_KEY) || "{}"); } catch { return {}; }
  }, []);

  const allSuggestions = useMemo(() => buildSuggestions(), []);

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
  }, [submitted]);

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
          <mark className="bg-rose-100 text-rose-700 rounded px-0.5">{text.slice(normIdx, normIdx + normQ.length)}</mark>
          {text.slice(normIdx + normQ.length)}
        </>
      );
    }
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-rose-100 text-rose-700 rounded px-0.5">{text.slice(idx, idx + qLower.length)}</mark>
        {text.slice(idx + qLower.length)}
      </>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Tìm ki?m thông minh</h2>
        <p className="text-sm text-gray-500">Gõ phiên âm ti?ng Vi?t (ví d?: &ldquo;thuong&rdquo;, &ldquo;quân&rdquo;) d? tìm t?t c? t? Hán-Hàn liên quan</p>
      </div>

      {/* Search box */}
      <div className="relative mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Nh?p phiên âm ti?ng Vi?t, t? Hàn ho?c Hán t?..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rose-400 transition-colors"
            />
            {query && (
              <button onClick={() => { setQuery(""); setSubmitted(""); inputRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            )}
          </div>
          <button onClick={() => handleSearch(query)}
            className="px-6 py-3 bg-rose-500 text-white rounded-xl font-medium cursor-pointer hover:bg-rose-600 transition-colors whitespace-nowrap">
            Tìm
          </button>
        </div>

        {/* Autocomplete suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl z-20 py-1 shadow-lg">
            {filteredSuggestions.map((s, i) => (
              <button key={i} onMouseDown={() => handleSearch(s)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition-colors text-left">
                <i className="ri-search-line text-gray-400 text-xs"></i>
                <span>{s}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {smartSearch(s, HANJA_DATA).length} t?
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular searches */}
      {!submitted && (
        <div className="mb-8">
          <p className="text-xs font-semibold text-gray-500 mb-3 tracking-wide">Tìm ki?m ph? bi?n</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map(s => (
              <button key={s} onClick={() => handleSearch(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm cursor-pointer hover:bg-rose-50 hover:text-rose-600 transition-colors">
                <i className="ri-hashtag text-xs"></i>{s}
                <span className="text-xs text-gray-400">({smartSearch(s, HANJA_DATA).length})</span>
              </button>
            ))}
          </div>

          {/* How it works */}
          <div className="mt-6 bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <i className="ri-lightbulb-line text-amber-500"></i>
              <span className="text-sm font-semibold text-gray-700">Cách tìm ki?m thông minh</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
              {[
                { icon: "ri-translate-2", tip: "Gõ phiên âm Vi?t: \"thuong\" ? tìm t?t c? t? có nghia liên quan d?n \"thuong\"" },
                { icon: "ri-font-size", tip: "Không c?n d?u: \"thuong\" = \"thuong\" — h? th?ng t? nh?n d?ng" },
                { icon: "ri-global-line", tip: "Gõ ti?ng Hàn: \"?\" ? tìm t?t c? t? b?t d?u b?ng ?" },
                { icon: "ri-character-recognition-line", tip: "Gõ Hán t?: \"?\" ? tìm t?t c? t? ch?a ch? Hán dó" },
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-2">
                  <i className={`${t.icon} text-rose-400 flex-shrink-0 mt-0.5`}></i>
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
              <span className="text-sm font-semibold text-gray-700">
                K?t qu? cho &ldquo;<span className="text-rose-600">{submitted}</span>&rdquo;
              </span>
              <span className="ml-2 text-xs text-gray-400">({results.length} t?)</span>
            </div>
            {results.length > 0 && (
              <div className="flex gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
                  {results.filter(r => getMasteryLevel(r.korean, srData) === "mastered").length} dã thu?c
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  {results.filter(r => getMasteryLevel(r.korean, srData) === "learning").length} dang h?c
                </span>
              </div>
            )}
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-2xl mx-auto mb-4">
                <i className="ri-search-line text-3xl"></i>
              </div>
              <p className="font-medium text-gray-500 mb-1">Không tìm th?y k?t qu?</p>
              <p className="text-sm">Th? t? khác ho?c ki?m tra chính t?</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {POPULAR_SEARCHES.slice(0, 6).map(s => (
                  <button key={s} onClick={() => handleSearch(s)}
                    className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full text-xs cursor-pointer hover:bg-rose-100 transition-colors">
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
                  <div key={i} className="bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-rose-200 transition-all flex items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <span className="text-lg font-bold text-gray-900 block leading-tight">{item.korean}</span>
                        <span className="text-sm font-bold text-rose-400">{item.hanja}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 truncate">
                          {highlight(item.vietnamese, submitted)}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <MasteryBadge level={mastery} />
                    </div>
                    <span className="text-xs text-gray-300 flex-shrink-0">#{i + 1}</span>
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
