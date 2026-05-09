"""
Script sinh nội dung Hanja từ Excel/Text, dùng Fireworks AI
Output ra Markdown thay vì Excel để tránh lỗi đọc file
"""

import pandas as pd
import openai
import time
import re
import os
import logging
from itertools import cycle

# ================== CẤU HÌNH ==================
API_KEYS = [
    "fw_F14n3kVYFeyqS7dVWo3Na6",
    "fw_Smj1W3vezvkFhBtdhXNkqp",
    "fw_E2XaDgqMW8K2Y1k9DuiHKh",
    "fw_7aXZ7xrDjeiNipNuQEo7QD",
    "fw_MzNjKUP9N6TvDoZ4tNFxHH",
]
FILE_INPUT = "words_input.txt"  # Đổi sang text input (định dạng: tu|han|nghia)
# FILE_INPUT = "Hanja_Phan_1.xlsx"  # Hoặc dùng Excel nếu muốn
FILE_OUTPUT = "Phan_001.md"
BATCH_SIZE = 20
MAX_RETRIES = 3
TIMEOUT = 120
DELAY_BETWEEN_WORDS = 0.5

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ================== XOAY VÒNG API KEY ==================
class KeyRotator:
    def __init__(self, keys):
        if not keys:
            raise ValueError("Danh sách API_KEYS không được rỗng")
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
        logger.info(f"🔄 Đã chuyển sang API key mới: {self.current_key[:10]}...")
    def get_client(self):
        return self.client

key_rotator = KeyRotator(API_KEYS)
client = key_rotator.get_client()

# ================== HANGUL -> BỒI ==================
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
            boi_chars = []
            for ch in word:
                boi_chars.append(hangul_to_boi_single(ch))
            merged = []
            for i, bc in enumerate(boi_chars):
                merged.append(bc)
                if i < len(word)-1 and hangul_to_boi_single(word[i]) != word[i] and hangul_to_boi_single(word[i+1]) != word[i+1]:
                    merged.append('-')
            result.append(''.join(merged))
        else:
            result.append(word)
    return ''.join(result)

# ================== HÀM SỬA LỖI CHÍNH TẢ ==================
def fix_final_file(text):
    if not text or not isinstance(text, str):
        return text
    # Sửa lỗi dấu thanh
    text = re.sub(r'\bnghiã\b', 'nghĩa', text)
    text = re.sub(r'\bnghiả\b', 'nghĩa', text)
    text = re.sub(r'\bnưã\b', 'nữa', text)
    text = re.sub(r'\bgiưã\b', 'giữa', text)
    text = re.sub(r'\bmôĩ\b', 'mỗi', text)
    text = re.sub(r'cung~', 'cũng', text)
    # Sửa lỗi chính tả
    text = text.replace("vịnh vào", "vịn vào")
    text = text.replace("vịnh lấy", "vịn lấy")
    text = text.replace("trọn lựa", "chọn lựa")
    text = text.replace("tạnh giáo", "tạnh ráo")
    text = text.replace("sắp sếp", "sắp xếp")
    text = text.replace("cọ sát", "cọ xát")
    text = text.replace("suất sắc", "xuất sắc")
    text = text.replace("xúc tích", "súc tích")
    # Sửa format
    text = text.replace("****", "**")
    text = re.sub(r'(?i)done(_hadim)?', '', text)
    text = re.sub(r'\s+([.,!?;:])', r'\1', text)
    text = re.sub(r'([.,!?;:])(?=[^\s\d])', r'\1 ', text)
    text = re.sub(r'([.!?]\s+)([a-z])', lambda m: m.group(1) + m.group(2).upper(), text)
    return text.strip()

# ================== GỌI API FIREWORKS ==================
def produce_word_content(tu, han, nghia):
    global client, key_rotator
    if not nghia or nghia.strip() == "":
        logger.error(f"Từ '{tu}' thiếu nghĩa tiếng Việt. Bỏ qua.")
        return None
    prompt = f"""Soạn nội dung ebook cho từ "{tu}" (Hán tự: {han}, nghĩa: {nghia}).

Yêu cầu bắt buộc (4 mục, dùng số thứ tự):

1. GIẢI NGHĨA: Nghĩa tiếng Việt và phân tích gốc Hán ngắn gọn.

2. 5 VÍ DỤ THỰC CHIẾN:
   Mỗi ví dụ viết trên 3 dòng:
   + Hàn: [câu tiếng Hàn]
   + Bồi: [phiên âm Romaji]
   + Việt: [dịch tiếng Việt]

3. 3 TỪ LIÊN QUAN GỐC HÁN: liệt kê 3 từ có liên quan, mỗi từ kèm giải thích ngắn.

4. MẸO NHỚ: Mẹo ghi nhớ thú vị.

Không thêm dòng DONE hay bất kỳ bình luận thừa nào.
"""
    for attempt in range(MAX_RETRIES):
        try:
            resp = client.chat.completions.create(
                model="accounts/fireworks/models/deepseek-v3p2",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                timeout=TIMEOUT
            )
            raw = resp.choices[0].message.content
            if "GIẢI NGHĨA" in raw and "VÍ DỤ" in raw:
                raw = fix_final_file(raw)
                return raw
            else:
                logger.warning(f"Lần {attempt+1}: Thiếu cấu trúc, thử lại...")
                time.sleep(3)
        except Exception as e:
            logger.error(f"Lỗi: {e}, lần {attempt+1}")
            time.sleep(3*(attempt+1))
            if "rate_limit" in str(e).lower() or "429" in str(e):
                key_rotator.rotate()
                client = key_rotator.get_client()
    return None

# ================== THÊM BỒI VÀ IN ĐẬM ==================
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

def post_process_content(content, tu):
    content = insert_boi_and_bold(content, tu)
    return content

# ================== FORMAT MARKDOWN ==================
def format_to_markdown(tu, han, content):
    """Chuyển content thành format Markdown chuẩn"""
    lines = content.split('\n')
    markdown_lines = [f"## {tu} ({han})", ""]
    
    for line in lines:
        markdown_lines.append(line)
    
    markdown_lines.append("")
    markdown_lines.append("---")
    markdown_lines.append("")
    
    return '\n'.join(markdown_lines)

# ================== ĐỌC INPUT ==================
def read_input():
    """Đọc từ Excel hoặc Text file
    
    Excel: cần 3 cột "Tiếng Hàn", "Hán tự", "Nghĩa tiếng Việt"
    Text: mỗi dòng format "tu|han|nghia" hoặc chỉ "tu"
    """
    if FILE_INPUT.endswith('.xlsx') or FILE_INPUT.endswith('.xls'):
        if not os.path.exists(FILE_INPUT):
            logger.error(f"Không tìm thấy {FILE_INPUT}")
            return []
        
        df = pd.read_excel(FILE_INPUT, engine='openpyxl')
        required_cols = ['Tiếng Hàn', 'Hán tự', 'Nghĩa tiếng Việt']
        for col in required_cols:
            if col not in df.columns:
                logger.error(f"File Excel thiếu cột '{col}'.")
                return []
        
        words = []
        for idx, row in df.iterrows():
            words.append({
                'tu': str(row['Tiếng Hàn']).strip(),
                'han': str(row['Hán tự']).strip(),
                'nghia': str(row['Nghĩa tiếng Việt']).strip()
            })
        logger.info(f"✅ Đã đọc {len(words)} từ từ Excel")
        return words
    else:
        # Đọc từ text file (mỗi dòng: tu|han|nghia)
        if not os.path.exists(FILE_INPUT):
            logger.error(f"Không tìm thấy {FILE_INPUT}")
            return []
        
        words = []
        with open(FILE_INPUT, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                line = line.strip()
                if not line:
                    continue
                parts = line.split('|')
                if len(parts) >= 3:
                    words.append({
                        'tu': parts[0].strip(),
                        'han': parts[1].strip(),
                        'nghia': parts[2].strip()
                    })
                elif len(parts) == 2:
                    # Có tu và han, thiếu nghia
                    words.append({
                        'tu': parts[0].strip(),
                        'han': parts[1].strip(),
                        'nghia': ''
                    })
                elif len(parts) == 1:
                    # Chỉ có từ tiếng Hàn
                    words.append({
                        'tu': parts[0].strip(),
                        'han': '',
                        'nghia': ''
                    })
                else:
                    logger.warning(f"Dòng {line_num}: format không hợp lệ '{line}'")
        logger.info(f"✅ Đã đọc {len(words)} từ từ text file")
        return words

# ================== MAIN ==================
def main():
    words = read_input()
    if not words:
        logger.error("Không có từ nào để xử lý.")
        return
    
    logger.info(f"Tổng số từ cần xử lý: {len(words)}")
    
    # Kiểm tra file output đã có
    done_words = set()
    if os.path.exists(FILE_OUTPUT):
        with open(FILE_OUTPUT, 'r', encoding='utf-8') as f:
            content = f.read()
            # Extract words from existing markdown
            for match in re.finditer(r'^## ([가-힣]+)', content, re.MULTILINE):
                done_words.add(match.group(1))
        logger.info(f"Đã có {len(done_words)} từ trong output. Sẽ bỏ qua.")
    
    # Lọc từ chưa làm
    words_todo = [w for w in words if w['tu'] not in done_words]
    if len(words_todo) == 0:
        logger.info("✅ Mọi từ đã được xử lý. Không cần chạy lại.")
        return
    
    logger.info(f"Số từ còn lại cần xử lý: {len(words_todo)}")
    
    # Xử lý từng từ
    all_markdown = []
    if os.path.exists(FILE_OUTPUT):
        with open(FILE_OUTPUT, 'r', encoding='utf-8') as f:
            all_markdown = [f.read()]
    
    for word in words_todo:
        tu = word['tu']
        han = word['han']
        nghia = word['nghia']
        
        logger.info(f"⏳ Xử lý: {tu} - {nghia}")
        content = produce_word_content(tu, han, nghia)
        
        if content is None:
            logger.error(f"❌ Bỏ qua {tu} do lỗi API quá nhiều.")
            continue
        
        content = post_process_content(content, tu)
        markdown_block = format_to_markdown(tu, han, content)
        all_markdown.append(markdown_block)
        
        # Lưu sau mỗi từ
        with open(FILE_OUTPUT, 'w', encoding='utf-8') as f:
            f.write('\n'.join(all_markdown))
        
        logger.info(f"✅ Đã lưu {tu}")
        time.sleep(DELAY_BETWEEN_WORDS)
    
    logger.info(f"\n🎉 HOÀN THÀNH! Đã xử lý {len(words_todo)} từ mới.")

if __name__ == "__main__":
    main()
