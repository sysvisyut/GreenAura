"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { ApiService } from "@/services/apiService";
import { useParams, useRouter } from "next/navigation";

export default function EditProductPage() {
  const { user } = useAuthUser();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const p = await ApiService.getProductById(id);
      setForm(p);
    })();
  }, [id]);

  const save = async () => {
    if (!form) return;
    await ApiService.updateProduct(form.id, {
      name: form.name,
      description: form.description,
      price: form.price,
      unit: form.unit,
      stock_quantity: form.stock_quantity,
      category: form.category,
    });
    router.push("/owner/products");
  };

  if (!user) return <div style={{ padding: 16 }}>Please sign in from Profile.</div>;
  if (!form) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16, display: "grid", gap: 8 }}>
      <h1>Edit Product</h1>
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
      <input placeholder="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
      <input placeholder="Stock" type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })} />
      <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
      <button onClick={save}>Save</button>
    </div>
  );
}
