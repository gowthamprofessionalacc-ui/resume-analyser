from utils.skill_dictionary import normalize_skills_list
from models.schemas import JobListing, SkillGap
from collections import Counter


class SkillMatcher:

    def compute_match(self, user_skills: list[str], job_skills: list[str]) -> dict:
        user_normalized = set(normalize_skills_list(user_skills))
        job_normalized = set(normalize_skills_list(job_skills))

        if not job_normalized:
            return {"match_score": 0.0, "matched_skills": [], "missing_skills": []}

        matched = user_normalized.intersection(job_normalized)
        missing = job_normalized.difference(user_normalized)

        base_score = len(matched) / len(job_normalized)
        bonus = 0.1 if base_score >= 0.8 else 0.0
        final_score = min(1.0, base_score + bonus)

        return {
            "match_score": round(final_score, 3),
            "matched_skills": list(matched),
            "missing_skills": list(missing),
        }

    def rank_jobs(self, jobs: list[JobListing]) -> list[JobListing]:
        return sorted(jobs, key=lambda j: j.match_score, reverse=True)

    def compute_skill_gaps(
        self, jobs: list[JobListing], top_n: int = 10
    ) -> list[SkillGap]:
        missing_counter: Counter = Counter()
        skill_to_titles: dict[str, list[str]] = {}

        for job in jobs:
            for skill in job.missing_skills:
                norm = normalize_skills_list([skill])[0]
                missing_counter[norm] += 1
                if norm not in skill_to_titles:
                    skill_to_titles[norm] = []
                if job.title not in skill_to_titles[norm]:
                    skill_to_titles[norm].append(job.title)

        gaps = []
        for rank, (skill, count) in enumerate(
            missing_counter.most_common(top_n), start=1
        ):
            gaps.append(
                SkillGap(
                    skill=skill,
                    frequency=count,
                    priority_rank=rank,
                    job_titles_needing=skill_to_titles.get(skill, [])[:5],
                )
            )

        return gaps
