const XLSX = require('xlsx');
const fs = require('fs');

const wb = XLSX.readFile('docs/Phan_23_fixed.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

function extractMeaningVn(raw) {
  const m = raw.match(/Ngh[iĩ]a ti[eế]ng Vi[eệ]t(?:\s+l[aà])?\s*[:"«]?\s*["\u201c\u201d\u201e]?([^"\u201c\u201d\u201e\n]+)/);
  if (!m) return '';
  return m[1].trim().replace(/["\u201c\u201d\u201e,.']+$/, '').replace(/^["\u201c\u201d\u201e]+/, '');
}

function extractSlug(raw) {
  const m = raw.match(/\*\*([a-z][a-z-]+)\*\*/);
  return m ? m[1].replace(/^-+|-+$/g, '') : '';
}

function extractExamples(raw) {
  const results = [];
  const re = /[+•]\s*H[aà]n:\s*([\s\S]+?)\n[+•]\s*B[oồ]i:\s*([\s\S]+?)\n\s*[+•]\s*Vi[eệ]t:\s*([\s\S]+?)(?=\n[+•]|\n\n|$)/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    results.push({
      ko: m[1].trim().replace(/\*\*/g, ''),
      boi: m[2].trim().replace(/\*\*/g, ''),
      vi: m[3].trim()
    });
  }
  return results;
}

function extractRelated(raw) {
  const results = [];
  const secMatch = raw.match(/3\.\s*3 T[ƯU]\u0300 LI[EÊ][NÊ]\s*QUAN[\s\S]+?\n([\s\S]+?)(?=\n\s*4\.)/);
  if (!secMatch) return results;
  const re = /-\s*(\S+)\s*\(([^)]+)\)\s*:\s*(.+)/g;
  let m;
  while ((m = re.exec(secMatch[1])) !== null) {
    results.push({ word: m[1].trim(), hanja: m[2].trim(), meaning: m[3].trim() });
  }
  return results;
}

function extractMnemonic(raw) {
  const m = raw.match(/4\.\s*M[EẸ]O\s*NH[OỚ]+[:\s]+([\s\S]+)/);
  return m ? m[1].trim() : '';
}

function extractBreakdown(raw) {
  const results = [];
  const re = /["\u201c\u201d\u201e]([가-힣]+)["\u201c\u201d\u201e]\s*\(([^\s\-)]+)\s*-\s*[^)]+\)\s+ngh[iĩ]a l[aà]\s*([^,;.\n"]+)/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    results.push({
      char: m[2].trim(),
      reading: m[1].trim(),
      meaning: m[3].trim().replace(/["\u201c\u201d\u201e]+$/, '')
    });
  }
  return results;
}

function esc(s) {
  return (s || '').replace(/'/g, "''");
}

const lines = [];
lines.push('-- \u2500\u2500\u2500 Hanja Pro: Ph\u1ea7n 23 (' + (rows.length - 1) + ' t\u1eeb) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
lines.push('-- Generated from docs/Phan_23.xlsx');
lines.push('-- Ph\u1ea7n 23: 21 t\u1eeb (n\u1ed3-\u0111\u1ed9ng-l\u1ef1c \u2192 \u0111\u01b0\u01a1ng-tuy\u1ec3n)');
lines.push('');

const startId = 200;

rows.slice(1).forEach((row, idx) => {
  const hangul = (row[0] || '').trim();
  const hanja  = (row[1] || '').trim();
  const raw    = (row[2] || '').trim();
  if (!hangul || !hanja) return;

  const id         = startId + idx;
  const slug       = extractSlug(raw) || hangul;
  const meaning_vn = extractMeaningVn(raw);
  const examples   = extractExamples(raw);
  const related    = extractRelated(raw);
  const mnemonic   = extractMnemonic(raw);
  const breakdown  = extractBreakdown(raw);

  lines.push('-- ' + hangul + ' (' + hanja + ')');
  lines.push('INSERT INTO public.hanja_pro (id, hangul, hanja, slug, meaning_vn, hanja_breakdown, examples, related_words, mnemonic, raw)');
  lines.push('VALUES (');
  lines.push('  ' + id + ',');
  lines.push("  '" + esc(hangul) + "',");
  lines.push("  '" + esc(hanja) + "',");
  lines.push("  '" + esc(slug) + "',");
  lines.push("  '" + esc(meaning_vn) + "',");
  lines.push("  '" + esc(JSON.stringify(breakdown)) + "'::jsonb,");
  lines.push("  '" + esc(JSON.stringify(examples)) + "'::jsonb,");
  lines.push("  '" + esc(JSON.stringify(related)) + "'::jsonb,");
  lines.push("  '" + esc(mnemonic) + "',");
  lines.push("  '" + esc(raw) + "'");
  lines.push(') ON CONFLICT (slug) DO UPDATE SET');
  lines.push('  hangul=EXCLUDED.hangul, hanja=EXCLUDED.hanja, meaning_vn=EXCLUDED.meaning_vn,');
  lines.push('  hanja_breakdown=EXCLUDED.hanja_breakdown, examples=EXCLUDED.examples,');
  lines.push('  related_words=EXCLUDED.related_words, mnemonic=EXCLUDED.mnemonic, raw=EXCLUDED.raw;');
  lines.push('');
});

lines.push("SELECT setval('hanja_pro_id_seq', GREATEST((SELECT MAX(id) FROM public.hanja_pro), 300));");

fs.writeFileSync('supabase/migrations/097_hanja_phan23.sql', lines.join('\n'), 'utf8');
console.log('Done! Written', rows.length - 1, 'entries.');

// Quick verification
rows.slice(1).forEach((row, idx) => {
  const hangul = (row[0] || '').trim();
  const raw = (row[2] || '').trim();
  const slug = extractSlug(raw) || hangul;
  const ex = extractExamples(raw);
  const rel = extractRelated(raw);
  console.log((200 + idx) + ' | ' + hangul + ' | slug:' + slug + ' | ex:' + ex.length + ' | rel:' + rel.length);
});
