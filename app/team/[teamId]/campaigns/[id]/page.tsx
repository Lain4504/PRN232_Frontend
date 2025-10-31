import type { Metadata } from "next";
import { CampaignDetails } from "@/components/pages/campaigns/campaign-details";

export const metadata: Metadata = {
  title: "Campaign Details | AISAM",
  description: "View and manage campaign details and performance",
};

interface CampaignDetailsPageProps {
  params: Promise<{ teamId: string; id: string }>;
}

export default async function TeamCampaignDetailsPage({ params }: CampaignDetailsPageProps) {
  const { teamId } = await params;
  const basePath = `/team/${teamId}/campaigns`;
  
  return <CampaignDetails basePath={basePath} />;
}

