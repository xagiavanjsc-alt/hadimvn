import type { RouteObject } from "react-router-dom";
import { lazyPage } from "../utils";

const HanjaVocabPage = lazyPage(() => import("../../pages/hanja-vocab/page"));
// HIDDEN 2026-06-27 (consolidate Hanja pages): hanja-flashcard removed
// const HanjaFlashcardPage = lazyPage(() => import("../../pages/hanja-flashcard/page"), "flashcard");
// HIDDEN 2026-06-27 (consolidate Hanja pages): hanja-detail removed
// const HanjaDetailPage = lazyPage(() => import("../../pages/hanja-detail/page"));
// HIDDEN 2026-06-27 (consolidate Hanja pages): hanja-dashboard removed
// const HanjaDashboardPage = lazyPage(() => import("../../pages/hanja-dashboard/page"));
// HIDDEN 2026-06-27 (consolidate Hanja pages): hanja-pro removed
// const HanjaProPage = lazyPage(() => import("../../pages/hanja-pro/page"));
// HIDDEN 2026-06-27 (consolidate Hanja pages): hanja-pro-detail removed
// const HanjaProDetailPage = lazyPage(() => import("../../pages/hanja-pro-detail/page"));
// HIDDEN 2026-06-27 (consolidate Hanja pages): hanja-analytics removed
// const HanjaAnalyticsPage = lazyPage(() => import("../../pages/hanja-analytics/page"));
const HanjaStoriesPage = lazyPage(() => import("../../pages/hanja-stories/page"));

export const hanjaRoutes: RouteObject[] = [
  { path: "/hanja-vocab", element: <HanjaVocabPage /> },
  // HIDDEN 2026-06-27 (consolidate Hanja pages): hanja-flashcard removed
  // { path: "/hanja-flashcard", element: <HanjaFlashcardPage /> },
  // HIDDEN 2026-06-27 (consolidate Hanja pages): hanja-detail removed
  // { path: "/hanja-detail", element: <HanjaDetailPage /> },
  // HIDDEN 2026-06-27 (consolidate Hanja pages): hanja-dashboard removed
  // { path: "/hanja-dashboard", element: <HanjaDashboardPage /> },
  // HIDDEN 2026-06-27 (consolidate Hanja pages): hanja-pro removed
  // { path: "/hanja-pro", element: <HanjaProPage /> },
  // HIDDEN 2026-06-27 (consolidate Hanja pages): hanja-pro-detail removed
  // { path: "/hanja-pro/:slug", element: <HanjaProDetailPage /> },
  // HIDDEN 2026-06-27 (consolidate Hanja pages): hanja-analytics removed
  // { path: "/hanja-analytics", element: <HanjaAnalyticsPage /> },
  { path: "/hanja-stories", element: <HanjaStoriesPage /> },
];
