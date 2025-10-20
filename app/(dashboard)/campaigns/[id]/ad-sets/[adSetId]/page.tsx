import { AdSetDetails } from '@/components/pages/ad-sets/ad-set-details';

interface AdSetDetailsPageProps {
  params: {
    id: string;
    adSetId: string;
  };
}

export default function AdSetDetailsPage({ params }: AdSetDetailsPageProps) {
  return <AdSetDetails campaignId={params.id} adSetId={params.adSetId} />;
}
