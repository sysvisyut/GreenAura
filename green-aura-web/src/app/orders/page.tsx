"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiService } from "@/services/apiService";
import { useAuthUser } from "@/hooks/useAuthUser";
import { AuthGate } from "@/components/AuthGate";

export default function OrdersPage() {
  const { user } = useAuthUser();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await ApiService.getUserOrders(user.id);
      setOrders(data ?? []);
    })();
  }, [user]);

  if (!user) return <AuthGate>{null}</AuthGate>;

  return (
    <AuthGate>
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <h1>My Orders</h1>
      <div style={{ display: "grid", gap: 8 }}>
        {orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.id}`} style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
            <div>Order #{o.id.slice(0, 8)} • {o.status} • ₹{o.total_amount}</div>
            <div style={{ opacity: 0.8 }}>{new Date(o.order_date).toLocaleString()}</div>
          </Link>
        ))}
      </div>
    </div>
    </AuthGate>
  );
}
