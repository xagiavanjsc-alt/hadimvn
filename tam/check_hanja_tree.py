"""Kiem tra du lieu hanja_tree_nodes tren Supabase"""
import requests, json

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}
BASE = f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes"

# ─── 1. Tổng số từ ────────────────────────────────────────────────────────────
r = requests.get(f"{BASE}?select=id", headers={**HEADERS, "Prefer": "count=exact"})
total = int(r.headers.get("content-range", "0/0").split("/")[-1])
print(f"✅ Tổng số từ trong hanja_tree_nodes: {total}")

# ─── 2. Số cây (distinct root_char) ──────────────────────────────────────────
r = requests.get(f"{BASE}?select=root_char&limit=2000", headers=HEADERS)
roots = list(set(x["root_char"] for x in r.json() if x.get("root_char")))
print(f"✅ Số cây (root_char): {len(roots)}")

# ─── 3. Kiểm tra trường thiếu ─────────────────────────────────────────────────
r = requests.get(f"{BASE}?select=*&limit=2000", headers=HEADERS)
nodes = r.json()
print(f"\n📊 Kiểm tra {len(nodes)} từ đầu:")

fields = ["pronunciation", "meaning_detail", "memory_tip", "root_meaning", "hanja_chars", "examples", "related_words"]
for f in fields:
    missing = sum(1 for n in nodes if not n.get(f) or n[f] == [] or n[f] == "")
    pct = round(missing / len(nodes) * 100) if nodes else 0
    flag = "⚠️" if pct > 30 else ("✅" if pct == 0 else "🟡")
    print(f"  {flag} {f}: thiếu {missing}/{len(nodes)} ({pct}%)")

# ─── 4. Lấy 1 từ có đủ dữ liệu nhất ─────────────────────────────────────────
def score(n):
    s = 0
    for f in fields:
        v = n.get(f)
        if v and v != [] and v != "": s += 1
    return s

nodes_all = r.json()
best = max(nodes_all, key=score, default=None)
if best:
    print(f"\n🔍 Từ đầy đủ nhất: {best['korean']} ({best['hanja']}) - root: {best['root_char']}")
    print(f"  vietnamese   : {best.get('vietnamese','—')}")
    print(f"  pronunciation: {best.get('pronunciation','—')}")
    print(f"  meaning_detail: {str(best.get('meaning_detail','—'))[:80]}")
    print(f"  memory_tip   : {str(best.get('memory_tip','—'))[:80]}")
    print(f"  root_meaning : {best.get('root_meaning','—')}")
    print(f"  hanja_chars  : {best.get('hanja_chars','—')}")
    exs = best.get('examples', [])
    print(f"  examples     : {len(exs)} câu")
    if exs: print(f"    → {exs[0]}")
    rws = best.get('related_words', [])
    print(f"  related_words: {len(rws)} từ")
    if rws: print(f"    → {rws[0]}")
    print(f"  level={best.get('level')} | category={best.get('category')} | difficulty={best.get('difficulty')}")
    # rootAnalysis và mnemonicStory không có trong DB schema → sẽ luôn None
    print(f"  rootAnalysis : {'có' if best.get('rootAnalysis') else '❌ không có (không có cột trong DB)'}")
    print(f"  mnemonicStory: {'có' if best.get('mnemonicStory') else '❌ không có (không có cột trong DB)'}")

# ─── 5. Phân bố theo root_char ───────────────────────────────────────────────
from collections import Counter
root_counts = Counter(n["root_char"] for n in nodes_all)
print(f"\n📈 Top 5 cây nhiều từ nhất:")
for rc, cnt in root_counts.most_common(5):
    print(f"  {rc}: {cnt} từ")
print(f"📉 Top 5 cây ít từ nhất:")
for rc, cnt in root_counts.most_common()[:-6:-1]:
    print(f"  {rc}: {cnt} từ")
