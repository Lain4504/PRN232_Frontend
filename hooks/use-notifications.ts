import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api, endpoints, PaginatedResponse } from '@/lib/api'
import { Notification, NotificationFilters } from '@/lib/types/aisam-types'

// Query Keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters?: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
}

// Get notifications for current user
export function useGetNotifications(filters?: NotificationFilters & { page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: async (): Promise<PaginatedResponse<Notification>> => {
      const params = new URLSearchParams({
        page: (filters?.page || 1).toString(),
        pageSize: (filters?.pageSize || 20).toString(),
        // Backend expects `unread=true` to filter unread items
        ...(filters?.isRead !== undefined && { unread: (!filters.isRead).toString() }),
        ...(filters?.type && { type: filters.type }),
      })
      
      const response = await api.get<PaginatedResponse<Notification>>(`${endpoints.notifications()}?${params}`)
      return response.data
    },
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error instanceof Error && error.message.includes('401')) {
        return false
      }
      return failureCount < 2
    },
  })
}

// Mark notification as read
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.post(endpoints.markNotificationAsRead(notificationId))
    },
    onSuccess: (_, notificationId) => {
      // Update all notification lists in cache
      queryClient.setQueriesData(
        { queryKey: notificationKeys.lists() },
        (old: PaginatedResponse<Notification> | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map(notification =>
              notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification
            )
          }
        }
      )
      // Invalidate unread count to refetch
      queryClient.invalidateQueries({ queryKey: [...notificationKeys.all, 'unread-count'] })
    },
  })
}


// Mark all notifications as read
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.post(endpoints.markAllNotificationsAsRead())
    },
    onSuccess: () => {
      // Update all notification lists in cache - mark all as read
      queryClient.setQueriesData(
        { queryKey: notificationKeys.lists() },
        (old: PaginatedResponse<Notification> | undefined) => {
          if (!old) return old
          return {
            ...old,
            data: old.data.map(notification => ({ ...notification, isRead: true }))
          }
        }
      )
      // Invalidate unread count to refetch
      queryClient.invalidateQueries({ queryKey: [...notificationKeys.all, 'unread-count'] })
    },
  })
}

// Get unread notification count
export function useGetUnreadNotificationCount() {
  return useQuery({
    queryKey: [...notificationKeys.all, 'unread-count'],
    queryFn: async (): Promise<number> => {
      const response = await api.get<number>(endpoints.getUnreadNotificationCount())
      return response.data
    },
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error instanceof Error && error.message.includes('401')) {
        return false
      }
      return failureCount < 2
    },
    // Refetch every 30 seconds to keep count updated
    refetchInterval: 30000,
  })
}

// Lightweight alias for components expecting `useUnreadNotificationsCount`
export function useUnreadNotificationsCount() {
  return useGetUnreadNotificationCount()
}

// Legacy hook for backward compatibility
export function useNotifications(filters?: NotificationFilters & { page?: number; pageSize?: number }) {
  const { data, isLoading, error, refetch } = useGetNotifications(filters)
  const markAsReadMutation = useMarkNotificationAsRead()
  const markAllAsReadMutation = useMarkAllNotificationsAsRead()

  const markAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId)
      return true
    } catch (err) {
      console.error('Error marking notification as read:', err)
      return false
    }
  }


  const markAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync()
      return true
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      return false
    }
  }

  const fetchNotifications = async (pageNum?: number) => {
    await refetch()
  }

  return {
    notifications: data?.data || [],
    loading: isLoading,
    error: error?.message || null,
    total: data?.totalCount || 0,
    page: data?.page || 1,
    pageSize: data?.pageSize || 10,
    totalPages: data ? Math.ceil(data.totalCount / data.pageSize) : 0,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    hasNextPage: data ? data.page * data.pageSize < data.totalCount : false,
    hasPreviousPage: data ? data.page > 1 : false,
  }
}
