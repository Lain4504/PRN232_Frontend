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
import { Loader2, UserPlus, ShieldAlert } from "lucide-react";
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
      toast.success("Đã thay đổi người phê duyệt");
      onClose();
      setSelectedUserId("");
    } catch (error) {
      toast.error("Lỗi khi thay đổi người phê duyệt");
    }
  };

  const handleClose = () => {
    setSelectedUserId("");
    onClose();
  };

  if (!approval) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-slate-900 border-none rounded-[2rem] shadow-2xl">
        <DialogHeader className="p-8 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Điều chuyển nhiệm vụ</DialogTitle>
          <DialogDescription className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">
            Thay đổi người giám sát cho yêu cầu phê duyệt này.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-8">
          <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 space-y-3">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">Dữ liệu nội dung</p>
            <p className="text-base font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{approval.contentTitle}</p>
            <div className="flex gap-4 pt-2">
              <div className="text-[11px] font-bold">
                <span className="text-slate-400 dark:text-slate-500 uppercase tracking-widest mr-2">Hiện tại:</span>
                <span className="text-slate-900 dark:text-white">{approval.approverEmail}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Chọn người kế nhiệm</label>
            {isLoadingUsers ? (
              <div className="h-14 bg-slate-50 dark:bg-slate-800/50 animate-pulse rounded-2xl border border-slate-100 dark:border-slate-800" />
            ) : availableUsers.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center bg-slate-50/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 leading-relaxed">Không tìm thấy thành viên chiến lược khả dụng.</p>
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 px-6 font-bold text-slate-900 dark:text-white shadow-sm">
                  <SelectValue placeholder="Chọn người nhận nhiệm vụ..." />
                </SelectTrigger>
                <SelectContent className="rounded-[2rem] border-slate-100 dark:border-slate-800 p-2 shadow-2xl bg-white dark:bg-slate-900">
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id} className="rounded-2xl p-4 focus:bg-slate-50 dark:focus:bg-slate-800">
                      <div className="flex items-center gap-4">
                        <Avatar className="size-10 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                          <AvatarFallback className="text-[10px] font-black bg-slate-900 dark:bg-primary text-white">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{user.name || user.email.split('@')[0]}</span>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{user.email}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 grid grid-cols-2 gap-4 border-none">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={changeApproverMutation.isPending}
            className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-slate-50 dark:bg-slate-800 border-none text-slate-400 dark:text-slate-500"
          >
            Hủy tác vụ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedUserId || changeApproverMutation.isPending || isLoadingUsers}
            className="h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-slate-900 dark:bg-primary hover:bg-slate-800 dark:hover:bg-primary/90 text-white shadow-2xl shadow-slate-200 dark:shadow-primary/20 transition-all active:scale-95"
          >
            {changeApproverMutation.isPending ? (
              <>
                <Loader2 className="mr-3 size-5 animate-spin" />
                Đang truyền lệnh...
              </>
            ) : (
              "Xác nhận bàn giao"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
