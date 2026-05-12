"""
Dich nghia tieng Viet cho cac file Excel trong thu muc excel_output
Dung Fireworks AI API
"""
import pandas as pd
import openai
import time
import re
import os
from itertools import cycle

# ================== CAU HINH ==================
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
INPUT_DIR = r"C:\Users\hi\Desktop\Ebook\excel_output"  # Thu muc chua file Excel dau vao
OUTPUT_DIR = r"C:\Users\hi\Desktop\Ebook\excel_output\1"  # Thu muc chua file Excel da dich
MAX_RETRIES = 3
TIMEOUT = 120
SINGLE_FILE = "Hanja_Phan_130.xlsx"  # Đặt tên file cần xử lý

# ================== XOAY VONG API KEY ==================
class KeyRotator:
    def __init__(self, keys):
        if not keys:
            raise ValueError("Danh sach API_KEYS khong duoc rong")
        self.keys = keys
        self.cycle = cycle(keys)
        self.current_key = next(self.cycle)
        self.client = openai.OpenAI(
            base_url="https://api.fireworks.ai/inference/v1",
            api_key=self.current_key,
            timeout=TIMEOUT
        )
        self.failed_keys = set()
    
    def rotate(self):
        self.failed_keys.add(self.current_key)
        for _ in range(len(self.keys)):
            self.current_key = next(self.cycle)
            if self.current_key not in self.failed_keys:
                break
        
        self.client = openai.OpenAI(
            base_url="https://api.fireworks.ai/inference/v1",
            api_key=self.current_key,
            timeout=TIMEOUT
        )
        print(f"Da chuyen API key: {self.current_key[:10]}... (Key fail: {len(self.failed_keys)}/{len(self.keys)})")
    
    def reset_failed(self):
        self.failed_keys.clear()
        print("Da reset danh sach key fail")
    
    def get_client(self):
        return self.client

key_rotator = KeyRotator(API_KEYS)
client = key_rotator.get_client()

# ================== DICH NGHIA TIENG VIET ==================
def translate_meaning(hangul, hanja):
    """Dung Fireworks AI de dich nghia tieng Viet"""
    global client, key_rotator
    
    prompt = f"""Dich nghia tieng Viet cho tu tieng Han: {hangul} (Han tu: {hanja})

YEU CAU:
- Chi tra ve nghia tieng Viet, NGAN GON (2-4 tu)
- KHONG giai thich, KHONG them loai tu
- Neu co nhac nghia, ngan cach bang dau phay (,)
- Dung format: Nghia 1, Nghia 2

VI DU:
- 가결 (可決): Thông qua, Biểu quyết
- 가격 (價格): Giá cả
- 가족 (家族): Gia đình
- 가능하다 (可能-): Có thể

Tra ve nghia tieng Viet cho {hangul} ({hanja}):"""
    
    for attempt in range(MAX_RETRIES):
        try:
            print(f"  Calling API...", end=' ', flush=True)
            resp = client.chat.completions.create(
                model="accounts/fireworks/models/deepseek-v3p2",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                timeout=TIMEOUT
            )
            meaning = resp.choices[0].message.content.strip()
            meaning = re.sub(r'^[-:]\s*', '', meaning)
            meaning = meaning.split('\n')[0].strip()
            return meaning
        except Exception as e:
            print(f"  Loi API: {e}, lan {attempt+1}", flush=True)
            time.sleep(3*(attempt+1))
            key_rotator.rotate()
            client = key_rotator.get_client()
    
    print(f"  Bo qua sau {MAX_RETRIES} lan", flush=True)
    return ""

# ================== XU LY FILE EXCEL ==================
def process_excel_file(filepath):
    """Dich nghia cho mot file Excel"""
    try:
        df = pd.read_excel(filepath, engine='openpyxl')
    except Exception as e:
        print(f"  Lo khi doc file: {e}")
        return False
    
    # In ra ten cac cot de kiem tra
    print(f"  Cot trong file: {df.columns.tolist()}")
    
    # Kiem tra xem co 3 cot can thiet khong
    required_cols = ['Tiếng Hàn', 'Hán tự', 'Nghĩa tiếng Việt']
    missing_cols = [col for col in required_cols if col not in df.columns]
    if missing_cols:
        print(f"  File thieu cot: {missing_cols}")
        return False
    
    # Chuyen cot "Nghĩa tiếng Việt" sang object dtype de tranh loi float64
    df['Nghĩa tiếng Việt'] = df['Nghĩa tiếng Việt'].astype(object)
    
    # Dem so tu can dich
    to_translate = df[df['Nghĩa tiếng Việt'].isna() | (df['Nghĩa tiếng Việt'] == '')]
    if len(to_translate) == 0:
        print(f"  Tat ca tu da co nghia")
        return True
    
    print(f"  Can dich {len(to_translate)} tu...")
    
    # Reset key fail khi bat dau file moi
    key_rotator.reset_failed()
    
    # Dich tung tu
    for idx, row in df.iterrows():
        if pd.notna(row['Nghĩa tiếng Việt']) and row['Nghĩa tiếng Việt'] != '':
            continue
        
        hangul = row['Tiếng Hàn']
        hanja = row['Hán tự']
        
        print(f"  [{idx+1}/{len(df)}] Dich {hangul}...", end=' ', flush=True)
        try:
            meaning = translate_meaning(hangul, hanja)
            df.at[idx, 'Nghĩa tiếng Việt'] = meaning
            print(f"OK: {meaning}", flush=True)
        except Exception as e:
            print(f"LOI: {e}", flush=True)
            meaning = ""
        time.sleep(0.5)
    
    # Tao thu muc output neu chua co
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Luu file vao thu muc output
    output_filepath = os.path.join(OUTPUT_DIR, os.path.basename(filepath))
    df.to_excel(output_filepath, index=False, engine='openpyxl')
    print(f"  Da luu file: {output_filepath}")
    return True

# ================== MAIN ==================
def main():
    print("Bat dau dich nghia tieng Viet...")
    
    # Neu chi dich 1 file
    if SINGLE_FILE:
        filepath = os.path.join(INPUT_DIR, SINGLE_FILE)
        if not os.path.exists(filepath):
            print(f"Khong tim thay file: {filepath}")
            return
        print(f"Dang xu ly file duy nhat: {SINGLE_FILE}")
        process_excel_file(filepath)
        print(f"\nHOAN THANH!")
        return
    
    # Lay danh sach file Excel trong thu muc
    excel_files = []
    for filename in os.listdir(INPUT_DIR):
        if filename.endswith('.xlsx') and filename.startswith('Hanja_Phan_'):
            excel_files.append(os.path.join(INPUT_DIR, filename))
    
    # Sort theo ten file
    excel_files.sort()
    
    print(f"Tim thay {len(excel_files)} file Excel trong {INPUT_DIR}")
    print("Neu chi muon dich 1 file, hay dat SINGLE_FILE trong cau hinh")
    
    # Xu ly tung file
    success_count = 0
    for filepath in excel_files:
        filename = os.path.basename(filepath)
        print(f"\nDang xu ly: {filename}")
        
        if process_excel_file(filepath):
            success_count += 1
        else:
            print(f"  Loi khi xu ly {filename}")
    
    print(f"\nHOAN THANH! Da xu ly {success_count}/{len(excel_files)} file")

if __name__ == "__main__":
    main()
