"use client";

import React, { useState, useMemo } from "react";
import {
  useDeleteTeamMember,
  useTeamMembers,
} from '@/hooks/use-teams'
import { TeamMemberResponseDto } from '@/lib/types/omniadly-types'
import { toast } from 'sonner'
import {
  Trash2,
  User2,
  Search,
  Filter,
  UserCheck,
  Settings,
} from 'lucide-react'
import { ActionsDropdown, ActionItem } from '@/components/ui/actions-dropdown'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CustomTable } from '@/components/ui/custom-table'
import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface TeamMembersTableProps {
  teamId: string;
  canManage?: boolean;
  onInviteMember?: () => void;
  onEditMember?: (member: TeamMemberResponseDto) => void;
}

export function TeamMembersTable({
  teamId,
  canManage,
  onInviteMember,
  onEditMember,
}: TeamMembersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);

  const { data: members = [], isLoading } = useTeamMembers(teamId);
  const deleteMemberMutation = useDeleteTeamMember(teamId, deleteMemberId || "");

  const columns: ColumnDef<TeamMemberResponseDto>[] = [
    {
      accessorKey: "userEmail",
      header: "Thành viên",
      cell: ({ row }) => (
        <div className="flex items-center gap-4 py-3">
          <Avatar className="size-10 rounded-md border border-border bg-muted shadow-sm transition-transform">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
              {row.original.userEmail ? row.original.userEmail.charAt(0).toUpperCase() : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5">
            <div className="font-bold text-foreground text-sm leading-none">{row.original.userEmail || '(Không có email)'}</div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-muted text-muted-foreground border-none text-[10px] font-semibold px-2 py-0.5 rounded-sm">ID: {row.original.userId.slice(0, 8)}</Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Vai trò",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-primary text-primary-foreground border-none text-[10px] font-semibold px-3 py-1 rounded-full">
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
            <span className="text-[11px] font-medium text-muted-foreground">{permissions.length} Phân quyền</span>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className={cn("size-2 rounded-full", row.getValue("isActive") ? "bg-emerald-500" : "bg-muted")} />
          <span className={cn("text-[11px] font-medium", row.getValue("isActive") ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
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
          <span className="text-[11px] font-medium text-muted-foreground">
            {date ? new Date(date).toLocaleDateString('vi-VN').replace(/\//g, '.') : '-'}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right text-[11px] font-semibold text-muted-foreground">Thao tác</div>,
      cell: ({ row }) => {
        if (!canManage) return null;

        const actions: ActionItem[] = [
          {
            label: "Chỉnh sửa",
            icon: <Settings className="size-4" />,
            onClick: () => onEditMember?.(row.original),
          },
          {
            label: "Loại bỏ",
            icon: <Trash2 className="size-4" />,
            onClick: () => setDeleteMemberId(row.original.userId),
            variant: "destructive",
          },
        ];

        return (
          <div className="flex justify-end">
            <ActionsDropdown actions={actions} />
          </div>
        );
      },
    },
  ];

  const filteredData = useMemo(() => {
    return members.filter((member) =>
      member.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  const confirmDeleteMember = () => {
    if (!deleteMemberId) return;
    deleteMemberMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Đã xóa thành viên khỏi đội ngũ");
        setDeleteMemberId(null);
      },
      onError: (err: Error) => {
        toast.error(err.message || "Không thể xóa thành viên");
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Table Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 w-full items-center gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input
              placeholder="Truy vấn nhân sự theo email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-10 bg-card border-border rounded-md shadow-sm focus-visible:ring-primary font-medium transition-all text-foreground"
            />
          </div>
          <div className="flex items-center gap-2 bg-card p-1 rounded-md border border-border shadow-sm">
            <div className="size-8 rounded bg-muted flex items-center justify-center text-muted-foreground">
              <Filter className="size-3.5" />
            </div >
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[100px] border-none focus:ring-0 font-medium text-sm h-8 text-foreground bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-md border-border shadow-lg p-1 bg-popover">
                {[5, 10, 20, 50].map((size) => (
                  <SelectItem key={size} value={String(size)} className="rounded-sm font-medium text-xs">Top {size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {canManage && (
          <Button onClick={onInviteMember} className="h-10 px-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm transition-all">
            <UserCheck className="mr-2 h-4 w-4" />
            Mời nhân sự mới
          </Button>
        )}
      </div>

      {/* Table Area */}
      {filteredData.length > 0 ? (
        <CustomTable
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          pageSize={pageSize}
          className="rounded-lg border border-border overflow-hidden bg-card"
          headerClassName="bg-muted/50 border-b border-border py-4 px-6 text-[11px] font-semibold text-muted-foreground"
        />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-border rounded-lg bg-muted/30">
          <div className="size-16 rounded-md bg-card flex items-center justify-center mb-6 shadow-sm border border-border">
            <User2 className="size-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {searchTerm ? 'Không tìm thấy kết quả' : 'Danh sách trống'}
          </h3>
          <p className="text-muted-foreground font-medium max-w-sm mb-8 leading-relaxed text-sm italic">
            {searchTerm ? 'Thử điều chỉnh từ khóa tìm kiếm của bạn.' : 'Bắt đầu mời các thành viên đầu tiên gia nhập vào đội ngũ của bạn.'}
          </p>
        </div>
      )}

      <AlertDialog open={!!deleteMemberId} onOpenChange={() => setDeleteMemberId(null)}>
        <AlertDialogContent className="rounded-md border-border max-w-md shadow-lg bg-popover">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold tracking-tight text-foreground">Loại bỏ thành viên?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed mt-2">
              Xác nhận xóa tài khoản này khỏi cấu trúc đội ngũ. Họ sẽ mất quyền truy cập vào các tài sản chung ngay lập tức.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex items-center justify-end gap-3">
            <AlertDialogCancel className="rounded-md h-10 font-bold text-xs bg-muted border-none text-muted-foreground hover:bg-muted/80">Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md h-10 font-bold text-xs border-none shadow-sm"
              disabled={deleteMemberMutation.isPending}
            >
              {deleteMemberMutation.isPending ? "..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
