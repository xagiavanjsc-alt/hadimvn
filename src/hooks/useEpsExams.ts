import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// ─── Shape khớp với De1Question/De2Question (0-based correct) ────────────────
// Frontend trang thi /eps-de1, /eps-de2 đã có sẵn renderer cho cấu trúc này.
// Hook map row DB → shape này để tái dùng UI, không viết lại.
export interface DbExamQuestion {
  id: number;
  section: "reading" | "listening";
  optionType: "text" | "image";
  prompt: string;
  content?: string;
  contentImage?: string;
  optionImages?: string[];
  audioScript?: string;
  audioOptions?: string[];
  audioHint?: string;
  options: string[];
  correct: number; // 0-based (DB lưu 1-based, hook đã -1)
}

export interface DbExam {
  id: string;
  slug: string;
  title: string;
  year: number;
  examNo: number;
  description: string;
  totalQuestions: number;
  timeMinutes: number;
  questions: DbExamQuestion[];
  explanations: Record<number, string>;
}

export interface DbExamSummary {
  id: string;
  slug: string;
  title: string;
  year: number;
  examNo: number;
  totalQuestions: number;
  timeMinutes: number;
}

function mapRow(r: Record<string, unknown>): DbExamQuestion {
  const section = (r.section ?? r.question_type) as DbExamQuestion["section"];
  const optionType =
    (r.option_type as DbExamQuestion["optionType"]) ??
    (r.question_type === "image" ? "image" : "text");
  return {
    id: r.order_no as number,
    section: section === "listening" ? "listening" : "reading",
    optionType: optionType === "image" ? "image" : "text",
    prompt: (r.question_text as string) ?? "",
    content: (r.content as string) || undefined,
    contentImage: (r.content_image as string) || undefined,
    optionImages: (r.option_images as string[]) || undefined,
    audioScript: (r.audio_script as string) || undefined,
    audioOptions: (r.audio_options as string[]) || undefined,
    audioHint: (r.audio_hint as string) || undefined,
    options: (r.options as string[]) ?? [],
    correct: Math.max(0, ((r.correct_answer as number) ?? 1) - 1),
  };
}

// ─── List published exams (cho trang /eps-exams) ─────────────────────────────
export function useEpsExamList() {
  const [exams, setExams] = useState<DbExamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from("eps_exams")
        .select("id, slug, title, year, exam_no, total_questions, time_minutes")
        .eq("is_published", true)
        .order("year", { ascending: false })
        .order("exam_no", { ascending: true });
      if (cancelled) return;
      if (err) {
        setError(err.message);
        setExams([]);
      } else {
        setExams(
          (data ?? []).map((r) => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            year: r.year,
            examNo: r.exam_no,
            totalQuestions: r.total_questions,
            timeMinutes: r.time_minutes,
          })),
        );
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { exams, loading, error };
}

// ─── Load full exam by slug (cho trang /eps-de1, /eps-de2, hoặc đề DB mới) ──
export function useEpsExam(slug: string | null | undefined) {
  const [exam, setExam] = useState<DbExam | null>(null);
  const [loading, setLoading] = useState(!!slug);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!slug) {
      setExam(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data: examRow, error: examErr } = await supabase
      .from("eps_exams")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (examErr || !examRow) {
      setExam(null);
      setError(examErr?.message ?? null);
      setLoading(false);
      return;
    }
    const { data: qRows, error: qErr } = await supabase
      .from("eps_questions")
      .select("*")
      .eq("exam_id", examRow.id)
      .order("order_no", { ascending: true });
    if (qErr) {
      setExam(null);
      setError(qErr.message);
      setLoading(false);
      return;
    }
    const questions = (qRows ?? []).map(mapRow);
    const explanations: Record<number, string> = {};
    for (const r of qRows ?? []) {
      if (r.explanation) explanations[r.order_no as number] = r.explanation as string;
    }
    setExam({
      id: examRow.id,
      slug: examRow.slug,
      title: examRow.title,
      year: examRow.year,
      examNo: examRow.exam_no,
      description: examRow.description ?? "",
      totalQuestions: examRow.total_questions,
      timeMinutes: examRow.time_minutes,
      questions,
      explanations,
    });
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { exam, loading, error, reload };
}
