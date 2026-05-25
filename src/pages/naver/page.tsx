import { useState, useEffect, useRef, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase, isVipActive } from "@/lib/supabase";
import { useAuthContext } from "@/contexts/AuthContext";
import VipUpgradeModal from "@/components/feature/VipUpgradeModal";
import realNaverData from "@/mocks/naver_kin_real.json";
import { STORAGE_KEYS } from "@/lib/storageKeys";
import { SITE_URL } from "@/lib/siteConfig";

interface VocabItem  { korean: string; vn: string; level?: string; }
interface GrammarItem { pattern: string; meaning: string; example?: string; level?: string; }
interface NaverQA {
  id: number;
  question: string;
  question_kr?: string;
  answer: string;
  answer_kr?: string;
  category: string;
  likes: number;
  vocabulary?: VocabItem[];
  grammar?: GrammarItem[];
}

const DEFAULT_QA: NaverQA[] = [
  { id: 1, question: "한국어 공부를 어떻게 시작해야 하나요?", answer: "기초 발음부터 시작하는 것이 좋습니다. 한글 자모음을 먼저 익히고 기본 단어를 외우세요.", category: "학습법", likes: 124 },
  { id: 2, question: "TOPIK 시험 준비는 얼마나 걸리나요?", answer: "개인 수준에 따라 다르지만 보통 3~6개월 꾸준히 공부하면 준비할 수 있습니다.", category: "TOPIK", likes: 98 },
  { id: 3, question: "한국 드라마로 한국어를 배울 수 있나요?", answer: "네! 드라마는 자연스러운 표현과 억양을 배우는 데 매우 효과적입니다.", category: "문화", likes: 215 },
  { id: 4, question: "어휘를 빠르게 외우는 방법이 있나요?", answer: "플래시카드와 반복 학습법(SRS)을 활용하면 효율적으로 어휘를 익힐 수 있습니다.", category: "어휘", likes: 176 },
  { id: 5, question: "한국어 문법이 너무 어려운데 어떻게 해야 하나요?", answer: "기본 문형 패턴을 먼저 익히고, 예문을 통해 자연스럽게 체득하는 방법을 추천합니다.", category: "문법", likes: 143 },
  { id: 6, question: "한국어 발음 교정은 어떻게 하나요?", answer: "원어민 발음을 많이 듣고 따라 말하는 쉐도잉 연습이 효과적입니다.", category: "발음", likes: 89 },
  { id: 7, question: "한국어 경어체와 반말의 차이는?", answer: "경어체는 존댓말로 공식적인 상황에서, 반말은 친한 사이나 아랫사람에게 사용합니다.", category: "문법", likes: 201 },
  { id: 8, question: "한국어 능력시험 TOPIK II 합격 점수는?", answer: "TOPIK II는 3~6급으로 나뉘며, 3급은 120점, 4급은 150점, 5급은 190점, 6급은 230점 이상입니다.", category: "TOPIK", likes: 167 },
];

function loadQAFallback(): NaverQA[] {
  if (realNaverData && (realNaverData as NaverQA[]).length > 0)
    return realNaverData as NaverQA[];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NAVER_QA);
    if (raw) return JSON.parse(raw) as NaverQA[];
  } catch { /* ignore */ }
  return DEFAULT_QA;
}

// ─── TTS helper ──────────────────────────────────────────────────────────────
function speak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR"; u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

// ─── QACard ──────────────────────────────────────────────────────────────────
const LEVEL_COLOR: Record<string, string> = { "1": "#03C75A", "2": "#f59e0b" };

function QACard({ item, liked, onLike, isVip, onRequestVip }: {
  item: NaverQA; liked: boolean; onLike: (id: number) => void;
  isVip: boolean; onRequestVip: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);
  // ── Shadowing state ──────────────────────────────────────
  const [shadowMode, setShadowMode] = useState(false);
  const [shadowIdx, setShadowIdx] = useState(0);
  const [shadowPlaying, setShadowPlaying] = useState(false);
  const [shadowSpeed, setShadowSpeed] = useState(0.85);
  const shadowActiveRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentencesRef = useRef<string[]>([]);
  const TRUNCATE = 200;
  const isLong = item.answer.length > TRUNCATE;
  const displayAnswer = isLong && !expanded ? item.answer.slice(0, TRUNCATE) + "…" : item.answer;

  const handleSpeak = (korean: string) => {
    setSpeaking(korean);
    speak(korean);
    setTimeout(() => setSpeaking(null), 1500);
  };

  // ── Shadowing sentences ──────────────────────────────────
  const sentences = useMemo(() => {
    const text = item.answer_kr || "";
    if (!text) return [];
    const parts = text.match(/[^.!?。？！]+[.!?。？！]?/g) || [];
    return parts.map(s => s.trim()).filter(s => s.length > 4);
  }, [item.answer_kr]);
  sentencesRef.current = sentences;

  const stopShadow = () => {
    shadowActiveRef.current = false;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    window.speechSynthesis.cancel();
    setShadowPlaying(false);
  };

  const playAt = (idx: number, spd: number) => {
    const sents = sentencesRef.current;
    if (!shadowActiveRef.current || idx >= sents.length) { setShadowPlaying(false); return; }
    window.speechSynthesis.cancel();
    setShadowIdx(idx); setShadowPlaying(true);
    const u = new SpeechSynthesisUtterance(sents[idx]);
    u.lang = "ko-KR"; u.rate = spd;
    u.onend = () => {
      if (!shadowActiveRef.current) return;
      timerRef.current = setTimeout(() => playAt(idx + 1, spd), 2200);
    };
    window.speechSynthesis.speak(u);
  };

  const toggleShadow = () => {
    if (!isVip) { onRequestVip(); return; }
    if (shadowMode) { stopShadow(); setShadowMode(false); return; }
    if (sentences.length === 0) return;
    shadowActiveRef.current = true;
    setShadowMode(true); setShadowIdx(0);
    setTimeout(() => playAt(0, shadowSpeed), 300);
  };

  const repeatCurrent = () => { stopShadow(); shadowActiveRef.current = true; setTimeout(() => playAt(shadowIdx, shadowSpeed), 100); };
  const nextSentence = () => { stopShadow(); shadowActiveRef.current = true; const n = Math.min(shadowIdx + 1, sentences.length - 1); setTimeout(() => playAt(n, shadowSpeed), 100); };
  const prevSentence = () => { stopShadow(); shadowActiveRef.current = true; const p = Math.max(shadowIdx - 1, 0); setTimeout(() => playAt(p, shadowSpeed), 100); };
  const toggleSpeed = () => {
    const next = shadowSpeed === 0.85 ? 0.65 : 0.85;
    setShadowSpeed(next);
    if (shadowPlaying) { stopShadow(); shadowActiveRef.current = true; setTimeout(() => playAt(shadowIdx, next), 100); }
  };

  useEffect(() => () => { shadowActiveRef.current = false; if (timerRef.current) clearTimeout(timerRef.current); window.speechSynthesis.cancel(); }, []);

  return (
    <article
      className="rounded-2xl overflow-hidden transition-all hover:border-white/10"
      style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Accent top bar */}
      <div className="h-0.5 w-full" style={{ background: "linear-gradient(to right, #03C75A44, transparent)" }} />

      <div className="p-4">
        {/* Category + like row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide" style={{ backgroundColor: "rgba(3,199,90,0.1)", color: "#03C75A", border: "1px solid rgba(3,199,90,0.2)" }}>
            {item.category}
          </span>
          <button onClick={() => onLike(item.id)} className="flex items-center gap-1.5 cursor-pointer transition-all flex-shrink-0 px-2 py-1 rounded-lg" style={{ color: liked ? "#03C75A" : "rgba(255,255,255,0.28)", backgroundColor: liked ? "rgba(3,199,90,0.08)" : "transparent" }}>
            <i className={liked ? "ri-thumb-up-fill text-xs" : "ri-thumb-up-line text-xs"} />
            <span className="text-[11px] font-medium">{item.likes + (liked ? 1 : 0)}</span>
          </button>
        </div>

        {/* Question */}
        <div className="mb-3 pl-3" style={{ borderLeft: "2px solid rgba(3,199,90,0.35)" }}>
          <h2 className="text-sm font-semibold leading-relaxed" style={{ color: "rgba(255,255,255,0.88)" }}>{item.question}</h2>
          {item.question_kr && (
            <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.2)" }}>{item.question_kr}</p>
          )}
        </div>

        {/* Answer */}
        <div className="mb-3 rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{displayAnswer}</p>
          {isLong && (
            <button onClick={() => setExpanded(p => !p)} className="text-[11px] mt-1.5 cursor-pointer font-medium" style={{ color: "#03C75A" }}>
              {expanded ? "Thu gọn ▲" : "Xem thêm ▼"}
            </button>
          )}
        </div>

        {/* Vocabulary chips */}
        {item.vocabulary && item.vocabulary.length > 0 && (
          <div className="mb-2.5">
            <p className="text-[10px] mb-1.5 font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>Từ vựng</p>
            <div className="flex flex-wrap gap-1.5">
              {item.vocabulary.map((v, i) => (
                <button
                  key={i}
                  onClick={() => handleSpeak(v.korean)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] cursor-pointer transition-all"
                  style={{
                    backgroundColor: speaking === v.korean ? "rgba(3,199,90,0.12)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${speaking === v.korean ? "rgba(3,199,90,0.3)" : "rgba(255,255,255,0.08)"}`,
                  }}
                  title="Click để nghe phát âm"
                >
                  <i className="ri-volume-up-line text-[9px]" style={{ color: speaking === v.korean ? "#03C75A" : "rgba(255,255,255,0.2)" }} />
                  <span className="font-bold" style={{ color: speaking === v.korean ? "#03C75A" : "rgba(255,255,255,0.82)" }}>{v.korean}</span>
                  <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
                  <span style={{ color: "rgba(255,255,255,0.5)" }}>{v.vn}</span>
                  {v.level && (
                    <span className="text-[9px] px-1 rounded font-semibold" style={{ backgroundColor: `${LEVEL_COLOR[v.level] ?? "#888"}18`, color: LEVEL_COLOR[v.level] ?? "#888" }}>
                      T{v.level}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grammar tags */}
        {item.grammar && item.grammar.length > 0 && (
          <div>
            <p className="text-[10px] mb-1.5 font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>Ngữ pháp</p>
            <div className="space-y-1.5">
              {item.grammar.map((g, i) => (
                <div key={i} className="px-3 py-2 rounded-xl" style={{ backgroundColor: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.13)" }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => handleSpeak(g.pattern.replace(/-/g, ""))} className="cursor-pointer" title="Click để nghe">
                      <span className="font-mono font-bold text-xs" style={{ color: "#a78bfa" }}>{g.pattern}</span>
                    </button>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>→</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{g.meaning}</span>
                    {g.level && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "rgba(167,139,250,0.12)", color: "#a78bfa" }}>T{g.level}</span>
                    )}
                  </div>
                  {g.example && (
                    <p className="text-[10px] mt-1.5 pl-1" style={{ color: "rgba(255,255,255,0.38)", borderLeft: "2px solid rgba(167,139,250,0.25)" }}>
                      💡 {g.example}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shadowing button */}
        {(item.answer_kr || !isVip) && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <button
              onClick={toggleShadow}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all w-full justify-center"
              style={{
                backgroundColor: shadowMode ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${shadowMode ? "rgba(251,191,36,0.25)" : "rgba(255,255,255,0.08)"}`,
                color: shadowMode ? "#fbbf24" : "rgba(255,255,255,0.45)",
              }}
            >
              <i className={shadowMode ? "ri-mic-fill text-xs" : "ri-mic-line text-xs"} />
              {shadowMode ? "Đang luyện Shadowing" : "🎙 Luyện Shadowing"}
              {!isVip && <span className="text-[9px] px-1.5 py-0.5 rounded-full ml-1" style={{ backgroundColor: "rgba(212,180,58,0.15)", color: "#d4b43a" }}>VIP</span>}
            </button>
          </div>
        )}
      </div>

      {/* Shadowing panel */}
      {shadowMode && sentences.length > 0 && (
        <div className="border-t" style={{ borderColor: "rgba(251,191,36,0.15)", backgroundColor: "rgba(251,191,36,0.04)" }}>
          <div className="p-4 space-y-2.5">
            {/* Sentences list */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {sentences.map((s, i) => (
                <div
                  key={i}
                  onClick={() => { stopShadow(); shadowActiveRef.current = true; setTimeout(() => playAt(i, shadowSpeed), 100); }}
                  className="px-3 py-2 rounded-xl cursor-pointer transition-all text-xs leading-relaxed"
                  style={{
                    backgroundColor: i === shadowIdx ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${i === shadowIdx ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.05)"}`,
                    color: i === shadowIdx ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
                    fontWeight: i === shadowIdx ? 600 : 400,
                  }}
                >
                  {i === shadowIdx && shadowPlaying && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-2 animate-pulse" style={{ backgroundColor: "#fbbf24" }} />
                  )}
                  {s}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button onClick={prevSentence} className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                  <i className="ri-skip-back-line text-sm" />
                </button>
                <button onClick={repeatCurrent} className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                  <i className="ri-repeat-one-line text-sm" />
                </button>
                <button
                  onClick={() => { if (shadowPlaying) { stopShadow(); } else { shadowActiveRef.current = true; playAt(shadowIdx, shadowSpeed); } }}
                  className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer"
                  style={{ backgroundColor: "rgba(251,191,36,0.2)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}
                >
                  <i className={shadowPlaying ? "ri-pause-fill text-base" : "ri-play-fill text-base"} />
                </button>
                <button onClick={nextSentence} className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
                  <i className="ri-skip-forward-line text-sm" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{shadowIdx + 1}/{sentences.length}</span>
                <button
                  onClick={toggleSpeed}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", color: shadowSpeed < 0.8 ? "#fbbf24" : "rgba(255,255,255,0.45)", border: `1px solid ${shadowSpeed < 0.8 ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.08)"}` }}
                >
                  {shadowSpeed < 0.8 ? "🐢 0.7x" : "▶ 1.0x"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

const FREE_LIMIT = 5;

const NaverPage = () => {
  const { user, profile } = useAuthContext();
  const isVip = isVipActive(profile);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [qaData, setQaData] = useState<NaverQA[]>(loadQAFallback);
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [vipModal, setVipModal] = useState(false);

  // Load from Supabase
  useEffect(() => {
    const fetchQA = async () => {
      const { data, error } = await supabase
        .from("naver_qa")
        .select("id,question_vn,question_kr,answer_vn,answer_kr,category_vn,likes,vocabulary,grammar")
        .order("likes", { ascending: false })
        .limit(200);
      if (!error && data && data.length > 0) {
        setQaData(data.map(r => ({
          id:         r.id,
          question:    r.question_vn || "",
          question_kr: r.question_kr  || "",
          answer:      r.answer_vn   || "",
          answer_kr:   r.answer_kr   || "",
          category:   r.category_vn || "Học tiếng Hàn",
          likes:      r.likes || 0,
          vocabulary: (r.vocabulary as VocabItem[])  || [],
          grammar:    (r.grammar    as GrammarItem[]) || [],
        })));
      }
      setLoading(false);
    };
    fetchQA();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NAVER_LIKED);
    if (saved) { try { setLikedIds(JSON.parse(saved)); } catch { /* ignore */ } }
  }, []);

  // SEO: FAQPage schema + meta tags
  useEffect(() => {
    if (qaData.length === 0) return;
    document.title = "Naver KiN - Hỏi đáp học tiếng Hàn thực tế | Hàn Quốc Ơi";
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); }
      el.content = content;
    };
    const setProp = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement;
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", prop); document.head.appendChild(el); }
      el.content = content;
    };
    setMeta("description", "Tổng hợp câu hỏi - trả lời học tiếng Hàn từ Naver KiN, dịch sang tiếng Việt kèm từ vựng và ngữ pháp thực tế.");
    setMeta("keywords", "học tiếng Hàn, câu hỏi tiếng Hàn, Naver KiN, TOPIK, EPS-TOPIK, ngữ pháp tiếng Hàn, từ vựng tiếng Hàn");
    setProp("og:title", "Naver KiN - Hỏi đáp học tiếng Hàn | Hàn Quốc Ơi");
    setProp("og:description", "Hàng trăm câu hỏi học tiếng Hàn từ người Hàn thực trả lời, dịch tiếng Việt kèm từ vựng và ngữ pháp.");
    setProp("og:url", `${SITE_URL}/naver`);

    const top20 = qaData.slice(0, 20).filter(q => q.question && q.answer);
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": top20.map(q => ({
        "@type": "Question",
        "name": q.question,
        "acceptedAnswer": { "@type": "Answer", "text": q.answer }
      }))
    };
    const existing = document.getElementById("faq-schema");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "faq-schema";
    script.type = "application/ld+json";
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => { document.getElementById("faq-schema")?.remove(); };
  }, [qaData]);

  const toggleLike = (id: number) => {
    setLikedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(STORAGE_KEYS.NAVER_LIKED, JSON.stringify(next));
      return next;
    });
  };

  const categories = ["Tất cả", ...Array.from(new Set(qaData.map(q => q.category).filter(Boolean))).sort()];

  const filtered = qaData.filter((item) => {
    const matchCat = selectedCategory === "Tất cả" || item.category === selectedCategory;
    const matchSearch = !searchQuery.trim() || item.question.toLowerCase().includes(searchQuery.toLowerCase()) || item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <DashboardLayout title="Naver KiN" subtitle="Học tiếng Hàn qua câu hỏi thực tế">
      <div className="py-4">
        {/* Hero */}
        <div className="mb-4 rounded-2xl overflow-hidden relative h-24 sm:h-28">
          <img
            style={{ background: "linear-gradient(135deg, #03c75a 0%, #00a86b 100%)" }}
            alt="Naver KiN"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)" }} />
          <div className="absolute inset-0 flex flex-col justify-center px-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 flex items-center justify-center rounded-md" style={{ backgroundColor: "#03C75A" }}>
                <i className="ri-question-answer-line text-white text-sm" />
              </div>
              <span className="text-white font-bold text-base">Naver KiN</span>
            </div>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Học tiếng Hàn qua câu hỏi thực tế</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
            <i className="ri-search-line text-sm" style={{ color: "rgba(255,255,255,0.25)" }} />
          </div>
          <input
            type="text"
            placeholder="Tìm câu hỏi..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.08)", caretColor: "#03C75A" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: "rgba(255,255,255,0.3)" }}>
              <i className="ri-close-line text-sm"></i>
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
              style={selectedCategory === cat
                ? { backgroundColor: "#03C75A", color: "#fff" }
                : { backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          {[
            { label: "Câu hỏi", value: qaData.length, icon: "ri-question-line", color: "#03C75A" },
            { label: "Đã thích", value: likedIds.length, icon: "ri-thumb-up-line", color: "#e8c84a" },
            { label: "Danh mục", value: categories.length - 1, icon: "ri-folder-line", color: "#a78bfa" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-7 h-7 flex items-center justify-center rounded-lg mx-auto mb-1.5" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
              </div>
              <p className="text-base font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{s.value}</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Q&A List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {(isVip ? filtered : filtered.slice(0, FREE_LIMIT)).map((item) => (
            <QACard key={item.id} item={item} liked={likedIds.includes(item.id)} onLike={toggleLike} isVip={isVip} onRequestVip={() => setVipModal(true)} />
          ))}

          {/* VIP gate teaser */}
          {!isVip && filtered.length > FREE_LIMIT && (
            <div className="lg:col-span-2 relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {/* blurred preview */}
              <div className="blur-sm pointer-events-none opacity-40 p-4 space-y-2">
                {filtered.slice(FREE_LIMIT, FREE_LIMIT + 2).map((item) => (
                  <div key={item.id} className="rounded-xl p-3" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: "rgba(255,255,255,0.7)" }}>❓ {item.question}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>💬 {item.answer.slice(0, 80)}...</p>
                  </div>
                ))}
              </div>
              {/* overlay CTA */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center" style={{ background: "linear-gradient(to bottom, rgba(15,17,23,0.6) 0%, rgba(15,17,23,0.95) 60%)" }}>
                <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(212,180,58,0.15)" }}>
                  <i className="ri-vip-crown-2-line text-xl" style={{ color: "#d4b43a" }} />
                </div>
                <p className="font-bold text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>Còn {filtered.length - FREE_LIMIT} câu hỏi đang bị khóa</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Nâng cấp VIP để xem toàn bộ hỏi đáp + từ vựng + ngữ pháp</p>
                <button
                  onClick={() => setVipModal(true)}
                  className="px-5 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all"
                  style={{ backgroundColor: "#d4b43a", color: "#0f1117" }}
                >
                  Mở khóa VIP
                </button>
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-14 text-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl mb-3" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                <i className="ri-search-line text-xl" style={{ color: "rgba(255,255,255,0.2)" }}></i>
              </div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>Không tìm thấy kết quả</p>
            </div>
          )}
        </div>
      </div>
      <VipUpgradeModal
        open={vipModal}
        onClose={() => setVipModal(false)}
        reason={user ? "not_vip" : "not_logged_in"}
        featureName="Hỏi đáp Naver KiN"
      />
    </DashboardLayout>
  );
};

export default NaverPage;

