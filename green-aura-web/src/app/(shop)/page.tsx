"use client";

import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import { pageTransition, slideUp } from "@/lib/animations";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

// Sample data
// const FEATURED_PRODUCTS = [
//   {
//     id: "1",
//     name: "Organic Tomatoes",
//     price: 40,
//     unit: "kg",
//     category: "Vegetables",
//     image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=500",
//   },
//   {
//     id: "2",
//     name: "Fresh Spinach",
//     price: 30,
//     unit: "bunch",
//     category: "Vegetables",
//     image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=500",
//   },
//   {
//     id: "3",
//     name: "Red Apples",
//     price: 120,
//     unit: "kg",
//     category: "Fruits",
//     image_url: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=500",
//   },
//   {
//     id: "4",
//     name: "Organic Carrots",
//     price: 35,
//     unit: "kg",
//     category: "Vegetables",
//     image_url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=500",
//   },
// ];

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
];

const FARMS = [
  {
    id: "1",
    name: "Green Valley Farms",
    image: "https://images.unsplash.com/photo-1500076656116-558758c991c1?q=80&w=500",
    location: "Bangalore Rural",
    distance: "12 km",
  },
  {
    id: "2",
    name: "Sunshine Organics",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=500",
    location: "Mysore",
    distance: "18 km",
  },
  {
    id: "3",
    name: "Happy Harvest",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=500",
    location: "Tumkur",
    distance: "25 km",
  },
];

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  type Product = {
    id: string;
    name: string;
    price: number;
    unit: string;
    image_url?: string | null;
    category?: string | null;
  };
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  // Auth is not used on this page currently

  // Load featured from Supabase
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await (
          await import("@/services/apiService")
        ).ApiService.getFeaturedProducts(8);
        if (mounted) setFeaturedProducts(data ?? []);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAddToCart = (productId: string) => {
    // In a real app, this would call your cart context/API
    console.log("Adding to cart:", productId);
  };

  // const shopNowHref = user
  //   ? (user.role === "organization" ? "/owner" : "/products")
  //   : "/login";
  const shopNowHref = "/products";

  return (
    <>
      <Navbar />
      <motion.div
        className="pb-16"
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] flex items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1080"
              alt="Fresh farm produce"
              fill
              priority
              className="object-cover brightness-[0.85]"
            />
          </div>
          <div className="container relative z-10 mx-auto px-4">
            <motion.div className="max-w-xl" variants={slideUp} initial="hidden" animate="visible">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Farm Fresh, Delivered Direct
              </h1>
              <p className="text-lg text-white/90 mb-8">
                Connecting you with local farmers for the freshest produce, delivered straight to
                your door.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" asChild>
                  <Link href={shopNowHref}>Shop Now</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                  asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Categories</h2>
              <Link href="/categories" className="text-primary flex items-center hover:underline">
                View All <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CATEGORIES.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="group relative rounded-lg overflow-hidden aspect-square">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-white font-medium text-lg">{category.name}</h3>
                    <p className="text-white/80 text-sm">{category.count} products</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <Link href="/products" className="text-primary flex items-center hover:underline">
                View All <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            <ProductGrid
              products={featuredProducts}
              isLoading={isLoading}
              onAddToCart={handleAddToCart}
            />
          </div>
        </section>

        {/* Local Farms */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Local Farms</h2>
              <Link href="/farms" className="text-primary flex items-center hover:underline">
                View All <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FARMS.map((farm) => (
                <Link
                  key={farm.id}
                  href={`/farms/${farm.id}`}
                  className="group rounded-lg overflow-hidden border bg-card hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={farm.image}
                      alt={farm.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg">{farm.name}</h3>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>{farm.location}</span>
                      <span>{farm.distance} away</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Join the Farm-to-Table Movement</h2>
              <p className="text-lg mb-8">
                Sign up today and get 10% off your first order. Support local farmers and enjoy the
                freshest produce.
              </p>
              <Button
                size="lg"
                onClick={() => toast.success("Promotion applied! Use code FRESH10 at checkout.")}>
                Get Started
              </Button>
            </div>
          </div>
        </section>
      </motion.div>
      <Footer />
    </>
  );
}
