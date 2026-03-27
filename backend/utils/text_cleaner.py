import re


def truncate_text(text: str, max_chars: int = 4000) -> str:
    if len(text) <= max_chars:
        return text
    return text[:max_chars] + "\n...[truncated]"


def extract_sections(text: str) -> dict[str, str]:
    section_headers = [
        "experience",
        "education",
        "skills",
        "projects",
        "certifications",
        "summary",
        "objective",
        "work history",
        "achievements",
        "publications",
    ]
    sections = {}
    current_section = "header"
    current_content = []

    for line in text.split("\n"):
        line_lower = line.strip().lower()
        matched = False
        for header in section_headers:
            if header in line_lower and len(line.strip()) < 50:
                if current_content:
                    sections[current_section] = "\n".join(current_content)
                current_section = header
                current_content = []
                matched = True
                break
        if not matched:
            current_content.append(line)

    if current_content:
        sections[current_section] = "\n".join(current_content)

    return sections
