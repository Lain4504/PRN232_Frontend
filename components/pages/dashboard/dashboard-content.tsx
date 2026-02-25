"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  FileText,
  Activity,
  Calendar,
  Filter,
  Clock,
  Send,
  TrendingUp,
  Users,
  Sparkles,
  ChevronRight,
  Layout,
  MousePointer2
} from "lucide-react"
import { User, DashboardStats } from "@/lib/types/omniadly-types"
import { api, endpoints } from "@/lib/api"
import { QuickActionsPanel } from "./quick-actions-panel"
import { cn } from "@/lib/utils"

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
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Không gian làm việc đã kết nối",
    href: "/overview/teams"
  },
  {
    title: "Danh tính hoạt động",
    value: stats.total_brands.toString(),
    icon: Target,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    description: "Hồ sơ thương hiệu được quản lý",
    href: "/dashboard/brands"
  },
  {
    title: "Kho rèn",
    value: stats.total_contents.toString(),
    icon: Sparkles,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "Tài sản AI đã tạo",
    href: "/dashboard/contents"
  },
  {
    title: "Phân phối",
    value: stats.total_posts.toString(),
    icon: Send,
    color: "text-slate-900",
    bgColor: "bg-slate-100",
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
    <div className="space-y-8 animate-pulse">
      <div className="h-16 w-full bg-muted rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 h-[400px] bg-muted rounded-lg" />
        <div className="lg:col-span-7 h-[400px] bg-muted rounded-lg" />
      </div>
    </div>
  )

  return (
    <div className="space-y-8 md:space-y-12 pb-10 md:pb-20">
      {/* Top Console Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="px-2 py-0 h-5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none">
              Hệ thống trực tuyến
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground uppercase">
            Trung tâm <span className="text-muted-foreground">Điều khiển</span>
          </h1>
          <p className="text-muted-foreground">
            Chào mừng, <span className="text-foreground font-semibold">{user?.first_name || user?.email?.split('@')[0]}</span>. Hệ thống đã sẵn sàng điều phối.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {teams.length > 0 && (
            <div className="flex items-center gap-2 bg-muted p-1 rounded-md w-full sm:w-auto">
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="w-full sm:w-[200px] border-none bg-transparent h-9 text-sm font-medium">
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
            </div>
          )}
          <Button variant="outline" className="w-full sm:w-auto px-6">
            <Filter className="size-4 mr-2" />
            Báo cáo chi tiết
          </Button>
        </div>
      </div>


      {/* Primary Metrics Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {stats && getStatsData(stats).map((stat, i) => (
          <Link href={stat.href} key={i}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("size-10 rounded-md flex items-center justify-center", stat.bgColor, stat.color)}>
                    <stat.icon className="size-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold">LIVE</Badge>
                </div>

                <div className="space-y-1">
                  <div className="text-3xl font-bold tracking-tight text-foreground">
                    {stat.value}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                </div>

                <div className="mt-6 pt-4 border-t flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-medium uppercase">{stat.description}</span>
                  <ChevronRight className="size-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 md:gap-12 lg:grid-cols-12">
        {/* Quick Hub */}
        <div className="lg:col-span-5">
          <QuickActionsPanel />
        </div>

        {/* Intelligence Node */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader className="p-6 bg-muted/50 border-b">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                  <Activity className="size-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight uppercase">Hiệu suất vận hành</h3>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Node Intelligence Core v2.0</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border hover:bg-background transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded bg-background flex items-center justify-center shadow-sm border">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Đang chờ</p>
                      <p className="text-xs font-semibold">Hàng chờ phê duyệt</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{stats?.pending_approvals || 0}</div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border hover:bg-background transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded bg-background flex items-center justify-center shadow-sm border">
                      <Calendar className="size-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Đã lập lịch</p>
                      <p className="text-xs font-semibold">Tiến độ đồng bộ</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{stats?.scheduled_posts || 0}</div>
                </div>
              </div>

              {/* AI Insight Insight */}
              <div className="p-6 rounded-lg bg-primary text-primary-foreground relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                  <Sparkles className="size-24" />
                </div>
                <div className="flex items-start gap-4 md:gap-6 relative z-10">
                  <div className="size-10 rounded bg-white/10 flex items-center justify-center text-white shrink-0 shadow-lg">
                    <TrendingUp className="size-5" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-bold tracking-tight uppercase">Phân tích chiến lược AI</h4>
                    <p className="text-sm opacity-80 leading-relaxed">
                      Dựa trên <span className="font-bold text-amber-300">14.2%</span> tốc độ tăng trưởng hiện tại, mô hình AI dự báo việc triển khai nội dung vào lúc 18:00 tối nay sẽ mang lại tỉ lệ tương tác cao nhất.
                    </p>
                    <div className="pt-2">
                      <Button variant="ghost" className="p-0 h-auto text-primary-foreground hover:text-white font-bold text-[10px] uppercase tracking-widest hover:bg-transparent flex items-center gap-2 group/btn">
                        Xem lộ trình tối ưu hóa
                        <MousePointer2 className="size-3 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  )
}

export default DashboardContent
