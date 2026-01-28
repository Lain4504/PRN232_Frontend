"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApprovalResponseDto } from "@/lib/types/omniadly-types";

interface DeleteApprovalDialogProps {
  approval: ApprovalResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (approvalId: string) => void;
  isDeleting?: boolean;
}

export function DeleteApprovalDialog({
  approval,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false
}: DeleteApprovalDialogProps) {
  if (!approval) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa yêu cầu phê duyệt</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa yêu cầu phê duyệt cho nội dung &ldquo;{approval.contentTitle}&rdquo;?
            Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(approval.id)}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Đang xóa..." : "Xác nhận xóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
