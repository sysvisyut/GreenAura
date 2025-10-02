"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LayoutGrid, Package, Settings, ShoppingBag } from "lucide-react";

const navItems = [
  { href: "/owner", label: "Dashboard", icon: LayoutGrid },
  { href: "/owner/products", label: "Products", icon: Package },
  { href: "/owner/orders", label: "Orders", icon: ShoppingBag },
  { href: "/owner/settings", label: "Settings", icon: Settings },
];

export default function OwnerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="md:w-64 shrink-0">
              <div className="bg-card border rounded-lg p-4 sticky top-20">
                <h2 className="font-medium text-lg mb-4 px-2">Organization</h2>
                <nav className="space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      )}>
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <Suspense fallback={<div className="p-4">Loading...</div>}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}>
                  {children}
                </motion.div>
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
