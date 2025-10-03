"use client";

import { pageTransition } from "@/lib/animations";
import { motion } from "framer-motion";
import { Scale, Truck, CreditCard, MessageCircle } from "lucide-react";

export default function TermsPage() {
  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit">
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
          <p className="text-xl text-muted-foreground">
            Please read these terms carefully before using our platform.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4 bg-card border rounded-lg p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <Scale className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">User Responsibilities</h3>
                <p className="text-muted-foreground">
                  Users are responsible for maintaining the confidentiality of their account
                  information and for all activities under their account.
                </p>
              </div>
            </div>

            <div className="flex gap-4 bg-card border rounded-lg p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <Truck className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Delivery Policy</h3>
                <p className="text-muted-foreground">
                  We strive to deliver products on time, but delivery times may vary based on
                  location and availability.
                </p>
              </div>
            </div>

            <div className="flex gap-4 bg-card border rounded-lg p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <CreditCard className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Payment Terms</h3>
                <p className="text-muted-foreground">
                  All payments are processed securely. Prices are inclusive of applicable taxes
                  unless stated otherwise.
                </p>
              </div>
            </div>

            <div className="flex gap-4 bg-card border rounded-lg p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <MessageCircle className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Communication</h3>
                <p className="text-muted-foreground">
                  By creating an account, you agree to receive transactional emails and occasional
                  updates about our services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
