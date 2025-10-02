"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

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
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allow && user.role && user.role !== allow) {
      router.replace(allow === "organization" ? "/owner" : "/");
    }
  }, [user, isLoading, router, allow]);

  if (isLoading) return <div style={{ padding: 16 }}>Checking session...</div>;
  if (!user) return null;
  return <>{children}</>;
}
