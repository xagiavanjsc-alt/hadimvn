"""
Phan loai tu moi vao hanja-tree bang AI
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
INPUT_FILE = "fix/new_words.md"
OUTPUT_FILE = "fix/classified_words.xlsx"
MAX_RETRIES = 3
TIMEOUT = 120

# Danh sach cac nhom trong hanja-tree (can cap nhat theo thuc te)
CATEGORIES = [
    "Gia đình",
    "Giáo dục",
    "Kinh tế",
    "Y tế/Sức khỏe",
    "Thời gian/Tuổi",
    "Địa điểm/Hướng",
    "Màu sắc/Hình dáng",
    "Cảm xúc/Tâm lý",
    "Hành động/Chuyển động",
    "Kết nối/Quan hệ",
    "Số lượng/Đo lường",
    "Tự nhiên/Môi trường",
    "Công nghệ/Thiết bị",
    "Thức ăn/Uống",
    "Quần áo/Trang phục",
    "Giao thông/Vận tải",
    "Xã hội/Văn hóa",
    "Khác"
]

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
    
    def get_client(self):
        return self.client

key_rotator = KeyRotator(API_KEYS)
client = key_rotator.get_client()

# ================== DOC NEW_WORDS.MD ==================
def read_new_words():
    """Doc file new_words.md, tra ve danh sach (hangul, hanja)"""
    words = []
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('##'):
                match = re.match(r'##\s+([가-힣0-9]+)\s+\(([^)]+)\)', line)
                if match:
                    hangul = match.group(1).strip()
                    hanja = match.group(2).strip()
                    words.append({'hangul': hangul, 'hanja': hanja, 'category': ''})
    print(f"Da doc {len(words)} tu tu {INPUT_FILE}")
    return words

# ================== PHAN LOAI BANG AI ==================
def classify_word(hangul, hanja):
    """Dung AI de phan loai tu vao nhom"""
    global client, key_rotator
    
    categories_str = ", ".join(CATEGORIES)
    
    prompt = f"""Phan loai tu tieng Han vao 1 trong cac nhom sau: {categories_str}

Tu: {hangul} (Han tu: {hanja})

YEU CAU:
- Chi tra ve ten nhom (khong giai thich)
- Chon nhom phu hop nhat
- Neu khong phu hop bat ky nhom, tra ve "Khac"

Vi du:
- 가족 (家族): Gia đình
- 학교 (學校): Giáo dục
- 병원 (病院): Y tế/Sức khỏe

Phan loai cho {hangul} ({hanja}):"""
    
    for attempt in range(MAX_RETRIES):
        try:
            resp = client.chat.completions.create(
                model="accounts/fireworks/models/deepseek-v3p2",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                timeout=TIMEOUT
            )
            category = resp.choices[0].message.content.strip()
            # Xoa cac ky tu khong can thiet
            category = re.sub(r'^[-:]\s*', '', category)
            category = category.split('\n')[0].strip()
            return category
        except Exception as e:
            print(f"  Loi API: {e}, lan {attempt+1}")
            time.sleep(3*(attempt+1))
            key_rotator.rotate()
            client = key_rotator.get_client()
    
    print(f"  Bo qua sau {MAX_RETRIES} lan")
    return "Khac"

# ================== PHAN LOAI TAT CA TU ==================
def classify_all_words(words):
    """Phan loai tat ca tu, ho tiep tu cho da phan loai"""
    
    # Kiem tra file output da ton tai chua
    classified_words = []
    if os.path.exists(OUTPUT_FILE):
        try:
            df_existing = pd.read_excel(OUTPUT_FILE, engine='openpyxl')
            classified_words = df_existing.to_dict('records')
            print(f"Da tim thay {len(classified_words)} tu da phan loai trong {OUTPUT_FILE}")
        except Exception as e:
            print(f"Khong the doc file output cu: {e}")
    
    # Tim cac tu chua phan loai
    existing_hangul = {w['Tiếng Hàn'] for w in classified_words}
    words_to_classify = [w for w in words if w['hangul'] not in existing_hangul]
    
    print(f"Can phan loai: {len(words_to_classify)} tu (tong {len(words)} tu)")
    print(f"Cac nhom: {', '.join(CATEGORIES)}")
    
    if len(words_to_classify) == 0:
        print("Tat ca tu da duoc phan loai!")
        return classified_words
    
    # Phan loai cac tu chua co
    for idx, word in enumerate(words_to_classify):
        hangul = word['hangul']
        hanja = word['hanja']
        
        print(f"[{idx+1}/{len(words_to_classify)}] Phan loai {hangul}...", end=' ', flush=True)
        category = classify_word(hangul, hanja)
        word['category'] = category
        print(f"-> {category}", flush=True)
        time.sleep(0.5)
    
    # Gop ket qua
    all_words = classified_words + words_to_classify
    return all_words

# ================== LUU KET QUA ==================
def save_to_excel(words):
    """Luu ket qua vao file Excel"""
    df = pd.DataFrame(words)
    df.columns = ['Tiếng Hàn', 'Hán tự', 'Nhóm']
    
    # Sort theo nhom
    df = df.sort_values('Nhóm')
    
    df.to_excel(OUTPUT_FILE, index=False, engine='openpyxl')
    print(f"\nDa luu ket qua: {OUTPUT_FILE}")
    
    # In thong ke
    print("\nThong ke theo nhom:")
    print(df['Nhóm'].value_counts())

# ================== MAIN ==================
def main():
    print("Bat dau phan loai tu vao hanja-tree...")
    
    words = read_new_words()
    if not words:
        print("Khong co tu nao de xu ly.")
        return
    
    words = classify_all_words(words)
    save_to_excel(words)
    
    print("\nHOAN THANH!")

if __name__ == "__main__":
    main()
