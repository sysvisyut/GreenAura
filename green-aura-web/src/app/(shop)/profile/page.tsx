"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { AuthGate } from "@/components/AuthGate";
import { useState } from "react";

export default function ProfilePage() {
  const { user, profile, signOut, isLoading, updateProfile } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone_number ?? "");
  const [saving, setSaving] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName, phone_number: phone });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Gate with AuthGate to ensure redirect to /login when not authenticated

  return (
    <AuthGate>
      <motion.div
        className="container mx-auto px-4 py-8"
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Full Name</p>
              <input
                className="w-full border rounded-md h-10 px-3"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{user?.email || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <input
                className="w-full border rounded-md h-10 px-3"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button onClick={save} disabled={saving} className="border rounded-md h-10 px-4">
              {saving ? "Saving..." : "Save"}
            </button>
            <Button onClick={handleSignOut} className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </AuthGate>
  );
}
