"""
Script sinh noi dung Hanja tu Excel/Text, dung Fireworks AI
Output ra Markdown - DA SUA DE EP AI DUNG FORMAT
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
FILE_INPUT = "Hanja_Phan_5.xlsx"
FILE_OUTPUT = "Phan_005.md"
MAX_RETRIES = 3
TIMEOUT = 120
DELAY_BETWEEN_WORDS = 0.5

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
def check_format(content, tu):
    """Kiem tra xem AI co tra ve dung format khong. Tra ve (ok, loi)"""
    loi = []
    
    # 1. Du 4 phan
    if "GIẢI NGHĨA" not in content:
        loi.append("Thieu GIAI NGHIA")
    if "VÍ DỤ" not in content:
        loi.append("Thieu VI DU")
    if "TỪ LIÊN QUAN" not in content:
        loi.append("Thieu TU LIEN QUAN")
    if "MẸO NHỚ" not in content:
        loi.append("Thieu MEO NHO")
    
    # 2. Dung 6 vi du
    han = len(re.findall(r'^\+ Hàn:', content, re.MULTILINE))
    boi = len(re.findall(r'^\+ Bồi:', content, re.MULTILINE))
    viet = len(re.findall(r'^\s+\+ Việt:', content, re.MULTILINE))
    if han != 6 or boi != 6 or viet != 6:
        loi.append(f"Vi du: Han={han}, Boi={boi}, Viet={viet} (can 6)")
    
    # 3. Dung 4 tu lien quan (khong dung so thu tu)
    related = len(re.findall(r'^\s+-\s+[가-힣]+\s+\([^)]+\):', content, re.MULTILINE))
    if related != 4:
        loi.append(f"Tu lien quan: {related}/4")
    
    return len(loi) == 0, loi

# ================== SUA LOI TU DONG ==================
def fix_content(content, tu):
    """Sua cac loi format pho bien sau khi AI tra ve"""
    if not content:
        return content
    
    # 1. Xoa DONE va --- o dau
    content = re.sub(r'^done\s*\n?\s*---+\s*\n?', '', content, flags=re.IGNORECASE)
    content = re.sub(r'done(_hadim)?\s*\n?', '', content, flags=re.IGNORECASE)
    
    # 2. Sua **GIẢI NGHĨA** thanh 1. GIẢI NGHĨA:
    content = re.sub(r'\*\*GIẢI NGHĨA\*\*', '1. GIẢI NGHĨA:', content)
    content = re.sub(r'\*\*6 VÍ DỤ.*?\*\*', '2. 6 VÍ DỤ THỰC CHIẾN:', content)
    content = re.sub(r'\*\*4 TỪ LIÊN QUAN.*?\*\*', '3. 4 TỪ LIÊN QUAN GỐC HÁN:', content)
    content = re.sub(r'\*\*MẸO NHỚ\*\*', '4. MẸO NHỚ:', content)
    
    # 3. Sua Han:/Boi: thanh + Hàn:/+ Bồi:
    content = re.sub(r'^(Han|Hàn):\s*', '+ Hàn: ', content, flags=re.MULTILINE)
    content = re.sub(r'^(Boi|Bồi):\s*', '+ Bồi: ', content, flags=re.MULTILINE)
    content = re.sub(r'^(Viet|Việt):\s*', '   + Việt: ', content, flags=re.MULTILINE)
    
    # 4. Xoa ** trong toan bo content (tru trong + Hàn)
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        if not re.match(r'^\s*\+ Hàn:', line):
            line = line.replace('**', '')
        new_lines.append(line)
    content = '\n'.join(new_lines)
    
    # 5. Xoa dong trong (co the co ** con sot lai)
    content = re.sub(r'^\s*[-•]\s*\*\*.*?:\*\*', '', content, flags=re.MULTILINE)
    
    # 6. Sua chinh ta
    content = re.sub(r'\bnghiã\b', 'nghĩa', content)
    content = re.sub(r'\bnưã\b', 'nữa', content)
    content = re.sub(r'\bgiưã\b', 'giữa', content)
    content = re.sub(r'\bmôĩ\b', 'mỗi', content)
    content = content.replace('cung~', 'cũng')
    
    # 7. Xoa phiên âm bồi trong tu lien quan
    def clean_hanja(match):
        prefix = match.group(1)
        hanja = match.group(2)
        suffix = match.group(3)
        hanja_clean = re.sub(r'\s*[-,]\s*[A-Za-z\'\s-]+$', '', hanja)
        return prefix + hanja_clean + suffix
    content = re.sub(r'(\s+-\s+[가-힣]+\s+\()([^)]+)(\):\s*.+)', clean_hanja, content, flags=re.MULTILINE)
    
    # 8. Sua tu lien quan tu so thu tu sang dau -
    content = re.sub(r'^(\s*)\d+\.\s+([가-힣]+\s+\([^)]+\):\s*.+)$', r'\1- \2', content, flags=re.MULTILINE)
    
    return content.strip()

# ================== GOI API ==================
def produce_word_content(tu, han, nghia):
    global client, key_rotator
    if not nghia or nghia.strip() == "":
        logger.error(f"Tu '{tu}' thieu nghia. Bo qua.")
        return None
    
    # === SUA 1: Prompt dung few-shot de AI copy format ===
    prompt = f"""Viet noi dung cho tu tieng Han: {tu} (Han tu: {han}, nghia: {nghia})

YEU CAU: Copy DUNG format duoi day, chi thay noi dung, KHONG thay doi cau truc:

1. GIẢI NGHĨA: Nghia tieng Viet la "...". Goc Han "..." nghia la ...

2. 6 VÍ DỤ THỰC CHIẾN:
+ Hàn: 이 문제를 가결해야 합니다.
+ Bồi: i mun-jae-reul ga-gyeol-hae-ya hab-ni-da
   + Việt: Chung ta can thong qua van de nay.

+ Hàn: 회의에서 안건이 가결되었다.
+ Bồi: hoe-ui-e-seo an-geon-i ga-gyeol-doe-eot-da
   + Việt: Nghi quyet da duoc thong qua trong cuoc hop.

(Lap lai du 6 vi du theo format tren)

3. 4 TỪ LIÊN QUAN GỐC HÁN:
   - 통과 (通過): Vuot qua, duoc chap thuan.
   - 인준 (認準): Chap thuan, phe chuan.
   - 부결 (否決): Bac bo, phu quyet.
   - 합의 (合議): Thoa thuan, nhat tri.

4. MẸO NHỚ: Meo ghi nho thu vi.

LUU Y TUYET DOI:
- Bat dau bang "1. GIẢI NGHĨA:" chu KHONG dung **
- Dong Hàn bat dau bang "+ Hàn:"
- Dong Bồi bat dau bang "+ Bồi:"
- Dong Việt bat dau bang "   + Việt:" (3 khoang trang)
- Tu lien quan bat dau bang "   -" (3 khoang trang, dau -)
- KHONG viet DONE hay ---
- KHONG dung ** trong phan nghia tieng Viet
"""
    
    for attempt in range(MAX_RETRIES):
        try:
            resp = client.chat.completions.create(
                model="accounts/fireworks/models/deepseek-v3p2",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,  # Cang thap cang tot
                timeout=TIMEOUT
            )
            raw = resp.choices[0].message.content
            
            # === SUA 2: Kiem tra format truoc khi chap nhan ===
            ok, loi = check_format(raw, tu)
            if ok:
                logger.info(f"AI dung format")
                raw = fix_content(raw, tu)
                return raw
            else:
                logger.warning(f"AI sai format: {', '.join(loi)}")
                # LOG RAW OUTPUT DE XEM AI DANG VIET GI
                logger.info(f"RAW OUTPUT (500 chars): {repr(raw[:500])}")
                # Thu sua loi tu dong
                fixed = fix_content(raw, tu)
                ok2, _ = check_format(fixed, tu)
                if ok2:
                    logger.info(f"Auto-fix thanh cong")
                    return fixed
                time.sleep(3)
                
        except Exception as e:
            logger.error(f"Loi API: {e}, lan {attempt+1}")
            time.sleep(3*(attempt+1))
            if "rate_limit" in str(e).lower() or "429" in str(e):
                key_rotator.rotate()
                client = key_rotator.get_client()
    
    logger.error(f"Bo qua {tu} sau {MAX_RETRIES} lan")
    return None

# ================== RETRY VỚI PROMPT SIÊU NGẮN ==================
def retry_strict(tu, han, nghia):
    """Retry với prompt cực ngắn, ép AI tuân thủ tuyệt đối"""
    global client, key_rotator
    
    # Prompt ngắn gọn, dễ parse
    prompt = f"""Write for Korean word: {tu} ({han}) = {nghia}

COPY EXACTLY this format (only change content):

1. GIẢI NGHĨA: One paragraph.

2. 6 VÍ DỤ THỰC CHIẾN:
+ Hàn: [Korean sentence]
+ Bồi: [romanization]
   + Việt: [Vietnamese translation]
(Repeat 6 times. NO extra lines.)

3. 4 TỪ LIÊN QUAN GỐC HÁN:
   - word1 (hanja1): meaning1.
   - word2 (hanja2): meaning2.
   - word3 (hanja3): meaning3.
   - word4 (hanja4): meaning4.

4. MẸO NHỚ: One paragraph.

RULES:
- Start lines with + Hàn:, + Bồi:,    + Việt:
- Related words start with    -
- NO ** anywhere
- NO DONE, NO ---
"""
    
    for attempt in range(2):
        try:
            resp = client.chat.completions.create(
                model="accounts/fireworks/models/deepseek-v3p2",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                timeout=TIMEOUT
            )
            raw = resp.choices[0].message.content
            
            ok, loi = check_format(raw, tu)
            if ok:
                logger.info(f"Retry strict OK")
                return fix_content(raw, tu)
            
            fixed = fix_content(raw, tu)
            ok2, _ = check_format(fixed, tu)
            if ok2:
                return fixed
            
            logger.warning(f"Retry strict loi: {', '.join(loi)}")
            time.sleep(3)
            
        except Exception as e:
            logger.error(f"Retry strict API loi: {e}")
            time.sleep(3)
    
    return None

# ================== THEM BOI VA IN DAM ==================
def insert_boi_and_bold(content, tu):
    """Them boi va in dam tu khoa trong vi du"""
    keyword_boi = sentence_to_boi(tu)
    lines = content.split('\n')
    new_lines = []
    
    for line in lines:
        if re.match(r'^\s*\+ Han:', line):
            # Lay cau tieng Han
            han_sentence = re.sub(r'^\s*\+ Han:\s*', '', line).strip()
            # In dam tu khoa trong cau Han
            han_bolded = re.sub(rf'({re.escape(tu)})', r'**\1**', han_sentence, flags=re.IGNORECASE)
            # Sinh boi
            boi = sentence_to_boi(han_sentence)
            # In dam tu khoa trong boi
            if keyword_boi:
                boi = re.sub(rf'({re.escape(keyword_boi)})', r'**\1**', boi, flags=re.IGNORECASE)
            # Ghi de: dong Han thanh dong Han + dong Boi
            new_lines.append(f"+ Han: {han_bolded}")
            new_lines.append(f"+ Boi: {boi}")
        elif re.match(r'^\s*\+ Boi:', line):
            # Bo qua dong Boi cu (AI da sinh) -> thay bang boi moi
            continue
        elif re.match(r'^\s*\+ Viet:', line):
            # Viet giu nguyen nhung bo **
            line = line.replace('**', '')
            new_lines.append(line)
        else:
            new_lines.append(line)
    
    return '\n'.join(new_lines)

def post_process_content(content, tu):
    content = insert_boi_and_bold(content, tu)
    return content

# ================== FORMAT MARKDOWN ==================
def format_to_markdown(tu, han, content):
    """Chuyen content thanh format Markdown chuan"""
    lines = [f"## {tu} ({han})", ""]
    lines.extend(content.split('\n'))
    # === SUA 3: Khong them --- ===
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
    
    done_words = set()
    if os.path.exists(FILE_OUTPUT):
        with open(FILE_OUTPUT, 'r', encoding='utf-8') as f:
            content = f.read()
            for match in re.finditer(r'^## ([가-힣]+)', content, re.MULTILINE):
                done_words.add(match.group(1))
        logger.info(f"Da co {len(done_words)} tu trong output. Bo qua.")
    
    words_todo = [w for w in words if w['tu'] not in done_words]
    if len(words_todo) == 0:
        logger.info("Moi tu da xong.")
        return
    
    logger.info(f"Can xu ly: {len(words_todo)} tu")
    
    all_markdown = []
    if os.path.exists(FILE_OUTPUT):
        with open(FILE_OUTPUT, 'r', encoding='utf-8') as f:
            all_markdown = [f.read()]
    
    failed_words = []
    
    for word in words_todo:
        tu = word['tu']
        han = word['han']
        nghia = word['nghia']
        
        logger.info(f"Dang xu ly: {tu} - {nghia}")
        content = produce_word_content(tu, han, nghia)
        
        if content is None:
            logger.error(f"❌ Từ '{tu}' lỗi sau {MAX_RETRIES} lần thử")
            failed_words.append(word)
            continue
        
        content = post_process_content(content, tu)
        markdown_block = format_to_markdown(tu, han, content)
        all_markdown.append(markdown_block)
        
        with open(FILE_OUTPUT, 'w', encoding='utf-8') as f:
            f.write('\n'.join(all_markdown))
        
        logger.info(f"✅ Đã lưu {tu}")
        time.sleep(DELAY_BETWEEN_WORDS)
    
    # === RETRY TỪ LỖI ===
    if failed_words:
        logger.info(f"\n🔁 Retry {len(failed_words)} từ bị lỗi...")
        still_failed = []
        
        for word in failed_words:
            tu = word['tu']
            han = word['han']
            nghia = word['nghia']
            
            logger.info(f"Retry: {tu}")
            # Retry với prompt siêu ngắn, ép cứng format
            content = retry_strict(tu, han, nghia)
            
            if content is None:
                still_failed.append(word)
                continue
            
            content = post_process_content(content, tu)
            markdown_block = format_to_markdown(tu, han, content)
            all_markdown.append(markdown_block)
            
            with open(FILE_OUTPUT, 'w', encoding='utf-8') as f:
                f.write('\n'.join(all_markdown))
            
            logger.info(f"✅ Retry thành công: {tu}")
            time.sleep(2)
        
        # Lưu từ vẫn lỗi vào file
        if still_failed:
            with open('failed_words.txt', 'w', encoding='utf-8') as f:
                for w in still_failed:
                    f.write(f"{w['tu']}|{w['han']}|{w['nghia']}\n")
            logger.warning(f"⚠️ {len(still_failed)} từ vẫn lỗi, đã lưu failed_words.txt")
    
    logger.info(f"\n🎉 HOÀN THÀNH!")

if __name__ == "__main__":
    main()
