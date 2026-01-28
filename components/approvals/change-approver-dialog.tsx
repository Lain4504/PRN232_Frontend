"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Loader2, UserPlus, ShieldAlert, ChevronRight, X } from "lucide-react";
import { ApprovalResponseDto } from "@/lib/types/omniadly-types";
import { useChangeApprover, useAvailableApprovers } from "@/hooks/use-approvals";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChangeApproverDialogProps {
  approval: ApprovalResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChangeApproverDialog({
  approval,
  isOpen,
  onClose
}: ChangeApproverDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const changeApproverMutation = useChangeApprover(approval?.id || "");
  const { data: availableUsers = [], isLoading: isLoadingUsers } = useAvailableApprovers(approval?.brandId);

  const handleSubmit = async () => {
    if (!approval || !selectedUserId) return;
    try {
      await changeApproverMutation.mutateAsync(selectedUserId);
      toast.success("Đã thay đổi người phê duyệt thành công");
      onClose();
      setSelectedUserId("");
    } catch (error) {
      toast.error("Lỗi khi thay đổi quyền kiểm soát");
    }
  };

  const handleClose = () => {
    setSelectedUserId("");
    onClose();
  };

  if (!approval) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-none p-0 shadow-2xl overflow-hidden bg-white">
        <DialogHeader className="p-10 pb-0">
          <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-6 border border-amber-100 shadow-sm">
            <UserPlus className="size-6" />
          </div>
          <DialogTitle className="text-3xl font-black uppercase tracking-tight text-slate-900 leading-none">Chỉ định Lại</DialogTitle>
          <DialogDescription className="text-base font-medium text-slate-500 mt-2 italic">
            Chuyển giao quyền kiểm soát phê duyệt nội dung cho một nhân sự khác trong mạng lưới.
          </DialogDescription>
        </DialogHeader>

        <div className="p-10 space-y-10">
          {/* Context Info */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] -rotate-12 group-hover:rotate-0 transition-transform">
              <ShieldAlert className="size-16 text-slate-900" />
            </div>
            <div className="space-y-1 relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nội dung yêu cầu</p>
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{approval.contentTitle}</p>
            </div>
            <div className="flex items-center gap-6 pt-2 relative z-10">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Thương hiệu</p>
                <p className="text-[10px] font-black text-slate-700 uppercase">{approval.brandName}</p>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Người duyệt hiện tại</p>
                <p className="text-[10px] font-black text-slate-700 uppercase truncate max-w-[120px]">{approval.approverEmail}</p>
              </div>
            </div>
          </div>

          {/* User selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Chọn người phê duyệt mới</label>
            {isLoadingUsers ? (
              <div className="h-14 bg-slate-50 animate-pulse rounded-2xl border border-slate-100" />
            ) : availableUsers.length === 0 ? (
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-100 text-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-tighter">Không tìm thấy nhân sự phù hợp cho Brand này.</p>
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-white px-6 focus:ring-0 shadow-sm font-black text-slate-900 uppercase tracking-tight border-2 focus:border-slate-900 transition-all">
                  <SelectValue placeholder="Tìm kiếm & Chọn nhân sự..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl p-1 max-h-[300px]">
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="rounded-xl h-14 focus:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <Avatar className="size-8 rounded-lg border border-slate-200">
                          <AvatarFallback className="bg-slate-900 text-white font-black text-[10px]">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate w-[240px]">{user.name || user.email}</span>
                          {user.name && (
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{user.email}</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter className="p-10 pt-0 grid grid-cols-2 gap-4">
          <Button variant="outline" onClick={handleClose} disabled={changeApproverMutation.isPending} className="h-12 rounded-xl border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 font-black uppercase tracking-widest text-[9px]">
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedUserId || changeApproverMutation.isPending || isLoadingUsers}
            className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[9px] shadow-xl shadow-slate-100 transition-all hover:-translate-y-1"
          >
            {changeApproverMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-3 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                Xác nhận chuyển giao <ChevronRight className="ml-2 size-3" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
