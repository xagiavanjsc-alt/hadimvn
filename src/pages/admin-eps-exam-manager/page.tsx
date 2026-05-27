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
};

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

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "";
    const fileName = `${pathPrefix}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from("eps-exams").upload(fileName, file, { upsert: true });
    setUploading(false);
    if (error) { showToast("Upload lỗi: " + error.message, "error"); return; }
    onUploaded(fileName);
    showToast("Đã upload: " + fileName, "success");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = Array.from(e.dataTransfer.files).find(f => accept.split(",").some(t => f.type.startsWith(t.trim()) || f.name.endsWith(t.trim())));
    if (file) handleFile(file);
  }, [accept]);

  return (
    <div>
      <label className="text-app-text-secondary text-xs block mb-1">{label}</label>
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
    if (!form.slug || !form.title) { showToast("Thiếu slug hoặc tên đề thi", "error"); return; }
    const payload = { ...form };
    const { error } = form.slug && exams.find(e => e.slug === form.slug && e.id !== selectedExam?.id)
      ? await supabase.from("eps_exams").update(payload).eq("id", selectedExam!.id)
      : selectedExam
      ? await supabase.from("eps_exams").update(payload).eq("id", selectedExam.id)
      : await supabase.from("eps_exams").insert([payload]);
    if (error) { showToast("Lỗi lưu: " + error.message, "error"); return; }
    showToast(selectedExam ? "Đã cập nhật đề thi" : "Đã tạo đề thi mới", "success");
    setShowForm(false);
    setForm(INITIAL_EXAM);
    setSelectedExam(null);
    fetchExams();
  };

  const deleteExam = async (id: string) => {
    if (!confirm("Xóa đề thi + toàn bộ câu hỏi?")) return;
    const { error } = await supabase.from("eps_exams").delete().eq("id", id);
    if (error) { showToast("Lỗi xóa: " + error.message, "error"); return; }
    showToast("Đã xóa", "success");
    if (selectedExam?.id === id) { setSelectedExam(null); setQuestions([]); }
    fetchExams();
  };

  const saveQuestion = async () => {
    if (!selectedExam) return;
    if (!qForm.question_text || qForm.options.some(o => !o)) {
      showToast("Thiếu nội dung câu hỏi hoặc đáp án", "error"); return;
    }
    const payload = {
      ...qForm,
      exam_id: selectedExam.id,
      audio_url: qForm.audio_url || null,
      image_url: qForm.image_url || null,
    };
    const { error } = editingQ
      ? await supabase.from("eps_questions").update(payload).eq("id", editingQ.id)
      : await supabase.from("eps_questions").insert([payload]);
    if (error) { showToast("Lỗi lưu câu hỏi: " + error.message, "error"); return; }
    showToast(editingQ ? "Đã cập nhật câu hỏi" : "Đã thêm câu hỏi", "success");
    setShowQForm(false);
    setQForm(INITIAL_QUESTION);
    setEditingQ(null);
    fetchQuestions(selectedExam.id);
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
    setShowForm(true);
    fetchQuestions(exam.id);
  };

  const openNew = () => {
    setSelectedExam(null);
    setForm(INITIAL_EXAM);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-app-text-secondary text-xs block mb-1">Slug (unique)</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="eps-de-1-2025" className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50" />
              </div>
              <div>
                <label className="text-app-text-secondary text-xs block mb-1">Tên đề thi</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Đề thi EPS-TOPIK 2025 đợt 1" className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50" />
              </div>
              <div>
                <label className="text-app-text-secondary text-xs block mb-1">Năm</label>
                <input type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm focus:outline-none focus:border-app-accent-primary/50" />
              </div>
              <div>
                <label className="text-app-text-secondary text-xs block mb-1">Số đề</label>
                <input type="number" value={form.exam_no} onChange={e => setForm({ ...form, exam_no: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm focus:outline-none focus:border-app-accent-primary/50" />
              </div>
            </div>
            <div>
              <label className="text-app-text-secondary text-xs block mb-1">Mô tả</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-app-bg border border-app-border text-white text-sm placeholder-white/25 focus:outline-none focus:border-app-accent-primary/50" />
            </div>
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

        {/* Questions of selected exam */}
        {selectedExam && (
          <div className="bg-app-card border border-app-border rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-app-border flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm">Câu hỏi: {selectedExam.title} ({questions.length} câu)</h3>
              <button onClick={() => { setShowQForm(true); setEditingQ(null); setQForm({ ...INITIAL_QUESTION, order_no: questions.length + 1 }); }} className="px-3 py-1.5 rounded-lg bg-app-accent-primary/20 text-app-accent-primary text-xs font-semibold cursor-pointer hover:bg-app-accent-primary/30 transition-all">
                <i className="ri-add-line mr-1"></i>Thêm câu
              </button>
            </div>

            {/* Question form */}
            {showQForm && (
              <div className="p-5 border-b border-app-border bg-app-bg/30 space-y-4">
                <h4 className="text-white/80 text-sm font-medium">{editingQ ? "Sửa câu hỏi" : "Thêm câu hỏi mới"}</h4>
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
                <div className="flex items-center gap-2">
                  <button onClick={saveQuestion} className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-semibold cursor-pointer hover:bg-emerald-500/30 transition-all">
                    <i className="ri-save-line mr-1"></i>Lưu câu hỏi
                  </button>
                  <button onClick={() => { setShowQForm(false); setEditingQ(null); }} className="px-4 py-2 rounded-lg bg-white/5 text-white/50 text-sm cursor-pointer hover:bg-white/10 transition-all">
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Question list */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-app-border bg-app-bg/50">
                    <th className="px-4 py-2 text-left text-app-text-muted text-xs font-medium">#</th>
                    <th className="px-4 py-2 text-left text-app-text-muted text-xs font-medium">Loại</th>
                    <th className="px-4 py-2 text-left text-app-text-muted text-xs font-medium">Câu hỏi</th>
                    <th className="px-4 py-2 text-left text-app-text-muted text-xs font-medium">Đáp án đúng</th>
                    <th className="px-4 py-2 text-left text-app-text-muted text-xs font-medium">Media</th>
                    <th className="px-4 py-2 text-right text-app-text-muted text-xs font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map(q => (
                    <tr key={q.id} className="border-b border-app-border/50 hover:bg-white/3">
                      <td className="px-4 py-3 text-white/60 text-xs">{q.order_no}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${q.question_type === 'listening' ? 'bg-blue-500/10 text-blue-400' : q.question_type === 'image' ? 'bg-purple-500/10 text-purple-400' : 'bg-white/5 text-white/50'}`}>
                          {q.question_type === 'listening' ? 'Nghe' : q.question_type === 'image' ? 'Hình' : 'Đọc'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/80 text-xs max-w-[300px] truncate">{q.question_text}</td>
                      <td className="px-4 py-3 text-emerald-400 text-xs font-semibold">{String.fromCharCode(64 + q.correct_answer)}</td>
                      <td className="px-4 py-3 text-white/40 text-xs">
                        <div className="flex flex-col gap-1">
                          {q.audio_url && (
                            <audio controls src={getStorageUrl(q.audio_url)} className="w-24 h-6" />
                          )}
                          {q.image_url && (
                            <img src={getStorageUrl(q.image_url)} alt="" className="h-10 w-auto rounded border border-app-border object-contain" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setEditingQ(q); setQForm({ ...INITIAL_QUESTION, ...q, options: q.options || ["","","",""] }); setShowQForm(true); }} className="text-app-accent-primary/70 hover:text-app-accent-primary text-xs cursor-pointer mr-3">
                          <i className="ri-edit-line mr-0.5"></i>Sửa
                        </button>
                        <button onClick={() => deleteQuestion(q.id)} className="text-red-400/70 hover:text-red-400 text-xs cursor-pointer">
                          <i className="ri-delete-bin-line mr-0.5"></i>Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                  {questions.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-app-text-muted text-sm">Chưa có câu hỏi nào. Bấm "Thêm câu" để bắt đầu.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
