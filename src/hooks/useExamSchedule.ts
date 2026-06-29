import { useState, useEffect } from "react";

interface ExamSchedule {
  id: string;
  examType: "EPS" | "TOPIK_I" | "TOPIK_II";
  date: string;
  location: string;
  address: string;
  capacity: number;
  registered: number;
  status: "upcoming" | "open" | "closed" | "completed";
  registrationDeadline: string;
  fee: number;
}

export function useExamSchedule() {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const mockSchedules: ExamSchedule[] = [
    {
      id: "1",
      examType: "EPS",
      date: "2026-07-15",
      location: "Hà Nội",
      address: "Trường Đại học Ngoại ngữ - ĐHQGHN",
      capacity: 500,
      registered: 342,
      status: "open",
      registrationDeadline: "2026-06-30",
      fee: 0,
    },
    {
      id: "2",
      examType: "EPS",
      date: "2026-08-20",
      location: "TP. Hồ Chí Minh",
      address: "Trường Đại học KHXH&NV - ĐHQGTPHCM",
      capacity: 600,
      registered: 189,
      status: "open",
      registrationDeadline: "2026-07-15",
      fee: 0,
    },
    {
      id: "3",
      examType: "EPS",
      date: "2026-09-10",
      location: "Đà Nẵng",
      address: "Trường Đại học Đà Nẵng",
      capacity: 300,
      registered: 56,
      status: "upcoming",
      registrationDeadline: "2026-08-05",
      fee: 0,
    },
    {
      id: "4",
      examType: "TOPIK_I",
      date: "2026-07-14",
      location: "Hà Nội",
      address: "Trường Đại học Ngoại ngữ - ĐHQGHN",
      capacity: 200,
      registered: 198,
      status: "closed",
      registrationDeadline: "2026-06-20",
      fee: 400000,
    },
    {
      id: "5",
      examType: "TOPIK_II",
      date: "2026-07-14",
      location: "Hà Nội",
      address: "Trường Đại học Ngoại ngữ - ĐHQGHN",
      capacity: 200,
      registered: 195,
      status: "closed",
      registrationDeadline: "2026-06-20",
      fee: 600000,
    },
  ];

  useEffect(() => {
    setSchedules(mockSchedules);
    setLoading(false);
  }, []);

  const getFilteredSchedules = (examType?: "EPS" | "TOPIK_I" | "TOPIK_II") => {
    if (!examType) return schedules;
    return schedules.filter(s => s.examType === examType);
  };

  const getUpcomingSchedules = () => {
    return schedules.filter(s => s.status === "upcoming" || s.status === "open");
  };

  const getExamTypeLabel = (type: string) => {
    switch (type) {
      case "EPS": return "EPS-TOPIK";
      case "TOPIK_I": return "TOPIK I";
      case "TOPIK_II": return "TOPIK II";
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "upcoming": return "Sắp mở";
      case "open": return "Đang đăng ký";
      case "closed": return "Đã đóng";
      case "completed": return "Đã kết thúc";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "#94a3b8";
      case "open": return "#4ade80";
      case "closed": return "#f97316";
      case "completed": return "#64748b";
      default: return "#94a3b8";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return {
    schedules,
    loading,
    getFilteredSchedules,
    getUpcomingSchedules,
    getExamTypeLabel,
    getStatusLabel,
    getStatusColor,
    formatDate,
  };
}
