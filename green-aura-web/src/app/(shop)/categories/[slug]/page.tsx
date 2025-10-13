"use client";

import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/animations";
import { motion } from "framer-motion";
import { ArrowLeft, Filter, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiService } from "@/services/apiService";

export default function CategoryPage() {
  const params = useParams();
  const slug = (params?.slug as string) ?? "";

  type Product = {
    id: string;
    name: string;
    price: number;
    unit: string;
    image_url?: string | null;
    category?: string | null;
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("featured");
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const run = async () => {
      setIsLoading(true);
      try {
        // Decode category from slug by reversing lowercasing
        const categoryName = decodeURIComponent(slug).replace(/-/g, " ");
        const items = await ApiService.getProductsByCategory(categoryName);
        setProducts(items ?? []);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [slug]);

  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortOption) {
      case "price-low":
        return list.sort((a, b) => a.price - b.price);
      case "price-high":
        return list.sort((a, b) => b.price - a.price);
      case "name":
        return list.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
      default:
        return list;
    }
  }, [products, sortOption]);

  if (!isLoading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The category you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/categories">View All Categories</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit">
      {/* Breadcrumb */}
      <div className="flex items-center mb-6 text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          Home
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <Link href="/categories" className="text-muted-foreground hover:text-foreground">
          Categories
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="text-foreground">{decodeURIComponent(slug).replace(/-/g, " ")}</span>
      </div>

      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/categories">
          <ArrowLeft size={16} className="mr-2" />
          Back to Categories
        </Link>
      </Button>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{decodeURIComponent(slug).replace(/-/g, " ")}</h1>
        <p className="text-muted-foreground">Discover fresh items in this category.</p>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setFilterOpen(!filterOpen)}>
          <Filter size={16} />
          <span>Filter</span>
        </Button>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-muted-foreground" />
          <select
            className="bg-transparent border-none focus:outline-none text-sm"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}>
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Filter Panel (simplified) */}
      {filterOpen && (
        <div className="bg-card border rounded-lg p-4 mb-6">
          <h2 className="font-medium mb-2">Filter by</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <h3 className="text-sm font-medium mb-2">Price Range</h3>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Under ₹50</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">₹50 - ₹100</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">₹100 - ₹200</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Over ₹200</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Farming Method</h3>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Organic</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Conventional</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Farm Distance</h3>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Under 10km</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">10km - 25km</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Over 25km</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Availability</h3>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">In Stock</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Same Day Delivery</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button size="sm" variant="outline" className="mr-2">
              Reset
            </Button>
            <Button size="sm">Apply Filters</Button>
          </div>
        </div>
      )}

      {/* Products */}
      <ProductGrid
        products={sortedProducts}
        isLoading={isLoading}
        emptyMessage={`No products found`}
      />
    </motion.div>
  );
}
