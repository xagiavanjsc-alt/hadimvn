import type { RouteObject } from "react-router-dom";
import { lazyPage } from "../utils";

const HanjaVocabPage = lazyPage(() => import("../../pages/hanja-vocab/page"));
const HanjaFlashcardPage = lazyPage(() => import("../../pages/hanja-flashcard/page"), "flashcard");
const HanjaDetailPage = lazyPage(() => import("../../pages/hanja-detail/page"));
const HanjaDashboardPage = lazyPage(() => import("../../pages/hanja-dashboard/page"));
const HanjaProPage = lazyPage(() => import("../../pages/hanja-pro/page"));
const HanjaProDetailPage = lazyPage(() => import("../../pages/hanja-pro-detail/page"));
const HanjaAnalyticsPage = lazyPage(() => import("../../pages/hanja-analytics/page"));
const HanjaStoriesPage = lazyPage(() => import("../../pages/hanja-stories/page"));

export const hanjaRoutes: RouteObject[] = [
  { path: "/hanja-vocab", element: <HanjaVocabPage /> },
  { path: "/hanja-flashcard", element: <HanjaFlashcardPage /> },
  { path: "/hanja-detail", element: <HanjaDetailPage /> },
  { path: "/hanja-dashboard", element: <HanjaDashboardPage /> },
  { path: "/hanja-pro", element: <HanjaProPage /> },
  { path: "/hanja-pro/:slug", element: <HanjaProDetailPage /> },
  { path: "/hanja-analytics", element: <HanjaAnalyticsPage /> },
  { path: "/hanja-stories", element: <HanjaStoriesPage /> },
];
