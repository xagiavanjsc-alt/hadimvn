"""Delete entries with IDs 977, 980 from Supabase"""
import requests

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"
TABLE = "hanja_pro"

ids_to_delete = [977, 980]

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

for id in ids_to_delete:
    response = requests.delete(
        f"{SUPABASE_URL}/rest/v1/{TABLE}?id=eq.{id}",
        headers=headers
    )
    if response.status_code in [200, 204]:
        print(f"Da xoa ID {id}")
    else:
        print(f"Loi xoa ID {id}: {response.status_code} - {response.text}")
