"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiService } from "@/services/apiService";
import { AuthGate } from "@/components/AuthGate";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, MapPin, Package, ShoppingBag, Truck, Clock, CheckCircle2 } from "lucide-react";
import Image from "next/image";

const statusIcons: Record<string, any> = {
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

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        const data = await ApiService.getOrderDetails(orderId);
        setOrder(data.order);
        setItems(data.items ?? []);
      } catch (error) {
        console.error("Failed to load order details", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const StatusIcon = ({ status }: { status: string }) => {
    const Icon = statusIcons[status] || Package;
    return <Icon className="h-5 w-5" />;
  };

  const getStatusSteps = () => {
    const steps = [
      { id: "pending", label: "Order Placed" },
      { id: "confirmed", label: "Confirmed" },
      { id: "out_for_delivery", label: "Out for Delivery" },
      { id: "delivered", label: "Delivered" },
    ];

    const currentStepIndex = steps.findIndex((step) => step.id === order?.status) || 0;

    return steps.map((step, index) => ({
      ...step,
      isCompleted: index <= currentStepIndex,
      isCurrent: index === currentStepIndex,
    }));
  };

  if (isLoading || !order) {
    return (
      <AuthGate>
        <div className="container mx-auto px-4 py-8">
          <div className="h-[600px] rounded-lg bg-muted animate-pulse"></div>
        </div>
      </AuthGate>
    );
  }

  const statusSteps = getStatusSteps();
  const subtotal = items.reduce((sum, item) => sum + item.price_at_order * item.quantity, 0);
  const deliveryFee = order.delivery_charge || 0;

  return (
    <AuthGate>
      <motion.div
        className="container mx-auto px-4 py-8"
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit">
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href="/orders" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Orders
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Order #{order.id.slice(0, 8)}
                <Badge
                  variant={statusColors[order.status] || "outline"}
                  className="ml-2 flex items-center gap-1">
                  <StatusIcon status={order.status} />
                  <span className="capitalize">{order.status.replace(/_/g, " ")}</span>
                </Badge>
              </h1>
              <p className="text-muted-foreground">Placed on {formatDate(order.order_date)}</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Order Status Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative flex justify-between">
              {/* Progress Bar */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-muted">
                <div
                  className="h-1 bg-primary transition-all"
                  style={{
                    width: `${
                      ((statusSteps.filter((s) => s.isCompleted).length - 1) * 100) /
                      (statusSteps.length - 1)
                    }%`,
                  }}></div>
              </div>

              {/* Status Steps */}
              {statusSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                    <StatusIcon status={step.id} />
                  </div>
                  <p
                    className={`mt-2 text-sm ${
                      step.isCurrent ? "font-medium" : "text-muted-foreground"
                    }`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 border-b pb-4">
                      <div className="relative w-16 h-16 bg-muted/30 rounded-md overflow-hidden flex-shrink-0">
                        {item.products?.image_url ? (
                          <Image
                            src={item.products.image_url}
                            alt={item.products.name || "Product"}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted/30 text-muted-foreground">
                            <Package size={24} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">
                            {item.products?.name || "Unknown Product"}
                          </h3>
                          <span className="font-medium">
                            {formatPrice(item.price_at_order * item.quantity)}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm text-muted-foreground mt-1">
                          <div>
                            <p>
                              {formatPrice(item.price_at_order)} × {item.quantity}{" "}
                              {item.products?.unit}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="font-medium">{order.user_addresses?.address_line_1}</p>
                  <p className="text-muted-foreground">
                    {order.user_addresses?.city} - {order.user_addresses?.pincode}
                  </p>
                  {order.user_addresses?.landmark && (
                    <p className="text-muted-foreground">
                      Landmark: {order.user_addresses?.landmark}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
                  </div>
                </div>

                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>

                <div className="pt-4">
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Payment Information</h4>
                    <p className="text-sm text-muted-foreground">Cash on Delivery</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/orders">View All Orders</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </AuthGate>
  );
}
