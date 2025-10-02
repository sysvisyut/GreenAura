import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Suspense } from "react";
import { Toaster } from "sonner";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-4rem)]">
        <Suspense fallback={<div className="container mx-auto p-4">Loading...</div>}>
          {children}
        </Suspense>
      </main>
      <Footer />
      <Toaster position="top-center" richColors />
    </>
  );
}
