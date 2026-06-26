import type { RouteObject } from "react-router-dom";
import { lazyPage } from "../utils";

const SeoulTextbookPage = lazyPage(() => import("../../pages/seoul-textbook/page"));
const SeoulDictionaryPage = lazyPage(() => import("../../pages/seoul-dictionary/page"));
const SeoulExamPage = lazyPage(() => import("../../pages/seoul-exam/page"));
const SeoulFlashcardPage = lazyPage(() => import("../../pages/seoul-flashcard/page"));
const SeoulHanjaPage = lazyPage(() => import("../../pages/seoul-hanja/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): seoul-learning-path removed
// const SeoulLearningPathPage = lazyPage(() => import("../../pages/seoul-learning-path/page"));
const SeoulLessonQuizPage = lazyPage(() => import("../../pages/seoul-lesson-quiz/page"));
const SeoulListeningQuizPage = lazyPage(() => import("../../pages/seoul-listening-quiz/page"));
const SeoulPhrasesPage = lazyPage(() => import("../../pages/seoul-phrases/page"));
const SeoulPlacementPage = lazyPage(() => import("../../pages/seoul-placement/page"));
const SeoulPracticePage = lazyPage(() => import("../../pages/seoul-practice/page"));
const SeoulProgressPage = lazyPage(() => import("../../pages/seoul-progress/page"));
const SeoulStatsPage = lazyPage(() => import("../../pages/seoul-stats/page"));
const SeoulStreakPage = lazyPage(() => import("../../pages/seoul-streak/page"));
const SeoulTopicReviewPage = lazyPage(() => import("../../pages/seoul-topic-review/page"));
const SeoulTopicStudyPage = lazyPage(() => import("../../pages/seoul-topic-study/page"));
const SeoulVocabExportPage = lazyPage(() => import("../../pages/seoul-vocab-export/page"));
const SeoulWordPairsPage = lazyPage(() => import("../../pages/seoul-word-pairs/page"));
const SeoulWritingPage = lazyPage(() => import("../../pages/seoul-writing/page"));
const SeoulWrongReviewPage = lazyPage(() => import("../../pages/seoul-wrong-review/page"));
const SeoulVocabPracticePage = lazyPage(() => import("../../pages/seoul-vocab-practice/page"), "flashcard");
const SeoulGrammarPage = lazyPage(() => import("../../pages/seoul-grammar/page"));

export const seoulRoutes: RouteObject[] = [
  { path: "/seoul-textbook", element: <SeoulTextbookPage /> },
  { path: "/seoul-dictionary", element: <SeoulDictionaryPage /> },
  { path: "/seoul-exam", element: <SeoulExamPage /> },
  { path: "/seoul-flashcard", element: <SeoulFlashcardPage /> },
  { path: "/seoul-hanja", element: <SeoulHanjaPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): seoul-learning-path removed
  // { path: "/seoul-learning-path", element: <SeoulLearningPathPage /> },
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
];
