import { useNavigate } from "react-router-dom";
import { lazy, Suspense, useMemo, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/feature/DashboardLayout";
import AdBanner from "@/components/feature/AdBanner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useApiCostTracker } from "@/hooks/useApiCostTracker";
import { epsQuestions } from "@/mocks/epsQuestions";
import QuickStartGuide from "@/pages/home/components/QuickStartGuide";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { usePageSEO } from "@/hooks/usePageSEO";
import { getStreakData } from "@/utils/streak";

const SRReviewWidget = lazy(() => import("@/pages/home/components/SRReviewWidget"));
const StreakWidget = lazy(() => import("@/pages/home/components/StreakWidget"));
const SeoulStreakBanner = lazy(() => import("@/pages/home/components/SeoulStreakBanner"));
// DailyVocabWidget HIDDEN 2026-05-25 (focus EPS+du học): depended on melon lessons

function WidgetSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-app-bg border border-app-border rounded-2xl p-4 animate-pulse ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-app-card/50" />
        <div className="flex-1 h-4 rounded bg-app-card/50" />
      </div>
      <div className="space-y-2">
        <div className="h-3 rounded bg-app-card/30 w-3/4" />
        <div className="h-3 rounded bg-app-card/30 w-1/2" />
      </div>
    </div>
  );
}

// ─── Quick Card Skeleton ───────────────────────────────────────────────────────
function QuickCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border border-app-border animate-pulse">
      <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-app-card/30 flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 rounded bg-app-card/30 w-2/3" />
        <div className="h-3 rounded bg-app-card/30 w-1/2" />
      </div>
    </div>
  );
}

// ─── Stat Card Skeleton ───────────────────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border border-app-border animate-pulse">
      <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-app-card/30 flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-5 rounded bg-app-card/30 w-3/4" />
        <div className="h-3 rounded bg-app-card/30 w-1/3" />
      </div>
    </div>
  );
}

// Interfaces for K-pop/Naver data shape removed 2026-05-25 — re-add if melon is re-enabled

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
      className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border border-app-border"
      style={{ backgroundColor: "#0f1117" }}
    >
      <div
        className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl flex-shrink-0"
        style={{ backgroundColor: `${color}15` }}
      >
        <i className={`${icon} text-base sm:text-base`} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-base sm:text-lg font-bold text-white">{value} <span className="font-semibold text-app-text-secondary">{label}</span></p>
        <p className="text-app-text-muted text-[10px] line-clamp-1">{sub}</p>
      </div>
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
  const [hanjaCount, setHanjaCount] = useState<number | null>(null);

  usePageSEO({
    title: "Hàn Quốc Ơi! — Luyện thi EPS-TOPIK, học tiếng Hàn miễn phí",
    description: "Trang chủ Hàn Quốc Ơi! — Bắt đầu hành trình EPS-TOPIK của bạn: 60 bài học, ngân hàng đề thi, từ vựng theo chủ đề, flashcard, luyện nghe. Miễn phí.",
    keywords: "Hàn Quốc Ơi, học tiếng Hàn, EPS-TOPIK, XKLĐ Hàn Quốc, học tiếng Hàn online",
    path: "/home",
    ogType: "website",
  });

  useEffect(() => {
    supabase.from("hanja_pro").select("id", { count: "exact", head: true })
      .then(({ count }) => { if (count !== null) setHanjaCount(count); });
  }, []);
  const isAdmin = useIsAdmin();

  const streak = getStreakData();
  const [answeredMap] = useLocalStorage<Record<string, number>>("kts_eps_answers", {});
  const [flashcardKnown] = useLocalStorage<Record<string, boolean>>("flashcard_known", {});
  const [examResults] = useLocalStorage<{ score: number; total: number; date: string }[]>(
    "kts_eps_exam_results",
    []
  );
  const [learnedIds] = useLocalStorage<Record<string, string[]>>("daily_learned", {});

  // HIDDEN 2026-05-25 (focus EPS+du học): melon/naver stats removed, K-pop tools off-focus

  const epsDone = Object.keys(answeredMap).length;
  const epsCorrect = epsQuestions.filter((q) => answeredMap[q.id] === q.correctIndex).length;
  const epsAccuracy = epsDone > 0 ? Math.round((epsCorrect / epsDone) * 100) : 0;
  const knownCount = Object.values(flashcardKnown).filter(Boolean).length;
  const bestExamPct = (() => {
    const valid = examResults.filter((r) => r && r.total > 0);
    return valid.length > 0
      ? Math.max(...valid.map((r) => Math.round((r.score / r.total) * 100)))
      : 0;
  })();

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
        label: "Ôn 10 flashcard EPS",
        path: "/eps-flashcard",
        desc: "Tăng vốn từ vựng EPS mỗi ngày",
      });
    suggestions.push({
      icon: "ri-sun-line",
      color: "#e8c84a",
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          <StatCard
            icon="ri-fire-line"
            color="#fb923c"
            label="Streak"
            value={`${streak.currentStreak}🔥`}
            sub="ngày liên tiếp"
          />
          <StatCard
            icon="ri-book-open-line"
            color="#e8c84a"
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
              onClick={() => navigate("/eps-30day-plan")}
              className="text-app-accent-primary text-xs hover:text-[#d4b43a] cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              Lộ trình <i className="ri-arrow-right-line" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <QuickCard
              icon="ri-sun-line"
              color="#e8c84a"
              label="Từ mới hôm nay"
              desc={`${todayLearned.length}/8 từ đã học`}
              path="/daily-words"
              badge={todayLearned.length === 8 ? "Xong!" : undefined}
            />
            <QuickCard
              icon="ri-stack-line"
              color="#a78bfa"
              label="Flashcard EPS"
              desc="Ôn tập từ vựng EPS"
              path="/eps-flashcard"
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
              label="Lộ trình 30 ngày"
              desc="Kế hoạch học EPS"
              path="/eps-30day-plan"
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
              icon="ri-list-check-3"
              color="#4ade80"
              title="EPS theo chủ đề"
              desc="Học từ vựng theo từng chủ đề EPS"
              stat={`${Object.keys(answeredMap).length} câu đã làm`}
              path="/eps-topics"
            />
            <ToolRow
              icon="ri-file-text-line"
              color="#38bdf8"
              title="Đề thi EPS thật"
              desc="Đề 1, Đề 2 — 40 câu mô phỏng"
              stat="2 đề chính thức"
              path="/eps-exams"
            />
            <ToolRow
              icon="ri-book-2-line"
              color="#a78bfa"
              title="Ngữ pháp EPS"
              desc="Tổng hợp ngữ pháp cần thiết"
              stat="Theo trình độ"
              path="/eps-grammar"
            />
            <ToolRow
              icon="ri-bar-chart-2-line"
              color="#4ade80"
              title="Thống kê học tập"
              desc="Streak, từ đã học, so sánh tuần"
              stat={`${streak.currentStreak} ngày streak`}
              path="/study-stats"
            />
            {isAdmin && (
              <ToolRow
                icon="ri-upload-cloud-2-line"
                color="#fb923c"
                title="Tải lên dữ liệu (Admin)"
                desc="Nhập EPS vocab / lessons từ CSV"
                stat="Excel · CSV"
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
                color: "#e8c84a",
                label: "Hán Hàn VIP",
                desc: hanjaCount !== null ? `${hanjaCount.toLocaleString("vi-VN")} từ Hán Hàn` : "2.691 từ Hán Hàn",
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

        {/* DailyVocabWidget HIDDEN 2026-05-25 (focus EPS+du học): depended on melon lessons data which is now off-focus */}

        {/* ── Ad banner bottom ── */}
        <AdBanner position="bottom" />

      </div>
    </DashboardLayout>
  );
}
