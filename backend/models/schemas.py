from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SkillProfile(BaseModel):
    skills: list[str]
    experience_years: Optional[int] = None
    domain: Optional[str] = None
    education: Optional[str] = None
    job_titles: list[str] = []


class ScoreBreakdown(BaseModel):
    formatting: int
    impact_language: int
    ats_compatibility: int
    skills_depth: int
    total: int
    grade: str
    strengths: list[str]
    weaknesses: list[str]


class Suggestion(BaseModel):
    category: str = "General"
    original: Optional[str] = None
    improved: str = ""
    reason: str = ""


class JobListing(BaseModel):
    id: str
    title: str
    company: str
    location: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    description: str
    url: str
    required_skills: list[str] = []
    match_score: float = 0.0
    matched_skills: list[str] = []
    missing_skills: list[str] = []
    source: str


class SkillGap(BaseModel):
    skill: str
    frequency: int
    priority_rank: int
    job_titles_needing: list[str]


class AnalysisResult(BaseModel):
    analysis_id: str
    user_id: str
    created_at: datetime
    resume_filename: str
    skill_profile: SkillProfile
    score: ScoreBreakdown
    suggestions: list[Suggestion]
    job_matches: list[JobListing]
    skill_gaps: list[SkillGap]


class AnalysisResponse(BaseModel):
    success: bool
    analysis_id: str
    result: AnalysisResult
