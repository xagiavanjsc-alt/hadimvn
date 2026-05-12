"""
Delete records with empty breakdown: IDs 1993, 2036
"""
import requests

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

# Delete ID 1993
url1 = f"{SUPABASE_URL}/rest/v1/hanja_pro?id=eq.1993"
headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': f'Bearer {SUPABASE_KEY}',
}
response1 = requests.delete(url1, headers=headers)
print(f"Delete ID 1993: {response1.status_code}")

# Delete ID 2036
url2 = f"{SUPABASE_URL}/rest/v1/hanja_pro?id=eq.2036"
response2 = requests.delete(url2, headers=headers)
print(f"Delete ID 2036: {response2.status_code}")

print("Done!")
