import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface VocabItem {
  word: string;
  meaning: string;
  example: string;
}

interface Lesson {
  song: { title: string };
  vocabulary: VocabItem[];
}

interface DailyVocabWidgetProps {
  lessons: Lesson[];
}

export default function DailyVocabWidget({ lessons }: DailyVocabWidgetProps) {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  const todayWords = useMemo(() => {
    const allVocab: { word: string; meaning: string; example: string; song: string }[] = [];
    lessons.forEach((l) => {
      l.vocabulary.forEach((v) => {
        allVocab.push({ word: v.word, meaning: v.meaning, example: v.example, song: l.song.title });
      });
    });
    if (allVocab.length === 0) return [];

    const today = new Date();
    const seed =
      today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const shuffled = [...allVocab].sort((a, b) => {
      const ha = (seed * 1664525 + a.word.charCodeAt(0) * 1013904223) & 0xffffffff;
      const hb = (seed * 1664525 + b.word.charCodeAt(0) * 1013904223) & 0xffffffff;
      return ha - hb;
    });
    const seen = new Set<string>();
    return shuffled
      .filter((v) => {
        if (seen.has(v.word)) return false;
        seen.add(v.word);
        return true;
      })
      .slice(0, 5);
  }, [lessons]);

  const toggleFlip = useCallback((i: number) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  if (todayWords.length === 0) return null;

  const today = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "numeric",
  });

  return (
    <div className="bg-app-bg border border-app-border rounded-2xl p-4 md:p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center bg-app-accent-primary/10 rounded-lg">
            <i className="ri-sun-line text-app-accent-primary text-sm" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Từ điển hôm nay</h3>
            <p className="text-app-text-muted text-[10px]">{today} · 5 từ</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/dictionary")}
          className="text-app-accent-primary text-xs hover:text-[#d4b43a] cursor-pointer whitespace-nowrap"
        >
          Xem tất cả <i className="ri-arrow-right-line" />
        </button>
      </div>

      <div className="space-y-2">
        {todayWords.map((v, i) => {
          const isFlipped = flipped.has(i);
          return (
            <button
              key={i}
              onClick={() => toggleFlip(i)}
              className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 transition-all cursor-pointer text-left border ${
                isFlipped
                  ? "bg-app-accent-primary/5 border-app-accent-primary/20"
                  : "bg-app-surface/50 border-app-border hover:border-app-border"
              }`}
            >
              <div className="flex-1 min-w-0">
                {isFlipped ? (
                  <div>
                    <p className="text-app-accent-primary text-sm font-bold">{v.word}</p>
                    <p className="text-white/60 text-xs mt-0.5">{v.meaning}</p>
                    {v.example && (
                      <p className="text-app-text-muted text-[10px] italic mt-1 line-clamp-1">
                        {v.example}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-app-text-muted text-[10px] font-bold w-4">{i + 1}</span>
                    <span className="text-white/70 text-sm font-bold">{v.word}</span>
                    <span className="text-app-text-muted text-[10px] ml-auto">Click để xem nghĩa</span>
                  </div>
                )}
              </div>
              <i
                className={`text-xs flex-shrink-0 ${
                  isFlipped ? "ri-eye-off-line text-app-accent-primary/40" : "ri-eye-line text-white/15"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-3 pt-3 border-t border-app-border flex items-center justify-between">
        <p className="text-app-text-muted text-[10px]">Thay đổi mỗi ngày lúc 0:00</p>
        <button
          onClick={() => setFlipped(new Set([0, 1, 2, 3, 4]))}
          className="text-app-text-muted hover:text-white/50 text-[10px] cursor-pointer whitespace-nowrap"
        >
          Lật tất cả
        </button>
      </div>
    </div>
  );
}
