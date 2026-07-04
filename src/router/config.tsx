import { useEffect } from "react";
import type { RouteObject } from "react-router-dom";
import RequireAuth from "@/components/feature/RequireAuth";
import AdminGuard from "@/components/feature/AdminGuard";
import RequirePermission from "@/components/feature/RequirePermission";
import AdminLayout from "@/components/feature/AdminLayout";
import { lazyPage, preload } from "./utils";
import { epsRoutes } from "./routes/eps";
import { seoulRoutes } from "./routes/seoul";
import { adminRoutes } from "./routes/admin";
import { topikRoutes } from "./routes/topik";
// REMOVED 2026-07-04 (focus exam features): Hanja not needed
// import { hanjaRoutes } from "./routes/hanja";

export { cancelPreloads } from "./utils";

// ─── Eager (critical path) ────────────────────────────────────────────────────
import RootPage from "../pages/root/page";
import Home from "../pages/home/page";
import LandingPage from "../pages/landing/page";
import NotFound from "../pages/NotFound";

// ─── PreloadOnMount — preloads common routes after app is idle ────────────────
export function PreloadCommonRoutes() {
  useEffect(() => {
    const mounted = { current: true };

    const doPreload = () => {
      if (!mounted.current) return;

      // Core pages only - reduce initial load
      preload(() => import("../pages/eps/page"), "eps");
      // HIDDEN 2026-05-25 (focus EPS+du học): melon = K-pop, not EPS audience
      // preload(() => import("../pages/melon/page"), "melon");
      // REMOVED 2026-07-04 (focus exam features): Community not needed
      // preload(() => import("../pages/community/page"), "community");
      preload(() => import("../pages/profile/page"), "profile");
    };

    const id = requestIdleCallback
      ? requestIdleCallback(doPreload, { timeout: 2000 })
      : setTimeout(doPreload, 1500);

    return () => {
      mounted.current = false;
      if (typeof id === "number") clearTimeout(id);
      else if (typeof cancelIdleCallback !== "undefined") cancelIdleCallback(id as unknown as number);
    };
  }, []);
  return null;
}

// ─── Melon ────────────────────────────────────────────────────────────────────
// HIDDEN 2026-05-25 (focus EPS+du học): K-pop / entertainment, not EPS audience.

// ─── EPS, Seoul, Admin routes ────────────────────────────────────────────────
// Lazy imports moved to ./routes/eps.tsx, ./routes/seoul.tsx, ./routes/admin.tsx

// ─── TOPIK + Hanja moved to ./routes/topik.tsx and ./routes/hanja.tsx ────────

// ─── Hangul ──────────────────────────────────────────────────────────────────
// REMOVED 2026-07-04 (focus exam features): Hangul learning not needed
// const HangulPage = lazyPage(() => import("../pages/hangul/page"));
// const HangulWritePage = lazyPage(() => import("../pages/hangul-write/page"));

// ─── Hanja basic routes moved to ./routes/hanja.tsx ─────────────────────────

// ─── XKLĐ pages ───────────────────────────────────────────────────────────────
// TEMPORARILY DISABLED 2026-07-04 (fixing build errors)
// const XKLĐPage = lazyPage(() => import("../pages/xkld/page"));
// const XKLĐApplyPage = lazyPage(() => import("../pages/xkld-apply/page"));
// const XKLĐCentersPage = lazyPage(() => import("../pages/xkld-centers/page"));
// const XKLĐRequirementsPage = lazyPage(() => import("../pages/xkld-requirements/page"));

// ─── Du học pages ───────────────────────────────────────────────────────────────
const DuHocPage = lazyPage(() => import("../pages/duhoc/page"));
const DuHocApplyPage = lazyPage(() => import("../pages/duhoc-apply/page"));
const DuHocSchoolsPage = lazyPage(() => import("../pages/duhoc-schools/page"));
const DuHocRequirementsPage = lazyPage(() => import("../pages/duhoc-requirements/page"));

// ─── Community ────────────────────────────────────────────────────────────────
// REMOVED 2026-07-04 (focus exam features): Community not needed
// const CommunityPage = lazyPage(() => import("../pages/community/page"));
// const CommunityPostDetailPage = lazyPage(() => import("../pages/community/post-detail-page"));
// HIDDEN 2026-06-27 (consolidate social): community-ranks removed
// const CommunityRanksPage = lazyPage(() => import("../pages/community-ranks/page"));

// ─── Challenge ───────────────────────────────────────────────────────────────
// REMOVED 2026-07-04 (focus exam features): Challenge not needed
// const ChallengePage = lazyPage(() => import("../pages/challenge/page"));
// HIDDEN 2026-06-27 (consolidate challenge): challenge-history removed
// const ChallengeHistoryPage = lazyPage(() => import("../pages/challenge-history/page"));
// HIDDEN 2026-06-27 (consolidate challenge): challenge-leaderboard removed
// const ChallengeLeaderboardPage = lazyPage(() => import("../pages/challenge-leaderboard/page"));
// HIDDEN 2026-06-27 (consolidate challenge): challenge-stats removed
// const ChallengeStatsPage = lazyPage(() => import("../pages/challenge-stats/page"));
// HIDDEN 2026-06-27 (consolidate challenge): weekly-challenge removed
// const WeeklyChallengePage = lazyPage(() => import("../pages/weekly-challenge/page"));

// ─── Stats & Progress ────────────────────────────────────────────────────────
// REMOVED 2026-07-04 (focus exam features): Stats/progress not needed
// const StatsPage = lazyPage(() => import("../pages/stats/page"));
// const PersonalStatsPage = lazyPage(() => import("../pages/personal-stats/page"));
// const ProgressPage = lazyPage(() => import("../pages/progress/page"));
// const LearningHubPage = lazyPage(() => import("../pages/learning-hub/page"));
// const ExamHubPage = lazyPage(() => import("../pages/exam-hub/page"));

// ─── Study tools ─────────────────────────────────────────────────────────────
// REMOVED 2026-07-04 (focus exam features): Grammar/vocab/dictionary not needed
// HIDDEN 2026-06-27 (consolidate study tools): flashcard removed
// const FlashcardPage = lazyPage(() => import("../pages/flashcard/page"));
// const GrammarPage = lazyPage(() => import("../pages/grammar/page"));
// const VocabularyPage = lazyPage(() => import("../pages/vocabulary/page"));
// const DictionaryPage = lazyPage(() => import("../pages/dictionary/page"));
// const PhraseDictionaryPage = lazyPage(() => import("../pages/phrase-dictionary/page"));
// const QuizPage = lazyPage(() => import("../pages/quiz/page"));
// HIDDEN 2026-06-27 (consolidate study tools): pronunciation removed
// const PronunciationPage = lazyPage(() => import("../pages/pronunciation/page"));
// HIDDEN 2026-06-27 (consolidate study tools): listen-practice removed
// const ListenPracticePage = lazyPage(() => import("../pages/listen-practice/page"));
// HIDDEN 2026-06-27 (consolidate study tools): conversation removed
// const ConversationPage = lazyPage(() => import("../pages/conversation/page"));
// HIDDEN 2026-06-27 (consolidate study tools): smart-review removed
// const SmartReviewPage = lazyPage(() => import("../pages/smart-review/page"));
// HIDDEN 2026-06-27 (consolidate study tools): wrong-review removed
// const WrongReviewPage = lazyPage(() => import("../pages/wrong-review/page"));
// HIDDEN 2026-06-27 (consolidate study tools): daily-review removed
// const DailyReviewPage = lazyPage(() => import("../pages/daily-review/page"));
// HIDDEN 2026-06-27 (consolidate study tools): vocab-favorites removed
// const VocabFavoritesPage = lazyPage(() => import("../pages/vocab-favorites/page"));
// HIDDEN 2026-06-27 (consolidate study tools): review-schedule removed
// const ReviewSchedulePage = lazyPage(() => import("../pages/review-schedule/page"));

// ─── Planning & Roadmap ──────────────────────────────────────────────────────
// REMOVED 2026-07-04 (focus exam features): Planning not needed
// const RoadmapPage = lazyPage(() => import("../pages/roadmap/page"));
// HIDDEN 2026-06-27 (consolidate planning): daily-plan removed
// const DailyPlanPage = lazyPage(() => import("../pages/daily-plan/page"));
// REMOVED 2026-07-04 (focus exam features): Planning tools not needed
// const SchedulerPage = lazyPage(() => import("../pages/scheduler/page"));
// const StudyCalendarPage = lazyPage(() => import("../pages/study-calendar/page"));
// const StudyReminderPage = lazyPage(() => import("../pages/study-reminder/page"));
// const StudyJournalPage = lazyPage(() => import("../pages/study-journal/page"));
// const StudyHistoryPage = lazyPage(() => import("../pages/study-history/page"));
// const WeeklyReportPage = lazyPage(() => import("../pages/weekly-report/page"));

// ─── Profile & Account ───────────────────────────────────────────────────────
const ProfilePage = lazyPage(() => import("../pages/profile/page"));
const AccountSettingsPage = lazyPage(() => import("../pages/account-settings/page"));
const SettingsPage = lazyPage(() => import("../pages/settings/page"));
const NotificationSettingsPage = lazyPage(() => import("../pages/notification-settings/page"));
const PublicProfilePage = lazyPage(() => import("../pages/public-profile/page"));
const MemberPage = lazyPage(() => import("../pages/member/page"));

// ─── Social & Leaderboard ────────────────────────────────────────────────────
// HIDDEN 2026-06-27 (consolidate social): leaderboard removed
// const LeaderboardPage = lazyPage(() => import("../pages/leaderboard/page"));
// HIDDEN 2026-06-27 (focus EPS/TOPIK): compare removed (ebook feature)
// const ComparePage = lazyPage(() => import("../pages/compare/page"));

// ─── Rewards & Gamification ──────────────────────────────────────────────────
const RewardsPage = lazyPage(() => import("../pages/rewards/page"));
const AchievementsPage = lazyPage(() => import("../pages/achievements/page"));
const CouponPage = lazyPage(() => import("../pages/coupon/page"));
const ReferralPage = lazyPage(() => import("../pages/referral/page"));
const CTVPage = lazyPage(() => import("../pages/ctv/page"));
const CTVInfoPage = lazyPage(() => import("../pages/ctv-info/page"));
const PricingPage = lazyPage(() => import("../pages/pricing/page"));
// AdminCTVPage moved to ./routes/admin.tsx

// ─── Content ───────────────────────────────────────────────────────────────────
const NaverPage = lazyPage(() => import("../pages/naver/page"));
const NewsPage = lazyPage(() => import("../pages/news/page"));
// HIDDEN 2026-06-27 (focus EPS/TOPIK): ebook/series/preview removed (ebook features)
// const EbookPage = lazyPage(() => import("../pages/ebook/page"));
// const SeriesPage = lazyPage(() => import("../pages/series/page"));
// const PreviewPage = lazyPage(() => import("../pages/preview/page"));
const GuidePage = lazyPage(() => import("../pages/guide/page"));

// ─── Onboarding & Placement ──────────────────────────────────────────────────
// REMOVED 2026-07-04 (focus exam features): Onboarding/placement not needed
// const OnboardingPage = lazyPage(() => import("../pages/onboarding/page"), "full");
// const PlacementTestPage = lazyPage(() => import("../pages/placement-test/page"));
// const LearnOverviewPage = lazyPage(() => import("../pages/learn-overview/page"));
// const LearningCertificatePage = lazyPage(() => import("../pages/learning-certificate/page"));

// ─── All Features ───────────────────────────────────────────────────────────
const AllFeaturesPage = lazyPage(() => import("../pages/all-features/page"));

// ─── New Features ────────────────────────────────────────────────────────────
// HIDDEN 2026-06-27 (consolidate features): daily-vocab removed
// const DailyVocabPage = lazyPage(() => import("../pages/daily-vocab/page"));
const QuickQuizPage = lazyPage(() => import("../pages/quick-quiz/page"));
// HIDDEN 2026-06-27 (consolidate features): vocab-by-topic removed
// const VocabByTopicPage = lazyPage(() => import("../pages/vocab-by-topic/page"));
// HIDDEN 2026-06-27 (consolidate features): daily-challenge removed
// const DailyChallengePage = lazyPage(() => import("../pages/daily-challenge/page"));
// HIDDEN 2026-06-27 (consolidate features): vocab-suggestion removed
// const VocabSuggestionPage = lazyPage(() => import("../pages/vocab-suggestion/page"));
const QuizHistoryDetailPage = lazyPage(() => import("../pages/quiz-history-detail/page"));
const VideoLessonsPage = lazyPage(() => import("../pages/video-lessons/page"));
// HIDDEN 2026-06-27 (consolidate features): shadowing-practice removed
// const ShadowingPracticePage = lazyPage(() => import("../pages/shadowing-practice/page"));
// HIDDEN 2026-06-27 (consolidate features): listening-dictation removed
// const ListeningDictationPage = lazyPage(() => import("../pages/listening-dictation/page"));
// HIDDEN 2026-06-27 (consolidate features): handwriting-practice removed
// const HandwritingPracticePage = lazyPage(() => import("../pages/handwriting-practice/page"));
const OfflineManagerPage = lazyPage(() => import("../pages/offline-manager/page"));
const OfflineVocabPage = lazyPage(() => import("../pages/offline-vocab/page"));
// HIDDEN 2026-06-27 (consolidate features): global-leaderboard removed
// const GlobalLeaderboardPage = lazyPage(() => import("../pages/global-leaderboard/page"));
// HIDDEN 2026-06-27 (consolidate features): speaking-level removed
// const SpeakingLevelPage = lazyPage(() => import("../pages/speaking-level/page"));
// HIDDEN 2026-06-27 (consolidate features): vocab-games removed
// const VocabGamesPage = lazyPage(() => import("../pages/vocab-games/page"));
// REMOVED 2026-07-04 (focus exam features): Advanced dictionary not needed
// const AdvancedDictionaryPage = lazyPage(() => import("../pages/advanced-dictionary/page"));
const StudyHistoryDetailPage = lazyPage(() => import("../pages/study-history-detail/page"));
// HIDDEN 2026-06-27 (consolidate features): reading-by-level removed
// const ReadingByLevelPage = lazyPage(() => import("../pages/reading-by-level/page"));
// HIDDEN 2026-06-27 (consolidate features): writing-by-level removed
// const WritingByLevelPage = lazyPage(() => import("../pages/writing-by-level/page"));
// HIDDEN 2026-06-27 (consolidate features): vocab-in-context removed
// const VocabInContextPage = lazyPage(() => import("../pages/vocab-in-context/page"));
// HIDDEN 2026-06-27 (consolidate features): dictation-practice removed
// const DictationPracticePage = lazyPage(() => import("../pages/dictation-practice/page"));
// HIDDEN 2026-06-27 (consolidate features): translation-practice removed
// const TranslationPracticePage = lazyPage(() => import("../pages/translation-practice/page"));
// HIDDEN 2026-06-27 (consolidate features): syllable-pronunciation removed
// const SyllablePronunciationPage = lazyPage(() => import("../pages/syllable-pronunciation/page"));
// HIDDEN 2026-06-27 (consolidate features): speed-listening removed
// const SpeedListeningPage = lazyPage(() => import("../pages/speed-listening/page"));
// HIDDEN 2026-06-27 (consolidate features): sentence-pattern-vocab removed
// const SentencePatternVocabPage = lazyPage(() => import("../pages/sentence-pattern-vocab/page"));

// ─── Admin lazy imports moved to ./routes/admin.tsx ──────────────────────────
const FeedbackPage = lazyPage(() => import("../pages/feedback/page"));
const ReportBugPage = lazyPage(() => import("../pages/report-bug/page"));
const VipHistoryPage = lazyPage(() => import("../pages/vip-history/page"));
// HIDDEN 2026-06-27 (consolidate features): daily-words removed
// const DailyWordsPage = lazyPage(() => import("../pages/daily-words/page"));
// REMOVED 2026-07-04 (focus exam features): Learning roadmap/stats not needed
// const LearningRoadmapPage = lazyPage(() => import("../pages/learning-roadmap/page"));
// const StudyStatsPage = lazyPage(() => import("../pages/study-stats/page"));
// DataUploadPage moved to ./routes/admin.tsx
// REMOVED 2026-07-04 (focus exam features): Share progress not needed
// const ShareProgressPage = lazyPage(() => import("../pages/share-progress/page"));

// ─── Routes ───────────────────────────────────────────────────────────────────
const routes: RouteObject[] = [
  { path: "/", element: <Home /> },
  { path: "/dashboard", element: <Home /> },
  { path: "/landing", element: <LandingPage /> },

  // Melon — HIDDEN 2026-05-25 (focus EPS+du học): K-pop entertainment, not EPS audience

  // EPS — moved to ./routes/eps.tsx
  ...epsRoutes,

  // Seoul — moved to ./routes/seoul.tsx
  ...seoulRoutes,

  // TOPIK
  // TOPIK — moved to ./routes/topik.tsx
  ...topikRoutes,

  // Hangul — REMOVED 2026-07-04 (focus exam features)
  // { path: "/hangul", element: <HangulPage /> },
  // { path: "/hangul-write", element: <HangulWritePage /> },

  // Hanja — REMOVED 2026-07-04 (focus exam features)
  // // Hanja — moved to ./routes/hanja.tsx
  // ...hanjaRoutes,

  // XKLĐ — TEMPORARILY DISABLED 2026-07-04 (fixing build errors)
  // { path: "/xkld", element: <XKLĐPage /> },
  // { path: "/xkld-apply", element: <XKLĐApplyPage /> },
  // { path: "/xkld-centers", element: <XKLĐCentersPage /> },
  // { path: "/xkld-requirements", element: <XKLĐRequirementsPage /> },

  // Du học — Added 2026-07-04 (upsell du học services)
  { path: "/duhoc", element: <DuHocPage /> },
  { path: "/duhoc-apply", element: <DuHocApplyPage /> },
  { path: "/duhoc-schools", element: <DuHocSchoolsPage /> },
  { path: "/duhoc-requirements", element: <DuHocRequirementsPage /> },

  // Community — REMOVED 2026-07-04 (focus exam features)
  // { path: "/community", element: <CommunityPage /> },
  // { path: "/community/:id", element: <CommunityPostDetailPage /> },
  // HIDDEN 2026-06-27 (consolidate social): community-ranks removed
  // { path: "/community-ranks", element: <CommunityRanksPage /> },

  // Challenge — REMOVED 2026-07-04 (focus exam features)
  // { path: "/challenge", element: <ChallengePage /> },
  // HIDDEN 2026-06-27 (consolidate challenge): challenge-history removed
  // { path: "/challenge-history", element: <ChallengeHistoryPage /> },
  // HIDDEN 2026-06-27 (consolidate challenge): challenge-leaderboard removed
  // { path: "/challenge-leaderboard", element: <ChallengeLeaderboardPage /> },
  // HIDDEN 2026-06-27 (consolidate challenge): challenge-stats removed
  // { path: "/challenge-stats", element: <ChallengeStatsPage /> },
  // HIDDEN 2026-06-27 (consolidate challenge): weekly-challenge removed
  // { path: "/weekly-challenge", element: <WeeklyChallengePage /> },

  // Stats & Progress — REMOVED 2026-07-04 (focus exam features)
  // { path: "/stats", element: <StatsPage /> },
  // { path: "/personal-stats", element: <PersonalStatsPage /> },
  // { path: "/progress", element: <ProgressPage /> },
  // { path: "/learning-hub", element: <RequireAuth title="Learning Hub"><LearningHubPage /></RequireAuth> },
  // { path: "/exam-hub", element: <RequireAuth title="Exam Hub"><ExamHubPage /></RequireAuth> },

  // Study tools — REMOVED 2026-07-04 (focus exam features)
  // HIDDEN 2026-06-27 (consolidate study tools): flashcard removed
  // { path: "/flashcard", element: <FlashcardPage /> },
  // { path: "/grammar", element: <GrammarPage /> },
  // { path: "/vocabulary", element: <VocabularyPage /> },
  // { path: "/dictionary", element: <DictionaryPage /> },
  // { path: "/phrase-dictionary", element: <PhraseDictionaryPage /> },
  // { path: "/quiz", element: <QuizPage /> },
  // HIDDEN 2026-06-27 (consolidate study tools): pronunciation removed
  // { path: "/pronunciation", element: <PronunciationPage /> },
  // HIDDEN 2026-06-27 (consolidate study tools): listen-practice removed
  // { path: "/listen-practice", element: <ListenPracticePage /> },
  // HIDDEN 2026-06-27 (consolidate study tools): conversation removed
  // { path: "/conversation", element: <ConversationPage /> },
  // HIDDEN 2026-06-27 (consolidate study tools): smart-review removed
  // { path: "/smart-review", element: <SmartReviewPage /> },
  // HIDDEN 2026-06-27 (consolidate study tools): wrong-review removed
  // { path: "/wrong-review", element: <WrongReviewPage /> },
  // HIDDEN 2026-06-27 (consolidate study tools): daily-review removed
  // { path: "/daily-review", element: <DailyReviewPage /> },
  // HIDDEN 2026-06-27 (consolidate study tools): vocab-favorites removed
  // { path: "/vocab-favorites", element: <VocabFavoritesPage /> },
  // HIDDEN 2026-06-27 (consolidate study tools): review-schedule removed
  // { path: "/review-schedule", element: <ReviewSchedulePage /> },

  // Planning & Roadmap — REMOVED 2026-07-04 (focus exam features)
  // { path: "/roadmap", element: <RoadmapPage /> },
  // HIDDEN 2026-06-27 (consolidate planning): daily-plan removed
  // { path: "/daily-plan", element: <DailyPlanPage /> },
  // REMOVED 2026-07-04 (focus exam features): Planning tools not needed
  // { path: "/scheduler", element: <SchedulerPage /> },
  // { path: "/study-calendar", element: <StudyCalendarPage /> },
  // { path: "/study-reminder", element: <StudyReminderPage /> },
  // { path: "/study-journal", element: <RequireAuth title="Nhật ký học"><StudyJournalPage /></RequireAuth> },
  // { path: "/study-history", element: <RequireAuth title="Lịch sử học"><StudyHistoryPage /></RequireAuth> },
  // { path: "/weekly-report", element: <RequireAuth title="Báo cáo tuần"><WeeklyReportPage /></RequireAuth> },

  // Profile & Account
  { path: "/profile", element: <RequireAuth title="Hồ sơ cá nhân"><ProfilePage /></RequireAuth> },
  { path: "/account-settings", element: <RequireAuth title="Cài đặt tài khoản"><AccountSettingsPage /></RequireAuth> },
  { path: "/settings", element: <RequireAuth title="Cài đặt"><SettingsPage /></RequireAuth> },
  { path: "/notification-settings", element: <RequireAuth title="Cài đặt thông báo"><NotificationSettingsPage /></RequireAuth> },
  { path: "/public-profile/:userId", element: <PublicProfilePage /> },
  { path: "/member/:userId", element: <MemberPage /> },

  // Social & Leaderboard
  // HIDDEN 2026-06-27 (consolidate social): leaderboard removed
  // { path: "/leaderboard", element: <LeaderboardPage /> },
  // HIDDEN 2026-06-27 (focus EPS/TOPIK): compare removed (ebook feature)
  // { path: "/compare", element: <ComparePage /> },

  // Rewards & Gamification
  { path: "/rewards", element: <RewardsPage /> },
  { path: "/achievements", element: <AchievementsPage /> },
  { path: "/coupon", element: <CouponPage /> },
  { path: "/referral", element: <ReferralPage /> },
  { path: "/ctv-info", element: <CTVInfoPage /> },
  { path: "/ctv", element: <RequireAuth title="Cộng Tác Viên"><CTVPage /></RequireAuth> },
  { path: "/pricing", element: <PricingPage /> },

  // Content
  { path: "/naver", element: <NaverPage /> },
  { path: "/news", element: <NewsPage /> },
  // HIDDEN 2026-06-27 (focus EPS/TOPIK): ebook/series/preview removed (ebook features)
  // { path: "/ebook", element: <EbookPage /> },
  // { path: "/series", element: <SeriesPage /> },
  // { path: "/preview/:seriesId", element: <PreviewPage /> },
  { path: "/guide", element: <GuidePage /> },

  // Onboarding & Placement — REMOVED 2026-07-04 (focus exam features)
  // { path: "/onboarding", element: <OnboardingPage /> },
  // { path: "/placement-test", element: <PlacementTestPage /> },
  // { path: "/learn-overview", element: <LearnOverviewPage /> },
  // { path: "/learning-certificate", element: <LearningCertificatePage /> },

  // Admin — moved to ./routes/admin.tsx
  ...adminRoutes,
  { path: "/feedback", element: <FeedbackPage /> },
  { path: "/report-bug", element: <ReportBugPage /> },
  { path: "/vip-history", element: <RequireAuth title="Lịch sử VIP"><VipHistoryPage /></RequireAuth> },
  // HIDDEN 2026-06-27 (consolidate features): daily-words removed
  // { path: "/daily-words", element: <DailyWordsPage /> },
  // REMOVED 2026-07-04 (focus exam features): Learning roadmap/stats not needed
  // { path: "/learning-roadmap", element: <LearningRoadmapPage /> },
  // { path: "/study-stats", element: <RequireAuth title="Thống kê học tập"><StudyStatsPage /></RequireAuth> },
  // { path: "/share-progress", element: <RequireAuth title="Chia sẻ tiến độ" message="Đăng nhập để tạo và tải ảnh tiến độ học tập của bạn."><ShareProgressPage /></RequireAuth> },

  // All Features
  { path: "/all-features", element: <AllFeaturesPage /> },

  // New Features
  // HIDDEN 2026-06-27 (consolidate features): daily-vocab removed
  // { path: "/daily-vocab", element: <DailyVocabPage /> },
  { path: "/quick-quiz", element: <QuickQuizPage /> },
  // HIDDEN 2026-06-27 (consolidate features): vocab-by-topic removed
  // { path: "/vocab-by-topic", element: <VocabByTopicPage /> },
  // HIDDEN 2026-06-27 (consolidate features): daily-challenge removed
  // { path: "/daily-challenge", element: <DailyChallengePage /> },
  // HIDDEN 2026-06-27 (consolidate features): vocab-suggestion removed
  // { path: "/vocab-suggestion", element: <VocabSuggestionPage /> },
  { path: "/quiz-history-detail", element: <QuizHistoryDetailPage /> },
  { path: "/video-lessons", element: <VideoLessonsPage /> },
  // HIDDEN 2026-06-27 (consolidate features): shadowing-practice removed
  // { path: "/shadowing-practice", element: <ShadowingPracticePage /> },
  // HIDDEN 2026-06-27 (consolidate features): listening-dictation removed
  // { path: "/listening-dictation", element: <ListeningDictationPage /> },
  // HIDDEN 2026-06-27 (consolidate features): handwriting-practice removed
  // { path: "/handwriting-practice", element: <HandwritingPracticePage /> },
  { path: "/offline-manager", element: <OfflineManagerPage /> },
  { path: "/offline-vocab", element: <OfflineVocabPage /> },
  // HIDDEN 2026-06-27 (consolidate features): global-leaderboard removed
  // { path: "/global-leaderboard", element: <GlobalLeaderboardPage /> },
  // HIDDEN 2026-06-27 (consolidate features): speaking-level removed
  // { path: "/speaking-level", element: <SpeakingLevelPage /> },
  // HIDDEN 2026-06-27 (consolidate features): vocab-games removed
  // { path: "/vocab-games", element: <VocabGamesPage /> },
  // REMOVED 2026-07-04 (focus exam features): Advanced dictionary not needed
  // { path: "/advanced-dictionary", element: <AdvancedDictionaryPage /> },
  { path: "/study-history-detail", element: <StudyHistoryDetailPage /> },
  // HIDDEN 2026-06-27 (consolidate features): reading-by-level removed
  // { path: "/reading-by-level", element: <ReadingByLevelPage /> },
  // HIDDEN 2026-06-27 (consolidate features): writing-by-level removed
  // { path: "/writing-by-level", element: <WritingByLevelPage /> },
  // HIDDEN 2026-06-27 (consolidate features): vocab-in-context removed
  // { path: "/vocab-in-context", element: <VocabInContextPage /> },
  // HIDDEN 2026-06-27 (consolidate features): dictation-practice removed
  // { path: "/dictation-practice", element: <DictationPracticePage /> },
  // HIDDEN 2026-06-27 (consolidate features): translation-practice removed
  // { path: "/translation-practice", element: <TranslationPracticePage /> },
  // HIDDEN 2026-06-27 (consolidate features): syllable-pronunciation removed
  // { path: "/syllable-pronunciation", element: <SyllablePronunciationPage /> },
  // HIDDEN 2026-06-27 (consolidate features): speed-listening removed
  // { path: "/speed-listening", element: <SpeedListeningPage /> },
  // HIDDEN 2026-06-27 (consolidate features): sentence-pattern-vocab removed
  // { path: "/sentence-pattern-vocab", element: <SentencePatternVocabPage /> },

  // Misc
  { path: "*", element: <NotFound /> },
];

export default routes;