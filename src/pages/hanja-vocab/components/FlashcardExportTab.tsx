import { useState, useMemo } from "react";
import { HANJA_DATA, HanjaEntry } from "@/mocks/hanjaData";
import { useVipYearGuard, getExportBtnLabel, getExportBtnIcon, addCsvWatermark } from "@/hooks/useVipYearGuard";
import VipUpgradeModal from "@/components/feature/VipUpgradeModal";

const SR_KEY = "hanja_sr_data";

interface SRCard {
  korean: string;
  interval: number;
  easeFactor: number;
  dueDate: number;
  totalReviews: number;
  correctStreak: number;
}

type FilterMode = "all" | "learned" | "unlearned" | "mastered" | "due";
type ExportFormat = "csv" | "anki" | "pdf";

function getMastery(korean: string, srData: Record<string, SRCard>): "new" | "learning" | "mastered" {
  const card = srData[korean];
  if (!card) return "new";
  if (card.interval >= 21) return "mastered";
  return "learning";
}

function isDue(korean: string, srData: Record<string, SRCard>): boolean {
  const card = srData[korean];
  if (!card) return true;
  return Date.now() >= card.dueDate;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSV(entries: HanjaEntry[], filename: string, limit?: number) {
  const isLimited = limit !== undefined && entries.length > limit;
  const data = isLimited ? entries.slice(0, limit) : entries;
  const header = "Korean,Hanja,Vietnamese\n";
  const rows = data.map(e =>
    `"${e.korean}","${e.hanja}","${e.vietnamese}"`
  ).join("\n");
  let content = header + rows;
  if (isLimited) content = addCsvWatermark(content, limit!);
  downloadFile(content, filename, "text/csv;charset=utf-8;");
}

function exportAnki(entries: HanjaEntry[], filename: string) {
  // Anki format: front\tback
  const rows = entries.map(e =>
    `${e.korean} (${e.hanja})\t${e.vietnamese}`
  ).join("\n");
  downloadFile(rows, filename, "text/plain;charset=utf-8;");
}

function exportPDFHtml(entries: HanjaEntry[]) {
  const rows = entries.map((e, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#fafafa"}">
      <td style="padding:10px 14px;font-size:18px;font-weight:700;color:#111;">${e.korean}</td>
      <td style="padding:10px 14px;font-size:16px;color:#e05a5a;font-weight:600;">${e.hanja}</td>
      <td style="padding:10px 14px;font-size:14px;color:#555;">${e.vietnamese}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>Hán Hàn Flashcard Export</title>
<style>
  body { font-family: 'Noto Sans KR', sans-serif; margin: 0; padding: 20px; background: #fff; }
  h1 { font-size: 22px; color: #111; margin-bottom: 4px; }
  p { color: #888; font-size: 13px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; border: 1px solid #eee; }
  th { background: #f5f5f5; padding: 10px 14px; text-align: left; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<h1>Từ vựng Hán Hàn</h1>
<p>Tổng cộng ${entries.length} từ — Xuất lúc ${new Date().toLocaleString("vi-VN")}</p>
<table>
  <thead>
    <tr>
      <th>Tiếng Hàn</th>
      <th>Hán tự</th>
      <th>Tiếng Việt</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  }
}

const FILTER_OPTIONS: { value: FilterMode; label: string; icon: string; color: string }[] = [
  { value: "all", label: "Tất cả từ", icon: "ri-list-check", color: "text-gray-600" },
  { value: "unlearned", label: "Chưa học", icon: "ri-time-line", color: "text-gray-500" },
  { value: "learned", label: "Đang học", icon: "ri-book-open-line", color: "text-amber-600" },
  { value: "mastered", label: "Đã thuộc", icon: "ri-check-double-line", color: "text-green-600" },
  { value: "due", label: "Cần ôn hôm nay", icon: "ri-alarm-line", color: "text-rose-600" },
];

const ALPHABET_GROUPS = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

function getInitial(korean: string): string {
  const code = korean.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return "기타";
  const initIdx = Math.floor(code / 588);
  const initials = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
  return initials[initIdx] || "기타";
}

export default function FlashcardExportTab() {
  const { isVipYear, isVip, isVipMonth, isLoggedIn, checkAndRun, modalOpen, modalReason, closeModal } = useVipYearGuard();
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedAlpha, setSelectedAlpha] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("csv");
  const [exportSuccess, setExportSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const srData = useMemo<Record<string, SRCard>>(() => {
    try { return JSON.parse(localStorage.getItem(SR_KEY) || "{}"); } catch { return {}; }
  }, []);

  const filteredEntries = useMemo(() => {
    let entries = [...HANJA_DATA];

    // Filter by mastery
    if (filterMode === "unlearned") entries = entries.filter(e => getMastery(e.korean, srData) === "new");
    else if (filterMode === "learned") entries = entries.filter(e => getMastery(e.korean, srData) === "learning");
    else if (filterMode === "mastered") entries = entries.filter(e => getMastery(e.korean, srData) === "mastered");
    else if (filterMode === "due") entries = entries.filter(e => isDue(e.korean, srData));

    // Filter by alphabet
    if (selectedAlpha) entries = entries.filter(e => getInitial(e.korean) === selectedAlpha);

    // Filter by search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      entries = entries.filter(e =>
        e.korean.includes(q) ||
        e.hanja.includes(q) ||
        e.vietnamese.toLowerCase().includes(q)
      );
    }

    return entries;
  }, [filterMode, selectedAlpha, search, srData]);

  const stats = useMemo(() => {
    const total = HANJA_DATA.length;
    const mastered = HANJA_DATA.filter(e => getMastery(e.korean, srData) === "mastered").length;
    const learning = HANJA_DATA.filter(e => getMastery(e.korean, srData) === "learning").length;
    const unlearned = total - mastered - learning;
    const due = HANJA_DATA.filter(e => isDue(e.korean, srData)).length;
    return { total, mastered, learning, unlearned, due };
  }, [srData]);

  const handleExport = () => {
    checkAndRun(
      () => {
        const timestamp = new Date().toISOString().slice(0, 10);
        const filterLabel = FILTER_OPTIONS.find(f => f.value === filterMode)?.label || "all";
        const filename = `hanja-${filterLabel}-${timestamp}`;
        if (exportFormat === "csv") exportCSV(filteredEntries, `${filename}.csv`);
        else if (exportFormat === "anki") exportAnki(filteredEntries, `${filename}.txt`);
        else if (exportFormat === "pdf") exportPDFHtml(filteredEntries);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      },
      (limit) => {
        // VIP tháng: chỉ xuất CSV giới hạn
        const timestamp = new Date().toISOString().slice(0, 10);
        exportCSV(filteredEntries, `hanja-${limit}tu-${timestamp}.csv`, limit);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      }
    );
  };

  const alphaGroups = useMemo(() => {
    const counts: Record<string, number> = {};
    HANJA_DATA.forEach(e => {
      const init = getInitial(e.korean);
      counts[init] = (counts[init] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stats overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">Tổng từ</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.mastered}</p>
          <p className="text-xs text-gray-500 mt-1">Đã thuộc</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.learning}</p>
          <p className="text-xs text-gray-500 mt-1">Đang học</p>
        </div>
        <div className="bg-rose-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-rose-600">{stats.due}</p>
          <p className="text-xs text-gray-500 mt-1">Cần ôn hôm nay</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Filters */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filter by mastery */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Lọc theo trạng thái</p>
            <div className="space-y-2">
              {FILTER_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setFilterMode(opt.value)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all ${filterMode === opt.value ? "bg-rose-50 border border-rose-200" : "hover:bg-gray-50 border border-transparent"}`}>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={`${opt.icon} ${opt.color}`}></i>
                  </div>
                  <span className={`flex-1 text-left font-medium ${filterMode === opt.value ? "text-rose-700" : "text-gray-700"}`}>{opt.label}</span>
                  <span className="text-xs text-gray-400">
                    {opt.value === "all" ? stats.total :
                     opt.value === "unlearned" ? stats.unlearned :
                     opt.value === "learned" ? stats.learning :
                     opt.value === "mastered" ? stats.mastered :
                     stats.due}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter by alphabet */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Lọc theo chữ cái</p>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setSelectedAlpha(null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${!selectedAlpha ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                Tất cả
              </button>
              {ALPHABET_GROUPS.map(alpha => (
                <button key={alpha} onClick={() => setSelectedAlpha(selectedAlpha === alpha ? null : alpha)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${selectedAlpha === alpha ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {alpha}
                  {alphaGroups[alpha] ? <span className="ml-1 opacity-60">({alphaGroups[alpha]})</span> : null}
                </button>
              ))}
            </div>
          </div>

          {/* Export format */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Định dạng xuất</p>
            <div className="space-y-2">
              {([
                { value: "csv", label: "CSV (Excel, Google Sheets)", icon: "ri-file-excel-2-line", desc: "Mở bằng Excel hoặc Google Sheets" },
                { value: "anki", label: "Anki (TXT)", icon: "ri-flashlight-line", desc: "Import vào ứng dụng Anki" },
                { value: "pdf", label: "In / PDF", icon: "ri-printer-line", desc: "In ra giấy hoặc lưu PDF" },
              ] as { value: ExportFormat; label: string; icon: string; desc: string }[]).map(fmt => (
                <button key={fmt.value} onClick={() => setExportFormat(fmt.value)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all ${exportFormat === fmt.value ? "bg-rose-50 border border-rose-200" : "hover:bg-gray-50 border border-transparent"}`}>
                  <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                    <i className={`${fmt.icon} ${exportFormat === fmt.value ? "text-rose-500" : "text-gray-400"}`}></i>
                  </div>
                  <div className="text-left">
                    <p className={`font-medium ${exportFormat === fmt.value ? "text-rose-700" : "text-gray-700"}`}>{fmt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {!isVipYear && (
              <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 flex items-center gap-2">
                <i className="ri-vip-crown-line flex-shrink-0"></i>
                <span>{!isLoggedIn ? "Đăng nhập để xuất" : !isVip ? "Nâng cấp VIP để xuất" : "Chỉ VIP Năm mới xuất được"}</span>
              </div>
            )}
            <button onClick={handleExport}
              className={`w-full mt-4 py-3 rounded-xl font-semibold text-sm cursor-pointer transition-all flex items-center justify-center gap-2 ${!isVipYear ? "bg-gray-200 text-gray-400" : exportSuccess ? "bg-green-500 text-white" : "bg-rose-500 hover:bg-rose-600 text-white"}`}>
              {exportSuccess ? (
                <><i className="ri-check-line"></i>Đã xuất thành công!</>
              ) : (
                <><i className={getExportBtnIcon(isLoggedIn, isVip, isVipYear)}></i>{getExportBtnLabel(isLoggedIn, isVip, isVipYear, `Xuất ${filteredEntries.length} từ`)}</>
              )}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-700">Xem trước</p>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-medium rounded-full">{filteredEntries.length} từ</span>
              </div>
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                <input type="text" placeholder="Tìm từ..." value={search} onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 w-40" />
              </div>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <i className="ri-inbox-line text-4xl"></i>
                <p className="mt-2 text-sm">Không có từ nào phù hợp</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[520px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tiếng Hàn</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hán tự</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tiếng Việt</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.slice(0, 200).map((entry, i) => {
                      const mastery = getMastery(entry.korean, srData);
                      const due = isDue(entry.korean, srData);
                      return (
                        <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-50/30"}`}>
                          <td className="px-4 py-2.5 font-bold text-gray-900 text-base">{entry.korean}</td>
                          <td className="px-4 py-2.5 text-rose-500 font-semibold">{entry.hanja}</td>
                          <td className="px-4 py-2.5 text-gray-600 text-xs">{entry.vietnamese}</td>
                          <td className="px-4 py-2.5">
                            {mastery === "mastered" ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Thuộc</span>
                            ) : mastery === "learning" ? (
                              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${due ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                                {due ? "Cần ôn" : "Học"}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">Mới</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredEntries.length > 200 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-center text-xs text-gray-400">
                          Hiển thị 200/{filteredEntries.length} từ. Xuất file để xem tất cả.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* VIP Upgrade Modal */}
          <VipUpgradeModal
            open={modalOpen}
            onClose={closeModal}
            reason={modalReason ?? "not_vip_year"}
            featureName="Xuất Flashcard Hán-Hàn"
          />

          {/* Tips */}
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-700 mb-1.5">Hướng dẫn sử dụng</p>
            <ul className="text-xs text-amber-700/80 space-y-1">
              <li>• <strong>CSV</strong>: Mở bằng Excel → tạo bảng ôn tập, in ra giấy</li>
              <li>• <strong>Anki TXT</strong>: Import vào Anki → học với thuật toán spaced repetition</li>
              <li>• <strong>In/PDF</strong>: Mở cửa sổ in → chọn "Save as PDF" hoặc in trực tiếp</li>
              <li>• Lọc "Chưa học" để tập trung vào từ mới, "Cần ôn hôm nay" để ôn đúng lịch</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
