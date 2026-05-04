import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useKpopFlashcard, KpopFlashcard } from "@/hooks/useKpopFlashcard";
import { mockMelonSongs } from "@/mocks/melonSongs";
import { MelonLessonResult } from "@/services/aiService";
import ShareFlashcardModal from "@/pages/melon-flashcard/ShareFlashcardModal";

// --- Types --------------------------------------------------------------------
interface AnalysisCard {
  id: string;
  word: string;
  meaning: string;
  example: string;
  songTitle: string;
  artist: string;
  songRank: number;
  albumArt: string;
  source: "analysis";
}

interface SavedCard extends KpopFlashcard {
  source: "saved";
  albumArt: string;
}

type AnyCard = AnalysisCard | SavedCard;

interface SongGroup {
  songTitle: string;
  artist: string;
  albumArt: string;
  cards: AnyCard[];
  masteredCount: number;
}

// --- Constants ----------------------------------------------------------------
const LEARNED_KEY = "melon_learned_ranks";
const LOCAL_MASTERED_KEY = "melon_fc_mastered";

// --- Helpers ------------------------------------------------------------------
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
            artist: song.artist,
            songRank: rank,
            albumArt: song.albumArt,
            source: "analysis",
          });
        });
      } catch { /* ignore */ }
    });
    return cards;
  } catch { return []; }
}

function loadMasteredIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LOCAL_MASTERED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch { return new Set(); }
}

function saveMasteredIds(ids: Set<string>) {
  localStorage.setItem(LOCAL_MASTERED_KEY, JSON.stringify([...ids]));
}

function getArtist(card: AnyCard): string {
  return card.source === "analysis" ? (card as AnalysisCard).artist : (card as SavedCard).artist;
}

function getAlbumArt(card: AnyCard): string {
  return card.source === "analysis" ? (card as AnalysisCard).albumArt : (card as SavedCard).albumArt;
}

// --- Export helpers -----------------------------------------------------------
function exportCSV(cards: AnyCard[], filename: string) {
  const rows = [["Word", "Meaning", "Example", "Song", "Artist", "Source"]];
  cards.forEach(c => {
    rows.push([c.word, c.meaning, c.example || "", c.songTitle, getArtist(c), c.source]);
  });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, "'")}"` ).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportAnki(cards: AnyCard[], filename: string) {
  const rows = cards.map(c => {
    const front = c.word;
    const back = `${c.meaning}${c.example ? `<br><i>${c.example}</i>` : ""}`;
    const tags = `kpop ${c.songTitle.replace(/\s+/g, "_")}`;
    return `${front}\t${back}\t${tags}`;
  });
  const blob = new Blob([rows.join("\n")], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// --- Card Study Modal ---------------------------------------------------------
function CardStudyModal({
  cards,
  masteredIds,
  onMastered,
  onClose,
}: {
  cards: AnyCard[];
  masteredIds: Set<string>;
  onMastered: (id: string) => void;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const [studyCards] = useState(() => cards.filter(c => !masteredIds.has(c.id)));

  const card = studyCards[idx];
  const progress = studyCards.length > 0 ? Math.round((idx / studyCards.length) * 100) : 0;

  const goNext = useCallback(() => {
    setFlipped(false);
    if (idx + 1 >= studyCards.length) setFinished(true);
    else setIdx(i => i + 1);
  }, [idx, studyCards.length]);

  if (studyCards.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm bg-[#1a1d27] border border-app-border rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">??</div>
          <p className="text-white font-bold text-lg mb-2">Ðã thu?c h?t!</p>
          <p className="text-app-text-secondary text-sm mb-6">B?n dã thu?c t?t c? t? trong bài hát này</p>
          <button onClick={onClose} className="w-full py-3 bg-app-accent-primary text-app-bg font-bold rounded-xl cursor-pointer whitespace-nowrap">Ðóng</button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm bg-[#1a1d27] border border-app-border rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">?</div>
          <p className="text-white font-bold text-lg mb-2">Xong bu?i h?c!</p>
          <p className="text-app-text-secondary text-sm mb-6">Ðã h?c qua {studyCards.length} t?</p>
          <div className="flex gap-3">
            <button onClick={() => { setIdx(0); setFlipped(false); setFinished(false); }}
              className="flex-1 py-3 bg-white/8 text-white/60 text-sm font-medium rounded-xl cursor-pointer whitespace-nowrap">H?c l?i</button>
            <button onClick={onClose}
              className="flex-1 py-3 bg-app-accent-primary text-app-bg font-bold text-sm rounded-xl cursor-pointer whitespace-nowrap">Xong</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-[#1a1d27] border border-app-border rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-app-border">
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-app-text-muted hover:text-white cursor-pointer flex-shrink-0">
            <i className="ri-close-line" />
          </button>
          <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-app-accent-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-app-text-muted text-xs whitespace-nowrap flex-shrink-0">{idx}/{studyCards.length}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-app-border">
          <i className="ri-music-2-line text-app-text-muted text-xs" />
          <p className="text-app-text-muted text-xs truncate">{card?.songTitle}</p>
        </div>
        <div className="p-5">
          <div
            className="rounded-2xl border p-6 text-center cursor-pointer min-h-48 flex flex-col items-center justify-center transition-all duration-300"
            style={{
              background: flipped ? "linear-gradient(135deg, rgba(232,200,74,0.08), rgba(232,200,74,0.03))" : "rgba(255,255,255,0.03)",
              borderColor: flipped ? "rgba(232,200,74,0.2)" : "rgba(255,255,255,0.06)",
            }}
            onClick={() => setFlipped(!flipped)}
          >
            {!flipped ? (
              <>
                <p className="text-app-accent-primary text-2xl font-bold mb-2">{card?.word}</p>
                <p className="text-app-text-muted text-xs">Nh?n d? xem nghia</p>
              </>
            ) : (
              <>
                <p className="text-app-accent-primary text-lg font-bold mb-2">{card?.word}</p>
                <p className="text-white/85 text-base font-medium mb-3">{card?.meaning}</p>
                <div className="w-8 h-px bg-white/15 mb-3" />
                <p className="text-app-text-secondary text-sm italic leading-relaxed">{card?.example}</p>
              </>
            )}
          </div>
          {!flipped ? (
            <button onClick={() => setFlipped(true)}
              className="w-full mt-4 py-3 bg-app-card/50 hover:bg-app-card/70 text-white/60 text-sm font-medium rounded-xl cursor-pointer whitespace-nowrap">
              Xem nghia <i className="ri-arrow-down-s-line ml-1" />
            </button>
          ) : (
            <div className="flex gap-3 mt-4">
              <button onClick={goNext}
                className="flex-1 py-3 bg-app-card/50 hover:bg-app-card/70 border border-app-border text-white/50 text-sm font-medium rounded-xl cursor-pointer whitespace-nowrap">
                <i className="ri-refresh-line mr-1.5" />H?c l?i
              </button>
              <button onClick={() => { onMastered(card.id); goNext(); }}
                className="flex-1 py-3 bg-app-accent-primary hover:bg-app-accent-primary/80 text-app-bg text-sm font-bold rounded-xl cursor-pointer whitespace-nowrap">
                <i className="ri-checkbox-circle-line mr-1.5" />Ðã thu?c!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Song Card ----------------------------------------------------------------
function SongCard({
  group,
  masteredIds,
  onStudy,
  isExpanded,
  onToggleExpand,
  onMarkAllMastered,
}: {
  group: SongGroup;
  masteredIds: Set<string>;
  onStudy: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onMarkAllMastered: () => void;
}) {
  const total = group.cards.length;
  const mastered = group.masteredCount;
  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
  const remaining = total - mastered;
  const [showExport, setShowExport] = useState(false);
  const [markConfirm, setMarkConfirm] = useState(false);

  const handleExportCSV = () => {
    exportCSV(group.cards, `kpop-${group.songTitle.replace(/\s+/g, "-")}.csv`);
    setShowExport(false);
  };
  const handleExportAnki = () => {
    exportAnki(group.cards, `kpop-${group.songTitle.replace(/\s+/g, "-")}.txt`);
    setShowExport(false);
  };

  return (
    <div className="bg-app-surface/50 border border-white/6 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <img src={group.albumArt} alt={group.songTitle} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white/85 text-sm font-semibold truncate">{group.songTitle}</p>
          <p className="text-white/35 text-xs truncate">{group.artist}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
              <div className="h-full bg-app-accent-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-app-text-muted whitespace-nowrap">{mastered}/{total}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Study button */}
          <button
            onClick={onStudy}
            disabled={remaining === 0}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
              remaining === 0
                ? "bg-emerald-500/10 text-app-accent-success/60 cursor-not-allowed"
                : "bg-app-accent-primary hover:bg-app-accent-primary/80 text-app-bg font-bold"
            }`}
          >
            {remaining === 0 ? <><i className="ri-checkbox-circle-line" />Xong</> : <><i className="ri-play-circle-line" />H?c ({remaining})</>}
          </button>

          {/* Mark all mastered */}
          {remaining > 0 && (
            <div className="relative">
              <button
                onClick={() => setMarkConfirm(v => !v)}
                title="Ðánh d?u t?t c? dã thu?c"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/10 text-app-accent-success/60 hover:text-app-accent-success hover:bg-emerald-500/20 cursor-pointer transition-colors"
              >
                <i className="ri-checkbox-multiple-line text-sm" />
              </button>
              {markConfirm && (
                <div className="absolute right-0 top-9 z-20 bg-[#1a1d27] border border-app-border rounded-xl p-3 shadow-xl min-w-[180px]">
                  <p className="text-white/60 text-xs mb-2">Ðánh d?u {remaining} t? còn l?i là dã thu?c?</p>
                  <div className="flex gap-2">
                    <button onClick={() => setMarkConfirm(false)} className="flex-1 py-1.5 text-xs text-app-text-secondary bg-app-card/50 rounded-lg cursor-pointer whitespace-nowrap">H?y</button>
                    <button onClick={() => { onMarkAllMastered(); setMarkConfirm(false); }}
                      className="flex-1 py-1.5 text-xs text-app-accent-success bg-app-accent-success/15 rounded-lg cursor-pointer whitespace-nowrap font-bold">Xác nh?n</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExport(v => !v)}
              title="Xu?t CSV / Anki"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-muted hover:text-white/60 hover:bg-app-card/70 cursor-pointer transition-colors"
            >
              <i className="ri-download-2-line text-sm" />
            </button>
            {showExport && (
              <div className="absolute right-0 top-9 z-20 bg-[#1a1d27] border border-app-border rounded-xl overflow-hidden shadow-xl min-w-[150px]">
                <button onClick={handleExportCSV} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/8 cursor-pointer whitespace-nowrap transition-colors">
                  <i className="ri-file-excel-line text-app-accent-success" />Xu?t CSV
                </button>
                <button onClick={handleExportAnki} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/8 cursor-pointer whitespace-nowrap transition-colors">
                  <i className="ri-stack-line text-app-accent-primary" />Xu?t Anki
                </button>
              </div>
            )}
          </div>

          {/* Expand toggle */}
          <button
            onClick={onToggleExpand}
            className="w-7 h-7 flex items-center justify-center text-app-text-muted hover:text-white/60 cursor-pointer transition-colors"
          >
            {isExpanded ? <i className="ri-arrow-up-s-line text-sm" /> : <i className="ri-arrow-down-s-line text-sm" />}
          </button>
        </div>
      </div>

      {/* Expanded word list */}
      {isExpanded && (
        <div className="border-t border-app-border px-4 pb-4 pt-3">
          <div className="space-y-2">
            {group.cards.map((card) => (
              <div key={card.id} className={`flex items-center gap-3 py-2 border-b border-white/4 last:border-0 ${masteredIds.has(card.id) ? "opacity-50" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-app-accent-primary text-sm font-bold">{card.word}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                      card.source === "analysis" ? "bg-app-accent-primary/15 text-app-accent-primary/70" : "bg-app-accent-success/15 text-app-accent-success/70"
                    }`}>
                      {card.source === "analysis" ? "AI" : "Luu"}
                    </span>
                    {masteredIds.has(card.id) && <span className="text-[9px] text-app-accent-success/60">? Thu?c</span>}
                  </div>
                  <p className="text-white/45 text-xs truncate">{card.meaning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function KpopFlashcardPage() {
  const navigate = useNavigate();
  const { cards: savedCards, removeCard } = useKpopFlashcard();
  const [masteredIds, setMasteredIds] = useState<Set<string>>(loadMasteredIds);
  const [studyGroup, setStudyGroup] = useState<SongGroup | null>(null);
  const [expandedSongs, setExpandedSongs] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"by-song" | "all-words">("by-song");
  const [sourceFilter, setSourceFilter] = useState<"all" | "analysis" | "saved">("all");
  const [showExportAll, setShowExportAll] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const analysisCards = useMemo(() => loadAnalysisCards(), []);
  const allCards: AnyCard[] = useMemo(() => {
    const saved: SavedCard[] = savedCards.map((c) => ({
      ...c,
      source: "saved" as const,
      albumArt: mockMelonSongs.find(s => s.title === c.songTitle)?.albumArt ||
        "https://readdy.ai/api/search-image?query=K-pop%20album%20cover%20colorful%20music%20Korean%20pop&width=100&height=100&seq=kpop-default-art&orientation=squarish",
    }));
    const analysisKeys = new Set(analysisCards.map(c => `${c.word}::${c.songTitle}`));
    const uniqueSaved = saved.filter(c => !analysisKeys.has(`${c.word}::${c.songTitle}`));
    return [...analysisCards, ...uniqueSaved];
  }, [analysisCards, savedCards]);

  const songGroups = useMemo((): SongGroup[] => {
    const map = new Map<string, SongGroup>();
    allCards.forEach(card => {
      const key = card.songTitle;
      if (!map.has(key)) {
        map.set(key, {
          songTitle: card.songTitle,
          artist: getArtist(card),
          albumArt: getAlbumArt(card),
          cards: [],
          masteredCount: 0,
        });
      }
      const group = map.get(key)!;
      group.cards.push(card);
      if (masteredIds.has(card.id)) group.masteredCount++;
    });
    return Array.from(map.values()).sort((a, b) => b.cards.length - a.cards.length);
  }, [allCards, masteredIds]);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return songGroups;
    const q = search.toLowerCase();
    return songGroups.filter(g =>
      g.songTitle.toLowerCase().includes(q) || g.artist.toLowerCase().includes(q)
    );
  }, [songGroups, search]);

  const filteredAllCards = useMemo(() => {
    let result = allCards;
    if (sourceFilter !== "all") result = result.filter(c => c.source === sourceFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.word.toLowerCase().includes(q) ||
        c.meaning.toLowerCase().includes(q) ||
        c.songTitle.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allCards, sourceFilter, search]);

  const handleMastered = useCallback((id: string) => {
    setMasteredIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveMasteredIds(next);
      return next;
    });
  }, []);

  const handleMarkAllMastered = useCallback((group: SongGroup) => {
    setMasteredIds(prev => {
      const next = new Set(prev);
      group.cards.forEach(c => next.add(c.id));
      saveMasteredIds(next);
      return next;
    });
    showToast(`Ðã dánh d?u ${group.cards.length} t? trong "${group.songTitle}" là dã thu?c!`);
  }, []);

  const toggleExpand = (songTitle: string) => {
    setExpandedSongs(prev => {
      const next = new Set(prev);
      if (next.has(songTitle)) next.delete(songTitle);
      else next.add(songTitle);
      return next;
    });
  };

  const totalWords = allCards.length;
  const totalMastered = masteredIds.size;
  const totalSongs = songGroups.length;
  const completedSongs = songGroups.filter(g => g.masteredCount === g.cards.length && g.cards.length > 0).length;

  if (allCards.length === 0) {
    return (
      <div className="min-h-screen bg-app-bg flex flex-col">
        <header className="h-14 flex items-center px-4 gap-3 border-b border-app-border">
          <button onClick={() => navigate("/melon")} className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-white/60 hover:text-white cursor-pointer">
            <i className="ri-arrow-left-line" />
          </button>
          <p className="text-white font-bold text-sm">B? Flashcard K-pop Cá Nhân</p>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-16 h-16 flex items-center justify-center bg-app-card/50 rounded-2xl mb-4">
            <i className="ri-music-2-line text-app-text-muted text-2xl" />
          </div>
          <p className="text-app-text-secondary text-sm font-medium mb-1">Chua có t? v?ng nào</p>
          <p className="text-app-text-muted text-xs mb-5">Phân tích AI bài hát Melon ho?c nh?n nút<br />"Luu" trong tab T? v?ng d? t?o flashcard</p>
          <button onClick={() => navigate("/melon")} className="bg-app-accent-primary hover:bg-app-accent-primary/80 text-app-bg text-sm font-bold px-6 py-2.5 rounded-xl cursor-pointer whitespace-nowrap">
            Ð?n Melon Chart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg whitespace-nowrap">
          <i className="ri-checkbox-circle-line mr-1.5" />{toast}
        </div>
      )}

      {/* Share modal */}
      {showShare && (
        <ShareFlashcardModal
          cards={allCards.map(c => ({ word: c.word, meaning: c.meaning, example: c.example, songTitle: c.songTitle }))}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Study modal */}
      {studyGroup && (
        <CardStudyModal
          cards={studyGroup.cards}
          masteredIds={masteredIds}
          onMastered={handleMastered}
          onClose={() => setStudyGroup(null)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-app-bg/95 backdrop-blur-md border-b border-app-border h-14 flex items-center px-4 md:px-6 gap-3 flex-shrink-0">
        <button onClick={() => navigate("/melon")} className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-card/50 text-white/60 hover:text-white cursor-pointer flex-shrink-0">
          <i className="ri-arrow-left-line" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">B? Flashcard K-pop Cá Nhân</p>
          <p className="text-app-text-muted text-xs">{totalSongs} bài hát · {totalWords} t? · {totalMastered} dã thu?c</p>
        </div>
        {/* Export all */}
        <div className="relative">
          <button
            onClick={() => setShowExportAll(v => !v)}
            className="flex items-center gap-1.5 text-xs text-app-text-secondary hover:text-white/70 bg-app-card/50 hover:bg-app-card/70 px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors border border-app-border"
          >
            <i className="ri-download-2-line" />
            <span className="hidden sm:inline">Xu?t t?t c?</span>
          </button>
          {showExportAll && (
            <div className="absolute right-0 top-10 z-20 bg-[#1a1d27] border border-app-border rounded-xl overflow-hidden shadow-xl min-w-[160px]">
              <button onClick={() => { exportCSV(allCards, "kpop-flashcard-all.csv"); setShowExportAll(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/8 cursor-pointer whitespace-nowrap transition-colors">
                <i className="ri-file-excel-line text-app-accent-success" />Xu?t CSV (t?t c?)
              </button>
              <button onClick={() => { exportAnki(allCards, "kpop-flashcard-all.txt"); setShowExportAll(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-white/60 hover:text-white hover:bg-white/8 cursor-pointer whitespace-nowrap transition-colors">
                <i className="ri-stack-line text-app-accent-primary" />Xu?t Anki (t?t c?)
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowShare(true)}
          className="flex items-center gap-1.5 text-xs text-app-accent-primary/70 hover:text-app-accent-primary bg-app-accent-primary/8 hover:bg-app-accent-primary/15 px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors border border-app-accent-primary/15"
        >
          <i className="ri-share-line" />
          <span className="hidden sm:inline">Chia s?</span>
        </button>
        <button
          onClick={() => navigate("/melon-flashcard")}
          className="flex items-center gap-1.5 text-xs text-app-text-secondary hover:text-white/70 bg-app-card/50 hover:bg-app-card/70 px-3 py-1.5 rounded-lg cursor-pointer whitespace-nowrap transition-colors border border-app-border"
        >
          <i className="ri-stack-line" />
          <span className="hidden sm:inline">Ôn t?p</span>
        </button>
      </header>

      <div className="max-w-2xl mx-auto w-full px-4 py-5 flex flex-col gap-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Bài hát", value: totalSongs, icon: "ri-music-2-line", color: "app-accent-primary" },
            { label: "T?ng t?", value: totalWords, icon: "ri-book-open-line", color: "#34d399" },
            { label: "Ðã thu?c", value: totalMastered, icon: "ri-checkbox-circle-line", color: "#34d399" },
            { label: "Bài xong", value: completedSongs, icon: "ri-trophy-line", color: "#fb923c" },
          ].map(s => (
            <div key={s.label} className="bg-app-surface/50 border border-app-border rounded-xl p-3 text-center">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg mx-auto mb-1.5" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-xs`} style={{ color: s.color }} />
              </div>
              <p className="font-bold text-base leading-none" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] text-app-text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Overall progress */}
        <div className="bg-app-surface/50 border border-app-border rounded-xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/50 text-xs">Ti?n d? t?ng th?</p>
            <p className="text-app-accent-primary text-xs font-bold">{totalWords > 0 ? Math.round((totalMastered / totalWords) * 100) : 0}%</p>
          </div>
          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-app-accent-primary rounded-full transition-all duration-700"
              style={{ width: `${totalWords > 0 ? (totalMastered / totalWords) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-app-card/50 rounded-xl p-1">
          <button onClick={() => setActiveTab("by-song")}
            className={`flex-1 py-2 text-sm rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === "by-song" ? "bg-app-accent-primary text-app-bg font-semibold" : "text-app-text-secondary"}`}>
            <i className="ri-music-2-line mr-1.5" />Theo bài hát
          </button>
          <button onClick={() => setActiveTab("all-words")}
            className={`flex-1 py-2 text-sm rounded-lg transition-all cursor-pointer whitespace-nowrap ${activeTab === "all-words" ? "bg-app-accent-primary text-app-bg font-semibold" : "text-app-text-secondary"}`}>
            <i className="ri-list-check mr-1.5" />T?t c? t? ({totalWords})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none">
            <i className="ri-search-line text-app-text-muted text-sm" />
          </div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={activeTab === "by-song" ? "Tìm bài hát, ngh? si..." : "Tìm t? v?ng, nghia..."}
            className="w-full bg-app-card/50 border border-app-border rounded-xl pl-9 pr-4 py-2.5 text-white/80 text-sm placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-app-text-muted hover:text-white/60 cursor-pointer">
              <i className="ri-close-line text-sm" />
            </button>
          )}
        </div>

        {/* BY SONG TAB */}
        {activeTab === "by-song" && (
          <div className="space-y-3">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-10">
                <i className="ri-search-line text-app-text-muted text-2xl mb-2" />
                <p className="text-app-text-muted text-sm">Không tìm th?y bài hát</p>
              </div>
            ) : (
              filteredGroups.map(group => (
                <SongCard
                  key={group.songTitle}
                  group={group}
                  masteredIds={masteredIds}
                  onStudy={() => setStudyGroup(group)}
                  isExpanded={expandedSongs.has(group.songTitle)}
                  onToggleExpand={() => toggleExpand(group.songTitle)}
                  onMarkAllMastered={() => handleMarkAllMastered(group)}
                />
              ))
            )}
          </div>
        )}

        {/* ALL WORDS TAB */}
        {activeTab === "all-words" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex bg-app-card/50 rounded-xl p-1 flex-1">
                {([["all", "T?t c?"], ["analysis", "Phân tích AI"], ["saved", "Ðã luu"]] as ["all" | "analysis" | "saved", string][]).map(([val, label]) => (
                  <button key={val} onClick={() => setSourceFilter(val)}
                    className={`flex-1 py-1.5 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${sourceFilter === val ? "bg-white/15 text-white font-semibold" : "text-white/35"}`}>
                    {label}
                  </button>
                ))}
              </div>
              {/* Export filtered */}
              <button onClick={() => exportCSV(filteredAllCards, "kpop-filtered.csv")}
                className="flex items-center gap-1.5 text-xs text-app-text-secondary hover:text-white/70 bg-app-card/50 px-3 py-2 rounded-xl cursor-pointer whitespace-nowrap border border-app-border transition-colors">
                <i className="ri-download-2-line" />CSV
              </button>
              <button onClick={() => exportAnki(filteredAllCards, "kpop-filtered.txt")}
                className="flex items-center gap-1.5 text-xs text-app-accent-primary/60 hover:text-app-accent-primary bg-app-accent-primary/5 px-3 py-2 rounded-xl cursor-pointer whitespace-nowrap border border-app-accent-primary/15 transition-colors">
                <i className="ri-stack-line" />Anki
              </button>
            </div>

            {filteredAllCards.length === 0 ? (
              <div className="text-center py-10">
                <i className="ri-search-line text-app-text-muted text-2xl mb-2" />
                <p className="text-app-text-muted text-sm">Không tìm th?y t? nào</p>
              </div>
            ) : (
              filteredAllCards.map(card => (
                <div key={card.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${masteredIds.has(card.id) ? "border-emerald-500/15 bg-emerald-500/5" : "border-app-border bg-white/2"}`}>
                  <img src={getAlbumArt(card)} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-app-accent-primary font-bold text-sm">{card.word}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${card.source === "analysis" ? "bg-app-accent-primary/15 text-app-accent-primary/70" : "bg-app-accent-success/15 text-app-accent-success/70"}`}>
                        {card.source === "analysis" ? "AI" : "Luu"}
                      </span>
                      {masteredIds.has(card.id) && <span className="text-[9px] text-app-accent-success/70">? Thu?c</span>}
                    </div>
                    <p className="text-white/50 text-xs truncate">{card.meaning}</p>
                    <p className="text-app-text-muted text-[10px] truncate">{card.songTitle}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!masteredIds.has(card.id) && (
                      <button onClick={() => handleMastered(card.id)}
                        className="w-7 h-7 flex items-center justify-center text-app-text-muted hover:text-app-accent-success cursor-pointer transition-colors"
                        title="Ðánh d?u dã thu?c">
                        <i className="ri-checkbox-circle-line text-sm" />
                      </button>
                    )}
                    {card.source === "saved" && (
                      <button onClick={() => removeCard(card.id)}
                        className="w-7 h-7 flex items-center justify-center text-app-text-muted hover:text-red-400 cursor-pointer transition-colors">
                        <i className="ri-delete-bin-line text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

