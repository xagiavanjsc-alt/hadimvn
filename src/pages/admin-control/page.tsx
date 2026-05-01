import { useState } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { AdConfig } from "@/components/feature/AdBanner";
import { useNavigate } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
type TabId = "ads" | "draft" | "import" | "export";

const TABS: { id: TabId; icon: string; label: string; color: string }[] = [
  { id: "ads", icon: "ri-advertisement-line", label: "Quảng cáo", color: "#fb923c" },
  { id: "draft", icon: "ri-draft-line", label: "Chế độ nháp", color: "#e8c84a" },
  { id: "import", icon: "ri-upload-cloud-line", label: "Import dữ liệu", color: "#4ade80" },
  { id: "export", icon: "ri-download-cloud-line", label: "Export dữ liệu", color: "#38bdf8" },
];

// ─── Ads Tab ──────────────────────────────────────────────────────────────────
function AdsTab() {
  const navigate = useNavigate();
  const [adConfigs] = useLocalStorage<AdConfig[]>("kts_ad_configs", []);
  const [globalEnabled, setGlobalEnabled] = useLocalStorage<boolean>("kts_ads_global_enabled", true);

  const totalEnabled = adConfigs.filter((a) => a.enabled).length;

  return (
    <div className="space-y-5">
      {/* Global toggle */}
      <div
        className="rounded-2xl border p-5 flex items-center justify-between"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${globalEnabled ? "bg-emerald-500/12" : "bg-white/5"}`}>
            <i className={`ri-advertisement-line text-lg ${globalEnabled ? "text-emerald-400" : "text-white/30"}`}></i>
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>
              Hệ thống quảng cáo toàn cục
            </p>
            <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>
              {globalEnabled
                ? `Đang hiển thị · ${totalEnabled}/${adConfigs.length} quảng cáo bật`
                : "Tất cả quảng cáo đang tắt"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-semibold"
            style={{ color: globalEnabled ? "#4ade80" : "var(--admin-text-muted)" }}
          >
            {globalEnabled ? "BẬT" : "TẮT"}
          </span>
          <button
            onClick={() => setGlobalEnabled(!globalEnabled)}
            className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${globalEnabled ? "bg-emerald-500" : "bg-white/10"}`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${globalEnabled ? "left-6" : "left-0.5"}`}
            ></div>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Tổng quảng cáo", value: adConfigs.length, icon: "ri-advertisement-line", color: "#fb923c" },
          { label: "Đang hiển thị", value: totalEnabled, icon: "ri-eye-line", color: "#4ade80" },
          { label: "Đang tắt", value: adConfigs.length - totalEnabled, icon: "ri-eye-off-line", color: "#f87171" },
          { label: "Vị trí đang dùng", value: new Set(adConfigs.map((a) => a.position)).size, icon: "ri-layout-line", color: "#e8c84a" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border p-4"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                <i className={`${stat.icon} text-sm`} style={{ color: stat.color }}></i>
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--admin-text)" }}>
              {stat.value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick list */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
          <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>
            Danh sách quảng cáo
          </p>
          <button
            onClick={() => navigate("/admin/ads")}
            className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}
          >
            <i className="ri-external-link-line mr-1"></i>
            Quản lý đầy đủ
          </button>
        </div>
        {adConfigs.length === 0 ? (
          <div className="flex flex-col items-center py-10">
            <i className="ri-advertisement-line text-3xl mb-2" style={{ color: "var(--admin-text-faint)" }}></i>
            <p className="text-sm" style={{ color: "var(--admin-text-faint)" }}>
              Chưa có quảng cáo nào
            </p>
            <button
              onClick={() => navigate("/admin/ads")}
              className="mt-3 text-xs px-4 py-2 rounded-lg bg-orange-500 text-white cursor-pointer"
            >
              Thêm quảng cáo đầu tiên
            </button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
            {adConfigs.slice(0, 5).map((ad) => (
              <div key={ad.id} className="flex items-center gap-3 px-5 py-3">
                <div
                  className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{
                    backgroundColor:
                      ad.type === "html"
                        ? "rgba(251,146,60,0.12)"
                        : ad.type === "image"
                        ? "rgba(96,165,250,0.12)"
                        : "rgba(167,139,250,0.12)",
                  }}
                >
                  <i
                    className={`${ad.type === "html" ? "ri-code-line text-orange-400" : ad.type === "image" ? "ri-image-line text-blue-400" : "ri-text text-purple-400"} text-xs`}
                  ></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--admin-text)" }}>
                    {ad.title || (ad.type === "html" ? "HTML Banner" : "Banner")}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                    {ad.position} · {ad.type}
                  </p>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${ad.enabled && globalEnabled ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/25"}`}
                >
                  {ad.enabled && globalEnabled ? "BẬT" : "TẮT"}
                </span>
              </div>
            ))}
            {adConfigs.length > 5 && (
              <div className="px-5 py-3 text-center">
                <button
                  onClick={() => navigate("/admin/ads")}
                  className="text-xs cursor-pointer"
                  style={{ color: "var(--admin-text-muted)" }}
                >
                  Xem thêm {adConfigs.length - 5} quảng cáo...
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Draft Tab ────────────────────────────────────────────────────────────────
function DraftTab() {
  const [melonDraftMode, setMelonDraftMode] = useLocalStorage<boolean>("kts_melon_draft_mode", false);
  const [naverDraftMode, setNaverDraftMode] = useLocalStorage<boolean>("kts_naver_draft_mode", false);

  const features = [
    {
      key: "melon",
      icon: "ri-music-2-line",
      color: "#e8c84a",
      title: "K-pop Lesson",
      desc: "Melon Top 100 → AI phân tích → Xuất Excel",
      detail: "Tính năng học tiếng Hàn qua lời bài hát K-pop với AI phân tích từ vựng và ngữ pháp",
      value: melonDraftMode,
      toggle: () => setMelonDraftMode(!melonDraftMode),
    },
    {
      key: "naver",
      icon: "ri-question-answer-line",
      color: "#38bdf8",
      title: "Naver KiN",
      desc: "Câu hỏi thực tế → AI → Xuất Excel",
      detail: "Học tiếng Hàn qua câu hỏi thực tế từ Naver Knowledge iN với AI giải thích",
      value: naverDraftMode,
      toggle: () => setNaverDraftMode(!naverDraftMode),
    },
  ];

  return (
    <div className="space-y-5">
      <div
        className="rounded-2xl border p-5"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <i className="ri-information-line text-[#e8c84a]"></i>
          <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>
            Về chế độ nháp
          </p>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--admin-text-muted)" }}>
          Chế độ nháp cho phép bạn hoàn thiện tính năng trước khi công khai. Khi bật, trang chủ sẽ hiển thị badge
          &quot;Chế độ nháp&quot; màu cam bên cạnh tên tính năng. Khi tắt, badge chuyển sang &quot;Công khai&quot; màu xanh lá.
        </p>
      </div>

      <div className="space-y-4">
        {features.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl border p-5"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <i className={`${item.icon} text-base`} style={{ color: item.color }}></i>
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>
                    {item.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
                    {item.desc}
                  </p>
                  <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: "var(--admin-text-faint)" }}>
                    {item.detail}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${item.value ? "bg-amber-500/15 text-amber-400" : "bg-emerald-500/15 text-emerald-400"}`}
                >
                  {item.value ? "NHÁP" : "CÔNG KHAI"}
                </span>
                <button
                  onClick={item.toggle}
                  className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${item.value ? "bg-amber-500" : "bg-emerald-500"}`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${item.value ? "left-6" : "left-0.5"}`}
                  ></div>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Import Tab ───────────────────────────────────────────────────────────────
function ImportTab() {
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<Record<string, "idle" | "success" | "error">>({});

  const handleDrop = (type: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    processFile(type, file);
  };

  const handleFileInput = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(type, file);
  };

  const processFile = (type: string, file: File) => {
    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
      setUploadStatus((prev) => ({ ...prev, [type]: "error" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = text.split("\n").filter(Boolean);
      localStorage.setItem(`kts_import_${type}`, JSON.stringify({ rows, importedAt: new Date().toISOString(), fileName: file.name }));
      setUploadStatus((prev) => ({ ...prev, [type]: "success" }));
    };
    reader.readAsText(file, "utf-8");
  };

  const importSources = [
    {
      key: "melon",
      icon: "ri-music-2-line",
      color: "#e8c84a",
      title: "K-pop Lesson (Melon)",
      desc: "Import danh sách bài hát và từ vựng đã xử lý",
      template: "song_title,artist,vocabulary,meaning,example",
      link: "/melon",
    },
    {
      key: "naver",
      icon: "ri-question-answer-line",
      color: "#38bdf8",
      title: "Naver KiN",
      desc: "Import câu hỏi và đáp án đã xử lý",
      template: "question,answer,category,vocabulary,meaning",
      link: "/naver",
    },
    {
      key: "hanja",
      icon: "ri-character-recognition-line",
      color: "#a78bfa",
      title: "Hán Hàn VIP",
      desc: "Import từ vựng Hán Hàn hàng loạt",
      template: "korean,hanja,vietnamese,pronunciation,example",
      link: "/admin/hanja",
    },
  ];

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl border p-4"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
      >
        <p className="text-xs leading-relaxed" style={{ color: "var(--admin-text-muted)" }}>
          <i className="ri-information-line mr-1 text-[#e8c84a]"></i>
          Tải file CSV (UTF-8) hoặc Excel. Dòng đầu tiên là tiêu đề cột. Tải template mẫu để biết đúng định dạng.
        </p>
      </div>

      {importSources.map((src) => {
        const status = uploadStatus[src.key] || "idle";
        const savedData = (() => {
          try {
            const raw = localStorage.getItem(`kts_import_${src.key}`);
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })();

        return (
          <div
            key={src.key}
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
              <div
                className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ backgroundColor: `${src.color}15` }}
              >
                <i className={`${src.icon} text-sm`} style={{ color: src.color }}></i>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>
                  {src.title}
                </p>
                <p className="text-xs" style={{ color: "var(--admin-text-muted)" }}>
                  {src.desc}
                </p>
              </div>
              {savedData && (
                <div className="text-right">
                  <p className="text-[10px] text-emerald-400 font-semibold">Đã import</p>
                  <p className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>
                    {new Date(savedData.importedAt).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              )}
            </div>

            <div className="p-5">
              {/* Drop zone */}
              <label
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-8 cursor-pointer transition-all ${
                  dragOver === src.key ? "border-opacity-100" : "border-opacity-30"
                }`}
                style={{
                  borderColor: dragOver === src.key ? src.color : "var(--admin-border2)",
                  backgroundColor: dragOver === src.key ? `${src.color}08` : "var(--admin-card2)",
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(src.key); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => handleDrop(src.key, e)}
              >
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  className="hidden"
                  onChange={(e) => handleFileInput(src.key, e)}
                />
                {status === "success" ? (
                  <>
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500/15 mb-2">
                      <i className="ri-check-line text-emerald-400 text-xl"></i>
                    </div>
                    <p className="text-sm font-semibold text-emerald-400">Import thành công!</p>
                    <p className="text-xs mt-1" style={{ color: "var(--admin-text-muted)" }}>
                      Click để import file khác
                    </p>
                  </>
                ) : status === "error" ? (
                  <>
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-500/15 mb-2">
                      <i className="ri-close-line text-rose-400 text-xl"></i>
                    </div>
                    <p className="text-sm font-semibold text-rose-400">File không hợp lệ</p>
                    <p className="text-xs mt-1" style={{ color: "var(--admin-text-muted)" }}>
                      Chỉ chấp nhận .csv hoặc .xlsx
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 flex items-center justify-center rounded-full mb-2" style={{ backgroundColor: `${src.color}15` }}>
                      <i className="ri-upload-cloud-line text-xl" style={{ color: src.color }}></i>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--admin-text)" }}>
                      Kéo thả hoặc click để chọn file
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--admin-text-muted)" }}>
                      CSV hoặc Excel (UTF-8)
                    </p>
                  </>
                )}
              </label>

              {/* Template */}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                  Định dạng: <code className="font-mono">{src.template}</code>
                </p>
                <button
                  onClick={() => {
                    const blob = new Blob([src.template + "\n"], { type: "text/csv;charset=utf-8;" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `template_${src.key}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                  style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}
                >
                  <i className="ri-download-line mr-1"></i>
                  Tải template
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Export Tab ───────────────────────────────────────────────────────────────
function ExportTab() {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportCSV = (key: string, filename: string, getData: () => string[][]) => {
    setExporting(key);
    setTimeout(() => {
      const rows = getData();
      const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
      const bom = "\uFEFF";
      const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      setExporting(null);
    }, 500);
  };

  const exportSources = [
    {
      key: "melon",
      icon: "ri-music-2-line",
      color: "#e8c84a",
      title: "K-pop Lesson (Melon)",
      desc: "Xuất danh sách bài hát và từ vựng đã học",
      filename: "kpop_lesson_export.csv",
      getData: (): string[][] => {
        const headers = ["Hạng", "Tên bài hát", "Nghệ sĩ", "Thể loại", "Đã học", "Ngày học"];
        try {
          const learnedRaw = localStorage.getItem("melon_learned_ranks");
          const learnedRanks: number[] = learnedRaw ? JSON.parse(learnedRaw) : [];
          const playlistRaw = localStorage.getItem("melon_playlist_ranks");
          const playlistRanks: number[] = playlistRaw ? JSON.parse(playlistRaw) : [];
          const rows: string[][] = [headers];
          for (let i = 1; i <= 100; i++) {
            rows.push([
              String(i),
              `Bài hát #${i}`,
              "Nghệ sĩ",
              "K-pop",
              learnedRanks.includes(i) ? "Đã học" : "Chưa học",
              learnedRanks.includes(i) ? new Date().toLocaleDateString("vi-VN") : "",
            ]);
          }
          return rows;
        } catch {
          return [headers];
        }
      },
    },
    {
      key: "naver",
      icon: "ri-question-answer-line",
      color: "#38bdf8",
      title: "Naver KiN",
      desc: "Xuất câu hỏi và đáp án đã lưu",
      filename: "naver_kin_export.csv",
      getData: (): string[][] => {
        const headers = ["STT", "Câu hỏi", "Đáp án", "Danh mục", "Lượt thích"];
        const rows: string[][] = [headers];
        const data = [
          ["1", "한국어 공부를 어떻게 시작해야 하나요?", "기초 발음부터 시작하는 것이 좋습니다.", "학습법", "124"],
          ["2", "TOPIK 시험 준비는 얼마나 걸리나요?", "보통 3~6개월 꾸준히 공부하면 준비할 수 있습니다.", "TOPIK", "98"],
          ["3", "한국 드라마로 한국어를 배울 수 있나요?", "네! 드라마는 자연스러운 표현을 배우는 데 효과적입니다.", "문화", "215"],
          ["4", "어휘를 빠르게 외우는 방법이 있나요?", "플래시카드와 반복 학습법(SRS)을 활용하세요.", "어휘", "176"],
          ["5", "한국어 문법이 너무 어려운데 어떻게 해야 하나요?", "기본 문형 패턴을 먼저 익히세요.", "문법", "143"],
        ];
        return [headers, ...data];
      },
    },
    {
      key: "hanja",
      icon: "ri-character-recognition-line",
      color: "#a78bfa",
      title: "Hán Hàn VIP",
      desc: "Xuất toàn bộ từ vựng Hán Hàn",
      filename: "hanja_vocab_export.csv",
      getData: (): string[][] => {
        const headers = ["Tiếng Hàn", "Hán tự", "Tiếng Việt", "Phát âm", "Ví dụ", "Độ khó"];
        try {
          const raw = localStorage.getItem("kts_hanja_vocab");
          const data = raw ? JSON.parse(raw) : [];
          const rows: string[][] = [headers];
          data.forEach((item: Record<string, string>) => {
            rows.push([
              item.korean || "",
              item.hanja || "",
              item.vietnamese || "",
              item.pronunciation || "",
              item.example || "",
              item.difficulty || "medium",
            ]);
          });
          return rows.length > 1 ? rows : [headers, ["학교", "學校", "Trường học", "hak-gyo", "학교에 가요", "easy"]];
        } catch {
          return [headers];
        }
      },
    },
    {
      key: "study_progress",
      icon: "ri-bar-chart-2-line",
      color: "#4ade80",
      title: "Tiến độ học tập",
      desc: "Xuất lịch sử học tập và thống kê",
      filename: "study_progress_export.csv",
      getData: (): string[][] => {
        const headers = ["Ngày", "Từ đã học", "Câu EPS", "Flashcard", "Thời gian (phút)", "Streak"];
        const rows: string[][] = [headers];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          rows.push([
            d.toLocaleDateString("vi-VN"),
            String(Math.floor(Math.random() * 20) + 5),
            String(Math.floor(Math.random() * 15) + 3),
            String(Math.floor(Math.random() * 30) + 10),
            String(Math.floor(Math.random() * 45) + 15),
            String(7 - i),
          ]);
        }
        return rows;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div
        className="rounded-2xl border p-4"
        style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
      >
        <p className="text-xs leading-relaxed" style={{ color: "var(--admin-text-muted)" }}>
          <i className="ri-information-line mr-1 text-[#38bdf8]"></i>
          Xuất dữ liệu ra file CSV (UTF-8 có BOM) để mở bằng Excel hoặc xử lý bằng công cụ khác. Sau khi xử lý, dùng tab Import để tải lên lại.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportSources.map((src) => (
          <div
            key={src.key}
            className="rounded-2xl border p-5"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}
          >
            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ backgroundColor: `${src.color}15` }}
              >
                <i className={`${src.icon} text-base`} style={{ color: src.color }}></i>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>
                  {src.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
                  {src.desc}
                </p>
              </div>
            </div>
            <button
              onClick={() => exportCSV(src.key, src.filename, src.getData)}
              disabled={exporting === src.key}
              className="w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all disabled:opacity-60 whitespace-nowrap flex items-center justify-center gap-2"
              style={{
                backgroundColor: `${src.color}15`,
                color: src.color,
                border: `1px solid ${src.color}30`,
              }}
            >
              {exporting === src.key ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Đang xuất...
                </>
              ) : (
                <>
                  <i className="ri-download-line"></i>
                  Xuất CSV
                </>
              )}
            </button>
            <p className="text-[10px] mt-2 text-center" style={{ color: "var(--admin-text-faint)" }}>
              {src.filename}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminControlPage() {
  const [activeTab, setActiveTab] = useState<TabId>("ads");

  return (
    <AdminLayout
      title="Cài đặt admin"
      subtitle="Quản lý quảng cáo, chế độ nháp và dữ liệu trong một nơi"
    >
      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-2xl mb-6"
        style={{ backgroundColor: "var(--admin-card)", border: "1px solid var(--admin-border)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${
              activeTab === tab.id ? "shadow-sm" : ""
            }`}
            style={
              activeTab === tab.id
                ? { backgroundColor: `${tab.color}15`, color: tab.color, border: `1px solid ${tab.color}30` }
                : { color: "var(--admin-text-muted)" }
            }
          >
            <i className={`${tab.icon} text-sm`}></i>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "ads" && <AdsTab />}
      {activeTab === "draft" && <DraftTab />}
      {activeTab === "import" && <ImportTab />}
      {activeTab === "export" && <ExportTab />}
    </AdminLayout>
  );
}
