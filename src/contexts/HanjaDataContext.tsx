import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { HANJA_DATA, HanjaEntry } from "@/mocks/hanjaData";
import { supabase } from "@/lib/supabase";

const CACHE_KEY = "hanja_db_cache";
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

const HanjaDataContext = createContext<HanjaEntry[]>(HANJA_DATA);

export function HanjaDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HanjaEntry[]>(() => readCache() ?? HANJA_DATA);

  useEffect(() => {
    const cached = readCache();
    if (cached) { setData(cached); return; }

    async function fetchAll() {
      const PAGE = 1000;
      let offset = 0;
      const all: HanjaEntry[] = [];
      while (true) {
        const { data: rows, error } = await supabase
          .from("hanja_tree_nodes")
          .select("korean,hanja,vietnamese,pronunciation,category,difficulty")
          .order("korean", { ascending: true })
          .range(offset, offset + PAGE - 1);
        if (error || !rows || rows.length === 0) break;
        all.push(...(rows as HanjaEntry[]));
        if (rows.length < PAGE) break;
        offset += PAGE;
      }
      if (all.length > 0) {
        writeCache(all);
        setData(all);
      }
    }
    fetchAll();
  }, []);

  return (
    <HanjaDataContext.Provider value={data}>
      {children}
    </HanjaDataContext.Provider>
  );
}

export function useHanjaData(): HanjaEntry[] {
  return useContext(HanjaDataContext);
}
