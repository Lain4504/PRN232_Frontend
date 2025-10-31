import { CreativeDetails } from '@/components/pages/creatives/creative-details';

interface CreativeDetailsPageProps {
  params: Promise<{ teamId: string; id: string; adSetId: string; creativeId: string }>;
}

export default async function TeamCreativeDetailsPage({ params }: CreativeDetailsPageProps) {
  const { teamId, id, adSetId, creativeId } = await params;
  const basePath = `/team/${teamId}/campaigns`;
  
  return (
    <CreativeDetails 
      campaignId={id} 
      adSetId={adSetId} 
      creativeId={creativeId}
      basePath={basePath}
    />
  );
}

