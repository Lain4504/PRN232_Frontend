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
import { Loader2 } from 'lucide-react';
import { getPermissionsForRole, getPermissionInfo } from '@/lib/constants/team-roles';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Shield, ChevronDown } from "lucide-react";

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
      <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30">
        <Avatar className="size-12 rounded-md border border-border bg-card">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
            {member.userEmail?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-bold text-foreground truncate">{member.userEmail}</p>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Tham gia: {new Date(member.joinedAt).toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-muted-foreground">Vai trò Cộng tác</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="h-10 rounded-md border-border bg-card px-4 focus:ring-0 shadow-sm font-medium text-foreground">
              <SelectValue placeholder="Chọn vai trò..." />
            </SelectTrigger>
            <SelectContent className="rounded-md border-border shadow-lg p-1">
              {['Copywriter', 'Designer', 'Marketer', 'TeamLeader', 'Vendor'].map(r => (
                <SelectItem key={r} value={r} className="rounded-sm h-10 font-medium text-sm focus:bg-accent">{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-muted-foreground">Trạng thái Nhân sự</Label>
          <div className="flex h-10 items-center justify-between gap-4 px-4 border border-border rounded-md bg-card shadow-sm hover:border-primary/50 transition-colors">
            <span className="text-sm font-medium text-foreground">{isActive ? 'Đang hoạt động' : 'Đã khóa'}</span>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-primary"
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
            className="h-8 px-2 text-xs font-semibold"
            onClick={() => setShowPermissions(!showPermissions)}
          >
            {showPermissions ? 'Ẩn bớt' : 'Xem chi tiết'}
          </Button>
        </div>

        <div
          onClick={() => setShowPermissions(!showPermissions)}
          className="flex items-center justify-between p-4 rounded-md border border-border bg-card cursor-pointer hover:bg-muted/50 shadow-sm transition-all"
        >
          <div className="flex items-center gap-3">
            <Shield className="size-4 text-primary" />
            <span className="text-xs font-bold text-foreground">Gán {permissions.length} quyền hạn cho {role}</span>
          </div>
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", showPermissions && "rotate-180")} />
        </div>

        {showPermissions && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <TooltipProvider>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-lg border border-border bg-muted/30 max-h-48 overflow-y-auto scrollbar-hide">
                {getPermissionsForRole(role).map((permission) => {
                  const info = getPermissionInfo(permission);
                  const isSelected = permissions.includes(permission);
                  return (
                    <Tooltip key={permission}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => togglePermission(permission)}
                          className={cn(
                            "flex items-center gap-3 p-2.5 rounded border transition-all cursor-pointer",
                            isSelected ? "border-primary bg-background shadow-sm" : "border-transparent bg-transparent hover:bg-accent"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => togglePermission(permission)}
                            className="size-4 rounded data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <span className="text-[11px] font-medium text-foreground truncate">
                            {info?.label || permission}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={5} className="rounded-md bg-foreground text-background border-none p-2 text-xs font-medium">
                        <p>{info?.description || permission}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
            <div className="flex gap-4 px-2">
              <button type="button" className="text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors" onClick={() => setPermissions(getPermissionsForRole(role).slice())}>Về mặc định</button>
              <button type="button" className="text-[11px] font-bold text-destructive hover:text-destructive/80 transition-colors" onClick={() => setPermissions([])}>Gỡ sạch quyền</button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-100 text-rose-500 text-xs">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={updating}
          className="h-10 px-6 rounded-md font-semibold text-sm"
        >
          Hủy bỏ
        </Button>
        <Button type="submit" disabled={updating || !role} className="h-10 px-6 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-sm transition-all border-none">
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
        <DrawerContent className="max-h-[95vh] flex flex-col rounded-t-lg border-none bg-popover shadow-2xl">
          <DrawerHeader className="text-left p-6 pb-2">
            <DrawerTitle className="text-xl font-bold text-foreground">Phân quyền nhân sự</DrawerTitle>
            <DrawerDescription className="text-sm font-medium text-muted-foreground mt-2 italic">Cập nhật vai trò và ma trận chức năng cho thành viên.</DrawerDescription>
          </DrawerHeader>
          <div className="p-6 overflow-y-auto flex-1 pb-10">
            <FormContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-lg border-border shadow-lg bg-popover">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground leading-none">Phân quyền nhân sự</DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground mt-2 italic">Điều chỉnh vai trò và ma trận thẩm quyền cho thành viên đội ngũ.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-8 pb-8 scrollbar-hide">
          <FormContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
