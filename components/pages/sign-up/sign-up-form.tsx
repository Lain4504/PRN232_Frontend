"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Mail, Lock, AlertCircle, CheckCircle, Loader2, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema, type RegistrationFormData, type AuthError } from "@/lib/types/auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { toast } from "sonner";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<AuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const { register, googleLogin } = useAuth();

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
      setSuccessOpen(true);
    } catch (error: unknown) {
      const authError: AuthError = {
        message: (error as Error).message || "Đã có lỗi xảy ra khi tạo tài khoản.",
      };
      setError(authError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      toast.error('Google OAuth is not configured');
      return;
    }

    setIsGoogleLoading(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window === 'undefined' || !(window as any).google?.accounts?.id) {
      toast.error('Google Sign-In library chưa được tải. Vui lòng tải lại trang.');
      setIsGoogleLoading(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).google.accounts.id.initialize({
      client_id: googleClientId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback: async (response: any) => {
        try {
          await googleLogin(response.credential);
          // Redirect is handled in context
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Đăng nhập Google thất bại";
          toast.error(message);
        } finally {
          setIsGoogleLoading(false);
        }
      },
    });

    const buttonWrapper = document.createElement('div');
    buttonWrapper.id = 'google-signin-trigger';
    buttonWrapper.style.cssText = 'position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0;';
    document.body.appendChild(buttonWrapper);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).google.accounts.id.renderButton(buttonWrapper, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
    });

    setTimeout(() => {
      const googleButton = buttonWrapper.querySelector('div[role="button"]') as HTMLElement;
      if (googleButton) {
        googleButton.click();
      } else {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).google.accounts.id.prompt();
        } catch (err) {
          console.error('Google Sign-In failed:', err);
          setIsGoogleLoading(false);
          toast.error('Không thể khởi tạo Google Sign-In. Vui lòng thử lại.');
        }
      }
    }, 200);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <div className={cn("space-y-8", className)} {...props}>
      {/* Success Modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="rounded-3xl border border-border bg-card shadow-2xl p-10 max-w-md animate-in zoom-in-95 duration-300">
          <DialogHeader className="space-y-6">
            <div className="flex flex-col items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center border border-success/20">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <DialogTitle className="text-2xl font-black text-center text-foreground">Chúc mừng!</DialogTitle>
            </div>
            <DialogDescription className="text-center font-medium text-muted-foreground leading-relaxed">
              Tài khoản của bạn đã được tạo thành công. Vui lòng kiểm tra email để xác thực trước khi đăng nhập.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <Button onClick={() => setSuccessOpen(false)} className="w-full h-12 bg-success hover:bg-success/90 text-success-foreground font-bold rounded-xl transition-all shadow-xl shadow-success/10">
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-12 rounded-xl border-border bg-card hover:bg-accent transition-all font-bold text-foreground/80 shadow-sm"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading || isLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 mr-3 animate-spin" />
          ) : (
            <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Đăng ký với Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-background px-4 text-muted-foreground/50 font-black uppercase tracking-widest">Hoặc đăng ký bằng Email</span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-6">
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Họ và tên</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 h-4 w-4" />
                      <Input
                        {...field}
                        type="text"
                        placeholder="Nguyễn Văn A"
                        className="pl-12 h-12 rounded-xl bg-muted/30 border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-foreground"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 h-4 w-4" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="email@vidu.com"
                        className="pl-12 h-12 rounded-xl bg-muted/30 border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-foreground"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Mật khẩu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 h-4 w-4" />
                      <PasswordInput
                        {...field}
                        placeholder="••••••••••••"
                        className="pl-12 h-12 rounded-xl bg-muted/30 border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-foreground"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 h-4 w-4" />
                      <PasswordInput
                        {...field}
                        placeholder="••••••••••••"
                        className="pl-12 h-12 rounded-xl bg-muted/30 border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-foreground"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />
          </div>

          {error && (
            <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4 fill-destructive text-destructive-foreground" />
              <AlertDescription className="text-xs font-bold">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/10 transition-all active:scale-[0.98]"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                Đang tạo tài khoản...
              </>
            ) : (
              "Tạo tài khoản"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-4">
        <p className="text-sm font-medium text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link
            href="/auth/login"
            className="text-primary font-bold hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
