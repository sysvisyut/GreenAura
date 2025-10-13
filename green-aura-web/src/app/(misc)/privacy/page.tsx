"use client";

import { pageTransition } from "@/lib/animations";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit">
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground">
            We value your privacy and are committed to protecting your personal data.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4 bg-card border rounded-lg p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <Shield className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Data Protection</h3>
                <p className="text-muted-foreground">
                  We implement robust security measures to protect your personal information from
                  unauthorized access.
                </p>
              </div>
            </div>

            <div className="flex gap-4 bg-card border rounded-lg p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <Lock className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Information Security</h3>
                <p className="text-muted-foreground">
                  Your payment information is encrypted and securely processed through trusted
                  partners.
                </p>
              </div>
            </div>

            <div className="flex gap-4 bg-card border rounded-lg p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <Eye className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Transparency</h3>
                <p className="text-muted-foreground">
                  We clearly explain how your data is used and never sell your personal information
                  to third parties.
                </p>
              </div>
            </div>

            <div className="flex gap-4 bg-card border rounded-lg p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <FileCheck className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Your Rights</h3>
                <p className="text-muted-foreground">
                  You have the right to access, correct, or delete your personal data at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
