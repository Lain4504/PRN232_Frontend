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
import { useTranslation } from "react-i18next";


export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<AuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const { register } = useAuth();
  const { t } = useTranslation("auth");


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
    <div className={cn("space-y-8", className)} {...props}>
      {/* Success Modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="rounded-xl border shadow-xl p-10 max-w-md">
          <DialogHeader className="space-y-6">
            <div className="flex flex-col items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <DialogTitle className="text-2xl font-bold text-center">{t('registrationSuccessful')}</DialogTitle>
            </div>
            <DialogDescription className="text-center font-medium text-muted-foreground leading-relaxed">
              {t('registrationSuccessMessage')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={() => setSuccessOpen(false)} className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-all shadow-sm">
              {t('dismiss')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Login */}
      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-11 rounded-lg border-border/60 bg-background hover:bg-muted/50 transition-all font-semibold"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {t('continueWithGoogle')}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-4 text-muted-foreground font-medium">{t('orContinueWithEmail')}</span>
          </div>
        </div>
      </div>

      {/* SignUp Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-6">
          <div className="space-y-4">
            {/* Full Name Field */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">{t('fullName')}</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="John Doe"
                        className="pl-10 h-11 rounded-lg bg-background border-border/60 focus:border-primary/50 transition-all"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">{t('email')}</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 h-11 rounded-lg bg-background border-border/60 focus:border-primary/50 transition-all"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">{t('password')}</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <PasswordInput
                        {...field}
                        placeholder="••••••••••••"
                        className="pl-10 h-11 rounded-lg bg-background border-border/60 focus:border-primary/50 transition-all font-mono"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                  <p className="text-[10px] text-muted-foreground font-medium px-1">
                    {t('passwordHint')}
                  </p>
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">{t('confirmPassword')}</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <PasswordInput
                        {...field}
                        placeholder="••••••••••••"
                        className="pl-10 h-11 rounded-lg bg-background border-border/60 focus:border-primary/50 transition-all font-mono"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="rounded-lg py-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-medium">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm shadow-primary/20 transition-all active:scale-[0.98]"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('creatingAccount')}
              </>
            ) : (
              t('createAccount')
            )}
          </Button>
        </form>
      </Form>

      {/* Footer Navigation */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t('alreadyHaveAccount')}{" "}
          <Link
            href="/auth/login"
            className="text-primary font-semibold hover:underline"
          >
            {t('logIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
