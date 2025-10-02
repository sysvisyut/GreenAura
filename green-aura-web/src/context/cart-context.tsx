"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createLogger } from "@/lib/logger";
import { toast } from "sonner";

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

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    // Skip saving during initial load
    if (isLoading) return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      log.error("Error saving cart to storage", error);
    }
  }, [items, isLoading]);

  // Calculate derived values
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Add item to cart
  const addItem = (product: any, quantity: number) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product_id === product.id
      );

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
        
        return [...prevItems, newItem];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find(item => item.id === id);
      const newItems = prevItems.filter((item) => item.id !== id);
      
      if (itemToRemove) {
        toast.success("Item removed", {
          description: `${itemToRemove.product.name} removed from your cart.`,
        });
      }
      
      return newItems;
    });
  };

  // Clear cart
  const clearCart = () => {
    setItems([]);
    toast.success("Cart cleared");
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

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
