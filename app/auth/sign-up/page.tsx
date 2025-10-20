import type { Metadata } from "next";
import { SignUpForm } from "@/components/pages/sign-up/sign-up-form";
import { AuthSplitLayout } from "@/components/pages/auth/auth-split-layout";

export const metadata: Metadata = {
  title: "Sign up | AISAM",
  description: "Create a new AISAM account",
};

export default function Page() {
  return (
    <AuthSplitLayout title="Create a new account" subtitle="Get started for free today">
      <SignUpForm />
    </AuthSplitLayout>
  );
}
