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
  // Microsoft
  "outlook.com",
  "outlook.com.vn",
  "hotmail.com",
  "hotmail.com.vn",
  // Apple
  "icloud.com",
  // Yahoo
  "yahoo.com",
  "yahoo.com.vn",
]);

// Local part: lowercase letters, digits, dot, underscore, hyphen.
// Deliberately stricter than RFC — real EPS users don't have exotic
// chars in their email, and the looser RFC charset is mostly used by
// scripts/scrapers crafting throwaway addresses.
const VALID_LOCAL_PART_RE = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;

export interface EmailValidationResult {
  ok: boolean;
  reason?: string;
}

/**
 * Validates that the email is well-formed AND comes from an allowlisted
 * consumer provider AND doesn't use abuse-prone patterns (Gmail `+alias`,
 * exotic chars). Returns a Vietnamese error message for direct display.
 *
 * NOTE: This is best-effort frontend filtering — an attacker can bypass it
 * by calling Supabase auth directly. It's here to stop casual abuse via the
 * signup UI (CTV self-refer rings, coupon farming, fake leaderboard
 * accounts). Move to a server-side auth hook if abuse rate grows.
 */
export function validateSignupEmail(emailRaw: string): EmailValidationResult {
  const email = emailRaw.trim().toLowerCase();
  if (!email) return { ok: false, reason: "Vui lòng nhập email" };

  const at = email.lastIndexOf("@");
  if (at < 1 || at === email.length - 1 || /\s/.test(email)) {
    return { ok: false, reason: "Email không hợp lệ" };
  }
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  if (!domain.includes(".")) return { ok: false, reason: "Email không hợp lệ" };

  if (!ALLOWED_EMAIL_DOMAINS.has(domain)) {
    return {
      ok: false,
      reason: `Hiện chỉ chấp nhận email phổ biến: Gmail, Outlook, Hotmail, iCloud, Yahoo. Nếu bạn dùng email tên miền riêng (vd email công ty), vui lòng đăng nhập bằng Google.`,
    };
  }

  // Block "+alias" addressing (Gmail/Outlook/Yahoo all support it). A real
  // EPS learner won't sign up as `name+xyz@gmail.com`; bad actors use it to
  // create unlimited accounts from one inbox.
  if (local.includes("+")) {
    return {
      ok: false,
      reason: "Email không được chứa dấu '+'. Vui lòng dùng email chính của bạn.",
    };
  }

  // Two consecutive dots is RFC-invalid; some providers also reject it.
  if (local.includes("..")) {
    return { ok: false, reason: "Email không hợp lệ" };
  }

  // Reject exotic characters in the local part. Keeps to a-z, 0-9, dot,
  // underscore, hyphen, with no leading/trailing dot or hyphen.
  if (!VALID_LOCAL_PART_RE.test(local)) {
    return {
      ok: false,
      reason: "Email chứa ký tự không hợp lệ. Chỉ dùng chữ, số, dấu chấm, gạch ngang, gạch dưới.",
    };
  }

  return { ok: true };
}

/** Comma-separated, sorted list — used in helpful UI hints. */
export function allowedEmailDomainsList(): string {
  return Array.from(ALLOWED_EMAIL_DOMAINS).sort().join(", ");
}
