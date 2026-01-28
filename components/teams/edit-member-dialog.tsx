"use client";

import { useState, useEffect } from 'react';
import { useUpdateTeamMember } from '@/hooks/use-teams';
import { TeamMemberResponseDto } from '@/lib/types/omniadly-types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertCircle, Loader2, ChevronRight, Key } from 'lucide-react';
import { getPermissionsForRole, getPermissionInfo } from '@/lib/constants/team-roles';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Landmark, Fingerprint, Settings, CheckCircle2, X, Shield, ChevronDown } from "lucide-react";

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  member: TeamMemberResponseDto | null;
}

export function EditMemberDialog({ open, onOpenChange, teamId, member }: EditMemberDialogProps) {
  const [role, setRole] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [showPermissions, setShowPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: updateMember, isPending: updating } = useUpdateTeamMember(teamId, member?.id || '');

  useEffect(() => {
    if (member) {
      setRole(member.role || '');
      setPermissions(member.permissions || []);
      setIsActive(member.isActive);
      setError(null);
    }
  }, [member]);

  useEffect(() => {
    if (role && member && role !== member.role) {
      const rolePermissions = getPermissionsForRole(role);
      setPermissions(rolePermissions);
    }
  }, [role, member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!member) {
      setError('Không tìm thấy nhân sự');
      return;
    }

    try {
      await updateMember({
        role,
        permissions,
        isActive
      });
      onOpenChange(false);
      toast.success('Đã cập nhật quyền hạn nhân sự');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi';
      setError('Lỗi: ' + message);
    }
  };

  const togglePermission = (permission: string) => {
    if (permissions.includes(permission)) {
      setPermissions(permissions.filter(p => p !== permission));
    } else {
      setPermissions([...permissions, permission]);
    }
  };

  const isMobile = useIsMobile();
  if (!member) return null;

  const FormContent = ({ className }: { className?: string }) => (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      <div className="flex items-center gap-4 p-4 rounded-lg border bg-slate-50/50">
        <Avatar className="size-12 rounded-md border bg-white">
          <AvatarFallback className="bg-slate-900 text-white text-lg">
            {member.userEmail?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-bold text-slate-900 truncate">{member.userEmail}</p>
          <p className="text-[10px] text-slate-500">Tham gia: {new Date(member.joinedAt).toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Vai trò</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn vai trò..." />
            </SelectTrigger>
            <SelectContent>
              {['Copywriter', 'Designer', 'Marketer', 'TeamLeader', 'Vendor'].map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <div className="flex h-10 items-center justify-between gap-4 px-3 border rounded-md bg-white">
            <span className="text-sm">{isActive ? 'Đang hoạt động' : 'Đã khóa'}</span>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Danh sách quyền hạn</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-[10px] font-bold"
            onClick={() => setShowPermissions(!showPermissions)}
          >
            {showPermissions ? 'Ẩn bớt' : 'Xem chi tiết'}
          </Button>
        </div>

        <div
          onClick={() => setShowPermissions(!showPermissions)}
          className="flex items-center justify-between p-3 rounded-md border bg-white cursor-pointer hover:bg-slate-50"
        >
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-slate-400" />
            <span className="text-xs font-semibold">Gán {permissions.length} quyền cho {role}</span>
          </div>
          <ChevronDown className={cn("size-4 text-slate-400 transition-transform", showPermissions && "rotate-180")} />
        </div>

        {showPermissions && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <TooltipProvider>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-md border bg-slate-50/50 max-h-48 overflow-y-auto">
                {getPermissionsForRole(role).map((permission) => {
                  const info = getPermissionInfo(permission);
                  const isSelected = permissions.includes(permission);
                  return (
                    <Tooltip key={permission}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => togglePermission(permission)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded border bg-white cursor-pointer hover:border-slate-400",
                            isSelected && "border-slate-900 bg-slate-50"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => togglePermission(permission)}
                          />
                          <span className="text-xs truncate">
                            {info?.label || permission}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{info?.description || permission}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
            <div className="flex gap-4">
              <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-slate-900" onClick={() => setPermissions(getPermissionsForRole(role).slice())}>Về mặc định</button>
              <button type="button" className="text-[10px] font-bold text-rose-400 hover:text-rose-600" onClick={() => setPermissions([])}>Gỡ sạch quyền</button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-100 text-rose-500 text-xs">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={updating}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={updating || !role}>
          {updating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            "Cập nhật quyền"
          )}
        </Button>
      </div>
    </form>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[95vh] flex flex-col">
          <DrawerHeader className="text-left border-b">
            <DrawerTitle>Phân quyền nhân sự</DrawerTitle>
            <DrawerDescription>Cập nhật vai trò và chức năng cho thành viên.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 overflow-y-auto flex-1">
            <FormContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Phân quyền nhân sự</DialogTitle>
          <DialogDescription>Điều chỉnh vai trò và ma trận quyền hạn cho thành viên đội ngũ.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 p-6 scrollbar-hide">
          <FormContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
