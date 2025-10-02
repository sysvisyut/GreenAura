"use client";

import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/animations";
import { motion } from "framer-motion";
import { ArrowLeft, Filter, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Sample category data
const CATEGORY_DATA = {
  vegetables: {
    name: "Vegetables",
    description: "Fresh, locally grown vegetables direct from farms to your table.",
    count: 42,
  },
  fruits: {
    name: "Fruits",
    description: "Seasonal and exotic fruits harvested at peak ripeness.",
    count: 36,
  },
  dairy: {
    name: "Dairy",
    description: "Farm-fresh milk, cheese, and other dairy products.",
    count: 18,
  },
  herbs: {
    name: "Herbs",
    description: "Aromatic herbs to elevate your cooking.",
    count: 15,
  },
};

// Sample products
const PRODUCTS = [
  {
    id: "1",
    name: "Organic Tomatoes",
    price: 40,
    unit: "kg",
    category: "vegetables",
    image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=500",
  },
  {
    id: "2",
    name: "Fresh Spinach",
    price: 30,
    unit: "bunch",
    category: "vegetables",
    image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=500",
  },
  {
    id: "3",
    name: "Red Apples",
    price: 120,
    unit: "kg",
    category: "fruits",
    image_url: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=500",
  },
  {
    id: "4",
    name: "Organic Carrots",
    price: 35,
    unit: "kg",
    category: "vegetables",
    image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=500",
  },
  {
    id: "5",
    name: "Bananas",
    price: 60,
    unit: "dozen",
    category: "fruits",
    image_url: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=500",
  },
  {
    id: "6",
    name: "Organic Milk",
    price: 55,
    unit: "liter",
    category: "dairy",
    image_url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=500",
  },
  {
    id: "7",
    name: "Fresh Basil",
    price: 20,
    unit: "bunch",
    category: "herbs",
    image_url: "https://images.unsplash.com/photo-1600841867003-d904bd142d99?q=80&w=500",
  },
  {
    id: "8",
    name: "Bell Peppers",
    price: 45,
    unit: "kg",
    category: "vegetables",
    image_url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?q=80&w=500",
  },
];

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState("featured");
  const [filterOpen, setFilterOpen] = useState(false);

  // Simulate API call to fetch category and products
  useEffect(() => {
    const timer = setTimeout(() => {
      // Get category data
      const categoryData = (CATEGORY_DATA as any)[slug];
      setCategory(categoryData);
      
      // Filter products by category
      const filteredProducts = PRODUCTS.filter(
        (product) => product.category === slug
      );
      setProducts(filteredProducts);
      
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleAddToCart = (productId: string) => {
    // In a real app, this would call your cart context/API
    toast.success("Added to cart");
  };

  const sortProducts = (option: string) => {
    setSortOption(option);
    let sorted = [...products];
    
    switch (option) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // "featured" - no sorting needed
        break;
    }
    
    setProducts(sorted);
  };

  if (!isLoading && !category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The category you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/categories">View All Categories</Link>
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
      exit="exit"
    >
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
        <span className="text-foreground">
          {isLoading ? "Loading..." : category?.name}
        </span>
      </div>

      {/* Back button */}
      <Button variant="ghost" size="sm" className="mb-6" asChild>
        <Link href="/categories">
          <ArrowLeft size={16} className="mr-2" />
          Back to Categories
        </Link>
      </Button>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isLoading ? "Loading..." : category?.name}
        </h1>
        <p className="text-muted-foreground">
          {isLoading ? "Loading..." : category?.description}
        </p>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <Filter size={16} />
          <span>Filter</span>
        </Button>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-muted-foreground" />
          <select
            className="bg-transparent border-none focus:outline-none text-sm"
            value={sortOption}
            onChange={(e) => sortProducts(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {/* Filter Panel (simplified) */}
      {filterOpen && (
        <div className="bg-card border rounded-lg p-4 mb-6">
          <h2 className="font-medium mb-2">Filter by</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <h3 className="text-sm font-medium mb-2">Price Range</h3>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Under ₹50</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">₹50 - ₹100</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">₹100 - ₹200</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Over ₹200</span>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Farming Method</h3>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Organic</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Conventional</span>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Farm Distance</h3>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Under 10km</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">10km - 25km</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Over 25km</span>
                </label>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Availability</h3>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">In Stock</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Same Day Delivery</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button size="sm" variant="outline" className="mr-2">
              Reset
            </Button>
            <Button size="sm">Apply Filters</Button>
          </div>
        </div>
      )}

      {/* Products */}
      <ProductGrid
        products={products}
        isLoading={isLoading}
        onAddToCart={handleAddToCart}
        emptyMessage={`No ${category?.name?.toLowerCase() || 'products'} found`}
      />
    </motion.div>
  );
}
