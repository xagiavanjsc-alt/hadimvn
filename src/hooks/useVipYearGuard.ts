import { useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";

export type VipGuardReason = "not_logged_in" | "not_vip" | "not_vip_year" | null;

/**
 * VIP Year Guard — chỉ VIP năm mới được export/download đầy đủ.
 * VIP tháng được export tối đa 50 từ (có watermark).
 * Thành viên thường / khách bị chặn hoàn toàn.
 *
 * Logic:
 *  - is_vip = true  AND  vip_expires_at > now + 30 ngày  → VIP năm
 *  - is_vip = true  AND  vip_expires_at <= now + 30 ngày → VIP tháng (giới hạn 50 từ)
 *  - is_vip = false → thường / khách (bị chặn)
 */
export function useVipYearGuard() {
  const { user, profile } = useAuthContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState<VipGuardReason>(null);

  const isVipYear = (() => {
    if (!user || !profile) return false;
    if (!profile.is_vip) return false;
    if (!profile.vip_expires_at) return false;
    const expiresAt = new Date(profile.vip_expires_at).getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    return expiresAt - Date.now() > thirtyDaysMs;
  })();

  const isLoggedIn = Boolean(user);
  const isVip = Boolean(profile?.is_vip);
  // VIP tháng: đã VIP nhưng không phải VIP năm
  const isVipMonth = isVip && !isVipYear;

  /**
   * Gọi hàm này trước khi export đầy đủ (không giới hạn).
   * - VIP năm → gọi cb()
   * - VIP tháng → gọi cbLimited(50) — export tối đa 50 từ có watermark
   * - Khác → mở modal
   */
  function checkAndRun(cb: () => void, cbLimited?: (limit: number) => void): void {
    if (!isLoggedIn) {
      setModalReason("not_logged_in");
      setModalOpen(true);
      return;
    }
    if (!isVip) {
      setModalReason("not_vip");
      setModalOpen(true);
      return;
    }
    if (!isVipYear) {
      // VIP tháng: cho export giới hạn nếu có callback
      if (cbLimited) {
        cbLimited(50);
      } else {
        setModalReason("not_vip_year");
        setModalOpen(true);
      }
      return;
    }
    cb();
  }

  /**
   * Kiểm tra quyền và trả về true/false (không mở modal).
   * Dùng cho các trường hợp cần kiểm tra trước khi render.
   */
  function getAccessLevel(): "full" | "limited" | "none" {
    if (!isLoggedIn || !isVip) return "none";
    if (isVipYear) return "full";
    return "limited"; // VIP tháng
  }

  const closeModal = () => setModalOpen(false);

  return {
    isVipYear,
    isVip,
    isVipMonth,
    isLoggedIn,
    checkAndRun,
    getAccessLevel,
    modalOpen,
    modalReason,
    closeModal,
  };
}

/** Trả về label hiển thị trên nút export */
export function getExportBtnLabel(
  isLoggedIn: boolean,
  isVip: boolean,
  isVipYear: boolean,
  defaultLabel: string
): string {
  if (!isLoggedIn) return "Cần đăng nhập";
  if (!isVip) return "Chỉ VIP";
  if (!isVipYear) return `${defaultLabel} (50 từ)`;
  return defaultLabel;
}

/** Trả về icon cho nút export */
export function getExportBtnIcon(
  isLoggedIn: boolean,
  isVip: boolean,
  isVipYear: boolean
): string {
  if (!isLoggedIn || !isVip) return "ri-lock-line";
  if (!isVipYear) return "ri-download-line"; // VIP tháng vẫn có thể download (giới hạn)
  return "ri-download-line";
}

/** Thêm watermark vào CSV content */
export function addCsvWatermark(csvContent: string, limit: number): string {
  const watermarkHeader = `# ⚠️ Xuất giới hạn ${limit} từ — Nâng cấp VIP Năm để xuất toàn bộ\n# hanquocoi.app\n`;
  return watermarkHeader + csvContent;
}
