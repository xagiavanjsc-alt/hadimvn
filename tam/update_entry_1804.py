"""Update entry ID 1804 (우선권) trong Supabase"""
import os, sys, logging
import requests
sys.path.insert(0, os.path.dirname(__file__))
from upload_phan005 import (
    extract_slug, extract_meaning_vn, extract_examples,
    extract_related, extract_mnemonic, extract_breakdown,
    parse_md_file, SUPABASE_URL, SUPABASE_KEY
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def update_entry(id, data):
    """Update entry bằng PATCH"""
    url = f"{SUPABASE_URL}/rest/v1/hanja_pro?id=eq.{id}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json'
    }
    response = requests.patch(url, json=data, headers=headers)
    if response.status_code in [200, 204]:
        return True
    else:
        logger.error(f"Update failed: {response.status_code} - {response.text}")
        return False

def main():
    # Parse lại Phan_087
    FILE_INPUT = os.path.join(os.path.dirname(__file__), "fix", "Phan_087.md")
    entries = parse_md_file(FILE_INPUT)
    
    # Tìm entry 우선권
    target_entry = None
    for entry in entries:
        if entry['hangul'] == '우선권':
            target_entry = entry
            break
    
    if not target_entry:
        logger.error("Khong tim thay entry 우선권")
        return
    
    # Update entry 1804
    id = 1804
    hangul = target_entry['hangul']
    hanja = target_entry['hanja']
    raw = target_entry['raw']
    data = {
        'hanja_breakdown': extract_breakdown(raw, hanja)
    }
    
    logger.info(f"Updating breakdown for {hangul} ({id})...")
    logger.info(f"New breakdown: {data['hanja_breakdown']}")
    
    if update_entry(id, data):
        logger.info(f"Da update thanh cong: {hangul} ({id})")
    else:
        logger.error(f"Update that bai: {hangul}")

if __name__ == "__main__":
    main()
