"""Fix va upload lai entry ID 1804 (우선권)"""
import os, sys, logging
sys.path.insert(0, os.path.dirname(__file__))
from upload_phan005 import (
    extract_slug, extract_meaning_vn, extract_examples,
    extract_related, extract_mnemonic, extract_breakdown,
    parse_md_file, upload_to_supabase
)
from supabase import create_client

# Supabase config
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    # Xóa entry cũ
    logger.info("Xoa entry ID 1804...")
    supabase.table("vocabulary").delete().eq("id", 1804).execute()
    logger.info("Da xoa entry ID 1804")

    # Parse lại Phan_087
    FILE_INPUT = os.path.join(os.path.dirname(__file__), "fix", "Phan_087.md")
    entries = parse_md_file(FILE_INPUT)
    
    # Tìm entry 우선권 (index 1 vì START_ID=1803)
    target_entry = None
    for entry in entries:
        if entry['hangul'] == '우선권':
            target_entry = entry
            break
    
    if not target_entry:
        logger.error("Khong tim thay entry 우선권")
        return
    
    # Upload lại
    id = 1804
    hangul = target_entry['hangul']
    hanja = target_entry['hanja']
    raw = target_entry['raw']
    data = {
        'id': id,
        'hangul': hangul,
        'hanja': hanja,
        'slug': extract_slug(hangul),
        'meaning_vn': extract_meaning_vn(raw),
        'hanja_breakdown': extract_breakdown(raw, hanja),
        'examples': extract_examples(raw),
        'related_words': extract_related(raw),
        'mnemonic': extract_mnemonic(raw),
        'raw': raw
    }
    if upload_to_supabase(data):
        logger.info(f"Da upload lai: {hangul} ({id})")
    else:
        logger.error(f"Upload that bai: {hangul}")

if __name__ == "__main__":
    main()
