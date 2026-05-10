"""Kiem tra chi tiet tu trong Supabase"""
import requests, json

headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE'
}

# Check gwa-do va gong-gwon-ryeok
for slug in ['gwa-do', 'gong-gwon-ryeok']:
    r = requests.get(f'https://dcjofhkdrgbrowabudyt.supabase.co/rest/v1/hanja_pro?slug=eq.{slug}&select=id,hangul,hanja,meaning_vn,hanja_breakdown', headers=headers)
    d = r.json()
    if d:
        item = d[0]
        print(f"\n=== {item['hangul']} ({item['hanja']}) - slug: {slug} ===")
        print(f"  meaning_vn: {item['meaning_vn']}")
        for b in item.get('hanja_breakdown', []):
            print(f"  {b['char']}: meaning='{b['meaning']}'")
