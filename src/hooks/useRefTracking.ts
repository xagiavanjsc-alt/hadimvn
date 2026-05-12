/**
 * useRefTracking — lưu mã CTV vào localStorage khi user truy cập qua link ?ref=CODE
 * Gọi 1 lần ở App.tsx để track toàn bộ site
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const REF_KEY = "hqo_ref_code";
const REF_EXPIRE_KEY = "hqo_ref_expire";
const REF_TTL_DAYS = 30;

export function useRefTracking() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");
    if (!ref) return;

    // Lưu ref code + thời gian hết hạn (30 ngày)
    const expire = Date.now() + REF_TTL_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(REF_KEY, ref.toUpperCase());
    localStorage.setItem(REF_EXPIRE_KEY, String(expire));
  }, [location.search]);
}

/** Lấy ref code còn hiệu lực (chưa quá 30 ngày) */
export function getActiveRefCode(): string | null {
  const code = localStorage.getItem(REF_KEY);
  const expire = Number(localStorage.getItem(REF_EXPIRE_KEY) || 0);
  if (!code || Date.now() > expire) return null;
  return code;
}

/** Xoá ref code sau khi đã ghi nhận (tránh tính 2 lần) */
export function clearRefCode() {
  localStorage.removeItem(REF_KEY);
  localStorage.removeItem(REF_EXPIRE_KEY);
}
