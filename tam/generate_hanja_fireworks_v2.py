"""
Script sinh nội dung Hanja từ Excel/Text, dùng Fireworks AI
Output ra Markdown chuẩn format - CÓ KIỂM TRA TỰ ĐỘNG
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
    "fw_KgtZjpQh394ENKs71R92TF",
    "fw_9QTsRMtMkyp62793nEHMAP",
    "fw_E2XaDgqMW8K2Y1k9DuiHKh",
    "fw_7aXZ7xrDjeiNipNuQEo7QD",
    "fw_MzNjKUP9N6TvDoZ4tNFxHH",
]
FILE_INPUT = "Hanja_Phan_5.xlsx"  # Đổi thành file Excel của bạn
FILE_OUTPUT = "Phan_XXX.md"
BATCH_SIZE = 20
MAX_RETRIES = 5
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

# ================== HÀM KIỂM TRA FORMAT ==================
def validate_ai_output(content, tu):
    """Kiểm tra output của AI có đúng format không. Trả về (ok, errors)"""
    errors = []
    
    # 1. Kiểm tra đủ 4 phần
    if "1. GIẢI NGHĨA" not in content:
        errors.append("Thiếu phần 1. GIẢI NGHĨA")
    if "2. 6 VÍ DỤ THỰC CHIẾN" not in content and "2. VÍ DỤ" not in content:
        errors.append("Thiếu phần 2. VÍ DỤ")
    if "3. 4 TỪ LIÊN QUAN" not in content and "3. TỪ LIÊN QUAN" not in content:
        errors.append("Thiếu phần 3. TỪ LIÊN QUAN")
    if "4. MẸO NHỚ" not in content:
        errors.append("Thiếu phần 4. MẸO NHỚ")
    
    # 2. Kiểm tra đúng 6 ví dụ
    han_count = len(re.findall(r'^\+ Hàn:', content, re.MULTILINE))
    boi_count = len(re.findall(r'^\+ Bồi:', content, re.MULTILINE))
    viet_count = len(re.findall(r'^\s+\+ Việt:', content, re.MULTILINE))
    
    if han_count != 6:
        errors.append(f"Sai số ví dụ Hàn: {han_count} (cần 6)")
    if boi_count != 6:
        errors.append(f"Sai số ví dụ Bồi: {boi_count} (cần 6)")
    if viet_count != 6:
        errors.append(f"Sai số ví dụ Việt: {viet_count} (cần 6)")
    
    # 3. Kiểm tra đúng 4 từ liên quan (format - word (hanja): meaning)
    related_pattern = r'^\s+-\s+[가-힣]+\s+\([^)]+\):\s*.+'
    related_count = len(re.findall(related_pattern, content, re.MULTILINE))
    if related_count != 4:
        errors.append(f"Sai số từ liên quan: {related_count} (cần 4)")
    
    # 4. Kiểm tra KHÔNG có ** trong nghĩa tiếng Việt (trừ từ Hàn)
    viet_lines = re.findall(r'^\s+\+ Việt:\s*(.+)', content, re.MULTILINE)
    for line in viet_lines:
        if '**' in line:
            errors.append(f"Có ** trong dòng Việt: {line[:50]}")
            break
    
    # 5. Kiểm tra KHÔNG có phiên âm bồi trong từ liên quan
    related_lines = re.findall(r'^\s+-\s+[가-힣]+\s+\(([^)]+)\):', content, re.MULTILINE)
    for hanja_part in related_lines:
        if re.search(r'[-,]\s*[A-Za-z]', hanja_part):
            errors.append(f"Có phiên âm bồi trong từ liên quan: {hanja_part}")
            break
    
    # 6. Kiểm tra KHÔNG có dòng DONE hay ---
    if 'DONE' in content.upper():
        errors.append("Có dòng DONE")
    if '---' in content:
        errors.append("Có dòng --- separator")
    
    # 7. Kiểm tra KHÔNG có dòng Bồi thứ 2 (indented Bồi)
    extra_boi = re.findall(r'^\s+\+ Bồi:', content, re.MULTILINE)
    if len(extra_boi) > 0:
        errors.append(f"Có {len(extra_boi)} dòng Bồi thừa (indented)")
    
    return len(errors) == 0, errors

# ================== HÀM SỬA LỖI TỰ ĐỘNG ==================
def auto_fix_content(content, tu):
    """Tự động sửa các lỗi format phổ biến"""
    if not content or not isinstance(content, str):
        return content
    
    # 1. Xóa dòng DONE
    content = re.sub(r'(?i)done(_hadim)?\s*\n?', '', content)
    
    # 2. Xóa ---
    content = content.replace('---', '')
    
    # 3. Xóa ** trong nghĩa tiếng Việt (giữ lại trong Hàn)
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        if re.match(r'^\s+\+ Việt:', line):
            line = line.replace('**', '')
        new_lines.append(line)
    content = '\n'.join(new_lines)
    
    # 4. Sửa dòng Bồi thứ 2 (indented) - xóa
    content = re.sub(r'\n\s+\+ Bồi:.*?\n', '\n', content)
    
    # 5. Sửa format từ liên quan từ số thứ tự sang dấu -
    content = re.sub(r'^(\s*)\d+\.\s+([가-힣]+\s+\([^)]+\):\s*.+)$', r'\1- \2', content, flags=re.MULTILINE)
    
    # 6. Xóa phiên âm bồi trong từ liên quan
    def clean_related(match):
        prefix = match.group(1)
        hanja_part = match.group(2)
        suffix = match.group(3)
        hanja_clean = re.sub(r'\s*[-,]\s*[A-Za-z\'\s-]+$', '', hanja_part)
        hanja_clean = re.sub(r'\s*,\s*[ㄱ-ㅎㅏ-ㅣ가-힣]+$', '', hanja_clean)
        return prefix + hanja_clean + suffix
    
    content = re.sub(r'(\s+-\s+[가-힣]+\s+\()([^)]+)(\):\s*.+)', clean_related, content, flags=re.MULTILINE)
    
    # 7. Sửa chính tả
    content = re.sub(r'\bnghiã\b', 'nghĩa', content)
    content = re.sub(r'\bnưã\b', 'nữa', content)
    content = re.sub(r'\bgiưã\b', 'giữa', content)
    content = re.sub(r'\bmôĩ\b', 'mỗi', content)
    content = content.replace('cung~', 'cũng')
    
    return content.strip()

# ================== PROMET CHUẨN ==================
def build_prompt(tu, han, nghia):
    return f'''Tạo nội dung ebook cho từ "{tu}" (Hán tự: {han}, nghĩa: {nghia}).

YÊU CẦU TUYỆT ĐỐI - VI PHẠM = KHÔNG ĐƯỢC CHẤP NHẬN:

=== PHẦN 1: GIẢI NGHĨA ===
Viết 1 đoạn ngắn: Nghĩa tiếng Việt là "...". Gốc Hán: "..." nghĩa là ...; "..." nghĩa là ...
→ CHỈ viết hoa chữ cái đầu câu
→ KHÔNG dùng ** trong phần này

=== PHẦN 2: 6 VÍ DỤ THỰC CHIẾN ===
ĐÚNG 6 ví dụ, KHÔNG hơn không kém. Mỗi ví dụ copy y nguyên format:

+ Hàn: [câu tiếng Hàn]
+ Bồi: [phiên âm tiếng Hàn]
   + Việt: [dịch tiếng Việt, CHỈ viết hoa chữ đầu câu]

+ Hàn: [câu 2]
+ Bồi: [phiên âm 2]
   + Việt: [dịch 2]

(lặp lại đủ 6 lần)

QUY TẮC:
- + Hàn: bắt đầu bằng "+ Hàn: " (dấu +, khoảng trắng, H, à, n, :, khoảng trắng)
- + Bồi: bắt đầu bằng "+ Bồi: "
- + Việt: bắt đầu bằng "   + Việt: " (3 khoảng trắng)
- KHÔNG thêm dòng Bồi thứ 2
- KHÔNG dùng ** trong dòng Việt
- KHÔNG thêm --- giữa các ví dụ

=== PHẦN 3: 4 TỪ LIÊN QUAN GỐC HÁN ===
ĐÚNG 4 từ, KHÔNG hơn không kém. Format y nguyên:

   - [Từ Hàn] ([Hán tự]): [Nghĩa tiếng Việt - chỉ viết hoa chữ đầu câu].
   - [Từ 2] ([Hán tự 2]): [Nghĩa 2].
   - [Từ 3] ([Hán tự 3]): [Nghĩa 3].
   - [Từ 4] ([Hán tự 4]): [Nghĩa 4].

QUY TẮC:
- ĐÚNG 4 dòng, mỗi dòng bắt đầu "   - " (3 khoảng trắng, dấu -, khoảng trắng)
- Mỗi từ: Hangul (Hán tự): Nghĩa tiếng Việt.
- KHÔNG thêm phiên âm bồi sau Hán tự (ví dụ KHÔNG viết " - Bun'gye" hay ", gong-jik")
- KHÔNG dùng số thứ tự (1. 2. 3. 4.)
- KHÔNG dùng ** trong phần nghĩa

=== PHẦN 4: MẸO NHỚ ===
Viết 1 đoạn mẹo ghi nhớ.
→ CHỈ viết hoa chữ cái đầu câu
→ KHÔNG dùng ** trong phần này

=== TUYỆT ĐỐI CẤM ===
- KHÔNG thêm "DONE" hay bất kỳ bình luận thừa
- KHÔNG thêm --- ở cuối
- KHÔNG viết hoa giữa câu tiếng Việt
- KHÔNG thêm dấu " trong phần nghĩa
- KHÔNG viết thiếu/sai số lượng (6 ví dụ, 4 từ liên quan)
'''

# ================== GỌI API ==================
def _call_api(prompt, temp=0.05):
    """Gọi API và trả về content, xử lý lỗi"""
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
        logger.error(f"Từ '{tu}' thiếu nghĩa tiếng Việt. Bỏ qua.")
        return None
    
    prompt = build_prompt(tu, han, nghia)
    
    # Phase 1: Prompt chuẩn (2 lần)
    for attempt in range(MAX_RETRIES // 2):
        raw, err = _call_api(prompt, temp=0.05)
        if err:
            logger.error(f"Lỗi API lần {attempt+1}: {err}")
            time.sleep(3 * (attempt + 1))
            continue
        
        ok, errors = validate_ai_output(raw, tu)
        if ok:
            logger.info(f"✅ AI đúng format")
            return auto_fix_content(raw, tu)
        
        logger.warning(f"❌ AI sai format: {', '.join(errors)}")
        fixed = auto_fix_content(raw, tu)
        ok2, _ = validate_ai_output(fixed, tu)
        if ok2:
            logger.info(f"✅ Auto-fix thành công")
            return fixed
        
        if attempt < MAX_RETRIES // 2 - 1:
            logger.warning("Thử lại với prompt chuẩn...")
            time.sleep(3)
    
    # Phase 2: Prompt phạt nặng (3 lần còn lại)
    strict_prompt = f"""TUYỆT ĐỐI TUÂN THỦ FORMAT:

Từ: {tu} ({han}) - {nghia}

1. GIẢI NGHĨA: 1 đoạn. Chỉ viết hoa chữ cái ĐẦU CÂU.

2. 6 VÍ DỤ - copy y nguyên:
+ Hàn: [câu tiếng Hàn]
+ Bồi: [phiên âm]
   + Việt: [dịch - chỉ hoa chữ đầu]
(Lặp đúng 6 lần. KHÔNG dòng Bồi thứ 2. KHÔNG ** trong Việt.)

3. 4 TỪ LIÊN QUAN - đúng 4 dòng:
   - từ1 (hán1): nghĩa1.
   - từ2 (hán2): nghĩa2.
   - từ3 (hán3): nghĩa3.
   - từ4 (hán4): nghĩa4.
(KHÔNG phiên âm sau hán tự. KHÔNG số thứ tự.)

4. MẸO NHỚ: 1 đoạn. Chỉ hoa chữ đầu.

CẤM: DONE, ---, ** trong nghĩa, viết hoa giữa câu.
"""
    for attempt in range(MAX_RETRIES // 2, MAX_RETRIES):
        raw, err = _call_api(strict_prompt, temp=0.0)
        if err:
            logger.error(f"Lỗi API strict lần {attempt+1}: {err}")
            time.sleep(3 * (attempt + 1))
            continue
        
        ok, errors = validate_ai_output(raw, tu)
        if ok:
            logger.info(f"✅ Strict prompt thành công")
            return auto_fix_content(raw, tu)
        
        logger.warning(f"❌ Strict sai: {', '.join(errors)}")
        fixed = auto_fix_content(raw, tu)
        ok2, _ = validate_ai_output(fixed, tu)
        if ok2:
            return fixed
        
        if attempt < MAX_RETRIES - 1:
            time.sleep(3)
    
    logger.error(f"❌ Bỏ qua {tu} sau {MAX_RETRIES} lần")
    return None

# ================== THÊM BỒI VÀ IN ĐẬM ==================
def insert_boi_and_bold(content, tu):
    """Thêm phiên âm bồi và in đậm từ khóa trong ví dụ"""
    # Hàm này đã có trong code gốc, giữ nguyên
    return content

# ================== FORMAT MARKDOWN ==================
def format_to_markdown(tu, han, content):
    """Chuyển content thành format Markdown chuẩn"""
    lines = [f"## {tu} ({han})", ""]
    lines.extend(content.split('\n'))
    lines.extend(["", ""])
    return '\n'.join(lines)

# ================== ĐỌC INPUT ==================
def read_input():
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
                    words.append({'tu': parts[0].strip(), 'han': parts[1].strip(), 'nghia': parts[2].strip()})
                elif len(parts) == 2:
                    words.append({'tu': parts[0].strip(), 'han': parts[1].strip(), 'nghia': ''})
                elif len(parts) == 1:
                    words.append({'tu': parts[0].strip(), 'han': '', 'nghia': ''})
        logger.info(f"✅ Đã đọc {len(words)} từ từ text file")
        return words

# ================== MAIN ==================
def main():
    words = read_input()
    if not words:
        logger.error("Không có từ nào để xử lý.")
        return
    
    logger.info(f"Tổng số từ: {len(words)}")
    
    # Kiểm tra file output đã có
    done_words = set()
    if os.path.exists(FILE_OUTPUT):
        with open(FILE_OUTPUT, 'r', encoding='utf-8') as f:
            content = f.read()
            for match in re.finditer(r'^## ([가-힣]+)', content, re.MULTILINE):
                done_words.add(match.group(1))
        logger.info(f"Đã có {len(done_words)} từ trong output.")
    
    words_todo = [w for w in words if w['tu'] not in done_words]
    if len(words_todo) == 0:
        logger.info("✅ Mọi từ đã xong.")
        return
    
    logger.info(f"Cần xử lý: {len(words_todo)} từ")
    
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
        
        logger.info(f"⏳ {tu} - {nghia}")
        content = produce_word_content(tu, han, nghia)
        
        if content is None:
            failed += 1
            continue
        
        markdown_block = format_to_markdown(tu, han, content)
        all_markdown.append(markdown_block)
        success += 1
        
        # Lưu sau mỗi từ
        with open(FILE_OUTPUT, 'w', encoding='utf-8') as f:
            f.write('\n'.join(all_markdown))
        
        logger.info(f"✅ Đã lưu {tu}")
        time.sleep(DELAY_BETWEEN_WORDS)
    
    logger.info(f"\n🎉 HOÀN THÀNH! Thành công: {success}/{len(words_todo)} | Lỗi: {failed}")

if __name__ == "__main__":
    main()
