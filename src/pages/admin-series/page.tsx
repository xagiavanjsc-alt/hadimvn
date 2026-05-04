import { useState, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { EbookSeries } from "@/pages/series/page";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) {
  return (
    <div className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
        <i className={`${icon} text-lg`} style={{ color }}></i>
      </div>
      <div>
        <p className="text-white font-bold text-xl leading-none">{value}</p>
        <p className="text-app-text-secondary text-xs mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function AdminSeriesPage() {
  const [seriesList, setSeriesList] = useLocalStorage<EbookSeries[]>("kts_series_list", []);
  const [approvedLessons] = useLocalStorage<ApprovedLesson[]>("kts_melon_lessons", []);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleDelete = (id: string) => {
    setSeriesList(prev => prev.filter(s => s.id !== id));
    setConfirmDelete(null);
    showToast("Đã xóa series", "error");
  };

  const filtered = seriesList.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalLessons = seriesList.reduce((sum, s) => sum + s.lessonRanks.length, 0);
  const withPrice = seriesList.filter(s => s.price).length;

  return (
    <AdminLayout
      title="Quản lý Series Ebook"
      subtitle="Xem và quản lý tất cả series ebook đã tạo"
      actions={
        <a
          href="/series"
          className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium px-4 py-2 rounded-lg border border-rose-500/20 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-external-link-line"></i>
          Mở trang Series
        </a>
      }
    >
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
          <i className={toast.type === "success" ? "ri-checkbox-circle-line" : "ri-error-warning-line"}></i>
          {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon="ri-stack-line" label="Tổng series" value={seriesList.length} color="app-accent-primary" />
        <StatCard icon="ri-book-open-line" label="Tổng bài học" value={totalLessons} color="#34d399" />
        <StatCard icon="ri-checkbox-circle-line" label="Bài đã duyệt" value={approvedLessons.length} color="#fb923c" />
        <StatCard icon="ri-price-tag-3-line" label="Series có giá" value={withPrice} color="#a78bfa" />
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-app-card/50 border border-app-border rounded-xl px-3 py-2.5">
          <i className="ri-search-line text-app-text-muted text-sm"></i>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm series theo tên, mô tả..."
            className="flex-1 bg-transparent text-white/70 text-sm outline-none placeholder-white/20"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-app-text-muted hover:text-white/60 cursor-pointer">
              <i className="ri-close-line text-sm"></i>
            </button>
          )}
        </div>
        <span className="text-app-text-muted text-xs whitespace-nowrap">{filtered.length}/{seriesList.length} series</span>
      </div>

      {/* Series table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-app-card/50 rounded-2xl mb-4">
            <i className="ri-stack-line text-app-text-muted text-3xl"></i>
          </div>
          <p className="text-app-text-secondary text-sm font-medium mb-1">
            {search ? "Không tìm thấy series nào" : "Chưa có series nào"}
          </p>
          <p className="text-app-text-muted text-xs mb-5">
            {search ? "Thử từ khóa khác" : "Tạo series từ trang Series để quản lý ebook"}
          </p>
          {!search && (
            <a
              href="/series"
              className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-sm font-medium px-5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap border border-rose-500/20"
            >
              <i className="ri-external-link-line"></i>
              Đến trang Series
            </a>
          )}
        </div>
      ) : (
        <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-0 text-[10px] text-app-text-muted tracking-normal font-bold px-5 py-3 border-b border-app-border">
            <span className="w-8">Bìa</span>
            <span className="pl-3">Tên series</span>
            <span className="w-20 text-center">Bài học</span>
            <span className="w-24 text-center">Giá</span>
            <span className="w-24 text-center">Ngày tạo</span>
            <span className="w-16 text-center">Thao tác</span>
          </div>
          <div className="divide-y divide-white/3">
            {filtered.map(series => {
              const lessonCount = series.lessonRanks.length;
              return (
                <div key={series.id} className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-0 items-center px-5 py-3.5 hover:bg-white/2 transition-colors">
                  {/* Cover swatch */}
                  <div
                    className="w-8 h-8 rounded-lg flex-shrink-0 border border-app-border relative overflow-hidden"
                    style={{ backgroundColor: series.coverColor }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: series.coverAccent }} />
                    <div className="absolute inset-0 flex items-end justify-center pb-1">
                      <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: series.coverAccent }} />
                    </div>
                  </div>

                  {/* Name + desc */}
                  <div className="pl-3 min-w-0">
                    <p className="text-white/80 text-sm font-semibold truncate">{series.name}</p>
                    {series.description && (
                      <p className="text-app-text-muted text-xs truncate mt-0.5">{series.description}</p>
                    )}
                    {series.tags && series.tags.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {series.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${series.coverAccent}15`, color: series.coverAccent }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lesson count */}
                  <div className="w-20 text-center">
                    <span className="text-white/60 text-sm font-bold">{lessonCount}</span>
                    <p className="text-app-text-muted text-[10px]">bài</p>
                  </div>

                  {/* Price */}
                  <div className="w-24 text-center">
                    {series.price ? (
                      <span className="text-app-accent-success text-xs font-semibold">{series.price}</span>
                    ) : (
                      <span className="text-app-text-muted text-xs">—</span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="w-24 text-center">
                    <span className="text-app-text-muted text-xs">
                      {new Date(series.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="w-16 flex items-center justify-center gap-1">
                    <a
                      href="/series"
                      className="w-7 h-7 flex items-center justify-center bg-app-card/50 hover:bg-app-card/70 rounded-lg transition-colors cursor-pointer"
                      title="Chỉnh sửa"
                    >
                      <i className="ri-edit-line text-app-text-secondary text-xs"></i>
                    </a>
                    <button
                      onClick={() => setConfirmDelete(series.id)}
                      className="w-7 h-7 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                      title="Xóa"
                    >
                      <i className="ri-delete-bin-line text-red-400 text-xs"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 bg-rose-500/5 border border-rose-500/15 rounded-xl p-4 flex items-start gap-3">
        <i className="ri-information-line text-rose-400 text-sm mt-0.5 flex-shrink-0"></i>
        <div>
          <p className="text-rose-400/80 text-xs font-semibold mb-1">Lưu ý quản lý Series</p>
          <p className="text-app-text-secondary text-xs leading-relaxed">
            Để tạo hoặc chỉnh sửa series, vào trang <strong className="text-white/60">Series</strong> trong menu chính.
            Trang này chỉ hiển thị tổng quan và cho phép xóa series không cần thiết.
          </p>
        </div>
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-app-bg border border-app-border rounded-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-red-500/10 rounded-2xl mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-400 text-2xl"></i>
            </div>
            <p className="text-white font-bold text-base mb-2">Xóa series này?</p>
            <p className="text-app-text-secondary text-sm mb-6">Hành động này không thể hoàn tác. Series và tất cả cấu hình sẽ bị xóa vĩnh viễn.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-app-border text-white/50 text-sm font-medium hover:bg-app-card/50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                Xóa series
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

