"""
Chia new_words.md thanh cac file Excel 21 tu/file (KHONG dich nghia)
Format giong Hanja_Phan_1.xlsx (3 cot: Tiếng Hàn, Hán tự, Nghĩa tiếng Việt - de trong)
"""
import pandas as pd
import re
import os

# ================== CAU HINH ==================
INPUT_FILE = "fix/new_words.md"
OUTPUT_DIR = "fix/excel_output"
WORDS_PER_FILE = 21

# ================== DOC NEW_WORDS.MD ==================
def read_new_words():
    """Doc file new_words.md, tra ve danh sach (hangul, hanja)"""
    words = []
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line.startswith('##'):
                # Format: ## Hangul (Hanja) - cho phep so trong hangul
                match = re.match(r'##\s+([가-힣0-9]+)\s+\(([^)]+)\)', line)
                if match:
                    hangul = match.group(1).strip()
                    hanja = match.group(2).strip()
                    words.append({'hangul': hangul, 'hanja': hanja, 'meaning': ''})
    print(f"Da doc {len(words)} tu tu {INPUT_FILE}")
    return words

# ================== CHIA FILE ==================
def split_to_excel(words):
    """Chia thanh cac file 21 tu/file"""
    
    # Tao thu muc output neu chua co
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    total_files = (len(words) + WORDS_PER_FILE - 1) // WORDS_PER_FILE
    print(f"Sẽ tạo {total_files} file Excel")
    
    for i in range(total_files):
        start_idx = i * WORDS_PER_FILE
        end_idx = min(start_idx + WORDS_PER_FILE, len(words))
        chunk = words[start_idx:end_idx]
        
        print(f"Dang xu ly file {i+1}/{total_files} ({len(chunk)} tu)...")
        
        # Tao DataFrame
        df = pd.DataFrame(chunk)
        df.columns = ['Tiếng Hàn', 'Hán tự', 'Nghĩa tiếng Việt']
        
        # Luu file Excel
        output_file = os.path.join(OUTPUT_DIR, f"Hanja_Phan_{130+i}.xlsx")
        df.to_excel(output_file, index=False, engine='openpyxl')
        print(f"  Da luu file: {output_file}")
    
    print(f"\nHOAN THANH! Da tao {total_files} file Excel trong {OUTPUT_DIR}")

# ================== MAIN ==================
def main():
    print("Bat dau xu ly...")
    words = read_new_words()
    if not words:
        print("Khong co tu nao de xu ly.")
        return
    
    split_to_excel(words)

if __name__ == "__main__":
    main()
