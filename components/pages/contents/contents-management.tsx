"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Brain,
  Search,
  MoreVertical,
  Plus,
  Trash2,
  Send,
  Eye,
  Settings,
  Edit,
  Copy,
  Layout,
  ChevronRight,
  Filter,
  Sparkles,
  X
} from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { CustomTable } from "@/components/ui/custom-table"
import { ColumnDef } from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useBrands } from "@/hooks/use-brands"
import { useProducts } from "@/hooks/use-products"
import {
  useUpdateContent,
  usePublishContent,
} from "@/hooks/use-contents"
import { useContentsByBrandFilter } from "@/hooks/use-contents-by-brand"
import {
  ContentResponseDto,
  ContentStatusEnum,
  AdTypeEnum,
  CreateContentRequest,
  UpdateContentRequest,
  CreateApprovalRequest
} from "@/lib/types/omniadly-types"
import { ContentModal } from "@/components/contents/content-modal"
import { ContentPreviewModal } from "@/components/contents/content-preview-modal"
import { ChangeStatusModal } from "@/components/contents/change-status-modal"
import { toast } from "sonner"
import { SubmitApprovalDialog } from "@/components/contents/submit-approval-dialog"
import { useTeamMembers } from "@/hooks/use-teams"
import { useQueryClient } from "@tanstack/react-query"
import { api, endpoints } from "@/lib/api"
import { useProfile } from "@/lib/contexts/profile-context"
import { ProfileTypeEnum } from "@/lib/utils/profile-utils"
import { useUser } from "@/hooks/use-user"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

const createColumns = (
  handleEditContent: (contentId: string) => void,
  handleViewContent: (content: ContentResponseDto) => void,
  handleDeleteContent: (contentId: string) => void,
  handleSubmitContent: (contentId: string) => void,
  handleCloneContent: (contentId: string) => void,
  handleChangeStatus: (content: ContentResponseDto) => void,
  brands: { id: string; name: string }[] = [],
  isProcessing: boolean,
  canUseTeamFeatures: boolean,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any
): ColumnDef<ContentResponseDto>[] => [
    {
      accessorKey: "title",
      header: t("contents.contentTitle"),
      cell: ({ row }) => {
        const content = row.original
        const status = content.status

        return (
          <div className="flex items-center gap-6 py-4">
            <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200 shadow-sm overflow-hidden group-hover:bg-slate-900 group-hover:text-white transition-all">
              <FileText className="size-6" />
            </div>
            <div className="space-y-1">
              <span className="font-black text-slate-900 text-lg truncate max-w-[300px] leading-tight block">{row.getValue("title")}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border-none",
                  status === ContentStatusEnum.Published ? "bg-emerald-50 text-emerald-600" :
                    status === ContentStatusEnum.Approved ? "bg-blue-50 text-blue-600" :
                      status === ContentStatusEnum.PendingApproval ? "bg-amber-50 text-amber-600" :
                        "bg-slate-100 text-slate-500"
                )}>
                  {t(`contents.status.${status.toLowerCase()}`, status)}
                </Badge>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "adType",
      header: t("contents.format"),
      cell: ({ row }) => {
        const value = row.getValue("adType") as unknown as AdTypeEnum
        const label = (() => {
          if (typeof value === 'string') {
            const v = String(value).toLowerCase()
            if (v === 'textonly' || v === 'text_only') return t("contents.adType.textOnly")
            if (v === 'imagetext' || v === 'image_text') return t("contents.adType.imageText")
            if (v === 'videotext' || v === 'video_text') return t("contents.adType.videoText")
            return value
          }
          if (value === AdTypeEnum.TextOnly) return t("contents.adType.textOnly")
          if (value === AdTypeEnum.ImageText) return t("contents.adType.imageText")
          if (value === AdTypeEnum.VideoText) return t("contents.adType.videoText")
          return t("contents.adType.unknown")
        })()
        return (
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        )
      },
    },
    {
      accessorKey: "brandId",
      header: t("brands.title"),
      cell: ({ row }) => {
        const brandId = row.getValue("brandId") as string
        const brand = brands.find(b => b.id === brandId)
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{brand?.name || "Global"}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: t("contents.registry"),
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string
        return (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {createdAt ? format(new Date(createdAt), 'dd.MM.yyyy') : "-"}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thao tác</div>,
      cell: ({ row }) => {
        const content = row.original
        const canSubmit = content.status === ContentStatusEnum.Draft

        const actions: ActionItem[] = [
          {
            label: "Xem nội dung",
            icon: <Eye className="size-4" />,
            onClick: () => handleViewContent(content),
          },
          {
            label: "Chỉnh sửa",
            icon: <Edit className="size-4" />,
            onClick: () => handleEditContent(content.id),
            disabled: isProcessing,
          },
          {
            label: "Nhân bản",
            icon: <Copy className="size-4" />,
            onClick: () => handleCloneContent(content.id),
            disabled: isProcessing,
          },
        ]

        if (canSubmit && canUseTeamFeatures) {
          actions.push({
            label: "Gửi phê duyệt",
            icon: <Send className="size-4" />,
            onClick: () => handleSubmitContent(content.id),
            disabled: isProcessing,
          })
        }

        if (!canUseTeamFeatures) {
          actions.push({
            label: "Cập nhật trạng thái",
            icon: <Settings className="size-4" />,
            onClick: () => handleChangeStatus(content),
            disabled: isProcessing,
          })
        }

        actions.push({
          label: "Xóa vĩnh viễn",
          icon: <Trash2 className="size-4" />,
          onClick: () => handleDeleteContent(content.id),
          variant: "destructive",
          disabled: isProcessing,
        })

        return (
          <div className="flex justify-end">
            <ActionsDropdown actions={actions} disabled={isProcessing} />
          </div>
        )
      },
    },
  ]

interface ContentsManagementProps {
  initialBrandId?: string;
  teamId?: string;
}

export function ContentsManagement({ initialBrandId, teamId }: ContentsManagementProps = {}) {
  const { t } = useTranslation("common")
  const { profileType } = useProfile()
  const canUseTeamFeatures = profileType !== ProfileTypeEnum.Free

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ContentStatusEnum | "all">("all")
  const [adTypeFilter, setAdTypeFilter] = useState<AdTypeEnum | "all">("all")
  const [isCreating, setIsCreating] = useState(false)
  const [selectedContent, setSelectedContent] = useState<ContentResponseDto | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [previewContent, setPreviewContent] = useState<ContentResponseDto | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [statusChangeContent, setStatusChangeContent] = useState<ContentResponseDto | null>(null)
  const [isChangeStatusModalOpen, setIsChangeStatusModalOpen] = useState(false)
  const [currentContentId, setCurrentContentId] = useState<string>("")

  const { data: currentUser } = useUser()
  const userId = currentUser?.id || ""
  const { data: brandsData, isLoading: brandsLoading } = useBrands()
  const { data: products = [] } = useProducts()
  const [scopeBrandId] = useState<string | "team-all">(teamId ? "team-all" : (initialBrandId || ""))

  const byBrand = useContentsByBrandFilter({
    brandId: scopeBrandId !== "team-all" ? (scopeBrandId || initialBrandId || undefined) : undefined,
    searchTerm: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    adType: adTypeFilter !== "all" ? adTypeFilter : undefined,
    page: 1,
    pageSize: 50
  })

  const isLoading = byBrand.isLoading
  const contentsData = byBrand.data as { data?: unknown[] } | undefined

  const brands = useMemo(() => {
    if (!brandsData) return []
    const brandArray = Array.isArray(brandsData) ? brandsData : (brandsData as { data: { id: string; name: string }[] }).data || []
    return brandArray.map((b: { id: string; name: string }) => ({ id: b.id, name: b.name }))
  }, [brandsData])

  const queryClient = useQueryClient()

  const [activeTeamId, setActiveTeamId] = useState<string | null>(null)
  useEffect(() => {
    if (typeof window !== 'undefined') setActiveTeamId(localStorage.getItem('activeTeamId'))
  }, [])
  const { data: teamMembers = [] } = useTeamMembers(activeTeamId || undefined)

  const contents: ContentResponseDto[] = Array.isArray(contentsData) ? (contentsData as ContentResponseDto[]) : ((contentsData as { data: ContentResponseDto[] })?.data || [])
  const filteredContents = contents.filter(c => !searchTerm || c.title?.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleEditContent = (contentId: string) => {
    const content = contents.find((c) => c.id === contentId) || null
    setSelectedContent(content)
    setIsEditing(true)
    if (contentId) setCurrentContentId(contentId)
  }

  const handleViewContent = (content: ContentResponseDto) => {
    setPreviewContent(content)
    setIsPreviewModalOpen(true)
  }

  const handleDeleteContent = async (contentId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa nội dung này vĩnh viễn?")) {
      try {
        await api.delete(endpoints.contentById(contentId))
        queryClient.invalidateQueries({ queryKey: ["contents"] })
        toast.success("Đã xóa nội dung")
      } catch {
        toast.error("Lỗi khi xóa nội dung")
      }
    }
  }

  const handleSubmitContent = (contentId: string) => {
    setCurrentContentId(contentId)
    setIsApprovalDialogOpen(true)
  }

  const handleCloneContent = async (contentId: string) => {
    try {
      await api.post(`${endpoints.contentById(contentId)}/clone`)
      queryClient.invalidateQueries({ queryKey: ["contents"] })
      toast.success("Đã nhân bản nội dung")
    } catch {
      toast.error("Lỗi khi nhân bản")
    }
  }

  const handleChangeStatus = (content: ContentResponseDto) => {
    setStatusChangeContent(content)
    setIsChangeStatusModalOpen(true)
  }

  const handleSaveContent = async (data: UpdateContentRequest) => {
    if (selectedContent) {
      try {
        await api.put(endpoints.contentById(selectedContent.id), data)
        queryClient.invalidateQueries({ queryKey: ['contents'] })
        toast.success("Đã lưu nội dung")
        setIsEditing(false)
        setSelectedContent(null)
      } catch { toast.error("Lỗi khi lưu nội dung") }
    }
  }

  if (isLoading || brandsLoading) return (
    <div className="space-y-12 animate-pulse">
      <div className="h-12 w-64 bg-slate-50 rounded-xl" />
      <div className="h-[600px] w-full bg-slate-50 rounded-[2.5rem] border border-slate-100" />
    </div>
  )

  return (
    <div className="space-y-12 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
              <FileText className="size-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Thư viện tài sản</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-none">
            {t("contents.title")}
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
            {t("contents.description")}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setIsCreating(true)} className="h-14 px-8 rounded-2xl border-slate-200 font-black uppercase tracking-widest text-[10px] bg-white hover:bg-slate-50 shadow-sm transition-all hover:-translate-y-1">
            <Plus className="mr-3 h-4 w-4 opacity-50" />
            Phác thảo mới
          </Button>
          <Button onClick={() => window.location.href = `/dashboard/brands/${initialBrandId || 'all'}/contents/new`} className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1">
            <Brain className="mr-3 h-4 w-4" />
            {t("contents.aiGenerate")}
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 group w-full lg:max-w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
          <Input
            placeholder={t("contents.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-white border-slate-100 rounded-2xl shadow-sm focus-visible:ring-slate-100 font-medium transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Filter className="size-3.5" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContentStatusEnum | 'all')}>
              <SelectTrigger className="w-[140px] border-none focus:ring-0 font-bold text-xs uppercase tracking-widest h-8">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                <SelectItem value="all" className="rounded-xl">Tất cả bài</SelectItem>
                {Object.values(ContentStatusEnum).map(s => (
                  <SelectItem key={s} value={s} className="rounded-xl">{t(`contents.status.${s.toLowerCase()}`, s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Layout className="size-3.5" />
            </div>
            <Select value={adTypeFilter === "all" ? "all" : adTypeFilter.toString()} onValueChange={(v) => setAdTypeFilter(v === "all" ? "all" : parseInt(v))}>
              <SelectTrigger className="w-[160px] border-none focus:ring-0 font-bold text-xs uppercase tracking-widest h-8">
                <SelectValue placeholder="Định dạng" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                <SelectItem value="all" className="rounded-xl">Mọi định dạng</SelectItem>
                <SelectItem value={AdTypeEnum.TextOnly.toString()} className="rounded-xl">{t("contents.adType.textOnly")}</SelectItem>
                <SelectItem value={AdTypeEnum.ImageText.toString()} className="rounded-xl">{t("contents.adType.imageText")}</SelectItem>
                <SelectItem value={AdTypeEnum.VideoText.toString()} className="rounded-xl">{t("contents.adType.videoText")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            {contents.length} {t("contents.activeAssets")}
          </div>

          {(searchTerm || statusFilter !== "all" || adTypeFilter !== "all") && (
            <Button variant="ghost" className="h-10 px-4 rounded-xl font-bold text-xs text-rose-500 hover:bg-rose-50" onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
              setAdTypeFilter("all")
            }}>
              <X className="mr-2 size-4" /> Đặt lại
            </Button>
          )}
        </div>
      </div>

      {/* Table Section */}
      {contents.length > 0 ? (
        <Card className="rounded-[2.5rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/40 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="size-40 text-slate-900" />
          </div>
          <CustomTable
            columns={createColumns(handleEditContent, handleViewContent, handleDeleteContent, handleSubmitContent, handleCloneContent, handleChangeStatus, brands, false, canUseTeamFeatures, t)}
            data={filteredContents}
            pageSize={10}
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-slate-50/50 border-b border-slate-100 py-6 px-10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center border border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
          <div className="size-20 rounded-[2rem] bg-white flex items-center justify-center mb-8 shadow-sm border border-slate-100">
            <FileText className="size-10 text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-widest">
            {searchTerm ? "Không tìm thấy nội dung" : "Thư viện đang trống"}
          </h3>
          <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed uppercase tracking-tighter text-xs">
            {searchTerm ? "Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm của bạn." : "Hãy sáng tạo nội dung đầu tiên bằng sự hỗ trợ mạnh mẽ từ trí tuệ nhân tạo."}
          </p>
          {!searchTerm && (
            <Button onClick={() => window.location.href = `/dashboard/brands/${initialBrandId || 'all'}/contents/new`} className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1">
              <Plus className="mr-3 h-5 w-5" />
              Tạo nội dung ngay
            </Button>
          )}
        </div>
      )}

      {/* Governance Banner */}
      <Card className="p-8 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm flex items-start gap-8 group hover:-translate-y-1 transition-all">
        <div className="size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-white ring-4 ring-slate-50 bg-slate-50 text-slate-900">
          <Settings className="size-7" />
        </div>
        <div className="space-y-3">
          <h4 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{t("contents.governance")}</h4>
          <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-2xl italic">
            {t("contents.governanceDesc")} Đảm bảo quá trình kiểm duyệt luôn được thực hiện nghiêm túc để bảo vệ giá trị cốt lõi của thương hiệu trong mắt công chúng.
          </p>
        </div>
      </Card>

      {/* Modals & Dialogs */}
      <ContentModal content={null} isEditing={true} open={isCreating} onOpenChange={setIsCreating} onCreate={(d: CreateContentRequest) => api.post(endpoints.contents(), d).then(() => { setIsCreating(false); queryClient.invalidateQueries({ queryKey: ["contents"] }); toast.success("Đã tạo nội dung"); })} isProcessing={false} brands={teamId ? undefined : brands} products={teamId ? undefined : products} teamId={teamId} userId={userId} defaultBrandId={scopeBrandId !== "team-all" ? scopeBrandId : (initialBrandId || undefined)} />

      {selectedContent && (
        <ContentModal content={selectedContent} isEditing={isEditing} open={!!selectedContent} onOpenChange={o => !o && setSelectedContent(null)} onSave={handleSaveContent} isProcessing={false} brands={teamId ? undefined : brands} products={teamId ? undefined : products} teamId={teamId} userId={userId} showButtons={isEditing} />
      )}

      <SubmitApprovalDialog content={selectedContent || contents.find(c => c.id === currentContentId) || null} isOpen={isApprovalDialogOpen} onClose={() => setIsApprovalDialogOpen(false)} isSubmitting={false} approvers={teamMembers.map(m => ({ id: m.userId, email: m.userEmail, name: m.userEmail.split('@')[0], canApproveContent: m.canApproveContent }))} onSubmit={(d: CreateApprovalRequest) => api.post(endpoints.approvals(), d).then(() => { setIsApprovalDialogOpen(false); queryClient.invalidateQueries({ queryKey: ["contents"] }); toast.success("Đã gửi yêu cầu phê duyệt"); })} />

      {previewContent && (
        <ContentPreviewModal content={previewContent} open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen} onSubmit={async (id) => { handleSubmitContent(id); setIsPreviewModalOpen(false); }} onPublish={async (id, iid) => { setCurrentContentId(id); await api.post(endpoints.contentPublish(id, iid)); queryClient.invalidateQueries({ queryKey: ["contents"] }); toast.success("Đã đăng bài thành công"); setIsPreviewModalOpen(false); }} isProcessing={false} brands={brands} />
      )}

      <ChangeStatusModal content={statusChangeContent} isOpen={isChangeStatusModalOpen} onClose={() => setIsChangeStatusModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['contents'] })} />
    </div>
  )
}
