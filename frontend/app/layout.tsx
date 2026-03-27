import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Analyzer — AI-Powered Resume Scoring & Job Matching",
  description:
    "Upload your resume. Get an AI score, matched jobs, skill gap analysis, and improvement suggestions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
