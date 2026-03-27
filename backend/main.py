from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
import traceback

load_dotenv()

from routers import resume, jobs, auth

app = FastAPI(title="Resume Analyzer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(resume.router, prefix="/resume", tags=["resume"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])


@app.get("/")
def root():
    return {"message": "Resume Analyzer API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
