import React from "react";
import { AdsManagement } from "@/components/pages/ads/ads-management";

interface PageProps {
  params: Promise<{ teamId: string; id: string; adSetId: string }>;
}

export default async function TeamAdsPage({ params }: PageProps) {
  const { teamId, id: campaignId, adSetId } = await params;
  const basePath = `/team/${teamId}/campaigns`;
  
  return <AdsManagement campaignId={campaignId} adSetId={adSetId} basePath={basePath} />;
}

