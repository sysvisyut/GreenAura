"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/services/apiService";
import { useAuthUser } from "@/hooks/useAuthUser";

export default function AddressesPage() {
  const { user } = useAuthUser();
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ address_line_1: "", city: "", pincode: "" });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const data = await ApiService.getUserAddresses(user.id);
      setList(data ?? []);
    })();
  }, [user]);

  const add = async () => {
    if (!user) return;
    const created = await ApiService.addAddress({ ...form, user_id: user.id });
    setList((prev) => [created, ...prev]);
    setForm({ address_line_1: "", city: "", pincode: "" });
  };

  const remove = async (id: string) => {
    await ApiService.deleteAddress(id);
    setList((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div style={{ padding: 16, display: "grid", gap: 12 }}>
      <h1>Addresses</h1>
      {!user ? (
        <div>Please sign in from Profile.</div>
      ) : (
        <>
          <div style={{ display: "grid", gap: 8 }}>
            <input placeholder="Address line" value={form.address_line_1} onChange={(e) => setForm({ ...form, address_line_1: e.target.value })} />
            <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            <button onClick={add}>Add Address</button>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {list.map((a) => (
              <div key={a.id} style={{ border: "1px solid #333", borderRadius: 8, padding: 12, display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>{a.address_line_1}, {a.city} - {a.pincode}</div>
                <button onClick={() => remove(a.id)}>Delete</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
