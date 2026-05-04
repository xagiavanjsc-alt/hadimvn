import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { epsVocabulary } from "@/mocks/epsVocabulary";
import { seoulBooks } from "@/mocks/seoulTextbook";

// --- Navigation items ---------------------------------------------------------
interface NavItem {
  path: string;
  label: string;
  group: string;
  icon: string;
  keywords?: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { path: "/conversation", label: "Ti?ng Hàn Giao Ti?p", group: "H?c ti?ng Hàn", icon: "ri-chat-voice-line", keywords: "h?i tho?i giao ti?p ai" },
  { path: "/vocabulary", label: "T? v?ng t?ng h?p", group: "H?c ti?ng Hàn", icon: "ri-translate-2", keywords: "t? v?ng t?ng h?p" },
  { path: "/grammar", label: "Ng? pháp", group: "H?c ti?ng Hàn", icon: "ri-book-2-line", keywords: "ng? pháp grammar" },
  { path: "/hangul", label: "B?ng ch? Hangul", group: "H?c ti?ng Hàn", icon: "ri-font-size", keywords: "hangul b?ng ch? cái" },
  { path: "/hanja-vocab", label: "T? v?ng Hán Hàn", group: "H?c ti?ng Hàn", icon: "ri-character-recognition-line", keywords: "hán hàn hanja t? v?ng" },
  { path: "/flashcard", label: "Flashcard", group: "H?c ti?ng Hàn", icon: "ri-stack-line", keywords: "flashcard th? h?c" },
  { path: "/daily-review", label: "Ôn t?p hàng ngày", group: "H?c ti?ng Hàn", icon: "ri-sun-line", keywords: "ôn t?p hàng ngày daily" },
  { path: "/smart-review", label: "Ôn t?p thông minh", group: "H?c ti?ng Hàn", icon: "ri-brain-line", keywords: "ôn t?p thông minh spaced" },
  { path: "/listen-practice", label: "Luy?n phát âm AI", group: "H?c ti?ng Hàn", icon: "ri-mic-2-line", keywords: "phát âm luy?n nói ai" },
  { path: "/vocab-favorites", label: "T? yêu thích", group: "H?c ti?ng Hàn", icon: "ri-bookmark-fill", keywords: "yêu thích bookmark" },
  { path: "/dictionary", label: "T? di?n", group: "H?c ti?ng Hàn", icon: "ri-search-2-line", keywords: "t? di?n dictionary" },
  { path: "/advanced-dictionary", label: "Tra c?u Hán Hàn", group: "H?c ti?ng Hàn", icon: "ri-character-recognition-line", keywords: "tra c?u hán hàn advanced dictionary" },
  { path: "/phrase-dictionary", label: "T? di?n c?m t?", group: "H?c ti?ng Hàn", icon: "ri-chat-3-line", keywords: "c?m t? phrase" },
  { path: "/pronunciation", label: "Luy?n phát âm", group: "H?c ti?ng Hàn", icon: "ri-mic-line", keywords: "phát âm pronunciation" },
  { path: "/wrong-review", label: "Ôn t?p câu sai", group: "H?c ti?ng Hàn", icon: "ri-error-warning-line", keywords: "câu sai wrong review" },
  { path: "/topik-test", label: "Thi th? TOPIK I", group: "TOPIK", icon: "ri-file-list-2-line", keywords: "topik 1 thi th?" },
  { path: "/topik2-test", label: "Thi th? TOPIK II", group: "TOPIK", icon: "ri-file-list-3-line", keywords: "topik 2 thi th?" },
  { path: "/topik-dictionary", label: "T? di?n TOPIK", group: "TOPIK", icon: "ri-search-2-line", keywords: "t? di?n topik" },
  { path: "/topik-flashcard", label: "Flashcard TOPIK", group: "TOPIK", icon: "ri-stack-line", keywords: "flashcard topik" },
  { path: "/topik-listening", label: "Luy?n nghe TOPIK", group: "TOPIK", icon: "ri-headphone-line", keywords: "nghe topik listening" },
  { path: "/topik-reading", label: "Luy?n d?c TOPIK", group: "TOPIK", icon: "ri-book-read-line", keywords: "d?c topik reading" },
  { path: "/eps-lessons", label: "60 Bài H?c EPS", group: "EPS-TOPIK", icon: "ri-book-open-line", keywords: "bài h?c eps 60" },
  { path: "/eps-vocabulary", label: "T? v?ng EPS", group: "EPS-TOPIK", icon: "ri-translate-2", keywords: "t? v?ng eps" },
  { path: "/eps-exam", label: "Thi th? EPS (40 câu)", group: "EPS-TOPIK", icon: "ri-timer-line", keywords: "thi th? eps 40 câu" },
  { path: "/eps-mock-exam", label: "Thi mô ph?ng EPS", group: "EPS-TOPIK", icon: "ri-file-list-3-line", keywords: "thi mô ph?ng eps mock" },
  { path: "/eps-flashcard", label: "Flashcard EPS", group: "EPS-TOPIK", icon: "ri-stack-line", keywords: "flashcard eps" },
  { path: "/eps-listening", label: "Luy?n nghe EPS", group: "EPS-TOPIK", icon: "ri-headphone-line", keywords: "nghe eps listening" },
  { path: "/eps-speaking", label: "Luy?n nói EPS", group: "EPS-TOPIK", icon: "ri-mic-line", keywords: "nói eps speaking" },
  { path: "/eps-stats", label: "Th?ng kê EPS", group: "EPS-TOPIK", icon: "ri-bar-chart-grouped-line", keywords: "th?ng kê eps stats" },
  { path: "/seoul-textbook", label: "Giáo Trình Seoul 1A–4B", group: "Giáo Trình Seoul", icon: "ri-book-3-line", keywords: "giáo trình seoul 1a 4b" },
  { path: "/seoul-practice", label: "Luy?n t?p Seoul", group: "Giáo Trình Seoul", icon: "ri-gamepad-line", keywords: "luy?n t?p seoul" },
  { path: "/seoul-flashcard", label: "Flashcard Seoul", group: "Giáo Trình Seoul", icon: "ri-stack-line", keywords: "flashcard seoul" },
  { path: "/community", label: "C?ng d?ng", group: "C?ng d?ng & Ti?n d?", icon: "ri-group-line", keywords: "c?ng d?ng community" },
  { path: "/leaderboard", label: "B?ng x?p h?ng", group: "C?ng d?ng & Ti?n d?", icon: "ri-trophy-line", keywords: "b?ng x?p h?ng leaderboard" },
  { path: "/achievements", label: "Huy hi?u", group: "C?ng d?ng & Ti?n d?", icon: "ri-medal-line", keywords: "huy hi?u achievements badge" },
  { path: "/study-calendar", label: "L?ch h?c t?p", group: "C?ng d?ng & Ti?n d?", icon: "ri-calendar-2-line", keywords: "l?ch h?c t?p calendar" },
  { path: "/melon", label: "K-pop Lesson", group: "K-pop & N?i dung", icon: "ri-music-2-line", keywords: "kpop melon nh?c hàn" },
  { path: "/melon-flashcard", label: "Flashcard K-pop", group: "K-pop & N?i dung", icon: "ri-stack-line", keywords: "flashcard kpop melon" },
  { path: "/naver", label: "Naver KiN", group: "K-pop & N?i dung", icon: "ri-question-answer-line", keywords: "naver kin h?i dáp" },
  { path: "/ebook", label: "Ebook Builder", group: "K-pop & N?i dung", icon: "ri-book-2-line", keywords: "ebook builder t?o sách" },
  { path: "/news", label: "H?c qua Tin t?c", group: "K-pop & N?i dung", icon: "ri-newspaper-line", keywords: "tin t?c news h?c" },
  { path: "/profile", label: "H? so h?c viên", group: "Tài kho?n", icon: "ri-user-3-line", keywords: "h? so profile" },
  { path: "/account-settings", label: "Cài d?t tài kho?n", group: "Tài kho?n", icon: "ri-settings-3-line", keywords: "cài d?t tài kho?n settings" },
  { path: "/pricing", label: "Gói VIP", group: "Tài kho?n", icon: "ri-vip-crown-line", keywords: "vip gói pricing" },
  { path: "/onboarding", label: "T?o l? trình h?c", group: "Tài kho?n", icon: "ri-route-line", keywords: "l? trình h?c onboarding" },
  { path: "/all-features", label: "T?t c? tính nang", group: "Tài kho?n", icon: "ri-apps-2-line", keywords: "t?t c? tính nang all features" },
];

// --- Vocabulary data (built-in dictionary) -----------------------------------
interface VocabItem {
  word: string;
  romanization: string;
  meaning: string;
  level: string;
  path: string;
  source?: string;
}

const VOCAB_DATA: VocabItem[] = [
  { word: "??", romanization: "sa-rang", meaning: "Tình yêu", level: "A1", path: "/advanced-dictionary" },
  { word: "??", romanization: "haeng-bok", meaning: "H?nh phúc", level: "A2", path: "/advanced-dictionary" },
  { word: "??", romanization: "gong-bu", meaning: "H?c t?p", level: "A1", path: "/advanced-dictionary" },
  { word: "????", romanization: "a-reum-dap-da", meaning: "Ð?p, xinh d?p", level: "A2", path: "/advanced-dictionary" },
  { word: "??", romanization: "saeng-gak", meaning: "Suy nghi", level: "A2", path: "/advanced-dictionary" },
  { word: "??", romanization: "no-ryeok", meaning: "N? l?c, c? g?ng", level: "B1", path: "/advanced-dictionary" },
  { word: "??", romanization: "gyeong-heom", meaning: "Kinh nghi?m", level: "B1", path: "/advanced-dictionary" },
  { word: "??", romanization: "bal-jeon", meaning: "Phát tri?n", level: "B2", path: "/advanced-dictionary" },
  { word: "?????", romanization: "an-nyeong-ha-se-yo", meaning: "Xin chào (l?ch s?)", level: "A1", path: "/vocabulary" },
  { word: "?????", romanization: "gam-sa-ham-ni-da", meaning: "C?m on", level: "A1", path: "/vocabulary" },
  { word: "?????", romanization: "mi-an-ham-ni-da", meaning: "Xin l?i", level: "A1", path: "/vocabulary" },
  { word: "????", romanization: "gwaen-chan-a-yo", meaning: "Không sao", level: "A1", path: "/vocabulary" },
  { word: "???", romanization: "mas-it-da", meaning: "Ngon", level: "A1", path: "/vocabulary" },
  { word: "???", romanization: "ye-ppeu-da", meaning: "Ð?p (ngo?i hình)", level: "A1", path: "/vocabulary" },
  { word: "????", romanization: "jae-mi-it-da", meaning: "Thú v?, vui", level: "A1", path: "/vocabulary" },
  { word: "???", romanization: "him-deul-da", meaning: "Khó khan, m?t m?i", level: "A2", path: "/vocabulary" },
  { word: "???", romanization: "ba-ppeu-da", meaning: "B?n r?n", level: "A2", path: "/vocabulary" },
  { word: "????", romanization: "jung-yo-ha-da", meaning: "Quan tr?ng", level: "B1", path: "/vocabulary" },
  { word: "????", romanization: "pil-yo-ha-da", meaning: "C?n thi?t", level: "B1", path: "/vocabulary" },
  { word: "????", romanization: "ga-neung-ha-da", meaning: "Có th?, kh? thi", level: "B1", path: "/vocabulary" },
  { word: "??", romanization: "mun-hwa", meaning: "Van hóa", level: "A2", path: "/vocabulary" },
  { word: "??", romanization: "eum-sik", meaning: "Th?c an, ?m th?c", level: "A1", path: "/vocabulary" },
  { word: "??", romanization: "yeo-haeng", meaning: "Du l?ch", level: "A2", path: "/vocabulary" },
  { word: "??", romanization: "chin-gu", meaning: "B?n bè", level: "A1", path: "/vocabulary" },
  { word: "??", romanization: "ga-jok", meaning: "Gia dình", level: "A1", path: "/vocabulary" },
  { word: "??", romanization: "hak-gyo", meaning: "Tru?ng h?c", level: "A1", path: "/vocabulary" },
  { word: "??", romanization: "hoe-sa", meaning: "Công ty", level: "A2", path: "/vocabulary" },
  { word: "??", romanization: "si-gan", meaning: "Th?i gian", level: "A1", path: "/vocabulary" },
  { word: "??", romanization: "nal-ssi", meaning: "Th?i ti?t", level: "A1", path: "/vocabulary" },
  { word: "??", romanization: "geon-gang", meaning: "S?c kh?e", level: "A2", path: "/vocabulary" },
];

// Build EPS vocab search index (lazy, first 300 items)
const EPS_VOCAB_INDEX: VocabItem[] = epsVocabulary.slice(0, 300).map(v => ({
  word: v.korean,
  romanization: v.reading,
  meaning: v.vietnamese,
  level: v.level === "basic" ? "A1" : v.level === "intermediate" ? "A2" : "B1",
  path: "/eps-vocabulary",
  source: "EPS",
}));

// Build Seoul vocab search index (flatten all books, first 200 items)
const SEOUL_VOCAB_INDEX: VocabItem[] = (() => {
  const items: VocabItem[] = [];
  for (const book of seoulBooks) {
    for (const lesson of book.lessons) {
      for (const v of lesson.vocabulary) {
        items.push({
          word: v.korean,
          romanization: v.pronunciation,
          meaning: v.vietnamese,
          level: book.level,
          path: "/seoul-textbook",
          source: `Seoul ${book.level}`,
        });
        if (items.length >= 200) break;
      }
      if (items.length >= 200) break;
    }
    if (items.length >= 200) break;
  }
  return items;
})();

// --- Naver Q&A data -----------------------------------------------------------
interface QAItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const DEFAULT_QA: QAItem[] = [
  { id: 1, question: "??? ??? ??? ???? ????", answer: "?? ???? ???? ?? ????.", category: "???" },
  { id: 2, question: "TOPIK ?? ??? ??? ?????", answer: "?? 3~6?? ??? ???? ???.", category: "TOPIK" },
  { id: 3, question: "?? ???? ???? ?? ? ????", answer: "?! ???? ????? ??? ??? ??? ? ?? ??????.", category: "??" },
  { id: 4, question: "??? ??? ??? ??? ????", answer: "?????? ?? ???(SRS)? ???? ????? ??? ?? ? ????.", category: "??" },
  { id: 5, question: "??? ??? ?? ???? ??? ?? ????", answer: "?? ?? ??? ?? ???, ??? ?? ????? ???? ??? ?????.", category: "??" },
];

function loadQA(): QAItem[] {
  try {
    const raw = localStorage.getItem("kts_naver_qa");
    if (raw) return JSON.parse(raw) as QAItem[];
  } catch { /* ignore */ }
  return DEFAULT_QA;
}

// --- Colors -------------------------------------------------------------------
const GROUP_COLORS: Record<string, string> = {
  "H?c ti?ng Hàn": "#34d399",
  "TOPIK": "#60a5fa",
  "EPS-TOPIK": "#fb923c",
  "Giáo Trình Seoul": "#a78bfa",
  "C?ng d?ng & Ti?n d?": "#f472b6",
  "K-pop & N?i dung": "app-accent-primary",
  "Tài kho?n": "#94a3b8",
  "T? v?ng": "app-accent-primary",
  "Naver Q&A": "#03C75A",
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "#4ade80", A2: "#34d399", B1: "#38bdf8", B2: "#a78bfa", C1: "#fb923c", C2: "#f87171",
};

// --- Highlight ----------------------------------------------------------------
function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded px-0.5" style={{ backgroundColor: "rgba(232,200,74,0.25)", color: "app-accent-primary" }}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// --- Result types -------------------------------------------------------------
type ResultItem =
  | { type: "nav"; item: NavItem }
  | { type: "vocab"; item: VocabItem }
  | { type: "qa"; item: QAItem };

// --- Main component -----------------------------------------------------------
function GlobalSearchInner() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeFilter, setActiveFilter] = useState<"all" | "nav" | "vocab" | "qa">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const qaData = useMemo(() => loadQA(), []);

  const results: ResultItem[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // Default: show popular nav items
      return ALL_NAV_ITEMS.slice(0, 6).map(item => ({ type: "nav" as const, item }));
    }

    const navResults: ResultItem[] = ALL_NAV_ITEMS
      .filter(item =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        (item.keywords || "").toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map(item => ({ type: "nav" as const, item }));

    const allVocab = [...VOCAB_DATA, ...EPS_VOCAB_INDEX, ...SEOUL_VOCAB_INDEX];
    const vocabResults: ResultItem[] = allVocab
      .filter(v =>
        v.word.includes(q) ||
        v.romanization.toLowerCase().includes(q) ||
        v.meaning.toLowerCase().includes(q)
      )
      .slice(0, 6)
      .map(item => ({ type: "vocab" as const, item }));

    const qaResults: ResultItem[] = qaData
      .filter(qa =>
        qa.question.toLowerCase().includes(q) ||
        qa.answer.toLowerCase().includes(q) ||
        qa.category.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map(item => ({ type: "qa" as const, item }));

    const all = [...navResults, ...vocabResults, ...qaResults];

    if (activeFilter === "nav") return navResults;
    if (activeFilter === "vocab") return vocabResults;
    if (activeFilter === "qa") return qaResults;
    return all;
  }, [query, activeFilter, qaData]);

  useEffect(() => { setActiveIdx(0); }, [query, activeFilter]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setOpen(v => !v); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQuery(""); setActiveFilter("all"); }
  }, [open]);

  const handleSelect = useCallback((path: string, extra?: string) => {
    if (extra) {
      navigate(path, { state: { searchWord: extra } });
    } else {
      navigate(path);
    }
    setOpen(false);
    setQuery("");
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[activeIdx]) {
      const r = results[activeIdx];
      if (r.type === "nav") handleSelect(r.item.path);
      else if (r.type === "vocab") handleSelect(r.item.path, r.item.word);
      else if (r.type === "qa") handleSelect("/naver");
    }
  };

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const hasQuery = query.trim().length > 0;
  const navCount = hasQuery ? results.filter(r => r.type === "nav").length : 0;
  const vocabCount = hasQuery ? results.filter(r => r.type === "vocab").length : 0;
  const qaCount = hasQuery ? results.filter(r => r.type === "qa").length : 0;

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap"
        style={{ backgroundColor: "var(--dash-hover, rgba(255,255,255,0.04))", borderColor: "var(--dash-border, rgba(255,255,255,0.08))" }}
        title="Tìm ki?m (Ctrl+K)"
      >
        <i className="ri-search-line text-sm" style={{ color: "var(--dash-text-muted, rgba(255,255,255,0.35))" }}></i>
        <span className="text-xs" style={{ color: "var(--dash-text-muted, rgba(255,255,255,0.35))" }}>Tìm ki?m...</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono" style={{ backgroundColor: "var(--dash-hover)", color: "var(--dash-text-muted)", border: "1px solid var(--dash-border)" }}>?K</span>
      </button>

      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-8 h-8 flex items-center justify-center rounded-xl cursor-pointer"
        style={{ backgroundColor: "var(--dash-hover)", border: "1px solid var(--dash-border)" }}
      >
        <i className="ri-search-line text-sm" style={{ color: "var(--dash-text-muted)" }}></i>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[8vh] px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-2xl overflow-hidden"
            style={{ backgroundColor: "var(--dash-card, #0f1117)", border: "1px solid var(--dash-border, rgba(255,255,255,0.1))" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: "var(--dash-border)" }}>
              <i className="ri-search-line text-lg flex-shrink-0" style={{ color: "var(--dash-text-muted)" }}></i>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tìm tính nang, t? v?ng, câu h?i..."
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{ color: "var(--dash-text, rgba(255,255,255,0.85))" }}
              />
              {query && (
                <button onClick={() => setQuery("")} className="cursor-pointer" style={{ color: "var(--dash-text-muted)" }}>
                  <i className="ri-close-line text-sm"></i>
                </button>
              )}
              <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0" style={{ backgroundColor: "var(--dash-hover)", color: "var(--dash-text-muted)", border: "1px solid var(--dash-border)" }}>ESC</kbd>
            </div>

            {/* Filter tabs — only show when there's a query */}
            {hasQuery && (navCount + vocabCount + qaCount) > 0 && (
              <div className="flex gap-1 px-3 pt-2.5 pb-1">
                {([
                  { key: "all", label: `T?t c? (${navCount + vocabCount + qaCount})` },
                  ...(navCount > 0 ? [{ key: "nav", label: `Tính nang (${navCount})` }] : []),
                  ...(vocabCount > 0 ? [{ key: "vocab", label: `T? v?ng (${vocabCount})` }] : []),
                  ...(qaCount > 0 ? [{ key: "qa", label: `Q&A (${qaCount})` }] : []),
                ] as { key: typeof activeFilter; label: string }[]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold cursor-pointer whitespace-nowrap transition-all"
                    style={{
                      backgroundColor: activeFilter === f.key ? "rgba(232,200,74,0.15)" : "rgba(255,255,255,0.04)",
                      color: activeFilter === f.key ? "app-accent-primary" : "rgba(255,255,255,0.35)",
                      border: activeFilter === f.key ? "1px solid rgba(232,200,74,0.25)" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Results */}
            <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <i className="ri-search-line text-3xl" style={{ color: "var(--dash-text-muted)" }}></i>
                  <p className="text-sm" style={{ color: "var(--dash-text-muted)" }}>Không tìm th?y &quot;{query}&quot;</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Th? tìm b?ng ti?ng Hàn, romanization ho?c ti?ng Vi?t</p>
                </div>
              ) : (
                <>
                  {!hasQuery && (
                    <p className="px-4 py-1.5 text-[10px] tracking-normal font-semibold" style={{ color: "var(--dash-text-muted)" }}>
                      G?i ý nhanh
                    </p>
                  )}
                  {results.map((r, i) => {
                    const isActive = i === activeIdx;
                    const bg = isActive ? "var(--dash-hover, rgba(255,255,255,0.05))" : "transparent";

                    if (r.type === "nav") {
                      const color = GROUP_COLORS[r.item.group] || "app-accent-primary";
                      return (
                        <button
                          key={`nav-${r.item.path}`}
                          data-idx={i}
                          onClick={() => handleSelect(r.item.path)}
                          onMouseEnter={() => setActiveIdx(i)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer"
                          style={{ backgroundColor: bg }}
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                            <i className={`${r.item.icon} text-sm`} style={{ color }}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: "var(--dash-text, rgba(255,255,255,0.85))" }}>
                              {highlight(r.item.label, query)}
                            </p>
                            <p className="text-[10px] truncate" style={{ color: "var(--dash-text-muted)" }}>{r.item.group}</p>
                          </div>
                          {isActive && <i className="ri-corner-down-left-line text-xs flex-shrink-0" style={{ color: "var(--dash-text-muted)" }}></i>}
                        </button>
                      );
                    }

                    if (r.type === "vocab") {
                      const lc = LEVEL_COLORS[r.item.level] || "app-accent-primary";
                      return (
                        <button
                          key={`vocab-${r.item.word}`}
                          data-idx={i}
                          onClick={() => handleSelect(r.item.path, r.item.word)}
                          onMouseEnter={() => setActiveIdx(i)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer"
                          style={{ backgroundColor: bg }}
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: "rgba(232,200,74,0.10)" }}>
                            <span className="text-sm font-bold" style={{ color: "app-accent-primary" }}>{r.item.word.slice(0, 2)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>
                                {highlight(r.item.word, query)}
                              </p>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0" style={{ backgroundColor: `${lc}18`, color: lc }}>{r.item.level}</span>
                            </div>
                            <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.35)" }}>
                              [{r.item.romanization}] — {highlight(r.item.meaning, query)}
                            </p>
                          </div>
                          <span className="text-[10px] flex-shrink-0 px-1.5 py-0.5 rounded" style={{ color: "rgba(255,255,255,0.3)", backgroundColor: "rgba(255,255,255,0.05)" }}>
                            {r.item.source || "T? v?ng"}
                          </span>
                          {isActive && <i className="ri-corner-down-left-line text-xs flex-shrink-0" style={{ color: "var(--dash-text-muted)" }}></i>}
                        </button>
                      );
                    }

                    if (r.type === "qa") {
                      return (
                        <button
                          key={`qa-${r.item.id}`}
                          data-idx={i}
                          onClick={() => handleSelect("/naver")}
                          onMouseEnter={() => setActiveIdx(i)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer"
                          style={{ backgroundColor: bg }}
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: "rgba(3,199,90,0.10)" }}>
                            <i className="ri-question-line text-sm" style={{ color: "#03C75A" }}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: "rgba(255,255,255,0.8)" }}>
                              {highlight(r.item.question, query)}
                            </p>
                            <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.3)" }}>
                              Naver KiN · {r.item.category}
                            </p>
                          </div>
                          {isActive && <i className="ri-corner-down-left-line text-xs flex-shrink-0" style={{ color: "var(--dash-text-muted)" }}></i>}
                        </button>
                      );
                    }

                    return null;
                  })}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t" style={{ borderColor: "var(--dash-border)" }}>
              {[{ key: "??", label: "Di chuy?n" }, { key: "?", label: "Ch?n" }, { key: "ESC", label: "Ðóng" }].map(k => (
                <div key={k.key} className="flex items-center gap-1.5">
                  <kbd className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: "var(--dash-hover)", color: "var(--dash-text-muted)", border: "1px solid var(--dash-border)" }}>{k.key}</kbd>
                  <span className="text-[10px]" style={{ color: "var(--dash-text-muted)" }}>{k.label}</span>
                </div>
              ))}
              <span className="ml-auto text-[10px]" style={{ color: "var(--dash-text-muted)" }}>{results.length} k?t qu?</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const GlobalSearch = memo(GlobalSearchInner);
export default GlobalSearch;
