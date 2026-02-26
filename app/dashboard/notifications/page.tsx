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
import { Notification } from "@/lib/types/omniadly-types"
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
        "p-6 hover:bg-muted/30 cursor-pointer transition-all duration-300 group relative border-b border-border/40 last:border-0",
        !notification.isRead && 'bg-primary/5 after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-primary',
        priority === 'high' && !notification.isRead && 'after:bg-destructive'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-5">
        <div className={cn(
          "size-10 rounded-md flex items-center justify-center border transition-all duration-300 shadow-sm shrink-0",
          !notification.isRead ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/50 border-border/50 text-muted-foreground/40"
        )}>
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-start justify-between gap-4">
            <h4 className={cn(
              "text-sm font-bold tracking-tight italic uppercase truncate transition-colors",
              !notification.isRead ? "text-foreground" : "text-muted-foreground/60"
            )}>
              {notification.title}
            </h4>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-muted-foreground/30 italic uppercase tracking-tighter">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
              {!notification.isRead && (
                <div className="size-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
              )}
            </div>
          </div>
          <p className={cn(
            "text-xs leading-relaxed font-medium italic",
            !notification.isRead ? "text-muted-foreground" : "text-muted-foreground/40"
          )}>
            {notification.message}
          </p>
          <div className="flex items-center gap-3 pt-1">
            {priority === 'high' && (
              <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest px-2 py-0 border-destructive/20 text-destructive bg-destructive/5 italic">
                Cấp thiết • High Priority
              </Badge>
            )}
            <span className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-widest italic group-hover:text-primary/40 transition-colors">
              Node Insight #{notification.id.substring(0, 6)}
            </span>
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-10 transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/5 text-primary border border-primary/10">
              <Bell className="size-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">Hệ thống Cảnh báo • Signal Node</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight italic uppercase">
            Trung tâm Thông báo
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl italic leading-relaxed">
            Hợp nhất các tín hiệu phản hồi và cảnh báo hệ thống từ toàn bộ các Node vận hành.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleMarkAllAsRead}
          className="h-11 px-6 rounded-md border-border font-bold text-[10px] uppercase tracking-widest italic hover:bg-muted shadow-sm transition-all hover:-translate-y-0.5"
        >
          <CheckCheck className="mr-2 size-4" />
          Đánh dấu đã đọc tất cả
        </Button>
      </div>

      <div className="flex items-center gap-4 py-8">
        <Badge variant="outline" className="h-8 px-4 rounded-md border-border/50 bg-muted/20 text-[10px] font-bold uppercase tracking-widest italic text-muted-foreground">
          Tổng cộng: {total} Tín hiệu
        </Badge>
        {unreadCount > 0 && (
          <Badge variant="outline" className="h-8 px-4 rounded-md border-primary/20 bg-primary/5 text-[10px] font-bold uppercase tracking-widest italic text-primary">
            {unreadCount} Tin nhắn mới
          </Badge>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <NotificationListSkeleton count={10} />
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center group">
          <div className="size-20 rounded-full bg-muted/10 flex items-center justify-center mb-8 border border-border/50 shadow-inner group-hover:rotate-12 transition-transform duration-500">
            <Bell className="size-10 text-muted-foreground/20" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3 italic uppercase tracking-tight">Hệ thống Đang im lặng</h3>
          <p className="text-sm font-medium text-muted-foreground/40 max-w-sm italic">
            Hiện chưa có tín hiệu mới nào được ghi nhận từ hệ sinh thái Node.
          </p>
        </div>
      ) : (
        <>
          <div className="bg-card rounded-lg border border-border/50 shadow-sm overflow-hidden">
            <div className="divide-y divide-border/40">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
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
