import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

interface CacheRequest {
  data?: any
}

serve(async (req: Request) => {
  try {
    const url = new URL(req.url)
    const action = url.searchParams.get("action")
    const key = url.searchParams.get("key")
    const ttl = parseInt(url.searchParams.get("ttl") || "300")

    if (!key) {
      return new Response(JSON.stringify({ error: "Missing key parameter" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (action === "get") {
      const { data, error } = await supabase.rpc("get_leaderboard_cache", { p_key: key })
      if (error) throw error

      if (!data) {
        return new Response(JSON.stringify({ cached: false, data: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }

      return new Response(JSON.stringify({ cached: true, data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (action === "set") {
      const body = await req.json() as CacheRequest
      const { data } = body

      if (!data) {
        return new Response(JSON.stringify({ error: "Missing data in body" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }

      const { error } = await supabase.rpc("set_leaderboard_cache", {
        p_key: key,
        p_data: data,
        p_ttl_seconds: ttl,
      })

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (action === "invalidate") {
      const pattern = url.searchParams.get("pattern")
      const { data, error } = await supabase.rpc("invalidate_leaderboard_cache", {
        p_key_pattern: pattern,
      })

      if (error) throw error

      return new Response(JSON.stringify({ success: true, cleared: data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: get, set, or invalidate" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error: any) {
    console.error("Leaderboard cache error:", error)
    return new Response(JSON.stringify({ error: error.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
