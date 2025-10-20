"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Target, 
  Package, 
  FileText, 
  Activity,
  Calendar,
  Plus,
  Filter,
  ArrowUpIcon,
  ArrowDownIcon,
  Clock,
  Send,
} from "lucide-react"
import { authApi, dashboardApi } from "@/lib/mock-api"
import { User, DashboardStats, RecentActivity } from "@/lib/types/aisam-types"

// Stats Cards Data - will be populated from API
const getStatsData = (stats: DashboardStats) => [
  {
    title: "Total Brands",
    value: stats.total_brands.toString(),
    change: "+5.2%",
    trend: "up",
    icon: Target,
    color: "text-chart-1",
  },
  {
    title: "Total Products", 
    value: stats.total_products.toString(),
    change: "+12.8%",
    trend: "up",
    icon: Package,
    color: "text-chart-2",
  },
  {
    title: "Total Contents",
    value: stats.total_contents.toString(),
    change: "+8.4%", 
    trend: "up",
    icon: FileText,
    color: "text-chart-3",
  },
  {
    title: "Published Posts",
    value: stats.total_posts.toString(),
    change: "+15.2%",
    trend: "up", 
    icon: Send,
    color: "text-chart-4",
  },
]

// Recent Activities Data - will be populated from API

const DashboardContent = () => {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        // Get current user
        const userResponse = await authApi.getCurrentUser()
        if (userResponse.success) {
          setUser(userResponse.data)
        }
        
        // Get dashboard stats
        const statsResponse = await dashboardApi.getDashboardStats()
        if (statsResponse.success) {
          setStats(statsResponse.data)
        }
        
        // Get recent activities
        const activitiesResponse = await dashboardApi.getRecentActivities()
        if (activitiesResponse.success) {
          setRecentActivities(activitiesResponse.data)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboardData()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "content_created":
        return <FileText className="h-4 w-4 text-chart-2" />
      case "post_published":
        return <Send className="h-4 w-4 text-chart-1" />
      case "approval_requested":
        return <Clock className="h-4 w-4 text-chart-4" />
      case "brand_created":
        return <Target className="h-4 w-4 text-chart-3" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 bg-background">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.first_name || user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your AISAM campaigns today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard?filter=open">
            <Filter className="mr-2 h-4 w-4" />
            Filter
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dashboard/brands">
            <Plus className="mr-2 h-4 w-4" />
            Manage Brands
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats && getStatsData(stats).map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.trend === 'up' ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3 text-chart-2" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3 text-destructive" />
                )}
                <span className={stat.trend === 'up' ? 'text-chart-2' : 'text-destructive'}>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest actions in your AISAM campaigns
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/activity">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {activity.user_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        <span className="text-foreground">{activity.user_name}</span>
                        <span className="text-muted-foreground"> {activity.title}</span>
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {activity.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
        </Card>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/brands">
                  <Target className="mr-2 h-4 w-4" />
                  Manage Brands
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/products">
                  <Package className="mr-2 h-4 w-4" />
                  Manage Products
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/contents/new">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Content
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/dashboard/calendar">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Posts
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Campaign Status */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Status</CardTitle>
              <CardDescription>
                Current campaign health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Approvals</span>
                <Badge variant="secondary" className="bg-chart-4/10 text-chart-4">
                  {stats?.pending_approvals || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Scheduled Posts</span>
                <Badge variant="secondary" className="bg-chart-1/10 text-chart-1">
                  {stats?.scheduled_posts || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Generation</span>
                <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Social Accounts</span>
                <Badge variant="secondary" className="bg-chart-3/10 text-chart-3">
                  Connected
                </Badge>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Additional Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Overview</CardTitle>
          <CardDescription>
            Key metrics for today ({new Date().toLocaleDateString()})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Content Created</p>
              <p className="text-2xl font-bold">5</p>
              <p className="text-xs text-chart-2">+2 from yesterday</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Posts Published</p>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-chart-1">Across all platforms</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Engagement Rate</p>
              <p className="text-2xl font-bold">8.4%</p>
              <p className="text-xs text-chart-4">Above average</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">AI Generations</p>
              <p className="text-2xl font-bold">23</p>
              <p className="text-xs text-chart-3">Content & images</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardContent