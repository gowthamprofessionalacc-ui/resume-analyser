const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function analyzeResume(file: File, userId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  const res = await fetch(`${API_BASE}/resume/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Analysis failed");
  }

  return res.json();
}

export async function getHistory(userId: string) {
  const res = await fetch(`${API_BASE}/resume/history/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export async function getAnalysis(analysisId: string) {
  const res = await fetch(`${API_BASE}/resume/analysis/${analysisId}`);
  if (!res.ok) throw new Error("Failed to fetch analysis");
  return res.json();
}
