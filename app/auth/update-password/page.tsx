import { UpdatePasswordForm } from "@/components/pages/update-password/update-password-form";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Reset password</h1>
          <p className="text-muted-foreground text-lg mt-2">Create a new password to secure your account</p>
        </div>
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
