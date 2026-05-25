#!/usr/bin/env node
/**
 * Sitemap + robots.txt generator.
 *
 * Runs automatically before `npm run build` (see package.json "prebuild").
 * Reads VITE_SITE_URL from .env (or falls back to the default below) so the
 * domain lives in exactly one place. To migrate domains: change VITE_SITE_URL
 * in .env, rerun `npm run build`. No other edits.
 *
 * Adding/removing URLs: edit the ROUTES list below. This is the single source
 * of truth for what Google sees in the sitemap.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const DEFAULT_SITE_URL = "https://hanquocoi.vn";

// ── Load .env into process.env (minimal parser, no dep) ───────────────────────
function loadEnv() {
  const path = ".env";
  if (!existsSync(path)) return;
  const raw = readFileSync(path, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, key, valueRaw] = m;
    if (process.env[key] !== undefined) continue;
    const value = valueRaw.replace(/^["']|["']$/g, "");
    process.env[key] = value;
  }
}

loadEnv();

const SITE_URL = ((process.env.VITE_SITE_URL || DEFAULT_SITE_URL) + "").replace(/\/+$/, "");

// ── Routes (single source of truth) ──────────────────────────────────────────
// Grouped by section for easy auditing. Priority guidance:
//   1.0 = homepage only
//   0.9 = top-of-funnel acquisition + primary feature hubs
//   0.8 = main feature pages
//   0.7 = secondary feature pages
//   0.5-0.6 = utility, leaderboards, stats
const ROUTES = [
  // Core
  { path: "/", changefreq: "daily", priority: 1.0 },
  { path: "/landing", changefreq: "weekly", priority: 0.9 },
  { path: "/pricing", changefreq: "monthly", priority: 0.8 },
  { path: "/all-features", changefreq: "weekly", priority: 0.7 },
  { path: "/community", changefreq: "daily", priority: 0.8 },
  { path: "/guide", changefreq: "monthly", priority: 0.5 },

  // EPS (XKLĐ) — primary audience
  { path: "/eps", changefreq: "weekly", priority: 0.9 },
  { path: "/eps-lessons", changefreq: "weekly", priority: 0.9 },
  { path: "/eps-vocabulary", changefreq: "weekly", priority: 0.9 },
  { path: "/eps-grammar", changefreq: "weekly", priority: 0.9 },
  { path: "/eps-flashcard", changefreq: "weekly", priority: 0.8 },
  { path: "/eps-listening", changefreq: "weekly", priority: 0.8 },
  { path: "/eps-speaking", changefreq: "weekly", priority: 0.7 },

  // EPS exams — top search intent ("đề thi EPS", "đề EPS đề 1")
  { path: "/eps-exam", changefreq: "weekly", priority: 0.9 },
  { path: "/eps-exams", changefreq: "weekly", priority: 0.9 },
  { path: "/eps-mock-exam", changefreq: "weekly", priority: 0.9 },
  { path: "/eps-de1", changefreq: "monthly", priority: 0.9 },
  { path: "/eps-de2", changefreq: "monthly", priority: 0.9 },
  { path: "/eps-exam-schedule", changefreq: "weekly", priority: 0.8 },

  // EPS planning / review
  { path: "/eps-30day-plan", changefreq: "monthly", priority: 0.8 },
  { path: "/eps-personalized-roadmap", changefreq: "monthly", priority: 0.7 },
  { path: "/eps-quick-review", changefreq: "weekly", priority: 0.7 },
  { path: "/eps-topic-dictionary", changefreq: "weekly", priority: 0.7 },

  // TOPIK (du học) — secondary audience
  { path: "/topik-test", changefreq: "weekly", priority: 0.8 },
  { path: "/topik2-test", changefreq: "weekly", priority: 0.8 },
  { path: "/topik-vocab-level", changefreq: "weekly", priority: 0.8 },
  { path: "/topik-frequency-vocab", changefreq: "weekly", priority: 0.7 },
  { path: "/topik-flashcard", changefreq: "weekly", priority: 0.7 },
  { path: "/topik-listening", changefreq: "weekly", priority: 0.7 },
  { path: "/topik-reading", changefreq: "weekly", priority: 0.7 },
  { path: "/topik-exam-writing", changefreq: "weekly", priority: 0.7 },
  { path: "/topik-topic-quiz", changefreq: "weekly", priority: 0.7 },
  { path: "/topik-dictionary", changefreq: "weekly", priority: 0.7 },
  { path: "/topik-stats", changefreq: "monthly", priority: 0.5 },

  // Tiếng Hàn cơ bản
  { path: "/hangul", changefreq: "monthly", priority: 0.8 },
  { path: "/vocabulary", changefreq: "weekly", priority: 0.7 },
  { path: "/grammar", changefreq: "weekly", priority: 0.7 },
  { path: "/dictionary", changefreq: "weekly", priority: 0.7 },
  { path: "/advanced-dictionary", changefreq: "weekly", priority: 0.6 },
  { path: "/hanja-pro", changefreq: "weekly", priority: 0.6 },
  { path: "/hanja-dashboard", changefreq: "weekly", priority: 0.5 },

  // Discovery / engagement
  { path: "/leaderboard", changefreq: "daily", priority: 0.5 },
  { path: "/global-leaderboard", changefreq: "daily", priority: 0.5 },
];

// ── Render sitemap.xml ───────────────────────────────────────────────────────
function renderSitemap() {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for (const { path, changefreq, priority } of ROUTES) {
    lines.push(
      `  <url><loc>${SITE_URL}${path}</loc><changefreq>${changefreq}</changefreq><priority>${priority.toFixed(1)}</priority></url>`
    );
  }
  lines.push("</urlset>", "");
  return lines.join("\n");
}

// ── Render robots.txt ────────────────────────────────────────────────────────
// Disallow rules stay identical; only the Sitemap line carries the domain.
function renderRobots() {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    "# Không cho index các trang cá nhân / admin",
    "Disallow: /admin",
    "Disallow: /admin/",
    "Disallow: /account-settings",
    "Disallow: /settings",
    "Disallow: /profile",
    "Disallow: /notification-settings",
    "Disallow: /onboarding",
    "",
    "# Cho phép Googlebot crawl ảnh",
    "User-agent: Googlebot-Image",
    "Allow: /",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
}

writeFileSync("public/sitemap.xml", renderSitemap(), "utf8");
writeFileSync("public/robots.txt", renderRobots(), "utf8");

console.log(`[sitemap] wrote public/sitemap.xml (${ROUTES.length} URLs) + public/robots.txt with SITE_URL=${SITE_URL}`);
