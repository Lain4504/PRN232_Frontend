"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  FileText,
  Activity,
  Calendar,
  Plus,
  Filter,
  Clock,
  Send,
  TrendingUp,
  Users,
  Sparkles,
  Share2,
} from "lucide-react"
// Removed mock-api import - using real API instead
import { User, DashboardStats } from "@/lib/types/aisam-types"
import { api, endpoints } from "@/lib/api"
import { QuickActionsPanel } from "./quick-actions-panel"
// import { CurrentPlanCard } from "@/components/subscription/current-plan-card"

// Enhanced Stats Cards Data with better visualization
const getStatsData = (stats: DashboardStats) => {
  const teamsVal = stats.total_teams ?? 0
  return [
    {
      title: "Active Teams",
      value: teamsVal.toString(),
      icon: Users,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      borderColor: "border-chart-2/20",
      description: "Teams you belong to",
      href: "/overview/teams"
    },
    {
      title: "My Brands",
      value: stats.total_brands.toString(),
      icon: Target,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      borderColor: "border-chart-1/20",
      description: "Active brand profiles",
      href: "/dashboard/brands"
    },
    {
      title: "Generated Content",
      value: stats.total_contents.toString(),
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
      icon: Send,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      borderColor: "border-chart-4/20",
      description: "Social media posts",
      href: "/dashboard/posts"
    },
  ]
}

// Recent Activities Data - will be populated from API

const DashboardContent = () => {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
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

        // Get dashboard stats for current profile
        const statsResponse = await api.get<DashboardStats>(endpoints.dashboardStats())
        if (statsResponse.success) {
          const raw = statsResponse.data as unknown as Record<string, unknown>
          const toNumber = (value: unknown): number => {
            if (typeof value === 'number') return value
            if (typeof value === 'string') {
              const parsed = Number(value)
              return isNaN(parsed) ? 0 : parsed
            }
            return 0
          }
          const normalized: DashboardStats = {
            total_teams: toNumber(raw?.total_teams ?? raw?.teamsCount),
            total_brands: toNumber(raw?.total_brands ?? raw?.brandsCount ?? raw?.totalBrands ?? raw?.brands),
            total_products: toNumber(raw?.total_products ?? raw?.totalProducts),
            total_contents: toNumber(raw?.total_contents ?? raw?.totalContents),
            total_posts: toNumber(raw?.total_posts ?? raw?.totalPosts),
            pending_approvals: toNumber(raw?.pending_approvals ?? raw?.pendingApprovalsCount),
            scheduled_posts: toNumber(raw?.scheduled_posts ?? raw?.scheduledPosts),
          }
          setStats(normalized)
        }

        // Recent activities removed from dashboard UI
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Recent activity section removed

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
    <div className="flex-1 min-h-screen bg-background font-fira-sans">
      <div className="max-w-[1440px] mx-auto px-6 py-8 lg:px-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, <span className="font-semibold text-foreground">{user?.first_name || user?.email?.split('@')[0] || 'User'}</span>. Here is your overview for today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-lg h-10 px-4">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button className="rounded-lg h-10 px-4">
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats && getStatsData(stats).map((stat, index) => (
            <Card key={index} className="rounded-xl border shadow-sm hover:bg-muted/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Quick Actions */}
          <div className="lg:col-span-5">
            <QuickActionsPanel className="border rounded-xl shadow-sm" />
          </div>

          {/* Activity/Status */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-xl border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Activity Overview
                </CardTitle>
                <CardDescription>Recent updates across your workspace.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Item */}
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Pending</p>
                        <p className="text-xs text-muted-foreground">Approvals</p>
                      </div>
                    </div>
                    <div className="text-xl font-bold">{stats?.pending_approvals || 0}</div>
                  </div>

                  {/* Status Item */}
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Scheduled</p>
                        <p className="text-xs text-muted-foreground">Posts</p>
                      </div>
                    </div>
                    <div className="text-xl font-bold">{stats?.scheduled_posts || 0}</div>
                  </div>
                </div>

                {/* Insight */}
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 flex items-start gap-4">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary mt-0.5">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">Workspace Insight</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Your engagement has increased by <span className="text-primary font-medium">14.2%</span> this week. Keeping a consistent post schedule will help maintain this growth.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardContent