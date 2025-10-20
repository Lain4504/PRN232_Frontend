export interface AdCreativeResponse {
  id: string;
  adSetId: string;
  name: string;
  type: CreativeType;
  content?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metrics?: AdCreativeMetrics;
  usage?: CreativeUsage;
}

export interface AdCreativeMetrics {
  impressions: number;
  clicks: number;
  engagement: number;
  ctr: number;
  performance: number;
}

export interface CreativeUsage {
  adSetId: string;
  adSetName: string;
  campaignId: string;
  campaignName: string;
  isActive: boolean;
}

export type CreativeType = 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'TEXT' | 'GIF' | 'STORY';

export interface CreateAdCreativeRequest {
  adSetId: string;
  name: string;
  type: CreativeType;
  content?: string;
  mediaFile?: File;
  tags?: string[];
}

export interface UpdateAdCreativeRequest extends Partial<CreateAdCreativeRequest> {
  id: string;
}

export interface CreativeFilters {
  adSetId?: string;
  type?: CreativeType;
  tags?: string[];
  isActive?: boolean;
}

export interface CreativeListParams {
  adSetId: string;
  page?: number;
  pageSize?: number;
  search?: string;
  type?: CreativeType;
  tags?: string[];
  sortBy?: 'name' | 'type' | 'createdAt' | 'performance';
  sortOrder?: 'asc' | 'desc';
}

// Creative type options
export const CREATIVE_TYPES = [
  { value: 'IMAGE', label: 'Image', description: 'Static images (JPG, PNG, WebP)' },
  { value: 'VIDEO', label: 'Video', description: 'Video files (MP4, MOV)' },
  { value: 'CAROUSEL', label: 'Carousel', description: 'Multiple images/videos in sequence' },
  { value: 'TEXT', label: 'Text', description: 'Text-only creatives with formatting' },
  { value: 'GIF', label: 'GIF', description: 'Animated GIFs' },
  { value: 'STORY', label: 'Story', description: 'Vertical format for stories' }
] as const;

// File size limits by type
export const CREATIVE_FILE_LIMITS = {
  IMAGE: { maxSize: 30 * 1024 * 1024, formats: ['jpg', 'jpeg', 'png', 'webp'] }, // 30MB
  VIDEO: { maxSize: 4 * 1024 * 1024 * 1024, formats: ['mp4', 'mov'] }, // 4GB
  GIF: { maxSize: 10 * 1024 * 1024, formats: ['gif'] }, // 10MB
  CAROUSEL: { maxSize: 30 * 1024 * 1024, formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'] },
  STORY: { maxSize: 30 * 1024 * 1024, formats: ['jpg', 'jpeg', 'png', 'webp'] }
} as const;

// Recommended dimensions by type
export const CREATIVE_DIMENSIONS = {
  IMAGE: { width: 1200, height: 628, aspectRatio: '1.91:1' },
  VIDEO: { width: 1280, height: 720, aspectRatio: '16:9' },
  GIF: { width: 1080, height: 1080, aspectRatio: '1:1' },
  STORY: { width: 1080, height: 1920, aspectRatio: '9:16' },
  CAROUSEL: { width: 1080, height: 1080, aspectRatio: '1:1' }
} as const;

// Creative status helper
export const getCreativeStatus = (creative: AdCreativeResponse): 'active' | 'paused' => {
  return creative.isActive ? 'active' : 'paused';
};

// Creative status colors
export const getCreativeStatusColor = (status: 'active' | 'paused') => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'paused':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

// Creative type colors
export const getCreativeTypeColor = (type: CreativeType) => {
  switch (type) {
    case 'IMAGE':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'VIDEO':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'CAROUSEL':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'TEXT':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    case 'GIF':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
    case 'STORY':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

// Common creative tags
export const COMMON_CREATIVE_TAGS = [
  'Hero',
  'Product',
  'Lifestyle',
  'Testimonial',
  'Before/After',
  'Tutorial',
  'Behind the Scenes',
  'User Generated',
  'Seasonal',
  'Promotional',
  'Educational',
  'Entertainment',
  'Inspirational',
  'Comparison',
  'Demo'
] as const;

// Social media platform contexts for preview
export const SOCIAL_PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: 'facebook' },
  { value: 'instagram', label: 'Instagram', icon: 'instagram' },
  { value: 'twitter', label: 'Twitter', icon: 'twitter' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
  { value: 'tiktok', label: 'TikTok', icon: 'tiktok' }
] as const;
