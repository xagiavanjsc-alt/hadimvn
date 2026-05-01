import { type EpsLesson } from "@/mocks/epsLessons";
import { EPS_LESSON_TOPICS } from "@/mocks/epsLessons";
import { stripLessonPrefix, LEVEL_LABELS } from "./LessonHelpers";

interface LessonCardProps {
  lesson: EpsLesson;
  isCompleted: boolean;
  score?: number;
  onClick: () => void;
}

export default function LessonCard({ lesson, isCompleted, score, onClick }: LessonCardProps) {
  const topicInfo = EPS_LESSON_TOPICS.find(t => t.id === lesson.topic);
  const levelInfo = LEVEL_LABELS[lesson.level];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 md:p-4 rounded-xl border transition-all cursor-pointer group ${isCompleted ? "border-emerald-500/20 bg-emerald-500/3 hover:border-emerald-500/35" : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4"}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-xl flex-shrink-0 text-xs md:text-sm font-bold ${isCompleted ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/30"}`}>
          {isCompleted ? <i className="ri-checkbox-circle-fill text-sm md:text-base"></i> : lesson.id}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isCompleted ? "text-white/80" : "text-white/70"} group-hover:text-white transition-colors`}>
            {stripLessonPrefix(lesson.titleVi)}
          </p>
          <p className="hidden sm:block text-white/30 text-xs truncate mt-0.5">{lesson.title}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${topicInfo?.color}15`, color: topicInfo?.color }}>
              {topicInfo?.label}
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${levelInfo.color}15`, color: levelInfo.color }}>
              {levelInfo.label}
            </span>
            <span className="hidden sm:flex text-[9px] text-white/25 items-center gap-0.5">
              <i className="ri-time-line"></i>{lesson.estimatedMinutes}p
            </span>
            {isCompleted && score !== undefined && (
              <span className="text-[9px] text-emerald-400 font-bold">{score}/{lesson.exercises.length} đúng</span>
            )}
          </div>
        </div>
        <i className="ri-arrow-right-s-line text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0"></i>
      </div>
    </button>
  );
}
