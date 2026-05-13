import { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockMelonSongs, MelonSong } from "@/mocks/melonSongs";
import { generateMelonLesson, MelonLessonResult, AIConfig } from "@/services/aiService";
import LyricsQuizModal from "@/pages/melon/components/LyricsQuizModal";
import { useMelonSongs } from "@/hooks/useMelonSongs";

const AI_CONFIG_KEY = "melon_ai_config";
const LEARNED_KEY = "melon_learned_ranks";
const PLAYLIST_KEY = "melon_playlist_ranks";

function loadConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    return raw ? (JSON.parse(raw) as AIConfig) : null;
  } catch { return null; }
}

type Tab = "lyrics" | "story" | "vocab" | "grammar";

// ─── Related Songs ────────────────────────────────────────────────────────────────
interface RelatedSongsProps {
  song: MelonSong;
  allSongs: MelonSong[];
  onNavigate: (rank: number) => void;
}

function RelatedSongs({ song, allSongs, onNavigate }: RelatedSongsProps) {
  const related = useMemo(() => {
    const genre = song.genre.split("/")[0].trim().toLowerCase();
    const sameArtist = allSongs.filter(
      (s) => s.rank !== song.rank && s.artist === song.artist
    );
    const sameGenre = allSongs.filter(
      (s) =>
        s.rank !== song.rank &&
        s.artist !== song.artist &&
        s.genre.toLowerCase().includes(genre)
    );
    return [...sameArtist, ...sameGenre].slice(0, 6);
  }, [song, allSongs]);

  const learnedRanks = useMemo(() => {
    try {
      const raw = localStorage.getItem(LEARNED_KEY);
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch { return []; }
  }, []);

  if (related.length === 0) return null;

  return (
    <div className="mt-10 pb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 flex items-center justify-center">
          <i className="ri-music-2-line text-[#00C73C] text-sm" />
        </div>
        <h2 className="text-white/70 text-sm font-semibold tracking-normal">Bài hát liên quan</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {related.map((s) => {
          const learned = learnedRanks.includes(s.rank);
          const isSameArtist = s.artist === song.artist;
          return (
            <button
              key={s.rank}
              onClick={() => onNavigate(s.rank)}
              className="group text-left bg-app-surface/50 hover:bg-white/6 border border-app-border hover:border-app-border rounded-2xl overflow-hidden transition-all cursor-pointer"
            >
              <div className="relative w-full aspect-square">
                <img
                  src={s.albumArt}
                  alt={s.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-2 left-2">
                  {isSameArtist ? (
                    <span className="text-[9px] bg-app-accent-primary text-app-bg font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      Cùng nghệ sĩ
                    </span>
                  ) : (
                    <span className="text-[9px] bg-[#00C73C]/80 text-white font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      Cùng thể loại
                    </span>
                  )}
                </div>
                {learned && (
                  <div className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center bg-green-500/80 rounded-full">
                    <i className="ri-checkbox-circle-fill text-white text-xs" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-xs font-semibold truncate leading-tight">{s.title}</p>
                </div>
              </div>
              <div className="px-2.5 py-2">
                <p className="text-app-text-secondary text-[10px] truncate">{s.artist}</p>
                <p className="text-[#00C73C] text-[10px] font-bold">#{s.rank}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MelonDetailPage() {
  const { rank } = useParams<{ rank: string }>();
  const navigate = useNavigate();
  const rankNum = parseInt(rank ?? "0", 10);
  // Load from Supabase → localStorage → mock (same priority as main melon page)
  const { songs } = useMelonSongs();
  const song: MelonSong | undefined = songs.find((s) => s.rank === rankNum);

  const [tab, setTab] = useState<Tab>("lyrics");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MelonLessonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"openai" | "gemini" | "openrouter">("gemini");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isInPlaylist, setIsInPlaylist] = useState(false);

  const cacheKey = `melon_analysis_${rankNum}`;

  useEffect(() => {
    if (!song) return;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { setResult(JSON.parse(cached) as MelonLessonResult); } catch { /* ignore */ }
    }
    const cfg = loadConfig();
    if (cfg) {
      setProvider(cfg.provider as "openai" | "gemini" | "openrouter");
      setApiKey(cfg.apiKey);
    }
    try {
      const pl = localStorage.getItem(PLAYLIST_KEY);
      const ranks: number[] = pl ? JSON.parse(pl) : [];
      setIsInPlaylist(ranks.includes(rankNum));
    } catch { /* ignore */ }
    try {
      const raw = localStorage.getItem(LEARNED_KEY);
      const ranks: number[] = raw ? JSON.parse(raw) : [];
      if (!ranks.includes(rankNum)) {
        ranks.push(rankNum);
        localStorage.setItem(LEARNED_KEY, JSON.stringify(ranks));
      }
    } catch { /* ignore */ }
  }, [rankNum, cacheKey, song]);

  const togglePlaylist = useCallback(() => {
    try {
      const raw = localStorage.getItem(PLAYLIST_KEY);
      const ranks: number[] = raw ? JSON.parse(raw) : [];
      const updated = ranks.includes(rankNum)
        ? ranks.filter((r) => r !== rankNum)
        : [...ranks, rankNum];
      localStorage.setItem(PLAYLIST_KEY, JSON.stringify(updated));
      setIsInPlaylist(updated.includes(rankNum));
    } catch { /* ignore */ }
  }, [rankNum]);

  const handleAnalyze = useCallback(async () => {
    const cfg = loadConfig();
    const activeKey = cfg?.apiKey || apiKey.trim();
    const activeProvider = cfg?.provider || provider;
    if (!activeKey) { setShowKeyInput(true); return; }
    const config: AIConfig = { provider: activeProvider, apiKey: activeKey };
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
    setLoading(true);
    setError(null);
    try {
      const res = await generateMelonLesson(config, song!.title, song!.artist, song!.lyrics);
      setResult(res);
      localStorage.setItem(cacheKey, JSON.stringify(res));
      setTab("story");
      setShowKeyInput(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, [song, apiKey, provider, cacheKey]);

  const handleSaveKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify({ provider, apiKey: apiKey.trim() }));
    handleAnalyze();
  };

  if (!song) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center text-center px-6">
        <i className="ri-music-2-line text-app-text-muted text-5xl mb-4" />
        <p className="text-white/50 text-base">Không tìm thấy bài hát</p>
        <button onClick={() => navigate("/melon")} className="mt-4 text-app-accent-primary text-sm cursor-pointer">
          ← Quay lại Melon Chart
        </button>
      </div>
    );
  }

  // Tabs unlock if: AI result exists OR song has pre-processed data
  const hasPreVocab = (song?.vocabulary?.length ?? 0) > 0;
  const hasPreGrammar = (song?.grammar?.length ?? 0) > 0;
  const hasPreStory = Boolean(song?.translation?.full);

  const TABS: { key: Tab; label: string; icon: string; disabled?: boolean; preloaded?: boolean }[] = [
    { key: "lyrics", label: "Lời bài hát", icon: "ri-music-line" },
    { key: "story", label: "Truyện Chêm", icon: "ri-book-open-line", disabled: !result && !hasPreStory, preloaded: hasPreStory },
    { key: "vocab", label: "Từ vựng", icon: "ri-translate-2", disabled: !result && !hasPreVocab, preloaded: hasPreVocab },
    { key: "grammar", label: "Ngữ pháp", icon: "ri-graduation-cap-line", disabled: !result && !hasPreGrammar, preloaded: hasPreGrammar },
  ];

  return (
    <div className="min-h-screen bg-app-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-app-bg/95 backdrop-blur-md border-b border-app-border h-14 flex items-center px-4 gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-white/60 hover:text-white cursor-pointer flex-shrink-0"
        >
          <i className="ri-arrow-left-line" />
        </button>
        <button
          onClick={() => navigate("/melon")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00C73C]/10 hover:bg-[#00C73C]/20 text-[#00C73C] text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors flex-shrink-0"
        >
          <i className="ri-music-2-line text-sm" />
          Melon Chart
        </button>
        <p className="flex-1 text-white font-semibold text-sm truncate">{song.title}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary hover:text-white/70 cursor-pointer flex-shrink-0 transition-colors"
          title="Trang chủ"
        >
          <i className="ri-home-4-line" />
        </button>
        <button
          onClick={togglePlaylist}
          className={`w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors flex-shrink-0 ${
            isInPlaylist ? "bg-red-500/15 text-red-400" : "bg-app-card/50 text-app-text-secondary hover:text-white/70"
          }`}
        >
          <i className={isInPlaylist ? "ri-heart-3-fill" : "ri-heart-3-line"} />
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8">
        {/* Song hero */}
        <div className="flex flex-col sm:flex-row gap-5 mb-8">
          <div className="w-full sm:w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0">
            <img src={song.albumArt} alt={song.title} className="w-full h-full object-cover object-top" />
          </div>
          <div className="flex flex-col justify-end">
            <span className="inline-flex items-center gap-1.5 text-[#00C73C] text-xs font-medium bg-[#00C73C]/10 px-3 py-1 rounded-full w-fit mb-3">
              <i className="ri-bar-chart-2-line" />
              #{song.rank} · {song.genre}
            </span>
            <h1 className="text-white text-2xl lg:text-3xl font-bold mb-1">{song.title}</h1>
            <p className="text-white/50 text-base mb-4">{song.artist}</p>
            <div className="flex flex-wrap gap-2">
              {!result && !loading && (
                <button
                  onClick={handleAnalyze}
                  className="flex items-center gap-2 bg-app-accent-primary hover:bg-app-accent-primary/80 text-app-bg text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
                >
                  <i className="ri-sparkling-2-line" />
                  Phân tích AI
                </button>
              )}
              {loading && (
                <div className="flex items-center gap-2 bg-app-card/50 text-white/50 text-sm px-5 py-2.5 rounded-xl">
                  <i className="ri-loader-4-line animate-spin" />
                  Đang phân tích...
                </div>
              )}
              {result && !loading && (
                <>
                  <span className="flex items-center gap-1.5 text-green-400 text-xs bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-lg">
                    <i className="ri-checkbox-circle-line" />
                    Đã phân tích
                  </span>
                  <button
                    onClick={() => setShowQuiz(true)}
                    className="flex items-center gap-2 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 border border-app-accent-primary/20 text-app-accent-primary text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
                  >
                    <i className="ri-lightbulb-flash-line" />
                    Làm Quiz (5 câu)
                  </button>
                  <button
                    onClick={handleAnalyze}
                    className="flex items-center gap-2 text-app-text-muted hover:text-white/60 text-xs px-3 py-2 rounded-xl border border-app-border hover:border-white/15 cursor-pointer whitespace-nowrap transition-colors"
                  >
                    <i className="ri-refresh-line" />
                    Tạo lại
                  </button>
                </>
              )}
            </div>
            {error && (
              <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* API Key input */}
        {showKeyInput && !result && (
          <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-2xl p-5 mb-6">
            <p className="text-white/60 text-sm mb-3">
              <i className="ri-key-2-line text-app-accent-primary mr-1.5" />
              Nhập API Key để phân tích AI (chỉ cần nhập 1 lần)
            </p>
            <div className="flex gap-2 mb-3">
              {(["gemini", "openai", "openrouter"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`flex-1 text-xs py-2 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    provider === p
                      ? "border-app-accent-primary bg-app-accent-primary/10 text-app-accent-primary"
                      : "border-app-border text-app-text-muted hover:border-white/20"
                  }`}
                >
                  {p === "gemini" ? "Gemini" : p === "openai" ? "OpenAI" : "OpenRouter"}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`API Key cho ${provider}...`}
                className="flex-1 bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40"
                onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
              />
              <button
                onClick={handleSaveKey}
                className="bg-app-accent-primary hover:bg-app-accent-primary/80 text-app-bg text-sm font-bold px-5 rounded-xl cursor-pointer whitespace-nowrap"
              >
                Lưu &amp; Phân tích
              </button>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 bg-app-card/50 p-1 rounded-xl mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => !t.disabled && setTab(t.key)}
              disabled={t.disabled}
              className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${
                t.disabled
                  ? "text-app-text-muted cursor-not-allowed"
                  : tab === t.key
                  ? "bg-app-card/70 text-white font-semibold"
                  : "text-app-text-secondary hover:text-white/70 cursor-pointer"
              }`}
            >
              <i className={`${t.icon} text-sm`} />
              {t.label}
              {t.disabled && <i className="ri-lock-line text-xs" />}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          <div className={tab === "lyrics" ? "block" : "hidden lg:block"}>
            <div className="bg-app-surface/50 rounded-2xl border border-app-border p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-music-line text-[#00C73C] text-sm" />
                </div>
                <span className="text-white/60 text-xs font-medium tracking-normal">Lời bài hát (Tiếng Hàn)</span>
              </div>
              <pre className="text-white/75 text-sm leading-9 font-sans whitespace-pre-wrap">{song.lyrics}</pre>
            </div>
          </div>

          <div className={tab !== "lyrics" ? "block" : "hidden lg:block"}>
            {loading && (
              <div className="bg-app-surface/50 rounded-2xl border border-app-border p-10 flex flex-col items-center justify-center text-center">
                <i className="ri-loader-4-line text-app-accent-primary text-3xl animate-spin mb-3" />
                <p className="text-white/50 text-sm">AI đang phân tích...</p>
              </div>
            )}
            {!result && !loading && !hasPreVocab && !hasPreGrammar && !hasPreStory && (
              <div className="bg-app-surface/50 rounded-2xl border border-app-border p-10 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 flex items-center justify-center bg-app-accent-primary/8 rounded-2xl mb-4">
                  <i className="ri-sparkling-2-line text-app-accent-primary/40 text-2xl" />
                </div>
                <p className="text-app-text-muted text-sm">Nhấn &ldquo;Phân tích AI&rdquo; để xem nội dung học tiếng Hàn</p>
              </div>
            )}
            {/* Pre-processed data from admin upload */}
            {!result && !loading && (hasPreVocab || hasPreGrammar || hasPreStory) && (
              <div>
                {/* Sub-tab switcher on mobile */}
                <div className="flex gap-1 bg-app-card/50 p-1 rounded-xl mb-4 lg:hidden">
                  {(["story", "vocab", "grammar"] as Tab[]).filter(t =>
                    (t === "story" && hasPreStory) || (t === "vocab" && hasPreVocab) || (t === "grammar" && hasPreGrammar)
                  ).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 text-xs py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        tab === t ? "bg-app-accent-primary text-app-bg font-semibold" : "text-app-text-secondary hover:text-white/60"
                      }`}
                    >
                      {t === "story" ? "Bản dịch" : t === "vocab" ? "Từ vựng" : "Ngữ pháp"}
                    </button>
                  ))}
                </div>
                <div className="hidden lg:space-y-4 lg:block">
                  {hasPreStory && (
                    <div className="bg-app-surface/50 rounded-2xl border border-app-border p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <i className="ri-book-open-line text-app-accent-primary text-sm" />
                        <span className="text-white/60 text-xs font-medium">Bản dịch viết</span>
                        <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full">Admin</span>
                      </div>
                      <p className="text-white/75 text-sm leading-8 whitespace-pre-line">{song.translation?.full}</p>
                    </div>
                  )}
                  {hasPreVocab && (
                    <div className="bg-app-surface/50 rounded-2xl border border-app-border p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <i className="ri-translate-2 text-app-accent-primary text-sm" />
                        <span className="text-white/60 text-xs font-medium">Từ vựng ({song.vocabulary!.length} từ)</span>
                        <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full">Admin</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {song.vocabulary!.map((v, i) => (
                          <div key={i} className="bg-app-surface/50 rounded-xl p-3 border border-app-border">
                            <p className="text-app-accent-primary text-sm font-semibold mb-0.5">{v.korean}</p>
                            <p className="text-white/55 text-xs">{v.vietnamese}</p>
                            {v.romaji && <p className="text-white/30 text-[10px] italic">{v.romaji}</p>}
                            {v.topikLevel && <span className="text-[9px] bg-app-accent-primary/10 text-app-accent-primary px-1.5 py-0.5 rounded-full">TOPIK {v.topikLevel}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {hasPreGrammar && (
                    <div className="bg-app-surface/50 rounded-2xl border border-app-border p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <i className="ri-graduation-cap-line text-app-accent-primary text-sm" />
                        <span className="text-white/60 text-xs font-medium">Ngữ pháp ({song.grammar!.length} mẫu)</span>
                        <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded-full">Admin</span>
                      </div>
                      <div className="space-y-3">
                        {song.grammar!.map((g, i) => (
                          <div key={i} className="border-l-2 border-app-accent-primary/40 pl-3">
                            <p className="text-app-accent-primary text-sm font-semibold">{g.pattern}</p>
                            <p className="text-white/60 text-xs mb-1">{g.meaning}</p>
                            {g.examples[0] && (
                              <p className="text-white/40 text-xs italic">VD: {g.examples[0].sentence} — {g.examples[0].translation}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Mobile */}
                <div className="lg:hidden">
                  {tab === "story" && hasPreStory && (
                    <div className="bg-app-surface/50 rounded-2xl p-5 border border-app-border">
                      <p className="text-white/75 text-sm leading-8 whitespace-pre-line">{song.translation?.full}</p>
                    </div>
                  )}
                  {tab === "vocab" && hasPreVocab && (
                    <div className="space-y-2.5">
                      {song.vocabulary!.map((v, i) => (
                        <div key={i} className="bg-app-surface/50 rounded-xl p-4 border border-app-border">
                          <p className="text-app-accent-primary text-sm font-semibold mb-0.5">{v.korean}</p>
                          <p className="text-white/60 text-xs mb-1">{v.vietnamese}</p>
                          {v.romaji && <p className="text-white/35 text-xs italic">{v.romaji}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  {tab === "grammar" && hasPreGrammar && (
                    <div className="space-y-3">
                      {song.grammar!.map((g, i) => (
                        <div key={i} className="bg-app-surface/50 rounded-xl p-4 border border-app-border border-l-2 border-l-app-accent-primary/40">
                          <p className="text-app-accent-primary text-sm font-semibold">{g.pattern}</p>
                          <p className="text-white/60 text-xs">{g.meaning}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {result && !loading && (
              <div>
                <div className="flex gap-1 bg-app-card/50 p-1 rounded-xl mb-4 lg:hidden">
                  {(["story", "vocab", "grammar"] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 text-xs py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        tab === t ? "bg-app-accent-primary text-app-bg font-semibold" : "text-app-text-secondary hover:text-white/60"
                      }`}
                    >
                      {t === "story" ? "Truyện Chêm" : t === "vocab" ? "Từ vựng" : "Ngữ pháp"}
                    </button>
                  ))}
                </div>

                {/* Desktop: all stacked */}
                <div className="hidden lg:space-y-4 lg:block">
                  <div className="bg-app-surface/50 rounded-2xl border border-app-border p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <i className="ri-book-open-line text-app-accent-primary text-sm" />
                      <span className="text-white/60 text-xs font-medium tracking-normal">Truyện Chêm</span>
                    </div>
                    <p className="text-white/75 text-sm leading-8 whitespace-pre-line">{result.story}</p>
                  </div>
                  <div className="bg-app-surface/50 rounded-2xl border border-app-border p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <i className="ri-translate-2 text-app-accent-primary text-sm" />
                      <span className="text-white/60 text-xs font-medium tracking-normal">Từ vựng</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {result.vocabulary.map((v, i) => (
                        <div key={i} className="bg-app-surface/50 rounded-xl p-3 border border-app-border">
                          <p className="text-app-accent-primary text-sm font-semibold mb-0.5">{v.word}</p>
                          <p className="text-white/55 text-xs">{v.meaning}</p>
                          <p className="text-app-text-muted text-xs italic mt-0.5 leading-relaxed">{v.example}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-app-surface/50 rounded-2xl border border-app-border p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <i className="ri-graduation-cap-line text-app-accent-primary text-sm" />
                      <span className="text-white/60 text-xs font-medium tracking-normal">Phân tích ngữ pháp</span>
                    </div>
                    <p className="text-white/70 text-sm leading-8 whitespace-pre-line">{result.explanation}</p>
                  </div>
                </div>

                {/* Mobile tab-based */}
                <div className="lg:hidden">
                  {tab === "story" && (
                    <div className="bg-app-surface/50 rounded-2xl p-5 border border-app-border">
                      <p className="text-white/75 text-sm leading-8 whitespace-pre-line">{result.story}</p>
                    </div>
                  )}
                  {tab === "vocab" && (
                    <div className="space-y-2.5">
                      {result.vocabulary.map((v, i) => (
                        <div key={i} className="bg-app-surface/50 rounded-xl p-4 border border-app-border">
                          <p className="text-app-accent-primary text-sm font-semibold mb-0.5">{v.word}</p>
                          <p className="text-white/60 text-xs mb-1">{v.meaning}</p>
                          <p className="text-white/35 text-xs italic leading-relaxed">{v.example}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {tab === "grammar" && (
                    <div className="bg-app-surface/50 rounded-2xl p-5 border border-app-border">
                      <p className="text-white/70 text-sm leading-8 whitespace-pre-line">{result.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Songs */}
        <RelatedSongs song={song} allSongs={songs} onNavigate={(r) => navigate(`/melon/${r}`)} />
      </div>

      {showQuiz && result && (
        <LyricsQuizModal song={song} result={result} onClose={() => setShowQuiz(false)} />
      )}
    </div>
  );
}
