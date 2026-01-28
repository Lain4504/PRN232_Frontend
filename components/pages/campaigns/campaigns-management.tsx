"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Megaphone,
  Plus,
  Search,
  Edit,
  Trash2,
  DollarSign,
  Target,
  AlertTriangle,
  Eye,
  TrendingUp,
  X,
  Sparkles,
  Zap,
  ChevronRight,
  Filter,
  Clock
} from "lucide-react"
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown"
import { cn } from "@/lib/utils"
import { AdCampaignResponse } from "@/lib/types/campaigns"
import { toast } from "sonner"
import { useBrands } from "@/hooks/use-brands"
import { useCampaigns, useDeleteCampaign } from "@/hooks/use-campaigns"
import { useTeamsByVendor } from "@/hooks/use-teams"
import { useProfile } from "@/lib/contexts/profile-context"
import { getActiveTeamId, setActiveTeamId, clearActiveTeamId } from "@/lib/utils/profile-utils"
import { CustomTable } from "@/components/ui/custom-table"
import { ColumnDef } from "@tanstack/react-table"
import { getCampaignStatus, getCampaignStatusColor, CAMPAIGN_OBJECTIVES } from "@/lib/types/campaigns"
import { CampaignModal } from "@/components/campaigns/campaign-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const createColumns = (
  handleEditCampaign: (campaign: AdCampaignResponse) => void,
  handleDeleteCampaign: (campaignId: string) => void,
  brands: { id: string; name: string }[] = [],
  isDeleting: boolean,
  basePath: string = '/dashboard/campaigns'
): ColumnDef<AdCampaignResponse>[] => [
    {
      accessorKey: "name",
      header: "Tên chiến dịch",
      cell: ({ row }) => {
        const campaign = row.original
        const status = getCampaignStatus(campaign)
        const statusColor = getCampaignStatusColor(status)

        return (
          <div className="flex items-center gap-6 py-4 transition-all duration-300">
            <div className="size-14 rounded-2xl bg-slate-900 dark:bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-200 dark:shadow-primary/20 group-hover:scale-110 transition-transform">
              <Megaphone className="size-6" />
            </div>
            <div className="space-y-1">
              <div className="font-black text-slate-900 dark:text-white text-lg leading-tight truncate max-w-[250px] uppercase">{row.getValue("name")}</div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={cn("text-[9px] font-black uppercase tracking-widest py-0.5 px-2 rounded-lg border-none", statusColor)}>
                  {status}
                </Badge>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "objective",
      header: "Mục tiêu",
      cell: ({ row }) => {
        const objective = row.getValue("objective") as string
        const brandId = row.original.brandId
        const brand = brands.find(b => b.id === brandId)
        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Target className="size-3.5 text-slate-400 dark:text-slate-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{objective?.replace(/_/g, ' ') || "KHÔNG XÁC ĐỊNH"}</span>
            </div>
            {brand && (
              <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Sect: {brand.name}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "budget",
      header: "Ngân sách (VNĐ)",
      cell: ({ row }) => {
        const budget = row.getValue("budget") as number
        return (
          <div className="space-y-1">
            <div className="text-sm font-black text-slate-900 dark:text-white">
              ₫{(budget || 0).toLocaleString('vi-VN')}
            </div>
            <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest opacity-60">Ngân sách</div>
          </div>
        )
      },
    },
    {
      accessorKey: "metrics",
      header: "Hiệu suất",
      cell: ({ row }) => {
        const metrics = row.original.metrics
        if (!metrics) return <span className="text-[10px] font-black text-slate-200 dark:text-slate-800 uppercase tracking-widest">Chờ đồng bộ</span>

        return (
          <div className="space-y-3 min-w-[200px]">
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em]">
              <span className="text-slate-400 dark:text-slate-500">Tỉ lệ nhấp (CTR)</span>
              <span className="text-slate-900 dark:text-white">{metrics.ctr?.toFixed(2) || 0}%</span>
            </div>
            <div className="h-1 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-100 dark:border-slate-700">
              <div
                className="bg-slate-900 dark:bg-primary h-full rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${Math.min((metrics.ctr || 0) * 15, 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                <Eye className="size-3" />
                {(metrics.totalImpressions || 0).toLocaleString()} hiển thị
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Thao tác</div>,
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "Chi tiết",
            icon: <Eye className="size-4" />,
            onClick: () => window.location.href = `${basePath}/${row.original.id}`,
          },
          {
            label: "Chỉnh sửa",
            icon: <Edit className="size-4" />,
            onClick: () => handleEditCampaign(row.original),
          },
          {
            label: "Xóa bỏ",
            icon: <Trash2 className="size-4" />,
            onClick: () => handleDeleteCampaign(row.original.id),
            variant: "destructive",
            disabled: isDeleting,
          },
        ]

        return (
          <div className="flex justify-end">
            <ActionsDropdown actions={actions} disabled={isDeleting} />
          </div>
        )
      },
    },
  ]

interface CampaignsManagementProps {
  basePath?: string
}

export function CampaignsManagement({ basePath = '/dashboard/campaigns' }: CampaignsManagementProps = {}) {

  const { activeProfileId } = useProfile()
  const [selectedTeamId, setSelectedTeamId] = useState<string>(() => getActiveTeamId() || "all")

  React.useEffect(() => {
    if (selectedTeamId === "all") {
      clearActiveTeamId()
    } else {
      setActiveTeamId(selectedTeamId)
    }
  }, [selectedTeamId])

  const { data: teams = [] } = useTeamsByVendor(activeProfileId || undefined)
  const { data: brands = [] } = useBrands({ teamId: selectedTeamId === "all" ? undefined : selectedTeamId })
  const { data: campaignsData, isLoading: loading, refetch: refetchCampaigns } = useCampaigns({
    teamId: selectedTeamId === "all" ? undefined : selectedTeamId
  })
  const deleteCampaignMutation = useDeleteCampaign()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [objectiveFilter, setObjectiveFilter] = useState("all")
  const [editingCampaign, setEditingCampaign] = useState<AdCampaignResponse | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null)

  const campaigns = campaignsData?.data || []
  const safeBrands = Array.isArray(brands) ? brands : []

  const filteredCampaigns = campaigns.filter(campaign => {
    const campaignStatus = getCampaignStatus(campaign)
    return (
      (!searchTerm || campaign.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || campaignStatus === statusFilter) &&
      (objectiveFilter === "all" || campaign.objective === objectiveFilter)
    )
  })

  const confirmDeleteCampaign = async () => {
    if (!deleteCampaignId) return
    try {
      await deleteCampaignMutation.mutateAsync(deleteCampaignId)
      toast.success("Đã xóa chiến dịch thành công")
      setDeleteCampaignId(null)
    } catch (error) {
      toast.error("Lỗi khi xóa chiến dịch")
    }
  }

  const handleEditCampaign = (campaign: AdCampaignResponse) => {
    setEditingCampaign(campaign)
    setIsEditModalOpen(true)
  }

  if (loading) return (
    <div className="space-y-12 animate-pulse">
      <div className="h-12 w-64 bg-slate-50 dark:bg-slate-900 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800" />)}
      </div>
      <div className="h-[600px] w-full bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800" />
    </div>
  )

  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)
  const activeCount = campaigns.filter(c => getCampaignStatus(c) === 'active').length

  return (
    <div className="space-y-8 md:space-y-12 pb-10 md:pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 border-b border-slate-100 dark:border-slate-800 pb-6 md:pb-12 text-slate-900 dark:text-white">
        <div className="space-y-3 md:space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Megaphone className="size-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Hành lang chiến lược</span>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight md:leading-none uppercase">
            CHIẾN DỊCH
          </h1>
          <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto md:mx-0 leading-relaxed">
            Quản lý và theo dõi hiệu suất toàn bộ chiến dịch đa kênh.
          </p>
        </div>

        <div className="w-full md:w-auto">
          <CampaignModal mode="create" onSuccess={refetchCampaigns}>
            <Button className="h-12 md:h-14 w-full md:px-8 rounded-xl md:rounded-2xl bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-2xl shadow-slate-200 dark:shadow-primary/20 transition-all hover:-translate-y-1">
              <Plus className="mr-2 md:mr-3 h-4 w-4" />
              Tạo chiến dịch mới
            </Button>
          </CampaignModal>
        </div>
      </div>


      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {[
          { label: "Đang hoạt động", value: activeCount, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", darkBg: "dark:bg-emerald-500/10", darkColor: "dark:text-emerald-400" },
          { label: "Tổng ngân sách", value: `₫${totalBudget.toLocaleString('vi-VN')}`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50", darkBg: "dark:bg-blue-500/10", darkColor: "dark:text-blue-400" },
          { label: "Số lượng chiến dịch", value: campaigns.length, icon: Target, color: "text-slate-900", bg: "bg-slate-100", darkBg: "dark:bg-slate-800", darkColor: "dark:text-white" },
          { label: "Hiệu số AI", value: "92/100", icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50", darkBg: "dark:bg-purple-500/10", darkColor: "dark:text-purple-400" },
        ].map((stat, i) => (
          <Card key={i} className="rounded-2xl md:rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-300 group cursor-pointer hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className={cn("size-10 md:size-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-sm border border-white dark:border-slate-800 ring-4 ring-slate-50 dark:ring-slate-800/20", stat.bg, stat.color, stat.darkBg, stat.darkColor)}>
                <stat.icon className="size-4 md:size-5 transition-transform group-hover:rotate-12" />
              </div>
              <Badge variant="outline" className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800 p-0.5 px-2">Thời gian thực</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6">
        <div className="relative flex-1 group w-full lg:max-w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
          <Input
            placeholder="TÌM KIẾM CHIẾN DỊCH..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-10 md:h-12 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-xl md:rounded-2xl shadow-sm focus-visible:ring-slate-100 dark:focus-visible:ring-slate-800 font-medium transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
              <Target className="size-3.5" />
            </div>
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="w-[140px] md:w-[160px] border-none focus:ring-0 font-bold text-[10px] md:text-xs uppercase tracking-widest h-8 bg-transparent text-slate-900 dark:text-white transition-colors">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl p-1 bg-white dark:bg-slate-900">
                <SelectItem value="all" className="rounded-xl">Toàn bộ hồ sơ</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id} className="rounded-xl">
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm shrink-0">
            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0">
              <Filter className="size-3.5" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] md:w-[140px] border-none focus:ring-0 font-bold text-[10px] md:text-xs uppercase tracking-widest h-8 bg-transparent text-slate-900 dark:text-white transition-colors">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl p-1 bg-white dark:bg-slate-900">
                <SelectItem value="all" className="rounded-xl">Tất cả</SelectItem>
                <SelectItem value="active" className="rounded-xl">Đang chạy</SelectItem>
                <SelectItem value="paused" className="rounded-xl">Tạm dừng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || statusFilter !== "all") && (
            <Button variant="ghost" className="h-10 px-4 rounded-xl font-bold text-[10px] md:text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 shrink-0" onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
            }}>
              <X className="mr-2 size-4" /> Đặt lại
            </Button>
          )}
        </div>
      </div>


      {/* Campaigns Table */}
      {filteredCampaigns.length > 0 ? (
        <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-black/40 overflow-hidden relative group transition-all duration-300">
          <div className="absolute top-0 right-0 p-10 opacity-5 dark:opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000 pointer-events-none">
            <Zap className="size-40 text-slate-900 dark:text-primary" />
          </div>
          <CustomTable
            columns={createColumns(handleEditCampaign, setDeleteCampaignId, safeBrands, deleteCampaignMutation.isPending, basePath)}
            data={filteredCampaigns}
            pageSize={10}
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-slate-50/50 dark:bg-slate-800/10 border-b border-slate-100 dark:border-slate-800 py-6 px-10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 transition-all duration-300">
          <div className="size-20 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center mb-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <Megaphone className="size-10 text-slate-200 dark:text-slate-700" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-widest">
            {searchTerm ? "Không tìm thấy chiến dịch" : "Chưa có chiến dịch nào"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mb-10 leading-relaxed uppercase tracking-tighter text-xs">
            {searchTerm ? "Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn." : "Hãy khởi tạo chiến dịch quảng cáo đầu tiên để bắt đầu hành trình tiếp cận khách hàng."}
          </p>
          {!searchTerm && (
            <CampaignModal mode="create" onSuccess={refetchCampaigns}>
              <Button className="h-14 px-10 rounded-2xl bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 dark:shadow-primary/20 transition-all hover:-translate-y-1">
                <Plus className="mr-3 h-5 w-5" />
                Triển khai chiến dịch
              </Button>
            </CampaignModal>
          )}
        </div>
      )}

      {/* Logic Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {[
          { title: "Mô phỏng hiệu suất AI", desc: "Hệ thống đang giám sát toàn bộ các luồng dữ liệu. Chỉ số CTR trên 2.8% được phát hiện tại một số phân khúc khách hàng tiềm năng.", icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50", darkBg: "dark:bg-amber-500/10", darkColor: "dark:text-amber-400" },
          { title: "Tối ưu hóa thời gian đăng", desc: "Dữ liệu mới cho thấy sự tương tác đạt đỉnh vào lúc 19:00 chiều. Hãy căn chỉnh các bài đăng quảng cáo để đạt độ phủ tối đa.", icon: Clock, color: "text-blue-600", bg: "bg-blue-50", darkBg: "dark:bg-blue-500/10", darkColor: "dark:text-blue-400" },
        ].map((insight, i) => (
          <Card key={i} className="p-10 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-start gap-8 group hover:-translate-y-1 transition-all duration-300 text-slate-900 dark:text-white">
            <div className={cn("size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white dark:border-slate-800 ring-4 ring-slate-50 dark:ring-slate-800/20", insight.bg, insight.color, insight.darkBg, insight.darkColor)}>
              <insight.icon className="size-7" />
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">{insight.title}</h4>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{insight.desc}</p>
              <Button variant="ghost" className="p-0 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-transparent hover:text-slate-400 dark:hover:text-primary transition-colors">
                Tìm hiểu thêm <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteCampaignId} onOpenChange={() => setDeleteCampaignId(null)}>
        <AlertDialogContent className="rounded-3xl border-slate-100 dark:border-slate-800 p-10 max-w-md shadow-2xl bg-white dark:bg-slate-900 transition-all duration-300">
          <AlertDialogHeader className="space-y-6">
            <div className="size-20 rounded-3xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-800 shadow-sm">
              <AlertTriangle className="size-10" />
            </div>
            <AlertDialogTitle className="text-3xl font-black tracking-tight text-center uppercase text-slate-900 dark:text-white">Xóa chiến dịch?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed text-center italic mt-2">
              Tất cả dữ liệu và hoạt động liên quan đến chiến dịch này sẽ bị loại bỏ khỏi hệ thống. Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 grid grid-cols-2 gap-4">
            <AlertDialogCancel className="rounded-xl h-12 font-black uppercase tracking-widest text-[10px] bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCampaign}
              className="bg-rose-500 text-white hover:bg-rose-600 rounded-xl h-12 font-black uppercase tracking-widest text-[10px] border-none shadow-lg shadow-rose-100 dark:shadow-none"
              disabled={deleteCampaignMutation.isPending}
            >
              Xác nhận xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CampaignModal mode="edit" campaign={editingCampaign || undefined} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} onSuccess={refetchCampaigns} />
    </div>
  )
}
