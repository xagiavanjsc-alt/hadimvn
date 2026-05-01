import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface ExportRecord {
  id: string;
  type: "melon" | "naver";
  fileName: string;
  count: number;
  exportedAt: string;
}

export function useExportHistory() {
  const [history, setHistory] = useLocalStorage<ExportRecord[]>("kts_export_history", []);

  const addRecord = (record: Omit<ExportRecord, "id">) => {
    const newRecord: ExportRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setHistory((prev) => [newRecord, ...prev].slice(0, 50));
    return newRecord;
  };

  const clearHistory = () => setHistory([]);

  return { history, addRecord, clearHistory };
}
