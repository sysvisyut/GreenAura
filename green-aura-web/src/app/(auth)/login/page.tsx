"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { pageTransition } from "@/lib/animations";
import { isValidEmail } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithEmail, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Redirect based on role
      if ((user as any).role === "organization") router.push("/owner");
      else router.push("/");
    }
  }, [user, router]);

  const handleSkip = async () => {
    try {
      document.cookie = `ga_skip_auth=true; path=/; max-age=${60 * 10}`; // 10 minutes
      router.push("/");
    } catch (e) {
      // no-op
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        // If credentials invalid or user not found, guide to signup instead of inline error
        toast.error("User not registered", {
          description: "Please create an account to continue.",
        });
        router.push(`/signup?email=${encodeURIComponent(email)}`);
        return;
      }
      // After the sign-in attempt, the AuthContext's onAuthStateChange listener
      // will update the `user` state. The useEffect above will then trigger
      // the redirect. We set loading to false here to unblock the UI in case of error.
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center min-h-screen p-4"
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit">
      <Card className="w-full max-w-md" animate>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error?.includes("email") ? error : undefined}
                required
              />
            </div>
            <div className="space-y-2 relative">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={error?.includes("password") ? error : undefined}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-[2.1rem] text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between w-full">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
          <Button variant="outline" onClick={handleSkip}>
            Skip for now
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
