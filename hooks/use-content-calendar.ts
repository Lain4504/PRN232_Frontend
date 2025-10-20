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
  upcoming: () => [...contentCalendarKeys.all, 'upcoming'] as const,
  byContent: (contentId: string) => [...contentCalendarKeys.all, 'content', contentId] as const,
}

// Get upcoming scheduled posts
export function useUpcomingSchedules(limit = 50) {
  return useQuery({
    queryKey: [...contentCalendarKeys.upcoming(), limit],
    queryFn: async (): Promise<ContentCalendar[]> => {
      const resp = await api.get<ContentCalendar[]>(endpoints.contentCalendar.upcoming(limit))
      return resp.data
    },
  })
}

// Schedule content
export function useScheduleContent(contentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ScheduleContentRequest): Promise<ContentCalendar> => {
      const resp = await api.post<ContentCalendar>(endpoints.contentCalendar.schedule(contentId), payload)
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentCalendarKeys.upcoming() })
      qc.invalidateQueries({ queryKey: contentCalendarKeys.byContent(contentId) })
    },
  })
}

// Schedule recurring content
export function useScheduleRecurringContent(contentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ScheduleRecurringContentRequest): Promise<ContentCalendar> => {
      const resp = await api.post<ContentCalendar>(endpoints.contentCalendar.scheduleRecurring(contentId), payload)
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentCalendarKeys.upcoming() })
      qc.invalidateQueries({ queryKey: contentCalendarKeys.byContent(contentId) })
    },
  })
}

// Cancel schedule
export function useCancelSchedule(scheduleId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (): Promise<boolean> => {
      const resp = await api.delete<boolean>(endpoints.contentCalendar.cancelSchedule(scheduleId))
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentCalendarKeys.upcoming() })
    },
  })
}

// Update schedule
export function useUpdateSchedule(scheduleId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { scheduledDate: string; scheduledTime?: string }): Promise<boolean> => {
      const resp = await api.put<boolean>(endpoints.contentCalendar.updateSchedule(scheduleId), payload)
      return resp.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentCalendarKeys.upcoming() })
    },
  })
}
