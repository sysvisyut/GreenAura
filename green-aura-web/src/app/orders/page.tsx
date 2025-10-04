"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiService } from "@/services/apiService";
import { useAuth } from "@/context/auth-context";
import { AuthGate } from "@/components/AuthGate";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { Package, ShoppingBag, Clock, CheckCircle2, Truck, ArrowRight } from "lucide-react";
import { createLogger } from "@/lib/logger";

const log = createLogger("OrdersPage");

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  confirmed: CheckCircle2,
  out_for_delivery: Truck,
  delivered: Package,
};

const statusColors: Record<
  string,
  "warning" | "info" | "secondary" | "success" | "outline" | "default" | "destructive"
> = {
  pending: "warning",
  confirmed: "info",
  out_for_delivery: "secondary",
  delivered: "success",
};

export default function OrdersPage() {
  const { user } = useAuth();
  type Order = { id: string; status: string; order_date: string; total_amount: number };
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      log.info("fetchOrders:start", { userId: user.id });
      setIsLoading(true);
      try {
        const data = await ApiService.getUserOrders(user.id);
        log.info("fetchOrders:success", { count: (data ?? []).length });
        setOrders(data ?? []);
      } catch (error) {
        log.error("fetchOrders:error", error);
      } finally {
        setIsLoading(false);
        log.info("fetchOrders:end");
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) return <AuthGate>{null}</AuthGate>;

  const StatusIcon = ({ status }: { status: string }) => {
    const Icon = statusIcons[status] || Package;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <AuthGate>
      <motion.div
        className="container mx-auto px-4 py-8"
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-lg bg-muted animate-pulse"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingBag size={24} className="text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t placed any orders yet. Start shopping to see your orders here.
              </p>
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <Link href={`/orders/${order.id}`} className="block">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">Order #{order.id.slice(0, 8)}</h3>
                          <Badge
                            variant={statusColors[order.status] || "outline"}
                            className="flex items-center gap-1">
                            <StatusIcon status={order.status} />
                            <span className="capitalize">{order.status.replace(/_/g, " ")}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Placed on {formatDate(order.order_date)}</p>
                          <p>Total: {formatPrice(order.total_amount)}</p>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm" className="self-end sm:self-auto">
                        View Details
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </AuthGate>
  );
}
