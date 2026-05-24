#!/usr/bin/env node
/**
 * Supabase Data Backup Script
 *
 * Chạy: npm run backup
 *
 * Cần trong .env:
 *   VITE_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...   (lấy ở Supabase Dashboard → Settings → API → service_role)
 *
 * Output: backup/YYYY-MM-DD/[table].json + summary.txt
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

// ── Load .env ─────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = ".env";
  if (!existsSync(envPath)) {
    console.error("❌ Không tìm thấy file .env trong thư mục dự án");
    process.exit(1);
  }
  const content = readFileSync(envPath, "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Thiếu env var. Cần trong .env:");
  console.error("   VITE_PUBLIC_SUPABASE_URL=https://xxx.supabase.co");
  console.error("   SUPABASE_SERVICE_ROLE_KEY=eyJ...");
  console.error("");
  console.error("📍 Lấy service_role key ở đâu:");
  console.error("   1. Vào https://supabase.com/dashboard");
  console.error("   2. Chọn project → Settings → API");
  console.error("   3. Copy 'service_role secret' (KHÔNG phải anon key)");
  console.error("   4. Dán vào .env với tên SUPABASE_SERVICE_ROLE_KEY=...");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── Tables to backup ──────────────────────────────────────────────────────────
// Auto-discovered via npm run discover-tables on 2026-05-25.
// Critical content tables first, then user data, then system.
const TABLES_TO_BACKUP = [
  // ─── CONTENT — quan trọng nhất, mất là thảm họa ─────────────────────────
  // EPS content
  "eps_grammar",
  "eps_grammar_examples",
  "eps_vocab_entries",
  "eps_vocab_topics",
  // Seoul textbook
  "seoul_books",
  "seoul_lessons",
  "seoul_dialogue",
  "seoul_grammar",
  "seoul_grammar_examples",
  "seoul_vocabulary",
  // Hanja
  "hanja_pro",
  "hanja_tree_nodes",
  "hanja_stories",
  "hanja_vocab_entries",
  "hanja_flashcards",
  "hanja_story_quiz",
  // TOPIK
  "topik_vocabulary",
  // Grammar (chung)
  "grammar_patterns",
  "grammar_practice_questions",
  // Listening
  "listening_tracks",
  // Melon (K-pop)
  "melon_songs",
  // Naver KiN
  "naver_qa",

  // ─── USER DATA — tiến độ học của user ───────────────────────────────────
  "user_profiles",
  "user_progress",
  "user_achievements",
  "user_hanja_progress",
  "user_coupons",
  "user_daily_vocab",
  "study_progress",
  "study_history",
  "exam_results",
  "grammar_progress",
  "grammar_favorites",
  "module_progress",
  "flashcard_data",
  "daily_vocab",
  "topik_quiz_history",
  "topik_flashcard_progress",
  "hanja_flashcard_progress",
  "hanja_story_progress",
  "seoul_flashcard_progress",
  "melon_flashcard_progress",
  "melon_study_history",

  // ─── COMMUNITY ──────────────────────────────────────────────────────────
  "community_posts",
  "community_answers",
  "community_comments",
  "community_likes",
  "community_quiz_answers",
  "community_ratings",
  "community_settings",
  "comments",

  // ─── REWARDS & GAMIFICATION ─────────────────────────────────────────────
  "achievements",
  "leaderboard",
  "leaderboard_cache",
  "leaderboard_snapshots",
  "weekly_rewards",
  "weekly_rewards_summary",
  "reward_redemptions",
  "coupons",
  "xp_settings",

  // ─── MONETIZATION ───────────────────────────────────────────────────────
  "vip_pricing",
  "vip_payment_requests",
  "vip_revenue_log",
  "vip_violation_reports",
  "ctv_profiles",
  "ctv_commissions",
  "ctv_withdrawals",

  // ─── FEEDBACK & ADMIN ───────────────────────────────────────────────────
  "feedback",
  "bug_reports",
  "category_seo",
  "notifications",
  "error_logs",
  "login_sessions",
  "suspicious_exam_log",

  // ─── INTEGRATIONS ───────────────────────────────────────────────────────
  "zalo_reminders",
  "zalo_reminder_logs",
  "zalo_oauth_state",
  "tts_audio_cache",
  "tts_audio_misses",
];

// ── Backup ────────────────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const outDir = join("backup", today);
mkdirSync(outDir, { recursive: true });

console.log(`\n📦 Backup Supabase → ${outDir}/\n`);

const summary = {
  date: today,
  url: SUPABASE_URL,
  tables: [],
  errors: [],
  totalRows: 0,
};

for (const table of TABLES_TO_BACKUP) {
  process.stdout.write(`  ${table.padEnd(30, " ")} ... `);
  try {
    // Pagination — Supabase REST API trả tối đa 1000 rows/request
    const PAGE = 1000;
    let from = 0;
    const allRows = [];
    let totalCount = null;

    while (true) {
      const { data, error, count } = await supabase
        .from(table)
        .select("*", { count: "exact" })
        .range(from, from + PAGE - 1);

      if (error) {
        if (error.code === "42P01" || error.message.includes("not exist")) {
          console.log("⊝  (table không tồn tại, bỏ qua)");
          break;
        }
        throw error;
      }

      if (totalCount === null) totalCount = count ?? 0;
      const batch = data || [];
      allRows.push(...batch);

      if (batch.length < PAGE) break; // last page
      from += PAGE;
    }

    // If broke out of loop with error, skip
    if (totalCount === null) continue;

    const filename = join(outDir, `${table}.json`);
    writeFileSync(filename, JSON.stringify(allRows, null, 2), "utf-8");

    summary.tables.push({ table, rows: allRows.length, file: `${table}.json` });
    summary.totalRows += allRows.length;

    if (allRows.length === 0) {
      console.log("✓  (0 rows — empty)");
    } else if (allRows.length >= 1000) {
      console.log(`✅ ${allRows.length.toLocaleString()} rows (paginated)`);
    } else {
      console.log(`✅ ${allRows.length} rows`);
    }
  } catch (err) {
    console.log(`❌ ${err.message || err}`);
    summary.errors.push({ table, error: String(err.message || err) });
  }
}

// ── Write summary ─────────────────────────────────────────────────────────────
const summaryLines = [
  `Supabase Backup Summary`,
  `=======================`,
  `Date:   ${summary.date}`,
  `URL:    ${summary.url}`,
  `Total:  ${summary.totalRows.toLocaleString()} rows across ${summary.tables.length} tables`,
  ``,
  `Tables (sorted by row count):`,
  ``,
];

const sorted = [...summary.tables].sort((a, b) => b.rows - a.rows);
for (const t of sorted) {
  summaryLines.push(`  ${t.rows.toString().padStart(7)} rows  →  ${t.table}.json`);
}

if (summary.errors.length > 0) {
  summaryLines.push(``, `Errors:`, ``);
  for (const e of summary.errors) {
    summaryLines.push(`  ❌ ${e.table}: ${e.error}`);
  }
}

writeFileSync(join(outDir, "summary.txt"), summaryLines.join("\n"), "utf-8");
writeFileSync(join(outDir, "_meta.json"), JSON.stringify(summary, null, 2), "utf-8");

console.log("");
console.log("─".repeat(60));
console.log(`✅ Backup hoàn tất!`);
console.log(`📁 Folder: ${outDir}/`);
console.log(`📊 Total: ${summary.totalRows.toLocaleString()} rows, ${summary.tables.length} tables`);
if (summary.errors.length > 0) {
  console.log(`⚠️  ${summary.errors.length} table có lỗi (xem summary.txt)`);
}
console.log("");
console.log("📋 Việc tiếp theo:");
console.log(`   1. Mở file ${outDir}/summary.txt để xem có bao nhiêu data`);
console.log(`   2. Commit lên GitHub để backup vĩnh viễn:`);
console.log(`         git add ${outDir}/`);
console.log(`         git commit -m "backup: Supabase data ${today}"`);
console.log(`         git push`);
console.log("");
