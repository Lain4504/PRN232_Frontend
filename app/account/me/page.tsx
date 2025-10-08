import { ProfileInformationForm } from "@/components/pages/account/profile-information-form";
import { AppearanceSection } from "@/components/pages/account/appearance-section";

export default function AccountPage() {
  return (
    <div className="flex flex-col items-center min-h-full p-4 sm:p-6">
      {/* Header */}
      <div className="w-full max-w-2xl mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Preferences
        </h1>
      </div>

      {/* Content Container */}
      <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
        {/* Profile Information Form */}
        <ProfileInformationForm />

        {/* Appearance Section */}
        <AppearanceSection />
      </div>
    </div>
  );
}
