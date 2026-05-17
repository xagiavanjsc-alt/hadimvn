"""Check hanja_tree_nodes data completeness for a sample tree."""
import requests, json, os

URL = os.environ.get("SUPABASE_URL", "")
KEY = os.environ.get("SUPABASE_KEY", "")

# Try to read from .env file
if not URL:
    try:
        with open(".env", "r") as f:
            for line in f:
                if line.startswith("VITE_PUBLIC_SUPABASE_URL="):
                    URL = line.split("=", 1)[1].strip().strip('"')
                elif line.startswith("VITE_PUBLIC_SUPABASE_ANON_KEY="):
                    KEY = line.split("=", 1)[1].strip().strip('"')
    except:
        pass

HEADERS = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}

# 1) Get top trees by count
print("=== TOP 15 TREES ===")
r = requests.get(f"{URL}/rest/v1/hanja_tree_nodes?select=root_char,root_meaning&order=root_char", headers=HEADERS)
data = r.json()
counts = {}
meanings = {}
for row in data:
    rc = row["root_char"]
    counts[rc] = counts.get(rc, 0) + 1
    if rc not in meanings and row.get("root_meaning"):
        meanings[rc] = row["root_meaning"]

sorted_trees = sorted(counts.items(), key=lambda x: -x[1])[:15]
for rc, cnt in sorted_trees:
    print(f"  {rc} ({meanings.get(rc, '?')}) → {cnt} nodes")

# 2) Pick a medium-sized tree (around 10-20 nodes) for detailed check
target = None
for rc, cnt in sorted_trees:
    if 5 <= cnt <= 25:
        target = rc
        break
if not target:
    target = sorted_trees[0][0]

print(f"\n=== DETAILED CHECK: Tree '{target}' ({meanings.get(target, '?')}) ===")
r2 = requests.get(
    f"{URL}/rest/v1/hanja_tree_nodes?root_char=eq.{target}"
    f"&select=korean,hanja,vietnamese,pronunciation,meaning_detail,examples,related_words,memory_tip,hanja_chars,difficulty,category,level"
    f"&order=korean",
    headers=HEADERS
)
nodes = r2.json()

empty_fields = {"meaning_detail": [], "examples": [], "related_words": [], "memory_tip": [], "hanja_chars": []}

for n in nodes:
    korean = n["korean"]
    hanja = n["hanja"]
    vn = n["vietnamese"]
    pron = n.get("pronunciation", "")
    md = n.get("meaning_detail", "")
    ex = n.get("examples") or []
    rw = n.get("related_words") or []
    mt = n.get("memory_tip", "")
    hc = n.get("hanja_chars") or []
    diff = n.get("difficulty", 0)
    cat = n.get("category", "")
    lv = n.get("level", 0)

    # Check completeness
    missing = []
    if not md: missing.append("meaning_detail")
    if not ex or len(ex) == 0: missing.append("examples")
    if not rw or len(rw) == 0: missing.append("related_words")
    if not mt: missing.append("memory_tip")
    if not hc or len(hc) == 0: missing.append("hanja_chars")

    for field in missing:
        empty_fields[field].append(korean)

    status = "✅" if not missing else f"⚠ thiếu: {', '.join(missing)}"
    print(f"\n  {korean} ({hanja}) [{pron}] → {vn}")
    print(f"    difficulty={diff} category={cat} level={lv}")
    print(f"    meaning_detail: {'✅ ' + md[:60] + '...' if md and len(md)>60 else '✅ ' + md if md else '❌ EMPTY'}")
    print(f"    examples: {'✅ ' + str(len(ex)) + ' items' if ex and len(ex)>0 else '❌ EMPTY'}")
    if ex:
        for e in ex[:2]:
            print(f"      → {e.get('korean','')} = {e.get('vietnamese','')}")
    print(f"    related_words: {'✅ ' + str(len(rw)) + ' items' if rw and len(rw)>0 else '❌ EMPTY'}")
    if rw:
        for w in rw[:2]:
            if isinstance(w, dict):
                print(f"      → {w.get('word','')} = {w.get('meaning','')}")
            else:
                print(f"      → {w}")
    print(f"    memory_tip: {'✅ ' + mt[:80] if mt else '❌ EMPTY'}")
    print(f"    hanja_chars: {'✅ ' + str(hc) if hc and len(hc)>0 else '❌ EMPTY'}")
    print(f"    → {status}")

print(f"\n=== SUMMARY for tree '{target}' ({len(nodes)} nodes) ===")
for field, empties in empty_fields.items():
    pct = (1 - len(empties) / len(nodes)) * 100 if nodes else 0
    status = "✅" if len(empties) == 0 else f"⚠ {len(empties)} missing"
    print(f"  {field}: {pct:.0f}% filled ({status})")
    if empties:
        print(f"    Missing in: {', '.join(empties[:5])}")

print(f"\nTotal nodes in DB: {len(data)}")
