import { useState, useEffect, useRef, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Partner {
  id: string;
  name: string;
  level: string;
  avatar: string;
  streak: number;
  xp: number;
  status: "online" | "studying" | "away";
  topic: string;
  bio: string;
  languages: string[];
  joinedAt: string;
}

interface Message {
  id: string;
  sender: "me" | "partner";
  text: string;
  time: string;
  type: "text" | "vocab" | "question";
}

// Partners fetched from Supabase leaderboard + user_profiles (no mock)

const QUICK_PHRASES = [
  "안녕하세요! 같이 공부해요 😊",
  "오늘 어떤 주제를 공부할까요?",
  "이 단어의 뜻이 뭐예요?",
  "발음을 도와주세요!",
  "잠깐만요, 확인할게요.",
  "정말 도움이 됐어요! 감사합니다.",
  "다음에 또 같이 공부해요!",
];

const VOCAB_CHALLENGES = [
  { korean: "행복하다", vietnamese: "Hạnh phúc", hint: "Cảm xúc tích cực" },
  { korean: "성실하다", vietnamese: "Chăm chỉ", hint: "Tính cách tốt" },
  { korean: "출근하다", vietnamese: "Đi làm", hint: "Sinh hoạt hàng ngày" },
  { korean: "일교차", vietnamese: "Chênh lệch nhiệt độ", hint: "Thời tiết" },
  { korean: "횡단보도", vietnamese: "Vạch kẻ đường", hint: "Giao thông" },
];

const STATUS_CONFIG = {
  online: { color: "#34d399", label: "Online", dot: "bg-emerald-400" },
  studying: { color: "#e8c84a", label: "Đang học", dot: "bg-yellow-400" },
  away: { color: "#fb923c", label: "Vắng mặt", dot: "bg-orange-400" },
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "#34d399", A2: "#84cc16", B1: "#e8c84a", B2: "#fb923c", C1: "#f87171",
};

// ─── Partner Card ─────────────────────────────────────────────────────────────
interface PartnerCardProps {
  partner: Partner;
  onConnect: () => void;
}

function PartnerCard({ partner, onConnect }: PartnerCardProps) {
  const statusCfg = STATUS_CONFIG[partner.status];
  const levelColor = LEVEL_COLORS[partner.level] || "#e8c84a";

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-5 hover:border-app-border transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: `${levelColor}20` }}>
            <span style={{ color: levelColor }}>{partner.avatar}</span>
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0f1117] ${statusCfg.dot} animate-pulse`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-white font-semibold text-sm">{partner.name}</p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${levelColor}15`, color: levelColor }}>{partner.level}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-app-text-muted">
            <span style={{ color: statusCfg.color }}>{statusCfg.label}</span>
            <span>·</span>
            <span>{partner.topic}</span>
          </div>
        </div>
      </div>

      <p className="text-app-text-secondary text-xs leading-relaxed mb-3 line-clamp-2">{partner.bio}</p>

      <div className="flex items-center gap-3 mb-4 text-[10px] text-app-text-muted">
        <span className="flex items-center gap-1"><i className="ri-fire-line text-[#fb923c]"></i>{partner.streak} ngày</span>
        <span className="flex items-center gap-1"><i className="ri-star-line text-app-accent-primary"></i>{partner.xp.toLocaleString()} XP</span>
        <span className="flex items-center gap-1"><i className="ri-calendar-line"></i>Từ {partner.joinedAt}</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {partner.languages.map(lang => (
          <span key={lang} className="text-[10px] px-2 py-0.5 rounded-full bg-app-card/50 text-app-text-muted">{lang}</span>
        ))}
      </div>

      <button
        onClick={onConnect}
        disabled={partner.status === "away"}
        className="w-full py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: partner.status === "away" ? "rgba(255,255,255,0.05)" : `${levelColor}15`,
          color: partner.status === "away" ? "rgba(255,255,255,0.3)" : levelColor,
          border: `1px solid ${partner.status === "away" ? "rgba(255,255,255,0.08)" : `${levelColor}25`}`,
        }}
      >
        {partner.status === "away" ? "Vắng mặt" : "Kết nối học cùng"}
      </button>
    </div>
  );
}

// ─── Chat Session ─────────────────────────────────────────────────────────────
interface ChatSessionProps {
  partner: Partner;
  onClose: () => void;
}

function ChatSession({ partner, onClose }: ChatSessionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "partner",
      text: `안녕하세요! 저는 ${partner.name}이에요. 같이 공부해요! 😊`,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [currentChallenge, setCurrentChallenge] = useState(VOCAB_CHALLENGES[0]);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeAnswer, setChallengeAnswer] = useState("");
  const [challengeResult, setChallengeResult] = useState<"correct" | "wrong" | null>(null);
  const [sessionTime, setSessionTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const levelColor = LEVEL_COLORS[partner.level] || "#e8c84a";

  useEffect(() => {
    timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate partner responses
  const partnerResponses = [
    "네, 맞아요! 잘 하셨어요! 👍",
    "아, 그렇군요. 저도 그 단어가 어려웠어요.",
    "같이 연습해 봐요! 이 문장 어때요?",
    "발음이 좋아요! 계속 연습하세요.",
    "저도 그 주제 공부하고 있어요!",
    "화이팅! 우리 같이 열심히 해요! 💪",
  ];

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const newMsg: Message = { id: Date.now().toString(), sender: "me", text, time: now, type: "text" };
    setMessages(prev => [...prev, newMsg]);
    setInput("");

    // Simulate partner reply
    setTimeout(() => {
      const reply = partnerResponses[Math.floor(Math.random() * partnerResponses.length)];
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        sender: "partner",
        text: reply,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        type: "text",
      }]);
    }, 1000 + Math.random() * 1500);
  };

  const sendChallenge = () => {
    const challenge = VOCAB_CHALLENGES[Math.floor(Math.random() * VOCAB_CHALLENGES.length)];
    setCurrentChallenge(challenge);
    setShowChallenge(true);
    setChallengeResult(null);
    setChallengeAnswer("");
    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: "me",
      text: `🎯 Thử thách từ vựng: "${challenge.korean}" có nghĩa là gì? (Gợi ý: ${challenge.hint})`,
      time: now,
      type: "question",
    }]);
  };

  const checkAnswer = () => {
    const isCorrect = challengeAnswer.toLowerCase().includes(currentChallenge.vietnamese.toLowerCase().split("/")[0].toLowerCase());
    setChallengeResult(isCorrect ? "correct" : "wrong");
    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: "partner",
      text: isCorrect
        ? `✅ Đúng rồi! "${currentChallenge.korean}" = "${currentChallenge.vietnamese}". Giỏi lắm!`
        : `❌ Chưa đúng. "${currentChallenge.korean}" = "${currentChallenge.vietnamese}". Cố gắng nhé!`,
      time: now,
      type: "vocab",
    }]);
    setTimeout(() => setShowChallenge(false), 2000);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-app-bg border border-app-border rounded-3xl w-full max-w-2xl flex flex-col"
        style={{ height: "85vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-app-border flex-shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${levelColor}20`, color: levelColor }}>
              {partner.avatar}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0f1117] ${STATUS_CONFIG[partner.status].dot}`}></div>
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{partner.name}</p>
            <p className="text-app-text-muted text-xs">{partner.level} · {partner.topic}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-card/50 text-app-text-secondary text-xs">
              <i className="ri-time-line text-xs"></i>
              {formatTime(sessionTime)}
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-app-card/50 hover:bg-app-card/70 text-white/50 cursor-pointer">
              <i className="ri-close-line text-sm"></i>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] ${msg.sender === "me" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                <div
                  className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "me"
                      ? "text-[#141720] rounded-br-sm"
                      : "bg-white/8 text-white/80 rounded-bl-sm"
                  } ${msg.type === "question" ? "border border-app-accent-primary/30" : ""} ${msg.type === "vocab" ? "border border-emerald-500/20" : ""}`}
                  style={msg.sender === "me" ? { backgroundColor: levelColor } : {}}
                >
                  {msg.text}
                </div>
                <span className="text-app-text-muted text-[10px]">{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Challenge input */}
        {showChallenge && (
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="flex gap-2 p-3 rounded-xl bg-app-accent-primary/8 border border-app-accent-primary/20">
              <input
                type="text"
                placeholder={`Nghĩa của "${currentChallenge.korean}" là...`}
                value={challengeAnswer}
                onChange={e => setChallengeAnswer(e.target.value)}
                onKeyDown={e => e.key === "Enter" && checkAnswer()}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
              />
              <button
                onClick={checkAnswer}
                className="px-3 py-1 rounded-lg bg-app-accent-primary text-[#141720] text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                Trả lời
              </button>
            </div>
          </div>
        )}

        {/* Quick phrases */}
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {QUICK_PHRASES.map((phrase, i) => (
              <button
                key={i}
                onClick={() => sendMessage(phrase)}
                className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary text-[10px] cursor-pointer transition-colors whitespace-nowrap"
              >
                {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-app-border flex-shrink-0">
          <div className="flex gap-2">
            <button
              onClick={sendChallenge}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary cursor-pointer transition-colors flex-shrink-0"
              title="Gửi thử thách từ vựng"
            >
              <i className="ri-sword-line text-sm"></i>
            </button>
            <input
              type="text"
              placeholder="Nhắn tin với đối tác học tập..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage(input)}
              className="flex-1 bg-app-card/50 border border-app-border rounded-xl px-4 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-white/20"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer transition-all disabled:opacity-40 flex-shrink-0"
              style={{ backgroundColor: levelColor }}
            >
              <i className="ri-send-plane-fill text-[#141720] text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StudyPartnerPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(true);

  const fetchPartners = useCallback(async () => {
    setLoadingPartners(true);
    try {
      const { data: lbRows } = await supabase
        .from("leaderboard")
        .select("user_id, streak, total_xp")
        .order("total_xp", { ascending: false })
        .limit(20);

      if (!lbRows || lbRows.length === 0) { setPartners([]); return; }

      const userIds = lbRows.map((r: { user_id: string }) => r.user_id);
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("id, display_name")
        .in("id", userIds);

      const nameMap = Object.fromEntries(
        (profiles || []).map((p: { id: string; display_name: string }) => [p.id, p.display_name || "Học viên"])
      );

      const mapped: Partner[] = lbRows.map((r: { user_id: string; streak: number; total_xp: number }) => {
        const name = nameMap[r.user_id] || "Học viên";
        return {
          id: r.user_id,
          name,
          level: "",
          avatar: name.slice(0, 2).toUpperCase(),
          streak: r.streak || 0,
          xp: r.total_xp || 0,
          status: "online" as const,
          topic: "Tiếng Hàn",
          bio: "",
          languages: ["Tiếng Hàn"],
          joinedAt: "",
        };
      });
      setPartners(mapped);
    } catch {
      setPartners([]);
    } finally {
      setLoadingPartners(false);
    }
  }, []);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [matchedPartner, setMatchedPartner] = useState<Partner | null>(null);

  const filtered = partners.filter(p => {
    const matchLevel = filterLevel === "all" || p.level === filterLevel;
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.topic.toLowerCase().includes(q) || p.bio.toLowerCase().includes(q);
    return matchLevel && matchStatus && matchSearch;
  });

  const onlineCount = partners.filter(p => p.status !== "away").length;

  const handleRandomMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      const available = partners.filter(p => p.status !== "away");
      const random = available[Math.floor(Math.random() * available.length)];
      setMatchedPartner(random);
      setIsMatching(false);
    }, 2000);
  };

  return (
    <DashboardLayout
      title="Đối tác học tập"
      subtitle="Ghép cặp ngẫu nhiên để luyện nói, hỏi đáp từ vựng và học cùng nhau"
    >
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Học viên online", value: onlineCount, icon: "ri-user-line", color: "#34d399" },
          { label: "Đang học cùng", value: partners.filter(p => p.status === "studying").length, icon: "ri-group-line", color: "#e8c84a" },
          { label: "Phiên học hôm nay", value: 3, icon: "ri-history-line", color: "#fb923c" },
          { label: "Thời gian học cùng", value: "47 phút", icon: "ri-time-line", color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} className="bg-app-bg border border-app-border rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ backgroundColor: `${s.color}15` }}>
                <i className={`${s.icon} text-xs`} style={{ color: s.color }}></i>
              </div>
              <p className="text-app-text-secondary text-xs">{s.label}</p>
            </div>
            <p className="text-white font-bold text-2xl">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Random match banner */}
      <div className="bg-gradient-to-r from-app-surface to-[#0f1117] border border-app-accent-primary/20 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-bold text-base mb-1">Ghép cặp ngẫu nhiên</h3>
            <p className="text-app-text-secondary text-sm">AI sẽ tìm đối tác phù hợp với trình độ và mục tiêu của bạn</p>
          </div>
          {matchedPartner ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-white/50 text-xs">Đã tìm thấy!</p>
                <p className="text-app-accent-primary font-bold text-sm">{matchedPartner.name}</p>
              </div>
              <button
                onClick={() => { setSelectedPartner(matchedPartner); setMatchedPartner(null); }}
                className="px-4 py-2 rounded-xl bg-app-accent-primary text-[#141720] text-sm font-bold cursor-pointer whitespace-nowrap"
              >
                Kết nối ngay
              </button>
            </div>
          ) : (
            <button
              onClick={handleRandomMatch}
              disabled={isMatching}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-app-accent-primary/15 border border-app-accent-primary/25 text-app-accent-primary font-semibold text-sm cursor-pointer hover:bg-app-accent-primary/25 transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {isMatching ? (
                <><div className="w-4 h-4 border-2 border-app-accent-primary/30 border-t-[app-accent-primary] rounded-full animate-spin"></div>Đang tìm...</>
              ) : (
                <><i className="ri-shuffle-line"></i>Ghép ngẫu nhiên</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted text-sm"></i>
          <input
            type="text"
            placeholder="Tìm theo tên, chủ đề, mô tả..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-app-bg border border-app-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-white/20"
          />
        </div>
        <div className="flex gap-1.5">
          {["all", "A1", "A2", "B1", "B2", "C1"].map(level => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                filterLevel === level ? "bg-app-card/70 text-white" : "text-app-text-muted hover:text-white/50"
              }`}
            >
              {level === "all" ? "Tất cả" : level}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {[["all", "Tất cả"], ["online", "Online"], ["studying", "Đang học"]].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterStatus(val)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all whitespace-nowrap ${
                filterStatus === val ? "bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/25" : "bg-app-surface/50 text-app-text-muted border border-app-border hover:text-white/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Partner grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {filtered.map(partner => (
          <PartnerCard key={partner.id} partner={partner} onConnect={() => setSelectedPartner(partner)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-app-bg border border-app-border rounded-2xl p-16 text-center">
          <i className="ri-user-search-line text-white/10 text-5xl mb-4"></i>
          <p className="text-app-text-muted text-sm">Không tìm thấy đối tác phù hợp</p>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 bg-app-bg border border-app-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-lightbulb-line text-app-accent-primary text-sm"></i>
          <h3 className="text-white font-semibold text-sm">Mẹo học cùng đối tác hiệu quả</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-app-text-secondary leading-relaxed">
          <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Dùng tính năng "Thử thách từ vựng" để kiểm tra nhau</p>
          <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Luyện nói bằng cách đọc to các câu trong transcript</p>
          <p><i className="ri-arrow-right-s-line text-app-accent-primary mr-1"></i>Đặt lịch học cố định mỗi ngày để duy trì streak</p>
        </div>
      </div>

      {selectedPartner && <ChatSession partner={selectedPartner} onClose={() => setSelectedPartner(null)} />}
    </DashboardLayout>
  );
}


