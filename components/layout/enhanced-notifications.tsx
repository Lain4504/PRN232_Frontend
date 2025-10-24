"use client"

import { Bell, AlertCircle, Calendar, TrendingUp, Lightbulb, Settings, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Inbox } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotifications, useGetUnreadNotificationCount } from "@/hooks/use-notifications"
import { Notification } from "@/lib/types/aisam-types"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { NotificationSkeleton } from "@/components/ui/notification-skeleton"

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
    // Handle navigation based on notification type/target
    if (notification.targetType && notification.targetId) {
      // Navigate to relevant page based on target
      window.location.href = `/dashboard/${notification.targetType.toLowerCase()}s/${notification.targetId}`
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

export function EnhancedNotifications() {
  const { notifications, loading, markAsRead } = useNotifications({ pageSize: 20 })
  const { data: unreadCount = 0, isLoading: unreadCountLoading } = useGetUnreadNotificationCount()

  const handleViewAll = () => {
    window.location.href = '/dashboard/notifications'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {!unreadCountLoading && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Notifications</h3>
          </div>
        </div>
        <ScrollArea className="h-80">
          {loading ? (
            <div className="space-y-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index}>
                  <NotificationSkeleton />
                  {index < 4 && <Separator />}
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Inbox className="h-10 w-10 text-muted-foreground" />
              </div>
              <h4 className="font-semibold text-lg mb-3">All caught up</h4>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                You will be notified here for any notices on your projects and activities.
              </p>
            </div>
          ) : (
            <div>
              {notifications.slice(0, 10).map((notification: Notification, index: number) => (
                <div key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                  {index < notifications.slice(0, 10).length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            className="w-full text-xs justify-center"
          >
            View All Notifications
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
