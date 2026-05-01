
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const zaloOaToken = Deno.env.get("ZALO_OA_ACCESS_TOKEN") || "";
    const zaloOaId = Deno.env.get("ZALO_OA_ID") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    let body: {
      mode?: "manual" | "cron";
      userIds?: string[];
      message?: string;
      inactiveDays?: number;
    } = {};

    try {
      body = await req.json();
    } catch {
      body = { mode: "cron", inactiveDays: 1 };
    }

    const inactiveDays = body.inactiveDays ?? 1;
    const cutoffDate = new Date(Date.now() - inactiveDays * 24 * 60 * 60 * 1000).toISOString();

    // Get default message from admin_settings
    const { data: settingData } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "zalo_reminder_message")
      .maybeSingle();

    const defaultMessage = settingData?.value ||
      "🇰🇷 Chào bạn! Hôm nay bạn chưa học tiếng Hàn đúng không? Chỉ 10 phút thôi là đủ để giữ streak rồi! Vào hanquocoi.vn học ngay nhé! 🔥";

    const message = body.message || defaultMessage;

    // Find inactive users
    let usersToNotify: { id: string; display_name: string; zalo_user_id: string | null }[] = [];

    if (body.userIds && body.userIds.length > 0) {
      // Manual mode: specific users
      const { data } = await supabase
        .from("user_profiles")
        .select("id, display_name, zalo_user_id")
        .in("id", body.userIds);
      usersToNotify = data || [];
    } else {
      // Auto mode: find users inactive for inactiveDays
      const { data: inactiveUsers } = await supabase
        .from("leaderboard_snapshots")
        .select("user_id, updated_at")
        .lt("updated_at", cutoffDate)
        .limit(200);

      if (inactiveUsers && inactiveUsers.length > 0) {
        const userIds = inactiveUsers.map((u) => u.user_id);
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("id, display_name, zalo_user_id")
          .in("id", userIds)
          .eq("zalo_follow_oa", true); // Only users who follow OA
        usersToNotify = profiles || [];
      }
    }

    const results: { userId: string; status: "sent" | "failed"; error?: string }[] = [];

    for (const user of usersToNotify) {
      let status: "sent" | "failed" = "failed";
      let errorMsg: string | undefined;

      try {
        if (zaloOaToken && zaloOaId && user.zalo_user_id) {
          // Real Zalo OA API call
          const zaloRes = await fetch("https://openapi.zalo.me/v3.0/oa/message/cs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "access_token": zaloOaToken,
            },
            body: JSON.stringify({
              recipient: { user_id: user.zalo_user_id },
              message: {
                text: message,
              },
            }),
          });

          const zaloData = await zaloRes.json();
          if (zaloData.error === 0) {
            status = "sent";
          } else {
            errorMsg = `Zalo API error: ${zaloData.message || zaloData.error}`;
          }
        } else {
          // Simulation mode (no Zalo token configured)
          status = "sent";
          errorMsg = "Simulation mode - no Zalo OA token configured";
        }
      } catch (err) {
        errorMsg = err instanceof Error ? err.message : "Unknown error";
      }

      // Log the result
      await supabase.from("zalo_reminder_logs").insert({
        user_id: user.id,
        user_name: user.display_name,
        message,
        status,
        error_message: errorMsg,
        sent_at: new Date().toISOString(),
      });

      results.push({ userId: user.id, status, error: errorMsg });
    }

    const sentCount = results.filter((r) => r.status === "sent").length;
    const failedCount = results.filter((r) => r.status === "failed").length;

    return new Response(
      JSON.stringify({
        success: true,
        total: usersToNotify.length,
        sent: sentCount,
        failed: failedCount,
        results,
        message: `Đã gửi ${sentCount}/${usersToNotify.length} tin nhắn Zalo OA`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
