"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiService } from "@/services/apiService";
import { createLogger } from "@/lib/logger";

const log = createLogger("OrgPage");

export default function OrgPage() {
  const params = useParams();
  const orgId = params?.id as string;

  type Org = { id: string; name: string; description?: string | null; address?: string | null };
  type Product = { id: string; name: string; price: number; unit: string };
  const [org, setOrg] = useState<Org | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    (async () => {
      try {
        setLoading(true);
        const [o, p] = await Promise.all([
          ApiService.getOrganizationDetails(orgId),
          ApiService.getProductsByOrganization(orgId),
        ]);
        setOrg(o);
        setProducts(p ?? []);
        log.info("OrgPage loaded", { orgId, products: p?.length });
      } catch (e) {
        log.error("OrgPage error", e);
        const message = e instanceof Error ? e.message : "Failed to load";
        setError(message);
      } finally {
        setLoading(false);
      }
    })();
  }, [orgId]);

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (error) return <div style={{ padding: 16, color: "#f66" }}>Error: {error}</div>;
  if (!org) return <div style={{ padding: 16 }}>Organization not found.</div>;

  return (
    <div style={{ padding: 16, display: "grid", gap: 16 }}>
      <div>
        <h1>{org.name}</h1>
        <div style={{ opacity: 0.8 }}>{org.description ?? "No description"}</div>
        <div style={{ opacity: 0.8 }}>{org.address ?? "No address"}</div>
      </div>

      <section>
        <h2>Products</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}>
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ opacity: 0.8 }}>
                {p.unit} • ₹{p.price}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
