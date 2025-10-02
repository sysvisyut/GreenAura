"use client";

import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/animations";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Sample categories data
const CATEGORIES = [
  {
    id: "vegetables",
    name: "Vegetables",
    image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=500",
    count: 42,
  },
  {
    id: "fruits",
    name: "Fruits",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=500",
    count: 36,
  },
  {
    id: "dairy",
    name: "Dairy",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=500",
    count: 18,
  },
  {
    id: "herbs",
    name: "Herbs",
    image: "https://images.unsplash.com/photo-1515586000433-45406d8e6662?q=80&w=500",
    count: 15,
  },
  {
    id: "grains",
    name: "Grains & Cereals",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1c5a6ec32?q=80&w=500",
    count: 22,
  },
  {
    id: "nuts",
    name: "Nuts & Seeds",
    image: "https://images.unsplash.com/photo-1616485557198-c90d0280f2a3?q=80&w=500",
    count: 14,
  },
  {
    id: "honey",
    name: "Honey & Preserves",
    image: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?q=80&w=500",
    count: 8,
  },
  {
    id: "eggs",
    name: "Eggs",
    image: "https://images.unsplash.com/photo-1598965675045-45c5e72c7d05?q=80&w=500",
    count: 5,
  },
];

export default function CategoriesPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  
  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <Filter size={16} />
          <span>Filter</span>
        </Button>
      </div>
      
      {/* Filter Panel (simplified) */}
      {filterOpen && (
        <div className="bg-card border rounded-lg p-4 mb-6">
          <h2 className="font-medium mb-2">Filter by</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              All
            </Button>
            <Button variant="outline" size="sm">
              Seasonal
            </Button>
            <Button variant="outline" size="sm">
              Organic
            </Button>
            <Button variant="outline" size="sm">
              Local
            </Button>
          </div>
        </div>
      )}
      
      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.id}`}
            className="group"
          >
            <div className="relative rounded-lg overflow-hidden aspect-square mb-2">
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                <h3 className="text-white font-medium text-lg">{category.name}</h3>
                <p className="text-white/80 text-sm">{category.count} products</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
