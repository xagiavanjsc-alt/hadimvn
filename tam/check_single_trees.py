import requests
from collections import Counter

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"
H = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}

r = requests.get(
    f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes"
    f"?select=korean,hanja,vietnamese,root_char,root_meaning&limit=5000",
    headers=H, timeout=30
)
nodes = r.json()
counts = Counter(n["root_char"] for n in nodes)
single = {rc for rc, cnt in counts.items() if cnt == 1}

print(f"Cay chi co 1 tu ({len(single)} cay):")
for n in nodes:
    if n["root_char"] in single:
        print(f"  [{n['root_char']}] {n['korean']} ({n['hanja']}) = {n['vietnamese']} | root: {n['root_meaning']}")
