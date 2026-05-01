import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface ApiCallRecord {
  timestamp: string;
  provider: string;
  model: string;
  type: "melon" | "naver";
  estimatedCostUsd: number;
}

export interface ApiCostSummary {
  totalCalls: number;
  totalCostUsd: number;
  byModel: Record<string, { calls: number; costUsd: number }>;
  byType: Record<string, { calls: number; costUsd: number }>;
  last30Days: number;
  last30DaysCost: number;
}

// Cost per 1000 tokens (input + output combined estimate)
// These are approximate costs based on typical usage
const MODEL_COST_PER_CALL: Record<string, number> = {
  // OpenAI
  "gpt-4o-mini": 0.0003,
  "gpt-4o": 0.008,
  "gpt-4-turbo": 0.015,
  // Gemini
  "gemini-1.5-flash": 0.00005,
  "gemini-1.5-pro": 0.0025,
  "gemini-2.0-flash": 0.00005,
  // OpenRouter (approximate)
  "openai/gpt-4o-mini": 0.0003,
  "openai/gpt-4o": 0.008,
  "google/gemini-flash-1.5": 0.00005,
  "google/gemini-pro-1.5": 0.0025,
  "anthropic/claude-3-haiku": 0.0004,
  "anthropic/claude-3.5-sonnet": 0.006,
  "meta-llama/llama-3.1-8b-instruct:free": 0,
  "mistralai/mistral-7b-instruct:free": 0,
};

export function getEstimatedCost(model: string): number {
  return MODEL_COST_PER_CALL[model] ?? 0.001;
}

export function useApiCostTracker() {
  const [records, setRecords] = useLocalStorage<ApiCallRecord[]>("kts_api_cost_records", []);

  const trackCall = (provider: string, model: string, type: "melon" | "naver") => {
    const record: ApiCallRecord = {
      timestamp: new Date().toISOString(),
      provider,
      model,
      type,
      estimatedCostUsd: getEstimatedCost(model),
    };
    setRecords((prev) => [...prev.slice(-999), record]); // keep last 1000
  };

  const getSummary = (): ApiCostSummary => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const byModel: Record<string, { calls: number; costUsd: number }> = {};
    const byType: Record<string, { calls: number; costUsd: number }> = {};
    let last30Days = 0;
    let last30DaysCost = 0;

    records.forEach((r) => {
      // By model
      if (!byModel[r.model]) byModel[r.model] = { calls: 0, costUsd: 0 };
      byModel[r.model].calls++;
      byModel[r.model].costUsd += r.estimatedCostUsd;

      // By type
      if (!byType[r.type]) byType[r.type] = { calls: 0, costUsd: 0 };
      byType[r.type].calls++;
      byType[r.type].costUsd += r.estimatedCostUsd;

      // Last 30 days
      if (new Date(r.timestamp) >= thirtyDaysAgo) {
        last30Days++;
        last30DaysCost += r.estimatedCostUsd;
      }
    });

    return {
      totalCalls: records.length,
      totalCostUsd: records.reduce((sum, r) => sum + r.estimatedCostUsd, 0),
      byModel,
      byType,
      last30Days,
      last30DaysCost,
    };
  };

  const clearRecords = () => setRecords([]);

  return { trackCall, getSummary, clearRecords, records };
}
