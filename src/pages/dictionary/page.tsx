import { useState, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";
import * as XLSX from "xlsx";
import { useVipYearGuard, addCsvWatermark } from "@/hooks/useVipYearGuard";
import VipUpgradeModal from "@/components/feature/VipUpgradeModal";

interface VocabEntry {
  word: string;
  meaning: string;
  example: string;
  songs: string[];
  artists: string[];
  count: number;
}

type SortMode = "alpha" | "freq" | "recent";

const ALPHABET = "??????????????".split("");

function getInitialConsonant(char: string): string {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return char[0]?.toUpperCase() ?? "#";
  const consonants = ["?","?","?","?","?","?","?","?","?","?","?","?","?","?","?","?","?","?","?"];
  return consonants[Math.floor(code / 588)] ?? "#";
}

export default function DictionaryPage() {
  const [approvedLessons] = useLocalStorage<ApprovedLesson[]>("kts_melon_lessons", []);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("alpha");
  const [selectedLetter, setSelectedLetter] = useState<string>("all");
  const [selectedWord, setSelectedWord] = useState<VocabEntry | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const { isVipYear, isVipMonth, checkAndRun, modalOpen, modalReason, closeModal } = useVipYearGuard();

  // Build dictionary from all lessons
  const dictionary = useMemo<VocabEntry[]>(() => {
    const map = new Map<string, VocabEntry>();
    approvedLessons.forEach((lesson) => {
      lesson.vocabulary.forEach((v) => {
        const key = v.word.trim();
        if (!key) return;
        if (map.has(key)) {
          const entry = map.get(key)!;
          entry.count += 1;
          if (!entry.songs.includes(lesson.song.title)) {
            entry.songs.push(lesson.song.title);
            entry.artists.push(lesson.song.artist);
          }
        } else {
          map.set(key, {
            word: key,
            meaning: v.meaning,
            example: v.example,
            songs: [lesson.song.title],
            artists: [lesson.song.artist],
            count: 1,
          });
        }
      });
    });
    return Array.from(map.values());
  }, [approvedLessons]);

  const filtered = useMemo(() => {
    let list = [...dictionary];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (v) =>
          v.word.toLowerCase().includes(q) ||
          v.meaning.toLowerCase().includes(q) ||
          v.example.toLowerCase().includes(q)
      );
    }
    if (selectedLetter !== "all") {
      list = list.filter((v) => getInitialConsonant(v.word) === selectedLetter);
    }
    if (sortMode === "alpha") list.sort((a, b) => a.word.localeCompare(b.word, "ko"));
    else if (sortMode === "freq") list.sort((a, b) => b.count - a.count || b.songs.length - a.songs.length);
    return list;
  }, [dictionary, search, selectedLetter, sortMode]);

  const letterCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    dictionary.forEach((v) => {
      const l = getInitialConsonant(v.word);
      counts[l] = (counts[l] ?? 0) + 1;
    });
    return counts;
  }, [dictionary]);

  const stats = useMemo(() => ({
    total: dictionary.length,
    unique: new Set(dictionary.map((v) => v.word)).size,
    multiSong: dictionary.filter((v) => v.songs.length > 1).length,
    topWords: [...dictionary].sort((a, b) => b.count - a.count).slice(0, 5),
  }), [dictionary]);

  const showExportToast = (msg: string) => {
    setExportToast(msg);
    setTimeout(() => setExportToast(null), 3500);
  };

  const buildAndDownloadCSV = (entries: typeof dictionary, filename: string, watermarkLimit?: number) => {
    const rows = entries.map((v) => ({
      "T? (Korean)": v.word,
      "Nghia (Vietnamese)": v.meaning,
      "Ví d?": v.example,
      "Bài hát": v.songs.join("; "),
      "Ngh? si": v.artists.join("; "),
      "S? l?n xu?t hi?n": v.count,
    }));
    const headers = Object.keys(rows[0]);
    let csvContent = [
      headers.join(","),
      ...rows.map((r) =>
        Object.values(r)
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    if (watermarkLimit) csvContent = addCsvWatermark(csvContent, watermarkLimit);
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (dictionary.length === 0) return;
    setShowExportMenu(false);
    checkAndRun(
      () => {
        buildAndDownloadCSV(dictionary, `KTS_Dictionary_${new Date().toISOString().split("T")[0]}.csv`);
        showExportToast(`Ðã xu?t ${dictionary.length} t? ra CSV — m? b?ng Excel ho?c Anki!`);
      },
      (limit) => {
        buildAndDownloadCSV(dictionary.slice(0, limit), `KTS_Dictionary_${limit}tu.csv`, limit);
        showExportToast(`Ðã xu?t ${limit} t? (VIP Tháng gi?i h?n). Nâng c?p VIP Nam d? xu?t toàn b?!`);
      }
    );
  };

  const handleExportExcel = () => {
    if (dictionary.length === 0) return;
    setShowExportMenu(false);
    if (!isVipYear && !isVipMonth) {
      checkAndRun(() => {});
      return;
    }
    const exportData = isVipYear ? dictionary : dictionary.slice(0, 50);
    const rows = exportData.map((v) => ({
      "T? (Korean)": v.word,
      "Nghia (Vietnamese)": v.meaning,
      "Ví d?": v.example,
      "Bài hát": v.songs.join("; "),
      "Ngh? si": v.artists.join("; "),
      "S? l?n xu?t hi?n": v.count,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 20 }, { wch: 30 }, { wch: 50 }, { wch: 40 }, { wch: 30 }, { wch: 10 },
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tu dien K-pop");
    const fileName = `KTS_Dictionary_${new Date().toISOString().split("T")[0]}.xlsx`;
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    const msg = isVipYear
      ? `Ðã xu?t ${dictionary.length} t? ra Excel!`
      : `Ðã xu?t 50 t? (VIP Tháng gi?i h?n). Nâng c?p VIP Nam d? xu?t toàn b?!`;
    showExportToast(msg);
  };

  const handleExportAnki = () => {
    if (dictionary.length === 0) return;
    setShowExportMenu(false);
    if (!isVipYear) {
      checkAndRun(() => {});
      return;
    }
    // Anki format: front TAB back (tab-separated)
    const ankiContent = dictionary
      .map((v) => {
        const front = v.word;
        const back = [
          v.meaning,
          v.example ? `<i>${v.example}</i>` : "",
          v.songs.length > 0 ? `<small>?? ${v.songs[0]}</small>` : "",
        ]
          .filter(Boolean)
          .join("<br>");
        return `${front}\t${back}`;
      })
      .join("\n");
    const blob = new Blob([ankiContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KTS_Anki_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showExportToast(`Ðã xu?t ${dictionary.length} th? Anki — import vào Anki app là dùng du?c!`);
  };

  return (
    <DashboardLayout
      title="T? di?n K-pop"
      subtitle={`${stats.total} t? v?ng t? ${approvedLessons.length} bài h?c`}
      actions={
        <div className="flex items-center gap-2">
          <span className="text-app-text-muted text-xs bg-app-card/50 px-3 py-1.5 rounded-full">
            {stats.multiSong} t? xu?t hi?n nhi?u bài
          </span>
          {dictionary.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-download-2-line"></i>
                Xu?t t? di?n
                <i className={`ri-arrow-down-s-line transition-transform ${showExportMenu ? "rotate-180" : ""}`}></i>
              </button>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 z-50 bg-[#1a1d27] border border-app-border rounded-xl overflow-hidden shadow-xl min-w-52">
                    <div className="px-3 py-2 border-b border-app-border">
                      <p className="text-app-text-muted text-[10px] tracking-normal">Ch?n d?nh d?ng xu?t</p>
                    </div>
                    <button
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-app-card/50 transition-colors cursor-pointer text-left"
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 rounded-lg flex-shrink-0">
                        <i className="ri-file-text-line text-app-accent-success text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white/80 text-xs font-medium">CSV (UTF-8)</p>
                        <p className="text-app-text-muted text-[10px]">{isVipYear ? "Toàn b?" : isVipMonth ? "50 t? (VIP Tháng)" : "C?n VIP"}</p>
                      </div>
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-app-card/50 transition-colors cursor-pointer text-left"
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-app-accent-primary/10 rounded-lg flex-shrink-0">
                        <i className="ri-file-excel-2-line text-app-accent-primary text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white/80 text-xs font-medium">Excel (.xlsx)</p>
                        <p className="text-app-text-muted text-[10px]">{isVipYear ? "Toàn b?" : isVipMonth ? "50 t? (VIP Tháng)" : "C?n VIP"}</p>
                      </div>
                    </button>
                    <button
                      onClick={handleExportAnki}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-app-card/50 transition-colors cursor-pointer text-left border-t border-app-border"
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-sky-500/10 rounded-lg flex-shrink-0">
                        <i className="ri-stack-line text-sky-400 text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white/80 text-xs font-medium">Anki Deck (.txt)</p>
                        <p className="text-app-text-muted text-[10px]">{isVipYear ? "Toàn b?" : "Ch? VIP Nam"}</p>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      }
    >
      {/* VIP Upgrade Modal */}
      <VipUpgradeModal
        open={modalOpen}
        onClose={closeModal}
        reason={modalReason ?? "not_vip_year"}
        featureName="Xu?t t? di?n K-pop"
      />

      {/* Export toast */}
      {exportToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-xl text-sm font-medium max-w-sm">
          <i className="ri-checkbox-circle-line"></i>
          {exportToast}
        </div>
      )}

      {approvedLessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-app-card/50 rounded-2xl mb-5">
            <i className="ri-book-open-line text-app-text-muted text-3xl"></i>
          </div>
          <p className="text-app-text-secondary text-sm font-medium">Chua có t? v?ng nào</p>
          <p className="text-app-text-muted text-xs mt-1 mb-5">Duy?t bài h?c trong K-pop Lesson d? tích luy t? v?ng</p>
          <a
            href="/melon"
            className="flex items-center gap-2 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 text-app-accent-primary text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-music-2-line"></i>
            Ð?n K-pop Lesson
          </a>
        </div>
      ) : (
        <div className="flex gap-5">
          {/* Left: Stats + alphabet nav */}
          <div className="w-56 flex-shrink-0 space-y-4">
            {/* Stats */}
            <div className="bg-app-bg border border-app-border rounded-xl p-4 space-y-3">
              <p className="text-app-text-muted text-[10px] tracking-normal">Th?ng kê</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">T?ng t? v?ng</span>
                  <span className="text-app-accent-primary font-bold text-sm">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">T? duy nh?t</span>
                  <span className="text-white/70 text-sm font-medium">{stats.unique}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">Xu?t hi?n &gt;1 bài</span>
                  <span className="text-app-accent-success text-sm font-medium">{stats.multiSong}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">T? bài h?c</span>
                  <span className="text-white/50 text-sm">{approvedLessons.length} bài</span>
                </div>
              </div>
            </div>

            {/* Top frequent words */}
            {stats.topWords.length > 0 && (
              <div className="bg-app-bg border border-app-border rounded-xl p-4">
                <p className="text-app-text-muted text-[10px] tracking-normal mb-3">T? ph? bi?n nh?t</p>
                <div className="space-y-2">
                  {stats.topWords.map((w, i) => (
                    <button
                      key={w.word}
                      onClick={() => setSelectedWord(w)}
                      className="w-full flex items-center gap-2 text-left hover:bg-app-card/50 rounded-lg px-2 py-1.5 transition-colors cursor-pointer group"
                    >
                      <span className="text-app-accent-primary/40 text-[10px] font-bold w-4">{i + 1}</span>
                      <span className="text-white/70 text-xs font-medium flex-1 truncate group-hover:text-white/90">{w.word}</span>
                      <span className="text-app-text-muted text-[10px] bg-app-card/50 px-1.5 py-0.5 rounded">{w.songs.length}b</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Alphabet nav */}
            <div className="bg-app-bg border border-app-border rounded-xl p-4">
              <p className="text-app-text-muted text-[10px] tracking-normal mb-3">Tra theo ch? cái</p>
              <button
                onClick={() => setSelectedLetter("all")}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium mb-1 transition-colors cursor-pointer ${
                  selectedLetter === "all"
                    ? "bg-app-accent-primary/10 text-app-accent-primary"
                    : "text-app-text-secondary hover:text-white/70 hover:bg-app-card/50"
                }`}
              >
                T?t c? ({dictionary.length})
              </button>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                {ALPHABET.map((letter) => {
                  const count = letterCounts[letter] ?? 0;
                  if (count === 0) return null;
                  return (
                    <button
                      key={letter}
                      onClick={() => setSelectedLetter(letter === selectedLetter ? "all" : letter)}
                      className={`flex flex-col items-center py-1.5 rounded-lg transition-colors cursor-pointer ${
                        selectedLetter === letter
                          ? "bg-app-accent-primary/15 text-app-accent-primary"
                          : "text-app-text-secondary hover:text-white/70 hover:bg-app-card/50"
                      }`}
                    >
                      <span className="text-xs font-bold">{letter}</span>
                      <span className="text-[8px] opacity-60">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Main dictionary */}
          <div className="flex-1 min-w-0">
            {/* Search + sort */}
            <div className="flex items-center gap-3 mb-4">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center">
                  <i className="ri-search-line text-app-text-muted text-sm"></i>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm t? v?ng, nghia, ví d?..."
                  className="w-full bg-app-bg border border-app-border rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/30 transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-app-text-muted hover:text-white/60 cursor-pointer"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 bg-app-bg border border-app-border rounded-xl p-1">
                {([["alpha", "A-Z", "ri-sort-asc"], ["freq", "Ph? bi?n", "ri-bar-chart-line"]] as const).map(([mode, label, icon]) => (
                  <button
                    key={mode}
                    onClick={() => setSortMode(mode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      sortMode === mode
                        ? "bg-app-accent-primary/10 text-app-accent-primary"
                        : "text-white/35 hover:text-white/60"
                    }`}
                  >
                    <i className={`${icon} text-[11px]`}></i>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            {(search || selectedLetter !== "all") && (
              <p className="text-app-text-muted text-xs mb-3">
                Tìm th?y <strong className="text-white/60">{filtered.length}</strong> t?
                {selectedLetter !== "all" && <span> b?t d?u b?ng <strong className="text-app-accent-primary">{selectedLetter}</strong></span>}
              </p>
            )}

            {/* Word grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-app-bg border border-app-border rounded-xl">
                <i className="ri-search-line text-white/15 text-3xl mb-3"></i>
                <p className="text-app-text-muted text-sm">Không tìm th?y t? nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
                {filtered.map((entry) => (
                  <button
                    key={entry.word}
                    onClick={() => setSelectedWord(entry)}
                    className="bg-app-bg border border-app-border hover:border-app-accent-primary/20 rounded-xl p-4 text-left transition-all cursor-pointer group hover:bg-app-accent-primary/3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-white/90 font-bold text-base group-hover:text-app-accent-primary transition-colors">{entry.word}</span>
                      {entry.songs.length > 1 && (
                        <span className="text-[9px] bg-emerald-500/10 text-app-accent-success px-1.5 py-0.5 rounded-full border border-emerald-500/20 flex-shrink-0 ml-2">
                          {entry.songs.length} bài
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 text-xs mb-2 line-clamp-1">{entry.meaning}</p>
                    {entry.example && (
                      <p className="text-app-text-muted text-[10px] italic line-clamp-1">{entry.example}</p>
                    )}
                    <div className="mt-2 pt-2 border-t border-app-border flex items-center gap-1">
                      <i className="ri-music-2-line text-app-text-muted text-[10px]"></i>
                      <span className="text-app-text-muted text-[10px] truncate">{entry.songs[0]}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Word detail modal */}
      {selectedWord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedWord(null)}
        >
          <div
            className="bg-app-bg border border-app-border rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-app-accent-primary text-3xl font-bold mb-1">{selectedWord.word}</h2>
                <p className="text-white/60 text-base">{selectedWord.meaning}</p>
              </div>
              <button
                onClick={() => setSelectedWord(null)}
                className="w-8 h-8 flex items-center justify-center text-app-text-muted hover:text-white/70 cursor-pointer rounded-lg hover:bg-app-card/50 transition-colors"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            {selectedWord.example && (
              <div className="bg-app-surface/50 border border-app-border rounded-xl px-4 py-3 mb-4">
                <p className="text-app-text-muted text-[10px] tracking-normal mb-1.5">Ví d?</p>
                <p className="text-white/70 text-sm italic leading-relaxed">{selectedWord.example}</p>
              </div>
            )}

            <div>
              <p className="text-app-text-muted text-[10px] tracking-normal mb-3">
                Xu?t hi?n trong {selectedWord.songs.length} bài hát
              </p>
              <div className="space-y-2">
                {selectedWord.songs.map((song, i) => (
                  <div key={i} className="flex items-center gap-3 bg-app-surface/50 rounded-lg px-3 py-2.5">
                    <div className="w-7 h-7 flex items-center justify-center bg-app-accent-primary/10 rounded-lg flex-shrink-0">
                      <i className="ri-music-2-line text-app-accent-primary text-xs"></i>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs font-medium">{song}</p>
                      <p className="text-app-text-muted text-[10px]">{selectedWord.artists[i]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedWord(null)}
              className="w-full mt-5 bg-app-card/50 hover:bg-app-card/70 text-white/50 text-sm py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Ðóng
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

