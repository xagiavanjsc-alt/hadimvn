import type { RouteObject } from "react-router-dom";
import { lazyPage } from "../utils";

const TopikTestPage = lazyPage(() => import("../../pages/topik-test/page"), "exam");
// HIDDEN 2026-06-27 (consolidate TOPIK pages): topik2-test removed
// const Topik2TestPage = lazyPage(() => import("../../pages/topik2-test/page"), "exam");
const TopikDictionaryPage = lazyPage(() => import("../../pages/topik-dictionary/page"), "vocab");
const TopikFlashcardPage = lazyPage(() => import("../../pages/topik-flashcard/page"), "flashcard");
// HIDDEN 2026-06-27 (consolidate TOPIK pages): topik-listening removed
// const TopikListeningPage = lazyPage(() => import("../../pages/topik-listening/page"));
// HIDDEN 2026-06-27 (consolidate TOPIK pages): topik-reading removed
// const TopikReadingPage = lazyPage(() => import("../../pages/topik-reading/page"));
const TopikStatsPage = lazyPage(() => import("../../pages/topik-stats/page"));
// HIDDEN 2026-06-27 (consolidate TOPIK pages): topik-topic-quiz removed
// const TopikTopicQuizPage = lazyPage(() => import("../../pages/topik-topic-quiz/page"));
// HIDDEN 2026-06-27 (consolidate TOPIK pages): topik-vocab-level removed
// const TopikVocabLevelPage = lazyPage(() => import("../../pages/topik-vocab-level/page"));
// HIDDEN 2026-06-27 (consolidate TOPIK pages): topik-frequency-vocab removed
// const TopikFrequencyVocabPage = lazyPage(() => import("../../pages/topik-frequency-vocab/page"));
// HIDDEN 2026-06-27 (consolidate TOPIK pages): topik-exam-writing removed
// const TopikExamWritingPage = lazyPage(() => import("../../pages/topik-exam-writing/page"));

export const topikRoutes: RouteObject[] = [
  { path: "/topik-test", element: <TopikTestPage /> },
  { path: "/topik2-test", element: <Topik2TestPage /> },
  { path: "/topik-dictionary", element: <TopikDictionaryPage /> },
  { path: "/topik-flashcard", element: <TopikFlashcardPage /> },
  // HIDDEN 2026-06-27 (consolidate TOPIK pages): topik-listening removed
  // { path: "/topik-listening", element: <TopikListeningPage /> },
  // HIDDEN 2026-06-27 (consolidate TOPIK pages): topik-reading removed
  // { path: "/topik-reading", element: <TopikReadingPage /> },
  { path: "/topik-stats", element: <TopikStatsPage /> },
  // HIDDEN 2026-06-27 (consolidate TOPIK pages): topik-topic-quiz removed
  // { path: "/topik-topic-quiz", element: <TopikTopicQuizPage /> },
  // HIDDEN 2026-06-27 (consolidate TOPIK pages): topik-vocab-level removed
  // { path: "/topik-vocab-level", element: <TopikVocabLevelPage /> },
  // HIDDEN 2026-06-27 (consolidate TOPIK pages): topik-frequency-vocab removed
  // { path: "/topik-frequency-vocab", element: <TopikFrequencyVocabPage /> },
  // HIDDEN 2026-06-27 (consolidate TOPIK pages): topik-exam-writing removed
  // { path: "/topik-exam-writing", element: <TopikExamWritingPage /> },
];
