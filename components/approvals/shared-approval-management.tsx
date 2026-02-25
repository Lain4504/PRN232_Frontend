"use client"

import React, { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Search, User, FileText, Eye, Trash2, Plus, AlertTriangle, Zap, Filter, ChevronRight } from "lucide-react"
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
          <div className="flex items-center gap-4 py-2">
            <div className="size-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <FileText className="size-5" />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-foreground text-sm leading-tight truncate max-w-[300px] block">{row.getValue("contentTitle")}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-muted text-muted-foreground border-none text-[10px] font-semibold px-2 py-0.5 rounded-sm">ID: {row.original.id.substring(0, 8)}</Badge>
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
          <Badge variant="secondary" className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-sm border-none",
            status === ContentStatusEnum.Approved ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
              status === ContentStatusEnum.PendingApproval ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                status === ContentStatusEnum.Rejected ? "bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400" :
                  "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
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
          <div className="text-sm font-semibold text-foreground">
            {brandName ? (
              <span>{brandName}</span>
            ) : (
              <span className="text-muted-foreground/30 italic">N/A</span>
            )}
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
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-muted flex items-center justify-center border border-border">
              <User className="size-3 text-muted-foreground" />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground truncate max-w-[120px]">{approverEmail || "Chưa gán"}</span>
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
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-foreground">{createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : "-"}</div>
            <div className="text-[10px] font-medium text-muted-foreground">{createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right text-[11px] font-semibold text-muted-foreground">Thao tác</div>,
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-muted flex items-center justify-center text-muted-foreground">
              <CheckCircle className="size-3.5" />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground">Hệ thống kiểm soát chất lượng</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
            {title || "Hệ thống phê duyệt"}
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl leading-relaxed">
            {description || "Giám sát và phê duyệt các tài sản truyền thông trước khi phân phối lên các kênh social."}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2 px-4 rounded-md bg-card border border-border shadow-sm flex items-center gap-4">
            <div className="size-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-600">
              <Zap className="size-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold text-muted-foreground">Đang chờ xử lý</p>
              <p className="text-xs font-bold text-foreground">{approvals.filter(a => a.status === ContentStatusEnum.PendingApproval).length} Yêu cầu</p>
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
              className="h-10 px-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm transition-all"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo yêu cầu mới
            </Button>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 group w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          <Input
            placeholder="Tìm kiếm yêu cầu phê duyệt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-card border-border rounded-md shadow-sm focus-visible:ring-primary font-medium transition-all text-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <div className="flex items-center gap-2 bg-card p-1 rounded-md border border-border shadow-sm">
            <div className="size-7 rounded bg-muted flex items-center justify-center text-muted-foreground">
              <Filter className="size-3.5" />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContentStatusEnum | "all")}>
              <SelectTrigger className="w-[160px] border-none focus:ring-0 font-semibold text-xs h-7 bg-transparent text-foreground">
                <SelectValue placeholder="Bộ lọc" />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border shadow-lg p-1 bg-popover">
                <SelectItem value="all" className="rounded-sm font-semibold text-[11px]">Tất cả trạng thái</SelectItem>
                <SelectItem value={ContentStatusEnum.PendingApproval} className="rounded-sm font-semibold text-[11px]">Đang chờ duyệt</SelectItem>
                <SelectItem value={ContentStatusEnum.Approved} className="rounded-sm font-semibold text-[11px]">Đã phê duyệt</SelectItem>
                <SelectItem value={ContentStatusEnum.Rejected} className="rounded-sm font-semibold text-[11px]">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            Tổng số: {filteredApprovals.length} bản ghi
          </div>
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
            headerClassName="bg-muted/30 border-b border-border py-4 px-6 text-[11px] font-semibold text-muted-foreground"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center border border-dashed border-border rounded-lg bg-muted/30 transition-all duration-300">
          <div className="size-16 rounded-md bg-card flex items-center justify-center mb-6 shadow-sm border border-border">
            <CheckCircle className="size-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Hàng chờ đang trống
          </h3>
          <p className="text-muted-foreground font-medium max-w-sm mb-8 leading-relaxed text-sm italic">
            {searchTerm || statusFilter !== "all"
              ? "Không có yêu cầu nào khớp với tiêu chí tìm kiếm của bạn."
              : "Tất cả các nội dung đã được xử lý xong. Hệ thống đang ở trạng thái tối ưu."}
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
