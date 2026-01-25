"use client";

import { cn } from "@/lib/utils";
import { api, endpoints } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Lock, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { t } = useTranslation("auth");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError(t("authError"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post(endpoints.resetPassword, {
        token,
        newPassword: password
      }, { requireAuth: false });

      if (!response.success) {
        throw new Error(response.message || "Failed to update password");
      }

      toast.success(t("passwordUpdated"));
      router.push("/auth/login");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t("authError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-10 font-fira-sans animate-fade-in", className)} {...props}>
      <form onSubmit={handleUpdatePassword} className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 italic">
              {t('newPassword')}
            </Label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 h-4 w-4 group-focus-within:text-primary transition-colors" />
              <PasswordInput
                id="password"
                placeholder="••••••••••••"
                className="pl-12 h-11 rounded-xl border-border/40 bg-muted/10 group-focus-within:bg-background group-focus-within:border-primary/50 transition-all font-fira-mono text-sm tracking-tight"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none px-1">
              {t('passwordHint')}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-destructive leading-tight">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-12 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-3 animate-spin" />
              {t('updatingPassword')}
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 mr-3 stroke-[2.5]" />
              {t('updatePasswordButton')}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
