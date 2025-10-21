"use client"

import { Bell, AlertCircle, Calendar, TrendingUp, Lightbulb, Settings, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Inbox, Archive } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/hooks/use-notifications"
import { Notification } from "@/lib/types/aisam-types"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

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

const NotificationItem = ({
  notification,
  onMarkAsRead
}: {
  notification: Notification
  onMarkAsRead: (id: string) => void
}) => {
  const router = useRouter()

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
    // Handle navigation based on notification type/target
    if (notification.targetType && notification.targetId) {
      // Navigate to relevant page based on target
      router.push(`/dashboard/${notification.targetType.toLowerCase()}s/${notification.targetId}`)
    }
  }

  return (
    <div
      className={`p-3 hover:bg-muted/50 cursor-pointer transition-colors ${
        !notification.isRead ? 'bg-blue-50/50 border-l-2 border-l-blue-500' : ''
      }`}
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
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  )
}

export function NotificationsDropdown() {
  const { notifications, loading, markAsRead } = useNotifications({ pageSize: 10 })
  const router = useRouter()

  const unreadNotifications = notifications.filter((n: Notification) => !n.isRead)
  const readNotifications = notifications.filter((n: Notification) => n.isRead)
  const unreadCount = unreadNotifications.length

  const handleViewAll = () => {
    router.push('/dashboard/notifications')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hidden sm:flex">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Notifications</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewAll}
              className="text-xs"
            >
              View All
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <Tabs defaultValue="inbox" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inbox" className="flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Inbox
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="archived" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Read
              </TabsTrigger>
            </TabsList>
            <TabsContent value="inbox" className="mt-2">
              <ScrollArea className="h-80">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  </div>
                ) : unreadNotifications.length === 0 ? (
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
                    {unreadNotifications.slice(0, 10).map((notification: Notification, index: number) => (
                      <div key={notification.id}>
                        <NotificationItem
                          notification={notification}
                          onMarkAsRead={markAsRead}
                        />
                        {index < unreadNotifications.slice(0, 10).length - 1 && <Separator />}
                      </div>
                    ))}
                    {unreadNotifications.length > 10 && (
                      <div className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleViewAll}
                          className="text-xs"
                        >
                          View {unreadNotifications.length - 10} more...
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="archived" className="mt-2">
              <ScrollArea className="h-80">
                {readNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                      <Archive className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h4 className="font-semibold text-lg mb-3">No read notifications</h4>
                    <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                      Read notifications will appear here.
                    </p>
                  </div>
                ) : (
                  <div>
                    {readNotifications.slice(0, 10).map((notification: Notification, index: number) => (
                      <div key={notification.id}>
                        <NotificationItem
                          notification={notification}
                          onMarkAsRead={markAsRead}
                        />
                        {index < readNotifications.slice(0, 10).length - 1 && <Separator />}
                      </div>
                    ))}
                    {readNotifications.length > 10 && (
                      <div className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleViewAll}
                          className="text-xs"
                        >
                          View {readNotifications.length - 10} more...
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
