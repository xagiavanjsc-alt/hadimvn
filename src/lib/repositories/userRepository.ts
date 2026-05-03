import { BaseRepository } from "./baseRepository";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  is_vip: boolean;
  vip_type?: "month" | "year" | "none";
  vip_expires_at?: string;
  is_admin: boolean;
  xp?: number;
  streak_count?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Repository for user_profiles table operations
 */
export class UserRepository extends BaseRepository<UserProfile> {
  constructor() {
    super("user_profiles");
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .eq("email", email)
      .single();
    
    if (error) throw error;
    return data as unknown as UserProfile | null;
  }

  /**
   * Update VIP status
   */
  async updateVipStatus(userId: string, isVip: boolean, vipType?: "month" | "year", expiresAt?: string) {
    const updates: Partial<UserProfile> = {
      is_vip: isVip,
      updated_at: new Date().toISOString(),
    };
    
    if (!isVip) {
      updates.vip_expires_at = null;
      updates.vip_type = "none";
    } else {
      updates.vip_expires_at = expiresAt;
      updates.vip_type = vipType ?? "month";
    }
    
    return this.update(userId, updates);
  }

  /**
   * Update XP
   */
  async updateXP(userId: string, xp: number) {
    return this.update(userId, {
      xp,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Update streak
   */
  async updateStreak(userId: string, streakCount: number) {
    return this.update(userId, {
      streak_count: streakCount,
      updated_at: new Date().toISOString(),
    });
  }
}

export const userRepository = new UserRepository();
