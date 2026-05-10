"""Xoa ID 22-105 va upload lai Phan 001, 002, 004"""
import requests

headers = {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE'
}

# Xoa ID 22-105 (Phan 001, 002, 003, 004)
import sys
id_from = int(sys.argv[1]) if len(sys.argv) > 1 else 106
id_to = int(sys.argv[2]) if len(sys.argv) > 2 else 126
r = requests.delete(
    f'https://dcjofhkdrgbrowabudyt.supabase.co/rest/v1/hanja_pro?id=gte.{id_from}&id=lte.{id_to}',
    headers=headers
)
print(f"Delete {id_from}-{id_to}: {r.status_code}")
