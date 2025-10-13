"use client";

import { useEffect, useMemo, useState } from "react";
import { ApiService } from "@/services/apiService";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/animations";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";

type SortOption = "created_desc" | "price_asc" | "price_desc" | "name_asc";

export default function ProductsPage() {
  const [isLoading, setIsLoading] = useState(true);
  type Product = {
    id: string;
    name: string;
    price: number;
    unit: string;
    image_url?: string | null;
    category?: string | null;
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("created_desc");
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          ApiService.listCategories(),
          ApiService.getAllProducts({ search, sort }),
        ]);
        setCategories(cats ?? []);
        setProducts(prods ?? []);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [search, sort]);

  const filtered = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter(
      (p) => (p.category ?? "").toLowerCase() === activeCategory.toLowerCase()
    );
  }, [products, activeCategory]);

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">All Products</h1>

        <div className="flex-1 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
          <div className="relative w-full sm:w-80">
            <input
              className="w-full h-10 rounded-md border px-9 text-sm bg-background"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-muted-foreground" />
            <select
              className="bg-transparent border-none focus:outline-none text-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}>
              <option value="created_desc">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name</option>
            </select>
          </div>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeCategory ? "outline" : "default"}
            size="sm"
            onClick={() => setActiveCategory(null)}>
            All
          </Button>
          {categories.map((c) => (
            <Button
              key={c}
              variant={activeCategory === c ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(c)}>
              {c}
            </Button>
          ))}
        </div>
      )}

      <ProductGrid products={filtered} isLoading={isLoading} />
    </motion.div>
  );
}
