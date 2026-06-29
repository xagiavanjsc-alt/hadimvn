import type { RouteObject } from "react-router-dom";
import { lazyPage } from "../utils";

const EpsPage = lazyPage(() => import("../../pages/eps/page"));
const EpsExamPage = lazyPage(() => import("../../pages/eps-exam/page"), "exam");
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-exam-history removed
// const EpsExamHistoryPage = lazyPage(() => import("../../pages/eps-exam-history/page"));
const EpsExamSchedulePage = lazyPage(() => import("../../pages/eps-exam-schedule/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-flashcard removed
// const EpsFlashcardPage = lazyPage(() => import("../../pages/eps-flashcard/page"), "flashcard");
const EpsLessonsPage = lazyPage(() => import("../../pages/eps-lessons/page"));
const EpsLessonQuizPage = lazyPage(() => import("../../pages/eps-lesson-quiz/page"));
const VocabReviewPage = lazyPage(() => import("../../pages/vocab-review/page"), "flashcard");
const GamificationPage = lazyPage(() => import("../../pages/gamification/page"));
const ListeningPracticePage = lazyPage(() => import("../../pages/listening-practice/page"));
const StudyGroupsPage = lazyPage(() => import("../../pages/study-groups/page"));
const QAForumPage = lazyPage(() => import("../../pages/qa-forum/page"));
const OfflineDownloadsPage = lazyPage(() => import("../../pages/offline-downloads/page"));
const NotificationSettingsPage = lazyPage(() => import("../../pages/notification-settings/page"));
const SuccessStoriesPage = lazyPage(() => import("../../pages/success-stories/page"));
const LearningPathPage = lazyPage(() => import("../../pages/learning-path/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-listening removed
// const EpsListeningPage = lazyPage(() => import("../../pages/eps-listening/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-speaking removed
// const EpsSpeakingPage = lazyPage(() => import("../../pages/eps-speaking/page"));
const EpsMockExamPage = lazyPage(() => import("../../pages/eps-mock-exam/page"), "exam");
// HIDDEN 2026-05-26: eps-official-exam has fake upload parser, non-decrementing
// timer, and previously shipped fake "Đề thi EPS-TOPIK 2023/2022" with random
// correctIndex (CLAUDE.md Rule 5 violation). Code preserved per Rule 4.
// const EpsOfficialExamPage = lazyPage(() => import("../../pages/eps-official-exam/page"), "exam");
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-de1-exam removed
// const EpsDe1ExamPage = lazyPage(() => import("../../pages/eps-de1-exam/page"), "exam");
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-de2-exam removed
// const EpsDe2ExamPage = lazyPage(() => import("../../pages/eps-de2-exam/page"), "exam");
// HIDDEN 2026-05-25 (focus EPS+du học): eps-personalized-roadmap removed
// const EpsPersonalizedRoadmapPage = lazyPage(() => import("../../pages/eps-personalized-roadmap/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-progress-roadmap removed
// const EpsProgressRoadmapPage = lazyPage(() => import("../../pages/eps-progress-roadmap/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-quick-review removed
// const EpsQuickReviewPage = lazyPage(() => import("../../pages/eps-quick-review/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-review-history removed
// const EpsReviewHistoryPage = lazyPage(() => import("../../pages/eps-review-history/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-smart-flashcard removed
// const EpsSmartFlashcardPage = lazyPage(() => import("../../pages/eps-smart-flashcard/page"), "flashcard");
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-smart-wrong removed
// const EpsSmartWrongPage = lazyPage(() => import("../../pages/eps-smart-wrong/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-spaced-review removed
// const EpsSpacedReviewPage = lazyPage(() => import("../../pages/eps-spaced-review/page"), "flashcard");
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-stats removed
// const EpsStatsPage = lazyPage(() => import("../../pages/eps-stats/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-study-group removed
// const EpsStudyGroupPage = lazyPage(() => import("../../pages/eps-study-group/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-topic-dictionary removed
// const EpsTopicDictionaryPage = lazyPage(() => import("../../pages/eps-topic-dictionary/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-topic-drill removed
// const EpsTopicDrillPage = lazyPage(() => import("../../pages/eps-topic-drill/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-topic-exam removed
// const EpsTopicExamPage = lazyPage(() => import("../../pages/eps-topic-exam/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-topic-stats removed
// const EpsTopicStatsPage = lazyPage(() => import("../../pages/eps-topic-stats/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-topic-study removed
// const EpsTopicStudyPage = lazyPage(() => import("../../pages/eps-topic-study/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-topics removed
// const EpsTopicsPage = lazyPage(() => import("../../pages/eps-topics/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-vocab-export removed
// const EpsVocabExportPage = lazyPage(() => import("../../pages/eps-vocab-export/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-vocab-flashcard removed
// const EpsVocabFlashcardPage = lazyPage(() => import("../../pages/eps-vocab-flashcard/page"), "flashcard");
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-vocabulary removed
// const EpsVocabularyPage = lazyPage(() => import("../../pages/eps-vocabulary/page"), "vocab");
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-weakness-analysis removed
// const EpsWeaknessAnalysisPage = lazyPage(() => import("../../pages/eps-weakness-analysis/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-weekly-progress removed
// const EpsWeeklyProgressPage = lazyPage(() => import("../../pages/eps-weekly-progress/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-wrong-topic removed
// const EpsWrongTopicPage = lazyPage(() => import("../../pages/eps-wrong-topic/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-leaderboard removed
// const EpsLeaderboardPage = lazyPage(() => import("../../pages/eps-leaderboard/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-global-leaderboard removed
// const EpsGlobalLeaderboardPage = lazyPage(() => import("../../pages/eps-global-leaderboard/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-30day-plan removed
// const Eps30dayPlanPage = lazyPage(() => import("../../pages/eps-30day-plan/page"));
// HIDDEN 2026-06-27 (consolidate EPS pages): eps-grammar removed
// const EpsGrammarPage = lazyPage(() => import("../../pages/eps-grammar/page"));
const EpsLessonDetailPage = lazyPage(() => import("../../pages/eps-lesson-detail/page"));
const EpsExamsPage = lazyPage(() => import("../../pages/eps-exams/page"), "exam");

export const epsRoutes: RouteObject[] = [
  { path: "/eps", element: <EpsPage /> },
  { path: "/eps-exam", element: <EpsExamPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-exam-history removed
  // { path: "/eps-exam-history", element: <EpsExamHistoryPage /> },
  { path: "/eps-exam-schedule", element: <EpsExamSchedulePage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-flashcard removed
  // { path: "/eps-flashcard", element: <EpsFlashcardPage /> },
  { path: "/eps-lessons", element: <EpsLessonsPage /> },
  { path: "/eps-lesson-quiz", element: <EpsLessonQuizPage /> },
  { path: "/eps-lesson-detail/:lessonId", element: <EpsLessonDetailPage /> },
  { path: "/eps-exams", element: <EpsExamsPage /> },
  { path: "/vocab-review", element: <VocabReviewPage /> },
  { path: "/gamification", element: <GamificationPage /> },
  { path: "/listening-practice", element: <ListeningPracticePage /> },
  { path: "/study-groups", element: <StudyGroupsPage /> },
  { path: "/qa-forum", element: <QAForumPage /> },
  { path: "/offline-downloads", element: <OfflineDownloadsPage /> },
  { path: "/notification-settings", element: <NotificationSettingsPage /> },
  { path: "/success-stories", element: <SuccessStoriesPage /> },
  { path: "/learning-path", element: <LearningPathPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-listening removed
  // { path: "/eps-listening", element: <EpsListeningPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-speaking removed
  // { path: "/eps-speaking", element: <EpsSpeakingPage /> },
  { path: "/eps-mock-exam", element: <EpsMockExamPage /> },
  // HIDDEN 2026-05-26: see lazyPage block above
  // { path: "/eps-official-exam", element: <EpsOfficialExamPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): eps-personalized-roadmap removed
  // { path: "/eps-personalized-roadmap", element: <EpsPersonalizedRoadmapPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-progress-roadmap removed
  // { path: "/eps-progress-roadmap", element: <EpsProgressRoadmapPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-quick-review removed
  // { path: "/eps-quick-review", element: <EpsQuickReviewPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-review-history removed
  // { path: "/eps-review-history", element: <EpsReviewHistoryPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-smart-flashcard removed
  // { path: "/eps-smart-flashcard", element: <EpsSmartFlashcardPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-smart-wrong removed
  // { path: "/eps-smart-wrong", element: <EpsSmartWrongPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-spaced-review removed
  // { path: "/eps-spaced-review", element: <EpsSpacedReviewPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-stats removed
  // { path: "/eps-stats", element: <EpsStatsPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-study-group removed
  // { path: "/eps-study-group", element: <EpsStudyGroupPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-topic-dictionary removed
  // { path: "/eps-topic-dictionary", element: <EpsTopicDictionaryPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-topic-drill removed
  // { path: "/eps-topic-drill", element: <EpsTopicDrillPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-topic-exam removed
  // { path: "/eps-topic-exam", element: <EpsTopicExamPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-topic-stats removed
  // { path: "/eps-topic-stats", element: <EpsTopicStatsPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-topic-study removed
  // { path: "/eps-topic-study", element: <EpsTopicStudyPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-topics removed
  // { path: "/eps-topics", element: <EpsTopicsPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-vocab-export removed
  // { path: "/eps-vocab-export", element: <EpsVocabExportPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-vocab-flashcard removed
  // { path: "/eps-vocab-flashcard", element: <EpsVocabFlashcardPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-vocabulary removed
  // { path: "/eps-vocabulary", element: <EpsVocabularyPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-weakness-analysis removed
  // { path: "/eps-weakness-analysis", element: <EpsWeaknessAnalysisPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-weekly-progress removed
  // { path: "/eps-weekly-progress", element: <EpsWeeklyProgressPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-wrong-topic removed
  // { path: "/eps-wrong-topic", element: <EpsWrongTopicPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-leaderboard removed
  // { path: "/eps-leaderboard", element: <EpsLeaderboardPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-global-leaderboard removed
  // { path: "/eps-global-leaderboard", element: <EpsGlobalLeaderboardPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-30day-plan removed
  // { path: "/eps-30day-plan", element: <Eps30dayPlanPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-grammar removed
  // { path: "/eps-grammar", element: <EpsGrammarPage /> },
  { path: "/eps-lesson/:id", element: <EpsLessonDetailPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-exams removed
  // { path: "/eps-exams", element: <EpsExamsPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-de1-exam removed
  // { path: "/eps-de1", element: <EpsDe1ExamPage /> },
  // HIDDEN 2026-06-27 (consolidate EPS pages): eps-de2-exam removed
  // { path: "/eps-de2", element: <EpsDe2ExamPage /> },
];
