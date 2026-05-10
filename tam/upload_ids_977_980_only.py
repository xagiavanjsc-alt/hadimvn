"""Upload only IDs 977, 980 from Phan_047.md to Supabase"""
import os, sys, logging
sys.path.insert(0, os.path.dirname(__file__))
from upload_phan005 import (
    extract_slug, extract_meaning_vn, extract_examples,
    extract_related, extract_mnemonic, extract_breakdown,
    parse_md_file, upload_to_supabase
)

FILE_INPUT = os.path.join(os.path.dirname(__file__), "fix", "Phan_047.md")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    entries = parse_md_file(FILE_INPUT)
    logger.info(f"Da doc {len(entries)} tu tu {FILE_INPUT}")

    # Upload only 백혈구 (ID 977) and 백화점 (ID 980)
    target_hanguls = ["백혈구", "백화점"]
    target_ids = {"백혈구": 977, "백화점": 980}

    for entry in entries:
        hangul = entry['hangul']
        if hangul in target_hanguls:
            id = target_ids[hangul]
            hanja = entry['hanja']
            raw = entry['raw']
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
                logger.info(f"Da upload: {hangul} ({id})")
            else:
                logger.error(f"Upload that bai: {hangul}")
    logger.info(f"\nHoan thanh!")

if __name__ == "__main__":
    main()
