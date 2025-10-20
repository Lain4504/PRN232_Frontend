// Analytics Data Management Hook
// Based on Story 3.4 requirements

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AnalyticsData, 
  AnalyticsFilters, 
  TimeRange,
  AnalyticsRequest,
  AnalyticsResponse,
  CampaignAnalytics,
  ContentAnalytics,
  TeamAnalytics
} from '@/lib/types/analytics';
import { 
  ANALYTICS_METRICS, 
  DEFAULT_TIME_RANGES,
  ANALYTICS_PLATFORMS 
} from '@/lib/constants/analytics-metrics';
import { 
  generateTimeRange, 
  validateAnalyticsFilters,
  debounce,
  throttle
} from '@/lib/utils/analytics';

// Mock API functions (replace with actual API calls)
const mockAnalyticsApi = {
  getAnalytics: async (request: AnalyticsRequest): Promise<AnalyticsResponse<AnalyticsData[]>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock data
    const mockData: AnalyticsData[] = [];
    const startDate = new Date(request.timeRange.start);
    const endDate = new Date(request.timeRange.end);
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      request.filters.platforms?.forEach(platform => {
        mockData.push({
          id: `${platform}-${date.toISOString().split('T')[0]}`,
          metrics: {
            impressions: Math.floor(Math.random() * 10000) + 1000,
            clicks: Math.floor(Math.random() * 500) + 50,
            conversions: Math.floor(Math.random() * 50) + 5,
            ctr: Math.random() * 5 + 1,
            cpc: Math.random() * 2 + 0.5,
            cpm: Math.random() * 10 + 2,
            roi: Math.random() * 3 + 1,
            engagement: Math.floor(Math.random() * 1000) + 100,
            reach: Math.floor(Math.random() * 8000) + 800,
            shares: Math.floor(Math.random() * 100) + 10,
            comments: Math.floor(Math.random() * 50) + 5,
            likes: Math.floor(Math.random() * 200) + 20,
            saves: Math.floor(Math.random() * 30) + 3,
          },
          dimensions: {
            platform,
            date: date.toISOString().split('T')[0],
            campaignId: `campaign-${Math.floor(Math.random() * 5) + 1}`,
            contentId: `content-${Math.floor(Math.random() * 10) + 1}`,
          },
          timeRange: request.timeRange,
          filters: request.filters,
          aggregations: request.aggregations || { sum: [], average: [], count: [], min: [], max: [] },
          generatedAt: new Date().toISOString(),
        });
      });
    }
    
    return {
      success: true,
      data: mockData,
      message: 'Analytics data retrieved successfully'
    };
  },

  getCampaignAnalytics: async (campaignId: string, timeRange: TimeRange): Promise<AnalyticsResponse<CampaignAnalytics>> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockCampaignAnalytics: CampaignAnalytics = {
      campaignId,
      campaignName: `Campaign ${campaignId}`,
      metrics: {
        impressions: Math.floor(Math.random() * 100000) + 10000,
        clicks: Math.floor(Math.random() * 5000) + 500,
        conversions: Math.floor(Math.random() * 500) + 50,
        ctr: Math.random() * 5 + 1,
        cpc: Math.random() * 2 + 0.5,
        cpm: Math.random() * 10 + 2,
        roi: Math.random() * 3 + 1,
        engagement: Math.floor(Math.random() * 10000) + 1000,
        reach: Math.floor(Math.random() * 80000) + 8000,
        shares: Math.floor(Math.random() * 1000) + 100,
        comments: Math.floor(Math.random() * 500) + 50,
        likes: Math.floor(Math.random() * 2000) + 200,
        saves: Math.floor(Math.random() * 300) + 30,
      },
      performance: {
        status: 'active',
        budget: 10000,
        spent: Math.floor(Math.random() * 8000) + 2000,
        remaining: Math.floor(Math.random() * 6000) + 1000,
        startDate: timeRange.start,
        endDate: timeRange.end,
        targetAudience: '18-35 years old, interested in technology',
        objectives: ['brand awareness', 'lead generation']
      },
      trends: [
        {
          metric: 'impressions',
          value: 45000,
          change: 12.5,
          changeType: 'increase',
          period: 'last 7 days'
        },
        {
          metric: 'ctr',
          value: 3.2,
          change: -2.1,
          changeType: 'decrease',
          period: 'last 7 days'
        }
      ],
      comparisons: [],
      alerts: [],
      generatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: mockCampaignAnalytics,
      message: 'Campaign analytics retrieved successfully'
    };
  },

  getContentAnalytics: async (contentId: string, timeRange: TimeRange): Promise<AnalyticsResponse<ContentAnalytics>> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockContentAnalytics: ContentAnalytics = {
      contentId,
      contentTitle: `Content ${contentId}`,
      contentType: 'image',
      metrics: {
        impressions: Math.floor(Math.random() * 50000) + 5000,
        clicks: Math.floor(Math.random() * 2500) + 250,
        conversions: Math.floor(Math.random() * 250) + 25,
        ctr: Math.random() * 5 + 1,
        cpc: Math.random() * 2 + 0.5,
        cpm: Math.random() * 10 + 2,
        roi: Math.random() * 3 + 1,
        engagement: Math.floor(Math.random() * 5000) + 500,
        reach: Math.floor(Math.random() * 40000) + 4000,
        shares: Math.floor(Math.random() * 500) + 50,
        comments: Math.floor(Math.random() * 250) + 25,
        likes: Math.floor(Math.random() * 1000) + 100,
        saves: Math.floor(Math.random() * 150) + 15,
      },
      engagement: {
        rate: Math.random() * 10 + 2,
        total: Math.floor(Math.random() * 5000) + 500,
        breakdown: {
          likes: Math.floor(Math.random() * 1000) + 100,
          comments: Math.floor(Math.random() * 250) + 25,
          shares: Math.floor(Math.random() * 500) + 50,
          saves: Math.floor(Math.random() * 150) + 15,
          clicks: Math.floor(Math.random() * 2500) + 250,
        },
        sentiment: 'positive',
        topComments: ['Great content!', 'Love this!', 'Very helpful']
      },
      reach: {
        total: Math.floor(Math.random() * 40000) + 4000,
        organic: Math.floor(Math.random() * 30000) + 3000,
        paid: Math.floor(Math.random() * 10000) + 1000,
        viral: Math.floor(Math.random() * 5000) + 500,
        demographics: {
          ageGroups: {
            '18-24': Math.floor(Math.random() * 1000) + 100,
            '25-34': Math.floor(Math.random() * 1500) + 150,
            '35-44': Math.floor(Math.random() * 1000) + 100,
            '45+': Math.floor(Math.random() * 500) + 50,
          },
          genders: {
            'male': Math.floor(Math.random() * 2000) + 200,
            'female': Math.floor(Math.random() * 1800) + 180,
            'other': Math.floor(Math.random() * 200) + 20,
          },
          locations: {
            'US': Math.floor(Math.random() * 2000) + 200,
            'UK': Math.floor(Math.random() * 800) + 80,
            'CA': Math.floor(Math.random() * 600) + 60,
            'AU': Math.floor(Math.random() * 400) + 40,
          }
        }
      },
      performance: {
        score: Math.floor(Math.random() * 40) + 60,
        ranking: Math.floor(Math.random() * 10) + 1,
        benchmark: 75,
        improvements: ['Add more engaging visuals', 'Optimize posting time'],
        recommendations: ['Increase posting frequency', 'A/B test different formats']
      },
      insights: [],
      generatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: mockContentAnalytics,
      message: 'Content analytics retrieved successfully'
    };
  },

  getTeamAnalytics: async (teamId: string, timeRange: TimeRange): Promise<AnalyticsResponse<TeamAnalytics>> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockTeamAnalytics: TeamAnalytics = {
      teamId,
      teamName: `Team ${teamId}`,
      memberPerformance: [
        {
          userId: 'user-1',
          userName: 'John Doe',
          role: 'Campaign Manager',
          metrics: {
            tasksCompleted: Math.floor(Math.random() * 20) + 10,
            campaignsManaged: Math.floor(Math.random() * 5) + 2,
            contentCreated: Math.floor(Math.random() * 15) + 5,
            performanceScore: Math.floor(Math.random() * 30) + 70,
          },
          trends: [],
          achievements: ['Top performer this month', 'Exceeded campaign goals']
        }
      ],
      resourceUsage: {
        totalBudget: 50000,
        usedBudget: Math.floor(Math.random() * 40000) + 10000,
        remainingBudget: Math.floor(Math.random() * 30000) + 5000,
        campaigns: Math.floor(Math.random() * 10) + 5,
        activeCampaigns: Math.floor(Math.random() * 8) + 3,
        contentPieces: Math.floor(Math.random() * 50) + 20,
        teamMembers: Math.floor(Math.random() * 8) + 3,
      },
      productivity: {
        averageTaskCompletion: Math.floor(Math.random() * 20) + 80,
        averageCampaignPerformance: Math.floor(Math.random() * 20) + 75,
        contentQualityScore: Math.floor(Math.random() * 20) + 70,
        collaborationScore: Math.floor(Math.random() * 20) + 75,
        efficiency: Math.floor(Math.random() * 20) + 80,
      },
      collaboration: {
        teamMeetings: Math.floor(Math.random() * 10) + 5,
        sharedProjects: Math.floor(Math.random() * 15) + 8,
        crossTeamCollaboration: Math.floor(Math.random() * 20) + 10,
        knowledgeSharing: Math.floor(Math.random() * 15) + 8,
        communicationScore: Math.floor(Math.random() * 20) + 75,
      },
      generatedAt: new Date().toISOString(),
    };
    
    return {
      success: true,
      data: mockTeamAnalytics,
      message: 'Team analytics retrieved successfully'
    };
  }
};

export function useAnalytics(
  initialFilters: AnalyticsFilters = {},
  initialTimeRange: TimeRange = generateTimeRange('30d')
) {
  const [filters, setFilters] = useState<AnalyticsFilters>(initialFilters);
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  const [isRealTime, setIsRealTime] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<number | false>(false);

  const queryClient = useQueryClient();

  // Validate filters
  const { isValid: filtersValid, errors: filterErrors } = useMemo(
    () => validateAnalyticsFilters(filters),
    [filters]
  );

  // Build analytics request
  const analyticsRequest = useMemo((): AnalyticsRequest => ({
    timeRange,
    filters: {
      ...filters,
      platforms: filters.platforms || Object.values(ANALYTICS_PLATFORMS),
      metrics: filters.metrics || Object.values(ANALYTICS_METRICS).slice(0, 5),
    },
    metrics: filters.metrics || Object.values(ANALYTICS_METRICS).slice(0, 5),
    dimensions: ['date', 'platform'],
  }), [filters, timeRange]);

  // Main analytics query
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ['analytics', analyticsRequest],
    queryFn: () => mockAnalyticsApi.getAnalytics(analyticsRequest),
    enabled: filtersValid,
    refetchInterval: isRealTime ? refreshInterval || 30000 : false,
    staleTime: isRealTime ? 0 : 5 * 60 * 1000, // 5 minutes
  });

  // Debounced filter updates
  const debouncedSetFilters = useCallback(
    debounce((newFilters: AnalyticsFilters) => {
      setFilters(newFilters);
    }, 300),
    []
  );

  // Throttled real-time updates
  const throttledRefetch = useCallback(
    throttle(() => {
      refetchAnalytics();
    }, 1000),
    [refetchAnalytics]
  );

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    debouncedSetFilters(updatedFilters);
  }, [filters, debouncedSetFilters]);

  // Update time range
  const updateTimeRange = useCallback((newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
  }, []);

  // Set time range by period
  const setTimeRangeByPeriod = useCallback((period: string) => {
    const newTimeRange = generateTimeRange(period);
    setTimeRange(newTimeRange);
  }, []);

  // Toggle real-time updates
  const toggleRealTime = useCallback((enabled: boolean, interval: number = 30000) => {
    setIsRealTime(enabled);
    setRefreshInterval(enabled ? interval : false);
  }, []);

  // Manual refresh
  const refresh = useCallback(() => {
    if (isRealTime) {
      throttledRefetch();
    } else {
      refetchAnalytics();
    }
  }, [isRealTime, throttledRefetch, refetchAnalytics]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Reset to default
  const resetToDefault = useCallback(() => {
    setFilters(initialFilters);
    setTimeRange(initialTimeRange);
    setIsRealTime(false);
    setRefreshInterval(false);
  }, [initialFilters, initialTimeRange]);

  return {
    // Data
    data: analyticsData?.data || [],
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    
    // State
    filters,
    timeRange,
    isRealTime,
    refreshInterval,
    filtersValid,
    filterErrors,
    
    // Actions
    updateFilters,
    updateTimeRange,
    setTimeRangeByPeriod,
    toggleRealTime,
    refresh,
    clearFilters,
    resetToDefault,
    refetch: refetchAnalytics,
  };
}

export function useCampaignAnalytics(campaignId: string, timeRange: TimeRange) {
  return useQuery({
    queryKey: ['campaign-analytics', campaignId, timeRange],
    queryFn: () => mockAnalyticsApi.getCampaignAnalytics(campaignId, timeRange),
    enabled: !!campaignId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useContentAnalytics(contentId: string, timeRange: TimeRange) {
  return useQuery({
    queryKey: ['content-analytics', contentId, timeRange],
    queryFn: () => mockAnalyticsApi.getContentAnalytics(contentId, timeRange),
    enabled: !!contentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTeamAnalytics(teamId: string, timeRange: TimeRange) {
  return useQuery({
    queryKey: ['team-analytics', teamId, timeRange],
    queryFn: () => mockAnalyticsApi.getTeamAnalytics(teamId, timeRange),
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useAnalyticsInsights(data: AnalyticsData[]) {
  return useMemo(() => {
    // This would typically call an AI service to generate insights
    // For now, return mock insights
    return [
      {
        id: 'insight-1',
        type: 'performance' as const,
        title: 'Strong Performance Trend',
        description: 'Your campaigns are showing consistent growth over the selected period.',
        impact: 'high' as const,
        confidence: 85,
        actionable: false,
        category: 'performance',
        metrics: ['impressions', 'clicks'],
        generatedAt: new Date().toISOString(),
      },
      {
        id: 'insight-2',
        type: 'optimization' as const,
        title: 'Optimization Opportunity',
        description: 'Consider increasing your budget allocation to top-performing campaigns.',
        impact: 'medium' as const,
        confidence: 75,
        actionable: true,
        category: 'budget',
        metrics: ['roi', 'cpc'],
        generatedAt: new Date().toISOString(),
      },
    ];
  }, [data]);
}
