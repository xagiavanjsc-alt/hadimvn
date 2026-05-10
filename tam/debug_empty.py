"""Debug cac tu co breakdown rong"""
import os, sys, re
sys.path.insert(0, os.path.dirname(__file__))
from upload_phan005 import extract_breakdown, parse_md_file

files = [
    ("fix/Phan_001.md", ['가설']),
    ("fix/Phan_002.md", ['각론', '각별', '간식']),
    ("fix/Phan_004.md", ['건의', '경기']),
]

for fname, words in files:
    fpath = os.path.join(os.path.dirname(__file__), fname)
    entries = parse_md_file(fpath)
    for e in entries:
        if e['hangul'] in words:
            raw = e['raw']
            hanja = e['hanja']
            # Show GIAI NGHIA line
            for line in raw.split('\n'):
                if 'GIẢI NGHĨA' in line:
                    print(f"\n=== {e['hangul']} ({hanja}) ===")
                    print(f"  RAW: {line.strip()}")
                    bd = extract_breakdown(raw, hanja)
                    print(f"  BD:  {bd}")
                    break
