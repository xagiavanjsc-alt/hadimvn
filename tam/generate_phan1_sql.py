import pandas as pd
import re
import json
import logging

# ================== CẤU HÌNH ==================
FILE_INPUT = "../docs/Phan_1_fixed.xlsx"
FILE_OUTPUT = "phan_1.sql"
START_ID = 100

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ================== HÀM ESCAPE SQL ==================
def escape_sql(s):
    if not s:
        return ''
    return str(s).replace("'", "''")

# ================== EXTRACT SLUG ==================
def extract_slug(raw):
    m = re.search(r'\*\*([a-z][a-z-]+)\*\*', raw)
    return m.group(1) if m else ''

# ================== EXTRACT MEANING VN ==================
def extract_meaning_vn(raw):
    m = re.search(r'Ngh[iĩ]a ti[eế]ng Vi[eệ]t(?:\s+l[aà])?\s*[:"«]?\s*["\u201c\u201d\u201e]?([^"\u201c\u201d\u201e\n]+)', raw)
    if m:
        return m.group(1).strip().replace(/["\u201c\u201d\u201e,.']+$/, '').replace(/^["\u201c\u201d\u201e]+/, '')
    return ''

# ================== EXTRACT EXAMPLES ==================
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

# ================== EXTRACT RELATED WORDS ==================
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

# ================== EXTRACT MNEMONIC ==================
def extract_mnemonic(raw):
    m = re.search(r'4\.\s*M[EẸ]O\s*NH[OỚ]+[:\s]+([\s\S]+)', raw)
    return m.group(1).strip() if m else ''

# ================== EXTRACT BREAKDOWN ==================
def extract_breakdown(raw):
    results = []
    re_pattern = r'["\u201c\u201d\u201e]([가-힣]+)["\u201c\u201d\u201e]\s*\(([^\s\-)]+)\s*-\s*[^)]+\)\s*ngh[iĩ]a l[aà]\s*([^,;.\n"]+)'
    for m in re.finditer(re_pattern, raw):
        results.append({
            'char': m.group(2).strip(),
            'reading': m.group(1).strip(),
            'meaning': m.group(3).strip().replace(/["\u201c\u201d\u201e]+$/, '')
        })
    return results

# ================== MAIN ==================
def main():
    try:
        df = pd.read_excel(FILE_INPUT, engine='openpyxl')
        logger.info(f"Đã đọc {len(df)} dòng từ {FILE_INPUT}")
    except Exception as e:
        logger.error(f"Không thể đọc file Excel: {e}")
        return

    lines = []
    lines.append('-- ─── Hanja Pro: Phần 1 (' + str(len(df) - 1) + ' từ) ─────────────────────────────────')
    lines.append('-- Generated from docs/Phan_1_fixed.xlsx')
    lines.append('-- Phần 1: ' + str(len(df) - 1) + ' từ')
    lines.append('')

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

        line = f"""INSERT INTO public.hanja_pro (id,hangul,hanja,slug,meaning_vn,hanja_breakdown,examples,related_words,mnemonic,raw) VALUES
({id},'{escape_sql(hangul)}','{escape_sql(hanja)}','{escape_sql(slug)}','{escape_sql(meaning_vn)}','{escape_sql(json.dumps(breakdown))}','{escape_sql(json.dumps(examples))}','{escape_sql(json.dumps(related))}','{escape_sql(mnemonic)}','{escape_sql(raw)}')
ON CONFLICT (slug) DO UPDATE SET hangul=EXCLUDED.hangul,hanja=EXCLUDED.hanja,meaning_vn=EXCLUDED.meaning_vn,hanja_breakdown=EXCLUDED.hanja_breakdown::jsonb,examples=EXCLUDED.examples::jsonb,related_words=EXCLUDED.related_words::jsonb,mnemonic=EXCLUDED.mnemonic;"""
        lines.append(line)
        logger.info(f"Đã xử lý: {hangul} ({id})")

    lines.append("")
    lines.append(f"SELECT setval('hanja_pro_id_seq', GREATEST((SELECT MAX(id) FROM public.hanja_pro), {START_ID + len(df)}));")

    with open(FILE_OUTPUT, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    logger.info(f"✅ Đã tạo file {FILE_OUTPUT} với {len(df) - 1} từ")

if __name__ == "__main__":
    main()
