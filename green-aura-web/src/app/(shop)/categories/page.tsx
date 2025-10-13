"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/animations";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ApiService } from "@/services/apiService";

export default function CategoriesPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [thumbByCategory, setThumbByCategory] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const cats = await ApiService.listCategories();
        setCategories(cats ?? []);
        // Fetch a sample product per category to compute counts and thumbnail
        const products = await ApiService.getAllProducts({ sort: "created_desc", limit: 500 });
        const mapCount: Record<string, number> = {};
        const mapThumb: Record<string, string> = {};
        (products ?? []).forEach((p) => {
          const c = (p.category ?? "").trim();
          if (!c) return;
          mapCount[c] = (mapCount[c] ?? 0) + 1;
          if (!mapThumb[c] && p.image_url) mapThumb[c] = p.image_url;
        });
        setCounts(mapCount);
        setThumbByCategory(mapThumb);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setFilterOpen(!filterOpen)}>
          <Filter size={16} />
          <span>Filter</span>
        </Button>
      </div>

      {filterOpen && (
        <div className="bg-card border rounded-lg p-4 mb-6">
          <h2 className="font-medium mb-2">Filter by</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              All
            </Button>
            <Button variant="outline" size="sm">
              Seasonal
            </Button>
            <Button variant="outline" size="sm">
              Organic
            </Button>
            <Button variant="outline" size="sm">
              Local
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((c) => (
          <Link
            key={c}
            href={`/categories/${encodeURIComponent(c.toLowerCase())}`}
            className="group">
            <div className="relative rounded-lg overflow-hidden aspect-square mb-2">
              {thumbByCategory[c] ? (
                <Image
                  src={thumbByCategory[c]}
                  alt={c}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-muted/30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-medium text-lg">{c}</h3>
                <p className="text-white/80 text-sm">{counts[c] ?? 0} products</p>
              </div>
            </div>
          </Link>
        ))}
        {!loading && categories.length === 0 && (
          <div className="text-muted-foreground">No categories found</div>
        )}
      </div>
    </motion.div>
  );
}
