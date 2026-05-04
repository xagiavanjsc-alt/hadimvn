import { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { epsQuestions, EPS_TOPICS } from "@/mocks/epsQuestions";

interface ChallengeRecord {
  id: string;
  createdAt: string;
  topicId: string;
  questionCount: number;
  creatorScore: number;
  creatorTotal: number;
  creatorName: string;
  challengerScore?: number;
  challengerName?: string;
  completedAt?: string;
}

// ─── Challenge Quiz ───────────────────────────────────────────────────────
function ChallengeQuiz({ challenge, onComplete }: {
  challenge: ChallengeRecord;
  onComplete: (score: number) => void;
}) {
  const questions = useMemo(() => {
    const topicQs = epsQuestions.filter(q => q.topic === challenge.topicId);
    return topicQs.slice(0, challenge.questionCount);
  }, [challenge]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [answered, setAnswered] = useState<number | null>(null);

  const currentQ = questions[currentIdx];
  const score = questions.filter(q => answers[q.id] === q.correctIndex).length;

  const handleAnswer = useCallback((i: number) => {
    if (answered !== null || !currentQ) return;
    setAnswered(i);
    setAnswers(prev => ({ ...prev, [currentQ.id]: i }));
    setTimeout(() => {
      if (currentIdx + 1 >= questions.length) {
        const finalScore = questions.filter((q, idx) => {
          const ans = idx === currentIdx ? i : answers[q.id];
          return ans === q.correctIndex;
        }).length;
        onComplete(finalScore);
      } else {
        setCurrentIdx(idx => idx + 1);
        setAnswered(null);
      }
    }, 1000);
  }, [answered, currentQ, currentIdx, questions, answers]);

  if (!currentQ) return null;

  const topic = EPS_TOPICS.find(t => t.id === challenge.topicId);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <div className="bg-gradient-to-r from-[#1a0800] to-[#0f1117] border border-[#fb923c]/20 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#fb923c]/15">
            <i className="ri-sword-line text-[#fb923c] text-base"></i>
          </div>
          <div>
            <p className="text-white font-bold text-sm">Thử thách từ {challenge.creatorName}</p>
            <p className="text-app-text-secondary text-xs">Điểm cần vượt: <span className="text-[#fb923c] font-bold">{challenge.creatorScore}/{challenge.creatorTotal}</span> ({Math.round((challenge.creatorScore / challenge.creatorTotal) * 100)}%)</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-app-card/50 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-[#fb923c] transition-all" style={{ width: `${(currentIdx / questions.length) * 100}%` }} />
        </div>
        <span className="text-app-text-muted text-xs whitespace-nowrap">{currentIdx + 1}/{questions.length}</span>
      </div>

      <div className="bg-app-bg border border-app-border rounded-2xl p-6">
        {topic && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${topic.color}15`, color: topic.color }}>
              <i className={`${topic.icon} mr-1`}></i>{topic.label}
            </span>
          </div>
        )}
        <p className="text-white font-semibold text-sm leading-relaxed mb-1">{currentQ.question}</p>
        <p className="text-app-text-secondary text-xs italic mb-4">{currentQ.questionVi}</p>
        <div className="space-y-2">
          {currentQ.options.map((opt, i) => {
            let cls = "border-app-border bg-app-surface/50 hover:border-white/15 cursor-pointer";
            if (answered !== null) {
              if (i === currentQ.correctIndex) cls = "border-emerald-500/40 bg-emerald-500/10 cursor-default";
              else if (i === answered) cls = "border-red-500/40 bg-red-500/10 cursor-default";
              else cls = "border-app-border opacity-40 cursor-default";
            }
            return (
              <button key={i} onClick={() => handleAnswer(i)} disabled={answered !== null}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${cls}`}>
                <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-bold flex-shrink-0 ${answered !== null && i === currentQ.correctIndex ? "bg-emerald-500/20 text-app-accent-success" : answered !== null && i === answered ? "bg-red-500/20 text-red-400" : "bg-app-card/50 text-app-text-muted"}`}>
                  {["A","B","C","D"][i]}
                </span>
                <div>
                  <p className={`text-sm ${answered !== null && i === currentQ.correctIndex ? "text-app-accent-success" : answered !== null && i === answered ? "text-red-400" : "text-white/70"}`}>{opt}</p>
                  <p className="text-app-text-muted text-[10px]">{currentQ.optionsVi[i]}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Create Challenge ─────────────────────────────────────────────────────
function CreateChallenge({ onCreated }: { onCreated: (c: ChallengeRecord) => void }) {
  const [selectedTopic, setSelectedTopic] = useState(EPS_TOPICS[0].id);
  const [questionCount, setQuestionCount] = useState(5);
  const [creatorName, setCreatorName] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [challenge, setChallenge] = useState<ChallengeRecord | null>(null);

  const handleStartQuiz = () => {
    if (!creatorName.trim()) return;
    const newChallenge: ChallengeRecord = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
      topicId: selectedTopic,
      questionCount,
      creatorScore: 0,
      creatorTotal: questionCount,
      creatorName: creatorName.trim(),
    };
    setChallenge(newChallenge);
    setQuizStarted(true);
  };

  const handleComplete = (score: number) => {
    if (!challenge) return;
    const completed = { ...challenge, creatorScore: score };
    onCreated(completed);
  };

  if (quizStarted && challenge) {
    return <ChallengeQuiz challenge={challenge} onComplete={handleComplete} />;
  }

  const topic = EPS_TOPICS.find(t => t.id === selectedTopic);

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-app-bg border border-app-border rounded-2xl p-6 space-y-5">
        <div className="text-center mb-2">
          <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#fb923c]/15 mx-auto mb-3">
            <i className="ri-sword-line text-[#fb923c] text-2xl"></i>
          </div>
          <h2 className="text-white font-bold text-lg">Tạo thử thách mới</h2>
          <p className="text-app-text-secondary text-sm mt-1">Làm quiz trước, rồi gửi link cho bạn bè thách đấu!</p>
        </div>

        <div>
          <label className="text-app-text-secondary text-xs font-medium block mb-2">Tên của bạn</label>
          <input value={creatorName} onChange={e => setCreatorName(e.target.value)}
            placeholder="Nhập tên để bạn bè biết ai thách đấu..."
            className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#fb923c]/40 placeholder-white/20" />
        </div>

        <div>
          <label className="text-app-text-secondary text-xs font-medium block mb-2">Chủ đề EPS</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {EPS_TOPICS.map(t => (
              <button key={t.id} onClick={() => setSelectedTopic(t.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${selectedTopic === t.id ? "border" : "border-app-border bg-app-surface/50 text-white/50 hover:bg-app-card/50"}`}
                style={selectedTopic === t.id ? { backgroundColor: `${t.color}15`, borderColor: `${t.color}30`, color: t.color } : {}}>
                <i className={`${t.icon} text-sm flex-shrink-0`} style={{ color: selectedTopic === t.id ? t.color : undefined }}></i>
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-app-text-secondary text-xs font-medium block mb-2">Số câu hỏi</label>
          <div className="flex gap-2">
            {[5, 10, 15].map(n => (
              <button key={n} onClick={() => setQuestionCount(n)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${questionCount === n ? "border-[#fb923c]/40 bg-[#fb923c]/10 text-[#fb923c]" : "border-app-border bg-app-surface/50 text-app-text-secondary hover:border-white/15"}`}>
                {n} câu
              </button>
            ))}
          </div>
        </div>

        {topic && (
          <div className="flex items-center gap-2 p-3 rounded-xl border" style={{ backgroundColor: `${topic.color}08`, borderColor: `${topic.color}20` }}>
            <i className={`${topic.icon} text-sm`} style={{ color: topic.color }}></i>
            <span className="text-white/60 text-xs">Chủ đề: <strong style={{ color: topic.color }}>{topic.label}</strong> · {questionCount} câu</span>
          </div>
        )}

        <button onClick={handleStartQuiz} disabled={!creatorName.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#fb923c] hover:bg-[#ea7c1e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-play-line"></i>Bắt đầu làm quiz
        </button>
      </div>
    </div>
  );
}

// ─── Challenge Result & Share ─────────────────────────────────────────────
function ChallengeResult({ challenge, onNew }: { challenge: ChallengeRecord; onNew: () => void }) {
  const [copied, setCopied] = useState(false);
  const pct = Math.round((challenge.creatorScore / challenge.creatorTotal) * 100);
  const color = pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#fb923c";

  const challengeUrl = `${window.location.origin}/challenge?id=${challenge.id}`;

  const handleCopy = async () => {
    const text = `🔥 ${challenge.creatorName} thách đấu bạn!\n\nMình vừa đạt ${pct}% (${challenge.creatorScore}/${challenge.creatorTotal} câu) trong quiz EPS-TOPIK.\nBạn có thể vượt qua không?\n\n👉 ${challengeUrl}\n\n#HànQuốcƠi #EPSTopik #ThửThách`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(challengeUrl)}`, "_blank", "width=600,height=400");
  };

  const shareToZalo = () => {
    window.open(`https://zalo.me/share?url=${encodeURIComponent(challengeUrl)}`, "_blank", "width=600,height=400");
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
        <div className="w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-4" style={{ backgroundColor: `${color}15` }}>
          <i className={`${pct >= 80 ? "ri-trophy-line" : "ri-sword-line"} text-3xl`} style={{ color }}></i>
        </div>
        <h2 className="text-white font-bold text-2xl mb-1">Điểm của bạn</h2>
        <p className="text-5xl font-black mb-2" style={{ color }}>{pct}%</p>
        <p className="text-app-text-secondary text-sm mb-4">{challenge.creatorScore}/{challenge.creatorTotal} câu đúng</p>
        <div className="w-full max-w-xs mx-auto h-2 bg-app-card/50 rounded-full overflow-hidden mb-6">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        <p className="text-white/50 text-sm">Thử thách đã được tạo! Gửi link cho bạn bè để họ thách đấu.</p>
      </div>

      <div className="bg-app-bg border border-app-border rounded-2xl p-5">
        <h3 className="text-white font-bold text-sm mb-3">Chia sẻ thử thách</h3>
        <div className="bg-app-surface/50 border border-app-border rounded-xl p-3 mb-4">
          <p className="text-white/50 text-xs break-all">{challengeUrl}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button onClick={shareToFacebook}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1877f2]/10 border border-[#1877f2]/25 text-[#1877f2] text-sm font-medium cursor-pointer hover:bg-[#1877f2]/20 transition-all whitespace-nowrap">
            <i className="ri-facebook-fill text-base"></i>Facebook
          </button>
          <button onClick={shareToZalo}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0068ff]/10 border border-[#0068ff]/25 text-[#0068ff] text-sm font-medium cursor-pointer hover:bg-[#0068ff]/20 transition-all whitespace-nowrap">
            <i className="ri-message-2-fill text-base"></i>Zalo
          </button>
        </div>
        <button onClick={handleCopy}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-all whitespace-nowrap ${copied ? "bg-[#34d399]/10 border-[#34d399]/20 text-[#34d399]" : "bg-app-card/50 border-app-border text-white/60 hover:bg-app-card/70"}`}>
          <i className={`${copied ? "ri-check-line" : "ri-file-copy-line"} text-base`}></i>
          {copied ? "Đã sao chép!" : "Sao chép link + nội dung"}
        </button>
      </div>

      <button onClick={onNew}
        className="w-full py-3 rounded-xl border border-app-border text-white/50 text-sm cursor-pointer whitespace-nowrap hover:bg-app-card/50 transition-colors">
        Tạo thử thách mới
      </button>
    </div>
  );
}

// ─── Accept Challenge ─────────────────────────────────────────────────────
function AcceptChallenge({ challengeId, challenges }: { challengeId: string; challenges: ChallengeRecord[] }) {
  const challenge = challenges.find(c => c.id === challengeId);
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [myScore, setMyScore] = useState(0);
  const [myName, setMyName] = useState("");

  if (!challenge) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <i className="ri-error-warning-line text-app-text-muted text-5xl mb-4"></i>
        <p className="text-app-text-secondary text-sm">Không tìm thấy thử thách này</p>
        <p className="text-app-text-muted text-xs mt-2">Link có thể đã hết hạn hoặc không hợp lệ</p>
      </div>
    );
  }

  const creatorPct = Math.round((challenge.creatorScore / challenge.creatorTotal) * 100);

  if (phase === "intro") {
    const topic = EPS_TOPICS.find(t => t.id === challenge.topicId);
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-[#1a0800] to-[#0f1117] border border-[#fb923c]/20 rounded-2xl p-8 text-center mb-4">
          <div className="text-4xl mb-4">⚔️</div>
          <h2 className="text-white font-black text-2xl mb-2">{challenge.creatorName} thách đấu bạn!</h2>
          <p className="text-white/50 text-sm mb-5">Họ đã đạt <span className="text-[#fb923c] font-bold">{creatorPct}%</span> ({challenge.creatorScore}/{challenge.creatorTotal} câu). Bạn có thể vượt qua không?</p>
          {topic && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border mb-5" style={{ backgroundColor: `${topic.color}10`, borderColor: `${topic.color}25` }}>
              <i className={`${topic.icon} text-sm`} style={{ color: topic.color }}></i>
              <span className="text-white/70 text-sm">{topic.label} · {challenge.questionCount} câu</span>
            </div>
          )}
          <input value={myName} onChange={e => setMyName(e.target.value)}
            placeholder="Nhập tên của bạn..."
            className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#fb923c]/40 placeholder-white/20 mb-4" />
          <button onClick={() => setPhase("quiz")} disabled={!myName.trim()}
            className="w-full py-3.5 rounded-xl bg-[#fb923c] hover:bg-[#ea7c1e] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-sword-line mr-2"></i>Chấp nhận thử thách!
          </button>
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    return <ChallengeQuiz challenge={challenge} onComplete={(score) => { setMyScore(score); setPhase("result"); }} />;
  }

  // Result
  const myPct = Math.round((myScore / challenge.questionCount) * 100);
  const won = myScore > challenge.creatorScore;
  const tied = myScore === challenge.creatorScore;
  const resultColor = won ? "#34d399" : tied ? "app-accent-primary" : "#f87171";

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-app-bg border border-app-border rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">{won ? "🏆" : tied ? "🤝" : "💪"}</div>
        <h2 className="text-white font-black text-2xl mb-4" style={{ color: resultColor }}>
          {won ? "Bạn thắng!" : tied ? "Hòa nhau!" : "Thua rồi!"}
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-app-surface/50 rounded-xl p-4">
            <p className="text-app-text-secondary text-xs mb-1">{myName}</p>
            <p className="font-black text-3xl" style={{ color: resultColor }}>{myPct}%</p>
            <p className="text-app-text-muted text-xs">{myScore}/{challenge.questionCount} câu</p>
          </div>
          <div className="bg-app-surface/50 rounded-xl p-4">
            <p className="text-app-text-secondary text-xs mb-1">{challenge.creatorName}</p>
            <p className="font-black text-3xl text-white/60">{creatorPct}%</p>
            <p className="text-app-text-muted text-xs">{challenge.creatorScore}/{challenge.creatorTotal} câu</p>
          </div>
        </div>
        <p className="text-app-text-secondary text-sm">
          {won ? `Xuất sắc! Bạn vượt qua ${challenge.creatorName} rồi!` : tied ? "Hai bên ngang tài ngang sức!" : `Cố lên! Luyện thêm để vượt qua ${challenge.creatorName}!`}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function ChallengePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get("id");
  const [challenges, setChallenges] = useLocalStorage<ChallengeRecord[]>("kts_challenges", []);
  const [phase, setPhase] = useState<"list" | "create" | "result">("list");
  const [createdChallenge, setCreatedChallenge] = useState<ChallengeRecord | null>(null);

  const handleCreated = (c: ChallengeRecord) => {
    setChallenges(prev => [c, ...prev]);
    setCreatedChallenge(c);
    setPhase("result");
  };

  // If URL has challenge ID → accept mode
  if (challengeId) {
    return (
      <DashboardLayout title="Thử thách bạn bè" subtitle="Ai sẽ đạt điểm cao hơn?">
        <AcceptChallenge challengeId={challengeId} challenges={challenges} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Thử thách bạn bè"
      subtitle="Tạo quiz thách đấu — gửi link cho bạn bè so sánh điểm"
      actions={
        phase === "list" ? (
          <button onClick={() => setPhase("create")}
            className="flex items-center gap-2 bg-[#fb923c] hover:bg-[#ea7c1e] text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap">
            <i className="ri-add-line"></i>Tạo thử thách
          </button>
        ) : undefined
      }
    >
      {phase === "create" && (
        <div>
          <button onClick={() => setPhase("list")} className="flex items-center gap-2 text-white/50 hover:text-white text-sm cursor-pointer whitespace-nowrap mb-5 transition-colors">
            <i className="ri-arrow-left-line"></i>Quay lại
          </button>
          <CreateChallenge onCreated={handleCreated} />
        </div>
      )}

      {phase === "result" && createdChallenge && (
        <div>
          <ChallengeResult challenge={createdChallenge} onNew={() => { setCreatedChallenge(null); setPhase("create"); }} />
        </div>
      )}

      {phase === "list" && (
        <div className="space-y-6">
          {/* Hero */}
          <div className="bg-gradient-to-r from-[#1a0800] to-[#0f1117] border border-[#fb923c]/15 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-[#fb923c]/15">
                <i className="ri-sword-line text-[#fb923c] text-2xl"></i>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">Thử thách bạn bè</h2>
                <p className="text-app-text-secondary text-sm">Làm quiz EPS-TOPIK → gửi link → so sánh điểm</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: "ri-play-circle-line", color: "#fb923c", label: "Bước 1", desc: "Làm quiz trước" },
                { icon: "ri-share-line", color: "app-accent-primary", label: "Bước 2", desc: "Gửi link cho bạn" },
                { icon: "ri-trophy-line", color: "#34d399", label: "Bước 3", desc: "So sánh điểm số" },
              ].map(s => (
                <div key={s.label} className="bg-app-surface/50 rounded-xl p-3 text-center">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg mx-auto mb-2" style={{ backgroundColor: `${s.color}15` }}>
                    <i className={`${s.icon} text-sm`} style={{ color: s.color }}></i>
                  </div>
                  <p className="text-white/60 text-xs font-semibold">{s.label}</p>
                  <p className="text-app-text-muted text-[10px]">{s.desc}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setPhase("create")}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#fb923c] hover:bg-[#ea7c1e] text-white font-bold text-sm transition-colors cursor-pointer whitespace-nowrap">
              <i className="ri-sword-line"></i>Tạo thử thách ngay
            </button>
          </div>

          {/* History */}
          {challenges.length > 0 && (
            <div className="bg-app-bg border border-app-border rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-4">Lịch sử thử thách ({challenges.length})</h3>
              <div className="space-y-3">
                {challenges.slice(0, 10).map(c => {
                  const pct = Math.round((c.creatorScore / c.creatorTotal) * 100);
                  const color = pct >= 80 ? "#34d399" : pct >= 60 ? "app-accent-primary" : "#fb923c";
                  const topic = EPS_TOPICS.find(t => t.id === c.topicId);
                  return (
                    <div key={c.id} className="flex items-center gap-3 p-3 bg-app-surface/50 rounded-xl border border-app-border">
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                        <span className="font-bold text-sm" style={{ color }}>{pct}%</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/70 text-sm font-medium truncate">{topic?.label || c.topicId}</p>
                        <p className="text-app-text-muted text-xs">{c.creatorScore}/{c.creatorTotal} câu · {new Date(c.createdAt).toLocaleDateString("vi-VN")}</p>
                      </div>
                      <button
                        onClick={async () => {
                          const url = `${window.location.origin}/challenge?id=${c.id}`;
                          await navigator.clipboard.writeText(url);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary hover:text-white/70 text-xs cursor-pointer whitespace-nowrap transition-colors">
                        <i className="ri-link-m text-xs"></i>Copy link
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {challenges.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <i className="ri-sword-line text-white/10 text-5xl mb-4"></i>
              <p className="text-app-text-muted text-sm">Chưa có thử thách nào</p>
              <p className="text-app-text-muted text-xs mt-1">Tạo thử thách đầu tiên và gửi cho bạn bè!</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}

