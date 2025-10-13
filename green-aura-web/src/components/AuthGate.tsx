"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { createLogger } from "@/lib/logger";

const log = createLogger("AuthGate");

export function AuthGate({
  children,
  allow,
}: {
  children: React.ReactNode;
  allow?: "customer" | "organization";
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      log.info("AuthGate: still loading, delaying route guard");
      return;
    }
    log.info("AuthGate: evaluating access", { hasUser: !!user, allow });
    if (!user) {
      log.warn("AuthGate: no user, redirecting to /login");
      router.replace("/login");
      return;
    }
    if (allow && user.role && user.role !== allow) {
      log.warn("AuthGate: role mismatch, redirecting", { role: user.role, allow });
      router.replace(allow === "organization" ? "/owner" : "/");
    }
  }, [user, isLoading, router, allow]);

  if (isLoading) return <div style={{ padding: 16 }}>Checking session...</div>;
  if (!user) return null;
  return <>{children}</>;
}
