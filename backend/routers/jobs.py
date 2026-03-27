from fastapi import APIRouter, Query
from services.job_service import JobService

router = APIRouter()
job_service = JobService()


@router.get("/search")
async def search_jobs(
    query: str = Query(..., description="Search keywords"),
    limit: int = Query(10, ge=1, le=50),
):
    jobs = await job_service.fetch_jobs_for_profile(
        skills=query.split(), domain="software engineering", limit=limit
    )
    return {"jobs": [j.model_dump() for j in jobs], "count": len(jobs)}
