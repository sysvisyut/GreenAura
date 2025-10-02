"use client";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { createLogger } from "@/lib/logger";

const log = createLogger("supabaseClient");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  log.error("Missing Supabase env vars. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (browserClient) return browserClient;
  log.info("Initializing Supabase client");
  browserClient = createClient<Database>(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        "X-Client-Info": "green-aura-web",
      },
    },
  });
  return browserClient;
}
