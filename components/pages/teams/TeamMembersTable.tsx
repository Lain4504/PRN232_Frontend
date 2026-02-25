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
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>
              {row.original.userEmail ? row.original.userEmail.charAt(0).toUpperCase() : "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-sm">{row.original.userEmail || '(Không có email)'}</div>
            <div className="text-xs text-muted-foreground">ID: {row.original.userId.slice(0, 8)}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Vai trò",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-normal">
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span>{permissions.length} Phân quyền</span>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", row.getValue("isActive") ? "bg-emerald-500" : "bg-muted")} />
          <span className="text-sm">
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
          <span className="text-sm text-muted-foreground">
            {date ? new Date(date).toLocaleDateString('vi-VN') : '-'}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Thao tác</div>,
      cell: ({ row }) => {
        if (!canManage) return null;

        const actions: ActionItem[] = [
          {
            label: "Chỉnh sửa",
            icon: <Settings className="h-4 w-4" />,
            onClick: () => onEditMember?.(row.original),
          },
          {
            label: "Loại bỏ",
            icon: <Trash2 className="h-4 w-4" />,
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
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 w-full items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm thành viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>Top {size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {canManage && (
          <Button onClick={onInviteMember}>
            <UserCheck className="mr-2 h-4 w-4" />
            Mời nhân sự
          </Button>
        )}
      </div>

      {/* Table Area */}
      {filteredData.length > 0 ? (
        <div className="rounded-md border">
          <CustomTable
            columns={columns}
            data={filteredData}
            isLoading={isLoading}
            pageSize={pageSize}
            className="border-none"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg">
          <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <User2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">
            {searchTerm ? 'Không tìm thấy kết quả' : 'Danh sách trống'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            {searchTerm ? 'Thử điều chỉnh từ khóa tìm kiếm của bạn.' : 'Bắt đầu mời các thành viên đầu tiên gia nhập vào đội ngũ của bạn.'}
          </p>
        </div>
      )}

      <AlertDialog open={!!deleteMemberId} onOpenChange={() => setDeleteMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Loại bỏ thành viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Xác nhận xóa tài khoản này khỏi cấu trúc đội ngũ. Họ sẽ mất quyền truy cập vào các tài sản chung ngay lập tức.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
