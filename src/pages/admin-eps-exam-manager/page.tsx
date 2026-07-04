import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase, getStorageUrl } from "@/lib/supabase";
import { useToast } from "@/components/base/Toast";

interface Exam {
  id: string;
  slug: string;
  title: string;
  year: number;
  exam_no: number;
  description: string;
  total_questions: number;
  time_minutes: number;
  is_published: boolean;
  created_at: string;
}

interface Question {
  id: string;
  exam_id: string;
  order_no: number;
  question_type: string;
  question_text: string;
  question_vi: string;
  options: string[];
  correct_answer: number;
  audio_url: string | null;
  image_url: string | null;
  difficulty: string;
  topic: string;
  // Field bổ sung từ migration 121 (đề 1/2 dùng):
  section: string | null;
  option_type: string | null;
  content: string | null;
  content_image: string | null;
  option_images: string[] | null;
  audio_script: string | null;
  audio_options: string[] | null;
  audio_hint: string | null;
  explanation: string | null;
}

const INITIAL_EXAM = {
  slug: "",
  title: "",
  year: new Date().getFullYear(),
  exam_no: 1,
  description: "",
  total_questions: 40,
  time_minutes: 40,
  is_published: false,
};

const INITIAL_QUESTION = {
  order_no: 1,
  question_type: "reading" as string,
  question_text: "",
  question_vi: "",
  options: ["", "", "", ""],
  correct_answer: 1,
  audio_url: "",
  image_url: "",
  difficulty: "medium" as string,
  topic: "",
  // Field bổ sung (đề 1/2):
  section: "reading" as string,
  option_type: "text" as string,
  content: "",
  content_image: "",
  option_images: ["", "", "", ""],
  audio_script: "",
  audio_options: ["", "", "", ""],
  audio_hint: "",
  explanation: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────
// Vietnamese-aware slugify. "Đề số 1" → "de-so-1", "Đề thi EPS-TOPIK 2025"
// → "de-thi-eps-topik-2025". Strips diacritics, lowercases, collapses to
// kebab-case. Leaves the existing slug behavior in seed data ('eps-de-1')
// alone — only used when admin types in the title field.
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/ư/g, "u")
    .replace(/ơ/g, "o")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSlug(value: string): string {
  return slugify(value || "").replace(/-+/g, "-");
}

// Convert any non-webp image to webp via canvas at the given quality.
// Audio / svg / gif passes through untouched (svg loses scalability,
// gif loses animation, audio is irrelevant). Falls back to original on
// any error so we never block an upload.
async function convertImageToWebp(file: File, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/webp" || file.type === "image/svg+xml" || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", quality));
    if (!blob) return file;
    const newName = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], newName, { type: "image/webp" });
  } catch {
    return file;
  }
}

// ─── File Upload Zone ─────────────────────────────────────────────────
function FileUploadZone({
  label,
  accept,
  pathPrefix,
  value,
  onUploaded,
}: {
  label: string;
  accept: string;
  pathPrefix: string;
  value: string;
  onUploaded: (path: string) => void;
}) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (rawFile: File) => {
    if (!rawFile) return;
    setUploading(true);
    const file = await convertImageToWebp(rawFile);
    const ext = file.name.split(".").pop() || "";
    const fileName = `${pathPrefix}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("eps-exams").upload(fileName, file, { upsert: true });
    setUploading(false);
    if (error) { showToast("Upload lỗi: " + error.message, "error"); return; }
    onUploaded(fileName);
    const sizeKB = Math.round(file.size / 1024);
    showToast(`Đã upload (${sizeKB} KB${file.type === "image/webp" && rawFile.type !== "image/webp" ? ", chuyển .webp" : ""})`, "success");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = Array.from(e.dataTransfer.files).find(f => accept.split(",").some(t => f.type.startsWith(t.trim()) || f.name.endsWith(t.trim())));
    if (file) handleFile(file);
  }, [accept]);

  return (
    <div>
      {label && <label className="text-app-text-secondary text-xs block mb-1">{label}</label>}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${dragging ? "border-app-accent-primary/60 bg-app-accent-primary/5" : "border-app-border hover:border-white/20 hover:bg-white/2"}`}
      >
        <input ref={inputRef} type="file" accept={accept} className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-app-accent-primary text-xs">
            <i className="ri-loader-4-line animate-spin"></i>Đang upload...
          </div>
        ) : value ? (
          <div className="text-left">
            <p className="text-emerald-400 text-xs font-medium truncate">{value}</p>
            <p className="text-app-text-muted text-[10px] mt-1">Kéo thả file mới hoặc click để thay thế</p>
          </div>
        ) : (
          <div>
            <i className={`ri-upload-cloud-2-line text-lg ${dragging ? "text-app-accent-primary" : "text-app-text-muted"}`}></i>
            <p className="text-white/50 text-xs mt-1">Kéo thả hoặc click chọn file</p>
          </div>
        )}
      </div>
      {value && (
        <div className="mt-2">
          {accept.includes("image") ? (
            <img src={getStorageUrl(value)} alt="preview" className="max-h-32 rounded-lg border border-app-border object-contain" />
          ) : accept.includes("audio") ? (
            <audio controls src={getStorageUrl(value)} className="w-full h-8" />
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function AdminEpsExamManagerPage() {
  const { showToast } = useToast();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(INITIAL_EXAM);
  const [qForm, setQForm] = useState(INITIAL_QUESTION);
  const [showQForm, setShowQForm] = useState(false);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  // When creating new, auto-derive slug from the title (WP-style). Switches off
  // the moment the admin types in the slug box, so manual overrides stick.
  const [slugAuto, setSlugAuto] = useState(true);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("eps_exams")
      .select("*")
      .order("year", { ascending: false })
      .order("exam_no", { ascending: true });
    if (error) showToast("Lỗi tải đề thi: " + error.message, "error");
    else setExams(data || []);
    setLoading(false);
  }, [showToast]);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  const fetchQuestions = async (examId: string) => {
    const { data, error } = await supabase
      .from("eps_questions")
      .select("*")
      .eq("exam_id", examId)
      .order("order_no", { ascending: true });
    if (error) showToast("Lỗi tải câu hỏi: " + error.message, "error");
    else setQuestions(data || []);
  };

  const saveExam = async () => {
    if (!form.title) { showToast("Thiếu tên đề thi", "error"); return; }

    const slugSource = (slugAuto ? form.title : form.slug || form.title).trim();
    const normalizedSlug = normalizeSlug(slugSource);
    if (!normalizedSlug) {
      showToast("Slug không hợp lệ sau khi chuẩn hóa", "error");
      return;
    }

    // Check slug trùng với đề KHÁC (lúc tạo mới: với mọi đề; lúc sửa: trừ chính nó).
    const slugConflict = exams.find(e => e.slug === normalizedSlug && e.id !== selectedExam?.id);
    if (slugConflict) {
      showToast(`Slug "${normalizedSlug}" đã được dùng cho đề khác`, "error");
      return;
    }

    const payload = { ...form, slug: normalizedSlug };
    const { error } = selectedExam
      ? await supabase.from("eps_exams").update(payload).eq("id", selectedExam.id)
      : await supabase.from("eps_exams").insert([payload]);
    if (error) { showToast("Lỗi lưu: " + error.message, "error"); return; }

    showToast(selectedExam ? "Đã cập nhật đề thi" : "Đã tạo đề thi mới", "success");
    setShowForm(false);
    setForm(INITIAL_EXAM);
    setSelectedExam(null);
    setSlugAuto(true);
    await fetchExams();
  };

  const deleteExam = async (id: string) => {
    if (!confirm("Xóa đề thi + toàn bộ câu hỏi?")) return;
    const { error } = await supabase.from("eps_exams").delete().eq("id", id);
    if (error) { showToast("Lỗi xóa: " + error.message, "error"); return; }
    showToast("Đã xóa", "success");
    if (selectedExam?.id === id) { setSelectedExam(null); setQuestions([]); }
    fetchExams();
  };

  const moveQuestion = async (questionId: string, direction: -1 | 1) => {
    const idx = questions.findIndex(q => q.id === questionId);
    if (idx === -1) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= questions.length) return;

    const newQuestions = [...questions];
    const temp = newQuestions[idx];
    newQuestions[idx] = newQuestions[newIdx];
    newQuestions[newIdx] = temp;

    // Update order_no in database
    const { error } = await supabase
      .from("eps_questions")
      .update({ order_no: newIdx + 1 })
      .eq("id", questionId);
    if (error) {
      showToast("Lỗi di chuyển câu hỏi: " + error.message, "error");
      return;
    }

    const { error: error2 } = await supabase
      .from("eps_questions")
      .update({ order_no: idx + 1 })
      .eq("id", questions[newIdx].id);
    if (error2) {
      showToast("Lỗi di chuyển câu hỏi: " + error2.message, "error");
      return;
    }

    setQuestions(newQuestions);
    showToast("Đã di chuyển câu hỏi", "success");
  };

  const loadQuestionIntoForm = useCallback((q: Question) => {
    setEditingQ(q);
    setQForm({
      order_no: q.order_no,
      question_type: q.question_type,
      question_text: q.question_text,
      question_vi: q.question_vi || "",
      options: q.options || ["", "", "", ""],
      correct_answer: q.correct_answer,
      audio_url: q.audio_url || "",
      image_url: q.image_url || "",
      difficulty: q.difficulty,
      topic: q.topic || "",
      section: q.section || "reading",
      option_type: q.option_type || "text",
      content: q.content || "",
      content_image: q.content_image || "",
      option_images: q.option_images || ["", "", "", ""],
      audio_script: q.audio_script || "",
      audio_options: q.audio_options || ["", "", "", ""],
      audio_hint: q.audio_hint || "",
      explanation: q.explanation || "",
    });
    setShowQForm(true);
  }, []);

  const saveQuestion = async (then: "prev" | "next" | "close" = "close") => {
    if (!selectedExam) return;
    if (!qForm.question_text || qForm.options.some(o => !o)) {
      showToast("Thiếu nội dung câu hỏi hoặc đáp án", "error"); return;
    }

    const orderNo = Math.max(1, qForm.order_no || 1);
    const duplicateOrder = questions.some(q => q.id !== editingQ?.id && q.order_no === orderNo);
    if (duplicateOrder) {
      showToast(`Số thứ tự ${orderNo} đã tồn tại trong đề này`, "error");
      return;
    }

    const cleanArr = (xs: string[]) => xs.every(x => !x) ? null : xs;
    const payload = {
      exam_id: selectedExam.id,
      order_no: orderNo,
      question_type: qForm.question_type,
      question_text: qForm.question_text,
      question_vi: qForm.question_vi || null,
      options: qForm.options,
      correct_answer: qForm.correct_answer,
      audio_url: qForm.audio_url || null,
      image_url: qForm.image_url || null,
      difficulty: qForm.difficulty,
      topic: qForm.topic || null,
      section: qForm.section || null,
      option_type: qForm.option_type || null,
      content: qForm.content || null,
      content_image: qForm.content_image || null,
      option_images: cleanArr(qForm.option_images),
      audio_script: qForm.audio_script || null,
      audio_options: cleanArr(qForm.audio_options),
      audio_hint: qForm.audio_hint || null,
      explanation: qForm.explanation || null,
    };
    const { error } = editingQ
      ? await supabase.from("eps_questions").update(payload).eq("id", editingQ.id)
      : await supabase.from("eps_questions").insert([payload]);
    if (error) { showToast("Lỗi lưu câu hỏi: " + error.message, "error"); return; }

    // Reload list and decide where to go next.
    const { data: fresh } = await supabase
      .from("eps_questions")
      .select("*")
      .eq("exam_id", selectedExam.id)
      .order("order_no", { ascending: true });
    const list = (fresh as Question[]) || [];
    setQuestions(list);

    if (then === "close") {
      showToast(editingQ ? "Đã cập nhật câu hỏi" : "Đã thêm câu hỏi", "success");
      setShowQForm(false);
      setQForm(INITIAL_QUESTION);
      setEditingQ(null);
      return;
    }

    const targetOrder = qForm.order_no + (then === "next" ? 1 : -1);
    const target = list.find(q => q.order_no === targetOrder);
    if (target) {
      showToast(`Đã lưu câu ${qForm.order_no} → câu ${targetOrder}`, "success");
      loadQuestionIntoForm(target);
    } else {
      showToast(`Đã lưu — không có câu ${targetOrder}`, "success");
      setShowQForm(false);
      setQForm(INITIAL_QUESTION);
      setEditingQ(null);
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm("Xóa câu hỏi này?")) return;
    const { error } = await supabase.from("eps_questions").delete().eq("id", id);
    if (error) { showToast("Lỗi xóa: " + error.message, "error"); return; }
    showToast("Đã xóa", "success");
    if (selectedExam) fetchQuestions(selectedExam.id);
  };

  const openEdit = (exam: Exam) => {
    setSelectedExam(exam);
    setForm({
      slug: exam.slug,
      title: exam.title,
      year: exam.year,
      exam_no: exam.exam_no,
      description: exam.description || "",
      total_questions: exam.total_questions,
      time_minutes: exam.time_minutes,
      is_published: exam.is_published,
    });
    setSlugAuto(false);
    setShowForm(true);
    fetchQuestions(exam.id);
  };

  const openNew = () => {
    setSelectedExam(null);
    const currentYear = new Date().getFullYear();
    const maxThisYear = Math.max(0, ...exams.filter(e => e.year === currentYear).map(e => e.exam_no));
    setForm({ ...INITIAL_EXAM, year: currentYear, exam_no: maxThisYear + 1, slug: "" });
    setSlugAuto(true);
    setQuestions([]);
    setShowForm(true);
  };

  return (
    <DashboardLayout title="Quản lý đề thi EPS" subtitle="Thêm, sửa, xóa đề thi + câu hỏi + file nghe/ảnh">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={openNew} className="px-4 py-2 rounded-lg bg-app-accent-primary/20 text-app-accent-primary text-sm font-semibold cursor-pointer hover:bg-app-accent-primary/30 transition-all">
            <i className="ri-add-line mr-1"></i>Tạo đề thi mới
          </button>
          <button onClick={fetchExams} className="px-3 py-2 rounded-lg bg-app-card text-app-text-secondary text-sm cursor-pointer hover:bg-white/5 transition-all">
            <i className="ri-refresh-line mr-1"></i>Tải lại
          </button>
        </div>

        {/* Exam form */}
        {showForm && (
          <div className="bg-app-card border border-app-border rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm">
              {selectedExam ? `Sửa đề: ${selectedExam.title}` : "Tạo đề thi mới"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-app-text-secondary text-xs block mb-1">Tên đề thi</label>
                <input
                  value={form.title}
                  onChange={e => {
                    const title = e.target.value;
                    setForm(f => ({ ...f, title, slug: slugAuto ? slugify(title) : f.slug }));
                  }}
                  placeholder="Đề số 1, Đề thi EPS-TOPIK 2025 đợt 1, ..."
                  className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50"
                />
              </div>
              <div>
                <label className="text-app-text-secondary text-xs block mb-1">
                  Slug URL {slugAuto && <span className="text-emerald-400/60 text-[10px]">• tự sinh từ tên</span>}
                </label>
                <input
                  value={form.slug}
                  onChange={e => { setSlugAuto(false); setForm({ ...form, slug: e.target.value }); }}
                  placeholder="de-so-1"
                  className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50"
                />
              </div>
            </div>
            <div>
              <label className="text-app-text-secondary text-xs block mb-1">Mô tả</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50" />
            </div>
            <details className="bg-app-bg/40 rounded-lg px-3 py-2 border border-app-border">
              <summary className="cursor-pointer text-app-text-secondary text-xs font-medium select-none">
                <i className="ri-settings-3-line mr-1"></i>Thông số nâng cao (năm, số đề, số câu, phút)
              </summary>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-app-text-secondary text-xs block mb-1">Năm</label>
                  <input type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm focus:outline-none focus:border-app-accent-primary/50" />
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs block mb-1">Số đề</label>
                  <input type="number" value={form.exam_no} onChange={e => setForm({ ...form, exam_no: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm focus:outline-none focus:border-app-accent-primary/50" />
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs block mb-1">Số câu</label>
                  <input type="number" value={form.total_questions} onChange={e => setForm({ ...form, total_questions: parseInt(e.target.value) || 40 })} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm focus:outline-none focus:border-app-accent-primary/50" />
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs block mb-1">Phút</label>
                  <input type="number" value={form.time_minutes} onChange={e => setForm({ ...form, time_minutes: parseInt(e.target.value) || 50 })} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm focus:outline-none focus:border-app-accent-primary/50" />
                </div>
              </div>
            </details>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-white/70 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_published} onChange={e => setForm({ ...form, is_published: e.target.checked })} className="rounded accent-app-accent-primary" />
                Xuất bản (học viên có thể xem)
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={saveExam} className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-semibold cursor-pointer hover:bg-emerald-500/30 transition-all">
                <i className="ri-save-line mr-1"></i>Lưu đề thi
              </button>
              <button onClick={() => { setShowForm(false); setSelectedExam(null); setQuestions([]); }} className="px-4 py-2 rounded-lg bg-white/5 text-white/50 text-sm cursor-pointer hover:bg-white/10 transition-all">
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Exam list */}
        <div className="bg-app-card border border-app-border rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-app-border flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Danh sách đề thi ({exams.length})</h3>
            {loading && <span className="text-app-text-muted text-xs">Đang tải...</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-app-border bg-app-bg/50">
                  <th className="px-4 py-2 text-left text-app-text-muted text-xs font-medium">Slug</th>
                  <th className="px-4 py-2 text-left text-app-text-muted text-xs font-medium">Tên đề</th>
                  <th className="px-4 py-2 text-left text-app-text-muted text-xs font-medium">Năm · Đề</th>
                  <th className="px-4 py-2 text-left text-app-text-muted text-xs font-medium">Câu hỏi</th>
                  <th className="px-4 py-2 text-left text-app-text-muted text-xs font-medium">Trạng thái</th>
                  <th className="px-4 py-2 text-right text-app-text-muted text-xs font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {exams.map(exam => (
                  <tr key={exam.id} className="border-b border-app-border/50 hover:bg-white/3">
                    <td className="px-4 py-3 text-white/80 font-mono text-xs">{exam.slug}</td>
                    <td className="px-4 py-3 text-white text-sm font-medium">{exam.title}</td>
                    <td className="px-4 py-3 text-white/60 text-xs">{exam.year} · Đề {exam.exam_no}</td>
                    <td className="px-4 py-3 text-white/60 text-xs">{exam.total_questions} câu · {exam.time_minutes} phút</td>
                    <td className="px-4 py-3">
                      {exam.is_published ? (
                        <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">Đã xuất bản</span>
                      ) : (
                        <span className="text-amber-400 text-xs font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">Nháp</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(exam)} className="text-app-accent-primary/70 hover:text-app-accent-primary text-xs cursor-pointer mr-3">
                        <i className="ri-edit-line mr-0.5"></i>Sửa
                      </button>
                      <button onClick={() => deleteExam(exam.id)} className="text-red-400/70 hover:text-red-400 text-xs cursor-pointer">
                        <i className="ri-delete-bin-line mr-0.5"></i>Xóa
                      </button>
                    </td>
                  </tr>
                ))}
                {exams.length === 0 && !loading && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-app-text-muted text-sm">Chưa có đề thi nào. Bấm "Tạo đề thi mới" để bắt đầu.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Questions of selected exam - 2-column layout */}
        {selectedExam && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Question list */}
            <div className="bg-app-card border border-app-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-app-border flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">Câu hỏi ({questions.length})</h3>
                <div className="flex gap-2">
                  <button onClick={() => { setShowQForm(true); setEditingQ(null); setQForm({ ...INITIAL_QUESTION, order_no: questions.length + 1 }); }} className="px-3 py-1.5 rounded-lg bg-app-accent-primary/20 text-app-accent-primary text-xs font-semibold cursor-pointer hover:bg-app-accent-primary/30 transition-all">
                    <i className="ri-add-line mr-1"></i>Thêm
                  </button>
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    onClick={() => loadQuestionIntoForm(q)}
                    className={`px-4 py-3 border-b border-app-border/50 cursor-pointer transition-all hover:bg-white/5 ${editingQ?.id === q.id ? "bg-app-accent-primary/10 border-l-4 border-l-app-accent-primary" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-app-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-white/60">{q.order_no}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{q.question_text}</p>
                        <p className="text-app-text-muted text-xs truncate">{q.question_vi || "Chưa có dịch"}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${q.question_type === "reading" ? "bg-blue-500/20 text-blue-400" : q.question_type === "listening" ? "bg-purple-500/20 text-purple-400" : "bg-amber-500/20 text-amber-400"}`}>
                            {q.question_type}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${q.difficulty === "easy" ? "bg-emerald-500/20 text-emerald-400" : q.difficulty === "medium" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>
                            {q.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={(e) => { e.stopPropagation(); moveQuestion(q.id, -1); }} className="text-white/40 hover:text-white text-xs" disabled={idx === 0}>
                          <i className="ri-arrow-up-line"></i>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); moveQuestion(q.id, 1); }} className="text-white/40 hover:text-white text-xs" disabled={idx === questions.length - 1}>
                          <i className="ri-arrow-down-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {questions.length === 0 && (
                  <div className="px-4 py-8 text-center text-app-text-muted text-sm">Chưa có câu hỏi nào</div>
                )}
              </div>
            </div>

            {/* Right: Question form/preview */}
            <div className="bg-app-card border border-app-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-app-border">
                <h3 className="text-white font-semibold text-sm">{editingQ ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-app-text-secondary text-xs block mb-1">Số thứ tự</label>
                    <input type="number" value={qForm.order_no} onChange={e => setQForm({ ...qForm, order_no: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm focus:outline-none focus:border-app-accent-primary/50" />
                  </div>
                  <div>
                    <label className="text-app-text-secondary text-xs block mb-1">Loại câu</label>
                    <select value={qForm.question_type} onChange={e => setQForm({ ...qForm, question_type: e.target.value as any })} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm focus:outline-none focus:border-app-accent-primary/50">
                      <option value="reading">Đọc hiểu</option>
                      <option value="listening">Nghe</option>
                      <option value="image">Có hình</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-app-text-secondary text-xs block mb-1">Độ khó</label>
                    <select value={qForm.difficulty} onChange={e => setQForm({ ...qForm, difficulty: e.target.value as any })} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm focus:outline-none focus:border-app-accent-primary/50">
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-app-text-secondary text-xs block mb-1">Chủ đề</label>
                    <input value={qForm.topic} onChange={e => setQForm({ ...qForm, topic: e.target.value })} placeholder="greeting, transport..." className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs block mb-1">Câu hỏi (tiếng Hàn)</label>
                  <textarea value={qForm.question_text} onChange={e => setQForm({ ...qForm, question_text: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50" />
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs block mb-1">Câu hỏi (tiếng Việt)</label>
                  <textarea value={qForm.question_vi} onChange={e => setQForm({ ...qForm, question_vi: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {qForm.options.map((opt, i) => (
                    <div key={i}>
                      <label className="text-app-text-secondary text-xs block mb-1">Đáp án {String.fromCharCode(65 + i)} {qForm.correct_answer === i + 1 && <span className="text-emerald-400">✓ Đúng</span>}</label>
                      <input value={opt} onChange={e => {
                        const newOpts = [...qForm.options];
                        newOpts[i] = e.target.value;
                        setQForm({ ...qForm, options: newOpts });
                      }} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-app-text-secondary text-xs block mb-1">Đáp án đúng</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(n => (
                      <button key={n} onClick={() => setQForm({ ...qForm, correct_answer: n })} className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${qForm.correct_answer === n ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-app-bg text-white/40 border border-app-border hover:border-white/20"}`}>
                        {String.fromCharCode(64 + n)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field bổ sung cho đề thực (đề 1, 2) */}
                <details className="bg-app-bg/40 rounded-lg px-3 py-2 border border-app-border">
                  <summary className="cursor-pointer text-app-text-secondary text-xs font-medium select-none">
                    <i className="ri-settings-3-line mr-1"></i>Nâng cao (section, content, audio script, giải thích)
                  </summary>
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-app-text-secondary text-xs block mb-1">Section</label>
                        <select value={qForm.section} onChange={e => setQForm({ ...qForm, section: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm focus:outline-none focus:border-app-accent-primary/50">
                          <option value="reading">Đọc (reading)</option>
                          <option value="listening">Nghe (listening)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-app-text-secondary text-xs block mb-1">Kiểu đáp án</label>
                        <select value={qForm.option_type} onChange={e => setQForm({ ...qForm, option_type: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm focus:outline-none focus:border-app-accent-primary/50">
                          <option value="text">Chữ (text)</option>
                          <option value="image">4 ảnh (image)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-app-text-secondary text-xs block mb-1">Content (đoạn văn / từ phụ tách khỏi prompt)</label>
                      <textarea value={qForm.content} onChange={e => setQForm({ ...qForm, content: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50" />
                    </div>
                    <div>
                      <label className="text-app-text-secondary text-xs block mb-1">Content image (ảnh đoạn văn / biểu đồ)</label>
                      <FileUploadZone
                        label=""
                        accept="image/*,.png,.jpg,.jpeg,.webp"
                        pathPrefix="images"
                        value={qForm.content_image}
                        onUploaded={path => setQForm({ ...qForm, content_image: path })}
                      />
                      <input
                        value={qForm.content_image}
                        onChange={e => setQForm({ ...qForm, content_image: e.target.value })}
                        placeholder="hoặc gõ path tay (vd: /de1/p3_img3.webp)"
                        className="w-full mt-2 px-3 py-1.5 rounded-lg bg-app-bg border border-app-border text-white/70 text-xs font-mono placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-app-text-secondary text-xs block mb-1">4 ảnh đáp án (option_type=image)</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map(i => (
                          <div key={i}>
                            <div className="text-[10px] text-app-text-muted mb-1">{String.fromCharCode(65 + i)}</div>
                            <FileUploadZone
                              label=""
                              accept="image/*,.png,.jpg,.jpeg,.webp"
                              pathPrefix="images"
                              value={qForm.option_images[i] || ""}
                              onUploaded={path => {
                                const newImgs = [...qForm.option_images];
                                while (newImgs.length < 4) newImgs.push("");
                                newImgs[i] = path;
                                setQForm({ ...qForm, option_images: newImgs });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <textarea
                        value={qForm.option_images.join("\n")}
                        onChange={e => {
                          const lines = e.target.value.split("\n");
                          while (lines.length < 4) lines.push("");
                          setQForm({ ...qForm, option_images: lines.slice(0, 4) });
                        }}
                        rows={4}
                        placeholder={"hoặc gõ tay 4 path, mỗi dòng 1 path\n/de1/p2_img3.webp\n/de1/p2_img4.webp\n..."}
                        className="w-full mt-2 px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white/70 text-xs font-mono placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-app-text-secondary text-xs block mb-1">Audio script (text TTS — câu nghe)</label>
                      <textarea value={qForm.audio_script} onChange={e => setQForm({ ...qForm, audio_script: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50" />
                    </div>
                    <div>
                      <label className="text-app-text-secondary text-xs block mb-1">4 audio đáp án (TTS) — mỗi dòng 1 script</label>
                      <textarea value={qForm.audio_options.join("\n")} onChange={e => {
                        const lines = e.target.value.split("\n");
                        while (lines.length < 4) lines.push("");
                        setQForm({ ...qForm, audio_options: lines.slice(0, 4) });
                      }} rows={4} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-xs placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50" />
                    </div>
                    <div>
                      <label className="text-app-text-secondary text-xs block mb-1">Audio hint (gợi ý hiện sau khi nghe)</label>
                      <input value={qForm.audio_hint} onChange={e => setQForm({ ...qForm, audio_hint: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50" />
                    </div>
                    <div>
                      <label className="text-app-text-secondary text-xs block mb-1">Giải thích đáp án (hiện ở review mode)</label>
                      <textarea value={qForm.explanation} onChange={e => setQForm({ ...qForm, explanation: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50" />
                    </div>
                  </div>
                </details>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FileUploadZone
                    label="File Audio (kéo thả hoặc click)"
                    accept="audio/*,.mp3,.wav,.m4a"
                    pathPrefix="audio"
                    value={qForm.audio_url}
                    onUploaded={path => setQForm({ ...qForm, audio_url: path })}
                  />
                  <FileUploadZone
                    label="File Hình ảnh (kéo thả hoặc click)"
                    accept="image/*,.png,.jpg,.jpeg,.webp"
                    pathPrefix="images"
                    value={qForm.image_url}
                    onUploaded={path => setQForm({ ...qForm, image_url: path })}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => saveQuestion("close")} className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-semibold cursor-pointer hover:bg-emerald-500/30 transition-all">
                    <i className="ri-save-line mr-1"></i>Lưu
                  </button>
                  <button
                    onClick={() => saveQuestion("prev")}
                    disabled={qForm.order_no <= 1}
                    className="px-3 py-2 rounded-lg bg-app-accent-primary/15 text-app-accent-primary text-sm cursor-pointer hover:bg-app-accent-primary/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <i className="ri-arrow-left-line mr-1"></i>Lưu & câu trước
                  </button>
                  <button
                    onClick={() => saveQuestion("next")}
                    className="px-3 py-2 rounded-lg bg-app-accent-primary/15 text-app-accent-primary text-sm cursor-pointer hover:bg-app-accent-primary/25 transition-all"
                  >
                    Lưu & câu sau<i className="ri-arrow-right-line ml-1"></i>
                  </button>
                  <button onClick={() => { setShowQForm(false); setEditingQ(null); }} className="ml-auto px-4 py-2 rounded-lg bg-white/5 text-white/50 text-sm cursor-pointer hover:bg-white/10 transition-all">
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
