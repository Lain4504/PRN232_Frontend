"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
          <div className="flex items-center gap-5 py-3 transition-all duration-300">
            <div className="size-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <Megaphone className="size-5" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-foreground text-base leading-tight truncate max-w-[250px] italic">{row.getValue("name")}</div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider", statusColor)}>
                  {status === 'active' ? "Đang chạy" : status === 'paused' ? "Tạm dừng" : status}
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
              <Target className="size-3.5 text-muted-foreground/40" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/80 italic">{objective?.replace(/_/g, ' ') || "CHỜ XỬ LÝ"}</span>
            </div>
            {brand && (
              <div className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-tighter italic">Nhánh: {brand.name}</div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "budget",
      header: "Ngân sách",
      cell: ({ row }) => {
        const budget = row.getValue("budget") as number
        return (
          <div className="space-y-1">
            <div className="text-sm font-bold text-foreground italic">
              ₫{(budget || 0).toLocaleString('vi-VN')}
            </div>
            <div className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest italic">Hạch toán dự chi</div>
          </div>
        )
      },
    },
    {
      accessorKey: "metrics",
      header: "Hiệu suất Node",
      cell: ({ row }) => {
        const metrics = row.original.metrics
        if (!metrics) return <span className="text-[10px] font-bold text-muted-foreground/20 italic uppercase tracking-widest">Đang đồng bộ...</span>

        return (
          <div className="space-y-2.5 min-w-[200px]">
            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest italic">
              <span className="text-muted-foreground/40">Tỉ lệ nhấp (CTR)</span>
              <span className="text-foreground/80">{metrics.ctr?.toFixed(2) || 0}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden border border-border/50">
              <div
                className="bg-primary h-full rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${Math.min((metrics.ctr || 0) * 15, 100)}%` }}
              />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/40 italic uppercase tracking-tighter">
                <Eye className="size-3 opacity-30" />
                {(metrics.totalImpressions || 0).toLocaleString()} Hiển thị
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Điều phối</div>,
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
  const [editingCampaign, setEditingCampaign] = useState<AdCampaignResponse | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteCampaignId, setDeleteCampaignId] = useState<string | null>(null)

  const campaigns = campaignsData?.data || []
  const safeBrands = Array.isArray(brands) ? brands : []

  const filteredCampaigns = campaigns.filter(campaign => {
    const campaignStatus = getCampaignStatus(campaign)
    return (
      (!searchTerm || campaign.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "all" || campaignStatus === statusFilter)
    )
  })

  const confirmDeleteCampaign = async () => {
    if (!deleteCampaignId) return
    try {
      await deleteCampaignMutation.mutateAsync(deleteCampaignId)
      toast.success("Đã xóa chiến dịch thành công")
      setDeleteCampaignId(null)
    } catch {
      toast.error("Lỗi khi xóa chiến dịch")
    }
  }

  const handleEditCampaign = (campaign: AdCampaignResponse) => {
    setEditingCampaign(campaign)
    setIsEditModalOpen(true)
  }

  if (loading) return (
    <div className="space-y-10 animate-pulse">
      <div className="h-10 w-64 bg-muted rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-card rounded-lg border border-border" />)}
      </div>
      <div className="h-[500px] w-full bg-card rounded-lg border border-border" />
    </div>
  )

  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0)
  const activeCount = campaigns.filter(c => getCampaignStatus(c) === 'active').length

  return (
    <div className="space-y-10 pb-20 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/5 text-primary border border-primary/10">
              <Megaphone className="size-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">Hệ thống Điều phối • Campaign Engine</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight italic uppercase">
            Quản lý Chiến dịch
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl italic leading-relaxed">
            Quản trị và tối ưu hóa luồng phân phối quảng bá thương hiệu đa kênh trong hệ sinh thái Node.
          </p>
        </div>

        <div className="w-full md:w-auto">
          <CampaignModal mode="create" onSuccess={refetchCampaigns}>
            <Button className="h-12 px-8 rounded-md font-bold text-xs uppercase tracking-wider shadow-lg transition-all hover:-translate-y-0.5">
              <Plus className="mr-2 h-4 w-4" />
              Tạo chiến dịch mới
            </Button>
          </CampaignModal>
        </div>
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Đang triển khai", value: activeCount, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
          { label: "Tổng ngân sách", value: `₫${totalBudget.toLocaleString('vi-VN')}`, icon: DollarSign, color: "text-primary", bg: "bg-primary/5", border: "border-primary/10" },
          { label: "Số lượng chiến dịch", value: campaigns.length, icon: Target, color: "text-foreground/80", bg: "bg-muted/5", border: "border-border/50" },
          { label: "Chỉ số thông minh", value: "92/100", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className={cn("rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300 group border-l-4", stat.border)}>
            <div className="flex items-center justify-between mb-6">
              <div className={cn("size-10 rounded-md flex items-center justify-center border", stat.bg, stat.color, stat.border)}>
                <stat.icon className="size-5 transition-transform group-hover:rotate-12" />
              </div>
              <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/30 border-border/50 p-0.5 px-2 italic">Realtime Node</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-foreground tracking-tight italic">{stat.value}</p>
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic leading-none">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 group w-full lg:max-w-[420px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
          <input
            placeholder="Truy vết định danh chiến dịch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 h-11 bg-muted/10 border border-border/50 rounded-md shadow-sm focus:ring-1 focus:ring-primary focus:outline-none font-bold text-xs italic transition-all text-foreground placeholder:text-muted-foreground/20 italic uppercase tracking-wider"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-3 bg-card p-1.5 rounded-md border border-border/50 shadow-sm shrink-0">
            <div className="size-8 rounded-sm bg-muted/50 flex items-center justify-center text-muted-foreground/40 shrink-0 border border-border/50">
              <Target className="size-3.5" />
            </div>
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger className="w-[160px] border-none focus:ring-0 font-bold text-[10px] uppercase tracking-widest h-8 bg-transparent transition-colors italic">
                <SelectValue placeholder="Phạm vi" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border shadow-2xl p-1 bg-popover">
                <SelectItem value="all" className="rounded-sm font-bold text-[10px] uppercase italic tracking-wider">Toàn bộ hồ sơ</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id} className="rounded-sm font-bold text-[10px] uppercase italic tracking-wider">
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 bg-card p-1.5 rounded-md border border-border/50 shadow-sm shrink-0">
            <div className="size-8 rounded-sm bg-muted/50 flex items-center justify-center text-muted-foreground/40 shrink-0 border border-border/50">
              <Filter className="size-3.5" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border-none focus:ring-0 font-bold text-[10px] uppercase tracking-widest h-8 bg-transparent transition-colors italic">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border shadow-2xl p-1 bg-popover">
                <SelectItem value="all" className="rounded-sm font-bold text-[10px] uppercase italic tracking-wider">Toàn bộ</SelectItem>
                <SelectItem value="active" className="rounded-sm font-bold text-[10px] uppercase italic tracking-wider">Đang chạy</SelectItem>
                <SelectItem value="paused" className="rounded-sm font-bold text-[10px] uppercase italic tracking-wider">Vô hiệu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || statusFilter !== "all") && (
            <Button variant="ghost" className="h-11 px-4 rounded-md font-bold text-[10px] uppercase tracking-widest text-destructive hover:bg-destructive/5 shrink-0 italic" onClick={() => {
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
        <Card className="rounded-lg border border-border bg-card shadow-sm overflow-hidden relative group">
          <CustomTable
            columns={createColumns(handleEditCampaign, setDeleteCampaignId, safeBrands, deleteCampaignMutation.isPending, basePath)}
            data={filteredCampaigns}
            pageSize={10}
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-muted/30 border-b border-border/50 py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-border rounded-lg bg-muted/5">
          <div className="size-16 rounded-full bg-card flex items-center justify-center mb-6 shadow-sm border border-border">
            <Megaphone className="size-8 text-muted-foreground/20" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2 italic">
            {searchTerm ? "Không có kết quả truy vấn" : "Hành trình chiến dịch đang trống"}
          </h3>
          <p className="text-muted-foreground font-medium max-w-sm mb-8 italic text-sm">
            {searchTerm ? "Vui lòng điều chỉnh tham số lọc để quét lại cơ sở dữ liệu." : "Hãy khởi tạo cấu trúc chiến dịch đầu tiên để bắt đầu quá trình tiếp cận định danh."}
          </p>
          {!searchTerm && (
            <CampaignModal mode="create" onSuccess={refetchCampaigns}>
              <Button className="h-12 px-8 rounded-md font-bold text-sm shadow-md transition-all hover:scale-105">
                <Plus className="mr-2 h-4 w-4" />
                Triển khai chiến dịch
              </Button>
            </CampaignModal>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[
          { title: "Báo cáo Thông minh Node", desc: "Hệ thống phát hiện biến động tích cực tại phân khúc khách hàng tiềm năng. Tỉ lệ chuyển đổi dự báo tăng 12% trong chu kỳ kế tiếp.", icon: Sparkles, color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/10" },
          { title: "Điều phối Thời gian Thực", desc: "Lưu lượng truy cập đạt đỉnh trong khung giờ vàng (19:00 - 21:00). Cân nhắc điều chỉnh ngân sách để tối ưu độ phủ truyền tin.", icon: Clock, color: "text-primary", bg: "bg-primary/5", border: "border-primary/10" },
        ].map((insight, i) => (
          <Card key={i} className="p-8 rounded-lg border border-border bg-card shadow-sm flex flex-col sm:flex-row items-start gap-8 group hover:-translate-y-1 transition-all duration-300">
            <div className={cn("size-14 rounded-md flex items-center justify-center shrink-0 border shadow-inner ring-8 ring-muted/5", insight.bg, insight.color, insight.border)}>
              <insight.icon className="size-6 transition-transform group-hover:scale-110" />
            </div>
            <div className="space-y-3">
              <h4 className="text-xl font-bold text-foreground tracking-tight italic uppercase">{insight.title}</h4>
              <p className="text-sm font-medium text-muted-foreground/80 leading-relaxed italic">{insight.desc}</p>
              <Button variant="link" className="p-0 h-auto text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-primary opacity-40 hover:opacity-100 transition-opacity italic">
                Phân tích chuyên sâu <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteCampaignId} onOpenChange={() => setDeleteCampaignId(null)}>
        <AlertDialogContent className="rounded-lg border-border p-10 max-w-md shadow-2xl bg-popover">
          <AlertDialogHeader className="space-y-6">
            <div className="size-20 rounded-full bg-destructive/5 text-destructive flex items-center justify-center mx-auto border border-destructive/10 shadow-inner">
              <AlertTriangle className="size-10" />
            </div>
            <div className="space-y-2 text-center">
              <AlertDialogTitle className="text-2xl font-bold tracking-tight italic uppercase">Xác nhận gỡ bỏ Node?</AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-medium text-muted-foreground/60 leading-relaxed italic">
                Hệ thống sẽ tiến hành xóa vĩnh viễn dữ liệu chiến dịch này. Thao tác không thể khôi phục sau khi xác nhận điều phối.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 flex gap-4">
            <AlertDialogCancel className="flex-1 rounded-md h-12 font-bold text-[11px] uppercase tracking-widest italic">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCampaign}
              className="flex-1 bg-destructive text-white hover:bg-destructive/90 rounded-md h-12 font-bold text-[11px] uppercase tracking-widest border-none shadow-lg italic"
              disabled={deleteCampaignMutation.isPending}
            >
              {deleteCampaignMutation.isPending ? "Đang xử lý..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CampaignModal mode="edit" campaign={editingCampaign || undefined} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} onSuccess={refetchCampaigns} />
    </div>
  )
}
