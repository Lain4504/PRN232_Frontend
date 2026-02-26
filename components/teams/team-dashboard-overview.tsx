"use client"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  ArrowRight,
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
    ? `+${teamStats.membersAddedThisMonth} tháng này`
    : "0 thành viên mới"

  const contentTrend = teamStats?.contentCreatedThisWeek
    ? `+${teamStats.contentCreatedThisWeek} tuần này`
    : "0 nội dung mới"

  const statsCards = [
    {
      title: "Thành viên",
      value: teamStats?.membersCount || 0,
      icon: Users,
      trend: membersTrend,
      color: "text-blue-500",
      trendColor: "text-blue-600 bg-blue-100"
    },
    {
      title: "Thương hiệu",
      value: teamStats?.brandsCount || teamBrands.length || 0,
      icon: Building2,
      trend: "Hoạt động",
      color: "text-emerald-500",
      trendColor: "text-emerald-600 bg-emerald-100"
    },
    {
      title: "Nội dung",
      value: teamStats?.totalContents || 0,
      icon: FileText,
      trend: contentTrend,
      color: "text-primary",
      trendColor: "text-primary bg-primary/10"
    },
    {
      title: "Phê duyệt",
      value: teamStats?.pendingApprovals || 0,
      icon: CheckCircle,
      trend: "Cần xử lý",
      color: "text-amber-500",
      trendColor: "text-amber-600 bg-amber-100"
    }
  ]

  const quickActions = [
    {
      title: "Tạo nội dung mới",
      desc: "Triển khai chiến dịch quảng cáo",
      icon: Sparkles,
      variant: "default"
    },
    {
      title: "Quản lý tài sản",
      desc: "Xem và chỉnh sửa nội dung",
      icon: FileText,
      variant: "outline"
    },
    {
      title: "Phê duyệt nội dung",
      desc: "Xử lý các mục đang chờ",
      icon: CheckCircle,
      variant: "outline"
    },
    {
      title: "Lịch nội dung",
      desc: "Xem lịch trình đăng bài",
      icon: Calendar,
      variant: "outline"
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Đang tải dữ liệu đội ngũ...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">
              Mã nhóm: {activeTeam?.name?.slice(0, 3).toUpperCase() || 'SYS'}-{activeTeamId?.slice(-4) || '0000'}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {activeTeam?.role || 'Thành viên'}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            {activeTeam?.name || 'Đội ngũ'}
          </h1>
          <p className="text-muted-foreground">
            {activeTeam?.description || 'Trung tâm quản lý và điều phối hoạt động của đội ngũ.'}
          </p>
        </div>

        <Button>
          Mời thành viên
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-1">
                <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", stat.trendColor)}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Thao tác nhanh</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant as "default" | "outline"}
              className="h-auto py-6 flex flex-col items-start gap-2 text-left"
            >
              <div className="flex items-center gap-2 w-full">
                <action.icon className="h-5 w-5 shrink-0" />
                <span className="font-semibold text-base truncate">{action.title}</span>
              </div>
              <span className="text-xs opacity-90 font-normal">{action.desc}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Brands Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Danh sách thương hiệu</h2>
          <Button variant="link" className="h-auto p-0 text-muted-foreground hover:text-primary">
            Xem tất cả <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamBrands.length > 0 ? (
            teamBrands.map((brand) => (
              <Card key={brand.id} className="hover:shadow-md transition-all">
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12 rounded-lg border">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{brand.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {brand.description || 'Chưa có mô tả'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {brand.status || 'Active'}
                  </Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="p-4 bg-muted rounded-full">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">Chưa có thương hiệu</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bắt đầu bằng việc thêm thương hiệu đầu tiên cho đội ngũ.
                  </p>
                </div>
                <Button variant="outline">Thêm thương hiệu</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
