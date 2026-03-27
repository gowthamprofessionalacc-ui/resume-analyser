"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnalysisResult } from "@/types";
import { analyzeResume } from "@/lib/api";
import Navbar from "@/components/Navbar";
import ResumeUploader from "@/components/ResumeUploader";
import ScoreCard from "@/components/ScoreCard";
import JobMatchCard from "@/components/JobMatchCard";
import SkillGapChart from "@/components/SkillGapChart";
import SuggestionPanel from "@/components/SuggestionPanel";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

type Tab = "jobs" | "gaps" | "suggestions";

export default function Dashboard() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("jobs");
  const [showUploader, setShowUploader] = useState(false);
  const [tabKey, setTabKey] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    if (stored) setResult(JSON.parse(stored));
  }, []);

  async function handleUpload(file: File) {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeResume(file, "demo-user");
      setResult(data.result);
      sessionStorage.setItem("analysisResult", JSON.stringify(data.result));
      setShowUploader(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  function switchTab(tab: Tab) {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setTabKey((k) => k + 1);
  }

  const filteredJobs = result
    ? selectedSkill
      ? result.job_matches.filter(
          (j) =>
            j.matched_skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase()) ||
            j.missing_skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase())
        )
      : result.job_matches
    : [];

  if (!result && !showUploader) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-8">
          <h1 className="font-mono text-3xl font-bold">
            <span className="text-[var(--accent-secondary)] score-glow">resume</span>
            <span className="text-[var(--text-muted)]">.ai</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base">Upload your resume to get started.</p>
          <ResumeUploader onUpload={handleUpload} loading={loading} error={error} />
        </main>
      </div>
    );
  }

  if (showUploader) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-8">
          <h2 className="text-xl font-medium text-[var(--text-primary)]">Upload a new resume</h2>
          <ResumeUploader onUpload={handleUpload} loading={loading} error={error} />
          <Button variant="ghost" onClick={() => setShowUploader(false)}>Cancel</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Top bar */}
      <div className="border-b border-[var(--border-subtle)] px-8 py-5">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-base font-medium text-[var(--text-primary)]">{result!.resume_filename}</span>
            <span className="text-sm text-[var(--text-muted)]">{new Date(result!.created_at).toLocaleDateString()}</span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowUploader(true)}>Upload new resume</Button>
        </div>
      </div>

      {/* Dashboard content */}
      <div className="flex gap-8 p-8 max-w-[1280px] mx-auto">

        {/* LEFT PANEL */}
        <aside className="w-[380px] shrink-0 flex flex-col gap-6">
          <ScoreCard score={result!.score} />

          {/* Strengths & Weaknesses */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-7">
            <h3 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium mb-5">Strengths</h3>
            <ul className="flex flex-col gap-3 mb-7">
              {result!.score.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <span className="text-[var(--accent-success)] mt-0.5 text-base shrink-0">+</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>

            <h3 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium mb-5">Areas to Improve</h3>
            <ul className="flex flex-col gap-3">
              {result!.score.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                  <span className="text-[var(--accent-danger)] mt-0.5 text-base shrink-0">-</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Skills */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-7">
            <h3 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium mb-5">
              Extracted skills · {result!.skill_profile.skills.length}
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {result!.skill_profile.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="cyan"
                  interactive
                  active={selectedSkill === skill}
                  onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Profile */}
          {result!.skill_profile.domain && (
            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-7">
              <h3 className="text-xs uppercase tracking-widest text-[var(--text-muted)] font-medium mb-5">Profile</h3>
              <div className="flex flex-col gap-4 text-sm text-[var(--text-secondary)]">
                <div className="flex justify-between items-center">
                  <span>Domain</span>
                  <span className="text-[var(--text-primary)] font-medium">{result!.skill_profile.domain}</span>
                </div>
                {result!.skill_profile.experience_years && (
                  <div className="flex justify-between items-center">
                    <span>Experience</span>
                    <span className="text-[var(--text-primary)] font-medium">{result!.skill_profile.experience_years} years</span>
                  </div>
                )}
                {result!.skill_profile.education && (
                  <div className="flex justify-between items-center">
                    <span>Education</span>
                    <span className="text-[var(--text-primary)] font-medium text-right max-w-[200px]">{result!.skill_profile.education}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT PANEL */}
        <main className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex gap-1 mb-8 bg-[var(--bg-elevated)] p-1.5 rounded-xl w-fit">
            {(["jobs", "gaps", "suggestions"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                className={`px-5 py-2.5 rounded-lg border-none cursor-pointer text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                    : "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {tab === "jobs"
                  ? `Job Matches (${filteredJobs.length})`
                  : tab === "gaps"
                  ? `Skill Gaps (${result!.skill_gaps.length})`
                  : `Suggestions (${result!.suggestions.length})`}
              </button>
            ))}
          </div>

          {/* Filter info */}
          {selectedSkill && activeTab === "jobs" && (
            <div className="flex items-center gap-3 mb-5 text-sm text-[var(--text-secondary)] animate-fade-in-up">
              <span>Filtered by</span>
              <Badge variant="cyan">{selectedSkill}</Badge>
              <button
                onClick={() => setSelectedSkill(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer bg-transparent border-none text-sm underline"
              >
                Clear
              </button>
            </div>
          )}

          {/* Tab content */}
          <div key={tabKey} className="tab-content-enter">
            {activeTab === "jobs" && (
              <div className="flex flex-col gap-5 stagger-children">
                {filteredJobs.length === 0 ? (
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-12 text-center">
                    <p className="text-base text-[var(--text-secondary)]">
                      {selectedSkill
                        ? `No jobs found matching "${selectedSkill}". Try another skill or clear the filter.`
                        : "No job matches found. Try uploading a different resume."}
                    </p>
                  </div>
                ) : (
                  filteredJobs.map((job, i) => (
                    <JobMatchCard key={job.id} job={job} animationDelay={i * 50} />
                  ))
                )}
              </div>
            )}
            {activeTab === "gaps" && <SkillGapChart gaps={result!.skill_gaps} />}
            {activeTab === "suggestions" && <SuggestionPanel suggestions={result!.suggestions} />}
          </div>
        </main>
      </div>
    </div>
  );
}
