"use client"

import React, { useMemo, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useTeamsByVendor } from '@/hooks/use-teams'
import { useUser } from '@/hooks/use-user'
import { useProfile } from '@/lib/contexts/profile-context'
import { checkFeatureAccess, ProfileTypeEnum } from '@/lib/utils/profile-utils'
import { TeamCreateDialog } from '@/components/pages/teams/TeamCreateDialog'
import { TeamDeleteDialog } from '@/components/pages/teams/TeamDeleteDialog'
import { EditTeamDialog } from '@/components/teams/edit-team-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CustomTable } from '@/components/ui/custom-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Eye, Users, Building2, Trash2, Edit, Plus, Search, Shield, AlertCircle, Filter, ChevronRight, LayoutGrid } from 'lucide-react'
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown'
import { ColumnDef } from '@tanstack/react-table'
import type { TeamResponse } from '@/lib/types/omniadly-types'
import { Input } from "@/components/ui/input"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"

import { cn } from "@/lib/utils"

function TeamsPageContent() {
  const { data: user, isLoading: userLoading } = useUser()
  const { activeProfileId, profileType, activeProfile } = useProfile()
  const router = useRouter()
  const { data, isLoading, isError } = useTeamsByVendor(activeProfileId || undefined)


  React.useEffect(() => {
    // If we have profile data, check if the user has management rights
    if (activeProfile) {
      const isManager = activeProfile.isOwner ||
        activeProfile.memberRole === 'Vendor' ||
        activeProfile.memberRole === 'TeamLeader';

      if (!isManager) {
        router.replace('/dashboard')
      }
    }
  }, [activeProfile, router])
  const [openCreate, setOpenCreate] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editDialog, setEditDialog] = useState<{ open: boolean; team: TeamResponse | null }>({
    open: false,
    team: null
  })
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; teamId: string; teamName: string }>({
    open: false,
    teamId: '',
    teamName: ''
  })

  const rows = useMemo(() => {
    if (!data) return []
    if (!searchTerm) return data
    return data.filter(team =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [data, searchTerm])

  const columns: ColumnDef<TeamResponse>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "Tên đội nhóm",
      cell: ({ row }) => (
        <div className="flex items-center gap-6 py-4">
          <div className="size-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
            <Building2 className="size-6" />
          </div>
          <div className="space-y-1">
            <div className="font-black text-slate-900 text-lg truncate max-w-[250px] leading-tight">{row.getValue("name")}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">ID: {row.original.id.substring(0, 8)}</Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge variant="secondary" className={cn("rounded-lg px-2.5 py-0.5 font-black uppercase tracking-widest text-[9px] border-none",
            status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
          )}>
            {status === 'Active' ? "Hoạt động" : "Chờ xử lý"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "membersCount",
      header: "Thành viên",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {[...Array(Math.min(3, row.original.membersCount || 0))].map((_, i) => (
              <div key={i} className="size-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            {(row.original.membersCount || 0) > 3 && (
              <div className="size-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] font-black text-white">
                +{(row.original.membersCount || 0) - 3}
              </div>
            )}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {row.original.membersCount || 0} Thành viên
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {new Date(row.getValue("createdAt")).toLocaleDateString('vi-VN').replace(/\//g, '.')}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thao tác</div>,
      cell: ({ row }) => {
        const actions: ActionItem[] = [
          {
            label: "Quản lý đội ngũ",
            icon: <Eye className="size-4" />,
            onClick: () => window.location.href = `/dashboard/teams/${row.original.id}`,
          },
          {
            label: "Cập nhật thông tin",
            icon: <Edit className="size-4" />,
            onClick: () => setEditDialog({ open: true, team: row.original }),
          },
          {
            label: "Giải tán đội",
            icon: <Trash2 className="size-4" />,
            onClick: () => setDeleteDialog({ open: true, teamId: row.original.id, teamName: row.original.name }),
            variant: "destructive" as const,
          },
        ]

        return (
          <div className="flex justify-end">
            <ActionsDropdown actions={actions} />
          </div>
        )
      },
    },
  ], [])

  if (isLoading || userLoading) return (
    <div className="space-y-12 animate-pulse">
      <div className="h-12 w-64 bg-slate-50 rounded-xl" />
      <div className="h-[600px] w-full bg-slate-50 rounded-3xl border border-slate-100" />
    </div>
  )

  return (
    <div className="space-y-12 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
              <Users className="size-4" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Phối hợp & Cộng tác</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-none">
            Quản lý đội ngũ
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
            Thiết lập các nút cộng tác và phân quyền nhân sự cho các chiến dịch quy mô lớn.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="size-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <LayoutGrid className="size-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Đội ngũ hiện có</p>
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{rows.length} Nhóm</p>
            </div>
          </div>
          {checkFeatureAccess(profileType, 'teams') && (
            <Button
              onClick={() => setOpenCreate(true)}
              className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1"
            >
              <Plus className="mr-3 h-4 w-4" />
              Tạo đội nhóm mới
            </Button>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 group w-full lg:max-w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
          <Input
            placeholder="TÌM KIẾM TÊN ĐỘI NHÓM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-white border-slate-100 rounded-2xl shadow-sm focus-visible:ring-slate-100 font-medium transition-all"
          />
        </div>

        {!checkFeatureAccess(profileType, 'teams') && (
          <div className="flex items-center gap-3 px-6 h-12 bg-amber-50 rounded-2xl border border-amber-100 text-[10px] font-black text-amber-600 uppercase tracking-widest">
            <Shield className="size-4" />
            Nâng cấp để mở khóa tính năng Team
          </div>
        )}
      </div>

      {/* Teams Content */}
      <div className="relative">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-rose-50/50 rounded-3xl border border-dashed border-rose-200">
            <AlertCircle className="size-16 text-rose-500 mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-widest text-slate-900">Lỗi hệ thống</h3>
            <p className="text-slate-500 font-medium max-w-sm mt-3">Không thể lấy dữ liệu đội nhóm. Vui lòng thử lại sau.</p>
          </div>
        ) : !checkFeatureAccess(profileType, 'teams') ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
            <Shield className="size-16 text-slate-300 mb-8" />
            <h3 className="text-3xl font-black uppercase tracking-tight mb-3 text-slate-900 leading-none">Quyền truy cập hạn chế</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed italic border-l-4 border-slate-100 pl-6">Quản lý đội nhóm nâng cao yêu cầu cấp độ quyền hạn cao hơn. Vui lòng nâng cấp gói dịch vụ để sử dụng tính năng này.</p>
            <Button variant="outline" className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 bg-white hover:bg-slate-50">Xem bảng giá</Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-6 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <div className="size-20 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm border border-slate-100">
              <Users className="size-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-widest">
              {searchTerm ? "Không có kết quả" : "Chưa có đội nhóm"}
            </h3>
            <p className="text-slate-500 font-medium max-w-sm mb-10 leading-relaxed uppercase tracking-tighter text-xs">
              {searchTerm
                ? "Thử điều chỉnh từ khóa tìm kiếm của bạn để quét lại mạng lưới."
                : "Bắt đầu bằng cách tạo đội nhóm đầu tiên để cộng tác."}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setOpenCreate(true)}
                className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1"
              >
                <Plus className="mr-3 h-5 w-5" />
                Thiết lập đội nhóm
              </Button>
            )}
          </div>
        ) : (
          <Card className="rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/40 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
              <Users className="size-40 text-slate-900" />
            </div>
            <CustomTable
              columns={columns}
              data={rows}
              pageSize={10}
              className="border-0 shadow-none bg-transparent"
              headerClassName="bg-slate-50/50 border-b border-slate-100 py-6 px-10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400"
            />
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <TeamCreateDialog open={openCreate} onOpenChange={setOpenCreate} vendorId={user?.id || ''} onCreated={() => window.location.reload()} />
      {editDialog.team && <EditTeamDialog open={editDialog.open} onOpenChange={(open) => setEditDialog(prev => ({ ...prev, open }))} team={editDialog.team} />}
      <TeamDeleteDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))} teamId={deleteDialog.teamId} teamName={deleteDialog.teamName} />
    </div>
  )
}

const PageSkeleton = () => (
  <div className="space-y-12 animate-pulse p-10 font-sans">
    <div className="h-12 w-64 bg-slate-50 rounded-xl" />
    <div className="h-[600px] w-full bg-slate-50 rounded-3xl border border-slate-100" />
  </div>
)

export default function TeamsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TeamsPageContent />
    </Suspense>
  )
}
