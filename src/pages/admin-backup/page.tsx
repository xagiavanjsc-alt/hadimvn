import { useState, useMemo, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { useAdminToast } from "@/contexts/AdminToastContext";

// --- Types --------------------------------------------------------------------
interface BackupEntry {
  key: string;
  value: string;
  size: number;
  category: string;
}

interface BackupSnapshot {
  id: string;
  name: string;
  createdAt: string;
  size: number;
  keyCount: number;
  data: Record<string, string>;
}

// --- Key categories -----------------------------------------------------------
const KEY_CATEGORIES: { prefix: string; label: string; color: string; icon: string }[] = [
  { prefix: "kts_streak", label: "Streak", color: "#fb923c", icon: "ri-fire-line" },
  { prefix: "kts_eps", label: "EPS", color: "app-accent-primary", icon: "ri-file-list-3-line" },
  { prefix: "kts_sr", label: "Spaced Repetition", color: "#a78bfa", icon: "ri-brain-line" },
  { prefix: "kts_melon", label: "Melon", color: "#f472b6", icon: "ri-music-line" },
  { prefix: "kts_xp", label: "XP & Gamification", color: "#34d399", icon: "ri-star-line" },
  { prefix: "kts_broadcast", label: "Broadcast", color: "#f87171", icon: "ri-broadcast-line" },
  { prefix: "kts_revenue", label: "Doanh thu", color: "#34d399", icon: "ri-money-dollar-circle-line" },
  { prefix: "kts_admin", label: "Admin", color: "#60a5fa", icon: "ri-shield-keyhole-line" },
  { prefix: "kts_liked", label: "Likes", color: "#f87171", icon: "ri-heart-line" },
  { prefix: "kts_notif", label: "Notifications", color: "#a78bfa", icon: "ri-notification-3-line" },
];

function getCategoryForKey(key: string): { label: string; color: string; icon: string } {
  const match = KEY_CATEGORIES.find(c => key.startsWith(c.prefix));
  return match || { label: "Khác", color: "#6b7280", icon: "ri-database-line" };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// --- Read all localStorage ----------------------------------------------------
function readAllLocalStorage(): BackupEntry[] {
  const entries: BackupEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const value = localStorage.getItem(key) || "";
    const cat = getCategoryForKey(key);
    entries.push({
      key,
      value,
      size: new Blob([value]).size,
      category: cat.label,
    });
  }
  return entries.sort((a, b) => b.size - a.size);
}

// --- Backup Card --------------------------------------------------------------
function BackupCard({ snapshot, onRestore, onDelete }: {
  snapshot: BackupSnapshot;
  onRestore: (s: BackupSnapshot) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const keys = Object.keys(snapshot.data);

  return (
    <div className="rounded-xl border overflow-hidden"
      style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
          style={{ backgroundColor: "rgba(52,211,153,0.12)" }}>
          <i className="ri-save-line text-app-accent-success text-base"></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>{snapshot.name}</p>
          <div className="flex items-center gap-3 mt-0.5 text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
            <span><i className="ri-time-line mr-1"></i>{new Date(snapshot.createdAt).toLocaleString("vi-VN")}</span>
            <span><i className="ri-database-line mr-1"></i>{formatBytes(snapshot.size)}</span>
            <span><i className="ri-key-line mr-1"></i>{snapshot.keyCount} keys</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setExpanded(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
            style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>
            <i className={`ri-arrow-down-s-line text-sm transition-transform ${expanded ? "rotate-180" : ""}`}></i>
          </button>
          <button onClick={() => onRestore(snapshot)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-colors bg-emerald-500 hover:bg-emerald-400 text-white">
            <i className="ri-refresh-line"></i>Restore
          </button>
          <button onClick={() => onDelete(snapshot.id)}
            className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
            style={{ backgroundColor: "rgba(248,113,113,0.08)", color: "#f87171" }}>
            <i className="ri-delete-bin-line text-sm"></i>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-4 border-t" style={{ borderColor: "var(--admin-border)" }}>
          <p className="text-xs font-semibold mt-3 mb-2" style={{ color: "var(--admin-text-muted)" }}>
            Keys trong backup ({keys.length}):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {keys.map(k => {
              const cat = getCategoryForKey(k);
              return (
                <span key={k} className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${cat.color}12`, color: cat.color, border: `1px solid ${cat.color}25` }}>
                  {k.length > 30 ? k.slice(0, 30) + "..." : k}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Compare Tab --------------------------------------------------------------
type DiffType = "added" | "removed" | "changed" | "unchanged";

interface DiffEntry {
  key: string;
  type: DiffType;
  valueA?: string;
  valueB?: string;
  category: string;
}

function parseDiff(snapA: BackupSnapshot, snapB: BackupSnapshot): DiffEntry[] {
  const allKeys = new Set([...Object.keys(snapA.data), ...Object.keys(snapB.data)]);
  const entries: DiffEntry[] = [];
  allKeys.forEach(key => {
    const cat = getCategoryForKey(key);
    const valA = snapA.data[key];
    const valB = snapB.data[key];
    if (valA === undefined) {
      entries.push({ key, type: "added", valueB: valB, category: cat.label });
    } else if (valB === undefined) {
      entries.push({ key, type: "removed", valueA: valA, category: cat.label });
    } else if (valA !== valB) {
      entries.push({ key, type: "changed", valueA: valA, valueB: valB, category: cat.label });
    } else {
      entries.push({ key, type: "unchanged", valueA: valA, valueB: valB, category: cat.label });
    }
  });
  return entries.sort((a, b) => {
    const order: Record<DiffType, number> = { removed: 0, changed: 1, added: 2, unchanged: 3 };
    return order[a.type] - order[b.type];
  });
}

const DIFF_CONFIG: Record<DiffType, { label: string; color: string; bg: string; icon: string; border: string }> = {
  added: { label: "Thêm m?i", color: "#34d399", bg: "rgba(52,211,153,0.06)", icon: "ri-add-circle-line", border: "rgba(52,211,153,0.25)" },
  removed: { label: "B? xóa", color: "#f87171", bg: "rgba(248,113,113,0.06)", icon: "ri-delete-bin-line", border: "rgba(248,113,113,0.25)" },
  changed: { label: "Thay d?i", color: "app-accent-primary", bg: "rgba(232,200,74,0.06)", icon: "ri-edit-line", border: "rgba(232,200,74,0.25)" },
  unchanged: { label: "Không d?i", color: "#6b7280", bg: "transparent", icon: "ri-checkbox-blank-circle-line", border: "var(--admin-border)" },
};

function ValuePreview({ value }: { value: string }) {
  let preview = "";
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) preview = `Array[${parsed.length}]`;
    else if (typeof parsed === "object" && parsed !== null) {
      const keys = Object.keys(parsed).slice(0, 3);
      preview = `{${keys.join(", ")}${Object.keys(parsed).length > 3 ? "..." : "}"}}`;
    } else preview = String(parsed).slice(0, 60);
  } catch {
    preview = value.slice(0, 60);
  }
  return <code className="text-[10px] font-mono" style={{ color: "var(--admin-text-muted)" }}>{preview}</code>;
}

function CompareTab({ snapshots }: { snapshots: BackupSnapshot[] }) {
  const [snapAId, setSnapAId] = useState<string>(snapshots[0]?.id || "");
  const [snapBId, setSnapBId] = useState<string>(snapshots[1]?.id || "");
  const [filterType, setFilterType] = useState<DiffType | "all">("all");
  const [search, setSearch] = useState("");
  const [showUnchanged, setShowUnchanged] = useState(false);

  const snapA = snapshots.find(s => s.id === snapAId);
  const snapB = snapshots.find(s => s.id === snapBId);

  const diff = useMemo(() => {
    if (!snapA || !snapB || snapA.id === snapB.id) return [];
    return parseDiff(snapA, snapB);
  }, [snapA, snapB]);

  const filtered = useMemo(() => {
    let list = diff;
    if (!showUnchanged) list = list.filter(d => d.type !== "unchanged");
    if (filterType !== "all") list = list.filter(d => d.type === filterType);
    if (search.trim()) list = list.filter(d => d.key.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [diff, filterType, search, showUnchanged]);

  const stats = useMemo(() => ({
    added: diff.filter(d => d.type === "added").length,
    removed: diff.filter(d => d.type === "removed").length,
    changed: diff.filter(d => d.type === "changed").length,
    unchanged: diff.filter(d => d.type === "unchanged").length,
  }), [diff]);

  if (snapshots.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-xl border" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-faint)" }}>
        <i className="ri-file-copy-2-line text-4xl mb-3"></i>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>C?n ít nh?t 2 backup d? so sánh</p>
        <p className="text-xs">Hãy t?o thêm backup ? tab &ldquo;T?o Backup&rdquo;</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Snapshot selector */}
      <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--admin-text)" }}>
          <i className="ri-file-copy-2-line mr-2" style={{ color: "#a78bfa" }}></i>
          Ch?n 2 snapshot d? so sánh
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {([
            { label: "Snapshot A (cu)", val: snapAId, set: setSnapAId, color: "#f87171" },
            { label: "Snapshot B (m?i)", val: snapBId, set: setSnapBId, color: "#34d399" },
          ] as const).map(({ label, val, set, color }) => (
            <div key={label}>
              <label className="text-xs font-semibold mb-2 block" style={{ color }}>{label}</label>
              <div className="space-y-2">
                {snapshots.map(s => (
                  <div key={s.id}
                    className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                    style={{
                      backgroundColor: val === s.id ? `${color}08` : "var(--admin-card2)",
                      borderColor: val === s.id ? `${color}40` : "var(--admin-border)",
                    }}
                    onClick={() => set(s.id)}>
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: val === s.id ? color : "var(--admin-border2)", backgroundColor: val === s.id ? color : "transparent" }}>
                      {val === s.id && <i className="ri-check-line text-white text-[9px]"></i>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--admin-text)" }}>{s.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                        {new Date(s.createdAt).toLocaleString("vi-VN")} · {s.keyCount} keys · {formatBytes(s.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diff result */}
      {snapA && snapB && snapA.id !== snapB.id && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["added", "removed", "changed", "unchanged"] as DiffType[]).map(type => {
              const cfg = DIFF_CONFIG[type];
              const count = stats[type];
              return (
                <div key={type} className="rounded-xl p-4 border cursor-pointer transition-all"
                  style={{
                    backgroundColor: filterType === type ? cfg.bg : "var(--admin-card)",
                    borderColor: filterType === type ? cfg.border : "var(--admin-border)",
                  }}
                  onClick={() => setFilterType(filterType === type ? "all" : type)}>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${cfg.color}15` }}>
                      <i className={`${cfg.icon} text-xs`} style={{ color: cfg.color }}></i>
                    </div>
                    <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{cfg.label}</span>
                  </div>
                  <p className="text-xl font-bold" style={{ color: cfg.color }}>{count}</p>
                </div>
              );
            })}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--admin-text-faint)" }}></i>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm key..."
                className="w-full rounded-xl pl-8 pr-4 py-2 text-xs outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer" onClick={() => setShowUnchanged(v => !v)}>
              <div className="w-8 h-4 rounded-full transition-colors relative"
                style={{ backgroundColor: showUnchanged ? "#34d399" : "var(--admin-hover)", border: "1px solid var(--admin-border)" }}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${showUnchanged ? "left-4" : "left-0.5"}`}></div>
              </div>
              <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Hi?n th? key không d?i</span>
            </label>
            <span className="text-xs" style={{ color: "var(--admin-text-faint)" }}>{filtered.length} keys</span>
          </div>

          {/* Diff table */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)" }}>
            <div className="grid grid-cols-[1fr_1fr_1fr_80px] border-b text-xs font-semibold"
              style={{ backgroundColor: "var(--admin-card2)", borderColor: "var(--admin-border)" }}>
              <div className="px-4 py-3" style={{ color: "var(--admin-text-muted)" }}>Key</div>
              <div className="px-4 py-3 border-l" style={{ color: "#f87171", borderColor: "var(--admin-border)" }}>
                <i className="ri-arrow-left-line mr-1"></i>{snapA.name.slice(0, 20)}
              </div>
              <div className="px-4 py-3 border-l" style={{ color: "#34d399", borderColor: "var(--admin-border)" }}>
                <i className="ri-arrow-right-line mr-1"></i>{snapB.name.slice(0, 20)}
              </div>
              <div className="px-4 py-3 border-l text-center" style={{ color: "var(--admin-text-muted)", borderColor: "var(--admin-border)" }}>Lo?i</div>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-12" style={{ color: "var(--admin-text-faint)" }}>
                  Không có s? khác bi?t nào
                </div>
              ) : filtered.map(entry => {
                const cfg = DIFF_CONFIG[entry.type];
                const cat = getCategoryForKey(entry.key);
                return (
                  <div key={entry.key} className="grid grid-cols-[1fr_1fr_1fr_80px] border-t"
                    style={{ borderColor: "var(--admin-border)", backgroundColor: cfg.bg }}>
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: `${cat.color}12`, color: cat.color }}>
                          {entry.category}
                        </span>
                        <code className="text-[10px] font-mono truncate" style={{ color: "var(--admin-text)" }}>
                          {entry.key.length > 35 ? entry.key.slice(0, 35) + "..." : entry.key}
                        </code>
                      </div>
                    </div>
                    <div className="px-4 py-3 border-l" style={{ borderColor: "var(--admin-border)" }}>
                      {entry.valueA !== undefined ? (
                        <div className={entry.type === "removed" ? "line-through opacity-60" : ""}>
                          <ValuePreview value={entry.valueA} />
                        </div>
                      ) : <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>—</span>}
                    </div>
                    <div className="px-4 py-3 border-l" style={{ borderColor: "var(--admin-border)" }}>
                      {entry.valueB !== undefined ? (
                        <ValuePreview value={entry.valueB} />
                      ) : <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>—</span>}
                    </div>
                    <div className="px-4 py-3 border-l flex items-center justify-center" style={{ borderColor: "var(--admin-border)" }}>
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary text */}
          <div className="rounded-xl p-4 border" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--admin-text)" }}>Tóm t?t so sánh</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--admin-text-muted)" }}>
              So sánh <strong style={{ color: "#f87171" }}>{snapA.name}</strong> v?i <strong style={{ color: "#34d399" }}>{snapB.name}</strong>:
              {stats.added > 0 && <span> <strong style={{ color: "#34d399" }}>+{stats.added} key m?i</strong>,</span>}
              {stats.removed > 0 && <span> <strong style={{ color: "#f87171" }}>-{stats.removed} key b? xóa</strong>,</span>}
              {stats.changed > 0 && <span> <strong style={{ color: "app-accent-primary" }}>{stats.changed} key thay d?i</strong>,</span>}
              {stats.unchanged > 0 && <span> {stats.unchanged} key không d?i.</span>}
              {stats.added === 0 && stats.removed === 0 && stats.changed === 0 && (
                <span> <strong style={{ color: "#34d399" }}>Hai snapshot gi?ng h?t nhau!</strong></span>
              )}
            </p>
          </div>
        </>
      )}

      {snapA && snapB && snapA.id === snapB.id && (
        <div className="text-center py-10 rounded-xl border" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-faint)" }}>
          <i className="ri-save-line text-3xl mb-2 block"></i>
          Hãy ch?n 2 snapshot khác nhau d? so sánh
        </div>
      )}
    </div>
  );
}

// --- Scheduled Backup Tab -----------------------------------------------------
type ScheduleFreq = "daily" | "weekly" | "monthly";
type ScheduleStatus = "active" | "paused";

interface ScheduleRule {
  id: string;
  name: string;
  freq: ScheduleFreq;
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  status: ScheduleStatus;
  lastRun?: string;
  nextRun: string;
  backupCount: number;
  maxKeep: number;
  includeAll: boolean;
  categories: string[];
}

const FREQ_CONFIG: Record<ScheduleFreq, { label: string; color: string; icon: string }> = {
  daily: { label: "Hàng ngày", color: "#34d399", icon: "ri-calendar-check-line" },
  weekly: { label: "Hàng tu?n", color: "#a78bfa", icon: "ri-calendar-2-line" },
  monthly: { label: "Hàng tháng", color: "app-accent-primary", icon: "ri-calendar-line" },
};

const DAYS_OF_WEEK = ["Ch? nh?t", "Th? 2", "Th? 3", "Th? 4", "Th? 5", "Th? 6", "Th? 7"];

function calcNextRun(rule: { freq: ScheduleFreq; time: string; dayOfWeek?: number; dayOfMonth?: number }): string {
  const now = new Date();
  const [h, m] = rule.time.split(":").map(Number);
  const next = new Date(now);
  next.setHours(h, m, 0, 0);
  if (rule.freq === "daily") {
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (rule.freq === "weekly") {
    const dow = rule.dayOfWeek ?? 1;
    const diff = (dow - next.getDay() + 7) % 7 || 7;
    next.setDate(next.getDate() + diff);
  } else {
    const dom = rule.dayOfMonth ?? 1;
    next.setDate(dom);
    if (next <= now) next.setMonth(next.getMonth() + 1);
  }
  return next.toISOString();
}

const SCHEDULE_STORAGE_KEY = "kts_admin_schedules";

function loadSchedules(): ScheduleRule[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ScheduleRule[];
  } catch { /* ignore */ }
  return [
    {
      id: "sch-001", name: "Backup hàng ngày - Full", freq: "daily", time: "02:00",
      status: "active", lastRun: new Date(Date.now() - 86400000).toISOString(),
      nextRun: calcNextRun({ freq: "daily", time: "02:00" }),
      backupCount: 14, maxKeep: 7, includeAll: true, categories: [],
    },
    {
      id: "sch-002", name: "Backup tu?n - EPS & Melon", freq: "weekly", time: "03:00", dayOfWeek: 1,
      status: "active", lastRun: new Date(Date.now() - 7 * 86400000).toISOString(),
      nextRun: calcNextRun({ freq: "weekly", time: "03:00", dayOfWeek: 1 }),
      backupCount: 8, maxKeep: 4, includeAll: false, categories: ["EPS", "Melon"],
    },
    {
      id: "sch-003", name: "Backup tháng - Archive", freq: "monthly", time: "01:00", dayOfMonth: 1,
      status: "paused", lastRun: new Date(Date.now() - 30 * 86400000).toISOString(),
      nextRun: calcNextRun({ freq: "monthly", time: "01:00", dayOfMonth: 1 }),
      backupCount: 3, maxKeep: 12, includeAll: true, categories: [],
    },
  ];
}

function ScheduleTab({ onCreateBackup, snapshots: externalSnapshots, setSnapshots: setExternalSnapshots }: {
  onCreateBackup: (name: string) => void;
  snapshots: BackupSnapshot[];
  setSnapshots: (s: BackupSnapshot[]) => void;
}) {
  const { showToast } = useAdminToast();
  const [schedules, setSchedules] = useState<ScheduleRule[]>(loadSchedules);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [schedToast, setSchedToast] = useState<string | null>(null);
  const [autoCleanup, setAutoCleanup] = useState<boolean>(() => {
    try { return JSON.parse(localStorage.getItem("kts_backup_autocleanup") || "true"); } catch { return true; }
  });
  const [cleanupDays, setCleanupDays] = useState<number>(() => {
    try { return JSON.parse(localStorage.getItem("kts_backup_cleanup_days") || "30"); } catch { return 30; }
  });
  const [showCleanupSettings, setShowCleanupSettings] = useState(false);
  const [formName, setFormName] = useState("");
  const [formFreq, setFormFreq] = useState<ScheduleFreq>("daily");
  const [formTime, setFormTime] = useState("02:00");
  const [formDow, setFormDow] = useState(1);
  const [formDom, setFormDom] = useState(1);
  const [formMaxKeep, setFormMaxKeep] = useState(7);
  const [formIncludeAll, setFormIncludeAll] = useState(true);
  const [formCategories, setFormCategories] = useState<string[]>([]);

  const showMsg = (msg: string) => { setSchedToast(msg); setTimeout(() => setSchedToast(null), 3000); };

  const toggleAutoCleanup = (val: boolean) => {
    setAutoCleanup(val);
    localStorage.setItem("kts_backup_autocleanup", JSON.stringify(val));
  };

  const updateCleanupDays = (days: number) => {
    setCleanupDays(days);
    localStorage.setItem("kts_backup_cleanup_days", JSON.stringify(days));
  };

  const runManualCleanup = (snapshots: BackupSnapshot[], setSnapshots: (s: BackupSnapshot[]) => void) => {
    const cutoff = Date.now() - cleanupDays * 86400000;
    const kept = snapshots.filter(s => new Date(s.createdAt).getTime() >= cutoff);
    const removed = snapshots.length - kept.length;
    if (removed > 0) {
      setSnapshots(kept);
      localStorage.setItem("kts_admin_backups", JSON.stringify(kept));
      showMsg(`Ðã xóa ${removed} backup cu hon ${cleanupDays} ngày`);
      showToast({ type: "success", title: `Auto-cleanup: xóa ${removed} backup cu` });
    } else {
      showMsg("Không có backup nào c?n xóa");
    }
  };

  const saveSchedules = (list: ScheduleRule[]) => {
    setSchedules(list);
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(list));
  };

  const openCreate = () => {
    setEditId(null); setFormName(""); setFormFreq("daily"); setFormTime("02:00");
    setFormDow(1); setFormDom(1); setFormMaxKeep(7); setFormIncludeAll(true); setFormCategories([]);
    setShowForm(true);
  };

  const openEdit = (rule: ScheduleRule) => {
    setEditId(rule.id); setFormName(rule.name); setFormFreq(rule.freq); setFormTime(rule.time);
    setFormDow(rule.dayOfWeek ?? 1); setFormDom(rule.dayOfMonth ?? 1);
    setFormMaxKeep(rule.maxKeep); setFormIncludeAll(rule.includeAll); setFormCategories(rule.categories);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formName.trim()) return;
    const base = {
      name: formName.trim(), freq: formFreq, time: formTime,
      dayOfWeek: formFreq === "weekly" ? formDow : undefined,
      dayOfMonth: formFreq === "monthly" ? formDom : undefined,
      status: "active" as ScheduleStatus,
      maxKeep: formMaxKeep, includeAll: formIncludeAll, categories: formCategories,
    };
    const nextRun = calcNextRun(base);
    if (editId) {
      saveSchedules(schedules.map(s => s.id === editId ? { ...s, ...base, nextRun } : s));
      showMsg("C?p nh?t l?ch thành công");
    } else {
      const newRule: ScheduleRule = { ...base, id: `sch-${Date.now()}`, nextRun, backupCount: 0 };
      saveSchedules([...schedules, newRule]);
      showMsg("T?o l?ch backup thành công");
    }
    setShowForm(false);
  };

  const toggleStatus = (id: string) => {
    saveSchedules(schedules.map(s => s.id === id ? { ...s, status: s.status === "active" ? "paused" : "active" as ScheduleStatus } : s));
  };

  const handleDelete = (id: string) => {
    saveSchedules(schedules.filter(s => s.id !== id));
    showMsg("Ðã xóa l?ch backup");
  };

  const handleRunNow = (rule: ScheduleRule) => {
    const name = `${rule.name} (Manual ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })})`;
    onCreateBackup(name);
    saveSchedules(schedules.map(s => s.id === rule.id ? { ...s, lastRun: new Date().toISOString(), backupCount: s.backupCount + 1 } : s));
    // Auto-cleanup after creating backup
    if (autoCleanup) {
      setTimeout(() => runManualCleanup(externalSnapshots, setExternalSnapshots), 500);
    }
    showMsg(`Ðã ch?y backup: ${name}`);
  };

  const toggleCategory = (cat: string) => {
    setFormCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const allCategories = KEY_CATEGORIES.map(c => c.label);

  return (
    <div className="space-y-5">
      {schedToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500 text-white text-sm font-medium">
          <i className="ri-checkbox-circle-line"></i>{schedToast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>L?ch backup t? d?ng</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
            Thi?t l?p backup t? d?ng theo chu k? hàng ngày, tu?n, tháng
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
          <i className="ri-add-line"></i>T?o l?ch m?i
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "L?ch dang ho?t d?ng", value: schedules.filter(s => s.status === "active").length, color: "#34d399", icon: "ri-play-circle-line" },
          { label: "T?ng backup dã t?o", value: schedules.reduce((s, r) => s + r.backupCount, 0), color: "#a78bfa", icon: "ri-save-line" },
          { label: "L?ch t?m d?ng", value: schedules.filter(s => s.status === "paused").length, color: "app-accent-primary", icon: "ri-pause-circle-line" },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4 border"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
              </div>
              <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{s.label}</span>
            </div>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-16 rounded-xl border" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-faint)" }}>
          <i className="ri-calendar-schedule-line text-4xl mb-3 block"></i>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--admin-text-muted)" }}>Chua có l?ch backup nào</p>
          <p className="text-xs">Nh?n &ldquo;T?o l?ch m?i&rdquo; d? b?t d?u</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map(rule => {
            const freqCfg = FREQ_CONFIG[rule.freq];
            const isActive = rule.status === "active";
            return (
              <div key={rule.id} className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: "var(--admin-card)", borderColor: isActive ? `${freqCfg.color}25` : "var(--admin-border)" }}>
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
                    style={{ backgroundColor: `${freqCfg.color}15` }}>
                    <i className={`${freqCfg.icon} text-base`} style={{ color: freqCfg.color }}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>{rule.name}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: `${freqCfg.color}15`, color: freqCfg.color }}>{freqCfg.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{ backgroundColor: isActive ? "rgba(52,211,153,0.12)" : "rgba(107,114,128,0.12)", color: isActive ? "#34d399" : "#6b7280" }}>
                        <i className={`${isActive ? "ri-play-circle-line" : "ri-pause-circle-line"} mr-1`}></i>
                        {isActive ? "Ho?t d?ng" : "T?m d?ng"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] flex-wrap" style={{ color: "var(--admin-text-faint)" }}>
                      <span><i className="ri-time-line mr-1"></i>{rule.time}
                        {rule.freq === "weekly" && ` • ${DAYS_OF_WEEK[rule.dayOfWeek ?? 1]}`}
                        {rule.freq === "monthly" && ` • Ngày ${rule.dayOfMonth ?? 1} hàng tháng`}
                      </span>
                      <span><i className="ri-save-line mr-1"></i>{rule.backupCount} backups dã t?o</span>
                      <span><i className="ri-archive-line mr-1"></i>Gi? t?i da {rule.maxKeep}</span>
                      {rule.lastRun && (
                        <span><i className="ri-history-line mr-1"></i>L?n cu?i: {new Date(rule.lastRun).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 text-[10px]">
                      <span style={{ color: "var(--admin-text-muted)" }}>L?n ch?y ti?p theo:</span>
                      <span className="font-semibold" style={{ color: freqCfg.color }}>
                        {new Date(rule.nextRun).toLocaleString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    {!rule.includeAll && rule.categories.length > 0 && (
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>Danh m?c:</span>
                        {rule.categories.map(c => (
                          <span key={c} className="text-[9px] px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}>{c}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleRunNow(rule)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap transition-colors"
                      style={{ backgroundColor: `${freqCfg.color}12`, color: freqCfg.color, border: `1px solid ${freqCfg.color}25` }}>
                      <i className="ri-play-line"></i>Ch?y ngay
                    </button>
                    <button onClick={() => toggleStatus(rule.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                      style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }}
                      title={isActive ? "T?m d?ng" : "Kích ho?t"}>
                      <i className={`${isActive ? "ri-pause-line" : "ri-play-line"} text-sm`}></i>
                    </button>
                    <button onClick={() => openEdit(rule)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                      style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)" }} title="Ch?nh s?a">
                      <i className="ri-edit-line text-sm"></i>
                    </button>
                    <button onClick={() => handleDelete(rule.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer transition-colors"
                      style={{ backgroundColor: "rgba(248,113,113,0.08)", color: "#f87171" }} title="Xóa">
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* -- Auto-cleanup Settings -- */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        <button
          className="w-full flex items-center justify-between px-5 py-4 cursor-pointer"
          onClick={() => setShowCleanupSettings(v => !v)}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(248,113,113,0.12)" }}>
              <i className="ri-delete-bin-line text-base" style={{ color: "#f87171" }}></i>
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>T? d?ng d?n d?p backup cu</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>
                {autoCleanup ? `Ðang b?t — xóa backup cu hon ${cleanupDays} ngày` : "Ðang t?t"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-5 rounded-full relative transition-colors cursor-pointer"
              style={{ backgroundColor: autoCleanup ? "#34d399" : "var(--admin-hover)", border: "1px solid var(--admin-border)" }}
              onClick={e => { e.stopPropagation(); toggleAutoCleanup(!autoCleanup); }}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${autoCleanup ? "left-5" : "left-0.5"}`}></div>
            </div>
            <i className={`ri-arrow-down-s-line text-sm transition-transform ${showCleanupSettings ? "rotate-180" : ""}`} style={{ color: "var(--admin-text-faint)" }}></i>
          </div>
        </button>

        {showCleanupSettings && (
          <div className="px-5 pb-5 border-t space-y-4" style={{ borderColor: "var(--admin-border)" }}>
            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>Xóa backup cu hon (ngày)</label>
                <span className="text-sm font-bold" style={{ color: "#f87171" }}>{cleanupDays} ngày</span>
              </div>
              <input
                type="range" min={7} max={90} step={1} value={cleanupDays}
                onChange={e => updateCleanupDays(Number(e.target.value))}
                className="w-full cursor-pointer"
                disabled={!autoCleanup}
                style={{ opacity: autoCleanup ? 1 : 0.4 }}
              />
              <div className="flex justify-between text-[10px] mt-1" style={{ color: "var(--admin-text-faint)" }}>
                <span>7 ngày</span><span>30 ngày</span><span>60 ngày</span><span>90 ngày</span>
              </div>
            </div>

            <div className="rounded-xl p-4 border" style={{ backgroundColor: "rgba(248,113,113,0.05)", borderColor: "rgba(248,113,113,0.2)" }}>
              <p className="text-xs font-semibold mb-2" style={{ color: "#f87171" }}>
                <i className="ri-information-line mr-1"></i>Cách ho?t d?ng
              </p>
              <ul className="space-y-1.5 text-xs" style={{ color: "var(--admin-text-muted)" }}>
                <li><i className="ri-checkbox-circle-line mr-1.5" style={{ color: "#34d399" }}></i>Khi t?o backup m?i, t? d?ng xóa backup cu hon {cleanupDays} ngày</li>
                <li><i className="ri-checkbox-circle-line mr-1.5" style={{ color: "#34d399" }}></i>Backup du?c t?o b?i l?ch t? d?ng cung áp d?ng quy t?c này</li>
                <li><i className="ri-error-warning-line mr-1.5" style={{ color: "app-accent-primary" }}></i>Backup dã xóa không th? khôi ph?c</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => runManualCleanup(externalSnapshots, setExternalSnapshots)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap transition-colors"
                style={{ backgroundColor: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.25)" }}
              >
                <i className="ri-delete-bin-line"></i>D?n d?p ngay ({externalSnapshots.filter(s => new Date(s.createdAt).getTime() < Date.now() - cleanupDays * 86400000).length} backup cu)
              </button>
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs" style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text-faint)", border: "1px solid var(--admin-border)" }}>
                <i className="ri-save-line"></i>
                <span>T?ng: <strong style={{ color: "var(--admin-text)" }}>{externalSnapshots.length}</strong> backup · Cu hon {cleanupDays} ngày: <strong style={{ color: "#f87171" }}>{externalSnapshots.filter(s => new Date(s.createdAt).getTime() < Date.now() - cleanupDays * 86400000).length}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--admin-border)" }}>
              <p className="font-bold text-sm" style={{ color: "var(--admin-text)" }}>
                {editId ? "Ch?nh s?a l?ch backup" : "T?o l?ch backup m?i"}
              </p>
              <button onClick={() => setShowForm(false)} className="w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer" style={{ color: "var(--admin-text-muted)" }}>
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>Tên l?ch</label>
                <input value={formName} onChange={e => setFormName(e.target.value)}
                  placeholder="VD: Backup hàng ngày - Full"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border"
                  style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>Chu k?</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(["daily", "weekly", "monthly"] as ScheduleFreq[]).map(f => {
                    const cfg = FREQ_CONFIG[f];
                    return (
                      <button key={f} onClick={() => setFormFreq(f)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer whitespace-nowrap transition-all"
                        style={{ backgroundColor: formFreq === f ? `${cfg.color}12` : "var(--admin-card2)", borderColor: formFreq === f ? `${cfg.color}40` : "var(--admin-border)", color: formFreq === f ? cfg.color : "var(--admin-text-muted)" }}>
                        <i className={cfg.icon}></i>{cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>Gi? ch?y</label>
                  <input type="time" value={formTime} onChange={e => setFormTime(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border"
                    style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
                </div>
                {formFreq === "weekly" && (
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>Ngày trong tu?n</label>
                    <select value={formDow} onChange={e => setFormDow(Number(e.target.value))}
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border cursor-pointer"
                      style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }}>
                      {DAYS_OF_WEEK.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                  </div>
                )}
                {formFreq === "monthly" && (
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>Ngày trong tháng</label>
                    <select value={formDom} onChange={e => setFormDom(Number(e.target.value))}
                      className="w-full rounded-xl px-4 py-2.5 text-sm outline-none border cursor-pointer"
                      style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }}>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map(d => <option key={d} value={d}>Ngày {d}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block" style={{ color: "var(--admin-text-muted)" }}>Gi? t?i da (s? backup)</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={1} max={30} value={formMaxKeep} onChange={e => setFormMaxKeep(Number(e.target.value))}
                    className="flex-1 cursor-pointer" />
                  <span className="text-sm font-bold w-8 text-center" style={{ color: "var(--admin-text)" }}>{formMaxKeep}</span>
                </div>
                <p className="text-[10px] mt-1" style={{ color: "var(--admin-text-faint)" }}>Backup cu hon s? t? d?ng xóa khi vu?t gi?i h?n</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>Danh m?c backup</label>
                  <button onClick={() => setFormIncludeAll(v => !v)}
                    className="flex items-center gap-1.5 text-[10px] cursor-pointer"
                    style={{ color: formIncludeAll ? "#34d399" : "var(--admin-text-faint)" }}>
                    <div className="w-7 h-3.5 rounded-full relative transition-colors"
                      style={{ backgroundColor: formIncludeAll ? "#34d399" : "var(--admin-hover)", border: "1px solid var(--admin-border)" }}>
                      <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${formIncludeAll ? "left-3.5" : "left-0.5"}`}></div>
                    </div>
                    T?t c? danh m?c
                  </button>
                </div>
                {!formIncludeAll && (
                  <div className="flex flex-wrap gap-1.5">
                    {allCategories.map(cat => (
                      <button key={cat} onClick={() => toggleCategory(cat)}
                        className="text-[10px] px-2.5 py-1 rounded-full cursor-pointer whitespace-nowrap transition-colors"
                        style={{
                          backgroundColor: formCategories.includes(cat) ? "rgba(167,139,250,0.15)" : "var(--admin-hover)",
                          color: formCategories.includes(cat) ? "#a78bfa" : "var(--admin-text-muted)",
                          border: `1px solid ${formCategories.includes(cat) ? "rgba(167,139,250,0.3)" : "var(--admin-border)"}`,
                        }}>{cat}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-5 py-4 border-t flex gap-3" style={{ borderColor: "var(--admin-border)" }}>
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
                style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>H?y</button>
              <button onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
                {editId ? "C?p nh?t" : "T?o l?ch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Page ----------------------------------------------------------------
export default function AdminBackupPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "backup" | "restore" | "compare" | "schedule">("overview");
  const [entries, setEntries] = useState<BackupEntry[]>(() => readAllLocalStorage());
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kts_admin_backups") || "[]");
    } catch { return []; }
  });
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [backupName, setBackupName] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [restoreFile, setRestoreFile] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<BackupSnapshot | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshEntries = useCallback(() => {
    setEntries(readAllLocalStorage());
  }, []);

  const filteredEntries = useMemo(() => {
    let list = [...entries];
    if (filterCat !== "all") list = list.filter(e => e.category === filterCat);
    if (search.trim()) list = list.filter(e => e.key.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [entries, filterCat, search]);

  const totalSize = useMemo(() => entries.reduce((s, e) => s + e.size, 0), [entries]);

  const categories = useMemo(() => {
    const map: Record<string, { count: number; size: number; color: string; icon: string }> = {};
    entries.forEach(e => {
      const cat = getCategoryForKey(e.key);
      if (!map[e.category]) map[e.category] = { count: 0, size: 0, color: cat.color, icon: cat.icon };
      map[e.category].count++;
      map[e.category].size += e.size;
    });
    return map;
  }, [entries]);

  const toggleKey = (key: string) => {
    setSelectedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelectedKeys(new Set(filteredEntries.map(e => e.key)));
  const deselectAll = () => setSelectedKeys(new Set());

  const handleCreateBackup = () => {
    const keysToBackup = selectedKeys.size > 0 ? [...selectedKeys] : entries.map(e => e.key);
    const data: Record<string, string> = {};
    keysToBackup.forEach(k => {
      const val = localStorage.getItem(k);
      if (val !== null) data[k] = val;
    });
    const totalBytes = Object.values(data).reduce((s, v) => s + new Blob([v]).size, 0);
    const snapshot: BackupSnapshot = {
      id: `backup-${Date.now()}`,
      name: backupName.trim() || `Backup ${new Date().toLocaleString("vi-VN")}`,
      createdAt: new Date().toISOString(),
      size: totalBytes,
      keyCount: Object.keys(data).length,
      data,
    };
    const updated = [snapshot, ...snapshots];
    setSnapshots(updated);
    localStorage.setItem("kts_admin_backups", JSON.stringify(updated));
    setBackupName("");
    setSelectedKeys(new Set());
    showToast(`Ðã t?o backup "${snapshot.name}" v?i ${snapshot.keyCount} keys`);
  };

  const handleCreateBackupByName = (name: string) => {
    const data: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) { const v = localStorage.getItem(k); if (v !== null) data[k] = v; }
    }
    const totalBytes = Object.values(data).reduce((s, v) => s + new Blob([v]).size, 0);
    const snapshot: BackupSnapshot = {
      id: `backup-${Date.now()}`, name,
      createdAt: new Date().toISOString(),
      size: totalBytes, keyCount: Object.keys(data).length, data,
    };
    const updated = [snapshot, ...snapshots];
    setSnapshots(updated);
    localStorage.setItem("kts_admin_backups", JSON.stringify(updated));
  };

  const handleExportJSON = () => {
    const keysToExport = selectedKeys.size > 0 ? [...selectedKeys] : entries.map(e => e.key);
    const data: Record<string, string> = {};
    keysToExport.forEach(k => {
      const val = localStorage.getItem(k);
      if (val !== null) data[k] = val;
    });
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kts-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Ðã xu?t ${keysToExport.length} keys ra file JSON`);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (json.data && typeof json.data === "object") {
          setRestoreFile(ev.target?.result as string);
        } else {
          showToast("File không h?p l?", "error");
        }
      } catch {
        showToast("Không th? d?c file", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleRestoreFromFile = () => {
    if (!restoreFile) return;
    try {
      const json = JSON.parse(restoreFile);
      const data: Record<string, string> = json.data;
      let count = 0;
      Object.entries(data).forEach(([k, v]) => {
        localStorage.setItem(k, v);
        count++;
      });
      refreshEntries();
      setRestoreFile(null);
      showToast(`Ðã restore ${count} keys t? file`);
    } catch {
      showToast("L?i khi restore", "error");
    }
  };

  const handleRestoreSnapshot = (snapshot: BackupSnapshot) => {
    Object.entries(snapshot.data).forEach(([k, v]) => {
      localStorage.setItem(k, v);
    });
    refreshEntries();
    setConfirmRestore(null);
    showToast(`Ðã restore "${snapshot.name}" — ${snapshot.keyCount} keys`);
  };

  const handleDeleteSnapshot = (id: string) => {
    const updated = snapshots.filter(s => s.id !== id);
    setSnapshots(updated);
    localStorage.setItem("kts_admin_backups", JSON.stringify(updated));
    showToast("Ðã xóa backup");
  };

  const handleDeleteKey = (key: string) => {
    localStorage.removeItem(key);
    refreshEntries();
    showToast(`Ðã xóa key: ${key}`);
  };

  const handleDeleteSelected = () => {
    selectedKeys.forEach(k => localStorage.removeItem(k));
    refreshEntries();
    showToast(`Ðã xóa ${selectedKeys.size} keys`);
    setSelectedKeys(new Set());
  };

  return (
    <AdminLayout
      title="Backup & Restore"
      subtitle="Qu?n lý d? li?u localStorage — sao luu và khôi ph?c"
      actions={
        <div className="flex items-center gap-2">
          <button onClick={refreshEntries}
            className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-colors"
            style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
            <i className="ri-refresh-line"></i>Làm m?i
          </button>
          <button onClick={handleExportJSON}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap transition-colors bg-emerald-500 hover:bg-emerald-400 text-white">
            <i className="ri-download-line"></i>Export JSON
          </button>
        </div>
      }
    >
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
          <i className={toast.type === "success" ? "ri-checkbox-circle-line" : "ri-close-circle-line"}></i>
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit mb-6"
        style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
        {([
          { id: "overview", label: "T?ng quan", icon: "ri-dashboard-line" },
          { id: "backup", label: "T?o Backup", icon: "ri-save-line" },
          { id: "restore", label: "Restore", icon: "ri-refresh-line" },
          { id: "compare", label: "So sánh Snapshot", icon: "ri-file-copy-2-line" },
          { id: "schedule", label: "L?ch t? d?ng", icon: "ri-calendar-schedule-line" },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap"
            style={{
              backgroundColor: activeTab === tab.id ? "var(--admin-card)" : "transparent",
              color: activeTab === tab.id ? "var(--admin-text)" : "var(--admin-text-faint)",
              border: activeTab === tab.id ? "1px solid var(--admin-border)" : "1px solid transparent",
            }}>
            <i className={tab.icon}></i>{tab.label}
          </button>
        ))}
      </div>

      {/* -- Overview Tab -- */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "T?ng keys", value: entries.length, color: "#a78bfa", icon: "ri-key-line" },
              { label: "Dung lu?ng", value: formatBytes(totalSize), color: "#34d399", icon: "ri-database-line" },
              { label: "Danh m?c", value: Object.keys(categories).length, color: "app-accent-primary", icon: "ri-folder-line" },
              { label: "Backups dã luu", value: snapshots.length, color: "#fb923c", icon: "ri-save-line" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4 border"
                style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                  </div>
                  <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{s.label}</span>
                </div>
                <p className="text-xl font-bold" style={{ color: "var(--admin-text)" }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--admin-text)" }}>Phân b? theo danh m?c</h3>
            <div className="space-y-3">
              {Object.entries(categories).sort((a, b) => b[1].size - a[1].size).map(([cat, info]) => {
                const pct = totalSize > 0 ? (info.size / totalSize) * 100 : 0;
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${info.color}15` }}>
                      <i className={`${info.icon} text-xs`} style={{ color: info.color }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: "var(--admin-text)" }}>{cat}</span>
                        <span className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                          {info.count} keys · {formatBytes(info.size)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-hover)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: info.color }}></div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold w-10 text-right flex-shrink-0" style={{ color: info.color }}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Keys table */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)" }}>
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-card2)" }}>
              <div className="relative flex-1">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--admin-text-faint)" }}></i>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm key..."
                  className="w-full rounded-lg pl-8 pr-3 py-1.5 text-xs outline-none border"
                  style={{ backgroundColor: "var(--admin-card)", color: "var(--admin-text)", borderColor: "var(--admin-border)" }} />
              </div>
              <div className="flex items-center gap-1 p-0.5 rounded-lg" style={{ backgroundColor: "var(--admin-card)" }}>
                <button onClick={() => setFilterCat("all")}
                  className="px-2 py-1 rounded-md text-[10px] cursor-pointer whitespace-nowrap"
                  style={{ backgroundColor: filterCat === "all" ? "var(--admin-hover)" : "transparent", color: "var(--admin-text-muted)" }}>
                  T?t c?
                </button>
                {Object.entries(categories).map(([cat, info]) => (
                  <button key={cat} onClick={() => setFilterCat(cat)}
                    className="px-2 py-1 rounded-md text-[10px] cursor-pointer whitespace-nowrap"
                    style={{ backgroundColor: filterCat === cat ? `${info.color}15` : "transparent", color: filterCat === cat ? info.color : "var(--admin-text-faint)" }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr style={{ backgroundColor: "var(--admin-card2)", borderBottom: "1px solid var(--admin-border)" }}>
                  <th className="px-4 py-2.5 text-left font-semibold" style={{ color: "var(--admin-text-muted)" }}>Key</th>
                  <th className="px-4 py-2.5 text-left font-semibold" style={{ color: "var(--admin-text-muted)" }}>Danh m?c</th>
                  <th className="px-4 py-2.5 text-left font-semibold" style={{ color: "var(--admin-text-muted)" }}>Kích thu?c</th>
                  <th className="px-4 py-2.5 text-left font-semibold" style={{ color: "var(--admin-text-muted)" }}>Xem tru?c</th>
                  <th className="px-4 py-2.5 text-left font-semibold" style={{ color: "var(--admin-text-muted)" }}>Hành d?ng</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.slice(0, 50).map(entry => {
                  const cat = getCategoryForKey(entry.key);
                  let preview = "";
                  try {
                    const parsed = JSON.parse(entry.value);
                    if (Array.isArray(parsed)) preview = `Array[${parsed.length}]`;
                    else if (typeof parsed === "object") preview = `Object{${Object.keys(parsed).slice(0, 3).join(", ")}...}`;
                    else preview = String(parsed).slice(0, 40);
                  } catch {
                    preview = entry.value.slice(0, 40);
                  }
                  return (
                    <tr key={entry.key} className="border-t" style={{ borderColor: "var(--admin-border)" }}>
                      <td className="px-4 py-2.5">
                        <code className="text-[10px] font-mono" style={{ color: "var(--admin-text)" }}>{entry.key}</code>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: `${cat.color}12`, color: cat.color }}>
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-4 py-2.5" style={{ color: "var(--admin-text-muted)" }}>{formatBytes(entry.size)}</td>
                      <td className="px-4 py-2.5">
                        <span className="text-[10px] font-mono truncate max-w-[200px] block" style={{ color: "var(--admin-text-faint)" }}>{preview}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button onClick={() => handleDeleteKey(entry.key)}
                          className="w-6 h-6 flex items-center justify-center rounded-md cursor-pointer"
                          style={{ backgroundColor: "rgba(248,113,113,0.08)", color: "#f87171" }}
                          title="Xóa key này">
                          <i className="ri-delete-bin-line text-xs"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredEntries.length > 50 && (
              <div className="px-4 py-2 text-center text-[10px]" style={{ color: "var(--admin-text-faint)", borderTop: "1px solid var(--admin-border)" }}>
                Hi?n th? 50/{filteredEntries.length} keys
              </div>
            )}
          </div>
        </div>
      )}

      {/* -- Backup Tab -- */}
      {activeTab === "backup" && (
        <div className="space-y-5">
          {/* Create backup */}
          <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <h3 className="font-semibold text-sm mb-4" style={{ color: "var(--admin-text)" }}>
              <i className="ri-save-line mr-2" style={{ color: "#34d399" }}></i>
              T?o backup m?i
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <input value={backupName} onChange={e => setBackupName(e.target.value)}
                placeholder={`Backup ${new Date().toLocaleDateString("vi-VN")}`}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none border"
                style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
              <button onClick={handleCreateBackup}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
                <i className="ri-save-line"></i>Luu backup
              </button>
            </div>

            {/* Key selector */}
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--admin-border)" }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b"
                style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-card2)" }}>
                <p className="text-xs font-semibold" style={{ color: "var(--admin-text-muted)" }}>
                  Ch?n keys d? backup ({selectedKeys.size > 0 ? `${selectedKeys.size} dã ch?n` : "t?t c?"})
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={selectAll} className="text-[10px] cursor-pointer whitespace-nowrap" style={{ color: "var(--admin-text-muted)" }}>Ch?n t?t c?</button>
                  <span style={{ color: "var(--admin-text-faint)" }}>·</span>
                  <button onClick={deselectAll} className="text-[10px] cursor-pointer whitespace-nowrap" style={{ color: "var(--admin-text-muted)" }}>B? ch?n</button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {entries.map(entry => {
                  const cat = getCategoryForKey(entry.key);
                  const isSelected = selectedKeys.has(entry.key);
                  return (
                    <div key={entry.key}
                      className="flex items-center gap-3 px-4 py-2.5 border-b cursor-pointer transition-colors"
                      style={{
                        borderColor: "var(--admin-border)",
                        backgroundColor: isSelected ? `${cat.color}06` : "transparent",
                      }}
                      onClick={() => toggleKey(entry.key)}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${isSelected ? "border-transparent" : ""}`}
                        style={{
                          backgroundColor: isSelected ? cat.color : "transparent",
                          borderColor: isSelected ? cat.color : "var(--admin-border2)",
                        }}>
                        {isSelected && <i className="ri-check-line text-white text-[10px]"></i>}
                      </div>
                      <code className="text-[10px] font-mono flex-1 truncate" style={{ color: "var(--admin-text)" }}>{entry.key}</code>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: `${cat.color}12`, color: cat.color }}>
                        {entry.category}
                      </span>
                      <span className="text-[10px] flex-shrink-0" style={{ color: "var(--admin-text-faint)" }}>{formatBytes(entry.size)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedKeys.size > 0 && (
              <div className="flex items-center justify-between mt-3 px-3 py-2 rounded-lg"
                style={{ backgroundColor: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <span className="text-xs" style={{ color: "#34d399" }}>
                  <i className="ri-checkbox-circle-line mr-1"></i>
                  {selectedKeys.size} keys du?c ch?n
                </span>
                <button onClick={handleDeleteSelected}
                  className="text-[10px] font-bold cursor-pointer whitespace-nowrap" style={{ color: "#f87171" }}>
                  Xóa các keys dã ch?n
                </button>
              </div>
            )}
          </div>

          {/* Saved backups */}
          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--admin-text)" }}>
              Backups dã luu ({snapshots.length})
            </h3>
            {snapshots.length === 0 ? (
              <div className="text-center py-10 rounded-xl border" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-faint)" }}>
                <i className="ri-save-line text-3xl mb-2 block"></i>
                Chua có backup nào
              </div>
            ) : (
              <div className="space-y-3">
                {snapshots.map(s => (
                  <BackupCard key={s.id} snapshot={s}
                    onRestore={snap => setConfirmRestore(snap)}
                    onDelete={handleDeleteSnapshot} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -- Restore Tab -- */}
      {activeTab === "restore" && (
        <div className="space-y-5">
          {/* Import from file */}
          <div className="rounded-xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--admin-text)" }}>
              <i className="ri-upload-line mr-2" style={{ color: "#a78bfa" }}></i>
              Import t? file JSON
            </h3>
            <p className="text-xs mb-4" style={{ color: "var(--admin-text-muted)" }}>
              Upload file backup JSON dã export tru?c dó d? restore d? li?u
            </p>
            <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors"
              style={{ borderColor: "var(--admin-border2)" }}>
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl" style={{ backgroundColor: "rgba(167,139,250,0.12)" }}>
                <i className="ri-file-upload-line text-2xl" style={{ color: "#a78bfa" }}></i>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>Kéo th? ho?c click d? ch?n file</p>
                <p className="text-xs mt-1" style={{ color: "var(--admin-text-faint)" }}>Ch? h? tr? file .json</p>
              </div>
              <input type="file" accept=".json" className="hidden" onChange={handleImportFile} />
            </label>

            {restoreFile && (
              <div className="mt-4 p-4 rounded-xl border" style={{ backgroundColor: "rgba(52,211,153,0.06)", borderColor: "rgba(52,211,153,0.2)" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="ri-file-check-line text-app-accent-success"></i>
                    <span className="text-sm font-semibold" style={{ color: "var(--admin-text)" }}>File h?p l?</span>
                  </div>
                  <button onClick={() => setRestoreFile(null)} className="text-xs cursor-pointer" style={{ color: "var(--admin-text-faint)" }}>H?y</button>
                </div>
                <p className="text-xs mb-3" style={{ color: "var(--admin-text-muted)" }}>
                  {(() => {
                    try {
                      const d = JSON.parse(restoreFile);
                      return `${Object.keys(d.data).length} keys · Export lúc ${new Date(d.exportedAt).toLocaleString("vi-VN")}`;
                    } catch { return ""; }
                  })()}
                </p>
                <button onClick={handleRestoreFromFile}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
                  <i className="ri-refresh-line mr-2"></i>Restore t? file này
                </button>
              </div>
            )}
          </div>

          {/* Restore from saved backups */}
          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: "var(--admin-text)" }}>
              Restore t? backup dã luu
            </h3>
            {snapshots.length === 0 ? (
              <div className="text-center py-10 rounded-xl border" style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-faint)" }}>
                <i className="ri-save-line text-3xl mb-2 block"></i>
                Chua có backup nào — hãy t?o backup tru?c
              </div>
            ) : (
              <div className="space-y-3">
                {snapshots.map(s => (
                  <BackupCard key={s.id} snapshot={s}
                    onRestore={snap => setConfirmRestore(snap)}
                    onDelete={handleDeleteSnapshot} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -- Compare Tab -- */}
      {activeTab === "compare" && (
        <CompareTab snapshots={snapshots} />
      )}

      {/* Confirm restore modal */}
      {confirmRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border2)" }}>
            <div className="p-6 text-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-2xl mx-auto mb-4 bg-emerald-500/12">
                <i className="ri-refresh-line text-xl text-app-accent-success"></i>
              </div>
              <p className="font-bold text-sm mb-1" style={{ color: "var(--admin-text)" }}>
                Restore &ldquo;{confirmRestore.name}&rdquo;?
              </p>
              <p className="text-xs mb-1" style={{ color: "var(--admin-text-muted)" }}>
                {confirmRestore.keyCount} keys s? du?c ghi dè vào localStorage hi?n t?i.
              </p>
              <p className="text-xs mb-5" style={{ color: "#f87171" }}>
                D? li?u hi?n t?i c?a các keys này s? b? thay th?.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmRestore(null)}
                  className="flex-1 py-2.5 rounded-xl border text-sm cursor-pointer whitespace-nowrap"
                  style={{ borderColor: "var(--admin-border)", color: "var(--admin-text-muted)" }}>
                  H?y
                </button>
                <button onClick={() => handleRestoreSnapshot(confirmRestore)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm cursor-pointer whitespace-nowrap transition-colors">
                  Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "schedule" && (
        <ScheduleTab onCreateBackup={handleCreateBackupByName} snapshots={snapshots} setSnapshots={setSnapshots} />
      )}
    </AdminLayout>
  );
}



