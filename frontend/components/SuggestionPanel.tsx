"use client";

import { useState } from "react";
import { Suggestion } from "@/types";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

interface SuggestionPanelProps {
  suggestions: Suggestion[];
}

export default function SuggestionPanel({ suggestions }: SuggestionPanelProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (suggestions.length === 0) {
    return (
      <Card>
        <p className="text-base text-[var(--text-secondary)] text-center py-10">
          No suggestions — your resume looks great!
        </p>
      </Card>
    );
  }

  const categoryColor = (cat: string) => {
    const lower = cat.toLowerCase();
    if (lower.includes("format")) return "cyan";
    if (lower.includes("impact") || lower.includes("language")) return "green";
    if (lower.includes("skill")) return "amber";
    if (lower.includes("structure")) return "red";
    return "muted" as const;
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="flex flex-col gap-5 stagger-children">
      {suggestions.map((s, i) => (
        <Card key={i}>
          <div className="flex items-start gap-4">
            <span className="font-mono text-xl font-bold text-[var(--text-muted)] shrink-0 w-8 text-center">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <Badge variant={categoryColor(s.category)} className="mb-3">{s.category}</Badge>

              {s.original && (
                <div className="mb-4 p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                  <p className="text-xs uppercase tracking-widest text-[var(--accent-danger)] mb-2">Current</p>
                  <p className="text-sm text-[var(--text-secondary)] line-through opacity-70 leading-relaxed">{s.original}</p>
                </div>
              )}

              <div className="mb-4 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10 relative group">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-widest text-[var(--accent-success)]">
                    {s.original ? "Suggested" : "Recommendation"}
                  </p>
                  <button
                    onClick={() => handleCopy(s.improved, i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-xs font-mono px-3 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-active)] cursor-pointer"
                  >
                    {copiedIndex === i ? (
                      <span className="text-[var(--accent-success)] copied-toast">Copied!</span>
                    ) : "Copy"}
                  </button>
                </div>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">{s.improved}</p>
              </div>

              <p className="text-sm text-[var(--text-muted)] italic leading-relaxed">{s.reason}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
