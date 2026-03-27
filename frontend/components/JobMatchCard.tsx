"use client";

import { useState } from "react";
import { JobListing } from "@/types";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

interface JobMatchCardProps {
  job: JobListing;
  animationDelay?: number;
}

export default function JobMatchCard({ job, animationDelay = 0 }: JobMatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const matchPct = Math.round(job.match_score * 100);
  const matchColor = matchPct >= 70 ? "green" : matchPct >= 40 ? "amber" : "red";

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const fmt = (n: number) => `$${Math.round(n / 1000)}K`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `From ${fmt(min)}`;
    return `Up to ${fmt(max!)}`;
  };

  const salary = formatSalary(job.salary_min, job.salary_max);

  return (
    <Card
      hover
      className="animate-fade-in-up"
      style={{ animationDelay: `${animationDelay}ms` } as React.CSSProperties}
    >
      <div onClick={() => setExpanded(!expanded)} className="cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-[var(--text-primary)] truncate">{job.title}</h3>
              <span className={`chevron text-[var(--text-muted)] text-[10px] ${expanded ? "is-open" : ""}`}>▼</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{job.company} · {job.location}</p>
            {salary && <p className="text-sm font-mono text-[var(--accent-success)] mt-1">{salary}</p>}
          </div>
          <Badge variant={matchColor} className="shrink-0 font-mono text-sm">{matchPct}%</Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          {job.matched_skills.slice(0, 5).map((skill) => (
            <Badge key={skill} variant="cyan">{skill}</Badge>
          ))}
          {job.matched_skills.length > 5 && <Badge variant="muted">+{job.matched_skills.length - 5}</Badge>}
          {job.missing_skills.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="red">✕ {skill}</Badge>
          ))}
          {job.missing_skills.length > 3 && <Badge variant="muted">+{job.missing_skills.length - 3}</Badge>}
        </div>
      </div>

      <div className={`expandable ${expanded ? "is-open" : ""}`}>
        <div className="expandable-inner">
          <div className="mt-5 pt-5 border-t border-[var(--border-subtle)]">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-6">
              {job.description.replace(/<[^>]*>/g, "").slice(0, 500)}...
            </p>
            <div className="mt-4 flex gap-3">
              <Button size="sm" onClick={(e) => { e.stopPropagation(); window.open(job.url, "_blank", "noopener,noreferrer"); }}>
                View Listing
              </Button>
              <Badge variant="muted">{job.source}</Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
