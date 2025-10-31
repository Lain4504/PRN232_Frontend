import { CreativesManagement } from '@/components/pages/creatives/creatives-management';

interface CreativesManagementPageProps {
  params: Promise<{ teamId: string; id: string; adSetId: string }>;
}

export default async function TeamCreativesManagementPage({ params }: CreativesManagementPageProps) {
  const { teamId, id, adSetId } = await params;
  const basePath = `/team/${teamId}/campaigns`;
  
  return <CreativesManagement campaignId={id} adSetId={adSetId} basePath={basePath} />;
}

