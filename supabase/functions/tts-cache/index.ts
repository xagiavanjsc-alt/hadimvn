// Edge Function: tts-cache
//
// Site-wide TTS cache for Korean text. Any authenticated user can call this
// on first interaction with a word — function checks the `tts_audio_cache`
// table, returns cached URL on hit, or generates+stores audio on miss.
//
// Provider is read from `admin_settings.tts_provider` (openai / elevenlabs /
// google). If no provider is configured, function returns 503 + records the
// text into `tts_audio_misses` so admin can batch-generate later. The frontend
// then falls back to Web Speech API.
//
// File naming: <latin_slug>-<8char hash>.mp3 — Korean chars in URLs break
// older Android WebViews and some CDN edges, so the slug stays ASCII.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Korean → Latin slug (kept in sync with src/utils/koreanRomanize.ts) ─────
const INITIALS = ["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"];
const MEDIALS  = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"];
const FINALS   = ["","g","kk","gs","n","nj","nh","d","l","lg","lm","lb","ls","lt","lp","lh","m","b","bs","s","ss","ng","j","ch","k","t","p","h"];
const HANGUL_BASE = 0xAC00;
const HANGUL_END  = 0xD7A3;

function romanizeChar(code: number): string {
  if (code < HANGUL_BASE || code > HANGUL_END) return "";
  const offset = code - HANGUL_BASE;
  return INITIALS[Math.floor(offset / 588)]
    + MEDIALS[Math.floor((offset % 588) / 28)]
    + FINALS[offset % 28];
}

function romanizeKorean(input: string): string {
  if (!input) return "audio";
  let out = "";
  for (const ch of input) {
    const code = ch.codePointAt(0)!;
    if (code >= HANGUL_BASE && code <= HANGUL_END) out += romanizeChar(code);
    else if (/[a-zA-Z0-9]/.test(ch)) out += ch;
    else out += "-";
  }
  return out.toLowerCase().replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "audio";
}

function normalize(s: string): string {
  return s.normalize("NFC").trim().replace(/\s+/g, " ");
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// ─── TTS provider adapters ───────────────────────────────────────────────────
interface ProviderConfig {
  provider: "openai" | "elevenlabs" | "google";
  voice_id: string;
  model?: string;
  speed?: number;
}

async function generateOpenAI(text: string, cfg: ProviderConfig, apiKey: string): Promise<ArrayBuffer> {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: cfg.model || "tts-1",
      input: text,
      voice: cfg.voice_id || "alloy",
      speed: cfg.speed ?? 0.9,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI TTS ${res.status}: ${await res.text()}`);
  return await res.arrayBuffer();
}

async function generateElevenLabs(text: string, cfg: ProviderConfig, apiKey: string): Promise<ArrayBuffer> {
  const voiceId = cfg.voice_id || "21m00Tcm4TlvDq8ikWAM"; // default ElevenLabs voice
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json", "Accept": "audio/mpeg" },
    body: JSON.stringify({
      text,
      model_id: cfg.model || "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return await res.arrayBuffer();
}

async function generateGoogle(text: string, cfg: ProviderConfig, apiKey: string): Promise<ArrayBuffer> {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: "ko-KR", name: cfg.voice_id || "ko-KR-Neural2-A" },
      audioConfig: { audioEncoding: "MP3", speakingRate: cfg.speed ?? 0.95 },
    }),
  });
  if (!res.ok) throw new Error(`Google TTS ${res.status}: ${await res.text()}`);
  const json = await res.json();
  // Google returns base64 — convert to ArrayBuffer.
  const bin = atob(json.audioContent);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

// ─── Main handler ────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // ── 1. Auth: any authenticated user may call (not admin-only) ─────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await callerClient.auth.getUser();
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);

    // ── 2. Params ─────────────────────────────────────────────────────────────
    const body = await req.json().catch(() => ({}));
    const text: string = String(body.text || "").trim();
    const forceRegenerate: boolean = Boolean(body.force);
    if (!text) return json({ error: "Missing text" }, 400);
    if (text.length > 300) return json({ error: "Text quá dài (max 300 ký tự)" }, 400);

    const normalized = normalize(text);
    const textHash = await sha256Hex(normalized);

    // ── 3. Service client for cache lookup + writes ──────────────────────────
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // ── 4. Cache hit? ─────────────────────────────────────────────────────────
    if (!forceRegenerate) {
      const { data: existing } = await adminClient
        .from("tts_audio_cache")
        .select("audio_url, manual_override")
        .eq("text_hash", textHash)
        .maybeSingle();
      if (existing?.audio_url) {
        // Fire-and-forget hit counter via the SECURITY DEFINER RPC so we
        // don't block the response on an UPDATE roundtrip.
        adminClient.rpc("increment_tts_hit", { p_text_hash: textHash }).then(() => {});
        return json({ url: existing.audio_url, source: "cache" });
      }
    }

    // ── 5. Cache miss — fetch provider config from admin_settings ────────────
    const { data: settings } = await adminClient
      .from("admin_settings")
      .select("value")
      .eq("key", "tts_provider")
      .maybeSingle();

    // admin_settings.value is text; we stringify our config JSON when saving
    // from the admin UI so the schema stays compatible with the rest of the
    // settings rows (string values).
    let cfg: ProviderConfig | null = null;
    if (settings?.value) {
      try { cfg = JSON.parse(settings.value as string); } catch { cfg = null; }
    }
    if (!cfg?.provider) {
      // Record miss so admin can review demand.
      await adminClient.rpc("record_tts_miss", { p_text: normalized, p_text_hash: textHash })
        .catch(async () => {
          // RPC may not exist yet — fall back to direct upsert.
          await adminClient.from("tts_audio_misses").upsert(
            { text: normalized, text_hash: textHash, last_seen_at: new Date().toISOString() },
            { onConflict: "text_hash" }
          );
        });
      return json({ error: "TTS provider not configured", needsAdmin: true }, 503);
    }

    // ── 6. Generate via provider ──────────────────────────────────────────────
    const apiKey = Deno.env.get(
      cfg.provider === "openai" ? "OPENAI_API_KEY"
      : cfg.provider === "elevenlabs" ? "ELEVENLABS_API_KEY"
      : "GOOGLE_TTS_API_KEY"
    );
    if (!apiKey) return json({ error: `${cfg.provider} API key not set in env` }, 500);

    let buf: ArrayBuffer;
    if (cfg.provider === "openai") buf = await generateOpenAI(normalized, cfg, apiKey);
    else if (cfg.provider === "elevenlabs") buf = await generateElevenLabs(normalized, cfg, apiKey);
    else buf = await generateGoogle(normalized, cfg, apiKey);

    // ── 7. Upload to storage ──────────────────────────────────────────────────
    const slug = romanizeKorean(normalized);
    const filename = `${slug}-${textHash.slice(0, 8)}.mp3`;

    const { error: upErr } = await adminClient.storage
      .from("tts-audio")
      .upload(filename, buf, { contentType: "audio/mpeg", upsert: true });
    if (upErr) return json({ error: "Storage upload failed: " + upErr.message }, 500);

    const { data: { publicUrl } } = adminClient.storage
      .from("tts-audio").getPublicUrl(filename);

    // ── 8. Insert cache row ──────────────────────────────────────────────────
    await adminClient.from("tts_audio_cache").upsert({
      text: normalized,
      text_hash: textHash,
      latin_slug: slug,
      audio_url: publicUrl,
      voice_provider: cfg.provider,
      voice_id: cfg.voice_id,
      voice_speed: cfg.speed ?? 1.0,
      status: "ready",
    }, { onConflict: "text_hash" });

    // Clear from misses queue if it was there.
    await adminClient.from("tts_audio_misses").delete().eq("text_hash", textHash);

    return json({ url: publicUrl, source: "generated" });

  } catch (err) {
    console.error("tts-cache error:", err);
    return json({ error: "Internal error: " + (err instanceof Error ? err.message : String(err)) }, 500);
  }
});
