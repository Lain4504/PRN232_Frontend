"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Search, User, FileText, Eye, Trash2, Plus, Zap, Filter } from "lucide-react"
import { ActionsDropdown, ActionItem } from "@/components/ui/actions-dropdown"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CustomTable } from "@/components/ui/custom-table"
import { ColumnDef } from "@tanstack/react-table"
import { useBrands } from "@/hooks/use-brands"
import {
  useApprovals,
  usePendingApprovals,
  useApproveApproval,
  useRejectApproval,
  useDeleteApprovalWithConfirm
} from "@/hooks/use-approvals"
import {
  ApprovalResponseDto,
  ContentStatusEnum,
  ApprovalFilters
} from "@/lib/types/omniadly-types"
import { ApprovalModal } from "@/components/approvals/approval-modal"
import { ChangeApproverDialog } from "@/components/approvals/change-approver-dialog"
import { toast } from "sonner"
import { useProfile } from "@/lib/contexts/profile-context"

import { ProfileTypeEnum } from "@/lib/utils/profile-utils"
import { cn } from "@/lib/utils"

interface SharedApprovalManagementProps {
  context: 'dashboard' | 'team'
  teamId?: string
  showCreateButton?: boolean
  title?: string
  description?: string
}

const createColumns = (
  handleReview: (approval: ApprovalResponseDto) => void,
  handleDelete: (approval: ApprovalResponseDto) => void,
  handleChangeApprover: (approval: ApprovalResponseDto) => void,
  isProcessing: boolean,
  canUseTeamFeatures: boolean
): ColumnDef<ApprovalResponseDto>[] => [
    {
      accessorKey: "contentTitle",
      header: "Tiêu đề nội dung",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-4 py-2 group/row">
            <div className="size-10 rounded-md bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10 shadow-sm group-hover/row:scale-105 transition-all">
              <FileText className="size-5" />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-foreground text-sm leading-tight truncate max-w-[300px] block italic">{row.getValue("contentTitle")}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-tighter italic">Mã số: {row.original.id.substring(0, 8)}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as ContentStatusEnum
        return (
          <Badge variant="outline" className={cn("text-[10px] font-bold px-3 py-0.5 rounded-md uppercase tracking-wider italic",
            status === ContentStatusEnum.Approved ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" :
              status === ContentStatusEnum.PendingApproval ? "border-amber-500/20 text-amber-500 bg-amber-500/5" :
                status === ContentStatusEnum.Rejected ? "border-destructive/20 text-destructive bg-destructive/5" :
                  "border-muted-foreground/20 text-muted-foreground bg-muted/5"
          )}>
            {status ? (status === ContentStatusEnum.Approved ? "Đã duyệt" : status === ContentStatusEnum.PendingApproval ? "Chờ duyệt" : status === ContentStatusEnum.Rejected ? "Đã từ chối" : status) : "Unknown"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "brandName",
      header: "Thương hiệu",
      cell: ({ row }) => {
        const brandName = row.getValue("brandName") as string
        return (
          <div className="text-sm font-bold text-foreground italic flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-primary/40" />
            {brandName || <span className="text-muted-foreground/20 italic">Chưa xác định</span>}
          </div>
        )
      },
    },
    {
      accessorKey: "approverEmail",
      header: "Người duyệt",
      cell: ({ row }) => {
        const approverEmail = row.getValue("approverEmail") as string
        return (
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-sm bg-muted/30 flex items-center justify-center border border-border/50 text-muted-foreground/40 italic">
              <User className="size-3.5" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/60 truncate max-w-[120px] uppercase tracking-tighter italic">{approverEmail || "Hệ thống tự động"}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string
        return (
          <div className="space-y-0.5 leading-none">
            <div className="text-xs font-bold text-foreground italic">{createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : "-"}</div>
            <div className="text-[10px] font-bold text-muted-foreground/30 italic uppercase tracking-tighter">{createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Thao tác</div>,
      cell: ({ row }) => {
        const approval = row.original

        const actions: ActionItem[] = [
          {
            label: "Xem xét & Phê duyệt",
            icon: <Eye className="size-4" />,
            onClick: () => handleReview(approval),
          },
        ]

        if (approval.status === ContentStatusEnum.PendingApproval && canUseTeamFeatures) {
          actions.push({
            label: "Thay đổi người duyệt",
            icon: <User className="size-4" />,
            onClick: () => handleChangeApprover(approval),
            disabled: isProcessing,
          })
        }

        actions.push({
          label: "Xóa yêu cầu",
          icon: <Trash2 className="size-4" />,
          onClick: () => handleDelete(approval),
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

export function SharedApprovalManagement({
  context,
  teamId,
  showCreateButton = true,
  title,
  description
}: SharedApprovalManagementProps) {

  const { profileType } = useProfile()
  const canUseTeamFeatures = profileType !== ProfileTypeEnum.Free

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ContentStatusEnum | "all">("all")
  const [selectedApproval, setSelectedApproval] = useState<ApprovalResponseDto | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [approvalToDelete, setApprovalToDelete] = useState<ApprovalResponseDto | null>(null)
  const [showChangeApproverDialog, setShowChangeApproverDialog] = useState(false)
  const [approvalToChange, setApprovalToChange] = useState<ApprovalResponseDto | null>(null)

  const filters: ApprovalFilters = {
    page: 1,
    pageSize: 50,
    searchTerm: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy: "createdAt",
    sortDescending: true,
  }

  useBrands()
  const { data: pendingApprovalsData } = usePendingApprovals(1, 50)
  const { data: approvalsData, isLoading } = useApprovals(filters)
  const approveApprovalMutation = useApproveApproval(selectedApproval?.id || "")
  const rejectApprovalMutation = useRejectApproval(selectedApproval?.id || "")
  const deleteApprovalMutation = useDeleteApprovalWithConfirm()

  const approvals = statusFilter === "all" ? approvalsData?.data || [] :
    statusFilter === ContentStatusEnum.PendingApproval ? pendingApprovalsData?.data || [] :
      approvalsData?.data || []

  const filteredApprovals = approvals.filter(approval => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return approval.contentTitle?.toLowerCase().includes(searchLower) ||
      approval.brandName?.toLowerCase().includes(searchLower) ||
      approval.approverEmail?.toLowerCase().includes(searchLower)
  })

  const handleApprove = async (notes: string) => {
    if (!selectedApproval) return
    try {
      await approveApprovalMutation.mutateAsync(notes)
      toast.success("Nội dung đã được phê duyệt")
    } catch {
      toast.error("Lỗi khi phê duyệt nội dung")
      setSelectedApproval(null)
    }
  }

  const handleReject = async (notes: string) => {
    if (!selectedApproval) return
    if (!notes.trim()) {
      toast.error("Vui lòng cung cấp lý do từ chối")
      return
    }
    try {
      await rejectApprovalMutation.mutateAsync(notes)
      setSelectedApproval(null)
      toast.success("Đã từ chối nội dung")
    } catch {
      toast.error("Lỗi khi từ chối")
    }
  }

  const handleDelete = (approval: ApprovalResponseDto) => {
    setApprovalToDelete(approval)
    setShowDeleteDialog(true)
  }

  const handleChangeApprover = (approval: ApprovalResponseDto) => {
    setApprovalToChange(approval)
    setShowChangeApproverDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!approvalToDelete) return
    try {
      await deleteApprovalMutation.mutateAsync(approvalToDelete.id)
      toast.success("Đã xóa yêu cầu phê duyệt")
      setShowDeleteDialog(false)
      setApprovalToDelete(null)
    } catch {
      toast.error("Lỗi khi xóa yêu cầu")
    }
  }

  const handleChangeApproverClose = () => {
    setShowChangeApproverDialog(false)
    setApprovalToChange(null)
  }

  if (isLoading) return (
    <div className="space-y-10 animate-pulse font-sans">
      <div className="h-10 w-64 bg-muted rounded-lg" />
      <div className="h-[500px] w-full bg-card rounded-lg border border-border" />
    </div>
  )

  return (
    <div className="space-y-12 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-10 transition-all duration-300">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/5 text-primary border border-primary/10">
              <CheckCircle className="size-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">Hệ thống phê duyệt • Approvals</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight italic uppercase">
            {title || "Quản lý Phê duyệt"}
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl italic leading-relaxed">
            {description || "Kiểm soát và phê duyệt các nội dung trước khi đăng tải lên các nền tảng mạng xã hội."}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-6 px-6 py-4 bg-card border border-border shadow-sm rounded-lg group transition-all hover:shadow-md">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest leading-none italic">Đang chờ xử lý</div>
              <div className="text-3xl font-bold tracking-tight text-foreground italic px-5">
                {approvals.filter(a => a.status === ContentStatusEnum.PendingApproval).length}
              </div>
            </div>
            <div className="h-10 w-px bg-border/50" />
            <div className="space-y-1 text-right">
              <div className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest leading-none italic">Tình trạng</div>
              <div className="text-3xl font-bold tracking-tight text-amber-500 italic flex items-center gap-2">
                <Zap className="size-5 animate-pulse" />
                DỢT
              </div>
            </div>
          </div>
          {showCreateButton && (
            <Button
              onClick={() => {
                if (context === 'team' && teamId) {
                  window.location.href = `/team/${teamId}/contents`
                } else {
                  window.location.href = '/dashboard/contents'
                }
              }}
              className="h-12 px-8 rounded-md font-bold text-xs uppercase tracking-wider shadow-lg transition-all hover:-translate-y-0.5"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo yêu cầu mới
            </Button>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 p-1.5 rounded-lg border border-border bg-card shadow-sm">
        <div className="relative flex-1 group w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Tìm kiếm yêu cầu phê duyệt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-11 bg-muted/10 border-border/50 rounded-md shadow-inner font-bold text-xs italic uppercase tracking-wider placeholder:text-muted-foreground/20 w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-muted/10 p-1.5 rounded-md border border-border/50 shadow-sm w-full lg:w-auto">
            <div className="size-8 rounded-sm bg-card flex items-center justify-center text-muted-foreground/40 border border-border/50">
              <Filter className="size-3.5" />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContentStatusEnum | "all")}>
              <SelectTrigger className="w-full lg:w-[180px] border-none focus:ring-0 font-bold uppercase text-[10px] tracking-widest h-8 bg-transparent text-foreground italic">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border shadow-lg p-1 bg-popover font-bold uppercase text-[10px] tracking-widest italic">
                <SelectItem value="all" className="rounded-sm">Toàn bộ trạng thái</SelectItem>
                <SelectItem value={ContentStatusEnum.PendingApproval} className="rounded-sm">Đang chờ duyệt</SelectItem>
                <SelectItem value={ContentStatusEnum.Approved} className="rounded-sm">Đã phê duyệt</SelectItem>
                <SelectItem value={ContentStatusEnum.Rejected} className="rounded-sm">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Badge variant="outline" className="hidden sm:flex h-11 px-6 rounded-md border-border/50 bg-muted/20 text-[10px] font-bold uppercase tracking-widest italic text-muted-foreground items-center gap-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            {filteredApprovals.length} Yêu cầu
          </Badge>
        </div>
      </div>

      {/* Table Section */}
      {filteredApprovals.length > 0 ? (
        <Card className="rounded-lg border border-border bg-card shadow-sm overflow-hidden relative group">
          <CustomTable
            columns={createColumns(
              setSelectedApproval,
              handleDelete,
              handleChangeApprover,
              approveApprovalMutation.isPending || rejectApprovalMutation.isPending,
              canUseTeamFeatures
            )}
            data={filteredApprovals}
            pageSize={10}
            className="border-0 shadow-none bg-transparent"
            headerClassName="bg-muted/30 border-b border-border/50 py-5 px-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-border rounded-lg bg-muted/5 group">
          <div className="size-20 rounded-full bg-card flex items-center justify-center mb-8 shadow-sm border border-border group-hover:scale-110 transition-transform duration-500">
            <CheckCircle className="size-10 text-muted-foreground/20" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-3 italic uppercase tracking-tight">Danh sách chờ trống</h3>
          <p className="text-sm font-medium text-muted-foreground/40 max-w-sm italic">
            {searchTerm || statusFilter !== "all"
              ? "Không có yêu cầu nào khớp với tìm kiếm của bạn."
              : "Tất cả các nội dung đã được xử lý xong."}
          </p>
        </div>
      )}

      {/* Modals & Dialogs */}
      <ApprovalModal
        approval={selectedApproval}
        onClose={() => setSelectedApproval(null)}
        onApprove={handleApprove}
        onReject={handleReject}
        onPublishComplete={() => {
          setSelectedApproval(null)
          toast.success("Nội dung đã được phân phối thành công")
        }}
        isProcessing={approveApprovalMutation.isPending || rejectApprovalMutation.isPending}
      />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-lg border border-border p-0 max-w-md shadow-lg bg-popover overflow-hidden">
          <DialogHeader className="p-8 pb-4 space-y-4">
            <DialogTitle className="text-xl font-bold tracking-tight text-left text-foreground">Xóa yêu cầu?</DialogTitle>
            <DialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed text-left mt-2">
              Hành động này sẽ loại bỏ hoàn toàn yêu cầu phê duyệt này khỏi hàng chờ hệ thống.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-8 pt-6 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="rounded-md h-10 font-semibold text-sm"
            >
              Hủy bỏ
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteApprovalMutation.isPending}
              className="h-10 font-semibold text-sm shadow-sm transition-all"
            >
              {deleteApprovalMutation.isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ChangeApproverDialog
        approval={approvalToChange}
        isOpen={showChangeApproverDialog}
        onClose={handleChangeApproverClose}
      />
    </div>
  )
}
