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
    return m > 0 ? `${h}g ${m}p` : `${h} gi?`;
  };

  return (
    <DashboardLayout
      title="Th?ng kê theo ch? d? EPS"
      subtitle="Xem chi ti?t ti?n d?, t? l? dúng và th?i gian h?c t?ng ch? d?"
    >
      {/* Overall summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Bài dã h?c", value: `${overallStats.completedCount}/${overallStats.totalLessons}`, icon: "ri-book-open-line", color: "app-accent-primary" },
          { label: "T? dã h?c", value: `${overallStats.studiedVocab}`, icon: "ri-translate-2", color: "#34d399" },
          { label: "T? l? dúng", value: overallStats.overallAccuracy !== null ? `${overallStats.overallAccuracy}%` : "—", icon: "ri-pie-chart-2-line", color: "#a78bfa" },
          { label: "Th?i gian h?c", value: formatMinutes(overallStats.totalMinutes), icon: "ri-time-line", color: "#fb923c" },
        ].map(s => (
          <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-3 md:p-4 flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-base`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">{s.value}</p>
              <p className="text-app-text-secondary text-xs mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Left: Topic grid */}
        <div>
          <h2 className="text-white font-semibold text-sm mb-4">Chi ti?t t?ng ch? d?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topicStats.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedTopic === topic.id
                    ? "border-app-accent-primary/40 bg-app-accent-primary/5"
                    : "border-app-border bg-white/2 hover:border-white/15 hover:bg-white/4"
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
                <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${topic.completionRate}%`, backgroundColor: topic.color }}
                  />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-white/70 text-sm font-bold">{topic.studiedVocab}</p>
                    <p className="text-app-text-muted text-[10px]">T? dã h?c</p>
                  </div>
                  <div className="text-center border-x border-app-border">
                    <p className={`text-sm font-bold ${topic.accuracy !== null ? (topic.accuracy >= 80 ? "text-app-accent-success" : topic.accuracy >= 60 ? "text-app-accent-primary" : "text-red-400") : "text-app-text-muted"}`}>
                      {topic.accuracy !== null ? `${topic.accuracy}%` : "—"}
                    </p>
                    <p className="text-app-text-muted text-[10px]">T? l? dúng</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-bold ${topic.totalWrong > 0 ? "text-red-400" : "text-app-text-muted"}`}>
                      {topic.totalWrong > 0 ? topic.totalWrong : "—"}
                    </p>
                    <p className="text-app-text-muted text-[10px]">T? sai</p>
                  </div>
                </div>

                {/* Time + last studied */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-app-border">
                  <span className="text-app-text-muted text-[10px] flex items-center gap-1">
                    <i className="ri-time-line"></i>
                    {topic.totalMinutes > 0 ? formatMinutes(topic.totalMinutes) : "Chua h?c"}
                  </span>
                  {topic.lastStudied && (
                    <span className="text-app-text-muted text-[10px]">
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
              <div className="bg-app-bg border border-app-border rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedTopicData.color}20` }}>
                    <i className={`${selectedTopicData.icon} text-xl`} style={{ color: selectedTopicData.color }}></i>
                  </div>
                  <div>
                    <p className="text-white font-bold">{selectedTopicData.label}</p>
                    <p className="text-app-text-secondary text-xs">{selectedTopicData.totalLessons} bài h?c · {selectedTopicData.totalVocab} t? v?ng</p>
                  </div>
                </div>

                {/* Detailed stats */}
                <div className="space-y-3">
                  {[
                    { label: "Bài dã hoàn thành", value: `${selectedTopicData.completedLessons}/${selectedTopicData.totalLessons}`, icon: "ri-checkbox-circle-line", color: "#34d399" },
                    { label: "T? v?ng dã h?c", value: `${selectedTopicData.studiedVocab}/${selectedTopicData.totalVocab}`, icon: "ri-translate-2", color: "app-accent-primary" },
                    { label: "T? l? dúng bài t?p", value: selectedTopicData.accuracy !== null ? `${selectedTopicData.accuracy}%` : "Chua có d? li?u", icon: "ri-pie-chart-2-line", color: "#a78bfa" },
                    { label: "T? c?n ôn l?i", value: selectedTopicData.totalWrong > 0 ? `${selectedTopicData.totalWrong} t? (${selectedTopicData.totalWrongCount} l?n sai)` : "Không có", icon: "ri-error-warning-line", color: "#f87171" },
                    { label: "Th?i gian dã h?c", value: selectedTopicData.totalMinutes > 0 ? formatMinutes(selectedTopicData.totalMinutes) : "Chua h?c", icon: "ri-time-line", color: "#fb923c" },
                    { label: "H?c l?n cu?i", value: selectedTopicData.lastStudied ? formatDate(selectedTopicData.lastStudied) : "Chua h?c", icon: "ri-calendar-line", color: "#38bdf8" },
                  ].map(stat => (
                    <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-app-surface/50">
                      <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${stat.color}15` }}>
                        <i className={`${stat.icon} text-xs`} style={{ color: stat.color }}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-app-text-secondary text-xs">{stat.label}</p>
                        <p className="text-white/80 text-sm font-semibold">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate("/eps-lessons")}
                    className="flex-1 py-2.5 rounded-xl border border-app-border bg-app-surface/50 text-white/60 text-xs font-semibold hover:bg-white/6 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-book-open-line mr-1"></i>H?c bài
                  </button>
                  {selectedTopicData.totalWrong > 0 && (
                    <button
                      onClick={() => navigate("/eps-wrong-topic")}
                      className="flex-1 py-2.5 rounded-xl border border-red-500/25 bg-red-500/5 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-refresh-line mr-1"></i>Ôn t? sai
                    </button>
                  )}
                </div>
              </div>

              {/* Lesson list in topic */}
              <div className="bg-app-bg border border-app-border rounded-2xl p-4">
                <p className="text-white/50 text-xs font-semibold mb-3">Danh sách bài h?c</p>
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {selectedTopicData.lessons.map(lesson => {
                    const prog = completedLessons[lesson.id];
                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center gap-3 p-2.5 rounded-lg ${prog ? "bg-emerald-500/5" : "bg-white/2"}`}
                      >
                        <div className={`w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0 text-xs font-bold ${prog ? "bg-app-accent-success/15 text-app-accent-success" : "bg-app-card/50 text-app-text-muted"}`}>
                          {prog ? <i className="ri-check-line text-xs"></i> : lesson.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/70 text-xs font-medium truncate">
                            Bài {lesson.id}: {lesson.titleVi.replace(/^Bài\s+\d+[:\s]+/i, "")}
                          </p>
                          {prog && (
                            <p className="text-app-accent-success/60 text-[10px]">
                              {prog.score}/{lesson.exercises.length} dúng
                            </p>
                          )}
                        </div>
                        <span className="text-app-text-muted text-[10px] flex-shrink-0">{lesson.estimatedMinutes}p</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Default: overall chart */
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <p className="text-white/50 text-xs font-semibold mb-4">T?ng quan t?t c? ch? d?</p>

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
                          <span className={`text-[10px] font-bold ${topic.accuracy >= 80 ? "text-app-accent-success" : topic.accuracy >= 60 ? "text-app-accent-primary" : "text-red-400"}`}>
                            {topic.accuracy}%
                          </span>
                        )}
                        <span className="text-app-text-muted text-[10px]">{topic.completedLessons}/{topic.totalLessons}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-app-card/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${topic.completionRate}%`, backgroundColor: topic.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-app-text-muted text-xs text-center mt-4">Nh?n vào ch? d? bên trái d? xem chi ti?t</p>
            </div>
          )}

          {/* Quick actions */}
          <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 space-y-2">
            <p className="text-app-text-secondary text-xs mb-2">Hành d?ng nhanh</p>
            {[
              { icon: "ri-book-open-line", label: "60 Bài h?c EPS", path: "/eps-lessons" },
              { icon: "ri-bookmark-3-line", label: "H?c theo ch? d?", path: "/eps-topic-study" },
              { icon: "ri-error-warning-line", label: "Ôn t?p sai theo ch? d?", path: "/eps-wrong-topic" },
              { icon: "ri-bar-chart-2-line", label: "Th?ng kê EPS t?ng h?p", path: "/eps-stats" },
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

