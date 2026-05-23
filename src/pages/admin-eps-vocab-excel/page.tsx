import { useEffect, useState } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

interface ParsedRow {
  korean: string;
  vietnamese: string;
  reading: string;
  topic_id: string;
  level: "basic" | "intermediate" | "advanced";
  example: string;
  example_vi: string;
}

interface UploadResult {
  total: number;
  inserted: number;
  skipped: number;
  errors: number;
  invalid_topic: number;
}

const LEVELS = new Set(["basic", "intermediate", "advanced"]);

function normaliseLevel(v: string | number | undefined): "basic" | "intermediate" | "advanced" {
  const s = String(v ?? "").trim().toLowerCase();
  if (LEVELS.has(s)) return s as "basic" | "intermediate" | "advanced";
  return "basic";
}

export default function AdminEpsVocabExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<ParsedRow[] | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [topicIds, setTopicIds] = useState<string[]>([]);
  const [topicLabels, setTopicLabels] = useState<Record<string, string>>({});
  const [duplicates, setDuplicates] = useState<Array<{ korean: string; vietnamese: string }>>([]);

  // Load valid topic IDs once so we can validate rows before upload.
  useEffect(() => {
    supabase
      .from("eps_vocab_topics")
      .select("id,label")
      .order("sort_order", { ascending: true })
      .then(({ data, error: err }) => {
        if (err || !data) return;
        type Row = { id: string; label: string };
        const ids = (data as Row[]).map(r => r.id);
        const labels: Record<string, string> = {};
        (data as Row[]).forEach(r => { labels[r.id] = r.label; });
        setTopicIds(ids);
        setTopicLabels(labels);
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setResult(null);
    setError(null);
    setPreview(null);
    setDuplicates([]);
  };

  const parseFile = async () => {
    if (!file) return;
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(buffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number | undefined)[][];

      // Skip header row if first cell looks like a label
      const first = String(data[0]?.[0] ?? "").trim().toLowerCase();
      const startIdx = ["korean", "tiếng hàn", "han", "hàn"].includes(first) ? 1 : 0;

      const rows: ParsedRow[] = [];
      for (let i = startIdx; i < data.length; i++) {
        const r = data[i];
        if (!r || !r[0] || !r[1]) continue;
        rows.push({
          korean: String(r[0]).trim(),
          vietnamese: String(r[1]).trim(),
          reading: r[2] ? String(r[2]).trim() : "",
          topic_id: r[3] ? String(r[3]).trim() : "greeting",
          level: normaliseLevel(r[4]),
          example: r[5] ? String(r[5]).trim() : "",
          example_vi: r[6] ? String(r[6]).trim() : "",
        });
      }
      setPreview(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không đọc được file Excel");
    }
  };

  const handleUpload = async () => {
    if (!preview || preview.length === 0) return;
    setUploading(true);
    setError(null);
    setResult(null);
    setDuplicates([]);

    try {
      // ─── Validate topic_ids — collect rows with unknown topic ────────────
      const validTopics = new Set(topicIds);
      const validRows: ParsedRow[] = [];
      let invalidTopic = 0;
      for (const r of preview) {
        if (validTopics.has(r.topic_id)) validRows.push(r);
        else invalidTopic++;
      }

      // ─── Dup check on (korean, vietnamese) ────────────────────────────────
      // Pull every existing (korean, vietnamese) once instead of N queries.
      const { data: existing, error: dupErr } = await supabase
        .from("eps_vocab_entries")
        .select("korean,vietnamese");
      if (dupErr) throw new Error(`Không kiểm tra được trùng lặp: ${dupErr.message}`);

      const dupSet = new Set<string>();
      (existing ?? []).forEach((e: { korean: string; vietnamese: string }) => {
        dupSet.add(`${e.korean}|${e.vietnamese}`);
      });

      const dupList: Array<{ korean: string; vietnamese: string }> = [];
      const toInsert: ParsedRow[] = [];
      for (const r of validRows) {
        if (dupSet.has(`${r.korean}|${r.vietnamese}`)) {
          dupList.push({ korean: r.korean, vietnamese: r.vietnamese });
        } else {
          toInsert.push(r);
        }
      }
      setDuplicates(dupList);

      // ─── Bulk insert — Supabase tolerates up to ~1000 rows in one call ────
      let inserted = 0;
      let errors = 0;
      const ts = Date.now();
      const BATCH = 200;
      for (let i = 0; i < toInsert.length; i += BATCH) {
        const slice = toInsert.slice(i, i + BATCH).map((r, j) => ({
          id: `eps-${ts}-${i + j}`,
          korean: r.korean,
          reading: r.reading || null,
          vietnamese: r.vietnamese,
          example: r.example || null,
          example_vi: r.example_vi || null,
          topic_id: r.topic_id,
          level: r.level,
        }));
        const { error: insErr, count } = await supabase
          .from("eps_vocab_entries")
          .insert(slice, { count: "exact" });
        if (insErr) {
          errors += slice.length;
        } else {
          inserted += count ?? slice.length;
        }
      }

      setResult({
        total: preview.length,
        inserted,
        skipped: dupList.length,
        errors,
        invalid_topic: invalidTopic,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định khi upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-app-text-primary mb-2">Upload từ vựng EPS-TOPIK</h1>
        <p className="text-app-text-muted text-sm mb-6">
          Thêm hàng loạt từ vựng vào /flashcard mà không cần code deploy. Dữ liệu lưu vào bảng <code className="bg-app-surface px-1.5 py-0.5 rounded text-xs text-app-accent-primary">eps_vocab_entries</code> trên Supabase.
        </p>

        {/* Column reference */}
        <div className="bg-app-surface border border-app-border rounded-xl p-5 mb-6">
          <h3 className="text-app-text-primary font-semibold text-sm mb-3">Định dạng cột Excel</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-app-text-secondary">
            <div><span className="text-app-accent-primary font-semibold">A — Korean</span> (bắt buộc) — ví dụ: 안녕하세요</div>
            <div><span className="text-app-accent-primary font-semibold">B — Vietnamese</span> (bắt buộc) — ví dụ: Xin chào</div>
            <div><span className="text-app-text-muted">C — Reading</span> (tùy chọn) — phiên âm Romaja</div>
            <div><span className="text-app-text-muted">D — Topic ID</span> (mặc định: greeting)</div>
            <div><span className="text-app-text-muted">E — Level</span> — basic / intermediate / advanced</div>
            <div><span className="text-app-text-muted">F — Example (KO)</span> (tùy chọn)</div>
            <div className="sm:col-span-2"><span className="text-app-text-muted">G — Example (VI)</span> (tùy chọn) — dịch câu ví dụ</div>
          </div>
          {topicIds.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs text-app-text-secondary cursor-pointer hover:text-app-text-primary">
                Topic ID hợp lệ ({topicIds.length}) — click để xem
              </summary>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs">
                {topicIds.map(id => (
                  <div key={id} className="bg-app-bg rounded px-2 py-1">
                    <code className="text-app-accent-primary">{id}</code>
                    <span className="text-app-text-muted ml-1">{topicLabels[id]}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* File picker */}
        <div className="bg-app-surface border border-app-border rounded-xl p-5 mb-6">
          <label className="block text-app-text-secondary text-sm mb-2">Chọn file Excel</label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={uploading}
            className="w-full bg-app-card border border-app-border rounded-lg px-4 py-2.5 text-white text-sm cursor-pointer file:mr-3 file:bg-app-accent-primary/10 file:text-app-accent-primary file:border-0 file:px-3 file:py-1 file:rounded file:text-xs file:cursor-pointer"
          />
          {file && (
            <div className="bg-app-card rounded-lg p-3 mt-3 flex items-center justify-between">
              <div>
                <p className="text-app-text-secondary text-sm">{file.name}</p>
                <p className="text-app-text-muted text-xs">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <button
                onClick={parseFile}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-app-accent-primary/10 text-app-accent-primary hover:bg-app-accent-primary/20 cursor-pointer"
              >
                Đọc file
              </button>
            </div>
          )}
        </div>

        {/* Preview */}
        {preview && preview.length > 0 && (
          <div className="bg-app-surface border border-app-border rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-app-text-primary font-semibold text-sm">
                Xem trước ({preview.length} dòng)
              </h3>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-app-accent-primary text-app-bg hover:bg-app-accent-primary/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {uploading ? "Đang upload…" : `Upload ${preview.length} từ`}
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto bg-app-card/50 rounded-lg">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-app-card border-b border-app-border">
                  <tr className="text-app-text-muted text-left">
                    <th className="px-2 py-1.5">Korean</th>
                    <th className="px-2 py-1.5">VN</th>
                    <th className="px-2 py-1.5">Topic</th>
                    <th className="px-2 py-1.5">Level</th>
                  </tr>
                </thead>
                <tbody className="text-white/80">
                  {preview.slice(0, 50).map((r, i) => (
                    <tr key={i} className="border-b border-app-border/30">
                      <td className="px-2 py-1.5 font-medium">{r.korean}</td>
                      <td className="px-2 py-1.5">{r.vietnamese}</td>
                      <td className="px-2 py-1.5">
                        <code className={topicIds.includes(r.topic_id) ? "text-app-accent-primary" : "text-app-accent-error"}>
                          {r.topic_id}
                        </code>
                      </td>
                      <td className="px-2 py-1.5 text-app-text-muted">{r.level}</td>
                    </tr>
                  ))}
                  {preview.length > 50 && (
                    <tr><td colSpan={4} className="px-2 py-2 text-center text-app-text-muted">… {preview.length - 50} dòng nữa</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Errors */}
        {error && (
          <div className="bg-app-accent-error/10 border border-app-accent-error/30 rounded-xl p-4 mb-6">
            <p className="text-app-accent-error text-sm">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-app-surface border border-app-border rounded-xl p-5 mb-6">
            <h3 className="text-app-text-primary font-semibold text-sm mb-4">Kết quả</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-400">{result.inserted}</p>
                <p className="text-xs text-app-text-muted mt-1">Thêm mới</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber-400">{result.skipped}</p>
                <p className="text-xs text-app-text-muted mt-1">Trùng (bỏ qua)</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-400">{result.errors}</p>
                <p className="text-xs text-app-text-muted mt-1">Lỗi insert</p>
              </div>
              <div className="bg-app-card border border-app-border rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-app-text-secondary">{result.invalid_topic}</p>
                <p className="text-xs text-app-text-muted mt-1">Topic không hợp lệ</p>
              </div>
            </div>
            <p className="text-app-text-muted text-xs mt-3 text-center">Tổng {result.total} dòng đầu vào</p>
            {duplicates.length > 0 && (
              <details className="mt-3">
                <summary className="text-xs text-app-text-secondary cursor-pointer hover:text-app-text-primary">
                  Danh sách {duplicates.length} từ trùng — click để xem
                </summary>
                <div className="mt-2 max-h-48 overflow-y-auto bg-app-card rounded-lg p-3">
                  {duplicates.map((d, i) => (
                    <div key={i} className="text-xs py-1 border-b border-app-border/30 last:border-0">
                      <span className="text-app-text-primary">{d.korean}</span>
                      <span className="text-app-text-muted ml-2">→ {d.vietnamese}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
