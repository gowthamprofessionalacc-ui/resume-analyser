"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ResumeUploader from "@/components/ResumeUploader";
import { analyzeResume } from "@/lib/api";

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpload(file: File) {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeResume(file, "demo-user");
      sessionStorage.setItem("analysisResult", JSON.stringify(data.result));
      router.push("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-1">
          <span className="font-mono text-xl font-bold text-[var(--accent-secondary)]">resume</span>
          <span className="font-mono text-xl text-[var(--text-muted)]">.ai</span>
        </div>
        <a href="/dashboard" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors no-underline">
          Dashboard
        </a>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-6 pt-16 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight tracking-tight">
            <span className="text-[var(--text-primary)]">Analyze your resume</span>
            <br />
            <span className="text-[var(--accent-secondary)] score-glow">with AI precision</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-lg mx-auto leading-relaxed">
            Upload your resume and get an instant AI-powered score, personalized job matches, and actionable improvement suggestions.
          </p>
        </div>

        <div className="w-full max-w-lg mb-20">
          <ResumeUploader onUpload={handleUpload} loading={loading} error={error} />
        </div>

        {/* Features */}
        <div className="w-full max-w-3xl">
          <h2 className="text-center text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] font-medium mb-8">
            What you get
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-7 text-center hover:border-indigo-500/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">Smart Scoring</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                AI scores your resume across formatting, impact language, ATS compatibility, and skills depth.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-7 text-center hover:border-emerald-500/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">Job Matching</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Real job listings matched to your skills from multiple job boards with match percentages.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-7 text-center hover:border-amber-500/40 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-warning)" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">Improvements</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Specific rewrite suggestions and skill gap analysis to level up your resume.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-8 py-6 border-t border-[var(--border-subtle)] text-center">
        <p className="text-xs text-[var(--text-muted)]">
          Powered by AI. Your resume data is processed securely and never stored permanently.
        </p>
      </footer>
    </div>
  );
}
