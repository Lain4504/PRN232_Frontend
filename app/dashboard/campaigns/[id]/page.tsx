import type { Metadata } from "next";
import { CampaignDetails } from "@/components/pages/campaigns/campaign-details";

export const metadata: Metadata = {
  title: "Campaign Details | AISAM",
  description: "View and manage campaign details and performance",
};

export default function CampaignDetailsPage() {
  return <CampaignDetails />;
}
