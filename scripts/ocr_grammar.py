"""
OCR script: Extract text from 300 TOPIK grammar images → CSV for import.
Requires: pip install easyocr pandas
Usage: python scripts/ocr_grammar.py
"""
import os
import re
import json
import pandas as pd
from pathlib import Path

# EasyOCR supports Korean + Vietnamese
import easyocr

reader = easyocr.Reader(['ko', 'vi', 'en'], gpu=True)

IMAGE_DIR = Path(__file__).parent.parent / "docs" / "300 CẤU TRÚC NGỮ PHÁP TIẾNG HÀN TOPIK 1-6"
OUTPUT_CSV = Path(__file__).parent.parent / "data" / "topik_grammar.csv"

def extract_text(image_path):
    """Run OCR on a single image, return concatenated text."""
    results = reader.readtext(str(image_path), detail=0)
    return "\n".join(results)

def parse_grammar(text):
    """
    Parse OCR text into structured grammar data.
    Expected format:
      CẤU TRÚC NGỮ PHÁP TIẾNG HÀN [SƠ CẤP|TRUNG CẤP|CAO CẤP]
      [Pattern]
      [Meaning]
      [Explanation...]
      [Examples...]
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if len(lines) < 3:
        return None

    # Detect level
    level = "intermediate"
    full_text = " ".join(lines)
    if "SƠ CẤP" in full_text:
        level = "beginner"
    elif "CAO CẤP" in full_text:
        level = "advanced"
    elif "TRUNG CẤP" in full_text:
        level = "intermediate"

    # TOPIK level mapping
    topik_level = "TOPIK I" if level == "beginner" else "TOPIK II"

    # Pattern is usually the first line with Korean characters
    pattern = ""
    meaning = ""
    explanation_parts = []
    examples = []

    korean_pattern = re.compile(r'[가-힣]')
    for i, line in enumerate(lines):
        # Skip header lines
        if "CẤU TRÚC" in line or "NGỮ PHÁP" in line or "TIẾNG HÀN" in line:
            continue
        if not pattern and korean_pattern.search(line):
            pattern = line
            continue
        if not meaning and not korean_pattern.search(line) and len(line) < 100:
            meaning = line
            continue
        # Detect example lines (contain both Korean and Vietnamese)
        if korean_pattern.search(line) and any(c in line for c in ['à', 'á', 'ạ', 'ả', 'ã', 'ơ', 'ư', 'ă', 'ê', 'ô', 'đ']):
            # Try to split Korean / Vietnamese
            parts = re.split(r'\s{2,}|(?<=[가-힣])\s+(?=[A-ZĐ])', line, maxsplit=1)
            if len(parts) >= 2:
                examples.append({"korean": parts[0].strip(), "vietnamese": parts[1].strip()})
            else:
                examples.append({"korean": line, "vietnamese": ""})
        else:
            explanation_parts.append(line)

    if not pattern:
        return None

    return {
        "pattern": pattern,
        "meaning": meaning or pattern,
        "level": level,
        "topik_level": topik_level,
        "category": "general",
        "explanation": " ".join(explanation_parts) if explanation_parts else meaning,
        "examples": json.dumps(examples, ensure_ascii=False) if examples else "[]",
        "tags": "{}",
    }

def main():
    images = sorted(IMAGE_DIR.glob("*.jpg"))
    print(f"Found {len(images)} images")

    results = []
    for i, img_path in enumerate(images):
        print(f"[{i+1}/{len(images)}] Processing {img_path.name}...")
        try:
            text = extract_text(img_path)
            parsed = parse_grammar(text)
            if parsed:
                parsed["id"] = img_path.stem
                results.append(parsed)
                print(f"  ✓ {parsed['pattern']} — {parsed['meaning'][:50]}")
            else:
                print(f"  ✗ Could not parse")
        except Exception as e:
            print(f"  ✗ Error: {e}")

    # Save CSV
    df = pd.DataFrame(results)
    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
    print(f"\n✅ Saved {len(results)} grammar patterns to {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
