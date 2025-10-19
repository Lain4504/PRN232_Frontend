import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '@/lib/api'
import { Notification, NotificationFilters } from '@/lib/types/aisam-types'

export function useNotifications(filters?: NotificationFilters) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const loadingRef = useRef(false)

  const fetchNotifications = useCallback(async (pageNum = 1) => {
    if (loadingRef.current) return // Prevent multiple concurrent requests

    loadingRef.current = true
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        pageSize: pageSize.toString(),
        // Backend expects `unread=true` to filter unread items
        ...(filters?.isRead !== undefined && { unread: (!filters.isRead).toString() }),
        ...(filters?.type && { type: filters.type }),
      })

      const response = await api.get(`/notifications?${params}`)
      const data = response.data as { data: Notification[], totalCount: number, page: number, pageSize: number }

      setNotifications(data.data || [])
      setTotal(data.totalCount || 0)
      setPage(pageNum)
    } catch (err) {
      setError('Failed to fetch notifications')
      console.error('Error fetching notifications:', err)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [filters?.isRead, filters?.type, pageSize])

  const markAsRead = async (notificationId: string) => {
    try {
      await api.post(`/notifications/${notificationId}/read`)
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      )
      return true
    } catch (err) {
      console.error('Error marking notification as read:', err)
      return false
    }
  }

  const markBulkAsRead = async (notificationIds: string[]) => {
    try {
      // Backend endpoint: POST /notifications/read/bulk with body { ids: Guid[] }
      await api.post('/notifications/read/bulk', { ids: notificationIds })
      setNotifications(prev =>
        prev.map(notification =>
          notificationIds.includes(notification.id)
            ? { ...notification, isRead: true }
            : notification
        )
      )
      return true
    } catch (err) {
      console.error('Error marking bulk notifications as read:', err)
      return false
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    loading,
    error,
    total,
    page,
    pageSize,
    fetchNotifications,
    markAsRead,
    markBulkAsRead,
    hasNextPage: page * pageSize < total,
    hasPreviousPage: page > 1,
  }
}
