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
import { formatDate, formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Clock, Package, Truck } from "lucide-react";

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle2,
  out_for_delivery: Truck,
  delivered: Package,
};

const statusColors = {
  pending: "warning",
  confirmed: "info",
  out_for_delivery: "secondary",
  delivered: "success",
} as const;

export default function OwnerOrdersPage() {
  const { user } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const org = await ApiService.getOrganizationByOwner(user.id);
        if (org) {
          setOrgId(org.id);
          const ordersData = await ApiService.getOrdersForOrganization(org.id);
          setOrders(ordersData ?? []);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const updated = await ApiService.updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error("Failed to update order status", error);
      toast.error("Failed to update order status");
    }
  };

  const toggleOrderDetails = async (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    setExpandedOrder(orderId);

    if (!orderItems[orderId]) {
      try {
        const details = await ApiService.getOrderDetails(orderId);
        setOrderItems((prev) => ({
          ...prev,
          [orderId]: details.items || [],
        }));
      } catch (error) {
        console.error("Failed to fetch order details", error);
      }
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    const IconComponent = (statusIcons as any)[status] || AlertCircle;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <AuthGate allow="organization">
      <motion.div
        className="space-y-6"
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
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
                  <AlertCircle size={24} className="text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-muted-foreground">
                When customers place orders, they will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">Order #{order.id.slice(0, 8)}</h3>
                      <Badge
                        variant={
                          statusColors[order.status as keyof typeof statusColors] || "outline"
                        }>
                        <StatusIcon status={order.status} />
                        <span className="ml-1">{order.status}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Date: {formatDate(order.order_date)}</p>
                      <p>Total: {formatPrice(order.total_amount)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 self-end sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleOrderDetails(order.id)}>
                      {expandedOrder === order.id ? "Hide Details" : "View Details"}
                    </Button>

                    {order.status !== "delivered" && (
                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <Button size="sm" onClick={() => updateStatus(order.id, "confirmed")}>
                            Confirm
                          </Button>
                        )}
                        {order.status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(order.id, "out_for_delivery")}>
                            Ship
                          </Button>
                        )}
                        {order.status === "out_for_delivery" && (
                          <Button size="sm" onClick={() => updateStatus(order.id, "delivered")}>
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t px-6 py-4 bg-muted/30">
                    <h4 className="font-medium mb-3">Order Items</h4>
                    {!orderItems[order.id] ? (
                      <div className="py-4 text-center">Loading order details...</div>
                    ) : (
                      <div className="space-y-3">
                        {orderItems[order.id].map((item) => (
                          <div key={item.id} className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">
                                {item.products?.name || "Unknown Product"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatPrice(item.price_at_order)} × {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium">
                              {formatPrice(item.price_at_order * item.quantity)}
                            </p>
                          </div>
                        ))}
                        <div className="border-t pt-3 flex justify-between font-medium">
                          <span>Total</span>
                          <span>{formatPrice(order.total_amount)}</span>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t">
                      <h4 className="font-medium mb-2">Delivery Address</h4>
                      <p className="text-sm">
                        {order.user_addresses?.address_line_1},{order.user_addresses?.city} -{" "}
                        {order.user_addresses?.pincode}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </AuthGate>
  );
}
