"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/overview");
    } else if (!isLoading && !user) {
      // If loading is done and still no user, maybe the token was invalid
      router.replace("/auth/login");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Processing sign-in...</h1>
          <p className="text-muted-foreground mt-2">Please wait while we complete your authentication</p>
        </div>
      </div>
    </div>
  );
}
