"""Clear Melon data from localStorage"""
import requests

SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

def clear_melon_songs():
    """Clear all Melon songs from Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/melon_songs"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Prefer': 'return=minimal'
    }
    
    # Delete all records
    response = requests.delete(url, headers=headers)
    
    if response.status_code in [200, 204]:
        print("Đã xóa toàn bộ dữ liệu Melon songs thành công")
        return True
    else:
        print(f"Lỗi xóa dữ liệu: {response.status_code} - {response.text}")
        return False

def clear_naver_kin():
    """Clear all Naver KiN Q&A from Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/naver_kin_qa"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Prefer': 'return=minimal'
    }
    
    response = requests.delete(url, headers=headers)
    
    if response.status_code in [200, 204]:
        print("Đã xóa toàn bộ dữ liệu Naver KiN Q&A thành công")
        return True
    else:
        print(f"Lỗi xóa dữ liệu: {response.status_code} - {response.text}")
        return False

if __name__ == "__main__":
    print("Bắt đầu xóa dữ liệu cũ...")
    
    # Clear Melon songs
    clear_melon_songs()
    
    # Clear Naver KiN
    clear_naver_kin()
    
    print("Hoàn thành!")
