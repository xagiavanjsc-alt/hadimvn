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
import { hanjaRoutes } from "./routes/hanja";

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
// HIDDEN 2026-05-25 (focus EPS+du học): K-pop / entertainment, not EPS audience. Code preserved per CLAUDE.md Rule 4.
// const MelonPage = lazyPage(() => import("../pages/melon/page"));
// const MelonDetailPage = lazyPage(() => import("../pages/melon-detail/page"));
// const MelonHistoryPage = lazyPage(() => import("../pages/melon-history/page"));
// const MelonStatsPage = lazyPage(() => import("../pages/melon-stats/page"));
// const MelonFlashcardPage = lazyPage(() => import("../pages/melon-flashcard/page"));
// const MelonFlashcardSharedPage = lazyPage(() => import("../pages/melon-flashcard-shared/page"));
// const KpopFlashcardPage = lazyPage(() => import("../pages/kpop-flashcard/page"));
// const EpsMelonPage = lazyPage(() => import("../pages/eps-melon/page"));

// ─── EPS, Seoul, Admin routes ────────────────────────────────────────────────
// Lazy imports moved to ./routes/eps.tsx, ./routes/seoul.tsx, ./routes/admin.tsx

// ─── TOPIK + Hanja moved to ./routes/topik.tsx and ./routes/hanja.tsx ────────

// ─── Hangul ──────────────────────────────────────────────────────────────────
const HangulPage = lazyPage(() => import("../pages/hangul/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): duplicate hangul page, keep /hangul-write as canonical
// const HangulCanvasPage = lazyPage(() => import("../pages/hangul-canvas/page"));
const HangulWritePage = lazyPage(() => import("../pages/hangul-write/page"));

// ─── Hanja basic routes moved to ./routes/hanja.tsx ─────────────────────────

// ─── Community ────────────────────────────────────────────────────────────────
const CommunityPage = lazyPage(() => import("../pages/community/page"));
const CommunityPostDetailPage = lazyPage(() => import("../pages/community/post-detail-page"));
const CommunityRanksPage = lazyPage(() => import("../pages/community-ranks/page"));

// ─── Challenge ───────────────────────────────────────────────────────────────
const ChallengePage = lazyPage(() => import("../pages/challenge/page"));
const ChallengeHistoryPage = lazyPage(() => import("../pages/challenge-history/page"));
const ChallengeLeaderboardPage = lazyPage(() => import("../pages/challenge-leaderboard/page"));
const ChallengeStatsPage = lazyPage(() => import("../pages/challenge-stats/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): social games, not EPS audience
// const FriendChallengePage = lazyPage(() => import("../pages/friend-challenge/page"));
// const FriendStreakPage = lazyPage(() => import("../pages/friend-streak/page"));
const WeeklyChallengePage = lazyPage(() => import("../pages/weekly-challenge/page"));

// ─── Stats & Progress ────────────────────────────────────────────────────────
const StatsPage = lazyPage(() => import("../pages/stats/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): generic stats duplicate, use /eps-stats or /study-stats
// const OverallStatsPage = lazyPage(() => import("../pages/overall-stats/page"));
const PersonalStatsPage = lazyPage(() => import("../pages/personal-stats/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): generic stats duplicates
// const LearnStatsPage = lazyPage(() => import("../pages/learn-stats/page"));
// const StudyAnalyticsPage = lazyPage(() => import("../pages/study-analytics/page"));
// const StudyStatsDetailPage = lazyPage(() => import("../pages/study-stats-detail/page"));
const ProgressPage = lazyPage(() => import("../pages/progress/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): XP gamification noise, not EPS-relevant
// const XpStatsPage = lazyPage(() => import("../pages/xp-stats/page"));
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
// HIDDEN 2026-05-25 (focus EPS+du học): generic roadmap duplicates, EPS audience uses /eps-30day-plan or /eps-personalized-roadmap
// const LearningPathPage = lazyPage(() => import("../pages/learning-path/page"));
// const PersonalizedRoadmapPage = lazyPage(() => import("../pages/personalized-roadmap/page"));
const DailyPlanPage = lazyPage(() => import("../pages/daily-plan/page"));
const SchedulerPage = lazyPage(() => import("../pages/scheduler/page"));
const StudyCalendarPage = lazyPage(() => import("../pages/study-calendar/page"));
const StudyReminderPage = lazyPage(() => import("../pages/study-reminder/page"));
const StudyJournalPage = lazyPage(() => import("../pages/study-journal/page"));
const StudyHistoryPage = lazyPage(() => import("../pages/study-history/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): social feed, not EPS audience
// const StudyFeedPage = lazyPage(() => import("../pages/study-feed/page"));
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
// HIDDEN 2026-05-25 (focus EPS+du học): social comparison, not EPS audience
// const CompareFriendsPage = lazyPage(() => import("../pages/compare-friends/page"));

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
// HIDDEN 2026-05-25 (focus EPS+du học): social games, not EPS audience
// const StudyRoomPage = lazyPage(() => import("../pages/study-room/page"));
const DailyVocabPage = lazyPage(() => import("../pages/daily-vocab/page"));
const QuickQuizPage = lazyPage(() => import("../pages/quick-quiz/page"));
const VocabByTopicPage = lazyPage(() => import("../pages/vocab-by-topic/page"));
const DailyChallengePage = lazyPage(() => import("../pages/daily-challenge/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): generic listening level duplicate, use /eps-listening or /listen-practice
// const ListeningLevelPage = lazyPage(() => import("../pages/listening-level/page"));
const VocabSuggestionPage = lazyPage(() => import("../pages/vocab-suggestion/page"));
const QuizHistoryDetailPage = lazyPage(() => import("../pages/quiz-history-detail/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): generic flashcard duplicate, use /eps-flashcard
// const FlashcardLevelPage = lazyPage(() => import("../pages/flashcard-level/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): generic vocab stats duplicate, /eps-topic-stats covers this
// const VocabStatsPage = lazyPage(() => import("../pages/vocab-stats/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): off-focus social/AI features. Code preserved per CLAUDE.md Rule 4.
// const StudyPartnerPage = lazyPage(() => import("../pages/study-partner/page"));
// const PersonalRoadmapAIPage = lazyPage(() => import("../pages/personal-roadmap-ai/page"));
// const Battle1v1Page = lazyPage(() => import("../pages/battle-1v1/page"));
const VideoLessonsPage = lazyPage(() => import("../pages/video-lessons/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): AI gimmick
// const AIPronunciationPage = lazyPage(() => import("../pages/ai-pronunciation/page"));
const ShadowingPracticePage = lazyPage(() => import("../pages/shadowing-practice/page"));
const ListeningDictationPage = lazyPage(() => import("../pages/listening-dictation/page"));
const HandwritingPracticePage = lazyPage(() => import("../pages/handwriting-practice/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): cultural content, off-focus
// const CulturalContentPage = lazyPage(() => import("../pages/cultural-content/page"));
const OfflineManagerPage = lazyPage(() => import("../pages/offline-manager/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): AI gimmick + K-drama, off-focus
// const AIWritingPage = lazyPage(() => import("../pages/ai-writing/page"));
// const KDramaLearnPage = lazyPage(() => import("../pages/kdrama-learn/page"));
const OfflineVocabPage = lazyPage(() => import("../pages/offline-vocab/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): AI chatbot + podcast, off-focus
// const AIChatbotPage = lazyPage(() => import("../pages/ai-chatbot/page"));
// const PodcastLearnPage = lazyPage(() => import("../pages/podcast-learn/page"));
const GlobalLeaderboardPage = lazyPage(() => import("../pages/global-leaderboard/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): Korean news, off-focus
// const KoreanNewsPage = lazyPage(() => import("../pages/korean-news/page"));
// Hanja detail/pro/analytics/stories moved to ./routes/hanja.tsx
// HIDDEN 2026-05-25 (focus EPS+du học): generic flashcard hub duplicate, use /eps-flashcard or /seoul-flashcard
// const FlashcardHubPage = lazyPage(() => import("../pages/flashcard-hub/page"), "flashcard");
const SpeakingLevelPage = lazyPage(() => import("../pages/speaking-level/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): duplicate hangul page, keep /hangul-write as canonical
// const HangulWritingPage = lazyPage(() => import("../pages/hangul-writing/page"));
// TopikVocabLevel moved to ./routes/topik.tsx
const VocabGamesPage = lazyPage(() => import("../pages/vocab-games/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): duplicate of /listening-level (same level-based listening concept)
// const ListeningByLevelPage = lazyPage(() => import("../pages/listening-by-level/page"));
const AdvancedDictionaryPage = lazyPage(() => import("../pages/advanced-dictionary/page"));
const StudyHistoryDetailPage = lazyPage(() => import("../pages/study-history-detail/page"));
const ReadingByLevelPage = lazyPage(() => import("../pages/reading-by-level/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): generic grammar by topic duplicate, EPS audience uses /eps-grammar
// const GrammarByTopicPage = lazyPage(() => import("../pages/grammar-by-topic/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): AI gimmick, off-focus
// const AISmartFlashcardPage = lazyPage(() => import("../pages/ai-smart-flashcard/page"));
const WritingByLevelPage = lazyPage(() => import("../pages/writing-by-level/page"));
const VocabInContextPage = lazyPage(() => import("../pages/vocab-in-context/page"));
const DictationPracticePage = lazyPage(() => import("../pages/dictation-practice/page"));
const TranslationPracticePage = lazyPage(() => import("../pages/translation-practice/page"));
// TopikFrequencyVocab moved to ./routes/topik.tsx
const SyllablePronunciationPage = lazyPage(() => import("../pages/syllable-pronunciation/page"));
const SpeedListeningPage = lazyPage(() => import("../pages/speed-listening/page"));
const SentencePatternVocabPage = lazyPage(() => import("../pages/sentence-pattern-vocab/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): duplicate of HangulWritingPage above
// const HangulWritingNewPage = lazyPage(() => import("../pages/hangul-writing/page"));
// AdminContentLearnPage moved to ./routes/admin.tsx
// HIDDEN 2026-05-25 (focus EPS+du học): generic grammar by level duplicate, EPS audience uses /eps-grammar
// const GrammarByLevelPage = lazyPage(() => import("../pages/grammar-by-level/page"));
// TopikExamWriting moved to ./routes/topik.tsx

// ─── Admin lazy imports moved to ./routes/admin.tsx ──────────────────────────
const FeedbackPage = lazyPage(() => import("../pages/feedback/page"));
const ReportBugPage = lazyPage(() => import("../pages/report-bug/page"));
const VipHistoryPage = lazyPage(() => import("../pages/vip-history/page"));
const DailyWordsPage = lazyPage(() => import("../pages/daily-words/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): generic learning roadmap duplicate, EPS audience uses /eps-30day-plan
// const LearningRoadmapPage = lazyPage(() => import("../pages/learning-roadmap/page"));
const StudyStatsPage = lazyPage(() => import("../pages/study-stats/page"));
// DataUploadPage moved to ./routes/admin.tsx
const ShareProgressPage = lazyPage(() => import("../pages/share-progress/page"));

// ─── Routes ───────────────────────────────────────────────────────────────────
const routes: RouteObject[] = [
  { path: "/", element: <Home /> },
  { path: "/dashboard", element: <Home /> },
  { path: "/landing", element: <LandingPage /> },

  // Melon — HIDDEN 2026-05-25 (focus EPS+du học): K-pop entertainment, not EPS audience
  // { path: "/melon", element: <MelonPage /> },
  // { path: "/melon/:rank", element: <MelonDetailPage /> },
  // { path: "/melon-history", element: <MelonHistoryPage /> },
  // { path: "/melon-stats", element: <MelonStatsPage /> },
  // { path: "/melon-flashcard", element: <MelonFlashcardPage /> },
  // { path: "/melon-flashcard/shared/:shareId", element: <MelonFlashcardSharedPage /> },
  // { path: "/kpop-flashcard", element: <KpopFlashcardPage /> },
  // { path: "/eps-melon", element: <EpsMelonPage /> },

  // EPS — moved to ./routes/eps.tsx
  ...epsRoutes,

  // Seoul — moved to ./routes/seoul.tsx
  ...seoulRoutes,

  // TOPIK
  // TOPIK — moved to ./routes/topik.tsx
  ...topikRoutes,

  // Hangul
  { path: "/hangul", element: <HangulPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): duplicate hangul, keep /hangul-write as canonical
  // { path: "/hangul-canvas", element: <HangulCanvasPage /> },
  { path: "/hangul-write", element: <HangulWritePage /> },

  // Hanja
  // Hanja — moved to ./routes/hanja.tsx
  ...hanjaRoutes,

  // Community
  { path: "/community", element: <CommunityPage /> },
  { path: "/community/:id", element: <CommunityPostDetailPage /> },
  { path: "/community-ranks", element: <CommunityRanksPage /> },

  // Challenge
  { path: "/challenge", element: <ChallengePage /> },
  { path: "/challenge-history", element: <ChallengeHistoryPage /> },
  { path: "/challenge-leaderboard", element: <ChallengeLeaderboardPage /> },
  { path: "/challenge-stats", element: <ChallengeStatsPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): social games, not EPS audience
  // { path: "/friend-challenge", element: <FriendChallengePage /> },
  // { path: "/friend-streak", element: <FriendStreakPage /> },
  { path: "/weekly-challenge", element: <WeeklyChallengePage /> },

  // Stats & Progress
  { path: "/stats", element: <StatsPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): generic stats duplicates. EPS users use /eps-stats; du học users use /seoul-stats, /topik-stats
  // { path: "/overall-stats", element: <OverallStatsPage /> },
  { path: "/personal-stats", element: <PersonalStatsPage /> },
  // { path: "/learn-stats", element: <LearnStatsPage /> },
  // { path: "/study-analytics", element: <StudyAnalyticsPage /> },
  // { path: "/study-stats-detail", element: <StudyStatsDetailPage /> },
  { path: "/progress", element: <ProgressPage /> },
  // { path: "/xp-stats", element: <XpStatsPage /> },
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
  // HIDDEN 2026-05-25 (focus EPS+du học): generic roadmap duplicates. EPS audience uses /eps-30day-plan or /eps-personalized-roadmap
  // { path: "/learning-path", element: <LearningPathPage /> },
  // { path: "/personalized-roadmap", element: <PersonalizedRoadmapPage /> },
  { path: "/daily-plan", element: <DailyPlanPage /> },
  { path: "/scheduler", element: <SchedulerPage /> },
  { path: "/study-calendar", element: <StudyCalendarPage /> },
  { path: "/study-reminder", element: <StudyReminderPage /> },
  { path: "/study-journal", element: <RequireAuth title="Nhật ký học"><StudyJournalPage /></RequireAuth> },
  { path: "/study-history", element: <RequireAuth title="Lịch sử học"><StudyHistoryPage /></RequireAuth> },
  // HIDDEN 2026-05-25 (focus EPS+du học): social feed, not EPS audience
  // { path: "/study-feed", element: <StudyFeedPage /> },
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
  // HIDDEN 2026-05-25 (focus EPS+du học): social comparison, not EPS audience
  // { path: "/compare-friends", element: <CompareFriendsPage /> },

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

  // Admin — moved to ./routes/admin.tsx
  ...adminRoutes,
  { path: "/feedback", element: <FeedbackPage /> },
  { path: "/report-bug", element: <ReportBugPage /> },
  { path: "/vip-history", element: <RequireAuth title="Lịch sử VIP"><VipHistoryPage /></RequireAuth> },
  { path: "/daily-words", element: <DailyWordsPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): generic learning roadmap duplicate, EPS audience uses /eps-30day-plan
  // { path: "/learning-roadmap", element: <LearningRoadmapPage /> },
  { path: "/study-stats", element: <RequireAuth title="Thống kê học tập"><StudyStatsPage /></RequireAuth> },
  { path: "/share-progress", element: <RequireAuth title="Chia sẻ tiến độ" message="Đăng nhập để tạo và tải ảnh tiến độ học tập của bạn."><ShareProgressPage /></RequireAuth> },

  // All Features
  { path: "/all-features", element: <AllFeaturesPage /> },

  // New Features
  // HIDDEN 2026-05-25 (focus EPS+du học): social games, not EPS audience
  // { path: "/study-room", element: <StudyRoomPage /> },
  { path: "/daily-vocab", element: <DailyVocabPage /> },
  { path: "/quick-quiz", element: <QuickQuizPage /> },
  { path: "/vocab-by-topic", element: <VocabByTopicPage /> },
  { path: "/daily-challenge", element: <DailyChallengePage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): use /eps-listening or /listen-practice
  // { path: "/listening-level", element: <ListeningLevelPage /> },
  { path: "/vocab-suggestion", element: <VocabSuggestionPage /> },
  { path: "/quiz-history-detail", element: <QuizHistoryDetailPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): generic duplicates, use EPS-specific equivalents
  // { path: "/flashcard-level", element: <FlashcardLevelPage /> },
  // { path: "/vocab-stats", element: <VocabStatsPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): off-focus social/AI features. Code preserved per CLAUDE.md Rule 4.
  // { path: "/study-partner", element: <StudyPartnerPage /> },
  // { path: "/personal-roadmap-ai", element: <PersonalRoadmapAIPage /> },
  // { path: "/battle-1v1", element: <Battle1v1Page /> },
  { path: "/video-lessons", element: <VideoLessonsPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): AI gimmick
  // { path: "/ai-pronunciation", element: <AIPronunciationPage /> },
  { path: "/shadowing-practice", element: <ShadowingPracticePage /> },
  { path: "/listening-dictation", element: <ListeningDictationPage /> },
  { path: "/handwriting-practice", element: <HandwritingPracticePage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): cultural content, off-focus
  // { path: "/cultural-content", element: <CulturalContentPage /> },
  { path: "/offline-manager", element: <OfflineManagerPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): AI gimmick + K-drama, off-focus
  // { path: "/ai-writing", element: <AIWritingPage /> },
  // { path: "/kdrama-learn", element: <KDramaLearnPage /> },
  { path: "/offline-vocab", element: <OfflineVocabPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): AI chatbot + podcast, off-focus
  // { path: "/ai-chatbot", element: <AIChatbotPage /> },
  // { path: "/podcast-learn", element: <PodcastLearnPage /> },
  { path: "/global-leaderboard", element: <GlobalLeaderboardPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): Korean news, off-focus
  // { path: "/korean-news", element: <KoreanNewsPage /> },
  // Hanja extras moved to ./routes/hanja.tsx (included in ...hanjaRoutes above)
  // HIDDEN 2026-05-25 (focus EPS+du học): generic flashcard hub, use /eps-flashcard or /seoul-flashcard
  // { path: "/flashcard-hub", element: <FlashcardHubPage /> },
  { path: "/speaking-level", element: <SpeakingLevelPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): duplicate hangul, keep /hangul-write
  // { path: "/hangul-writing", element: <HangulWritingPage /> },
  // TopikVocabLevel moved to ./routes/topik.tsx
  { path: "/vocab-games", element: <VocabGamesPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): duplicate of /listening-level
  // { path: "/listening-by-level", element: <ListeningByLevelPage /> },
  { path: "/advanced-dictionary", element: <AdvancedDictionaryPage /> },
  { path: "/study-history-detail", element: <StudyHistoryDetailPage /> },
  { path: "/reading-by-level", element: <ReadingByLevelPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): EPS users use /eps-grammar
  // { path: "/grammar-by-topic", element: <GrammarByTopicPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): AI gimmick, off-focus
  // { path: "/ai-smart-flashcard", element: <AISmartFlashcardPage /> },
  { path: "/writing-by-level", element: <WritingByLevelPage /> },
  { path: "/vocab-in-context", element: <VocabInContextPage /> },
  { path: "/dictation-practice", element: <DictationPracticePage /> },
  { path: "/translation-practice", element: <TranslationPracticePage /> },
  // TopikFrequencyVocab moved to ./routes/topik.tsx
  { path: "/syllable-pronunciation", element: <SyllablePronunciationPage /> },
  { path: "/speed-listening", element: <SpeedListeningPage /> },
  { path: "/sentence-pattern-vocab", element: <SentencePatternVocabPage /> },
  // /admin/content-learn moved to ./routes/admin.tsx (already in adminRoutes spread above)
  // HIDDEN 2026-05-25 (focus EPS+du học): EPS users use /eps-grammar
  // { path: "/grammar-by-level", element: <GrammarByLevelPage /> },
  // TopikExamWriting moved to ./routes/topik.tsx

  // Misc
  { path: "*", element: <NotFound /> },
];

export default routes;