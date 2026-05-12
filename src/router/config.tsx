import { lazy, Suspense, useEffect, Component, ReactNode } from "react";
import type { RouteObject } from "react-router-dom";
import PageSkeleton from "@/components/base/PageSkeleton";
import RequireAuth from "@/components/feature/RequireAuth";
import AdminGuard from "@/components/feature/AdminGuard";
import RequirePermission from "@/components/feature/RequirePermission";
import AdminLayout from "@/components/feature/AdminLayout";

// ─── Eager (critical path) ────────────────────────────────────────────────────
import RootPage from "../pages/root/page";
import Home from "../pages/home/page";
import LandingPage from "../pages/landing/page";
import NotFound from "../pages/NotFound";

type SkeletonVariant = "dashboard" | "full" | "vocab" | "exam" | "flashcard";

// ─── Error Boundary for lazy routes ─────────────────────────────────────────
interface ErrorBoundaryProps { children: ReactNode; name?: string }
interface ErrorBoundaryState { hasError: boolean; error?: Error }

class LazyErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <i className="ri-error-warning-line text-4xl text-red-400"></i>
          <h2 className="text-white text-lg font-semibold">Đã xảy ra lỗi</h2>
          <p className="text-white/50 text-sm text-center max-w-md">{this.state.error?.message || "Không thể tải trang này. Thử lại sau."}</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="mt-2 px-5 py-2 rounded-lg bg-app-accent-primary text-app-bg font-semibold text-sm hover:bg-app-accent-primary/90 transition-colors cursor-pointer">Tải lại trang</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Lazy page helper — returns a stable wrapper component ─────────────────────
function lazyPage(
  factory: () => Promise<{ default: React.ComponentType<unknown> }>,
  skeleton: SkeletonVariant = "dashboard"
) {
  const LazyComponent = lazy(factory);
  return function LazyRouteWrapper() {
    return (
      <LazyErrorBoundary>
        <Suspense fallback={<PageSkeleton variant={skeleton} />}>
          <LazyComponent />
        </Suspense>
      </LazyErrorBoundary>
    );
  };
}

// ─── Preload helper — kick off import() without blocking render ───────────────
const preloadCache = new Set<string>();
const abortControllers = new Map<string, AbortController>();

function preload(factory: () => Promise<unknown>, key: string) {
  if (preloadCache.has(key)) return;
  preloadCache.add(key);
  
  const controller = new AbortController();
  abortControllers.set(key, controller);
  
  factory().catch(() => {/* ignore */}).finally(() => {
    abortControllers.delete(key);
  });
}

// Cleanup function for preloading
export function cancelPreloads() {
  abortControllers.forEach((controller) => controller.abort());
  abortControllers.clear();
}

// ─── PreloadOnMount — preloads common routes after app is idle ────────────────
export function PreloadCommonRoutes() {
  useEffect(() => {
    const mounted = { current: true };
    
    const doPreload = () => {
      if (!mounted.current) return;
      
      // Core pages only - reduce initial load
      preload(() => import("../pages/eps/page"), "eps");
      preload(() => import("../pages/melon/page"), "melon");
      preload(() => import("../pages/community/page"), "community");
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
const MelonPage = lazyPage(() => import("../pages/melon/page"));
const MelonDetailPage = lazyPage(() => import("../pages/melon-detail/page"));
const MelonHistoryPage = lazyPage(() => import("../pages/melon-history/page"));
const MelonStatsPage = lazyPage(() => import("../pages/melon-stats/page"));
const MelonFlashcardPage = lazyPage(() => import("../pages/melon-flashcard/page"));
const MelonFlashcardSharedPage = lazyPage(() => import("../pages/melon-flashcard-shared/page"));
const KpopFlashcardPage = lazyPage(() => import("../pages/kpop-flashcard/page"));
const EpsMelonPage = lazyPage(() => import("../pages/eps-melon/page"));

// ─── EPS ──────────────────────────────────────────────────────────────────────
const EpsPage = lazyPage(() => import("../pages/eps/page"));
const EpsExamPage = lazyPage(() => import("../pages/eps-exam/page"), "exam");
const EpsExamHistoryPage = lazyPage(() => import("../pages/eps-exam-history/page"));
const EpsExamSchedulePage = lazyPage(() => import("../pages/eps-exam-schedule/page"));
const EpsFlashcardPage = lazyPage(() => import("../pages/eps-flashcard/page"), "flashcard");
const EpsLessonsPage = lazyPage(() => import("../pages/eps-lessons/page"));
const EpsLessonQuizPage = lazyPage(() => import("../pages/eps-lesson-quiz/page"));
const EpsListeningPage = lazyPage(() => import("../pages/eps-listening/page"));
const EpsSpeakingPage = lazyPage(() => import("../pages/eps-speaking/page"));
const EpsMockExamPage = lazyPage(() => import("../pages/eps-mock-exam/page"), "exam");
const EpsOfficialExamPage = lazyPage(() => import("../pages/eps-official-exam/page"), "exam");
const EpsPersonalizedRoadmapPage = lazyPage(() => import("../pages/eps-personalized-roadmap/page"));
const EpsProgressRoadmapPage = lazyPage(() => import("../pages/eps-progress-roadmap/page"));
const EpsQuickReviewPage = lazyPage(() => import("../pages/eps-quick-review/page"));
const EpsReviewHistoryPage = lazyPage(() => import("../pages/eps-review-history/page"));
const EpsSmartFlashcardPage = lazyPage(() => import("../pages/eps-smart-flashcard/page"), "flashcard");
const EpsSmartWrongPage = lazyPage(() => import("../pages/eps-smart-wrong/page"));
const EpsSpacedReviewPage = lazyPage(() => import("../pages/eps-spaced-review/page"), "flashcard");
const EpsStatsPage = lazyPage(() => import("../pages/eps-stats/page"));
const EpsStudyGroupPage = lazyPage(() => import("../pages/eps-study-group/page"));
const EpsTopicDictionaryPage = lazyPage(() => import("../pages/eps-topic-dictionary/page"));
const EpsTopicDrillPage = lazyPage(() => import("../pages/eps-topic-drill/page"));
const EpsTopicExamPage = lazyPage(() => import("../pages/eps-topic-exam/page"));
const EpsTopicStatsPage = lazyPage(() => import("../pages/eps-topic-stats/page"));
const EpsTopicStudyPage = lazyPage(() => import("../pages/eps-topic-study/page"));
const EpsTopicsPage = lazyPage(() => import("../pages/eps-topics/page"));
const EpsVocabExportPage = lazyPage(() => import("../pages/eps-vocab-export/page"));
const EpsVocabFlashcardPage = lazyPage(() => import("../pages/eps-vocab-flashcard/page"), "flashcard");
const EpsVocabularyPage = lazyPage(() => import("../pages/eps-vocabulary/page"), "vocab");
const EpsWeaknessAnalysisPage = lazyPage(() => import("../pages/eps-weakness-analysis/page"));
const EpsWeeklyProgressPage = lazyPage(() => import("../pages/eps-weekly-progress/page"));
const EpsWrongTopicPage = lazyPage(() => import("../pages/eps-wrong-topic/page"));
const EpsLeaderboardPage = lazyPage(() => import("../pages/eps-leaderboard/page"));
const EpsGlobalLeaderboardPage = lazyPage(() => import("../pages/eps-global-leaderboard/page"));
const Eps30dayPlanPage = lazyPage(() => import("../pages/eps-30day-plan/page"));

// ─── Seoul ────────────────────────────────────────────────────────────────────
const SeoulTextbookPage = lazyPage(() => import("../pages/seoul-textbook/page"));
const SeoulDictionaryPage = lazyPage(() => import("../pages/seoul-dictionary/page"));
const SeoulExamPage = lazyPage(() => import("../pages/seoul-exam/page"));
const SeoulFlashcardPage = lazyPage(() => import("../pages/seoul-flashcard/page"));
const SeoulHanjaPage = lazyPage(() => import("../pages/seoul-hanja/page"));
const SeoulLearningPathPage = lazyPage(() => import("../pages/seoul-learning-path/page"));
const SeoulLessonQuizPage = lazyPage(() => import("../pages/seoul-lesson-quiz/page"));
const SeoulListeningQuizPage = lazyPage(() => import("../pages/seoul-listening-quiz/page"));
const SeoulPhrasesPage = lazyPage(() => import("../pages/seoul-phrases/page"));
const SeoulPlacementPage = lazyPage(() => import("../pages/seoul-placement/page"));
const SeoulPracticePage = lazyPage(() => import("../pages/seoul-practice/page"));
const SeoulProgressPage = lazyPage(() => import("../pages/seoul-progress/page"));
const SeoulStatsPage = lazyPage(() => import("../pages/seoul-stats/page"));
const SeoulStreakPage = lazyPage(() => import("../pages/seoul-streak/page"));
const SeoulTopicReviewPage = lazyPage(() => import("../pages/seoul-topic-review/page"));
const SeoulTopicStudyPage = lazyPage(() => import("../pages/seoul-topic-study/page"));
const SeoulVocabExportPage = lazyPage(() => import("../pages/seoul-vocab-export/page"));
const SeoulWordPairsPage = lazyPage(() => import("../pages/seoul-word-pairs/page"));
const SeoulWritingPage = lazyPage(() => import("../pages/seoul-writing/page"));
const SeoulWrongReviewPage = lazyPage(() => import("../pages/seoul-wrong-review/page"));
const SeoulVocabPracticePage = lazyPage(() => import("../pages/seoul-vocab-practice/page"), "flashcard");
const SeoulGrammarPage = lazyPage(() => import("../pages/seoul-grammar/page"));
const EpsGrammarPage = lazyPage(() => import("../pages/eps-grammar/page"));
const EpsLessonDetailPage = lazyPage(() => import("../pages/eps-lesson-detail/page"));

// ─── TOPIK ───────────────────────────────────────────────────────────────────
const TopikTestPage = lazyPage(() => import("../pages/topik-test/page"), "exam");
const Topik2TestPage = lazyPage(() => import("../pages/topik2-test/page"), "exam");
const TopikDictionaryPage = lazyPage(() => import("../pages/topik-dictionary/page"), "vocab");
const TopikFlashcardPage = lazyPage(() => import("../pages/topik-flashcard/page"), "flashcard");
const TopikListeningPage = lazyPage(() => import("../pages/topik-listening/page"));
const TopikReadingPage = lazyPage(() => import("../pages/topik-reading/page"));
const TopikStatsPage = lazyPage(() => import("../pages/topik-stats/page"));
const TopikTopicQuizPage = lazyPage(() => import("../pages/topik-topic-quiz/page"));

// ─── Hangul ──────────────────────────────────────────────────────────────────
const HangulPage = lazyPage(() => import("../pages/hangul/page"));
const HangulCanvasPage = lazyPage(() => import("../pages/hangul-canvas/page"));
const HangulWritePage = lazyPage(() => import("../pages/hangul-write/page"));

// ─── Hanja ───────────────────────────────────────────────────────────────────
const HanjaVocabPage = lazyPage(() => import("../pages/hanja-vocab/page"));

// ─── Community ────────────────────────────────────────────────────────────────
const CommunityPage = lazyPage(() => import("../pages/community/page"));
const CommunityPostDetailPage = lazyPage(() => import("../pages/community/post-detail-page"));
const CommunityRanksPage = lazyPage(() => import("../pages/community-ranks/page"));

// ─── Challenge ───────────────────────────────────────────────────────────────
const ChallengePage = lazyPage(() => import("../pages/challenge/page"));
const ChallengeHistoryPage = lazyPage(() => import("../pages/challenge-history/page"));
const ChallengeLeaderboardPage = lazyPage(() => import("../pages/challenge-leaderboard/page"));
const ChallengeStatsPage = lazyPage(() => import("../pages/challenge-stats/page"));
const FriendChallengePage = lazyPage(() => import("../pages/friend-challenge/page"));
const FriendStreakPage = lazyPage(() => import("../pages/friend-streak/page"));
const WeeklyChallengePage = lazyPage(() => import("../pages/weekly-challenge/page"));

// ─── Stats & Progress ────────────────────────────────────────────────────────
const StatsPage = lazyPage(() => import("../pages/stats/page"));
const OverallStatsPage = lazyPage(() => import("../pages/overall-stats/page"));
const PersonalStatsPage = lazyPage(() => import("../pages/personal-stats/page"));
const LearnStatsPage = lazyPage(() => import("../pages/learn-stats/page"));
const StudyAnalyticsPage = lazyPage(() => import("../pages/study-analytics/page"));
const StudyStatsDetailPage = lazyPage(() => import("../pages/study-stats-detail/page"));
const ProgressPage = lazyPage(() => import("../pages/progress/page"));
const XpStatsPage = lazyPage(() => import("../pages/xp-stats/page"));
const LearningHubPage = lazyPage(() => import("../pages/learning-hub/page"));
const ExamHubPage = lazyPage(() => import("../pages/exam-hub/page"));

// ─── Study tools ─────────────────────────────────────────────────────────────
const FlashcardPage = lazyPage(() => import("../pages/flashcard/page"));
const GrammarPage = lazyPage(() => import("../pages/grammar/page"));
const VocabularyPage = lazyPage(() => import("../pages/vocabulary/page"));
const DictionaryPage = lazyPage(() => import("../pages/dictionary/page"));
const PhraseDictionaryPage = lazyPage(() => import("../pages/phrase-dictionary/page"));
const QuizPage = lazyPage(() => import("../pages/quiz/page"));
const PronunciationPage = lazyPage(() => import("../pages/pronunciation/page"));
const ListenPracticePage = lazyPage(() => import("../pages/listen-practice/page"));
const ConversationPage = lazyPage(() => import("../pages/conversation/page"));
const SmartReviewPage = lazyPage(() => import("../pages/smart-review/page"));
const WrongReviewPage = lazyPage(() => import("../pages/wrong-review/page"));
const DailyReviewPage = lazyPage(() => import("../pages/daily-review/page"));
const VocabFavoritesPage = lazyPage(() => import("../pages/vocab-favorites/page"));
const ReviewSchedulePage = lazyPage(() => import("../pages/review-schedule/page"));

// ─── Planning & Roadmap ──────────────────────────────────────────────────────
const RoadmapPage = lazyPage(() => import("../pages/roadmap/page"));
const LearningPathPage = lazyPage(() => import("../pages/learning-path/page"));
const PersonalizedRoadmapPage = lazyPage(() => import("../pages/personalized-roadmap/page"));
const DailyPlanPage = lazyPage(() => import("../pages/daily-plan/page"));
const SchedulerPage = lazyPage(() => import("../pages/scheduler/page"));
const StudyCalendarPage = lazyPage(() => import("../pages/study-calendar/page"));
const StudyReminderPage = lazyPage(() => import("../pages/study-reminder/page"));
const StudyJournalPage = lazyPage(() => import("../pages/study-journal/page"));
const StudyHistoryPage = lazyPage(() => import("../pages/study-history/page"));
const StudyFeedPage = lazyPage(() => import("../pages/study-feed/page"));
const WeeklyReportPage = lazyPage(() => import("../pages/weekly-report/page"));

// ─── Profile & Account ───────────────────────────────────────────────────────
const ProfilePage = lazyPage(() => import("../pages/profile/page"));
const AccountSettingsPage = lazyPage(() => import("../pages/account-settings/page"));
const SettingsPage = lazyPage(() => import("../pages/settings/page"));
const NotificationSettingsPage = lazyPage(() => import("../pages/notification-settings/page"));
const PublicProfilePage = lazyPage(() => import("../pages/public-profile/page"));
const MemberPage = lazyPage(() => import("../pages/member/page"));

// ─── Social & Leaderboard ────────────────────────────────────────────────────
const LeaderboardPage = lazyPage(() => import("../pages/leaderboard/page"));
const ComparePage = lazyPage(() => import("../pages/compare/page"));
const CompareFriendsPage = lazyPage(() => import("../pages/compare-friends/page"));

// ─── Rewards & Gamification ──────────────────────────────────────────────────
const RewardsPage = lazyPage(() => import("../pages/rewards/page"));
const AchievementsPage = lazyPage(() => import("../pages/achievements/page"));
const CouponPage = lazyPage(() => import("../pages/coupon/page"));
const ReferralPage = lazyPage(() => import("../pages/referral/page"));
const CTVPage = lazyPage(() => import("../pages/ctv/page"));
const CTVInfoPage = lazyPage(() => import("../pages/ctv-info/page"));
const PricingPage = lazyPage(() => import("../pages/pricing/page"));
const AdminCTVPage = lazyPage(() => import("../pages/admin-ctv/page"));

// ─── Content ───────────────────────────────────────────────────────────────────
const NaverPage = lazyPage(() => import("../pages/naver/page"));
const NewsPage = lazyPage(() => import("../pages/news/page"));
const EbookPage = lazyPage(() => import("../pages/ebook/page"));
const SeriesPage = lazyPage(() => import("../pages/series/page"));
const PreviewPage = lazyPage(() => import("../pages/preview/page"));
const GuidePage = lazyPage(() => import("../pages/guide/page"));

// ─── Onboarding & Placement ──────────────────────────────────────────────────
const OnboardingPage = lazyPage(() => import("../pages/onboarding/page"), "full");
const PlacementTestPage = lazyPage(() => import("../pages/placement-test/page"));
const LearnOverviewPage = lazyPage(() => import("../pages/learn-overview/page"));
const LearningCertificatePage = lazyPage(() => import("../pages/learning-certificate/page"));

// ─── All Features ───────────────────────────────────────────────────────────
const AllFeaturesPage = lazyPage(() => import("../pages/all-features/page"));

// ─── New Features ────────────────────────────────────────────────────────────
const StudyRoomPage = lazyPage(() => import("../pages/study-room/page"));
const DailyVocabPage = lazyPage(() => import("../pages/daily-vocab/page"));
const QuickQuizPage = lazyPage(() => import("../pages/quick-quiz/page"));
const VocabByTopicPage = lazyPage(() => import("../pages/vocab-by-topic/page"));
const DailyChallengePage = lazyPage(() => import("../pages/daily-challenge/page"));
const ListeningLevelPage = lazyPage(() => import("../pages/listening-level/page"));
const VocabSuggestionPage = lazyPage(() => import("../pages/vocab-suggestion/page"));
const QuizHistoryDetailPage = lazyPage(() => import("../pages/quiz-history-detail/page"));
const FlashcardLevelPage = lazyPage(() => import("../pages/flashcard-level/page"));
const VocabStatsPage = lazyPage(() => import("../pages/vocab-stats/page"));
const StudyPartnerPage = lazyPage(() => import("../pages/study-partner/page"));
const PersonalRoadmapAIPage = lazyPage(() => import("../pages/personal-roadmap-ai/page"));
const Battle1v1Page = lazyPage(() => import("../pages/battle-1v1/page"));
const VideoLessonsPage = lazyPage(() => import("../pages/video-lessons/page"));
const AIPronunciationPage = lazyPage(() => import("../pages/ai-pronunciation/page"));
const AIWritingPage = lazyPage(() => import("../pages/ai-writing/page"));
const KDramaLearnPage = lazyPage(() => import("../pages/kdrama-learn/page"));
const OfflineVocabPage = lazyPage(() => import("../pages/offline-vocab/page"));
const AIChatbotPage = lazyPage(() => import("../pages/ai-chatbot/page"));
const PodcastLearnPage = lazyPage(() => import("../pages/podcast-learn/page"));
const GlobalLeaderboardPage = lazyPage(() => import("../pages/global-leaderboard/page"));
const KoreanNewsPage = lazyPage(() => import("../pages/korean-news/page"));
const HanjaDetailPage = lazyPage(() => import("../pages/hanja-detail/page"));
const HanjaTreePage = lazyPage(() => import("../pages/hanja-tree/page"));
const HanjaDashboardPage = lazyPage(() => import("../pages/hanja-dashboard/page"));
const HanjaProPage = lazyPage(() => import("../pages/hanja-pro/page"));
const HanjaProDetailPage = lazyPage(() => import("../pages/hanja-pro-detail/page"));
const HanjaAnalyticsPage = lazyPage(() => import("../pages/hanja-analytics/page"));
const HanjaStoriesPage = lazyPage(() => import("../pages/hanja-stories/page"));
const FlashcardHubPage = lazyPage(() => import("../pages/flashcard-hub/page"), "flashcard");
const SpeakingLevelPage = lazyPage(() => import("../pages/speaking-level/page"));
const HangulWritingPage = lazyPage(() => import("../pages/hangul-writing/page"));
const TopikVocabLevelPage = lazyPage(() => import("../pages/topik-vocab-level/page"));
const VocabGamesPage = lazyPage(() => import("../pages/vocab-games/page"));
const ListeningByLevelPage = lazyPage(() => import("../pages/listening-by-level/page"));
const AdvancedDictionaryPage = lazyPage(() => import("../pages/advanced-dictionary/page"));
const StudyHistoryDetailPage = lazyPage(() => import("../pages/study-history-detail/page"));
const ReadingByLevelPage = lazyPage(() => import("../pages/reading-by-level/page"));
const GrammarByTopicPage = lazyPage(() => import("../pages/grammar-by-topic/page"));
const AISmartFlashcardPage = lazyPage(() => import("../pages/ai-smart-flashcard/page"));
const WritingByLevelPage = lazyPage(() => import("../pages/writing-by-level/page"));
const VocabInContextPage = lazyPage(() => import("../pages/vocab-in-context/page"));
const DictationPracticePage = lazyPage(() => import("../pages/dictation-practice/page"));
const TranslationPracticePage = lazyPage(() => import("../pages/translation-practice/page"));
const TopikFrequencyVocabPage = lazyPage(() => import("../pages/topik-frequency-vocab/page"));
const SyllablePronunciationPage = lazyPage(() => import("../pages/syllable-pronunciation/page"));
const SpeedListeningPage = lazyPage(() => import("../pages/speed-listening/page"));
const SentencePatternVocabPage = lazyPage(() => import("../pages/sentence-pattern-vocab/page"));
const HangulWritingNewPage = lazyPage(() => import("../pages/hangul-writing/page"));
const AdminContentLearnPage = lazyPage(() => import("../pages/admin-content-learn/page"));
const GrammarByLevelPage = lazyPage(() => import("../pages/grammar-by-level/page"));
const TopikExamWritingPage = lazyPage(() => import("../pages/topik-exam-writing/page"));

// ─── Admin ───────────────────────────────────────────────────────────────────
const AdminDashboardPage = lazyPage(() => import("../pages/admin-dashboard/page"));
const AdminUsersPage = lazyPage(() => import("../pages/admin-users/page"));
const AdminEpsPage = lazyPage(() => import("../pages/admin-eps/page"));
const AdminEpsUploadPage = lazyPage(() => import("../pages/admin-eps-upload/page"));
const AdminCouponPage = lazyPage(() => import("../pages/admin-coupon/page"));
const AdminXPConfigPage = lazyPage(() => import("../pages/admin-xp-config/page"));
const AdminWeeklyRewardsPage = lazyPage(() => import("../pages/admin-weekly-rewards/page"));
const AdminGrammarPage = lazyPage(() => import("../pages/admin-grammar/page"));
const AdminPricingPage = lazyPage(() => import("../pages/admin-pricing/page"));
const AdminSeriesPage = lazyPage(() => import("../pages/admin-series/page"));
const AdminStatsPage = lazyPage(() => import("../pages/admin-stats/page"));
const AdminSettingsPage = lazyPage(() => import("../pages/admin-settings/page"));
const AdminSEOPage = lazyPage(() => import("../pages/admin-seo/page"));
const AdminCategorySEOPage = lazyPage(() => import("../pages/admin-category-seo/page"));
const AdminPaymentPage = lazyPage(() => import("../pages/admin-payment/page"));
const AdminLearnStatsPage = lazyPage(() => import("../pages/admin-learn-stats/page"));
const AdminEpsNewPage = lazyPage(() => import("../pages/admin-eps-new/page"));
const AdminUploadPage = lazyPage(() => import("../pages/admin-upload/page"));
const AdminContentPage = lazyPage(() => import("../pages/admin-content/page"));
const AdminBackupPage = lazyPage(() => import("../pages/admin-backup/page"));
const AdminRolesPage = lazyPage(() => import("../pages/admin-roles/page"));
const AdminAuditPage = lazyPage(() => import("../pages/admin-audit/page"));
const AdminBroadcastPage = lazyPage(() => import("../pages/admin-broadcast/page"));
const AdminSecurityPage = lazyPage(() => import("../pages/admin-security/page"));
const AdminRevenuePage = lazyPage(() => import("../pages/admin-revenue/page"));
const AdminAdsPage = lazyPage(() => import("../pages/admin-ads/page"));
const AdminHanjaPage = lazyPage(() => import("../pages/admin-hanja/page"));
const AdminHanjaExcelPage = lazyPage(() => import("../pages/admin-hanja-excel/page"));
const AdminHanjaProSEOPage = lazyPage(() => import("../pages/admin-hanja-pro-seo/page"));
const AdminControlPage = lazyPage(() => import("../pages/admin-control/page"));
const AdminErrorLogsPage = lazyPage(() => import("../pages/admin-error-logs/page"));
const AdminCommunitySettingsPage = lazyPage(() => import("../pages/admin-community-settings/page"));
const AdminBugsPage = lazyPage(() => import("../pages/admin-bugs/page"));
const AdminVipTransactionsPage = lazyPage(() => import("../pages/admin-vip-transactions/page"));
const AdminZaloReminderPage = lazyPage(() => import("../pages/admin-zalo-reminder/page"));
const AdminFeedbackPage = lazyPage(() => import("../pages/admin-feedback/page"));
const FeedbackPage = lazyPage(() => import("../pages/feedback/page"));
const ReportBugPage = lazyPage(() => import("../pages/report-bug/page"));
const VipHistoryPage = lazyPage(() => import("../pages/vip-history/page"));
const DailyWordsPage = lazyPage(() => import("../pages/daily-words/page"));
const LearningRoadmapPage = lazyPage(() => import("../pages/learning-roadmap/page"));
const StudyStatsPage = lazyPage(() => import("../pages/study-stats/page"));
const DataUploadPage = lazyPage(() => import("../pages/data-upload/page"));
const ShareProgressPage = lazyPage(() => import("../pages/share-progress/page"));

// ─── Routes ───────────────────────────────────────────────────────────────────
const routes: RouteObject[] = [
  { path: "/", element: <Home /> },
  { path: "/dashboard", element: <Home /> },
  { path: "/landing", element: <LandingPage /> },

  // Melon
  { path: "/melon", element: <MelonPage /> },
  { path: "/melon/:rank", element: <MelonDetailPage /> },
  { path: "/melon-history", element: <MelonHistoryPage /> },
  { path: "/melon-stats", element: <MelonStatsPage /> },
  { path: "/melon-flashcard", element: <MelonFlashcardPage /> },
  { path: "/melon-flashcard/shared/:shareId", element: <MelonFlashcardSharedPage /> },
  { path: "/kpop-flashcard", element: <KpopFlashcardPage /> },
  { path: "/eps-melon", element: <EpsMelonPage /> },

  // EPS
  { path: "/eps", element: <EpsPage /> },
  { path: "/eps-exam", element: <EpsExamPage /> },
  { path: "/eps-exam-history", element: <EpsExamHistoryPage /> },
  { path: "/eps-exam-schedule", element: <EpsExamSchedulePage /> },
  { path: "/eps-flashcard", element: <EpsFlashcardPage /> },
  { path: "/eps-lessons", element: <EpsLessonsPage /> },
  { path: "/eps-lesson-quiz", element: <EpsLessonQuizPage /> },
  { path: "/eps-listening", element: <EpsListeningPage /> },
  { path: "/eps-speaking", element: <EpsSpeakingPage /> },
  { path: "/eps-mock-exam", element: <EpsMockExamPage /> },
  { path: "/eps-official-exam", element: <EpsOfficialExamPage /> },
  { path: "/eps-personalized-roadmap", element: <EpsPersonalizedRoadmapPage /> },
  { path: "/eps-progress-roadmap", element: <EpsProgressRoadmapPage /> },
  { path: "/eps-quick-review", element: <EpsQuickReviewPage /> },
  { path: "/eps-review-history", element: <EpsReviewHistoryPage /> },
  { path: "/eps-smart-flashcard", element: <EpsSmartFlashcardPage /> },
  { path: "/eps-smart-wrong", element: <EpsSmartWrongPage /> },
  { path: "/eps-spaced-review", element: <EpsSpacedReviewPage /> },
  { path: "/eps-stats", element: <EpsStatsPage /> },
  { path: "/eps-study-group", element: <EpsStudyGroupPage /> },
  { path: "/eps-topic-dictionary", element: <EpsTopicDictionaryPage /> },
  { path: "/eps-topic-drill", element: <EpsTopicDrillPage /> },
  { path: "/eps-topic-exam", element: <EpsTopicExamPage /> },
  { path: "/eps-topic-stats", element: <EpsTopicStatsPage /> },
  { path: "/eps-topic-study", element: <EpsTopicStudyPage /> },
  { path: "/eps-topics", element: <EpsTopicsPage /> },
  { path: "/eps-vocab-export", element: <EpsVocabExportPage /> },
  { path: "/eps-vocab-flashcard", element: <EpsVocabFlashcardPage /> },
  { path: "/eps-vocabulary", element: <EpsVocabularyPage /> },
  { path: "/eps-weakness-analysis", element: <EpsWeaknessAnalysisPage /> },
  { path: "/eps-weekly-progress", element: <EpsWeeklyProgressPage /> },
  { path: "/eps-wrong-topic", element: <EpsWrongTopicPage /> },
  { path: "/eps-leaderboard", element: <EpsLeaderboardPage /> },
  { path: "/eps-global-leaderboard", element: <EpsGlobalLeaderboardPage /> },
  { path: "/eps-30day-plan", element: <Eps30dayPlanPage /> },
  { path: "/eps-grammar", element: <EpsGrammarPage /> },
  { path: "/eps-lesson/:id", element: <EpsLessonDetailPage /> },

  // Seoul
  { path: "/seoul-textbook", element: <SeoulTextbookPage /> },
  { path: "/seoul-dictionary", element: <SeoulDictionaryPage /> },
  { path: "/seoul-exam", element: <SeoulExamPage /> },
  { path: "/seoul-flashcard", element: <SeoulFlashcardPage /> },
  { path: "/seoul-hanja", element: <SeoulHanjaPage /> },
  { path: "/seoul-learning-path", element: <SeoulLearningPathPage /> },
  { path: "/seoul-lesson-quiz", element: <SeoulLessonQuizPage /> },
  { path: "/seoul-listening-quiz", element: <SeoulListeningQuizPage /> },
  { path: "/seoul-phrases", element: <SeoulPhrasesPage /> },
  { path: "/seoul-placement", element: <SeoulPlacementPage /> },
  { path: "/seoul-practice", element: <SeoulPracticePage /> },
  { path: "/seoul-progress", element: <SeoulProgressPage /> },
  { path: "/seoul-stats", element: <SeoulStatsPage /> },
  { path: "/seoul-streak", element: <SeoulStreakPage /> },
  { path: "/seoul-topic-review", element: <SeoulTopicReviewPage /> },
  { path: "/seoul-topic-study", element: <SeoulTopicStudyPage /> },
  { path: "/seoul-vocab-export", element: <SeoulVocabExportPage /> },
  { path: "/seoul-word-pairs", element: <SeoulWordPairsPage /> },
  { path: "/seoul-writing", element: <SeoulWritingPage /> },
  { path: "/seoul-wrong-review", element: <SeoulWrongReviewPage /> },
  { path: "/seoul-vocab-practice", element: <SeoulVocabPracticePage /> },
  { path: "/seoul-grammar", element: <SeoulGrammarPage /> },

  // TOPIK
  { path: "/topik-test", element: <TopikTestPage /> },
  { path: "/topik2-test", element: <Topik2TestPage /> },
  { path: "/topik-dictionary", element: <TopikDictionaryPage /> },
  { path: "/topik-flashcard", element: <TopikFlashcardPage /> },
  { path: "/topik-listening", element: <TopikListeningPage /> },
  { path: "/topik-reading", element: <TopikReadingPage /> },
  { path: "/topik-stats", element: <TopikStatsPage /> },
  { path: "/topik-topic-quiz", element: <TopikTopicQuizPage /> },

  // Hangul
  { path: "/hangul", element: <HangulPage /> },
  { path: "/hangul-canvas", element: <HangulCanvasPage /> },
  { path: "/hangul-write", element: <HangulWritePage /> },

  // Hanja
  { path: "/hanja-vocab", element: <HanjaVocabPage /> },

  // Community
  { path: "/community", element: <CommunityPage /> },
  { path: "/community/:id", element: <CommunityPostDetailPage /> },
  { path: "/community-ranks", element: <CommunityRanksPage /> },

  // Challenge
  { path: "/challenge", element: <ChallengePage /> },
  { path: "/challenge-history", element: <ChallengeHistoryPage /> },
  { path: "/challenge-leaderboard", element: <ChallengeLeaderboardPage /> },
  { path: "/challenge-stats", element: <ChallengeStatsPage /> },
  { path: "/friend-challenge", element: <FriendChallengePage /> },
  { path: "/friend-streak", element: <FriendStreakPage /> },
  { path: "/weekly-challenge", element: <WeeklyChallengePage /> },

  // Stats & Progress
  { path: "/stats", element: <StatsPage /> },
  { path: "/overall-stats", element: <OverallStatsPage /> },
  { path: "/personal-stats", element: <PersonalStatsPage /> },
  { path: "/learn-stats", element: <LearnStatsPage /> },
  { path: "/study-analytics", element: <StudyAnalyticsPage /> },
  { path: "/study-stats-detail", element: <StudyStatsDetailPage /> },
  { path: "/progress", element: <ProgressPage /> },
  { path: "/xp-stats", element: <XpStatsPage /> },
  { path: "/learning-hub", element: <RequireAuth title="Learning Hub"><LearningHubPage /></RequireAuth> },
  { path: "/exam-hub", element: <RequireAuth title="Exam Hub"><ExamHubPage /></RequireAuth> },

  // Study tools
  { path: "/flashcard", element: <FlashcardPage /> },
  { path: "/grammar", element: <GrammarPage /> },
  { path: "/vocabulary", element: <VocabularyPage /> },
  { path: "/dictionary", element: <DictionaryPage /> },
  { path: "/phrase-dictionary", element: <PhraseDictionaryPage /> },
  { path: "/quiz", element: <QuizPage /> },
  { path: "/pronunciation", element: <PronunciationPage /> },
  { path: "/listen-practice", element: <ListenPracticePage /> },
  { path: "/conversation", element: <ConversationPage /> },
  { path: "/smart-review", element: <SmartReviewPage /> },
  { path: "/wrong-review", element: <WrongReviewPage /> },
  { path: "/daily-review", element: <DailyReviewPage /> },
  { path: "/vocab-favorites", element: <VocabFavoritesPage /> },
  { path: "/review-schedule", element: <ReviewSchedulePage /> },

  // Planning & Roadmap
  { path: "/roadmap", element: <RoadmapPage /> },
  { path: "/learning-path", element: <LearningPathPage /> },
  { path: "/personalized-roadmap", element: <PersonalizedRoadmapPage /> },
  { path: "/daily-plan", element: <DailyPlanPage /> },
  { path: "/scheduler", element: <SchedulerPage /> },
  { path: "/study-calendar", element: <StudyCalendarPage /> },
  { path: "/study-reminder", element: <StudyReminderPage /> },
  { path: "/study-journal", element: <RequireAuth title="Nhật ký học"><StudyJournalPage /></RequireAuth> },
  { path: "/study-history", element: <RequireAuth title="Lịch sử học"><StudyHistoryPage /></RequireAuth> },
  { path: "/study-feed", element: <StudyFeedPage /> },
  { path: "/weekly-report", element: <RequireAuth title="Báo cáo tuần"><WeeklyReportPage /></RequireAuth> },

  // Profile & Account
  { path: "/profile", element: <RequireAuth title="Hồ sơ cá nhân"><ProfilePage /></RequireAuth> },
  { path: "/account-settings", element: <RequireAuth title="Cài đặt tài khoản"><AccountSettingsPage /></RequireAuth> },
  { path: "/settings", element: <RequireAuth title="Cài đặt"><SettingsPage /></RequireAuth> },
  { path: "/notification-settings", element: <RequireAuth title="Cài đặt thông báo"><NotificationSettingsPage /></RequireAuth> },
  { path: "/public-profile/:userId", element: <PublicProfilePage /> },
  { path: "/member/:userId", element: <MemberPage /> },

  // Social & Leaderboard
  { path: "/leaderboard", element: <LeaderboardPage /> },
  { path: "/compare", element: <ComparePage /> },
  { path: "/compare-friends", element: <CompareFriendsPage /> },

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
  { path: "/ebook", element: <EbookPage /> },
  { path: "/series", element: <SeriesPage /> },
  { path: "/preview/:seriesId", element: <PreviewPage /> },
  { path: "/guide", element: <GuidePage /> },

  // Onboarding & Placement
  { path: "/onboarding", element: <OnboardingPage /> },
  { path: "/placement-test", element: <PlacementTestPage /> },
  { path: "/learn-overview", element: <LearnOverviewPage /> },
  { path: "/learning-certificate", element: <LearningCertificatePage /> },

  // Admin
  { path: "/admin", element: <AdminDashboardPage /> },
  { path: "/admin/users", element: <AdminUsersPage /> },
  { path: "/admin/coupon", element: <RequirePermission permission="users.vip"><AdminCouponPage /></RequirePermission> },
  { path: "/admin/xp-config", element: <RequirePermission permission="system.settings"><AdminXPConfigPage /></RequirePermission> },
  { path: "/admin/weekly-rewards", element: <AdminWeeklyRewardsPage /> },
  { path: "/admin/grammar", element: <AdminGrammarPage /> },
  { path: "/admin/pricing", element: <RequirePermission permission="system.settings"><AdminPricingPage /></RequirePermission> },
  { path: "/admin/series", element: <AdminSeriesPage /> },
  { path: "/admin/stats", element: <AdminStatsPage /> },
  { path: "/admin/settings", element: <RequirePermission permission="system.settings"><AdminSettingsPage /></RequirePermission> },
  { path: "/admin/seo", element: <RequirePermission permission="system.settings"><AdminSEOPage /></RequirePermission> },
  { path: "/admin/category-seo", element: <RequirePermission permission="system.settings"><AdminCategorySEOPage /></RequirePermission> },
  { path: "/admin/payment", element: <RequirePermission permission="users.vip"><AdminPaymentPage /></RequirePermission> },
  { path: "/admin/learn-stats", element: <AdminLearnStatsPage /> },
  { path: "/admin/eps", element: <AdminEpsNewPage /> },
  { path: "/admin/eps-new", element: <AdminEpsNewPage /> },
  { path: "/admin/upload", element: <RequirePermission permission="eps.upload"><AdminUploadPage /></RequirePermission> },
  { path: "/admin/content", element: <AdminContentPage /> },
  { path: "/admin/backup", element: <RequirePermission permission="system.settings"><AdminBackupPage /></RequirePermission> },
  { path: "/admin/roles", element: <RequirePermission permission="system.roles"><AdminRolesPage /></RequirePermission> },
  { path: "/admin/audit", element: <RequirePermission permission="system.settings"><AdminAuditPage /></RequirePermission> },
  { path: "/admin/broadcast", element: <RequirePermission permission="system.broadcast"><AdminBroadcastPage /></RequirePermission> },
  { path: "/admin/security", element: <RequirePermission permission="system.settings"><AdminSecurityPage /></RequirePermission> },
  { path: "/admin/revenue", element: <RequirePermission permission="users.vip"><AdminRevenuePage /></RequirePermission> },
  { path: "/admin/ads", element: <RequirePermission permission="system.settings"><AdminAdsPage /></RequirePermission> },
  { path: "/admin/hanja", element: <AdminGuard><AdminHanjaPage /></AdminGuard> },
  { path: "/admin/hanja-excel", element: <RequirePermission permission="eps.upload"><AdminHanjaExcelPage /></RequirePermission> },
  { path: "/admin/hanja-pro-seo", element: <AdminGuard><AdminHanjaProSEOPage /></AdminGuard> },
  { path: "/admin/ctv", element: <AdminGuard><AdminCTVPage /></AdminGuard> },
  { path: "/admin/control", element: <RequirePermission permission="system.settings"><AdminControlPage /></RequirePermission> },
  { path: "/admin/bugs", element: <AdminBugsPage /> },
  { path: "/admin/vip-transactions", element: <RequirePermission permission="users.vip"><AdminVipTransactionsPage /></RequirePermission> },
  { path: "/admin/zalo-reminder", element: <RequirePermission permission="system.broadcast"><AdminZaloReminderPage /></RequirePermission> },
  { path: "/admin/feedback", element: <AdminFeedbackPage /> },
  { path: "/admin/error-logs", element: <RequirePermission permission="system.settings"><AdminErrorLogsPage /></RequirePermission> },
  { path: "/admin/community-settings", element: <RequirePermission permission="content.view"><AdminCommunitySettingsPage /></RequirePermission> },
  { path: "/feedback", element: <FeedbackPage /> },
  { path: "/report-bug", element: <ReportBugPage /> },
  { path: "/vip-history", element: <RequireAuth title="Lịch sử VIP"><VipHistoryPage /></RequireAuth> },
  { path: "/daily-words", element: <DailyWordsPage /> },
  { path: "/learning-roadmap", element: <LearningRoadmapPage /> },
  { path: "/study-stats", element: <RequireAuth title="Thống kê học tập"><StudyStatsPage /></RequireAuth> },
  { path: "/data-upload", element: <AdminGuard><DataUploadPage /></AdminGuard> },
  { path: "/share-progress", element: <RequireAuth title="Chia sẻ tiến độ" message="Đăng nhập để tạo và tải ảnh tiến độ học tập của bạn."><ShareProgressPage /></RequireAuth> },
  // Legacy routes (giữ lại để không break links cũ)
  { path: "/admin-eps", element: <AdminEpsPage /> },
  { path: "/admin-eps-upload", element: <AdminEpsUploadPage /> },

  // All Features
  { path: "/all-features", element: <AllFeaturesPage /> },

  // New Features
  { path: "/study-room", element: <StudyRoomPage /> },
  { path: "/daily-vocab", element: <DailyVocabPage /> },
  { path: "/quick-quiz", element: <QuickQuizPage /> },
  { path: "/vocab-by-topic", element: <VocabByTopicPage /> },
  { path: "/daily-challenge", element: <DailyChallengePage /> },
  { path: "/listening-level", element: <ListeningLevelPage /> },
  { path: "/vocab-suggestion", element: <VocabSuggestionPage /> },
  { path: "/quiz-history-detail", element: <QuizHistoryDetailPage /> },
  { path: "/flashcard-level", element: <FlashcardLevelPage /> },
  { path: "/vocab-stats", element: <VocabStatsPage /> },
  { path: "/study-partner", element: <StudyPartnerPage /> },
  { path: "/personal-roadmap-ai", element: <PersonalRoadmapAIPage /> },
  { path: "/battle-1v1", element: <Battle1v1Page /> },
  { path: "/video-lessons", element: <VideoLessonsPage /> },
  { path: "/ai-pronunciation", element: <AIPronunciationPage /> },
  { path: "/ai-writing", element: <AIWritingPage /> },
  { path: "/kdrama-learn", element: <KDramaLearnPage /> },
  { path: "/offline-vocab", element: <OfflineVocabPage /> },
  { path: "/ai-chatbot", element: <AIChatbotPage /> },
  { path: "/podcast-learn", element: <PodcastLearnPage /> },
  { path: "/global-leaderboard", element: <GlobalLeaderboardPage /> },
  { path: "/korean-news", element: <KoreanNewsPage /> },
  { path: "/hanja-detail", element: <HanjaDetailPage /> },
  { path: "/hanja-tree", element: <HanjaTreePage /> },
  { path: "/hanja-dashboard", element: <HanjaDashboardPage /> },
  { path: "/hanja-pro", element: <HanjaProPage /> },
  { path: "/hanja-pro/:slug", element: <HanjaProDetailPage /> },
  { path: "/hanja-analytics", element: <HanjaAnalyticsPage /> },
  { path: "/hanja-stories", element: <HanjaStoriesPage /> },
  { path: "/flashcard-hub", element: <FlashcardHubPage /> },
  { path: "/speaking-level", element: <SpeakingLevelPage /> },
  { path: "/hangul-writing", element: <HangulWritingPage /> },
  { path: "/topik-vocab-level", element: <TopikVocabLevelPage /> },
  { path: "/vocab-games", element: <VocabGamesPage /> },
  { path: "/listening-by-level", element: <ListeningByLevelPage /> },
  { path: "/advanced-dictionary", element: <AdvancedDictionaryPage /> },
  { path: "/study-history-detail", element: <StudyHistoryDetailPage /> },
  { path: "/reading-by-level", element: <ReadingByLevelPage /> },
  { path: "/grammar-by-topic", element: <GrammarByTopicPage /> },
  { path: "/ai-smart-flashcard", element: <AISmartFlashcardPage /> },
  { path: "/writing-by-level", element: <WritingByLevelPage /> },
  { path: "/vocab-in-context", element: <VocabInContextPage /> },
  { path: "/dictation-practice", element: <DictationPracticePage /> },
  { path: "/translation-practice", element: <TranslationPracticePage /> },
  { path: "/topik-frequency-vocab", element: <TopikFrequencyVocabPage /> },
  { path: "/syllable-pronunciation", element: <SyllablePronunciationPage /> },
  { path: "/speed-listening", element: <SpeedListeningPage /> },
  { path: "/sentence-pattern-vocab", element: <SentencePatternVocabPage /> },
  { path: "/admin/content-learn", element: <AdminContentLearnPage /> },
  { path: "/grammar-by-level", element: <GrammarByLevelPage /> },
  { path: "/topik-exam-writing", element: <TopikExamWritingPage /> },

  // Misc
  { path: "*", element: <NotFound /> },
];

export default routes;