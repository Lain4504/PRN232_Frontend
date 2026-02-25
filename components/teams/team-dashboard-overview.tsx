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
import { cn } from "@/lib/utils"
import { Loader2 } from 'lucide-react'
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Đang tải dữ liệu đội ngũ...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-fira-sans">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="h-5 px-2 rounded-md font-bold text-[9px] uppercase tracking-widest">
                Mã nhóm: {activeTeam?.name?.slice(0, 3).toUpperCase() || 'SYS'}-{activeTeamId?.slice(-4) || '0000'}
              </Badge>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Vai trò: {activeTeam?.role?.toUpperCase() || 'N/A'}</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
              {activeTeam?.name || 'Đội ngũ'}
            </h1>
            <p className="text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed">
              {activeTeam?.description || 'Trung tâm quản lý và điều phối hoạt động của đội ngũ.'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button className="h-10 px-6 rounded-md font-bold uppercase tracking-widest text-[11px]">
              Mời thành viên
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat) => (
            <Card key={stat.title} className="rounded-lg border bg-card p-6 shadow-sm">
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div className={cn("h-10 w-10 rounded flex items-center justify-center border bg-muted", stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-4 w-1 bg-primary rounded-full" />
            <h2 className="text-lg font-bold uppercase tracking-tight">Thao tác nhanh</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant={action.variant === 'primary' ? 'default' : 'outline'}
                className={cn(
                  "h-auto p-6 flex flex-col items-start gap-4 rounded-lg text-left",
                  action.variant === 'primary' ? "shadow-md" : "bg-card shadow-sm"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded flex items-center justify-center shadow-sm",
                  action.variant === 'primary' ? "bg-white/20" : "bg-primary/10 text-primary"
                )}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-xs font-bold uppercase tracking-widest">{action.title}</span>
                  <span className={cn(
                    "block text-[10px] font-medium opacity-70 leading-relaxed",
                    action.variant === 'primary' ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>{action.desc}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Brands Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 bg-primary rounded-full" />
              <h2 className="text-lg font-bold uppercase tracking-tight">Danh sách thương hiệu</h2>
            </div>
            <Button variant="link" size="sm" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary p-0">
              Xem chi tiết <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamBrands.length > 0 ? (
              teamBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card shadow-sm hover:border-primary/50 transition-all duration-300"
                >
                  <div className="h-12 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>
                        <Building2 className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold uppercase tracking-tight text-foreground truncate">{brand.name}</p>
                    <p className="text-[10px] font-medium text-muted-foreground truncate uppercase">
                      {brand.description || 'KHÔNG CÓ MÔ TẢ'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="h-5 font-bold text-[8px] uppercase tracking-widest px-1.5 rounded-sm">
                    {brand.status || 'SYNCED'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 bg-muted/30 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center space-y-4">
                <Building2 className="h-10 w-10 text-muted-foreground/30" />
                <div className="space-y-1">
                  <p className="font-bold uppercase tracking-tight text-lg">Chưa có thương hiệu</p>
                  <p className="text-xs text-muted-foreground font-medium max-w-sm mx-auto">Chưa có thương hiệu nào được khởi tạo cho đội ngũ này.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
