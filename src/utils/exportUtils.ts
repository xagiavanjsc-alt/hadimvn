/**
 * Export utilities — CSV & simple Excel (XLSX via data URI)
 * No external dependencies needed.
 */

/**
 * Convert array of objects to CSV string
 * @param headers - CSV header row
 * @param rows - Data rows as 2D array of strings
 * @returns CSV formatted string with proper escaping
 */
function toCSV(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    headers.map(escape).join(","),
    ...rows.map(row => row.map(escape).join(",")),
  ];
  return lines.join("\r\n");
}

/**
 * Trigger browser download
 * @param filename - Name of the file to download
 * @param content - File content as string
 * @param mimeType - MIME type of the file
 */
function download(filename: string, content: string, mimeType: string) {
  const bom = mimeType.includes("csv") ? "\uFEFF" : ""; // BOM for Excel UTF-8
  const blob = new Blob([bom + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ExportUser {
  id: string;
  display_name: string;
  email: string;
  is_vip: boolean;
  is_admin: boolean;
  xp_total?: number;
  streak_count?: number;
  created_at: string;
  last_active?: string;
}

export interface ExportCoupon {
  id: string;
  code: string;
  discount: number;
  discountType: "percent" | "fixed";
  channel: string;
  seriesId: string;
  usageCount: number;
  maxUsage: number | null;
  createdAt: string;
  active: boolean;
  note?: string;
}

export interface ExportRevenue {
  id: string;
  seriesId: string;
  buyerName: string;
  amount: number;
  date: string;
}

// ─── Export functions ─────────────────────────────────────────────────────────

/**
 * Export users to CSV file
 * @param users - Array of user data to export
 */
export function exportUsersCSV(users: ExportUser[]) {
  const headers = ["ID", "Tên hiển thị", "Email", "VIP", "Admin", "XP", "Streak (ngày)", "Ngày đăng ký", "Hoạt động cuối"];
  const rows = users.map(u => [
    u.id,
    u.display_name,
    u.email,
    u.is_vip ? "Có" : "Không",
    u.is_admin ? "Có" : "Không",
    String(u.xp_total ?? 0),
    String(u.streak_count ?? 0),
    new Date(u.created_at).toLocaleDateString("vi-VN"),
    u.last_active ? new Date(u.last_active).toLocaleDateString("vi-VN") : "—",
  ]);
  const csv = toCSV(headers, rows);
  const date = new Date().toISOString().slice(0, 10);
  download(`users_${date}.csv`, csv, "text/csv;charset=utf-8");
}

/**
 * Export coupons to CSV file
 * @param coupons - Array of coupon data to export
 */
export function exportCouponsCSV(coupons: ExportCoupon[]) {
  const headers = ["Mã coupon", "Giảm giá", "Loại", "Kênh", "Series", "Đã dùng", "Giới hạn", "Trạng thái", "Ghi chú", "Ngày tạo"];
  const rows = coupons.map(c => [
    c.code,
    String(c.discount),
    c.discountType === "percent" ? "%" : "VNĐ cố định",
    c.channel,
    c.seriesId === "all" ? "Tất cả" : c.seriesId,
    String(c.usageCount),
    c.maxUsage !== null ? String(c.maxUsage) : "Không giới hạn",
    c.active ? "Đang hoạt động" : "Đã tắt",
    c.note ?? "",
    new Date(c.createdAt).toLocaleDateString("vi-VN"),
  ]);
  const csv = toCSV(headers, rows);
  const date = new Date().toISOString().slice(0, 10);
  download(`coupons_${date}.csv`, csv, "text/csv;charset=utf-8");
}

/**
 * Export revenue data to CSV file
 * @param revenues - Array of revenue data to export
 */
export function exportRevenueCSV(revenues: ExportRevenue[]) {
  const headers = ["ID", "Series", "Người mua", "Số tiền (VNĐ)", "Ngày"];
  const rows = revenues.map(r => [
    r.id,
    r.seriesId,
    r.buyerName,
    String(r.amount),
    new Date(r.date).toLocaleDateString("vi-VN"),
  ]);
  const csv = toCSV(headers, rows);
  const date = new Date().toISOString().slice(0, 10);
  download(`revenue_${date}.csv`, csv, "text/csv;charset=utf-8");
}

/**
 * Export all admin data as separate CSV files
 * Downloads users, coupons, and revenue CSVs with staggered delays
 * @param users - Array of user data to export
 * @param coupons - Array of coupon data to export
 * @param revenues - Array of revenue data to export
 */
export function exportAllAdminData(
  users: ExportUser[],
  coupons: ExportCoupon[],
  revenues: ExportRevenue[]
) {
  exportUsersCSV(users);
  setTimeout(() => exportCouponsCSV(coupons), 300);
  setTimeout(() => exportRevenueCSV(revenues), 600);
}

/**
 * Format relative time string from ISO date string
 * @param isoString - ISO 8601 date string
 * @returns Human-readable relative time (e.g., "5 phút trước", "2 giờ trước")
 */
export function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}
