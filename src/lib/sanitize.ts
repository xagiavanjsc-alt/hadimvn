import DOMPurify from "dompurify";

type SanitizeConfig = Parameters<typeof DOMPurify.sanitize>[1];

// Default: cho phép thẻ HTML phổ biến, chặn script/iframe/object/embed
// KHÔNG cho phép style — dùng cho user-generated content (community posts)
const DEFAULT_CONFIG: SanitizeConfig = {
  ALLOWED_TAGS: [
    "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li",
    "blockquote", "code", "span", "div", "h1", "h2", "h3", "h4",
    "sub", "sup", "small", "mark", "del", "ins", "table", "tr", "td", "th",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "id"],
  ALLOW_DATA_ATTR: false,
};

// Admin config: cho phép style — dùng cho nội dung từ admin (AdBanner, v.v.)
const ADMIN_CONFIG: SanitizeConfig = {
  ...DEFAULT_CONFIG,
  ALLOWED_ATTR: ["href", "target", "rel", "class", "id", "style"],
};

/** Sanitize HTML string để dùng với dangerouslySetInnerHTML (user-generated content — KHÔNG cho style) */
export function sanitizeHtml(dirty: string, config?: SanitizeConfig): string {
  return DOMPurify.sanitize(dirty, config ?? DEFAULT_CONFIG) as string;
}

/** Sanitize HTML cho nội dung admin — cho phép style attribute (AdBanner, v.v.) */
export function sanitizeHtmlAdmin(dirty: string): string {
  return DOMPurify.sanitize(dirty, ADMIN_CONFIG) as string;
}
