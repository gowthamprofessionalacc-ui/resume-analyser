import httpx
import json
import re
import os
from models.schemas import SkillProfile, ScoreBreakdown, Suggestion

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL_MAIN = "google/gemini-2.0-flash-001"
MODEL_FAST = "google/gemini-2.0-flash-001"


class AIService:

    def _call(self, prompt: str, model: str = MODEL_MAIN, max_tokens: int = 2000) -> str:
        resp = httpx.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens,
            },
            timeout=60.0,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()

    def extract_skill_profile(self, resume_text: str) -> SkillProfile:
        prompt = f"""You are an expert technical recruiter with 15 years of experience parsing resumes.

Extract the candidate's profile from this resume text. Be conservative — only include skills explicitly mentioned. Do not infer or add skills.

Resume:
---
{resume_text}
---

Respond ONLY with a valid JSON object. No preamble, no explanation, no markdown code fences. Exact format:
{{
  "skills": ["Python", "SQL", "React"],
  "experience_years": 3,
  "domain": "software engineering",
  "education": "B.Tech Computer Science",
  "job_titles": ["Software Engineer", "Backend Developer"]
}}

Rules:
- skills: technical skills, tools, languages, frameworks, platforms, methodologies — NOT soft skills
- experience_years: total professional years, null if student/fresher
- domain: one of: software engineering, data science, product management, design, devops, marketing, finance, other
- job_titles: all past and current titles from the resume
- Return empty arrays if information is missing, never null for array fields"""

        raw = self._call(prompt, model=MODEL_MAIN, max_tokens=1000)
        data = json.loads(self._clean_json(raw))
        # Sanitize AI response - it sometimes returns wrong types
        if isinstance(data.get("education"), list):
            data["education"] = data["education"][0] if data["education"] else None
        if isinstance(data.get("skills"), str):
            data["skills"] = [data["skills"]]
        if isinstance(data.get("job_titles"), str):
            data["job_titles"] = [data["job_titles"]]
        if isinstance(data.get("experience_years"), str):
            try:
                data["experience_years"] = int(data["experience_years"])
            except ValueError:
                data["experience_years"] = None
        return SkillProfile(**data)

    def score_resume(
        self, resume_text: str, skill_profile: SkillProfile
    ) -> tuple[ScoreBreakdown, list[Suggestion]]:
        skills_str = ", ".join(skill_profile.skills[:20])
        prompt = f"""You are a senior resume coach who has reviewed 10,000+ resumes at FAANG and top startups. You give honest, specific, actionable feedback.

Analyze this resume across four dimensions and score each from 0-25 (total 100):

SCORING RUBRIC:
1. Formatting (0-25): Is it ATS-parseable? Clean structure? Consistent fonts/spacing? No tables/images that break ATS parsing?
2. Impact Language (0-25): Does it use action verbs? Quantified achievements (%, $, numbers)? Results-oriented language? No passive voice?
3. ATS Compatibility (0-25): Standard section headers? No headers/footers? Standard date formats? Skills mentioned explicitly (not just implied)?
4. Skills Depth (0-25): Relevant technical skills for the domain? Breadth and depth? Current/modern tech stack?

Domain: {skill_profile.domain}
Key skills found: {skills_str}

Resume:
---
{resume_text[:4000]}
---

Respond ONLY with a valid JSON object, no preamble, no markdown code fences:
{{
  "formatting": 18,
  "impact_language": 14,
  "ats_compatibility": 20,
  "skills_depth": 16,
  "strengths": ["Strong quantified achievements in last role", "Clean ATS-parseable structure", "Modern tech stack"],
  "weaknesses": ["Missing LinkedIn URL", "Objective statement is outdated", "Skills section lacks framework versions"],
  "suggestions": [
    {{
      "category": "Impact Language",
      "original": "Responsible for managing the database",
      "improved": "Architected and optimized PostgreSQL database, reducing query latency by 40% for 2M+ daily users",
      "reason": "Adds ownership verb, quantified outcome, and scale"
    }},
    {{
      "category": "Formatting",
      "original": null,
      "improved": "Add LinkedIn profile URL and GitHub handle to your contact section",
      "reason": "ATS systems and recruiters look for professional presence links"
    }}
  ]
}}

Generate at least 6 suggestions. Mix categories. Be specific — reference actual content from the resume when possible."""

        raw = self._call(prompt, model=MODEL_MAIN, max_tokens=2000)
        data = json.loads(self._clean_json(raw))

        total = (
            data["formatting"]
            + data["impact_language"]
            + data["ats_compatibility"]
            + data["skills_depth"]
        )
        grade = (
            "A"
            if total >= 85
            else "B"
            if total >= 70
            else "C"
            if total >= 55
            else "D"
            if total >= 40
            else "F"
        )

        score = ScoreBreakdown(
            formatting=data["formatting"],
            impact_language=data["impact_language"],
            ats_compatibility=data["ats_compatibility"],
            skills_depth=data["skills_depth"],
            total=total,
            grade=grade,
            strengths=data["strengths"],
            weaknesses=data["weaknesses"],
        )
        suggestions = []
        for s in data.get("suggestions", []):
            # Sanitize: AI sometimes returns None for required string fields
            if not s.get("improved"):
                s["improved"] = s.get("reason") or s.get("original") or "No suggestion provided"
            if not s.get("reason"):
                s["reason"] = "Improves resume quality"
            if not s.get("category"):
                s["category"] = "General"
            suggestions.append(Suggestion(**s))
        return score, suggestions

    def extract_job_skills(self, job_description: str) -> list[str]:
        prompt = f"""Extract ONLY the technical skills, tools, and technologies required or preferred in this job description.
Return a JSON array of strings. Only technical terms — no soft skills, no adjectives.

Job description:
{job_description[:2000]}

Respond ONLY with a JSON array like: ["Python", "AWS", "Docker", "PostgreSQL", "REST APIs"]
No preamble, no explanation, no markdown code fences."""

        raw = self._call(prompt, model=MODEL_FAST, max_tokens=300)
        return json.loads(self._clean_json(raw))

    def _clean_json(self, text: str) -> str:
        # Strip markdown code fences
        text = re.sub(r"^```(?:json)?\s*\n?", "", text)
        text = re.sub(r"\n?\s*```\s*$", "", text)
        text = text.strip()
        # Try to extract JSON object or array from surrounding text
        for start_char, end_char in [('{', '}'), ('[', ']')]:
            start = text.find(start_char)
            if start == -1:
                continue
            depth = 0
            in_string = False
            escape = False
            for i in range(start, len(text)):
                c = text[i]
                if escape:
                    escape = False
                    continue
                if c == '\\':
                    escape = True
                    continue
                if c == '"':
                    in_string = not in_string
                    continue
                if in_string:
                    continue
                if c == start_char:
                    depth += 1
                elif c == end_char:
                    depth -= 1
                    if depth == 0:
                        return text[start:i+1]
        return text
