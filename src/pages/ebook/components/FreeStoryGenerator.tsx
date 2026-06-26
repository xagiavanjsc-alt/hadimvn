import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { AIConfig } from "@/services/aiService";
import { generateFreeStory, type FreeStoryInput } from "@/services/aiService";
import type { ApprovedLesson } from "@/types/melon";

interface StoredConfig {
  provider: string;
  apiKey: string;
  model?: string;
}

const TOPIC_SUGGESTIONS = [
  "Buổi tập nhảy của idol",
  "Fan meeting lần đầu gặp idol",
  "Đi ăn tteokbokki ở Hongdae",
  "Xem concert K-pop lần đầu",
  "Học tiếng Hàn với bạn cùng phòng",
  "Đi mua sắm ở Myeongdong",
  "Xem phim Hàn cùng bạn bè",
  "Thực tập ở công ty giải trí",
  "Tham gia lớp học nấu ăn Hàn",
  "Gặp idol ở sân bay",
  "Đêm trước debut của nhóm nhạc",
  "Buổi chụp ảnh album mới",
];

const STYLE_OPTIONS = [
  { value: "Hài hước, nhẹ nhàng, gần gũi", label: "Hài hước" },
  { value: "Lãng mạn, ngọt ngào, ấm áp", label: "Lãng mạn" },
  { value: "Kịch tính, hồi hộp, bất ngờ", label: "Kịch tính" },
  { value: "Truyền cảm hứng, tích cực, động lực", label: "Truyền cảm hứng" },
  { value: "Nhẹ nhàng, thơ mộng, sâu lắng", label: "Thơ mộng" },
];

interface Props {
  onAddLesson: (lesson: ApprovedLesson) => void;
}

export default function FreeStoryGenerator({ onAddLesson }: Props) {
  const [config] = useLocalStorage<StoredConfig | null>("kts_ai_config", null);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState<FreeStoryInput["level"]>("beginner");
  const [storyLength, setStoryLength] = useState<FreeStoryInput["storyLength"]>("medium");
  const [style, setStyle] = useState(STYLE_OPTIONS[0].value);
  const [characters, setCharacters] = useState("");
  const [setting, setSetting] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApprovedLesson | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) { setError("Nhập chủ đề trước nhé!"); return; }
    if (!config?.apiKey) { setError("Chưa cài đặt API Key. Vào Cài đặt API để thêm."); return; }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const aiConfig: AIConfig = {
        provider: config.provider as AIConfig["provider"],
        apiKey: config.apiKey,
        model: config.model,
      };

      const input: FreeStoryInput = {
        topic: topic.trim(),
        level,
        storyLength,
        style,
        characters: characters.trim() || undefined,
        setting: setting.trim() || undefined,
      };

      const res = await generateFreeStory(aiConfig, input);

      // Convert to ApprovedLesson format
      const lesson: ApprovedLesson = {
        id: `free-${Date.now()}`,
        song: {
          rank: Date.now() % 100000,
          title: res.title,
          artist: "Sáng tác tự do",
          genre: "Truyện chêm",
          lyrics: `Chủ đề: ${topic}`,
        },
        vocab: res.vocabulary.map(v => ({
          word: v.word,
          meaning: v.meaning,
          example: v.example,
        })),
        vocabulary: res.vocabulary.map(v => ({
          word: v.word,
          meaning: v.meaning,
          example: v.example,
        })),
        grammar: [],
        explanation: res.explanation,
        stars: 5,
        publishedAt: new Date().toISOString(),
      };

      setResult(lesson);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToEbook = () => {
    if (!result) return;
    onAddLesson(result);
    setResult(null);
    setTopic("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-app-bg border border-app-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-app-accent-primary/10 rounded-lg">
            <i className="ri-quill-pen-ai-line text-app-accent-primary text-base"></i>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Tạo truyện chêm từ chủ đề</h3>
            <p className="text-app-text-secondary text-xs">AI sẽ viết truyện chêm hoàn chỉnh — không cần lyrics bài hát</p>
          </div>
        </div>

        {/* Topic input */}
        <div className="mb-3">
          <label className="text-app-text-secondary text-xs font-medium block mb-1.5">
            Chủ đề truyện *
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="Ví dụ: buổi tập nhảy của idol, fan meeting lần đầu..."
            className="w-full bg-app-card/50 border border-app-border rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-app-accent-primary/40 transition-colors"
          />
        </div>

        {/* Topic suggestions */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {TOPIC_SUGGESTIONS.slice(0, 6).map((s) => (
            <button
              key={s}
              onClick={() => setTopic(s)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-app-card/50 hover:bg-app-accent-primary/10 text-app-text-secondary hover:text-app-accent-primary border border-app-border hover:border-app-accent-primary/20 transition-all cursor-pointer whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Level + Length + Style */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-app-text-secondary text-[10px] font-medium block mb-1.5">Trình độ</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as FreeStoryInput["level"])}
              className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/70 text-xs focus:outline-none focus:border-app-accent-primary/30 cursor-pointer"
            >
              <option value="beginner" className="bg-app-bg">Sơ cấp</option>
              <option value="intermediate" className="bg-app-bg">Trung cấp</option>
              <option value="advanced" className="bg-app-bg">Cao cấp</option>
            </select>
          </div>
          <div>
            <label className="text-app-text-secondary text-[10px] font-medium block mb-1.5">Độ dài</label>
            <select
              value={storyLength}
              onChange={(e) => setStoryLength(e.target.value as FreeStoryInput["storyLength"])}
              className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/70 text-xs focus:outline-none focus:border-app-accent-primary/30 cursor-pointer"
            >
              <option value="short" className="bg-app-bg">Ngắn (~150 từ)</option>
              <option value="medium" className="bg-app-bg">Vừa (~300 từ)</option>
              <option value="long" className="bg-app-bg">Dài (~500 từ)</option>
            </select>
          </div>
          <div>
            <label className="text-app-text-secondary text-[10px] font-medium block mb-1.5">Phong cách</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/70 text-xs focus:outline-none focus:border-app-accent-primary/30 cursor-pointer"
            >
              {STYLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-app-bg">{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-app-text-muted hover:text-white/60 text-xs transition-colors cursor-pointer mb-3"
        >
          {showAdvanced ? <i className="ri-arrow-up-s-line"></i> : <i className="ri-arrow-down-s-line"></i>}
          Tùy chỉnh nâng cao (nhân vật, bối cảnh)
        </button>

        {showAdvanced && (
          <div className="space-y-3 mb-3 p-3 bg-app-surface/50 rounded-xl border border-app-border">
            <div>
              <label className="text-app-text-secondary text-[10px] font-medium block mb-1.5">
                Nhân vật tùy chỉnh (để trống = AI tự chọn)
              </label>
              <input
                type="text"
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                placeholder="Ví dụ: Minh - sinh viên Việt, Ji-ho - idol Hàn"
                className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-app-accent-primary/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-app-text-secondary text-[10px] font-medium block mb-1.5">
                Bối cảnh tùy chỉnh (để trống = AI tự chọn)
              </label>
              <input
                type="text"
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                placeholder="Ví dụ: phòng tập nhảy ở Seoul"
                className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-app-accent-primary/30 transition-colors"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mb-3">
            <i className="ri-error-warning-line text-red-400 text-sm flex-shrink-0"></i>
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
          className="w-full flex items-center justify-center gap-2 bg-app-accent-primary hover:bg-[#d4b43a] disabled:opacity-40 disabled:cursor-not-allowed text-app-bg font-bold text-sm py-3 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
        >
          {loading ? (
            <><i className="ri-loader-4-line animate-spin"></i>AI đang viết truyện...</>
          ) : (
            <><i className="ri-magic-line"></i>Tạo truyện chêm</>
          )}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-app-bg border border-app-accent-primary/20 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-app-border bg-app-accent-primary/5">
            <div className="flex items-center gap-2">
              <i className="ri-checkbox-circle-fill text-app-accent-primary text-sm"></i>
              <p className="text-app-accent-primary font-semibold text-sm">{result.song.title}</p>
            </div>
            <span className="text-app-text-muted text-[10px]">Chủ đề: {topic}</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Story preview */}
            <div>
              <p className="text-app-text-secondary text-[10px] font-bold tracking-normal mb-2">Truyện chêm</p>
              <p className="text-white/70 text-xs leading-5 whitespace-pre-wrap line-clamp-6">{result.story}</p>
            </div>

            {/* Vocab preview */}
            {result.vocabulary.length > 0 && (
              <div>
                <p className="text-app-text-secondary text-[10px] font-bold tracking-normal mb-2">
                  Từ vựng ({result.vocabulary.length} từ)
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {result.vocabulary.slice(0, 4).map((v, i) => (
                    <div key={i} className="bg-app-card/50 rounded-lg p-2 border border-app-border">
                      <p className="text-white/80 text-[10px] font-bold">{v.word}</p>
                      <p className="text-app-accent-primary text-[9px] font-medium mt-0.5">{v.meaning}</p>
                    </div>
                  ))}
                  {result.vocabulary.length > 4 && (
                    <div className="bg-app-surface/50 rounded-lg p-2 border border-app-border flex items-center justify-center">
                      <p className="text-app-text-muted text-[9px]">+{result.vocabulary.length - 4} từ nữa</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grammar preview */}
            {result.explanation && (
              <div>
                <p className="text-app-text-secondary text-[10px] font-bold tracking-normal mb-2">Ngữ pháp</p>
                <p className="text-white/50 text-[10px] leading-4 line-clamp-3">{result.explanation}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-app-border">
              <button
                onClick={() => setResult(null)}
                className="flex items-center gap-1.5 bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-refresh-line"></i>
                Tạo lại
              </button>
              <button
                onClick={handleAddToEbook}
                className="flex-1 flex items-center justify-center gap-1.5 bg-app-accent-primary hover:bg-[#d4b43a] text-app-bg text-xs font-bold py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line"></i>
                Thêm vào ebook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info box */}
      {!result && !loading && (
        <div className="bg-app-surface/50 border border-app-border rounded-xl p-4 flex items-start gap-3">
          <div className="w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
            <i className="ri-information-line text-app-text-muted text-sm"></i>
          </div>
          <div>
            <p className="text-app-text-secondary text-xs font-medium mb-1">Truyện chêm sáng tác tự do</p>
            <p className="text-app-text-muted text-[10px] leading-relaxed">
              Khác với bài học từ Melon (dùng lyrics có sẵn), truyện này do AI sáng tác hoàn toàn — 
              không lo bản quyền, có thể bán thương mại thoải mái. Bài được thêm vào danh sách bài học và có thể gom vào ebook.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

