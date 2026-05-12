import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";

interface TreeNode {
  id: string;
  korean: string;
  hanja: string;
  vietnamese: string;
  pronunciation: string;
  root_char: string;
  root_meaning: string;
  category: string;
  difficulty: number;
  examples: { korean: string; vietnamese: string; pronunciation?: string }[];
  related_words: { word: string; meaning: string }[];
  memory_tip: string;
  audio_url: string | null;
}

const DIFF_MAP: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: "Dễ",   bg: "rgba(74,222,128,0.15)",  text: "#4ade80" },
  2: { label: "TB",   bg: "rgba(56,189,248,0.15)",   text: "#38bdf8" },
  3: { label: "Khó",  bg: "rgba(248,113,113,0.15)",  text: "#f87171" },
};

export default function AdvancedDictionaryPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<TreeNode | null>(null);
  const [suggestions, setSuggestions] = useState<TreeNode[]>([]);
  const [browseList, setBrowseList] = useState<TreeNode[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"meaning" | "examples" | "related">("meaning");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSugg, setLoadingSugg] = useState(false);
  const [diffFilter, setDiffFilter] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("adv_dict_recent");
    if (saved) { try { setRecentSearches(JSON.parse(saved)); } catch { /* ignore */ } }
    loadBrowse(null);
  }, []);

  const loadBrowse = useCallback(async (diff: number | null) => {
    let q = supabase
      .from("hanja_tree_nodes")
      .select("id,korean,hanja,vietnamese,pronunciation,root_char,root_meaning,category,difficulty,examples,related_words,memory_tip,audio_url")
      .order("difficulty", { ascending: true })
      .order("korean", { ascending: true })
      .limit(30);
    if (diff) q = q.eq("difficulty", diff);
    const { data } = await q;
    setBrowseList((data as TreeNode[]) || []);
  }, []);

  useEffect(() => { loadBrowse(diffFilter); }, [diffFilter, loadBrowse]);

  const fetchSuggestions = useCallback(async (val: string) => {
    if (!val.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    setLoadingSugg(true);
    const { data } = await supabase
      .from("hanja_tree_nodes")
      .select("id,korean,hanja,vietnamese,pronunciation,difficulty")
      .or(`korean.ilike.%${val}%,vietnamese.ilike.%${val}%,hanja.ilike.%${val}%,pronunciation.ilike.%${val}%`)
      .limit(7);
    setSuggestions((data as TreeNode[]) || []);
    setShowSuggestions(true);
    setLoadingSugg(false);
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
  };

  const selectWord = async (node: TreeNode) => {
    setShowSuggestions(false);
    setQuery(node.korean);
    setActiveTab("meaning");
    if (node.examples !== undefined && node.related_words !== undefined && node.memory_tip !== undefined) {
      setResult(node);
    } else {
      const { data } = await supabase
        .from("hanja_tree_nodes")
        .select("*")
        .eq("id", node.id)
        .single();
      if (data) setResult(data as TreeNode);
    }
    const updated = [node.korean, ...recentSearches.filter(r => r !== node.korean)].slice(0, 8);
    setRecentSearches(updated);
    localStorage.setItem("adv_dict_recent", JSON.stringify(updated));
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setShowSuggestions(false);
    const { data } = await supabase
      .from("hanja_tree_nodes")
      .select("*")
      .or(`korean.eq.${query},vietnamese.ilike.%${query}%`)
      .limit(1)
      .single();
    if (data) { setResult(data as TreeNode); setActiveTab("meaning"); }
  };

  const speak = (text: string, node?: TreeNode) => {
    if (node?.audio_url) {
      if (audioRef.current) { audioRef.current.src = node.audio_url; audioRef.current.play(); }
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR"; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const diffInfo = result ? (DIFF_MAP[result.difficulty] || DIFF_MAP[2]) : null;
  const examples = Array.isArray(result?.examples) ? result.examples : [];
  const related = Array.isArray(result?.related_words) ? result.related_words : [];

  return (
    <DashboardLayout title="Tra cứu Hán Hàn" subtitle="Từ điển Hàn-Việt nâng cao với ví dụ, mẹo nhớ, từ liên quan">
      <audio ref={audioRef} className="hidden" />
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── Left: Search + Browse ── */}
          <div className="lg:col-span-1 space-y-3">
            {/* Search box */}
            <div className="rounded-2xl border p-4" style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <i className="ri-search-line text-app-text-muted text-sm"></i>
                </div>
                <input
                  ref={inputRef} type="text" value={query}
                  onChange={e => handleInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="Nhập từ tiếng Hàn, Hán, hoặc nghĩa..."
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                {query && (
                  <button onClick={() => { setQuery(""); setResult(null); setShowSuggestions(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-app-text-muted hover:text-white/60 cursor-pointer">
                    <i className="ri-close-line text-sm"></i>
                  </button>
                )}
              </div>
              <button onClick={handleSearch}
                className="w-full mt-2.5 py-2.5 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-all"
                style={{ backgroundColor: "rgba(232,200,74,0.15)", color: "#e8c84a", border: "1px solid rgba(232,200,74,0.25)" }}>
                <i className="ri-search-line mr-1.5"></i>Tra cứu
              </button>

              {/* Suggestions */}
              {showSuggestions && (
                <div className="mt-2 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  {loadingSugg ? (
                    <div className="flex items-center justify-center py-3">
                      <i className="ri-loader-4-line animate-spin text-app-text-muted text-sm"></i>
                    </div>
                  ) : suggestions.length === 0 ? (
                    <p className="text-xs text-center py-3" style={{ color: "rgba(255,255,255,0.3)" }}>Không tìm thấy</p>
                  ) : suggestions.map(s => {
                    const dm = DIFF_MAP[s.difficulty] || DIFF_MAP[2];
                    return (
                      <button key={s.id} onClick={() => selectWord(s)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 cursor-pointer text-left transition-colors border-b last:border-0"
                        style={{ borderColor: "rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(232,200,74,0.06)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)")}>
                        <span className="text-base font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{s.korean}</span>
                        <span className="text-xs flex-1 truncate" style={{ color: "rgba(255,255,255,0.35)" }}>{s.vietnamese}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{ backgroundColor: dm.bg, color: dm.text }}>{dm.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="rounded-2xl border p-4" style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>Tìm kiếm gần đây</p>
                  <button onClick={() => { setRecentSearches([]); localStorage.removeItem("adv_dict_recent"); }}
                    className="text-[10px] cursor-pointer" style={{ color: "rgba(255,255,255,0.2)" }}>Xóa</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(r => (
                    <button key={r} onClick={() => { setQuery(r); fetchSuggestions(r); }}
                      className="px-3 py-1.5 rounded-lg text-xs cursor-pointer whitespace-nowrap transition-colors"
                      style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Browse list */}
            <div className="rounded-2xl border p-4" style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>Từ phổ biến</p>
                <div className="flex gap-1">
                  {[null, 1, 2, 3].map(d => (
                    <button key={String(d)} onClick={() => setDiffFilter(d)}
                      className="text-[9px] px-1.5 py-0.5 rounded-full cursor-pointer font-bold transition-all"
                      style={diffFilter === d
                        ? { backgroundColor: d ? DIFF_MAP[d].bg : "rgba(255,255,255,0.1)", color: d ? DIFF_MAP[d].text : "rgba(255,255,255,0.7)" }
                        : { backgroundColor: "transparent", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {d === null ? "Tất cả" : DIFF_MAP[d].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-0.5 max-h-72 overflow-y-auto">
                {browseList.map(d => {
                  const dm = DIFF_MAP[d.difficulty] || DIFF_MAP[2];
                  const isActive = result?.id === d.id;
                  return (
                    <button key={d.id} onClick={() => selectWord(d)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-left transition-all"
                      style={{ backgroundColor: isActive ? "rgba(232,200,74,0.10)" : "transparent", border: isActive ? "1px solid rgba(232,200,74,0.20)" : "1px solid transparent" }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-sm flex-shrink-0" style={{ color: isActive ? "#e8c84a" : "rgba(255,255,255,0.75)" }}>{d.korean}</span>
                        <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.25)" }}>{d.pronunciation}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ml-1" style={{ backgroundColor: dm.bg, color: dm.text }}>{dm.label}</span>
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
                  <p className="font-medium text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Chọn từ hoặc nhập để tra cứu</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>Hỗ trợ tiếng Hàn, Hán tự, nghĩa tiếng Việt</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Word header */}
                <div className="rounded-2xl border p-5" style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h2 className="text-4xl font-black" style={{ color: "rgba(255,255,255,0.92)" }} lang="ko">{result.korean}</h2>
                        <button onClick={() => speak(result.korean, result)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer transition-all flex-shrink-0"
                          style={{ backgroundColor: result.audio_url ? "rgba(74,222,128,0.12)" : "rgba(232,200,74,0.12)", border: result.audio_url ? "1px solid rgba(74,222,128,0.25)" : "1px solid rgba(232,200,74,0.20)" }}>
                          <i className="ri-volume-up-line text-base" style={{ color: result.audio_url ? "#4ade80" : "#e8c84a" }}></i>
                        </button>
                        {result.audio_url && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: "rgba(74,222,128,0.10)", color: "#4ade80" }}>
                            <i className="ri-music-2-line mr-1"></i>MP3
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {result.pronunciation && (
                          <span className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>[{result.pronunciation}]</span>
                        )}
                        {result.category && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>{result.category}</span>
                        )}
                        {diffInfo && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: diffInfo.bg, color: diffInfo.text }}>{diffInfo.label}</span>
                        )}
                        {result.hanja && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "rgba(232,200,74,0.12)", color: "#e8c84a" }}>{result.hanja}</span>
                        )}
                        {result.root_char && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>
                            Gốc: {result.root_char} {result.root_meaning ? `(${result.root_meaning})` : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-base font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>{result.vietnamese}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "#0f1117", borderColor: "rgba(255,255,255,0.07)" }}>
                  <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                    {(["meaning", "examples", "related"] as const).map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        className="flex-1 py-3 text-xs font-semibold cursor-pointer whitespace-nowrap transition-all"
                        style={{
                          color: activeTab === tab ? "#e8c84a" : "rgba(255,255,255,0.35)",
                          borderBottom: activeTab === tab ? "2px solid #e8c84a" : "2px solid transparent",
                        }}>
                        {tab === "meaning" ? "Ví dụ" : tab === "examples" ? "Mẹo nhớ" : "Từ liên quan"}
                        {tab === "examples" && result.memory_tip && <span className="ml-1 w-1.5 h-1.5 inline-block bg-amber-400 rounded-full"></span>}
                        {tab === "related" && related.length > 0 && <span className="ml-1 text-[9px] px-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>{related.length}</span>}
                      </button>
                    ))}
                  </div>

                  <div className="p-5">
                    {/* Examples tab */}
                    {activeTab === "meaning" && (
                      <div className="space-y-3">
                        {examples.length === 0 ? (
                          <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.25)" }}>Chưa có ví dụ</p>
                        ) : examples.map((ex, i) => (
                          <div key={i} className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="flex items-start gap-2">
                              <button onClick={() => speak(ex.korean)} className="w-6 h-6 flex items-center justify-center cursor-pointer flex-shrink-0 mt-0.5 rounded-lg transition-all" style={{ color: "rgba(255,255,255,0.25)" }}>
                                <i className="ri-volume-up-line text-sm"></i>
                              </button>
                              <div>
                                <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }} lang="ko">{ex.korean}</p>
                                {ex.pronunciation && <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{ex.pronunciation}</p>}
                                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{ex.vietnamese}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Memory tip tab */}
                    {activeTab === "examples" && (
                      <div>
                        {result.memory_tip ? (
                          <div className="space-y-3">
                            <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(232,200,74,0.06)", border: "1px solid rgba(232,200,74,0.15)" }}>
                              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: "#e8c84a" }}>
                                <i className="ri-lightbulb-flash-line"></i>Mẹo nhớ
                              </p>
                              <p className="text-sm leading-relaxed" style={{ color: "rgba(232,200,74,0.75)" }}>{result.memory_tip}</p>
                            </div>
                            {result.hanja && (
                              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)" }}>
                                <p className="text-xs font-semibold mb-2" style={{ color: "#a78bfa" }}>Chữ Hán</p>
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>{result.hanja}</span>
                                  <div>
                                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Gốc: <span style={{ color: "#a78bfa" }}>{result.root_char}</span></p>
                                    {result.root_meaning && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{result.root_meaning}</p>}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.25)" }}>Chưa có mẹo nhớ</p>
                        )}
                      </div>
                    )}

                    {/* Related words tab */}
                    {activeTab === "related" && (
                      <div>
                        {related.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {related.map((c, i) => (
                              <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => speak(c.word)} className="w-7 h-7 flex items-center justify-center cursor-pointer rounded-lg" style={{ color: "rgba(255,255,255,0.25)" }}>
                                    <i className="ri-volume-up-line text-sm"></i>
                                  </button>
                                  <div>
                                    <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.8)" }} lang="ko">{c.word}</p>
                                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{c.meaning}</p>
                                  </div>
                                </div>
                                <button onClick={() => { setQuery(c.word); handleInput(c.word); }}
                                  className="text-xs cursor-pointer whitespace-nowrap" style={{ color: "#e8c84a" }}>
                                  Tra cứu
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.25)" }}>Chưa có từ liên quan</p>
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
