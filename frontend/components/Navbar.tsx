"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-[var(--bg-primary)]/90 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled ? "nav-scrolled border-[var(--border-default)]" : "border-[var(--border-subtle)]"
      }`}
    >
      <Link href="/" className="flex items-center gap-1 no-underline">
        <span className="font-mono text-lg font-bold text-[var(--accent-secondary)]">
          resume
        </span>
        <span className="font-mono text-lg text-[var(--text-muted)]">.ai</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className={`text-sm transition-colors no-underline ${
            pathname === "/dashboard"
              ? "nav-link-active"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
