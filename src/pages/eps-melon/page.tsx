import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { mockMelonSongs, MelonSong } from "@/mocks/melonSongs";
import { epsVocabulary } from "@/mocks/epsVocabulary";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface EpsWord {
  id: string;
  korean: string;
  vietnamese: string;
  category: string;
  example?: string;
}

interface MatchedWord {
  epsWord: EpsWord;
  matchedIn: string; // lyric line
  context: string;
}

interface SongEpsMatch {
  song: MelonSong;
  matches: MatchedWord[];
}

// ─── EPS Vocab normalization ───────────────────────────────────────────────────
function buildEpsWords(): EpsWord[] {
  return epsVocabulary.slice(0, 200).map((v, i) => ({
    id: String(i),
    korean: v.korean,
    vietnamese: v.vietnamese,
    category: v.topic ?? "Từ vựng",
    example: v.example,
  })).filter((w: EpsWord) => w.korean.length > 1);
}

// Fallback built-in EPS words (common, realistic) in case mock has different fields
const BUILTIN_EPS_WORDS: EpsWord[] = [
  { id: "b1", korean: "사랑", vietnamese: "Tình yêu", category: "Cảm xúc", example: "사랑해요 - Tôi yêu bạn" },
  { id: "b2", korean: "마음", vietnamese: "Tâm trồng / lòng", category: "Cảm xúc", example: "마음이 아파요 - Lòng tôi đau" },
  { id: "b3", korean: "눈", vietnamese: "Mắt / tuyết", category: "Cơ thể", example: "눈이 예뻐요 - Mắt đẹp quá" },
  { id: "b4", korean: "손", vietnamese: "Bàn tay", category: "Cơ thể", example: "손을 잡아요 - Nắm tay" },
  { id: "b5", korean: "하늘", vietnamese: "Bầu trời", category: "Thiên nhiên", example: "하늘이 맑아요 - Trời trong xanh" },
  { id: "b6", korean: "꿈", vietnamese: "Giấc mơ", category: "Cuộc sống", example: "꿈을 꿔요 - Mơ ước" },
  { id: "b7", korean: "시간", vietnamese: "Thời gian", category: "Thời gian", example: "시간이 빨라요 - Thời gian trôi nhanh" },
  { id: "b8", korean: "세상", vietnamese: "Thế giới", category: "Địa điểm", example: "세상에서 제일 - Nhất thế giới" },
  { id: "b9", korean: "별", vietnamese: "Ngôi sao", category: "Thiên nhiên", example: "별이 빛나요 - Sao sáng" },
  { id: "b10", korean: "빛", vietnamese: "Ánh sáng", category: "Thiên nhiên", example: "빛이 나요 - Toả sáng" },
  { id: "b11", korean: "길", vietnamese: "Con đường", category: "Địa điểm", example: "길을 걸어요 - Đi bộ trên đường" },
  { id: "b12", korean: "말", vietnamese: "Lời nói", category: "Giao tiếp", example: "말을 해요 - Nói chuyện" },
  { id: "b13", korean: "기억", vietnamese: "Ký ức", category: "Tư duy", example: "기억이 나요 - Nhớ ra rồi" },
  { id: "b14", korean: "처음", vietnamese: "Lần đầu tiên", category: "Thời gian", example: "처음 봤어요 - Gặp lần đầu" },
  { id: "b15", korean: "느낌", vietnamese: "Cảm giác", category: "Cảm xúc", example: "느낌이 좋아요 - Cảm giác tốt" },
  { id: "b16", korean: "목소리", vietnamese: "Giọng nói", category: "Giao tiếp", example: "목소리가 예뻐요 - Giọng đẹp" },
  { id: "b17", korean: "이름", vietnamese: "Tên", category: "Giao tiếp", example: "이름이 뭐예요? - Tên là gì?" },
  { id: "b18", korean: "웃음", vietnamese: "Nụ cười", category: "Cảm xúc", example: "웃음이 예뻐요 - Nụ cười đẹp" },
  { id: "b19", korean: "밤", vietnamese: "Đêm", category: "Thời gian", example: "밤이 깊어요 - Đêm khuya rồi" },
  { id: "b20", korean: "우리", vietnamese: "Chúng ta", category: "Đại từ", example: "우리 같이 가요 - Chúng ta cùng đi" },
  { id: "b21", korean: "행복", vietnamese: "Hạnh phúc", category: "Cảm xúc", example: "행복해요 - Hạnh phúc lắm" },
  { id: "b22", korean: "미소", vietnamese: "Nụ cười/mỉm cười", category: "Cảm xúc", example: "미소를 지어요 - Mỉm cười" },
  { id: "b23", korean: "노래", vietnamese: "Bài hát / hát", category: "Âm nhạc", example: "노래를 불러요 - Hát bài hát" },
  { id: "b24", korean: "춤", vietnamese: "Điệu nhảy", category: "Âm nhạc", example: "춤을 춰요 - Nhảy múa" },
  { id: "b25", korean: "음악", vietnamese: "Âm nhạc", category: "Âm nhạc", example: "음악이 좋아요 - Thích âm nhạc" },
  { id: "b26", korean: "가슴", vietnamese: "Ngực / trái tim", category: "Cơ thể", example: "가슴이 뛰어요 - Tim đập rộn" },
  { id: "b27", korean: "숨", vietnamese: "Hơi thở", category: "Cơ thể", example: "숨이 막혀요 - Nghẹt thở" },
  { id: "b28", korean: "나", vietnamese: "Tôi / Mình", category: "Đại từ", example: "나는 학생이에요 - Tôi là học sinh" },
  { id: "b29", korean: "너", vietnamese: "Bạn / Cậu", category: "Đại từ", example: "너를 좋아해 - Tôi thích cậu" },
  { id: "b30", korean: "혼자", vietnamese: "Một mình", category: "Trạng thái", example: "혼자 있어요 - Ở một mình" },
];

// ─── Match engine ──────────────────────────────────────────────────────────────
function matchEpsToLyrics(song: MelonSong, epsWords: EpsWord[]): MatchedWord[] {
  const lines = song.lyrics.split("\n").filter((l) => l.trim().length > 0);
  const matches: MatchedWord[] = [];
  const seenWords = new Set<string>();

  epsWords.forEach((w) => {
    if (!w.korean || w.korean.length < 2) return;
    for (const line of lines) {
      if (line.includes(w.korean) && !seenWords.has(w.korean)) {
        seenWords.add(w.korean);
        matches.push({
          epsWord: w,
          matchedIn: line.trim(),
          context: line.trim(),
        });
        break;
      }
    }
  });

  return matches;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const CATEGORIES = ["Tất cả", "Cảm xúc", "Thiên nhiên", "Giao tiếp", "Thời gian", "Đại từ", "Cơ thể", "Âm nhạc"];

export default function EpsMelonPage() {
  const navigate = useNavigate();
  const [selectedSong, setSelectedSong] = useState<MelonSong | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");
  const [learnedIds, setLearnedIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("eps_melon_learned");
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  });
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const epsWords = useMemo(() => {
    const built = buildEpsWords();
    return built.length >= 20 ? built : BUILTIN_EPS_WORDS;
  }, []);

  const songMatches = useMemo((): SongEpsMatch[] => {
    return mockMelonSongs.map((song) => ({
      song,
      matches: matchEpsToLyrics(song, epsWords),
    })).filter((s) => s.matches.length > 0);
  }, [epsWords]);

  const activeMatches = useMemo((): MatchedWord[] => {
    const base = selectedSong
      ? matchEpsToLyrics(selectedSong, epsWords)
      : epsWords.map((w) => ({ epsWord: w, matchedIn: "", context: "" }));

    const filtered = categoryFilter === "Tất cả"
      ? base
      : base.filter((m) => m.epsWord.category === categoryFilter);

    if (!searchQuery.trim()) return filtered;
    const q = searchQuery.toLowerCase();
    return filtered.filter(
      (m) =>
        m.epsWord.korean.includes(q) ||
        m.epsWord.vietnamese.toLowerCase().includes(q) ||
        m.epsWord.category.toLowerCase().includes(q)
    );
  }, [selectedSong, epsWords, categoryFilter, searchQuery]);

  const totalVocab = epsWords.length;
  const learnedCount = learnedIds.size;

  const toggleLearned = useCallback((id: string) => {
    setLearnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("eps_melon_learned", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const toggleFlip = useCallback((id: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-app-bg/95 backdrop-blur-md border-b border-app-border h-14 flex items-center px-4 md:px-6 gap-3">
        <button
          onClick={() => navigate("/melon")}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-white/60 hover:text-white cursor-pointer flex-shrink-0"
        >
          <i className="ri-arrow-left-line" />
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 flex items-center justify-center bg-emerald-500/20 rounded-lg flex-shrink-0">
            <i className="ri-book-2-line text-app-accent-success text-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-sm leading-tight">EPS + Melon</p>
            <p className="text-app-text-muted text-[10px] hidden sm:block">Học từ vựng EPS-TOPIK qua lời bài hát K-pop</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-app-accent-success/70">
          <i className="ri-checkbox-circle-line" />
          <span className="hidden sm:inline">{learnedCount}/{totalVocab} đã học</span>
          <span className="sm:hidden">{learnedCount}/{totalVocab}</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">

        {/* Hero banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6 h-32">
          <img
            style={{ background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)" }}
            alt="EPS Melon"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6">
            <h1 className="text-white text-xl font-bold mb-1">EPS × K-pop Learning</h1>
            <p className="text-white/60 text-xs max-w-md leading-relaxed">
              Từ vựng EPS-TOPIK xuất hiện trong lời bài hát — học vừa thực tế, vừa vui!
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: "ri-book-2-line", color: "text-app-accent-success", val: totalVocab, label: "Tổng từ EPS" },
            { icon: "ri-music-2-line", color: "text-app-accent-primary", val: songMatches.length, label: "Bài có từ EPS" },
            { icon: "ri-checkbox-circle-line", color: "text-green-400", val: learnedCount, label: "Đã học" },
            {
              icon: "ri-percent-line",
              color: "text-orange-400",
              val: totalVocab > 0 ? `${Math.round((learnedCount / totalVocab) * 100)}%` : "0%",
              label: "Tiến độ",
            },
          ].map((s) => (
            <div key={s.label} className="bg-app-surface/50 border border-app-border rounded-2xl p-3 text-center">
              <div className="w-8 h-8 flex items-center justify-center mx-auto mb-1">
                <i className={`${s.icon} ${s.color} text-lg`} />
              </div>
              <p className={`text-base font-bold ${s.color}`}>{s.val}</p>
              <p className="text-app-text-muted text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Song list */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-app-surface/50 border border-app-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-app-border">
                <p className="text-white/60 text-xs font-semibold tracking-normal">Bài hát</p>
              </div>

              {/* All words option */}
              <button
                onClick={() => setSelectedSong(null)}
                className={`w-full flex items-center gap-3 px-4 py-3 border-b border-app-border cursor-pointer transition-colors ${
                  !selectedSong ? "bg-emerald-500/10 text-emerald-300" : "hover:bg-app-card/50 text-white/50"
                }`}
              >
                <div className="w-8 h-8 flex items-center justify-center bg-app-accent-success/15 rounded-lg flex-shrink-0">
                  <i className="ri-list-check text-app-accent-success text-sm" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">Tất cả từ EPS</p>
                  <p className="text-[10px] text-app-text-muted">{epsWords.length} từ</p>
                </div>
                {!selectedSong && <i className="ri-arrow-right-s-line text-app-accent-success flex-shrink-0" />}
              </button>

              {/* Song list */}
              <div className="max-h-96 overflow-y-auto">
                {songMatches.map(({ song, matches }) => (
                  <button
                    key={song.rank}
                    onClick={() => setSelectedSong(song)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border-b border-app-border cursor-pointer transition-colors last:border-0 ${
                      selectedSong?.rank === song.rank
                        ? "bg-app-accent-primary/8 text-app-accent-primary"
                        : "hover:bg-app-card/50 text-white/60"
                    }`}
                  >
                    <img
                      src={song.albumArt}
                      alt={song.title}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-medium truncate text-white/80">{song.title}</p>
                      <p className="text-[10px] text-app-text-muted truncate">{song.artist}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      selectedSong?.rank === song.rank
                        ? "bg-app-accent-primary/20 text-app-accent-primary"
                        : "bg-white/8 text-app-text-secondary"
                    }`}>
                      {matches.length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Info card */}
            <div className="mt-3 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-information-line text-app-accent-success text-sm" />
                <p className="text-app-accent-success/80 text-xs font-semibold">Cách học hiệu quả</p>
              </div>
              <ol className="text-app-text-secondary text-[10px] leading-relaxed space-y-1 list-decimal list-inside">
                <li>Chọn bài hát yêu thích</li>
                <li>Xem từ EPS xuất hiện trong lời</li>
                <li>Nhấn thẻ để xem nghĩa & ví dụ</li>
                <li>Nhấn ✓ khi đã nhớ</li>
              </ol>
            </div>
          </div>

          {/* Right: Vocabulary cards */}
          <div className="flex-1 min-w-0">
            {/* Song context header */}
            {selectedSong && (
              <div className="flex items-center gap-3 bg-app-surface/50 border border-app-border rounded-2xl p-4 mb-5">
                <img src={selectedSong.albumArt} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-semibold text-sm">{selectedSong.title}</p>
                    <span className="text-[10px] bg-[#00C73C]/15 text-[#00C73C] px-2 py-0.5 rounded-full">
                      #{selectedSong.rank}
                    </span>
                  </div>
                  <p className="text-app-text-secondary text-xs">{selectedSong.artist}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-app-accent-primary font-bold text-lg">{activeMatches.length}</p>
                  <p className="text-app-text-muted text-[10px]">từ EPS</p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              {/* Search */}
              <div className="relative flex-1">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm từ vựng..."
                  className="w-full bg-app-card/50 border border-app-border rounded-xl pl-9 pr-4 py-2 text-white/80 text-sm placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
              {/* Category filter */}
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`text-xs px-3 py-2 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                      categoryFilter === cat
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-app-card/50 text-app-text-secondary border border-app-border hover:border-white/15"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Cards grid */}
            {activeMatches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 flex items-center justify-center bg-app-card/50 rounded-2xl mb-3">
                  <i className="ri-search-line text-app-text-muted text-xl" />
                </div>
                <p className="text-app-text-secondary text-sm">Không tìm thấy từ vựng nào</p>
                <p className="text-app-text-muted text-xs mt-1">
                  {selectedSong
                    ? "Bài hát này chưa có từ EPS phù hợp"
                    : "Thử thay đổi bộ lọc"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeMatches.map(({ epsWord, context }) => {
                  const isFlipped = flippedCards.has(epsWord.id);
                  const isLearned = learnedIds.has(epsWord.id);
                  return (
                    <div
                      key={epsWord.id}
                      className={`relative rounded-2xl border cursor-pointer transition-all overflow-hidden ${
                        isLearned
                          ? "bg-emerald-500/8 border-emerald-500/25"
                          : isFlipped
                          ? "bg-app-accent-primary/5 border-app-accent-primary/20"
                          : "bg-app-surface/50 border-app-border hover:border-app-border"
                      }`}
                      onClick={() => toggleFlip(epsWord.id)}
                    >
                      {/* Learned badge */}
                      {isLearned && (
                        <div className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-emerald-500 rounded-full z-10">
                          <i className="ri-check-line text-white text-xs" />
                        </div>
                      )}

                      <div className="p-4">
                        {/* Category tag */}
                        <span className="inline-block text-[9px] font-semibold text-app-text-muted bg-app-card/50 px-2 py-0.5 rounded-full mb-2 tracking-wide">
                          {epsWord.category}
                        </span>

                        {/* Korean word — always shown */}
                        <p className={`text-xl font-bold mb-1 ${isLearned ? "text-emerald-300" : "text-app-accent-primary"}`}>
                          {epsWord.korean}
                        </p>

                        {/* Meaning & example — revealed on flip */}
                        {!isFlipped && !isLearned ? (
                          <p className="text-app-text-muted text-xs italic">Nhấn để xem nghĩa</p>
                        ) : (
                          <>
                            <p className="text-white/75 text-sm font-medium mb-2">{epsWord.vietnamese}</p>
                            {epsWord.example && (
                              <p className="text-white/35 text-xs italic leading-relaxed mb-2">{epsWord.example}</p>
                            )}
                          </>
                        )}

                        {/* Context from lyrics */}
                        {context && (isFlipped || isLearned) && (
                          <div className="mt-2 pt-2 border-t border-app-border">
                            <p className="text-app-text-muted text-[10px] mb-1 tracking-wide">Trong lời bài hát</p>
                            <p className="text-white/50 text-xs leading-relaxed italic">
                              {context.length > 60 ? context.slice(0, 60) + "…" : context}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Mark learned button */}
                      {(isFlipped || isLearned) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleLearned(epsWord.id); }}
                          className={`w-full py-2.5 text-xs font-semibold border-t transition-colors cursor-pointer ${
                            isLearned
                              ? "border-emerald-500/20 text-app-accent-success/70 hover:text-red-400 bg-emerald-500/5"
                              : "border-app-border text-app-text-secondary hover:text-app-accent-success hover:bg-emerald-500/8"
                          }`}
                        >
                          {isLearned ? (
                            <><i className="ri-close-line mr-1" />Bỏ đánh dấu</>
                          ) : (
                            <><i className="ri-checkbox-circle-line mr-1" />Đã học rồi!</>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Progress bar */}
            {activeMatches.length > 0 && (
              <div className="mt-6 bg-app-surface/50 border border-app-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/50 text-xs">Tiến độ học EPS qua K-pop</span>
                  <span className="text-app-accent-success text-xs font-bold">
                    {learnedCount}/{totalVocab} từ
                  </span>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${totalVocab > 0 ? (learnedCount / totalVocab) * 100 : 0}%` }}
                  />
                </div>
                {learnedCount > 0 && (
                  <p className="text-app-text-muted text-[10px] mt-2 text-center">
                    🎉 Bạn đã học được {learnedCount} từ EPS từ K-pop. Tiếp tục phát huy!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

