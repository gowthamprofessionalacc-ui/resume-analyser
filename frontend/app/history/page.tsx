"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { getHistory } from "@/lib/api";

interface HistoryItem {
  id: string;
  created_at: string;
  resume_filename: string;
  score_total: number;
  grade: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory("demo-user")
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const gradeColor = (grade: string) => {
    if (grade === "A") return "var(--accent-secondary)";
    if (grade === "B") return "var(--accent-success)";
    if (grade === "C") return "var(--accent-warning)";
    return "var(--accent-danger)";
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[900px] mx-auto p-6">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-6">
          Analysis History
        </h1>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg p-12 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              No analyses yet. Upload a resume to get started.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Header */}
            <div className="grid grid-cols-4 px-4 py-2 text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
              <span>Date</span>
              <span>Resume</span>
              <span className="text-center">Score</span>
              <span className="text-center">Grade</span>
            </div>

            {/* Rows */}
            {history.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-4 items-center px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg hover:border-[var(--border-active)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer"
              >
                <span className="text-xs text-[var(--text-secondary)]">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                <span className="text-sm text-[var(--text-primary)] truncate">
                  {item.resume_filename}
                </span>
                <span className="text-center font-mono text-sm text-[var(--accent-secondary)]">
                  {item.score_total}
                </span>
                <span
                  className="text-center font-mono text-sm font-bold"
                  style={{ color: gradeColor(item.grade) }}
                >
                  {item.grade}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
