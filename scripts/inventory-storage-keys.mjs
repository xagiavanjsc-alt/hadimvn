#!/usr/bin/env node
/**
 * Inventory all localStorage / sessionStorage key strings used in the codebase.
 * Reports literal keys with file:line where each is used, and flags dynamic
 * (template literal / variable) accesses for manual review.
 */
import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";

const files = execSync('git ls-files "src/**/*.tsx" "src/**/*.ts"', { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter(existsSync);

// Match: localStorage.getItem("foo") or localStorage.setItem("foo", ...) or localStorage.removeItem("foo")
// Also: readJSON("foo", ...) which wraps it
const literal = /(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\(\s*(['"])([^'"]+)\1/g;
const literalReadJson = /readJSON\(\s*(['"])([^'"]+)\1/g;
const dynamic = /(?:localStorage|sessionStorage)\.(?:getItem|setItem|removeItem)\(\s*[`a-zA-Z_]/g;

const keys = new Map(); // key -> [{file, line}]
const dynamicRefs = [];

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  for (const re of [literal, literalReadJson]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src)) !== null) {
      const key = m[2];
      const lineIdx = src.slice(0, m.index).split("\n").length;
      if (!keys.has(key)) keys.set(key, []);
      keys.get(key).push(`${file}:${lineIdx}`);
    }
  }
  dynamic.lastIndex = 0;
  let dm;
  while ((dm = dynamic.exec(src)) !== null) {
    const lineIdx = src.slice(0, dm.index).split("\n").length;
    const snippet = lines[lineIdx - 1]?.trim().slice(0, 100) || "";
    dynamicRefs.push(`${file}:${lineIdx}  ${snippet}`);
  }
}

const sorted = [...keys.entries()].sort((a, b) => b[1].length - a[1].length);

console.log(`Found ${sorted.length} unique literal keys, ${dynamicRefs.length} dynamic accesses\n`);
console.log("=== LITERAL KEYS (by usage count) ===");
for (const [key, locs] of sorted) {
  console.log(`${locs.length.toString().padStart(3)}x  ${JSON.stringify(key)}`);
  if (locs.length <= 3) locs.forEach(l => console.log(`        - ${l}`));
}
console.log(`\n=== DYNAMIC ACCESSES (need manual review) ===`);
dynamicRefs.slice(0, 30).forEach(l => console.log("  " + l));
if (dynamicRefs.length > 30) console.log(`  ... and ${dynamicRefs.length - 30} more`);
