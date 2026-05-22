/**
 * Allowlist of consumer email providers we accept for signup.
 *
 * Rationale: reduce throwaway/disposable signups while still covering the
 * major providers most learners actually use. Easy to widen later — just
 * append a domain. If we later want server-side enforcement, mirror this
 * list in a Postgres function or auth hook.
 */
const ALLOWED_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  // Google
  "gmail.com",
  "googlemail.com",
  // Microsoft
  "outlook.com",
  "outlook.com.vn",
  "hotmail.com",
  "hotmail.com.vn",
  "live.com",
  "msn.com",
  // Apple
  "icloud.com",
  "me.com",
  "mac.com",
  // Yahoo
  "yahoo.com",
  "yahoo.com.vn",
  "ymail.com",
  "rocketmail.com",
  // Privacy-focused
  "proton.me",
  "protonmail.com",
  "pm.me",
  // Other legitimate consumer providers
  "aol.com",
  "zoho.com",
]);

export interface EmailValidationResult {
  ok: boolean;
  reason?: string;
}

/**
 * Validates that the email is well-formed AND comes from an allowlisted
 * consumer provider. Returns a Vietnamese error message suitable for direct
 * display to the user.
 */
export function validateSignupEmail(emailRaw: string): EmailValidationResult {
  const email = emailRaw.trim().toLowerCase();
  if (!email) return { ok: false, reason: "Vui lòng nhập email" };
  // Minimal RFC-ish shape check — Supabase will reject anything truly broken,
  // so we only need to extract the domain reliably.
  const at = email.lastIndexOf("@");
  if (at < 1 || at === email.length - 1 || /\s/.test(email)) {
    return { ok: false, reason: "Email không hợp lệ" };
  }
  const domain = email.slice(at + 1);
  if (!domain.includes(".")) return { ok: false, reason: "Email không hợp lệ" };

  if (!ALLOWED_EMAIL_DOMAINS.has(domain)) {
    return {
      ok: false,
      reason: `Hiện chỉ hỗ trợ đăng ký bằng các email phổ biến (Gmail, Outlook, Hotmail, iCloud, Yahoo, Proton…). Vui lòng dùng một trong các nhà cung cấp đó hoặc đăng nhập bằng Google.`,
    };
  }

  return { ok: true };
}

/** Comma-separated, sorted list — used in helpful UI hints. */
export function allowedEmailDomainsList(): string {
  return Array.from(ALLOWED_EMAIL_DOMAINS).sort().join(", ");
}
