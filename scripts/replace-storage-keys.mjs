#!/usr/bin/env node
/**
 * One-off: replace literal localStorage key strings with STORAGE_KEYS.X
 * constants imported from @/lib/storageKeys.
 *
 * Only rewrites contexts where we know the string is a storage key:
 *   - localStorage.getItem("foo")
 *   - localStorage.setItem("foo", ...)
 *   - localStorage.removeItem("foo")
 *   - sessionStorage.{get,set,remove}Item("foo")
 *   - readJSON("foo", ...) — wraps localStorage.getItem
 *   - safeParse(localStorage.getItem("foo") ...) — handled by the first pattern
 *
 * Does NOT touch:
 *   - dynamic keys (template literals, variables)
 *   - keys not in the central registry
 *   - the storageKeys.ts file itself
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";

// Inline copy of the registry (kept in sync with src/lib/storageKeys.ts)
const KEYS = {
  XP_TOTAL: "xp_total",
  XP_SYNC_PENDING: "kts_xp_sync_pending",
  ADMIN_VERIFIED: "kts_admin_verified",
  ADMIN_BACKUPS: "kts_admin_backups",
  ADMIN_GRANT_XP_HISTORY: "kts_admin_grant_xp_history",
  ADMIN_BACKUP_AUTOCLEAN: "kts_backup_autocleanup",
  ADMIN_BACKUP_CLEANUP_DAYS: "kts_backup_cleanup_days",
  ADMIN_PDF_EXPORTS_COUNT: "kts_pdf_exports_count",
  SETTINGS: "kts_settings",
  ONBOARDING_DONE: "kts_onboarding_done",
  LAST_STUDY_TIME: "kts_last_study_time",
  BEST_SCORE: "kts_best_score",
  COUPONS: "kts_coupons",
  TOPIK_GUIDE_SEEN: "topik_guide_seen",
  FLASHCARD_KNOWN: "flashcard_known",
  AI_FLASHCARD_MEMORIES: "kts_ai_flashcard_memories",
  SR_CARDS_LEARNED: "kts_sr_cards_learned",
  SR_VOCAB: "kts_sr_vocab",
  HANJA_SR_DATA: "hanja_sr_data",
  HANJA_STREAK: "hanja_streak",
  HANJA_FAVORITES: "hanja_favorites",
  HANJA_NOTES: "hanja_notes",
  HANJA_TOPIK_HISTORY: "hanja_topik_history",
  HANJA_ADV_LEARNED: "hanja_adv_learned",
  HANJA_WEEKLY_CHALLENGE: "hanja_weekly_challenge",
  HANJA_PRONUNCIATION_HISTORY: "hanja_pronunciation_history",
  HANJA_VOCAB: "kts_hanja_vocab",
  HANGUL_KNOWN: "kts_hangul_known",
  EPS_EXAM_RESULTS: "kts_eps_exam_results",
  EPS_EXAM_HISTORY: "kts_eps_exam_history",
  EPS_EXAM_HISTORY_LEGACY: "eps_exam_history",
  EPS_EXAM_LAST_AT: "kts_eps_exam_last_at",
  EPS_TOPIC_EXAM_LAST_AT: "kts_eps_topic_exam_last_at",
  EPS_ANSWERS: "kts_eps_answers",
  EPS_WRONG_ANSWERS: "kts_eps_wrong_answers",
  EPS_START_TOPIC: "kts_eps_start_topic",
  EPS_MELON_LEARNED: "eps_melon_learned",
  MELON_SONGS: "kts_melon_songs",
  MELON_LESSONS: "kts_melon_lessons",
  MELON_SEEN_SONGS: "kts_melon_seen_songs",
  MELON_CACHED_SONGS: "kts_melon_cached_songs",
  MELON_FETCH_META: "kts_melon_fetch_meta",
  MELON_LEARNED_RANKS: "melon_learned_ranks",
  MELON_PLAYLIST_RANKS: "melon_playlist_ranks",
  MELON_QUIZ_SCORES: "melon_quiz_scores",
  MELON_FLASHCARD_PROGRESS: "melon_flashcard_progress",
  NAVER_KIN_QA: "kts_naver_kin_qa",
  NAVER_QA: "kts_naver_qa",
  NAVER_LIKED: "kts_naver_liked",
  NAVER_CACHE: "kts_naver_cache",
  SEOUL_FLASHCARD_STATUS: "kts_seoul_flashcard_status",
  SEOUL_DICT_NOTES: "seoul_dict_notes",
  TOPIK_LEARNED_WORDS: "topik_learned_words",
  ADV_DICT_RECENT: "adv_dict_recent",
};

// Reverse lookup: string value -> constant name
const REV = Object.fromEntries(Object.entries(KEYS).map(([k, v]) => [v, k]));

const files = execSync('git ls-files "src/**/*.tsx" "src/**/*.ts"', { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter(existsSync);

let totalReplacements = 0;
const changedFiles = [];

// Patterns: capture the (quote)(key)(quote) inside a known storage call.
// We do this conservatively — only direct call sites, never anywhere else.
const patterns = [
  /\b(localStorage|sessionStorage)\.(getItem|setItem|removeItem)\(\s*(['"])([^'"]+)\3/g,
  /\b(readJSON)\(\s*(['"])([^'"]+)\2/g,
];

for (const file of files) {
  if (file.endsWith("src/lib/storageKeys.ts")) continue;
  if (file.endsWith("scripts/replace-storage-keys.mjs")) continue;
  // Skip test fixtures (they use throwaway keys like "k", "bad", "weird")
  if (file.includes("/test/")) continue;

  const src = readFileSync(file, "utf8");
  let out = src;
  let fileReplacements = 0;

  // Pattern 1: localStorage/sessionStorage.METHOD("key", ...)
  out = out.replace(
    /\b(localStorage|sessionStorage)\.(getItem|setItem|removeItem)\(\s*(['"])([^'"]+)\3/g,
    (full, storage, method, _q, key) => {
      if (!REV[key]) return full;
      fileReplacements++;
      return `${storage}.${method}(STORAGE_KEYS.${REV[key]}`;
    },
  );
  // Pattern 2: readJSON("key", ...)
  out = out.replace(
    /\b(readJSON)\(\s*(['"])([^'"]+)\2/g,
    (full, fn, _q, key) => {
      if (!REV[key]) return full;
      fileReplacements++;
      return `${fn}(STORAGE_KEYS.${REV[key]}`;
    },
  );

  if (fileReplacements === 0) continue;

  // Add import if not present
  if (!/from\s+["']@\/lib\/storageKeys["']/.test(out)) {
    // Find the last `import ... from "..."` line and insert after
    const importLines = out.match(/^import .+?;$/gm) || [];
    if (importLines.length === 0) {
      out = `import { STORAGE_KEYS } from "@/lib/storageKeys";\n${out}`;
    } else {
      const lastImport = importLines[importLines.length - 1];
      out = out.replace(lastImport, `${lastImport}\nimport { STORAGE_KEYS } from "@/lib/storageKeys";`);
    }
  }

  writeFileSync(file, out, "utf8");
  changedFiles.push(`${file}: ${fileReplacements} replacements`);
  totalReplacements += fileReplacements;
}

console.log(`Updated ${changedFiles.length} files, ${totalReplacements} key replacements`);
changedFiles.slice(0, 50).forEach(l => console.log(" -", l));
if (changedFiles.length > 50) console.log(` ... and ${changedFiles.length - 50} more`);
