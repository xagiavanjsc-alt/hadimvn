import { useState, useRef, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  translation?: string;
  timestamp: Date;
  corrections?: { original: string; corrected: string; note: string }[];
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  level: string;
  systemPrompt: string;
  starterMessages: string[];
  color: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "cafe",
    title: "Tại quán cà phê",
    description: "Gọi đồ uống, hỏi giá, thanh toán",
    icon: "ri-cup-line",
    level: "A1",
    color: "amber",
    systemPrompt: "Bạn là nhân viên quán cà phê Hàn Quốc. Hãy trả lời bằng tiếng Hàn đơn giản, phù hợp A1-A2.",
    starterMessages: ["어서 오세요! 뭘 드릴까요?", "안녕하세요! 주문하시겠어요?"],
  },
  {
    id: "shopping",
    title: "Mua sắm",
    description: "Hỏi giá, mặc cả, thanh toán",
    icon: "ri-shopping-bag-line",
    level: "A2",
    color: "teal",
    systemPrompt: "Bạn là nhân viên cửa hàng Hàn Quốc. Hãy trả lời bằng tiếng Hàn phù hợp A2.",
    starterMessages: ["어서 오세요! 찾으시는 게 있으세요?", "안녕하세요! 도와드릴까요?"],
  },
  {
    id: "directions",
    title: "Hỏi đường",
    description: "Hỏi và chỉ đường, phương tiện",
    icon: "ri-map-pin-line",
    level: "A2",
    color: "emerald",
    systemPrompt: "Bạn là người dân Seoul. Hãy giúp hỏi đường bằng tiếng Hàn phù hợp A2-B1.",
    starterMessages: ["안녕하세요! 어디 가세요?", "실례합니다. 도와드릴까요?"],
  },
  {
    id: "restaurant",
    title: "Nhà hàng",
    description: "Đặt bàn, gọi món, phàn nàn",
    icon: "ri-restaurant-line",
    level: "B1",
    color: "orange",
    systemPrompt: "Bạn là nhân viên nhà hàng Hàn Quốc. Hãy trả lời bằng tiếng Hàn phù hợp B1.",
    starterMessages: ["어서 오세요! 몇 분이세요?", "예약하셨나요?"],
  },
  {
    id: "job_interview",
    title: "Phỏng vấn xin việc",
    description: "Tự giới thiệu, trả lời câu hỏi",
    icon: "ri-briefcase-line",
    level: "B2",
    color: "violet",
    systemPrompt: "Bạn là nhà tuyển dụng Hàn Quốc. Hãy phỏng vấn bằng tiếng Hàn phù hợp B2.",
    starterMessages: ["안녕하세요. 자기소개 해주세요.", "오늘 면접에 오셨군요. 앉으세요."],
  },
  {
    id: "free_talk",
    title: "Trò chuyện tự do",
    description: "Nói chuyện về bất kỳ chủ đề nào",
    icon: "ri-chat-smile-3-line",
    level: "A1-C1",
    color: "yellow",
    systemPrompt: "Bạn là người bạn Hàn Quốc thân thiện. Hãy trò chuyện tự nhiên bằng tiếng Hàn.",
    starterMessages: ["안녕하세요! 오늘 어떠세요?", "반가워요! 한국어 공부하고 있어요?"],
  },
];

const AI_RESPONSES: Record<string, string[]> = {
  cafe: [
    "네, 아메리카노 한 잔이요? 따뜻하게 드릴까요, 아이스로 드릴까요?",
    "라떼는 5,500원이에요. 사이즈는 어떻게 하시겠어요?",
    "카드로 결제하시겠어요? 영수증 드릴까요?",
    "잠깐만 기다려 주세요. 금방 나와요!",
    "감사합니다! 맛있게 드세요~",
  ],
  shopping: [
    "이 옷은 39,000원이에요. 다른 색깔도 있어요.",
    "사이즈가 어떻게 되세요? 입어 보시겠어요?",
    "지금 세일 중이에요. 20% 할인이에요!",
    "카드 되고요, 현금도 돼요.",
    "교환이나 환불은 7일 이내에 가능해요.",
  ],
  directions: [
    "지하철 2호선 타시면 돼요. 세 정거장이에요.",
    "여기서 걸어서 10분 정도 걸려요.",
    "저 건물 옆에 있어요. 찾기 쉬워요!",
    "버스 143번 타시면 바로 가요.",
    "죄송해요, 저도 잘 몰라요. 지도 앱 써보세요.",
  ],
  restaurant: [
    "네, 두 분이시군요. 이쪽으로 오세요.",
    "오늘의 추천 메뉴는 삼겹살이에요. 맛있어요!",
    "주문 받아도 될까요? 뭘 드시겠어요?",
    "잠깐만요, 바로 가져다 드릴게요.",
    "맛있게 드셨나요? 계산서 드릴까요?",
  ],
  job_interview: [
    "네, 잘 들었어요. 왜 우리 회사에 지원하셨나요?",
    "장점과 단점을 말씀해 주시겠어요?",
    "한국어 실력이 어느 정도 되세요?",
    "언제부터 일하실 수 있으세요?",
    "질문 있으시면 말씀해 주세요.",
  ],
  free_talk: [
    "오, 정말요? 저도 그거 좋아해요!",
    "한국어 공부한 지 얼마나 됐어요?",
    "한국 음식 중에 뭘 제일 좋아해요?",
    "요즘 날씨가 너무 좋죠? 어디 가고 싶어요?",
    "한국에 와 본 적 있어요? 어땠어요?",
  ],
};

const QUICK_PHRASES: Record<string, string[]> = {
  cafe: ["아메리카노 주세요", "얼마예요?", "카드 돼요?", "감사합니다"],
  shopping: ["이거 얼마예요?", "입어봐도 돼요?", "다른 색 있어요?", "깎아주세요"],
  directions: ["지하철역이 어디예요?", "걸어서 얼마나 걸려요?", "버스 타면 돼요?", "감사합니다"],
  restaurant: ["메뉴판 주세요", "이거 주세요", "맛있어요!", "계산해 주세요"],
  job_interview: ["잘 부탁드립니다", "열심히 하겠습니다", "질문 있어요", "감사합니다"],
  free_talk: ["안녕하세요!", "잘 모르겠어요", "다시 말해주세요", "재미있어요!"],
};

const TRANSLATIONS: Record<string, string> = {
  "아메리카노 주세요": "Cho tôi một ly americano",
  "얼마예요?": "Bao nhiêu tiền?",
  "카드 돼요?": "Thanh toán thẻ được không?",
  "감사합니다": "Cảm ơn",
  "이거 얼마예요?": "Cái này bao nhiêu tiền?",
  "입어봐도 돼요?": "Tôi có thể thử không?",
  "다른 색 있어요?": "Có màu khác không?",
  "깎아주세요": "Giảm giá cho tôi",
  "지하철역이 어디예요?": "Ga tàu điện ngầm ở đâu?",
  "걸어서 얼마나 걸려요?": "Đi bộ mất bao lâu?",
  "버스 타면 돼요?": "Đi xe buýt được không?",
  "메뉴판 주세요": "Cho tôi xem thực đơn",
  "이거 주세요": "Cho tôi cái này",
  "맛있어요!": "Ngon quá!",
  "계산해 주세요": "Tính tiền cho tôi",
  "잘 부탁드립니다": "Xin nhờ bạn nhiều",
  "열심히 하겠습니다": "Tôi sẽ cố gắng hết sức",
  "질문 있어요": "Tôi có câu hỏi",
  "안녕하세요!": "Xin chào!",
  "잘 모르겠어요": "Tôi không biết lắm",
  "다시 말해주세요": "Nói lại cho tôi nghe",
  "재미있어요!": "Thú vị quá!",
};

const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  amber: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30", light: "bg-amber-500/10" },
  teal: { bg: "bg-teal-500/20", text: "text-teal-400", border: "border-teal-500/30", light: "bg-teal-500/10" },
  emerald: { bg: "bg-emerald-500/20", text: "text-app-accent-success", border: "border-emerald-500/30", light: "bg-emerald-500/10" },
  orange: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30", light: "bg-orange-500/10" },
  violet: { bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30", light: "bg-violet-500/10" },
  yellow: { bg: "bg-app-accent-primary/20", text: "text-app-accent-primary", border: "border-app-accent-primary/30", light: "bg-app-accent-primary/10" },
};

const levelColor: Record<string, string> = {
  "A1": "text-app-accent-success", "A2": "text-teal-400", "B1": "text-amber-400",
  "B2": "text-orange-400", "A1-C1": "text-app-accent-primary",
};

export default function AIChatbotPage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTranslation, setShowTranslation] = useState<Set<string>>(new Set());
  const [sessionStats, setSessionStats] = useState({ messages: 0, corrections: 0, duration: 0 });
  const [startTime, setStartTime] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([]);
    setSessionStats({ messages: 0, corrections: 0, duration: 0 });
    const now = new Date();
    setStartTime(now);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSessionStats(prev => ({ ...prev, duration: prev.duration + 1 }));
    }, 1000);

    const starter = scenario.starterMessages[Math.floor(Math.random() * scenario.starterMessages.length)];
    setTimeout(() => {
      setMessages([{
        id: "init",
        role: "ai",
        text: starter,
        translation: undefined,
        timestamp: new Date(),
      }]);
    }, 500);
    setTimeout(() => inputRef.current?.focus(), 600);
  };

  const getAIResponse = useCallback((scenarioId: string, userText: string): string => {
    const responses = AI_RESPONSES[scenarioId] || AI_RESPONSES.free_talk;
    const hasKorean = /[가-힣]/.test(userText);
    if (!hasKorean) {
      return "한국어로 말해 주세요! 연습이 중요해요. 😊";
    }
    return responses[Math.floor(Math.random() * responses.length)];
  }, []);

  const getCorrections = (text: string): { original: string; corrected: string; note: string }[] => {
    const corrections = [];
    if (text.includes("주세요") && !text.includes("을") && !text.includes("를") && text.length > 5) {
      // Simulate occasional correction
      if (Math.random() > 0.7) {
        corrections.push({ original: text, corrected: text, note: "문장이 자연스러워요! 잘 했어요." });
      }
    }
    return corrections;
  };

  const sendMessage = useCallback(() => {
    if (!input.trim() || !selectedScenario || isTyping) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
      timestamp: new Date(),
      corrections: getCorrections(input.trim()),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSessionStats(prev => ({ ...prev, messages: prev.messages + 1 }));
    setIsTyping(true);

    setTimeout(() => {
      const aiText = getAIResponse(selectedScenario.id, input.trim());
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: aiText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  }, [input, selectedScenario, isTyping, getAIResponse]);

  const sendQuickPhrase = (phrase: string) => {
    if (!selectedScenario || isTyping) return;
    setInput(phrase);
    setTimeout(() => {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        text: phrase,
        translation: TRANSLATIONS[phrase],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      setInput("");
      setSessionStats(prev => ({ ...prev, messages: prev.messages + 1 }));
      setIsTyping(true);
      setTimeout(() => {
        const aiText = getAIResponse(selectedScenario.id, phrase);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "ai", text: aiText, timestamp: new Date() }]);
        setIsTyping(false);
      }, 800);
    }, 50);
  };

  const toggleTranslation = (id: string) => {
    setShowTranslation(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  const playTTS = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR"; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const formatDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const endSession = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelectedScenario(null);
    setMessages([]);
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">AI Chatbot Tiếng Hàn</h1>
            <p className="text-white/50 text-sm mt-1">Luyện giao tiếp tiếng Hàn với AI theo tình huống thực tế</p>
          </div>
        </div>

        {!selectedScenario ? (
          <div className="space-y-4">
            <p className="text-white/50 text-sm">Chọn tình huống để bắt đầu luyện tập:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SCENARIOS.map(scenario => {
                const colors = colorMap[scenario.color];
                return (
                  <button
                    key={scenario.id}
                    onClick={() => startScenario(scenario)}
                    className="bg-[#1a1f2e] rounded-xl p-5 border border-app-border hover:border-white/20 transition-all cursor-pointer text-left group"
                  >
                    <div className={`w-12 h-12 rounded-xl ${colors.light} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <i className={`${scenario.icon} ${colors.text} text-xl`}></i>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-sm">{scenario.title}</h3>
                      <span className={`text-[10px] font-bold ${levelColor[scenario.level]}`}>{scenario.level}</span>
                    </div>
                    <p className="text-app-text-secondary text-xs">{scenario.description}</p>
                    <div className={`mt-3 flex items-center gap-1 ${colors.text} text-xs font-semibold`}>
                      <i className="ri-play-circle-line"></i>
                      Bắt đầu
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4">
              <h3 className="text-app-accent-primary text-sm font-semibold mb-2"><i className="ri-lightbulb-line mr-1.5"></i>Mẹo luyện tập</h3>
              <ul className="space-y-1 text-white/50 text-xs">
                <li>• Cố gắng viết bằng tiếng Hàn, không dùng tiếng Việt</li>
                <li>• Dùng Quick Phrases để học câu mẫu nhanh</li>
                <li>• Nhấn nút loa để nghe phát âm chuẩn</li>
                <li>• Nhấn nút dịch để xem nghĩa tiếng Việt</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Chat area */}
            <div className="lg:col-span-3 flex flex-col bg-[#1a1f2e] rounded-xl border border-app-border overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}>
              {/* Chat header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-app-border flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${colorMap[selectedScenario.color].light} flex items-center justify-center`}>
                    <i className={`${selectedScenario.icon} ${colorMap[selectedScenario.color].text} text-base`}></i>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{selectedScenario.title}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                      <span className="text-app-text-muted text-xs">AI đang hoạt động</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-white/50 text-xs">{formatDuration(sessionStats.duration)}</p>
                    <p className="text-app-text-muted text-[10px]">{sessionStats.messages} tin nhắn</p>
                  </div>
                  <button onClick={endSession} className="px-3 py-1.5 rounded-lg bg-white/8 text-white/50 text-xs hover:bg-white/12 transition-all cursor-pointer whitespace-nowrap">
                    <i className="ri-stop-circle-line mr-1"></i>Kết thúc
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "ai" ? `${colorMap[selectedScenario.color].light}` : "bg-app-card/70"
                    }`}>
                      <i className={`text-sm ${msg.role === "ai" ? `${colorMap[selectedScenario.color].text} ri-robot-line` : "text-white/60 ri-user-line"}`}></i>
                    </div>
                    <div className={`max-w-xs lg:max-w-md space-y-1 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "ai"
                          ? "bg-white/8 text-white/85 rounded-tl-sm"
                          : `${colorMap[selectedScenario.color].bg} ${colorMap[selectedScenario.color].text} rounded-tr-sm`
                      }`}>
                        {msg.text}
                      </div>
                      {showTranslation.has(msg.id) && msg.translation && (
                        <p className="text-app-text-secondary text-xs italic px-1">{msg.translation}</p>
                      )}
                      <div className={`flex items-center gap-1.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                        <button onClick={() => playTTS(msg.text)} className="text-app-text-muted hover:text-white/50 cursor-pointer transition-colors">
                          <i className="ri-volume-up-line text-xs"></i>
                        </button>
                        <button onClick={() => toggleTranslation(msg.id)} className="text-app-text-muted hover:text-white/50 cursor-pointer transition-colors">
                          <i className="ri-translate-2 text-xs"></i>
                        </button>
                        <span className="text-white/15 text-[10px]">{msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full ${colorMap[selectedScenario.color].light} flex items-center justify-center`}>
                      <i className={`ri-robot-line text-sm ${colorMap[selectedScenario.color].text}`}></i>
                    </div>
                    <div className="bg-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick phrases */}
              <div className="px-4 py-2 border-t border-app-border flex gap-2 overflow-x-auto flex-shrink-0">
                {(QUICK_PHRASES[selectedScenario.id] || []).map(phrase => (
                  <button
                    key={phrase}
                    onClick={() => sendQuickPhrase(phrase)}
                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${colorMap[selectedScenario.color].light} ${colorMap[selectedScenario.color].text} hover:opacity-80`}
                  >
                    {phrase}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-app-border flex gap-2 flex-shrink-0">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="한국어로 입력하세요... (Nhập tiếng Hàn)"
                  className="flex-1 bg-app-card/50 border border-app-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isTyping}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer whitespace-nowrap disabled:opacity-40 ${colorMap[selectedScenario.color].bg} ${colorMap[selectedScenario.color].text}`}
                >
                  <i className="ri-send-plane-fill"></i>
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-app-border">
                <h3 className="text-white/70 text-sm font-semibold mb-3">Thống kê phiên</h3>
                <div className="space-y-2">
                  {[
                    { label: "Thời gian", value: formatDuration(sessionStats.duration), icon: "ri-time-line" },
                    { label: "Tin nhắn", value: sessionStats.messages, icon: "ri-chat-3-line" },
                    { label: "Tình huống", value: selectedScenario.title, icon: "ri-map-pin-line" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-app-text-secondary text-xs">
                        <i className={`${item.icon} text-sm`}></i>
                        {item.label}
                      </div>
                      <span className="text-white/70 text-xs font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-app-border">
                <h3 className="text-white/70 text-sm font-semibold mb-3">Đổi tình huống</h3>
                <div className="space-y-1">
                  {SCENARIOS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => startScenario(s)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer text-left ${
                        selectedScenario.id === s.id ? `${colorMap[s.color].light} ${colorMap[s.color].text}` : "text-app-text-secondary hover:bg-app-card/50"
                      }`}
                    >
                      <i className={`${s.icon} text-sm`}></i>
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-app-accent-primary/5 border border-app-accent-primary/15 rounded-xl p-4">
                <h3 className="text-app-accent-primary text-xs font-semibold mb-2"><i className="ri-lightbulb-line mr-1"></i>Mẹo</h3>
                <p className="text-app-text-secondary text-xs">Nhấn nút dịch 🌐 để xem nghĩa tiếng Việt của từng tin nhắn</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
