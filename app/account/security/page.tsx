import type { Metadata } from "next";
import { SecuritySection } from "@/components/pages/account/security-section";

export const metadata: Metadata = {
  title: "Security Settings",
  description: "Manage your security settings and password",
};

export default function SecurityPage() {
  return (
    <div className="flex flex-col items-center min-h-full p-4 sm:p-6">
      {/* Header */}
      <div className="w-full max-w-2xl mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Security Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your password and security preferences
        </p>
      </div>

      {/* Content Container */}
      <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
        {/* Security Section */}
        <SecuritySection />
      </div>
    </div>
  );
}
