"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { ApiService } from "@/services/apiService";
import { AuthGate } from "@/components/AuthGate";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, AlertCircle } from "lucide-react";

export default function OwnerProductsPage() {
  const { user } = useAuth();
  // const [orgId, setOrgId] = useState<string | null>(null);
  type Product = {
    id: string;
    name: string;
    price: number;
    unit: string;
    stock_quantity: number;
    category?: string | null;
    is_available: boolean;
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const org = await ApiService.getOrganizationByOwner(user.id);
        if (org) {
          // setOrgId(org.id);
          const prods = await ApiService.getProductsByOrganization(org.id);
          setProducts(prods ?? []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleAvailability = async (p: Product) => {
    try {
      const updated = await ApiService.updateProduct(p.id, { is_available: !p.is_available });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch (error) {
      console.error("Failed to update product availability", error);
    }
  };

  const deleteProduct = async (p: Product) => {
    if (!confirm(`Are you sure you want to delete ${p.name}?`)) return;

    try {
      await ApiService.deleteProduct(p.id);
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (error) {
      console.error("Failed to delete product", error);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your product inventory</p>
          </div>
          <Button asChild>
            <Link href="/owner/products/new">
              <Plus size={18} className="mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-muted animate-pulse"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <AlertCircle size={24} className="text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try a different search term" : "Start by adding your first product"}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/owner/products/new">
                  <Plus size={16} className="mr-2" />
                  Add Product
                </Link>
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border rounded-lg bg-card overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{product.name}</h3>
                      {product.stock_quantity < 5 && <Badge variant="destructive">Low Stock</Badge>}
                      {!product.is_available && <Badge variant="outline">Unavailable</Badge>}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-sm text-muted-foreground mt-1">
                      <span>
                        ₹{product.price} / {product.unit}
                      </span>
                      <span>Stock: {product.stock_quantity}</span>
                      <span>{product.category || "Uncategorized"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Button
                      variant={product.is_available ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleAvailability(product)}>
                      {product.is_available ? "Set Unavailable" : "Set Available"}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/owner/products/${product.id}`}>
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteProduct(product)}
                      className="text-destructive hover:bg-destructive/10">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </AuthGate>
  );
}
