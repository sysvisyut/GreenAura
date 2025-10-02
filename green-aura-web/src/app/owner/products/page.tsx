"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { ApiService } from "@/services/apiService";
import { AuthGate } from "@/components/AuthGate";

export default function OwnerProductsPage() {
  const { user } = useAuthUser();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const org = await ApiService.getOrganizationByOwner(user.id);
      if (org) {
        setOrgId(org.id);
        const prods = await ApiService.getProductsByOrganization(org.id);
        setProducts(prods ?? []);
      }
    })();
  }, [user]);

  const toggle = async (p: any) => {
    const updated = await ApiService.updateProduct(p.id, { is_available: !p.is_available });
    setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
  };

  const del = async (p: any) => {
    await ApiService.deleteProduct(p.id);
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
  };

  if (!user) return <AuthGate allow="organization">{null}</AuthGate>;
  if (!orgId) return <div style={{ padding: 16 }}>No organization linked.</div>;

  return (
    <AuthGate allow="organization">
      <div style={{ padding: 16, display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1>Manage Products</h1>
          <Link href="/owner/products/new">Add New Product</Link>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #333",
                borderRadius: 8,
                padding: 12,
                display: "grid",
                gap: 8,
              }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div>
                ₹{p.price} / {p.unit} • Stock: {p.stock_quantity}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => toggle(p)}>
                  {p.is_available ? "Set Unavailable" : "Set Available"}
                </button>
                <Link href={`/owner/products/${p.id}`}>Edit</Link>
                <button onClick={() => del(p)} style={{ marginLeft: "auto" }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AuthGate>
  );
}
