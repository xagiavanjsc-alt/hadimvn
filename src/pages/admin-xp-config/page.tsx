import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";
import { DEFAULT_XP_SETTINGS, clearXPSettingsCache, type XPSettings } from "@/hooks/useXPSettings";

interface FieldDef {
  key: keyof XPSettings;
  label: string;
  desc: string;
  group: "weights" | "anticheat";
  min: number;
  max: number;
  unit?: string;
}

const FIELDS: FieldDef[] = [
  // ─── Trọng số XP ─────────────────────────────────────────────────
  { key: "streak_weight", label: "Streak", desc: "XP cho mỗi ngày streak liên tục", group: "weights", min: 0, max: 100, unit: "XP/ngày" },
  { key: "best_score_weight", label: "Best Score", desc: "XP cho mỗi % điểm cao nhất từng đạt", group: "weights", min: 0, max: 50, unit: "XP/%" },
  { key: "average_score_weight", label: "Average Score", desc: "XP cho mỗi % điểm trung bình", group: "weights", min: 0, max: 50, unit: "XP/%" },
  { key: "correct_answer_weight", label: "Correct Answer", desc: "XP cho mỗi câu đúng (chỉ tính exam hợp lệ)", group: "weights", min: 0, max: 20, unit: "XP/câu" },
  { key: "flashcard_weight", label: "Flashcard", desc: "XP cho mỗi từ đã thuộc", group: "weights", min: 0, max: 20, unit: "XP/từ" },
  { key: "exam_completed_bonus", label: "Exam Bonus", desc: "Bonus mỗi exam hợp lệ", group: "weights", min: 0, max: 100, unit: "XP/lần" },
  // ─── Anti-cheat ──────────────────────────────────────────────────
  { key: "flashcard_xp_cap", label: "Flashcard Cap", desc: "Tối đa từ flashcard tính XP (chống cheat)", group: "anticheat", min: 0, max: 5000, unit: "từ" },
  { key: "min_sec_per_question", label: "Min Time/Câu", desc: "Thời gian tối thiểu mỗi câu (giây)", group: "anticheat", min: 1, max: 60, unit: "giây" },
  { key: "exam_cooldown_sec", label: "Exam Cooldown", desc: "Thời gian chờ giữa 2 exam", group: "anticheat", min: 0, max: 600, unit: "giây" },
  { key: "max_exams_per_day", label: "Exam/Ngày", desc: "Số exam hợp lệ tối đa mỗi ngày", group: "anticheat", min: 1, max: 100, unit: "lần" },
];

export default function AdminXPConfigPage() {
  const [settings, setSettings] = useState<XPSettings>(DEFAULT_XP_SETTINGS);
  const [original, setOriginal] = useState<XPSettings>(DEFAULT_XP_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Preview: ví dụ user mạnh
  const examplePreview = useMemo(() => {
    const stats = {
      streak: 30,
      bestScorePct: 85,
      avgScorePct: 70,
      correctAnswers: 200,
      wordsLearned: 300,
      validExams: 10,
    };
    const xp =
      stats.streak * settings.streak_weight +
      stats.bestScorePct * settings.best_score_weight +
      stats.avgScorePct * settings.average_score_weight +
      stats.correctAnswers * settings.correct_answer_weight +
      Math.min(stats.wordsLearned, settings.flashcard_xp_cap) * settings.flashcard_weight +
      stats.validExams * settings.exam_completed_bonus;
    return { stats, xp };
  }, [settings]);

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(original),
    [settings, original]
  );

  // Fetch on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("xp_settings")
        .select("*")
        .eq("id", "global")
        .maybeSingle();
      if (!mounted) return;
      if (error || !data) {
        setToast({ msg: "Không tải được cấu hình, dùng mặc định", type: "err" });
        setLoading(false);
        return;
      }
      const fetched: XPSettings = {
        streak_weight: data.streak_weight,
        best_score_weight: data.best_score_weight,
        average_score_weight: data.average_score_weight,
        correct_answer_weight: data.correct_answer_weight,
        flashcard_weight: data.flashcard_weight,
        exam_completed_bonus: data.exam_completed_bonus,
        flashcard_xp_cap: data.flashcard_xp_cap,
        min_sec_per_question: data.min_sec_per_question,
        exam_cooldown_sec: data.exam_cooldown_sec,
        max_exams_per_day: data.max_exams_per_day,
      };
      setSettings(fetched);
      setOriginal(fetched);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const { error } = await supabase
      .from("xp_settings")
      .update({ ...settings, updated_at: new Date().toISOString(), updated_by: userId })
      .eq("id", "global");

    setSaving(false);
    if (error) {
      showToast(`Lỗi: ${error.message}`, "err");
      return;
    }
    setOriginal(settings);
    clearXPSettingsCache();
    showToast("Đã lưu cấu hình. Server sẽ áp dụng cho lần tính XP tiếp theo.");
  };

  const handleReset = () => {
    setSettings(DEFAULT_XP_SETTINGS);
  };

  const handleRevert = () => {
    setSettings(original);
  };

  const updateField = (key: keyof XPSettings, value: number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <AdminLayout title="Cấu hình XP" subtitle="Đang tải...">
        <div className="text-white/40 text-sm">Đang tải cấu hình...</div>
      </AdminLayout>
    );
  }

  const weightFields = FIELDS.filter(f => f.group === "weights");
  const anticheatFields = FIELDS.filter(f => f.group === "anticheat");

  return (
    <AdminLayout title="Cấu hình XP & Anti-cheat" subtitle="Tùy chỉnh trọng số tính điểm và ngưỡng chống gian lận">
      <div className="space-y-5 max-w-4xl">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${
              toast.type === "ok" ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"
            }`}
          >
            {toast.msg}
          </div>
        )}

        {/* Info banner */}
        <div className="rounded-2xl p-4 border" style={{ borderColor: "var(--admin-border)", background: "var(--admin-card-bg)" }}>
          <div className="flex items-start gap-3">
            <i className="ri-information-line text-xl" style={{ color: "#38bdf8" }}></i>
            <div className="text-xs leading-relaxed" style={{ color: "var(--admin-text-muted)" }}>
              <p className="mb-1">
                <strong className="text-white/80">Công thức:</strong> XP = streak × W₁ + bestScore × W₂ + averageScore × W₃ + correctAnswers × W₄ + min(words, cap) × W₅ + validExams × W₆
              </p>
              <p>Server tự động tính lại XP cho toàn bộ user mỗi khi có exam mới. Cache client refresh sau 5 phút.</p>
            </div>
          </div>
        </div>

        {/* Trọng số XP */}
        <div className="rounded-2xl p-5 border" style={{ borderColor: "var(--admin-border)", background: "var(--admin-card-bg)" }}>
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--admin-text)" }}>
            <i className="ri-scales-3-line text-[#e8c84a]"></i>
            Trọng số XP
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weightFields.map(f => (
              <NumberField
                key={f.key}
                field={f}
                value={settings[f.key]}
                defaultValue={DEFAULT_XP_SETTINGS[f.key]}
                onChange={v => updateField(f.key, v)}
              />
            ))}
          </div>
        </div>

        {/* Anti-cheat thresholds */}
        <div className="rounded-2xl p-5 border" style={{ borderColor: "var(--admin-border)", background: "var(--admin-card-bg)" }}>
          <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: "var(--admin-text)" }}>
            <i className="ri-shield-check-line text-[#4ade80]"></i>
            Ngưỡng anti-cheat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {anticheatFields.map(f => (
              <NumberField
                key={f.key}
                field={f}
                value={settings[f.key]}
                defaultValue={DEFAULT_XP_SETTINGS[f.key]}
                onChange={v => updateField(f.key, v)}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-2xl p-5 border border-dashed" style={{ borderColor: "var(--admin-border)", background: "var(--admin-card-bg)" }}>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--admin-text)" }}>
            <i className="ri-eye-line text-[#a78bfa]"></i>
            Xem trước với user mẫu
          </h3>
          <div className="text-xs space-y-1" style={{ color: "var(--admin-text-muted)" }}>
            <p>Streak {examplePreview.stats.streak} ngày · Best {examplePreview.stats.bestScorePct}% · Avg {examplePreview.stats.avgScorePct}% · {examplePreview.stats.correctAnswers} câu đúng · {examplePreview.stats.wordsLearned} từ · {examplePreview.stats.validExams} exam hợp lệ</p>
          </div>
          <p className="text-2xl font-bold mt-3" style={{ color: "#e8c84a" }}>
            ≈ {examplePreview.xp.toLocaleString("vi-VN")} XP
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 sticky bottom-4 p-3 rounded-2xl" style={{ background: "var(--admin-card-bg)", borderColor: "var(--admin-border)", border: "1px solid" }}>
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-xl text-xs font-semibold border hover:bg-white/5"
            style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}
          >
            <i className="ri-refresh-line mr-1"></i>Mặc định
          </button>
          {isDirty && (
            <button
              onClick={handleRevert}
              className="px-3 py-2 rounded-xl text-xs font-semibold border hover:bg-white/5"
              style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}
            >
              <i className="ri-arrow-go-back-line mr-1"></i>Hủy thay đổi
            </button>
          )}
          <button
            disabled={!isDirty || saving}
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#0f1117] disabled:opacity-40"
            style={{ background: "#e8c84a" }}
          >
            <i className="ri-save-line mr-1"></i>
            {saving ? "Đang lưu..." : isDirty ? "Lưu thay đổi" : "Đã lưu"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

// ─── Number input field ──────────────────────────────────────────────────
function NumberField({
  field,
  value,
  defaultValue,
  onChange,
}: {
  field: FieldDef;
  value: number;
  defaultValue: number;
  onChange: (v: number) => void;
}) {
  const isChanged = value !== defaultValue;

  const handleChange = (v: string) => {
    const n = parseInt(v, 10);
    if (Number.isNaN(n)) return;
    onChange(Math.max(field.min, Math.min(field.max, n)));
  };

  return (
    <div className="rounded-xl p-3 border" style={{ borderColor: "var(--admin-border)" }}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold" style={{ color: "var(--admin-text)" }}>
          {field.label}
          {isChanged && <span className="ml-1 text-[10px] text-amber-400">●</span>}
        </label>
        <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
          mặc định: {defaultValue}
        </span>
      </div>
      <p className="text-[10px] mb-2 leading-snug" style={{ color: "var(--admin-text-muted)" }}>
        {field.desc}
      </p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={field.min}
          max={field.max}
          value={value}
          onChange={e => handleChange(e.target.value)}
          className="flex-1 bg-black/20 border rounded-lg px-2 py-1.5 text-sm font-mono text-white outline-none focus:border-[#e8c84a]/50"
          style={{ borderColor: "var(--admin-border)" }}
        />
        {field.unit && (
          <span className="text-[10px] whitespace-nowrap" style={{ color: "var(--admin-text-muted)" }}>
            {field.unit}
          </span>
        )}
      </div>
    </div>
  );
}
