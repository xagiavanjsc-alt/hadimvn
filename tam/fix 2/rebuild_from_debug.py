# -*- coding: utf-8 -*-
"""Rebuild eps_1000_vocab.csv từ _ocr_debug/*_parsed.txt — không cần torch/OCR."""
from __future__ import annotations
import csv, re, sys, unicodedata
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

HERE = Path(__file__).parent
DEBUG_DIR = HERE / "_ocr_debug"
RAW_CSV = HERE / "eps_1000_vocab.csv"

# Collect entries
all_entries = {}
for txt in sorted(DEBUG_DIR.glob('*_parsed.txt'), key=lambda p: int(p.stem.split('_')[0])):
    with open(txt, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.rstrip('\n').split('\t')
            if len(parts) != 3: continue
            try: num = int(parts[0])
            except ValueError: continue
            ko, vi = parts[1], parts[2]
            if ko and vi and num not in all_entries:
                all_entries[num] = (ko, vi)

print(f"Loaded {len(all_entries)} entries", flush=True)

# Ghi raw CSV (chưa romanize + chưa assign topic — postprocess sẽ làm)
with open(RAW_CSV, 'w', encoding='utf-8', newline='') as f:
    w = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
    w.writerow(['korean','vietnamese','reading','topic_id','level','example','example_vi'])
    for n in sorted(all_entries):
        ko, vi = all_entries[n]
        w.writerow([ko, vi, '', '', 'basic', '', ''])
print(f"Wrote raw CSV -> {RAW_CSV}")

