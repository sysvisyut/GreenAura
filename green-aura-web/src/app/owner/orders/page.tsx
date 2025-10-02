"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { ApiService } from "@/services/apiService";
import { AuthGate } from "@/components/AuthGate";

export default function OwnerOrdersPage() {
  const { user } = useAuthUser();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const org = await ApiService.getOrganizationByOwner(user.id);
      if (org) {
        setOrgId(org.id);
        const ord = await ApiService.getOrdersForOrganization(org.id);
        setOrders(ord ?? []);
      }
    })();
  }, [user]);

  const update = async (id: string, status: string) => {
    const updated = await ApiService.updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  };

  if (!user) return <AuthGate allow="organization">{null}</AuthGate>;
  if (!orgId) return <div style={{ padding: 16 }}>No organization linked.</div>;

  return (
    <AuthGate allow="organization">
      <div style={{ padding: 16, display: "grid", gap: 12 }}>
        <h1>Manage Orders</h1>
        <div style={{ display: "grid", gap: 8 }}>
          {orders.map((o) => (
            <div
              key={o.id}
              style={{
                border: "1px solid #333",
                borderRadius: 8,
                padding: 12,
                display: "grid",
                gap: 8,
              }}>
              <div>
                Order #{o.id.slice(0, 8)} • ₹{o.total_amount}
              </div>
              <div>Status: {o.status}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {(["pending", "confirmed", "out_for_delivery", "delivered"] as const).map((s) => (
                  <button key={s} onClick={() => update(o.id, s)} disabled={o.status === s}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthGate>
  );
}
