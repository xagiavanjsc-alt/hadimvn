"""Upload only ID 692 (대가족) to Supabase"""
import os, sys, logging
sys.path.insert(0, os.path.dirname(__file__))
from upload_phan005 import (
    extract_slug, extract_meaning_vn, extract_examples,
    extract_related, extract_mnemonic, extract_breakdown,
    parse_md_file, upload_to_supabase
)

FILE_INPUT = os.path.join(os.path.dirname(__file__), "fix", "Phan_034.md")
TARGET_ID = 692
TARGET_HANGUL = "대가족"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    entries = parse_md_file(FILE_INPUT)
    logger.info(f"Da doc {len(entries)} tu tu {FILE_INPUT}")

    # Find the target entry
    target_entry = None
    for entry in entries:
        if entry['hangul'] == TARGET_HANGUL:
            target_entry = entry
            break

    if not target_entry:
        logger.error(f"Khong tim thay {TARGET_HANGUL} trong file")
        return

    hangul = target_entry['hangul']
    hanja = target_entry['hanja']
    raw = target_entry['raw']

    data = {
        'id': TARGET_ID,
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
        logger.info(f"Da upload: {hangul} ({TARGET_ID})")
    else:
        logger.error(f"Upload that bai: {hangul}")

if __name__ == "__main__":
    main()
