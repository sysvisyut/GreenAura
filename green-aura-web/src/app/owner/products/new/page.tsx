"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { ApiService } from "@/services/apiService";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const { user } = useAuthUser();
  const router = useRouter();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: 0, unit: "kg", stock_quantity: 0, category: "" });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const org = await ApiService.getOrganizationByOwner(user.id);
      if (org) setOrgId(org.id);
    })();
  }, [user]);

  const save = async () => {
    if (!orgId) return;
    await ApiService.createProduct({ ...form, organization_id: orgId, is_available: true });
    router.push("/owner/products");
  };

  if (!user) return <div style={{ padding: 16 }}>Please sign in from Profile.</div>;
  if (!orgId) return <div style={{ padding: 16 }}>No organization linked.</div>;

  return (
    <div style={{ padding: 16, display: "grid", gap: 8 }}>
      <h1>Add Product</h1>
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
      <input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
      <input placeholder="Stock" type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })} />
      <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
      <button onClick={save}>Create</button>
    </div>
  );
}
