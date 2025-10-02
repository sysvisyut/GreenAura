import { getSupabaseClient } from "@/lib/supabaseClient";
import { createLogger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

const log = createLogger("AuthCallback");

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  
  if (code) {
    const supabase = getSupabaseClient();
    
    try {
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      log.error("Error exchanging code for session", error);
      // Redirect to login page with error
      return NextResponse.redirect(new URL("/login?error=auth_callback_error", requestUrl.origin));
    }
  }

  // Redirect to the home page
  return NextResponse.redirect(new URL("/", requestUrl.origin));
}
