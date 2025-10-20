import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import type { AdCreativeMetrics } from '@/lib/types/creatives';

// Get creative performance metrics
export function useCreativeMetrics(creativeId: string, dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ['creative-metrics', creativeId, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('startDate', dateRange.start);
        params.append('endDate', dateRange.end);
      }
      
      const response = await api.get<AdCreativeMetrics>(
        `${endpoints.creativeMetrics(creativeId)}?${params.toString()}`
      );
      return response.data;
    },
    enabled: !!creativeId,
  });
}

// Get creative metrics over time (for charts)
export function useCreativeMetricsOverTime(creativeId: string, period: 'day' | 'week' | 'month' = 'day') {
  return useQuery({
    queryKey: ['creative-metrics-over-time', creativeId, period],
    queryFn: async () => {
      const response = await api.get<Array<{
        date: string;
        impressions: number;
        clicks: number;
        engagement: number;
        ctr: number;
        performance: number;
      }>>(
        `${endpoints.creativeMetrics(creativeId)}/over-time?period=${period}`
      );
      return response.data;
    },
    enabled: !!creativeId,
  });
}
