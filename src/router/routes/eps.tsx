import type { RouteObject } from "react-router-dom";
import { lazyPage } from "../utils";

const EpsPage = lazyPage(() => import("../../pages/eps/page"));
const EpsExamPage = lazyPage(() => import("../../pages/eps-exam/page"), "exam");
const EpsExamHistoryPage = lazyPage(() => import("../../pages/eps-exam-history/page"));
const EpsExamSchedulePage = lazyPage(() => import("../../pages/eps-exam-schedule/page"));
const EpsFlashcardPage = lazyPage(() => import("../../pages/eps-flashcard/page"), "flashcard");
const EpsLessonsPage = lazyPage(() => import("../../pages/eps-lessons/page"));
const EpsLessonQuizPage = lazyPage(() => import("../../pages/eps-lesson-quiz/page"));
const EpsListeningPage = lazyPage(() => import("../../pages/eps-listening/page"));
const EpsSpeakingPage = lazyPage(() => import("../../pages/eps-speaking/page"));
const EpsMockExamPage = lazyPage(() => import("../../pages/eps-mock-exam/page"), "exam");
// HIDDEN 2026-05-26: eps-official-exam has fake upload parser, non-decrementing
// timer, and previously shipped fake "Đề thi EPS-TOPIK 2023/2022" with random
// correctIndex (CLAUDE.md Rule 5 violation). Code preserved per Rule 4.
// const EpsOfficialExamPage = lazyPage(() => import("../../pages/eps-official-exam/page"), "exam");
const EpsDe1ExamPage = lazyPage(() => import("../../pages/eps-de1-exam/page"), "exam");
const EpsDe2ExamPage = lazyPage(() => import("../../pages/eps-de2-exam/page"), "exam");
const EpsPersonalizedRoadmapPage = lazyPage(() => import("../../pages/eps-personalized-roadmap/page"));
const EpsProgressRoadmapPage = lazyPage(() => import("../../pages/eps-progress-roadmap/page"));
const EpsQuickReviewPage = lazyPage(() => import("../../pages/eps-quick-review/page"));
const EpsReviewHistoryPage = lazyPage(() => import("../../pages/eps-review-history/page"));
const EpsSmartFlashcardPage = lazyPage(() => import("../../pages/eps-smart-flashcard/page"), "flashcard");
const EpsSmartWrongPage = lazyPage(() => import("../../pages/eps-smart-wrong/page"));
const EpsSpacedReviewPage = lazyPage(() => import("../../pages/eps-spaced-review/page"), "flashcard");
const EpsStatsPage = lazyPage(() => import("../../pages/eps-stats/page"));
const EpsStudyGroupPage = lazyPage(() => import("../../pages/eps-study-group/page"));
const EpsTopicDictionaryPage = lazyPage(() => import("../../pages/eps-topic-dictionary/page"));
const EpsTopicDrillPage = lazyPage(() => import("../../pages/eps-topic-drill/page"));
const EpsTopicExamPage = lazyPage(() => import("../../pages/eps-topic-exam/page"));
const EpsTopicStatsPage = lazyPage(() => import("../../pages/eps-topic-stats/page"));
const EpsTopicStudyPage = lazyPage(() => import("../../pages/eps-topic-study/page"));
const EpsTopicsPage = lazyPage(() => import("../../pages/eps-topics/page"));
const EpsVocabExportPage = lazyPage(() => import("../../pages/eps-vocab-export/page"));
const EpsVocabFlashcardPage = lazyPage(() => import("../../pages/eps-vocab-flashcard/page"), "flashcard");
const EpsVocabularyPage = lazyPage(() => import("../../pages/eps-vocabulary/page"), "vocab");
const EpsWeaknessAnalysisPage = lazyPage(() => import("../../pages/eps-weakness-analysis/page"));
const EpsWeeklyProgressPage = lazyPage(() => import("../../pages/eps-weekly-progress/page"));
const EpsWrongTopicPage = lazyPage(() => import("../../pages/eps-wrong-topic/page"));
const EpsLeaderboardPage = lazyPage(() => import("../../pages/eps-leaderboard/page"));
const EpsGlobalLeaderboardPage = lazyPage(() => import("../../pages/eps-global-leaderboard/page"));
const Eps30dayPlanPage = lazyPage(() => import("../../pages/eps-30day-plan/page"));
const EpsGrammarPage = lazyPage(() => import("../../pages/eps-grammar/page"));
const EpsLessonDetailPage = lazyPage(() => import("../../pages/eps-lesson-detail/page"));
const EpsExamsPage = lazyPage(() => import("../../pages/eps-exams/page"), "exam");

export const epsRoutes: RouteObject[] = [
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
  // HIDDEN 2026-05-26: see lazyPage block above
  // { path: "/eps-official-exam", element: <EpsOfficialExamPage /> },
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
  { path: "/eps-exams", element: <EpsExamsPage /> },
  { path: "/eps-de1", element: <EpsDe1ExamPage /> },
  { path: "/eps-de2", element: <EpsDe2ExamPage /> },
];
