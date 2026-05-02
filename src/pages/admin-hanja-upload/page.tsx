import { useState } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

export default function AdminHanjaUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      // Read Excel file
      const buffer = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      // Parse rows: Column A = Korean, B = Hanja, C = Vietnamese
      const startIndex = data[0]?.[0] === 'Tiếng' || data[0]?.[0] === 'Korean' ? 1 : 0;
      const entries: any[] = [];

      for (let i = startIndex; i < data.length; i++) {
        const row = data[i];
        if (row[0] && row[1]) {
          entries.push({
            korean: String(row[0]).trim(),
            hanja: String(row[1]).trim(),
            vietnamese: row[2] ? String(row[2]).trim() : '',
          });
        }
      }

      // Sync to Supabase via RPC
      let created = 0;
      let errors = 0;

      for (const entry of entries) {
        const { data: result, error } = await supabase.rpc('upsert_hanja_entry', {
          p_korean: entry.korean,
          p_hanja: entry.hanja,
          p_vietnamese: entry.vietnamese,
          p_pronunciation: null,
          p_category: 'Khác',
          p_difficulty: 2,
          p_topik_level: null,
          p_examples: [],
          p_memory_tip: null,
          p_related_words: [],
        });

        if (error || !result?.success) {
          errors++;
        } else {
          created++;
        }
      }

      setResult({ created, errors, total: entries.length });
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xử lý file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-app-text-primary mb-6">Upload Hán Hàn từ Excel</h1>

        <div className="bg-app-surface border border-app-border rounded-xl p-6 mb-6">
          <div className="mb-4">
            <label className="block text-app-text-secondary text-sm mb-2">Chọn file Excel</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="w-full bg-app-card border border-app-border rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-app-accent-primary cursor-pointer"
              disabled={uploading}
            />
          </div>

          <p className="text-app-text-muted text-xs mb-4">
            Định dạng: Cột A = Tiếng Hàn, Cột B = Hán tự, Cột C = Nội dung
          </p>

          {file && (
            <div className="bg-app-card rounded-lg p-3 mb-4">
              <p className="text-app-text-secondary text-sm">{file.name}</p>
              <p className="text-app-text-muted text-xs">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
              !file || uploading
                ? 'bg-app-card text-app-text-muted cursor-not-allowed'
                : 'bg-app-accent-primary text-app-bg hover:bg-app-accent-primary/90 cursor-pointer'
            }`}
          >
            {uploading ? 'Đang xử lý...' : 'Upload & Sync'}
          </button>
        </div>

        {error && (
          <div className="bg-app-accent-error/10 border border-app-accent-error/20 rounded-xl p-4 mb-6">
            <p className="text-app-accent-error text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-app-accent-success/10 border border-app-accent-success/20 rounded-xl p-6">
            <h3 className="text-app-text-primary font-semibold mb-3">Kết quả</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-app-accent-success">{result.created}</p>
                <p className="text-app-text-muted text-xs">Thành công</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-app-accent-error">{result.errors}</p>
                <p className="text-app-text-muted text-xs">Lỗi</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-app-text-primary">{result.total}</p>
                <p className="text-app-text-muted text-xs">Tổng</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
