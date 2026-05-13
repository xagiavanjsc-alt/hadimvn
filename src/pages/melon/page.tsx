import { useState, useMemo, useCallback, lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "@/components/feature/MobileHeader";
import MobileNav from "@/components/feature/MobileNav";
import { mockMelonSongs, MelonSong } from "@/mocks/melonSongs";
import { useVirtualScroll } from "@/hooks/useVirtualScroll";
import StreakProtectionBanner from "./components/StreakProtectionBanner";
import { useMelonStreak } from "@/hooks/useMelonStreak";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import AdminDataPanel from "./components/AdminDataPanel";

const SongAnalysisModal = lazy(() => import("./components/SongAnalysisModal"));
const PlaylistTab = lazy(() => import("./components/PlaylistTab"));

const SONG_ITEM_HEIGHT = 76; // px per song row (p-3 + content)
const CHART_CONTAINER_HEIGHT = 600; // visible area height

// ─── Virtual Song List ────────────────────────────────────────────────────────
function VirtualSongList({
  songs, search, isInPlaylist, isLearned, onNavigate, onAnalysis, onTogglePlaylist,
}: {
  songs: MelonSong[];
  search: string;
  isInPlaylist: (rank: number) => boolean;
  isLearned: (rank: number) => boolean;
  onNavigate: (rank: number) => void;
  onAnalysis: (song: MelonSong) => void;
  onTogglePlaylist: (song: MelonSong) => void;
}) {
  const { containerRef, totalHeight, startIndex, endIndex, offsetY } = useVirtualScroll({
    itemCount: songs.length,
    itemHeight: SONG_ITEM_HEIGHT,
    containerHeight: CHART_CONTAINER_HEIGHT,
    overscan: 8,
  });

  if (songs.length === 0) {
    return (
      <div className="flex flex-col items-center py-14 text-center">
        <div className="w-12 h-12 flex items-center justify-center bg-app-card/50 rounded-xl mb-3">
          <i className="ri-search-line text-app-text-muted text-xl" />
        </div>
        <p className="text-app-text-secondary text-sm">Không tìm thấy bài hát</p>
        <p className="text-app-text-muted text-xs mt-1">&ldquo;{search}&rdquo;</p>
      </div>
    );
  }

  const visibleSongs = songs.slice(startIndex, endIndex + 1);

  return (
    <div
      ref={containerRef}
      style={{ height: `${CHART_CONTAINER_HEIGHT}px`, overflowY: "auto" }}
      className="relative"
    >
      {/* Total height spacer */}
      <div style={{ height: `${totalHeight}px`, position: "relative" }}>
        {/* Rendered items offset */}
        <div style={{ position: "absolute", top: `${offsetY}px`, left: 0, right: 0 }}>
          <div className="space-y-2.5">
            {visibleSongs.map((song) => {
              const saved = isInPlaylist(song.rank);
              const learned = isLearned(song.rank);
              return (
                <div
                  key={song.rank}
                  style={{ height: `${SONG_ITEM_HEIGHT}px` }}
                  className="flex items-center bg-app-surface/50 rounded-xl px-2 sm:px-3 border border-app-border gap-1.5 sm:gap-3 hover:bg-app-card/50 transition-colors"
                >
                  <span className="text-[11px] sm:text-sm font-bold text-[#00C73C] w-4 sm:w-6 text-center flex-shrink-0">
                    {song.rank}
                  </span>
                  <button
                    onClick={() => onNavigate(song.rank)}
                    className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 cursor-pointer"
                  >
                    <img
                      src={song.albumArt}
                      alt={song.title}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </button>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onNavigate(song.rank)}
                  >
                    <div className="flex items-center gap-1 flex-wrap">
                      <p className="text-white/85 text-xs sm:text-sm font-semibold truncate">{song.title}</p>
                      {learned && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] text-green-400 bg-green-500/10 px-1 sm:px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                          <i className="ri-checkbox-circle-fill" />
                          <span className="hidden sm:inline">Đã học</span>
                        </span>
                      )}
                    </div>
                    <p className="text-white/35 text-[10px] sm:text-xs truncate">{song.artist}</p>
                    <p className="text-app-text-muted text-[9px] sm:text-[10px] truncate hidden sm:block">{song.genre}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => onAnalysis(song)}
                      className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg bg-app-accent-primary/10 hover:bg-app-accent-primary/20 text-app-accent-primary transition-colors cursor-pointer"
                      title="Phân tích nhanh"
                    >
                      <i className="ri-sparkling-2-line text-xs" />
                    </button>
                    <button
                      onClick={() => onTogglePlaylist(song)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                        saved
                          ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                          : "bg-app-card/50 text-app-text-muted hover:text-white/60 hover:bg-app-card/70"
                      }`}
                      title={saved ? "Xóa khỏi playlist" : "Thêm vào playlist"}
                    >
                      <i className={saved ? "ri-heart-3-fill text-xs" : "ri-heart-3-line text-xs"} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const PLAYLIST_KEY = "melon_playlist_ranks";

function loadPlaylistRanks(): number[] {
  try {
    const raw = localStorage.getItem(PLAYLIST_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function savePlaylistRanks(ranks: number[]): void {
  localStorage.setItem(PLAYLIST_KEY, JSON.stringify(ranks));
}

const MelonPage = () => {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const { streak, learnedRanks, learnedToday, markLearned, refreshLearnedRanks, isLearned } =
    useMelonStreak();

  const [activeTab, setActiveTab] = useState<"chart" | "playlist">("chart");
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [analysisTarget, setAnalysisTarget] = useState<MelonSong | null>(null);
  const [playlistRanks, setPlaylistRanks] = useState<number[]>(loadPlaylistRanks);
  const [streakBannerDismissed, setStreakBannerDismissed] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Load songs from localStorage (same as admin panel)
  const [songs, setSongs] = useState<MelonSong[]>([]);
  
  useEffect(() => {
    try {
      const raw = localStorage.getItem("kts_melon_songs");
      if (raw) {
        const data = JSON.parse(raw) as MelonSong[];
        setSongs(data);
      } else {
        // Fallback to mock data if no data in localStorage
        setSongs(mockMelonSongs);
      }
    } catch (e) {
      console.error("Failed to load songs:", e);
      setSongs(mockMelonSongs);
    }
  }, []);

  const togglePlaylist = useCallback((song: MelonSong) => {
    setPlaylistRanks((prev) => {
      const next = prev.includes(song.rank)
        ? prev.filter((r) => r !== song.rank)
        : [...prev, song.rank];
      savePlaylistRanks(next);
      return next;
    });
  }, []);

  const removeFromPlaylist = useCallback((rank: number) => {
    setPlaylistRanks((prev) => {
      const next = prev.filter((r) => r !== rank);
      savePlaylistRanks(next);
      return next;
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    setAnalysisTarget(null);
    refreshLearnedRanks();
  }, [refreshLearnedRanks]);

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    songs.forEach(s => {
      s.genre.split("/").forEach(g => genres.add(g.trim()));
    });
    return Array.from(genres).sort();
  }, [songs]);

  const filteredSongs = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = songs;
    if (q) {
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.genre.toLowerCase().includes(q)
      );
    }
    if (genreFilter !== "all") {
      list = list.filter(s => s.genre.toLowerCase().includes(genreFilter.toLowerCase()));
    }
    return list;
  }, [search, genreFilter, songs]);

  const playlistSongs = useMemo(
    () =>
      playlistRanks
        .map((r) => songs.find((s) => s.rank === r))
        .filter(Boolean) as MelonSong[],
    [playlistRanks, songs]
  );

  const isInPlaylist = useCallback(
    (rank: number) => playlistRanks.includes(rank),
    [playlistRanks]
  );

  // Real-time suggestions (top 5 matches)
  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.trim().toLowerCase();
    return songs
      .filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [search, songs]);

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-[#00C73C] font-bold">{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-app-bg pb-24 md:pb-8">

      {/* Desktop top bar */}
      <header className="hidden md:flex sticky top-0 z-30 bg-app-bg/95 backdrop-blur-md border-b border-app-border h-14 items-center px-6 gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-white/60 hover:text-white cursor-pointer flex-shrink-0"
        >
          <i className="ri-arrow-left-line" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center bg-[#00C73C] rounded-md">
            <i className="ri-music-2-line text-white text-sm" />
          </div>
          <span className="text-white font-bold text-sm">Melon Chart</span>
        </div>
        <p className="text-white/35 text-xs">Học tiếng Hàn qua K-pop</p>
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={() => navigate("/melon-history")}
            className="flex items-center gap-1.5 text-xs text-app-text-secondary hover:text-white/70 bg-app-card/50 hover:bg-app-card/70 px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-history-line" />
            Lịch sử
          </button>
          <button
            onClick={() => navigate("/melon-flashcard")}
            className="flex items-center gap-1.5 text-xs text-app-accent-primary/70 hover:text-app-accent-primary bg-app-accent-primary/8 hover:bg-app-accent-primary/15 px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-stack-line" />
            Flashcard
          </button>
          <button
            onClick={() => navigate("/kpop-flashcard")}
            className="flex items-center gap-1.5 text-xs text-rose-400/70 hover:text-rose-400 bg-rose-500/8 hover:bg-rose-500/15 px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-music-2-line" />
            K-pop cá nhân
          </button>
          <button
            onClick={() => navigate("/eps-melon")}
            className="flex items-center gap-1.5 text-xs text-app-accent-success/70 hover:text-app-accent-success bg-emerald-500/8 hover:bg-app-accent-success/15 px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-book-2-line" />
            EPS + K-pop
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
              style={{ backgroundColor: "rgba(232,200,74,0.12)", color: "app-accent-primary", border: "1px solid rgba(232,200,74,0.20)" }}
            >
              <i className="ri-database-2-line" />
              Dữ liệu
            </button>
          )}
        </div>
      </header>

      {/* Mobile header */}
      <MobileHeader title="Melon Chart" showBack />

      <div className="max-w-2xl mx-auto pt-16 md:pt-6 px-4">
        {/* Hero banner */}
        <div className="mb-5 rounded-2xl overflow-hidden relative h-28 bg-gradient-to-br from-[#00C73C] via-[#FF6B6B] to-[#4ECDC4]">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 flex items-center justify-center bg-[#00C73C] rounded-md">
                <i className="ri-music-2-line text-white text-sm" />
              </div>
              <span className="text-white font-bold text-base">Melon Top 100</span>
            </div>
            <p className="text-white/60 text-xs">Học tiếng Hàn qua lời bài hát K-pop</p>
          </div>
        </div>

        {/* Streak Protection Banner */}
        {!streakBannerDismissed && (
          <StreakProtectionBanner
            streak={streak}
            learnedToday={learnedToday}
            onDismiss={() => setStreakBannerDismissed(true)}
          />
        )}

        {/* Melon Streak Banner */}
        {streak.count > 0 && (
          <div className="mb-4 bg-gradient-to-r from-orange-500/15 via-[app-accent-primary]/10 to-transparent border border-orange-500/20 rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="flex-shrink-0 relative">
              <span className="text-2xl">🔥</span>
              {streak.count >= 7 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-app-accent-primary rounded-full text-[8px] font-bold text-app-bg">
                  {streak.count >= 30 ? "30" : streak.count >= 14 ? "14" : "7"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-orange-300 font-bold text-sm whitespace-nowrap">
                  {streak.count} ngày liên tiếp
                </span>
                {streak.count >= 7 && (
                  <span className="text-[10px] bg-app-accent-primary/15 text-app-accent-primary px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                    {streak.count >= 30
                      ? "🏆 Huyền thoại"
                      : streak.count >= 14
                      ? "⭐ Chuyên cần"
                      : "🎯 Tuần vàng"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {streak.history.slice(-7).map((d, i) => {
                  const isToday = d === new Date().toISOString().split("T")[0];
                  return (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${
                        isToday ? "bg-app-accent-primary" : "bg-orange-500/50"
                      }`}
                    />
                  );
                })}
                {Array.from({
                  length: Math.max(0, 7 - streak.history.slice(-7).length),
                }).map((_, i) => (
                  <div key={`e-${i}`} className="h-1.5 flex-1 rounded-full bg-white/8" />
                ))}
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-app-text-muted text-[10px]">Bài hát đã học</p>
              <p className="text-white font-bold text-lg leading-none">{learnedRanks.length}</p>
            </div>
          </div>
        )}

        {/* Admin data button — mobile */}
        {isAdmin && (
          <div className="mb-3">
            <button
              onClick={() => setShowAdminPanel(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-all"
              style={{ backgroundColor: "rgba(232,200,74,0.10)", color: "app-accent-primary", border: "1px solid rgba(232,200,74,0.18)" }}
            >
              <i className="ri-database-2-line"></i>
              Quản lý dữ liệu (Admin)
              <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: "rgba(232,200,74,0.15)", color: "app-accent-primary" }}>ADMIN</span>
            </button>
          </div>
        )}

        {/* Quick nav */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => navigate("/melon-history")}
            className="flex items-center gap-1.5 text-xs text-app-text-secondary hover:text-white/70 bg-app-card/50 border border-app-border px-3 py-2 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-history-line" />
            Lịch sử học
          </button>
          <button
            onClick={() => navigate("/melon-flashcard")}
            className="flex items-center gap-1.5 text-xs text-app-accent-primary/70 bg-app-accent-primary/8 border border-app-accent-primary/15 px-3 py-2 rounded-xl cursor-pointer whitespace-nowrap transition-colors hover:bg-app-accent-primary/15"
          >
            <i className="ri-stack-line" />
            Flashcard từ vựng
          </button>
          <button
            onClick={() => navigate("/kpop-flashcard")}
            className="flex items-center gap-1.5 text-xs text-rose-400/70 bg-rose-500/8 border border-rose-500/15 px-3 py-2 rounded-xl cursor-pointer whitespace-nowrap transition-colors hover:bg-rose-500/15"
          >
            <i className="ri-music-2-line" />
            K-pop cá nhân
          </button>
          <button
            onClick={() => navigate("/eps-melon")}
            className="flex items-center gap-1.5 text-xs text-app-accent-success/70 bg-emerald-500/8 border border-emerald-500/15 px-3 py-2 rounded-xl cursor-pointer whitespace-nowrap transition-colors hover:bg-app-accent-success/15"
          >
            <i className="ri-book-2-line" />
            EPS + K-pop
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-app-card/50 rounded-full p-1 mb-4 border border-app-border">
          <button
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "chart" ? "bg-[#00C73C] text-white" : "text-app-text-secondary hover:text-white/60"
            }`}
            onClick={() => setActiveTab("chart")}
          >
            <i className="ri-bar-chart-2-line mr-1.5" />
            Chart
          </button>
          <button
            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all cursor-pointer relative whitespace-nowrap ${
              activeTab === "playlist"
                ? "bg-app-accent-primary text-app-bg"
                : "text-app-text-secondary hover:text-white/60"
            }`}
            onClick={() => setActiveTab("playlist")}
          >
            <i className="ri-heart-3-line mr-1.5" />
            Playlist
            {playlistRanks.length > 0 && (
              <span
                className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === "playlist"
                    ? "bg-app-bg/20 text-app-bg"
                    : "bg-app-accent-primary/20 text-app-accent-primary"
                }`}
              >
                {playlistRanks.length}
              </span>
            )}
          </button>
        </div>

        {/* Search bar with real-time suggestions */}
        {activeTab === "chart" && (
          <div className="relative mb-4">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none z-10">
              <i className="ri-search-line text-app-text-muted text-sm" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Tìm nhanh bài hát, nghệ sĩ..."
              className="w-full bg-app-card/50 border border-app-border rounded-xl pl-9 pr-4 py-2.5 text-white/80 text-sm placeholder-white/25 focus:outline-none focus:border-[#00C73C]/40 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-app-text-muted hover:text-white/60 cursor-pointer z-10"
              >
                <i className="ri-close-line text-sm" />
              </button>
            )}
            {/* Real-time suggestions dropdown */}
            {showSuggestions && search.trim().length >= 1 && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1d27] border border-app-border rounded-xl overflow-hidden z-50 shadow-xl">
                {suggestions.map(song => (
                  <button
                    key={song.rank}
                    onMouseDown={() => { navigate(`/melon/${song.rank}`); setSearch(""); setShowSuggestions(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/8 transition-colors cursor-pointer text-left"
                  >
                    <img src={song.albumArt} alt={song.title} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white/85 text-xs font-semibold truncate">
                        {highlightMatch(song.title, search)}
                      </p>
                      <p className="text-white/35 text-[10px] truncate">{song.artist} · #{song.rank}</p>
                    </div>
                    <i className="ri-arrow-right-up-line text-app-text-muted text-xs flex-shrink-0" />
                  </button>
                ))}
                {filteredSongs.length > suggestions.length && (
                  <div className="px-3 py-2 border-t border-app-border">
                    <p className="text-app-text-muted text-[10px] text-center">{filteredSongs.length} kết quả — cuộn xuống để xem thêm</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Genre filter */}
        {activeTab === "chart" && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setGenreFilter("all")}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer whitespace-nowrap ${
                genreFilter === "all"
                  ? "bg-[#00C73C] text-white border-[#00C73C]"
                  : "bg-app-card/50 text-app-text-secondary border-app-border hover:text-white/70"
              }`}
            >
              Tất cả ({songs.length})
            </button>
            {allGenres.map(genre => {
              const count = songs.filter(s => s.genre.toLowerCase().includes(genre.toLowerCase())).length;
              return (
                <button
                  key={genre}
                  onClick={() => setGenreFilter(genreFilter === genre ? "all" : genre)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer whitespace-nowrap ${
                    genreFilter === genre
                      ? "bg-app-accent-primary text-app-bg border-app-accent-primary font-semibold"
                      : "bg-app-card/50 text-app-text-secondary border-app-border hover:text-white/70"
                  }`}
                >
                  {genre} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* CHART TAB — Virtual Scroll */}
        {activeTab === "chart" && (
          <VirtualSongList
            songs={filteredSongs}
            search={search}
            isInPlaylist={isInPlaylist}
            isLearned={isLearned}
            onNavigate={(rank) => navigate(`/melon/${rank}`)}
            onAnalysis={setAnalysisTarget}
            onTogglePlaylist={togglePlaylist}
          />
        )}

        {/* PLAYLIST TAB */}
        {activeTab === "playlist" && (
          <Suspense fallback={<div className="flex items-center justify-center py-12 text-app-text-muted text-sm"><i className="ri-loader-4-line animate-spin mr-2"></i>Đang tải...</div>}>
            <PlaylistTab
              songs={playlistSongs}
              onOpenAnalysis={setAnalysisTarget}
              onRemove={removeFromPlaylist}
            />
          </Suspense>
        )}
      </div>

      {/* Admin Data Panel */}
      {showAdminPanel && isAdmin && (
        <AdminDataPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* AI Analysis Modal — lazy loaded */}
      {analysisTarget && (
        <Suspense fallback={null}>
          <SongAnalysisModal
            song={analysisTarget}
            onClose={handleCloseModal}
            onMarkLearned={markLearned}
          />
        </Suspense>
      )}

      <MobileNav />
    </div>
  );
};

export default MelonPage;
