"""
Upload hanja_tree_nodes - FAST VERSION (10 threads song song)
Nhanh hon ~8x so voi ban goc
"""
import pandas as pd
import openai
import time
import re
import os
import json
import requests
from itertools import cycle
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

# ================== CAU HINH ==================
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
BATCH_SIZE  = 50    # Insert Supabase moi batch
MAX_WORKERS = 10    # So luong AI calls song song
MAX_RETRIES = 3
TIMEOUT     = 60

# ================== THREAD-SAFE KEY ROTATOR ==================
class KeyRotator:
    def __init__(self, keys):
        self._keys  = keys
        self._cycle = cycle(keys)
        self._lock  = threading.Lock()

    def get_key(self):
        with self._lock:
            return next(self._cycle)

key_rotator = KeyRotator(API_KEYS)

# ================== SUPABASE ==================
def get_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

def get_existing_korean():
    print("Kiem tra tu da co...", flush=True)
    url = f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes?select=korean"
    existing = set()
    offset, limit = 0, 1000
    while True:
        resp = requests.get(f"{url}&limit={limit}&offset={offset}", headers=get_headers(), timeout=30)
        if resp.status_code != 200:
            print(f"  Loi: {resp.text[:100]}")
            break
        data = resp.json()
        if not data:
            break
        for row in data:
            existing.add(row["korean"])
        if len(data) < limit:
            break
        offset += limit
    print(f"  Da co {len(existing)} tu trong DB", flush=True)
    return existing

def insert_batch(records):
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/hanja_tree_nodes",
        headers=get_headers(),
        json=records,
        timeout=30
    )
    return resp.status_code in (200, 201)

# ================== AI (chay tren tung thread) ==================
def ai_generate_info(hangul, hanja, meaning_vn):
    prompt = f"""Phan tich tu Han-Quoc, tra ve JSON:
Tu: {hangul} | Han tu: {hanja} | Nghia: {meaning_vn}

{{
  "root_char": "chu Han goc (1 chu quan trong nhat, vd: 家)",
  "root_meaning": "nghia chu goc bang tieng Viet (1-2 tu, vd: Nha)",
  "pronunciation": "phien am Latin (vd: ga-jok)",
  "difficulty": 2
}}

difficulty: 1=De(TOPIK1-2), 2=TB(TOPIK3-4), 3=Kho(TOPIK5-6)
Chi tra JSON, khong giai thich."""

    api_key = key_rotator.get_key()
    client = openai.OpenAI(
        base_url="https://api.fireworks.ai/inference/v1",
        api_key=api_key,
        timeout=TIMEOUT
    )
    for attempt in range(MAX_RETRIES):
        try:
            resp = client.chat.completions.create(
                model="accounts/fireworks/models/deepseek-v3p2",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                timeout=TIMEOUT
            )
            text = resp.choices[0].message.content.strip()
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                return json.loads(match.group())
        except Exception as e:
            time.sleep(2 * (attempt + 1))
            api_key = key_rotator.get_key()
            client = openai.OpenAI(
                base_url="https://api.fireworks.ai/inference/v1",
                api_key=api_key,
                timeout=TIMEOUT
            )

    # Fallback khong can AI
    return {
        "root_char": hanja[0] if hanja else "?",
        "root_meaning": meaning_vn.split(",")[0].strip()[:10] if meaning_vn else "",
        "pronunciation": "",
        "difficulty": 2
    }

# ================== XU LY 1 HANG (chay song song) ==================
_lock_print = threading.Lock()
_counter     = {"done": 0, "total": 0}

def process_row(row_data):
    idx, hangul, hanja, meaning_vn = row_data
    info = ai_generate_info(hangul, hanja, meaning_vn)
    record = {
        "korean":       hangul,
        "hanja":        hanja,
        "vietnamese":   meaning_vn,
        "root_char":    info.get("root_char", hanja[0] if hanja else "?"),
        "root_meaning": info.get("root_meaning", ""),
        "pronunciation":info.get("pronunciation", ""),
        "difficulty":   int(info.get("difficulty", 2)),
        "meaning_detail": "",
        "memory_tip":   "",
        "examples":     [],
        "related_words":[],
        "hanja_chars":  list(hanja) if hanja else [],
        "level":        1,
        "category":     "",
    }
    with _lock_print:
        _counter["done"] += 1
        print(f"[{_counter['done']}/{_counter['total']}] {hangul} -> root={record['root_char']} diff={record['difficulty']}", flush=True)
    return record

# ================== MAIN ==================
def main():
    print("=== Upload hanja_tree_nodes (FAST - 10 threads) ===", flush=True)

    df = pd.read_csv(INPUT_FILE, encoding="utf-8")
    print(f"Doc duoc {len(df)} tu tu {INPUT_FILE}", flush=True)

    existing = get_existing_korean()
    to_upload = df[~df["Tiếng Hàn"].isin(existing)].reset_index(drop=True)
    print(f"Can upload: {len(to_upload)} tu", flush=True)

    if len(to_upload) == 0:
        print("Tat ca tu da duoc upload!")
        return

    _counter["total"] = len(to_upload)

    rows = [(i, r["Tiếng Hàn"], r["Hán tự"], r["Nghĩa tiếng Việt"])
            for i, r in to_upload.iterrows()]

    # Xu ly song song
    results = []
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(process_row, row): row for row in rows}
        for future in as_completed(futures):
            try:
                results.append(future.result())
            except Exception as e:
                print(f"  Loi: {e}", flush=True)

            # Insert khi du batch
            if len(results) >= BATCH_SIZE:
                batch = results[:BATCH_SIZE]
                results = results[BATCH_SIZE:]
                if insert_batch(batch):
                    print(f"  >>> Inserted {BATCH_SIZE} tu OK", flush=True)
                else:
                    print(f"  >>> FAILED insert batch!", flush=True)

    # Insert phan con lai
    if results:
        if insert_batch(results):
            print(f"  >>> Inserted {len(results)} tu cuoi OK", flush=True)

    print(f"\nHOAN THANH! Da xu ly {_counter['done']}/{_counter['total']} tu", flush=True)

if __name__ == "__main__":
    main()
