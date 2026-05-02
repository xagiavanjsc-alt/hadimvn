import { useState } from "react";
import { ExportRecord, useExportHistory } from "@/hooks/useExportHistory";

interface ExportHistoryPanelProps {
  filterType?: "melon" | "naver";
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
}

export default function ExportHistoryPanel({ filterType }: ExportHistoryPanelProps) {
  const { history, clearHistory } = useExportHistory();
  const [open, setOpen] = useState(false);

  const filtered = filterType ? history.filter((r) => r.type === filterType) : history;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-app-card/50 hover:bg-white/8 text-app-text-secondary hover:text-white/60 text-xs px-3 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
      >
        <i className="ri-history-line text-sm"></i>
        Lịch sử xuất
        {filtered.length > 0 && (
          <span className="bg-app-card/70 text-white/50 text-[10px] px-1.5 py-0.5 rounded-full">
            {filtered.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-app-card/50 rounded-lg">
                  <i className="ri-history-line text-white/50 text-base"></i>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Lịch sử xuất file</h3>
                  <p className="text-app-text-muted text-xs">{filtered.length} lần xuất</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {filtered.length > 0 && (
                  <button
                    onClick={() => { clearHistory(); }}
                    className="text-red-400/50 hover:text-red-400 text-xs cursor-pointer whitespace-nowrap"
                  >
                    Xóa tất cả
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 flex items-center justify-center text-app-text-muted hover:text-white/60 cursor-pointer"
                >
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 flex items-center justify-center bg-app-surface/50 rounded-2xl mb-3">
                    <i className="ri-file-list-3-line text-app-text-muted text-xl"></i>
                  </div>
                  <p className="text-app-text-muted text-sm">Chưa có lịch sử xuất file</p>
                  <p className="text-white/15 text-xs mt-1">Xuất Excel để ghi lại lịch sử</p>
                </div>
              ) : (
                <div className="divide-y divide-white/3">
                  {filtered.map((record: ExportRecord) => (
                    <div key={record.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/2 transition-colors">
                      <div className={`w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0 ${
                        record.type === "melon" ? "bg-app-accent-primary/10" : "bg-sky-500/10"
                      }`}>
                        <i className={`text-base ${
                          record.type === "melon" ? "ri-music-2-line text-app-accent-primary" : "ri-question-answer-line text-sky-400"
                        }`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-xs font-medium truncate">{record.fileName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            record.type === "melon"
                              ? "bg-app-accent-primary/10 text-app-accent-primary/70"
                              : "bg-sky-500/10 text-sky-400/70"
                          }`}>
                            {record.type === "melon" ? "K-pop" : "Naver KiN"}
                          </span>
                          <span className="text-app-text-muted text-[10px]">{record.count} mục</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-app-text-muted text-[10px]">{formatRelativeTime(record.exportedAt)}</p>
                        <p className="text-white/15 text-[10px]">
                          {new Date(record.exportedAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
