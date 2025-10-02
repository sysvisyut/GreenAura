"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/auth");
  }, [user, loading, router]);

  if (loading) return <div style={{ padding: 16 }}>Checking session...</div>;
  if (!user) return null;
  return <>{children}</>;
}
