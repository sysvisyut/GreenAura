"use client";

import { ProductCard } from "./product-card";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/animations";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  category?: string | null;
  unit: string;
}

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
  onAddToCart?: (productId: string) => void;
}

export function ProductGrid({
  products,
  isLoading = false,
  emptyMessage = "No products found",
  onAddToCart,
}: ProductGridProps) {
  if (isLoading) {
    return <ProductGridSkeleton />;
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() => onAddToCart?.(product.id)}
        />
      ))}
    </motion.div>
  );
}
