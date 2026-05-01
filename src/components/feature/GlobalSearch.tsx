import { useState, useEffect, useRef, useCallback, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { epsVocabulary } from "@/mocks/epsVocabulary";
import { seoulBooks } from "@/mocks/seoulTextbook";

// ─── Navigation items ─────────────────────────────────────────────────────────
interface NavItem {
  path: string;
  label: string;
  group: string;
  icon: string;
  keywords?: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { path: "/conversation", label: "Tiếng Hàn Giao Tiếp", group: "Học tiếng Hàn", icon: "ri-chat-voice-line", keywords: "hội thoại giao tiếp ai" },
  { path: "/vocabulary", label: "Từ vựng tổng hợp", group: "Học tiếng Hàn", icon: "ri-translate-2", keywords: "từ vựng tổng hợp" },
  { path: "/grammar", label: "Ngữ pháp", group: "Học tiếng Hàn", icon: "ri-book-2-line", keywords: "ngữ pháp grammar" },
  { path: "/hangul", label: "Bảng chữ Hangul", group: "Học tiếng Hàn", icon: "ri-font-size", keywords: "hangul bảng chữ cái" },
  { path: "/hanja-vocab", label: "Từ vựng Hán Hàn", group: "Học tiếng Hàn", icon: "ri-character-recognition-line", keywords: "hán hàn hanja từ vựng" },
  { path: "/flashcard", label: "Flashcard", group: "Học tiếng Hàn", icon: "ri-stack-line", keywords: "flashcard thẻ học" },
  { path: "/daily-review", label: "Ôn tập hàng ngày", group: "Học tiếng Hàn", icon: "ri-sun-line", keywords: "ôn tập hàng ngày daily" },
  { path: "/smart-review", label: "Ôn tập thông minh", group: "Học tiếng Hàn", icon: "ri-brain-line", keywords: "ôn tập thông minh spaced" },
  { path: "/listen-practice", label: "Luyện phát âm AI", group: "Học tiếng Hàn", icon: "ri-mic-2-line", keywords: "phát âm luyện nói ai" },
  { path: "/vocab-favorites", label: "Từ yêu thích", group: "Học tiếng Hàn", icon: "ri-bookmark-fill", keywords: "yêu thích bookmark" },
  { path: "/dictionary", label: "Từ điển", group: "Học tiếng Hàn", icon: "ri-search-2-line", keywords: "từ điển dictionary" },
  { path: "/advanced-dictionary", label: "Tra cứu Hán Hàn", group: "Học tiếng Hàn", icon: "ri-character-recognition-line", keywords: "tra cứu hán hàn advanced dictionary" },
  { path: "/phrase-dictionary", label: "Từ điển cụm từ", group: "Học tiếng Hàn", icon: "ri-chat-3-line", keywords: "cụm từ phrase" },
  { path: "/pronunciation", label: "Luyện phát âm", group: "Học tiếng Hàn", icon: "ri-mic-line", keywords: "phát âm pronunciation" },
  { path: "/wrong-review", label: "Ôn tập câu sai", group: "Học tiếng Hàn", icon: "ri-error-warning-line", keywords: "câu sai wrong review" },
  { path: "/topik-test", label: "Thi thử TOPIK I", group: "TOPIK", icon: "ri-file-list-2-line", keywords: "topik 1 thi thử" },
  { path: "/topik2-test", label: "Thi thử TOPIK II", group: "TOPIK", icon: "ri-file-list-3-line", keywords: "topik 2 thi thử" },
  { path: "/topik-dictionary", label: "Từ điển TOPIK", group: "TOPIK", icon: "ri-search-2-line", keywords: "từ điển topik" },
  { path: "/topik-flashcard", label: "Flashcard TOPIK", group: "TOPIK", icon: "ri-stack-line", keywords: "flashcard topik" },
  { path: "/topik-listening", label: "Luyện nghe TOPIK", group: "TOPIK", icon: "ri-headphone-line", keywords: "nghe topik listening" },
  { path: "/topik-reading", label: "Luyện đọc TOPIK", group: "TOPIK", icon: "ri-book-read-line", keywords: "đọc topik reading" },
  { path: "/eps-lessons", label: "60 Bài Học EPS", group: "EPS-TOPIK", icon: "ri-book-open-line", keywords: "bài học eps 60" },
  { path: "/eps-vocabulary", label: "Từ vựng EPS", group: "EPS-TOPIK", icon: "ri-translate-2", keywords: "từ vựng eps" },
  { path: "/eps-exam", label: "Thi thử EPS (40 câu)", group: "EPS-TOPIK", icon: "ri-timer-line", keywords: "thi thử eps 40 câu" },
  { path: "/eps-mock-exam", label: "Thi mô phỏng EPS", group: "EPS-TOPIK", icon: "ri-file-list-3-line", keywords: "thi mô phỏng eps mock" },
  { path: "/eps-flashcard", label: "Flashcard EPS", group: "EPS-TOPIK", icon: "ri-stack-line", keywords: "flashcard eps" },
  { path: "/eps-listening", label: "Luyện nghe EPS", group: "EPS-TOPIK", icon: "ri-headphone-line", keywords: "nghe eps listening" },
  { path: "/eps-speaking", label: "Luyện nói EPS", group: "EPS-TOPIK", icon: "ri-mic-line", keywords: "nói eps speaking" },
  { path: "/eps-stats", label: "Thống kê EPS", group: "EPS-TOPIK", icon: "ri-bar-chart-grouped-line", keywords: "thống kê eps stats" },
  { path: "/seoul-textbook", label: "Giáo Trình Seoul 1A–4B", group: "Giáo Trình Seoul", icon: "ri-book-3-line", keywords: "giáo trình seoul 1a 4b" },
  { path: "/seoul-practice", label: "Luyện tập Seoul", group: "Giáo Trình Seoul", icon: "ri-gamepad-line", keywords: "luyện tập seoul" },
  { path: "/seoul-flashcard", label: "Flashcard Seoul", group: "Giáo Trình Seoul", icon: "ri-stack-line", keywords: "flashcard seoul" },
  { path: "/community", label: "Cộng đồng", group: "Cộng đồng & Tiến độ", icon: "ri-group-line", keywords: "cộng đồng community" },
  { path: "/leaderboard", label: "Bảng xếp hạng", group: "Cộng đồng & Tiến độ", icon: "ri-trophy-line", keywords: "bảng xếp hạng leaderboard" },
  { path: "/achievements", label: "Huy hiệu", group: "Cộng đồng & Tiến độ", icon: "ri-medal-line", keywords: "huy hiệu achievements badge" },
  { path: "/study-calendar", label: "Lịch học tập", group: "Cộng đồng & Tiến độ", icon: "ri-calendar-2-line", keywords: "lịch học tập calendar" },
  { path: "/melon", label: "K-pop Lesson", group: "K-pop & Nội dung", icon: "ri-music-2-line", keywords: "kpop melon nhạc hàn" },
  { path: "/melon-flashcard", label: "Flashcard K-pop", group: "K-pop & Nội dung", icon: "ri-stack-line", keywords: "flashcard kpop melon" },
  { path: "/naver", label: "Naver KiN", group: "K-pop & Nội dung", icon: "ri-question-answer-line", keywords: "naver kin hỏi đáp" },
  { path: "/ebook", label: "Ebook Builder", group: "K-pop & Nội dung", icon: "ri-book-2-line", keywords: "ebook builder tạo sách" },
  { path: "/news", label: "Học qua Tin tức", group: "K-pop & Nội dung", icon: "ri-newspaper-line", keywords: "tin tức news học" },
  { path: "/profile", label: "Hồ sơ học viên", group: "Tài khoản", icon: "ri-user-3-line", keywords: "hồ sơ profile" },
  { path: "/account-settings", label: "Cài đặt tài khoản", group: "Tài khoản", icon: "ri-settings-3-line", keywords: "cài đặt tài khoản settings" },
  { path: "/pricing", label: "Gói VIP", group: "Tài khoản", icon: "ri-vip-crown-line", keywords: "vip gói pricing" },
  { path: "/onboarding", label: "Tạo lộ trình học", group: "Tài khoản", icon: "ri-route-line", keywords: "lộ trình học onboarding" },
  { path: "/all-features", label: "Tất cả tính năng", group: "Tài khoản", icon: "ri-apps-2-line", keywords: "tất cả tính năng all features" },
];

// ─── Vocabulary data (built-in dictionary) ───────────────────────────────────
interface VocabItem {
  word: string;
  romanization: string;
  meaning: string;
  level: string;
  path: string;
  source?: string;
}

const VOCAB_DATA: VocabItem[] = [
  { word: "사랑", romanization: "sa-rang", meaning: "Tình yêu", level: "A1", path: "/advanced-dictionary" },
  { word: "행복", romanization: "haeng-bok", meaning: "Hạnh phúc", level: "A2", path: "/advanced-dictionary" },
  { word: "공부", romanization: "gong-bu", meaning: "Học tập", level: "A1", path: "/advanced-dictionary" },
  { word: "아름답다", romanization: "a-reum-dap-da", meaning: "Đẹp, xinh đẹp", level: "A2", path: "/advanced-dictionary" },
  { word: "생각", romanization: "saeng-gak", meaning: "Suy nghĩ", level: "A2", path: "/advanced-dictionary" },
  { word: "노력", romanization: "no-ryeok", meaning: "Nỗ lực, cố gắng", level: "B1", path: "/advanced-dictionary" },
  { word: "경험", romanization: "gyeong-heom", meaning: "Kinh nghiệm", level: "B1", path: "/advanced-dictionary" },
  { word: "발전", romanization: "bal-jeon", meaning: "Phát triển", level: "B2", path: "/advanced-dictionary" },
  { word: "안녕하세요", romanization: "an-nyeong-ha-se-yo", meaning: "Xin chào (lịch sự)", level: "A1", path: "/vocabulary" },
  { word: "감사합니다", romanization: "gam-sa-ham-ni-da", meaning: "Cảm ơn", level: "A1", path: "/vocabulary" },
  { word: "미안합니다", romanization: "mi-an-ham-ni-da", meaning: "Xin lỗi", level: "A1", path: "/vocabulary" },
  { word: "괜찮아요", romanization: "gwaen-chan-a-yo", meaning: "Không sao", level: "A1", path: "/vocabulary" },
  { word: "맛있다", romanization: "mas-it-da", meaning: "Ngon", level: "A1", path: "/vocabulary" },
  { word: "예쁘다", romanization: "ye-ppeu-da", meaning: "Đẹp (ngoại hình)", level: "A1", path: "/vocabulary" },
  { word: "재미있다", romanization: "jae-mi-it-da", meaning: "Thú vị, vui", level: "A1", path: "/vocabulary" },
  { word: "힘들다", romanization: "him-deul-da", meaning: "Khó khăn, mệt mỏi", level: "A2", path: "/vocabulary" },
  { word: "바쁘다", romanization: "ba-ppeu-da", meaning: "Bận rộn", level: "A2", path: "/vocabulary" },
  { word: "중요하다", romanization: "jung-yo-ha-da", meaning: "Quan trọng", level: "B1", path: "/vocabulary" },
  { word: "필요하다", romanization: "pil-yo-ha-da", meaning: "Cần thiết", level: "B1", path: "/vocabulary" },
  { word: "가능하다", romanization: "ga-neung-ha-da", meaning: "Có thể, khả thi", level: "B1", path: "/vocabulary" },
  { word: "문화", romanization: "mun-hwa", meaning: "Văn hóa", level: "A2", path: "/vocabulary" },
  { word: "음식", romanization: "eum-sik", meaning: "Thức ăn, ẩm thực", level: "A1", path: "/vocabulary" },
  { word: "여행", romanization: "yeo-haeng", meaning: "Du lịch", level: "A2", path: "/vocabulary" },
  { word: "친구", romanization: "chin-gu", meaning: "Bạn bè", level: "A1", path: "/vocabulary" },
  { word: "가족", romanization: "ga-jok", meaning: "Gia đình", level: "A1", path: "/vocabulary" },
  { word: "학교", romanization: "hak-gyo", meaning: "Trường học", level: "A1", path: "/vocabulary" },
  { word: "회사", romanization: "hoe-sa", meaning: "Công ty", level: "A2", path: "/vocabulary" },
  { word: "시간", romanization: "si-gan", meaning: "Thời gian", level: "A1", path: "/vocabulary" },
  { word: "날씨", romanization: "nal-ssi", meaning: "Thời tiết", level: "A1", path: "/vocabulary" },
  { word: "건강", romanization: "geon-gang", meaning: "Sức khỏe", level: "A2", path: "/vocabulary" },
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

// ─── Naver Q&A data ───────────────────────────────────────────────────────────
interface QAItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const DEFAULT_QA: QAItem[] = [
  { id: 1, question: "한국어 공부를 어떻게 시작해야 하나요?", answer: "기초 발음부터 시작하는 것이 좋습니다.", category: "학습법" },
  { id: 2, question: "TOPIK 시험 준비는 얼마나 걸리나요?", answer: "보통 3~6개월 꾸준히 공부하면 됩니다.", category: "TOPIK" },
  { id: 3, question: "한국 드라마로 한국어를 배울 수 있나요?", answer: "네! 드라마는 자연스러운 표현과 억양을 배우는 데 매우 효과적입니다.", category: "문화" },
  { id: 4, question: "어휘를 빠르게 외우는 방법이 있나요?", answer: "플래시카드와 반복 학습법(SRS)을 활용하면 효율적으로 어휘를 익힐 수 있습니다.", category: "어휘" },
  { id: 5, question: "한국어 문법이 너무 어려운데 어떻게 해야 하나요?", answer: "기본 문형 패턴을 먼저 익히고, 예문을 통해 자연스럽게 체득하는 방법을 추천합니다.", category: "문법" },
];

function loadQA(): QAItem[] {
  try {
    const raw = localStorage.getItem("kts_naver_qa");
    if (raw) return JSON.parse(raw) as QAItem[];
  } catch { /* ignore */ }
  return DEFAULT_QA;
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const GROUP_COLORS: Record<string, string> = {
  "Học tiếng Hàn": "#34d399",
  "TOPIK": "#60a5fa",
  "EPS-TOPIK": "#fb923c",
  "Giáo Trình Seoul": "#a78bfa",
  "Cộng đồng & Tiến độ": "#f472b6",
  "K-pop & Nội dung": "#e8c84a",
  "Tài khoản": "#94a3b8",
  "Từ vựng": "#e8c84a",
  "Naver Q&A": "#03C75A",
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "#4ade80", A2: "#34d399", B1: "#38bdf8", B2: "#a78bfa", C1: "#fb923c", C2: "#f87171",
};

// ─── Highlight ────────────────────────────────────────────────────────────────
function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded px-0.5" style={{ backgroundColor: "rgba(232,200,74,0.25)", color: "#e8c84a" }}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── Result types ─────────────────────────────────────────────────────────────
type ResultItem =
  | { type: "nav"; item: NavItem }
  | { type: "vocab"; item: VocabItem }
  | { type: "qa"; item: QAItem };

// ─── Main component ───────────────────────────────────────────────────────────
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
        title="Tìm kiếm (Ctrl+K)"
      >
        <i className="ri-search-line text-sm" style={{ color: "var(--dash-text-muted, rgba(255,255,255,0.35))" }}></i>
        <span className="text-xs" style={{ color: "var(--dash-text-muted, rgba(255,255,255,0.35))" }}>Tìm kiếm...</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono" style={{ backgroundColor: "var(--dash-hover)", color: "var(--dash-text-muted)", border: "1px solid var(--dash-border)" }}>⌘K</span>
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
                placeholder="Tìm tính năng, từ vựng, câu hỏi..."
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
                  { key: "all", label: `Tất cả (${navCount + vocabCount + qaCount})` },
                  ...(navCount > 0 ? [{ key: "nav", label: `Tính năng (${navCount})` }] : []),
                  ...(vocabCount > 0 ? [{ key: "vocab", label: `Từ vựng (${vocabCount})` }] : []),
                  ...(qaCount > 0 ? [{ key: "qa", label: `Q&A (${qaCount})` }] : []),
                ] as { key: typeof activeFilter; label: string }[]).map(f => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-semibold cursor-pointer whitespace-nowrap transition-all"
                    style={{
                      backgroundColor: activeFilter === f.key ? "rgba(232,200,74,0.15)" : "rgba(255,255,255,0.04)",
                      color: activeFilter === f.key ? "#e8c84a" : "rgba(255,255,255,0.35)",
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
                  <p className="text-sm" style={{ color: "var(--dash-text-muted)" }}>Không tìm thấy &quot;{query}&quot;</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Thử tìm bằng tiếng Hàn, romanization hoặc tiếng Việt</p>
                </div>
              ) : (
                <>
                  {!hasQuery && (
                    <p className="px-4 py-1.5 text-[10px] tracking-normal font-semibold" style={{ color: "var(--dash-text-muted)" }}>
                      Gợi ý nhanh
                    </p>
                  )}
                  {results.map((r, i) => {
                    const isActive = i === activeIdx;
                    const bg = isActive ? "var(--dash-hover, rgba(255,255,255,0.05))" : "transparent";

                    if (r.type === "nav") {
                      const color = GROUP_COLORS[r.item.group] || "#e8c84a";
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
                      const lc = LEVEL_COLORS[r.item.level] || "#e8c84a";
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
                            <span className="text-sm font-bold" style={{ color: "#e8c84a" }}>{r.item.word.slice(0, 2)}</span>
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
                            {r.item.source || "Từ vựng"}
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
              {[{ key: "↑↓", label: "Di chuyển" }, { key: "↵", label: "Chọn" }, { key: "ESC", label: "Đóng" }].map(k => (
                <div key={k.key} className="flex items-center gap-1.5">
                  <kbd className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: "var(--dash-hover)", color: "var(--dash-text-muted)", border: "1px solid var(--dash-border)" }}>{k.key}</kbd>
                  <span className="text-[10px]" style={{ color: "var(--dash-text-muted)" }}>{k.label}</span>
                </div>
              ))}
              <span className="ml-auto text-[10px]" style={{ color: "var(--dash-text-muted)" }}>{results.length} kết quả</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const GlobalSearch = memo(GlobalSearchInner);
export default GlobalSearch;
