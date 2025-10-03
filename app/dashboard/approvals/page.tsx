import type { Metadata } from "next";
import { ApprovalsManagement } from "@/components/pages/approvals/approvals-management";

export const metadata: Metadata = {
  title: "Approvals Management | AISAM",
  description: "Review and approve content before publishing",
};

export default function ApprovalsPage() {
  return <ApprovalsManagement />;
}
