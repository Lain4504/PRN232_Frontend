"use client";

import { cn } from "@/lib/utils";
import { api, endpoints } from "@/lib/api";
import { useAuth } from "@/lib/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle, AlertCircle, Loader2, Mail, RefreshCw, ArrowLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

type VerificationStatus = 'loading' | 'verified' | 'pending' | 'error' | 'expired';

interface VerifyEmailStatusProps {
  className?: string;
}

export function VerifyEmailStatus({
  className,
  ...props
}: VerifyEmailStatusProps & React.ComponentPropsWithoutRef<"div">) {
  const { t } = useTranslation("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const { user, refreshSession } = useAuth();
  const hasVerifiedRef = useRef(false);

  const handleVerifyWithToken = useCallback(async (tokenValue: string) => {
    if (hasVerifiedRef.current) return;
    hasVerifiedRef.current = true;

    setStatus('loading');
    try {
      const response = await api.get(endpoints.verifyEmail(tokenValue), { requireAuth: false });
      if (response.success) {
        setStatus('verified');
        toast.success(t("emailVerified"));
        // Force refresh session to update verified status
        await refreshSession();
      } else {
        setStatus('error');
        setError(response.message || t("authErrorMessage"));
        // Reset ref on failure so user can retry if it was a temporary issue
        hasVerifiedRef.current = false;
      }
    } catch (err: any) {
      setStatus('error');
      setError(err.message || t("authErrorMessage"));
      hasVerifiedRef.current = false;
    }
  }, [refreshSession, t]);

  const checkVerificationStatus = useCallback(async () => {
    if (token) {
      if (status !== 'verified' && status !== 'loading') {
        await handleVerifyWithToken(token);
      }
      return;
    }

    if (!user) {
      // Allow some time for initial load
      const timer = setTimeout(() => {
        if (!user && !token) {
          setStatus('error');
          setError(t("authErrorMessage"));
        }
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (user.isEmailVerified) {
      setStatus('verified');
    } else {
      setStatus('pending');
      // Try to refresh session once to check if verified recently
      await refreshSession();
    }
  }, [user, refreshSession, t, token, handleVerifyWithToken, status]);

  useEffect(() => {
    checkVerificationStatus();
  }, [checkVerificationStatus]);

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsResending(true);
    setError(null);

    try {
      const response = await api.post(endpoints.resendVerification, {
        email: user.email
      });

      if (!response.success && response.statusCode !== 200) {
        throw new Error(response.message || 'Failed to resend verification');
      }

      toast.success(t("recoveryEmailSent"));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t("authErrorMessage");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResending(true);
    }
  };

  const renderStatusCard = (icon: React.ReactNode, title: React.ReactNode, description: string, children?: React.ReactNode, badgeText: string = "Identity Status") => (
    <div className="space-y-10 animate-fade-in">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
          {badgeText}
        </Badge>
        <div className="flex flex-col items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center border border-border/40 shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            {icon}
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-foreground">
              {title}
            </h2>
            <p className="text-muted-foreground font-medium text-sm max-w-sm mx-auto leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4 pt-4">
        {children}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return renderStatusCard(
          <Loader2 className="h-12 w-12 text-primary animate-spin" />,
          t('verifyingEmail'),
          "Syncing connection with security grid...",
          null,
          "Encryption Engine"
        );

      case 'verified':
        return renderStatusCard(
          <CheckCircle className="h-12 w-12 text-emerald-500 stroke-[2.5]" />,
          t('emailVerified'),
          t('emailVerifiedMessage'),
          <div className="space-y-4">
            <Button asChild className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Link href="/dashboard">
                {t('proceedToLogin')}
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary transition-all">
              <Link href="/auth/login" className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                {t('backToLogin')}
              </Link>
            </Button>
          </div>,
          "Authorization Verified"
        );

      case 'pending':
        return renderStatusCard(
          <Mail className="h-12 w-12 text-amber-500 stroke-[2.5]" />,
          t('verifyEmail'),
          t('registrationSuccessMessage'),
          <div className="space-y-4">
            <Button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                  {t('sendingEmail')}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-3 stroke-[2.5]" />
                  {t('sendRecoveryEmail')}
                </>
              )}
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={checkVerificationStatus}
                className="h-12 rounded-xl bg-muted/10 border-border/40 font-black text-[9px] uppercase tracking-widest hover:border-primary/50 transition-all text-foreground"
              >
                REFRESH
              </Button>
              <Button variant="ghost" asChild className="h-12 font-black text-[9px] uppercase tracking-widest text-muted-foreground/60">
                <Link href="/auth/login">{t('backToLogin')}</Link>
              </Button>
            </div>
          </div>,
          "Identity Pending"
        );

      case 'error':
        return renderStatusCard(
          <AlertCircle className="h-12 w-12 text-rose-500 stroke-[2.5]" />,
          t('authError'),
          error || t('authErrorMessage'),
          <div className="space-y-4">
            <Button
              onClick={checkVerificationStatus}
              className="w-full h-11 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className="w-4 h-4 mr-3 stroke-[2.5]" />
              {t('tryAgain')}
            </Button>
            <Button variant="ghost" asChild className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-rose-500 transition-all">
              <Link href="/auth/login" className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                {t('backToLogin')}
              </Link>
            </Button>
          </div>,
          "Security Breach"
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-6 font-fira-sans", className)} {...props}>
      <div className="bg-card/40 border border-border/40 rounded-2xl p-8 sm:p-12 shadow-2xl relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
          <Shield className="h-32 w-32 text-primary" />
        </div>
        <div className="relative z-10">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
