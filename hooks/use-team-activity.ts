// Team Activity Hooks
// Based on Story 3.3 requirements

import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { TeamActivity, TeamActivityListResponse, TeamAnalytics } from '@/lib/types/teams';

// Query Keys
export const teamActivityKeys = {
  all: ['team-activity'] as const,
  lists: () => [...teamActivityKeys.all, 'list'] as const,
  listByTeam: (teamId: string) => [...teamActivityKeys.lists(), 'team', teamId] as const,
  analytics: () => [...teamActivityKeys.all, 'analytics'] as const,
  analyticsByTeam: (teamId: string) => [...teamActivityKeys.analytics(), 'team', teamId] as const,
};

// Get team activity logs
export function useTeamActivity(teamId?: string, filters?: {
  action?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}) {
  const searchParams = new URLSearchParams();
  if (filters?.action) searchParams.set('action', filters.action);
  if (filters?.userId) searchParams.set('userId', filters.userId);
  if (filters?.dateFrom) searchParams.set('dateFrom', filters.dateFrom);
  if (filters?.dateTo) searchParams.set('dateTo', filters.dateTo);
  if (filters?.page) searchParams.set('page', String(filters.page));
  if (filters?.pageSize) searchParams.set('pageSize', String(filters.pageSize));

  const query = searchParams.toString();

  return useQuery({
    queryKey: teamId ? [...teamActivityKeys.listByTeam(teamId), query] : teamActivityKeys.lists(),
    queryFn: async (): Promise<TeamActivityListResponse> => {
      if (!teamId) return { activities: [], total: 0, page: 1, pageSize: 20 };
      const url = `${endpoints.teamActivity(teamId)}${query ? `?${query}` : ''}`;
      const resp = await api.get<TeamActivityListResponse>(url);
      return resp.data;
    },
    enabled: !!teamId,
  });
}

// Get team analytics
export function useTeamAnalytics(teamId?: string) {
  return useQuery({
    queryKey: teamId ? teamActivityKeys.analyticsByTeam(teamId) : teamActivityKeys.analytics(),
    queryFn: async (): Promise<TeamAnalytics> => {
      if (!teamId) {
        return {
          totalMembers: 0,
          activeMembers: 0,
          pendingInvitations: 0,
          recentActivity: [],
          memberGrowth: [],
          roleDistribution: [],
          activitySummary: []
        };
      }
      const resp = await api.get<TeamAnalytics>(endpoints.teamAnalytics(teamId));
      return resp.data;
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get recent team activity (last 10 activities)
export function useRecentTeamActivity(teamId?: string) {
  return useQuery({
    queryKey: teamId ? [...teamActivityKeys.listByTeam(teamId), 'recent'] : teamActivityKeys.lists(),
    queryFn: async (): Promise<TeamActivity[]> => {
      if (!teamId) return [];
      const resp = await api.get<TeamActivityListResponse>(
        `${endpoints.teamActivity(teamId)}?page=1&pageSize=10`
      );
      return resp.data.activities;
    },
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
