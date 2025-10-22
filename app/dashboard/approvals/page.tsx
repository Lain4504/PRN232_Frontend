import type { Metadata } from "next";
import { SharedApprovalManagement } from "@/components/approvals/shared-approval-management";

export const metadata: Metadata = {
  title: "Approvals Management | AISAM",
  description: "Review and approve content before publishing",
};

export default function ApprovalsPage() {
  return (
    <SharedApprovalManagement 
      context="dashboard"
      title="Content Approvals"
      description="Review and approve content before publishing"
      showCreateButton={true}
    />
  );
}
