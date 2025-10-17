"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export function ForgotPasswordForm({
                                     className,
                                     ...props
                                   }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)} {...props}>
      {success ? (
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Check your email</h3>
            <p className="text-muted-foreground">
              We have sent a password reset link to your email. 
              Please check your inbox and follow the instructions.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full h-12">
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-8 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-8 text-sm font-medium" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>

          {/* Back to login */}
          <div className="text-center">
            <Link 
              href="/auth/login" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to sign in
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
