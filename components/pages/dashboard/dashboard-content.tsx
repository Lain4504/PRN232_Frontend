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
      title: "Total Teams",
      value: teamsVal.toString(),
      icon: Users,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      borderColor: "border-chart-2/20",
      description: "Teams you belong to",
      href: "/overview/teams"
    },
    {
      title: "Total Brands",
      value: stats.total_brands.toString(),
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
    <div className="flex-1 min-h-screen bg-background font-fira-sans selection:bg-primary/20">
      <div className="max-w-[1440px] mx-auto px-6 py-10 lg:px-10 lg:py-14 space-y-12">
        {/* Mission Control Header */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="h-2 w-8 bg-primary rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Terminal Intelligence</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tighter text-foreground leading-[1.1] selection:bg-primary/20">
              Welcome Back, <span className="text-primary italic tracking-tight">{user?.first_name || user?.email?.split('@')[0] || 'Operator'}</span>
            </h1>
            <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-xl">
              Platform state is nominal. All autonomous creative nodes are synchronized and performing within parameters.
            </p>
          </div>

          <div className="flex items-center gap-4 p-1">
            <Button variant="outline" className="h-11 px-6 rounded-xl border-border/40 bg-muted/20 hover:bg-muted/40 font-bold text-[10px] uppercase tracking-widest transition-all">
              <Filter className="h-3.5 w-3.5 mr-2 stroke-[2.5]" />
              Filter Domain
            </Button>
            <Button className="h-11 px-8 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Plus className="h-3.5 w-3.5 mr-2 stroke-[3]" />
              New Deployment
            </Button>
          </div>
        </div>

        {/* Global Performance Pulse - Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats && getStatsData(stats).map((stat, index) => (
            <Card key={index} className="group relative overflow-hidden border-border/40 bg-card/40 backdrop-blur-xl rounded-[2rem] p-4 shadow-2xl transition-all hover:translate-y-[-4px] hover:bg-card/60">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                <stat.icon className="h-20 w-20 stroke-[1]" />
              </div>
              <CardHeader className="pb-2">
                <div className={`h-10 w-10 rounded-xl ${stat.bgColor} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-inner`}>
                  <stat.icon className={`h-5 w-5 ${stat.color} stroke-[2.5]`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-4xl font-black text-foreground font-fira-mono tracking-tighter tabular-nums leading-none">
                  {stat.value}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.title}</div>
                  <div className="h-1 w-8 bg-primary/20 rounded-full" />
                </div>
                <p className="text-[9px] text-muted-foreground/50 font-medium tracking-tight pt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tactical Matrix Layout */}
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Action Hub - 5 cols */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-[3rem] blur-2xl opacity-50" />
            <QuickActionsPanel className="relative h-full border-border/40 bg-card/60 backdrop-blur-xl rounded-[2rem] shadow-2xl" />
          </div>

          {/* Neural Diagnostics - 7 cols */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="relative border-border/40 bg-card/60 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-20" />
              <CardHeader className="p-8 pb-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-primary animate-pulse stroke-[2.5]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70 italic">Dynamic Status</span>
                    </div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">System Dynamics</CardTitle>
                    <CardDescription className="text-sm font-medium">Real-time heuristics and workflow monitoring.</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 pt-4 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Status Node 1: Pending */}
                  <div className="group/node flex items-center justify-between p-5 rounded-[1.5rem] bg-background/40 border border-border/40 transition-all hover:bg-background/80 hover:border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-amber-600/10 flex items-center justify-center text-amber-600 shadow-inner group-hover/node:scale-110 transition-transform">
                        <Clock className="h-5 w-5 stroke-[2.5]" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-black text-xs uppercase tracking-wider">Queue</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Pending Validation</p>
                      </div>
                    </div>
                    <div className="text-2xl font-black font-fira-mono tracking-tighter">{stats?.pending_approvals || 0}</div>
                  </div>

                  {/* Status Node 2: Scheduled */}
                  <div className="group/node flex items-center justify-between p-5 rounded-[1.5rem] bg-background/40 border border-border/40 transition-all hover:bg-background/80 hover:border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-inner group-hover/node:scale-110 transition-transform">
                        <Calendar className="h-5 w-5 stroke-[2.5]" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-black text-xs uppercase tracking-wider">Protocol</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Automated Postings</p>
                      </div>
                    </div>
                    <div className="text-2xl font-black font-fira-mono tracking-tighter">{stats?.scheduled_posts || 0}</div>
                  </div>

                  {/* Status Node 3: AI Engine */}
                  <div className="group/node flex items-center justify-between p-5 rounded-[1.5rem] bg-background/40 border border-border/40 transition-all hover:bg-background/80 hover:border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover/node:scale-110 transition-transform">
                        <Sparkles className="h-5 w-5 stroke-[2.5]" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-black text-xs uppercase tracking-wider">Neural Hub</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Cognitive Services</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-none font-black text-[9px] px-3 py-1 rounded-lg">NOMINAL</Badge>
                  </div>

                  {/* Status Node 4: Accounts */}
                  <div className="group/node flex items-center justify-between p-5 rounded-[1.5rem] bg-background/40 border border-border/40 transition-all hover:bg-background/80 hover:border-primary/20">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 shadow-inner group-hover/node:scale-110 transition-transform">
                        <Share2 className="h-5 w-5 stroke-[2.5]" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-black text-xs uppercase tracking-wider">Matrix</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Social Integrations</p>
                      </div>
                    </div>
                    <Badge className="bg-indigo-600/20 text-indigo-600 border-none font-black text-[9px] px-3 py-1 rounded-lg">SYNCED</Badge>
                  </div>
                </div>

                {/* Analytical Insight Token */}
                <div className="relative p-6 rounded-[1.5rem] bg-primary/5 border border-primary/10 mt-6 group/insight overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/insight:scale-125 transition-transform duration-700">
                    <TrendingUp className="h-20 w-20" />
                  </div>
                  <div className="relative flex items-start gap-6">
                    <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-2xl shadow-primary/40 group-hover/insight:rotate-12 transition-transform">
                      <TrendingUp className="h-6 w-6 stroke-[3]" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">Efficiency Optimization Active</span>
                        <div className="h-1 w-1 rounded-full bg-primary animate-ping" />
                      </div>
                      <h4 className="text-lg font-black uppercase tracking-tight">Performance Vector Update</h4>
                      <p className="text-muted-foreground font-medium text-sm leading-relaxed tracking-tight">
                        Engagement metrics have experienced a <span className="text-primary font-black">+14.2%</span> delta this session.
                        AI engine recommends increasing asset density in TikTok campaign nodes.
                      </p>
                    </div>
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