"""
Upload Phan_114.md len Supabase, bat dau tu ID 2370
Slug = phien am tieng Han (SEO-friendly)
Chay: python upload_phan114.py
"""
import re
import logging
import requests
import os

# ================== CAU HINH ==================
FILE_INPUT = os.path.join(os.path.dirname(__file__), "fix", "Phan_114.md")
SUPABASE_URL = "https://dcjofhkdrgbrowabudyt.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjam9maGtkcmdicm93YWJ1ZHl0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjE1OTczNiwiZXhwIjoyMDkxNzM1NzM2fQ.T1_WxXzgB0LhFxcOvlqLyt_83rMOgmaQIuUO_4stPOE"
START_ID = 2370

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
    slug = '-'.join(boi_chars).lower()
    slug = slug.strip('-')
    return slug

# ================== EXTRACT FUNCTIONS ==================
def extract_slug(hangul):
    """Slug = phien am boi cua tu tieng Han"""
    return word_to_slug(hangul)

def capitalize_first(s):
    """Viet hoa chu cai dau tien"""
    if not s:
        return s
    return s[0].upper() + s[1:]

def extract_meaning_vn(raw):
    m = re.search(r'1\.\s*GIẢI NGHĨA\s*:\s*(.+?)(?:\n|$)', raw)
    if m:
        line = m.group(1).strip()
        quote = re.search(r'["\u201c\u201d]([^"\u201c\u201d]+)["\u201d]', line)
        if quote:
            return capitalize_first(quote.group(1).strip())
        dot = re.split(r'[.!?]\s+', line)
        if dot:
            return capitalize_first(dot[0].strip())
        return capitalize_first(line)
    return ''

def extract_examples(raw):
    results = []
    lines = raw.split('\n')
    i = 0
    while i < len(lines) - 2:
        m1 = re.match(r'^\+\s*H[aà]n:\s*(.+)', lines[i])
        if m1:
            han = m1.group(1).strip()
            m2 = re.match(r'^\+\s*B[ôồ]i:\s*(.+)', lines[i+1]) if i+1 < len(lines) else None
            if m2:
                boi = m2.group(1).strip()
                m3 = re.match(r'^\s+\+\s*Vi[eệ]t:\s*(.+)', lines[i+2]) if i+2 < len(lines) else None
                if m3:
                    viet = m3.group(1).strip()
                    results.append({
                        'ko': han,
                        'boi': boi,
                        'vi': viet
                    })
                    i += 3
                    continue
        i += 1
    return results

def extract_related(raw):
    results = []
    lines = raw.split('\n')
    for line in lines:
        m = re.match(r'^\s+-\s+([가-힣]+)\s*\(([^)]+)\)\s*:\s*(.+)', line)
        if m:
            results.append({
                'word': m.group(1).strip(),
                'hanja': m.group(2).strip(),
                'meaning': m.group(3).strip().rstrip('.')
            })
    return results

def extract_mnemonic(raw):
    m = re.search(r'M[ẸẸ]O NH[ỚO]\s*:?\s*(.+?)(?=\n\n|\Z)', raw, re.DOTALL | re.IGNORECASE)
    if m:
        text = m.group(1).strip()
        lines = [l for l in text.split('\n') if l.strip() and not l.strip().startswith('##')]
        if lines:
            return ' '.join(lines)
    return ''

def extract_breakdown(raw, hanja):
    STOP_WORDS = {'là', 'và', 'chỉ', 'có', 'nghĩa', 'nghia', 'gốc', 'hán', 'sự'}
    char_meaning = {}

    for m in re.finditer(r'["\u201c]([\u4e00-\u9fff\u3400-\u4dbf])["\u201d]\s*\(([^)]+)\)', raw):
        char_found = m.group(1)
        meaning_word = m.group(2).strip()
        if char_found not in char_meaning:
            char_meaning[char_found] = capitalize_first(meaning_word)

    for m in re.finditer(r'["\u201c]([\u4e00-\u9fff\u3400-\u4dbf])["\u201d]\s*nghĩa\s+là\s*["\u201c]([^"\u201c\u201d]+)["\u201d]', raw):
        char_found = m.group(1)
        meaning_word = m.group(2).strip().split(',')[0].strip()
        if char_found not in char_meaning:
            char_meaning[char_found] = capitalize_first(meaning_word)

    for m in re.finditer(r'([a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]+(?:\s+[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]+){0,2})\s*\(([\u4e00-\u9fff\u3400-\u4dbf])\)', raw):
        words = m.group(1).strip().split()
        char_found = m.group(2)
        while words and words[0].lower() in STOP_WORDS:
            words.pop(0)
        if words and char_found not in char_meaning:
            char_meaning[char_found] = capitalize_first(' '.join(words))

    meaning_vn = ''
    m_vn = re.search(r'1\.\s*GIẢI NGHĨA\s*:\s*(.+?)(?:\n|$)', raw)
    if m_vn:
        line = m_vn.group(1).strip()
        quote = re.search(r'["\u201c\u201d]([^"\u201c\u201d]+)["\u201d]', line)
        if quote:
            meaning_vn = quote.group(1).strip()

    hanja_chars = [ch for ch in hanja if '\u4e00' <= ch <= '\u9fff' or '\u3400' <= ch <= '\u4dbf']

    missing = [ch for ch in hanja_chars if ch not in char_meaning]
    if missing:
        m_goc = re.search(r'nghĩa\s+là\s+(.+?)(?:\.\s|,\s*chỉ|$)', raw)
        if m_goc:
            goc_text = m_goc.group(1).strip()
            goc_text = re.sub(r'["\u201c\u201d][^\u201c\u201d"]*["\u201c\u201d]', '', goc_text)
            parts = re.split(r'\s+và\s+|,\s+', goc_text)
            parts = [p.strip() for p in parts if p.strip() and len(p.strip()) < 30]
            if len(parts) < len(missing) and len(parts) == 1:
                words = parts[0].split()
                if len(words) >= len(missing):
                    parts = words
            if len(parts) >= len(missing):
                for i, ch in enumerate(missing):
                    if i < len(parts):
                        char_meaning[ch] = capitalize_first(parts[i])

    missing = [ch for ch in hanja_chars if ch not in char_meaning]
    if missing and meaning_vn:
        parts = re.split(r',\s*', meaning_vn)
        if len(parts) >= len(missing):
            for i, ch in enumerate(missing):
                if i < len(parts):
                    char_meaning[ch] = capitalize_first(parts[i].strip())

    breakdown = []
    for ch in hanja_chars:
        meaning = char_meaning.get(ch, '')
        breakdown.append({
            'char': ch,
            'meaning': meaning,
            'reading': ''
        })
    return breakdown

def parse_md_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    entries = []
    sections = re.split(r'(?:^|\n)##\s+', content)
    
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
        breakdown = extract_breakdown(raw, hanja)

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
