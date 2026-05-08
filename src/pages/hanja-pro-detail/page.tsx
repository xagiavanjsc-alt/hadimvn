import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";

interface HanjaEntry {
  id: number;
  hangul: string;
  hanja: string;
  meaning_vn: string | null;
  slug: string;
  hanja_breakdown: { char: string; reading: string; meaning: string }[];
  examples: { ko: string; vi: string; boi?: string }[];
  related_words: { word: string; hanja: string; meaning: string }[];
  mnemonic: string | null;
  raw: string;
}

interface HanjaNav {
  id: number;
  hangul: string;
  hanja: string;
  slug: string;
}

function playTTS(text: string, lang = "ko-KR") {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

/** Strip leading "1. ", "2. ", etc. from raw section text. */
function stripLeadingNumber(s: string): string {
  return s.replace(/^\s*\d+\.\s*/, "").trim();
}

/** Extract first sentence after "Nghĩa tiếng Việt: ..." for hero subtitle. */
function getShortMeaning(entry: HanjaEntry): string {
  if (entry.meaning_vn && entry.meaning_vn.length > 1 && !/^[\u4e00-\u9fff]$/.test(entry.meaning_vn)) {
    return entry.meaning_vn;
  }
  // Fallback: first chunk of raw
  const m = entry.raw.match(/Nghĩa tiếng Việt[^:]*:\s*([^\n.]+)/);
  return m ? m[1].trim().replace(/^["“]|["”]$/g, "") : "";
}

/** Get full GIẢI NGHĨA text without the "1." prefix. */
function getMeaningSection(entry: HanjaEntry): string {
  const m = entry.raw.match(/1\.\s*GIẢI NGHĨA\s*:?\s*([\s\S]+?)(?=\n\s*2\.|\Z)/);
  return m ? m[1].trim() : "";
}

export default function HanjaProDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [known, setKnown] = useLocalStorage<Record<number, boolean>>("kts_hanja_pro_known", {});
  const [favorites, setFavorites] = useLocalStorage<Record<number, boolean>>("kts_hanja_pro_fav", {});
  const [entry, setEntry] = useState<HanjaEntry | null | undefined>(undefined);
  const [prev, setPrev] = useState<HanjaNav | null>(null);
  const [next, setNext] = useState<HanjaNav | null>(null);

  const decoded = slug ? decodeURIComponent(slug).toLowerCase() : "";

  useEffect(() => {
    if (!decoded) { setEntry(null); return; }
    setEntry(undefined);
    supabase
      .from("hanja_pro")
      .select("*")
      .eq("slug", decoded)
      .single()
      .then(async ({ data, error }) => {
        if (error || !data) { setEntry(null); return; }
        setEntry(data as HanjaEntry);
        // fetch prev
        const { data: prevData } = await supabase
          .from("hanja_pro")
          .select("id,hangul,hanja,slug")
          .lt("id", data.id)
          .order("id", { ascending: false })
          .limit(1)
          .single();
        setPrev(prevData as HanjaNav | null);
        // fetch next
        const { data: nextData } = await supabase
          .from("hanja_pro")
          .select("id,hangul,hanja,slug")
          .gt("id", data.id)
          .order("id", { ascending: true })
          .limit(1)
          .single();
        setNext(nextData as HanjaNav | null);
      });
  }, [decoded]);

  // SEO: update document title + meta description per word
  useEffect(() => {
    if (!entry) return;
    const meaning = getShortMeaning(entry);
    document.title = `${entry.hangul} (${entry.hanja}) — ${meaning || "Hán Hàn"} | Hàn Quốc Ơi!`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    const desc = `Học từ Hán Hàn ${entry.hangul} (${entry.hanja})${meaning ? ` — nghĩa: ${meaning}` : ""}. Phân tích gốc Hán, ${entry.examples.length} ví dụ thực chiến, từ liên quan và mẹo nhớ.`;
    metaDesc.setAttribute("content", desc.slice(0, 160));

    // JSON-LD structured data
    const ldId = "hanja-jsonld";
    document.getElementById(ldId)?.remove();
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.id = ldId;
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      name: entry.hangul,
      alternateName: entry.hanja,
      description: meaning,
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        name: "Hán Hàn — Phần 1 (100 từ thông dụng)",
        url: "https://hanquocoi.vn/hanja-pro",
      },
    });
    document.head.appendChild(ld);

    return () => {
      document.getElementById(ldId)?.remove();
    };
  }, [entry]);

  // loading state (undefined = fetching, null = not found)
  if (entry === undefined) {
    return (
      <DashboardLayout title="Hán Hàn Chuyên Sâu">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-app-accent-primary/30 border-t-app-accent-primary rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (entry === null) {
    return (
      <DashboardLayout title="Không tìm thấy từ">
        <div className="max-w-2xl mx-auto py-16 text-center">
          <i className="ri-search-line text-5xl text-app-text-muted mb-4"></i>
          <h1 className="text-white text-xl font-bold mb-2">Không tìm thấy từ "{decoded}"</h1>
          <p className="text-app-text-secondary text-sm mb-6">Từ này có thể chưa có trong cơ sở dữ liệu.</p>
          <Link to="/hanja-pro" className="inline-flex items-center gap-2 px-5 py-2.5 bg-app-accent-primary text-app-bg rounded-xl font-bold text-sm">
            <i className="ri-arrow-left-line"></i>Về danh sách
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const meaning = getShortMeaning(entry);
  const fullMeaning = getMeaningSection(entry);
  const isKnown = !!known[entry.id];
  const isFav = !!favorites[entry.id];

  return (
    <DashboardLayout
      title={entry.hangul}
      subtitle={meaning ? `${entry.hanja} · ${meaning}` : entry.hanja}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFavorites(p => ({ ...p, [entry.id]: !p[entry.id] }))}
            className="flex items-center gap-1.5 px-3 py-2 bg-app-card/50 hover:bg-app-card/70 rounded-xl text-sm font-medium cursor-pointer"
            title="Yêu thích"
          >
            <i className={isFav ? "ri-bookmark-fill text-app-accent-primary" : "ri-bookmark-line text-app-text-muted"}></i>
            {isFav ? "Đã lưu" : "Lưu"}
          </button>
          <button
            onClick={() => setKnown(p => ({ ...p, [entry.id]: !p[entry.id] }))}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer ${isKnown ? "bg-emerald-500/15 text-emerald-400" : "bg-app-card/50 hover:bg-app-card/70 text-white/70"}`}
          >
            <i className={isKnown ? "ri-check-double-line" : "ri-check-line"}></i>
            {isKnown ? "Đã thuộc" : "Đánh dấu thuộc"}
          </button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-app-text-muted mb-4" aria-label="Breadcrumb">
          <Link to="/hanja-pro" className="hover:text-app-accent-primary">Hán Hàn Chuyên Sâu</Link>
          <i className="ri-arrow-right-s-line"></i>
          <span className="text-white/70">{entry.hangul}</span>
        </nav>

        {/* Hero card */}
        <header className="bg-gradient-to-br from-app-accent-primary/10 to-amber-500/5 border border-app-accent-primary/20 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-white text-4xl sm:text-5xl font-bold leading-none">{entry.hangul}</h1>
                <button
                  onClick={() => playTTS(entry.hangul)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-app-accent-primary/15 text-app-accent-primary hover:bg-app-accent-primary/25 cursor-pointer"
                  title="Đọc"
                >
                  <i className="ri-volume-up-line"></i>
                </button>
              </div>
              <p className="text-app-accent-primary text-2xl sm:text-3xl font-medium mb-3">{entry.hanja}</p>
              {meaning && (
                <p className="text-white/85 text-base sm:text-lg leading-relaxed">{meaning}</p>
              )}
            </div>

            {/* Hanja breakdown chips */}
            {entry.hanja_breakdown.length > 0 && (
              <div className="flex flex-col gap-2 min-w-[180px]">
                {entry.hanja_breakdown.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 bg-app-card/40 rounded-xl px-3 py-2 border border-app-border">
                    <span className="text-app-accent-primary text-3xl font-bold leading-none">{b.char}</span>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium leading-tight">{b.reading}</p>
                      <p className="text-app-text-secondary text-xs leading-tight">{b.meaning}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* ─── GIẢI NGHĨA ────────────────────────────────────────────────── */}
        {fullMeaning && (
          <section className="bg-app-bg border border-app-border rounded-2xl p-5 sm:p-6 mb-5" aria-labelledby="section-meaning">
            <h2 id="section-meaning" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <i className="ri-book-open-line text-app-accent-primary"></i>
              Giải nghĩa
            </h2>
            <div className="text-white/85 text-[15px] leading-relaxed whitespace-pre-wrap">
              {fullMeaning}
            </div>
          </section>
        )}

        {/* ─── VÍ DỤ THỰC CHIẾN ──────────────────────────────────────────── */}
        {entry.examples.length > 0 && (
          <section className="bg-app-bg border border-app-border rounded-2xl p-5 sm:p-6 mb-5" aria-labelledby="section-examples">
            <h2 id="section-examples" className="flex items-center gap-2 text-white font-bold text-lg mb-4">
              <i className="ri-chat-quote-line text-app-accent-primary"></i>
              {entry.examples.length} ví dụ thực chiến
            </h2>
            <ol className="space-y-3 list-none">
              {entry.examples.map((ex, i) => (
                <li key={i} className="bg-app-card/30 rounded-xl p-4 border border-app-border">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-app-accent-primary/15 text-app-accent-primary text-xs font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-white text-[15px] leading-relaxed flex-1" lang="ko">{ex.ko}</p>
                        <button
                          onClick={() => playTTS(ex.ko)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-accent-primary/15 text-app-accent-primary hover:bg-app-accent-primary/25 flex-shrink-0"
                          title="Nghe"
                        >
                          <i className="ri-volume-up-line text-sm"></i>
                        </button>
                      </div>
                      {ex.boi && <p className="text-app-text-muted text-xs italic mb-1">{ex.boi}</p>}
                      <p className="text-app-text-secondary text-sm leading-relaxed">{ex.vi}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* ─── TỪ LIÊN QUAN GỐC HÁN ─────────────────────────────────────── */}
        {entry.related_words.length > 0 && (
          <section className="bg-app-bg border border-app-border rounded-2xl p-5 sm:p-6 mb-5" aria-labelledby="section-related">
            <h2 id="section-related" className="flex items-center gap-2 text-white font-bold text-lg mb-4">
              <i className="ri-links-line text-app-accent-primary"></i>
              {entry.related_words.length} từ liên quan gốc Hán
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {entry.related_words.map((w, i) => {
                // If related word is in our dataset, link to it
                return (
                  <div key={i} className="bg-app-card/20 rounded-xl p-3 border border-app-border">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-bold text-base" lang="ko">{w.word}</p>
                      <p className="text-app-accent-primary text-sm">{w.hanja}</p>
                    </div>
                    <p className="text-app-text-secondary text-sm leading-relaxed">{w.meaning}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── MẸO NHỚ ───────────────────────────────────────────────────── */}
        {entry.mnemonic && (
          <section className="bg-gradient-to-br from-app-accent-primary/10 to-amber-500/10 border border-app-accent-primary/25 rounded-2xl p-5 sm:p-6 mb-6" aria-labelledby="section-mnemonic">
            <h2 id="section-mnemonic" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <i className="ri-lightbulb-flash-line text-app-accent-primary"></i>
              Mẹo nhớ
            </h2>
            <p className="text-white/90 text-[15px] leading-relaxed whitespace-pre-wrap">
              {stripLeadingNumber(entry.mnemonic)}
            </p>
          </section>
        )}

        {/* Prev/Next nav */}
        <nav className="flex items-stretch gap-3 mt-8" aria-label="Navigation">
          {prev ? (
            <Link
              to={`/hanja-pro/${prev.slug}`}
              className="flex-1 bg-app-card/30 hover:bg-app-card/50 border border-app-border hover:border-app-accent-primary/40 rounded-xl p-4 transition-colors group"
            >
              <p className="text-app-text-muted text-xs mb-1 flex items-center gap-1">
                <i className="ri-arrow-left-line"></i> Từ trước
              </p>
              <p className="text-white font-bold">{prev.hangul} <span className="text-app-accent-primary text-sm font-medium">{prev.hanja}</span></p>
            </Link>
          ) : <div className="flex-1" />}
          {next ? (
            <Link
              to={`/hanja-pro/${next.slug}`}
              className="flex-1 bg-app-card/30 hover:bg-app-card/50 border border-app-border hover:border-app-accent-primary/40 rounded-xl p-4 transition-colors text-right"
            >
              <p className="text-app-text-muted text-xs mb-1 flex items-center justify-end gap-1">
                Từ sau <i className="ri-arrow-right-line"></i>
              </p>
              <p className="text-white font-bold">{next.hangul} <span className="text-app-accent-primary text-sm font-medium">{next.hanja}</span></p>
            </Link>
          ) : <div className="flex-1" />}
        </nav>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/hanja-pro")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-app-card/50 hover:bg-app-card/70 text-white/70 rounded-xl text-sm font-medium cursor-pointer"
          >
            <i className="ri-grid-line"></i>Xem danh sách Hán Hàn
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
