import { supabase } from "@/lib/supabase";

export type ErrorType = "api" | "auth" | "database" | "runtime" | "network";

/**
 * Ghi lỗi vào error_logs để admin xem trong quản trị.
 * Dùng cho các lỗi quan trọng: API fail, auth lỗi, DB query lỗi...
 */
export async function logError(
  errorType: ErrorType,
  message: string,
  extra?: { stackTrace?: string; pageUrl?: string; userId?: string }
): Promise<void> {
  try {
    await supabase.from("error_logs").insert({
      user_id: extra?.userId || null,
      error_type: errorType,
      message: message.slice(0, 500),
      stack_trace: extra?.stackTrace?.slice(0, 2000) || null,
      page_url: extra?.pageUrl || window.location.pathname,
      user_agent: navigator.userAgent.slice(0, 500),
    });
  } catch {
    // Silent fail — không throw để không gây thêm lỗi
  }
}
