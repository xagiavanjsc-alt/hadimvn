import { readFileSync, writeFileSync } from 'node:fs';
import { ALL_BATCH2 } from './hanja-batch2.mjs';

const path = 'src/mocks/data/hanja-data.ts';
const raw = readFileSync(path, 'utf8');

const reEntry = /korean:\s*"([^"]+)",\s*hanja:\s*"([^"]*)",\s*vietnamese:\s*"([^"]*)"/g;
const existing = new Set();
let m;
while ((m = reEntry.exec(raw))) existing.add(`${m[1]}|${m[2]}`);

console.log(`Existing: ${existing.size}`);
console.log(`Batch 2 candidates: ${ALL_BATCH2.length}`);

const toAdd = [];
const seenInBatch = new Set();
let dupCount = 0;
for (const entry of ALL_BATCH2) {
  const key = `${entry.korean}|${entry.hanja}`;
  if (existing.has(key) || seenInBatch.has(key)) { dupCount++; continue; }
  seenInBatch.add(key);
  toAdd.push(entry);
}
console.log(`Duplicates skipped: ${dupCount}`);
console.log(`New to add: ${toAdd.length}`);

const lines = toAdd.map(e => `  { korean: "${e.korean}", hanja: "${e.hanja}", vietnamese: "${e.vietnamese}" },`);
const block = '\n  // ─── Batch 2: Sports, Arts, Geography, History, Daily ───\n' + lines.join('\n') + '\n';
const newContent = raw.replace(/^\];/m, block + '];');

writeFileSync(path, newContent, 'utf8');

const finalMatches = newContent.match(/korean:\s*"/g);
console.log(`Final total: ${finalMatches?.length || 0}`);
