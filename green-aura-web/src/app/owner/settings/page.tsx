"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { ApiService } from "@/services/apiService";
import { AuthGate } from "@/components/AuthGate";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Building, MapPin, FileText, Save } from "lucide-react";

export default function OwnerSettingsPage() {
  const { user } = useAuth();
  const [org, setOrg] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", description: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const o = await ApiService.getOrganizationByOwner(user.id);
        if (o) {
          setOrg(o);
          setForm({
            name: o.name ?? "",
            description: o.description ?? "",
            address: o.address ?? "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch organization data", error);
      }
    };
    fetchData();
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
      toast.success("Organization settings updated successfully");
    } catch (error) {
      console.error("Failed to update organization", error);
      toast.error("Failed to update organization settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGate allow="organization">
      <motion.div
        className="space-y-6"
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit">
        <div>
          <h1 className="text-3xl font-bold">Organization Settings</h1>
          <p className="text-muted-foreground">Manage your organization profile</p>
        </div>

        {!org ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p>No organization found. Please contact support.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Organization Name
                  </label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter organization name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Address
                  </label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Enter organization address"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Enter organization description"
                    className="w-full min-h-[120px] p-3 border rounded-md bg-background"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={save} disabled={saving}>
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </AuthGate>
  );
}
