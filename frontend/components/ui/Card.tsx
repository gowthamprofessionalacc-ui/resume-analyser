"use client";

import { useCallback } from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export default function Card({ children, className = "", hover = false, style }: CardProps) {
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--ripple-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--ripple-y", `${e.clientY - rect.top}px`);
  }, [hover]);

  return (
    <div
      style={style}
      onMouseDown={handleMouseDown}
      className={`bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-7 ${
        hover
          ? "card-press cursor-pointer transition-all duration-150 hover:border-[var(--border-active)] hover:bg-[var(--bg-hover)]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
