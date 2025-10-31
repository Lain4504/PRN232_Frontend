import React from "react";
import { AdDetails } from "@/components/pages/ads/ad-details";

interface PageProps {
  params: Promise<{ teamId: string; id: string; adSetId: string; adId: string }>;
}

export default async function TeamAdDetailsPage({ params }: PageProps) {
  const { teamId, id: campaignId, adSetId, adId } = await params;
  const basePath = `/team/${teamId}/campaigns`;
  
  return <AdDetails campaignId={campaignId} adSetId={adSetId} adId={adId} basePath={basePath} />;
}

