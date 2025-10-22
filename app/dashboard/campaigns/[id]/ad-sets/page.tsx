import { AdSetsManagement } from '@/components/pages/ad-sets/ad-sets-management';

interface AdSetsPageProps {
  params: {
    id: string;
  };
}

export default function AdSetsPage({ params }: AdSetsPageProps) {
  return <AdSetsManagement campaignId={params.id} />;
}
