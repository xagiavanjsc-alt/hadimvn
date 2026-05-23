import { useState } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";

export default function AdminHanjaUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: number; total: number; duplicates: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkDuplicates, setCheckDuplicates] = useState(true);
  const [duplicateAction, setDuplicateAction] = useState<'overwrite' | 'skip'>('skip');
  const [duplicateList, setDuplicateList] = useState<Array<{ korean: string; hanja: string }>>([]);

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
    setDuplicateList([]);

    try {
      // Read Excel file
      const buffer = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as (string | number)[][];

      // Parse rows: Column A = Korean, B = Hanja, C = Vietnamese
      const startIndex = data[0]?.[0] === 'Tiếng' || data[0]?.[0] === 'Korean' ? 1 : 0;
      const entries: { korean: string; hanja: string; vietnamese: string }[] = [];

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

      // Check duplicates in DB if enabled
      let duplicates: Array<{ korean: string; hanja: string }> = [];
      const duplicatesSet = new Set<string>();
      if (checkDuplicates) {
        for (const entry of entries) {
          const { data: existing } = await supabase
            .from('hanja_vocab_entries')
            .select('korean, hanja')
            .eq('korean', entry.korean)
            .eq('hanja', entry.hanja)
            .maybeSingle();

          if (existing) {
            duplicates.push({ korean: entry.korean, hanja: entry.hanja });
            duplicatesSet.add(`${entry.korean}|${entry.hanja}`);
          }
        }
        setDuplicateList(duplicates);
      }

      // Filter entries based on duplicate action
      let entriesToSync = entries;
      if (checkDuplicates && duplicateAction === 'skip') {
        entriesToSync = entries.filter(e => !duplicatesSet.has(`${e.korean}|${e.hanja}`));
      }

      // Sync to Supabase via RPC
      let created = 0;
      let errors = 0;

      for (const entry of entriesToSync) {
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

      setResult({ created, errors, total: entries.length, duplicates: duplicates.length, skipped: entries.length - entriesToSync.length });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi xử lý file');
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

          <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={checkDuplicates}
                onChange={(e) => setCheckDuplicates(e.target.checked)}
                className="w-4 h-4 rounded border-app-border bg-app-card text-app-accent-primary focus:ring-app-accent-primary/50 cursor-pointer"
              />
              <span className="text-app-text-secondary text-sm">Kiểm tra trùng lặp</span>
            </label>
          </div>

          {checkDuplicates && (
            <div className="flex items-center gap-4 mb-4 bg-app-card/50 rounded-lg p-3">
              <span className="text-app-text-secondary text-sm">Khi trùng lặp:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="overwrite"
                  checked={duplicateAction === 'overwrite'}
                  onChange={(e) => setDuplicateAction(e.target.value as 'overwrite' | 'skip')}
                  className="w-4 h-4 text-app-accent-primary focus:ring-app-accent-primary/50 cursor-pointer"
                />
                <span className="text-app-text-primary text-sm">Upload đè (thay thế dữ liệu cũ)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="skip"
                  checked={duplicateAction === 'skip'}
                  onChange={(e) => setDuplicateAction(e.target.value as 'overwrite' | 'skip')}
                  className="w-4 h-4 text-app-accent-primary focus:ring-app-accent-primary/50 cursor-pointer"
                />
                <span className="text-app-text-primary text-sm">Bỏ qua (giữ nguyên)</span>
              </label>
            </div>
          )}

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
          <div className="bg-app-accent-success/10 border border-app-accent-success/20 rounded-xl p-6 mb-6">
            <h3 className="text-app-text-primary font-semibold mb-3">Kết quả</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-app-accent-success">{result.created}</p>
                <p className="text-app-text-muted text-xs">Thành công</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-app-accent-error">{result.errors}</p>
                <p className="text-app-text-muted text-xs">Lỗi</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-app-accent-primary">{result.duplicates}</p>
                <p className="text-app-text-muted text-xs">Trùng lặp</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-app-text-muted">{result.skipped}</p>
                <p className="text-app-text-muted text-xs">Bỏ qua</p>
              </div>
            </div>
            <div className="text-center mb-4">
              <p className="text-app-text-secondary text-sm">Tổng số: {result.total} từ</p>
            </div>
            {duplicateList.length > 0 && (
              <div className="mt-4">
                <h4 className="text-app-text-secondary text-sm font-semibold mb-2">Danh sách trùng lặp:</h4>
                <div className="max-h-48 overflow-y-auto bg-app-card rounded-lg p-3">
                  {duplicateList.map((dup, idx) => (
                    <div key={idx} className="flex gap-2 text-xs py-1 border-b border-app-border last:border-0">
                      <span className="text-app-text-primary">{dup.korean}</span>
                      <span className="text-app-text-muted">{dup.hanja}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
