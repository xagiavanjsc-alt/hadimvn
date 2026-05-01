import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ParsedQuestion {
  id: string;
  number: number;
  text: string;
  options: string[];
  correctIndex: number | null;
  userAnswer: number | null;
}

interface UploadedExam {
  id: string;
  name: string;
  year: string;
  questions: ParsedQuestion[];
  uploadedAt: string;
  source: string;
}

type Phase = "upload" | "exam" | "result";

// ─── Official Exam Library (built-in sample sets) ─────────────────────────────
const OFFICIAL_EXAM_SAMPLES: UploadedExam[] = [
  {
    id: "eps2023",
    name: "Đề thi EPS-TOPIK 2023 (Mẫu)",
    year: "2023",
    source: "Bộ Lao động Hàn Quốc",
    uploadedAt: new Date().toISOString(),
    questions: Array.from({ length: 40 }, (_, i) => ({
      id: `q${i + 1}`,
      number: i + 1,
      text: `Câu ${i + 1}: [Đề thi EPS-TOPIK 2023] Chọn đáp án đúng nhất cho câu hỏi sau về ${["giao tiếp cơ bản", "an toàn lao động", "văn hóa Hàn Quốc", "pháp luật lao động"][i % 4]}.`,
      options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      correctIndex: Math.floor(Math.random() * 4),
      userAnswer: null,
    })),
  },
  {
    id: "eps2022",
    name: "Đề thi EPS-TOPIK 2022 (Mẫu)",
    year: "2022",
    source: "Bộ Lao động Hàn Quốc",
    uploadedAt: new Date().toISOString(),
    questions: Array.from({ length: 40 }, (_, i) => ({
      id: `q${i + 1}`,
      number: i + 1,
      text: `Câu ${i + 1}: [Đề thi EPS-TOPIK 2022] Câu hỏi về ${["nghe hiểu", "đọc hiểu", "sinh hoạt hàng ngày", "nơi làm việc"][i % 4]}.`,
      options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      correctIndex: Math.floor(Math.random() * 4),
      userAnswer: null,
    })),
  },
];

// ─── Upload Zone ──────────────────────────────────────────────────────────────
interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  processing: boolean;
}

function UploadZone({ onFileSelect, processing }: UploadZoneProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  }, [onFileSelect]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => fileRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
        dragging ? "border-[#e8c84a] bg-[#e8c84a]/5" : "border-gray-300 hover:border-[#e8c84a]/50 hover:bg-[#e8c84a]/3"
      }`}
    >
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={e => e.target.files?.[0] && onFileSelect(e.target.files[0])}
      />
      {processing ? (
        <div className="space-y-3">
          <div className="w-12 h-12 border-2 border-[#e8c84a]/30 border-t-[#e8c84a] rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Đang xử lý file...</p>
          <p className="text-gray-400 text-sm">Hệ thống đang phân tích đề thi</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-[#e8c84a]/10 mx-auto">
            <i className="ri-upload-cloud-2-line text-[#e8c84a] text-3xl"></i>
          </div>
          <div>
            <p className="text-gray-700 font-semibold text-base">Kéo thả hoặc click để upload đề thi</p>
            <p className="text-gray-400 text-sm mt-1">Hỗ trợ: PDF, Word (.doc/.docx), TXT</p>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1"><i className="ri-file-pdf-line text-rose-400"></i> PDF</span>
            <span className="flex items-center gap-1"><i className="ri-file-word-line text-blue-400"></i> Word</span>
            <span className="flex items-center gap-1"><i className="ri-file-text-line text-gray-400"></i> TXT</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Exam Session ─────────────────────────────────────────────────────────────
interface ExamSessionProps {
  exam: UploadedExam;
  onFinish: (answers: (number | null)[]) => void;
  onBack: () => void;
}

function ExamSession({ exam, onFinish, onBack }: ExamSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(exam.questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(40 * 60);

  const q = exam.questions[currentIndex];
  const answered = answers.filter(a => a !== null).length;

  const selectAnswer = (idx: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[currentIndex] = idx;
      return next;
    });
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const timerColor = timeLeft < 300 ? "text-rose-500" : timeLeft < 600 ? "text-orange-500" : "text-emerald-600";

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f4f6fb]">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 shadow-sm">
        <button onClick={onBack} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm cursor-pointer whitespace-nowrap">
          <i className="ri-arrow-left-line"></i>
          Thoát
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-gray-700 font-semibold text-sm truncate">{exam.name}</p>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-[#e8c84a] rounded-full transition-all" style={{ width: `${((currentIndex + 1) / exam.questions.length) * 100}%` }} />
          </div>
        </div>
        <div className={`flex items-center gap-1.5 font-mono font-bold text-sm ${timerColor}`}>
          <i className="ri-timer-line"></i>
          {formatTime(timeLeft)}
        </div>
        <span className="text-gray-400 text-xs">{answered}/{exam.questions.length}</span>
        <button
          onClick={() => onFinish(answers)}
          className="px-4 py-1.5 bg-[#e8c84a] text-[#0f1117] rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap"
        >
          Nộp bài
        </button>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#e8c84a]/15 text-[#e8c84a] text-xs font-bold">{q.number}</span>
              <span className="text-gray-400 text-xs">Câu {currentIndex + 1}/{exam.questions.length}</span>
            </div>
            <p className="text-gray-700 font-medium text-sm leading-relaxed">{q.text}</p>
          </div>

          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  answers[currentIndex] === i
                    ? "bg-[#e8c84a]/10 border-[#e8c84a]/40 text-gray-800"
                    : "bg-white border-gray-200 text-gray-600 hover:border-[#e8c84a]/30 hover:bg-[#e8c84a]/3"
                }`}
              >
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                  answers[currentIndex] === i ? "bg-[#e8c84a] text-[#0f1117]" : "bg-gray-100 text-gray-500"
                }`}>
                  {["①", "②", "③", "④"][i]}
                </span>
                <span className="text-sm">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl text-gray-600 text-sm disabled:opacity-40 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line"></i>
            Trước
          </button>
          <div className="flex-1 flex gap-1 overflow-x-auto">
            {exam.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-7 h-7 flex-shrink-0 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  i === currentIndex ? "bg-[#e8c84a] text-[#0f1117]" :
                  answers[i] !== null ? "bg-[#e8c84a]/20 text-[#e8c84a]" :
                  "bg-gray-100 text-gray-400"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => currentIndex === exam.questions.length - 1 ? onFinish(answers) : setCurrentIndex(prev => prev + 1)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap"
          >
            {currentIndex === exam.questions.length - 1 ? "Nộp bài" : "Tiếp"}
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Result Screen ────────────────────────────────────────────────────────────
function ResultScreen({ exam, answers, onRetry, onBack }: { exam: UploadedExam; answers: (number | null)[]; onRetry: () => void; onBack: () => void }) {
  const correct = exam.questions.filter((q, i) => q.correctIndex !== null && answers[i] === q.correctIndex).length;
  const answered = answers.filter(a => a !== null).length;
  const score = Math.round((correct / exam.questions.length) * 100);
  const passed = score >= 80;

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <div className={`rounded-2xl p-6 text-center mb-6 ${passed ? "bg-emerald-50 border border-emerald-200" : "bg-rose-50 border border-rose-200"}`}>
        <div className={`w-20 h-20 flex items-center justify-center rounded-full mx-auto mb-3 ${passed ? "bg-emerald-100" : "bg-rose-100"}`}>
          <span className={`text-2xl font-bold ${passed ? "text-emerald-600" : "text-rose-500"}`}>{score}</span>
        </div>
        <h2 className={`text-xl font-bold mb-1 ${passed ? "text-emerald-700" : "text-rose-600"}`}>
          {passed ? "ĐẬU! Xuất sắc!" : "Chưa đậu — Cố lên!"}
        </h2>
        <p className="text-gray-500 text-sm">{correct}/{exam.questions.length} câu đúng • {answered} câu đã trả lời</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Câu đúng", value: correct, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Câu sai", value: answered - correct, color: "text-rose-500", bg: "bg-rose-50" },
          { label: "Chưa trả lời", value: exam.questions.length - answered, color: "text-gray-500", bg: "bg-gray-50" },
        ].map((item, i) => (
          <div key={i} className={`${item.bg} rounded-xl p-4 text-center border border-gray-200`}>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="text-gray-500 text-xs mt-1">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap">
          Về thư viện đề
        </button>
        <button onClick={onRetry} className="flex-1 py-3 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap">
          Thi lại
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EpsOfficialExamPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("upload");
  const [exams, setExams] = useState<UploadedExam[]>(OFFICIAL_EXAM_SAMPLES);
  const [selectedExam, setSelectedExam] = useState<UploadedExam | null>(null);
  const [processing, setProcessing] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setProcessing(true);
    setUploadMsg(null);

    // Simulate processing
    await new Promise(r => setTimeout(r, 2000));

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "doc", "docx", "txt"].includes(ext || "")) {
      setUploadMsg("Định dạng file không được hỗ trợ. Vui lòng dùng PDF, Word hoặc TXT.");
      setProcessing(false);
      return;
    }

    // Create mock parsed exam from uploaded file
    const newExam: UploadedExam = {
      id: `upload_${Date.now()}`,
      name: file.name.replace(/\.[^.]+$/, ""),
      year: new Date().getFullYear().toString(),
      source: "Upload từ người dùng",
      uploadedAt: new Date().toISOString(),
      questions: Array.from({ length: 40 }, (_, i) => ({
        id: `uq${i + 1}`,
        number: i + 1,
        text: `Câu ${i + 1}: [${file.name}] Câu hỏi được trích xuất từ file đề thi. Trong phiên bản đầy đủ, hệ thống AI sẽ tự động phân tích và trích xuất câu hỏi từ file PDF/Word của bạn.`,
        options: [
          "Đáp án A — Được trích xuất từ file",
          "Đáp án B — Được trích xuất từ file",
          "Đáp án C — Được trích xuất từ file",
          "Đáp án D — Được trích xuất từ file",
        ],
        correctIndex: null, // Unknown from upload
        userAnswer: null,
      })),
    };

    setExams(prev => [newExam, ...prev]);
    setUploadMsg(`Đã upload thành công "${file.name}" — ${newExam.questions.length} câu hỏi`);
    setProcessing(false);
  }, []);

  const startExam = (exam: UploadedExam) => {
    setSelectedExam(exam);
    setAnswers(new Array(exam.questions.length).fill(null));
    setPhase("exam");
  };

  const handleFinish = (ans: (number | null)[]) => {
    setAnswers(ans);
    setPhase("result");
  };

  if (phase === "exam" && selectedExam) {
    return (
      <ExamSession
        exam={selectedExam}
        onFinish={handleFinish}
        onBack={() => setPhase("upload")}
      />
    );
  }

  if (phase === "result" && selectedExam) {
    return (
      <DashboardLayout title="Kết quả thi thử">
        <ResultScreen
          exam={selectedExam}
          answers={answers}
          onRetry={() => startExam(selectedExam)}
          onBack={() => setPhase("upload")}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Thi thử EPS bộ đề chính thức" subtitle="Upload đề thi PDF/Word từ Bộ Lao động Hàn Quốc">
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <i className="ri-information-line text-blue-500 text-lg flex-shrink-0 mt-0.5"></i>
          <div>
            <p className="text-blue-700 font-semibold text-sm">Cách sử dụng</p>
            <p className="text-blue-600 text-xs mt-1 leading-relaxed">
              Upload file đề thi EPS-TOPIK chính thức từ website Bộ Lao động Hàn Quốc (eps.hrdkorea.or.kr) hoặc các nguồn uy tín. 
              Hệ thống sẽ tự động phân tích và tạo bài thi tương tác. Hoặc chọn đề mẫu có sẵn bên dưới để luyện tập ngay.
            </p>
          </div>
        </div>

        {/* Upload zone */}
        <div className="mb-6">
          <h2 className="text-gray-700 font-semibold text-sm mb-3 flex items-center gap-2">
            <i className="ri-upload-cloud-2-line text-[#e8c84a]"></i>
            Upload đề thi của bạn
          </h2>
          <UploadZone onFileSelect={handleFileUpload} processing={processing} />
          {uploadMsg && (
            <div className={`mt-3 flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
              uploadMsg.includes("thành công") ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-rose-50 border border-rose-200 text-rose-600"
            }`}>
              <i className={uploadMsg.includes("thành công") ? "ri-checkbox-circle-line" : "ri-error-warning-line"}></i>
              {uploadMsg}
            </div>
          )}
        </div>

        {/* Exam library */}
        <div>
          <h2 className="text-gray-700 font-semibold text-sm mb-3 flex items-center gap-2">
            <i className="ri-book-shelf-line text-[#e8c84a]"></i>
            Thư viện đề thi ({exams.length} bộ đề)
          </h2>
          <div className="space-y-3">
            {exams.map(exam => (
              <div key={exam.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#e8c84a]/10 flex-shrink-0">
                  <i className="ri-file-list-3-line text-[#e8c84a] text-xl"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-gray-800 font-semibold text-sm truncate">{exam.name}</h3>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <i className="ri-calendar-line text-[10px]"></i>
                      {exam.year}
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <i className="ri-file-list-line text-[10px]"></i>
                      {exam.questions.length} câu
                    </span>
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <i className="ri-government-line text-[10px]"></i>
                      {exam.source}
                    </span>
                    {exam.id.startsWith("upload_") && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-medium">Đã upload</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => startExam(exam)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  <i className="ri-play-fill"></i>
                  Thi ngay
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <h3 className="text-gray-700 font-semibold text-sm mb-3 flex items-center gap-2">
            <i className="ri-lightbulb-line text-[#e8c84a]"></i>
            Mẹo luyện thi hiệu quả
          </h3>
          <div className="space-y-2">
            {[
              "Tải đề thi chính thức từ eps.hrdkorea.or.kr (website chính thức của Bộ Lao động Hàn Quốc)",
              "Luyện tập với đề thi từ 3-5 năm gần nhất để nắm format câu hỏi",
              "Kết hợp với tính năng Ôn tập câu sai thông minh để tập trung vào điểm yếu",
              "Mục tiêu đạt 80%+ trong 3 lần thi liên tiếp trước khi thi thật",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-[#e8c84a]/15 flex-shrink-0 mt-0.5">
                  <span className="text-[#e8c84a] text-[10px] font-bold">{i + 1}</span>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


