"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiService } from "@/services/apiService";
import { useAuthUser } from "@/hooks/useAuthUser";
import { createLogger } from "@/lib/logger";
import { AuthGate } from "@/components/AuthGate";
import { useRouter } from "next/navigation";

const log = createLogger("CheckoutPage");

export default function CheckoutPage() {
  const { user } = useAuthUser();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const data = await ApiService.getUserAddresses(user.id);
        setAddresses(data ?? []);
        setSelectedAddress(data?.[0]?.id ?? null);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load addresses");
        log.error("Checkout addresses error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const placeOrder = async () => {
    if (!user || !selectedAddress) return;
    try {
      // For MVP: infer orgId from cart first item
      const cart = await ApiService.getCartItems(user.id);
      if (!cart || cart.length === 0) {
        setError("Cart is empty");
        return;
      }
      const organizationId = cart[0].products?.organization_id as string;
      const items = cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity }));
      const orderId = await ApiService.createOrder({
        userId: user.id,
        organizationId,
        deliveryAddressId: selectedAddress,
        deliveryCharge: 0,
        items,
      });
      log.info("Order placed", { orderId });
      router.push(`/orders/${orderId}`);
    } catch (e) {
      log.error("Place order failed", e);
      setError("Could not place order");
    }
  };

  if (!user) return <div style={{ padding: 16 }}>Please sign in from Profile to checkout.</div>;
  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (error) return <div style={{ padding: 16, color: "#f66" }}>Error: {error}</div>;

  return (
    <AuthGate>
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <h1>Checkout</h1>

      {step === 1 && (
        <div style={{ display: "grid", gap: 8 }}>
          <h2>Select Address</h2>
          {addresses.map((a) => (
            <label key={a.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="radio"
                name="address"
                checked={selectedAddress === a.id}
                onChange={() => setSelectedAddress(a.id)}
              />
              <span>{a.address_line_1}, {a.city} - {a.pincode}</span>
            </label>
          ))}
          <button onClick={() => setStep(2)} disabled={!selectedAddress}>Continue</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "grid", gap: 12 }}>
          <h2>Order Summary & Payment</h2>
          <div>Payment methods are simulated in MVP. You can place order directly.</div>
          <button onClick={placeOrder}>Place Order</button>
        </div>
      )}
    </div>
    </AuthGate>
  );
}
