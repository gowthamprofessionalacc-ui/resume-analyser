import httpx
import asyncio
import os
from models.schemas import JobListing

# Skills that get good results on job boards — prioritized over generic tools
PRIORITY_SKILLS = {
    "javascript", "python", "react", "node.js", "nodejs", "typescript",
    "java", "go", "ruby", "php", "swift", "kotlin", "rust", "scala",
    "c++", "c#", "angular", "vue.js", "django", "flask", "fastapi",
    "spring", "spring boot", "express", "next.js", "mongodb", "postgresql",
    "mysql", "redis", "docker", "kubernetes", "aws", "azure", "graphql",
    "tensorflow", "pytorch", "machine learning", "data science",
}


def pick_search_terms(skills: list[str], limit: int = 5) -> list[str]:
    """Pick the most job-board-friendly skills, prioritizing languages/frameworks."""
    priority = [s for s in skills if s.lower() in PRIORITY_SKILLS]
    rest = [s for s in skills if s.lower() not in PRIORITY_SKILLS]
    ordered = priority + rest
    return ordered[:limit]


class JobService:

    def __init__(self):
        self.adzuna_app_id = os.getenv("ADZUNA_APP_ID")
        self.adzuna_app_key = os.getenv("ADZUNA_APP_KEY")

    async def fetch_jobs_for_profile(
        self, skills: list[str], domain: str, limit: int = 20
    ) -> list[JobListing]:
        search_terms = pick_search_terms(skills, limit=5)
        print(f"[JobService] Search terms: {search_terms}")

        tasks = [self._fetch_remotive_all(search_terms)]

        if (
            self.adzuna_app_id
            and self.adzuna_app_key
            and self.adzuna_app_id != "your_adzuna_app_id"
        ):
            tasks.append(self._fetch_adzuna(" ".join(search_terms[:3]), limit=10))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        jobs = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"[JobService] Task {i} failed: {result}")
            elif isinstance(result, list):
                print(f"[JobService] Task {i} returned {len(result)} jobs")
                jobs.extend(result)

        deduped = self._deduplicate(jobs)[:limit]
        print(f"[JobService] Total after dedup: {len(deduped)} jobs")
        return deduped

    async def _fetch_remotive_all(self, skills: list[str]) -> list[JobListing]:
        all_jobs = []
        async with httpx.AsyncClient(timeout=15.0) as client:
            for skill in skills:
                try:
                    resp = await client.get(
                        "https://remotive.com/api/remote-jobs",
                        params={"search": skill, "limit": 10},
                    )
                    resp.raise_for_status()
                    data = resp.json()
                    for item in data.get("jobs", [])[:10]:
                        all_jobs.append(
                            JobListing(
                                id=str(item.get("id", "")),
                                title=item.get("title", ""),
                                company=item.get("company_name", "Unknown"),
                                location="Remote",
                                salary_min=None,
                                salary_max=None,
                                description=item.get("description", "")[:3000],
                                url=item.get("url", ""),
                                required_skills=[],
                                match_score=0.0,
                                matched_skills=[],
                                missing_skills=[],
                                source="remotive",
                            )
                        )
                    print(f"[Remotive] '{skill}' -> {len(data.get('jobs', []))} jobs")
                except Exception as e:
                    print(f"[Remotive] '{skill}' failed: {e}")
        return all_jobs

    async def _fetch_adzuna(self, query: str, limit: int = 10) -> list[JobListing]:
        url = "https://api.adzuna.com/v1/api/jobs/us/search/1"
        params = {
            "app_id": self.adzuna_app_id,
            "app_key": self.adzuna_app_key,
            "results_per_page": limit,
            "what": query,
            "content-type": "application/json",
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                data = resp.json()
            jobs = []
            for item in data.get("results", []):
                jobs.append(
                    JobListing(
                        id=str(item.get("id", "")),
                        title=item.get("title", ""),
                        company=item.get("company", {}).get("display_name", "Unknown"),
                        location=item.get("location", {}).get("display_name", "Remote"),
                        salary_min=item.get("salary_min"),
                        salary_max=item.get("salary_max"),
                        description=item.get("description", ""),
                        url=item.get("redirect_url", ""),
                        required_skills=[],
                        match_score=0.0,
                        matched_skills=[],
                        missing_skills=[],
                        source="adzuna",
                    )
                )
            print(f"[Adzuna] '{query}' -> {len(jobs)} jobs")
            return jobs
        except Exception as e:
            print(f"[Adzuna] failed: {e}")
            return []

    def _deduplicate(self, jobs: list[JobListing]) -> list[JobListing]:
        seen = set()
        unique = []
        for job in jobs:
            key = (job.title.lower().strip(), job.company.lower().strip())
            if key not in seen:
                seen.add(key)
                unique.append(job)
        return unique
