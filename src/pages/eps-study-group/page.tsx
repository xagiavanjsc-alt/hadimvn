import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ─── Group Notification Types ─────────────────────────────────────────────────
interface GroupNotification {
  id: string;
  groupId: string;
  memberName: string;
  memberAvatar: string;
  type: "exam_done" | "streak" | "joined" | "top_score";
  message: string;
  score?: number;
  timestamp: number;
  read: boolean;
}

// ─── Notification Bell Component ─────────────────────────────────────────────
function GroupNotificationPanel({
  notifications,
  onMarkRead,
  onClear,
}: {
  notifications: GroupNotification[];
  onMarkRead: (id: string) => void;
  onClear: () => void;
}) {
  const unread = notifications.filter(n => !n.read).length;
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const typeConfig = {
    exam_done: { icon: "ri-file-list-3-line", color: "#e8c84a" },
    streak: { icon: "ri-fire-line", color: "#ea580c" },
    joined: { icon: "ri-user-add-line", color: "#10b981" },
    top_score: { icon: "ri-trophy-line", color: "#d97706" },
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen(v => !v); notifications.filter(n => !n.read).forEach(n => onMarkRead(n.id)); }}
        className="relative flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
      >
        <i className="ri-notification-3-line"></i>
        <span className="hidden sm:inline">Thông báo</span>
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-gray-700 font-semibold text-sm">Thông báo nhóm</p>
            {notifications.length > 0 && (
              <button onClick={onClear} className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer">Xóa tất cả</button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <i className="ri-notification-off-line text-gray-300 text-3xl block mb-2"></i>
                <p className="text-gray-400 text-sm">Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.slice(0, 20).map(notif => {
                const cfg = typeConfig[notif.type];
                const timeAgo = Math.floor((Date.now() - notif.timestamp) / 60000);
                const timeStr = timeAgo < 1 ? "Vừa xong" : timeAgo < 60 ? `${timeAgo} phút trước` : `${Math.floor(timeAgo / 60)} giờ trước`;
                return (
                  <div key={notif.id} className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.read ? "bg-amber-50/50" : ""}`}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>
                      {notif.memberAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-xs leading-relaxed">{notif.message}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">{timeStr}</p>
                    </div>
                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                      <i className={`${cfg.icon} text-sm`} style={{ color: cfg.color }}></i>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  lastActive: string;
  isOwner?: boolean;
}

interface StudyGroup {
  id: string;
  name: string;
  code: string;
  description: string;
  members: GroupMember[];
  createdAt: string;
  weeklyGoal: number;
  examType: string;
}

// Groups stored in localStorage (no mock data)

const AVATAR_COLORS = ["#e8c84a", "#34d399", "#06b6d4", "#a78bfa", "#f87171", "#fb923c", "#ec4899", "#84cc16"];

// ─── Group Card ───────────────────────────────────────────────────────────────
interface GroupCardProps {
  group: StudyGroup;
  onJoin: (group: StudyGroup) => void;
  onView: (group: StudyGroup) => void;
  isJoined: boolean;
}

function GroupCard({ group, onJoin, onView, isJoined }: GroupCardProps) {
  const topMember = [...group.members].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-gray-800 font-bold text-base truncate">{group.name}</h3>
            {isJoined && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-bold flex-shrink-0">Đã tham gia</span>
            )}
          </div>
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{group.description}</p>
        </div>
        <div className="ml-3 flex-shrink-0 text-center">
          <div className="bg-gray-100 rounded-xl px-3 py-2">
            <p className="text-gray-700 font-mono font-bold text-sm">{group.code}</p>
            <p className="text-gray-400 text-[10px]">Mã nhóm</p>
          </div>
        </div>
      </div>

      {/* Members avatars */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2">
          {group.members.slice(0, 5).map((m, i) => (
            <div
              key={m.id}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white"
              style={{ backgroundColor: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}30`, color: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
            >
              {m.avatar}
            </div>
          ))}
          {group.members.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 border-2 border-white">
              +{group.members.length - 5}
            </div>
          )}
        </div>
        <span className="text-gray-400 text-xs">{group.members.length} thành viên</span>
        <span className="text-gray-300">·</span>
        <span className="text-gray-400 text-xs flex items-center gap-1">
          <i className="ri-trophy-line text-[#e8c84a] text-[10px]"></i>
          Top: {topMember.name.split(" ").pop()} ({topMember.score}%)
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
          <i className="ri-timer-line text-[#e8c84a] text-[10px]"></i>
          {group.examType}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
          <i className="ri-focus-3-line text-emerald-500 text-[10px]"></i>
          Mục tiêu: {group.weeklyGoal} lần/tuần
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(group)}
          className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
        >
          Xem chi tiết
        </button>
        {!isJoined ? (
          <button
            onClick={() => onJoin(group)}
            className="flex-1 py-2.5 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
          >
            Tham gia
          </button>
        ) : (
          <button
            onClick={() => onView(group)}
            className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            Vào nhóm
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Group Detail ─────────────────────────────────────────────────────────────
interface GroupDetailProps {
  group: StudyGroup;
  onBack: () => void;
  myName: string;
}

function GroupDetail({ group, onBack, myName }: GroupDetailProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"leaderboard" | "activity">("leaderboard");
  const [showSendNotif, setShowSendNotif] = useState(false);
  const [sentNotifs, setSentNotifs] = useLocalStorage<GroupNotification[]>("kts_group_notifications", []);

  const handleSendNotif = (notif: GroupNotification) => {
    setSentNotifs(prev => [notif, ...prev].slice(0, 50));
  };

  const sorted = [...group.members].sort((a, b) => b.score - a.score);

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-5 cursor-pointer">
        <i className="ri-arrow-left-line"></i>
        Về danh sách nhóm
      </button>

      {/* Group header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-gray-800 font-bold text-lg">{group.name}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{group.description}</p>
          </div>
          <div className="bg-[#e8c84a]/10 border border-[#e8c84a]/20 rounded-xl px-3 py-2 text-center flex-shrink-0 ml-3">
            <p className="text-[#e8c84a] font-mono font-bold text-sm">{group.code}</p>
            <p className="text-gray-400 text-[10px]">Mã nhóm</p>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-gray-500 text-xs flex items-center gap-1">
            <i className="ri-group-line text-[#e8c84a]"></i>
            {group.members.length} thành viên
          </span>
          <span className="text-gray-500 text-xs flex items-center gap-1">
            <i className="ri-focus-3-line text-emerald-500"></i>
            Mục tiêu {group.weeklyGoal} lần/tuần
          </span>
          <span className="text-gray-500 text-xs flex items-center gap-1">
            <i className="ri-timer-line text-[#06b6d4]"></i>
            {group.examType}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 w-fit">
        {[
          { key: "leaderboard", label: "Bảng xếp hạng" },
          { key: "activity", label: "Hoạt động" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
              tab === t.key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "leaderboard" && (
        <div className="space-y-2">
          {sorted.map((member, i) => {
            const isMe = member.name === myName;
            const avatarColor = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <div
                key={member.id}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                  isMe ? "bg-[#e8c84a]/5 border-[#e8c84a]/20" : "bg-white border-gray-200"
                }`}
              >
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                  {i === 0 ? <span className="text-xl">👑</span> :
                   i === 1 ? <span className="text-xl">🥈</span> :
                   i === 2 ? <span className="text-xl">🥉</span> :
                   <span className="text-gray-400 text-sm font-bold">{i + 1}</span>}
                </div>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: `${avatarColor}20`, color: avatarColor }}
                >
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${isMe ? "text-[#e8c84a]" : "text-gray-700"}`}>
                      {member.name}
                      {isMe && <span className="ml-1 text-[10px] text-[#e8c84a]/60">(Bạn)</span>}
                    </p>
                    {member.isOwner && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Trưởng nhóm</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      <i className="ri-fire-line text-orange-400 text-[10px]"></i>
                      {member.streak} ngày
                    </span>
                    <span className="text-gray-300 text-xs">·</span>
                    <span className="text-gray-400 text-xs">{member.lastActive}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#e8c84a] rounded-full" style={{ width: `${member.score}%` }} />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-10 text-right">{member.score}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "activity" && (
        <div className="space-y-3">
          {[
            { member: sorted[0], action: "đạt điểm cao nhất tuần này", score: sorted[0].score, time: "2 giờ trước", icon: "ri-trophy-line", color: "#e8c84a" },
            { member: sorted[1], action: "hoàn thành bài thi EPS 40 câu", score: sorted[1].score, time: "5 giờ trước", icon: "ri-file-list-3-line", color: "#06b6d4" },
            { member: sorted[2], action: "duy trì streak 8 ngày", score: null, time: "Hôm qua", icon: "ri-fire-line", color: "#fb923c" },
            { member: sorted[0], action: "ôn tập câu sai thông minh", score: null, time: "Hôm qua", icon: "ri-brain-line", color: "#a78bfa" },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ backgroundColor: `${AVATAR_COLORS[i % AVATAR_COLORS.length]}20`, color: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                {item.member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold">{item.member.name.split(" ").pop()}</span>
                  {" "}{item.action}
                  {item.score && <span className="text-[#e8c84a] font-bold"> ({item.score}%)</span>}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">{item.time}</p>
              </div>
              <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                <i className={`${item.icon} text-sm`} style={{ color: item.color }}></i>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/eps-mock-exam")}
          className="flex items-center justify-center gap-2 py-3 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap"
        >
          <i className="ri-play-fill"></i>
          Thi để cạnh tranh
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(group.code)}
          className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap"
        >
          <i className="ri-share-line"></i>
          Chia sẻ mã nhóm
        </button>
      </div>

      {/* Send notification button */}
      <div className="mt-3">
        <button
          onClick={() => setShowSendNotif(true)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-megaphone-line text-[#e8c84a]"></i>
          Gửi thông báo cho cả nhóm
        </button>
      </div>

      {showSendNotif && (
        <SendNotifModal
          group={group}
          myName={myName}
          onClose={() => setShowSendNotif(false)}
          onSend={handleSendNotif}
        />
      )}
    </div>
  );
}

// ─── Send Group Notification Modal ───────────────────────────────────────────
interface SendNotifModalProps {
  group: StudyGroup;
  myName: string;
  onClose: () => void;
  onSend: (notif: GroupNotification) => void;
}

function SendNotifModal({ group, myName, onClose, onSend }: SendNotifModalProps) {
  const [type, setType] = useState<GroupNotification["type"]>("exam_done");
  const [customMsg, setCustomMsg] = useState("");
  const [sent, setSent] = useState(false);

  const TEMPLATES = [
    { type: "exam_done" as const, icon: "ri-file-list-3-line", color: "#e8c84a", label: "Vừa thi xong", placeholder: "VD: Vừa đạt 85% trong bài thi EPS! 🎯" },
    { type: "streak" as const, icon: "ri-fire-line", color: "#ea580c", label: "Streak mới", placeholder: "VD: Đã học 15 ngày liên tiếp! 🔥" },
    { type: "top_score" as const, icon: "ri-trophy-line", color: "#d97706", label: "Điểm cao mới", placeholder: "VD: Phá kỷ lục cá nhân với 92%! 🏆" },
    { type: "joined" as const, icon: "ri-megaphone-line", color: "#10b981", label: "Nhắc nhở nhóm", placeholder: "VD: Nhớ ôn bài hôm nay nhé mọi người! 💪" },
  ];

  const selected = TEMPLATES.find(t => t.type === type)!;

  const handleSend = () => {
    const msg = customMsg.trim() || selected.placeholder;
    const notif: GroupNotification = {
      id: `manual_${Date.now()}`,
      groupId: group.id,
      memberName: myName,
      memberAvatar: myName[0]?.toUpperCase() || "B",
      type,
      message: `${myName}: ${msg}`,
      timestamp: Date.now(),
      read: false,
    };
    onSend(notif);
    setSent(true);
    setTimeout(() => { setSent(false); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-gray-800 font-bold text-lg">Gửi thông báo nhóm</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
              <i className="ri-check-line text-emerald-500 text-2xl"></i>
            </div>
            <p className="text-gray-700 font-semibold">Đã gửi thông báo!</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-gray-600 text-xs font-medium mb-2">Loại thông báo</p>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.type}
                    onClick={() => setType(t.type)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${type === t.type ? "border-[#e8c84a]/40 bg-[#e8c84a]/5 text-gray-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                  >
                    <i className={`${t.icon} text-base`} style={{ color: t.color }}></i>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-gray-600 text-xs font-medium mb-1.5">Nội dung thông báo</p>
              <textarea
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
                placeholder={selected.placeholder}
                rows={3}
                maxLength={200}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm focus:outline-none focus:border-[#e8c84a]/50 resize-none"
              />
              <p className="text-gray-400 text-xs mt-1 text-right">{customMsg.length}/200</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-4">
              <p className="text-gray-400 text-xs mb-1">Xem trước:</p>
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 flex-shrink-0">
                  {myName[0]?.toUpperCase() || "B"}
                </div>
                <p className="text-gray-600 text-xs leading-relaxed">
                  <span className="font-semibold">{myName}:</span> {customMsg.trim() || selected.placeholder}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap">Hủy</button>
              <button
                onClick={handleSend}
                className="flex-1 py-3 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap"
              >
                <i className="ri-send-plane-line mr-1.5"></i>
                Gửi thông báo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Create Group Modal ───────────────────────────────────────────────────────
interface CreateGroupModalProps {
  onClose: () => void;
  onCreate: (group: StudyGroup) => void;
  myName: string;
  myId: string;
}

function CreateGroupModal({ onClose, onCreate, myName, myId }: CreateGroupModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [examType, setExamType] = useState("EPS-TOPIK 40 câu");

  const handleCreate = () => {
    if (!name.trim()) return;
    const code = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) + Math.floor(Math.random() * 100);
    const group: StudyGroup = {
      id: `g_${Date.now()}`,
      name: name.trim(),
      code,
      description: description.trim() || "Nhóm học EPS-TOPIK",
      members: [{
        id: myId,
        name: myName,
        avatar: myName[0]?.toUpperCase() || "B",
        score: 0,
        streak: 0,
        lastActive: "Hôm nay",
        isOwner: true,
      }],
      createdAt: new Date().toISOString(),
      weeklyGoal,
      examType,
    };
    onCreate(group);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-gray-800 font-bold text-lg">Tạo nhóm học mới</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-gray-600 text-xs font-medium mb-1.5 block">Tên nhóm *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="VD: Nhóm EPS Hà Nội 2026"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm focus:outline-none focus:border-[#e8c84a]/50 focus:bg-white transition-colors"
              maxLength={50}
            />
          </div>
          <div>
            <label className="text-gray-600 text-xs font-medium mb-1.5 block">Mô tả nhóm</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mục tiêu, lịch học, yêu cầu thành viên..."
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm focus:outline-none focus:border-[#e8c84a]/50 focus:bg-white transition-colors resize-none"
              maxLength={200}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 text-xs font-medium mb-1.5 block">Mục tiêu thi/tuần</label>
              <select
                value={weeklyGoal}
                onChange={e => setWeeklyGoal(Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-gray-700 text-sm focus:outline-none cursor-pointer"
              >
                {[1, 2, 3, 5, 7].map(n => <option key={n} value={n}>{n} lần/tuần</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-600 text-xs font-medium mb-1.5 block">Loại thi</label>
              <select
                value={examType}
                onChange={e => setExamType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-gray-700 text-sm focus:outline-none cursor-pointer"
              >
                <option>EPS-TOPIK 40 câu</option>
                <option>Thi theo chủ đề</option>
                <option>Thi mô phỏng thật</option>
                <option>Ôn tập nhanh</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap">
            Hủy
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="flex-1 py-3 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            Tạo nhóm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Join Group Modal ─────────────────────────────────────────────────────────
function JoinGroupModal({ onClose, onJoin, groups }: { onClose: () => void; onJoin: (code: string) => void; groups: StudyGroup[] }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleJoin = () => {
    const found = groups.find(g => g.code.toUpperCase() === code.toUpperCase().trim());
    if (!found) {
      setError("Không tìm thấy nhóm với mã này. Kiểm tra lại mã nhóm.");
      return;
    }
    onJoin(code.toUpperCase().trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-gray-800 font-bold text-lg">Tham gia nhóm</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="mb-4">
          <label className="text-gray-600 text-xs font-medium mb-1.5 block">Nhập mã nhóm</label>
          <input
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(""); }}
            placeholder="VD: HN2026"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 text-sm font-mono focus:outline-none focus:border-[#e8c84a]/50 "
            maxLength={10}
          />
          {error && <p className="text-rose-500 text-xs mt-1.5">{error}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap">Hủy</button>
          <button onClick={handleJoin} disabled={!code.trim()} className="flex-1 py-3 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap disabled:opacity-50">
            Tham gia
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function EpsStudyGroupPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [groups, setGroups] = useLocalStorage<StudyGroup[]>("kts_eps_groups", []);
  const [joinedIds, setJoinedIds] = useLocalStorage<string[]>("kts_eps_joined_groups", []);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [search, setSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [notifications, setNotifications] = useLocalStorage<GroupNotification[]>("kts_group_notifications", []);
  const [liveToast, setLiveToast] = useState<GroupNotification | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Notifications sẽ được thêm thật khi có Supabase Realtime (không còn fake events)

  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearNotifications = () => setNotifications([]);

  const myName = profile?.display_name || user?.email?.split("@")[0] || "Bạn";
  const myId = user?.id || "guest";

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleCreate = useCallback((group: StudyGroup) => {
    setGroups(prev => [group, ...prev]);
    setJoinedIds(prev => [...prev, group.id]);
    setShowCreate(false);
    setSelectedGroup(group);
    showSuccess(`Đã tạo nhóm "${group.name}" — Mã: ${group.code}`);
  }, [setGroups, setJoinedIds]);

  const handleJoinByCode = useCallback((code: string) => {
    const group = groups.find(g => g.code === code);
    if (!group) return;
    setJoinedIds(prev => [...prev, group.id]);
    setShowJoin(false);
    setSelectedGroup(group);
    showSuccess(`Đã tham gia nhóm "${group.name}"!`);
  }, [groups, setJoinedIds]);

  const handleJoinGroup = useCallback((group: StudyGroup) => {
    setJoinedIds(prev => [...prev, group.id]);
    showSuccess(`Đã tham gia nhóm "${group.name}"!`);
  }, [setJoinedIds]);

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.code.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedGroup) {
    return (
      <DashboardLayout title="Chi tiết nhóm học">
        <GroupDetail
          group={selectedGroup}
          onBack={() => setSelectedGroup(null)}
          myName={myName}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Nhóm học EPS" subtitle="Thi đua điểm số với bạn bè cùng lớp">
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        {/* Success message */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
            <i className="ri-checkbox-circle-line"></i>
            {successMsg}
          </div>
        )}

        {/* Header actions */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex-1 relative min-w-48">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm nhóm theo tên hoặc mã..."
              className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-gray-700 text-sm focus:outline-none focus:border-[#e8c84a]/50 shadow-sm"
            />
          </div>
          <GroupNotificationPanel
            notifications={notifications}
            onMarkRead={markRead}
            onClear={clearNotifications}
          />
          <button
            onClick={() => setShowJoin(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <i className="ri-login-box-line"></i>
            Nhập mã nhóm
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#e8c84a] text-[#0f1117] rounded-xl text-sm font-bold hover:bg-[#f0d060] transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line"></i>
            Tạo nhóm mới
          </button>
        </div>

        {/* My groups */}
        {joinedIds.length > 0 && (
          <div className="mb-6">
            <h2 className="text-gray-700 font-semibold text-sm mb-3 flex items-center gap-2">
              <i className="ri-group-fill text-[#e8c84a]"></i>
              Nhóm của tôi ({joinedIds.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.filter(g => joinedIds.includes(g.id)).map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoin={handleJoinGroup}
                  onView={setSelectedGroup}
                  isJoined
                />
              ))}
            </div>
          </div>
        )}

        {/* All groups */}
        <div>
          <h2 className="text-gray-700 font-semibold text-sm mb-3 flex items-center gap-2">
            <i className="ri-global-line text-[#e8c84a]"></i>
            Khám phá nhóm ({filtered.length})
          </h2>
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <i className="ri-group-line text-gray-300 text-4xl mb-3 block"></i>
              <p className="text-gray-500 text-sm">Không tìm thấy nhóm nào</p>
              <button onClick={() => setShowCreate(true)} className="mt-3 text-[#e8c84a] text-sm font-medium cursor-pointer">
                Tạo nhóm đầu tiên →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onJoin={handleJoinGroup}
                  onView={setSelectedGroup}
                  isJoined={joinedIds.includes(group.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-gray-700 font-semibold text-sm mb-4 flex items-center gap-2">
            <i className="ri-question-line text-[#e8c84a]"></i>
            Cách hoạt động
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: "ri-add-circle-line", color: "#e8c84a", title: "Tạo hoặc tham gia", desc: "Tạo nhóm mới hoặc nhập mã nhóm từ bạn bè" },
              { icon: "ri-timer-line", color: "#06b6d4", title: "Thi đua cùng nhau", desc: "Làm bài thi EPS, điểm tự động cập nhật BXH nhóm" },
              { icon: "ri-trophy-line", color: "#e8c84a", title: "So sánh tiến bộ", desc: "Xem ai đang dẫn đầu, ai cần cố gắng thêm" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl mx-auto mb-3" style={{ backgroundColor: `${item.color}15` }}>
                  <i className={`${item.icon} text-xl`} style={{ color: item.color }}></i>
                </div>
                <p className="text-gray-700 font-semibold text-sm mb-1">{item.title}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateGroupModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          myName={myName}
          myId={myId}
        />
      )}
      {showJoin && (
        <JoinGroupModal
          onClose={() => setShowJoin(false)}
          onJoin={handleJoinByCode}
          groups={groups}
        />
      )}

      {/* Live notification toast */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700 flex-shrink-0">
              {liveToast.memberAvatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Thông báo nhóm</span>
                {liveToast.score && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{liveToast.score}%</span>
                )}
              </div>
              <p className="text-gray-700 text-xs leading-relaxed">{liveToast.message}</p>
            </div>
            <button onClick={() => setLiveToast(null)} className="text-gray-300 hover:text-gray-500 cursor-pointer flex-shrink-0">
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
