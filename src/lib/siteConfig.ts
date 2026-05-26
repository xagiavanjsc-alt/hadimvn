/**
 * Single source of truth for the site's public-facing URL.
 *
 * Set `VITE_SITE_URL` in `.env` to override (e.g. `https://newdomain.vn`).
 * If unset, falls back to the current production domain so existing deploys
 * keep working without any env wiring.
 *
 * Trailing slash is stripped so consumers can safely concatenate
 * `SITE_URL + "/path"` without producing `//path`.
 */
export const SITE_URL: string = (
  (import.meta.env.VITE_SITE_URL as string | undefined) || "https://hanquocoi.vn"
).replace(/\/+$/, "");

/** Host portion only (e.g. "hanquocoi.vn") — useful for display, not URL building. */
export const SITE_HOST: string = (() => {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return "hanquocoi.vn";
  }
})();

/**
 * Hosts for static-asset subdomains (audio TTS, EPS images).
 *
 * Derived from `SITE_HOST` so a single `VITE_SITE_URL` change cascades
 * to all three (main + audio + img). When you point the env at a new
 * domain like `https://hanquoc.io`, audio becomes
 * `https://audio.hanquoc.io` and img becomes `https://img.hanquoc.io`
 * automatically — no manual find/replace in code or admin docs.
 *
 * Override individually via `VITE_AUDIO_HOST_URL` / `VITE_IMG_HOST_URL`
 * if the assets ever need a fully different host (e.g. dedicated CDN).
 *
 * No trailing slash; consumers append `/tts`, `/eps`, `/upload`, etc.
 */
export const AUDIO_HOST_URL: string = (
  (import.meta.env.VITE_AUDIO_HOST_URL as string | undefined) ||
  `https://audio.${SITE_HOST}`
).replace(/\/+$/, "");

export const IMG_HOST_URL: string = (
  (import.meta.env.VITE_IMG_HOST_URL as string | undefined) ||
  `https://img.${SITE_HOST}`
).replace(/\/+$/, "");

/**
 * Canonical EducationalOrganization block for JSON-LD schemas.
 *
 * Pages typically embed this as `provider: ORG_SCHEMA` inside Quiz/Course/
 * LearningResource schemas. For pages that want it as a top-level entity
 * with extra fields, spread it: `{ "@context": "https://schema.org",
 * ...ORG_SCHEMA, description: "...", inLanguage: [...] }`.
 */
export const ORG_SCHEMA = {
  "@type": "EducationalOrganization",
  name: "Hàn Quốc Ơi!",
  url: SITE_URL,
} as const;
