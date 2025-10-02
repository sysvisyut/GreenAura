import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format price with currency symbol
 */
export function formatPrice(price: number, currency = "₹") {
  return `${currency}${price.toLocaleString("en-IN")}`;
}

/**
 * Truncate text to a specific length
 */
export function truncateText(text: string, length = 100) {
  if (!text) return "";
  return text.length > length ? `${text.substring(0, length)}...` : text;
}

/**
 * Format date to a readable string
 */
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Generate a random ID
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, length + 2);
}

/**
 * Delay execution for a specific time
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate email format
 */
export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
