"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { Mail, Lock, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema, type RegistrationFormData, type AuthError } from "@/lib/types/auth";
import { toast } from "sonner";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<AuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignUp = async (data: RegistrationFormData) => {
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setSuccessOpen(true);
      toast.success("Account created successfully! Please check your email to verify your account.");
    } catch (error: unknown) {
      const authError: AuthError = {
        message: error instanceof Error ? error.message : "An unexpected error occurred",
        code: error instanceof Error && 'code' in error ? String(error.code) : undefined,
      };
      setError(authError);
      toast.error(authError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const supabase = createClient();
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: unknown) {
      const authError: AuthError = {
        message: error instanceof Error ? error.message : "Failed to sign up with Google",
        code: error instanceof Error && 'code' in error ? String(error.code) : undefined,
      };
      setError(authError);
      toast.error(authError.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("space-y-4 sm:space-y-6", className)} {...props}>
      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <DialogTitle>Account created successfully!</DialogTitle>
            </div>
            <DialogDescription className="text-center">
              Please check your email to verify your account before signing in.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setSuccessOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Sign Up */}
      <div className="space-y-2 sm:space-y-3">
        <Button 
          variant="outline" 
          className="w-full h-11 sm:h-10 text-sm font-medium"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading || isLoading}
          aria-label="Sign up with Google"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </Button>
        
        <div className="relative">
          <div className="relative flex justify-center text-sm">
            <span className="px-4 text-muted-foreground bg-background">or</span>
          </div>
        </div>
      </div>

      {/* Sign Up Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-3 sm:space-y-4">
          <div className="space-y-3 sm:space-y-4">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }: { field: ControllerRenderProps<RegistrationFormData, "email"> }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 h-11 sm:h-10 text-sm"
                        aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                        aria-invalid={!!form.formState.errors.email}
                      />
                    </div>
                  </FormControl>
                  <FormMessage id="email-error" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }: { field: ControllerRenderProps<RegistrationFormData, "password"> }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <PasswordInput
                        {...field}
                        placeholder="Enter your password"
                        className="pl-10 h-11 sm:h-10 text-sm"
                        aria-describedby={form.formState.errors.password ? "password-error" : undefined}
                        aria-invalid={!!form.formState.errors.password}
                      />
                    </div>
                  </FormControl>
                  <FormMessage id="password-error" />
                  <div className="text-xs text-muted-foreground">
                    Password must be at least 8 characters with uppercase, lowercase, and number
                  </div>
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }: { field: ControllerRenderProps<RegistrationFormData, "confirmPassword"> }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <PasswordInput
                        {...field}
                        placeholder="Re-enter your password"
                        className="pl-10 h-11 sm:h-10 text-sm"
                        aria-describedby={form.formState.errors.confirmPassword ? "confirm-password-error" : undefined}
                        aria-invalid={!!form.formState.errors.confirmPassword}
                      />
                    </div>
                  </FormControl>
                  <FormMessage id="confirm-password-error" />
                </FormItem>
              )}
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" role="alert" aria-live="polite">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-11 sm:h-10 text-sm font-medium" 
            disabled={isLoading || isGoogleLoading}
            aria-describedby={error ? "signup-error" : undefined}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </Form>

      {/* Login link */}
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-primary hover:text-primary/80 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
        >
          Sign in now
        </Link>
      </div>
    </div>
  );
}
