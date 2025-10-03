import type { Metadata } from "next";
import { ReportsManagement } from "@/components/pages/reports/reports-management";

export const metadata: Metadata = {
  title: "Performance Reports | AISAM",
  description: "View detailed analytics and performance reports",
};

export default function ReportsPage() {
  return <ReportsManagement />;
}
