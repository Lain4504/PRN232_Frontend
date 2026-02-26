"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Brain,
  Search,
  Plus,
  Trash2,
  Send,
  Eye,
  Settings,
  Edit,
  Copy,

  X,
  Sparkles
} from "lucide-react"

import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown"
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
import { useTeamMembers, useUserTeams } from "@/hooks/use-teams"
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
  canUseTeamFeatures: boolean
): ColumnDef<ContentResponseDto>[] => [
    {
      accessorKey: "title",
      header: "Tiêu đề nội dung",
      cell: ({ row }) => {
        const content = row.original
        const status = content.status

        return (
          <div className="flex items-center gap-4 py-3">
            <div className="size-10 rounded-md bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10 shadow-sm transition-transform hover:scale-105">
              <FileText className="size-5" />
            </div>
            <div className="space-y-1">
              <span className="font-bold text-[13px] text-foreground truncate max-w-[300px] block italic uppercase tracking-tight">{row.getValue("title")}</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn(
                  "rounded-md px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider",
                  status === ContentStatusEnum.Published ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" :
                    status === ContentStatusEnum.Approved ? "bg-blue-500/5 text-blue-600 border-blue-500/20" :
                      status === ContentStatusEnum.PendingApproval ? "bg-amber-500/5 text-amber-600 border-amber-500/20" :
                        "bg-muted/50 text-muted-foreground border-border"
                )}>
                  {status === ContentStatusEnum.Published ? "Đã xuất bản" :
                    status === ContentStatusEnum.Approved ? "Đã phê duyệt" :
                      status === ContentStatusEnum.PendingApproval ? "Chờ phê duyệt" :
                        status === ContentStatusEnum.Draft ? "Bản nháp" :
                          status === ContentStatusEnum.Rejected ? "Từ chối" : status}
                </Badge>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "adType",
      header: "Định dạng",
      cell: ({ row }) => {
        const value = row.getValue("adType") as unknown as AdTypeEnum
        const label = (() => {
          if (typeof value === 'string') {
            const v = String(value).toLowerCase()
            if (v === 'textonly' || v === 'text_only') return "Văn bản"
            if (v === 'imagetext' || v === 'image_text') return "Ảnh & Text"
            if (v === 'videotext' || v === 'video_text') return "Video & Text"
            return value
          }
          if (value === AdTypeEnum.TextOnly) return "Văn bản"
          if (value === AdTypeEnum.ImageText) return "Ảnh & Text"
          if (value === AdTypeEnum.VideoText) return "Video & Text"
          return "N/A"
        })()
        return (
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic">{label}</span>
        )
      },
    },
    {
      accessorKey: "brandId",
      header: "Thương hiệu",
      cell: ({ row }) => {
        const brandId = row.getValue("brandId") as string
        const brand = brands.find(b => b.id === brandId)
        return (
          <span className="text-xs font-bold truncate max-w-[120px] block italic">{brand?.name || "Hệ thống"}</span>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string
        return (
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
            {createdAt ? format(new Date(createdAt), 'dd • MM • yyyy') : "-"}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Thao tác</div>,
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
  const { data: userTeams = [] } = useUserTeams()

  useEffect(() => {
    if (teamId) {
      setActiveTeamId(teamId)
      return
    }
    if (typeof window !== 'undefined') {
      const storedTeamId = localStorage.getItem('activeTeamId')
      if (storedTeamId) {
        setActiveTeamId(storedTeamId)
      }
    }
  }, [teamId])

  useEffect(() => {
    if (!activeTeamId && userTeams && userTeams.length > 0) {
      const firstTeamId = userTeams[0].id
      setActiveTeamId(firstTeamId)
      localStorage.setItem('activeTeamId', firstTeamId)
    }
  }, [activeTeamId, userTeams])

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
      toast.success("Đã nhân bản nội dung thành công")
    } catch {
      toast.error("Lỗi khi nhân bản nội dung")
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
        toast.success("Đã lưu nội dung thành công")
        setIsEditing(false)
        setSelectedContent(null)
      } catch { toast.error("Lỗi khi lưu nội dung") }
    }
  }

  if (isLoading || brandsLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-10 w-48 bg-muted rounded" />
      <div className="h-[500px] w-full bg-muted rounded-lg" />
    </div>
  )

  return (
    <div className="space-y-6 pb-20 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-6">
        <div className="space-y-1.5">
          <Badge variant="outline" className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-primary/5 text-primary border-primary/20">
            Thư viện tài sản • Content Hub
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight italic uppercase">Quản lý Nội dung</h1>
          <p className="text-sm text-muted-foreground max-w-xl italic font-medium">
            Quản lý, chỉnh sửa và triển khai nội dung quảng cáo thông minh được đồng bộ hóa.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={() => setIsCreating(true)} className="h-11 rounded-md px-6 font-bold text-xs uppercase tracking-wider border-border shadow-sm">
            <Plus className="mr-2 h-4 w-4" />
            Phác thảo mới
          </Button>
          <Button onClick={() => window.location.href = `/dashboard/brands/${initialBrandId || 'all'}/contents/new`} className="h-11 rounded-md px-6 font-bold text-xs uppercase tracking-wider shadow-md">
            <Brain className="mr-2 h-4 w-4" />
            Khởi tạo AI
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Truy vấn nội dung trong thư viện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-md border-border bg-card shadow-sm font-medium italic"
          />
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContentStatusEnum | 'all')}>
            <SelectTrigger className="w-[180px] h-11 rounded-md border-border bg-card font-bold text-[10px] uppercase tracking-wider">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border">
              <SelectItem value="all" className="font-medium text-xs italic">Tất cả bài viết</SelectItem>
              {Object.values(ContentStatusEnum).map(s => (
                <SelectItem key={s} value={s} className="font-medium text-xs italic">{s === ContentStatusEnum.Published ? "Đã xuất bản" :
                  s === ContentStatusEnum.Approved ? "Đã phê duyệt" :
                    s === ContentStatusEnum.PendingApproval ? "Chờ phê duyệt" :
                      s === ContentStatusEnum.Draft ? "Bản nháp" :
                        s === ContentStatusEnum.Rejected ? "Từ chối" : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={adTypeFilter === "all" ? "all" : adTypeFilter.toString()} onValueChange={(v) => setAdTypeFilter(v === "all" ? "all" : parseInt(v))}>
            <SelectTrigger className="w-[180px] h-11 rounded-md border-border bg-card font-bold text-[10px] uppercase tracking-wider">
              <SelectValue placeholder="Định dạng" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border">
              <SelectItem value="all" className="font-medium text-xs italic">Mọi định dạng</SelectItem>
              <SelectItem value={AdTypeEnum.TextOnly.toString()} className="font-medium text-xs italic">Văn bản thuần túy</SelectItem>
              <SelectItem value={AdTypeEnum.ImageText.toString()} className="font-medium text-xs italic">Ảnh & Văn bản</SelectItem>
              <SelectItem value={AdTypeEnum.VideoText.toString()} className="font-medium text-xs italic">Video & Văn bản</SelectItem>
            </SelectContent>
          </Select>

          {(searchTerm || statusFilter !== "all" || adTypeFilter !== "all") && (
            <Button variant="ghost" size="icon" onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
              setAdTypeFilter("all")
            }}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Card className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        {contents.length > 0 ? (
          <CustomTable
            columns={createColumns(handleEditContent, handleViewContent, handleDeleteContent, handleSubmitContent, handleCloneContent, handleChangeStatus, brands, false, canUseTeamFeatures)}
            data={filteredContents}
            pageSize={10}
            className="border-none"
            headerClassName="bg-muted/50 border-b border-border/50 py-5 px-8 text-[11px] font-bold uppercase tracking-wider text-muted-foreground italic"
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-muted/5">
            <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-8 shadow-inner">
              <FileText className="size-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold mb-2 italic uppercase tracking-tight">
              {searchTerm ? "Truy vấn không kết quả" : "Thư viện đang trống"}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-10 italic font-medium leading-relaxed">
              {searchTerm ? "Chúng tôi không tìm thấy nội dung nào khớp với tiêu chuẩn của bạn." : "Hãy sáng tạo nội dung đầu tiên bằng sự hỗ trợ mạnh mẽ từ trí tuệ nhân tạo."}
            </p>
            {!searchTerm && (
              <Button onClick={() => window.location.href = `/dashboard/brands/${initialBrandId || 'all'}/contents/new`} className="rounded-md font-bold px-10 h-12 shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Khởi tạo nội dung AI
              </Button>
            )}
          </div>
        )}
      </Card>

      <Card className="p-8 bg-card border-border shadow-sm rounded-lg overflow-hidden relative group/compliance">
        <div className="flex flex-col sm:flex-row gap-6 items-start relative z-10">
          <div className="p-4 rounded-md bg-primary/5 border border-primary/10 shadow-sm transition-transform group-hover/compliance:rotate-6">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-lg uppercase italic tracking-tight">Quản trị nội dung & Tuân thủ</h4>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl italic font-medium">
              Tất cả tài sản nội dung đều phải thông qua quy trình phê duyệt nghiêm ngặt trước khi được phép xuất bản lên các kênh truyền thông chính thức. Đảm bảo quá trình kiểm duyệt luôn được thực hiện nghiêm túc để bảo vệ giá trị cốt lõi của thương hiệu trong mắt công chúng. Quá trình này được thiết kế để đảm bảo sự đồng bộ tuyệt đối về ngôn ngữ và hình ảnh trên toàn bộ hệ sinh thái của bạn.
            </p>
          </div>
        </div>
        <Sparkles className="absolute -bottom-10 -right-10 h-40 w-40 text-primary/5 rotate-12" />
      </Card>

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
