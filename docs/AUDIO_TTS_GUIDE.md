# Hướng dẫn — Audio TTS Cache

> File này lưu lại toàn bộ kiến trúc + cách dùng + checklist cho hệ thống audio site-wide. Đọc lại bất cứ khi nào cần.

## 🎯 Mục tiêu

User nhấn 1 từ tiếng Hàn → app phát audio. **Lần đầu** gọi provider (OpenAI/ElevenLabs/Google) tốn token, **mọi lần sau** đọc trực tiếp từ Supabase Storage — miễn phí, nhanh, không tốn token.

Tên file audio luôn là chữ Latin (`annyeonghaseyo-7c4f1e92.mp3`) để tránh lỗi URL trên Android cũ / một số CDN edge.

---

## 🏗 Kiến trúc

```
┌─────────────────────────────────────────────────────────────────┐
│ User nhấn từ "안녕하세요"                                          │
│        │                                                          │
│        ▼                                                          │
│  useKoreanAudio().play("안녕하세요")                               │
│        │                                                          │
│        ▼                                                          │
│  audioService.getKoreanAudioUrl(text)                            │
│        │                                                          │
│        ▼                                                          │
│  Supabase Edge Function: tts-cache                               │
│        │                                                          │
│        ├─ Hash text (SHA-256) → check tts_audio_cache table     │
│        │                                                          │
│        ├─ CACHE HIT  ──► return audio_url + bump hit_count       │
│        │                                                          │
│        └─ CACHE MISS ──► đọc admin_settings.tts_provider         │
│                          │                                        │
│                          ├─ Có provider:                          │
│                          │    gọi OpenAI/ElevenLabs/Google        │
│                          │    upload mp3 vào bucket `tts-audio`  │
│                          │    insert row vào tts_audio_cache     │
│                          │    return URL                          │
│                          │                                        │
│                          └─ Chưa cấu hình provider:               │
│                               insert vào tts_audio_misses queue   │
│                               return 503                          │
│                               → client fallback Web Speech API    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File liên quan

| File | Vai trò |
|------|---------|
| `supabase/migrations/113_tts_audio_cache.sql` | DB schema + RPC + bucket policies |
| `supabase/functions/tts-cache/index.ts` | Edge function — entry point chính |
| `src/utils/koreanRomanize.ts` | Korean → Latin slug + SHA-256 |
| `src/lib/audioService.ts` | Service gọi edge function + fallback Web Speech |
| `src/hooks/useKoreanAudio.ts` | Hook React cho component dùng |
| `src/pages/admin-audio/page.tsx` | Admin UI tại `/admin/audio` |

---

## 🚀 Checklist deploy lần đầu

### 1. Chạy migration 113 ✅ (đã làm)
SQL Editor → paste `113_tts_audio_cache.sql` → Run.

Kiểm tra:
- `SELECT * FROM tts_audio_cache LIMIT 1;` → table tồn tại
- `SELECT * FROM tts_audio_misses LIMIT 1;` → table tồn tại
- `SELECT id FROM storage.buckets WHERE id = 'tts-audio';` → có row

### 2. Verify bucket `tts-audio` là PUBLIC
Vào **Supabase Dashboard → Storage → tts-audio → Settings**:
- ✅ "Public bucket" = ON

Nếu chưa public:
```sql
UPDATE storage.buckets SET public = true WHERE id = 'tts-audio';
```

### 3. Deploy edge function
Cài Supabase CLI (1 lần):
```bash
npm i -g supabase
supabase login
```

Link project:
```bash
cd /path/to/han
supabase link --project-ref <your-project-ref>
```
(Project ref tìm ở **Settings → General → Reference ID**)

Deploy:
```bash
supabase functions deploy tts-cache
```

Verify trên Dashboard: **Edge Functions → tts-cache** → status = "Deployed".

### 4. (Tạm thời) chưa cần API key
Hệ thống đã chạy được:
- User nhấn từ → 503 → client tự fallback Web Speech API (giọng robot)
- Server ghi nhận vào queue `tts_audio_misses` để admin biết user muốn audio gì

### 5. (Khi sẵn sàng) thêm API key
**Settings → Edge Functions → Secrets** → Add new secret:

Chọn 1 trong 3 (tôi khuyên OpenAI để bắt đầu):
| Provider | Key name | Giá | Chất lượng |
|----------|----------|-----|------------|
| OpenAI | `OPENAI_API_KEY` | $0.015/1k char | Khá tốt |
| ElevenLabs | `ELEVENLABS_API_KEY` | $0.30/1k char | Xuất sắc |
| Google | `GOOGLE_TTS_API_KEY` | $0.016/1k char (Neural2) | Tốt, đa giọng |

Sau khi add secret, **deploy lại function** để load env mới:
```bash
supabase functions deploy tts-cache
```

### 6. Cấu hình provider trong admin
`/admin/audio` → tab **"Cấu hình provider"**:
- Provider: OpenAI
- Voice ID: `alloy` (hoặc `nova` cho giọng nữ rõ hơn)
- Model: `tts-1` (rẻ) hoặc `tts-1-hd` (chất lượng cao gấp đôi giá)
- Speed: `0.9` (chậm hơn người bản xứ chút cho học viên)

Bấm **Lưu cấu hình**.

### 7. Test ngay tại admin
Cùng tab Config, scroll xuống **"Kiểm thử nhanh"** → nhập `안녕하세요` → bấm Test.
- Nếu nghe được giọng AI → ✅ OK
- Nếu không nghe → check Console Network tab → status code của request

### 8. Đổ cache cho queue
Tab **"Queue cần audio"** sẽ có các từ user đã nhấn lúc chưa cấu hình → bấm **"Tạo audio cho 20 từ hot nhất"** → đổ cache 1 lần.

---

## 💻 Cách dùng trong code

### Trong component bất kỳ
```tsx
import { useKoreanAudio } from "@/hooks/useKoreanAudio";

function VocabCard({ korean }: { korean: string }) {
  const { play, isPlaying } = useKoreanAudio();
  return (
    <button onClick={() => play(korean)} disabled={isPlaying}>
      <i className={isPlaying ? "ri-loader-4-line animate-spin" : "ri-volume-up-line"} />
    </button>
  );
}
```

### Ép phát lại (bỏ qua cache session)
```tsx
play(korean, { force: true });
```

### Gọi trực tiếp service không qua hook
```ts
import { playKoreanAudio, getKoreanAudioUrl } from "@/lib/audioService";

await playKoreanAudio("안녕하세요");          // play ngay
const url = await getKoreanAudioUrl("안녕"); // lấy URL để dùng cho <audio>
```

---

## 🛠 Admin panel quirks

### Tab Cache
- **Play (▶)**: nghe trực tiếp từ URL đã cache (không gọi provider).
- **Regenerate (⟳)**: ép gọi provider tạo lại — dùng khi giọng sai.
- **Upload (↑)**: thay bằng file MP3 bạn tự thu / mua → đánh dấu `manual_override`. Regenerate sau này sẽ hỏi xác nhận trước khi ghi đè.
- **Delete (🗑)**: xoá row + file storage. Lần sau user nhấn từ này sẽ phải tạo lại → **tốn token**.

### Tab Queue
- Sắp xếp theo `miss_count` (từ user nhấn nhiều nhất ở trên).
- Bấm **▶ generate** sinh từng từ.
- Bấm **× clear** xoá khỏi queue mà không sinh audio (dùng khi từ đó không nên phát — ví dụ chữ rác).
- Sau khi sinh thành công, row sẽ tự biến mất khỏi queue.

### Tab Config
- API key **KHÔNG** lưu DB — chỉ trong env edge function.
- Đổi provider giữa chừng: row cũ giữ provider cũ; chỉ row mới dùng provider mới. Muốn migrate đồng loạt → bulk regenerate.

---

## 🐛 Troubleshooting

### "TTS provider not configured" toast
→ Chưa cấu hình ở tab Config, hoặc cấu hình rồi nhưng env key chưa add / chưa deploy lại function. Check theo thứ tự:
1. Tab Config có lưu provider chưa? (`SELECT value FROM admin_settings WHERE key='tts_provider';`)
2. Secret env có chưa? Dashboard → Edge Functions → Secrets
3. Function deploy lại sau khi add secret chưa?

### Audio play không có tiếng
1. Mở DevTools → Network → tìm request `/functions/v1/tts-cache` → check response
2. Console có error CORS? → bucket phải PUBLIC
3. Mobile Safari im lặng → có thể do autoplay policy; user phải tap trước khi audio play

### File audio bị lỗi 404
- File chưa upload xong nhưng row đã insert (race condition)? → Vào tab Cache, bấm Regenerate.
- Storage policy chặn? → `SELECT * FROM storage.objects WHERE bucket_id='tts-audio' LIMIT 5;` để verify

### Tốn quá nhiều token
- Kiểm tra `tts_audio_cache.hit_count` — tỷ lệ hit/miss tốt là 95/5 trở lên
- Nếu nhiều miss → có thể app đang gen audio cho text dài/câu (vì hash khác nhau). Audio nên chỉ dành cho từ vựng đơn lẻ — câu dài nên chia ra hoặc TTS on-demand không cache

### Filename collision (cực hiếm)
- 2 từ tiếng Hàn khác nhau nhưng cùng romanize → cùng slug. Hệ thống append 8-char hash của text gốc → xác suất collide ~1 trong 4 tỷ. Nếu xảy ra, manually rename file trong Storage.

---

## 📊 SQL queries hữu ích

```sql
-- Top 50 audio được nghe nhiều nhất (popularity)
SELECT text, hit_count, voice_provider, created_at
FROM tts_audio_cache
ORDER BY hit_count DESC
LIMIT 50;

-- Audio mới tạo gần đây
SELECT text, latin_slug, voice_provider, created_at
FROM tts_audio_cache
ORDER BY created_at DESC
LIMIT 20;

-- Queue đang chờ
SELECT text, miss_count, last_seen_at
FROM tts_audio_misses
ORDER BY miss_count DESC;

-- Số token đã tốn (ước lượng — tính theo char)
SELECT
  voice_provider,
  COUNT(*) AS audio_files,
  SUM(LENGTH(text)) AS total_chars,
  ROUND(SUM(LENGTH(text)) * 0.000015, 2) AS estimated_usd_openai
FROM tts_audio_cache
WHERE manual_override = false
GROUP BY voice_provider;

-- Bulk delete audio cũ ít dùng (nếu cần dọn storage)
DELETE FROM tts_audio_cache
WHERE hit_count < 2
  AND created_at < NOW() - INTERVAL '90 days'
  AND manual_override = false;
-- Storage files phải xoá riêng — list bằng query trên, rồi xoá theo slug
```

---

## 🔐 Bảo mật

- **Authenticated user only** mới gọi được edge function (chặn anon spam token).
- **Admin only** mới sửa được `tts_audio_cache` / `tts_audio_misses` qua SQL.
- API key TTS **không** rò ra client — chỉ trong Supabase Secrets.
- Bucket `tts-audio` public READ — OK vì audio không phải dữ liệu riêng tư.
- Rate limit: text giới hạn 300 char/lần (chống abuse gen file lớn).

---

## 🔄 Migration sang provider khác

Khi muốn đổi (vd OpenAI → ElevenLabs):

1. Add secret ElevenLabs vào Edge Function env
2. Vào `/admin/audio` → tab Config → đổi Provider, lưu
3. Vào tab Cache → bấm **Bulk regenerate** (chỉ regen audio non-manual)
4. Kiểm tra vài file → nếu ok, để bulk chạy tự nhiên cho mọi từ user nhấn trong tương lai

---

## 📞 Khi gặp lỗi không xử lý được

1. Logs edge function: Supabase Dashboard → Edge Functions → tts-cache → Logs
2. Query `tts_audio_cache` xem row có insert được không
3. Network tab xem request body / response
4. Nếu vẫn không rõ → check `console.warn("[audioService]...")` trong DevTools

---

_Last updated: khi build hệ thống lần đầu. Khi thêm/sửa lớn → update file này._
