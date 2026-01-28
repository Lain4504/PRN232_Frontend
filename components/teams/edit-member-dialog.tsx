"use client";

import { useState, useEffect } from 'react';
import { useUpdateTeamMember } from '@/hooks/use-teams';
import { TeamMemberResponseDto } from '@/lib/types/omniadly-types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { AlertCircle, User, Settings, CheckCircle2, X, Shield, Key, ChevronRight, Fingerprint } from 'lucide-react';
import { getPermissionsForRole, getPermissionInfo } from '@/lib/constants/team-roles';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

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
      setError('Không có nhân sự nào được chọn');
      return;
    }

    try {
      await updateMember({
        role,
        permissions,
        isActive
      });
      onOpenChange(false);
      toast.success('Đã cập nhật cấu hình nhân sự!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi';
      setError('Không thể cập nhật: ' + message);
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
    <form onSubmit={handleSubmit} className={cn("space-y-10", className)}>
      {/* Member Profile Card */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12 group-hover:rotate-0 transition-transform">
          <Fingerprint className="size-20 text-slate-900" />
        </div>
        <Avatar className="size-16 rounded-2xl border border-white shadow-sm ring-4 ring-slate-100 flex-shrink-0 relative z-10">
          <AvatarFallback className="bg-slate-900 text-white font-black text-2xl uppercase">
            {member.userEmail?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1 relative z-10 min-w-0">
          <p className="font-black text-slate-900 text-lg uppercase tracking-tight truncate">{member.userEmail}</p>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded-lg border border-slate-100">Joined: {new Date(member.joinedAt).toLocaleDateString('vi-VN').replace(/\//g, '.')}</span>
          </div>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vai trò Chiến lược</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 focus:ring-0 shadow-sm font-black text-slate-900 uppercase tracking-tight focus:border-slate-900 transition-all">
              <SelectValue placeholder="Chọn vai trò..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1">
              {['Copywriter', 'Designer', 'Marketer', 'TeamLeader', 'Vendor'].map(r => (
                <SelectItem key={r} value={r} className="rounded-xl h-11 uppercase font-black text-[10px] tracking-widest focus:bg-slate-50">{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trạng thái Truy cập</Label>
          <div className="h-14 rounded-2xl border-2 border-slate-100 bg-slate-50 px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className={cn("size-2 rounded-full", isActive ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{isActive ? 'ĐANG HOẠT ĐỘNG' : 'VÔ HIỆU HÓA'}</span>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Permissions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ma trận Phân quyền</Label>
          <button
            type="button"
            className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            onClick={() => setShowPermissions(!showPermissions)}
          >
            {showPermissions ? 'Ẩn chi tiết' : 'Xem chi tiết'}
          </button>
        </div>

        <div
          onClick={() => setShowPermissions(!showPermissions)}
          className="h-14 bg-white rounded-2xl border-2 border-slate-100 px-6 flex items-center justify-between hover:border-slate-900 transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Key className="size-4 text-slate-400" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-tight">Đã gán {permissions.length} đặc quyền cho nhóm {role}</span>
          </div>
          <ChevronRight className={cn("size-4 text-slate-300 transition-transform", showPermissions && "rotate-90")} />
        </div>

        {showPermissions && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <TooltipProvider>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-6 rounded-2xl border-2 border-slate-100 bg-slate-50/50 max-h-64 overflow-y-auto scrollbar-hide">
                {getPermissionsForRole(role).map((permission) => {
                  const info = getPermissionInfo(permission);
                  const isSelected = permissions.includes(permission);
                  return (
                    <Tooltip key={permission}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => togglePermission(permission)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                            isSelected ? "bg-white border-slate-900 shadow-sm" : "bg-transparent border-transparent hover:bg-slate-100"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => togglePermission(permission)}
                            className="size-4 rounded border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                          />
                          <span className="text-[10px] font-black uppercase tracking-tight text-slate-900 truncate">
                            {info?.label || permission}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-xl bg-slate-900 text-white border-none p-4 text-[11px] font-medium max-w-xs shadow-2xl">
                        <p className="leading-relaxed italic">{info?.description || permission}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
            <div className="mt-4 flex gap-6 px-4">
              <button type="button" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors" onClick={() => setPermissions(getPermissionsForRole(role).slice())}>Về mặc định</button>
              <button type="button" className="text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-600 transition-colors" onClick={() => setPermissions([])}>Gỡ sạch quyền</button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500">
          <AlertCircle className="size-5 shrink-0" />
          <div className="text-[10px] font-black uppercase tracking-widest leading-relaxed">{error}</div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="h-14 rounded-2xl border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 font-black uppercase tracking-widest text-[10px] order-2 sm:order-1 flex-1 sm:flex-none sm:px-10"
        >
          Hủy bỏ
        </Button>
        <Button type="submit" disabled={updating || !role} className="h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 transition-all hover:-translate-y-1 order-1 sm:order-2 flex-1 sm:flex-none sm:px-10">
          {updating ? (
            <>
              <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Đang lưu...
            </>
          ) : (
            <>
              Xác nhận Điều chỉnh <ChevronRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] flex flex-col rounded-t-[3rem] border-none shadow-2xl bg-white">
          <DrawerHeader className="flex-shrink-0 text-left p-6 pb-2">
            <div className="size-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-6 border border-slate-200">
              <Settings className="size-6" />
            </div>
            <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">Điều chỉnh Quyền hạn</DrawerTitle>
            <DrawerDescription className="text-sm font-medium text-slate-400 mt-2 italic">Cập nhật vai trò và ma trận thẩm quyền cho nhân sự.</DrawerDescription>
          </DrawerHeader>
          <div className="px-6 overflow-y-auto flex-1 pb-6">
            <FormContent />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-3xl border-none p-0 shadow-2xl bg-white font-sans">
        <DialogHeader className="flex-shrink-0 p-8 pb-4">
          <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-8 border border-slate-200 shadow-sm">
            <Settings className="size-8" />
          </div>
          <DialogTitle className="text-4xl font-black uppercase tracking-tight text-slate-900 leading-none">Điều chỉnh Quyền hạn</DialogTitle>
          <DialogDescription className="text-base font-medium text-slate-500 mt-2 italic whitespace-normal">Hiệu chỉnh cấu hình nhân sự và quản trị ma trận phân quyền trong Đội ngũ.</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-8 pb-8 scrollbar-hide">
          <FormContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
