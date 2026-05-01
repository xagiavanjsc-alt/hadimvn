import { type EpsLesson } from "@/mocks/epsLessons";
import { EPS_LESSON_TOPICS, epsLessons } from "@/mocks/epsLessons";
import { useMemo } from "react";

interface TopicProgressPanelProps {
  completedLessons: Record<number, { score: number; completedAt: string }>;
  filterTopic: string;
  onFilterTopic: (topic: string) => void;
}

export default function TopicProgressPanel({ completedLessons, filterTopic, onFilterTopic }: TopicProgressPanelProps) {
  const topicStats = useMemo(() => {
    return EPS_LESSON_TOPICS.map(t => {
      const topicLessons = epsLessons.filter((l: EpsLesson) => l.topic === t.id);
      const done = topicLessons.filter((l: EpsLesson) => completedLessons[l.id]).length;
      return { ...t, total: topicLessons.length, done };
    });
  }, [completedLessons]);

  return (
    <div className="space-y-4">
      <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-4 md:p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Tiến độ theo chủ đề</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-0 lg:space-y-3">
          {topicStats.map(t => (
            <button
              key={t.id}
              onClick={() => onFilterTopic(filterTopic === t.id ? "all" : t.id)}
              className={`w-full text-left transition-all cursor-pointer rounded-lg p-2 ${filterTopic === t.id ? "bg-white/5" : "hover:bg-white/3"}`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0" style={{ backgroundColor: `${t.color}15` }}>
                  <i className={`${t.icon} text-xs`} style={{ color: t.color }}></i>
                </div>
                <p className="text-white/60 text-xs flex-1 truncate">{t.label}</p>
                <span className="text-xs font-bold" style={{ color: t.color }}>{t.done}/{t.total}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden ml-8">
                <div className="h-full rounded-full transition-all" style={{ width: `${t.total > 0 ? (t.done / t.total) * 100 : 0}%`, backgroundColor: t.color }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:block bg-[#e8c84a]/5 border border-[#e8c84a]/15 rounded-xl p-4">
        <p className="text-[#e8c84a] text-xs font-semibold mb-2">Mẹo học hiệu quả</p>
        <ul className="space-y-1.5">
          {["Học từ vựng trước, ngữ pháp sau", "Nghe và lặp lại từng câu ví dụ", "Làm bài tập ngay sau khi học", "Ôn lại bài cũ mỗi 3 ngày"].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-white/40 text-xs">
              <i className="ri-check-line text-[#e8c84a] flex-shrink-0 mt-0.5"></i>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-[#a78bfa]/5 border border-[#a78bfa]/15 rounded-xl p-4">
        <p className="text-[#a78bfa] text-xs font-semibold mb-2">Phần thưởng XP</p>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-1.5">
          {[
            { label: "Hoàn thành bài học", xp: "+30 XP" },
            { label: "Mỗi câu đúng", xp: "+10 XP" },
            { label: "Hoàn thành 10 bài", xp: "+200 XP" },
            { label: "Hoàn thành 60 bài", xp: "+1000 XP" },
          ].map((r, i) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-white/40">{r.label}</span>
              <span className="text-[#a78bfa] font-bold">{r.xp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
