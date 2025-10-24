import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, endpoints } from '@/lib/api'
import type {
  ContentCalendar,
  ScheduleContentRequest,
  ScheduleRecurringContentRequest,
} from '@/lib/types/aisam-types'

// Query Keys
export const contentCalendarKeys = {
  all: ['content-calendar'] as const,
  upcoming: (brandId?: string) => [...contentCalendarKeys.all, 'upcoming', brandId] as const,
  byContent: (contentId: string) => [...contentCalendarKeys.all, 'content', contentId] as const,
}

// Get upcoming scheduled posts
export function useUpcomingSchedules(limit = 50, brandId?: string) {
  // Enable query when brandId is provided OR when no brandId is provided (for general upcoming schedules)
  const enabled = brandId === undefined || (!!brandId && brandId !== "all" && brandId !== "")
  
  console.log('[useUpcomingSchedules] brandId:', brandId, 'enabled:', enabled)
  
  return useQuery({
    queryKey: [...contentCalendarKeys.upcoming(brandId), limit],
    queryFn: async (): Promise<ContentCalendar[]> => {
      console.log('[useUpcomingSchedules] Calling API with brandId:', brandId)
      const resp = await api.get<ContentCalendar[]>(endpoints.contentCalendar.upcoming(limit, brandId))
      console.log('[useUpcomingSchedules] API response:', resp.data)
      return resp.data
    },
    enabled,
  })
}

// Schedule content
export function useScheduleContent(contentId: string, brandId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ScheduleContentRequest): Promise<ContentCalendar> => {
      const resp = await api.post<ContentCalendar>(endpoints.contentCalendar.schedule(contentId), payload)
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentCalendarKeys.upcoming(brandId) })
      qc.invalidateQueries({ queryKey: contentCalendarKeys.byContent(contentId) })
    },
  })
}

// Schedule recurring content
export function useScheduleRecurringContent(contentId: string, brandId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ScheduleRecurringContentRequest): Promise<ContentCalendar> => {
      const resp = await api.post<ContentCalendar>(endpoints.contentCalendar.scheduleRecurring(contentId), payload)
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentCalendarKeys.upcoming(brandId) })
      qc.invalidateQueries({ queryKey: contentCalendarKeys.byContent(contentId) })
    },
  })
}

// Cancel schedule
export function useCancelSchedule(scheduleId: string, brandId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.delete<boolean>(endpoints.contentCalendar.cancelSchedule(scheduleId))
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentCalendarKeys.upcoming(brandId) })
    },
  })
}

// Update schedule
export function useUpdateSchedule(scheduleId: string, brandId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { scheduledDate: string; scheduledTime?: string }): Promise<boolean> => {
      const resp = await api.put<boolean>(endpoints.contentCalendar.updateSchedule(scheduleId), payload)
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentCalendarKeys.upcoming(brandId) })
    },
  })
}

// Get team schedules
export function useTeamSchedules(teamId: string, limit = 50) {
  return useQuery({
    queryKey: [...contentCalendarKeys.all, 'team', teamId, limit],
    queryFn: async (): Promise<ContentCalendar[]> => {
      const resp = await api.get<ContentCalendar[]>(endpoints.contentCalendar.byTeam(teamId, limit))
      return resp.data
    },
    enabled: !!teamId,
  })
}