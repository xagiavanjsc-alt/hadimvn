// Melon Chart API integration using Apify
// Based on: https://apify.com/oxygenated_quagmire/melon-chart-scraper

const ACTOR_ID = "oxygenated_quagmire/melon-chart-scraper";
const APIFY_API_KEY = import.meta.env.VITE_APIFY_API_KEY || "";

export interface MelonApiResponse {
  rank: number;
  title: string;
  artist: string;
  albumArt?: string;
  genre?: string;
  lyrics?: string;
  releaseDate?: string;
  album?: string;
}

export interface MelonApiOptions {
  mode: "top100" | "hot100" | "daily" | "weekly" | "monthly" | "search";
  fetchDetails?: boolean;
  maxResults?: number;
  keyword?: string;
}

/**
 * Fetch Melon chart data using Apify
 */
export async function fetchMelonData(options: MelonApiOptions): Promise<MelonApiResponse[]> {
  if (!APIFY_API_KEY) {
    console.warn("Apify API key not set. Using mock data.");
    return [];
  }

  try {
    const response = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${APIFY_API_KEY}`,
      },
      body: JSON.stringify({
        mode: options.mode,
        fetchDetails: options.fetchDetails || false,
        maxResults: options.maxResults || 100,
        keyword: options.keyword,
      }),
    });

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.statusText}`);
    }

    const runData = await response.json();
    const runId = runData.data.id;

    // Poll for results
    let items: MelonApiResponse[] = [];
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max wait

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const statusResponse = await fetch(
        `https://api.apify.com/v2/acts/${ACTOR_ID}/runs/${runId}`,
        {
          headers: {
            "Authorization": `Bearer ${APIFY_API_KEY}`,
          },
        }
      );

      const statusData = await statusResponse.json();

      if (statusData.data.status === "SUCCEEDED") {
        // Fetch items
        const datasetResponse = await fetch(
          `https://api.apify.com/v2/acts/${ACTOR_ID}/runs/${runId}/dataset/items`,
          {
            headers: {
              "Authorization": `Bearer ${APIFY_API_KEY}`,
            },
          }
        );

        items = await datasetResponse.json();
        break;
      } else if (statusData.data.status === "FAILED") {
        throw new Error("Apify run failed");
      }

      attempts++;
    }

    return items;
  } catch (error) {
    console.error("Error fetching Melon data:", error);
    return [];
  }
}

/**
 * Fetch TOP 100 chart
 */
export async function fetchTop100(): Promise<MelonApiResponse[]> {
  return fetchMelonData({
    mode: "top100",
    maxResults: 100,
    fetchDetails: true, // Get lyrics, genre, etc.
  });
}

/**
 * Search for songs by keyword
 */
export async function searchMelon(keyword: string, maxResults = 50): Promise<MelonApiResponse[]> {
  return fetchMelonData({
    mode: "search",
    keyword,
    maxResults,
    fetchDetails: true,
  });
}
