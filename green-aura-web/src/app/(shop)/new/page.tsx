"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/services/apiService";
import { ProductGrid } from "@/components/product/product-grid";
import { pageTransition } from "@/lib/animations";
import { motion } from "framer-motion";

export default function NewProductsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        const data = await ApiService.getLatestProducts(24);
        setProducts(data ?? []);
      } finally {
        setIsLoading(false);
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
      <h1 className="text-2xl font-bold mb-6">New Arrivals</h1>
      <ProductGrid products={products} isLoading={isLoading} />
    </motion.div>
  );
}
