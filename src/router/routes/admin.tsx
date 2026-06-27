import type { RouteObject } from "react-router-dom";
import AdminGuard from "@/components/feature/AdminGuard";
import RequirePermission from "@/components/feature/RequirePermission";
import { lazyPage } from "../utils";

const AdminDashboardPage = lazyPage(() => import("../../pages/admin-dashboard/page"));
const AdminUsersPage = lazyPage(() => import("../../pages/admin-users/page"));
const AdminEpsPage = lazyPage(() => import("../../pages/admin-eps/page"));
const AdminEpsUploadPage = lazyPage(() => import("../../pages/admin-eps-upload/page"));
const AdminCouponPage = lazyPage(() => import("../../pages/admin-coupon/page"));
const AdminXPConfigPage = lazyPage(() => import("../../pages/admin-xp-config/page"));
const AdminWeeklyRewardsPage = lazyPage(() => import("../../pages/admin-weekly-rewards/page"));
const AdminGrammarPage = lazyPage(() => import("../../pages/admin-grammar/page"));
const AdminPricingPage = lazyPage(() => import("../../pages/admin-pricing/page"));
// HIDDEN 2026-06-27 (focus EPS/TOPIK): admin-series removed (ebook feature)
// const AdminSeriesPage = lazyPage(() => import("../../pages/admin-series/page"));
const AdminStatsPage = lazyPage(() => import("../../pages/admin-stats/page"));
const AdminSettingsPage = lazyPage(() => import("../../pages/admin-settings/page"));
const AdminSEOPage = lazyPage(() => import("../../pages/admin-seo/page"));
const AdminCategorySEOPage = lazyPage(() => import("../../pages/admin-category-seo/page"));
const AdminPaymentPage = lazyPage(() => import("../../pages/admin-payment/page"));
const AdminLearnStatsPage = lazyPage(() => import("../../pages/admin-learn-stats/page"));
const AdminEpsNewPage = lazyPage(() => import("../../pages/admin-eps-new/page"));
const AdminUploadPage = lazyPage(() => import("../../pages/admin-upload/page"));
const AdminContentPage = lazyPage(() => import("../../pages/admin-content/page"));
const AdminBackupPage = lazyPage(() => import("../../pages/admin-backup/page"));
const AdminRolesPage = lazyPage(() => import("../../pages/admin-roles/page"));
const AdminAuditPage = lazyPage(() => import("../../pages/admin-audit/page"));
const AdminBroadcastPage = lazyPage(() => import("../../pages/admin-broadcast/page"));
const AdminSecurityPage = lazyPage(() => import("../../pages/admin-security/page"));
const AdminRevenuePage = lazyPage(() => import("../../pages/admin-revenue/page"));
const AdminAdsPage = lazyPage(() => import("../../pages/admin-ads/page"));
const AdminHanjaPage = lazyPage(() => import("../../pages/admin-hanja/page"));
const AdminHanjaExcelPage = lazyPage(() => import("../../pages/admin-hanja-excel/page"));
const AdminEpsVocabExcelPage = lazyPage(() => import("../../pages/admin-eps-vocab-excel/page"));
const AdminEpsExamManagerPage = lazyPage(() => import("../../pages/admin-eps-exam-manager/page"));
const AdminHanjaAudioPage = lazyPage(() => import("../../pages/admin-hanja-audio/page"));
const AdminAudioPage = lazyPage(() => import("../../pages/admin-audio/page"));
const AdminHanjaProSEOPage = lazyPage(() => import("../../pages/admin-hanja-pro-seo/page"));
const AdminControlPage = lazyPage(() => import("../../pages/admin-control/page"));
const AdminErrorLogsPage = lazyPage(() => import("../../pages/admin-error-logs/page"));
const AdminCommunitySettingsPage = lazyPage(() => import("../../pages/admin-community-settings/page"));
const AdminBugsPage = lazyPage(() => import("../../pages/admin-bugs/page"));
const AdminVipTransactionsPage = lazyPage(() => import("../../pages/admin-vip-transactions/page"));
const AdminZaloReminderPage = lazyPage(() => import("../../pages/admin-zalo-reminder/page"));
const AdminFeedbackPage = lazyPage(() => import("../../pages/admin-feedback/page"));
// HIDDEN 2026-05-25 (focus EPS+du học): admin-melon removed
// const AdminMelonPage = lazyPage(() => import("../../pages/admin-melon/page"));
const AdminNaverKinPage = lazyPage(() => import("../../pages/admin-naver-kin/page"));
const AdminCTVPage = lazyPage(() => import("../../pages/admin-ctv/page"));
const AdminContentLearnPage = lazyPage(() => import("../../pages/admin-content-learn/page"));
const DataUploadPage = lazyPage(() => import("../../pages/data-upload/page"));

export const adminRoutes: RouteObject[] = [
  { path: "/admin", element: <AdminDashboardPage /> },
  { path: "/admin/users", element: <AdminUsersPage /> },
  { path: "/admin/coupon", element: <RequirePermission permission="users.vip"><AdminCouponPage /></RequirePermission> },
  { path: "/admin/xp-config", element: <RequirePermission permission="system.settings"><AdminXPConfigPage /></RequirePermission> },
  { path: "/admin/weekly-rewards", element: <AdminWeeklyRewardsPage /> },
  { path: "/admin/grammar", element: <AdminGrammarPage /> },
  { path: "/admin/pricing", element: <RequirePermission permission="system.settings"><AdminPricingPage /></RequirePermission> },
  // HIDDEN 2026-06-27 (focus EPS/TOPIK): admin-series removed (ebook feature)
  // { path: "/admin/series", element: <AdminSeriesPage /> },
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
  { path: "/admin/hanja-audio", element: <AdminGuard><AdminHanjaAudioPage /></AdminGuard> },
  { path: "/admin/audio", element: <AdminGuard><AdminAudioPage /></AdminGuard> },
  { path: "/admin/hanja-excel", element: <RequirePermission permission="eps.upload"><AdminHanjaExcelPage /></RequirePermission> },
  { path: "/admin/eps-vocab-excel", element: <RequirePermission permission="eps.upload"><AdminEpsVocabExcelPage /></RequirePermission> },
  { path: "/admin/eps-exam-manager", element: <RequirePermission permission="eps.upload"><AdminEpsExamManagerPage /></RequirePermission> },
  { path: "/admin/hanja-pro-seo", element: <AdminGuard><AdminHanjaProSEOPage /></AdminGuard> },
  { path: "/admin/ctv", element: <AdminGuard><AdminCTVPage /></AdminGuard> },
  { path: "/admin/control", element: <RequirePermission permission="system.settings"><AdminControlPage /></RequirePermission> },
  { path: "/admin/bugs", element: <AdminBugsPage /> },
  { path: "/admin/vip-transactions", element: <RequirePermission permission="users.vip"><AdminVipTransactionsPage /></RequirePermission> },
  { path: "/admin/zalo-reminder", element: <RequirePermission permission="system.broadcast"><AdminZaloReminderPage /></RequirePermission> },
  { path: "/admin/feedback", element: <AdminFeedbackPage /> },
  { path: "/admin/analytics", element: <AdminAnalyticsPage /> },
  { path: "/admin/error-logs", element: <RequirePermission permission="system.settings"><AdminErrorLogsPage /></RequirePermission> },
  { path: "/admin/community-settings", element: <RequirePermission permission="content.view"><AdminCommunitySettingsPage /></RequirePermission> },
  { path: "/admin/content-learn", element: <AdminContentLearnPage /> },
  // HIDDEN 2026-05-25 (focus EPS+du học): admin-melon removed
  // { path: "/admin-melon", element: <AdminGuard><AdminMelonPage /></AdminGuard> },
  { path: "/admin-naver-kin", element: <AdminGuard><AdminNaverKinPage /></AdminGuard> },
  { path: "/data-upload", element: <AdminGuard><DataUploadPage /></AdminGuard> },
  // Legacy routes (giữ lại để không break links cũ)
  { path: "/admin-eps", element: <AdminEpsPage /> },
  { path: "/admin-eps-upload", element: <AdminEpsUploadPage /> },
];
