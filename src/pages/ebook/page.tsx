import { useState, useCallback, useRef, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";
import EbookCanvas from "./components/EbookCanvas";
import EbookSidebar from "./components/EbookSidebar";
import EbookCoverEditor from "./components/EbookCoverEditor";
import EbookPageCarousel from "./components/EbookPageCarousel";
import EbookTemplates, { type EbookTemplate } from "./components/EbookTemplates";
import EbookPDFPreview from "./components/EbookPDFPreview";
import EbookBatchExport from "./components/EbookBatchExport";
import FreeStoryGenerator from "./components/FreeStoryGenerator";
import { STORAGE_KEYS } from "@/lib/storageKeys";

export interface EbookMeta {
  title: string;
  subtitle: string;
  author: string;
  coverColor: string;
  coverAccent: string;
  description: string;
  foreword?: string;   // Lời mở đầu
  contactInfo?: string; // Thông tin liên hệ trang kết
  website?: string;    // Website trang kết
  fontFamily?: "sans" | "serif"; // Font chữ ebook
}

const DEFAULT_META: EbookMeta = {
  title: "Học Tiếng Hàn Qua K-pop",
  subtitle: "Truyện Chêm & Từ Vựng Thực Tế",
  author: "Hà Dím",
  coverColor: "#0f1117",
  coverAccent: "app-accent-primary",
  description: "Tuyển tập bài học tiếng Hàn được biên soạn từ các bài hát K-pop đang hot, giúp bạn học từ vựng và ngữ pháp một cách tự nhiên và thú vị.",
  foreword: "Chào bạn đọc thân mến!\n\nCuốn ebook này được biên soạn với tình yêu dành cho tiếng Hàn và K-pop. Mỗi bài học là một câu chuyện nhỏ — nơi ngôn ngữ và âm nhạc hòa quyện để giúp bạn học tiếng Hàn một cách tự nhiên nhất.\n\nHãy đọc chậm, cảm nhận từng từ, và đừng quên nghe lại bài hát sau mỗi bài học nhé!\n\nChúc bạn học vui!",
  contactInfo: "Email: contact@hanvietkts.com\nFacebook: fb.com/hanvietkts\nZalo: 0901 234 567",
  website: "www.hanvietkts.com",
  fontFamily: "sans",
};

export type EbookTab = "cover" | "lessons" | "template" | "preview" | "create";

// ─── PDF Export Limits ────────────────────────────────────────────────────
const FREE_LIMIT = 1;
const VIP_LIMIT = 10;

interface ExportRecord { month: string; count: number; isVip: boolean }

function usePdfExportLimit() {
  const [record, setRecord] = useLocalStorage<ExportRecord>("kts_pdf_export_record", { month: "", count: 0, isVip: false });
  const [isVip] = useLocalStorage<boolean>("kts_is_vip", false);

  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-04"
  const effectiveRecord = record.month === currentMonth ? record : { month: currentMonth, count: 0, isVip };
  const limit = isVip ? VIP_LIMIT : FREE_LIMIT;
  const remaining = Math.max(0, limit - effectiveRecord.count);
  const canExport = remaining > 0;

  const consume = () => {
    setRecord({ month: currentMonth, count: effectiveRecord.count + 1, isVip });
  };

  return { remaining, limit, canExport, consume, isVip, count: effectiveRecord.count };
}

export default function EbookPage() {
  const [approvedLessons] = useLocalStorage<ApprovedLesson[]>("kts_melon_lessons", []);
  const [meta, setMeta] = useLocalStorage<EbookMeta>("kts_ebook_meta", DEFAULT_META);
  const [selectedRanks, setSelectedRanks] = useLocalStorage<number[]>("kts_ebook_selected", []);
  const [template, setTemplate] = useLocalStorage<EbookTemplate>("kts_ebook_template", "classic");
  const [activeTab, setActiveTab] = useState<EbookTab>("lessons");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { remaining, limit, canExport, consume, isVip } = usePdfExportLimit();

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const selectedLessons = approvedLessons
    .filter((l) => selectedRanks.includes(l.song.rank))
    .sort((a, b) => selectedRanks.indexOf(a.song.rank) - selectedRanks.indexOf(b.song.rank));

  const handleToggleLesson = (rank: number) => {
    setSelectedRanks((prev) =>
      prev.includes(rank) ? prev.filter((r) => r !== rank) : [...prev, rank]
    );
  };

  const handleSelectAll = () => {
    const allRanks = approvedLessons.map((l) => l.song.rank);
    setSelectedRanks(allRanks);
  };

  const handleSelectHighQuality = () => {
    const highRanks = approvedLessons
      .filter((l) => (l.stars ?? 0) >= 4)
      .map((l) => l.song.rank);
    setSelectedRanks(highRanks);
    showToast(`Đã chọn ${highRanks.length} bài 4-5 sao`);
  };

  const handleClearAll = () => {
    setSelectedRanks([]);
  };

  const handleMoveUp = (rank: number) => {
    setSelectedRanks((prev) => {
      const idx = prev.indexOf(rank);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const handleMoveDown = (rank: number) => {
    setSelectedRanks((prev) => {
      const idx = prev.indexOf(rank);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const handleExportPDF = useCallback(async () => {
    if (selectedLessons.length === 0) {
      showToast("Chọn ít nhất 1 bài học để xuất PDF", "error");
      return;
    }
    if (!canExport) {
      setShowLimitModal(true);
      return;
    }
    setExporting(true);
    consume();
    showToast("Đang chuẩn bị xuất PDF... Trình duyệt sẽ mở hộp thoại in");
    setTimeout(() => {
      window.print();
      setExporting(false);
    }, 800);
  }, [selectedLessons, showToast, canExport, consume]);

  const handleBatchExportGroup = useCallback((groupLessons: ApprovedLesson[], groupName: string) => {
    // Build HTML and trigger download for each group
    const groupMeta = { ...meta, title: `${meta.title} — ${groupName}`, subtitle: `${groupLessons.length} bài học` };
    // Dynamically import to avoid circular deps
    import("./components/EbookPDFPreview").then(({ default: _ }) => {
      // We'll use the same buildHtmlContent logic via a custom event
      const event = new CustomEvent("kts-batch-export", {
        detail: { meta: groupMeta, lessons: groupLessons, template, groupName }
      });
      window.dispatchEvent(event);
    });
    showToast(`Đang xuất ebook: ${groupName}`);
  }, [meta, template, showToast]);

  const handleAddFreeLesson = useCallback((lesson: ApprovedLesson) => {
    // Add to approvedLessons in localStorage
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.MELON_LESSONS) ?? "[]") as ApprovedLesson[];
    const updated = [...stored, lesson];
    localStorage.setItem(STORAGE_KEYS.MELON_LESSONS, JSON.stringify(updated));
    // Auto-select the new lesson
    setSelectedRanks((prev) => [...prev, lesson.song.rank]);
    showToast(`Đã thêm "${lesson.song.title}" vào ebook!`);
    setActiveTab("lessons");
    // Force re-render by reloading
    window.location.reload();
  }, [showToast]);

  const tabs: { id: EbookTab; label: string; icon: string }[] = [
    { id: "create", label: "Tạo truyện mới", icon: "ri-magic-line" },
    { id: "lessons", label: "Chọn bài học", icon: "ri-list-check-2" },
    { id: "template", label: "Template", icon: "ri-layout-2-line" },
    { id: "cover", label: "Bìa ebook", icon: "ri-book-2-line" },
    { id: "preview", label: "Xem trước", icon: "ri-eye-line" },
  ];

  return (
    <DashboardLayout
      title="Ebook Builder"
      subtitle="Gom bài, sắp xếp, xuất PDF"
      actions={
        <div className="flex items-center gap-3">
          {selectedLessons.length > 0 && (
            <span className="text-app-text-secondary text-xs bg-app-card/50 px-3 py-1.5 rounded-full">
              {selectedLessons.length} bài đã chọn
            </span>
          )}
          <EbookBatchExport
            lessons={approvedLessons}
            meta={meta}
            template={template}
            onExportGroup={handleBatchExportGroup}
          />
          <EbookPDFPreview
            meta={meta}
            lessons={selectedLessons}
            template={template}
            disabled={selectedLessons.length === 0}
          />
          {/* Export counter */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${canExport ? "border-emerald-500/20 bg-emerald-500/8 text-app-accent-success" : "border-red-500/20 bg-red-500/8 text-red-400"}`}>
            <i className={`ri-file-pdf-2-line text-sm`}></i>
            <span>{remaining}/{limit} lần xuất</span>
            {isVip && <span className="text-app-accent-primary text-[10px] font-bold">VIP</span>}
          </div>
          <button
            onClick={handleExportPDF}
            disabled={selectedLessons.length === 0 || exporting}
            className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-app-bg font-bold text-sm px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            {exporting ? (
              <><i className="ri-loader-4-line animate-spin"></i>Đang xuất...</>
            ) : (
              <><i className="ri-file-pdf-2-line"></i>Xuất PDF</>
            )}
          </button>
        </div>
      }
    >
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium max-w-sm ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          <i className={toast.type === "success" ? "ri-checkbox-circle-line" : "ri-error-warning-line"}></i>
          {toast.msg}
        </div>
      )}

      {/* Limit modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowLimitModal(false)}>
          <div className="bg-app-bg border border-app-border rounded-2xl p-7 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/10 mx-auto mb-4">
              <i className="ri-file-pdf-2-line text-red-400 text-2xl"></i>
            </div>
            <h3 className="text-white font-bold text-lg text-center mb-2">Đã hết lượt xuất PDF</h3>
            <p className="text-app-text-secondary text-sm text-center mb-5 leading-relaxed">
              {isVip
                ? `Gói VIP cho phép xuất ${VIP_LIMIT} lần/tháng. Bạn đã dùng hết lượt tháng này. Lượt mới sẽ được reset vào đầu tháng sau.`
                : `Gói Free chỉ cho phép xuất ${FREE_LIMIT} lần/tháng. Nâng cấp VIP để xuất ${VIP_LIMIT} lần/tháng!`
              }
            </p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-app-surface/50 rounded-xl p-3 text-center">
                <p className="text-app-text-secondary text-[10px] mb-1">Gói Free</p>
                <p className="text-white font-bold text-lg">{FREE_LIMIT} lần</p>
                <p className="text-app-text-muted text-[10px]">mỗi tháng</p>
              </div>
              <div className="bg-app-accent-primary/8 border border-app-accent-primary/20 rounded-xl p-3 text-center">
                <p className="text-app-accent-primary text-[10px] mb-1 font-semibold">Gói VIP</p>
                <p className="text-app-accent-primary font-bold text-lg">{VIP_LIMIT} lần</p>
                <p className="text-app-accent-primary/40 text-[10px]">mỗi tháng</p>
              </div>
            </div>
            {!isVip && (
              <a href="/pricing" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm transition-colors cursor-pointer whitespace-nowrap mb-2">
                <i className="ri-vip-crown-line"></i>
                Nâng cấp VIP — 79k/tháng
              </a>
            )}
            <button onClick={() => setShowLimitModal(false)} className="w-full py-2.5 rounded-xl border border-app-border text-white/50 text-sm hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap">
              Đóng
            </button>
          </div>
        </div>
      )}

      {approvedLessons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-app-card/50 rounded-2xl mb-5">
            <i className="ri-book-2-line text-app-text-muted text-3xl"></i>
          </div>
          <p className="text-app-text-secondary text-sm font-medium">Chưa có bài học nào</p>
          <p className="text-app-text-muted text-xs mt-1 mb-5">Duyệt bài học trong trang K-pop Lesson trước</p>
          <a
            href="/melon"
            className="flex items-center gap-2 bg-app-accent-primary/10 hover:bg-app-accent-primary/20 text-app-accent-primary text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-music-2-line"></i>
            Đến K-pop Lesson
          </a>
        </div>
      ) : (
        <div className="flex gap-5">
          {/* Left panel */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-app-surface/50 rounded-xl p-1 border border-app-border mb-5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-app-accent-primary text-app-bg"
                      : "text-app-text-secondary hover:text-white/70"
                  }`}
                >
                  <i className={tab.icon}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "create" && (
              <FreeStoryGenerator onAddLesson={handleAddFreeLesson} />
            )}

            {activeTab === "lessons" && (
              <EbookSidebar
                lessons={approvedLessons}
                selectedRanks={selectedRanks}
                onToggle={handleToggleLesson}
                onSelectAll={handleSelectAll}
                onSelectHighQuality={handleSelectHighQuality}
                onClearAll={handleClearAll}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
              />
            )}

            {activeTab === "template" && (
              <EbookTemplates selected={template} onChange={setTemplate} />
            )}

            {activeTab === "cover" && (
              <EbookCoverEditor meta={meta} onChange={setMeta} />
            )}

            {activeTab === "preview" && (
              <EbookPageCarousel meta={meta} lessons={selectedLessons} template={template} />
            )}
          </div>

          {/* Right: Live preview */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-app-text-secondary text-xs tracking-normal">Preview</p>
                <span className="text-app-text-muted text-[10px]">A4 layout</span>
              </div>
              <EbookCanvas
                meta={meta}
                lessons={selectedLessons}
                printRef={printRef}
                template={template}
              />
            </div>
          </div>
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #ebook-print-area, #ebook-print-area * { visibility: visible !important; }
          #ebook-print-area { position: fixed; left: 0; top: 0; width: 100%; }
          @page { margin: 0; size: A4; }
        }
      `}</style>
    </DashboardLayout>
  );
}
