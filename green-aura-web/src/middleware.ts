import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Fetch role from public.users if authenticated
  let role: "customer" | "organization" | null = null;
  if (session?.user?.id) {
    const { data: userRow } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();
    role = (userRow as any)?.role ?? null;
  }

  const { pathname } = request.nextUrl;

  // Define protected route prefixes
  const protectedPrefixes = ["/profile", "/cart", "/checkout", "/orders", "/owner", "/addresses"];

  // If the user is not logged in and is trying to access a protected route, redirect to login
  if (!session && protectedPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role specific protections
  if (session && role) {
    // Organizations should not see cart/checkout
    if (
      role === "organization" &&
      (pathname.startsWith("/cart") || pathname.startsWith("/checkout"))
    ) {
      return NextResponse.redirect(new URL("/owner", request.url));
    }
    // Customers should not access owner area
    if (role === "customer" && pathname.startsWith("/owner")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // If the user is logged in and is trying to access an auth route, redirect to role landing
  const authRoutes = ["/login", "/signup", "/verify"];
  if (session && authRoutes.includes(pathname)) {
    const target = role === "organization" ? "/owner" : "/";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
