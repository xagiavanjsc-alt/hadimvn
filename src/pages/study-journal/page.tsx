import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  studyMinutes: number;
  wordsLearned: number;
  content: string;
  tags: string[];
  createdAt: number;
}

const MOODS = [
  { value: "great", label: "Tuyệt vời", icon: "ri-emotion-laugh-line", color: "#34d399" },
  { value: "good", label: "Tốt", icon: "ri-emotion-happy-line", color: "#60a5fa" },
  { value: "okay", label: "Bình thường", icon: "ri-emotion-normal-line", color: "#fbbf24" },
  { value: "tired", label: "Mệt mỏi", icon: "ri-emotion-unhappy-line", color: "#f87171" },
  { value: "hard", label: "Khó khăn", icon: "ri-emotion-sad-line", color: "#a78bfa" },
];

const PRESET_TAGS = ["EPS-TOPIK", "Ngữ pháp", "Từ vựng", "Nghe", "Nói", "Đọc", "Viết", "Flashcard", "Quiz", "Giao tiếp"];

const STORAGE_KEY = "kts_study_journal_v1";

function loadEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function getMoodInfo(value: string) {
  return MOODS.find(m => m.value === value) || MOODS[2];
}

// ── Share Journal Modal ────────────────────────────────────────────────────
interface ShareJournalModalProps {
  entry: JournalEntry;
  onClose: () => void;
}

function ShareJournalModal({ entry, onClose }: ShareJournalModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const mood = getMoodInfo(entry.mood);

  const moodBg: Record<string, string> = {
    great: "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
    good: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%)",
    okay: "linear-gradient(135deg, #78350f 0%, #92400e 100%)",
    tired: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
    hard: "linear-gradient(135deg, #3b0764 0%, #4c1d95 100%)",
  };

  const moodAccent: Record<string, string> = {
    great: "#34d399", good: "#60a5fa", okay: "#fbbf24", tired: "#f87171", hard: "#a78bfa",
  };

  const accent = moodAccent[entry.mood] || "#e8c84a";
  const bg = moodBg[entry.mood] || moodBg.okay;

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `nhat-ky-hoc-tap-${entry.date}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // Fallback: open print dialog
      window.print();
    } finally {
      setDownloading(false);
    }
  }, [entry.date]);

  const handleCopyText = useCallback(() => {
    const text = [
      `📚 Nhật ký học tiếng Hàn — ${formatDate(entry.date)}`,
      `${mood.label} | ${entry.studyMinutes} phút | ${entry.wordsLearned} từ`,
      entry.content ? `\n"${entry.content}"` : "",
      entry.tags.length > 0 ? `\n${entry.tags.map(t => `#${t}`).join(" ")}` : "",
      "\n— Hàn Quốc Ơi! 🇰🇷",
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [entry, mood]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <i className="ri-share-line text-app-accent-primary"></i>
            Chia sẻ nhật ký
          </h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-sm"></i>
          </button>
        </div>

        {/* Preview card */}
        <div className="p-5">
          <div
            ref={cardRef}
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background: bg, minHeight: "220px" }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: accent }}></div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: accent }}></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}25` }}>
                  <i className="ri-draft-line text-sm" style={{ color: accent }}></i>
                </div>
                <span className="text-white/70 text-xs font-semibold">Nhật ký học tiếng Hàn</span>
              </div>
              <span className="text-app-text-secondary text-[10px]">Hàn Quốc Ơi!</span>
            </div>

            {/* Date & mood */}
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${accent}20` }}>
                <i className={`${mood.icon} text-sm`} style={{ color: accent }}></i>
                <span className="text-sm font-semibold" style={{ color: accent }}>{mood.label}</span>
              </div>
              <span className="text-white/50 text-xs">{formatDate(entry.date)}</span>
            </div>

            {/* Stats */}
            <div className="flex gap-4 mb-4 relative z-10">
              <div className="flex items-center gap-1.5">
                <i className="ri-time-line text-app-text-secondary text-xs"></i>
                <span className="text-white/70 text-xs font-medium">{entry.studyMinutes} phút</span>
              </div>
              <div className="flex items-center gap-1.5">
                <i className="ri-translate-2 text-app-text-secondary text-xs"></i>
                <span className="text-white/70 text-xs font-medium">{entry.wordsLearned} từ mới</span>
              </div>
            </div>

            {/* Content */}
            {entry.content && (
              <div className="relative z-10 mb-4">
                <p className="text-white/80 text-sm leading-relaxed italic line-clamp-3">
                  &ldquo;{entry.content}&rdquo;
                </p>
              </div>
            )}

            {/* Tags */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 relative z-10">
                {entry.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${accent}20`, color: accent }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Bottom bar */}
            <div className="mt-4 pt-3 border-t border-app-border flex items-center justify-between relative z-10">
              <span className="text-app-text-muted text-[10px]">hanquocoi.app</span>
              <div className="flex items-center gap-1">
                <i className="ri-global-line text-app-text-muted text-xs"></i>
                <span className="text-app-text-muted text-[10px]">학습 일기</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCopyText}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors"
            >
              <i className={`${copied ? "ri-check-line text-emerald-500" : "ri-clipboard-line"} text-sm`}></i>
              {copied ? "Đã sao chép!" : "Sao chép text"}
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-app-accent-primary text-app-bg text-sm font-medium hover:bg-[#d4b340] cursor-pointer whitespace-nowrap transition-colors disabled:opacity-60"
            >
              <i className={`${downloading ? "ri-loader-4-line animate-spin" : "ri-download-line"} text-sm`}></i>
              {downloading ? "Đang tạo..." : "Tải ảnh"}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-3">
            Chia sẻ lên Facebook, Zalo, Instagram để truyền cảm hứng học tiếng Hàn!
          </p>
        </div>
      </div>
    </div>
  );
}

interface EntryCardProps {
  entry: JournalEntry;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
}

function EntryCard({ entry, onEdit, onDelete, onShare }: EntryCardProps) {
  const mood = getMoodInfo(entry.mood);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:border-app-accent-primary/20 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${mood.color}15` }}>
            <i className={`${mood.icon} text-xl`} style={{ color: mood.color }}></i>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{formatDate(entry.date)}</p>
            <p className="text-xs text-gray-400">{mood.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onShare} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-app-accent-primary hover:bg-app-accent-primary/10 cursor-pointer transition-colors" title="Chia sẻ">
            <i className="ri-share-line text-sm"></i>
          </button>
          <button onClick={onEdit} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
            <i className="ri-edit-line text-sm"></i>
          </button>
          {showConfirm ? (
            <div className="flex items-center gap-1">
              <button onClick={() => { onDelete(); setShowConfirm(false); }} className="text-xs text-rose-500 hover:text-rose-600 cursor-pointer px-2 py-1 rounded bg-rose-50 whitespace-nowrap">Xóa</button>
              <button onClick={() => setShowConfirm(false)} className="text-xs text-gray-400 cursor-pointer px-2 py-1 rounded hover:bg-gray-50 whitespace-nowrap">Hủy</button>
            </div>
          ) : (
            <button onClick={() => setShowConfirm(true)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-rose-400 hover:bg-rose-50 cursor-pointer transition-colors">
              <i className="ri-delete-bin-line text-sm"></i>
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-3 py-2 border-y border-gray-50">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <i className="ri-time-line text-gray-400"></i>
          <span>{entry.studyMinutes} phút</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <i className="ri-translate-2 text-gray-400"></i>
          <span>{entry.wordsLearned} từ</span>
        </div>
      </div>

      {/* Content */}
      {entry.content && (
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">{entry.content}</p>
      )}

      {/* Tags */}
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-app-accent-primary/8 text-app-accent-primary border border-app-accent-primary/15 font-medium">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface JournalFormProps {
  initial?: JournalEntry | null;
  onSave: (entry: JournalEntry) => void;
  onCancel: () => void;
}

function JournalForm({ initial, onSave, onCancel }: JournalFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(initial?.date || today);
  const [mood, setMood] = useState(initial?.mood || "good");
  const [studyMinutes, setStudyMinutes] = useState(initial?.studyMinutes || 30);
  const [wordsLearned, setWordsLearned] = useState(initial?.wordsLearned || 0);
  const [content, setContent] = useState(initial?.content || "");
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [customTag, setCustomTag] = useState("");

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const addCustomTag = () => {
    const t = customTag.trim();
    if (t && !tags.includes(t)) {
      setTags(prev => [...prev, t]);
      setCustomTag("");
    }
  };

  const handleSubmit = () => {
    const entry: JournalEntry = {
      id: initial?.id || `j_${Date.now()}`,
      date,
      mood,
      studyMinutes,
      wordsLearned,
      content,
      tags,
      createdAt: initial?.createdAt || Date.now(),
    };
    onSave(entry);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
        <i className="ri-edit-2-line text-app-accent-primary"></i>
        {initial ? "Chỉnh sửa nhật ký" : "Ghi nhật ký hôm nay"}
      </h3>

      {/* Date */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 tracking-normal mb-1.5">Ngày học</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          max={today}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-app-accent-primary/50"
        />
      </div>

      {/* Mood */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 tracking-normal mb-1.5">Cảm xúc hôm nay</label>
        <div className="flex gap-2 flex-wrap">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all cursor-pointer whitespace-nowrap ${
                mood === m.value
                  ? "border-transparent font-medium"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
              style={mood === m.value ? { backgroundColor: `${m.color}15`, color: m.color, borderColor: `${m.color}30` } : {}}
            >
              <i className={`${m.icon} text-base`}></i>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 tracking-normal mb-1.5">Thời gian học (phút)</label>
          <input
            type="number"
            value={studyMinutes}
            onChange={e => setStudyMinutes(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            max={480}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-app-accent-primary/50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 tracking-normal mb-1.5">Số từ đã học</label>
          <input
            type="number"
            value={wordsLearned}
            onChange={e => setWordsLearned(Math.max(0, parseInt(e.target.value) || 0))}
            min={0}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-app-accent-primary/50"
          />
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <label className="block text-xs font-semibold text-gray-500 tracking-normal mb-1.5">
          Ghi chú / Cảm nhận
          <span className="ml-2 text-gray-300 normal-case font-normal">({content.length}/500)</span>
        </label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value.slice(0, 500))}
          placeholder="Hôm nay tôi đã học được gì? Điều gì khó? Điều gì thú vị?..."
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-app-accent-primary/50 resize-none"
        />
      </div>

      {/* Tags */}
      <div className="mb-5">
        <label className="block text-xs font-semibold text-gray-500 tracking-normal mb-1.5">Chủ đề học</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {PRESET_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                tags.includes(tag)
                  ? "bg-app-accent-primary/10 border-app-accent-primary/30 text-app-accent-primary font-medium"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTag}
            onChange={e => setCustomTag(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCustomTag()}
            placeholder="Thêm tag tùy chỉnh..."
            className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-app-accent-primary/50"
          />
          <button
            onClick={addCustomTag}
            className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 cursor-pointer whitespace-nowrap transition-colors"
          >
            Thêm
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 py-2.5 rounded-lg bg-app-accent-primary text-app-bg text-sm font-medium hover:bg-[#d4b340] cursor-pointer whitespace-nowrap transition-colors"
        >
          {initial ? "Lưu thay đổi" : "Lưu nhật ký"}
        </button>
      </div>
    </div>
  );
}

// ── Weekly Mood Chart ──────────────────────────────────────────────────────
function WeeklyMoodChart({ entries }: { entries: JournalEntry[] }) {
  const weeks = useMemo(() => {
    const result: { label: string; days: { date: string; mood: string | null; minutes: number }[] }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let w = 3; w >= 0; w--) {
      const days: { date: string; mood: string | null; minutes: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(today.getDate() - w * 7 - (6 - d));
        const dateStr = date.toISOString().split("T")[0];
        const entry = entries.find(e => e.date === dateStr);
        days.push({ date: dateStr, mood: entry?.mood ?? null, minutes: entry?.studyMinutes ?? 0 });
      }
      const startDate = new Date(days[0].date);
      const endDate = new Date(days[6].date);
      const label = `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`;
      result.push({ label, days });
    }
    return result;
  }, [entries]);

  const moodScore: Record<string, number> = {
    great: 5, good: 4, okay: 3, tired: 2, hard: 1,
  };

  const getMoodColor = (mood: string | null) => {
    if (!mood) return "#f3f4f6";
    const colors: Record<string, string> = {
      great: "#34d399",
      good: "#60a5fa",
      okay: "#fbbf24",
      tired: "#f87171",
      hard: "#a78bfa",
    };
    return colors[mood] || "#e5e7eb";
  };

  const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  // Compute weekly avg mood score
  const weeklyAvg = weeks.map(week => {
    const scored = week.days.filter(d => d.mood !== null).map(d => moodScore[d.mood!] ?? 3);
    return scored.length > 0 ? scored.reduce((a, b) => a + b, 0) / scored.length : 0;
  });

  const maxAvg = Math.max(...weeklyAvg, 1);

  if (entries.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <i className="ri-emotion-line text-app-accent-primary"></i>
            Biểu đồ cảm xúc theo tuần
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">4 tuần gần nhất</p>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-2 justify-end">
          {MOODS.map(m => (
            <div key={m.value} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getMoodColor(m.value) }}></div>
              <span className="text-[10px] text-gray-400">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="mb-5">
        <div className="flex gap-1 mb-1">
          <div className="w-20 flex-shrink-0"></div>
          {DAY_LABELS.map(d => (
            <div key={d} className="flex-1 text-center text-[10px] text-gray-400 font-medium">{d}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex gap-1 mb-1 items-center">
            <div className="w-20 flex-shrink-0 text-[10px] text-gray-400 truncate pr-1">{week.label}</div>
            {week.days.map((day, di) => {
              const mood = MOODS.find(m => m.value === day.mood);
              return (
                <div
                  key={di}
                  className="flex-1 aspect-square rounded-md flex items-center justify-center relative group cursor-default"
                  style={{ backgroundColor: getMoodColor(day.mood), minHeight: "28px" }}
                  title={day.mood ? `${day.date}: ${mood?.label} (${day.minutes} phút)` : day.date}
                >
                  {day.mood && (
                    <i className={`${mood?.icon ?? ""} text-white text-[10px] opacity-80`}></i>
                  )}
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 pointer-events-none">
                    <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap">
                      {day.mood ? `${mood?.label} · ${day.minutes}p` : "Không học"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Weekly trend bar chart */}
      <div className="border-t border-gray-50 pt-4">
        <p className="text-[10px] text-gray-400 font-semibold tracking-normal mb-3">Điểm cảm xúc trung bình mỗi tuần</p>
        <div className="flex items-end gap-3 h-16">
          {weeks.map((week, wi) => {
            const avg = weeklyAvg[wi];
            const heightPct = maxAvg > 0 ? (avg / maxAvg) * 100 : 0;
            const moodVal = avg >= 4.5 ? "great" : avg >= 3.5 ? "good" : avg >= 2.5 ? "okay" : avg >= 1.5 ? "tired" : avg > 0 ? "hard" : null;
            return (
              <div key={wi} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-500 font-medium">{avg > 0 ? avg.toFixed(1) : "—"}</span>
                <div className="w-full flex items-end justify-center" style={{ height: "40px" }}>
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: avg > 0 ? `${Math.max(8, heightPct * 0.4)}px` : "4px",
                      backgroundColor: avg > 0 ? getMoodColor(moodVal) : "#f3f4f6",
                    }}
                  />
                </div>
                <span className="text-[9px] text-gray-300 text-center leading-tight">{week.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mood distribution this month */}
      <div className="border-t border-gray-50 pt-4 mt-2">
        <p className="text-[10px] text-gray-400 font-semibold tracking-normal mb-3">Phân bố cảm xúc (28 ngày qua)</p>
        <div className="flex gap-1 h-3 rounded-full overflow-hidden">
          {(() => {
            const allDays = weeks.flatMap(w => w.days).filter(d => d.mood !== null);
            const total = allDays.length;
            if (total === 0) return <div className="flex-1 bg-gray-100 rounded-full" />;
            return MOODS.map(m => {
              const count = allDays.filter(d => d.mood === m.value).length;
              const pct = (count / total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={m.value}
                  className="h-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: getMoodColor(m.value) }}
                  title={`${m.label}: ${count} ngày (${Math.round(pct)}%)`}
                />
              );
            });
          })()}
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {(() => {
            const allDays = weeks.flatMap(w => w.days).filter(d => d.mood !== null);
            const total = allDays.length;
            return MOODS.map(m => {
              const count = allDays.filter(d => d.mood === m.value).length;
              if (count === 0) return null;
              return (
                <div key={m.value} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getMoodColor(m.value) }}></div>
                  <span className="text-[10px] text-gray-500">{m.label}: <strong>{count}</strong> ngày ({total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}

export default function StudyJournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null);
  const [filterMood, setFilterMood] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [search, setSearch] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [shareEntry, setShareEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    setEntries(loadEntries());
  }, []);

  const handleSave = (entry: JournalEntry) => {
    setEntries(prev => {
      const exists = prev.find(e => e.id === entry.id);
      const next = exists
        ? prev.map(e => e.id === entry.id ? entry : e)
        : [entry, ...prev];
      saveEntries(next);
      return next;
    });
    setShowForm(false);
    setEditEntry(null);
  };

  const handleDelete = (id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      saveEntries(next);
      return next;
    });
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditEntry(entry);
    setShowForm(true);
  };

  const allTags = Array.from(new Set(entries.flatMap(e => e.tags)));

  const filtered = entries
    .filter(e => {
      if (filterMood !== "all" && e.mood !== filterMood) return false;
      if (filterTag !== "all" && !e.tags.includes(filterTag)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return e.content.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    })
    .sort((a, b) => sortDesc ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);

  // Stats
  const totalMinutes = entries.reduce((s, e) => s + e.studyMinutes, 0);
  const totalWords = entries.reduce((s, e) => s + e.wordsLearned, 0);
  const avgMinutes = entries.length > 0 ? Math.round(totalMinutes / entries.length) : 0;
  const streak = (() => {
    if (entries.length === 0) return 0;
    const dates = [...new Set(entries.map(e => e.date))].sort().reverse();
    let count = 0;
    let cur = new Date();
    for (const d of dates) {
      const diff = Math.round((cur.getTime() - new Date(d).getTime()) / 86400000);
      if (diff <= 1) { count++; cur = new Date(d); }
      else break;
    }
    return count;
  })();

  const today = new Date().toISOString().split("T")[0];
  const hasToday = entries.some(e => e.date === today);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-5">
          <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <i className="ri-draft-line text-app-accent-primary"></i>
                Nhật ký học tập
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Ghi lại hành trình học tiếng Hàn của bạn</p>
            </div>
            {!showForm && (
              <button
                onClick={() => { setEditEntry(null); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-app-accent-primary text-app-bg rounded-lg text-sm font-medium hover:bg-[#d4b340] cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-add-line"></i>
                {hasToday ? "Thêm ghi chú" : "Ghi hôm nay"}
              </button>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { icon: "ri-calendar-check-line", label: "Tổng ngày ghi", value: entries.length, color: "#e8c84a", unit: "ngày" },
              { icon: "ri-time-line", label: "Tổng thời gian", value: Math.round(totalMinutes / 60), color: "#34d399", unit: "giờ" },
              { icon: "ri-translate-2", label: "Tổng từ học", value: totalWords, color: "#60a5fa", unit: "từ" },
              { icon: "ri-fire-line", label: "Streak hiện tại", value: streak, color: "#f87171", unit: "ngày" },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                    <i className={`${stat.icon} text-sm`} style={{ color: stat.color }}></i>
                  </div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                <p className="text-xs text-gray-400">{stat.unit}</p>
              </div>
            ))}
          </div>

          {/* Weekly Mood Chart — show when there are entries */}
          <WeeklyMoodChart entries={entries} />

          {/* Form */}
          {showForm && (
            <div className="mb-6">
              <JournalForm
                initial={editEntry}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditEntry(null); }}
              />
            </div>
          )}

          {/* Filters */}
          {entries.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="relative flex-1 min-w-[180px]">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm trong nhật ký..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-app-accent-primary/50 bg-white"
                />
              </div>
              <select
                value={filterMood}
                onChange={e => setFilterMood(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white cursor-pointer"
              >
                <option value="all">Tất cả cảm xúc</option>
                {MOODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              {allTags.length > 0 && (
                <select
                  value={filterTag}
                  onChange={e => setFilterTag(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white cursor-pointer"
                >
                  <option value="all">Tất cả chủ đề</option>
                  {allTags.map(t => <option key={t} value={t}>#{t}</option>)}
                </select>
              )}
              <button
                onClick={() => setSortDesc(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-500 hover:border-gray-300 cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className={`${sortDesc ? "ri-sort-desc" : "ri-sort-asc"} text-sm`}></i>
                {sortDesc ? "Mới nhất" : "Cũ nhất"}
              </button>
            </div>
          )}

          {/* Entries */}
          {entries.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-app-accent-primary/10 mx-auto mb-4">
                <i className="ri-draft-line text-3xl text-app-accent-primary"></i>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Chưa có nhật ký nào</h3>
              <p className="text-sm text-gray-400 mb-5">Bắt đầu ghi lại hành trình học tiếng Hàn của bạn!</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-5 py-2.5 bg-app-accent-primary text-app-bg rounded-lg text-sm font-medium hover:bg-[#d4b340] cursor-pointer whitespace-nowrap transition-colors"
              >
                Viết nhật ký đầu tiên
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <i className="ri-search-line text-3xl mb-2 block"></i>
              <p className="text-sm">Không tìm thấy nhật ký phù hợp</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(entry => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={() => handleEdit(entry)}
                  onDelete={() => handleDelete(entry.id)}
                  onShare={() => setShareEntry(entry)}
                />
              ))}
            </div>
          )}

          {/* Avg stats */}
          {entries.length >= 3 && (
            <div className="mt-6 bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-500 tracking-normal mb-3">Thống kê trung bình</p>
              <div className="flex gap-6 flex-wrap">
                <div>
                  <p className="text-lg font-bold text-gray-900">{avgMinutes} phút</p>
                  <p className="text-xs text-gray-400">Trung bình mỗi buổi</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{entries.length > 0 ? Math.round(totalWords / entries.length) : 0} từ</p>
                  <p className="text-xs text-gray-400">Trung bình mỗi ngày</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {MOODS.find(m => {
                      const counts: Record<string, number> = {};
                      entries.forEach(e => { counts[e.mood] = (counts[e.mood] || 0) + 1; });
                      return m.value === Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
                    })?.label || "—"}
                  </p>
                  <p className="text-xs text-gray-400">Cảm xúc phổ biến nhất</p>
                </div>
              </div>
            </div>
          )}

          {/* Share modal */}
          {shareEntry && (
            <ShareJournalModal entry={shareEntry} onClose={() => setShareEntry(null)} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
