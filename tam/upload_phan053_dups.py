"""Upload 2 entries trung slug tu Phan_053: 지도(指導) va 지원(志願)"""
import os, sys, logging
sys.path.insert(0, os.path.dirname(__file__))
from upload_phan005 import (
    extract_meaning_vn, extract_examples,
    extract_related, extract_mnemonic, extract_breakdown,
    upload_to_supabase
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

RAW_JIDO_CHIDAO = """## 지도 (指導)

1. GIẢI NGHĨA: Nghĩa tiếng Việt là "chỉ đạo". Gốc Hán "指" (chỉ) nghĩa là chỉ ra, trỏ vào, "導" (đạo) nghĩa là dẫn dắt, hướng dẫn.

2. 6 VÍ DỤ THỰC CHIẾN:
+ Hàn: 선생님이 학생들을 지도합니다.
+ Bồi: seon-saeng-nim-i hak-saeng-deul-eul ji-do-hab-ni-da
   + Việt: Giáo viên chỉ đạo học sinh.

+ Hàn: 그 회사는 전문가의 지도를 받았습니다.
+ Bồi: geu hoe-sa-neun jeon-mun-ga-ui ji-do-reul bad-at-seum-ni-da
   + Việt: Công ty đó đã nhận được sự chỉ đạo từ chuyên gia.

+ Hàn: 코치의 탁월한 지도 덕분에 팀이 승리했습니다.
+ Bồi: ko-chi-ui tak-wol-han ji-do deok-bun-e tim-i seung-ri-haet-seum-ni-da
   + Việt: Nhờ sự chỉ đạo xuất sắc của huấn luyện viên, đội đã chiến thắng.

+ Hàn: 프로젝트를 성공적으로 지도해 주셔서 감사합니다.
+ Bồi: peu-ro-jek-teu-reul seong-gong-jeok-eu-ro ji-do-hae ju-syeo-seo gam-sa-hab-ni-da
   + Việt: Cảm ơn vì đã chỉ đạo dự án một cách thành công.

+ Hàn: 정부의 새로운 정책 지도가 필요합니다.
+ Bồi: jeong-bu-ui sae-ro-un jeong-chaek ji-do-ga pil-yo-hab-ni-da
   + Việt: Cần có sự chỉ đạo chính sách mới từ chính phủ.

+ Hàn: 그 분야에서 그의 지도력은 매우 존경받습니다.
+ Bồi: geu bun-ya-e-seo geu-ui ji-do-ryeok-eun mae-u jon-gyeong-bat-seum-ni-da
   + Việt: Khả năng chỉ đạo của ông ấy trong lĩnh vực đó rất được kính trọng.

3. 4 TỪ LIÊN QUAN GỐC HÁN:
   - 지시 (指示): Chỉ thị, hướng dẫn.
   - 교육 (教育): Giáo dục, đào tạo.
   - 훈련 (訓練): Huấn luyện, rèn luyện.
   - 관리 (管理): Quản lý, giám sát.

4. MẸO NHỚ: Hãy nghĩ đến một "vị chỉ huy" (지휘관) đang dùng ngón tay "chỉ" (指) vào con đường "đạo" (導) cần đi để dẫn dắt mọi người. "Chỉ đạo" là vừa chỉ ra, vừa dẫn đường.
"""

RAW_JIWON_CHINGUYEN = """## 지원 (志願)

1. GIẢI NGHĨA: Nghĩa tiếng Việt là "Tự nguyện, Ứng tuyển". Gốc Hán "志" (chí) nghĩa là chí hướng, "願" (nguyện) nghĩa là nguyện vọng.

2. 6 VÍ DỤ THỰC CHIẾN:
+ Hàn: 봉사 활동에 지원했습니다.
+ Bồi: bong-sa hwal-dong-e ji-won-haet-sseum-ni-da
   + Việt: Tôi đã tình nguyện tham gia hoạt động tình nguyện.

+ Hàn: 그 회사에 지원서를 냈어요.
+ Bồi: keu hoe-sa-e ji-won-seo-reul nae-sseo-yo
   + Việt: Tôi đã nộp đơn ứng tuyển vào công ty đó.

+ Hàn: 자원봉사자로 지원하고 싶어요.
+ Bồi: ja-won-bong-sa-ja-ro ji-won-ha-go si-peo-yo
   + Việt: Tôi muốn đăng ký làm tình nguyện viên.

+ Hàn: 많은 사람들이 혈액 기증에 자발적으로 지원했다.
+ Bồi: ma-neun sa-ram-deu-ri hyeo-raek gi-jeung-e ja-bal-jeo-geu-ro ji-won-haet-da
   + Việt: Nhiều người đã tự nguyện tham gia hiến máu.

+ Hàn: 장학금에 지원하려면 서류를 준비하세요.
+ Bồi: jang-hak-geu-me ji-won-ha-ryeo-myeon seo-ryu-reul jun-bi-ha-se-yo
   + Việt: Nếu muốn ứng tuyển học bổng, hãy chuẩn bị hồ sơ.

+ Hàn: 그는 군대에 지원병으로 갔다.
+ Bồi: keu-neun gun-dae-e ji-won-byeong-eu-ro gat-da
   + Việt: Anh ấy đã đi nghĩa vụ quân sự theo hình thức tình nguyện.

3. 4 TỪ LIÊN QUAN GỐC HÁN:
   - 지원서 (志願書): Đơn ứng tuyển, đơn xin tình nguyện.
   - 자원 (自願): Tự nguyện, tự nguyện.
   - 희망 (希望): Hy vọng, nguyện vọng.
   - 신청 (申請): Đăng ký, thỉnh cầu, đơn xin.

4. MẸO NHỚ: Hãy nhớ "지원" (ji-won) nghe giống "chí nguyện" trong tiếng Việt, đều nói về ý chí và nguyện vọng tự nguyện làm một việc gì đó.
"""

ENTRIES = [
    {'id': 1106, 'hangul': '지도', 'hanja': '指導', 'slug': 'ji-do-2', 'raw': RAW_JIDO_CHIDAO},
    {'id': 1107, 'hangul': '지원', 'hanja': '志願', 'slug': 'ji-won-2', 'raw': RAW_JIWON_CHINGUYEN},
]

def main():
    success = 0
    for entry in ENTRIES:
        raw = entry['raw']
        data = {
            'id': entry['id'],
            'hangul': entry['hangul'],
            'hanja': entry['hanja'],
            'slug': entry['slug'],
            'meaning_vn': extract_meaning_vn(raw),
            'hanja_breakdown': extract_breakdown(raw, entry['hanja']),
            'examples': extract_examples(raw),
            'related_words': extract_related(raw),
            'mnemonic': extract_mnemonic(raw),
            'raw': raw
        }
        if upload_to_supabase(data):
            success += 1
            logger.info(f"Da upload: {entry['hangul']} ({entry['hanja']}) slug={entry['slug']} id={entry['id']}")
        else:
            logger.error(f"Upload that bai: {entry['hangul']} ({entry['hanja']})")
    logger.info(f"Hoan thanh! {success}/{len(ENTRIES)}")

if __name__ == "__main__":
    main()
