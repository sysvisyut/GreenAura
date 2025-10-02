"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { ApiService } from "@/services/apiService";
import { AuthGate } from "@/components/AuthGate";

export default function OwnerDashboardPage() {
  const { user } = useAuthUser();
  const [org, setOrg] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const o = await ApiService.getOrganizationByOwner(user.id);
      setOrg(o);
      if (o) {
        const [ord, prods] = await Promise.all([
          ApiService.getOrdersForOrganization(o.id),
          ApiService.getProductsByOrganization(o.id),
        ]);
        setOrders(ord ?? []);
        setProducts(prods ?? []);
      }
    })();
  }, [user]);

  if (!user) return <AuthGate allow="organization">{null}</AuthGate>;
  if (!org) return <div style={{ padding: 16 }}>No organization linked to your account.</div>;

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const lowStock = products.filter((p) => (p.stock_quantity ?? 0) < 5).length;

  return (
    <AuthGate allow="organization">
      <div style={{ padding: 16, display: "grid", gap: 12 }}>
        <h1>{org.name} • Dashboard</h1>
        <div>Pending Orders: {pendingCount}</div>
        <div>Low-stock Products: {lowStock}</div>

        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/owner/products">Manage Products</Link>
          <Link href="/owner/orders">Manage Orders</Link>
        </div>
      </div>
    </AuthGate>
  );
}
