import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabase";

export default function AdminGrammarPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>("");

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(l => l.trim());
      let imported = 0;
      
      for (const line of lines) {
        const [pattern, romanization, meaning, topik_level, category, explanation, image_url] = line.split(",").map(s => s.trim());
        if (!pattern || !meaning) continue;
        
        const { error } = await supabase.from("grammar_patterns").insert({
          pattern,
          romanization,
          meaning,
          topik_level: topik_level || null,
          category: category || "general",
          explanation: explanation || "",
          image_url: image_url || null,
          examples: "[]",
          level: topik_level === "TOPIK I" ? "beginner" : "intermediate",
        });
        if (!error) imported++;
      }
      setResult(`Đã import ${imported} mẫu câu`);
    } catch (e) {
      setResult("Lỗi: " + (e as Error).message);
    }
    setUploading(false);
  };

  return (
    <DashboardLayout title="Quản lý Ngữ pháp TOPIK" subtitle="Import 300+ ngữ pháp từ CSV">
      <div className="bg-app-bg border border-app-border rounded-xl p-6 max-w-2xl">
        <p className="text-white/70 text-sm mb-4">CSV format: pattern, romanization, meaning, topik_level, category, explanation, image_url</p>
        <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] || null)} className="mb-4 text-white/70 text-sm" />
        <button onClick={handleUpload} disabled={!file || uploading} className="px-4 py-2 bg-app-accent-primary text-app-bg rounded-lg text-sm font-semibold disabled:opacity-40">
          {uploading ? "Đang import..." : "Import"}
        </button>
        {result && <p className="mt-4 text-sm text-app-accent-success">{result}</p>}
      </div>
    </DashboardLayout>
  );
}
