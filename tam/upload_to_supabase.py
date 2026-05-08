import pandas as pd
import re
import json
import logging
import requests

# ================== CẤU HÌNH ==================
import os
FILE_INPUT = os.path.join(os.path.dirname(__file__), "Phan_1.xlsx")
SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"
START_ID = 100

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ================== EXTRACT FUNCTIONS ==================
def extract_slug(raw):
    m = re.search(r'\*\*([a-z][a-z-]+)\*\*', raw)
    return m.group(1) if m else ''

def extract_meaning_vn(raw):
    m = re.search(r'Ngh[iĩ]a ti[eế]ng Vi[eệ]t(?:\s+l[aà])?\s*[:"«]?\s*["\u201c\u201d\u201e]?([^"\u201c\u201d\u201e\n]+)', raw)
    if m:
        result = m.group(1).strip()
        result = re.sub(r'["\u201c\u201d\u201e,.\'"]+$', '', result)
        result = re.sub(r'^["\u201c\u201d\u201e\']+', '', result)
        return result
    return ''

def extract_examples(raw):
    results = []
    re_pattern = r'[+•]\s*H[aà]n:\s*([^\n]+)\n[+•]\s*B[oồ]i:\s*([^\n]+)\n\s*[+•]\s*Vi[eệ]t:\s*([^\n]+)'
    for m in re.finditer(re_pattern, raw):
        results.append({
            'ko': m.group(1).strip().replace('**', ''),
            'boi': m.group(2).strip().replace('**', ''),
            'vi': m.group(3).strip()
        })
    return results

def extract_related(raw):
    results = []
    sec_match = re.search(r'3\.\s*3 T[ƯU]\u0300 LI[EÊ][N]\s*QUAN[\s\S]+?\n([\s\S]+?)(?=\n\s*4\.)', raw)
    if sec_match:
        re_pattern = r'-\s*(\S+)\s*\(([^)]+)\)\s*:\s*(.+)'
        for m in re.finditer(re_pattern, sec_match.group(1)):
            results.append({
                'word': m.group(1).strip(),
                'hanja': m.group(2).strip(),
                'meaning': m.group(3).strip()
            })
    return results

def extract_mnemonic(raw):
    m = re.search(r'4\.\s*M[EẸ]O\s*NH[OỚ]+[:\s]+([\s\S]+)', raw)
    return m.group(1).strip() if m else ''

def extract_breakdown(raw):
    results = []
    re_pattern = r'["\u201c\u201d\u201e]([가-힣]+)["\u201c\u201d\u201e]\s*\(([^\s\-)]+)\s*-\s*[^)]+\)\s*ngh[iĩ]a l[aà]\s*([^,;.\n"]+)'
    for m in re.finditer(re_pattern, raw):
        meaning = m.group(3).strip()
        meaning = re.sub(r'["\u201c\u201d\u201e\']+$', '', meaning)
        results.append({
            'char': m.group(2).strip(),
            'reading': m.group(1).strip(),
            'meaning': meaning
        })
    return results

# ================== UPLOAD TO SUPABASE ==================
def upload_to_supabase(data):
    url = f"{SUPABASE_URL}/rest/v1/hanja_pro"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates'
    }
    
    response = requests.post(url, json=data, headers=headers)
    if response.status_code in [200, 201, 204]:
        return True
    else:
        logger.error(f"Upload failed: {response.status_code} - {response.text}")
        return False

# ================== MAIN ==================
def main():
    try:
        df = pd.read_excel(FILE_INPUT, engine='openpyxl')
        logger.info(f"Đã đọc {len(df)} dòng từ {FILE_INPUT}")
    except Exception as e:
        logger.error(f"Không thể đọc file Excel: {e}")
        return

    success_count = 0
    for idx, row in df.iterrows():
        if idx == 0:  # Skip header
            continue

        hangul = str(row.iloc[0]).strip() if pd.notna(row.iloc[0]) else ''
        hanja = str(row.iloc[1]).strip() if pd.notna(row.iloc[1]) else ''
        raw = str(row.iloc[2]).strip() if pd.notna(row.iloc[2]) else ''

        if not hangul or not hanja:
            logger.warning(f"Bỏ qua dòng {idx}: thiếu hangul hoặc hanja")
            continue

        id = START_ID + (idx - 1)
        slug = extract_slug(raw) or hangul
        meaning_vn = extract_meaning_vn(raw)
        examples = extract_examples(raw)
        related = extract_related(raw)
        mnemonic = extract_mnemonic(raw)
        breakdown = extract_breakdown(raw)

        data = {
            'id': id,
            'hangul': hangul,
            'hanja': hanja,
            'slug': slug,
            'meaning_vn': meaning_vn,
            'hanja_breakdown': breakdown,
            'examples': examples,
            'related_words': related,
            'mnemonic': mnemonic,
            'raw': raw
        }

        if upload_to_supabase(data):
            success_count += 1
            logger.info(f"✅ Đã upload: {hangul} ({id})")
        else:
            logger.error(f"❌ Upload thất bại: {hangul}")

    logger.info(f"\n🎉 Hoàn thành! Đã upload {success_count}/{len(df)-1} từ")

if __name__ == "__main__":
    # Cập nhật URL và KEY trước khi chạy
    logger.warning("⚠️ Hãy cập nhật SUPABASE_URL và SUPABASE_KEY trong code trước khi chạy!")
    main()
