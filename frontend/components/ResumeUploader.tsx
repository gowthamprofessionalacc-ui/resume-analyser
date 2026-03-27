"use client";

import { useCallback, useState, useRef } from "react";
import Button from "./ui/Button";

interface ResumeUploaderProps {
  onUpload: (file: File) => void;
  loading: boolean;
  error: string | null;
}

export default function ResumeUploader({ onUpload, loading, error }: ResumeUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") { setSelectedFile(file); onUpload(file); }
  }, [onUpload]);
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") { setSelectedFile(file); onUpload(file); }
  }, [onUpload]);
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-xl">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !loading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-5 p-16 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
          error
            ? "border-[var(--accent-danger)] bg-red-500/5"
            : dragOver
            ? "border-[var(--accent-primary)] bg-indigo-500/5 scale-[1.01]"
            : loading
            ? "border-[var(--border-active)] bg-[var(--bg-surface)] cursor-wait"
            : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-active)] pulse-border"
        }`}
      >
        {loading ? (
          <>
            <div className="w-10 h-10 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--text-secondary)]">
              Analyzing your resume<span className="animate-pulse">...</span>
            </p>
          </>
        ) : (
          <>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke={dragOver ? "var(--accent-primary)" : "var(--text-muted)"} strokeWidth="1.5" className="transition-colors">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="12" y2="12" />
              <line x1="15" y1="15" x2="12" y2="12" />
            </svg>
            <div className="text-center">
              <p className="text-base text-[var(--text-primary)] font-medium">
                {dragOver ? "Drop it!" : "Drag your resume here or click to browse"}
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-2">PDF only, max 10MB</p>
            </div>
          </>
        )}
        <input ref={inputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
      </div>

      {selectedFile && !loading && !error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {selectedFile.name} ({formatSize(selectedFile.size)})
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--accent-danger)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
