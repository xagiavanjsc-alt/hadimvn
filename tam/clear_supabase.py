"""
Xoa toan bo data trong bang hanja_pro cua Supabase
Chay: python clear_supabase.py
"""
import requests
import logging

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def clear_all():
    url = f"{SUPABASE_URL}/rest/v1/hanja_pro?id=gt.0"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    
    # Truoc tien dem xem co bao nhieu
    count_resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/hanja_pro?select=id",
        headers=headers
    )
    if count_resp.status_code == 200:
        total = len(count_resp.json())
        logger.info(f"Hien co {total} tu trong database")
    
    # Xoa het
    resp = requests.delete(url, headers=headers)
    if resp.status_code in [200, 204]:
        logger.info("✅ Da xoa toan bo data trong hanja_pro")
    else:
        logger.error(f"❌ Xoa that bai: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    confirm = input("XAC NHAN: Xoa toan bo data trong hanja_pro? (yes/no): ")
    if confirm.lower() == 'yes':
        clear_all()
    else:
        print("Huy bo.")
