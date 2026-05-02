import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { epsLessons } from "@/mocks/epsLessons";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useVipYearGuard, getExportBtnLabel, getExportBtnIcon } from "@/hooks/useVipYearGuard";

type ExportFormat = "csv" | "txt" | "json" | "print";
type LessonFilter = "all" | "range" | "select";

function exportToCSV(lessons: typeof epsLessons) {
  const rows: string[] = ["Bài,Tiêu đề,Tiếng Hàn,Tiếng Việt,Phiên âm"];
  lessons.forEach(lesson => {
    lesson.vocabulary.forEach(v => {
      const korean = v.korean.replace(/,/g, "，");
      const vietnamese = v.vietnamese.replace(/,/g, "，");
      const romanization = (v.romanization || "").replace(/,/g, "，");
      rows.push(`${lesson.id},"${lesson.titleVi}","${korean}","${vietnamese}","${romanization}"`);
    });
  });
  const bom = "\uFEFF";
  const blob = new Blob([bom + rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "EPS-tu-vung.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function exportToTXT(lessons: typeof epsLessons) {
  const lines: string[] = [];
  lessons.forEach(lesson => {
    lines.push(`\n=== Bài ${lesson.id}: ${lesson.titleVi} (${lesson.title}) ===`);
    lesson.vocabulary.forEach(v => {
      lines.push(`${v.korean} — ${v.vietnamese}${v.romanization ? ` [${v.romanization}]` : ""}`);
    });
  });
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "EPS-tu-vung.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function exportToJSON(lessons: typeof epsLessons) {
  const data = lessons.map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    titleVi: lesson.titleVi,
    vocabulary: lesson.vocabulary.map(v => ({
      korean: v.korean,
      vietnamese: v.vietnamese,
      romanization: v.romanization || "",
    })),
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "EPS-tu-vung.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Print preview component
function PrintPreview({ lessons, onClose }: { lessons: typeof epsLessons; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Từ vựng EPS-TOPIK</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #111; background: white; }
          .page { padding: 15mm 12mm; }
          h1 { font-size: 16px; font-weight: 700; text-align: center; margin-bottom: 4px; color: #1a1a2e; }
          .subtitle { font-size: 10px; text-align: center; color: #666; margin-bottom: 12px; }
          .lesson-block { margin-bottom: 14px; break-inside: avoid; }
          .lesson-title { font-size: 12px; font-weight: 700; color: #1a1a2e; background: #f0f4ff; padding: 4px 8px; border-left: 3px solid #4f46e5; margin-bottom: 4px; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f8f9fa; font-size: 9px; font-weight: 600; color: #555; padding: 3px 6px; border: 1px solid #e0e0e0; text-align: left; }
          td { padding: 3px 6px; border: 1px solid #e8e8e8; vertical-align: top; }
          tr:nth-child(even) td { background: #fafafa; }
          .korean { font-weight: 600; color: #1a1a2e; }
          .vietnamese { color: #333; }
          .romanization { color: #888; font-style: italic; font-size: 9px; }
          .num { color: #aaa; font-size: 9px; width: 20px; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .lesson-block { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <h1>Từ vựng EPS-TOPIK</h1>
          <div class="subtitle">Tổng cộng ${lessons.reduce((s, l) => s + l.vocabulary.length, 0)} từ — ${lessons.length} bài học</div>
          ${lessons.map(lesson => `
            <div class="lesson-block">
              <div class="lesson-title">Bài ${lesson.id}: ${lesson.titleVi} (${lesson.title})</div>
              <table>
                <thead>
                  <tr>
                    <th class="num">#</th>
                    <th style="width:30%">Tiếng Hàn</th>
                    <th style="width:35%">Tiếng Việt</th>
                    <th>Phiên âm</th>
                  </tr>
                </thead>
                <tbody>
                  ${lesson.vocabulary.map((v, i) => `
                    <tr>
                      <td class="num">${i + 1}</td>
                      <td class="korean">${v.korean}</td>
                      <td class="vietnamese">${v.vietnamese}</td>
                      <td class="romanization">${v.romanization || ""}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          `).join("")}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      {/* Toolbar */}
      <div className="bg-[#1a1d2e] border-b border-app-border px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-app-card/70 transition-colors cursor-pointer">
            <i className="ri-close-line text-white/60"></i>
          </button>
          <div>
            <p className="text-white font-semibold text-sm">Xem trước khi in</p>
            <p className="text-app-text-secondary text-xs">{lessons.length} bài — {lessons.reduce((s, l) => s + l.vocabulary.length, 0)} từ</p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-app-accent-primary/15 hover:bg-app-accent-primary/25 border border-app-accent-primary/30 rounded-lg text-app-accent-primary font-semibold text-sm transition-all cursor-pointer whitespace-nowrap"
        >
          <i className="ri-printer-line"></i>
          In ngay (Ctrl+P)
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-y-auto bg-gray-200 p-6">
        <div ref={printRef} className="max-w-3xl mx-auto bg-white shadow-xl rounded-sm" style={{ minHeight: "297mm", padding: "15mm 12mm", fontFamily: "Arial, sans-serif" }}>
          {/* Header */}
          <div className="text-center mb-6 pb-4 border-b-2 border-gray-200">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Từ vựng EPS-TOPIK</h1>
            <p className="text-gray-500 text-xs">Tổng cộng {lessons.reduce((s, l) => s + l.vocabulary.length, 0)} từ — {lessons.length} bài học</p>
          </div>

          {/* Lessons */}
          {lessons.map(lesson => (
            <div key={lesson.id} className="mb-6">
              <div className="flex items-center gap-2 mb-2 bg-indigo-50 px-3 py-1.5 rounded border-l-4 border-indigo-500">
                <span className="text-indigo-700 font-bold text-xs">Bài {lesson.id}</span>
                <span className="text-gray-700 font-semibold text-xs">{lesson.titleVi}</span>
                <span className="text-gray-400 text-xs">({lesson.title})</span>
              </div>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-2 py-1 text-left text-gray-500 font-semibold w-6">#</th>
                    <th className="border border-gray-200 px-2 py-1 text-left text-gray-500 font-semibold w-1/3">Tiếng Hàn</th>
                    <th className="border border-gray-200 px-2 py-1 text-left text-gray-500 font-semibold w-1/3">Tiếng Việt</th>
                    <th className="border border-gray-200 px-2 py-1 text-left text-gray-500 font-semibold">Phiên âm</th>
                  </tr>
                </thead>
                <tbody>
                  {lesson.vocabulary.map((v, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-100 px-2 py-1 text-gray-400">{i + 1}</td>
                      <td className="border border-gray-100 px-2 py-1 font-semibold text-gray-900">{v.korean}</td>
                      <td className="border border-gray-100 px-2 py-1 text-gray-700">{v.vietnamese}</td>
                      <td className="border border-gray-100 px-2 py-1 text-gray-400 italic">{v.romanization || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center">
            <p className="text-gray-400 text-xs">EPS-TOPIK Vocabulary — Học tiếng Hàn cho người lao động</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EpsVocabExportPage() {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const { isVipYear, isVip, isLoggedIn, checkAndRun } = useVipYearGuard();
  const canExport = isAdmin || isVipYear;
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [lessonFilter, setLessonFilter] = useState<LessonFilter>("all");
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(10);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [exported, setExported] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const realLessons = useMemo(() => epsLessons.filter(l => l.vocabulary && l.vocabulary.length > 0), []);

  const selectedLessons = useMemo(() => {
    if (lessonFilter === "all") return realLessons;
    if (lessonFilter === "range") return realLessons.filter(l => l.id >= rangeFrom && l.id <= rangeTo);
    return realLessons.filter(l => selectedIds.has(l.id));
  }, [lessonFilter, rangeFrom, rangeTo, selectedIds, realLessons]);

  const totalVocab = selectedLessons.reduce((sum, l) => sum + l.vocabulary.length, 0);

  const toggleLesson = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-app-bg flex items-center justify-center">
          <div className="text-center max-w-sm px-6">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: "rgba(248,113,113,0.12)" }}>
              <i className="ri-lock-line text-3xl" style={{ color: "#f87171" }}></i>
            </div>
            <h2 className="text-white font-bold text-lg mb-2">Chỉ dành cho Admin</h2>
            <p className="text-app-text-secondary text-sm mb-6">Tính năng xuất từ vựng chỉ dành cho quản trị viên. Vui lòng đăng nhập với tài khoản admin.</p>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl mx-auto cursor-pointer whitespace-nowrap transition-colors" style={{ backgroundColor: "rgba(232,200,74,0.12)", color: "app-accent-primary", border: "1px solid rgba(232,200,74,0.25)" }}>
              <i className="ri-arrow-left-line"></i>Quay lại
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleExport = () => {
    if (selectedLessons.length === 0) return;
    if (format === "print") { setShowPrintPreview(true); return; }
    if (!canExport) {
      checkAndRun(() => {});
      return;
    }
    if (format === "csv") exportToCSV(selectedLessons);
    else if (format === "txt") exportToTXT(selectedLessons);
    else exportToJSON(selectedLessons);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const formatInfo: Record<ExportFormat, { icon: string; label: string; desc: string; color: string }> = {
    csv: { icon: "ri-table-line", label: "CSV", desc: "Mở bằng Excel, Google Sheets. Dễ in thành bảng.", color: "#34d399" },
    txt: { icon: "ri-file-text-line", label: "TXT", desc: "File văn bản thuần. Dễ đọc, in ấn đơn giản.", color: "app-accent-primary" },
    json: { icon: "ri-code-line", label: "JSON", desc: "Dữ liệu có cấu trúc. Dùng cho ứng dụng khác.", color: "#a78bfa" },
    print: { icon: "ri-printer-line", label: "In A4", desc: "Xem trước và in bảng từ vựng đẹp ra giấy A4.", color: "#f97316" },
  };

  return (
    <DashboardLayout>
      {showPrintPreview && (
        <PrintPreview lessons={selectedLessons} onClose={() => setShowPrintPreview(false)} />
      )}

      <div className="min-h-screen bg-app-bg text-white">
        {/* Header */}
        <div className="bg-[#1a1d2e] border-b border-app-border px-6 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-app-card/70 transition-colors cursor-pointer">
              <i className="ri-arrow-left-line text-white/60"></i>
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Xuất & In từ vựng</h1>
              <p className="text-app-text-secondary text-xs">Tải hoặc in từ vựng EPS để học offline</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
          {/* Step 1: Choose format */}
          <div className="bg-app-surface/50 border border-app-border rounded-xl p-5">
            <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-app-accent-primary/20 text-app-accent-primary text-xs font-bold">1</span>
              Chọn định dạng xuất
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.entries(formatInfo) as [ExportFormat, typeof formatInfo.csv][]).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setFormat(key)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    format === key ? "" : "border-app-border bg-white/2 hover:bg-app-card/50"
                  }`}
                  style={format === key ? { borderColor: info.color, backgroundColor: `${info.color}15` } : {}}
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg mb-2" style={{ backgroundColor: `${info.color}20` }}>
                    <i className={`${info.icon} text-base`} style={{ color: info.color }}></i>
                  </div>
                  <p className="text-white font-semibold text-sm">{info.label}</p>
                  <p className="text-app-text-secondary text-[10px] mt-1 leading-relaxed">{info.desc}</p>
                  {key === "print" && (
                    <span className="inline-block mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${info.color}20`, color: info.color }}>MỚI</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Choose lessons */}
          <div className="bg-app-surface/50 border border-app-border rounded-xl p-5">
            <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-app-accent-primary/20 text-app-accent-primary text-xs font-bold">2</span>
              Chọn bài học
            </h2>

            <div className="flex gap-2 mb-4">
              {(["all", "range", "select"] as LessonFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setLessonFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    lessonFilter === f ? "bg-app-accent-primary/20 text-app-accent-primary border border-app-accent-primary/30" : "bg-app-card/50 text-app-text-secondary hover:text-white/70"
                  }`}
                >
                  {f === "all" ? "Tất cả bài" : f === "range" ? "Theo khoảng" : "Chọn từng bài"}
                </button>
              ))}
            </div>

            {lessonFilter === "range" && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <label className="text-app-text-secondary text-xs mb-1 block">Từ bài</label>
                  <input
                    type="number"
                    min={1}
                    max={56}
                    value={rangeFrom}
                    onChange={e => setRangeFrom(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary/50"
                  />
                </div>
                <div className="text-app-text-muted mt-5">—</div>
                <div className="flex-1">
                  <label className="text-app-text-secondary text-xs mb-1 block">Đến bài</label>
                  <input
                    type="number"
                    min={1}
                    max={56}
                    value={rangeTo}
                    onChange={e => setRangeTo(Math.min(56, parseInt(e.target.value) || 56))}
                    className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-app-accent-primary/50"
                  />
                </div>
              </div>
            )}

            {lessonFilter === "select" && (
              <div className="flex flex-wrap gap-2 mb-4 max-h-48 overflow-y-auto pr-1">
                {realLessons.map(lesson => (
                  <button
                    key={lesson.id}
                    onClick={() => toggleLesson(lesson.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      selectedIds.has(lesson.id)
                        ? "bg-app-accent-primary/20 text-app-accent-primary border border-app-accent-primary/30"
                        : "bg-app-card/50 text-app-text-secondary hover:text-white/70 border border-app-border"
                    }`}
                  >
                    Bài {lesson.id}
                  </button>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="bg-app-surface/50 rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">{selectedLessons.length} bài được chọn</p>
                <p className="text-app-text-secondary text-xs">{totalVocab} từ vựng</p>
              </div>
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-app-accent-primary/10">
                <i className="ri-translate-2 text-app-accent-primary text-sm"></i>
              </div>
            </div>
          </div>

          {/* Action button */}
          {!canExport && format !== "print" && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2">
              <i className="ri-vip-crown-line text-amber-400"></i>
              <p className="text-amber-300 text-xs">
                {!isLoggedIn ? "Đăng nhập để xuất" : !isVip ? "Nâng cấp VIP để xuất" : "Chỉ VIP Năm mới xuất được"}
              </p>
            </div>
          )}
          <button
            onClick={handleExport}
            disabled={selectedLessons.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all cursor-pointer flex items-center justify-center gap-2 ${
              exported
                ? "bg-emerald-500/20 border border-emerald-500/30 text-app-accent-success"
                : selectedLessons.length === 0
                ? "bg-app-card/50 border border-app-border text-app-text-muted cursor-not-allowed"
                : format === "print"
                ? "bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400"
                : !canExport
                ? "bg-app-card/50 border border-app-border text-app-text-secondary"
                : "bg-app-accent-primary/15 hover:bg-app-accent-primary/25 border border-app-accent-primary/30 text-app-accent-primary"
            }`}
          >
            {exported ? (
              <><i className="ri-checkbox-circle-fill text-xl"></i>Đã tải xuống thành công!</>
            ) : format === "print" ? (
              <><i className="ri-printer-line text-xl"></i>Xem trước &amp; In ({totalVocab} từ)</>
            ) : !canExport ? (
              <><i className={getExportBtnIcon(isLoggedIn, isVip, isVipYear)}></i>{getExportBtnLabel(isLoggedIn, isVip, isVipYear, "")}</>
            ) : (
              <><i className="ri-download-line text-xl"></i>Tải xuống {formatInfo[format].label} ({totalVocab} từ)</>
            )}
          </button>

          {/* Print info box */}
          {format === "print" && (
            <div className="bg-orange-500/8 border border-orange-500/20 rounded-xl p-4">
              <p className="text-orange-400 text-xs font-semibold mb-2 flex items-center gap-1.5">
                <i className="ri-printer-line"></i>
                Hướng dẫn in
              </p>
              <ul className="space-y-1.5">
                {[
                  "Nhấn nút trên để mở cửa sổ xem trước",
                  "Trong cửa sổ xem trước, nhấn nút In hoặc Ctrl+P",
                  "Chọn khổ giấy A4, hướng dọc (Portrait)",
                  "Bật tùy chọn In màu nền để bảng đẹp hơn",
                  "Có thể lưu thành PDF thay vì in ra giấy",
                ].map((tip, i) => (
                  <li key={i} className="text-orange-300/70 text-xs flex items-start gap-1.5">
                    <span className="text-orange-400 font-bold flex-shrink-0">{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          <div className="bg-white/2 border border-app-border rounded-xl p-4 space-y-2">
            <p className="text-white/50 text-xs font-semibold flex items-center gap-1.5">
              <i className="ri-lightbulb-line text-app-accent-primary"></i>
              Mẹo học offline
            </p>
            <ul className="space-y-1.5">
              {[
                "In A4: Tạo bảng từ vựng đẹp để học khi không có điện thoại",
                "CSV: Mở bằng Excel → In thành bảng từ vựng 2 cột Hàn-Việt",
                "TXT: Copy vào Anki hoặc Quizlet để tạo flashcard",
                "JSON: Import vào ứng dụng học tiếng Hàn khác",
              ].map((tip, i) => (
                <li key={i} className="text-app-text-muted text-xs flex items-start gap-1.5">
                  <i className="ri-arrow-right-s-line text-app-text-muted flex-shrink-0 mt-0.5"></i>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
