import { useState, useRef } from "react";
import { STORAGE_KEYS } from "@/lib/storageKeys";

interface AdminDataPanelProps {
  onClose: () => void;
}

const TEMPLATE_HEADERS = "rank,title,artist,genre,albumArt,lyrics,vocabulary";
const TEMPLATE_ROWS = [
  "1,Ditto,NewJeans,K-pop,https://example.com/art.jpg,\"오늘도 너를 생각해...\",\"생각하다=nghĩ đến|오늘=hôm nay\"",
  "2,Hype Boy,NewJeans,K-pop,https://example.com/art2.jpg,\"Hey boy I want you...\",\"원하다=muốn|소년=chàng trai\"",
];

export default function AdminDataPanel({ onClose }: AdminDataPanelProps) {
  const [activeTab, setActiveTab] = useState<"download" | "upload">("download");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [uploadMsg, setUploadMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = () => {
    const csv = [TEMPLATE_HEADERS, ...TEMPLATE_ROWS].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "melon_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCurrent = () => {
    const raw = localStorage.getItem(STORAGE_KEYS.MELON_SONGS);
    let rows: string[] = [TEMPLATE_HEADERS];
    if (raw) {
      try {
        const songs = JSON.parse(raw) as Record<string, string>[];
        songs.forEach(s => {
          rows.push(`${s.rank || ""},${JSON.stringify(s.title || "")},${JSON.stringify(s.artist || "")},${JSON.stringify(s.genre || "")},${JSON.stringify(s.albumArt || "")},${JSON.stringify(s.lyrics || "")},${JSON.stringify(s.vocabulary || "")}`);
        });
      } catch { /* ignore */ }
    }
    const csv = rows.join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `melon_data_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xlsx"))) {
      setUploadFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadFile(file);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploadStatus("processing");
    setUploadMsg("Đang xử lý file...");
    try {
      const text = await uploadFile.text();
      const lines = text.split("\n").filter(l => l.trim());
      if (lines.length < 2) throw new Error("File không có dữ liệu");
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
      const songs = lines.slice(1).map(line => {
        const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = (cols[i] || "").replace(/^"|"$/g, "").trim();
        });
        return obj;
      }).filter(s => s.rank && s.title);
      localStorage.setItem(STORAGE_KEYS.MELON_SONGS, JSON.stringify(songs));
      setUploadStatus("success");
      setUploadMsg(`Đã import thành công ${songs.length} bài hát! Tải lại trang để xem.`);
    } catch (err) {
      setUploadStatus("error");
      setUploadMsg(`Lỗi: ${err instanceof Error ? err.message : "Không thể đọc file"}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ backgroundColor: "#0f1117", border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(232,200,74,0.12)" }}>
              <i className="ri-database-2-line text-sm" style={{ color: "app-accent-primary" }}></i>
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>Quản lý dữ liệu Melon</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>Chỉ dành cho Admin</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "rgba(255,255,255,0.4)" }}>
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {(["download", "upload"] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="flex-1 py-3 text-xs font-semibold cursor-pointer whitespace-nowrap transition-all"
              style={{ color: activeTab === t ? "app-accent-primary" : "rgba(255,255,255,0.35)", borderBottom: activeTab === t ? "2px solid app-accent-primary" : "2px solid transparent" }}>
              {t === "download" ? <><i className="ri-download-line mr-1.5"></i>Tải về xử lý</> : <><i className="ri-upload-line mr-1.5"></i>Upload lên</>}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-3">
          {activeTab === "download" && (
            <>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                Tải file CSV để chỉnh sửa dữ liệu bài hát, sau đó upload lại.
              </p>
              <button onClick={handleDownloadTemplate}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: "rgba(74,222,128,0.12)" }}>
                  <i className="ri-file-text-line text-sm" style={{ color: "#4ade80" }}></i>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>Tải template CSV</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>File mẫu với đầy đủ cột dữ liệu</p>
                </div>
                <i className="ri-download-line ml-auto" style={{ color: "#4ade80" }}></i>
              </button>
              <button onClick={handleDownloadCurrent}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: "rgba(232,200,74,0.12)" }}>
                  <i className="ri-music-2-line text-sm" style={{ color: "app-accent-primary" }}></i>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>Tải dữ liệu hiện tại</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>Export toàn bộ bài hát đang có</p>
                </div>
                <i className="ri-download-line ml-auto" style={{ color: "app-accent-primary" }}></i>
              </button>
              <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(232,200,74,0.06)", border: "1px solid rgba(232,200,74,0.12)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "app-accent-primary" }}><i className="ri-information-line mr-1"></i>Hướng dẫn</p>
                <ol className="text-xs space-y-1" style={{ color: "rgba(232,200,74,0.6)" }}>
                  <li>1. Tải template hoặc dữ liệu hiện tại</li>
                  <li>2. Chỉnh sửa bằng Excel / Google Sheets</li>
                  <li>3. Lưu lại dạng CSV (UTF-8)</li>
                  <li>4. Upload lại qua tab &quot;Upload lên&quot;</li>
                </ol>
              </div>
            </>
          )}

          {activeTab === "upload" && (
            <>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                Upload file CSV đã chỉnh sửa để cập nhật dữ liệu bài hát.
              </p>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileRef.current?.click()}
                className="rounded-xl p-6 text-center cursor-pointer transition-all"
                style={{
                  border: `2px dashed ${dragOver ? "app-accent-primary" : "rgba(255,255,255,0.12)"}`,
                  backgroundColor: dragOver ? "rgba(232,200,74,0.05)" : "rgba(255,255,255,0.02)",
                }}
              >
                <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={handleFileSelect} />
                <div className="w-10 h-10 flex items-center justify-center rounded-xl mx-auto mb-2" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <i className="ri-upload-cloud-2-line text-xl" style={{ color: "rgba(255,255,255,0.3)" }}></i>
                </div>
                {uploadFile ? (
                  <p className="text-sm font-semibold" style={{ color: "app-accent-primary" }}>{uploadFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Kéo thả hoặc click để chọn file</p>
                    <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>Hỗ trợ .csv, .xlsx</p>
                  </>
                )}
              </div>

              {uploadFile && uploadStatus === "idle" && (
                <button onClick={handleUpload}
                  className="w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-all"
                  style={{ backgroundColor: "rgba(232,200,74,0.15)", color: "app-accent-primary", border: "1px solid rgba(232,200,74,0.25)" }}>
                  <i className="ri-upload-line mr-1.5"></i>
                  Upload & Cập nhật dữ liệu
                </button>
              )}

              {uploadStatus === "processing" && (
                <div className="flex items-center gap-2 py-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <i className="ri-loader-4-line animate-spin text-sm"></i>
                  <span className="text-xs">{uploadMsg}</span>
                </div>
              )}

              {uploadStatus === "success" && (
                <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)" }}>
                  <p className="text-xs font-semibold" style={{ color: "#4ade80" }}><i className="ri-checkbox-circle-line mr-1"></i>{uploadMsg}</p>
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="rounded-xl p-3" style={{ backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.15)" }}>
                  <p className="text-xs font-semibold" style={{ color: "#f87171" }}><i className="ri-error-warning-line mr-1"></i>{uploadMsg}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
