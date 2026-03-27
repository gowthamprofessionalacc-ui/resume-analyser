"use client";

import { useState } from "react";
import { SkillGap } from "@/types";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

interface SkillGapChartProps {
  gaps: SkillGap[];
}

export default function SkillGapChart({ gaps }: SkillGapChartProps) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  if (gaps.length === 0) {
    return (
      <Card>
        <p className="text-base text-[var(--text-secondary)] text-center py-10">
          No skill gaps detected — your skills cover all matched jobs!
        </p>
      </Card>
    );
  }

  const maxFreq = Math.max(...gaps.map((g) => g.frequency));

  return (
    <div className="flex flex-col gap-4 stagger-children">
      {gaps.map((gap) => {
        const pct = (gap.frequency / maxFreq) * 100;
        const isTop3 = gap.priority_rank <= 3;
        const isExpanded = expandedSkill === gap.skill;

        return (
          <Card key={gap.skill} hover>
            <div onClick={() => setExpandedSkill(isExpanded ? null : gap.skill)}>
              <div className="flex items-center gap-4">
                <span className={`font-mono text-sm w-8 text-center ${
                  isTop3 ? "text-[var(--accent-warning)] font-bold" : "text-[var(--text-muted)]"
                }`}>
                  #{gap.priority_rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-medium text-[var(--text-primary)]">{gap.skill}</span>
                    <span className="font-mono text-sm text-[var(--text-muted)]">
                      {gap.frequency} job{gap.frequency !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full animate-grow"
                      style={{
                        width: `${pct}%`,
                        background: isTop3 ? "var(--accent-danger)" : "var(--accent-warning)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {isTop3 && (
                <p className="text-xs text-[var(--accent-warning)] mt-3 ml-12 uppercase tracking-wider font-medium">
                  Priority — Learn this first
                </p>
              )}
            </div>

            <div className={`expandable ${isExpanded && gap.job_titles_needing.length > 0 ? "is-open" : ""}`}>
              <div className="expandable-inner">
                <div className="mt-4 pt-4 ml-12 border-t border-[var(--border-subtle)]">
                  <p className="text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3">Needed for</p>
                  <div className="flex flex-wrap gap-2">
                    {gap.job_titles_needing.map((title) => (
                      <Badge key={title} variant="muted">{title}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
