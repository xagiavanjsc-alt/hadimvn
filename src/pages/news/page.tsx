import { useState } from "react";
import MobileHeader from "../../components/feature/MobileHeader";
import MobileNav from "../../components/feature/MobileNav";
import { useNavigate } from "react-router-dom";

const newsItems = [
  {
    id: 1,
    title: "한국어 능력시험 TOPIK 접수 일정 발표",
    summary: "2026년 상반기 TOPIK 시험 접수가 시작되었습니다. 일정을 확인하고 준비하세요.",
    category: "시험",
    date: "2026.04.20",
    image: "/images/brand/logo.svg",
    readTime: "3분",
  },
  {
    id: 2,
    title: "EPS-TOPIK 필기시험 변경 사항 안내",
    summary: "2026년부터 EPS-TOPIK 시험 문항 수와 시험 시간이 일부 변경됩니다.",
    category: "EPS",
    date: "2026.04.18",
    image: "/images/brand/logo.svg",
    readTime: "2분",
  },
  {
    id: 3,
    title: "한국어 학습 앱 이용자 100만 돌파",
    summary: "한국어 학습 앱 사용자가 100만 명을 넘어서며 K-문화 열풍이 이어지고 있습니다.",
    category: "문화",
    date: "2026.04.15",
    image: "/images/brand/logo.svg",
    readTime: "4분",
  },
  {
    id: 4,
    title: "서울시 외국인 한국어 교육 지원 확대",
    summary: "서울시가 외국인 거주자를 위한 한국어 교육 지원 예산을 대폭 늘렸습니다.",
    category: "교육",
    date: "2026.04.12",
    image: "/images/brand/logo.svg",
    readTime: "3분",
  },
];

const categoryColors: Record<string, string> = {
  시험: "bg-blue-100 text-blue-600",
  EPS: "bg-orange-100 text-orange-600",
  문화: "bg-pink-100 text-pink-600",
  교육: "bg-green-100 text-green-600",
};

const NewsPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("전체");
  const filters = ["전체", "시험", "EPS", "문화", "교육"];

  const filtered =
    activeFilter === "전체"
      ? newsItems
      : newsItems.filter((n) => n.category === activeFilter);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Desktop top bar */}
      <header className="hidden md:flex sticky top-0 z-30 bg-[#f8f9fa]/95 backdrop-blur-md border-b border-gray-200 h-14 items-center px-6 gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:text-gray-700 cursor-pointer flex-shrink-0"
        >
          <i className="ri-arrow-left-line" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center bg-[#4F46E5] rounded-md">
            <i className="ri-newspaper-line text-white text-sm" />
          </div>
          <span className="text-gray-800 font-bold text-sm">한국어 뉴스</span>
        </div>
        <p className="text-gray-400 text-xs">Học tiếng Hàn qua tin tức thực tế</p>
      </header>

      <MobileHeader title="한국어 뉴스" />
      <div className="pt-16 px-4">
        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                activeFilter === f
                  ? "bg-[#4F46E5] text-white"
                  : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* News Cards */}
        <div className="space-y-4">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-40 object-cover object-top"
              />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      categoryColors[item.category] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-400">{item.date}</span>
                  <span className="text-xs text-gray-400 ml-auto">
                    읽기 {item.readTime}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <MobileNav />
    </div>
  );
};

export default NewsPage;
