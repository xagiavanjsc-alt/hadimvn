import { useNavigate } from "react-router-dom";
import { lazy, Suspense, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import AdBanner from "@/components/feature/AdBanner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useApiCostTracker } from "@/hooks/useApiCostTracker";
import { epsQuestions } from "@/mocks/epsQuestions";
import QuickStartGuide from "@/pages/home/components/QuickStartGuide";
import { useIsAdmin } from "@/hooks/useIsAdmin";

const SRReviewWidget = lazy(() => import("@/pages/home/components/SRReviewWidget"));
const StreakWidget = lazy(() => import("@/pages/home/components/StreakWidget"));
const SeoulStreakBanner = lazy(() => import("@/pages/home/components/SeoulStreakBanner"));
const DailyVocabWidget = lazy(() => import("@/pages/home/components/DailyVocabWidget"));

function WidgetSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-app-bg border border-app-border rounded-2xl p-4 animate-pulse ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-app-card/50" />
        <div className="w-24 h-3 rounded bg-app-card/50" />
      </div>
      <div className="space-y-2">
        <div className="h-8 rounded-lg bg-app-surface/50" />
        <div className="h-8 rounded-lg bg-app-surface/50" />
      </div>
    </div>
  );
}

interface ApprovedLesson {
  song: { rank: number; title: string; artist: string; genre: string };
  story: string;
  vocabulary: { word: string; meaning: string; example: string }[];
  explanation: string;
  approvedAt: string;
  stars?: number;
}

interface ApprovedQA {
  question: { id: string; questionKr: string; category: string; views: number };
  translatedQuestion: string;
  rewrittenAnswer: string;
  hashtags: string[];
  approvedAt: string;
}

interface CachedSearch {
  keyword: string;
  questions: { id: string; processed?: boolean }[];
  fetchedAt: string;
}

// ─── Quick action card ────────────────────────────────────────────────────────
function QuickCard({
  icon,
  label,
  desc,
  color,
  path,
  badge,
}: {
  icon: string;
  label: string;
  desc: string;
  color: string;
  path: string;
  badge?: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] text-left group"
      style={{ backgroundColor: `${color}08`, borderColor: `${color}20` }}
    >
      <div
        className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl flex-shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <i className={`${icon} text-base sm:text-base`} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-white/80 text-xs sm:text-sm font-semibold group-hover:text-white transition-colors">
            {label}
          </p>
          {badge && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-app-text-muted text-[10px] sm:text-[11px] mt-0.5 leading-relaxed line-clamp-1">{desc}</p>
      </div>
    </button>
  );
}

// ─── Stat mini card ───────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub: string;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-3 sm:p-4 border border-app-border"
      style={{ backgroundColor: "#0f1117" }}
    >
      <div
        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl mb-2 sm:mb-3"
        style={{ backgroundColor: `${color}15` }}
      >
        <i className={`${icon} text-xs sm:text-sm`} style={{ color }} />
      </div>
      <p className="text-lg sm:text-xl font-bold text-white">{value}</p>
      <p className="text-app-text-secondary text-[11px] sm:text-xs mt-0.5">{label}</p>
      <p className="text-app-text-muted text-[10px] mt-0.5 hidden sm:block">{sub}</p>
    </div>
  );
}

// ─── Tool row card ────────────────────────────────────────────────────────────
function ToolRow({
  icon,
  color,
  title,
  desc,
  stat,
  path,
  draftMode,
}: {
  icon: string;
  color: string;
  title: string;
  desc: string;
  stat: string;
  path: string;
  draftMode?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(path)}
      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border cursor-pointer hover:bg-app-surface/50 transition-all group"
      style={{ borderColor: `${color}18` }}
    >
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <i className={`${icon} text-base sm:text-lg`} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold text-xs sm:text-sm">{title}</h3>
          {draftMode && (
            <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-bold">
              Chế độ nháp
            </span>
          )}
        </div>
        <p className="text-app-text-muted text-[10px] sm:text-xs line-clamp-1">{desc}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium whitespace-nowrap"
          style={{ backgroundColor: `${color}12`, color }}
        >
          {stat}
        </span>
        <i
          className="ri-arrow-right-line text-xs sm:text-sm group-hover:translate-x-0.5 transition-transform"
          style={{ color: `${color}80` }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const [approvedLessons] = useLocalStorage<ApprovedLesson[]>("kts_melon_lessons", []);
  const [approvedQAs] = useLocalStorage<ApprovedQA[]>("kts_naver_qas", []);
  const [cachedSearches] = useLocalStorage<CachedSearch[]>("kts_naver_cache", []);
  const { getSummary } = useApiCostTracker();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _cost = getSummary();

  const [streak] = useLocalStorage<{ count: number; lastDate: string; history: string[] }>(
    "kts_streak",
    { count: 0, lastDate: "", history: [] }
  );
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [flashcardKnown] = useLocalStorage<Record<string, boolean>>("kts_flashcard_known", {});
  const [examResults] = useLocalStorage<{ score: number; total: number; date: string }[]>(
    "kts_eps_exam_results",
    []
  );
  const [learnedIds] = useLocalStorage<Record<string, string[]>>("kts_daily_learned", {});

  // Draft mode settings from admin
  const [melonDraftMode] = useLocalStorage<boolean>("kts_melon_draft_mode", false);
  const [naverDraftMode] = useLocalStorage<boolean>("kts_naver_draft_mode", false);

  const melonStats = useMemo(() => {
    const cutoff = Date.now() - 7 * 86400000;
    const recentCount = approvedLessons.filter(
      (l) => new Date(l.approvedAt).getTime() > cutoff
    ).length;
    const avgVocab =
      approvedLessons.length > 0
        ? Math.round(
            approvedLessons.reduce((sum, l) => sum + l.vocabulary.length, 0) /
              approvedLessons.length
          )
        : 0;
    return { total: approvedLessons.length, recentCount, avgVocab };
  }, [approvedLessons]);

  const naverStats = useMemo(() => {
    const totalScanned = cachedSearches.reduce((sum, c) => sum + c.questions.length, 0);
    const cutoff = Date.now() - 7 * 86400000;
    const recentCount = approvedQAs.filter(
      (qa) => new Date(qa.approvedAt).getTime() > cutoff
    ).length;
    const overallRate =
      totalScanned > 0 ? Math.round((approvedQAs.length / totalScanned) * 100) : 0;
    return { total: approvedQAs.length, recentCount, overallRate };
  }, [approvedQAs, cachedSearches]);

  const epsDone = Object.keys(answeredMap).length;
  const epsCorrect = epsQuestions.filter((q) => answeredMap[q.id] === q.correctIndex).length;
  const epsAccuracy = epsDone > 0 ? Math.round((epsCorrect / epsDone) * 100) : 0;
  const knownCount = Object.values(flashcardKnown).filter(Boolean).length;
  const bestExamPct =
    examResults.length > 0
      ? Math.max(...examResults.map((r) => Math.round((r.score / r.total) * 100)))
      : 0;

  const today = new Date().toISOString().split("T")[0];
  const todayLearned = learnedIds[today] || [];
  const totalDailyWords = Object.values(learnedIds).reduce((s, arr) => s + arr.length, 0);

  const todaySuggestions = useMemo(() => {
    const suggestions = [];
    if (epsDone < 10)
      suggestions.push({
        icon: "ri-file-list-3-line",
        color: "#4ade80",
        label: "Làm 5 câu EPS-TOPIK",
        path: "/eps",
        desc: "Chưa làm nhiều — bắt đầu ngay!",
      });
    if (knownCount < 20)
      suggestions.push({
        icon: "ri-stack-line",
        color: "#a78bfa",
        label: "Ôn 10 flashcard",
        path: "/flashcard-hub",
        desc: "Tăng vốn từ vựng mỗi ngày",
      });
    suggestions.push({
      icon: "ri-sun-line",
      color: "app-accent-primary",
      label: "Học từ mới hôm nay",
      path: "/daily-words",
      desc: `${todayLearned.length}/8 từ đã học`,
    });
    if (examResults.length === 0)
      suggestions.push({
        icon: "ri-timer-line",
        color: "#fb923c",
        label: "Thi thử EPS (40 câu)",
        path: "/eps-exam",
        desc: "Kiểm tra trình độ của bạn",
      });
    return suggestions.slice(0, 3);
  }, [epsDone, knownCount, examResults, todayLearned]);

  return (
    <DashboardLayout title="Trang chủ" subtitle="Hàn Quốc Ơi! — Học tiếng Hàn hiệu quả">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-3 sm:space-y-5">

        {/* ── Streak + SR widgets ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 space-y-3">
            <Suspense fallback={<WidgetSkeleton />}>
              <StreakWidget />
            </Suspense>
            <Suspense fallback={<WidgetSkeleton />}>
              <SeoulStreakBanner />
            </Suspense>
          </div>
          <div className="hidden md:block">
            <Suspense fallback={<WidgetSkeleton className="h-full" />}>
              <SRReviewWidget />
            </Suspense>
          </div>
        </div>
        {/* SR widget on mobile — below streak */}
        <div className="md:hidden">
          <Suspense fallback={<WidgetSkeleton />}>
            <SRReviewWidget />
          </Suspense>
        </div>

        {/* ── Ad banner top ── */}
        <AdBanner position="top" />

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <StatCard
            icon="ri-fire-line"
            color="#fb923c"
            label="Streak"
            value={`${streak.count}🔥`}
            sub="ngày liên tiếp"
          />
          <StatCard
            icon="ri-book-open-line"
            color="app-accent-primary"
            label="Từ đã học"
            value={totalDailyWords}
            sub={`${todayLearned.length}/8 hôm nay`}
          />
          <StatCard
            icon="ri-file-list-3-line"
            color="#4ade80"
            label="EPS chính xác"
            value={`${epsAccuracy}%`}
            sub={`${epsDone} câu đã làm`}
          />
          <StatCard
            icon="ri-trophy-line"
            color="#a78bfa"
            label="Điểm thi cao nhất"
            value={bestExamPct > 0 ? `${bestExamPct}%` : "—"}
            sub={`${knownCount} từ thuộc lòng`}
          />
        </div>

        {/* ── Quick actions ── */}
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h2 className="text-white/60 text-xs font-semibold tracking-normal">
              Bắt đầu học ngay
            </h2>
            <button
              onClick={() => navigate("/learning-roadmap")}
              className="text-app-accent-primary text-xs hover:text-[#d4b43a] cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              Lộ trình <i className="ri-arrow-right-line" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <QuickCard
              icon="ri-sun-line"
              color="app-accent-primary"
              label="Từ mới hôm nay"
              desc={`${todayLearned.length}/8 từ đã học`}
              path="/daily-words"
              badge={todayLearned.length === 8 ? "Xong!" : "Hôm nay"}
            />
            <QuickCard
              icon="ri-stack-line"
              color="#a78bfa"
              label="Thẻ ghi nhớ"
              desc="Chọn bộ thẻ để ôn tập"
              path="/flashcard-hub"
            />
            <QuickCard
              icon="ri-timer-line"
              color="#4ade80"
              label="Thi thử EPS"
              desc="40 câu mô phỏng thật"
              path="/eps-exam"
              badge={bestExamPct > 0 ? `${bestExamPct}%` : undefined}
            />
            <QuickCard
              icon="ri-route-line"
              color="#fb923c"
              label="Lộ trình học"
              desc="Cá nhân hóa theo mục tiêu"
              path="/learning-roadmap"
            />
          </div>
        </div>

        {/* ── Today suggestions + Quick start ── */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Suggestions */}
          <div className="flex-1 bg-app-bg border border-app-border rounded-2xl p-3 sm:p-4">
            <p className="text-app-text-secondary text-xs font-semibold tracking-normal mb-2 sm:mb-3">
              Gợi ý cho bạn hôm nay
            </p>
            <div className="space-y-1.5 sm:space-y-2">
              {todaySuggestions.map((s) => (
                <button
                  key={s.path}
                  onClick={() => navigate(s.path)}
                  className="w-full flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-app-surface/50 hover:bg-white/6 transition-colors cursor-pointer text-left"
                >
                  <div
                    className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${s.color}15` }}
                  >
                    <i className={`${s.icon} text-xs sm:text-sm`} style={{ color: s.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-[11px] sm:text-xs font-medium truncate">{s.label}</p>
                    <p className="text-app-text-muted text-[9px] sm:text-[10px] truncate">{s.desc}</p>
                  </div>
                  <i className="ri-arrow-right-line text-app-text-muted text-[10px] sm:text-xs flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick start guide */}
          <div className="w-full md:w-72">
            <QuickStartGuide />
          </div>
        </div>

        {/* ── Ad banner between content ── */}
        <AdBanner position="between-content" />

        {/* ── Main tools ── */}
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h2 className="text-white/60 text-xs font-semibold tracking-normal">
              Công cụ chính
            </h2>
            <button
              onClick={() => navigate("/study-stats")}
              className="text-app-text-muted text-xs hover:text-white/50 cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              Xem thống kê <i className="ri-arrow-right-line" />
            </button>
          </div>
          <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden divide-y divide-white/5">
            <ToolRow
              icon="ri-music-2-line"
              color="app-accent-primary"
              title="K-pop Lesson"
              desc="Melon Top 100 → AI → Excel"
              stat={`${melonStats.total} bài · TB ${melonStats.avgVocab} từ/bài`}
              path="/melon"
              draftMode={melonDraftMode}
            />
            <ToolRow
              icon="ri-question-answer-line"
              color="#38bdf8"
              title="Naver KiN"
              desc="Câu hỏi thực tế → AI → Excel"
              stat={`${naverStats.total} Q&A · ${naverStats.overallRate}% xử lý`}
              path="/naver"
              draftMode={naverDraftMode}
            />
            <ToolRow
              icon="ri-book-2-line"
              color="#a78bfa"
              title="Ebook Builder"
              desc="Gom bài chọn lọc → Xuất PDF"
              stat={`${approvedLessons.filter((l) => (l.stars ?? 0) >= 4).length} bài 4-5 sao`}
              path="/ebook"
            />
            <ToolRow
              icon="ri-bar-chart-2-line"
              color="#4ade80"
              title="Thống kê học tập"
              desc="Streak, từ đã học, so sánh tuần"
              stat={`${streak.count} ngày streak`}
              path="/study-stats"
            />
            {isAdmin && (
              <ToolRow
                icon="ri-upload-cloud-2-line"
                color="#fb923c"
                title="Tải lên dữ liệu (Admin)"
                desc="Nhập bài học K-pop và Naver từ CSV"
                stat="K-pop · Naver KiN"
                path="/data-upload"
              />
            )}
          </div>
        </div>

        {/* ── Learning paths ── */}
        <div>
          <h2 className="text-white/60 text-xs font-semibold tracking-normal mb-2 sm:mb-3">
            Lộ trình học
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {[
              {
                icon: "ri-file-list-3-line",
                color: "#4ade80",
                label: "EPS-TOPIK",
                desc: "Lao động Hàn Quốc",
                path: "/eps-lessons",
                sub: "60 bài học",
              },
              {
                icon: "ri-book-3-line",
                color: "#60a5fa",
                label: "Seoul",
                desc: "Du học Hàn Quốc",
                path: "/seoul-textbook",
                sub: "Giáo trình 1A–4B",
              },
              {
                icon: "ri-survey-line",
                color: "#f472b6",
                label: "TOPIK",
                desc: "Chứng chỉ tiếng Hàn",
                path: "/topik-test",
                sub: "TOPIK I & II",
              },
              {
                icon: "ri-character-recognition-line",
                color: "app-accent-primary",
                label: "Hán Hàn VIP",
                desc: "2.691 từ Hán Hàn",
                path: "/hanja-detail",
                sub: "Từ điển chuyên sâu",
              },
            ].map((p) => (
              <button
                key={p.path}
                onClick={() => navigate(p.path)}
                className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border cursor-pointer hover:bg-app-surface/50 transition-all text-left group"
                style={{ borderColor: `${p.color}20`, backgroundColor: `${p.color}06` }}
              >
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ backgroundColor: `${p.color}18` }}
                >
                  <i className={`${p.icon} text-sm sm:text-base`} style={{ color: p.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-xs sm:text-sm font-semibold group-hover:text-white transition-colors">
                    {p.label}
                  </p>
                  <p className="text-app-text-muted text-[10px] sm:text-[11px] hidden sm:block">{p.desc}</p>
                  <p className="text-[9px] sm:text-[10px] mt-0.5 font-medium" style={{ color: `${p.color}80` }}>
                    {p.sub}
                  </p>
                </div>
                <i
                  className="ri-arrow-right-line text-xs sm:text-sm flex-shrink-0 group-hover:translate-x-0.5 transition-transform hidden sm:block"
                  style={{ color: `${p.color}50` }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── Daily vocab widget ── */}
        <Suspense fallback={<WidgetSkeleton />}>
          <DailyVocabWidget lessons={approvedLessons} />
        </Suspense>

        {/* ── Ad banner bottom ── */}
        <AdBanner position="bottom" />

      </div>
    </DashboardLayout>
  );
}
