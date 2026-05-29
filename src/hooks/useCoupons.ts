import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Coupon } from "@/pages/admin-coupon/page";

interface DbCoupon {
  id: string;
  code: string;
  discount: number;
  discount_type: "percent" | "fixed";
  channel: string;
  series_id: string;
  usage_count: number;
  max_usage: number | null;
  coupon_type: "ebook" | "vip";
  vip_plan: "month" | "year" | "both" | null;
  note: string | null;
  is_active: boolean;
  created_at: string;
}

function dbToLocal(c: DbCoupon): Coupon {
  return {
    id: c.id,
    code: c.code,
    discount: c.discount,
    discountType: c.discount_type,
    channel: c.channel,
    seriesId: c.series_id,
    usageCount: c.usage_count,
    maxUsage: c.max_usage,
    couponType: c.coupon_type,
    vipPlan: c.vip_plan ?? undefined,
    note: c.note ?? undefined,
    active: c.is_active,
    createdAt: c.created_at,
  };
}

// `id` is omitted for new coupons — DB defaults to gen_random_uuid().
// For updates we still send it via the upsert key.
function localToDb(c: Coupon): Omit<DbCoupon, "created_at" | "id"> & { id?: string } {
  const isClientId = c.id.startsWith("cpn-");
  return {
    ...(isClientId ? {} : { id: c.id }),
    code: c.code,
    discount: c.discount,
    discount_type: c.discountType,
    channel: c.channel,
    series_id: c.seriesId,
    usage_count: c.usageCount,
    max_usage: c.maxUsage,
    coupon_type: c.couponType,
    vip_plan: c.vipPlan ?? null,
    note: c.note ?? null,
    is_active: c.active,
  };
}

export function useCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    setCoupons((data ?? []).map(dbToLocal));
    setLoading(false);
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const saveCoupon = useCallback(async (coupon: Coupon) => {
    const dbData = localToDb(coupon);
    const isClientId = !("id" in dbData);
    // New coupon → insert (DB gens UUID, returns the row).
    // Existing coupon → update by id.
    if (isClientId) {
      const { data, error } = await supabase
        .from("coupons")
        .insert({ ...dbData, updated_at: new Date().toISOString() })
        .select()
        .single();
      if (error) return false;
      if (data) {
        const saved = dbToLocal(data as DbCoupon);
        setCoupons(prev => [saved, ...prev]);
      }
      return true;
    }
    const { error } = await supabase
      .from("coupons")
      .update({ ...dbData, updated_at: new Date().toISOString() })
      .eq("id", coupon.id);
    if (!error) {
      setCoupons(prev => prev.map(c => c.id === coupon.id ? coupon : c));
    }
    return !error;
  }, []);

  const deleteCoupon = useCallback(async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (!error) setCoupons(prev => prev.filter(c => c.id !== id));
    return !error;
  }, []);

  const toggleCoupon = useCallback(async (id: string) => {
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) return false;
    const newActive = !coupon.active;
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: newActive, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      console.warn("[useCoupons] toggleCoupon failed:", error.message);
      return false;
    }
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: newActive } : c));
    return true;
  }, [coupons]);

  const recordUsage = useCallback(async (id: string, times: number) => {
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) return false;
    const newCount = coupon.usageCount + times;
    const { error } = await supabase
      .from("coupons")
      .update({ usage_count: newCount, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      // If the count fails to increment, callers should NOT treat the
      // redemption as complete — otherwise max_usage caps stop enforcing.
      console.warn("[useCoupons] recordUsage failed:", error.message);
      return false;
    }
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, usageCount: newCount } : c));
    return true;
  }, [coupons]);

  return { coupons, loading, fetchCoupons, saveCoupon, deleteCoupon, toggleCoupon, recordUsage };
}
