export function stripLessonPrefix(titleVi: string): string {
  return titleVi.replace(/^Bài\s+\d+[:\s]+/i, "").trim();
}

export function speakKorean(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ko-KR";
  u.rate = 0.8;
  window.speechSynthesis.speak(u);
}

export const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  beginner: { label: "Cơ bản", color: "#34d399" },
  intermediate: { label: "Trung cấp", color: "app-accent-primary" },
  advanced: { label: "Nâng cao", color: "#f87171" },
};
