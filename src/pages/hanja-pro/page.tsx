import { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";

interface HanjaEntry {
  id: number;
  hangul: string;
  hanja: string;
  meaning_vn: string | null;
  slug: string;
}

interface HanjaQuizEntry extends HanjaEntry {
  examples: { ko: string; vi: string; boi?: string }[];
}

function getShortMeaning(entry: HanjaEntry): string {
  return entry.meaning_vn ?? "";
}

export default function HanjaProPage() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<HanjaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterChar, setFilterChar] = useState<string | null>(null);
  const [known] = useLocalStorage<Record<number, boolean>>("kts_hanja_pro_known", {});
  const [favorites] = useLocalStorage<Record<number, boolean>>("kts_hanja_pro_fav", {});
  const [quizMode, setQuizMode] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizEntries, setQuizEntries] = useState<HanjaQuizEntry[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    supabase
      .from("hanja_pro")
      .select("id,hangul,hanja,meaning_vn,slug")
      .order("id", { ascending: true })
      .limit(10000)
      .then(({ data, error }) => {
        if (error) console.error("[hanja_pro] fetch error:", error);
        else setEntries(data ?? []);
        setLoading(false);
      });
  }, []);

  const UNIQUE_CHARS = useMemo(() =>
    Array.from(new Set(entries.flatMap(e => e.hanja.split("").filter(c => /[\u4e00-\u9fff]/.test(c))))).sort(),
  [entries]);

  const filtered = useMemo(() => {
    let list = entries;
    if (filterChar) list = list.filter(e => e.hanja.includes(filterChar));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.hangul.toLowerCase().includes(q) ||
        e.hanja.includes(q) ||
        (e.meaning_vn?.toLowerCase().includes(q) ?? false)
      );
    }
    return list;
  }, [entries, search, filterChar]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page, PAGE_SIZE]);

  const stats = useMemo(() => ({
    total: entries.length,
    known: Object.values(known).filter(Boolean).length,
    favorites: Object.values(favorites).filter(Boolean).length,
  }), [entries, known, favorites]);

  useEffect(() => { setPage(1); }, [search, filterChar]);

  const openDetail = useCallback((entry: HanjaEntry) => {
    navigate(`/hanja-pro/${entry.slug}`);
  }, [navigate]);

  const startQuiz = useCallback(async () => {
    setQuizLoading(true);
    const { data } = await supabase
      .from("hanja_pro")
      .select("id,hangul,hanja,meaning_vn,slug,examples")
      .limit(200)
      .order("id", { ascending: true });
    const shuffled = ((data ?? []) as HanjaQuizEntry[]).sort(() => Math.random() - 0.5).slice(0, 10);
    setQuizEntries(shuffled);
    setQuizLoading(false);
    setQuizMode(true);
    setQuizIdx(0);
    setQuizAnswered(null);
    setQuizScore({ correct: 0, total: 0 });
  }, []);

  const quizCurrent = quizEntries[quizIdx];
  const quizOptions = useMemo(() => {
    if (!quizCurrent) return [];
    const others = quizEntries.filter(e => e.id !== quizCurrent.id)
      .sort(() => Math.random() - 0.5).slice(0, 3);
    return [...others, quizCurrent].sort(() => Math.random() - 0.5);
  }, [quizCurrent, quizEntries]);

  const playTTS = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const handleQuizAnswer = (id: number) => {
    if (quizAnswered !== null) return;
    setQuizAnswered(id);
    const correct = id === quizCurrent.id;
    setQuizScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
  };

  const handleNextQuiz = () => {
    if (quizIdx + 1 >= quizEntries.length) {
      setQuizMode(false);
      setQuizIdx(0);
      setQuizAnswered(null);
    } else {
      setQuizIdx(i => i + 1);
      setQuizAnswered(null);
    }
  };

  // ─── Quiz Loading ────────────────────────────────────────────────────────
  if (quizLoading) {
    return (
      <DashboardLayout title="Quiz Hán Hàn" subtitle="Đang tải câu hỏi...">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-app-accent-primary/30 border-t-app-accent-primary rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Quiz Mode ──────────────────────────────────────────────────────────
  if (quizMode && quizCurrent) {
    const example = quizCurrent.examples[0];
    return (
      <DashboardLayout title="Quiz Hán Hàn" subtitle={`Câu ${quizIdx + 1}/${quizEntries.length} · Điểm: ${quizScore.correct}/${quizScore.total}`}>
        <div className="max-w-3xl mx-auto">
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 mb-6">
            <p className="text-app-text-muted text-sm mb-4">Chọn từ Hán Hàn phù hợp với ví dụ sau:</p>
            {example && (
              <div className="bg-app-card/30 rounded-xl p-5 mb-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-white text-xl font-medium leading-relaxed flex-1" lang="ko">{example.ko}</p>
                  <button onClick={() => playTTS(example.ko)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-app-accent-primary/15 text-app-accent-primary hover:bg-app-accent-primary/25 transition-colors">
                    <i className="ri-volume-up-line text-lg"></i>
                  </button>
                </div>
                <p className="text-app-text-secondary text-base italic">{example.vi}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {quizOptions.map(opt => {
                const isCorrect = opt.id === quizCurrent.id;
                const isChosen = quizAnswered === opt.id;
                let bgColor = "bg-app-card/40 border-app-border hover:border-app-accent-primary/40";
                if (quizAnswered !== null) {
                  if (isCorrect) bgColor = "bg-emerald-500/15 border-emerald-500/50";
                  else if (isChosen) bgColor = "bg-red-500/15 border-red-500/50";
                  else bgColor = "bg-app-card/20 border-app-border opacity-60";
                }
                return (
                  <button
                    key={opt.id}
                    disabled={quizAnswered !== null}
                    onClick={() => handleQuizAnswer(opt.id)}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${bgColor} ${quizAnswered === null ? "cursor-pointer" : "cursor-default"}`}
                  >
                    <p className="text-white font-bold text-lg" lang="ko">{opt.hangul}</p>
                    <p className="text-app-accent-primary text-sm mt-1">{opt.hanja}</p>
                    {quizAnswered !== null && isCorrect && (
                      <p className="text-emerald-400 text-xs mt-2 line-clamp-2">{getShortMeaning(opt) || "—"}</p>
                    )}
                  </button>
                );
              })}
            </div>

            {quizAnswered !== null && (
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setQuizMode(false); setQuizIdx(0); setQuizAnswered(null); }} className="px-5 py-2.5 bg-app-card/50 hover:bg-app-card/70 text-white/70 rounded-xl text-sm font-medium cursor-pointer">
                  Thoát
                </button>
                <button onClick={handleNextQuiz} className="px-6 py-2.5 bg-app-accent-primary hover:bg-app-accent-primary/90 text-app-bg rounded-xl text-sm font-bold cursor-pointer">
                  {quizIdx + 1 >= quizEntries.length ? "Hoàn thành" : "Câu tiếp"} <i className="ri-arrow-right-line ml-1"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Hán Hàn Chuyên Sâu"
      subtitle={loading ? "Đang tải..." : `${stats.total} từ (${filtered.length} hiển thị) · Đã thuộc ${stats.known} · Yêu thích ${stats.favorites}`}
      actions={
        <button
          onClick={startQuiz}
          className="flex items-center gap-2 bg-app-accent-primary hover:bg-app-accent-primary/90 text-app-bg text-sm font-bold px-4 py-2.5 rounded-xl cursor-pointer whitespace-nowrap"
        >
          <i className="ri-brain-line"></i>Làm quiz 10 câu
        </button>
      }
    >
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-app-accent-primary/30 border-t-app-accent-primary rounded-full animate-spin"></div>
        </div>
      )}

      {/* Search + filter */}
      {!loading && <div className="bg-app-bg border border-app-border rounded-2xl p-4 mb-6">
        <div className="flex gap-3 mb-3">
          <div className="flex-1 relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted"></i>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo hangul, hanja, hoặc nghĩa..."
              className="w-full bg-app-card/40 border border-app-border rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-app-accent-primary/40"
            />
          </div>
          {(filterChar || search) && (
            <button
              onClick={() => { setFilterChar(null); setSearch(""); }}
              className="px-4 py-2.5 bg-app-card/40 hover:bg-app-card/60 text-white/70 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap"
            >
              <i className="ri-close-line mr-1"></i>Xóa filter
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-app-text-muted text-xs py-1.5 mr-1">Lọc theo gốc Hán:</span>
          {UNIQUE_CHARS.slice(0, 30).map(char => (
            <button
              key={char}
              onClick={() => setFilterChar(filterChar === char ? null : char)}
              className={`px-2.5 py-1 rounded-lg text-sm font-medium transition-colors ${filterChar === char ? "bg-app-accent-primary text-app-bg" : "bg-app-card/40 text-white/70 hover:bg-app-card/60"}`}
            >
              {char}
            </button>
          ))}
        </div>
      </div>}

      {!loading && (
        <>
          {/* Grid — 1 col mobile cho dễ đọc, tăng dần ở desktop */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-app-text-muted text-sm">Hiển thị <span className="text-white font-medium">{(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, filtered.length)}</span> / <span className="text-app-accent-primary font-medium">{filtered.length}</span> từ</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {paginated.map(entry => {
              const isKnown = known[entry.id];
              const isFav = favorites[entry.id];
              const meaning = getShortMeaning(entry);
              return (
                <button
                  key={entry.id}
                  onClick={() => openDetail(entry)}
                  className={`relative bg-app-bg border rounded-xl p-4 text-left cursor-pointer transition-all hover:border-app-accent-primary/40 ${isKnown ? "border-emerald-500/40" : "border-app-border"}`}
                >
                  {isFav && <i className="ri-bookmark-fill absolute top-2 right-2 text-app-accent-primary text-sm"></i>}
                  {isKnown && <i className="ri-check-double-line absolute top-2 right-2 text-emerald-400 text-sm"></i>}
                  <p className="text-white font-bold text-base mb-1" lang="ko">{entry.hangul}</p>
                  <p className="text-app-accent-primary text-sm font-medium mb-2">{entry.hanja}</p>
                  <p className="text-app-text-secondary text-xs line-clamp-2">{meaning || "Nhấn để xem"}</p>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-app-text-muted">
              <i className="ri-search-line text-4xl mb-2"></i>
              <p>Không tìm thấy từ nào</p>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 bg-app-card/40 hover:bg-app-card/60 disabled:opacity-30 text-white rounded-xl text-sm cursor-pointer"
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium cursor-pointer ${
                      page === p ? "bg-app-accent-primary text-app-bg" : "bg-app-card/40 hover:bg-app-card/60 text-white/70"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 bg-app-card/40 hover:bg-app-card/60 disabled:opacity-30 text-white rounded-xl text-sm cursor-pointer"
              >
                <i className="ri-arrow-right-s-line"></i>
              </button>
              <span className="text-app-text-muted text-sm ml-2">Trang {page}/{totalPages}</span>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
