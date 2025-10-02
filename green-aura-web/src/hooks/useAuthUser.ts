"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/services/apiService";
import { getSupabaseClient } from "@/lib/supabaseClient";

export function useAuthUser() {
  const [user, setUser] = useState<Awaited<ReturnType<typeof ApiService.getCurrentUser>>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await ApiService.getCurrentUser();
        if (mounted) setUser(u);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    // subscribe to auth state changes
    const supabase = getSupabaseClient();
    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      const u = await ApiService.getCurrentUser();
      if (mounted) setUser(u);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
