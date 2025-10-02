"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { buttonTap } from "@/lib/animations";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 99,
  className,
  size = "md",
}: QuantityInputProps) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const sizeClasses = {
    sm: {
      container: "h-8",
      button: "w-6 h-6",
      icon: 14,
      input: "w-8 text-sm",
    },
    md: {
      container: "h-10",
      button: "w-8 h-8",
      icon: 16,
      input: "w-10",
    },
    lg: {
      container: "h-12",
      button: "w-10 h-10",
      icon: 18,
      input: "w-12 text-lg",
    },
  };

  return (
    <div
      className={cn(
        "flex items-center rounded-md border",
        sizeClasses[size].container,
        className
      )}
    >
      <motion.button
        type="button"
        className={cn(
          "flex items-center justify-center text-muted-foreground",
          "hover:text-foreground hover:bg-muted/50 transition-colors",
          sizeClasses[size].button
        )}
        onClick={handleDecrement}
        disabled={value <= min}
        whileTap={buttonTap}
        aria-label="Decrease quantity"
      >
        <Minus size={sizeClasses[size].icon} />
      </motion.button>
      
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const newValue = parseInt(e.target.value, 10);
          if (!isNaN(newValue) && newValue >= min && newValue <= max) {
            onChange(newValue);
          }
        }}
        className={cn(
          "text-center border-0 focus:outline-none focus:ring-0 bg-transparent",
          sizeClasses[size].input
        )}
        min={min}
        max={max}
      />
      
      <motion.button
        type="button"
        className={cn(
          "flex items-center justify-center text-muted-foreground",
          "hover:text-foreground hover:bg-muted/50 transition-colors",
          sizeClasses[size].button
        )}
        onClick={handleIncrement}
        disabled={value >= max}
        whileTap={buttonTap}
        aria-label="Increase quantity"
      >
        <Plus size={sizeClasses[size].icon} />
      </motion.button>
    </div>
  );
}
