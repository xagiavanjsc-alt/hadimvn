"""Upload Phan_047.md len Supabase, bat dau tu ID 961"""
import os, sys, logging
sys.path.insert(0, os.path.dirname(__file__))
from upload_phan005 import (
    extract_slug, extract_meaning_vn, extract_examples,
    extract_related, extract_mnemonic, extract_breakdown,
    parse_md_file, upload_to_supabase,
    get_existing_entries, check_duplicates_before_upload
)

FILE_INPUT = os.path.join(os.path.dirname(__file__), "fix", "Phan_047.md")
START_ID = 961

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    entries = parse_md_file(FILE_INPUT)
    logger.info(f"Da doc {len(entries)} tu tu {FILE_INPUT}")

    existing_slugs, existing_hangul = get_existing_entries()
    ok_entries, skipped = check_duplicates_before_upload(entries, existing_slugs, existing_hangul)
    if skipped:
        for hangul, reason in skipped:
            logger.warning(f"BO QUA: {hangul} - {reason}")
    logger.info(f"Upload {len(ok_entries)} tu (bo qua {len(skipped)} trung)")

    success_count = 0
    for idx, entry in enumerate(ok_entries):
        id = START_ID + idx
        hangul = entry['hangul']
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
            success_count += 1
            logger.info(f"Da upload: {hangul} ({id})")
        else:
            logger.error(f"Upload that bai: {hangul}")
    logger.info(f"\nHoan thanh! Da upload {success_count}/{len(ok_entries)} tu")

if __name__ == "__main__":
    main()
