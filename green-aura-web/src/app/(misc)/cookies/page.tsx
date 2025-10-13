"use client";

import { pageTransition } from "@/lib/animations";
import { motion } from "framer-motion";
import { Cookie, Settings, BarChart, Clock } from "lucide-react";

export default function CookiesPage() {
  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit">
      <section className="py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Cookie Policy</h1>
          <p className="text-xl text-muted-foreground">
            We use cookies to enhance your browsing experience and provide personalized services.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4 bg-card border rounded-lg p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <Cookie className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Essential Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies are necessary for the website to function properly and cannot be
                  disabled.
                </p>
              </div>
            </div>

            <div className="flex gap-4 bg-card border rounded-lg p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <Settings className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Preference Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies remember your settings and preferences to enhance your experience.
                </p>
              </div>
            </div>

            <div className="flex gap-4 bg-card border rounded-lg p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <BarChart className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Analytics Cookies</h3>
                <p className="text-muted-foreground">
                  These cookies help us understand how visitors interact with our website to improve
                  functionality.
                </p>
              </div>
            </div>

            <div className="flex gap-4 bg-card border rounded-lg p-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <Clock className="text-primary" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Cookie Duration</h3>
                <p className="text-muted-foreground">
                  Most cookies expire after your session ends or within 30 days, depending on their
                  purpose.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
