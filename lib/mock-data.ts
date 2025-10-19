// Mock Data for AISAM Frontend
// This file contains sample data for development and testing

import { 
  User, 
  Profile, 
  Brand, 
  Content,
  SocialAccount, 
  SocialIntegration, 
  Approval, 
  ScheduledPost, 
  Post, 
  PerformanceMetrics,
  DashboardStats,
  RecentActivity,
  CalendarEvent,
  ChartData,
  PerformanceReport
} from './types/aisam-types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+1234567890',
    role: 'user',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'user-2',
    email: 'jane.smith@example.com',
    first_name: 'Jane',
    last_name: 'Smith',
    phone: '+1234567891',
    role: 'user',
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z'
  }
];

// Mock Profiles
export const mockProfiles: Profile[] = [
  {
    id: 'profile-1',
    user_id: 'user-1',
    profile_type: 'business',
    company_name: 'TechCorp Solutions',
    bio: 'Leading technology solutions provider specializing in AI and automation.',
    avatar_url: '/avatars/profile-1.jpg',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'profile-2',
    user_id: 'user-2',
    profile_type: 'personal',
    bio: 'Digital marketing specialist and content creator.',
    avatar_url: '/avatars/profile-2.jpg',
    created_at: '2024-01-16T10:30:00Z',
    updated_at: '2024-01-16T10:30:00Z'
  }
];

// Mock Brands
export const mockBrands: Brand[] = [
  {
    id: 'brand-1',
    profile_id: 'profile-1',
    name: 'TechCorp AI',
    description: 'AI-powered business solutions for modern enterprises',
    logo_url: '/logos/techcorp-ai.png',
    slogan: 'Intelligence Meets Innovation',
    usp: 'Cutting-edge AI technology that transforms business operations',
    target_audience: 'Enterprise businesses, CTOs, IT decision makers',
    created_at: '2024-01-15T11:00:00Z',
    updated_at: '2024-01-15T11:00:00Z'
  },
  {
    id: 'brand-2',
    profile_id: 'profile-1',
    name: 'EcoFriendly Products',
    description: 'Sustainable and eco-friendly consumer products',
    logo_url: '/logos/ecofriendly.png',
    slogan: 'Green Living, Better Future',
    usp: '100% sustainable materials with zero environmental impact',
    target_audience: 'Environmentally conscious consumers, millennials, Gen Z',
    created_at: '2024-01-15T12:00:00Z',
    updated_at: '2024-01-15T12:00:00Z'
  },
  {
    id: 'brand-3',
    profile_id: 'profile-2',
    name: 'Creative Studio',
    description: 'Digital marketing and creative design services',
    logo_url: '/logos/creative-studio.png',
    slogan: 'Where Ideas Come to Life',
    usp: 'Award-winning creative team with 10+ years experience',
    target_audience: 'Small to medium businesses, startups, entrepreneurs',
    created_at: '2024-01-16T11:00:00Z',
    updated_at: '2024-01-16T11:00:00Z'
  }
];


// Mock Contents
export const mockContents: Content[] = [
  {
    id: 'content-1',
    brand_id: 'brand-1',
    product_id: 'product-1',
    ad_type: 'image_text',
    title: 'Transform Your Business with AI Analytics',
    text_content: 'Discover how our AI Analytics Platform can revolutionize your business intelligence. Get real-time insights, predictive analytics, and automated reporting.',
    style_context_character: 'Professional, authoritative, data-driven tone. Focus on ROI and business transformation.',
    image_url: '/content/ai-analytics-ad.jpg',
    status: 'approved',
    created_at: '2024-01-15T14:00:00Z',
    updated_at: '2024-01-15T14:00:00Z'
  },
  {
    id: 'content-2',
    brand_id: 'brand-1',
    product_id: 'product-2',
    ad_type: 'video_text',
    title: 'Automate Your Workflow Today',
    text_content: 'See how Smart Automation Suite can streamline your business processes and save you hours every day.',
    style_context_character: 'Energetic, solution-focused, efficiency-oriented.',
    video_url: '/content/automation-demo.mp4',
    status: 'draft',
    created_at: '2024-01-15T15:00:00Z',
    updated_at: '2024-01-15T15:00:00Z'
  },
  {
    id: 'content-3',
    brand_id: 'brand-2',
    product_id: 'product-3',
    ad_type: 'image_text',
    title: 'Protect Your Phone, Protect the Planet',
    text_content: 'Our sustainable bamboo phone case combines style, protection, and environmental responsibility.',
    style_context_character: 'Eco-conscious, lifestyle-focused, aspirational.',
    image_url: '/content/bamboo-case-ad.jpg',
    status: 'pending_approval',
    created_at: '2024-01-15T16:00:00Z',
    updated_at: '2024-01-15T16:00:00Z'
  },
  {
    id: 'content-4',
    brand_id: 'brand-3',
    ad_type: 'text_only',
    title: 'Stand Out with Professional Brand Identity',
    text_content: 'Let our award-winning design team create a memorable brand identity that resonates with your audience and drives business growth.',
    style_context_character: 'Creative, professional, results-oriented.',
    status: 'draft',
    created_at: '2024-01-16T12:00:00Z',
    updated_at: '2024-01-16T12:00:00Z'
  }
];

// Mock Social Accounts
export const mockSocialAccounts: SocialAccount[] = [
  {
    id: 'social-1',
    user_id: 'user-1',
    platform: 'facebook',
    account_id: 'fb_123456789',
    account_name: 'TechCorp Solutions',
    access_token: 'mock_access_token_1',
    status: 'active',
    created_at: '2024-01-15T10:45:00Z',
    updated_at: '2024-01-15T10:45:00Z'
  },
  {
    id: 'social-2',
    user_id: 'user-1',
    platform: 'instagram',
    account_id: 'ig_987654321',
    account_name: 'TechCorp AI',
    access_token: 'mock_access_token_2',
    status: 'active',
    created_at: '2024-01-15T10:50:00Z',
    updated_at: '2024-01-15T10:50:00Z'
  },
  {
    id: 'social-3',
    user_id: 'user-2',
    platform: 'facebook',
    account_id: 'fb_555666777',
    account_name: 'Creative Studio',
    access_token: 'mock_access_token_3',
    status: 'active',
    created_at: '2024-01-16T10:45:00Z',
    updated_at: '2024-01-16T10:45:00Z'
  }
];

// Mock Social Integrations
export const mockSocialIntegrations: SocialIntegration[] = [
  {
    id: 'integration-1',
    brand_id: 'brand-1',
    social_account_id: 'social-1',
    platform: 'facebook',
    created_at: '2024-01-15T11:15:00Z',
    updated_at: '2024-01-15T11:15:00Z'
  },
  {
    id: 'integration-2',
    brand_id: 'brand-1',
    social_account_id: 'social-2',
    platform: 'instagram',
    created_at: '2024-01-15T11:20:00Z',
    updated_at: '2024-01-15T11:20:00Z'
  },
  {
    id: 'integration-3',
    brand_id: 'brand-3',
    social_account_id: 'social-3',
    platform: 'facebook',
    created_at: '2024-01-16T11:15:00Z',
    updated_at: '2024-01-16T11:15:00Z'
  }
];

// Mock Approvals
export const mockApprovals: Approval[] = [
  {
    id: 'approval-1',
    content_id: 'content-3',
    approver_id: 'user-1',
    status: 'pending',
    created_at: '2024-01-15T16:30:00Z',
    updated_at: '2024-01-15T16:30:00Z'
  }
];

// Mock Scheduled Posts
export const mockScheduledPosts: ScheduledPost[] = [
  {
    id: 'scheduled-1',
    content_id: 'content-1',
    social_integration_id: 'integration-1',
    scheduled_date: '2024-01-20T10:00:00Z',
    timezone: 'UTC',
    status: 'scheduled',
    created_at: '2024-01-15T17:00:00Z',
    updated_at: '2024-01-15T17:00:00Z'
  },
  {
    id: 'scheduled-2',
    content_id: 'content-1',
    social_integration_id: 'integration-2',
    scheduled_date: '2024-01-20T11:00:00Z',
    timezone: 'UTC',
    status: 'scheduled',
    created_at: '2024-01-15T17:05:00Z',
    updated_at: '2024-01-15T17:05:00Z'
  }
];

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: 'post-1',
    content_id: 'content-1',
    social_integration_id: 'integration-1',
    external_post_id: 'fb_post_123456',
    published_at: '2024-01-10T10:00:00Z',
    status: 'published',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z'
  },
  {
    id: 'post-2',
    content_id: 'content-1',
    social_integration_id: 'integration-2',
    external_post_id: 'ig_post_789012',
    published_at: '2024-01-10T11:00:00Z',
    status: 'published',
    created_at: '2024-01-10T11:00:00Z',
    updated_at: '2024-01-10T11:00:00Z'
  }
];

// Mock Performance Metrics
export const mockPerformanceMetrics: PerformanceMetrics[] = [
  {
    id: 'metrics-1',
    post_id: 'post-1',
    impressions: 12500,
    reach: 8900,
    engagement: 450,
    clicks: 89,
    ctr: 0.71,
    cpc: 0.45,
    cpm: 2.30,
    date: '2024-01-10',
    created_at: '2024-01-11T00:00:00Z'
  },
  {
    id: 'metrics-2',
    post_id: 'post-2',
    impressions: 8900,
    reach: 6200,
    engagement: 320,
    clicks: 67,
    ctr: 0.75,
    cpc: 0.52,
    cpm: 2.80,
    date: '2024-01-10',
    created_at: '2024-01-11T00:00:00Z'
  }
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  total_brands: 3,
  total_products: 4,
  total_contents: 4,
  total_posts: 2,
  pending_approvals: 1,
  scheduled_posts: 2
};

// Mock Recent Activities
export const mockRecentActivities: RecentActivity[] = [
  {
    id: 'activity-1',
    type: 'content_created',
    title: 'New content created',
    description: 'Transform Your Business with AI Analytics',
    timestamp: '2024-01-15T14:00:00Z',
    user_name: 'John Doe'
  },
  {
    id: 'activity-2',
    type: 'post_published',
    title: 'Post published',
    description: 'AI Analytics Platform ad published on Facebook',
    timestamp: '2024-01-10T10:00:00Z',
    user_name: 'John Doe'
  },
  {
    id: 'activity-3',
    type: 'brand_created',
    title: 'New brand created',
    description: 'EcoFriendly Products brand added',
    timestamp: '2024-01-15T12:00:00Z',
    user_name: 'John Doe'
  },
  {
    id: 'activity-4',
    type: 'approval_requested',
    title: 'Approval requested',
    description: 'Bamboo Phone Case content pending approval',
    timestamp: '2024-01-15T16:00:00Z',
    user_name: 'John Doe'
  }
];

// Mock Calendar Events
export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    title: 'AI Analytics Platform - Facebook',
    date: '2024-01-20',
    time: '10:00',
    type: 'scheduled_post',
    status: 'pending',
    content_id: 'content-1',
    brand_name: 'TechCorp AI'
  },
  {
    id: 'event-2',
    title: 'AI Analytics Platform - Instagram',
    date: '2024-01-20',
    time: '11:00',
    type: 'scheduled_post',
    status: 'pending',
    content_id: 'content-1',
    brand_name: 'TechCorp AI'
  },
  {
    id: 'event-3',
    title: 'Bamboo Phone Case - Approval Due',
    date: '2024-01-18',
    time: '16:00',
    type: 'approval_due',
    status: 'pending',
    content_id: 'content-3',
    brand_name: 'EcoFriendly Products'
  }
];

// Mock Chart Data
export const mockChartData: ChartData[] = [
  { date: '2024-01-01', impressions: 10000, engagement: 400, clicks: 80, ctr: 0.8 },
  { date: '2024-01-02', impressions: 12000, engagement: 480, clicks: 96, ctr: 0.8 },
  { date: '2024-01-03', impressions: 15000, engagement: 600, clicks: 120, ctr: 0.8 },
  { date: '2024-01-04', impressions: 11000, engagement: 440, clicks: 88, ctr: 0.8 },
  { date: '2024-01-05', impressions: 13000, engagement: 520, clicks: 104, ctr: 0.8 },
  { date: '2024-01-06', impressions: 14000, engagement: 560, clicks: 112, ctr: 0.8 },
  { date: '2024-01-07', impressions: 16000, engagement: 640, clicks: 128, ctr: 0.8 }
];

// Mock Performance Report
export const mockPerformanceReport: PerformanceReport = {
  period: 'Last 7 days',
  total_impressions: 91000,
  total_engagement: 3640,
  total_clicks: 728,
  average_ctr: 0.8,
  average_cpc: 0.45,
  chart_data: mockChartData
};

// Helper functions for mock data operations
export const getMockData = {
  user: (id: string) => mockUsers.find(u => u.id === id),
  profile: (id: string) => mockProfiles.find(p => p.id === id),
  brand: (id: string) => mockBrands.find(b => b.id === id),
  content: (id: string) => mockContents.find(c => c.id === id),
  socialAccount: (id: string) => mockSocialAccounts.find(s => s.id === id),
  socialIntegration: (id: string) => mockSocialIntegrations.find(s => s.id === id),
  approval: (id: string) => mockApprovals.find(a => a.id === id),
  scheduledPost: (id: string) => mockScheduledPosts.find(s => s.id === id),
  post: (id: string) => mockPosts.find(p => p.id === id),
  performanceMetrics: (postId: string) => mockPerformanceMetrics.filter(m => m.post_id === postId)
};

// Filter functions
export const getBrandsByProfile = (profileId: string) => 
  mockBrands.filter(b => b.profile_id === profileId);

export const getContentsByBrand = (brandId: string) =>
  mockContents.filter(c => c.brand_id === brandId);

export const getSocialAccountsByUser = (userId: string) => 
  mockSocialAccounts.filter(s => s.user_id === userId);

export const getSocialIntegrationsByBrand = (brandId: string) => 
  mockSocialIntegrations.filter(s => s.brand_id === brandId);

export const getPendingApprovals = () => 
  mockApprovals.filter(a => a.status === 'pending');

export const getScheduledPosts = () => 
  mockScheduledPosts.filter(s => s.status === 'scheduled');

export const getPublishedPosts = () => 
  mockPosts.filter(p => p.status === 'published');
