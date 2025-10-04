"use client";

import { useEffect, useState } from "react";
import { ApiService } from "@/services/apiService";
import { useAuth } from "@/context/auth-context";
import { createLogger } from "@/lib/logger";
import { AuthGate } from "@/components/AuthGate";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import {
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ShoppingBag,
  Plus,
  Truck,
} from "lucide-react";
import Link from "next/link";

const log = createLogger("CheckoutPage");

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { items, subtotal, itemCount, clearCart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  type Address = {
    id: string;
    address_line_1: string;
    city: string;
    pincode: string;
    landmark?: string | null;
    address_type?: string | null;
  };
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delivery fee calculation
  const deliveryFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        setLoading(true);
        const data = await ApiService.getUserAddresses(user.id);
        setAddresses(data ?? []);
        setSelectedAddress(data?.[0]?.id ?? null);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to load addresses";
        setError(message);
        log.error("Checkout addresses error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const placeOrder = async () => {
    if (!user || !selectedAddress) {
      toast.error("Please select a delivery address");
      return;
    }

    setIsProcessing(true);

    try {
      // For MVP: infer orgId from cart first item
      const cart = await ApiService.getCartItems(user.id);
      if (!cart || cart.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      const organizationId = cart[0].products?.organization_id as string;
      const items = cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity }));

      const orderId = await ApiService.createOrder({
        userId: user.id,
        organizationId,
        deliveryAddressId: selectedAddress,
        deliveryCharge: deliveryFee,
        items,
      });

      log.info("Order placed", { orderId });
      clearCart();
      toast.success("Order placed successfully!");

      // Redirect to order confirmation
      router.push(`/orders/${orderId}`);
    } catch (e) {
      log.error("Place order failed", e);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading) return <div className="container mx-auto px-4 py-8">Loading...</div>;
  if (!user) return <AuthGate>{null}</AuthGate>;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="grid gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-destructive mb-4">An error occurred: {error}</div>
            <Button asChild>
              <Link href="/cart">Return to Cart</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag size={24} className="text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add some products to your cart before proceeding to checkout
            </p>
            <Button asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthGate>
      <motion.div
        className="container mx-auto px-4 py-8"
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Complete your order in just a few steps</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Checkout Steps */}
            <div className="mb-6 flex items-center">
              <div
                className={`flex items-center ${
                  step === 1 ? "text-primary" : "text-muted-foreground"
                }`}>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <MapPin
                    size={16}
                    className={step === 1 ? "text-primary" : "text-muted-foreground"}
                  />
                </div>
                <span className="font-medium">Delivery</span>
              </div>

              <div className="h-px bg-muted flex-1 mx-4"></div>

              <div
                className={`flex items-center ${
                  step === 2 ? "text-primary" : "text-muted-foreground"
                }`}>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                  <CreditCard
                    size={16}
                    className={step === 2 ? "text-primary" : "text-muted-foreground"}
                  />
                </div>
                <span className="font-medium">Payment</span>
              </div>
            </div>

            {/* Step Content */}
            {step === 1 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Select Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {addresses.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4">
                        You don&apos;t have any saved addresses
                      </p>
                      <Button asChild>
                        <Link href="/profile?tab=addresses" className="flex items-center gap-2">
                          <Plus size={16} />
                          Add New Address
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedAddress === address.id
                              ? "border-primary bg-primary/5"
                              : "hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedAddress(address.id)}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <input
                                type="radio"
                                name="address"
                                checked={selectedAddress === address.id}
                                onChange={() => setSelectedAddress(address.id)}
                                className="mt-1"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{address.address_line_1}</span>
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary capitalize">
                                    {address.address_type || "Home"}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {address.city} - {address.pincode}
                                </p>
                                {address.landmark && (
                                  <p className="text-sm text-muted-foreground">
                                    Landmark: {address.landmark}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-between items-center pt-4">
                        <Button variant="outline" asChild>
                          <Link href="/profile?tab=addresses" className="flex items-center gap-2">
                            <Plus size={16} />
                            Add New Address
                          </Link>
                        </Button>

                        <Button
                          onClick={() => setStep(2)}
                          disabled={!selectedAddress}
                          className="flex items-center gap-2">
                          Continue to Payment
                          <ArrowRight size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="border rounded-lg p-4 border-primary bg-primary/5">
                      <div className="flex items-center gap-3">
                        <input type="radio" name="payment" checked={true} readOnly />
                        <div>
                          <div className="font-medium">Cash on Delivery</div>
                          <p className="text-sm text-muted-foreground">
                            Pay when your order arrives
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>Note: For this demo, only Cash on Delivery is available.</p>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        Back to Delivery
                      </Button>

                      <Button
                        onClick={placeOrder}
                        disabled={isProcessing}
                        className="flex items-center gap-2">
                        {isProcessing ? (
                          "Processing..."
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Place Order
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                      <span>{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}

                  {items.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      + {items.length - 3} more items
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      {deliveryFee === 0 && (
                        <span className="px-1.5 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                          Free
                        </span>
                      )}
                    </div>
                    <span>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
                  </div>

                  {deliveryFee > 0 && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Truck size={12} />
                      <span>Add {formatPrice(500 - subtotal)} more for free delivery</span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => (step === 1 ? setStep(2) : placeOrder())}
                    disabled={!selectedAddress || isProcessing}
                    className="w-full flex items-center justify-center gap-2">
                    {step === 1 ? (
                      <>
                        Continue to Payment
                        <ArrowRight size={16} />
                      </>
                    ) : isProcessing ? (
                      "Processing..."
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Place Order
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground pt-2">
                  <p>
                    By placing your order, you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </AuthGate>
  );
}
