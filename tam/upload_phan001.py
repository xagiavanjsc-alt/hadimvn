"""
Upload Phan_001.md len Supabase, bat dau tu ID 22
Slug = phien am tieng Han (SEO-friendly)
Chay: python tam/upload_phan001.py
"""
import re
import logging
import requests
import os
import sys

# Them path de import tu upload_phan005
sys.path.insert(0, os.path.dirname(__file__))
from upload_phan005 import (
    extract_slug, extract_meaning_vn, extract_examples,
    extract_related, extract_mnemonic, extract_breakdown,
    parse_md_file, upload_to_supabase
)

# ================== CAU HINH ==================
FILE_INPUT = os.path.join(os.path.dirname(__file__), "fix", "Phan_001.md")
START_ID = 22

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ================== MAIN ==================
def main():
    try:
        entries = parse_md_file(FILE_INPUT)
        logger.info(f"Da doc {len(entries)} tu tu {FILE_INPUT}")
    except Exception as e:
        logger.error(f"Khong the doc file Markdown: {e}")
        return

    success_count = 0
    for idx, entry in enumerate(entries):
        id = START_ID + idx
        hangul = entry['hangul']
        hanja = entry['hanja']
        raw = entry['raw']
        
        slug = extract_slug(hangul)
        meaning_vn = extract_meaning_vn(raw)
        examples = extract_examples(raw)
        related = extract_related(raw)
        mnemonic = extract_mnemonic(raw)
        breakdown = extract_breakdown(raw, hanja)

        data = {
            'id': id,
            'hangul': hangul,
            'hanja': hanja,
            'slug': slug,
            'meaning_vn': meaning_vn,
            'hanja_breakdown': breakdown,
            'examples': examples,
            'related_words': related,
            'mnemonic': mnemonic,
            'raw': raw
        }

        if upload_to_supabase(data):
            success_count += 1
            logger.info(f"Da upload: {hangul} ({id})")
        else:
            logger.error(f"Upload that bai: {hangul}")

    logger.info(f"\nHoan thanh! Da upload {success_count}/{len(entries)} tu")

if __name__ == "__main__":
    main()
