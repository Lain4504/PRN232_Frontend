import React from "react";
import { AdsManagement } from "@/components/pages/ads/ads-management";

interface PageProps {
  params: { id: string; adSetId: string };
}

export default function AdsPage({ params }: PageProps) {
  const { id: campaignId, adSetId } = params;
  return <AdsManagement campaignId={campaignId} adSetId={adSetId} />;
}


