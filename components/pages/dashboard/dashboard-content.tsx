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
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1.5">
          <Badge variant="outline" className="mb-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-primary/5 text-primary border-primary/20">
            Hệ thống trực tuyến • Core v2.0
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight italic uppercase">
            Trung tâm Điều khiển
          </h1>
          <p className="text-sm text-muted-foreground italic font-medium">
            Chào mừng trở lại, <span className="text-foreground decoration-primary/30 underline underline-offset-4">{user?.first_name || user?.email?.split('@')[0]}</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          {teams.length > 0 && (
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="w-full sm:w-[220px] h-11 rounded-md border-border bg-card font-bold text-xs uppercase tracking-wider">
                <SelectValue placeholder="Chọn không gian" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border">
                <SelectItem value="all" className="font-medium">Tổng quan chung</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id} className="font-medium">
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" className="w-full sm:w-auto h-11 rounded-md font-bold text-xs uppercase tracking-wider border-border shadow-sm">
            <Filter className="mr-2 h-3.5 w-3.5" />
            Báo cáo chi tiết
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats && getStatsData(stats).map((stat, i) => (
          <Link href={stat.href} key={i}>
            <Card className="rounded-lg border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer border-l-4 border-l-primary/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:scale-110 group-hover:text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                <p className="text-[10px] text-muted-foreground mt-1 font-bold italic uppercase tracking-wider opacity-60">
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
          <Card className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 py-4 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider italic">Hiệu suất vận hành</CardTitle>
                    <CardDescription className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Node Intelligence Core v2.0</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] font-bold uppercase border-primary/20 text-primary">Live Sync</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-md border border-border bg-muted/10 hover:bg-muted/20 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-card rounded-md border border-border shadow-sm group-hover:border-primary/20">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Đang chờ</p>
                      <p className="text-xs font-bold italic">Hàng chờ phê duyệt</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tighter">{stats?.pending_approvals || 0}</div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-md border border-border bg-muted/10 hover:bg-muted/20 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-card rounded-md border border-border shadow-sm group-hover:border-primary/20">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Đã lập lịch</p>
                      <p className="text-xs font-bold italic">Tiến độ đồng bộ</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold tracking-tighter">{stats?.scheduled_posts || 0}</div>
                </div>
              </div>

              {/* AI Insight */}
              <div className="p-6 rounded-md bg-slate-900 dark:bg-primary text-white relative overflow-hidden group/insight shadow-xl">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="p-2.5 bg-white/10 rounded-md backdrop-blur-md border border-white/20 group-hover/insight:scale-110 transition-transform">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-sm uppercase tracking-widest italic">Phân tích chiến lược AI</h4>
                    <p className="text-xs leading-relaxed opacity-80 font-medium italic">
                      Dựa trên tốc độ tăng trưởng hiện tại, mô hình AI dự báo việc triển khai nội dung vào lúc <span className="text-white font-bold underline decoration-white/30 decoration-2 underline-offset-4">18:00 tối nay</span> sẽ mang lại tỉ lệ tương tác cao nhất.
                    </p>
                    <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent hover:text-white text-white/70 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all">
                      Xem lộ trình
                      <MousePointer2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Sparkles className="absolute -top-8 -right-8 h-40 w-40 text-white/5 rotate-12 group-hover/insight:rotate-45 transition-transform duration-1000" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DashboardContent
