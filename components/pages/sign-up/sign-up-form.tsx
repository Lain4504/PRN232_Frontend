"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema, type RegistrationFormData, type AuthError } from "@/lib/types/auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

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
    <div className={cn("grid gap-6", className)} {...props}>
      {/* Success Modal */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <DialogTitle className="text-center">Chúc mừng!</DialogTitle>
            <DialogDescription className="text-center">
              Tài khoản của bạn đã được tạo thành công. Vui lòng kiểm tra email để xác thực trước khi đăng nhập.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setSuccessOpen(false)} className="w-full">
              Đã hiểu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4">
        <Button
          variant="outline"
          onClick={handleGoogleSignUp}
          disabled={isGoogleLoading || isLoading}
          className="w-full"
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          Đăng ký với Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Hoặc đăng ký bằng Email
          </span>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignUp)} className="grid gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nguyễn Văn A" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="email@vidu.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu</FormLabel>
                <FormControl>
                  <PasswordInput {...field} placeholder="••••••••••••" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xác nhận mật khẩu</FormLabel>
                <FormControl>
                  <PasswordInput {...field} placeholder="••••••••••••" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo tài khoản...
              </>
            ) : (
              "Tạo tài khoản"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        Đã có tài khoản?{" "}
        <Link href="/auth/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
