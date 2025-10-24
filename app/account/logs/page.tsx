import { SessionManagementSection } from "@/components/pages/account/session-management-section";

export default function AuditLogsPage() {
  return (
    <div className="flex flex-col items-center min-h-full p-4 sm:p-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="w-full mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Session Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your active login sessions across devices
          </p>
        </div>

        {/* Content Container */}
        <div className="w-full space-y-6">
          {/* Session Management */}
          <SessionManagementSection />
        </div>
      </div>
    </div>
  );
}