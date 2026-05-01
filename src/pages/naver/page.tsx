import { useState, useEffect } from "react";
import MobileHeader from "@/components/feature/MobileHeader";
import MobileNav from "@/components/feature/MobileNav";
import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import NaverAdminDataPanel from "./components/AdminDataPanel";

interface NaverQA {
  id: number;
  question: string;
  answer: string;
  category: string;
  likes: number;
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

function loadQA(): NaverQA[] {
  try {
    const raw = localStorage.getItem("kts_naver_qa");
    if (raw) return JSON.parse(raw) as NaverQA[];
  } catch { /* ignore */ }
  return DEFAULT_QA;
}

const CATEGORIES = ["전체", "학습법", "TOPIK", "문화", "어휘", "문법", "발음"];

const NaverPage = () => {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [qaData, setQaData] = useState<NaverQA[]>(loadQA);
  const [likedIds, setLikedIds] = useState<number[]>([]);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Reload from localStorage when admin panel closes
  const handleAdminClose = () => {
    setShowAdminPanel(false);
    setQaData(loadQA());
  };

  useEffect(() => {
    const saved = localStorage.getItem("kts_naver_liked");
    if (saved) { try { setLikedIds(JSON.parse(saved)); } catch { /* ignore */ } }
  }, []);

  const toggleLike = (id: number) => {
    setLikedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("kts_naver_liked", JSON.stringify(next));
      return next;
    });
  };

  const filtered = qaData.filter((item) => {
    const matchCat = selectedCategory === "전체" || item.category === selectedCategory;
    const matchSearch = !searchQuery.trim() || item.question.includes(searchQuery) || item.answer.includes(searchQuery);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ backgroundColor: "#0f1117" }}>
      {/* Desktop top bar */}
      <header className="hidden md:flex sticky top-0 z-30 backdrop-blur-md border-b h-14 items-center px-6 gap-4" style={{ backgroundColor: "rgba(15,17,23,0.95)", borderColor: "rgba(255,255,255,0.08)" }}>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer flex-shrink-0 transition-colors"
          style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}
        >
          <i className="ri-arrow-left-line" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center rounded-md" style={{ backgroundColor: "#03C75A" }}>
            <i className="ri-question-answer-line text-white text-sm" />
          </div>
          <span className="font-bold text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>Naver KiN</span>
        </div>
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Học tiếng Hàn qua câu hỏi thực tế</p>
        <div className="ml-auto flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
              style={{ backgroundColor: "rgba(3,199,90,0.10)", color: "#03C75A", border: "1px solid rgba(3,199,90,0.18)" }}
            >
              <i className="ri-database-2-line" />
              Dữ liệu
            </button>
          )}
        </div>
      </header>

      <MobileHeader title="Naver KiN" showBack />

      <div className="max-w-2xl mx-auto pt-16 md:pt-6 px-3 sm:px-4">
        {/* Hero */}
        <div className="mb-4 rounded-2xl overflow-hidden relative h-24 sm:h-28">
          <img
            src="https://readdy.ai/api/search-image?query=Naver%20Korean%20knowledge%20sharing%20platform%20question%20answer%20community%20vibrant%20green%20teal%20abstract%20digital%20network%20nodes%20connections%20modern%20tech%20background&width=640&height=224&seq=naver-hero-001&orientation=landscape"
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

        {/* Admin button — mobile */}
        {isAdmin && (
          <div className="mb-3">
            <button
              onClick={() => setShowAdminPanel(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-all"
              style={{ backgroundColor: "rgba(3,199,90,0.08)", color: "#03C75A", border: "1px solid rgba(3,199,90,0.15)" }}
            >
              <i className="ri-database-2-line"></i>
              Quản lý dữ liệu (Admin)
              <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: "rgba(3,199,90,0.15)", color: "#03C75A" }}>ADMIN</span>
            </button>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-3">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
            <i className="ri-search-line text-sm" style={{ color: "rgba(255,255,255,0.25)" }} />
          </div>
          <input
            type="text"
            placeholder="질문 검색..."
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
          {CATEGORIES.map((cat) => (
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
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Câu hỏi", value: qaData.length, icon: "ri-question-line", color: "#03C75A" },
            { label: "Đã thích", value: likedIds.length, icon: "ri-thumb-up-line", color: "#e8c84a" },
            { label: "Danh mục", value: CATEGORIES.length - 1, icon: "ri-folder-line", color: "#a78bfa" },
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
        <div className="space-y-3">
          {filtered.map((item) => {
            const liked = likedIds.includes(item.id);
            return (
              <div key={item.id} className="rounded-2xl p-4 transition-all" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0" style={{ backgroundColor: "rgba(3,199,90,0.12)", color: "#03C75A" }}>
                    {item.category}
                  </span>
                </div>
                <p className="text-sm font-semibold mb-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.82)" }}>
                  Q. {item.question}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  A. {item.answer}
                </p>
                <div className="flex items-center gap-1.5 mt-3">
                  <button
                    onClick={() => toggleLike(item.id)}
                    className="flex items-center gap-1 cursor-pointer transition-all"
                    style={{ color: liked ? "#e8c84a" : "rgba(255,255,255,0.3)" }}
                  >
                    <div className="w-4 h-4 flex items-center justify-center">
                      <i className={liked ? "ri-thumb-up-fill text-sm" : "ri-thumb-up-line text-sm"} />
                    </div>
                    <span className="text-xs">{item.likes + (liked ? 1 : 0)}</span>
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-14 text-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl mb-3" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                <i className="ri-search-line text-xl" style={{ color: "rgba(255,255,255,0.2)" }}></i>
              </div>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>검색 결과가 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* Admin Panel */}
      {showAdminPanel && isAdmin && (
        <NaverAdminDataPanel onClose={handleAdminClose} />
      )}

      <MobileNav />
    </div>
  );
};

export default NaverPage;
