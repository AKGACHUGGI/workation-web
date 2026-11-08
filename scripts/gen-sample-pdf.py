"""mock 모드의 PDF 내보내기용 샘플 파일 생성. 사용: python3 scripts/gen-sample-pdf.py public/mock-pdf/sample.pdf"""
import sys

objects = [
    b"<< /Type /Catalog /Pages 2 0 R >>",
    b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>",
]
out = b"%PDF-1.4\n"
offsets = []
for i, body in enumerate(objects, start=1):
    offsets.append(len(out))
    out += f"{i} 0 obj\n".encode() + body + b"\nendobj\n"
xref = len(out)
out += f"xref\n0 {len(objects) + 1}\n".encode() + b"0000000000 65535 f \n"
for off in offsets:
    out += f"{off:010d} 00000 n \n".encode()
out += f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode()

with open(sys.argv[1], "wb") as f:
    f.write(out)
print(f"wrote {sys.argv[1]} ({len(out)} bytes)")
