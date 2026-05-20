import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, UserProfile, isSupabaseConfigured } from "@/lib/supabase";
import { trackLoginSession } from "@/hooks/useAdminUsers";
import { reportError } from "@/lib/errorReporting";
import { getActiveRefCode, clearRefCode } from "@/hooks/useRefTracking";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string, displayName: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<UserProfile, "display_name" | "avatar_url">>) => Promise<UserProfile | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const INIT_TIMEOUT_MS = 4000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  });

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    return data as UserProfile | null;
  }, []);

  // Expose a method to refresh profile from DB (called after admin grants VIP)
  const refreshProfile = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) return;
    const profile = await fetchProfile(currentUser.id);
    if (profile) {
      setState(prev => ({ ...prev, profile }));
    }
  }, [fetchProfile]);

  const createProfile = useCallback(async (userId: string, displayName: string) => {
    const refCode = getActiveRefCode();
    // Avatar mặc định từ DiceBear API (miễn phí, ổn định)
    const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=b6e3f4`;
    const { data } = await supabase
      .from("user_profiles")
      .insert({ id: userId, display_name: displayName, avatar_url: defaultAvatar, ...(refCode ? { ref_code: refCode } : {}) })
      .select()
      .maybeSingle();
    if (refCode && data) clearRefCode();
    return data as UserProfile | null;
  }, []);

  useEffect(() => {
    // If Supabase is not configured, skip auth init entirely
    if (!isSupabaseConfigured) {
      setState({ user: null, session: null, profile: null, loading: false });
      return;
    }

    let mounted = true;
    let initialized = false;

    const applySession = (session: Session | null, isInitial: boolean) => {
      if (!mounted) return;
      // For INITIAL_SESSION: only process once to avoid Strict Mode double-fire
      if (isInitial && initialized) return;
      if (isInitial) initialized = true;

      if (session?.user) {
        // Set user/session immediately so the app can proceed.
        // Profile fetch is deferred with setTimeout to avoid Supabase auth lock deadlock.
        setState({ user: session.user, session, profile: null, loading: false });

        // Defer Supabase queries outside the onAuthStateChange callback
        // to prevent deadlock (supabase-js issue #762, #1401, #41968)
        setTimeout(async () => {
          if (!mounted) return;
          try {
            let profile = await fetchProfile(session.user.id);
            if (!profile && mounted) {
              const name = session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "Học viên";
              profile = await createProfile(session.user.id, name);
            }
            if (mounted) {
              setState(prev => ({ ...prev, profile }));
            }
          } catch (err) {
            reportError({
              type: "AUTH_PROFILE_ERROR",
              message: err instanceof Error ? err.message : "Failed to fetch/create profile",
              userId: session.user.id,
              stack: err instanceof Error ? err.stack : undefined,
            });
          }
        }, 0);
      } else {
        setState({ user: null, session: null, profile: null, loading: false });
      }
    };

    // Listen for auth state changes. Use setTimeout to defer ALL Supabase queries
    // outside the callback to prevent the deadlock where acquiring the internal
    // auth lock inside onAuthStateChange hangs forever.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      // Defer the handler to escape the auth lock context
      setTimeout(() => {
        if (!mounted) return;
        applySession(session, event === "INITIAL_SESSION");
      }, 0);
    });

    // Safety timeout: if onAuthStateChange never fires (deadlock, corrupted localStorage, etc.),
    // try getSession() one more time before giving up
    const timeout = setTimeout(async () => {
      if (!initialized) {
        console.warn("Auth initialization timed out, attempting getSession() fallback");
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            initialized = true;
            setState({ user: session.user, session, profile: null, loading: false });
            // Profile fetch deferred
            setTimeout(async () => {
              if (!mounted) return;
              try {
                let profile = await fetchProfile(session.user.id);
                if (!profile && mounted) {
                  const name = session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "Học viên";
                  profile = await createProfile(session.user.id, name);
                }
                if (mounted) setState(prev => ({ ...prev, profile }));
              } catch (err) {
                reportError({
                  type: "AUTH_PROFILE_FALLBACK_ERROR",
                  message: err instanceof Error ? err.message : "Failed to fetch/create profile (fallback)",
                  userId: session.user.id,
                  stack: err instanceof Error ? err.stack : undefined,
                });
              }
            }, 0);
            return;
          }
        } catch (err) {
          reportError({
            type: "AUTH_GETSESSION_ERROR",
            message: err instanceof Error ? err.message : "getSession() fallback failed",
            stack: err instanceof Error ? err.stack : undefined,
          });
        }
        // All attempts failed — show app without auth
        initialized = true;
        if (mounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    }, INIT_TIMEOUT_MS);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [fetchProfile, createProfile]);

  // Real-time subscription: auto-refresh profile when user_profiles row changes
  // This ensures VIP status updates immediately after admin grants VIP
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtime = () => {
      const userId = state.user?.id;
      if (!userId) return;

      try {
        channel = supabase
          .channel(`profile_changes_${userId}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "user_profiles",
              filter: `id=eq.${userId}`,
            },
            async () => {
              // Profile was updated (e.g. admin granted VIP) — re-fetch
              const updated = await fetchProfile(userId);
              if (updated) {
                setState(prev => ({ ...prev, profile: updated }));
              }
            }
          )
          .subscribe((status, err) => {
            if (err) console.warn("[AuthContext] Realtime error (non-fatal):", err.message);
            if (status === "CHANNEL_ERROR") console.warn("[AuthContext] Realtime channel error - VIP sync will not work in realtime");
          });
      } catch (e) {
        // WebSocket not available (iOS/mobile) — silently degrade, no crash
        console.warn("[AuthContext] Realtime not available, VIP sync disabled:", e);
      }
    };

    setupRealtime();

    return () => {
      try {
        if (channel) supabase.removeChannel(channel);
      } catch {}
    };
  }, [state.user?.id, fetchProfile]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return { data, error };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    // Track login session for security monitoring
    if (data?.user && !error) {
      setTimeout(() => trackLoginSession(data.user.id), 500);
    }
    return { data, error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, session: null, profile: null, loading: false });
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<UserProfile, "display_name" | "avatar_url">>) => {
    if (!state.user) return null;
    let finalUpdates = { ...updates, updated_at: new Date().toISOString() };
    // Nếu avatar_url được set về null, tạo lại avatar mặc định từ DiceBear
    if (updates.avatar_url === null && updates.display_name) {
      finalUpdates.avatar_url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(updates.display_name)}&backgroundColor=b6e3f4`;
    } else if (updates.avatar_url === null && state.profile?.display_name) {
      finalUpdates.avatar_url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(state.profile.display_name)}&backgroundColor=b6e3f4`;
    }
    const { data, error } = await supabase
      .from("user_profiles")
      .update(finalUpdates)
      .eq("id", state.user.id)
      .select()
      .maybeSingle();
    if (error) {
      console.error("[updateProfile] error:", error);
      alert("Lỗi cập nhật: " + error.message);
      return null;
    }
    if (!data) {
      console.warn("[updateProfile] no data returned (RLS may have blocked update)");
      alert("Cập nhật không thành công - kiểm tra quyền truy cập");
      return null;
    }
    setState(prev => ({ ...prev, profile: data as UserProfile }));
    return data as UserProfile;
  }, [state.user, state.profile]);

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
