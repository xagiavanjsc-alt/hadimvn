import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/mocks/data/hanja-data.ts';
const raw = readFileSync(path, 'utf8');

// Find all data entry lines: `  { korean: "...", hanja: "...", vietnamese: "..." },`
const lines = raw.split('\n');
const seen = new Set();
const out = [];
let removed = 0;

for (const line of lines) {
  const m = line.match(/korean:\s*"([^"]+)",\s*hanja:\s*"([^"]*)",\s*vietnamese:\s*"([^"]*)"/);
  if (m) {
    const key = `${m[1]}|${m[2]}`;
    if (seen.has(key)) {
      removed++;
      continue; // skip duplicate line
    }
    seen.add(key);
  }
  out.push(line);
}

writeFileSync(path, out.join('\n'), 'utf8');
console.log(`Removed ${removed} exact duplicates.`);
console.log(`Unique (korean+hanja) entries now: ${seen.size}`);
