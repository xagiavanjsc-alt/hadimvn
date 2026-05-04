import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { mockMelonSongs, MelonSong } from "@/mocks/melonSongs";
import { epsVocabulary } from "@/mocks/epsVocabulary";

// --- Types ---------------------------------------------------------------------
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

// --- EPS Vocab normalization ---------------------------------------------------
function buildEpsWords(): EpsWord[] {
  // Use epsVocabulary mock — may have different shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (epsVocabulary as any[]).slice(0, 200).map((v: any, i: number) => ({
    id: String(i),
    korean: v.korean ?? v.word ?? v.kr ?? "",
    vietnamese: v.vietnamese ?? v.meaning ?? v.vi ?? "",
    category: v.category ?? v.topic ?? "T? v?ng",
    example: v.example ?? v.sentence ?? "",
  })).filter((w: EpsWord) => w.korean.length > 1);
}

// Fallback built-in EPS words (common, realistic) in case mock has different fields
const BUILTIN_EPS_WORDS: EpsWord[] = [
  { id: "b1", korean: "??", vietnamese: "Tình yêu", category: "C?m xúc", example: "???? - Tôi yêu b?n" },
  { id: "b2", korean: "??", vietnamese: "Tâm tr?ng / lòng", category: "C?m xúc", example: "??? ??? - Lòng tôi dau" },
  { id: "b3", korean: "?", vietnamese: "M?t / tuy?t", category: "Co th?", example: "?? ??? - M?t d?p quá" },
  { id: "b4", korean: "?", vietnamese: "Bàn tay", category: "Co th?", example: "?? ??? - N?m tay" },
  { id: "b5", korean: "??", vietnamese: "B?u tr?i", category: "Thiên nhiên", example: "??? ??? - Tr?i trong xanh" },
  { id: "b6", korean: "?", vietnamese: "Gi?c mo", category: "Cu?c s?ng", example: "?? ?? - Mo u?c" },
  { id: "b7", korean: "??", vietnamese: "Th?i gian", category: "Th?i gian", example: "??? ??? - Th?i gian trôi nhanh" },
  { id: "b8", korean: "??", vietnamese: "Th? gi?i", category: "Ð?a di?m", example: "???? ?? - Nh?t th? gi?i" },
  { id: "b9", korean: "?", vietnamese: "Ngôi sao", category: "Thiên nhiên", example: "?? ??? - Sao sáng" },
  { id: "b10", korean: "?", vietnamese: "Ánh sáng", category: "Thiên nhiên", example: "?? ?? - To? sáng" },
  { id: "b11", korean: "?", vietnamese: "Con du?ng", category: "Ð?a di?m", example: "?? ??? - Ði b? trên du?ng" },
  { id: "b12", korean: "?", vietnamese: "L?i nói", category: "Giao ti?p", example: "?? ?? - Nói chuy?n" },
  { id: "b13", korean: "??", vietnamese: "Ký ?c", category: "Tu duy", example: "??? ?? - Nh? ra r?i" },
  { id: "b14", korean: "??", vietnamese: "L?n d?u tiên", category: "Th?i gian", example: "?? ??? - G?p l?n d?u" },
  { id: "b15", korean: "??", vietnamese: "C?m giác", category: "C?m xúc", example: "??? ??? - C?m giác t?t" },
  { id: "b16", korean: "???", vietnamese: "Gi?ng nói", category: "Giao ti?p", example: "???? ??? - Gi?ng d?p" },
  { id: "b17", korean: "??", vietnamese: "Tên", category: "Giao ti?p", example: "??? ???? - Tên là gì?" },
  { id: "b18", korean: "??", vietnamese: "N? cu?i", category: "C?m xúc", example: "??? ??? - N? cu?i d?p" },
  { id: "b19", korean: "?", vietnamese: "Ðêm", category: "Th?i gian", example: "?? ??? - Ðêm khuya r?i" },
  { id: "b20", korean: "??", vietnamese: "Chúng ta", category: "Ð?i t?", example: "?? ?? ?? - Chúng ta cùng di" },
  { id: "b21", korean: "??", vietnamese: "H?nh phúc", category: "C?m xúc", example: "???? - H?nh phúc l?m" },
  { id: "b22", korean: "??", vietnamese: "N? cu?i/m?m cu?i", category: "C?m xúc", example: "??? ??? - M?m cu?i" },
  { id: "b23", korean: "??", vietnamese: "Bài hát / hát", category: "Âm nh?c", example: "??? ??? - Hát bài hát" },
  { id: "b24", korean: "?", vietnamese: "Ði?u nh?y", category: "Âm nh?c", example: "?? ?? - Nh?y múa" },
  { id: "b25", korean: "??", vietnamese: "Âm nh?c", category: "Âm nh?c", example: "??? ??? - Thích âm nh?c" },
  { id: "b26", korean: "??", vietnamese: "Ng?c / trái tim", category: "Co th?", example: "??? ??? - Tim d?p r?n" },
  { id: "b27", korean: "?", vietnamese: "Hoi th?", category: "Co th?", example: "?? ??? - Ngh?t th?" },
  { id: "b28", korean: "?", vietnamese: "Tôi / Mình", category: "Ð?i t?", example: "?? ????? - Tôi là h?c sinh" },
  { id: "b29", korean: "?", vietnamese: "B?n / C?u", category: "Ð?i t?", example: "?? ??? - Tôi thích c?u" },
  { id: "b30", korean: "??", vietnamese: "M?t mình", category: "Tr?ng thái", example: "?? ??? - ? m?t mình" },
];

// --- Match engine --------------------------------------------------------------
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

// --- Main Page -----------------------------------------------------------------
const CATEGORIES = ["T?t c?", "C?m xúc", "Thiên nhiên", "Giao ti?p", "Th?i gian", "Ð?i t?", "Co th?", "Âm nh?c"];

export default function EpsMelonPage() {
  const navigate = useNavigate();
  const [selectedSong, setSelectedSong] = useState<MelonSong | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("T?t c?");
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

    const filtered = categoryFilter === "T?t c?"
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
            <p className="text-app-text-muted text-[10px] hidden sm:block">H?c t? v?ng EPS-TOPIK qua l?i bài hát K-pop</p>
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-app-accent-success/70">
          <i className="ri-checkbox-circle-line" />
          <span className="hidden sm:inline">{learnedCount}/{totalVocab} dã h?c</span>
          <span className="sm:hidden">{learnedCount}/{totalVocab}</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">

        {/* Hero banner */}
        <div className="relative rounded-2xl overflow-hidden mb-6 h-32">
          <img
            src="https://readdy.ai/api/search-image?query=Korean%20language%20study%20EPS-TOPIK%20exam%20textbook%20vocabulary%20flashcards%20with%20K-pop%20music%20notes%20flying%20around%20colorful%20vibrant%20educational%20background%20warm%20tones&width=960&height=256&seq=eps-melon-hero-001&orientation=landscape"
            alt="EPS Melon"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-6">
            <h1 className="text-white text-xl font-bold mb-1">EPS × K-pop Learning</h1>
            <p className="text-white/60 text-xs max-w-md leading-relaxed">
              T? v?ng EPS-TOPIK xu?t hi?n trong l?i bài hát — h?c v?a th?c t?, v?a vui!
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: "ri-book-2-line", color: "text-app-accent-success", val: totalVocab, label: "T?ng t? EPS" },
            { icon: "ri-music-2-line", color: "text-app-accent-primary", val: songMatches.length, label: "Bài có t? EPS" },
            { icon: "ri-checkbox-circle-line", color: "text-green-400", val: learnedCount, label: "Ðã h?c" },
            {
              icon: "ri-percent-line",
              color: "text-orange-400",
              val: totalVocab > 0 ? `${Math.round((learnedCount / totalVocab) * 100)}%` : "0%",
              label: "Ti?n d?",
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
                  <p className="text-sm font-medium truncate">T?t c? t? EPS</p>
                  <p className="text-[10px] text-app-text-muted">{epsWords.length} t?</p>
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
                <p className="text-app-accent-success/80 text-xs font-semibold">Cách h?c hi?u qu?</p>
              </div>
              <ol className="text-app-text-secondary text-[10px] leading-relaxed space-y-1 list-decimal list-inside">
                <li>Ch?n bài hát yêu thích</li>
                <li>Xem t? EPS xu?t hi?n trong l?i</li>
                <li>Nh?n th? d? xem nghia & ví d?</li>
                <li>Nh?n ? khi dã nh?</li>
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
                  <p className="text-app-text-muted text-[10px]">t? EPS</p>
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
                  placeholder="Tìm t? v?ng..."
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
                <p className="text-app-text-secondary text-sm">Không tìm th?y t? v?ng nào</p>
                <p className="text-app-text-muted text-xs mt-1">
                  {selectedSong
                    ? "Bài hát này chua có t? EPS phù h?p"
                    : "Th? thay d?i b? l?c"}
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
                          <p className="text-app-text-muted text-xs italic">Nh?n d? xem nghia</p>
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
                            <p className="text-app-text-muted text-[10px] mb-1 tracking-wide">Trong l?i bài hát</p>
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
                            <><i className="ri-close-line mr-1" />B? dánh d?u</>
                          ) : (
                            <><i className="ri-checkbox-circle-line mr-1" />Ðã h?c r?i!</>
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
                  <span className="text-white/50 text-xs">Ti?n d? h?c EPS qua K-pop</span>
                  <span className="text-app-accent-success text-xs font-bold">
                    {learnedCount}/{totalVocab} t?
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
                    ?? B?n dã h?c du?c {learnedCount} t? EPS t? K-pop. Ti?p t?c phát huy!
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

