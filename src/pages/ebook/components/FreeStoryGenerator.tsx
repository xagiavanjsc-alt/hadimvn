import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { AIConfig } from "@/services/aiService";
import { generateFreeStory, type FreeStoryInput } from "@/services/aiService";
import type { ApprovedLesson } from "@/pages/melon/components/ExportExcel";

interface StoredConfig {
  provider: string;
  apiKey: string;
  model?: string;
}

const TOPIC_SUGGESTIONS = [
  "Bu?i t?p nh?y c?a idol",
  "Fan meeting l?n d?u g?p idol",
  "Ði an tteokbokki ? Hongdae",
  "Xem concert K-pop l?n d?u",
  "H?c ti?ng Hàn v?i b?n cùng phòng",
  "Ði mua s?m ? Myeongdong",
  "Xem phim Hàn cùng b?n bè",
  "Th?c t?p ? công ty gi?i trí",
  "Tham gia l?p h?c n?u an Hàn",
  "G?p idol ? sân bay",
  "Ðêm tru?c debut c?a nhóm nh?c",
  "Bu?i ch?p ?nh album m?i",
];

const STYLE_OPTIONS = [
  { value: "Hài hu?c, nh? nhàng, g?n gui", label: "Hài hu?c" },
  { value: "Lãng m?n, ng?t ngào, ?m áp", label: "Lãng m?n" },
  { value: "K?ch tính, h?i h?p, b?t ng?", label: "K?ch tính" },
  { value: "Truy?n c?m h?ng, tích c?c, d?ng l?c", label: "Truy?n c?m h?ng" },
  { value: "Nh? nhàng, tho m?ng, sâu l?ng", label: "Tho m?ng" },
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
    if (!topic.trim()) { setError("Nh?p ch? d? tru?c nhé!"); return; }
    if (!config?.apiKey) { setError("Chua cài d?t API Key. Vào Cài d?t API d? thêm."); return; }

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
        song: {
          rank: Date.now() % 100000,
          title: res.title,
          artist: "Sáng tác t? do",
          genre: "Truy?n chêm",
          lyrics: `Ch? d?: ${topic}`,
        },
        story: res.story,
        vocabulary: res.vocabulary.map(v => ({
          korean: v.word,
          word: v.word,
          pronunciation: "",
          meaning: v.meaning,
          example: v.example,
        })),
        explanation: res.explanation,
        stars: 5,
        publishedAt: new Date().toISOString(),
      };

      setResult(lesson);
    } catch (e) {
      setError(e instanceof Error ? e.message : "L?i không xác d?nh");
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
            <h3 className="text-white font-semibold text-sm">T?o truy?n chêm t? ch? d?</h3>
            <p className="text-app-text-secondary text-xs">AI s? vi?t truy?n chêm hoàn ch?nh — không c?n lyrics bài hát</p>
          </div>
        </div>

        {/* Topic input */}
        <div className="mb-3">
          <label className="text-app-text-secondary text-xs font-medium block mb-1.5">
            Ch? d? truy?n *
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="Ví d?: bu?i t?p nh?y c?a idol, fan meeting l?n d?u..."
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
            <label className="text-app-text-secondary text-[10px] font-medium block mb-1.5">Trình d?</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as FreeStoryInput["level"])}
              className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/70 text-xs focus:outline-none focus:border-app-accent-primary/30 cursor-pointer"
            >
              <option value="beginner" className="bg-app-bg">So c?p</option>
              <option value="intermediate" className="bg-app-bg">Trung c?p</option>
              <option value="advanced" className="bg-app-bg">Cao c?p</option>
            </select>
          </div>
          <div>
            <label className="text-app-text-secondary text-[10px] font-medium block mb-1.5">Ð? dài</label>
            <select
              value={storyLength}
              onChange={(e) => setStoryLength(e.target.value as FreeStoryInput["storyLength"])}
              className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white/70 text-xs focus:outline-none focus:border-app-accent-primary/30 cursor-pointer"
            >
              <option value="short" className="bg-app-bg">Ng?n (~150 t?)</option>
              <option value="medium" className="bg-app-bg">V?a (~300 t?)</option>
              <option value="long" className="bg-app-bg">Dài (~500 t?)</option>
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
          Tùy ch?nh nâng cao (nhân v?t, b?i c?nh)
        </button>

        {showAdvanced && (
          <div className="space-y-3 mb-3 p-3 bg-app-surface/50 rounded-xl border border-app-border">
            <div>
              <label className="text-app-text-secondary text-[10px] font-medium block mb-1.5">
                Nhân v?t tùy ch?nh (d? tr?ng = AI t? ch?n)
              </label>
              <input
                type="text"
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                placeholder="Ví d?: Minh - sinh viên Vi?t, Ji-ho - idol Hàn"
                className="w-full bg-app-card/50 border border-app-border rounded-lg px-3 py-2 text-white text-xs placeholder-white/20 focus:outline-none focus:border-app-accent-primary/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-app-text-secondary text-[10px] font-medium block mb-1.5">
                B?i c?nh tùy ch?nh (d? tr?ng = AI t? ch?n)
              </label>
              <input
                type="text"
                value={setting}
                onChange={(e) => setSetting(e.target.value)}
                placeholder="Ví d?: phòng t?p nh?y ? Seoul"
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
            <><i className="ri-loader-4-line animate-spin"></i>AI dang vi?t truy?n...</>
          ) : (
            <><i className="ri-magic-line"></i>T?o truy?n chêm</>
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
            <span className="text-app-text-muted text-[10px]">Ch? d?: {topic}</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Story preview */}
            <div>
              <p className="text-app-text-secondary text-[10px] font-bold tracking-normal mb-2">Truy?n chêm</p>
              <p className="text-white/70 text-xs leading-5 whitespace-pre-wrap line-clamp-6">{result.story}</p>
            </div>

            {/* Vocab preview */}
            {result.vocabulary.length > 0 && (
              <div>
                <p className="text-app-text-secondary text-[10px] font-bold tracking-normal mb-2">
                  T? v?ng ({result.vocabulary.length} t?)
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
                      <p className="text-app-text-muted text-[9px]">+{result.vocabulary.length - 4} t? n?a</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grammar preview */}
            {result.explanation && (
              <div>
                <p className="text-app-text-secondary text-[10px] font-bold tracking-normal mb-2">Ng? pháp</p>
                <p className="text-white/50 text-[10px] leading-4 line-clamp-3">{result.explanation}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-app-border">
              <button
                onClick={() => setResult(null)}
                className="flex items-center gap-1.5 bg-app-card/50 hover:bg-app-card/70 text-app-text-secondary text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-refresh-line"></i>
                T?o l?i
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
            <p className="text-app-text-secondary text-xs font-medium mb-1">Truy?n chêm sáng tác t? do</p>
            <p className="text-app-text-muted text-[10px] leading-relaxed">
              Khác v?i bài h?c t? Melon (dùng lyrics có s?n), truy?n này do AI sáng tác hoàn toàn — 
              không lo b?n quy?n, có th? bán thuong m?i tho?i mái. Bài du?c thêm vào danh sách bài h?c và có th? gom vào ebook.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

