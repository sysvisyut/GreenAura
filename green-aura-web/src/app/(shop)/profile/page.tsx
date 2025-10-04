"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { AuthGate } from "@/components/AuthGate";
import { useState, useEffect } from "react";
import { ApiService } from "@/services/apiService";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Save, MapPin, User, Phone, Mail, Trash2, Edit, LogOut, Package } from "lucide-react";

export default function ProfilePage() {
  const { user, profile, signOut, isLoading, updateProfile } = useAuth();
  const router = useRouter();

  // Profile state
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone_number ?? "");
  const [saving, setSaving] = useState(false);

  // Address state
  type Address = {
    id: string;
    address_line_1: string;
    city: string;
    pincode: string;
    landmark?: string | null;
    address_type?: string | null;
  };
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    address_line_1: "",
    city: "",
    pincode: "",
    landmark: "",
    address_type: "home",
  });
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Load addresses
  useEffect(() => {
    if (!user) return;

    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const data = await ApiService.getUserAddresses(user.id);
        setAddresses(data ?? []);
      } catch (error) {
        console.error("Failed to load addresses", error);
        toast.error("Failed to load addresses");
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName, phone_number: phone });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Profile update error:", error);
    } finally {
      setSaving(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      address_line_1: "",
      city: "",
      pincode: "",
      landmark: "",
      address_type: "home",
    });
    setEditingAddressId(null);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      if (editingAddressId) {
        // Update existing address
        await ApiService.updateAddress(editingAddressId, {
          ...addressForm,
          user_id: user.id,
        });
        toast.success("Address updated successfully");
      } else {
        // Add new address
        await ApiService.addAddress({
          ...addressForm,
          user_id: user.id,
        });
        toast.success("Address added successfully");
      }

      // Refresh addresses
      const data = await ApiService.getUserAddresses(user.id);
      setAddresses(data ?? []);

      // Reset form and hide it
      resetAddressForm();
      setShowAddressForm(false);
    } catch (error) {
      console.error("Address save error:", error);
      toast.error(editingAddressId ? "Failed to update address" : "Failed to add address");
    }
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm({
      address_line_1: address.address_line_1 || "",
      city: address.city || "",
      pincode: address.pincode || "",
      landmark: address.landmark || "",
      address_type: address.address_type || "home",
    });
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      await ApiService.deleteAddress(addressId);
      setAddresses(addresses.filter((a) => a.id !== addressId));
      toast.success("Address deleted successfully");
    } catch (error) {
      console.error("Address delete error:", error);
      toast.error("Failed to delete address");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
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
        <h1 className="text-3xl font-bold mb-6">Your Account</h1>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User size={16} />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin size={16} />
              <span>Addresses</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center gap-2"
              onClick={() => router.push("/orders")}>
              <Package size={16} />
              <span>Order History</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <Input id="email" value={user?.email || ""} disabled className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    className="flex items-center gap-2">
                    <LogOut size={16} />
                    Logout
                  </Button>

                  <Button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex items-center gap-2">
                    {saving ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Addresses</h2>
                <Button
                  onClick={() => {
                    resetAddressForm();
                    setShowAddressForm(!showAddressForm);
                  }}
                  className="flex items-center gap-2">
                  {showAddressForm ? (
                    "Cancel"
                  ) : (
                    <>
                      <Plus size={16} />
                      Add New Address
                    </>
                  )}
                </Button>
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>{editingAddressId ? "Edit Address" : "Add New Address"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="address_line_1" className="text-sm font-medium">
                          Address Line
                        </label>
                        <Input
                          id="address_line_1"
                          value={addressForm.address_line_1}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, address_line_1: e.target.value })
                          }
                          placeholder="House/Flat No, Building, Street"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="city" className="text-sm font-medium">
                            City
                          </label>
                          <Input
                            id="city"
                            value={addressForm.city}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, city: e.target.value })
                            }
                            placeholder="City"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="pincode" className="text-sm font-medium">
                            Pincode
                          </label>
                          <Input
                            id="pincode"
                            value={addressForm.pincode}
                            onChange={(e) =>
                              setAddressForm({ ...addressForm, pincode: e.target.value })
                            }
                            placeholder="Pincode"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="landmark" className="text-sm font-medium">
                          Landmark (Optional)
                        </label>
                        <Input
                          id="landmark"
                          value={addressForm.landmark || ""}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, landmark: e.target.value })
                          }
                          placeholder="Nearby landmark"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="address_type" className="text-sm font-medium">
                          Address Type
                        </label>
                        <select
                          id="address_type"
                          value={addressForm.address_type}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, address_type: e.target.value })
                          }
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button type="submit">
                          {editingAddressId ? "Update Address" : "Save Address"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Addresses List */}
              {loadingAddresses ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 rounded-lg bg-muted animate-pulse"></div>
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      <MapPin size={24} className="text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2">No addresses found</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your delivery addresses to make checkout faster
                  </p>
                  {!showAddressForm && (
                    <Button
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center gap-2 mx-auto">
                      <Plus size={16} />
                      Add Address
                    </Button>
                  )}
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <Card key={address.id} className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary capitalize">
                              {address.address_type || "Home"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditAddress(address)}
                              className="h-8 w-8 p-0">
                              <Edit size={16} />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAddress(address.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                              <Trash2 size={16} />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="font-medium">{address.address_line_1}</p>
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
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AuthGate>
  );
}
