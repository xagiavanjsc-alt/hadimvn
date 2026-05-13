# Weekly Data Fetch Scripts

This directory contains scripts to fetch data from external APIs weekly with deduplication.

## Workflow: Markdown → JSON → Web

**Why Markdown?** Easier to edit manually (human-readable format)

**Workflow:**
1. Fetch data → Save as Markdown (for editing)
2. Edit Markdown manually (review, fix, approve)
3. Convert Markdown → JSON (for web app)
4. Commit JSON to Git → Deploy to VPS

## Scripts

### 1. fetch_melon_weekly.py
Fetches Melon Chart data with deduplication.

**Features:**
- Loads existing data from `src/mocks/melonSongs_real.json`
- Fetches new data from Apify (200 items to account for duplicates)
- Deduplicates based on rank + title + artist
- Keeps only 100 newest items
- Saves to **both** Markdown (for editing) and JSON (for web app)

**Usage:**
```bash
export APIFY_API_KEY=your-apify-api-key
python scripts/fetch_melon_weekly.py
```

**Output:**
- `src/mocks/melonSongs.md` - Markdown file (edit this!)
- `src/mocks/melonSongs_real.json` - JSON file (for web app)

### 2. fetch_naver_kin_weekly.py
Fetches Naver KiN Q&A data with deduplication.

**Features:**
- Loads existing data from `src/mocks/naver_kin_real.json`
- Fetches new data for Korean learning keywords (TOPIK, grammar, vocabulary, etc.)
- Deduplicates based on question title
- Keeps only 100 most popular items (sorted by likes)
- Saves to **both** Markdown (for editing) and JSON (for web app)

**Usage:**
```bash
export APIFY_API_KEY=your-apify-api-key
python scripts/fetch_naver_kin_weekly.py
```

**Output:**
- `src/mocks/naver_kin.md` - Markdown file (edit this!)
- `src/mocks/naver_kin_real.json` - JSON file (for web app)

### 3. convert_data.py
Convert between Markdown and JSON formats.

**Usage:**
```bash
# Convert Markdown to JSON (after editing)
python scripts/convert_data.py --to-json --type melon --input src/mocks/melonSongs.md --output src/mocks/melonSongs_real.json

# Convert JSON to Markdown (if needed)
python scripts/convert_data.py --to-markdown --type melon --input src/mocks/melonSongs_real.json --output src/mocks/melonSongs.md
```

## Deduplication Mechanism

Both fetch scripts use a similar deduplication pattern:

1. **Load existing data** from JSON file
2. **Generate unique keys** for each item:
   - Melon: `rank|title|artist`
   - Naver: `normalized_question_title`
3. **Fetch new data** from API (fetch more than needed)
4. **Filter out duplicates** by comparing keys
5. **Merge and limit** to target count (100 items)
6. **Save to both** Markdown (for editing) and JSON (for web app)

## Weekly Automation

### Option 1: GitHub Actions (Recommended)

Create `.github/workflows/weekly-fetch.yml`:

```yaml
name: Weekly Data Fetch
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday 9AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  fetch-melon:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: pip install apify-client
      - name: Fetch Melon data
        env:
          APIFY_API_KEY: ${{ secrets.APIFY_API_KEY }}
        run: python scripts/fetch_melon_weekly.py
      - name: Commit changes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add src/mocks/melonSongs_real.json
          git diff --quiet && git diff --staged --quiet || git commit -m "chore: update Melon chart data [skip ci]"
          git push

  fetch-naver:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: pip install apify-client
      - name: Fetch Naver KiN data
        env:
          APIFY_API_KEY: ${{ secrets.APIFY_API_KEY }}
        run: python scripts/fetch_naver_kin_weekly.py
      - name: Commit changes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add src/mocks/naver_kin_real.json
          git diff --quiet && git diff --staged --quiet || git commit -m "chore: update Naver KiN data [skip ci]"
          git push
```

**Setup:**
1. Add `APIFY_API_KEY` to GitHub repository secrets
2. Push the workflow file to `.github/workflows/weekly-fetch.yml`
3. Data will be fetched every Monday automatically

### Option 2: Cron Job (VPS)

Add to crontab:
```bash
crontab -e
```

Add lines:
```bash
# Fetch Melon data every Monday 9AM
0 9 * * 1 cd /path/to/han && export APIFY_API_KEY=your-key && python scripts/fetch_melon_weekly.py

# Fetch Naver KiN data every Monday 9:30AM
30 9 * * 1 cd /path/to/han && export APIFY_API_KEY=your-key && python scripts/fetch_naver_kin_weekly.py
```

## Output Files

**Markdown files (for editing):**
- `src/mocks/melonSongs.md` - Melon chart data (100 songs)
- `src/mocks/naver_kin.md` - Naver KiN Q&A data (100 items)

**JSON files (for web app):**
- `src/mocks/melonSongs_real.json` - Melon chart data (100 songs)
- `src/mocks/naver_kin_real.json` - Naver KiN Q&A data (100 items)

## Updating the Web App

**Step 1: Fetch data**
```bash
export APIFY_API_KEY=your-key
python scripts/fetch_melon_weekly.py
python scripts/fetch_naver_kin_weekly.py
```

**Step 2: Edit Markdown files** (if needed)
- Open `src/mocks/melonSongs.md` or `src/mocks/naver_kin.md`
- Review, fix, approve content
- Save changes

**Step 3: Convert Markdown to JSON**
```bash
python scripts/convert_data.py --to-json --type melon --input src/mocks/melonSongs.md --output src/mocks/melonSongs_real.json
python scripts/convert_data.py --to-json --type naver --input src/mocks/naver_kin.md --output src/mocks/naver_kin_real.json
```

**Step 4: Commit and push**
```bash
git add src/mocks/*.md src/mocks/*.json
git commit -m "chore: update weekly data"
git push
```

**Step 5: Deploy to VPS**
```bash
git pull
npm run build
# Restart your web server
```

## Troubleshooting

**No data fetched:**
- Check APIFY_API_KEY is set correctly
- Check Apify account has sufficient credits
- Check network connectivity

**Too many duplicates:**
- Increase `max_results` in the script
- Run script less frequently (bi-weekly instead of weekly)

**Data not updating on web:**
- Clear browser cache (Ctrl+Shift+R)
- Check if JSON files are committed to Git
- Rebuild and redeploy the web app

## Credits

- **Melon Chart Scraper**: https://apify.com/oxygenated_quagmire/melon-chart-scraper
- **Naver KiN Scraper**: https://apify.com/oxygenated_quagmire/naver-kin-scraper
- **Guide**: https://dev.to/sessionzero_ai/naver-kin-scraper-korean-qa-data-how-to-extract-insights-from-koreas-yahoo-answers-2in0
