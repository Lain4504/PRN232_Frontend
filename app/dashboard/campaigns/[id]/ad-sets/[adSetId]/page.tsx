import { AdSetDetails } from '@/components/pages/ad-sets/ad-set-details';

interface AdSetDetailsPageProps {
  params: Promise<{
    id: string;
    adSetId: string;
  }>;
}

export default async function AdSetDetailsPage({ params }: AdSetDetailsPageProps) {
  const { id, adSetId } = await params;
  return <AdSetDetails campaignId={id} adSetId={adSetId} basePath="/dashboard/campaigns" />;
}
