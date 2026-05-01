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

const ALPHABET = "ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ".split("");

function getInitialConsonant(char: string): string {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return char[0]?.toUpperCase() ?? "#";
  const consonants = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
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
      "Từ (Korean)": v.word,
      "Nghĩa (Vietnamese)": v.meaning,
      "Ví dụ": v.example,
      "Bài hát": v.songs.join("; "),
      "Nghệ sĩ": v.artists.join("; "),
      "Số lần xuất hiện": v.count,
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
        showExportToast(`Đã xuất ${dictionary.length} từ ra CSV — mở bằng Excel hoặc Anki!`);
      },
      (limit) => {
        buildAndDownloadCSV(dictionary.slice(0, limit), `KTS_Dictionary_${limit}tu.csv`, limit);
        showExportToast(`Đã xuất ${limit} từ (VIP Tháng giới hạn). Nâng cấp VIP Năm để xuất toàn bộ!`);
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
      "Từ (Korean)": v.word,
      "Nghĩa (Vietnamese)": v.meaning,
      "Ví dụ": v.example,
      "Bài hát": v.songs.join("; "),
      "Nghệ sĩ": v.artists.join("; "),
      "Số lần xuất hiện": v.count,
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
      ? `Đã xuất ${dictionary.length} từ ra Excel!`
      : `Đã xuất 50 từ (VIP Tháng giới hạn). Nâng cấp VIP Năm để xuất toàn bộ!`;
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
          v.songs.length > 0 ? `<small>📀 ${v.songs[0]}</small>` : "",
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
    showExportToast(`Đã xuất ${dictionary.length} thẻ Anki — import vào Anki app là dùng được!`);
  };

  return (
    <DashboardLayout
      title="Từ điển K-pop"
      subtitle={`${stats.total} từ vựng từ ${approvedLessons.length} bài học`}
      actions={
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs bg-white/5 px-3 py-1.5 rounded-full">
            {stats.multiSong} từ xuất hiện nhiều bài
          </span>
          {dictionary.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="flex items-center gap-2 bg-[#e8c84a] hover:bg-[#d4b43a] text-black text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-download-2-line"></i>
                Xuất từ điển
                <i className={`ri-arrow-down-s-line transition-transform ${showExportMenu ? "rotate-180" : ""}`}></i>
              </button>
              {showExportMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 z-50 bg-[#1a1d27] border border-white/10 rounded-xl overflow-hidden shadow-xl min-w-52">
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-white/30 text-[10px] uppercase tracking-wider">Chọn định dạng xuất</p>
                    </div>
                    <button
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer text-left"
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 rounded-lg flex-shrink-0">
                        <i className="ri-file-text-line text-emerald-400 text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white/80 text-xs font-medium">CSV (UTF-8)</p>
                        <p className="text-white/30 text-[10px]">{isVipYear ? "Toàn bộ" : isVipMonth ? "50 từ (VIP Tháng)" : "Cần VIP"}</p>
                      </div>
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer text-left"
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-[#e8c84a]/10 rounded-lg flex-shrink-0">
                        <i className="ri-file-excel-2-line text-[#e8c84a] text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white/80 text-xs font-medium">Excel (.xlsx)</p>
                        <p className="text-white/30 text-[10px]">{isVipYear ? "Toàn bộ" : isVipMonth ? "50 từ (VIP Tháng)" : "Cần VIP"}</p>
                      </div>
                    </button>
                    <button
                      onClick={handleExportAnki}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer text-left border-t border-white/5"
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-sky-500/10 rounded-lg flex-shrink-0">
                        <i className="ri-stack-line text-sky-400 text-sm"></i>
                      </div>
                      <div>
                        <p className="text-white/80 text-xs font-medium">Anki Deck (.txt)</p>
                        <p className="text-white/30 text-[10px]">{isVipYear ? "Toàn bộ" : "Chỉ VIP Năm"}</p>
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
        featureName="Xuất từ điển K-pop"
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
          <div className="w-16 h-16 flex items-center justify-center bg-white/5 rounded-2xl mb-5">
            <i className="ri-book-open-line text-white/20 text-3xl"></i>
          </div>
          <p className="text-white/40 text-sm font-medium">Chưa có từ vựng nào</p>
          <p className="text-white/20 text-xs mt-1 mb-5">Duyệt bài học trong K-pop Lesson để tích lũy từ vựng</p>
          <a
            href="/melon"
            className="flex items-center gap-2 bg-[#e8c84a]/10 hover:bg-[#e8c84a]/20 text-[#e8c84a] text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-music-2-line"></i>
            Đến K-pop Lesson
          </a>
        </div>
      ) : (
        <div className="flex gap-5">
          {/* Left: Stats + alphabet nav */}
          <div className="w-56 flex-shrink-0 space-y-4">
            {/* Stats */}
            <div className="bg-[#0f1117] border border-white/5 rounded-xl p-4 space-y-3">
              <p className="text-white/30 text-[10px] uppercase tracking-wider">Thống kê</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">Tổng từ vựng</span>
                  <span className="text-[#e8c84a] font-bold text-sm">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">Từ duy nhất</span>
                  <span className="text-white/70 text-sm font-medium">{stats.unique}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">Xuất hiện &gt;1 bài</span>
                  <span className="text-emerald-400 text-sm font-medium">{stats.multiSong}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">Từ bài học</span>
                  <span className="text-white/50 text-sm">{approvedLessons.length} bài</span>
                </div>
              </div>
            </div>

            {/* Top frequent words */}
            {stats.topWords.length > 0 && (
              <div className="bg-[#0f1117] border border-white/5 rounded-xl p-4">
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-3">Từ phổ biến nhất</p>
                <div className="space-y-2">
                  {stats.topWords.map((w, i) => (
                    <button
                      key={w.word}
                      onClick={() => setSelectedWord(w)}
                      className="w-full flex items-center gap-2 text-left hover:bg-white/5 rounded-lg px-2 py-1.5 transition-colors cursor-pointer group"
                    >
                      <span className="text-[#e8c84a]/40 text-[10px] font-bold w-4">{i + 1}</span>
                      <span className="text-white/70 text-xs font-medium flex-1 truncate group-hover:text-white/90">{w.word}</span>
                      <span className="text-white/25 text-[10px] bg-white/5 px-1.5 py-0.5 rounded">{w.songs.length}b</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Alphabet nav */}
            <div className="bg-[#0f1117] border border-white/5 rounded-xl p-4">
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-3">Tra theo chữ cái</p>
              <button
                onClick={() => setSelectedLetter("all")}
                className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium mb-1 transition-colors cursor-pointer ${
                  selectedLetter === "all"
                    ? "bg-[#e8c84a]/10 text-[#e8c84a]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                Tất cả ({dictionary.length})
              </button>
              <div className="grid grid-cols-4 gap-1">
                {ALPHABET.map((letter) => {
                  const count = letterCounts[letter] ?? 0;
                  if (count === 0) return null;
                  return (
                    <button
                      key={letter}
                      onClick={() => setSelectedLetter(letter === selectedLetter ? "all" : letter)}
                      className={`flex flex-col items-center py-1.5 rounded-lg transition-colors cursor-pointer ${
                        selectedLetter === letter
                          ? "bg-[#e8c84a]/15 text-[#e8c84a]"
                          : "text-white/40 hover:text-white/70 hover:bg-white/5"
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
                  <i className="ri-search-line text-white/25 text-sm"></i>
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm từ vựng, nghĩa, ví dụ..."
                  className="w-full bg-[#0f1117] border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#e8c84a]/30 transition-colors"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-white/25 hover:text-white/60 cursor-pointer"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 bg-[#0f1117] border border-white/5 rounded-xl p-1">
                {([["alpha", "A-Z", "ri-sort-asc"], ["freq", "Phổ biến", "ri-bar-chart-line"]] as const).map(([mode, label, icon]) => (
                  <button
                    key={mode}
                    onClick={() => setSortMode(mode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      sortMode === mode
                        ? "bg-[#e8c84a]/10 text-[#e8c84a]"
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
              <p className="text-white/30 text-xs mb-3">
                Tìm thấy <strong className="text-white/60">{filtered.length}</strong> từ
                {selectedLetter !== "all" && <span> bắt đầu bằng <strong className="text-[#e8c84a]">{selectedLetter}</strong></span>}
              </p>
            )}

            {/* Word grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-[#0f1117] border border-white/5 rounded-xl">
                <i className="ri-search-line text-white/15 text-3xl mb-3"></i>
                <p className="text-white/30 text-sm">Không tìm thấy từ nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
                {filtered.map((entry) => (
                  <button
                    key={entry.word}
                    onClick={() => setSelectedWord(entry)}
                    className="bg-[#0f1117] border border-white/5 hover:border-[#e8c84a]/20 rounded-xl p-4 text-left transition-all cursor-pointer group hover:bg-[#e8c84a]/3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-white/90 font-bold text-base group-hover:text-[#e8c84a] transition-colors">{entry.word}</span>
                      {entry.songs.length > 1 && (
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20 flex-shrink-0 ml-2">
                          {entry.songs.length} bài
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 text-xs mb-2 line-clamp-1">{entry.meaning}</p>
                    {entry.example && (
                      <p className="text-white/25 text-[10px] italic line-clamp-1">{entry.example}</p>
                    )}
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1">
                      <i className="ri-music-2-line text-white/20 text-[10px]"></i>
                      <span className="text-white/25 text-[10px] truncate">{entry.songs[0]}</span>
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
            className="bg-[#0f1117] border border-white/10 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-[#e8c84a] text-3xl font-bold mb-1">{selectedWord.word}</h2>
                <p className="text-white/60 text-base">{selectedWord.meaning}</p>
              </div>
              <button
                onClick={() => setSelectedWord(null)}
                className="w-8 h-8 flex items-center justify-center text-white/30 hover:text-white/70 cursor-pointer rounded-lg hover:bg-white/5 transition-colors"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            {selectedWord.example && (
              <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 mb-4">
                <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1.5">Ví dụ</p>
                <p className="text-white/70 text-sm italic leading-relaxed">{selectedWord.example}</p>
              </div>
            )}

            <div>
              <p className="text-white/30 text-[10px] uppercase tracking-wider mb-3">
                Xuất hiện trong {selectedWord.songs.length} bài hát
              </p>
              <div className="space-y-2">
                {selectedWord.songs.map((song, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/3 rounded-lg px-3 py-2.5">
                    <div className="w-7 h-7 flex items-center justify-center bg-[#e8c84a]/10 rounded-lg flex-shrink-0">
                      <i className="ri-music-2-line text-[#e8c84a] text-xs"></i>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs font-medium">{song}</p>
                      <p className="text-white/30 text-[10px]">{selectedWord.artists[i]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedWord(null)}
              className="w-full mt-5 bg-white/5 hover:bg-white/10 text-white/50 text-sm py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
