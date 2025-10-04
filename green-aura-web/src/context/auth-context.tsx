"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { createLogger } from "@/lib/logger";
import { ApiService } from "@/services/apiService";

const log = createLogger("AuthContext");

type User = {
  id: string;
  email?: string;
  full_name?: string;
  profile_picture_url?: string;
  role?: "customer" | "organization";
};

type AuthContextType = {
  user: User | null;
  profile: {
    id?: string;
    full_name?: string | null;
    role?: "customer" | "organization";
    phone_number?: string | null;
    profile_picture_url?: string | null;
  } | null;
  isLoading: boolean;
  signUpWithEmail: (
    fullName: string,
    email: string,
    password: string,
    role: "customer" | "organization"
  ) => Promise<{ error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  resendOtp: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    log.info("AuthProvider mounted - initializing session");
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        log.warn("AuthProvider timeout fallback: forcing isLoading=false after 3s");
        setIsLoading(false);
      }
    }, 3000);

    const fetchUser = async () => {
      try {
        const start = Date.now();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        log.info("fetchUser: getSession result", {
          hasSession: !!session,
          userId: session?.user?.id,
          ms: Date.now() - start,
        });

        if (session?.user) {
          const { data: profileData } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .maybeSingle();
          log.info("fetchUser: loaded profile", {
            hasProfile: !!profileData,
            role: (profileData as any)?.role,
          });

          setUser({
            id: session.user.id,
            email: session.user.email ?? undefined,
            full_name: profileData?.full_name ?? undefined,
            role: (profileData?.role as any) ?? undefined,
          });
          setProfile(profileData ?? null);

          // Auto-create organization for organization role
          if (
            (profileData as { role?: "customer" | "organization" } | null)?.role === "organization"
          ) {
            try {
              const existing = await ApiService.getOrganizationByOwner(session.user.id);
              if (!existing) {
                await supabase.from("organizations").insert({
                  name: profileData?.full_name || session.user.email || "My Organization",
                  owner_id: session.user.id,
                  is_active: true,
                });
              }
            } catch (e) {
              log.warn("Auto-create organization skipped", e);
            }
          }
        }
      } catch (error) {
        log.error("Error fetching user", error);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
        log.info("AuthProvider initial load complete");
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      log.info("onAuthStateChange", { event, userId: session?.user?.id });

      if (session?.user) {
        const { data: profileData } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        setUser({
          id: session.user.id,
          email: session.user.email ?? undefined,
          full_name: profileData?.full_name ?? undefined,
          role: (profileData?.role as any) ?? undefined,
        });
        setProfile(profileData ?? null);

        if (
          (profileData as { role?: "customer" | "organization" } | null)?.role === "organization"
        ) {
          try {
            const existing = await ApiService.getOrganizationByOwner(session.user.id);
            if (!existing) {
              await supabase.from("organizations").insert({
                name: profileData?.full_name || session.user.email || "My Organization",
                owner_id: session.user.id,
                is_active: true,
              });
            }
          } catch (e) {
            log.warn("Auto-create organization skipped", e);
          }
        }
      } else {
        setUser(null);
        setProfile(null);
      }

      clearTimeout(timeoutId);
      setIsLoading(false);
      log.info("AuthProvider auth state handled; isLoading=false");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUpWithEmail = async (
    fullName: string,
    email: string,
    password: string,
    role: "customer" | "organization"
  ) => {
    const { error } = await ApiService.signUpWithEmail(fullName, email, password, role);
    if (error) {
      log.error("Error signing up", error);
      return { error };
    }
    return { error: null };
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await ApiService.signInWithEmail(email, password);
    if (error) {
      log.error("Error signing in", error);
      return { error };
    }
    return { error: null };
  };

  const verifyOtp = async (email: string, token: string) => {
    const { error } = await ApiService.verifyOtp(email, token);
    if (error) {
      log.error("Error verifying OTP", error);
      return { error };
    }
    return { error: null };
  };

  const resendOtp = async (email: string) => {
    const { error } = await ApiService.resendOtp(email);
    if (error) {
      log.error("Error resending OTP", error);
      return { error };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const updateProfile = async (data: Partial<NonNullable<AuthContextType["profile"]>>) => {
    if (!user) return;

    try {
      const { data: existingProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (existingProfile) {
        const { error } = await supabase
          .from("users")
          .update(data as any)
          .eq("id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("users").insert([{ id: user.id, ...data } as any]);
        if (error) throw error;
      }

      const { data: updatedProfile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(updatedProfile);
    } catch (error) {
      log.error("Error updating profile", error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    signUpWithEmail,
    signInWithEmail,
    verifyOtp,
    resendOtp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
