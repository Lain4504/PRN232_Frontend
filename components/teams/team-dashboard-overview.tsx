"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTeam } from '@/lib/contexts/team-context'
import { useQuery } from '@tanstack/react-query'
import { api, endpoints } from '@/lib/api'
import {
  Users,
  Building2,
  Calendar,
  FileText,
  CheckCircle,
  Sparkles,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Brand } from '@/lib/types/omniadly-types'

interface TeamStatsResponse {
  membersCount: number
  membersAddedThisMonth: number
  brandsCount: number
  totalContents: number
  contentCreatedThisWeek: number
  pendingApprovals: number
}

export function TeamDashboardOverview() {
  const { activeTeamId, activeTeam } = useTeam()

  // Fetch team stats
  const { data: statsResp, isLoading: loadingStats } = useQuery({
    queryKey: ['team-stats', activeTeamId],
    queryFn: async () => {
      if (!activeTeamId) return { data: null }
      return api.get<TeamStatsResponse>(endpoints.teamStats(activeTeamId))
    },
    enabled: !!activeTeamId,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch team brands for display
  const { data: brandsResp, isLoading: loadingBrands } = useQuery({
    queryKey: ['team-brands', activeTeamId],
    queryFn: async () => {
      if (!activeTeamId) return { data: [] }
      return api.get(endpoints.brands({ teamId: activeTeamId }))
    },
    enabled: !!activeTeamId,
    staleTime: 5 * 60 * 1000,
  })

  const teamStats = statsResp?.data as TeamStatsResponse | undefined
  const teamBrands = (brandsResp?.data as Brand[]) || []
  const isLoading = loadingStats || loadingBrands

  const membersTrend = teamStats?.membersAddedThisMonth
    ? `+${teamStats.membersAddedThisMonth} THIS CYCLE`
    : "0 NEW"

  const contentTrend = teamStats?.contentCreatedThisWeek
    ? `+${teamStats.contentCreatedThisWeek} THIS CYCLE`
    : "0 NEW"

  const statsCards = [
    {
      title: "OPERATIVES",
      value: teamStats?.membersCount || 0,
      icon: Users,
      trend: membersTrend,
      color: "text-blue-500"
    },
    {
      title: "BRAND NODES",
      value: teamStats?.brandsCount || teamBrands.length || 0,
      icon: Building2,
      trend: "ALL ONLINE",
      color: "text-emerald-500"
    },
    {
      title: "ASSET FLOW",
      value: teamStats?.totalContents || 0,
      icon: FileText,
      trend: contentTrend,
      color: "text-primary"
    },
    {
      title: "AUTHORIZATIONS",
      value: teamStats?.pendingApprovals || 0,
      icon: CheckCircle,
      trend: "ACTION REQUIRED",
      color: "text-amber-500"
    }
  ]

  const quickActions = [
    {
      title: "INITIATE CREATIVE",
      desc: "Deploy new asset generation",
      icon: Sparkles,
      variant: "primary"
    },
    {
      title: "ASSET ARCHIVE",
      desc: "Manage existing content",
      icon: FileText,
      variant: "ghost"
    },
    {
      title: "PIPELINE CLEARANCE",
      desc: "Authorize pending items",
      icon: CheckCircle,
      variant: "ghost"
    },
    {
      title: "CHRONOS VIEW",
      desc: "Calendar and scheduling",
      icon: Calendar,
      variant: "ghost"
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-background font-fira-sans">
        <div className="relative">
          <div className="h-20 w-20 rounded-3xl border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-primary/10 animate-pulse" />
          </div>
        </div>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-primary/70 animate-pulse italic">Synchronizing Team Matrix...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-fira-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-10 space-y-12">

        {/* Tactical Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="h-6 px-3 rounded-md bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest">
                TEAM SECTOR: {activeTeam?.name?.slice(0, 3).toUpperCase() || 'SYS'}-{activeTeamId?.slice(-4) || '0000'}
              </Badge>
              <div className="h-1 w-6 bg-border rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">ACTIVE ROLE: {activeTeam?.role?.toUpperCase() || 'N/A'}</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-foreground uppercase leading-none">
              {activeTeam?.name || 'Sector'} <span className="text-primary italic">Command</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl tracking-tight leading-relaxed">
              {activeTeam?.description || 'Strategic monitoring and coordination hub for sector-specific asset generation.'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/40 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              INVITE OPERATIVES
            </Button>
          </div>
        </div>

        {/* Neural Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat) => (
            <div key={stat.title} className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Card className="relative h-full bg-card/40 backdrop-blur-3xl border-border/40 hover:border-primary/50 rounded-2xl overflow-hidden transition-all duration-300 shadow-2xl shadow-black/5">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center ${stat.color} transition-transform group-hover:scale-110 duration-500`}>
                      <stat.icon className="h-6 w-6 stroke-[2.5]" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-emerald-500 opacity-50" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-black font-fira-mono tracking-tighter tabular-nums text-foreground">{stat.value}</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{stat.trend}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Control Interface Section */}
        <div className="grid lg:grid-cols-12 gap-10">

          {/* Quick Tactical Actions */}
          <div className="lg:col-span-12 space-y-6">
            <div className="flex items-center gap-4 px-2">
              <div className="h-5 w-1 bg-primary rounded-full" />
              <h2 className="text-xl font-black uppercase tracking-tight">Tactical Protocols</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant="ghost"
                  className={`h-auto p-8 flex flex-col items-start gap-4 rounded-3xl border border-border/40 transition-all duration-500 group relative overflow-hidden text-left
                          ${action.variant === 'primary'
                      ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/20 ring-1 ring-primary/50'
                      : 'bg-card/40 backdrop-blur-xl hover:bg-muted/50 hover:border-primary/50'}`}
                >
                  {action.variant === 'primary' && (
                    <div className="absolute top-0 right-0 p-6 opacity-20 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                      <Sparkles className="h-12 w-12" />
                    </div>
                  )}
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg
                        ${action.variant === 'primary' ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}>
                    <action.icon className="h-7 w-7 stroke-[2.5]" />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-sm font-black uppercase tracking-wider">{action.title}</span>
                    <span className={`block text-xs font-medium opacity-60 ${action.variant === 'primary' ? 'text-white' : 'text-muted-foreground'}`}>{action.desc}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Node Directory (Brands) */}
          <div className="lg:col-span-12 space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <div className="h-5 w-1 bg-primary rounded-full" />
                <h2 className="text-xl font-black uppercase tracking-tight">Node Directory</h2>
              </div>
              <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all group">
                View Network Matrix
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamBrands.length > 0 ? (
                teamBrands.map((brand) => (
                  <div
                    key={brand.id}
                    className="group flex items-center gap-5 p-5 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/40 hover:border-primary/50 hover:bg-muted/50 transition-all duration-300 shadow-xl shadow-black/5"
                  >
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-transparent">
                          <Building2 className="h-6 w-6 text-primary stroke-[2]" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-black uppercase tracking-tight text-foreground truncate">{brand.name}</p>
                      <p className="text-xs font-medium text-muted-foreground truncate leading-relaxed">
                        {brand.description || 'NO SECTOR DESCRIPTION'}
                      </p>
                    </div>
                    <Badge variant="outline" className="h-7 border-border/40 bg-background/50 font-black text-[9px] uppercase tracking-widest px-3 rounded-lg flex-shrink-0">
                      {brand.status || 'SYNCED'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 bg-card/20 backdrop-blur-sm border-2 border-dashed border-border/40 rounded-3xl flex flex-col items-center justify-center text-center space-y-6">
                  <div className="h-20 w-20 rounded-2xl bg-muted/20 flex items-center justify-center">
                    <Building2 className="h-10 w-10 text-muted-foreground stroke-[1.5]" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-black uppercase tracking-tight text-xl">System Purified</p>
                    <p className="text-muted-foreground font-medium max-w-sm mx-auto tracking-tight">No branding nodes have been initialized for this sector pipeline.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
