import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface ExamSchedule {
  id: string;
  region: string;
  examDate: string;
  registrationStart: string;
  registrationEnd: string;
  resultDate: string;
  slots: number;
  type: "written" | "cbт";
  status: "upcoming" | "registration" | "closed" | "completed";
  location: string;
}

const EXAM_SCHEDULES: ExamSchedule[] = [
  {
    id: "1",
    region: "Hà Nội",
    examDate: "2026-05-15",
    registrationStart: "2026-04-01",
    registrationEnd: "2026-04-20",
    resultDate: "2026-06-10",
    slots: 500,
    type: "cbт",
    status: "registration",
    location: "Trung tâm Ngoại ngữ Hà Nội, 91 Nguyễn Chí Thanh",
  },
  {
    id: "2",
    region: "TP.HCM",
    examDate: "2026-05-22",
    registrationStart: "2026-04-05",
    registrationEnd: "2026-04-25",
    resultDate: "2026-06-17",
    slots: 800,
    type: "cbт",
    status: "registration",
    location: "Trường ĐH Khoa học Xã hội và Nhân văn, 10-12 Đinh Tiên Hoàng",
  },
  {
    id: "3",
    region: "Đà Nẵng",
    examDate: "2026-06-05",
    registrationStart: "2026-04-20",
    registrationEnd: "2026-05-10",
    resultDate: "2026-07-01",
    slots: 300,
    type: "written",
    status: "upcoming",
    location: "Trung tâm Dịch vụ Việc làm Đà Nẵng, 78 Lê Duẩn",
  },
  {
    id: "4",
    region: "Cần Thơ",
    examDate: "2026-06-12",
    registrationStart: "2026-04-25",
    registrationEnd: "2026-05-15",
    resultDate: "2026-07-08",
    slots: 250,
    type: "cbт",
    status: "upcoming",
    location: "Trung tâm Giới thiệu Việc làm Cần Thơ, 3 Hòa Bình",
  },
  {
    id: "5",
    region: "Hải Phòng",
    examDate: "2026-07-10",
    registrationStart: "2026-05-20",
    registrationEnd: "2026-06-10",
    resultDate: "2026-08-05",
    slots: 400,
    type: "cbт",
    status: "upcoming",
    location: "Trung tâm Dịch vụ Việc làm Hải Phòng, 25 Lê Lợi",
  },
  {
    id: "6",
    region: "Hà Nội",
    examDate: "2026-03-20",
    registrationStart: "2026-02-01",
    registrationEnd: "2026-02-28",
    resultDate: "2026-04-15",
    slots: 500,
    type: "cbт",
    status: "completed",
    location: "Trung tâm Ngoại ngữ Hà Nội, 91 Nguyễn Chí Thanh",
  },
];

const IMPORTANT_NOTES = [
  { icon: "ri-file-list-3-line", title: "Hồ sơ đăng ký", desc: "CMND/CCCD bản gốc, ảnh 3x4 (2 ảnh), đơn đăng ký theo mẫu của Bộ LĐTBXH" },
  { icon: "ri-money-dollar-circle-line", title: "Lệ phí thi", desc: "150.000đ/lần thi (nộp tại điểm đăng ký hoặc chuyển khoản theo hướng dẫn)" },
  { icon: "ri-timer-line", title: "Thời gian thi", desc: "40 câu trắc nghiệm trong 50 phút. Đến trước giờ thi ít nhất 30 phút" },
  { icon: "ri-trophy-line", title: "Điểm đậu", desc: "Từ 80/200 điểm trở lên (tương đương 40%). Kết quả có hiệu lực 2 năm" },
];

function getCountdown(dateStr: string) {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours };
}

function StatusBadge({ status }: { status: ExamSchedule["status"] }) {
  const map = {
    registration: { label: "Đang mở đăng ký", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    upcoming: { label: "Sắp mở đăng ký", color: "bg-amber-100 text-amber-700 border-amber-200" },
    closed: { label: "Đã đóng đăng ký", color: "bg-red-100 text-red-700 border-red-200" },
    completed: { label: "Đã thi xong", color: "bg-gray-100 text-gray-500 border-gray-200" },
  };
  const s = map[status];
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.color}`}>{s.label}</span>;
}

export default function EpsExamSchedulePage() {
  const [filter, setFilter] = useState<"all" | "registration" | "upcoming" | "completed">("all");
  const [reminders, setReminders] = useState<Set<string>>(new Set());
  const [showReminderToast, setShowReminderToast] = useState(false);

  const filtered = EXAM_SCHEDULES.filter(e => filter === "all" || e.status === filter);

  const toggleReminder = (id: string) => {
    setReminders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setShowReminderToast(true);
    setTimeout(() => setShowReminderToast(false), 2500);
  };

  const nextExam = EXAM_SCHEDULES.find(e => e.status === "registration" || e.status === "upcoming");
  const countdown = nextExam ? getCountdown(nextExam.examDate) : null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Lịch thi EPS-TOPIK chính thức</h1>
            <p className="text-gray-500 text-sm mt-1">Lịch thi EPS-TOPIK tại Việt Nam — cập nhật từ Bộ LĐTBXH & HRD Korea</p>
          </div>
          <a
            href="https://www.hrdkorea.or.kr"
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-external-link-line"></i>
            HRD Korea chính thức
          </a>
        </div>

        {/* Countdown banner */}
        {nextExam && countdown && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-white/80 text-sm mb-1">Kỳ thi gần nhất</p>
                <h2 className="text-xl font-bold">{nextExam.region} — {new Date(nextExam.examDate).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</h2>
                <p className="text-white/70 text-sm mt-1">{nextExam.location}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-4xl font-extrabold">{countdown.days}</p>
                  <p className="text-white/70 text-xs">ngày</p>
                </div>
                <div className="text-2xl font-bold text-white/50">:</div>
                <div className="text-center">
                  <p className="text-4xl font-extrabold">{countdown.hours}</p>
                  <p className="text-white/70 text-xs">giờ</p>
                </div>
                <div className="text-center ml-2">
                  <p className="text-white/70 text-xs mb-1">còn lại</p>
                  <StatusBadge status={nextExam.status} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: "all", label: "Tất cả" },
            { key: "registration", label: "Đang mở đăng ký" },
            { key: "upcoming", label: "Sắp mở" },
            { key: "completed", label: "Đã thi xong" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${filter === tab.key ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Schedule list */}
        <div className="space-y-4">
          {filtered.map(exam => {
            const cd = getCountdown(exam.examDate);
            const hasReminder = reminders.has(exam.id);
            return (
              <div key={exam.id} className={`bg-white border rounded-2xl p-5 transition-all ${exam.status === "registration" ? "border-emerald-200" : exam.status === "completed" ? "border-gray-100 opacity-70" : "border-gray-200"}`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="text-gray-800 font-bold text-base">{exam.region}</h3>
                      <StatusBadge status={exam.status} />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${exam.type === "cbт" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                        {exam.type === "cbт" ? "CBT (Máy tính)" : "Bài thi viết"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-gray-400 text-xs mb-0.5">Ngày thi</p>
                        <p className="text-gray-800 text-sm font-semibold">{new Date(exam.examDate).toLocaleDateString("vi-VN")}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-0.5">Đăng ký từ</p>
                        <p className="text-gray-800 text-sm font-semibold">{new Date(exam.registrationStart).toLocaleDateString("vi-VN")}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-0.5">Hạn đăng ký</p>
                        <p className="text-gray-800 text-sm font-semibold">{new Date(exam.registrationEnd).toLocaleDateString("vi-VN")}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs mb-0.5">Công bố kết quả</p>
                        <p className="text-gray-800 text-sm font-semibold">{new Date(exam.resultDate).toLocaleDateString("vi-VN")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <i className="ri-map-pin-line"></i>
                      <span>{exam.location}</span>
                      <span className="mx-1">·</span>
                      <i className="ri-group-line"></i>
                      <span>{exam.slots.toLocaleString()} chỉ tiêu</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {cd && exam.status !== "completed" && (
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">Còn</p>
                        <p className="text-amber-600 font-bold text-lg">{cd.days} ngày</p>
                      </div>
                    )}
                    {exam.status !== "completed" && (
                      <button
                        onClick={() => toggleReminder(exam.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${hasReminder ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      >
                        <i className={hasReminder ? "ri-notification-fill" : "ri-notification-line"}></i>
                        {hasReminder ? "Đã nhắc" : "Nhắc tôi"}
                      </button>
                    )}
                    {exam.status === "registration" && (
                      <a
                        href="https://www.eps.go.kr"
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                        className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <i className="ri-external-link-line"></i>
                        Đăng ký ngay
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Important notes */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
          <h3 className="text-gray-800 font-bold text-base mb-4 flex items-center gap-2">
            <i className="ri-information-line text-amber-500"></i>
            Thông tin quan trọng khi đăng ký thi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {IMPORTANT_NOTES.map(note => (
              <div key={note.title} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`${note.icon} text-amber-600 text-base`}></i>
                </div>
                <div>
                  <p className="text-gray-700 text-sm font-semibold mb-0.5">{note.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{note.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick prep links */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h3 className="text-gray-800 font-bold text-sm mb-4">Chuẩn bị cho kỳ thi</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: "ri-timer-line", label: "Thi thử 40 câu", path: "/eps-exam", color: "#ea580c" },
              { icon: "ri-focus-3-line", label: "Thi theo chủ đề", path: "/eps-topic-exam", color: "#7c3aed" },
              { icon: "ri-brain-line", label: "Ôn câu sai", path: "/eps-smart-wrong", color: "#dc2626" },
              { icon: "ri-bar-chart-2-line", label: "Phân tích điểm yếu", path: "/eps-weakness-analysis", color: "#059669" },
            ].map(item => (
              <a
                key={item.label}
                href={item.path}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer text-center"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
                  <i className={`${item.icon} text-lg`} style={{ color: item.color }}></i>
                </div>
                <span className="text-gray-600 text-xs font-medium">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Toast */}
      {showReminderToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <i className="ri-notification-fill text-amber-400"></i>
          Đã cập nhật nhắc nhở!
        </div>
      )}
    </DashboardLayout>
  );
}
