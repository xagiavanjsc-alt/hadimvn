import re, json
from pathlib import Path

root = Path(r'c:\Users\hi\Desktop\code\han')
sql_path = root/'supabase/migrations/066_grammar_patterns_180_190.sql'
ts_path = root/'src/pages/grammar-by-level/page.tsx'

text = sql_path.read_text(encoding='utf-8')
blocks = re.split(r"\n-- ═+\n-- #(\d+): ([^\n]+)\n-- ═+\n", text)
patterns = []
for i in range(1, len(blocks), 3):
    num = int(blocks[i])
    body = blocks[i+2]
    m = re.search(r"VALUES \(\n  '([^']*)',\n  '([^']*)',\n  '([^']*)',\n  'advanced',\n  '([^']*)',\n  '([^']*)',\n  '([^']*)',\n  '(\[.*?\])'::jsonb,\n  ARRAY\[(.*?)\]::TEXT\[\],\n  ARRAY\[(.*?)\]::TEXT\[\],\n  'TOPIK II'\n\);", body, re.S)
    if not m:
        print(f'Could not parse pattern #{num}')
        continue
    pattern, roman, meaning, category, explanation, usage, examples_json, related_raw, tags_raw = m.groups()
    examples = json.loads(examples_json)
    exs = []
    for qm in re.finditer(r"SELECT id, '([^']*)', 'fill_blank', '(\[.*?\])'::jsonb, (\d+),\n  '([^']*)'", body, re.S):
        q, opts_json, ans, exp = qm.groups()
        exs.append({"question": q, "options": json.loads(opts_json), "answer": int(ans), "explanation": exp})
    tags = re.findall(r"'([^']*)'", tags_raw)
    patterns.append({
        'id': f'topik3-{num-179}',
        'level': 'TOPIK 3',
        'levelColor': '#f97316',
        'pattern': pattern,
        'meaning': meaning,
        'explanation': explanation,
        'formation': usage,
        'examples': examples,
        'exercises': exs,
        'commonMistakes': [],
        'tags': [t for t in tags if t not in ('topik3','advanced')][:4] + ['TOPIK 3'],
    })

def ts_string(s):
    return json.dumps(s, ensure_ascii=False)

def obj_to_ts(p):
    lines = ['  {']
    for key in ['id','level','levelColor','pattern','meaning','explanation','formation']:
        lines.append(f'    {key}: {ts_string(p[key])},')
    lines.append('    examples: [')
    for e in p['examples']:
        lines.append(f'      {{ korean: {ts_string(e["korean"])}, vietnamese: {ts_string(e["vietnamese"])} }},')
    lines.append('    ],')
    lines.append('    exercises: [')
    for e in p['exercises']:
        opts = '[' + ', '.join(ts_string(o) for o in e['options']) + ']'
        lines.append(f'      {{ question: {ts_string(e["question"])}, options: {opts}, answer: {e["answer"]}, explanation: {ts_string(e["explanation"])} }},')
    lines.append('    ],')
    lines.append('    commonMistakes: [],')
    tags = '[' + ', '.join(ts_string(t) for t in p['tags']) + ']'
    lines.append(f'    tags: {tags},')
    lines.append('  },')
    return '\n'.join(lines)

insert = '\n'.join(obj_to_ts(p) for p in patterns) + '\n'
ts = ts_path.read_text(encoding='utf-8')
marker = '  {\n    id: "topik3-1",'
if marker not in ts:
    print('Marker not found, appending at end')
    ts = ts.rstrip() + '\n' + insert
else:
    ts = ts.replace(marker, insert + marker, 1)
ts_path.write_text(ts, encoding='utf-8')
print(f'Inserted {len(patterns)} frontend patterns: {patterns[0]["id"]}..{patterns[-1]["id"]}')
