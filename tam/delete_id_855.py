"""Delete entry with ID 855 from Supabase"""
import requests
import os

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

def delete_id(id):
    url = f"{SUPABASE_URL}/rest/v1/hanja_pro?id=eq.{id}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}"
    }
    response = requests.delete(url, headers=headers)
    if response.status_code == 204:
        print(f"Da xoa ID {id} thanh cong")
        return True
    else:
        print(f"Loi khi xoa ID {id}: {response.status_code} - {response.text}")
        return False

if __name__ == "__main__":
    delete_id(855)
