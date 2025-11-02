import { CreativesManagement } from '@/components/pages/creatives/creatives-management';

interface CreativesManagementPageProps {
  params: Promise<{
    id: string;
    adSetId: string;
  }>;
}

export default async function CreativesManagementPage({ params }: CreativesManagementPageProps) {
  const { id, adSetId } = await params;
  return <CreativesManagement campaignId={id} adSetId={adSetId} basePath="/dashboard/campaigns" />;
}
