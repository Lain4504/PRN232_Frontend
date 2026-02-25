"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  Calendar,
  Filter,
  Clock,
  Send,
  TrendingUp,
  Users,
  Sparkles,
  ChevronRight,
  Activity,
  MousePointer2
} from "lucide-react"
import { User, DashboardStats } from "@/lib/types/omniadly-types"
import { api, endpoints } from "@/lib/api"
import { QuickActionsPanel } from "./quick-actions-panel"
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

const getStatsData = (stats: DashboardStats) => [
  {
    title: "Đội nhóm toàn cầu",
    value: stats.total_teams?.toString() || "0",
    icon: Users,
    description: "Không gian làm việc",
    href: "/overview/teams"
  },
  {
    title: "Danh tính hoạt động",
    value: stats.total_brands.toString(),
    icon: Target,
    description: "Hồ sơ thương hiệu",
    href: "/dashboard/brands"
  },
  {
    title: "Kho rèn",
    value: stats.total_contents.toString(),
    icon: Sparkles,
    description: "Tài sản AI đã tạo",
    href: "/dashboard/contents"
  },
  {
    title: "Phân phối",
    value: stats.total_posts.toString(),
    icon: Send,
    description: "Bài đăng đã đồng bộ",
    href: "/dashboard/posts"
  },
]

const DashboardContent = () => {

  const { activeProfileId } = useProfile()
  const [selectedTeamId, setSelectedTeamId] = useState<string>(() => getActiveTeamId() || "all")
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const { data: teams = [] } = useTeamsByVendor(activeProfileId || undefined)

  useEffect(() => {
    if (selectedTeamId === "all") {
      clearActiveTeamId()
    } else {
      setActiveTeamId(selectedTeamId)
    }
  }, [selectedTeamId])

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
    <div className="space-y-6 animate-pulse">
      <div className="h-12 w-1/3 bg-muted rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 h-[400px] bg-muted rounded-lg" />
        <div className="lg:col-span-7 h-[400px] bg-muted rounded-lg" />
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <Badge variant="secondary" className="mb-2">
            Hệ thống trực tuyến
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight">
            Trung tâm Điều khiển
          </h1>
          <p className="text-muted-foreground">
            Chào mừng, <span className="font-medium text-foreground">{user?.first_name || user?.email?.split('@')[0]}</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          {teams.length > 0 && (
             <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Chọn không gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tổng quan chung</SelectItem>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
          )}
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Báo cáo chi tiết
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats && getStatsData(stats).map((stat, i) => (
          <Link href={stat.href} key={i}>
            <Card className="hover:bg-muted/50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Quick Actions */}
        <div className="lg:col-span-5">
          <QuickActionsPanel />
        </div>

        {/* Operational Performance */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>Hiệu suất vận hành</CardTitle>
              </div>
              <CardDescription>Node Intelligence Core v2.0</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-md border">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Đang chờ</p>
                      <p className="text-xs text-muted-foreground">Hàng chờ phê duyệt</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{stats?.pending_approvals || 0}</div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-background rounded-md border">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Đã lập lịch</p>
                      <p className="text-xs text-muted-foreground">Tiến độ đồng bộ</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{stats?.scheduled_posts || 0}</div>
                </div>
              </div>

              {/* AI Insight */}
              <div className="p-6 rounded-lg bg-primary text-primary-foreground relative overflow-hidden">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-2 bg-primary-foreground/10 rounded-md">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Phân tích chiến lược AI</h4>
                    <p className="text-sm opacity-90">
                      Dựa trên tốc độ tăng trưởng hiện tại, mô hình AI dự báo việc triển khai nội dung vào lúc 18:00 tối nay sẽ mang lại tỉ lệ tương tác cao nhất.
                    </p>
                    <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent hover:text-white/80 text-white font-medium flex items-center gap-1">
                      Xem lộ trình
                      <MousePointer2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Sparkles className="absolute -top-4 -right-4 h-32 w-32 opacity-10 rotate-12" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardContent
