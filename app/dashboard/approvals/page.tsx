import type { Metadata } from "next";
import { SharedApprovalManagement } from "@/components/approvals/shared-approval-management";

export const metadata: Metadata = {
  title: "Approvals Management | omniadly",
  description: "Review and approve content before publishing",
};

export default function ApprovalsPage() {
  return (
    <SharedApprovalManagement
      context="dashboard"
      showCreateButton={true}
    />
  );
}
