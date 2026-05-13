# Melon Chart Data Fetching Guide

## Overview

This script fetches real Melon Chart data from Apify and saves it to a JSON file. The web app then loads data from this JSON file instead of using API calls directly.

## Why This Approach?

- **No API calls on web**: Web just reads from JSON file - faster, more reliable
- **Data control**: You can review/edit data before deploying
- **Cost effective**: Only fetch when needed (daily/weekly)
- **Offline capable**: Web works even without API access

## Prerequisites

1. **Apify Account**: Sign up at https://apify.com (free tier available)
2. **API Key**: Get your API key from Apify Settings
3. **Python**: Python 3.7+
4. **Apify Client**: `pip install apify-client`

## Setup

1. Install dependencies:
```bash
pip install apify-client
```

2. Set your API key:
```bash
export APIFY_API_KEY=your-actual-api-key
```

Or set it in the script directly (not recommended for production).

## Usage

### Fetch TOP 100 Chart

```bash
cd scripts
python fetch_melon_data.py
```

This will:
- Fetch TOP 100 chart with full details (lyrics, genre, release date)
- Save to `src/mocks/melonSongs_real.json`
- Take ~10-30 seconds

### Output Format

The JSON file contains:
```json
[
  {
    "rank": 1,
    "title": "Supernova",
    "artist": "aespa",
    "genre": "K-pop",
    "lyrics": "...",
    "albumArt": "...",
    "processed": false,
    "releaseDate": "2024-05-27",
    "album": "Armageddon"
  }
]
```

## Update Web

After fetching data:

1. The web app automatically loads from `src/mocks/melonSongs_real.json`
2. If JSON is empty/missing, it falls back to mock data
3. Commit the updated JSON file:
```bash
git add src/mocks/melonSongs_real.json
git commit -m "update: refresh Melon chart data"
git push
```

## Schedule Updates

### Manual (Recommended)
Run the script weekly to keep data fresh:
```bash
# Run every Monday
python scripts/fetch_melon_data.py
```

### Automated (Optional)
Create a cron job or GitHub Action to run automatically.

## Troubleshooting

**Error: "Please set APIFY_API_KEY"**
- Set the environment variable: `export APIFY_API_KEY=your-key`

**No items fetched**
- Check your API key is valid
- Check Apify account has credits
- Try running again (temporary API issue)

**Web not showing new data**
- Make sure JSON file was saved correctly
- Check file path: `src/mocks/melonSongs_real.json`
- Restart dev server

## Cost

- **Apify**: $0.50 per 1,000 tracks
- **TOP 100**: ~$0.05 per fetch
- **Free tier**: Available on Apify

## Advanced Options

Edit `fetch_melon_data.py` to customize:

```python
# Fetch weekly chart instead of TOP 100
api_data = fetch_melon_data(mode="weekly", fetch_details=True, max_results=100)

# Search for specific artist
api_data = fetch_melon_data(mode="search", keyword="아이유", max_results=50)
```

## References

- Apify Actor: https://apify.com/oxygenated_quagmire/melon-chart-scraper
- Dev.to Guide: https://dev.to/sessionzero_ai/track-k-pop-trends-with-melon-chart-data-a-developers-guide-1m50
