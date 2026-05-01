import { useState, useCallback, useEffect } from "react";
import { MelonSong } from "@/mocks/melonSongs";
import { generateMelonLesson, MelonLessonResult, AIConfig } from "@/services/aiService";
import LyricsQuizModal from "./LyricsQuizModal";
import ShareLessonModal from "./ShareLessonModal";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMelonSync } from "@/hooks/useMelonSync";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useKpopFlashcard } from "@/hooks/useKpopFlashcard";

interface SongAnalysisModalProps {
  song: MelonSong;
  onClose: () => void;
  /** Called when user opens analysis (to mark song as learned) */
  onMarkLearned?: (rank: number) => void;
}

const AI_CONFIG_KEY = "melon_ai_config";
const LEARNED_KEY = "melon_learned_ranks";

function loadConfig(): AIConfig | null {
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    return raw ? (JSON.parse(raw) as AIConfig) : null;
  } catch {
    return null;
  }
}

type Tab = "story" | "vocab" | "grammar";

export default function SongAnalysisModal({ song, onClose, onMarkLearned }: SongAnalysisModalProps) {
  const { user } = useAuthContext();
  const { saveMelonStudy } = useMelonSync();
  const { addCard, hasCard } = useKpopFlashcard();
  const [tab, setTab] = useState<Tab>("story");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MelonLessonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const handleSaveVocab = useCallback((word: string, meaning: string, example: string) => {
    addCard({ word, meaning, example, songTitle: song.title, artist: song.artist });
    setSavedWords(prev => new Set([...prev, word]));
    setSaveToast(`Đã lưu "${word}" vào flashcard!`);
    setTimeout(() => setSaveToast(null), 2000);
  }, [addCard, song.title, song.artist]);

  // API key state
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"openai" | "gemini" | "openrouter">("gemini");

  const cacheKey = `melon_analysis_${song.rank}`;

  useEffect(() => {
    // Load cached result
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as MelonLessonResult;
        setResult(parsed);
        markLearned();
      } catch { /* ignore */ }
    }
    // Pre-fill API config
    const cfg = loadConfig();
    if (cfg) {
      setProvider(cfg.provider as "openai" | "gemini" | "openrouter");
      setApiKey(cfg.apiKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const markLearned = useCallback(() => {
    try {
      const raw = localStorage.getItem(LEARNED_KEY);
      const ranks: number[] = raw ? JSON.parse(raw) : [];
      if (!ranks.includes(song.rank)) {
        ranks.push(song.rank);
        localStorage.setItem(LEARNED_KEY, JSON.stringify(ranks));
      }
    } catch { /* ignore */ }
    onMarkLearned?.(song.rank);
  }, [song.rank, onMarkLearned]);

  const handleAnalyze = useCallback(async () => {
    const cfg = loadConfig();
    const activeKey = cfg?.apiKey || apiKey.trim();
    const activeProvider = cfg?.provider || provider;

    if (!activeKey) {
      setShowKeyInput(true);
      return;
    }

    const config: AIConfig = { provider: activeProvider, apiKey: activeKey };
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));

    setLoading(true);
    setError(null);
    try {
      const res = await generateMelonLesson(config, song.title, song.artist, song.lyrics);
      setResult(res);
      localStorage.setItem(cacheKey, JSON.stringify(res));
      markLearned();
      setShowKeyInput(false);
      // Sync to Supabase
      if (user && isSupabaseConfigured) {
        saveMelonStudy(user.id, {
          song_id: `melon-${song.rank}`,
          song_title: song.title,
          artist: song.artist,
          cover_url: song.albumArt,
          genre: song.genre,
          ai_analysis: res as unknown as Record<string, unknown>,
          vocabulary: res.vocabulary,
          studied_at: new Date().toISOString(),
        });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  }, [song, apiKey, provider, cacheKey, markLearned]);

  const handleSaveKey = () => {
    if (!apiKey.trim()) return;
    const config: AIConfig = { provider, apiKey: apiKey.trim() };
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
    handleAnalyze();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

        {/* Panel */}
        <div className="relative w-full sm:max-w-lg bg-[#0f1117] sm:rounded-2xl rounded-t-2xl border border-white/8 flex flex-col max-h-[90vh] overflow-hidden">
          {/* Save toast */}
          {saveToast && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-4 py-2 rounded-full whitespace-nowrap shadow-lg">
              <i className="ri-bookmark-fill" />
              {saveToast}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/8 flex-shrink-0">
            <img
              src={song.albumArt}
              alt={song.title}
              className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">{song.title}</p>
              <p className="text-white/40 text-xs">{song.artist} · #{song.rank}</p>
            </div>
            {result && (
              <>
                <button
                  onClick={() => setShowShare(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white cursor-pointer flex-shrink-0 transition-colors"
                  title="Chia sẻ bài học"
                >
                  <i className="ri-share-line text-sm" />
                </button>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="flex items-center gap-1.5 bg-[#e8c84a]/10 hover:bg-[#e8c84a]/20 text-[#e8c84a] text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors flex-shrink-0"
                >
                  <i className="ri-lightbulb-flash-line" />
                  Quiz
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/50 hover:text-white cursor-pointer flex-shrink-0"
            >
              <i className="ri-close-line text-base" />
            </button>
          </div>

          {/* API Key Input */}
          {showKeyInput && !result && (
            <div className="px-5 py-4 border-b border-white/8 flex-shrink-0 bg-[#e8c84a]/5">
              <p className="text-white/60 text-xs mb-3">
                <i className="ri-key-2-line text-[#e8c84a] mr-1" />
                Nhập API Key để phân tích AI (chỉ cần nhập 1 lần, tự động lưu)
              </p>
              <div className="flex gap-1.5 mb-2">
                {(["gemini", "openai", "openrouter"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`flex-1 text-xs py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                      provider === p
                        ? "border-[#e8c84a] bg-[#e8c84a]/10 text-[#e8c84a]"
                        : "border-white/10 text-white/30 hover:border-white/20"
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
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/80 text-xs placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/40"
                  onKeyDown={(e) => e.key === "Enter" && handleSaveKey()}
                />
                <button
                  onClick={handleSaveKey}
                  className="bg-[#e8c84a] hover:bg-[#e8c84a]/80 text-[#0f1117] text-xs font-semibold px-4 rounded-lg cursor-pointer whitespace-nowrap"
                >
                  Lưu &amp; Phân tích
                </button>
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="w-16 h-16 flex items-center justify-center bg-[#e8c84a]/10 rounded-2xl mb-4">
                  <i className="ri-sparkling-2-line text-[#e8c84a] text-2xl" />
                </div>
                <p className="text-white/70 text-sm font-medium mb-1">Phân tích AI lời bài hát</p>
                <p className="text-white/30 text-xs mb-6 leading-relaxed">
                  AI sẽ trích xuất từ vựng tiếng Hàn, phân tích ngữ pháp<br />
                  và tạo Truyện Chêm học tiếng Hàn từ bài hát này
                </p>
                <button
                  onClick={handleAnalyze}
                  className="bg-[#e8c84a] hover:bg-[#e8c84a]/80 text-[#0f1117] text-sm font-bold px-8 py-3 rounded-xl cursor-pointer whitespace-nowrap transition-colors"
                >
                  <i className="ri-sparkling-2-line mr-2" />
                  Phân tích ngay
                </button>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="w-12 h-12 flex items-center justify-center mb-4">
                  <i className="ri-loader-4-line text-[#e8c84a] text-3xl animate-spin" />
                </div>
                <p className="text-white/60 text-sm">AI đang phân tích lời bài hát...</p>
                <p className="text-white/25 text-xs mt-1">Thường mất 5–15 giây</p>
              </div>
            )}

            {error && (
              <div className="mx-5 my-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <p className="text-red-400 text-xs flex items-start gap-2">
                  <i className="ri-error-warning-line mt-0.5 flex-shrink-0" />
                  {error}
                </p>
                <button
                  onClick={handleAnalyze}
                  className="mt-3 text-xs text-white/50 hover:text-white cursor-pointer underline"
                >
                  Thử lại
                </button>
              </div>
            )}

            {result && !loading && (
              <div>
                {/* Tab switcher */}
                <div className="flex gap-1 bg-white/5 p-1 mx-5 my-4 rounded-xl">
                  {(["story", "vocab", "grammar"] as Tab[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 text-xs py-2 px-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        tab === t
                          ? "bg-[#e8c84a] text-[#0f1117] font-semibold"
                          : "text-white/40 hover:text-white/60"
                      }`}
                    >
                      {t === "story" ? "Truyện Chêm" : t === "vocab" ? "Từ vựng" : "Ngữ pháp"}
                    </button>
                  ))}
                </div>

                {tab === "story" && (
                  <div className="px-5 pb-6">
                    <div className="bg-white/3 rounded-2xl p-4 border border-white/5">
                      <p className="text-white/75 text-sm leading-8 whitespace-pre-line">{result.story}</p>
                    </div>
                  </div>
                )}

                {tab === "vocab" && (
                  <div className="px-5 pb-6 space-y-2.5">
                    {result.vocabulary.map((v, i) => {
                      const isSaved = savedWords.has(v.word) || hasCard(v.word, song.title);
                      return (
                        <div key={i} className="bg-white/3 rounded-xl p-4 border border-white/5">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-[#e8c84a] text-sm font-semibold mb-0.5">{v.word}</p>
                              <p className="text-white/60 text-xs mb-1">{v.meaning}</p>
                              <p className="text-white/35 text-xs italic leading-relaxed">{v.example}</p>
                            </div>
                            <button
                              onClick={() => !isSaved && handleSaveVocab(v.word, v.meaning, v.example)}
                              className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                isSaved
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                  : "bg-[#e8c84a]/10 hover:bg-[#e8c84a]/20 text-[#e8c84a] border border-[#e8c84a]/20"
                              }`}
                            >
                              <i className={isSaved ? "ri-bookmark-fill" : "ri-bookmark-line"} />
                              {isSaved ? "Đã lưu" : "Lưu"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-white/20 text-[10px] text-center pt-1">
                      <i className="ri-information-line mr-1"></i>
                      Từ đã lưu sẽ xuất hiện trong Flashcard K-pop của bạn
                    </p>
                  </div>
                )}

                {tab === "grammar" && (
                  <div className="px-5 pb-6">
                    <div className="bg-white/3 rounded-2xl p-4 border border-white/5">
                      <p className="text-white/70 text-sm leading-8 whitespace-pre-line">{result.explanation}</p>
                    </div>
                  </div>
                )}

                {/* Quiz CTA */}
                <div className="px-5 pb-5 space-y-2">
                  <button
                    onClick={() => setShowQuiz(true)}
                    className="w-full flex items-center justify-center gap-2 bg-[#e8c84a]/10 hover:bg-[#e8c84a]/20 border border-[#e8c84a]/20 text-[#e8c84a] text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer"
                  >
                    <i className="ri-lightbulb-flash-line" />
                    Kiểm tra kiến thức — 5 câu Quiz
                  </button>
                  <button
                    onClick={handleAnalyze}
                    className="w-full flex items-center justify-center gap-2 text-xs text-white/25 hover:text-[#e8c84a] border border-white/5 hover:border-[#e8c84a]/15 rounded-xl py-2.5 transition-all cursor-pointer"
                  >
                    <i className="ri-refresh-line" />
                    Tạo lại bài học mới
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showQuiz && result && (
        <LyricsQuizModal song={song} result={result} onClose={() => setShowQuiz(false)} />
      )}
      {showShare && result && (
        <ShareLessonModal song={song} result={result} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}
