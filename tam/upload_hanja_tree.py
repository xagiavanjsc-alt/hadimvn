"""
Upload tu vung tu hanja_tat_ca.csv len Supabase bang hanja_tree_nodes
AI tu dong sinh: root_char, root_meaning, pronunciation, difficulty
Co tinh nang resume: chi upload cac tu chua co
"""
import pandas as pd
import openai
import time
import re
import os
import json
import requests
from itertools import cycle

# ================== CAU HINH ==================
# Dien thong tin Supabase vao day
SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"

API_KEYS = [
    "fw_PkdcPWDWWhHQWJGQwSJFZP",
    "fw_9QTsRMtMkyp62793nEHMAP",
    "fw_E2XaDgqMW8K2Y1k9DuiHKh",
    "fw_7aXZ7xrDjeiNipNuQEo7QD",
    "fw_MzNjKUP9N6TvDoZ4tNFxHH",
    "fw_GNut4EN3zwAjSCUCtXVkZA",
    "fw_BacKdzAhUGCSpo1VPHoqxn",
    "fw_7CcCMtwjZ691u31QzyBcPY",
    "fw_AxytSsLxZKg2TQ7T3yW5pm",
    "fw_NNhmmqNveVX5MpC7km5fNK",
    "fw_P5MNuiZT3yUhAR3oahgJ34",
    "fw_YKN6p7rHQDoqogwSu1hMcA",
]
INPUT_FILE = "fix/hanja_tat_ca.csv"
BATCH_SIZE = 50   # So tu insert 1 lan
MAX_RETRIES = 3
TIMEOUT = 120

# ================== SUPABASE HEADERS ==================
def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

# ================== XOAY VONG API KEY ==================
class KeyRotator:
    def __init__(self, keys):
        self.keys = keys
        self.cycle = cycle(keys)
        self.current_key = next(self.cycle)
        self.client = self._make_client()
        self.failed_keys = set()

    def _make_client(self):
        return openai.OpenAI(
            base_url="https://api.fireworks.ai/inference/v1",
            api_key=self.current_key,
            timeout=TIMEOUT
        )

    def rotate(self):
        self.failed_keys.add(self.current_key)
        for _ in range(len(self.keys)):
            self.current_key = next(self.cycle)
            if self.current_key not in self.failed_keys:
                break
        self.client = self._make_client()

    def get_client(self):
        return self.client

key_rotator = KeyRotator(API_KEYS)

# ================== AI SINH THONG TIN ==================
def ai_generate_info(hangul, hanja, meaning_vn):
    """Dung AI sinh root_char, root_meaning, pronunciation, difficulty"""
    global key_rotator
    
    prompt = f"""Phan tich tu tieng Han-Viet sau va tra ve JSON:
Tu: {hangul} | Han tu: {hanja} | Nghia: {meaning_vn}

Tra ve JSON voi format:
{{
  "root_char": "chu Han goc (1 chu, vd: 家)",
  "root_meaning": "nghia cua chu goc bang tieng Viet (vd: Gia dinh)",
  "pronunciation": "phien am Latinh (vd: ga-jok)",
  "difficulty": 1
}}

Quy tac:
- root_char: 1 chu Han quan trong nhat trong tu (chu co nghia bao quat nhat)
- root_meaning: nghia cua chu goc (ngan gon, 1-2 tu tieng Viet)
- pronunciation: phien am Latinh theo chuan Han-Quoc (dung "-" phan cach am tiet)
- difficulty: 1=De (tu co ban TOPIK 1-2), 2=TB (TOPIK 3-4), 3=Kho (TOPIK 5-6)

Chi tra ve JSON, khong giai thich them."""

    client = key_rotator.get_client()
    for attempt in range(MAX_RETRIES):
        try:
            resp = client.chat.completions.create(
                model="accounts/fireworks/models/deepseek-v3p2",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                timeout=TIMEOUT
            )
            text = resp.choices[0].message.content.strip()
            # Lay phan JSON
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                data = json.loads(match.group())
                return data
        except Exception as e:
            print(f"    Loi AI: {e}, lan {attempt+1}", flush=True)
            time.sleep(3 * (attempt + 1))
            key_rotator.rotate()
            client = key_rotator.get_client()
    
    # Fallback neu AI that bai
    return {
        "root_char": hanja[0] if hanja else "?",
        "root_meaning": meaning_vn.split(",")[0].strip() if meaning_vn else "",
        "pronunciation": hangul,
        "difficulty": 2
    }

# ================== KIEM TRA TU DA CO ==================
def get_existing_hangul():
    """Lay danh sach hangul da co trong Supabase"""
    print("Dang kiem tra tu da co trong Supabase...", flush=True)
    url = f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?select=korean"
    headers = get_headers()
    
    existing = set()
    offset = 0
    limit = 1000
    while True:
        resp = requests.get(
            f"{url}&limit={limit}&offset={offset}",
            headers=headers
        )
        if resp.status_code != 200:
            print(f"  Loi khi kiem tra: {resp.text}")
            break
        data = resp.json()
        if not data:
            break
        for row in data:
            existing.add(row["korean"])
        if len(data) < limit:
            break
        offset += limit
    
    print(f"  Da co {len(existing)} tu trong database", flush=True)
    return existing

# ================== INSERT LEN SUPABASE ==================
def insert_batch(records):
    """Insert mot batch records len Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes"
    headers = get_headers()
    
    resp = requests.post(url, headers=headers, json=records)
    if resp.status_code in (200, 201):
        return True
    else:
        print(f"  Loi insert: {resp.status_code} - {resp.text[:200]}")
        return False

# ================== MAIN ==================
def main():
    print("=== Upload hanja_tree_nodes ===", flush=True)
    
    # Kiem tra Supabase config
    if "your-project" in SUPABASE_URL:
        print("LOI: Chua dien SUPABASE_URL va SUPABASE_KEY!")
        print("Mo file nay va sua dong 14-15 truoc khi chay.")
        return
    
    # Doc file CSV
    print(f"Doc file {INPUT_FILE}...", flush=True)
    df = pd.read_csv(INPUT_FILE, encoding='utf-8')
    print(f"  Doc duoc {len(df)} tu", flush=True)
    
    # Kiem tra tu da co
    existing = get_existing_hangul()
    
    # Loc cac tu chua co
    to_upload = df[~df['Tiếng Hàn'].isin(existing)].reset_index(drop=True)
    print(f"  Can upload: {len(to_upload)} tu (da co: {len(existing)})", flush=True)
    
    if len(to_upload) == 0:
        print("Tat ca tu da duoc upload!", flush=True)
        return
    
    # Xu ly tung tu
    batch = []
    success_count = 0
    
    for idx, row in to_upload.iterrows():
        hangul = row['Tiếng Hàn']
        hanja = row['Hán tự']
        meaning_vn = row['Nghĩa tiếng Việt']
        
        print(f"[{idx+1}/{len(to_upload)}] {hangul} ({hanja})...", end=' ', flush=True)
        
        # AI sinh thong tin
        info = ai_generate_info(hangul, hanja, meaning_vn)
        
        record = {
            "korean": hangul,
            "hanja": hanja,
            "vietnamese": meaning_vn,
            "root_char": info.get("root_char", hanja[0] if hanja else "?"),
            "root_meaning": info.get("root_meaning", ""),
            "pronunciation": info.get("pronunciation", ""),
            "difficulty": int(info.get("difficulty", 2)),
            "meaning_detail": "",
            "memory_tip": "",
            "examples": [],
            "related_words": [],
            "hanja_chars": list(hanja) if hanja else [],
            "level": 1,
            "category": "",
        }
        
        print(f"root={record['root_char']}({record['root_meaning']}) pron={record['pronunciation']}", flush=True)
        batch.append(record)
        
        # Insert khi du batch
        if len(batch) >= BATCH_SIZE:
            print(f"  Dang insert {len(batch)} tu...", flush=True)
            if insert_batch(batch):
                success_count += len(batch)
                print(f"  OK! Tong da upload: {success_count}", flush=True)
            batch = []
        
        time.sleep(0.3)
    
    # Insert phan con lai
    if batch:
        print(f"  Dang insert {len(batch)} tu cuoi...", flush=True)
        if insert_batch(batch):
            success_count += len(batch)
    
    print(f"\nHOAN THANH! Da upload {success_count}/{len(to_upload)} tu", flush=True)

if __name__ == "__main__":
    main()
