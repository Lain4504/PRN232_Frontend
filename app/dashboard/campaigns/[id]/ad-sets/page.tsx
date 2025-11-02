import { AdSetsManagement } from '@/components/pages/ad-sets/ad-sets-management';

interface AdSetsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdSetsPage({ params }: AdSetsPageProps) {
  const { id } = await params;
  return <AdSetsManagement campaignId={id} basePath="/dashboard/campaigns" />;
}
