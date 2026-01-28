"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
// import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData, type AuthError } from "@/lib/types/auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { toast } from "sonner";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<AuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  // const router = useRouter();
  // const searchParams = useSearchParams();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data);
    } catch (error: unknown) {
      const authError: AuthError = {
        message: (error as Error).message || "Đã có lỗi xảy ra. Vui lòng thử lại.",
      };
      setError(authError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full h-12 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-slate-700 dark:text-slate-300 shadow-sm"
          onClick={handleGoogleLogin}
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
          Tiếp tục với Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-white dark:bg-slate-900 lg:bg-[#FAFAFA] lg:dark:bg-slate-900 px-4 text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Hoặc đăng nhập với Email</span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-600 h-4 w-4" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="email@vidu.com"
                        className="pl-12 h-12 rounded-xl bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium text-slate-900 dark:text-white"
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
                  <div className="flex items-center justify-between px-1">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Mật khẩu</FormLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-bold text-primary hover:text-primary/80 transition-all font-sans tracking-tight"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-600 h-4 w-4" />
                      <PasswordInput
                        {...field}
                        placeholder="••••••••••••"
                        className="pl-12 h-12 rounded-xl bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all text-slate-900 dark:text-white"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />
          </div>

          {error && (
            <Alert variant="destructive" className="rounded-xl border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 fill-rose-600 dark:fill-rose-400 text-white dark:text-slate-950" />
              <AlertDescription className="text-xs font-bold">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white dark:text-white font-bold shadow-xl shadow-slate-200 dark:shadow-primary/10 transition-all active:scale-[0.98]"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              "Đăng nhập"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center pt-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Chưa có tài khoản?{" "}
          <Link
            href="/auth/sign-up"
            className="text-primary font-bold hover:underline"
          >
            Tạo tài khoản mới
          </Link>
        </p>
      </div>
    </div>
  );
}
