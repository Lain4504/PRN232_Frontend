import { AdSetDetails } from '@/components/pages/ad-sets/ad-set-details';

interface AdSetDetailsPageProps {
  params: Promise<{ teamId: string; id: string; adSetId: string }>;
}

export default async function TeamAdSetDetailsPage({ params }: AdSetDetailsPageProps) {
  const { teamId, id, adSetId } = await params;
  const basePath = `/team/${teamId}/campaigns`;
  
  return <AdSetDetails campaignId={id} adSetId={adSetId} basePath={basePath} />;
}

