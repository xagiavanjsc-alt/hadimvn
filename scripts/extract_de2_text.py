"""Extract toàn bộ text từ Đề 2 PDFs để xem nội dung câu hỏi"""
import fitz
from pathlib import Path

DE2_PDF = Path(__file__).parent.parent / "docs" / "de2"

for pdf_path in sorted(DE2_PDF.glob("page_*.pdf")):
    doc = fitz.open(str(pdf_path))
    print(f"\n{'='*60}")
    print(f"  {pdf_path.name}")
    print('='*60)
    for page_i in range(len(doc)):
        text = doc[page_i].get_text()
        if text.strip():
            print(text)
    doc.close()
