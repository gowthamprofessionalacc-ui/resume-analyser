import httpx
import os
from models.schemas import AnalysisResult


class SupabaseService:
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_SERVICE_KEY")
        self.headers = {}
        if self.url and self.key:
            self.headers = {
                "apikey": self.key,
                "Authorization": f"Bearer {self.key}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            }

    @property
    def enabled(self):
        return bool(self.url and self.key)

    async def save_analysis(self, result: AnalysisResult):
        if not self.enabled:
            return

        data = {
            "id": result.analysis_id,
            "user_id": result.user_id,
            "resume_filename": result.resume_filename,
            "score_total": result.score.total,
            "score_formatting": result.score.formatting,
            "score_impact": result.score.impact_language,
            "score_ats": result.score.ats_compatibility,
            "score_skills": result.score.skills_depth,
            "grade": result.score.grade,
            "skill_profile": result.skill_profile.model_dump(),
            "suggestions": [s.model_dump() for s in result.suggestions],
            "job_matches": [j.model_dump() for j in result.job_matches],
            "skill_gaps": [g.model_dump() for g in result.skill_gaps],
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{self.url}/rest/v1/analyses",
                headers=self.headers,
                json=data,
            )
            resp.raise_for_status()

    async def get_user_history(self, user_id: str):
        if not self.enabled:
            return []

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.url}/rest/v1/analyses",
                headers={**self.headers, "Prefer": ""},
                params={
                    "select": "id,created_at,resume_filename,score_total,grade",
                    "user_id": f"eq.{user_id}",
                    "order": "created_at.desc",
                    "limit": "20",
                },
            )
            resp.raise_for_status()
            return resp.json()

    async def get_analysis(self, analysis_id: str):
        if not self.enabled:
            return None

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.url}/rest/v1/analyses",
                headers={**self.headers, "Prefer": "", "Accept": "application/vnd.pgrst.object+json"},
                params={
                    "select": "*",
                    "id": f"eq.{analysis_id}",
                },
            )
            if resp.status_code == 406:
                return None
            resp.raise_for_status()
            return resp.json()
