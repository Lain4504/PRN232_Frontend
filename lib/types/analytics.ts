// Analytics Types for Enhanced Analytics and Reporting
// Based on Story 3.4 requirements

export interface AnalyticsData {
  id: string;
  metrics: AnalyticsMetrics;
  dimensions: AnalyticsDimensions;
  timeRange: TimeRange;
  filters: AnalyticsFilters;
  aggregations: AnalyticsAggregations;
  generatedAt: string;
}

export interface AnalyticsMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  cpm: number; // Cost per mille
  roi: number; // Return on investment
  engagement: number;
  reach: number;
  shares: number;
  comments: number;
  likes: number;
  saves: number;
}

export interface AnalyticsDimensions {
  campaignId?: string;
  contentId?: string;
  teamId?: string;
  platform: string;
  date: string;
  hour?: number;
  device?: string;
  location?: string;
  ageGroup?: string;
  gender?: string;
}

export interface TimeRange {
  start: string;
  end: string;
  period: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface AnalyticsFilters {
  campaignIds?: string[];
  contentIds?: string[];
  teamIds?: string[];
  platforms?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  metrics?: string[];
  dimensions?: string[];
}

export interface AnalyticsAggregations {
  sum: string[];
  average: string[];
  count: string[];
  min: string[];
  max: string[];
}

export interface CampaignAnalytics {
  campaignId: string;
  campaignName: string;
  metrics: AnalyticsMetrics;
  performance: CampaignPerformance;
  trends: AnalyticsTrend[];
  comparisons: CampaignComparison[];
  alerts: AnalyticsAlert[];
  generatedAt: string;
}

export interface CampaignPerformance {
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget: number;
  spent: number;
  remaining: number;
  startDate: string;
  endDate?: string;
  targetAudience: string;
  objectives: string[];
}

export interface AnalyticsTrend {
  metric: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  period: string;
}

export interface CampaignComparison {
  campaignId: string;
  campaignName: string;
  metrics: AnalyticsMetrics;
  performance: number; // Percentage compared to current campaign
}

export interface AnalyticsAlert {
  id: string;
  type: 'performance' | 'budget' | 'threshold' | 'anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  triggeredAt: string;
  isRead: boolean;
}

export interface ContentAnalytics {
  contentId: string;
  contentTitle: string;
  contentType: 'image' | 'video' | 'text' | 'carousel';
  metrics: AnalyticsMetrics;
  engagement: ContentEngagement;
  reach: ContentReach;
  performance: ContentPerformance;
  insights: ContentInsight[];
  generatedAt: string;
}

export interface ContentEngagement {
  rate: number;
  total: number;
  breakdown: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
  };
  sentiment: 'positive' | 'neutral' | 'negative';
  topComments: string[];
}

export interface ContentReach {
  total: number;
  organic: number;
  paid: number;
  viral: number;
  demographics: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    locations: Record<string, number>;
  };
}

export interface ContentPerformance {
  score: number; // 0-100 performance score
  ranking: number;
  benchmark: number;
  improvements: string[];
  recommendations: string[];
}

export interface ContentInsight {
  id: string;
  type: 'performance' | 'audience' | 'timing' | 'content' | 'optimization';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  confidence: number; // 0-100
}

export interface TeamAnalytics {
  teamId: string;
  teamName: string;
  memberPerformance: MemberPerformance[];
  resourceUsage: ResourceUsage;
  productivity: ProductivityMetrics;
  collaboration: CollaborationMetrics;
  generatedAt: string;
}

export interface MemberPerformance {
  userId: string;
  userName: string;
  role: string;
  metrics: {
    tasksCompleted: number;
    campaignsManaged: number;
    contentCreated: number;
    performanceScore: number;
  };
  trends: AnalyticsTrend[];
  achievements: string[];
}

export interface ResourceUsage {
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
  campaigns: number;
  activeCampaigns: number;
  contentPieces: number;
  teamMembers: number;
}

export interface ProductivityMetrics {
  averageTaskCompletion: number;
  averageCampaignPerformance: number;
  contentQualityScore: number;
  collaborationScore: number;
  efficiency: number;
}

export interface CollaborationMetrics {
  teamMeetings: number;
  sharedProjects: number;
  crossTeamCollaboration: number;
  knowledgeSharing: number;
  communicationScore: number;
}

export interface ReportData {
  id: string;
  name: string;
  type: 'campaign' | 'content' | 'team' | 'custom';
  data: AnalyticsData | CampaignAnalytics | ContentAnalytics | TeamAnalytics;
  filters: AnalyticsFilters;
  generatedAt: string;
  format: 'json' | 'csv' | 'pdf' | 'excel';
  status: 'generating' | 'ready' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
}

export interface ExportData {
  format: 'pdf' | 'csv' | 'excel' | 'json';
  data: AnalyticsData | CampaignAnalytics | ContentAnalytics | TeamAnalytics;
  options: ExportOptions;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
  generatedAt: string;
}

export interface ExportOptions {
  includeCharts: boolean;
  includeRawData: boolean;
  dateRange: TimeRange;
  filters: AnalyticsFilters;
  template?: string;
  branding?: {
    logo?: string;
    colors?: string[];
    companyName?: string;
  };
}

export interface AnalyticsSubscription {
  tier: 'free' | 'pro' | 'enterprise';
  features: {
    historicalData: number; // Days of historical data
    customReports: boolean;
    exportFormats: string[];
    realTimeUpdates: boolean;
    teamAnalytics: boolean;
    advancedFilters: boolean;
    scheduledReports: boolean;
    whiteLabelReports: boolean;
  };
  limits: {
    maxReports: number;
    maxExports: number;
    maxTeamMembers: number;
    dataRetention: number; // Days
  };
}

export interface AnalyticsInsight {
  id: string;
  type: 'performance' | 'optimization' | 'trend' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  actionable: boolean;
  category: string;
  metrics: string[];
  generatedAt: string;
  expiresAt?: string;
}

export interface RealTimeUpdate {
  id: string;
  type: 'metric' | 'alert' | 'insight';
  data: Record<string, unknown>;
  timestamp: string;
  source: string;
}

// Chart data types for visualization
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

export interface TimeSeriesData {
  metric: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area';
}

export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'stable';
  period: string;
}

export interface DistributionData {
  category: string;
  value: number;
  percentage: number;
  color?: string;
}

// API request/response types
export interface AnalyticsRequest {
  timeRange: TimeRange;
  filters: AnalyticsFilters;
  metrics: string[];
  dimensions: string[];
  aggregations?: AnalyticsAggregations;
}

export interface AnalyticsResponse<T = AnalyticsData> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ExportRequest {
  reportId: string;
  format: 'pdf' | 'csv' | 'excel' | 'json';
  options: ExportOptions;
}

export interface ExportResponse {
  success: boolean;
  exportId: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
  message?: string;
  error?: string;
}
