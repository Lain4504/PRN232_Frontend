import { CreativeDetails } from '@/components/pages/creatives/creative-details';

interface CreativeDetailsPageProps {
  params: Promise<{
    id: string;
    adSetId: string;
    creativeId: string;
  }>;
}

export default async function CreativeDetailsPage({ params }: CreativeDetailsPageProps) {
  const { id, adSetId, creativeId } = await params;
  return (
    <CreativeDetails 
      campaignId={id} 
      adSetId={adSetId} 
      creativeId={creativeId}
      basePath="/dashboard/campaigns"
    />
  );
}
