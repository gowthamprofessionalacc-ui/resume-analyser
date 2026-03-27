import pdfplumber
import PyPDF2
import io
import re


class PDFParser:
    def extract_text(self, file_bytes: bytes) -> str:
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                pages = []
                for page in pdf.pages:
                    text = page.extract_text(x_tolerance=2, y_tolerance=2)
                    if text:
                        pages.append(text)
                raw = "\n".join(pages)
                return self._clean(raw)
        except Exception:
            return self._fallback_extract(file_bytes)

    def _fallback_extract(self, file_bytes: bytes) -> str:
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return self._clean(text)

    def _clean(self, text: str) -> str:
        text = text.replace("\x00", "")
        text = re.sub(r"[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]", "", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[ \t]{2,}", " ", text)
        text = text.replace("\u2018", "'").replace("\u2019", "'")
        text = text.replace("\u201c", '"').replace("\u201d", '"')
        text = text.replace("\u2013", "-").replace("\u2014", "--")
        return text.strip()

    def estimate_quality(self, text: str) -> dict:
        word_count = len(text.split())
        has_email = bool(
            re.search(
                r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", text
            )
        )
        has_phone = bool(
            re.search(r"[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]", text)
        )
        has_sections = any(
            kw in text.lower()
            for kw in ["experience", "education", "skills", "work history"]
        )
        return {
            "word_count": word_count,
            "has_email": has_email,
            "has_phone": has_phone,
            "has_sections": has_sections,
            "is_valid": word_count > 100 and has_sections,
        }
