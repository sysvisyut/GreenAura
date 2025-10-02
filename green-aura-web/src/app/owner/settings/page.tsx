"use client";

import { useEffect, useState } from "react";
import { useAuthUser } from "@/hooks/useAuthUser";
import { ApiService } from "@/services/apiService";
import { AuthGate } from "@/components/AuthGate";

export default function OwnerSettingsPage() {
  const { user } = useAuthUser();
  const [org, setOrg] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", description: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const o = await ApiService.getOrganizationByOwner(user.id);
      if (o) {
        setOrg(o);
        setForm({ name: o.name ?? "", description: o.description ?? "", address: o.address ?? "" });
      }
    })();
  }, [user]);

  const save = async () => {
    if (!org) return;
    setSaving(true);
    try {
      await ApiService.updateOrganization(org.id, {
        name: form.name,
        description: form.description,
        address: form.address,
      } as any);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGate allow="organization">
      <div style={{ padding: 16, display: "grid", gap: 12 }}>
        <h1>Organization Settings</h1>
        {!org ? (
          <div>No organization found.</div>
        ) : (
          <div style={{ display: "grid", gap: 8, maxWidth: 560 }}>
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <label>Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>
    </AuthGate>
  );
}
