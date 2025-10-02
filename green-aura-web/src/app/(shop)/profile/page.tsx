"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { AuthGate } from "@/components/AuthGate";

export default function ProfilePage() {
  const { user, profile, signOut, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
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
              <p>{profile?.full_name || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{user!.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p>{profile?.phone_number || "Not set"}</p>
            </div>
            <Button onClick={handleSignOut} className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </AuthGate>
  );
}
