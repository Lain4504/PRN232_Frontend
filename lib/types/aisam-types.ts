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
  userId?: string; // API returns userId, not profile_id
  profile_id?: string; // Made optional - brands can exist without profiles
  name: string;
  description?: string;
  logo_url?: string;
  slogan?: string;
  usp?: string; // Unique Selling Proposition
  target_audience?: string;
  createdAt?: string; // API uses camelCase
  updatedAt?: string; // API uses camelCase
  created_at?: string; // Keep for backward compatibility
  updated_at?: string; // Keep for backward compatibility
}

export interface Product {
  id: string;
  brandId: string; // API uses camelCase
  name: string;
  description?: string;
  price?: number;
  category?: string;
  tags?: string[];
  images: string[]; // JSONB array of image URLs
  createdAt: string; // API uses camelCase
  updatedAt: string; // API uses camelCase
}

// For backward compatibility, create an alias with snake_case
export interface ProductLegacy {
  id: string;
  brand_id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  tags?: string[];
  images: string[];
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
  profile_id?: string; // Made optional
}

export interface CreateProductForm {
  brand_id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  tags?: string[];
  images?: File[];
}

// API request format for products (matches swagger spec)
export interface CreateProductRequest {
  BrandId: string;
  Name: string;
  Description?: string;
  Price?: number;
  ImageFiles: File[];
}

// Utility functions to convert between API and internal formats
export function convertProductFromApi(apiProduct: Product): ProductLegacy {
  return {
    id: apiProduct.id,
    brand_id: apiProduct.brandId,
    name: apiProduct.name,
    description: apiProduct.description,
    price: apiProduct.price,
    category: apiProduct.category,
    tags: apiProduct.tags,
    images: apiProduct.images,
    created_at: apiProduct.createdAt,
    updated_at: apiProduct.updatedAt,
  }
}

export function convertProductToApi(internalProduct: ProductLegacy): Product {
  return {
    id: internalProduct.id,
    brandId: internalProduct.brand_id,
    name: internalProduct.name,
    description: internalProduct.description,
    price: internalProduct.price,
    category: internalProduct.category,
    tags: internalProduct.tags,
    images: internalProduct.images,
    createdAt: internalProduct.created_at,
    updatedAt: internalProduct.updated_at,
  }
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

// AI Chat API Types
export interface AIChatRequest {
  userId: string;
  brandId?: string | null;
  productId?: string | null;
  adType: number; // 0=TextOnly, 1=Image, 2=Video, 3=Carousel
  message: string;
  conversationId?: string | null;
}

export interface AIChatResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    response: string;
    isContentGenerated: boolean;
    contentId?: string | null;
    aiGenerationId?: string | null;
    generatedContent?: string | null;
    conversationId?: string | null;
  } | null;
  error?: {
    errorCode: string;
    errorMessage: string;
    stackTrace?: string;
    validationErrors?: any;
  };
  timestamp: string;
}

export interface AIChatError {
  errorCode: string;
  errorMessage: string;
  stackTrace?: string;
  validationErrors?: any;
}

// Conversation Management Types
export interface ConversationSummary {
  id: string;
  userId: string;
  brandId?: string | null;
  brandName?: string | null;
  productId?: string | null;
  productName?: string | null;
  adType: string;
  title: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  lastMessageAt?: string;
  messageCount: number;
}

export interface ConversationMessage {
  id: string;
  senderType: 'User' | 'AI';
  message: string;
  aiGenerationId?: string | null;
  contentId?: string | null;
  createdAt: string;
}

export interface ConversationDetails {
  id: string;
  userId: string;
  brandId?: string | null;
  brandName?: string | null;
  productId?: string | null;
  productName?: string | null;
  adType: string;
  title: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
}

export interface ConversationsResponse {
  data: ConversationSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// AdType enum for reference
export const AdTypes = {
  TextOnly: 0,
  Image: 1,
  Video: 2,
  Carousel: 3,
} as const;

export type AdType = typeof AdTypes[keyof typeof AdTypes];
// Notification types
export type NotificationType = 'ApprovalNeeded' | 'PostScheduled' | 'PerformanceAlert' | 'AiSuggestion' | 'SystemUpdate';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  targetId?: string;
  targetType?: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: NotificationType;
  page?: number;
  pageSize?: number;
}

export interface MarkAsReadRequest {
  notificationIds: string[];
}

export interface NotificationStats {
  total: number;
  unread: number;
}
