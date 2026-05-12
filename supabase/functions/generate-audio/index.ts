import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    // ── 1. Xác thực: chỉ admin mới được gọi ─────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await callerClient.auth.getUser();
    if (authErr || !user) return json({ error: "Unauthorized" }, 401);

    // Kiểm tra is_admin qua service role client (bypass RLS)
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: profile } = await adminClient
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    if (!profile?.is_admin) return json({ error: "Forbidden: admin only" }, 403);

    // ── 2. Nhận params ────────────────────────────────────────────────────────
    const { entryId, text } = await req.json();
    if (!entryId || !text?.trim()) return json({ error: "Missing entryId or text" }, 400);
    if (text.length > 200) return json({ error: "Text quá dài (max 200 ký tự)" }, 400);

    // ── 3. Gọi OpenAI TTS API ─────────────────────────────────────────────────
    if (!openaiKey) return json({ error: "OPENAI_API_KEY chưa được cấu hình" }, 500);

    const ttsRes = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text.trim(),
        voice: "alloy",   // alloy | echo | fable | onyx | nova | shimmer
        speed: 0.9,       // hơi chậm cho học sinh
      }),
    });

    if (!ttsRes.ok) {
      const errBody = await ttsRes.text();
      console.error("OpenAI TTS error:", errBody);
      return json({ error: "TTS API thất bại: " + ttsRes.status }, 500);
    }

    // ── 4. Upload audio vào Supabase Storage ─────────────────────────────────
    const audioBuffer = await ttsRes.arrayBuffer();
    const fileName = `vocab/${entryId}.mp3`;  // overwrite nếu đã có

    const { error: uploadErr } = await adminClient.storage
      .from("vocab-audio")
      .upload(fileName, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,  // ghi đè file cũ
      });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
      return json({ error: "Upload thất bại: " + uploadErr.message }, 500);
    }

    // ── 5. Lấy public URL + cập nhật DB ──────────────────────────────────────
    const { data: { publicUrl } } = adminClient.storage
      .from("vocab-audio")
      .getPublicUrl(fileName);

    const { error: dbErr } = await adminClient
      .from("hanja_vocab_entries")
      .update({ audio_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", entryId);

    if (dbErr) {
      console.error("DB update error:", dbErr);
      return json({ error: "Cập nhật DB thất bại: " + dbErr.message }, 500);
    }

    return json({ url: publicUrl });

  } catch (err) {
    console.error("generate-audio error:", err);
    return json({ error: "Internal server error" }, 500);
  }
});
