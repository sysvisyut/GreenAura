"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { buttonTap } from "@/lib/animations";
import { toast } from "sonner";
import { useCart } from "@/context/cart-context";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string | null;
    category?: string | null;
    unit: string;
  };
  onAddToCart?: () => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    onAddToCart?.();
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast("Added to wishlist");
  };

  return (
    <Link href={`/product/${product.id}`}>
      <motion.div
        className="group product-card rounded-lg border bg-card overflow-hidden"
        whileHover={{ y: -4 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}>
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="product-image object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30 text-muted-foreground">
              No image
            </div>
          )}

          {/* Wishlist button */}
          <motion.button
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 flex items-center justify-center text-muted-foreground hover:text-primary"
            whileTap={buttonTap}
            onClick={handleAddToWishlist}>
            <Heart size={18} />
          </motion.button>

          {/* Category badge */}
          {product.category && (
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                {product.category}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-medium truncate">{product.name}</h3>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-baseline gap-1">
              <span className="font-semibold">{formatPrice(product.price)}</span>
              <span className="text-xs text-muted-foreground">/ {product.unit}</span>
            </div>

            <motion.button
              className={cn(
                "h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground",
                "shadow-sm hover:shadow transition-all"
              )}
              whileTap={buttonTap}
              onClick={handleAddToCart}
              aria-label="Add to cart">
              <ShoppingCart size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
