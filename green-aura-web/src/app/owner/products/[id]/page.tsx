"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { ApiService } from "@/services/apiService";
import { AuthGate } from "@/components/AuthGate";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

const CATEGORY_OPTIONS = ["Vegetables", "Fruits", "Dairy", "Herbs", "Grains", "Beverages"];

export default function EditProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    unit: "kg",
    stock_quantity: 0,
    category: "",
    image_url: "",
    is_available: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get product details
        const product = await ApiService.getProductById(productId);
        if (product) {
          setForm({
            name: product.name || "",
            description: product.description || "",
            price: product.price || 0,
            unit: product.unit || "kg",
            stock_quantity: product.stock_quantity || 0,
            category: product.category || "",
            image_url: product.image_url || "",
            is_available: product.is_available,
          });
        }
      } catch (error) {
        console.error("Failed to load product data", error);
        toast.error("Failed to load product data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId]);

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) {
      toast.error("Product ID is missing");
      return;
    }

    if (!form.name || form.price <= 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      let imageUrl = form.image_url?.trim() || "";
      if (imageFile) {
        try {
          // Load owner orgId to place image under org folder
          const org = await ApiService.getOrganizationByOwner(user!.id);
          const orgId = org?.id || "misc";
          imageUrl = await ApiService.uploadProductImage(imageFile, orgId);
        } catch (uploadErr: any) {
          console.error("Image upload failed", uploadErr);
          toast.error("Image upload failed. Please try again.");
          setIsSaving(false);
          return;
        }
      }

      await ApiService.updateProduct(productId, { ...form, image_url: imageUrl || null } as any);
      toast.success("Product updated successfully");
      router.push("/owner/products");
    } catch (error) {
      console.error("Failed to update product", error);
      toast.error("Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthGate allow="organization">
      <motion.div
        className="space-y-6"
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/owner/products"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
              <ArrowLeft size={16} className="mr-1" />
              Back to Products
            </Link>
            <h1 className="text-3xl font-bold">Edit Product</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="h-[400px] rounded-lg bg-muted animate-pulse"></div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Product Name *
                    </label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="category" className="text-sm font-medium">
                      Category
                    </label>
                    <div className="flex gap-2">
                      <select
                        id="category"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={form.category}
                        onChange={(e) => handleChange("category", e.target.value)}>
                        <option value="">Select Category</option>
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                        <option value="other">Other</option>
                      </select>
                      {form.category === "other" && (
                        <Input
                          placeholder="New category"
                          onChange={(e) => handleChange("category", e.target.value)}
                        />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium">
                      Price (₹) *
                    </label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => handleChange("price", parseFloat(e.target.value))}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="unit" className="text-sm font-medium">
                      Unit *
                    </label>
                    <select
                      id="unit"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.unit}
                      onChange={(e) => handleChange("unit", e.target.value)}
                      required>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="g">Gram (g)</option>
                      <option value="piece">Piece</option>
                      <option value="bunch">Bunch</option>
                      <option value="dozen">Dozen</option>
                      <option value="liter">Liter</option>
                      <option value="ml">Milliliter (ml)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="stock" className="text-sm font-medium">
                      Stock Quantity *
                    </label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={form.stock_quantity}
                      onChange={(e) => handleChange("stock_quantity", parseInt(e.target.value))}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="image" className="text-sm font-medium">
                      Product Image
                    </label>
                    <div className="flex flex-col gap-2">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setImageFile(file || null);
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setImagePreview(url);
                          } else {
                            setImagePreview(null);
                          }
                        }}
                      />
                      {(imagePreview || form.image_url) && (
                        <img
                          src={imagePreview || form.image_url}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-md border"
                        />
                      )}
                      <p className="text-xs text-muted-foreground">
                        Optional. If selected, the file will be uploaded to storage and the public
                        URL saved.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={form.description || ""}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Enter product description"
                      className="w-full min-h-[120px] p-3 border rounded-md bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.is_available}
                        onChange={(e) => handleChange("is_available", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      Available for purchase
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" type="button" asChild>
                    <Link href="/owner/products">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </AuthGate>
  );
}
