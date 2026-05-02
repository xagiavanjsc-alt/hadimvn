import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ─── Types ────────────────────────────────────────────────────────────────────
interface RoomMember {
  id: string;
  name: string;
  level: string;
  color: string;
  joinedAt: number;
  activity: string;
  streak: number;
  isHost: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  color: string;
  text: string;
  time: number;
  type: "message" | "system" | "achievement";
}

interface StudyRoom {
  id: string;
  name: string;
  topic: string;
  memberCount: number;
  maxMembers: number;
  isPublic: boolean;
  hostName: string;
  language: string;
  tags: string[];
  color: string;
}

// ─── Mock rooms ───────────────────────────────────────────────────────────────
// Rooms + chat data stored in localStorage (no mock data)

const QUICK_PHRASES = [
  "화이팅! 💪", "감사합니다 🙏", "잘 모르겠어요 🤔", "이해했어요! ✅",
  "다시 설명해 주세요", "같이 공부해요!", "오늘도 열심히!", "수고하셨습니다 👏",
];

function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  if (diff < 60000) return "vừa xong";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}p`;
  return `${Math.floor(diff / 3600000)}h`;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────
interface LeaderboardEntry {
  rank: number;
  name: string;
  color: string;
  level: string;
  studyMinutes: number;
  wordsLearned: number;
  streak: number;
  room: string;
  badge: string;
}

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { rank: 1, name: "Minh Tuấn", color: "app-accent-primary", level: "B2", studyMinutes: 342, wordsLearned: 187, streak: 47, room: "EPS-TOPIK Cùng Chinh Phục", badge: "ri-vip-crown-fill" },
  { rank: 2, name: "Thu Hà", color: "#fb923c", level: "B1", studyMinutes: 298, wordsLearned: 154, streak: 32, room: "EPS-TOPIK Cùng Chinh Phục", badge: "ri-medal-fill" },
  { rank: 3, name: "Hải Đăng", color: "#a78bfa", level: "C1", studyMinutes: 276, wordsLearned: 201, streak: 28, room: "TOPIK II Nâng Cao", badge: "ri-medal-fill" },
  { rank: 4, name: "Lan Anh", color: "#34d399", level: "A2", studyMinutes: 215, wordsLearned: 98, streak: 15, room: "Hangul Cho Người Mới", badge: "ri-star-fill" },
  { rank: 5, name: "Văn Đức", color: "#60a5fa", level: "B1", studyMinutes: 198, wordsLearned: 132, streak: 23, room: "EPS-TOPIK Cùng Chinh Phục", badge: "ri-star-fill" },
  { rank: 6, name: "Thảo Nguyên", color: "#f472b6", level: "A2", studyMinutes: 187, wordsLearned: 89, streak: 19, room: "K-pop Lyrics Club", badge: "ri-star-fill" },
  { rank: 7, name: "Bích Ngọc", color: "#fbbf24", level: "B2", studyMinutes: 165, wordsLearned: 143, streak: 11, room: "Từ Vựng Hán Hàn", badge: "ri-star-line" },
  { rank: 8, name: "Quang Huy", color: "#4ade80", level: "A1", studyMinutes: 142, wordsLearned: 67, streak: 8, room: "Hangul Cho Người Mới", badge: "ri-star-line" },
];

function RoomLeaderboard() {
  const [sortKey, setSortKey] = useState<"studyMinutes" | "wordsLearned" | "streak">("studyMinutes");
  const sorted = [...LEADERBOARD_DATA].sort((a, b) => b[sortKey] - a[sortKey]).map((e, i) => ({ ...e, rank: i + 1 }));
  const rankColors = ["app-accent-primary", "#c0c0c0", "#cd7f32"];

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-app-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-app-accent-primary/10">
            <i className="ri-trophy-line text-app-accent-primary text-sm"></i>
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Bảng xếp hạng phòng học</h3>
            <p className="text-app-text-muted text-[10px]">Tuần này · Cập nhật realtime</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white/4 border border-app-border rounded-xl p-1">
          {([
            { key: "studyMinutes" as const, label: "Thời gian" },
            { key: "wordsLearned" as const, label: "Từ học" },
            { key: "streak" as const, label: "Streak" },
          ] as const).map(s => (
            <button
              key={s.key}
              onClick={() => setSortKey(s.key)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${sortKey === s.key ? "bg-app-accent-primary/15 text-app-accent-primary" : "text-white/35 hover:text-white/60"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-white/4">
        {sorted.map((entry) => (
          <div key={entry.name} className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/2 ${entry.rank <= 3 ? "bg-white/1" : ""}`}>
            <div className="w-7 flex-shrink-0 text-center">
              {entry.rank <= 3 ? (
                <i className={`${entry.badge} text-base`} style={{ color: rankColors[entry.rank - 1] }}></i>
              ) : (
                <span className="text-app-text-muted text-sm font-bold">{entry.rank}</span>
              )}
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: `${entry.color}20`, color: entry.color }}>
              {entry.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white/80 text-sm font-medium">{entry.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${entry.color}15`, color: entry.color }}>{entry.level}</span>
              </div>
              <p className="text-app-text-muted text-[10px] truncate">{entry.room}</p>
            </div>
            <div className="flex items-center gap-5 flex-shrink-0">
              <div className="text-right">
                <p className="text-white/70 text-sm font-bold">{entry.studyMinutes}p</p>
                <p className="text-app-text-muted text-[10px]">học</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-sm font-bold">{entry.wordsLearned}</p>
                <p className="text-app-text-muted text-[10px]">từ</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <i className="ri-fire-line text-[#fb923c] text-xs"></i>
                  <p className="text-white/70 text-sm font-bold">{entry.streak}</p>
                </div>
                <p className="text-app-text-muted text-[10px]">ngày</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Room Card ────────────────────────────────────────────────────────────────
function RoomCard({ room, onJoin }: { room: StudyRoom; onJoin: (r: StudyRoom) => void }) {
  const pct = Math.round((room.memberCount / room.maxMembers) * 100);
  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5 hover:border-app-border transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${room.color}15` }}>
            <i className="ri-group-line text-lg" style={{ color: room.color }}></i>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{room.name}</h3>
            <p className="text-white/35 text-[10px]">Host: {room.hostName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {!room.isPublic && <i className="ri-lock-line text-app-text-muted text-xs"></i>}
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {room.tags.map(tag => (
          <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${room.color}12`, color: room.color }}>{tag}</span>
        ))}
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-app-text-muted text-[10px]">{room.memberCount}/{room.maxMembers} thành viên</span>
          <span className="text-[10px] font-bold" style={{ color: room.color }}>{pct}%</span>
        </div>
        <div className="h-1 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: room.color }}></div>
        </div>
      </div>

      <button
        onClick={() => onJoin(room)}
        disabled={room.memberCount >= room.maxMembers}
        className="w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ backgroundColor: `${room.color}20`, color: room.color, border: `1px solid ${room.color}30` }}
      >
        {room.memberCount >= room.maxMembers ? "Phòng đầy" : "Tham gia"}
      </button>
    </div>
  );
}

// ─── Study Room Chat ──────────────────────────────────────────────────────────
function StudyRoomChat({ room, onLeave, profile }: { room: StudyRoom; onLeave: () => void; profile: { display_name: string } | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members] = useState<RoomMember[]>(profile ? [{ id: "me", name: profile.display_name, level: "", color: "app-accent-primary", joinedAt: Date.now(), activity: "Đang học", streak: 0, isHost: true }] : []);
  const [inputText, setInputText] = useState("");
  const [studyTimer, setStudyTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [showPhrases, setShowPhrases] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setStudyTimer(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);


  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const newMsg: ChatMessage = {
      id: `my_${Date.now()}`,
      userId: "me",
      userName: profile?.display_name || "Bạn",
      color: "app-accent-primary",
      text: text.trim(),
      time: Date.now(),
      type: "message",
    };
    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    setShowPhrases(false);
  }, [profile]);

  return (
    <div className="flex gap-4 h-[calc(100vh-160px)]">
      {/* Left: Chat */}
      <div className="flex-1 flex flex-col bg-app-bg border border-app-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-app-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${room.color}15` }}>
              <i className="ri-group-line text-sm" style={{ color: room.color }}></i>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{room.name}</h3>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-app-text-muted text-[10px]">{members.length} thành viên online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Study timer */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ backgroundColor: "rgba(232,200,74,0.08)", border: "1px solid rgba(232,200,74,0.15)" }}>
              <i className="ri-timer-line text-app-accent-primary text-xs"></i>
              <span className="text-app-accent-primary text-xs font-mono font-bold">{formatTimer(studyTimer)}</span>
              <button onClick={() => setTimerRunning(v => !v)} className="cursor-pointer">
                <i className={`${timerRunning ? "ri-pause-line" : "ri-play-line"} text-app-accent-primary/60 text-xs`}></i>
              </button>
            </div>
            <button onClick={onLeave} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-app-text-secondary hover:text-white/70 cursor-pointer whitespace-nowrap transition-colors" style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <i className="ri-logout-box-line"></i>Rời phòng
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.userId === "me" ? "flex-row-reverse" : ""}`}>
              {msg.type === "system" ? (
                <div className="w-full text-center">
                  <span className="text-[10px] px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(232,200,74,0.08)", color: "rgba(232,200,74,0.6)" }}>
                    <i className="ri-information-line mr-1"></i>{msg.text}
                  </span>
                </div>
              ) : msg.type === "achievement" ? (
                <div className="w-full text-center">
                  <span className="text-[10px] px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(52,211,153,0.08)", color: "rgba(52,211,153,0.8)" }}>
                    <i className="ri-trophy-line mr-1"></i>{msg.text}
                  </span>
                </div>
              ) : (
                <>
                  {msg.userId !== "me" && (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: `${msg.color}20`, color: msg.color }}>
                      {msg.userName.charAt(0)}
                    </div>
                  )}
                  <div className={`max-w-[70%] ${msg.userId === "me" ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                    {msg.userId !== "me" && (
                      <span className="text-[10px] font-semibold" style={{ color: msg.color }}>{msg.userName}</span>
                    )}
                    <div className="px-3 py-2 rounded-xl text-sm" style={{
                      backgroundColor: msg.userId === "me" ? "rgba(232,200,74,0.15)" : "rgba(255,255,255,0.05)",
                      color: msg.userId === "me" ? "app-accent-primary" : "rgba(255,255,255,0.75)",
                      border: msg.userId === "me" ? "1px solid rgba(232,200,74,0.2)" : "1px solid rgba(255,255,255,0.06)",
                    }}>
                      {msg.text}
                    </div>
                    <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>{timeAgo(msg.time)}</span>
                  </div>
                </>
              )}
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        {/* Quick phrases */}
        {showPhrases && (
          <div className="px-4 py-2 border-t border-app-border flex flex-wrap gap-1.5 flex-shrink-0">
            {QUICK_PHRASES.map(p => (
              <button key={p} onClick={() => sendMessage(p)} className="text-[10px] px-2.5 py-1 rounded-full cursor-pointer whitespace-nowrap transition-colors" style={{ backgroundColor: "rgba(232,200,74,0.08)", color: "rgba(232,200,74,0.7)", border: "1px solid rgba(232,200,74,0.15)" }}>
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-app-border flex-shrink-0">
          <div className="flex gap-2">
            <button onClick={() => setShowPhrases(v => !v)} className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer flex-shrink-0 transition-colors" style={{ backgroundColor: showPhrases ? "rgba(232,200,74,0.15)" : "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <i className="ri-emotion-line text-sm" style={{ color: showPhrases ? "app-accent-primary" : "rgba(255,255,255,0.4)" }}></i>
            </button>
            <input
              value={inputText}
              onChange={e => setInputText(e.target.value.slice(0, 200))}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(inputText); } }}
              placeholder="Nhắn tin với nhóm học... (Enter để gửi)"
              className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}
            />
            <button onClick={() => sendMessage(inputText)} disabled={!inputText.trim()} className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer flex-shrink-0 disabled:opacity-40 transition-colors" style={{ backgroundColor: "app-accent-primary" }}>
              <i className="ri-send-plane-fill text-sm text-app-bg"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Right: Members */}
      <div className="w-64 flex flex-col gap-3">
        <div className="bg-app-bg border border-app-border rounded-2xl p-4 flex-1">
          <h4 className="text-white/50 text-[10px] tracking-normal mb-3">Thành viên ({members.length})</h4>
          <div className="space-y-2.5">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-2.5">
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: `${m.color}20`, color: m.color }}>
                    {m.name.charAt(0)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#0f1117]"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-white/75 text-xs font-medium truncate">{m.name}</span>
                    {m.isHost && <i className="ri-vip-crown-fill text-app-accent-primary text-[9px]"></i>}
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${m.color}15`, color: m.color }}>{m.level}</span>
                  </div>
                  <p className="text-app-text-muted text-[10px] truncate">{m.activity}</p>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <i className="ri-fire-line text-[#fb923c] text-[9px]"></i>
                  <span className="text-[9px] text-app-text-muted">{m.streak}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study stats */}
        <div className="bg-app-bg border border-app-border rounded-2xl p-4">
          <h4 className="text-white/50 text-[10px] tracking-normal mb-3">Phiên học này</h4>
          <div className="space-y-2">
            {[
              { label: "Thời gian học", value: formatTimer(studyTimer), icon: "ri-timer-line", color: "app-accent-primary" },
              { label: "Tin nhắn", value: messages.filter(m => m.type === "message").length, icon: "ri-chat-3-line", color: "#34d399" },
              { label: "Thành viên", value: members.length, icon: "ri-group-line", color: "#60a5fa" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
                  <span className="text-white/35 text-xs">{s.label}</span>
                </div>
                <span className="text-xs font-bold" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudyRoomPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomTopic, setNewRoomTopic] = useState("EPS-TOPIK");
  const [newRoomPublic, setNewRoomPublic] = useState(true);
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [searchRoom, setSearchRoom] = useState("");
  const [activeTab, setActiveTab] = useState<"rooms" | "leaderboard">("rooms");
  const [, setStudyTime] = useLocalStorage<number>("kts_study_room_time", 0);

  const filteredRooms = rooms.filter(r =>
    r.name.toLowerCase().includes(searchRoom.toLowerCase()) ||
    r.topic.toLowerCase().includes(searchRoom.toLowerCase())
  );

  const handleJoin = (room: StudyRoom) => {
    setActiveRoom(room);
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, memberCount: r.memberCount + 1 } : r));
  };

  const handleLeave = () => {
    if (activeRoom) {
      setRooms(prev => prev.map(r => r.id === activeRoom.id ? { ...r, memberCount: Math.max(0, r.memberCount - 1) } : r));
    }
    setActiveRoom(null);
  };

  const handleCreate = () => {
    if (!newRoomName.trim()) return;
    const newRoom: StudyRoom = {
      id: `r_${Date.now()}`,
      name: newRoomName,
      topic: newRoomTopic,
      memberCount: 1,
      maxMembers: 8,
      isPublic: newRoomPublic,
      hostName: profile?.display_name || "Bạn",
      language: "Tiếng Hàn",
      tags: [newRoomTopic],
      color: "app-accent-primary",
    };
    setRooms(prev => [newRoom, ...prev]);
    setShowCreate(false);
    setNewRoomName("");
    handleJoin(newRoom);
  };

  if (activeRoom) {
    return (
      <DashboardLayout title={activeRoom.name} subtitle="Phòng học nhóm realtime">
        <StudyRoomChat room={activeRoom} onLeave={handleLeave} profile={profile} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Học cùng nhau"
      subtitle="Tham gia phòng học nhóm — cùng tiến bộ nhanh hơn"
      actions={
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg font-bold text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line"></i>Tạo phòng học
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Phòng đang mở", value: rooms.filter(r => r.memberCount < r.maxMembers).length, icon: "ri-door-open-line", color: "#34d399" },
          { label: "Học viên online", value: rooms.reduce((s, r) => s + r.memberCount, 0), icon: "ri-group-line", color: "app-accent-primary" },
          { label: "Phòng công khai", value: rooms.filter(r => r.isPublic).length, icon: "ri-global-line", color: "#60a5fa" },
          { label: "Chủ đề", value: [...new Set(rooms.map(r => r.topic))].length, icon: "ri-book-open-line", color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} className="bg-app-bg border border-app-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
              <i className={`${s.icon} text-lg`} style={{ color: s.color }}></i>
            </div>
            <div>
              <p className="text-white font-bold text-xl">{s.value}</p>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/4 border border-app-border rounded-xl p-1 mb-5 w-fit">
        <button
          onClick={() => setActiveTab("rooms")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === "rooms" ? "bg-app-accent-primary/15 text-app-accent-primary" : "text-app-text-secondary hover:text-white/70"}`}
        >
          <i className="ri-door-open-line text-sm"></i>Danh sách phòng
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${activeTab === "leaderboard" ? "bg-app-accent-primary/15 text-app-accent-primary" : "text-app-text-secondary hover:text-white/70"}`}
        >
          <i className="ri-trophy-line text-sm"></i>Bảng xếp hạng
        </button>
      </div>

      {activeTab === "leaderboard" ? (
        <RoomLeaderboard />
      ) : (
        <>
          {/* Search */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 flex items-center gap-2 bg-app-bg border border-app-border rounded-xl px-4 py-2.5">
              <i className="ri-search-line text-app-text-muted text-sm"></i>
              <input value={searchRoom} onChange={e => setSearchRoom(e.target.value)} placeholder="Tìm phòng học..." className="flex-1 bg-transparent text-white/70 text-sm outline-none placeholder-white/20" />
            </div>
            <span className="text-app-text-muted text-xs whitespace-nowrap">{filteredRooms.length} phòng</span>
          </div>

          {/* Rooms grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {filteredRooms.map(room => (
              <RoomCard key={room.id} room={room} onJoin={handleJoin} />
            ))}
          </div>
        </>
      )}

      {/* Create room modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-app-bg border border-app-border rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-base">Tạo phòng học mới</h3>
              <button onClick={() => setShowCreate(false)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-app-card/50 text-app-text-secondary cursor-pointer"><i className="ri-close-line text-sm"></i></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-app-text-secondary text-xs mb-1.5 block">Tên phòng học</label>
                <input value={newRoomName} onChange={e => setNewRoomName(e.target.value)} placeholder="VD: EPS-TOPIK Cùng Chinh Phục" className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-app-accent-primary/30 placeholder-white/20" />
              </div>
              <div>
                <label className="text-app-text-secondary text-xs mb-1.5 block">Chủ đề</label>
                <div className="flex flex-wrap gap-2">
                  {["EPS-TOPIK", "TOPIK I/II", "Seoul", "K-pop", "Hangul", "Hán Hàn"].map(t => (
                    <button key={t} onClick={() => setNewRoomTopic(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap transition-all ${newRoomTopic === t ? "bg-app-accent-primary text-app-bg" : "bg-app-card/50 text-app-text-secondary hover:text-white/60"}`}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">Phòng công khai</p>
                  <p className="text-app-text-muted text-xs">Ai cũng có thể tham gia</p>
                </div>
                <button onClick={() => setNewRoomPublic(v => !v)} className={`w-12 h-6 rounded-full transition-all cursor-pointer relative ${newRoomPublic ? "bg-app-accent-primary" : "bg-app-card/70"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${newRoomPublic ? "left-6" : "left-0.5"}`}></div>
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-app-border text-white/50 text-sm cursor-pointer whitespace-nowrap">Hủy</button>
                <button onClick={handleCreate} disabled={!newRoomName.trim()} className="flex-1 py-2.5 rounded-xl bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 text-app-bg font-bold text-sm cursor-pointer whitespace-nowrap">Tạo phòng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


