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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin using their JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create client with caller's JWT to verify identity
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await callerClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role client to bypass RLS
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Check if caller is admin
    const { data: callerProfile } = await adminClient
      .from("user_profiles")
      .select("is_admin, display_name")
      .eq("id", user.id)
      .maybeSingle();

    if (!callerProfile?.is_admin) {
      return new Response(JSON.stringify({ error: "Access denied: not admin" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const action = body.action;

    if (action === "grant_vip") {
      const { userId, vipType, expiresAt, amount, note } = body;

      // Get target user info
      const { data: targetUser } = await adminClient
        .from("user_profiles")
        .select("display_name, email")
        .eq("id", userId)
        .maybeSingle();

      // Update user profile with VIP using service role (bypasses RLS)
      const { error: updateErr } = await adminClient
        .from("user_profiles")
        .update({
          is_vip: true,
          vip_type: vipType,
          vip_expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateErr) throw updateErr;

      // Log revenue entry - match actual schema columns
      const vipAmount = amount || (vipType === "year" ? 990000 : 99000);
      const { error: logErr } = await adminClient.from("vip_revenue_log").insert({
        user_id: userId,
        user_name: targetUser?.display_name || "Unknown",
        user_email: targetUser?.email || "",
        vip_type: vipType,
        amount: vipAmount,
        granted_by: user.id,
        granted_at: new Date().toISOString(),
        expires_at: expiresAt,
        note: note || `Cấp bởi admin ${callerProfile.display_name}`,
      });

      if (logErr) {
        // Log error but don't fail the whole operation
        console.error("Revenue log error:", logErr);
      }

      return new Response(JSON.stringify({ success: true, userName: targetUser?.display_name }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "revoke_vip") {
      const { userId } = body;
      const { error } = await adminClient
        .from("user_profiles")
        .update({
          is_vip: false,
          vip_type: "none",
          vip_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "toggle_admin") {
      const { userId, isAdmin } = body;
      const { error } = await adminClient
        .from("user_profiles")
        .update({
          is_admin: isAdmin,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_revenue") {
      // Get VIP revenue log for dashboard stats
      const { data, error } = await adminClient
        .from("vip_revenue_log")
        .select("*")
        .order("granted_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_settings") {
      const { data, error } = await adminClient
        .from("admin_settings")
        .select("*")
        .eq("id", "global")
        .maybeSingle();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "save_settings") {
      const { settings } = body;
      const { error } = await adminClient
        .from("admin_settings")
        .update({
          apify_token: settings.apifyToken ?? "",
          ai_provider: settings.aiProvider ?? "gemini",
          ai_api_key: settings.aiApiKey ?? "",
          ai_model: settings.aiModel ?? "",
          story_prompt: settings.storyPrompt ?? {},
          updated_at: new Date().toISOString(),
        })
        .eq("id", "global");

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
