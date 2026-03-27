"use client";

interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
  color?: string;
}

function getLabel(pct: number): string {
  if (pct >= 80) return "Excellent";
  if (pct >= 60) return "Good";
  if (pct >= 40) return "Fair";
  return "Needs work";
}

export default function ProgressBar({
  value,
  max,
  label,
  color = "var(--accent-primary)",
}: ProgressBarProps) {
  const pct = Math.round((value / max) * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        <span className="text-sm font-mono text-[var(--text-primary)]">
          {value}/{max}
        </span>
      </div>
      <div className="progress-wrap">
        <div className="progress-tooltip">
          {pct}% · {getLabel(pct)}
        </div>
        <div className="h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full animate-grow progress-bar-fill transition-all duration-200"
            style={{ width: `${pct}%`, background: color, ["--bar-color" as string]: color }}
          />
        </div>
      </div>
    </div>
  );
}
