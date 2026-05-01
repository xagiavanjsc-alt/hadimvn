import { useState, useEffect, useRef } from "react";

interface OnlineUser {
  id: string;
  name: string;
  level: string;
  activity: string;
  color: string;
  streak: number;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  detail: string;
  time: number; // seconds ago
  icon: string;
  color: string;
}

const MOCK_USERS: OnlineUser[] = [
  { id: "u1", name: "Minh Tuấn", level: "B2", activity: "Đang học EPS", color: "#e8c84a", streak: 47 },
  { id: "u2", name: "Thu Hà", level: "A2", activity: "Luyện nghe TOPIK", color: "#34d399", streak: 12 },
  { id: "u3", name: "Văn Đức", level: "B1", activity: "Flashcard Seoul", color: "#60a5fa", streak: 23 },
  { id: "u4", name: "Lan Anh", level: "A1", activity: "Học Hangul", color: "#f472b6", streak: 5 },
  { id: "u5", name: "Quốc Hùng", level: "C1", activity: "Thi thử EPS", color: "#fb923c", streak: 89 },
  { id: "u6", name: "Thảo Nguyên", level: "B1", activity: "K-pop Lesson", color: "#a78bfa", streak: 31 },
  { id: "u7", name: "Đình Khoa", level: "A2", activity: "Ôn tập câu sai", color: "#34d399", streak: 8 },
  { id: "u8", name: "Bích Ngọc", level: "B2", activity: "Từ điển Seoul", color: "#e8c84a", streak: 56 },
  { id: "u9", name: "Trọng Nghĩa", level: "A1", activity: "Học từ vựng", color: "#60a5fa", streak: 3 },
  { id: "u10", name: "Phương Linh", level: "B1", activity: "Luyện phát âm", color: "#f472b6", streak: 19 },
  { id: "u11", name: "Hải Đăng", level: "C1", activity: "TOPIK II", color: "#fb923c", streak: 102 },
  { id: "u12", name: "Yến Nhi", level: "A2", activity: "Cộng đồng", color: "#a78bfa", streak: 14 },
];

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: "a1", user: "Quốc Hùng", action: "đạt điểm", detail: "95/100 thi thử EPS", time: 12, icon: "ri-trophy-line", color: "#e8c84a" },
  { id: "a2", user: "Thu Hà", action: "hoàn thành", detail: "Bài 15 EPS-TOPIK", time: 34, icon: "ri-check-double-line", color: "#34d399" },
  { id: "a3", user: "Minh Tuấn", action: "streak", detail: "47 ngày liên tiếp!", time: 58, icon: "ri-fire-line", color: "#fb923c" },
  { id: "a4", user: "Lan Anh", action: "học xong", detail: "Bảng chữ Hangul", time: 92, icon: "ri-font-size", color: "#60a5fa" },
  { id: "a5", user: "Hải Đăng", action: "đăng bài", detail: "Chia sẻ kinh nghiệm TOPIK II", time: 145, icon: "ri-article-line", color: "#a78bfa" },
  { id: "a6", user: "Bích Ngọc", action: "đạt huy hiệu", detail: "Học viên xuất sắc", time: 203, icon: "ri-medal-line", color: "#f472b6" },
  { id: "a7", user: "Văn Đức", action: "hoàn thành", detail: "100 flashcard Seoul", time: 267, icon: "ri-stack-line", color: "#34d399" },
  { id: "a8", user: "Thảo Nguyên", action: "học bài hát", detail: "Dynamite - BTS", time: 312, icon: "ri-music-2-line", color: "#e8c84a" },
  { id: "a9", user: "Đình Khoa", action: "ôn tập", detail: "20 câu sai EPS", time: 389, icon: "ri-error-warning-line", color: "#fb923c" },
  { id: "a10", user: "Phương Linh", action: "luyện phát âm", detail: "Đạt 92% độ chính xác", time: 445, icon: "ri-mic-line", color: "#60a5fa" },
];

function timeAgoShort(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
}

export default function OnlineUsersWidget() {
  const [onlineCount, setOnlineCount] = useState(247);
  const [activities, setActivities] = useState<ActivityItem[]>(MOCK_ACTIVITIES);
  const [visibleUsers, setVisibleUsers] = useState<OnlineUser[]>(MOCK_USERS.slice(0, 6));
  const [showAll, setShowAll] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activityRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate online count fluctuation
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setOnlineCount(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 4000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, []);

  // Simulate new activity feed items
  useEffect(() => {
    const newActivities: ActivityItem[] = [
      { id: "new1", user: "Trọng Nghĩa", action: "bắt đầu học", detail: "Từ vựng thể thao", time: 0, icon: "ri-run-line", color: "#34d399" },
      { id: "new2", user: "Yến Nhi", action: "bình luận", detail: "Bài đăng về EPS", time: 0, icon: "ri-chat-3-line", color: "#a78bfa" },
      { id: "new3", user: "Minh Tuấn", action: "hoàn thành", detail: "Bài thi thử 40 câu", time: 0, icon: "ri-check-double-line", color: "#e8c84a" },
      { id: "new4", user: "Thu Hà", action: "đạt điểm", detail: "88/100 TOPIK I", time: 0, icon: "ri-trophy-line", color: "#60a5fa" },
    ];
    let idx = 0;
    activityRef.current = setInterval(() => {
      const newItem = { ...newActivities[idx % newActivities.length], id: `live_${Date.now()}`, time: 0 };
      setActivities(prev => [newItem, ...prev.slice(0, 9)]);
      idx++;
    }, 6000);
    return () => { if (activityRef.current) clearInterval(activityRef.current); };
  }, []);

  // Increment activity times
  useEffect(() => {
    const t = setInterval(() => {
      setActivities(prev => prev.map(a => ({ ...a, time: a.time + 1 })));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const displayedUsers = showAll ? MOCK_USERS : visibleUsers;

  return (
    <div className="space-y-4">
      {/* Online Users */}
      <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <h3 className="text-white font-semibold text-sm">Đang online</h3>
          </div>
          <span className="text-[#34d399] font-bold text-sm">{onlineCount.toLocaleString()}</span>
        </div>

        <div className="space-y-2">
          {displayedUsers.map(user => (
            <div key={user.id} className="flex items-center gap-2.5">
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: `${user.color}20`, color: user.color }}>
                  {user.name.charAt(0)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[#0f1117]"></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white/75 text-xs font-medium truncate">{user.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${user.color}15`, color: user.color }}>{user.level}</span>
                </div>
                <p className="text-white/30 text-[10px] truncate">{user.activity}</p>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <i className="ri-fire-line text-[#fb923c] text-[10px]"></i>
                <span className="text-[10px] text-white/30">{user.streak}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAll(v => !v)}
          className="w-full mt-3 py-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors cursor-pointer whitespace-nowrap"
        >
          {showAll ? "Thu gọn" : `Xem thêm ${MOCK_USERS.length - 6} người`}
        </button>
      </div>

      {/* Activity Feed */}
      <div className="bg-[#0f1117] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#e8c84a] animate-pulse"></div>
          <h3 className="text-white font-semibold text-sm">Hoạt động realtime</h3>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto">
          {activities.map((item, i) => (
            <div
              key={item.id}
              className="flex items-start gap-2.5 transition-all duration-300"
              style={{ opacity: i === 0 ? 1 : Math.max(0.3, 1 - i * 0.08) }}
            >
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${item.color}15` }}>
                <i className={`${item.icon} text-[10px]`} style={{ color: item.color }}></i>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.6)" }}>
                  <span className="font-semibold text-white/80">{item.user}</span>
                  {" "}{item.action}{" "}
                  <span style={{ color: item.color }}>{item.detail}</span>
                </p>
              </div>
              <span className="text-[9px] flex-shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.2)" }}>
                {item.time === 0 ? "vừa xong" : `${timeAgoShort(item.time)} trước`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
