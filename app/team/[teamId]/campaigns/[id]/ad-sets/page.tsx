import { AdSetsManagement } from '@/components/pages/ad-sets/ad-sets-management';

interface AdSetsPageProps {
  params: Promise<{ teamId: string; id: string }>;
}

export default async function TeamAdSetsPage({ params }: AdSetsPageProps) {
  const { teamId, id } = await params;
  const basePath = `/team/${teamId}/campaigns`;
  
  return <AdSetsManagement campaignId={id} basePath={basePath} />;
}

