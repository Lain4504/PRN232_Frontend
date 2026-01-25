"use client"

import { useEffect, useState, useMemo } from 'react'
import {
  useDeleteTeamMember,
  useTeamMembers,
  useTeam
} from '@/hooks/use-teams'
import { TeamMemberResponseDto } from '@/lib/types/omniadly-types'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { CustomTable } from '@/components/ui/custom-table'
import { ColumnDef } from '@tanstack/react-table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Trash2, User2, Edit, Search, Users, Shield, Zap, Filter, MoreHorizontal, UserCheck, AlertTriangle } from 'lucide-react'
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Props {
  teamId: string
  canManage?: boolean
  paged?: boolean
  onEditMember?: (member: TeamMemberResponseDto) => void
  onInviteMember?: () => void
}

const createColumns = (
  handleEditMember: (member: TeamMemberResponseDto) => void,
  handleDeleteMember: (memberId: string) => void,
  canManage: boolean,
  isDeleting: boolean
): ColumnDef<TeamMemberResponseDto>[] => [
    {
      accessorKey: "userEmail",
      header: "Thành viên",
      cell: ({ row }) => (
        <div className="flex items-center gap-6 py-4">
          <Avatar className="size-14 rounded-2xl border border-slate-200 shadow-sm ring-4 ring-slate-50">
            <AvatarFallback className="bg-slate-900 text-white font-black text-xl">
              {row.original.userEmail ? row.original.userEmail.charAt(0).toUpperCase() : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="font-black text-slate-900 text-lg leading-none">{row.original.userEmail || '(Không có email)'}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg">ID: {row.original.userId.slice(0, 8)}</Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Vai trò",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-slate-900 text-white border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
          {row.getValue("role") || 'thành viên'}
        </Badge>
      ),
    },
    {
      accessorKey: "permissions",
      header: "Thẩm quyền",
      cell: ({ row }) => {
        const permissions = row.getValue("permissions") as string[] || [];
        return (
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{permissions.length} Phân quyền</span>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className={cn("size-2 rounded-full", row.getValue("isActive") ? "bg-emerald-500" : "bg-slate-300")} />
          <span className={cn("text-[9px] font-black uppercase tracking-widest", row.getValue("isActive") ? "text-emerald-600" : "text-slate-400")}>
            {row.getValue("isActive") ? 'Đang hoạt động' : 'Vô hiệu hóa'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "joinedAt",
      header: "Tham gia",
      cell: ({ row }) => {
        const date = row.getValue("joinedAt") as string;
        return (
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {date ? new Date(date).toLocaleDateString('vi-VN').replace(/\//g, '.') : '-'}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Thao tác</div>,
      cell: ({ row }) => {
        if (!canManage) return null;

        const actions: ActionItem[] = [
          {
            label: "Cập nhật phân quyền",
            icon: <Edit className="size-4" />,
            onClick: () => handleEditMember(row.original),
          },
          {
            label: "Xóa khỏi đội ngũ",
            icon: <Trash2 className="size-4" />,
            onClick: () => handleDeleteMember(row.original.id),
            variant: "destructive" as const,
            disabled: isDeleting,
          },
        ];

        return (
          <div className="flex justify-end">
            <ActionsDropdown actions={actions} disabled={isDeleting} />
          </div>
        )
      },
    },
  ];

export function TeamMembersTable({ teamId, canManage = true, onEditMember, onInviteMember }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);

  const listQuery = useTeamMembers(teamId)
  const deleteMemberMutation = useDeleteTeamMember(teamId, deleteMemberId || '');

  const isLoading = listQuery.isLoading
  const isError = listQuery.isError
  const data = listQuery.data || []

  const filteredMembers = useMemo(() => {
    return data.filter(member => {
      if (!searchTerm) return true;
      return member.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role?.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm]);

  const [pageSize, setPageSize] = useState(10);

  const handleDeleteMember = (memberId: string) => {
    setDeleteMemberId(memberId);
  };

  const confirmDeleteMember = async () => {
    if (!deleteMemberId) return;
    const memberToDelete = data.find(m => m.id === deleteMemberId);
    const memberEmail = memberToDelete?.userEmail || 'thành viên này';
    try {
      await deleteMemberMutation.mutateAsync();
      toast.success(`Đã xóa thành viên "${memberEmail}"`);
      setDeleteMemberId(null);
    } catch (error) {
      toast.error('Lỗi khi xóa thành viên');
    }
  };

  if (isLoading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-10 w-full bg-slate-50 rounded-xl" />
      <div className="h-64 w-full bg-slate-50 rounded-2xl border border-slate-100" />
    </div>
  )

  if (isError) return (
    <div className="flex items-center gap-4 p-6 rounded-[2rem] bg-rose-50 border border-rose-100 text-rose-500">
      <AlertTriangle className="size-6" />
      <div className="text-sm font-black uppercase tracking-widest">Không thể tải danh sách thành viên.</div>
    </div>
  )

  return (
    <div className="space-y-10">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
            <Input
              placeholder="Tìm kiếm thành viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-white border-slate-100 rounded-2xl shadow-sm focus-visible:ring-slate-100 font-medium transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
            <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
              <Filter className="size-3.5" />
            </div>
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[100px] border-none focus:ring-0 font-bold text-xs uppercase tracking-widest h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)} className="rounded-xl">Top {size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {canManage && (
          <Button onClick={onInviteMember} className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200 transition-all hover:-translate-y-1">
            <UserCheck className="mr-3 h-4 w-4" />
            Mời nhân sự mới
          </Button>
        )}
      </div>

      {/* Table Section */}
      {filteredMembers.length > 0 ? (
        <CustomTable
          columns={createColumns(
            onEditMember || (() => { }),
            handleDeleteMember,
            canManage,
            deleteMemberMutation.isPending
          )}
          data={filteredMembers}
          pageSize={pageSize}
          className="border-0 shadow-none bg-transparent"
          headerClassName="bg-slate-50/50 border-b border-slate-100 py-6 px-10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400"
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center border border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
          <div className="size-16 rounded-[2rem] bg-white flex items-center justify-center mb-6 shadow-sm border border-slate-100">
            <User2 className="size-8 text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-widest">
            {searchTerm ? 'Không tìm thấy kết quả' : 'Danh sách trống'}
          </h3>
          <p className="text-slate-500 font-medium max-w-sm mb-8 leading-relaxed text-xs italic">
            {searchTerm ? 'Thử điều chỉnh từ khóa tìm kiếm của bạn.' : 'Bắt đầu mời các thành viên đầu tiên gia nhập vào đội ngũ của bạn.'}
          </p>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteMemberId} onOpenChange={() => setDeleteMemberId(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-slate-100 p-10 max-w-md shadow-2xl">
          <AlertDialogHeader className="space-y-6">
            <div className="size-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
              <Trash2 className="size-10" />
            </div>
            <AlertDialogTitle className="text-3xl font-black tracking-tight text-center uppercase text-slate-900">Loại bỏ thành viên?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed text-center italic mt-2">
              Xác nhận xóa tài khoản này khỏi cấu trúc đội ngũ. Họ sẽ mất quyền truy cập vào các tài sản chung ngay lập tức.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-12 grid grid-cols-2 gap-4">
            <AlertDialogCancel className="rounded-xl h-12 font-black uppercase tracking-widest text-[10px] bg-slate-50 border-none">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMember}
              className="bg-rose-500 text-white hover:bg-rose-600 rounded-xl h-12 font-black uppercase tracking-widest text-[10px] border-none shadow-lg shadow-rose-100"
            >
              {deleteMemberMutation.isPending ? "..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
