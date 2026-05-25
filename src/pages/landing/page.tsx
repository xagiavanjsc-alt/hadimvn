import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePageSEO } from "@/hooks/usePageSEO";
import { STATS, TESTIMONIALS, FAQ_ITEMS } from "@/mocks/landingData";

const FEATURE_GROUPS = [
  {
    id: "eps", label: "EPS-TOPIK", icon: "ri-file-list-3-line", color: "#f97316", bg: "#fff7ed",
    desc: "Luyện thi EPS-TOPIK toàn diện",
    features: [
      { icon: "ri-gamepad-line", label: "Quiz theo bài EPS" },
      { icon: "ri-file-paper-2-line", label: "Đề thi chính thức" },
      { icon: "ri-stethoscope-line", label: "Phân tích điểm yếu" },
      { icon: "ri-route-line", label: "Lộ trình cá nhân EPS" },
      { icon: "ri-calendar-2-line", label: "Kế hoạch 30 ngày" },
      { icon: "ri-earth-line", label: "BXH toàn cầu EPS" },
    ],
  },
  {
    id: "seoul", label: "Giáo trình Seoul", icon: "ri-book-open-line", color: "#22c55e", bg: "#f0fdf4",
    desc: "Học tiếng Hàn chuẩn giáo trình Seoul",
    features: [
      { icon: "ri-route-line", label: "Lộ trình Seoul 1A–4B" },
      { icon: "ri-headphone-line", label: "Quiz nghe Seoul" },
      { icon: "ri-edit-line", label: "Luyện viết Seoul" },
      { icon: "ri-character-recognition-line", label: "Hán tự Seoul" },
      { icon: "ri-fire-line", label: "Streak Seoul" },
      { icon: "ri-links-line", label: "Cặp từ đối lập" },
    ],
  },
  {
    id: "kpop", label: "K-pop & Melon", icon: "ri-music-2-line", color: "#ec4899", bg: "#fdf2f8",
    desc: "Học tiếng Hàn qua âm nhạc",
    features: [
      { icon: "ri-music-2-line", label: "Melon Chart học tiếng Hàn" },
      { icon: "ri-stack-line", label: "Flashcard từ bài hát" },
      { icon: "ri-bar-chart-line", label: "Thống kê K-pop" },
      { icon: "ri-history-line", label: "Lịch sử bài đã học" },
      { icon: "ri-music-2-line", label: "K-pop học EPS" },
      { icon: "ri-share-line", label: "Chia sẻ thẻ từ vựng" },
    ],
  },
  {
    id: "topik", label: "TOPIK I & II", icon: "ri-award-line", color: "#10b981", bg: "#ecfdf5",
    desc: "Chinh phục kỳ thi TOPIK",
    features: [
      { icon: "ri-survey-line", label: "Quiz chủ đề TOPIK" },
      { icon: "ri-headphone-line", label: "Luyện nghe TOPIK" },
      { icon: "ri-book-read-line", label: "Luyện đọc TOPIK" },
      { icon: "ri-stack-line", label: "Flashcard TOPIK" },
      { icon: "ri-bar-chart-line", label: "Thống kê TOPIK" },
      { icon: "ri-test-tube-line", label: "Thi thử TOPIK II" },
    ],
  },
  {
    id: "community", label: "Cộng đồng", icon: "ri-group-line", color: "#06b6d4", bg: "#ecfeff",
    desc: "Học cùng cộng đồng XKLĐ Hàn Quốc",
    features: [
      { icon: "ri-sword-line", label: "Thách đấu bạn bè" },
      { icon: "ri-trophy-line", label: "BXH thử thách" },
      { icon: "ri-fire-line", label: "Streak bạn bè" },
      { icon: "ri-scales-line", label: "So sánh tiến độ" },
      { icon: "ri-vip-crown-line", label: "Hạng cộng đồng" },
      { icon: "ri-chat-3-line", label: "Diễn đàn học viên" },
    ],
  },
  {
    id: "stats", label: "Thống kê & AI", icon: "ri-bar-chart-box-line", color: "#f59e0b", bg: "#fffbeb",
    desc: "Theo dõi tiến độ chi tiết",
    features: [
      { icon: "ri-user-3-line", label: "Thống kê cá nhân" },
      { icon: "ri-line-chart-line", label: "Phân tích học tập" },
      { icon: "ri-robot-2-line", label: "AI Chatbot tiếng Hàn" },
      { icon: "ri-file-chart-line", label: "Báo cáo tuần" },
      { icon: "ri-progress-3-line", label: "Tiến độ tổng thể" },
      { icon: "ri-calendar-check-line", label: "Lịch học tập" },
    ],
  },
];

const VOCAB_PREVIEW = [
  { kr: "사랑", vi: "Tình yêu", rom: "sa-rang", level: "A1", color: "#22c55e" },
  { kr: "행복", vi: "Hạnh phúc", rom: "haeng-bok", level: "A1", color: "#f59e0b" },
  { kr: "공부하다", vi: "Học bài", rom: "gong-bu-ha-da", level: "A2", color: "#ec4899" },
  { kr: "여행", vi: "Du lịch", rom: "yeo-haeng", level: "A2", color: "#10b981" },
  { kr: "맛있다", vi: "Ngon", rom: "ma-sit-da", level: "A1", color: "#06b6d4" },
  { kr: "화이팅", vi: "Cố lên!", rom: "hwa-i-ting", level: "A1", color: "#f97316" },
];

const CONV_PREVIEW = [
  { kr: "안녕하세요! 오늘 날씨가 정말 좋네요.", vi: "Xin chào! Hôm nay thời tiết thật đẹp nhỉ.", role: "bot" },
  { kr: "네, 맞아요. 주말에 뭐 할 거예요?", vi: "Vâng, đúng vậy. Cuối tuần bạn sẽ làm gì?", role: "user" },
  { kr: "친구들이랑 한강에 갈 거예요. 같이 갈래요?", vi: "Tôi sẽ đi sông Hàn với bạn bè. Bạn có muốn đi cùng không?", role: "bot" },
];

function FeatureCard({ group, onStart }: { group: typeof FEATURE_GROUPS[0]; onStart: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 transition-all">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: group.bg }}>
            <i className={`${group.icon} text-lg`} style={{ color: group.color }}></i>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-sm">{group.label}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{group.desc}</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: group.bg, color: group.color }}>{group.features.length} tính năng</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {(expanded ? group.features : group.features.slice(0, 4)).map((f, i) => (
            <button key={i} onClick={onStart} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer text-left">
              <i className={`${f.icon} text-xs flex-shrink-0`} style={{ color: group.color }}></i>
              <span className="text-xs text-gray-600 truncate">{f.label}</span>
            </button>
          ))}
        </div>
        {group.features.length > 4 && (
          <button onClick={() => setExpanded(!expanded)} className="mt-2 w-full text-xs text-center py-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
            {expanded ? "Thu gọn" : `+${group.features.length - 4} tính năng khác`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeVocab, setActiveVocab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  usePageSEO({
    title: "Học tiếng Hàn EPS-TOPIK miễn phí | Hàn Quốc Ơi!",
    description: "Luyện thi EPS-TOPIK đi XKLĐ Hàn Quốc miễn phí. 60 bài học chính thức, đề thi 2025 có đáp án + audio, từ vựng theo chủ đề, flashcard ghi nhớ.",
    keywords: "học tiếng Hàn EPS, EPS-TOPIK, XKLĐ Hàn Quốc, đề thi EPS 2025, từ vựng EPS, hangul, học tiếng Hàn miễn phí",
    path: "/landing",
    ogType: "website",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Hàn Quốc Ơi!",
        url: "https://hanquocoi.vn",
        description: "Nền tảng luyện thi EPS-TOPIK miễn phí cho người Việt đi XKLĐ Hàn Quốc.",
        inLanguage: "vi",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://hanquocoi.vn/dictionary?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: "Hàn Quốc Ơi!",
        url: "https://hanquocoi.vn",
        description: "Nền tảng học tiếng Hàn online tập trung vào kỳ thi EPS-TOPIK cho lao động Việt Nam đi Hàn Quốc.",
        inLanguage: ["vi", "ko"],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map(item => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setActiveVocab(v => (v + 1) % VOCAB_PREVIEW.length), 2200);
    return () => clearInterval(t);
  }, []);

  const handleStart = () => {
    navigate(user ? "/dashboard" : "/onboarding");
  };

  const handleLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      {/* ── NAVBAR ─────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md border-b border-gray-100" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center flex-shrink-0">
              <i className="ri-translate-2 text-white text-sm"></i>
            </div>
            <span className={`font-black text-sm tracking-tight transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}>Hàn Quốc Ơi!</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {[["#features", "Tính năng"], ["#preview", "Xem thử"], ["#pricing", "Bảng giá"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} className={`text-sm transition-colors hover:text-[#22c55e] ${scrolled ? "text-gray-600" : "text-white/70"}`}>{label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={handleLogin} className={`text-sm transition-colors hidden md:block whitespace-nowrap cursor-pointer ${scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/70 hover:text-white"}`}>
              {user ? "Vào app" : "Đăng nhập"}
            </button>
            <button onClick={handleStart} className="bg-[#22c55e] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-[#16a34a] transition-colors whitespace-nowrap cursor-pointer">
              {user ? "Vào app" : "Bắt đầu miễn phí"}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden w-8 h-8 flex items-center justify-center cursor-pointer ${scrolled ? "text-gray-700" : "text-white"}`}>
              <i className={mobileOpen ? "ri-close-line text-xl" : "ri-menu-line text-xl"}></i>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            {[["#features", "Tính năng"], ["#preview", "Xem thử"], ["#pricing", "Bảng giá"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileOpen(false)} className="block text-sm text-gray-700 py-2 border-b border-gray-50">{label}</a>
            ))}
            <button onClick={() => { handleStart(); setMobileOpen(false); }} className="w-full bg-[#22c55e] text-white text-sm font-bold py-3 rounded-xl mt-2 cursor-pointer whitespace-nowrap">
              {user ? "Vào app" : "Bắt đầu miễn phí"}
            </button>
          </div>
        )}
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-amber-500/20 to-yellow-500/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/75" />

        <div className="relative z-10 text-center px-4 md:px-6 max-w-5xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 bg-app-card/70 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 md:mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse flex-shrink-0"></span>
            <span className="text-white/90 text-xs font-medium">Đề thi EPS 2025 thật — Học miễn phí</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black leading-none mb-4 md:mb-5 tracking-tight text-white">
            Hàn Quốc Ơi!
          </h1>
          <p className="text-lg md:text-2xl font-semibold text-white/80 mb-3 md:mb-4">
            Học tiếng Hàn không khó —
            <span className="text-[#4ade80]"> Vui là chính, giỏi là tất yếu!</span>
          </p>
          <p className="text-white/55 text-sm md:text-base max-w-xl mx-auto mb-8 md:mb-10 leading-relaxed">
            Nền tảng học tiếng Hàn EPS-TOPIK, TOPIK I/II với lộ trình AI cá nhân hóa. Học qua K-pop, Drama và tin tức thật.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-10 md:mb-14">
            <button onClick={handleStart} className="bg-[#22c55e] text-white font-bold px-7 md:px-8 py-3.5 md:py-4 rounded-xl text-sm md:text-base hover:bg-[#16a34a] transition-all hover:scale-105 whitespace-nowrap cursor-pointer w-full sm:w-auto">
              Bắt đầu miễn phí ngay <i className="ri-arrow-right-line ml-2"></i>
            </button>
            <a href="#features" className="flex items-center gap-2 bg-app-card/70 backdrop-blur-sm border border-white/20 hover:border-white/40 text-white/80 hover:text-white text-sm md:text-base px-5 md:px-6 py-3.5 md:py-4 rounded-xl transition-all whitespace-nowrap cursor-pointer w-full sm:w-auto justify-center">
              <i className="ri-apps-2-line text-[#4ade80]"></i>
              Khám phá tính năng
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-app-card/70 rounded-2xl overflow-hidden backdrop-blur-sm">
            {STATS.map((s, i) => (
              <div key={s.label} className={`bg-black/20 backdrop-blur-sm px-4 md:px-6 py-4 md:py-5 text-center ${i === 0 ? "rounded-tl-2xl rounded-bl-2xl" : ""} ${i === 3 ? "rounded-tr-2xl rounded-br-2xl" : ""}`}>
                <p className="text-xl md:text-2xl font-bold text-[#4ade80]">{s.value}</p>
                <p className="text-white/50 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-app-text-muted text-xs">Cuộn xuống</span>
          <i className="ri-arrow-down-line text-app-text-muted"></i>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full px-4 py-1.5 mb-4">
              <i className="ri-apps-2-line text-[#22c55e] text-xs"></i>
              <span className="text-[#22c55e] text-xs font-semibold tracking-normal">Tính năng</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-3 md:mb-4">Mọi thứ bạn cần để học tiếng Hàn</h2>
            <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">Từ bảng chữ cái đến thi EPS-TOPIK — một nền tảng duy nhất. <strong className="text-gray-700">60+ tính năng</strong> thiết kế cho người Việt.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {FEATURE_GROUPS.map(group => <FeatureCard key={group.id} group={group} onStart={handleStart} />)}
          </div>
          <div className="text-center mt-8">
            <button onClick={handleStart} className="inline-flex items-center gap-2 bg-gray-900 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-700 transition-all cursor-pointer whitespace-nowrap">
              <i className="ri-apps-2-line"></i>Xem tất cả 60+ tính năng
            </button>
          </div>
        </div>
      </section>

      {/* ── PREVIEW ──────────────────────────────────────────────────────── */}
      <section id="preview" className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 bg-[#ec4899]/10 border border-[#ec4899]/20 rounded-full px-4 py-1.5 mb-4">
              <i className="ri-eye-line text-[#ec4899] text-xs"></i>
              <span className="text-[#ec4899] text-xs font-semibold tracking-normal">Xem thử</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-3 md:mb-4">Trải nghiệm học thật sự</h2>
            <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">Không chỉ học từ vựng khô khan — học qua hội thoại thực tế, K-pop và ngữ cảnh sống động.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] rounded-2xl p-5 md:p-7 border border-[#22c55e]/20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 flex items-center justify-center bg-[#22c55e] rounded-xl flex-shrink-0">
                  <i className="ri-chat-3-line text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Hội thoại thực tế</h3>
                  <p className="text-xs text-gray-500">AI luyện nói với bạn 24/7</p>
                </div>
                <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-[#22c55e]/15 text-[#16a34a] font-semibold">LIVE</span>
              </div>
              <div className="space-y-3 mb-5">
                {CONV_PREVIEW.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${msg.role === "bot" ? "bg-[#22c55e] text-white" : "bg-gray-200 text-gray-600"}`}>
                      {msg.role === "bot" ? "AI" : "Bạn"}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${msg.role === "bot" ? "bg-white border border-gray-100" : "bg-[#22c55e] text-white"}`}>
                      <p className={`text-sm font-semibold ${msg.role === "bot" ? "text-gray-900" : "text-white"}`}>{msg.kr}</p>
                      <p className={`text-xs mt-0.5 ${msg.role === "bot" ? "text-gray-400" : "text-white/70"}`}>{msg.vi}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleStart} className="w-full py-2.5 bg-[#22c55e] text-white text-sm font-bold rounded-xl hover:bg-[#16a34a] transition-colors cursor-pointer whitespace-nowrap">
                Thử hội thoại AI ngay <i className="ri-arrow-right-line ml-2"></i>
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#fdf2f8] to-[#fce7f3] rounded-2xl p-5 md:p-7 border border-[#ec4899]/20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 flex items-center justify-center bg-[#ec4899] rounded-xl flex-shrink-0">
                  <i className="ri-book-2-line text-white text-lg"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Flashcard thông minh</h3>
                  <p className="text-xs text-gray-500">Spaced Repetition tối ưu ghi nhớ</p>
                </div>
                <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-[#ec4899]/15 text-[#db2777] font-semibold">SRS</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {VOCAB_PREVIEW.map((v, i) => (
                  <div key={v.kr} onClick={() => setActiveVocab(i)}
                    className={`rounded-xl p-3 border-2 transition-all cursor-pointer ${i === activeVocab ? "scale-105" : "border-transparent bg-white/60"}`}
                    style={i === activeVocab ? { borderColor: v.color, backgroundColor: `${v.color}10` } : {}}>
                    <p className="text-xl font-black text-gray-900">{v.kr}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{v.rom}</p>
                    <p className="text-sm font-semibold text-gray-700 mt-1">{v.vi}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold mt-1.5 inline-block" style={{ backgroundColor: `${v.color}20`, color: v.color }}>{v.level}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleStart} className="w-full py-2.5 bg-[#ec4899] text-white text-sm font-bold rounded-xl hover:bg-[#db2777] transition-colors cursor-pointer whitespace-nowrap">
                Học từ vựng ngay <i className="ri-arrow-right-line ml-2"></i>
              </button>
            </div>
          </div>

          <div className="mt-6 md:mt-8 relative rounded-2xl overflow-hidden border border-[#ec4899]/20">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 via-purple-500/20 to-indigo-500/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
            <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-[#ec4899]/20 border border-[#ec4899]/30 rounded-full px-3 py-1 mb-4">
                  <i className="ri-music-2-line text-[#ec4899] text-xs"></i>
                  <span className="text-[#ec4899] text-xs font-semibold">Tính năng độc quyền</span>
                </div>
                <h3 className="text-white text-xl md:text-2xl font-bold mb-2 md:mb-3">Học tiếng Hàn qua K-pop</h3>
                <p className="text-white/60 text-sm leading-relaxed max-w-md">AI phân tích lời bài hát Melon Chart, trích xuất từ vựng quan trọng, tạo quiz tương tác. Học từ BLACKPINK, BTS, aespa...</p>
              </div>
              <button onClick={handleStart} className="flex-shrink-0 inline-flex items-center gap-2 bg-[#ec4899] hover:bg-[#db2777] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all cursor-pointer whitespace-nowrap">
                <i className="ri-music-2-line"></i>Thử Melon Chart
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-full px-4 py-1.5 mb-4">
              <i className="ri-route-line text-[#f59e0b] text-xs"></i>
              <span className="text-[#f59e0b] text-xs font-semibold tracking-normal">Cách hoạt động</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-3 md:mb-4">4 bước đến thành công</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Test trình độ", desc: "AI đánh giá trình độ hiện tại trong 5 phút", icon: "ri-clipboard-line", color: "#22c55e" },
              { step: "02", title: "Lộ trình cá nhân", desc: "Nhận kế hoạch học tập được tùy chỉnh cho bạn", icon: "ri-route-line", color: "#f59e0b" },
              { step: "03", title: "Học mỗi ngày", desc: "20 phút/ngày với flashcard, quiz và tin tức thật", icon: "ri-calendar-check-line", color: "#ec4899" },
              { step: "04", title: "Thi & Đậu", desc: "Luyện đề thật, phân tích điểm yếu, tự tin thi EPS", icon: "ri-trophy-line", color: "#f97316" },
            ].map((step, i) => (
              <div key={step.step} className="relative bg-white rounded-2xl p-5 md:p-6 border border-gray-100 hover:border-gray-200 transition-all hover:-translate-y-1">
                {i < 3 && <div className="hidden md:block absolute top-8 -right-2 w-4 h-px bg-gray-200 z-10" />}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${step.color}15` }}>
                  <i className={`${step.icon} text-xl`} style={{ color: step.color }}></i>
                </div>
                <span className="text-[10px] font-black tracking-normal" style={{ color: step.color }}>{step.step}</span>
                <h3 className="text-gray-900 font-bold text-sm mt-1 mb-2">{step.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 bg-[#06b6d4]/10 border border-[#06b6d4]/20 rounded-full px-4 py-1.5 mb-4">
              <i className="ri-star-fill text-[#06b6d4] text-xs"></i>
              <span className="text-[#06b6d4] text-xs font-semibold tracking-normal">Học viên nói gì</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-3 md:mb-4">Hơn 3,200 người đã đậu EPS</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 md:p-6 hover:border-gray-200 transition-all flex flex-col">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <i key={i} className="ri-star-fill text-[#f59e0b] text-sm"></i>)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 flex-1">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img loading="lazy" decoding="async" src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-semibold">{t.name}</p>
                    <p className="text-gray-400 text-xs truncate">{t.role}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ backgroundColor: `${t.badgeColor}15` }}>
                    <i className={`${t.badge} text-xs`} style={{ color: t.badgeColor }}></i>
                    <span className="text-xs font-bold whitespace-nowrap" style={{ color: t.badgeColor }}>{t.score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full px-4 py-1.5 mb-4">
              <i className="ri-price-tag-3-line text-[#22c55e] text-xs"></i>
              <span className="text-[#22c55e] text-xs font-semibold tracking-normal">Bảng giá</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-3 md:mb-4">Đơn giản, minh bạch</h2>
            <p className="text-gray-500 text-sm md:text-base">Bắt đầu miễn phí, nâng cấp khi cần.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-7">
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-seedling-line text-[#22c55e] text-lg"></i>
                <p className="text-gray-500 text-sm">Miễn phí</p>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black text-gray-900">0đ</span>
                <span className="text-gray-400 text-sm">/mãi mãi</span>
              </div>
              <div className="border-t border-gray-100 my-5" />
              <ul className="space-y-3 mb-7">
                {["Hangul + Flashcard cơ bản", "10 câu EPS/ngày", "Đọc 3 bài tin tức/ngày", "Cộng đồng học viên", "Hệ thống XP & phần thưởng"].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-500">
                    <i className="ri-check-line mt-0.5 flex-shrink-0 text-gray-300"></i>{f}
                  </li>
                ))}
              </ul>
              <button onClick={handleStart} className="w-full py-3 rounded-xl font-semibold text-sm bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 transition-all whitespace-nowrap cursor-pointer">Bắt đầu miễn phí</button>
            </div>
            <div className="relative bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] border-2 border-[#22c55e]/40 rounded-2xl p-6 md:p-7">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#22c55e] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">Phổ biến nhất</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-vip-crown-line text-[#22c55e] text-lg"></i>
                <p className="text-[#16a34a] text-sm font-semibold">VIP</p>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black text-gray-900">99.000đ</span>
                <span className="text-gray-400 text-sm">/tháng</span>
              </div>
              <div className="border-t border-[#22c55e]/20 my-5" />
              <ul className="space-y-3 mb-7">
                {["Tất cả tính năng Free", "Không giới hạn câu EPS", "Lộ trình AI cá nhân hóa", "Phân tích điểm yếu chi tiết", "Đồng bộ cloud đa thiết bị", "Ưu tiên hỗ trợ 24/7", "Huy hiệu VIP độc quyền"].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <i className="ri-check-line mt-0.5 flex-shrink-0 text-[#22c55e]"></i>{f}
                  </li>
                ))}
              </ul>
              <button onClick={handleStart} className="w-full py-3 rounded-xl font-bold text-sm bg-[#22c55e] hover:bg-[#16a34a] text-white transition-all whitespace-nowrap cursor-pointer">Đăng ký VIP ngay</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/20 rounded-full px-4 py-1.5 mb-4">
              <i className="ri-question-line text-[#10b981] text-xs"></i>
              <span className="text-[#10b981] text-xs font-semibold tracking-normal">FAQ</span>
            </div>
            <h2 className="text-2xl md:text-5xl font-black text-gray-900 mb-3 md:mb-4">Câu hỏi thường gặp</h2>
          </div>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-all">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer">
                  <span className="text-gray-700 text-sm font-medium pr-4">{item.q}</span>
                  <i className={`ri-arrow-down-s-line text-gray-400 text-lg flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}></i>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 border-t border-gray-100">
                    <p className="text-gray-500 text-sm leading-relaxed pt-3">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden border border-[#22c55e]/20">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/30 via-emerald-500/20 to-teal-500/30" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#052e16]/90 via-[#14532d]/80 to-[#052e16]/90" />
            <div className="relative z-10 p-8 md:p-14 text-center">
              <p className="text-[#4ade80] text-xs font-semibold tracking-normal mb-4">Lên tàu ngay thôi!</p>
              <h2 className="text-2xl md:text-5xl font-black text-white mb-4 leading-tight">Biến tiếng Hàn<br />thành chuyện nhỏ</h2>
              <p className="text-white/50 text-sm md:text-base mb-8 max-w-xl mx-auto">Miễn phí hoàn toàn. Không cần thẻ tín dụng. Bắt đầu học ngay trong 2 phút.</p>
              <button onClick={handleStart} className="inline-flex items-center gap-2 bg-[#22c55e] text-white font-bold px-8 md:px-10 py-3.5 md:py-4 rounded-xl text-sm md:text-base hover:bg-[#16a34a] transition-all hover:scale-105 whitespace-nowrap cursor-pointer">
                Bắt đầu học miễn phí <i className="ri-arrow-right-line"></i>
              </button>
              <p className="text-app-text-muted text-xs mt-4">Không cần thẻ tín dụng · Miễn phí mãi mãi</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 py-10 md:py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] flex items-center justify-center flex-shrink-0">
                <i className="ri-translate-2 text-white text-sm"></i>
              </div>
              <div>
                <p className="text-white font-bold text-sm">Hàn Quốc Ơi!</p>
                <p className="text-app-text-muted text-xs">Vui là chính, giỏi là tất yếu!</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
              {[["#features", "Tính năng"], ["#preview", "Xem thử"], ["#pricing", "Bảng giá"], ["#faq", "FAQ"]].map(([href, label]) => (
                <a key={href} href={href} className="text-app-text-muted hover:text-white/60 text-xs transition-colors">{label}</a>
              ))}
              <button onClick={() => navigate("/dashboard")} className="text-app-text-muted hover:text-white/60 text-xs transition-colors cursor-pointer whitespace-nowrap">Vào app</button>
            </div>
            <p className="text-white/15 text-xs">© 2026 Hàn Quốc Ơi! All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

