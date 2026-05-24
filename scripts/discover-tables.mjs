#!/usr/bin/env node
/**
 * Discover all tables in Supabase
 *
 * Liệt kê tất cả table trong public schema → in ra console.
 * Dùng để biết tên table thật → update vào scripts/backup-supabase.mjs
 *
 * Chạy: npm run discover-tables
 */
import { readFileSync, existsSync } from "node:fs";

function loadEnv() {
  const content = readFileSync(".env", "utf-8");
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
  console.error("❌ Thiếu env var. Xem hướng dẫn trong backup-supabase.mjs");
  process.exit(1);
}

// PostgREST exposes table list via OpenAPI spec at GET /rest/v1/
const url = `${SUPABASE_URL}/rest/v1/`;

console.log(`\n🔍 Đang tìm tất cả tables trong: ${SUPABASE_URL}\n`);

const res = await fetch(url, {
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    Accept: "application/openapi+json",
  },
});

if (!res.ok) {
  console.error(`❌ HTTP ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const spec = await res.json();
const tables = Object.keys(spec.definitions || spec.components?.schemas || {});

if (tables.length === 0) {
  console.error("❌ Không tìm thấy table nào. Service key có quyền không?");
  process.exit(1);
}

tables.sort();

console.log(`Tìm thấy ${tables.length} tables:\n`);
for (const t of tables) {
  console.log(`  - ${t}`);
}

console.log(`\n📋 Copy danh sách trên vào scripts/backup-supabase.mjs`);
console.log(`   (Phần const TABLES_TO_BACKUP = [...])\n`);

// Also output as JS array for easy copy-paste
console.log("📦 Copy-paste ready:");
console.log("");
console.log("const TABLES_TO_BACKUP = [");
for (const t of tables) {
  console.log(`  "${t}",`);
}
console.log("];");
console.log("");
