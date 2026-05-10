"""Upload only IDs 856, 858, 876 from Phan_042.md to Supabase"""
import os, sys, logging
sys.path.insert(0, os.path.dirname(__file__))
from upload_phan005 import (
    extract_slug, extract_meaning_vn, extract_examples,
    extract_related, extract_mnemonic, extract_breakdown,
    parse_md_file, upload_to_supabase
)

FILE_INPUT = os.path.join(os.path.dirname(__file__), "fix", "Phan_042.md")
TARGET_HANGULS = ["무조건", "무책임", "미완성"]
TARGET_IDS = [856, 858, 876]

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    entries = parse_md_file(FILE_INPUT)
    
    success_count = 0
    for target_hangul, target_id in zip(TARGET_HANGULS, TARGET_IDS):
        # Find the entry with target hangul
        target_entry = None
        for entry in entries:
            if entry['hangul'] == target_hangul:
                target_entry = entry
                break
        
        if not target_entry:
            logger.error(f"Khong tim tu {target_hangul} trong file")
            continue
        
        hangul = target_entry['hangul']
        hanja = target_entry['hanja']
        raw = target_entry['raw']
        data = {
            'id': target_id,
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
            success_count += 1
            logger.info(f"Da upload: {hangul} ({target_id})")
        else:
            logger.error(f"Upload that bai: {hangul}")
    
    logger.info(f"\nHoan thanh! Da upload {success_count}/{len(TARGET_IDS)} tu")

if __name__ == "__main__":
    main()
