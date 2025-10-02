
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {children}
      </main>
    </>
  );
}
