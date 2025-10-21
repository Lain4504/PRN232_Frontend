"use client"

import { useState } from "react"
import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertCircle,
  Calendar,
  TrendingUp,
  Lightbulb,
  Settings,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react"
import { Notification } from "@/lib/types/aisam-types"
import { formatDistanceToNow } from "date-fns"

const getNotificationIcon = (type: Notification['type'] | number) => {
  switch (type) {
    case 0:
      return <AlertCircle className="h-5 w-5 text-orange-500" />
    case 1:
      return <Calendar className="h-5 w-5 text-blue-500" />
    case 2:
      return <TrendingUp className="h-5 w-5 text-red-500" />
    case 3:
      return <Lightbulb className="h-5 w-5 text-yellow-500" />
    case 4:
      return <Settings className="h-5 w-5 text-gray-500" />
    default:
      return <AlertCircle className="h-5 w-5 text-gray-500" />
  }
}

const NotificationItem = ({
  notification,
  isSelected,
  onSelect,
  onMarkAsRead
}: {
  notification: Notification
  isSelected: boolean
  onSelect: (id: string, selected: boolean) => void
  onMarkAsRead: (id: string) => void
}) => {

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div
      className={`p-3 sm:p-4 hover:bg-muted/50 cursor-pointer transition-colors border rounded-lg ${!notification.isRead ? 'bg-blue-50/30 border-l-4 border-l-blue-500' : 'border-border'
        }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(notification.id, checked as boolean)}
          onClick={(e) => e.stopPropagation()}
          disabled={notification.isRead}
          className="mt-1 flex-shrink-0"
        />
        <div className="flex-shrink-0 mt-0.5">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <h4 className="text-sm font-medium text-foreground">
              {notification.title}
            </h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!notification.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {notification.message}
          </p>
          {notification.targetType && (
            <p className="text-xs text-muted-foreground mt-1">
              Related to: {notification.targetType}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())

  // Independent data sources per tab
  const {
    notifications: allNotifications,
    loading: loadingAll,
    total: totalAll,
    page: pageAll,
    pageSize: pageSizeAll,
    fetchNotifications: fetchAll,
    markAsRead: markAsReadAll,
    markBulkAsRead: _markBulkAsReadAll,
    hasNextPage: hasNextAll,
    hasPreviousPage: hasPrevAll
  } = useNotifications()

  const {
    notifications: unreadNotifications,
    loading: loadingUnread,
    total: totalUnread,
    page: pageUnread,
    pageSize: pageSizeUnread,
    fetchNotifications: fetchUnread,
    markAsRead: markAsReadUnread,
    markBulkAsRead: markBulkAsReadUnread,
    hasNextPage: hasNextUnread,
    hasPreviousPage: hasPrevUnread
  } = useNotifications({ isRead: false })

  const handleSelectNotification = (id: string, selected: boolean) => {
    const newSelected = new Set(selectedNotifications)
    if (selected) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedNotifications(newSelected)
  }


  const handleBulkMarkAsRead = async () => {
    if (selectedNotifications.size > 0) {
      const ids = Array.from(selectedNotifications)
      // perform via unread hook, then refresh both lists
      await markBulkAsReadUnread(ids)
      await Promise.all([
        fetchAll(pageAll),
        fetchUnread(pageUnread)
      ])
      setSelectedNotifications(new Set())
    }
  }

  const handleMarkAllAsRead = async () => {
    const unreadIds = unreadNotifications.map(n => n.id)
    if (unreadIds.length === 0) return
    await markBulkAsReadUnread(unreadIds)
    await Promise.all([
      fetchAll(pageAll),
      fetchUnread(pageUnread)
    ])
  }

  const unreadCount = totalUnread
  const someSelected = selectedNotifications.size > 0
  const hasUnread = unreadCount > 0

  return (
    <div className="container mx-auto py-4 px-4 sm:py-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}>
        <TabsList className="grid w-full grid-cols-2 h-auto p-1">
          <TabsTrigger value="all" className="flex items-center gap-2 py-2 px-3 text-xs sm:text-sm">
            <span className="hidden sm:inline">All Notifications</span>
            <span className="sm:hidden">All</span>
            <Badge variant="secondary" className="ml-1">
              {totalAll}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2 py-2 px-3 text-xs sm:text-sm">
            <span className="hidden sm:inline">Unread</span>
            <span className="sm:hidden">New</span>
            <Badge variant="secondary" className="ml-1">
              {totalUnread}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl">All Notifications</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Stay updated with your latest activities and alerts
                  </p>
                </div>
                {someSelected ? (
                  <Button onClick={handleBulkMarkAsRead} className="flex items-center gap-2 w-full sm:w-auto">
                    <CheckCheck className="h-4 w-4" />
                    Mark {selectedNotifications.size} as Read
                  </Button>
                ) : hasUnread ? (
                  <Button onClick={handleMarkAllAsRead} className="flex items-center gap-2 w-full sm:w-auto">
                    <CheckCheck className="h-4 w-4" />
                    Mark All as Read
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              {loadingAll ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading notifications...</span>
                </div>
              ) : allNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
                  <p className="text-muted-foreground">
                    You&apos;ll see your notifications here when you have any activity.
                  </p>
                </div>
              ) : (
                <>
                  <div className="max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                    <div className="space-y-3 sm:space-y-4">
                      {allNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          isSelected={selectedNotifications.has(notification.id)}
                          onSelect={handleSelectNotification}
                          onMarkAsRead={async (id) => {
                            await markAsReadAll(id)
                            await Promise.all([
                              fetchAll(pageAll),
                              fetchUnread(pageUnread)
                            ])
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 sm:mt-6 gap-4">
                    <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                      Showing {((pageAll - 1) * pageSizeAll) + 1} to {Math.min(pageAll * pageSizeAll, totalAll)} of {totalAll} notifications
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchAll(pageAll - 1)}
                        disabled={!hasPrevAll || loadingAll}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {pageAll}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchAll(pageAll + 1)}
                        disabled={!hasNextAll || loadingAll}
                        className="flex items-center gap-1"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Unread Notifications</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Stay updated with your latest activities and alerts
                  </p>
                </div>
                {someSelected ? (
                  <Button onClick={handleBulkMarkAsRead} className="flex items-center gap-2 w-full sm:w-auto">
                    <CheckCheck className="h-4 w-4" />
                    Mark {selectedNotifications.size} as Read
                  </Button>
                ) : hasUnread ? (
                  <Button onClick={handleMarkAllAsRead} className="flex items-center gap-2 w-full sm:w-auto">
                    <CheckCheck className="h-4 w-4" />
                    Mark All as Read
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              {loadingUnread ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading notifications...</span>
                </div>
              ) : unreadNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">
                    You have no unread notifications.
                  </p>
                </div>
              ) : (
                <>
                  <div className="max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                    <div className="space-y-3 sm:space-y-4">
                      {unreadNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          isSelected={selectedNotifications.has(notification.id)}
                          onSelect={handleSelectNotification}
                          onMarkAsRead={async (id) => {
                            await markAsReadUnread(id)
                            await Promise.all([
                              fetchAll(pageAll),
                              fetchUnread(pageUnread)
                            ])
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 sm:mt-6 gap-4">
                    <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                      Showing {((pageUnread - 1) * pageSizeUnread) + 1} to {Math.min(pageUnread * pageSizeUnread, totalUnread)} of {totalUnread} unread notifications
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchUnread(pageUnread - 1)}
                        disabled={!hasPrevUnread || loadingUnread}
                        className="flex items-center gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Previous</span>
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {pageUnread}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchUnread(pageUnread + 1)}
                        disabled={!hasNextUnread || loadingUnread}
                        className="flex items-center gap-1"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}