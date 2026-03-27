"use client";

import { useEffect, useState } from "react";
import { ScoreBreakdown } from "@/types";
import ProgressBar from "./ui/ProgressBar";

interface ScoreCardProps {
  score: ScoreBreakdown;
}

const CIRCUMFERENCE = 2 * Math.PI * 42;

export default function ScoreCard({ score }: ScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [dashOffset, setDashOffset] = useState(CIRCUMFERENCE);

  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const increment = score.total / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= score.total) {
        setDisplayScore(score.total);
        setDashOffset(CIRCUMFERENCE * (1 - score.total / 100));
        clearInterval(interval);
      } else {
        setDisplayScore(Math.floor(current));
        setDashOffset(CIRCUMFERENCE * (1 - Math.floor(current) / 100));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [score.total]);

  const gradeColor =
    score.grade === "A"
      ? "var(--accent-secondary)"
      : score.grade === "B"
      ? "var(--accent-success)"
      : score.grade === "C"
      ? "var(--accent-warning)"
      : "var(--accent-danger)";

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-7">
      <div className="flex items-center justify-between mb-7">
        <div className="relative" style={{ width: 110, height: 110 }}>
          <svg width="110" height="110" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" className="score-ring-track" />
            <circle cx="50" cy="50" r="42" className="score-ring-fill"
              style={{ stroke: gradeColor, strokeDasharray: CIRCUMFERENCE, strokeDashoffset: dashOffset, filter: `drop-shadow(0 0 6px ${gradeColor})` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-bold score-glow" style={{ color: "var(--accent-secondary)" }}>{displayScore}</span>
            <span className="text-xs text-[var(--text-muted)] font-mono">/100</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Resume Score</p>
          <div className="flex items-center justify-center w-14 h-14 rounded-xl font-mono text-2xl font-bold"
            style={{ color: gradeColor, background: `color-mix(in srgb, ${gradeColor} 10%, transparent)`, border: `1px solid color-mix(in srgb, ${gradeColor} 20%, transparent)` }}>
            {score.grade}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <ProgressBar value={score.formatting} max={25} label="Formatting" color="var(--accent-primary)" />
        <ProgressBar value={score.impact_language} max={25} label="Impact Language" color="var(--accent-secondary)" />
        <ProgressBar value={score.ats_compatibility} max={25} label="ATS Compatibility" color="var(--accent-success)" />
        <ProgressBar value={score.skills_depth} max={25} label="Skills Depth" color="var(--accent-warning)" />
      </div>
    </div>
  );
}
