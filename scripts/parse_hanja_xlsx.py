"""Parse docs/Phan_1.xlsx into structured JSON for hanja_lessons.

Usage:
    python scripts/parse_hanja_xlsx.py

Output: scripts/hanja_phan1.json
"""
import json
import re
from pathlib import Path
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "Phan_1.xlsx"
OUT = ROOT / "scripts" / "hanja_phan1.json"


def parse_section(text: str):
    """Parse the rich content cell into structured fields."""
    result = {
        "meaning_vn": None,
        "hanja_breakdown": [],
        "examples": [],
        "related_words": [],
        "mnemonic": None,
    }
    if not text:
        return result

    # ── 1. GIẢI NGHĨA ──
    m = re.search(r"1\.\s*GIẢI NGHĨA\s*:?\s*(.+?)(?=\n\s*2\.|\Z)", text, re.S)
    if m:
        gi = m.group(1).strip()
        # Try to extract just the meaning before "Phân tích" or "Gốc Hán"
        meaning_m = re.match(r'(?:Nghĩa tiếng Việt[^:]*:\s*)?["\u201C]?([^"\u201D\.]+)["\u201D]?', gi)
        result["meaning_vn"] = (meaning_m.group(1).strip() if meaning_m else gi.split(".")[0]).strip(' "“”.')

        # Extract hanja breakdown like: "可" (가) nghĩa là "có thể"
        for hm in re.finditer(r'["\u201C]([\u4e00-\u9fff])["\u201D]\s*\(([^)]+)\)\s*(?:nghĩa\s*là|là)?\s*["\u201C]?([^"\u201D\.,;]+)["\u201D]?', gi):
            char = hm.group(1)
            reading_part = hm.group(2).strip()
            meaning = hm.group(3).strip(' "“”.,')
            # reading might be "가" or "가, gia" or "가 - khả"
            reading_clean = re.split(r"[,\-–—]", reading_part)[0].strip()
            result["hanja_breakdown"].append({
                "char": char,
                "reading": reading_clean,
                "meaning": meaning,
            })

    # ── 2. VÍ DỤ ──
    m = re.search(r"2\.\s*5?\s*VÍ DỤ[^\n]*\n(.+?)(?=\n\s*3\.|\Z)", text, re.S)
    if m:
        block = m.group(1)
        # Examples come in groups of Hàn / Bồi (optional) / Việt
        # Split by blank line OR by "Hàn:" markers
        chunks = re.split(r"\n\s*\n+", block)
        for chunk in chunks:
            ko = re.search(r"H[àa]n\s*:\s*(.+?)(?=\n|$)", chunk)
            boi = re.search(r"B[ồo]i\s*:\s*(.+?)(?=\n|$)", chunk)
            vi = re.search(r"Việt\s*:\s*(.+?)(?=\n|$)", chunk)
            if ko and vi:
                ex = {
                    "ko": clean_md(ko.group(1).strip()),
                    "vi": clean_md(vi.group(1).strip()),
                }
                if boi:
                    ex["boi"] = clean_md(boi.group(1).strip())
                result["examples"].append(ex)

    # ── 3. TỪ LIÊN QUAN ──
    m = re.search(r"3\.\s*3?\s*TỪ LIÊN QUAN[^\n]*\n(.+?)(?=\n\s*4\.|\Z)", text, re.S)
    if m:
        block = m.group(1)
        # Each line: "   - 고정 (固定): Cố định, không thay đổi (...)."
        for line in block.split("\n"):
            rm = re.search(r"-\s*([\uac00-\ud7af]+)\s*\(([\u4e00-\u9fff]+)\)\s*:?\s*(.+)", line)
            if rm:
                result["related_words"].append({
                    "word": rm.group(1).strip(),
                    "hanja": rm.group(2).strip(),
                    "meaning": rm.group(3).strip(" .,"),
                })

    # ── 4. MẸO NHỚ ──
    m = re.search(r"4\.\s*MẸO NHỚ\s*:?\s*(.+)", text, re.S)
    if m:
        result["mnemonic"] = m.group(1).strip()

    return result


def clean_md(s: str) -> str:
    """Remove markdown bold ** wrappers."""
    return re.sub(r"\*\*([^*]+)\*\*", r"\1", s).strip()


def main():
    wb = openpyxl.load_workbook(SRC, data_only=True)
    ws = wb.active
    rows = []
    for i, row in enumerate(ws.iter_rows(min_row=1, values_only=True), start=1):
        if not row or not row[0]:
            continue
        hangul, hanja, content = row[0], row[1], row[2]
        if not (hangul and hanja and content):
            continue
        parsed = parse_section(content)
        rows.append({
            "id": i,
            "hangul": str(hangul).strip(),
            "hanja": str(hanja).strip(),
            **parsed,
            "raw": content,
        })

    OUT.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[OK] Wrote {len(rows)} entries → {OUT}")
    # Stats
    with_examples = sum(1 for r in rows if r["examples"])
    with_breakdown = sum(1 for r in rows if r["hanja_breakdown"])
    with_related = sum(1 for r in rows if r["related_words"])
    with_mnemonic = sum(1 for r in rows if r["mnemonic"])
    print(f"  examples: {with_examples}/{len(rows)}")
    print(f"  hanja_breakdown: {with_breakdown}/{len(rows)}")
    print(f"  related_words: {with_related}/{len(rows)}")
    print(f"  mnemonic: {with_mnemonic}/{len(rows)}")


if __name__ == "__main__":
    main()
