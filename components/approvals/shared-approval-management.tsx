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
          <div className="flex items-center gap-6 py-4">
            <div className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm group-hover:bg-slate-900 dark:group-hover:bg-primary group-hover:text-white transition-all">
              <FileText className="size-6" />
            </div>
            <div className="space-y-1">
              <span className="font-black text-slate-900 dark:text-white text-lg leading-tight truncate max-w-[300px] block uppercase">{row.getValue("contentTitle")}</span>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">ID: {row.original.id.substring(0, 8)}</Badge>
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
          <Badge variant="secondary" className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border-none",
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
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {brandName ? (
              <span className="hover:underline cursor-pointer">{brandName}</span>
            ) : (
              <span className="text-slate-300 dark:text-slate-700 italic">N/A</span>
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
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800">
              <User className="size-3.5 text-slate-400 dark:text-slate-500" />
            </div>
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter truncate max-w-[120px]">{approverEmail || "Chưa gán"}</span>
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
            <div className="text-[10px] font-black text-slate-900 dark:text-white">{createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : "-"}</div>
            <div className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</div>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Thao tác</div>,
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
    <div className="space-y-12 animate-pulse font-sans">
      <div className="h-12 w-64 bg-slate-50 dark:bg-slate-900 rounded-xl" />
      <div className="h-[600px] w-full bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800" />
    </div>
  )

  return (
    <div className="space-y-12 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 dark:border-slate-800 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <CheckCircle className="size-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Hệ thống kiểm soát chất lượng</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none uppercase">
            {title || "Hệ thống phê duyệt"}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
            {description || "Giám sát và phê duyệt các tài sản truyền thông trước khi phân phối lên các kênh social."}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Zap className="size-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Đang chờ xử lý</p>
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{approvals.filter(a => a.status === ContentStatusEnum.PendingApproval).length} Yêu cầu</p>
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
              className="h-14 px-8 rounded-2xl bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 dark:shadow-primary/20 transition-all hover:-translate-y-1"
            >
              <Plus className="mr-3 h-4 w-4" />
              Tạo yêu cầu mới
            </Button>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 group w-full lg:max-w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-600 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" />
          <input
            placeholder="TÌM KIẾM YÊU CẦU PHÊ DUYỆT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 h-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm focus-visible:ring-slate-100 dark:focus-visible:ring-slate-800 font-medium transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Filter className="size-3.5" />
            </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ContentStatusEnum | "all")}>
              <SelectTrigger className="w-[160px] border-none focus:ring-0 font-bold text-xs uppercase tracking-widest h-8 bg-transparent text-slate-900 dark:text-white">
                <SelectValue placeholder="Bộ lọc" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 shadow-2xl p-1 bg-white dark:bg-slate-900">
                <SelectItem value="all" className="rounded-xl font-bold uppercase text-[10px]">Tất cả trạng thái</SelectItem>
                <SelectItem value={ContentStatusEnum.PendingApproval} className="rounded-xl font-bold uppercase text-[10px]">Đang chờ duyệt</SelectItem>
                <SelectItem value={ContentStatusEnum.Approved} className="rounded-xl font-bold uppercase text-[10px]">Đã phê duyệt</SelectItem>
                <SelectItem value={ContentStatusEnum.Rejected} className="rounded-xl font-bold uppercase text-[10px]">Đã từ chối</SelectItem>
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
        <Card className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40 dark:shadow-black/40 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-10 opacity-5 dark:opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000 pointer-events-none">
            <CheckCircle className="size-40 text-slate-900 dark:text-primary" />
          </div>
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
            headerClassName="bg-slate-50/50 dark:bg-slate-800/10 border-b border-slate-100 dark:border-slate-800 py-6 px-10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500"
          />
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 transition-all duration-300">
          <div className="size-20 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center mb-8 shadow-sm border border-slate-100 dark:border-slate-800">
            <CheckCircle className="size-10 text-slate-200 dark:text-slate-700" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-widest">
            Hàng chờ đang trống
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mb-10 leading-relaxed uppercase tracking-tighter text-xs">
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
        <DialogContent className="rounded-[2rem] border border-slate-100 dark:border-slate-800 p-0 max-w-md shadow-2xl bg-white dark:bg-slate-900 overflow-hidden">
          <DialogHeader className="p-10 pb-4 space-y-6">
            <div className="size-20 rounded-[2rem] bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-500/20 shadow-sm">
              <AlertTriangle className="size-10" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight text-center uppercase text-slate-900 dark:text-white">Xóa yêu cầu?</DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-400 dark:text-slate-500 leading-relaxed text-center uppercase tracking-widest mt-2 italic">
              Hành động này sẽ loại bỏ hoàn toàn yêu cầu phê duyệt này khỏi hàng chờ hệ thống.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="p-10 pt-6 grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="rounded-xl h-12 font-black uppercase tracking-widest text-[10px] bg-slate-50 dark:bg-slate-800 border-none text-slate-400 dark:text-slate-500"
            >
              Hủy bỏ lệnh
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteApprovalMutation.isPending}
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-12 font-black uppercase tracking-widest text-[10px] border-none shadow-lg shadow-rose-100 dark:shadow-rose-900/20 transition-all active:scale-95"
            >
              {deleteApprovalMutation.isPending ? "..." : "Xác nhận xóa"}
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
