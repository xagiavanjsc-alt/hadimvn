import { useState, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useToast } from "@/components/base/Toast";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface NaverQaItem {
  id: number;
  question: string;
  question_vi?: string;
  answer: string;
  answer_vi?: string;
  category: string;
  likes: number;
  views: number;
  url: string;
  translated?: boolean;
  vocabulary?: Array<{
    korean: string;
    vietnamese: string;
    romaji: string;
    topikLevel?: "1" | "2";
    epsCategory?: string;
  }>;
  grammar?: Array<{
    pattern: string;
    meaning: string;
    level: "1" | "2" | "3";
    examples: Array<{ sentence: string; translation: string; context: string }>;
  }>;
  difficulty?: "1" | "2" | "3";
}

const AdminNaverKinPage = () => {
  const isAdmin = useIsAdmin();
  const toast = useToast();
  const [qaItems, setQaItems] = useState<NaverQaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<NaverQaItem | null>(null);
  const [editingItem, setEditingItem] = useState<NaverQaItem | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [uploadMsg, setUploadMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTranslated, setFilterTranslated] = useState<"all" | "translated" | "untranslated">("all");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchMsg, setFetchMsg] = useState("");
  const [showUploadPanel, setShowUploadPanel] = useState(false);

  // Load Q&A from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("kts_naver_kin_qa");
      if (raw) {
        const data = JSON.parse(raw) as NaverQaItem[];
        setQaItems(data);
      }
    } catch (e) {
      console.error("Failed to load Q&A:", e);
    }
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".json") || file.name.endsWith(".csv"))) {
      setUploadFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.name.endsWith(".json") || file.name.endsWith(".csv"))) {
      setUploadFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploadStatus("processing");
    setUploadMsg("Đang xử lý file...");

    try {
      const text = await uploadFile.text();
      let data: NaverQaItem[];

      if (uploadFile.name.endsWith(".json")) {
        data = JSON.parse(text);
      } else if (uploadFile.name.endsWith(".csv")) {
        const lines = text.split("\n").filter(l => l.trim());
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        data = lines.slice(1).map((line, idx) => {
          const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
          const obj: any = {};
          headers.forEach((h, i) => {
            const val = (cols[i] || "").replace(/^"|"$/g, "").trim();
            obj[h] = h === "id" || h === "likes" || h === "views" ? parseInt(val) : val;
          });
          return obj as NaverQaItem;
        });
      } else {
        throw new Error("Unsupported file format");
      }

      localStorage.setItem("kts_naver_kin_qa", JSON.stringify(data));
      setQaItems(data);
      setUploadStatus("success");
      setUploadMsg(`Đã import thành công ${data.length} Q&A!`);
      setUploadFile(null);
    } catch (err) {
      setUploadStatus("error");
      setUploadMsg(`Lỗi: ${err instanceof Error ? err.message : "Không thể đọc file"}`);
    }
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    const updated = qaItems.map(item => item.id === editingItem.id ? editingItem : item);
    setQaItems(updated);
    localStorage.setItem("kts_naver_kin_qa", JSON.stringify(updated));
    setEditingItem(null);
    toast.showToast("Đã lưu thay đổi", "success");
  };

  const handleDelete = (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa Q&A này?")) return;
    const updated = qaItems.filter(item => item.id !== id);
    setQaItems(updated);
    localStorage.setItem("kts_naver_kin_qa", JSON.stringify(updated));
    toast.showToast("Đã xóa Q&A", "success");
  };

  const handleFetchFromAPI = async () => {
    setIsFetching(true);
    setFetchMsg("Đang fetch dữ liệu từ Naver KiN API...");

    const keywords = ["한국어 공부", "한국어 학습", "TOPIK 시험", "EPS-TOPIK", "한국어 발음", "한국어 문법", "한국어 단어", "한국어 회화"];
    const allItems: NaverQaItem[] = [];

    try {
      for (const keyword of keywords) {
        setFetchMsg(`Đang fetch keyword: ${keyword}...`);
        
        const response = await fetch("https://api.apify.com/v2/acts/oxygenated_quagmire~naver-kin-scraper/run-sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_APIFY_API_KEY || ""}`
          },
          body: JSON.stringify({
            query: keyword,
            maxItems: 20,
            sortBy: "accuracy"
          })
        });

        if (!response.ok) {
          console.warn(`Failed to fetch ${keyword}`);
          continue;
        }

        const result = await response.json();
        const items = result.data?.items || [];
        
        const transformed = items.map((item: any, idx: number) => ({
          id: allItems.length + idx + 1,
          question: item.question || "",
          answer: item.answer || "",
          category: keyword,
          likes: item.likes || 0,
          views: item.views || 0,
          url: item.url || "",
          translated: false,
          question_vi: "",
          answer_vi: ""
        }));

        allItems.push(...transformed);
      }

      if (allItems.length === 0) {
        throw new Error("Không có dữ liệu trả về");
      }

      // Deduplicate based on normalized question
      const normalizeQuestion = (q: string) => q.toLowerCase().replace(/[^\w\s가-힣]/g, "").trim();
      const existingKeys = new Set(qaItems.map(item => normalizeQuestion(item.question)));
      const newItems = allItems.filter(item => !existingKeys.has(normalizeQuestion(item.question)));

      // Sort by likes and limit to 100
      const merged = [...qaItems, ...newItems]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 100);

      // Reassign IDs
      merged.forEach((item, idx) => { item.id = idx + 1; });

      localStorage.setItem("kts_naver_kin_qa", JSON.stringify(merged));
      setQaItems(merged);
      setFetchMsg(`✅ Đã fetch thành công ${newItems.length} Q&A mới! Tổng: ${merged.length} Q&A.`);
      toast.showToast(`Đã fetch ${newItems.length} Q&A mới`, "success");
    } catch (err) {
      setFetchMsg(`❌ Lỗi: ${err instanceof Error ? err.message : "Không thể fetch dữ liệu"}`);
      toast.showToast("Fetch thất bại", "error");
    } finally {
      setIsFetching(false);
    }
  };

  const filteredItems = qaItems.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterTranslated === "all" ||
      (filterTranslated === "translated" && item.translated) ||
      (filterTranslated === "untranslated" && !item.translated);
    
    return matchesSearch && matchesFilter;
  });

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="p-6 text-center text-white/60">
          <i className="ri-lock-line text-4xl mb-3"></i>
          <p>Bạn không có quyền truy cập trang này</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Quản lý Naver KiN Q&A</h1>
            <p className="text-white/60 text-sm">Upload và quản lý dữ liệu câu hỏi trả lời tiếng Hàn</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleFetchFromAPI}
              disabled={isFetching}
              className="px-4 py-2 bg-blue-500/20 border border-blue-500/40 rounded-lg text-blue-400 text-sm hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className={`mr-2 ${isFetching ? "ri-loader-4-line animate-spin" : "ri-download-cloud-line"}`}></i>
              {isFetching ? "Đang fetch..." : "Fetch từ API"}
            </button>
            <button
              onClick={() => setShowUploadPanel(!showUploadPanel)}
              className="px-4 py-2 bg-app-accent-primary/20 border border-app-accent-primary/40 rounded-lg text-app-accent-primary text-sm hover:bg-app-accent-primary/30 transition-colors"
            >
              <i className="ri-upload-line mr-2"></i>
              Upload file
            </button>
            <button
              onClick={() => {
                if (confirm("Xóa toàn bộ dữ liệu Naver KiN?")) {
                  localStorage.removeItem("kts_naver_kin_qa");
                  setQaItems([]);
                  toast.showToast("Đã xóa toàn bộ dữ liệu", "success");
                }
              }}
              className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400 text-sm hover:bg-red-500/30 transition-colors"
            >
              <i className="ri-delete-bin-line mr-2"></i>
              Xóa tất cả
            </button>
          </div>
        </div>

        {/* API Fetch Status */}
        {fetchMsg && (
          <div className={`p-4 rounded-xl text-sm ${fetchMsg.includes("✅") ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
            {fetchMsg}
          </div>
        )}

        {/* Upload Panel */}
        {showUploadPanel && (
          <div className="bg-app-card/50 border border-app-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Upload dữ liệu Naver KiN</h3>
              <button
                onClick={() => { setShowUploadPanel(false); setUploadFile(null); }}
                className="text-white/40 hover:text-white"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-app-border rounded-xl p-8 text-center cursor-pointer"
              style={{
                borderColor: dragOver ? "#10b981" : undefined,
                backgroundColor: dragOver ? "rgba(16, 185, 129, 0.05)" : undefined
              }}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <i className="ri-file-upload-line text-4xl text-white/30 mb-3"></i>
              <p className="text-white/60 mb-2">{uploadFile ? uploadFile.name : "Kéo thả file vào đây hoặc click để chọn"}</p>
              <p className="text-white/40 text-xs mb-4">Hỗ trợ .json và .csv</p>
              <input
                id="fileInput"
                type="file"
                accept=".json,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {uploadFile && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleUpload}
                  disabled={uploadStatus === "processing"}
                  className="flex-1 py-3 bg-app-accent-primary text-white rounded-xl font-medium hover:bg-app-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadStatus === "processing" ? "Đang upload..." : "Upload"}
                </button>
                <button
                  onClick={() => setUploadFile(null)}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  Hủy
                </button>
              </div>
            )}

            {uploadStatus === "processing" && (
              <div className="mt-4 text-center text-white/60">
                <i className="ri-loader-4-line animate-spin text-xl"></i>
                <p className="text-sm mt-2">{uploadMsg}</p>
              </div>
            )}

            {uploadStatus === "success" && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                <i className="ri-checkbox-circle-line mr-2"></i>
                {uploadMsg}
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <i className="ri-error-warning-line mr-2"></i>
                {uploadMsg}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              {uploadStatus === "idle" && (
                <button
                  onClick={handleUpload}
                  className="flex-1 py-2.5 bg-app-accent-primary text-white rounded-xl font-medium hover:bg-app-accent-primary/90 transition-colors"
                >
                  Upload & Cập nhật
                </button>
              )}
              <button
                onClick={() => setUploadFile(null)}
                className="px-4 py-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-app-card/50 border border-app-border rounded-2xl p-4 flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi hoặc câu trả lời..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-app-surface border border-app-border rounded-xl px-4 py-2.5 text-white placeholder-white/40"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterTranslated("all")}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterTranslated === "all"
                  ? "bg-app-accent-primary text-white"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              Tất cả ({qaItems.length})
            </button>
            <button
              onClick={() => setFilterTranslated("translated")}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterTranslated === "translated"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              Đã dịch ({qaItems.filter(i => i.translated).length})
            </button>
            <button
              onClick={() => setFilterTranslated("untranslated")}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterTranslated === "untranslated"
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
            >
              Chưa dịch ({qaItems.filter(i => !i.translated).length})
            </button>
          </div>
        </div>

        {/* Q&A List */}
        <div className="bg-app-card/50 border border-app-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-app-border flex items-center justify-between">
            <h3 className="text-white font-semibold">Danh sách Q&A ({filteredItems.length})</h3>
            <button
              onClick={() => {
                const dataStr = JSON.stringify(qaItems, null, 2);
                const blob = new Blob([dataStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "naver_kin_qa.json";
                a.click();
              }}
              className="text-white/60 text-sm hover:text-white transition-colors"
            >
              <i className="ri-download-line mr-1"></i>
              Export JSON
            </button>
          </div>

          <div className="divide-y divide-app-border max-h-[600px] overflow-y-auto">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-app-accent-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-question-answer-line text-app-accent-primary"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium line-clamp-2">{item.question}</h4>
                    <p className="text-white/60 text-sm line-clamp-2 mt-1">{item.answer}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-white/40">{item.category}</span>
                      <span className="text-xs text-white/40">❤️ {item.likes}</span>
                      <span className="text-xs text-white/40">👁️ {item.views}</span>
                      {item.translated && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                          Đã dịch
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}
                      className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="p-12 text-center text-white/40">
                <i className="ri-question-answer-line text-4xl mb-3"></i>
                <p>Không tìm thấy Q&A nào</p>
                <p className="text-sm mt-1">Upload file JSON hoặc CSV để bắt đầu</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-app-card border border-app-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Chỉnh sửa Q&A</h3>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="text-white/40 hover:text-white"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Câu hỏi (Tiếng Hàn)</label>
                    <textarea
                      value={editingItem.question}
                      onChange={e => setEditingItem({ ...editingItem, question: e.target.value })}
                      className="w-full bg-app-surface border border-app-border rounded-xl px-4 py-3 text-white min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Câu hỏi (Tiếng Việt)</label>
                    <textarea
                      value={editingItem.question_vi || ""}
                      onChange={e => setEditingItem({ ...editingItem, question_vi: e.target.value })}
                      placeholder="Nhập bản dịch tiếng Việt..."
                      className="w-full bg-app-surface border border-app-border rounded-xl px-4 py-3 text-white min-h-[80px]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Câu trả lời (Tiếng Hàn)</label>
                    <textarea
                      value={editingItem.answer}
                      onChange={e => setEditingItem({ ...editingItem, answer: e.target.value })}
                      className="w-full bg-app-surface border border-app-border rounded-xl px-4 py-3 text-white min-h-[150px]"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Câu trả lời (Tiếng Việt)</label>
                    <textarea
                      value={editingItem.answer_vi || ""}
                      onChange={e => setEditingItem({ ...editingItem, answer_vi: e.target.value })}
                      placeholder="Nhập bản dịch tiếng Việt..."
                      className="w-full bg-app-surface border border-app-border rounded-xl px-4 py-3 text-white min-h-[150px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-2 block">Danh mục</label>
                      <input
                        type="text"
                        value={editingItem.category}
                        onChange={e => setEditingItem({ ...editingItem, category: e.target.value })}
                        className="w-full bg-app-surface border border-app-border rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-2 block">URL</label>
                      <input
                        type="text"
                        value={editingItem.url}
                        onChange={e => setEditingItem({ ...editingItem, url: e.target.value })}
                        className="w-full bg-app-surface border border-app-border rounded-xl px-4 py-3 text-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-white/60 text-sm">
                      <input
                        type="checkbox"
                        checked={editingItem.translated || false}
                        onChange={e => setEditingItem({ ...editingItem, translated: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Đã dịch sang tiếng Việt
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-3 bg-app-accent-primary text-white rounded-xl font-medium hover:bg-app-accent-primary/90 transition-colors"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedItem && !editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-app-card border border-app-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Chi tiết Q&A</h3>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-white/40 hover:text-white"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-app-surface rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1">❤️ Likes</p>
                      <p className="text-white font-bold text-lg">{selectedItem.likes}</p>
                    </div>
                    <div className="bg-app-surface rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1">👁️ Views</p>
                      <p className="text-white font-bold text-lg">{selectedItem.views}</p>
                    </div>
                    <div className="bg-app-surface rounded-xl p-4">
                      <p className="text-white/40 text-xs mb-1">Danh mục</p>
                      <p className="text-white font-medium">{selectedItem.category}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-white font-medium mb-2">Câu hỏi (Tiếng Hàn)</h5>
                    <div className="bg-app-surface rounded-xl p-4">
                      <p className="text-white/80">{selectedItem.question}</p>
                    </div>
                  </div>

                  {selectedItem.question_vi && (
                    <div>
                      <h5 className="text-white font-medium mb-2">Câu hỏi (Tiếng Việt)</h5>
                      <div className="bg-app-surface rounded-xl p-4">
                        <p className="text-white/80">{selectedItem.question_vi}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h5 className="text-white font-medium mb-2">Câu trả lời (Tiếng Hàn)</h5>
                    <div className="bg-app-surface rounded-xl p-4 max-h-[200px] overflow-y-auto">
                      <p className="text-white/80 whitespace-pre-wrap">{selectedItem.answer}</p>
                    </div>
                  </div>

                  {selectedItem.answer_vi && (
                    <div>
                      <h5 className="text-white font-medium mb-2">Câu trả lời (Tiếng Việt)</h5>
                      <div className="bg-app-surface rounded-xl p-4 max-h-[200px] overflow-y-auto">
                        <p className="text-white/80 whitespace-pre-wrap">{selectedItem.answer_vi}</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.vocabulary && selectedItem.vocabulary.length > 0 && (
                    <div>
                      <h5 className="text-white font-medium mb-2">Từ vựng ({selectedItem.vocabulary.length})</h5>
                      <div className="bg-app-surface rounded-xl p-4 max-h-[200px] overflow-y-auto space-y-2">
                        {selectedItem.vocabulary.map((vocab, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <span className="text-white font-medium">{vocab.korean}</span>
                            <span className="text-app-accent-primary">{vocab.romaji}</span>
                            <span className="text-white/60">{vocab.vietnamese}</span>
                            {vocab.topikLevel && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">TOPIK {vocab.topikLevel}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItem.grammar && selectedItem.grammar.length > 0 && (
                    <div>
                      <h5 className="text-white font-medium mb-2">Ngữ pháp ({selectedItem.grammar.length})</h5>
                      <div className="bg-app-surface rounded-xl p-4 max-h-[200px] overflow-y-auto space-y-2">
                        {selectedItem.grammar.map((gram, idx) => (
                          <div key={idx} className="text-sm">
                            <span className="text-white font-medium">{gram.pattern}</span>
                            <span className="text-white/60 ml-2">{gram.meaning}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-app-surface rounded-xl p-4">
                    <p className="text-white/40 text-xs mb-1">URL</p>
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-app-accent-primary text-sm hover:underline"
                    >
                      {selectedItem.url}
                    </a>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => { setSelectedItem(null); setEditingItem(selectedItem); }}
                    className="flex-1 py-3 bg-app-accent-primary text-white rounded-xl font-medium hover:bg-app-accent-primary/90 transition-colors"
                  >
                    <i className="ri-edit-line mr-2"></i>
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminNaverKinPage;
