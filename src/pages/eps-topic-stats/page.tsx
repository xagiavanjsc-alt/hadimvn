import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsLessons, EPS_LESSON_TOPICS } from "@/mocks/epsLessons";

interface LessonProgress {
  score: number;
  completedAt: string;
}

interface WrongEntry {
  count: number;
  lastWrong: string;
}

export default function EpsTopicStatsPage() {
  const navigate = useNavigate();
  const [completedLessons] = useLocalStorage<Record<number, LessonProgress>>("kts_eps_lessons_progress", {});
  const [wrongHistory] = useLocalStorage<Record<string, WrongEntry>>("kts_eps_wrong_history", {});
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Build per-topic stats
  const topicStats = useMemo(() => {
    return EPS_LESSON_TOPICS.map(topic => {
      const topicLessons = epsLessons.filter(l => l.topic === topic.id);
      const completedTopicLessons = topicLessons.filter(l => completedLessons[l.id]);

      // Total vocab in topic
      const totalVocab = topicLessons.reduce((sum, l) => sum + l.vocabulary.length, 0);

      // Vocab studied = vocab from completed lessons
      const studiedVocab = completedTopicLessons.reduce((sum, l) => sum + l.vocabulary.length, 0);

      // Wrong words in this topic
      const topicVocabSet = new Set<string>();
      topicLessons.forEach(l => l.vocabulary.forEach(v => topicVocabSet.add(v.korean)));
      const wrongInTopic = Object.entries(wrongHistory).filter(([k]) => topicVocabSet.has(k));
      const totalWrong = wrongInTopic.length;
      const totalWrongCount = wrongInTopic.reduce((sum, [, v]) => sum + v.count, 0);

      // Accuracy: based on exercises
      let totalExercises = 0;
      let totalCorrect = 0;
      completedTopicLessons.forEach(l => {
        const prog = completedLessons[l.id];
        if (prog && l.exercises.length > 0) {
          totalExercises += l.exercises.length;
          totalCorrect += prog.score;
        }
      });
      const accuracy = totalExercises > 0 ? Math.round((totalCorrect / totalExercises) * 100) : null;

      // Study time estimate (estimatedMinutes from completed lessons)
      const totalMinutes = completedTopicLessons.reduce((sum, l) => sum + (l.estimatedMinutes || 20), 0);

      // Last studied
      const lastStudied = completedTopicLessons
        .map(l => completedLessons[l.id]?.completedAt)
        .filter(Boolean)
        .sort()
        .reverse()[0] || null;

      // Completion rate
      const completionRate = topicLessons.length > 0
        ? Math.round((completedTopicLessons.length / topicLessons.length) * 100)
        : 0;

      return {
        ...topic,
        totalLessons: topicLessons.length,
        completedLessons: completedTopicLessons.length,
        completionRate,
        totalVocab,
        studiedVocab,
        totalWrong,
        totalWrongCount,
        accuracy,
        totalMinutes,
        lastStudied,
        lessons: topicLessons,
      };
    });
  }, [completedLessons, wrongHistory]);

  const overallStats = useMemo(() => {
    const totalLessons = epsLessons.length;
    const completedCount = Object.keys(completedLessons).length;
    const totalVocab = epsLessons.reduce((sum, l) => sum + l.vocabulary.length, 0);
    const studiedVocab = epsLessons
      .filter(l => completedLessons[l.id])
      .reduce((sum, l) => sum + l.vocabulary.length, 0);
    const totalWrong = Object.keys(wrongHistory).length;
    const totalMinutes = epsLessons
      .filter(l => completedLessons[l.id])
      .reduce((sum, l) => sum + (l.estimatedMinutes || 20), 0);

    let totalEx = 0;
    let totalCor = 0;
    epsLessons.forEach(l => {
      const prog = completedLessons[l.id];
      if (prog && l.exercises.length > 0) {
        totalEx += l.exercises.length;
        totalCor += prog.score;
      }
    });
    const overallAccuracy = totalEx > 0 ? Math.round((totalCor / totalEx) * 100) : null;

    return { totalLessons, completedCount, totalVocab, studiedVocab, totalWrong, totalMinutes, overallAccuracy };
  }, [completedLessons, wrongHistory]);

  const selectedTopicData = selectedTopic ? topicStats.find(t => t.id === selectedTopic) : null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins} phút`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}g ${m}p` : `${h} giờ`;
  };

  return (
    <DashboardLayout
      title="Thống kê theo chủ đề EPS"
      subtitle="Xem chi tiết tiến độ, tỷ lệ đúng và thời gian học từng chủ đề"
    >
      {/* Overall summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Bài đã học", value: `${overallStats.completedCount}/${overallStats.totalLessons}`, icon: "ri-book-open-line", color: "#e8c84a" },
          { label: "Từ đã học", value: `${overallStats.studiedVocab}`, icon: "ri-translate-2", color: "#34d399" },
          { label: "Tỷ lệ đúng", value: overallStats.overallAccuracy !== null ? `${overallStats.overallAccuracy}%` : "—", icon: "ri-pie-chart-2-line", color: "#a78bfa" },
          { label: "Thời gian học", value: formatMinutes(overallStats.totalMinutes), icon: "ri-time-line", color: "#fb923c" },
        ].map(s => (
          <div key={s.label} className="bg-[#0f1117] border border-white/5 rounded-xl p-3 md:p-4 flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">{s.value}</p>
              <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Left: Topic grid */}
        <div>
          <h2 className="text-white font-semibold text-sm mb-4">Chi tiết từng chủ đề</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topicStats.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedTopic === topic.id
                    ? "border-[#e8c84a]/40 bg-[#e8c84a]/5"
                    : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4"
                }`}
              >
                {/* Topic header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${topic.color}20` }}>
                    <i className={`${topic.icon} text-base`} style={{ color: topic.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-semibold truncate">{topic.label}</p>
                    <p className="text-white/35 text-xs">{topic.completedLessons}/{topic.totalLessons} bài</p>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${topic.color}15`, color: topic.color }}
                  >
                    {topic.completionRate}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${topic.completionRate}%`, backgroundColor: topic.color }}
                  />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-white/70 text-sm font-bold">{topic.studiedVocab}</p>
                    <p className="text-white/30 text-[10px]">Từ đã học</p>
                  </div>
                  <div className="text-center border-x border-white/5">
                    <p className={`text-sm font-bold ${topic.accuracy !== null ? (topic.accuracy >= 80 ? "text-emerald-400" : topic.accuracy >= 60 ? "text-[#e8c84a]" : "text-red-400") : "text-white/30"}`}>
                      {topic.accuracy !== null ? `${topic.accuracy}%` : "—"}
                    </p>
                    <p className="text-white/30 text-[10px]">Tỷ lệ đúng</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-bold ${topic.totalWrong > 0 ? "text-red-400" : "text-white/30"}`}>
                      {topic.totalWrong > 0 ? topic.totalWrong : "—"}
                    </p>
                    <p className="text-white/30 text-[10px]">Từ sai</p>
                  </div>
                </div>

                {/* Time + last studied */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                  <span className="text-white/30 text-[10px] flex items-center gap-1">
                    <i className="ri-time-line"></i>
                    {topic.totalMinutes > 0 ? formatMinutes(topic.totalMinutes) : "Chưa học"}
                  </span>
                  {topic.lastStudied && (
                    <span className="text-white/25 text-[10px]">
                      {formatDate(topic.lastStudied)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Detail panel */}
        <div className="space-y-4">
          {selectedTopicData ? (
            <>
              {/* Topic detail header */}
              <div className="bg-[#0f1117] border border-white/8 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedTopicData.color}20` }}>
                    <i className={`${selectedTopicData.icon} text-xl`} style={{ color: selectedTopicData.color }}></i>
                  </div>
                  <div>
                    <p className="text-white font-bold">{selectedTopicData.label}</p>
                    <p className="text-white/40 text-xs">{selectedTopicData.totalLessons} bài học · {selectedTopicData.totalVocab} từ vựng</p>
                  </div>
                </div>

                {/* Detailed stats */}
                <div className="space-y-3">
                  {[
                    { label: "Bài đã hoàn thành", value: `${selectedTopicData.completedLessons}/${selectedTopicData.totalLessons}`, icon: "ri-checkbox-circle-line", color: "#34d399" },
                    { label: "Từ vựng đã học", value: `${selectedTopicData.studiedVocab}/${selectedTopicData.totalVocab}`, icon: "ri-translate-2", color: "#e8c84a" },
                    { label: "Tỷ lệ đúng bài tập", value: selectedTopicData.accuracy !== null ? `${selectedTopicData.accuracy}%` : "Chưa có dữ liệu", icon: "ri-pie-chart-2-line", color: "#a78bfa" },
                    { label: "Từ cần ôn lại", value: selectedTopicData.totalWrong > 0 ? `${selectedTopicData.totalWrong} từ (${selectedTopicData.totalWrongCount} lần sai)` : "Không có", icon: "ri-error-warning-line", color: "#f87171" },
                    { label: "Thời gian đã học", value: selectedTopicData.totalMinutes > 0 ? formatMinutes(selectedTopicData.totalMinutes) : "Chưa học", icon: "ri-time-line", color: "#fb923c" },
                    { label: "Học lần cuối", value: selectedTopicData.lastStudied ? formatDate(selectedTopicData.lastStudied) : "Chưa học", icon: "ri-calendar-line", color: "#38bdf8" },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-white/3">
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
                        <i className={`${stat.icon} text-xs`} style={{ color: stat.color }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/40 text-xs">{stat.label}</p>
                        <p className="text-white/80 text-sm font-semibold">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate("/eps-lessons")}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/3 text-white/60 text-xs font-semibold hover:bg-white/6 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-book-open-line mr-1"></i>Học bài
                  </button>
                  {selectedTopicData.totalWrong > 0 && (
                    <button
                      onClick={() => navigate("/eps-wrong-topic")}
                      className="flex-1 py-2.5 rounded-xl border border-red-500/25 bg-red-500/5 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-refresh-line mr-1"></i>Ôn từ sai
                    </button>
                  )}
                </div>
              </div>

              {/* Lesson list in topic */}
              <div className="bg-[#0f1117] border border-white/8 rounded-2xl p-4">
                <p className="text-white/50 text-xs font-semibold mb-3">Danh sách bài học</p>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {selectedTopicData.lessons.map(lesson => {
                    const prog = completedLessons[lesson.id];
                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg ${prog ? "bg-emerald-500/5" : "bg-white/2"}`}
                      >
                        <div className={`w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0 text-xs font-bold ${prog ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/25"}`}>
                          {prog ? <i className="ri-check-line text-xs"></i> : lesson.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/70 text-xs font-medium truncate">
                            Bài {lesson.id}: {lesson.titleVi.replace(/^Bài\s+\d+[:\s]+/i, "")}
                          </p>
                          {prog && (
                            <p className="text-emerald-400/60 text-[10px]">
                              {prog.score}/{lesson.exercises.length} đúng
                            </p>
                          )}
                        </div>
                        <span className="text-white/20 text-[10px] flex-shrink-0">{lesson.estimatedMinutes}p</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Default: overall chart */
            <div className="bg-[#0f1117] border border-white/8 rounded-2xl p-5">
              <p className="text-white/50 text-xs font-semibold mb-4">Tổng quan tất cả chủ đề</p>

              {/* Completion chart */}
              <div className="space-y-3">
                {topicStats.map(topic => (
                  <div key={topic.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0" style={{ backgroundColor: `${topic.color}20` }}>
                          <i className={`${topic.icon} text-[10px]`} style={{ color: topic.color }}></i>
                        </div>
                        <p className="text-white/60 text-xs truncate max-w-[120px]">{topic.label}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {topic.accuracy !== null && (
                          <span className={`text-[10px] font-bold ${topic.accuracy >= 80 ? "text-emerald-400" : topic.accuracy >= 60 ? "text-[#e8c84a]" : "text-red-400"}`}>
                            {topic.accuracy}%
                          </span>
                        )}
                        <span className="text-white/30 text-[10px]">{topic.completedLessons}/{topic.totalLessons}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${topic.completionRate}%`, backgroundColor: topic.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-white/25 text-xs text-center mt-4">Nhấn vào chủ đề bên trái để xem chi tiết</p>
            </div>
          )}

          {/* Quick actions */}
          <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-2">
            <p className="text-white/40 text-xs mb-2">Hành động nhanh</p>
            {[
              { icon: "ri-book-open-line", label: "60 Bài học EPS", path: "/eps-lessons" },
              { icon: "ri-bookmark-3-line", label: "Học theo chủ đề", path: "/eps-topic-study" },
              { icon: "ri-error-warning-line", label: "Ôn tập sai theo chủ đề", path: "/eps-wrong-topic" },
              { icon: "ri-bar-chart-2-line", label: "Thống kê EPS tổng hợp", path: "/eps-stats" },
            ].map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="w-full flex items-center gap-2 text-white/50 hover:text-white/80 text-xs py-1.5 cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className={`${link.icon} text-sm`}></i>
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

