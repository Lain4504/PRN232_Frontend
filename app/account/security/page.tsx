import { PasswordChangeSection } from "@/components/pages/account/password-change-section";

export default function SecurityPage() {
  return (
    <div className="flex flex-col items-center min-h-full p-4 sm:p-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="w-full mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Security Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account security and password settings
          </p>
        </div>

        {/* Content Container */}
        <div className="w-full space-y-6">
          {/* Password Change */}
          <PasswordChangeSection />
        </div>
      </div>
    </div>
  );
}