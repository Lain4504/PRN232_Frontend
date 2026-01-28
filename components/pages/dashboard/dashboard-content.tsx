"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
    <div className="space-y-12 animate-pulse">
      <div className="h-20 w-full bg-slate-50 dark:bg-slate-900 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 h-[600px] bg-slate-50 dark:bg-slate-900 rounded-3xl" />
        <div className="lg:col-span-7 h-[600px] bg-slate-50 dark:bg-slate-900 rounded-3xl" />
      </div>
    </div>
  )

  return (
    <div className="space-y-8 md:space-y-12 pb-10 md:pb-20">
      {/* Top Console Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 border-b border-slate-100 dark:border-slate-800 pb-6 md:pb-12 text-slate-950 dark:text-white">
        <div className="space-y-2 md:space-y-4 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-black text-[8px] md:text-[9px] uppercase tracking-widest px-2 md:px-3 py-1 rounded-full">
              Hệ thống trực tuyến
            </Badge>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Cập nhật: Vừa xong
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight md:leading-none uppercase">
            Trung tâm <span className="text-slate-400 dark:text-slate-600">Điều khiển</span>
          </h1>
          <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Chào mừng, <span className="text-slate-900 dark:text-white font-bold">{user?.first_name || user?.email?.split('@')[0]}</span>. Không gian làm việc AI đã tối ưu.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full lg:w-auto">
          {teams.length > 0 && (
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-slate-100 dark:focus-within:ring-slate-800 w-full sm:w-auto">
              <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
                <Layout className="size-4" />
              </div>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger className="w-full sm:w-[180px] border-none focus:ring-0 font-bold text-[10px] md:text-xs uppercase tracking-widest h-8 bg-transparent text-slate-900 dark:text-white">
                  <SelectValue placeholder="Toàn bộ không gian" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl p-1 bg-white dark:bg-slate-900">
                  <SelectItem value="all" className="font-bold text-[10px] uppercase rounded-xl">Tổng quan chung</SelectItem>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id} className="font-bold text-[10px] uppercase rounded-xl">
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button variant="outline" className="h-10 md:h-12 w-full sm:w-auto px-6 md:px-8 rounded-xl md:rounded-2xl border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[9px] md:text-[10px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Filter className="size-3 md:size-3.5 mr-2 md:mr-3 opacity-50" />
            Báo cáo chi tiết
          </Button>
        </div>
      </div>


      {/* Primary Metrics Grid */}
      <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {stats && getStatsData(stats).map((stat, i) => (
          <Link href={stat.href} key={i}>
            <Card className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:-translate-y-1">
              <CardContent className="p-5 md:p-8">
                <div className="flex justify-between items-start mb-6 md:mb-8">
                  <div className={cn("size-10 md:size-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm border border-white dark:border-slate-800 ring-4 ring-slate-50 dark:ring-slate-800/20", stat.bgColor, stat.color)}>
                    <stat.icon className="size-4 md:size-5" />
                  </div>
                  <Badge variant="outline" className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800">CẬP NHẬT</Badge>
                </div>

                <div className="space-y-1">
                  <div className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-slate-900 dark:group-hover:text-primary transition-colors">
                    {stat.value}
                  </div>
                  <p className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{stat.title}</p>
                </div>

                <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60 dark:opacity-40">{stat.description}</span>
                  <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 md:gap-12 lg:grid-cols-12">
        {/* Quick Hub */}
        <div className="lg:col-span-5">
          <QuickActionsPanel className="h-full border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 rounded-2xl md:rounded-3xl" />
        </div>

        {/* Intelligence Node */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8">
          <Card className="rounded-2xl md:rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-black/20 overflow-hidden">
            <div className="p-6 md:p-10 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/10">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                  <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-slate-900 dark:bg-primary flex items-center justify-center text-white">
                    <Activity className="size-4 md:size-5" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight leading-none uppercase tracking-widest">Hiệu suất vận hành</h3>
                </div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Chỉ số tương tác hệ thống</p>
              </div>
            </div>

            <CardContent className="p-6 md:p-10 space-y-6 md:space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                <div className="group flex items-center justify-between p-6 md:p-8 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer shadow-sm active:scale-95">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="size-12 md:size-14 rounded-xl md:rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-700 transition-all group-hover:bg-slate-900 dark:group-hover:bg-primary group-hover:text-white">
                      <Clock className="size-5 md:size-6" />
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-slate-900 dark:text-white">Đang chờ</p>
                      <p className="text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-400">Hàng chờ phê duyệt</p>
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{stats?.pending_approvals || 0}</div>
                </div>

                <div className="group flex items-center justify-between p-6 md:p-8 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all duration-300 cursor-pointer shadow-sm active:scale-95">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="size-12 md:size-14 rounded-xl md:rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-700 transition-all group-hover:bg-slate-900 dark:group-hover:bg-primary group-hover:text-white">
                      <Calendar className="size-5 md:size-6" />
                    </div>
                    <div className="space-y-0.5 md:space-y-1">
                      <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-slate-900 dark:text-white">Đã lập lịch</p>
                      <p className="text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-400">Tiến độ đồng bộ</p>
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{stats?.scheduled_posts || 0}</div>
                </div>
              </div>

              {/* AI Insight Insight */}
              <div className="p-6 md:p-10 rounded-xl md:rounded-3xl bg-slate-900 dark:bg-slate-800 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:rotate-12 transition-transform duration-700">
                  <Sparkles className="size-32 md:size-48" />
                </div>
                <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-8 relative z-10">
                  <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0 shadow-2xl">
                    <TrendingUp className="size-5 md:size-6" />
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    <h4 className="text-lg md:text-xl font-black tracking-tight uppercase tracking-widest text-slate-900 dark:text-white">Phân tích chiến lược AI</h4>
                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed font-bold">
                      Dựa trên <span className="text-emerald-400">14.2%</span> tốc độ tăng trưởng hiện tại, mô hình AI dự báo việc triển khai nội dung vào lúc 18:00 tối nay sẽ mang lại tỉ lệ tương tác cao nhất cho thương hiệu của bạn.
                    </p>
                    <div className="pt-2 text-slate-900 dark:text-white">
                      <Button variant="ghost" className="p-0 text-white hover:text-emerald-400 font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-transparent flex items-center gap-2 group/btn">
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
