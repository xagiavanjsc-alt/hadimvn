"""
Chia new_words.md thanh cac file Excel 21 tu/file + dung Fireworks AI dich nghia tieng Viet
Format giong Hanja_Phan_1.xlsx (3 cot: Tiếng Hàn, Hán tự, Nghĩa tiếng Việt)
"""
import pandas as pd
import openai
import time
import re
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
OUTPUT_DIR = "fix/excel_output"
WORDS_PER_FILE = 21
MAX_RETRIES = 3
TIMEOUT = 120

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
        # Tim key chua fail
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
        """Reset danh sach key fail khi bat dau file moi"""
        self.failed_keys.clear()
        print("Da reset danh sach key fail")
    
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
                # Format: ## Hangul (Hanja)
                match = re.match(r'##\s+([가-힣]+)\s+\(([^)]+)\)', line)
                if match:
                    hangul = match.group(1).strip()
                    hanja = match.group(2).strip()
                    words.append({'hangul': hangul, 'hanja': hanja, 'meaning': ''})
    print(f"Da doc {len(words)} tu tu {INPUT_FILE}")
    return words

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
            resp = client.chat.completions.create(
                model="accounts/fireworks/models/deepseek-v3p2",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                timeout=TIMEOUT
            )
            meaning = resp.choices[0].message.content.strip()
            # Xoa cac ky tu khong can thiet
            meaning = re.sub(r'^[-:]\s*', '', meaning)
            meaning = meaning.split('\n')[0].strip()
            return meaning
        except Exception as e:
            print(f"Loi API khi dich {hangul}: {e}, lan {attempt+1}")
            time.sleep(3*(attempt+1))
            # Xoay key khi gap bat ky loi nao (rate limit, timeout, etc)
            key_rotator.rotate()
            client = key_rotator.get_client()
    
    print(f"Bo qua {hangul} sau {MAX_RETRIES} lan")
    return ""

# ================== CHIA FILE VA DICH ==================
def split_and_translate(words):
    """Chia thanh cac file 21 tu/file va dich nghia"""
    import os
    
    # Tao thu muc output neu chua co
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    total_files = (len(words) + WORDS_PER_FILE - 1) // WORDS_PER_FILE
    print(f"Sẽ tạo {total_files} file Excel")
    
    for i in range(total_files):
        start_idx = i * WORDS_PER_FILE
        end_idx = min(start_idx + WORDS_PER_FILE, len(words))
        chunk = words[start_idx:end_idx]
        
        print(f"\nDang xu ly file {i+1}/{total_files} ({len(chunk)} tu)...")
        
        # Reset key fail khi bat dau file moi
        key_rotator.reset_failed()
        
        # Dich nghia cho tung từ
        for idx, word in enumerate(chunk):
            hangul = word['hangul']
            hanja = word['hanja']
            print(f"  [{idx+1}/{len(chunk)}] Dich {hangul}...", end=' ')
            meaning = translate_meaning(hangul, hanja)
            word['meaning'] = meaning
            print(f"OK: {meaning}")
            time.sleep(0.5)  # Delay de tranh rate limit
        
        # Tao DataFrame
        df = pd.DataFrame(chunk)
        df.columns = ['Tiếng Hàn', 'Hán tự', 'Nghĩa tiếng Việt']
        
        # Luu file Excel
        output_file = os.path.join(OUTPUT_DIR, f"Hanja_Phan_{130+i}.xlsx")
        df.to_excel(output_file, index=False, engine='openpyxl')
        print(f"Da luu file: {output_file}")
    
    print(f"\nHOAN THANH! Da tao {total_files} file Excel trong {OUTPUT_DIR}")

# ================== MAIN ==================
def main():
    print("Bat dau xu ly...")
    words = read_new_words()
    if not words:
        print("Khong co tu nao de xu ly.")
        return
    
    split_and_translate(words)

if __name__ == "__main__":
    main()
