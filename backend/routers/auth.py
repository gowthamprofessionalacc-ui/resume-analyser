from fastapi import APIRouter

router = APIRouter()


@router.get("/me")
async def get_current_user():
    return {
        "id": "anonymous",
        "email": "demo@example.com",
        "message": "Auth is handled by Supabase on the frontend. This endpoint is a placeholder.",
    }
