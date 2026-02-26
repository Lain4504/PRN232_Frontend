"use client"

import React, { useMemo, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useTeamsByVendor } from '@/hooks/use-teams'
import { useUser } from '@/hooks/use-user'
import { useProfile } from '@/lib/contexts/profile-context'
import { checkFeatureAccess } from '@/lib/utils/profile-utils'
import { TeamCreateDialog } from '@/components/pages/teams/TeamCreateDialog'
import { TeamDeleteDialog } from '@/components/pages/teams/TeamDeleteDialog'
import { EditTeamDialog } from '@/components/teams/edit-team-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CustomTable } from '@/components/ui/custom-table'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Eye, Users, Building2, Trash2, Edit, Plus, Search, Shield, AlertCircle, LayoutGrid } from 'lucide-react'
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown'
import { ColumnDef } from '@tanstack/react-table'
import type { TeamResponse } from '@/lib/types/omniadly-types'
import { Input } from "@/components/ui/input"


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
        <div className="flex items-center gap-4 py-3 group cursor-pointer transition-all">
          <div className="size-11 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10 shadow-sm group-hover:scale-105 transition-transform">
            <Building2 className="size-5" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-foreground text-[13px] truncate max-w-[250px] leading-tight italic uppercase tracking-tight">{row.getValue("name")}</div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-muted/30 text-muted-foreground/60 border-border text-[8px] font-bold uppercase tracking-widest px-1.5 py-0 rounded-md">ID: {row.original.id.substring(0, 8)}</Badge>
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
          <Badge variant="outline" className={cn("rounded-md px-2 py-0.5 font-bold uppercase tracking-wider text-[8px] border-border",
            status === 'Active' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/20' : 'bg-muted/50 text-muted-foreground'
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
          <div className="flex -space-x-2">
            {[...Array(Math.min(3, row.original.membersCount || 0))].map((_, i) => (
              <div key={i} className="size-7 rounded-full bg-muted border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground overflow-hidden">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            {(row.original.membersCount || 0) > 3 && (
              <div className="size-7 rounded-full bg-primary border border-border flex items-center justify-center text-[9px] font-bold text-primary-foreground shadow-sm">
                +{(row.original.membersCount || 0) - 3}
              </div>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 italic">
            {row.original.membersCount || 0} Thành viên
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Ngày tạo",
      cell: ({ row }) => (
        <div className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/40">
          {new Date(row.getValue("createdAt") as string).toLocaleDateString('vi-VN').replace(/\//g, ' • ')}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Thao tác</div>,
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
      <div className="h-12 w-64 bg-slate-50 dark:bg-slate-900 rounded-xl" />
      <div className="h-[600px] w-full bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800" />
    </div>
  )

  return (
    <div className="space-y-10 pb-20 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border/50 pb-10 transition-all duration-300">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-primary/5 text-primary border border-primary/10">
              <Users className="size-4" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest italic">Phối hợp & Cộng tác</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight italic uppercase">
            Quản lý Đội ngũ
          </h1>
          <p className="text-sm text-muted-foreground font-medium max-w-xl italic leading-relaxed">
            Thiết lập các nút cộng tác và phân quyền nhân sự cho các chiến dịch quy mô lớn đồng bộ.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex items-center gap-4 group cursor-pointer hover:bg-muted/10 transition-all">
            <div className="size-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-md">
              <LayoutGrid className="size-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">Đội ngũ pháp nhân</p>
              <p className="text-sm font-bold text-foreground uppercase tracking-tight italic">{rows.length} Đội nhóm</p>
            </div>
          </div>
          {checkFeatureAccess(profileType, 'teams') && (
            <Button
              onClick={() => setOpenCreate(true)}
              className="h-12 px-8 rounded-md font-bold uppercase tracking-wider text-xs shadow-lg transition-all hover:-translate-y-0.5"
            >
              <Plus className="mr-3 h-4 w-4" />
              Tạo đội mới
            </Button>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="relative flex-1 group w-full lg:max-w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="TRUY VẤN MẠNG LƯỚI ĐỘI NGŨ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-11 bg-card border-border rounded-md shadow-sm font-medium italic placeholder:text-muted-foreground/40"
          />
        </div>

        {!checkFeatureAccess(profileType, 'teams') && (
          <div className="flex items-center gap-3 px-6 h-11 bg-amber-500/5 rounded-md border border-amber-500/20 text-[10px] font-bold text-amber-600 uppercase tracking-widest transition-all">
            <Shield className="size-4" />
            Nâng cấp gói để quản trị quy mô lớn
          </div>
        )}
      </div>

      {/* Teams Content */}
      <div className="relative">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-destructive/5 rounded-lg border border-dashed border-destructive/20 transition-all">
            <AlertCircle className="size-16 text-destructive mb-6 opacity-30" />
            <h3 className="text-xl font-bold italic uppercase tracking-tight">Rơ-le hệ thống có lỗi</h3>
            <p className="text-muted-foreground font-medium max-w-sm mt-3 leading-relaxed italic">Không thể kết nối mạng lưới đội ngũ. Vui lòng thử lại sau.</p>
          </div>
        ) : !checkFeatureAccess(profileType, 'teams') ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-muted/5 rounded-lg border border-dashed border-border transition-all">
            <Shield className="size-16 text-muted-foreground/20 mb-8" />
            <h3 className="text-3xl font-bold italic uppercase tracking-tight mb-3 leading-none">Quyền truy cập hạn chế</h3>
            <p className="text-sm text-muted-foreground font-medium max-w-sm mx-auto mb-10 leading-relaxed italic border-l-4 border-primary/10 pl-6 text-left">Quản lý đội nhóm nâng cao yêu cầu cấp độ quyền hạn cao hơn. Hãy nâng cấp để thiết lập cấu trúc phòng ban chuyên nghiệp.</p>
            <Button variant="outline" className="h-10 px-8 rounded-md font-bold uppercase tracking-widest text-[10px] shadow-sm">Xem bảng giá</Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-6 text-center border border-dashed border-border rounded-lg bg-muted/10 transition-all duration-300">
            <div className="size-16 rounded-md bg-card flex items-center justify-center mb-8 shadow-inner border border-border">
              <Users className="size-8 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold italic mb-3 uppercase tracking-tight">
              {searchTerm ? "Không có kết quả truy vấn" : "Hệ thống đội nhóm trống"}
            </h3>
            <p className="text-sm text-muted-foreground font-medium max-w-sm mb-10 leading-relaxed italic">
              {searchTerm
                ? "Thử điều chỉnh từ khóa tìm kiếm của bạn để quét lại mạng lưới Node."
                : "Bắt đầu bằng cách tạo đội nhóm đầu tiên để tối ưu hóa quy trình cộng tác."}
            </p>
            {!searchTerm && (
              <Button
                onClick={() => setOpenCreate(true)}
                className="h-12 px-10 rounded-md font-bold uppercase tracking-wider text-xs shadow-lg transition-all hover:-translate-y-0.5"
              >
                <Plus className="mr-3 h-5 w-5" />
                Thiết lập đội nhóm Node
              </Button>
            )}
          </div>
        ) : (
          <Card className="rounded-lg border border-border bg-card shadow-sm overflow-hidden relative group transition-all duration-300">
            <CustomTable
              columns={columns}
              data={rows}
              pageSize={10}
              className="border-0 shadow-none bg-transparent"
              headerClassName="bg-muted/50 border-b border-border/50 py-6 px-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic"
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
    <div className="h-12 w-64 bg-slate-50 dark:bg-slate-900 rounded-xl" />
    <div className="h-[600px] w-full bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800" />
  </div>
)

export default function TeamsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TeamsPageContent />
    </Suspense>
  )
}
