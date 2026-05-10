"""Delete ID 692 from Supabase"""
import requests

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

def delete_entry(entry_id):
    url = f"{SUPABASE_URL}/rest/v1/hanja_pro?id=eq.{entry_id}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
    }
    response = requests.delete(url, headers=headers)
    if response.status_code in [200, 204]:
        print(f"Da xoa ID {entry_id} thanh cong")
        return True
    else:
        print(f"Loai xoa that bai: {response.status_code} - {response.text}")
        return False

if __name__ == "__main__":
    delete_entry(692)
