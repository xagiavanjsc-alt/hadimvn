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
