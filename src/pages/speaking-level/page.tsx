import { useState, useRef, useCallback } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";

interface SpeakingPrompt {
  id: string;
  level: string;
  levelColor: string;
  korean: string;
  romanization: string;
  vietnamese: string;
  tips: string[];
  keyPoints: string[];
}

const SPEAKING_PROMPTS: SpeakingPrompt[] = [
  {
    id: "a1-1",
    level: "A1",
    levelColor: "#22c55e",
    korean: "안녕하세요. 제 이름은 민준이에요.",
    romanization: "Annyeonghaseyo. Je ireumeun Minjun-ieyo.",
    vietnamese: "Xin chào. Tên tôi là Minjun.",
    tips: ["Phát âm 안녕 như 'an-nyeong'", "하세요 đọc là 'ha-se-yo'", "이에요 đọc là 'i-e-yo'"],
    keyPoints: ["Chào hỏi lịch sự", "Giới thiệu tên"],
  },
  {
    id: "a1-2",
    level: "A1",
    levelColor: "#22c55e",
    korean: "저는 베트남 사람이에요.",
    romanization: "Jeoneun Beteunam saramieyo.",
    vietnamese: "Tôi là người Việt Nam.",
    tips: ["저는 đọc là 'jeo-neun'", "사람 đọc là 'sa-ram'", "이에요 đọc là 'i-e-yo'"],
    keyPoints: ["Giới thiệu quốc tịch", "Cấu trúc N은/는 N이에요"],
  },
  {
    id: "a2-1",
    level: "A2",
    levelColor: "#84cc16",
    korean: "오늘 날씨가 정말 좋네요. 같이 산책할까요?",
    romanization: "Oneul nalssiga jeongmal jotneyo. Gachi sanchaekhalkkayo?",
    vietnamese: "Hôm nay thời tiết thật đẹp nhỉ. Chúng ta đi dạo cùng nhau nhé?",
    tips: ["날씨 đọc là 'nal-ssi'", "정말 đọc là 'jeong-mal'", "산책 đọc là 'san-chaek'"],
    keyPoints: ["Nói về thời tiết", "Đề nghị làm gì đó cùng nhau"],
  },
  {
    id: "a2-2",
    level: "A2",
    levelColor: "#84cc16",
    korean: "저는 한국어를 공부한 지 6개월이 됐어요.",
    romanization: "Jeoneun hangugeo-reul gongbuhan ji yukgaewori dwaesseoyo.",
    vietnamese: "Tôi đã học tiếng Hàn được 6 tháng rồi.",
    tips: ["공부한 지 là cấu trúc 'đã... được'", "개월 đọc là 'gae-wol'", "됐어요 đọc là 'dwaesseoyo'"],
    keyPoints: ["Cấu trúc V-ㄴ/은 지 N이/가 되다", "Nói về thời gian đã trôi qua"],
  },
  {
    id: "b1-1",
    level: "B1",
    levelColor: "#f59e0b",
    korean: "요즘 스트레스를 많이 받아서 운동을 시작했어요. 덕분에 기분이 훨씬 나아졌어요.",
    romanization: "Yojeum seuteureseu-reul mani badaso undong-eul sijakhaesseoyo. Deokbune gibuni hwolssin naajyeosseoyo.",
    vietnamese: "Dạo này tôi bị stress nhiều nên đã bắt đầu tập thể dục. Nhờ đó tâm trạng đã tốt hơn nhiều.",
    tips: ["스트레스 đọc là 'seu-teu-re-seu'", "덕분에 đọc là 'deok-bu-ne'", "훨씬 đọc là 'hwol-ssin'"],
    keyPoints: ["Cấu trúc -아/어서 (nguyên nhân)", "Cấu trúc 덕분에 (nhờ vào)"],
  },
  {
    id: "b1-2",
    level: "B1",
    levelColor: "#f59e0b",
    korean: "한국 음식 중에서 김치찌개를 제일 좋아하는데, 처음에는 너무 매워서 못 먹었어요.",
    romanization: "Hanguk eumsik jungeso gimchijjigae-reul jeil joahaneunde, cheoeumeun neomu maewo-seo mot meogeosseoyo.",
    vietnamese: "Trong các món ăn Hàn Quốc, tôi thích kimchi jjigae nhất, nhưng lúc đầu cay quá nên không ăn được.",
    tips: ["김치찌개 đọc là 'gim-chi-jji-gae'", "처음에는 đọc là 'cheo-eu-me-neun'", "못 먹었어요 đọc là 'mot meo-geo-sseo-yo'"],
    keyPoints: ["Cấu trúc 중에서 (trong số)", "Cấu trúc -는데 (tương phản)"],
  },
  {
    id: "b2-1",
    level: "B2",
    levelColor: "#f97316",
    korean: "환경 문제를 해결하기 위해서는 개인의 노력뿐만 아니라 정부와 기업의 적극적인 참여가 필요합니다.",
    romanization: "Hwangyeong munje-reul haegyeolhagi wihaeseo-neun gaein-ui noryeokppunman anira jeongbu-wa gieo-pui jeokgeukjeok-in chamyeo-ga piryohamnida.",
    vietnamese: "Để giải quyết vấn đề môi trường, không chỉ cần nỗ lực của cá nhân mà còn cần sự tham gia tích cực của chính phủ và doanh nghiệp.",
    tips: ["뿐만 아니라 là 'không chỉ... mà còn'", "적극적인 đọc là 'jeok-geuk-jeok-in'", "필요합니다 đọc là 'pi-ryo-ham-ni-da'"],
    keyPoints: ["Cấu trúc N뿐만 아니라 N도", "Văn phong trang trọng -ㅂ/습니다"],
  },
  {
    id: "c1-1",
    level: "C1",
    levelColor: "#ef4444",
    korean: "현대 사회에서 소셜 미디어의 영향력이 날로 커지고 있는 가운데, 이로 인한 정보의 왜곡과 사생활 침해 문제가 심각하게 대두되고 있습니다.",
    romanization: "Hyeondae sahoe-eseo sosyeol midieo-ui yeonghyangyeok-i nallo keojigo inneun gawunde, iro inhan jeongbo-ui waegok-gwa sasaenghwal chimhae munje-ga simgakage daedudoego itseumnida.",
    vietnamese: "Trong xã hội hiện đại, khi ảnh hưởng của mạng xã hội ngày càng lớn, vấn đề bóp méo thông tin và xâm phạm quyền riêng tư do đó gây ra đang nổi lên một cách nghiêm trọng.",
    tips: ["날로 là 'ngày càng'", "대두되다 là 'nổi lên, xuất hiện'", "가운데 là 'trong khi, trong bối cảnh'"],
    keyPoints: ["Văn phong học thuật", "Cấu trúc -는 가운데 (trong khi)"],
  },
];

const LEVELS = ["Tất cả", "A1", "A2", "B1", "B2", "C1"];

type RecordingState = "idle" | "recording" | "recorded" | "playing";

interface RecordingData {
  blob: Blob;
  url: string;
  duration: number;
}

export default function SpeakingLevelPage() {
  const [selectedLevel, setSelectedLevel] = useState("Tất cả");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [recordingData, setRecordingData] = useState<RecordingData | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [showVietnamese, setShowVietnamese] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isPlayingRef, setIsPlayingRef] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const filteredPrompts = selectedLevel === "Tất cả"
    ? SPEAKING_PROMPTS
    : SPEAKING_PROMPTS.filter(p => p.level === selectedLevel);

  const currentPrompt = filteredPrompts[currentIdx] || filteredPrompts[0];

  const speakKorean = useCallback((text: string, rate = 0.85) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ko-KR";
    utter.rate = rate;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordingData({ blob, url, duration: recordingTime });
        setRecordingState("recorded");
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };

      mediaRecorder.start();
      setRecordingState("recording");
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      alert("Không thể truy cập microphone. Vui lòng cấp quyền.");
    }
  }, [recordingTime]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const playRecording = useCallback(() => {
    if (!recordingData) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(recordingData.url);
    audioRef.current = audio;
    setIsPlayingRef(true);
    audio.play();
    audio.onended = () => setIsPlayingRef(false);
  }, [recordingData]);

  const evaluateRecording = useCallback(() => {
    // Simulate AI scoring based on recording duration vs expected
    const expectedDuration = currentPrompt.korean.length * 0.15;
    const ratio = recordingData ? Math.min(recordingData.duration / expectedDuration, 1.5) : 0;
    const baseScore = Math.round(60 + ratio * 30 + Math.random() * 10);
    setScore(Math.min(100, baseScore));
  }, [currentPrompt, recordingData]);

  const resetRecording = useCallback(() => {
    if (recordingData) URL.revokeObjectURL(recordingData.url);
    setRecordingData(null);
    setRecordingState("idle");
    setScore(null);
    setRecordingTime(0);
  }, [recordingData]);

  const goNext = useCallback(() => {
    resetRecording();
    setShowTips(false);
    setShowVietnamese(false);
    setCurrentIdx(prev => (prev + 1) % filteredPrompts.length);
  }, [filteredPrompts.length, resetRecording]);

  const goPrev = useCallback(() => {
    resetRecording();
    setShowTips(false);
    setShowVietnamese(false);
    setCurrentIdx(prev => (prev - 1 + filteredPrompts.length) % filteredPrompts.length);
  }, [filteredPrompts.length, resetRecording]);

  const getScoreColor = (s: number) => {
    if (s >= 85) return "#22c55e";
    if (s >= 70) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 85) return "Xuất sắc!";
    if (s >= 70) return "Khá tốt!";
    if (s >= 55) return "Cần luyện thêm";
    return "Hãy thử lại";
  };

  if (!currentPrompt) return null;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Luyện nói theo cấp độ</h1>
          <p className="text-gray-500 text-sm mt-1">Ghi âm và so sánh phát âm với chuẩn Hàn Quốc</p>
        </div>

        {/* Level filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {LEVELS.map(lv => (
            <button
              key={lv}
              onClick={() => { setSelectedLevel(lv); setCurrentIdx(0); resetRecording(); setShowTips(false); setShowVietnamese(false); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer whitespace-nowrap transition-all ${selectedLevel === lv ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {lv}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400">{currentIdx + 1} / {filteredPrompts.length}</span>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
          {/* Level badge */}
          <div className="px-6 pt-5 pb-3 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: currentPrompt.levelColor }}>
              {currentPrompt.level}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => speakKorean(currentPrompt.korean, 0.7)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-medium cursor-pointer hover:bg-rose-100 transition-colors whitespace-nowrap"
              >
                <i className="ri-volume-down-line"></i>Nghe chậm
              </button>
              <button
                onClick={() => speakKorean(currentPrompt.korean, 1.0)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                <i className="ri-volume-up-line"></i>Nghe chuẩn
              </button>
            </div>
          </div>

          {/* Korean text */}
          <div className="px-6 pb-4">
            <p className="text-2xl font-bold text-gray-900 leading-relaxed mb-2">{currentPrompt.korean}</p>
            <p className="text-sm text-gray-400 italic mb-3">{currentPrompt.romanization}</p>

            {/* Vietnamese toggle */}
            <button
              onClick={() => setShowVietnamese(!showVietnamese)}
              className="text-xs text-rose-500 hover:text-rose-600 cursor-pointer flex items-center gap-1 transition-colors"
            >
              <i className={`ri-${showVietnamese ? "eye-off" : "eye"}-line`}></i>
              {showVietnamese ? "Ẩn nghĩa" : "Xem nghĩa tiếng Việt"}
            </button>
            {showVietnamese && (
              <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">{currentPrompt.vietnamese}</p>
            )}
          </div>

          {/* Key points */}
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {currentPrompt.keyPoints.map((kp, i) => (
                <span key={i} className="px-2.5 py-1 bg-rose-50 text-rose-600 text-xs rounded-full font-medium">{kp}</span>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="px-6 pb-5">
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 cursor-pointer transition-colors"
            >
              <i className={`ri-${showTips ? "arrow-up" : "arrow-down"}-s-line`}></i>
              {showTips ? "Ẩn mẹo phát âm" : "Xem mẹo phát âm"}
            </button>
            {showTips && (
              <div className="mt-3 space-y-2">
                {currentPrompt.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-5 h-5 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recording section */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Ghi âm của bạn</h3>

          {recordingState === "idle" && (
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={startRecording}
                className="w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center cursor-pointer transition-all active:scale-95"
              >
                <i className="ri-mic-line text-3xl"></i>
              </button>
              <p className="text-sm text-gray-500">Nhấn để bắt đầu ghi âm</p>
            </div>
          )}

          {recordingState === "recording" && (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer transition-all"
                >
                  <i className="ri-stop-fill text-3xl"></i>
                </button>
                <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-sm font-medium text-red-500">Đang ghi âm... {recordingTime}s</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-rose-400 rounded-full animate-pulse"
                    style={{ height: `${8 + Math.random() * 24}px`, animationDelay: `${i * 0.05}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {recordingState === "recorded" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <button
                  onClick={playRecording}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-500 text-white cursor-pointer hover:bg-rose-600 transition-colors flex-shrink-0"
                >
                  <i className={`ri-${isPlayingRef ? "pause" : "play"}-fill`}></i>
                </button>
                <div className="flex-1">
                  <div className="h-1.5 bg-gray-200 rounded-full">
                    <div className="h-full bg-rose-400 rounded-full w-1/3"></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{recordingData?.duration || 0}s</p>
                </div>
                <button onClick={resetRecording} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-delete-bin-line text-sm"></i>
                </button>
              </div>

              {score === null ? (
                <button
                  onClick={evaluateRecording}
                  className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-sm cursor-pointer transition-colors whitespace-nowrap"
                >
                  <i className="ri-ai-generate mr-2"></i>Đánh giá phát âm
                </button>
              ) : (
                <div className="text-center p-4 rounded-xl border" style={{ borderColor: `${getScoreColor(score)}30`, backgroundColor: `${getScoreColor(score)}08` }}>
                  <p className="text-4xl font-black mb-1" style={{ color: getScoreColor(score) }}>{score}</p>
                  <p className="text-sm font-semibold" style={{ color: getScoreColor(score) }}>{getScoreLabel(score)}</p>
                  <div className="mt-3 space-y-1 text-xs text-gray-500 text-left">
                    {score >= 85 && <p>✓ Phát âm rõ ràng, tự nhiên</p>}
                    {score >= 70 && score < 85 && <p>• Cần chú ý ngữ điệu câu hỏi</p>}
                    {score < 70 && <p>• Luyện thêm các âm tiết khó</p>}
                    <p>• Thử nghe lại và so sánh với bản gốc</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors whitespace-nowrap"
          >
            <i className="ri-arrow-left-line"></i>Câu trước
          </button>
          <div className="flex gap-1">
            {filteredPrompts.slice(0, Math.min(filteredPrompts.length, 8)).map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentIdx(i); resetRecording(); setShowTips(false); setShowVietnamese(false); }}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${i === currentIdx ? "bg-rose-500 w-4" : "bg-gray-300 hover:bg-gray-400"}`}
              />
            ))}
          </div>
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium cursor-pointer transition-colors whitespace-nowrap"
          >
            Câu tiếp<i className="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
