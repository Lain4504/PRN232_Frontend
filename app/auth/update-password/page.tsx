import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/pages/update-password/update-password-form";
import { AuthSplitLayout } from "@/components/pages/auth/auth-split-layout";

export const metadata: Metadata = {
  title: "Update Password | AISAM",
  description: "Update your biometric and security credentials for account access.",
};

export default function Page() {
  return (
    <AuthSplitLayout
      title="Security Protocol"
      subtitle="Complete your password reset sequence below"
    >
      <UpdatePasswordForm />
    </AuthSplitLayout>
  );
}
