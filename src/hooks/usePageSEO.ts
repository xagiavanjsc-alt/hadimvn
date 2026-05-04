import { useEffect } from "react";

// ─── usePageSEO ────────────────────────────────────────────────────────────────
// Reusable hook: update <title>, <meta name=description>, canonical, og:*, twitter:*
// and optional JSON-LD structured data cho từng trang.
//
// Quan trọng:
//   - canonical luôn update để tránh duplicate homepage
//   - og:url luôn update để social share hiển thị đúng URL trang
//   - og:image nên dùng ảnh riêng của trang nếu có (fallback homepage image)

const SITE_URL = "https://hanquocoi.vn";
const DEFAULT_OG_IMAGE = "https://public.readdy.ai/ai/img_res/e4aac832-9a5b-4b61-8ca3-dd8be9f9e28b.png";

export interface SEOConfig {
  title: string;
  description: string;
  /** path bắt đầu bằng "/" — nếu không cung cấp sẽ dùng window.location.pathname */
  path?: string;
  image?: string;
  /** "website" | "article" | ... */
  ogType?: string;
  /** JSON-LD structured data (Schema.org) */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Keywords meta (comma-separated). Hiện nay ít tác dụng SEO nhưng admin có thể cần */
  keywords?: string;
  /** 'index, follow' (mặc định) hoặc 'noindex, nofollow' cho trang cá nhân */
  robots?: string;
}

function upsertMeta(attrName: "name" | "property", key: string, content: string) {
  if (!content) return;
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attrName}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attrName, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

const JSONLD_ID = "page-seo-jsonld";

export function usePageSEO(config: SEOConfig | null | undefined) {
  useEffect(() => {
    if (!config) return;

    const path = config.path ?? window.location.pathname + window.location.search;
    const fullUrl = path.startsWith("http") ? path : SITE_URL + path;
    const image = config.image || DEFAULT_OG_IMAGE;
    const ogType = config.ogType || "website";
    const desc = (config.description || "").slice(0, 300);

    // ── Core ────────────────────────────────────────────────────────────
    document.title = config.title;
    upsertMeta("name", "description", desc);
    if (config.keywords) upsertMeta("name", "keywords", config.keywords);
    upsertMeta("name", "robots", config.robots || "index, follow");
    upsertLink("canonical", fullUrl);

    // ── Open Graph ─────────────────────────────────────────────────────
    upsertMeta("property", "og:title", config.title);
    upsertMeta("property", "og:description", desc);
    upsertMeta("property", "og:url", fullUrl);
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:image", image);
    upsertMeta("property", "og:site_name", "Hàn Quốc Ơi!");
    upsertMeta("property", "og:locale", "vi_VN");

    // ── Twitter Card ───────────────────────────────────────────────────
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", config.title);
    upsertMeta("name", "twitter:description", desc);
    upsertMeta("name", "twitter:image", image);

    // ── JSON-LD ─────────────────────────────────────────────────────────
    document.getElementById(JSONLD_ID)?.remove();
    if (config.jsonLd) {
      const script = document.createElement("script");
      script.id = JSONLD_ID;
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(
        Array.isArray(config.jsonLd) ? config.jsonLd : config.jsonLd,
      );
      document.head.appendChild(script);
    }

    return () => {
      document.getElementById(JSONLD_ID)?.remove();
    };
  }, [config]);
}
