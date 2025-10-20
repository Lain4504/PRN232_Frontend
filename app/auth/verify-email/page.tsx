import type { Metadata } from "next";
import { VerifyEmailStatus } from "@/components/pages/verify-email/verify-email-status";

export const metadata: Metadata = {
  title: "Verify Email | AISAM",
  description: "Verify your email address",
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Email Verification</h1>
          <p className="text-muted-foreground text-lg mt-2">Verify your email address to continue</p>
        </div>
        
        <VerifyEmailStatus />
      </div>
    </div>
  );
}


