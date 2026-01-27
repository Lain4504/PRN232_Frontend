"use client";

import { cn } from "@/lib/utils";
import { api, endpoints } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordResetSchema, type PasswordResetFormData, type AuthError } from "@/lib/types/auth";
import { toast } from "sonner";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<AuthError | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleForgotPassword = async (data: PasswordResetFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post(endpoints.forgotPassword, { email: data.email }, { requireAuth: false });

      if (!response.success) {
        throw new Error(response.message || "Không thể gửi email khôi phục");
      }

      setSuccess(true);
      toast.success("Email khôi phục đã được gửi");
    } catch (error: unknown) {
      const authError: AuthError = {
        message: error instanceof Error ? error.message : "Đã có lỗi xảy ra. Vui lòng thử lại.",
      };
      setError(authError);
      toast.error(authError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-8", className)} {...props}>
      {success ? (
        <div className="text-center space-y-10 animate-in fade-in zoom-in duration-500">
          <div className="flex flex-col items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-xl shadow-emerald-50">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                Email đã được gửi!
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email của bạn. Vui lòng kiểm tra hộp thư đến.
              </p>
            </div>
          </div>

          <Button asChild className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xl shadow-slate-100">
            <Link href="/auth/login" className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Quay lại đăng nhập
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleForgotPassword)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500 px-1">Email của bạn</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="email@vidu.com"
                          className="pl-12 h-12 rounded-xl border-slate-100 bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant="destructive" className="rounded-xl border-rose-100 bg-rose-50 text-rose-600">
                  <AlertCircle className="h-4 w-4 fill-rose-600 text-white" />
                  <AlertDescription className="text-xs font-bold">{error.message}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    Đang gửi email...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-3" />
                    Gửi hướng dẫn khôi phục
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-xs font-bold text-slate-400 hover:text-primary transition-all inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
