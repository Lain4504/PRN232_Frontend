"use client";

import { cn } from "@/lib/utils";
import { api, endpoints } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordResetSchema, type PasswordResetFormData, type AuthError } from "@/lib/types/auth";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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
        throw new Error(response.message || "Failed to send reset link");
      }

      setSuccess(true);
      toast.success("Identity confirmation initiated. Check your link.");
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

  return (
    <div className={cn("space-y-10 font-fira-sans", className)} {...props}>
      {success ? (
        <div className="text-center space-y-10 animate-fade-in">
          <div className="flex flex-col items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 shadow-2xl shadow-emerald-500/20">
              <CheckCircle className="h-12 w-12 text-emerald-500 stroke-[2.5]" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-black uppercase tracking-tighter leading-none">
                Link <span className="text-emerald-500 italic">Dispatched</span>.
              </h3>
              <p className="text-muted-foreground font-medium leading-relaxed max-w-sm mx-auto">
                We have transmitted a secure reset protocol to your email.
                Please verify your inbox to continue the recovery process.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button asChild className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Link href="/auth/login" className="flex items-center justify-center gap-3">
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                RETURN TO LOGIN
              </Link>
            </Button>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">
              Check spam if the transmission is not visible.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
              Account Recovery
            </Badge>
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">
              Reset <br /><span className="text-primary italic">Access</span>.
            </h2>
            <p className="text-muted-foreground font-medium text-sm">
              Enter your registered identity to initiate recovery.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleForgotPassword)} className="space-y-8">
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
                          className="pl-12 h-11 rounded-xl border-border/40 bg-muted/10 group-focus-within:bg-background group-focus-within:border-primary/50 transition-all font-fira-mono text-sm tracking-tight"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold uppercase tracking-widest text-destructive" />
                  </FormItem>
                )}
              />

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
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                    RECOVERY IN PROGRESS...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-3 stroke-[2.5]" />
                    SEND RECOVERY LINK
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Footer Navigation */}
          <div className="text-center pt-2">
            <Link
              href="/auth/login"
              className="text-[10px] font-black text-muted-foreground hover:text-primary transition-all uppercase tracking-[0.2em] inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1 stroke-[3]" />
              BACK TO LOGIN
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
