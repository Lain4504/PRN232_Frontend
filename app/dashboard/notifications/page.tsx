"use client"

import { useState } from "react"
import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Bell,
  AlertCircle,
  Calendar,
  TrendingUp,
  Lightbulb,
  Settings,
  CheckCheck,
} from "lucide-react"
import { Notification } from "@/lib/types/aisam-types"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { NotificationListSkeleton } from "@/components/ui/notification-skeleton"

const getNotificationIcon = (type: Notification['type'] | number) => {
  switch (type) {
    case 'ApprovalNeeded':
    case 0:
      return <AlertCircle className="h-4 w-4 text-orange-500" />
    case 'PostScheduled':
    case 1:
      return <Calendar className="h-4 w-4 text-blue-500" />
    case 'PerformanceAlert':
    case 2:
      return <TrendingUp className="h-4 w-4 text-red-500" />
    case 'AiSuggestion':
    case 3:
      return <Lightbulb className="h-4 w-4 text-yellow-500" />
    case 'SystemUpdate':
    case 4:
      return <Settings className="h-4 w-4 text-gray-500" />
    default:
      return <Bell className="h-4 w-4 text-gray-500" />
  }
}

const getNotificationPriority = (type: Notification['type'] | number) => {
  switch (type) {
    case 'ApprovalNeeded':
    case 0:
      return 'high'
    case 'PerformanceAlert':
    case 2:
      return 'high'
    case 'PostScheduled':
    case 1:
      return 'medium'
    case 'AiSuggestion':
    case 3:
      return 'low'
    case 'SystemUpdate':
    case 4:
      return 'low'
    default:
      return 'medium'
  }
}

const NotificationItem = ({
  notification,
  onMarkAsRead
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
}) => {
  const priority = getNotificationPriority(notification.type)

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div
      className={cn(
        "p-4 hover:bg-muted/50 cursor-pointer transition-colors group relative",
        !notification.isRead && 'bg-primary/5 border-l-4 border-l-primary',
        priority === 'high' && !notification.isRead && 'bg-destructive/5 border-l-destructive'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className="text-sm font-medium text-foreground truncate">
              {notification.title}
            </h4>
            <div className="flex items-center gap-1 ml-2">
              {!notification.isRead && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
            {priority === 'high' && (
              <Badge variant="destructive" className="text-xs">
                High Priority
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [currentPage, setCurrentPage] = useState(1)

  // Use single data source - always get all notifications
  const {
    notifications,
    loading,
    total,
    page,
    totalPages,
    markAsRead,
    markAllAsRead,
    hasNextPage,
    hasPreviousPage
  } = useNotifications({ page: currentPage, pageSize: 20 })

  const handleMarkAllAsRead = async () => {
    try {
      console.log('Marking all notifications as read...')
      const result = await markAllAsRead()
      console.log('Mark all as read result:', result)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="container mx-auto py-4 px-4 sm:py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>
        <p className="text-muted-foreground">
          Stay updated with your latest activities and alerts
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-xs">
            {total} total notifications
          </Badge>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <Button 
          variant="link" 
          onClick={handleMarkAllAsRead} 
          className="flex items-center gap-2 w-full sm:w-auto text-sm"
        >
          <CheckCheck className="h-4 w-4" />
          Mark All as Read
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <NotificationListSkeleton count={10} />
      ) : notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
          <p className="text-muted-foreground">
            You&apos;ll see your notifications here when you have any activity.
          </p>
        </div>
      ) : (
        <>
          {/* Notifications List */}
          <div className="space-y-1 bg-card rounded-lg border">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center mt-4 sm:mt-6 gap-4">
              <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (hasPreviousPage && !loading) {
                        handlePageChange(page - 1)
                      }
                    }}
                    className={!hasPreviousPage || loading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {/* Show page numbers */}
                {(() => {
                  const pages = []
                  
                  // Always show first page
                  if (page > 3) {
                    pages.push(
                      <PaginationItem key={1}>
                        <PaginationLink 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (!loading) handlePageChange(1)
                          }}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                    )
                    if (page > 4) {
                      pages.push(
                        <PaginationItem key="ellipsis1">
                          <span className="px-3 py-2 text-muted-foreground">...</span>
                        </PaginationItem>
                      )
                    }
                  }
                  
                  // Show pages around current page
                  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
                    pages.push(
                      <PaginationItem key={i}>
                        <PaginationLink 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (!loading) handlePageChange(i)
                          }}
                          isActive={i === page}
                          className="cursor-pointer"
                        >
                          {i}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  }
                  
                  // Always show last page
                  if (page < totalPages - 2) {
                    if (page < totalPages - 3) {
                      pages.push(
                        <PaginationItem key="ellipsis2">
                          <span className="px-3 py-2 text-muted-foreground">...</span>
                        </PaginationItem>
                      )
                    }
                    pages.push(
                      <PaginationItem key={totalPages}>
                        <PaginationLink 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (!loading) handlePageChange(totalPages)
                          }}
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  }
                  
                  return pages
                })()}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (hasNextPage && !loading) {
                        handlePageChange(page + 1)
                      }
                    }}
                    className={!hasNextPage || loading ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  )
}