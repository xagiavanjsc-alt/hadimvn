// Supabase Edge Function: send-email
// Gửi email transactional qua Resend API
// Deploy: supabase functions deploy send-email --no-verify-jwt
// Env vars (Supabase Dashboard → Edge Functions → Settings):
//   - RESEND_API_KEY: API key từ Resend (re_xxx)
//   - SENDER_EMAIL: noreply@hanquocoi.vn
//   - SENDER_NAME: Hàn Quốc Ơi!
//   - SITE_URL: https://hanquocoi.vn
//   - INTERNAL_API_SECRET: secret để xác thực request (tự tạo, dán vào DB triggers)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { TEMPLATES } from "./templates.ts";

interface SendEmailPayload {
  template: string;
  to: string;
  variables?: Record<string, string | number>;
}

function renderTemplate(html: string, vars: Record<string, string | number>): string {
  let out = html;
  for (const [key, value] of Object.entries(vars)) {
    const placeholder = `{{${key}}}`;
    out = out.split(placeholder).join(String(value));
  }
  return out;
}

serve(async (req: Request) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-internal-secret",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Auth: kiểm tra internal secret (để chỉ DB triggers / cron gọi được)
  const internalSecret = Deno.env.get("INTERNAL_API_SECRET");
  const reqSecret = req.headers.get("x-internal-secret");
  if (!internalSecret || reqSecret !== internalSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload = (await req.json()) as SendEmailPayload;
    const { template, to, variables = {} } = payload;

    if (!template || !to) {
      return new Response(JSON.stringify({ error: "Missing template or to" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tmpl = TEMPLATES[template];
    if (!tmpl) {
      return new Response(JSON.stringify({ error: `Unknown template: ${template}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Default vars
    const allVars = {
      SITE_URL: Deno.env.get("SITE_URL") ?? "https://hanquocoi.vn",
      USER_NAME: "bạn",
      ...variables,
    };

    const html = renderTemplate(tmpl.html, allVars);
    const subject = renderTemplate(tmpl.subject, allVars);

    const senderEmail = Deno.env.get("SENDER_EMAIL") ?? "noreply@hanquocoi.vn";
    const senderName = Deno.env.get("SENDER_NAME") ?? "Hàn Quốc Ơi!";
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${senderName} <${senderEmail}>`,
        to: [to],
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Resend API error", details: data }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error", message: (err as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
