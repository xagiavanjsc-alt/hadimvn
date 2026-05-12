"""
Xoa 8 tu co breakdown rong tu Supabase
IDs: 2190, 2211, 2217, 2221, 2228, 2230, 2232, 2234
"""
import requests

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

IDS_TO_DELETE = [2190, 2211, 2217, 2221, 2228, 2230, 2232, 2234]

for id in IDS_TO_DELETE:
    url = f"{SUPABASE_URL}/rest/v1/hanja_pro?id=eq.{id}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
    }
    response = requests.delete(url, headers=headers)
    if response.status_code in [200, 204]:
        print(f"Da xoa ID {id}")
    else:
        print(f"Loi xoa ID {id}: {response.status_code} - {response.text}")

print("\nHoan thanh!")
