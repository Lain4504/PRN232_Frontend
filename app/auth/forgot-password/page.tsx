import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/pages/forgot-password/forgot-password-form";
import { AuthSplitLayout } from "@/components/pages/auth/auth-split-layout";

export const metadata: Metadata = {
  title: "Recover Account | AISAM",
  description: "Initiate account recovery protocol for your AISAM profile.",
};

export default function Page() {
  return (
    <AuthSplitLayout
      title="Recover Access"
      subtitle="Enter your identity to receive recovery instructions"
    >
      <ForgotPasswordForm />
    </AuthSplitLayout>
  );
}