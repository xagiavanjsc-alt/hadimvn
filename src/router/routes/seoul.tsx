import type { RouteObject } from "react-router-dom";
import { lazyPage } from "../utils";

const SeoulTextbookPage = lazyPage(() => import("../../pages/seoul-textbook/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-dictionary removed
// const SeoulDictionaryPage = lazyPage(() => import("../../pages/seoul-dictionary/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-exam removed
// const SeoulExamPage = lazyPage(() => import("../../pages/seoul-exam/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-flashcard removed
// const SeoulFlashcardPage = lazyPage(() => import("../../pages/seoul-flashcard/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-hanja removed
// const SeoulHanjaPage = lazyPage(() => import("../../pages/seoul-hanja/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): seoul-learning-path removed
// const SeoulLearningPathPage = lazyPage(() => import("../../pages/seoul-learning-path/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-lesson-quiz removed
// const SeoulLessonQuizPage = lazyPage(() => import("../../pages/seoul-lesson-quiz/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-listening-quiz removed
// const SeoulListeningQuizPage = lazyPage(() => import("../../pages/seoul-listening-quiz/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-phrases removed
// const SeoulPhrasesPage = lazyPage(() => import("../../pages/seoul-phrases/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-placement removed
// const SeoulPlacementPage = lazyPage(() => import("../../pages/seoul-placement/page"));
const SeoulPracticePage = lazyPage(() => import("../../pages/seoul-practice/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-progress removed
// const SeoulProgressPage = lazyPage(() => import("../../pages/seoul-progress/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-stats removed
// const SeoulStatsPage = lazyPage(() => import("../../pages/seoul-stats/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-streak removed
// const SeoulStreakPage = lazyPage(() => import("../../pages/seoul-streak/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-topic-review removed
// const SeoulTopicReviewPage = lazyPage(() => import("../../pages/seoul-topic-review/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-topic-study removed
// const SeoulTopicStudyPage = lazyPage(() => import("../../pages/seoul-topic-study/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-vocab-export removed
// const SeoulVocabExportPage = lazyPage(() => import("../../pages/seoul-vocab-export/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-word-pairs removed
// const SeoulWordPairsPage = lazyPage(() => import("../../pages/seoul-word-pairs/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-writing removed
// const SeoulWritingPage = lazyPage(() => import("../../pages/seoul-writing/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-wrong-review removed
// const SeoulWrongReviewPage = lazyPage(() => import("../../pages/seoul-wrong-review/page"));
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-vocab-practice removed
// const SeoulVocabPracticePage = lazyPage(() => import("../../pages/seoul-vocab-practice/page"), "flashcard");
// HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-grammar removed
// const SeoulGrammarPage = lazyPage(() => import("../../pages/seoul-grammar/page"));

export const seoulRoutes: RouteObject[] = [
  { path: "/seoul-textbook", element: <SeoulTextbookPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-dictionary removed
  // { path: "/seoul-dictionary", element: <SeoulDictionaryPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-exam removed
  // { path: "/seoul-exam", element: <SeoulExamPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-flashcard removed
  // { path: "/seoul-flashcard", element: <SeoulFlashcardPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-hanja removed
  // { path: "/seoul-hanja", element: <SeoulHanjaPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): seoul-learning-path removed
  // { path: "/seoul-learning-path", element: <SeoulLearningPathPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-lesson-quiz removed
  // { path: "/seoul-lesson-quiz", element: <SeoulLessonQuizPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-listening-quiz removed
  // { path: "/seoul-listening-quiz", element: <SeoulListeningQuizPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-phrases removed
  // { path: "/seoul-phrases", element: <SeoulPhrasesPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-placement removed
  // { path: "/seoul-placement", element: <SeoulPlacementPage /> },
  { path: "/seoul-practice", element: <SeoulPracticePage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-progress removed
  // { path: "/seoul-progress", element: <SeoulProgressPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-stats removed
  // { path: "/seoul-stats", element: <SeoulStatsPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-streak removed
  // { path: "/seoul-streak", element: <SeoulStreakPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-topic-review removed
  // { path: "/seoul-topic-review", element: <SeoulTopicReviewPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-topic-study removed
  // { path: "/seoul-topic-study", element: <SeoulTopicStudyPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-vocab-export removed
  // { path: "/seoul-vocab-export", element: <SeoulVocabExportPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-word-pairs removed
  // { path: "/seoul-word-pairs", element: <SeoulWordPairsPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-writing removed
  // { path: "/seoul-writing", element: <SeoulWritingPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-wrong-review removed
  // { path: "/seoul-wrong-review", element: <SeoulWrongReviewPage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-vocab-practice removed
  // { path: "/seoul-vocab-practice", element: <SeoulVocabPracticePage /> },
  // HIDDEN 2026-06-27 (consolidate Seoul pages): seoul-grammar removed
  // { path: "/seoul-grammar", element: <SeoulGrammarPage /> },
];
