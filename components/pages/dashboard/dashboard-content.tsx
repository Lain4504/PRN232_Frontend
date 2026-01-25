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
} from "lucide-react"
import { User, DashboardStats } from "@/lib/types/omniadly-types"
import { api, endpoints } from "@/lib/api"
import { QuickActionsPanel } from "./quick-actions-panel"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { useProfile } from "@/lib/contexts/profile-context"
import { useTeamsByVendor } from "@/hooks/use-teams"
import { getActiveTeamId, setActiveTeamId, clearActiveTeamId } from "@/lib/utils/profile-utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const getStatsData = (stats: DashboardStats, t: (key: string) => string) => [
  {
    title: t("dashboard.stats.globalTeams"),
    value: stats.total_teams?.toString() || "0",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    description: t("dashboard.stats.connectedWorkspaces"),
    href: "/overview/teams"
  },
  {
    title: t("dashboard.stats.activeIdentities"),
    value: stats.total_brands.toString(),
    icon: Target,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: t("dashboard.stats.brandProfilesManaged"),
    href: "/dashboard/brands"
  },
  {
    title: t("dashboard.stats.forgeVault"),
    value: stats.total_contents.toString(),
    icon: FileText,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    description: t("dashboard.stats.aiAssetsGenerated"),
    href: "/dashboard/contents"
  },
  {
    title: t("dashboard.stats.distribution"),
    value: stats.total_posts.toString(),
    icon: Send,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    description: t("dashboard.stats.synchronizedPosts"),
    href: "/dashboard/posts"
  },
]

const DashboardContent = () => {
  const { t } = useTranslation("common")
  const { activeProfileId } = useProfile()
  const [selectedTeamId, setSelectedTeamId] = useState<string>(() => getActiveTeamId() || "all")
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const { data: teams = [] } = useTeamsByVendor(activeProfileId || undefined)

  // Sync selectedTeamId to localStorage
  useEffect(() => {
    if (selectedTeamId === "all") {
      clearActiveTeamId();
    } else {
      setActiveTeamId(selectedTeamId);
    }
  }, [selectedTeamId]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const userResp = await api.get<User>(endpoints.userProfile)
        if (userResp.success) setUser(userResp.data)

        const teamScope = selectedTeamId === "all" ? undefined : selectedTeamId
        const statsResp = await api.get<DashboardStats>(endpoints.dashboardStats(teamScope))
        if (statsResp.success) {
          const raw = statsResp.data as unknown as Record<string, unknown>
          const n = (v: unknown) => typeof v === 'number' ? v : (isNaN(Number(v)) ? 0 : Number(v))
          setStats({
            total_teams: n(raw?.total_teams ?? raw?.teamsCount),
            total_brands: n(raw?.total_brands ?? raw?.brandsCount ?? raw?.totalBrands ?? raw?.brands),
            total_products: n(raw?.total_products ?? raw?.totalProducts),
            total_contents: n(raw?.total_contents ?? raw?.totalContents),
            total_posts: n(raw?.total_posts ?? raw?.totalPosts),
            pending_approvals: n(raw?.pending_approvals ?? raw?.pendingApprovalsCount),
            scheduled_posts: n(raw?.scheduled_posts ?? raw?.scheduledPosts),
          })
        }
      } catch (e) {
        console.error('Core sync failed:', e)
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [selectedTeamId])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 animate-pulse">
      <div className="h-12 w-64 bg-muted rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-muted rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 h-[500px] bg-muted rounded-2xl" />
        <div className="lg:col-span-7 h-[500px] bg-muted rounded-2xl" />
      </div>
    </div>
  )

  return (
    <div className="flex-1 min-h-screen bg-background/50 font-fira-sans">
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-12 mb-20">
        {/* Banner Section */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8 p-10 rounded-3xl border bg-card/40 backdrop-blur-md shadow-2xl shadow-foreground/5">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">{t("dashboard.systemOnline")}</div>
                <span className="text-xs font-bold text-muted-foreground italic">{t("dashboard.lastUpdate")}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">
                {t("dashboard.title")} <span className="text-primary italic">{t("dashboard.accent")}</span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-lg leading-relaxed italic">
                {t("dashboard.welcome")}, <span className="text-foreground font-extrabold">{user?.first_name || user?.email?.split('@')[0]}</span>. {t("dashboard.subtitle")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {teams.length > 0 && (
                <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm p-2 rounded-2xl border border-primary/20 shadow-inner">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2">Scope:</span>
                  <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                    <SelectTrigger className="w-[180px] bg-transparent border-none focus:ring-0 font-bold text-xs uppercase tracking-tight">
                      <SelectValue placeholder={t("dashboard.fullWorkspace")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2">
                      <SelectItem value="all" className="font-bold text-[10px] uppercase italic">{t("dashboard.globalOverview")}</SelectItem>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id} className="font-bold text-[10px] uppercase">
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button variant="outline" size="lg" className="rounded-2xl h-14 px-8 border-2 font-bold hover:bg-muted/50">
                <Filter className="size-5 mr-3" />
                {t("dashboard.analyticsButton")}
              </Button>
            </div>
          </div>
        </div>

        {/* Intelligence Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats && getStatsData(stats, t).map((stat, i) => (
            <Card key={i} className="group relative overflow-hidden rounded-3xl border bg-card/40 hover:bg-card transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-foreground/5 cursor-pointer">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <stat.icon className="size-20 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
              </div>
              <CardHeader className="pb-2 flex flex-row items-center justify-between relative z-10">
                <div className={cn("p-2.5 rounded-xl border shadow-inner", stat.bgColor, stat.color)}>
                  <stat.icon className="size-5" />
                </div>
                <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-muted/50 border-none px-2">Realtime</Badge>
              </CardHeader>
              <CardContent className="relative z-10 pt-4">
                <div className="text-4xl font-black tracking-tight flex items-baseline gap-1">
                  {stat.value}
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Units</span>
                </div>
                <p className="text-sm font-bold text-foreground mt-2 italic group-hover:text-primary transition-colors">{stat.title}</p>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          {/* Quick Hub */}
          <div className="lg:col-span-5">
            <QuickActionsPanel className="h-full border-2 border-dashed bg-muted/5 rounded-3xl hover:bg-muted/10 transition-colors" />
          </div>

          {/* Performance Node */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-3xl border-2 bg-gradient-to-br from-card to-card/50 shadow-2xl shadow-foreground/5 overflow-hidden">
              <CardHeader className="py-8 px-10 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-black flex items-center gap-3 italic">
                      <Activity className="size-6 text-primary animate-pulse" />
                      {t("dashboard.operationsOutput")}
                    </CardTitle>
                    <CardDescription className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">{t("dashboard.globalEngagementIndex")}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-10 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="group flex items-center justify-between p-6 rounded-3xl border bg-background/50 hover:bg-muted/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className="size-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 transition-transform group-hover:scale-110 shadow-inner">
                        <Clock className="size-7" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-foreground italic uppercase tracking-tighter">{t("dashboard.pending")}</p>
                        <p className="text-xs font-bold text-muted-foreground">{t("dashboard.authQueue")}</p>
                      </div>
                    </div>
                    <div className="text-4xl font-black text-foreground italic">{stats?.pending_approvals || 0}</div>
                  </div>

                  <div className="group flex items-center justify-between p-6 rounded-3xl border bg-background/50 hover:bg-muted/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-5">
                      <div className="size-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110 shadow-inner">
                        <Calendar className="size-7" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-black text-foreground italic uppercase tracking-tighter">{t("dashboard.scheduled")}</p>
                        <p className="text-xs font-bold text-muted-foreground">{t("dashboard.syncHorizon")}</p>
                      </div>
                    </div>
                    <div className="text-4xl font-black text-foreground italic">{stats?.scheduled_posts || 0}</div>
                  </div>
                </div>

                <div className="p-8 rounded-2xl bg-primary/5 border-2 border-primary/10 flex items-start gap-6 relative overflow-hidden group hover:border-primary/30 transition-all">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform group-hover:opacity-10">
                    <Sparkles className="size-20 text-primary" />
                  </div>
                  <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground mt-1 shrink-0 shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform">
                    <TrendingUp className="size-6" />
                  </div>
                  <div className="space-y-3 relative z-10">
                    <h4 className="text-lg font-black text-foreground tracking-tight italic">{t("dashboard.aiStrategicInsights")}</h4>
                    <p
                      className="text-sm text-muted-foreground leading-relaxed font-bold italic opacity-80"
                      dangerouslySetInnerHTML={{ __html: `${t("dashboard.accelerationNotice")} ${t("dashboard.peakVisibilityNotice")}` }}
                    />
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
