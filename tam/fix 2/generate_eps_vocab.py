# -*- coding: utf-8 -*-
"""
OCR + parse 11 ảnh trong tam/fix 2/e/, sinh CSV upload-ready.

Strategy:
  - winocr ko-KR: lấy Korean (clean)
  - easyocr ['vi','en']: lấy Vietnamese + số thứ tự (clean diacritics)
  - Merge theo bounding-box Y → group thành "row"
  - Mỗi row 2 cột (trái/phải), split theo X = giữa ảnh
"""
from __future__ import annotations
import asyncio, csv, json, re, sys, unicodedata
from pathlib import Path

# IMPORT ORDER: torch trước winocr để tránh DLL conflict trên Windows
import torch  # noqa
import easyocr
import numpy as np
from PIL import Image
import winocr

sys.stdout.reconfigure(encoding='utf-8')

def strip_accents(s: str) -> str:
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

HERE = Path(__file__).parent
SRC_DIR = HERE / "e"
OUT_CSV = HERE / "eps_1000_vocab.csv"
DEBUG_DIR = HERE / "_ocr_debug"
DEBUG_DIR.mkdir(exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
#  Romanization (Revised Romanization)
# ─────────────────────────────────────────────────────────────────────────────
INI = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h']
MED = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i']
FIN_END = ['','k','k','k','n','n','n','t','l','k','m','l','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t']
FIN_LIAISE = {
    1:('g',''),2:('kk',''),3:('s','k'),4:('n',''),5:('j','n'),6:('','n'),
    7:('d',''),8:('r',''),9:('g','l'),10:('m','l'),11:('b','l'),
    12:('s','l'),13:('t','l'),14:('p','l'),15:('','l'),16:('m',''),
    17:('b',''),18:('s','b'),19:('s',''),20:('ss',''),21:('ng',''),
    22:('j',''),23:('ch',''),24:('k',''),25:('t',''),26:('p',''),27:('',''),
}
NASAL_INI = {2,6}
NASALIZE_FIN = {1:'ng',2:'ng',24:'ng',7:'n',19:'n',20:'n',22:'n',23:'n',25:'n',27:'n',17:'m',26:'m'}

def romanize(text: str) -> str:
    syls = []
    for ch in text:
        c = ord(ch)
        if 0xAC00 <= c <= 0xD7A3:
            o = c - 0xAC00
            syls.append(('h', o//588, (o%588)//28, o%28))
        elif ch == ' ':
            syls.append(('sp',))
        else:
            syls.append(('o', ch))
    out, pending_ini = [], None
    for i, s in enumerate(syls):
        if s[0] == 'sp':
            out.append(' '); pending_ini = None; continue
        if s[0] == 'o':
            out.append(s[1]); pending_ini = None; continue
        _, ini, med, fin = s
        ini_str = pending_ini if pending_ini is not None else INI[ini]
        pending_ini = None
        nxt = syls[i+1] if i+1 < len(syls) else None
        nxt_han = nxt is not None and nxt[0] == 'h'
        if fin > 0 and nxt_han and nxt[1] == 11:
            carry, residual = FIN_LIAISE.get(fin, (FIN_END[fin], ''))
            fin_str = residual; pending_ini = carry
        elif fin > 0 and nxt_han and nxt[1] in NASAL_INI and fin in NASALIZE_FIN:
            fin_str = NASALIZE_FIN[fin]
        else:
            fin_str = FIN_END[fin]
        out.append(ini_str + MED[med] + fin_str)
    return ''.join(out)

# ─────────────────────────────────────────────────────────────────────────────
#  Topic mapping
# ─────────────────────────────────────────────────────────────────────────────
TOPIC_KEYWORDS = [
    ("greeting",  ["xin chào","chào hỏi","chào","cảm ơn","xin lỗi","a lô","alô","kính ngữ","không sao","tạm biệt"]),
    ("workplace", ["công ty","làm việc","sếp","giám đốc","đồng nghiệp","lương","công nhân","văn phòng","hợp đồng","tăng ca","ca đêm","công trường","nhân viên","trưởng phòng","phòng họp","tan ca","đi làm","nghỉ phép","nghỉ việc","xin việc","công sự","công sở","lao động","nhân viên mới","tăng lương","thẻ tín dụng","thẻ visa","chấm công","công việc"]),
    ("safety",    ["bảo hộ","an toàn","mũ bảo hộ","găng tay","khẩu trang","sơ cứu","cứu hộ","phòng cháy","chữa cháy","bình chữa cháy","thoát hiểm","đào tạo an toàn","tai nạn lao động","nguy hiểm","biển báo nguy hiểm","cấm hút thuốc","cảnh báo","cấm","chất độc","chất gây","chất thải","chất rất độc","chất nổ","nổ","kiểm tra an toàn"]),
    ("body",      ["đầu","mắt","tai","mũi","miệng","tay","chân","vai","bụng","ngực","cổ","tóc","móng","da","máu","xương","lưng","đùi","đầu gối","cánh tay","ngón tay","ngón chân","cổ họng","khớp","khuỷu tay","khuôn mặt","lông mày","răng","lưỡi","môi","má","trán"]),
    ("hospital",  ["bệnh viện","khám","điều trị","bác sĩ","y tá","ốm","bệnh","sốt","cảm cúm","ho","đau đầu","phẫu thuật","tiêm","nhập viện","ra viện","nội khoa","khoa ngoại","phòng khám","thuốc đánh răng","thẻ bảo hiểm sức khoẻ","kiểm tra sức khoẻ","thuốc","sức khỏe","sức khoẻ","cấp cứu","viện","bị thương","khoẻ mạnh","đau","băng cứu thương","viện điều dưỡng"]),
    ("transport", ["xe ô tô","xe hơi","xe máy","xe đạp","xe buýt","xe tải","xe lửa","xe khách","tàu hoả","tàu","máy bay","thuyền","đường cao tốc","giao thông","tốc độ","lái","vé máy bay","vé xe","bến xe","bến cảng","ga","xăng","phanh","biển báo giao thông","tai nạn giao thông","luật giao thông","đèn giao thông","phương tiện","ô tô","rút tiền atm","đỗ xe","đậu xe","đỗ","cổng","phà","lái xe","đèn pin","xe buýt tốc hành","xe cộ","xe","tài xế","bến","đèo","cầu vượt","đổi tàu xe","trạm xe","dừng xe"]),
    ("food",      ["ăn","cơm","món","nấu","gạo","thịt","rau","trái cây","uống","nhà hàng","đói","no","bánh mì","bánh","mì","rượu","nước","bia","trà","cà phê","đậu phụ","khoai lang","khoai tây","ớt","muối","đường","tỏi","hành","quả trứng","trứng","sữa","nước trái cây","đồ uống","đồ ăn","đậu hũ","khẩu vị","cay","ngọt","chua","mặn","đắng","cháo","phở","kim chi","cá","tôm","thịt bò","thịt heo","thịt gà","rau củ","bữa sáng","bữa trưa","bữa tối","tráng miệng","đặt bàn","cà ri","súp","phô mai","kẹo","bánh kẹo","thức ăn","khoai","thực phẩm","đồ ăn nhanh","dạ dày","thực đơn","ăn quá nhiều","thức ăn","khẩu phần"]),
    ("shopping",  ["mua","bán","cửa hàng","giá","tiền","siêu thị","chợ","thẻ","hoá đơn","tiền mặt","giảm giá","khuyến mãi","tiết kiệm","thu ngân","tiền lẻ","bóp","ví","rẻ","đắt","chợ búa","bán hàng","quầy","tiền phạt","mặc cả"]),
    ("housing",   ["nhà","phòng","cửa","ghế","bàn","giường","đồ nội thất","tủ","gối","chăn","bếp","tiền nhà","thuê nhà","chung cư","ban công","sân thượng","đèn","cầu thang","máy giặt","máy lạnh","tủ lạnh","máy hút bụi","máy điều hoà","ổ cắm","điện thoại","ngôi nhà","phòng khách","phòng bếp","phòng tắm","phòng ngủ","lò vi sóng","tivi","tủ giày","cửa sổ","cửa số","đồng hồ","máy điều hòa","nhà vệ sinh","khoá","chìa khoá","máy tính","máy giặt","tủ áo","chiếu","gương"]),
    ("weather",   ["trời","mưa","gió","nắng","lạnh","nóng","tuyết","mây","sương","bão","ấm áp","mát mẻ","thời tiết","khí hậu","nhiệt độ","âm","dưới 0","trên 0","độ","khô","ẩm","gió thổi"]),
    ("time",      ["giờ","ngày","tháng","năm","tuần","buổi sáng","buổi chiều","buổi tối","buổi","đêm","ngày mai","hôm nay","hôm qua","ngày kia","thứ 2","thứ 3","thứ 4","thứ 5","thứ 6","thứ 7","chủ nhật","khi nào","lúc","trước","sau","giờ giấc","vài ngày","thường xuyên","năm ngoái","năm tới","mùa thu","mùa đông","mùa hè","mùa xuân","mùa","quá khứ","tương lai","hiện tại","ngay bây giờ","bây giờ","tối","mỗi","sau khi","mới đây","gần đây","cuối tuần"]),
    ("number",    ["số","đếm","đơn vị","lần","thứ","1 mình","1 lần","1 chiều","1 ngày","vài lần","hàng trăm","hàng nghìn","thứ tự","2 ngày","khoảng"]),
    ("family",    ["gia đình","bố","mẹ","anh","chị","em","ông","bà","vợ","chồng","con","anh em","con cái","con trai","con gái","cháu","ba mẹ","bác","cô","chú","dì","anh trai","anh rể","chị em","em gái","em trai","ông bà","bố mẹ","cha mẹ","trẻ em","trẻ nhỏ"]),
    ("law",       ["pháp luật","luật","quyền","nghĩa vụ","vi phạm","phạt","kiện","toà án","luật pháp","luật sư","hộ chiếu","thẻ học sinh","chứng minh thư","đăng ký","đăng kí"]),
    ("emergency", ["cấp cứu","tai nạn","cháy","sự cố","khẩn cấp","112","119","báo cháy","kêu cứu","khiếu nại","cứu thương","hoả hoạn"]),
    ("culture",   ["lễ hội","văn hoá","phong tục","truyền thống","đền","chùa","tết","lễ","hàn quốc","tiếng hàn quốc","áo hanbok","kim chi"]),
    ("direction", ["bên phải","bên trái","trên","dưới","trong","ngoài","trước mặt","phía sau","đông","tây","nam","bắc","phía","phía trước","bên","phía dưới","trên cao","hướng","vị trí","đối diện","đối","phía bên"]),
    ("emotion",   ["vui","buồn","giận","sợ","thích","ghét","yêu","hận","mệt","khó chịu","hạnh phúc","cô đơn","lo lắng","tâm trạng","cảm xúc","vui vẻ","tươi cười","rảnh rỗi","căng thẳng","tin tưởng","hài lòng","nhớ nhà","bực mình","cảm giác","khoái","chán nản","bị căng thẳng","khốn khổ"]),
    ("action",    ["đi","chạy","học","mở","đóng","viết","đọc","gọi","làm","nói","nghe","nhìn","gặp","cho","lấy","mang","để","đặt","ngồi","đứng","nằm","ngủ","dậy","rửa","tắm","chải","đánh","đeo","cởi","mặc","lau","quét","lau dọn","tập trung","đến nơi","đi qua","đi vào","đi ra","trở về","ra về","lừa","đập","đánh răng","xé rách","cắt","dán","vẽ","phun","tưới","chăm sóc","kiểm tra","tìm","đợi","chờ","đặt hàng","kết thúc","bắt đầu","tiếp tục","hoãn","huỷ","thử","luyện tập","tập luyện","rời","đi qua đường","đi xuống","đi lên","chế tạo","đào tạo","vận chuyển","vận hành","vận động","chuyển nhà","chuyển","đề xuất","hỏi","trả lời","đáp","mời","chấp nhận","từ chối","đồng ý","bàn bạc","thảo luận","giải thích","giới thiệu","kể","gửi","nhận","biết","quên","nhớ","hiểu","cảm ơn","xin","đăng kí","đăng ký","mượn","trả","giao hàng","đặt hàng","chế biến","sản xuất","đảo","đào","trồng","giặt","là","ủi","bị","dạy","chỉ bảo","làm việc","trao đổi","đổi"]),
    ("adjective", ["đẹp","xấu","to","nhỏ","cao","thấp","sạch","bẩn","mới","cũ","nhanh","chậm","dài","ngắn","sáng","tối","mạnh","yếu","rộng","hẹp","dày","mỏng","đầy","trống","đẹp đẽ","xấu xí","tốt","tệ","khoẻ mạnh","ốm yếu","thông minh","ngu ngốc","lười","chăm chỉ","trung thực","nhẹ","nặng","rẻ","đắt","khô","ướt","tiện lợi","bất tiện","có ích","vô ích","chật","rộng rãi","vừa","nóng bức","lạnh lẽo","khít","tinh tế","có hại","có lợi","bình thường","đặc biệt","tuyệt đối","tương đối","chính xác","sai","đúng","tiện nghi","thoải mái","nhất","đầu tiên","cuối cùng","cần thiết","không cần","tốt nhất","u ám","trong","ngoài","trong vắt","tin cậy","bí mật","công khai","quan trọng","đặc","mới mẻ","sang trọng","đẹp trai","xinh","xinh đẹp","đẹp lão","khôn","ngu","đần"]),
    ("sports",    ["bóng","chạy bộ","tập thể dục","thể thao","vận động viên","bơi","leo núi","đạp xe","đá bóng","bóng đá","bóng rổ","bóng chuyền","bóng bàn","cầu lông","tennis","yoga","võ","võ thuật","thi đấu","sân vận động","giày thể thao","chơi bóng bàn"]),
    ("location",  ["nơi","chỗ","gần","xa","đây","đó","kia","nhà ga","sân","hồ","biển","núi","công viên","địa điểm","địa chỉ","khu vực","khu vực cấm","vùng","trạm","bưu điện","trường học","trường","ngân hàng","đại sứ quán","khu phố","trung tâm","đầu phố","ngõ hẻm","ngõ","cầu","hầm","ngầm","tầng hầm","đồng cỏ","đồng ruộng","cánh đồng","rừng","mỏ","quán","đầm","lùm cây","bến cảng"]),
]

def assign_topic(vi: str) -> str:
    v = vi.lower()
    v_stripped = strip_accents(v)
    for topic_id, keywords in TOPIC_KEYWORDS:
        for kw in keywords:
            # Word boundary match để tránh substring match (ví dụ "an" trong "hang")
            pattern = r'(?<![a-zA-ZÀ-ỹ])' + re.escape(kw) + r'(?![a-zA-ZÀ-ỹ])'
            if re.search(pattern, v):
                return topic_id
            if len(kw) >= 4:  # diacritic-free fallback chỉ cho keyword dài
                pattern2 = r'(?<![a-zA-Z])' + re.escape(strip_accents(kw)) + r'(?![a-zA-Z])'
                if re.search(pattern2, v_stripped):
                    return topic_id
    return "action"

def cap_first(s: str) -> str:
    s = s.strip()
    return s[0].upper() + s[1:] if s else s

# ─────────────────────────────────────────────────────────────────────────────
#  OCR pipeline
# ─────────────────────────────────────────────────────────────────────────────
HANGUL_RE = re.compile(r'[가-힣]')
NUMBER_RE = re.compile(r'^\d{1,4}$')
# Vietnamese characters: ASCII + Vietnamese diacritics
VI_OK_RE = re.compile(r'^[A-Za-zÀ-ỹ0-9\s,\.\(\)\-/:;\?\!]+$')

# Map mỗi ảnh → (số_bắt_đầu, số_kết_thúc) trong dataset 1000-từ
# Đếm từ inspect ban đầu, mỗi cột dọc = 45-47 hàng, hàng có 2 entry (trái + phải)
IMAGE_RANGES = {
    "1":  (1,    90),
    "8":  (91,   184),
    "7":  (185,  278),
    "11": (279,  370),
    "10": (371,  464),
    "6":  (465,  558),
    "9":  (559,  652),
    "5":  (653,  746),
    "2":  (747,  840),
    "4":  (841,  934),
    "3":  (935,  1000),
}

# Khởi tạo easyocr 1 lần (lazy)
_easy_reader = None
def easy_reader():
    global _easy_reader
    if _easy_reader is None:
        print("Loading easyocr (vi+en)...", flush=True)
        _easy_reader = easyocr.Reader(['vi','en'], gpu=False, verbose=False)
    return _easy_reader

async def winocr_korean(img: Image.Image):
    """Trả về list dict {text, x, y, w, h} chỉ chứa Hangul."""
    res = await winocr.recognize_pil(img, 'ko-KR')
    out = []
    for line in res.lines:
        for w in line.words:
            t = w.text.strip()
            if not HANGUL_RE.search(t):
                continue
            r = w.bounding_rect
            out.append({
                'text': t, 'x': r.x, 'y': r.y, 'w': r.width, 'h': r.height,
                'cx': r.x + r.width/2, 'cy': r.y + r.height/2, 'src': 'ko'
            })
    return out

def easy_vi(img: Image.Image):
    """Trả về list dict {text, x, y, w, h} chứa Vietnamese + số."""
    reader = easy_reader()
    arr = np.array(img)
    results = reader.readtext(arr, detail=1, paragraph=False)
    out = []
    for bbox, text, conf in results:
        t = text.strip()
        if not t:
            continue
        if HANGUL_RE.search(t):  # skip Hangul (winocr lo)
            continue
        # bbox = [[x1,y1],[x2,y2],[x3,y3],[x4,y4]] in clockwise order
        xs = [p[0] for p in bbox]; ys = [p[1] for p in bbox]
        x, y = min(xs), min(ys)
        w_, h_ = max(xs)-x, max(ys)-y
        out.append({
            'text': t, 'x': x, 'y': y, 'w': w_, 'h': h_,
            'cx': x + w_/2, 'cy': y + h_/2, 'src': 'vi'
        })
    return out

def cluster_rows(words, y_tol=12):
    """Gom các word có cy gần nhau thành 1 hàng."""
    sorted_w = sorted(words, key=lambda w: w['cy'])
    rows = []
    for w in sorted_w:
        if rows and abs(w['cy'] - sum(x['cy'] for x in rows[-1])/len(rows[-1])) < y_tol:
            rows[-1].append(w)
        else:
            rows.append([w])
    return rows

def split_columns(row_words, img_width):
    """Tách word của 1 hàng thành cột trái/phải theo x."""
    mid = img_width / 2
    left = sorted([w for w in row_words if w['cx'] < mid], key=lambda w: w['x'])
    right = sorted([w for w in row_words if w['cx'] >= mid], key=lambda w: w['x'])
    return left, right

def is_artifact_token(t: str) -> bool:
    """Phát hiện token rác (Hangul đọc nhầm thành Latin bởi easyocr vi+en)."""
    t = t.strip()
    if not t:
        return True
    if re.match(r'^[^\w]+$', t):
        return True
    # Digit + chữ xen kẽ ("Z4", "281z19", "z2lzz")
    if re.search(r'[a-zA-Z][0-9]|[0-9][a-zA-Z]', t):
        return True
    # Token không có nguyên âm Latin/Việt và độ dài >= 2 (rác)
    if len(t) >= 2 and not re.search(r'[aeiouyAEIOUYÀ-ỹ]', t):
        return True
    has_diacritic = bool(re.search(r'[À-ỹ]', t))
    # Hỗn hợp hoa-thường không có dấu Việt → giống Korean misread
    if not has_diacritic and re.search(r'[A-Z]', t) and re.search(r'[a-z]', t):
        # ngoại trừ token bắt đầu bằng UpperCase (acceptable cho từ đầu câu)
        # nhưng nếu có ≥ 1 chữ hoa giữa từ → artifact
        if re.search(r'[a-z][A-Z]', t):
            return True
        # bắt đầu với upper, độ dài 2-6, không dấu → khả năng artifact cao
        if 2 <= len(t) <= 6:
            return True
    # Ký tự lạ
    if re.search(r'[@\[\]{}|`~^]', t):
        return True
    # Tỷ lệ nguyên âm thấp (rác Korean)
    vowels = len(re.findall(r'[aeiouyAEIOUYÀ-ỹ]', t))
    if len(t) >= 4 and vowels / len(t) < 0.20:
        return True
    return False

def extract_entry(words):
    """Từ list word trong 1 cột → (korean, vietnamese). KHÔNG dùng OCR num."""
    if not words:
        return None, None
    korean_parts = []
    viet_parts = []
    seen_korean = False
    for w in words:
        t = w['text'].strip()
        if not t:
            continue
        # Bỏ số thứ tự đầu hàng
        if NUMBER_RE.match(t) and not seen_korean:
            continue
        if HANGUL_RE.search(t):
            korean_parts.append(t)
            seen_korean = True
            continue
        # Sau Korean → Vietnamese
        if is_artifact_token(t):
            continue
        # Số xen giữa Korean-Vietnamese cũng có thể là rác
        if NUMBER_RE.match(t) and seen_korean and not viet_parts:
            continue
        viet_parts.append(t)

    # Clean Korean: chỉ giữ Hangul + dấu cách
    korean = ''.join(korean_parts)
    korean = ''.join(ch for ch in korean if 0xAC00 <= ord(ch) <= 0xD7A3 or ch == ' ').strip()
    # Korean có thể bị thêm 1-2 ký tự nhiễu cuối → cắt ngắn nếu có double-character anomaly
    # (tạm thời giữ nguyên, vì hard to detect)

    vietnamese = ' '.join(viet_parts).strip()
    vietnamese = re.sub(r'^[\s,;.\-]+|[\s,;]+$', '', vietnamese)
    # Strip "I" prefix khi đứng trước chữ thường (OCR đọc "1" hoặc separator thành "I")
    vietnamese = re.sub(r'^I(?=[a-zđàáảãạăâèéẻẽẹêìíỉĩịòóỏõọôơùúủũụưỳýỷỹỵ])', '', vietnamese)
    # Replace underscores with spaces (OCR đôi khi cho "Gia_súc")
    vietnamese = vietnamese.replace('_', ' ')
    # Strip rác đơn giản ở đầu: 1-2 ký tự không phải chữ Việt
    vietnamese = re.sub(r'^[A-Z]{1,3}(?=\s)', '', vietnamese).strip()
    return korean, vietnamese

async def process_image(path: Path):
    img = Image.open(path).convert('RGB')
    # Upscale 2x để OCR ăn font nhỏ tốt hơn
    img_up = img.resize((img.width*2, img.height*2), Image.LANCZOS)
    W = img_up.width
    ko_words = await winocr_korean(img_up)
    vi_words = easy_vi(img_up)
    words = ko_words + vi_words
    rows = cluster_rows(words, y_tol=28)  # tol scale lên cùng ảnh

    img_key = path.stem
    if img_key not in IMAGE_RANGES:
        print(f"  WARN: no range for {img_key}", flush=True)
        return []
    start, end = IMAGE_RANGES[img_key]
    total_entries = end - start + 1
    n_rows_expected = (total_entries + 1) // 2

    valid_rows = []
    for r in rows:
        all_text = ''.join(w['text'] for w in r)
        if '1000' in all_text and 'EPS' in all_text:
            continue
        if not any(HANGUL_RE.search(w['text']) for w in r):
            continue
        valid_rows.append(r)

    if len(valid_rows) > n_rows_expected:
        valid_rows = valid_rows[:n_rows_expected]

    entries = []
    for row_idx, row_words in enumerate(valid_rows):
        left, right = split_columns(row_words, W)
        ko_l, vi_l = extract_entry(left)
        ko_r, vi_r = extract_entry(right)
        n_left = start + row_idx
        n_right = start + n_rows_expected + row_idx
        # Yêu cầu Vietnamese có ít nhất 2 ký tự và 1 nguyên âm
        def vi_ok(v):
            return v and len(v) >= 2 and bool(re.search(r'[aeiouyAEIOUYÀ-ỹ]', v))
        if ko_l and vi_ok(vi_l):
            entries.append((n_left, ko_l, vi_l))
        if ko_r and vi_ok(vi_r) and n_right <= end:
            entries.append((n_right, ko_r, vi_r))
    return entries

async def main():
    all_entries = {}
    for img_path in sorted(SRC_DIR.glob('*.jpg'), key=lambda p: int(p.stem)):
        print(f"OCR {img_path.name}...", flush=True)
        entries = await process_image(img_path)
        with open(DEBUG_DIR / f"{img_path.stem}_parsed.txt", 'w', encoding='utf-8') as f:
            for n, k, v in sorted(entries, key=lambda x: x[0]):
                f.write(f"{n}\t{k}\t{v}\n")
        for n, k, v in entries:
            if n not in all_entries:
                all_entries[n] = (k, v)
        print(f"  -> {len(entries)} entries (total unique: {len(all_entries)})", flush=True)

    with open(OUT_CSV, 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        w.writerow(['korean','vietnamese','reading','topic_id','level','example','example_vi'])
        for n in sorted(all_entries):
            ko, vi = all_entries[n]
            vi_cap = cap_first(vi)
            r = romanize(ko)
            topic = assign_topic(vi_cap)
            w.writerow([ko, vi_cap, r, topic, 'basic', '', ''])
    print(f"\nWrote {len(all_entries)} rows -> {OUT_CSV}")

if __name__ == '__main__':
    asyncio.run(main())
