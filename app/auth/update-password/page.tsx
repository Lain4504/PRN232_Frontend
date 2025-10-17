import { UpdatePasswordForm } from "@/components/pages/update-password/update-password-form";
import { AuthSplitLayout } from "@/components/pages/auth/auth-split-layout";

export default function Page() {
  return (
    <AuthSplitLayout 
      title="Reset password" 
      subtitle="Create a new password to secure your account"
    >
      <UpdatePasswordForm />
    </AuthSplitLayout>
  );
}
