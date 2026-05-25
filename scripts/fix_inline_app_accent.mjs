// One-off batch-fix for inline-style props referencing Tailwind class names
// instead of actual CSS color values. Run once, then delete this file.
//
//   node scripts/fix_inline_app_accent.mjs
//
// What it does: walks src/ for .ts/.tsx files and replaces every literal
// "app-accent-primary[NN]" string with the corresponding hex/rgba value.
// The NN suffix encodes alpha in percent (0.08, 0.15, 0.20, etc.).
import fs from "node:fs";
import path from "node:path";

const replacements = [
  ['"app-accent-primary55"', '"rgba(232,200,74,0.55)"'],
  ['"app-accent-primary30"', '"rgba(232,200,74,0.30)"'],
  ['"app-accent-primary25"', '"rgba(232,200,74,0.25)"'],
  ['"app-accent-primary20"', '"rgba(232,200,74,0.20)"'],
  ['"app-accent-primary15"', '"rgba(232,200,74,0.15)"'],
  ['"app-accent-primary08"', '"rgba(232,200,74,0.08)"'],
  ['"app-accent-primary"',   '"#e8c84a"'],
];

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

const root = "src";
const files = walk(root, []);
const touched = [];
let totalReplacements = 0;

for (const f of files) {
  let c = fs.readFileSync(f, "utf8");
  const orig = c;
  let fileCount = 0;
  for (const [from, to] of replacements) {
    const before = c.length;
    c = c.split(from).join(to);
    if (c.length !== before) {
      fileCount += (orig.split(from).length - 1);
    }
  }
  if (c !== orig) {
    fs.writeFileSync(f, c);
    touched.push({ f, fileCount });
    totalReplacements += fileCount;
  }
}

console.log(`Touched ${touched.length} files, ${totalReplacements} total replacements:`);
touched.forEach(({ f, fileCount }) => console.log(`  ${f}  (${fileCount})`));
