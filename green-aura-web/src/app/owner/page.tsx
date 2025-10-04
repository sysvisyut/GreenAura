"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { ApiService } from "@/services/apiService";
import { AuthGate } from "@/components/AuthGate";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Package, ShoppingBag, TrendingUp, AlertCircle } from "lucide-react";

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  type Org = { id: string; name: string } | null;
  type Order = { id: string; total_amount: number; status: string; order_date: string };
  type Product = {
    id: string;
    name: string;
    category?: string | null;
    price: number;
    stock_quantity: number;
  };
  const [org, setOrg] = useState<Org>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const o = await ApiService.getOrganizationByOwner(user.id);
        setOrg(o);
        if (o) {
          const [ord, prods] = await Promise.all([
            ApiService.getOrdersForOrganization(o.id),
            ApiService.getProductsByOrganization(o.id),
          ]);
          setOrders(ord ?? []);
          setProducts(prods ?? []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const lowStockProducts = products.filter((p) => (p.stock_quantity ?? 0) < 5);
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

  return (
    <AuthGate allow="organization">
      <motion.div
        className="space-y-6"
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{org?.name || "Dashboard"}</h1>
            <p className="text-muted-foreground">Welcome to your organization dashboard</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-lg bg-muted animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                      <h3 className="text-2xl font-bold">{products.length}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="text-primary" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                      <h3 className="text-2xl font-bold">{pendingOrders.length}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <ShoppingBag className="text-orange-500" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <h3 className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="text-green-500" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                      <h3 className="text-2xl font-bold">{lowStockProducts.length}</h3>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                      <AlertCircle className="text-red-500" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    Recent Orders
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/owner/orders">View All</Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">No orders yet</p>
                  ) : (
                    <div className="space-y-4">
                      {orders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between border-b pb-4">
                          <div>
                            <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.order_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-medium">₹{order.total_amount}</p>
                            <Badge
                              variant={
                                order.status === "pending"
                                  ? "warning"
                                  : order.status === "delivered"
                                  ? "success"
                                  : "outline"
                              }>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    Low Stock Products
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/owner/products">View All</Link>
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {lowStockProducts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">No low stock products</p>
                  ) : (
                    <div className="space-y-4">
                      {lowStockProducts.slice(0, 5).map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between border-b pb-4">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.category || "Uncategorized"}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-medium">₹{product.price}</p>
                            <Badge variant="destructive">{product.stock_quantity} left</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </motion.div>
    </AuthGate>
  );
}
