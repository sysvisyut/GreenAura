"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createLogger } from "@/lib/logger";
import { toast } from "sonner";
import { ApiService } from "@/services/apiService";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

const log = createLogger("CartContext");

export type CartItem = {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    image_url?: string | null;
  };
};

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: any, quantity: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "green-aura-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (error) {
        log.error("Error loading cart from storage", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  // Persist and sync cart: localStorage always; Supabase if logged in
  useEffect(() => {
    if (isLoading) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      log.error("Error saving cart to storage", error);
    }
  }, [items, isLoading]);

  // When user logs in, merge local cart into server; when logs out, keep local only
  useEffect(() => {
    const syncFromServer = async () => {
      if (!user) return;
      try {
        const serverItems = await ApiService.getCartItems(user.id);
        // Merge: if server has items, prefer server; otherwise push local up
        if (serverItems && serverItems.length > 0) {
          const mapped: CartItem[] = serverItems.map((ci: any) => ({
            id: ci.id,
            product_id: ci.product_id,
            quantity: ci.quantity,
            product: {
              id: ci.products.id,
              name: ci.products.name,
              price: ci.products.price,
              unit: ci.products.unit,
              image_url: ci.products.image_url ?? undefined,
            },
          }));
          setItems(mapped);
        } else {
          // Push local items up to server
          const local = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]") as CartItem[];
          for (const it of local) {
            await ApiService.addToCart(user.id, it.product_id, it.quantity);
          }
          const refreshed = await ApiService.getCartItems(user.id);
          const mapped: CartItem[] = (refreshed ?? []).map((ci: any) => ({
            id: ci.id,
            product_id: ci.product_id,
            quantity: ci.quantity,
            product: {
              id: ci.products.id,
              name: ci.products.name,
              price: ci.products.price,
              unit: ci.products.unit,
              image_url: ci.products.image_url ?? undefined,
            },
          }));
          setItems(mapped);
        }
      } catch (e) {
        log.error("Cart sync from server failed", e);
      }
    };
    syncFromServer();
  }, [user]);

  // Calculate derived values
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Add item to cart
  const addItem = (product: any, quantity: number) => {
    // Require authentication to add items to cart
    if (!user) {
      toast("Please sign in to add items to cart");
      router.push("/login");
      return;
    }
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex((item) => item.product_id === product.id);

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };

        toast.success("Cart updated", {
          description: `${product.name} quantity updated in your cart.`,
        });
        // Sync to server
        (async () => {
          try {
            await ApiService.addToCart(
              user.id,
              product.id,
              updatedItems[existingItemIndex].quantity
            );
          } catch (e) {
            log.error("addItem sync error", e);
          }
        })();
        return updatedItems;
      } else {
        // Add new item if it doesn't exist
        const newItem: CartItem = {
          id: `cart-${Date.now()}`,
          product_id: product.id,
          quantity,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            unit: product.unit,
            image_url: product.image_url,
          },
        };

        toast.success("Added to cart", {
          description: `${product.name} has been added to your cart.`,
        });
        // Sync to server
        (async () => {
          try {
            await ApiService.addToCart(user.id, product.id, quantity);
          } catch (e) {
            log.error("addItem sync error", e);
          }
        })();
        return [...prevItems, newItem];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    setItems((prevItems) => {
      const next = prevItems.map((item) => (item.id === id ? { ...item, quantity } : item));
      const target = next.find((i) => i.id === id);
      // Sync to server
      (async () => {
        try {
          if (user && target) {
            await ApiService.addToCart(user.id, target.product_id, target.quantity);
          }
        } catch (e) {
          log.error("updateQuantity sync error", e);
        }
      })();
      return next;
    });
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.id === id);
      const newItems = prevItems.filter((item) => item.id !== id);

      if (itemToRemove) {
        toast.success("Item removed", {
          description: `${itemToRemove.product.name} removed from your cart.`,
        });
        (async () => {
          try {
            if (user) {
              // We don't know server cart_item id mapping here; fallback: set quantity=0 by deletion API when available
              const server = await ApiService.getCartItems(user.id);
              const match = (server ?? []).find(
                (ci: any) => ci.product_id === itemToRemove.product_id
              );
              if (match) {
                await ApiService.removeFromCart(match.id);
              }
            }
          } catch (e) {
            log.error("removeItem sync error", e);
          }
        })();
      }

      return newItems;
    });
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
    toast.success("Cart cleared");
    (async () => {
      try {
        if (user) {
          await ApiService.clearCart(user.id);
        }
      } catch (e) {
        log.error("clearCart sync error", e);
      }
    })();
  };

  const value = {
    items,
    itemCount,
    subtotal,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    isLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
