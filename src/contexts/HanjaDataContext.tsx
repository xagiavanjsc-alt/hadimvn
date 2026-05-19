import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { HANJA_DATA, HanjaEntry } from "@/mocks/hanjaData";
import { supabase } from "@/lib/supabase";

const CACHE_KEY = "hanja_pro_cache_v1";
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

interface CacheEntry {
  data: HanjaEntry[];
  ts: number;
}

function readCache(): HanjaEntry[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CacheEntry = JSON.parse(raw);
    if (Date.now() - parsed.ts > CACHE_TTL) return null;
    return parsed.data;
  } catch { return null; }
}

function writeCache(data: HanjaEntry[]) {
  try {
    const entry: CacheEntry = { data, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch { /* ignore quota errors */ }
}

interface HanjaDataCtx { data: HanjaEntry[]; isLoading: boolean; }
const HanjaDataContext = createContext<HanjaDataCtx>({ data: HANJA_DATA, isLoading: false });

export function HanjaDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HanjaEntry[]>(() => readCache() ?? HANJA_DATA);
  const [isLoading, setIsLoading] = useState(() => readCache() === null);

  useEffect(() => {
    const cached = readCache();
    if (cached) { setData(cached); setIsLoading(false); return; }

    async function fetchAll() {
      const PAGE = 1000;
      let offset = 0;
      const all: HanjaEntry[] = [];
      while (true) {
        const { data: rows, error } = await supabase
          .from("hanja_pro")
          .select("hangul,hanja,meaning_vn,hanja_breakdown,examples,related_words,mnemonic")
          .order("id", { ascending: true })
          .range(offset, offset + PAGE - 1);
        if (error || !rows || rows.length === 0) break;
        all.push(...rows.map((row: any) => {
          const breakdown = Array.isArray(row.hanja_breakdown) ? row.hanja_breakdown : [];
          const firstChar = breakdown[0]?.char || row.hanja?.[0] || "";
          return {
            korean: row.hangul,
            hanja: row.hanja,
            vietnamese: row.meaning_vn,
            root_char: firstChar,
            root_meaning: breakdown[0]?.meaning,
            examples: Array.isArray(row.examples) ? row.examples.map((ex: any) => `${ex.ko} — ${ex.vi}`).join("\n") : undefined,
            related_words: Array.isArray(row.related_words) ? row.related_words.map((w: any) => `${w.word}: ${w.meaning}`).join(", ") : undefined,
            memory_tip: row.mnemonic,
          } as HanjaEntry;
        }));
        if (rows.length < PAGE) break;
        offset += PAGE;
      }
      if (all.length > 0) {
        writeCache(all);
        setData(all);
      }
      setIsLoading(false);
    }
    fetchAll();
  }, []);

  return (
    <HanjaDataContext.Provider value={{ data, isLoading }}>
      {children}
    </HanjaDataContext.Provider>
  );
}

export function useHanjaData(): HanjaEntry[] {
  return useContext(HanjaDataContext).data;
}

export function useHanjaLoading(): boolean {
  return useContext(HanjaDataContext).isLoading;
}
