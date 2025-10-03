"use client";

import { Button } from "@/components/ui/button";
import { pageTransition } from "@/lib/animations";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Leaf, Users, TrendingUp, Globe, MapPin, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Mission</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Connecting local farmers with consumers to create a sustainable food ecosystem that
            benefits everyone.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 md:py-16 border-t">
        <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Leaf className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Sustainability</h3>
            <p className="text-muted-foreground">
              We prioritize environmentally responsible farming practices and minimize food miles to
              reduce our carbon footprint.
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Community</h3>
            <p className="text-muted-foreground">
              We believe in strengthening local economies by supporting small-scale farmers and
              creating meaningful connections.
            </p>
          </div>
          <div className="bg-card border rounded-lg p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Innovation</h3>
            <p className="text-muted-foreground">
              We leverage technology to make sustainable food systems more efficient, transparent,
              and accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-16 border-t">
        <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-muted transform md:-translate-x-1/2"></div>

            {/* Step 1 */}
            <div className="relative mb-12 md:mb-24">
              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
                <div className="flex md:justify-end md:w-1/2 md:pr-8 order-2 md:order-1">
                  <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Farmers List Their Products</h3>
                    <p className="text-muted-foreground">
                      Local farmers register on our platform and list their fresh produce, setting
                      their own prices and quantities.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 flex justify-start md:justify-center order-1 md:order-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                    <span className="text-primary-foreground font-bold">1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative mb-12 md:mb-24">
              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
                <div className="md:w-1/2 flex justify-start md:justify-center order-1">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                    <span className="text-primary-foreground font-bold">2</span>
                  </div>
                </div>
                <div className="flex md:w-1/2 md:pl-8 order-2">
                  <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Customers Place Orders</h3>
                    <p className="text-muted-foreground">
                      Customers browse available products, select items from farms in their area,
                      and place orders through our platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative mb-12 md:mb-24">
              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
                <div className="flex md:justify-end md:w-1/2 md:pr-8 order-2 md:order-1">
                  <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Farmers Harvest to Order</h3>
                    <p className="text-muted-foreground">
                      Farmers harvest produce specifically for each order, ensuring maximum
                      freshness and minimal waste.
                    </p>
                  </div>
                </div>
                <div className="md:w-1/2 flex justify-start md:justify-center order-1 md:order-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                    <span className="text-primary-foreground font-bold">3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
                <div className="md:w-1/2 flex justify-start md:justify-center order-1">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                    <span className="text-primary-foreground font-bold">4</span>
                  </div>
                </div>
                <div className="flex md:w-1/2 md:pl-8 order-2">
                  <div className="bg-card border rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-2">Same-Day Delivery</h3>
                    <p className="text-muted-foreground">
                      We deliver products directly to customers&apos; doors, often within hours of
                      harvest, ensuring peak freshness and flavor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 md:py-16 border-t">
        <h2 className="text-3xl font-bold mb-12 text-center">Why Choose GreenAura</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
              <Globe className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Environmental Impact</h3>
              <p className="text-muted-foreground">
                By sourcing locally, we reduce food miles and carbon emissions. Our farmers use
                sustainable practices that protect soil health and biodiversity.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
              <MapPin className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Ultra-Local Sourcing</h3>
              <p className="text-muted-foreground">
                Most of our produce comes from within 30km of your location, ensuring freshness and
                supporting your local economy.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
              <ShieldCheck className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
              <p className="text-muted-foreground">
                We carefully vet all farmers on our platform and regularly check that they meet our
                quality and sustainability standards.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
              <Users className="text-primary" size={20} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Fair Compensation</h3>
              <p className="text-muted-foreground">
                Farmers set their own prices and receive a much larger share of the final price than
                through traditional retail channels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-12 md:py-16 border-t">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Join the Movement</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Whether you&apos;re a farmer looking to reach more customers or a consumer seeking the
            freshest local produce, we invite you to be part of our growing community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/products">
                Shop Now
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
