import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShareFlashcardModal from "./ShareFlashcardModal";
import { mockMelonSongs } from "@/mocks/melonSongs";
import { MelonLessonResult } from "@/services/aiService";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMelonSync } from "@/hooks/useMelonSync";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useVipYearGuard, addCsvWatermark } from "@/hooks/useVipYearGuard";
import { useKpopFlashcard, KpopFlashcard } from "@/hooks/useKpopFlashcard";
import VipUpgradeModal from "@/components/feature/VipUpgradeModal";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalysisCard {
  id: string;
  word: string;
  meaning: string;
  example: string;
  songTitle: string;
  songRank: number;
  songId: string;
  source: "analysis";
}

interface SavedCard {
  id: string;
  word: string;
  meaning: string;
  example: string;
  songTitle: string;
  artist: string;
  addedAt: string;
  source: "saved";
}

type FlashCard = AnalysisCard | SavedCard;

// ─── Load cards from AI analysis (LEARNED_KEY) ───────────────────────────────
const LEARNED_KEY = "melon_learned_ranks";
const LOCAL_MASTERED_KEY = "melon_fc_mastered";

function loadAnalysisCards(): AnalysisCard[] {
  try {
    const raw = localStorage.getItem(LEARNED_KEY);
    const ranks: number[] = raw ? JSON.parse(raw) : [];
    const cards: AnalysisCard[] = [];
    ranks.forEach((rank) => {
      const song = mockMelonSongs.find((s) => s.rank === rank);
      if (!song) return;
      const analysisRaw = localStorage.getItem(`melon_analysis_${rank}`);
      if (!analysisRaw) return;
      try {
        const analysis = JSON.parse(analysisRaw) as MelonLessonResult;
        analysis.vocabulary.forEach((v, i) => {
          cards.push({
            id: `analysis-${rank}-${i}`,
            word: v.word,
            meaning: v.meaning,
            example: v.example,
            songTitle: song.title,
            songRank: rank,
            songId: `melon-${rank}`,
            source: "analysis",
          });
        });
      } catch { /* ignore */ }
    });
    return cards;
  } catch { return []; }
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportToCSV(cards: FlashCard[]) {
  const headers = ["Từ", "Nghĩa", "Ví dụ", "Bài hát", "Nguồn"];
  const rows = cards.map((c) => [
    `"${c.word.replace(/"/g, '""')}"`,
    `"${c.meaning.replace(/"/g, '""')}"`,
    `"${c.example.replace(/"/g, '""')}"`,
    `"${c.songTitle.replace(/"/g, '""')}"`,
    `"${c.source === "analysis" ? "Phân tích AI" : "Lưu thủ công"}"`,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `melon-flashcard-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToAnkiTSV(cards: FlashCard[]) {
  const rows = cards.map((c) => `${c.word}\t${c.meaning}\t${c.example}\t${c.songTitle}`);
  const blob = new Blob([rows.join("\n")], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `melon-anki-${new Date().toISOString().split("T")[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

type FilterMode = "all" | "unmastered";
type SourceFilter = "all" | "analysis" | "saved";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MelonFlashcardPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { isVipYear, isVipMonth, checkAndRun, modalOpen, modalReason, closeModal } = useVipYearGuard();
  const { saveMelonFlashcardProgress, loadMelonFlashcardProgress } = useMelonSync();
  const { cards: savedCards, removeCard } = useKpopFlashcard();

  // Merge both sources
  const analysisCards = useMemo(() => loadAnalysisCards(), []);
  const allCards: FlashCard[] = useMemo(() => {
    const saved: SavedCard[] = savedCards.map((c: KpopFlashcard) => ({
      id: `saved-${c.id}`,
      word: c.word,
      meaning: c.meaning,
      example: c.example,
      songTitle: c.songTitle,
      artist: c.artist,
      addedAt: c.addedAt,
      source: "saved" as const,
    }));
    // Deduplicate: if same word+songTitle exists in both, keep analysis version
    const analysisKeys = new Set(analysisCards.map(c => `${c.word}::${c.songTitle}`));
    const uniqueSaved = saved.filter(c => !analysisKeys.has(`${c.word}::${c.songTitle}`));
    return [...analysisCards, ...uniqueSaved];
  }, [analysisCards, savedCards]);

  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_MASTERED_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  });

  const [cloudSyncDone, setCloudSyncDone] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const [studyMode, setStudyMode] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"flashcard" | "list">("flashcard");

  /* ── Load progress from Supabase on mount ─────────────────────────────────── */
  useEffect(() => {
    if (!user || !isSupabaseConfigured || cloudSyncDone) return;
    let mounted = true;
    const sync = async () => {
      const progressMap = await loadMelonFlashcardProgress(user.id);
      if (!mounted || progressMap.size === 0) { setCloudSyncDone(true); return; }
      const merged = new Set<string>();
      allCards.forEach((card) => {
        const key = `${card.source === "analysis" ? (card as AnalysisCard).songId : "saved"}::${card.word}`;
        if (progressMap.get(key) === true) merged.add(card.id);
      });
      if (mounted) {
        setMasteredIds(merged);
        localStorage.setItem(LOCAL_MASTERED_KEY, JSON.stringify([...merged]));
        setCloudSyncDone(true);
      }
    };
    sync();
    return () => { mounted = false; };
  }, [user, cloudSyncDone, allCards, loadMelonFlashcardProgress]);

  const saveMastered = useCallback((ids: Set<string>) => {
    localStorage.setItem(LOCAL_MASTERED_KEY, JSON.stringify([...ids]));
    if (user && isSupabaseConfigured) {
      const entries = allCards.map((c) => ({
        song_id: c.source === "analysis" ? (c as AnalysisCard).songId : "saved",
        word: c.word,
        is_known: ids.has(c.id),
      }));
      saveMelonFlashcardProgress(user.id, entries);
    }
  }, [user, allCards, saveMelonFlashcardProgress]);

  const filteredCards = useMemo(() => {
    let result = allCards;
    if (sourceFilter !== "all") result = result.filter(c => c.source === sourceFilter);
    if (filter === "unmastered") result = result.filter(c => !masteredIds.has(c.id));
    return result;
  }, [allCards, filter, sourceFilter, masteredIds]);

  const card = filteredCards[currentIdx];
  const masteredCount = masteredIds.size;
  const progress = filteredCards.length > 0 ? Math.round((currentIdx / filteredCards.length) * 100) : 0;

  const markMastered = () => {
    const updated = new Set(masteredIds);
    updated.add(card.id);
    setMasteredIds(updated);
    saveMastered(updated);
    goNext();
  };

  const markAgain = () => goNext();

  const goNext = () => {
    setFlipped(false);
    if (currentIdx + 1 >= filteredCards.length) setFinished(true);
    else setCurrentIdx((i) => i + 1);
  };

  const handleRestart = () => { setCurrentIdx(0); setFlipped(false); setFinished(false); };
  const resetMastered = () => { setMasteredIds(new Set()); saveMastered(new Set()); handleRestart(); };

  const savedCount = allCards.filter(c => c.source === "saved").length;
  const analysisCount = allCards.filter(c => c.source === "analysis").length;

  if (allCards.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col">
        <header className="h-14 flex items-center px-4 gap-3 border-b border-white/8">
          <button onClick={() => navigate("/melon")} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/60 hover:text-white cursor-pointer">
            <i className="ri-arrow-left-line" />
          </button>
          <p className="text-white font-bold text-sm">Flashcard K-pop</p>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-2xl mb-4">
            <i className="ri-stack-line text-white/20 text-2xl" />
          </div>
          <p className="text-white/40 text-sm font-medium mb-1">Chưa có từ vựng nào</p>
          <p className="text-white/20 text-xs mb-5">Phân tích AI bài hát Melon hoặc nhấn nút<br />"Lưu" trong tab Từ vựng để tạo flashcard</p>
          <button onClick={() => navigate("/melon")} className="bg-[#e8c84a] hover:bg-[#e8c84a]/80 text-[#0f1117] text-sm font-bold px-6 py-2.5 rounded-xl cursor-pointer whitespace-nowrap">
            Đến Melon Chart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      <VipUpgradeModal open={modalOpen} onClose={closeModal} reason={modalReason ?? "not_vip_year"} featureName="Xuất Flashcard K-pop" />
      {showShareModal && (
        <ShareFlashcardModal
          cards={allCards.map(c => ({ word: c.word, meaning: c.meaning, example: c.example, songTitle: c.songTitle }))}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0f1117]/95 backdrop-blur-md border-b border-white/8 h-14 flex items-center px-4 md:px-6 gap-3 flex-shrink-0">
        <button onClick={() => navigate("/melon")} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/60 hover:text-white cursor-pointer flex-shrink-0">
          <i className="ri-arrow-left-line" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">Flashcard K-pop</p>
          <p className="text-white/30 text-xs flex items-center gap-1.5 flex-wrap">
            <span>{allCards.length} từ</span>
            <span className="text-white/15">·</span>
            <span className="text-[#e8c84a]/70">{analysisCount} AI</span>
            <span className="text-white/15">·</span>
            <span className="text-emerald-400/70">{savedCount} đã lưu</span>
            <span className="text-white/15">·</span>
            <span>{masteredCount} thuộc</span>
            {user && isSupabaseConfigured && (
              <span className="text-[#00C73C] text-[10px] flex items-center gap-0.5">
                <i className="ri-cloud-line" /> Sync
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => (isVipYear || isVipMonth) ? setShowExportMenu(v => !v) : checkAndRun(() => {})}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors border ${
                isVipYear || isVipMonth
                  ? "text-emerald-400/70 hover:text-emerald-400 bg-emerald-500/8 hover:bg-emerald-500/15 border-emerald-500/15"
                  : "text-white/30 bg-white/5 border-white/10"
              }`}
            >
              <i className={isVipYear || isVipMonth ? "ri-download-2-line" : "ri-lock-line"} />
              <span className="hidden sm:inline">{isVipYear ? "Xuất file" : isVipMonth ? "Xuất (50)" : "VIP"}</span>
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-[#1a1d27] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                <button
                  onClick={() => {
                    if (isVipYear) { exportToCSV(allCards); }
                    else if (isVipMonth) {
                      const limited = allCards.slice(0, 50);
                      const headers = ["Từ", "Nghĩa", "Ví dụ", "Bài hát"];
                      const rows = limited.map(c => [`"${c.word}"`, `"${c.meaning}"`, `"${c.example}"`, `"${c.songTitle}"`]);
                      let csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
                      csv = addCsvWatermark(csv, 50);
                      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a"); a.href = url; a.download = "melon-50tu.csv"; a.click();
                      URL.revokeObjectURL(url);
                    }
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors text-left"
                >
                  <div className="w-7 h-7 flex items-center justify-center bg-emerald-500/15 rounded-lg">
                    <i className="ri-file-excel-2-line text-emerald-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-semibold">Xuất CSV (Excel)</p>
                    <p className="text-white/30 text-[10px]">{isVipYear ? "Toàn bộ" : "50 từ (VIP Tháng)"}</p>
                  </div>
                </button>
                <button
                  onClick={() => { if (isVipYear) { exportToAnkiTSV(allCards); } else { checkAndRun(() => {}); } setShowExportMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors text-left"
                >
                  <div className="w-7 h-7 flex items-center justify-center bg-sky-500/15 rounded-lg">
                    <i className="ri-file-text-line text-sky-400 text-sm" />
                  </div>
                  <div>
                    <p className="text-white/80 text-xs font-semibold">Xuất Anki (.txt)</p>
                    <p className="text-white/30 text-[10px]">{isVipYear ? "Toàn bộ" : "Chỉ VIP Năm"}</p>
                  </div>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors border border-white/8"
          >
            <i className="ri-share-line" />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>
          {!studyMode && (
            <button onClick={resetMastered} className="text-xs text-white/30 hover:text-white/60 cursor-pointer whitespace-nowrap hidden sm:block">
              Đặt lại
            </button>
          )}
        </div>
      </header>

      {!studyMode ? (
        <div className="max-w-lg mx-auto w-full px-4 py-5 flex flex-col gap-4">
          {/* Tab: Flashcard / Danh sách */}
          <div className="flex bg-white/5 rounded-xl p-1">
            <button onClick={() => setActiveTab("flashcard")} className={`flex-1 py-2 text-sm rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === "flashcard" ? "bg-[#e8c84a] text-[#0f1117] font-semibold" : "text-white/40"}`}>
              <i className="ri-stack-line mr-1.5" />Ôn tập
            </button>
            <button onClick={() => setActiveTab("list")} className={`flex-1 py-2 text-sm rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === "list" ? "bg-[#e8c84a] text-[#0f1117] font-semibold" : "text-white/40"}`}>
              <i className="ri-list-check mr-1.5" />Danh sách ({allCards.length})
            </button>
          </div>

          {activeTab === "flashcard" ? (
            <>
              {/* Progress ring */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-5 text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <circle cx="48" cy="48" r="40" fill="none" stroke="#e8c84a" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - masteredCount / allCards.length)}`}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-white font-bold text-xl">{masteredCount}</p>
                    <p className="text-white/30 text-[10px]">/ {allCards.length}</p>
                  </div>
                </div>
                <p className="text-white/70 text-sm font-medium">Đã thuộc</p>
                <p className="text-white/30 text-xs mt-0.5">{allCards.length - masteredCount} từ chưa thuộc</p>
              </div>

              {/* Source filter */}
              <div className="flex bg-white/5 rounded-xl p-1">
                {([["all", "Tất cả"], ["analysis", "Phân tích AI"], ["saved", "Đã lưu"]] as [SourceFilter, string][]).map(([val, label]) => (
                  <button key={val} onClick={() => setSourceFilter(val)}
                    className={`flex-1 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${sourceFilter === val ? "bg-white/15 text-white font-semibold" : "text-white/35"}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Mastered filter */}
              <div className="flex bg-white/5 rounded-xl p-1">
                <button onClick={() => setFilter("all")} className={`flex-1 py-2 text-sm rounded-lg transition-all cursor-pointer whitespace-nowrap ${filter === "all" ? "bg-[#e8c84a] text-[#0f1117] font-semibold" : "text-white/40"}`}>
                  Tất cả ({allCards.length})
                </button>
                <button onClick={() => setFilter("unmastered")} className={`flex-1 py-2 text-sm rounded-lg transition-all cursor-pointer whitespace-nowrap ${filter === "unmastered" ? "bg-[#e8c84a] text-[#0f1117] font-semibold" : "text-white/40"}`}>
                  Chưa thuộc ({allCards.length - masteredCount})
                </button>
              </div>

              {/* Song breakdown */}
              {analysisCount > 0 && (
                <div className="bg-white/3 border border-white/5 rounded-2xl p-4">
                  <p className="text-white/40 text-xs tracking-normal mb-3">Từ theo bài hát (AI)</p>
                  <div className="space-y-2">
                    {Array.from(new Set(analysisCards.map(c => c.songRank))).map((rank) => {
                      const songCards = analysisCards.filter(c => c.songRank === rank);
                      const song = mockMelonSongs.find(s => s.rank === rank);
                      const done = songCards.filter(c => masteredIds.has(c.id)).length;
                      return (
                        <div key={rank} className="flex items-center gap-3">
                          <img src={song?.albumArt} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white/70 text-xs truncate">{song?.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
                                <div className="h-full bg-[#e8c84a] rounded-full transition-all" style={{ width: `${(done / songCards.length) * 100}%` }} />
                              </div>
                              <span className="text-[10px] text-white/30 whitespace-nowrap">{done}/{songCards.length}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => { setCurrentIdx(0); setFlipped(false); setFinished(false); setStudyMode(true); }}
                disabled={filteredCards.length === 0}
                className={`w-full py-4 rounded-2xl text-sm font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  filteredCards.length === 0 ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-[#e8c84a] hover:bg-[#e8c84a]/80 text-[#0f1117]"
                }`}
              >
                <i className="ri-play-circle-line mr-2" />
                {filter === "unmastered" && filteredCards.length === 0 ? "Đã thuộc hết! 🎉" : `Học ${filteredCards.length} thẻ`}
              </button>
            </>
          ) : (
            /* List view */
            <div className="space-y-2">
              {allCards.map((c) => (
                <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${masteredIds.has(c.id) ? "border-emerald-500/15 bg-emerald-500/5" : "border-white/5 bg-white/2"}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[#e8c84a] font-bold text-sm">{c.word}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${c.source === "analysis" ? "bg-[#e8c84a]/15 text-[#e8c84a]/70" : "bg-emerald-500/15 text-emerald-400/70"}`}>
                        {c.source === "analysis" ? "AI" : "Lưu"}
                      </span>
                      {masteredIds.has(c.id) && <span className="text-[9px] text-emerald-400/70">✓ Thuộc</span>}
                    </div>
                    <p className="text-white/50 text-xs truncate">{c.meaning}</p>
                    <p className="text-white/25 text-[10px] truncate">{c.songTitle}</p>
                  </div>
                  {c.source === "saved" && (
                    <button
                      onClick={() => removeCard(c.id.replace("saved-", ""))}
                      className="w-7 h-7 flex items-center justify-center text-white/20 hover:text-red-400 cursor-pointer flex-shrink-0 transition-colors"
                    >
                      <i className="ri-delete-bin-line text-sm" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : finished ? (
        /* Finish screen */
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-md mx-auto w-full">
          <div className="w-20 h-20 flex items-center justify-center bg-[#e8c84a]/10 rounded-3xl mb-5">
            <span className="text-4xl">🎉</span>
          </div>
          <p className="text-white font-bold text-2xl mb-1">Xong rồi!</p>
          <p className="text-white/50 text-sm mb-6">
            Bạn đã học qua <span className="text-white font-bold">{filteredCards.length}</span> thẻ trong buổi này
          </p>
          <div className="flex gap-3 w-full">
            <button onClick={handleRestart} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium rounded-xl cursor-pointer whitespace-nowrap">
              <i className="ri-restart-line mr-1.5" />Học lại
            </button>
            <button onClick={() => setStudyMode(false)} className="flex-1 py-3 bg-[#e8c84a] hover:bg-[#e8c84a]/80 text-[#0f1117] text-sm font-bold rounded-xl cursor-pointer whitespace-nowrap">
              Xem thống kê
            </button>
          </div>
        </div>
      ) : (
        /* Study mode */
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full px-4 py-4">
          <div className="flex items-center gap-3 mb-4 flex-shrink-0">
            <button onClick={() => setStudyMode(false)} className="w-7 h-7 flex items-center justify-center text-white/30 hover:text-white cursor-pointer flex-shrink-0">
              <i className="ri-close-line" />
            </button>
            <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full bg-[#e8c84a] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-white/30 text-xs whitespace-nowrap flex-shrink-0">{currentIdx}/{filteredCards.length}</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-3 flex-shrink-0">
            <i className="ri-music-2-line text-white/20 text-xs" />
            <p className="text-white/25 text-xs truncate">{card?.songTitle}</p>
            {card?.source === "saved" && <span className="text-[9px] bg-emerald-500/15 text-emerald-400/70 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">Lưu</span>}
          </div>

          {/* Flashcard */}
          <div className="flex-1 flex items-center justify-center cursor-pointer mb-5" onClick={() => setFlipped(!flipped)}>
            <div
              className="w-full rounded-3xl border p-8 text-center transition-all duration-300 min-h-64 flex flex-col items-center justify-center"
              style={{
                background: flipped ? "linear-gradient(135deg, rgba(232,200,74,0.08), rgba(232,200,74,0.03))" : "rgba(255,255,255,0.03)",
                borderColor: flipped ? "rgba(232,200,74,0.2)" : "rgba(255,255,255,0.06)",
              }}
            >
              {!flipped ? (
                <>
                  <p className="text-[#e8c84a] text-3xl font-bold mb-3">{card?.word}</p>
                  <p className="text-white/20 text-xs">Nhấn để xem nghĩa</p>
                </>
              ) : (
                <>
                  <p className="text-[#e8c84a] text-xl font-bold mb-2">{card?.word}</p>
                  <p className="text-white/85 text-lg font-medium mb-3">{card?.meaning}</p>
                  <div className="w-8 h-px bg-white/15 mb-3" />
                  <p className="text-white/40 text-sm italic leading-relaxed">{card?.example}</p>
                </>
              )}
            </div>
          </div>

          {!flipped ? (
            <button onClick={() => setFlipped(true)} className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white/60 text-sm font-medium rounded-2xl cursor-pointer transition-colors whitespace-nowrap flex-shrink-0">
              Xem nghĩa <i className="ri-arrow-down-s-line ml-1" />
            </button>
          ) : (
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={markAgain} className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 border border-white/8 text-white/50 text-sm font-medium rounded-2xl cursor-pointer transition-colors whitespace-nowrap">
                <i className="ri-refresh-line mr-1.5" />Học lại
              </button>
              <button onClick={markMastered} className="flex-1 py-3.5 bg-[#e8c84a] hover:bg-[#e8c84a]/80 text-[#0f1117] text-sm font-bold rounded-2xl cursor-pointer transition-colors whitespace-nowrap">
                <i className="ri-checkbox-circle-line mr-1.5" />Đã thuộc!
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
