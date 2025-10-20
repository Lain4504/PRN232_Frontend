import type { Metadata } from "next";
import { AuditLogsSection } from "@/components/pages/account/audit-logs-section";

export const metadata: Metadata = {
  title: "Audit Logs",
  description: "View your account activity and audit logs",
};

export default function LogsPage() {
  return (
    <div className="flex flex-col items-center min-h-full p-4 sm:p-6">
      {/* Header */}
      <div className="w-full max-w-2xl mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Audit Logs
        </h1>
        <p className="text-muted-foreground mt-2">
          View your account activity and security events
        </p>
      </div>

      {/* Content Container */}
      <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
        {/* Audit Logs Section */}
        <AuditLogsSection />
      </div>
    </div>
  );
}