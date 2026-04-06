# AI Resume Analyzer + Job Match Platform

Upload your PDF resume and get:
- **AI Score** (0-100) across 4 dimensions
- **Job Matches** from real job boards (Adzuna, Remotive)
- **Skill Gap Analysis** with learning priorities
- **Resume Improvement Suggestions** with specific rewrites

## Tech Stack

- **Frontend**: Next.js 15 (App Router, TypeScript, Tailwind CSS)
- **Backend**: Python FastAPI
- **AI**: Google Gemini API (gemini-2.0-flash)
- **Database**: Supabase (PostgreSQL)
- **Job APIs**: Adzuna, Remotive

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Edit `backend/.env` with your API keys:
- `GEMINI_API_KEY` — from https://aistudio.google.com/apikey
- `SUPABASE_SERVICE_KEY` — from Supabase dashboard > Settings > API
- `ADZUNA_APP_ID` / `ADZUNA_APP_KEY` — from https://developer.adzuna.com

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

API docs at: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### 3. Database (Supabase)

Run this SQL in your Supabase SQL Editor:

```sql
create table analyses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null default 'anonymous',
  created_at timestamptz default now(),
  resume_filename text not null,
  resume_text text,
  score_total integer,
  score_formatting integer,
  score_impact integer,
  score_ats integer,
  score_skills integer,
  grade text,
  skill_profile jsonb,
  suggestions jsonb,
  job_matches jsonb,
  skill_gaps jsonb
);

create index idx_analyses_user_id on analyses(user_id, created_at desc);
```
