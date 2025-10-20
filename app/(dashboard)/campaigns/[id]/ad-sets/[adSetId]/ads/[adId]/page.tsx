import React from "react";
import { AdDetails } from "@/components/pages/ads/ad-details";

interface PageProps {
  params: { id: string; adSetId: string; adId: string };
}

export default function AdDetailsPage({ params }: PageProps) {
  const { id: campaignId, adSetId, adId } = params;
  return <AdDetails campaignId={campaignId} adSetId={adSetId} adId={adId} />;
}


