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
};

type AuthContextType = {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  signUpWithEmail: (fullName: string, email: string, password: string) => Promise<{ error: string | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  resendOtp: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
          });
          
          // Fetch user profile data
          const { data: profileData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        log.error("Error fetching user", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log.debug("Auth state changed", { event });
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email,
          });
          
          // Fetch user profile data
          const { data: profileData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (profileData) {
            setProfile(profileData);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUpWithEmail = async (fullName: string, email: string, password: string) => {
    const { error } = await ApiService.signUpWithEmail(fullName, email, password);
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

  const updateProfile = async (data: any) => {
    if (!user) return;
    
    try {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('users')
          .update(data)
          .eq('id', user.id);
          
        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('users')
          .insert([{ id: user.id, ...data }]);
          
        if (error) throw error;
      }
      
      // Refresh profile data
      const { data: updatedProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
