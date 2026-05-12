"""
Delete 3 records trong Phan_093 co breakdown rong (IDs 1940, 1942, 1947)
Sau do re-upload Phan_093
"""
import requests

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

ids_to_delete = [1940, 1942, 1947]

for id in ids_to_delete:
    url = f"{SUPABASE_URL}/rest/v1/hanja_pro?id=eq.{id}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
    }
    response = requests.delete(url, headers=headers)
    if response.status_code in [200, 204]:
        print(f"Da xoa ID {id}")
    else:
        print(f"Loi khi xoa ID {id}: {response.status_code} - {response.text}")

print("Hoan thanh xoa 3 records. Chay upload_phan093.py de re-upload.")
