import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useExamSchedule } from "@/hooks/useExamSchedule";
import { usePageSEO } from "@/hooks/usePageSEO";
import { ORG_SCHEMA } from "@/lib/siteConfig";

export default function ExamSchedulePage() {
  const { user } = useAuth();
  const {
    schedules,
    loading,
    getFilteredSchedules,
    getUpcomingSchedules,
    getExamTypeLabel,
    getStatusLabel,
    getStatusColor,
    formatDate,
  } = useExamSchedule();
  const [selectedType, setSelectedType] = useState<"EPS" | "TOPIK_I" | "TOPIK_II" | null>(null);

  usePageSEO({
    title: "Lịch thi EPS-TOPIK | Hàn Quốc Ơi!",
    description: "Lịch thi EPS-TOPIK mới nhất, thông tin ca thi, địa điểm thi, hạn đăng ký. Cập nhật liên tục từ Bộ LĐTBXH.",
    keywords: "lịch thi EPS, lịch thi TOPIK, ca thi EPS, địa điểm thi EPS, đăng ký thi EPS",
    path: "/exam-schedule",
    ogType: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Lịch thi EPS-TOPIK",
      description: "Exam schedule for EPS-TOPIK",
      isAccessibleForFree: true,
      provider: ORG_SCHEMA,
    },
  });

  const filteredSchedules = selectedType
    ? getFilteredSchedules(selectedType)
    : getUpcomingSchedules();

  return (
    <DashboardLayout title="Lịch thi" subtitle="Thông tin thi cử EPS-TOPIK">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{getUpcomingSchedules().length}</p>
            <p className="text-app-text-muted text-xs">Sắp tới</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">
              {schedules.filter(s => s.status === "open").length}
            </p>
            <p className="text-app-text-muted text-xs">Đang đăng ký</p>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-app-accent-primary">{schedules.length}</p>
            <p className="text-app-text-muted text-xs">Tổng số</p>
          </div>
        </div>

        {/* Filter by Exam Type */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Lọc theo loại thi</h2>
            {selectedType && (
              <button
                onClick={() => setSelectedType(null)}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["EPS", "TOPIK_I", "TOPIK_II"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  selectedType === type
                    ? "border-app-accent-primary bg-app-accent-primary/10"
                    : "border-app-border hover:border-app-border/50 bg-app-surface/30"
                }`}
              >
                <p className="text-white text-sm font-medium">{getExamTypeLabel(type)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Exam Schedule List */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
            <i className="ri-calendar-line text-4xl text-app-text-muted mb-3" />
            <p className="text-white font-semibold mb-2">Không có lịch thi</p>
            <p className="text-app-text-muted text-sm mb-4">Chưa có lịch thi cho loại thi này</p>
            <button
              onClick={() => setSelectedType(null)}
              className="px-4 py-2 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm cursor-pointer transition-colors"
            >
              Xem tất cả
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-app-bg border border-app-border rounded-2xl p-5 hover:border-app-border/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${getStatusColor(schedule.status)}15` }}
                    >
                      <i
                        className="ri-calendar-event-line text-2xl"
                        style={{ color: getStatusColor(schedule.status) }}
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{getExamTypeLabel(schedule.examType)}</h3>
                      <p className="text-app-text-muted text-sm">{schedule.location}</p>
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${getStatusColor(schedule.status)}20`,
                      color: getStatusColor(schedule.status),
                    }}
                  >
                    {getStatusLabel(schedule.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-app-text-muted text-xs mb-1">Ngày thi</p>
                    <p className="text-white font-medium">{formatDate(schedule.date)}</p>
                  </div>
                  <div>
                    <p className="text-app-text-muted text-xs mb-1">Địa điểm</p>
                    <p className="text-white font-medium text-sm">{schedule.address}</p>
                  </div>
                  <div>
                    <p className="text-app-text-muted text-xs mb-1">Hạn đăng ký</p>
                    <p className="text-white font-medium">{formatDate(schedule.registrationDeadline)}</p>
                  </div>
                  <div>
                    <p className="text-app-text-muted text-xs mb-1">Lệ phí</p>
                    <p className="text-white font-medium">{schedule.fee === 0 ? "Miễn phí" : `${schedule.fee.toLocaleString()}đ`}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-app-text-muted text-xs">Số lượng đăng ký</p>
                    <p className="text-white text-sm font-medium">
                      {schedule.registered}/{schedule.capacity}
                    </p>
                  </div>
                  <div className="h-2 bg-app-surface/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(schedule.registered / schedule.capacity) * 100}%`,
                        backgroundColor:
                          (schedule.registered / schedule.capacity) * 100 >= 90
                            ? "#ef4444"
                            : (schedule.registered / schedule.capacity) * 100 >= 70
                            ? "#f97316"
                            : "#4ade80",
                      }}
                    />
                  </div>
                </div>

                {schedule.status === "open" && (
                  <button className="w-full py-3 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold cursor-pointer transition-colors">
                    Đăng ký ngay
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <i className="ri-information-line text-app-accent-primary" />
            Thông tin
          </h3>
          <ul className="text-app-text-muted text-sm space-y-1">
            <li>• Lịch thi được cập nhật từ Bộ LĐTBXH</li>
            <li>• Đăng ký sớm để đảm bảo chỗ thi</li>
            <li>• Mang theo CMND/CCCD khi đi thi</li>
            <li>• Đến trước 30 phút để làm thủ tục</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
