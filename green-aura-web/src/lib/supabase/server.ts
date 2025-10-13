import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/supabase";
import { cookies } from "next/headers";

// Create a typed Supabase server client that can be used inside Server Components.
// Pass the cookieStore from next/headers so Supabase can read/write auth cookies.
export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // In Server Components this will throw (read-only). That's fine when
            // you have middleware handling session refresh; we safely ignore.
            cookieStore.set({ name, value, ...options });
          } catch {
            /* no-op in Server Components */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            // In Server Components this will throw (read-only). Safely ignore.
            cookieStore.set({ name, value: "", ...options });
          } catch {
            /* no-op in Server Components */
          }
        },
      },
    }
  );
};
