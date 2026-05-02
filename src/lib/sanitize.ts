import DOMPurify from "dompurify";

// Default: cho phép thẻ HTML phổ biến, chặn script/iframe/object/embed
// KHÔNG cho phép style — dùng cho user-generated content (community posts)
const DEFAULT_CONFIG = {
  ALLOWED_TAGS: [
    "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li",
    "blockquote", "code", "span", "div", "h1", "h2", "h3", "h4",
    "sub", "sup", "small", "mark", "del", "ins", "table", "tr", "td", "th",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "id"],
  ALLOW_DATA_ATTR: false,
} as const;

// Admin config: cho phép style — dùng cho nội dung từ admin (AdBanner, v.v.)
const ADMIN_CONFIG = {
  ...DEFAULT_CONFIG,
  ALLOWED_ATTR: ["href", "target", "rel", "class", "id", "style"],
} as const;

/** Sanitize HTML string để dùng với dangerouslySetInnerHTML (user-generated content — KHÔNG cho style) */
export function sanitizeHtml(dirty: string, config?: Record<string, unknown>): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return DOMPurify.sanitize(dirty, (config ?? DEFAULT_CONFIG) as any) as unknown as string;
}

/** Sanitize HTML cho nội dung admin — cho phép style attribute (AdBanner, v.v.) */
export function sanitizeHtmlAdmin(dirty: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return DOMPurify.sanitize(dirty, ADMIN_CONFIG as any) as unknown as string;
}
