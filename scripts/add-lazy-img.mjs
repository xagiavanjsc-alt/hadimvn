#!/usr/bin/env node
/**
 * One-off script: insert `loading="lazy" decoding="async"` into raw <img> tags
 * that don't already have a loading attribute. Skips ImageWithFallback (already lazy).
 * Run: node scripts/add-lazy-img.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";

const files = execSync('git ls-files "src/**/*.tsx" "src/**/*.ts"', { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter(existsSync);

let totalChanged = 0;
const changedFiles = [];

for (const file of files) {
  const src = readFileSync(file, "utf8");
  if (!src.includes("<img ")) continue;
  // Skip the ImageWithFallback component itself
  if (file.endsWith("ImageWithFallback.tsx")) continue;

  // Match `<img ` not followed (within the tag) by `loading=`
  // Approach: find each <img ...> opening, inspect attrs, inject if missing
  const out = src.replace(/<img\b([^>]*?)(\/?>)/g, (whole, attrs, end) => {
    if (/\bloading\s*=/.test(attrs)) return whole; // already has loading
    // Insert right after `<img `, preserving original attrs
    return `<img loading="lazy" decoding="async"${attrs}${end}`;
  });

  if (out !== src) {
    const before = (src.match(/<img\b/g) || []).length;
    const matched = (out.match(/loading="lazy" decoding="async"/g) || []).length
                  - (src.match(/loading="lazy" decoding="async"/g) || []).length;
    writeFileSync(file, out, "utf8");
    changedFiles.push(`${file}: +${matched}/${before} <img>`);
    totalChanged += matched;
  }
}

console.log(`Updated ${changedFiles.length} files, ${totalChanged} <img> tags`);
changedFiles.forEach(l => console.log(" -", l));
