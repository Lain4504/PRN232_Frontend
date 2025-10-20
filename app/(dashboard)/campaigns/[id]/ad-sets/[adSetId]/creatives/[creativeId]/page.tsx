import { CreativeDetails } from '@/components/pages/creatives/creative-details';

interface CreativeDetailsPageProps {
  params: {
    id: string;
    adSetId: string;
    creativeId: string;
  };
}

export default function CreativeDetailsPage({ params }: CreativeDetailsPageProps) {
  return (
    <CreativeDetails 
      campaignId={params.id} 
      adSetId={params.adSetId} 
      creativeId={params.creativeId} 
    />
  );
}
