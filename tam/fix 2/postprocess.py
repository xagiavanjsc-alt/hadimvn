# -*- coding: utf-8 -*-
"""
Post-process eps_1000_vocab.csv v2 - aggressive cleanup.

Strategy:
  1. Strip leading garbage chars (non Vietnamese letters)
  2. Word-by-word fix via dictionary
  3. Dính-chữ splitter (chèn space giữa các từ Việt liền nhau)
  4. Reference dictionary từ existing src/mocks/epsVocabulary.ts (245 pairs)
  5. Trim Korean tail noise
  6. UTF-8 BOM cho Excel
"""
from __future__ import annotations
import csv, re, sys, unicodedata, json
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

HERE = Path(__file__).parent
IN_CSV = HERE / "eps_1000_vocab.csv"
OUT_CSV = HERE / "eps_1000_vocab.csv"

# Load existing vocab cho reference
EXISTING = {}  # korean → vietnamese (known good)
try:
    pairs = json.loads((HERE / "_existing_vocab.json").read_text(encoding='utf-8'))
    for k, v in pairs:
        EXISTING[k.strip()] = v.strip()
except Exception:
    pass

# ─────────────────────────────────────────────────────────────────────────────
#  Dictionary fixes - mở rộng
# ─────────────────────────────────────────────────────────────────────────────
WORD_FIXES = {
    # Y/ỵ vs y
    "ỵ": "y", "Ỵ": "Y", "máỵ": "máy", "Máỵ": "Máy",
    "giàỵ": "giày", "Giàỵ": "Giày",
    "giấỵ": "giấy", "Giấỵ": "Giấy",
    "dạỵ": "dạy", "Dạỵ": "Dạy",
    "chàỵ": "chạy", "Chàỵ": "Chạy",
    # Common diacritic fixes
    "quàn": "quản", "Quàn": "Quản",
    "thuờng": "thường", "Thuờng": "Thường",
    "tuờng": "trường", "Tuờng": "Trường",
    "trừng": "trùng",
    "rut": "rút",
    "khuân": "khuẩn",
    "cơi": "cởi", "Cơi": "Cởi",
    "bão": "bảo",
    "bào": "bảo", "Bào": "Bảo",
    "khoé": "khoẻ", "Khoé": "Khoẻ", "khoe": "khoẻ", "Khoe": "Khoẻ",
    "khoà": "khoả", "khà": "khả", "Khà": "Khả",
    "thé": "thẻ", "Thé": "Thẻ",
    "trài": "trái",
    "ko": "không", "Ko": "Không",
    "lăm": "lắm", "lămn": "lắm", "Lămn": "Lắm",
    "kèo": "kéo",
    "cua": "cửa", "Cua": "Cửa",
    "kiêm": "kiểm", "Kiêm": "Kiểm",
    "kiềm": "kiểm", "Kiềm": "Kiểm",
    "chiu": "chịu",
    "bò": "bỏ",
    "vảt": "vất", "Vảt": "Vất",
    "tánh": "tránh",
    "tánh thai": "tránh thai",
    "ngurời": "người", "Ngurời": "Người",
    "guơng": "gương", "Guơng": "Gương",
    "đièu": "điều",
    "nlur": "như", "Nlur": "Như",
    "bẳng": "băng", "Bẳng": "Băng",
    "iđi": "đi", "Iđi": "Đi",
    "ithé": "thẻ", "Ithé": "Thẻ",
    "iđột": "đột", "Iđột": "Đột",
    "ibị": "bị", "Ibị": "Bị",
    "ithổi": "thổi", "Ithổi": "Thổi",
    "iia": "ia",
    "ám": "u ám",  # "Ám" → "U ám" có thể; nhưng nếu "ám" giữa câu thì khó
    "đg": "đường",
    "ng": "người",
    "dụg": "dụng", "Dụg": "Dụng",
    "đụg": "dụng",
    "hơi âm": "hơi ấm",
    "hơi âp": "hơi ấp",
    "hôi": "hơi",
    "âm": "ấm",  # context-aware: chỉ áp dụng cho "hơi âm" nhưng word_fixes là exact match nên ok
    "âp": "ấp",
    "ạn": "ạn",
    "trảilại": "trả lại",
    "trà lại": "trả lại", "Trà lại": "Trả lại",
    "hoà hoan": "hoả hoạn", "Hoà hoan": "Hoả hoạn",
    "thuôc": "thuốc",
    "ạ": "",  # spurious diacritic
    # đính chữ
    "phòngnghi": "phòng nghỉ", "Phòngnghi": "Phòng nghỉ",
    "phòngngủ": "phòng ngủ", "Phòngngủ": "Phòng ngủ",
    "phònghọp": "phòng họp", "Phònghọp": "Phòng họp",
    "tủlạnh": "tủ lạnh", "Tủlạnh": "Tủ lạnh",
    "máytính": "máy tính", "Máytính": "Máy tính",
    "máybay": "máy bay", "Máybay": "Máy bay",
    "máygiặt": "máy giặt", "Máygiặt": "Máy giặt",
    "tủgiày": "tủ giày", "Tủgiày": "Tủ giày",
    "côngcy": "công ty", "Côngcy": "Công ty",
    "côngnhân": "công nhân", "Côngnhân": "Công nhân",
    "côngtrường": "công trường",
    "côngsở": "công sở",
    "côngviệc": "công việc",
    "côngvịêc": "công việc",
    "đauđầu": "đau đầu",
    "đaubụng": "đau bụng",
    "đaumắt": "đau mắt",
    "đaurăng": "đau răng",
    "đauchân": "đau chân",
    "đaulưng": "đau lưng",
    "thựcdơn": "thực đơn",
    "thựcphẩm": "thực phẩm",
    "trẻem": "trẻ em", "Trẻem": "Trẻ em",
    "trẻnhỏ": "trẻ nhỏ",
    "câuhỏi": "câu hỏi",
    "câuchuyện": "câu chuyện",
    "đầuphố": "đầu phố",
    "đầutiên": "đầu tiên",
    "đầugối": "đầu gối",
    "trườnghọc": "trường học",
    "trườngmầm": "trường mầm",
    "cầuthang": "cầu thang", "Cầuthang": "Cầu thang",
    "cầuthangmáy": "cầu thang máy", "Cầuthangmáy": "Cầu thang máy",
    "khẩutrang": "khẩu trang", "Khẩutrang": "Khẩu trang",
    "biểnbáo": "biển báo", "Biểnbáo": "Biển báo",
    "trạmcứuhoả": "trạm cứu hoả",
    "lò vi sóng": "lò vi sóng",
    "bánhkẹo": "bánh kẹo",
    "bánhmứt": "bánh mứt",
    "bánhmút": "bánh mứt", "Bánhmút": "Bánh mứt",
    "phòngkhách": "phòng khách",
    "phòngtắm": "phòng tắm",
    "phongbi": "phong bì", "Phongbi": "Phong bì",
    "phongbitúi": "phong bì, túi", "Phongbitúi": "Phong bì, túi",
    "linhkiện": "linh kiện", "Linhkiện": "Linh kiện",
    "phụphân": "phụ phẩm", "Phụphân": "Phụ phẩm",
    "bấtđộngsàn": "bất động sản", "Bấtđộngsàn": "Bất động sản",
    "bấtđộngsản": "bất động sản",
    "gấpgáp": "gấp gáp", "Gấpgáp": "Gấp gáp",
    "khẩncấp": "khẩn cấp", "Khẩncấp": "Khẩn cấp",
    "gấpgápkhẩncấp": "gấp gáp, khẩn cấp", "Gấpgápkhẩncấp": "Gấp gáp, khẩn cấp",
    "bịvỡ": "bị vỡ", "Bịvỡ": "Bị vỡ",
    "phânbón": "phân bón", "Phânbón": "Phân bón",
    "giađinh": "gia đình", "Giađinh": "Gia đình",
    "gia đinh": "gia đình",
    "giasúc": "gia súc", "Giasúc": "Gia súc",
    "ytá": "y tá", "Ytá": "Y tá",
    "thinhthoàng": "thỉnh thoảng", "Thinhthoàng": "Thỉnh thoảng",
    "tinhtế": "tinh tế",
    "móntángmiệng": "món tráng miệng",
    "tángmiệng": "tráng miệng",
    "côi tháo": "cởi, tháo",
    "vútbò": "vứt bỏ",
    "vútbỏ": "vứt bỏ",
    "vútbô": "vứt bỏ",
    "vùa": "vừa",
    "vùarồi": "vừa rồi",
    "rồi": "rồi",
    "đèngiao": "đèn giao",
    "phónggiámđốc": "phòng giám đốc",
    "giámđốc": "giám đốc",
    "nhânviên": "nhân viên",
    "trườngphòng": "trưởng phòng",
    "truởng": "trưởng",
    "truong": "trưởng",
    "vận tải": "vận tải",
    "vântải": "vận tải", "Vântải": "Vận tải",
    "vậnchuyển": "vận chuyển",
    "ônhiêmmôitrường": "ô nhiễm môi trường", "Ônhiêmmôitrường": "Ô nhiễm môi trường",
    "ônhiễmmôitrường": "ô nhiễm môi trường",
    "ô nhiêm môi trường": "ô nhiễm môi trường",
    "ô nhiễm môi trường": "ô nhiễm môi trường",
    "băngtài": "băng tải", "Băngtài": "Băng tải",
    "băngchuyền": "băng chuyền",
    "âuolol": "băng tải",
    "đoànkết": "đoàn kết", "Đoànkết": "Đoàn kết",
    "ngàynghỉ": "ngày nghỉ", "Ngàynghỉ": "Ngày nghỉ",
    "hômqua": "hôm qua", "Hômqua": "Hôm qua",
    "hômnay": "hôm nay", "Hômnay": "Hôm nay",
    "hômkia": "hôm kia",
    "ngàymai": "ngày mai", "Ngàymai": "Ngày mai",
    "ngàykia": "ngày kia",
    "ngàytháng": "ngày tháng",
    "côngviệc": "công việc",
    "chuyểnnhà": "chuyển nhà",
    "cuộchọp": "cuộc họp", "Cuộchọp": "Cuộc họp",
    "ngàytắng": "ngày tăng",
    "phương": "phương",
    "lângngcận": "lân cận", "Lângngcận": "Lân cận",
    "trườngmầmnon": "trường mầm non",
    "trườngtiểuhọc": "trường tiểu học",
    "trườngtrunghọc": "trường trung học",
    "trườngđại học": "trường đại học",
    "côngviện": "công viên",
    "côngviên": "công viên",
    "bệnhviện": "bệnh viện",
    "đauốm": "đau ốm",
    "đầuđội": "đầu đội",
    "phòng khám": "phòng khám",
    "đènpin": "đèn pin",
    "đèngiaothông": "đèn giao thông",
}

FULL_FIXES = {
    "Hàng": "Cửa hàng",
    "Cua hàng": "Cửa hàng",
    "Gân": "Gần",
    "Thinhthoàng": "Thỉnh thoảng",
    "Thinh thoàng": "Thỉnh thoảng",
    "Có khà năng": "Có khả năng",
    "Túi sáchcặp sách": "Túi sách, cặp sách",
    "Nhe": "Nhẹ",
    "Đem đi mang đi": "Đem đi, mang đi",
    "Đột ngột bất thình lình": "Đột ngột, bất thình lình",
    "Iđột ngột bất thình lình": "Đột ngột, bất thình lình",
    "Cản cúm": "Cảm cúm",
    "Bị cản cúm": "Bị cảm cúm",
    "Ibị cảm cúm": "Bị cảm cúm",
    "Cái guơng": "Cái gương",
    "Băng": "Băng qua",
    "Bẳng qua": "Băng qua",
    "Đi qua,bãng qua": "Đi qua, băng qua",
    "Khoe mạnh": "Khoẻ mạnh",
    "Khoe manh": "Khoẻ mạnh",
    "Kiêm tra": "Kiểm tra",
    "Kiềm tra": "Kiểm tra",
    "Kiêm tra sức khoẻ": "Kiểm tra sức khoẻ",
    "Kiềm tra sức khoẻ": "Kiểm tra sức khoẻ",
    "Thẻ bào hiểm sức khoe": "Thẻ bảo hiểm sức khoẻ",
    "Ithé bào hiểm sức khoe": "Thẻ bảo hiểm sức khoẻ",
    "5 gọi điện": "Gọi điện",
    "L cắm": "Cắm",
    "L ltẳt": "Tắt",
    "Đirangcài": "Đi ra, vào",
    "Lký túc xá": "Ký túc xá",
    "Lký túcxá": "Ký túc xá",
    "Mhiễn ôituờng": "Ô nhiễm môi trường",
    "Vút bò": "Vứt bỏ",
    "Côi. tháo": "Cởi, tháo",
    "Cơi. tháo": "Cởi, tháo",
    "Bao hộ": "Bảo hộ",
    "Hỡ Đi bộ": "Đi bộ",
    "Dwgcubàohộ": "Dụng cụ bảo hộ",
    "Bịvỡ": "Bị vỡ",
    "Gấpgápkhẩncấp": "Gấp gáp, khẩn cấp",
    "Ngurời lao động": "Người lao động",
    "Bất tiệnkhó chiu": "Bất tiện, khó chịu",
    "Bất tiệnkhó chịu": "Bất tiện, khó chịu",
    "Tàu hoà": "Tàu hoả",
    "Hoà hoan": "Hoả hoạn",
    "Phongbitúi": "Phong bì, túi",
    "Phụphân linhkiện": "Phụ phẩm, linh kiện",
    "Bấtđộngsàn": "Bất động sản",
    "Bấtđộngsản": "Bất động sản",
    "Cấmđi bộ qua đường": "Cấm đi bộ qua đường",
    "Móntángmi ệng": "Món tráng miệng",
    "Móntá ngmiệng": "Món tráng miệng",
    "Hot": "Học",
    "HEL học": "Học",
    "Olz mẹ": "Mẹ",
    "Oldy me": "Mẹ",
    "Mne": "Mẹ",
    "Ol z hôm qua": "Hôm qua",
    "Olz hôm qua": "Hôm qua",
    "Nlur thế nào?": "Như thế nào?",
    "Nlur thế nào": "Như thế nào",
    "Ơ đâu": "Ở đâu",
    "Phòng nghi": "Phòng nghỉ",
    "Cái ghế dài": "Cái ghế dài",
    "Ad to lớn": "To lớn",
    "Re": "Rẻ",
    "Sờ": "Sợ",
    "Nho": "Nhỏ",
    "Vi rut": "Vi rút",
    "Vi rut, vi khuân": "Vi rút, vi khuẩn",
    "Buổi trua": "Buổi trưa",
    "Dầu hoà": "Dầu hoả",
    "Hoà khí": "Hoả khí",
    "Hoà khí, lửa": "Hoả khí, lửa",
    "Cửa ra": "Cửa ra vào",
    "Đỗ": "Đỗ xe",
    "Vảt và": "Vất vả",
    "Vất và": "Vất vả",
    "Game tròchci": "Game, trò chơi",
    "Gmetòchci": "Game, trò chơi",
    "Iua đông": "Mùa đông",
    "Bình thuờng": "Bình thường",
    "Nơi bảo quàn": "Nơi bảo quản",
    "Ám": "U ám",
    "Buổi sáng": "Buổi sáng",
    "Buổi trưa": "Buổi trưa",
    "Buổi tối": "Buổi tối",
    "Khói thuốc": "Khói thuốc",
    "Đến nơi": "Đến nơi",
}

# Korean tail noise - CHỈ noise rõ ràng (không kèm syllable hợp lệ phổ biến)
# Bỏ "이", "기", "지", "에", "리", "여", "어", "는", "라", "한", "일", "은", "을" - những âm tiết này
# rất phổ biến trong từ tiếng Hàn (가까이, 가습기, 강아지, 화요일, ...) — không phải noise!
KOREAN_TAIL_NOISE = {
    "듬", "츤", "돈", "존", "교", "춓", "피", "표", "꽈", "끄", "쬬",
    "춘", "두", "닉", "쳐", "꺼", "랔", "륄",
    "돈돈", "츤돈", "교돈", "춓교", "피돈", "표우다", "춓돈", "춓교돈",
    "을우", "츤츤", "교츤", "꽈우", "꽈피", "끄두", "춘우", "닉꽈",
    "춘교", "츤한",
}

def trim_korean_noise(ko: str) -> str:
    """Bỏ Hangul rác ở cuối. Thử các suffix dài → ngắn."""
    if len(ko) <= 2:
        return ko
    # Nếu từ này có trong EXISTING → giữ nguyên
    if ko in EXISTING:
        return ko
    changed = True
    while changed and len(ko) > 2:
        changed = False
        for tail_len in (4, 3, 2, 1):
            if len(ko) > tail_len + 1:
                tail = ko[-tail_len:]
                if tail in KOREAN_TAIL_NOISE:
                    candidate = ko[:-tail_len]
                    # Nếu candidate có trong EXISTING, ưu tiên giữ
                    if candidate in EXISTING:
                        return candidate
                    ko = candidate
                    changed = True
                    break
    return ko

# ─────────────────────────────────────────────────────────────────────────────
#  Vietnamese cleaner
# ─────────────────────────────────────────────────────────────────────────────
VI_LETTER = r'[a-zA-ZđĐàÀáÁảẢãÃạẠăĂâÂèÈéÉẻẺẽẼẹẸêÊìÌíÍỉỈĩĨịỊòÒóÓỏỎõÕọỌôÔơƠùÙúÚủỦũŨụỤưƯỳỲýÝỷỶỹỸỵỴ]'

def clean_prefix(vi: str) -> str:
    """Strip leading garbage. Cẩn thận không xoá single letter là phần Vietnamese hợp lệ (Y, A, ...)."""
    # Strip leading non-letter symbols
    vi = vi.lstrip(' \t,;.:-_*"\'<>[]{}()=#@%/&|`~^+!?')
    # Strip "L " hoặc "I " (single uppercase known artifact)
    vi = re.sub(r'^[LI]\s+(?=' + VI_LETTER + ')', '', vi)
    # Strip digit prefix "5 " (only when followed by lowercase, not "5 phút")
    vi = re.sub(r'^\d\s+(?=[a-zđ])', '', vi)
    # Strip 2-3 char ALL-UPPERCASE artifact rồi space ("HEL", "DkH", "Hỡ" rare uppercase clusters)
    vi = re.sub(r'^[A-Z]{2,5}\s+(?=' + VI_LETTER + ')', '', vi)
    # Strip uppercase mixed prefix có Hangul-like length 4-12 chars rồi space ("Ztolelsk", "Zêzl", "Auolol")
    # Pattern: bắt đầu Z/A/M/D/H + chữ thường + có thể "-" hoặc số xen, rồi space + Vietnamese
    vi = re.sub(r'^[A-Z][a-zêâăôơưđ\-]{2,12}\s+(?=' + VI_LETTER + r'{2,})', '', vi)
    # Strip "2ẵL", "5ẵ", v.v. (số + 1-3 ký tự rồi space)
    vi = re.sub(r'^\d[a-zA-Zẵếềứừ]{1,4}\s+(?=' + VI_LETTER + ')', '', vi)
    # Strip "Hỡ " (single accented char + uppercase + space)
    vi = re.sub(r'^[ẾỀỄỆỚỜỞỠỢỚỔỒỖỘỚỜỞỠỢẤẦẨẪẬẮẰẲẴẶỬỪỮỨỰỲỶỸỴĐ][a-zêâăôơưđ]{0,2}\s+(?=' + VI_LETTER + ')', '', vi)
    return vi.strip()

def fix_vietnamese(vi: str) -> str:
    if not vi:
        return vi
    # Strip prefix garbage
    vi = clean_prefix(vi)
    # Full-string match
    if vi in FULL_FIXES:
        return FULL_FIXES[vi]
    # Word-by-word
    parts = re.split(r'(\s+|[,;.])', vi)
    out = []
    for p in parts:
        if p in WORD_FIXES:
            out.append(WORD_FIXES[p])
        elif p.lower() in WORD_FIXES:
            r = WORD_FIXES[p.lower()]
            if p[:1].isupper():
                r = r[:1].upper() + r[1:]
            out.append(r)
        else:
            out.append(p)
    result = ''.join(out)
    # Sửa "Ỵ"/"ỵ" thành "y"
    result = result.replace('Ỵ', 'Y').replace('ỵ', 'y')
    # Chèn space giữa chữ thường + chữ hoa (dính chữ)
    result = re.sub(r'([a-zđàáảãạăâèéẻẽẹêìíỉĩịòóỏõọôơùúủũụưỳýỷỹỵ])([A-ZĐÀÁẢÃẠĂÂÈÉẺẼẸÊÌÍỈĨỊÒÓỎÕỌÔƠÙÚỦŨỤƯỲÝỶỸỴ])', r'\1 \2', result)
    # Loại bỏ ký tự lạ còn sót
    result = re.sub(r'["#@\[\]{}|`~^=*<>]+', ' ', result)
    # Trim multi-space
    result = re.sub(r'\s+', ' ', result).strip()
    # Trim leading punctuation
    result = re.sub(r'^[,;.:\-_]+\s*', '', result)
    # Capitalize first letter
    if result:
        result = result[:1].upper() + result[1:]
    return result

# ─────────────────────────────────────────────────────────────────────────────
#  Topic + Romanization
# ─────────────────────────────────────────────────────────────────────────────
def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

src = (HERE / "generate_eps_vocab.py").read_text(encoding='utf-8')
m = re.search(r'TOPIC_KEYWORDS\s*=\s*(\[.*?\n\])', src, re.DOTALL)
TOPIC_KEYWORDS = eval(m.group(1)) if m else []

def assign_topic(vi: str) -> str:
    v = vi.lower()
    v_stripped = strip_accents(v)
    for topic_id, keywords in TOPIC_KEYWORDS:
        for kw in keywords:
            pattern = r'(?<![a-zA-ZÀ-ỹ])' + re.escape(kw) + r'(?![a-zA-ZÀ-ỹ])'
            if re.search(pattern, v):
                return topic_id
            if len(kw) >= 4:
                p2 = r'(?<![a-zA-Z])' + re.escape(strip_accents(kw)) + r'(?![a-zA-Z])'
                if re.search(p2, v_stripped):
                    return topic_id
    return "action"

INI = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h']
MED = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i']
FIN_END = ['','k','k','k','n','n','n','t','l','k','m','l','l','l','p','l','m','p','p','t','t','ng','t','t','k','t','p','t']
FIN_LIAISE = {1:('g',''),2:('kk',''),3:('s','k'),4:('n',''),5:('j','n'),6:('','n'),7:('d',''),8:('r',''),9:('g','l'),10:('m','l'),11:('b','l'),12:('s','l'),13:('t','l'),14:('p','l'),15:('','l'),16:('m',''),17:('b',''),18:('s','b'),19:('s',''),20:('ss',''),21:('ng',''),22:('j',''),23:('ch',''),24:('k',''),25:('t',''),26:('p',''),27:('','')}
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

def main():
    rows = []
    with open(IN_CSV, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = list(reader)
    print(f"Loaded {len(rows)} rows")

    fixed = []
    dropped = 0
    for row in rows:
        ko, vi, _, _, level, ex, ex_vi = row
        ko_clean = trim_korean_noise(ko)
        # Nếu Korean có trong EXISTING → dùng Vietnamese đã chuẩn
        if ko_clean in EXISTING:
            vi_clean = EXISTING[ko_clean]
        else:
            vi_clean = fix_vietnamese(vi)

        if not vi_clean.strip() or len(vi_clean) < 2:
            dropped += 1
            continue
        # Drop nếu Vietnamese vẫn còn rất nhiều ký tự lạ (>30% non-Vietnamese)
        non_vi = sum(1 for c in vi_clean if not re.match(VI_LETTER + r'|[\s,;.()\-/0-9]', c))
        if len(vi_clean) > 5 and non_vi / len(vi_clean) > 0.3:
            dropped += 1
            continue

        reading_new = romanize(ko_clean)
        topic_new = assign_topic(vi_clean)
        fixed.append([ko_clean, vi_clean, reading_new, topic_new, level, ex, ex_vi])

    with open(OUT_CSV, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        w.writerow(header)
        for row in fixed:
            w.writerow(row)
    print(f"Wrote {len(fixed)} rows (dropped {dropped}) with UTF-8 BOM -> {OUT_CSV}")

if __name__ == '__main__':
    main()
