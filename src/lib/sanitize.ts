import DOMPurify from "dompurify";

// Default: cho phép thẻ HTML phổ biến, chặn script/iframe/object/embed
const DEFAULT_CONFIG = {
  ALLOWED_TAGS: [
    "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li",
    "blockquote", "code", "span", "div", "h1", "h2", "h3", "h4",
    "sub", "sup", "small", "mark", "del", "ins", "table", "tr", "td", "th",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "class", "id"],
  ALLOW_DATA_ATTR: false,
} as const;

/** Sanitize HTML string để dùng với dangerouslySetInnerHTML */
export function sanitizeHtml(dirty: string, config?: Record<string, unknown>): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return DOMPurify.sanitize(dirty, (config ?? DEFAULT_CONFIG) as any) as unknown as string;
}
