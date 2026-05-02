import { readFileSync, writeFileSync } from 'node:fs';
import { ALL_BATCH3 } from './hanja-batch3.mjs';

const path = 'src/mocks/data/hanja-data.ts';
const raw = readFileSync(path, 'utf8');
const reEntry = /korean:\s*"([^"]+)",\s*hanja:\s*"([^"]*)",\s*vietnamese:\s*"([^"]*)"/g;
const existing = new Set();
let m;
while ((m = reEntry.exec(raw))) existing.add(`${m[1]}|${m[2]}`);
console.log(`Existing: ${existing.size}, Batch 3: ${ALL_BATCH3.length}`);

const toAdd = [];
const seen = new Set();
let dup = 0;
for (const e of ALL_BATCH3) {
  const k = `${e.korean}|${e.hanja}`;
  if (existing.has(k) || seen.has(k)) { dup++; continue; }
  seen.add(k); toAdd.push(e);
}
console.log(`Dup: ${dup}, Add: ${toAdd.length}`);

const lines = toAdd.map(e => `  { korean: "${e.korean}", hanja: "${e.hanja}", vietnamese: "${e.vietnamese}" },`);
const block = '\n  // ─── Batch 3: Military, Nature, Emotions, Food, Abstract ───\n' + lines.join('\n') + '\n';
const newContent = raw.replace(/^\];/m, block + '];');
writeFileSync(path, newContent, 'utf8');
const total = newContent.match(/korean:\s*"/g)?.length || 0;
console.log(`Final: ${total}`);
