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
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Thay đổi người phê duyệt</DialogTitle>
          <DialogDescription>
            Chuyển yêu cầu phê duyệt này cho một thành viên khác.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="p-4 rounded-lg bg-slate-50/50 border space-y-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Nội dung</p>
            <p className="text-sm font-semibold truncate">{approval.contentTitle}</p>
            <div className="flex gap-4 pt-1">
              <div className="text-[11px]">
                <span className="text-slate-500">Người cũ: </span>
                <span className="font-medium">{approval.approverEmail}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-700">Chọn người phê duyệt mới</label>
            {isLoadingUsers ? (
              <div className="h-10 bg-slate-50 animate-pulse rounded border" />
            ) : availableUsers.length === 0 ? (
              <div className="p-4 rounded border border-dashed text-center">
                <p className="text-xs text-slate-500">Không tìm thấy thành viên phù hợp.</p>
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thành viên..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-6 rounded">
                          <AvatarFallback className="text-[9px]">
                            {(user.name || user.email).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{user.name || user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 border-t mt-0">
          <Button variant="outline" onClick={handleClose} disabled={changeApproverMutation.isPending}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedUserId || changeApproverMutation.isPending || isLoadingUsers}
          >
            {changeApproverMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Xác nhận thay đổi"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
