import { CreativesManagement } from '@/components/pages/creatives/creatives-management';

interface CreativesManagementPageProps {
  params: {
    id: string;
    adSetId: string;
  };
}

export default function CreativesManagementPage({ params }: CreativesManagementPageProps) {
  return <CreativesManagement campaignId={params.id} adSetId={params.adSetId} />;
}
