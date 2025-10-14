// AISAM Frontend Types - Mock Data Structures
// Based on the database schema described in the requirements

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  profile_type: 'personal' | 'business';
  company_name?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  profile_id: string;
  name: string;
  description?: string;
  logo_url?: string;
  slogan?: string;
  usp?: string; // Unique Selling Proposition
  target_audience?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  brand_id: string;
  name: string;
  description?: string;
  price?: number;
  images: string[]; // JSONB array of image URLs
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  brand_id: string;
  product_id?: string;
  ad_type: 'image_text' | 'video_text' | 'text_only';
  title: string;
  text_content?: string;
  style_context_character?: string;
  image_url?: string;
  video_url?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'published';
  created_at: string;
  updated_at: string;
}

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'twitter' | 'linkedin';
  account_id: string; // External platform account ID
  account_name: string;
  access_token?: string;
  refresh_token?: string;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface SocialIntegration {
  id: string;
  brand_id: string;
  social_account_id: string;
  platform: string;
  created_at: string;
  updated_at: string;
}

// Social Account & Integration API Types
export interface SocialAccountDto {
  id: string;
  provider: 'facebook' | 'tiktok' | 'instagram';
  providerUserId: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  targets?: SocialTargetDto[];
}

export interface SocialTargetDto {
  id: string;
  provider: string;
  providerTargetId: string;
  name: string;
  type: string;
  category?: string;
  profilePictureUrl?: string;
  isActive: boolean;
  brandId?: string;
  brandName?: string;
}

export interface AvailableTargetDto {
  providerTargetId: string;
  name: string;
  type: string;
  category?: string;
  profilePictureUrl?: string;
  isActive: boolean;
}

export interface SocialAuthUrlResponse {
  authUrl: string;
  state: string;
}

export interface SocialCallbackRequest {
  userId: string;
  code: string;
  state: string;
}

export interface SocialCallbackResponse {
  user: {
    id: string;
    email: string;
  };
  socialAccount: SocialAccountDto;
  availableTargets: AvailableTargetDto[];
}

export interface LinkTargetsRequest {
  userId: string;
  provider: string;
  providerTargetIds: string[];
  brandId: string;
}

export interface LinkTargetsResponse {
  id: string;
  provider: string;
  targets: SocialTargetDto[];
}

export interface AccountsWithTargetsResponse {
  socialAccount: SocialAccountDto;
  targets: SocialTargetDto[];
}

// Error Response Types
export interface ApiErrorResponse {
  success: false;
  message: string;
  errorCode: 'UNAUTHORIZED' | 'INVALID_REQUEST' | 'SOCIAL_ACCOUNT_NOT_FOUND' | 'FACEBOOK_OAUTH_ERROR' | 'FACEBOOK_CONNECTION_ERROR' | 'INTERNAL_SERVER_ERROR';
}

export interface Approval {
  id: string;
  content_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduledPost {
  id: string;
  content_id: string;
  social_integration_id: string;
  scheduled_date: string;
  timezone: string;
  status: 'scheduled' | 'published' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  content_id: string;
  social_integration_id: string;
  external_post_id: string; // Platform-specific post ID
  published_at: string;
  status: 'published' | 'failed' | 'deleted';
  created_at: string;
  updated_at: string;
}

export interface PerformanceMetrics {
  id: string;
  post_id: string;
  impressions: number;
  reach: number;
  engagement: number;
  clicks: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  cpm: number; // Cost per mille
  date: string;
  created_at: string;
}

// Form types for creating/editing entities
export interface CreateProfileForm {
  profile_type: 'personal' | 'business';
  company_name?: string;
  bio?: string;
  avatar?: File;
}

export interface CreateBrandForm {
  name: string;
  description?: string;
  logo?: File;
  slogan?: string;
  usp?: string;
  target_audience?: string;
  profile_id: string;
}

export interface CreateProductForm {
  brand_id: string;
  name: string;
  description?: string;
  price?: number;
  images: File[];
}

export interface CreateContentForm {
  brand_id: string;
  product_id?: string;
  ad_type: 'image_text' | 'video_text' | 'text_only';
  title: string;
  text_content?: string;
  style_context_character?: string;
  image?: File;
  video?: File;
}

export interface CreateSocialIntegrationForm {
  brand_id: string;
  social_account_id: string;
}

export interface SchedulePostForm {
  content_id: string;
  social_integration_id: string;
  scheduled_date: string;
  timezone: string;
}

// Dashboard overview types
export interface DashboardStats {
  total_brands: number;
  total_products: number;
  total_contents: number;
  total_posts: number;
  pending_approvals: number;
  scheduled_posts: number;
}

export interface RecentActivity {
  id: string;
  type: 'content_created' | 'post_published' | 'approval_requested' | 'brand_created';
  title: string;
  description: string;
  timestamp: string;
  user_name: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Filter and search types
export interface ContentFilters {
  brand_id?: string;
  product_id?: string;
  status?: string;
  ad_type?: string;
  search?: string;
}

export interface ProductFilters {
  brand_id?: string;
  search?: string;
}

export interface PostFilters {
  social_integration_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'scheduled_post' | 'approval_due' | 'campaign_launch';
  status: 'pending' | 'approved' | 'published' | 'failed';
  content_id?: string;
  brand_name?: string;
}

// Chart data types
export interface ChartData {
  date: string;
  impressions: number;
  engagement: number;
  clicks: number;
  ctr: number;
}

export interface PerformanceReport {
  period: string;
  total_impressions: number;
  total_engagement: number;
  total_clicks: number;
  average_ctr: number;
  average_cpc: number;
  chart_data: ChartData[];
}

// Team domain types
export interface TeamResponse {
  id: string;
  name: string;
  description?: string;
  vendorId: string;
  vendorEmail?: string;
  status: 'Active' | 'Inactive' | 'Archived'; // Match backend enum values
  createdAt: string;
  updatedAt?: string;
  membersCount?: number;
  brands?: { id: string; name: string }[];
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface UpdateTeamStatusRequest {
  status: 'Active' | 'Inactive' | 'Archived';
}

export interface AssignBrandToTeamRequest {
  brandIds: string[]; // supports batch assign/unassign based on backend contract
}

export interface TeamMemberResponseDto {
  id: string;
  teamId: string;
  userId: string;
  role: string;
  permissions: string[];
  joinedAt: string;
  isActive: boolean;
  userEmail: string;
}

export interface TeamMemberCreateRequest {
  TeamId: string;  // Backend expects PascalCase
  UserId: string;  // Backend expects PascalCase
  Role: string;    // Backend expects PascalCase
  Permissions?: string[];  // Backend expects PascalCase
}

export interface TeamMemberUpdateRequest {
  role?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface PaginationRequest {
  page?: number;
  pageSize?: number;
  teamId?: string;
  vendorId?: string;
  role?: string;
  status?: string;
}