"use client";

import { getSupabaseClient } from "@/lib/supabaseClient";
import { createLogger } from "@/lib/logger";
import type { Json, Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

const log = createLogger("ApiService");

export type SignInResponse = { session: unknown | null; error: string | null };

export const ApiService = {
  // Authentication & User Management
  async signUpWithEmail(fullName: string, email: string, password: string) {
    const supabase = getSupabaseClient();
    log.info("signUpWithEmail: start", { email });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) {
      log.error("signUpWithEmail: error", error);
      return { session: null, error: error.message };
    }
    // The user is created, but needs to verify their email.
    // The profile will be created by the trigger.
    return { session: data.session ?? null, error: null };
  },

  async signInWithEmail(email: string, password: string) {
    const supabase = getSupabaseClient();
    log.info("signInWithEmail: start", { email });
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      log.error("signInWithEmail: error", error);
      return { session: null, error: error.message };
    }
    return { session: data.session ?? null, error: null };
  },
  
  async verifyOtp(email: string, token: string) {
    const supabase = getSupabaseClient();
    log.info("verifyOtp: start", { email });
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });
    if (error) {
      log.error("verifyOtp: error", error);
      return { session: null, error: error.message } as SignInResponse;
    }
    return { session: data.session ?? null, error: null } as SignInResponse;
  },

  async resendOtp(email: string) {
    const supabase = getSupabaseClient();
    log.info("resendOtp: start", { email });
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    if (error) {
      log.error("resendOtp: error", error);
      return { error: error.message };
    }
    return { error: null };
  },

  async signOut(): Promise<void> {
    const supabase = getSupabaseClient();
    log.info("signOut: start");
    const { error } = await supabase.auth.signOut();
    if (error) log.error("signOut: error", error);
  },

  async getCurrentUser() {
    const supabase = getSupabaseClient();
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr) {
      log.error("getSession error", sessionErr);
      return null;
    }
    if (!sessionData?.session) {
      return null;
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      log.warn("getCurrentUser: no user from session", error);
      return null;
    }
    return user ?? null;
  },

  async getUserProfile(userId: string): Promise<Tables<"users"> | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      log.error("getUserProfile: error", error);
      return null;
    }
    return data ?? null;
  },

  async createUserProfile(userId: string, fullName: string, phoneNumber: string | null) {
    const supabase = getSupabaseClient();
    const payload: TablesInsert<"users"> = { id: userId, full_name: fullName, phone_number: phoneNumber ?? null };
    log.info("createUserProfile: inserting", payload);
    const { data, error } = await supabase.from("users").insert(payload).select().single();
    if (error) {
      log.error("createUserProfile: error", error);
      throw error;
    }
    return data;
  },

  async updateUserProfile(userId: string, updates: TablesUpdate<"users">) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    if (error) {
      log.error("updateUserProfile: error", error);
      throw error;
    }
    return data;
  },

  async getUserAddresses(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) {
      log.error("getUserAddresses: error", error);
      throw error;
    }
    return data;
  },

  async addAddress(addressData: TablesInsert<"user_addresses">) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("user_addresses").insert(addressData).select().single();
    if (error) {
      log.error("addAddress: error", error);
      throw error;
    }
    return data;
  },

  async updateAddress(addressId: string, updates: TablesUpdate<"user_addresses">) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("user_addresses")
      .update(updates)
      .eq("id", addressId)
      .select()
      .single();
    if (error) {
      log.error("updateAddress: error", error);
      throw error;
    }
    return data;
  },

  async deleteAddress(addressId: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("user_addresses").delete().eq("id", addressId);
    if (error) {
      log.error("deleteAddress: error", error);
      throw error;
    }
  },

  // Organizations & Products
  async getOrganizations(limit = 20) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      log.error("getOrganizations: error", error);
      throw error;
    }
    return data;
  },

  async getOrganizationDetails(organizationId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("organizations").select("*").eq("id", organizationId).single();
    if (error) {
      log.error("getOrganizationDetails: error", error);
      throw error;
    }
    return data;
  },

  async getProductsByOrganization(organizationId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_available", true)
      .order("created_at", { ascending: false });
    if (error) {
      log.error("getProductsByOrganization: error", error);
      throw error;
    }
    return data;
  },

  async getFeaturedProducts(limit = 12) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_available", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      log.error("getFeaturedProducts: error", error);
      throw error;
    }
    return data;
  },

  async searchProducts(query: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("name", `%${query}%`)
      .eq("is_available", true)
      .order("created_at", { ascending: false });
    if (error) {
      log.error("searchProducts: error", error);
      throw error;
    }
    return data;
  },

  async getProductById(productId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();
    if (error) {
      log.error("getProductById: error", error);
      throw error;
    }
    return data;
  },

  // Cart
  async getCartItems(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("user_id", userId)
      .order("added_at", { ascending: false });
    if (error) {
      log.error("getCartItems: error", error);
      throw error;
    }
    return data;
  },

  async addToCart(userId: string, productId: string, quantity: number) {
    const supabase = getSupabaseClient();
    const payload: TablesInsert<"cart_items"> = { user_id: userId, product_id: productId, quantity };
    log.info("addToCart: upsert", payload);
    const { data, error } = await supabase
      .from("cart_items")
      .upsert(payload, { onConflict: "user_id,product_id" })
      .select()
      .single();
    if (error) {
      log.error("addToCart: error", error);
      throw error;
    }
    return data;
  },

  async updateCartItemQuantity(cartItemId: string, newQuantity: number) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", cartItemId)
      .select()
      .single();
    if (error) {
      log.error("updateCartItemQuantity: error", error);
      throw error;
    }
    return data;
  },

  async removeFromCart(cartItemId: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);
    if (error) {
      log.error("removeFromCart: error", error);
      throw error;
    }
  },

  async clearCart(userId: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);
    if (error) {
      log.error("clearCart: error", error);
      throw error;
    }
  },

  // Orders & Payments
  async createOrder(params: {
    userId: string;
    organizationId: string;
    deliveryAddressId: string;
    deliveryCharge: number;
    items: { product_id: string; quantity: number }[];
  }) {
    const supabase = getSupabaseClient();
    log.info("createOrder: calling RPC", params);
    const { data, error } = await supabase.rpc("create_order_transaction", {
      p_user_id: params.userId,
      p_organization_id: params.organizationId,
      p_delivery_address_id: params.deliveryAddressId,
      p_delivery_charge: params.deliveryCharge,
      p_items: params.items as unknown as Json,
    });
    if (error) {
      log.error("createOrder: error", error);
      throw error;
    }
    log.info("createOrder: created", data);
    return data as string;
  },

  async getUserOrders(userId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("order_date", { ascending: false });
    if (error) {
      log.error("getUserOrders: error", error);
      throw error;
    }
    return data;
  },

  async getOrderDetails(orderId: string) {
    const supabase = getSupabaseClient();
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*, user_addresses(*), organizations(*)")
      .eq("id", orderId)
      .single();
    if (orderErr) {
      log.error("getOrderDetails: order error", orderErr);
      throw orderErr;
    }
    const { data: items, error: itemsErr } = await supabase
      .from("order_items")
      .select("*, products(*)")
      .eq("order_id", orderId);
    if (itemsErr) {
      log.error("getOrderDetails: items error", itemsErr);
      throw itemsErr;
    }
    return { order, items };
  },

  async createPaymentRecord(paymentData: TablesInsert<"payments">) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("payments").insert(paymentData).select().single();
    if (error) {
      log.error("createPaymentRecord: error", error);
      throw error;
    }
    return data;
  },

  async updatePaymentStatus(orderId: string, transactionId: string | null, status: string, gatewayResponse: unknown) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("payments")
      .update({ status, transaction_id: transactionId, gateway_response: gatewayResponse as any })
      .eq("order_id", orderId)
      .select()
      .maybeSingle();
    if (error) {
      log.error("updatePaymentStatus: error", error);
      throw error;
    }
    return data;
  },

  // Owner
  async getOrganizationByOwner(ownerId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("organizations").select("*").eq("owner_id", ownerId).maybeSingle();
    if (error) {
      log.error("getOrganizationByOwner: error", error);
      throw error;
    }
    return data;
  },

  async updateOrganization(organizationId: string, updates: TablesUpdate<"organizations">) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("organizations")
      .update(updates)
      .eq("id", organizationId)
      .select()
      .single();
    if (error) {
      log.error("updateOrganization: error", error);
      throw error;
    }
    return data;
  },

  async createProduct(productData: TablesInsert<"products">) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from("products").insert(productData).select().single();
    if (error) {
      log.error("createProduct: error", error);
      throw error;
    }
    return data;
  },

  async updateProduct(productId: string, updates: TablesUpdate<"products">) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId)
      .select()
      .single();
    if (error) {
      log.error("updateProduct: error", error);
      throw error;
    }
    return data;
  },

  async deleteProduct(productId: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) {
      log.error("deleteProduct: error", error);
      throw error;
    }
  },

  async getOrdersForOrganization(organizationId: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("organization_id", organizationId)
      .order("order_date", { ascending: false });
    if (error) {
      log.error("getOrdersForOrganization: error", error);
      throw error;
    }
    return data;
  },

  async updateOrderStatus(orderId: string, newStatus: string) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)
      .select()
      .single();
    if (error) {
      log.error("updateOrderStatus: error", error);
      throw error;
    }
    return data;
  },
};
