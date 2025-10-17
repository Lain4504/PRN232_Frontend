import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/pages/forgot-password/forgot-password-form";
import { AuthSplitLayout } from "@/components/pages/auth/auth-split-layout";

export const metadata: Metadata = {
  title: "Forgot password | AISAM",
  description: "Reset your password",
};

export default function Page() {
  return (
    <AuthSplitLayout 
      title="Forgot your password?" 
      subtitle="Don't worry, we'll send you a reset link"
    >
      <ForgotPasswordForm />
    </AuthSplitLayout>
  );
}