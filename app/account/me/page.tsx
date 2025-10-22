import { UserInfoSection } from "@/components/pages/account/user-info-section";
import { ThemeToggleSection } from "@/components/pages/account/theme-toggle-section";

export default function AccountPage() {
  return (
    <div className="flex flex-col items-center min-h-full p-4 sm:p-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="w-full mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Preferences
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and preferences
          </p>
        </div>

        {/* Content Container */}
        <div className="w-full space-y-6">
          {/* Account Information */}
          <UserInfoSection />

          {/* Theme Preference */}
          <ThemeToggleSection />
        </div>
      </div>
    </div>
  );
}
