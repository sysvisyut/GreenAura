"use client";

import { Button } from "@/components/ui/button";
import { QuantityInput } from "@/components/ui/quantity-input";
import { ProductDetailSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/cart-context";
import { pageTransition } from "@/lib/animations";
import { formatPrice } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowLeft, Truck, Clock, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiService } from "@/services/apiService";

export default function ProductPage() {
  const params = useParams();
  const productId = params?.id as string;
  const { addItem } = useCart();

  type Product = {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    unit: string;
    stock_quantity: number;
    category?: string | null;
    image_url?: string | null;
    organization_id?: string | null;
  };
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const run = async () => {
      setIsLoading(true);
      try {
        const p = await ApiService.getProductById(productId);
        setProduct(p);
        if (p) {
          const rel = await ApiService.getRelatedProducts(p.id, p.category, 8);
          setRelated(rel ?? []);
        } else {
          setRelated([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    setIsAddingToCart(true);
    addItem(product, quantity);
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
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
        {product.category ? (
          <Link
            href={`/categories/${encodeURIComponent(String(product.category).toLowerCase())}`}
            className="text-muted-foreground hover:text-foreground">
            {product.category}
          </Link>
        ) : (
          <span className="text-muted-foreground">Uncategorized</span>
        )}
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/products">
          <ArrowLeft size={16} className="mr-2" />
          Back to Products
        </Link>
      </Button>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Product Image */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted/30">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30 text-muted-foreground">
              No image available
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="success">In Stock</Badge>
              {product.category && <Badge variant="outline">{product.category}</Badge>}
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-baseline mb-4">
              <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
              <span className="text-muted-foreground ml-2">/ {product.unit}</span>
            </div>
            <p className="text-muted-foreground mb-6">{product.description}</p>

            {/* Farm Info */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">From</h3>
              <div className="flex items-center text-muted-foreground">
                Organization #{product.organization_id?.slice?.(0, 8) ?? ""}
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="mt-auto space-y-6">
            <div className="flex items-center gap-4">
              <QuantityInput
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={product.stock_quantity}
                size="lg"
              />
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                isLoading={isAddingToCart}>
                Add to Cart
              </Button>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-muted-foreground" />
                <span className="text-sm">Free delivery on orders over ₹500</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-muted-foreground" />
                <span className="text-sm">Delivery within 24 hours</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-muted-foreground" />
                <span className="text-sm">100% satisfaction guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="border-t pt-12">
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(related ?? []).map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/product/${relatedProduct.id}`}
                className="group rounded-lg border bg-card overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-square bg-muted/30">
                  {relatedProduct.image_url ? (
                    <Image
                      src={relatedProduct.image_url}
                      alt={relatedProduct.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/30 text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium truncate">{relatedProduct.name}</h3>
                  <div className="flex items-baseline mt-1">
                    <span className="font-semibold">{formatPrice(relatedProduct.price)}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      / {relatedProduct.unit}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
