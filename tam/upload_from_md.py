import re
import logging
import requests
import os

# ================== CẤU HÌNH ==================
FILE_INPUT = os.path.join(os.path.dirname(__file__), "Phan_003.md")
SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"
START_ID = 142

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
    sec_match = re.search(r'3\.\s*\d+\s*TỪ LIÊN QUAN GỐC HÁN[:\s]+([\s\S]+?)(?=\n\s*4\.)', raw)
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

def parse_md_file(filepath):
    """Parse Markdown file and extract vocabulary entries"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by ## headers (each word section)
    sections = re.split(r'\n##\s+', content)
    
    entries = []
    
    for section in sections:
        section = section.strip()
        if not section:
            continue
        
        # Extract Hangul and Hanja from header (e.g., "가결 (可결)" or "## 가결 (可決)")
        header_match = re.search(r'##\s*([가-힣]+)\s*\(([^)]+)\)', section)
        if not header_match:
            header_match = re.search(r'^([가-힣]+)\s*\(([^)]+)\)', section)
        if not header_match:
            continue
        
        hangul = header_match.group(1).strip()
        hanja = header_match.group(2).strip()
        raw = section
        
        entries.append({
            'hangul': hangul,
            'hanja': hanja,
            'raw': raw
        })
    
    return entries

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
        entries = parse_md_file(FILE_INPUT)
        logger.info(f"Đã đọc {len(entries)} từ từ {FILE_INPUT}")
    except Exception as e:
        logger.error(f"Không thể đọc file Markdown: {e}")
        return

    success_count = 0
    for idx, entry in enumerate(entries):
        id = START_ID + idx
        hangul = entry['hangul']
        hanja = entry['hanja']
        raw = entry['raw']
        
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

    logger.info(f"\n🎉 Hoàn thành! Đã upload {success_count}/{len(entries)} từ")

if __name__ == "__main__":
    main()
