import type { Metadata } from "next";
import { CampaignsManagement } from "@/components/pages/campaigns/campaigns-management";

export const metadata: Metadata = {
  title: "Campaigns Management | AISAM",
  description: "Manage your advertising campaigns and track performance",
};

export default function CampaignsPage() {
  return <CampaignsManagement />;
}
