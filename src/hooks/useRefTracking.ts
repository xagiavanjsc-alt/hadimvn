/**
 * useRefTracking — lưu mã CTV vào localStorage khi user truy cập qua link ?ref=CODE
 * Gọi 1 lần ở App.tsx để track toàn bộ site
 */
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const REF_KEY = "hqo_ref_code";
const REF_EXPIRE_KEY = "hqo_ref_expire";
const REF_TTL_DAYS = 30;

function getSafeStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function useRefTracking() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");
    if (!ref) return;

    const storage = getSafeStorage();
    if (!storage) return;

    // Lưu ref code + thời gian hết hạn (30 ngày)
    const expire = Date.now() + REF_TTL_DAYS * 24 * 60 * 60 * 1000;
    try {
      storage.setItem(REF_KEY, ref.toUpperCase());
      storage.setItem(REF_EXPIRE_KEY, String(expire));
    } catch {
      // Ignore storage failures (private mode / blocked access)
    }
  }, [location.search]);
}

/** Lấy ref code còn hiệu lực (chưa quá 30 ngày) */
export function getActiveRefCode(): string | null {
  const storage = getSafeStorage();
  if (!storage) return null;

  try {
    const code = storage.getItem(REF_KEY);
    const expire = Number(storage.getItem(REF_EXPIRE_KEY) || 0);
    if (!code || Date.now() > expire) return null;
    return code;
  } catch {
    return null;
  }
}

/** Xoá ref code sau khi đã ghi nhận (tránh tính 2 lần) */
export function clearRefCode() {
  const storage = getSafeStorage();
  if (!storage) return;

  try {
    storage.removeItem(REF_KEY);
    storage.removeItem(REF_EXPIRE_KEY);
  } catch {
    // Ignore storage failures
  }
}
