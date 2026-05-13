# Melon Songs Pipeline

## Cách dùng

### Cài đặt
```bash
pip install requests google-generativeai
```

### Full pipeline (fetch + enrich)
```bash
python pipeline_melon.py \
  --apify-token YOUR_APIFY_TOKEN \
  --gemini-key YOUR_GEMINI_KEY \
  --limit 100 \
  --output melon_enriched.json
```

### Chỉ fetch (không enrich)
```bash
python pipeline_melon.py \
  --apify-token YOUR_APIFY_TOKEN \
  --limit 100 \
  --skip-enrich \
  --output melon_raw.json
```

### Enrich từ file có sẵn (không cần fetch lại)
```bash
python pipeline_melon.py \
  --input melon_raw.json \
  --gemini-key YOUR_GEMINI_KEY \
  --output melon_enriched.json
```

### Test với 5 bài
```bash
python pipeline_melon.py \
  --apify-token YOUR_TOKEN \
  --gemini-key YOUR_KEY \
  --limit 5 \
  --output test_5.json
```

## Sau khi xong

Upload file `melon_enriched.json` vào:
`https://hanquocoi.vn/admin` → **Quản lý Melon Chart** → Upload file

## Lấy API Keys

- **Apify**: https://console.apify.com/account/integrations
- **Gemini**: https://aistudio.google.com/app/apikey (miễn phí 15 req/min)

## Output format

```json
[
  {
    "rank": 1,
    "title": "Supernova",
    "artist": "aespa",
    "genre": "K-pop",
    "lyrics": "...",
    "albumArt": "https://...",
    "processed": true,
    "translation": {
      "full": "Bản dịch tiếng Việt...",
      "lines": []
    },
    "vocabulary": [
      {
        "korean": "세계",
        "vietnamese": "thế giới",
        "romaji": "segye",
        "partOfSpeech": "noun",
        "topikLevel": 1,
        "frequency": "high",
        "context": "나를 중심으로 돌아가는 이 세계"
      }
    ],
    "grammar": [
      {
        "pattern": "-는",
        "meaning": "Đuôi định ngữ cho động từ ở thì hiện tại",
        "level": "TOPIK 1",
        "examples": [
          {
            "sentence": "돌아가는 이 세계",
            "translation": "thế giới đang quay"
          }
        ]
      }
    ],
    "difficulty": {
      "level": "medium",
      "score": 2,
      "label": "Trung bình",
      "color": "yellow",
      "reason": "Có nhiều từ vựng TOPIK 3-4"
    }
  }
]
```
