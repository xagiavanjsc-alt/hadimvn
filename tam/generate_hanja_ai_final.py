"""
Script sinh nội dung Hanja từ Excel, dùng Fireworks AI (DeepSeek v3p2)
Output Markdown chuan format - CO KIEM TRA TU DONG + SINH BOI

Cach dung:
1. Dat file Excel vao cung thu muc (cot: Tiếng Hàn, Hán tự, Nghĩa tiếng Việt)
2. Sua FILE_INPUT va FILE_OUTPUT ben duoi
3. Chay: python generate_hanja_ai_final.py
4. Sau khi xong kiem tra: python validate_md.py Phan_XXX.md
"""

import pandas as pd
import openai
import time
import re
import os
import logging
from itertools import cycle

# ================== CAU HINH ==================
API_KEYS = [
    "fw_KgtZjpQh394ENKs71R92TF",
    "fw_9QTsRMtMkyp62793nEHMAP",
    "fw_E2XaDgqMW8K2Y1k9DuiHKh",
    "fw_7aXZ7xrDjeiNipNuQEo7QD",
    "fw_MzNjKUP9N6TvDoZ4tNFxHH",
]
FILE_INPUT = "Hanja_Phan_5.xlsx"   # <-- SUA TEN FILE EXCEL CUA BAN
FILE_OUTPUT = "Phan_007.md"        # <-- SUA TEN FILE OUTPUT
MAX_RETRIES = 5
TIMEOUT = 120
DELAY_BETWEEN_WORDS = 0.5

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ================== XOAY VONG API KEY ==================
class KeyRotator:
    def __init__(self, keys):
        if not keys:
            raise ValueError("API_KEYS khong duoc rong")
        self.keys = keys
        self.cycle = cycle(keys)
        self.current_key = next(self.cycle)
        self.client = openai.OpenAI(
            base_url="https://api.fireworks.ai/inference/v1",
            api_key=self.current_key,
            timeout=TIMEOUT
        )
    def rotate(self):
        self.current_key = next(self.cycle)
        self.client = openai.OpenAI(
            base_url="https://api.fireworks.ai/inference/v1",
            api_key=self.current_key,
            timeout=TIMEOUT
        )
        logger.info(f"Da chuyen API key: {self.current_key[:10]}...")
    def get_client(self):
        return self.client

key_rotator = KeyRotator(API_KEYS)
client = key_rotator.get_client()

# ================== HANGUL -> BOI ==================
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
HANGUL_END = ord('힣')

def decompose_hangul(char):
    code = ord(char) - HANGUL_START
    if code < 0 or code >= (HANGUL_END - HANGUL_START + 1):
        return None
    cho = code // 588
    jung = (code % 588) // 28
    jong = code % 28
    return cho, jung, jong

def hangul_to_boi_single(char):
    if not (HANGUL_START <= ord(char) <= HANGUL_END):
        return char
    cho_idx, jung_idx, jong_idx = decompose_hangul(char)
    cho_char = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'][cho_idx]
    jung_char = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'][jung_idx]
    jong_char = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'][jong_idx]
    boi = CHOSEONG_MAP[cho_char] + JUNGSEONG_MAP[jung_char]
    if jong_char:
        boi += JONGSEONG_MAP[jong_char]
    return boi

def sentence_to_boi(sentence):
    sentence = re.sub(r'[.!?;:"]+$', '', sentence)
    words = re.split(r'(\s+)', sentence)
    result = []
    for word in words:
        if word.strip():
            boi_chars = [hangul_to_boi_single(ch) for ch in word]
            merged = []
            for i, bc in enumerate(boi_chars):
                merged.append(bc)
                if i < len(word)-1 and hangul_to_boi_single(word[i]) != word[i] and hangul_to_boi_single(word[i+1]) != word[i+1]:
                    merged.append('-')
            result.append(''.join(merged))
        else:
            result.append(word)
    return ''.join(result)

# ================== KIEM TRA FORMAT ==================
def validate_ai_output(content, tu):
    """Kiem tra output AI co dung format khong. Tra ve (ok, errors)"""
    errors = []
    if not content or not isinstance(content, str):
        return False, ["Content rong"]

    # 1. Du 4 phan
    if "1. GIẢI NGHĨA" not in content and "GIẢI NGHĨA" not in content:
        errors.append("Thieu GIAI NGHIA")
    if "VÍ DỤ" not in content:
        errors.append("Thieu VI DU")
    if "TỪ LIÊN QUAN" not in content:
        errors.append("Thieu TU LIEN QUAN")
    if "MẸO NHỚ" not in content:
        errors.append("Thieu MEO NHO")

    # 2. Dung 6 vi du
    han_count = len(re.findall(r'^\+ Hàn:', content, re.MULTILINE))
    boi_count = len(re.findall(r'^\+ Bồi:', content, re.MULTILINE))
    viet_count = len(re.findall(r'^\s+\+ Việt:', content, re.MULTILINE))

    if han_count != 6:
        errors.append(f"Vi du Han: {han_count}/6")
    if boi_count != 6:
        errors.append(f"Vi du Boi: {boi_count}/6")
    if viet_count != 6:
        errors.append(f"Vi du Viet: {viet_count}/6")

    # 3. Dung 4 tu lien quan
    related = re.findall(r'^\s+-\s+[가-힣]+\s+\([^)]+\):', content, re.MULTILINE)
    if len(related) != 4:
        errors.append(f"Tu lien quan: {len(related)}/4")

    # 4. Khong co ** trong nghia Viet
    viet_lines = re.findall(r'^\s+\+ Việt:\s*(.+)', content, re.MULTILINE)
    for line in viet_lines:
        if '**' in line:
            errors.append("Co ** trong dong Viet")
            break

    # 5. Khong co boi trong tu lien quan
    for r_line in related:
        m = re.match(r'\s+-\s+[가-힣]+\s+\(([^)]+)\):', r_line)
        if m:
            hanja = m.group(1)
            if re.search(r'[-,]\s*[A-Za-z]', hanja):
                errors.append(f"Co phien am trong tu lien quan: {hanja}")
                break

    # 6. Khong co DONE hay ---
    if 'DONE' in content.upper():
        errors.append("Co dong DONE")
    if '---' in content:
        errors.append("Co dong ---")

    # 7. Khong co dong Boi thu 2 (indented)
    extra_boi = re.findall(r'^\s+\+ Bồi:', content, re.MULTILINE)
    if len(extra_boi) > 0:
        errors.append(f"Co {len(extra_boi)} dong Boi thua")

    # 8. Khong viet hoa giua cau tieng Viet
    for vl in viet_lines:
        rest = vl.lstrip()
        if len(rest) > 1:
            for j, ch in enumerate(rest[1:], 1):
                if ch.isupper() and ch.isalpha():
                    errors.append(f"Viet hoa giua cau: ...{rest[max(0,j-5):j+5]}")
                    break

    return len(errors) == 0, errors

# ================== SUA LOI TU DONG ==================
def auto_fix_content(content, tu):
    if not content or not isinstance(content, str):
        return content

    # 1. Xoa dong DONE
    content = re.sub(r'(?i)done(_hadim)?\s*\n?', '', content)

    # 2. Xoa ---
    content = content.replace('---', '')

    # 3. Xoa ** trong nghia Viet (giu lai trong Han)
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        if re.match(r'^\s+\+ Việt:', line):
            line = line.replace('**', '')
        new_lines.append(line)
    content = '\n'.join(new_lines)

    # 4. Xoa dong Boi thu 2 (indented)
    content = re.sub(r'\n\s+\+ Bồi:.*?\n', '\n', content)

    # 5. Sua format tu lien quan tu so thu tu sang dau -
    content = re.sub(r'^(\s*)\d+\.\s+([가-힣]+\s+\([^)]+\):\s*.+)$', r'\1- \2', content, flags=re.MULTILINE)

    # 6. Xoa phien am boi trong tu lien quan
    def clean_related(match):
        prefix = match.group(1)
        hanja_part = match.group(2)
        suffix = match.group(3)
        hanja_clean = re.sub(r'\s*[-,]\s*[A-Za-z\'\s-]+$', '', hanja_part)
        hanja_clean = re.sub(r'\s*,\s*[ㄱ-ㅎㅏ-ㅣ가-힣]+$', '', hanja_clean)
        return prefix + hanja_clean + suffix

    content = re.sub(r'(\s+-\s+[가-힣]+\s+\()([^)]+)(\):\s*.+)', clean_related, content, flags=re.MULTILINE)

    # 7. Sua chinh ta
    content = re.sub(r'\bnghiã\b', 'nghĩa', content)
    content = re.sub(r'\bnưã\b', 'nữa', content)
    content = re.sub(r'\bgiưã\b', 'giữa', content)
    content = re.sub(r'\bmôĩ\b', 'mỗi', content)
    content = content.replace('cung~', 'cũng')

    return content.strip()

# ================== THEM BOI VA IN DAM ==================
def insert_boi_and_bold(content, tu):
    keyword_boi = sentence_to_boi(tu)
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        if re.match(r'^\s*\+ Hàn:', line):
            han_sentence = re.sub(r'^\s*\+ Hàn:\s*', '', line).strip()
            han_bolded = re.sub(rf'({re.escape(tu)})', r'**\1**', han_sentence, flags=re.IGNORECASE)
            boi = sentence_to_boi(han_sentence)
            if keyword_boi:
                boi = re.sub(rf'({re.escape(keyword_boi)})', r'**\1**', boi, flags=re.IGNORECASE)
            new_lines.append(f"+ Hàn: {han_bolded}")
            new_lines.append(f"+ Bồi: {boi}")
        elif re.match(r'^\s*\+ Việt:', line):
            new_lines.append(line)
        else:
            new_lines.append(line)
    return '\n'.join(new_lines)

# ================== PROMPT CHUAN ==================
def build_prompt(tu, han, nghia):
    return f'''Tạo nội dung ebook cho từ "{tu}" (Hán tự: {han}, nghĩa: {nghia}).

YÊU CẦU TUYỆT ĐỐI:

1. GIẢI NGHĨA: Nghĩa tiếng Việt là "...". Gốc Hán: "..." nghĩa là ...; "..." nghĩa là ...

2. 6 VÍ DỤ THỰC CHIẾN:
Mỗi ví dụ viết trên 3 dòng:
+ Hàn: [câu tiếng Hàn]
+ Bồi: [phiên âm tiếng Hàn]
   + Việt: [dịch tiếng Việt]
(Lặp lại đủ 6 ví dụ)

3. 4 TỪ LIÊN QUAN GỐC HÁN:
   - [Từ Hàn] ([Hán tự]): [Nghĩa tiếng Việt].
   - [Từ 2] ([Hán tự 2]): [Nghĩa 2].
   - [Từ 3] ([Hán tự 3]): [Nghĩa 3].
   - [Từ 4] ([Hán tự 4]): [Nghĩa 4].

4. MẸO NHỚ: Mẹo ghi nhớ thú vị.

CẤM: DONE, ---, ** trong nghĩa, viết hoa giữa câu.
'''

# ================== GOI API ==================
def _call_api(prompt, temp=0.05):
    global client, key_rotator
    try:
        resp = client.chat.completions.create(
            model="accounts/fireworks/models/deepseek-v3p2",
            messages=[{"role": "user", "content": prompt}],
            temperature=temp,
            timeout=TIMEOUT
        )
        return resp.choices[0].message.content, None
    except Exception as e:
        err_str = str(e).lower()
        if "rate_limit" in err_str or "429" in err_str:
            key_rotator.rotate()
            client = key_rotator.get_client()
        return None, e

def produce_word_content(tu, han, nghia):
    if not nghia or nghia.strip() == "":
        logger.error(f"Tu '{tu}' thieu nghia tieng Viet. Bo qua.")
        return None

    prompt = build_prompt(tu, han, nghia)

    # Phase 1: Prompt chuan (2 lan)
    for attempt in range(MAX_RETRIES // 2):
        raw, err = _call_api(prompt, temp=0.05)
        if err:
            logger.error(f"Loi API lan {attempt+1}: {err}")
            time.sleep(3 * (attempt + 1))
            continue

        # Log raw de debug
        logger.debug(f"AI raw output ({len(raw)} chars): {raw[:500]}")

        ok, errors = validate_ai_output(raw, tu)
        if ok:
            logger.info(f"AI dung format")
            return auto_fix_content(raw, tu)

        logger.warning(f"AI sai format: {', '.join(errors)}")
        # Luu raw output de debug
        debug_file = f"debug_{tu}.txt"
        with open(debug_file, 'w', encoding='utf-8') as f:
            f.write(f"=== PROMPT ===\n{prompt}\n\n=== OUTPUT ===\n{raw}")
        logger.info(f"Da luu debug vao {debug_file}")
        fixed = auto_fix_content(raw, tu)
        ok2, _ = validate_ai_output(fixed, tu)
        if ok2:
            logger.info(f"Auto-fix thanh cong")
            return fixed

        if attempt < MAX_RETRIES // 2 - 1:
            logger.warning("Thu lai voi prompt chuan...")
            time.sleep(3)

    # Phase 2: Prompt phat nang (3 lan con lai)
    strict_prompt = f"""TUYET DOI TUAN THU FORMAT:

Tu: {tu} ({han}) - {nghia}

1. GIAI NGHIA: 1 doan. Chi viet hoa chu cai DAU CAU.

2. 6 VI DU - copy y nguyen:
+ Han: [cau tieng Han]
+ Boi: [phien am]
   + Viet: [dich - chi hoa chu dau]
(Lap dung 6 lan. KHONG dong Boi thu 2. KHONG ** trong Viet.)

3. 4 TU LIEN QUAN - dung 4 dong:
   - tu1 (han1): nghia1.
   - tu2 (han2): nghia2.
   - tu3 (han3): nghia3.
   - tu4 (han4): nghia4.
(KHONG phien am sau han tu. KHONG so thu tu.)

4. MEO NHO: 1 doan. Chi hoa chu dau.

CAM: DONE, ---, ** trong nghia, viet hoa giua cau.
"""
    for attempt in range(MAX_RETRIES // 2, MAX_RETRIES):
        raw, err = _call_api(strict_prompt, temp=0.0)
        if err:
            logger.error(f"Loi API strict lan {attempt+1}: {err}")
            time.sleep(3 * (attempt + 1))
            continue

        ok, errors = validate_ai_output(raw, tu)
        if ok:
            logger.info(f"Strict prompt thanh cong")
            return auto_fix_content(raw, tu)

        logger.warning(f"Strict sai: {', '.join(errors)}")
        fixed = auto_fix_content(raw, tu)
        ok2, _ = validate_ai_output(fixed, tu)
        if ok2:
            return fixed

        if attempt < MAX_RETRIES - 1:
            time.sleep(3)

    logger.error(f"Bo qua {tu} sau {MAX_RETRIES} lan")
    return None

# ================== FORMAT MARKDOWN ==================
def format_to_markdown(tu, han, content):
    lines = [f"## {tu} ({han})", ""]
    lines.extend(content.split('\n'))
    lines.extend(["", ""])
    return '\n'.join(lines)

# ================== DOC INPUT ==================
def read_input():
    if FILE_INPUT.endswith('.xlsx') or FILE_INPUT.endswith('.xls'):
        if not os.path.exists(FILE_INPUT):
            logger.error(f"Khong tim thay {FILE_INPUT}")
            return []
        df = pd.read_excel(FILE_INPUT, engine='openpyxl')
        required_cols = ['Tiếng Hàn', 'Hán tự', 'Nghĩa tiếng Việt']
        for col in required_cols:
            if col not in df.columns:
                logger.error(f"File Excel thieu cot '{col}'.")
                return []
        words = []
        for idx, row in df.iterrows():
            words.append({
                'tu': str(row['Tiếng Hàn']).strip(),
                'han': str(row['Hán tự']).strip(),
                'nghia': str(row['Nghĩa tiếng Việt']).strip()
            })
        logger.info(f"Da doc {len(words)} tu tu Excel")
        return words
    else:
        if not os.path.exists(FILE_INPUT):
            logger.error(f"Khong tim thay {FILE_INPUT}")
            return []
        words = []
        with open(FILE_INPUT, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                parts = line.split('|')
                if len(parts) >= 3:
                    words.append({'tu': parts[0].strip(), 'han': parts[1].strip(), 'nghia': parts[2].strip()})
                elif len(parts) == 2:
                    words.append({'tu': parts[0].strip(), 'han': parts[1].strip(), 'nghia': ''})
                elif len(parts) == 1:
                    words.append({'tu': parts[0].strip(), 'han': '', 'nghia': ''})
        logger.info(f"Da doc {len(words)} tu tu text file")
        return words

# ================== MAIN ==================
def main():
    words = read_input()
    if not words:
        logger.error("Khong co tu nao de xu ly.")
        return

    logger.info(f"Tong so tu: {len(words)}")

    # Kiem tra file output da co
    done_words = set()
    if os.path.exists(FILE_OUTPUT):
        with open(FILE_OUTPUT, 'r', encoding='utf-8') as f:
            content = f.read()
            for match in re.finditer(r'^## ([가-힣]+)', content, re.MULTILINE):
                done_words.add(match.group(1))
        logger.info(f"Da co {len(done_words)} tu trong output.")

    words_todo = [w for w in words if w['tu'] not in done_words]
    if len(words_todo) == 0:
        logger.info("Moi tu da xong.")
        return

    logger.info(f"Can xu ly: {len(words_todo)} tu")

    all_markdown = []
    if os.path.exists(FILE_OUTPUT):
        with open(FILE_OUTPUT, 'r', encoding='utf-8') as f:
            all_markdown = [f.read()]

    success = 0
    failed = 0

    for word in words_todo:
        tu = word['tu']
        han = word['han']
        nghia = word['nghia']

        logger.info(f"Dang xu ly: {tu} - {nghia}")
        content = produce_word_content(tu, han, nghia)

        if content is None:
            failed += 1
            continue

        # Them boi va in dam
        content = insert_boi_and_bold(content, tu)

        markdown_block = format_to_markdown(tu, han, content)
        all_markdown.append(markdown_block)
        success += 1

        # Luu sau moi tu
        with open(FILE_OUTPUT, 'w', encoding='utf-8') as f:
            f.write('\n'.join(all_markdown))

        logger.info(f"Da luu {tu}")
        time.sleep(DELAY_BETWEEN_WORDS)

    logger.info(f"\nHOAN THANH! Thanh cong: {success}/{len(words_todo)} | Loi: {failed}")

if __name__ == "__main__":
    main()
