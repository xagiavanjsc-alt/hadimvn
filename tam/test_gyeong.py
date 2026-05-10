import re, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from upload_phan005 import extract_breakdown, parse_md_file

entries = parse_md_file(os.path.join(os.path.dirname(__file__), "fix", "Phan_004.md"))
for e in entries:
    if e['hangul'] == '경기':
        raw = e['raw']
        hanja = e['hanja']
        print("RAW line 1:", raw.split('\n')[2])
        print()
        bd = extract_breakdown(raw, hanja)
        print("Breakdown:", bd)
        break
