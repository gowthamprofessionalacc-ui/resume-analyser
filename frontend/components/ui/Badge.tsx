"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "cyan" | "green" | "amber" | "red" | "muted";
  className?: string;
  interactive?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export default function Badge({
  children,
  variant = "cyan",
  className = "",
  interactive = false,
  active = false,
  onClick,
}: BadgeProps) {
  const colors = {
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    muted: "bg-[var(--bg-elevated)] text-[var(--text-muted)] border-[var(--border-default)]",
  };

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-mono border animate-spring-pop ${colors[variant]} ${
        interactive ? "badge-interactive" : ""
      } ${active ? "badge-active" : ""} ${className}`}
    >
      {children}
    </span>
  );
}
