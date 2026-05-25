import type { RouteObject } from "react-router-dom";
import { lazyPage } from "../utils";

const TopikTestPage = lazyPage(() => import("../../pages/topik-test/page"), "exam");
const Topik2TestPage = lazyPage(() => import("../../pages/topik2-test/page"), "exam");
const TopikDictionaryPage = lazyPage(() => import("../../pages/topik-dictionary/page"), "vocab");
const TopikFlashcardPage = lazyPage(() => import("../../pages/topik-flashcard/page"), "flashcard");
const TopikListeningPage = lazyPage(() => import("../../pages/topik-listening/page"));
const TopikReadingPage = lazyPage(() => import("../../pages/topik-reading/page"));
const TopikStatsPage = lazyPage(() => import("../../pages/topik-stats/page"));
const TopikTopicQuizPage = lazyPage(() => import("../../pages/topik-topic-quiz/page"));
const TopikVocabLevelPage = lazyPage(() => import("../../pages/topik-vocab-level/page"));
const TopikFrequencyVocabPage = lazyPage(() => import("../../pages/topik-frequency-vocab/page"));
const TopikExamWritingPage = lazyPage(() => import("../../pages/topik-exam-writing/page"));

export const topikRoutes: RouteObject[] = [
  { path: "/topik-test", element: <TopikTestPage /> },
  { path: "/topik2-test", element: <Topik2TestPage /> },
  { path: "/topik-dictionary", element: <TopikDictionaryPage /> },
  { path: "/topik-flashcard", element: <TopikFlashcardPage /> },
  { path: "/topik-listening", element: <TopikListeningPage /> },
  { path: "/topik-reading", element: <TopikReadingPage /> },
  { path: "/topik-stats", element: <TopikStatsPage /> },
  { path: "/topik-topic-quiz", element: <TopikTopicQuizPage /> },
  { path: "/topik-vocab-level", element: <TopikVocabLevelPage /> },
  { path: "/topik-frequency-vocab", element: <TopikFrequencyVocabPage /> },
  { path: "/topik-exam-writing", element: <TopikExamWritingPage /> },
];
