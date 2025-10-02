"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/services/apiService";
import { pageTransition } from "@/lib/animations";
import { motion } from "framer-motion";
import Link from "next/link";

export default function FarmsPage() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getOrganizations(40);
        setOrgs(data ?? []);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load farms");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit">
      <h1 className="text-2xl font-bold mb-6">Local Farms</h1>

      {loading && <div>Loading...</div>}
      {error && <div className="text-destructive">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/org/${org.id}`}
              className="group rounded-lg overflow-hidden border bg-card hover:shadow-md transition-shadow p-4">
              <div className="font-medium text-lg">{org.name}</div>
              <div className="text-sm text-muted-foreground">{org.address ?? "No address"}</div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}
