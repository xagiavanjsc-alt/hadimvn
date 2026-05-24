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
// List tables to dump. Add more here if needed.
// Tip: chạy script lần đầu sẽ in ra "table not found" cho table không tồn tại
// — copy danh sách table thật từ Supabase Dashboard → Table Editor vào đây.
const TABLES_TO_BACKUP = [
  // EPS content (quan trọng nhất)
  "eps_lessons",
  "eps_vocab",
  "eps_exams",
  "eps_exam_questions",
  "eps_topics",
  "eps_grammar",
  // Seoul textbook content
  "seoul_lessons",
  "seoul_vocab",
  "seoul_grammar",
  "seoul_word_pairs",
  // Hanja content
  "hanja_entries",
  "hanja_vocab",
  "hanja_stories",
  "hanja_pro",
  "hanja_tree_nodes",
  // TOPIK content
  "topik_grammar",
  "topik_vocab",
  "topik_exam_questions",
  // Grammar (chung)
  "grammar_patterns",
  // Melon (K-pop)
  "melon_songs",
  "melon_vocab",
  // Naver KiN
  "naver_kin_articles",
  // User data (nếu muốn backup user)
  "user_profiles",
  "user_progress",
  "study_progress",
  "exam_results",
  "study_history",
  "daily_vocab",
  "user_daily_vocab",
  // Community
  "community_posts",
  "comments",
  // Misc
  "leaderboard",
  "achievements",
  "bug_reports",
  "feedback",
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
    const { data, error, count } = await supabase
      .from(table)
      .select("*", { count: "exact" });

    if (error) {
      if (error.code === "42P01" || error.message.includes("not exist")) {
        console.log("⊝  (table không tồn tại, bỏ qua)");
        continue;
      }
      throw error;
    }

    const rows = data || [];
    const filename = join(outDir, `${table}.json`);
    writeFileSync(filename, JSON.stringify(rows, null, 2), "utf-8");

    summary.tables.push({ table, rows: rows.length, file: `${table}.json` });
    summary.totalRows += rows.length;

    if (rows.length === 0) {
      console.log("✓  (0 rows — empty)");
    } else {
      console.log(`✅ ${rows.length} rows`);
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
