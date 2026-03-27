from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from services.pdf_parser import PDFParser
from services.ai_service import AIService
from services.job_service import JobService
from services.skill_matcher import SkillMatcher
from services.supabase_service import SupabaseService
from models.schemas import AnalysisResponse, AnalysisResult
import uuid
import asyncio
import traceback
import re
from datetime import datetime


def strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", " ", text).strip()


def match_job_skills(user_skills: list[str], job_text: str) -> dict:
    """
    1. Find ALL tech skills mentioned in the job description (from dictionary)
    2. Check which of those the user HAS (matched) vs DOESN'T have (missing)
    3. Score = matched / total job skills
    """
    from utils.skill_dictionary import extract_skills_from_text, normalize_skill

    # All tech skills found in the job description
    job_skills = extract_skills_from_text(job_text)

    # Also check user skills directly (handles skills not in dictionary like "Figma", "n8n")
    text_lower = job_text.lower()
    for skill in user_skills:
        if re.search(re.escape(skill.lower()), text_lower):
            normalized = normalize_skill(skill)
            if normalized not in job_skills:
                job_skills.append(normalized)

    if not job_skills:
        return {"match_score": 0.0, "matched_skills": [], "missing_skills": [], "required_skills": []}

    # Normalize user skills for comparison
    user_set = set(normalize_skill(s) for s in user_skills)

    matched = [s for s in job_skills if s in user_set]
    missing = [s for s in job_skills if s not in user_set]

    score = round(len(matched) / len(job_skills), 3)
    return {
        "match_score": score,
        "matched_skills": matched,
        "missing_skills": missing,
        "required_skills": job_skills,
    }

router = APIRouter()
pdf_parser = PDFParser()
ai_service = AIService()
job_service = JobService()
skill_matcher = SkillMatcher()
db = SupabaseService()


@router.post("/analyze")
async def analyze_resume(
    file: UploadFile = File(...),
    user_id: str = "anonymous",
):
    try:
        if not file.filename or not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are accepted")

        file_bytes = await file.read()
        if len(file_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

        # Step 1: Extract text
        resume_text = pdf_parser.extract_text(file_bytes)
        quality = pdf_parser.estimate_quality(resume_text)
        if not quality["is_valid"]:
            raise HTTPException(
                status_code=422,
                detail="Could not extract readable text from this PDF. Please upload a text-based PDF (not a scanned image).",
            )

        # Step 2: AI - Extract skill profile
        skill_profile = ai_service.extract_skill_profile(resume_text)

        # Step 3: AI - Score resume + suggestions
        score, suggestions = ai_service.score_resume(resume_text, skill_profile)

        # Step 4: Fetch jobs
        raw_jobs = await job_service.fetch_jobs_for_profile(
            skills=skill_profile.skills,
            domain=skill_profile.domain or "software engineering",
        )

        # Step 5: Match user's skills against job description
        for job in raw_jobs:
            clean_desc = strip_html(job.description) + " " + job.title
            result_match = match_job_skills(skill_profile.skills, clean_desc)
            job.match_score = result_match["match_score"]
            job.matched_skills = result_match["matched_skills"]
            job.missing_skills = result_match["missing_skills"]
            job.required_skills = result_match["required_skills"]
        enriched_jobs = raw_jobs

        # Step 6: Rank + gaps
        ranked_jobs = skill_matcher.rank_jobs(list(enriched_jobs))
        skill_gaps = skill_matcher.compute_skill_gaps(ranked_jobs)

        # Step 7: Build result
        analysis_id = str(uuid.uuid4())
        result = AnalysisResult(
            analysis_id=analysis_id,
            user_id=user_id,
            created_at=datetime.utcnow(),
            resume_filename=file.filename,
            skill_profile=skill_profile,
            score=score,
            suggestions=suggestions,
            job_matches=ranked_jobs[:15],
            skill_gaps=skill_gaps,
        )

        # Step 8: Save to DB
        try:
            await db.save_analysis(result)
            print(f"[DB] Analysis saved: {analysis_id}")
        except Exception as e:
            print(f"[DB] Save failed: {e}")

        return AnalysisResponse(success=True, analysis_id=analysis_id, result=result)

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"detail": f"Analysis failed: {str(e)}"},
        )


@router.get("/history/{user_id}")
async def get_history(user_id: str):
    return await db.get_user_history(user_id)


@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    result = await db.get_analysis(analysis_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return result
