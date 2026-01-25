import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/pages/update-password/update-password-form";
import { AuthSplitLayout } from "@/components/pages/auth/auth-split-layout";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Update Password | omniadly",
  description: "Update your biometric and security credentials for account access.",
};

export default function Page() {
  return (
    <AuthSplitLayout
      title="Security Protocol"
      subtitle="Complete your password reset sequence below"
    >
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }>
        <UpdatePasswordForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
