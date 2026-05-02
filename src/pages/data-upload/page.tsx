import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type UploadType = "melon" | "naver";

interface MelonRow {
  rank: number;
  title: string;
  artist: string;
  genre: string;
  vocabulary: { word: string; meaning: string; example: string }[];
  story: string;
  explanation: string;
  stars: number;
  approvedAt: string;
}

interface NaverRow {
  id: string;
  questionKr: string;
  category: string;
  translatedQuestion: string;
  rewrittenAnswer: string;
  hashtags: string[];
  approvedAt: string;
}

function parseCSV(text: string): string[][] {
  const lines = text.trim().split("\n");
  return lines.map((line) => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  });
}

function parseMelonCSV(rows: string[][]): MelonRow[] {
  const header = rows[0].map((h) => h.toLowerCase().trim());
  return rows.slice(1).map((row, i) => {
    const get = (key: string) => row[header.indexOf(key)] || "";
    const vocabRaw = get("vocabulary") || get("từ vựng") || get("vocab");
    const vocab = vocabRaw
      ? vocabRaw.split("|").map((v) => {
          const parts = v.split(":");
          return { word: parts[0]?.trim() || "", meaning: parts[1]?.trim() || "", example: parts[2]?.trim() || "" };
        })
      : [];
    return {
      rank: parseInt(get("rank") || get("hạng") || String(i + 1)) || i + 1,
      title: get("title") || get("tên bài") || get("bài hát") || `Bài ${i + 1}`,
      artist: get("artist") || get("nghệ sĩ") || "",
      genre: get("genre") || get("thể loại") || "K-pop",
      vocabulary: vocab,
      story: get("story") || get("câu chuyện") || "",
      explanation: get("explanation") || get("giải thích") || "",
      stars: parseInt(get("stars") || get("sao") || "4") || 4,
      approvedAt: get("date") || get("ngày") || new Date().toISOString(),
    };
  });
}

function parseNaverCSV(rows: string[][]): NaverRow[] {
  const header = rows[0].map((h) => h.toLowerCase().trim());
  return rows.slice(1).map((row, i) => {
    const get = (key: string) => row[header.indexOf(key)] || "";
    const hashtagRaw = get("hashtags") || get("hashtag") || "";
    return {
      id: get("id") || `naver-upload-${i}`,
      questionKr: get("questionkr") || get("câu hỏi hàn") || get("question") || "",
      category: get("category") || get("chủ đề") || "Khác",
      translatedQuestion: get("translatedquestion") || get("câu hỏi việt") || "",
      rewrittenAnswer: get("rewrittenanswer") || get("câu trả lời") || get("answer") || "",
      hashtags: hashtagRaw ? hashtagRaw.split("|").map((h) => h.trim()) : [],
      approvedAt: get("date") || get("ngày") || new Date().toISOString(),
    };
  });
}

function DropZone({
  onFile,
  accept,
  label,
}: {
  onFile: (file: File) => void;
  accept: string;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
        dragging ? "border-app-accent-primary/60 bg-app-accent-primary/5" : "border-white/15 hover:border-white/30 hover:bg-app-surface/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-app-accent-primary/10 mx-auto mb-3">
        <i className="ri-upload-cloud-2-line text-app-accent-primary text-2xl" />
      </div>
      <p className="text-white/70 font-semibold text-sm mb-1">{label}</p>
      <p className="text-app-text-muted text-xs">Kéo thả hoặc nhấn để chọn file</p>
      <p className="text-app-text-muted text-[10px] mt-1">Hỗ trợ: .csv, .xlsx (UTF-8)</p>
    </div>
  );
}

export default function DataUploadPage() {
  const navigate = useNavigate();
  const [activeType, setActiveType] = useState<UploadType>("melon");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<MelonRow[] | NaverRow[] | null>(null);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState("");

  const [approvedLessons, setApprovedLessons] = useLocalStorage<object[]>("kts_melon_lessons", []);
  const [approvedQAs, setApprovedQAs] = useLocalStorage<object[]>("kts_naver_qas", []);

  const handleFile = useCallback(
    async (f: File) => {
      setFile(f);
      setError("");
      setPreview(null);
      setSuccess("");

      try {
        const text = await f.text();
        const rows = parseCSV(text);
        if (rows.length < 2) {
          setError("File không có dữ liệu hoặc thiếu header. Cần ít nhất 1 dòng header + 1 dòng dữ liệu.");
          return;
        }

        if (activeType === "melon") {
          const parsed = parseMelonCSV(rows);
          setPreview(parsed);
        } else {
          const parsed = parseNaverCSV(rows);
          setPreview(parsed);
        }
      } catch {
        setError("Không thể đọc file. Hãy đảm bảo file là CSV UTF-8 hợp lệ.");
      }
    },
    [activeType]
  );

  const handleImport = useCallback(() => {
    if (!preview || preview.length === 0) return;
    setImporting(true);

    setTimeout(() => {
      if (activeType === "melon") {
        const melonRows = preview as MelonRow[];
        const newLessons = melonRows.map((row) => ({
          song: { rank: row.rank, title: row.title, artist: row.artist, genre: row.genre },
          story: row.story,
          vocabulary: row.vocabulary,
          explanation: row.explanation,
          approvedAt: row.approvedAt,
          stars: row.stars,
        }));
        setApprovedLessons([...approvedLessons, ...newLessons]);
        setSuccess(`Đã nhập thành công ${newLessons.length} bài học K-pop!`);
      } else {
        const naverRows = preview as NaverRow[];
        const newQAs = naverRows.map((row) => ({
          question: { id: row.id, questionKr: row.questionKr, category: row.category, views: 0 },
          translatedQuestion: row.translatedQuestion,
          rewrittenAnswer: row.rewrittenAnswer,
          hashtags: row.hashtags,
          approvedAt: row.approvedAt,
        }));
        setApprovedQAs([...approvedQAs, ...newQAs]);
        setSuccess(`Đã nhập thành công ${newQAs.length} câu hỏi Naver KiN!`);
      }
      setImporting(false);
      setPreview(null);
      setFile(null);
    }, 800);
  }, [preview, activeType, approvedLessons, approvedQAs, setApprovedLessons, setApprovedQAs]);

  const downloadTemplate = (type: UploadType) => {
    let csv = "";
    if (type === "melon") {
      csv = "rank,title,artist,genre,story,explanation,vocabulary,stars,date\n";
      csv += `1,Ditto,NewJeans,K-pop,"Câu chuyện về bài hát...","Giải thích ngữ pháp...","다시:lại:다시 만나자 (Gặp lại nhau)|보고싶다:nhớ:보고싶다 (Tôi nhớ bạn)",5,${new Date().toISOString()}\n`;
    } else {
      csv = "id,questionKr,category,translatedQuestion,rewrittenAnswer,hashtags,date\n";
      csv += `q001,한국어 공부 어떻게 해요?,학습,"Học tiếng Hàn như thế nào?","Bạn có thể học qua ứng dụng, sách giáo khoa...","tiếng Hàn|học tập|mẹo học",${new Date().toISOString()}\n`;
    }
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `template_${type}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title="Tải lên dữ liệu" subtitle="Nhập bài học K-pop và câu hỏi Naver từ file CSV">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* Type selector */}
        <div className="flex gap-1 bg-app-card/50 rounded-xl p-1 w-fit">
          {([
            { id: "melon", icon: "ri-music-2-line", label: "K-pop Lesson", color: "app-accent-primary" },
            { id: "naver", icon: "ri-question-answer-line", label: "Naver KiN", color: "#38bdf8" },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveType(t.id); setPreview(null); setFile(null); setError(""); setSuccess(""); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap"
              style={
                activeType === t.id
                  ? { backgroundColor: `${t.color}18`, color: t.color }
                  : { color: "rgba(255,255,255,0.4)" }
              }
            >
              <i className={t.icon} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Info card */}
        <div
          className="rounded-2xl p-4 border"
          style={{
            backgroundColor: activeType === "melon" ? "rgba(232,200,74,0.05)" : "rgba(56,189,248,0.05)",
            borderColor: activeType === "melon" ? "rgba(232,200,74,0.15)" : "rgba(56,189,248,0.15)",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ backgroundColor: activeType === "melon" ? "rgba(232,200,74,0.15)" : "rgba(56,189,248,0.15)" }}
            >
              <i
                className={activeType === "melon" ? "ri-music-2-line text-base" : "ri-question-answer-line text-base"}
                style={{ color: activeType === "melon" ? "app-accent-primary" : "#38bdf8" }}
              />
            </div>
            <div className="flex-1">
              <p className="text-white/80 font-semibold text-sm mb-1">
                {activeType === "melon" ? "Nhập bài học K-pop" : "Nhập câu hỏi Naver KiN"}
              </p>
              <p className="text-app-text-secondary text-xs leading-relaxed">
                {activeType === "melon"
                  ? "Tải file CSV chứa danh sách bài học K-pop đã xử lý. Mỗi dòng là 1 bài học với từ vựng, câu chuyện và giải thích."
                  : "Tải file CSV chứa danh sách câu hỏi Naver KiN đã dịch và viết lại. Mỗi dòng là 1 câu hỏi với câu trả lời."}
              </p>
            </div>
            <button
              onClick={() => downloadTemplate(activeType)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-all flex-shrink-0"
              style={{
                backgroundColor: activeType === "melon" ? "rgba(232,200,74,0.12)" : "rgba(56,189,248,0.12)",
                color: activeType === "melon" ? "app-accent-primary" : "#38bdf8",
              }}
            >
              <i className="ri-download-line" />
              Tải template
            </button>
          </div>
        </div>

        {/* Drop zone */}
        {!preview && (
          <DropZone
            onFile={handleFile}
            accept=".csv,.xlsx"
            label={`Chọn file CSV ${activeType === "melon" ? "K-pop Lesson" : "Naver KiN"}`}
          />
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <i className="ri-error-warning-line text-rose-400 text-base flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-rose-400 text-sm font-semibold">Lỗi đọc file</p>
              <p className="text-rose-400/70 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <i className="ri-checkbox-circle-line text-app-accent-success text-xl flex-shrink-0" />
            <div className="flex-1">
              <p className="text-app-accent-success font-semibold text-sm">{success}</p>
            </div>
            <button
              onClick={() => navigate(activeType === "melon" ? "/melon" : "/naver")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap bg-emerald-500/20 text-app-accent-success"
            >
              Xem ngay
            </button>
          </div>
        )}

        {/* Preview */}
        {preview && preview.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold text-sm">
                  Xem trước — {preview.length} dòng
                </h3>
                <p className="text-app-text-muted text-xs mt-0.5">
                  File: {file?.name}
                </p>
              </div>
              <button
                onClick={() => { setPreview(null); setFile(null); setError(""); }}
                className="text-app-text-muted hover:text-white/60 text-xs cursor-pointer"
              >
                <i className="ri-close-line mr-1" />
                Chọn lại
              </button>
            </div>

            {/* Preview table */}
            <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-app-border">
                      {activeType === "melon" ? (
                        <>
                          <th className="text-left px-4 py-3 text-app-text-secondary font-semibold">Hạng</th>
                          <th className="text-left px-4 py-3 text-app-text-secondary font-semibold">Bài hát</th>
                          <th className="text-left px-4 py-3 text-app-text-secondary font-semibold">Nghệ sĩ</th>
                          <th className="text-left px-4 py-3 text-app-text-secondary font-semibold">Từ vựng</th>
                          <th className="text-left px-4 py-3 text-app-text-secondary font-semibold">Sao</th>
                        </>
                      ) : (
                        <>
                          <th className="text-left px-4 py-3 text-app-text-secondary font-semibold">ID</th>
                          <th className="text-left px-4 py-3 text-app-text-secondary font-semibold">Câu hỏi (Hàn)</th>
                          <th className="text-left px-4 py-3 text-app-text-secondary font-semibold">Chủ đề</th>
                          <th className="text-left px-4 py-3 text-app-text-secondary font-semibold">Câu trả lời</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {(preview as (MelonRow | NaverRow)[]).slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-b border-app-border hover:bg-app-surface/50 transition-colors">
                        {activeType === "melon" ? (
                          <>
                            <td className="px-4 py-3 text-app-accent-primary font-bold">{(row as MelonRow).rank}</td>
                            <td className="px-4 py-3 text-white/70 max-w-[120px] truncate">{(row as MelonRow).title}</td>
                            <td className="px-4 py-3 text-app-text-secondary max-w-[100px] truncate">{(row as MelonRow).artist}</td>
                            <td className="px-4 py-3 text-app-text-secondary">{(row as MelonRow).vocabulary.length} từ</td>
                            <td className="px-4 py-3">
                              <span className="text-app-accent-primary">{"★".repeat((row as MelonRow).stars)}</span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-app-text-secondary font-mono text-[10px]">{(row as NaverRow).id}</td>
                            <td className="px-4 py-3 text-white/70 max-w-[150px] truncate">{(row as NaverRow).questionKr}</td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400">
                                {(row as NaverRow).category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-app-text-secondary max-w-[200px] truncate">{(row as NaverRow).rewrittenAnswer}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 10 && (
                <div className="px-4 py-2 border-t border-app-border text-center">
                  <p className="text-app-text-muted text-xs">... và {preview.length - 10} dòng nữa</p>
                </div>
              )}
            </div>

            {/* Import button */}
            <div className="flex gap-3">
              <button
                onClick={() => { setPreview(null); setFile(null); }}
                className="flex-1 py-3 rounded-xl bg-app-card/50 text-white/50 text-sm font-medium cursor-pointer hover:bg-white/8 transition-all border border-app-border whitespace-nowrap"
              >
                <i className="ri-close-line mr-1.5" />
                Hủy
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="flex-1 py-3 rounded-xl text-sm font-bold cursor-pointer transition-all whitespace-nowrap disabled:opacity-50"
                style={{
                  backgroundColor: activeType === "melon" ? "app-accent-primary" : "#38bdf8",
                  color: "#0f1117",
                }}
              >
                {importing ? (
                  <><i className="ri-loader-4-line animate-spin mr-1.5" />Đang nhập...</>
                ) : (
                  <><i className="ri-upload-2-line mr-1.5" />Nhập {preview.length} dòng</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Format guide */}
        <div className="bg-app-bg border border-white/6 rounded-2xl p-5">
          <h3 className="text-white/70 font-semibold text-sm mb-3 flex items-center gap-2">
            <i className="ri-information-line text-app-accent-primary" />
            Hướng dẫn định dạng CSV
          </h3>
          {activeType === "melon" ? (
            <div className="space-y-2 text-xs text-app-text-secondary">
              <p><span className="text-white/60 font-semibold">rank</span> — Số thứ tự bài hát (1, 2, 3...)</p>
              <p><span className="text-white/60 font-semibold">title</span> — Tên bài hát</p>
              <p><span className="text-white/60 font-semibold">artist</span> — Tên nghệ sĩ</p>
              <p><span className="text-white/60 font-semibold">genre</span> — Thể loại (K-pop, Ballad...)</p>
              <p><span className="text-white/60 font-semibold">vocabulary</span> — Từ vựng, phân cách bằng <code className="bg-white/8 px-1 rounded">|</code>, mỗi từ: <code className="bg-white/8 px-1 rounded">từ:nghĩa:ví dụ</code></p>
              <p><span className="text-white/60 font-semibold">story</span> — Câu chuyện bài học</p>
              <p><span className="text-white/60 font-semibold">stars</span> — Số sao (1-5)</p>
            </div>
          ) : (
            <div className="space-y-2 text-xs text-app-text-secondary">
              <p><span className="text-white/60 font-semibold">id</span> — Mã câu hỏi (duy nhất)</p>
              <p><span className="text-white/60 font-semibold">questionKr</span> — Câu hỏi tiếng Hàn gốc</p>
              <p><span className="text-white/60 font-semibold">category</span> — Chủ đề (học tập, du lịch...)</p>
              <p><span className="text-white/60 font-semibold">translatedQuestion</span> — Câu hỏi đã dịch sang tiếng Việt</p>
              <p><span className="text-white/60 font-semibold">rewrittenAnswer</span> — Câu trả lời đã viết lại</p>
              <p><span className="text-white/60 font-semibold">hashtags</span> — Hashtag, phân cách bằng <code className="bg-white/8 px-1 rounded">|</code></p>
            </div>
          )}
          <button
            onClick={() => downloadTemplate(activeType)}
            className="mt-3 flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all"
            style={{ color: activeType === "melon" ? "app-accent-primary" : "#38bdf8" }}
          >
            <i className="ri-download-line" />
            Tải file template mẫu
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
