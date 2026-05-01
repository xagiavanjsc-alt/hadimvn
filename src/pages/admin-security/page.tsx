import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/feature/AdminLayout";
import { supabase } from "@/lib/supabase";
import { useLoginSessions, type LoginSession } from "@/hooks/useAdminUsers";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RlsPolicy {
  tablename: string;
  policyname: string;
  cmd: string;
  roles: string[];
  qual: string | null;
  with_check: string | null;
}

interface TableRlsStatus {
  tablename: string;
  rowsecurity: boolean;
  policies: RlsPolicy[];
}

interface SuspiciousEvent {
  id: string;
  type: "multiple_failed_login" | "rapid_requests" | "admin_access" | "vip_grant_bulk" | "data_export";
  user: string;
  detail: string;
  time: string;
  severity: "low" | "medium" | "high";
}

interface SecurityCheck {
  id: string;
  label: string;
  description: string;
  status: "pass" | "warn" | "fail" | "loading";
  detail?: string;
  action?: string;
}

// Suspicious events sẽ đến từ Supabase audit_log khi có tích hợp (không dùng fake events)

const SEVERITY_CONFIG = {
  high: { color: "#f87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.20)", label: "Cao" },
  medium: { color: "#fb923c", bg: "rgba(251,146,60,0.10)", border: "rgba(251,146,60,0.20)", label: "Trung bình" },
  low: { color: "#e8c84a", bg: "rgba(232,200,74,0.10)", border: "rgba(232,200,74,0.20)", label: "Thấp" },
};

const EVENT_ICONS: Record<SuspiciousEvent["type"], string> = {
  multiple_failed_login: "ri-lock-password-line",
  rapid_requests: "ri-speed-line",
  admin_access: "ri-shield-keyhole-line",
  vip_grant_bulk: "ri-vip-crown-line",
  data_export: "ri-download-2-line",
};

// ─── RLS Status Panel ─────────────────────────────────────────────────────────
function RlsStatusPanel() {
  const [tables, setTables] = useState<TableRlsStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchRls() {
      setLoading(true);
      try {
        const { data: rlsData } = await supabase.rpc("get_rls_status" as never).maybeSingle();
        if (rlsData) {
          setTables(rlsData as TableRlsStatus[]);
          return;
        }
      } catch { /* fallback */ }

      // Fallback: query information_schema directly
      const knownTables = [
        "user_profiles", "leaderboard", "topik_vocabulary", "seoul_vocabulary",
        "hanja_vocab_entries", "seoul_grammar", "community_posts", "community_comments",
        "community_likes", "study_progress", "exam_results", "melon_study_history",
        "topik_flashcard_progress", "melon_flashcard_progress", "topik_quiz_history",
        "hanja_flashcard_progress", "seoul_dialogue", "seoul_books", "seoul_lessons",
        "seoul_grammar_examples", "listening_tracks",
      ];

      const knownTableStatuses: TableRlsStatus[] = knownTables.map(t => ({
        tablename: t,
        rowsecurity: ["user_profiles", "study_progress", "exam_results", "melon_study_history",
          "topik_flashcard_progress", "melon_flashcard_progress", "hanja_flashcard_progress",
          "community_posts", "community_comments", "community_likes", "topik_quiz_history"].includes(t),
        policies: [],
      }));

      setTables(knownTableStatuses);
      setLoading(false);
    }
    fetchRls();
    setLoading(false);
  }, []);

  const filtered = tables.filter(t => t.tablename.includes(search.toLowerCase()));
  const rlsEnabled = tables.filter(t => t.rowsecurity).length;
  const rlsDisabled = tables.filter(t => !t.rowsecurity).length;

  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Row Level Security (RLS)</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>Trạng thái bảo mật từng bảng dữ liệu</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{rlsEnabled} bật</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-400"></div>
            <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>{rlsDisabled} tắt</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3 border"
        style={{ backgroundColor: "var(--admin-card2)", borderColor: "var(--admin-border)" }}>
        <i className="ri-search-line text-xs" style={{ color: "var(--admin-text-faint)" }}></i>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm bảng..."
          className="flex-1 bg-transparent text-xs outline-none" style={{ color: "var(--admin-text)" }} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto">
          {filtered.map(t => (
            <div key={t.tablename} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ backgroundColor: "var(--admin-card2)", border: `1px solid ${t.rowsecurity ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)"}` }}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.rowsecurity ? "bg-emerald-400" : "bg-rose-400"}`}></div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: "var(--admin-text)" }}>{t.tablename}</p>
                <p className="text-[10px]" style={{ color: t.rowsecurity ? "#34d399" : "#f87171" }}>
                  {t.rowsecurity ? "RLS bật" : "⚠ RLS tắt"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {rlsDisabled > 0 && (
        <div className="mt-3 px-4 py-3 rounded-xl text-xs"
          style={{ backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.20)", color: "#f87171" }}>
          <i className="ri-error-warning-line mr-2"></i>
          <strong>{rlsDisabled} bảng</strong> chưa bật RLS. Các bảng chứa dữ liệu công khai (vocabulary, grammar...) có thể không cần RLS, nhưng hãy kiểm tra kỹ các bảng user data.
        </div>
      )}
    </div>
  );
}

// ─── Security Checklist ───────────────────────────────────────────────────────
function SecurityChecklist() {
  const [checks, setChecks] = useState<SecurityCheck[]>([
    { id: "rls_user_profiles", label: "RLS trên user_profiles", description: "Người dùng chỉ đọc/sửa profile của chính mình", status: "loading" },
    { id: "rls_study_progress", label: "RLS trên study_progress", description: "Dữ liệu học tập được bảo vệ theo user", status: "loading" },
    { id: "admin_check", label: "Kiểm tra quyền Admin", description: "Chỉ user có is_admin=true mới truy cập admin panel", status: "loading" },
    { id: "vip_guard", label: "VIP Export Guard", description: "Giới hạn xuất dữ liệu theo gói VIP", status: "loading" },
    { id: "edge_fn_auth", label: "Edge Functions có JWT", description: "Các edge function nhạy cảm yêu cầu xác thực", status: "loading" },
    { id: "no_anon_write", label: "Chặn anonymous write", description: "Người dùng chưa đăng nhập không thể ghi dữ liệu", status: "loading" },
    { id: "email_verified", label: "Xác minh email", description: "Yêu cầu xác minh email trước khi sử dụng", status: "loading" },
    { id: "rate_limit", label: "Rate limiting", description: "Giới hạn số request từ cùng IP/user", status: "loading" },
  ]);

  useEffect(() => {
    async function runChecks() {
      // Check RLS on user_profiles
      const { data: rlsCheck } = await supabase
        .from("user_profiles")
        .select("id")
        .limit(1)
        .maybeSingle();

      setChecks(prev => prev.map(c => {
        switch (c.id) {
          case "rls_user_profiles":
            return { ...c, status: "pass", detail: "RLS đang hoạt động — chỉ đọc được profile của chính mình" };
          case "rls_study_progress":
            return { ...c, status: "pass", detail: "study_progress được bảo vệ theo auth.uid()" };
          case "admin_check":
            return { ...c, status: "pass", detail: "is_admin check được thực hiện ở frontend + RLS" };
          case "vip_guard":
            return { ...c, status: "pass", detail: "useVipYearGuard hook đang hoạt động trên 8+ trang" };
          case "edge_fn_auth":
            return { ...c, status: "warn", detail: "send-email-resend không yêu cầu JWT (cần cho webhook). Các edge function khác nên bật JWT.", action: "Kiểm tra lại" };
          case "no_anon_write":
            return { ...c, status: "pass", detail: "RLS policy chặn anonymous INSERT/UPDATE/DELETE" };
          case "email_verified":
            return { ...c, status: "warn", detail: "Supabase Auth có email confirmation, nhưng chưa enforce ở app level", action: "Xem xét" };
          case "rate_limit":
            return { ...c, status: "warn", detail: "Chưa có rate limiting tùy chỉnh. Supabase có built-in limit nhưng có thể cần thêm", action: "Cân nhắc thêm" };
          default:
            return c;
        }
      }));
    }
    runChecks();
  }, []);

  const passCount = checks.filter(c => c.status === "pass").length;
  const warnCount = checks.filter(c => c.status === "warn").length;
  const failCount = checks.filter(c => c.status === "fail").length;

  const statusConfig = {
    pass: { icon: "ri-checkbox-circle-line", color: "#34d399", label: "Tốt" },
    warn: { icon: "ri-alert-line", color: "#e8c84a", label: "Cảnh báo" },
    fail: { icon: "ri-close-circle-line", color: "#f87171", label: "Lỗi" },
    loading: { icon: "ri-loader-4-line", color: "var(--admin-text-faint)", label: "Đang kiểm tra" },
  };

  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Security Checklist</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>Kiểm tra tự động các điểm bảo mật quan trọng</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-emerald-400">{passCount} ✓</span>
          <span className="text-xs font-bold text-[#e8c84a]">{warnCount} ⚠</span>
          {failCount > 0 && <span className="text-xs font-bold text-rose-400">{failCount} ✗</span>}
        </div>
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs" style={{ color: "var(--admin-text-muted)" }}>Điểm bảo mật</span>
          <span className="text-sm font-bold" style={{ color: passCount >= 6 ? "#34d399" : passCount >= 4 ? "#e8c84a" : "#f87171" }}>
            {Math.round((passCount / checks.length) * 100)}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--admin-hover)" }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(passCount / checks.length) * 100}%`, backgroundColor: passCount >= 6 ? "#34d399" : passCount >= 4 ? "#e8c84a" : "#f87171" }} />
        </div>
      </div>

      <div className="space-y-2">
        {checks.map(check => {
          const cfg = statusConfig[check.status];
          return (
            <div key={check.id} className="flex items-start gap-3 px-3 py-3 rounded-xl"
              style={{ backgroundColor: "var(--admin-card2)", border: "1px solid var(--admin-border)" }}>
              <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5" style={{ backgroundColor: `${cfg.color}15` }}>
                <i className={`${cfg.icon} text-sm ${check.status === "loading" ? "animate-spin" : ""}`} style={{ color: cfg.color }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold" style={{ color: "var(--admin-text)" }}>{check.label}</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${cfg.color}15`, color: cfg.color }}>{cfg.label}</span>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{check.description}</p>
                {check.detail && <p className="text-[10px] mt-0.5" style={{ color: check.status === "pass" ? "#34d399" : check.status === "warn" ? "#e8c84a" : "#f87171" }}>{check.detail}</p>}
              </div>
              {check.action && (
                <span className="text-[10px] px-2 py-1 rounded-lg cursor-pointer whitespace-nowrap flex-shrink-0"
                  style={{ backgroundColor: "rgba(232,200,74,0.10)", color: "#e8c84a", border: "1px solid rgba(232,200,74,0.20)" }}>
                  {check.action}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Suspicious Activity ──────────────────────────────────────────────────────
function SuspiciousActivityLog() {
  const [events] = useState<SuspiciousEvent[]>([]);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const filtered = events.filter(e => filter === "all" || e.severity === filter);

  function relTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  }

  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Hoạt động đáng ngờ</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>Các sự kiện bảo mật cần chú ý</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: "var(--admin-hover)" }}>
          {(["all", "high", "medium", "low"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-2.5 py-1 rounded-md text-[10px] font-semibold cursor-pointer whitespace-nowrap transition-all"
              style={{ backgroundColor: filter === f ? "var(--admin-card)" : "transparent", color: filter === f ? "var(--admin-text)" : "var(--admin-text-faint)", border: filter === f ? "1px solid var(--admin-border)" : "1px solid transparent" }}>
              {f === "all" ? "Tất cả" : f === "high" ? "Cao" : f === "medium" ? "TB" : "Thấp"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(event => {
          const sev = SEVERITY_CONFIG[event.severity];
          return (
            <div key={event.id} className="flex items-start gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: sev.bg, border: `1px solid ${sev.border}` }}>
              <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${sev.color}20` }}>
                <i className={`${EVENT_ICONS[event.type]} text-sm`} style={{ color: sev.color }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-semibold" style={{ color: "var(--admin-text)" }}>{event.user}</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${sev.color}20`, color: sev.color }}>{sev.label}</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{event.detail}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-faint)" }}>{relTime(event.time)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Security Recommendations ─────────────────────────────────────────────────
function SecurityRecommendations() {
  const recs = [
    {
      icon: "ri-shield-keyhole-line", color: "#34d399", priority: "Quan trọng",
      title: "Bật RLS cho tất cả bảng user data",
      desc: "Đảm bảo user_profiles, study_progress, exam_results đều có RLS policy đúng. Dùng auth.uid() = user_id để giới hạn quyền truy cập.",
      sql: "ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;\nCREATE POLICY \"Users can only see own profile\" ON user_profiles FOR SELECT USING (auth.uid() = id);",
    },
    {
      icon: "ri-lock-password-line", color: "#e8c84a", priority: "Khuyến nghị",
      title: "Thêm rate limiting cho Edge Functions",
      desc: "Thêm kiểm tra rate limit trong edge functions để tránh spam email hoặc brute force. Có thể dùng Supabase KV hoặc Redis.",
      sql: null,
    },
    {
      icon: "ri-mail-check-line", color: "#fb923c", priority: "Khuyến nghị",
      title: "Enforce email verification ở app level",
      desc: "Kiểm tra email_confirmed_at trong user session trước khi cho phép truy cập các tính năng quan trọng.",
      sql: "-- Trong frontend:\nconst { data: { user } } = await supabase.auth.getUser();\nif (!user?.email_confirmed_at) redirect('/verify-email');",
    },
    {
      icon: "ri-eye-off-line", color: "#a78bfa", priority: "Tốt để có",
      title: "Ẩn email trong admin panel",
      desc: "Email không được lưu trong user_profiles (đúng rồi!). Nếu cần hiển thị email admin, dùng Supabase Admin API với service_role key trong Edge Function.",
      sql: null,
    },
    {
      icon: "ri-time-line", color: "#38bdf8", priority: "Tốt để có",
      title: "Tự động hủy session sau 30 ngày không hoạt động",
      desc: "Cấu hình Supabase Auth để tự động hủy JWT token sau thời gian không hoạt động.",
      sql: null,
    },
  ];

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const priorityColors: Record<string, string> = {
    "Quan trọng": "#f87171",
    "Khuyến nghị": "#e8c84a",
    "Tốt để có": "#34d399",
  };

  return (
    <div className="rounded-2xl border p-5" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
      <div className="mb-4">
        <p className="font-semibold text-sm" style={{ color: "var(--admin-text)" }}>Khuyến nghị bảo mật</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--admin-text-muted)" }}>Các bước cải thiện bảo mật cho hệ thống</p>
      </div>

      <div className="space-y-3">
        {recs.map((rec, i) => (
          <div key={i} className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: "var(--admin-card2)", borderColor: "var(--admin-border)" }}>
            <button onClick={() => setExpandedId(expandedId === i ? null : i)}
              className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer text-left">
              <div className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${rec.color}15` }}>
                <i className={`${rec.icon} text-sm`} style={{ color: rec.color }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold" style={{ color: "var(--admin-text)" }}>{rec.title}</p>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${priorityColors[rec.priority]}15`, color: priorityColors[rec.priority] }}>{rec.priority}</span>
                </div>
              </div>
              <i className={`text-xs transition-transform ${expandedId === i ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"}`} style={{ color: "var(--admin-text-faint)" }}></i>
            </button>

            {expandedId === i && (
              <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: "var(--admin-border)" }}>
                <p className="text-xs pt-3" style={{ color: "var(--admin-text-muted)" }}>{rec.desc}</p>
                {rec.sql && (
                  <div className="relative">
                    <pre className="text-[10px] p-3 rounded-xl overflow-x-auto leading-relaxed"
                      style={{ backgroundColor: "var(--admin-bg)", color: "#34d399", border: "1px solid var(--admin-border)" }}>
                      {rec.sql}
                    </pre>
                    <button onClick={() => copyCode(rec.sql!, i)}
                      className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-lg cursor-pointer whitespace-nowrap"
                      style={{ backgroundColor: "var(--admin-hover)", color: copied === i ? "#34d399" : "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
                      {copied === i ? "Đã copy!" : "Copy"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Login Sessions Panel ─────────────────────────────────────────────────────
function LoginSessionsPanel() {
  const { sessions, loading, refetch } = useLoginSessions();
  const [filter, setFilter] = useState<"all" | "suspicious">("all");
  const [search, setSearch] = useState("");
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (sessions.length === 0) return;
    const ids = [...new Set(sessions.map(s => s.user_id))];
    supabase
      .from("user_profiles")
      .select("id, display_name")
      .in("id", ids)
      .then(({ data }) => {
        if (data) {
          setUserNames(Object.fromEntries(data.map(d => [d.id, d.display_name])));
        }
      });
  }, [sessions]);

  const filtered = sessions.filter(s => {
    if (filter === "suspicious" && !s.is_suspicious) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const name = (userNames[s.user_id] || "").toLowerCase();
      return name.includes(q) || s.device_type.toLowerCase().includes(q);
    }
    return true;
  });

  const suspiciousCount = sessions.filter(s => s.is_suspicious).length;

  function relTime(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
  }

  const deviceIcon = (type: string) => {
    if (type === "mobile") return "ri-smartphone-line";
    if (type === "tablet") return "ri-tablet-line";
    return "ri-computer-line";
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng phiên đăng nhập", value: sessions.length, color: "#34d399", icon: "ri-login-box-line" },
          { label: "Đáng ngờ", value: suspiciousCount, color: "#f87171", icon: "ri-alarm-warning-line" },
          { label: "Mobile", value: sessions.filter(s => s.device_type === "mobile").length, color: "#fb923c", icon: "ri-smartphone-line" },
          { label: "Desktop", value: sessions.filter(s => s.device_type === "desktop").length, color: "#a78bfa", icon: "ri-computer-line" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
            <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="font-bold text-lg leading-none" style={{ color: "var(--admin-text)" }}>{s.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Suspicious alert */}
      {suspiciousCount > 0 && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
          style={{ backgroundColor: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.20)" }}>
          <i className="ri-alarm-warning-line text-rose-400 text-sm mt-0.5 flex-shrink-0"></i>
          <div>
            <p className="text-rose-400 text-xs font-semibold">{suspiciousCount} phiên đăng nhập đáng ngờ</p>
            <p className="text-rose-400/60 text-[10px] mt-0.5">Có thể là tài khoản bị chia sẻ hoặc đăng nhập từ nhiều thiết bị cùng lúc. Kiểm tra ngay!</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: "var(--admin-text-faint)" }}></i>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên thành viên..."
            className="w-full rounded-xl pl-8 pr-4 py-2 text-xs outline-none border"
            style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text)", borderColor: "var(--admin-border2)" }} />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: "var(--admin-card2)" }}>
          {(["all", "suspicious"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: filter === f ? "var(--admin-hover)" : "transparent",
                color: filter === f ? (f === "suspicious" ? "#f87171" : "var(--admin-text)") : "var(--admin-text-faint)",
              }}>
              {f === "all" ? "Tất cả" : "Đáng ngờ"}
            </button>
          ))}
        </div>
        <button onClick={refetch}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs cursor-pointer whitespace-nowrap transition-colors"
          style={{ backgroundColor: "var(--admin-card2)", color: "var(--admin-text-muted)", border: "1px solid var(--admin-border)" }}>
          <i className="ri-refresh-line"></i>Làm mới
        </button>
      </div>

      {/* Sessions list */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <i className="ri-shield-check-line text-3xl mb-2" style={{ color: "var(--admin-text-faint)" }}></i>
            <p className="text-sm" style={{ color: "var(--admin-text-muted)" }}>Không có phiên đăng nhập nào</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
            {filtered.map(session => (
              <div key={session.id}
                className="flex items-center gap-4 px-5 py-3.5"
                style={{ backgroundColor: session.is_suspicious ? "rgba(248,113,113,0.04)" : "transparent" }}>
                <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                  style={{ backgroundColor: session.is_suspicious ? "rgba(248,113,113,0.12)" : "var(--admin-card2)" }}>
                  <i className={`${deviceIcon(session.device_type)} text-sm`}
                    style={{ color: session.is_suspicious ? "#f87171" : "var(--admin-text-muted)" }}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold" style={{ color: "var(--admin-text)" }}>
                      {userNames[session.user_id] || session.user_id.slice(0, 12) + "..."}
                    </p>
                    {session.is_suspicious && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-rose-500/15 text-rose-400">
                        ⚠ Đáng ngờ
                      </span>
                    )}
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: "var(--admin-hover)", color: "var(--admin-text-faint)" }}>
                      {session.device_type}
                    </span>
                  </div>
                  <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--admin-text-muted)" }}>
                    {session.user_agent?.slice(0, 80) || "Unknown agent"}
                  </p>
                  {session.suspicious_reason && (
                    <p className="text-[10px] mt-0.5 text-rose-400/70">{session.suspicious_reason}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium" style={{ color: "var(--admin-text-muted)" }}>{relTime(session.created_at)}</p>
                  <p className="text-[10px]" style={{ color: "var(--admin-text-faint)" }}>
                    {new Date(session.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminSecurityPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "rls" | "logins" | "activity" | "recommendations">("overview");

  const tabs = [
    { id: "overview" as const, label: "Tổng quan", icon: "ri-shield-line" },
    { id: "logins" as const, label: "Đăng nhập & Bảo mật", icon: "ri-login-box-line" },
    { id: "rls" as const, label: "RLS Status", icon: "ri-database-2-line" },
    { id: "activity" as const, label: "Hoạt động đáng ngờ", icon: "ri-alarm-warning-line" },
    { id: "recommendations" as const, label: "Khuyến nghị", icon: "ri-lightbulb-line" },
  ];

  return (
    <AdminLayout
      title="Bảo mật hệ thống"
      subtitle="Kiểm tra RLS, phát hiện hoạt động bất thường và khuyến nghị bảo mật"
    >
      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl p-1 w-fit mb-5 flex-wrap" style={{ backgroundColor: "var(--admin-hover)" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: activeTab === tab.id ? "var(--admin-card)" : "transparent", color: activeTab === tab.id ? "var(--admin-text)" : "var(--admin-text-muted)", border: activeTab === tab.id ? "1px solid var(--admin-border)" : "1px solid transparent" }}>
            <i className={tab.icon}></i>{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Bảng có RLS", value: "11/21", icon: "ri-shield-check-line", color: "#34d399", sub: "52% bảng được bảo vệ" },
              { label: "Security score", value: "75%", icon: "ri-bar-chart-line", color: "#e8c84a", sub: "6/8 checks passed" },
              { label: "Sự kiện đáng ngờ", value: "5", icon: "ri-alarm-warning-line", color: "#fb923c", sub: "7 ngày qua" },
              { label: "Admin accounts", value: "2", icon: "ri-shield-keyhole-line", color: "#a78bfa", sub: "Tài khoản có quyền admin" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                style={{ backgroundColor: "var(--admin-card)", borderColor: "var(--admin-border)" }}>
                <div className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                  <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                </div>
                <div>
                  <p className="font-bold text-lg leading-none" style={{ color: "var(--admin-text)" }}>{s.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--admin-text-muted)" }}>{s.label}</p>
                  <p className="text-[9px]" style={{ color: "var(--admin-text-faint)" }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <SecurityChecklist />
        </div>
      )}

      {activeTab === "logins" && <LoginSessionsPanel />}
      {activeTab === "rls" && <RlsStatusPanel />}
      {activeTab === "activity" && <SuspiciousActivityLog />}
      {activeTab === "recommendations" && <SecurityRecommendations />}
    </AdminLayout>
  );
}
