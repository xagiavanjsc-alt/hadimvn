"""
Lọc từ mới từ results.tsv - loại bỏ các từ đã có trong Supabase
Tạo file md mới với format: ## Hangul (Hanja)
"""
import csv
import requests

# ================== CAU HINH ==================
TSV_FILE = "fix/results.tsv"
OUTPUT_FILE = "fix/new_words.md"
SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

print("1. Đang lấy danh sách từ từ Supabase...")
existing_hangul = set()

# Dùng pagination để lấy hết 2591 từ
offset = 0
limit = 1000
while True:
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/hanja_pro?select=hangul&offset={offset}&limit={limit}",
        headers={'apikey': SUPABASE_KEY}
    )
    
    if response.status_code != 200:
        print(f"Lỗi khi lấy dữ liệu từ Supabase: {response.status_code}")
        break
    
    data = response.json()
    if not data:
        break
    
    for item in data:
        existing_hangul.add(item['hangul'])
    
    offset += limit
    print(f"   Đã lấy {len(existing_hangul)} từ...", end='\r')

print(f"\n   Đã lấy tổng cộng {len(existing_hangul)} từ từ Supabase")

print("2. Đang đọc results.tsv...")
new_words = []
with open(TSV_FILE, 'r', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t')
    next(reader)  # Skip header
    
    for row in reader:
        if len(row) < 4:
            continue
        
        rank = row[0]
        hangul = row[1]
        pos = row[2]
        hanja = row[3]
        
        # Bỏ qua nếu không có hanja hoặc hanja rỗng
        if not hanja or hanja.strip() == '':
            continue
        
        # Bỏ qua nếu từ đã có trong Supabase
        if hangul in existing_hangul:
            continue
        
        new_words.append({
            'hangul': hangul,
            'hanja': hanja,
            'rank': rank,
            'pos': pos
        })

print(f"   Đã tìm {len(new_words)} từ mới")

print("3. Đang tạo file md...")
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    for word in new_words:
        f.write(f"## {word['hangul']} ({word['hanja']})\n\n")

print(f"   Đã tạo file: {OUTPUT_FILE}")
print(f"   Tổng số từ mới: {len(new_words)}")
