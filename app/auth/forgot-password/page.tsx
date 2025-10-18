import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/pages/forgot-password/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password | AISAM",
  description: "Reset your password",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Forgot your password?</h1>
          <p className="text-muted-foreground text-lg mt-2">Don&apos;t worry, we will send you a reset link</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}