"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ApiService } from "@/services/apiService";
import { AuthGate } from "@/components/AuthGate";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      const data = await ApiService.getOrderDetails(orderId);
      setOrder(data.order);
      setItems(data.items ?? []);
    })();
  }, [orderId]);

  if (!order) return <AuthGate>{<div style={{ padding: 16 }}>Loading...</div>}</AuthGate>;

  return (
    <AuthGate>
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <h1>Order #{order.id.slice(0, 8)}</h1>
      <div>Status: {order.status}</div>
      <div>Total: ₹{order.total_amount}</div>
      <div>Date: {new Date(order.order_date).toLocaleString()}</div>

      <h2>Delivery Address</h2>
      <div>{order.user_addresses?.address_line_1}, {order.user_addresses?.city} - {order.user_addresses?.pincode}</div>

      <h2>Items</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {items.map((i) => (
          <div key={i.id} style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
            <div style={{ fontWeight: 600 }}>{i.products?.name}</div>
            <div>Qty: {i.quantity} • Price: ₹{i.price_at_order}</div>
          </div>
        ))}
      </div>
    </div>
    </AuthGate>
  );
}
