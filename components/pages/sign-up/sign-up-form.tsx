"use client";

import { cn, getBaseUrl } from "@/lib/utils";
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
import { useAuth } from "@/lib/contexts/auth-context";
import { User } from "lucide-react";
import { toast } from "sonner";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<AuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const { register } = useAuth();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSignUp = async (data: RegistrationFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await register(data);
    } catch (error: any) {
      const authError: AuthError = {
        message: error.message || "An unexpected error occurred",
      };
      setError(authError);
      // toast already handled in context
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      // Redirect to backend social auth endpoint
      window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5283/api'}/auth/social/google`;
    } catch (error: unknown) {
      const authError: AuthError = {
        message: "Failed to initiate Google sign up",
      };
      setError(authError);
      toast.error(authError.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("space-y-10 font-fira-sans", className)} {...props}>
      {/* Success Modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="rounded-[2.5rem] border-border/40 bg-card/90 backdrop-blur-3xl p-10 max-w-md">
          <DialogHeader className="space-y-6">
            <div className="flex flex-col items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle className="h-10 w-10 text-emerald-500 stroke-[2.5]" />
              </div>
              <DialogTitle className="text-3xl font-black uppercase tracking-tighter text-center leading-none">Registration <br /><span className="text-emerald-500 italic">Successful</span></DialogTitle>
            </div>
            <DialogDescription className="text-center font-medium text-muted-foreground leading-relaxed">
              We have sent a verification link to your email address. Please confirm your email to activate your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={() => setSuccessOpen(false)} className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-emerald-500/20">
              DISMISS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Login */}
      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-11 rounded-xl border-border/40 bg-muted/20 hover:bg-primary/5 hover:border-primary/50 transition-all font-black text-[10px] uppercase tracking-[0.2em] group shadow-xl"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 mr-3 animate-spin" />
          ) : (
            <svg className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          CONTINUE WITH GOOGLE
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/20" />
          </div>
          <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em] italic">
            <span className="bg-background px-4 text-muted-foreground/40">OR CREATE ACCOUNT WITH EMAIL</span>
          </div>
        </div>
      </div>

      {/* SignUp Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-6">
          <div className="space-y-6">
            {/* Full Name Field */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 italic">FULL NAME</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 h-4 w-4 group-focus-within:text-primary transition-colors" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="John Doe"
                        className="pl-12 h-11 rounded-xl border-border/40 bg-muted/10 group-focus-within:bg-background group-focus-within:border-primary/50 transition-all font-fira-mono text-sm tracking-tight placeholder:opacity-30"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase tracking-widest text-destructive" />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 italic">EMAIL ADDRESS</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 h-4 w-4 group-focus-within:text-primary transition-colors" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="your@email.com"
                        className="pl-12 h-11 rounded-xl border-border/40 bg-muted/10 group-focus-within:bg-background group-focus-within:border-primary/50 transition-all font-fira-mono text-sm tracking-tight placeholder:opacity-30"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase tracking-widest text-destructive" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic ml-1">PASSWORD</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 h-4 w-4 group-focus-within:text-primary transition-colors" />
                      <PasswordInput
                        {...field}
                        placeholder="••••••••••••"
                        className="pl-12 h-11 rounded-xl border-border/40 bg-muted/10 group-focus-within:bg-background group-focus-within:border-primary/50 transition-all font-fira-mono text-sm tracking-tight placeholder:opacity-30"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase tracking-widest text-destructive" />
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none px-1">
                    Req: 8+ Chars / Alpha-Numeric Composite
                  </div>
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic ml-1">CONFIRM PASSWORD</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 h-4 w-4 group-focus-within:text-primary transition-colors" />
                      <PasswordInput
                        {...field}
                        placeholder="••••••••••••"
                        className="pl-12 h-11 rounded-xl border-border/40 bg-muted/10 group-focus-within:bg-background group-focus-within:border-primary/50 transition-all font-fira-mono text-sm tracking-tight placeholder:opacity-30"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold uppercase tracking-widest text-destructive" />
                </FormItem>
              )}
            />
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-destructive leading-tight">{error.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                CREATING ACCOUNT...
              </>
            ) : (
              "CREATE ACCOUNT"
            )}
          </Button>
        </form>
      </Form>

      {/* Switch to Login */}
      <div className="text-center pt-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
          ALREADY HAVE AN ACCOUNT?{" "}
          <Link
            href="/auth/login"
            className="text-primary hover:text-primary/80 transition-all border-b border-primary/20 pb-0.5 ml-2"
          >
            LOG IN HERE
          </Link>
        </p>
      </div>
    </div>
  );
}
