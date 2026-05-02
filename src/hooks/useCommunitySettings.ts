import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface CommunitySettings {
  access_control_enabled: boolean;
  guest_view_limit: number;
  member_daily_post_limit: number;
  vip_daily_post_limit: number;
  access_mode: "normal" | "holiday" | "maintenance";
  mode_note: string | null;
}

const DEFAULT_SETTINGS: CommunitySettings = {
  access_control_enabled: true,
  guest_view_limit: 3,
  member_daily_post_limit: 5,
  vip_daily_post_limit: 0,
  access_mode: "normal",
  mode_note: null,
};

let cachedSettings: CommunitySettings | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 60_000; // 1 phút

export function useCommunitySettings() {
  const [settings, setSettings] = useState<CommunitySettings>(cachedSettings || DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(!cachedSettings);

  const fetchSettings = useCallback(async () => {
    if (cachedSettings && Date.now() < cacheExpiry) {
      setSettings(cachedSettings);
      return;
    }
    const { data } = await supabase
      .from("community_settings")
      .select("*")
      .eq("id", "global")
      .maybeSingle();
    if (data) {
      cachedSettings = data as CommunitySettings;
      cacheExpiry = Date.now() + CACHE_TTL;
      setSettings(cachedSettings);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  return { settings, loading, refetch: fetchSettings };
}

/** Xóa cache khi admin cập nhật */
export function invalidateCommunitySettingsCache() {
  cachedSettings = null;
  cacheExpiry = 0;
}
