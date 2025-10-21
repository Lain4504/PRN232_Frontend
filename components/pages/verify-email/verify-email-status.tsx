"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Loader2, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type VerificationStatus = 'loading' | 'verified' | 'pending' | 'error' | 'expired';

interface VerifyEmailStatusProps {
  className?: string;
}

export function VerifyEmailStatus({
  className,
  ...props
}: VerifyEmailStatusProps & React.ComponentPropsWithoutRef<"div">) {
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    const supabase = createClient();
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        setStatus('error');
        setError('Failed to check verification status');
        return;
      }

      if (!user) {
        setStatus('error');
        setError('No user found');
        return;
      }

      setUserEmail(user.email || null);

      if (user.email_confirmed_at) {
        setStatus('verified');
      } else {
        setStatus('pending');
      }
    } catch (error) {
      setStatus('error');
      setError('An unexpected error occurred');
    }
  };

  const handleResendVerification = async () => {
    if (!userEmail) return;

    const supabase = createClient();
    setIsResending(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Verification email sent! Please check your inbox.");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to resend verification email";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const renderStatusContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                <Loader2 className="size-8 text-muted-foreground animate-spin" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Checking verification status...</h3>
              <p className="text-muted-foreground">
                Please wait while we verify your email status.
              </p>
            </div>
          </div>
        );

      case 'verified':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle className="size-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Email verified successfully!</h3>
              <p className="text-muted-foreground">
                Your email has been confirmed. You can now access all features of your account.
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full h-10">
                <Link href="/dashboard">
                  Continue to Dashboard
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="w-full h-10">
                <Link href="/auth/login">
                  Back to sign in
                </Link>
              </Button>
            </div>
          </div>
        );

      case 'pending':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="size-16 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                <Mail className="size-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Email verification pending</h3>
              <p className="text-muted-foreground">
                We&apos;ve sent a verification link to <strong>{userEmail}</strong>. 
                Please check your email and click the verification link.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" role="alert" aria-live="polite">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button 
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full h-10"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend verification email
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={checkVerificationStatus}
                className="w-full h-10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check status again
              </Button>
              
              <Button variant="ghost" asChild className="w-full h-10">
                <Link href="/auth/login">
                  Back to sign in
                </Link>
              </Button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertCircle className="size-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Verification failed</h3>
              <p className="text-muted-foreground">
                {error || "There was an error verifying your email. Please try again."}
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={checkVerificationStatus}
                className="w-full h-10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try again
              </Button>
              
              <Button variant="outline" asChild className="w-full h-10">
                <Link href="/auth/login">
                  Back to sign in
                </Link>
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn("space-y-6", className)} {...props}>
      {renderStatusContent()}
    </div>
  );
}
