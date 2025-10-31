import type { Metadata } from "next";
import { CampaignsManagement } from "@/components/pages/campaigns/campaigns-management";

export const metadata: Metadata = {
  title: "Team Campaigns | AISAM",
  description: "Manage your team advertising campaigns and track performance",
};

interface CampaignsPageProps {
  params: Promise<{ teamId: string }>;
}

export default async function TeamCampaignsPage({ params }: CampaignsPageProps) {
  const { teamId } = await params;
  const basePath = `/team/${teamId}/campaigns`;
  
  return <CampaignsManagement basePath={basePath} />;
}

