export interface SkillProfile {
  skills: string[];
  experience_years: number | null;
  domain: string;
  education: string;
  job_titles: string[];
}

export interface ScoreBreakdown {
  formatting: number;
  impact_language: number;
  ats_compatibility: number;
  skills_depth: number;
  total: number;
  grade: string;
  strengths: string[];
  weaknesses: string[];
}

export interface Suggestion {
  category: string;
  original: string | null;
  improved: string;
  reason: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  description: string;
  url: string;
  required_skills: string[];
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  source: string;
}

export interface SkillGap {
  skill: string;
  frequency: number;
  priority_rank: number;
  job_titles_needing: string[];
}

export interface AnalysisResult {
  analysis_id: string;
  user_id: string;
  created_at: string;
  resume_filename: string;
  skill_profile: SkillProfile;
  score: ScoreBreakdown;
  suggestions: Suggestion[];
  job_matches: JobListing[];
  skill_gaps: SkillGap[];
}
