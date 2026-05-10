"""Upload only ID 605 (냉동식품) and 606 (냉동어) to Supabase"""
import os, sys, logging
sys.path.insert(0, os.path.dirname(__file__))
from upload_phan005 import (
    extract_slug, extract_meaning_vn, extract_examples,
    extract_related, extract_mnemonic, extract_breakdown,
    parse_md_file, upload_to_supabase
)

FILE_INPUT = os.path.join(os.path.dirname(__file__), "fix", "Phan_029.md")
TARGET_HANGULS = ["냉동식품", "냉동어"]
TARGET_IDS = {"냉동식품": 605, "냉동어": 606}

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    entries = parse_md_file(FILE_INPUT)
    logger.info(f"Da doc {len(entries)} tu tu {FILE_INPUT}")

    # Find the target entries
    target_entries = []
    for entry in entries:
        if entry['hangul'] in TARGET_HANGULS:
            target_entries.append(entry)

    logger.info(f"Tim thay {len(target_entries)} tu can upload")

    for entry in target_entries:
        hangul = entry['hangul']
        hanja = entry['hanja']
        raw = entry['raw']
        id = TARGET_IDS[hangul]

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

if __name__ == "__main__":
    main()
