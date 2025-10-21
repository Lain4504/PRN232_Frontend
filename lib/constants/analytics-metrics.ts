// Analytics Metrics Constants
// Based on Story 3.4 requirements

export const ANALYTICS_METRICS = {
  // Core metrics
  IMPRESSIONS: 'impressions',
  CLICKS: 'clicks',
  CONVERSIONS: 'conversions',
  CTR: 'ctr', // Click-through rate
  CPC: 'cpc', // Cost per click
  CPM: 'cpm', // Cost per mille
  ROI: 'roi', // Return on investment
  
  // Engagement metrics
  ENGAGEMENT: 'engagement',
  REACH: 'reach',
  SHARES: 'shares',
  COMMENTS: 'comments',
  LIKES: 'likes',
  SAVES: 'saves',
  
  // Performance metrics
  PERFORMANCE_SCORE: 'performance_score',
  QUALITY_SCORE: 'quality_score',
  EFFICIENCY: 'efficiency',
  
  // Financial metrics
  REVENUE: 'revenue',
  COST: 'cost',
  PROFIT: 'profit',
  BUDGET_UTILIZATION: 'budget_utilization',
  
  // Team metrics
  PRODUCTIVITY: 'productivity',
  COLLABORATION: 'collaboration',
  TASK_COMPLETION: 'task_completion',
} as const;

export const ANALYTICS_DIMENSIONS = {
  // Time dimensions
  DATE: 'date',
  HOUR: 'hour',
  DAY_OF_WEEK: 'day_of_week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  
  // Platform dimensions
  PLATFORM: 'platform',
  DEVICE: 'device',
  BROWSER: 'browser',
  
  // Audience dimensions
  AGE_GROUP: 'age_group',
  GENDER: 'gender',
  LOCATION: 'location',
  INTERESTS: 'interests',
  
  // Content dimensions
  CONTENT_TYPE: 'content_type',
  CONTENT_CATEGORY: 'content_category',
  CAMPAIGN_TYPE: 'campaign_type',
  
  // Team dimensions
  TEAM_MEMBER: 'team_member',
  ROLE: 'role',
  DEPARTMENT: 'department',
} as const;

export const ANALYTICS_TIME_PERIODS = {
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
} as const;

export const ANALYTICS_PLATFORMS = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube',
  PINTEREST: 'pinterest',
} as const;

export const ANALYTICS_CONTENT_TYPES = {
  IMAGE: 'image',
  VIDEO: 'video',
  TEXT: 'text',
  CAROUSEL: 'carousel',
  STORY: 'story',
  REEL: 'reel',
} as const;

export const ANALYTICS_ALERT_TYPES = {
  PERFORMANCE: 'performance',
  BUDGET: 'budget',
  THRESHOLD: 'threshold',
  ANOMALY: 'anomaly',
  TREND: 'trend',
} as const;

export const ANALYTICS_ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const ANALYTICS_INSIGHT_TYPES = {
  PERFORMANCE: 'performance',
  OPTIMIZATION: 'optimization',
  TREND: 'trend',
  ANOMALY: 'anomaly',
  RECOMMENDATION: 'recommendation',
  AUDIENCE: 'audience',
  CONTENT: 'content',
  TIMING: 'timing',
} as const;

export const ANALYTICS_INSIGHT_IMPACT = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const ANALYTICS_EXPORT_FORMATS = {
  PDF: 'pdf',
  CSV: 'csv',
  EXCEL: 'excel',
  JSON: 'json',
} as const;

export const ANALYTICS_REPORT_TYPES = {
  CAMPAIGN: 'campaign',
  CONTENT: 'content',
  TEAM: 'team',
  CUSTOM: 'custom',
  DASHBOARD: 'dashboard',
  SUMMARY: 'summary',
} as const;

export const ANALYTICS_SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

// Chart configuration
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#10b981',
  TERTIARY: '#f59e0b',
  QUATERNARY: '#ef4444',
  QUINARY: '#8b5cf6',
  SENARY: '#06b6d4',
  SEPTENARY: '#84cc16',
  OCTONARY: '#f97316',
} as const;

export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  AREA: 'area',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  SCATTER: 'scatter',
  RADAR: 'radar',
  HEATMAP: 'heatmap',
} as const;

// Default time ranges
export const DEFAULT_TIME_RANGES = {
  LAST_7_DAYS: {
    label: 'Last 7 days',
    value: '7d',
    days: 7,
  },
  LAST_30_DAYS: {
    label: 'Last 30 days',
    value: '30d',
    days: 30,
  },
  LAST_90_DAYS: {
    label: 'Last 90 days',
    value: '90d',
    days: 90,
  },
  LAST_6_MONTHS: {
    label: 'Last 6 months',
    value: '6m',
    days: 180,
  },
  LAST_YEAR: {
    label: 'Last year',
    value: '1y',
    days: 365,
  },
  THIS_MONTH: {
    label: 'This month',
    value: 'this_month',
    days: 0, // Calculated dynamically
  },
  LAST_MONTH: {
    label: 'Last month',
    value: 'last_month',
    days: 0, // Calculated dynamically
  },
  CUSTOM: {
    label: 'Custom range',
    value: 'custom',
    days: 0,
  },
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  CTR: {
    EXCELLENT: 5.0,
    GOOD: 3.0,
    AVERAGE: 2.0,
    POOR: 1.0,
  },
  ENGAGEMENT_RATE: {
    EXCELLENT: 8.0,
    GOOD: 5.0,
    AVERAGE: 3.0,
    POOR: 1.0,
  },
  ROI: {
    EXCELLENT: 5.0,
    GOOD: 3.0,
    AVERAGE: 2.0,
    POOR: 1.0,
  },
  CPC: {
    EXCELLENT: 0.50,
    GOOD: 1.00,
    AVERAGE: 2.00,
    POOR: 5.00,
  },
} as const;

// Subscription limits
export const SUBSCRIPTION_LIMITS = {
  FREE: {
    maxReports: 5,
    maxExports: 10,
    maxTeamMembers: 1,
    dataRetention: 30,
    historicalData: 30,
    realTimeUpdates: false,
    customReports: false,
    teamAnalytics: false,
    advancedFilters: false,
    scheduledReports: false,
    whiteLabelReports: false,
  },
  PRO: {
    maxReports: 50,
    maxExports: 100,
    maxTeamMembers: 10,
    dataRetention: 365,
    historicalData: 365,
    realTimeUpdates: true,
    customReports: true,
    teamAnalytics: true,
    advancedFilters: true,
    scheduledReports: true,
    whiteLabelReports: false,
  },
  ENTERPRISE: {
    maxReports: -1, // Unlimited
    maxExports: -1, // Unlimited
    maxTeamMembers: -1, // Unlimited
    dataRetention: -1, // Unlimited
    historicalData: -1, // Unlimited
    realTimeUpdates: true,
    customReports: true,
    teamAnalytics: true,
    advancedFilters: true,
    scheduledReports: true,
    whiteLabelReports: true,
  },
} as const;

// Export options
export const EXPORT_OPTIONS = {
  PDF: {
    includeCharts: true,
    includeRawData: false,
    pageSize: 'A4',
    orientation: 'portrait',
  },
  CSV: {
    includeCharts: false,
    includeRawData: true,
    delimiter: ',',
    encoding: 'utf-8',
  },
  EXCEL: {
    includeCharts: true,
    includeRawData: true,
    sheetName: 'Analytics Data',
    includeFormulas: false,
  },
  JSON: {
    includeCharts: false,
    includeRawData: true,
    prettyPrint: true,
    includeMetadata: true,
  },
} as const;
