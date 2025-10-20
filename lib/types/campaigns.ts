export interface AdCampaignResponse {
  id: string;
  userId: string;
  brandId: string;
  adAccountId: string;
  facebookCampaignId?: string;
  name: string;
  objective?: string;
  budget?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metrics?: AdCampaignMetrics;
  adSets: AdSetResponse[];
}

export interface AdCampaignMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  ctr: number;
  activeAds: number;
  pausedAds: number;
}

export interface AdSetResponse {
  id: string;
  name: string;
  // Add other ad set properties as needed
}

export interface CreateAdCampaignRequest {
  brandId: string;
  adAccountId: string;
  name: string;
  objective: string;
  budget: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateAdCampaignRequest extends Partial<CreateAdCampaignRequest> {
  id: string;
}

export interface CampaignFilters {
  brandId?: string;
  status?: 'active' | 'paused' | 'completed';
  objective?: string;
}

export interface CampaignListParams {
  page?: number;
  pageSize?: number;
  brandId?: string;
  search?: string;
  status?: string;
  objective?: string;
}

// Campaign objective options
export const CAMPAIGN_OBJECTIVES = [
  'VIDEO_VIEWS',
  'TRAFFIC',
  'CONVERSIONS',
  'LEAD_GENERATION',
  'BRAND_AWARENESS',
  'REACH',
  'ENGAGEMENT',
  'APP_INSTALLS',
  'CATALOG_SALES',
  'STORE_TRAFFIC',
  'MESSAGES',
  'EVENT_RESPONSES'
] as const;

export type CampaignObjective = typeof CAMPAIGN_OBJECTIVES[number];

// Campaign status helper
export const getCampaignStatus = (campaign: AdCampaignResponse): 'active' | 'paused' | 'completed' => {
  if (!campaign.isActive) return 'paused';
  
  const now = new Date();
  const endDate = campaign.endDate ? new Date(campaign.endDate) : null;
  
  if (endDate && endDate < now) return 'completed';
  
  return 'active';
};

// Campaign status colors
export const getCampaignStatusColor = (status: 'active' | 'paused' | 'completed') => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'completed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};
