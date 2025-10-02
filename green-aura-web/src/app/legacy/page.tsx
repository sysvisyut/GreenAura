"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiService } from "@/services/apiService";
import { createLogger } from "@/lib/logger";

const log = createLogger("HomePage");

export default function HomePage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const [o, f] = await Promise.all([
          ApiService.getOrganizations(20),
          ApiService.getFeaturedProducts(12),
        ]);
        setOrgs(o ?? []);
        setFeatured(f ?? []);
        log.info("Home data loaded", { orgs: o?.length, featured: f?.length });
      } catch (e: any) {
        log.error("Home load error", e);
        setError(e?.message ?? "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (error) return <div style={{ padding: 16, color: "#f66" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16, display: "grid", gap: 24 }}>
      <section>
        <h2>Nearby Farms</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {orgs.map((org) => (
            <Link key={org.id} href={`/org/${org.id}`} style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600 }}>{org.name}</div>
              <div style={{ opacity: 0.8 }}>{org.address ?? "No address"}</div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2>Featured Products</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {featured.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`} style={{ border: "1px solid #333", borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ opacity: 0.8 }}>{p.unit} • ₹{p.price}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
