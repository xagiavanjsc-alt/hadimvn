import requests
from collections import Counter

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"
H = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}

r = requests.get(f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?select=root_char&limit=5000", headers=H, timeout=30)
nodes = r.json()
counts = Counter(n["root_char"] for n in nodes)

dist = Counter(v for v in counts.values())
print(f"Tong so cay: {len(counts)}")
print(f"Phan bo so tu/cay:")
for k in sorted(dist.keys()):
    print(f"  {k} tu/cay: {dist[k]} cay")
print(f"\nCay co >= 2 tu: {sum(1 for v in counts.values() if v >= 2)}")
print(f"Cay chi 1 tu:  {sum(1 for v in counts.values() if v == 1)}")
