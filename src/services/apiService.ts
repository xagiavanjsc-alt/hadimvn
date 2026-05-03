// ─── Apify Melon Scraper ───────────────────────────────────────────────────
export interface MelonSongRaw {
  rank: number;
  title: string;
  artist: string;
  genre: string;
  lyrics: string;
  albumArt?: string;
}

/**
 * Fetch Melon Top 100 chart from Apify
 * @param apifyToken - Apify API token for authentication
 * @returns Array of Melon song data with rank, title, artist, genre, lyrics
 * @throws Error if API token is invalid, actor not found, rate limit exceeded, or connection fails
 */
export async function fetchMelonTop100(apifyToken: string): Promise<MelonSongRaw[]> {
  const ACTOR_ID = "oxygenated_quagmire~melon-chart-scraper";

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(ACTOR_ID)}/runs?token=${apifyToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "daily", chartType: "TOP100", maxResults: 100, fetchDetails: true }),
    }
  );

  if (!runRes.ok) {
    const errText = await runRes.text();
    let errJson: { error?: { message?: string } } = {};
    try { errJson = JSON.parse(errText); } catch { /* ignore */ }

    if (runRes.status === 401 || runRes.status === 403) {
      throw new Error("API Token không hợp lệ hoặc hết hạn. Vui lòng kiểm tra lại trong Cài đặt.");
    }
    if (runRes.status === 404) {
      throw new Error("Không tìm thấy Actor Melon trên Apify. Vui lòng kiểm tra lại Actor ID.");
    }
    if (runRes.status === 429) {
      throw new Error("Đã vượt quá giới hạn API Apify. Vui lòng thử lại sau vài phút.");
    }
    throw new Error(errJson?.error?.message ?? `Lỗi kết nối Apify (${runRes.status}). Vui lòng thử lại.`);
  }

  const runData = await runRes.json();
  const runId: string = runData?.data?.id;
  if (!runId) throw new Error("Không nhận được run ID từ Apify. Vui lòng thử lại.");

  // 180s timeout — fetchDetails: true cần crawl lyrics từng bài
  const datasetId = await pollRunUntilFinished(apifyToken, runId, 180);

  const itemsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}&format=json&clean=true`
  );
  if (!itemsRes.ok) throw new Error(`Không lấy được dữ liệu bài hát (${itemsRes.status}). Vui lòng thử lại.`);

  const items = await itemsRes.json();
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Apify trả về dữ liệu trống. Melon có thể đang bảo trì, thử lại sau.");
  }
  return normalizeMelonItems(items);
}

// ─── Polling with progress callback ───────────────────────────────────────
export type PollProgressCallback = (elapsed: number, maxSeconds: number, status: string) => void;

async function pollRunUntilFinished(
  token: string,
  runId: string,
  maxSeconds: number,
  onProgress?: PollProgressCallback
): Promise<string> {
  const deadline = Date.now() + maxSeconds * 1000;
  const startTime = Date.now();
  let consecutiveErrors = 0;

  while (Date.now() < deadline) {
    await sleep(5000); // poll mỗi 5s thay vì 4s để giảm tải

    try {
      const res = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
      if (!res.ok) {
        consecutiveErrors++;
        if (consecutiveErrors >= 5) {
          throw new Error("Mất kết nối với Apify sau nhiều lần thử. Kiểm tra mạng và thử lại.");
        }
        continue;
      }
      consecutiveErrors = 0;

      const data = await res.json();
      const status: string = data?.data?.status ?? "RUNNING";
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      onProgress?.(elapsed, maxSeconds, status);

      if (status === "SUCCEEDED") {
        const datasetId: string = data?.data?.defaultDatasetId;
        if (!datasetId) throw new Error("Không tìm thấy dataset ID sau khi Actor hoàn thành.");
        return datasetId;
      }
      if (status === "FAILED") {
        throw new Error("Actor Apify gặp lỗi khi chạy. Vui lòng thử lại hoặc kiểm tra Apify Console.");
      }
      if (status === "ABORTED") {
        throw new Error("Actor Apify bị hủy giữa chừng. Vui lòng thử lại.");
      }
      if (status === "TIMED-OUT") {
        throw new Error("Actor Apify chạy quá thời gian cho phép. Thử giảm số lượng kết quả hoặc thử lại sau.");
      }
    } catch (err) {
      if (err instanceof Error && (
        err.message.includes("Actor") ||
        err.message.includes("dataset") ||
        err.message.includes("Mất kết nối")
      )) {
        throw err; // re-throw known errors
      }
      consecutiveErrors++;
      if (consecutiveErrors >= 5) throw err;
      // network hiccup — tiếp tục poll
    }
  }

  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  throw new Error(
    `Quá thời gian chờ (${elapsed}s/${maxSeconds}s). Actor vẫn đang chạy trên Apify.\n` +
    `→ Thử lại sau 1-2 phút — Actor có thể đang bận hoặc Melon/Naver phản hồi chậm.\n` +
    `→ Kiểm tra Apify Console để xem trạng thái run ID: ${runId}`
  );
}

/**
 * Normalize Melon API response items to consistent format
 * @param items - Raw items from Apify Melon scraper
 * @returns Normalized array of MelonSongRaw with rank, title, artist, genre, lyrics
 */
function normalizeMelonItems(items: Record<string, unknown>[]): MelonSongRaw[] {
  return items.map((item, idx) => ({
    rank: (item.rank as number) ?? idx + 1,
    title: (item.title as string) ?? (item.songName as string) ?? "Unknown",
    artist: (item.artist as string) ?? (item.artistName as string) ?? (item.artistNames as string) ?? "Unknown",
    genre: (item.genre as string) ?? "K-pop",
    lyrics: (item.lyrics as string) ?? "",
    albumArt:
      (item.albumImageUrl as string) ??
      (item.albumArt as string) ??
      (item.imageUrl as string) ??
      "",
  }));
}

// ─── Apify Naver KiN Scraper ───────────────────────────────────────────────
export interface NaverKiNRaw {
  id: string;
  questionKr: string;
  category: string;
  views: number;
  answers: number;
  date: string;
  originalAnswer: string;
}

/**
 * Naver KiN scraper — supports 2 modes:
 * 1. keyword: search by keyword (default)
 * 2. url: crawl directly from Naver KiN URL
 * 
 * Actor: oxygenated_quagmire/naver-kin-scraper
 * Ref: https://dev.to/sessionzero_ai/naver-kin-scraper-korean-qa-data-how-to-extract-insights-from-koreas-yahoo-answers-2in0
 * 
 * @param apifyToken - Apify API token for authentication
 * @param options - Configuration options for the scraper
 * @param options.mode - Scrape mode: 'keyword' or 'url'
 * @param options.keyword - Search keyword (required if mode is 'keyword')
 * @param options.url - Direct Naver KiN URL (required if mode is 'url')
 * @param options.maxResults - Maximum number of results to fetch (default: 50)
 * @returns Array of Naver KiN Q&A data
 * @throws Error if API token is invalid, parameters missing, or connection fails
 */
export async function fetchNaverKiN(
  apifyToken: string,
  keyword: string,
  options?: {
    maxResults?: number;
    startUrl?: string; // URL Naver KiN trực tiếp (optional)
    onProgress?: PollProgressCallback;
  }
): Promise<NaverKiNRaw[]> {
  const ACTOR_ID = "oxygenated_quagmire~naver-kin-scraper";
  const maxResults = options?.maxResults ?? 30;
  const onProgress = options?.onProgress;

  // Build actor input — hỗ trợ cả keyword search và URL crawl
  let actorInput: Record<string, unknown>;

  if (options?.startUrl) {
    // Mode 2: crawl trực tiếp từ URL
    actorInput = {
      startUrls: [{ url: options.startUrl }],
      query: keyword,
      maxItems: maxResults,
      proxyConfiguration: { useApifyProxy: true },
    };
  } else {
    // Mode 1: keyword search — field "query" là bắt buộc theo actor schema
    actorInput = {
      query: keyword,
      maxItems: maxResults,
      sort: "sim",
      proxyConfiguration: { useApifyProxy: true },
    };
  }

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/${encodeURIComponent(ACTOR_ID)}/runs?token=${apifyToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actorInput),
    }
  );

  if (!runRes.ok) {
    const errText = await runRes.text();
    let errJson: { error?: { message?: string } } = {};
    try { errJson = JSON.parse(errText); } catch { /* ignore */ }

    if (runRes.status === 401 || runRes.status === 403) {
      throw new Error("API Token không hợp lệ hoặc hết hạn. Vui lòng kiểm tra lại trong Cài đặt.");
    }
    if (runRes.status === 404) {
      throw new Error(
        "Không tìm thấy Actor Naver KiN trên Apify.\n" +
        "→ Vào Apify Console → Actors → tìm 'naver-kin-scraper' và kiểm tra Actor ID."
      );
    }
    if (runRes.status === 429) {
      throw new Error("Đã vượt quá giới hạn API Apify. Vui lòng thử lại sau vài phút.");
    }
    throw new Error(errJson?.error?.message ?? `Lỗi kết nối Apify Naver (${runRes.status}). Vui lòng thử lại.`);
  }

  const runData = await runRes.json();
  const runId: string = runData?.data?.id;
  if (!runId) throw new Error("Không nhận được run ID từ Apify. Vui lòng thử lại.");

  // 150s timeout cho Naver KiN (tăng từ 90s)
  const datasetId = await pollRunUntilFinished(apifyToken, runId, 150, onProgress);

  const itemsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}&format=json&clean=true`
  );
  if (!itemsRes.ok) throw new Error(`Không lấy được dữ liệu câu hỏi (${itemsRes.status}). Vui lòng thử lại.`);

  const items = await itemsRes.json();
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(
      `Không tìm thấy câu hỏi nào cho từ khóa "${keyword}".\n` +
      `→ Thử từ khóa tiếng Hàn khác (ví dụ: 한국어 공부, K-pop 가사)\n` +
      `→ Hoặc dán URL Naver KiN trực tiếp vào ô tìm kiếm`
    );
  }
  return normalizeNaverItems(items);
}

/**
 * Normalize Naver KiN API response items to consistent format
 * @param items - Raw items from Apify Naver KiN scraper
 * @returns Normalized array of NaverKiNRaw with id, question, category, views, answers, date, originalAnswer
 */
function normalizeNaverItems(items: Record<string, unknown>[]): NaverKiNRaw[] {
  return items.map((item, idx) => ({
    id:
      (item.id as string) ??
      (item.questionId as string) ??
      (item.docId as string) ??
      `nq-${idx + 1}`,
    questionKr:
      (item.question as string) ??
      (item.title as string) ??
      (item.questionTitle as string) ??
      (item.subject as string) ??
      "",
    category:
      (item.category as string) ??
      (item.categoryName as string) ??
      (item.dirName as string) ??
      "K-pop",
    views:
      (item.views as number) ??
      (item.viewCount as number) ??
      (item.readCount as number) ??
      0,
    answers:
      (item.answers as number) ??
      (item.answerCount as number) ??
      (item.replyCount as number) ??
      0,
    date:
      (item.date as string) ??
      (item.createdAt as string) ??
      (item.registDate as string) ??
      (item.writeDate as string) ??
      new Date().toISOString().split("T")[0],
    originalAnswer:
      (item.answer as string) ??
      (item.bestAnswer as string) ??
      (item.content as string) ??
      (item.answerContent as string) ??
      "",
  }));
}

/**
 * Sleep for specified milliseconds
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
