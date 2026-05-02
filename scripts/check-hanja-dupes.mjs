import { readFileSync } from 'node:fs';
const raw = readFileSync('src/mocks/data/hanja-data.ts', 'utf8');
const re = /korean:\s*"([^"]+)",\s*hanja:\s*"([^"]*)",\s*vietnamese:\s*"([^"]*)"/g;
const entries = [];
let m;
while ((m = re.exec(raw))) entries.push({ korean: m[1], hanja: m[2], vn: m[3] });

console.log('Total entries:', entries.length);

// Duplicate by Korean
const byKorean = new Map();
for (const e of entries) {
  if (!byKorean.has(e.korean)) byKorean.set(e.korean, []);
  byKorean.get(e.korean).push(e);
}
const dupKorean = [...byKorean.entries()].filter(([, arr]) => arr.length > 1);
console.log('\n=== Trung khoa theo Korean:', dupKorean.length, '===');
for (const [k, arr] of dupKorean) {
  console.log(` ${k} (${arr.length}x): ${arr.map(e => `${e.hanja}=${e.vn}`).join(' | ')}`);
}

// Duplicate by korean+hanja
const byKH = new Map();
for (const e of entries) {
  const key = `${e.korean}|${e.hanja}`;
  if (!byKH.has(key)) byKH.set(key, []);
  byKH.get(key).push(e);
}
const dupKH = [...byKH.entries()].filter(([, arr]) => arr.length > 1);
console.log('\n=== Trung hoan toan (Korean + Hanja):', dupKH.length, '===');
for (const [k, arr] of dupKH) {
  console.log(` ${k} (${arr.length}x)`);
}

// Empty fields
const emptyHanja = entries.filter(e => !e.hanja);
const emptyVn = entries.filter(e => !e.vn);
console.log('\nEmpty hanja:', emptyHanja.length);
console.log('Empty vietnamese:', emptyVn.length);

console.log('\nUnique Korean words:', byKorean.size);
