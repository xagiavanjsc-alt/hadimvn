"""
Upload Phan_005.md len Supabase, bat dau tu ID 1
Slug = phien am tieng Han (SEO-friendly)
Chay: python upload_phan005.py
"""
import re
import logging
import requests
import os

# ================== CAU HINH ==================
FILE_INPUT = os.path.join(os.path.dirname(__file__), "Phan_005.md")
SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"
START_ID = 1

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ================== HANGUL -> BOI (CHO SLUG) ==================
CHOSEONG_MAP = {
    'ㄱ': 'g', 'ㄲ': 'kk', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄸ': 'tt',
    'ㄹ': 'r', 'ㅁ': 'm', 'ㅂ': 'b', 'ㅃ': 'pp', 'ㅅ': 's',
    'ㅆ': 'ss', 'ㅇ': '', 'ㅈ': 'j', 'ㅉ': 'jj', 'ㅊ': 'ch',
    'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h'
}
JUNGSEONG_MAP = {
    'ㅏ': 'a', 'ㅐ': 'ae', 'ㅑ': 'ya', 'ㅒ': 'yae', 'ㅓ': 'eo',
    'ㅔ': 'e', 'ㅕ': 'yeo', 'ㅖ': 'ye', 'ㅗ': 'o', 'ㅘ': 'wa',
    'ㅙ': 'wae', 'ㅚ': 'oe', 'ㅛ': 'yo', 'ㅜ': 'u', 'ㅝ': 'wo',
    'ㅞ': 'we', 'ㅟ': 'wi', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅢ': 'ui', 'ㅣ': 'i'
}
JONGSEONG_MAP = {
    '': '', 'ㄱ': 'k', 'ㄲ': 'k', 'ㄳ': 'k', 'ㄴ': 'n', 'ㄵ': 'n',
    'ㄶ': 'n', 'ㄷ': 't', 'ㄹ': 'l', 'ㄺ': 'lk', 'ㄻ': 'lm',
    'ㄼ': 'l', 'ㄽ': 'l', 'ㄾ': 'l', 'ㄿ': 'lp', 'ㅀ': 'l',
    'ㅁ': 'm', 'ㅂ': 'p', 'ㅄ': 'p', 'ㅅ': 't', 'ㅆ': 't',
    'ㅇ': 'ng', 'ㅈ': 't', 'ㅊ': 't', 'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 't'
}
HANGUL_START = ord('가')

def decompose_hangul(char):
    code = ord(char) - HANGUL_START
    if code < 0 or code >= 11172:
        return None
    cho = code // 588
    jung = (code % 588) // 28
    jong = code % 28
    return cho, jung, jong

def hangul_to_boi_single(char):
    if not (HANGUL_START <= ord(char) <= ord('힣')):
        return char
    cho_idx, jung_idx, jong_idx = decompose_hangul(char)
    cho_char = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'][cho_idx]
    jung_char = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'][jung_idx]
    jong_char = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'][jong_idx]
    boi = CHOSEONG_MAP[cho_char] + JUNGSEONG_MAP[jung_char]
    if jong_char:
        boi += JONGSEONG_MAP[jong_char]
    return boi

def word_to_slug(word):
    """Chuyen tu tieng Han thanh slug SEO-friendly"""
    boi_chars = [hangul_to_boi_single(ch) for ch in word]
    # Ghep lai voi dau - giua cac am tiet (syllable)
    # Don gian: cuoi moi am tiet thi them dau -
    slug = '-'.join(boi_chars).lower()
    # Xoa dau - thua o dau/cuoi
    slug = slug.strip('-')
    return slug

# ================== EXTRACT FUNCTIONS ==================
def extract_slug(hangul):
    """Slug = phien am boi cua tu tieng Han"""
    return word_to_slug(hangul)

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
    # Tim cac khoi + Han: ... + Boi: ... + Viet: ...
    pattern = r'\+\s*H[aà]n:\s*(.+?)\n\+\s*B[ôồ]i:\s*(.+?)\n\s*\+\s*Vi[eệ]t:\s*(.+?)(?=\n\n|\n\+\s*H[aà]n|\Z)'
    matches = re.findall(pattern, raw, re.DOTALL)
    for han, boi, viet in matches:
        results.append({
            'han': han.strip(),
            'boi': boi.strip(),
            'viet': viet.strip()
        })
    return results

def extract_related(raw):
    results = []
    # Pattern: - Hangul (Hanja): meaning
    pattern = r'-\s*([가-힣]+)\s*\(([^)]+)\)\s*:\s*(.+?)(?=\n-|\n\n|\Z)'
    matches = re.findall(pattern, raw, re.DOTALL)
    for hangul, hanja, meaning in matches:
        results.append({
            'hangul': hangul.strip(),
            'hanja': hanja.strip(),
            'meaning': meaning.strip().rstrip('.')
        })
    return results

def extract_mnemonic(raw):
    m = re.search(r'M[ẸẸ]O NH[ỚO]\s*:?\s*(.+?)(?=\n\n|\Z)', raw, re.DOTALL | re.IGNORECASE)
    if m:
        text = m.group(1).strip()
        # Loai bo cac dong dau khong phai noi dung
        lines = [l for l in text.split('\n') if l.strip() and not l.strip().startswith('##')]
        if lines:
            return ' '.join(lines)
    return ''

def extract_breakdown(raw):
    m = re.search(r'G[ốo]c H[aá]n.*?ngh[iĩ]a l[aà].*?(\n|$)', raw)
    if m:
        return m.group(0).strip()
    return ''

def parse_md_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    entries = []
    sections = re.split(r'\n##\s+', content)
    
    for section in sections:
        section = section.strip()
        if not section:
            continue
        
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
        logger.info(f"Da doc {len(entries)} tu tu {FILE_INPUT}")
    except Exception as e:
        logger.error(f"Khong the doc file Markdown: {e}")
        return

    success_count = 0
    for idx, entry in enumerate(entries):
        id = START_ID + idx
        hangul = entry['hangul']
        hanja = entry['hanja']
        raw = entry['raw']
        
        slug = extract_slug(hangul)
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
            logger.info(f"Da upload: {hangul} ({id})")
        else:
            logger.error(f"Upload that bai: {hangul}")

    logger.info(f"\nHoan thanh! Da upload {success_count}/{len(entries)} tu")

if __name__ == "__main__":
    main()
