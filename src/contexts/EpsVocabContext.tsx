import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  epsVocabulary as MOCK_ENTRIES,
  EPS_VOCAB_TOPICS as MOCK_TOPICS,
  type EpsVocabItem,
  type EpsVocabTopic,
} from "@/mocks/epsVocabulary";
import { supabase } from "@/lib/supabase";

const CACHE_KEY = "eps_vocab_cache_v1";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours — matches useHanjaData

interface CachePayload {
  items: EpsVocabItem[];
  topics: EpsVocabTopic[];
  ts: number;
}

function readCache(): CachePayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachePayload = JSON.parse(raw);
    if (!parsed.items || !parsed.topics) return null;
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed;
  } catch { return null; }
}

function writeCache(items: EpsVocabItem[], topics: EpsVocabTopic[]) {
  try {
    const payload: CachePayload = { items, topics, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch { /* ignore quota errors */ }
}

interface EpsVocabCtx {
  items: EpsVocabItem[];
  topics: EpsVocabTopic[];
  isLoading: boolean;
}

const EpsVocabContext = createContext<EpsVocabCtx>({
  items: MOCK_ENTRIES,
  topics: MOCK_TOPICS,
  isLoading: false,
});

export function EpsVocabProvider({ children }: { children: ReactNode }) {
  const cached = readCache();
  const [items, setItems] = useState<EpsVocabItem[]>(cached?.items ?? MOCK_ENTRIES);
  const [topics, setTopics] = useState<EpsVocabTopic[]>(cached?.topics ?? MOCK_TOPICS);
  const [isLoading, setIsLoading] = useState(cached === null);

  useEffect(() => {
    // Already had a fresh cache — no fetch needed.
    if (readCache() !== null) { setIsLoading(false); return; }

    let cancelled = false;
    async function fetchAll() {
      try {
        const [topicsRes, entriesRes] = await Promise.all([
          supabase
            .from("eps_vocab_topics")
            .select("id,label,label_ko,icon,color,description,sort_order")
            .order("sort_order", { ascending: true }),
          supabase
            .from("eps_vocab_entries")
            .select("id,korean,reading,vietnamese,example,example_vi,topic_id,level")
            .order("id", { ascending: true }),
        ]);

        if (cancelled) return;

        const topicRows = topicsRes.data;
        const entryRows = entriesRes.data;
        if (topicsRes.error || entriesRes.error || !topicRows || !entryRows
            || topicRows.length === 0 || entryRows.length === 0) {
          // Silent fallback to mock — page never goes blank.
          setIsLoading(false);
          return;
        }

        type TopicRow = { id: string; label: string; label_ko: string; icon: string | null; color: string | null; description: string | null; sort_order: number };
        type EntryRow = { id: string; korean: string; reading: string | null; vietnamese: string; example: string | null; example_vi: string | null; topic_id: string | null; level: string | null };

        const nextTopics: EpsVocabTopic[] = (topicRows as TopicRow[]).map(r => ({
          id: r.id,
          label: r.label,
          labelKo: r.label_ko,
          icon: r.icon ?? "",
          color: r.color ?? "",
          description: r.description ?? "",
        }));

        const nextItems: EpsVocabItem[] = (entryRows as EntryRow[]).map(r => ({
          id: r.id,
          korean: r.korean,
          reading: r.reading ?? "",
          vietnamese: r.vietnamese,
          example: r.example ?? "",
          exampleVi: r.example_vi ?? "",
          topicId: r.topic_id ?? "",
          level: (r.level === "intermediate" || r.level === "advanced") ? r.level : "basic",
        }));

        writeCache(nextItems, nextTopics);
        setItems(nextItems);
        setTopics(nextTopics);
      } catch {
        // Network/runtime errors → keep mock data, drop loading flag.
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchAll();
    return () => { cancelled = true; };
  }, []);

  return (
    <EpsVocabContext.Provider value={{ items, topics, isLoading }}>
      {children}
    </EpsVocabContext.Provider>
  );
}

export function useEpsVocab(): { items: EpsVocabItem[]; topics: EpsVocabTopic[] } {
  const ctx = useContext(EpsVocabContext);
  return { items: ctx.items, topics: ctx.topics };
}

export function useEpsVocabLoading(): boolean {
  return useContext(EpsVocabContext).isLoading;
}
