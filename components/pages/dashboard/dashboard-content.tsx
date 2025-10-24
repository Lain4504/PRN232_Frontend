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
  TrendingUp,
  Users,
  Zap,
  Sparkles,
  Eye,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react"
// Removed mock-api import - using real API instead
import { User, DashboardStats, RecentActivity } from "@/lib/types/aisam-types"
import { api, endpoints } from "@/lib/api"
import { QuickActionsPanel } from "./quick-actions-panel"
import { CurrentPlanCard } from "@/components/subscription/current-plan-card"

// Enhanced Stats Cards Data with better visualization
const getStatsData = (stats: DashboardStats) => [
  {
    title: "Total Brands",
    value: stats.total_brands.toString(),
    change: "+5.2%",
    trend: "up",
    icon: Target,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    borderColor: "border-chart-1/20",
    description: "Active brand profiles",
    href: "/dashboard/brands"
  },
  {
    title: "Total Contents",
    value: stats.total_contents.toString(),
    change: "+8.4%", 
    trend: "up",
    icon: FileText,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    borderColor: "border-chart-3/20",
    description: "AI-generated content",
    href: "/dashboard/contents"
  },
  {
    title: "Published Posts",
    value: stats.total_posts.toString(),
    change: "+15.2%",
    trend: "up", 
    icon: Send,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    borderColor: "border-chart-4/20",
    description: "Social media posts",
    href: "/dashboard/posts"
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
        const userResponse = await api.get<User>(endpoints.userProfile)
        if (userResponse.success) {
          setUser(userResponse.data)
        }
        
        // Get dashboard stats - using a custom endpoint or calculating from other data
        // For now, we'll create a mock stats object based on available data
        const statsResponse = await api.get<DashboardStats>('/dashboard/stats')
        if (statsResponse.success) {
          setStats(statsResponse.data)
        }
        
        // Get recent activities - using a custom endpoint
        const activitiesResponse = await api.get<RecentActivity[]>('/dashboard/activities')
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
    <div className="flex-1 space-y-4 p-4 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Welcome back, {user?.first_name || user?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="text-sm text-muted-foreground">
                Here&apos;s what&apos;s happening with your AISAM campaigns today.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="text-xs px-3 py-1.5">
            <Link href="/dashboard?filter=open">
              <Filter className="mr-1 h-3 w-3" />
              Filter
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="text-xs px-3 py-1.5">
            <Link href="/dashboard/insights">
              <TrendingUp className="mr-1 h-3 w-3" />
              Analytics
            </Link>
          </Button>
          <Button asChild size="sm" className="text-xs px-3 py-1.5">
            <Link href="/dashboard/brands">
              <Plus className="mr-1 h-3 w-3" />
              New Brand
            </Link>
          </Button>
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {stats && getStatsData(stats).map((stat, index) => (
          <Card key={index} className={`group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${stat.borderColor} hover:scale-[1.02]`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <div className="space-y-0.5">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground/70">{stat.description}</p>
              </div>
              <div className={`p-1.5 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="space-y-1">
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs">
                  {stat.trend === 'up' ? (
                    <ArrowUpIcon className="mr-1 h-3 w-3 text-chart-2" />
                  ) : (
                    <ArrowDownIcon className="mr-1 h-3 w-3 text-destructive" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-chart-2 font-medium' : 'text-destructive font-medium'}>
                    {stat.change}
                  </span>
                  <span className="ml-1 text-muted-foreground/70 text-xs">from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription className="text-xs">
                    Latest actions in your AISAM campaigns
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="text-xs px-2 py-1">
                  <Link href="/dashboard/activity">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-2">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {activity.user_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">
                        <span className="text-foreground">{activity.user_name}</span>
                        <span className="text-muted-foreground"> {activity.title}</span>
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
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

        {/* Compact Quick Actions & Stats */}
        <div className="space-y-4">
          
          {/* Current Plan Card */}
          <CurrentPlanCard showUsage={true} showActions={true} />

          {/* Compact Quick Actions Panel */}
          <QuickActionsPanel />

          {/* Compact Campaign Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Activity className="h-4 w-4 text-primary" />
                Campaign Status
              </CardTitle>
              <CardDescription className="text-xs">
                Current campaign health and system status
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-chart-4" />
                  <span className="text-xs font-medium">Pending Approvals</span>
                </div>
                <Badge variant="secondary" className="bg-chart-4/10 text-chart-4 border-chart-4/20 text-xs px-2 py-0.5">
                  {stats?.pending_approvals || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-chart-1" />
                  <span className="text-xs font-medium">Scheduled Posts</span>
                </div>
                <Badge variant="secondary" className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-xs px-2 py-0.5">
                  {stats?.scheduled_posts || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-chart-2" />
                  <span className="text-xs font-medium">AI Generation</span>
                </div>
                <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-xs px-2 py-0.5">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Share2 className="h-3 w-3 text-chart-3" />
                  <span className="text-xs font-medium">Social Accounts</span>
                </div>
                <Badge variant="secondary" className="bg-chart-3/10 text-chart-3 border-chart-3/20 text-xs px-2 py-0.5">
                  Connected
                </Badge>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Compact Today's Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Today&apos;s Overview
          </CardTitle>
          <CardDescription className="text-xs">
            Key metrics for today ({new Date().toLocaleDateString()})
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1 p-3 rounded-lg bg-chart-2/5 border border-chart-2/20">
              <div className="flex items-center gap-2">
                <FileText className="h-3 w-3 text-chart-2" />
                <p className="text-xs font-medium text-muted-foreground">Content Created</p>
              </div>
              <p className="text-xl font-bold">5</p>
              <p className="text-xs text-chart-2 font-medium">+2 from yesterday</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-chart-1/5 border border-chart-1/20">
              <div className="flex items-center gap-2">
                <Send className="h-3 w-3 text-chart-1" />
                <p className="text-xs font-medium text-muted-foreground">Posts Published</p>
              </div>
              <p className="text-xl font-bold">12</p>
              <p className="text-xs text-chart-1 font-medium">Across all platforms</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-chart-4/5 border border-chart-4/20">
              <div className="flex items-center gap-2">
                <Heart className="h-3 w-3 text-chart-4" />
                <p className="text-xs font-medium text-muted-foreground">Engagement Rate</p>
              </div>
              <p className="text-xl font-bold">8.4%</p>
              <p className="text-xs text-chart-4 font-medium">Above average</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg bg-chart-3/5 border border-chart-3/20">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-chart-3" />
                <p className="text-xs font-medium text-muted-foreground">AI Generations</p>
              </div>
              <p className="text-xl font-bold">23</p>
              <p className="text-xs text-chart-3 font-medium">Content & images</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

export default DashboardContent