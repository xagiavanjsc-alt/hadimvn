import { readFileSync, writeFileSync } from 'node:fs';
import { ALL_NEW_BATCHES } from './hanja-new-batch.mjs';

const path = 'src/mocks/data/hanja-data.ts';
const raw = readFileSync(path, 'utf8');

// Parse existing entries
const reEntry = /korean:\s*"([^"]+)",\s*hanja:\s*"([^"]*)",\s*vietnamese:\s*"([^"]*)"/g;
const existing = new Set();
let m;
while ((m = reEntry.exec(raw))) {
  existing.add(`${m[1]}|${m[2]}`);
}
console.log(`Existing entries: ${existing.size}`);
console.log(`New batch candidates: ${ALL_NEW_BATCHES.length}`);

// Filter new unique entries
const toAdd = [];
const dupes = [];
const seenInBatch = new Set();
for (const entry of ALL_NEW_BATCHES) {
  const key = `${entry.korean}|${entry.hanja}`;
  if (existing.has(key) || seenInBatch.has(key)) {
    dupes.push(entry);
    continue;
  }
  seenInBatch.add(key);
  toAdd.push(entry);
}
console.log(`Duplicates skipped: ${dupes.length}`);
console.log(`New entries to add: ${toAdd.length}`);

// Build insertion text
const lines = toAdd.map(e => 
  `  { korean: "${e.korean}", hanja: "${e.hanja}", vietnamese: "${e.vietnamese}" },`
);

// Insert before closing `];`
const insertBlock = '\n  // ─── TOPIK Advanced Batch (auto-added) ───\n' + lines.join('\n') + '\n';
const newContent = raw.replace(/^\];/m, insertBlock + '];');

writeFileSync(path, newContent, 'utf8');

// Count final
const finalMatches = newContent.match(/korean:\s*"/g);
console.log(`\nFinal entry count: ${finalMatches?.length || 0}`);
