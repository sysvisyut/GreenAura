"use client";

import { Button } from "@/components/ui/button";
import { QuantityInput } from "@/components/ui/quantity-input";
import { CartSkeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/cart-context";
import { pageTransition, cartItemAnimation } from "@/lib/animations";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, isLoading, itemCount, subtotal } =
    useCart();

  // Delivery fee calculation
  const deliveryFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + deliveryFee;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <CartSkeleton />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <motion.div
        className="container mx-auto px-4 py-16 text-center"
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit">
        <div className="max-w-md mx-auto">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center">
              <ShoppingCart size={36} className="text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Looks like you haven&apos;t added any products to your cart yet.
          </p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                className="flex flex-col sm:flex-row gap-4 p-4 mb-4 border rounded-lg bg-card"
                variants={cartItemAnimation}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout>
                {/* Product Image */}
                <div className="relative w-full sm:w-24 h-24 bg-muted/30 rounded-md overflow-hidden">
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/30 text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <Link
                    href={`/product/${item.product_id}`}
                    className="font-medium hover:text-primary">
                    {item.product.name}
                  </Link>
                  <div className="text-sm text-muted-foreground mb-2">
                    {formatPrice(item.product.price)} / {item.product.unit}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <QuantityInput
                      value={item.quantity}
                      onChange={(value) => updateQuantity(item.id, value)}
                      min={1}
                      max={99}
                      size="sm"
                    />

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}>
                      <Trash2 size={16} />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right font-medium">
                  {formatPrice(item.product.price * item.quantity)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={clearCart}
              className="text-muted-foreground">
              Clear Cart
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="border rounded-lg p-6 bg-card sticky top-20">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="text-xs text-muted-foreground">
                  Add {formatPrice(500 - subtotal)} more for free delivery
                </div>
              )}
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Button className="w-full" onClick={() => router.push("/checkout")}>
              Checkout
              <ArrowRight size={16} className="ml-2" />
            </Button>

            <div className="mt-4 text-xs text-muted-foreground">
              <p>
                By proceeding to checkout, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
