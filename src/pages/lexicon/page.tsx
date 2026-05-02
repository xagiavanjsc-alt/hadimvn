import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import VocabHeader from "./components/VocabHeader";
import RootAnalysis from "./components/RootAnalysis";
import HanjaTree from "./components/HanjaTree";
import MnemonicStory from "./components/MnemonicStory";
import ExampleTable from "./components/ExampleTable";
import VIPUpgradePopup from "./components/VIPUpgradePopup";
import SwipeCard from "./components/SwipeCard";
import { featuredVocabulary, vocabularyList, topicFilters, levelFilters } from "@/mocks/vocabulary";

const FREE_LIMIT = 5;

export default function LexiconPage() {
  const navigate = useNavigate();
  const [showVIP, setShowVIP] = useState(false);
  const [viewCount, setViewCount] = useState(3);
  const [currentVocab] = useState(featuredVocabulary);
  const [swipeMode, setSwipeMode] = useState(false);
  const [swipeIndex, setSwipeIndex] = useState(0);

  // Filters
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (viewCount >= FREE_LIMIT) {
      const timer = setTimeout(() => setShowVIP(true), 800);
      return () => clearTimeout(timer);
    }
  }, [viewCount]);

  const filteredWords = useMemo(() => {
    return vocabularyList.filter((w) => {
      const matchTopic = selectedTopic === "all" || w.topic === selectedTopic;
      const matchLevel = selectedLevel === "all" || w.level === selectedLevel;
      const matchSearch = searchQuery.trim() === ""
        || w.korean.includes(searchQuery)
        || w.meaning.toLowerCase().includes(searchQuery.toLowerCase())
        || w.sinoViet.toLowerCase().includes(searchQuery.toLowerCase())
        || w.hanja.includes(searchQuery);
      return matchTopic && matchLevel && matchSearch;
    });
  }, [selectedTopic, selectedLevel, searchQuery]);

  const activeFilterCount = [
    selectedTopic !== "all",
    selectedLevel !== "all",
    searchQuery.trim() !== "",
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#F5F2ED]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {swipeMode && (
        <SwipeCard
          words={vocabularyList}
          currentIndex={swipeIndex}
          onSwipeLeft={() => setSwipeIndex((i) => Math.min(i + 1, vocabularyList.length - 1))}
          onSwipeRight={() => setSwipeIndex((i) => Math.min(i + 1, vocabularyList.length - 1))}
        />
      )}

      <main className="pt-16">
        {viewCount < FREE_LIMIT && (
          <div className="bg-[#D4AF37]/15 border-b border-[#D4AF37]/25 py-2 px-4 text-center">
            <p className="text-xs text-[#2C1810]/70">
              Bạn đã xem <strong>{viewCount}/{FREE_LIMIT}</strong> từ miễn phí hôm nay.{" "}
              <button
                onClick={() => setShowVIP(true)}
                className="text-[#8B6914] font-bold hover:underline cursor-pointer"
              >
                Nâng cấp VIP
              </button>{" "}
              để học không giới hạn.
            </p>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {/* Mobile Swipe button */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setSwipeMode(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#4A5D23]/20 border border-[#4A5D23]/40 text-[#7AB648] text-sm font-bold py-3 rounded-xl cursor-pointer whitespace-nowrap"
            >
              <i className="ri-swap-line text-base"></i>
              Chế độ Swipe – Lướt như TikTok
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main content */}
            <div className="lg:col-span-3 space-y-5">
              <VocabHeader
                korean={currentVocab.korean}
                hanja={currentVocab.hanja}
                sinoVietnamese={currentVocab.sinoVietnamese}
                meaningVi={currentVocab.meaningVi}
                pronunciation={currentVocab.pronunciation}
              />
              <RootAnalysis
                korean={currentVocab.korean}
                char1={currentVocab.rootAnalysis.char1}
                char2={currentVocab.rootAnalysis.char2}
                explanation={currentVocab.rootAnalysis.explanation}
              />
              <HanjaTree
                root={currentVocab.korean}
                rootHanja={currentVocab.hanja}
                rootMeaning={currentVocab.meaningVi}
                relatedWords={currentVocab.relatedWords}
              />
              <MnemonicStory story={currentVocab.story} word={currentVocab.korean} />
              <ExampleTable examples={currentVocab.examples} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              {/* Filter Panel */}
              <div className="bg-white border border-[#D6C9A0]/60 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[#4A3520]/40">
                    Bộ lọc từ vựng
                  </h3>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-1.5 text-xs text-[#8B6914] cursor-pointer hover:opacity-80 relative"
                  >
                    <i className="ri-filter-3-line"></i>
                    Lọc
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center bg-[#8B6914] text-white text-[9px] font-bold rounded-full">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                  <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#4A3520]/30 text-sm"></i>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm từ Hàn, nghĩa..."
                    className="w-full pl-9 pr-4 py-2.5 bg-[#F5F2ED] border border-[#D6C9A0]/60 rounded-xl text-sm text-[#2C1810] placeholder-[#4A3520]/30 outline-none focus:border-[#8B6914]/50 transition-colors"
                    style={{ fontFamily: "'Noto Serif', serif" }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A3520]/40 cursor-pointer hover:text-[#2C1810]">
                      <i className="ri-close-line text-sm"></i>
                    </button>
                  )}
                </div>

                {/* Expandable filter section */}
                {showFilters && (
                  <div className="space-y-3 border-t border-[#D6C9A0]/40 pt-3">
                    {/* Level filter */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A3520]/40 mb-2">Cấp độ TOPIK</p>
                      <div className="flex flex-wrap gap-1.5">
                        {levelFilters.map((lf) => (
                          <button
                            key={lf.id}
                            onClick={() => setSelectedLevel(lf.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                              selectedLevel === lf.id
                                ? "bg-[#2C1810] text-[#F5EFD7] border-[#2C1810]"
                                : "bg-[#F5F2ED] border-[#D6C9A0] text-[#5C4A1E] hover:border-[#8B6914]"
                            }`}
                          >
                            {lf.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Topic filter */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#4A3520]/40 mb-2">Chủ đề</p>
                      <div className="flex flex-col gap-1">
                        {topicFilters.map((tf) => (
                          <button
                            key={tf.id}
                            onClick={() => setSelectedTopic(tf.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                              selectedTopic === tf.id
                                ? "bg-[#D4AF37]/15 text-[#8B6914] border border-[#D4AF37]/30"
                                : "hover:bg-[#F5F2ED] text-[#5C4A1E]/80"
                            }`}
                          >
                            <i className={`${tf.icon} text-sm w-4 h-4 flex items-center justify-center`}></i>
                            <span>{tf.label}</span>
                            <span className="ml-auto text-[10px] text-[#4A3520]/30">
                              {tf.id === "all" ? vocabularyList.length : vocabularyList.filter(v => v.topic === tf.id).length}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => { setSelectedTopic("all"); setSelectedLevel("all"); setSearchQuery(""); }}
                        className="w-full text-xs text-[#8B6914] py-1.5 hover:underline cursor-pointer"
                      >
                        Xóa bộ lọc ({activeFilterCount})
                      </button>
                    )}
                  </div>
                )}

                {/* Results count */}
                <div className="mt-3 text-[11px] text-[#4A3520]/40">
                  Hiển thị <strong className="text-[#8B6914]">{filteredWords.length}</strong> / {vocabularyList.length} từ
                </div>
              </div>

              {/* Word list */}
              <div className="bg-white border border-[#D6C9A0]/60 rounded-2xl p-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#4A3520]/40 mb-3">
                  Từ vựng
                </h3>
                <div className="space-y-1 max-h-96 overflow-y-auto pr-1">
                  {filteredWords.length === 0 ? (
                    <div className="text-center py-8 text-sm text-[#5C4A1E]/40">
                      <i className="ri-search-line text-2xl mb-2 block"></i>
                      Không tìm thấy từ phù hợp
                    </div>
                  ) : (
                    filteredWords.slice(0, 60).map((word) => (
                      <Link
                        key={word.id}
                        to={`/lexicon/${encodeURIComponent(word.korean)}`}
                        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                          word.id === currentVocab.id
                            ? "bg-[#D4AF37]/10 border border-[#D4AF37]/30"
                            : "hover:bg-[#F5F2ED]"
                        }`}
                        onClick={() => setViewCount((c) => c + 1)}
                      >
                        <div
                          className={`text-base font-bold w-10 text-center shrink-0 ${
                            word.id === currentVocab.id ? "text-[#8B6914]" : "text-[#2C1810]/70"
                          }`}
                          style={{ fontFamily: "'Noto Serif', serif" }}
                        >
                          {word.korean}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-semibold text-[#2C1810]/80 truncate">{word.sinoViet}</div>
                          <div className="text-[10px] text-[#4A3520]/45 truncate">{word.meaning}</div>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F5F2ED] border border-[#D6C9A0]/50 whitespace-nowrap ${
                          levelFilters.find(l => l.id === word.level)?.color || "text-[#5C4A1E]/50"
                        }`}>
                          {word.level?.replace("TOPIK ", "T")}
                        </span>
                      </Link>
                    ))
                  )}
                  {filteredWords.length > 60 && (
                    <p className="text-center text-[11px] text-[#5C4A1E]/40 py-2">
                      ... và {filteredWords.length - 60} từ nữa
                    </p>
                  )}
                </div>
              </div>

              {/* VIP promo card */}
              <div className="bg-[#2C1810] rounded-2xl p-5">
                <div className="w-10 h-10 flex items-center justify-center bg-[#D4AF37]/20 rounded-xl mb-3">
                  <i className="ri-vip-crown-fill text-[#D4AF37] text-lg"></i>
                </div>
                <h3 className="text-sm font-bold text-[#F5EFD7] mb-1">Mở khóa tất cả</h3>
                <p className="text-xs text-[#F5EFD7]/55 mb-4 leading-relaxed">
                  2.600 từ vựng + 500 truyện chêm AI + Audio chuẩn Seoul
                </p>
                <button
                  onClick={() => setShowVIP(true)}
                  className="w-full bg-[#D4AF37] text-[#1A1E23] text-xs font-bold py-2.5 rounded-lg cursor-pointer hover:bg-[#C9A42E] transition-colors whitespace-nowrap"
                >
                  Kích hoạt VIP – 99.000đ/tháng
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      {showVIP && <VIPUpgradePopup onClose={() => setShowVIP(false)} />}
    </div>
  );
}
