import requests

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

h = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Prefer": "count=exact"
}

r = requests.get(f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?select=id", headers=h)
cr = r.headers.get("content-range", "?")
total = cr.split("/")[-1] if "/" in cr else "?"
print(f"Tong tu trong DB: {total}")
if total.isdigit():
    missing = 2691 - int(total)
    print(f"Can co: 2691 | Thieu: {missing}")
    if missing <= 0:
        print("=> DU LIEU DAY DU!")
    else:
        print(f"=> Can chay lai de upload {missing} tu con thieu")
