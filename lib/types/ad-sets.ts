export interface AdSetResponse {
  id: string;
  campaignId: string;
  name: string;
  targeting: TargetingConfig;
  budget: number;
  schedule?: AdSetSchedule;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metrics?: AdSetMetrics;
  ads?: AdResponse[];
}

export interface AdSetMetrics {
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  activeAds: number;
  pausedAds: number;
}

export interface TargetingConfig {
  demographics?: DemographicsTargeting;
  interests?: string[];
  behaviors?: string[];
  locations?: LocationTargeting[];
  ageRange?: AgeRange;
  gender?: GenderTargeting;
  customAudiences?: string[];
  lookalikeAudiences?: string[];
}

export interface DemographicsTargeting {
  education?: string[];
  relationshipStatus?: string[];
  workEmployers?: string[];
  workPositions?: string[];
}

export interface LocationTargeting {
  country?: string;
  region?: string;
  city?: string;
  radius?: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AgeRange {
  min: number;
  max: number;
}

export interface GenderTargeting {
  male?: boolean;
  female?: boolean;
}

export interface AdSetSchedule {
  startDate?: string;
  endDate?: string;
  timezone?: string;
}

export interface AdResponse {
  id: string;
  name: string;
  status: string;
  // Add other ad properties as needed
}

export interface CreateAdSetRequest {
  campaignId: string;
  name: string;
  targeting: TargetingConfig;
  budget: number;
  schedule?: AdSetSchedule;
}

export interface UpdateAdSetRequest extends Partial<CreateAdSetRequest> {
  id: string;
}

export interface AdSetFilters {
  campaignId?: string;
  status?: 'active' | 'paused' | 'completed';
  budgetRange?: {
    min?: number;
    max?: number;
  };
}

export interface AdSetListParams {
  campaignId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sortBy?: 'name' | 'budget' | 'createdAt' | 'performance';
  sortOrder?: 'asc' | 'desc';
}

// Ad set status helper
export const getAdSetStatus = (adSet: AdSetResponse): 'active' | 'paused' | 'completed' => {
  if (!adSet.isActive) return 'paused';
  
  const now = new Date();
  const endDate = adSet.schedule?.endDate ? new Date(adSet.schedule.endDate) : null;
  
  if (endDate && endDate < now) return 'completed';
  
  return 'active';
};

// Ad set status colors
export const getAdSetStatusColor = (status: 'active' | 'paused' | 'completed') => {
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

// Targeting interest options
export const TARGETING_INTERESTS = [
  'Business',
  'Entertainment',
  'Fitness',
  'Technology',
  'Travel',
  'Food & Drink',
  'Sports',
  'Music',
  'Movies',
  'Books',
  'Gaming',
  'Fashion',
  'Beauty',
  'Health',
  'Education',
  'Finance',
  'Real Estate',
  'Automotive',
  'Home & Garden',
  'Pets',
  'Family',
  'Relationships',
  'News',
  'Politics',
  'Religion',
  'Science',
  'Art',
  'Photography',
  'Cooking',
  'Outdoor Activities'
] as const;

// Demographics options
export const EDUCATION_LEVELS = [
  'High School',
  'Some College',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'Doctorate',
  'Professional Degree'
] as const;

export const RELATIONSHIP_STATUS = [
  'Single',
  'In a Relationship',
  'Married',
  'Divorced',
  'Widowed',
  'Separated'
] as const;

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' }
] as const;
