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
import { Notification } from "@/lib/types/omniadly-types"
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
    if (notification.targetType && notification.targetId) {
      window.location.href = `/dashboard/${notification.targetType.toLowerCase()}s/${notification.targetId}`
    }
  }

  return (
    <div
      className={cn(
        "p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all duration-300 group relative",
        !notification.isRead && 'bg-slate-50/80 dark:bg-primary/5 border-l-4 border-l-slate-900 dark:border-l-primary',
        priority === 'high' && !notification.isRead && 'bg-rose-50/50 dark:bg-rose-500/5 border-l-rose-500'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        <div className="size-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm shrink-0 group-hover:scale-110 transition-transform">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn("text-xs font-black uppercase tracking-tight truncate", notification.isRead ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white")}>
              {notification.title}
            </h4>
            {!notification.isRead && (
              <div className="flex items-center gap-1 shrink-0">
                <div className="size-1.5 bg-slate-900 dark:bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-primary/50" />
              </div>
            )}
          </div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
          <div className="flex items-center justify-between mt-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
            {priority === 'high' && (
              <Badge variant="destructive" className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-500 border-none shadow-none">
                Ưu tiên cao
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
        <Button variant="ghost" size="icon" className="relative group hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-300">
          <Bell className="h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
          {!unreadCountLoading && unreadCount > 0 && (
            <div className="absolute top-0 right-0 h-4 w-4 bg-slate-900 dark:bg-primary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-in scale-in duration-300">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[380px] p-0 rounded-3xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/60 overflow-hidden" align="end">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-800/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <Bell className="size-4" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-[0.2em] text-slate-900 dark:text-white">Thông báo</h3>
            </div>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-slate-900 dark:bg-primary text-white border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">
                {unreadCount} Tin mới
              </Badge>
            )}
          </div>
        </div>
        <ScrollArea className="h-[420px]">
          {loading ? (
            <div className="p-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index}>
                  <NotificationSkeleton />
                  {index < 4 && <Separator className="bg-slate-50 dark:bg-slate-800/50" />}
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-8">
              <div className="size-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-8 shadow-sm border border-slate-100 dark:border-slate-800">
                <Inbox className="size-10 text-slate-200 dark:text-slate-700" />
              </div>
              <h4 className="font-black text-sm text-slate-900 dark:text-white mb-3 uppercase tracking-widest">Tuyệt vời!</h4>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-500 max-w-[200px] leading-relaxed uppercase tracking-tighter">
                Hộp thư của bạn đang ở trạng thái tối ưu. Không có thông báo mới nào cần xử lý.
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
                  {index < notifications.slice(0, 10).length - 1 && <Separator className="bg-slate-50 dark:bg-slate-800/50" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewAll}
            className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl h-10 transition-all"
          >
            Xem tất cả thông báo
            <ExternalLink className="size-3 ml-2 opacity-50" />
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
