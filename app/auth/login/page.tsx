import type { Metadata } from "next";
import { LoginForm } from "@/components/pages/login/login-form";
import { AuthSplitLayout } from "@/components/pages/auth/auth-split-layout";

export const metadata: Metadata = {
  title: "Sign in | AISAM",
  description: "Sign in to your AISAM account",
};

export default function Page() {
  return (
    <AuthSplitLayout title="Welcome back" subtitle="Sign in to your account">
      <LoginForm />
    </AuthSplitLayout>
  );
}
