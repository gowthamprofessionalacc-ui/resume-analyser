"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Supabase auth integration placeholder
    alert("Auth coming soon — using demo mode for now");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block no-underline">
            <span className="font-mono text-2xl font-bold text-[var(--accent-secondary)]">
              resume
            </span>
            <span className="font-mono text-2xl text-[var(--text-muted)]">
              .ai
            </span>
          </Link>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--text-muted)] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full mt-2">
            Sign in
          </Button>
        </form>

        <p className="text-xs text-[var(--text-muted)] text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-[var(--accent-primary)] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
