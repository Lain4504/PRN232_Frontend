// Analytics Utility Functions
// Based on Story 3.4 requirements

import { 
  AnalyticsData, 
  AnalyticsMetrics, 
  TimeRange, 
  AnalyticsFilters,
  ChartDataPoint,
  ComparisonData,
  DistributionData,
  AnalyticsTrend,
  AnalyticsInsight
} from '@/lib/types/analytics';
import { 
  PERFORMANCE_THRESHOLDS,
  CHART_COLORS 
} from '@/lib/constants/analytics-metrics';

/**
 * Format numbers for display with appropriate suffixes
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(decimals) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(decimals) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format currency values
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get trend direction and color based on percentage change
 */
export function getTrendInfo(change: number): {
  direction: 'up' | 'down' | 'stable';
  color: string;
  icon: string;
} {
  if (change > 0) {
    return {
      direction: 'up',
      color: 'text-green-600',
      icon: '↗'
    };
  } else if (change < 0) {
    return {
      direction: 'down',
      color: 'text-red-600',
      icon: '↘'
    };
  } else {
    return {
      direction: 'stable',
      color: 'text-gray-600',
      icon: '→'
    };
  }
}

/**
 * Generate time range from period string
 */
export function generateTimeRange(period: string): TimeRange {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      break;
    case '6m':
      start.setMonth(now.getMonth() - 6);
      break;
    case '1y':
      start.setFullYear(now.getFullYear() - 1);
      break;
    case 'this_month':
      start.setDate(1);
      break;
    case 'last_month':
      start.setMonth(now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        start: start.toISOString(),
        end: lastMonthEnd.toISOString(),
        period: 'month'
      };
    default:
      start.setDate(now.getDate() - 30);
  }
  
  return {
    start: start.toISOString(),
    end: now.toISOString(),
    period: period.includes('d') ? 'day' : period.includes('m') ? 'month' : 'year'
  };
}

/**
 * Generate chart data points for time series
 */
export function generateTimeSeriesData(
  data: AnalyticsData[],
  metric: string,
  timeRange: TimeRange
): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];
  const startDate = new Date(timeRange.start);
  const endDate = new Date(timeRange.end);
  
  // Group data by time period
  const groupedData = data.reduce((acc, item) => {
    const date = new Date(item.dimensions.date);
    const key = formatDateForPeriod(date, timeRange.period);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, AnalyticsData[]>);
  
  // Generate data points
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const key = formatDateForPeriod(currentDate, timeRange.period);
    const dayData = groupedData[key] || [];
    const value = dayData.reduce((sum, item) => sum + (item.metrics[metric as keyof AnalyticsMetrics] || 0), 0);
    
    points.push({
      date: currentDate.toISOString(),
      value,
      label: formatDateLabel(currentDate, timeRange.period)
    });
    
    incrementDate(currentDate, timeRange.period);
  }
  
  return points;
}

/**
 * Format date for grouping by period
 */
function formatDateForPeriod(date: Date, period: string): string {
  switch (period) {
    case 'hour':
      return date.toISOString().slice(0, 13) + ':00:00.000Z';
    case 'day':
      return date.toISOString().slice(0, 10);
    case 'week':
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return weekStart.toISOString().slice(0, 10);
    case 'month':
      return date.toISOString().slice(0, 7);
    case 'quarter':
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${date.getFullYear()}-Q${quarter}`;
    case 'year':
      return date.getFullYear().toString();
    default:
      return date.toISOString().slice(0, 10);
  }
}

/**
 * Format date label for display
 */
function formatDateLabel(date: Date, period: string): string {
  switch (period) {
    case 'hour':
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    case 'day':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'week':
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    case 'quarter':
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `Q${quarter} ${date.getFullYear()}`;
    case 'year':
      return date.getFullYear().toString();
    default:
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Increment date by period
 */
function incrementDate(date: Date, period: string): void {
  switch (period) {
    case 'hour':
      date.setHours(date.getHours() + 1);
      break;
    case 'day':
      date.setDate(date.getDate() + 1);
      break;
    case 'week':
      date.setDate(date.getDate() + 7);
      break;
    case 'month':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarter':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'year':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      date.setDate(date.getDate() + 1);
  }
}

/**
 * Calculate performance score based on metrics
 */
export function calculatePerformanceScore(metrics: AnalyticsMetrics): number {
  const weights = {
    ctr: 0.25,
    engagement: 0.20,
    roi: 0.20,
    reach: 0.15,
    conversions: 0.10,
    clicks: 0.10
  };
  
  let score = 0;
  let totalWeight = 0;
  
  Object.entries(weights).forEach(([metric, weight]) => {
    const value = metrics[metric as keyof AnalyticsMetrics] as number;
    if (value !== undefined && value !== null) {
      // Normalize value to 0-100 scale based on thresholds
      const normalizedValue = normalizeMetricValue(metric, value);
      score += normalizedValue * weight;
      totalWeight += weight;
    }
  });
  
  return totalWeight > 0 ? Math.round(score / totalWeight) : 0;
}

/**
 * Normalize metric value to 0-100 scale
 */
function normalizeMetricValue(metric: string, value: number): number {
  const thresholds = PERFORMANCE_THRESHOLDS[metric.toUpperCase() as keyof typeof PERFORMANCE_THRESHOLDS];
  if (!thresholds) return Math.min(100, Math.max(0, value));
  
  if (value >= thresholds.EXCELLENT) return 100;
  if (value >= thresholds.GOOD) return 75;
  if (value >= thresholds.AVERAGE) return 50;
  if (value >= thresholds.POOR) return 25;
  return 0;
}

/**
 * Generate insights from analytics data
 */
export function generateInsights(data: AnalyticsData[]): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];
  
  if (data.length === 0) return insights;
  
  // Calculate averages
  const avgMetrics = calculateAverageMetrics(data);
  
  // Performance insights
  if (avgMetrics.ctr > PERFORMANCE_THRESHOLDS.CTR.GOOD) {
    insights.push({
      id: `ctr-${Date.now()}`,
      type: 'performance',
      title: 'Excellent Click-Through Rate',
      description: `Your CTR of ${formatPercentage(avgMetrics.ctr)} is above the industry average. Keep up the great work!`,
      impact: 'high',
      confidence: 90,
      actionable: false,
      category: 'performance',
      metrics: ['ctr'],
      generatedAt: new Date().toISOString()
    });
  }
  
  // Optimization insights
  if (avgMetrics.engagement < PERFORMANCE_THRESHOLDS.ENGAGEMENT_RATE.AVERAGE) {
    insights.push({
      id: `engagement-${Date.now()}`,
      type: 'optimization',
      title: 'Low Engagement Rate',
      description: `Your engagement rate of ${formatPercentage(avgMetrics.engagement)} is below average. Consider improving your content strategy.`,
      impact: 'medium',
      confidence: 85,
      actionable: true,
      category: 'content',
      metrics: ['engagement'],
      generatedAt: new Date().toISOString()
    });
  }
  
  // Trend insights
  const trends = calculateTrends(data);
  trends.forEach(trend => {
    if (Math.abs(trend.change) > 20) {
      insights.push({
        id: `trend-${trend.metric}-${Date.now()}`,
        type: 'trend',
        title: `${trend.metric} ${trend.change > 0 ? 'Increasing' : 'Decreasing'}`,
        description: `${trend.metric} has ${trend.change > 0 ? 'increased' : 'decreased'} by ${formatPercentage(Math.abs(trend.change))} over the selected period.`,
        impact: trend.change > 0 ? 'high' : 'medium',
        confidence: 80,
        actionable: true,
        category: 'trend',
        metrics: [trend.metric],
        generatedAt: new Date().toISOString()
      });
    }
  });
  
  return insights;
}

/**
 * Calculate average metrics from data array
 */
function calculateAverageMetrics(data: AnalyticsData[]): AnalyticsMetrics {
  const totals = data.reduce((acc, item) => {
    Object.keys(item.metrics).forEach(key => {
      acc[key] = (acc[key] || 0) + (item.metrics[key as keyof AnalyticsMetrics] || 0);
    });
    return acc;
  }, {} as Record<string, number>);
  
  const count = data.length;
  const averages = {} as AnalyticsMetrics;
  
  Object.keys(totals).forEach(key => {
    averages[key as keyof AnalyticsMetrics] = totals[key] / count;
  });
  
  return averages;
}

/**
 * Calculate trends from data array
 */
function calculateTrends(data: AnalyticsData[]): AnalyticsTrend[] {
  if (data.length < 2) return [];
  
  const sortedData = data.sort((a, b) => new Date(a.dimensions.date).getTime() - new Date(b.dimensions.date).getTime());
  const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
  const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));
  
  const trends: AnalyticsTrend[] = [];
  const metrics = Object.keys(sortedData[0].metrics);
  
  metrics.forEach(metric => {
    const firstAvg = calculateAverageMetrics(firstHalf)[metric as keyof AnalyticsMetrics] || 0;
    const secondAvg = calculateAverageMetrics(secondHalf)[metric as keyof AnalyticsMetrics] || 0;
    const change = calculatePercentageChange(secondAvg, firstAvg);
    
    trends.push({
      metric,
      value: secondAvg,
      change,
      changeType: change > 5 ? 'increase' : change < -5 ? 'decrease' : 'stable',
      period: 'recent'
    });
  });
  
  return trends;
}

/**
 * Generate comparison data between two periods
 */
export function generateComparisonData(
  currentData: AnalyticsData[],
  previousData: AnalyticsData[]
): ComparisonData[] {
  const currentMetrics = calculateAverageMetrics(currentData);
  const previousMetrics = calculateAverageMetrics(previousData);
  
  const comparisons: ComparisonData[] = [];
  const metrics = Object.keys(currentMetrics);
  
  metrics.forEach(metric => {
    const current = currentMetrics[metric as keyof AnalyticsMetrics] || 0;
    const previous = previousMetrics[metric as keyof AnalyticsMetrics] || 0;
    const change = calculatePercentageChange(current, previous);
    
    comparisons.push({
      current,
      previous,
      change,
      changeType: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable',
      period: 'vs previous period'
    });
  });
  
  return comparisons;
}

/**
 * Generate distribution data for charts
 */
export function generateDistributionData(
  data: AnalyticsData[],
  dimension: string
): DistributionData[] {
  const distribution = data.reduce((acc, item) => {
    const value = item.dimensions[dimension as keyof typeof item.dimensions] as string;
    if (value) {
      acc[value] = (acc[value] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
  
  return Object.entries(distribution).map(([category, value], index) => ({
    category,
    value,
    percentage: (value / total) * 100,
    color: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]
  }));
}

/**
 * Validate analytics filters
 */
export function validateAnalyticsFilters(filters: AnalyticsFilters): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (filters.dateRange) {
    const start = new Date(filters.dateRange.start);
    const end = new Date(filters.dateRange.end);
    
    if (start >= end) {
      errors.push('Start date must be before end date');
    }
    
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      errors.push('Date range cannot exceed 365 days');
    }
  }
  
  if (filters.metrics && filters.metrics.length === 0) {
    errors.push('At least one metric must be selected');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Debounce function for real-time updates
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for real-time updates
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
